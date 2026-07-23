import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearch } from '../hooks/useSearch';
import { highlightText } from '../utils/highlight';

const TYPE_COLOR = {
  restaurant: 'bg-orange-100 text-orange-700',
  cuisine:    'bg-blue-100 text-blue-700',
  dish:       'bg-green-100 text-green-700',
};

function getMatchType(item, query) {
  const q = query.toLowerCase();
  if (item.nombre?.toLowerCase().includes(q))      return 'restaurant';
  if (item.tipo_comida?.toLowerCase().includes(q)) return 'cuisine';
  return 'dish';
}

// T01 + T02: input con debounce 300ms y dropdown de sugerencias
export default function SearchBar({ onSearch }) {
  const { query, results, loading, error, handleChange } = useSearch();
  const { t } = useTranslation('restaurants');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) {
      // Campo vacío → señal para volver al listado general
      onSearch(null, '');
      setOpen(false);
      return;
    }
    onSearch(results, query);
    setOpen(false);
  }

  function handleSelect(item) {
    handleChange({ target: { value: item.nombre } });
    onSearch(results, item.nombre, false);
    setOpen(false);
  }

  const showDropdown = open && query.length > 0;
  const suggestions  = results.slice(0, 5);

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            maxLength={100}
            onChange={(e) => { handleChange(e); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="w-full pl-12 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 transition text-base bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => { handleChange({ target: { value: '' } }); setOpen(false); onSearch([], ''); }}
              className="absolute right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              aria-label={t('search.clearLabel')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {error && <p className="text-sm text-red-500 mt-1 px-1">{error}</p>}

      {/* T02: dropdown de sugerencias */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden transition-colors">
          {query.length < 3 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('search.minChars')}
            </p>
          ) : loading ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">{t('search.loading')}</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('search.noResults', { query })}
            </p>
          ) : (
            <ul>
              {suggestions.map((item) => {
                const type = getMatchType(item, query);
                return (
                  <li key={item.id}>
                    <button
                      onMouseDown={() => handleSelect(item)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-700 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0 transition cursor-pointer"
                    >
                      <div className="min-w-0">
                        {/* T03: resaltar coincidencias */}
                        <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                          {highlightText(item.nombre, query)}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                          {highlightText(item.tipo_comida, query)}
                        </span>
                      </div>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[type]}`}>
                        {t(`search.type.${type}`)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
