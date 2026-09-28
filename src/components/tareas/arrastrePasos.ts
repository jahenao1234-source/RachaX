import React, { useEffect, useRef, useState } from 'react';
import { useHabitStore } from '../../store/HabitContext';
import { Subtarea, Tarea } from '../../types';

/**
 * Arrastrar pasos de una tarea (DESIGN.md › Tareas). Lo usan Editar tarea (celular) y la tarea abierta (escritorio).
 * Con el dedo: mantener presionado el asa 350 ms. Con el mouse: basta con empezar a mover.
 * Arriba o abajo de un paso lo pone antes o después; hacia la derecha (más de 32 px) lo mete dentro del de arriba.
 */

export type PosSoltar = 'antes' | 'despues' | 'dentro';
export interface Arrastre { id: string; dy: number; destino: { id: string; pos: PosSoltar } | null }
interface Inicio {
  x: number; y: number; id: string; timer: number | null; activo: boolean; raton: boolean;
  caja: HTMLElement; scroll0: number; ux: number; uy: number; auto: number | null;
}

/** Ubica cada paso: su padre y su lugar entre sus hermanos. */
export const ubicar = (lista: Subtarea[], padreId: string | null = null, mapa = new Map<string, { padreId: string | null; hermanos: string[] }>()) => {
  const hermanos = lista.map((s) => s.id);
  for (const s of lista) {
    mapa.set(s.id, { padreId, hermanos });
    if (s.subtareas) ubicar(s.subtareas, s.id, mapa);
  }
  return mapa;
};

/** Orden de arriba a abajo, sin el paso que se arrastra ni lo que tiene adentro. */
const ordenPlano = (lista: Subtarea[], sin: string, res: string[] = []) => {
  for (const s of lista) {
    if (s.id === sin) continue;
    res.push(s.id);
    if (s.subtareas) ordenPlano(s.subtareas, sin, res);
  }
  return res;
};

/** Ids de los hijos directos de un paso. */
export function hijosDe(lista: Subtarea[], id: string): string[] {
  for (const s of lista) {
    if (s.id === id) return (s.subtareas || []).map((x) => x.id);
    if (s.subtareas) {
      const r = hijosDe(s.subtareas, id);
      if (r.length || s.subtareas.some((x) => x.id === id)) return r;
    }
  }
  return [];
}

const textos = (lista: Subtarea[], mapa = new Map<string, string>()) => {
  for (const s of lista) {
    mapa.set(s.id, s.texto);
    if (s.subtareas) textos(s.subtareas, mapa);
  }
  return mapa;
};

export type DirTeclado = 'arriba' | 'abajo' | 'dentro' | 'fuera';

/** Escritorio, con teclado sobre el asa: Alt+↑/↓ mueve, Alt+→ lo mete dentro del de arriba, Alt+← lo saca un nivel. */
export function destinoConTeclado(lista: Subtarea[], id: string, dir: DirTeclado) {
  const mapa = ubicar(lista);
  const u = mapa.get(id);
  if (!u) return null;
  const t = textos(lista);
  const nombre = t.get(id) || 'El paso';
  const i = u.hermanos.indexOf(id);
  const n = u.hermanos.length;
  if (dir === 'arriba') return i > 0 ? { padreId: u.padreId, indice: i - 1, mensaje: `${nombre}: lugar ${i} de ${n}` } : null;
  if (dir === 'abajo') return i < n - 1 ? { padreId: u.padreId, indice: i + 1, mensaje: `${nombre}: lugar ${i + 2} de ${n}` } : null;
  if (dir === 'dentro') {
    if (i === 0) return null;
    const arriba = u.hermanos[i - 1];
    return { padreId: arriba, indice: hijosDe(lista, arriba).length, mensaje: `${nombre}: ahora va dentro de ${t.get(arriba)}` };
  }
  if (!u.padreId) return null;
  const up = mapa.get(u.padreId);
  if (!up) return null;
  return { padreId: up.padreId, indice: up.hermanos.indexOf(u.padreId) + 1, mensaje: `${nombre}: salió de ${t.get(u.padreId)}` };
}

export function useArrastrePasos(tarea: Tarea | null, alEmpezar?: () => void) {
  const { moverPasoTarea } = useHabitStore();
  const [arrastre, setArrastreEstado] = useState<Arrastre | null>(null);
  const actual = useRef<Arrastre | null>(null);
  const inicio = useRef<Inicio | null>(null);

  const setArrastre = (a: Arrastre | null) => { actual.current = a; setArrastreEstado(a); };

  const cancelar = () => {
    if (inicio.current?.timer) window.clearTimeout(inicio.current.timer);
    if (inicio.current?.auto) window.clearInterval(inicio.current.auto);
    inicio.current = null;
    document.body.style.userSelect = '';
    setArrastre(null);
  };
  useEffect(() => () => {
    if (inicio.current?.timer) window.clearTimeout(inicio.current.timer);
    if (inicio.current?.auto) window.clearInterval(inicio.current.auto);
    document.body.style.userSelect = '';
  }, []);

  const activar = (i: Inicio) => {
    i.activo = true;
    document.body.style.userSelect = 'none';
    setArrastre({ id: i.id, dy: 0, destino: null });
    if (!i.raton) navigator.vibrate?.(10);
    alEmpezar?.();
  };

  const alBajar = (e: React.PointerEvent<HTMLElement>, id: string) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sin captura el arrastre igual funciona */ }
    // La caja que se desplaza (en la app, el contenedor con overflow-y-auto)
    let caja: HTMLElement | null = e.currentTarget.parentElement;
    while (caja && !(caja.scrollHeight > caja.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(caja).overflowY))) caja = caja.parentElement;
    if (!caja) caja = document.scrollingElement as HTMLElement;
    const raton = e.pointerType === 'mouse';
    const i: Inicio = { x: e.clientX, y: e.clientY, id, timer: null, activo: false, raton, caja, scroll0: caja.scrollTop, ux: e.clientX, uy: e.clientY, auto: null };
    if (!raton) {
      i.timer = window.setTimeout(() => { if (inicio.current === i) activar(i); }, 350);
    }
    inicio.current = i;
  };

  const calcular = (cx: number, cy: number) => {
    const i = inicio.current;
    if (!i || !tarea) return;
    const dy = cy - i.y + (i.caja.scrollTop - i.scroll0);
    const dx = cx - i.x;
    let destino: Arrastre['destino'] = null;
    const debajo = document.elementsFromPoint(cx, cy)
      .map((el) => (el as HTMLElement).closest<HTMLElement>('[data-paso-row]'))
      .find((el) => el && el.dataset.pasoRow !== i.id && !el.closest(`[data-paso-li="${i.id}"]`));
    if (debajo) {
      const id = debajo.dataset.pasoRow as string;
      const r = debajo.getBoundingClientRect();
      const pos: PosSoltar = cy < r.top + r.height / 2 ? 'antes' : 'despues';
      if (dx > 32) {
        // Hacia la derecha: dentro del paso de arriba
        const orden = ordenPlano(tarea.subtareas, i.id);
        const arriba = pos === 'despues' ? id : orden[orden.indexOf(id) - 1];
        destino = arriba ? { id: arriba, pos: 'dentro' } : null;
      } else destino = { id, pos };
    }
    setArrastre({ id: i.id, dy, destino });
  };

  const alMover = (e: React.PointerEvent<HTMLElement>) => {
    const i = inicio.current;
    if (!i || !tarea) return;
    if (!i.activo) {
      if (i.raton) {
        if (Math.abs(e.clientY - i.y) > 4 || Math.abs(e.clientX - i.x) > 4) activar(i);
        else return;
      } else {
        if (Math.abs(e.clientY - i.y) > 10) cancelar();
        return;
      }
    }
    i.ux = e.clientX; i.uy = e.clientY;
    // Cerca del borde de arriba o de abajo, la pantalla se desplaza sola
    const borde = e.clientY < 90 ? -1 : e.clientY > window.innerHeight - 130 ? 1 : 0;
    if (borde && !i.auto) {
      i.auto = window.setInterval(() => {
        const j = inicio.current;
        if (!j) return;
        const dir = j.uy < 90 ? -1 : j.uy > window.innerHeight - 130 ? 1 : 0;
        if (!dir) { window.clearInterval(j.auto as number); j.auto = null; return; }
        j.caja.scrollTop += dir * 10;
        calcular(j.ux, j.uy);
      }, 16);
    }
    calcular(e.clientX, e.clientY);
  };

  const alSoltar = () => {
    const i = inicio.current;
    const a = actual.current;
    cancelar();
    if (!i?.activo || !a?.destino || !tarea) return;
    const mapa = ubicar(tarea.subtareas);
    if (a.destino.pos === 'dentro') {
      const hijos = hijosDe(tarea.subtareas, a.destino.id).filter((x) => x !== a.id);
      moverPasoTarea(tarea.id, a.id, { padreId: a.destino.id, indice: hijos.length });
      return;
    }
    const u = mapa.get(a.destino.id);
    if (!u) return;
    const hermanos = u.hermanos.filter((x) => x !== a.id);
    const idx = hermanos.indexOf(a.destino.id);
    moverPasoTarea(tarea.id, a.id, { padreId: u.padreId, indice: a.destino.pos === 'antes' ? idx : idx + 1 });
  };

  return {
    arrastre,
    /** Eventos para el asa ⋮⋮ de un paso. */
    asa: (id: string) => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => alBajar(e, id),
      onPointerMove: alMover,
      onPointerUp: alSoltar,
      onPointerCancel: cancelar,
    }),
    /** Dónde caería el paso que se arrastra, respecto a este paso. */
    destinoEn: (id: string): PosSoltar | null => (arrastre?.destino?.id === id ? arrastre.destino.pos : null),
    /** El paso que se arrastra sigue al dedo o al mouse; si va a quedar dentro de otro, se corre a la derecha. */
    estilo: (id: string): React.CSSProperties | undefined => (arrastre?.id === id
      ? { transform: `translate(${arrastre.destino?.pos === 'dentro' ? 26 : 0}px, ${arrastre.dy}px)` }
      : undefined),
  };
}
