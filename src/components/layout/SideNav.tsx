import React, { useEffect, useState } from 'react';
import { CalendarCheck, ListChecks, CalendarRange, BarChart3, Plus, Flame, User, Library, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { useTheme } from '../../store/ThemeContext';
import { TabRoute } from '../../types';

// El menú se abre y se cierra con el botón de abajo (DESIGN.md › Navigation › "Menú lateral que se abre y se cierra").
// - Ventana ancha (1280px o más): abrirlo o cerrarlo empuja el contenido, y lo elegido se recuerda. Sin elegir, abierto, como antes.
// - Ventana angosta: está cerrado, como antes. Al abrirlo queda ENCIMA del contenido (si lo empujara, Hoy quedaría tan estrecho
//   que la fecha se parte en dos renglones); no se guarda, y se cierra al elegir un destino, al tocar fuera o con Escape.
const CLAVE_MENU = 'racha_menu_abierto';
const leerPreferencia = (): boolean | null => {
  try { const v = localStorage.getItem(CLAVE_MENU); return v === '1' ? true : v === '0' ? false : null; } catch { return null; }
};
function useVentanaAncha() {
  const [ancha, setAncha] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 1280px)').matches : true));
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1280px)');
    const handler = () => setAncha(mql.matches);
    mql.addEventListener('change', handler);
    window.addEventListener('resize', handler);
    return () => { mql.removeEventListener('change', handler); window.removeEventListener('resize', handler); };
  }, []);
  return ancha;
}

export const SideNav: React.FC = () => {
  const {
    activeTab,
    navigateToTab,
    openCreateMenu,
    closeHabitDetail,
    nivelActual,
    rachaGlobal,
    verBiblioteca,
    abrirBiblioteca,
  } = useHabitStore();
  const diasRacha = rachaGlobal();
  const { nombre } = useTheme();
  const ventanaAncha = useVentanaAncha();
  const [preferencia, setPreferencia] = useState<boolean | null>(leerPreferencia);
  const [encimaAbierto, setEncimaAbierto] = useState(false);
  const abierto = ventanaAncha ? (preferencia ?? true) : encimaAbierto;
  const encima = !ventanaAncha && encimaAbierto;
  const cerrarEncima = () => setEncimaAbierto(false);
  const alternarMenu = () => {
    if (!ventanaAncha) { setEncimaAbierto((v) => !v); return; }
    const nuevo = !abierto;
    setPreferencia(nuevo);
    try { localStorage.setItem(CLAVE_MENU, nuevo ? '1' : '0'); } catch { /* sin almacenamiento: vale solo por esta vez */ }
  };
  // Al ensanchar la ventana, lo abierto "encima" deja de aplicar
  useEffect(() => { if (ventanaAncha) setEncimaAbierto(false); }, [ventanaAncha]);
  useEffect(() => {
    if (!encima) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEncimaAbierto(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [encima]);

  const navItems: { id: TabRoute; label: string; icon: React.FC<{ className?: string; size?: number; strokeWidth?: number }> }[] = [
    { id: 'hoy', label: 'Hoy', icon: CalendarCheck },
    { id: 'tareas', label: 'Tareas', icon: ListChecks },
    { id: 'semana', label: 'Tu semana', icon: CalendarRange },
    { id: 'stats', label: 'Progreso', icon: BarChart3 },
  ];

  const primerNombre = (nombre || '').trim().split(/\s+/)[0];
  const inicial = primerNombre ? primerNombre.charAt(0).toUpperCase() : '';

  // Las mismas medidas de antes: abierto = lo que era "xl" (240px, con nombres); cerrado = lo que era "lg" (76px, solo íconos)
  const fila = abierto ? 'justify-start gap-3 px-3 h-[44px]' : 'justify-center h-[48px]';
  const soloAbierto = abierto ? '' : 'hidden';

  return (
    <>
    {encima && <div className="hidden lg:block fixed inset-0 z-[19]" onClick={cerrarEncima} aria-hidden="true" />}
    <aside
      id="desktop-side-nav"
      aria-label="Navegación lateral de escritorio"
      className={`hidden lg:block select-none h-full relative z-20 transition-all duration-300 shrink-0 ${abierto && !encima ? 'w-[240px]' : 'w-[76px]'} sidenav`}
    >
      {/* En ventana angosta el menú abierto es esta misma caja, de 240px, puesta encima del contenido */}
      <div className={`flex flex-col justify-between h-full bg-surface border-r border-line ${encima ? 'absolute inset-y-0 left-0 w-[240px] shadow-[8px_0_24px_rgba(0,0,0,0.35)]' : 'w-full'}`}>
      <div className={`flex flex-col gap-4 ${abierto ? 'p-4' : 'p-3'}`}>
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => {
            cerrarEncima();
            closeHabitDetail();
            navigateToTab('hoy');
          }}
          className={`flex items-center rounded-xl hover:bg-surface-raised transition-all group text-left w-full ${abierto ? 'justify-start gap-3 h-[44px] px-2 py-1.5' : 'justify-center h-[48px]'}`}
          aria-label="Ir a la pantalla principal"
        >
          <div className="w-[30px] h-[30px] rounded-[9px] bg-brand flex items-center justify-center text-ink group-hover:scale-105 transition-transform shrink-0">
            <Flame size={16} className="fill-current" />
          </div>
          <div className={`${abierto ? 'flex' : 'hidden'} flex-col min-w-0`}>
            <span className="font-heading font-bold text-[22px] text-text tracking-tight leading-none mt-1">
              Racha
            </span>
            {diasRacha > 0 && (
              <span className="text-[13px] font-semibold text-text-muted leading-none mt-1.5 whitespace-nowrap">
                {diasRacha} {diasRacha === 1 ? 'día seguido' : 'días seguidos'}
              </span>
            )}
          </div>
        </button>

        {/* Action Button: Crear */}
        <button
          id="side-nav-btn-create"
          type="button"
          onClick={() => { cerrarEncima(); openCreateMenu(); }}
          aria-label="Crear"
          title="Crear"
          className={`w-full flex items-center justify-center gap-2 logro text-ink font-heading font-bold transition-all active:scale-[0.98] ${abierto ? 'h-[46px] rounded-[12px] px-4 text-[15px]' : 'h-[48px] rounded-[14px]'}`}
        >
          <Plus size={20} strokeWidth={2.6} />
          <span className={`${abierto ? 'inline' : 'hidden'} mt-0.5`}>Crear</span>
        </button>

        {/* Navigation Items List */}
        <nav className={`flex flex-col gap-1 ${abierto ? 'pt-2' : ''}`} aria-label="Secciones de la aplicación">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !verBiblioteca && (activeTab === item.id || (item.id === 'stats' && activeTab === 'calendario'));

            return (
              <button
                key={item.id}
                id={`side-nav-tab-${item.id}`}
                type="button"
                onClick={() => {
                  cerrarEncima();
                  closeHabitDetail();
                  navigateToTab(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={item.label}
                className={`w-full flex items-center ${fila} rounded-[10px] text-[15px] font-semibold transition-all ${
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
                <span className={`${soloAbierto} tracking-tight`}>{item.label}</span>
              </button>
            );
          })}
          <button
            id="side-nav-tab-biblioteca"
            type="button"
            onClick={() => { cerrarEncima(); closeHabitDetail(); abrirBiblioteca(); }}
            aria-current={verBiblioteca ? 'page' : undefined}
            aria-label="Biblioteca"
            title="Biblioteca"
            className={`w-full flex items-center ${fila} rounded-[10px] text-[15px] font-semibold transition-all ${verBiblioteca ? 'bg-surface-raised text-text' : 'text-text-muted hover:text-text hover:bg-surface-raised'}`}
          >
            <div className={`flex items-center justify-center shrink-0 transition-colors ${verBiblioteca ? 'text-ambar-text' : 'text-text-muted'}`}>
              <Library size={20} strokeWidth={verBiblioteca ? 2.3 : 2} />
            </div>
            <span className={`${soloAbierto} tracking-tight`}>Biblioteca</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section: abrir o cerrar el menú, y el perfil */}
      <div className={`mt-auto ${abierto ? 'p-4' : 'p-3'} border-t border-line`}>
        <button
          id="side-nav-btn-plegar"
          type="button"
          onClick={alternarMenu}
          aria-expanded={abierto}
          aria-controls="desktop-side-nav"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          title={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          className={`w-full flex items-center ${fila} mb-1.5 rounded-[10px] text-[15px] font-semibold text-text-muted hover:text-text hover:bg-surface-raised transition-all`}
        >
          {abierto ? <PanelLeftClose size={20} className="shrink-0" /> : <PanelLeftOpen size={20} className="shrink-0" />}
          <span className={`${soloAbierto} tracking-tight whitespace-nowrap`}>Cerrar el menú</span>
        </button>
        <button
          type="button"
          onClick={() => {
            cerrarEncima();
            closeHabitDetail();
            navigateToTab('perfil');
          }}
          aria-current={activeTab === 'perfil' ? 'page' : undefined}
          aria-label="Perfil"
          title="Perfil"
          className={`w-full flex items-center rounded-[12px] transition-all hover:bg-surface-raised ${abierto ? 'justify-start gap-3 h-[52px] px-2' : 'justify-center h-[48px]'} ${activeTab === 'perfil' ? 'bg-surface-raised' : ''}`}
        >
          <div className="w-[36px] h-[36px] rounded-full bg-surface-raised border border-line flex items-center justify-center text-text shrink-0">
            {inicial ? (
              <span className="font-heading font-bold text-[18px]">{inicial}</span>
            ) : (
              <User size={18} />
            )}
          </div>
          <div className={`${abierto ? 'flex' : 'hidden'} flex-col min-w-0 text-left`}>
            <span className="font-bold text-[14px] text-text truncate">
              {primerNombre || 'Sin nombre'}
            </span>
            <span className="text-[13px] text-text-muted truncate mt-[-2px]">
              Nivel {nivelActual} · Perfil
            </span>
          </div>
        </button>
      </div>
      </div>
    </aside>
    </>
  );
};
