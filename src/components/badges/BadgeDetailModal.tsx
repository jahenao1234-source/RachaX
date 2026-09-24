import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Flame } from 'lucide-react';
import { BadgeIcon } from './BadgeIcon';
import { InsigniaDef } from '../../utils/badgeUtils';
import { useHabitStore } from '../../store/HabitContext';

interface BadgeDetailModalProps {
  badge: InsigniaDef | null;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
  const { insignias } = useHabitStore();

  useEffect(() => {
    if (!badge) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [badge, onClose]);

  if (!badge) return null;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    // Para YYYY-MM-DD
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  // Ganada: se muestra el progreso de la siguiente de la familia. Sin ganar: el de esta misma.
  const familyBadges = insignias.filter(b => b.familia === badge.familia).sort((a, b) => a.meta - b.meta);
  const objetivo = badge.desbloqueada ? familyBadges.find(b => b.meta > badge.meta) : badge;
  const percentage = objetivo ? Math.min(100, (objetivo.progresoActual / objetivo.meta) * 100) : 0;
  const llamaMasArriba = familyBadges.find(b => b.meta > badge.meta && b.premioLlama);

  let premioTexto = '';
  if (badge.desbloqueada) {
    if (objetivo) {
      premioTexto = 'Premio de la siguiente: una caja sorpresa.';
      if (llamaMasArriba) premioTexto += ` La de ${llamaMasArriba.meta} trae la llama ${llamaMasArriba.premioLlama}.`;
    }
  } else {
    premioTexto = 'Premio: una caja sorpresa.';
    if (badge.premioLlama) premioTexto += ` Trae además la llama ${badge.premioLlama}.`;
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/60 transition-opacity" onClick={onClose} />
      <section className="sheet animate-slideUp shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="hi7" aria-describedby="hid8">
        <div className="shead">
          <button className="x" aria-label="Cerrar" onClick={onClose}>
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>
        <div className="slist text-center pb-6 pt-3 px-5">
          <span 
            className="bigbadge" 
            aria-hidden="true" 
            style={!badge.desbloqueada ? { background: 'transparent', color: 'var(--text-muted)', boxShadow: 'inset 0 0 0 2px var(--line-strong)' } : undefined}
          >
            <span className="cond font-heading font-bold text-[44px] leading-none">{badge.meta}</span>
          </span>
          <h2 className="cond font-heading font-bold text-[28px] mt-3 mb-0.5 text-text" id="hi7">{badge.nombre}</h2>
          <p className="sub m-0" id="hid8">{badge.desbloqueada ? `La ganaste el ${formatDate(badge.fechaDesbloqueo)}` : 'Por conseguir'}</p>
          <p className="mt-3 text-[15px] leading-[1.45] text-text text-left">
            {badge.descripcion}
          </p>
          {objetivo && (
            <div className="text-left mt-4">
              <div className="flex justify-between items-baseline">
                <span className="sub">{badge.desbloqueada ? `Siguiente: ${objetivo.requisito}` : objetivo.requisito}</span>
                <span className="sub font-number">{objetivo.progresoActual} de {objetivo.meta}</span>
              </div>
              <i className="track mt-2 block w-full h-2 rounded-full bg-track-empty overflow-hidden shrink-0" aria-hidden="true">
                <b className="block h-full rounded-full bg-ambar-text" style={{ width: `${percentage}%` }}></b>
              </i>
            </div>
          )}
          {premioTexto && <p className="sub mt-3 text-left">{premioTexto}</p>}
        </div>
      </section>
    </>,
    document.body
  );
};
