import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-900/50 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer group flex items-center justify-center"
      title={isDark ? 'Cambiar a modo día' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo día' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun Icon (Visible in dark mode, slides/spins up) */}
        <Sun
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 transform
            ${isDark 
              ? 'translate-y-0 rotate-0 opacity-100 scale-100' 
              : 'translate-y-6 rotate-45 opacity-0 scale-50'}`}
        />
        {/* Moon Icon (Visible in light mode, slides/spins down) */}
        <Moon
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 transform
            ${isDark 
              ? '-translate-y-6 -rotate-45 opacity-0 scale-50' 
              : 'translate-y-0 rotate-0 opacity-100 scale-100'}`}
        />
      </div>
    </button>
  );
}
