const { Router } = require('express');
const pool = require('../db');

const router = Router();

// T03 + T04 HU02 / T03 + T04 HU05:
// GET /api/restaurants?page=&size=&lat=&lng=&radius=&amenities[]=wifi&amenities[]=terraza
router.get('/', async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const size   = Math.min(200, Math.max(1, parseInt(req.query.size) || 20));
  const offset = (page - 1) * size;

  // Geo filter (HU02)
  const lat    = parseFloat(req.query.lat);
  const lng    = parseFloat(req.query.lng);
  const radius = Math.min(50, Math.max(0.1, parseFloat(req.query.radius) || 5));
  const hasGeo = !isNaN(lat) && !isNaN(lng);

  // Amenities filter (HU05) — acepta ?amenities[]=wifi&amenities[]=terraza o ?amenities=wifi,terraza
  let rawAmen = req.query['amenities[]'] ?? req.query.amenities ?? [];
  if (typeof rawAmen === 'string') rawAmen = rawAmen.split(',').map(s => s.trim());
  const amenities    = rawAmen.filter(Boolean);
  const hasAmenities = amenities.length > 0;

  // Haversine reutilizable (parámetros posicionales varían según el caso)
  const hv = (latP, lngP) => `
    6371 * acos(LEAST(1.0,
      cos(radians($${latP})) * cos(radians(r.latitud)) *
      cos(radians(r.longitud) - radians($${lngP})) +
      sin(radians($${latP})) * sin(radians(r.latitud))
    ))`;

  try {
    let dataResult, countResult;

    if (!hasGeo && !hasAmenities) {
      // ── Caso base: sin filtros ──────────────────────────────────────
      [dataResult, countResult] = await Promise.all([
        pool.query(
          `SELECT id, nombre, tipo_comida, categoria, descripcion,
                  direccion, ciudad, imagen_url, calificacion
           FROM restaurantes
           ORDER BY calificacion DESC, nombre ASC
           LIMIT $1 OFFSET $2`,
          [size, offset]
        ),
        pool.query('SELECT COUNT(*)::int AS total FROM restaurantes'),
      ]);

    } else if (hasGeo && !hasAmenities) {
      // ── Geo sin amenidades ─────────────────────────────────────────
      const h    = hv(1, 2);
      const geoW = `r.latitud IS NOT NULL AND r.longitud IS NOT NULL AND (${h}) <= $3`;
      [dataResult, countResult] = await Promise.all([
        pool.query(
          `SELECT r.id, r.nombre, r.tipo_comida, r.categoria, r.descripcion,
                  r.direccion, r.ciudad, r.imagen_url, r.calificacion,
                  ROUND((${h})::numeric, 1) AS distancia_km
           FROM restaurantes r
           WHERE ${geoW}
           ORDER BY distancia_km ASC, r.calificacion DESC
           LIMIT $4 OFFSET $5`,
          [lat, lng, radius, size, offset]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS total FROM restaurantes r WHERE ${geoW}`,
          [lat, lng, radius]
        ),
      ]);

    } else if (!hasGeo && hasAmenities) {
      // ── Amenidades sin geo ─────────────────────────────────────────
      const amenJoin = `
        JOIN restaurante_amenidades ra ON r.id = ra.restaurante_id
        JOIN amenidades a ON ra.amenidad_id = a.id`;
      [dataResult, countResult] = await Promise.all([
        pool.query(
          `SELECT r.id, r.nombre, r.tipo_comida, r.categoria, r.descripcion,
                  r.direccion, r.ciudad, r.imagen_url, r.calificacion
           FROM restaurantes r ${amenJoin}
           WHERE a.slug = ANY($1)
           GROUP BY r.id
           HAVING COUNT(DISTINCT a.id) = $2
           ORDER BY r.calificacion DESC, r.nombre ASC
           LIMIT $3 OFFSET $4`,
          [amenities, amenities.length, size, offset]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS total FROM (
             SELECT r.id FROM restaurantes r ${amenJoin}
             WHERE a.slug = ANY($1)
             GROUP BY r.id
             HAVING COUNT(DISTINCT a.id) = $2
           ) sub`,
          [amenities, amenities.length]
        ),
      ]);

    } else {
      // ── Geo + Amenidades ───────────────────────────────────────────
      const h    = hv(1, 2);
      const geoW = `r.latitud IS NOT NULL AND r.longitud IS NOT NULL AND (${h}) <= $3`;
      const amenJoin = `
        JOIN restaurante_amenidades ra ON r.id = ra.restaurante_id
        JOIN amenidades a ON ra.amenidad_id = a.id`;
      [dataResult, countResult] = await Promise.all([
        pool.query(
          `SELECT r.id, r.nombre, r.tipo_comida, r.categoria, r.descripcion,
                  r.direccion, r.ciudad, r.imagen_url, r.calificacion,
                  ROUND((${h})::numeric, 1) AS distancia_km
           FROM restaurantes r ${amenJoin}
           WHERE ${geoW} AND a.slug = ANY($4)
           GROUP BY r.id
           HAVING COUNT(DISTINCT a.id) = $5
           ORDER BY distancia_km ASC, r.calificacion DESC
           LIMIT $6 OFFSET $7`,
          [lat, lng, radius, amenities, amenities.length, size, offset]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS total FROM (
             SELECT r.id FROM restaurantes r ${amenJoin}
             WHERE ${geoW} AND a.slug = ANY($4)
             GROUP BY r.id
             HAVING COUNT(DISTINCT a.id) = $5
           ) sub`,
          [lat, lng, radius, amenities, amenities.length]
        ),
      ]);
    }

    const total      = countResult.rows[0].total;
    const totalPages = Math.ceil(total / size);

    res.json({
      restaurants: dataResult.rows,
      meta: { total, page, totalPages, size },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener restaurantes' });
  }
});

// PTMA-117 (T04): GET /api/restaurants/:id/reviews?page=
router.get('/:id/reviews', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de restaurante inválido' });
  }

  try {
    // Validar si el restaurante existe
    const restCheck = await pool.query('SELECT id FROM restaurantes WHERE id = $1', [id]);
    if (restCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const size   = Math.min(50, Math.max(1, parseInt(req.query.size) || 5));
    const offset = (page - 1) * size;
    const sort   = req.query.sort === 'rating' ? 'rating' : 'date';

    // date -> fecha_creacion DESC, rating -> puntuacion DESC
    const orderClause = sort === 'rating'
      ? 'ORDER BY puntuacion DESC, fecha_creacion DESC'
      : 'ORDER BY fecha_creacion DESC, id DESC';

    const [dataResult, countResult, avgResult] = await Promise.all([
      pool.query(
        `SELECT id, usuario_nombre, puntuacion, comentario, fecha_creacion
         FROM reseñas
         WHERE restaurante_id = $1
         ${orderClause}
         LIMIT $2 OFFSET $3`,
        [id, size, offset]
      ),
      pool.query(
        'SELECT COUNT(*)::int AS total FROM reseñas WHERE restaurante_id = $1',
        [id]
      ),
      pool.query(
        'SELECT COALESCE(AVG(puntuacion), 0)::numeric(3,1) AS avg_rating FROM reseñas WHERE restaurante_id = $1',
        [id]
      ),
    ]);

    const BANNED_WORDS = [/mierda/i, /puto/i, /puta/i, /joder/i, /basura/i, /inapropiado/i, /estafa/i];
    const filteredReviews = dataResult.rows.filter(
      r => !BANNED_WORDS.some(regex => regex.test(r.comentario || ''))
    );

    const totalFilteredOut = dataResult.rows.length - filteredReviews.length;
    const total      = Math.max(0, countResult.rows[0].total - totalFilteredOut);
    const totalPages = Math.ceil(total / size);
    const avgRating  = parseFloat(avgResult.rows[0].avg_rating);

    res.json({
      reviews: filteredReviews,
      avg_rating: avgRating,
      meta: { total, page, totalPages, size },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las reseñas' });
  }
});

// PTMA-113 (T09): GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de restaurante inválido' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, tipo_comida, categoria, descripcion,
              direccion, ciudad, telefono, horario,
              latitud, longitud, redes_sociales,
              imagen_url, calificacion
       FROM restaurantes
       WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el detalle del restaurante' });
  }
});

module.exports = router;


