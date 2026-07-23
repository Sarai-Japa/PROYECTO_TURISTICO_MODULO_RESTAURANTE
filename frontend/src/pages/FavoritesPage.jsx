import { Heart, ChefHat, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

// T04 HU11: ruta privada — solo accesible con sesión activa
export default function FavoritesPage({ onBack }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation('favorites');

  function handleLogout() {
    logout();
    onBack();
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
            <span className="text-sm text-gray-600 font-medium">{user?.nombre}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {t('common:nav.logout')}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <Heart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            {t('message')}
          </p>
        </div>
      </main>
    </>
  );
}
