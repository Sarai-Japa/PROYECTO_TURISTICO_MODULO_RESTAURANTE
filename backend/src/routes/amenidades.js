const { Router } = require('express');
const pool = require('../db');

const router = Router();

// T01 HU05: GET /api/amenidades — lista todas las amenidades disponibles
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, slug, nombre, icono FROM amenidades ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las amenidades' });
  }
});

module.exports = router;
