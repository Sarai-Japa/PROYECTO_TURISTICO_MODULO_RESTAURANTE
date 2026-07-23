import { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ChefHat, LogIn, LogOut, Heart, List, Navigation2, AlertTriangle, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LocationSearch from '../components/LocationSearch';

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 2px #3b82f6,0 2px 6px rgba(0,0,0,.4);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const restaurantIcon = L.divIcon({
  className: 'restaurant-marker',
  html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#f97316;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:13px;">🍴</span></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
});

// Ajusta el zoom inicial/al cambiar radio para que el círculo de búsqueda
// quepa visualmente en el viewport (a zoom 15 un radio de 5km ni se ve completo).
function zoomForRadius(km) {
  if (km <= 1)  return 15;
  if (km <= 2)  return 14;
  if (km <= 5)  return 13;
  if (km <= 10) return 12;
  if (km <= 25) return 11;
  return 10;
}

function MapEvents({ onMoveEnd }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMoveEnd({ lat: c.lat, lng: c.lng });
    },
  });
  return null;
}

function Stars({ value }) {
  const rating = parseFloat(value) || 0;
  return (
    <span className="text-yellow-500 text-sm">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="text-gray-600 ml-1">{rating > 0 ? rating.toFixed(1) : '—'}</span>
    </span>
  );
}

// HU16: mapa interactivo de restaurantes cercanos.
// Nota: todo el estado (geolocalización, centro, radio, resultados) vive en App.jsx
// (ver useMapState/useNearbyRestaurants) para sobrevivir al desmontaje de esta página
// cuando el usuario navega al detalle de un restaurante y regresa.
export default function MapPage({
  onBack, onGoRestaurants, onSelectRestaurant, onGoLogin, onGoFavorites,
  activeLocation, searchCenter, radius, onRadiusChange, geoDenied, geoSettled,
  onLocationChange, onMoveEnd, restaurants, loading, error,
}) {
  const { t } = useTranslation('map');
  const { user, isAuthenticated, logout } = useAuth();
  const mapRef = useRef(null);

  function handleLocationChange(loc) {
    onLocationChange(loc);
    if (loc) {
      mapRef.current?.setView([loc.lat, loc.lng], zoomForRadius(radius));
    }
  }

  function handleRadiusChange(newRadius) {
    onRadiusChange(newRadius);
    if (searchCenter) {
      mapRef.current?.setView([searchCenter.lat, searchCenter.lng], zoomForRadius(newRadius));
    }
  }

  // La etiqueta puede venir traducida (búsqueda manual) o como clave i18n (geolocalización/fallback)
  const displayLocation = activeLocation
    ? { ...activeLocation, label: activeLocation.labelKey ? t(activeLocation.labelKey) : activeLocation.label }
    : null;

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-white dark:bg-gray-900 shadow-sm z-[1100] transition-colors shrink-0">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer shrink-0">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white hidden sm:inline">FoodHub</span>
            </button>
            <button
              onClick={onGoRestaurants}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer pl-4 border-l border-gray-200 dark:border-gray-700"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">{t('viewList')}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium hidden md:inline">
                  {t('common:nav.hello', { name: user?.nombre })}
                </span>
                <button
                  onClick={onGoFavorites}
                  className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('common:nav.favorites')}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('common:nav.logout')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={onGoLogin}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {t('common:nav.login')}
              </button>
            )}
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Buscador manual + radio configurable */}
        <div className="container mx-auto px-4 pb-3">
          <div className="max-w-md">
            <LocationSearch
              activeLocation={displayLocation}
              radius={radius}
              onLocationChange={handleLocationChange}
              onRadiusChange={handleRadiusChange}
            />
          </div>
        </div>
      </nav>

      {/* Aviso de permiso GPS denegado */}
      {geoSettled && geoDenied && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center gap-2 justify-center text-sm text-amber-800 dark:text-amber-300 transition-colors shrink-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t('geoDenied')}</span>
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        {!geoSettled && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-gray-950 transition-colors">
            <div className="text-center">
              <Navigation2 className="w-8 h-8 text-orange-500 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">{t('locating')}</p>
            </div>
          </div>
        )}

        {geoSettled && searchCenter && (
          <MapContainer
            center={[searchCenter.lat, searchCenter.lng]}
            zoom={zoomForRadius(radius)}
            ref={mapRef}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            <MapEvents onMoveEnd={onMoveEnd} />

            {/* Zona de búsqueda configurable — HU16. Fija en la ubicación real
                (activeLocation), no en searchCenter (que sigue al arrastre del mapa). */}
            {activeLocation && (
              <Circle
                center={[activeLocation.lat, activeLocation.lng]}
                radius={radius * 1000}
                pathOptions={{ color: '#3b82f6', weight: 1.5, fillColor: '#93c5fd', fillOpacity: 0.15 }}
              />
            )}

            {activeLocation && (
              <Marker position={[activeLocation.lat, activeLocation.lng]} icon={userIcon}>
                <Popup>{t('youAreHere')}</Popup>
              </Marker>
            )}

            {restaurants.map((r) => {
              const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.latitud},${r.longitud}`;
              const wazeUrl  = `https://waze.com/ul?ll=${r.latitud},${r.longitud}&navigate=yes`;
              return (
                <Marker key={r.id} position={[r.latitud, r.longitud]} icon={restaurantIcon}>
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-bold text-gray-900 mb-1">{r.nombre}</p>
                      <div className="mb-1"><Stars value={r.calificacion} /></div>
                      {r.direccion && (
                        <p className="text-xs text-gray-500 mb-2 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-orange-500" />
                          {r.direccion}
                        </p>
                      )}
                      <button
                        onClick={() => onSelectRestaurant?.(r)}
                        className="w-full text-xs py-1.5 mb-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer font-medium"
                      >
                        {t('viewDetail')}
                      </button>
                      <div className="flex gap-1.5">
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition cursor-pointer font-medium"
                        >
                          {t('directions')}
                        </a>
                        <a
                          href={wazeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition cursor-pointer font-medium"
                        >
                          Waze
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* Overlay de carga tras arrastre */}
        {geoSettled && loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-full px-4 py-1.5 shadow-md text-sm text-orange-600 dark:text-orange-400">
            <Navigation2 className="w-3.5 h-3.5 animate-pulse" />
            {t('updating')}
          </div>
        )}

        {/* Error de red */}
        {geoSettled && !loading && error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full px-4 py-1.5 shadow-md text-sm text-red-600 dark:text-red-400">
            {t('fetchError')}
          </div>
        )}

        {/* Zona sin restaurantes */}
        {geoSettled && !loading && !error && searchCenter && restaurants.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 shadow-md text-sm text-gray-600 dark:text-gray-300">
            {t('noResultsInArea')}
          </div>
        )}
      </div>
    </div>
  );
}
