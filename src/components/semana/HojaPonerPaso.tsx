import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarPlus, Clock } from 'lucide-react';
import { GrupoSinDia } from '../../utils/semanaUtils';
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
  onCompromiso?: () => void;
}> = ({ diaCorto, fecha, pasosSinDia, onElegir, onCerrar, onIrATareas, titulo, onCompromiso }) => {
  const cerrarRef = useRef<HTMLButtonElement>(null);

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
              {pasosSinDia.length > 0 ? "Toca un paso para ponerlo ese día." : "No tienes pasos sin día. Agrégalos en Tareas."}
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
        {onCompromiso && pasosSinDia.length > 0 && <p className="text-[13px] font-bold text-text-muted" style={{ margin: '14px 0 0' }}>O ponle un paso de tus tareas</p>}
        {pasosSinDia.length > 0 ? (
          <div className="panel-sin-dia w-full px-1">
            {pasosSinDia.map(g => (
              <div key={g.tareaId} className="panel-hab-grp mt-4">
                <div className="panel-hab-name mb-1 flex items-center gap-2 text-[13px] font-bold text-text-muted">
                  <div className="w-6 h-6 rounded-md bg-surface-raised flex items-center justify-center text-text">
                    <HabitIcon name={g.tareaIcono} size={14} />
                  </div>
                  {g.tareaNombre}
                </div>
                {/* Pasos pequeños bajo el camino de su paso grande */}
                {g.ramas.map((rama, ri) => (
                  <div key={ri} className={rama.ruta.length ? 'tsrama' : undefined}>
                    {rama.ruta.length > 0 && <p className="tsrama-h">{rama.ruta.join(' › ')}</p>}
                    <div className="tmenu">
                      {rama.pasos.map(p => (
                        <button key={p.id} type="button" onClick={() => onElegir(g.tareaId, p.id, fecha)}>
                          <CalendarPlus size={18} />
                          <span className="flex-1 text-left">{p.texto}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
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
