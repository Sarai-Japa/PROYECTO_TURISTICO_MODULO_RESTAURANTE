const { Router } = require('express');
const pool       = require('../db');
const requireAuth = require('../middleware/auth');

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /api/favorites — devuelve los IDs de restaurantes favoritos del usuario
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT restaurant_id FROM user_favorites WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ favorites: rows.map((r) => r.restaurant_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// POST /api/favorites/:restaurantId — agrega un favorito
router.post('/:restaurantId', async (req, res) => {
  const restaurantId = parseInt(req.params.restaurantId);
  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: 'ID de restaurante inválido' });
  }

  try {
    const exists = await pool.query(
      'SELECT 1 FROM restaurantes WHERE id = $1',
      [restaurantId]
    );
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    await pool.query(
      'INSERT INTO user_favorites (user_id, restaurant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, restaurantId]
    );
    res.status(201).json({ message: 'Favorito agregado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
});

// DELETE /api/favorites/:restaurantId — elimina un favorito
router.delete('/:restaurantId', async (req, res) => {
  const restaurantId = parseInt(req.params.restaurantId);
  if (isNaN(restaurantId)) {
    return res.status(400).json({ error: 'ID de restaurante inválido' });
  }

  try {
    await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND restaurant_id = $2',
      [req.user.id, restaurantId]
    );
    res.json({ message: 'Favorito eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
});

module.exports = router;
