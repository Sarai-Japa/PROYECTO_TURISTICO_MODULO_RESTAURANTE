const { Router } = require('express');
const pool = require('../db');

const router = Router();

// T06: elimina etiquetas HTML y limita longitud — la inyección SQL la previenen las queries parametrizadas
function sanitizeInput(raw) {
  return raw
    .trim()
    .replace(/<[^>]*>/g, '')
    .substring(0, 100);
}

// T04 + T05: GET /api/search?q=term
// Usa búsqueda full-text (plainto_tsquery + ts_rank) apoyada en el índice GIN combinado (T07)
// Si el término produce un tsquery vacío (ej. stop-words), la condición OR ILIKE cubre el resultado
router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Ingrese un término' });
  }

  const term = sanitizeInput(q);

  if (term.length < 3) {
    return res.status(400).json({ error: 'Ingrese al menos 3 caracteres' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         id, nombre, tipo_comida, categoria, descripcion, imagen_url,
         ts_rank(
           to_tsvector('spanish',
             nombre || ' ' || COALESCE(tipo_comida,'') || ' ' || COALESCE(categoria,'')
           ),
           plainto_tsquery('spanish', $2)
         ) AS rank
       FROM restaurantes
       WHERE
         nombre      ILIKE $1
         OR tipo_comida ILIKE $1
         OR categoria   ILIKE $1
         OR to_tsvector('spanish',
              nombre || ' ' || COALESCE(tipo_comida,'') || ' ' || COALESCE(categoria,'')
            ) @@ plainto_tsquery('spanish', $2)
       ORDER BY
         CASE
           WHEN nombre      ILIKE $1 THEN 1
           WHEN tipo_comida ILIKE $1 THEN 2
           ELSE 3
         END,
         rank DESC
       LIMIT 20`,
      [`%${term}%`, term]
    );

    res.json({ results: rows, query: term });
  } catch (err) {
    console.error('full-text falló, reintentando con ILIKE:', err.message);

    // Fallback a ILIKE puro si plainto_tsquery produce error
    try {
      const { rows } = await pool.query(
        `SELECT id, nombre, tipo_comida, categoria, descripcion, imagen_url
         FROM restaurantes
         WHERE nombre ILIKE $1 OR tipo_comida ILIKE $1 OR categoria ILIKE $1
         LIMIT 20`,
        [`%${term}%`]
      );
      res.json({ results: rows, query: term });
    } catch (fallbackErr) {
      console.error(fallbackErr);
      res.status(500).json({ error: 'Error en la búsqueda' });
    }
  }
});

module.exports = router;
