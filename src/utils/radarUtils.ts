import { Habito, MomentoDia, Registro } from '../types';
import { formatDateToString, isHabitScheduledForDate, subtractDays } from './habitUtils';
import { fuerzaSerieHabito } from './progresoUtils';

/**
 * La Fuerza de tus hábitos como radar (design/maqueta-progreso-radar.html, DESIGN.md › Progreso › "#### Fuerza en radar").
 * Cada hábito es un eje; la figura de hoy va en ámbar y la de hace 30 días punteada.
 * El cálculo de la fuerza es el de siempre (fuerzaSerieHabito); aquí solo se ordena y se dibuja.
 */

export const MAX_EJES = 12;
const ORDEN_MOMENTOS_DEFECTO: MomentoDia[] = ['manana', 'tarde', 'noche', 'flexible'];

export interface PuntoRadar {
  habito: Habito;
  momento: MomentoDia;
  /** Fuerza hoy (hasta ayer), 0 a 100. */
  hoy: number;
  /** Fuerza hace 30 días, 0 a 100; null si el hábito todavía no existía. */
  antes: number | null;
  /** Nombre corto para el eje ("Página de Facebook" → "Facebook"). */
  corto: string;
}

export interface DatosRadar {
  /** 'radar' con 3 o más hábitos; 'barras' con 1 o 2; 'vacio' sin hábitos. */
  modo: 'radar' | 'barras' | 'vacio';
  puntos: PuntoRadar[];
  /** Hábitos que no caben (más de 12): "y N más en Tus hábitos". */
  resto: number;
}

const PALABRAS_VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'a', 'al', 'en', 'y', 'o', 'con', 'por', 'para', 'mi', 'mis', 'tu', 'un', 'una', 'que', 'sin']);
const UNIDADES = /^(\d+([.,]\d+)?|min|mins|minutos?|h|hr|hrs|horas?|km|m|vasos?|veces|p[aá]ginas?|pasos?|x)$/i;

/**
 * Nombre corto para el eje del radar. Con 12 letras o menos queda igual ("Tomar agua", "Comer fruta"); si no, la última palabra con sentido
 * (sin "de", "la", números ni unidades): "Página de Facebook" → "Facebook", "Salir a correr" → "Correr".
 * Máximo 12 letras (con "…").
 */
export function nombreCorto(nombre: string): string {
  const limpio = nombre.trim().replace(/\s+/g, ' ');
  if (limpio.length <= 12) return limpio;
  const palabras = limpio.split(' ').filter((p) => !PALABRAS_VACIAS.has(p.toLowerCase()) && !UNIDADES.test(p));
  const elegida = palabras.length ? palabras[palabras.length - 1] : limpio.split(' ')[0];
  const cap = elegida.charAt(0).toUpperCase() + elegida.slice(1);
  return cap.length > 12 ? cap.slice(0, 11) + '…' : cap;
}

/** Cuántos días le tocaron al hábito en los 30 días que terminan en `hasta` (semanales: su meta × 4). */
export function diasQueTocan(h: Habito, hasta: string): number {
  if (h.frecuencia === 'semanal') return (h.vecesPorSemana || 1) * 4;
  let n = 0;
  for (let i = 0; i < 30; i++) if (isHabitScheduledForDate(h, subtractDays(hasta, i))) n++;
  return n;
}

/**
 * Los puntos del radar. `hasta` = ayer (Progreso cuenta "sin contar hoy").
 * Con más de 12 hábitos quedan los 12 que más te tocan. Después se ordenan por momento del día
 * (según ordenMomentos, como en Hoy) y dentro de cada momento por su orden manual.
 */
export function datosRadar(
  habitosActivos: Habito[],
  registros: Registro[],
  diasCongelados: string[],
  hasta: string,
  ordenMomentos: MomentoDia[] = ORDEN_MOMENTOS_DEFECTO,
  max = MAX_EJES,
  /** Las series de fuerza ya calculadas por hábito (las mismas de serieFuerzaTotal), para no repetir el cálculo. */
  series?: Map<string, { fecha: string; valor: number }[]>,
): DatosRadar {
  const activos = habitosActivos.filter((h) => !h.archivado && formatDateToString(new Date(h.creadoEn)) <= hasta);
  if (activos.length === 0) return { modo: 'vacio', puntos: [], resto: 0 };

  const hace30 = subtractDays(hasta, 30);
  let elegidos = activos;
  if (activos.length > max) {
    elegidos = activos
      .map((h, i) => ({ h, i, t: diasQueTocan(h, hasta) }))
      .sort((a, b) => b.t - a.t || a.i - b.i)
      .slice(0, max)
      .map((x) => x.h);
  }

  const orden = [...ordenMomentos, ...ORDEN_MOMENTOS_DEFECTO.filter((m) => !ordenMomentos.includes(m))];
  const puntos: PuntoRadar[] = elegidos.map((h) => {
    const serie = series?.get(h.id) ?? fuerzaSerieHabito(h, registros, diasCongelados, hasta);
    const hoy = serie.length ? Math.round(serie[serie.length - 1].valor * 100) : 0;
    const p = serie.find((s) => s.fecha === hace30);
    const antes = p ? Math.round(p.valor * 100) : null;
    return { habito: h, momento: h.momento || 'flexible', hoy, antes, corto: nombreCorto(h.nombre) };
  });
  puntos.sort((a, b) => orden.indexOf(a.momento) - orden.indexOf(b.momento) || (a.habito.orden ?? 0) - (b.habito.orden ?? 0) || a.habito.nombre.localeCompare(b.habito.nombre));

  return { modo: puntos.length >= 3 ? 'radar' : 'barras', puntos, resto: activos.length - elegidos.length };
}

/** Posición de un valor (0 a 100) en el eje i de n, con el primero arriba y en el sentido del reloj. Relativa al centro. */
export function posicionRadar(i: number, n: number, valor: number, radio: number): { x: number; y: number } {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const r = (Math.max(0, Math.min(100, valor)) / 100) * radio;
  return { x: Math.round(Math.cos(a) * r * 100) / 100, y: Math.round(Math.sin(a) * r * 100) / 100 };
}

/** Los puntos de un polígono SVG ("x,y x,y …") con el centro en (cx, cy). Si algún valor es null, usa 0. */
export function poligonoRadar(valores: (number | null)[], radio: number, cx: number, cy: number): string {
  return valores.map((v, i) => { const p = posicionRadar(i, valores.length, v ?? 0, radio); return `${cx + p.x},${cy + p.y}`; }).join(' ');
}

/** Los valores de la figura de hace 30 días: si el hábito no existía, su valor de hoy (así no parece que bajó o subió). */
export function valoresAntes(puntos: PuntoRadar[]): number[] {
  return puntos.map((p) => (p.antes === null ? p.hoy : p.antes));
}

/** ¿Hay figura de hace 30 días? Solo si al menos la mitad de los hábitos ya existía. */
export function hayFiguraAntes(puntos: PuntoRadar[]): boolean {
  return puntos.length > 0 && puntos.filter((p) => p.antes !== null).length * 2 >= puntos.length;
}

/** "↑" si subió 5 o más en 30 días, "↓" si bajó 5 o más, "" si no (o si no existía). */
export function flechaRadar(p: PuntoRadar): '↑' | '↓' | '' {
  if (p.antes === null) return '';
  const d = p.hoy - p.antes;
  return d >= 5 ? '↑' : d <= -5 ? '↓' : '';
}

/**
 * El texto debajo del radar:
 * - recién empiezas: "Todo hábito empieza en 0 y sube con cada día que cumples. En unas semanas tu figura tomará forma."
 * - todos en 90 o más: "Tus hábitos ya están firmes. Ahora toca mantenerlos: cada vez que cumples sigue sumando en tus récords."
 * - se encogió (promedio de hoy por debajo de 20 y 10 o más por debajo del de hace 30 días):
 *   "Tu figura se encogió, y así funciona: baja despacio. Cumple uno hoy y vuelve a crecer."
 * - si alguno bajó 5 o más: "Cada punta es un hábito: entre más lejos del centro, más firme. {Finanzas} bajó {14} en 30 días. Con unos días seguidos vuelve a subir."
 * - si no: "Cada punta es un hábito: entre más lejos del centro, más firme. Donde la figura se hunde, ahí te cuesta."
 */
export function textoRadar(puntos: PuntoRadar[], reciente: boolean): string {
  if (reciente) return 'Todo hábito empieza en 0 y sube con cada día que cumples. En unas semanas tu figura tomará forma.';
  if (puntos.length && puntos.every((p) => p.hoy >= 90)) return 'Tus hábitos ya están firmes. Ahora toca mantenerlos: cada vez que cumples sigue sumando en tus récords.';
  const con = puntos.filter((p) => p.antes !== null);
  const prom = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  if (con.length && prom(puntos.map((p) => p.hoy)) < 20 && prom(con.map((p) => p.antes!)) - prom(con.map((p) => p.hoy)) >= 10) return 'Tu figura se encogió, y así funciona: baja despacio. Cumple uno hoy y vuelve a crecer.';
  const base = 'Cada punta es un hábito: entre más lejos del centro, más firme.';
  const bajaron = con.filter((p) => p.antes! - p.hoy >= 5).sort((a, b) => (b.antes! - b.hoy) - (a.antes! - a.hoy));
  if (bajaron.length) return `${base} ${bajaron[0].habito.nombre} bajó ${bajaron[0].antes! - bajaron[0].hoy} en 30 días. Con unos días seguidos vuelve a subir.`;
  return `${base} Donde la figura se hunde, ahí te cuesta.`;
}

/** aria-label del dibujo: "Radar de la fuerza de 7 hábitos: hoy en ámbar, hace 30 días punteado." (los valores van en cada nombre). */
export function ariaRadarDibujo(n: number, conAntes: boolean): string {
  return `Radar de la fuerza de ${n} hábitos: hoy en ámbar${conAntes ? ', hace 30 días punteado' : ''}.`;
}

/** aria-label de cada nombre: "Finanzas: fuerza 44, bajó 14. Ver el hábito" ("nuevo" si no existía hace 30 días). */
export function ariaPuntoRadar(p: PuntoRadar, conAntes: boolean): string {
  const d = p.antes === null || !conAntes ? 0 : p.hoy - p.antes;
  const nuevo = conAntes && p.antes === null ? ', nuevo' : '';
  return `${p.habito.nombre}: fuerza ${p.hoy}${d > 0 ? `, subió ${d}` : d < 0 ? `, bajó ${-d}` : ''}${nuevo}. Ver el hábito`;
}

/** Lo que lee un lector de pantalla: "Fuerza de cada hábito: Ayuno 92, subió 2; Finanzas 44, bajó 14; Leer 20 min 84." */
export function ariaRadar(puntos: PuntoRadar[]): string {
  return 'Fuerza de cada hábito: ' + puntos.map((p) => {
    const d = p.antes === null ? 0 : p.hoy - p.antes;
    return `${p.habito.nombre} ${p.hoy}${d > 0 ? `, subió ${d}` : d < 0 ? `, bajó ${-d}` : ''}`;
  }).join('; ') + '.';
}

export interface Destacado {
  tipo: 'firme' | 'ayuda' | 'subio';
  /** "Más firme" / "Necesita ayuda" / "El que más subió" */
  titulo: string;
  punto: PuntoRadar;
  /** Lo que va a la derecha: "92" / "44" / "↑ 37" */
  valor: string;
}

/**
 * La tarjeta "Lo que dice tu gráfica" (antes "Lo que dice tu figura"; escritorio, al lado del radar):
 * - "Más firme": el de más fuerza;
 * - "Necesita ayuda": el de menos fuerza entre los que ya existían hace 30 días (uno nuevo empieza en 0 y no es que le cueste),
 *   si está por debajo de 75 y no es el mismo de "Más firme";
 * - "El que más subió": el que más subió en 30 días, si subió 5 o más y no salió ya arriba.
 * Sin hábitos o con figura de recién empiezas, vacío.
 */
export function destacadosRadar(puntos: PuntoRadar[], reciente: boolean): Destacado[] {
  if (reciente || puntos.length === 0) return [];
  const out: Destacado[] = [];
  const firme = [...puntos].sort((a, b) => b.hoy - a.hoy)[0];
  out.push({ tipo: 'firme', titulo: 'Más firme', punto: firme, valor: String(firme.hoy) });
  const viejos = puntos.filter((p) => p.antes !== null);
  const ayuda = [...viejos].sort((a, b) => a.hoy - b.hoy)[0];
  if (ayuda && ayuda !== firme && ayuda.hoy < 75) out.push({ tipo: 'ayuda', titulo: 'Necesita ayuda', punto: ayuda, valor: String(ayuda.hoy) });
  const subio = [...viejos].sort((a, b) => (b.hoy - b.antes!) - (a.hoy - a.antes!))[0];
  if (subio && subio.hoy - subio.antes! >= 5 && !out.some((d) => d.punto === subio)) out.push({ tipo: 'subio', titulo: 'El que más subió', punto: subio, valor: `↑ ${subio.hoy - subio.antes!}` });
  return out;
}

/** Cuántas barritas inclinadas tiene cada fila de "Lo que dice tu gráfica". Cada una vale unos 3 puntos de fuerza. */
export const BARRITAS_GRAFICA = 30;

export interface BarrasDestacado {
  /** Una por barrita: 'on' = llena; 'base' = lo que ya tenía hace 30 días (solo en "El que más subió"); '' = vacía. */
  segmentos: ('on' | 'base' | '')[];
  /** La barrita que lleva la marca punteada de "hace 30 días"; null si el hábito no existía entonces. */
  marca: number | null;
}

/**
 * Las barritas de una fila de "Lo que dice tu gráfica" (Progreso, escritorio; DESIGN.md › "Lo que dice tu gráfica").
 * Con fuerza mayor que 0 siempre hay al menos una llena, para que no parezca vacío.
 */
export function barrasDestacado(d: Destacado, n: number = BARRITAS_GRAFICA): BarrasDestacado {
  const cuantas = (v: number) => { const c = Math.round((Math.max(0, Math.min(100, v)) / 100) * n); return v > 0 ? Math.max(1, c) : 0; };
  const hoy = cuantas(d.punto.hoy);
  const antes = d.punto.antes === null ? null : cuantas(d.punto.antes);
  const segmentos = Array.from({ length: n }, (_, i): 'on' | 'base' | '' => (i >= hoy ? '' : d.tipo === 'subio' && antes !== null && i < antes ? 'base' : 'on'));
  return { segmentos, marca: antes === null ? null : Math.max(0, antes - 1) };
}

/** Lo que oye quien usa lector de pantalla en cada fila (las barritas van ocultas para él). */
export function ariaDestacado(d: Destacado): string {
  const { hoy, antes } = d.punto;
  const nombre = d.punto.habito.nombre;
  if (d.tipo === 'subio' && antes !== null) return `${d.titulo}: ${nombre}, subió ${hoy - antes}, de ${antes} a ${hoy}. Ver el hábito`;
  return `${d.titulo}: ${nombre}, fuerza ${hoy}${antes === null ? '' : `, hace 30 días ${antes}`}. Ver el hábito`;
}

/** Cuántas filas de "Tus hábitos" se ven antes de "Ver todos (N)": 6 en escritorio, 5 en el celular. */
export const FILAS_TUS_HABITOS = { escritorio: 6, celular: 5 };
