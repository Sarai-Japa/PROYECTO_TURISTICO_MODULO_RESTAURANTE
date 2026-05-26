import { Utensils } from 'lucide-react';
import { highlightText } from '../utils/highlight';

// T03: tarjetas de resultado con coincidencias resaltadas — diseño del prototipo
export default function SearchResults({ results, query, highlight = true, onClear }) {
  if (!query) return null;

  if (results.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500 text-lg mb-2">
          No encontramos restaurantes que coincidan con tu búsqueda
        </p>
        <p className="text-gray-400 text-sm mb-6">
          Intenta con otro término
        </p>
        <button
          onClick={onClear}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
        >
          Limpiar búsqueda
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-4">
        {results.length} restaurante{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
          >
            {/* Imagen */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
              {item.imagen_url ? (
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Utensils className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {highlight ? highlightText(item.nombre, query) : item.nombre}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                <span className="inline-block bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-xs font-medium mr-1">
                  {highlight ? highlightText(item.tipo_comida, query) : item.tipo_comida}
                </span>
                <span className="inline-block bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
                  {highlight ? highlightText(item.categoria, query) : item.categoria}
                </span>
              </p>
              {item.descripcion && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.descripcion}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
