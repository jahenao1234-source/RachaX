import { useEffect } from 'react';

// ---------- Modo Foco: sonido suave, vibración y pantalla encendida (DESIGN.md › Modo Foco) ----------
// Límites de los celulares: el sonido y la vibración solo funcionan con Racha abierta. En iPhone no hay vibración
// y el interruptor de silencio apaga el sonido. Por eso se mantiene la pantalla encendida mientras corre el reloj.

let ctx: AudioContext | null = null;
let programados: OscillatorNode[] = [];

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

/** Dos tonos suaves (sin archivo). Se programan con el reloj del audio, así suenan a tiempo aunque la pestaña esté de fondo. */
export function programarSonido(enMs: number): void {
  cancelarSonido();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + Math.max(0, enMs) / 1000;
    for (const [i, freq] of [660, 880].entries()) {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      const t = t0 + i * 0.28;
      osc.type = 'sine';
      osc.frequency.value = freq;
      vol.gain.setValueAtTime(0.0001, t);
      vol.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(vol).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
      programados.push(osc);
    }
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
    if (document.visibilityState === 'visible') navigator.vibrate?.([180, 90, 180]);
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
