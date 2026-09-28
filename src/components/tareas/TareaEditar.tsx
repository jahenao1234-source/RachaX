import React, { useState } from 'react';
import { GripVertical, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Subtarea, Tarea } from '../../types';
import { nuevoIdPaso, agregarPaso, editarTextoPaso as editarTextoPasoPuro, borrarPaso, buscarPaso } from '../../utils/tareasUtils';
import { useArrastrePasos } from './arrastrePasos';
import { HojaOpcionesPaso } from './HojaOpcionesPaso';

export const TAREA_ICONOS = ['ListChecks', 'BookOpen', 'GraduationCap', 'Briefcase', 'Code', 'Home', 'Target', 'Lightbulb'];

const autoAlto = (el: HTMLTextAreaElement | null) => {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

/**
 * Editar tarea (celular) y Nueva tarea. DESIGN.md › Tareas.
 * Al editar una tarea que ya existe, cada cambio va directo al store (sin copia local),
 * para no pisar lo que se marque en otro lado mientras se edita.
 */
export const TareaEditar: React.FC<{
  tarea: Tarea | null;
  /** Al crear una tarea nueva recibe su id. */
  onListo: (idNueva?: string) => void;
  onBorrar?: (t: Tarea) => void;
}> = ({ tarea, onListo, onBorrar }) => {
  const { crearTarea, editarTarea, editarTextoPaso, agregarPasoTarea, borrarPasoTarea } = useHabitStore();
  const esNueva = !tarea;
  const [nombre, setNombre] = useState(tarea ? tarea.nombre : '');
  const [icono, setIcono] = useState(tarea ? tarea.icono : 'ListChecks');
  const [verIconos, setVerIconos] = useState(false);
  const [arbol, setArbol] = useState<Subtarea[]>([]); // solo para Nueva tarea
  const [opciones, setOpciones] = useState<{ pasoId: string } | null>(null);
  const [editandoPaso, setEditandoPaso] = useState<string | null>(null);
  const [textoNuevo, setTextoNuevo] = useState('');
  const [dentroDe, setDentroDe] = useState<string | null>(null);
  const [textoDentro, setTextoDentro] = useState('');

  const guardarCabecera = (nuevoIcono = icono) => {
    if (!tarea) return;
    const limpio = nombre.trim();
    editarTarea(tarea.id, { nombre: limpio || tarea.nombre, icono: nuevoIcono });
  };

  // Arrastrar: mantener presionado ⋮⋮ (arrastrePasos.ts)
  const { arrastre, asa, destinoEn, estilo } = useArrastrePasos(tarea);

  const renderPaso = (s: Subtarea): React.ReactNode => {
    const arrastrando = arrastre?.id === s.id;
    const d = destinoEn(s.id);
    return (
      <li key={s.id} data-paso-li={s.id} className={`tpaso${arrastrando ? ' drag' : ''}`}
        style={estilo(s.id)}>
        {d === 'antes' && <div className="tlinea" aria-hidden="true" />}
        <div className="tfila" data-paso-row={s.id}>
          <span className="tasam" aria-hidden="true" style={{ cursor: 'grab' }}
            {...asa(s.id)}>
            <GripVertical size={18} />
          </span>
          <textarea className="tedit" rows={1} defaultValue={s.texto} aria-label="Texto del paso"
            ref={autoAlto} onInput={(e) => autoAlto(e.currentTarget)}
            onBlur={(e) => { if (tarea && e.target.value.trim() !== s.texto) editarTextoPaso(tarea.id, s.id, e.target.value); }} />
          <button type="button" className="tmover" aria-label={`Agregar un paso dentro de ${s.texto}`}
            onClick={() => { setDentroDe(s.id); setTextoDentro(''); }}><Plus size={18} /></button>
          <button type="button" className="tmover" aria-label={`Borrar el paso ${s.texto}`}
            onClick={() => tarea && borrarPasoTarea(tarea.id, s.id)}><Trash2 size={17} /></button>
        </div>
        {d === 'dentro' && <div className="tsoltar" aria-hidden="true">Suelta aquí para meterlo dentro de este paso</div>}
        {s.subtareas && s.subtareas.length > 0 && <ul className="tarbol tsubl">{s.subtareas.map(renderPaso)}</ul>}
        {dentroDe === s.id && tarea && (
          <div className="tnuevo-in">
            <Plus size={16} strokeWidth={2.4} className="text-text-muted" />
            <input className="tinput tinput-on" autoFocus placeholder="Escribe un paso más pequeño" aria-label={`Nuevo paso dentro de ${s.texto}`}
              value={textoDentro} onChange={(e) => setTextoDentro(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textoDentro.trim()) { agregarPasoTarea(tarea.id, s.id, textoDentro); setTextoDentro(''); }
                if (e.key === 'Escape') setDentroDe(null);
              }}
              onBlur={() => { if (textoDentro.trim()) agregarPasoTarea(tarea.id, s.id, textoDentro); setDentroDe(null); }} />
          </div>
        )}
        {d === 'despues' && <div className="tlinea" aria-hidden="true" />}
      </li>
    );
  };

  const agregarAbajo = () => {
    const t = textoNuevo.trim();
    if (!t) return;
    if (tarea) agregarPasoTarea(tarea.id, null, t);
    else setArbol((a) => agregarPaso(a, null, t).arbol);
    setTextoNuevo('');
  };

  const crear = () => {
    const n = nombre.trim();
    if (!n) return;
    const pendiente = textoNuevo.trim();
    const finalArbol = pendiente ? agregarPaso(arbol, null, pendiente).arbol : arbol;
    const id = crearTarea({ nombre: n, icono, color: '', subtareas: finalArbol });
    onListo(id);
  };

  const renderPasoNuevo = (s: Subtarea): React.ReactNode => {
    const hijos = s.subtareas || [];
    return (
      <li key={s.id} className="tpaso">
        <div className="tfila">
          <span className="t3punto" aria-hidden="true" />
          <span className="ttxt">
            {editandoPaso === s.id ? (
              <input className="tinput tinput-on" autoFocus defaultValue={s.texto} aria-label="Texto del paso"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.currentTarget.value.trim() && e.currentTarget.value.trim() !== s.texto) {
                      setArbol((a) => editarTextoPasoPuro(a, s.id, e.currentTarget.value.trim()));
                    }
                    setEditandoPaso(null);
                  }
                  if (e.key === 'Escape') setEditandoPaso(null);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value.trim() !== s.texto) {
                    setArbol((a) => editarTextoPasoPuro(a, s.id, e.target.value.trim()));
                  }
                  setEditandoPaso(null);
                }}
              />
            ) : (
              <span className="tnom">{s.texto}</span>
            )}
          </span>
          <button type="button" className="t3mas" aria-label={`Opciones de ${s.texto}`} onClick={() => setOpciones({ pasoId: s.id })}>
            <MoreHorizontal size={18} />
          </button>
        </div>
        {(hijos.length > 0 || dentroDe === s.id) && (
          <ul className="tarbol tsubl">
            {hijos.map((h) => renderPasoNuevo(h))}
            <li className="tpaso">
              {dentroDe === s.id ? (
                <div className="tagrega-in" style={{ borderTop: 'none', padding: '0 0 0 10px' }}>
                  <Plus size={16} strokeWidth={2.4} />
                  <input className="tinput tinput-on" autoFocus placeholder="Escribe un paso más pequeño" aria-label={`Nuevo paso dentro de ${s.texto}`}
                    value={textoDentro} onChange={(e) => setTextoDentro(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && textoDentro.trim()) { setArbol((a) => agregarPaso(a, s.id, textoDentro).arbol); setTextoDentro(''); }
                      if (e.key === 'Escape') { setTextoDentro(''); setDentroDe(null); }
                    }}
                    onBlur={() => { if (textoDentro.trim()) setArbol((a) => agregarPaso(a, s.id, textoDentro).arbol); setDentroDe(null); }} />
                </div>
              ) : (
                <button type="button" className="t3add" onClick={() => { setDentroDe(s.id); setTextoDentro(''); }}>
                  <Plus size={15} />Agregar dentro de “{s.texto}”
                </button>
              )}
            </li>
          </ul>
        )}
      </li>
    );
  };

  return (
    <section className="card tcard open tediting" aria-label={esNueva ? 'Nueva tarea' : `Editar ${tarea?.nombre}`}>
      <div className="teh">
        <button type="button" className="tico btn" aria-label="Cambiar el ícono" aria-expanded={verIconos} onClick={() => setVerIconos((v) => !v)}>
          <HabitIcon name={icono} size={19} />
        </button>
        <input className="tedit tnamein" value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => guardarCabecera()}
          placeholder={esNueva ? '¿Qué quieres lograr?' : ''} aria-label="Nombre de la tarea" autoFocus={esNueva} maxLength={60} />
      </div>
      {verIconos && (
        <div className="ticonos" role="group" aria-label="Ícono de la tarea">
          {TAREA_ICONOS.map((n) => (
            <button key={n} type="button" aria-pressed={icono === n} aria-label={n}
              onClick={() => { setIcono(n); setVerIconos(false); guardarCabecera(n); }}>
              <HabitIcon name={n} size={19} />
            </button>
          ))}
        </div>
      )}

      {tarea && (
        <>
          <p className="tpista">Con + le agregas pasos más pequeños a un paso. Mantén presionado ⋮⋮ para arrastrarlo; hacia la derecha lo metes dentro del de arriba.</p>
          <ul className="tarbol">{tarea.subtareas.map(renderPaso)}</ul>
        </>
      )}
      {esNueva && arbol.length > 0 && (
        <>
          <p className="tpista">Toca ⋯ en un paso para dividirlo en pasos más pequeños.</p>
          <ul className="tarbol">
            {arbol.map(renderPasoNuevo)}
          </ul>
        </>
      )}

      <div className="tagrega-in">
        <Plus size={16} strokeWidth={2.4} />
        <input className="tinput" value={textoNuevo} onChange={(e) => setTextoNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') agregarAbajo(); }} onBlur={() => { if (tarea) agregarAbajo(); }}
          placeholder={esNueva ? 'Escribe el primer paso, por pequeño que sea' : 'Agregar un paso'} aria-label="Agregar un paso" />
      </div>

      <div className="tacciones fin">
        {esNueva
          ? <button type="button" className="tbtnq" onClick={() => onListo()}>Cancelar</button>
          : <button type="button" className="tbtnq tdelq" onClick={() => tarea && onBorrar?.(tarea)}><Trash2 size={15} /> Borrar tarea</button>}
        {esNueva
          ? <button type="button" className="btnp sm" disabled={!nombre.trim()} onClick={crear}>Crear tarea</button>
          : <button type="button" className="btnp sm" onClick={() => { guardarCabecera(); onListo(); }}>Listo</button>}
      </div>

      {opciones && esNueva && (() => {
        const p = buscarPaso(arbol, opciones.pasoId);
        if (!p) return null;
        return (
          <HojaOpcionesPaso
            paso={p}
            tareaNombre={nombre || 'Nueva tarea'}
            esGrande={true}
            hoy={''}
            onDividir={() => {
              setDentroDe(p.id);
              setTextoDentro('');
            }}
            onDia={() => {}}
            onTexto={() => setEditandoPaso(p.id)}
            onBorrar={() => setArbol((a) => borrarPaso(a, p.id))}
            onCerrar={() => setOpciones(null)}
          />
        );
      })()}
    </section>
  );
};
