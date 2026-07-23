import { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useFavorites } from './hooks/useFavorites';
import { useMapState } from './hooks/useMapState';
import { useNearbyRestaurants } from './hooks/useNearbyRestaurants';
// HU17 (QA): HomePage se carga siempre (es la primera pantalla), el resto
// se separa en chunks propios y se carga solo cuando el usuario navega ahí
// — reduce el bundle inicial, especialmente Leaflet (Mapa/Detalle).
import HomePage from './pages/HomePage';
const RestaurantsPage      = lazy(() => import('./pages/RestaurantsPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const LoginPage             = lazy(() => import('./pages/LoginPage'));
const RegisterPage          = lazy(() => import('./pages/RegisterPage'));
const FavoritesPage         = lazy(() => import('./pages/FavoritesPage'));
const MapPage                = lazy(() => import('./pages/MapPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}

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

  let content;

  if (selectedRestaurant) {
    content = (
      <RestaurantDetailPage
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
        onGoLogin={() => { setReturnTo('restaurants'); setPage('login'); }}
        isFavorite={favoriteIds.has(selectedRestaurant.id)}
        onToggleFavorite={toggleFavorite}
        isAuthenticated={isAuthenticated}
      />
    );
  } else if (page === 'login') {
    content = (
      <LoginPage
        onSuccess={() => goTo(returnTo)}
        onGoRegister={() => setPage('register')}
        onBack={() => goTo('home')}
      />
    );
  } else if (page === 'register') {
    content = (
      <RegisterPage
        onSuccess={() => goTo('restaurants')}
        onGoLogin={() => setPage('login')}
        onBack={() => goTo('home')}
      />
    );
  } else if (page === 'favorites' && !isAuthenticated) {
    // T04: ruta privada — muestra login si no está autenticado
    content = (
      <LoginPage
        onSuccess={() => goTo('favorites')}
        onGoRegister={() => setPage('register')}
        onBack={() => goTo('home')}
      />
    );
  } else if (page === 'favorites') {
    content = (
      <FavoritesPage
        onBack={() => goTo('home')}
        onBackToRestaurants={() => goTo('restaurants')}
        onSelectRestaurant={setSelectedRestaurant}
        onViewOnMap={focusRestaurantOnMap}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
    );
  } else if (page === 'restaurants') {
    content = (
      <RestaurantsPage
        onBack={() => goTo('home')}
        onSelectRestaurant={setSelectedRestaurant}
        onGoLogin={() => { setReturnTo('restaurants'); setPage('login'); }}
        onGoFavorites={() => requireAuth('favorites')}
        onGoMap={() => { mapState.goToMyLocation(); goTo('map'); }}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
    );
  } else if (page === 'map') {
    content = (
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
  } else {
    content = <HomePage onExplore={() => goTo('restaurants')} />;
  }

  return <Suspense fallback={<PageLoader />}>{content}</Suspense>;
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
