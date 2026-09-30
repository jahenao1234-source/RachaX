import { MomentoPlan, Subtarea, Tarea } from '../types';
import { parseDateString, obtenerHojasSubtareas } from './habitUtils';

/**
 * Pestaña Tareas (design/maqueta-tareas.html, DESIGN.md › Tareas).
 * Funciones puras sobre el árbol de pasos: no guardan nada, devuelven un árbol nuevo.
 * Todas terminan en normalizarArbol para que los pasos padre reflejen a sus hijos.
 */

export const nuevoIdPaso = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

const tieneHijos = (s: Subtarea) => Boolean(s.subtareas && s.subtareas.length > 0);

/**
 * Rehace el estado de los pasos padre a partir de sus hijos:
 * - hecha = todos sus hijos hechos; hechaEn = el día más reciente de sus hijos (o nada).
 * - un paso con hijos no lleva fecha propia (el día vive en los pasos sin hijos).
 */
export function normalizarArbol(lista: Subtarea[]): Subtarea[] {
  return lista.map((s) => {
    if (!tieneHijos(s)) return s;
    const hijos = normalizarArbol(s.subtareas as Subtarea[]);
    const hecha = hijos.every((h) => h.hecha);
    const dias = hijos.map((h) => h.hechaEn).filter((d): d is string => Boolean(d)).sort();
    const { fecha: _fecha, momento: _momento, ...resto } = s;
    return { ...resto, subtareas: hijos, hecha, hechaEn: hecha ? dias[dias.length - 1] : undefined };
  });
}

/** Busca un paso por id en todo el árbol. */
export function buscarPaso(lista: Subtarea[], id: string): Subtarea | undefined {
  for (const s of lista) {
    if (s.id === id) return s;
    if (s.subtareas) {
      const r = buscarPaso(s.subtareas, id);
      if (r) return r;
    }
  }
  return undefined;
}

const mapear = (lista: Subtarea[], id: string, fn: (s: Subtarea) => Subtarea): Subtarea[] =>
  lista.map((s) => (s.id === id ? fn(s) : s.subtareas ? { ...s, subtareas: mapear(s.subtareas, id, fn) } : s));

/**
 * Pone (o quita, con fecha undefined) el día de un paso. Solo aplica a pasos sin pasos adentro.
 * momento: undefined deja el que tenía; null lo quita; o el nuevo. Sin fecha, el momento también se quita.
 */
export function ponerFechaPaso(lista: Subtarea[], id: string, fecha?: string, momento?: MomentoPlan | null): Subtarea[] {
  return normalizarArbol(mapear(lista, id, (s) => {
    if (tieneHijos(s)) return s;
    const { fecha: _f, momento: momentoAntes, ...resto } = s;
    if (!fecha) return resto;
    const m = momento === undefined ? momentoAntes : momento ?? undefined;
    return m ? { ...resto, fecha, momento: m } : { ...resto, fecha };
  }));
}

/** Cambia el texto de un paso (vacío no se guarda: se deja el anterior). */
export function editarTextoPaso(lista: Subtarea[], id: string, texto: string): Subtarea[] {
  const limpio = texto.trim();
  if (!limpio) return lista;
  return mapear(lista, id, (s) => ({ ...s, texto: limpio }));
}

/**
 * Agrega un paso nuevo. padreId null = al final de la tarea; si no, al final de los pasos de ese padre.
 * Si el padre no tenía pasos adentro y tenía día, el día pasa al paso nuevo (los padres no llevan día).
 * Devuelve el árbol y el id del paso nuevo.
 */
export function agregarPaso(lista: Subtarea[], padreId: string | null, texto: string, id: string = nuevoIdPaso()): { arbol: Subtarea[]; id: string | null } {
  const limpio = texto.trim();
  if (!limpio) return { arbol: lista, id: null };
  const nuevo: Subtarea = { id, texto: limpio, hecha: false };
  if (!padreId) return { arbol: normalizarArbol([...lista, nuevo]), id };
  if (!buscarPaso(lista, padreId)) return { arbol: lista, id: null };
  const arbol = mapear(lista, padreId, (p) => {
    const hijos = p.subtareas || [];
    const heredado = hijos.length === 0 && p.fecha ? { ...nuevo, fecha: p.fecha } : nuevo;
    return { ...p, subtareas: [...hijos, heredado] };
  });
  return { arbol: normalizarArbol(arbol), id };
}

/** Saca un paso (con todo lo que tiene adentro). Devuelve el árbol sin él y el paso sacado. */
function sacarPaso(lista: Subtarea[], id: string): { arbol: Subtarea[]; sacado: Subtarea | null } {
  let sacado: Subtarea | null = null;
  const rec = (l: Subtarea[]): Subtarea[] => {
    const res: Subtarea[] = [];
    for (const s of l) {
      if (s.id === id) { sacado = s; continue; }
      if (s.subtareas && s.subtareas.length > 0) {
        const hijos = rec(s.subtareas);
        res.push({ ...s, subtareas: hijos.length > 0 ? hijos : undefined });
      } else res.push(s);
    }
    return res;
  };
  const arbol = rec(lista);
  return { arbol, sacado };
}

/** Borra un paso con todo lo que tiene adentro. */
export function borrarPaso(lista: Subtarea[], id: string): Subtarea[] {
  return normalizarArbol(sacarPaso(lista, id).arbol);
}

export interface DestinoPaso {
  /** null = en la raíz de la tarea */
  padreId: string | null;
  /** posición dentro de los pasos de ese padre, contada DESPUÉS de sacar el paso que se mueve */
  indice: number;
}

/**
 * Mueve un paso (con sus pasos adentro) a otro lugar del mismo árbol.
 * Devuelve null si el movimiento no es válido (paso inexistente, destino inexistente
 * o destino dentro del mismo paso que se mueve): en ese caso NO se cambia nada.
 */
export function moverPaso(lista: Subtarea[], id: string, destino: DestinoPaso): Subtarea[] | null {
  const paso = buscarPaso(lista, id);
  if (!paso) return null;
  if (destino.padreId) {
    if (destino.padreId === id) return null;
    if (buscarPaso(paso.subtareas || [], destino.padreId)) return null; // no se mete dentro de sí mismo
    if (!buscarPaso(lista, destino.padreId)) return null;
  }
  const { arbol, sacado } = sacarPaso(lista, id);
  if (!sacado) return null;
  const insertar = (l: Subtarea[]): Subtarea[] => {
    const i = Math.max(0, Math.min(destino.indice, l.length));
    return [...l.slice(0, i), sacado as Subtarea, ...l.slice(i)];
  };
  let resultado: Subtarea[];
  if (!destino.padreId) {
    resultado = insertar(arbol);
  } else {
    resultado = mapear(arbol, destino.padreId, (p) => {
      const hijos = p.subtareas || [];
      // Si el padre recibe su primer hijo y tenía día, el día pasa al paso movido (si no tiene uno): los padres no llevan día.
      if (hijos.length === 0 && p.fecha && !(sacado as Subtarea).fecha) {
        const conDia = { ...(sacado as Subtarea), fecha: p.fecha };
        return { ...p, subtareas: [conDia] };
      }
      return { ...p, subtareas: insertar(hijos) };
    });
  }
  return normalizarArbol(resultado);
}

/** Pasos (hojas con texto) de una tarea. */
const hojasConTexto = (t: Tarea) => obtenerHojasSubtareas(t.subtareas).filter((h) => h.texto && h.texto.trim().length > 0);

/**
 * Reabre una tarea terminada: desmarca el último paso que se marcó (el de hechaEn más reciente;
 * si ningún paso tiene día, el último en orden). Los padres se recalculan solos.
 */
export function reabrirArbol(t: Tarea): Subtarea[] {
  const hojas = hojasConTexto(t).filter((h) => h.hecha);
  if (hojas.length === 0) return t.subtareas;
  let ultima = hojas[hojas.length - 1];
  for (const h of hojas) if ((h.hechaEn || '') > (ultima.hechaEn || '')) ultima = h;
  const arbol = mapear(t.subtareas, ultima.id, (s) => {
    const { hechaEn: _h, ...resto } = s;
    return { ...resto, hecha: false };
  });
  return normalizarArbol(arbol);
}

/** Día en que se terminó una tarea (el hechaEn más reciente de sus pasos), o null si no se sabe. */
export function fechaTerminada(t: Tarea): string | null {
  const dias = hojasConTexto(t).map((h) => h.hechaEn).filter((d): d is string => Boolean(d)).sort();
  return dias.length ? dias[dias.length - 1] : null;
}

/** El siguiente paso pendiente de una tarea (primera hoja sin hacer). */
export function siguientePaso(t: Tarea): Subtarea | null {
  return hojasConTexto(t).find((h) => !h.hecha) || null;
}

/** "{hechos} de {total}" de una tarea, contando solo los pasos sin pasos adentro. */
export function avanceTarea(t: Tarea): { hechos: number; total: number } {
  const hojas = hojasConTexto(t);
  return { hechos: hojas.filter((h) => h.hecha).length, total: hojas.length };
}

// ---------------- Textos de fechas ----------------
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const diasEntre = (desde: string, hasta: string) =>
  Math.round((parseDateString(hasta).getTime() - parseDateString(desde).getTime()) / 86400000);

/** Texto corto del chip de día: "hoy", "mañana", "vie 2", "12 oct", "de ayer", "del 22 sep". */
export function textoDiaCorto(fecha: string, hoy: string): string {
  const d = parseDateString(fecha);
  const n = diasEntre(hoy, fecha);
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  if (n === -1) return 'de ayer';
  if (n < 0) return `del ${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
  if (n <= 6) return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()}`;
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

/** Texto largo para lectores de pantalla: "hoy, domingo 27", "viernes 2 de octubre", "era para ayer, sábado 26". */
export function textoDiaLargo(fecha: string, hoy: string): string {
  const d = parseDateString(fecha);
  const n = diasEntre(hoy, fecha);
  const base = `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  if (n === 0) return `hoy, ${DIAS[d.getDay()]} ${d.getDate()}`;
  if (n === 1) return `mañana, ${DIAS[d.getDay()]} ${d.getDate()}`;
  if (n === -1) return `era para ayer, ${DIAS[d.getDay()]} ${d.getDate()}`;
  if (n < 0) return `era para el ${base}`;
  return base;
}

/** Fecha de terminada para Terminadas: "20 de septiembre". */
export function textoFechaLarga(fecha: string): string {
  const d = parseDateString(fecha);
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/**
 * Resumen del encabezado: "3 abiertas · 2 para hoy · 1 de ayer".
 * Cada parte se omite si es 0. Atrasados: "de ayer" si todos son de ayer; si no, "de días pasados".
 */
export function resumenTareas(tareas: Tarea[], hoy: string): string {
  const abiertas = tareas.filter((t) => !t.completada);
  let paraHoy = 0;
  let deAyer = 0;
  let atrasados = 0;
  for (const t of abiertas) {
    for (const h of hojasConTexto(t)) {
      if (!h.fecha || h.hecha) continue;
      const n = diasEntre(hoy, h.fecha);
      if (n === 0) paraHoy += 1;
      else if (n < 0) { atrasados += 1; if (n === -1) deAyer += 1; }
    }
  }
  const partes: string[] = [];
  if (abiertas.length) partes.push(`${abiertas.length} ${abiertas.length === 1 ? 'abierta' : 'abiertas'}`);
  if (paraHoy) partes.push(`${paraHoy} para hoy`);
  if (atrasados) partes.push(atrasados === deAyer ? `${atrasados} de ayer` : `${atrasados} de días pasados`);
  return partes.join(' · ');
}

// ---------------- Tareas 2: grupos por cuándo y orden (design/maqueta-tareas-2.html) ----------------

export type GrupoTarea = 'hoy' | 'semana' | 'despues' | 'sinDia';
export const TITULO_GRUPO: Record<GrupoTarea, string> = { hoy: 'Para hoy', semana: 'Esta semana', despues: 'Más adelante', sinDia: 'Sin día' };
const ORDEN_GRUPOS: GrupoTarea[] = ['hoy', 'semana', 'despues', 'sinDia'];

/**
 * A qué grupo va una tarea y qué paso la representa en la lista.
 * Manda el paso pendiente con el día más cercano (si hay empate, el primero del árbol):
 * hoy o atrasado → 'hoy'; de mañana hasta el domingo de esta semana → 'semana'; después → 'despues'.
 * Si ningún paso pendiente tiene día → 'sinDia', y el paso es el siguiente en orden (siguientePaso).
 */
export function grupoTarea(t: Tarea, hoy: string): { grupo: GrupoTarea; paso: Subtarea | null } {
  let mejor: Subtarea | null = null;
  for (const h of hojasConTexto(t)) {
    if (h.hecha || !h.fecha) continue;
    if (!mejor || h.fecha < (mejor.fecha as string)) mejor = h;
  }
  if (!mejor) return { grupo: 'sinDia', paso: siguientePaso(t) };
  const n = diasEntre(hoy, mejor.fecha as string);
  if (n <= 0) return { grupo: 'hoy', paso: mejor };
  const dow = parseDateString(hoy).getDay(); // 0 = domingo
  const hastaDomingo = dow === 0 ? 0 : 7 - dow;
  return { grupo: n <= hastaDomingo ? 'semana' : 'despues', paso: mejor };
}

/**
 * La línea de la fila: con día, { dia: "Hoy" | "Mañana" | "Vie 2" | "12 oct" | "De ayer" | "Del 22 sep", paso };
 * sin día, { dia: null, paso } y la pantalla escribe "Sigue: {paso}". paso = null si no quedan pasos.
 */
export function lineaTarea(t: Tarea, hoy: string): { dia: string | null; paso: Subtarea | null } {
  const { paso } = grupoTarea(t, hoy);
  if (!paso || !paso.fecha) return { dia: null, paso };
  const c = textoDiaCorto(paso.fecha, hoy);
  return { dia: c.charAt(0).toUpperCase() + c.slice(1), paso };
}

/**
 * Las tareas abiertas en sus grupos, en el orden de la persona (el del arreglo). Solo los grupos con tareas.
 * `fijos`: tareas que no deben saltar de grupo mientras están abiertas o con el aviso de Deshacer (id → grupo de antes).
 */
export function agruparTareas(tareas: Tarea[], hoy: string, fijos: Record<string, GrupoTarea> = {}): { grupo: GrupoTarea; titulo: string; tareas: Tarea[] }[] {
  const por = new Map<GrupoTarea, Tarea[]>(ORDEN_GRUPOS.map((g) => [g, []]));
  for (const t of tareas) {
    const g = fijos[t.id] ?? grupoTarea(t, hoy).grupo;
    por.get(g)!.push(t);
  }
  return ORDEN_GRUPOS.filter((g) => por.get(g)!.length > 0).map((g) => ({ grupo: g, titulo: TITULO_GRUPO[g], tareas: por.get(g)! }));
}

/**
 * Sube o baja una tarea DENTRO de su grupo: la cambia de lugar con la vecina del mismo grupo.
 * orden = ids de TODAS las tareas en su orden; grupo = ids del grupo en ese mismo orden.
 * Devuelve el orden nuevo completo (para reordenarTareas) o null si no se puede (primera/última del grupo).
 */
export function moverTareaEnGrupo(orden: string[], grupo: string[], id: string, dir: 'arriba' | 'abajo'): string[] | null {
  const i = grupo.indexOf(id);
  const j = dir === 'arriba' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= grupo.length) return null;
  const a = orden.indexOf(id), b = orden.indexOf(grupo[j]);
  if (a < 0 || b < 0) return null;
  const nuevo = [...orden];
  [nuevo[a], nuevo[b]] = [nuevo[b], nuevo[a]];
  return nuevo;
}

/**
 * Deja una tarea en el lugar `indice` de su grupo (al soltarla después de arrastrar).
 * Las tareas de los otros grupos no se mueven de su lugar relativo. Devuelve el orden nuevo completo, o null si no cambia.
 */
export function colocarTareaEnGrupo(orden: string[], grupo: string[], id: string, indice: number): string[] | null {
  const desde = grupo.indexOf(id);
  if (desde < 0) return null;
  const k = Math.max(0, Math.min(indice, grupo.length - 1));
  if (k === desde) return null;
  const sinElla = grupo.filter((x) => x !== id);
  const nuevoGrupo = [...sinElla.slice(0, k), id, ...sinElla.slice(k)];
  // Los lugares que ocupaba el grupo en el orden completo se llenan con el grupo en su orden nuevo
  const lugares = orden.map((x, i) => (grupo.includes(x) ? i : -1)).filter((i) => i >= 0);
  const nuevo = [...orden];
  lugares.forEach((pos, n) => { nuevo[pos] = nuevoGrupo[n]; });
  return nuevo;
}
