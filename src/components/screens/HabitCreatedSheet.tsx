import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { Habito, MOMENTOS } from '../../types';
import { HabitPreviewRow, getMomentoColorTokens } from '../common/HabitPreviewRow';
import { HabitIcon } from '../common/HabitIcon';

interface HabitCreatedSheetProps {
  habito: Habito | null;
  onViewToday: () => void;
  onCreateAnother: () => void;
}

export const HabitCreatedSheet: React.FC<HabitCreatedSheetProps> = ({ habito, onViewToday, onCreateAnother }) => {
  if (!habito) return null;

  const momentoObj = MOMENTOS.find(m => m.id === (habito.momento || 'flexible'));
  const momentoLabel = momentoObj?.label === 'Todo el día' ? 'Todo el día' : (momentoObj?.label || 'Todo el día');
  const tokens = getMomentoColorTokens(habito.momento);
  const iconName = momentoObj?.icono || 'Sun';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto">
        {/* Velo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onViewToday}
        />

        {/* Sheet container */}
        <motion.section
          role="alertdialog"
          aria-label="Hábito creado"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[600px] mx-auto bg-bg rounded-t-[22px] border-t border-line shadow-[0_-8px_24px_rgba(0,0,0,0.35)] flex flex-col max-h-[85vh]"
        >
          {/* Grab indicator */}
          <div className="w-10 h-[5px] rounded-full bg-line-strong mx-auto mt-2 shrink-0" />

          {/* Content */}
          <div className="p-5 pb-safe pt-3 flex flex-col overflow-y-auto">
            <div className="w-11 h-11 rounded-full bg-ambar text-ink flex items-center justify-center shrink-0 mb-3" aria-hidden="true">
              <Check size={22} strokeWidth={3} />
            </div>
            
            <h2 className="font-heading font-bold text-2xl text-text mb-1">
              Listo, ya está en tu día
            </h2>
            
            <p className="text-[15px] text-text-muted mb-4 leading-snug">
              Lo verás en <b className="text-text font-semibold">{momentoLabel}</b>
              {habito.anclaje && (habito.tipo === 'negativo' ? `, cuando ${habito.anclaje}` : `, después de ${habito.anclaje}`)}.
              {habito.reto && ' Cada día que lo cumplas suma a tu reto; la barra nunca baja.'}
            </p>

            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-1.5 font-heading font-bold text-[15px] text-text">
                <span className={tokens.icon}><HabitIcon name={iconName} size={15} strokeWidth={2.4} /></span>
                {momentoLabel}
              </div>
              <HabitPreviewRow habito={habito} />
            </div>

            <button 
              onClick={onViewToday}
              className="w-full h-12 rounded-xl logro text-ink font-bold text-[15px] flex items-center justify-center transition-transform active:scale-[0.98] mt-3"
            >
              Ver en Hoy
            </button>
            <button 
              onClick={onCreateAnother}
              className="w-full h-11 mt-1 rounded-xl bg-transparent text-text font-semibold text-[15px] flex items-center justify-center transition-colors hover:bg-surface active:scale-[0.98]"
            >
              Crear otro hábito
            </button>
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
};
