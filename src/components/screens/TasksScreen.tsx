import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarRange, Check, ChevronDown, ChevronRight, ListChecks, MoreHorizontal, Pencil, Play, Plus, RotateCcw, ArrowUp, ArrowDown, GripVertical, X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Subtarea, Tarea } from '../../types';
import { getTodayString, obtenerHojasSubtareas } from '../../utils/habitUtils';
import { siguientePaso, fechaTerminada, resumenTareas, buscarPaso, agruparTareas, grupoTarea, lineaTarea, moverTareaEnGrupo, colocarTareaEnGrupo, GrupoTarea, avanceTarea } from '../../utils/tareasUtils';
import { HojaDiaPaso } from '../tareas/HojaDiaPaso';
import { TareaEditar } from '../tareas/TareaEditar';
import { Barra, Casilla, ChipDia, Terminadas } from '../tareas/piezas';
import { ControlTareas, TareasEscritorio } from '../tareas/TareasEscritorio';
import { HojaOpcionesPaso } from '../tareas/HojaOpcionesPaso';
import { HojaPegarLista } from '../tareas/HojaPegarLista';
import { leerListaPegada, aSubtareas, ListaPegada, contarPegados } from '../../utils/pegarLista';
import { useEsEscritorio } from './TodayScreen';
import { useMantenerPresionado } from '../tareas/mantenerPresionado';
import { HojaMenuTarea } from '../tareas/HojaMenuTarea';

/** Pestaña Tareas. design/maqueta-tareas.html (celular: marcos 1 a 9; escritorio: 10 a 13) · DESIGN.md › Tareas. */

const SEGUNDOS_AVISO = 6000;

interface HojaAbierta { tareaId: string; pasoId: string }
interface Aviso { antes: string; texto: string; deshacer: () => void }

export const TasksScreen: React.FC = () => {
  const {
    tareas, toggleSubtarea, ponerFechaPaso, reabrirTarea, eliminarTarea, restaurarTarea,
    openFocusMode, navigateToTab, isTareaEditorOpen, tareaBeingEdited, openTareaEditor, closeTareaEditor,
    editarTextoPaso, agregarPasoTarea, borrarPasoTarea, quitarPasosTarea, reordenarTareas,
    tareaPorAbrir, yaAbriTarea
  } = useHabitStore();
  const hoy = getTodayString();
  const desk = useEsEscritorio();

  // En el celular, al entrar todas las tareas están plegadas (lo pidió Johnatan el 29 sep: así se entiende la lista).
  // En escritorio, TareasEscritorio elige la suya.
  const [abierta, setAbierta] = useState<string | null>(null);
  const [verTerminadas, setVerTerminadas] = useState(false);
  const [hoja, setHoja] = useState<HojaAbierta | null>(null);
  const [recien, setRecien] = useState<{ tareaId: string; pasoId: string } | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [plegadoManual, setPlegadoManual] = useState<Record<string, boolean>>({});
  const [opciones, setOpciones] = useState<{ tareaId: string; pasoId: string } | null>(null);
  const [editandoPaso, setEditandoPaso] = useState<string | null>(null);
  const [dentroDe, setDentroDe] = useState<string | null>(null);
  const [textoDentro, setTextoDentro] = useState('');
  
  // Grupos por cuándo (DESIGN.md › Tareas 2): la tarea que abriste o en la que marcaste un paso no salta de grupo hasta salir de Tareas
  const [fijos, setFijos] = useState<Record<string, GrupoTarea>>({});
  const [mostrarPista, setMostrarPista] = useState(false);
  const [menuTarea, setMenuTarea] = useState<string | null>(null);
  const [ordenando, setOrdenando] = useState<{ elegida: string; antes: string[] } | null>(null);
  const [anuncioLive, setAnuncioLive] = useState('');

  const timerRecien = useRef<number | null>(null);
  const timerAviso = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem('racha_pista_mantener') !== '1') {
        setMostrarPista(true);
      }
    } catch (e) {}
    return () => {
      if (timerRecien.current) window.clearTimeout(timerRecien.current);
      if (timerAviso.current) window.clearTimeout(timerAviso.current);
    };
  }, []);

  useEffect(() => {
    if (ordenando) {
      document.body.classList.add('sin-barra');
    } else {
      document.body.classList.remove('sin-barra');
    }
    return () => document.body.classList.remove('sin-barra');
  }, [ordenando]);

  useEffect(() => {
    if (!desk && tareaPorAbrir) {
      const id = tareaPorAbrir;
      const t = tareas.find((x) => x.id === id);
      if (t && !t.completada) {
        const g = grupoTarea(t, hoy).grupo;
        setFijos((prev) => ({ ...prev, [id]: prev[id] ?? g }));
        setAbierta(id);
        yaAbriTarea();
        setTimeout(() => {
          document.getElementById(`tarea-${id}`)?.scrollIntoView({ block: 'start' });
        }, 50);
      } else {
        yaAbriTarea();
      }
    }
  }, [desk, tareaPorAbrir, tareas, hoy, yaAbriTarea]);

  const fijar = (tId: string) => {
    const t = tareas.find(x => x.id === tId);
    if (!t) return;
    const g = grupoTarea(t, hoy).grupo;
    setFijos(prev => ({ ...prev, [t.id]: prev[t.id] ?? g }));
  };

  const cerrarPista = () => {
    setMostrarPista(false);
    try { localStorage.setItem('racha_pista_mantener', '1'); } catch (e) {}
  };

  const mostrarAviso = (a: Aviso) => {
    if (timerAviso.current) window.clearTimeout(timerAviso.current);
    setAviso(a);
    timerAviso.current = window.setTimeout(() => setAviso(null), SEGUNDOS_AVISO);
  };

  // Marcar un paso; si con eso se termina la tarea, se queda a la vista con "Deshacer"
  const marcar = (t: Tarea, paso: Subtarea) => {
    fijar(t.id);
    const pendientes = obtenerHojasSubtareas(t.subtareas).filter((h) => h.texto?.trim() && !h.hecha);
    const dentro = paso.subtareas?.length ? obtenerHojasSubtareas(paso.subtareas).map((h) => h.id) : [paso.id];
    const termina = !paso.hecha && pendientes.length > 0 && pendientes.every((h) => dentro.includes(h.id));
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
    mostrarAviso({ antes: 'Borraste', texto: t.nombre, deshacer: () => restaurarTarea(t, indice) });
  };

  const abiertas = tareas.filter((t) => !t.completada || t.id === recien?.tareaId);
  const terminadas = useMemo(() => tareas
    .filter((t) => t.completada && t.id !== recien?.tareaId)
    .sort((a, b) => (fechaTerminada(b) || '').localeCompare(fechaTerminada(a) || '')), [tareas, recien]);

  const tareaDeHoja = hoja ? tareas.find((t) => t.id === hoja.tareaId) : null;
  const pasoDeHoja = hoja && tareaDeHoja ? obtenerHojasSubtareas(tareaDeHoja.subtareas).find((h) => h.id === hoja.pasoId) : null;

  const creando = isTareaEditorOpen && !tareaBeingEdited;
  const resumen = resumenTareas(tareas, hoy);

  const renderPaso = (t: Tarea, s: Subtarea, sigId: string | null): React.ReactNode => {
    const hijos = s.subtareas || [];
    const esPadre = hijos.length > 0;
    const esSig = s.id === sigId;
    const hojas = esPadre ? obtenerHojasSubtareas(hijos).filter((h) => h.texto?.trim()) : [];
    const plegado = plegadoManual[s.id] ?? s.hecha;

    const guardarDentro = () => {
      if (textoDentro.trim()) agregarPasoTarea(t.id, s.id, textoDentro);
      setTextoDentro('');
    };

    return (
      <li key={s.id} className={`tpaso${s.hecha ? ' done' : ''}${esSig ? ' sig' : ''}`}>
        <div className="tfila">
          <Casilla paso={s} onToggle={() => marcar(t, s)} />
          <span className="ttxt">
            {editandoPaso === s.id ? (
              <input className="tinput tinput-on" autoFocus defaultValue={s.texto} aria-label="Texto del paso"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.currentTarget.value.trim() && e.currentTarget.value.trim() !== s.texto) {
                      editarTextoPaso(t.id, s.id, e.currentTarget.value.trim());
                    }
                    setEditandoPaso(null);
                  }
                  if (e.key === 'Escape') setEditandoPaso(null);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value.trim() !== s.texto) {
                    editarTextoPaso(t.id, s.id, e.target.value.trim());
                  }
                  setEditandoPaso(null);
                }}
              />
            ) : (
              <span className="tnom">{s.texto}</span>
            )}
            {esPadre && <span className="tsub"><span className="num">{hojas.filter((h) => h.hecha).length} de {hojas.length}</span> pasos</span>}
            {esSig && <span className="tsigchip">Sigue</span>}
          </span>
          {!esPadre ? (
            <div style={{ display: 'flex', gap: '4px' }}>
              <ChipDia paso={s} hoy={hoy} onAbrir={() => setHoja({ tareaId: t.id, pasoId: s.id })} />
              <button type="button" className="t3mas" aria-label={`Opciones de ${s.texto}`} onClick={() => setOpciones({ tareaId: t.id, pasoId: s.id })}>
                <MoreHorizontal size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex' }}>
              <button type="button" className="t3fle" aria-expanded={!plegado} aria-label={plegado ? `Mostrar los pasos de ${s.texto}` : `Esconder los pasos de ${s.texto}`} onClick={() => setPlegadoManual(p => ({ ...p, [s.id]: !plegado }))}>
                {plegado ? <ChevronDown size={18} /> : <ChevronDown size={18} style={{ transform: 'rotate(180deg)' }} />}
              </button>
              <button type="button" className="t3mas" aria-label={`Opciones de ${s.texto}`} onClick={() => setOpciones({ tareaId: t.id, pasoId: s.id })}>
                <MoreHorizontal size={18} />
              </button>
            </div>
          )}
        </div>
        {esPadre && !plegado && (
          <ul className="tarbol tsubl">
            {hijos.map((h) => renderPaso(t, h, sigId))}
            {abierta === t.id && dentroDe === s.id && (
              <li className="tpaso">
                <div className="tagrega-in" style={{ borderTop: 'none', padding: '0 0 0 10px' }}>
                  <Plus size={16} strokeWidth={2.4} />
                  <input className="tinput tinput-on" autoFocus placeholder="Escribe un paso más pequeño" aria-label={`Nuevo paso dentro de ${s.texto}`}
                    value={textoDentro} onChange={(e) => setTextoDentro(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') guardarDentro(); if (e.key === 'Escape') { setTextoDentro(''); setDentroDe(null); } }}
                    onBlur={() => { guardarDentro(); setDentroDe(null); }} />
                </div>
              </li>
            )}
          </ul>
        )}
        {!esPadre && dentroDe === s.id && (
          <ul className="tarbol tsubl">
            <li className="tpaso">
              <div className="tagrega-in" style={{ borderTop: 'none', padding: '0 0 0 10px' }}>
                <Plus size={16} strokeWidth={2.4} />
                <input className="tinput tinput-on" autoFocus placeholder="Escribe un paso más pequeño" aria-label={`Nuevo paso dentro de ${s.texto}`}
                  value={textoDentro} onChange={(e) => setTextoDentro(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') guardarDentro(); if (e.key === 'Escape') { setTextoDentro(''); setDentroDe(null); } }}
                  onBlur={() => { guardarDentro(); setDentroDe(null); }} />
              </div>
            </li>
          </ul>
        )}
      </li>
    );
  };

  const encabezado = (t: Tarea, open: boolean) => (
    <h2 className="thh" id={`tarea-${t.id}`}>
      <button type="button" className="thead" aria-expanded={open} onClick={() => { fijar(t.id); setAbierta(open ? null : t.id); }} title={t.nombre}>
        <span className="tico" aria-hidden="true"><HabitIcon name={t.icono} size={19} /></span>
        <span className="tmain"><span className="tname">{t.nombre}</span><Barra tarea={t} /></span>
        <span className="tchev" aria-hidden="true"><ChevronDown size={18} className={open ? 'rotate-180' : ''} /></span>
      </button>
    </h2>
  );

  const renderItemCelular = (t: Tarea) => {
    if (isTareaEditorOpen && tareaBeingEdited?.id === t.id) {
      // Editando esta tarea
      return <li key={t.id} className="tfc-open"><TareaEditar tarea={t} onListo={closeTareaEditor} onBorrar={borrar} /></li>;
    }
    // Acabas de terminarla
    if (recien?.tareaId === t.id) {
      return (
        <li key={t.id} className="tfc-open">
          <section className="card tcard tfin" aria-labelledby={`tarea-${t.id}`}>
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
        </li>
      );
    }
    
    const open = abierta === t.id;
    if (open) {
      const sig = siguientePaso(t);
      return (
        <li key={t.id} className="tfc-open">
          <section className={`card tcard open`} aria-labelledby={`tarea-${t.id}`}>
            {encabezado(t, true)}
            <div className="tacciones">
              <button type="button" className="tbtn2" onClick={() => openFocusMode({ tipo: 'tarea', tareaId: t.id })}><Play size={12} className="fill-current" />Empezar en Foco</button>
              <button type="button" className="tbtnq" onClick={() => openTareaEditor(t)}><Pencil size={15} />Editar tarea</button>
            </div>
            <ul className="tarbol">{t.subtareas.map((s) => renderPaso(t, s, sig?.id ?? null))}</ul>
            <AgregarPaso tareaId={t.id} onPegado={(tId, ids, n) => {
              mostrarAviso({ antes: 'Agregaste', texto: `${n} ${n === 1 ? 'paso' : 'pasos'}`, deshacer: () => quitarPasosTarea(tId, ids) });
            }} />
          </section>
        </li>
      );
    }

    return <FilaCompacta key={t.id} t={t} hoy={hoy} alAbrir={() => { fijar(t.id); setAbierta(t.id); }} onMarcar={(paso) => marcar(t, paso)} onMenu={() => { setMenuTarea(t.id); cerrarPista(); }} alzada={menuTarea === t.id} />;
  };

  const nada = abiertas.length === 0 && terminadas.length === 0 && !creando;
  const ctl: ControlTareas = {
    hoy, marcar, borrar,
    abrirHoja: (tareaId, pasoId) => setHoja({ tareaId, pasoId }), recien, deshacerTerminar,
    avisar: (antes, texto, deshacer) => mostrarAviso({ antes, texto, deshacer }),
    fijos, fijar,
  };

  const gruposAbiertos = agruparTareas(abiertas, hoy, fijos);

  const moveUp = (id: string, idsGrupo: string[], titulo: string) => {
    const idsActuales = tareas.map(x => x.id);
    const nuevo = moverTareaEnGrupo(idsActuales, idsGrupo, id, 'arriba');
    if (nuevo) {
      reordenarTareas(nuevo);
      const t = tareas.find(x => x.id === id);
      const idx = idsGrupo.indexOf(id);
      setAnuncioLive(`${t?.nombre}, ${idx} de ${idsGrupo.length} en ${titulo}`);
    }
  };
  const moveDown = (id: string, idsGrupo: string[], titulo: string) => {
    const idsActuales = tareas.map(x => x.id);
    const nuevo = moverTareaEnGrupo(idsActuales, idsGrupo, id, 'abajo');
    if (nuevo) {
      reordenarTareas(nuevo);
      const t = tareas.find(x => x.id === id);
      const idx = idsGrupo.indexOf(id) + 2;
      setAnuncioLive(`${t?.nombre}, ${idx} de ${idsGrupo.length} en ${titulo}`);
    }
  };
  const salirOrden = () => {
    if (!ordenando) return;
    const ordenActual = tareas.map(x => x.id);
    if (JSON.stringify(ordenActual) !== JSON.stringify(ordenando.antes)) {
      const antes = ordenando.antes;
      mostrarAviso({ antes: 'Cambiaste el orden', texto: '', deshacer: () => reordenarTareas(antes) });
    }
    setOrdenando(null);
  };

  if (!desk && ordenando) {
    return (
      <div id="screen-tareas" className="tareas pb-28 lg:pb-0 animate-fadeIn text-text font-body">
        <div className="torden-h">
          <h1 className="font-heading font-bold m-0" style={{ fontSize: 32, lineHeight: 1.05 }}>Cambiar de lugar</h1>
          <p className="sub" style={{ marginTop: 6, fontSize: 14 }}>Toca una tarea y muévela con las flechas, o arrástrala desde ⋮⋮. Se mueve dentro de su grupo.</p>
        </div>
        <div className="sr-only" aria-live="polite">{anuncioLive}</div>
        
        {gruposAbiertos.map((g) => (
          <section key={g.grupo} className="tgrupo" aria-label={g.titulo}>
            {gruposAbiertos.length > 1 && <h2 className="tsec">{g.titulo} <span className="num">{g.tareas.length}</span></h2>}
            <ul className="tlist tcel">
              {g.tareas.map((t, idx) => {
                const sel = ordenando.elegida === t.id;
                const idsGrupo = g.tareas.map(x => x.id);
                return (
                  <FilaOrden key={t.id} t={t} sel={sel} idsGrupo={idsGrupo}
                    onSelect={() => setOrdenando(o => o ? { ...o, elegida: t.id } : null)}
                    moveUp={() => moveUp(t.id, idsGrupo, g.titulo)}
                    moveDown={() => moveDown(t.id, idsGrupo, g.titulo)}
                    onDrop={(newIdx) => {
                      const idsActuales = tareas.map(x => x.id);
                      const nuevo = colocarTareaEnGrupo(idsActuales, idsGrupo, t.id, newIdx);
                      if (nuevo) reordenarTareas(nuevo);
                    }}
                  />
                );
              })}
            </ul>
          </section>
        ))}
        
        <div className="torden-pie">
          <button type="button" className="btnp full" style={{margin:0}} onClick={salirOrden}>Listo</button>
        </div>
      </div>
    );
  }

  return (
    <div id="screen-tareas" className="tareas pb-28 lg:pb-0 animate-fadeIn text-text font-body">
      {desk ? <TareasEscritorio ctl={ctl} abiertas={abiertas} terminadas={terminadas} resumen={resumen} /> : (<>
      <div className="tcab">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="font-heading font-bold m-0" style={{ fontSize: 40, lineHeight: 1 }}>Tareas</h1>
          {resumen && <p className="sub" style={{ marginTop: 6, fontSize: 14 }}>{resumen}</p>}
        </div>
        {!nada && <button type="button" className="tnueva" onClick={() => openTareaEditor(null)}><Plus size={18} strokeWidth={2.4} />Nueva tarea</button>}
      </div>
      {!nada && <button type="button" className="tasemana" onClick={() => navigateToTab('semana')}><CalendarRange size={18} /><span>Planea tu semana</span><ChevronRight size={18} /></button>}

      {mostrarPista && abiertas.length > 0 && (
        <div className="tpista1" role="note">
          <span>Mantén presionada una tarea para editarla, moverla o borrarla.</span>
          <button type="button" className="tpista1-x" aria-label="Entendido, no mostrar más" onClick={cerrarPista}><X size={16}/></button>
        </div>
      )}

      {creando && <TareaEditar tarea={null} onListo={closeTareaEditor} />}

      {nada ? (
        <div className="tvacio">
          <span className="tvico" aria-hidden="true"><ListChecks size={40} strokeWidth={1.6} /></span>
          <h2 className="font-heading font-bold m-0" style={{ fontSize: 26 }}>Todavía no tienes tareas</h2>
          <p className="sub" style={{ fontSize: 15, maxWidth: 290 }}>Una tarea grande se vuelve fácil cuando la partes en pasos pequeños. Aquí marcas cada paso, uno a la vez.</p>
          <p className="t5otra">¿Ya tienes un plan de ChatGPT o Gemini? Crea la tarea y pega la lista en los pasos.</p>
          <button type="button" className="btnp" style={{ marginTop: 8 }} onClick={() => openTareaEditor(null)}><Plus size={18} strokeWidth={2.4} />Crear mi primera tarea</button>
        </div>
      ) : (
        <>
          {gruposAbiertos.map((g) => (
            <section key={g.grupo} className="tgrupo" aria-label={g.titulo}>
              {gruposAbiertos.length > 1 && <h2 className="tsec">{g.titulo} <span className="num">{g.tareas.length}</span></h2>}
              <ul className="tlist tcel">
                {g.tareas.map(renderItemCelular)}
              </ul>
            </section>
          ))}
          <Terminadas terminadas={terminadas} abierto={verTerminadas} onAlternar={() => setVerTerminadas((v) => !v)}
            onReabrir={(t) => { reabrirTarea(t.id); setAbierta(t.id); }} onBorrar={borrar} />
        </>
      )}
      </>)}

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
      
      {opciones && (() => {
        const t = tareas.find(x => x.id === opciones.tareaId);
        const p = t ? buscarPaso(t.subtareas, opciones.pasoId) : null;
        if (!t || !p) return null;
        const esGrande = (p.subtareas || []).length > 0;
        return (
          <HojaOpcionesPaso
            paso={p}
            tareaNombre={t.nombre}
            esGrande={esGrande}
            hoy={hoy}
            onDividir={() => {
              setPlegadoManual((m) => ({ ...m, [p.id]: false }));
              setDentroDe(p.id);
              setTextoDentro('');
            }}
            onDia={() => setHoja({ tareaId: t.id, pasoId: p.id })}
            onTexto={() => setEditandoPaso(p.id)}
            onBorrar={() => borrarPasoTarea(t.id, p.id)}
            onCerrar={() => setOpciones(null)}
          />
        );
      })()}

      {menuTarea && (() => {
        const t = tareas.find(x => x.id === menuTarea);
        if (!t) return null;
        const g = gruposAbiertos.find(x => x.tareas.some(y => y.id === t.id));
        const puedeMover = g ? g.tareas.length > 1 : false;
        return (
          <HojaMenuTarea
            tarea={t}
            puedeMover={puedeMover}
            onCerrar={() => setMenuTarea(null)}
            onEditar={() => { setMenuTarea(null); fijar(t.id); setAbierta(t.id); openTareaEditor(t); }}
            onMover={() => { setMenuTarea(null); setOrdenando({ elegida: t.id, antes: tareas.map(x => x.id) }); }}
            onBorrar={() => { setMenuTarea(null); borrar(t); }}
          />
        );
      })()}

      {aviso && createPortal(
        <div className="tareas">
          <div className="ttoast" role="status">
            <span>{aviso.antes}{aviso.texto && <> <b>{aviso.texto}</b></>}</span>
            <button type="button" onClick={() => { aviso.deshacer(); setAviso(null); }}>Deshacer</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

/** "Agregar un paso" al final de una tarea abierta: se vuelve un campo; Enter guarda y deja listo otro. */
const AgregarPaso: React.FC<{ tareaId: string; onPegado: (tId: string, ids: string[], n: number) => void }> = ({ tareaId, onPegado }) => {
  const { agregarPasoTarea, agregarPasosPegados } = useHabitStore();
  const [activo, setActivo] = useState(false);
  const [texto, setTexto] = useState('');
  const [pegado, setPegado] = useState<ListaPegada | null>(null);

  if (pegado) {
    return (
      <HojaPegarLista
        lista={pegado}
        conNombre={false}
        escritorio={false}
        onAgregar={(pasos) => {
          const arr = aSubtareas(pasos);
          const ids = agregarPasosPegados(tareaId, arr);
          setPegado(null);
          setActivo(false);
          setTexto('');
          onPegado(tareaId, ids, contarPegados(pasos).total);
        }}
        onCancelar={() => setPegado(null)}
      />
    );
  }

  if (!activo) {
    return <button type="button" className="tagregar" onClick={() => setActivo(true)}><Plus size={16} strokeWidth={2.4} />Agregar un paso</button>;
  }
  const guardar = () => { if (texto.trim()) agregarPasoTarea(tareaId, null, texto); setTexto(''); };
  return (
    <div className="tagrega-in">
      <Plus size={16} strokeWidth={2.4} />
      <input className="tinput tinput-on" autoFocus value={texto} placeholder="Agregar un paso" aria-label="Agregar un paso"
        onChange={(e) => setTexto(e.target.value)}
        onPaste={(e) => {
          if (e.currentTarget.value.trim()) return;
          const lista = leerListaPegada(e.clipboardData.getData('text'));
          if (!lista) return;
          e.preventDefault();
          setPegado(lista);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter') guardar(); if (e.key === 'Escape') { setTexto(''); setActivo(false); } }}
        onBlur={() => { guardar(); setActivo(false); }} />
    </div>
  );
};

const FilaCompacta: React.FC<{ t: Tarea; hoy: string; alAbrir: () => void; onMarcar: (paso: Subtarea) => void; onMenu: () => void; alzada?: boolean }> = ({ t, hoy, alAbrir, onMarcar, onMenu, alzada }) => {
  const { props } = useMantenerPresionado(onMenu);
  const linea = lineaTarea(t, hoy);

  return (
    <li className={`tfc${alzada ? ' alzada' : ''}`} {...props}>
      <button type="button" className="tfc-a" aria-expanded={false} onClick={alAbrir} title={t.nombre}>
        <span className="tico" aria-hidden="true"><HabitIcon name={t.icono} size={19} /></span>
        <span className="tmain">
          <span className="tname2">{t.nombre}</span>
          <span className="tsub">
            {linea.paso ? (
              linea.dia ? <><b className="tcuando">{linea.dia}</b> · {linea.paso.texto}</> : <>Sigue: {linea.paso.texto}</>
            ) : null}
          </span>
          <Barra tarea={t} className="sm" corta={true} />
        </span>
      </button>
      {linea.paso && (
        <Casilla paso={linea.paso} etiqueta={`Marcar ${linea.paso.texto}`} onToggle={() => onMarcar(linea.paso!)} />
      )}
    </li>
  );
};

const FilaOrden: React.FC<{ t: Tarea; sel: boolean; onSelect: () => void; idsGrupo: string[]; moveUp: () => void; moveDown: () => void; onDrop: (idx: number) => void }> = ({ t, sel, onSelect, idsGrupo, moveUp, moveDown, onDrop }) => {
  const masDeUna = idsGrupo.length > 1;
  const liRef = useRef<HTMLLIElement>(null);
  const [offset, setOffset] = useState(0);
  const idx = idsGrupo.indexOf(t.id);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const asa = e.currentTarget as HTMLElement;
    asa.setPointerCapture(e.pointerId);
    
    const startY = e.clientY;
    const parent = liRef.current?.parentElement;
    if (!parent || !liRef.current) return;
    
    // Lo que hay de una fila a la siguiente (alto + espacio de la lista)
    const itemHeight = liRef.current.offsetHeight + (parseFloat(getComputedStyle(parent).rowGap) || 0);
    const origIdx = idx;
    
    onSelect();
    
    const onMove = (em: PointerEvent) => {
      const dy = em.clientY - startY;
      setOffset(dy);
    };
    
    const onUp = (eu: PointerEvent) => {
      asa.releasePointerCapture(eu.pointerId);
      asa.removeEventListener('pointermove', onMove);
      asa.removeEventListener('pointerup', onUp);
      asa.removeEventListener('pointercancel', onUp);
      
      const dy = eu.clientY - startY;
      setOffset(0);
      
      const steps = Math.round(dy / itemHeight);
      let newIdx = origIdx + steps;
      newIdx = Math.max(0, Math.min(newIdx, idsGrupo.length - 1));
      
      if (newIdx !== origIdx) {
        onDrop(newIdx);
      }
    };
    
    asa.addEventListener('pointermove', onMove);
    asa.addEventListener('pointerup', onUp);
    asa.addEventListener('pointercancel', onUp);
  };

  return (
    <li ref={liRef} className={`tord${sel ? ' sel' : ''}`} onClick={onSelect} style={{ transform: offset ? `translateY(${offset}px)` : 'none', zIndex: offset ? 10 : 1 }}>
      <div className="tli">
        <span className="tico" aria-hidden="true"><HabitIcon name={t.icono} size={19} /></span>
        <span className="tmain"><span className="tname2">{t.nombre}</span></span>
        {sel && (
          <span className="tflechas">
            <button type="button" aria-label={`Subir ${t.nombre}`} aria-disabled={idx === 0}
              onClick={(e) => { e.stopPropagation(); moveUp(); }}>
              <ArrowUp size={20} />
            </button>
            <button type="button" aria-label={`Bajar ${t.nombre}`} aria-disabled={idx === idsGrupo.length - 1}
              onClick={(e) => { e.stopPropagation(); moveDown(); }}>
              <ArrowDown size={20} />
            </button>
          </span>
        )}
        {masDeUna && (
          <button type="button" className="tasa" aria-label={`Arrastrar ${t.nombre}`} onPointerDown={onPointerDown}>
            <GripVertical size={20} />
          </button>
        )}
      </div>
    </li>
  );
};
