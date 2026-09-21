import React, { useState } from 'react';
import {
  Flame,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Smartphone,
  WifiOff,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, completeOnboarding } = useHabitStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOnboardingOpen) return null;

  const totalSlides = 3;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div
      id="onboarding-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-lg animate-fadeIn p-4 overflow-y-auto"
    >
      <div
        id="onboarding-card"
        className="w-full max-w-[420px] bg-bg border border-line rounded-[32px] p-6 sm:p-7 flex flex-col justify-between min-h-[580px] shadow-2xl relative overflow-hidden text-center"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-20)] rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls: Skip & Indicator */}
        <div className="flex items-center justify-between relative z-10 w-full mb-2">
          {currentSlide > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="text-xs font-semibold text-text-muted hover:text-text flex items-center gap-1 transition-colors py-1 px-2"
            >
              <ChevronLeft size={16} />
              <span>Atrás</span>
            </button>
          ) : (
            <div className="w-12" />
          )}

          <button
            type="button"
            onClick={completeOnboarding}
            className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors py-1 px-2"
          >
            Omitir
          </button>
        </div>

        {/* SLIDES CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
          {/* SLIDE 1: Welcome & Consistency */}
          {currentSlide === 0 && (
            <div className="space-y-6 animate-fadeIn w-full flex flex-col items-center">
              {/* Violet Flame Brand Badge */}
              <div className="relative">
                <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] flex items-center justify-center text-text shadow-2xl shadow-[var(--accent-40)] animate-pulse">
                  <Flame size={54} className="fill-white drop-shadow-md" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-ambar shadow-lg">
                  <Sparkles size={16} />
                </div>
              </div>

              <div className="space-y-2 max-w-[320px]">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--accent)] font-semibold">
                  Bienvenido a Racha
                </span>
                <h2 className="text-2xl font-bold font-heading text-text tracking-tight leading-snug">
                  Construye hábitos que perduran
                </h2>
                <p className="text-xs text-text-muted leading-relaxed pt-1">
                  La constancia no se logra por fuerza de voluntad extrema, sino paso a paso día tras día con metas claras y alcanzables.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 2: Streaks and Heatmap */}
          {currentSlide === 1 && (
            <div className="space-y-5 animate-fadeIn w-full flex flex-col items-center">
              {/* Mini Interactive Heatmap Preview */}
              <div className="w-full max-w-[300px] p-3.5 rounded-[20px] bg-surface border border-line shadow-xl space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[var(--accent)]" />
                    <span className="text-[11px] font-heading font-bold text-text">
                      Mapa de Constancia
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-ambar/15 text-ambar text-[10px] font-bold">
                    <Flame size={11} className="fill-ambar" />
                    <span>14 días</span>
                  </div>
                </div>

                {/* 4x7 Visual Heatmap Grid */}
                <div className="grid grid-cols-7 gap-1.5 pt-1">
                  {Array.from({ length: 21 }).map((_, i) => {
                    const isDone = i < 15 || i === 18 || i === 20;
                    const isToday = i === 20;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-[6px] flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[var(--accent)] shadow-sm shadow-[var(--accent-50)]'
                            : 'bg-surface-raised border border-line'
                        } ${isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-surface' : ''}`}
                      >
                        {isDone && <CheckCircle2 size={9} className="text-text" />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[9px] text-text-muted pt-0.5">
                  <span>Menos</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-[2px] bg-surface-raised" />
                    <span className="w-2 h-2 rounded-[2px] bg-[var(--accent-40)]" />
                    <span className="w-2 h-2 rounded-[2px] bg-[var(--accent)]" />
                  </div>
                  <span>Más</span>
                </div>
              </div>

              <div className="space-y-2 max-w-[320px]">
                <h2 className="text-2xl font-bold font-heading text-text tracking-tight leading-snug">
                  Marca, no rompas la cadena
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Completa tus hábitos diarios con un toque, alimenta tus rachas y descubre tus patrones de éxito en gráficos visuales.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 3: Private, Offline, PWA */}
          {currentSlide === 2 && (
            <div className="space-y-5 animate-fadeIn w-full flex flex-col items-center">
              {/* 3 Pillar Cards */}
              <div className="w-full max-w-[320px] space-y-2 text-left">
                <div className="p-3 rounded-[14px] bg-surface border border-line flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-heading text-text">100% Privado</h3>
                    <p className="text-[10px] text-text-muted">Tus datos quedan exclusivamente en tu dispositivo.</p>
                  </div>
                </div>

                <div className="p-3 rounded-[14px] bg-surface border border-line flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ambar/15 text-ambar flex items-center justify-center shrink-0">
                    <WifiOff size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-heading text-text">Modo Offline</h3>
                    <p className="text-[10px] text-text-muted">Funciona sin conexión a internet en todo momento.</p>
                  </div>
                </div>

                <div className="p-3 rounded-[14px] bg-surface border border-line flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ambar/15 text-ambar flex items-center justify-center shrink-0">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-heading text-text">Instalable como App</h3>
                    <p className="text-[10px] text-text-muted">Agrégala a tu pantalla de inicio como PWA nativa.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 max-w-[320px]">
                <h2 className="text-2xl font-bold font-heading text-text tracking-tight">
                  Todo tuyo, siempre
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Sin registros obligatorios ni suscripciones. Tu espacio personal de crecimiento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS: Dots & Next Button */}
        <div className="space-y-4 pt-2 relative z-10 w-full">
          {/* Step Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Ir al slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'w-7 bg-[var(--accent)] shadow-sm shadow-[var(--accent-50)]'
                    : 'w-2 bg-line hover:bg-[#34384A]'
                }`}
              />
            ))}
          </div>

          {/* Action CTA Button */}
          <button
            id="onboarding-next-btn"
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 px-5 rounded-[14px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-text font-heading font-bold text-sm shadow-xl shadow-[var(--accent-30)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>{currentSlide === totalSlides - 1 ? 'Empezar' : 'Siguiente'}</span>
            {currentSlide === totalSlides - 1 ? (
              <Sparkles size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
