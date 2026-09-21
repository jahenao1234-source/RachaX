import React, { useState, useEffect, useRef } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { X, Check, Trash2, ListChecks, Plus, GripVertical, CornerDownRight } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { COLORES_HABITO, Subtarea } from '../../types';
import { limpiarArbolSubtareas, contarHojasSubtareas } from '../../utils/habitUtils';

const TAREA_ICONOS = ['ListChecks', 'BookOpen', 'GraduationCap', 'Briefcase', 'Code', 'Home', 'Target', 'Lightbulb'];
const nuevoId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

interface SubtareaNodeProps {
  sub: Subtarea;
  pathNumber: string;
  depth: number;
  onText: (id: string, text: string) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (id: string) => void;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
}

const SubtareaEditorNode: React.FC<SubtareaNodeProps> = ({
  sub,
  pathNumber,
  depth,
  onText,
  onAddChild,
  onRemove,
  focusId,
  setFocusId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusId === sub.id && inputRef.current) {
      inputRef.current.focus();
      setFocusId(null);
    }
  }, [focusId, sub.id, setFocusId]);

  const tieneHijos = Boolean(sub.subtareas && sub.subtareas.length > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {depth > 0 && (
          <div className="text-[#5C6070] shrink-0 flex items-center justify-center w-4">
            <CornerDownRight size={13} className="text-[#5C6070]" />
          </div>
        )}
        <span className="text-[10px] font-mono text-[#5C6070] min-w-[22px] text-right shrink-0">
          {pathNumber}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={sub.texto}
          onChange={(e) => onText(sub.id, e.target.value)}
          maxLength={80}
          placeholder={depth === 0 ? "Describe el paso..." : "Describe el sub-paso..."}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-[10px] bg-[#0C0D12] border border-[#1E2029] text-sm text-[#F4F4F6] placeholder-[#5C6070] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={() => onAddChild(sub.id)}
          aria-label="Añadir sub-paso"
          title="Añadir sub-paso anidado"
          className="w-9 h-9 rounded-[10px] bg-[#1A1C24] text-[#9498A8] hover:text-[var(--accent)] hover:bg-[var(--accent-15)] flex items-center justify-center shrink-0 transition-colors"
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(sub.id)}
          aria-label="Quitar subtarea"
          title="Eliminar paso y sus sub-pasos"
          className="w-9 h-9 rounded-[10px] bg-[#1A1C24] text-[#6B6F7B] hover:text-[#F87171] hover:bg-[#F87171]/10 flex items-center justify-center shrink-0 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {tieneHijos && sub.subtareas && (
        <div className="ml-3 sm:ml-4 pl-2.5 sm:pl-3 border-l-2 border-[#2D313F]/70 space-y-2">
          {sub.subtareas.map((child, cIdx) => (
            <SubtareaEditorNode
              key={child.id}
              sub={child}
              pathNumber={`${pathNumber}.${cIdx + 1}`}
              depth={depth + 1}
              onText={onText}
              onAddChild={onAddChild}
              onRemove={onRemove}
              focusId={focusId}
              setFocusId={setFocusId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RootSubtareaRow: React.FC<{
  sub: Subtarea;
  index: number;
  onText: (id: string, text: string) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (id: string) => void;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
}> = ({ sub, index, onText, onAddChild, onRemove, focusId, setFocusId }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={sub.id}
      dragListener={false}
      dragControls={controls}
      as="div"
      whileDrag={{ scale: 1.01 }}
      className="space-y-2 bg-[#12141A]/50 p-2.5 rounded-[14px] border border-[#1E2029]/80"
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Arrastrar subtarea"
          className="shrink-0 w-6 h-9 flex items-center justify-center text-[#5C6070] hover:text-[#9498A8] cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={16} />
        </button>
        <span className="text-[11px] font-mono font-bold text-[#9498A8] w-4 text-center shrink-0">
          {index + 1}
        </span>
        <input
          type="text"
          value={sub.texto}
          onChange={(e) => onText(sub.id, e.target.value)}
          maxLength={80}
          placeholder="Describe el paso..."
          className="flex-1 min-w-0 px-3 py-2.5 rounded-[10px] bg-[#0C0D12] border border-[#1E2029] text-sm text-[#F4F4F6] placeholder-[#5C6070] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={() => onAddChild(sub.id)}
          aria-label="Añadir sub-paso"
          title="Añadir sub-paso anidado"
          className="w-9 h-9 rounded-[10px] bg-[#1A1C24] text-[#9498A8] hover:text-[var(--accent)] hover:bg-[var(--accent-15)] flex items-center justify-center shrink-0 transition-colors"
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(sub.id)}
          aria-label="Quitar subtarea"
          title="Eliminar paso y sus sub-pasos"
          className="w-9 h-9 rounded-[10px] bg-[#1A1C24] text-[#6B6F7B] hover:text-[#F87171] hover:bg-[#F87171]/10 flex items-center justify-center shrink-0 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {sub.subtareas && sub.subtareas.length > 0 && (
        <div className="ml-3 sm:ml-4 pl-2.5 sm:pl-3 border-l-2 border-[#2D313F]/70 space-y-2 pt-1">
          {sub.subtareas.map((child, cIdx) => (
            <SubtareaEditorNode
              key={child.id}
              sub={child}
              pathNumber={`${index + 1}.${cIdx + 1}`}
              depth={1}
              onText={onText}
              onAddChild={onAddChild}
              onRemove={onRemove}
              focusId={focusId}
              setFocusId={setFocusId}
            />
          ))}
        </div>
      )}
    </Reorder.Item>
  );
};

export const TareaEditorModal: React.FC = () => {
  const { isTareaEditorOpen, closeTareaEditor, tareaBeingEdited, crearTarea, editarTarea, eliminarTarea } = useHabitStore();
  const isEditing = Boolean(tareaBeingEdited);

  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState(COLORES_HABITO[0].hex);
  const [icono, setIcono] = useState('ListChecks');
  const [subs, setSubs] = useState<Subtarea[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (isTareaEditorOpen) {
      setNombre(tareaBeingEdited?.nombre || '');
      setColor(tareaBeingEdited?.color || COLORES_HABITO[0].hex);
      setIcono(tareaBeingEdited?.icono || 'ListChecks');
      setSubs(tareaBeingEdited?.subtareas?.length ? tareaBeingEdited.subtareas : [{ id: nuevoId(), texto: '', hecha: false }]);
      setFocusId(null);
    }
  }, [isTareaEditorOpen, tareaBeingEdited]);

  if (!isTareaEditorOpen) return null;

  const setSubTexto = (id: string, texto: string) => {
    const updateRecursive = (nodes: Subtarea[]): Subtarea[] =>
      nodes.map((n) => {
        if (n.id === id) return { ...n, texto };
        if (n.subtareas && n.subtareas.length > 0) {
          return { ...n, subtareas: updateRecursive(n.subtareas) };
        }
        return n;
      });
    setSubs((prev) => updateRecursive(prev));
  };

  const removeSub = (id: string) => {
    const removeRecursive = (nodes: Subtarea[]): Subtarea[] =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => {
          if (n.subtareas && n.subtareas.length > 0) {
            const hijos = removeRecursive(n.subtareas);
            return { ...n, subtareas: hijos.length > 0 ? hijos : undefined };
          }
          return n;
        });
    setSubs((prev) => removeRecursive(prev));
  };

  const addChildSub = (parentId: string) => {
    const newChildId = nuevoId();
    const newChild: Subtarea = { id: newChildId, texto: '', hecha: false };

    const addRecursive = (nodes: Subtarea[]): Subtarea[] =>
      nodes.map((n) => {
        if (n.id === parentId) {
          const hijos = n.subtareas ? [...n.subtareas, newChild] : [newChild];
          return { ...n, subtareas: hijos };
        }
        if (n.subtareas && n.subtareas.length > 0) {
          return { ...n, subtareas: addRecursive(n.subtareas) };
        }
        return n;
      });

    setSubs((prev) => addRecursive(prev));
    setFocusId(newChildId);
  };

  const addRootSub = () => {
    const newId = nuevoId();
    setSubs((prev) => [...prev, { id: newId, texto: '', hecha: false }]);
    setFocusId(newId);
  };

  const subsLimpias = limpiarArbolSubtareas(subs);
  const hojasStats = contarHojasSubtareas(subsLimpias);
  const puedeGuardar = nombre.trim().length > 0 && subsLimpias.length > 0;

  const handleSave = () => {
    if (!puedeGuardar) return;
    if (isEditing && tareaBeingEdited) {
      editarTarea(tareaBeingEdited.id, { nombre: nombre.trim(), color, icono, subtareas: subsLimpias });
    } else {
      crearTarea({ nombre: nombre.trim(), color, icono, subtareas: subsLimpias });
    }
    closeTareaEditor();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn" onClick={closeTareaEditor}>
      <div className="w-full max-w-[460px] max-h-[88vh] bg-[#14161D] border-t sm:border border-[#1E2029] rounded-t-[24px] sm:rounded-[24px] flex flex-col shadow-2xl animate-slideUp overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="px-5 py-4 border-b border-[#1E2029] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-15)] text-[var(--accent)] flex items-center justify-center"><ListChecks size={18} /></div>
            <h2 className="text-base font-bold font-heading text-[#F4F4F6]">{isEditing ? 'Editar tarea' : 'Nueva tarea'}</h2>
          </div>
          <button type="button" onClick={closeTareaEditor} aria-label="Cerrar" className="w-8 h-8 rounded-full bg-[#1A1C24] text-[#9498A8] hover:text-white flex items-center justify-center"><X size={16} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9498A8]">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={50} placeholder="Ej. Estudiar para el examen"
              className="w-full px-4 py-3 rounded-[12px] bg-[#0C0D12] border border-[#1E2029] text-sm text-[#F4F4F6] placeholder-[#5C6070] focus:outline-none focus:border-[var(--accent)]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#9498A8]">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORES_HABITO.map((c) => (
                <button key={c.key} type="button" onClick={() => setColor(c.hex)}
                  className={`h-10 rounded-[12px] flex items-center justify-center transition-all ${color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14161D] scale-105' : 'opacity-80 hover:scale-95'}`}
                  style={{ backgroundColor: c.hex }}>
                  {color === c.hex && <Check size={16} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#9498A8]">Icono</label>
            <div className="grid grid-cols-4 gap-2">
              {TAREA_ICONOS.map((name) => (
                <button key={name} type="button" onClick={() => setIcono(name)}
                  className={`aspect-square rounded-[12px] flex items-center justify-center transition-all ${icono === name ? 'bg-[var(--accent)] text-white scale-105' : 'bg-[#0C0D12] text-[#6B6F7B] hover:text-[#F4F4F6] border border-[#1E2029]'}`}>
                  <HabitIcon name={name} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#9498A8]">
                Estructura de pasos ({hojasStats.total} {hojasStats.total === 1 ? 'paso' : 'pasos'})
              </label>
              <span className="text-[11px] text-[#5C6070]">Usa + para crear sub-pasos</span>
            </div>

            <Reorder.Group
              as="div"
              axis="y"
              values={subs.map((s) => s.id)}
              onReorder={(ids: string[]) =>
                setSubs((prev) => ids.map((id) => prev.find((s) => s.id === id)).filter((s): s is Subtarea => Boolean(s)))
              }
              className="space-y-2.5"
            >
              {subs.map((s, i) => (
                <RootSubtareaRow
                  key={s.id}
                  sub={s}
                  index={i}
                  onText={setSubTexto}
                  onAddChild={addChildSub}
                  onRemove={removeSub}
                  focusId={focusId}
                  setFocusId={setFocusId}
                />
              ))}
            </Reorder.Group>

            <button
              type="button"
              onClick={addRootSub}
              className="w-full py-2.5 rounded-[12px] border border-dashed border-[#2D313F] text-[#9498A8] hover:text-[#F4F4F6] hover:border-[#3E4250] hover:bg-[#14161D] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Añadir paso principal
            </button>
          </div>
        </div>

        <footer className="p-4 border-t border-[#1E2029] shrink-0 flex items-center gap-2.5">
          {isEditing && (
            <button type="button" onClick={() => { if (window.confirm('¿Eliminar esta tarea?')) { eliminarTarea(tareaBeingEdited!.id); closeTareaEditor(); } }}
              className="w-12 h-12 rounded-[12px] bg-[#14161D] border border-[#F87171]/30 text-[#F87171] flex items-center justify-center shrink-0 active:scale-95 transition-all">
              <Trash2 size={18} />
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={!puedeGuardar}
            className="flex-1 py-3.5 rounded-[12px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold font-heading shadow-lg shadow-[var(--accent-30)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none">
            <Check size={18} strokeWidth={2.5} />
            {isEditing ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </footer>
      </div>
    </div>
  );
};
