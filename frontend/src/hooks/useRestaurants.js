import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useRestaurants(page = 1, size = 20, locationFilter = null, amenities = [], date = null) {
  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta]   = useState({ total: 0, page: 1, totalPages: 1, size: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const lat          = locationFilter?.lat    ?? null;
  const lng          = locationFilter?.lng    ?? null;
  const radius       = locationFilter?.radius ?? 5;
  const amenitiesKey = [...amenities].sort().join(',');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page, size });
    if (lat !== null && lng !== null) {
      params.set('lat', lat);
      params.set('lng', lng);
      params.set('radius', radius);
    }
    amenities.forEach((slug) => params.append('amenities[]', slug));
    if (date) params.set('date', date);

    fetch(`${API_URL}/api/restaurants?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Error al cargar restaurantes');
        }
        return res.json();
      })
      .then((data) => {
        setRestaurants(data.restaurants);
        setMeta(data.meta);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'No se pudo cargar la lista de restaurantes');
        setLoading(false);
      });

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, lat, lng, radius, amenitiesKey, date]);

  return { restaurants, meta, loading, error };
}
