import React from 'react';
import {
  Flame,
  Sparkles,
  Zap,
  Shield,
  Award,
  Layers,
  Trophy,
  Crown,
  CheckCircle2,
  Lock,
  X,
  Target,
} from 'lucide-react';
import { InsigniaDef } from '../../utils/badgeUtils';

interface BadgeDetailModalProps {
  badge: InsigniaDef | null;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  const renderIcon = (name: string, size = 32) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles size={size} />;
      case 'Flame':
        return <Flame size={size} className={badge.desbloqueada ? 'fill-current' : ''} />;
      case 'Zap':
        return <Zap size={size} />;
      case 'Shield':
        return <Shield size={size} />;
      case 'Award':
        return <Award size={size} />;
      case 'Layers':
        return <Layers size={size} />;
      case 'Trophy':
        return <Trophy size={size} />;
      case 'Crown':
        return <Crown size={size} />;
      default:
        return <Award size={size} />;
    }
  };

  const percentage = Math.min(100, Math.round((badge.progresoActual / badge.meta) * 100));

  return (
    <div
      id="badge-detail-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="badge-detail-card"
        className="w-full max-w-[360px] bg-bg border border-line rounded-[28px] p-6 shadow-2xl relative overflow-hidden text-center space-y-5 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow behind badge */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: badge.color }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle de insignia"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-text-muted hover:text-text transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Badge Hero Emblem */}
        <div className="flex flex-col items-center pt-2 relative z-10">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
              badge.desbloqueada
                ? 'shadow-lg border-2'
                : 'bg-surface border border-line text-text-muted'
            }`}
            style={{
              borderColor: badge.desbloqueada ? badge.color : undefined,
              backgroundColor: badge.desbloqueada ? `${badge.color}20` : undefined,
              color: badge.desbloqueada ? badge.color : 'var(--text-muted)',
              boxShadow: badge.desbloqueada ? `0 10px 25px -5px ${badge.color}40` : undefined,
            }}
          >
            {renderIcon(badge.icono, 38)}
          </div>

          <div className="mt-3">
            {badge.desbloqueada ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-ambar/15 text-ambar border border-ambar/30">
                <CheckCircle2 size={12} />
                ¡Desbloqueada!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-surface text-text-muted border border-line">
                <Lock size={12} />
                Bloqueada
              </span>
            )}
          </div>
        </div>

        {/* Badge Text */}
        <div className="space-y-1.5 relative z-10">
          <h3 className="text-xl font-bold font-heading text-text">
            {badge.nombre}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {badge.descripcion}
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="p-3.5 rounded-[16px] bg-surface border border-line space-y-2 text-left relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1.5">
              <Target size={13} className="text-[var(--accent)]" />
              Requisito: {badge.requisito}
            </span>
            <span className="font-mono font-bold text-text">
              {badge.progresoActual} / {badge.meta}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: badge.desbloqueada ? badge.color : 'var(--accent)',
              }}
            />
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-text-muted">
              {percentage}% completado
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-[14px] bg-surface-raised hover:bg-surface-raised text-text font-heading font-semibold text-xs border border-line transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
