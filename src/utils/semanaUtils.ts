import { Habito, Registro, Subtarea, Tarea } from '../types';
import { getSemanaDates, isHabitScheduledForDate, parseDateString, formatDateToString } from './habitUtils';
import { textoAtraso } from './hoyUtils';

/**
 * Tu semana (design/maqueta-tu-semana.html, DESIGN.md › Tu semana).
 * Funciones puras: cómo vas en la semana, el hábito a rescatar y los pasos de cada día.
 */

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const sumarDias = (fecha: string, n: number) => {
  const d = parseDateString(fecha);
  d.setDate(d.getDate() + n);
  return formatDateToString(d);
};

/** Las 7 fechas (lunes a domingo) de esta semana o de la próxima. */
export function diasDeSemana(hoy: string, cual: 'esta' | 'proxima'): string[] {
  return getSemanaDates(cual === 'esta' ? hoy : sumarDias(hoy, 7));
}

/** "21 al 27 sep" / "28 sep al 4 oct" */
export function rangoSemana(fechas: string[]): string {
  const a = parseDateString(fechas[0]);
  const b = parseDateString(fechas[6]);
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} al ${b.getDate()} ${MESES_CORTOS[b.getMonth()]}`
    : `${a.getDate()} ${MESES_CORTOS[a.getMonth()]} al ${b.getDate()} ${MESES_CORTOS[b.getMonth()]}`;
}

/** "Jue" y el número del día, para las columnas. */
export function etiquetaDia(fecha: string): { corto: string; numero: number } {
  const d = parseDateString(fecha);
  return { corto: DIAS_CORTOS[d.getDay()], numero: d.getDate() };
}

export type EstadoDia = 'ok' | 'medio' | 'como' | 'gris' | 'hoy' | 'fut' | 'libre';
export interface DiaComoVas { fecha: string; estado: EstadoDia; hechos: number; tocan: number }
export interface ComoVas { dias: DiaComoVas[]; cumplidas: number; tocaban: number; quedan: number }

const activos = (habitos: Habito[]) => habitos.filter((h) => !h.archivado && h.frecuencia !== 'semanal');

/**
 * Cómo vas esta semana. Cuenta de lunes a hoy (incluido): "Cumpliste {cumplidas} de {tocaban} veces".
 * Los días con comodín no suman a "tocaban". quedan = días que faltan después de hoy.
 */
export function comoVasSemana(habitos: Habito[], registros: Registro[], diasCongelados: string[], hoy: string): ComoVas {
  const hechos = new Set(registros.filter((r) => r.completado).map((r) => `${r.habitoId}|${r.fecha}`));
  const lista = activos(habitos);
  let cumplidas = 0;
  let tocaban = 0;
  const dias = getSemanaDates(hoy).map((fecha): DiaComoVas => {
    const tocanHoy = lista.filter((h) => isHabitScheduledForDate(h, fecha));
    const h = tocanHoy.filter((x) => hechos.has(`${x.id}|${fecha}`)).length;
    const t = tocanHoy.length;
    if (fecha > hoy) return { fecha, estado: 'fut', hechos: 0, tocan: t };
    if (diasCongelados.includes(fecha) && h < t) return { fecha, estado: 'como', hechos: h, tocan: t };
    cumplidas += h;
    tocaban += t;
    if (t === 0) return { fecha, estado: 'libre', hechos: 0, tocan: 0 };
    if (fecha === hoy) return { fecha, estado: 'hoy', hechos: h, tocan: t };
    return { fecha, estado: h === t ? 'ok' : h > 0 ? 'medio' : 'gris', hechos: h, tocan: t };
  });
  const quedan = dias.filter((d) => d.fecha > hoy).length;
  return { dias, cumplidas, tocaban, quedan };
}

export interface Rescate { habito: Habito; hechas: number; tocaban: number }

/**
 * El hábito a rescatar: el que peor va esta semana, solo si va por debajo del 50%
 * y ya le tocaron al menos 2 días (sin contar hoy si todavía no lo hiciste, ni días con comodín).
 * null si ninguno lo necesita o si la persona lo ocultó esta semana.
 */
export function rescateSemana(habitos: Habito[], registros: Registro[], diasCongelados: string[], hoy: string): Rescate | null {
  const hechos = new Set(registros.filter((r) => r.completado).map((r) => `${r.habitoId}|${r.fecha}`));
  const semana = getSemanaDates(hoy).filter((f) => f <= hoy && !diasCongelados.includes(f));
  let peor: Rescate | null = null;
  for (const h of activos(habitos)) {
    const dias = semana.filter((f) => isHabitScheduledForDate(h, f) && (f < hoy || hechos.has(`${h.id}|${f}`)));
    if (dias.length < 2) continue;
    const hechas = dias.filter((f) => hechos.has(`${h.id}|${f}`)).length;
    if (hechas / dias.length >= 0.5) continue;
    if (!peor || hechas / dias.length < peor.hechas / peor.tocaban) peor = { habito: h, hechas, tocaban: dias.length };
  }
  if (peor && rescateOculto(hoy, peor.habito.id)) return null;
  return peor;
}

// "Dejarlo así": no se vuelve a mostrar ese hábito en Rescate esta semana (en este aparato)
const CLAVE_RESCATE = 'racha_rescate_oculto';
const lunesDe = (hoy: string) => getSemanaDates(hoy)[0];
export function rescateOculto(hoy: string, habitoId: string): boolean {
  try { return localStorage.getItem(CLAVE_RESCATE) === `${lunesDe(hoy)}|${habitoId}`; } catch { return false; }
}
export function ocultarRescate(hoy: string, habitoId: string): void {
  try { localStorage.setItem(CLAVE_RESCATE, `${lunesDe(hoy)}|${habitoId}`); } catch { /* sin almacenamiento, vuelve a salir */ }
}

export interface PasoDelDia { tareaId: string; tareaNombre: string; tareaIcono: string; paso: Subtarea; atraso?: string }

const hojas = (lista: Subtarea[], res: Subtarea[] = []) => {
  for (const s of lista) {
    if (s.subtareas && s.subtareas.length) hojas(s.subtareas, res);
    else if (s.texto?.trim()) res.push(s);
  }
  return res;
};

/**
 * Pasos de un día: los que tienen ese día y no están hechos, y los hechos ese día.
 * Hoy también muestra los atrasados sin hacer, con su texto ("de ayer").
 * Las tareas terminadas no aparecen.
 */
export function pasosDelDia(tareas: Tarea[], fecha: string, hoy: string): PasoDelDia[] {
  const res: PasoDelDia[] = [];
  for (const t of tareas) {
    if (t.completada) continue;
    for (const s of hojas(t.subtareas || [])) {
      const base = { tareaId: t.id, tareaNombre: t.nombre, tareaIcono: t.icono, paso: s };
      if (s.hecha) {
        if (s.hechaEn === fecha) res.push(base);
      } else if (s.fecha === fecha && fecha >= hoy) {
        res.push(base);
      } else if (fecha === hoy && s.fecha && s.fecha < hoy) {
        res.push({ ...base, atraso: textoAtraso(s.fecha, hoy) });
      }
    }
  }
  // Primero lo atrasado, luego lo pendiente y al final lo hecho
  const orden = (p: PasoDelDia) => (p.atraso ? 0 : p.paso.hecha ? 2 : 1);
  return res.sort((a, b) => orden(a) - orden(b));
}

export interface GrupoSinDia { tareaId: string; tareaNombre: string; tareaIcono: string; pasos: Subtarea[] }

/** Pasos sin día y sin hacer, agrupados por tarea abierta (en el orden de las tareas y de los pasos). */
export function pasosSinDia(tareas: Tarea[]): GrupoSinDia[] {
  return tareas
    .filter((t) => !t.completada)
    .map((t) => ({ tareaId: t.id, tareaNombre: t.nombre, tareaIcono: t.icono, pasos: hojas(t.subtareas || []).filter((s) => !s.hecha && !s.fecha) }))
    .filter((g) => g.pasos.length > 0);
}
