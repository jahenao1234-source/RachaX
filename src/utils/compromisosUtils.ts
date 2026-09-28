import { Compromiso, MomentoPlan } from '../types';
import { parseDateString } from './habitUtils';

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
