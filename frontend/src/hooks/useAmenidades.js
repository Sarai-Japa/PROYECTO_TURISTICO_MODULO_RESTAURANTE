import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useAmenidades() {
  const [amenidades, setAmenidades] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/amenidades`)
      .then((r) => r.json())
      .then((data) => { setAmenidades(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { amenidades, loading };
}
