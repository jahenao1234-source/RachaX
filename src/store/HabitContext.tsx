import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { TabRoute, Habito, Registro, MomentoDia, Rutina, FocusTarget, Tarea, Subtarea, COLOR_POR_MOMENTO, Premio, RetoSemanal } from '../types';
import {
  getTodayString,
  isHabitScheduledForDate,
  isHabitCompletedOnDate,
  calcularRachaActual,
  calcularMejorRacha,
  calcularRachaGlobal,
  esTareaCompletada,
  toggleSubtareaEnArbol,
  limpiarArbolSubtareas,
  calcularPuntosTotales,
  calcularNivel,
  calcularProgresoNivel,
  etapaDeNivel
} from '../utils/habitUtils';
import { evaluarRetoSemanal, generarOpcionesReto, getLunesActual } from '../utils/retoSemanal';
import { InsigniaDef, calcularInsignias } from '../utils/badgeUtils';

const STORAGE_HABITOS_KEY = 'racha_habitos';
const STORAGE_REGISTROS_KEY = 'racha_registros';
const STORAGE_ONBOARDING_KEY = 'racha_onboarding';
const STORAGE_ORDEN_MOMENTOS_KEY = 'racha_orden_momentos';
const STORAGE_COMODINES_KEY = 'racha_comodines';
const STORAGE_CONGELADOS_KEY = 'racha_dias_congelados';
const STORAGE_COMODINES_MES_KEY = 'racha_comodines_mes';
const STORAGE_RUTINAS_KEY = 'racha_rutinas';
const STORAGE_TAREAS_KEY = 'racha_tareas';
const STORAGE_PREMIOS_KEY = 'racha_premios';
const STORAGE_CAJAS_KEY = 'racha_cajas';
const STORAGE_RETO_SEMANAL_KEY = 'racha_reto_semanal';
const COMODINES_MAX = 3;

interface HabitContextType {
  // Onboarding
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  completeOnboarding: () => void;

  // Navigation
  activeTab: TabRoute;
  setActiveTab: (tab: TabRoute) => void;
  navigateToTab: (tab: TabRoute) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;

  // Rutinas & Creation Menu
  rutinas: Rutina[];
  crearRutina: (nueva: Omit<Rutina, 'id' | 'creadoEn'>) => void;
  editarRutina: (id: string, updates: Partial<Rutina>) => void;
  eliminarRutina: (id: string) => void;
  isCreateMenuOpen: boolean;
  openCreateMenu: () => void;
  closeCreateMenu: () => void;
  isRutinaEditorOpen: boolean;
  rutinaBeingEdited: Rutina | null;
  openRutinaEditor: (rutina?: Rutina | null) => void;
  closeRutinaEditor: () => void;

  // Tareas
  tareas: Tarea[];
  crearTarea: (nueva: Omit<Tarea, 'id' | 'creadoEn' | 'completada'>) => void;
  editarTarea: (id: string, updates: Partial<Tarea>) => void;
  eliminarTarea: (id: string) => void;
  toggleSubtarea: (tareaId: string, subtareaId: string) => void;
  isTareaEditorOpen: boolean;
  tareaBeingEdited: Tarea | null;
  openTareaEditor: (tarea?: Tarea | null) => void;
  closeTareaEditor: () => void;

  // Habit Detail & Edit Navigation
  selectedHabitIdForDetail: string | null;
  openHabitDetail: (habitId: string) => void;
  closeHabitDetail: () => void;
  habitBeingEdited: Habito | null;
  openEditHabit: (habit: Habito) => void;
  cancelEditHabit: () => void;
  habitoRecienCreadoId: string | null;
  setHabitoRecienCreadoId: (id: string | null) => void;

  // Quick Management
  isManageHabitsOpen: boolean;
  openManageHabits: () => void;
  closeManageHabits: () => void;

  // Focus Mode
  isFocusModeOpen: boolean;
  focusTarget: FocusTarget | null;
  openFocusMode: (target?: FocusTarget) => void;
  closeFocusMode: () => void;

  // Data
  habitos: Habito[];
  habitosActivos: Habito[];
  registros: Registro[];
  habitosDeHoy: Habito[];
  ordenMomentos: MomentoDia[];
  comodines: number;
  diasCongelados: string[];
  premios: Premio[];
  cajasPorAbrir: number;
  retoSemanal: RetoSemanal | null;
  insigniasGanadas: Record<string, string>;
  insignias: InsigniaDef[]

  // Computed globally
  puntosTotales: number;
  nivelActual: number;
  progresoNivel: { actual: number; meta: number };
  etapaLlama: number;

  // Actions
  crearHabito: (nuevo: Omit<Habito, 'id' | 'creadoEn'>) => Habito;
  editarHabito: (id: string, updates: Partial<Habito>) => void;
  eliminarHabito: (id: string) => void;
  archivarHabito: (id: string) => void;
  restaurarHabito: (id: string) => void;
  toggleCompletado: (habitoId: string, fecha?: string) => void;
  setValor: (habitoId: string, fecha: string, valor: number) => void;
  reiniciarTodo: () => void;
  importarDatos: (datos: {
    habitos: Habito[];
    registros: Registro[];
    rutinas?: Rutina[];
    tareas?: Tarea[];
    comodines?: number;
    diasCongelados?: string[];
    ordenMomentos?: MomentoDia[];
    premios?: Premio[];
    cajasPorAbrir?: number;
    retoSemanal?: RetoSemanal | null;
    insigniasGanadas?: Record<string, string>;
    nombre?: string;
    acento?: string;
    apariencia?: string;
  }) => { success: boolean; error?: string };
  exportarDatos: () => void;
  reordenarSecciones: (nuevoOrden: MomentoDia[]) => void;
  reordenarHabitosEnMomento: (momento: MomentoDia, idsOrdenados: string[]) => void;
  reordenarRutinas: (idsOrdenados: string[]) => void;
  reordenarTareas: (idsOrdenados: string[]) => void;
  congelarDia: (fecha: string) => void;
  descongelarDia: (fecha: string) => void;
  agregarPremio: (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number; tipo?: 'reto_semanal' | 'reto_habito' | 'insignia' | 'caja'; meta?: number }) => void;
  sumarCajas: (n: number) => void;
  sumarComodines: (n: number) => void;
  setRetoSemanal: (reto: RetoSemanal | null) => void;

  // Computed Utilities
  rachaActual: (habitoId: string) => number;
  mejorRacha: (habitoId: string) => number;
  mejorRachaGlobalHabitos: () => number;
  completadosHoy: () => number;
  progresoDelDia: (fecha?: string) => number;
  rachaGlobal: () => number;
  esHabitoCompletado: (habitoId: string, fecha?: string) => boolean;
  valorDe: (habitoId: string, fecha?: string) => number;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabRoute>('hoy');
  const [previousTab, setPreviousTab] = useState<TabRoute>('hoy');

  // Onboarding State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ONBOARDING_KEY);
      return stored !== 'true';
    } catch {
      return false;
    }
  });

  // Habit Detail & Edit Navigation
  const [selectedHabitIdForDetail, setSelectedHabitIdForDetail] = useState<string | null>(null);
  const [habitBeingEdited, setHabitBeingEdited] = useState<Habito | null>(null);
  const [habitoRecienCreadoId, setHabitoRecienCreadoId] = useState<string | null>(null);
  const [isManageHabitsOpen, setIsManageHabitsOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);

  const [rutinas, setRutinas] = useState<Rutina[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_RUTINAS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isRutinaEditorOpen, setIsRutinaEditorOpen] = useState(false);
  const [rutinaBeingEdited, setRutinaBeingEdited] = useState<Rutina | null>(null);

  const [tareas, setTareas] = useState<Tarea[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_TAREAS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [isTareaEditorOpen, setIsTareaEditorOpen] = useState(false);
  const [tareaBeingEdited, setTareaBeingEdited] = useState<Tarea | null>(null);

  const openFocusMode = (target: FocusTarget = { tipo: 'dia' }) => {
    setFocusTarget(target);
    setIsFocusModeOpen(true);
  };
  const closeFocusMode = () => setIsFocusModeOpen(false);

  // 1. Load habitos from localStorage
  const [habitos, setHabitos] = useState<Habito[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HABITOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((h: Habito, i: number) => ({ ...h, orden: typeof h.orden === 'number' ? h.orden : i }));
      }
    } catch (e) {
      console.warn('Error cargando hábitos desde localStorage:', e);
    }
    return [];
  });

  const habitosActivos = useMemo(() => habitos.filter((h) => !h.archivado), [habitos]);

  // 2. Load registros from localStorage
  const [registros, setRegistros] = useState<Registro[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REGISTROS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error cargando registros desde localStorage:', e);
    }
    return [];
  });

  const [ordenMomentos, setOrdenMomentos] = useState<MomentoDia[]>(() => {
    const base: MomentoDia[] = ['manana', 'tarde', 'noche', 'flexible'];
    try {
      const stored = localStorage.getItem(STORAGE_ORDEN_MOMENTOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MomentoDia[];
        return [...parsed.filter((m) => base.includes(m)), ...base.filter((m) => !parsed.includes(m))];
      }
    } catch {}
    return base;
  });

  const [comodines, setComodines] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COMODINES_KEY);
      if (stored !== null) return Math.max(0, Math.min(COMODINES_MAX, parseInt(stored) || 0));
    } catch {}
    return COMODINES_MAX;
  });

  const [diasCongelados, setDiasCongelados] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CONGELADOS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [premios, setPremios] = useState<Premio[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREMIOS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [cajasPorAbrir, setCajasPorAbrir] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CAJAS_KEY);
      if (stored !== null) return parseInt(stored) || 0;
    } catch {}
    return 0;
  });

  const [insigniasGanadas, setInsigniasGanadas] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('racha_insignias');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  const [retoSemanal, setRetoSemanalState] = useState<RetoSemanal | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_RETO_SEMANAL_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_ORDEN_MOMENTOS_KEY, JSON.stringify(ordenMomentos)); } catch {}
  }, [ordenMomentos]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_COMODINES_KEY, String(comodines)); } catch {}
  }, [comodines]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_CONGELADOS_KEY, JSON.stringify(diasCongelados)); } catch {}
  }, [diasCongelados]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_PREMIOS_KEY, JSON.stringify(premios)); } catch {}
  }, [premios]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_CAJAS_KEY, String(cajasPorAbrir)); } catch {}
  }, [cajasPorAbrir]);

  useEffect(() => {
    try {
      if (retoSemanal) localStorage.setItem(STORAGE_RETO_SEMANAL_KEY, JSON.stringify(retoSemanal));
      else localStorage.removeItem(STORAGE_RETO_SEMANAL_KEY);
    } catch {}
  }, [retoSemanal]);

  useEffect(() => {
    try {
      const mesActual = getTodayString().slice(0, 7); // "YYYY-MM"
      const mesGuardado = localStorage.getItem(STORAGE_COMODINES_MES_KEY);
      if (mesGuardado !== mesActual) {
        if (mesGuardado !== null) {
          setComodines((c) => Math.min(COMODINES_MAX, c + 1));
        }
        localStorage.setItem(STORAGE_COMODINES_MES_KEY, mesActual);
      }
    } catch {}
  }, []);

  // Persist habitos on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HABITOS_KEY, JSON.stringify(habitos));
    } catch (e) {
      console.error('Error guardando hábitos en localStorage:', e);
    }
  }, [habitos]);

  // Persist registros on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REGISTROS_KEY, JSON.stringify(registros));
    } catch (e) {
      console.error('Error guardando registros en localStorage:', e);
    }
  }, [registros]);

  // Persist rutinas on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RUTINAS_KEY, JSON.stringify(rutinas));
    } catch {}
  }, [rutinas]);

  // Persist tareas on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TAREAS_KEY, JSON.stringify(tareas));
    } catch {}
  }, [tareas]);

  // Navigation helpers
  const openOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem(STORAGE_ONBOARDING_KEY, 'true');
    } catch (e) {
      console.warn('Error guardando racha_onboarding:', e);
    }
    setIsOnboardingOpen(false);
    openCreateModal();
  };

  const openCreateModal = () => {
    setHabitBeingEdited(null);
    if (activeTab !== 'crear') {
      setPreviousTab(activeTab);
    }
    setActiveTab('crear');
  };

  const closeCreateModal = () => {
    setHabitBeingEdited(null);
    setActiveTab(previousTab || 'hoy');
  };

  const navigateToTab = (tab: TabRoute) => {
    setHabitBeingEdited(null);
    setSelectedHabitIdForDetail(null);
    setActiveTab(tab);
  };

  const openHabitDetail = (habitId: string) => {
    setSelectedHabitIdForDetail(habitId);
  };

  const closeHabitDetail = () => {
    setSelectedHabitIdForDetail(null);
  };

  const openEditHabit = (habit: Habito) => {
    setHabitBeingEdited(habit);
    setSelectedHabitIdForDetail(null); // cierra el detalle para que se vea el formulario de edición
    if (activeTab !== 'crear') {
      setPreviousTab(activeTab);
    }
    setActiveTab('crear');
  };

  const cancelEditHabit = () => {
    setHabitBeingEdited(null);
    setActiveTab(previousTab || 'hoy');
  };

  const openManageHabits = () => {
    setIsManageHabitsOpen(true);
  };

  const closeManageHabits = () => {
    setIsManageHabitsOpen(false);
  };

  // Action: Crear Hábito
  const crearHabito = (nuevo: Omit<Habito, 'id' | 'creadoEn'>): Habito => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const maxOrden = habitos.reduce((m, h) => Math.max(m, h.orden ?? 0), 0);
    const colorPorMomento = COLOR_POR_MOMENTO[nuevo.momento || 'flexible'];
    
    const nuevoHabito: Habito = {
      ...nuevo,
      color: colorPorMomento, // Force color based on moment
      id,
      orden: maxOrden + 1,
      creadoEn: new Date().toISOString(),
    };

    setHabitos((prev) => [nuevoHabito, ...prev]);
    return nuevoHabito;
  };

  // Action: Editar Hábito
  const editarHabito = (id: string, updates: Partial<Habito>) => {
    setHabitos((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const m = updates.momento || h.momento || 'flexible';
          const updatedColor = COLOR_POR_MOMENTO[m];
          return { ...h, ...updates, color: updatedColor };
        }
        return h;
      })
    );
  };

  // Action: Eliminar Hábito
  const eliminarHabito = (id: string) => {
    setHabitos((prev) => prev.filter((h) => h.id !== id));
    setRegistros((prev) => prev.filter((r) => r.habitoId !== id));
  };

  // Action: Toggle Completado
  const toggleCompletado = (habitoId: string, fecha = getTodayString()) => {
    setRegistros((prev) => {
      const existingIdx = prev.findIndex((r) => r.habitoId === habitoId && r.fecha === fecha);
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (existing.completado) {
          // Desmarcar
          return prev.filter((_, idx) => idx !== existingIdx);
        } else {
          // Marcar completado
          const updated = [...prev];
          updated[existingIdx] = { ...existing, completado: true };
          return updated;
        }
      } else {
        // Nuevo registro completado
        return [
          ...prev,
          {
            habitoId,
            fecha,
            completado: true,
          },
        ];
      }
    });
  };

  // Action: Set Valor para cuantificables
  const setValor = (habitoId: string, fecha: string, valor: number) => {
    setRegistros((prev) => {
      const existingIdx = prev.findIndex((r) => r.habitoId === habitoId && r.fecha === fecha);
      if (valor <= 0) {
        return existingIdx >= 0 ? prev.filter((_, idx) => idx !== existingIdx) : prev;
      }
      const habito = habitos.find((h) => h.id === habitoId);
      const isCompleted = habito?.metaDiaria ? valor >= habito.metaDiaria : valor > 0;
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], valor, completado: isCompleted };
        return updated;
      }
      return [...prev, { habitoId, fecha, valor, completado: isCompleted }];
    });
  };

  const reiniciarTodo = () => {
    setHabitos([]);
    setRegistros([]);
    setRutinas([]);
    setTareas([]);
    localStorage.removeItem(STORAGE_HABITOS_KEY);
    localStorage.removeItem(STORAGE_REGISTROS_KEY);
    localStorage.removeItem(STORAGE_RUTINAS_KEY);
    localStorage.removeItem(STORAGE_TAREAS_KEY);
    localStorage.removeItem(STORAGE_ORDEN_MOMENTOS_KEY);
    localStorage.removeItem('racha_unlocked_badges');
    localStorage.removeItem('racha_secciones_momento');
    localStorage.removeItem(STORAGE_COMODINES_KEY);
    localStorage.removeItem(STORAGE_CONGELADOS_KEY);
    localStorage.removeItem(STORAGE_COMODINES_MES_KEY);
    localStorage.removeItem(STORAGE_PREMIOS_KEY);
    premiosEntregados.current.clear();
    localStorage.removeItem(STORAGE_CAJAS_KEY);
    localStorage.removeItem(STORAGE_RETO_SEMANAL_KEY);
    localStorage.removeItem('racha_insignias');
    localStorage.removeItem('racha_nombre');
    localStorage.removeItem('racha_acento');
    localStorage.removeItem('racha_apariencia');
    window.dispatchEvent(new Event('racha_sync_theme'));
  };

  // Action: Exportar datos como JSON
  const exportarDatos = () => {
    try {
      const exportObject = {
        app: 'Racha',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        habitos,
        registros,
        rutinas,
        tareas,
        comodines,
        diasCongelados,
        ordenMomentos,
        premios,
        cajasPorAbrir,
        retoSemanal,
        insigniasGanadas,
        nombre: localStorage.getItem('racha_nombre') || '',
        acento: localStorage.getItem('racha_acento') || 'ambar',
        apariencia: localStorage.getItem('racha_apariencia') || 'auto',
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = getTodayString();
      localStorage.setItem('racha_ultima_copia', dateStr);
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `racha-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Error al exportar datos:', err);
    }
  };

  // Action: Importar datos desde JSON
  const importarDatos = (datos: {
    habitos: Habito[];
    registros: Registro[];
    rutinas?: Rutina[];
    tareas?: Tarea[];
    comodines?: number;
    diasCongelados?: string[];
    ordenMomentos?: MomentoDia[];
    premios?: Premio[];
    cajasPorAbrir?: number;
    retoSemanal?: RetoSemanal | null;
    insigniasGanadas?: Record<string, string>;
    nombre?: string;
    acento?: string;
    apariencia?: string;
  }): { success: boolean; error?: string } => {
    try {
      if (!datos || !Array.isArray(datos.habitos) || !Array.isArray(datos.registros)) {
        return { success: false, error: 'El archivo no contiene las listas requeridas de hábitos o registros.' };
      }

      // Validar estructura básica de hábitos
      const habitosValidos = datos.habitos.every(
        (h) => h && typeof h.id === 'string' && typeof h.nombre === 'string' && typeof h.color === 'string'
      );

      if (!habitosValidos) {
        return { success: false, error: 'Algunos hábitos no tienen la estructura correcta.' };
      }

      // Validar estructura básica de registros
      const registrosValidos = datos.registros.every(
        (r) => r && typeof r.habitoId === 'string' && typeof r.fecha === 'string'
      );

      if (!registrosValidos) {
        return { success: false, error: 'Algunos registros no tienen el formato esperado.' };
      }

      setHabitos(datos.habitos);
      setRegistros(datos.registros);
      if (Array.isArray(datos.rutinas)) setRutinas(datos.rutinas);
      if (Array.isArray(datos.tareas)) setTareas(datos.tareas);
      if (typeof datos.comodines === 'number') setComodines(Math.max(0, Math.min(COMODINES_MAX, datos.comodines)));
      if (Array.isArray(datos.diasCongelados)) setDiasCongelados(datos.diasCongelados);
      if (Array.isArray(datos.ordenMomentos)) setOrdenMomentos(datos.ordenMomentos);
      if (Array.isArray(datos.premios)) {
        setPremios(datos.premios);
        premiosEntregados.current = new Set(datos.premios.map((p) => p.clave).filter((c): c is string => !!c));
      }
      if (typeof datos.cajasPorAbrir === 'number') setCajasPorAbrir(datos.cajasPorAbrir);
      if (datos.insigniasGanadas && typeof datos.insigniasGanadas === 'object') setInsigniasGanadas(datos.insigniasGanadas);
      if (datos.retoSemanal !== undefined) setRetoSemanalState(datos.retoSemanal);

      if (typeof datos.nombre === 'string') localStorage.setItem('racha_nombre', datos.nombre);
      if (typeof datos.acento === 'string') localStorage.setItem('racha_acento', datos.acento);
      if (typeof datos.apariencia === 'string') localStorage.setItem('racha_apariencia', datos.apariencia);
      
      window.dispatchEvent(new Event('racha_sync_theme'));

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Ocurrió un error al procesar el archivo.' };
    }
  };

  // Computed: Hábitos de hoy
  const hoyStr = getTodayString();
  const habitosDeHoy = useMemo(() => {
    return habitosActivos.filter((h) => isHabitScheduledForDate(h, hoyStr));
  }, [habitosActivos, hoyStr]);

  // Computed: Racha actual de un hábito
  const rachaActual = (habitoId: string): number => {
    const habito = habitos.find((h) => h.id === habitoId);
    if (!habito) return 0;
    return calcularRachaActual(habito, registros, hoyStr, diasCongelados);
  };

  // Computed: Mejor racha histórica
  const mejorRacha = (habitoId: string): number => {
    const habito = habitos.find((h) => h.id === habitoId);
    if (!habito) return 0;
    return calcularMejorRacha(habito, registros, diasCongelados);
  };

  // Computed: Mejor racha de todos los hábitos activos
  const mejorRachaGlobalHabitos = (): number => {
    if (habitosActivos.length === 0) return 0;
    let max = 0;
    for (const h of habitosActivos) {
      const best = calcularMejorRacha(h, registros, diasCongelados);
      const curr = calcularRachaActual(h, registros, hoyStr, diasCongelados);
      if (best > max) max = best;
      if (curr > max) max = curr;
    }
    return max;
  };

  // Computed: Es completado en una fecha
  const esHabitoCompletado = (habitoId: string, fecha = hoyStr): boolean => {
    return isHabitCompletedOnDate(habitoId, fecha, registros);
  };

  const valorDe = (habitoId: string, fecha = hoyStr): number => {
    const reg = registros.find((r) => r.habitoId === habitoId && r.fecha === fecha);
    return reg?.valor ?? 0;
  };

  // Computed: Total completados hoy
  const completadosHoy = (): number => {
    return habitosDeHoy.filter((h) => esHabitoCompletado(h.id, hoyStr)).length;
  };

  // Computed: Porcentaje de progreso del día
  const progresoDelDia = (fecha = hoyStr): number => {
    const programados = habitosActivos.filter((h) => isHabitScheduledForDate(h, fecha));
    if (programados.length === 0) return 0;
    const completados = programados.filter((h) => isHabitCompletedOnDate(h.id, fecha, registros)).length;
    return Math.round((completados / programados.length) * 100);
  };

  // Computed: Racha global de días al 100%
  const rachaGlobal = (): number => {
    return calcularRachaGlobal(habitosActivos, registros, hoyStr, diasCongelados);
  };

  // Computed: Insignias
  const insignias = useMemo(() => {
    return calcularInsignias(habitos, registros, premios, diasCongelados, insigniasGanadas);
  }, [habitos, registros, premios, diasCongelados, insigniasGanadas]);

  useEffect(() => {
    try { localStorage.setItem('racha_insignias', JSON.stringify(insigniasGanadas)); } catch {}
  }, [insigniasGanadas]);

  useEffect(() => {
    let hasNew = false;
    const newGanadas = { ...insigniasGanadas };
    const today = getTodayString();
    
    insignias.forEach(ins => {
      if (ins.desbloqueada && !insigniasGanadas[ins.id]) {
        hasNew = true;
        newGanadas[ins.id] = today;
        agregarPremio(`Insignia ${ins.nombre}`, 0, `insignia:${ins.id}`, { cajas: 1, tipo: 'insignia' });
      }
    });

    if (hasNew) {
      setInsigniasGanadas(newGanadas);
    }
  }, [insignias, insigniasGanadas]);

  const reordenarSecciones = (nuevoOrden: MomentoDia[]) => setOrdenMomentos(nuevoOrden);

  const reordenarHabitosEnMomento = (momento: MomentoDia, idsOrdenados: string[]) => {
    setHabitos((prev) => prev.map((h) => {
      if ((h.momento || 'flexible') !== momento) return h;
      const idx = idsOrdenados.indexOf(h.id);
      return idx >= 0 ? { ...h, orden: idx } : h;
    }));
  };

  const archivarHabito = (id: string) => {
    setHabitos((prev) => prev.map((h) => (h.id === id ? { ...h, archivado: true } : h)));
  };

  const restaurarHabito = (id: string) => {
    setHabitos((prev) => prev.map((h) => (h.id === id ? { ...h, archivado: false } : h)));
  };

  const congelarDia = (fecha: string) => {
    if (comodines <= 0 || diasCongelados.includes(fecha)) return;
    setDiasCongelados((prev) => (prev.includes(fecha) ? prev : [...prev, fecha]));
    setComodines((c) => Math.max(0, c - 1));
  };

  const descongelarDia = (fecha: string) => {
    if (!diasCongelados.includes(fecha)) return;
    setDiasCongelados((prev) => prev.filter((d) => d !== fecha));
    setComodines((c) => Math.min(COMODINES_MAX, c + 1));
  };

  // Claves ya entregadas: se revisan de forma síncrona para que un efecto que corre
  // dos veces (StrictMode o renders seguidos) no duplique cajas ni comodines.
  const premiosEntregados = useRef<Set<string>>(new Set(premios.map(p => p.clave).filter((c): c is string => !!c)));

  const agregarPremio = (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number; tipo?: 'reto_semanal' | 'reto_habito' | 'insignia' | 'caja'; meta?: number }) => {
    if (clave) {
      if (premiosEntregados.current.has(clave)) return;
      premiosEntregados.current.add(clave);
    }
    setPremios(prev => [...prev, { fecha: getTodayString(), motivo, puntos, clave, tipo: extras?.tipo, meta: extras?.meta }]);
    if (extras?.comodines) setComodines(c => Math.min(COMODINES_MAX, c + extras.comodines!));
    if (extras?.cajas) setCajasPorAbrir(c => c + extras.cajas!);
  };

  const sumarCajas = (n: number) => {
    setCajasPorAbrir(prev => prev + n);
  };

  const sumarComodines = (n: number) => {
    setComodines(prev => Math.min(COMODINES_MAX, prev + n));
  };

  const setRetoSemanal = (reto: RetoSemanal | null) => {
    setRetoSemanalState(reto);
  };

  const crearRutina = (nueva: Omit<Rutina, 'id' | 'creadoEn'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `r_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setRutinas((prev) => [...prev, { ...nueva, id, creadoEn: new Date().toISOString() }]);
  };
  const editarRutina = (id: string, updates: Partial<Rutina>) => {
    setRutinas((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };
  const eliminarRutina = (id: string) => {
    setRutinas((prev) => prev.filter((r) => r.id !== id));
  };
  const reordenarRutinas = (idsOrdenados: string[]) => {
    setRutinas((prev) => {
      const byId = new Map(prev.map((r) => [r.id, r]));
      const ordenadas = idsOrdenados.map((id) => byId.get(id)).filter((r): r is Rutina => Boolean(r));
      const resto = prev.filter((r) => !idsOrdenados.includes(r.id));
      return [...ordenadas, ...resto];
    });
  };
  const reordenarTareas = (idsOrdenados: string[]) => {
    setTareas((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      const ordenadas = idsOrdenados.map((id) => byId.get(id)).filter((t): t is Tarea => Boolean(t));
      const resto = prev.filter((t) => !idsOrdenados.includes(t.id));
      return [...ordenadas, ...resto];
    });
  };
  const openCreateMenu = () => setIsCreateMenuOpen(true);
  const closeCreateMenu = () => setIsCreateMenuOpen(false);
  const openRutinaEditor = (rutina: Rutina | null = null) => { setRutinaBeingEdited(rutina); setIsRutinaEditorOpen(true); };
  const closeRutinaEditor = () => { setIsRutinaEditorOpen(false); setRutinaBeingEdited(null); };

  const _tareaCompletada = (subs: Subtarea[]) => esTareaCompletada(subs);

  const crearTarea = (nueva: Omit<Tarea, 'id' | 'creadoEn' | 'completada'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const subtareas = nueva.subtareas || [];
    setTareas((prev) => [...prev, { ...nueva, id, subtareas, completada: _tareaCompletada(subtareas), creadoEn: new Date().toISOString() }]);
  };
  const editarTarea = (id: string, updates: Partial<Tarea>) => {
    setTareas((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const merged = { ...t, ...updates };
      return { ...merged, completada: _tareaCompletada(merged.subtareas) };
    }));
  };
  const eliminarTarea = (id: string) => setTareas((prev) => prev.filter((t) => t.id !== id));
  const toggleSubtarea = (tareaId: string, subtareaId: string) => {
    setTareas((prev) => prev.map((t) => {
      if (t.id !== tareaId) return t;
      const subtareas = toggleSubtareaEnArbol(t.subtareas, subtareaId);
      return { ...t, subtareas, completada: _tareaCompletada(subtareas) };
    }));
  };
  const openTareaEditor = (tarea: Tarea | null = null) => { setTareaBeingEdited(tarea); setIsTareaEditorOpen(true); };
  const closeTareaEditor = () => { setIsTareaEditorOpen(false); setTareaBeingEdited(null); };

  // Calculated values
  const puntosTotales = useMemo(() => calcularPuntosTotales(registros, habitosActivos, premios, diasCongelados), [registros, habitosActivos, premios, diasCongelados]);
  const nivelActual = useMemo(() => calcularNivel(puntosTotales), [puntosTotales]);
  const progresoNivel = useMemo(() => calcularProgresoNivel(puntosTotales), [puntosTotales]);
  const etapaLlama = useMemo(() => etapaDeNivel(nivelActual), [nivelActual]);

  // Reto semanal evaluation & generation
  useEffect(() => {
    const currentToday = getTodayString();
    let currentReto = retoSemanal;
    let didUpdate = false;

    // 1. Evaluate current if accepted
    if (currentReto && currentReto.estado === 'aceptado') {
      const evaluado = evaluarRetoSemanal(currentReto, habitos, registros, currentToday);
      if (evaluado.estado !== currentReto.estado || evaluado.avance !== currentReto.avance) {
        currentReto = evaluado;
        didUpdate = true;
        if (evaluado.estado === 'cumplido') {
          agregarPremio('Reto de la semana', 50, `reto-semanal:${evaluado.id}`, { comodines: 1, cajas: 1, tipo: 'reto_semanal' });
        }
      }
    }

    // 2. Generate new if missing or outdated
    const lunesActual = getLunesActual(currentToday);
    if (!currentReto || currentReto.id !== lunesActual) {
      const nuevo = generarOpcionesReto(habitosActivos, registros, diasCongelados, currentToday, currentReto);
      if (nuevo) {
        currentReto = nuevo;
        didUpdate = true;
      }
    }

    if (didUpdate && currentReto) {
      setRetoSemanalState(currentReto);
    }
  }, [registros, habitos, retoSemanal, premios, habitosActivos, diasCongelados]);

  return (
    <HabitContext.Provider
      value={{
        isOnboardingOpen,
        openOnboarding,
        completeOnboarding,
        activeTab,
        setActiveTab,
        navigateToTab,
        openCreateModal,
        closeCreateModal,
        rutinas,
        crearRutina,
        editarRutina,
        eliminarRutina,
        isCreateMenuOpen,
        openCreateMenu,
        closeCreateMenu,
        isRutinaEditorOpen,
        rutinaBeingEdited,
        openRutinaEditor,
        closeRutinaEditor,
        tareas,
        crearTarea,
        editarTarea,
        eliminarTarea,
        toggleSubtarea,
        isTareaEditorOpen,
        tareaBeingEdited,
        openTareaEditor,
        closeTareaEditor,
        selectedHabitIdForDetail,
        openHabitDetail,
        closeHabitDetail,
        habitBeingEdited,
        openEditHabit,
        cancelEditHabit,
        habitoRecienCreadoId,
        setHabitoRecienCreadoId,
        isManageHabitsOpen,
        openManageHabits,
        closeManageHabits,
        isFocusModeOpen,
        focusTarget,
        openFocusMode,
        closeFocusMode,
        habitos,
        habitosActivos,
        registros,
        habitosDeHoy,
        ordenMomentos,
        comodines,
        diasCongelados,
        premios,
        cajasPorAbrir,
        retoSemanal,
        insignias,
        insigniasGanadas,
        puntosTotales,
        nivelActual,
        progresoNivel,
        etapaLlama,
        crearHabito,
        editarHabito,
        eliminarHabito,
        archivarHabito,
        restaurarHabito,
        toggleCompletado,
        setValor,
        reiniciarTodo,
        importarDatos,
        exportarDatos,
        reordenarSecciones,
        reordenarHabitosEnMomento,
        reordenarRutinas,
        reordenarTareas,
        congelarDia,
        descongelarDia,
        agregarPremio,
        sumarCajas,
        sumarComodines,
        setRetoSemanal,
        rachaActual,
        mejorRacha,
        mejorRachaGlobalHabitos,
        completadosHoy,
        progresoDelDia,
        rachaGlobal,
        esHabitoCompletado,
        valorDe,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabitStore = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabitStore debe ser usado dentro de un HabitProvider');
  }
  return context;
};
