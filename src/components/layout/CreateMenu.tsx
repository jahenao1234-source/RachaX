import React, { useState } from 'react';
import { X, Plus, ListChecks, ListTodo, Timer } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { getTodayString } from '../../utils/habitUtils';
import { HojaCompromiso } from '../semana/HojaCompromiso';

export const CreateMenu: React.FC = () => {
  const { isCreateMenuOpen, closeCreateMenu, openCreateModal, openRutinaEditor, openTareaEditor, navigateToTab, openFocusMode } = useHabitStore();
  // "Nuevo compromiso" abre la hoja aquí mismo, sin cambiar de pantalla.
  const [hojaCompromiso, setHojaCompromiso] = useState(false);
  const hoja = <HojaCompromiso isOpen={hojaCompromiso} onClose={() => setHojaCompromiso(false)} fechaInicial={getTodayString()} />;
  if (!isCreateMenuOpen) return hoja;
  return (
    <>
    {hoja}
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={closeCreateMenu}>
      <div className="w-full max-w-[430px] bg-surface border-t sm:border border-line rounded-t-[24px] sm:rounded-[24px] p-5 space-y-3 shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-heading text-text">Crear</h2>
          <button type="button" onClick={closeCreateMenu} aria-label="Cerrar" className="w-[44px] h-[44px] rounded-full bg-surface-raised text-text-muted hover:text-text flex items-center justify-center shrink-0"><X size={20} /></button>
        </div>
        <button type="button" onClick={() => { closeCreateMenu(); openCreateModal(); }}
          className="w-full p-3.5 rounded-[14px] bg-bg border border-line hover:border-[var(--accent-30)] flex items-center gap-3 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0"><Plus size={20} /></div>
          <div>
            <p className="text-sm font-bold font-heading text-text">Nuevo hábito</p>
            <p className="text-[11px] text-text-muted">Algo recurrente que quieres cumplir</p>
          </div>
        </button>
        {/* "Nueva rutina" retirada el 27 sep 2026: las rutinas se rediseñan desde cero */}
        <button type="button" onClick={() => { closeCreateMenu(); setHojaCompromiso(true); }}
          className="w-full p-3.5 rounded-[14px] bg-bg border border-line hover:border-[var(--accent-30)] flex items-center gap-3 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold font-heading text-text">Nuevo compromiso</p>
            <p className="text-[11px] text-text-muted">Un evento o plan fijo para esta semana</p>
          </div>
        </button>
        <button type="button" onClick={() => { closeCreateMenu(); navigateToTab('tareas'); openTareaEditor(null); }}
          className="w-full p-3.5 rounded-[14px] bg-bg border border-line hover:border-[var(--accent-30)] flex items-center gap-3 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0"><ListTodo size={20} /></div>
          <div>
            <p className="text-sm font-bold font-heading text-text">Nueva tarea</p>
            <p className="text-[11px] text-text-muted">Un pendiente con lista de subtareas</p>
          </div>
        </button>
        <div className="h-px bg-line my-1" aria-hidden="true"></div>
        <button type="button" onClick={() => { closeCreateMenu(); openFocusMode({ tipo: 'libre' }); }}
          className="w-full p-3.5 rounded-[14px] bg-bg border border-line hover:border-[var(--accent-30)] flex items-center gap-3 text-left transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0"><Timer size={20} /></div>
          <div>
            <p className="text-sm font-bold font-heading text-text">Empezar un pomodoro</p>
            <p className="text-[11px] text-text-muted">Un rato de foco con reloj, para lo que quieras</p>
          </div>
        </button>
      </div>
    </div>
    </>
  );
};
