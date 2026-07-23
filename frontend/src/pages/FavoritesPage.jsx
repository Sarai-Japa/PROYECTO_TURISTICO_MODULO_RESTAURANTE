import { Heart, ChefHat, LogOut, Compass, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';
import RestaurantCard from '../components/RestaurantCard';
import CardSkeleton from '../components/CardSkeleton';
import { useFavoritesList } from '../hooks/useFavoritesList';

// T04 HU11: ruta privada — solo accesible con sesión activa
// HU13: lista de restaurantes favoritos del usuario
export default function FavoritesPage({ onBack, onBackToRestaurants, onSelectRestaurant, onViewOnMap, favoriteIds = new Set(), onToggleFavorite }) {
  const { user, token, logout } = useAuth();
  const { t } = useTranslation('favorites');
  const { restaurants, loading, error } = useFavoritesList(token);

  // Se filtra contra favoriteIds (fuente de verdad compartida) para que
  // desmarcar un favorito lo quite de la lista al instante (UI optimista)
  const displayed = restaurants.filter((r) => favoriteIds.has(r.id));

  function handleLogout() {
    logout();
    onBack();
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">FoodHub</span>
            </button>
            <button
              onClick={onBackToRestaurants}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer pl-4 border-l border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToRestaurants')}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{user?.nombre}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {t('common:nav.logout')}
            </button>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
        <div className="container mx-auto px-4 py-10">
          <button
            onClick={onBackToRestaurants}
            className="sm:hidden flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToRestaurants')}
          </button>
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-orange-500 shrink-0" fill="currentColor" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
              {!loading && !error && displayed.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('subtitle', { count: displayed.length })}
                </p>
              )}
            </div>
          </div>

          {/* Carga inicial */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {/* Error de conexión */}
          {!loading && error && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 transition-colors">
              <p className="text-red-500 dark:text-red-400 text-lg">{t('error')}</p>
            </div>
          )}

          {/* Banner de estado vacío */}
          {!loading && !error && displayed.length === 0 && (
            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 transition-colors">
              <Heart className="w-14 h-14 text-orange-200 dark:text-orange-900 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('empty.title')}</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">{t('empty.message')}</p>
              <button
                onClick={onBackToRestaurants}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                {t('empty.cta')}
              </button>
            </div>
          )}

          {/* Grid de favoritos */}
          {!loading && !error && displayed.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  onClick={onSelectRestaurant}
                  isFavorite={favoriteIds.has(r.id)}
                  onToggleFavorite={onToggleFavorite}
                  isAuthenticated={true}
                  onViewOnMap={onViewOnMap}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
