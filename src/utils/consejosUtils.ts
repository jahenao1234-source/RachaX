import { Compromiso, Habito, MomentoPlan, Registro, Tarea } from '../types';
import { formatDateToString, getSemanaDates, isHabitScheduledForDate, obtenerHojasSubtareas, parseDateString } from './habitUtils';
import { addDays, fuerzaSerieHabito } from './progresoUtils';
import { aplicaEn, momentoDe } from './compromisosUtils';
import { fechaTerminada, siguientePaso } from './tareasUtils';
import { pasosSinDia } from './semanaUtils';

// ---------- "Qué hacer ahora" en Progreso (design/maqueta-progreso-informe.html, DESIGN.md › Progreso) ----------

export type TipoConsejo = 'regreso' | 'olvido' | 'cae' | 'muchos' | 'choque' | 'dia' | 'momento' | 'meta' | 'tarea' | 'semana' | 'firme';

/** Lo que hace el botón del consejo. La pantalla decide cómo (abrir hoja, cambiar de pestaña…). */
export type AccionConsejo =
  | { tipo: 'irAHoy' }
  | { tipo: 'revisarDia'; fecha: string }
  | { tipo: 'editarHabito'; habitoId: string }
  | { tipo: 'gestionarHabitos' }
  | { tipo: 'abrirSemana' }
  | { tipo: 'verSeccion'; seccion: 'momentos' }
  | { tipo: 'bajarMeta'; habitoId: string; meta: number }
  | { tipo: 'ponerDiaPaso'; tareaId: string; pasoId: string }
  | { tipo: 'ponerReto'; habitoId: string; meta: number };

export interface Consejo {
  tipo: TipoConsejo;
  /** Identifica el consejo y su sujeto ("cae:<habitoId>"). Con ella se guarda "Ahora no". */
  clave: string;
  titulo: string;
  texto: string;
  boton: string;
  positivo: boolean;
  accion: AccionConsejo;
}

export interface EntradaConsejos {
  /** Solo los hábitos activos (sin archivar). */
  habitos: Habito[];
  registros: Registro[];
  diasCongelados: string[];
  tareas: Tarea[];
  compromisos: Compromiso[];
  hoy: string;
}

/** "Ahora no" esconde el consejo 7 días, contando hoy. */
export const DIAS_CONSEJO_OCULTO = 7;
export const hastaOcultarConsejo = (hoy: string) => addDays(hoy, DIAS_CONSEJO_OCULTO - 1);
/** Quita de la lista los ocultos que ya vencieron. */
export function limpiarConsejosOcultos(ocultos: Record<string, string>, hoy: string): Record<string, string> {
  const res: Record<string, string> = {};
  for (const [k, hasta] of Object.entries(ocultos)) if (hasta >= hoy) res[k] = hasta;
  return res;
}

const DIA_PLURAL = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'];
const DIA_SING = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MOMENTO_TXT: Record<MomentoPlan, string> = { manana: 'mañana', tarde: 'tarde', noche: 'noche' };
const ANCLA: Record<MomentoPlan, string> = { manana: 'después de cepillarte', tarde: 'después de almorzar', noche: 'después de cenar' };
const MOMENTOS: MomentoPlan[] = ['manana', 'tarde', 'noche'];

const diasEntre = (desde: string, hasta: string) =>
  Math.round((parseDateString(hasta).getTime() - parseDateString(desde).getTime()) / 86400000);
const creadoDe = (h: Pick<Habito, 'creadoEn'>) => formatDateToString(new Date(h.creadoEn));
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
const sinPunto = (t: string) => t.trim().replace(/[.。…:;,]+$/, '');

/** Índice de lo cumplido y de los valores, para no recorrer los registros en cada día. */
function indice(registros: Registro[]) {
  const hechos = new Set<string>();
  const valores = new Map<string, number>();
  for (const r of registros) {
    const k = `${r.habitoId}|${r.fecha}`;
    if (r.completado) hechos.add(k);
    if (typeof r.valor === 'number') valores.set(k, r.valor);
  }
  return { hecho: (id: string, f: string) => hechos.has(`${id}|${f}`), valor: (id: string, f: string) => valores.get(`${id}|${f}`) ?? (hechos.has(`${id}|${f}`) ? Infinity : 0) };
}

/** Programados, cumplidos y congelados de un grupo de hábitos entre dos días (incluidos). Sin semanales. */
function tasa(hs: Habito[], hecho: (id: string, f: string) => boolean, congelados: Set<string>, desde: string, hasta: string, filtro?: (f: string) => boolean) {
  let prog = 0, cump = 0, cong = 0;
  for (let f = desde; f <= hasta; f = addDays(f, 1)) {
    if (filtro && !filtro(f)) continue;
    for (const h of hs) {
      if (!isHabitScheduledForDate(h, f)) continue;
      prog++;
      if (hecho(h.id, f)) cump++;
      else if (congelados.has(f)) cong++;
    }
  }
  return { prog, cump, cong, pct: pct(cump, prog - cong) };
}

/**
 * Todos los consejos que aplican hoy, en orden de prioridad (DESIGN.md › Progreso › Qué hacer ahora).
 * No filtra los que la persona escondió con "Ahora no": eso lo hace elegirConsejos.
 * Con menos de 14 días desde el primer hábito solo salen regreso, olvido, tarea y semana.
 */
export function calcularConsejos(e: EntradaConsejos): Consejo[] {
  const { habitos, hoy } = e;
  const out: Consejo[] = [];
  if (habitos.length === 0) return out;
  const { hecho, valor } = indice(e.registros);
  const congelados = new Set(e.diasCongelados);
  const ayer = addDays(hoy, -1);
  const diarios = habitos.filter((h) => h.frecuencia !== 'semanal');
  const primerDia = habitos.map(creadoDe).sort()[0];
  const conDatos = diasEntre(primerDia, hoy) >= 14;
  const hechosDelDia = (f: string) => {
    const tocan = diarios.filter((h) => isHabitScheduledForDate(h, f));
    return { tocan: tocan.length, hechos: tocan.filter((h) => hecho(h.id, f)).length };
  };

  // 1. Regreso: 3 o más días seguidos con hábitos y nada cumplido (sin comodín), y hoy todavía nada.
  let grises = 0;
  for (let f = ayer, i = 0; f >= primerDia && i < 60; f = addDays(f, -1), i++) {
    const d = hechosDelDia(f);
    if (d.tocan === 0) continue;
    if (d.hechos === 0 && !congelados.has(f)) grises++;
    else break;
  }
  const hoyAlgo = habitos.some((h) => hecho(h.id, hoy));
  const regreso = grises >= 3 && !hoyAlgo;
  if (regreso) {
    out.push({ tipo: 'regreso', clave: `regreso:${hoy}`, titulo: 'Hoy tu regreso vale el doble', texto: 'Cumple uno hoy, el que sea, y suma el doble de puntos.', boton: 'Ir a Hoy', positivo: true, accion: { tipo: 'irAHoy' } });
  }

  // 2. Se te olvidó marcar ayer: ayer nada (sin comodín) y en los 14 días anteriores cumplía 70% o más.
  if (!regreso) {
    const a = hechosDelDia(ayer);
    if (a.tocan > 0 && a.hechos === 0 && !congelados.has(ayer)) {
      const t = tasa(diarios, hecho, congelados, addDays(ayer, -14), addDays(ayer, -1));
      if (t.prog >= 7 && t.pct >= 70) {
        out.push({ tipo: 'olvido', clave: `olvido:${ayer}`, titulo: '¿Se te olvidó marcar ayer?', texto: 'Ayer no marcaste nada, y casi siempre cumples. Si lo hiciste, márcalo. Si no pudiste, congélalo con un comodín.', boton: 'Revisar ayer', positivo: false, accion: { tipo: 'revisarDia', fecha: ayer } });
      }
    }
  }

  // 3. Un hábito que se cae: 3 o más días programados seguidos sin marcar nada (hasta ayer). Solo hábitos de hacer, con 7 días o más.
  let peor: { h: Habito; n: number } | null = null;
  for (const h of diarios) {
    if (h.tipo === 'negativo' || diasEntre(creadoDe(h), hoy) < 7) continue;
    let n = 0;
    for (let f = ayer, i = 0; f >= creadoDe(h) && i < 60; f = addDays(f, -1), i++) {
      if (!isHabitScheduledForDate(h, f) || (congelados.has(f) && !hecho(h.id, f))) continue;
      if (hecho(h.id, f) || valor(h.id, f) > 0) break; // un avance parcial (5 de 8) no es "sin marcarse"
      n++;
    }
    if (n >= 3 && (!peor || n > peor.n)) peor = { h, n };
  }
  if (peor && conDatos && !regreso) {
    out.push({ tipo: 'cae', clave: `cae:${peor.h.id}`, titulo: `${peor.h.nombre} lleva ${peor.n} días sin marcarse`, texto: 'Hazlo más pequeño por unos días. Con 5 minutos también cuenta.', boton: 'Editar el hábito', positivo: false, accion: { tipo: 'editarHabito', habitoId: peor.h.id } });
  }

  // 4. Demasiados a la vez: 6 o más hábitos y este mes (hasta ayer, desde el día 7) por debajo de 50%.
  if (conDatos && habitos.length >= 6 && parseDateString(ayer).getDate() >= 7) {
    const t = tasa(diarios, hecho, congelados, ayer.slice(0, 8) + '01', ayer);
    if (t.prog > 0 && t.pct < 50) {
      out.push({ tipo: 'muchos', clave: `muchos:${ayer.slice(0, 7)}`, titulo: `Con ${habitos.length} hábitos, este mes vas en ${t.pct}%`, texto: 'Con menos hábitos cumples más. Archiva uno o dos y vuelve a sumarlos cuando los demás estén firmes.', boton: 'Elegir cuáles archivar', positivo: false, accion: { tipo: 'gestionarHabitos' } });
    }
  }

  // 5. Choque con un compromiso semanal: en sus últimos 4 días (hasta ayer) el hábito de ese momento salió 1 vez o ninguna,
  //    y los otros días de los últimos 30 va en 60% o más.
  if (conDatos) {
    let mejorChoque: { c: Compromiso; h: Habito; hechos: number; tocaron: number; dia: number; m: MomentoPlan } | null = null;
    for (const c of e.compromisos) {
      const m = momentoDe(c);
      if (!c.repetirSemanal || !m) continue;
      const dia = parseDateString(c.fecha).getDay();
      const fechas: string[] = [];
      for (let f = ayer, i = 0; i < 35 && fechas.length < 4; f = addDays(f, -1), i++) {
        if (parseDateString(f).getDay() === dia && aplicaEn(c, f)) fechas.push(f);
      }
      if (fechas.length < 3) continue;
      for (const h of diarios) {
        if (h.momento !== m) continue;
        const tocan = fechas.filter((f) => isHabitScheduledForDate(h, f) && !(congelados.has(f) && !hecho(h.id, f)));
        if (tocan.length < 3) continue;
        const hechos = tocan.filter((f) => hecho(h.id, f)).length;
        if (hechos > 1) continue;
        const otros = tasa([h], hecho, congelados, addDays(ayer, -29), ayer, (f) => parseDateString(f).getDay() !== dia);
        if (otros.prog < 5 || otros.pct < 60) continue;
        if (!mejorChoque || tocan.length - hechos > mejorChoque.tocaron - mejorChoque.hechos) mejorChoque = { c, h, hechos, tocaron: tocan.length, dia, m };
      }
    }
    if (mejorChoque) {
      const { c, h, hechos, tocaron, dia, m } = mejorChoque;
      out.push({ tipo: 'choque', clave: `choque:${c.id}:${h.id}`, titulo: `Los ${DIA_PLURAL[dia]} en la ${MOMENTO_TXT[m]} tienes ${c.titulo}`, texto: `Ese día ${h.nombre} casi nunca sale (${hechos} de ${tocaron}). Pásalo a otro momento del día.`, boton: 'Cambiar el momento', positivo: false, accion: { tipo: 'editarHabito', habitoId: h.id } });
    }
  }

  // 6. El día de la semana más flojo (últimos 30 días hasta ayer): 60% o menos y 20 puntos o más por debajo del mejor.
  if (conDatos) {
    const desde = addDays(ayer, -29);
    const porDia = [0, 1, 2, 3, 4, 5, 6].map((d) => tasa(diarios, hecho, congelados, desde, ayer, (f) => parseDateString(f).getDay() === d));
    const validos = porDia.map((t, d) => ({ d, t })).filter((x) => x.t.prog - x.t.cong >= 3);
    if (validos.length >= 2) {
      const bajo = validos.reduce((a, b) => (b.t.pct < a.t.pct ? b : a));
      const alto = validos.reduce((a, b) => (b.t.pct > a.t.pct ? b : a));
      if (bajo.t.pct <= 60 && alto.t.pct - bajo.t.pct >= 20) {
        const finde = bajo.d === 0 || bajo.d === 6;
        const resto = tasa(diarios, hecho, congelados, desde, ayer, (f) => { const d = parseDateString(f).getDay(); return finde ? d >= 1 && d <= 5 : d !== bajo.d; });
        const vispera = DIA_SING[(bajo.d + 6) % 7];
        out.push({ tipo: 'dia', clave: `dia:${bajo.d}`, titulo: `Los ${DIA_PLURAL[bajo.d]} te cuestan más (${bajo.t.pct}%)`, texto: `${finde ? 'Entre semana' : 'Los otros días'} vas en ${resto.pct}%. Decide desde el ${vispera} a qué hora lo harás el ${DIA_SING[bajo.d]}.`, boton: `Planear el ${DIA_SING[bajo.d]}`, positivo: false, accion: { tipo: 'abrirSemana' } });
      }
    }
  }

  // 7. El momento más flojo (últimos 30 días): misma regla que el día.
  if (conDatos) {
    const desde = addDays(ayer, -29);
    const porMom = MOMENTOS.map((m) => ({ m, t: tasa(diarios.filter((h) => h.momento === m), hecho, congelados, desde, ayer) })).filter((x) => x.t.prog - x.t.cong >= 7);
    if (porMom.length >= 2) {
      const bajo = porMom.reduce((a, b) => (b.t.pct < a.t.pct ? b : a));
      const alto = porMom.reduce((a, b) => (b.t.pct > a.t.pct ? b : a));
      if (bajo.t.pct <= 60 && alto.t.pct - bajo.t.pct >= 20) {
        out.push({ tipo: 'momento', clave: `momento:${bajo.m}`, titulo: `La ${MOMENTO_TXT[bajo.m]} es tu momento más difícil (${bajo.t.pct}%)`, texto: `Amarra esos hábitos a algo que ya haces siempre, como ${ANCLA[bajo.m]}.`, boton: 'Ver tus momentos', positivo: false, accion: { tipo: 'verSeccion', seccion: 'momentos' } });
      }
    }
  }

  // 8. Meta muy alta: en sus últimos 14 días programados (hasta ayer) avanzó 7 o más veces, la cumplió 3 o menos,
  //    y lo típico (la mediana de lo que marca) queda por debajo de la meta. Propone lo típico + 1.
  for (const h of conDatos ? diarios : []) {
    const meta = h.metaDiaria ?? 0;
    if (meta < 2 || h.tipo === 'negativo') continue;
    const vals: number[] = [];
    for (let f = ayer, i = 0; vals.length < 14 && i < 60 && f >= creadoDe(h); f = addDays(f, -1), i++) {
      if (!isHabitScheduledForDate(h, f)) continue;
      const v = valor(h.id, f);
      if (v === 0 && congelados.has(f)) continue;
      vals.push(v);
    }
    const conAvance = vals.filter((v) => v > 0).sort((a, b) => a - b);
    const cumplidas = vals.filter((v) => v >= meta).length;
    if (conAvance.length < 7 || cumplidas > 3) continue;
    const tipico = conAvance[Math.floor((conAvance.length - 1) / 2)];
    if (!Number.isFinite(tipico) || tipico >= meta) continue;
    const nueva = Math.min(meta - 1, tipico + 1);
    out.push({ tipo: 'meta', clave: `meta:${h.id}:${meta}`, titulo: `${h.nombre}: casi siempre llegas a ${tipico} de ${meta}`, texto: 'Una meta que sí alcanzas anima más. Cuando la cumplas seguido, la vuelves a subir.', boton: `Bajar la meta a ${nueva}`, positivo: false, accion: { tipo: 'bajarMeta', habitoId: h.id, meta: nueva } });
    break;
  }

  // 9. Una tarea quieta: 10 días o más sin marcar pasos y sin ningún paso pendiente con día de hoy en adelante.
  let quieta: { t: Tarea; dias: number; pasoId: string; texto: string } | null = null;
  for (const t of e.tareas) {
    if (t.completada) continue;
    const sig = siguientePaso(t);
    if (!sig) continue;
    const hojas = obtenerHojasSubtareas(t.subtareas);
    if (hojas.some((p) => !p.hecha && p.fecha && p.fecha >= hoy)) continue;
    const ultima = [fechaTerminada(t), formatDateToString(new Date(t.creadoEn))].filter((x): x is string => !!x).sort().pop()!;
    const dias = diasEntre(ultima, hoy);
    if (dias >= 10 && (!quieta || dias > quieta.dias)) quieta = { t, dias, pasoId: sig.id, texto: sig.texto };
  }
  if (quieta) {
    out.push({ tipo: 'tarea', clave: `tarea:${quieta.t.id}`, titulo: `${quieta.t.nombre} lleva ${quieta.dias} días quieta`, texto: `Ponle día al siguiente paso: ${sinPunto(quieta.texto)}.`, boton: 'Ponerle día', positivo: false, accion: { tipo: 'ponerDiaPaso', tareaId: quieta.t.id, pasoId: quieta.pasoId } });
  }

  // 10. Planear la semana: 5 o más pasos sin día en tareas abiertas. "Ahora no" lo esconde hasta la otra semana.
  const sinDia = pasosSinDia(e.tareas).reduce((n, g) => n + g.pasos.length, 0);
  if (sinDia >= 5) {
    out.push({ tipo: 'semana', clave: `semana:${getSemanaDates(hoy)[0]}`, titulo: `Tienes ${sinDia} pasos sin día`, texto: 'Con 5 minutos los repartes en la semana y sabes qué toca cada día.', boton: 'Abrir Tu semana', positivo: false, accion: { tipo: 'abrirSemana' } });
  }

  // 11. Positivo: el hábito más firme (fuerza 85 o más) sin un reto en curso. Propone el siguiente reto (30 y luego 66).
  let firme: { h: Habito; f: number; meta: number } | null = null;
  for (const h of diarios) {
    if (h.reto && !h.reto.cumplidoEn) continue;
    const meta = !h.reto ? 30 : h.reto.meta < 30 ? 30 : h.reto.meta < 66 ? 66 : 0;
    if (!meta) continue;
    const serie = fuerzaSerieHabito(h, e.registros, e.diasCongelados, ayer);
    const f = Math.round((serie[serie.length - 1]?.valor ?? 0) * 100);
    if (f >= 85 && (!firme || f > firme.f)) firme = { h, f, meta };
  }
  if (firme && conDatos && !regreso) {
    out.push({ tipo: 'firme', clave: `firme:${firme.h.id}:${firme.meta}`, titulo: `${firme.h.nombre} ya está firme`, texto: `Su fuerza va en ${firme.f} de 100. ¿Vas por el reto de ${firme.meta} días?`, boton: `Ir por ${firme.meta} días`, positivo: true, accion: { tipo: 'ponerReto', habitoId: firme.h.id, meta: firme.meta } });
  }
  return out;
}

/**
 * Los que se muestran: máximo 3, sin los escondidos con "Ahora no".
 * El de regreso sale solo. Si hay uno positivo, va de último (el tercer lugar si hay 3).
 */
export function elegirConsejos(todos: Consejo[], ocultos: Record<string, string>, hoy: string, max = 3): Consejo[] {
  const visibles = todos.filter((c) => !(ocultos[c.clave] && ocultos[c.clave] >= hoy));
  if (visibles[0]?.tipo === 'regreso') return [visibles[0]];
  const otros = visibles.filter((c) => c.tipo !== 'regreso');
  const pos = otros.find((c) => c.positivo);
  const neg = otros.filter((c) => !c.positivo);
  return pos ? [...neg.slice(0, max - 1), pos] : neg.slice(0, max);
}

// ---------- Tu año (solo escritorio): 53 semanas de lunes a domingo que terminan en la de hoy ----------

export type EstadoCeldaAnio = 'fut' | 'antes' | 'hoy' | 'libre' | 'nada' | 'parte' | 'todo' | 'como';
export interface CeldaAnio { fecha: string; estado: EstadoCeldaAnio; hechos: number; tocan: number }
export interface TuAnio {
  /** 53 columnas (semanas), cada una con 7 días de lunes a domingo. */
  semanas: CeldaAnio[][];
  /** Etiqueta del mes en la columna donde empieza; el primero y enero llevan el año ("oct 2025", "ene 2026"). */
  meses: { columna: number; texto: string }[];
  /** Solo días pasados (sin contar hoy). "parte" siempre es 0 cuando se ve un solo hábito. */
  cuentas: { todo: number; parte: number; nada: number; como: number };
  /** Primer día con hábitos dentro de la cuadrícula (o null si no hay ninguno). */
  desde: string | null;
}
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/**
 * Cuadritos del año. Sin habitoId: todos los hábitos activos juntos, con los mismos estados del Calendario
 * (los semanales no cuentan, como en Tu mes). Con habitoId: solo ese hábito (cumplido / sin cumplir / comodín / libre).
 */
export function tuAnio(habitos: Habito[], registros: Registro[], diasCongelados: string[], hoy: string, habitoId?: string): TuAnio {
  const { hecho } = indice(registros);
  const congelados = new Set(diasCongelados);
  const uno = habitoId ? habitos.find((h) => h.id === habitoId) : undefined;
  const grupo = uno ? [uno] : habitos.filter((h) => h.frecuencia !== 'semanal');
  const primer = (uno ? [uno] : habitos).map(creadoDe).sort()[0] ?? null;
  const inicio = addDays(getSemanaDates(hoy)[0], -52 * 7);
  const semanas: CeldaAnio[][] = [];
  const meses: { columna: number; texto: string }[] = [];
  const cuentas = { todo: 0, parte: 0, nada: 0, como: 0 };
  let desde: string | null = null;
  for (let w = 0; w < 53; w++) {
    const col: CeldaAnio[] = [];
    for (let k = 0; k < 7; k++) {
      const f = addDays(inicio, w * 7 + k);
      const d = parseDateString(f);
      if (d.getDate() === 1) meses.push({ columna: w, texto: MESES_CORTOS[d.getMonth()] });
      if (f > hoy) { col.push({ fecha: f, estado: 'fut', hechos: 0, tocan: 0 }); continue; }
      if (!primer || f < primer) { col.push({ fecha: f, estado: 'antes', hechos: 0, tocan: 0 }); continue; }
      if (!desde) desde = f;
      let estado: EstadoCeldaAnio, hechos = 0, tocan = 0;
      if (uno && uno.frecuencia === 'semanal') {
        tocan = 1; hechos = hecho(uno.id, f) ? 1 : 0;
        estado = hechos ? 'todo' : 'libre';
      } else {
        const tocanH = grupo.filter((h) => isHabitScheduledForDate(h, f));
        tocan = tocanH.length;
        hechos = tocanH.filter((h) => hecho(h.id, f)).length;
        if (tocan === 0) estado = 'libre';
        else if (hechos === tocan) estado = 'todo';
        else if (congelados.has(f)) estado = 'como';
        else if (hechos === 0) estado = 'nada';
        else estado = 'parte';
      }
      if (f === hoy) { col.push({ fecha: f, estado: 'hoy', hechos, tocan }); continue; }
      if (estado === 'todo' || estado === 'parte' || estado === 'nada' || estado === 'como') cuentas[estado]++;
      col.push({ fecha: f, estado, hechos, tocan });
    }
    semanas.push(col);
  }
  // El año va en la primera etiqueta y en enero
  meses.forEach((m, i) => {
    const d = parseDateString(semanas[m.columna].find((c) => parseDateString(c.fecha).getDate() === 1)!.fecha);
    if (i === 0 || d.getMonth() === 0) m.texto = `${m.texto} ${d.getFullYear()}`;
  });
  return { semanas, meses, cuentas, desde };
}

/** La frase debajo de Tu año. Nunca muestra un 0. */
export function textoTuAnio(a: TuAnio, nombreHabito?: string): string {
  const { todo, parte, nada } = a.cuentas;
  if (!a.desde || todo + parte + nada + a.cuentas.como === 0) return 'Aquí se irán llenando tus días.';
  const d = parseDateString(a.desde);
  const inicio = a.desde === a.semanas[0][0].fecha ? 'En los últimos 12 meses' : `Desde el ${d.getDate()} de ${MESES_LARGOS[d.getMonth()]}`;
  if (nombreHabito) {
    const base = todo + nada;
    return `${nombreHabito}: ${todo} de ${base} ${base === 1 ? 'día cumplido' : 'días cumplidos'} ${inicio.charAt(0).toLowerCase() + inicio.slice(1)}.`;
  }
  const partes = [
    todo ? `${todo} ${todo === 1 ? 'día completo' : 'días completos'}` : '',
    parte ? `${parte} con una parte` : '',
    nada ? `${nada} sin nada` : '',
  ].filter(Boolean);
  const lista = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0] ?? '';
  return lista ? `${inicio}: ${lista}.` : 'Aquí se irán llenando tus días.';
}
