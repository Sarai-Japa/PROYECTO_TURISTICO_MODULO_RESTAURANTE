import { useRef, useEffect } from 'react';
import { MapPin, Navigation, X, Loader } from 'lucide-react';
import { useLocationSearch } from '../hooks/useLocationSearch';

const RADIUS_OPTIONS = [1, 5, 10, 25];

export default function LocationSearch({ activeLocation, radius, onLocationChange, onRadiusChange }) {
  const { query, setQuery, suggestions, setSuggestions, loading } = useLocationSearch();
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSuggestions]);

  function handleSelect(suggestion) {
    onLocationChange({ lat: suggestion.lat, lng: suggestion.lng, label: suggestion.label });
    setQuery('');
    setSuggestions([]);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Mi ubicación actual',
        });
        setSuggestions([]);
      },
      () => {}
    );
  }

  function handleClear() {
    onLocationChange(null);
    setQuery('');
    setSuggestions([]);
  }

  const showDropdown = (suggestions.length > 0 || loading) && query.trim().length >= 3;

  return (
    <div ref={containerRef} className={`relative ${activeLocation ? '' : 'w-full'}`}>
      {activeLocation ? (
        /* Badge when location is active */
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-sm text-orange-700 font-medium truncate max-w-[220px]">
              {activeLocation.label}
            </span>

            <select
              value={radius}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="text-xs text-orange-600 bg-orange-100 rounded-full px-2 py-0.5 border-0 focus:outline-none cursor-pointer font-medium"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>

            <button
              onClick={handleClear}
              className="text-orange-400 hover:text-orange-600 cursor-pointer transition"
              title="Quitar filtro de ubicación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por ciudad o dirección..."
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition bg-white placeholder-gray-400"
          />
          <button
            onClick={handleUseMyLocation}
            title="Usar mi ubicación actual"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 cursor-pointer transition"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Suggestions dropdown */}
      {!activeLocation && showDropdown && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader className="w-4 h-4 animate-spin" />
              Buscando...
            </div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 flex items-start gap-2 cursor-pointer transition border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="text-gray-700 line-clamp-2">{s.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
