import { Habito, Registro } from '../types';
import {
  calcularRachaGlobal,
  contarCompletadosSemana,
  isHabitCompletedOnDate,
  isHabitScheduledForDate,
  parseDateString,
  puntosDeRegistro,
  subtractDays,
} from './habitUtils';

/**
 * Comodines y día difícil (design/maqueta-dia-dificil.html, DESIGN.md › "#### Comodines y día difícil").
 * - La versión mínima de un hábito (Habito.minimo) es lo más pequeño que cuenta como cumplido.
 * - Un día difícil (fecha en diasDificiles) hace que marcar un hábito con mínima cuente como mínima:
 *   cumplido, con 5 puntos (Registro.minimo). Cuenta igual en racha, constancia, Día completo, retos e insignias.
 * - El comodín automático (opcional, apagado de entrada) congela los días rotos solo si así se salva la racha.
 */

export { puntosDeRegistro };
export const PUNTOS_HABITO = 10;
export const PUNTOS_MINIMO = 5;
export const MAX_MINIMO = 60;

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const diaCorto = (fecha: string) => { const d = parseDateString(fecha); return `${DIAS[d.getDay()]} ${d.getDate()}`; };

// ---------- La versión mínima ----------

/** Los hábitos a evitar no tienen versión mínima. */
export const puedeTenerMinimo = (h: Habito): boolean => h.tipo !== 'negativo';

/** Tiene una mínima escrita (y puede tenerla). */
export const tieneMinimo = (h: Habito): boolean => puedeTenerMinimo(h) && !!h.minimo && h.minimo.trim().length > 0;

/** Limpia lo que se escribe en el campo: sin espacios de más, máximo 60 letras. Vacío = sin mínima. */
export function limpiarMinimo(texto: string | undefined | null): string | undefined {
  const t = (texto || '').replace(/\s+/g, ' ').trim().slice(0, MAX_MINIMO).trim();
  return t ? t : undefined;
}

/**
 * Guarda lo escrito en la hoja "Día difícil": cada hábito de `cambios` queda con su mínima,
 * o sin ella si el campo quedó vacío. Los demás no cambian. Devuelve el mismo arreglo si no cambió nada.
 */
export function aplicarMinimos(habitos: Habito[], cambios: Record<string, string>): Habito[] {
  let cambio = false;
  const nuevos = habitos.map((h) => {
    if (!(h.id in cambios) || !puedeTenerMinimo(h)) return h;
    const minimo = limpiarMinimo(cambios[h.id]);
    if (minimo === h.minimo) return h;
    cambio = true;
    const { minimo: _viejo, ...resto } = h;
    return minimo ? { ...resto, minimo } : resto;
  });
  return cambio ? nuevos : habitos;
}

// ---------- El día difícil ----------

export const esDiaDificil = (diasDificiles: string[], fecha: string): boolean => diasDificiles.includes(fecha);

/** Activa el día difícil de `fecha` (sin repetir; se guardan los últimos 400 días). */
export function activarDificil(diasDificiles: string[], fecha: string): string[] {
  if (diasDificiles.includes(fecha)) return diasDificiles;
  return [...diasDificiles, fecha].sort().slice(-400);
}

/** Quita el día difícil. Lo que ya se marcó con la mínima se queda así. */
export function quitarDificil(diasDificiles: string[], fecha: string): string[] {
  return diasDificiles.includes(fecha) ? diasDificiles.filter((d) => d !== fecha) : diasDificiles;
}

/**
 * Los hábitos que salen en la hoja "Día difícil": los que se pueden hacer en mínima y todavía faltan hoy.
 * Diarios o de días fijos: si tocan hoy y no están hechos. Semanales: si no se han hecho hoy y no han llegado a su meta de la semana.
 */
export function pendientesParaDificil(habitos: Habito[], registros: Registro[], hoy: string): Habito[] {
  return habitos.filter((h) => {
    if (h.archivado || !puedeTenerMinimo(h)) return false;
    if (isHabitCompletedOnDate(h.id, hoy, registros)) return false;
    if (h.frecuencia === 'semanal') {
      const meta = h.vecesPorSemana && h.vecesPorSemana > 0 ? h.vecesPorSemana : 1;
      return contarCompletadosSemana(h.id, hoy, registros) < meta;
    }
    return isHabitScheduledForDate(h, hoy);
  });
}

export type EntradaDificil = 'activo' | 'enlace' | 'noche' | 'nada';

/**
 * Qué muestra la tarjeta "Tu día":
 * - 'activo': el aviso "Día difícil. Hoy basta con lo mínimo." con Quitar;
 * - 'noche': desde las 7 p. m., si lleva la mitad o menos de lo de hoy, la sugerencia "¿Día pesado?";
 * - 'enlace': la línea "¿Día pesado? Haz solo lo mínimo ›";
 * - 'nada': si no falta ningún hábito que se pueda hacer en mínima.
 */
export function entradaDificil(opc: { activo: boolean; pendientes: number; hechos: number; total: number; hora: number }): EntradaDificil {
  if (opc.activo) return 'activo';
  if (opc.pendientes <= 0) return 'nada';
  if (opc.hora >= 19 && opc.hechos * 2 <= opc.total) return 'noche';
  return 'enlace';
}

// ---------- Marcar con la mínima ----------

/**
 * La casilla de un hábito. Si ya estaba hecho, se desmarca (se borra el registro).
 * Si no: queda hecho; con el día difícil activo y el hábito con mínima, queda hecho con la mínima
 * (también los de meta: un toque basta, sin contar).
 */
export function marcarHabito(registros: Registro[], habito: Habito, fecha: string, dificil: boolean): Registro[] {
  const i = registros.findIndex((r) => r.habitoId === habito.id && r.fecha === fecha);
  if (i >= 0 && registros[i].completado) return registros.filter((_, k) => k !== i);
  const conMinimo = dificil && tieneMinimo(habito);
  const base: Registro = i >= 0 ? { ...registros[i] } : { habitoId: habito.id, fecha, completado: true };
  base.completado = true;
  if (conMinimo) base.minimo = true; else delete base.minimo;
  if (i < 0) return [...registros, base];
  const nuevos = [...registros];
  nuevos[i] = base;
  return nuevos;
}

/** "Lo hice completo": deja el registro como completo (10 puntos). En los de meta, el valor llega a la meta. */
export function pasarACompleto(registros: Registro[], habito: Habito, fecha: string): Registro[] {
  const i = registros.findIndex((r) => r.habitoId === habito.id && r.fecha === fecha);
  if (i < 0 || !registros[i].completado || !registros[i].minimo) return registros;
  const { minimo: _m, ...resto } = registros[i];
  const nuevo: Registro = { ...resto, completado: true };
  if (habito.metaDiaria && habito.metaDiaria > 0) nuevo.valor = Math.max(nuevo.valor ?? 0, habito.metaDiaria);
  const nuevos = [...registros];
  nuevos[i] = nuevo;
  return nuevos;
}

/**
 * El contador de un hábito de meta (+1 / −1). null = borrar el registro (valor en 0).
 * Llegar a la meta = completo (sin mínima). Si ya estaba hecho con la mínima y no llega a la meta, sigue hecho con la mínima.
 */
export function registroConValor(prev: Registro | undefined, habito: Habito, fecha: string, valor: number): Registro | null {
  if (valor <= 0) return null;
  const llega = habito.metaDiaria ? valor >= habito.metaDiaria : valor > 0;
  const r: Registro = { ...(prev || { habitoId: habito.id, fecha, completado: false }), valor };
  if (llega) { r.completado = true; delete r.minimo; }
  else if (prev?.minimo && prev.completado) { r.completado = true; r.minimo = true; }
  else { r.completado = false; delete r.minimo; }
  return r;
}

/** Al cambiar la meta en Editar hábito: se recalcula el de hoy, pero uno hecho con la mínima sigue hecho. */
export function recalcularConMeta(r: Registro, meta: number | undefined): Registro {
  if (typeof r.valor !== 'number') return r;
  const llega = meta ? r.valor >= meta : r.valor > 0;
  if (r.minimo && r.completado && !llega) return r;
  const nuevo: Registro = { ...r, completado: llega };
  if (llega) delete nuevo.minimo;
  return nuevo;
}

// ---------- Puntos ----------

/** "+N pts hoy": lo hecho hoy (5 con la mínima, 10 completo), el doble el día de regreso. */
export function puntosDeHoy(registros: Registro[], hoy: string, regreso: boolean): number {
  const base = registros.filter((r) => r.fecha === hoy).reduce((s, r) => s + puntosDeRegistro(r), 0);
  return regreso ? base * 2 : base;
}

/** Lo que vale marcar un hábito ahora (el "+10" de la fila y el aviso). */
export function puntosAlMarcar(habito: Habito, dificil: boolean, regreso: boolean): number {
  const base = dificil && tieneMinimo(habito) ? PUNTOS_MINIMO : PUNTOS_HABITO;
  return regreso ? base * 2 : base;
}

/** "+N pts por ganar": la suma de lo que vale cada hábito pendiente. */
export function puntosPorGanar(pendientes: Habito[], dificil: boolean, regreso: boolean): number {
  return pendientes.reduce((s, h) => s + puntosAlMarcar(h, dificil, regreso), 0);
}

// ---------- Ayer sin marcar ----------

const tocanEse = (habitos: Habito[], fecha: string) => habitos.filter((h) => !h.archivado && isHabitScheduledForDate(h, fecha));

/** Cuántos hábitos quedaron sin marcar ese día (de los que tocaban). */
export function faltaronEse(habitos: Habito[], registros: Registro[], fecha: string): number {
  return tocanEse(habitos, fecha).filter((h) => !isHabitCompletedOnDate(h.id, fecha, registros)).length;
}

/** Ayer, si tocaba algo, quedó algo sin marcar y no está congelado. */
export function ayerSinMarcar(habitos: Habito[], registros: Registro[], diasCongelados: string[], hoy: string): { fecha: string; faltan: number } | null {
  const ayer = subtractDays(hoy, 1);
  if (diasCongelados.includes(ayer)) return null;
  const faltan = faltaronEse(habitos, registros, ayer);
  return faltan > 0 ? { fecha: ayer, faltan } : null;
}

/** "Ayer, martes 29, quedaron 6 hábitos sin marcar. Si sí los hiciste, márcalos en el calendario." */
export function textoAyerSinMarcar(a: { fecha: string; faltan: number }): string {
  const cuantos = a.faltan === 1 ? 'quedó 1 hábito sin marcar' : `quedaron ${a.faltan} hábitos sin marcar`;
  return `Ayer, ${diaCorto(a.fecha)}, ${cuantos}. Si sí los hiciste, márcalos en el calendario.`;
}

// ---------- Comodín automático ----------

/**
 * Los días rotos seguidos justo antes de hoy (de ayer hacia atrás), en orden de fecha:
 * días que tenían hábitos, con alguno sin marcar y sin comodín. Se detiene en el primer día cumplido o congelado.
 * `llegoAUnDia` = false si no encontró ninguno en `limite` días (entonces no hay racha que salvar).
 */
export function diasRotosSeguidos(habitos: Habito[], registros: Registro[], diasCongelados: string[], hoy: string, limite = 60): { rotos: string[]; llegoAUnDia: boolean } {
  const rotos: string[] = [];
  for (let i = 1; i <= limite; i++) {
    const fecha = subtractDays(hoy, i);
    const tocan = tocanEse(habitos, fecha);
    if (tocan.length === 0) continue;
    if (diasCongelados.includes(fecha)) return { rotos: rotos.reverse(), llegoAUnDia: true };
    if (tocan.every((h) => isHabitCompletedOnDate(h.id, fecha, registros))) return { rotos: rotos.reverse(), llegoAUnDia: true };
    rotos.push(fecha);
  }
  return { rotos: rotos.reverse(), llegoAUnDia: false };
}

/**
 * Qué días congela el comodín automático al abrir la app (o al cambiar de día).
 * Solo si así se salva la racha: tiene que haber días rotos, alcanzar los comodines para TODOS,
 * y la racha de antes de esos días tiene que ir en más de 0. Si no, no gasta ninguno.
 */
export function comodinesAutomaticos(habitos: Habito[], registros: Registro[], diasCongelados: string[], comodines: number, hoy: string): string[] {
  const activos = habitos.filter((h) => !h.archivado);
  const { rotos, llegoAUnDia } = diasRotosSeguidos(activos, registros, diasCongelados, hoy);
  if (rotos.length === 0 || !llegoAUnDia || rotos.length > comodines) return [];
  const antes = subtractDays(rotos[0], 1);
  if (calcularRachaGlobal(activos, registros, antes, diasCongelados) <= 0) return [];
  return rotos;
}

/** Congela varias fechas de una vez, sin gastar más de los que hay. Devuelve los días congelados y los comodines que quedan. */
export function congelarVarios(diasCongelados: string[], comodines: number, fechas: string[]): { diasCongelados: string[]; comodines: number; congeladas: string[] } {
  const nuevas = fechas.filter((f, i) => !diasCongelados.includes(f) && fechas.indexOf(f) === i).slice(0, Math.max(0, comodines));
  return { diasCongelados: [...diasCongelados, ...nuevas], comodines: comodines - nuevas.length, congeladas: nuevas };
}

const listaY = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
const textoQuedan = (n: number) => (n <= 0 ? 'Era el último.' : n === 1 ? 'Te queda 1.' : `Te quedan ${n}.`);

/**
 * El aviso al abrir la app:
 * "Congelamos ayer, martes 29, con un comodín. Te queda 1."
 * "Congelamos el domingo 27 con un comodín. Te quedan 2."
 * "Congelamos 2 días con comodines: lunes 28 y martes 29. Era el último."
 */
export function textoAvisoAuto(fechas: string[], quedan: number, hoy: string): string {
  if (fechas.length === 1) {
    const f = fechas[0];
    const cual = f === subtractDays(hoy, 1) ? `ayer, ${diaCorto(f)},` : `el ${diaCorto(f)}`;
    return `Congelamos ${cual} con un comodín. ${textoQuedan(quedan)}`;
  }
  return `Congelamos ${fechas.length} días con comodines: ${listaY(fechas.map(diaCorto))}. ${textoQuedan(quedan)}`;
}

// ---------- La hoja "Tus comodines" ----------

/** "2 comodines" / "1 comodín" / "0 comodines". */
export const textoChip = (n: number): string => `${n} ${n === 1 ? 'comodín' : 'comodines'}`;

/** aria-label del chip: "Tus comodines: te quedan 2" / "te queda 1" / "no te quedan". */
export const ariaChip = (n: number): string => (n <= 0 ? 'Tus comodines: no te quedan' : n === 1 ? 'Tus comodines: te queda 1' : `Tus comodines: te quedan ${n}`);

/** Subtítulo: "Tienes 2 · guardas hasta 3" / "No te quedan comodines". */
export const subtituloComodines = (n: number, max = 3): string => (n <= 0 ? 'No te quedan comodines' : `Tienes ${n} · guardas hasta ${max}`);

/** "Congelar ayer · te quedan 2" / "· te queda 1". */
export const textoCongelarAyer = (n: number): string => `Congelar ayer · ${n === 1 ? 'te queda 1' : `te quedan ${n}`}`;

/** "el 1 de octubre": cuándo llega el próximo (el día 1 del mes siguiente). */
export function proximoComodin(hoy: string): string {
  const d = parseDateString(hoy);
  return `el 1 de ${MESES[(d.getMonth() + 1) % 12]}`;
}

export interface UsadoDelMes {
  fecha: string;
  /** "Viernes 25 de septiembre" */
  titulo: string;
  /** "Congelaste 7 hábitos" / "Congelaste 1 hábito" / "Congelaste el día"; con " · automático" si lo usó el comodín automático. */
  detalle: string;
  automatico: boolean;
}

/** Los comodines usados en el mes de `hoy`, del más nuevo al más viejo. */
export function usadosDelMes(diasCongelados: string[], automaticos: string[], habitos: Habito[], registros: Registro[], hoy: string): UsadoDelMes[] {
  const mes = hoy.slice(0, 7);
  return diasCongelados
    .filter((f) => f.slice(0, 7) === mes && f <= hoy)
    .sort()
    .reverse()
    .map((fecha) => {
      const d = parseDateString(fecha);
      const n = faltaronEse(habitos, registros, fecha);
      const base = n === 0 ? 'Congelaste el día' : n === 1 ? 'Congelaste 1 hábito' : `Congelaste ${n} hábitos`;
      const automatico = automaticos.includes(fecha);
      return { fecha, titulo: `${mayus(DIAS[d.getDay()])} ${d.getDate()} de ${MESES[d.getMonth()]}`, detalle: automatico ? `${base} · automático` : base, automatico };
    });
}
