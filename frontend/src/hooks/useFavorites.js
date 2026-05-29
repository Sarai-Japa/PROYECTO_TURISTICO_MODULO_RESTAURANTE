import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useFavorites(token) {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/api/favorites?size=200`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setFavoriteIds(new Set(data.restaurants.map((r) => r.id))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const toggle = useCallback(async (restaurantId) => {
    if (!token) return false;

    const isFav = favoriteIds.has(restaurantId);

    // Actualización optimista
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(restaurantId) : next.add(restaurantId);
      return next;
    });

    try {
      const res = await fetch(`${API_URL}/api/favorites/${restaurantId}`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revertir si falla
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(restaurantId) : next.delete(restaurantId);
        return next;
      });
    }

    return !isFav;
  }, [token, favoriteIds]);

  return { favoriteIds, loading, toggle };
}
