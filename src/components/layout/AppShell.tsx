import React, { useState, useEffect, useRef } from 'react';
import { useHabitStore } from '../../store/HabitContext';
import { useCuenta } from '../../store/CuentaContext';
import { getTodayString, contarProgresoReto } from '../../utils/habitUtils';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { TodayScreen } from '../screens/TodayScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateHabitScreen } from '../screens/CreateHabitScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { ManageHabitsModal } from '../screens/ManageHabitsModal';
import { FocusModeScreen } from '../screens/FocusModeScreen';
import { TusCompromisosPantalla } from '../compromisos/TusCompromisosPantalla';
import { HojaComodines } from '../comodines/HojaComodines';
import { HojaDificil } from '../comodines/HojaDificil';
import { TasksScreen } from '../screens/TasksScreen';
import { SemanaScreen } from '../screens/SemanaScreen';
import { RutinaEditorModal } from '../screens/RutinaEditorModal';
import { CreateMenu } from './CreateMenu';
import { HabitCreatedSheet } from '../screens/HabitCreatedSheet';
import { OnboardingModal } from '../onboarding/OnboardingModal';
import { CuentaFlow } from '../cuenta/CuentaFlow';
import { NubeSync } from '../cuenta/NubeSync';
import { supabaseListo } from '../../lib/supabase';
import { CelebracionesManager } from '../juego/CelebracionesManager';
import { CompactPwaInstallBtn } from '../pwa/CompactPwaInstallBtn';
import { Flame } from 'lucide-react';
import { PantallaInstalar, HojaInstalar } from '../pwa/InstalarUI';
import { AvisosSync } from '../avisos/AvisosSync';
import { HojaAvisos, PantallaAvisos } from '../avisos/AvisosUI';

export const AppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedHabitIdForDetail,
    closeHabitDetail,
    habitos,
    habitoRecienCreadoId,
    setHabitoRecienCreadoId,
    closeCreateModal,
    revisarComodinAutomatico,
    isOnboardingOpen
  } = useHabitStore();
  const { estado } = useCuenta();
  // Sin Supabase configurado (por ejemplo, un despliegue sin las variables), la app funciona solo en el celular
  const [nubeLista, setNubeLista] = useState(!supabaseListo);

  // Comodín automático (design/maqueta-dia-dificil.html): se revisa cuando la nube ya trajo los datos,
  // y otra vez al volver a la app (por si cambió el día). Solo actúa una vez por día.
  const revisarRef = useRef(revisarComodinAutomatico);
  revisarRef.current = revisarComodinAutomatico;
  const puedeRevisar = nubeLista && (estado === 'dentro' || !supabaseListo);
  useEffect(() => { if (puedeRevisar) revisarRef.current(); });
  useEffect(() => {
    if (!puedeRevisar) return;
    const alVolver = () => { if (document.visibilityState === 'visible') revisarRef.current(); };
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, [puedeRevisar]);

  // Al entrar a la cuenta (también después de salir desde Perfil) se abre siempre en Hoy
  const [estadoAntes, setEstadoAntes] = useState(estado);
  useEffect(() => {
    if (estado === 'dentro' && estadoAntes !== 'dentro' && estadoAntes !== 'cargando') setActiveTab('hoy');
    setEstadoAntes(estado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const renderActiveScreen = () => {
    const screenToRender = activeTab === 'crear' ? 'hoy' : activeTab;

    switch (screenToRender) {
      case 'hoy':
        return <TodayScreen />;
      case 'tareas':
        return <TasksScreen />;
      case 'semana':
        return <SemanaScreen />;
      case 'stats':
      case 'calendario':
        return <StatsScreen pestanaInicial={screenToRender === 'calendario' ? 'calendario' : 'resumen'} />;
      case 'perfil':
        return <ProfileScreen />;
      default:
        return <TodayScreen />;
    }
  };

  const habitoRecienCreado = habitoRecienCreadoId ? habitos.find((h) => h.id === habitoRecienCreadoId) || null : null;

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center py-0 sm:py-6 lg:py-0 px-0 sm:px-4 lg:px-0">
      {/* App Container: Phone format on mobile/tablet, wide workstation on desktop */}
      <main
        id="app-shell-main"
        className="w-full max-w-[430px] min-h-screen sm:min-h-[850px] sm:max-h-[920px] lg:max-w-none lg:h-screen lg:max-h-none lg:min-h-screen bg-bg sm:border lg:border-none sm:border-line sm:rounded-[36px] lg:rounded-none relative flex flex-col lg:flex-row overflow-hidden sm:shadow-2xl lg:shadow-none sm:shadow-black/90"
      >

        {/* Desktop Side Navigation (visible only on lg) */}
        <SideNav />

        {/* Right / Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          {/* Mobile Compact Top Bar (hidden on lg since brand is in SideNav) */}
          <header className="px-4 py-2.5 flex items-center justify-between border-b border-line/50 relative z-10 shrink-0 lg:hidden">
            <button
              type="button"
              onClick={() => {
                closeHabitDetail();
                setActiveTab('hoy');
              }}
              className="flex items-center gap-2 group text-left transition-opacity hover:opacity-90 active:scale-95"
              aria-label="Ir a la pantalla principal"
            >
              <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center text-ink group-hover:scale-105 transition-transform">
                <Flame size={14} className="fill-current" />
              </div>
              <span className="font-heading font-bold text-sm text-text tracking-tight">
                Racha
              </span>
            </button>

            {/* Compact PWA Install Button (only when installable on mobile) */}
            <div className="flex items-center">
              <CompactPwaInstallBtn />
            </div>
          </header>

          {/* Scrollable Screen Content */}
          <div className={`flex-1 overflow-y-auto relative z-10 custom-scrollbar ${
            (activeTab === 'hoy' || activeTab === 'crear' || activeTab === 'tareas' || activeTab === 'semana' || activeTab === 'stats' || activeTab === 'calendario')
              ? 'px-5 sm:px-6 lg:px-[22px] xl:px-[32px] pt-3 lg:pt-[18px] xl:pt-[24px] pb-24 lg:pb-8' 
              : 'px-5 sm:px-6 lg:px-8 pt-3 lg:pt-6 pb-24 lg:pb-8'
          }`}>
            <div className={`w-full mx-auto ${
              (activeTab === 'hoy' || activeTab === 'crear' || activeTab === 'tareas' || activeTab === 'semana' || activeTab === 'stats' || activeTab === 'calendario') ? 'max-w-[760px] lg:max-w-[1120px]' : 'max-w-[760px]'
            }`}>
              {renderActiveScreen()}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navigation (hidden on desktop) */}
        <BottomNav />

        {/* Detalle del hábito: capa completa por encima de la barra inferior */}
        {selectedHabitIdForDetail && (
          <HabitDetailScreen habitId={selectedHabitIdForDetail} onBack={closeHabitDetail} />
        )}

        {/* Global Modals */}
        <ManageHabitsModal />
        <FocusModeScreen />
        <TusCompromisosPantalla />
        <HojaComodines />
        <HojaDificil />
        <HojaInstalar />
        <CreateMenu />
        <RutinaEditorModal />
        <CuentaFlow />
        {estado === 'dentro' && supabaseListo && <NubeSync onNubeLista={() => setNubeLista(true)} />}
        {estado === 'dentro' && nubeLista && <AvisosSync />}
        {estado === 'dentro' && nubeLista && <OnboardingModal />}
        {/* Instalar la app: una vez, cuando ya entró y el onboarding está cerrado (o no hay cuenta configurada) */}
        {(estado === 'dentro' || !supabaseListo) && nubeLista && !isOnboardingOpen && <PantallaInstalar />}
        {estado === 'dentro' && <CelebracionesManager />}
        {estado === 'dentro' && <HojaAvisos />}
        {estado === 'dentro' && <PantallaAvisos />}

        {/* Create Habit Modal */}
        {activeTab === 'crear' && <CreateHabitScreen />}

        {/* Habit Created Sheet */}
        <HabitCreatedSheet 
          habito={habitoRecienCreado} 
          onViewToday={() => {
            setHabitoRecienCreadoId(null);
            closeCreateModal();
            setActiveTab('hoy');
          }}
          onCreateAnother={() => {
            setHabitoRecienCreadoId(null);
            // stays in 'crear' mode, so the create screen remains open
          }}
        />
      </main>
    </div>
  );
};


