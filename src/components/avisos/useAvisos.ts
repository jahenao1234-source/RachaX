// Avisos (recordatorios push): lo que toca el navegador y la nube. design/maqueta-avisos.html, DESIGN.md › "Avisos".
// Los cálculos y los textos están en src/utils/avisosUtils.ts. El que recibe los avisos es public/sw.js.
import { useSyncExternalStore } from 'react';
import { supabase, supabaseListo } from '../../lib/supabase';
import { Compromiso } from '../../types';
import { getTodayString } from '../../utils/habitUtils';
import { esIOS } from '../../utils/instalarUtils';
import {
  CONFIG_AVISOS, ConfigAvisos, EstadoPregunta, HoraAviso, PermisoAvisos, TextoAviso,
  avisosDeCompromisos, conHora, conInterruptor, sanearConfig,
} from '../../utils/avisosUtils';

const CLAVE_CONFIG = 'racha_avisos_config';
const CLAVE_SUB = 'racha_avisos_sub';
const CLAVE_LATIDO = 'racha_avisos_latido';
const CLAVE_PREGUNTA = 'racha_avisos_pregunta';
const CLAVE_PREGUNTA_FECHA = 'racha_avisos_pregunta_fecha';
/** Lo que ya respondió este celular: no se borra al salir de la cuenta. */
export const CLAVES_AVISOS_CELULAR = [CLAVE_PREGUNTA, CLAVE_PREGUNTA_FECHA];

const VAPID_PUBLICA = (((import.meta as any).env.VITE_VAPID_PUBLICA as string) || '').trim();

const leer = (k: string): string => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const escribir = (k: string, v: string) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch {} };

export type HojaAvisos = '' | 'pedir' | 'listo' | 'bloqueado' | 'instalar';

export interface FotoAvisos {
  permiso: PermisoAvisos;
  config: ConfigAvisos;
  pregunta: EstadoPregunta;
  fechaPregunta: string;
  /** La hoja abierta ('' = ninguna) */
  hoja: HojaAvisos;
  /** La pantalla Avisos de Perfil está abierta */
  pantalla: boolean;
}

const enStandalone = (): boolean => {
  try { return window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true; } catch { return false; }
};

const soporta = (): boolean =>
  supabaseListo && !!VAPID_PUBLICA && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const calcularPermiso = (): PermisoAvisos => {
  if (!soporta()) {
    // En iPhone los avisos solo existen con la app instalada en la pantalla de inicio
    const ios = esIOS(navigator.userAgent, navigator.maxTouchPoints || 0);
    return supabaseListo && !!VAPID_PUBLICA && ios && !enStandalone() ? 'falta-instalar' : 'sin-soporte';
  }
  if (Notification.permission === 'denied') return 'bloqueado';
  return Notification.permission === 'granted' && !!leer(CLAVE_SUB) ? 'si' : 'no';
};

const leerConfig = (): ConfigAvisos => { try { return sanearConfig(JSON.parse(leer(CLAVE_CONFIG) || 'null')); } catch { return CONFIG_AVISOS; } };
const leerPregunta = (): EstadoPregunta => { const v = leer(CLAVE_PREGUNTA); return v === 'ahora_no' || v === 'si' || v === 'cerrado' ? v : ''; };

let hoja: HojaAvisos = '';
let pantalla = false;
let config: ConfigAvisos = leerConfig();

const tomarFoto = (): FotoAvisos => ({
  permiso: calcularPermiso(), config, pregunta: leerPregunta(), fechaPregunta: leer(CLAVE_PREGUNTA_FECHA), hoja, pantalla,
});
let foto: FotoAvisos = tomarFoto();
const oyentes = new Set<() => void>();
const avisar = () => { foto = tomarFoto(); oyentes.forEach((f) => f()); };
const suscribirOyente = (f: () => void) => { oyentes.add(f); return () => { oyentes.delete(f); }; };

const zona = (): string => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota'; } catch { return 'America/Bogota'; } };
const dos = (n: number) => String(n).padStart(2, '0');
/** 'YYYY-MM-DDTHH:MM' en la hora de este celular */
export const ahoraLocal = (d = new Date()): string => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
export const horaLocal = (d = new Date()): string => `${dos(d.getHours())}:${dos(d.getMinutes())}`;

const encendidos = (): boolean => calcularPermiso() === 'si' && config.activo;

// ---------- La configuración (es de la cuenta) ----------
const guardarConfig = (c: ConfigAvisos) => {
  config = c;
  escribir(CLAVE_CONFIG, JSON.stringify(c));
  avisar();
  if (supabaseListo) void supabase.rpc('guardar_avisos_config', { p_config: c, p_tz: zona() }).then(() => {}, () => {});
};

export const cambiarHoraAviso = (t: HoraAviso, hora: string) => guardarConfig(conHora(config, t, hora));
export const cambiarInterruptorAviso = (t: HoraAviso, on: boolean) => guardarConfig(conInterruptor(config, t, on));
export const cambiarOtroAviso = (k: 'regreso' | 'compromisos' | 'pomodoro' | 'nombres', on: boolean) => {
  guardarConfig({ ...config, [k]: on });
  if (k === 'compromisos' && !on) void programar('compromiso', []);
  if (k === 'pomodoro' && !on) cancelarPomodoro();
};

// ---------- La suscripción de este celular ----------
const aBytes = (t: string): Uint8Array => {
  const s = atob(t.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(t.length / 4) * 4, '='));
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
};

const registro = async (): Promise<ServiceWorkerRegistration | null> => {
  try {
    const listo = navigator.serviceWorker.ready;
    const espera = new Promise<null>((r) => setTimeout(() => r(null), 8000));
    return (await Promise.race([listo, espera])) as ServiceWorkerRegistration | null;
  } catch { return null; }
};

const plataforma = (): string => {
  const ua = navigator.userAgent;
  return (esIOS(ua, navigator.maxTouchPoints || 0) ? 'ios' : /Android/.test(ua) ? 'android' : 'computador') + (enStandalone() ? '-instalada' : '');
};

const suscribirCelular = async (): Promise<boolean> => {
  const reg = await registro();
  if (!reg) return false;
  try {
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const opciones = { userVisibleOnly: true, applicationServerKey: aBytes(VAPID_PUBLICA) };
      try { sub = await reg.pushManager.subscribe(opciones); }
      catch {
        // Quedó una suscripción vieja con otra clave: se quita y se intenta otra vez
        const vieja = await reg.pushManager.getSubscription();
        if (vieja) await vieja.unsubscribe();
        sub = await reg.pushManager.subscribe(opciones);
      }
    }
    const j = sub.toJSON();
    if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return false;
    const { error } = await supabase.rpc('guardar_suscripcion', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_plataforma: plataforma() });
    if (error) return false;
    escribir(CLAVE_SUB, j.endpoint);
    return true;
  } catch { return false; }
};

/** Deja de mandar avisos a ESTE celular (al apagarlos aquí y al salir de la cuenta). */
export const quitarEsteCelular = async (): Promise<void> => {
  try {
    const guardado = leer(CLAVE_SUB);
    escribir(CLAVE_SUB, '');
    let endpoint = guardado;
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) { endpoint = sub.endpoint; await sub.unsubscribe(); }
    }
    if (endpoint && supabaseListo) await supabase.rpc('quitar_suscripcion', { p_endpoint: endpoint });
  } catch {}
  avisar();
};

export type ResultadoActivar = 'si' | 'bloqueado' | 'no' | 'error';

/**
 * "Sí, avísame" o prender el interruptor principal. OJO: debe llamarse directo en el toque;
 * lo primero que hace es pedir el permiso (el iPhone lo rechaza si antes hay una espera).
 */
export const activarAvisos = async (): Promise<ResultadoActivar> => {
  if (!soporta()) return 'error';
  let p: NotificationPermission;
  try { p = await Notification.requestPermission(); } catch { return 'error'; }
  if (p === 'denied') { escribir(CLAVE_PREGUNTA, 'cerrado'); avisar(); return 'bloqueado'; }
  if (p !== 'granted') { avisar(); return 'no'; }
  const ok = await suscribirCelular();
  if (!ok) { avisar(); return 'error'; }
  escribir(CLAVE_PREGUNTA, 'si');
  guardarConfig({ ...config, activo: true });
  // Un aviso de confirmación, para que vea cómo llegan
  void supabase.rpc('avisos_probar').then(() => {}, () => {});
  return 'si';
};

/** Apagar el interruptor principal: no llega ninguno. Lo elegido en cada fila se conserva. */
export const desactivarAvisos = async (): Promise<void> => {
  guardarConfig({ ...config, activo: false });
  pomodoroProgramado = false;
  if (supabaseListo) {
    await Promise.all(['compromiso', 'pomodoro', 'descanso'].map((t) => supabase.rpc('programar_avisos', { p_tipo: t, p_filas: [] }).then(() => {}, () => {})));
  }
  await quitarEsteCelular();
};

// ---------- La pregunta ----------
/** "Ahora no" (o cerrar la hoja): se recuerda una vez, 3 días después, en Hoy. */
export const decirAhoraNoAvisos = () => {
  if (leerPregunta() === '') { escribir(CLAVE_PREGUNTA, 'ahora_no'); escribir(CLAVE_PREGUNTA_FECHA, getTodayString()); }
  else escribir(CLAVE_PREGUNTA, 'cerrado');
  avisar();
};
/** La X del recordatorio de Hoy: no se vuelve a preguntar. */
export const cerrarRecordatorioAvisos = () => { escribir(CLAVE_PREGUNTA, 'cerrado'); avisar(); };

export const abrirHojaAvisos = (h: HojaAvisos) => { hoja = h; avisar(); };
export const cerrarHojaAvisos = () => { hoja = ''; avisar(); };
export const abrirPantallaAvisos = () => { pantalla = true; avisar(); };
export const cerrarPantallaAvisos = () => { pantalla = false; avisar(); };
/** Para volver a mirar el permiso (después de "Ya los activé" o al volver a la app). */
export const revisarPermisoAvisos = (): PermisoAvisos => { avisar(); return foto.permiso; };

// ---------- Al abrir la app ----------
/** Trae lo elegido en la cuenta, anota que abrió la app y repara la suscripción si se perdió. */
export const iniciarAvisos = async (): Promise<void> => {
  if (!supabaseListo) return;
  try {
    const { data } = await supabase.rpc('mi_avisos_config');
    if (data) { config = sanearConfig(data); escribir(CLAVE_CONFIG, JSON.stringify(config)); }
  } catch {}
  latido(true);
  if (soporta()) {
    if (Notification.permission === 'granted' && leer(CLAVE_SUB)) {
      const reg = await registro();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (!sub || sub.endpoint !== leer(CLAVE_SUB)) await suscribirCelular();
    } else if (Notification.permission !== 'granted' && leer(CLAVE_SUB)) {
      escribir(CLAVE_SUB, '');
    }
  }
  avisar();
};

/** "Abrí la app": como mucho una vez por hora (o siempre, si es el arranque). */
export const latido = (forzar = false) => {
  if (!supabaseListo) return;
  const ahora = Date.now();
  const ultimo = parseInt(leer(CLAVE_LATIDO) || '0', 10) || 0;
  if (!forzar && ahora - ultimo < 3600000) return;
  escribir(CLAVE_LATIDO, String(ahora));
  void supabase.rpc('avisos_latido', { p_tz: zona() }).then(() => {}, () => {});
};

// ---------- Compromisos y pomodoro: la cola ----------
interface FilaCola { clave: string; enviar_en: string; titulo: string; cuerpo: string; destino: string }
const programar = async (tipo: 'compromiso' | 'pomodoro' | 'descanso', filas: FilaCola[]): Promise<void> => {
  if (!supabaseListo) return;
  try { await supabase.rpc('programar_avisos', { p_tipo: tipo, p_filas: filas }); } catch {}
};

/** Sube los avisos de los compromisos de los próximos 14 días. Se llama al abrir la app y cuando cambian. */
export const programarCompromisos = (lista: Compromiso[]): void => {
  if (!encendidos()) return;
  const filas = avisosDeCompromisos(lista, ahoraLocal(), config).map((a) => ({
    clave: a.clave, enviar_en: new Date(a.enviarEn).toISOString(), titulo: a.titulo, cuerpo: a.cuerpo, destino: a.destino,
  }));
  void programar('compromiso', filas);
};

let pomodoroProgramado = false;
/** Programa el aviso de fin de pomodoro (o de descanso) para cuando el reloj llegue a cero. */
export const programarPomodoro = (tipo: 'pomodoro' | 'descanso', finMs: number, texto: TextoAviso): void => {
  if (!encendidos() || !config.pomodoro || finMs <= Date.now() + 5000) return;
  pomodoroProgramado = true;
  const otro = tipo === 'pomodoro' ? 'descanso' : 'pomodoro';
  void programar(otro, []);
  void programar(tipo, [{ clave: String(Math.round(finMs / 1000)), enviar_en: new Date(finMs).toISOString(), titulo: texto.titulo, cuerpo: texto.cuerpo, destino: texto.destino }]);
};
/** Pausó, terminó antes o salió: ya no hay que avisar. */
export const cancelarPomodoro = (): void => {
  if (!pomodoroProgramado) return;
  pomodoroProgramado = false;
  void programar('pomodoro', []);
  void programar('descanso', []);
};

export const useAvisos = () => {
  const f = useSyncExternalStore(suscribirOyente, () => foto);
  return {
    ...f,
    /** Encendidos en este celular */
    encendidos: f.permiso === 'si' && f.config.activo,
    activarAvisos, desactivarAvisos, cambiarHoraAviso, cambiarInterruptorAviso, cambiarOtroAviso,
    decirAhoraNoAvisos, cerrarRecordatorioAvisos, abrirHojaAvisos, cerrarHojaAvisos, abrirPantallaAvisos, cerrarPantallaAvisos,
    revisarPermisoAvisos,
  };
};
