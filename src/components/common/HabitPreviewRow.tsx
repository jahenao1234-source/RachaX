import React from 'react';
import { Habito, MomentoDia } from '../../types';
import { HabitIcon } from './HabitIcon';

interface HabitPreviewRowProps {
  habito: Pick<Habito, 'nombre' | 'icono' | 'tipo' | 'anclaje' | 'metaDiaria' | 'reto' | 'frecuencia' | 'vecesPorSemana'> & { momento?: MomentoDia };
  retoProgreso?: number;
}

export const getMomentoColorTokens = (momento?: string) => {
  switch (momento) {
    case 'manana': return { bg: 'bg-ambar-tint', icon: 'text-ambar-text' };
    case 'tarde': return { bg: 'bg-coral-tint', icon: 'text-coral-text' };
    case 'noche': return { bg: 'bg-lila-tint', icon: 'text-lila-text' };
    default: return { bg: 'bg-surface-raised', icon: 'text-text' };
  }
};

export const HabitPreviewRow: React.FC<HabitPreviewRowProps> = ({ habito, retoProgreso = 0 }) => {
  const isReto = !!habito.reto;
  const tokens = getMomentoColorTokens(habito.momento);
  
  // Anclaje text
  let anchorText = '';
  if (habito.anclaje) {
    anchorText = habito.tipo === 'negativo' ? `evitar · cuando ${habito.anclaje}` : `después de ${habito.anclaje}`;
  } else {
    if (habito.tipo === 'negativo') {
      anchorText = 'evitar';
    } else if (habito.frecuencia === 'semanal') {
      anchorText = `0 de ${habito.vecesPorSemana || 3} esta semana`;
    } else if (habito.metaDiaria) {
      anchorText = `0 de ${habito.metaDiaria}`;
    }
  }

  // Progress percentage
  let pct = 0;
  if (isReto && habito.reto!.meta > 0) {
    pct = Math.min(100, Math.round((retoProgreso / habito.reto!.meta) * 100));
  }

  return (
    <div className="bg-surface border border-line rounded-[14px] px-[10px] py-[8px]">
      <div className="flex items-center gap-3">
        {/* Cuadrito */}
        <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 ${tokens.bg} ${tokens.icon}`}>
          <HabitIcon name={habito.icono} size={17} strokeWidth={2.4} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-semibold leading-tight truncate ${habito.nombre ? 'text-text' : 'text-text-muted'}`}>
            {habito.nombre || 'Tu hábito'}
          </p>
          {anchorText && (
            <p className="text-[12px] text-text-muted mt-0.5 truncate">
              {anchorText}
            </p>
          )}
        </div>

        {/* Right element (+10 / +1 and circle) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[13px] font-semibold text-text-muted font-mono">
            {habito.metaDiaria ? '+1' : '+10'}
          </span>
          <div className="w-8 h-8 rounded-full border-2 border-line-strong flex-shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Reto Progress */}
      {isReto && (
        <div className="flex items-center gap-2.5 mt-2" role="progressbar" aria-valuenow={retoProgreso} aria-valuemax={habito.reto!.meta} aria-label="Reto">
          <div className="flex-1 h-1.5 rounded-full bg-track-empty overflow-hidden">
            <div 
              className="h-full rounded-full bg-ambar transition-all duration-500" 
              style={{ width: `${pct}%` }} 
            />
          </div>
          <span className="text-[12px] font-semibold text-text-muted font-mono whitespace-nowrap">
            {retoProgreso === 0 
              ? `Reto de ${habito.reto!.meta} ${habito.frecuencia === 'semanal' ? 'semanas' : 'días'}` 
              : `Reto · ${retoProgreso} de ${habito.reto!.meta}`}
          </span>
        </div>
      )}
    </div>
  );
};
