import { useState } from 'react';
import { MapPin, Heart } from 'lucide-react';

const DEFAULT_IMG = 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';

function Stars({ value }) {
  const rating = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-600 ml-0.5">
        {rating > 0 ? rating.toFixed(1) : 'Sin puntuación'}
      </span>
    </div>
  );
}

// T01: tarjeta de restaurante — imagen, nombre, calificación (estrellas), ubicación
export default function RestaurantCard({ restaurant, onClick, isFavorite = false, onToggleFavorite, isAuthenticated = false, onGoLogin }) {
  const { nombre, imagen_url, calificacion, ciudad, tipo_comida } = restaurant;
  const [loaded, setLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);

  function handleHeartClick(e) {
    e.stopPropagation();
    if (!isAuthenticated) {
      onGoLogin?.();
      return;
    }
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    onToggleFavorite?.(restaurant.id);
  }

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
      onClick={() => onClick(restaurant)}
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imagen_url || DEFAULT_IMG}
          alt={nombre}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMG;
            setLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />

        {/* Botón corazón — HU10-T01/T02 */}
        <button
          onClick={handleHeartClick}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full shadow-md
            transition-all duration-200 cursor-pointer
            ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-white/90 hover:bg-white'}
            ${animating ? 'scale-125' : 'scale-100'}`}
        >
          <Heart
            fill={isFavorite ? 'currentColor' : 'none'}
            className={`w-4 h-4 transition-colors duration-200 ${isFavorite ? 'text-white' : 'text-gray-500'}`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{nombre}</h3>

        {tipo_comida && (
          <p className="text-xs text-orange-600 bg-orange-50 inline-block rounded-full px-2 py-0.5 mb-2 font-medium">
            {tipo_comida}
          </p>
        )}

        {/* Calificación */}
        <div className="mb-2">
          <Stars value={calificacion} />
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="truncate">{ciudad || 'Ubicación no disponible'}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm cursor-pointer">
          Ver Detalle →
        </button>
      </div>
    </div>
  );
}
