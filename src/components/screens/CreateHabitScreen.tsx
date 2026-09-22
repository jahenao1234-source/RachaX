import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Check, Edit3, Target, CheckCircle2, Archive, Plus } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { Habito, MomentoDia, FrecuenciaHabito, ICONOS_DISPONIBLES, MOMENTOS, CATEGORIAS, PLANTILLAS_HABITOS } from '../../types';
import { HabitIcon } from '../common/HabitIcon';
import { HabitPreviewRow, getMomentoColorTokens } from '../common/HabitPreviewRow';
import { getTodayString, semanasEstimadasReto, contarProgresoReto } from '../../utils/habitUtils';

const DIAS_CORTOS = [
  { index: 1, label: 'L', full: 'Lunes' },
  { index: 2, label: 'M', full: 'Martes' },
  { index: 3, label: 'X', full: 'Miércoles' },
  { index: 4, label: 'J', full: 'Jueves' },
  { index: 5, label: 'V', full: 'Viernes' },
  { index: 6, label: 'S', full: 'Sábado' },
  { index: 0, label: 'D', full: 'Domingo' },
];

export const ConfirmDiscardModal: React.FC<{ onContinue: () => void; onDiscard: () => void }> = ({ onContinue, onDiscard }) => (
  <div className="fixed inset-0 z-[70] flex flex-col justify-end pointer-events-auto">
    <div className="absolute inset-0 bg-black/60" onClick={onContinue} />
    <section className="relative w-full max-w-[600px] mx-auto bg-bg rounded-t-[22px] p-5 pb-8 shadow-2xl animate-slideUp">
      <h2 className="font-heading font-bold text-xl text-text mb-2">¿Descartar los cambios?</h2>
      <p className="text-[14px] text-text-muted mb-6">Lo que escribiste no se guardará.</p>
      <div className="flex gap-3">
        <button onClick={onContinue} className="flex-1 h-12 rounded-xl bg-surface-raised border border-line text-text font-semibold transition-colors hover:bg-surface">
          Seguir editando
        </button>
        <button onClick={onDiscard} className="flex-1 h-12 rounded-xl bg-transparent border border-danger text-danger font-bold transition-colors hover:bg-danger/10">
          Descartar
        </button>
      </div>
    </section>
  </div>
);

export const CreateHabitScreen: React.FC = () => {
  const { 
    habitBeingEdited, 
    crearHabito, 
    editarHabito, 
    closeCreateModal, 
    cancelEditHabit,
    archivarHabito,
    setHabitoRecienCreadoId,
    registros
  } = useHabitStore();

  const isEditing = Boolean(habitBeingEdited);
  const h = habitBeingEdited;

  // Form State
  const [nombre, setNombre] = useState(h?.nombre || '');
  const [icono, setIcono] = useState(h?.icono || 'Target');
  const [tipo, setTipo] = useState<'positivo'|'negativo'>(h?.tipo || 'positivo');
  const [momento, setMomento] = useState<MomentoDia>(h?.momento || 'flexible');
  const [anclaje, setAnclaje] = useState(h?.anclaje || '');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaHabito>(h?.frecuencia || 'diario');
  const [diasPersonalizados, setDiasPersonalizados] = useState<number[]>(h?.diasPersonalizados || [1,2,3,4,5]);
  const [vecesPorSemana, setVecesPorSemana] = useState<number>(h?.vecesPorSemana || 3);
  
  const [showMeta, setShowMeta] = useState(!!h?.metaDiaria);
  const [metaDiaria, setMetaDiaria] = useState<number>(h?.metaDiaria || 8);
  
  const [reto, setReto] = useState<number | null>(h?.reto?.meta || null);
  const [categoria, setCategoria] = useState<string | undefined>(h?.categoria);

  const [isSelectingIcon, setIsSelectingIcon] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showMore, setShowMore] = useState(!!h?.categoria);

  // Suggestions logic
  const getSuggestions = () => {
    if (tipo === 'positivo') {
      if (momento === 'manana') return ['despertarme', 'tomar café', 'bañarme'];
      if (momento === 'tarde') return ['almorzar', 'salir del trabajo', 'llegar a casa'];
      if (momento === 'noche') return ['cenar', 'lavarme los dientes', 'acostarme'];
      return ['despertarme', 'almorzar', 'cenar'];
    } else {
      if (momento === 'manana') return ['me despierte', 'tome el celular', 'salga de casa'];
      if (momento === 'tarde') return ['me siente a trabajar', 'me aburra', 'termine de almorzar'];
      if (momento === 'noche') return ['me acueste', 'esté en el sofá', 'termine de cenar'];
      return ['me aburra', 'esté cansado', 'me estrese'];
    }
  };

  const hasChanges = () => {
    if (!h) return !!nombre.trim() || icono !== 'Target' || tipo !== 'positivo' || momento !== 'flexible';
    const arrEqual = (a: number[], b: number[]) => a.length === b.length && a.every((v,i) => v === b[i]);
    
    const metaA = (showMeta ? metaDiaria : undefined) ?? null;
    const metaB = h.metaDiaria ?? null;

    return nombre !== h.nombre ||
      icono !== h.icono ||
      tipo !== (h.tipo || 'positivo') ||
      momento !== (h.momento || 'flexible') ||
      anclaje !== (h.anclaje || '') ||
      frecuencia !== h.frecuencia ||
      (frecuencia === 'personalizado' && !arrEqual(diasPersonalizados, h.diasPersonalizados || [])) ||
      (frecuencia === 'semanal' && vecesPorSemana !== (h.vecesPorSemana || 3)) ||
      metaA !== metaB ||
      reto !== (h.reto?.meta || null) ||
      categoria !== h.categoria;
  };

  const getChangesList = () => {
    if (!h) return [];
    const list: string[] = [];
    const arrEqual = (a: number[], b: number[]) => a.length === b.length && a.every((v,i) => v === b[i]);
    const metaA = (showMeta ? metaDiaria : undefined) ?? null;
    const metaB = h.metaDiaria ?? null;

    if (nombre !== h.nombre) list.push('el nombre');
    if (icono !== h.icono) list.push('el ícono');
    if (tipo !== (h.tipo || 'positivo')) list.push('el tipo');
    if (momento !== (h.momento || 'flexible')) list.push('el momento');
    if (anclaje !== (h.anclaje || '')) list.push('el anclaje');
    
    if (frecuencia !== h.frecuencia || 
        (frecuencia === 'personalizado' && !arrEqual(diasPersonalizados, h.diasPersonalizados || [])) || 
        (frecuencia === 'semanal' && vecesPorSemana !== (h.vecesPorSemana || 3))) {
      list.push('la frecuencia');
    }
    
    if (metaA !== metaB) list.push('la meta');
    if (reto !== (h.reto?.meta || null)) list.push('el reto');
    if (categoria !== h.categoria) list.push('la categoría');
    return list;
  };

  const handleClose = () => {
    if (hasChanges()) {
      setShowDiscard(true);
    } else {
      if (isEditing) cancelEditHabit();
      else closeCreateModal();
    }
  };

  const handleDiscard = () => {
    setShowDiscard(false);
    if (isEditing) cancelEditHabit();
    else closeCreateModal();
  };

  const onSubmit = () => {
    if (!nombre.trim()) return;

    const finalAnclaje = anclaje.trim() || undefined;
    const finalMeta = (showMeta && tipo !== 'negativo') ? metaDiaria : undefined;
    
    const payload: Partial<Habito> = {
      nombre: nombre.trim(),
      icono,
      tipo,
      momento,
      anclaje: finalAnclaje,
      frecuencia,
      diasPersonalizados: frecuencia === 'personalizado' ? diasPersonalizados : undefined,
      vecesPorSemana: frecuencia === 'semanal' ? vecesPorSemana : undefined,
      metaDiaria: finalMeta,
      categoria,
      reto: reto ? { meta: reto, inicio: h?.reto?.inicio || getTodayString() } : undefined,
    };

    if (isEditing && h) {
      // Preserve recordatorio if it exists
      if (h.recordatorio) payload.recordatorio = h.recordatorio;
      editarHabito(h.id, payload);
      cancelEditHabit();
    } else {
      const nuevo = crearHabito(payload as any);
      setHabitoRecienCreadoId(nuevo.id);
    }
  };

  const toggleDia = (d: number) => {
    setDiasPersonalizados(prev => {
      let next = [...prev];
      if (next.includes(d)) {
        if (next.length > 1) next = next.filter(x => x !== d);
      } else {
        next.push(d);
        next.sort();
      }
      
      // Auto-switch rules
      if (next.length === 7) setFrecuencia('diario');
      else if (next.length === 5 && next.includes(1) && next.includes(2) && next.includes(3) && next.includes(4) && next.includes(5)) {
        setFrecuencia('entreSemana');
      }
      return next;
    });
  };

  const applyTemplate = (t: typeof PLANTILLAS_HABITOS[0]) => {
    setNombre(t.nombre);
    setIcono(t.icono);
    setTipo(t.tipo || 'positivo');
    setFrecuencia(t.frecuencia || 'diario');
    setMomento(t.momento || 'flexible');
    if (t.vecesPorSemana) setVecesPorSemana(t.vecesPorSemana);
    if (t.metaDiaria) {
      setShowMeta(true);
      setMetaDiaria(t.metaDiaria);
    } else {
      setShowMeta(false);
    }
    setCategoria(t.categoria);
  };

  const momentoObj = MOMENTOS.find(m => m.id === momento);
  const momentoLabel = momentoObj?.label === 'Todo el día' ? 'Todo el día' : (momentoObj?.label || 'Todo el día');
  const tokens = getMomentoColorTokens(momento);
  const iconName = momentoObj?.icono || 'Sun';

  const formatChanges = (changes: string[]) => {
    if (changes.length === 0) return '';
    if (changes.length === 1) return changes[0];
    const last = changes.pop();
    return changes.join(', ') + ' y ' + last;
  };

  const getRetoHelp = () => {
    if (!reto) return "Ponte un reto y verás una barra llenarse con cada día que lo cumplas.";
    let baseHelp = "";
    if (reto === 66) {
      baseHelp = "En promedio, un hábito tarda unos 66 días en volverse automático, aunque varía mucho entre personas. Cada día que lo cumplas suma y la barra nunca baja.";
    } else if (frecuencia === 'semanal') {
      baseHelp = `Cada semana que cumplas tus ${vecesPorSemana} veces suma. La barra nunca baja.`;
    } else {
      baseHelp = "Cada día que lo cumplas suma. La barra nunca baja.";
    }

    let estimation = "";
    const est = semanasEstimadasReto(reto, frecuencia, diasPersonalizados);
    if (est) {
      if (frecuencia === 'entreSemana') estimation = `Con Lun a vie, son unas ${est} semanas. `;
      if (frecuencia === 'personalizado') estimation = `Con ${diasPersonalizados.length} días por semana, son unas ${est} semanas. `;
    }

    let editingHelp = "";
    if (isEditing && h?.reto) {
      editingHelp = "Si cambias o quitas el reto, no pierdes lo cumplido. ";
    }

    return (
      <span className="text-[13px] text-text-muted mt-2 block leading-snug">
        {editingHelp && <b className="text-text font-semibold">{editingHelp}</b>}
        {estimation && <b className="text-text font-semibold">{estimation}</b>}
        {baseHelp}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex justify-center pointer-events-auto">
      <div className="w-full max-w-[430px] h-full bg-bg relative flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-line bg-bg shrink-0">
          <h1 className="font-heading font-bold text-2xl text-text">
            {isEditing ? 'Editar hábito' : 'Nuevo hábito'}
          </h1>
          <button onClick={handleClose} className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-raised text-text-muted transition-colors active:scale-95">
            <X size={16} strokeWidth={2.4} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-[220px]">
        
        {!isEditing && !nombre && (
          <div className="pt-4 mb-4">
            <p className="text-[13px] font-medium text-text-muted mb-2">Empieza con una idea <span className="font-semibold text-text-muted">o escribe la tuya</span></p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
              {PLANTILLAS_HABITOS.map(t => (
                <button
                  key={t.nombre}
                  onClick={() => applyTemplate(t)}
                  className="flex items-center gap-1.5 h-11 px-3.5 rounded-full border border-line bg-surface text-[13px] font-semibold text-text whitespace-nowrap shrink-0 transition-colors active:bg-surface-raised"
                >
                  <span className="text-text-muted"><HabitIcon name={t.icono} size={15} strokeWidth={2} /></span>
                  {t.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4">
          
          <div>
            <p className="text-[13px] font-medium text-text-muted mb-2">Nombre</p>
            <div className="flex gap-2.5 items-center">
              <button 
                onClick={() => setIsSelectingIcon(true)}
                className={`w-[52px] h-[52px] rounded-[14px] shrink-0 relative flex items-center justify-center ${tokens.bg} ${tokens.icon}`}
                aria-label="Cambiar ícono"
              >
                <HabitIcon name={icono} size={22} strokeWidth={2} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-raised border-2 border-bg flex items-center justify-center text-text">
                  <Edit3 size={10} strokeWidth={2.4} />
                </div>
              </button>
              <input 
                type="text" 
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Salir a caminar"
                className={`flex-1 h-[52px] rounded-[12px] bg-surface border px-3.5 text-[15px] font-semibold text-text focus:outline-none placeholder-text-muted font-medium min-w-0 ${nombre ? 'border-line' : 'border-line-strong'}`}
              />
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium text-text-muted mb-2" id="lbl-tipo">Quiero</p>
            <div className="flex gap-1 p-1 rounded-[12px] bg-surface border border-line" role="radiogroup" aria-labelledby="lbl-tipo">
              <button 
                role="radio" aria-checked={tipo === 'positivo'}
                onClick={() => setTipo('positivo')}
                className={`flex-1 h-11 rounded-[9px] text-[13px] transition-colors ${tipo === 'positivo' ? 'bg-surface-raised text-text font-bold shadow-[inset_0_0_0_1px_var(--text)] opacity-[0.2]' : 'text-text-muted font-semibold hover:bg-surface-raised'}`}
                style={{ boxShadow: tipo === 'positivo' ? 'inset 0 0 0 1px rgba(241,243,245,0.6)' : undefined }} // Approximation for --sel 
              >
                Hacerlo
              </button>
              <button 
                role="radio" aria-checked={tipo === 'negativo'}
                onClick={() => setTipo('negativo')}
                className={`flex-1 h-11 rounded-[9px] text-[13px] transition-colors ${tipo === 'negativo' ? 'bg-surface-raised text-text font-bold shadow-[inset_0_0_0_1px_var(--text)] opacity-[0.2]' : 'text-text-muted font-semibold hover:bg-surface-raised'}`}
                style={{ boxShadow: tipo === 'negativo' ? 'inset 0 0 0 1px rgba(241,243,245,0.6)' : undefined }}
              >
                Evitarlo
              </button>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium text-text-muted mb-2" id="lbl-momento">Momento del día</p>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="lbl-momento">
              {MOMENTOS.map(m => {
                const isActive = momento === m.id;
                const mTokens = getMomentoColorTokens(m.id);
                return (
                  <button
                    key={m.id}
                    role="radio" aria-checked={isActive}
                    onClick={() => setMomento(m.id)}
                    className={`h-16 rounded-[12px] flex flex-col items-center justify-center gap-1.5 transition-colors border ${isActive ? `${mTokens.bg} border-[1.5px]` : 'bg-surface border-line hover:bg-surface-raised'}`}
                    style={{ borderColor: isActive ? 'var(--' + (m.id === 'flexible' ? 'text' : m.id + '-text') + ')' : undefined }}
                  >
                    <span className={mTokens.icon}><HabitIcon name={m.icono} size={20} strokeWidth={2} /></span>
                    <span className={`text-[13px] ${isActive ? 'text-text font-bold' : 'text-text-muted font-semibold'}`}>{m.label === 'Todo el día' ? 'Todo el día' : m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium text-text-muted mb-2">
              {tipo === 'positivo' ? '¿Después de qué?' : '¿Cuándo te cuesta más?'} <span className="font-semibold text-text-muted text-[12px]">opcional</span>
            </p>
            <div className="flex items-center gap-1.5 min-h-[48px] rounded-[12px] bg-surface border border-line px-3.5 focus-within:border-text/60">
              <span className="text-text-muted font-medium text-[15px]">{tipo === 'positivo' ? 'Después de' : 'Cuando'}</span>
              <input 
                type="text" 
                value={anclaje}
                onChange={e => setAnclaje(e.target.value)}
                placeholder={tipo === 'positivo' ? 'algo que ya haces' : 'aparece la tentación'}
                className="flex-1 bg-transparent border-none text-[15px] font-semibold text-text focus:outline-none placeholder-text-muted font-medium min-w-0"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {getSuggestions().map(s => {
                const isSelected = anclaje === s;
                return (
                  <button 
                    key={s} 
                    aria-pressed={isSelected}
                    onClick={() => setAnclaje(s)}
                    className={`px-3.5 h-11 rounded-full text-[13px] border transition-colors ${isSelected ? 'bg-surface-raised border-text/60 text-text font-bold' : 'bg-surface border-line text-text-muted font-semibold hover:bg-surface-raised'}`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            <p className="text-[13px] text-text-muted leading-snug mt-1.5">
              {tipo === 'positivo' ? 'Atarlo a algo que ya haces ayuda a no olvidarlo.' : 'Saber cuándo llega la tentación ayuda a no caer.'}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium text-text-muted mb-2" id="lbl-freq">Frecuencia</p>
            <div className="flex gap-1 p-1 rounded-[12px] bg-surface border border-line overflow-x-auto no-scrollbar" role="radiogroup" aria-labelledby="lbl-freq">
              {[
                { id: 'diario', label: 'Diario' },
                { id: 'entreSemana', label: 'Lun a vie' },
                { id: 'personalizado', label: 'Elegir días' },
                { id: 'semanal', label: 'Por semana' }
              ].map(f => (
                <button 
                  key={f.id}
                  role="radio" aria-checked={frecuencia === f.id}
                  onClick={() => setFrecuencia(f.id as FrecuenciaHabito)}
                  className={`flex-1 min-w-[70px] h-11 px-2 rounded-[9px] text-[13px] transition-colors whitespace-nowrap ${frecuencia === f.id ? 'bg-surface-raised text-text font-bold shadow-[inset_0_0_0_1px_rgba(241,243,245,0.6)]' : 'text-text-muted font-semibold hover:bg-surface-raised'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            
            {frecuencia === 'personalizado' && (
              <div className="grid grid-cols-7 gap-1.5 mt-2.5">
                {DIAS_CORTOS.map((d) => (
                  <button 
                    key={d.index}
                    aria-label={d.full}
                    aria-pressed={diasPersonalizados.includes(d.index)}
                    onClick={() => toggleDia(d.index)}
                    className={`h-11 rounded-[10px] border text-[14px] transition-colors ${diasPersonalizados.includes(d.index) ? 'bg-surface-raised border-text/60 text-text font-bold' : 'bg-transparent border-line text-text-muted font-semibold hover:bg-surface-raised'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
            
            {frecuencia === 'semanal' && (
              <div className="flex items-center gap-2 p-3 mt-2.5 rounded-[14px] bg-surface border border-line">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-text">Veces por semana</p>
                  <p className="text-[13px] text-text-muted leading-snug">Cúmplelo los días que quieras</p>
                </div>
                <button onClick={() => setVecesPorSemana(v => Math.max(1, v - 1))} className="w-11 h-11 rounded-[10px] bg-surface-raised border border-line flex items-center justify-center font-bold">-</button>
                <span className="w-8 text-center text-xl font-heading font-bold">{vecesPorSemana}</span>
                <button onClick={() => setVecesPorSemana(v => Math.min(7, v + 1))} className="w-11 h-11 rounded-[10px] bg-surface-raised border border-line flex items-center justify-center font-bold">+</button>
              </div>
            )}
          </div>

          {tipo === 'positivo' && (
            <div>
              {!showMeta ? (
                <button onClick={() => setShowMeta(true)} className="flex items-center justify-center w-full h-11 bg-transparent text-text font-semibold text-[15px]">
                  + Añadir meta <span className="text-[12px] font-semibold text-text-muted ml-1">ej. 8 vasos</span>
                </button>
              ) : (
                <div className="flex flex-col p-3 rounded-[14px] bg-surface border border-line gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 px-1">
                      <p className="text-[15px] font-semibold text-text">Meta al día</p>
                      <p className="text-[13px] text-text-muted leading-snug">Ej. 8 si son 8 vasos</p>
                    </div>
                    <button onClick={() => setMetaDiaria(m => Math.max(1, m - 1))} className="w-11 h-11 rounded-[10px] bg-surface-raised border border-line flex items-center justify-center font-bold">-</button>
                    <span className="w-12 text-center text-xl font-heading font-bold tabular-nums">{metaDiaria}</span>
                    <button onClick={() => setMetaDiaria(m => Math.min(999, m + 1))} className="w-11 h-11 rounded-[10px] bg-surface-raised border border-line flex items-center justify-center font-bold">+</button>
                  </div>
                  <button onClick={() => setShowMeta(false)} className="text-[13px] font-semibold text-text-muted text-center py-1 mt-1">
                    Quitar meta
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-[13px] font-medium text-text-muted mb-2" id="lbl-reto">Reto de días cumplidos <span className="font-semibold text-text-muted text-[12px]">opcional</span></p>
            <div className="flex gap-1 p-1 rounded-[12px] bg-surface border border-line" role="radiogroup" aria-labelledby="lbl-reto">
              {[
                { val: null, label: 'Sin reto' },
                { val: frecuencia === 'semanal' ? 4 : 7, label: frecuencia === 'semanal' ? '4 semanas' : '7 días' },
                { val: frecuencia === 'semanal' ? 8 : 30, label: frecuencia === 'semanal' ? '8 semanas' : '30 días' },
                { val: frecuencia === 'semanal' ? 12 : 66, label: frecuencia === 'semanal' ? '12 semanas' : '66 días' }
              ].map(r => (
                <button 
                  key={r.label}
                  role="radio" aria-checked={reto === r.val}
                  onClick={() => setReto(r.val)}
                  className={`flex-1 h-11 rounded-[9px] text-[13px] transition-colors whitespace-nowrap ${reto === r.val ? 'bg-surface-raised text-text font-bold shadow-[inset_0_0_0_1px_rgba(241,243,245,0.6)]' : 'text-text-muted font-semibold hover:bg-surface-raised'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            
            {isEditing && h?.reto && reto === h.reto.meta && (
              <div className="flex items-center gap-2.5 mt-3 mb-2" role="progressbar" aria-valuenow={contarProgresoReto(h, registros)} aria-valuemax={reto!}>
                <div className="flex-1 h-1.5 rounded-full bg-track-empty overflow-hidden">
                  <div className="h-full rounded-full bg-ambar transition-all" style={{ width: `${Math.min(100, Math.round((contarProgresoReto(h, registros) / reto!) * 100))}%` }} />
                </div>
                <span className="text-[12px] font-semibold text-text-muted font-mono whitespace-nowrap">
                  Reto · {contarProgresoReto(h, registros)} de {reto}
                </span>
              </div>
            )}
            
            {getRetoHelp()}
          </div>

          {!showMore ? (
            <button onClick={() => setShowMore(true)} className="w-full flex items-center justify-between h-12 border-t border-line bg-transparent text-text font-semibold text-[15px] mt-2">
              <span className="flex items-center gap-1">Más opciones <span className="text-[12px] font-semibold text-text-muted ml-1">categoría para tus estadísticas</span></span>
              <span className="text-text-muted">▾</span>
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-line">
              <div>
                <p className="text-[13px] font-medium text-text-muted mb-2">Categoría</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                  <button
                    aria-pressed={!categoria}
                    onClick={() => setCategoria(undefined)}
                    className={`h-11 px-3.5 rounded-full border text-[13px] shrink-0 transition-colors ${!categoria ? 'bg-surface-raised border-text/60 text-text font-bold' : 'bg-surface border-line text-text-muted font-semibold hover:bg-surface-raised'}`}
                  >
                    Sin categoría
                  </button>
                  {CATEGORIAS.map(c => (
                    <button
                      key={c.key}
                      aria-pressed={categoria === c.key}
                      onClick={() => setCategoria(c.key)}
                      className={`flex items-center gap-1.5 h-11 px-3.5 rounded-full border text-[13px] shrink-0 transition-colors ${categoria === c.key ? 'bg-surface-raised border-text/60 text-text font-bold' : 'bg-surface border-line text-text-muted font-semibold hover:bg-surface-raised'}`}
                    >
                      <HabitIcon name={c.icono} size={15} /> {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {isEditing && (
            <div className="pt-4 flex justify-center pb-6">
              <button onClick={() => { archivarHabito(h.id); handleClose(); }} className="flex items-center gap-2 text-text-muted font-semibold text-[14px]">
                <Archive size={16} /> Archivar hábito
              </button>
            </div>
          )}

        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 p-5 pt-3 border-t border-line bg-bg">
        <p className="text-[12px] font-semibold text-text-muted mb-1.5">Así se verá en Hoy</p>
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5 font-heading font-bold text-[15px] text-text">
            <span className={tokens.icon}><HabitIcon name={iconName} size={15} strokeWidth={2.4} /></span>
            {momentoLabel}
          </div>
          <HabitPreviewRow 
            habito={{ 
              nombre: nombre, 
              icono, 
              tipo, 
              momento, 
              anclaje, 
              metaDiaria: (showMeta && tipo !== 'negativo') ? metaDiaria : undefined, 
              reto: reto ? { meta: reto, inicio: '' } : undefined, 
              frecuencia, 
              vecesPorSemana 
            }}
            retoProgreso={isEditing && h?.reto ? contarProgresoReto(h, registros) : 0}
          />
        </div>
        
        {isEditing ? (
          <div>
            {hasChanges() && (
              <p className="text-[13px] font-medium text-text-muted text-center mb-2.5 leading-snug">
                Cambiaste {formatChanges(getChangesList())}. Se aplicará al guardar.
              </p>
            )}
            <button 
              onClick={onSubmit}
              disabled={!hasChanges() || !nombre.trim()}
              className="w-full h-12 rounded-[12px] font-bold text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-100 disabled:cursor-not-allowed bg-ambar text-ink disabled:bg-surface-raised disabled:text-text-muted"
            >
              <Check size={18} strokeWidth={2.5} />
              Guardar cambios
            </button>
          </div>
        ) : (
          <button 
            onClick={onSubmit}
            disabled={!nombre.trim()}
            className="w-full h-12 rounded-[12px] font-bold text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-100 disabled:cursor-not-allowed bg-ambar text-ink disabled:bg-surface-raised disabled:text-text-muted"
          >
            {nombre.trim() ? <><Plus size={18} strokeWidth={2.5} /> Crear hábito</> : 'Escribe un nombre para crear'}
          </button>
        )}
      </footer>

      </div>

      <AnimatePresence>
        {isSelectingIcon && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setIsSelectingIcon(false)} />
            <motion.section 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[430px] mx-auto bg-bg rounded-t-[22px] shadow-2xl flex flex-col max-h-[85vh] border-t border-line"
            >
              <div className="w-10 h-[5px] rounded-full bg-line-strong mx-auto mt-2 shrink-0" />
              <header className="flex items-center justify-between px-5 py-3 border-b border-line shrink-0">
                <h2 className="font-heading font-bold text-[24px] text-text">Elige un ícono</h2>
                <button onClick={() => setIsSelectingIcon(false)} className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-raised text-text-muted">
                  <X size={16} strokeWidth={2.4} />
                </button>
              </header>
              <div className="px-5 py-3 shrink-0">
                <p className="text-[14px] text-text-muted">
                  Se verá en el color de <b className="text-text font-semibold">{momentoLabel}</b>. Al tocar uno, se elige y la hoja se cierra.
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6">
                {Array.from(new Set(ICONOS_DISPONIBLES.map(i => i.category))).map(cat => (
                  <div key={cat}>
                    <h3 className="text-[13px] font-semibold text-text-muted mb-3">{cat}</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {ICONOS_DISPONIBLES.filter(i => i.category === cat).map(i => (
                        <button
                          key={i.name}
                          onClick={() => { setIcono(i.name); setIsSelectingIcon(false); }}
                          className={`aspect-square flex items-center justify-center rounded-[12px] border transition-colors ${
                            icono === i.name ? `${tokens.bg} border-[1.5px] ${tokens.icon}` : `bg-surface border-transparent ${tokens.icon} hover:bg-surface-raised`
                          }`}
                          style={{ borderColor: icono === i.name ? `var(--${momento === 'flexible' ? 'text' : momento + '-text'})` : undefined }}
                        >
                          <HabitIcon name={i.name} size={22} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      {showDiscard && <ConfirmDiscardModal onContinue={() => setShowDiscard(false)} onDiscard={handleDiscard} />}
    </div>
  );
};
