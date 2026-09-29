import React from 'react';
import { CalendarCheck, BarChart3, Plus, User, ListChecks } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { TabRoute } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, navigateToTab, openCreateMenu } = useHabitStore();

  const navItems: { id: TabRoute; label: string; icon: React.FC<{ className?: string; size?: number }> }[] = [
    { id: 'hoy', label: 'Hoy', icon: CalendarCheck },
    { id: 'tareas', label: 'Tareas', icon: ListChecks },
    // Center element will be the floating plus button
    { id: 'stats', label: 'Progreso', icon: BarChart3 },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto px-4 pb-5 pt-2 lg:hidden"
    >
      <div className="relative bg-surface/90 backdrop-blur-xl border border-line rounded-[22px] px-3 py-2 shadow-2xl shadow-black/80 flex items-center justify-between">
        {/* Item 1: Hoy */}
        <button
          id="nav-tab-hoy"
          type="button"
          onClick={() => navigateToTab('hoy')}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all duration-200 group ${
            activeTab === 'hoy' ? 'text-[var(--accent)]' : 'text-text-muted hover:text-text-muted'
          }`}
        >
          <div className={`relative p-1 rounded-xl transition-all duration-200 ${
            activeTab === 'hoy' ? 'bg-[var(--accent-15)]' : 'group-hover:bg-surface-raised'
          }`}>
            <CalendarCheck size={20} strokeWidth={activeTab === 'hoy' ? 2.3 : 1.9} />
            {activeTab === 'hoy' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1 font-sans">
            Hoy
          </span>
        </button>

        {/* Item 2: Tareas */}
        <button
          id="nav-tab-tareas"
          type="button"
          onClick={() => navigateToTab('tareas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all duration-200 group ${
            activeTab === 'tareas' ? 'text-[var(--accent)]' : 'text-text-muted hover:text-text-muted'
          }`}
        >
          <div className={`relative p-1 rounded-xl transition-all duration-200 ${
            activeTab === 'tareas' ? 'bg-[var(--accent-15)]' : 'group-hover:bg-surface-raised'
          }`}>
            <ListChecks size={20} strokeWidth={activeTab === 'tareas' ? 2.3 : 1.9} />
            {activeTab === 'tareas' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1 font-sans">
            Tareas
          </span>
        </button>

        {/* Item 3: Botón Central Flotante (+) */}
        <div className="flex-1 flex items-center justify-center -mt-6">
          <button
            id="nav-btn-create-habit"
            type="button"
            onClick={openCreateMenu}
            aria-label="Crear nuevo hábito"
            className="w-13 h-13 rounded-full logro hover:brightness-95 active:scale-95 text-ink flex items-center justify-center shadow-lg shadow-[var(--accent-40)] transition-all duration-200 border-4 border-bg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-bg"
          >
            <Plus size={26} strokeWidth={2.6} className="transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Item 4: Progreso */}
        <button
          id="nav-tab-stats"
          type="button"
          onClick={() => navigateToTab('stats')}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all duration-200 group ${
            (activeTab === 'stats' || activeTab === 'calendario') ? 'text-[var(--accent)]' : 'text-text-muted hover:text-text-muted'
          }`}
        >
          <div className={`relative p-1 rounded-xl transition-all duration-200 ${
            (activeTab === 'stats' || activeTab === 'calendario') ? 'bg-[var(--accent-15)]' : 'group-hover:bg-surface-raised'
          }`}>
            <BarChart3 size={20} strokeWidth={(activeTab === 'stats' || activeTab === 'calendario') ? 2.3 : 1.9} />
            {(activeTab === 'stats' || activeTab === 'calendario') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1 font-sans">
            Progreso
          </span>
        </button>

        {/* Item 5: Perfil */}
        <button
          id="nav-tab-perfil"
          type="button"
          onClick={() => navigateToTab('perfil')}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all duration-200 group ${
            activeTab === 'perfil' ? 'text-[var(--accent)]' : 'text-text-muted hover:text-text-muted'
          }`}
        >
          <div className={`relative p-1 rounded-xl transition-all duration-200 ${
            activeTab === 'perfil' ? 'bg-[var(--accent-15)]' : 'group-hover:bg-surface-raised'
          }`}>
            <User size={20} strokeWidth={activeTab === 'perfil' ? 2.3 : 1.9} />
            {activeTab === 'perfil' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1 font-sans">
            Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};
