import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Trophy, X, Award } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { InsigniaDef } from '../../utils/badgeUtils';

export const BadgeUnlockToast: React.FC = () => {
  const { insignias, insigniasGanadas } = useHabitStore();
  const [newlyUnlocked, setNewlyUnlocked] = useState<InsigniaDef | null>(null);
  const previouslyUnlocked = useRef<Set<string>>(new Set(Object.keys(insigniasGanadas)));

  useEffect(() => {
    if (!newlyUnlocked) return;
    const t = setTimeout(() => setNewlyUnlocked(null), 6000);
    return () => clearTimeout(t);
  }, [newlyUnlocked]);

  useEffect(() => {
    try {
      const currentKeys = Object.keys(insigniasGanadas);
      for (const key of currentKeys) {
        if (!previouslyUnlocked.current.has(key)) {
          // This is a new badge!
          const badge = insignias.find(b => b.id === key);
          if (badge) {
            setNewlyUnlocked(badge);
          }
        }
      }
      previouslyUnlocked.current = new Set(currentKeys);
    } catch (e) {
      console.warn('Error verificando insignias:', e);
    }
  }, [insigniasGanadas, insignias]);

  if (!newlyUnlocked) return null;

  return (
    <div
      id="badge-unlock-toast"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] px-4 animate-slideDown"
    >
      <div className="rounded-[20px] bg-surface/95 border-2 border-ambar p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-left relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-ambar/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative shrink-0 w-14 h-14 rounded-full bg-ambar/10 flex items-center justify-center text-ambar shadow-[inset_0_0_12px_rgba(245,158,11,0.2)]">
          <Trophy size={28} strokeWidth={1.5} />
          <Sparkles className="absolute -top-1 -right-1 text-ambar animate-pulse" size={16} />
        </div>

        <div className="flex-1 min-w-0 relative">
          <p className="m-0 text-[13px] font-bold text-ambar tracking-wide uppercase mb-0.5">Nueva insignia</p>
          <h4 className="m-0 text-[17px] font-bold font-heading text-text truncate">
            {newlyUnlocked.nombre}
          </h4>
          <p className="m-0 mt-0.5 text-[14px] text-text-muted leading-tight truncate">
            {newlyUnlocked.familia}
          </p>
        </div>

        <button
          onClick={() => setNewlyUnlocked(null)}
          className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-surface-raised text-text-muted"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
