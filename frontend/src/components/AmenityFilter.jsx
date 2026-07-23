import {
  Wifi, Sun, ParkingCircle, Wind, PawPrint,
  CalendarCheck, Bike, ShoppingBag, Accessibility, Mountain, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAmenidades } from '../hooks/useAmenidades';

const ICON = {
  'wifi':             Wifi,
  'terraza':          Sun,
  'estacionamiento':  ParkingCircle,
  'aire-acond':       Wind,
  'pet-friendly':     PawPrint,
  'reservas':         CalendarCheck,
  'delivery':         Bike,
  'para-llevar':      ShoppingBag,
  'acceso-discap':    Accessibility,
  'vista-panoramica': Mountain,
};

export default function AmenityFilter({ selected, onChange }) {
  const { amenidades, loading } = useAmenidades();
  const { t } = useTranslation('restaurants');

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
        <span className="text-sm font-medium text-gray-700">{t('filters.amenities')}</span>

        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 cursor-pointer transition"
          >
            <X className="w-3 h-3" />
            {t('filters.clear')}
            <span className="bg-orange-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold ml-0.5">
              {selected.length}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {amenidades.map((a) => {
          const isSelected = selected.includes(a.slug);
          const Icon = ICON[a.slug];
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
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {a.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
