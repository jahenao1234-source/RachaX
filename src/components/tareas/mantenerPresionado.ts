import React, { useEffect, useRef } from 'react';

/**
 * Mantener presionada una tarea para abrir su menú (design/maqueta-tareas-2.html, pantalla 3).
 * - Con el dedo: 500 ms quieto. Si el dedo se mueve más de 8 px o la lista se desplaza, se cancela (era un desplazamiento).
 *   Vibra un poco al abrir y se traga el toque que llega al soltar, para que no abra la tarea.
 * - Con mouse: clic derecho. Con teclado: la tecla de menú o Shift+F10 (el navegador lo manda como contextmenu).
 * - Quita el menú propio del navegador (copiar, seleccionar…) sobre la fila.
 * Uso: const mp = useMantenerPresionado(() => abrirMenu(t.id)); <li {...mp.props}> (en el contenedor de la fila).
 */
const ESPERA_MS = 500;
const TOLERANCIA_PX = 8;

export function useMantenerPresionado(alMantener: () => void) {
  const accion = useRef(alMantener);
  accion.current = alMantener;
  const estado = useRef<{ x: number; y: number; timer: number | null; disparado: boolean }>({ x: 0, y: 0, timer: null, disparado: false });

  const cancelar = () => {
    if (estado.current.timer) window.clearTimeout(estado.current.timer);
    estado.current.timer = null;
    window.removeEventListener('scroll', cancelar, true);
  };
  useEffect(() => () => cancelar(), []);

  const disparar = () => {
    cancelar();
    estado.current.disparado = true;
    navigator.vibrate?.(10);
    accion.current();
  };

  const props = {
    onPointerDown: (e: React.PointerEvent) => {
      estado.current.disparado = false;
      if (e.pointerType === 'mouse') return; // con mouse se usa el clic derecho
      cancelar();
      estado.current.x = e.clientX;
      estado.current.y = e.clientY;
      estado.current.timer = window.setTimeout(disparar, ESPERA_MS);
      window.addEventListener('scroll', cancelar, true);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!estado.current.timer) return;
      if (Math.abs(e.clientX - estado.current.x) > TOLERANCIA_PX || Math.abs(e.clientY - estado.current.y) > TOLERANCIA_PX) cancelar();
    },
    onPointerUp: cancelar,
    onPointerCancel: cancelar,
    onPointerLeave: cancelar,
    // Android manda contextmenu al mantener; clic derecho y Shift+F10 también llegan aquí
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      if (!estado.current.disparado) disparar();
    },
    // El toque que llega al soltar después de abrir el menú no debe abrir la tarea
    onClickCapture: (e: React.MouseEvent) => {
      if (estado.current.disparado) {
        e.preventDefault();
        e.stopPropagation();
        estado.current.disparado = false;
      }
    },
    style: { WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' } as React.CSSProperties,
  };
  return { props };
}
