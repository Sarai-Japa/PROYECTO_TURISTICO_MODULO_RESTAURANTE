const { Router } = require('express');

const router = Router();

// T05 HU02: GET /api/geocode?q= — proxy a Nominatim (OpenStreetMap)
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();

  if (q.length < 3) {
    return res.json({ results: [] });
  }

  try {
    const params = new URLSearchParams({
      q,
      format: 'json',
      limit: '5',
      'accept-language': 'es',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'User-Agent': 'FoodHub/1.0' } }
    );

    const data = await response.json();

    res.json({
      results: data.map((item) => ({
        label: item.display_name,
        lat:   parseFloat(item.lat),
        lng:   parseFloat(item.lon),
      })),
    });
  } catch {
    res.status(502).json({ error: 'Error al conectar con el servicio de geocodificación' });
  }
});

module.exports = router;
