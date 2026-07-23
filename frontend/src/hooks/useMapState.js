import { useState, useRef, useCallback } from 'react';

// Tingo María, Perú — centro de respaldo si la geolocalización falla o se deniega
const DEFAULT_CENTER = { lat: -9.2956, lng: -76.0002 };

// HU16: estado del mapa vive en AppContent (no en MapPage) para sobrevivir
// al desmontaje de MapPage cuando se navega al detalle de un restaurante y se vuelve.
export function useMapState() {
  const [activeLocation, setActiveLocation] = useState(null);
  const [searchCenter, setSearchCenter]     = useState(null);
  const [radius, setRadius]                 = useState(5);
  const [geoDenied, setGeoDenied]           = useState(false);
  const [geoSettled, setGeoSettled]         = useState(false);

  const requested = useRef(false);

  // Idempotente: solo pide geolocalización la primera vez que se visita el mapa,
  // sin importar cuántas veces MapPage se monte/desmonte después.
  const ensureGeolocation = useCallback(() => {
    if (requested.current) return;
    requested.current = true;

    if (!navigator.geolocation) {
      console.warn('[HU16] navigator.geolocation no disponible en este navegador');
      setGeoDenied(true);
      setGeoSettled(true);
      setActiveLocation({ ...DEFAULT_CENTER, labelKey: 'defaultLocation' });
      setSearchCenter(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, labelKey: 'myLocation' };
        setActiveLocation(loc);
        setSearchCenter({ lat: loc.lat, lng: loc.lng });
        setGeoDenied(false);
        setGeoSettled(true);
      },
      (err) => {
        // code 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        console.warn(`[HU16] Geolocalización falló (code ${err.code}): ${err.message}`);
        setGeoDenied(true);
        setGeoSettled(true);
        setActiveLocation({ ...DEFAULT_CENTER, labelKey: 'defaultLocation' });
        setSearchCenter(DEFAULT_CENTER);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // HU13: centra el mapa en un restaurante específico (ej. "Ver en mapa" desde Favoritos)
  // sin disparar/perder el flujo de geolocalización.
  const focusOn = useCallback((lat, lng, label) => {
    requested.current = true;
    setGeoDenied(false);
    setGeoSettled(true);
    setActiveLocation({ lat, lng, label });
    setSearchCenter({ lat, lng });
  }, []);

  // Entrada "normal" al mapa (nav "Mapa"): siempre vuelve a pedir la
  // ubicación real del usuario, aunque antes se haya usado focusOn()
  // para centrar en un restaurante específico desde Favoritos.
  const goToMyLocation = useCallback(() => {
    requested.current = false;
    setGeoSettled(false);
    ensureGeolocation();
  }, [ensureGeolocation]);

  function handleLocationChange(loc) {
    setActiveLocation(loc);
    if (loc) {
      setSearchCenter({ lat: loc.lat, lng: loc.lng });
    }
  }

  function handleMoveEnd(newCenter) {
    setSearchCenter(newCenter);
  }

  return {
    activeLocation,
    searchCenter,
    radius,
    setRadius,
    geoDenied,
    geoSettled,
    ensureGeolocation,
    focusOn,
    goToMyLocation,
    handleLocationChange,
    handleMoveEnd,
  };
}
