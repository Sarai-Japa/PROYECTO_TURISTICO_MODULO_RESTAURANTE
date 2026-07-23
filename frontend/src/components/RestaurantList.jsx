import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRestaurants } from '../hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import CardSkeleton from './CardSkeleton';

function Pagination({ page, totalPages, onChange, t }) {
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
        {t('pagination.previous')}
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
        {t('pagination.next')}
      </button>
    </div>
  );
}

const SIZE_OPTIONS = [10, 20, 50, 100, 200];

export default function RestaurantList({ onSelect, locationFilter = null, amenities = [], date = null, favoriteIds = new Set(), onToggleFavorite, isAuthenticated = false, onGoLogin }) {
  const { t } = useTranslation('restaurants');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const amenitiesKey = [...amenities].sort().join(',');

  const filterKey = [
    locationFilter?.lat    ?? '',
    locationFilter?.lng    ?? '',
    locationFilter?.radius ?? '',
    amenitiesKey,
    date ?? '',
  ].join('|');

  const prevFilterKeyRef = useRef(filterKey);

  // Si el filtro cambió, page efectiva es 1 ya en este render (sin esperar al useEffect)
  const effectivePage = prevFilterKeyRef.current !== filterKey ? 1 : page;

  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      setPage(1);
    }
  }, [filterKey]);

  const { restaurants, meta, loading, error } = useRestaurants(effectivePage, size, locationFilter, amenities, date);

  function handleSizeChange(newSize) {
    setSize(newSize);
    setPage(1);
  }

  const skeletonCount = Math.min(size, 12);

  // Carga inicial (sin resultados previos): mostrar esqueletos
  if (loading && restaurants.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          <SizeSelector size={size} onChange={handleSizeChange} t={t} />
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
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 transition-colors">
        {hasFilters ? (
          <>
            <div className="flex justify-center mb-2">
              {amenities.length > 0
                ? <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                : <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600" />}
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-lg mb-1">
              {t('empty.title')}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {locationFilter && date
                ? t('empty.bothFilters', { radius: locationFilter.radius ?? 5 })
                : date && !locationFilter
                  ? t('empty.dateOnly')
                  : amenities.length > 0
                    ? t('empty.amenitiesOnly')
                    : t('empty.locationOnly', { radius: locationFilter.radius ?? 5 })}
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-lg">{t('empty.noRestaurants')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* HU04-T03: overlay de actualización cuando ya hay resultados (sin recargar la página) */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-full px-3 py-1 shadow-sm text-sm text-orange-600 dark:text-orange-400 mt-1 transition-colors">
            <Loader className="w-3.5 h-3.5 animate-spin" />
            <span>{t('list.updating')}</span>
          </div>
        </div>
      )}

      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {(locationFilter || amenities.length > 0 || date)
              ? t('list.countFound', { count: meta.total, defaultValue: `${meta.total} restaurante${meta.total !== 1 ? 's' : ''} encontrado${meta.total !== 1 ? 's' : ''}` })
              : t('list.countAvailable', { count: meta.total, defaultValue: `${meta.total} restaurante${meta.total !== 1 ? 's' : ''} disponible${meta.total !== 1 ? 's' : ''}` })}
            {meta.totalPages > 1 && (
              <span className="text-gray-400 text-sm ml-2">— {t('list.page', { current: effectivePage, total: meta.totalPages })}</span>
            )}
          </p>
          <SizeSelector size={size} onChange={handleSizeChange} t={t} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onClick={onSelect}
              isFavorite={favoriteIds.has(r.id)}
              onToggleFavorite={onToggleFavorite}
              isAuthenticated={isAuthenticated}
              onGoLogin={onGoLogin}
            />
          ))}
        </div>

        {meta.totalPages > 1 && (
          <Pagination page={effectivePage} totalPages={meta.totalPages} onChange={setPage} t={t} />
        )}
      </div>
    </div>
  );
}

function SizeSelector({ size, onChange, t }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <span>{t('list.show')}:</span>
      <select
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-orange-500 cursor-pointer transition"
      >
        {SIZE_OPTIONS.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}
