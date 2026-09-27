import { Habito, MomentoDia, Rutina, Subtarea, Tarea } from '../types';
import { parseDateString } from './habitUtils';

/**
 * Hoy completo (design/maqueta-hoy-completo.html, DESIGN.md › Rutinas en Hoy y Tareas de hoy).
 * Funciones puras: no guardan nada, solo ordenan lo que ya existe para pintarlo en Hoy.
 */

const ORDEN_MOMENTO: MomentoDia[] = ['manana', 'tarde', 'noche', 'flexible'];

/**
 * Momento del día de una rutina. Si no tiene uno guardado (rutinas creadas antes),
 * toma el que más se repite entre sus hábitos; en empate, el más temprano.
 */
export function momentoDeRutina(rutina: Rutina, habitos: Habito[]): MomentoDia {
  if (rutina.momento) return rutina.momento;
  const cuenta = new Map<MomentoDia, number>();
  for (const id of rutina.habitoIds) {
    const h = habitos.find((x) => x.id === id);
    if (!h) continue;
    const m = h.momento || 'flexible';
    cuenta.set(m, (cuenta.get(m) || 0) + 1);
  }
  let mejor: MomentoDia = 'flexible';
  let max = 0;
  for (const m of ORDEN_MOMENTO) {
    const n = cuenta.get(m) || 0;
    if (n > max) { max = n; mejor = m; }
  }
  return mejor;
}

export interface RutinaDeHoy {
  rutina: Rutina;
  momento: MomentoDia;
  /** Solo los hábitos de la rutina que tocan hoy, en el orden de la rutina. */
  habitos: Habito[];
}

/**
 * Rutinas que se muestran hoy, con sus hábitos de hoy.
 * - Un hábito aparece en UNA sola rutina (la primera en el orden de rutinas).
 * - Una rutina sin hábitos para hoy no se devuelve.
 * `habitosDeHoy` = hábitos activos programados para hoy (ya viene así del store).
 */
export function rutinasDeHoy(rutinas: Rutina[], habitosDeHoy: Habito[], todosLosHabitos: Habito[]): RutinaDeHoy[] {
  const usados = new Set<string>();
  const res: RutinaDeHoy[] = [];
  for (const rutina of rutinas) {
    const habitos: Habito[] = [];
    for (const id of rutina.habitoIds) {
      if (usados.has(id)) continue;
      const h = habitosDeHoy.find((x) => x.id === id);
      if (!h) continue;
      usados.add(id);
      habitos.push(h);
    }
    if (habitos.length > 0) res.push({ rutina, momento: momentoDeRutina(rutina, todosLosHabitos), habitos });
  }
  return res;
}

/** Ids de hábitos que se pintan dentro de una rutina hoy: NO van también sueltos. */
export function idsEnRutinasDeHoy(rdh: RutinaDeHoy[]): Set<string> {
  return new Set(rdh.flatMap((r) => r.habitos.map((h) => h.id)));
}

/** La rutina (distinta de `exceptoId`) que ya tiene ese hábito, para avisar en el editor: "Ya está en {rutina}". */
export function rutinaQueTieneHabito(habitoId: string, rutinas: Rutina[], exceptoId?: string | null): Rutina | undefined {
  return rutinas.find((r) => r.id !== exceptoId && r.habitoIds.includes(habitoId));
}

// ---------------- Tareas de hoy ----------------

export interface PasoDeHoy {
  tareaId: string;
  tareaNombre: string;
  paso: Subtarea;
  /** Texto de atraso para un paso asignado a un día pasado y sin hacer: "de ayer", "del martes"… */
  atraso?: string;
}

export interface TareasDeHoy {
  /** 'hoy': pasos asignados a hoy · 'siguen': no hay asignados, el siguiente de cada tarea · 'nada': no mostrar el recuadro */
  modo: 'hoy' | 'siguen' | 'nada';
  pasos: PasoDeHoy[];
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "de ayer" · "del martes" (hasta 6 días atrás) · "del 12 de septiembre" (más atrás). */
export function textoAtraso(fecha: string, hoy: string): string | undefined {
  if (fecha >= hoy) return undefined;
  const d = parseDateString(fecha);
  const dias = Math.round((parseDateString(hoy).getTime() - d.getTime()) / 86400000);
  if (dias === 1) return 'de ayer';
  if (dias <= 6) return `del ${DIAS[d.getDay()]}`;
  return `del ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

const tieneTexto = (s: Subtarea) => Boolean(s.texto && s.texto.trim().length > 0);

/** Recorre el árbol de pasos en orden (padres antes que hijos). */
function recorrer(list: Subtarea[], fn: (s: Subtarea) => void) {
  for (const s of list) {
    fn(s);
    if (s.subtareas && s.subtareas.length > 0) recorrer(s.subtareas, fn);
  }
}

/**
 * Qué pasos muestra "Tareas de hoy".
 * 1. Asignados: pasos con fecha de hoy, más los de días pasados que siguen sin hacer (con su atraso).
 *    Un paso hecho hoy se queda en la lista hasta mañana (no salta otro a su lugar).
 * 2. Si no hay asignados: el siguiente paso de cada tarea abierta (primera hoja sin hacer), máximo 3.
 *    Si ese paso se marca hoy, sigue saliendo marcado hasta mañana.
 * 3. Si no hay nada que mostrar: 'nada' (el recuadro no aparece).
 */
export function tareasDeHoy(tareas: Tarea[], hoy: string): TareasDeHoy {
  const asignados: PasoDeHoy[] = [];
  for (const t of tareas) {
    recorrer(t.subtareas || [], (s) => {
      if (!s.fecha || !tieneTexto(s)) return;
      const esDeHoy = s.fecha === hoy;
      const atrasadoSinHacer = s.fecha < hoy && !s.hecha;
      const atrasadoHechoHoy = s.fecha < hoy && s.hecha && s.hechaEn === hoy;
      if (esDeHoy || atrasadoSinHacer || atrasadoHechoHoy) {
        asignados.push({ tareaId: t.id, tareaNombre: t.nombre, paso: s, atraso: textoAtraso(s.fecha, hoy) });
      }
    });
  }
  if (asignados.length > 0) {
    // Primero los atrasados (del más viejo al más nuevo), luego los de hoy, respetando el orden de las tareas
    const orden = asignados.map((p, i) => ({ p, i }));
    orden.sort((a, b) => {
      const fa = a.p.paso.fecha as string;
      const fb = b.p.paso.fecha as string;
      return fa === fb ? a.i - b.i : fa < fb ? -1 : 1;
    });
    return { modo: 'hoy', pasos: orden.map((x) => x.p) };
  }

  const siguen: PasoDeHoy[] = [];
  for (const t of tareas) {
    if (siguen.length >= 3) break;
    let elegido: Subtarea | undefined;
    recorrer(t.subtareas || [], (s) => {
      if (elegido || !tieneTexto(s)) return;
      const esHoja = !s.subtareas || s.subtareas.length === 0;
      if (!esHoja) return;
      if (!s.hecha || s.hechaEn === hoy) elegido = s;
    });
    if (elegido && (!t.completada || elegido.hechaEn === hoy)) {
      siguen.push({ tareaId: t.id, tareaNombre: t.nombre, paso: elegido });
    }
  }
  if (siguen.length > 0) return { modo: 'siguen', pasos: siguen };
  return { modo: 'nada', pasos: [] };
}
