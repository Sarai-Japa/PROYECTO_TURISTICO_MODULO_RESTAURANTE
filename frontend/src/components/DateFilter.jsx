import { Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatLocaleDateLong } from '../i18n/formatLocaleDate';

// T06: usa America/Lima para que min= coincida con la validación del backend
function todayLima() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

export default function DateFilter({ selected, onChange }) {
  const { t, i18n } = useTranslation('restaurants');
  const today = todayLima();

  if (selected) {
    return (
      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
        <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
        <span className="text-sm text-orange-700 font-medium">{formatLocaleDateLong(selected, i18n.language)}</span>
        <button
          onClick={() => onChange(null)}
          className="text-orange-400 hover:text-orange-600 cursor-pointer transition"
          aria-label={t('filters.removeDate')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="date"
        min={today}
        value=""
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
      />
    </div>
  );
}
