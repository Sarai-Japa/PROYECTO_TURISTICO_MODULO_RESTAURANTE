import { Calendar, X } from 'lucide-react';

const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d   = new Date(year, month - 1, day);
  const dow = DAYS_ES[d.getDay()];
  return `${dow.charAt(0).toUpperCase() + dow.slice(1)}, ${day} de ${MONTHS_ES[month - 1]}`;
}

// T06: usa America/Lima para que min= coincida con la validación del backend
function todayLima() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

// T01 + T02 HU03: selector de fecha con badge de fecha activa
export default function DateFilter({ selected, onChange }) {
  const today = todayLima();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex items-center">
        <Calendar className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="date"
          min={today}
          value={selected || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
        />
      </div>

      {selected && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm">
          <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-orange-700 font-medium">{formatDate(selected)}</span>
          <button
            onClick={() => onChange(null)}
            className="ml-1 text-orange-400 hover:text-orange-600 transition cursor-pointer"
            aria-label="Quitar filtro de fecha"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
