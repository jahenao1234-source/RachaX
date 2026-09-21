import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Bell, Calendar, Tag, ShieldCheck, Target, Sparkles, Edit3, Clock, CheckCircle2, Ban, Link2 } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { COLORES_HABITO, ICONOS_DISPONIBLES, FrecuenciaHabito, Habito, MOMENTOS, MomentoDia, CATEGORIAS, PLANTILLAS_HABITOS } from '../../types';
import { HabitIcon } from '../common/HabitIcon';

interface CreateHabitScreenProps {
  habitToEdit?: Habito | null;
  onClose?: () => void;
}

export const CreateHabitScreen: React.FC<CreateHabitScreenProps> = ({ habitToEdit: propHabitToEdit, onClose }) => {
  const {
    crearHabito,
    editarHabito,
    closeCreateModal,
    habitBeingEdited,
    cancelEditHabit,
  } = useHabitStore();

  const currentHabitToEdit = propHabitToEdit !== undefined ? propHabitToEdit : habitBeingEdited;
  const isEditing = Boolean(currentHabitToEdit);

  // Form State
  const [tipo, setTipo] = useState<'positivo' | 'negativo'>(currentHabitToEdit?.tipo || 'positivo');
  const [nombre, setNombre] = useState(currentHabitToEdit?.nombre || '');
  const [categoria, setCategoria] = useState<string | undefined>(currentHabitToEdit?.categoria);
  const [colorHex, setColorHex] = useState(currentHabitToEdit?.color || COLORES_HABITO[0].hex);
  const [icono, setIcono] = useState(
    currentHabitToEdit?.icono || (currentHabitToEdit?.tipo === 'negativo' ? 'ShieldCheck' : 'Flame')
  );
  const [momento, setMomento] = useState<MomentoDia>(currentHabitToEdit?.momento || 'flexible');
  const [anclaje, setAnclaje] = useState<string>(currentHabitToEdit?.anclaje || '');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaHabito>(currentHabitToEdit?.frecuencia || 'diario');
  const [diasPersonalizados, setDiasPersonalizados] = useState<number[]>(
    currentHabitToEdit?.diasPersonalizados || [1, 2, 3, 4, 5]
  );
  const [vecesPorSemana, setVecesPorSemana] = useState<number>(currentHabitToEdit?.vecesPorSemana || 3);
  
  // Optional quantifiable target
  const [tieneMeta, setTieneMeta] = useState(Boolean(currentHabitToEdit?.metaDiaria));
  const [metaDiaria, setMetaDiaria] = useState<number>(currentHabitToEdit?.metaDiaria || 8);

  // Optional reminder
  const [tieneRecordatorio, setTieneRecordatorio] = useState(Boolean(currentHabitToEdit?.recordatorio));
  const [horaRecordatorio, setHoraRecordatorio] = useState(currentHabitToEdit?.recordatorio || '08:00');

  // Error State
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  // Update fields if editing habit changes
  useEffect(() => {
    if (currentHabitToEdit) {
      setTipo(currentHabitToEdit.tipo || 'positivo');
      setNombre(currentHabitToEdit.nombre);
      setCategoria(currentHabitToEdit.categoria);
      setColorHex(currentHabitToEdit.color);
      setIcono(currentHabitToEdit.icono);
      setMomento(currentHabitToEdit.momento || 'flexible');
      setAnclaje(currentHabitToEdit.anclaje || '');
      setFrecuencia(currentHabitToEdit.frecuencia);
      setDiasPersonalizados(currentHabitToEdit.diasPersonalizados || [1, 2, 3, 4, 5]);
      setVecesPorSemana(currentHabitToEdit.vecesPorSemana || 3);
      setTieneMeta(Boolean(currentHabitToEdit.metaDiaria));
      setMetaDiaria(currentHabitToEdit.metaDiaria || 8);
      setTieneRecordatorio(Boolean(currentHabitToEdit.recordatorio));
      setHoraRecordatorio(currentHabitToEdit.recordatorio || '08:00');
    }
  }, [currentHabitToEdit]);

  const handleTipoChange = (newTipo: 'positivo' | 'negativo') => {
    setTipo(newTipo);
    if (!isEditing) {
      if (newTipo === 'negativo' && (icono === 'Flame' || !icono)) {
        setIcono('ShieldCheck');
      } else if (newTipo === 'positivo' && (icono === 'ShieldCheck' || icono === 'Ban')) {
        setIcono('Flame');
      }
    }
  };

  // Day options for custom frequency (0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb)
  const DIAS_SEMANA = [
    { index: 1, label: 'L', full: 'Lun' },
    { index: 2, label: 'M', full: 'Mar' },
    { index: 3, label: 'X', full: 'Mié' },
    { index: 4, label: 'J', full: 'Jue' },
    { index: 5, label: 'V', full: 'Vie' },
    { index: 6, label: 'S', full: 'Sáb' },
    { index: 0, label: 'D', full: 'Dom' },
  ];

  const toggleDiaPersonalizado = (index: number) => {
    setDiasPersonalizados((prev) => {
      if (prev.includes(index)) {
        if (prev.length === 1) return prev; // At least one day required
        return prev.filter((d) => d !== index);
      } else {
        return [...prev, index].sort();
      }
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (isEditing) {
      cancelEditHabit();
    } else {
      closeCreateModal();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setErrorNombre('Por favor, ingresa el nombre del hábito.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      tipo,
      categoria: categoria || undefined,
      color: colorHex,
      icono,
      momento,
      anclaje: anclaje.trim() || undefined,
      frecuencia,
      vecesPorSemana: frecuencia === 'semanal' ? vecesPorSemana : undefined,
      diasPersonalizados: frecuencia === 'personalizado' ? diasPersonalizados : undefined,
      recordatorio: tieneRecordatorio ? horaRecordatorio : null,
      metaDiaria: tieneMeta && metaDiaria > 0 ? Number(metaDiaria) : undefined,
    };

    if (isEditing && currentHabitToEdit) {
      editarHabito(currentHabitToEdit.id, payload);
      handleClose();
    } else {
      crearHabito(payload);
      handleClose();
    }
  };

  const aplicarPlantilla = (p: typeof PLANTILLAS_HABITOS[number]) => {
    setTipo(p.tipo || 'positivo');
    setNombre(p.nombre);
    setCategoria(p.categoria);
    setColorHex(p.color);
    setIcono(p.icono);
    setMomento(p.momento || 'flexible');
    setFrecuencia(p.frecuencia || 'diario');
    setTieneMeta(Boolean(p.metaDiaria));
    if (p.metaDiaria) setMetaDiaria(p.metaDiaria);
    if (p.vecesPorSemana) setVecesPorSemana(p.vecesPorSemana);
    setErrorNombre(null);
  };

  // Group icons by their defined category
  const groupedIcons = useMemo(() => {
    const categories: { category: string; icons: typeof ICONOS_DISPONIBLES }[] = [];
    const categoryMap = new Map<string, typeof ICONOS_DISPONIBLES>();

    ICONOS_DISPONIBLES.forEach((item) => {
      const cat = item.category || 'General';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(item);
    });

    categoryMap.forEach((icons, category) => {
      categories.push({ category, icons });
    });

    return categories;
  }, []);

  return (
    <div
      id="screen-create-habit-modal"
      className="min-h-full bg-bg text-text flex flex-col animate-slideUp pb-28"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md border-b border-line px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            id="create-modal-close-btn"
            type="button"
            onClick={handleClose}
            aria-label="Cerrar formulario"
            className="w-9 h-9 rounded-full bg-surface hover:bg-surface-raised border border-line text-text-muted hover:text-text flex items-center justify-center transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2">
            {isEditing && <Edit3 size={17} className="text-[var(--accent)]" />}
            <h1 className="text-lg font-bold font-heading text-text">
              {isEditing ? 'Editar Hábito' : 'Nuevo Hábito'}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] px-2 py-1 transition-colors"
        >
          Cancelar
        </button>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6 flex-1 max-w-[430px] mx-auto w-full">
        {!isEditing && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--accent)]" />
              Plantillas rápidas <span className="text-[11px] text-text-muted">(opcional)</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
              {PLANTILLAS_HABITOS.map((p) => (
                <button
                  key={p.nombre}
                  type="button"
                  onClick={() => aplicarPlantilla(p)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs font-medium border whitespace-nowrap transition-all bg-surface border-line text-text-muted hover:text-text hover:border-line-strong active:scale-95"
                >
                  <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                    <HabitIcon name={p.icono} size={12} />
                  </span>
                  <span>{p.nombre}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-text-muted pl-1">Toca una para rellenar el formulario; luego ajústala y guarda.</p>
          </div>
        )}

        {/* Tipo de Hábito (Positivo / Negativo) */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Target size={14} className="text-[var(--accent)]" />
            Tipo de Hábito
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="habit-type-positive-btn"
              onClick={() => handleTipoChange('positivo')}
              className={`p-3 rounded-[14px] border text-left transition-all flex items-center gap-3 ${
                tipo === 'positivo'
                  ? 'bg-[var(--accent-15)] border-[var(--accent)] text-text shadow-sm'
                  : 'bg-surface border-line text-text-muted hover:text-text-muted'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tipo === 'positivo'
                    ? 'bg-[var(--accent)] text-text shadow-md shadow-[var(--accent-30)]'
                    : 'bg-surface-raised text-text-muted'
                }`}
              >
                <CheckCircle2 size={18} />
              </div>
              <div className="min-w-0">
                <span className={`text-xs font-bold font-heading block ${tipo === 'positivo' ? 'text-text' : 'text-text-muted'}`}>
                  Quiero hacer
                </span>
                <span className="text-[10px] text-text-muted block truncate">
                  Construir hábito
                </span>
              </div>
            </button>

            <button
              type="button"
              id="habit-type-negative-btn"
              onClick={() => handleTipoChange('negativo')}
              className={`p-3 rounded-[14px] border text-left transition-all flex items-center gap-3 ${
                tipo === 'negativo'
                  ? 'bg-line border-text-muted text-text shadow-sm'
                  : 'bg-surface border-line text-text-muted hover:text-text-muted'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tipo === 'negativo'
                    ? 'bg-text-muted text-text shadow-md shadow-black/40'
                    : 'bg-surface-raised text-text-muted'
                }`}
              >
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <span className={`text-xs font-bold font-heading block ${tipo === 'negativo' ? 'text-text' : 'text-text-muted'}`}>
                  Quiero evitar
                </span>
                <span className="text-[10px] text-text-muted block truncate">
                  Romper mal hábito
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Habit Name Input */}
        <div className="space-y-1.5">
          <label htmlFor="habit-name-input" className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Tag size={14} className="text-[var(--accent)]" />
            Nombre del Hábito <span className="text-danger">*</span>
          </label>
          <input
            id="habit-name-input"
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errorNombre) setErrorNombre(null);
            }}
            placeholder={
              tipo === 'negativo'
                ? 'Ej. No fumar, Nada de redes en la cama...'
                : 'Ej. Meditar 10 minutos, Leer 20 páginas...'
            }
            maxLength={60}
            autoFocus={!isEditing}
            className={`w-full px-4 py-3 rounded-[12px] bg-surface border text-sm text-text placeholder-text-muted focus:outline-none transition-all ${
              errorNombre
                ? 'border-danger focus:ring-1 focus:ring-[#F87171]'
                : 'border-line focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'
            }`}
          />
          {errorNombre && (
            <p id="habit-name-error" className="text-xs text-danger font-medium pl-1 animate-fadeIn">
              {errorNombre}
            </p>
          )}
        </div>

        {/* Category Selector (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
              <Tag size={14} className="text-[var(--accent)]" />
              Categoría <span className="text-[11px] text-text-muted">(opcional)</span>
            </label>
            {categoria && (
              <button
                type="button"
                onClick={() => setCategoria(undefined)}
                className="text-[11px] text-text-muted hover:text-text-muted transition-colors"
              >
                Quitar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-1 px-1">
            <button
              type="button"
              onClick={() => setCategoria(undefined)}
              className={`px-3 py-2 rounded-[12px] text-xs font-medium border whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                !categoria
                  ? 'bg-line border-text-muted text-text shadow-sm'
                  : 'bg-surface border-line text-text-muted hover:text-text-muted'
              }`}
            >
              <span>Sin categoría</span>
            </button>

            {CATEGORIAS.map((cat) => {
              const isSelected = categoria === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategoria(isSelected ? undefined : cat.key)}
                  className={`px-3 py-2 rounded-[12px] text-xs font-medium border whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'border-opacity-100 shadow-sm'
                      : 'bg-surface border-line text-text-muted hover:text-text-muted'
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${cat.color}20` : undefined,
                    borderColor: isSelected ? cat.color : undefined,
                    color: isSelected ? cat.color : undefined,
                  }}
                >
                  <HabitIcon name={cat.icono} size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Palette Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[var(--accent)]" />
              Color de Identidad
            </label>
            <span className="text-[11px] text-[var(--accent)] font-mono font-medium">
              {COLORES_HABITO.find((c) => c.hex === colorHex)?.label}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {COLORES_HABITO.map((c) => {
              const isSelected = colorHex === c.hex;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColorHex(c.hex)}
                  className={`h-11 rounded-[12px] flex items-center justify-center transition-all relative ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-bg scale-105 shadow-md'
                      : 'hover:scale-95 opacity-80'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Seleccionar color ${c.label}`}
                >
                  {isSelected && <Check size={18} className="text-text drop-shadow" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon Selector Grid Grouped by Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--accent)]" />
              Icono del Hábito
            </label>
            <span className="text-[11px] text-[var(--accent)] font-mono font-medium">
              {ICONOS_DISPONIBLES.find((i) => i.name === icono)?.label || icono}
            </span>
          </div>

          <div className="rounded-[16px] bg-surface border border-line p-3 max-h-[260px] overflow-y-auto space-y-3.5 divide-y divide-[var(--line)]/40">
            {groupedIcons.map((group, groupIdx) => (
              <div key={group.category} className={groupIdx > 0 ? 'pt-3 space-y-1.5' : 'space-y-1.5'}>
                <p className="text-[11px] font-semibold text-text-muted px-0.5 tracking-wide">
                  {group.category}
                </p>
                <div className="grid grid-cols-8 gap-1.5">
                  {group.icons.map((item) => {
                    const isSelected = icono === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcono(item.name)}
                        title={item.label}
                        aria-label={item.label}
                        className={`aspect-square rounded-[10px] flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[var(--accent)] text-text shadow-md shadow-[var(--accent-30)] scale-105'
                            : 'text-text-muted hover:text-text hover:bg-surface-raised'
                        }`}
                      >
                        <HabitIcon name={item.name} size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Momento del día Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--accent)]" />
            Momento del día
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOMENTOS.map((m) => {
              const isSelected = momento === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMomento(m.id)}
                  className={`py-2.5 px-2 text-center rounded-[12px] text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--accent-15)] border-[var(--accent)] text-[var(--accent)] font-semibold shadow-sm'
                      : 'bg-surface border-line text-text-muted hover:text-text'
                  }`}
                >
                  <HabitIcon name={m.icono} size={14} />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Anclaje de hábitos (habit stacking) */}
        <div className="space-y-1.5">
          <label htmlFor="habit-anchor-input" className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Link2 size={14} className="text-[var(--accent)]" />
            Anclaje <span className="text-[11px] text-text-muted">(opcional)</span>
          </label>
          <div className="flex items-center gap-2 rounded-[12px] bg-surface border border-line px-3 focus-within:border-[var(--accent)] transition-colors">
            <span className="text-xs text-text-muted shrink-0 whitespace-nowrap">Después de</span>
            <input
              id="habit-anchor-input"
              type="text"
              value={anclaje}
              onChange={(e) => setAnclaje(e.target.value)}
              placeholder="cepillarme los dientes..."
              maxLength={50}
              className="flex-1 bg-transparent py-3 text-sm text-text placeholder-text-muted focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-text-muted pl-1">Encadena el hábito a algo que ya haces (habit stacking).</p>
        </div>

        {/* Frequency Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Calendar size={14} className="text-[var(--accent)]" />
            Frecuencia
          </label>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'diario', label: 'Todos los días' },
              { id: 'entreSemana', label: 'Entre semana' },
              { id: 'personalizado', label: 'Personalizado' },
              { id: 'semanal', label: 'Semanal' },
            ].map((freq) => (
              <button
                key={freq.id}
                type="button"
                onClick={() => setFrecuencia(freq.id as FrecuenciaHabito)}
                className={`py-2.5 px-2 text-center rounded-[12px] text-xs font-medium border transition-all ${
                  frecuencia === freq.id
                    ? 'bg-[var(--accent-15)] border-[var(--accent)] text-[var(--accent)] font-semibold'
                    : 'bg-surface border-line text-text-muted hover:text-text'
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>

          {/* Custom Days Picker */}
          {frecuencia === 'personalizado' && (
            <div className="p-3 rounded-[14px] bg-surface border border-line space-y-2 animate-fadeIn">
              <span className="text-[11px] text-text-muted block">Selecciona los días:</span>
              <div className="grid grid-cols-7 gap-1">
                {DIAS_SEMANA.map((d) => {
                  const isSelected = diasPersonalizados.includes(d.index);
                  return (
                    <button
                      key={d.index}
                      type="button"
                      onClick={() => toggleDiaPersonalizado(d.index)}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-[var(--accent)] text-text shadow-sm'
                          : 'bg-surface-raised text-text-muted hover:text-text'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {frecuencia === 'semanal' && (
            <div className="p-3 rounded-[14px] bg-surface border border-line flex items-center justify-between animate-fadeIn">
              <div>
                <span className="text-xs font-medium text-text block">Veces por semana</span>
                <span className="text-[10px] text-text-muted">Cúmplelo los días que quieras</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setVecesPorSemana((v) => Math.max(1, v - 1))} className="w-8 h-8 rounded-full border border-line-strong text-text-muted hover:text-text flex items-center justify-center text-lg leading-none">−</button>
                <span className="w-8 text-center text-sm font-bold font-heading text-[var(--accent)]">{vecesPorSemana}</span>
                <button type="button" onClick={() => setVecesPorSemana((v) => Math.min(7, v + 1))} className="w-8 h-8 rounded-full bg-[var(--accent)] text-text flex items-center justify-center text-lg leading-none">+</button>
              </div>
            </div>
          )}
        </div>

        {/* Quantifiable Target (Optional) */}
        <div className="rounded-[16px] bg-surface border border-line p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-surface-raised text-[var(--accent)]">
                <Target size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-text">Meta Cuantificable</p>
                <p className="text-[10px] text-text-muted">Ej. 8 vasos, 20 páginas</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTieneMeta(!tieneMeta)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                tieneMeta ? 'bg-[var(--accent)]' : 'bg-line'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  tieneMeta ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {tieneMeta && (
            <div className="pt-2 border-t border-line flex items-center gap-3 animate-fadeIn">
              <label htmlFor="target-number-input" className="text-xs text-text-muted shrink-0">
                Objetivo por día:
              </label>
              <input
                id="target-number-input"
                type="number"
                min={1}
                max={999}
                value={metaDiaria}
                onChange={(e) => setMetaDiaria(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-1.5 rounded-lg bg-surface-raised border border-line text-sm text-center text-text focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>

        {/* Reminder Toggle & Time Picker */}
        <div className="rounded-[16px] bg-surface border border-line p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-surface-raised text-[var(--accent)]">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-text">Recordatorio Diario</p>
                <p className="text-[10px] text-text-muted">Hora preferida para cumplir</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTieneRecordatorio(!tieneRecordatorio)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                tieneRecordatorio ? 'bg-[var(--accent)]' : 'bg-line'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  tieneRecordatorio ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {tieneRecordatorio && (
            <div className="pt-2 border-t border-line flex items-center justify-between animate-fadeIn">
              <span className="text-xs text-text-muted">Hora:</span>
              <input
                type="time"
                value={horaRecordatorio}
                onChange={(e) => setHoraRecordatorio(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-raised border border-line text-xs font-mono text-text focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            id="create-habit-submit-btn"
            type="submit"
            className="w-full py-3.5 rounded-[12px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-text font-heading font-bold text-sm shadow-lg shadow-[var(--accent-30)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check size={18} strokeWidth={2.5} />
            <span>{isEditing ? 'Guardar cambios' : 'Guardar Hábito'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
