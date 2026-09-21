import React, { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { X, Check, Trash2, ListChecks, Plus, GripVertical } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { COLORES_HABITO, Habito } from '../../types';

const RUTINA_ICONOS = ['Sunrise', 'Sun', 'Moon', 'Zap', 'Coffee', 'Dumbbell', 'BookOpen', 'Sparkles', 'ListChecks', 'Bed'];

const HabitoOrdenRow: React.FC<{ habito: Habito; orden: number; onRemove: () => void }> = ({ habito, orden, onRemove }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item value={habito.id} dragListener={false} dragControls={controls} as="div"
      whileDrag={{ scale: 1.03, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.7)' }}
      className="p-2.5 rounded-[12px] bg-[var(--accent-10)] border border-[var(--accent-30)] flex items-center gap-2">
      <button type="button" onPointerDown={(e) => controls.start(e)} aria-label="Arrastrar hábito"
        className="shrink-0 w-6 h-9 flex items-center justify-center text-text-muted hover:text-text-muted cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }}>
        <GripVertical size={16} />
      </button>
      <span className="text-[11px] font-mono text-[var(--accent)] w-4 text-center shrink-0">{orden}</span>
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${habito.color}20`, color: habito.color, border: `1px solid ${habito.color}40` }}>
        <HabitIcon name={habito.icono} size={15} />
      </div>
      <span className="text-xs font-semibold font-heading text-text truncate flex-1">{habito.nombre}</span>
      <button type="button" onClick={onRemove} aria-label="Quitar de la rutina"
        className="w-7 h-7 rounded-lg bg-surface-raised text-text-muted hover:text-danger flex items-center justify-center shrink-0"><X size={14} /></button>
    </Reorder.Item>
  );
};

export const RutinaEditorModal: React.FC = () => {
  const { isRutinaEditorOpen, closeRutinaEditor, rutinaBeingEdited, crearRutina, editarRutina, eliminarRutina, habitosActivos } = useHabitStore();
  const isEditing = Boolean(rutinaBeingEdited);

  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState(COLORES_HABITO[0].hex);
  const [icono, setIcono] = useState('ListChecks');
  const [seleccion, setSeleccion] = useState<string[]>([]);

  useEffect(() => {
    if (isRutinaEditorOpen) {
      setNombre(rutinaBeingEdited?.nombre || '');
      setColor(rutinaBeingEdited?.color || COLORES_HABITO[0].hex);
      setIcono(rutinaBeingEdited?.icono || 'ListChecks');
      setSeleccion(rutinaBeingEdited?.habitoIds || []);
    }
  }, [isRutinaEditorOpen, rutinaBeingEdited]);

  if (!isRutinaEditorOpen) return null;

  const toggleHabito = (id: string) => {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const puedeGuardar = nombre.trim().length > 0 && seleccion.length > 0;

  const handleSave = () => {
    if (!puedeGuardar) return;
    const habitoIds = seleccion.filter((id) => habitosActivos.some((h) => h.id === id));
    if (isEditing && rutinaBeingEdited) {
      editarRutina(rutinaBeingEdited.id, { nombre: nombre.trim(), color, icono, habitoIds });
    } else {
      crearRutina({ nombre: nombre.trim(), color, icono, habitoIds });
    }
    closeRutinaEditor();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn" onClick={closeRutinaEditor}>
      <div className="w-full max-w-[430px] max-h-[88vh] bg-surface border-t sm:border border-line rounded-t-[24px] sm:rounded-[24px] flex flex-col shadow-2xl animate-slideUp overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="px-5 py-4 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center"><ListChecks size={18} /></div>
            <h2 className="text-base font-bold font-heading text-text">{isEditing ? 'Editar rutina' : 'Nueva rutina'}</h2>
          </div>
          <button type="button" onClick={closeRutinaEditor} aria-label="Cerrar" className="w-8 h-8 rounded-full bg-surface-raised text-text-muted hover:text-text flex items-center justify-center"><X size={16} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={40} placeholder="Ej. Rutina de noche"
              className="w-full px-4 py-3 rounded-[12px] bg-bg border border-line text-sm text-text placeholder-text-muted focus:outline-none focus:border-[var(--accent)]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORES_HABITO.map((c) => (
                <button key={c.key} type="button" onClick={() => setColor(c.hex)}
                  className={`h-10 rounded-[12px] flex items-center justify-center transition-all ${color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-105' : 'opacity-80 hover:scale-95'}`}
                  style={{ backgroundColor: c.hex }}>
                  {color === c.hex && <Check size={16} className="text-text" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted">Icono</label>
            <div className="grid grid-cols-5 gap-2">
              {RUTINA_ICONOS.map((name) => (
                <button key={name} type="button" onClick={() => setIcono(name)}
                  className={`aspect-square rounded-[12px] flex items-center justify-center transition-all ${icono === name ? 'bg-[var(--accent)] text-text scale-105' : 'bg-bg text-text-muted hover:text-text border border-line'}`}>
                  <HabitIcon name={name} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-text-muted">Hábitos de esta rutina ({seleccion.length})</label>

            {seleccion.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] text-text-muted">Arrastra desde el asa para definir el orden del enfoque</p>
                <Reorder.Group as="div" axis="y" values={seleccion} onReorder={setSeleccion} className="space-y-2">
                  {seleccion.map((id, i) => {
                    const h = habitosActivos.find((x) => x.id === id);
                    if (!h) return null;
                    return <HabitoOrdenRow key={id} habito={h} orden={i + 1} onRemove={() => toggleHabito(id)} />;
                  })}
                </Reorder.Group>
              </div>
            )}

            {habitosActivos.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">Primero crea algunos hábitos.</p>
            ) : (
              habitosActivos.filter((h) => !seleccion.includes(h.id)).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] text-text-muted">Añadir hábitos</p>
                  {habitosActivos.filter((h) => !seleccion.includes(h.id)).map((h) => (
                    <button key={h.id} type="button" onClick={() => toggleHabito(h.id)}
                      className="w-full p-3 rounded-[14px] border bg-bg border-line hover:border-line-strong flex items-center gap-3 text-left transition-all">
                      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}>
                        <HabitIcon name={h.icono} size={16} />
                      </div>
                      <span className="text-xs font-semibold font-heading text-text truncate flex-1">{h.nombre}</span>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 border-line-strong"><Plus size={12} className="text-text-muted" /></div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <footer className="p-4 border-t border-line shrink-0 flex items-center gap-2.5">
          {isEditing && (
            <button type="button" onClick={() => { if (window.confirm('¿Eliminar esta rutina? (No borra los hábitos.)')) { eliminarRutina(rutinaBeingEdited!.id); closeRutinaEditor(); } }}
              className="w-12 h-12 rounded-[12px] bg-surface border border-danger/30 text-danger flex items-center justify-center shrink-0 active:scale-95 transition-all">
              <Trash2 size={18} />
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={!puedeGuardar}
            className="flex-1 py-3.5 rounded-[12px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-text text-sm font-bold font-heading shadow-lg shadow-[var(--accent-30)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none">
            <Check size={18} strokeWidth={2.5} />
            {isEditing ? 'Guardar cambios' : 'Crear rutina'}
          </button>
        </footer>
      </div>
    </div>
  );
};
