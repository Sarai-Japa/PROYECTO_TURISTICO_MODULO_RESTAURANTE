import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useRestaurants(page = 1, size = 20) {
  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta]   = useState({ total: 0, page: 1, totalPages: 1, size: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`${API_URL}/api/restaurants?page=${page}&size=${size}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar restaurantes');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setRestaurants(data.restaurants);
          setMeta(data.meta);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la lista de restaurantes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, size]);

  return { restaurants, meta, loading, error };
}
