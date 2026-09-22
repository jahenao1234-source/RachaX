export type TabRoute = 'hoy' | 'stats' | 'calendario' | 'perfil' | 'crear';

export type FrecuenciaHabito = 'diario' | 'entreSemana' | 'personalizado' | 'semanal';

export type MomentoDia = 'manana' | 'tarde' | 'noche' | 'flexible';

export interface MomentoOpcion {
  id: MomentoDia;
  label: string;
  icono: string;
}

export const MOMENTOS: MomentoOpcion[] = [
  { id: 'manana', label: 'Mañana', icono: 'Sunrise' },
  { id: 'tarde', label: 'Tarde', icono: 'Sun' },
  { id: 'noche', label: 'Noche', icono: 'Moon' },
  { id: 'flexible', label: 'Todo el día', icono: 'Clock' },
];

export const COLOR_POR_MOMENTO: Record<MomentoDia, string> = {
  manana: '#FFB547',
  tarde: '#FF7A59',
  noche: '#8E9BFF',
  flexible: '#98A0AA',
};

export interface CategoriaHabito {
  key: string;
  label: string;
  color: string;
  icono: string;
}

export interface AccentTheme {
  key: string;
  label: string;
  accent: string;
  accentHover: string;
  accentDeep: string;
}

export const THEMES: AccentTheme[] = [
  { key: 'violeta', label: 'Violeta', accent: '#8B5CF6', accentHover: '#7C4DF0', accentDeep: '#7C3AED' },
  { key: 'esmeralda', label: 'Esmeralda', accent: '#34D399', accentHover: '#10B981', accentDeep: '#059669' },
  { key: 'azul', label: 'Azul', accent: '#378ADD', accentHover: '#2E6FBD', accentDeep: '#1E5A9E' },
  { key: 'ambar', label: 'Ámbar', accent: '#F59E0B', accentHover: '#D97706', accentDeep: '#B45309' },
  { key: 'rosa', label: 'Rosa', accent: '#EC4899', accentHover: '#DB2777', accentDeep: '#BE185D' },
  { key: 'cyan', label: 'Cyan', accent: '#22D3EE', accentHover: '#06B6D4', accentDeep: '#0891B2' },
];

export const TEMAS = THEMES;

export const CATEGORIAS: CategoriaHabito[] = [
  { key: 'salud', label: 'Salud', color: '#34D399', icono: 'HeartPulse' },
  { key: 'ejercicio', label: 'Ejercicio', color: '#F97316', icono: 'Dumbbell' },
  { key: 'mente', label: 'Mente', color: '#8B5CF6', icono: 'Brain' },
  { key: 'productividad', label: 'Productividad', color: '#378ADD', icono: 'Briefcase' },
  { key: 'nutricion', label: 'Nutrición', color: '#F59E0B', icono: 'Salad' },
  { key: 'social', label: 'Social', color: '#ED93B1', icono: 'Users' },
  { key: 'finanzas', label: 'Finanzas', color: '#2DD4BF', icono: 'PiggyBank' },
  { key: 'otro', label: 'Otro', color: '#6B6F7B', icono: 'Tag' },
];

export type Habito = {
  id: string;                 // uuid
  nombre: string;
  tipo?: 'positivo' | 'negativo'; // 'positivo' por defecto (hacer), 'negativo' (evitar)
  categoria?: string;         // key de categoría opcional (ej. 'salud', 'mente', etc.)
  color: string;              // hex del acento elegido (ej. #8B5CF6)
  icono: string;              // nombre del icono lucide (ej. "Flame", "Dumbbell", etc.)
  momento?: MomentoDia;       // momento del día para organizar
  orden?: number;   // posición manual dentro de su sección (menor = más arriba)
  frecuencia: 'diario' | 'entreSemana' | 'personalizado' | 'semanal';
  vecesPorSemana?: number;   // meta de veces por semana (si frecuencia === 'semanal')
  archivado?: boolean;   // si true, se oculta de las vistas activas pero conserva su historial
  anclaje?: string;   // disparador: "Después de [anclaje], haré este hábito" (habit stacking)
  diasPersonalizados?: number[];   // 0=Dom ... 6=Sáb, si es personalizado
  recordatorio?: string | null;      // "08:00" o null
  metaDiaria?: number;        // opcional (ej. 8 vasos); si no, es sí/no
  reto?: { meta: number; inicio: string; cumplidoEn?: string }; // meta = días o semanas, inicio = YYYY-MM-DD
  creadoEn: string;           // ISO date
};

export type Registro = {
  habitoId: string;
  fecha: string;              // "YYYY-MM-DD"
  completado: boolean;
  valor?: number;             // para hábitos cuantificables
};

export interface ColorHabitoOpcion {
  key: string;
  label: string;
  hex: string;
  borderHex: string;
  bgHex: string;
  glowHex: string;
}

export const COLORES_HABITO: ColorHabitoOpcion[] = [
  {
    key: 'violet',
    label: 'Violeta',
    hex: '#8B5CF6',
    borderHex: 'rgba(139, 92, 246, 0.4)',
    bgHex: 'rgba(139, 92, 246, 0.15)',
    glowHex: 'rgba(139, 92, 246, 0.35)',
  },
  {
    key: 'emerald',
    label: 'Esmeralda',
    hex: '#34D399',
    borderHex: 'rgba(52, 211, 153, 0.4)',
    bgHex: 'rgba(52, 211, 153, 0.15)',
    glowHex: 'rgba(52, 211, 153, 0.35)',
  },
  {
    key: 'blue',
    label: 'Azul',
    hex: '#378ADD',
    borderHex: 'rgba(55, 138, 221, 0.4)',
    bgHex: 'rgba(55, 138, 221, 0.15)',
    glowHex: 'rgba(55, 138, 221, 0.35)',
  },
  {
    key: 'pink',
    label: 'Rosa',
    hex: '#ED93B1',
    borderHex: 'rgba(237, 147, 177, 0.4)',
    bgHex: 'rgba(237, 147, 177, 0.15)',
    glowHex: 'rgba(237, 147, 177, 0.35)',
  },
  {
    key: 'amber',
    label: 'Ámbar',
    hex: '#F59E0B',
    borderHex: 'rgba(245, 158, 11, 0.4)',
    bgHex: 'rgba(245, 158, 11, 0.15)',
    glowHex: 'rgba(245, 158, 11, 0.35)',
  },
  {
    key: 'coral',
    label: 'Coral',
    hex: '#F97316',
    borderHex: 'rgba(249, 115, 22, 0.4)',
    bgHex: 'rgba(249, 115, 22, 0.15)',
    glowHex: 'rgba(249, 115, 22, 0.35)',
  },
];

export interface IconoHabitoOpcion {
  name: string;
  label: string;
  category?: string;
}

export const ICONOS_DISPONIBLES: IconoHabitoOpcion[] = [
  // General
  { name: 'Target', label: 'Diana', category: 'General' },
  { name: 'Star', label: 'Estrella', category: 'General' },
  { name: 'Zap', label: 'Energía', category: 'General' },
  { name: 'Sparkles', label: 'Brillo', category: 'General' },
  { name: 'ShieldCheck', label: 'Escudo', category: 'General' },
  { name: 'Ban', label: 'Prohibido', category: 'General' },

  // Salud y cuerpo
  { name: 'Dumbbell', label: 'Pesas', category: 'Salud y cuerpo' },
  { name: 'HeartPulse', label: 'Pulso', category: 'Salud y cuerpo' },
  { name: 'Footprints', label: 'Caminar', category: 'Salud y cuerpo' },
  { name: 'Pill', label: 'Pastilla', category: 'Salud y cuerpo' },
  { name: 'Bed', label: 'Dormir', category: 'Salud y cuerpo' },
  { name: 'Leaf', label: 'Hoja', category: 'Salud y cuerpo' },

  // Mente y relaciones
  { name: 'BookOpen', label: 'Libro', category: 'Mente y relaciones' },
  { name: 'GraduationCap', label: 'Estudio', category: 'Mente y relaciones' },
  { name: 'Music', label: 'Música', category: 'Mente y relaciones' },
  { name: 'PenLine', label: 'Escribir', category: 'Mente y relaciones' },
  { name: 'Users', label: 'Personas', category: 'Mente y relaciones' },
  { name: 'Heart', label: 'Corazón', category: 'Mente y relaciones' },

  // Casa y vida
  { name: 'Droplet', label: 'Agua', category: 'Casa y vida' },
  { name: 'Apple', label: 'Fruta', category: 'Casa y vida' },
  { name: 'Coffee', label: 'Café', category: 'Casa y vida' },
  { name: 'Home', label: 'Casa', category: 'Casa y vida' },
  { name: 'Wallet', label: 'Dinero', category: 'Casa y vida' },
  { name: 'Smartphone', label: 'Celular', category: 'Casa y vida' },
];

export interface PlantillaHabito {
  nombre: string;
  icono: string;
  categoria?: string;
  momento?: MomentoDia;
  frecuencia?: FrecuenciaHabito;
  tipo?: 'positivo' | 'negativo';
  metaDiaria?: number;
  vecesPorSemana?: number;
}

export const PLANTILLAS_HABITOS: PlantillaHabito[] = [
  { nombre: 'Beber agua', icono: 'Droplet', categoria: 'nutricion', momento: 'flexible', frecuencia: 'diario', metaDiaria: 8 },
  { nombre: 'Ejercicio', icono: 'Dumbbell', categoria: 'ejercicio', momento: 'manana', frecuencia: 'semanal', vecesPorSemana: 3 },
  { nombre: 'Leer 20 min', icono: 'BookOpen', categoria: 'productividad', momento: 'noche', frecuencia: 'diario' },
  { nombre: 'Meditar', icono: 'Sparkles', categoria: 'mente', momento: 'manana', frecuencia: 'diario' },
  { nombre: 'Caminar', icono: 'Footprints', categoria: 'ejercicio', momento: 'flexible', frecuencia: 'diario' },
  { nombre: 'Comer fruta', icono: 'Apple', categoria: 'nutricion', momento: 'flexible', frecuencia: 'diario' },
  { nombre: 'Estudiar', icono: 'GraduationCap', categoria: 'productividad', momento: 'tarde', frecuencia: 'diario' },
  { nombre: 'Gratitud', icono: 'PenLine', categoria: 'mente', momento: 'noche', frecuencia: 'diario' },
  { nombre: 'No fumar', icono: 'Ban', categoria: 'salud', momento: 'flexible', frecuencia: 'diario', tipo: 'negativo' },
  { nombre: 'Menos pantalla', icono: 'Smartphone', categoria: 'otro', momento: 'noche', frecuencia: 'diario', tipo: 'negativo' },
];

export interface Rutina {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  habitoIds: string[];
  creadoEn: string;
}

export interface Subtarea {
  id: string;
  texto: string;
  hecha: boolean;
  subtareas?: Subtarea[];
}
export interface Tarea {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  subtareas: Subtarea[];
  completada: boolean;
  creadoEn: string;
}

export type FocusTarget =
  | { tipo: 'dia' }
  | { tipo: 'rutina'; nombre: string; habitoIds: string[] }
  | { tipo: 'tarea'; tareaId: string };

