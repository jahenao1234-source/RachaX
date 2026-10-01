// Avisos (recordatorios push): design/maqueta-avisos.html, DESIGN.md › "Avisos".
// Las hojas, el recordatorio de Hoy, la fila de Perfil y la pantalla Avisos.
// Los cálculos y los textos están en utils/avisosUtils.ts; lo del navegador, en ./useAvisos.ts. El CSS, en index.css (clases av…).
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellOff, Check, ChevronLeft, ChevronRight, Feather, Moon, Sun, Sunrise, X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { getTodayString } from '../../utils/habitUtils';
import { textoHora } from '../../utils/compromisosUtils';
import { esIOS } from '../../utils/instalarUtils';
import {
  CONFIG_AVISOS, HoraAviso, MomentoAviso,
  debePreguntar, debeRecordarAvisos, errorDeHora, hayAvisos, horaDe, momentosConHabitos,
  preguntaHojaHora, proximoAviso, subtituloPerfilAvisos, textoVolverHora, tituloHojaHora,
} from '../../utils/avisosUtils';
import { SelectorHora } from '../common/SelectorHora';
import { useInstalar } from '../pwa/useInstalar';
import { horaLocal, useAvisos } from './useAvisos';
import { useEsEscritorio } from '../screens/TodayScreen';

const ICONOS = { manana: Sunrise, tarde: Sun, noche: Moon, minima: Feather };
export const IconoMomento: React.FC<{ m: HoraAviso; size?: number }> = ({ m, size = 18 }) => {
  const I = ICONOS[m];
  return <span className={`avm ${m}`} aria-hidden="true"><I size={size} /></span>;
};

const NOMBRE: Record<HoraAviso, { fila: string; de: string; hoja: string }> = {
  manana: { fila: 'Mañana', de: 'la mañana', hoja: 'Hábitos de la mañana' },
  tarde: { fila: 'Tarde', de: 'la tarde', hoja: 'Hábitos de la tarde' },
  noche: { fila: 'Noche', de: 'la noche', hoja: 'Hábitos de la noche' },
  minima: { fila: 'Versión mínima', de: 'la versión mínima', hoja: 'Si queda algo, una versión más corta' },
};

// ---------- El marco de una hoja ----------
const Hoja: React.FC<{
  id: string; titulo: string; sub?: string; alCerrar: () => void; pie: React.ReactNode; children?: React.ReactNode; z?: number;
}> = ({ id, titulo, sub, alCerrar, pie, children, z }) => {
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const volverA = useRef<HTMLElement | null>(null);
  const cerrar = useRef(alCerrar);
  cerrar.current = alCerrar;
  useEffect(() => {
    volverA.current = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); cerrar.current(); } };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (volverA.current && document.body.contains(volverA.current)) volverA.current.focus();
    };
  }, []);
  return createPortal(
    <div className="tareas" style={{ position: 'relative', zIndex: z || 80 }}>
      <div className="tscrim" onClick={alCerrar} aria-hidden="true" />
      <div className="tsheet hcomp avh" role="dialog" aria-modal="true" aria-labelledby={id}>
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id={id}>{titulo}</h2>
            {sub && <p className="sub" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45 }}>{sub}</p>}
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={alCerrar}><X size={16} aria-hidden="true" /></button>
        </div>
        <div className="avcuerpo">{children}</div>
        <div className="avpie">{pie}</div>
      </div>
    </div>,
    document.body
  );
};

// ---------- Las hojas del permiso ----------
export const HojaAvisos: React.FC = () => {
  const {
    hoja, permiso, config, activarAvisos, abrirHojaAvisos, cerrarHojaAvisos, decirAhoraNoAvisos,
    abrirPantallaAvisos, revisarPermisoAvisos,
  } = useAvisos();
  const { habitosActivos } = useHabitStore();
  const { caso, abrirHojaInstalar } = useInstalar();
  const [sigueBloqueado, setSigueBloqueado] = useState(false);
  useEffect(() => { if (hoja !== 'bloqueado') setSigueBloqueado(false); }, [hoja]);

  if (!hoja) return null;

  // OJO: activarAvisos() va directo en el toque, sin esperas antes (el iPhone rechaza el permiso si no)
  const alActivar = () => {
    void activarAvisos().then((r) => {
      if (r === 'si') abrirHojaAvisos('listo');
      else cerrarHojaAvisos();
    });
  };
  const ahoraNo = () => { decirAhoraNoAvisos(); cerrarHojaAvisos(); };

  if (hoja === 'pedir') {
    const momentos: MomentoAviso[] = momentosConHabitos(habitosActivos);
    return (
      <Hoja
        id="avh" titulo="¿Te avisamos cuando toque?" sub="Un aviso por momento del día, y solo si queda algo por hacer." alCerrar={ahoraNo}
        pie={<>
          {permiso === 'falta-instalar'
            ? <button type="button" className="btnp full" style={{ margin: 0 }} onClick={() => abrirHojaAvisos('instalar')}>Sí, avísame</button>
            : <button type="button" className="btnp full" style={{ margin: 0 }} onClick={alActivar}>Sí, avísame</button>}
          <button type="button" className="link quiet center" onClick={ahoraNo}>Ahora no</button>
        </>}
      >
        <ul className="avlista" role="list">
          {([...momentos, 'minima'] as HoraAviso[]).map((t) => (
            <li key={t}><IconoMomento m={t} /><span>{NOMBRE[t].hoja}</span><b>{textoHora(horaDe(config, t))}</b></li>
          ))}
        </ul>
        <p className="avnota">También te avisamos de tus compromisos y cuando termina un pomodoro. Todo se cambia en Perfil › Avisos.</p>
      </Hoja>
    );
  }

  if (hoja === 'listo') {
    const prox = proximoAviso(config, habitosActivos, horaLocal());
    return (
      <Hoja
        id="avh" titulo="Listo, te avisamos" sub={prox ? `El próximo te llega ${prox}` : undefined} alCerrar={cerrarHojaAvisos}
        pie={<>
          <button type="button" className="btnp full" style={{ margin: 0 }} onClick={cerrarHojaAvisos}>Entendido</button>
          <button type="button" className="link quiet center" onClick={() => { cerrarHojaAvisos(); abrirPantallaAvisos(); }}>Cambiar las horas</button>
        </>}
      />
    );
  }

  if (hoja === 'instalar') {
    return (
      <Hoja
        id="avh" titulo="Para avisarte, Racha tiene que estar instalada"
        sub="Es una regla del iPhone: solo las apps que están en la pantalla de inicio pueden mandar avisos. Cuando la abras desde ahí, te preguntamos otra vez."
        alCerrar={ahoraNo}
        pie={<>
          <button type="button" className="btnp full" style={{ margin: 0 }} onClick={() => { cerrarHojaAvisos(); abrirHojaInstalar(); }}>Instalar Racha</button>
          <button type="button" className="link quiet center" onClick={ahoraNo}>Ahora no</button>
        </>}
      />
    );
  }

  // Bloqueados en el celular: los pasos cambian según el aparato
  const ios = esIOS(navigator.userAgent, navigator.maxTouchPoints || 0);
  const yaLosActive = () => {
    // Se mira el permiso sin esperar nada, para que el toque todavía sirva para pedirlo
    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') { revisarPermisoAvisos(); setSigueBloqueado(true); return; }
    alActivar();
  };
  return (
    <Hoja
      id="avh" titulo="Tu celular tiene bloqueados los avisos de Racha" sub="Para recibirlos hay que darles permiso en los ajustes:" alCerrar={cerrarHojaAvisos}
      pie={<>
        <button type="button" className="btnp full" style={{ margin: 0 }} onClick={yaLosActive}>Ya los activé</button>
        <button type="button" className="link quiet center" onClick={cerrarHojaAvisos}>Ahora no</button>
      </>}
    >
      <ol className="avpasos">
        {ios ? (<>
          <li>Abre <b>Ajustes</b> en tu iPhone.</li>
          <li>Toca <b>“Notificaciones”</b> y busca <b>Racha</b>.</li>
          <li>Activa <b>“Permitir notificaciones”</b>.</li>
        </>) : caso === 'instalada' ? (<>
          <li>Mantén el dedo sobre el ícono de Racha.</li>
          <li>Toca <b>“Información de la app”</b>.</li>
          <li>Entra a <b>“Notificaciones”</b> y actívalas.</li>
        </>) : (<>
          <li>Toca el candado que está al lado de la dirección, arriba.</li>
          <li>Toca <b>“Permisos”</b>.</li>
          <li>Activa <b>“Notificaciones”</b>.</li>
        </>)}
      </ol>
      {sigueBloqueado
        ? <p className="averror" role="status">Todavía aparecen bloqueados. Revisa el paso 3.</p>
        : <p className="avnota">Después vuelve aquí y toca “Ya los activé”.</p>}
    </Hoja>
  );
};

// ---------- Cuándo se pregunta: justo después de marcar el primer hábito (solo celular) ----------
/** No pinta nada. Abre la hoja una vez, cuando ya marcó algo hoy y no hay otra ventana abierta (una celebración, otra hoja). */
export const PreguntarAvisos: React.FC<{ marcoAlgoHoy: boolean }> = ({ marcoAlgoHoy }) => {
  const { permiso, pregunta, config, hoja, abrirHojaAvisos } = useAvisos();
  const toca = debePreguntar(permiso, pregunta, config, marcoAlgoHoy) && !hoja;
  useEffect(() => {
    if (!toca) return;
    let t = 0;
    const intentar = () => {
      const ocupado = !!document.querySelector('[role="dialog"], [role="alertdialog"], .tsheet');
      if (ocupado) { t = window.setTimeout(intentar, 1500); return; }
      abrirHojaAvisos('pedir');
    };
    t = window.setTimeout(intentar, 1200);
    return () => window.clearTimeout(t);
  }, [toca, abrirHojaAvisos]);
  return null;
};

// ---------- El recordatorio de Hoy (una vez, 3 días después de "Ahora no") ----------
export const RecordatorioAvisos: React.FC<{ hayOtroAviso: boolean }> = ({ hayOtroAviso }) => {
  const { permiso, pregunta, fechaPregunta, config, abrirHojaAvisos, cerrarRecordatorioAvisos } = useAvisos();
  if (!debeRecordarAvisos(permiso, pregunta, fechaPregunta, getTodayString(), config, hayOtroAviso)) return null;
  return (
    <section className="avav" aria-label="Avisos">
      <Bell size={18} aria-hidden="true" />
      <p>¿Te avisamos cuando toque?</p>
      <button type="button" className="si" onClick={() => abrirHojaAvisos('pedir')}>Activar</button>
      <button type="button" className="no" aria-label="No volver a preguntar por los avisos" onClick={cerrarRecordatorioAvisos}><X size={16} aria-hidden="true" /></button>
    </section>
  );
};

// ---------- La fila de Perfil › Tus hábitos ----------
export const FilaPerfilAvisos: React.FC = () => {
  const { permiso, config, encendidos, abrirPantallaAvisos } = useAvisos();
  if (!hayAvisos(permiso)) return null;
  return (
    <button type="button" className="avperfil" id="avperfil-fila" onClick={abrirPantallaAvisos}>
      <span className="ic" aria-hidden="true">{encendidos ? <Bell size={18} /> : <BellOff size={18} />}</span>
      <span className="t"><b>Avisos</b><small>{subtituloPerfilAvisos(permiso, config)}</small></span>
      <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
};

// ---------- La hoja de la hora ----------
const HojaHora: React.FC<{ t: HoraAviso; alCerrar: () => void }> = ({ t, alCerrar }) => {
  const { config, cambiarHoraAviso } = useAvisos();
  const [hora, setHora] = useState(() => horaDe(config, t));
  const error = errorDeHora(t, hora, config);
  const guardar = () => { if (error) return; cambiarHoraAviso(t, hora); alCerrar(); };
  return (
    <Hoja
      id="avhh" titulo={tituloHojaHora(t)} sub={preguntaHojaHora(t)} alCerrar={alCerrar} z={80}
      pie={<>
        <button type="button" className="btnp full" style={{ margin: 0, opacity: error ? 0.55 : 1 }} disabled={!!error} onClick={guardar}>Guardar</button>
        <button type="button" className="link quiet center" onClick={() => setHora(horaDe(CONFIG_AVISOS, t))}>{textoVolverHora(t)}</button>
      </>}
    >
      <div style={{ marginTop: 8 }}>
        <SelectorHora valor={hora} onCambiar={setHora} onQuitar={() => {}} onListo={guardar} sinPie />
      </div>
      {error && <p className="averror" role="status">{error}</p>}
    </Hoja>
  );
};

// ---------- La pantalla Avisos (desde Perfil) ----------
const Palito = () => <span className="avsw"><i aria-hidden="true" /></span>;

const FilaInterruptor: React.FC<{ titulo: string; sub: string; on: boolean; alCambiar: () => void; principal?: boolean }> = ({ titulo, sub, on, alCambiar, principal }) => (
  <button type="button" className={`avfila${principal ? ' avprin' : ''}${on ? '' : ' off'}`} role="switch" aria-checked={on} onClick={alCambiar}>
    <span className="avz"><span className="t"><b>{titulo}</b><small>{sub}</small></span></span>
    <Palito />
  </button>
);

export const PantallaAvisos: React.FC = () => {
  const {
    pantalla, hoja, permiso, config, encendidos, activarAvisos, desactivarAvisos, abrirHojaAvisos, cerrarPantallaAvisos,
    cambiarInterruptorAviso, cambiarOtroAviso,
  } = useAvisos();
  const { habitosActivos } = useHabitStore();
  const desk = useEsEscritorio();
  const AQUI = desk ? 'Avisos en este computador' : 'Avisos en este celular';
  const [cambiando, setCambiando] = useState<HoraAviso | null>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const hayHoja = !!hoja || !!cambiando;

  useEffect(() => {
    if (!pantalla) { setCambiando(null); return; }
    h1.current?.focus();
    return () => { document.getElementById('avperfil-fila')?.focus(); };
  }, [pantalla]);
  useEffect(() => {
    if (!pantalla || hayHoja) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarPantallaAvisos(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pantalla, hayHoja, cerrarPantallaAvisos]);

  if (!pantalla) return null;

  const con = momentosConHabitos(habitosActivos);
  const TIPOS: HoraAviso[] = ['manana', 'tarde', 'noche', 'minima'];
  const bloqueado = permiso === 'bloqueado';

  // Encender: directo en el toque (sin esperas antes)
  const alEncender = () => {
    if (permiso === 'falta-instalar') { abrirHojaAvisos('instalar'); return; }
    void activarAvisos();
  };

  const resumen = (
    <div className="avquieto" aria-hidden="true">
      {TIPOS.map((t) => (
        <div className="avfila" key={t}>
          <span className="avz"><IconoMomento m={t} size={20} /><span className="t"><b>{NOMBRE[t].fila}</b><small>{config[t] ? textoHora(horaDe(config, t)) : 'Apagado'}</small></span></span>
        </div>
      ))}
    </div>
  );

  let cuerpo: React.ReactNode;
  if (bloqueado) {
    cuerpo = (<>
      <div className="avfila avprin">
        <span className="avz"><span className="t"><b>{AQUI}</b><small>Bloqueados en los ajustes del celular</small></span></span>
        <button type="button" className="avsec" onClick={() => abrirHojaAvisos('bloqueado')}>Cómo activarlos</button>
      </div>
      <p className="avpie">Cuando les des permiso, quedan así:</p>
      {resumen}
    </>);
  } else if (!encendidos) {
    cuerpo = (<>
      <FilaInterruptor principal titulo={AQUI} sub="Apagados: no llega ninguno" on={false} alCambiar={alEncender} />
      <p className="avpie">Actívalos para elegir cuáles te llegan. Así los tenías:</p>
      {resumen}
    </>);
  } else {
    cuerpo = (<>
      <FilaInterruptor principal titulo={AQUI} sub="Activados" on alCambiar={() => { void desactivarAvisos(); }} />
      <h2 className="avg">Tus hábitos</h2>
      {TIPOS.map((t) => {
        if (t !== 'minima' && !con.includes(t)) {
          return (
            <div className="avfila" key={t}>
              <span className="avz"><IconoMomento m={t} size={20} /><span className="t"><b>{NOMBRE[t].fila}</b><small>No tienes hábitos de {NOMBRE[t].de}</small></span></span>
            </div>
          );
        }
        const on = config[t];
        const hora = textoHora(horaDe(config, t));
        return (
          <div className={`avfila${on ? '' : ' off'}`} key={t}>
            <button type="button" className="avz" aria-label={`Cambiar la hora del aviso de ${NOMBRE[t].de}, ${hora}`} onClick={() => setCambiando(t)}>
              <IconoMomento m={t} size={20} />
              <span className="t"><b>{NOMBRE[t].fila}</b><small><span className="h">{hora}</span> · {on ? <u>Cambiar</u> : 'Apagado'}</small></span>
            </button>
            <button type="button" className="avsw" role="switch" aria-checked={on} aria-label={`Aviso de ${NOMBRE[t].de}`} onClick={() => cambiarInterruptorAviso(t, !on)}><i aria-hidden="true" /></button>
          </div>
        );
      })}
      <p className="avpie">Como máximo llegan 4 al día. Si ya cumpliste lo de ese momento, no llega nada.</p>
      <h2 className="avg">Otros avisos</h2>
      <FilaInterruptor titulo="Si dejas de entrar" sub="Uno a los 2 días y otro a los 7. Después, ninguno." on={config.regreso} alCambiar={() => cambiarOtroAviso('regreso', !config.regreso)} />
      <FilaInterruptor titulo="Compromisos" sub="30 minutos antes de la hora" on={config.compromisos} alCambiar={() => cambiarOtroAviso('compromisos', !config.compromisos)} />
      <FilaInterruptor titulo="Pomodoro" sub="Cuando termina, aunque Racha esté cerrada. Necesita internet." on={config.pomodoro} alCambiar={() => cambiarOtroAviso('pomodoro', !config.pomodoro)} />
      <h2 className="avg">Privacidad</h2>
      <FilaInterruptor titulo="Mostrar los nombres en el aviso" sub={config.nombres ? 'El aviso dice qué hábitos o qué compromiso' : 'El aviso solo dice cuántos faltan'} on={config.nombres} alCambiar={() => cambiarOtroAviso('nombres', !config.nombres)} />
      <p className="avpie">Si tu celular está en No molestar, los avisos llegan en silencio.</p>
    </>);
  }

  return createPortal(
    <>
      <div className="avp" role="dialog" aria-modal="true" aria-labelledby="avp-t">
        <div className="avtop">
          <button type="button" className="avback" aria-label="Volver a Perfil" onClick={cerrarPantallaAvisos}><ChevronLeft size={22} strokeWidth={2.2} aria-hidden="true" /></button>
          <h1 id="avp-t" ref={h1} tabIndex={-1} style={{ outline: 'none' }}>Avisos</h1>
        </div>
        <div className="avbody">{cuerpo}</div>
      </div>
      {cambiando && <HojaHora t={cambiando} alCerrar={() => setCambiando(null)} />}
    </>,
    document.body
  );
};
