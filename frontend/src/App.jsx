import { useState } from 'react';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';

export default function App() {
  const [page, setPage]                         = useState('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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
        onBack={() => setPage('home')}
        onSelectRestaurant={setSelectedRestaurant}
      />
    );
  }

  return <HomePage onExplore={() => setPage('restaurants')} />;
}
