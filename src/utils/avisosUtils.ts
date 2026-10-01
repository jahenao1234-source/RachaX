// Avisos (recordatorios push): design/maqueta-avisos.html, DESIGN.md › "Avisos".
// Cálculos puros: los usa la app y también la función de Supabase que los envía (supabase/functions/enviar-avisos).
// Por eso nada aquí mira el reloj del aparato: "hoy" y la hora llegan siempre por parámetro.
import { Compromiso, Habito, Registro } from '../types';
import { pendientesParaDificil, tieneMinimo } from './dificilUtils';
import { aplicaEn, estaHecho, textoHora } from './compromisosUtils';
import { subtractDays } from './habitUtils';

export type MomentoAviso = 'manana' | 'tarde' | 'noche';
export type HoraAviso = MomentoAviso | 'minima';
export type TipoAviso = HoraAviso | 'regreso2' | 'regreso7' | 'compromiso' | 'pomodoro' | 'descanso';
export type DestinoAviso = 'hoy' | 'dificil' | 'compromisos' | 'foco';

/** Lo que la persona eligió en Perfil › Avisos. Es de la cuenta: vale en todos sus celulares. */
export interface ConfigAvisos {
  activo: boolean;
  manana: boolean; tarde: boolean; noche: boolean; minima: boolean;
  /** 'HH:MM' en 24 h */
  hManana: string; hTarde: string; hNoche: string; hMinima: string;
  regreso: boolean;
  compromisos: boolean;
  pomodoro: boolean;
  /** Mostrar los nombres de los hábitos y compromisos en el aviso */
  nombres: boolean;
}

export const CONFIG_AVISOS: ConfigAvisos = {
  activo: false,
  manana: true, tarde: true, noche: true, minima: true,
  hManana: '07:00', hTarde: '13:00', hNoche: '19:00', hMinima: '20:00',
  regreso: true, compromisos: true, pomodoro: true, nombres: true,
};

export const MINUTOS_ANTES_COMPROMISO = 30;
export const DIAS_COMPROMISOS = 14;
export const MAX_NOMBRES = 3;

export interface TextoAviso { titulo: string; cuerpo: string; destino: DestinoAviso }

const NOMBRE_MOMENTO: Record<MomentoAviso, string> = { manana: 'mañana', tarde: 'tarde', noche: 'noche' };
const CLAVE_ON: Record<HoraAviso, 'manana' | 'tarde' | 'noche' | 'minima'> = { manana: 'manana', tarde: 'tarde', noche: 'noche', minima: 'minima' };
const CLAVE_HORA: Record<HoraAviso, 'hManana' | 'hTarde' | 'hNoche' | 'hMinima'> = { manana: 'hManana', tarde: 'hTarde', noche: 'hNoche', minima: 'hMinima' };

export const horaDe = (c: ConfigAvisos, t: HoraAviso): string => c[CLAVE_HORA[t]];
export const prendido = (c: ConfigAvisos, t: HoraAviso): boolean => c.activo && c[CLAVE_ON[t]];
export const conHora = (c: ConfigAvisos, t: HoraAviso, hora: string): ConfigAvisos => ({ ...c, [CLAVE_HORA[t]]: hora });
export const conInterruptor = (c: ConfigAvisos, t: HoraAviso, on: boolean): ConfigAvisos => ({ ...c, [CLAVE_ON[t]]: on });

/** Lo que llega de la nube o de localStorage, saneado (lo que falte o venga mal queda con el valor de siempre). */
export const sanearConfig = (v: unknown): ConfigAvisos => {
  const x = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const b = (k: keyof ConfigAvisos) => (typeof x[k] === 'boolean' ? (x[k] as boolean) : (CONFIG_AVISOS[k] as boolean));
  const h = (k: 'hManana' | 'hTarde' | 'hNoche' | 'hMinima') => (typeof x[k] === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(x[k] as string) ? (x[k] as string) : CONFIG_AVISOS[k]);
  return {
    activo: b('activo'), manana: b('manana'), tarde: b('tarde'), noche: b('noche'), minima: b('minima'),
    hManana: h('hManana'), hTarde: h('hTarde'), hNoche: h('hNoche'), hMinima: h('hMinima'),
    regreso: b('regreso'), compromisos: b('compromisos'), pomodoro: b('pomodoro'), nombres: b('nombres'),
  };
};

const minutos = (hora: string): number => { const [h, m] = hora.split(':').map((n) => parseInt(n, 10)); return h * 60 + (m || 0); };

// ---------- Las horas que se pueden elegir ----------
const RANGO: Record<MomentoAviso, [string, string]> = { manana: ['04:00', '11:55'], tarde: ['12:00', '17:55'], noche: ['18:00', '22:55'] };
const ULTIMA_MINIMA = '23:30';

/** '' si la hora sirve; si no, el texto que explica por qué (y "Guardar" se apaga). */
export const errorDeHora = (t: HoraAviso, hora: string, c: ConfigAvisos): string => {
  const m = minutos(hora);
  if (t === 'minima') {
    if (m <= minutos(c.hNoche)) return `Tiene que ser después del aviso de la noche (${textoHora(c.hNoche)}).`;
    if (m > minutos(ULTIMA_MINIMA)) return `Tiene que ser antes de las ${textoHora(ULTIMA_MINIMA)}`;
    return '';
  }
  const [a, b] = RANGO[t];
  if (m < minutos(a) || m > minutos(b)) return `La ${NOMBRE_MOMENTO[t]} va de ${textoHora(a)} a ${textoHora(b)}`;
  if (t === 'noche' && m >= minutos(c.hMinima)) return `Tiene que ser antes del aviso de la versión mínima (${textoHora(c.hMinima)}).`;
  return '';
};

export const tituloHojaHora = (t: HoraAviso): string => (t === 'minima' ? 'Aviso de la versión mínima' : `Aviso de la ${NOMBRE_MOMENTO[t]}`);
export const preguntaHojaHora = (t: HoraAviso): string => (t === 'minima' ? '¿A qué hora te proponemos lo mínimo?' : `¿A qué hora empiezas tu ${NOMBRE_MOMENTO[t]}?`);
export const textoVolverHora = (t: HoraAviso): string => `Volver a las ${textoHora(horaDe(CONFIG_AVISOS, t))}`;

// ---------- Qué falta ----------
/** Hábitos activos (a hacer) de ese momento. Los de "Todo el día" (flexible) no tienen momento: solo entran en el de las 8. */
export const habitosDeMomento = (habitos: Habito[], m: MomentoAviso): Habito[] =>
  habitos.filter((h) => !h.archivado && h.tipo !== 'negativo' && h.momento === m);

/** Los momentos que tienen algún hábito (la hoja y la pantalla solo ofrecen esos). */
export const momentosConHabitos = (habitos: Habito[]): MomentoAviso[] =>
  (['manana', 'tarde', 'noche'] as MomentoAviso[]).filter((m) => habitosDeMomento(habitos, m).length > 0);

export const faltanDeMomento = (habitos: Habito[], registros: Registro[], hoy: string, m: MomentoAviso): Habito[] =>
  pendientesParaDificil(habitos, registros, hoy).filter((h) => h.momento === m);

/** Todo lo que falta hoy, de cualquier momento (también "Todo el día"). */
export const faltanHoy = (habitos: Habito[], registros: Registro[], hoy: string): Habito[] =>
  pendientesParaDificil(habitos, registros, hoy);

// ---------- Los textos ----------
/** "A", "A y B", "A, B y C", "A, B y 3 más" */
export const listaNombres = (nombres: string[], max = MAX_NOMBRES): string => {
  const n = nombres.map((x) => x.trim()).filter(Boolean);
  if (n.length === 0) return '';
  if (n.length === 1) return n[0];
  if (n.length <= max) return `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
  return `${n.slice(0, max - 1).join(', ')} y ${n.length - (max - 1)} más`;
};

const anclajeLegible = (a?: string): string => {
  const t = (a || '').trim().replace(/^despu[eé]s de\s+/i, '');
  return t;
};

/** El aviso de un momento del día. null = no falta nada, no se manda. */
export const textoMomento = (m: MomentoAviso, faltan: Habito[], nombres: boolean): TextoAviso | null => {
  if (faltan.length === 0) return null;
  const tu = `Tu ${NOMBRE_MOMENTO[m]}`;
  if (!nombres) {
    return { titulo: faltan.length === 1 ? `${tu}: 1 hábito por marcar` : `${tu}: ${faltan.length} hábitos por marcar`, cuerpo: 'Toca para abrir Racha.', destino: 'hoy' };
  }
  if (faltan.length === 1) {
    const h = faltan[0];
    const a = anclajeLegible(h.anclaje);
    return { titulo: a ? `Después de ${a}: ${h.nombre}` : `${tu}: ${h.nombre}`, cuerpo: 'Toca para abrir Racha y marcarlo.', destino: 'hoy' };
  }
  return { titulo: `${tu}: ${faltan.length} hábitos`, cuerpo: `${listaNombres(faltan.map((h) => h.nombre))}. Empieza por uno.`, destino: 'hoy' };
};

/** El aviso de las 8:00 p. m. null = no falta nada. */
export const textoMinima = (faltan: Habito[], nombres: boolean): TextoAviso | null => {
  if (faltan.length === 0) return null;
  const quedan = faltan.length === 1 ? 'Queda 1' : `Quedan ${faltan.length}`;
  const conMin = faltan.find((h) => tieneMinimo(h));
  if (conMin) {
    return {
      titulo: 'Hoy basta con lo mínimo',
      cuerpo: nombres ? `${quedan}. ${conMin.nombre}, mínimo: “${(conMin.minimo || '').trim()}”. Cuenta como cumplido.` : `${quedan}. Toca para ver su versión mínima.`,
      destino: 'dificil',
    };
  }
  return {
    titulo: `${quedan} por hoy`,
    cuerpo: nombres ? `${listaNombres(faltan.map((h) => h.nombre))}. ${faltan.length === 1 ? 'Todavía cuenta.' : 'Con uno ya sumas.'}` : 'Toca para abrir Racha.',
    destino: 'hoy',
  };
};

export const textoRegreso = (dias: 2 | 7): TextoAviso => (dias === 2
  ? { titulo: 'Aquí sigue todo lo que llevas', cuerpo: 'Unos días sin cumplir no borran los demás. Hoy cada hábito vale el doble.', destino: 'hoy' }
  : { titulo: '¿Retomamos?', cuerpo: 'Empieza con un solo hábito. Lo demás puede esperar.', destino: 'hoy' });

export const textoCompromiso = (titulo: string, hora: string, nombres: boolean): TextoAviso => ({
  titulo: nombres ? `En ${MINUTOS_ANTES_COMPROMISO} min: ${titulo}` : `Tienes un compromiso en ${MINUTOS_ANTES_COMPROMISO} min`,
  cuerpo: `Hoy a las ${textoHora(hora)}`,
  destino: 'compromisos',
});

export const textoPomodoro = (min: number, descanso: number, paso: string | undefined, nombres: boolean): TextoAviso => ({
  titulo: 'Terminó tu pomodoro',
  cuerpo: nombres && paso ? `${min} min en “${paso}”. Te toca un descanso de ${descanso}.` : `${min} min. Te toca un descanso de ${descanso}.`,
  destino: 'foco',
});

export const textoDescanso = (paso: string | undefined, nombres: boolean): TextoAviso => ({
  titulo: 'Terminó el descanso',
  cuerpo: nombres && paso ? `¿Otro pomodoro en “${paso}”?` : '¿Otro pomodoro?',
  destino: 'foco',
});

// ---------- Qué se manda (lo usa la función de Supabase) ----------
/** Días completos sin abrir la app: 0 si entró hoy. */
export const diasSinEntrar = (ultimaVez: string, hoy: string): number => {
  const a = Date.parse(ultimaVez + 'T12:00:00Z'); const b = Date.parse(hoy + 'T12:00:00Z');
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
};

export interface DatosParaAviso {
  habitos: Habito[];
  registros: Registro[];
  config: ConfigAvisos;
  hoy: string;
  /** Día ('YYYY-MM-DD') de la última vez que abrió la app */
  ultimaVez: string;
}

/**
 * El aviso de hábitos que toca a esta hora, o null si no se manda nada.
 * Desde el día 2 sin entrar, los de hábitos se callan: solo llegan los de regreso (día 2 y día 7), a la hora de la mañana.
 */
export const avisoDeHabitos = (t: HoraAviso, d: DatosParaAviso): (TextoAviso & { tipo: TipoAviso }) | null => {
  if (!d.config.activo) return null;
  const dias = diasSinEntrar(d.ultimaVez, d.hoy);
  if (dias >= 2) {
    if (t !== 'manana' || !d.config.regreso) return null;
    if (dias === 2) return { ...textoRegreso(2), tipo: 'regreso2' };
    if (dias === 7) return { ...textoRegreso(7), tipo: 'regreso7' };
    return null;
  }
  if (!prendido(d.config, t)) return null;
  const activos = d.habitos.filter((h) => !h.archivado);
  if (t === 'minima') {
    const x = textoMinima(faltanHoy(activos, d.registros, d.hoy), d.config.nombres);
    return x ? { ...x, tipo: 'minima' } : null;
  }
  const x = textoMomento(t, faltanDeMomento(activos, d.registros, d.hoy, t), d.config.nombres);
  return x ? { ...x, tipo: t } : null;
};

// ---------- Compromisos: la cola que arma la app ----------
export interface AvisoProgramado {
  /** única por aviso: id del compromiso + día + hora */
  clave: string;
  /** hora local 'YYYY-MM-DDTHH:MM' en que se manda */
  enviarEn: string;
  titulo: string;
  cuerpo: string;
  destino: DestinoAviso;
}

const dosDigitos = (n: number) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' + 'HH:MM' − minutos → 'YYYY-MM-DDTHH:MM' (puede caer en el día anterior). */
export const restarMinutos = (fecha: string, hora: string, min: number): string => {
  let m = minutos(hora) - min;
  let f = fecha;
  while (m < 0) { m += 1440; f = subtractDays(f, 1); }
  return `${f}T${dosDigitos(Math.floor(m / 60))}:${dosDigitos(m % 60)}`;
};

const sumarDias = (fecha: string, n: number) => subtractDays(fecha, -n);

/**
 * Los avisos de compromisos de los próximos días: solo los que tienen hora, no están hechos
 * y cuyo aviso todavía no pasó (ahora = 'YYYY-MM-DDTHH:MM' local).
 */
export const avisosDeCompromisos = (lista: Compromiso[], ahora: string, c: ConfigAvisos, dias = DIAS_COMPROMISOS): AvisoProgramado[] => {
  if (!c.activo || !c.compromisos) return [];
  const hoy = ahora.slice(0, 10);
  const out: AvisoProgramado[] = [];
  for (let i = 0; i < dias; i++) {
    const fecha = sumarDias(hoy, i);
    for (const x of lista) {
      if (!x.hora || !aplicaEn(x, fecha) || estaHecho(x, fecha)) continue;
      const enviarEn = restarMinutos(fecha, x.hora, MINUTOS_ANTES_COMPROMISO);
      if (enviarEn <= ahora) continue;
      const t = textoCompromiso(x.titulo, x.hora, c.nombres);
      out.push({ clave: `${x.id}:${fecha}:${x.hora}`, enviarEn, titulo: t.titulo, cuerpo: t.cuerpo, destino: t.destino });
    }
  }
  return out.sort((a, b) => (a.enviarEn < b.enviarEn ? -1 : a.enviarEn > b.enviarEn ? 1 : 0));
};

// ---------- Lo que dice la app ----------
/** "hoy a las 7:00 p. m." / "mañana a las 7:00 a. m." / '' si no hay ninguno prendido con hábitos. */
export const proximoAviso = (c: ConfigAvisos, habitos: Habito[], horaAhora: string): string => {
  const con = momentosConHabitos(habitos);
  const tipos: HoraAviso[] = [...con, 'minima'];
  const horas = tipos.filter((t) => c[CLAVE_ON[t]]).map((t) => horaDe(c, t)).sort();
  if (horas.length === 0) return '';
  const sig = horas.find((h) => minutos(h) > minutos(horaAhora));
  // "a la 1:00", "a las 7:00"
  const aLas = (h: string) => `${parseInt(h.split(':')[0], 10) % 12 === 1 ? 'a la' : 'a las'} ${textoHora(h)}`;
  return sig ? `hoy ${aLas(sig)}` : `mañana ${aLas(horas[0])}`;
};

export type PermisoAvisos = 'si' | 'no' | 'bloqueado' | 'sin-soporte' | 'falta-instalar';

/** El renglón de la fila de Perfil. */
export const subtituloPerfilAvisos = (permiso: PermisoAvisos, c: ConfigAvisos): string => {
  if (permiso === 'falta-instalar') return 'Para activarlos, instala Racha';
  if (permiso === 'bloqueado') return 'Bloqueados en el celular';
  if (permiso === 'si' && c.activo) return 'Activados · 4 al día como máximo';
  return 'Apagados';
};

/** ¿Se ve la fila de Perfil y se ofrece la hoja? En un navegador sin avisos (y que no es iPhone por instalar), no. */
export const hayAvisos = (permiso: PermisoAvisos): boolean => permiso !== 'sin-soporte';

export type EstadoPregunta = '' | 'ahora_no' | 'si' | 'cerrado';

/** La hoja "¿Te avisamos cuando toque?": una vez, al marcar el primer hábito, si nunca ha respondido. */
export const debePreguntar = (permiso: PermisoAvisos, pregunta: EstadoPregunta, c: ConfigAvisos, marcoAlgoHoy: boolean): boolean =>
  marcoAlgoHoy && pregunta === '' && !c.activo && (permiso === 'no' || permiso === 'falta-instalar');

/** El recordatorio de Hoy: una vez, 3 días o más después de "Ahora no". No sale con "Volviste" ni "Ayer quedó sin marcar". */
export const debeRecordarAvisos = (permiso: PermisoAvisos, pregunta: EstadoPregunta, fecha: string, hoy: string, c: ConfigAvisos, hayOtroAviso: boolean): boolean =>
  pregunta === 'ahora_no' && !c.activo && !hayOtroAviso && !!fecha && (permiso === 'no' || permiso === 'falta-instalar') && diasSinEntrar(fecha, hoy) >= 3;
