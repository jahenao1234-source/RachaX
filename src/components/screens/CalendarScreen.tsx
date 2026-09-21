import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  X,
  Target,
  Percent,
  Layers,
  Sparkles,
  Plus,
  Minus,
  Snowflake,
} from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Habito } from '../../types';
import {
  getTodayString,
  isHabitScheduledForDate,
  isHabitCompletedOnDate,
  formatDateToString,
  parseDateString,
} from '../../utils/habitUtils';

export const CalendarScreen: React.FC = () => {
  const {
    habitosActivos: habitos,
    registros,
    toggleCompletado,
    setValor,
    valorDe,
    comodines,
    diasCongelados,
    congelarDia,
    descongelarDia,
  } = useHabitStore();

  // Navigation & filter state
  const [selectedHabitId, setSelectedHabitId] = useState<string>('todos');
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);

  const todayStr = getTodayString();
  const currentYear = viewDate.getFullYear();
  const currentMonthIdx = viewDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToCurrentMonth = () => {
    setViewDate(new Date());
  };

  // Selected Habit reference
  const selectedHabit = useMemo(() => {
    if (selectedHabitId === 'todos') return null;
    return habitos.find((h) => h.id === selectedHabitId) || null;
  }, [habitos, selectedHabitId]);

  // Days in current month calculation
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  
  // Starting day of week for the 1st of current month (0=Sun, 1=Mon, ..., 6=Sat)
  // Adjusted for Monday-first (0=Mon, 1=Tue, ..., 6=Sun)
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay();
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Month date strings array
  const monthDays = useMemo(() => {
    const days: { dayNumber: number; dateStr: string; isToday: boolean; isFuture: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
      });
    }
    return days;
  }, [currentYear, currentMonthIdx, daysInMonth, todayStr]);

  // Calculate Month Summary Metrics
  const monthMetrics = useMemo(() => {
    let scheduledDaysCount = 0;
    let completedDaysCount = 0;
    let maxStreakInMonth = 0;
    let currentStreakInMonth = 0;

    monthDays.forEach(({ dateStr, isFuture }) => {
      // We only count statistics for days elapsed or today
      if (isFuture) return;

      if (selectedHabit) {
        const isScheduled = isHabitScheduledForDate(selectedHabit, dateStr);
        if (isScheduled) {
          scheduledDaysCount++;
          const isCompleted = isHabitCompletedOnDate(selectedHabit.id, dateStr, registros);
          if (isCompleted) {
            completedDaysCount++;
            currentStreakInMonth++;
            if (currentStreakInMonth > maxStreakInMonth) {
              maxStreakInMonth = currentStreakInMonth;
            }
          } else {
            currentStreakInMonth = 0;
          }
        }
      } else {
        // "Todos" view: a day is counted as scheduled if at least 1 habit was scheduled
        const scheduledHabits = habitos.filter((h) => isHabitScheduledForDate(h, dateStr));
        if (scheduledHabits.length > 0) {
          scheduledDaysCount++;
          const completedCount = scheduledHabits.filter((h) => isHabitCompletedOnDate(h.id, dateStr, registros)).length;
          // Fully completed or partial? Let's count days where 100% completed
          if (completedCount === scheduledHabits.length) {
            completedDaysCount++;
            currentStreakInMonth++;
            if (currentStreakInMonth > maxStreakInMonth) {
              maxStreakInMonth = currentStreakInMonth;
            }
          } else {
            currentStreakInMonth = 0;
          }
        }
      }
    });

    const completionRate = scheduledDaysCount > 0
      ? Math.round((completedDaysCount / scheduledDaysCount) * 100)
      : 0;

    return {
      completedDaysCount,
      scheduledDaysCount,
      completionRate,
      maxStreakInMonth,
    };
  }, [monthDays, selectedHabit, habitos, registros]);

  // Helper for formatting date in the retroactive bottom sheet
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateForModal) return '';
    const dateObj = parseDateString(selectedDateForModal);
    const text = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, [selectedDateForModal]);

  // Habits scheduled on the selected date for retroactive check-in
  const habitsForSelectedDate = useMemo(() => {
    if (!selectedDateForModal) return [];
    return habitos.map((h) => ({
      ...h,
      isScheduled: isHabitScheduledForDate(h, selectedDateForModal),
      isCompleted: isHabitCompletedOnDate(h.id, selectedDateForModal, registros),
    }));
  }, [selectedDateForModal, habitos, registros]);

  return (
    <div id="screen-calendar" className="space-y-5 pb-28 animate-fadeIn">
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-medium text-text-muted tracking-wide uppercase font-sans">
            Historial de Constancia
          </p>
          <h1 className="text-2xl font-bold font-heading text-text tracking-tight mt-0.5">
            Mapa de Calor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#378ADD]/10 text-[#7DD3FC] border border-[#378ADD]/30">
            <Snowflake size={13} />
            <span>{comodines}</span>
          </div>

          {/* Current Month Quick Button */}
          {(viewDate.getMonth() !== new Date().getMonth() || viewDate.getFullYear() !== new Date().getFullYear()) && (
            <button
              type="button"
              onClick={handleGoToCurrentMonth}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-15)] text-[var(--accent)] border border-[var(--accent-30)] hover:bg-[var(--accent-25)] transition-all"
            >
              Ir a hoy
            </button>
          )}
        </div>
      </header>

      {/* 1. HORIZONTAL HABIT SELECTOR CHIPS */}
      <section className="space-y-1.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          {/* Chip "Todos" */}
          <button
            id="habit-chip-todos"
            type="button"
            onClick={() => setSelectedHabitId('todos')}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-[14px] text-xs font-heading font-semibold border transition-all active:scale-95 ${
              selectedHabitId === 'todos'
                ? 'bg-[var(--accent)] border-[var(--accent)] text-text shadow-lg shadow-[var(--accent-25)]'
                : 'bg-surface border-line text-text-muted hover:text-text hover:border-line-strong'
            }`}
          >
            <Layers size={15} />
            <span>Todos los Hábitos</span>
          </button>

          {/* Individual Habit Chips */}
          {habitos.map((habito) => {
            const isSelected = selectedHabitId === habito.id;
            return (
              <button
                key={habito.id}
                id={`habit-chip-${habito.id}`}
                type="button"
                onClick={() => setSelectedHabitId(habito.id)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-[14px] text-xs font-heading font-semibold border transition-all active:scale-95 ${
                  isSelected
                    ? 'text-text shadow-lg'
                    : 'bg-surface border-line text-text-muted hover:text-text hover:border-line-strong'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: habito.color,
                        borderColor: habito.color,
                        boxShadow: `0 8px 20px -4px ${habito.color}40`,
                      }
                    : undefined
                }
              >
                <div
                  className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${habito.color}25`,
                    color: isSelected ? '#FFFFFF' : habito.color,
                  }}
                >
                  <HabitIcon name={habito.icono} size={12} />
                </div>
                <span className="truncate max-w-[130px]">{habito.nombre}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. CALENDAR HEATMAP CARD */}
      <section
        id="calendar-heatmap-card"
        className="rounded-[18px] bg-surface border border-line p-4.5 space-y-4 shadow-xl relative"
      >
        {/* Month Selector Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold font-heading text-base text-text capitalize">
              {monthNames[currentMonthIdx]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="calendar-prev-month-btn"
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-[10px] bg-surface-raised text-text-muted hover:text-text hover:bg-[#20232E] border border-line transition-all active:scale-95"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              id="calendar-next-month-btn"
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-[10px] bg-surface-raised text-text-muted hover:text-text hover:bg-[#20232E] border border-line transition-all active:scale-95"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of Week Header (L, M, X, J, V, S, D) */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((d) => (
            <span key={d} className="text-[11px] font-semibold text-text-muted py-1 uppercase font-mono">
              {d}
            </span>
          ))}
        </div>

        {/* Month Grid Heatmap */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty offset days before 1st of month */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-xl bg-transparent" />
          ))}

          {/* Actual days of month */}
          {monthDays.map(({ dayNumber, dateStr, isToday, isFuture }) => {
            // Determine styling based on selected view
            let cellBg = 'bg-surface';
            let cellBorder = 'border-line/60';
            let cellTextColor = isFuture ? 'text-line-strong' : 'text-text-muted';
            let cellCustomStyle: React.CSSProperties = {};
            let tooltip = `${dayNumber} de ${monthNames[currentMonthIdx]}`;

            if (!isFuture) {
              if (selectedHabit) {
                // Single habit view
                const isScheduled = isHabitScheduledForDate(selectedHabit, dateStr);
                const isCompleted = isHabitCompletedOnDate(selectedHabit.id, dateStr, registros);

                if (!isScheduled) {
                  // Not scheduled on this weekday
                  cellBg = 'bg-bg/50';
                  cellBorder = 'border-surface-raised/40';
                  cellTextColor = 'text-line-strong';
                  tooltip += ' (No programado)';
                } else if (isCompleted) {
                  // Scheduled and completed -> Habit Color
                  cellBg = '';
                  cellBorder = '';
                  cellTextColor = 'text-text font-bold';
                  cellCustomStyle = {
                    backgroundColor: selectedHabit.color,
                    borderColor: selectedHabit.color,
                    boxShadow: `0 0 10px -2px ${selectedHabit.color}60`,
                  };
                  tooltip += ' (Completado)';
                } else {
                  // Scheduled but missed
                  cellBg = 'bg-surface';
                  cellBorder = 'border-line';
                  cellTextColor = 'text-text-muted';
                  tooltip += ' (No completado)';
                }
              } else {
                // "Todos" view: GitHub-style violet intensity by % of completed habits
                const scheduledHabits = habitos.filter((h) => isHabitScheduledForDate(h, dateStr));
                if (scheduledHabits.length === 0) {
                  cellBg = 'bg-surface';
                  cellBorder = 'border-line/60';
                  cellTextColor = 'text-text-muted';
                  tooltip += ' (Sin hábitos programados)';
                } else {
                  const completedCount = scheduledHabits.filter((h) => isHabitCompletedOnDate(h.id, dateStr, registros)).length;
                  const ratio = completedCount / scheduledHabits.length;
                  tooltip += ` (${completedCount}/${scheduledHabits.length} completados)`;

                  if (ratio === 0) {
                    cellBg = 'bg-surface';
                    cellBorder = 'border-line';
                    cellTextColor = 'text-text-muted';
                  } else if (ratio < 0.35) {
                    cellBg = 'bg-[var(--accent-25)]';
                    cellBorder = 'border-[var(--accent-40)]';
                    cellTextColor = 'text-[#DDD6FE]';
                  } else if (ratio < 0.7) {
                    cellBg = 'bg-[var(--accent-55)]';
                    cellBorder = 'border-[var(--accent-70)]';
                    cellTextColor = 'text-text font-medium';
                  } else if (ratio < 1) {
                    cellBg = 'bg-[var(--accent-80)]';
                    cellBorder = 'border-[var(--accent)]';
                    cellTextColor = 'text-text font-bold';
                  } else {
                    // 100% completed
                    cellBg = 'bg-[var(--accent)]';
                    cellBorder = 'border-[var(--accent)]';
                    cellTextColor = 'text-text font-bold';
                    cellCustomStyle = {
                      boxShadow: '0 0 12px -2px var(--accent-60)',
                    };
                  }
                }
              }
            }

            return (
              <button
                key={dateStr}
                id={`calendar-cell-${dateStr}`}
                type="button"
                disabled={isFuture}
                onClick={() => setSelectedDateForModal(dateStr)}
                title={tooltip}
                style={cellCustomStyle}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all text-xs font-mono border relative select-none ${cellBg} ${cellBorder} ${cellTextColor} ${
                  isToday ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-bg z-10' : ''
                } ${
                  !isFuture ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-40'
                }`}
              >
                <span>{dayNumber}</span>
                {isToday && (
                  <span className="w-1 h-1 rounded-full bg-[var(--accent)] mt-0.5 ring-1 ring-white" />
                )}
                {!isFuture && diasCongelados.includes(dateStr) && (
                  <Snowflake size={9} className="absolute top-0.5 right-0.5 text-[#7DD3FC]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Legend */}
        <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
          {selectedHabit ? (
            /* Single Habit Legend */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-md"
                  style={{ backgroundColor: selectedHabit.color }}
                />
                <span className="text-text">Completado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-surface border border-line" />
                <span>No completado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-bg border border-surface-raised" />
                <span>No programado</span>
              </div>
            </div>
          ) : (
            /* "Todos" Intensity Legend */
            <div className="flex items-center gap-1.5">
              <span>Menos</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-surface border border-line" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-25)]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-55)]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-80)]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" />
              <span>Más (100%)</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-1 ring-[var(--accent)] bg-transparent" />
            <span>Hoy</span>
          </div>
        </div>
      </section>

      {/* 3. MONTH SUMMARY METRICS */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Resumen de {monthNames[currentMonthIdx]}
          </h3>
          <span className="text-[11px] text-[var(--accent)] font-medium">
            {selectedHabit ? selectedHabit.nombre : 'Todos los hábitos'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Metric 1: Días Completados */}
          <div className="rounded-[16px] bg-surface border border-line p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-ambar">
              <span className="text-[11px] text-text-muted font-medium">Días listos</span>
              <Check size={14} />
            </div>
            <p className="text-xl font-bold font-heading text-text">
              {monthMetrics.completedDaysCount}
              <span className="text-xs font-normal text-text-muted">/{monthMetrics.scheduledDaysCount}</span>
            </p>
            <p className="text-[10px] text-text-muted">Días cumplidos</p>
          </div>

          {/* Metric 2: Tasa del Mes */}
          <div className="rounded-[16px] bg-surface border border-line p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[var(--accent)]">
              <span className="text-[11px] text-text-muted font-medium">Tasa del mes</span>
              <Percent size={14} />
            </div>
            <p className="text-xl font-bold font-heading text-text">
              {monthMetrics.completionRate}%
            </p>
            <p className="text-[10px] text-text-muted">Efectividad</p>
          </div>

          {/* Metric 3: Mejor Racha del Mes */}
          <div className="rounded-[16px] bg-surface border border-line p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-ambar">
              <span className="text-[11px] text-text-muted font-medium">Racha récord</span>
              <Flame size={14} />
            </div>
            <p className="text-xl font-bold font-heading text-text">
              {monthMetrics.maxStreakInMonth} <span className="text-xs font-normal text-text-muted">d</span>
            </p>
            <p className="text-[10px] text-text-muted">Racha del mes</p>
          </div>
        </div>
      </section>

      {/* 4. RETROACTIVE CHECK-IN BOTTOM SHEET MODAL */}
      {selectedDateForModal && (
        <div
          id="calendar-retroactive-modal"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedDateForModal(null)}
        >
          <div
            className="w-full max-w-[430px] bg-surface border-t sm:border border-line rounded-t-[24px] sm:rounded-[24px] p-5 space-y-4 shadow-2xl animate-slideUp max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wide">
                  Registro Retroactivo
                </span>
                <h3 className="text-base font-bold font-heading text-text">
                  {formattedSelectedDate}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateForModal(null)}
                aria-label="Cerrar modal"
                className="w-8 h-8 rounded-full bg-surface-raised hover:bg-surface-raised text-text-muted hover:text-text flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of Habits for this specific date */}
            <div className="space-y-2.5">
              {habitos.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-text-muted">No tienes hábitos creados aún.</p>
                </div>
              ) : (
                habitsForSelectedDate.map((h) => {
                  return (
                    <div
                      key={h.id}
                      className={`p-3 rounded-[14px] border flex items-center justify-between transition-all ${
                        h.isCompleted
                          ? 'bg-surface-raised border-line-strong'
                          : 'bg-bg/70 border-line'
                      } ${!h.isScheduled ? 'opacity-70' : ''}`}
                    >
                      {/* Left: Icon & Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${h.color}20`,
                            color: h.color,
                            border: `1px solid ${h.color}40`,
                          }}
                        >
                          <HabitIcon name={h.icono} size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold font-heading truncate ${
                              h.isCompleted ? 'text-text' : 'text-text-muted'
                            }`}
                          >
                            {h.nombre}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-text-muted">
                              {h.isScheduled ? 'Programado' : 'No programado'}
                            </span>
                            {h.metaDiaria && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface text-text-muted">
                                Meta: {h.metaDiaria}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Check Toggle Button or Counter */}
                      {h.metaDiaria ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setValor(h.id, selectedDateForModal, valorDe(h.id, selectedDateForModal) - 1)}
                            disabled={valorDe(h.id, selectedDateForModal) <= 0}
                            aria-label={`Quitar uno a ${h.nombre}`}
                            className="w-8 h-8 rounded-full border-2 border-line-strong text-text-muted hover:text-text hover:border-[#6B6F7B] flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <div
                            className="min-w-[46px] h-8 px-1.5 rounded-full flex items-center justify-center gap-1 text-[11px] font-bold font-heading border-2"
                            style={h.isCompleted
                              ? { backgroundColor: h.color, borderColor: h.color, color: '#FFFFFF', boxShadow: `0 0 12px -2px ${h.color}60` }
                              : { borderColor: 'var(--line-strong)', color: 'var(--text)', backgroundColor: 'transparent' }}
                          >
                            {h.isCompleted && <Check size={12} strokeWidth={3} />}
                            <span>{valorDe(h.id, selectedDateForModal)}/{h.metaDiaria}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValor(h.id, selectedDateForModal, valorDe(h.id, selectedDateForModal) + 1)}
                            aria-label={`Sumar uno a ${h.nombre}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-text transition-all active:scale-90"
                            style={{ backgroundColor: h.color, boxShadow: `0 0 12px -2px ${h.color}60` }}
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleCompletado(h.id, selectedDateForModal)}
                          aria-label={h.isCompleted ? `Desmarcar ${h.nombre}` : `Completar ${h.nombre}`}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 focus:outline-none ${
                            h.isCompleted
                              ? 'shadow-md scale-100'
                              : 'border-2 border-line-strong hover:border-[#6B6F7B] bg-transparent'
                          }`}
                          style={{
                            backgroundColor: h.isCompleted ? h.color : 'transparent',
                            borderColor: h.isCompleted ? h.color : undefined,
                            boxShadow: h.isCompleted ? `0 0 12px -2px ${h.color}60` : undefined,
                          }}
                        >
                          {h.isCompleted && (
                            <Check size={16} strokeWidth={3} className="text-text drop-shadow" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Freeze / Unfreeze Day Section */}
            {(() => {
              const isPast = selectedDateForModal < todayStr;
              const isFrozen = diasCongelados.includes(selectedDateForModal);
              const programados = habitsForSelectedDate.filter((h) => h.isScheduled);
              const diaCompleto = programados.length > 0 && programados.every((h) => h.isCompleted);
              if (!isPast || (diaCompleto && !isFrozen)) return null;
              return (
                <div className="p-3 rounded-[14px] bg-bg/70 border border-line flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#378ADD]/15 text-[#7DD3FC] flex items-center justify-center shrink-0">
                      <Snowflake size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text">
                        {isFrozen ? 'Día protegido' : 'Proteger este día'}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {isFrozen ? 'No rompe tus rachas' : `Comodines disponibles: ${comodines}`}
                      </p>
                    </div>
                  </div>
                  {isFrozen ? (
                    <button
                      type="button"
                      onClick={() => descongelarDia(selectedDateForModal)}
                      className="px-3 py-2 rounded-[10px] text-xs font-semibold bg-surface-raised text-text-muted hover:text-text border border-line transition-colors shrink-0"
                    >
                      Quitar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => congelarDia(selectedDateForModal)}
                      disabled={comodines <= 0}
                      className="px-3 py-2 rounded-[10px] text-xs font-semibold bg-[#378ADD] text-text shadow-md shadow-[#378ADD]/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
                    >
                      Usar comodín
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Bottom Hint */}
            <p className="text-[11px] text-center text-text-muted pt-1">
              Tus cambios se guardan y recalculan las rachas automáticamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
