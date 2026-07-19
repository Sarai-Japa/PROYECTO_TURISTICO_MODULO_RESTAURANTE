import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useFavorites(token) {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setFavoriteIds(new Set());
      setFavorites([]);
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/api/favorites?size=200`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const list = data.restaurants || [];
        setFavorites(list);
        setFavoriteIds(new Set(list.map((r) => r.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const toggle = useCallback(async (restaurantId, restaurantData = null) => {
    if (!token) return false;

    const isFav = favoriteIds.has(restaurantId);

    // Actualización optimista de los IDs
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(restaurantId) : next.add(restaurantId);
      return next;
    });

    // Actualización optimista del listado completo
    setFavorites((prev) => {
      if (isFav) {
        return prev.filter((r) => r.id !== restaurantId);
      } else {
        const newFav = restaurantData || { id: restaurantId, nombre: 'Restaurante' };
        return [newFav, ...prev];
      }
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

      // Recargar de base de datos para estar seguros
      fetch(`${API_URL}/api/favorites?size=200`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          const list = data.restaurants || [];
          setFavorites(list);
          setFavoriteIds(new Set(list.map((r) => r.id)));
        })
        .catch(() => {});
    }

    return !isFav;
  }, [token, favoriteIds]);

  return { favoriteIds, favorites, loading, toggle };
}
