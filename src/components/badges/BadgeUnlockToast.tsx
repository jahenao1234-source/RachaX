import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Trophy, X, Award } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { calcularInsignias, InsigniaDef } from '../../utils/badgeUtils';

const STORAGE_UNLOCKED_BADGES_KEY = 'racha_unlocked_badges';

export const BadgeUnlockToast: React.FC = () => {
  const { habitos, registros, mejorRachaGlobalHabitos, rachaGlobal } = useHabitStore();
  const [newlyUnlocked, setNewlyUnlocked] = useState<InsigniaDef | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!newlyUnlocked) return;
    const t = setTimeout(() => setNewlyUnlocked(null), 6000);
    return () => clearTimeout(t);
  }, [newlyUnlocked]);

  useEffect(() => {
    try {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        const maxHabitStreakInit = mejorRachaGlobalHabitos();
        const globalInit = rachaGlobal();
        const badgesInit = calcularInsignias(habitos, registros, maxHabitStreakInit, globalInit);
        localStorage.setItem(STORAGE_UNLOCKED_BADGES_KEY, JSON.stringify(badgesInit.filter((b) => b.desbloqueada).map((b) => b.id)));
        return;
      }

      const maxHabitStreak = mejorRachaGlobalHabitos();
      const currentGlobalStreak = rachaGlobal();
      const currentBadges = calcularInsignias(habitos, registros, maxHabitStreak, currentGlobalStreak);
      const unlockedIds = currentBadges.filter((b) => b.desbloqueada).map((b) => b.id);

      const storedRaw = localStorage.getItem(STORAGE_UNLOCKED_BADGES_KEY);
      const previouslyUnlocked: string[] = storedRaw ? JSON.parse(storedRaw) : [];

      // Find any newly unlocked badge that wasn't in previous list
      const newBadges = unlockedIds.filter((id) => !previouslyUnlocked.includes(id));

      if (newBadges.length > 0) {
        const firstNewBadge = currentBadges.find((b) => b.id === newBadges[0]);
        if (firstNewBadge) {
          setNewlyUnlocked(firstNewBadge);
        }
      }

      // Update storage with all current unlocked IDs
      localStorage.setItem(STORAGE_UNLOCKED_BADGES_KEY, JSON.stringify(unlockedIds));
    } catch (e) {
      console.warn('Error verificando insignias:', e);
    }
  }, [habitos, registros]);

  if (!newlyUnlocked) return null;

  return (
    <div
      id="badge-unlock-toast"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] px-4 animate-slideDown"
    >
      <div className="rounded-[20px] bg-surface/95 border-2 border-ambar p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-left relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-ambar/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-ambar/20 border border-ambar/40 text-ambar flex items-center justify-center shrink-0 ">
            <Trophy size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ambar">
              <Sparkles size={11} />
              <span>¡Nueva Insignia Desbloqueada!</span>
            </div>
            <h4 className="text-sm font-bold font-heading text-text">
              {newlyUnlocked.nombre}
            </h4>
            <p className="text-[11px] text-text-muted line-clamp-1">
              {newlyUnlocked.descripcion}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNewlyUnlocked(null)}
          aria-label="Cerrar notificación de insignia"
          className="w-7 h-7 rounded-full bg-line flex items-center justify-center text-text-muted hover:text-text transition-colors relative z-10 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
