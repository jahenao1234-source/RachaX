import React, { useState } from 'react';
import { createPortal } from "react-dom";
import { X, Gift, Sparkles, ChevronRight } from 'lucide-react';
import { RetoSemanal } from '../../types';

interface RetoSemanalSheetProps {
  reto: RetoSemanal;
  onClose: () => void;
  onAccept: (opcionId: string) => void;
  onSkip: () => void;
  onOpenCaja: () => void;
}

export const RetoSemanalSheet: React.FC<RetoSemanalSheetProps> = ({ reto, onClose, onAccept, onSkip, onOpenCaja }) => {
  const [selectedOpt, setSelectedOpt] = useState<string>(reto.opciones[0]?.id || '');

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="hr-title" aria-describedby="hr-desc">
        <div className="grab" />
        <div className="shead">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="cond" id="hr-title" style={{ margin: 0, fontSize: '24px' }}>
              Tu reto de la semana
            </h2>
            <p className="sub" id="hr-desc" style={{ marginTop: '2px' }}>
              Elige uno. Todos dan el mismo premio.
            </p>
          </div>
          <button className="x" aria-label="Cerrar" onClick={onClose}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>
        <div style={{ padding: '12px 20px 20px' }}>
          <fieldset className="opts">
            <legend className="sr">Opciones de reto</legend>
            {reto.opciones.map((opt) => (
              <label key={opt.id} className="opt2">
                <input
                  type="radio"
                  name="reto_opt"
                  checked={selectedOpt === opt.id}
                  onChange={() => setSelectedOpt(opt.id)}
                />
                <span className="optbox">
                  <span className="name" style={{ whiteSpace: 'normal' }}>
                    {opt.texto}
                  </span>
                  <span className="meta">{opt.metaTexto}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <p className="flabel" id="pr-title" style={{ margin: '14px 0 0' }}>
            Premio
          </p>
          <ul className="prize" role="list" aria-labelledby="pr-title">
            <li>
              <span className="cond">+50</span> puntos
            </li>
            <li>
              <Sparkles size={14} strokeWidth={2} style={{ marginRight: '6px' }} />1 comodín
            </li>
            <li className="giftli">
              <button className="giftbtn" aria-haspopup="dialog" onClick={onOpenCaja}>
                <Gift size={14} strokeWidth={2} style={{ marginRight: '6px' }} />
                caja sorpresa
                <ChevronRight size={13} strokeWidth={2} style={{ marginLeft: '4px', opacity: 0.7 }} />
              </button>
            </li>
          </ul>

          <button
            className="btnp full"
            style={{ marginTop: '16px' }}
            onClick={() => onAccept(selectedOpt)}
            disabled={!selectedOpt}
          >
            Acepto este reto
          </button>
          <button className="link quiet center" style={{ marginTop: '8px' }} onClick={onSkip}>
            Esta semana no
          </button>
        </div>
      </section>
    </>,
    document.body
  );
};
