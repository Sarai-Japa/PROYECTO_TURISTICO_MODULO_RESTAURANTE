import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useFavorites } from './hooks/useFavorites';
import { useMapState } from './hooks/useMapState';
import { useNearbyRestaurants } from './hooks/useNearbyRestaurants';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import MapPage from './pages/MapPage';

function getInitialPage() {
  const h = window.location.hash;
  if (h === '#restaurantes') return 'restaurants';
  if (h === '#favoritos')    return 'favorites';
  if (h === '#mapa')         return 'map';
  return 'home';
}

function AppContent() {
  const { isAuthenticated, loading, token } = useAuth();
  const { favoriteIds, toggle: toggleFavorite } = useFavorites(token);
  const [page, setPage]                             = useState(getInitialPage);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [returnTo, setReturnTo]                     = useState('restaurants');

  // HU16: estado del mapa vive aquí (no en MapPage) para sobrevivir cuando
  // se navega al detalle de un restaurante y se vuelve — evita re-pedir GPS y re-fetch.
  const mapState = useMapState();
  const nearby    = useNearbyRestaurants(mapState.searchCenter, mapState.radius);

  useEffect(() => {
    if (page === 'map') mapState.ensureGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
    const hashes = { restaurants: '#restaurantes', favorites: '#favoritos', map: '#mapa', home: '' };
    window.location.hash = hashes[dest] ?? '';
    setPage(dest);
  }

  // T04: redirige a login guardando destino
  function requireAuth(dest) {
    if (isAuthenticated) { goTo(dest); return; }
    setReturnTo(dest);
    setPage('login');
  }

  // HU13: "Ver en mapa" desde Favoritos — centra el mapa en ese restaurante
  function focusRestaurantOnMap(restaurant) {
    if (restaurant.latitud == null || restaurant.longitud == null) return;
    mapState.focusOn(restaurant.latitud, restaurant.longitud, restaurant.nombre);
    goTo('map');
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
          onSuccess={() => goTo('favorites')}
          onGoRegister={() => setPage('register')}
          onBack={() => goTo('home')}
        />
      );
    }
    return (
      <FavoritesPage
        onBack={() => goTo('home')}
        onBackToRestaurants={() => goTo('restaurants')}
        onSelectRestaurant={setSelectedRestaurant}
        onViewOnMap={focusRestaurantOnMap}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  if (page === 'restaurants') {
    return (
      <RestaurantsPage
        onBack={() => goTo('home')}
        onSelectRestaurant={setSelectedRestaurant}
        onGoLogin={() => { setReturnTo('restaurants'); setPage('login'); }}
        onGoFavorites={() => requireAuth('favorites')}
        onGoMap={() => goTo('map')}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  if (page === 'map') {
    return (
      <MapPage
        onBack={() => goTo('home')}
        onGoRestaurants={() => goTo('restaurants')}
        onSelectRestaurant={setSelectedRestaurant}
        onGoLogin={() => { setReturnTo('map'); setPage('login'); }}
        onGoFavorites={() => requireAuth('favorites')}
        activeLocation={mapState.activeLocation}
        searchCenter={mapState.searchCenter}
        radius={mapState.radius}
        onRadiusChange={mapState.setRadius}
        geoDenied={mapState.geoDenied}
        geoSettled={mapState.geoSettled}
        onLocationChange={mapState.handleLocationChange}
        onMoveEnd={mapState.handleMoveEnd}
        restaurants={nearby.restaurants}
        loading={nearby.loading}
        error={nearby.error}
      />
    );
  }

  return <HomePage onExplore={() => goTo('restaurants')} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
