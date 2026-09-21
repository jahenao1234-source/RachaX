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

export function applyThemeVariables(themeKey: string | null) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  if (!themeKey) {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-hover');
    root.style.removeProperty('--accent-deep');
    root.style.removeProperty('--accent-10');
    root.style.removeProperty('--accent-15');
    root.style.removeProperty('--accent-20');
    root.style.removeProperty('--accent-25');
    root.style.removeProperty('--accent-30');
    root.style.removeProperty('--accent-40');
    root.style.removeProperty('--accent-50');
    root.style.removeProperty('--accent-55');
    root.style.removeProperty('--accent-60');
    root.style.removeProperty('--accent-70');
    root.style.removeProperty('--accent-80');
    return;
  }

  const theme = THEMES.find((t) => t.key === themeKey);
  if (!theme) return;
  
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
  tema: string | null;
  setTema: (temaKey: string | null) => void;
  temaActual: AccentTheme;
  THEMES: AccentTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tema, setTemaState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_THEME_KEY);
      if (stored && THEMES.some((t) => t.key === stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('Error cargando tema:', e);
    }
    return null;
  });

  const setTema = (nuevoTema: string | null) => {
    let validTheme = null;
    if (nuevoTema && THEMES.some((t) => t.key === nuevoTema)) {
      validTheme = nuevoTema;
    }
    setTemaState(validTheme);
    try {
      if (validTheme) {
        localStorage.setItem(STORAGE_THEME_KEY, validTheme);
      } else {
        localStorage.removeItem(STORAGE_THEME_KEY);
      }
    } catch (e) {
      console.warn('Error guardando tema:', e);
    }
    applyThemeVariables(validTheme);
  };

  useEffect(() => {
    applyThemeVariables(tema);
  }, [tema]);

  const temaActual = tema ? (THEMES.find((t) => t.key === tema) || THEMES.find((t) => t.key === 'ambar') || THEMES[0]) : (THEMES.find((t) => t.key === 'ambar') || THEMES[0]);

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
