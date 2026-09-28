import { Subtarea } from '../types';
import { nuevoIdPaso } from './tareasUtils';

/**
 * "Pegar una lista" (design/maqueta-tareas-pegar.html, DESIGN.md › Tareas).
 * Lee el texto que se pega (por ejemplo, el plan que dio una IA) y lo vuelve un árbol de pasos.
 * - Quita números (1. 1.1 2) a.), viñetas (- * • ·), casillas ([ ] [x]), títulos (#) y negritas.
 * - El nivel sale de la sangría y del tipo de marca: 1.1 va dentro de 1; una viñeta debajo de un número va dentro de él;
 *   bajo un título (#) va lo que sigue. Sin límite de niveles.
 * - Si hay renglones con marca, los renglones sueltos del principio son la introducción (el primero puede ser el nombre)
 *   y los del final quedan por fuera ("¡Espero que te sirva!").
 * Devuelve null si no hay al menos 2 pasos: entonces se pega como texto normal.
 */

export interface PasoPegado { id: string; texto: string; hijos: PasoPegado[] }
export interface ListaPegada {
  /** Primer renglón suelto (o título único) de arriba: sirve de nombre para una tarea nueva. */
  titulo: string | null;
  pasos: PasoPegado[];
  /** Renglones que no parecían pasos y se dejaron por fuera. */
  fuera: string[];
}

type Tipo = 'titulo' | 'num' | 'letra' | 'vineta' | 'texto';
interface Renglon { sangria: number; tipo: Tipo; rango: number; texto: string; negrita: boolean; charla: boolean }

/** Frases de la IA que no son el nombre del plan ("¡Claro! Aquí tienes…", "Por supuesto:"). */
const CHARLA = /^(¡|!|claro|aqu[ií]|por supuesto|perfecto|listo|genial|con gusto|te dejo|a continuaci[oó]n|sure|here|of course)/i;

const limpiarTexto = (t: string) => t
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/__(.+?)__/g, '$1')
  .replace(/`([^`]*)`/g, '$1')
  .replace(/^\*(.+)\*$/, '$1')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\s*:$/, '')
  .trim();

/** numerosSueltos: la lista usa "1 Algo" sin punto (porque también trae 1.1, o empieza en "1 " y "2 "). */
function leerRenglon(linea: string, numerosSueltos: boolean): Renglon | null {
  const expandida = linea.replace(/\t/g, '    ').replace(/\s+$/, '');
  if (!expandida.trim()) return null;
  const sangria = expandida.length - expandida.trimStart().length;
  let resto = expandida.trimStart();
  let tipo: Tipo = 'texto';
  let rango = 3;
  let m: RegExpMatchArray | null;
  if ((m = resto.match(/^(#{1,6})\s+/))) {
    tipo = 'titulo'; rango = (m[1].length - 1) * 0.1; resto = resto.slice(m[0].length);
  } else if ((m = resto.match(/^(?:paso\s+(\d+)[:.)]?|(\d+(?:\.\d+)+)[.)]?|(\d+)[.)])(?:\s+|$)/i)) || (numerosSueltos && (m = resto.match(/^()()(\d+)\s+(?=\S)/)))) {
    // "1." "1)" "1.1" "1.1.1" "Paso 2:" (profundidad por los puntos). "2 libras de arroz" no es un número de lista.
    const partes = (m[1] || m[2] || m[3]).split('.').filter(Boolean).length;
    tipo = 'num'; rango = 1 + (partes - 1) * 0.1; resto = resto.slice(m[0].length);
  } else if ((m = resto.match(/^[a-zA-Z][.)]\s+/))) {
    tipo = 'letra'; rango = 1.5; resto = resto.slice(m[0].length);
  } else if ((m = resto.match(/^[-*+•·◦▪‣–—]\s*/)) && !/^\*\*/.test(resto)) {
    tipo = 'vineta'; rango = 2; resto = resto.slice(m[0].length);
  }
  // Casilla de Markdown después de la viñeta (o sola)
  const casilla = resto.match(/^\[[ xX✓]\]\s*/);
  if (casilla) {
    resto = resto.slice(casilla[0].length);
    if (tipo === 'texto') { tipo = 'vineta'; rango = 2; }
  }
  const negrita = /^\*\*[^*].*\*\*:?$/.test(resto) || /^__.+__:?$/.test(resto);
  const terminaEnDosPuntos = /:\s*$/.test(resto);
  // "Paso 1:" dejó los dos puntos al principio
  resto = resto.replace(/^[:.\-–—]\s*/, '');
  const texto = limpiarTexto(resto);
  if (!texto) return null;
  return { sangria, tipo, rango, texto, negrita, charla: CHARLA.test(texto) || terminaEnDosPuntos };
}

export function leerListaPegada(texto: string): ListaPegada | null {
  const lineas = texto.split(/\r?\n/);
  const numerosSueltos = lineas.some((l) => /^\s*\d+\.\d+/.test(l))
    || (lineas.some((l) => /^\s*1\s+\S/.test(l)) && lineas.some((l) => /^\s*2\s+\S/.test(l)));
  const renglones = lineas.map((l) => leerRenglon(l, numerosSueltos)).filter((r): r is Renglon => r !== null);
  if (renglones.length < 2) return null;

  const conMarca = renglones.map((r, i) => (r.tipo !== 'texto' ? i : -1)).filter((i) => i >= 0);
  let titulo: string | null = null;
  const fuera: string[] = [];
  let desde = 0;
  let hasta = renglones.length - 1;

  if (conMarca.length >= 1) {
    // Introducción: renglones sueltos antes del primero con marca
    desde = conMarca[0];
    const intro = renglones.slice(0, desde);
    if (intro.length) {
      // El nombre: el renglón en negrita; si no hay, el primero que no sea charla de la IA. Si ninguno sirve, sin nombre.
      const elegido = intro.find((r) => r.negrita) || intro.find((r) => !r.charla) || null;
      titulo = elegido ? elegido.texto : null;
      fuera.push(...intro.filter((r) => r !== elegido).map((r) => r.texto));
    }
    // Cierre: renglones sueltos al final, sin sangría, después del último con marca
    let ultimo = conMarca[conMarca.length - 1];
    while (ultimo + 1 <= hasta && (renglones[ultimo + 1].sangria > 0)) ultimo++;
    fuera.push(...renglones.slice(ultimo + 1).map((r) => r.texto));
    hasta = ultimo;
    // Un título (#) arriba de todo, único de su nivel, es el nombre y no un paso
    const primero = renglones[desde];
    const otrosIguales = renglones.slice(desde + 1, hasta + 1).some((r) => r.tipo === 'titulo' && r.rango <= primero.rango);
    if (!titulo && primero.tipo === 'titulo' && !otrosIguales) {
      titulo = renglones[desde].texto;
      desde++;
    }
  }

  // Árbol: se sube en la pila mientras el de arriba tenga más sangría, o la misma sangría y una marca "igual o menor"
  const raiz: PasoPegado[] = [];
  const pila: { sangria: number; rango: number; hijos: PasoPegado[] }[] = [];
  for (const r of renglones.slice(desde, hasta + 1)) {
    while (pila.length) {
      const arriba = pila[pila.length - 1];
      if (arriba.sangria > r.sangria || (arriba.sangria === r.sangria && arriba.rango >= r.rango)) pila.pop();
      else break;
    }
    const nodo: PasoPegado = { id: nuevoIdPaso(), texto: r.texto, hijos: [] };
    (pila.length ? pila[pila.length - 1].hijos : raiz).push(nodo);
    pila.push({ sangria: r.sangria, rango: r.rango, hijos: nodo.hijos });
  }

  if (contarPegados(raiz).total < 2) return null;
  return { titulo, pasos: raiz, fuera };
}

/** Cuántos pasos hay en total y cuántos tienen pasos adentro ("5 pasos, 1 con pasos adentro"). */
export function contarPegados(pasos: PasoPegado[]): { total: number; conHijos: number } {
  let total = 0;
  let conHijos = 0;
  const recorrer = (l: PasoPegado[]) => l.forEach((p) => {
    total++;
    if (p.hijos.length) { conHijos++; recorrer(p.hijos); }
  });
  recorrer(pasos);
  return { total, conHijos };
}

/** La ✕ de la vista previa: quita ese paso y lo que tenga adentro. */
export function quitarPegado(pasos: PasoPegado[], id: string): PasoPegado[] {
  return pasos.filter((p) => p.id !== id).map((p) => ({ ...p, hijos: quitarPegado(p.hijos, id) }));
}

/** Para mostrar la vista previa como renglones planos con su nivel de sangría. */
export function aplanarPegados(pasos: PasoPegado[], nivel = 0): { id: string; texto: string; nivel: number }[] {
  return pasos.flatMap((p) => [{ id: p.id, texto: p.texto, nivel }, ...aplanarPegados(p.hijos, nivel + 1)]);
}

/** Pasos de la tarea (sin hacer, sin día). */
export function aSubtareas(pasos: PasoPegado[]): Subtarea[] {
  return pasos.map((p) => ({
    id: nuevoIdPaso(),
    texto: p.texto,
    hecha: false,
    ...(p.hijos.length ? { subtareas: aSubtareas(p.hijos) } : {}),
  }));
}

/** Texto del conteo: "5 pasos, 1 con pasos adentro" / "3 pasos". */
export function textoConteo(pasos: PasoPegado[]): string {
  const { total, conHijos } = contarPegados(pasos);
  const base = `${total} ${total === 1 ? 'paso' : 'pasos'}`;
  return conHijos ? `${base}, ${conHijos} con pasos adentro` : base;
}
