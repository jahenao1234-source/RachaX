import { useEffect } from 'react';

// ---------- Modo Foco: sonido, vibración y pantalla encendida (DESIGN.md › Modo Foco) ----------
// Límites de los celulares: el sonido y la vibración solo funcionan con Racha abierta. En iPhone no hay vibración
// y el interruptor de silencio apaga el sonido. Por eso se mantiene la pantalla encendida mientras corre el reloj.

let ctx: AudioContext | null = null;
let programados: OscillatorNode[] = [];
// Volumen (0 a 1). El del final es fuerte a propósito: avisa que se acabó el tiempo. El de empezar es más bajo.
const VOLUMEN_FIN = 0.7;
const VOLUMEN_INICIO = 0.35;

/**
 * Llamar DENTRO del toque de "Empezar" (o "Seguir"): iPhone solo deja sonar si el audio se preparó con un gesto.
 */
export function prepararSonido(): void {
  try {
    const AC: typeof AudioContext | undefined = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { /* sin audio: el aviso queda solo en pantalla */ }
}

/**
 * El aviso del final: los dos tonos de siempre, dos veces y con buen volumen (Johnatan lo oía muy suave el 1 oct).
 * Sin archivo. Se programan con el reloj del audio, así suenan a tiempo aunque la pestaña esté de fondo.
 * Onda triangular: se oye más que la senoidal en el parlante de un celular, sin ser chillona.
 */
export function programarSonido(enMs: number): void {
  cancelarSonido();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + Math.max(0, enMs) / 1000;
    // [cuándo empieza (s), tono (Hz)]: dos tonos, una pausa corta y otra vez
    for (const [inicio, freq] of [[0, 660], [0.28, 880], [0.95, 660], [1.23, 880]]) {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      const t = t0 + inicio;
      osc.type = 'triangle';
      osc.frequency.value = freq;
      vol.gain.setValueAtTime(0.0001, t);
      vol.gain.exponentialRampToValueAtTime(VOLUMEN_FIN, t + 0.03);
      vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(vol).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
      programados.push(osc);
    }
  } catch { /* sin audio */ }
}

/**
 * Un toque suave al empezar (Empezar, Empezar pomodoro, Empezar de nuevo; no al seguir tras una pausa).
 * Llamar DESPUÉS de prepararSonido() dentro del mismo toque. No usa `programados`: no cancela el aviso del final.
 */
export function sonarInicio(): void {
  if (!ctx) return;
  try {
    const t = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 523;
    vol.gain.setValueAtTime(0.0001, t);
    vol.gain.exponentialRampToValueAtTime(VOLUMEN_INICIO, t + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(vol).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  } catch { /* sin audio */ }
}

/** Al pausar, terminar o salir: que no suene después. */
export function cancelarSonido(): void {
  for (const o of programados) { try { o.stop(); } catch { /* ya sonó */ } }
  programados = [];
}

/** Vibración corta (Android; en iPhone no existe y no pasa nada). Solo con la app visible. */
export function vibrar(): void {
  try {
    if (document.visibilityState === 'visible') navigator.vibrate?.([250, 120, 250, 300, 250, 120, 250]);
  } catch { /* sin vibración */ }
}

/**
 * Mantiene la pantalla encendida mientras `activo` sea true (reloj corriendo). El sistema la suelta al ocultar la app,
 * así que se pide otra vez al volver. Si el navegador no lo permite, no pasa nada.
 */
export function usePantallaEncendida(activo: boolean): void {
  useEffect(() => {
    if (!activo) return;
    let lock: any = null;
    let vivo = true;
    const pedir = async () => {
      try {
        const wl = (navigator as any).wakeLock;
        if (!wl || document.visibilityState !== 'visible') return;
        const l = await wl.request('screen');
        if (vivo) lock = l; else l.release?.();
      } catch { /* sin permiso o sin soporte */ }
    };
    const alVolver = () => { if (document.visibilityState === 'visible') void pedir(); };
    void pedir();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      vivo = false;
      document.removeEventListener('visibilitychange', alVolver);
      try { lock?.release?.(); } catch { /* ya se soltó */ }
    };
  }, [activo]);
}
