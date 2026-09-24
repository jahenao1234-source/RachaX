import { Habito, Registro } from '../types';
import { 
  parseDateString, 
  formatDateToString, 
  isHabitScheduledForDate, 
  isHabitCompletedOnDate, 
  contarCompletadosSemana 
} from './habitUtils';

/** 
 * Añade N días a un YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateToString(d);
}

/**
 * Calcula la serie de fuerza diaria (0 a 1) para un hábito desde su creación hasta 'hastaStr'.
 */
export function fuerzaSerieHabito(
  habito: Habito, 
  registros: Registro[], 
  diasCongelados: string[], 
  hastaStr: string
): { fecha: string; valor: number }[] {
  const startStr = formatDateToString(new Date(habito.creadoEn));
  if (startStr > hastaStr) return [];

  const result: { fecha: string; valor: number }[] = [];
  let currentF = 0;
  
  if (habito.frecuencia === 'semanal') {
    const m = Math.pow(0.5, 1 / 4);
    const meta = habito.vecesPorSemana || 1;
    let curDate = startStr;
    
    while (curDate <= hastaStr) {
      const dObj = parseDateString(curDate);
      const dayOfWeek = dObj.getDay(); // 0 = Dom
      
      // Si hoy es domingo o es el último día (hastaStr), evaluamos la semana
      // Para simplificar, la regla dice "al cerrar cada semana lunes-domingo".
      // Vamos a actualizar `f` todos los domingos.
      if (dayOfWeek === 0) {
        // En los semanales usamos contarCompletadosSemana
        const weekCompletados = contarCompletadosSemana(habito.id, curDate, registros);
        const v = Math.min(1, weekCompletados / meta);
        currentF = currentF * m + v * (1 - m);
      }
      
      result.push({ fecha: curDate, valor: currentF });
      curDate = addDays(curDate, 1);
    }
    return result;
  }

  // Hábitos no semanales
  const m = Math.pow(0.5, 1 / 13);
  let curDate = startStr;
  
  while (curDate <= hastaStr) {
    if (isHabitScheduledForDate(habito, curDate)) {
      const completado = isHabitCompletedOnDate(habito.id, curDate, registros);
      const congelado = diasCongelados.includes(curDate);
      
      if (completado) {
        currentF = currentF * m + 1 * (1 - m);
      } else if (congelado) {
        // no cambia f
      } else {
        currentF = currentF * m + 0 * (1 - m);
      }
    }
    result.push({ fecha: curDate, valor: currentF });
    curDate = addDays(curDate, 1);
  }
  
  return result;
}

/**
 * Calcula la serie de fuerza total (promedio de los activos) 0-100.
 */
export function serieFuerzaTotal(
  habitosActivos: Habito[], 
  registros: Registro[], 
  diasCongelados: string[], 
  hastaStr: string
): { fecha: string; valor: number }[] {
  if (habitosActivos.length === 0) return [];
  
  // Encontrar el creadoEn más antiguo
  let oldestDate = formatDateToString(new Date(habitosActivos[0].creadoEn));
  for (const h of habitosActivos) {
    const d = formatDateToString(new Date(h.creadoEn));
    if (d < oldestDate) oldestDate = d;
  }
  
  if (oldestDate > hastaStr) return [];
  
  // Calcular la serie individual para cada hábito
  const series = new Map<string, Map<string, number>>();
  for (const h of habitosActivos) {
    const s = fuerzaSerieHabito(h, registros, diasCongelados, hastaStr);
    const dayMap = new Map<string, number>();
    for (const p of s) {
      dayMap.set(p.fecha, p.valor);
    }
    series.set(h.id, dayMap);
  }
  
  const result: { fecha: string; valor: number }[] = [];
  let curDate = oldestDate;
  
  while (curDate <= hastaStr) {
    let sum = 0;
    let count = 0;
    
    for (const h of habitosActivos) {
      const dayMap = series.get(h.id);
      if (dayMap) {
        const val = dayMap.get(curDate);
        if (val !== undefined) {
          sum += val;
          count++;
        }
      }
    }
    
    const avg = count > 0 ? sum / count : 0;
    result.push({ fecha: curDate, valor: Math.round(avg * 100) });
    curDate = addDays(curDate, 1);
  }
  
  return result;
}

/**
 * Tasa de éxito en un periodo para los hábitos dados
 */
export function tasaPeriodo(
  habitos: Habito[], 
  registros: Registro[], 
  diasCongelados: string[], 
  desdeStr: string, 
  hastaStr: string,
  filtroDia?: (fecha: string, habito: Habito) => boolean
): { programados: number; cumplidos: number; congelados: number; pct: number } {
  let programados = 0;
  let cumplidos = 0;
  let congelados = 0;
  
  let curDate = desdeStr;
  while (curDate <= hastaStr) {
    for (const h of habitos) {
      if (h.frecuencia === 'semanal') continue;
      
      const creadoEnStr = formatDateToString(new Date(h.creadoEn));
      if (curDate < creadoEnStr) continue;
      
      if (isHabitScheduledForDate(h, curDate)) {
        if (filtroDia && !filtroDia(curDate, h)) continue;
        
        programados++;
        const isCompleted = isHabitCompletedOnDate(h.id, curDate, registros);
        if (isCompleted) {
          cumplidos++;
        } else if (diasCongelados.includes(curDate)) {
          congelados++;
        }
      }
    }
    curDate = addDays(curDate, 1);
  }
  
  const base = programados - congelados;
  const pct = base > 0 ? Math.round((cumplidos / base) * 100) : 0;
  
  return { programados, cumplidos, congelados, pct };
}

/**
 * Calcular mejor racha global en un periodo (días en que 100% programados se cumplen)
 */
export function calcularMejorRachaGlobal(
  habitosActivos: Habito[], 
  registros: Registro[], 
  diasCongelados: string[], 
  desdeStr: string, 
  hastaStr: string
): number {
  if (habitosActivos.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  
  let curDate = desdeStr;
  while (curDate <= hastaStr) {
    // Buscar programados de hoy
    const scheduled = habitosActivos.filter(h => h.frecuencia !== 'semanal' && curDate >= formatDateToString(new Date(h.creadoEn)) && isHabitScheduledForDate(h, curDate));
    
    if (scheduled.length === 0) {
      // día sin nada programado: se salta
      curDate = addDays(curDate, 1);
      continue;
    }
    
    const completed = scheduled.filter(h => isHabitCompletedOnDate(h.id, curDate, registros)).length;
    
    if (completed === scheduled.length) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (diasCongelados.includes(curDate)) {
      // congelado: no corta y no suma
    } else {
      currentStreak = 0;
    }
    
    curDate = addDays(curDate, 1);
  }
  
  return maxStreak;
}

/**
 * Total de veces que un hábito fue completado históricamente
 */
export function contarVecesCumplidas(habitos: Habito[], registros: Registro[]): number {
  let count = 0;
  for (const reg of registros) {
    if (reg.completado) {
      const exists = habitos.some(h => h.id === reg.habitoId);
      if (exists) count++;
    }
  }
  return count;
}
