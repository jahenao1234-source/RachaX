import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Compromiso, MomentoPlan } from '../../types';
import { momentoDeHora, coincideCon, textoHora, textoRepetir } from '../../utils/compromisosUtils';
import { useHabitStore } from '../../store/HabitContext';
import { getTodayString, parseDateString, formatDateToString } from '../../utils/habitUtils';
import { CalendarioMes } from '../common/CalendarioMes';
import { SelectorHora } from '../common/SelectorHora';

/** Nuevo / Editar compromiso (design/maqueta-compromisos.html, DESIGN.md › Compromisos). */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const NOMBRE_MOMENTO: Record<MomentoPlan, string> = { manana: 'mañana', tarde: 'tarde', noche: 'noche' };

interface HojaCompromisoProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si se pasa, es edición. */
  compromiso?: Compromiso;
  /** El día que se tocó: al editar uno que se repite, la hoja trabaja sobre ESE día. */
  fechaOcurrencia?: string;
  /** Día elegido al crear uno nuevo. */
  fechaInicial: string;
}

const sumarDias = (fecha: string, n: number) => {
  const d = parseDateString(fecha);
  d.setDate(d.getDate() + n);
  return formatDateToString(d);
};

/** La próxima hora en punto: a las 2:35 p. m., '15:00'. */
const proximaHoraEnPunto = () => `${String((new Date().getHours() + 1) % 24).padStart(2, '0')}:00`;

const BORDE_ELEGIDO: React.CSSProperties = { borderColor: 'var(--text)', borderWidth: 2, background: 'var(--surface-raised)' };

export const HojaCompromiso: React.FC<HojaCompromisoProps> = ({ isOpen, onClose, compromiso, fechaOcurrencia, fechaInicial }) => {
  const { compromisos, crearCompromiso, editarCompromiso, borrarCompromiso } = useHabitStore();

  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [momento, setMomento] = useState<MomentoPlan>('tarde');
  const [repetir, setRepetir] = useState(false);
  const [verCalendario, setVerCalendario] = useState(false);
  const [verSelectorHora, setVerSelectorHora] = useState(false);
  const [confirmarAlcance, setConfirmarAlcance] = useState<'editar' | 'borrar' | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const alCerrar = useRef(onClose);
  alCerrar.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    setTitulo(compromiso?.titulo ?? '');
    setFecha(compromiso ? (fechaOcurrencia ?? compromiso.fecha) : fechaInicial);
    setHora(compromiso?.hora ?? '');
    setMomento(compromiso?.momento ?? 'tarde');
    setRepetir(compromiso?.repetirSemanal ?? false);
    setConfirmarAlcance(null);
    setVerCalendario(false);
    setVerSelectorHora(false);
  }, [isOpen, compromiso, fechaOcurrencia, fechaInicial]);

  // Foco al abrir: el nombre si es nuevo; el botón de cerrar si se edita.
  useEffect(() => {
    if (!isOpen || confirmarAlcance) return;
    if (!compromiso) inputRef.current?.focus();
    else cerrarRef.current?.focus();
  }, [isOpen, compromiso, confirmarAlcance]);

  // Escape: primero cierra la pregunta "¿Solo este día…?", luego la hoja.
  const hayPregunta = useRef(false);
  hayPregunta.current = !!confirmarAlcance;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (hayPregunta.current) setConfirmarAlcance(null);
      else alCerrar.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const hoy = getTodayString();
  const diasFijos = [0, 1, 2, 3, 4, 5].map((n) => sumarDias(hoy, n));
  const fMas = fecha && !diasFijos.includes(fecha) ? parseDateString(fecha) : null;
  const diaOriginal = compromiso ? (fechaOcurrencia ?? compromiso.fecha) : fecha;
  const coincidencia = coincideCon(compromisos, fecha, hora, compromiso?.id);

  const handleGuardar = (alcance: 'uno' | 'todos' = 'uno') => {
    if (!titulo.trim()) return;
    const cambios = { titulo: titulo.trim(), hora: hora || '', momento: hora ? undefined : momento, repetirSemanal: repetir };
    if (!compromiso) {
      crearCompromiso({ ...cambios, fecha, hora: hora || undefined });
    } else if (alcance === 'uno') {
      editarCompromiso(compromiso.id, { ...cambios, fecha }, 'uno', diaOriginal);
    } else {
      editarCompromiso(compromiso.id, fecha !== diaOriginal ? { ...cambios, fecha } : cambios, 'todos', diaOriginal);
    }
    onClose();
  };

  const handleBorrar = (alcance: 'uno' | 'todos' = 'uno') => {
    if (!compromiso) return;
    borrarCompromiso(compromiso.id, alcance, diaOriginal);
    onClose();
  };

  const onIntentarGuardar = () => (compromiso?.repetirSemanal ? setConfirmarAlcance('editar') : handleGuardar('uno'));
  const onIntentarBorrar = () => (compromiso?.repetirSemanal ? setConfirmarAlcance('borrar') : handleBorrar('uno'));

  const alternarSelectorHora = () => {
    if (!verSelectorHora && !hora) setHora(proximaHoraEnPunto());
    setVerSelectorHora(!verSelectorHora);
  };
  const elegirMomento = (m: MomentoPlan) => { setMomento(m); setHora(''); setVerSelectorHora(false); };

  if (confirmarAlcance) {
    return createPortal(
      <div className="tareas">
        <div className="tscrim" onClick={() => setConfirmarAlcance(null)} aria-hidden="true" />
        <div className="tsheet hcomp" role="dialog" aria-modal="true" aria-labelledby="hcomp-alc">
          <div className="tgrab" aria-hidden="true" />
          <div className="tsheet-h">
            <h2 id="hcomp-alc" className="font-heading font-bold text-[24px] m-0 flex-1">
              {confirmarAlcance === 'editar' ? '¿Solo este día o todos?' : '¿Borrar solo este día o todos?'}
            </h2>
            <button type="button" className="closeb" aria-label="Cerrar" onClick={() => setConfirmarAlcance(null)}><X size={16} /></button>
          </div>
          <div className="flex flex-col gap-3 pb-2">
            <button type="button" className="btnp full" onClick={() => (confirmarAlcance === 'editar' ? handleGuardar('uno') : handleBorrar('uno'))}>Solo este día</button>
            <button type="button" className="btnp full t5ok" onClick={() => (confirmarAlcance === 'editar' ? handleGuardar('todos') : handleBorrar('todos'))}>Todos</button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const tituloId = 'hcomp-t';
  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={onClose} aria-hidden="true" />
      <div className="tsheet hcomp" role="dialog" aria-modal="true" aria-labelledby={tituloId}>
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div className="flex-1 min-w-0">
            <h2 id={tituloId} className="font-heading font-bold text-[24px] m-0">{compromiso ? 'Editar compromiso' : 'Nuevo compromiso'}</h2>
            <p className="m-0 mt-[4px] text-[13px] text-text-muted">Una reunión, una cita, una clase…</p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={onClose}><X size={16} /></button>
        </div>

        {/* El cuerpo se desplaza; el pie queda siempre a la vista. */}
        <div className="hcomp-cuerpo" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
          <label className="t4lab" htmlFor="hcomp-que">¿Qué es?</label>
          <input
            id="hcomp-que"
            ref={inputRef}
            className="w-full h-[48px] px-[12px] rounded-[12px] bg-surface border border-line-strong text-[16px] font-semibold text-text focus:border-text focus:outline-none"
            placeholder="Por ejemplo, cita con el médico"
            value={titulo}
            maxLength={120}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <p className="t4lab" style={{ marginTop: 14 }}>¿Qué día?</p>
          <div className="grid grid-cols-7 gap-[6px]" role="radiogroup" aria-label="Día">
            {diasFijos.map((f, i) => {
              const d = parseDateString(f);
              const on = f === fecha;
              return (
                <button key={f} type="button" role="radio" aria-checked={on} onClick={() => { setFecha(f); setVerCalendario(false); }}
                  aria-label={i === 0 ? `hoy, ${DIAS[d.getDay()]} ${d.getDate()}` : `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`}
                  style={on ? BORDE_ELEGIDO : undefined}
                  className="w-full min-h-[56px] flex flex-col items-center justify-center gap-[1px] rounded-xl border border-line-strong bg-surface text-[12px] text-text-muted">
                  <span>{i === 0 ? 'hoy' : DIAS_CORTOS[d.getDay()]}</span>
                  <b className="text-[18px] text-text">{d.getDate()}</b>
                </button>
              );
            })}
            <button type="button" aria-expanded={verCalendario}
              aria-label={fMas ? `${DIAS[fMas.getDay()]} ${fMas.getDate()} de ${MESES[fMas.getMonth()]}. Cambiar en el calendario` : 'Otro día en el calendario'}
              onClick={() => setVerCalendario(!verCalendario)}
              style={fMas ? BORDE_ELEGIDO : verCalendario ? { borderColor: 'var(--text)', borderWidth: 2 } : undefined}
              className="w-full min-h-[56px] flex flex-col items-center justify-center rounded-xl border border-line-strong bg-surface text-[12px] text-text-muted">
              {fMas ? <>
                <span>{DIAS_CORTOS[fMas.getDay()]}</span>
                <b className="text-[18px] leading-none text-text">{fMas.getDate()}</b>
                <span className="text-[11px] leading-none">{MESES[fMas.getMonth()].slice(0, 3)}</span>
              </> : <><Calendar size={16} aria-hidden="true" /><span>Más</span></>}
            </button>
          </div>
          {verCalendario && (
            <div className="mt-[10px]">
              <CalendarioMes min={hoy} valor={fecha} onElegir={(f) => { setFecha(f); setVerCalendario(false); }} />
            </div>
          )}

          <p className="t4lab" style={{ marginTop: 14 }}>¿A qué hora?</p>
          <button type="button" aria-expanded={verSelectorHora} onClick={alternarSelectorHora}
            aria-label={hora ? `Hora: ${textoHora(hora)}. Cambiar` : 'Elegir la hora'}
            style={verSelectorHora ? { borderColor: 'var(--text)', borderWidth: 2 } : undefined}
            className="w-full max-w-[220px] min-h-[48px] px-[14px] rounded-[12px] border border-line-strong bg-surface flex items-center gap-[10px] text-left">
            <Clock size={18} className="text-text-muted shrink-0" aria-hidden="true" />
            <span className={hora ? 'text-[16px] font-bold text-text' : 'text-[16px] font-medium text-text-muted'}>{hora ? textoHora(hora) : 'Elegir la hora'}</span>
            <span className="ml-auto flex text-text-muted" aria-hidden="true">{verSelectorHora ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
          </button>
          {verSelectorHora && (
            <div className="mt-[10px]">
              <SelectorHora
                valor={hora || proximaHoraEnPunto()}
                onCambiar={setHora}
                onQuitar={() => { setHora(''); setVerSelectorHora(false); }}
                onListo={() => setVerSelectorHora(false)}
              />
            </div>
          )}
          {hora && (
            <p className="m-0 mt-[6px] text-[12px] text-text-muted" aria-live="polite">Con esta hora queda en la {NOMBRE_MOMENTO[momentoDeHora(hora)]}.</p>
          )}
          {coincidencia && hora && (
            <p className="m-0 mt-[8px] px-[10px] py-[8px] rounded-[10px] bg-surface-raised text-[13px] text-text" role="status">
              Ya tienes “{coincidencia.titulo}” a las {textoHora(hora)}.
            </p>
          )}

          <p className="t4lab" style={{ marginTop: 14 }}>¿Sin hora exacta? Elige el momento</p>
          <div className="grid grid-cols-3 gap-[3px] p-[3px] rounded-xl border border-line bg-surface" role="radiogroup" aria-label="Momento del día">
            {(['manana', 'tarde', 'noche'] as const).map((m) => {
              const on = !hora && momento === m;
              return (
                <button key={m} type="button" role="radio" aria-checked={on} onClick={() => elegirMomento(m)}
                  className={`min-h-[44px] border-none rounded-[9px] text-[14px] font-bold ${on ? 'bg-surface-raised text-text' : 'bg-transparent text-text-muted'}`}
                  style={on ? { boxShadow: 'inset 0 0 0 1.5px var(--text)' } : undefined}>
                  {m === 'manana' ? 'Mañana' : m === 'tarde' ? 'Tarde' : 'Noche'}
                </button>
              );
            })}
          </div>

          <button type="button" role="switch" aria-checked={repetir} onClick={() => setRepetir(!repetir)}
            className="w-full min-h-[56px] mt-[14px] py-[8px] flex items-center justify-between gap-[12px] border-x-0 border-y border-line bg-transparent text-left">
            <span className="min-w-0">
              <b className="block text-[15px] text-text">Repetir cada semana</b>
              <span className="block text-[13px] text-text-muted">{textoRepetir(fecha, hora || undefined, hora ? undefined : momento)}</span>
            </span>
            <i aria-hidden="true" className="relative shrink-0 w-[46px] h-[28px] rounded-full"
              style={repetir ? { background: 'var(--text)' } : { background: 'var(--track-empty)', boxShadow: 'inset 0 0 0 1.5px var(--text-muted)' }}>
              <i className="absolute top-[4px] w-[20px] h-[20px] rounded-full"
                style={repetir ? { left: 22, background: 'var(--bg)' } : { left: 4, background: 'var(--text-muted)' }} />
            </i>
          </button>

          {compromiso && (
            <button type="button" className="tbtnq" style={{ marginTop: 6, paddingLeft: 0, color: 'var(--coral-text)' }} onClick={onIntentarBorrar}>
              Borrar compromiso
            </button>
          )}
        </div>

        <div className="t4pie">
          <button type="button" className="tbtnq" onClick={onClose}>Cancelar</button>
          <button type="button" className="btnp sm" disabled={!titulo.trim()} onClick={onIntentarGuardar}>Guardar</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
