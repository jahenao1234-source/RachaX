import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEsEscritorio } from '../screens/TodayScreen';
import { ResumenDiaCompleto } from '../../utils/diaCompleto';
import { useHabitStore } from '../../store/HabitContext';
import { LlamaDe } from './Llama';

interface DiaCompletoSheetProps {
  resumen: ResumenDiaCompleto;
  puntos: number;
  pasos: number;
  tambien: string | null;
  onSeguir: () => void;
}

export const DiaCompletoSheet: React.FC<DiaCompletoSheetProps> = ({
  resumen, puntos, pasos, tambien, onSeguir
}) => {
  const desk = useEsEscritorio();
  const { companera, etapaLlama } = useHabitStore();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Foco inicial
    if (btnRef.current) {
      btnRef.current.focus();
    }
  }, []);

  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const content = (
    <div className="flex flex-col items-center text-center">
      <div 
        className="mb-3"
        style={{
          animation: !isReducedMotion ? 'avivarLlama 400ms ease-out forwards' : 'none'
        }}
      >
        {/* La misma llama que Hoy muestra junto a la fecha */}
        <LlamaDe id={companera || `etapa_${etapaLlama}`} size={120} sola />
      </div>
      <h2 id="dc_title" className="font-heading font-bold text-[28px] leading-[1.05] m-0 text-text">
        Día completo
      </h2>
      <p className="font-heading font-bold text-[17px] text-ambar-text m-0 mt-1">
        {resumen.subtitulo}
      </p>
      <p id="dc_desc" className="text-[15px] text-text m-0 mt-2">
        {resumen.mensaje}
      </p>

      <dl className="w-full flex items-start justify-between border-y border-line py-3 px-0 mt-5 mb-4">
        <div className="flex-1 flex flex-col items-center">
          <dt className="text-[13px] font-semibold text-text-muted whitespace-nowrap">Ganaste</dt>
          <dd className="m-0 text-[13px] text-text-muted whitespace-nowrap mt-1 text-center">
            <b className="block font-heading font-bold text-[24px] tabular-nums text-ambar-text leading-none mb-0.5">+{puntos}</b>
            puntos
          </dd>
        </div>
        <div className="w-[1px] h-12 bg-line" aria-hidden="true" />
        <div className="flex-1 flex flex-col items-center">
          <dt className="text-[13px] font-semibold text-text-muted whitespace-nowrap">Hábitos</dt>
          <dd className="m-0 text-[13px] text-text-muted whitespace-nowrap mt-1 text-center">
            <b className="block font-heading font-bold text-[24px] tabular-nums text-text leading-none mb-0.5">{resumen.habitos} de {resumen.habitos}</b>
          </dd>
        </div>
        {pasos > 0 && (
          <>
            <div className="w-[1px] h-12 bg-line" aria-hidden="true" />
            <div className="flex-1 flex flex-col items-center">
              <dt className="text-[13px] font-semibold text-text-muted whitespace-nowrap">Pasos</dt>
              <dd className="m-0 text-[13px] text-text-muted whitespace-nowrap mt-1 text-center">
                <b className="block font-heading font-bold text-[24px] tabular-nums text-text leading-none mb-0.5">{pasos}</b>
                de tareas
              </dd>
            </div>
          </>
        )}
      </dl>

      <div className="w-full flex flex-col mb-4">
        <div className="flex items-center justify-between text-[13px] text-text-muted mb-2">
          <span>{resumen.mesNombre}</span>
          <span><b className="text-[15px] text-text font-number">{resumen.mes}</b> de {resumen.diasMes} días completos</span>
        </div>
        <div className="h-2 w-full rounded-full bg-track-empty overflow-hidden flex">
          <div 
            className="h-full rounded-full bg-ambar dc-bar-fill"
            style={{ width: `${(resumen.mes / Math.max(1, resumen.diasMes)) * 100}%` }}
          />
        </div>
      </div>

      {tambien && (
        <p className="text-[13px] text-text-muted w-full text-center mt-0 mb-4">
          {tambien}
        </p>
      )}

      <button 
        ref={btnRef}
        onClick={onSeguir} 
        className="w-full h-[48px] rounded-[14px] bg-ambar text-ink text-[16px] font-bold flex items-center justify-center mt-2 border-none active:scale-95 transition-transform"
      >
        Seguir
      </button>
    </div>
  );

  return createPortal(
    <>
      <style>{`
        @keyframes avivarLlama {
          0% { transform: scale(0.92); filter: brightness(0.8); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        html:not(.dark) .dc-bar-fill {
          background-color: var(--ambar-text) !important;
        }
      `}</style>
      <div className="scrim" onClick={onSeguir} />
      {desk ? (
        <section 
          className="fixed top-[90px] left-1/2 -translate-x-1/2 w-[460px] bg-bg rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] flex flex-col z-[100] border-none"
          role="dialog" aria-modal="true" aria-labelledby="dc_title" aria-describedby="dc_desc"
        >
          <div className="flex justify-end p-3">
            <button className="x" aria-label="Cerrar" onClick={onSeguir}><X size={20} strokeWidth={2.4} /></button>
          </div>
          <div className="px-6 pb-6 pt-0">
            {content}
          </div>
        </section>
      ) : (
        <section 
          className="sheet"
          role="dialog" aria-modal="true" aria-labelledby="dc_title" aria-describedby="dc_desc"
        >
          <div className="grab" />
          <div className="flex justify-end px-3 pt-2">
            <button className="x" aria-label="Cerrar" onClick={onSeguir}><X size={20} strokeWidth={2.4} /></button>
          </div>
          <div className="px-5 pb-5 overflow-y-auto">
            {content}
          </div>
        </section>
      )}
    </>,
    document.body
  );
};
