import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useSearch() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res  = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Error en la búsqueda');
          setResults([]);
        } else {
          setResults(data.results);
        }
      } catch {
        setError('No se pudo conectar al servidor');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // T01: debounce 300ms

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleChange(e) {
    const value = e.target.value.slice(0, 100); // límite 100 chars
    setQuery(value);
    if (!value.trim()) setError('Ingrese un término');
    else setError('');
  }

  return { query, results, loading, error, handleChange, setResults };
}
