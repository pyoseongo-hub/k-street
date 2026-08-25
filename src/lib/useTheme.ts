import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('k-street-theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', t);
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('k-street-theme', t);
    applyTheme(t);
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const getIcon = () => {
    if (theme === 'dark') return '🌙';
    if (theme === 'light') return '☀️';
    return '🔄';
  };

  return { theme, setTheme, toggleTheme, getIcon, isClient };
}
