import { useState } from 'react';
import { useRestaurants } from '../hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import CardSkeleton from './CardSkeleton';

// T02: paginación — prev/next + números de página
function Pagination({ page, totalPages, onChange }) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        ← Anterior
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onChange(1)} className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 hover:bg-orange-50 transition">1</button>
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
            p === page
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white border-gray-200 hover:bg-orange-50'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <button onClick={() => onChange(totalPages)} className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 hover:bg-orange-50 transition">{totalPages}</button>
        </>
      )}

      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Siguiente →
      </button>
    </div>
  );
}

// T01 + T02: lista paginada de restaurantes con skeleton de carga
export default function RestaurantList({ onSelect }) {
  const [page, setPage] = useState(1);
  const { restaurants, meta, loading, error } = useRestaurants(page, 20);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500 text-lg">No hay restaurantes disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-4">
        {meta.total} restaurante{meta.total !== 1 ? 's' : ''} disponible{meta.total !== 1 ? 's' : ''}
      </p>

      {/* T01: grilla responsive — 1 col móvil / 2 col tablet / 3 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} onClick={onSelect} />
        ))}
      </div>

      {/* T02: paginación */}
      {meta.totalPages > 1 && (
        <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />
      )}
    </div>
  );
}
