import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Zap, Trophy, Flame, Link2, ListChecks } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { getTodayString, aplanarArbolSubtareas } from '../../utils/habitUtils';
import { Habito } from '../../types';

export const FocusModeScreen: React.FC = () => {
  const {
    isFocusModeOpen, closeFocusMode, focusTarget,
    habitos, habitosDeHoy, habitosActivos, tareas,
    esHabitoCompletado, toggleCompletado, setValor, rachaActual, toggleSubtarea,
  } = useHabitStore();

  const hoy = getTodayString();
  const [index, setIndex] = useState(0);
  useEffect(() => { if (isFocusModeOpen) setIndex(0); }, [isFocusModeOpen]);

  if (!isFocusModeOpen) return null;

  const tareaActual = focusTarget && focusTarget.tipo === 'tarea' ? tareas.find((t) => t.id === focusTarget.tareaId) : null;

  type Paso =
    | { kind: 'habito'; key: string; habito: Habito }
    | { kind: 'sub'; key: string; texto: string; hecha: boolean; tareaId: string; depth: number };

  let pasos: Paso[];
  if (focusTarget && focusTarget.tipo === 'tarea') {
    const planos = aplanarArbolSubtareas(tareaActual?.subtareas || []);
    pasos = planos.map(({ sub, depth }) => ({
      kind: 'sub',
      key: sub.id,
      texto: sub.texto,
      hecha: sub.hecha,
      tareaId: tareaActual!.id,
      depth,
    }));
  } else if (focusTarget && focusTarget.tipo === 'rutina') {
    pasos = focusTarget.habitoIds
      .map((id) => habitos.find((h) => h.id === id))
      .filter((h): h is Habito => Boolean(h) && !h!.archivado)
      .map((h) => ({ kind: 'habito', key: h.id, habito: h }));
  } else {
    pasos = [...habitosDeHoy, ...habitosActivos.filter((h) => h.frecuencia === 'semanal')].map((h) => ({ kind: 'habito', key: h.id, habito: h }));
  }

  const total = pasos.length;
  const terminado = index >= total;
  const paso = terminado ? null : pasos[index];

  const pasoHecho = (p: Paso) => (p.kind === 'sub' ? p.hecha : esHabitoCompletado(p.habito.id));
  const completadosCount = pasos.filter(pasoHecho).length;
  const hecho = paso ? pasoHecho(paso) : false;

  const tituloBarra =
    focusTarget && focusTarget.tipo === 'rutina' ? focusTarget.nombre
    : focusTarget && focusTarget.tipo === 'tarea' ? (tareaActual?.nombre || 'Tarea')
    : 'Modo enfoque';

  const marcarHecho = () => {
    if (!paso) return;
    if (paso.kind === 'sub') {
      if (!paso.hecha) toggleSubtarea(paso.tareaId, paso.key);
    } else if (!esHabitoCompletado(paso.habito.id)) {
      if (paso.habito.metaDiaria) setValor(paso.habito.id, hoy, paso.habito.metaDiaria);
      else toggleCompletado(paso.habito.id);
    }
    setIndex((i) => i + 1);
  };
  const saltar = () => setIndex((i) => i + 1);

  return (
    <div className="fixed inset-0 z-[60] bg-[#08080C] flex flex-col animate-fadeIn">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--accent)] min-w-0">
          <Zap size={18} className="shrink-0" />
          <span className="text-sm font-bold font-heading truncate">{tituloBarra}</span>
        </div>
        <button onClick={closeFocusMode} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-[#14161D] border border-[#1E2029] text-[#9498A8] hover:text-white flex items-center justify-center shrink-0"><X size={18} /></button>
      </div>

      {total > 0 && (
        <div className="px-5">
          <div className="flex items-center justify-between text-[11px] text-[#6B6F7B] mb-1.5">
            <span>{terminado ? total : index + 1} de {total}</span>
            <span>{completadosCount} completados</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#1A1C24] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${((terminado ? total : index) / total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {total === 0 ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[var(--accent-10)] text-[var(--accent)] flex items-center justify-center mx-auto"><Zap size={30} /></div>
            <p className="text-sm text-[#9498A8]">Nada que enfocar aquí.</p>
            <button onClick={closeFocusMode} className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold">Volver</button>
          </div>
        ) : terminado ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#34D399]/15 text-[#34D399] border-2 border-[#34D399]/40 flex items-center justify-center mx-auto"><Trophy size={40} /></div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-heading text-[#F4F4F6]">¡Sesión completada!</h2>
              <p className="text-sm text-[#9498A8]">Completaste {completadosCount} de {total}.</p>
            </div>
            <button onClick={closeFocusMode} className="px-6 py-3 rounded-[14px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold font-heading shadow-lg shadow-[var(--accent-30)] transition-all active:scale-95">Terminar</button>
          </div>
        ) : paso ? (
          <div className="w-full max-w-[340px] space-y-6 animate-fadeIn" key={paso.key}>
            {paso.kind === 'habito' ? (
              <>
                <div className="w-24 h-24 rounded-[28px] flex items-center justify-center mx-auto shadow-xl"
                  style={{ backgroundColor: `${paso.habito.color}20`, color: paso.habito.color, border: `2px solid ${paso.habito.color}50`, boxShadow: `0 0 40px -8px ${paso.habito.color}50` }}>
                  <HabitIcon name={paso.habito.icono} size={44} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-heading text-[#F4F4F6] leading-tight">{paso.habito.nombre}</h2>
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-[#F59E0B] font-medium"><Flame size={14} className="fill-[#F59E0B]" />{rachaActual(paso.habito.id)} días</span>
                    {paso.habito.metaDiaria && <span className="text-[#6B6F7B]">Meta: {paso.habito.metaDiaria}</span>}
                  </div>
                  {paso.habito.anclaje && (
                    <p className="text-xs text-[#6B6F7B] flex items-center justify-center gap-1"><Link2 size={12} className="text-[var(--accent)]" /> Después de {paso.habito.anclaje}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-[28px] flex items-center justify-center mx-auto shadow-xl bg-[var(--accent-15)] text-[var(--accent)] border-2 border-[var(--accent-30)]">
                  <ListChecks size={44} />
                </div>
                <div className="space-y-2">
                  {tareaActual && (
                    <div className="flex items-center justify-center gap-2 text-[11px] font-semibold tracking-wide text-[var(--accent)]">
                      <span className="uppercase">{tareaActual.nombre}</span>
                      {paso.depth > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#1A1C24] text-[#9498A8] text-[10px] font-mono">
                          Nivel {paso.depth + 1}
                        </span>
                      )}
                    </div>
                  )}
                  <h2 className="text-xl font-bold font-heading text-[#F4F4F6] leading-snug">{paso.texto}</h2>
                </div>
              </>
            )}

            {hecho ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-[#34D399] text-sm font-semibold"><Check size={18} strokeWidth={3} /> {paso.kind === 'sub' ? 'Hecha' : 'Ya completado'}</div>
                <button onClick={saltar} className="w-full py-3.5 rounded-[16px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold font-heading transition-all active:scale-[0.98]">Siguiente</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button onClick={marcarHecho}
                  className="w-full py-4 rounded-[16px] text-white text-sm font-bold font-heading shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={paso.kind === 'habito' ? { backgroundColor: paso.habito.color, boxShadow: `0 8px 24px -6px ${paso.habito.color}70` } : { backgroundColor: 'var(--accent)' }}>
                  <Check size={20} strokeWidth={3} /> Hecho
                </button>
                <button onClick={saltar} className="w-full py-3 rounded-[16px] bg-[#14161D] border border-[#1E2029] text-[#9498A8] hover:text-[#F4F4F6] text-sm font-semibold font-heading flex items-center justify-center gap-2 transition-all">
                  Saltar <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
