import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Calendar } from 'lucide-react';
import { formatDateToString, parseDateString } from '../../utils/habitUtils';
import { CalendarioMes } from '../common/CalendarioMes';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const sumarDias = (fecha: string, n: number) => {
  const d = parseDateString(fecha);
  d.setDate(d.getDate() + n);
  return formatDateToString(d);
};

/** Hoja "¿Qué día lo haces?" (DESIGN.md › Tareas). Guarda al tocar. */
export const HojaDiaPaso: React.FC<{
  pasoTexto: string;
  tareaNombre: string;
  fecha?: string;
  hoy: string;
  onElegir: (fecha?: string) => void;
  onCerrar: () => void;
}> = ({ pasoTexto, tareaNombre, fecha, hoy, onElegir, onCerrar }) => {
  const [verCalendario, setVerCalendario] = React.useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar.current(); };
    document.addEventListener('keydown', onKey);
    cerrarRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const manana = sumarDias(hoy, 1);
  const otros = [2, 3, 4, 5, 6, 7].map((n) => sumarDias(hoy, n));
  const fila = (valor: string, titulo: string) => {
    const d = parseDateString(valor);
    const on = fecha === valor;
    return (
      <button type="button" role="radio" aria-checked={on} className={`topt${on ? ' on' : ''}`} onClick={() => onElegir(valor)}>
        <span>{titulo}</span>
        <span className="sub">{DIAS[d.getDay()]} {d.getDate()}</span>
        {on ? <Check size={18} strokeWidth={2.6} /> : <span />}
      </button>
    );
  };

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={onCerrar} aria-hidden="true" />
      <div className="tsheet" role="dialog" aria-modal="true" aria-labelledby="tdh">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="tdh">¿Qué día lo haces?</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>{pasoTexto} · {tareaNombre}</p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={onCerrar}><X size={16} /></button>
        </div>
        <div role="radiogroup" aria-labelledby="tdh">
          {fila(hoy, 'Hoy')}
          {fila(manana, 'Mañana')}
          <p className="tsem-l">Otro día</p>
          <div className="tsem">
            {otros.map((v) => {
              const d = parseDateString(v);
              const on = fecha === v;
              return (
                <button key={v} type="button" role="radio" aria-checked={on} onClick={() => onElegir(v)}
                  aria-label={`${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`}
                  style={on ? { borderColor: 'var(--text)', borderWidth: 1.5 } : undefined}>
                  <span>{DIAS_CORTOS[d.getDay()]}</span><b className="num">{d.getDate()}</b>
                </button>
              );
            })}
            <button type="button" aria-expanded={verCalendario} aria-label="Elegir otro día en el calendario" onClick={() => setVerCalendario(!verCalendario)}
              style={verCalendario ? { borderColor: 'var(--text)', borderWidth: 2 } : undefined}>
              <Calendar size={18} /><span>Más</span>
            </button>
          </div>
          {verCalendario && (
            <CalendarioMes 
              min={hoy}
              valor={fecha}
              onElegir={onElegir}
            />
          )}
        </div>
        {fecha && <button type="button" className="tquitar" onClick={() => onElegir(undefined)}>Quitar el día</button>}
      </div>
    </div>,
    document.body
  );
};
