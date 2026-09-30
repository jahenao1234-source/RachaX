import { FocusTarget, Subtarea } from '../types';
import { formatDateToString, getSemanaDates } from './habitUtils';
import { textoDiaCorto } from './tareasUtils';

// ---------- Modo Foco: reloj, sesiones y tiempo en Foco (design/maqueta-foco.html, DESIGN.md › Modo Foco) ----------

/** Un bloque de foco terminado. Se guarda uno por cronómetro de hábito o por pomodoro (no los descansos). */
export interface SesionFoco {
  id: string;
  /** Día en que empezó el bloque ('YYYY-MM-DD', hora local). */
  fecha: string;
  /** Inicio en ISO. */
  inicio: string;
  /** Segundos de foco (sin las pausas). */
  seg: number;
  tipo: 'habito' | 'tarea' | 'libre';
  habitoId?: string;
  tareaId?: string;
  /** Nombre del hábito o la tarea, o lo que escribió en el pomodoro solo (para mostrarlo aunque se borre). */
  etiqueta: string;
  pomodoro?: boolean;
}

/**
 * El reloj se mide con marcas de tiempo, nunca sumando segundos: así no se pierde nada al bloquear la pantalla,
 * cambiar de app o recargar. Tiempo = acumuladoMs + (inicioMs ? ahora − inicioMs : 0).
 */
export interface RelojFoco {
  modo: 'crono' | 'pomodoro' | 'descanso';
  /** Momento en que siguió corriendo por última vez; null = en pausa. */
  inicioMs: number | null;
  /** Lo que ya corrió antes de la última pausa. */
  acumuladoMs: number;
  /** Solo pomodoro y descanso: cuánto dura. */
  duracionMs?: number;
  /** Cuándo empezó el bloque (para el día de la sesión y para no retomar uno de ayer). */
  empezoMs?: number;
}

/** Menos de esto no se guarda (para que "Tomar agua" no llene todo de segundos). */
export const MINIMO_GUARDAR_SEG = 60;
/** Un cronómetro olvidado se corta aquí. */
export const TOPE_SEG = 3 * 60 * 60;
export const DURACIONES_POMODORO = [15, 25, 50] as const;
export const DURACION_POR_DEFECTO = 25;
/** Descanso: 10 min después de uno de 50; 5 min en los demás. */
export const descansoPara = (minutos: number) => (minutos >= 50 ? 10 : 5);

export function relojNuevo(modo: RelojFoco['modo'], ahora: number, minutos?: number): RelojFoco {
  return { modo, inicioMs: ahora, acumuladoMs: 0, empezoMs: ahora, ...(modo === 'crono' ? {} : { duracionMs: (minutos ?? DURACION_POR_DEFECTO) * 60000 }) };
}
export const corriendo = (r: RelojFoco) => r.inicioMs !== null;

// ---------- Foco 2 (design/maqueta-foco-2.html): el reloj espera a que toques Empezar ----------

/** Reloj listo en 0:00 (o en 25:00), sin correr, hasta que la persona toque Empezar. No tiene empezoMs. */
export function relojEnEspera(modo: RelojFoco['modo'], minutos?: number): RelojFoco {
  return { modo, inicioMs: null, acumuladoMs: 0, ...(modo === 'crono' ? {} : { duracionMs: (minutos ?? DURACION_POR_DEFECTO) * 60000 }) };
}
/** Todavía no se ha tocado Empezar. */
export const sinEmpezar = (r: RelojFoco) => r.inicioMs === null && r.acumuladoMs === 0 && r.empezoMs === undefined;
/** "Empezar": arranca el reloj en espera (si ya andaba o estaba en pausa, es como "Seguir"). */
export function empezar(r: RelojFoco, ahora: number): RelojFoco {
  return { ...r, inicioMs: r.inicioMs ?? ahora, empezoMs: r.empezoMs ?? ahora };
}
/** "Empezar de nuevo" sale a partir de los 10 segundos. */
export const SEG_PARA_REINICIAR = 10;
export const puedeReiniciar = (r: RelojFoco, ahora: number) => !sinEmpezar(r) && transcurridoMs(r, ahora) >= SEG_PARA_REINICIAR * 1000;
/**
 * "Empezar de nuevo": el mismo reloj (cronómetro o pomodoro de la misma duración) otra vez desde cero, corriendo.
 * Lo que llevaba se guarda aparte con cerrarBloque ANTES de llamar esto (DESIGN.md › Foco 2: "quedan guardados").
 */
export function reiniciar(r: RelojFoco, ahora: number): RelojFoco {
  return { modo: r.modo, inicioMs: ahora, acumuladoMs: 0, empezoMs: ahora, ...(r.duracionMs !== undefined ? { duracionMs: r.duracionMs } : {}) };
}
export function transcurridoMs(r: RelojFoco, ahora: number): number {
  const t = r.acumuladoMs + (r.inicioMs !== null ? Math.max(0, ahora - r.inicioMs) : 0);
  return r.duracionMs !== undefined ? Math.min(t, r.duracionMs) : t;
}
export function restanteMs(r: RelojFoco, ahora: number): number {
  return r.duracionMs === undefined ? 0 : Math.max(0, r.duracionMs - transcurridoMs(r, ahora));
}
/** Pomodoro o descanso que ya llegó a cero (el cronómetro nunca "termina"). */
export const terminado = (r: RelojFoco, ahora: number) => r.duracionMs !== undefined && restanteMs(r, ahora) === 0;
export function pausar(r: RelojFoco, ahora: number): RelojFoco {
  return r.inicioMs === null ? r : { ...r, acumuladoMs: transcurridoMs(r, ahora), inicioMs: null };
}
export function seguir(r: RelojFoco, ahora: number): RelojFoco {
  return r.inicioMs !== null ? r : { ...r, inicioMs: ahora };
}
/** Fracción que ya pasó (0 a 1), para el anillo. El cronómetro devuelve 0. */
export function avance(r: RelojFoco, ahora: number): number {
  return r.duracionMs ? transcurridoMs(r, ahora) / r.duracionMs : 0;
}

/**
 * Cierra el bloque de foco y devuelve la sesión a guardar, o null si duró menos de 1 minuto o era un descanso.
 * Corta en 3 horas y guarda el día en que empezó.
 */
export function cerrarBloque(
  r: RelojFoco,
  ahora: number,
  datos: { id: string; tipo: SesionFoco['tipo']; habitoId?: string; tareaId?: string; etiqueta: string }
): SesionFoco | null {
  if (r.modo === 'descanso') return null;
  const seg = Math.min(TOPE_SEG, Math.floor(transcurridoMs(r, ahora) / 1000));
  if (seg < MINIMO_GUARDAR_SEG) return null;
  const inicio = new Date(r.empezoMs ?? ahora - seg * 1000);
  return {
    id: datos.id,
    fecha: formatDateToString(inicio),
    inicio: inicio.toISOString(),
    seg,
    tipo: datos.tipo,
    ...(datos.habitoId ? { habitoId: datos.habitoId } : {}),
    ...(datos.tareaId ? { tareaId: datos.tareaId } : {}),
    etiqueta: datos.etiqueta,
    ...(r.modo === 'pomodoro' ? { pomodoro: true } : {}),
  };
}

// ---------- Foco 2: elegir en qué paso de la tarea trabajar ----------

/** Los pasos de Foco en una tarea: los pasos pequeños (hojas) con texto, en orden, con el camino de pasos grandes. */
function hojasFoco(lista: Subtarea[], ruta: string[] = [], res: { paso: Subtarea; ruta: string[] }[] = []) {
  for (const s of lista) {
    if (s.subtareas && s.subtareas.length) hojasFoco(s.subtareas, [...ruta, s.texto], res);
    else if (s.texto?.trim()) res.push({ paso: s, ruta });
  }
  return res;
}

/**
 * El siguiente pendiente después de `actual`, dando la vuelta: primero los de más abajo y luego los de arriba
 * (si elegiste el paso 3 de 4, al terminarlo siguen el 4 y después el 1 y el 2). -1 si no queda ninguno.
 */
export function siguientePendienteCircular(hechos: boolean[], actual: number): number {
  const n = hechos.length;
  for (let k = 1; k < n; k++) {
    const i = (actual + k) % n;
    if (i >= 0 && !hechos[i]) return i;
  }
  return -1;
}

/**
 * Dónde empieza Foco en una tarea: el paso pedido (desde el ▶ de "Tareas de hoy") si está pendiente; si es un paso
 * grande, su primer paso pequeño pendiente; si no, el primer pendiente. Si no hay pendientes, 0.
 * Es el índice dentro de las hojas con texto (lo mismo que recorre FocusModeScreen).
 */
export function indiceInicialFoco(subtareas: Subtarea[], pasoId?: string): number {
  const hojas = hojasFoco(subtareas).map((x) => x.paso);
  const primero = (lista: Subtarea[]) => { const p = lista.find((h) => !h.hecha); return p ? hojas.indexOf(p) : -1; };
  if (pasoId) {
    const i = hojas.findIndex((h) => h.id === pasoId);
    if (i >= 0 && !hojas[i].hecha) return i;
    const buscar = (lista: Subtarea[]): Subtarea | null => {
      for (const s of lista) { if (s.id === pasoId) return s; const r = s.subtareas ? buscar(s.subtareas) : null; if (r) return r; }
      return null;
    };
    const grande = buscar(subtareas);
    if (grande?.subtareas?.length) {
      const j = primero(hojasFoco(grande.subtareas).map((x) => x.paso));
      if (j >= 0) return j;
    }
  }
  return Math.max(0, primero(hojas));
}

/** Una fila de la hoja "¿En qué paso trabajas?": "Dentro de {dentro} · {dia}". dia es "Hoy", "Mañana", "Sáb 3"… o "Sin día". */
export interface OpcionPasoFoco { id: string; indice: number; texto: string; dentro: string | null; dia: string; conDia: boolean }

/** Los pasos que faltan, en orden, para elegir en cuál hacer el pomodoro. `indice` es el de las hojas de Foco. */
export function opcionesPasoFoco(subtareas: Subtarea[], hoy: string): OpcionPasoFoco[] {
  return hojasFoco(subtareas)
    .map(({ paso, ruta }, indice) => ({ paso, ruta, indice }))
    .filter(({ paso }) => !paso.hecha)
    .map(({ paso, ruta, indice }) => {
      const c = paso.fecha ? textoDiaCorto(paso.fecha, hoy) : '';
      return {
        id: paso.id, indice, texto: paso.texto,
        dentro: ruta.length ? ruta.join(' › ') : null,
        dia: c ? c.charAt(0).toUpperCase() + c.slice(1) : 'Sin día',
        conDia: !!c,
      };
    });
}

// ---------- Textos del reloj ----------

/** "12:34", "1:02:03". En pomodoro y descanso se redondea hacia arriba (nunca muestra 0:00 antes de tiempo). */
export function formatoReloj(ms: number, haciaArriba = false): string {
  const total = haciaArriba ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  const dos = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${m}:${dos(s)}`;
}
/** Para lectores de pantalla: "12 minutos y 34 segundos", "1 hora y 2 minutos", "45 segundos". */
export function textoLectorReloj(ms: number, haciaArriba = false): string {
  const total = haciaArriba ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  const u = (n: number, sg: string, pl: string) => `${n} ${n === 1 ? sg : pl}`;
  const partes = h > 0 ? [u(h, 'hora', 'horas'), m ? u(m, 'minuto', 'minutos') : ''] : [m ? u(m, 'minuto', 'minutos') : '', s || !m ? u(s, 'segundo', 'segundos') : ''];
  return partes.filter(Boolean).join(' y ');
}
/** Tiempo acumulado: "menos de 1 min", "25 min", "1 h 10 min", "2 h". */
export function formatoDuracion(seg: number): string {
  const min = Math.floor(seg / 60);
  if (min < 1) return 'menos de 1 min';
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// ---------- Cuánto tiempo en Foco ----------

export interface GrupoFoco { clave: string; etiqueta: string; seg: number }

/** Sesiones de la semana (lunes a domingo) de hoy: total y por hábito, tarea o "Pomodoros solos", de mayor a menor. */
export function focoSemana(sesiones: SesionFoco[], hoy: string, nombres: { habitos?: Record<string, string>; tareas?: Record<string, string> } = {}): { seg: number; grupos: GrupoFoco[] } {
  const dias = getSemanaDates(hoy);
  const desde = dias[0], hasta = dias[6];
  const grupos = new Map<string, GrupoFoco>();
  let seg = 0;
  for (const s of sesiones) {
    if (s.fecha < desde || s.fecha > hasta) continue;
    seg += s.seg;
    const clave = s.tipo === 'habito' ? `habito:${s.habitoId}` : s.tipo === 'tarea' ? `tarea:${s.tareaId}` : 'libre';
    const etiqueta = s.tipo === 'libre' ? 'Pomodoros solos'
      : (s.tipo === 'habito' ? nombres.habitos?.[s.habitoId!] : nombres.tareas?.[s.tareaId!]) ?? s.etiqueta;
    const g = grupos.get(clave) ?? { clave, etiqueta, seg: 0 };
    g.seg += s.seg;
    grupos.set(clave, g);
  }
  return { seg, grupos: [...grupos.values()].sort((a, b) => b.seg - a.seg || a.etiqueta.localeCompare(b.etiqueta)) };
}

/** Tiempo en Foco de un hábito en el mes de hoy: total, días con Foco y promedio por esos días (en segundos). */
export function focoHabitoMes(sesiones: SesionFoco[], habitoId: string, hoy: string): { seg: number; dias: number; promedioSeg: number } {
  const mes = hoy.slice(0, 7);
  const dias = new Set<string>();
  let seg = 0;
  for (const s of sesiones) {
    if (s.tipo !== 'habito' || s.habitoId !== habitoId || s.fecha.slice(0, 7) !== mes) continue;
    seg += s.seg;
    dias.add(s.fecha);
  }
  return { seg, dias: dias.size, promedioSeg: dias.size ? Math.round(seg / dias.size) : 0 };
}

/** Deja solo sesiones válidas (para lo que llega de una copia o de la nube). */
export function sanearSesiones(lista: unknown): SesionFoco[] {
  if (!Array.isArray(lista)) return [];
  const vistos = new Set<string>();
  const out: SesionFoco[] = [];
  for (const s of lista as any[]) {
    if (!s || typeof s.id !== 'string' || typeof s.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.fecha)) continue;
    if (typeof s.seg !== 'number' || !(s.seg > 0) || !['habito', 'tarea', 'libre'].includes(s.tipo) || vistos.has(s.id)) continue;
    vistos.add(s.id);
    out.push({ ...s, seg: Math.min(TOPE_SEG, Math.round(s.seg)), etiqueta: typeof s.etiqueta === 'string' ? s.etiqueta : '' });
  }
  return out;
}

// ---------- Foco en curso: se guarda en este aparato para retomarlo si la app se cierra ----------

export interface FocoEnCurso {
  target: FocusTarget;
  reloj: RelojFoco;
  /** Id del bloque actual (evita guardarlo dos veces). */
  bloqueId: string;
  /** Minutos elegidos para el pomodoro (15, 25 o 50). */
  minutos: number;
  /** Número del pomodoro en esta sesión (1, 2…). */
  pomodoro: number;
  /** Id del hábito o paso en pantalla. */
  pasoId?: string;
}
const CLAVE_EN_CURSO = 'racha_foco_en_curso';
/**
 * Se escribe al empezar, pausar, seguir o cambiar de fase; nunca cada segundo. No viaja a la nube.
 * Un reloj que todavía no se empezó no se guarda: si la app se cierra, no hay nada que retomar.
 */
export function guardarFocoEnCurso(f: FocoEnCurso | null): void {
  try {
    if (f && !sinEmpezar(f.reloj)) localStorage.setItem(CLAVE_EN_CURSO, JSON.stringify(f));
    else localStorage.removeItem(CLAVE_EN_CURSO);
  } catch { /* sin almacenamiento: no se puede retomar */ }
}
export function leerFocoEnCurso(): FocoEnCurso | null {
  try {
    const f = JSON.parse(localStorage.getItem(CLAVE_EN_CURSO) || 'null');
    if (!f || !f.reloj || typeof f.reloj.acumuladoMs !== 'number' || !f.target || typeof f.bloqueId !== 'string') return null;
    return f as FocoEnCurso;
  } catch { return null; }
}

/**
 * Al abrir la app con un Foco guardado: si es de otro día o pasó el tope de 3 h, se cierra solo
 * (se devuelve la sesión a guardar y ya no se retoma). Si no, se retoma tal cual.
 */
export function revisarFocoEnCurso(f: FocoEnCurso, ahora: number): { retomar: FocoEnCurso | null; cerrar: FocoEnCurso | null } {
  const inicio = f.reloj.empezoMs ?? ahora - transcurridoMs(f.reloj, ahora);
  const otroDia = formatDateToString(new Date(inicio)) !== formatDateToString(new Date(ahora));
  const pasado = f.reloj.modo === 'crono' && transcurridoMs(f.reloj, ahora) >= TOPE_SEG * 1000;
  return otroDia || pasado ? { retomar: null, cerrar: f } : { retomar: f, cerrar: null };
}

/** Lo que dice la barra de arriba del Foco libre: lo que escribió, o "Foco libre". */
export const subtituloLibre = (etiqueta?: string) => (etiqueta && etiqueta.trim() ? etiqueta.trim() : 'Foco libre');
