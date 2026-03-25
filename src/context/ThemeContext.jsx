import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('erp_theme_mode');
    return saved ? saved === 'dark' : false;
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('erp_primary_color') || 'green'; // 'green', 'emerald', 'teal'
  });

  const colorPalettes = {
    green: { light: '#a3e635', DEFAULT: '#65a30d', dark: '#3f6212' },
    emerald: { light: '#34d399', DEFAULT: '#10b981', dark: '#047857' },
    teal: { light: '#2dd4bf', DEFAULT: '#14b8a6', dark: '#0f766e' },
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('erp_theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('erp_theme_mode', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    const palette = colorPalettes[primaryColor] || colorPalettes.green;
    root.style.setProperty('--color-primary-light', palette.light);
    root.style.setProperty('--color-primary', palette.DEFAULT);
    root.style.setProperty('--color-primary-dark', palette.dark);
    localStorage.setItem('erp_primary_color', primaryColor);
  }, [primaryColor]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const changePalette = (colorName) => setPrimaryColor(colorName);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, primaryColor, changePalette, colorPalettes }}>
      {children}
    </ThemeContext.Provider>
  );
};
