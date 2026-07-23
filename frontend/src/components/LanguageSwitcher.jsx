import { Globe } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation('common');
  const next = language === 'es' ? 'en' : 'es';

  return (
    <button
      onClick={() => changeLanguage(next)}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition cursor-pointer"
      aria-label={t('language.switchTo', { lang: t(`language.${next}`) })}
      title={t(`language.${next}`)}
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase text-xs font-bold">{language}</span>
    </button>
  );
}
