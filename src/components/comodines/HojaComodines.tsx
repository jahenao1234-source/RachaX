import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, ChevronRight, X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { getTodayString } from '../../utils/habitUtils';
import {
  subtituloComodines, ayerSinMarcar, textoAyerSinMarcar, textoCongelarAyer, proximoComodin, usadosDelMes, pendientesParaDificil,
} from '../../utils/dificilUtils';
import { useEsEscritorio } from '../screens/TodayScreen';

export const HojaComodines: React.FC = () => {
  const {
    verComodines, cerrarComodines, comodines, habitosActivos, registros, diasCongelados, congeladosAuto, habitos,
    congelarDia, descongelarDia, navigateToTab, abrirDificil, esDificilHoy
  } = useHabitStore();
  const desk = useEsEscritorio();
  const hoy = getTodayString();

  const [aviso, setAviso] = useState<{ texto: string; fecha: string } | null>(null);
  const timerAviso = useRef<number | null>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const volverA = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (verComodines) {
      volverA.current = document.activeElement as HTMLElement | null;
      cerrarRef.current?.focus();
    } else {
      if (volverA.current && document.body.contains(volverA.current)) volverA.current.focus();
      volverA.current = null;
      setAviso(null);
      if (timerAviso.current) window.clearTimeout(timerAviso.current);
    }
  }, [verComodines]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && verComodines) cerrarComodines(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [verComodines, cerrarComodines]);

  useEffect(() => () => { if (timerAviso.current) window.clearTimeout(timerAviso.current); }, []);

  if (!verComodines) return null;

  const a = ayerSinMarcar(habitosActivos, registros, diasCongelados, hoy);
  const usados = usadosDelMes(diasCongelados, congeladosAuto, habitos, registros, hoy);
  const faltan = pendientesParaDificil(habitosActivos, registros, hoy);

  const onQuitar = (fecha: string, textoQuitar: string) => {
    descongelarDia(fecha);
    setAviso({ texto: `Quitaste el comodín del ${textoQuitar}.`, fecha });
    if (timerAviso.current) window.clearTimeout(timerAviso.current);
    timerAviso.current = window.setTimeout(() => setAviso(null), 6000);
  };

  const onDeshacer = () => {
    if (aviso) {
      congelarDia(aviso.fecha);
      setAviso(null);
      if (timerAviso.current) window.clearTimeout(timerAviso.current);
    }
  };

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={cerrarComodines} aria-hidden="true" />
      <div className={`tsheet${desk ? ' tventana' : ''}`} role="dialog" aria-modal="true" aria-labelledby="hc-t">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="hc-t">Tus comodines</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>{subtituloComodines(comodines)}</p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={cerrarComodines}><X size={16} /></button>
        </div>

        <div className="ddesc" role="img" aria-label={`${comodines} de 3 comodines`}>
          <i className={comodines > 0 ? '' : 'vacio'}><ShieldCheck size={24} /></i>
          <i className={comodines > 1 ? '' : 'vacio'}><ShieldCheck size={24} /></i>
          <i className={comodines > 2 ? '' : 'vacio'}><ShieldCheck size={24} /></i>
        </div>

        <p className="ddtxt">
          Un comodín congela un día que no pudiste: <b>ese día no cuenta como fallado.</b> Te llega uno cada mes y ganas más con los retos.
        </p>

        {a && comodines > 0 ? (
          <>
            <p className="ddnota" style={{ margin: '4px 0 10px' }}>{textoAyerSinMarcar(a)}</p>
            <button type="button" className="ddsec" onClick={() => congelarDia(a.fecha)}>
              <ShieldCheck size={16} />{textoCongelarAyer(comodines)}
            </button>
          </>
        ) : comodines === 0 ? (
          <p className="ddnota">Te llega uno nuevo {proximoComodin(hoy)}.</p>
        ) : null}

        <p className="tsem-l">Usados este mes</p>
        {usados.length > 0 ? (
          <div>{usados.map((u) => {
            // titulo es ej. "Viernes 25 de septiembre", sacar el minúscula para el aria-label y aviso
            // El title de utils es "Viernes 25 de septiembre", textoQuitar = "viernes 25"
            const textoQuitar = u.titulo.toLowerCase().replace(/ de .*$/, '');
            return (
              <div key={u.fecha} className="ddusado">
                <span>{u.titulo}<small>{u.detalle}</small></span>
                <button type="button" aria-label={`Quitar el comodín del ${textoQuitar}`} onClick={() => onQuitar(u.fecha, textoQuitar)}>
                  Quitar
                </button>
              </div>
            );
          })}</div>
        ) : (
          <p className="ddnota">Todavía no usas ninguno este mes.</p>
        )}

        <p className="ddalt">
          Para congelar otro día, tócalo en el{' '}
          <button type="button" aria-label="Abrir el calendario" onClick={() => { cerrarComodines(); navigateToTab('calendario'); }}>
            calendario<ChevronRight size={14} />
          </button>
        </p>

        {!esDificilHoy && faltan.length > 0 && (
          <p className="ddalt" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
            ¿Hoy es un día pesado?{' '}
            <button type="button" onClick={() => { cerrarComodines(); abrirDificil(); }}>
              Un día difícil también cuenta<ChevronRight size={14} />
            </button>
          </p>
        )}

        {aviso && (
          <div className="ttoast" role="status">
            <span>{aviso.texto}</span>
            <button type="button" onClick={onDeshacer}>Deshacer</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
