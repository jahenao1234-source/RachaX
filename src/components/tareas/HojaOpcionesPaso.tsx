import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Split, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Subtarea } from '../../types';
import { textoDiaLargo } from '../../utils/tareasUtils';


export const HojaOpcionesPaso: React.FC<{
  paso: Subtarea;
  tareaNombre: string;
  esGrande: boolean;
  hoy: string;
  onDividir: () => void;
  onDia: () => void;
  onTexto: () => void;
  onBorrar: () => void;
  onCerrar: () => void;
}> = ({ paso, tareaNombre, esGrande, hoy, onDividir, onDia, onTexto, onBorrar, onCerrar }) => {
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
      <div className="tsheet" role="dialog" aria-modal="true" aria-labelledby="topc">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="topc">{paso.texto}</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>{tareaNombre}</p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={onCerrar}><X size={16} /></button>
        </div>
        <div className="tmenu">
          <button type="button" onClick={() => { onCerrar(); onDividir(); }}>
            <Split size={20} />
            <div className="flex flex-col items-start gap-[1px]">
              <span>{esGrande ? 'Agregar un paso adentro' : 'Dividir en pasos más pequeños'}</span>
              {!esGrande && <span className="t3ayuda">Para partirlo en partes</span>}
            </div>
          </button>
          {!esGrande && (
            <button type="button" onClick={() => { onCerrar(); onDia(); }}>
              <Calendar size={20} />
              <div className="flex flex-col items-start gap-[1px]">
                <span>Cambiar el día</span>
                <span className="t3ayuda">{paso.fecha ? textoDiaLargo(paso.fecha, hoy) : 'Sin día'}</span>
              </div>
            </button>
          )}
          <button type="button" onClick={() => { onCerrar(); onTexto(); }}>
            <Pencil size={20} />
            <span>Cambiar el texto</span>
          </button>
          <button type="button" onClick={() => { onCerrar(); onBorrar(); }}>
            <Trash2 size={20} />
            <span>Borrar el paso</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
