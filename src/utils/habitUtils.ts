import { Habito, Registro, Subtarea, FrecuenciaHabito } from '../types';

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD to Date object at local midnight
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateToString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Subtracts N days from a YYYY-MM-DD string
 */
export function subtractDays(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() - days);
  return formatDateToString(date);
}

/**
 * Checks if a habit is scheduled for a specific date
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export function isHabitScheduledForDate(habito: Habito, dateStr: string): boolean {
  if (habito.frecuencia === 'semanal') {
    return false; // los semanales no son de un día fijo; se gestionan por cuota semanal
  }
  const date = parseDateString(dateStr);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday

  if (habito.frecuencia === 'diario') {
    return true;
  }

  if (habito.frecuencia === 'entreSemana') {
    // Monday (1) to Friday (5)
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (habito.frecuencia === 'personalizado') {
    if (!habito.diasPersonalizados || habito.diasPersonalizados.length === 0) {
      return true;
    }
    return habito.diasPersonalizados.includes(dayOfWeek);
  }

  return true;
}

/**
 * Checks if a habit is completed on a specific date
 */
export function isHabitCompletedOnDate(habitoId: string, dateStr: string, registros: Registro[]): boolean {
  const reg = registros.find((r) => r.habitoId === habitoId && r.fecha === dateStr);
  return !!reg && reg.completado;
}

/**
 * Calculates current consecutive streak for a habit, respecting its frequency.
 * Non-scheduled days do not break the streak.
 */
export function calcularRachaActual(habito: Habito, registros: Registro[], todayStr = getTodayString(), diasCongelados: string[] = []): number {
  let streak = 0;
  let currentDate = todayStr;
  const isTodayScheduled = isHabitScheduledForDate(habito, todayStr);
  const isTodayCompleted = isHabitCompletedOnDate(habito.id, todayStr, registros);

  // If today is scheduled and completed, we count today
  if (isTodayScheduled && isTodayCompleted) {
    streak += 1;
    currentDate = subtractDays(todayStr, 1);
  } else if (!isTodayScheduled) {
    // Today is not scheduled, start looking back from yesterday
    currentDate = subtractDays(todayStr, 1);
  } else {
    // Today is scheduled but NOT yet completed (in progress).
    // The streak is still alive from yesterday if previous scheduled day was completed.
    currentDate = subtractDays(todayStr, 1);
  }

  // Look back up to 365 days or habit creation date
  for (let i = 0; i < 365; i++) {
    const isScheduled = isHabitScheduledForDate(habito, currentDate);
    if (isScheduled) {
      const isCompleted = isHabitCompletedOnDate(habito.id, currentDate, registros);
      if (isCompleted) {
        streak += 1;
      } else if (diasCongelados.includes(currentDate)) {
        // Día protegido con comodín: no rompe la racha
      } else {
        break;
      }
    }
    // Advance 1 day into the past
    currentDate = subtractDays(currentDate, 1);
  }

  return streak;
}

/**
 * Calculates best historical streak for a habit
 */
export function calcularMejorRacha(habito: Habito, registros: Registro[], diasCongelados: string[] = []): number {
  const currentStreak = calcularRachaActual(habito, registros, getTodayString(), diasCongelados);
  let maxStreak = currentStreak;
  let runningStreak = 0;

  // Scan past 365 days in chronological order
  const todayStr = getTodayString();
  const startDate = subtractDays(todayStr, 365);

  let cur = startDate;
  while (cur <= todayStr) {
    if (isHabitScheduledForDate(habito, cur)) {
      if (isHabitCompletedOnDate(habito.id, cur, registros)) {
        runningStreak++;
        if (runningStreak > maxStreak) {
          maxStreak = runningStreak;
        }
      } else if (diasCongelados.includes(cur)) {
        // Día protegido: no reinicia la racha
      } else {
        runningStreak = 0;
      }
    }
    const nextDate = parseDateString(cur);
    nextDate.setDate(nextDate.getDate() + 1);
    cur = formatDateToString(nextDate);
  }

  return maxStreak;
}

/**
 * Calculates global consecutive streak (days where 100% of scheduled habits were completed)
 */
export function calcularRachaGlobal(habitos: Habito[], registros: Registro[], todayStr = getTodayString(), diasCongelados: string[] = []): number {
  if (habitos.length === 0) return 0;

  let streak = 0;
  let currentDate = todayStr;

  const habitsToday = habitos.filter((h) => isHabitScheduledForDate(h, todayStr));
  const completedTodayCount = habitsToday.filter((h) => isHabitCompletedOnDate(h.id, todayStr, registros)).length;
  const isToday100 = habitsToday.length > 0 && completedTodayCount === habitsToday.length;

  if (isToday100) {
    streak += 1;
    currentDate = subtractDays(todayStr, 1);
  } else {
    // Today is in progress, check previous days
    currentDate = subtractDays(todayStr, 1);
  }

  for (let i = 0; i < 365; i++) {
    const scheduledHabits = habitos.filter((h) => isHabitScheduledForDate(h, currentDate));
    if (scheduledHabits.length > 0) {
      const completedCount = scheduledHabits.filter((h) => isHabitCompletedOnDate(h.id, currentDate, registros)).length;
      if (completedCount === scheduledHabits.length) {
        streak += 1;
      } else if (diasCongelados.includes(currentDate)) {
        // Día protegido con comodín
      } else {
        break;
      }
    }
    currentDate = subtractDays(currentDate, 1);
  }

  return streak;
}

// Devuelve las 7 fechas (Lun..Dom) de la semana que contiene dateStr
export function getSemanaDates(dateStr: string): string[] {
  const date = parseDateString(dateStr);
  const day = date.getDay(); // 0=Dom..6=Sáb
  const offsetToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - offsetToMonday);
  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(formatDateToString(d));
  }
  return week;
}

// Cuenta cuántos días de ESTA semana (la de dateStr) se completó el hábito
export function contarCompletadosSemana(habitoId: string, dateStr: string, registros: Registro[]): number {
  return getSemanaDates(dateStr).filter((f) => isHabitCompletedOnDate(habitoId, f, registros)).length;
}

// Racha en semanas consecutivas cumpliendo la meta. La semana actual cuenta si ya se cumplió; si no, no rompe (en progreso).
export function calcularRachaSemanal(habito: Habito, registros: Registro[], todayStr = getTodayString()): number {
  const meta = habito.vecesPorSemana && habito.vecesPorSemana > 0 ? habito.vecesPorSemana : 1;
  let streak = 0;
  if (contarCompletadosSemana(habito.id, todayStr, registros) >= meta) streak += 1;
  let prevRef = subtractDays(getSemanaDates(todayStr)[0], 1); // último día de la semana previa
  for (let i = 0; i < 104; i++) {
    if (contarCompletadosSemana(habito.id, prevRef, registros) >= meta) {
      streak += 1;
    } else {
      break;
    }
    prevRef = subtractDays(getSemanaDates(prevRef)[0], 1);
  }
  return streak;
}

/**
 * Calcula la constancia del hábito en los últimos 30 días, sin contar días antes de su creación
 * ni contar hoy si todavía no se ha completado.
 * Retorna { cumplidos, programados }
 */
export function calcularConstanciaHabito(
  habito: Habito, 
  registros: Registro[], 
  diasCongelados: string[] = [], 
  todayStr = getTodayString()
): { cumplidos: number; programados: number; comodinesUsados: number } {
  let programados = 0;
  let cumplidos = 0;
  let comodinesUsados = 0;

  const creationObj = new Date(habito.creadoEn);
  const creationDate = formatDateToString(creationObj);
  const isTodayCompleted = isHabitCompletedOnDate(habito.id, todayStr, registros);
  
  for (let i = 0; i < 30; i++) {
    const cur = subtractDays(todayStr, i);
    
    if (cur < creationDate) {
      break;
    }

    if (i === 0 && !isTodayCompleted) {
      continue;
    }

    const scheduled = isHabitScheduledForDate(habito, cur);
    if (scheduled) {
      programados++;
      const completed = isHabitCompletedOnDate(habito.id, cur, registros);
      if (completed) {
        cumplidos++;
      } else if (diasCongelados.includes(cur)) {
        cumplidos++;
        comodinesUsados++;
      }
    }
  }

  return { cumplidos, programados, comodinesUsados };
}

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function getFrecuenciaLegible(habito: Habito): string {
  if (habito.frecuencia === 'diario') return 'Diario';
  if (habito.frecuencia === 'entreSemana') return 'Lun a vie';
  if (habito.frecuencia === 'semanal') return `${habito.vecesPorSemana || 1} por semana`;
  if (habito.frecuencia === 'personalizado' && habito.diasPersonalizados) {
    return habito.diasPersonalizados.map(d => DIAS_CORTOS[d]).join(', ');
  }
  return 'Personalizado';
}

/**
 * Obtiene todas las hojas del árbol de subtareas de forma recursiva
 */
export function obtenerHojasSubtareas(subtareas?: Subtarea[]): Subtarea[] {
  if (!subtareas || subtareas.length === 0) return [];
  const hojas: Subtarea[] = [];
  const recorrer = (list: Subtarea[]) => {
    for (const item of list) {
      if (item.subtareas && item.subtareas.length > 0) {
        recorrer(item.subtareas);
      } else {
        hojas.push(item);
      }
    }
  };
  recorrer(subtareas);
  return hojas;
}

/**
 * Cuenta total y hechas de hojas de subtareas
 */
export function contarHojasSubtareas(subtareas?: Subtarea[]): { total: number; hechas: number } {
  if (!subtareas || subtareas.length === 0) {
    return { total: 0, hechas: 0 };
  }
  let total = 0;
  let hechas = 0;
  const recorrer = (list: Subtarea[]) => {
    for (const item of list) {
      if (item.subtareas && item.subtareas.length > 0) {
        recorrer(item.subtareas);
      } else {
        total += 1;
        if (item.hecha) hechas += 1;
      }
    }
  };
  recorrer(subtareas);
  return { total, hechas };
}

/**
 * Determina si una tarea está completada (todas sus hojas con texto están hechas)
 */
export function esTareaCompletada(subtareas?: Subtarea[]): boolean {
  if (!subtareas || subtareas.length === 0) return false;
  const hojas = obtenerHojasSubtareas(subtareas).filter((h) => h.texto && h.texto.trim().length > 0);
  return hojas.length > 0 && hojas.every((h) => h.hecha);
}

/**
 * Alterna el estado de una subtarea en el árbol recursivo:
 * - Hoja: cambia su estado
 * - Padre: propaga el nuevo estado a todos sus descendientes
 * - Recalcula hacia arriba el estado 'hecha' de todos los ancestros
 */
export function toggleSubtareaEnArbol(subtareas: Subtarea[], targetId: string): Subtarea[] {
  const setAllDescendants = (sub: Subtarea, valor: boolean): Subtarea => {
    const hijos = sub.subtareas ? sub.subtareas.map((h) => setAllDescendants(h, valor)) : undefined;
    return { ...sub, hecha: valor, subtareas: hijos };
  };

  const traverse = (list: Subtarea[]): Subtarea[] => {
    return list.map((node) => {
      if (node.id === targetId) {
        const tieneHijos = Boolean(node.subtareas && node.subtareas.length > 0);
        if (!tieneHijos) {
          return { ...node, hecha: !node.hecha };
        } else {
          const nuevoEstado = !node.hecha;
          return setAllDescendants(node, nuevoEstado);
        }
      }
      if (node.subtareas && node.subtareas.length > 0) {
        const nuevosHijos = traverse(node.subtareas);
        const hijosHechos = nuevosHijos.every((h) => h.hecha);
        return {
          ...node,
          subtareas: nuevosHijos,
          hecha: hijosHechos,
        };
      }
      return node;
    });
  };

  return traverse(subtareas);
}

/**
 * Limpia recursivamente el árbol de subtareas descartando nodos vacíos sin hijos
 */
export function limpiarArbolSubtareas(subtareas: Subtarea[]): Subtarea[] {
  const resultado: Subtarea[] = [];
  for (const node of subtareas) {
    const hijosLimpios = node.subtareas ? limpiarArbolSubtareas(node.subtareas) : [];
    const textoLimpio = node.texto ? node.texto.trim() : '';
    if (textoLimpio.length > 0 || hijosLimpios.length > 0) {
      resultado.push({
        ...node,
        texto: textoLimpio || 'Paso',
        subtareas: hijosLimpios.length > 0 ? hijosLimpios : undefined,
      });
    }
  }
  return resultado;
}

/**
 * Aplana el árbol en orden de recorrido respetando la profundidad
 */
export interface SubtareaPlana {
  sub: Subtarea;
  depth: number;
}

export function aplanarArbolSubtareas(subtareas: Subtarea[], depth = 0): SubtareaPlana[] {
  const resultado: SubtareaPlana[] = [];
  for (const item of subtareas) {
    resultado.push({ sub: item, depth });
    if (item.subtareas && item.subtareas.length > 0) {
      resultado.push(...aplanarArbolSubtareas(item.subtareas, depth + 1));
    }
  }
  return resultado;
}

/**
 * Puntos y Nivel
 */

export function calcularPuntosTotales(registros: Registro[]): number {
  const completados = registros.filter((r) => r.completado).length;
  return completados * 10;
}

export function calcularNivel(puntos: number): number {
  return Math.floor(puntos / 1000) + 1;
}

export function calcularProgresoNivel(puntos: number): number {
  return puntos % 1000;
}

/**
 * Reto
 */

export function contarProgresoReto(habito: Habito, registros: Registro[]): number {
  if (!habito.reto) return 0;
  
  if (habito.frecuencia === 'semanal') {
    let count = 0;
    const inicio = habito.reto.inicio;
    const hoy = getTodayString();
    if (inicio > hoy) return 0;
    
    let curWeekStart = getSemanaDates(inicio)[0];
    const maxWeekStart = getSemanaDates(hoy)[0];
    
    while (curWeekStart <= maxWeekStart) {
      const completed = contarCompletadosSemana(habito.id, curWeekStart, registros);
      if (completed >= (habito.vecesPorSemana || 1)) {
        count++;
      }
      const d = parseDateString(curWeekStart);
      d.setDate(d.getDate() + 7);
      curWeekStart = formatDateToString(d);
    }
    return count;
  }
  
  let count = 0;
  for (const reg of registros) {
    if (reg.habitoId === habito.id && reg.fecha >= habito.reto.inicio && reg.completado) {
      count++;
    }
  }
  return count;
}

export function semanasEstimadasReto(meta: number, frecuencia: FrecuenciaHabito, diasPersonalizados?: number[]): number | null {
  if (frecuencia === 'semanal') return null;
  let porSemana = 7;
  if (frecuencia === 'diario') porSemana = 7;
  else if (frecuencia === 'entreSemana') porSemana = 5;
  else if (frecuencia === 'personalizado') porSemana = diasPersonalizados?.length || 1;
  
  if (porSemana === 7) return null;
  return Math.ceil(meta / porSemana);
}

