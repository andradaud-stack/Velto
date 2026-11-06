import React, { createContext, useContext, useEffect, useState } from 'react';
import { prefsHelper } from '../data/db/prefsHelper';
import { notificationService } from '../data/services/notificationService';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load persisted theme preference from IndexedDB or localStorage
    const savedTheme = localStorage.getItem('velto_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      prefsHelper.get('theme', 'lavender').then(themeVal => {
        if (themeVal === 'dark') {
          setIsDark(true);
          document.documentElement.classList.add('dark');
        }
      });
    }
  }, []);

  const toggleTheme = async () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('velto_theme', 'dark');
      await prefsHelper.set('theme', 'dark');
      notificationService.success('Tema Gelap (Dark Mode) aktif ✨', 'Mode Tampilan');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('velto_theme', 'light');
      await prefsHelper.set('theme', 'lavender');
      notificationService.info('Tema Terang (FinBank Lavender) aktif ☀️', 'Mode Tampilan');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { isDark: false, toggleTheme: () => {} };
  }
  return context;
}
