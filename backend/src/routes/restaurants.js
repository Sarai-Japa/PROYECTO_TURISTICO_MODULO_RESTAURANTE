const { Router } = require('express');
const pool = require('../db');

const router = Router();

// Builds filter fragments; returns params array + SQL snippets
function buildFilters({ lat, lng, radius, amenities, dow }) {
  const params = [];

  function p(val) {
    params.push(val);
    return `$${params.length}`;
  }

  let hvExpr     = '';
  let selectExtra = '';
  let orderBy    = 'r.calificacion DESC, r.nombre ASC';
  const joins    = [];
  const wheres   = [];

  if (lat !== null && lng !== null) {
    const pLat = p(lat);
    const pLng = p(lng);
    const pRad = p(radius);
    hvExpr = `6371 * acos(LEAST(1.0,
      cos(radians(${pLat})) * cos(radians(r.latitud)) *
      cos(radians(r.longitud) - radians(${pLng})) +
      sin(radians(${pLat})) * sin(radians(r.latitud))
    ))`;
    wheres.push(`r.latitud IS NOT NULL AND r.longitud IS NOT NULL AND (${hvExpr}) <= ${pRad}`);
    selectExtra = `, ROUND((${hvExpr})::numeric, 1) AS distancia_km`;
    orderBy     = `distancia_km ASC, r.calificacion DESC`;
  }

  if (amenities.length > 0) {
    joins.push('JOIN restaurante_amenidades ra ON r.id = ra.restaurante_id');
    joins.push('JOIN amenidades a ON ra.amenidad_id = a.id');
    wheres.push(`a.slug = ANY(${p(amenities)})`);
  }

  if (dow !== null) {
    joins.push(`JOIN restaurant_schedules rs ON r.id = rs.restaurante_id AND rs.dia_semana = ${p(dow)}`);
  }

  const hasAmenities = amenities.length > 0;
  const joinSQL   = joins.join('\n  ');
  const whereSQL  = wheres.length ? `WHERE ${wheres.join('\n    AND ')}` : '';
  const groupSQL  = hasAmenities ? 'GROUP BY r.id' : '';
  const havingSQL = hasAmenities ? `HAVING COUNT(DISTINCT a.id) = ${p(amenities.length)}` : '';

  return { params, joinSQL, whereSQL, groupSQL, havingSQL, selectExtra, orderBy };
}

// GET /api/restaurants  (HU01 / HU02 / HU03 / HU05)
router.get('/', async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const size   = Math.min(200, Math.max(1, parseInt(req.query.size) || 20));
  const offset = (page - 1) * size;

  // Geo filter (HU02)
  const latRaw = parseFloat(req.query.lat);
  const lngRaw = parseFloat(req.query.lng);
  const radius = Math.min(50, Math.max(0.1, parseFloat(req.query.radius) || 5));
  const hasGeo = !isNaN(latRaw) && !isNaN(lngRaw);
  const lat    = hasGeo ? latRaw : null;
  const lng    = hasGeo ? lngRaw : null;

  // Amenities filter (HU05) — acepta ?amenities[]=wifi&... o ?amenities=wifi,terraza
  let rawAmen = req.query['amenities[]'] ?? req.query.amenities ?? [];
  if (typeof rawAmen === 'string') rawAmen = rawAmen.split(',').map(s => s.trim());
  const amenities = rawAmen.filter(Boolean);

  // Date filter (HU03) — ?date=YYYY-MM-DD
  // T06: toda comparación de fechas usa America/Lima para coherencia con el usuario final
  const dateStr = (req.query.date || '').trim();
  let dow = null;
  if (dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime()) || d.getMonth() !== month - 1) {
      return res.status(400).json({ error: 'Fecha inválida' });
    }
    // T05: rechazar fechas pasadas usando "hoy" en zona horaria Lima (no UTC del servidor)
    const todayLima = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    if (dateStr < todayLima) {
      return res.status(400).json({ error: 'La fecha no puede ser anterior a hoy' });
    }
    dow = d.getDay(); // 0=domingo … 6=sábado (mismo convenio que PostgreSQL DOW)
  }

  try {
    const { params, joinSQL, whereSQL, groupSQL, havingSQL, selectExtra, orderBy } =
      buildFilters({ lat, lng, radius, amenities, dow });

    const dataParams = [...params, size, offset];
    const pSize      = `$${dataParams.length - 1}`;
    const pOffset    = `$${dataParams.length}`;

    const dataSQL = `
      SELECT r.id, r.nombre, r.tipo_comida, r.categoria, r.descripcion,
             r.direccion, r.ciudad, r.imagen_url, r.calificacion${selectExtra}
      FROM restaurantes r
      ${joinSQL}
      ${whereSQL}
      ${groupSQL}
      ${havingSQL}
      ORDER BY ${orderBy}
      LIMIT ${pSize} OFFSET ${pOffset}`;

    const countSQL = groupSQL
      ? `SELECT COUNT(*)::int AS total FROM (
           SELECT r.id FROM restaurantes r ${joinSQL} ${whereSQL} ${groupSQL} ${havingSQL}
         ) sub`
      : `SELECT COUNT(*)::int AS total FROM restaurantes r ${joinSQL} ${whereSQL}`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataSQL, dataParams),
      pool.query(countSQL, params),
    ]);

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

// GET /api/restaurants/:id/reviews?page=
router.get('/:id/reviews', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de restaurante inválido' });
  }

  try {
    const restCheck = await pool.query('SELECT id FROM restaurantes WHERE id = $1', [id]);
    if (restCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const size   = Math.min(50, Math.max(1, parseInt(req.query.size) || 5));
    const offset = (page - 1) * size;
    const sort   = req.query.sort === 'rating' ? 'rating' : 'date';

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

// GET /api/restaurants/:id
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
