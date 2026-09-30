import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { pendientesParaDificil } from '../../utils/dificilUtils';
import { getTodayString } from '../../utils/habitUtils';
import { getMomentoColorTokens } from '../common/HabitPreviewRow';

export const HojaDificil: React.FC = () => {
  const { verDificil, cerrarDificil, habitosActivos, registros, activarDiaDificil, esDificilHoy, quitarDiaDificil } = useHabitStore();
  const hoy = getTodayString();

  const [minimos, setMinimos] = useState<Record<string, string>>({});
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const volverA = useRef<HTMLElement | null>(null);

  // Inicializar con la mínima guardada (solo una vez al abrir)
  const faltan = pendientesParaDificil(habitosActivos, registros, hoy);
  const faltanRef = useRef(faltan);
  faltanRef.current = faltan;

  useEffect(() => {
    if (verDificil) {
      volverA.current = document.activeElement as HTMLElement | null;
      cerrarRef.current?.focus();
      const iniciales: Record<string, string> = {};
      faltanRef.current.forEach((h) => {
        iniciales[h.id] = h.minimo || '';
      });
      setMinimos(iniciales);
    } else if (volverA.current) {
      if (document.body.contains(volverA.current)) volverA.current.focus();
      volverA.current = null;
    }
  }, [verDificil]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && verDificil) cerrarDificil(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [verDificil, cerrarDificil]);

  if (!verDificil) return null;

  const onActivar = () => {
    activarDiaDificil(minimos);
    cerrarDificil();
  };

  const onQuitar = () => {
    quitarDiaDificil();
    cerrarDificil();
  };

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={cerrarDificil} aria-hidden="true" />
      <div className="tsheet hcomp" role="dialog" aria-modal="true" aria-labelledby="hd-t">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="hd-t">Día difícil</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>Hoy basta con lo mínimo.</p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={cerrarDificil}><X size={16} /></button>
        </div>

        <div className="ddcuerpo">
          <p className="ddtxt" style={{ marginTop: 0 }}>
            Haz la versión más pequeña de cada hábito. <b>Cuenta como cumplido.</b> Cada uno suma 5 puntos.
          </p>
          <p className="tsem-l">Lo mínimo de hoy</p>
          <p className="ddnota" id="dd-ayuda" style={{ margin: '-4px 0 4px' }}>
            Se guarda para el próximo día difícil. Si dejas uno vacío, ese hábito se hace completo, como siempre.
          </p>

          {faltan.map((h) => (
            <div key={h.id} className="ddfila">
              <span className={`ic ${getMomentoColorTokens(h.momento).bg} ${getMomentoColorTokens(h.momento).icon}`} aria-hidden="true">
                <HabitIcon name={h.icono} size={18} />
              </span>
              <b>{h.nombre}</b>
              <label>
                <span>Mínimo:</span>
                <input
                  aria-label={`Mínimo de ${h.nombre}`}
                  aria-describedby="dd-ayuda"
                  maxLength={60}
                  value={minimos[h.id] !== undefined ? minimos[h.id] : h.minimo || ''}
                  onChange={(e) => setMinimos({ ...minimos, [h.id]: e.target.value })}
                  placeholder="lo más pequeño"
                />
              </label>
            </div>
          ))}
        </div>

        <div className="t4pie ddpie">
          {esDificilHoy ? (
            <>
              <button type="button" className="ddno" onClick={onQuitar}>Quitar día difícil</button>
              <button type="button" className="btnp sm" onClick={onActivar}>Guardar</button>
            </>
          ) : (
            <>
              <button type="button" className="ddno" onClick={cerrarDificil}>Ahora no</button>
              <button type="button" className="btnp sm" onClick={onActivar}>Activar día difícil</button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
