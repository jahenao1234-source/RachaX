import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { THEMES, AccentTheme } from '../types';

const STORAGE_THEME_KEY = 'racha_tema';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function applyThemeVariables(themeKey: string) {
  if (typeof document === 'undefined') return;
  const theme = THEMES.find((t) => t.key === themeKey) || THEMES[0];
  const root = document.documentElement;
  const { r, g, b } = hexToRgb(theme.accent);

  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-hover', theme.accentHover);
  root.style.setProperty('--accent-deep', theme.accentDeep);
  root.style.setProperty('--accent-10', `rgba(${r}, ${g}, ${b}, 0.10)`);
  root.style.setProperty('--accent-15', `rgba(${r}, ${g}, ${b}, 0.15)`);
  root.style.setProperty('--accent-20', `rgba(${r}, ${g}, ${b}, 0.20)`);
  root.style.setProperty('--accent-25', `rgba(${r}, ${g}, ${b}, 0.25)`);
  root.style.setProperty('--accent-30', `rgba(${r}, ${g}, ${b}, 0.30)`);
  root.style.setProperty('--accent-40', `rgba(${r}, ${g}, ${b}, 0.40)`);
  root.style.setProperty('--accent-50', `rgba(${r}, ${g}, ${b}, 0.50)`);
  root.style.setProperty('--accent-55', `rgba(${r}, ${g}, ${b}, 0.55)`);
  root.style.setProperty('--accent-60', `rgba(${r}, ${g}, ${b}, 0.60)`);
  root.style.setProperty('--accent-70', `rgba(${r}, ${g}, ${b}, 0.70)`);
  root.style.setProperty('--accent-80', `rgba(${r}, ${g}, ${b}, 0.80)`);
}

interface ThemeContextType {
  tema: string;
  setTema: (temaKey: string) => void;
  temaActual: AccentTheme;
  THEMES: AccentTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tema, setTemaState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_THEME_KEY);
      if (stored && THEMES.some((t) => t.key === stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('Error cargando tema:', e);
    }
    return 'violeta';
  });

  const setTema = (nuevoTema: string) => {
    const validTheme = THEMES.some((t) => t.key === nuevoTema) ? nuevoTema : 'violeta';
    setTemaState(validTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, validTheme);
    } catch (e) {
      console.warn('Error guardando tema:', e);
    }
    applyThemeVariables(validTheme);
  };

  useEffect(() => {
    applyThemeVariables(tema);
  }, [tema]);

  const temaActual = THEMES.find((t) => t.key === tema) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ tema, setTema, temaActual, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
