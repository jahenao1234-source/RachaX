import { supabase } from '../lib/supabase';

// ---------- Panel de pagos: datos (design/maqueta-panel-pagos.html, DESIGN.md › Panel de pagos) ----------
// Todo pasa por funciones de Supabase que revisan es_admin() (supabase/schema-6-panel.sql).
// Los textos de lectura_ia, nombres y referencias vienen de quien manda la foto: se muestran como texto, nunca como HTML.

export const PRECIO = 37900;
export type EstadoPago = 'por_verificar' | 'revisar' | 'verificado' | 'bloqueado';
export type FormaPago = 'transferencia' | 'efectivo' | 'regalo';

export interface LecturaIA {
  es_comprobante?: boolean;
  valor?: number | null;
  fecha?: string | null;
  hora?: string | null;
  referencia?: string | null;
  destinatario?: string | null;
  pagador?: string | null;
  banco?: string | null;
}

export interface Compra {
  email: string;
  activo: boolean;
  estado_pago: EstadoPago;
  origen: 'whatsapp' | 'manual' | string;
  forma_pago: FormaPago;
  telefono: string | null;
  nombre_pagador: string | null;
  valor: number | null;
  referencia: string | null;
  fecha_pago: string | null;
  comprobante_path: string | null;
  lectura_ia: LecturaIA | null;
  fallas: string | null;
  notas: string | null;
  registrado_en: string;
  actualizado_en: string | null;
  otro_comprobante_en: string | null;
  referencia_repetida: string | null;
}

export interface Resumen {
  ahora: string;
  desde: string | null;
  ultimo_cierre: { hasta: string; recibido: number; esperado: number; compras: number } | null;
  compras: number;
  esperado: number;
  por_revisar: number;
  conteos: { revisar: number; por_verificar: number; verificado: number; bloqueado: number; todas: number };
}

export interface Cierre { id: number; creado_en: string; desde: string; hasta: string; recibido: number; esperado: number; compras: number; notas: string | null }

/** Error de las funciones: 'no_autorizado', 'cambio', 'rango', 'no_existe', 'red'… */
export class ErrorPanel extends Error {
  constructor(public codigo: string) { super(codigo); }
}
const codigoDe = (e: { message?: string; code?: string } | null) => {
  if (!e) return 'red';
  if (e.code === '42501' || /no_autorizado/.test(e.message || '')) return 'no_autorizado';
  const m = /(cambio|rango|no_existe|estado_invalido|correo_invalido|forma_invalida|recibido_invalido)/.exec(e.message || '');
  return m ? m[1] : /fetch|network/i.test(e.message || '') ? 'red' : 'error';
};
async function rpc<T>(nombre: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(nombre, args);
  if (error) throw new ErrorPanel(codigoDe(error));
  return data as T;
}

export const esAdmin = () => rpc<boolean>('es_admin');
export const cargarResumen = () => rpc<Resumen>('panel_resumen');
/** estado null = todas. De a 50, las más nuevas primero (las de "mandó otro comprobante" arriba). */
export const cargarCompras = (estado: EstadoPago | null, buscar = '', saltar = 0) =>
  rpc<Compra[]>('panel_compras', { p_estado: estado, p_buscar: buscar || null, p_limite: 50, p_saltar: saltar });
/** Devuelve el estado que tenía (para Deshacer). */
export const marcar = (email: string, estado: EstadoPago) => rpc<EstadoPago>('panel_marcar', { p_email: email, p_estado: estado });
export const guardarNota = (email: string, nota: string) => rpc<void>('panel_nota', { p_email: email, p_nota: nota });
export const agregarComprador = (email: string, valor: number, forma: FormaPago, nota: string) =>
  rpc<{ ok: boolean; error?: 'ya_existe'; estado?: EstadoPago }>('panel_agregar', { p_email: email, p_valor: valor, p_forma: forma, p_nota: nota || null });
/** hasta y comprasVistas salen del resumen que vio el dueño. Si llegó otra compra en el camino, falla con 'cambio'. */
export const guardarCierre = (hasta: string, recibido: number, comprasVistas: number, notas = '') =>
  rpc<{ id: number; cuadra: boolean; compras: number; esperado: number; marcadas: number }>('guardar_cierre', { p_hasta: hasta, p_recibido: recibido, p_compras_vistas: comprasVistas, p_notas: notas || null });
export const cargarCierres = () => rpc<Cierre[]>('panel_cierres', { p_limite: 20 });

/** Enlace a la foto del comprobante que vence en 2 minutos. Nunca se guarda. null si no se pudo. */
export async function urlFoto(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('comprobantes').createSignedUrl(path, 120);
  return error ? null : data?.signedUrl ?? null;
}
export const esPdf = (path: string | null) => !!path && /\.pdf$/i.test(path);

// ---------- Textos ----------

/** "$37.900" (sin espacio, con punto de miles). */
export const plata = (n: number) => '$' + Math.round(n).toLocaleString('es-CO').replace(/,/g, '.');

/** Lo que escribe el dueño: "265.300", "$ 265300", "265 300". null si no es un número entero válido (p. ej. con coma decimal). */
export function leerPlata(texto: string): number | null {
  const t = texto.trim().replace(/^\$/, '').replace(/[\s.]/g, '');
  if (!t || !/^\d+$/.test(t)) return null;
  const n = parseInt(t, 10);
  return n <= 100_000_000 ? n : null;
}

const ZONA = 'America/Bogota';
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Partes de una fecha en hora de Colombia. */
function enBogota(d: Date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: ZONA, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false }).formatToParts(d).map((x) => [x.type, x.value]));
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { y: +p.year, m: +p.month - 1, d: +p.day, h: +p.hour % 24, min: +p.minute, dia };
}
const clave = (x: { y: number; m: number; d: number }) => Date.UTC(x.y, x.m, x.d) / 86400000;
const hora12 = (h: number, min: number) => `${h % 12 === 0 ? 12 : h % 12}:${String(min).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;

/** "hoy, 10:14 a. m.", "ayer, 9:55 p. m.", "dom 21 sep, 6:02 p. m." (y el año si no es el de ahora). En hora de Colombia. */
export function fechaCorta(iso: string | null, ahora: Date = new Date()): string {
  if (!iso) return '—';
  const f = enBogota(new Date(iso)), a = enBogota(ahora);
  const dif = clave(a) - clave(f);
  const h = hora12(f.h, f.min);
  if (dif === 0) return `hoy, ${h}`;
  if (dif === 1) return `ayer, ${h}`;
  return `${DIAS[f.dia]} ${f.d} ${MESES[f.m]}${f.y !== a.y ? ` ${f.y}` : ''}, ${h}`;
}
/** "sábado 26 de septiembre, 8:40 p. m." */
export function fechaLarga(iso: string): string {
  const f = enBogota(new Date(iso));
  return `${DIAS_LARGOS[f.dia]} ${f.d} de ${MESES_LARGOS[f.m]}, ${hora12(f.h, f.min)}`;
}
/** "sáb 26 sep, 8:40 p. m." (para la pregunta del cuadre). */
export function fechaMedia(iso: string): string {
  const f = enBogota(new Date(iso));
  return `${DIAS[f.dia]} ${f.d} ${MESES[f.m]}, ${hora12(f.h, f.min)}`;
}

/**
 * Lo que no cuadra, en palabras del dueño (se arma con lo que leyó la IA, no con el texto técnico de "fallas").
 * Las compras hechas a mano no tienen problemas.
 */
export function problemas(c: Pick<Compra, 'origen' | 'comprobante_path' | 'lectura_ia' | 'fallas' | 'registrado_en' | 'referencia_repetida'>): string[] {
  if (c.origen === 'manual') return [];
  const fallas = c.fallas || '';
  const out: string[] = [];
  if (/No mandó foto/.test(fallas)) out.push('No mandó foto');
  else if (!c.comprobante_path || /No se pudo guardar la foto/.test(fallas)) out.push('No se pudo guardar la foto');
  else if (!c.lectura_ia) out.push('La IA no pudo leer la foto');
  const l = c.lectura_ia;
  if (l) {
    if (l.es_comprobante === false) out.push('La foto no parece un comprobante');
    if (l.valor != null && l.valor !== PRECIO) out.push(`Pagó ${plata(l.valor)}, no ${plata(PRECIO)}`);
    else if (l.valor == null && l.es_comprobante !== false) out.push('No se ve el valor');
    if (l.fecha) {
      const [y, m, d] = l.fecha.split('-').map(Number);
      const r = enBogota(new Date(c.registrado_en));
      const dias = clave(r) - Date.UTC(y, m - 1, d) / 86400000;
      if (dias > 1) out.push(`El comprobante es del ${DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d} ${MESES[m - 1]} (hace ${dias} días)`);
      else if (dias < 0) out.push(`El comprobante tiene una fecha que no ha llegado (${d} ${MESES[m - 1]})`);
    } else if (l.es_comprobante !== false) out.push('No se ve la fecha');
    if (/destinatario/i.test(fallas)) out.push(`La plata le llegó a «${l.destinatario || 'otra persona'}», no a ti`);
  }
  if (c.referencia_repetida) out.push(`Esta referencia ya está en ${c.referencia_repetida}`);
  return out;
}

/** Número de WhatsApp para wa.me: solo dígitos; si es un celular de Colombia sin indicativo, se le pone 57. */
export function linkWhatsApp(telefono: string | null): string | null {
  const d = (telefono || '').replace(/\D/g, '');
  if (d.length < 10) return null;
  return `https://wa.me/${d.length === 10 && d.startsWith('3') ? '57' + d : d}`;
}
