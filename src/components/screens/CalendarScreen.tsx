import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Check, X, ShieldCheck, ChevronRight as ChevronRightIcon, Plus, Minus } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import {
  getTodayString,
  formatDateToString,
  isHabitScheduledForDate,
  isHabitCompletedOnDate,
  parseDateString,
  contarCompletadosSemana
} from '../../utils/habitUtils';
import { tasaPeriodo, calcularMejorRachaGlobal } from '../../utils/progresoUtils';
import { getMomentoColorTokens } from '../common/HabitPreviewRow';

const ordenMomentos = ['manana', 'tarde', 'noche', 'flexible'];

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
    openHabitDetail,
  } = useHabitStore();

  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);

  const todayStr = getTodayString();
  const yesterdayDate = new Date(parseDateString(todayStr));
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const currentYear = viewDate.getFullYear();
  const currentMonthIdx = viewDate.getMonth();

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const isCurrentMonth = currentYear === new Date().getFullYear() && currentMonthIdx === new Date().getMonth();

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (!isCurrentMonth) {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handleGoToCurrentMonth = () => {
    setViewDate(new Date());
  };

  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay();
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Encontrar la fecha del primer hábito creado
  const firstHabitDateStr = useMemo(() => {
    if (habitos.length === 0) return null;
    let earliest = habitos[0].creadoEn;
    for (const h of habitos) {
      if (h.creadoEn < earliest) earliest = h.creadoEn;
    }
    return earliest.split('T')[0];
  }, [habitos]);

  const monthStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
  const isFirstHabitInCurrentMonth = firstHabitDateStr && firstHabitDateStr.startsWith(monthStr) && !firstHabitDateStr.endsWith('-01');

  const monthDays = useMemo(() => {
    const days: { 
      dayNumber: number; 
      dateStr: string; 
      isToday: boolean; 
      isFuture: boolean; 
      isBeforeFirstHabit: boolean;
      programados: number;
      cumplidos: number;
      isFrozen: boolean;
    }[] = [];
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
      
      let programados = 0;
      let cumplidos = 0;
      
      habitos.forEach(h => {
        const createdAt = formatDateToString(new Date(h.creadoEn));
        if (dateStr >= createdAt && isHabitScheduledForDate(h, dateStr)) {
          programados++;
          if (isHabitCompletedOnDate(h.id, dateStr, registros)) {
            cumplidos++;
          }
        }
      });

      days.push({
        dayNumber: d,
        dateStr,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        isBeforeFirstHabit: firstHabitDateStr ? dateStr < firstHabitDateStr : false,
        programados,
        cumplidos,
        isFrozen: diasCongelados.includes(dateStr)
      });
    }
    return days;
  }, [monthStr, daysInMonth, todayStr, habitos, registros, firstHabitDateStr, diasCongelados]);

  // Tu mes: hasta ayer (o hasta el último día si es un mes pasado)
  const monthMetrics = useMemo(() => {
    const startOfMonth = `${monthStr}-01`;
    let calcEndStr = todayStr > monthDays[monthDays.length - 1].dateStr ? monthDays[monthDays.length - 1].dateStr : yesterdayStr;
    if (todayStr <= startOfMonth) {
      return { programados: 0, cumplidos: 0, congelados: 0, pct: 0, racha: 0, lineaMesDificil: null };
    }

    const tp = tasaPeriodo(habitos, registros, diasCongelados, startOfMonth, calcEndStr);
    const racha = calcularMejorRachaGlobal(habitos, registros, diasCongelados, startOfMonth, calcEndStr);

    let lineaMesDificil = null;
    let rachaCeros = 0;
    for (const d of monthDays) {
      if (d.dateStr > calcEndStr) break;
      if (d.programados > 0) {
        if (d.cumplidos === 0 && !d.isFrozen) {
          rachaCeros++;
        } else if (d.cumplidos > 0) {
          if (rachaCeros >= 3) {
             const dayNum = parseInt(d.dateStr.split('-')[2], 10);
             lineaMesDificil = `Volviste el ${dayNum}. Eso es lo que cuenta.`;
          }
          rachaCeros = 0;
        }
      }
    }

    return { ...tp, racha, lineaMesDificil };
  }, [monthStr, todayStr, habitos, registros, diasCongelados, monthDays, yesterdayStr]);

  // Bottom sheet info
  const habitsForSelectedDate = useMemo(() => {
    if (!selectedDateForModal) return [];
    
    const regular = habitos.filter(h => {
      const createdAt = formatDateToString(new Date(h.creadoEn));
      return h.frecuencia !== 'semanal' && selectedDateForModal >= createdAt && isHabitScheduledForDate(h, selectedDateForModal);
    }).map((h) => ({
      ...h,
      isCompleted: isHabitCompletedOnDate(h.id, selectedDateForModal, registros),
    }));

    regular.sort((a, b) => {
       const m1 = ordenMomentos.indexOf(a.momento || 'flexible');
       const m2 = ordenMomentos.indexOf(b.momento || 'flexible');
       if (m1 !== m2) return m1 - m2;
       return (a.orden ?? 99) - (b.orden ?? 99);
    });

    return regular;
  }, [selectedDateForModal, habitos, registros]);

  const weeklyHabitsForSelectedDate = useMemo(() => {
    if (!selectedDateForModal) return [];
    
    const weekly = habitos.filter(h => {
      const createdAt = formatDateToString(new Date(h.creadoEn));
      return h.frecuencia === 'semanal' && selectedDateForModal >= createdAt;
    }).map((h) => ({
      ...h,
      isCompleted: isHabitCompletedOnDate(h.id, selectedDateForModal, registros),
      completadosSemana: contarCompletadosSemana(h.id, selectedDateForModal, registros)
    }));

    weekly.sort((a, b) => {
       const m1 = ordenMomentos.indexOf(a.momento || 'flexible');
       const m2 = ordenMomentos.indexOf(b.momento || 'flexible');
       if (m1 !== m2) return m1 - m2;
       return (a.orden ?? 99) - (b.orden ?? 99);
    });

    return weekly;
  }, [selectedDateForModal, habitos, registros]);

  // Helper formatting for bottom sheet
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateForModal) return '';
    const dateObj = parseDateString(selectedDateForModal);
    const text = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(dateObj);
    return text.charAt(0).toUpperCase() + text.slice(1).replace(',', '');
  }, [selectedDateForModal]);

  return (
    <div id="screen-calendar" className="pb-28">
      {/* CABECERA */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-[44px] leading-none m-0 capitalize text-text">
            {monthNames[currentMonthIdx]}
          </h1>
          <p className="text-[13px] text-text-muted mt-1">{currentYear}</p>
        </div>
        
        {!isCurrentMonth && (
          <button onClick={handleGoToCurrentMonth} className="h-11 px-3 bg-surface-raised rounded-[12px] text-[14px] font-bold text-text hover:text-text shrink-0 active:scale-95 transition-transform">
            Ir a hoy
          </button>
        )}
        
        <button onClick={handlePrevMonth} className="w-11 h-11 bg-surface border border-line rounded-[12px] flex items-center justify-center text-text shrink-0 active:scale-95 transition-transform" aria-label="Mes anterior">
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>
        <button onClick={handleNextMonth} disabled={isCurrentMonth} className="w-11 h-11 bg-surface border border-line rounded-[12px] flex items-center justify-center text-text shrink-0 disabled:text-line-strong disabled:active:scale-100 active:scale-95 transition-transform" aria-label="Mes siguiente">
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-3 min-h-[32px]">
        <span className="text-[13px] text-text-muted">Toca un día para cambiarlo</span>
        {isCurrentMonth && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line text-[13px] font-semibold text-text">
            <ShieldCheck size={14} className="text-lila-text" strokeWidth={2} />
            {comodines} comodines
          </span>
        )}
      </div>

      {/* CUADRICULA */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[12px] font-semibold text-text-muted mb-1.5 mt-3">
        {weekDays.map(d => <span key={d}>{d}</span>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <span key={`empty-${i}`} className="bg-transparent border-none"></span>
        ))}

        {monthDays.map((day) => {
          let state = 'fut';
          if (day.isFuture || day.isBeforeFirstHabit) state = 'fut';
          else if (day.programados === 0) state = 'free';
          else if (day.isFrozen) state = 'como';
          else if (day.cumplidos === day.programados) state = 'full';
          else if (day.cumplidos > 0) state = 'part';
          else state = 'miss';
          
          if (day.isToday && state !== 'fut' && state !== 'como' && state !== 'full') state = 'today';
          if (day.isToday && state === 'part') state = 'today-part';

          const baseClass = "h-[44px] rounded-[10px] flex items-center justify-center font-number text-[14px] font-bold relative active:scale-95 transition-transform overflow-hidden select-none outline-none";
          
          let btnClass = baseClass;
          const wk = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date(currentYear, currentMonthIdx, day.dayNumber));
          let ariaLabel = `${wk.toLowerCase()} ${day.dayNumber}, ${day.cumplidos} de ${day.programados}`;
          
          switch (state) {
            case 'full':
              btnClass += " fill-logro text-ink border border-ambar-text";
              ariaLabel += `, todo cumplido`;
              break;
            case 'part':
              btnClass += " bg-surface text-text border border-line";
              break;
            case 'miss':
              btnClass += " bg-surface text-text-muted border border-line";
              break;
            case 'como':
              btnClass += " bg-comodin-bg text-comodin-text border-[1.5px] border-lila-text";
              ariaLabel += `, congelado con comodín`;
              break;
            case 'free':
              btnClass += " bg-transparent text-text-muted border-[1.5px] border-dashed border-text-muted font-medium";
              ariaLabel = `${wk.toLowerCase()} ${day.dayNumber}, día libre`;
              break;
            case 'today':
              btnClass += " bg-transparent text-text border-[1.5px] border-dashed border-text";
              ariaLabel += `, hoy`;
              break;
            case 'today-part':
              btnClass += " bg-transparent text-text border-[1.5px] border-dashed border-text";
              ariaLabel += `, hoy`;
              break;
            case 'fut':
              btnClass += " bg-transparent border-transparent text-text-muted font-medium cursor-default active:scale-100";
              break;
          }

          if (isFirstHabitInCurrentMonth && day.dateStr === firstHabitDateStr) {
            btnClass += " ring-inset ring-[1.5px] ring-ambar-text";
          }

          const hasBar = (state === 'part' || state === 'today-part') && day.programados > 0;
          const barWidth = hasBar ? `${(day.cumplidos / day.programados) * 100}%` : '0%';

          if (state === 'fut') {
             return <span key={day.dateStr} className={btnClass} aria-hidden="true">{day.dayNumber}</span>;
          }

          return (
            <button 
              key={day.dateStr}
              className={btnClass}
              aria-label={ariaLabel}
              onClick={() => setSelectedDateForModal(day.dateStr)}
            >
              {state === 'como' && <span className="absolute top-[3px] right-[4px]"><ShieldCheck size={10} strokeWidth={3} /></span>}
              <span className={hasBar ? 'pb-1' : ''}>{day.dayNumber}</span>
              {hasBar && (
                <i className="absolute left-[6px] right-[6px] bottom-[6px] h-1 rounded-full bg-track-empty block overflow-hidden" aria-hidden="true">
                  <b className="block h-full rounded-full fill-logro" style={{ width: barWidth }} />
                </i>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-x-3.5 gap-y-2 mt-3 text-[12px] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="w-3 h-3 rounded-[3px] border border-ambar-text fill-logro" /> Todo cumplido
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="w-3 h-3 rounded-[3px] border border-line bg-surface relative overflow-hidden"><b className="absolute left-px right-px bottom-px h-[3px] bg-ambar-text" /></i> Una parte
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="w-3 h-3 rounded-[3px] border border-lila-text bg-comodin-bg" /> Comodín
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="w-3 h-3 rounded-[3px] border-[1.5px] border-dashed border-text-muted bg-transparent" /> Día libre
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="w-3 h-3 rounded-[3px] border-[1.5px] border-dashed border-text bg-transparent" /> Hoy
        </span>
      </div>
      
      {isFirstHabitInCurrentMonth && firstHabitDateStr && (
        <p className="text-[13px] text-text-muted mt-3">
          Empezaste el {parseDateString(firstHabitDateStr).getDate()} de {monthNames[currentMonthIdx]}. Los días de antes no cuentan.
        </p>
      )}

      {/* TARJETA TU MES */}
      <div className="mt-[18px] p-[14px] rounded-[18px] bg-surface border border-line">
        <div className="flex items-baseline justify-between gap-2.5 mb-1.5">
          <h2 className="font-heading font-bold text-[22px] m-0 text-text">Tu mes</h2>
          <span className="text-[13px] text-text-muted">sin contar hoy</span>
        </div>

        {monthMetrics.cumplidos === 0 && monthMetrics.programados > 0 ? (
          <>
            <p className="font-heading font-bold text-[44px] leading-none m-0 mt-1.5 mb-0.5 flex items-baseline gap-2 text-text">
              Retoma hoy
            </p>
            <p className="text-[13px] text-text-muted mt-1 leading-snug">Cada día que marques se suma aquí. Un día gris no borra los demás.</p>
          </>
        ) : (
          <>
            {monthMetrics.lineaMesDificil && (
              <div className="mb-2 mt-1 py-1.5 px-2.5 rounded-[10px] bg-ambar-tint text-[14px] text-text font-semibold flex items-center gap-2">
                <Check size={16} strokeWidth={3} className="text-ambar-text" />
                {monthMetrics.lineaMesDificil}
              </div>
            )}
            <p className="font-heading font-bold text-[44px] leading-none m-0 mt-1.5 mb-0.5 flex items-baseline gap-2 text-text">
              {monthMetrics.pct}%
            </p>
            <p className="text-[13px] text-text-muted leading-snug">
              {monthMetrics.cumplidos} de {monthMetrics.programados} veces cumpliste tus hábitos programados.{' '}
              {monthMetrics.congelados > 0 ? (monthMetrics.congelados === 1 ? 'La congelada con comodín no cuenta en contra. ' : `Las ${monthMetrics.congelados} congeladas con comodín no cuentan en contra. `) : ''}
              Un día gris no borra los demás.
            </p>
          </>
        )}
        
        {(monthDays.filter(d => d.dateStr < todayStr && d.programados > 0 && d.cumplidos === d.programados).length > 0 || monthMetrics.racha >= 2) && (
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-line">
            {(() => {
              const completados = monthDays.filter(d => d.dateStr < todayStr && d.programados > 0 && d.cumplidos === d.programados && !d.isFrozen).length;
              if (completados === 0) return null;
              return (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-bold text-[22px] tabular-nums text-text">{completados}</span>
                  <span className="text-[13px] text-text-muted">{completados === 1 ? 'día completo' : 'días completos'}</span>
                </div>
              );
            })()}
            {monthMetrics.racha >= 2 && (
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-bold text-[22px] tabular-nums text-text">{monthMetrics.racha}</span>
                <span className="text-[13px] text-text-muted">seguidos, tu mejor racha</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* HOJA DEL DIA */}
      {selectedDateForModal && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedDateForModal(null)} />
          <section role="dialog" aria-label={formattedSelectedDate} className="relative w-full bg-bg rounded-t-[22px] border-t border-line shadow-[0_-8px_24px_rgba(0,0,0,0.35)] flex flex-col max-h-[78%]">
            <div className="w-10 h-[5px] rounded-[9px] bg-line-strong mx-auto mt-2 mb-0 shrink-0" />
            
            <div className="flex items-start gap-3 p-3 px-5 border-b border-line pb-2.5">
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-bold text-[24px] m-0 leading-tight text-text">{formattedSelectedDate}</h2>
                <p className="text-[13px] text-text-muted mt-0.5">
                  {habitsForSelectedDate.filter(h => h.isCompleted).length} de {habitsForSelectedDate.length} cumplidos · {diasCongelados.includes(selectedDateForModal) ? (habitsForSelectedDate.filter(h => !h.isCompleted).length === 1 ? '1 congelado' : `${habitsForSelectedDate.filter(h => !h.isCompleted).length} congelados`) : 'se guarda al tocar'}
                </p>
              </div>
              <button onClick={() => setSelectedDateForModal(null)} className="w-11 h-11 rounded-full bg-surface-raised flex items-center justify-center text-text-muted shrink-0" aria-label="Cerrar">
                <X size={20} strokeWidth={2.4} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {diasCongelados.includes(selectedDateForModal) && (
                <div className="flex gap-2.5 items-start my-3 p-2.5 rounded-[12px] bg-comodin-bg text-comodin-text text-[13px] leading-snug">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5 text-lila-text" />
                  <span>Congelaste lo que faltaba, así que no cuenta como fallado. Si al final sí lo cumpliste, márcalo igual.</span>
                </div>
              )}
              
              {habitsForSelectedDate.map(h => {
                const tokens = getMomentoColorTokens(h.momento || 'flexible');
                const isHecho = h.isCompleted;
                const isNeg = h.tipo === 'negativo';
                return (
                  <div key={h.id} className="flex items-center gap-1.5 py-1.5 border-b border-line last:border-0">
                    {h.metaDiaria ? (
                       <div className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] bg-transparent border-none text-left px-0">
                          <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 ${tokens.bg} ${tokens.icon}`}>
                            <HabitIcon name={h.icono} size={19} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <span className={`block text-[15px] font-semibold truncate ${isHecho ? 'text-text-muted line-through decoration-[1.5px]' : 'text-text'}`}>{h.nombre}</span>
                            <span className={`block text-[13px] mt-px ${isHecho ? 'text-ambar-text font-semibold' : 'text-text-muted'}`}>
                              {isHecho ? '+10 ganados' : (h.momento === 'manana' ? 'Mañana' : h.momento === 'tarde' ? 'Tarde' : h.momento === 'noche' ? 'Noche' : 'Todo el día')}
                              {!isHecho && isNeg && <span className="ml-1.5 text-[11px] font-bold px-1.5 py-px rounded bg-surface-raised text-text-muted">Evitar</span>}
                            </span>
                          </div>
                       </div>
                    ) : (
                      <button 
                        aria-pressed={isHecho}
                        aria-label={`${isHecho ? 'Quitar la marca de' : 'Marcar'} ${h.nombre}`}
                        onClick={() => toggleCompletado(h.id, selectedDateForModal)}
                        className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] bg-transparent border-none text-left px-0 outline-none active:opacity-70"
                      >
                        <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 ${tokens.bg} ${tokens.icon}`}>
                          <HabitIcon name={h.icono} size={19} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className={`block text-[15px] font-semibold truncate ${isHecho ? 'text-text-muted line-through decoration-[1.5px]' : 'text-text'}`}>{h.nombre}</span>
                          <span className={`block text-[13px] mt-px ${isHecho ? 'text-ambar-text font-semibold' : 'text-text-muted'}`}>
                            {isHecho ? '+10 ganados' : (h.momento === 'manana' ? 'Mañana' : h.momento === 'tarde' ? 'Tarde' : h.momento === 'noche' ? 'Noche' : 'Todo el día')}
                            {!isHecho && isNeg && <span className="ml-1.5 text-[11px] font-bold px-1.5 py-px rounded bg-surface-raised text-text-muted">Evitar</span>}
                          </span>
                        </div>
                        <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 p-0 ${isHecho ? 'fill-logro border-ambar text-ink' : 'bg-transparent border-text-muted text-transparent'}`}>
                          {isHecho && <Check size={18} strokeWidth={3} />}
                        </div>
                      </button>
                    )}
                    
                    {h.metaDiaria && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          aria-label={`Quitar uno a ${h.nombre}`}
                          disabled={valorDe(h.id, selectedDateForModal) <= 0}
                          onClick={() => setValor(h.id, selectedDateForModal, valorDe(h.id, selectedDateForModal) - 1)}
                          className="w-11 h-11 rounded-[10px] border border-line bg-surface-raised flex items-center justify-center disabled:text-line-strong disabled:cursor-default text-text active:scale-95"
                        >
                          <Minus size={16} strokeWidth={2.4} />
                        </button>
                        <span className="min-w-[44px] text-center text-[18px] font-number tabular-nums font-bold text-text">
                          {valorDe(h.id, selectedDateForModal)}<small className="text-[13px] text-text-muted font-sans font-semibold">/{h.metaDiaria}</small>
                        </span>
                        <button 
                          aria-label={`Sumar uno a ${h.nombre}`}
                          onClick={() => setValor(h.id, selectedDateForModal, valorDe(h.id, selectedDateForModal) + 1)}
                          className="w-11 h-11 rounded-[10px] border border-line bg-surface-raised flex items-center justify-center text-text active:scale-95"
                        >
                          <Plus size={16} strokeWidth={2.4} />
                        </button>
                      </div>
                    )}
                    
                    {!h.metaDiaria && (
                      <button 
                        aria-label={`Abrir ${h.nombre}`}
                        onClick={() => { setSelectedDateForModal(null); openHabitDetail(h.id); }}
                        className="w-11 h-11 border-none bg-transparent flex items-center justify-center text-text-muted shrink-0 rounded-[10px]"
                      >
                        <ChevronRightIcon size={18} strokeWidth={2.2} />
                      </button>
                    )}
                    {h.metaDiaria && (
                      <button 
                        aria-label={`Abrir ${h.nombre}`}
                        onClick={() => { setSelectedDateForModal(null); openHabitDetail(h.id); }}
                        className="w-11 h-11 border-none bg-transparent flex items-center justify-center text-text-muted shrink-0 rounded-[10px] ml-1"
                      >
                        <ChevronRightIcon size={18} strokeWidth={2.2} />
                      </button>
                    )}
                  </div>
                );
              })}

              {weeklyHabitsForSelectedDate.length > 0 && (
                <div className="mt-4 pt-3 border-t border-line">
                  <h3 className="text-[13px] font-semibold text-text-muted mb-2">Esta semana, cuando quieras</h3>
                  {weeklyHabitsForSelectedDate.map(h => {
                    const tokens = getMomentoColorTokens(h.momento || 'flexible');
                    const isHecho = h.isCompleted;
                    const meta = h.vecesPorSemana || 1;
                    return (
                      <div key={h.id} className="flex items-center gap-1.5 py-1.5 border-b border-line last:border-0">
                        <button 
                          aria-pressed={isHecho}
                          aria-label={`${isHecho ? 'Quitar la marca de' : 'Marcar'} ${h.nombre}`}
                          onClick={() => toggleCompletado(h.id, selectedDateForModal)}
                          className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] bg-transparent border-none text-left px-0 outline-none active:opacity-70"
                        >
                          <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 ${tokens.bg} ${tokens.icon}`}>
                            <HabitIcon name={h.icono} size={19} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <span className={`block text-[15px] font-semibold truncate ${isHecho ? 'text-text-muted line-through decoration-[1.5px]' : 'text-text'}`}>{h.nombre}</span>
                            <span className={`block text-[13px] mt-px ${isHecho ? 'text-ambar-text font-semibold' : 'text-text-muted'}`}>
                              {h.completadosSemana} de {meta} esta semana
                            </span>
                          </div>
                          <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 p-0 ${isHecho ? 'fill-logro border-ambar text-ink' : 'bg-transparent border-text-muted text-transparent'}`}>
                            {isHecho && <Check size={18} strokeWidth={3} />}
                          </div>
                        </button>
                        <button 
                          aria-label={`Abrir ${h.nombre}`}
                          onClick={() => { setSelectedDateForModal(null); openHabitDetail(h.id); }}
                          className="w-11 h-11 border-none bg-transparent flex items-center justify-center text-text-muted shrink-0 rounded-[10px]"
                        >
                          <ChevronRightIcon size={18} strokeWidth={2.2} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-3 px-5 pb-5 border-t border-line">
              {(() => {
                const isPast = selectedDateForModal < todayStr;
                const isFrozen = diasCongelados.includes(selectedDateForModal);
                const faltan = habitsForSelectedDate.filter(h => !h.isCompleted).length;
                
                if (isFrozen) {
                  return (
                    <div className="w-full text-center">
                       <button onClick={() => descongelarDia(selectedDateForModal)} className="min-h-[44px] px-3 text-[13px] font-bold text-ambar-text bg-transparent border-none active:opacity-70">
                         Quitar el comodín · vuelve a tu saldo
                       </button>
                    </div>
                  );
                } else if (isPast && faltan > 0) {
                  return (
                    <>
                      <button 
                        disabled={comodines === 0}
                        onClick={() => congelarDia(selectedDateForModal)}
                        className="w-full min-h-[44px] px-3.5 rounded-[10px] border border-line bg-surface-raised text-text text-[14px] font-bold inline-flex items-center justify-center gap-2 disabled:text-text-muted disabled:cursor-default active:scale-[0.98]"
                      >
                        {comodines > 0 ? (
                           <>
                             <ShieldCheck size={16} className="text-lila-text" strokeWidth={2.5} /> 
                             {faltan === 1 
                               ? `Congelar el que falta · te quedan ${comodines}` 
                               : `Congelar los ${faltan} que faltan · te quedan ${comodines}`}
                           </>
                        ) : (
                           "No te quedan comodines este mes"
                        )}
                      </button>
                      <p className="text-[13px] text-text-muted text-center mt-2">
                        {comodines > 0 ? 'Si ese día no pudiste, congélalos: no cuentan como fallados.' : `Se recargan el 1 de ${monthNames[(new Date().getMonth() + 1) % 12]}. Puedes marcar lo que sí cumpliste.`}
                      </p>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
};
