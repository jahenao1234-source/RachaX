import React, { useEffect, useRef, useState } from 'react';
import { GripVertical, ListChecks, MoreHorizontal, Pencil, Play, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Subtarea, Tarea } from '../../types';
import { obtenerHojasSubtareas } from '../../utils/habitUtils';
import { siguientePaso } from '../../utils/tareasUtils';
import { Barra, Casilla, ChipDia, Terminadas } from './piezas';
import { TAREA_ICONOS, TareaEditar } from './TareaEditar';
import { DirTeclado, destinoConTeclado, useArrastrePasos } from './arrastrePasos';

/** Lo que TasksScreen comparte con el escritorio: marcar, borrar con "Deshacer", la hoja del día y la tarea recién terminada. */
export interface ControlTareas {
  hoy: string;
  marcar: (t: Tarea, paso: Subtarea) => void;
  borrar: (t: Tarea) => void;
  abrirHoja: (tareaId: string, pasoId: string) => void;
  recien: { tareaId: string; pasoId: string } | null;
  deshacerTerminar: () => void;
}

const PISTA_VISTA = 'racha-tareas-pista-arrastre';
const leerPista = () => { try { return localStorage.getItem(PISTA_VISTA) !== '1'; } catch { return true; } };
const guardarPista = () => { try { localStorage.setItem(PISTA_VISTA, '1'); } catch { /* solo es la pista */ } };

const TECLAS: Record<string, DirTeclado> = { ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowRight: 'dentro', ArrowLeft: 'fuera' };

/**
 * Tareas en escritorio (≥1024px): la lista y la tarea abierta. design/maqueta-tareas.html marcos 10 a 13 · DESIGN.md › Tareas.
 */
export const TareasEscritorio: React.FC<{
  ctl: ControlTareas;
  abiertas: Tarea[];
  terminadas: Tarea[];
  resumen: string;
}> = ({ ctl, abiertas, terminadas, resumen }) => {
  const { isTareaEditorOpen, tareaBeingEdited, openTareaEditor, closeTareaEditor, reabrirTarea } = useHabitStore();
  const [elegidaId, setElegidaId] = useState<string | null>(() => {
    const conHoy = abiertas.find((t) => obtenerHojasSubtareas(t.subtareas).some((h) => !h.hecha && h.fecha === ctl.hoy));
    return (conHoy || abiertas[0])?.id ?? null;
  });
  const [verTerminadas, setVerTerminadas] = useState(false);
  const creando = isTareaEditorOpen && !tareaBeingEdited;
  const elegida = creando ? null : abiertas.find((t) => t.id === elegidaId) ?? abiertas[0] ?? null;

  const elegir = (id: string) => { if (creando) closeTareaEditor(); setElegidaId(id); };

  if (abiertas.length === 0 && terminadas.length === 0 && !creando) {
    return (
      <div className="tvacio">
        <span className="tvico" aria-hidden="true"><ListChecks size={40} strokeWidth={1.6} /></span>
        <h1 className="font-heading font-bold m-0" style={{ fontSize: 26 }}>Todavía no tienes tareas</h1>
        <p className="sub" style={{ fontSize: 15, maxWidth: 290 }}>Una tarea grande se vuelve fácil cuando la partes en pasos pequeños. Aquí marcas cada paso, uno a la vez.</p>
        <button type="button" className="btnp" style={{ marginTop: 8 }} onClick={() => openTareaEditor(null)}><Plus size={18} strokeWidth={2.4} />Crear mi primera tarea</button>
      </div>
    );
  }

  return (
    <div className="tdk">
      <section className="tdk-lista" aria-labelledby="tdkl">
        <div className="tdk-lh">
          <h1 className="font-heading font-bold m-0" id="tdkl" style={{ fontSize: 40, lineHeight: 1 }}>Tareas</h1>
          <button type="button" className="tnueva" onClick={() => openTareaEditor(null)}><Plus size={18} strokeWidth={2.4} />Nueva tarea</button>
        </div>
        {resumen && <p className="sub" style={{ margin: '6px 0 14px' }}>{resumen}</p>}
        {!resumen && <div style={{ height: 14 }} />}
        <ul className="tlist">
          {abiertas.map((t) => {
            const on = elegida?.id === t.id;
            const sig = siguientePaso(t);
            return (
              <li key={t.id}>
                <button type="button" className={`tli${on ? ' on' : ''}`} aria-current={on ? 'true' : undefined} title={t.nombre} onClick={() => elegir(t.id)}>
                  <span className="tico" aria-hidden="true"><HabitIcon name={t.icono} size={18} /></span>
                  <span className="tmain">
                    <span className="tname2">{t.nombre}</span>
                    {sig && <span className="tsub">Sigue: {sig.texto}</span>}
                    <Barra tarea={t} className="sm" corta />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <Terminadas terminadas={terminadas} abierto={verTerminadas} onAlternar={() => setVerTerminadas((v) => !v)}
          onReabrir={(t) => { reabrirTarea(t.id); elegir(t.id); }} onBorrar={ctl.borrar} />
      </section>

      {creando ? (
        <TareaEditar tarea={null} onListo={(id) => { closeTareaEditor(); if (id) setElegidaId(id); }} />
      ) : elegida ? (
        <DetalleTarea key={elegida.id} tarea={elegida} ctl={ctl} />
      ) : (
        <section className="tdk-det tdk-nada">
          <p className="sub" style={{ margin: 0, fontSize: 15 }}>No tienes tareas abiertas.</p>
          <button type="button" className="tnueva" onClick={() => openTareaEditor(null)}><Plus size={18} strokeWidth={2.4} />Nueva tarea</button>
        </section>
      )}
    </div>
  );
};

/** La tarea abierta: todo se edita aquí mismo (sin pantalla aparte de Editar). */
const DetalleTarea: React.FC<{ tarea: Tarea; ctl: ControlTareas }> = ({ tarea: t, ctl }) => {
  const { editarTarea, editarTextoPaso, agregarPasoTarea, borrarPasoTarea, moverPasoTarea, openFocusMode } = useHabitStore();
  const [pista, setPista] = useState(leerPista);
  // La pista se quita al soltar el primer arrastre (no al empezar: la lista se correría bajo el mouse)
  const arrastro = useRef(false);
  const { arrastre, asa, destinoEn, estilo } = useArrastrePasos(t, () => { arrastro.current = true; });
  useEffect(() => {
    if (!arrastre && arrastro.current && pista) { setPista(false); guardarPista(); }
  }, [arrastre, pista]);
  const [verIconos, setVerIconos] = useState(false);
  const [editNombre, setEditNombre] = useState(false);
  const [nombre, setNombre] = useState(t.nombre);
  const [menu, setMenu] = useState(false);
  const [dentroDe, setDentroDe] = useState<string | null>(null);
  const [textoDentro, setTextoDentro] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [textoNuevo, setTextoNuevo] = useState('');
  const [anuncio, setAnuncio] = useState('');
  const [enfocar, setEnfocar] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // El menú "···" se cierra al tocar fuera o con Escape
  useEffect(() => {
    if (!menu) return;
    const fuera = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); menuBtn.current?.focus(); } };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', esc);
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', esc); };
  }, [menu]);

  // Después de mover con el teclado, el foco vuelve al asa del mismo paso
  useEffect(() => {
    if (!enfocar) return;
    document.querySelector<HTMLButtonElement>(`[data-asa="${enfocar}"]`)?.focus();
    setEnfocar(null);
  }, [enfocar, t]);

  const guardarNombre = () => {
    const limpio = nombre.trim();
    if (limpio && limpio !== t.nombre) editarTarea(t.id, { nombre: limpio });
    else setNombre(t.nombre);
    setEditNombre(false);
  };

  const guardarTexto = (s: Subtarea, valor: string) => {
    if (valor.trim() && valor.trim() !== s.texto) editarTextoPaso(t.id, s.id, valor);
    setEditando(null);
  };

  const moverConTeclado = (e: React.KeyboardEvent, s: Subtarea) => {
    const dir = TECLAS[e.key];
    if (!e.altKey || !dir) return;
    e.preventDefault();
    const d = destinoConTeclado(t.subtareas, s.id, dir);
    if (!d) { setAnuncio(`${s.texto}: no se puede mover más para ese lado`); return; }
    if (moverPasoTarea(t.id, s.id, { padreId: d.padreId, indice: d.indice })) {
      setAnuncio(d.mensaje);
      setEnfocar(s.id);
    }
  };

  const guardarDentro = (padre: Subtarea) => {
    if (textoDentro.trim()) agregarPasoTarea(t.id, padre.id, textoDentro);
    setTextoDentro('');
  };

  const agregarAbajo = () => {
    if (textoNuevo.trim()) agregarPasoTarea(t.id, null, textoNuevo);
    setTextoNuevo('');
  };

  const sigId = siguientePaso(t)?.id ?? null;
  const recien = ctl.recien?.tareaId === t.id;

  const renderPaso = (s: Subtarea): React.ReactNode => {
    const hijos = s.subtareas || [];
    const esPadre = hijos.length > 0;
    const esSig = s.id === sigId;
    const hojas = esPadre ? obtenerHojasSubtareas(hijos).filter((h) => h.texto?.trim()) : [];
    const d = destinoEn(s.id);
    const cls = `tpaso${s.hecha ? ' done' : ''}${esSig ? ' sig' : ''}${arrastre?.id === s.id ? ' drag' : ''}`;
    return (
      <li key={s.id} data-paso-li={s.id} className={cls} style={estilo(s.id)}>
        {d === 'antes' && <div className="tlinea" aria-hidden="true" />}
        <div className="tfila" data-paso-row={s.id}>
          <button type="button" className="tasa" data-asa={s.id} aria-label={`Mover ${s.texto}`}
            aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowRight Alt+ArrowLeft"
            {...asa(s.id)} onKeyDown={(e) => moverConTeclado(e, s)}>
            <GripVertical size={16} />
          </button>
          {esPadre ? <span className="tpadre" aria-hidden="true" /> : <Casilla paso={s} onToggle={() => ctl.marcar(t, s)} />}
          {editando === s.id ? (
            <>
              <input className="tinput tinput-on" autoFocus defaultValue={s.texto} aria-label="Texto del paso"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') guardarTexto(s, e.currentTarget.value);
                  if (e.key === 'Escape') setEditando(null);
                }}
                onBlur={(e) => guardarTexto(s, e.target.value)} />
              <button type="button" className="tmas vis" aria-label={`Borrar el paso ${s.texto}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { borrarPasoTarea(t.id, s.id); setEditando(null); }}>
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <span className="ttxt">
                <span className="tnom" title="Doble clic para editar" onDoubleClick={() => setEditando(s.id)}>{s.texto}</span>
                {esPadre && <span className="tsub"><span className="num">{hojas.filter((h) => h.hecha).length} de {hojas.length}</span> pasos</span>}
                {esSig && <span className="tsigchip">Sigue</span>}
              </span>
              {!esPadre && <ChipDia paso={s} hoy={ctl.hoy} onAbrir={() => ctl.abrirHoja(t.id, s.id)} />}
              <button type="button" className="tmas" aria-label={`Agregar un paso dentro de ${s.texto}`}
                onClick={() => { setDentroDe(s.id); setTextoDentro(''); }}>
                <Plus size={16} />
              </button>
            </>
          )}
        </div>
        {d === 'dentro' && <div className="tsoltar" aria-hidden="true">Suelta aquí para meterlo dentro de este paso</div>}
        {esPadre && <ul className="tarbol tsubl">{hijos.map(renderPaso)}</ul>}
        {dentroDe === s.id && (
          <ul className="tarbol tsubl">
            <li className="tpaso">
              <div className="tfila tnuevo">
                <span className="tchk" aria-hidden="true" />
                <input className="tinput tinput-on" autoFocus placeholder="Escribe un paso más pequeño" aria-label={`Nuevo paso dentro de ${s.texto}`}
                  value={textoDentro} onChange={(e) => setTextoDentro(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') guardarDentro(s);
                    if (e.key === 'Escape') { setTextoDentro(''); setDentroDe(null); }
                  }}
                  onBlur={() => { guardarDentro(s); setDentroDe(null); }} />
                <span className="tenter" aria-hidden="true">Enter para guardar</span>
              </div>
            </li>
          </ul>
        )}
        {d === 'despues' && <div className="tlinea" aria-hidden="true" />}
      </li>
    );
  };

  return (
    <section className="tdk-det" aria-labelledby="tdkd">
      <div className="tdk-dh">
        <button type="button" className="tico lg btn" aria-label="Cambiar el ícono" aria-expanded={verIconos} onClick={() => setVerIconos((v) => !v)}>
          <HabitIcon name={t.icono} size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editNombre ? (
            <input className="tedit tnamein" autoFocus value={nombre} maxLength={60} aria-label="Nombre de la tarea"
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') guardarNombre();
                if (e.key === 'Escape') { setNombre(t.nombre); setEditNombre(false); }
              }}
              onBlur={guardarNombre} />
          ) : (
            <h2 className="font-heading font-bold m-0 tdk-nom" id="tdkd">{t.nombre}</h2>
          )}
          <Barra tarea={t} style={{ maxWidth: 360, marginTop: 8 }} />
        </div>
        <button type="button" className="tbtn2" onClick={() => openFocusMode({ tipo: 'tarea', tareaId: t.id })}><Play size={12} className="fill-current" />Empezar en Foco</button>
        <div className="tmenu-w" ref={menuRef}>
          <button ref={menuBtn} type="button" className="tbtnq ico" aria-label={`Más opciones de ${t.nombre}`} aria-haspopup="menu" aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}>
            <MoreHorizontal size={18} />
          </button>
          {menu && (
            <div className="tpop" role="menu" aria-label={`Opciones de ${t.nombre}`}>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); setNombre(t.nombre); setEditNombre(true); setVerIconos(true); }}>
                <Pencil size={16} />Editar nombre e ícono
              </button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); ctl.borrar(t); }}>
                <Trash2 size={16} />Borrar tarea
              </button>
            </div>
          )}
        </div>
      </div>

      {verIconos && (
        <div className="ticonos" role="group" aria-label="Ícono de la tarea">
          {TAREA_ICONOS.map((n) => (
            <button key={n} type="button" aria-pressed={t.icono === n} aria-label={n}
              onClick={() => { editarTarea(t.id, { icono: n }); setVerIconos(false); }}>
              <HabitIcon name={n} size={19} />
            </button>
          ))}
        </div>
      )}

      {recien && (
        <div className="tfinbody" role="status">
          <p className="tfintit">Terminaste {t.nombre}</p>
          <p className="sub" style={{ fontSize: 13 }}>Paso a paso, llegaste. En unos segundos baja a Terminadas.</p>
          <button type="button" className="tbtnq" onClick={ctl.deshacerTerminar}><RotateCcw size={15} />Deshacer</button>
        </div>
      )}

      {pista && t.subtareas.length > 1
        ? <p className="sub tdk-ayuda">Arrastra un paso para cambiarlo de lugar, o hacia la derecha para meterlo dentro del de arriba.</p>
        : <div style={{ height: 14 }} />}

      <ul className="tarbol">{t.subtareas.map(renderPaso)}</ul>
      <div className="tdk-add">
        <Plus size={16} strokeWidth={2.4} />
        <input className="tinput" value={textoNuevo} placeholder="Agregar un paso" aria-label={`Agregar un paso a ${t.nombre}`}
          onChange={(e) => setTextoNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') agregarAbajo(); if (e.key === 'Escape') setTextoNuevo(''); }}
          onBlur={agregarAbajo} />
      </div>
      <p className="sr-only" aria-live="polite">{anuncio}</p>
    </section>
  );
};
