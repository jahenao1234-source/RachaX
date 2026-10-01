// Avisos: lo que pasa por detrás mientras la app está abierta. No pinta nada.
// - Al entrar: trae lo elegido en la cuenta, anota "abrí la app" y repara la suscripción.
// - Sube los avisos de los compromisos cuando cambian.
// - Al tocar un aviso, abre el lugar correcto (Hoy, Día difícil, Tus compromisos o Foco).
import React, { useEffect, useRef } from 'react';
import { useHabitStore } from '../../store/HabitContext';
import { leerFocoEnCurso } from '../../utils/focoUtils';
import { DestinoAviso } from '../../utils/avisosUtils';
import { iniciarAvisos, latido, programarCompromisos, revisarPermisoAvisos, useAvisos } from './useAvisos';

const DESTINOS: DestinoAviso[] = ['hoy', 'dificil', 'compromisos', 'foco'];

export const AvisosSync: React.FC = () => {
  const { compromisos, setActiveTab, abrirDificil, abrirCompromisos, openFocusMode } = useHabitStore();
  const { encendidos, config } = useAvisos();

  // Abrir el destino de un aviso
  const ir = useRef<(d: string) => void>(() => {});
  ir.current = (d: string) => {
    if (!DESTINOS.includes(d as DestinoAviso)) return;
    setActiveTab('hoy');
    if (d === 'dificil') abrirDificil();
    else if (d === 'compromisos') abrirCompromisos();
    else if (d === 'foco') { const f = leerFocoEnCurso(); if (f) openFocusMode(f.target); }
  };

  useEffect(() => {
    void iniciarAvisos();
    // Llegó desde un aviso con la app cerrada: /?abrir=destino
    try {
      const u = new URL(window.location.href);
      const d = u.searchParams.get('abrir');
      if (d) {
        u.searchParams.delete('abrir');
        window.history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
        ir.current(d);
      }
    } catch {}
    // Tocó un aviso con la app abierta
    const alMensaje = (e: MessageEvent) => { if (e.data && e.data.racha === 'abrir') ir.current(String(e.data.destino || 'hoy')); };
    const alVolver = () => { if (document.visibilityState === 'visible') { latido(); revisarPermisoAvisos(); } };
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', alMensaje);
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('message', alMensaje);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, []);

  // Los avisos de los compromisos: al entrar y cada vez que cambian (con una espera corta para no subir a cada tecla)
  useEffect(() => {
    if (!encendidos) return;
    const t = window.setTimeout(() => programarCompromisos(compromisos), 1500);
    return () => window.clearTimeout(t);
  }, [encendidos, compromisos, config.compromisos, config.nombres]);

  return null;
};
