import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Compromiso, MomentoPlan } from '../../types';
import { momentoDeHora, coincideCon, textoHora } from '../../utils/compromisosUtils';
import { etiquetaDia } from '../../utils/semanaUtils';
import { useHabitStore } from '../../store/HabitContext';

interface HojaCompromisoProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si se pasa `compromiso`, es edición. Si no, es creación. */
  compromiso?: Compromiso;
  /** Fechas de la semana actual para los radios de día */
  fechas: string[];
  /** La fecha inicial a mostrar (hoy o la seleccionada) */
  fechaInicial: string;
}

export const HojaCompromiso: React.FC<HojaCompromisoProps> = ({ isOpen, onClose, compromiso, fechas, fechaInicial }) => {
  const { compromisos, crearCompromiso, editarCompromiso, borrarCompromiso } = useHabitStore();

  const [titulo, setTitulo] = useState(compromiso?.titulo ?? '');
  const [fecha, setFecha] = useState(compromiso?.fecha ?? fechaInicial);
  const [hora, setHora] = useState(compromiso?.hora ?? '');
  const [momento, setMomento] = useState<MomentoPlan>(compromiso?.momento ?? 'tarde');
  const [repetir, setRepetir] = useState(compromiso?.repetirSemanal ?? false);

  const [confirmarAlcance, setConfirmarAlcance] = useState<'editar' | 'borrar' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitulo(compromiso?.titulo ?? '');
      setFecha(compromiso?.fecha ?? fechaInicial);
      setHora(compromiso?.hora ?? '');
      setMomento(compromiso?.momento ?? 'tarde');
      setRepetir(compromiso?.repetirSemanal ?? false);
      setConfirmarAlcance(null);
    }
  }, [isOpen, compromiso, fechaInicial]);

  if (!isOpen) return null;

  const momentoDeducido = hora ? momentoDeHora(hora) : momento;
  const textoMomento = momentoDeducido === 'manana' ? 'mañana' : momentoDeducido === 'tarde' ? 'tarde' : 'noche';

  const coincidencia = coincideCon(compromisos, fecha, hora, compromiso?.id);
  const diaNombre = etiquetaDia(fecha).corto.toLowerCase() + ' ' + etiquetaDia(fecha).numero;

  const handleGuardar = (alcance: 'uno' | 'todos' = 'uno') => {
    if (!titulo.trim()) return;
    
    if (compromiso) {
      editarCompromiso(
        compromiso.id,
        { titulo: titulo.trim(), fecha, hora: hora || undefined, momento: hora ? undefined : momento, repetirSemanal: repetir },
        alcance,
        fecha
      );
    } else {
      crearCompromiso({
        titulo: titulo.trim(),
        fecha,
        hora: hora || undefined,
        momento: hora ? undefined : momento,
        repetirSemanal: repetir
      });
    }
    onClose();
  };

  const handleBorrar = (alcance: 'uno' | 'todos' = 'uno') => {
    if (!compromiso) return;
    borrarCompromiso(compromiso.id, alcance, fecha);
    onClose();
  };

  const onIntentarGuardar = () => {
    if (compromiso?.repetirSemanal && compromiso.fecha !== fecha) {
      setConfirmarAlcance('editar');
    } else {
      handleGuardar(compromiso?.repetirSemanal ? 'todos' : 'uno');
    }
  };

  const onIntentarBorrar = () => {
    if (compromiso?.repetirSemanal) {
      setConfirmarAlcance('borrar');
    } else {
      handleBorrar('uno');
    }
  };

  if (confirmarAlcance) {
    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="sheet sm:mx-auto sm:w-[480px] sm:left-auto sm:right-auto sm:top-[20%] sm:bottom-auto sm:rounded-2xl" role="dialog" aria-modal="true">
          <div className="shead">
            <div className="flex-1">
              <h2 className="font-heading font-bold text-[24px] m-0">
                {confirmarAlcance === 'editar' ? '¿Solo este día o todos?' : '¿Borrar solo este día o todos?'}
              </h2>
            </div>
            <button className="x" aria-label="Cerrar" onClick={() => setConfirmarAlcance(null)}><X size={16} /></button>
          </div>
          <div className="sfoot flex flex-col gap-3 mt-2">
            <button className="btn2 full" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text)' }} onClick={() => confirmarAlcance === 'editar' ? handleGuardar('uno') : handleBorrar('uno')}>
              Solo este día
            </button>
            <button className="btn2 full" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text)' }} onClick={() => confirmarAlcance === 'editar' ? handleGuardar('todos') : handleBorrar('todos')}>
              Todos
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet sm:mx-auto sm:w-[480px] sm:left-auto sm:right-auto sm:top-[10%] sm:bottom-auto sm:rounded-2xl" role="dialog" aria-modal="true">
        <div className="grab sm:hidden" />
        <div className="shead">
          <div className="flex-1">
            <h2 className="font-heading font-bold text-[24px] m-0">{compromiso ? 'Editar compromiso' : 'Nuevo compromiso'}</h2>
          </div>
          <button className="x" aria-label="Cerrar" onClick={onClose}><X size={16} /></button>
        </div>
        
        <div className="slist flex-1 overflow-y-auto">
          {/* Qué es */}
          <div className="py-4 border-b border-line">
            <h3 className="font-heading font-bold text-[18px] m-0">¿Qué es?</h3>
            <p className="text-[13px] text-text-muted mb-3">Una reunión, una cita, una clase…</p>
            <input 
              className="w-full h-[48px] px-3 rounded-xl bg-surface border border-line text-[15px] focus:border-lila focus:outline-none"
              placeholder="Ej. Dentista"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              autoFocus
            />
          </div>

          {/* Qué día */}
          <div className="py-4 border-b border-line">
            <h3 className="font-heading font-bold text-[18px] m-0 mb-3">¿Qué día?</h3>
            <div className="flex flex-wrap gap-2">
              {fechas.map(f => {
                const r = etiquetaDia(f);
                const isSelected = f === fecha;
                return (
                  <button 
                    key={f}
                    onClick={() => setFecha(f)}
                    className={`h-[44px] px-3 rounded-xl border ${isSelected ? 'border-text bg-surface-raised font-bold text-text' : 'border-line bg-surface text-text-muted'}`}
                  >
                    {r.corto} {r.numero}
                  </button>
                );
              })}
              <button className="h-[44px] px-3 rounded-xl border border-line bg-surface text-text-muted flex items-center gap-2">
                <Calendar size={16} /> Más
              </button>
            </div>
          </div>

          {/* A qué hora */}
          <div className="py-4 border-b border-line">
            <h3 className="font-heading font-bold text-[18px] m-0 mb-3">¿A qué hora?</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="time" 
                  className="h-[48px] pl-10 pr-3 rounded-xl bg-surface border border-line text-[15px] focus:border-lila focus:outline-none dark:[color-scheme:dark]"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                />
              </div>
              {hora && (
                <span className="text-[13px] text-text-muted" aria-live="polite">
                  Con esta hora queda en la <b>{textoMomento}</b>.
                </span>
              )}
            </div>
            {coincidencia && (
              <p className="text-[13px] text-text-muted mt-2 bg-surface-raised px-3 py-2 rounded-lg">
                Ya tienes <b>{coincidencia.titulo}</b> a las {textoHora(hora)}.
              </p>
            )}
          </div>

          {/* Momento (si no hay hora) */}
          {!hora && (
            <div className="py-4 border-b border-line">
              <h3 className="font-heading font-bold text-[18px] m-0 mb-1">¿Sin hora exacta? Elige el momento</h3>
              <div className="seg4 !grid-cols-3 !mt-3">
                <label className="opt2 text-center">
                  <input type="radio" name="momento" checked={momento === 'manana'} onChange={() => setMomento('manana')} />
                  <span>Mañana</span>
                </label>
                <label className="opt2 text-center">
                  <input type="radio" name="momento" checked={momento === 'tarde'} onChange={() => setMomento('tarde')} />
                  <span>Tarde</span>
                </label>
                <label className="opt2 text-center">
                  <input type="radio" name="momento" checked={momento === 'noche'} onChange={() => setMomento('noche')} />
                  <span>Noche</span>
                </label>
              </div>
            </div>
          )}

          {/* Repetir */}
          <div className="py-4 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-[18px] m-0">Repetir cada semana</h3>
              <p className="text-[13px] text-text-muted m-0 mt-1">Todos los {diaNombre.split(' ')[0]}s {hora ? `a esta hora` : ''}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={repetir} onChange={e => setRepetir(e.target.checked)} />
              <div className="w-11 h-6 bg-surface-raised peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lila rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text after:border-text after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ambar"></div>
            </label>
          </div>
          
          {compromiso && (
            <div className="py-4 border-t border-line text-center">
              <button 
                type="button" 
                className="text-[14px] font-bold text-danger hover:underline"
                onClick={onIntentarBorrar}
              >
                Borrar compromiso
              </button>
            </div>
          )}
        </div>

        <div className="sfoot flex gap-3 pt-4">
          <button className="flex-1 h-[48px] rounded-xl font-bold text-[15px] bg-surface-raised text-text" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="flex-1 h-[48px] rounded-xl font-bold text-[15px] bg-ambar text-ink disabled:opacity-50 disabled:bg-surface-raised disabled:text-text-muted" 
            disabled={!titulo.trim()}
            onClick={onIntentarGuardar}
          >
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};
