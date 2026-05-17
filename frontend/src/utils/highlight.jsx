// T03: resalta coincidencias del texto buscado
export function highlightText(text, query) {
  if (!query || !text) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex   = new RegExp(`(${escaped})`, 'gi');
  const parts   = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-yellow-200 font-bold rounded-sm px-0.5">{part}</mark>
      : part
  );
}
