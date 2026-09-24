import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Download,
  Upload,
  RefreshCw,
  Flame,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Lock,
  AlertTriangle,
  X,
  Palette,
  Award,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Trophy,
  Crown,
  Pencil
} from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { useTheme } from '../../store/ThemeContext';
import { calcularInsignias, InsigniaDef } from '../../utils/badgeUtils';
import { BadgeDetailModal } from '../badges/BadgeDetailModal';
import { TEMAS } from '../../types';
import { getTodayString, ETAPAS } from '../../utils/habitUtils';
import { Llama } from '../juego/Llama';

// Componente para la hoja modal del nombre
const NameModal = ({
  nombreActual,
  onClose,
  onSave
}: {
  nombreActual: string;
  onClose: () => void;
  onSave: (nombre: string) => void;
}) => {
  const [val, setVal] = useState(nombreActual);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed left-0 right-0 bottom-0 max-h-[78%] flex flex-col bg-surface rounded-t-[22px] border-t border-line shadow-2xl z-50 animate-slideUp" role="dialog" aria-modal="true" aria-labelledby="name-modal-title">
        <div className="w-10 h-1.5 rounded-full bg-line-strong mx-auto mt-2 shrink-0" />
        <div className="flex items-start gap-3 p-3 px-5 border-b border-line">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-surface-raised text-text-muted flex items-center justify-center shrink-0 border-none cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 id="name-modal-title" className="m-0 text-[22px] font-heading font-bold text-text">Cómo te llamas</h2>
            <p id="name-modal-desc" className="m-0 text-[13px] text-text-muted leading-snug mt-0.5">Para personalizar tu perfil</p>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(val.trim()); onClose(); }} className="p-5 pt-3 border-t border-line mt-auto">
          <label className="block text-[13px] font-semibold text-text-muted mb-1.5" htmlFor="nn">
            Tu nombre o apodo
          </label>
          <input
            type="text"
            id="nn"
            className="w-full min-h-[48px] px-3.5 rounded-xl border-[1.5px] border-lila-text bg-surface text-text font-sans text-base outline-none"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
            autoComplete="nickname"
            maxLength={24}
            aria-describedby="name-modal-desc"
          />
          <button
            type="submit"
            className="mt-4 w-full min-h-[48px] px-5 rounded-xl bg-ambar text-ink text-[15px] font-bold flex items-center justify-center border-none cursor-pointer"
          >
            Guardar nombre
          </button>
          {nombreActual && (
            <button
              type="button"
              onClick={() => { onSave(''); onClose(); }}
              className="mt-1 w-full min-h-[44px] px-5 bg-transparent text-text-muted text-[15px] font-medium flex items-center justify-center border-none cursor-pointer"
            >
              Borrar nombre
            </button>
          )}
        </form>
      </div>
    </>
  );
};

const AlertSheet = ({ title, desc, onPrimary, primaryText, onDanger, dangerText, onClose }: any) => (
  <>
    <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} />
    <div className="fixed left-0 right-0 bottom-0 max-h-[78%] flex flex-col bg-bg rounded-t-[22px] border-t border-line shadow-2xl z-50 animate-slideUp" role="alertdialog" aria-modal="true" aria-labelledby="alert-title">
      <div className="w-10 h-1.5 rounded-full bg-line-strong mx-auto mt-2 shrink-0" />
      <div className="flex justify-end p-2 px-3 pb-0">
        <button onClick={onClose} className="w-11 h-11 rounded-full text-text-muted flex items-center justify-center border-none bg-transparent cursor-pointer">
          <X size={24} />
        </button>
      </div>
      <div className="px-6 pb-6 text-center">
        <h2 id="alert-title" className="m-0 text-[24px] font-heading font-bold text-text">{title}</h2>
        <p className="m-0 mt-3 text-[14px] text-text-muted leading-relaxed">{desc}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button onClick={onPrimary} className="w-full min-h-[48px] rounded-[14px] bg-surface text-text border border-line text-[15px] font-bold cursor-pointer">{primaryText}</button>
          <button onClick={onDanger} className="w-full min-h-[48px] rounded-[14px] bg-transparent text-danger border-[1.5px] border-danger text-[15px] font-bold cursor-pointer">{dangerText}</button>
          <button onClick={onClose} className="w-full min-h-[48px] rounded-[14px] bg-transparent text-text-muted border-none text-[15px] font-bold cursor-pointer mt-1">Cancelar</button>
        </div>
      </div>
    </div>
  </>
);

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
    puntosTotales,
    nivelActual,
    progresoNivel,
    etapaLlama
  } = useHabitStore();
  
  const { nombre, setNombre, acento, setAcento, apariencia, setApariencia } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBadge, setSelectedBadge] = useState<InsigniaDef | null>(null);
  const [importPendingData, setImportPendingData] = useState<{
    data: any;
    fileName: string;
    fecha: string;
    habitos: number;
    registros: number;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const vecesCumplidas = registros.filter((r) => r.completado).length;

  // Escape cierra la hoja que esté abierta
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setShowNameModal(false);
      setShowDeleteConfirm(false);
      setShowAllBadges(false);
      setImportPendingData(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const totalCompletados = registros.filter((r) => r.completado).length;
  const globalStreak = rachaGlobal();
  const maxHabitStreak = mejorRachaGlobalHabitos();

  // Fecha de inicio
  const primerRegistro = registros.length > 0 ? registros.reduce((min, r) => r.fecha < min.fecha ? r : min, registros[0]) : null;
  const startDateStr = primerRegistro ? primerRegistro.fecha : new Date().toISOString().split('T')[0];
  const startDateFormatted = new Date(startDateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  const isRecent = registros.length === 0;

  // Nivel del perfil
  const ptosMeta = progresoNivel.actual + progresoNivel.meta;
  const levelProgressPercent = Math.round((progresoNivel.actual / ptosMeta) * 100);

  const currentStageIndex = etapaLlama - 1;
  const lvlName = ETAPAS[currentStageIndex].nombre;
  
  let startIndex = Math.max(0, Math.min(currentStageIndex - 1, ETAPAS.length - 5));
  const stagesToShow = ETAPAS.slice(startIndex, startIndex + 5).map((stg, idx) => {
    const realIdx = startIndex + idx;
    return {
      lvl: stg.nivel,
      name: stg.nombre,
      etapa: realIdx + 1,
      isPast: realIdx < currentStageIndex,
      isNow: realIdx === currentStageIndex,
      isNext: realIdx > currentStageIndex
    };
  });
  const nextStageLevel = currentStageIndex < ETAPAS.length - 1 ? ETAPAS[currentStageIndex + 1].nivel : null;

  // Insignias dinámicas
  const insignias = calcularInsignias(habitos, registros, maxHabitStreak, globalStreak);
  const totalDesbloqueadas = insignias.filter((b) => b.desbloqueada).length;
  const lockedInsignias = insignias.filter(b => !b.desbloqueada && b.categoria !== 'racha');
  const nextBadge = lockedInsignias.length > 0 ? lockedInsignias.reduce((max, badge) => (badge.progresoActual / badge.meta > max.progresoActual / max.meta ? badge : max), lockedInsignias[0]) : null;

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
          showNotification('error', 'El archivo no tiene el formato de respaldo de Racha.');
          return;
        }
        const hCount = parsed.habitos?.length || 0;
        const rCount = Array.isArray(parsed.registros) ? parsed.registros.filter((r: { completado?: boolean }) => r && r.completado).length : 0;
        let exportDate = 'desconocida';
        if (parsed.exportedAt) {
          const d = new Date(parsed.exportedAt);
          exportDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' });
        }
        setImportPendingData({ data: parsed, fileName: file.name, fecha: exportDate, habitos: hCount, registros: rCount });
      } catch (err) {
        showNotification('error', 'No se pudo leer el archivo JSON.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => showNotification('error', 'Error al abrir el archivo.');
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!importPendingData) return;
    const result = importarDatos(importPendingData.data);
    if (result.success) {
      showNotification('success', `¡Copia restaurada!`);
    } else {
      showNotification('error', result.error || 'Error al importar datos.');
    }
    setImportPendingData(null);
  };

  const renderBadgeIcon = (iconName: string) => {
    const size = 20;
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Shield': return <Shield size={size} />;
      case 'Award': return <Award size={size} />;
      case 'Layers': return <Layers size={size} />;
      case 'Trophy': return <Trophy size={size} />;
      case 'Crown': return <Crown size={size} />;
      default: return <Award size={size} />;
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 min-h-screen">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] px-4 animate-slideDown">
          <div
            className={`p-3.5 rounded-[16px] border flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-surface/95 border-ambar-text text-ambar-text'
                : 'bg-surface/95 border-danger/50 text-danger'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span className="text-text">{notification.message}</span>
            </div>
            <button type="button" onClick={() => setNotification(null)} className="text-text-muted cursor-pointer bg-transparent border-none">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Header Profile */}
      <h1 className="font-heading font-bold text-[44px] leading-none m-0 text-text">Perfil</h1>
      
      {/* Identity Card */}
      <section className="mt-4 p-3.5 rounded-[18px] bg-surface border border-line" aria-label="Tu identidad">
        <div className="flex items-center gap-3.5">
          <span className="w-14 h-14 rounded-full bg-surface-raised text-text flex items-center justify-center shrink-0">
            {nombre ? (
              <span className="font-heading font-bold text-[28px] leading-none uppercase">{nombre.charAt(0)}</span>
            ) : (
              <User size={24} strokeWidth={2} />
            )}
          </span>
          <div className="flex-1 min-w-0">
            {nombre ? (
              <p className="m-0 font-heading font-bold text-[28px] leading-[1.05] text-text truncate">{nombre}</p>
            ) : (
              <p className="m-0 font-heading font-bold text-[28px] leading-[1.05] text-text-muted truncate">Sin nombre</p>
            )}
            <p className="m-0 text-[13px] text-text-muted mt-0.5">
              {isRecent ? 'Empezaste hace poco' : `Desde el ${startDateFormatted}`}
            </p>
          </div>
          <button
            onClick={() => setShowNameModal(true)}
            className="w-11 h-11 rounded-xl border border-line bg-surface text-text flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Cambiar tu nombre"
          >
            <Pencil size={18} strokeWidth={2} />
          </button>
        </div>
      </section>

      {/* Tu llama card */}
      <section className="mt-4 flamecard p-3.5 rounded-[18px] bg-surface border border-line" aria-labelledby="tl9">
        <div className="flamehero">
          <Llama etapa={etapaLlama} size={96} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="sub m-0 font-medium text-[15px]" id="tl9">Tu llama</h2>
          <p className="cond m-0 mt-0.5 font-bold text-[28px] leading-[1.05]">{lvlName}</p>
          <p className="sub m-0 mt-0.5">Nivel {nivelActual}</p>
        </div>
        <div className="flamefoot">
           <div className="flex justify-between items-baseline"><span className="sub text-[13px] text-text-muted">Para el nivel {nivelActual + 1}</span><span className="sub text-[13px] text-text-muted font-number">{progresoNivel.actual} / {ptosMeta} puntos</span></div>
           <i className="lvltrack" aria-hidden="true"><b style={{ width: `${levelProgressPercent}%` }}></b></i>
           
           <ol className="stages list-none p-0">
              {stagesToShow.map(stg => (
                <li key={stg.lvl} className={stg.isPast ? 'past' : stg.isNow ? 'now' : 'next'} aria-current={stg.isNow ? 'step' : undefined}>
                  <span className="stg-ic">
                    {stg.isPast || stg.isNow ? (
                      <Llama etapa={stg.etapa} size={40} />
                    ) : (
                      <span className="q font-heading font-bold text-[18px] text-text-muted" aria-hidden="true">?</span>
                    )}
                  </span>
                  <span className={`stg-n text-[12px] font-semibold text-center ${stg.isNow ? 'text-text font-bold' : 'text-text-muted'}`}>
                    {stg.isPast || stg.isNow ? stg.name : `Nivel ${stg.lvl}`}
                  </span>
                  <span className="sr">{stg.isPast ? ', superada' : stg.isNow ? ', tu etapa' : ', por descubrir'}</span>
                </li>
              ))}
           </ol>
           {nextStageLevel && (
             <p className="sub m-0 mt-2.5 text-[13px] text-text-muted">Tu llama cambia de nuevo en el nivel {nextStageLevel}. Nunca se apaga.</p>
           )}
           {!nextStageLevel && (
             <p className="sub m-0 mt-2.5 text-[13px] text-text-muted">Tu llama nunca se apaga.</p>
           )}
        </div>
      </section>

      {/* Insignias */}
      <section className="mt-[26px]">
        <div className="flex items-baseline justify-between gap-2.5">
          <h2 className="m-0 font-heading font-bold text-[22px] text-text">Insignias</h2>
          <span className="text-[13px] text-text-muted">{totalDesbloqueadas} de {insignias.length}</span>
        </div>
        
        <ul className="list-none m-0 p-0 mt-3 grid grid-cols-3 gap-2.5">
          {insignias.slice(0, 3).map(badge => (
            <li key={badge.id} className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] bg-surface border border-line cursor-pointer" onClick={() => setSelectedBadge(badge)}>
              <span className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.desbloqueada ? 'bg-[var(--accent-tint)] text-[var(--accent-text)]' : 'bg-surface-raised text-text-muted'}`}>
                {renderBadgeIcon(badge.icono)}
              </span>
              <span className={`text-[13px] font-semibold text-center ${badge.desbloqueada ? 'text-text' : 'text-text-muted'}`}>{badge.nombre}</span>
            </li>
          ))}
        </ul>

        {nextBadge && (
          <div className="flex gap-3 items-start mt-3.5 cursor-pointer" onClick={() => setSelectedBadge(nextBadge)}>
            <span className="w-[38px] h-[38px] rounded-[11px] bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
              {renderBadgeIcon(nextBadge.icono)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="block text-[15px] font-semibold text-text truncate">Próxima: {nextBadge.nombre}</span>
                <span className="text-[13px] text-text-muted shrink-0">faltan {nextBadge.meta - nextBadge.progresoActual}</span>
              </div>
              <span className="block text-[13px] text-text-muted mt-px">{nextBadge.requisito} · esta barra nunca baja</span>
              <div className="block w-full h-2 rounded-full bg-track-empty overflow-hidden mt-2 shrink-0">
                <b className="block h-full rounded-full bg-[var(--accent-text)]" style={{ width: `${Math.min(100, (nextBadge.progresoActual / nextBadge.meta) * 100)}%` }}></b>
              </div>
            </div>
          </div>
        )}
        
        <button onClick={() => setShowAllBadges(true)} className="w-full min-h-[48px] flex items-center justify-between border-t border-line text-text text-[15px] font-semibold bg-transparent border-none mt-2 p-0 cursor-pointer">
          Ver todas las insignias
          <span className="text-text-muted flex shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </button>
      </section>

      {/* Tus hábitos */}
      <section className="mt-[26px]">
        <h2 className="m-0 font-heading font-bold text-[22px] text-text">Tus hábitos</h2>
        <div className="flex items-center gap-1.5 py-1.5 border-b border-line">
          <button onClick={openManageHabits} className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] p-0 border-none bg-transparent text-left cursor-pointer">
            <span className="w-[36px] h-[36px] rounded-[10px] bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-text truncate">Gestionar hábitos</span>
              <span className="block text-[13px] text-text-muted mt-px">
                {habitos.filter(h => !h.archivado).length} activos
                {habitos.filter(h => h.archivado).length > 0 ? ` · ${habitos.filter(h => h.archivado).length} archivado${habitos.filter(h => h.archivado).length === 1 ? '' : 's'}` : ''}
              </span>
            </span>
            <span className="text-text-muted flex shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </span>
          </button>
        </div>
      </section>

      {/* Apariencia */}
      <section className="mt-[26px]">
        <h2 className="m-0 font-heading font-bold text-[22px] text-text" id="ap2">Apariencia</h2>
        <div className="grid grid-cols-3 gap-1 mt-3 p-1 rounded-[14px] bg-surface border border-line" role="radiogroup" aria-labelledby="ap2">
          {(['auto', 'claro', 'oscuro'] as const).map(op => (
            <label key={op} className="relative block cursor-pointer">
              <input type="radio" name="apariencia" checked={apariencia === op} onChange={() => setApariencia(op)} className="absolute w-px h-px opacity-0 overflow-hidden" />
              <span className={`min-h-[44px] flex items-center justify-center rounded-[10px] text-[14px] ${apariencia === op ? 'bg-surface-raised text-text font-bold shadow-[inset_0_0_0_1.5px_var(--text)]' : 'text-text-muted font-semibold'}`}>
                {op === 'auto' ? 'Automático' : op === 'claro' ? 'Claro' : 'Oscuro'}
              </span>
            </label>
          ))}
        </div>
        <p className="m-0 mt-2 text-[13px] text-text-muted">Automático sigue el modo de tu celular.</p>

        <h3 className="m-0 mt-4.5 text-[13px] font-semibold text-text-muted" id="co2">Color de tus logros</h3>
        <div className="grid grid-cols-4 gap-2 mt-2.5" role="radiogroup" aria-labelledby="co2">
          {TEMAS.map(t => (
            <label key={t.key} className="relative block cursor-pointer">
              <input type="radio" name="acento" checked={acento === t.key} onChange={() => setAcento(t.key as any)} className="absolute w-px h-px opacity-0 overflow-hidden" />
              <span className={`min-h-[76px] p-2.5 px-1.5 flex flex-col items-center justify-center gap-2 rounded-[14px] border ${acento === t.key ? 'border-[1.5px] border-text text-text font-bold bg-surface' : 'border-line bg-surface text-text-muted font-semibold'} text-[13px]`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: `var(--sw-${t.key})`, color: acento === t.key ? 'var(--ink)' : 'transparent', boxShadow: `inset 0 0 0 1.5px var(--sw-${t.key}-ring)` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <span>{t.label}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="m-0 mt-2 text-[13px] text-text-muted">Pinta lo que ya cumpliste: días completos, hábitos marcados y el botón Crear.</p>
      </section>

      {/* Tus datos */}
      <section className="mt-[26px]">
        <h2 className="m-0 font-heading font-bold text-[22px] text-text">Tus datos</h2>
        <p className="flex gap-2.5 items-start m-0 mt-2.5 p-3 rounded-[12px] bg-surface border border-line text-[14px] leading-[1.45] text-text-muted">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
          <span>Tus datos viven solo en este celular. Guarda una copia de vez en cuando para no perderlos si cambias de celular o borras el navegador.</span>
        </p>

        <div className="flex items-center gap-1.5 py-1.5 border-b border-line mt-2">
          <button onClick={exportarDatos} className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] p-0 border-none bg-transparent text-left cursor-pointer">
            <span className="w-[36px] h-[36px] rounded-[10px] bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-text truncate">Guardar una copia</span>
              <span className="block text-[13px] text-text-muted mt-px">
                {(() => {
                  const savedStr = localStorage.getItem('racha_ultima_copia');
                  if (!savedStr) return 'Se descarga un archivo · aún no guardas ninguna';
                  if (savedStr === getTodayString()) return 'Se descarga un archivo · la última, hoy';
                  const d1 = new Date(savedStr);
                  const d2 = new Date(getTodayString());
                  const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
                  return `Se descarga un archivo · la última, hace ${diff} día${diff === 1 ? '' : 's'}`;
                })()}
              </span>
            </span>
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 py-1.5 border-b border-line">
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] p-0 border-none bg-transparent text-left cursor-pointer">
            <span className="w-[36px] h-[36px] rounded-[10px] bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-text truncate">Recuperar una copia</span>
              <span className="block text-[13px] text-text-muted mt-px">Reemplaza lo que tienes ahora</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 py-1.5 border-b border-line">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] p-0 border-none bg-transparent text-left cursor-pointer"
          >
            <span className="w-[36px] h-[36px] rounded-[10px] bg-surface-raised text-danger flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-danger truncate">Borrar todos los datos</span>
              <span className="block text-[13px] text-text-muted mt-px">No se puede deshacer</span>
            </span>
          </button>
        </div>
      </section>

      {/* Ayuda */}
      <section className="mt-[26px]">
        <h2 className="m-0 font-heading font-bold text-[22px] text-text">Ayuda</h2>
        <div className="flex items-center gap-1.5 py-1.5">
          <button onClick={openOnboarding} className="flex-1 min-w-0 flex items-center gap-3 min-h-[52px] p-0 border-none bg-transparent text-left cursor-pointer">
            <span className="w-[36px] h-[36px] rounded-[10px] bg-surface-raised text-text-muted flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-text truncate">Cómo funciona Racha</span>
              <span className="block text-[13px] text-text-muted mt-px">La guía del inicio, cuando quieras</span>
            </span>
            <span className="text-text-muted flex shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </span>
          </button>
        </div>
      </section>

      {/* Modals */}
      <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      {showNameModal && <NameModal nombreActual={nombre} onClose={() => setShowNameModal(false)} onSave={setNombre} />}
      
      {showDeleteConfirm && (
        <AlertSheet 
          title="¿Borrar todos tus datos?"
          desc={`Se borran tus ${habitos.length} hábitos, ${vecesCumplidas} veces cumplidas, tus insignias y tu nivel. No se puede deshacer.`}
          primaryText="Guardar una copia primero"
          onPrimary={exportarDatos}
          dangerText="Borrar todo"
          onDanger={() => { reiniciarTodo(); setShowDeleteConfirm(false); showNotification('success', 'Datos borrados'); }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}

      {importPendingData && (
        <AlertSheet 
          title="¿Reemplazar tus datos?"
          desc={`La copia del ${importPendingData.fecha} tiene ${importPendingData.habitos} hábitos y ${importPendingData.registros} veces cumplidas. Lo que tienes ahora (${habitos.length} hábitos, ${vecesCumplidas} veces cumplidas) se reemplaza${importPendingData.registros < vecesCumplidas ? ` y perderías ${vecesCumplidas - importPendingData.registros} veces cumplidas` : ''}.`}
          primaryText="Guardar lo de ahora primero"
          onPrimary={exportarDatos}
          dangerText="Reemplazar"
          onDanger={confirmImport}
          onClose={() => setImportPendingData(null)}
        />
      )}

      {showAllBadges && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={() => setShowAllBadges(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="todas-insignias-t" className="fixed left-0 right-0 bottom-0 max-h-[85%] flex flex-col bg-bg rounded-t-[22px] border-t border-line shadow-2xl z-50 animate-slideUp">
            <div className="w-10 h-1.5 rounded-full bg-line-strong mx-auto mt-2 shrink-0" />
            <div className="flex items-start justify-between p-3 px-5 border-b border-line">
              <h2 id="todas-insignias-t" className="m-0 text-[22px] font-heading font-bold text-text pt-1">Todas las insignias</h2>
              <button aria-label="Cerrar" onClick={() => setShowAllBadges(false)} className="w-11 h-11 rounded-full bg-surface-raised text-text-muted flex items-center justify-center shrink-0 border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-2">
                {insignias.map(badge => (
                  <div key={badge.id} className="flex gap-3 items-center p-3 rounded-[14px] bg-surface border border-line">
                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${badge.desbloqueada ? 'bg-[var(--accent-tint)] text-[var(--accent-text)]' : 'bg-surface-raised text-text-muted'}`}>
                      {renderBadgeIcon(badge.icono)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`m-0 text-[15px] font-semibold truncate ${badge.desbloqueada ? 'text-text' : 'text-text-muted'}`}>{badge.nombre}</p>
                      <p className="m-0 text-[13px] text-text-muted">{badge.requisito}</p>
                    </div>
                    <div className="shrink-0 text-right text-[13px] font-semibold">
                      {badge.desbloqueada ? (
                        <span className="text-[var(--accent-text)]">Conseguida</span>
                      ) : (
                        <span className="text-text-muted">faltan {badge.meta - badge.progresoActual}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
