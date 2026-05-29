import { useState } from 'react';
import { ChefHat, LogIn, LogOut, Heart, AlertCircle, MapPin, Calendar } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import RestaurantList from '../components/RestaurantList';
import LocationSearch from '../components/LocationSearch';
import AmenityFilter from '../components/AmenityFilter';
import DateFilter from '../components/DateFilter';
import { useAuth } from '../context/AuthContext';

const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDateShort(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d   = new Date(year, month - 1, day);
  const dow = DAYS_ES[d.getDay()];
  return `${dow.charAt(0).toUpperCase() + dow.slice(1)}, ${day} de ${MONTHS_ES[month - 1]}`;
}

export default function RestaurantsPage({ onBack, onSelectRestaurant, onGoLogin, onGoFavorites }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchHighlight, setSearchHighlight] = useState(true);
  const [activeLocation, setActiveLocation] = useState(null);
  const [radius, setRadius]               = useState(5);
  const [amenities, setAmenities]         = useState([]);
  const [selectedDate, setSelectedDate]   = useState(null);

  function handleSearch(data, term, highlight = true) {
    setSearchResults(data);
    setSearchQuery(term);
    setSearchHighlight(highlight);
  }

  function handleClear() {
    setSearchResults(null);
    setSearchQuery('');
  }

  function handleLocationChange(location) {
    setActiveLocation(location);
    if (location) {
      setSearchResults(null);
      setSearchQuery('');
    }
  }

  function handleClearBothFilters() {
    setActiveLocation(null);
    setSelectedDate(null);
  }

  const locationFilter = activeLocation
    ? { lat: activeLocation.lat, lng: activeLocation.lng, radius, label: activeLocation.label }
    : null;

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">FoodHub</span>
          </button>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 font-medium hidden sm:inline">
                  Hola, {user?.nombre}
                </span>
                <button
                  onClick={onGoFavorites}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 transition cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Favoritos</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onGoLogin}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8">

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Descubre Restaurantes</h1>
            <p className="text-gray-600 mb-6">Encuentra los mejores lugares para comer cerca de ti</p>

            {/* Búsqueda por nombre/tipo */}
            <SearchBar onSearch={handleSearch} />

            {/* Separador */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                o filtra por ubicación y fecha
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* HU04-T02: fila compartida cuando ambos filtros están activos */}
            <div className={
              activeLocation && selectedDate
                ? 'flex flex-wrap gap-2 items-center'
                : 'space-y-3'
            }>
              <LocationSearch
                activeLocation={activeLocation}
                radius={radius}
                onLocationChange={handleLocationChange}
                onRadiusChange={setRadius}
              />
              <DateFilter selected={selectedDate} onChange={setSelectedDate} />
            </div>

            {/* Aviso: fecha activa sin ubicación */}
            {selectedDate && !activeLocation && (
              <div className="mt-2 flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Selecciona una ubicación para combinar ambos filtros y obtener resultados más precisos.</span>
              </div>
            )}

            {/* Badge combinado: ambos filtros activos simultáneamente */}
            {activeLocation && selectedDate && (
              <div className="mt-2 flex items-center gap-2 flex-wrap bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Filtros combinados</span>
                <div className="flex items-center gap-1.5 text-sm text-green-800">
                  <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="font-medium truncate max-w-[180px]">{activeLocation.label}</span>
                </div>
                <span className="text-green-400">·</span>
                <div className="flex items-center gap-1.5 text-sm text-green-800">
                  <Calendar className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="font-medium">{formatDateShort(selectedDate)}</span>
                </div>
                <button
                  onClick={handleClearBothFilters}
                  className="ml-auto text-xs text-green-600 hover:text-green-800 underline transition cursor-pointer"
                >
                  Limpiar ambos
                </button>
              </div>
            )}

            {/* Filtros por amenidades (HU05) */}
            <div className="mt-4">
              <AmenityFilter selected={amenities} onChange={setAmenities} />
            </div>
          </div>

          {/* Resultados de búsqueda por texto o listado con filtro geo */}
          {searchResults !== null ? (
            <SearchResults
              results={searchResults}
              query={searchQuery}
              highlight={searchHighlight}
              onSelect={onSelectRestaurant}
              onClear={handleClear}
            />
          ) : (
            <RestaurantList
              onSelect={onSelectRestaurant}
              locationFilter={locationFilter}
              amenities={amenities}
              date={selectedDate}
            />
          )}

        </div>
      </main>
    </>
  );
}
