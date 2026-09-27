import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, CalendarPlus, Check, ChevronDown, ListChecks, Pencil, Play, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Subtarea, Tarea } from '../../types';
import { getTodayString, obtenerHojasSubtareas } from '../../utils/habitUtils';
import {
  avanceTarea, siguientePaso, fechaTerminada, textoDiaCorto, textoDiaLargo, textoFechaLarga, resumenTareas,
} from '../../utils/tareasUtils';
import { HojaDiaPaso } from '../tareas/HojaDiaPaso';
import { TareaEditar } from '../tareas/TareaEditar';

/** Pestaña Tareas (celular). design/maqueta-tareas.html marcos 1 a 9 · DESIGN.md › Tareas. */

const SEGUNDOS_AVISO = 6000;

interface HojaAbierta { tareaId: string; pasoId: string }
interface Aviso { texto: string; deshacer: () => void }

const Barra: React.FC<{ tarea: Tarea }> = ({ tarea }) => {
  const { hechos, total } = avanceTarea(tarea);
  return (
    <div className="tavance">
      <i aria-hidden="true"><b style={{ width: `${total ? Math.round((hechos / total) * 100) : 0}%` }} /></i>
      <span><span className="num">{hechos} de {total}</span> pasos</span>
    </div>
  );
};

const Casilla: React.FC<{ paso: Subtarea; onToggle: () => void }> = ({ paso, onToggle }) => (
  <span className={`tchk${paso.hecha ? ' on' : ''}`} role="checkbox" tabIndex={0} aria-checked={paso.hecha} aria-label={paso.texto}
    onClick={onToggle}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}>
    {paso.hecha && <Check size={15} strokeWidth={3} />}
  </span>
);

const ChipDia: React.FC<{ paso: Subtarea; hoy: string; onAbrir: () => void }> = ({ paso, hoy, onAbrir }) => {
  if (paso.hecha) return null;
  if (!paso.fecha) {
    return <button type="button" className="tdia vacio" aria-label={`Ponerle día a ${paso.texto}`} onClick={onAbrir}><CalendarPlus size={17} /></button>;
  }
  const corto = textoDiaCorto(paso.fecha, hoy);
  return (
    <button type="button" className={`tdia${corto === 'hoy' ? ' hoy' : ''}`} aria-label={`Día de ${paso.texto}: ${textoDiaLargo(paso.fecha, hoy)}. Cambiar`} onClick={onAbrir}>
      <Calendar size={13} />{corto}
    </button>
  );
};

export const TasksScreen: React.FC = () => {
  const {
    tareas, toggleSubtarea, ponerFechaPaso, reabrirTarea, eliminarTarea, restaurarTarea,
    openFocusMode, isTareaEditorOpen, tareaBeingEdited, openTareaEditor, closeTareaEditor,
  } = useHabitStore();
  const hoy = getTodayString();

  // Al entrar se abre la primera tarea con un paso para hoy (si no hay, todas plegadas)
  const [abierta, setAbierta] = useState<string | null>(() => {
    const conHoy = tareas.find((t) => !t.completada && obtenerHojasSubtareas(t.subtareas).some((h) => !h.hecha && h.fecha === hoy));
    return conHoy ? conHoy.id : null;
  });
  const [verTerminadas, setVerTerminadas] = useState(false);
  const [hoja, setHoja] = useState<HojaAbierta | null>(null);
  const [recien, setRecien] = useState<{ tareaId: string; pasoId: string } | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const timerRecien = useRef<number | null>(null);
  const timerAviso = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRecien.current) window.clearTimeout(timerRecien.current);
    if (timerAviso.current) window.clearTimeout(timerAviso.current);
  }, []);

  const mostrarAviso = (a: Aviso) => {
    if (timerAviso.current) window.clearTimeout(timerAviso.current);
    setAviso(a);
    timerAviso.current = window.setTimeout(() => setAviso(null), SEGUNDOS_AVISO);
  };

  // Marcar un paso; si con eso se termina la tarea, se queda a la vista con "Deshacer"
  const marcar = (t: Tarea, paso: Subtarea) => {
    const pendientes = obtenerHojasSubtareas(t.subtareas).filter((h) => h.texto?.trim() && !h.hecha);
    const termina = !paso.hecha && pendientes.length === 1 && pendientes[0].id === paso.id;
    toggleSubtarea(t.id, paso.id);
    if (termina) {
      if (timerRecien.current) window.clearTimeout(timerRecien.current);
      setRecien({ tareaId: t.id, pasoId: paso.id });
      timerRecien.current = window.setTimeout(() => setRecien(null), SEGUNDOS_AVISO);
    }
  };
  const deshacerTerminar = () => {
    if (!recien) return;
    toggleSubtarea(recien.tareaId, recien.pasoId);
    if (timerRecien.current) window.clearTimeout(timerRecien.current);
    setRecien(null);
  };

  const borrar = (t: Tarea) => {
    const indice = tareas.findIndex((x) => x.id === t.id);
    eliminarTarea(t.id);
    closeTareaEditor();
    mostrarAviso({ texto: t.nombre, deshacer: () => restaurarTarea(t, indice) });
  };

  const abiertas = tareas.filter((t) => !t.completada || t.id === recien?.tareaId);
  const terminadas = useMemo(() => tareas
    .filter((t) => t.completada && t.id !== recien?.tareaId)
    .sort((a, b) => (fechaTerminada(b) || '').localeCompare(fechaTerminada(a) || '')), [tareas, recien]);

  const tareaDeHoja = hoja ? tareas.find((t) => t.id === hoja.tareaId) : null;
  const pasoDeHoja = hoja && tareaDeHoja ? obtenerHojasSubtareas(tareaDeHoja.subtareas).find((h) => h.id === hoja.pasoId) : null;

  const creando = isTareaEditorOpen && !tareaBeingEdited;
  const resumen = resumenTareas(tareas, hoy);

  // ---------- Árbol de pasos (vista normal: marcar y ponerle día) ----------
  const renderPaso = (t: Tarea, s: Subtarea, sigId: string | null): React.ReactNode => {
    const hijos = s.subtareas || [];
    const esPadre = hijos.length > 0;
    const esSig = s.id === sigId;
    const hojas = esPadre ? obtenerHojasSubtareas(hijos).filter((h) => h.texto?.trim()) : [];
    return (
      <li key={s.id} className={`tpaso${s.hecha ? ' done' : ''}${esSig ? ' sig' : ''}`}>
        <div className="tfila">
          {esPadre ? <span className="tpadre" aria-hidden="true" /> : <Casilla paso={s} onToggle={() => marcar(t, s)} />}
          <span className="ttxt">
            <span className="tnom">{s.texto}</span>
            {esPadre && <span className="tsub"><span className="num">{hojas.filter((h) => h.hecha).length} de {hojas.length}</span> pasos</span>}
            {esSig && <span className="tsigchip">Sigue</span>}
          </span>
          {!esPadre && <ChipDia paso={s} hoy={hoy} onAbrir={() => setHoja({ tareaId: t.id, pasoId: s.id })} />}
        </div>
        {esPadre && <ul className="tarbol tsubl">{hijos.map((h) => renderPaso(t, h, sigId))}</ul>}
      </li>
    );
  };

  const encabezado = (t: Tarea, open: boolean) => (
    <h2 className="thh" id={`tarea-${t.id}`}>
      <button type="button" className="thead" aria-expanded={open} onClick={() => setAbierta(open ? null : t.id)} title={t.nombre}>
        <span className="tico" aria-hidden="true"><HabitIcon name={t.icono} size={19} /></span>
        <span className="tmain"><span className="tname">{t.nombre}</span><Barra tarea={t} /></span>
        <span className="tchev" aria-hidden="true"><ChevronDown size={18} className={open ? 'rotate-180' : ''} /></span>
      </button>
    </h2>
  );

  const tarjeta = (t: Tarea) => {
    // Editando esta tarea
    if (isTareaEditorOpen && tareaBeingEdited?.id === t.id) {
      return <TareaEditar key={t.id} tarea={t} onListo={closeTareaEditor} onBorrar={borrar} />;
    }
    // Acabas de terminarla
    if (recien?.tareaId === t.id) {
      return (
        <section key={t.id} className="card tcard tfin" aria-labelledby={`tarea-${t.id}`}>
          <h2 className="thh" id={`tarea-${t.id}`}>
            <div className="thead">
              <span className="tico ok" aria-hidden="true"><Check size={20} strokeWidth={3} /></span>
              <span className="tmain"><span className="tname">{t.nombre}</span><Barra tarea={t} /></span>
            </div>
          </h2>
          <div className="tfinbody" role="status">
            <p className="tfintit">Terminaste {t.nombre}</p>
            <p className="sub" style={{ fontSize: 13 }}>Paso a paso, llegaste. En unos segundos baja a Terminadas.</p>
            <button type="button" className="tbtnq" onClick={deshacerTerminar}><RotateCcw size={15} />Deshacer</button>
          </div>
        </section>
      );
    }
    const open = abierta === t.id;
    const sig = siguientePaso(t);
    return (
      <section key={t.id} className={`card tcard${open ? ' open' : ''}`} aria-labelledby={`tarea-${t.id}`}>
        {encabezado(t, open)}
        {open ? (
          <>
            <div className="tacciones">
              <button type="button" className="tbtn2" onClick={() => openFocusMode({ tipo: 'tarea', tareaId: t.id })}><Play size={12} className="fill-current" />Empezar en Foco</button>
              <button type="button" className="tbtnq" onClick={() => openTareaEditor(t)}><Pencil size={15} />Editar tarea</button>
            </div>
            <ul className="tarbol">{t.subtareas.map((s) => renderPaso(t, s, sig?.id ?? null))}</ul>
            <AgregarPaso tareaId={t.id} />
          </>
        ) : sig ? (
          <div className="tsig">
            <div className="tfila">
              <Casilla paso={sig} onToggle={() => marcar(t, sig)} />
              <span className="ttxt"><span className="tnom">{sig.texto}</span><span className="tsigchip">Sigue</span></span>
              <ChipDia paso={sig} hoy={hoy} onAbrir={() => setHoja({ tareaId: t.id, pasoId: sig.id })} />
            </div>
          </div>
        ) : null}
      </section>
    );
  };

  const nada = abiertas.length === 0 && terminadas.length === 0 && !creando;

  return (
    <div id="screen-tareas" className="tareas pb-28 animate-fadeIn text-text font-body">
      <div className="tcab">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="font-heading font-bold m-0" style={{ fontSize: 40, lineHeight: 1 }}>Tareas</h1>
          {resumen && <p className="sub" style={{ marginTop: 6, fontSize: 14 }}>{resumen}</p>}
        </div>
        {!nada && <button type="button" className="tnueva" onClick={() => openTareaEditor(null)}><Plus size={18} strokeWidth={2.4} />Nueva tarea</button>}
      </div>

      {creando && <TareaEditar tarea={null} onListo={closeTareaEditor} />}

      {nada ? (
        <div className="tvacio">
          <span className="tvico" aria-hidden="true"><ListChecks size={40} strokeWidth={1.6} /></span>
          <h2 className="font-heading font-bold m-0" style={{ fontSize: 26 }}>Todavía no tienes tareas</h2>
          <p className="sub" style={{ fontSize: 15, maxWidth: 290 }}>Una tarea grande se vuelve fácil cuando la partes en pasos pequeños. Aquí marcas cada paso, uno a la vez.</p>
          <button type="button" className="btnp" style={{ marginTop: 8 }} onClick={() => openTareaEditor(null)}><Plus size={18} strokeWidth={2.4} />Crear mi primera tarea</button>
        </div>
      ) : (
        <>
          {abiertas.map(tarjeta)}
          {terminadas.length > 0 && (
            <section className="tterm" aria-labelledby="tareas-terminadas">
              <h2 className="tterm-h" id="tareas-terminadas">
                <button type="button" aria-expanded={verTerminadas} onClick={() => setVerTerminadas((v) => !v)}>
                  <span>Terminadas <span className="tcnt num">{terminadas.length}</span></span>
                  <ChevronDown size={18} className={verTerminadas ? 'rotate-180' : ''} />
                </button>
              </h2>
              {verTerminadas && (
                <ul className="ttlist">
                  {terminadas.map((t) => {
                    const { total } = avanceTarea(t);
                    const f = fechaTerminada(t);
                    return (
                      <li key={t.id} className="ttrow">
                        <span className="tico" aria-hidden="true"><HabitIcon name={t.icono} size={18} /></span>
                        <span className="tmain">
                          <span className="tname2" title={t.nombre}>{t.nombre}</span>
                          <span className="tsub"><span className="tok"><Check size={13} strokeWidth={3} /><span className="num">{total} de {total}</span></span>{f ? ` · el ${textoFechaLarga(f)}` : ''}</span>
                        </span>
                        <button type="button" className="tbtnq sm" aria-label={`Reabrir ${t.nombre}`} onClick={() => { reabrirTarea(t.id); setAbierta(t.id); }}><RotateCcw size={15} />Reabrir</button>
                        <button type="button" className="tdel" aria-label={`Borrar ${t.nombre}`} onClick={() => borrar(t)}><Trash2 size={17} /></button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      {hoja && tareaDeHoja && pasoDeHoja && (
        <HojaDiaPaso
          pasoTexto={pasoDeHoja.texto}
          tareaNombre={tareaDeHoja.nombre}
          fecha={pasoDeHoja.fecha}
          hoy={hoy}
          onElegir={(f) => { ponerFechaPaso(tareaDeHoja.id, pasoDeHoja.id, f); setHoja(null); }}
          onCerrar={() => setHoja(null)}
        />
      )}

      {aviso && createPortal(
        <div className="tareas">
          <div className="ttoast" role="status">
            <span>Borraste <b>{aviso.texto}</b></span>
            <button type="button" onClick={() => { aviso.deshacer(); setAviso(null); }}>Deshacer</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

/** "Agregar un paso" al final de una tarea abierta: se vuelve un campo; Enter guarda y deja listo otro. */
const AgregarPaso: React.FC<{ tareaId: string }> = ({ tareaId }) => {
  const { agregarPasoTarea } = useHabitStore();
  const [activo, setActivo] = useState(false);
  const [texto, setTexto] = useState('');
  if (!activo) {
    return <button type="button" className="tagregar" onClick={() => setActivo(true)}><Plus size={16} strokeWidth={2.4} />Agregar un paso</button>;
  }
  const guardar = () => { if (texto.trim()) agregarPasoTarea(tareaId, null, texto); setTexto(''); };
  return (
    <div className="tagrega-in">
      <Plus size={16} strokeWidth={2.4} />
      <input className="tinput tinput-on" autoFocus value={texto} placeholder="Agregar un paso" aria-label="Agregar un paso"
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') guardar(); if (e.key === 'Escape') { setTexto(''); setActivo(false); } }}
        onBlur={() => { guardar(); setActivo(false); }} />
    </div>
  );
};
