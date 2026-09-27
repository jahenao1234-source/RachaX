import React, { useState, useMemo, useEffect } from 'react';
import { BadgeIcon } from '../badges/BadgeIcon';
import { Plus, Check, Sparkles, Trophy, ChevronDown, ShieldCheck, Pencil, ListChecks, Play, Zap, ChevronRight, Target, Info, Focus, Gift } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { useTheme } from '../../store/ThemeContext';
import { HabitIcon } from '../common/HabitIcon';
import { Llama, LlamaDe, nombreLlama } from '../juego/Llama';
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
  ETAPAS,
  getSemanaDates,
  isHabitScheduledForDate
} from '../../utils/habitUtils';
import { idsEnRutinasDeHoy, tareasDeHoy, RutinaDeHoy } from '../../utils/hoyUtils';
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

export function useEsEscritorio() {
  const [esEscritorio, setEsEscritorio] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return false;
  });

  React.useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    // También al cambiar el tamaño: algunos navegadores no avisan el cambio de la media query
    const handler = () => setEsEscritorio(mql.matches);
    mql.addEventListener('change', handler);
    window.addEventListener('resize', handler);
    return () => { mql.removeEventListener('change', handler); window.removeEventListener('resize', handler); };
  }, []);

  return esEscritorio;
}

const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const nombreDia = (d: string) => { const f = new Date(d + 'T12:00:00'); return `${DIAS_LARGOS[f.getDay()]} ${f.getDate()}`; };

const renderFilaHabito = ({
  habito, isHecho, isNext, minfo, progressReto, anchorText, desk, inRutina,
  openHabitDetail, setValor, valorDe, hoy, toggleCompletado, openFocusMode,
  registros, diasCongelados, fechasSemana
}: any) => {
  if (desk) {
    return (
      <div
        key={habito.id}
        id={`habito-${habito.id}`}
        onClick={() => openHabitDetail(habito.id)}
        className={`flex items-center min-h-[64px] cursor-pointer transition-colors px-3 py-2 ${inRutina ? 'bg-transparent hover:bg-surface-raised' : 'rounded-[14px]'} ${isNext && !isHecho ? `${minfo.iconBg} ${inRutina ? '' : 'hoyc-next outline outline-offset-[-1.5px]'}` : inRutina ? '' : 'bg-surface hover:bg-surface-raised border border-line'}`}
        style={isNext && !isHecho && !inRutina ? { outlineColor: minfo.varColor } : undefined}
      >
        <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 ${isNext && !isHecho ? minfo.bg + ' text-ink' : minfo.iconBg + ' ' + minfo.iconColor}`}>
          <HabitIcon name={habito.icono} size={19} />
        </div>

        <div className="flex-1 min-w-0 ml-3 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`text-[15px] font-bold truncate ${isHecho ? 'text-text-muted line-through decoration-text-muted decoration-[1.5px]' : 'text-text'}`}>
              {habito.nombre}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-text-muted mt-0.5">
            {isHecho ? (
              <span className="font-bold text-ambar-text">+10 ganados</span>
            ) : (
              <>
                {anchorText && <span className="truncate">{anchorText}</span>}
                {isNext && <span className={`inline-block px-[7px] py-[1px] rounded-[6px] ${minfo.bg} text-ink text-[11px] font-bold shrink-0 ml-1`}>Sigue</span>}
              </>
            )}
          </div>
          {habito.metaDiaria && !isHecho && (
            <div className="mt-1.5 h-1.5 max-w-[130px] rounded-full overflow-hidden shadow-[inset_0_0_0_1px_var(--text-muted)]">
               <div className="h-full rounded-full bg-text" style={{ width: `${Math.min(100, (valorDe(habito.id) / habito.metaDiaria) * 100)}%` }} />
            </div>
          )}
          {habito.reto && (
            <div className="flex items-center gap-2 mt-1.5 max-w-[260px]" role="progressbar" aria-valuenow={progressReto} aria-valuemin={0} aria-valuemax={habito.reto.meta} aria-valuetext={`${progressReto} de ${habito.reto.meta} ${habito.frecuencia === 'semanal' ? 'semanas' : 'días'}`} aria-label={`Reto de ${habito.nombre}`}>
              <div className="flex-1 h-1.5 rounded-full bg-track-empty overflow-hidden">
                <div className="h-full rounded-full bg-ambar-text" style={{ width: `${Math.min(100, Math.round((progressReto / habito.reto.meta) * 100))}%` }} />
              </div>
              <span className="text-[12px] text-text-muted font-number whitespace-nowrap">
                {progressReto === 0 ? `Reto de ${habito.reto.meta} ${habito.frecuencia === 'semanal' ? 'semanas' : 'días'}` : `Reto · ${progressReto} de ${habito.reto.meta}`}
              </span>
            </div>
          )}
        </div>

        <ol aria-label={`${habito.nombre}: esta semana`} className="hoyd-wk flex gap-[3px] ml-4 shrink-0 w-[112px] xl:w-[136px] m-0 p-0 list-none">
          {fechasSemana.map((d: string) => {
            const scheduled = isHabitScheduledForDate(habito, d);
            const completed = scheduled && isHabitCompletedOnDate(habito.id, d, registros);
            const frozen = scheduled && diasCongelados?.includes(d);

            const estado = completed ? 'cumplido' : frozen ? 'comodín' : !scheduled ? 'no tocaba' : d > hoy ? 'todavía no llega' : d === hoy ? 'hoy, pendiente' : 'sin cumplir';
            return <li key={d} aria-label={`${nombreDia(d)}, ${estado}`} className={completed ? 'ok' : frozen ? 'como' : ''} />
          })}
        </ol>

        {!isHecho && isNext && !inRutina && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openFocusMode({ tipo: 'rutina', nombre: habito.nombre, habitoIds: [habito.id] }); }}
            aria-label={`Empezar ${habito.nombre} en modo Foco`}
            className="h-[40px] px-3.5 ml-3 rounded-[10px] bg-surface-raised border border-line-strong text-text font-bold flex items-center gap-1.5 shrink-0 text-[14px] active:scale-95 transition-transform relative after:absolute after:-inset-[2px] after:content-['']"
          >
            <Play size={12} className="fill-current" /> Empezar
          </button>
        )}

        {habito.metaDiaria && !isHecho ? (
           <button type="button" onClick={(e) => { e.stopPropagation(); setValor(habito.id, hoy, valorDe(habito.id) + 1); }} aria-label={`Sumar uno a ${habito.nombre}. Llevas ${valorDe(habito.id)} de ${habito.metaDiaria}`} className="relative w-[44px] h-[44px] ml-3 rounded-[10px] border border-text-muted bg-surface-raised text-text text-[15px] font-bold active:scale-95 transition-transform flex items-center justify-center shrink-0">+1</button>
        ) : (
           <button type="button" onClick={(e) => { e.stopPropagation(); toggleCompletado(habito.id); }} aria-label={`Marcar ${habito.nombre}`} aria-pressed={isHecho} className={`relative after:absolute after:-inset-[5px] after:content-[''] w-[34px] h-[34px] ml-3 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-90 shrink-0 ${isHecho ? 'logro border-none' : 'bg-transparent border-2 border-text-muted'}`} style={isNext && !isHecho ? { borderColor: minfo.varColor } : undefined}>
              {isHecho && <Check size={18} strokeWidth={3} className="text-ink" />}
           </button>
        )}
      </div>
    );
  }

  // Mobile version
  let rowClass = "flex flex-col gap-2 p-2.5 cursor-pointer active:scale-[0.99] transition-transform " + (inRutina ? "bg-transparent" : "rounded-[14px] bg-surface");
  if (isNext && !inRutina) {
    rowClass = `flex flex-col gap-2 p-2.5 rounded-[14px] ${minfo.iconBg} outline hoyc-next outline-offset-[-1.5px] cursor-pointer active:scale-[0.99] transition-transform`;
  } else if (isNext && inRutina) {
    rowClass += ` ${minfo.iconBg}`;
  }

  return (
    <div key={habito.id} id={`habito-${habito.id}`} onClick={() => openHabitDetail(habito.id)} className={rowClass} style={isNext && !inRutina ? { outlineColor: minfo.varColor } : undefined}>
      <div className="flex items-center gap-3">
        <div title={habito.momentoEfectivo || 'Todo el día'} className={`w-[38px] h-[38px] rounded-[11px] ${isNext && !isHecho ? minfo.bg + ' text-ink' : minfo.iconBg + ' ' + minfo.iconColor} flex items-center justify-center shrink-0`}>
           <HabitIcon name={habito.icono} size={19} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-x-2 min-w-0">
            <p className={`m-0 min-w-0 text-[15px] font-semibold truncate ${isHecho ? 'text-text-muted line-through decoration-text-muted decoration-[1.5px]' : 'text-text'}`}>
              {habito.nombre}
            </p>
            {isNext && !isHecho && (
              <span className={`inline-block px-[7px] py-[1px] rounded-[6px] ${minfo.bg} text-ink text-[11px] font-bold shrink-0`}>
                Sigue
              </span>
            )}
          </div>
          {isHecho ? (
            <p className="m-0 mt-[1px] text-[13px] font-bold text-ambar-text truncate">+10 ganados</p>
          ) : anchorText ? (
            <p className="m-0 mt-[1px] text-[13px] text-text-muted truncate">{anchorText}</p>
          ) : null}
          {habito.metaDiaria && !isHecho && (
            habito.metaDiaria > 12 ? (
              <div className="mt-1.5 h-1.5 max-w-[130px] rounded-full overflow-hidden shadow-[inset_0_0_0_1px_var(--text-muted)]" aria-hidden="true">
                <div className="h-full rounded-full bg-text" style={{ width: `${Math.min(100, (valorDe(habito.id) / habito.metaDiaria) * 100)}%` }} />
              </div>
            ) : (
              <div className="mt-1.5 flex gap-[3px] max-w-[130px]" aria-hidden="true">
                {Array.from({length: habito.metaDiaria}).map((_, i) => (
                  <span key={i} className={`flex-1 h-1.5 rounded-[2px] ${i < valorDe(habito.id) ? 'bg-text' : 'shadow-[inset_0_0_0_1px_var(--text-muted)]'}`}></span>
                ))}
              </div>
            )
          )}
        </div>
        {!habito.metaDiaria && !isHecho && !isNext && <span className="text-[13px] text-text-muted font-number">+10</span>}
        {/* Sin reto, "Empezar" va en la misma línea (con reto baja junto a la barra del reto) */}
        {isNext && !isHecho && !habito.reto && !inRutina && (
          <button type="button" onClick={(e) => { e.stopPropagation(); openFocusMode({ tipo: 'rutina', nombre: habito.nombre, habitoIds: [habito.id] }); }} aria-label={`Empezar ${habito.nombre} en modo Foco`} className="h-[44px] px-3 rounded-[12px] border bg-transparent text-[14px] font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform" style={{ borderColor: minfo.varColor, color: minfo.varColor }}>
            <Play size={12} className="fill-current" /> Empezar
          </button>
        )}
        {habito.metaDiaria && !isHecho ? (
           <button type="button" onClick={(e) => { e.stopPropagation(); setValor(habito.id, hoy, valorDe(habito.id) + 1); }} aria-label={`Sumar uno a ${habito.nombre}`} className="relative after:absolute after:-inset-[6px] after:content-[''] h-[32px] px-3 rounded-[10px] border border-text-muted bg-surface-raised text-text text-[14px] font-bold active:scale-95 transition-transform shrink-0">+1</button>
        ) : (
           <button type="button" onClick={(e) => { e.stopPropagation(); toggleCompletado(habito.id); }} aria-label={`Marcar ${habito.nombre}`} className={`relative after:absolute after:-inset-[6px] after:content-[''] w-[32px] h-[32px] rounded-full flex items-center justify-center transition-transform duration-180 scale-100 hover:scale-105 active:scale-90 shrink-0 ${isHecho ? 'logro border-none' : 'bg-transparent border-2 border-text-muted'}`} style={isNext && !isHecho ? { borderColor: minfo.varColor } : undefined}>
              {isHecho && <Check size={18} strokeWidth={3} className="text-ink" />}
           </button>
        )}
      </div>
      {habito.reto && (
        <div className="flex flex-wrap items-center gap-2 mt-0.5 ml-0">
          {habito.reto && (
            <div className="flex-1 flex items-center gap-2" role="progressbar" aria-valuenow={progressReto} aria-valuemin={0} aria-valuemax={habito.reto.meta} aria-valuetext={`${progressReto} de ${habito.reto.meta} ${habito.frecuencia === 'semanal' ? 'semanas' : 'días'}`} aria-label={`Reto de ${habito.nombre}`}>
              <div className="flex-1 h-1.5 rounded-full bg-track-empty overflow-hidden">
                <div className="h-full rounded-full bg-ambar-text transition-all" style={{ width: `${Math.min(100, Math.round((progressReto / habito.reto.meta) * 100)) }%` }} />
              </div>
              <span className="text-[12px] text-text-muted font-number whitespace-nowrap">
                {progressReto === 0 ? `Reto de ${habito.reto.meta} ${habito.frecuencia === 'semanal' ? 'semanas' : 'días'}` : `Reto · ${progressReto} de ${habito.reto.meta}`}
              </span>
            </div>
          )}
          {isNext && !isHecho && !inRutina && (
            <button type="button" aria-label={`Empezar ${habito.nombre} en modo Foco`} onClick={(e) => { e.stopPropagation(); openFocusMode({ tipo: 'rutina', nombre: habito.nombre, habitoIds: [habito.id] }); }} className={`h-[44px] px-3.5 rounded-[12px] border bg-transparent text-[14px] font-bold flex items-center gap-1.5 shrink-0 ml-auto active:scale-95 transition-transform`} style={{ borderColor: minfo.varColor, color: minfo.varColor }}>
              <Play size={12} className="fill-current" /> Empezar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const renderRutina = ({ r, mom, minfo, desk, isNextInside, openRutinaEditor, openFocusMode, currentMomento, esHabitoCompletado, renderHabitoFunc }: any) => {
  const rHechos = r.habitos.filter((h: any) => esHabitoCompletado(h.id)).length;
  const rTotal = r.habitos.length;
  const completa = rHechos === rTotal;
  const groupBorder = desk && isNextInside ? `1.5px solid ${minfo.varColor}` : desk ? `1px solid var(--line)` : isNextInside ? `1.5px solid ${minfo.varColor}` : `1px solid var(--line)`;

  return (
    <div key={r.rutina.id} className="bg-surface rounded-[16px] overflow-hidden flex flex-col" style={{ border: groupBorder }} role="group" aria-labelledby={`rutina-${r.rutina.id}`}>
      <div className="flex items-center gap-3 p-3">
        <h4 id={`rutina-${r.rutina.id}`} className="m-0 flex-1 min-w-0 font-normal">
          <button type="button" onClick={() => openRutinaEditor(r.rutina)} className="w-full min-h-[44px] flex items-center gap-3 text-left rounded-[10px]">
            <span className="w-[34px] h-[34px] rounded-[10px] bg-surface-raised flex items-center justify-center text-text shrink-0" aria-hidden="true">
              <HabitIcon name={r.rutina.icono} size={18} />
            </span>
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="font-heading font-bold text-[18px] truncate text-text"><span className="sr-only">Editar la rutina </span>{r.rutina.nombre}</span>
              <span className={`text-[13px] font-semibold mt-0.5 ${completa ? 'text-ambar-text font-bold' : 'text-text-muted'}`} aria-live="polite">
                {completa ? 'Rutina completa' : `Rutina · ${rHechos} de ${rTotal}`}
              </span>
            </span>
          </button>
        </h4>
        {!completa && (
          <button
            type="button"
            onClick={() => openFocusMode({ tipo: 'rutina', nombre: r.rutina.nombre, habitoIds: r.habitos.map((h: any) => h.id) })}
            aria-label={`Empezar la rutina ${r.rutina.nombre} en modo Foco`}
            className={`h-[44px] px-3 rounded-[12px] text-[14px] whitespace-nowrap flex items-center justify-center shrink-0 active:scale-95 transition-transform ${
              currentMomento === mom || isNextInside
                ? 'bg-transparent border-[1.5px] font-bold'
                : 'bg-transparent text-text-muted font-bold'
            }`}
            style={currentMomento === mom || isNextInside ? { borderColor: minfo.varColor, color: minfo.varColor } : undefined}
          >
            <Play size={12} className="fill-current mr-1.5" />
            Empezar rutina
          </button>
        )}
      </div>
      <div className="flex flex-col">
        {r.habitos.map((habito: any, index: number) => {
          return (
            <div key={habito.id} className={index > 0 ? "border-t border-line" : ""}>
               {renderHabitoFunc({ ...habito, momentoEfectivo: mom }, true)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const renderTareasBox = ({ th, toggleSubtarea, desk, openTareaEditor, navigateToTab }: any) => {
  if (th.modo === 'nada') return null;
  return (
    <section aria-labelledby="tareas-hoy-titulo" className={`bg-surface border border-line rounded-[18px] p-3.5 ${!desk ? 'mt-4' : ''}`}>
      <div className="flex flex-wrap items-center justify-between min-h-[44px]">
        <h2 id="tareas-hoy-titulo" className="m-0 font-heading font-bold text-[22px]">Tareas de hoy</h2>
        <button type="button" onClick={() => navigateToTab('tareas')} className="flex items-center gap-1 min-h-[44px] text-[15px] font-semibold text-ambar-text hover:underline">
          Ver tareas <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {th.modo === 'hoy' ? (
        <p className="m-0 mt-1 text-[13px] font-semibold text-text-muted" aria-live="polite">
          {th.pasos.every((p: any) => p.paso.hecha) ? (
            <span className="text-ambar-text font-bold">Hiciste los {th.pasos.length} pasos de hoy</span>
          ) : (
            `${th.pasos.filter((p: any) => p.paso.hecha).length} de ${th.pasos.length} pasos`
          )}
        </p>
      ) : (
        <p className="m-0 mt-1 text-[13px] font-medium text-text-muted">Hoy no tienes pasos asignados. Estos son los que siguen.</p>
      )}

      <ul className="mt-3 m-0 p-0 list-none flex flex-col">
        {th.pasos.map((p: any, i: number) => (
          <li key={p.paso.id} className={`flex items-start gap-3 py-2 min-h-[52px] ${i > 0 ? 'border-t border-line' : ''}`}>
            <button
              type="button"
              onClick={() => toggleSubtarea(p.tareaId, p.paso.id)}
              aria-pressed={p.paso.hecha}
              aria-label={`Marcar ${p.paso.texto}, de ${p.tareaNombre}`}
              className="relative shrink-0 w-[26px] h-[26px] rounded-[8px] flex items-center justify-center mt-1 transition-transform active:scale-95 after:content-[''] after:absolute after:-inset-2"
              style={{
                backgroundColor: p.paso.hecha ? 'var(--ambar)' : 'transparent',
                border: p.paso.hecha ? 'none' : '2px solid var(--text-muted)',
                backgroundImage: p.paso.hecha ? 'var(--logro)' : 'none'
              }}
            >
              {p.paso.hecha && <Check size={15} strokeWidth={3} className="text-ink" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`m-0 text-[15px] font-semibold ${p.paso.hecha ? 'text-text-muted line-through decoration-text-muted decoration-[1.5px]' : 'text-text'}`}>
                {p.paso.texto}
              </p>
              <p className="m-0 mt-0.5 text-[13px] text-text-muted">
                {p.tareaNombre}{!p.paso.hecha && p.atraso ? ` · ${p.atraso}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const renderRetoSemanalRow = ({ retoSemanal, desk, setIsRetoSheetOpen, hoy }: any) => {
  if (!retoSemanal) return null;

  const content = [];
  if (retoSemanal.estado === 'propuesto') {
    content.push(
      <button key="prop" className={`retorow nuevo w-full text-left ${desk ? 'my-0 border-none bg-surface-raised hover:bg-surface' : ''}`} onClick={() => setIsRetoSheetOpen(true)}>
        <span className="retoic" aria-hidden="true"><Target size={18} strokeWidth={2} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="name" style={{ whiteSpace: 'normal' }}>
            {retoSemanal.anteriorNoSalio ? 'El reto pasado no salió. Te tengo uno nuevo.' : 'Tu reto de la semana está listo'}
          </span>
          <span className="meta">Premio: +50 puntos, un comodín y una caja sorpresa</span>
        </span>
        <span className="chev" aria-hidden="true"><ChevronRight size={18} strokeWidth={2.2} /></span>
      </button>
    );
  } else if (retoSemanal.estado === 'aceptado' && retoSemanal.opcionElegida) {
    const opt = retoSemanal.opciones.find((o: any) => o.id === retoSemanal.opcionElegida);
    if (opt) {
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

        content.push(
          <button key="acept" className={`retorow w-full text-left ${desk ? 'my-0 border-none bg-surface-raised hover:bg-surface' : ''}`} onClick={() => setIsRetoSheetOpen(true)}>
            <span className="retoic" aria-hidden="true"><Target size={18} strokeWidth={2} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="name" style={{ whiteSpace: 'normal' }}>Reto: {opt.texto}</span>
              {metaT && <span className="meta">{metaT}</span>}
            </span>
            <span className="chev" aria-hidden="true"><ChevronRight size={18} strokeWidth={2.2} /></span>
          </button>
        );
      } else {
        content.push(
          <button key="acept" className={`retorow w-full text-left ${desk ? 'my-0 border-none bg-surface-raised hover:bg-surface' : ''}`} onClick={() => setIsRetoSheetOpen(true)}>
            <span className="retoic" aria-hidden="true"><Target size={18} strokeWidth={2} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="name" style={{ whiteSpace: 'normal' }}>Reto: {opt.texto}</span>
              <i className="minibar" aria-hidden="true"><b style={{ width: `${(retoSemanal.avance / (opt.metaRequerida || 1)) * 100}%` }}></b></i>
              <span className="meta">{retoSemanal.avance} de {opt.metaRequerida} · hasta el domingo</span>
            </span>
            <span className="chev" aria-hidden="true"><ChevronRight size={18} strokeWidth={2.2} /></span>
          </button>
        );
      }
    }
  }

  if (desk && content.length > 0) {
    return <div className="min-h-[76px] flex flex-col justify-center bg-surface border border-line rounded-[18px] p-2 overflow-hidden">{content}</div>;
  }
  return <>{content}</>;
}

const EstaSemanaDesk: React.FC<any> = ({ habitosActivos, registros, diasCongelados, hoy, navigateToTab }) => {
  const dates = getSemanaDates(hoy);
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const pastOrToday = dates.filter(d => d <= hoy);
  let Y = 0;
  let X = 0;

  for (const d of pastOrToday) {
    if (diasCongelados.includes(d)) {
      const scheduled = habitosActivos.filter((h: any) => isHabitScheduledForDate(h, d));
      Y += scheduled.length;
      X += scheduled.length;
    } else {
      const scheduled = habitosActivos.filter((h: any) => isHabitScheduledForDate(h, d));
      Y += scheduled.length;
      X += scheduled.filter((h: any) => isHabitCompletedOnDate(h.id, d, registros)).length;
    }
  }

  return (
    <section aria-labelledby="esta-semana-titulo" className="bg-surface border border-line rounded-[18px] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between min-h-[44px]">
        <h2 id="esta-semana-titulo" className="m-0 font-heading font-bold text-[22px]">Esta semana</h2>
        <button type="button" onClick={() => navigateToTab('calendario')} className="flex items-center justify-center min-h-[44px] font-semibold text-ambar-text hover:underline text-[14px]">Calendario</button>
      </div>
      <ol className="flex gap-1.5 m-0 p-0 list-none" aria-label="Días de esta semana">
        {dates.map((d, i) => {
          const scheduled = habitosActivos.filter((h: any) => isHabitScheduledForDate(h, d));
          const completed = scheduled.filter((h: any) => isHabitCompletedOnDate(h.id, d, registros)).length;
          const total = scheduled.length;

          let state = 'future';
          if (d <= hoy) {
            if (diasCongelados.includes(d)) state = 'frozen';
            else if (total > 0 && completed === total) state = 'all';
            else if (total > 0 && completed > 0) state = 'some';
            else if (d === hoy) state = 'today';
            else state = 'none';
          }

          const ESTADO: Record<string, string> = { all: 'todo cumplido', some: 'a medias', frozen: 'comodín', today: 'hoy', none: 'sin cumplir', future: 'todavía no llega' };
          let cls = `hoyd-dia ${state} flex-1 h-[52px] rounded-[10px] flex flex-col items-center justify-center relative overflow-hidden `;
          if (state === 'some') cls += "bg-surface-raised text-text";
          else if (state === 'frozen') cls += "bg-comodin-bg border-[1.5px] border-lila-text text-comodin-text";
          else if (state === 'today') cls += "border-[1.5px] border-text text-text bg-transparent";
          else if (state === 'none') cls += "bg-surface-raised text-text-muted";
          else if (state === 'future') cls += "border border-line-strong border-dashed text-text-muted bg-transparent";

          const dayNum = new Date(d + 'T12:00:00').getDate();

          return (
            <li key={d} className={cls} aria-label={`${nombreDia(d)}, ${ESTADO[state]}`}>
              <span className="text-[12px] font-semibold" aria-hidden="true">{weekDays[i]}</span>
              <span className="font-heading font-bold text-[17px] leading-tight mt-[-2px]" aria-hidden="true">{dayNum}</span>
              {state === 'some' && <i className="absolute left-[6px] right-[6px] bottom-[5px] h-[4px] rounded-[2px] bg-ambar-text" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="flex gap-3 text-[12px] text-text-muted items-center justify-center mt-1 font-semibold" aria-hidden="true">
        <span className="flex items-center gap-1.5"><span className="hoyd-ok w-[10px] h-[10px] rounded-[3px]" /> Todo cumplido</span>
        <span className="flex items-center gap-1.5"><span className="w-[10px] h-[10px] rounded-[3px] bg-surface-raised border-b-2 border-ambar-text" /> A medias</span>
        <span className="flex items-center gap-1.5"><span className="w-[10px] h-[10px] rounded-[3px] bg-comodin-bg border border-lila-text" /> Comodín</span>
      </div>

      <p className="m-0 text-[13px] text-text-muted mt-2 leading-relaxed">
        Cumpliste <b className="text-text">{X} de {Y}</b> veces lo que te tocaba. Un día a medias no borra los demás.
      </p>
    </section>
  );
}

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
      insignias,
    retoSemanal,
    setRetoSemanal,
    navigateToTab,
    puntosTotales,
    nivelActual,
    progresoNivel,
    etapaLlama,
    companera
  } = useHabitStore();

  const desk = useEsEscritorio();

  const [isRetoSheetOpen, setIsRetoSheetOpen] = useState(false);
  const [isCajaSheetOpen, setIsCajaSheetOpen] = useState(false);

  // Mock variable for cajas
  const cajasPorAbrir = 0;

  const hoy = getTodayString();
  const currentHour = new Date().getHours();

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
    if (desk) return; // Desktop is not collapsible
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

  const ptosMeta = progresoNivel.meta;
  const progresoNivelPercent = Math.min(100, Math.max(0, (progresoNivel.actual / ptosMeta) * 100));

  const companeraId = companera || `etapa_${etapaLlama}`;
  const lvlName = nombreLlama(companeraId);
  const companeraRealName = lvlName;

  const { nombre } = useTheme();
  const [horaSaludo, setHoraSaludo] = useState(() => new Date().getHours());
  React.useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') setHoraSaludo(new Date().getHours()); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
  const saludoBase = horaSaludo >= 5 && horaSaludo < 12 ? 'Buenos días' : horaSaludo >= 12 && horaSaludo < 19 ? 'Buenas tardes' : 'Buenas noches';
  const primerNombre = (nombre || '').trim().split(/\s+/)[0];
  const saludo = primerNombre ? `${saludoBase}, ${primerNombre}` : saludoBase;

  const ultimos7Dias = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subtractDays(hoy, i);
      const dateObj = new Date(d + 'T12:00:00');
      const labelStr = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(dateObj);
      const label = labelStr.charAt(0).toUpperCase() + labelStr.slice(1, 2);
      const dayNum = dateObj.getDate();

      const habitsScheduled = habitosActivos.filter(h => h.frecuencia !== 'semanal');
      const completedToday = habitsScheduled.filter(h => isHabitCompletedOnDate(h.id, d, registros)).length;
      const scheduledCount = habitsScheduled.length;

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

  const hayRegistrosCompletados = useMemo(() => registros.some(r => r.completado), [registros]);
  const [primerDiaVisto, setPrimerDiaVisto] = useState(() => {
    try { return localStorage.getItem('racha_primer_dia') === 'visto'; } catch { return false; }
  });
  useEffect(() => {
    if (hayRegistrosCompletados && !primerDiaVisto) {
      setPrimerDiaVisto(true);
      try { localStorage.setItem('racha_primer_dia', 'visto'); } catch {}
    }
  }, [hayRegistrosCompletados, primerDiaVisto]);

  // Rutinas fuera de Hoy por decisión del dueño (27 sep 2026): se rediseñan desde cero.
  // Las rutinas guardadas NO se borran; solo dejan de agrupar hábitos aquí.
  const rdh = useMemo<RutinaDeHoy[]>(() => [], []);
  const enRutina = useMemo(() => idsEnRutinasDeHoy(rdh), [rdh]);

  const habitosConMomentoEfectivo = useMemo(() => {
    return habitosDeHoy.map(h => {
      if (enRutina.has(h.id)) {
        const r = rdh.find(rut => rut.habitos.some(x => x.id === h.id));
        if (r) return { ...h, momentoEfectivo: r.momento } as Habito & { momentoEfectivo: string };
      }
      return { ...h, momentoEfectivo: h.momento || 'flexible' } as Habito & { momentoEfectivo: string };
    });
  }, [habitosDeHoy, enRutina, rdh]);

  const habitosPendientes = habitosConMomentoEfectivo.filter(h => !esHabitoCompletado(h.id));

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
      const pendingInMom = habitosPendientes.filter(h => h.momentoEfectivo === mom);
      if (pendingInMom.length > 0) {
        const rdhMom = rdh.filter(r => r.momento === mom);
        for (const r of rdhMom) {
          const pend = r.habitos.find(h => !esHabitoCompletado(h.id));
          if (pend) return pend;
        }
        const loose = pendingInMom.filter(h => !enRutina.has(h.id));
        if (loose.length > 0) {
          loose.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
          return loose[0];
        }
      }
    }
    return null;
  }, [habitosPendientes, ordenMomentos, currentMomento, rdh, enRutina, esHabitoCompletado]);

  const habitosOrdenados = useMemo(() => {
    const list: Habito[] = [];
    for (const mom of ordenMomentos) {
      const inMom = habitosConMomentoEfectivo.filter(h => h.momentoEfectivo === mom);
      const rdhMom = rdh.filter(r => r.momento === mom);
      for (const r of rdhMom) {
        list.push(...r.habitos);
      }
      const loose = inMom.filter(h => !enRutina.has(h.id));
      loose.sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0));
      list.push(...loose);
    }
    return list;
  }, [habitosConMomentoEfectivo, ordenMomentos, rdh, enRutina]);

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

  const th = tareasDeHoy(tareas, hoy);

  const fechasSemana = React.useMemo(() => getSemanaDates(hoy), [hoy]);

  const renderHabitoFunc = (habito: Habito, inRutina: boolean) => {
    const isHecho = esHabitoCompletado(habito.id);
    const isNext = siguienteFila?.id === habito.id;
    const minfo = getMomentoColorInfo((habito as any).momentoEfectivo);
    const progressReto = habito.reto ? contarProgresoReto(habito, registros) : 0;

    let anchorText = '';
    if (habito.anclaje) {
      anchorText = habito.tipo === 'negativo' ? `evitar · cuando ${habito.anclaje}` : `después de ${habito.anclaje}`;
    } else {
      if (habito.tipo === 'negativo') anchorText = 'evitar';
      else if (habito.frecuencia === 'semanal') anchorText = `${contarCompletadosSemana(habito.id, hoy, registros)} de ${habito.vecesPorSemana} esta semana`;
      else if (habito.metaDiaria) anchorText = `${valorDe(habito.id)} de ${habito.metaDiaria}`;
    }

    return renderFilaHabito({
      habito, isHecho, isNext, minfo, progressReto, anchorText, desk, inRutina,
      openHabitDetail, setValor, valorDe, hoy, toggleCompletado, openFocusMode,
      registros, diasCongelados, fechasSemana
    });
  };

  const desktopView = desk && (
    <div id="screen-today-desktop" className="hoyd pb-8 animate-fadeIn text-text font-body h-full flex flex-col">
      {/* Header Desktop */}
      <div className="flex justify-between items-start mb-6 mt-2">
        <div className="flex gap-4 items-center">
          <div className="shrink-0 flex items-center justify-center w-[56px] xl:w-[72px] h-[56px] xl:h-[72px]" aria-hidden="true">
            <LlamaDe id={companeraId} size={window.innerWidth >= 1280 ? 72 : 56} sola />
          </div>
          <div className="flex-1 min-w-0">
            <a className="lvlstrip max-w-[520px] !mt-0 mb-1.5" href="#" onClick={(e) => { e.preventDefault(); navigateToTab('perfil'); }} aria-label={`Nivel ${nivelActual}: ${progresoNivel.actual} de ${ptosMeta} puntos para el nivel ${nivelActual+1}. Ver tu llama`}>
              <span className="cond lvlname" style={{ fontSize: '17px' }}>Nivel {nivelActual}</span>
              <i className="lvltrack2" aria-hidden="true"><b style={{ width: `${progresoNivelPercent}%` }}></b></i>
              <span className="sub lvlnums">{progresoNivel.actual} / {ptosMeta}</span>
            </a>
            <p className="saludo text-[16px] font-semibold m-0">{saludo}</p>
            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="cond text-[40px] xl:text-[48px] leading-none m-0">{displayDate}</h1>
              <span className="font-heading font-bold text-[20px] text-ambar-text">+{completedCount * (esDiaRegreso ? 20 : 10)} pts hoy</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex gap-1 max-w-[520px] w-full" role="img" aria-label={`${completedCount} de ${totalToday} hábitos cumplidos hoy`}>
                {habitosOrdenados.map(h => (
                   <i key={h.id} className={`flex-1 h-2.5 rounded-[4px] ${esHabitoCompletado(h.id) ? 'fill-logro' : 'bg-track'}`}></i>
                ))}
              </div>
              <span className="text-[13px] font-medium text-text-muted whitespace-nowrap">{completedCount} de {totalToday} · te quedan {totalToday - completedCount}</span>
            </div>
            {esDiaRegreso && (
              <p className="bono mt-2 inline-flex">
                <ShieldCheck size={16} strokeWidth={2.2} />
                <span><b>Volviste.</b> Hoy cada hábito vale el doble: +20.</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-[40px] px-3.5 rounded-full bg-surface border border-line flex items-center gap-1.5 text-[14px] font-semibold">
            <ShieldCheck size={16} className="text-lila-text" /> {comodines === 1 ? '1 comodín' : `${comodines ?? 0} comodines`}
          </div>
          <button
            type="button"
            onClick={() => openFocusMode({ tipo: 'dia' })}
            className="h-[44px] px-4 rounded-[12px] bg-surface-raised border border-line-strong flex items-center gap-2 text-[14px] font-bold active:scale-95 transition-transform"
          >
            <Focus size={18} /> Modo Foco
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_340px] gap-[18px] xl:gap-[24px]">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {!hayRegistrosCompletados && !primerDiaVisto && (
            <div className="obtip" role="note">
              <Info size={18} strokeWidth={2.2} />
              <span><b>Tu primer día.</b> Si ya lo hiciste hoy, márcalo y suma tus primeros 10 puntos.</span>
            </div>
          )}
          <div className="flex justify-between items-baseline mb-1">
            <h2 className="m-0 font-heading font-bold text-[22px]">Misiones</h2>
            <span className="text-[14px] text-text-muted font-medium">
              +{habitosPendientes.length * 10} pts por ganar · <button onClick={openManageHabits} className="font-semibold text-ambar-text hover:underline min-h-[44px]">Gestionar</button>
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {ordenMomentos.map(mom => {
              const inMom = habitosConMomentoEfectivo.filter(h => h.momentoEfectivo === mom);
              if (inMom.length === 0) return null;

              const hechos = inMom.filter(h => esHabitoCompletado(h.id)).length;
              const total = inMom.length;
              const minfo = getMomentoColorInfo(mom);

              return (
                <section key={mom} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 px-0.5">
                    <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center shrink-0 ${minfo.iconBg} ${minfo.iconColor}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {getMomentoIcon(mom)}
                      </svg>
                    </div>
                    <div className="flex-1 flex items-center">
                      <h3 className="m-0 font-heading font-bold text-[17px]">{getMomentoTitle(mom)}</h3>
                      {currentMomento === mom && (
                        <><span className="sr-only">, </span><span className="font-body font-bold text-[12px] bg-surface-raised text-text px-[7px] rounded-[6px] ml-2">ahora</span></>
                      )}
                    </div>
                    <span className="text-[13px] text-text-muted font-number">{hechos}/{total}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {rdh.filter(r => r.momento === mom).map(r => {
                      const isNextInside = siguienteFila && r.habitos.some(h => h.id === siguienteFila.id);
                      return renderRutina({
                        r, mom, minfo, desk, isNextInside, openRutinaEditor, openFocusMode, currentMomento, esHabitoCompletado, renderHabitoFunc
                      });
                    })}
                    {inMom.filter(h => !enRutina.has(h.id)).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map(habito => {
                      return renderHabitoFunc(habito, false);
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {renderTareasBox({ th, toggleSubtarea, desk, openTareaEditor, navigateToTab })}

          <EstaSemanaDesk
            habitosActivos={habitosActivos}
            registros={registros}
            diasCongelados={diasCongelados}
            hoy={hoy}
            navigateToTab={navigateToTab}
          />

          {renderRetoSemanalRow({ retoSemanal, desk, setIsRetoSheetOpen, hoy })}

          {/* Lo proximo */}
          <div className="bg-surface border border-line rounded-[18px] p-[6px] px-[14px]">
            {proximaInsignia && (
              <div className="flex items-center gap-3 min-h-[56px] border-b border-line">
                <BadgeIcon iconName={proximaInsignia.icono} size={22} className="text-ambar-text" strokeWidth={2} />
                <div className="flex-1 flex flex-col justify-center gap-1.5">
                  <p className="m-0 text-[13px] font-semibold text-text truncate">
                    {proximaInsignia.nombre} <span className="text-text-muted ml-1 font-normal">· {proximaInsignia.progresoActual} de {proximaInsignia.meta}</span>
                  </p>
                  <div className="h-[5px] rounded-full bg-track overflow-hidden">
                     <div className="h-full rounded-full fill-logro" style={{ width: `${(proximaInsignia.progresoActual / proximaInsignia.meta) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {cajasPorAbrir > 0 && (
              <button onClick={() => navigateToTab('perfil')} className="flex w-full items-center justify-between min-h-[56px] text-[15px] font-semibold text-text hover:bg-surface-raised transition-colors -mx-[14px] px-[14px] rounded-[12px] border-none bg-transparent cursor-pointer">
                <div className="flex items-center gap-2">
                   <div className="w-[30px] h-[30px] rounded-[9px] bg-surface-raised text-text flex items-center justify-center" aria-hidden="true"><Gift size={16} /></div>
                   {cajasPorAbrir} cajas sorpresa por abrir
                </div>
                <ChevronRight size={18} className="text-text-muted" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const mobileView = !desk && (
    <div id="screen-today" className="pb-28 animate-fadeIn text-text font-body pt-2">
      <a className="lvlstrip" href="#" onClick={(e) => { e.preventDefault(); navigateToTab('perfil'); }} aria-label={`Nivel ${nivelActual}: ${progresoNivel.actual} de ${ptosMeta} puntos para el nivel ${nivelActual+1}. Ver tu llama`}>
        <span className="cond lvlname" style={{ fontSize: '17px' }}>Nivel {nivelActual}</span>
        <i className="lvltrack2" aria-hidden="true"><b style={{ width: `${progresoNivelPercent}%` }}></b></i>
        <span className="sub lvlnums">{progresoNivel.actual} / {ptosMeta}</span>
      </a>

      <div className="cabtop">
        <p className="saludo">{saludo}</p>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line text-text text-[13px] font-semibold shrink-0 whitespace-nowrap"><ShieldCheck size={14} className="text-[var(--lila)]" />{comodines === 1 ? '1 comodín' : `${comodines ?? 0} comodines`}</span>
      </div>

      <div className="cabcomp">
        <a className="cabart" href="#" aria-label={`Tu llama: ${companeraRealName}. Ver tu llama`} onClick={(e) => { e.preventDefault(); navigateToTab('perfil'); }}>
          <LlamaDe id={companeraId} size={64} sola />
        </a>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="cond" style={{ margin: 0, fontSize: '44px', lineHeight: 1 }}>{displayDate}</h1>
          <p className="sub text-text-muted" style={{ marginTop: '6px', fontSize: '15px' }}>Misiones de hoy: {completedCount} de {totalToday}</p>
        </div>
      </div>

      <section aria-label="Últimos 7 días" className="mt-3.5 flex flex-col gap-2">
        <div className="flex gap-1.5">
          {ultimos7Dias.map((d, i) => {
            let cls = "";
            if (d.isHoy) cls = "bg-transparent border-[1.5px] border-dashed border-text text-text";
            else if (d.estado === 2) cls = "bg-comodin-bg border-[1.5px] border-lila text-comodin-text";
            else if (d.estado === 1) cls = "fill-logro";
            else cls = "bg-surface border border-line text-text-muted";
            return (
              <div key={i} className={`flex-1 h-[52px] rounded-[12px] flex flex-col items-center justify-center box-border ${cls}`}>
                {d.estado === 2 ? <ShieldCheck size={20} strokeWidth={2.5} className="text-lila" /> : (
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
               <i key={h.id} className={`flex-1 h-3 rounded-[4px] ${esHabitoCompletado(h.id) ? 'fill-logro' : 'bg-track'}`}></i>
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

      {renderRetoSemanalRow({ retoSemanal, desk, setIsRetoSheetOpen, hoy })}

      {!hayRegistrosCompletados && !primerDiaVisto && (
        <div className="obtip" role="note">
          <Info size={18} strokeWidth={2.2} />
          <span><b>Tu primer día.</b> Si ya lo hiciste hoy, márcalo y suma tus primeros 10 puntos.</span>
        </div>
      )}
      <div className="mt-4.5 flex justify-between items-baseline mb-3">
        <h2 className="m-0 font-heading font-bold text-[22px]">Misiones</h2>
        <span className="text-[13px] text-text-muted">
          +{habitosPendientes.length * 10} pts por ganar · <button onClick={openManageHabits} className="inline-flex min-h-[44px] items-center font-semibold text-ambar-text hover:underline">Gestionar</button>
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {ordenMomentos.map(mom => {
          const inMom = habitosConMomentoEfectivo.filter(h => h.momentoEfectivo === mom);
          if (inMom.length === 0) return null;

          const hechos = inMom.filter(h => esHabitoCompletado(h.id)).length;
          const total = inMom.length;
          const isPlegado = plegados[mom];
          const minfo = getMomentoColorInfo(mom);

          return (
            <section key={mom} className="flex flex-col gap-2">
              <h3 className="m-0">
                <button
                  className="w-full flex items-center gap-2.5 px-0.5 cursor-pointer select-none"
                  onClick={() => togglePlegado(mom)}
                  aria-expanded={!isPlegado}
                >
                  <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center shrink-0 ${minfo.iconBg} ${minfo.iconColor}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {getMomentoIcon(mom)}
                    </svg>
                  </div>
                  <div className="flex-1 flex items-center">
                    <span className="font-heading font-bold text-[17px]">{getMomentoTitle(mom)}</span>
                    {currentMomento === mom && (
                      <><span className="sr-only">, </span><span className="font-body font-bold text-[12px] bg-surface-raised text-text px-[7px] rounded-[6px] ml-2">ahora</span></>
                    )}
                  </div>
                  <span className="text-[13px] text-text-muted font-number">{hechos}/{total}</span>
                  <div className="w-[44px] h-[5px] rounded-[9px] bg-track overflow-hidden shrink-0">
                    <div className={`h-full rounded-[9px] ${minfo.bg}`} style={{ width: `${(hechos/total)*100}%` }}></div>
                  </div>
                  <ChevronDown size={16} className={`text-text-muted transition-transform ${isPlegado ? 'rotate-180' : ''}`} />
                </button>
              </h3>

              {!isPlegado && (
                <div className="flex flex-col gap-2">
                  {rdh.filter(r => r.momento === mom).map(r => {
                    const isNextInside = siguienteFila && r.habitos.some(h => h.id === siguienteFila.id);
                    return renderRutina({
                      r, mom, minfo, desk, isNextInside, openRutinaEditor, openFocusMode, currentMomento, esHabitoCompletado, renderHabitoFunc
                    });
                  })}
                  {inMom.filter(h => !enRutina.has(h.id)).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map(habito => {
                    return renderHabitoFunc(habito, false);
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {renderTareasBox({ th, toggleSubtarea, desk, openTareaEditor, navigateToTab })}

      {proximaInsignia && (
        <div className="mt-4 flex items-center gap-3">
          <BadgeIcon iconName={proximaInsignia.icono} size={22} className="text-ambar-text" strokeWidth={2} />
          <div className="flex-1">
            <p className="m-0 flex justify-between text-[13px]"><span className="font-semibold text-text">Insignia {proximaInsignia.nombre}</span><span className="text-text-muted">faltan {proximaInsignia.meta - proximaInsignia.progresoActual}</span></p>
            <div className="mt-1.5 h-1.5 rounded-full bg-track overflow-hidden">
               <div className="h-full rounded-full fill-logro" style={{ width: `${(proximaInsignia.progresoActual / proximaInsignia.meta) * 100}%` }}></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <>
      {desk ? desktopView : mobileView}
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
    </>
  );
};
