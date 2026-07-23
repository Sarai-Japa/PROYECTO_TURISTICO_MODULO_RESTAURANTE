export function formatLocaleDateLong(dateStr, lang = 'es') {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const locale = lang === 'en' ? 'en-US' : 'es-ES';
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatReviewDate(isoDateStr, lang = 'es') {
  const locale = lang === 'en' ? 'en-US' : 'es-ES';
  return new Date(isoDateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
