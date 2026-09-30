import { Habito, Registro } from '../types';
import { getSemanaDates, isHabitCompletedOnDate, isHabitScheduledForDate, parseDateString, subtractDays } from './habitUtils';

/**
 * Celebración "Día completo" (design/maqueta-dia-completo.html, DESIGN.md › Sistema de juego).
 * Un día es completo cuando se hicieron todos los hábitos que tocaban ese día (las tareas no cuentan).
 * Un día sin hábitos programados no es completo, pero tampoco corta los días seguidos.
 */

const LIMITE_DIAS = 400;
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const programados = (habitos: Habito[], fecha: string) => habitos.filter((h) => !h.archivado && isHabitScheduledForDate(h, fecha));

export function esDiaCompleto(habitos: Habito[], registros: Registro[], fecha: string): boolean {
  const tocan = programados(habitos, fecha);
  return tocan.length > 0 && tocan.every((h) => isHabitCompletedOnDate(h.id, fecha, registros));
}

export type TipoDiaCompleto = 'primera' | 'dificil' | 'volviste' | 'domingo' | 'seguidos' | 'otro';

export interface ResumenDiaCompleto {
  tipo: TipoDiaCompleto;
  subtitulo: string;
  mensaje: string;
  /** Días completos seguidos que terminan hoy (los días sin hábitos no cortan). */
  seguidos: number;
  /** Días completos de esta semana (lunes a domingo). */
  semana: number;
  /** Nombre del mes, días completos del mes hasta hoy y cuántos días van del mes. */
  mesNombre: string;
  mes: number;
  diasMes: number;
  /** Hábitos que tocaban hoy (todos hechos). */
  habitos: number;
}

/** null si hoy no es un día completo. `dificil`: hoy es un día difícil (design/maqueta-dia-dificil.html). */
export function resumenDiaCompleto(habitos: Habito[], registros: Registro[], hoy: string, dificil = false): ResumenDiaCompleto | null {
  // Los registros hechos, una sola vez (para no buscarlos día por día)
  const hechos = new Set(registros.filter((r) => r.completado).map((r) => `${r.habitoId}|${r.fecha}`));
  const completoEl = (fecha: string) => { const tocan = programados(habitos, fecha); return tocan.length > 0 && tocan.every((h) => hechos.has(`${h.id}|${fecha}`)); };
  if (!completoEl(hoy)) return null;

  // Días seguidos hasta hoy y el último día completo antes de hoy
  let seguidos = 0;
  let cortado = false;
  let ultimoAntes: string | null = null;
  let perdidos = 0; // días con hábitos sin completar entre el último día completo y hoy
  for (let i = 0; i < LIMITE_DIAS; i++) {
    const fecha = subtractDays(hoy, i);
    const tocan = programados(habitos, fecha).length;
    const completo = tocan > 0 && completoEl(fecha);
    if (!cortado) {
      if (tocan === 0) continue;
      if (completo) seguidos++;
      else cortado = true;
    }
    if (i > 0 && !ultimoAntes) {
      if (completo) ultimoAntes = fecha;
      else if (tocan > 0) perdidos++;
    }
    if (cortado && ultimoAntes) break;
  }

  const semana = getSemanaDates(hoy).filter((f) => f <= hoy && completoEl(f)).length;
  const d = parseDateString(hoy);
  const diasMes = d.getDate();
  let mes = 0;
  for (let i = 0; i < diasMes; i++) if (completoEl(subtractDays(hoy, i))) mes++;

  let tipo: TipoDiaCompleto;
  if (!ultimoAntes) tipo = 'primera';
  else if (dificil) tipo = 'dificil';
  else if (perdidos >= 2) tipo = 'volviste';
  else if (d.getDay() === 0) tipo = 'domingo';
  else if (seguidos >= 2) tipo = 'seguidos';
  else tipo = 'otro';

  const textos: Record<TipoDiaCompleto, [string, string]> = {
    primera: ['Tu primer día completo', 'Cumpliste todos tus hábitos de hoy. Así se empieza.'],
    dificil: ['En un día difícil, vale igual', 'Hiciste lo que pudiste y cumpliste todo.'],
    volviste: ['Volviste y completaste el día', 'No importa cuántos días pasaron. Hoy cumpliste todo.'],
    domingo: ['Cerraste la semana con el día completo', `Esta semana tuviste ${semana} ${semana === 1 ? 'día completo' : 'días completos'} de 7.`],
    seguidos: [`${seguidos} días completos seguidos`, 'Vas construyendo algo que se nota.'],
    otro: ['Otro día completo', 'Cumpliste todos tus hábitos de hoy.'],
  };

  return {
    tipo,
    subtitulo: textos[tipo][0],
    mensaje: textos[tipo][1],
    seguidos,
    semana,
    mesNombre: MESES[d.getMonth()],
    mes,
    diasMes,
    habitos: programados(habitos, hoy).length,
  };
}

// Una sola vez por día en este aparato (si desmarcas y vuelves a marcar, no se repite)
const CLAVE_VISTO = 'racha_dia_completo_visto';
export function diaCompletoYaMostrado(hoy: string): boolean {
  try { return localStorage.getItem(CLAVE_VISTO) === hoy; } catch { return false; }
}
export function marcarDiaCompletoMostrado(hoy: string): void {
  try { localStorage.setItem(CLAVE_VISTO, hoy); } catch { /* sin almacenamiento, se podría repetir; no pasa nada grave */ }
}
