import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CajasResult, useHabitStore } from '../../store/HabitContext';
import { CajaArte, LlamaRara, nombreLlama } from './Llama';
import { CajaSorpresaSheet } from './CajaSorpresaSheet';

interface CajaResultSheetProps {
  resultado: CajasResult;
  onClose: () => void;
}

export const CajaResultSheet: React.FC<CajaResultSheetProps> = ({ resultado, onClose }) => {
  const { setCompanera } = useHabitStore();
  const [step, setStep] = useState<'rara' | 'puntos' | 'info'>(resultado.raras.length > 0 ? 'rara' : 'puntos');
  const [currentRaraIdx, setCurrentRaraIdx] = useState(0);

  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    if (titleRef.current) {
      titleRef.current.focus();
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [step, currentRaraIdx]);

  const handleClose = () => {
    if (step === 'info') {
      setStep(resultado.puntos > 0 ? 'puntos' : 'rara'); // returning from info goes back
      return;
    }
    if (step === 'rara') {
      if (currentRaraIdx + 1 < resultado.raras.length) {
        setCurrentRaraIdx(idx => idx + 1);
      } else if (resultado.puntos > 0) {
        setStep('puntos');
      } else {
        onClose();
      }
      return;
    }
    onClose();
  };

  const handleElegirLlama = (raraId: string) => {
    setCompanera(raraId);
    handleClose();
  };

  if (step === 'info') {
    return <CajaSorpresaSheet onClose={() => setStep(resultado.puntos > 0 ? 'puntos' : 'rara')} />;
  }

  if (step === 'rara') {
    const raraId = resultado.raras[currentRaraIdx];
    const name = nombreLlama(raraId);
    return createPortal(
      <>
        <div className="scrim" onClick={handleClose} />
        <section 
          className="sheet celeb animate-slideUp" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="ce_rara" 
          aria-describedby="cd_rara"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grab" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
            <button className="x" aria-label="Cerrar" onClick={handleClose}>
              <X size={20} strokeWidth={2.4} />
            </button>
          </div>
          <div className="celebody">
            <div className="hero">
              <LlamaRara id={raraId.replace('rara_', '')} size={120} />
            </div>
            <p className="rarelbl">Llama rara</p>
            <h2 className="cond celebt" id="ce_rara" tabIndex={-1} ref={titleRef} style={{ marginTop: 0 }}>
              {name}
            </h2>
            <p className="celebs" id="cd_rara">
              Tu caja trajo una llama rara. Es tuya para siempre.
            </p>
            <button className="btnp full" onClick={() => handleElegirLlama(raraId)}>
              Elegirla como tu llama
            </button>
            <button className="link quiet center mt-2" onClick={handleClose}>
              Guardarla en la colección
            </button>
          </div>
        </section>
      </>,
      document.body
    );
  }

  // Puntos step
  const hadRaras = resultado.raras.length > 0;
  const n = resultado.cajas;
  
  let titulo = "";
  let subtitulo = "";
  if (hadRaras) {
    if (n === 2) {
      titulo = `La otra caja trajo +${resultado.puntos} puntos`;
    } else {
      titulo = `Las otras ${n - resultado.raras.length} cajas trajeron +${resultado.puntos} puntos`;
    }
    subtitulo = "Un extra, además de los premios que ya ganaste."; // It's plural
  } else {
    titulo = n === 1 ? `Tu caja trajo +${resultado.puntos} puntos` : `Tus ${n} cajas trajeron +${resultado.puntos} puntos`;
    subtitulo = n === 1 ? "Un extra, además del premio que ya ganaste." : "Un extra, además de los premios que ya ganaste.";
  }

  return createPortal(
    <>
      <div className="scrim" onClick={handleClose} />
      <section 
        className="sheet celeb animate-slideUp" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="ce_puntos" 
        aria-describedby="cd_puntos"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grab" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
          <button className="x" aria-label="Cerrar" onClick={handleClose}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>
        <div className="celebody">
          <div className="hero">
            <CajaArte size={120} abierta />
          </div>
          <h2 className="cond celebt" id="ce_puntos" tabIndex={-1} ref={titleRef}>
            {titulo}
          </h2>
          <p className="celebs" id="cd_puntos">
            {subtitulo}
          </p>
          <button className="btnp full" onClick={handleClose}>
            Seguir
          </button>
          <button className="link quiet center mt-2" onClick={() => setStep('info')}>
            ¿Cómo funcionan las cajas?
          </button>
        </div>
      </section>
    </>,
    document.body
  );
};
