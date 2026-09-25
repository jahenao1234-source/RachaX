import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { THEMES, AcentoTheme, AparienciaTheme } from '../types';

const STORAGE_NOMBRE_KEY = 'racha_nombre';
const STORAGE_ACENTO_KEY = 'racha_acento';
const STORAGE_APARIENCIA_KEY = 'racha_apariencia';

export function applyApariencia(apariencia: AparienciaTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  const isDark = 
    apariencia === 'oscuro' || 
    (apariencia === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function applyAcento(acento: AcentoTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-acento', acento);
}

interface ThemeContextType {
  nombre: string;
  setNombre: (n: string) => void;
  acento: AcentoTheme;
  setAcento: (a: AcentoTheme) => void;
  apariencia: AparienciaTheme;
  setApariencia: (a: AparienciaTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nombre, setNombreState] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_NOMBRE_KEY) || ''; } catch { return ''; }
  });

  const [acento, setAcentoState] = useState<AcentoTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACENTO_KEY) as AcentoTheme;
      if (stored && THEMES.some(t => t.key === stored)) return stored;
    } catch {}
    return 'ambar';
  });

  const [apariencia, setAparienciaState] = useState<AparienciaTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_APARIENCIA_KEY) as AparienciaTheme;
      if (stored === 'auto' || stored === 'claro' || stored === 'oscuro') return stored;
    } catch {}
    return 'auto';
  });

  // Listen to external storage changes (like import/reset from HabitContext)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedNombre = localStorage.getItem(STORAGE_NOMBRE_KEY) || '';
        const storedAcento = (localStorage.getItem(STORAGE_ACENTO_KEY) || 'ambar') as AcentoTheme;
        const storedApariencia = (localStorage.getItem(STORAGE_APARIENCIA_KEY) || 'auto') as AparienciaTheme;
        
        setNombreState(storedNombre);
        
        if (THEMES.some(t => t.key === storedAcento)) {
          setAcentoState(storedAcento);
        }
        
        if (['auto', 'claro', 'oscuro'].includes(storedApariencia)) {
          setAparienciaState(storedApariencia);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('racha_sync_theme', handleStorageChange); // Custom event for in-app sync
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('racha_sync_theme', handleStorageChange);
    };
  }, []);

  const setNombre = (nuevo: string) => {
    setNombreState(nuevo);
    try { localStorage.setItem(STORAGE_NOMBRE_KEY, nuevo); } catch {}
  };

  const setAcento = (nuevo: AcentoTheme) => {
    const themeDef = THEMES.find(t => t.key === nuevo);
    if (!themeDef) return;
    if (themeDef.nivel > 0) {
      let ganados: string[] = [];
      try {
        const stored = localStorage.getItem('racha_colores_ganados');
        if (stored) ganados = JSON.parse(stored);
      } catch {}
      if (!ganados.includes(nuevo)) return; // No está ganado
    }

    setAcentoState(nuevo);
    try { localStorage.setItem(STORAGE_ACENTO_KEY, nuevo); } catch {}
    applyAcento(nuevo);
  };

  const setApariencia = (nueva: AparienciaTheme) => {
    setAparienciaState(nueva);
    try { localStorage.setItem(STORAGE_APARIENCIA_KEY, nueva); } catch {}
    applyApariencia(nueva);
  };

  // Sync to DOM when mounted and on changes
  useEffect(() => {
    applyAcento(acento);
  }, [acento]);

  useEffect(() => {
    applyApariencia(apariencia);
    
    if (apariencia === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyApariencia('auto');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [apariencia]);

  return (
    <ThemeContext.Provider value={{ nombre, setNombre, acento, setAcento, apariencia, setApariencia }}>
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
