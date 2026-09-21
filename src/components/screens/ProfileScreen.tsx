import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Flame,
  Award,
  Layers,
  ChevronRight,
  HelpCircle,
  Trophy,
  Zap,
  Crown,
  CheckCircle2,
  Lock,
  FileJson,
  AlertTriangle,
  X,
  Palette,
} from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { useTheme } from '../../store/ThemeContext';
import { calcularInsignias, InsigniaDef } from '../../utils/badgeUtils';
import { BadgeDetailModal } from '../badges/BadgeDetailModal';
import { Habito, Registro, TEMAS } from '../../types';

export const ProfileScreen: React.FC = () => {
  const {
    reiniciarTodo,
    habitosActivos: habitos,
    registros,
    rachaGlobal,
    mejorRachaGlobalHabitos,
    openManageHabits,
    openOnboarding,
    exportarDatos,
    importarDatos,
  } = useHabitStore();
  const { tema, setTema, temaActual } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBadge, setSelectedBadge] = useState<InsigniaDef | null>(null);
  const [importPendingData, setImportPendingData] = useState<{
    data: any;
    fileName: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const totalCompletados = registros.filter((r) => r.completado).length;
  const globalStreak = rachaGlobal();
  const maxHabitStreak = mejorRachaGlobalHabitos();

  // Nivel del perfil: cada 20 check-ins = 1 nivel
  const CHECKINS_PER_LEVEL = 20;
  const currentLevel = Math.floor(totalCompletados / CHECKINS_PER_LEVEL) + 1;
  const checkinsInCurrentLevel = totalCompletados % CHECKINS_PER_LEVEL;
  const levelProgressPercent = Math.round((checkinsInCurrentLevel / CHECKINS_PER_LEVEL) * 100);

  // Insignias dinámicas
  const insignias = calcularInsignias(habitos, registros, maxHabitStreak, globalStreak);
  const totalDesbloqueadas = insignias.filter((b) => b.desbloqueada).length;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || !Array.isArray(parsed.habitos) || !Array.isArray(parsed.registros)) {
          showNotification(
            'error',
            'El archivo no tiene el formato de respaldo de Racha (faltan listas de hábitos o registros).'
          );
          return;
        }

        // Valid habit schema check
        const hasValidHabits = parsed.habitos.every(
          (h: any) => h && typeof h.id === 'string' && typeof h.nombre === 'string'
        );

        if (!hasValidHabits) {
          showNotification(
            'error',
            'El archivo contiene hábitos con estructura inválida.'
          );
          return;
        }

        // Stage for confirmation modal
        setImportPendingData({
          data: parsed,
          fileName: file.name,
        });
      } catch (err) {
        showNotification(
          'error',
          'No se pudo leer el archivo JSON. Verifica que sea un archivo de texto válido.'
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      showNotification('error', 'Error al abrir el archivo.');
    };

    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!importPendingData) return;

    const result = importarDatos(importPendingData.data);

    if (result.success) {
      showNotification(
        'success',
        `¡Copia restaurada! Se importaron ${importPendingData.data.habitos.length} hábitos y ${importPendingData.data.registros.length} registros.`
      );
    } else {
      showNotification('error', result.error || 'Error al importar datos.');
    }

    setImportPendingData(null);
  };

  const renderBadgeIcon = (iconName: string, unlocked: boolean, color: string) => {
    const size = 20;
    const iconClass = unlocked ? '' : 'text-text-muted';

    switch (iconName) {
      case 'Sparkles':
        return <Sparkles size={size} className={iconClass} />;
      case 'Flame':
        return <Flame size={size} className={unlocked ? 'fill-current' : iconClass} />;
      case 'Zap':
        return <Zap size={size} className={iconClass} />;
      case 'Shield':
        return <Shield size={size} className={iconClass} />;
      case 'Award':
        return <Award size={size} className={iconClass} />;
      case 'Layers':
        return <Layers size={size} className={iconClass} />;
      case 'Trophy':
        return <Trophy size={size} className={iconClass} />;
      case 'Crown':
        return <Crown size={size} className={iconClass} />;
      default:
        return <Award size={size} className={iconClass} />;
    }
  };

  return (
    <div id="screen-profile" className="space-y-6 pb-24 animate-fadeIn">
      {/* Hidden File Input for Backup Import */}
      <input
        ref={fileInputRef}
        type="file"
        // Sin filtro de tipo: en Android los .json descargados suelen llegar como tipo genérico
        // y el selector los bloquea. El contenido se valida al leerlo.
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] px-4 animate-slideDown">
          <div
            className={`p-3.5 rounded-[16px] border flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-surface/95 border-ambar/50 text-ambar'
                : 'bg-surface/95 border-danger/50 text-danger'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {notification.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0" />
              ) : (
                <AlertTriangle size={16} className="shrink-0" />
              )}
              <span className="text-text">{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-text-muted hover:text-text"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="pt-2">
        <p className="text-xs font-medium text-text-muted tracking-wide uppercase">
          Configuración y Logros
        </p>
        <h1 className="text-2xl font-bold font-heading text-text tracking-tight mt-0.5">
          Perfil
        </h1>
      </header>

      <div className="space-y-7">
        {/* === ZONA 1: IDENTIDAD (hero) === */}
        <section
          id="profile-user-card"
          className="rounded-[20px] bg-surface border border-line p-5 space-y-4 relative overflow-hidden shadow-xl"
        >
          {/* Avatar + Name + Level Pill */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--accent-15)] border-2 border-[var(--accent)] flex items-center justify-center text-[var(--accent)] shrink-0 shadow-lg shadow-[var(--accent-20)]">
              <User size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-text truncate">
                  Atleta de Hábitos
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent-20)] text-[var(--accent)] border border-[var(--accent-40)] shadow-sm">
                  Nv. {currentLevel}
                </span>
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">
                Construyendo consistencia día a día
              </p>
            </div>
          </div>

          {/* 3 Clean Metric Tiles */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-surface-raised/80 border border-line rounded-[14px] p-2.5 text-center">
              <p className="text-[11px] text-text-muted font-medium">Nivel</p>
              <p className="text-base font-bold font-heading text-[var(--accent)] mt-0.5">
                {currentLevel}
              </p>
            </div>
            <div className="bg-surface-raised/80 border border-line rounded-[14px] p-2.5 text-center">
              <p className="text-[11px] text-text-muted font-medium">Check-ins</p>
              <p className="text-base font-bold font-heading text-text mt-0.5">
                {totalCompletados}
              </p>
            </div>
            <div className="bg-surface-raised/80 border border-line rounded-[14px] p-2.5 text-center">
              <p className="text-[11px] text-text-muted font-medium">Racha</p>
              <p className="text-base font-bold font-heading text-ambar mt-0.5 flex items-center justify-center gap-1">
                <span>{globalStreak}d</span>
                <Flame size={14} className="fill-ambar" />
              </p>
            </div>
          </div>

          {/* Level XP Progress Bar */}
          <div className="pt-2 border-t border-line space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Progreso de Nivel</span>
              <span className="text-text font-medium">
                {checkinsInCurrentLevel} / {CHECKINS_PER_LEVEL} check-ins para Nv. {currentLevel + 1}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-deep)] transition-all duration-500"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* === ZONA 2: LOGROS === */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-sm font-semibold font-heading text-text">
              Logros
            </h3>
            <span className="text-xs text-[var(--accent)] bg-[var(--accent-15)] px-2.5 py-0.5 rounded-full border border-[var(--accent-30)] font-medium">
              {totalDesbloqueadas} / {insignias.length} Desbloqueadas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {insignias.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className={`rounded-[18px] p-3 text-center space-y-2 transition-all text-left relative overflow-hidden group cursor-pointer active:scale-95 ${
                  badge.desbloqueada
                    ? 'bg-surface border hover:border-opacity-80 shadow-md'
                    : 'bg-[#12131A]/60 border border-line/70 opacity-60 hover:opacity-80'
                }`}
                style={{
                  borderColor: badge.desbloqueada ? `${badge.color}60` : undefined,
                  boxShadow: badge.desbloqueada ? `0 4px 15px -3px ${badge.color}20` : undefined,
                }}
              >
                {/* Status Pill on top-right */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: badge.desbloqueada ? `${badge.color}20` : 'var(--surface-raised)',
                      color: badge.desbloqueada ? badge.color : 'var(--text-muted)',
                    }}
                  >
                    {renderBadgeIcon(badge.icono, badge.desbloqueada, badge.color)}
                  </div>

                  {badge.desbloqueada ? (
                    <CheckCircle2 size={14} className="text-ambar" />
                  ) : (
                    <Lock size={12} className="text-text-muted" />
                  )}
                </div>

                <div>
                  <p
                    className={`text-xs font-bold font-heading truncate ${
                      badge.desbloqueada ? 'text-text' : 'text-text-muted'
                    }`}
                  >
                    {badge.nombre}
                  </p>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">
                    {badge.requisito}
                  </p>
                </div>

                {/* Progress mini indicator */}
                <div className="w-full h-1 rounded-full bg-surface-raised overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((badge.progresoActual / badge.meta) * 100))}%`,
                      backgroundColor: badge.desbloqueada ? badge.color : 'var(--text-muted)',
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* === ZONA 3: AJUSTES === */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold font-heading text-text px-0.5">
            Ajustes
          </h3>

          <div className="rounded-[16px] bg-surface border border-line divide-y divide-[var(--line)] overflow-hidden shadow-lg shadow-black/20">
            {/* Color de Acento / Selector de Temas */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0">
                    <Palette size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-text block">Color de acento</span>
                    <span className="text-[10px] text-text-muted">Personaliza el tono principal de la interfaz</span>
                  </div>
                </div>
                <span className="text-xs font-semibold font-heading text-[var(--accent)] bg-[var(--accent-15)] px-2.5 py-0.5 rounded-full border border-[var(--accent-30)] capitalize">
                  {temaActual.label}
                </span>
              </div>

              {/* Fila de swatches circulares */}
              <div className="grid grid-cols-6 gap-2 pt-1">
                {TEMAS.map((t) => {
                  const isSelected = tema === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTema(t.key)}
                      title={t.label}
                      aria-label={`Seleccionar tema ${t.label}`}
                      className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-surface-raised border border-[var(--accent-30)] shadow-sm'
                          : 'hover:bg-surface-raised/60 border border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-105'
                            : 'border border-white/20'
                        }`}
                        style={{
                          backgroundColor: t.accent,
                          boxShadow: isSelected ? `0 0 10px ${t.accent}80` : undefined,
                        }}
                      >
                        {isSelected && (
                          <CheckCircle2 size={15} className="text-text drop-shadow" strokeWidth={2.5} />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-medium transition-colors truncate max-w-full ${
                          isSelected ? 'text-text font-bold' : 'text-text-muted'
                        }`}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={openManageHabits}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-raised transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Layers size={16} />
                </div>
                <div>
                  <span className="text-xs font-medium text-text block">Gestionar Hábitos</span>
                  <span className="text-[10px] text-text-muted">Editar, revisar o eliminar catálogo</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--accent)] font-medium">{habitos.length} hábitos</span>
                <ChevronRight size={16} className="text-text-muted group-hover:text-text transition-colors" />
              </div>
            </button>

            <button
              type="button"
              onClick={openOnboarding}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-raised transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <span className="text-xs font-medium text-text block">Ver introducción de nuevo</span>
                  <span className="text-[10px] text-text-muted">Repasar la guía de bienvenida</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-text-muted group-hover:text-text transition-colors" />
            </button>
          </div>
        </section>

        {/* === ZONA 4: DATOS Y RESPALDO === */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold font-heading text-text px-0.5">
            Datos y respaldo
          </h3>

          <div className="rounded-[16px] bg-surface border border-line divide-y divide-[var(--line)] overflow-hidden shadow-lg shadow-black/20">
            {/* Exportar datos */}
            <button
              id="profile-export-backup-btn"
              type="button"
              onClick={exportarDatos}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-raised transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-ambar/15 text-ambar flex items-center justify-center shrink-0">
                  <Download size={16} />
                </div>
                <div>
                  <span className="text-xs font-medium text-text block">Exportar datos</span>
                  <span className="text-[10px] text-text-muted">
                    Descarga un archivo .json con tus hábitos y registros
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium text-ambar bg-ambar/10 px-2.5 py-1 rounded-lg border border-ambar/30 group-hover:bg-ambar/20 transition-colors">
                Descargar .json
              </span>
            </button>

            {/* Importar datos */}
            <button
              id="profile-import-backup-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-raised transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Upload size={16} />
                </div>
                <div>
                  <span className="text-xs font-medium text-text block">Importar datos</span>
                  <span className="text-[10px] text-text-muted">
                    Restaura tu información desde un archivo .json de respaldo
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accent-10)] px-2.5 py-1 rounded-lg border border-[var(--accent-30)] group-hover:bg-[var(--accent-20)] transition-colors">
                Cargar archivo
              </span>
            </button>

            {/* Estado de persistencia local */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
                  <Shield size={16} />
                </div>
                <div>
                  <span className="text-xs font-medium text-text block">Persistencia Local</span>
                  <span className="text-[10px] text-text-muted">Almacenamiento seguro en navegador</span>
                </div>
              </div>
              <span className="text-xs text-ambar font-medium">Activa</span>
            </div>
          </div>
        </section>

        {/* === ZONA 5: ZONA DE PELIGRO === */}
        <section className="space-y-3 pt-1">
          <h3 className="text-sm font-semibold font-heading text-danger px-0.5">
            Zona de peligro
          </h3>

          <div className="rounded-[16px] bg-surface border border-danger/25 overflow-hidden shadow-lg shadow-black/20">
            <button
              id="profile-reset-data-btn"
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar todos los hábitos y registros de Racha? Esta acción no se puede deshacer.')) {
                  reiniciarTodo();
                  showNotification('success', 'Almacenamiento local reiniciado.');
                }
              }}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-danger/10 transition-colors group"
            >
              <div className="flex items-center gap-3 text-danger">
                <div className="w-8 h-8 rounded-xl bg-danger/15 text-danger flex items-center justify-center shrink-0">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <span className="text-xs font-medium text-text block">Reiniciar Almacenamiento</span>
                  <span className="text-[10px] text-text-muted">Limpiar todos los datos locales</span>
                </div>
              </div>
              <span className="text-xs font-medium text-danger bg-danger/10 px-2.5 py-1 rounded-lg border border-danger/30 group-hover:bg-danger/20 transition-colors">
                Reiniciar
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />

      {/* Confirmation Modal for Data Import */}
      {importPendingData && (
        <div
          id="import-confirmation-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setImportPendingData(null)}
        >
          <div
            id="import-confirmation-card"
            className="w-full max-w-[360px] bg-bg border border-line rounded-[28px] p-6 shadow-2xl relative text-center space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-ambar/15 border border-ambar/30 text-ambar flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-heading text-text">
                ¿Restaurar copia de seguridad?
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Esto reemplazará tus datos actuales con la copia seleccionada:
              </p>
            </div>

            <div className="p-3.5 rounded-[14px] bg-surface border border-line text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-text-muted">
                <span>Archivo:</span>
                <span className="text-text truncate max-w-[170px]">
                  {importPendingData.fileName}
                </span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Hábitos a cargar:</span>
                <span className="text-[var(--accent)] font-bold">
                  {importPendingData.data.habitos?.length || 0}
                </span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Registros a cargar:</span>
                <span className="text-ambar font-bold">
                  {importPendingData.data.registros?.length || 0}
                </span>
              </div>
              {Array.isArray(importPendingData.data.rutinas) && importPendingData.data.rutinas.length > 0 && (
                <div className="flex justify-between text-text-muted">
                  <span>Rutinas a cargar:</span>
                  <span className="text-[#60A5FA] font-bold">
                    {importPendingData.data.rutinas.length}
                  </span>
                </div>
              )}
              {Array.isArray(importPendingData.data.tareas) && importPendingData.data.tareas.length > 0 && (
                <div className="flex justify-between text-text-muted">
                  <span>Tareas a cargar:</span>
                  <span className="text-ambar font-bold">
                    {importPendingData.data.tareas.length}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setImportPendingData(null)}
                className="py-2.5 px-4 rounded-[12px] bg-surface-raised hover:bg-surface-raised text-text-muted hover:text-text text-xs font-semibold font-heading transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="py-2.5 px-4 rounded-[12px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-text text-xs font-semibold font-heading shadow-lg shadow-[var(--accent-30)] transition-all active:scale-95"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
