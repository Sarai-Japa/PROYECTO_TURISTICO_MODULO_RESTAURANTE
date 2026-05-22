import { useState } from 'react';
import { ChefHat, LogIn, LogOut, Heart } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import RestaurantList from '../components/RestaurantList';
import LocationSearch from '../components/LocationSearch';
import AmenityFilter from '../components/AmenityFilter';
import DateFilter from '../components/DateFilter';
import { useAuth } from '../context/AuthContext';

export default function RestaurantsPage({ onBack, onSelectRestaurant, onGoLogin, onGoFavorites }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeLocation, setActiveLocation] = useState(null);
  const [radius, setRadius]               = useState(5);
  const [amenities, setAmenities]         = useState([]);
  const [selectedDate, setSelectedDate]   = useState(null);

  function handleSearch(data, term) {
    setSearchResults(data);
    setSearchQuery(term);
  }

  function handleClear() {
    setSearchResults(null);
    setSearchQuery('');
  }

  function handleLocationChange(location) {
    setActiveLocation(location);
    // Clear text search when a location is selected so the geo-filtered list shows
    if (location) {
      setSearchResults(null);
      setSearchQuery('');
    }
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
                o busca por ubicación
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Búsqueda por ubicación (HU02) */}
            <LocationSearch
              activeLocation={activeLocation}
              radius={radius}
              onLocationChange={handleLocationChange}
              onRadiusChange={setRadius}
            />

            {/* Filtros por amenidades (HU05) */}
            <div className="mt-4">
              <AmenityFilter selected={amenities} onChange={setAmenities} />
            </div>

            {/* Filtro por fecha / día de la semana (HU03) */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                o filtra por día de apertura
              </p>
              <DateFilter selected={selectedDate} onChange={setSelectedDate} />
            </div>
          </div>

          {/* Resultados de búsqueda por texto o listado con filtro geo */}
          {searchResults !== null ? (
            <SearchResults
              results={searchResults}
              query={searchQuery}
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
