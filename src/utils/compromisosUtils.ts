import { Compromiso, MomentoPlan } from '../types';
import { parseDateString, formatDateToString } from './habitUtils';

/**
 * Compromisos de Tu semana (design/maqueta-tu-semana-2.html, DESIGN.md › Tu semana).
 * Funciones puras: no guardan nada, devuelven listas nuevas.
 */

export const nuevoIdCompromiso = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `c_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

/** Hasta las 11:59 es mañana; de 12:00 a 17:59, tarde; desde las 18:00, noche. */
export function momentoDeHora(hora: string): MomentoPlan {
  const h = parseInt(hora.split(':')[0], 10);
  if (h < 12) return 'manana';
  if (h < 18) return 'tarde';
  return 'noche';
}

/** '15:00' → '3:00 p. m.'; '09:05' → '9:05 a. m.' */
export function textoHora(hora: string): string {
  const [hh, mm] = hora.split(':').map((x) => parseInt(x, 10));
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm || 0).padStart(2, '0')} ${hh < 12 ? 'a. m.' : 'p. m.'}`;
}

/** El momento en que se muestra: el de la hora, o el elegido; null = "Cualquier momento". */
export function momentoDe(c: Pick<Compromiso, 'hora' | 'momento'>): MomentoPlan | null {
  if (c.hora) return momentoDeHora(c.hora);
  return c.momento ?? null;
}

/** ¿Este compromiso aplica ese día? (los que se repiten: mismo día de la semana, desde su fecha, sin excepciones) */
export function aplicaEn(c: Compromiso, fecha: string): boolean {
  if (!c.repetirSemanal) return c.fecha === fecha;
  if (fecha < c.fecha) return false;
  if (c.hasta && fecha > c.hasta) return false;
  if (c.excepciones?.includes(fecha)) return false;
  return parseDateString(fecha).getDay() === parseDateString(c.fecha).getDay();
}

/** Compromisos de un día, ordenados por hora (los que no tienen hora van al final). */
export function compromisosDelDia(lista: Compromiso[], fecha: string): Compromiso[] {
  return lista
    .filter((c) => aplicaEn(c, fecha))
    .sort((a, b) => (a.hora && b.hora ? a.hora.localeCompare(b.hora) : a.hora ? -1 : b.hora ? 1 : a.titulo.localeCompare(b.titulo)));
}

const sumarDias = (fecha: string, n: number) => {
  const d = parseDateString(fecha);
  d.setDate(d.getDate() + n);
  return formatDateToString(d);
};
const diasEntre = (desde: string, hasta: string) =>
  Math.round((parseDateString(hasta).getTime() - parseDateString(desde).getTime()) / 86400000);

/**
 * El próximo día (desde hoy, incluido) en que aplica el compromiso; null si ya no vuelve.
 * Los que se repiten saltan de semana en semana, se saltan las excepciones y respetan "hasta".
 */
export function proximaFecha(c: Compromiso, hoy: string): string | null {
  if (!c.repetirSemanal) return c.fecha >= hoy ? c.fecha : null;
  let f = c.fecha >= hoy ? c.fecha : sumarDias(c.fecha, Math.ceil(diasEntre(c.fecha, hoy) / 7) * 7);
  for (let i = 0; i < 104; i++) {
    if (c.hasta && f > c.hasta) return null;
    if (!c.excepciones?.includes(f)) return f;
    f = sumarDias(f, 7);
  }
  return null;
}

/** Minutos desde medianoche para ordenar: la hora, o el comienzo de su momento; sin hora ni momento, al final. */
const clave = (c: Compromiso) => {
  if (c.hora) { const [h, m] = c.hora.split(':').map(Number); return h * 60 + (m || 0); }
  return c.momento === 'manana' ? 0 : c.momento === 'tarde' ? 12 * 60 : c.momento === 'noche' ? 18 * 60 : 24 * 60;
};

export interface CompromisoProximo { c: Compromiso; fecha: string }

/**
 * "Tus compromisos" en Hoy (design/maqueta-compromisos.html): cada compromiso UNA sola vez,
 * en su próxima fecha (hoy incluido), ordenados por día y luego por hora o momento.
 */
export function proximosCompromisos(lista: Compromiso[], hoy: string): CompromisoProximo[] {
  return lista
    .map((c) => ({ c, fecha: proximaFecha(c, hoy) }))
    .filter((x): x is CompromisoProximo => x.fecha !== null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || clave(a.c) - clave(b.c) || a.c.titulo.localeCompare(b.c.titulo));
}

/** ¿Ya pasó? Solo los de hoy con hora anterior a este minuto (los de otros días o sin hora, nunca). */
export function yaPaso(c: Compromiso, fecha: string, hoy: string, minutosAhora: number): boolean {
  return fecha === hoy && !!c.hora && clave(c) < minutosAhora;
}

const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Título del grupo del día: "Hoy", "Mañana, martes 29", "Miércoles 30", "Sábado 3 de octubre" (con el año si es otro). */
export function tituloDiaCompromiso(fecha: string, hoy: string): string {
  if (fecha === hoy) return 'Hoy';
  const d = parseDateString(fecha);
  const h = parseDateString(hoy);
  const base = `${DIAS_LARGOS[d.getDay()]} ${d.getDate()}`;
  if (diasEntre(hoy, fecha) === 1) return `Mañana, ${base}`;
  if (d.getFullYear() !== h.getFullYear()) return `${mayus(base)} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  if (d.getMonth() !== h.getMonth()) return `${mayus(base)} de ${MESES[d.getMonth()]}`;
  return mayus(base);
}

/** La columna de la hora: "3:00 p. m.", o "En la tarde"; sin hora ni momento, "Todo el día". */
export function textoCuando(c: Pick<Compromiso, 'hora' | 'momento'>): string {
  if (c.hora) return textoHora(c.hora);
  return c.momento === 'manana' ? 'En la mañana' : c.momento === 'tarde' ? 'En la tarde' : c.momento === 'noche' ? 'En la noche' : 'Todo el día';
}

/** Debajo de "Repetir cada semana": "Todos los lunes a esta hora" / "Todos los sábados en la tarde". */
export function textoRepetir(fecha: string, hora?: string, momento?: MomentoPlan | null): string {
  const dia = DIAS_LARGOS[parseDateString(fecha).getDay()];
  const plural = dia === 'sábado' || dia === 'domingo' ? `${dia}s` : dia;
  if (hora) return `Todos los ${plural} a esta hora`;
  const m = momento === 'manana' ? 'mañana' : momento;
  return m ? `Todos los ${plural} en la ${m}` : `Todos los ${plural}`;
}

/** Para el aviso suave "Ya tienes algo a las 3:00 p. m.": otro compromiso ese día a la misma hora. */
export function coincideCon(lista: Compromiso[], fecha: string, hora: string | undefined, sinId?: string): Compromiso | null {
  if (!hora) return null;
  return compromisosDelDia(lista, fecha).find((c) => c.id !== sinId && c.hora === hora) ?? null;
}

export type Alcance = 'uno' | 'todos';
export type CambiosCompromiso = Partial<Pick<Compromiso, 'titulo' | 'fecha' | 'hora' | 'momento' | 'repetirSemanal'>>;

/** Deja la hora o el momento coherentes: con hora no se guarda momento. */
const limpiar = (c: Compromiso): Compromiso => {
  const r = { ...c };
  if (r.hora) delete r.momento;
  if (!r.hora) delete r.hora;
  if (!r.momento) delete r.momento;
  if (!r.repetirSemanal) { delete r.excepciones; delete r.hasta; }
  return r;
};

export function crearCompromiso(lista: Compromiso[], datos: Omit<Compromiso, 'id' | 'creadoEn'>, id = nuevoIdCompromiso()): Compromiso[] {
  return [...lista, limpiar({ ...datos, id, creadoEn: new Date().toISOString() })];
}

/**
 * Cambiar un compromiso. Si se repite y el alcance es "uno", ese día queda como excepción
 * y se crea una copia solo para ese día con los cambios. "hora: ''" quita la hora.
 */
export function editarCompromiso(lista: Compromiso[], id: string, cambios: CambiosCompromiso, alcance: Alcance, fechaDelDia: string, idCopia = nuevoIdCompromiso()): Compromiso[] {
  const c = lista.find((x) => x.id === id);
  if (!c) return lista;
  if (!c.repetirSemanal || alcance === 'todos') {
    return lista.map((x) => (x.id === id ? limpiar({ ...x, ...cambios }) : x));
  }
  const copia = limpiar({ ...c, ...cambios, id: idCopia, fecha: cambios.fecha ?? fechaDelDia, repetirSemanal: false, creadoEn: new Date().toISOString() });
  return [...lista.map((x) => (x.id === id ? { ...x, excepciones: [...(x.excepciones || []), fechaDelDia] } : x)), copia];
}

/** Borrar: el que no se repite (o "todos") se quita; "solo este día" deja una excepción. */
export function borrarCompromiso(lista: Compromiso[], id: string, alcance: Alcance, fechaDelDia: string): Compromiso[] {
  const c = lista.find((x) => x.id === id);
  if (!c) return lista;
  if (!c.repetirSemanal || alcance === 'todos') return lista.filter((x) => x.id !== id);
  return lista.map((x) => (x.id === id ? { ...x, excepciones: [...(x.excepciones || []), fechaDelDia] } : x));
}
