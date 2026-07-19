import { Heart, ChefHat, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import RestaurantCard from '../components/RestaurantCard';
import ThemeToggle from '../components/ThemeToggle';
import CardSkeleton from '../components/CardSkeleton';

export default function FavoritesPage({ onBack, onSelectRestaurant, onGoLogin }) {
  const { user, logout, token, isAuthenticated } = useAuth();
  const { favorites, loading, toggle } = useFavorites(token);

  function handleLogout() {
    logout();
    onBack();
  }

  function handleVerEnMapa(r) {
    if (r.latitud != null && r.longitud != null) {
      window.location.hash = `#mapa?lat=${r.latitud}&lng=${r.longitud}&id=${r.id}`;
    } else {
      window.location.hash = `#restaurantes?lat=-12.046374&lng=-77.042793`; // Fallback a Lima
    }
  }

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">FoodHub</span>
          </button>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-gray-600 font-medium hidden sm:inline">{user?.nombre}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                Mis Favoritos
              </h1>
              <p className="text-gray-500 text-sm mt-1">Gestiona los restaurantes que has guardado</p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-xl transition cursor-pointer"
              >
                ← Volver al listado
              </button>
            )}
          </div>

          {loading ? (
            /* Loading Skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            /* Empty State Banner */
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-150 max-w-xl mx-auto mt-8">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Heart className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sin favoritos guardados</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Aún no tienes restaurantes favoritos guardados. ¡Explora el mapa y guarda tus lugares preferidos!
              </p>
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow cursor-pointer text-sm"
              >
                Explorar Restaurantes
              </button>
            </div>
          ) : (
            /* Favorites Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((r) => (
                <div 
                  key={r.id} 
                  className="flex flex-col bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition group"
                >
                  <RestaurantCard
                    restaurant={r}
                    isFavorite={true}
                    onToggleFavorite={toggle}
                    onClick={onSelectRestaurant}
                    isAuthenticated={isAuthenticated}
                    onGoLogin={onGoLogin}
                  />
                  {/* Action panel underneath the card */}
                  <div className="px-4 pb-4 -mt-2">
                    <button
                      onClick={() => handleVerEnMapa(r)}
                      className="w-full py-2 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold rounded-lg text-sm hover:bg-orange-100 dark:hover:bg-orange-950/60 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver en mapa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
}
