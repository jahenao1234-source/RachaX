import React, { useEffect, useRef, useState } from 'react';
import { GripVertical, X, Sunrise, Sun, Moon, Clock, Repeat } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Casilla } from '../tareas/piezas';
import { Compromiso, Subtarea, MomentoPlan } from '../../types';
import { isHabitScheduledForDate } from '../../utils/habitUtils';
import { diaPorMomentos, etiquetaDia, FRANJAS, Franja, pasosSinDia, textoCargaDia } from '../../utils/semanaUtils';
import { textoDiaLargo } from '../../utils/tareasUtils';
import { textoHora } from '../../utils/compromisosUtils';

interface ItemPaso { tipo: 'paso'; tareaId: string; paso: Subtarea }
interface ItemCompromiso { tipo: 'compromiso'; dato: Compromiso; fechaOriginal: string }
type Item = ItemPaso | ItemCompromiso;
type Destino = string | 'panel';

export const PlanSemana: React.FC<{
  fechas: string[];
  hoy: string;
  onElegirDia: (tareaId: string, paso: Subtarea) => void;
  avisar: (texto: string, deshacer: () => void) => void;
  onEditarCompromiso: (c: Compromiso) => void;
  onMoverCompromiso: (c: Compromiso, fechaDestino: string, franjaDestino: Franja, fechaOriginal: string) => void;
}> = ({ fechas, hoy, onElegirDia, avisar, onEditarCompromiso, onMoverCompromiso }) => {
  const { tareas, habitosActivos, compromisos, toggleSubtarea, ponerFechaPaso } = useHabitStore();
  const [elegido, setElegido] = useState<Item | null>(null);
  const [arrastre, setArrastre] = useState<{ item: Item; x: number; y: number } | null>(null);
  const [sobre, setSobre] = useState<Destino | null>(null);
  const [verTodos, setVerTodos] = useState<Record<string, boolean>>({});
  const inicio = useRef<{ item: Item; x: number; y: number; activo: boolean } | null>(null);
  const grupos = pasosSinDia(tareas);

  useEffect(() => {
    if (!elegido) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setElegido(null); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [elegido]);

  const colocar = (item: Item, destino: Destino) => {
    setElegido(null);
    if (destino === 'panel' && item.tipo === 'compromiso') return; 

    if (item.tipo === 'paso') {
      const antesFecha = item.paso.fecha;
      const antesMomento = item.paso.momento;
      
      let nuevaFecha: string | undefined;
      let nuevoMomento: MomentoPlan | null | undefined;

      if (destino === 'panel') {
        nuevaFecha = undefined;
        nuevoMomento = undefined; 
      } else {
        const [f, m] = destino.split('|');
        nuevaFecha = f;
        nuevoMomento = m === 'cualquiera' ? null : m as MomentoPlan;
      }

      if (nuevaFecha === antesFecha && nuevoMomento === antesMomento) return;
      if (nuevaFecha && nuevaFecha < hoy) return;

      ponerFechaPaso(item.tareaId, item.paso.id, nuevaFecha, destino === 'panel' ? undefined : nuevoMomento);
      const deshacer = () => ponerFechaPaso(item.tareaId, item.paso.id, antesFecha, antesMomento);
      avisar(nuevaFecha ? `Pusiste “${item.paso.texto}” para ${textoDiaLargo(nuevaFecha, hoy)}` : `Le quitaste el día a “${item.paso.texto}”`, deshacer);
    } else {
      if (destino === 'panel') return;
      const [f, m] = destino.split('|');
      if (f < hoy) return;
      onMoverCompromiso(item.dato, f, m as Franja, item.fechaOriginal);
    }
  };

  const destinoEn = (x: number, y: number): Destino | null => {
    for (const el of document.elementsFromPoint(x, y)) {
      const d = (el as HTMLElement).closest<HTMLElement>('[data-soltar]');
      if (d) return d.dataset.soltar as Destino;
    }
    return null;
  };

  const asa = (item: Item) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('.tchk')) return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ }
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
        const isSame = elegido?.tipo === i.item.tipo && 
          (i.item.tipo === 'paso' ? (elegido as ItemPaso).paso.id === (i.item as ItemPaso).paso.id : (elegido as ItemCompromiso).dato.id === (i.item as ItemCompromiso).dato.id);
        
        if (elegido && !isSame) {
          const d = destinoEn(e.clientX, e.clientY);
          if (d) colocar(elegido, d);
        } else setElegido(elegido ? null : i.item);
      }
    },
    onPointerCancel: () => { inicio.current = null; setArrastre(null); setSobre(null); document.body.style.userSelect = ''; },
    onClick: (e: React.MouseEvent) => {
      if (e.detail === 0 && !(e.target as HTMLElement).closest('.tchk')) {
        if (item.tipo === 'paso') onElegirDia(item.tareaId, item.paso);
        else onEditarCompromiso(item.dato);
      }
    },
  });

  const idDe = (i: Item) => i.tipo === 'paso' ? i.paso.id : i.dato.id;
  const textoDe = (i: Item) => i.tipo === 'paso' ? i.paso.texto : i.dato.titulo;

  const moviendo = arrastre?.item ?? elegido;
  const clasesDestino = (d: Destino) => `${moviendo && !(moviendo.tipo === 'compromiso' && d === 'panel') ? ' ring-2 ring-text ring-inset' : ''}${sobre === d ? ' bg-surface-raised border-dashed border-text' : ''}`;

  const iconForFranja = (m: Franja) => {
    if (m === 'manana') return <Sunrise size={16} className="text-ambar-text" />;
    if (m === 'tarde') return <Sun size={16} className="text-coral-text" />;
    if (m === 'noche') return <Moon size={16} className="text-lila-text" />;
    return <Clock size={16} className="text-text" />;
  };
  const colorFranja = (m: Franja) => {
    if (m === 'manana') return ' text-ambar-text';
    if (m === 'tarde') return ' text-coral-text';
    if (m === 'noche') return ' text-lila-text';
    return ' text-text';
  };

  return (
    <>
      {elegido && (
        <div className="tselegido" role="status">
          <span>Toca el día para “{textoDe(elegido)}”, o un espacio vacío para moverlo.</span>
          <button type="button" aria-label="Cancelar" onClick={() => setElegido(null)}><X size={16} /></button>
        </div>
      )}
      
      {/* Pasos sin día (franja superior) */}
      <div className={`card mt-4 p-4 border border-line rounded-[18px] bg-surface transition-colors ${clasesDestino('panel')}`} data-soltar="panel" onClick={(e) => { if (elegido && !(e.target as HTMLElement).closest('button')) colocar(elegido, 'panel'); }}>
        <div className="flex items-baseline gap-3 flex-wrap mb-3">
          <h3 id="tssin" className="font-heading font-bold text-[20px] m-0">Pasos sin día <span className="text-text-muted">{grupos.reduce((n, g) => n + g.pasos.length, 0)}</span></h3>
          <p className="text-[13px] text-text-muted m-0">Arrástralos a un día y un momento, o tócalos y luego toca dónde.</p>
        </div>
        {/* Agrupados por tarea y en el mismo orden de Tareas: el nombre de la tarea una sola vez */}
        <div className="tsgrupos">
          {grupos.map(g => {
            const abierto = !!verTodos[g.tareaId];
            return (
              <section key={g.tareaId} className="tsgrupo" aria-label={`Pasos sin día de ${g.tareaNombre}`}>
                <p className="tsgrupo-h">
                  <span className="w-5 h-5 rounded-[6px] bg-surface-raised flex items-center justify-center text-text shrink-0" aria-hidden="true"><HabitIcon name={g.tareaIcono} size={12} /></span>
                  <span className="truncate" title={g.tareaNombre}>{g.tareaNombre}</span>
                  <span className="tsgrupo-n">{g.pasos.length}</span>
                </p>
                {/* Cada rama: el camino de sus pasos grandes como subtítulo y sus pasos pequeños con sangría */}
                {(() => {
                  let quedan = abierto ? Infinity : 4;
                  return g.ramas.map((rama, ri) => {
                    if (quedan <= 0) return null;
                    const pasos = rama.pasos.slice(0, quedan);
                    quedan -= pasos.length;
                    const sub = rama.ruta.length > 0;
                    return (
                      <div key={ri} className={sub ? 'tsrama' : undefined}>
                        {sub && <p className="tsrama-h" title={rama.ruta.join(' › ')}>{rama.ruta.join(' › ')}</p>}
                        <ol className="tsgrupo-l">
                          {pasos.map(p => (
                            <li key={p.id}>
                              <button type="button"
                                className={`tspaso-sin${elegido?.tipo === 'paso' && elegido.paso.id === p.id ? ' elegido' : ''}${arrastre?.item.tipo === 'paso' && arrastre.item.paso.id === p.id ? ' fantasma' : ''}`}
                                aria-label={`${p.texto}${sub ? `, dentro de ${rama.ruta[rama.ruta.length - 1]}` : ''}, de ${g.tareaNombre}. Elegir el día`}
                                {...asa({ tipo: 'paso', tareaId: g.tareaId, paso: p })}>
                                <GripVertical size={14} className="text-text-muted shrink-0" aria-hidden="true" />
                                <span>{p.texto}</span>
                              </button>
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  });
                })()}
                {g.pasos.length > 4 && (
                  <button type="button" className="tsgrupo-mas" onClick={(e) => { e.stopPropagation(); setVerTodos(v => ({ ...v, [g.tareaId]: !abierto })); }}>
                    {abierto ? 'Ver menos' : `Ver ${g.pasos.length - 4} más`}
                  </button>
                )}
              </section>
            );
          })}
          {grupos.length === 0 && <span className="text-[13px] text-text-muted">No tienes pasos sin día.</span>}
        </div>
        {sobre === 'panel' && <div className="mt-2 text-[11px] py-1 text-center font-bold text-text-muted bg-surface-raised rounded-md">Suelta aquí para quitarle el día</div>}
      </div>

      <div className="overflow-x-auto pb-4 pt-4">
        <div className="flex gap-2 min-w-[1036px]">
          {fechas.map((f) => {
            const r = etiquetaDia(f);
            const pasado = f < hoy;
            const dm = diaPorMomentos(tareas, compromisos, habitosActivos, f, hoy);
            return (
              <section key={f} role="listitem" aria-label={`${r.corto} ${r.numero}`}
                className={`flex-1 min-w-[148px] flex flex-col gap-2`}>
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-heading font-bold text-[18px] ${f === hoy ? 'text-text' : pasado ? 'text-text-muted' : 'text-text'}`}>{r.corto} {r.numero}</span>
                    {f === hoy && <span className="text-[11px] font-bold bg-text text-bg px-1.5 py-0.5 rounded-md">Hoy</span>}
                  </div>
                  <span className="text-[12px] text-text-muted">{textoCargaDia(dm)}</span>
                  {dm.lleno && <span className="text-[11px] font-bold bg-surface-raised text-text-muted px-1.5 py-0.5 rounded-md mt-1">Día lleno</span>}
                </div>
                
                {FRANJAS.map(franja => {
                  if (franja === 'cualquiera' && dm.franjas[franja].length === 0 && dm.habitos[franja] === 0) return null;
                  const items = dm.franjas[franja];
                  const dsoltar = `${f}|${franja}`;
                  
                  return (
                    <div key={franja} className={`flex flex-col gap-1 p-2 rounded-xl border transition-colors ${pasado ? 'opacity-70 bg-transparent border-transparent' : 'bg-surface border-line'} ${!pasado ? clasesDestino(dsoltar) : ''}`}
                      {...(pasado ? {} : { 'data-soltar': dsoltar })}
                      onClick={(e) => { if (elegido && !pasado && !(e.target as HTMLElement).closest('.step-card') && !(e.target as HTMLElement).closest('.compro-card')) colocar(elegido, dsoltar); }}>
                      
                      {(franja !== 'cualquiera' || items.length > 0 || dm.habitos[franja] > 0) && (
                        <div className="flex items-center justify-between mb-1">
                          <div className={`flex items-center gap-1.5 text-[12px] font-bold${colorFranja(franja)}`}>
                            {iconForFranja(franja)}
                            {franja === 'manana' ? 'Mañana' : franja === 'tarde' ? 'Tarde' : franja === 'noche' ? 'Noche' : 'Cualquier momento'}
                          </div>
                          {dm.habitos[franja] > 0 && <span className="text-[11px] text-text-muted">{dm.habitos[franja]} {dm.habitos[franja] === 1 ? 'hábito' : 'hábitos'}</span>}
                        </div>
                      )}
                      
                      {items.map(it => {
                        const isElegido = elegido && idDe(elegido) === (it.tipo === 'paso' ? it.dato.paso.id : (it.dato as Compromiso).id);
                        const isFantasma = arrastre && idDe(arrastre.item) === (it.tipo === 'paso' ? it.dato.paso.id : (it.dato as Compromiso).id);
                        const comun = `mt-1 transition-all ${isElegido ? 'ring-2 ring-text' : ''} ${isFantasma ? 'opacity-50' : ''}`;
                        
                        if (it.tipo === 'paso') {
                          const movible = !pasado && !it.dato.paso.hecha;
                          return (
                            <div key={`p-${it.dato.paso.id}`}
                              className={`step-card rounded-lg bg-surface-raised p-2 flex flex-col gap-2 ${comun} ${pasado ? 'bg-transparent border border-line p-1.5' : ''}`}
                              {...(movible ? { ...asa({ tipo: 'paso', tareaId: it.dato.tareaId, paso: it.dato.paso }), role: 'button', tabIndex: 0, 'aria-label': `${it.dato.paso.texto}, de ${it.dato.tareaNombre}. Mover a otro día` } : {})}>
                              <span className="text-[13px] font-semibold leading-tight break-words whitespace-normal" style={it.dato.paso.hecha ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : undefined}>{it.dato.paso.texto}</span>
                              <div className="flex items-center gap-2">
                                <Casilla paso={it.dato.paso} onToggle={() => toggleSubtarea(it.dato.tareaId, it.dato.paso.id)} />
                                <span className="text-[12px] text-text-muted flex-1 min-w-0 leading-tight break-words">{it.dato.tareaNombre}{it.dato.atraso ? ` · ${it.dato.atraso}` : ''}</span>
                              </div>
                            </div>
                          );
                        } else {
                          const c = it.dato as Compromiso;
                          const movible = !pasado;
                          return (
                            <div key={`c-${c.id}`}
                              className={`compro-card rounded-lg border border-line-strong p-2 flex flex-col gap-1 ${comun} ${pasado ? 'opacity-60' : ''}`}
                              {...(movible ? { ...asa({ tipo: 'compromiso', dato: c, fechaOriginal: f }), role: 'button', tabIndex: 0, 'aria-label': `Compromiso: ${c.titulo}` } : { onClick: () => onEditarCompromiso(c), role: 'button', tabIndex: 0 })}>
                              <div className="flex items-center gap-1.5 text-[14px] font-heading font-bold text-text">
                                <Clock size={14} />
                                {c.hora ? textoHora(c.hora) : 'Sin hora'}
                              </div>
                              <span className="text-[13px] font-semibold leading-tight break-words whitespace-normal">{c.titulo}</span>
                              {c.repetirSemanal && (
                                <div className="flex items-center gap-1 text-[11px] text-text-muted mt-1">
                                  <Repeat size={12} />
                                  cada semana
                                </div>
                              )}
                            </div>
                          );
                        }
                      })}
                      
                      {items.length === 0 && <div className="h-2" />}
                      {!pasado && sobre === dsoltar && <div className="text-[11px] py-1 text-center font-bold text-text-muted bg-surface-raised rounded-md mt-1">Suéltalo aquí</div>}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>

      {arrastre && (
        <div className="tsghost absolute pointer-events-none bg-surface border border-line shadow-lg p-3 rounded-xl text-[13px] font-bold z-50 text-text" style={{ left: arrastre.x + 14, top: arrastre.y + 10, maxWidth: 200 }} aria-hidden="true">
          {textoDe(arrastre.item)}
        </div>
      )}
    </>
  );
};
