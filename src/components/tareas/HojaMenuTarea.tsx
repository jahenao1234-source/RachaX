import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil, ArrowUpDown, Trash2 } from 'lucide-react';
import { Tarea } from '../../types';
import { avanceTarea } from '../../utils/tareasUtils';

export const HojaMenuTarea: React.FC<{
  tarea: Tarea;
  puedeMover: boolean;
  onEditar: () => void;
  onMover: () => void;
  onBorrar: () => void;
  onCerrar: () => void;
}> = ({ tarea, puedeMover, onEditar, onMover, onBorrar, onCerrar }) => {
  const { hechos, total } = avanceTarea(tarea);
  const primerRef = useRef<HTMLButtonElement>(null);
  
  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar.current(); };
    document.addEventListener('keydown', onKey);
    primerRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={onCerrar} aria-hidden="true" />
      <div className="tsheet" role="dialog" aria-modal="true" aria-labelledby="tmenut">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="tmenut">{tarea.nombre}</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>{hechos} de {total} pasos</p>
          </div>
          <button type="button" className="closeb" aria-label="Cerrar" onClick={onCerrar}><X size={16} /></button>
        </div>
        <div className="tmenu">
          <button type="button" ref={primerRef} onClick={() => { onCerrar(); onEditar(); }}>
            <Pencil size={20} />
            <div className="flex flex-col items-start gap-[1px]">
              <span>Editar tarea</span>
              <span className="t3ayuda">El nombre, el ícono y los pasos</span>
            </div>
          </button>
          {puedeMover && (
            <button type="button" onClick={() => { onCerrar(); onMover(); }}>
              <ArrowUpDown size={20} />
              <div className="flex flex-col items-start gap-[1px]">
                <span>Cambiar de lugar</span>
                <span className="t3ayuda">Súbela o bájala en la lista</span>
              </div>
            </button>
          )}
          <button type="button" onClick={() => { onCerrar(); onBorrar(); }}>
            <Trash2 size={20} />
            <span>Borrar tarea</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
