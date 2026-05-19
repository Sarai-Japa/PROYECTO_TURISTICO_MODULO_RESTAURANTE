import { ArrowLeft, MapPin } from 'lucide-react';

const DEFAULT_IMG = 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop';

function Stars({ value }) {
  const rating = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <span className="text-2xl text-yellow-400">
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span className="text-xl font-bold text-gray-700 ml-1">
        {rating > 0 ? rating.toFixed(1) : 'Sin puntuación'}
      </span>
    </div>
  );
}

export default function RestaurantDetailPage({ restaurant, onBack }) {
  const { nombre, imagen_url, calificacion, ciudad, direccion, tipo_comida, categoria, descripcion } = restaurant;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-80 md:h-96">
        <img
          src={imagen_url || DEFAULT_IMG}
          alt={nombre}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = DEFAULT_IMG; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow transition font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{nombre}</h1>
        {tipo_comida && <p className="text-lg text-gray-500 mb-3">{tipo_comida}</p>}

        <Stars value={calificacion} />

        {/* Info */}
        <div className="mt-6 bg-gray-50 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {direccion && (
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Dirección</p>
                <p className="text-gray-700">{direccion}</p>
                {ciudad && <p className="text-gray-500 text-sm">{ciudad}</p>}
              </div>
            </div>
          )}
          {categoria && (
            <div className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">🍽️</span>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Categoría</p>
                <p className="text-gray-700">{categoria}</p>
              </div>
            </div>
          )}
        </div>

        {descripcion && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Acerca de</h2>
            <p className="text-gray-700 leading-relaxed">{descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
