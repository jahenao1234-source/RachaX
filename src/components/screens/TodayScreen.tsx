import React, { useState, useMemo } from 'react';
import { Flame, Plus, Check, Sparkles, Trophy, ChevronDown, ShieldCheck, Minus, CalendarRange, Link2, Zap, Pencil, ListChecks, Play } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Habito, MOMENTOS, Subtarea } from '../../types';
import { getTodayString, contarCompletadosSemana, calcularRachaSemanal, contarHojasSubtareas } from '../../utils/habitUtils';

const STORAGE_SECCIONES_KEY = 'racha_secciones_momento';

const SubtareaTreeNode: React.FC<{
  sub: Subtarea;
  tareaId: string;
  color: string;
  depth?: number;
  onToggle: (tareaId: string, subtareaId: string) => void;
}> = ({ sub, tareaId, color, depth = 0, onToggle }) => {
  const tieneHijos = Boolean(sub.subtareas && sub.subtareas.length > 0);
  const stats = tieneHijos ? contarHojasSubtareas(sub.subtareas) : null;
  const indentPx = Math.min(depth, 4) * 14;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onToggle(tareaId, sub.id)}
        className="w-full flex items-center gap-2.5 p-2 rounded-[10px] hover:bg-[#1A1C24] transition-colors text-left group"
        style={{ paddingLeft: `${indentPx + 8}px` }}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${
            sub.hecha ? 'border-transparent' : 'border-[#2D313F] group-hover:border-[#4B5162]'
          }`}
          style={sub.hecha ? { backgroundColor: color } : undefined}
        >
          {sub.hecha && <Check size={12} strokeWidth={3} className="text-white" />}
        </div>
        <span className={`text-xs flex-1 min-w-0 ${sub.hecha ? 'text-[#5C6070] line-through' : 'text-[#F4F4F6]'}`}>
          {sub.texto}
        </span>
        {tieneHijos && stats && (
          <span className="text-[10px] font-mono text-[#6B6F7B] shrink-0">
            ({stats.hechas}/{stats.total})
          </span>
        )}
      </button>

      {tieneHijos && sub.subtareas && (
        <div className="ml-3 sm:ml-4 pl-2 border-l border-[#2D313F]/60 space-y-1">
          {sub.subtareas.map((child) => (
            <SubtareaTreeNode
              key={child.id}
              sub={child}
              tareaId={tareaId}
              color={color}
              depth={depth + 1}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TodayScreen: React.FC = () => {
  const {
    habitosDeHoy,
    toggleCompletado,
    setValor,
    valorDe,
    esHabitoCompletado,
    rachaActual,
    rachaGlobal,
    progresoDelDia,
    completadosHoy,
    openCreateModal,
    openHabitDetail,
    openManageHabits,
    openFocusMode,
    rutinas,
    openRutinaEditor,
    tareas,
    toggleSubtarea,
    openTareaEditor,
    habitosActivos,
    registros,
    ordenMomentos,
  } = useHabitStore();

  const hoy = getTodayString();

  const [expandedTarea, setExpandedTarea] = useState<string | null>(null);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SECCIONES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error leyendo racha_secciones_momento:', e);
    }
    return {};
  });

  const toggleSection = (momentoId: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [momentoId]: !prev[momentoId] };
      try {
        localStorage.setItem(STORAGE_SECCIONES_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Error guardando racha_secciones_momento:', e);
      }
      return next;
    });
  };

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const globalStreak = rachaGlobal();
  const progressPercent = progresoDelDia();
  const completedCount = completadosHoy();
  const totalToday = habitosDeHoy.length;
  const weeklyHabits = habitosActivos.filter((h) => h.frecuencia === 'semanal');

  const sectionsWithHabits = useMemo(() => {
    return ordenMomentos
      .map((momId) => MOMENTOS.find((m) => m.id === momId))
      .filter((m): m is typeof MOMENTOS[number] => Boolean(m))
      .map((momentoInfo) => {
        const momentHabits = habitosDeHoy
          .filter((h) => (h.momento || 'flexible') === momentoInfo.id)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        const total = momentHabits.length;
        const completed = momentHabits.filter((h) => esHabitoCompletado(h.id)).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { momentoInfo, habits: momentHabits, total, completed, progressPercent: progress };
      })
      .filter((section) => section.total > 0);
  }, [habitosDeHoy, registros, esHabitoCompletado, ordenMomentos]);

  return (
    <div id="screen-today" className="space-y-5 pb-28 animate-fadeIn">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-medium text-[#6B6F7B] tracking-wide uppercase font-sans">
            {displayDate}
          </p>
          <h1 className="text-2xl font-bold font-heading text-[#F4F4F6] tracking-tight mt-0.5">
            Hoy
          </h1>
        </div>

        {/* Global Streak Pill */}
        <div
          id="today-streak-badge"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] transition-all shadow-sm shadow-[#F59E0B]/10"
        >
          <Flame size={17} className="fill-[#F59E0B]" />
          <span className="font-heading font-semibold text-sm">
            {globalStreak} {globalStreak === 1 ? 'día' : 'días'}
          </span>
        </div>
      </header>

      {/* Daily Progress Dashboard Ring Card */}
      {totalToday > 0 && (
        <section
          id="today-progress-card"
          className="relative overflow-hidden rounded-[18px] bg-[#14161D] border border-[#1E2029] p-4.5 shadow-xl transition-all"
        >
          {/* Subtle Ambient Light */}
          <div
            className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-500"
            style={{
              backgroundColor: progressPercent === 100 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(139, 92, 246, 0.15)',
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                    progressPercent === 100
                      ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30'
                      : 'bg-[var(--accent-15)] text-[var(--accent)] border-[var(--accent-30)]'
                  }`}
                >
                  {progressPercent === 100 ? '¡Día Completado!' : 'Progreso Diario'}
                </span>
              </div>
              <h2 className="text-lg font-bold font-heading text-[#F4F4F6] pt-0.5">
                {completedCount} de {totalToday} completados
              </h2>
              <p className="text-xs text-[#6B6F7B]">
                {progressPercent === 100
                  ? 'Has cumplido todos tus hábitos de hoy. ¡Excelente racha!'
                  : 'Mantén la constancia para no romper tus rachas.'}
              </p>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#1E2029]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke={progressPercent === 100 ? '#34D399' : 'var(--accent)'}
                  fill="none"
                  className="transition-all duration-500 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-heading font-bold text-xs text-[#F4F4F6]">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Linear Progress bar */}
          <div className="mt-3 w-full bg-[#1A1C24] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent === 100 ? 'bg-[#34D399]' : 'bg-[var(--accent)]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>
      )}

      {(totalToday > 0 || rutinas.length > 0) && (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-[var(--accent)]" />
              <h2 className="text-xs font-bold font-heading text-[#F4F4F6]">Enfoque</h2>
            </div>
            <button type="button" onClick={() => openRutinaEditor(null)} className="text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              + Nueva rutina
            </button>
          </div>
          <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {totalToday > 0 && (
              <button type="button" onClick={() => openFocusMode({ tipo: 'dia' })}
                className="shrink-0 w-[150px] rounded-[16px] bg-[var(--accent-10)] border border-[var(--accent-20)] p-3 text-left active:scale-[0.98] transition-all">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center mb-2"><Zap size={16} /></div>
                <p className="text-xs font-bold font-heading text-[#F4F4F6] truncate">Enfoque del día</p>
                <p className="text-[10px] text-[#6B6F7B] mt-0.5">{totalToday} de hoy</p>
              </button>
            )}
            {rutinas.map((rutina) => (
              <div key={rutina.id} className="relative shrink-0 w-[150px]">
                <button type="button" onClick={() => openFocusMode({ tipo: 'rutina', nombre: rutina.nombre, habitoIds: rutina.habitoIds })}
                  className="w-full h-full rounded-[16px] bg-[#14161D] border border-[#1E2029] hover:border-[#2D313F] p-3 text-left active:scale-[0.98] transition-all">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${rutina.color}20`, color: rutina.color, border: `1px solid ${rutina.color}40` }}>
                    <HabitIcon name={rutina.icono} size={16} />
                  </div>
                  <p className="text-xs font-bold font-heading text-[#F4F4F6] truncate pr-5">{rutina.nombre}</p>
                  <p className="text-[10px] text-[#6B6F7B] mt-0.5">{rutina.habitoIds.length} hábitos</p>
                </button>
                <button type="button" onClick={() => openRutinaEditor(rutina)} aria-label="Editar rutina"
                  className="absolute top-2 right-2 w-6 h-6 rounded-md bg-[#1A1C24] text-[#6B6F7B] hover:text-white flex items-center justify-center">
                  <Pencil size={12} />
                </button>
              </div>
            ))}
            {rutinas.length === 0 && (
              <button type="button" onClick={() => openRutinaEditor(null)}
                className="shrink-0 w-[150px] rounded-[16px] border border-dashed border-[#2D313F] p-3 text-left text-[#6B6F7B] hover:text-[#9498A8] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#1A1C24] flex items-center justify-center mb-2"><Plus size={16} /></div>
                <p className="text-xs font-bold font-heading">Nueva rutina</p>
                <p className="text-[10px] mt-0.5">Agrupa hábitos</p>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Habit List by Momento */}
      <section className="space-y-4">
        {(totalToday > 0 || weeklyHabits.length > 0) && (
          <div className="flex items-center justify-end px-1 -mb-1">
            <button
              type="button"
              onClick={openManageHabits}
              className="text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Gestionar hábitos
            </button>
          </div>
        )}

        {totalToday === 0 && weeklyHabits.length === 0 ? (
          /* Empty State */
          <div
            id="today-empty-state"
            className="rounded-[20px] bg-[#14161D]/70 border border-[#1E2029] p-8 text-center space-y-4 shadow-xl animate-fadeIn"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-10)] text-[var(--accent)] border border-[var(--accent-20)] flex items-center justify-center mx-auto shadow-inner">
              <Sparkles size={28} />
            </div>

            <div className="space-y-1.5 max-w-[280px] mx-auto">
              <h3 className="text-base font-bold font-heading text-[#F4F4F6]">
                {habitosActivos.length === 0 ? 'Comienza tu primera racha' : 'Sin hábitos para hoy'}
              </h3>
              <p className="text-xs text-[#6B6F7B] leading-relaxed">
                {habitosActivos.length === 0
                  ? 'Crea tu primer hábito diario para comenzar a registrar tu constancia y subir de nivel.'
                  : 'No tienes hábitos programados para el día de hoy según su frecuencia configurada.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                id="empty-create-habit-cta"
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold font-heading shadow-lg shadow-[var(--accent-30)] transition-all active:scale-95"
              >
                <Plus size={16} strokeWidth={2.5} />
                Crear Hábito
              </button>

              {habitosActivos.length > 0 && (
                <button
                  type="button"
                  onClick={openManageHabits}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[#14161D] hover:bg-[#1A1C24] border border-[#1E2029] text-[#9498A8] text-xs font-semibold font-heading transition-all"
                >
                  Ver todos ({habitosActivos.length})
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Momento Sections */
          <div className="space-y-4">
            {sectionsWithHabits.map(({ momentoInfo, habits: momentHabits, total, completed, progressPercent: sectionProgress }) => {
              const isCollapsed = Boolean(collapsedSections[momentoInfo.id]);
              const isSectionComplete = completed === total && total > 0;

              return (
                <div
                  key={momentoInfo.id}
                  id={`today-section-${momentoInfo.id}`}
                  className="space-y-2"
                >
                  {/* Collapsible Section Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(momentoInfo.id)}
                    aria-expanded={!isCollapsed}
                    className="w-full flex items-center justify-between py-1.5 px-1 rounded-xl group select-none hover:bg-[#14161D]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                          isSectionComplete
                            ? 'text-[#34D399] bg-[#34D399]/10 border-[#34D399]/20'
                            : 'text-[var(--accent)] bg-[var(--accent-10)] border-[var(--accent-20)]'
                        }`}
                      >
                        <HabitIcon name={momentoInfo.icono} size={15} />
                      </div>
                      <span className="text-xs font-bold font-heading text-[#F4F4F6] group-hover:text-white transition-colors">
                        {momentoInfo.label}
                      </span>
                      <span className="text-[11px] font-mono text-[#6B6F7B]">
                        ({total})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Section Progress Mini Bar & Count */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-medium font-mono ${
                            isSectionComplete ? 'text-[#34D399]' : 'text-[#9498A8]'
                          }`}
                        >
                          {completed}/{total}
                        </span>
                        <div className="w-12 sm:w-16 h-1.5 bg-[#1E2029] rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSectionComplete ? 'bg-[#34D399]' : 'bg-[var(--accent)]'
                            }`}
                            style={{ width: `${sectionProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Collapse Chevron */}
                      <div
                        className={`text-[#6B6F7B] group-hover:text-[#F4F4F6] transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      >
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </button>

                  {/* Habit Cards in this section */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 animate-fadeIn">
                      {momentHabits.map((habito: Habito) => {
                        const completedHabit = esHabitoCompletado(habito.id);
                        const streak = rachaActual(habito.id);
                        const isNegativo = habito.tipo === 'negativo';

                        return (
                          <article
                            key={habito.id}
                            id={`habit-card-${habito.id}`}
                            onClick={() => openHabitDetail(habito.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openHabitDetail(habito.id);
                              }
                            }}
                            className={`group relative rounded-[16px] border transition-all duration-200 p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                              completedHabit
                                ? 'bg-[#14161D]/90 border-[#1E2029] opacity-90'
                                : 'bg-[#14161D] border-[#1E2029] hover:border-[#2D313F] shadow-lg shadow-black/40'
                            }`}
                          >
                            {/* Left: Icon & Title & Streak */}
                            <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                              {/* Icon Container with Habit's accent color */}
                              <div
                                className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                                style={{
                                  backgroundColor: `${habito.color}20`,
                                  color: habito.color,
                                  border: `1px solid ${habito.color}40`,
                                }}
                              >
                                <HabitIcon name={habito.icono} size={20} />
                              </div>

                              {/* Habit Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4
                                    className={`text-sm font-semibold font-heading tracking-tight truncate transition-all ${
                                      completedHabit
                                        ? isNegativo
                                          ? 'text-[#9498A8]'
                                          : 'text-[#9498A8] line-through decoration-[#5C6070]'
                                        : 'text-[#F4F4F6]'
                                    }`}
                                  >
                                    {habito.nombre}
                                  </h4>

                                  {isNegativo && completedHabit && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] font-medium shrink-0 animate-fadeIn">
                                      Resististe 💪
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-0.5">
                                  {/* Streak Counter */}
                                  <div className="flex items-center gap-1 text-[11px] font-medium font-heading text-[#F59E0B]">
                                    <Flame size={13} className="fill-[#F59E0B]" />
                                    <span>
                                      {streak} {streak === 1 ? 'día' : 'días'}{isNegativo ? ' sin recaer' : ''}
                                    </span>
                                  </div>

                                  {/* Negative Habit Pill */}
                                  {isNegativo && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#5C6070]/20 text-[#9498A8] border border-[#5C6070]/30 inline-flex items-center gap-0.5 font-medium">
                                      <ShieldCheck size={11} className="text-[#9498A8]" />
                                      Evitar
                                    </span>
                                  )}

                                  {/* Frequency Tag */}
                                  <span className="text-[10px] text-[#5C6070]">
                                    {habito.frecuencia === 'diario'
                                      ? 'Diario'
                                      : habito.frecuencia === 'entreSemana'
                                      ? 'L-V'
                                      : 'Personalizado'}
                                  </span>

                                  {/* Target if present */}
                                  {habito.metaDiaria && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1A1C24] text-[#6B6F7B] border border-[#1E2029]">
                                      Meta: {habito.metaDiaria}
                                    </span>
                                  )}
                                </div>

                                {habito.anclaje && (
                                  <p className="text-[10px] text-[#6B6F7B] mt-1 flex items-center gap-1 truncate">
                                    <Link2 size={10} className="shrink-0 text-[var(--accent)]" />
                                    <span className="truncate">Después de {habito.anclaje}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Interactive Check Circle Button or Counter */}
                            {habito.metaDiaria ? (
                              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setValor(habito.id, hoy, valorDe(habito.id) - 1); }}
                                  disabled={valorDe(habito.id) <= 0}
                                  aria-label={`Quitar uno a ${habito.nombre}`}
                                  className="w-8 h-8 rounded-full border-2 border-[#2D313F] text-[#9498A8] hover:text-[#F4F4F6] hover:border-[#6B6F7B] flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <Minus size={15} strokeWidth={2.5} />
                                </button>
                                <div
                                  className="min-w-[48px] h-9 px-1.5 rounded-full flex items-center justify-center gap-1 text-xs font-bold font-heading border-2 transition-all"
                                  style={completedHabit
                                    ? { backgroundColor: habito.color, borderColor: habito.color, color: '#FFFFFF', boxShadow: `0 0 14px -2px ${habito.color}60` }
                                    : { borderColor: '#2D313F', color: '#F4F4F6', backgroundColor: 'transparent' }}
                                >
                                  {completedHabit && <Check size={13} strokeWidth={3} />}
                                  <span>{valorDe(habito.id)}/{habito.metaDiaria}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setValor(habito.id, hoy, valorDe(habito.id) + 1); }}
                                  aria-label={`Sumar uno a ${habito.nombre}`}
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                                  style={{ backgroundColor: habito.color, boxShadow: `0 0 14px -2px ${habito.color}60` }}
                                >
                                  <Plus size={15} strokeWidth={2.5} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompletado(habito.id);
                                }}
                                aria-label={completedHabit ? `Desmarcar ${habito.nombre}` : `Completar ${habito.nombre}`}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 focus:outline-none z-10 ${
                                  completedHabit
                                    ? 'shadow-md scale-100'
                                    : 'border-2 border-[#2D313F] hover:border-[#6B6F7B] bg-transparent'
                                }`}
                                style={{
                                  backgroundColor: completedHabit ? habito.color : 'transparent',
                                  borderColor: completedHabit ? habito.color : undefined,
                                  boxShadow: completedHabit ? `0 0 16px -2px ${habito.color}60` : undefined,
                                }}
                              >
                                {completedHabit && (
                                  <Check
                                    size={20}
                                    strokeWidth={3}
                                    className="text-white animate-scaleIn drop-shadow"
                                  />
                                )}
                              </button>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {weeklyHabits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 pt-1">
              <div className="p-1.5 rounded-lg bg-[var(--accent-10)] text-[var(--accent)] border border-[var(--accent-20)]">
                <CalendarRange size={15} />
              </div>
              <span className="text-xs font-bold font-heading text-[#F4F4F6]">Esta semana</span>
              <span className="text-[11px] font-mono text-[#6B6F7B]">({weeklyHabits.length})</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {weeklyHabits.map((habito) => {
                const hechos = contarCompletadosSemana(habito.id, hoy, registros);
                const meta = habito.vecesPorSemana && habito.vecesPorSemana > 0 ? habito.vecesPorSemana : 1;
                const cumplido = hechos >= meta;
                const hoyHecho = esHabitoCompletado(habito.id);
                const semanas = calcularRachaSemanal(habito, registros, hoy);
                return (
                  <article
                    key={habito.id}
                    onClick={() => openHabitDetail(habito.id)}
                    className="group rounded-[16px] border border-[#1E2029] bg-[#14161D] p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all shadow-lg shadow-black/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                      <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${habito.color}20`, color: habito.color, border: `1px solid ${habito.color}40` }}>
                        <HabitIcon name={habito.icono} size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold font-heading tracking-tight truncate text-[#F4F4F6]">{habito.nombre}</h4>
                          {cumplido && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] font-medium shrink-0">Meta lograda</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium font-heading text-[var(--accent)]">{hechos}/{meta} esta semana</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: meta }).map((_, i) => (
                              <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i < hechos ? habito.color : '#2D313F' }} />
                            ))}
                          </div>
                          {semanas > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-[#F59E0B] font-medium">
                              <Flame size={12} className="fill-[#F59E0B]" />{semanas} sem
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleCompletado(habito.id); }}
                      aria-label={hoyHecho ? `Desmarcar hoy ${habito.nombre}` : `Marcar hoy ${habito.nombre}`}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 z-10 ${hoyHecho ? 'shadow-md' : 'border-2 border-[#2D313F] hover:border-[#6B6F7B] bg-transparent'}`}
                      style={{ backgroundColor: hoyHecho ? habito.color : 'transparent', borderColor: hoyHecho ? habito.color : undefined, boxShadow: hoyHecho ? `0 0 16px -2px ${habito.color}60` : undefined }}
                    >
                      {hoyHecho && <Check size={20} strokeWidth={3} className="text-white" />}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {tareas.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ListChecks size={15} className="text-[var(--accent)]" />
              <h2 className="text-xs font-bold font-heading text-[#F4F4F6]">Tareas</h2>
              <span className="text-[11px] font-mono text-[#6B6F7B]">({tareas.length})</span>
            </div>
            <button type="button" onClick={() => openTareaEditor(null)} className="text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">+ Nueva tarea</button>
          </div>
          <div className="space-y-2.5">
            {tareas.map((tarea) => {
              const { total, hechas } = contarHojasSubtareas(tarea.subtareas);
              const abierta = expandedTarea === tarea.id;
              return (
                <div key={tarea.id} className="rounded-[16px] bg-[#14161D] border border-[#1E2029] shadow-lg shadow-black/40 overflow-hidden">
                  <div className="p-3.5 flex items-center justify-between">
                    <button type="button" onClick={() => setExpandedTarea(abierta ? null : tarea.id)} className="flex items-center gap-3 min-w-0 flex-1 pr-2 text-left">
                      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${tarea.color}20`, color: tarea.color, border: `1px solid ${tarea.color}40` }}>
                        <HabitIcon name={tarea.icono} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-semibold font-heading truncate ${tarea.completada ? 'text-[#9498A8] line-through decoration-[#5C6070]' : 'text-[#F4F4F6]'}`}>{tarea.nombre}</h4>
                          {tarea.completada && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] font-medium shrink-0">Lista</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium font-heading text-[var(--accent)]">{hechas}/{total}</span>
                          <div className="flex-1 max-w-[120px] h-1.5 bg-[#1A1C24] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${total > 0 ? (hechas / total) * 100 : 0}%`, backgroundColor: tarea.color }} />
                          </div>
                          <ChevronDown size={14} className={`text-[#6B6F7B] transition-transform ${abierta ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      <button type="button" onClick={() => openTareaEditor(tarea)} aria-label="Editar tarea" className="w-8 h-8 rounded-lg bg-[#1A1C24] text-[#6B6F7B] hover:text-white flex items-center justify-center"><Pencil size={13} /></button>
                      <button type="button" onClick={() => openFocusMode({ tipo: 'tarea', tareaId: tarea.id })} aria-label="Enfocar tarea" className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shadow-md shadow-[var(--accent-30)]"><Play size={13} className="fill-white" /></button>
                    </div>
                  </div>
                  {abierta && (
                    <div className="px-3.5 pb-3.5 space-y-1 animate-fadeIn">
                      {tarea.subtareas.map((s) => (
                        <SubtareaTreeNode
                          key={s.id}
                          sub={s}
                          tareaId={tarea.id}
                          color={tarea.color}
                          depth={0}
                          onToggle={toggleSubtarea}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Motivational Bottom Quote */}
      {totalToday > 0 && completedCount === totalToday && (
        <div className="rounded-[16px] bg-[#34D399]/10 border border-[#34D399]/30 p-3.5 text-center space-y-1 animate-fadeIn">
          <div className="flex items-center justify-center gap-1.5 text-[#34D399] font-heading font-bold text-xs">
            <Trophy size={16} />
            <span>¡Objetivo del día alcanzado!</span>
          </div>
          <p className="text-[11px] text-[#6B6F7B]">
            Tu constancia es la clave para forjar hábitos duraderos.
          </p>
        </div>
      )}
    </div>
  );
};

