import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import RestaurantList from '../components/RestaurantList';

export default function RestaurantsPage({ onBack, onSelectRestaurant }) {
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');

  function handleSearch(data, term) {
    setSearchResults(data);
    setSearchQuery(term);
  }

  function handleClear() {
    setSearchResults(null);
    setSearchQuery('');
  }

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">FoodHub</span>
          </button>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8">

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Descubre Restaurantes</h1>
            <p className="text-gray-600 mb-6">Encuentra los mejores lugares para comer cerca de ti</p>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Resultados de búsqueda o listado completo */}
          {searchResults !== null ? (
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onClear={handleClear}
            />
          ) : (
            <RestaurantList onSelect={onSelectRestaurant} />
          )}

        </div>
      </main>
    </>
  );
}
