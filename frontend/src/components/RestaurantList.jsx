import { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useRestaurants } from '../hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import CardSkeleton from './CardSkeleton';

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
        className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
      >
        ← Anterior
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onChange(1)} className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 hover:bg-orange-50 transition cursor-pointer">1</button>
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
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
          <button onClick={() => onChange(totalPages)} className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 hover:bg-orange-50 transition cursor-pointer">{totalPages}</button>
        </>
      )}

      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
      >
        Siguiente →
      </button>
    </div>
  );
}

const SIZE_OPTIONS = [10, 20, 50, 100, 200];

export default function RestaurantList({ onSelect, locationFilter = null, amenities = [], date = null }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const { restaurants, meta, loading, error } = useRestaurants(page, size, locationFilter, amenities, date);

  const amenitiesKey = [...amenities].sort().join(',');

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationFilter?.lat, locationFilter?.lng, locationFilter?.radius, amenitiesKey, date]);

  function handleSizeChange(newSize) {
    setSize(newSize);
    setPage(1);
  }

  const skeletonCount = Math.min(size, 12);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          <SizeSelector size={size} onChange={handleSizeChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: skeletonCount }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </>
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
    const hasFilters = locationFilter || amenities.length > 0 || date;
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        {hasFilters ? (
          <>
            <div className="flex justify-center mb-2">
              {amenities.length > 0
                ? <Search className="w-8 h-8 text-gray-300" />
                : <MapPin className="w-8 h-8 text-gray-300" />}
            </div>
            <p className="text-gray-700 font-medium text-lg mb-1">
              Sin resultados con los filtros aplicados
            </p>
            <p className="text-gray-500 text-sm">
              {locationFilter && date
                ? `No encontramos restaurantes en ${locationFilter.radius ?? 5} km que abran ese día. Prueba con otra fecha o amplía el radio.`
                : date && !locationFilter
                  ? 'Ningún restaurante tiene horario registrado para ese día. Prueba con otra fecha.'
                  : amenities.length > 0
                    ? 'Ningún restaurante tiene todas las amenidades seleccionadas. Prueba con menos filtros.'
                    : `No encontramos restaurantes en un radio de ${locationFilter.radius ?? 5} km. Intenta ampliar el radio.`}
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-lg">No hay restaurantes disponibles</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          {meta.total} restaurante{meta.total !== 1 ? 's' : ''}{locationFilter ? ' encontrado' : ' disponible'}{meta.total !== 1 ? 's' : ''}
        </p>
        <SizeSelector size={size} onChange={handleSizeChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} onClick={onSelect} />
        ))}
      </div>

      {meta.totalPages > 1 && (
        <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />
      )}
    </div>
  );
}

function SizeSelector({ size, onChange }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span>Mostrar:</span>
      <select
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-orange-500 cursor-pointer transition"
      >
        {SIZE_OPTIONS.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}
