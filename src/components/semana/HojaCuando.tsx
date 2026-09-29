import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar } from 'lucide-react';
import { formatDateToString, parseDateString } from '../../utils/habitUtils';
import { Subtarea } from '../../types';
import { CalendarioMes } from '../common/CalendarioMes';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "a hoy", "a mañana" o "al sábado 26" (para el aviso de Deshacer). */
const textoA = (fecha: string | undefined, hoy: string) => {
  if (!fecha) return 'a ningún día';
  if (fecha === hoy) return 'a hoy';
  if (fecha === sumarDias(hoy, 1)) return 'a mañana';
  const d = parseDateString(fecha);
  return `al ${DIAS[d.getDay()]} ${d.getDate()}`;
};

const sumarDias = (fecha: string, n: number) => {
  const d = parseDateString(fecha);
  d.setDate(d.getDate() + n);
  return formatDateToString(d);
};

export const HojaCuando: React.FC<{
  tareaId: string;
  paso: Subtarea;
  tareaNombre: string;
  ruta: string[];
  hoy: string;
  diaInicial?: string;
  onCerrar: () => void;
  onHecho: (texto: string, deshacer: () => void) => void;
  ponerFechaPaso: (tareaId: string, pasoId: string, fecha?: string, momento?: 'manana'|'tarde'|'noche'|null) => void;
}> = ({ tareaId, paso, tareaNombre, ruta, hoy, diaInicial, onCerrar, onHecho, ponerFechaPaso }) => {
  const [fecha, setFecha] = useState<string | undefined>(paso.fecha ?? (diaInicial && diaInicial >= hoy ? diaInicial : hoy));
  const [momento, setMomento] = useState<'cualquiera'|'manana'|'tarde'|'noche'>(paso.momento ?? 'cualquiera');
  const [verCalendario, setVerCalendario] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar.current(); };
    document.addEventListener('keydown', onKey);
    cerrarRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const antes = useRef({ fecha: paso.fecha, momento: paso.momento });

  const manana = sumarDias(hoy, 1);
  const otros = [2, 3, 4, 5, 6, 7].map((n) => sumarDias(hoy, n));

  const fila = (valor: string, titulo: string) => {
    const d = parseDateString(valor);
    const on = fecha === valor;
    return (
      <button key={valor} type="button" role="radio" aria-checked={on} onClick={() => setFecha(valor)}
        aria-label={valor === hoy ? 'hoy' : `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`}
        style={on ? { borderColor: 'var(--text)', borderWidth: 2, background: 'var(--surface-raised)' } : undefined}
        className="w-full min-h-[56px] flex flex-col items-center justify-center gap-[1px] rounded-xl border border-line-strong bg-surface text-[12px] text-text-muted">
        {valor === hoy ? <span>hoy</span> : <span>{DIAS_CORTOS[d.getDay()]}</span>}
        <b className="text-[18px] text-text">{d.getDate()}</b>
      </button>
    );
  };

  const cambioAlgo = fecha !== paso.fecha || (momento === 'cualquiera' ? null : momento) !== (paso.momento ?? null);

  const guardar = () => {
    if (!cambioAlgo) return;
    ponerFechaPaso(tareaId, paso.id, fecha, momento === 'cualquiera' ? null : momento);
    const deshacer = () => ponerFechaPaso(tareaId, paso.id, antes.current.fecha, antes.current.momento ?? null);
    const nomMomento = momento === 'manana' ? 'mañana' : momento;
    onHecho(`${paso.texto} pasó ${textoA(fecha, hoy)}${momento !== 'cualquiera' ? ` en la ${nomMomento}` : ''}`, deshacer);
    onCerrar();
  };

  const dejarSinDia = () => {
    ponerFechaPaso(tareaId, paso.id, undefined);
    const deshacer = () => ponerFechaPaso(tareaId, paso.id, antes.current.fecha, antes.current.momento ?? null);
    onHecho(`Le quitaste el día a ${paso.texto}`, deshacer);
    onCerrar();
  };
  const enFila = !!fecha && [hoy, manana, ...otros.slice(0, 4)].includes(fecha);
  const fMas = fecha && !enFila ? parseDateString(fecha) : null;


  const subtitulo = `${paso.texto} · ${tareaNombre}${ruta.length ? ' › ' + ruta.join(' › ') : ''}`;

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={onCerrar} aria-hidden="true" />
      <div className="tsheet" role="dialog" aria-modal="true" aria-labelledby="hc-t">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="hc-t">¿Cuándo lo haces?</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>{subtitulo}</p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={onCerrar}><X size={16} /></button>
        </div>
        
        <div>
          <p className="text-[13px] font-semibold text-text-muted mt-[14px] mb-[8px]">Día</p>
          <div className="grid grid-cols-7 gap-[6px]" role="radiogroup" aria-label="Día">
            {fila(hoy, 'Hoy')}
            {fila(manana, 'Mañana')}
            {otros.slice(0, 4).map((v) => fila(v, 'Otro'))}
            <button
              type="button"
              aria-expanded={verCalendario}
              aria-label="Elegir otro día en el calendario"
              onClick={() => setVerCalendario(!verCalendario)}
              style={verCalendario || fMas ? { borderColor: 'var(--text)', borderWidth: 2, background: fMas ? 'var(--surface-raised)' : undefined } : undefined}
              className="w-full min-h-[56px] flex flex-col items-center justify-center gap-[1px] rounded-xl border border-line-strong bg-surface text-[12px] text-text-muted transition-colors">
              {fMas ? <>
                <span>{DIAS_CORTOS[fMas.getDay()]}</span>
                <b className="text-[18px] text-text leading-none my-[1px]">{fMas.getDate()}</b>
                <span className="text-[11px] leading-none">{MESES[fMas.getMonth()].slice(0,3)}</span>
              </> : <><Calendar size={18} aria-hidden="true" /><span>Más</span></>}
            </button>
          </div>
          {verCalendario && (
            <CalendarioMes 
              min={hoy}
              valor={fecha}
              onElegir={(f) => {
                setFecha(f);
                setVerCalendario(false);
              }}
            />
          )}

          <p className="text-[13px] font-semibold text-text-muted mt-[14px] mb-[8px]">Momento</p>
          <div className="grid grid-cols-4 gap-[3px] p-[3px] rounded-xl border border-line bg-surface" role="radiogroup" aria-label="Momento">
            {(['cualquiera', 'manana', 'tarde', 'noche'] as const).map(m => {
              const on = momento === m;
              return (
                <button key={m} type="button" role="radio" aria-checked={on} onClick={() => setMomento(m)}
                  className={`min-h-[44px] border-none rounded-[9px] text-[13px] font-bold ${on ? 'bg-surface-raised text-text' : 'bg-transparent text-text-muted'}`}>
                  {m === 'cualquiera' ? 'Cualquiera' : m === 'manana' ? 'Mañana' : m === 'tarde' ? 'Tarde' : 'Noche'}
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-[10px] mt-[18px]">
            {paso.fecha && (
              <button type="button" className="flex-1 min-h-[48px] rounded-[12px] border border-line-strong bg-transparent text-text-muted font-bold text-[15px]"
                onClick={dejarSinDia}>
                Dejar sin día
              </button>
            )}
            <button type="button" disabled={!cambioAlgo} onClick={guardar}
              className="btnp flex-1" style={{ marginTop: 0 }}>
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
