import React, { useState, useMemo } from 'react';
import { BadgeIcon } from '../badges/BadgeIcon';
import { Plus, Check, Sparkles, Trophy, ChevronDown, ShieldCheck, Pencil, ListChecks, Play, Zap, ChevronRight, Target } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Llama } from '../juego/Llama';
import { RetoSemanalSheet } from '../juego/RetoSemanalSheet';
import { CajaSorpresaSheet } from '../juego/CajaSorpresaSheet';
import { Habito, Subtarea } from '../../types';
import { 
  getTodayString, 
  contarHojasSubtareas, 
  subtractDays, 
  isHabitCompletedOnDate, 
  esTareaCompletada,
  toggleSubtareaEnArbol,
  limpiarArbolSubtareas,
  contarProgresoReto,
  contarCompletadosSemana,
  getDiasDeRegreso,
  puntosParaNivel,
  ETAPAS
} from '../../utils/habitUtils';
import { getLunesActual } from '../../utils/retoSemanal';

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
        className="w-full flex items-center gap-2.5 p-2 rounded-[10px] hover:bg-surface-raised transition-colors text-left group"
        style={{ paddingLeft: `${indentPx + 8}px` }}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${
            sub.hecha ? 'border-transparent' : 'border-line-strong group-hover:border-text-muted'
          }`}
          style={sub.hecha ? { backgroundColor: color } : undefined}
        >
          {sub.hecha && <Check size={12} strokeWidth={3} className="text-text" />}
        </div>
        <span className={`text-xs flex-1 min-w-0 ${sub.hecha ? 'text-text-muted line-through' : 'text-text'}`}>
          {sub.texto}
        </span>
        {tieneHijos && stats && (
          <span className="text-[11px] font-semibold tabular-nums text-text-muted shrink-0">
            ({stats.hechas}/{stats.total})
          </span>
        )}
      </button>

      {tieneHijos && sub.subtareas && (
        <div className="ml-3 sm:ml-4 pl-2 border-l border-line-strong/60 space-y-1">
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
    rachaGlobal,
    completadosHoy,
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
    comodines,
    diasCongelados,
      premios,
      insignias,
    retoSemanal,
    setRetoSemanal,
    navigateToTab,
    puntosTotales,
    nivelActual,
    progresoNivel,
    etapaLlama
  } = useHabitStore();

  const [isRetoSheetOpen, setIsRetoSheetOpen] = useState(false);
  const [isCajaSheetOpen, setIsCajaSheetOpen] = useState(false);

  const hoy = getTodayString();
  const currentHour = new Date().getHours();
  
  // Determinar momento actual
  // Mañana (0-12), Tarde (12-19), Noche (19-24)
  const currentMomento = currentHour < 12 ? 'manana' : currentHour < 19 ? 'tarde' : 'noche';

  const [expandedTarea, setExpandedTarea] = useState<string | null>(null);
  const [plegados, setPlegados] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('racha_secciones_plegadas');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const togglePlegado = (momento: string) => {
    setPlegados(prev => {
      const next = { ...prev, [momento]: !prev[momento] };
      try { localStorage.setItem('racha_secciones_plegadas', JSON.stringify(next)); } catch {}
      return next;
    });
  };


  const formattedDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date());
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) + ' ' + new Date().getDate();
  const completedCount = completadosHoy();
  const totalToday = habitosDeHoy.length;

  // Puntos y Nivel
  const ptosMeta = progresoNivel.actual + progresoNivel.meta;
  const progresoNivelPercent = Math.min(100, Math.max(0, (progresoNivel.actual / ptosMeta) * 100));

  // Nombre Llama
  const lvlName = ETAPAS[etapaLlama - 1].nombre;

  // Últimos 7 días y Constancia del Mes
  const ultimos7Dias = useMemo(() => {
    const days = [];
    // 6 anteriores + hoy
    for (let i = 6; i >= 0; i--) {
      const d = subtractDays(hoy, i);
      const dateObj = new Date(d + 'T12:00:00'); // Evitar timezone issues
      const labelStr = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(dateObj);
      const label = labelStr.charAt(0).toUpperCase() + labelStr.slice(1, 2);
      const dayNum = dateObj.getDate();
      
      const habitsScheduled = habitosActivos.filter(h => h.frecuencia !== 'semanal'); // simplificado, idealmente isHabitScheduledForDate
      const completedToday = habitsScheduled.filter(h => isHabitCompletedOnDate(h.id, d, registros)).length;
      const scheduledCount = habitsScheduled.length;
      
      // Determinar estado: 0: pendiente (gris o discontinuo), 1: completado (ambar), 2: comodin
      let estado = 0;
      if (diasCongelados?.includes(d)) {
        estado = 2;
      } else if (scheduledCount > 0 && completedToday === scheduledCount) {
        estado = 1;
      }
      
      days.push({
        dateStr: d,
        label,
        dayNum,
        estado,
        isHoy: i === 0
      });
    }
    return days;
  }, [hoy, registros, habitosActivos, diasCongelados]);

  // Constancia últimos 30 días
  const constancia30 = useMemo(() => {
    let cumplidos = 0;
    for (let i = 0; i < 30; i++) {
      const d = subtractDays(hoy, i);
      if (diasCongelados?.includes(d)) {
        cumplidos++;
      } else {
        const habitsScheduled = habitosActivos.filter(h => h.frecuencia !== 'semanal');
        if (habitsScheduled.length > 0) {
          const completed = habitsScheduled.filter(h => isHabitCompletedOnDate(h.id, d, registros)).length;
          if (completed === habitsScheduled.length) {
            cumplidos++;
          }
        }
      }
    }
    return cumplidos;
  }, [hoy, registros, habitosActivos, diasCongelados]);

  const habitosPendientes = habitosDeHoy.filter(h => !esHabitoCompletado(h.id));

  // Determinar la fila siguiente
  const siguienteFila = useMemo(() => {
    if (habitosPendientes.length === 0) return null;
    const momentOrder = ordenMomentos;
    const currentIndex = momentOrder.indexOf(currentMomento as any);
    
    const checkOrder = [];
    if (currentIndex !== -1) {
      for (let i = currentIndex; i < momentOrder.length; i++) checkOrder.push(momentOrder[i]);
      for (let i = 0; i < currentIndex; i++) checkOrder.push(momentOrder[i]);
    } else {
      checkOrder.push(...momentOrder);
    }

    const orderWithoutFlexible = checkOrder.filter(m => m !== 'flexible');
    orderWithoutFlexible.push('flexible');

    for (const mom of orderWithoutFlexible) {
      const pendingInMom = habitosPendientes.filter(h => (h.momento || 'flexible') === mom);
      if (pendingInMom.length > 0) {
        pendingInMom.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        return pendingInMom[0];
      }
    }
    return null;
  }, [habitosPendientes, ordenMomentos, currentMomento]);

  const habitosOrdenados = useMemo(() => {
    const list: Habito[] = [];
    for (const mom of ordenMomentos) {
      const inMom = habitosDeHoy.filter(h => (h.momento || 'flexible') === mom);
      inMom.sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0));
      list.push(...inMom);
    }
    return list;
  }, [habitosDeHoy, ordenMomentos]);

  const getMomentoColorInfo = (momento?: string) => {
    switch (momento) {
      case 'manana': return { bg: 'bg-manana', text: 'text-ink', iconTint: 'bg-manana-tint text-manana-text', iconBg: 'bg-manana-tint', iconColor: 'text-manana-text', varColor: 'var(--manana-text)' };
      case 'tarde': return { bg: 'bg-coral', text: 'text-ink', iconTint: 'bg-coral-tint text-coral-text', iconBg: 'bg-coral-tint', iconColor: 'text-coral-text', varColor: 'var(--coral-text)' };
      case 'noche': return { bg: 'bg-lila', text: 'text-ink', iconTint: 'bg-lila-tint text-lila-text', iconBg: 'bg-lila-tint', iconColor: 'text-lila-text', varColor: 'var(--lila-text)' };
      default: return { bg: 'bg-surface-raised', text: 'text-text', iconTint: 'bg-surface-raised text-text', iconBg: 'bg-surface-raised', iconColor: 'text-text', varColor: 'var(--text)' };
    }
  };

  const getMomentoIcon = (momento: string) => {
    switch (momento) {
      case 'manana': return <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0"/>;
      case 'tarde': return <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>;
      case 'noche': return <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>;
      case 'flexible': return <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>;
      default: return <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>;
    }
  };

  const getMomentoTitle = (momento: string) => {
    switch (momento) {
      case 'manana': return 'Mañana';
      case 'tarde': return 'Tarde';
      case 'noche': return 'Noche';
      case 'flexible': return 'Todo el día';
      default: return 'Todo el día';
    }
  };

  const proximasInsignias = insignias.filter(b => !b.desbloqueada);
  const proximaInsignia = proximasInsignias.length > 0 ? proximasInsignias[0] : null;

  const esDiaRegreso = getDiasDeRegreso(habitosActivos, registros, diasCongelados, hoy).includes(hoy);
  
  const handleAcceptReto = (optId: string) => {
    if (retoSemanal) {
      setRetoSemanal({ ...retoSemanal, opcionElegida: optId, estado: 'aceptado' });
    }
    setIsRetoSheetOpen(false);
  };

  const handleSkipReto = () => {
    if (retoSemanal) {
      setRetoSemanal({ ...retoSemanal, estado: 'saltado' });
    }
    setIsRetoSheetOpen(false);
  };

  return (
    <div id="screen-today" className="pb-28 animate-fadeIn text-text font-body pt-2">
      <a className="lvlstrip" href="#" onClick={(e) => { e.preventDefault(); navigateToTab('perfil'); }} aria-label={`Nivel ${nivelActual}, ${lvlName}: ${progresoNivel.actual} de ${ptosMeta} puntos para el nivel ${nivelActual+1}. Ver tu llama`}>
        <span className="lvlflame">
          <Llama etapa={etapaLlama} size={30} />
        </span>
        <span className="cond lvlname">Nivel {nivelActual} · {lvlName}</span>
        <i className="lvltrack2" aria-hidden="true"><b style={{ width: `${progresoNivelPercent}%` }}></b></i>
        <span className="lvlnums">{progresoNivel.actual} / {ptosMeta}</span>
      </a>

      {/* 3. Fecha en display y comodines */}
      <section className="pt-3.5 flex items-start justify-between">
        <div>
          <h1 className="m-0 font-heading font-bold text-[44px] leading-none tracking-tight">{displayDate}</h1>
          <p className="mt-1.5 text-[15px] text-text-muted">Misiones de hoy: {completedCount} de {totalToday}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line text-text text-[13px] font-semibold mt-2">
          <ShieldCheck size={14} className="text-[var(--lila)]" />
          {comodines === 1 ? '1 comodín' : `${comodines ?? 0} comodines`}
        </div>
      </section>

      {/* 4. Últimos 7 días */}
      <section aria-label="Últimos 7 días" className="mt-3.5 flex flex-col gap-2">
        <div className="flex gap-1.5">
          {ultimos7Dias.map((d, i) => {
            let cls = "";
            if (d.isHoy) {
              cls = "bg-transparent border-[1.5px] border-dashed border-text text-text";
            } else if (d.estado === 2) {
              cls = "bg-comodin-bg border-[1.5px] border-lila text-comodin-text";
            } else if (d.estado === 1) {
              cls = "bg-ambar text-ink";
            } else {
              cls = "bg-surface border border-line text-text-muted";
            }

            return (
              <div key={i} className={`flex-1 h-[52px] rounded-[12px] flex flex-col items-center justify-center box-border ${cls}`}>
                {d.estado === 2 ? (
                  <ShieldCheck size={20} strokeWidth={2.5} className="text-lila" />
                ) : (
                  <>
                    <span className="text-[12px] font-semibold leading-tight">{d.label}</span>
                    <span className="font-heading font-bold text-[17px] leading-tight font-number">{d.dayNum}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="m-0 flex justify-between text-[13px] text-text-muted">
          <span>Un día sin cumplir no borra los demás.</span>
          <span className="text-text font-semibold">{constancia30}/30 del mes</span>
        </p>
      </section>

      {/* 5. Tarjeta "Tu día" */}
      <section aria-label="Tu día" className="mt-3.5">
        <div className="p-3.5 rounded-[18px] bg-surface border border-line flex flex-col gap-2.5">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 font-heading font-bold text-[22px]">Tu día</h2>
            <span className="font-heading font-bold text-[18px] text-ambar-text">+{completedCount * (esDiaRegreso ? 20 : 10)} pts hoy</span>
          </div>
          
          {esDiaRegreso && (
            <p className="bono">
              <ShieldCheck size={16} strokeWidth={2.2} />
              <span><b>Volviste.</b> Hoy cada hábito vale el doble: +20.</span>
            </p>
          )}
          <div className="flex gap-1" role="img" aria-label={`${completedCount} de ${totalToday} hábitos cumplidos hoy`}>
            {habitosOrdenados.map(h => (
               <i key={h.id} className={`flex-1 h-3 rounded-[4px] ${esHabitoCompletado(h.id) ? 'bg-ambar' : 'bg-track'}`}></i>
            ))}
          </div>
          <div className="flex justify-between items-center gap-2.5 mt-0.5">
            <span className="text-[13px] font-medium text-text-muted">{completedCount} de {totalToday} · te quedan {totalToday - completedCount}</span>
            {siguienteFila ? (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(`habito-${siguienteFila.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.remove('animate-pulse-fast');
                    void el.offsetWidth;
                    el.classList.add('animate-pulse-fast');
                  }
                }}
                className="flex items-center gap-1 text-[13px] font-bold text-lila-text hover:underline"
              >
                Siguiente: {siguienteFila.nombre}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </button>
            ) : totalToday > 0 ? (
              <span className="text-[13px] font-bold text-ambar-text">¡Día completo!</span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Reto Semanal */}
      {retoSemanal && (
        <>
          {retoSemanal.estado === 'propuesto' && (
            <button className="retorow nuevo w-full text-left" onClick={() => setIsRetoSheetOpen(true)}>
              <span className="retoic" aria-hidden="true"><Target size={18} strokeWidth={2} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="name" style={{ whiteSpace: 'normal' }}>
                  {retoSemanal.anteriorNoSalio ? 'El reto pasado no salió. Te tengo uno nuevo.' : 'Tu reto de la semana está listo'}
                </span>
                <span className="meta">Premio: +50 puntos, un comodín y una caja sorpresa</span>
              </span>
              <span className="chev" aria-hidden="true"><ChevronRight size={18} strokeWidth={2.2} /></span>
            </button>
          )}

          {retoSemanal.estado === 'aceptado' && retoSemanal.opcionElegida && (
            <button className="retorow w-full text-left" onClick={() => setIsRetoSheetOpen(true)}>
              <span className="retoic" aria-hidden="true"><Target size={18} strokeWidth={2} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                {(() => {
                  const opt = retoSemanal.opciones.find(o => o.id === retoSemanal.opcionElegida);
                  if (!opt) return null;
                  
                  if (opt.id === 'dia_dificil' && opt.dia !== undefined) {
                    const targetD = new Date(retoSemanal.id + 'T12:00:00');
                    const offset = opt.dia === 0 ? 6 : opt.dia - 1;
                    targetD.setDate(targetD.getDate() + offset);
                    const diff = Math.round((targetD.getTime() - new Date(hoy + 'T12:00:00').getTime()) / 86400000);
                    
                    let dayName = opt.dia === 0 ? 'domingo' : opt.dia === 1 ? 'lunes' : opt.dia === 2 ? 'martes' : opt.dia === 3 ? 'miércoles' : opt.dia === 4 ? 'jueves' : opt.dia === 5 ? 'viernes' : 'sábado';
                    let metaT = '';
                    if (diff > 1) metaT = `El ${dayName} es en ${diff} días`;
                    else if (diff === 1) metaT = `El ${dayName} es mañana`;
                    else if (diff === 0) metaT = `Hoy es el día`;

                    return (
                      <>
                        <span className="name" style={{ whiteSpace: 'normal' }}>Reto: {opt.texto}</span>
                        {metaT && <span className="meta">{metaT}</span>}
                      </>
                    );
                  }

                  return (
                    <>
                      <span className="name" style={{ whiteSpace: 'normal' }}>Reto: {opt.texto}</span>
                      <i className="minibar" aria-hidden="true"><b style={{ width: `${(retoSemanal.avance / (opt.metaRequerida || 1)) * 100}%` }}></b></i>
                      <span className="meta">{retoSemanal.avance} de {opt.metaRequerida} · hasta el domingo</span>
                    </>
                  );
                })()}
              </span>
              <span className="chev" aria-hidden="true"><ChevronRight size={18} strokeWidth={2.2} /></span>
            </button>
          )}
        </>
      )}

      {/* 6. Misiones Agrupadas */}
      <div className="mt-4.5 flex justify-between items-baseline mb-3">
        <h2 className="m-0 font-heading font-bold text-[22px]">Misiones</h2>
        <span className="text-[13px] text-text-muted">
          +{habitosPendientes.length * 10} pts por ganar · <button onClick={openManageHabits} className="font-semibold text-ambar-text hover:underline">Gestionar</button>
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {ordenMomentos.map(mom => {
          const inMom = habitosOrdenados.filter(h => (h.momento || 'flexible') === mom);
          if (inMom.length === 0) return null;
          
          const hechos = inMom.filter(h => esHabitoCompletado(h.id)).length;
          const total = inMom.length;
          const isPlegado = plegados[mom];
          const minfo = getMomentoColorInfo(mom);
          
          return (
            <section key={mom} className="flex flex-col gap-2">
              <div 
                className="flex items-center gap-2.5 px-0.5 cursor-pointer select-none" 
                onClick={() => togglePlegado(mom)}
              >
                <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center shrink-0 ${minfo.iconBg} ${minfo.iconColor}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {getMomentoIcon(mom)}
                  </svg>
                </div>
                <div className="flex-1 flex items-center">
                  <span className="font-heading font-bold text-[17px]">{getMomentoTitle(mom)}</span>
                  {currentMomento === mom && (
                    <span className="font-body font-semibold text-[12px] text-lila ml-1">ahora</span>
                  )}
                </div>
                <span className="text-[13px] text-text-muted font-number">{hechos}/{total}</span>
                <div className="w-[44px] h-[5px] rounded-[9px] bg-track overflow-hidden shrink-0">
                  <div className={`h-full rounded-[9px] ${minfo.bg}`} style={{ width: `${(hechos/total)*100}%` }}></div>
                </div>
                <ChevronDown size={16} className={`text-text-muted transition-transform ${isPlegado ? 'rotate-180' : ''}`} />
              </div>

              {!isPlegado && (
                <div className="flex flex-col gap-2">
                  {inMom.map(habito => {
                    const hInfo = getMomentoColorInfo(habito.momento);
                    const isNegativo = habito.tipo === 'negativo';
                    const isHecho = esHabitoCompletado(habito.id);
                    const isNext = siguienteFila?.id === habito.id;

                    let rowClass = "flex flex-col gap-2 p-2.5 rounded-[14px] bg-surface cursor-pointer active:scale-[0.99] transition-transform";
                    if (isNext) {
                      rowClass = `flex flex-col gap-2 p-2.5 rounded-[14px] ${hInfo.iconBg} outline outline-[1.5px] outline-offset-[-1.5px] cursor-pointer active:scale-[0.99] transition-transform`;
                    }
                    
                    const progressReto = habito.reto ? contarProgresoReto(habito, registros) : 0;

                    let anchorText = '';
                    if (habito.anclaje) {
                      anchorText = isNegativo ? `evitar · cuando ${habito.anclaje}` : `después de ${habito.anclaje}`;
                    } else {
                      if (isNegativo) anchorText = 'evitar';
                      else if (habito.frecuencia === 'semanal') anchorText = `${contarCompletadosSemana(habito.id, hoy, registros)} de ${habito.vecesPorSemana} esta semana`;
                      else if (habito.metaDiaria) anchorText = `${valorDe(habito.id)} de ${habito.metaDiaria}${(habito as any).unidad ? ` ${(habito as any).unidad}` : ''}`;
                    }

                    return (
                      <div key={habito.id} id={`habito-${habito.id}`} onClick={() => openHabitDetail(habito.id)} className={rowClass} style={isNext ? { outlineColor: hInfo.varColor } : undefined}>
                        <div className="flex items-center gap-3">
                          <div title={habito.momento || 'Todo el día'} className={`w-[38px] h-[38px] rounded-[11px] ${isNext ? hInfo.bg + ' text-ink' : hInfo.iconBg + ' ' + hInfo.iconColor} flex items-center justify-center shrink-0`}>
                             <HabitIcon name={habito.icono} size={19} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`m-0 text-[15px] font-semibold truncate ${isHecho ? 'text-text-muted line-through decoration-text-muted decoration-[1.5px]' : 'text-text'}`}>
                              {habito.nombre}
                            </p>
                            
                            {isHecho ? (
                              <p className="m-0 mt-[1px] text-[13px] font-bold text-ambar-text truncate">
                                +10 ganados
                              </p>
                            ) : isNext ? (
                              <div className="m-0 mt-[1px] text-[13px] text-lila-text opacity-80 flex items-center gap-1.5 truncate">
                                <span className={`inline-block px-[7px] py-[1px] rounded-[6px] ${hInfo.bg} text-ink text-[11px] font-bold shrink-0`}>
                                  Sigue
                                </span>
                                {anchorText && <span className="truncate">{anchorText}</span>}
                              </div>
                            ) : anchorText ? (
                              <p className="m-0 mt-[1px] text-[13px] text-text-muted truncate">
                                {anchorText}
                              </p>
                            ) : null}
                            
                            {habito.metaDiaria && !isHecho && !isNext && (
                              <div className="mt-1.5 flex gap-[3px]" role="img" aria-label={`${valorDe(habito.id)} de ${habito.metaDiaria}`}>
                                 {Array.from({length: habito.metaDiaria}).map((_, i) => (
                                    <span key={i} className={`w-4 h-1.5 rounded-[2px] ${i < valorDe(habito.id) ? 'bg-text' : 'bg-track-empty'}`}></span>
                                 ))}
                              </div>
                            )}
                          </div>

                          {!habito.metaDiaria && !isHecho && !isNext && <span className="text-[13px] text-text-muted font-number">+10</span>}
                          
                          {isNext && (
                             <button type="button" onClick={(e) => { e.stopPropagation(); openFocusMode({ tipo: 'rutina', nombre: habito.nombre, habitoIds: [habito.id] }); }} className={`h-[32px] px-2.5 rounded-[10px] border bg-transparent ${hInfo.iconColor} text-[13px] font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform`} style={{ borderColor: hInfo.varColor }}>
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg> Empezar
                             </button>
                          )}

                          {habito.metaDiaria && !isHecho ? (
                             <button type="button" onClick={(e) => { e.stopPropagation(); setValor(habito.id, hoy, valorDe(habito.id) + 1); }} aria-label={`Sumar uno a ${habito.nombre}`} className="h-[32px] px-3 rounded-[10px] border border-line-strong bg-surface-raised text-text text-[14px] font-bold active:scale-95 transition-transform shrink-0">+1</button>
                          ) : (
                             <button type="button" onClick={(e) => { e.stopPropagation(); toggleCompletado(habito.id); }} aria-label={`Marcar ${habito.nombre}`} className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-transform duration-180 scale-100 hover:scale-105 active:scale-90 shrink-0 ${isHecho ? 'bg-ambar border-none' : `bg-transparent border-2 ${isNext ? '' : 'border-line-strong'}`}`} style={isNext && !isHecho ? { borderColor: hInfo.varColor } : undefined}>
                                {isHecho && <Check size={18} strokeWidth={3} className="text-ink" />}
                             </button>
                          )}
                        </div>

                        {habito.reto && (
                          <div className="flex items-center gap-2 mt-0.5" role="progressbar" aria-valuenow={progressReto} aria-valuemax={habito.reto.meta} aria-label={`Reto de ${habito.nombre}`}>
                            <div className="flex-1 h-1.5 rounded-full bg-track-empty overflow-hidden">
                              <div className="h-full rounded-full bg-ambar-text transition-all" style={{ width: `${Math.min(100, Math.round((progressReto / habito.reto.meta) * 100))}%` }} />
                            </div>
                            <span className="text-[12px] text-text-muted font-number whitespace-nowrap">
                              {progressReto === 0 
                                ? `Reto de ${habito.reto.meta} ${habito.frecuencia === 'semanal' ? 'semanas' : 'días'}` 
                                : `Reto · ${progressReto} de ${habito.reto.meta}`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* 8. Progreso insignia */}
      {proximaInsignia && (
        <div className="mt-4 flex items-center gap-3">
          <BadgeIcon iconName={proximaInsignia.icono} size={22} className="text-ambar-text" strokeWidth={2} />
          <div className="flex-1">
            <p className="m-0 flex justify-between text-[13px]"><span className="font-semibold text-text">Insignia {proximaInsignia.nombre}</span><span className="text-text-muted">faltan {proximaInsignia.meta - proximaInsignia.progresoActual}</span></p>
            <div className="mt-1.5 h-1.5 rounded-full bg-track overflow-hidden">
               <div className="h-full rounded-full bg-ambar" style={{ width: `${(proximaInsignia.progresoActual / proximaInsignia.meta) * 100}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Rutinas y Tareas restilizadas */}
      {(rutinas.length > 0 || tareas.length > 0) && (
        <div className="mt-6 space-y-4">
          {rutinas.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-accent-text" />
                  <h2 className="text-[20px] font-bold font-heading text-text">Rutinas</h2>
                </div>
                <button type="button" onClick={() => openRutinaEditor(null)} className="text-[13px] font-semibold text-accent-text hover:underline">
                  + Nueva
                </button>
              </div>
              <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {rutinas.map((rutina) => (
                  <div key={rutina.id} className="relative shrink-0 w-[150px]">
                    <button type="button" onClick={() => openFocusMode({ tipo: 'rutina', nombre: rutina.nombre, habitoIds: rutina.habitoIds })}
                      className="w-full h-full rounded-[14px] bg-surface border border-line p-3 text-left active:scale-[0.98] transition-all">
                      <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center mb-2" style={{ backgroundColor: `${rutina.color}20`, color: rutina.color, border: `1px solid ${rutina.color}40` }}>
                        <HabitIcon name={rutina.icono} size={19} />
                      </div>
                      <p className="text-[15px] font-bold font-heading text-text truncate pr-5">{rutina.nombre}</p>
                      <p className="text-[13px] text-text-muted mt-0.5">{rutina.habitoIds.length} hábitos</p>
                    </button>
                    <button type="button" onClick={() => openRutinaEditor(rutina)} aria-label="Editar rutina"
                      className="absolute top-2 right-2 w-[28px] h-[28px] rounded-md bg-surface-raised text-text-muted flex items-center justify-center">
                      <Pencil size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tareas.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <ListChecks size={15} className="text-accent-text" />
                  <h2 className="text-[20px] font-bold font-heading text-text">Tareas</h2>
                </div>
                <button type="button" onClick={() => openTareaEditor(null)} className="text-[13px] font-semibold text-accent-text hover:underline">+ Nueva</button>
              </div>
              <div className="space-y-2.5">
                {tareas.map((tarea) => {
                  const { total, hechas } = contarHojasSubtareas(tarea.subtareas);
                  const abierta = expandedTarea === tarea.id;
                  return (
                    <div key={tarea.id} className="rounded-[14px] bg-surface border border-line overflow-hidden">
                      <div className="p-3 flex items-center justify-between">
                        <button type="button" onClick={() => setExpandedTarea(abierta ? null : tarea.id)} className="flex items-center gap-3 min-w-0 flex-1 pr-2 text-left">
                          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${tarea.color}20`, color: tarea.color }}>
                            <HabitIcon name={tarea.icono} size={19} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-[15px] font-semibold font-heading truncate ${tarea.completada ? 'text-text-muted line-through decoration-text-muted' : 'text-text'}`}>{tarea.nombre}</h4>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[13px] font-medium text-accent-text">{hechas}/{total}</span>
                              <ChevronDown size={14} className={`text-text-muted transition-transform ${abierta ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          <button type="button" onClick={() => openTareaEditor(tarea)} aria-label="Editar tarea" className="w-[32px] h-[32px] rounded-[10px] bg-surface-raised text-text-muted flex items-center justify-center"><Pencil size={14} /></button>
                          <button type="button" onClick={() => openFocusMode({ tipo: 'tarea', tareaId: tarea.id })} aria-label="Enfocar tarea" className="w-[32px] h-[32px] rounded-[10px] bg-surface-raised text-text flex items-center justify-center"><Play size={14} className="fill-text" /></button>
                        </div>
                      </div>
                      {abierta && (
                        <div className="px-3 pb-3 space-y-1 animate-fadeIn border-t border-line pt-2">
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
        </div>
      )}

      {/* Modals */}
      {isRetoSheetOpen && retoSemanal && (
        <RetoSemanalSheet 
          reto={retoSemanal} 
          onClose={() => setIsRetoSheetOpen(false)} 
          onAccept={handleAcceptReto}
          onSkip={handleSkipReto}
          onOpenCaja={() => setIsCajaSheetOpen(true)}
        />
      )}
      {isCajaSheetOpen && (
        <CajaSorpresaSheet onClose={() => setIsCajaSheetOpen(false)} />
      )}
    </div>
  );
};
