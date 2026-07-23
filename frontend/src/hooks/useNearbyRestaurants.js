import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const DEBOUNCE_MS = 400;

// HU16: restaurantes cercanos a un punto (lat/lng), con debounce en
// cambios de posición (arrastre de mapa) — la primera carga es inmediata.
export function useNearbyRestaurants(center, radius) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const isFirstLoad = useRef(true);
  const debounceRef = useRef(null);

  const lat = center?.lat ?? null;
  const lng = center?.lng ?? null;

  useEffect(() => {
    if (lat === null || lng === null) return;

    function fetchNearby() {
      setLoading(true);
      setError(null);

      fetch(`${API_URL}/api/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setRestaurants(data.restaurants))
        .catch(() => setError('error'))
        .finally(() => setLoading(false));
    }

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      fetchNearby();
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchNearby, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [lat, lng, radius]);

  return { restaurants, loading, error };
}
