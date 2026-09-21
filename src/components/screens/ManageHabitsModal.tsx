import React, { useMemo } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { X, Plus, Flame, ChevronRight, Layers, GripVertical, Settings, Archive, Trash2 } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { MOMENTOS, MomentoDia, Habito } from '../../types';

// Fila de hábito arrastrable (solo se arrastra desde el asa)
const HabitoRow: React.FC<{ habito: Habito; racha: number; onOpen: () => void }> = ({ habito, racha, onOpen }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={habito.id}
      dragListener={false}
      dragControls={controls}
      as="article"
      whileDrag={{ scale: 1.03, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.7)' }}
      className="rounded-[16px] bg-[#0C0D12] border border-[#1E2029] p-3 flex items-center gap-2 shadow-md"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Arrastrar para reordenar"
        className="shrink-0 w-8 h-10 flex items-center justify-center text-[#5C6070] hover:text-[#9498A8] cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <GripVertical size={18} />
      </button>

      <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onOpen}>
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${habito.color}20`, color: habito.color, border: `1px solid ${habito.color}40` }}
        >
          <HabitIcon name={habito.icono} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold font-heading text-[#F4F4F6] truncate">{habito.nombre}</h4>
            {habito.tipo === 'negativo' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#5C6070]/20 text-[#9498A8] border border-[#5C6070]/30 font-medium shrink-0">Evitar</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
            <span className="flex items-center gap-1 text-[#F59E0B] font-medium font-heading">
              <Flame size={12} className="fill-[#F59E0B]" />{racha}d
            </span>
            <span className="text-[#3E4250]">•</span>
            <span className="text-[#5C6070] capitalize">{habito.frecuencia === 'entreSemana' ? 'L-V' : habito.frecuencia}</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-[#5C6070] shrink-0" />
      </div>
    </Reorder.Item>
  );
};

// Sección arrastrable con su lista interna de hábitos
const SeccionRow: React.FC<{
  momento: typeof MOMENTOS[number];
  habits: Habito[];
  racha: (id: string) => number;
  onOpenHabit: (id: string) => void;
  onReorderHabits: (ids: string[]) => void;
}> = ({ momento, habits, racha, onOpenHabit, onReorderHabits }) => {
  const controls = useDragControls();
  const ids = habits.map((h) => h.id);
  return (
    <Reorder.Item
      value={momento.id}
      dragListener={false}
      dragControls={controls}
      as="div"
      whileDrag={{ scale: 1.01 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Arrastrar sección"
          className="shrink-0 w-7 h-7 flex items-center justify-center text-[#5C6070] hover:text-[#9498A8] cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={16} />
        </button>
        <div className="p-1.5 rounded-lg bg-[var(--accent-10)] text-[var(--accent)] border border-[var(--accent-20)]">
          <HabitIcon name={momento.icono} size={14} />
        </div>
        <span className="text-xs font-bold font-heading text-[#F4F4F6]">{momento.label}</span>
        <span className="text-[11px] font-mono text-[#6B6F7B]">({habits.length})</span>
      </div>

      <Reorder.Group as="div" axis="y" values={ids} onReorder={onReorderHabits} className="space-y-2 pl-3">
        {habits.map((h) => (
          <HabitoRow key={h.id} habito={h} racha={racha(h.id)} onOpen={() => onOpenHabit(h.id)} />
        ))}
      </Reorder.Group>
    </Reorder.Item>
  );
};

export const ManageHabitsModal: React.FC = () => {
  const {
    habitos, habitosActivos, restaurarHabito, eliminarHabito, isManageHabitsOpen, closeManageHabits, openHabitDetail, openCreateModal,
    rachaActual, ordenMomentos, reordenarSecciones, reordenarHabitosEnMomento,
  } = useHabitStore();

  const habitosArchivados = habitos.filter((h) => h.archivado);

  const grupos = useMemo(() => {
    return ordenMomentos
      .map((id) => MOMENTOS.find((m) => m.id === id))
      .filter((m): m is typeof MOMENTOS[number] => Boolean(m))
      .map((momento) => ({
        momento,
        habits: habitosActivos
          .filter((h) => (h.momento || 'flexible') === momento.id)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
      }))
      .filter((g) => g.habits.length > 0);
  }, [habitosActivos, ordenMomentos]);

  const idsVisibles = grupos.map((g) => g.momento.id);

  const handleReorderSecciones = (nuevoVisible: MomentoDia[]) => {
    const restantes = ordenMomentos.filter((m) => !nuevoVisible.includes(m));
    reordenarSecciones([...nuevoVisible, ...restantes]);
  };

  if (!isManageHabitsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn p-0 sm:p-4" onClick={closeManageHabits}>
      <div className="w-full max-w-[430px] max-h-[85vh] bg-[#14161D] border-t sm:border border-[#1E2029] rounded-t-[24px] sm:rounded-[24px] flex flex-col shadow-2xl animate-slideUp overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="px-5 py-4 border-b border-[#1E2029] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center"><Settings size={18} /></div>
            <div>
              <h2 className="text-base font-bold font-heading text-[#F4F4F6]">Gestionar Hábitos</h2>
              <p className="text-[11px] text-[#6B6F7B]">Arrastra desde el asa para reordenar</p>
            </div>
          </div>
          <button type="button" onClick={closeManageHabits} aria-label="Cerrar" className="w-8 h-8 rounded-full bg-[#1A1C24] hover:bg-[#222530] text-[#9498A8] hover:text-white flex items-center justify-center transition-colors"><X size={16} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {habitosActivos.length === 0 && habitosArchivados.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-10)] text-[var(--accent)] flex items-center justify-center mx-auto"><Layers size={24} /></div>
              <p className="text-xs text-[#6B6F7B]">No tienes hábitos creados aún.</p>
              <button type="button" onClick={() => { closeManageHabits(); openCreateModal(); }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold shadow-md"><Plus size={14} /><span>Crear Primer Hábito</span></button>
            </div>
          ) : (
            <>
              {grupos.length > 0 && (
                <Reorder.Group as="div" axis="y" values={idsVisibles} onReorder={handleReorderSecciones} className="space-y-5">
                  {grupos.map(({ momento, habits }) => (
                    <SeccionRow
                      key={momento.id}
                      momento={momento}
                      habits={habits}
                      racha={rachaActual}
                      onOpenHabit={(id) => { closeManageHabits(); openHabitDetail(id); }}
                      onReorderHabits={(ids) => reordenarHabitosEnMomento(momento.id, ids)}
                    />
                  ))}
                </Reorder.Group>
              )}

              {habitosArchivados.length > 0 && (
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Archive size={14} className="text-[#6B6F7B]" />
                    <span className="text-xs font-bold font-heading text-[#9498A8]">Archivados</span>
                    <span className="text-[11px] font-mono text-[#6B6F7B]">({habitosArchivados.length})</span>
                  </div>
                  <div className="space-y-2">
                    {habitosArchivados.map((habito) => (
                      <article key={habito.id} className="rounded-[16px] bg-[#0C0D12]/60 border border-[#1E2029] p-3 flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${habito.color}15`, color: habito.color, border: `1px solid ${habito.color}30` }}>
                            <HabitIcon name={habito.icono} size={16} />
                          </div>
                          <h4 className="text-xs font-semibold font-heading text-[#9498A8] truncate">{habito.nombre}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => restaurarHabito(habito.id)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[var(--accent-15)] text-[var(--accent)] border border-[var(--accent-30)] hover:bg-[var(--accent-20)] transition-colors">
                            Restaurar
                          </button>
                          <button type="button"
                            onClick={() => { if (window.confirm(`¿Eliminar "${habito.nombre}" permanentemente? Se borrará su historial.`)) eliminarHabito(habito.id); }}
                            aria-label={`Eliminar ${habito.nombre}`}
                            className="w-8 h-8 rounded-lg bg-[#1A1C24] text-[#6B6F7B] hover:text-[#F87171] flex items-center justify-center transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="p-4 border-t border-[#1E2029] bg-[#0C0D12]/50 shrink-0">
          <button type="button" onClick={() => { closeManageHabits(); openCreateModal(); }} className="w-full py-3 rounded-[12px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold font-heading shadow-lg shadow-[var(--accent-30)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"><Plus size={16} strokeWidth={2.5} /><span>Crear Nuevo Hábito</span></button>
        </footer>
      </div>
    </div>
  );
};
