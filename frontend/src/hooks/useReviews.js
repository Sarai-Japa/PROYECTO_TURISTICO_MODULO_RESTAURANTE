import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useReviews(restaurantId, initialSort = 'date', size = 5) {
  const [reviews, setReviews]   = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [sort, setSort]         = useState(initialSort);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({ total: 0, page: 1, totalPages: 1, size });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!restaurantId) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    fetch(`${API_URL}/api/restaurants/${restaurantId}/reviews?page=${page}&size=${size}&sort=${sort}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar reseñas');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          if (page === 1) {
            setReviews(data.reviews);
          } else {
            setReviews((prev) => [...prev, ...data.reviews]);
          }
          setMeta(data.meta);
          if (page === 1) setAvgRating(data.avg_rating ?? null);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar las opiniones');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId, page, sort, size]);

  function handleSortChange(newSort) {
    if (newSort === sort) return;
    setReviews([]); // Limpiar la lista actual para evitar parpadeos de orden viejo
    setSort(newSort);
    setPage(1);
  }

  function loadMore() {
    if (page < meta.totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  }

  function addReview(newReview) {
    setReviews((prev) => [newReview, ...prev]);
    setMeta((prev) => ({ ...prev, total: prev.total + 1 }));
    setAvgRating((prev) => {
      // Recalcular el promedio localmente
      const prevTotal = meta.total;
      const prevAvg = prev || 0;
      const newTotal = prevTotal + 1;
      const newAvg = ((prevAvg * prevTotal) + newReview.puntuacion) / newTotal;
      return newAvg;
    });
  }

  return { reviews, avgRating, meta, loading, error, sort, handleSortChange, loadMore, addReview };
}
