import { Habito, Registro } from '../types';

export interface InsigniaDef {
  id: string;
  nombre: string;
  descripcion: string;
  requisito: string;
  icono: string;
  color: string;
  categoria: 'racha' | 'habitos' | 'checkins';
  meta: number;
  progresoActual: number;
  desbloqueada: boolean;
}

export const calcularInsignias = (
  habitos: Habito[],
  registros: Registro[],
  maxRachaHabito: number,
  rachaGlobal: number
): InsigniaDef[] => {
  const totalCheckins = registros.filter((r) => r.completado).length;
  const bestStreak = Math.max(maxRachaHabito, rachaGlobal);
  const totalHabitos = habitos.length;

  return [
    {
      id: 'primer_paso',
      nombre: 'Primer Paso',
      descripcion: 'Comenzaste tu viaje creando tu primer hábito en Racha.',
      requisito: 'Crea tu 1er hábito',
      icono: 'Sparkles',
      color: 'var(--accent)',
      categoria: 'habitos',
      meta: 1,
      progresoActual: Math.min(1, totalHabitos),
      desbloqueada: totalHabitos >= 1,
    },
    {
      id: 'chispa',
      nombre: 'Chispa',
      descripcion: 'Alcanzaste una racha activa de 3 días consecutivos.',
      requisito: 'Racha de 3 días',
      icono: 'Flame',
      color: 'var(--ambar)',
      categoria: 'racha',
      meta: 3,
      progresoActual: Math.min(3, bestStreak),
      desbloqueada: bestStreak >= 3,
    },
    {
      id: 'fuego',
      nombre: 'Fuego',
      descripcion: 'Completaste 7 días consecutivos manteniendo la constancia.',
      requisito: 'Racha de 7 días',
      icono: 'Zap',
      color: 'var(--coral)',
      categoria: 'racha',
      meta: 7,
      progresoActual: Math.min(7, bestStreak),
      desbloqueada: bestStreak >= 7,
    },
    {
      id: 'titan',
      nombre: 'Titán',
      descripcion: 'Una sólida racha de 30 días. El hábito ya es parte de tu identidad.',
      requisito: 'Racha de 30 días',
      icono: 'Shield',
      color: 'var(--ambar)',
      categoria: 'racha',
      meta: 30,
      progresoActual: Math.min(30, bestStreak),
      desbloqueada: bestStreak >= 30,
    },
    {
      id: 'constante',
      nombre: 'Constante',
      descripcion: 'Registraste 50 check-ins totales acumulados.',
      requisito: '50 check-ins totales',
      icono: 'Award',
      color: 'var(--accent)',
      categoria: 'checkins',
      meta: 50,
      progresoActual: Math.min(50, totalCheckins),
      desbloqueada: totalCheckins >= 50,
    },
    {
      id: 'coleccionista',
      nombre: 'Coleccionista',
      descripcion: 'Mantienes un catálogo completo de 5 hábitos activos.',
      requisito: '5 hábitos activos',
      icono: 'Layers',
      color: 'var(--accent)',
      categoria: 'habitos',
      meta: 5,
      progresoActual: Math.min(5, totalHabitos),
      desbloqueada: totalHabitos >= 5,
    },
    {
      id: 'centenario',
      nombre: 'Centenario',
      descripcion: 'Alcanzaste la impresionante marca de 100 check-ins en Racha.',
      requisito: '100 check-ins totales',
      icono: 'Trophy',
      color: 'var(--accent)',
      categoria: 'checkins',
      meta: 100,
      progresoActual: Math.min(100, totalCheckins),
      desbloqueada: totalCheckins >= 100,
    },
    {
      id: 'imparable',
      nombre: 'Imparable',
      descripcion: '60 días de constancia absoluta. Nada detiene tu progreso.',
      requisito: 'Racha de 60 días',
      icono: 'Crown',
      color: 'var(--ambar)',
      categoria: 'racha',
      meta: 60,
      progresoActual: Math.min(60, bestStreak),
      desbloqueada: bestStreak >= 60,
    },
  ];
};
