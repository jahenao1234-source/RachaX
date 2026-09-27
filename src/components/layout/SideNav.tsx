import React from 'react';
import { CalendarCheck, BarChart3, Calendar, Plus, Flame, User } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { useTheme } from '../../store/ThemeContext';
import { TabRoute } from '../../types';

export const SideNav: React.FC = () => {
  const {
    activeTab,
    navigateToTab,
    openCreateMenu,
    closeHabitDetail,
    nivelActual,
  } = useHabitStore();
  const { nombre } = useTheme();

  const navItems: { id: TabRoute; label: string; icon: React.FC<{ className?: string; size?: number; strokeWidth?: number }> }[] = [
    { id: 'hoy', label: 'Hoy', icon: CalendarCheck },
    { id: 'stats', label: 'Progreso', icon: BarChart3 },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
  ];

  const primerNombre = (nombre || '').trim().split(/\s+/)[0];
  const inicial = primerNombre ? primerNombre.charAt(0).toUpperCase() : '';

  return (
    <aside
      id="desktop-side-nav"
      aria-label="Navegación lateral de escritorio"
      className="hidden lg:flex flex-col bg-surface border-r border-line justify-between select-none h-full relative z-20 transition-all duration-300 lg:w-[76px] xl:w-[240px] sidenav"
    >
      <div className="flex flex-col gap-4 lg:p-3 xl:p-4">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => {
            closeHabitDetail();
            navigateToTab('hoy');
          }}
          className="flex items-center lg:justify-center xl:justify-start xl:gap-3 rounded-xl hover:bg-surface-raised transition-all group text-left w-full h-[48px] xl:h-[44px] xl:px-2 xl:py-1.5"
          aria-label="Ir a la pantalla principal"
        >
          <div className="w-[30px] h-[30px] rounded-[9px] bg-brand flex items-center justify-center text-ink group-hover:scale-105 transition-transform shrink-0">
            <Flame size={16} className="fill-current" />
          </div>
          <div className="hidden xl:flex flex-col min-w-0">
            <span className="font-heading font-bold text-[22px] text-text tracking-tight leading-none mt-1">
              Racha
            </span>
          </div>
        </button>

        {/* Action Button: Crear */}
        <button
          id="side-nav-btn-create"
          type="button"
          onClick={openCreateMenu}
          aria-label="Crear"
          title="Crear"
          className="w-full flex items-center justify-center lg:h-[48px] lg:rounded-[14px] xl:h-[46px] xl:rounded-[12px] xl:px-4 xl:justify-center gap-2 logro text-ink font-heading font-bold xl:text-[15px] transition-all active:scale-[0.98]"
        >
          <Plus size={20} strokeWidth={2.6} />
          <span className="hidden xl:inline mt-0.5">Crear</span>
        </button>

        {/* Navigation Items List */}
        <nav className="flex flex-col gap-1 xl:pt-2" aria-label="Secciones de la aplicación">
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
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={item.label}
                className={`w-full flex items-center lg:justify-center xl:justify-start xl:gap-3 xl:px-3 lg:h-[48px] xl:h-[44px] rounded-[10px] text-[15px] font-semibold transition-all ${
                  isActive
                    ? 'bg-surface-raised text-text'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised'
                }`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'text-ambar-text' : 'text-text-muted'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 2} />
                </div>
                <span className="hidden xl:inline tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile */}
      <div className="mt-auto lg:p-3 xl:p-4 border-t border-line">
        <button
          type="button"
          onClick={() => {
            closeHabitDetail();
            navigateToTab('perfil');
          }}
          aria-current={activeTab === 'perfil' ? 'page' : undefined}
          aria-label="Perfil"
          title="Perfil"
          className={`w-full flex items-center lg:justify-center xl:justify-start xl:gap-3 rounded-[12px] transition-all lg:h-[48px] xl:h-[52px] xl:px-2 hover:bg-surface-raised ${activeTab === 'perfil' ? 'bg-surface-raised' : ''}`}
        >
          <div className="w-[36px] h-[36px] rounded-full bg-surface-raised border border-line flex items-center justify-center text-text shrink-0">
            {inicial ? (
              <span className="font-heading font-bold text-[18px]">{inicial}</span>
            ) : (
              <User size={18} />
            )}
          </div>
          <div className="hidden xl:flex flex-col min-w-0 text-left">
            <span className="font-bold text-[14px] text-text truncate">
              {primerNombre || 'Sin nombre'}
            </span>
            <span className="text-[13px] text-text-muted truncate mt-[-2px]">
              Nivel {nivelActual} · Perfil
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
