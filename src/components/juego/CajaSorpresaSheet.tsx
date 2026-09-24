import React from 'react';
import { createPortal } from "react-dom";
import { X } from 'lucide-react';

interface CajaSorpresaSheetProps {
  onClose: () => void;
}

export const CajaSorpresaSheet: React.FC<CajaSorpresaSheetProps> = ({ onClose }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <>
      {/* Higher z-index needed if it overlays the other sheet, but standard scrim works if managed by AppShell correctly */}
      <div className="scrim" style={{ zIndex: 110 }} onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="hc-title" style={{ zIndex: 111 }}>
        <div className="grab" />
        <div className="shead">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="cond" id="hc-title" style={{ margin: 0, fontSize: '24px' }}>
              Qué trae la caja sorpresa
            </h2>
          </div>
          <button className="x" aria-label="Cerrar" onClick={onClose}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>
        <div style={{ padding: '6px 20px 22px' }}>
          <ul className="odds" role="list">
            <li>
              <span className="oddk">Siempre</span>
              <span>El premio del reto. La caja es un extra, nunca lo reemplaza.</span>
            </li>
            <li>
              <span className="oddk">1 de cada 3</span>
              <span>Entre +10 y +50 puntos más.</span>
            </li>
            <li>
              <span className="oddk">1 de cada 20</span>
              <span>Una llama especial para tu colección.</span>
            </li>
          </ul>
          <p className="sub" style={{ marginTop: '12px' }}>
            La caja solo se gana cumpliendo retos. Nunca se compra.
          </p>
        </div>
      </section>
    </>,
    document.body
  );
};
