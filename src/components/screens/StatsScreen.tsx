import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Flame,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Tag,
} from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { CATEGORIAS } from '../../types';
import {
  getTodayString,
  parseDateString,
  formatDateToString,
  isHabitScheduledForDate,
  isHabitCompletedOnDate,
} from '../../utils/habitUtils';

type PeriodRange = '7d' | '30d' | 'all';

interface DayMetric {
  dateStr: string;
  dayLabel: string;
  fullDateLabel: string;
  completedCount: number;
  scheduledCount: number;
  completionRate: number; // 0 to 100
  isToday: boolean;
}

export const StatsScreen: React.FC = () => {
  const { habitosActivos: habitos, registros, mejorRacha, rachaActual, rachaGlobal } = useHabitStore();
  const [selectedRange, setSelectedRange] = useState<PeriodRange>('7d');
  const [hoveredDay, setHoveredDay] = useState<DayMetric | null>(null);

  const todayStr = getTodayString();

  // 1. Generate array of dates corresponding to the selected period
  const dateRangeList = useMemo(() => {
    const todayDate = parseDateString(todayStr);

    let numDays = 7;
    if (selectedRange === '30d') {
      numDays = 30;
    } else if (selectedRange === 'all') {
      // Find oldest creation date or oldest record
      let oldestDate = todayDate;
      habitos.forEach((h) => {
        if (h.creadoEn) {
          const d = new Date(h.creadoEn);
          if (!isNaN(d.getTime()) && d < oldestDate) oldestDate = d;
        }
      });
      registros.forEach((r) => {
        if (r.fecha) {
          const d = parseDateString(r.fecha);
          if (d < oldestDate) oldestDate = d;
        }
      });

      const diffTime = Math.abs(todayDate.getTime() - oldestDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      numDays = Math.min(90, Math.max(7, diffDays)); // Cap at 90 days for clean chart rendering
    }

    const list: string[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      list.push(formatDateToString(d));
    }
    return list;
  }, [selectedRange, todayStr, habitos, registros]);

  // 2. Compute metrics for each day in range
  const dailyMetrics = useMemo<DayMetric[]>(() => {
    const spanishWeekdaysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const spanishMonthsShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return dateRangeList.map((dateStr) => {
      const d = parseDateString(dateStr);
      const dayOfWeek = d.getDay();
      const dayNum = d.getDate();
      const monthIdx = d.getMonth();

      let scheduled = 0;
      let completed = 0;

      habitos.forEach((h) => {
        if (isHabitScheduledForDate(h, dateStr)) {
          scheduled++;
          if (isHabitCompletedOnDate(h.id, dateStr, registros)) {
            completed++;
          }
        }
      });

      const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
      const dayLabel = selectedRange === '7d'
        ? spanishWeekdaysShort[dayOfWeek]
        : selectedRange === '30d'
        ? (dayNum === 1 || dayNum % 5 === 0 ? `${dayNum} ${spanishMonthsShort[monthIdx]}` : `${dayNum}`)
        : `${dayNum}/${monthIdx + 1}`;

      const fullDateLabel = `${spanishWeekdaysShort[dayOfWeek]} ${dayNum} de ${spanishMonthsShort[monthIdx]}`;

      return {
        dateStr,
        dayLabel,
        fullDateLabel,
        completedCount: completed,
        scheduledCount: scheduled,
        completionRate: rate,
        isToday: dateStr === todayStr,
      };
    });
  }, [dateRangeList, habitos, registros, selectedRange, todayStr]);

  // Max habits completed in a single day for relative height scaling
  const maxCompletedInPeriod = useMemo(() => {
    const max = Math.max(...dailyMetrics.map((d) => d.completedCount), 1);
    return Math.max(max, habitos.length > 0 ? habitos.length : 4);
  }, [dailyMetrics, habitos.length]);

  // 3. Compute habit-by-habit breakdowns in range
  const habitBreakdowns = useMemo(() => {
    return habitos.filter((h) => h.frecuencia !== 'semanal').map((habito) => {
      let scheduledInPeriod = 0;
      let completedInPeriod = 0;

      dateRangeList.forEach((dateStr) => {
        if (isHabitScheduledForDate(habito, dateStr)) {
          scheduledInPeriod++;
          if (isHabitCompletedOnDate(habito.id, dateStr, registros)) {
            completedInPeriod++;
          }
        }
      });

      const rateInPeriod = scheduledInPeriod > 0
        ? Math.round((completedInPeriod / scheduledInPeriod) * 100)
        : 0;

      return {
        habito,
        streak: rachaActual(habito.id),
        bestStreak: mejorRacha(habito.id),
        completedInPeriod,
        scheduledInPeriod,
        rateInPeriod,
      };
    }).sort((a, b) => b.rateInPeriod - a.rateInPeriod || b.streak - a.streak);
  }, [habitos, dateRangeList, registros, rachaActual, mejorRacha]);

  // 4. Category-by-Category breakdown in selected range
  const categoryBreakdowns = useMemo(() => {
    if (habitos.length === 0) return [];

    const activeCategories: {
      key: string;
      label: string;
      color: string;
      icono: string;
      habitCount: number;
      scheduledInPeriod: number;
      completedInPeriod: number;
      rateInPeriod: number;
      isUncategorized?: boolean;
    }[] = [];

    // Process each defined category that has at least 1 habit
    CATEGORIAS.forEach((cat) => {
      const habitsInCat = habitos.filter((h) => h.categoria === cat.key);
      if (habitsInCat.length === 0) return;

      let scheduledInPeriod = 0;
      let completedInPeriod = 0;

      habitsInCat.forEach((h) => {
        dateRangeList.forEach((dateStr) => {
          if (isHabitScheduledForDate(h, dateStr)) {
            scheduledInPeriod++;
            if (isHabitCompletedOnDate(h.id, dateStr, registros)) {
              completedInPeriod++;
            }
          }
        });
      });

      const rateInPeriod = scheduledInPeriod > 0
        ? Math.round((completedInPeriod / scheduledInPeriod) * 100)
        : 0;

      activeCategories.push({
        key: cat.key,
        label: cat.label,
        color: cat.color,
        icono: cat.icono,
        habitCount: habitsInCat.length,
        scheduledInPeriod,
        completedInPeriod,
        rateInPeriod,
        isUncategorized: false,
      });
    });

    // Sort categorized by completion rate (highest to lowest), then by habitCount
    activeCategories.sort((a, b) => b.rateInPeriod - a.rateInPeriod || b.habitCount - a.habitCount);

    // Process uncategorized habits (always at the end)
    const uncategorizedHabits = habitos.filter((h) => !h.categoria);
    if (uncategorizedHabits.length > 0) {
      let uncatScheduled = 0;
      let uncatCompleted = 0;

      uncategorizedHabits.forEach((h) => {
        dateRangeList.forEach((dateStr) => {
          if (isHabitScheduledForDate(h, dateStr)) {
            uncatScheduled++;
            if (isHabitCompletedOnDate(h.id, dateStr, registros)) {
              uncatCompleted++;
            }
          }
        });
      });

      const uncatRate = uncatScheduled > 0
        ? Math.round((uncatCompleted / uncatScheduled) * 100)
        : 0;

      activeCategories.push({
        key: 'sin_categoria',
        label: 'Sin categoría',
        color: '#6B6F7B',
        icono: 'Tag',
        habitCount: uncategorizedHabits.length,
        scheduledInPeriod: uncatScheduled,
        completedInPeriod: uncatCompleted,
        rateInPeriod: uncatRate,
        isUncategorized: true,
      });
    }

    return activeCategories;
  }, [habitos, dateRangeList, registros]);

  // 4. Period Summary Cards
  const periodSummary = useMemo(() => {
    let totalScheduled = 0;
    let totalCompleted = 0;

    dailyMetrics.forEach((d) => {
      totalScheduled += d.scheduledCount;
      totalCompleted += d.completedCount;
    });

    const avgRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    const bestHabit = habitBreakdowns.length > 0 && habitBreakdowns[0].rateInPeriod > 0
      ? habitBreakdowns[0].habito.nombre
      : (habitos.length > 0 ? habitos[0].nombre : '—');

    const maxAllTimeStreak = habitos.reduce((max, h) => Math.max(max, mejorRacha(h.id)), 0);

    return {
      avgRate,
      totalCompleted,
      bestHabit,
      maxAllTimeStreak,
    };
  }, [dailyMetrics, habitBreakdowns, habitos, mejorRacha]);

  // SVG Line/Area Path generator for Rate chart
  const areaSvgPoints = useMemo(() => {
    if (dailyMetrics.length === 0) return { path: '', areaPath: '', points: [] };
    const width = 360;
    const height = 110;
    const paddingX = 12;
    const paddingY = 12;

    const availableW = width - paddingX * 2;
    const availableH = height - paddingY * 2;
    const stepX = dailyMetrics.length > 1 ? availableW / (dailyMetrics.length - 1) : availableW / 2;

    const points = dailyMetrics.map((d, idx) => {
      const x = paddingX + idx * stepX;
      // rate from 0 to 100 -> y from height - paddingY to paddingY
      const y = height - paddingY - (d.completionRate / 100) * availableH;
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const first = points[0];
    const last = points[points.length - 1];
    const areaD = `${pathD} L ${last.x} ${height} L ${first.x} ${height} Z`;

    return { path: pathD, areaPath: areaD, points };
  }, [dailyMetrics]);

  return (
    <div id="screen-stats" className="space-y-6 pb-28 animate-fadeIn">
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-medium text-[#6B6F7B] tracking-wide uppercase font-sans">
            Análisis de Rendimiento
          </p>
          <h1 className="text-2xl font-bold font-heading text-[#F4F4F6] tracking-tight mt-0.5">
            Estadísticas
          </h1>
        </div>

        {/* Global Overall Streak Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-heading font-semibold">
          <Flame size={14} className="fill-[#F59E0B]" />
          <span>{rachaGlobal()} d racha</span>
        </div>
      </header>

      {/* 1. PERIOD SELECTOR CHIPS */}
      <section id="stats-period-selector" className="space-y-1.5">
        <div className="grid grid-cols-3 gap-2 bg-[#14161D] p-1 rounded-[16px] border border-[#1E2029]">
          <button
            id="period-chip-7d"
            type="button"
            onClick={() => setSelectedRange('7d')}
            className={`py-2 px-3 rounded-[12px] text-xs font-heading font-semibold transition-all ${
              selectedRange === '7d'
                ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-30)]'
                : 'text-[#6B6F7B] hover:text-[#F4F4F6]'
            }`}
          >
            Últimos 7 días
          </button>
          <button
            id="period-chip-30d"
            type="button"
            onClick={() => setSelectedRange('30d')}
            className={`py-2 px-3 rounded-[12px] text-xs font-heading font-semibold transition-all ${
              selectedRange === '30d'
                ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-30)]'
                : 'text-[#6B6F7B] hover:text-[#F4F4F6]'
            }`}
          >
            30 días
          </button>
          <button
            id="period-chip-all"
            type="button"
            onClick={() => setSelectedRange('all')}
            className={`py-2 px-3 rounded-[12px] text-xs font-heading font-semibold transition-all ${
              selectedRange === 'all'
                ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-30)]'
                : 'text-[#6B6F7B] hover:text-[#F4F4F6]'
            }`}
          >
            Todo
          </button>
        </div>
      </section>

      {/* 2. SUMMARY METRIC CARDS (LIGADAS AL RANGO) */}
      <section id="stats-summary-cards" className="grid grid-cols-2 gap-3">
        {/* Card 1: Tasa promedio del periodo */}
        <div className="rounded-[16px] bg-[#14161D] border border-[#1E2029] p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6F7B]">Tasa Promedio</span>
            <div className="p-1.5 rounded-lg bg-[#34D399]/10 text-[#34D399]">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-[#F4F4F6]">
            {periodSummary.avgRate}%
          </p>
          <p className="text-[10px] text-[#6B6F7B]">Efectividad del periodo</p>
        </div>

        {/* Card 2: Mejor racha histórica */}
        <div className="rounded-[16px] bg-[#14161D] border border-[#1E2029] p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6F7B]">Mejor Racha</span>
            <div className="p-1.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <Flame size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-[#F4F4F6]">
            {periodSummary.maxAllTimeStreak} {periodSummary.maxAllTimeStreak === 1 ? 'día' : 'días'}
          </p>
          <p className="text-[10px] text-[#6B6F7B]">Récord individual global</p>
        </div>

        {/* Card 3: Total check-ins del periodo */}
        <div className="rounded-[16px] bg-[#14161D] border border-[#1E2029] p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6F7B]">Check-ins</span>
            <div className="p-1.5 rounded-lg bg-[var(--accent-10)] text-[var(--accent)]">
              <Target size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-[#F4F4F6]">
            {periodSummary.totalCompleted}
          </p>
          <p className="text-[10px] text-[#6B6F7B]">Completados en el rango</p>
        </div>

        {/* Card 4: Hábito más constante */}
        <div className="rounded-[16px] bg-[#14161D] border border-[#1E2029] p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6F7B]">Más Constante</span>
            <div className="p-1.5 rounded-lg bg-[#378ADD]/10 text-[#378ADD]">
              <Award size={16} />
            </div>
          </div>
          <p className="text-base font-bold font-heading text-[#F4F4F6] truncate mt-1">
            {periodSummary.bestHabit}
          </p>
          <p className="text-[10px] text-[#6B6F7B]">Mayor tasa de éxito</p>
        </div>
      </section>

      {/* 3. GRÁFICO DE ACTIVIDAD REAL (BARRAS) */}
      <section
        id="stats-activity-chart-card"
        className="rounded-[18px] bg-[#14161D] border border-[#1E2029] p-5 space-y-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[var(--accent)]" />
            <h2 className="text-sm font-bold font-heading text-[#F4F4F6]">
              Actividad Diaria
            </h2>
          </div>
          <span className="text-[11px] text-[#6B6F7B]">
            {selectedRange === '7d' ? '7 días' : selectedRange === '30d' ? '30 días' : 'Histórico'}
          </span>
        </div>

        {/* Active hover info pill */}
        <div className="h-6 flex items-center justify-between px-2 bg-[#1A1C24]/60 rounded-lg border border-[#1E2029]">
          {hoveredDay ? (
            <div className="flex items-center justify-between w-full text-xs animate-fadeIn">
              <span className="text-[#9498A8] font-medium">{hoveredDay.fullDateLabel}</span>
              <span className="font-heading font-bold text-[var(--accent)]">
                {hoveredDay.completedCount} de {hoveredDay.scheduledCount} completados ({hoveredDay.completionRate}%)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#5C6070]">
              <Info size={12} />
              <span>Toca o pasa el cursor sobre una barra para ver detalles</span>
            </div>
          )}
        </div>

        {/* Real Bar Columns */}
        {habitos.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs text-[#6B6F7B]">Crea hábitos para visualizar tu actividad.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-36 flex items-end justify-between gap-1 pt-4 px-1 border-b border-[#1E2029]">
              {dailyMetrics.map((day) => {
                const heightPercent = maxCompletedInPeriod > 0
                  ? Math.max(8, Math.round((day.completedCount / maxCompletedInPeriod) * 100))
                  : 8;

                const isZero = day.completedCount === 0;

                return (
                  <div
                    key={day.dateStr}
                    onMouseEnter={() => setHoveredDay(day)}
                    onTouchStart={() => setHoveredDay(day)}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                  >
                    {/* Hover tooltip value */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-white mb-0.5">
                      {day.completedCount}
                    </div>

                    {/* Bar element */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        day.isToday
                          ? 'bg-[var(--accent)] shadow-md shadow-[var(--accent-40)] ring-1 ring-[var(--accent)]'
                          : isZero
                          ? 'bg-[#1E2029]/80 group-hover:bg-[var(--accent-30)]'
                          : 'bg-[var(--accent-60)] group-hover:bg-[var(--accent)]'
                      }`}
                      style={{ height: `${isZero ? 6 : heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center px-1 text-[10px] text-[#6B6F7B] font-mono">
              {selectedRange === '7d' ? (
                dailyMetrics.map((d) => (
                  <span
                    key={d.dateStr}
                    className={`flex-1 text-center truncate ${d.isToday ? 'text-[var(--accent)] font-bold' : ''}`}
                  >
                    {d.dayLabel}
                  </span>
                ))
              ) : selectedRange === '30d' ? (
                <>
                  <span>{dailyMetrics[0]?.dayLabel}</span>
                  <span>{dailyMetrics[Math.floor(dailyMetrics.length / 2)]?.dayLabel}</span>
                  <span className="text-[var(--accent)] font-bold">Hoy</span>
                </>
              ) : (
                <>
                  <span>Inicio</span>
                  <span>{dailyMetrics[Math.floor(dailyMetrics.length / 2)]?.dayLabel}</span>
                  <span className="text-[var(--accent)] font-bold">Hoy</span>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. TASA DE CONSTANCIA (% CUMPLIMIENTO DIARIO EN ÁREA ESMERALDA) */}
      <section
        id="stats-consistency-rate-card"
        className="rounded-[18px] bg-[#14161D] border border-[#1E2029] p-5 space-y-4 shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#34D399]" />
            <h2 className="text-sm font-bold font-heading text-[#F4F4F6]">
              Tasa de Constancia
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#34D399] font-semibold">
            {periodSummary.avgRate}% prom.
          </span>
        </div>

        {habitos.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs text-[#6B6F7B]">Sin registros para calcular constancia.</p>
          </div>
        ) : (
          <div className="relative pt-2">
            {/* SVG Area and Line Chart */}
            <div className="w-full h-32">
              <svg viewBox="0 0 360 110" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines (0%, 50%, 100%) */}
                <line x1="0" y1="12" x2="360" y2="12" stroke="#1E2029" strokeDasharray="3,3" />
                <line x1="0" y1="61" x2="360" y2="61" stroke="#1E2029" strokeDasharray="3,3" />
                <line x1="0" y1="98" x2="360" y2="98" stroke="#1E2029" />

                {/* Area under curve */}
                {areaSvgPoints.areaPath && (
                  <path d={areaSvgPoints.areaPath} fill="url(#emeraldGradient)" />
                )}

                {/* Main line */}
                {areaSvgPoints.path && (
                  <path
                    d={areaSvgPoints.path}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Active Dots on line */}
                {areaSvgPoints.points.map((p) => (
                  <circle
                    key={p.dateStr}
                    cx={p.x}
                    cy={p.y}
                    r={p.isToday ? 4.5 : 2.5}
                    fill={p.isToday ? '#34D399' : '#14161D'}
                    stroke="#34D399"
                    strokeWidth={p.isToday ? 2 : 1.5}
                    className="transition-all hover:r-5 cursor-pointer"
                    onMouseEnter={() => setHoveredDay(p)}
                    onTouchStart={() => setHoveredDay(p)}
                  />
                ))}
              </svg>
            </div>

            {/* Y-Axis guide tags */}
            <div className="flex justify-between text-[9px] text-[#5C6070] font-mono pt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100% éxito</span>
            </div>
          </div>
        )}
      </section>

      {/* 5. POR CATEGORÍA */}
      <section id="stats-category-breakdown" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-[var(--accent)]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B6F7B]">
              Por Categoría
            </h2>
          </div>
          <span className="text-[11px] text-[#6B6F7B]">
            {selectedRange === '7d' ? 'Últimos 7 días' : selectedRange === '30d' ? '30 días' : 'Todo el historial'}
          </span>
        </div>

        {categoryBreakdowns.length === 0 ? (
          <div className="rounded-[16px] bg-[#14161D] border border-[#1E2029] p-6 text-center text-xs text-[#6B6F7B]">
            No hay hábitos registrados para categorizar.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {categoryBreakdowns.map((cat) => (
              <div
                key={cat.key}
                id={`stat-category-row-${cat.key}`}
                className="rounded-[16px] bg-[#14161D] border border-[#1E2029] hover:border-[#2D313F] p-3.5 space-y-2.5 transition-all shadow-md"
              >
                {/* Top Row: Icon + Name + Habits Count + % */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        color: cat.color,
                        border: `1px solid ${cat.color}40`,
                      }}
                    >
                      <HabitIcon name={cat.icono} size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold font-heading text-[#F4F4F6] truncate">
                        {cat.label}
                      </h3>
                      <p className="text-[11px] text-[#6B6F7B] mt-0.5">
                        {cat.habitCount} {cat.habitCount === 1 ? 'hábito' : 'hábitos'}
                      </p>
                    </div>
                  </div>

                  {/* Rate Percentage Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-base font-bold font-heading text-[#F4F4F6]">
                      {cat.rateInPeriod}%
                    </span>
                    <p className="text-[10px] text-[#6B6F7B]">
                      {cat.completedInPeriod}/{cat.scheduledInPeriod} check-ins
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1A1C24] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.rateInPeriod}%`,
                      backgroundColor: cat.color,
                      boxShadow: cat.rateInPeriod > 0 ? `0 0 8px ${cat.color}80` : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. DESGLOSE POR HÁBITO (ORDENADO POR TASA DE ÉXITO) */}
      <section id="stats-habit-breakdown" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[var(--accent)]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B6F7B]">
              Desglose por Hábito ({habitos.length})
            </h2>
          </div>
          <span className="text-[11px] text-[#6B6F7B]">Ordenado por tasa</span>
        </div>

        {habitBreakdowns.length === 0 ? (
          <div className="rounded-[16px] bg-[#14161D] border border-[#1E2029] p-6 text-center text-xs text-[#6B6F7B]">
            No tienes hábitos registrados aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {habitBreakdowns.map(({ habito, streak, bestStreak, rateInPeriod, completedInPeriod, scheduledInPeriod }) => {
              return (
                <article
                  key={habito.id}
                  id={`stat-habit-row-${habito.id}`}
                  className="rounded-[16px] bg-[#14161D] border border-[#1E2029] hover:border-[#2D313F] p-3.5 space-y-2.5 transition-all shadow-md"
                >
                  {/* Top Row: Icon + Name + Streaks */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${habito.color}20`,
                          color: habito.color,
                          border: `1px solid ${habito.color}40`,
                        }}
                      >
                        <HabitIcon name={habito.icono} size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold font-heading text-[#F4F4F6] truncate">
                          {habito.nombre}
                        </h3>
                        <div className="flex items-center gap-2.5 mt-0.5 text-[11px]">
                          {/* Current Streak */}
                          <span className="flex items-center gap-1 text-[#F59E0B] font-medium font-heading">
                            <Flame size={12} className="fill-[#F59E0B]" />
                            {streak} {streak === 1 ? 'día' : 'días'}
                          </span>
                          <span className="text-[#3E4250]">•</span>
                          {/* Best Streak */}
                          <span className="text-[#6B6F7B]">
                            Récord: <strong className="text-[#9498A8]">{bestStreak}d</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rate Percentage Badge */}
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-heading text-[#F4F4F6]">
                        {rateInPeriod}%
                      </span>
                      <p className="text-[10px] text-[#6B6F7B]">
                        {completedInPeriod}/{scheduledInPeriod} días
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#1A1C24] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${rateInPeriod}%`,
                        backgroundColor: habito.color,
                        boxShadow: rateInPeriod > 0 ? `0 0 8px ${habito.color}80` : undefined,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
