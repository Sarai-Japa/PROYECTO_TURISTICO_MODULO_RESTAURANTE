import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// HU13: lista completa de restaurantes favoritos (foto, nombre, calificación, etc.)
export function useFavoritesList(token) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    if (!token) {
      setRestaurants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/favorites?size=200`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRestaurants(data.restaurants))
      .catch(() => setError('error'))
      .finally(() => setLoading(false));
  }, [token]);

  return { restaurants, loading, error };
}
