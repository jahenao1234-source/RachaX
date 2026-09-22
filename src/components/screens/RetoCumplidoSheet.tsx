import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';
import { Habito } from '../../types';
import { HabitPreviewRow } from '../common/HabitPreviewRow';
import { getTodayString } from '../../utils/habitUtils';

interface RetoCumplidoSheetProps {
  habito: Habito | null;
  onSiguienteNivel: (siguienteMeta: number) => void;
  onQuitarReto: () => void;
}

const calcularSemanasPasadas = (inicio: string, fin: string) => {
  const dInicio = new Date(inicio + 'T12:00:00');
  const dFin = new Date(fin + 'T12:00:00');
  const ms = dFin.getTime() - dInicio.getTime();
  const dias = Math.max(0, ms / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(dias / 7));
};

export const RetoCumplidoSheet: React.FC<RetoCumplidoSheetProps> = ({ habito, onSiguienteNivel, onQuitarReto }) => {
  if (!habito || !habito.reto) return null;

  const isSemanal = habito.frecuencia === 'semanal';
  const meta = habito.reto.meta;
  const unit = isSemanal ? 'semanas' : 'días';
  
  let siguienteMeta: number | null = null;
  if (!isSemanal) {
    if (meta === 7) siguienteMeta = 30;
    else if (meta === 30) siguienteMeta = 66;
  } else {
    if (meta === 4) siguienteMeta = 8;
    else if (meta === 8) siguienteMeta = 12;
  }

  const semanasPasadas = calcularSemanasPasadas(habito.reto.inicio, getTodayString());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto">
        {/* Velo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
        />

        {/* Sheet container */}
        <motion.section
          role="alertdialog"
          aria-label="Reto cumplido"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[600px] mx-auto bg-bg rounded-t-[22px] border-t border-line shadow-[0_-8px_24px_rgba(0,0,0,0.35)] flex flex-col max-h-[85vh]"
        >
          {/* Grab indicator */}
          <div className="w-10 h-[5px] rounded-full bg-line-strong mx-auto mt-2 shrink-0" />

          {/* Content */}
          <div className="p-5 pb-safe pt-4 flex flex-col overflow-y-auto">
            
            <div className="w-11 h-11 rounded-full bg-ambar text-ink flex items-center justify-center shrink-0 mb-3" aria-hidden="true">
              <Star size={24} strokeWidth={2.5} fill="currentColor" />
            </div>
            
            <h2 className="font-heading font-bold text-[28px] text-text mb-1 leading-tight">
              Reto cumplido: {meta} {unit}
            </h2>
            
            <p className="font-heading font-bold text-[17px] text-ambar-text mb-3">
              {meta} {unit} cumplid{isSemanal ? 'a' : 'o'}s en {semanasPasadas} semana{semanasPasadas !== 1 ? 's' : ''}
            </p>
            
            <p className="text-[15px] text-text-muted mb-5 leading-snug">
              No fue perfecto y no hacía falta: volviste cada vez. <b className="text-text font-semibold">{habito.nombre}</b> sigue en tu día como siempre.
            </p>

            <div className="mb-6">
              <HabitPreviewRow habito={habito} cumplido={true} retoProgreso={meta} />
            </div>

            {siguienteMeta ? (
              <>
                <button 
                  onClick={() => onSiguienteNivel(siguienteMeta!)}
                  className="w-full h-12 rounded-[12px] bg-ambar text-ink font-bold text-[15px] flex items-center justify-center transition-transform active:scale-[0.98]"
                >
                  Ir por {siguienteMeta} {unit}
                </button>
                <button 
                  onClick={onQuitarReto}
                  className="w-full h-11 mt-1 rounded-[12px] bg-transparent text-text font-semibold text-[15px] flex items-center justify-center transition-colors hover:bg-surface active:scale-[0.98]"
                >
                  Seguir sin reto
                </button>
              </>
            ) : (
              <button 
                onClick={onQuitarReto}
                className="w-full h-12 rounded-[12px] bg-ambar text-ink font-bold text-[15px] flex items-center justify-center transition-transform active:scale-[0.98]"
              >
                Seguir sin reto
              </button>
            )}
            
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
};
