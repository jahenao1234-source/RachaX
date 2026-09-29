import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Link2, ArrowRight, Pause, Play, Coffee, Timer } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { getMomentoColorTokens } from '../common/HabitPreviewRow';
import { getTodayString, obtenerHojasSubtareas } from '../../utils/habitUtils';
import { useEsEscritorio } from './TodayScreen';
import {
  RelojFoco, relojNuevo, corriendo, transcurridoMs, restanteMs, terminado, pausar, seguir, avance, cerrarBloque,
  formatoReloj, formatoDuracion, guardarFocoEnCurso, leerFocoEnCurso, revisarFocoEnCurso, DURACIONES_POMODORO,
  DURACION_POR_DEFECTO, descansoPara, subtituloLibre, MINIMO_GUARDAR_SEG,
} from '../../utils/focoUtils';
import { prepararSonido, programarSonido, cancelarSonido, vibrar, usePantallaEncendida } from '../../utils/focoAviso';
import { FocusTarget, Habito, Subtarea } from '../../types';

/** Modo Foco. design/maqueta-foco.html · DESIGN.md › Modo Foco. Cálculos del reloj en utils/focoUtils.ts. */

type Fase = 'elegir' | 'foco' | 'finPomodoro' | 'descanso' | 'finDescanso' | 'fin';
type Paso = { kind: 'habito'; key: string; habito: Habito } | { kind: 'sub'; key: string; sub: Subtarea };

const nuevoId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);
const CLAVE_MINUTOS = 'racha_foco_minutos';
const leerMinutos = () => {
  try {
    const m = parseInt(localStorage.getItem(CLAVE_MINUTOS) || '', 10);
    return (DURACIONES_POMODORO as readonly number[]).includes(m) ? m : DURACION_POR_DEFECTO;
  } catch { return DURACION_POR_DEFECTO; }
};
const esHabitos = (t: FocusTarget | null) => t?.tipo === 'dia' || t?.tipo === 'rutina';

export const FocusModeScreen: React.FC = () => {
  const {
    isFocusModeOpen, closeFocusMode, focusTarget, openFocusMode,
    habitos, habitosDeHoy, habitosActivos, tareas,
    esHabitoCompletado, toggleCompletado, setValor, toggleSubtarea, guardarSesionFoco, sesionesFoco,
  } = useHabitStore();
  const desk = useEsEscritorio();
  const hoy = getTodayString();

  const [fase, setFase] = useState<Fase>('elegir');
  const [reloj, setReloj] = useState<RelojFoco | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const [minutos, setMinutos] = useState(leerMinutos);
  const [pomodoro, setPomodoro] = useState(1);
  const [bloqueId, setBloqueId] = useState(nuevoId);
  const [etiquetaLibre, setEtiquetaLibre] = useState('');
  const [index, setIndex] = useState(0);
  const [sinReloj, setSinReloj] = useState(false);
  const [salir, setSalir] = useState(false);
  const [deFondo, setDeFondo] = useState(false);
  const [deshacer, setDeshacer] = useState<{ tareaId: string; pasoId: string; texto: string; index: number } | null>(null);
  // Resumen de esta vez
  const [segGuardados, setSegGuardados] = useState(0);
  const [pomodorosHechos, setPomodorosHechos] = useState(0);
  const [pasosMarcados, setPasosMarcados] = useState(0);
  const [pasosEnPomodoro, setPasosEnPomodoro] = useState(0);
  const [anuncio, setAnuncio] = useState('');
  const abierto = useRef(false);
  const retomado = useRef(false);
  const btnHecho = useRef<HTMLButtonElement>(null);
  const tituloFin = useRef<HTMLHeadingElement>(null);
  const timerDeshacer = useRef<number | null>(null);

  // ---------- Pasos ----------
  const tareaActual = focusTarget?.tipo === 'tarea' ? tareas.find((t) => t.id === focusTarget.tareaId) ?? null : null;
  let pasos: Paso[] = [];
  if (focusTarget?.tipo === 'tarea') {
    pasos = obtenerHojasSubtareas(tareaActual?.subtareas).filter((s) => s.texto?.trim()).map((s) => ({ kind: 'sub', key: s.id, sub: s }));
  } else if (focusTarget?.tipo === 'rutina') {
    pasos = focusTarget.habitoIds.map((id) => habitos.find((h) => h.id === id)).filter((h): h is Habito => !!h && !h.archivado).map((h) => ({ kind: 'habito', key: h.id, habito: h }));
  } else if (focusTarget?.tipo === 'dia') {
    pasos = [...habitosDeHoy, ...habitosActivos.filter((h) => h.frecuencia === 'semanal')].map((h) => ({ kind: 'habito', key: h.id, habito: h }));
  }
  const total = pasos.length;
  const pasoHecho = (p: Paso) => (p.kind === 'sub' ? p.sub.hecha : esHabitoCompletado(p.habito.id));
  const paso = index < total ? pasos[index] : null;
  const siguientePendiente = (desde: number) => { for (let i = desde; i < total; i++) if (!pasoHecho(pasos[i])) return i; return -1; };
  const tareaTerminada = focusTarget?.tipo === 'tarea' && total > 0 && pasos.every(pasoHecho);

  const nombre =
    focusTarget?.tipo === 'tarea' ? tareaActual?.nombre || 'Tarea'
    : focusTarget?.tipo === 'libre' ? subtituloLibre(etiquetaLibre)
    : paso?.kind === 'habito' ? paso.habito.nombre : 'Tu día';

  // ---------- Guardar un bloque ----------
  const datosBloque = (id: string, habito?: Habito) => {
    if (habito) return { id, tipo: 'habito' as const, habitoId: habito.id, etiqueta: habito.nombre };
    if (focusTarget?.tipo === 'tarea') return { id, tipo: 'tarea' as const, tareaId: focusTarget.tareaId, etiqueta: tareaActual?.nombre || '' };
    return { id, tipo: 'libre' as const, etiqueta: etiquetaLibre.trim() };
  };
  const guardarBloque = (r: RelojFoco | null, habito?: Habito) => {
    if (!r) return;
    const s = cerrarBloque(r, Date.now(), datosBloque(bloqueId, habito));
    if (s) { guardarSesionFoco(s); setSegGuardados((n) => n + s.seg); }
  };
  const relojHabito = (i: number) => {
    const p = i < total ? pasos[i] : null;
    if (p && p.kind === 'habito' && !esHabitoCompletado(p.habito.id)) { setReloj(relojNuevo('crono', Date.now())); setBloqueId(nuevoId()); }
    else setReloj(null);
  };

  // ---------- Al abrir: retomar lo que quedó andando, o empezar ----------
  useEffect(() => {
    const f = leerFocoEnCurso();
    if (!f) return;
    const { retomar, cerrar } = revisarFocoEnCurso(f, Date.now());
    if (cerrar) {
      const t = cerrar.target;
      const h = (t.tipo === 'dia' || t.tipo === 'rutina') ? habitos.find((x) => x.id === cerrar.pasoId) : undefined;
      const datos = h ? { id: cerrar.bloqueId, tipo: 'habito' as const, habitoId: h.id, etiqueta: h.nombre }
        : t.tipo === 'tarea' ? { id: cerrar.bloqueId, tipo: 'tarea' as const, tareaId: t.tareaId, etiqueta: tareas.find((x) => x.id === t.tareaId)?.nombre || '' }
        : { id: cerrar.bloqueId, tipo: 'libre' as const, etiqueta: t.tipo === 'libre' ? t.etiqueta || '' : '' };
      const s = cerrarBloque(cerrar.reloj, Date.now(), datos);
      if (s) guardarSesionFoco(s);
      guardarFocoEnCurso(null);
    } else if (retomar) {
      retomado.current = true;
      openFocusMode(retomar.target);
      setReloj(retomar.reloj);
      setMinutos(retomar.minutos);
      setPomodoro(retomar.pomodoro);
      setBloqueId(retomar.bloqueId);
      if (retomar.target.tipo === 'libre') setEtiquetaLibre(retomar.target.etiqueta || '');
      setFase(retomar.reloj.modo === 'descanso' ? 'descanso' : 'foco');
      if (retomar.reloj.inicioMs !== null && retomar.reloj.modo !== 'crono') { prepararSonido(); programarSonido(restanteMs(retomar.reloj, Date.now())); }
    }
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isFocusModeOpen) { abierto.current = false; return; }
    if (abierto.current) return;
    abierto.current = true;
    setSalir(false); setDeshacer(null); setDeFondo(false);
    setSegGuardados(0); setPomodorosHechos(0); setPasosMarcados(0); setPasosEnPomodoro(0);
    // Índice: el primer pendiente (o el paso guardado si se retomó)
    const guardado = retomado.current ? leerFocoEnCurso()?.pasoId : undefined;
    const iGuardado = guardado ? pasos.findIndex((p) => p.key === guardado) : -1;
    const inicio = iGuardado >= 0 ? iGuardado : focusTarget?.tipo === 'tarea' ? Math.max(0, siguientePendiente(0)) : 0;
    setIndex(inicio);
    if (retomado.current) { retomado.current = false; return; }
    setSinReloj(false); setPomodoro(1); setMinutos(leerMinutos());
    if (esHabitos(focusTarget)) { setFase('foco'); relojHabito(inicio); }
    else { setFase('elegir'); setReloj(null); setEtiquetaLibre(focusTarget?.tipo === 'libre' ? focusTarget.etiqueta || '' : ''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocusModeOpen]);

  // ---------- Tic (solo repinta) ----------
  const andando = !!(isFocusModeOpen && reloj && corriendo(reloj));
  useEffect(() => {
    if (!andando) return;
    setAhora(Date.now());
    const int = window.setInterval(() => setAhora(Date.now()), 250);
    const alVolver = () => setAhora(Date.now());
    document.addEventListener('visibilitychange', alVolver);
    return () => { window.clearInterval(int); document.removeEventListener('visibilitychange', alVolver); };
  }, [andando]);
  usePantallaEncendida(andando);

  // Guardar lo que va andando (al cambiar de fase, pausar o seguir; nunca cada segundo)
  useEffect(() => {
    if (!isFocusModeOpen || !focusTarget) return;
    if (reloj && (fase === 'foco' || fase === 'descanso')) {
      const target: FocusTarget = focusTarget.tipo === 'libre' ? { tipo: 'libre', etiqueta: etiquetaLibre.trim() } : focusTarget;
      guardarFocoEnCurso({ target, reloj, bloqueId, minutos, pomodoro, pasoId: paso?.key });
    } else guardarFocoEnCurso(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocusModeOpen, fase, reloj, bloqueId, minutos, pomodoro, paso?.key]);

  // Pomodoro o descanso que llegó a cero
  useEffect(() => {
    if (!reloj || reloj.modo === 'crono' || !corriendo(reloj) || !terminado(reloj, ahora)) return;
    const finMs = (reloj.inicioMs ?? ahora) + (reloj.duracionMs! - reloj.acumuladoMs);
    const tarde = Date.now() - finMs > 3000;
    if (tarde) cancelarSonido(); else vibrar();
    if (reloj.modo === 'pomodoro') {
      guardarBloque(reloj);
      setPomodorosHechos((n) => n + 1);
      setDeFondo(tarde);
      setReloj(null);
      setFase('finPomodoro');
      setAnuncio('Terminó tu pomodoro');
    } else {
      setReloj(null);
      setFase('finDescanso');
      setAnuncio('Terminó el descanso');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ahora, reloj]);

  // En las pantallas de fin, el foco va al título
  useEffect(() => {
    if (fase === 'fin' || fase === 'finPomodoro' || fase === 'finDescanso') tituloFin.current?.focus();
  }, [fase]);

  // Escritorio: el tiempo en el título de la pestaña
  useEffect(() => {
    if (!desk || !isFocusModeOpen || !reloj) return;
    const antes = document.title;
    const t = reloj.modo === 'crono' ? transcurridoMs(reloj, ahora) : restanteMs(reloj, ahora);
    document.title = `${formatoReloj(t, reloj.modo !== 'crono')} · ${nombre}`;
    return () => { document.title = antes; };
  }, [desk, isFocusModeOpen, reloj, ahora, nombre]);

  // ---------- Acciones ----------
  const cerrarFoco = () => {
    cancelarSonido();
    guardarFocoEnCurso(null);
    setReloj(null);
    setSalir(false);
    closeFocusMode();
  };
  const terminarPorAhora = () => {
    if (reloj && reloj.modo !== 'descanso') guardarBloque(reloj, paso?.kind === 'habito' ? paso.habito : undefined);
    cancelarSonido();
    setReloj(null);
    setSalir(false);
    setFase('fin');
  };
  const pedirSalir = () => {
    if (salir) { setSalir(false); return; }
    if (fase === 'foco' && reloj) setSalir(true);
    else if (fase === 'descanso' || ((fase === 'finPomodoro' || fase === 'finDescanso') && (segGuardados > 0 || pasosMarcados > 0))) terminarPorAhora();
    else if (fase === 'foco' && (segGuardados > 0 || pasosMarcados > 0)) terminarPorAhora();
    else cerrarFoco();
  };
  const pausarOSeguir = () => {
    if (!reloj) return;
    const t = Date.now();
    if (corriendo(reloj)) { setReloj(pausar(reloj, t)); cancelarSonido(); setAnuncio('En pausa'); }
    else {
      const r = seguir(reloj, t);
      setReloj(r);
      if (r.modo !== 'crono') { prepararSonido(); programarSonido(restanteMs(r, t)); }
      setAnuncio('Empezó');
    }
    setAhora(t);
  };
  const empezarPomodoro = (n: number) => {
    prepararSonido();
    const t = Date.now();
    const r = relojNuevo('pomodoro', t, minutos);
    setReloj(r); setAhora(t); setBloqueId(nuevoId()); setPomodoro(n); setPasosEnPomodoro(0); setDeFondo(false);
    programarSonido(restanteMs(r, t));
    try { localStorage.setItem(CLAVE_MINUTOS, String(minutos)); } catch { /* sin almacenamiento */ }
    setFase('foco');
    setAnuncio('Empezó');
  };
  const descansar = () => {
    prepararSonido();
    const t = Date.now();
    const r = relojNuevo('descanso', t, descansoPara(minutos));
    setReloj(r); setAhora(t);
    programarSonido(restanteMs(r, t));
    setFase('descanso');
    setAnuncio('Empezó');
  };
  const saltarDescanso = () => { cancelarSonido(); setReloj(null); setFase('finDescanso'); };

  // Hábitos
  const avanzarHabito = () => {
    const i = index + 1;
    setIndex(i);
    if (i >= total) { setReloj(null); setFase('fin'); return; }
    relojHabito(i);
  };
  const hechoHabito = () => {
    if (!paso || paso.kind !== 'habito') return;
    if (!esHabitoCompletado(paso.habito.id)) {
      if (paso.habito.metaDiaria) setValor(paso.habito.id, hoy, paso.habito.metaDiaria);
      else toggleCompletado(paso.habito.id);
    }
    guardarBloque(reloj, paso.habito);
    avanzarHabito();
  };
  const saltarHabito = () => {
    if (paso?.kind === 'habito') guardarBloque(reloj, paso.habito);
    avanzarHabito();
  };

  // Tareas
  const hechoPaso = () => {
    if (!paso || paso.kind !== 'sub' || !tareaActual) return;
    if (!paso.sub.hecha) {
      toggleSubtarea(tareaActual.id, paso.key);
      setPasosMarcados((n) => n + 1);
      setPasosEnPomodoro((n) => n + 1);
      setDeshacer({ tareaId: tareaActual.id, pasoId: paso.key, texto: paso.sub.texto, index });
      if (timerDeshacer.current) window.clearTimeout(timerDeshacer.current);
      timerDeshacer.current = window.setTimeout(() => setDeshacer(null), 5000);
    }
    const sig = siguientePendiente(index + 1);
    setIndex(sig >= 0 ? sig : total);
    if (sig < 0 && !reloj) setFase('fin');
    window.setTimeout(() => btnHecho.current?.focus(), 0);
  };
  const saltarPaso = () => {
    const sig = siguientePendiente(index + 1);
    if (sig >= 0) setIndex(sig);
  };
  const deshacerPaso = () => {
    if (!deshacer) return;
    toggleSubtarea(deshacer.tareaId, deshacer.pasoId);
    setPasosMarcados((n) => Math.max(0, n - 1));
    setPasosEnPomodoro((n) => Math.max(0, n - 1));
    setIndex(deshacer.index);
    if (fase === 'fin') setFase('foco');
    setDeshacer(null);
  };

  // Teclas: Espacio pausa o sigue, H marca Hecho, Esc sale. Nunca actúan sobre un botón o campo enfocado.
  useEffect(() => {
    if (!isFocusModeOpen) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); pedirSalir(); return; }
      if (e.repeat || salir || fase !== 'foco') return;
      if ((e.target as HTMLElement)?.closest?.('button,input,textarea,select,[role=radio],a')) return;
      if (e.key === ' ') { e.preventDefault(); pausarOSeguir(); }
      else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (esHabitos(focusTarget)) { if (paso && !pasoHecho(paso)) hechoHabito(); }
        else if (paso && !pasoHecho(paso)) hechoPaso();
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  });

  if (!isFocusModeOpen) return null;

  // ---------- Textos de la barra ----------
  const esTarea = focusTarget?.tipo === 'tarea';
  const esLibre = focusTarget?.tipo === 'libre';
  const contexto = focusTarget?.tipo === 'dia' ? 'Tu día' : focusTarget?.tipo === 'rutina' ? focusTarget.nombre : esTarea ? nombre : 'Pomodoro';
  const nPaso = Math.min(index + 1, total);
  const subtitulo =
    esHabitos(focusTarget) ? (total === 1 ? 'Hábito' : `Hábito ${nPaso} de ${total}`)
    : esLibre ? subtituloLibre(etiquetaLibre)
    : fase === 'descanso' ? 'Descanso'
    : fase === 'fin' ? 'Foco'
    : total === 0 ? (fase === 'foco' && !sinReloj ? `Pomodoro ${pomodoro}` : 'Foco')
    : fase === 'foco' && !sinReloj ? `Paso ${nPaso} de ${total} · Pomodoro ${pomodoro}`
    : `Paso ${nPaso} de ${total}`;

  const segmentos = (esHabitos(focusTarget) || esTarea) && total > 1 && (
    <div className="fseg" aria-hidden="true">
      {pasos.map((p, i) => <i key={p.key} className={pasoHecho(p) ? 'on' : i === index && fase !== 'fin' ? 'now' : ''} />)}
    </div>
  );

  const anillo = (r: RelojFoco, desc = false) => {
    const R = 108, C = 2 * Math.PI * R;
    return (
      <div className={`fanillo${desc ? ' desc' : ''}`}>
        <svg viewBox="0 0 236 236" aria-hidden="true">
          <circle className="pista" cx="118" cy="118" r={R} />
          {avance(r, ahora) > 0.004 && <circle className="arco" cx="118" cy="118" r={R} strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - avance(r, ahora))).toFixed(1)} />}
        </svg>
        <div className="dentro" role="timer" aria-label="Tiempo que queda">
          <span className="t">{formatoReloj(restanteMs(r, ahora), true)}</span>
          <span className="q">quedan</span>
        </div>
      </div>
    );
  };

  const tarjetaPaso = paso && paso.kind === 'sub' && !paso.sub.hecha && (
    <div className="fpaso">
      <span className="lab">Ahora</span>
      <span className="txt">{paso.sub.texto}</span>
      {(() => { const s = siguientePendiente(index + 1); return s >= 0 ? <span className="sig">Después: {(pasos[s] as { sub: Subtarea }).sub.texto}</span> : null; })()}
    </div>
  );

  const duracion = (
    <div className="fdur">
      <p className="lab" id="foco-dur">¿Cuánto tiempo?</p>
      <div
        className="fseg3"
        role="radiogroup"
        aria-labelledby="foco-dur"
        aria-describedby="foco-dur-nota"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          const lista = DURACIONES_POMODORO as readonly number[];
          const i = lista.indexOf(minutos);
          const m = lista[(i + (e.key === 'ArrowRight' ? 1 : lista.length - 1)) % lista.length];
          setMinutos(m);
          (e.currentTarget.querySelector(`[data-m="${m}"]`) as HTMLElement | null)?.focus();
        }}
      >
        {DURACIONES_POMODORO.map((m) => (
          <button key={m} type="button" role="radio" data-m={m} aria-checked={minutos === m} tabIndex={minutos === m ? 0 : -1} onClick={() => setMinutos(m)}>{m} min</button>
        ))}
      </div>
      <p className="nota" id="foco-dur-nota">Después descansas 5 minutos (con 50, descansas 10). Suena solo con Racha abierta.</p>
    </div>
  );

  // ---------- Cuerpo según la fase ----------
  let cuerpo: React.ReactNode = null;
  let pie: React.ReactNode = null;

  if (esHabitos(focusTarget) && total === 0) {
    cuerpo = <p className="fsub">Nada que enfocar aquí.</p>;
    pie = <button type="button" className="fbtn" onClick={cerrarFoco}>Volver</button>;
  } else if (fase === 'elegir') {
    cuerpo = (
      <>
        {esLibre && (
          <>
            <span className="fok gris"><Timer size={30} /></span>
            <h1 className="cond ftit">Pomodoro</h1>
            <p className="fsub">Enfócate en una sola cosa. Cuando suene, descansa.</p>
            <div className="fcampo">
              <label htmlFor="foco-que">¿En qué vas a trabajar? (opcional)</label>
              <input id="foco-que" className="in" value={etiquetaLibre} maxLength={60} onChange={(e) => setEtiquetaLibre(e.target.value)} placeholder="Por ejemplo, estudiar para el parcial" />
            </div>
          </>
        )}
        {esTarea && tarjetaPaso}
        {duracion}
      </>
    );
    pie = (
      <>
        <button type="button" className="fbtn" onClick={() => empezarPomodoro(pomodoro)}><Play size={16} fill="currentColor" />Empezar pomodoro</button>
        {esTarea && <button type="button" className="fq" onClick={() => { setSinReloj(true); setReloj(null); setFase('foco'); }}>Seguir sin reloj</button>}
      </>
    );
  } else if (fase === 'foco' && esHabitos(focusTarget) && paso?.kind === 'habito') {
    const h = paso.habito;
    const tok = getMomentoColorTokens(h.momento);
    const hechoYa = esHabitoCompletado(h.id);
    cuerpo = (
      <>
        <div className="fid">
          <span className={`ftile ${tok.bg} ${tok.icon}`}><HabitIcon name={h.icono} size={26} /></span>
          <div>
            <h1 className="cond fname">{h.nombre}</h1>
            {h.anclaje && <p className="fanc"><Link2 size={14} />Después de {h.anclaje}</p>}
          </div>
        </div>
        {hechoYa ? (
          <p className="fsub" style={{ marginTop: 26 }}>Ya lo hiciste hoy</p>
        ) : reloj && (
          <>
            <p className={`freloj${corriendo(reloj) ? '' : ' pausa'}`} role="timer" aria-label="Tiempo">{formatoReloj(transcurridoMs(reloj, ahora))}</p>
            <p className="fcap">{corriendo(reloj) ? 'Tu tiempo se guarda al marcar Hecho o al salir.' : 'En pausa'}</p>
          </>
        )}
      </>
    );
    pie = hechoYa ? (
      <button type="button" className="fbtn" onClick={saltarHabito}>Siguiente<ArrowRight size={18} /></button>
    ) : (
      <>
        <button type="button" ref={btnHecho} className="fbtn" onClick={hechoHabito}><Check size={20} strokeWidth={3} />Hecho</button>
        <div className="ffila">
          <button type="button" className="fsec" onClick={pausarOSeguir}>{reloj && corriendo(reloj) ? <><Pause size={16} />Pausar</> : <><Play size={16} />Seguir</>}</button>
          <button type="button" className="fsec" onClick={saltarHabito}>Saltar<ArrowRight size={16} /></button>
        </div>
      </>
    );
  } else if (fase === 'foco') {
    // Tarea (con o sin reloj) o pomodoro solo
    const hayPendiente = !!paso && !pasoHecho(paso);
    cuerpo = (
      <>
        {reloj ? anillo(reloj) : esTarea && !hayPendiente ? <span className="fok"><Check size={30} strokeWidth={3} /></span> : null}
        {tarjetaPaso}
      </>
    );
    pie = (
      <>
        {esTarea && hayPendiente && <button type="button" ref={btnHecho} className="fbtn" onClick={hechoPaso}><Check size={20} strokeWidth={3} />Hecho</button>}
        {(reloj || (esTarea && hayPendiente)) && (
          <div className="ffila">
            {reloj && <button type="button" className="fsec" onClick={pausarOSeguir}>{corriendo(reloj) ? <><Pause size={16} />Pausar</> : <><Play size={16} />Seguir</>}</button>}
            {esTarea && hayPendiente && <button type="button" className="fsec" onClick={saltarPaso}>Saltar<ArrowRight size={16} /></button>}
          </div>
        )}
        <button type="button" className="fq" onClick={reloj ? () => setSalir(true) : terminarPorAhora}>Terminar por ahora</button>
      </>
    );
  } else if (fase === 'finPomodoro') {
    const n = pasosEnPomodoro;
    const donde = esLibre ? (etiquetaLibre.trim() ? ` en ${etiquetaLibre.trim()}` : ' de foco') : ` en ${nombre}`;
    cuerpo = (
      <>
        <span className="fok"><Check size={30} strokeWidth={3} /></span>
        <h1 className="cond ftit" ref={tituloFin} tabIndex={-1}>{deFondo ? 'Terminó tu pomodoro mientras no estabas' : 'Terminó tu pomodoro'}</h1>
        <p className="fsub">{minutos} min{donde}.{n > 0 ? ` Marcaste ${n} ${n === 1 ? 'paso' : 'pasos'}.` : ''}</p>
      </>
    );
    pie = (
      <>
        <button type="button" className="fbtn" onClick={descansar}><Coffee size={18} />Descansar {descansoPara(minutos)} min</button>
        <button type="button" className="fsec" onClick={() => empezarPomodoro(pomodoro + 1)}><Play size={16} />Otro pomodoro</button>
        <button type="button" className="fq" onClick={terminarPorAhora}>Terminar por ahora</button>
      </>
    );
  } else if (fase === 'descanso' && reloj) {
    cuerpo = (
      <>
        <p className="fetq">Descanso</p>
        {anillo(reloj, true)}
        <p className="fsub" style={{ marginTop: 22 }}>Párate, toma agua y mira lejos un momento.</p>
      </>
    );
    pie = (
      <>
        <button type="button" className="fsec" onClick={saltarDescanso}>Saltar el descanso<ArrowRight size={16} /></button>
        <button type="button" className="fq" onClick={terminarPorAhora}>Terminar por ahora</button>
      </>
    );
  } else if (fase === 'finDescanso') {
    const sig = esTarea && paso && !pasoHecho(paso) ? paso : null;
    cuerpo = (
      <>
        <span className="fok gris"><Coffee size={28} /></span>
        <h1 className="cond ftit" ref={tituloFin} tabIndex={-1}>Terminó el descanso</h1>
        {sig?.kind === 'sub' && <p className="fsub">Cuando quieras, sigue con {sig.sub.texto}.</p>}
      </>
    );
    pie = (
      <>
        <button type="button" className="fbtn" onClick={() => empezarPomodoro(pomodoro + 1)}><Play size={16} fill="currentColor" />Empezar pomodoro {pomodoro + 1}</button>
        <button type="button" className="fq" onClick={terminarPorAhora}>Terminar por ahora</button>
      </>
    );
  } else {
    // fin
    const cols: [string, React.ReactNode][] = [];
    if (segGuardados >= MINIMO_GUARDAR_SEG) cols.push(['Tiempo', formatoDuracion(segGuardados)]);
    if (pomodorosHechos > 0) cols.push(['Pomodoros', pomodorosHechos]);
    if (esTarea && pasosMarcados > 0) cols.push(['Pasos', pasosMarcados]);
    cuerpo = (
      <>
        <span className="fok"><Check size={30} strokeWidth={3} /></span>
        <h1 className="cond ftit" ref={tituloFin} tabIndex={-1}>{tareaTerminada ? `Terminaste ${nombre}` : 'Terminaste por ahora'}</h1>
        <p className="fsub">Tu avance quedó guardado. Sigue cuando quieras.</p>
        {cols.length > 0 && (
          <dl className="fres" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
            {cols.map(([t, v]) => <div key={t}><dt>{t}</dt><dd>{v}</dd></div>)}
          </dl>
        )}
      </>
    );
    pie = <button type="button" className="fbtn" onClick={cerrarFoco}>Volver</button>;
  }

  const minHoyTarea = esTarea && tareaActual
    ? sesionesFoco.filter((s) => s.fecha === hoy && s.tareaId === tareaActual.id).reduce((n, s) => n + s.seg, 0)
    : 0;
  const listaPasos = desk && esTarea && tareaActual && total > 0 && (
    <section className="dlista" aria-labelledby="foco-lista-t">
      <h2 className="cond" id="foco-lista-t">{tareaActual.nombre}</h2>
      <p className="dmin">{pasos.filter(pasoHecho).length} de {total} pasos{minHoyTarea >= MINIMO_GUARDAR_SEG ? ` · ${formatoDuracion(minHoyTarea)} en Foco hoy` : ''}</p>
      <ol>
        {pasos.map((p, i) => {
          const ok = pasoHecho(p);
          const ahoraEs = !ok && i === index && fase !== 'fin';
          return (
            <li key={p.key} className={ok ? 'ok' : ahoraEs ? 'now' : ''}>
              <span className="c" aria-hidden="true">{ok && <Check size={14} strokeWidth={3} />}</span>
              <span>{p.kind === 'sub' ? p.sub.texto : ''}</span>
              {ahoraEs && <span className="sigue">Sigue</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );

  const seLlevan = reloj ? Math.floor(transcurridoMs(reloj, ahora) / 1000) : 0;

  return (
    <div className="foco" role="dialog" aria-modal="true" aria-label="Modo Foco">
      <div className="fbar">
        <button type="button" className="fx" aria-label="Salir de Foco" onClick={pedirSalir}><X size={18} /></button>
        <div className="fctx"><b>{contexto}</b><span>{subtitulo}</span></div>
      </div>
      {segmentos}

      <div className={listaPasos ? 'dfoco' : 'fcuerpo'}>
        <div className="fcol">
          <div className="fbody">{cuerpo}</div>
          <div className="fpie">
            {pie}
            {desk && fase === 'foco' && <p className="fcap" style={{ textAlign: 'center' }}>Teclas: Espacio pausa o sigue · H marca Hecho · Esc sale</p>}
          </div>
        </div>
        {listaPasos}
      </div>

      {deshacer && fase === 'foco' && (
        <div className="toastf" role="status">
          <span>Marcaste {deshacer.texto}.</span>
          <button type="button" onClick={deshacerPaso}>Deshacer</button>
        </div>
      )}

      {salir && (
        <>
          <div className="fscrim" onClick={() => setSalir(false)} aria-hidden="true" />
          <div className="fhoja" role="alertdialog" aria-modal="true" aria-labelledby="foco-salir-t" aria-describedby="foco-salir-d">
            <h2 className="cond" id="foco-salir-t">¿Terminar por ahora?</h2>
            <p id="foco-salir-d">Llevas {formatoDuracion(seLlevan)} en {nombre}.{seLlevan >= MINIMO_GUARDAR_SEG ? ' Se guardan.' : ''}</p>
            <button type="button" className="fbtn" autoFocus onClick={() => setSalir(false)}><Play size={16} fill="currentColor" />Seguir</button>
            <button type="button" className="fsec" onClick={terminarPorAhora}>Terminar por ahora</button>
          </div>
        </>
      )}

      <div role="status" className="sr-only">{anuncio}</div>
    </div>
  );
};
