import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('common');

  const handleClick = (e) => {
    e.preventDefault();
    console.log('Theme before:', theme);
    toggleTheme();
    console.log('Theme toggled');
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition cursor-pointer dark:text-gray-400 dark:hover:text-orange-400"
      aria-label={t('theme.switchTo', { mode: theme === 'dark' ? t('theme.light') : t('theme.dark') })}
      title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
