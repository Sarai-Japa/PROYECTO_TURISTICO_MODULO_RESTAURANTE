import { useState } from 'react';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';

function getInitialPage() {
  return window.location.hash === '#restaurantes' ? 'restaurants' : 'home';
}

export default function App() {
  const [page, setPage]                             = useState(getInitialPage);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  function goToRestaurants() {
    window.location.hash = '#restaurantes';
    setPage('restaurants');
  }

  function goToHome() {
    window.location.hash = '';
    setPage('home');
  }

  if (selectedRestaurant) {
    return (
      <RestaurantDetailPage
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
      />
    );
  }

  if (page === 'restaurants') {
    return (
      <RestaurantsPage
        onBack={goToHome}
        onSelectRestaurant={setSelectedRestaurant}
      />
    );
  }

  return <HomePage onExplore={goToRestaurants} />;
}
