import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';

interface CajaSorpresaSheetProps {
  onClose: () => void;
}

export const CajaSorpresaSheet: React.FC<CajaSorpresaSheetProps> = ({ onClose }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { llamasGanadas } = useHabitStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    if (titleRef.current) {
      titleRef.current.focus();
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const numRaras = Object.keys(llamasGanadas).filter(k => k.startsWith('rara_')).length;
  const todasRaras = numRaras >= 10;

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <section 
        className="sheet animate-slideUp" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="css_title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grab" />
        <div className="shead" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 className="cond flex-1 text-[22px] m-0" id="css_title" tabIndex={-1} ref={titleRef}>
            QUÉ TRAE LA CAJA SORPRESA
          </h2>
          <button className="x" aria-label="Cerrar" onClick={onClose}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>
        <div className="slist pb-6" style={{ overflowY: 'auto' }}>
          <p className="celebs text-left" style={{ margin: '0 0 12px' }}>
            Algo para ti. Y es un extra: el premio del reto o de la insignia ya lo tienes.
          </p>
          <ul className="odds">
            {todasRaras ? (
              <li>
                <span className="oddk" style={{ flex: '0 0 104px' }}>Siempre</span>
                <span>Entre +10 y +50 puntos. Ya tienes todas las raras.</span>
              </li>
            ) : (
              <>
                <li>
                  <span className="oddk" style={{ flex: '0 0 104px' }}>19 de cada 20</span>
                  <span>Entre +10 y +50 puntos.</span>
                </li>
                <li>
                  <span className="oddk" style={{ flex: '0 0 104px' }}>1 de cada 20</span>
                  <span>Una llama rara para tu colección. Si en 15 cajas no te sale ninguna, la 15 la trae. Nunca se repiten.</span>
                </li>
              </>
            )}
          </ul>
          <p className="sub" style={{ marginTop: '16px' }}>
            Las cajas se ganan con retos e insignias. Nunca se compran.
          </p>
        </div>
      </section>
    </>,
    document.body
  );
};
