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
      format:       'json',
      limit:        '8',          // pedir más para que queden 5 tras deduplicar
      'accept-language': 'es',
      countrycodes: 'pe',         // solo resultados de Perú
      dedupe:       '1',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'User-Agent': 'FoodHub/1.0' } }
    );

    const data = await response.json();

    // Deduplicar por proximidad: si dos resultados están a < 1 km, conservar solo el primero
    const THRESHOLD = 0.01;
    const deduped   = [];
    for (const item of data) {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const isDup = deduped.some(
        (e) => Math.abs(e.lat - lat) < THRESHOLD && Math.abs(e.lng - lng) < THRESHOLD
      );
      if (!isDup) deduped.push({ label: item.display_name, lat, lng });
    }

    res.json({ results: deduped.slice(0, 5) });
  } catch {
    res.status(502).json({ error: 'Error al conectar con el servicio de geocodificación' });
  }
});

module.exports = router;
