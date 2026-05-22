import { X } from 'lucide-react';
import { useAmenidades } from '../hooks/useAmenidades';

// Emojis por slug para no depender de Lucide para cada amenidad
const EMOJI = {
  'wifi':             '📶',
  'terraza':          '🌿',
  'estacionamiento':  '🅿️',
  'aire-acond':       '❄️',
  'pet-friendly':     '🐾',
  'reservas':         '📅',
  'delivery':         '🛵',
  'para-llevar':      '🛍️',
  'acceso-discap':    '♿',
  'vista-panoramica': '🏔️',
};

// T01 + T02 HU05: chips de amenidades con indicador visual de filtros activos
export default function AmenityFilter({ selected, onChange }) {
  const { amenidades, loading } = useAmenidades();

  if (loading || amenidades.length === 0) return null;

  function toggle(slug) {
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug]
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Filtrar por amenidades</span>

        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 cursor-pointer transition"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
            <span className="bg-orange-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold ml-0.5">
              {selected.length}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {amenidades.map((a) => {
          const isSelected = selected.includes(a.slug);
          return (
            <button
              key={a.slug}
              onClick={() => toggle(a.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer select-none ${
                isSelected
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <span>{EMOJI[a.slug] ?? '•'}</span>
              {a.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
