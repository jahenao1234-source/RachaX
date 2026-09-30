import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, Plus, Trash2, MoreHorizontal, MessageCircle, X, ArrowUp, ArrowDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Subtarea, Tarea } from '../../types';
import { nuevoIdPaso, agregarPaso, editarTextoPaso as editarTextoPasoPuro, borrarPaso, buscarPaso } from '../../utils/tareasUtils';
import { useArrastrePasos, movimientosPaso, destinoConTeclado } from './arrastrePasos';
import { HojaOpcionesPaso } from './HojaOpcionesPaso';
import { HojaPegarLista } from './HojaPegarLista';
import { HojaPlanIA } from './HojaPlanIA';
import { leerListaPegada, aSubtareas, ListaPegada } from '../../utils/pegarLista';
import { useEsEscritorio } from '../screens/TodayScreen';

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
  const { crearTarea, editarTarea, editarTextoPaso, agregarPasoTarea, borrarPasoTarea, moverPasoTarea } = useHabitStore();
  const esNueva = !tarea;
  const [nombre, setNombre] = useState(tarea ? tarea.nombre : '');
  const [icono, setIcono] = useState(tarea ? tarea.icono : 'ListChecks');
  const [verIconos, setVerIconos] = useState(false);
  const [arbol, setArbol] = useState<Subtarea[]>([]); // solo para Nueva tarea
  const [opciones, setOpciones] = useState<{ pasoId: string } | null>(null);
  const [pegado, setPegado] = useState<ListaPegada | null>(null);
  const desk = useEsEscritorio();
  const [editandoPaso, setEditandoPaso] = useState<string | null>(null);
  const [verIA, setVerIA] = useState(false);
  const [textoNuevo, setTextoNuevo] = useState('');
  const [dentroDe, setDentroDe] = useState<string | null>(null);
  const [textoDentro, setTextoDentro] = useState('');
  const [moviendo, setMoviendo] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState('');

  useEffect(() => {
    if (!desk && moviendo) {
      document.body.classList.add('sin-barra');
      return () => document.body.classList.remove('sin-barra');
    }
  }, [desk, moviendo]);

  useEffect(() => {
    if (moviendo) {
      const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoviendo(null); };
      document.addEventListener('keydown', esc);
      return () => document.removeEventListener('keydown', esc);
    }
  }, [moviendo]);

  useEffect(() => {
    if (moviendo && tarea) {
      if (!buscarPaso(tarea.subtareas, moviendo)) {
        setMoviendo(null);
      } else {
        document.querySelector(`[data-paso-li="${moviendo}"]`)?.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [moviendo, tarea?.subtareas]);

  const moverDir = (dir: 'arriba' | 'abajo' | 'dentro' | 'fuera') => {
    if (!tarea || !moviendo) return;
    const d = destinoConTeclado(tarea.subtareas, moviendo, dir);
    if (d && moverPasoTarea(tarea.id, moviendo, { padreId: d.padreId, indice: d.indice })) {
      setAnuncio(d.mensaje);
    }
  };

  const guardarCabecera = (nuevoIcono = icono) => {
    if (!tarea) return;
    const limpio = nombre.trim();
    editarTarea(tarea.id, { nombre: limpio || tarea.nombre, icono: nuevoIcono });
  };

  // Arrastrar: mantener presionado ⋮⋮ (arrastrePasos.ts)
  const { arrastre, asa, destinoEn, estilo } = useArrastrePasos(tarea);

  const renderPaso = (s: Subtarea): React.ReactNode => {
    const arrastrando = arrastre?.id === s.id;
    const isMov = moviendo === s.id;
    const d = destinoEn(s.id);
    return (
      <li key={s.id} data-paso-li={s.id} className={`tpaso${arrastrando ? ' drag' : ''}${!desk && isMov ? ' movil' : ''}`}
        style={estilo(s.id)}>
        {d === 'antes' && <div className="tlinea" aria-hidden="true" />}
        <div className="tfila" data-paso-row={s.id}>
          {desk ? (
            <span className="tasam" aria-hidden="true" onContextMenu={(e) => e.preventDefault()}
              {...asa(s.id)}>
              <GripVertical size={18} />
            </span>
          ) : (
            <button type="button" className="tasam" aria-label={`Mover ${s.texto}`} aria-pressed={isMov}
              {...asa(s.id)} onClick={() => setMoviendo((m) => (m === s.id ? null : s.id))}>
              <GripVertical size={18} />
            </button>
          )}
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
    <section className={`card tcard open tediting${!desk && moviendo ? ' moviendo' : ''}`} aria-label={esNueva ? 'Nueva tarea' : `Editar ${tarea?.nombre}`}>
      <div className="teh">
        <button type="button" className="tico btn" aria-label="Cambiar el ícono" aria-expanded={verIconos} onClick={() => setVerIconos((v) => !v)}>
          <HabitIcon name={icono} size={19} />
        </button>
        <input className="tedit tnamein" value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => guardarCabecera()}
          onPaste={(e) => {
            // Si pegan una lista en el nombre de una tarea nueva, se abre igual "Pegaste una lista" (el título va al nombre)
            if (!esNueva) return;
            const lista = leerListaPegada(e.clipboardData.getData('text'));
            if (!lista) return;
            e.preventDefault();
            setPegado(lista);
          }}
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
          <p className="tpista">Toca ⋮⋮ para mover un paso con los botones, o mantenlo y arrástralo. Con + le agregas un paso más pequeño adentro.</p>
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
          onPaste={(e) => {
            if (!esNueva) return;
            if (e.currentTarget.value.trim()) return;
            const lista = leerListaPegada(e.clipboardData.getData('text'));
            if (!lista) return;
            e.preventDefault();
            setPegado(lista);
          }}
          placeholder={esNueva ? 'Escribe el primer paso, por pequeño que sea' : 'Agregar un paso'} aria-label="Agregar un paso" />
      </div>
      {esNueva && arbol.length === 0 && (
        <div className="t5ia">
          <p className="tpista">¿Tienes la lista en otro lado, como un chat con una IA? Cópiala y pégala aquí, en los pasos.</p>
          <button type="button" className="t5btn" onClick={() => setVerIA(true)}><MessageCircle size={16} />Pedirle el plan a una IA</button>
        </div>
      )}

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
      
      {verIA && <HojaPlanIA nombre={nombre} onCerrar={() => setVerIA(false)} />}

      {pegado && esNueva && (
        <HojaPegarLista
          lista={pegado}
          conNombre={!nombre.trim()}
          escritorio={desk}
          onAgregar={(pasos, nuevoNombre) => {
            setArbol((a) => [...a, ...aSubtareas(pasos)]);
            if (nuevoNombre && !nombre.trim()) setNombre(nuevoNombre);
            setPegado(null);
            setTextoNuevo('');
          }}
          onCancelar={() => setPegado(null)}
        />
      )}
      
      {!desk && moviendo && tarea && createPortal(
        <div className="tareas">
          {(() => {
            const paso = buscarPaso(tarea.subtareas, moviendo);
            if (!paso) return null;
            const m = movimientosPaso(tarea.subtareas, moviendo);
            return (
              <div className="tmueve" role="toolbar" aria-label={`Mover ${paso.texto}`}>
                <div className="tmueve-h">
                  <span>
                    <span className="tmueve-t">Mover <b>{paso.texto}</b></span>
                    {m.padre && <span className="tmueve-s">Está dentro de “{m.padre}”</span>}
                  </span>
                  <button type="button" className="tmueve-x" aria-label="Dejar de mover" onClick={() => setMoviendo(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="tmueve-b">
                  <button type="button" aria-disabled={!m.arriba} onClick={() => m.arriba && moverDir('arriba')}><ArrowUp size={22} /><span>Subir</span></button>
                  <button type="button" aria-disabled={!m.abajo} onClick={() => m.abajo && moverDir('abajo')}><ArrowDown size={22} /><span>Bajar</span></button>
                  <button type="button" aria-disabled={!m.dentro} onClick={() => m.dentro && moverDir('dentro')}><ArrowRight size={22} /><span>Meter dentro</span></button>
                  <button type="button" aria-disabled={!m.fuera} onClick={() => m.fuera && moverDir('fuera')}><ArrowLeft size={22} /><span>Sacar</span></button>
                </div>
              </div>
            );
          })()}
        </div>,
        document.body
      )}
      <div className="sr-only" aria-live="polite">{anuncio}</div>
    </section>
  );
};
