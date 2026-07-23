import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useFavorites } from './hooks/useFavorites';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';

function getInitialPage() {
  const h = window.location.hash;
  if (h === '#restaurantes') return 'restaurants';
  if (h === '#favoritos')    return 'favorites';
  return 'home';
}

function AppContent() {
  const { isAuthenticated, loading, token } = useAuth();
  const { favoriteIds, toggle: toggleFavorite } = useFavorites(token);
  const [page, setPage]                             = useState(getInitialPage);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [returnTo, setReturnTo]                     = useState('restaurants');

  // Sincronizar estado con cambios de hash (flechas del navegador)
  useEffect(() => {
    const handleHashChange = () => {
      setPage(getInitialPage());
      setSelectedRestaurant(null);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function goTo(dest) {
    const hashes = { restaurants: '#restaurantes', favorites: '#favoritos', home: '' };
    window.location.hash = hashes[dest] ?? '';
    setPage(dest);
  }

  // T04: redirige a login guardando destino
  function requireAuth(dest) {
    if (isAuthenticated) { goTo(dest); return; }
    setReturnTo(dest);
    setPage('login');
  }

  // Mostrar nada mientras se rehidrata el token de localStorage
  if (loading) return null;

  if (selectedRestaurant) {
    return (
      <RestaurantDetailPage
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
        onGoLogin={() => { setReturnTo('restaurants'); setPage('login'); }}
        isFavorite={favoriteIds.has(selectedRestaurant.id)}
        onToggleFavorite={toggleFavorite}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  if (page === 'login') {
    return (
      <LoginPage
        onSuccess={() => goTo(returnTo)}
        onGoRegister={() => setPage('register')}
        onBack={() => goTo('home')}
      />
    );
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onSuccess={() => goTo('restaurants')}
        onGoLogin={() => setPage('login')}
        onBack={() => goTo('home')}
      />
    );
  }

  // T04: ruta privada — muestra login si no está autenticado
  if (page === 'favorites') {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onSuccess={() => setPage('favorites')}
          onGoRegister={() => setPage('register')}
          onBack={() => goTo('home')}
        />
      );
    }
    return <FavoritesPage onBack={() => goTo('restaurants')} />;
  }

  if (page === 'restaurants') {
    return (
      <RestaurantsPage
        onBack={() => goTo('home')}
        onSelectRestaurant={setSelectedRestaurant}
        onGoLogin={() => { setReturnTo('restaurants'); setPage('login'); }}
        onGoFavorites={() => requireAuth('favorites')}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  return <HomePage onExplore={() => goTo('restaurants')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
