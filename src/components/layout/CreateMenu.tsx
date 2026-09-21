import React from 'react';
import { X, Plus, ListChecks, ListTodo } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';

export const CreateMenu: React.FC = () => {
  const { isCreateMenuOpen, closeCreateMenu, openCreateModal, openRutinaEditor, openTareaEditor } = useHabitStore();
  if (!isCreateMenuOpen) return null;
  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={closeCreateMenu}>
      <div className="w-full max-w-[430px] bg-[#14161D] border-t sm:border border-[#1E2029] rounded-t-[24px] sm:rounded-[24px] p-5 space-y-3 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-heading text-[#F4F4F6]">Crear</h2>
          <button type="button" onClick={closeCreateMenu} aria-label="Cerrar" className="w-8 h-8 rounded-full bg-[#1A1C24] text-[#9498A8] hover:text-white flex items-center justify-center"><X size={16} /></button>
        </div>
        <button type="button" onClick={() => { closeCreateMenu(); openCreateModal(); }}
          className="w-full p-3.5 rounded-[14px] bg-[#0C0D12] border border-[#1E2029] hover:border-[var(--accent-30)] flex items-center gap-3 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0"><Plus size={20} /></div>
          <div>
            <p className="text-sm font-bold font-heading text-[#F4F4F6]">Nuevo hábito</p>
            <p className="text-[11px] text-[#6B6F7B]">Algo recurrente que quieres cumplir</p>
          </div>
        </button>
        <button type="button" onClick={() => { closeCreateMenu(); openRutinaEditor(null); }}
          className="w-full p-3.5 rounded-[14px] bg-[#0C0D12] border border-[#1E2029] hover:border-[var(--accent-30)] flex items-center gap-3 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0"><ListChecks size={20} /></div>
          <div>
            <p className="text-sm font-bold font-heading text-[#F4F4F6]">Nueva rutina</p>
            <p className="text-[11px] text-[#6B6F7B]">Agrupa hábitos para correrlos en enfoque</p>
          </div>
        </button>
        <button type="button" onClick={() => { closeCreateMenu(); openTareaEditor(null); }}
          className="w-full p-3.5 rounded-[14px] bg-[#0C0D12] border border-[#1E2029] hover:border-[var(--accent-30)] flex items-center gap-3 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0"><ListTodo size={20} /></div>
          <div>
            <p className="text-sm font-bold font-heading text-[#F4F4F6]">Nueva tarea</p>
            <p className="text-[11px] text-[#6B6F7B]">Un pendiente con lista de subtareas</p>
          </div>
        </button>
      </div>
    </div>
  );
};
