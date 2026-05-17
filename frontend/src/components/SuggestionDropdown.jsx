import { highlightText } from '../utils/highlight';

// T02: dropdown de sugerencias con máximo 5 resultados
export default function SuggestionDropdown({ suggestions, query, onSelect }) {
  return (
    <ul className="suggestion-dropdown">
      {suggestions.map((item) => (
        <li
          key={item.id}
          className="suggestion-item"
          onMouseDown={() => onSelect(item)}
        >
          <span className="suggestion-nombre">
            {highlightText(item.nombre, query)}
          </span>
          <span className="suggestion-meta">
            {item.tipo_comida} · {item.categoria}
          </span>
        </li>
      ))}
    </ul>
  );
}
