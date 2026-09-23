import React, { useState, useEffect, useMemo } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { X, ChevronRight, Layers, GripVertical, Archive, Trash2, Check } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { MOMENTOS, MomentoDia, Habito } from '../../types';
import { calcularConstanciaHabito, contarCompletadosSemana, getTodayString, getFrecuenciaLegible } from '../../utils/habitUtils';

const getMomentoColorInfo = (momento?: string) => {
  switch (momento) {
    case 'manana': return { bg: 'bg-manana-tint', icon: 'text-manana-text' };
    case 'tarde': return { bg: 'bg-coral-tint', icon: 'text-coral-text' };
    case 'noche': return { bg: 'bg-lila-tint', icon: 'text-lila-text' };
    default: return { bg: 'bg-surface-raised', icon: 'text-text' };
  }
};

const HabitoRow: React.FC<{ 
  habito: Habito; 
  onOpen: () => void;
  isLast: boolean;
}> = ({ habito, onOpen, isLast }) => {
  const controls = useDragControls();
  const { registros, diasCongelados } = useHabitStore();
  const hoy = getTodayString();
  const colorInfo = getMomentoColorInfo(habito.momento);
  const constancia = calcularConstanciaHabito(habito, registros, diasCongelados, hoy);
  const frecuenciaLegible = getFrecuenciaLegible(habito);

  return (
    <Reorder.Item
      value={habito.id}
      dragListener={false}
      dragControls={controls}
      as="article"
      whileDrag={{ backgroundColor: 'var(--surface-raised)', borderRadius: 0, boxShadow: 'none', zIndex: 10 }}
      className={`flex items-center gap-2 py-[10px] px-5 ${!isLast ? 'border-b border-line' : ''} bg-bg`}
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Arrastrar para reordenar"
        className="shrink-0 w-[22px] h-[32px] flex items-center justify-center text-text-muted hover:text-text cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <GripVertical size={18} />
      </button>

      <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onOpen}>
        <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 ${colorInfo.bg} ${colorInfo.icon}`}>
          <HabitIcon name={habito.icono} size={20} strokeWidth={2} />
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-text truncate leading-[1.35]">{habito.nombre}</p>
          <div className="flex items-center gap-1.5 text-[13px] text-text-muted leading-[1.3] truncate mt-[2px] font-medium">
            {habito.tipo === 'negativo' && (
              <span className="text-[11px] font-bold px-[6px] py-[1px] rounded-[6px] bg-surface-raised text-text-muted shrink-0">Evitar</span>
            )}
            <span className="truncate">{frecuenciaLegible}</span>
            {habito.metaDiaria ? <><span className="opacity-50">·</span><span>Meta: {habito.metaDiaria}</span></> : null}
            <span className="opacity-50">·</span>
            <span className="text-ambar-text font-semibold">
              {habito.frecuencia === 'semanal' 
                ? `${contarCompletadosSemana(habito.id, hoy, registros)} de ${habito.vecesPorSemana} esta semana`
                : `${constancia.cumplidos}/${constancia.programados} días`}
            </span>
          </div>
        </div>
        <ChevronRight size={18} className="text-text-muted shrink-0" />
      </div>
    </Reorder.Item>
  );
};

const SeccionRow: React.FC<{
  momento: typeof MOMENTOS[number];
  habits: Habito[];
  onOpenHabit: (id: string) => void;
  onReorderHabits: (ids: string[]) => void;
}> = ({ momento, habits, onOpenHabit, onReorderHabits }) => {
  const controls = useDragControls();
  const ids = habits.map((h) => h.id);
  const colorInfo = getMomentoColorInfo(momento.id);

  return (
    <Reorder.Item
      value={momento.id}
      dragListener={false}
      dragControls={controls}
      as="div"
      whileDrag={{ backgroundColor: 'var(--surface)', borderRadius: 0, boxShadow: 'none', zIndex: 5 }}
      className="bg-bg"
    >
      <div className="flex items-center gap-2 py-2 px-5">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Arrastrar sección"
          className="shrink-0 w-[22px] h-[32px] flex items-center justify-center text-text-muted hover:text-text cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={18} />
        </button>
        <div className={`w-[26px] h-[26px] rounded-[10px] flex items-center justify-center ${colorInfo.bg} ${colorInfo.icon}`}>
          <HabitIcon name={momento.icono} size={14} strokeWidth={2} />
        </div>
        <span className="text-[17px] font-bold font-heading text-text flex-1">{momento.label}</span>
        <span className="text-[13px] font-medium text-text-muted">{habits.length} {habits.length === 1 ? 'hábito' : 'hábitos'}</span>
      </div>

      <Reorder.Group as="div" axis="y" values={ids} onReorder={onReorderHabits}>
        {habits.map((h, index) => (
          <HabitoRow 
            key={h.id} 
            habito={h} 
            onOpen={() => onOpenHabit(h.id)} 
            isLast={index === habits.length - 1}
          />
        ))}
      </Reorder.Group>
    </Reorder.Item>
  );
};

const ConfirmDiscardModal: React.FC<{
  onContinue: () => void;
  onDiscard: () => void;
}> = ({ onContinue, onDiscard }) => (
  <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fadeIn p-0 sm:p-4">
    <div role="alertdialog" aria-label="Descartar cambios" className="w-full max-w-[430px] bg-bg border-t sm:border border-line rounded-t-[22px] sm:rounded-[22px] flex flex-col shadow-[0_-8px_24px_rgba(0,0,0,0.35)] animate-slideUp px-5 pt-3 pb-6">
      <div className="w-10 h-[5px] rounded-full bg-line-strong mx-auto mb-4"></div>
      <h3 className="text-[22px] font-bold font-heading text-text leading-none mb-2">¿Descartar los cambios?</h3>
      <p className="text-[15px] font-medium text-text-muted mb-5">El orden de tus hábitos volverá a como estaba.</p>
      <div className="flex gap-[10px]">
        <button type="button" onClick={onContinue} className="flex-1 h-[48px] rounded-[12px] bg-surface-raised border border-line text-text text-[15px] font-bold flex items-center justify-center transition-colors active:scale-[0.98]">
          Seguir editando
        </button>
        <button type="button" onClick={onDiscard} className="flex-1 h-[48px] rounded-[12px] bg-transparent border border-danger text-danger text-[15px] font-bold flex items-center justify-center transition-colors active:scale-[0.98]">
          Descartar
        </button>
      </div>
    </div>
  </div>
);

export const ManageHabitsModal: React.FC = () => {
  const {
    habitos, habitosActivos, restaurarHabito, eliminarHabito, isManageHabitsOpen, closeManageHabits, openHabitDetail, openCreateModal,
    ordenMomentos, reordenarSecciones, reordenarHabitosEnMomento,
  } = useHabitStore();

  const [localOrdenMomentos, setLocalOrdenMomentos] = useState<MomentoDia[]>([]);
  const [localHabitosPorMomento, setLocalHabitosPorMomento] = useState<Record<string, string[]>>({});
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  const idsGlobalesDe = (mom: string) => habitosActivos
    .filter(h => (h.momento || 'flexible') === mom)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(h => h.id);

  // Copia local solo al abrir: los cambios de orden no se aplican hasta Guardar.
  useEffect(() => {
    if (isManageHabitsOpen) {
      setLocalOrdenMomentos([...ordenMomentos]);
      const newHabitos: Record<string, string[]> = {};
      ordenMomentos.forEach(mom => { newHabitos[mom] = idsGlobalesDe(mom); });
      setLocalHabitosPorMomento(newHabitos);
      setDiscardAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManageHabitsOpen]);

  // Restaurar o eliminar (inmediatos) no deben borrar el orden sin guardar:
  // se conserva el orden local y los hábitos nuevos entran en su posición real.
  useEffect(() => {
    if (!isManageHabitsOpen) return;
    setLocalHabitosPorMomento(prev => {
      const next: Record<string, string[]> = {};
      ordenMomentos.forEach(mom => {
        const globales = idsGlobalesDe(mom);
        const conservados = (prev[mom] || []).filter(id => globales.includes(id));
        globales.forEach((id, i) => {
          if (!conservados.includes(id)) conservados.splice(Math.min(i, conservados.length), 0, id);
        });
        next[mom] = conservados;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitosActivos]);

  const hasChanges = useMemo(() => {
    if (localOrdenMomentos.length === 0) return false; // aún no se copió el orden al abrir
    if (JSON.stringify(localOrdenMomentos) !== JSON.stringify(ordenMomentos)) return true;
    for (const mom of ordenMomentos) {
      const localIds = localHabitosPorMomento[mom] || [];
      const globalIds = habitosActivos
        .filter(h => (h.momento || 'flexible') === mom)
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .map(h => h.id);
      if (JSON.stringify(localIds) !== JSON.stringify(globalIds)) return true;
    }
    return false;
  }, [localOrdenMomentos, localHabitosPorMomento, ordenMomentos, habitosActivos]);

  const habitosArchivados = habitos.filter((h) => h.archivado);

  const grupos = useMemo(() => {
    return localOrdenMomentos
      .map((id) => MOMENTOS.find((m) => m.id === id))
      .filter((m): m is typeof MOMENTOS[number] => Boolean(m))
      .map((momento) => {
        const ids = localHabitosPorMomento[momento.id] || [];
        const habitsList = ids
          .map(id => habitosActivos.find(h => h.id === id))
          .filter((h): h is Habito => Boolean(h));
        return { momento, habits: habitsList };
      })
      .filter((g) => g.habits.length > 0);
  }, [localOrdenMomentos, localHabitosPorMomento, habitosActivos]);

  const idsVisibles = grupos.map((g) => g.momento.id);

  const attemptAction = (action: () => void) => {
    if (hasChanges) {
      setDiscardAction(() => action);
    } else {
      action();
    }
  };

  const handleSave = () => {
    reordenarSecciones(localOrdenMomentos);
    for (const mom of localOrdenMomentos) {
      if (localHabitosPorMomento[mom]) {
        reordenarHabitosEnMomento(mom, localHabitosPorMomento[mom]);
      }
    }
    closeManageHabits();
  };

  const handleReorderSecciones = (nuevoVisible: string[]) => {
    const restantes = localOrdenMomentos.filter((m) => !nuevoVisible.includes(m as MomentoDia));
    setLocalOrdenMomentos([...(nuevoVisible as MomentoDia[]), ...restantes]);
  };
  
  const handleReorderHabitos = (momentoId: string, ids: string[]) => {
    setLocalHabitosPorMomento(prev => ({ ...prev, [momentoId]: ids }));
  };

  const handleRestaurar = (id: string) => restaurarHabito(id);

  const handleEliminar = (id: string, nombre: string) => {
    if (window.confirm(`¿Eliminar "${nombre}" permanentemente? Se borrará su historial.`)) {
      eliminarHabito(id);
    }
  };

  if (!isManageHabitsOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-[2px] animate-fadeIn p-0 sm:p-4" onClick={() => attemptAction(closeManageHabits)}>
        <div className="w-full max-w-[430px] max-h-[85vh] bg-bg border-t sm:border border-line rounded-t-[22px] sm:rounded-[22px] flex flex-col shadow-[0_-8px_24px_rgba(0,0,0,0.35)] animate-slideUp overflow-hidden" onClick={(e) => e.stopPropagation()}>
          
          <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-[5px] rounded-full bg-line-strong"></div>
          </div>

          <header className="px-5 pb-4 border-b border-line flex items-start justify-between shrink-0">
            <div>
              <h2 className="text-[24px] font-bold font-heading text-text leading-none mt-1">Gestionar hábitos</h2>
              <p className="text-[13px] text-text-muted mt-1.5 leading-[1.3] font-medium pr-2">Arrastra desde ⋮⋮ para cambiar el orden y toca Guardar cambios. Es el mismo orden que ves en Hoy.</p>
            </div>
            <button type="button" onClick={() => attemptAction(closeManageHabits)} aria-label="Cerrar" className="w-[36px] h-[36px] shrink-0 rounded-full bg-surface-raised hover:bg-surface text-text-muted hover:text-text flex items-center justify-center transition-colors"><X size={18} strokeWidth={2.5} /></button>
          </header>

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            {habitosActivos.length === 0 && habitosArchivados.length === 0 ? (
              <div className="py-12 px-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-[12px] bg-surface-raised text-text-muted flex items-center justify-center mx-auto"><Layers size={24} /></div>
                <p className="text-[15px] font-medium text-text-muted">No tienes hábitos creados aún.</p>
                <button type="button" onClick={() => attemptAction(() => { closeManageHabits(); openCreateModal(); })} className="mt-4 px-5 h-[48px] rounded-[12px] bg-surface-raised text-text text-[15px] font-bold font-heading inline-flex items-center justify-center transition-colors">
                  Crear mi primer hábito
                </button>
              </div>
            ) : (
              <>
                {grupos.length > 0 && (
                  <Reorder.Group as="div" axis="y" values={idsVisibles} onReorder={handleReorderSecciones} className="space-y-4">
                    {grupos.map(({ momento, habits }) => (
                      <SeccionRow
                        key={momento.id}
                        momento={momento}
                        habits={habits}
                        onOpenHabit={(id) => attemptAction(() => { closeManageHabits(); openHabitDetail(id); })}
                        onReorderHabits={(ids) => handleReorderHabitos(momento.id, ids)}
                      />
                    ))}
                  </Reorder.Group>
                )}

                {habitosArchivados.length > 0 && (
                  <div className="mt-8 border-t border-line pt-4">
                    <button 
                      onClick={() => setIsArchivedOpen(!isArchivedOpen)}
                      className="flex items-center justify-between w-full py-2 px-5 group"
                    >
                      <div className="flex items-center gap-2">
                        <Archive size={16} className="text-text-muted" strokeWidth={2} />
                        <span className="text-[15px] font-semibold text-text-muted group-hover:text-text transition-colors">Archivados</span>
                        <span className="text-[13px] font-medium text-text-muted ml-1">({habitosArchivados.length})</span>
                      </div>
                      <ChevronRight size={18} className={`text-text-muted transition-transform ${isArchivedOpen ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {isArchivedOpen && (
                      <div className="mt-2">
                        {habitosArchivados.map((habito, index) => (
                          <article key={habito.id} className={`py-[10px] px-5 flex items-center justify-between ${index !== habitosArchivados.length - 1 ? 'border-b border-line' : ''}`}>
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                              <Archive size={16} className="text-text-muted shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[15px] font-semibold text-text-muted truncate leading-[1.35]">{habito.nombre}</p>
                                <p className="text-[13px] font-medium text-text-muted opacity-70 leading-[1.3]">Guarda su historial</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button type="button" onClick={() => handleRestaurar(habito.id)}
                                className="px-[12px] h-[32px] rounded-[10px] text-[14px] font-bold bg-surface-raised text-text border border-line hover:bg-surface transition-colors flex items-center justify-center">
                                Restaurar
                              </button>
                              <button type="button"
                                onClick={() => handleEliminar(habito.id, habito.nombre)}
                                aria-label={`Eliminar ${habito.nombre}`}
                                className="w-[32px] h-[32px] rounded-[10px] bg-surface text-danger hover:bg-surface-raised flex items-center justify-center transition-colors">
                                <Trash2 size={16} strokeWidth={2} />
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!(habitosActivos.length === 0 && habitosArchivados.length === 0) && (
            <footer className="p-4 border-t border-line bg-bg shrink-0 flex flex-col">
              {hasChanges && (
                <p className="text-[13px] text-text-muted font-medium text-center mb-3">
                  Cambiaste el orden. Se aplicará al guardar.
                </p>
              )}
              <button 
                type="button" 
                onClick={hasChanges ? handleSave : undefined}
                disabled={!hasChanges}
                className={`w-full h-[48px] rounded-[12px] text-[15px] font-bold font-heading flex items-center justify-center transition-all active:scale-[0.98] ${
                  hasChanges 
                    ? 'bg-ambar hover:bg-ambar/90 text-ink' 
                    : 'bg-surface-raised text-text-muted cursor-not-allowed'
                }`}
              >
                {hasChanges && <Check size={18} strokeWidth={3} className="mr-2" />}
                <span>Guardar cambios</span>
              </button>
            </footer>
          )}
        </div>
      </div>
      
      {discardAction && (
        <ConfirmDiscardModal 
          onContinue={() => setDiscardAction(null)}
          onDiscard={() => {
            setDiscardAction(null);
            discardAction();
          }}
        />
      )}
    </>
  );
};
