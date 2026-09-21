import React, { useState, useMemo } from 'react';
import { Flame, Plus, Check, Sparkles, Trophy, ChevronDown, ShieldCheck, Minus, CalendarRange, Link2, Zap, Pencil, ListChecks, Play } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Habito, MOMENTOS, Subtarea } from '../../types';
import { 
  getTodayString, 
  contarCompletadosSemana, 
  calcularRachaSemanal, 
  contarHojasSubtareas, 
  subtractDays, 
  isHabitCompletedOnDate, 
  calcularPuntosTotales, 
  calcularNivel, 
  calcularProgresoNivel 
} from '../../utils/habitUtils';
import { calcularInsignias } from '../../utils/badgeUtils';

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
        className="w-full flex items-center gap-2.5 p-2 rounded-[10px] hover:bg-surface-raised transition-colors text-left group"
        style={{ paddingLeft: `${indentPx + 8}px` }}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all ${
            sub.hecha ? 'border-transparent' : 'border-line-strong group-hover:border-[#4B5162]'
          }`}
          style={sub.hecha ? { backgroundColor: color } : undefined}
        >
          {sub.hecha && <Check size={12} strokeWidth={3} className="text-text" />}
        </div>
        <span className={`text-xs flex-1 min-w-0 ${sub.hecha ? 'text-text-muted line-through' : 'text-text'}`}>
          {sub.texto}
        </span>
        {tieneHijos && stats && (
          <span className="text-[10px] font-mono text-text-muted shrink-0">
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
    comodines,
    diasCongelados,
  } = useHabitStore();

  const hoy = getTodayString();
  const currentHour = new Date().getHours();
  
  // Determinar momento actual
  // Mañana (0-12), Tarde (12-19), Noche (19-24)
  const currentMomento = currentHour < 12 ? 'manana' : currentHour < 19 ? 'tarde' : 'noche';

  const [expandedTarea, setExpandedTarea] = useState<string | null>(null);

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1).split(' ')[0] + ' ' + new Date().getDate();
  const completedCount = completadosHoy();
  const totalToday = habitosDeHoy.length;

  // Puntos y Nivel
  const puntosTotales = calcularPuntosTotales(registros);
  const nivelActual = calcularNivel(puntosTotales);
  const progresoNivel = calcularProgresoNivel(puntosTotales);
  const progresoNivelPercent = Math.min(100, Math.max(0, (progresoNivel / 1000) * 100));

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

  // Hábitos Pendientes y Completados
  const habitosPendientes = habitosDeHoy.filter(h => !esHabitoCompletado(h.id));
  const habitosCompletadosHoy = habitosDeHoy.filter(h => esHabitoCompletado(h.id));

  // Seleccionar "Sigue ahora"
  let sigueAhora: Habito | null = null;
  if (habitosPendientes.length > 0) {
    // Prioridad: Momento actual, luego los siguientes, luego flexible
    const currentMomentHabits = habitosPendientes.filter(h => h.momento === currentMomento);
    const otherMomentHabits = habitosPendientes.filter(h => h.momento !== currentMomento && h.momento !== 'flexible');
    const flexibleHabits = habitosPendientes.filter(h => h.momento === 'flexible' || !h.momento);
    
    // Sort all internally by their orden
    currentMomentHabits.sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0));
    otherMomentHabits.sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0));
    flexibleHabits.sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0));

    if (currentMomentHabits.length > 0) {
      sigueAhora = currentMomentHabits[0];
    } else if (otherMomentHabits.length > 0) {
      sigueAhora = otherMomentHabits[0];
    } else {
      sigueAhora = flexibleHabits[0];
    }
  }

  // Misiones: El resto (pendientes y completados)
  const misiones = habitosDeHoy.filter(h => h.id !== sigueAhora?.id).sort((a,b) => {
    // Por momento: mañana -> tarde -> noche -> flexible
    const order = { manana: 1, tarde: 2, noche: 3, flexible: 4 };
    const aMom = a.momento || 'flexible';
    const bMom = b.momento || 'flexible';
    if (order[aMom as keyof typeof order] !== order[bMom as keyof typeof order]) {
      return (order[aMom as keyof typeof order] || 4) - (order[bMom as keyof typeof order] || 4);
    }
    return (a.orden ?? 0) - (b.orden ?? 0);
  });

  const getMomentoColorInfo = (momento?: string) => {
    switch (momento) {
      case 'manana': return { bg: 'bg-ambar', text: 'text-ink', iconTint: 'bg-ambar-tint text-ambar', iconBg: 'bg-ambar-tint', iconColor: 'text-ambar' };
      case 'tarde': return { bg: 'bg-coral', text: 'text-ink', iconTint: 'bg-coral-tint text-coral', iconBg: 'bg-coral-tint', iconColor: 'text-coral' };
      case 'noche': return { bg: 'bg-lila', text: 'text-ink', iconTint: 'bg-lila-tint text-lila', iconBg: 'bg-lila-tint', iconColor: 'text-lila' };
      default: return { bg: 'bg-surface-raised', text: 'text-text', iconTint: 'bg-surface-raised text-text', iconBg: 'bg-surface-raised', iconColor: 'text-text' };
    }
  };

  const badgeCalculations = calcularInsignias(habitosActivos, registros, rachaGlobal(), rachaGlobal());
  const proximasInsignias = badgeCalculations.filter(b => !b.desbloqueada);
  const proximaInsignia = proximasInsignias.length > 0 ? proximasInsignias[0] : null;

  return (
    <div id="screen-today" className="pb-28 animate-fadeIn text-text font-body pt-2">
      {/* 2. Nivel y puntos */}
      <div className="mt-3.5 mx-5 flex items-center gap-2.5">
        <span className="font-heading font-bold text-[15px] text-ink bg-lila px-2 py-0.5 rounded-[6px]">Nivel {nivelActual}</span>
        <div className="flex-1 h-2 rounded-full bg-track overflow-hidden">
          <div className="h-full rounded-full bg-lila" style={{ width: `${progresoNivelPercent}%` }}></div>
        </div>
        <span className="text-[13px] text-text-muted font-number">{progresoNivel} / 1000</span>
      </div>

      {/* 3. Fecha en display y comodines */}
      <section className="pt-3.5 px-5 flex items-start justify-between">
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
      <section aria-label="Últimos 7 días" className="mt-3.5 mx-5 flex flex-col gap-2">
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

      {/* 5. Tarjeta Sigue ahora */}
      {sigueAhora ? (
        <section aria-label="Lo siguiente" className={`mt-3.5 mx-5 p-3.5 rounded-[18px] ${getMomentoColorInfo(sigueAhora.momento).bg} ${getMomentoColorInfo(sigueAhora.momento).text} flex flex-col gap-3`}>
          <div className="flex items-center gap-3">
            <div className={`w-[42px] h-[42px] rounded-[12px] bg-ink ${sigueAhora.momento === 'tarde' ? 'text-coral' : sigueAhora.momento === 'manana' ? 'text-ambar' : sigueAhora.momento === 'noche' ? 'text-lila' : 'text-text'} flex items-center justify-center shrink-0`}>
              <HabitIcon name={sigueAhora.icono} size={21} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="m-0 font-heading font-bold text-[24px] leading-tight truncate">{sigueAhora.nombre}</h2>
              <p className="mt-0.5 text-[14px] font-medium opacity-80 truncate">
                Sigue ahora · {sigueAhora.momento === 'flexible' ? 'todo el día' : sigueAhora.momento || 'todo el día'}{sigueAhora.anclaje ? ` · después de ${sigueAhora.anclaje}` : ''}
              </p>
            </div>
            <span className="font-heading font-bold text-[17px] font-number">+10</span>
          </div>
          <div className="flex gap-2">
            {sigueAhora.metaDiaria ? (
               <button type="button" onClick={() => setValor(sigueAhora!.id, hoy, valorDe(sigueAhora!.id) + 1)} className="flex-1 flex items-center justify-center gap-2 h-[44px] border-none rounded-[12px] bg-ink text-text text-[15px] font-bold">
                 <Plus size={18} strokeWidth={2.5} /> Sumar +1
               </button>
            ) : (
              <button type="button" onClick={() => toggleCompletado(sigueAhora!.id)} className="flex-1 flex items-center justify-center gap-2 h-[44px] border-none rounded-[12px] bg-ink text-text text-[15px] font-bold">
                <Check size={18} strokeWidth={2.5} /> Marcar hecho
              </button>
            )}
            <button type="button" onClick={() => openFocusMode({ tipo: 'dia' })} className="h-[44px] px-3.5 rounded-[12px] border-[1.5px] border-ink/45 bg-transparent text-ink text-[14px] font-bold">
              Solo 2 min
            </button>
          </div>
        </section>
      ) : habitosDeHoy.length > 0 && habitosPendientes.length === 0 ? (
        <section className="mt-3.5 mx-5 p-3.5 rounded-[18px] bg-surface-raised border border-line text-center space-y-2">
           <Trophy size={28} className="mx-auto text-ambar" />
           <h3 className="font-heading font-bold text-lg text-text">¡Día completado!</h3>
           <p className="text-[13px] text-text-muted">No quedan misiones pendientes para hoy.</p>
        </section>
      ) : null}

      {/* 6. Misiones */}
      {misiones.length > 0 && (
        <section aria-label="Misiones" className="mt-4 mx-5 flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <h2 className="m-0 font-heading font-bold text-[20px]">Misiones</h2>
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-text-muted">+{misiones.filter(h => !esHabitoCompletado(h.id)).length * 10} pts por ganar</span>
              <button onClick={openManageHabits} className="text-[13px] font-medium text-[var(--accent)] hover:underline">Gestionar</button>
            </div>
          </div>

          {misiones.map(habito => {
            const minfo = getMomentoColorInfo(habito.momento);
            const isNegativo = habito.tipo === 'negativo';
            const isHecho = esHabitoCompletado(habito.id);
            return (
              <div key={habito.id} onClick={() => openHabitDetail(habito.id)} className="flex items-center gap-3 p-2.5 rounded-[14px] bg-surface cursor-pointer active:scale-[0.99] transition-transform">
                <div title={habito.momento || 'Todo el día'} className={`w-[38px] h-[38px] rounded-[11px] ${minfo.iconBg} ${minfo.iconColor} flex items-center justify-center shrink-0`}>
                   <HabitIcon name={habito.icono} size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`m-0 text-[15px] font-semibold truncate ${isHecho ? 'text-text-muted line-through decoration-[#5C6070] decoration-[1.5px]' : 'text-text'}`}>{habito.nombre}</p>
                  
                  {isHecho ? (
                    <p className="m-0 mt-[1px] text-[13px] font-bold text-ambar truncate">
                      +10 ganados
                    </p>
                  ) : (
                    <p className="m-0 mt-[1px] text-[13px] text-text-muted truncate">
                      {(habito.momento === 'flexible' ? 'Todo el día' : habito.momento ? habito.momento.charAt(0).toUpperCase() + habito.momento.slice(1) : 'Todo el día')}
                      {isNegativo ? ' · evitar' : habito.frecuencia === 'semanal' ? ` · 1 de ${habito.vecesPorSemana} esta semana` : ''}
                      {habito.metaDiaria && ` · ${valorDe(habito.id)} de ${habito.metaDiaria}${(habito as any).unidad ? ` ${(habito as any).unidad}` : ''}`}
                    </p>
                  )}
                  
                  {habito.metaDiaria && !isHecho && (
                    <div className="mt-1.5 flex gap-[3px]" role="img" aria-label={`${valorDe(habito.id)} de ${habito.metaDiaria}`}>
                       {Array.from({length: habito.metaDiaria}).map((_, i) => (
                          <span key={i} className={`w-4 h-1.5 rounded-[2px] ${i < valorDe(habito.id) ? 'bg-text' : 'bg-track-empty'}`}></span>
                       ))}
                    </div>
                  )}
                </div>
                {!habito.metaDiaria && !isHecho && <span className="text-[13px] text-text-muted font-number">+10</span>}
                {habito.metaDiaria && !isHecho ? (
                   <button type="button" onClick={(e) => { e.stopPropagation(); setValor(habito.id, hoy, valorDe(habito.id) + 1); }} aria-label={`Sumar uno a ${habito.nombre}`} className="h-[32px] px-3 rounded-[10px] border border-line-strong bg-surface-raised text-text text-[14px] font-bold active:scale-95 transition-transform">+1</button>
                ) : (
                   <button type="button" onClick={(e) => { e.stopPropagation(); toggleCompletado(habito.id); }} aria-label={`Marcar ${habito.nombre}`} className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-transform duration-180 scale-100 hover:scale-105 active:scale-90 ${isHecho ? 'bg-ambar border-none' : 'bg-transparent border-2 border-line-strong'}`}>
                      {isHecho && <Check size={18} strokeWidth={3} className="text-ink" />}
                   </button>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* 8. Progreso insignia */}
      {proximaInsignia && (
        <div className="mt-4 mx-5 flex items-center gap-3">
          <Trophy size={22} className="text-ambar" strokeWidth={2} />
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
            <section className="space-y-2 mx-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-[var(--accent)]" />
                  <h2 className="text-[20px] font-bold font-heading text-text">Rutinas</h2>
                </div>
                <button type="button" onClick={() => openRutinaEditor(null)} className="text-[13px] font-semibold text-[var(--accent)] hover:underline">
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
            <section className="space-y-2 mx-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <ListChecks size={15} className="text-[var(--accent)]" />
                  <h2 className="text-[20px] font-bold font-heading text-text">Tareas</h2>
                </div>
                <button type="button" onClick={() => openTareaEditor(null)} className="text-[13px] font-semibold text-[var(--accent)] hover:underline">+ Nueva</button>
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
                              <h4 className={`text-[15px] font-semibold font-heading truncate ${tarea.completada ? 'text-text-muted line-through decoration-[#5C6070]' : 'text-text'}`}>{tarea.nombre}</h4>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[13px] font-medium text-[var(--accent)]">{hechas}/{total}</span>
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

    </div>
  );
};
