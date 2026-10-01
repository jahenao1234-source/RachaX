import { tasaPeriodo } from '../utils/progresoUtils';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { TabRoute, Habito, Registro, MomentoDia, Rutina, FocusTarget, Tarea, Subtarea, COLOR_POR_MOMENTO, Premio, RetoSemanal, Compromiso, MomentoPlan } from '../types';
import {
  crearCompromiso as _crearCompromiso,
  editarCompromiso as _editarCompromiso,
  borrarCompromiso as _borrarCompromiso,
  marcarHecho as _marcarHecho,
  nuevoIdCompromiso,
  Alcance,
  CambiosCompromiso,
} from '../utils/compromisosUtils';
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
import {
  ponerFechaPaso as _ponerFechaPaso,
  agregarPaso as _agregarPaso,
  editarTextoPaso as _editarTextoPaso,
  borrarPaso as _borrarPaso,
  moverPaso as _moverPaso,
  reabrirArbol as _reabrirArbol,
  normalizarArbol as _normalizarArbol,
  nuevoIdPaso,
  DestinoPaso,
} from '../utils/tareasUtils';
import { evaluarRetoSemanal, generarOpcionesReto, getLunesActual } from '../utils/retoSemanal';
import { construirAgregado, ItemBiblioteca } from '../utils/bibliotecaUtils';
import { activarDificil, aplicarMinimos, comodinesAutomaticos, congelarVarios, limpiarMinimo, marcarHabito, pasarACompleto as registrosACompleto, puedeTenerMinimo, quitarDificil, recalcularConMeta, registroConValor } from '../utils/dificilUtils';
import { hastaOcultarConsejo, limpiarConsejosOcultos } from '../utils/consejosUtils';
import { SesionFoco, sanearSesiones } from '../utils/focoUtils';
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
const STORAGE_COMPROMISOS_KEY = 'racha_compromisos';
const STORAGE_CONSEJOS_OCULTOS_KEY = 'racha_consejos_ocultos';
const STORAGE_SESIONES_FOCO_KEY = 'racha_sesiones_foco';
const STORAGE_PREMIOS_KEY = 'racha_premios';
const STORAGE_CAJAS_KEY = 'racha_cajas';
const STORAGE_RETO_SEMANAL_KEY = 'racha_reto_semanal';
const STORAGE_DIFICILES_KEY = 'racha_dias_dificiles';
const STORAGE_COMODIN_AUTO_KEY = 'racha_comodin_auto';
const STORAGE_CONGELADOS_AUTO_KEY = 'racha_congelados_auto';
const STORAGE_AUTO_REVISADO_KEY = 'racha_comodin_auto_revisado';
const COMODINES_MAX = 3;
// Las 10 llamas raras (imágenes en public/llamas/raras/<id>.jpg)
const RARAS_IDS = ['cristal', 'galaxia', 'obsidiana', 'arcoiris', 'neon', 'magma', 'perla', 'rubi', 'sakura', 'espiritu'];

export type CajasResult = { cajas: number; puntos: number; raras: string[] };

interface HabitContextType {
  // Onboarding
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  completeOnboarding: () => void;

  // Navigation
  activeTab: TabRoute;
  setActiveTab: (tab: TabRoute) => void;
  navigateToTab: (tab: TabRoute) => void;
  /** Hoy › "Tareas de hoy": tocar un paso abre su tarea en Tareas (DESIGN.md › Foco 2). Tareas la abre al entrar y llama yaAbriTarea(). */
  tareaPorAbrir: string | null;
  abrirTareaEnLista: (tareaId: string) => void;
  yaAbriTarea: () => void;
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
  crearTarea: (nueva: Omit<Tarea, 'id' | 'creadoEn' | 'completada'>) => string;
  editarTarea: (id: string, updates: Partial<Tarea>) => void;
  eliminarTarea: (id: string) => void;
  toggleSubtarea: (tareaId: string, subtareaId: string) => void;
  // Pestaña Tareas (utils/tareasUtils.ts): todas recalculan "completada"
  /** momento: undefined deja el que tenía; null lo quita ("Cualquier momento"). */
  ponerFechaPaso: (tareaId: string, pasoId: string, fecha?: string, momento?: MomentoPlan | null) => void;
  // Compromisos de Tu semana (src/utils/compromisosUtils.ts)
  compromisos: Compromiso[];
  crearCompromiso: (datos: Omit<Compromiso, 'id' | 'creadoEn'>) => string;
  /** alcance "uno" en uno que se repite: solo ese día (fechaDelDia). */
  editarCompromiso: (id: string, cambios: CambiosCompromiso, alcance: Alcance, fechaDelDia: string) => void;
  borrarCompromiso: (id: string, alcance: Alcance, fechaDelDia: string) => void;
  // Progreso › Qué hacer ahora (src/utils/consejosUtils.ts): 'Ahora no' esconde un consejo 7 días (viaja en la copia a la nube)
  consejosOcultos: Record<string, string>;
  ocultarConsejo: (clave: string) => void;
  /** Deshacer de 'Ahora no'. */
  mostrarConsejo: (clave: string) => void;
  // Modo Foco (src/utils/focoUtils.ts): bloques de foco terminados (1 min o más), viajan en la copia a la nube
  sesionesFoco: SesionFoco[];
  /** Guarda un bloque (si ya existe ese id, no lo duplica). */
  guardarSesionFoco: (s: SesionFoco) => void;
  quitarSesionFoco: (id: string) => void;
  /** "Deshacer": vuelve la lista de compromisos a como estaba. */
  restaurarCompromisos: (lista: Compromiso[]) => void;
  /** Marca o desmarca un compromiso ese día (Compromisos 2). Deshacer = llamarlo otra vez con el contrario. */
  marcarCompromiso: (id: string, fecha: string, hecho: boolean) => void;
  /** La pantalla "Tus compromisos" (se abre desde Hoy › "Ver todos" y desde Tu semana). */
  verCompromisos: boolean;
  abrirCompromisos: () => void;
  cerrarCompromisos: () => void;
  /** Biblioteca (DESIGN.md › "### Biblioteca"): pantalla completa en el celular, página en el escritorio. */
  verBiblioteca: boolean;
  abrirBiblioteca: () => void;
  cerrarBiblioteca: () => void;
  /** Agrega un pack, una tarea lista o un plan SIN tocar lo que ya hay. Devuelve los ids creados, para el Deshacer. */
  agregarDeBiblioteca: (item: ItemBiblioteca, claves: string[]) => { habitoIds: string[]; tareaId: string | null };
  /** El Deshacer: quita solo esos ids (con sus registros), nunca restaura una foto vieja. */
  deshacerBiblioteca: (ids: { habitoIds: string[]; tareaId: string | null }) => void;
  /** "Quitar" algo ya agregado: ARCHIVA sus hábitos (guardan el historial) y BORRA su tarea. Solo toca lo que tiene ese origen. */
  quitarDeBiblioteca: (item: ItemBiblioteca) => void;
  agregarPasoTarea: (tareaId: string, padreId: string | null, texto: string) => string | null;
  editarTextoPaso: (tareaId: string, pasoId: string, texto: string) => void;
  borrarPasoTarea: (tareaId: string, pasoId: string) => void;
  /** "Pegar una lista": agrega los pasos al final de la tarea y devuelve sus ids (para "Deshacer"). */
  agregarPasosPegados: (tareaId: string, pasos: Subtarea[]) => string[];
  /** "Deshacer" de pegar una lista: quita esos pasos (con lo que tengan adentro). */
  quitarPasosTarea: (tareaId: string, ids: string[]) => void;
  moverPasoTarea: (tareaId: string, pasoId: string, destino: DestinoPaso) => boolean;
  reabrirTarea: (tareaId: string) => void;
  restaurarTarea: (tarea: Tarea, indice: number) => void;
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
  cajasSinRara: number;
  abrirCajas: () => CajasResult | null;
  retoSemanal: RetoSemanal | null;
  insigniasGanadas: Record<string, string>;
  llamasGanadas: Record<string, string>;
  companera: string | null;
  setCompanera: (id: string | null) => void;
  insignias: InsigniaDef[];

  // Celebraciones
  celebrado: { nivel: number; etapa: number; insignias: string[]; meses: string[]; resumenes: string[] };
  setCelebrado: (nuevo: { nivel: number; etapa: number; insignias: string[]; meses: string[]; resumenes: string[] }) => void;
  lastRegistroUpdate: number;
  coloresGanados: string[];
  abrirColeccion: boolean;
  setAbrirColeccion: (v: boolean) => void;
  avatarPreferido: 'inicial' | 'llama';
  setAvatarPreferido: (val: 'inicial' | 'llama') => void;

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
    compromisos?: Compromiso[];
    consejosOcultos?: Record<string, string>;
    sesionesFoco?: SesionFoco[];
    comodines?: number;
    diasCongelados?: string[];
    ordenMomentos?: MomentoDia[];
    premios?: Premio[];
    cajasPorAbrir?: number;
    cajasSinRara?: number;
    cajasAbiertasTotales?: number;
    retoSemanal?: RetoSemanal | null;
    insigniasGanadas?: Record<string, string>;
    llamasGanadas?: Record<string, string>;
    companera?: string | null;
    celebrado?: { nivel: number; etapa: number; insignias: string[]; meses: string[] };
    nombre?: string;
    acento?: string;
    apariencia?: string;
  }) => { success: boolean; error?: string };
  exportarDatos: () => void;
  construirRespaldo: () => any;
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

  // Comodines y día difícil (design/maqueta-dia-dificil.html)
  /** Días ('YYYY-MM-DD') en que se activó el día difícil. */
  diasDificiles: string[];
  esDificilHoy: boolean;
  /** Guarda las mínimas escritas en la hoja (id del hábito → texto; vacío = sin mínima) y activa el día difícil de hoy. */
  activarDiaDificil: (minimos: Record<string, string>) => void;
  /** Quita el día difícil de hoy; lo ya marcado con la mínima se queda así. */
  quitarDiaDificil: () => void;
  /** "Lo hice completo": un hábito hecho con la mínima pasa a completo (10 puntos). */
  pasarACompleto: (habitoId: string, fecha?: string) => void;
  /** Comodín automático (Perfil), apagado de entrada. */
  comodinAuto: boolean;
  setComodinAuto: (v: boolean) => void;
  /** Días que congeló el comodín automático (para "· automático" en Tus comodines). */
  congeladosAuto: string[];
  /** Revisa una vez por día si el comodín automático debe congelar días. Se llama cuando la nube ya está lista. */
  revisarComodinAutomatico: () => void;
  /** Días que acaba de congelar el comodín automático (el aviso con Deshacer). null = sin aviso. */
  avisoComodinAuto: string[] | null;
  cerrarAvisoComodinAuto: () => void;
  deshacerComodinAuto: () => void;
  /** Las hojas "Tus comodines" y "Día difícil" se abren desde varios lugares. */
  verComodines: boolean;
  abrirComodines: () => void;
  cerrarComodines: () => void;
  verDificil: boolean;
  abrirDificil: () => void;
  cerrarDificil: () => void;

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
  const [tareaPorAbrir, setTareaPorAbrir] = useState<string | null>(null);
  const [previousTab, setPreviousTab] = useState<TabRoute>('hoy');
  const [lastRegistroUpdate, setLastRegistroUpdate] = useState<number>(Date.now());

  // Onboarding State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ONBOARDING_KEY);
      if (stored !== 'true') {
        const storedHabitos = localStorage.getItem(STORAGE_HABITOS_KEY);
        if (storedHabitos && JSON.parse(storedHabitos).length > 0) {
          localStorage.setItem(STORAGE_ONBOARDING_KEY, 'true');
          return false;
        }
        return true;
      }
      return false;
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
  const [compromisos, setCompromisos] = useState<Compromiso[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COMPROMISOS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [consejosOcultos, setConsejosOcultos] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CONSEJOS_OCULTOS_KEY);
      if (stored) return limpiarConsejosOcultos(JSON.parse(stored), getTodayString());
    } catch {}
    return {};
  });
  const [sesionesFoco, setSesionesFoco] = useState<SesionFoco[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SESIONES_FOCO_KEY);
      if (stored) return sanearSesiones(JSON.parse(stored));
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

  const leerLista = (clave: string): string[] => {
    try {
      const v = JSON.parse(localStorage.getItem(clave) || '[]');
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    } catch { return []; }
  };
  const [diasDificiles, setDiasDificiles] = useState<string[]>(() => leerLista(STORAGE_DIFICILES_KEY));
  const [congeladosAuto, setCongeladosAuto] = useState<string[]>(() => leerLista(STORAGE_CONGELADOS_AUTO_KEY));
  const [comodinAuto, setComodinAuto] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_COMODIN_AUTO_KEY) === '1'; } catch { return false; }
  });
  const [avisoComodinAuto, setAvisoComodinAuto] = useState<string[] | null>(null);
  const [verComodines, setVerComodines] = useState(false);
  const [verDificil, setVerDificil] = useState(false);

  const [premios, setPremios] = useState<Premio[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREMIOS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [cajasSinRara, setCajasSinRara] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('racha_cajas_sin_rara');
      if (stored !== null) return parseInt(stored) || 0;
    } catch {}
    return 0;
  });

  const [cajasAbiertasTotales, setCajasAbiertasTotales] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('racha_cajas_abiertas');
      if (stored !== null) return parseInt(stored) || 0;
    } catch {}
    return 0;
  });

  const isOpeningCajas = useRef(false);

  useEffect(() => {
    try { localStorage.setItem('racha_cajas_sin_rara', String(cajasSinRara)); } catch {}
  }, [cajasSinRara]);

  useEffect(() => {
    try { localStorage.setItem('racha_cajas_abiertas', String(cajasAbiertasTotales)); } catch {}
  }, [cajasAbiertasTotales]);

  const abrirCajas = (): CajasResult | null => {
    if (isOpeningCajas.current || cajasPorAbrir <= 0) return null;
    isOpeningCajas.current = true;

    const nCajas = cajasPorAbrir;
    let newCajasSinRara = cajasSinRara;
    let totalPuntos = 0;
    const rarasDesbloqueadas: string[] = [];
    const rarasGanadasSet = new Set(Object.keys(llamasGanadas).filter(k => k.startsWith('rara_')));
    const TOTAL_RARAS = 10;
    let addedRaras = 0;

    for (let i = 0; i < nCajas; i++) {
      const currentRarasCount = rarasGanadasSet.size + addedRaras;
      const canDropRara = currentRarasCount < TOTAL_RARAS;

      if (canDropRara && (Math.random() < 1/20 || newCajasSinRara + 1 >= 15)) {
        // Drop a rara
        const missingRaras = RARAS_IDS.map(k => `rara_${k}`).filter(id => !rarasGanadasSet.has(id) && !rarasDesbloqueadas.includes(id));
        if (missingRaras.length > 0) {
          const randomRara = missingRaras[Math.floor(Math.random() * missingRaras.length)];
          rarasDesbloqueadas.push(randomRara);
          addedRaras++;
          newCajasSinRara = 0;
        } else {
          totalPuntos += [10, 20, 30, 40, 50][Math.floor(Math.random() * 5)];
          newCajasSinRara++;
        }
      } else {
        totalPuntos += [10, 20, 30, 40, 50][Math.floor(Math.random() * 5)];
        newCajasSinRara++;
      }
    }

    if (totalPuntos > 0) {
      const key = `caja:${cajasAbiertasTotales + 1}`;
      setPremios(prev => [...prev, { fecha: getTodayString(), motivo: 'Caja sorpresa', puntos: totalPuntos, clave: key, tipo: 'caja' }]);
    }
    
    if (rarasDesbloqueadas.length > 0) {
      setLlamasGanadas(prev => {
        const next = { ...prev };
        rarasDesbloqueadas.forEach(id => {
          next[id] = getTodayString();
        });
        return next;
      });
    }

    setCajasSinRara(newCajasSinRara);
    setCajasAbiertasTotales(prev => prev + nCajas);
    setCajasPorAbrir(0);

    setTimeout(() => {
      isOpeningCajas.current = false;
    }, 100);

    return { cajas: nCajas, puntos: totalPuntos, raras: rarasDesbloqueadas };
  };

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

  const [llamasGanadas, setLlamasGanadas] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('racha_llamas');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  const [companera, setCompanera] = useState<string | null>(() => {
    return localStorage.getItem('racha_companera') || null;
  });

  const [celebrado, setCelebrado] = useState<{ nivel: number; etapa: number; insignias: string[]; meses: string[]; resumenes: string[] }>(() => {
    try {
      const stored = localStorage.getItem('racha_celebrado');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { nivel: 1, etapa: 1, insignias: [], meses: [], resumenes: [] };
  });

  const [isFirstLoadWithoutCelebrado, setIsFirstLoadWithoutCelebrado] = useState(() => {
    return !localStorage.getItem('racha_celebrado');
  });

  const [abrirColeccion, setAbrirColeccion] = useState(false);
  const [avatarPreferido, setAvatarPreferido] = useState<'inicial' | 'llama'>(() => {
    return (localStorage.getItem('racha_avatar') as 'inicial' | 'llama') || 'inicial';
  });

  const [coloresGanados, setColoresGanados] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('racha_colores_ganados');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
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
    try { localStorage.setItem('racha_avatar', avatarPreferido); } catch {}
  }, [avatarPreferido]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_COMODINES_KEY, String(comodines)); } catch {}
  }, [comodines]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_CONGELADOS_KEY, JSON.stringify(diasCongelados)); } catch {}
  }, [diasCongelados]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_DIFICILES_KEY, JSON.stringify(diasDificiles)); } catch {}
  }, [diasDificiles]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_CONGELADOS_AUTO_KEY, JSON.stringify(congeladosAuto)); } catch {}
  }, [congeladosAuto]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_COMODIN_AUTO_KEY, comodinAuto ? '1' : '0'); } catch {}
  }, [comodinAuto]);

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
      localStorage.setItem('racha_celebrado', JSON.stringify(celebrado));
    } catch {}
  }, [celebrado]);

  useEffect(() => {
    try {
      localStorage.setItem('racha_colores_ganados', JSON.stringify(coloresGanados));
    } catch {}
  }, [coloresGanados]);

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPROMISOS_KEY, JSON.stringify(compromisos));
    } catch {}
  }, [compromisos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONSEJOS_OCULTOS_KEY, JSON.stringify(consejosOcultos));
    } catch {}
  }, [consejosOcultos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESIONES_FOCO_KEY, JSON.stringify(sesionesFoco));
    } catch {}
  }, [sesionesFoco]);

  const guardarSesionFoco = (nueva: SesionFoco) => {
    setSesionesFoco((prev) => (prev.some((x) => x.id === nueva.id) ? prev : [...prev, nueva]));
  };
  const quitarSesionFoco = (id: string) => {
    setSesionesFoco((prev) => (prev.some((x) => x.id === id) ? prev.filter((x) => x.id !== id) : prev));
  };

  const ocultarConsejo = (clave: string) => {
    const hoy = getTodayString();
    setConsejosOcultos((prev) => ({ ...limpiarConsejosOcultos(prev, hoy), [clave]: hastaOcultarConsejo(hoy) }));
  };
  const mostrarConsejo = (clave: string) => {
    setConsejosOcultos((prev) => {
      if (!(clave in prev)) return prev;
      const { [clave]: _, ...resto } = prev;
      return resto;
    });
  };

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
    setVerBiblioteca(false);
    setActiveTab(tab);
  };

  const abrirTareaEnLista = (tareaId: string) => {
    setTareaPorAbrir(tareaId);
    navigateToTab('tareas');
  };
  const yaAbriTarea = () => setTareaPorAbrir(null);

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
          const nuevo: Habito = { ...h, ...updates, color: updatedColor };
          const minimo = puedeTenerMinimo(nuevo) ? limpiarMinimo(nuevo.minimo) : undefined;
          if (minimo) nuevo.minimo = minimo; else delete nuevo.minimo;
          return nuevo;
        }
        return h;
      })
    );
    // Si cambia la meta, el registro de hoy se recalcula (antes, al bajarla, quedaba 'no cumplido')
    if ('metaDiaria' in updates) {
      const hoy = getTodayString();
      const meta = updates.metaDiaria;
      setRegistros((prev) => prev.map((r) =>
        r.habitoId === id && r.fecha === hoy ? recalcularConMeta(r, meta) : r));
      setLastRegistroUpdate(Date.now());
    }
  };

  // Action: Eliminar Hábito
  const eliminarHabito = (id: string) => {
    setHabitos((prev) => prev.filter((h) => h.id !== id));
    setRegistros((prev) => prev.filter((r) => r.habitoId !== id));
    setRutinas((prev) => prev.some((r) => r.habitoIds.includes(id))
      ? prev.map((r) => (r.habitoIds.includes(id) ? { ...r, habitoIds: r.habitoIds.filter((hid) => hid !== id) } : r))
      : prev);
  };

  // Action: Toggle Completado
  // Marcar o desmarcar. Si ese día es un día difícil y el hábito tiene mínima, queda hecho con la mínima (5 puntos).
  const toggleCompletado = (habitoId: string, fecha = getTodayString()) => {
    const habito = habitos.find((h) => h.id === habitoId) ?? ({ id: habitoId } as Habito);
    const dificil = diasDificiles.includes(fecha);
    setRegistros((prev) => marcarHabito(prev, habito, fecha, dificil));
    setLastRegistroUpdate(Date.now());
  };

  // Action: Set Valor para cuantificables
  const setValor = (habitoId: string, fecha: string, valor: number) => {
    const habito = habitos.find((h) => h.id === habitoId) ?? ({ id: habitoId } as Habito);
    setRegistros((prev) => {
      const existingIdx = prev.findIndex((r) => r.habitoId === habitoId && r.fecha === fecha);
      const nuevo = registroConValor(existingIdx >= 0 ? prev[existingIdx] : undefined, habito, fecha, valor);
      if (!nuevo) return existingIdx >= 0 ? prev.filter((_, idx) => idx !== existingIdx) : prev;
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = nuevo;
        return updated;
      }
      return [...prev, nuevo];
    });
    setLastRegistroUpdate(Date.now());
  };

  const reiniciarTodo = () => {
    setHabitos([]);
    setRegistros([]);
    setRutinas([]);
    setTareas([]);
    setCompromisos([]);
    setConsejosOcultos({});
    localStorage.removeItem(STORAGE_CONSEJOS_OCULTOS_KEY);
    setSesionesFoco([]);
    localStorage.removeItem(STORAGE_SESIONES_FOCO_KEY);
    localStorage.removeItem('racha_foco_en_curso');
    localStorage.removeItem(STORAGE_HABITOS_KEY);
    localStorage.removeItem(STORAGE_REGISTROS_KEY);
    localStorage.removeItem(STORAGE_RUTINAS_KEY);
    localStorage.removeItem(STORAGE_TAREAS_KEY);
    localStorage.removeItem(STORAGE_COMPROMISOS_KEY);
    localStorage.removeItem(STORAGE_ORDEN_MOMENTOS_KEY);
    localStorage.removeItem('racha_unlocked_badges');
    localStorage.removeItem('racha_secciones_momento');
    localStorage.removeItem(STORAGE_COMODINES_KEY);
    localStorage.removeItem(STORAGE_CONGELADOS_KEY);
    localStorage.removeItem(STORAGE_COMODINES_MES_KEY);
    setDiasDificiles([]);
    setCongeladosAuto([]);
    setComodinAuto(false);
    setAvisoComodinAuto(null);
    localStorage.removeItem(STORAGE_DIFICILES_KEY);
    localStorage.removeItem(STORAGE_CONGELADOS_AUTO_KEY);
    localStorage.removeItem(STORAGE_COMODIN_AUTO_KEY);
    localStorage.removeItem(STORAGE_AUTO_REVISADO_KEY);
    localStorage.removeItem(STORAGE_PREMIOS_KEY);
    premiosEntregados.current.clear();
    localStorage.removeItem(STORAGE_CAJAS_KEY);
    localStorage.removeItem(STORAGE_RETO_SEMANAL_KEY);
    localStorage.removeItem('racha_insignias');
    localStorage.removeItem('racha_llamas');
    localStorage.removeItem('racha_companera');
    localStorage.removeItem('racha_celebrado');
    localStorage.removeItem('racha_colores_ganados');
    localStorage.removeItem('racha_cajas_sin_rara');
    localStorage.removeItem('racha_cajas_abiertas');
    setCajasSinRara(0);
    setCajasAbiertasTotales(0);
    setPremios([]);
    setCajasPorAbrir(0);
    setRetoSemanalState(null);
    setInsigniasGanadas({});
    setLlamasGanadas({});
    setCompanera(null);
    setCelebrado({ nivel: 1, etapa: 1, insignias: [], meses: [], resumenes: [] });
    setColoresGanados([]);
    setAvatarPreferido('inicial');
    localStorage.removeItem('racha_nombre');
    localStorage.removeItem('racha_primer_dia');
    localStorage.removeItem('racha_acento');
    localStorage.removeItem('racha_apariencia');
    localStorage.removeItem('racha_avatar');
    window.dispatchEvent(new Event('racha_sync_theme'));
  };

  // Action: Construir el respaldo como JSON
  const construirRespaldo = () => {
    return {
      app: 'Racha',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      habitos,
      registros,
      rutinas,
      tareas,
      compromisos,
      consejosOcultos,
      sesionesFoco,
      comodines,
      diasCongelados,
      diasDificiles,
      comodinAuto,
      congeladosAuto,
      ordenMomentos,
      premios,
      cajasPorAbrir,
      retoSemanal,
      insigniasGanadas, llamasGanadas, companera, cajasSinRara, cajasAbiertasTotales,
      celebrado,
      coloresGanados,
      nombre: localStorage.getItem('racha_nombre') || '',
      acento: localStorage.getItem('racha_acento') || 'ambar',
      apariencia: localStorage.getItem('racha_apariencia') || 'auto',
      avatar: localStorage.getItem('racha_avatar') || 'inicial',
    };
  };

  // Action: Exportar datos como JSON
  const exportarDatos = () => {
    try {
      const exportObject = construirRespaldo();
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
    compromisos?: Compromiso[];
    consejosOcultos?: Record<string, string>;
    sesionesFoco?: SesionFoco[];
    comodines?: number;
    diasCongelados?: string[];
    diasDificiles?: string[];
    comodinAuto?: boolean;
    congeladosAuto?: string[];
    ordenMomentos?: MomentoDia[];
    premios?: Premio[];
    cajasPorAbrir?: number;
    retoSemanal?: RetoSemanal | null;
    insigniasGanadas?: Record<string, string>;
    llamasGanadas?: Record<string, string>;
    companera?: string | null;
    celebrado?: { nivel: number; etapa: number; insignias: string[]; meses: string[] };
    coloresGanados?: string[];
    cajasSinRara?: number;
    cajasAbiertasTotales?: number;
    nombre?: string;
    acento?: string;
    apariencia?: string;
    avatar?: 'inicial' | 'llama';
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
      if (Array.isArray(datos.compromisos)) setCompromisos(datos.compromisos);
      if (datos.consejosOcultos && typeof datos.consejosOcultos === 'object' && !Array.isArray(datos.consejosOcultos)) {
        const limpios: Record<string, string> = {};
        for (const [k, v] of Object.entries(datos.consejosOcultos)) if (typeof v === 'string') limpios[k] = v;
        setConsejosOcultos(limpiarConsejosOcultos(limpios, getTodayString()));
      }
      if (Array.isArray(datos.sesionesFoco)) setSesionesFoco(sanearSesiones(datos.sesionesFoco));
      if (typeof datos.comodines === 'number') setComodines(Math.max(0, Math.min(COMODINES_MAX, datos.comodines)));
      if (Array.isArray(datos.diasCongelados)) setDiasCongelados(datos.diasCongelados);
      const soloTextos = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
      setDiasDificiles(soloTextos(datos.diasDificiles));
      setCongeladosAuto(soloTextos(datos.congeladosAuto));
      setComodinAuto(datos.comodinAuto === true);
      if (Array.isArray(datos.ordenMomentos)) setOrdenMomentos(datos.ordenMomentos);
      if (Array.isArray(datos.premios)) {
        setPremios(datos.premios);
        premiosEntregados.current = new Set(datos.premios.map((p) => p.clave).filter((c): c is string => !!c));
      }
      if (typeof datos.cajasPorAbrir === 'number') setCajasPorAbrir(datos.cajasPorAbrir);
      if (datos.insigniasGanadas && typeof datos.insigniasGanadas === 'object') setInsigniasGanadas(datos.insigniasGanadas);
      if (datos.llamasGanadas && typeof datos.llamasGanadas === 'object') setLlamasGanadas(datos.llamasGanadas);
      if (datos.companera === null || typeof datos.companera === 'string') setCompanera(datos.companera);
      if (datos.celebrado) {
        setCelebrado({ ...datos.celebrado, resumenes: (datos.celebrado as any).resumenes || [] });
        setIsFirstLoadWithoutCelebrado(false);
      } else {
        setIsFirstLoadWithoutCelebrado(true);
      }
      if (Array.isArray(datos.coloresGanados)) setColoresGanados(datos.coloresGanados);
      if (typeof datos.cajasSinRara === 'number') setCajasSinRara(datos.cajasSinRara);
      if (typeof datos.cajasAbiertasTotales === 'number') setCajasAbiertasTotales(datos.cajasAbiertasTotales);
      if (datos.retoSemanal !== undefined) setRetoSemanalState(datos.retoSemanal);

      if (typeof datos.nombre === 'string') localStorage.setItem('racha_nombre', datos.nombre);
      if (typeof datos.acento === 'string') localStorage.setItem('racha_acento', datos.acento);
      if (typeof datos.apariencia === 'string') localStorage.setItem('racha_apariencia', datos.apariencia);
      if (datos.avatar === 'inicial' || datos.avatar === 'llama') setAvatarPreferido(datos.avatar);
      
      window.dispatchEvent(new Event('racha_sync_theme'));

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Ocurrió un error al procesar el archivo.' };
    }
  };

  // Computed: Hábitos de hoy
  const hoyStr = getTodayString();
  const esDificilHoy = diasDificiles.includes(hoyStr);
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
    try { localStorage.setItem('racha_llamas', JSON.stringify(llamasGanadas)); } catch {}
  }, [llamasGanadas]);

  useEffect(() => {
    try {
      if (companera) localStorage.setItem('racha_companera', companera);
      else localStorage.removeItem('racha_companera');
    } catch {}
  }, [companera]);

  

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
    setCongeladosAuto((prev) => (prev.includes(fecha) ? prev.filter((d) => d !== fecha) : prev));
  };

  // ---- Día difícil ----
  const activarDiaDificil = (minimos: Record<string, string>) => {
    setHabitos((prev) => aplicarMinimos(prev, minimos));
    setDiasDificiles((prev) => activarDificil(prev, getTodayString()));
  };
  const quitarDiaDificil = () => setDiasDificiles((prev) => quitarDificil(prev, getTodayString()));
  const pasarACompleto = (habitoId: string, fecha = getTodayString()) => {
    const habito = habitos.find((h) => h.id === habitoId);
    if (!habito) return;
    setRegistros((prev) => registrosACompleto(prev, habito, fecha));
    setLastRegistroUpdate(Date.now());
  };
  const abrirComodines = () => setVerComodines(true);
  const cerrarComodines = () => setVerComodines(false);
  const abrirDificil = () => { setVerComodines(false); setVerDificil(true); };
  const cerrarDificil = () => setVerDificil(false);

  // ---- Comodín automático: una vez por día, cuando la nube ya está lista (AppShell) ----
  const autoRevisando = useRef(false);
  const revisarComodinAutomatico = () => {
    if (!comodinAuto || autoRevisando.current) return;
    const hoy = getTodayString();
    let revisado: string | null = null;
    try { revisado = localStorage.getItem(STORAGE_AUTO_REVISADO_KEY); } catch {}
    if (revisado === hoy) return;
    autoRevisando.current = true;
    try { localStorage.setItem(STORAGE_AUTO_REVISADO_KEY, hoy); } catch {}
    const fechas = comodinesAutomaticos(habitos, registros, diasCongelados, comodines, hoy);
    if (fechas.length > 0) {
      const r = congelarVarios(diasCongelados, comodines, fechas);
      if (r.congeladas.length > 0) {
        setDiasCongelados(r.diasCongelados);
        setComodines(r.comodines);
        setCongeladosAuto((prev) => [...prev, ...r.congeladas.filter((f) => !prev.includes(f))]);
        setAvisoComodinAuto(r.congeladas);
      }
    }
    autoRevisando.current = false;
  };
  const cerrarAvisoComodinAuto = () => setAvisoComodinAuto(null);
  const deshacerComodinAuto = () => {
    const fechas = avisoComodinAuto;
    if (!fechas || fechas.length === 0) return;
    const quitar = fechas.filter((f) => diasCongelados.includes(f));
    setDiasCongelados((prev) => prev.filter((d) => !quitar.includes(d)));
    setComodines((c) => Math.min(COMODINES_MAX, c + quitar.length));
    setCongeladosAuto((prev) => prev.filter((d) => !quitar.includes(d)));
    setAvisoComodinAuto(null);
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

  const crearTarea = (nueva: Omit<Tarea, 'id' | 'creadoEn' | 'completada'>): string => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const subtareas = nueva.subtareas || [];
    setTareas((prev) => [...prev, { ...nueva, id, subtareas, completada: _tareaCompletada(subtareas), creadoEn: new Date().toISOString() }]);
    return id;
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
  // ---- Pestaña Tareas ----
  const cambiarArbol = (tareaId: string, fn: (t: Tarea) => Subtarea[]) => {
    setTareas((prev) => prev.map((t) => {
      if (t.id !== tareaId) return t;
      const subtareas = fn(t);
      if (subtareas === t.subtareas) return t;
      return { ...t, subtareas, completada: _tareaCompletada(subtareas) };
    }));
  };
  const ponerFechaPaso = (tareaId: string, pasoId: string, fecha?: string, momento?: MomentoPlan | null) =>
    cambiarArbol(tareaId, (t) => _ponerFechaPaso(t.subtareas, pasoId, fecha, momento));
  // Compromisos: el id se genera afuera para devolverlo
  const crearCompromiso = (datos: Omit<Compromiso, 'id' | 'creadoEn'>): string => {
    const id = nuevoIdCompromiso();
    setCompromisos((prev) => _crearCompromiso(prev, datos, id));
    return id;
  };
  const editarCompromiso = (id: string, cambios: CambiosCompromiso, alcance: Alcance, fechaDelDia: string) => {
    const idCopia = nuevoIdCompromiso();
    setCompromisos((prev) => _editarCompromiso(prev, id, cambios, alcance, fechaDelDia, idCopia));
  };
  const borrarCompromiso = (id: string, alcance: Alcance, fechaDelDia: string) =>
    setCompromisos((prev) => _borrarCompromiso(prev, id, alcance, fechaDelDia));
  const restaurarCompromisos = (lista: Compromiso[]) => setCompromisos(lista);
  const marcarCompromiso = (id: string, fecha: string, hecho: boolean) =>
    setCompromisos((prev) => _marcarHecho(prev, id, fecha, hecho));
  const [verCompromisos, setVerCompromisos] = useState(false);
  const abrirCompromisos = () => setVerCompromisos(true);
  const cerrarCompromisos = () => setVerCompromisos(false);

  // ----- Biblioteca -----
  const [verBiblioteca, setVerBiblioteca] = useState(false);
  const abrirBiblioteca = () => { setHabitBeingEdited(null); setSelectedHabitIdForDetail(null); setVerBiblioteca(true); };
  const cerrarBiblioteca = () => setVerBiblioteca(false);
  const agregarDeBiblioteca = (item: ItemBiblioteca, claves: string[]) => {
    const nuevoId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    const { habitos: nuevos, tarea } = construirAgregado(item, claves, habitos, { ahora: new Date().toISOString(), nuevoId });
    // Un solo cambio por lista: así no se pisan los 'orden' ni se pierde nada de lo que ya había
    if (nuevos.length) setHabitos((prev) => [...nuevos, ...prev]);
    if (tarea) setTareas((prev) => [...prev, tarea]);
    return { habitoIds: nuevos.map((h) => h.id), tareaId: tarea ? tarea.id : null };
  };
  const deshacerBiblioteca = (ids: { habitoIds: string[]; tareaId: string | null }) => {
    ids.habitoIds.forEach((id) => eliminarHabito(id));
    if (ids.tareaId) eliminarTarea(ids.tareaId);
  };
  const quitarDeBiblioteca = (item: ItemBiblioteca) => {
    setHabitos((prev) => (prev.some((h) => h.origen === item.id && !h.archivado) ? prev.map((h) => (h.origen === item.id && !h.archivado ? { ...h, archivado: true } : h)) : prev));
    setTareas((prev) => (prev.some((t) => t.origen === item.id) ? prev.filter((t) => t.origen !== item.id) : prev));
  };
  const agregarPasoTarea = (tareaId: string, padreId: string | null, texto: string): string | null => {
    if (!texto.trim()) return null;
    const id = nuevoIdPaso();
    cambiarArbol(tareaId, (t) => _agregarPaso(t.subtareas, padreId, texto, id).arbol);
    return id;
  };
  const editarTextoPaso = (tareaId: string, pasoId: string, texto: string) =>
    cambiarArbol(tareaId, (t) => _editarTextoPaso(t.subtareas, pasoId, texto));
  const borrarPasoTarea = (tareaId: string, pasoId: string) =>
    cambiarArbol(tareaId, (t) => _borrarPaso(t.subtareas, pasoId));
  const agregarPasosPegados = (tareaId: string, pasos: Subtarea[]): string[] => {
    if (!pasos.length) return [];
    cambiarArbol(tareaId, (t) => _normalizarArbol([...t.subtareas, ...pasos]));
    return pasos.map((p) => p.id);
  };
  const quitarPasosTarea = (tareaId: string, ids: string[]) =>
    cambiarArbol(tareaId, (t) => ids.reduce((arbol, id) => _borrarPaso(arbol, id), t.subtareas));
  // Valida con el estado actual; si no es válido (p. ej. meter un paso dentro de sí mismo) no cambia nada
  const moverPasoTarea = (tareaId: string, pasoId: string, destino: DestinoPaso): boolean => {
    const actual = tareas.find((t) => t.id === tareaId);
    if (!actual || !_moverPaso(actual.subtareas, pasoId, destino)) return false;
    cambiarArbol(tareaId, (t) => _moverPaso(t.subtareas, pasoId, destino) || t.subtareas);
    return true;
  };
  const reabrirTarea = (tareaId: string) => cambiarArbol(tareaId, (t) => _reabrirArbol(t));
  // "Deshacer" después de borrar una tarea: la devuelve a su lugar
  const restaurarTarea = (tarea: Tarea, indice: number) => {
    setTareas((prev) => {
      if (prev.some((t) => t.id === tarea.id)) return prev;
      const i = Math.max(0, Math.min(indice, prev.length));
      return [...prev.slice(0, i), tarea, ...prev.slice(i)];
    });
  };
  const openTareaEditor = (tarea: Tarea | null = null) => { setTareaBeingEdited(tarea); setIsTareaEditorOpen(true); };
  const closeTareaEditor = () => { setIsTareaEditorOpen(false); setTareaBeingEdited(null); };

  // Calculated values
  const puntosTotales = useMemo(() => calcularPuntosTotales(registros, habitosActivos, premios, diasCongelados), [registros, habitosActivos, premios, diasCongelados]);
  const nivelActual = useMemo(() => calcularNivel(puntosTotales), [puntosTotales]);
  const progresoNivel = useMemo(() => calcularProgresoNivel(puntosTotales), [puntosTotales]);
  const etapaLlama = useMemo(() => etapaDeNivel(nivelActual), [nivelActual]);

  // Unlock colors based on level
  useEffect(() => {
    let changed = false;
    const newColors = [...coloresGanados];
    // TEMAS is imported from types but wait, we don't have it imported here. Let's just check the known levels.
    // Cielo: 6, Fucsia: 10, Bronce: 14, Atardecer: 18, Ciruela: 23, Rubi: 28, Oro: 35
    const colorLevels = [
      { key: 'cielo', nivel: 6 },
      { key: 'fucsia', nivel: 10 },
      { key: 'bronce', nivel: 14 },
      { key: 'atardecer', nivel: 18 },
      { key: 'ciruela', nivel: 23 },
      { key: 'rubi', nivel: 28 },
      { key: 'oro', nivel: 35 }
    ];
    for (const c of colorLevels) {
      if (nivelActual >= c.nivel && !newColors.includes(c.key)) {
        newColors.push(c.key);
        changed = true;
      }
    }
    if (changed) {
      setColoresGanados(newColors);
    }
  }, [nivelActual, coloresGanados]);

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

  // Descubrir nuevas llamas
  useEffect(() => {
    let added = false;
    const nuevasLlamas = { ...llamasGanadas };
    const today = getTodayString();

    const add = (id) => {
      if (!nuevasLlamas[id]) {
        nuevasLlamas[id] = today;
        added = true;
      }
    };

    // 1. Etapas
    for (let i = 1; i <= etapaLlama; i++) {
      add('etapa_' + i);
    }

    // 2. Hazañas
    for (const b of insignias) {
      if (b.desbloqueada && b.premioLlama) {
        const idStr = b.premioLlama.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        add('hazana_' + idStr);
      }
    }

    // 3. Meses
    const activos = habitos.filter(h => !h.archivado);
    if (activos.length > 0) {
      const minDate = activos.reduce((min, h) => h.creadoEn < min ? h.creadoEn : min, today);
      const mesActual = today.substring(0, 7);
      
      let iterDate = minDate;
      while (iterDate <= today) {
        const mes = iterDate.substring(0, 7);
        if (mes !== mesActual) {
          const year = parseInt(mes.substring(0, 4));
          const monthIndex = parseInt(mes.substring(5, 7));
          
          const primerDia = mes + '-01';
          const lastDateObj = new Date(year, monthIndex, 0); // last day of month
          const yy = lastDateObj.getFullYear();
          const mm = String(lastDateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(lastDateObj.getDate()).padStart(2, '0');
          const ultimoDia = yy + '-' + mm + '-' + dd;
          
          const tasa = tasaPeriodo(activos, registros, diasCongelados, primerDia, ultimoDia);
          if (tasa.pct >= 80) {
            add('mes_' + String(monthIndex).padStart(2, '0'));
          }
        }
        
        // avanzar mes
        const m = parseInt(iterDate.substring(5, 7));
        const y = parseInt(iterDate.substring(0, 4));
        const nextDateObj = new Date(y, m, 1);
        const ny = nextDateObj.getFullYear();
        const nm = String(nextDateObj.getMonth() + 1).padStart(2, '0');
        iterDate = ny + '-' + nm + '-01';
      }
    }

    if (added) {
      setLlamasGanadas(nuevasLlamas);
    }
  }, [etapaLlama, insignias, habitos, registros, diasCongelados, llamasGanadas]);

  useEffect(() => {
    try { localStorage.setItem('racha_colores_ganados', JSON.stringify(coloresGanados)); } catch {}
  }, [coloresGanados]);

  useEffect(() => {
    if (isFirstLoadWithoutCelebrado) {
      const newCelebrado = {
        nivel: nivelActual,
        etapa: etapaLlama,
        insignias: Object.keys(insigniasGanadas),
        meses: Object.keys(llamasGanadas).filter(k => k.startsWith('mes_')),
        // El mes pasado cuenta como ofrecido, para no inundar la primera vez
        resumenes: [(() => { const p = new Date(); p.setDate(1); p.setMonth(p.getMonth() - 1); return `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}`; })()]
      };
      setCelebrado(newCelebrado);
      localStorage.setItem('racha_celebrado', JSON.stringify(newCelebrado));
      setIsFirstLoadWithoutCelebrado(false);
    }
  }, [isFirstLoadWithoutCelebrado, nivelActual, etapaLlama, insigniasGanadas, llamasGanadas]);

  return (
    <HabitContext.Provider
      value={{
        isOnboardingOpen,
        openOnboarding,
        completeOnboarding,
        activeTab,
        setActiveTab,
        navigateToTab,
        tareaPorAbrir,
        abrirTareaEnLista,
        yaAbriTarea,
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
        ponerFechaPaso,
        agregarPasoTarea,
        editarTextoPaso,
        borrarPasoTarea,
        compromisos,
        crearCompromiso,
        editarCompromiso,
        borrarCompromiso,
        restaurarCompromisos,
        marcarCompromiso,
        verCompromisos,
        abrirCompromisos,
        cerrarCompromisos,
        verBiblioteca,
        abrirBiblioteca,
        cerrarBiblioteca,
        agregarDeBiblioteca,
        deshacerBiblioteca,
        quitarDeBiblioteca,
        consejosOcultos,
        ocultarConsejo,
        mostrarConsejo,
        sesionesFoco,
        guardarSesionFoco,
        quitarSesionFoco,
        agregarPasosPegados,
        quitarPasosTarea,
        moverPasoTarea,
        reabrirTarea,
        restaurarTarea,
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
        llamasGanadas,
        companera,
        setCompanera,
        celebrado,
        setCelebrado,
        lastRegistroUpdate,
        coloresGanados,
        abrirColeccion,
        setAbrirColeccion,
        avatarPreferido,
        setAvatarPreferido,
        abrirCajas,
        cajasSinRara,
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
        construirRespaldo,
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
        diasDificiles,
        esDificilHoy,
        activarDiaDificil,
        quitarDiaDificil,
        pasarACompleto,
        comodinAuto,
        setComodinAuto,
        congeladosAuto,
        revisarComodinAutomatico,
        avisoComodinAuto,
        cerrarAvisoComodinAuto,
        deshacerComodinAuto,
        verComodines,
        abrirComodines,
        cerrarComodines,
        verDificil,
        abrirDificil,
        cerrarDificil,
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
