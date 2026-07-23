import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('fh_theme');
    if (stored) return stored;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    console.log('ThemeContext useEffect triggered, theme:', theme);
    localStorage.setItem('fh_theme', theme);

    const html = document.documentElement;
    console.log('HTML element before:', html.className);

    if (theme === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
      console.log('Added dark class, className now:', html.className);
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
      console.log('Removed dark class, className now:', html.className);
    }

    console.log('Final HTML class:', document.documentElement.className);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const stored = localStorage.getItem('fh_theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}
