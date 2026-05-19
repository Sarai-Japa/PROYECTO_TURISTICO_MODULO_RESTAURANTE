const { Router } = require('express');
const pool = require('../db');

const router = Router();

// T03 + T04: GET /api/restaurants?page=1&size=20
router.get('/', async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const size   = Math.min(200, Math.max(1, parseInt(req.query.size) || 20));
  const offset = (page - 1) * size;

  try {
    const [dataResult, countResult] = await Promise.all([
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

module.exports = router;
