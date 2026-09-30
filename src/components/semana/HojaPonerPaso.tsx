import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarPlus, Clock, ChevronDown } from 'lucide-react';
import { GrupoSinDia, textoPasosSinDia, diaLargo } from '../../utils/semanaUtils';
import { HabitIcon } from '../common/HabitIcon';

export const HojaPonerPaso: React.FC<{
  diaCorto: string; // ej. "sábado 26"
  fecha: string;
  pasosSinDia: GrupoSinDia[];
  onElegir: (tareaId: string, pasoId: string, fecha: string) => void;
  onCerrar: () => void;
  onIrATareas: () => void;
  /** Si viene, el título es este ("Lun 28 en la tarde") y arriba sale "Un compromiso". */
  titulo?: string;
  franjaStr?: string;
  onCompromiso?: () => void;
}> = ({ diaCorto, fecha, pasosSinDia, onElegir, onCerrar, onIrATareas, titulo, franjaStr, onCompromiso }) => {
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const [abiertas, setAbiertas] = React.useState<Set<string>>(() => new Set(pasosSinDia.length === 1 ? [pasosSinDia[0].tareaId] : []));

  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar.current(); };
    document.addEventListener('keydown', onKey);
    cerrarRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={onCerrar} aria-hidden="true" />
      <div className="tsheet" role="dialog" aria-modal="true" aria-labelledby="hpp">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="hpp">{titulo ?? `¿Qué haces el ${diaCorto}?`}</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>
              {pasosSinDia.length > 0 ? (franjaStr ? `Toca un paso para hacerlo el ${diaLargo(fecha).toLowerCase().split(' ')[0]} en la ${franjaStr}.` : "Toca un paso para ponerlo ese día.") : "No tienes pasos sin día. Agrégalos en Tareas."}
            </p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={onCerrar}><X size={16} /></button>
        </div>
        
        {onCompromiso && (
          <div className="tmenu" style={{ marginTop: 8 }}>
            <button type="button" onClick={onCompromiso}>
              <Clock size={20} />
              <span className="flex-1 text-left">Un compromiso<span className="t3ayuda">Una reunión, una cita, una clase</span></span>
            </button>
          </div>
        )}
        {onCompromiso && pasosSinDia.length > 0 && <p className="s4lbl">O ponle un paso de tus tareas</p>}
        {pasosSinDia.length > 0 ? (
          <div className="panel-sin-dia w-full px-1">
            {pasosSinDia.map(g => {
              const abierta = abiertas.has(g.tareaId);
              const alternar = () => {
                const next = new Set(abiertas);
                if (next.has(g.tareaId)) next.delete(g.tareaId);
                else next.add(g.tareaId);
                setAbiertas(next);
              };
              return (
                <div key={g.tareaId} className="s4grp" role="group" aria-label={g.tareaNombre}>
                  <h3 className="s4grp-t">
                    <button type="button" className="s4grp-h" aria-expanded={abierta} onClick={alternar}>
                      <span className="ic" aria-hidden="true"><HabitIcon name={g.tareaIcono || 'ListChecks'} size={16} /></span>
                      <b>{g.tareaNombre}</b>
                      <span>{textoPasosSinDia(g.pasos.length)}</span>
                      <i className="chev" aria-hidden="true"><ChevronDown size={20} /></i>
                    </button>
                  </h3>
                  {abierta && (
                    <>
                      {g.ramas.map((rama, ri) => {
                        const sub = rama.ruta.length > 0;
                        return (
                          <div key={ri} className={sub ? 'tsrama' : undefined}>
                            {sub && <p className="tsrama-h">{rama.ruta.join(' › ')}</p>}
                            <div className="tmenu">
                              {rama.pasos.map(p => (
                                <button key={p.id} type="button" aria-label={`${p.texto}${sub ? `, dentro de ${rama.ruta[rama.ruta.length - 1]}` : ''}`} onClick={() => onElegir(g.tareaId, p.id, fecha)}>
                                  <CalendarPlus size={18} />
                                  <span className="flex-1 text-left">{p.texto}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 pb-2">
            <button type="button" className="btnp full text-[15px]" onClick={() => { onCerrar(); onIrATareas(); }}>Ir a Tareas</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
