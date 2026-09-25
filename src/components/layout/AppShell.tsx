import React, { useState, useEffect } from 'react';
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
import { RutinaEditorModal } from '../screens/RutinaEditorModal';
import { TareaEditorModal } from '../screens/TareaEditorModal';
import { CreateMenu } from './CreateMenu';
import { HabitCreatedSheet } from '../screens/HabitCreatedSheet';
import { OnboardingModal } from '../onboarding/OnboardingModal';
import { CuentaFlow } from '../cuenta/CuentaFlow';
import { CelebracionesManager } from '../juego/CelebracionesManager';
import { CompactPwaInstallBtn } from '../pwa/CompactPwaInstallBtn';
import { Flame } from 'lucide-react';

export const AppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedHabitIdForDetail,
    closeHabitDetail,
    habitos,
    habitoRecienCreadoId,
    setHabitoRecienCreadoId,
    closeCreateModal
  } = useHabitStore();
  const { estado } = useCuenta();

  const renderActiveScreen = () => {
    const screenToRender = activeTab === 'crear' ? 'hoy' : activeTab;

    switch (screenToRender) {
      case 'hoy':
        return <TodayScreen />;
      case 'stats':
        return <StatsScreen />;
      case 'calendario':
        return <CalendarScreen />;
      case 'perfil':
        return <ProfileScreen />;
      default:
        return <TodayScreen />;
    }
  };

  const habitoRecienCreado = habitoRecienCreadoId ? habitos.find((h) => h.id === habitoRecienCreadoId) || null : null;

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center py-0 sm:py-6 lg:py-8 px-0 sm:px-4 lg:px-6">
      {/* App Container: Phone format on mobile/tablet, wide workstation on desktop */}
      <main
        id="app-shell-main"
        className="w-full max-w-[430px] min-h-screen sm:min-h-[850px] sm:max-h-[920px] lg:max-w-[1200px] lg:h-[880px] lg:min-h-[860px] lg:max-h-[92vh] bg-bg sm:border sm:border-line sm:rounded-[36px] lg:rounded-[28px] relative flex flex-col lg:flex-row overflow-hidden sm:shadow-2xl sm:shadow-black/90"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 lg:w-[600px] h-36 bg-[var(--accent-15)] rounded-full blur-3xl pointer-events-none" />

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
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 lg:px-8 pt-3 lg:pt-6 pb-24 lg:pb-8 relative z-10 custom-scrollbar">
            <div className="w-full max-w-[760px] mx-auto">
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
        <CreateMenu />
        <RutinaEditorModal />
        <TareaEditorModal />
        <CuentaFlow />
        {estado === 'dentro' && <OnboardingModal />}
        {estado === 'dentro' && <CelebracionesManager />}

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


