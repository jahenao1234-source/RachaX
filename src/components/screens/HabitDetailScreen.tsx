import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Flame,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  Check,
  ShieldCheck,
  Archive,
  ArchiveRestore,
  Link2,
} from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import {
  getTodayString,
  isHabitScheduledForDate,
  isHabitCompletedOnDate,
  formatDateToString,
  parseDateString,
} from '../../utils/habitUtils';

interface HabitDetailScreenProps {
  habitId: string;
  onBack: () => void;
}

export const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({ habitId, onBack }) => {
  const {
    habitos,
    registros,
    rachaActual,
    mejorRacha,
    toggleCompletado,
    setValor,
    valorDe,
    openEditHabit,
    eliminarHabito,
    archivarHabito,
    restaurarHabito,
    setActiveTab,
  } = useHabitStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);

  const habit = useHabitStore().habitos.find((h) => h.id === habitId);
  const todayStr = getTodayString();

  // If habit was deleted or not found
  if (!habit) {
    return (
      <div className="p-6 text-center space-y-4 animate-fadeIn">
        <p className="text-sm text-text-muted">Hábito no encontrado o eliminado.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-[var(--accent)] text-text text-xs font-semibold rounded-xl"
        >
          Volver
        </button>
      </div>
    );
  }

  const currentStreak = rachaActual(habit.id);
  const recordStreak = mejorRacha(habit.id);
  const isNegativo = habit.tipo === 'negativo';

  // 1. Calculate Mini Heatmap for the last 30 days
  const last30Days = useMemo(() => {
    const todayDate = parseDateString(todayStr);
    const days: {
      dateStr: string;
      dayNumber: number;
      dayOfWeek: number;
      monthName: string;
      isToday: boolean;
      isScheduled: boolean;
      isCompleted: boolean;
      formattedLabel: string;
    }[] = [];

    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateToString(d);
      const isScheduled = isHabitScheduledForDate(habit, dateStr);
      const isCompleted = isHabitCompletedOnDate(habit.id, dateStr, registros);

      days.push({
        dateStr,
        dayNumber: d.getDate(),
        dayOfWeek: d.getDay(),
        monthName: monthNamesShort[d.getMonth()],
        isToday: dateStr === todayStr,
        isScheduled,
        isCompleted,
        formattedLabel: `${weekdayNames[d.getDay()]} ${d.getDate()} de ${monthNamesShort[d.getMonth()]}`,
      });
    }

    return days;
  }, [habit, todayStr, registros]);

  // 2. Metrics for the habit
  const habitMetrics = useMemo(() => {
    // Total historical stats from all registrations
    const habitRecords = registros.filter((r) => r.habitoId === habit.id && r.completado);
    const totalCheckins = habitRecords.length;

    // Checkins in the last 30 days
    const scheduledIn30Days = last30Days.filter((d) => d.isScheduled).length;
    const completedIn30Days = last30Days.filter((d) => d.isScheduled && d.isCompleted).length;
    const rate30Days = scheduledIn30Days > 0 ? Math.round((completedIn30Days / scheduledIn30Days) * 100) : 0;

    return {
      totalCheckins,
      scheduledIn30Days,
      completedIn30Days,
      rate30Days,
    };
  }, [habit.id, registros, last30Days]);

  const handleDeleteHabit = () => {
    eliminarHabito(habit.id);
    setShowDeleteModal(false);
    onBack();
    setActiveTab('hoy');
  };

  const isTodayCompleted = isHabitCompletedOnDate(habit.id, todayStr, registros);

  return (
    <div id="screen-habit-detail" className="space-y-6 pb-28 animate-fadeIn">
      {/* Navigation Top Bar */}
      <header className="flex items-center justify-between pt-1">
        <button
          id="habit-detail-back-btn"
          type="button"
          onClick={onBack}
          aria-label="Volver a la pantalla anterior"
          className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-surface hover:bg-surface-raised border border-line text-xs font-semibold text-text-muted hover:text-text transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>

        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
          Detalle del Hábito
        </span>
      </header>

      {/* 1. HABIT HEADER HERO CARD */}
      <section
        id="habit-detail-hero"
        className="rounded-[20px] bg-surface border border-line p-5 space-y-4 shadow-xl relative overflow-hidden"
      >
        {/* Ambient Top Right Glow */}
        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: habit.color }}
        />

        <div className="flex items-start justify-between relative z-10">
          {/* Icon & Title Info */}
          <div className="flex items-start gap-4 min-w-0 flex-1 pr-2">
            <div
              className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 shadow-lg"
              style={{
                backgroundColor: `${habit.color}25`,
                color: habit.color,
                border: `1.5px solid ${habit.color}50`,
                boxShadow: `0 0 20px -5px ${habit.color}40`,
              }}
            >
              <HabitIcon name={habit.icono} size={28} />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-xl font-bold font-heading text-text tracking-tight truncate">
                {habit.nombre}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {/* Frequency Pill */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-raised text-text-muted border border-line">
                  <Calendar size={11} className="text-[var(--accent)]" />
                  {habit.frecuencia === 'diario'
                    ? 'Todos los días'
                    : habit.frecuencia === 'entreSemana'
                    ? 'Lunes a Viernes'
                    : habit.frecuencia === 'semanal'
                    ? `${habit.vecesPorSemana || 1}x por semana`
                    : 'Días seleccionados'}
                </span>

                {/* Negative Habit Pill */}
                {isNegativo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-text-muted/20 text-text-muted border border-text-muted/30">
                    <ShieldCheck size={11} className="text-text-muted" />
                    Quiero evitar
                  </span>
                )}

                {/* Target if present */}
                {habit.metaDiaria && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-raised text-text-muted border border-line">
                    <Target size={11} className="text-ambar" />
                    Meta: {habit.metaDiaria}
                  </span>
                )}

                {/* Reminder if present */}
                {habit.recordatorio && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-raised text-text-muted border border-line">
                    <Clock size={11} className="text-ambar" />
                    {habit.recordatorio}
                  </span>
                )}
              </div>

              {habit.anclaje && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted pt-1.5">
                  <Link2 size={13} className="text-[var(--accent)] shrink-0" />
                  <span>Después de <strong className="text-text font-medium">{habit.anclaje}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Streaks Banner */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
          <div className="rounded-[14px] bg-surface-raised/80 border border-line p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ambar/15 text-ambar flex items-center justify-center shrink-0">
              <Flame size={18} className="fill-ambar" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted">Racha Actual</p>
              <p className="text-base font-bold font-heading text-text">
                {currentStreak} {currentStreak === 1 ? 'día' : 'días'}{isNegativo ? ' sin recaer' : ''}
              </p>
            </div>
          </div>

          <div className="rounded-[14px] bg-surface-raised/80 border border-line p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[10px] text-text-muted">Mejor Racha</p>
              <p className="text-base font-bold font-heading text-text">
                {recordStreak} {recordStreak === 1 ? 'día' : 'días'}{isNegativo ? ' sin recaer' : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MINI CALENDAR HEATMAP (ÚLTIMOS 30 DÍAS) */}
      <section
        id="habit-detail-heatmap"
        className="rounded-[18px] bg-surface border border-line p-4.5 space-y-3.5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: habit.color }} />
            <h2 className="text-sm font-bold font-heading text-text">
              Mapa de Calor (Últimos 30 días)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            {habitMetrics.completedIn30Days}/{habitMetrics.scheduledIn30Days} días
          </span>
        </div>

        {/* Selected date tooltip banner */}
        {selectedHeatmapDate && (
          <div className="px-3 py-1.5 rounded-lg bg-surface-raised border border-line flex items-center justify-between text-xs animate-fadeIn">
            <span className="text-text-muted">
              {last30Days.find((d) => d.dateStr === selectedHeatmapDate)?.formattedLabel}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold" style={{ color: habit.color }}>
                {isHabitCompletedOnDate(habit.id, selectedHeatmapDate, registros)
                  ? isNegativo
                    ? '✓ Resististe'
                    : '✓ Completado'
                  : isHabitScheduledForDate(habit, selectedHeatmapDate)
                  ? isNegativo
                    ? '✗ Recaída'
                    : '✗ No completado'
                  : '— No programado'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (habit.metaDiaria) {
                    const done = isHabitCompletedOnDate(habit.id, selectedHeatmapDate, registros);
                    setValor(habit.id, selectedHeatmapDate, done ? 0 : habit.metaDiaria);
                  } else {
                    toggleCompletado(habit.id, selectedHeatmapDate);
                  }
                }}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--accent-20)] text-[var(--accent)] hover:bg-[var(--accent-30)] transition-all"
              >
                Alternar
              </button>
            </div>
          </div>
        )}

        {/* Heatmap Grid (6 cols x 5 rows = 30 days) */}
        <div className="grid grid-cols-6 gap-2">
          {last30Days.map((day) => {
            let cellBg = 'bg-bg/60';
            let cellBorder = 'border-line/50';
            let cellTextColor = 'text-line-strong';
            let customStyle: React.CSSProperties = {};

            if (day.isScheduled) {
              if (day.isCompleted) {
                cellBg = '';
                cellBorder = '';
                cellTextColor = 'text-text font-bold';
                customStyle = {
                  backgroundColor: habit.color,
                  borderColor: habit.color,
                  boxShadow: `0 0 10px -2px ${habit.color}60`,
                };
              } else {
                cellBg = 'bg-surface';
                cellBorder = 'border-line';
                cellTextColor = 'text-text-muted';
              }
            }

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedHeatmapDate(day.dateStr)}
                style={customStyle}
                className={`aspect-square rounded-[12px] flex flex-col items-center justify-center p-1 border text-xs font-mono transition-all hover:scale-105 active:scale-95 ${cellBg} ${cellBorder} ${cellTextColor} ${
                  day.isToday ? 'ring-2 ring-text ring-offset-2 ring-offset-bg' : ''
                }`}
                title={day.formattedLabel}
              >
                <span>{day.dayNumber}</span>
                <span className="text-[9px] opacity-70 leading-none">{day.monthName}</span>
              </button>
            );
          })}
        </div>

        {/* Mini Legend */}
        <div className="pt-2 border-t border-line flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: habit.color }} />
              <span className="text-text">{isNegativo ? 'Resististe' : 'Listo'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-surface border border-line" />
              <span>{isNegativo ? 'Recaída' : 'Pendiente'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-bg border border-line" />
              <span>Libre</span>
            </div>
          </div>

          <span className="text-[10px]">Toca para registrar</span>
        </div>
      </section>

      {/* 3. METRICS CARDS */}
      <section id="habit-detail-metrics" className="grid grid-cols-3 gap-2.5">
        {/* Metric 1: Tasa 30 días */}
        <div className="rounded-[16px] bg-surface border border-line p-3.5 space-y-1 text-center shadow-lg">
          <div className="w-8 h-8 rounded-full bg-ambar/10 text-ambar flex items-center justify-center mx-auto mb-1">
            <TrendingUp size={16} />
          </div>
          <p className="text-lg font-bold font-heading text-text">
            {habitMetrics.rate30Days}%
          </p>
          <p className="text-[10px] text-text-muted">Tasa de éxito</p>
        </div>

        {/* Metric 2: Total Check-ins */}
        <div className="rounded-[16px] bg-surface border border-line p-3.5 space-y-1 text-center shadow-lg">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-10)] text-[var(--accent)] flex items-center justify-center mx-auto mb-1">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-lg font-bold font-heading text-text">
            {habitMetrics.totalCheckins}
          </p>
          <p className="text-[10px] text-text-muted">Total check-ins</p>
        </div>

        {/* Metric 3: Racha Récord */}
        <div className="rounded-[16px] bg-surface border border-line p-3.5 space-y-1 text-center shadow-lg">
          <div className="w-8 h-8 rounded-full bg-ambar/10 text-ambar flex items-center justify-center mx-auto mb-1">
            <Flame size={16} className="fill-ambar" />
          </div>
          <p className="text-lg font-bold font-heading text-text">
            {recordStreak} <span className="text-xs font-normal text-text-muted">d</span>
          </p>
          <p className="text-[10px] text-text-muted">Racha récord</p>
        </div>
      </section>

      {/* 4. ACTION BUTTONS: EDIT & DELETE */}
      <section id="habit-detail-actions" className="grid grid-cols-2 gap-3 pt-2">
        {/* Edit Button */}
        <button
          id="habit-detail-edit-btn"
          type="button"
          onClick={() => openEditHabit(habit)}
          className="w-full py-3.5 px-4 rounded-[14px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-text text-xs font-bold font-heading shadow-lg shadow-[var(--accent-30)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Edit3 size={16} />
          <span>Editar Hábito</span>
        </button>

        {/* Delete Button */}
        <button
          id="habit-detail-delete-btn"
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-3.5 px-4 rounded-[14px] bg-surface hover:bg-danger/10 border border-danger/30 hover:border-danger text-danger text-xs font-bold font-heading shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Trash2 size={16} />
          <span>Eliminar</span>
        </button>
      </section>

      <button
        type="button"
        onClick={() => {
          if (habit.archivado) {
            restaurarHabito(habit.id);
          } else {
            archivarHabito(habit.id);
            onBack();
            setActiveTab('hoy');
          }
        }}
        className="w-full py-3 px-4 rounded-[14px] bg-surface hover:bg-surface-raised border border-line text-text-muted hover:text-text text-xs font-semibold font-heading flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        {habit.archivado ? <ArchiveRestore size={15} /> : <Archive size={15} />}
        <span>{habit.archivado ? 'Restaurar hábito' : 'Archivar hábito'}</span>
      </button>

      {/* 5. DELETE CONFIRMATION MODAL / BOTTOM SHEET */}
      {showDeleteModal &&
        createPortal(
          <div
            id="delete-habit-confirm-modal"
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn p-0 sm:p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="w-full max-w-[400px] bg-surface border-t sm:border border-line rounded-t-[24px] sm:rounded-[24px] p-5 space-y-4 shadow-2xl animate-slideUp text-left"
              style={{ paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom, 1.75rem))' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Icon + Title */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-danger/15 text-danger border border-danger/30 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-text">
                    ¿Eliminar &quot;{habit.nombre}&quot;?
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Confirmación requerida
                  </p>
                </div>
              </div>

              {/* Warning Body */}
              <p className="text-xs text-text-muted leading-relaxed bg-bg/70 p-3.5 rounded-[12px] border border-line">
                Se borrará su historial de check-ins y registros de racha permanentemente. Esta acción no se puede deshacer.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="py-3 px-4 rounded-[12px] bg-surface-raised hover:bg-[#20232E] text-text-muted hover:text-text text-xs font-semibold font-heading transition-all"
                >
                  Cancelar
                </button>

                <button
                  id="delete-habit-confirm-btn"
                  type="button"
                  onClick={handleDeleteHabit}
                  className="py-3 px-4 rounded-[12px] bg-[#EF4444] hover:bg-[#DC2626] text-text text-xs font-bold font-heading shadow-lg shadow-[#EF4444]/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={15} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
