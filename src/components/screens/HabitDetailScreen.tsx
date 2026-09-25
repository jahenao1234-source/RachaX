import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Edit3, Archive, ArchiveRestore, Trash2, ShieldCheck, 
  AlertTriangle, Award, Play, Check 
} from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { 
  getTodayString, isHabitScheduledForDate, isHabitCompletedOnDate,
  parseDateString, calcularConstanciaHabito, contarProgresoReto,
  getFrecuenciaLegible
} from '../../utils/habitUtils';

import { getMomentoColorTokens } from '../common/HabitPreviewRow';

interface HabitDetailScreenProps {
  habitId: string;
  onBack: () => void;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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
    congelarDia,
    descongelarDia,
    comodines,
    diasCongelados,
    openFocusMode,
    rachaGlobal,
    habitosActivos,
    premios,
    insignias
  } = useHabitStore();

  const habit = habitos.find((h) => h.id === habitId);
  const todayStr = getTodayString();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionDay, setActionDay] = useState<{dateStr: string, isFrozen: boolean, dayName: string} | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrolled(scrollRef.current.scrollTop > 80);
      }
    };
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll, { passive: true });
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, []);

  if (!habit) return null;

  const isNegativo = habit.tipo === 'negativo';
  const tokens = getMomentoColorTokens(habit.momento);
  const currentStreak = rachaActual(habit.id);
  const recordStreak = mejorRacha(habit.id);
  const isHechoHoy = isHabitCompletedOnDate(habit.id, todayStr, registros);
  const valorHoy = valorDe(habit.id, todayStr);
  
  // Constancia
  const constanciaData = calcularConstanciaHabito(habit, registros, diasCongelados, todayStr);
  const showNewHabitState = constanciaData.programados < 2;

  // Reto
  const isReto = !!habit.reto;
  const progresoReto = isReto ? contarProgresoReto(habit, registros) : 0;
  
  // Calendario 30 días
  const last30Days = useMemo(() => {
    const todayDate = parseDateString(todayStr);
    const days = [];

    // L, M, X, J, V, S, D
    const jsDayToLocal = (day: number) => (day === 0 ? 6 : day - 1);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayOfWeek = jsDayToLocal(d.getDay());
      const isToday = i === 0;
      const isSched = isHabitScheduledForDate(habit, ds);
      const isComp = isHabitCompletedOnDate(habit.id, ds, registros);
      const isFroz = diasCongelados.includes(ds);
      
      let state: 'done' | 'miss' | 'como' | 'free' | 'today' = 'free';
      if (isToday) state = 'today';
      else if (!isSched) state = 'free';
      else if (isFroz) state = 'como';
      else if (isComp) state = 'done';
      else state = 'miss';

      const weekdayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      
      let ariaState = '';
      if (state === 'done') ariaState = 'cumplido';
      else if (state === 'miss') ariaState = 'sin cumplir';
      else if (state === 'como') ariaState = 'congelado con comodín';
      else if (state === 'today') ariaState = isComp ? 'hoy, cumplido' : 'hoy, pendiente';
      else if (state === 'free') ariaState = 'día libre';

      days.push({
        dateStr: ds,
        dayNumber: d.getDate(),
        dayOfWeek,
        monthName: MONTH_NAMES[d.getMonth()],
        isToday,
        isScheduled: isSched,
        isCompleted: isComp,
        state,
        ariaState,
        dayName: `${weekdayNames[dayOfWeek]} ${d.getDate()}`
      });
    }
    
    // Padding inicio
    const firstDay = days[0];
    const offset = firstDay.dayOfWeek;
    const paddedDays = [];
    for (let i = 0; i < offset; i++) paddedDays.push(null);
    paddedDays.push(...days);
    
    return paddedDays;
  }, [todayStr, habit.id, registros, diasCongelados]);

  // Insignia
  const proxBadge = useMemo(() => {
    const calc = insignias;
    return calc.find(b => !b.desbloqueada);
  }, [insignias]);

  const handleDelete = () => {
    eliminarHabito(habit.id);
    onBack();
  };

  const dayBtnClass = (state: string) => {
    const base = "w-full aspect-square rounded-[10px] flex items-center justify-center font-number text-[14px] font-bold relative active:scale-95 transition-transform overflow-hidden select-none outline-none";
    switch (state) {
      case 'done': return `${base} fill-logro text-ink border border-ambar-text`;
      case 'miss': return `${base} bg-surface text-text-muted border border-line`;
      case 'como': return `${base} bg-comodin-bg text-comodin-text border-[1.5px] border-lila-text`;
      case 'today': return `${base} bg-transparent text-text border-[1.5px] border-dashed border-text`;
      case 'free': return `${base} bg-transparent text-text-muted border-[1.5px] border-dashed border-text-muted`;
      default: return base;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/60 sm:bg-transparent pointer-events-auto">
      <div className="w-full max-w-[430px] h-full bg-bg relative flex flex-col shadow-2xl overflow-hidden sm:rounded-[36px] sm:h-[850px] sm:max-h-[920px] sm:my-auto sm:border sm:border-line">
        
        {/* Header Fijo */}
        <header className={`absolute top-0 inset-x-0 z-20 h-14 flex items-center px-4 transition-colors ${scrolled ? 'bg-bg/90 backdrop-blur border-b border-line' : 'bg-transparent'}`}>
          <button onClick={onBack} className="w-11 h-11 rounded-full bg-surface-raised flex items-center justify-center text-text-muted active:scale-95 transition-transform shrink-0" aria-label="Volver">
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          
          <div className={`flex-1 flex items-center gap-2 ml-3 transition-opacity duration-200 ${scrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center shrink-0 ${tokens.bg} ${tokens.icon}`}>
              <HabitIcon name={habit.icono} size={15} strokeWidth={2.5} />
            </div>
            <h2 className="font-heading font-bold text-[20px] truncate text-text m-0 mb-0.5 leading-none">
              {habit.nombre}
            </h2>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-20 pb-28 custom-scrollbar">
          
          {/* IDENTIDAD */}
          <section className="mb-6">
            <div className={`w-[52px] h-[52px] rounded-[15px] flex items-center justify-center mb-3 ${tokens.bg} ${tokens.icon}`}>
              <HabitIcon name={habit.icono} size={24} strokeWidth={2.5} />
            </div>
            <h1 className="font-heading font-bold text-[24px] text-text leading-tight mb-2 max-w-[90%]">
              {habit.nombre}
            </h1>
            
            {isNegativo && (
              <div className="mb-2">
                <span className="inline-block px-2 py-1 rounded-[6px] bg-surface-raised text-text-muted text-[11px] font-bold uppercase tracking-wider">Evitar</span>
              </div>
            )}
            
            <p className="text-[13px] text-text-muted leading-relaxed">
              {(habit.momento === 'manana' ? 'Mañana' : habit.momento === 'tarde' ? 'Tarde' : habit.momento === 'noche' ? 'Noche' : 'Todo el día')}
              {' · '}
              {getFrecuenciaLegible(habit)}
              {habit.anclaje ? ` · ${isNegativo ? 'cuando' : 'después de'} ${habit.anclaje}` : ''}
              {habit.metaDiaria ? ` · Meta: ${habit.metaDiaria}` : ''}
            </p>
          </section>

          {/* ESTADO DE HOY */}
          <section className="bg-surface rounded-[14px] p-3 mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {habit.metaDiaria && !isHechoHoy ? (
                 <button type="button" onClick={() => setValor(habit.id, todayStr, valorDe(habit.id, todayStr) + 1)} aria-label={`Sumar uno a ${habit.nombre}`} className="w-11 h-11 rounded-[10px] border border-line-strong bg-surface-raised text-text text-[15px] font-bold active:scale-95 transition-transform shrink-0">+1</button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => toggleCompletado(habit.id, todayStr)} 
                  aria-label={`Marcar ${habit.nombre} como cumplido hoy`} 
                  aria-pressed={isHechoHoy}
                  className={`w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform shrink-0 ${isHechoHoy ? 'bg-ambar border-none' : `bg-transparent border-2 ${tokens.icon.replace('text-', 'border-')}`}`}
                  style={!isHechoHoy ? { borderColor: `var(--${tokens.icon.replace('text-', '')})` } : undefined}
                >
                  {isHechoHoy && <Check size={20} strokeWidth={3} className="text-ink" />}
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-text m-0 truncate">
                  {isHechoHoy ? 'Cumplido hoy' : 'Pendiente hoy'}
                </p>
                {isHechoHoy ? (
                  <p className="text-[13px] font-bold text-ambar-text m-0 mt-0.5 truncate">+10 ganados</p>
                ) : habit.metaDiaria ? (
                  <p className="text-[13px] text-text-muted m-0 mt-0.5 truncate">{valorHoy} de {habit.metaDiaria} hoy</p>
                ) : (
                  <p className="text-[13px] text-text-muted m-0 mt-0.5 leading-snug">Toca el círculo para marcarlo</p>
                )}
              </div>

              {!isHechoHoy && (
                <button 
                  onClick={() => openFocusMode({ tipo: 'rutina', nombre: habit.nombre, habitoIds: [habit.id] })} 
                  className={`h-11 px-3 rounded-[10px] border bg-transparent ${tokens.icon} text-[14px] font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform`}
                  style={{ borderColor: `var(--${tokens.icon.replace('text-', '')})` }}
                >
                  <Play size={14} fill="currentColor" /> Empezar
                </button>
              )}
            </div>
            
            {habit.metaDiaria && !isHechoHoy && (
              <div className="flex gap-[3px] mt-1 pl-[56px]" role="img" aria-label={`${valorHoy} de ${habit.metaDiaria} hoy`}>
                {Array.from({length: habit.metaDiaria}).map((_, i) => (
                  <span key={i} className={`flex-1 h-2 rounded-[3px] max-w-[24px] ${i < valorHoy ? 'bg-text' : 'bg-track-empty'}`}></span>
                ))}
              </div>
            )}
          </section>

          {/* TU CONSTANCIA */}
          <section className="bg-surface rounded-[18px] p-4 mb-4">
            {showNewHabitState ? (
              <>
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="font-heading font-bold text-[22px] m-0">Tu constancia</h2>
                </div>
                <p className="font-heading font-bold text-[44px] leading-none m-0 mb-3 text-text">
                  Empieza hoy
                </p>
                <p className="text-[13px] text-text-muted m-0 leading-snug">
                  Tu primer día cuenta desde hoy. Aquí verás cuántos días programados cumpliste.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="font-heading font-bold text-[22px] m-0">Tu constancia</h2>
                  <span className="text-[13px] text-text-muted">últimos 30 días</span>
                </div>
                <p className="font-heading font-bold text-[44px] leading-none m-0 mb-3 text-text flex items-baseline gap-2">
                  {constanciaData.cumplidos} <span className="text-[20px] text-text-muted font-normal">de {constanciaData.programados}</span>
                </p>
                <p className="text-[13px] text-text-muted m-0 leading-snug">
                  días programados que cumpliste{constanciaData.comodinesUsados > 0 ? `, con ${constanciaData.comodinesUsados} congelado${constanciaData.comodinesUsados !== 1 ? 's' : ''} con comodín` : ''}. Un día gris no borra los demás.
                </p>
              </>
            )}
          </section>

          {/* RETO */}
          {isReto ? (
            <section className="bg-surface rounded-[18px] p-4 mb-4">
              <div className="flex justify-between items-baseline mb-3">
                <h2 className="font-heading font-bold text-[22px] m-0">Reto</h2>
                <button onClick={() => openEditHabit(habit)} className="h-11 px-2 text-[15px] font-semibold text-text-muted flex items-center justify-center hover:text-text -mr-2 -my-2 active:scale-95 transition-transform">
                  Cambiar
                </button>
              </div>
              <div className="flex items-center gap-3 mb-2" role="progressbar" aria-valuenow={progresoReto} aria-valuemax={habit.reto!.meta}>
                <div className="flex-1 h-1.5 rounded-full bg-track-empty overflow-hidden">
                  <div className="h-full rounded-full fill-logro transition-all" style={{ width: `${Math.min(100, Math.round((progresoReto / habit.reto!.meta) * 100))}%` }} />
                </div>
                <span className="text-[14px] font-bold text-text font-number whitespace-nowrap">
                  {progresoReto === 0 ? `Reto de ${habit.reto!.meta} días` : `${progresoReto} de ${habit.reto!.meta}`}
                </span>
              </div>
              <p className="text-[13px] text-text-muted m-0">Cada día que lo cumplas suma. La barra nunca baja.</p>
            </section>
          ) : (
            <button onClick={() => openEditHabit(habit)} className="w-full h-[52px] rounded-[18px] border-2 border-dashed border-line bg-transparent text-[15px] font-semibold text-text-muted flex items-center justify-center mb-4 active:scale-[0.98] transition-transform">
              + Ponerme un reto de días cumplidos
            </button>
          )}

          {/* RACHA */}
          {currentStreak >= 2 && (
            <div className="flex items-center gap-3 p-3.5 bg-surface rounded-[14px] mb-6">
              <span className="text-[15px] font-semibold text-text">{currentStreak} días seguidos{isNegativo ? ' sin recaer' : ''}</span>
              <span className="text-[14px] text-text-muted ml-auto">Mejor: {recordStreak}</span>
            </div>
          )}

          {/* CALENDARIO 30 DÍAS */}
          <section className="mb-6 mt-6">
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="font-heading font-bold text-[22px] m-0">{showNewHabitState ? 'Esta semana' : 'Últimos 30 días'}</h2>
              <span className="text-[13px] text-text-muted">{showNewHabitState ? 'empieza hoy' : 'toca un día para cambiarlo'}</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {['L','M','X','J','V','S','D'].map(d => (
                <div key={d} className="text-center text-[12px] font-semibold text-text-muted pb-1">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
              {showNewHabitState ? (
                // Modo nueva semana: solo 7 casillas (las del offset + las de hoy)
                // Realmente la maqueta dice "muestra solo la semana en curso (7 celdas, únicamente hoy activo)"
                // last30Days has exactly 30 days + offset. We just take the last 7 items (which correspond to this week)
                (() => {
                  const items = last30Days.slice(-7);
                  return items.map((day, i) => (
                    day ? (
                      <button 
                        key={day.dateStr} 
                        className={dayBtnClass(day.state)}
                        aria-label={`${day.dayName}, ${day.ariaState}`}
                        disabled={day.state === 'free'}
                        aria-disabled={day.state === 'free'}
                      >
                        {day.state === 'como' && <span className="absolute top-[3px] right-[3px]"><ShieldCheck size={11} strokeWidth={3} /></span>}
                        {day.dayNumber}
                      </button>
                    ) : (
                      <div key={`empty-${i}`} />
                    )
                  ));
                })()
              ) : (
                // Modo completo
                last30Days.map((day, i) => (
                  day ? (
                    <button 
                      key={day.dateStr} 
                      className={dayBtnClass(day.state)}
                      aria-label={`${day.dayName}, ${day.ariaState}`}
                      disabled={day.state === 'free' || day.state === 'today'}
                      aria-disabled={day.state === 'free' || day.state === 'today'}
                      onClick={() => {
                        if (day.state === 'done') {
                          toggleCompletado(habit.id, day.dateStr);
                        } else if (day.state === 'miss') {
                          setActionDay({ dateStr: day.dateStr, isFrozen: false, dayName: day.dayName });
                        } else if (day.state === 'como') {
                          setActionDay({ dateStr: day.dateStr, isFrozen: true, dayName: day.dayName });
                        }
                      }}
                    >
                      {day.state === 'como' && <span className="absolute top-[3px] right-[3px]"><ShieldCheck size={11} strokeWidth={3} /></span>}
                      {day.dayNumber}
                    </button>
                  ) : (
                    <div key={`empty-${i}`} />
                  )
                ))
              )}
            </div>

            {!showNewHabitState && (
              <div className="flex items-center justify-between gap-2 mt-4 px-1">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[3px] bg-ambar border border-ambar-text" /> <span className="text-[12px] text-text-muted">Cumplido</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[3px] bg-surface border border-line" /> <span className="text-[12px] text-text-muted">Sin cumplir</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[3px] bg-comodin-bg border-[1.5px] border-lila-text" /> <span className="text-[12px] text-text-muted">Comodín</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[3px] bg-transparent border-[1.5px] border-dashed border-line" /> <span className="text-[12px] text-text-muted">Libre</span></div>
              </div>
            )}
          </section>

          {/* INSIGNIA PROXIMA */}
          {proxBadge && (
            <div className="flex items-center gap-3 mb-6 p-1">
              <span className="text-ambar-text shrink-0"><Award size={20} strokeWidth={2} /></span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-text m-0 truncate">Insignia {proxBadge.nombre}</p>
                <div className="h-1.5 rounded-full bg-track-empty overflow-hidden mt-1.5">
                  <div className="h-full rounded-full fill-logro transition-all" style={{ width: `${Math.min(100, Math.round((proxBadge.progresoActual / proxBadge.meta) * 100))}%` }} />
                </div>
              </div>
              <span className="text-[13px] text-text-muted ml-2 shrink-0">faltan {proxBadge.meta - proxBadge.progresoActual}</span>
            </div>
          )}

          {/* ENLACES */}
          <div className="mt-8 pt-4 border-t border-line/50 flex flex-col gap-1">
            <button 
              onClick={() => {
                if (habit.archivado) restaurarHabito(habit.id);
                else archivarHabito(habit.id);
              }}
              className="w-full h-11 flex items-center gap-2.5 text-text-muted text-[15px] font-semibold active:opacity-70 transition-opacity px-2"
            >
              {habit.archivado ? <ArchiveRestore size={16} strokeWidth={2} /> : <Archive size={16} strokeWidth={2} />}
              {habit.archivado ? 'Restaurar hábito' : 'Archivar hábito'}
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full h-11 flex items-center gap-2.5 text-danger text-[15px] font-semibold active:opacity-70 transition-opacity px-2"
            >
              <Trash2 size={16} strokeWidth={2} /> Eliminar hábito
            </button>
          </div>
        </div>

        {/* Footer Fixed */}
        <footer className="absolute bottom-0 inset-x-0 bg-bg p-4 pb-safe-4 border-t border-line/50 z-20">
          <button 
            onClick={() => openEditHabit(habit)}
            className="w-full h-12 rounded-[14px] logro text-ink text-[15px] font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Edit3 size={17} strokeWidth={2.5} /> Editar hábito
          </button>
        </footer>

        {/* MODAL ELIMINAR */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-black/60">
              <motion.div
                role="alertdialog"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[340px] bg-surface rounded-[24px] p-6 shadow-2xl text-center"
              >
                <div className="w-14 h-14 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4 text-danger">
                  <AlertTriangle size={28} strokeWidth={2.5} />
                </div>
                <h3 className="font-heading font-bold text-[24px] text-text mb-2 leading-tight">
                  ¿Eliminar "{habit.nombre}"?
                </h3>
                <p className="text-[14px] text-text-muted mb-6 leading-relaxed">
                  Se borrarán sus {registros.filter(r => r.habitoId === habit.id).length} días cumplidos y su reto, y no se puede deshacer. Si solo quieres dejar de verlo, archívalo: guarda todo su historial.
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { archivarHabito(habit.id); onBack(); }}
                    className="w-full h-12 rounded-[12px] bg-surface-raised text-text font-bold text-[15px]"
                  >
                    Mejor archivarlo
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full h-12 text-danger font-semibold text-[15px]"
                  >
                    Eliminar los {registros.filter(r => r.habitoId === habit.id).length} días
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full h-11 text-text-muted font-semibold text-[15px]"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* HOJAS DEL CALENDARIO */}
        <AnimatePresence>
          {actionDay && (
            <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60"
                onClick={() => setActionDay(null)}
              />
              <motion.section
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full bg-bg rounded-t-[22px] border-t border-line shadow-[0_-8px_24px_rgba(0,0,0,0.35)] flex flex-col p-5 pb-safe"
              >
                <div className="w-10 h-[5px] rounded-full bg-line-strong mx-auto mb-4 shrink-0" />
                
                <h3 className="font-heading font-bold text-[24px] text-text mb-2 capitalize">
                  {actionDay.dayName.charAt(0).toUpperCase() + actionDay.dayName.slice(1)}
                </h3>
                
                {actionDay.isFrozen ? (
                  <>
                    <p className="text-[15px] text-text-muted mb-6 leading-snug">
                      Este día está congelado con un comodín.
                    </p>
                    <button 
                      onClick={() => { descongelarDia(actionDay.dateStr); setActionDay(null); }}
                      className="w-full h-12 rounded-[12px] bg-surface-raised text-text font-bold text-[15px] mb-2"
                    >
                      Quitar el comodín
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[15px] text-text-muted mb-6 leading-snug">
                      Ese día no quedó registrado. Puedes marcarlo si lo cumpliste, o congelarlo con un comodín.
                    </p>
                    <button 
                      onClick={() => { 
                        if (habit.metaDiaria) {
                          setValor(habit.id, actionDay.dateStr, habit.metaDiaria);
                        } else {
                          toggleCompletado(habit.id, actionDay.dateStr);
                        }
                        setActionDay(null);
                      }}
                      className="w-full h-12 rounded-[12px] logro text-ink font-bold text-[15px] mb-2"
                    >
                      Sí lo cumplí
                    </button>
                    <button 
                      disabled={comodines === 0}
                      onClick={() => { congelarDia(actionDay.dateStr); setActionDay(null); }}
                      className="w-full h-12 rounded-[12px] bg-surface-raised text-text font-bold text-[15px] mb-2 disabled:opacity-50 disabled:active:scale-100"
                    >
                      {comodines > 0 ? `Congelar con un comodín · te quedan ${comodines}` : 'No te quedan comodines este mes'}
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setActionDay(null)}
                  className="w-full h-11 text-text-muted font-semibold text-[15px]"
                >
                  Dejarlo como está
                </button>
              </motion.section>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
