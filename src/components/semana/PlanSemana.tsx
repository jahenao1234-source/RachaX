import React, { useEffect, useRef, useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Casilla } from '../tareas/piezas';
import { Subtarea } from '../../types';
import { isHabitScheduledForDate } from '../../utils/habitUtils';
import { etiquetaDia, pasosDelDia, pasosSinDia } from '../../utils/semanaUtils';
import { textoDiaLargo } from '../../utils/tareasUtils';

/**
 * Tu semana en escritorio: el tablero de 7 días y "Pasos sin día" (DESIGN.md › Tu semana).
 * Mover un paso: arrastrarlo con el mouse, o tocarlo y luego tocar el día ("tocar y colocar").
 * Con el teclado, Enter abre la hoja "¿Qué día lo haces?". Cada cambio muestra un aviso con Deshacer.
 * La lista de la derecha nunca cambia mientras se arrastra (solo se resalta).
 */

interface Item { tareaId: string; paso: Subtarea }
type Destino = string | 'panel';

export const PlanSemana: React.FC<{
  fechas: string[];
  hoy: string;
  onElegirDia: (tareaId: string, paso: Subtarea) => void;
  avisar: (texto: string, deshacer: () => void) => void;
}> = ({ fechas, hoy, onElegirDia, avisar }) => {
  const { tareas, habitosActivos, toggleSubtarea, ponerFechaPaso } = useHabitStore();
  const [elegido, setElegido] = useState<Item | null>(null);
  const [arrastre, setArrastre] = useState<{ item: Item; x: number; y: number } | null>(null);
  const [sobre, setSobre] = useState<Destino | null>(null);
  const inicio = useRef<{ item: Item; x: number; y: number; activo: boolean } | null>(null);
  const grupos = pasosSinDia(tareas);

  // Escape cancela "tocar y colocar"
  useEffect(() => {
    if (!elegido) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setElegido(null); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [elegido]);

  const colocar = (item: Item, destino: Destino) => {
    const antes = item.paso.fecha;
    const nueva = destino === 'panel' ? undefined : destino;
    setElegido(null);
    if (nueva === antes) return;
    if (nueva && nueva < hoy) return; // los días que ya pasaron no reciben pasos
    ponerFechaPaso(item.tareaId, item.paso.id, nueva);
    const deshacer = () => ponerFechaPaso(item.tareaId, item.paso.id, antes);
    avisar(nueva ? `Pusiste “${item.paso.texto}” para ${textoDiaLargo(nueva, hoy)}` : `Le quitaste el día a “${item.paso.texto}”`, deshacer);
  };

  const destinoEn = (x: number, y: number): Destino | null => {
    for (const el of document.elementsFromPoint(x, y)) {
      const d = (el as HTMLElement).closest<HTMLElement>('[data-soltar]');
      if (d) return d.dataset.soltar as Destino;
    }
    return null;
  };

  // Arrastre propio con el puntero (con el mouse empieza al moverse 4 px; si no se mueve, es un toque)
  const asa = (item: Item) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('.tchk')) return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sigue funcionando sin captura */ }
      inicio.current = { item, x: e.clientX, y: e.clientY, activo: false };
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const i = inicio.current;
      if (!i) return;
      if (!i.activo) {
        if (e.pointerType !== 'mouse' || (Math.abs(e.clientX - i.x) < 5 && Math.abs(e.clientY - i.y) < 5)) return;
        i.activo = true;
        setElegido(null);
        document.body.style.userSelect = 'none';
      }
      setArrastre({ item: i.item, x: e.clientX, y: e.clientY });
      setSobre(destinoEn(e.clientX, e.clientY));
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const i = inicio.current;
      inicio.current = null;
      document.body.style.userSelect = '';
      if (!i) return;
      if (i.activo) {
        const d = destinoEn(e.clientX, e.clientY);
        setArrastre(null);
        setSobre(null);
        if (d) colocar(i.item, d);
      } else if (!(e.target as HTMLElement).closest('.tchk')) {
        // Un toque: si ya había otro elegido, se coloca donde tocaste; si no, este queda elegido (tocarlo de nuevo lo suelta)
        if (elegido && elegido.paso.id !== i.item.paso.id) {
          const d = destinoEn(e.clientX, e.clientY);
          if (d) colocar(elegido, d);
        } else setElegido(elegido ? null : i.item);
      }
    },
    onPointerCancel: () => { inicio.current = null; setArrastre(null); setSobre(null); document.body.style.userSelect = ''; },
    // Teclado: Enter o espacio abre la hoja del día (el clic del mouse ya lo maneja onPointerUp)
    onClick: (e: React.MouseEvent) => { if (e.detail === 0 && !(e.target as HTMLElement).closest('.tchk')) onElegirDia(item.tareaId, item.paso); },
  });

  const moviendo = arrastre?.item ?? elegido;
  const clasesDestino = (d: Destino) => `${moviendo ? ' objetivo' : ''}${sobre === d ? ' sobre' : ''}`;

  return (
    <>
      {elegido && (
        <div className="tselegido" role="status">
          <span>Toca el día para “{elegido.paso.texto}”, o la lista de la derecha para quitarle el día.</span>
          <button type="button" aria-label="Cancelar" onClick={() => setElegido(null)}><X size={16} /></button>
        </div>
      )}
      <div className="desk-layout flex gap-4 xl:gap-6 mt-4">
        <div className="board-grid flex-1" role="list" aria-label="Días de la semana">
          {fechas.map((f) => {
            const r = etiquetaDia(f);
            const pasado = f < hoy;
            const tocan = habitosActivos.filter((h) => h.frecuencia !== 'semanal' && isHabitScheduledForDate(h, f)).length;
            return (
              <section key={f} role="listitem" aria-label={`${r.corto} ${r.numero}`}
                className={`board-col${pasado ? ' pasado' : ''}${f === hoy ? ' hoy' : ''}${pasado ? '' : clasesDestino(f)}`}
                {...(pasado ? {} : { 'data-soltar': f })}
                onClick={(e) => { if (elegido && !pasado && !(e.target as HTMLElement).closest('.step-card')) colocar(elegido, f); }}>
                <div className="col-head">
                  <span className="col-date">{r.corto} {r.numero}</span>
                  {f === hoy && <span className="col-hoy-lbl">Hoy</span>}
                </div>
                <span className="col-habits">{tocan} {tocan === 1 ? 'hábito' : 'hábitos'}</span>
                <div className="flex flex-col gap-2 mt-1">
                  {pasosDelDia(tareas, f, hoy).map((p) => {
                    const item = { tareaId: p.tareaId, paso: p.paso };
                    const movible = !pasado && !p.paso.hecha;
                    return (
                      <div key={`${p.tareaId}-${p.paso.id}`}
                        className={`step-card${elegido?.paso.id === p.paso.id ? ' elegido' : ''}${arrastre?.item.paso.id === p.paso.id ? ' fantasma' : ''}`}
                        {...(movible ? { ...asa(item), role: 'button', tabIndex: 0, 'aria-label': `${p.paso.texto}, de ${p.tareaNombre}. Mover a otro día`,
                          onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && !(e.target as HTMLElement).closest('.tchk')) { e.preventDefault(); onElegirDia(p.tareaId, p.paso); } } } : {})}>
                        {/* El texto usa todo el ancho; la casilla va abajo, junto a la tarea */}
                        <span className="step-txt" title={p.paso.texto} style={p.paso.hecha ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : undefined}>{p.paso.texto}</span>
                        <div className="step-pie">
                          <Casilla paso={p.paso} onToggle={() => toggleSubtarea(p.tareaId, p.paso.id)} />
                          <span className="step-task" title={p.tareaNombre}>{p.tareaNombre}{p.atraso ? ` · ${p.atraso}` : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!pasado && sobre === f && <div className="tsdrop">Suelta aquí para hacerlo este día</div>}
              </section>
            );
          })}
        </div>

        <aside className={`panel-sin-dia${clasesDestino('panel')}`} data-soltar="panel" aria-labelledby="tssin"
          onClick={(e) => { if (elegido && !(e.target as HTMLElement).closest('.btn-paso-sin')) colocar(elegido, 'panel'); }}>
          <div className="flex flex-col gap-1">
            <h3 id="tssin" className="font-heading font-bold text-[20px] m-0">Pasos sin día <span className="text-text-muted">{grupos.reduce((n, g) => n + g.pasos.length, 0)}</span></h3>
            <p className="text-[13px] text-text-muted m-0">Arrástralos a un día, o tócalos y luego toca el día.</p>
          </div>
          <div className="flex flex-wrap xl:flex-col gap-[14px]">
            {grupos.map((g) => (
              <div key={g.tareaId} className="panel-hab-grp">
                <div className="panel-hab-name">
                  <span className="w-5 h-5 rounded-[6px] bg-surface-raised flex items-center justify-center text-text" aria-hidden="true"><HabitIcon name={g.tareaIcono} size={12} /></span>
                  {g.tareaNombre}
                </div>
                {g.pasos.map((p) => (
                  <button key={p.id} type="button"
                    className={`btn-paso-sin${elegido?.paso.id === p.id ? ' elegido' : ''}${arrastre?.item.paso.id === p.id ? ' fantasma' : ''}`}
                    aria-label={`${p.texto}, de ${g.tareaNombre}. Elegir el día`}
                    {...asa({ tareaId: g.tareaId, paso: p })}>
                    <GripVertical size={16} className="text-text-muted shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-left">{p.texto}</span>
                  </button>
                ))}
              </div>
            ))}
            {grupos.length === 0 && <p className="text-[13px] text-text-muted m-0">No tienes pasos sin día.</p>}
          </div>
          {sobre === 'panel' && <div className="tsdrop">Suelta aquí para quitarle el día</div>}
        </aside>
      </div>

      {arrastre && (
        <div className="tsghost" style={{ left: arrastre.x + 14, top: arrastre.y + 10 }} aria-hidden="true">
          {arrastre.item.paso.texto}
        </div>
      )}
    </>
  );
};
