import React from 'react';
import { CalendarCheck, BarChart3, Calendar, User, Plus, Flame } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { TabRoute } from '../../types';

export const SideNav: React.FC = () => {
  const {
    activeTab,
    navigateToTab,
    openCreateMenu,
    closeHabitDetail,
    rachaGlobal,
  } = useHabitStore();

  const navItems: { id: TabRoute; label: string; icon: React.FC<{ className?: string; size?: number; strokeWidth?: number }> }[] = [
    { id: 'hoy', label: 'Hoy', icon: CalendarCheck },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const globalStreak = rachaGlobal();

  return (
    <aside
      id="desktop-side-nav"
      aria-label="Navegación lateral de escritorio"
      className="hidden lg:flex flex-col w-[240px] shrink-0 bg-surface border-r border-line p-4 justify-between select-none h-full relative z-20"
    >
      {/* Top Section: Logo + Nav Items */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => {
            closeHabitDetail();
            navigateToTab('hoy');
          }}
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-surface-raised transition-all group text-left w-full"
          aria-label="Ir a la pantalla principal"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] flex items-center justify-center text-text shadow-md shadow-[var(--accent-30)] group-hover:scale-105 transition-transform shrink-0">
            <Flame size={20} className="fill-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-heading font-bold text-base text-text tracking-tight leading-tight">
              Racha
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Hábitos & Enfoque
            </span>
          </div>
        </button>

        {/* Action Button: Crear */}
        <button
          id="side-nav-btn-create"
          type="button"
          onClick={openCreateMenu}
          aria-label="Crear nuevo hábito o elemento"
          className="w-full py-3 px-4 rounded-[14px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-text font-heading font-bold text-xs shadow-lg shadow-[var(--accent-30)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.6} />
          <span>Crear</span>
        </button>

        {/* Navigation Items List */}
        <nav className="space-y-1 pt-1" aria-label="Secciones de la aplicación">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`side-nav-tab-${item.id}`}
                type="button"
                onClick={() => {
                  closeHabitDetail();
                  navigateToTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold font-heading transition-all ${
                  isActive
                    ? 'bg-[var(--accent-15)] text-[var(--accent)] border border-[var(--accent-30)] shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'text-[var(--accent)]' : 'text-text-muted'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} />
                </div>
                <span className="tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Overall Streak Badge */}
      <div className="pt-4 border-t border-line/80">
        <div className="p-3 rounded-[14px] bg-bg border border-line flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ambar/10 border border-ambar/30 flex items-center justify-center text-ambar shrink-0">
            <Flame size={16} className="fill-ambar" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-text-muted uppercase font-mono tracking-wider font-semibold">
              Racha Global
            </p>
            <p className="text-xs font-bold font-heading text-text truncate">
              {globalStreak} {globalStreak === 1 ? 'día activo' : 'días activos'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
