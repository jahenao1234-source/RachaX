// Biblioteca: hábitos, tareas y planes de 30 días listos para agregar con un toque.
// Maqueta: design/maqueta-biblioteca.html · Reglas y textos: DESIGN.md › "### Biblioteca".
// Aquí van los cálculos y TODOS los textos que cambian con los datos. El contenido vive en src/data/biblioteca.ts.
import { COLOR_POR_MOMENTO, FrecuenciaHabito, Habito, MomentoDia, Subtarea, Tarea } from '../types';
import { limpiarMinimo } from './dificilUtils';

/** El método: máximo 3 hábitos al empezar. Si con lo marcado se pasa, sale el aviso (nunca bloquea). */
export const LIMITE_HABITOS = 3;

export interface HabitoBiblioteca {
  /** Fijo y único dentro de su pack o plan. No es el id del hábito que se crea. */
  clave: string;
  nombre: string;
  /** Un nombre de ICONOS_DISPONIBLES. */
  icono: string;
  momento: MomentoDia;
  /** Sin "Después de": el formulario lo guarda así ("cenar", "despertarme"). */
  anclaje: string;
  /** La versión mínima ("un sorbo"). */
  minimo: string;
  /** Por defecto, 'diario'. */
  frecuencia?: FrecuenciaHabito;
  /** 0 = domingo … 6 = sábado, si la frecuencia es 'personalizado'. */
  diasPersonalizados?: number[];
  vecesPorSemana?: number;
}
export interface PasoBiblioteca { texto: string; pasos?: PasoBiblioteca[] }
export interface SemanaPlan { titulo: string; porque: string; pasos: string[] }

export interface PackBiblioteca { tipo: 'pack'; id: string; nombre: string; descripcion: string; icono: string; habitos: HabitoBiblioteca[] }
export interface TareaBiblioteca { tipo: 'tarea'; id: string; grupo: string; nombre: string; icono: string; pasos: PasoBiblioteca[] }
/** `icono` es el de la lista (cualquiera de lucide); `iconoTarea`, el de la tarea que crea (uno de TAREA_ICONOS; por defecto ListChecks). */
export interface PlanBiblioteca { tipo: 'plan'; id: string; nombre: string; descripcion: string; icono: string; iconoTarea?: string; habitos: HabitoBiblioteca[]; semanas: SemanaPlan[] }
export type ItemBiblioteca = PackBiblioteca | TareaBiblioteca | PlanBiblioteca;

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const lista = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Cuenta los pasos pequeños (las hojas), igual que la app en "0 de 9". */
export function contarPasos(pasos: PasoBiblioteca[]): number {
  return pasos.reduce((n, p) => n + (p.pasos && p.pasos.length ? contarPasos(p.pasos) : 1), 0);
}
export const pasosDePlan = (plan: PlanBiblioteca): number => plan.semanas.reduce((n, s) => n + s.pasos.length, 0);

const ORDEN_MOMENTOS: MomentoDia[] = ['manana', 'tarde', 'noche', 'flexible'];
const NOMBRE_MOMENTO: Record<MomentoDia, string> = { manana: 'mañana', tarde: 'tarde', noche: 'noche', flexible: 'todo el día' };
const EN_MOMENTO: Record<MomentoDia, string> = { manana: 'en la mañana', tarde: 'en la tarde', noche: 'en la noche', flexible: '' };
const DIAS = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'];

/** Los momentos de un grupo de hábitos, sin repetir y en orden: "Mañana", "Tarde y noche", "Todo el día y noche". */
export function momentosDe(habitos: HabitoBiblioteca[]): string {
  const hay = ORDEN_MOMENTOS.filter((m) => habitos.some((h) => h.momento === m));
  // "Todo el día" va primero cuando se mezcla con otro momento
  const orden = hay.includes('flexible') ? ['flexible' as MomentoDia, ...hay.filter((m) => m !== 'flexible')] : hay;
  return mayuscula(lista(orden.map((m) => NOMBRE_MOMENTO[m])));
}

/** La segunda línea de cada fila de la lista. */
export function metaDeItem(item: ItemBiblioteca): string {
  if (item.tipo === 'pack') return `${plural(item.habitos.length, 'hábito', 'hábitos')} · ${momentosDe(item.habitos)}`;
  if (item.tipo === 'tarea') return plural(contarPasos(item.pasos), 'paso', 'pasos');
  return `${plural(item.habitos.length, 'hábito', 'hábitos')} · ${plural(pasosDePlan(item), 'paso', 'pasos')}`;
}

/** La línea debajo del título del detalle. */
export function subtituloDeItem(item: ItemBiblioteca): string {
  if (item.tipo === 'pack') return item.descripcion;
  if (item.tipo === 'tarea') return `${plural(contarPasos(item.pasos), 'paso', 'pasos')} · tú les pones el día`;
  const pasos = `1 tarea de ${plural(pasosDePlan(item), 'paso', 'pasos')}`;
  return item.habitos.length ? `Plan de 30 días · ${plural(item.habitos.length, 'hábito', 'hábitos')} y ${pasos}` : `Plan de 30 días · ${pasos}`;
}

/** Cuándo se hace un hábito: "Mañana", "Todo el día", "Domingos en la mañana", "Lunes a viernes en la noche", "3 veces por semana". */
export function cuandoHabito(h: HabitoBiblioteca): string {
  const en = EN_MOMENTO[h.momento];
  const con = (dias: string) => mayuscula(en ? `${dias} ${en}` : dias);
  if (h.frecuencia === 'semanal' && h.vecesPorSemana) return con(plural(h.vecesPorSemana, 'vez por semana', 'veces por semana'));
  if (h.frecuencia === 'entreSemana') return con('lunes a viernes');
  if (h.frecuencia === 'personalizado' && h.diasPersonalizados && h.diasPersonalizados.length && h.diasPersonalizados.length < 7) {
    // De lunes a domingo, como se dice en Colombia
    const dias = [...h.diasPersonalizados].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => DIAS[d]).filter(Boolean);
    return con(lista(dias));
  }
  return mayuscula(NOMBRE_MOMENTO[h.momento]);
}

/** La línea de cada hábito en el detalle: "Mañana · Después de despertarme". */
export function lineaHabito(h: HabitoBiblioteca): string {
  const anclaje = h.anclaje.trim();
  return anclaje ? `${cuandoHabito(h)} · Después de ${anclaje}` : cuandoHabito(h);
}
export const lineaMinimo = (h: HabitoBiblioteca): string => `Mínimo: ${h.minimo.trim()}`;

/** El aviso sale cuando lo que ya llevas más lo marcado pasa de 3. Nunca bloquea: solo avisa. */
export function hayAviso(habitosActivos: number, marcados: number): boolean {
  return habitosActivos > 0 && habitosActivos + marcados > LIMITE_HABITOS;
}
export function textoAviso(habitosActivos: number): string {
  return `Ya llevas ${plural(habitosActivos, 'hábito', 'hábitos')}. Con pocos es más fácil sostenerlos. Deja marcados solo los que quieras sumar ahora.`;
}

/** El botón del pie. `apagado` va con aria-disabled, no con disabled, para no perder el foco. */
export function botonDeItem(item: ItemBiblioteca, marcados: number, ya: boolean): { texto: string; apagado: boolean } {
  if (item.tipo === 'pack') {
    if (ya) return { texto: 'Ya lo agregaste', apagado: true };
    if (marcados <= 0) return { texto: 'Marca al menos un hábito', apagado: true };
    return { texto: `Agregar ${plural(marcados, 'hábito', 'hábitos')}`, apagado: false };
  }
  if (item.tipo === 'tarea') return ya ? { texto: 'Ya la agregaste', apagado: true } : { texto: 'Agregar a mis tareas', apagado: false };
  // Un plan se puede empezar sin hábitos: entra solo la tarea
  return ya ? { texto: 'Ya lo empezaste', apagado: true } : { texto: 'Empezar este plan', apagado: false };
}

/** Lo que tiene la persona de un pack, tarea o plan que ya agregó (los hábitos archivados no cuentan). */
export function agregadoDe(item: ItemBiblioteca, habitos: Habito[], tareas: Tarea[]): { habitos: number; tarea: boolean } {
  return {
    habitos: habitos.filter((h) => h.origen === item.id && !h.archivado).length,
    tarea: tareas.some((t) => t.origen === item.id),
  };
}
/** "Agregado" / "Empezado": existe algo vivo que vino de ahí. Si lo borra o lo deshace, vuelve a estar disponible. */
export function yaAgregado(item: ItemBiblioteca, habitos: Habito[], tareas: Tarea[]): boolean {
  const a = agregadoDe(item, habitos, tareas);
  return a.habitos > 0 || a.tarea;
}
export const marcaDeItem = (item: ItemBiblioteca): string => (item.tipo === 'plan' ? 'Empezado' : 'Agregado');

/** La línea encima del botón apagado: dónde quedó lo que ya agregó. Vacío si no ha agregado nada. */
export function dondeQuedo(item: ItemBiblioteca, habitos: Habito[], tareas: Tarea[]): string {
  const a = agregadoDe(item, habitos, tareas);
  if (item.tipo === 'pack') return a.habitos === 0 ? '' : a.habitos === 1 ? 'Está en Hoy.' : 'Están en Hoy.';
  if (item.tipo === 'tarea') return a.tarea ? 'Está en Tareas.' : '';
  if (a.habitos > 0 && a.tarea) return `${a.habitos === 1 ? 'El hábito está' : 'Los hábitos están'} en Hoy y la tarea en Tareas.`;
  if (a.tarea) return 'La tarea está en Tareas.';
  return a.habitos === 0 ? '' : a.habitos === 1 ? 'El hábito está en Hoy.' : 'Los hábitos están en Hoy.';
}

/** El aviso con Deshacer que sale al agregar. */
export function avisoAgregado(item: ItemBiblioteca, habitosAgregados: number): string {
  if (item.tipo === 'pack') return habitosAgregados === 1 ? 'Agregaste 1 hábito. Ya está en Hoy.' : `Agregaste ${habitosAgregados} hábitos. Ya están en Hoy.`;
  if (item.tipo === 'tarea') return `Agregaste ${item.nombre} a tus tareas.`;
  return habitosAgregados > 0
    ? `Empezaste ${item.nombre}: ${plural(habitosAgregados, 'hábito', 'hábitos')} y 1 tarea.`
    : `Empezaste ${item.nombre}: 1 tarea.`;
}

/**
 * La pregunta antes de quitar algo ya agregado (enlace "Quitar"). Los hábitos se ARCHIVAN (guardan su historial y se
 * restauran en Gestionar hábitos); la tarea se BORRA. `peligro` = se borra algo: el botón "Quitar" va en rojo.
 */
export function confirmarQuitar(item: ItemBiblioteca, habitos: Habito[], tareas: Tarea[]): { titulo: string; texto: string; peligro: boolean } {
  const a = agregadoDe(item, habitos, tareas);
  const titulo = `¿Quitar ${item.nombre}?`;
  const sus = a.habitos === 1 ? 'Su hábito sale' : `Sus ${a.habitos} hábitos salen`;
  if (a.habitos > 0 && a.tarea) {
    return { titulo, texto: `${sus} de Hoy y ${a.habitos === 1 ? 'guarda' : 'guardan'} su historial. La tarea se borra con sus pasos.`, peligro: true };
  }
  if (a.tarea) return { titulo, texto: 'La tarea se borra con sus pasos.', peligro: true };
  return {
    titulo,
    texto: a.habitos === 1
      ? 'Su hábito sale de Hoy. Guarda su historial y lo puedes restaurar en Gestionar hábitos.'
      : `${sus} de Hoy. Guardan su historial y los puedes restaurar en Gestionar hábitos.`,
    peligro: false,
  };
}
/** El aviso después de quitar (sin Deshacer: ya hubo pregunta). */
export const avisoQuitado = (item: ItemBiblioteca): string => `Quitaste ${item.nombre}.`;

// ---------- Crear lo que se agrega (sin tocar nada de lo que la persona ya tiene) ----------

export interface Fabrica { ahora: string; nuevoId: () => string }

/**
 * Los hábitos nuevos de un pack o un plan, solo los marcados (`claves`), en el orden del catálogo.
 * Cada uno con id nuevo, el color de su momento y un `orden` después de los que ya existen.
 */
export function construirHabitos(item: PackBiblioteca | PlanBiblioteca, claves: string[], actuales: Habito[], f: Fabrica): Habito[] {
  let orden = actuales.reduce((m, h) => Math.max(m, h.orden ?? 0), 0);
  return item.habitos.filter((h) => claves.includes(h.clave)).map((h) => {
    const frecuencia: FrecuenciaHabito = h.frecuencia ?? 'diario';
    const nuevo: Habito = {
      id: f.nuevoId(),
      nombre: h.nombre.trim(),
      tipo: 'positivo',
      color: COLOR_POR_MOMENTO[h.momento],
      icono: h.icono,
      momento: h.momento,
      orden: ++orden,
      frecuencia,
      creadoEn: f.ahora,
      origen: item.id,
    };
    const anclaje = h.anclaje.trim();
    if (anclaje) nuevo.anclaje = anclaje;
    const minimo = limpiarMinimo(h.minimo);
    if (minimo) nuevo.minimo = minimo;
    if (frecuencia === 'personalizado' && h.diasPersonalizados?.length) nuevo.diasPersonalizados = [...h.diasPersonalizados];
    if (frecuencia === 'semanal' && h.vecesPorSemana) nuevo.vecesPorSemana = h.vecesPorSemana;
    return nuevo;
  });
}

const aSubtareas = (pasos: PasoBiblioteca[], f: Fabrica): Subtarea[] => pasos.map((p) => {
  const s: Subtarea = { id: f.nuevoId(), texto: p.texto.trim(), hecha: false };
  if (p.pasos && p.pasos.length) s.subtareas = aSubtareas(p.pasos, f);
  return s;
});

/** El título del paso grande de cada semana de un plan: "Semana 1 · Saber dónde estoy". */
export const tituloSemana = (n: number, s: SemanaPlan): string => `Semana ${n} · ${s.titulo}`;

/** La tarea nueva de una tarea lista o de un plan (cada semana es un paso grande). Los pasos llegan sin día. */
export function construirTarea(item: TareaBiblioteca | PlanBiblioteca, f: Fabrica): Tarea {
  const pasos: PasoBiblioteca[] = item.tipo === 'tarea'
    ? item.pasos
    : item.semanas.map((s, i) => ({ texto: tituloSemana(i + 1, s), pasos: s.pasos.map((texto) => ({ texto })) }));
  const icono = item.tipo === 'tarea' ? item.icono : (item.iconoTarea ?? 'ListChecks');
  return { id: f.nuevoId(), nombre: item.nombre, icono, color: '', subtareas: aSubtareas(pasos, f), completada: false, creadoEn: f.ahora, origen: item.id };
}

export interface Agregado { habitos: Habito[]; tarea: Tarea | null }

/** Todo lo que crea "Agregar" / "Empezar este plan". En una tarea, `claves` no se usa. */
export function construirAgregado(item: ItemBiblioteca, claves: string[], actuales: Habito[], f: Fabrica): Agregado {
  return {
    habitos: item.tipo === 'tarea' ? [] : construirHabitos(item, claves, actuales, f),
    tarea: item.tipo === 'pack' ? null : construirTarea(item, f),
  };
}

/** Las claves marcadas al abrir: todas (el aviso no desmarca nada; lo decidió Johnatan). */
export const clavesIniciales = (item: ItemBiblioteca): string[] => (item.tipo === 'tarea' ? [] : item.habitos.map((h) => h.clave));

/** Revisa el catálogo: ids y claves sin repetir, íconos que existen, textos que caben. Devuelve los problemas. */
export function revisarCatalogo(items: ItemBiblioteca[], iconosHabito: string[], iconosTarea: string[]): string[] {
  const p: string[] = [];
  const ids = new Set<string>();
  for (const it of items) {
    if (ids.has(it.id)) p.push(`id repetido: ${it.id}`);
    ids.add(it.id);
    if (!it.nombre.trim()) p.push(`${it.id}: sin nombre`);
    const iconoTarea = it.tipo === 'tarea' ? it.icono : it.tipo === 'plan' ? (it.iconoTarea ?? 'ListChecks') : null;
    if (iconoTarea && !iconosTarea.includes(iconoTarea)) p.push(`${it.id}: el ícono ${iconoTarea} no es de tarea`);
    if (it.tipo !== 'tarea') {
      if (it.habitos.length > LIMITE_HABITOS) p.push(`${it.id}: más de ${LIMITE_HABITOS} hábitos`);
      if (it.tipo === 'pack' && it.habitos.length === 0) p.push(`${it.id}: pack sin hábitos`);
      const claves = new Set<string>();
      for (const h of it.habitos) {
        if (claves.has(h.clave)) p.push(`${it.id}: clave repetida ${h.clave}`);
        claves.add(h.clave);
        if (!iconosHabito.includes(h.icono)) p.push(`${it.id}/${h.clave}: el ícono ${h.icono} no existe`);
        if (!h.minimo.trim()) p.push(`${it.id}/${h.clave}: sin mínimo`);
        else if (h.minimo.trim() !== limpiarMinimo(h.minimo)) p.push(`${it.id}/${h.clave}: el mínimo no cabe en 60 letras`);
        if (/^después de/i.test(h.anclaje.trim())) p.push(`${it.id}/${h.clave}: el anclaje no lleva "Después de"`);
        if (h.frecuencia === 'personalizado' && !h.diasPersonalizados?.length) p.push(`${it.id}/${h.clave}: faltan los días`);
      }
    }
    if (it.tipo === 'tarea' && contarPasos(it.pasos) === 0) p.push(`${it.id}: tarea sin pasos`);
    if (it.tipo === 'plan') {
      if (it.semanas.length !== 4) p.push(`${it.id}: un plan tiene 4 semanas`);
      if (it.semanas.some((s) => s.pasos.length === 0 || !s.porque.trim() || !s.titulo.trim())) p.push(`${it.id}: una semana está incompleta`);
    }
  }
  return p;
}
