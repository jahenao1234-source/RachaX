import React, { useState, useEffect } from 'react';
import { useHabitStore } from '../../store/HabitContext';
import { getTodayString, getFrecuenciaLegible, isHabitScheduledForDate } from '../../utils/habitUtils';
import { 
  diasDeSemana, 
  rangoSemana, 
  etiquetaDia, 
  comoVasSemana, 
  rescateSemana, 
  pasosDelDia, 
  pasosSinDia, 
  ocultarRescate 
} from '../../utils/semanaUtils';
import { HabitIcon } from '../common/HabitIcon';
import { Casilla } from '../tareas/piezas';
import { HojaDiaPaso } from '../tareas/HojaDiaPaso';
import { HojaPonerPaso } from '../semana/HojaPonerPaso';
import { PlanSemana } from '../semana/PlanSemana';
import { useEsEscritorio } from './TodayScreen';
import { GripVertical } from 'lucide-react';
import { Subtarea } from '../../types';

export const SemanaScreen: React.FC = () => {
  const { 
    habitosActivos, 
    registros, 
    diasCongelados, 
    tareas, 
    toggleSubtarea, 
    ponerFechaPaso, 
    openEditHabit, 
    navigateToTab 
  } = useHabitStore();
  
  const hoy = getTodayString();
  const dHoy = new Date(hoy + 'T00:00:00');
  const esDomingo = dHoy.getDay() === 0;
  
  const [pestaña, setPestaña] = useState<'esta' | 'proxima'>(esDomingo ? 'proxima' : 'esta');
  const esEscritorio = useEsEscritorio();

  // Estados modales y notificaciones
  const [mensajeRescate, setMensajeRescate] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; deshacer: () => void } | null>(null);
  const timerAviso = React.useRef<number | null>(null);
  const avisar = (texto: string, deshacer: () => void) => {
    if (timerAviso.current) window.clearTimeout(timerAviso.current);
    setMensajeRescate(false);
    setAviso({ texto, deshacer });
    timerAviso.current = window.setTimeout(() => setAviso(null), 6000);
  };
  useEffect(() => () => { if (timerAviso.current) window.clearTimeout(timerAviso.current); }, []);
  const [pasoEligiendo, setPasoEligiendo] = useState<{ tareaId: string, paso: Subtarea } | null>(null);
  const [fechaPonerPaso, setFechaPonerPaso] = useState<{ fecha: string, diaCorto: string } | null>(null);


  useEffect(() => {
    if (mensajeRescate) {
      const t = setTimeout(() => setMensajeRescate(false), 6000);
      return () => clearTimeout(t);
    }
  }, [mensajeRescate]);

  const fechas = diasDeSemana(hoy, pestaña);
  const rango = rangoSemana(fechas);
  const vas = comoVasSemana(habitosActivos, registros, diasCongelados, hoy);
  const rescate = rescateSemana(habitosActivos, registros, diasCongelados, hoy);
  const psd = pasosSinDia(tareas);

  return (
    <div className="semana pt-6 lg:pt-0">
      <header className="mb-6 lg:mb-[26px]">
        <h1 className="font-heading font-bold text-[40px] leading-none m-0 text-text mb-1.5">Tu semana</h1>
        <p className="text-[14px] text-text-muted m-0">Mira cómo vas y deja lista la semana.</p>
      </header>

      {/* Arriba: Cómo vas y Rescate */}
      <div className="flex flex-col lg:flex-row gap-[16px] lg:gap-4 mb-8">
        <div className={`card mt-0 ${rescate ? 'lg:flex-[1.25]' : 'lg:flex-1'}`}>
          <div className="cardhead mb-3">
            <h2 className="font-heading font-bold text-[22px]">Cómo vas</h2>
            <span className="text-[14px] font-semibold text-text-muted">{rangoSemana(diasDeSemana(hoy, 'esta'))}</span>
          </div>
          <ol className="tsdias" aria-label="Días de esta semana">
            {vas.dias.map(d => {
              const r = etiquetaDia(d.fecha);
              const estadoTxt = { ok: 'todo cumplido', medio: 'a medias', como: 'con comodín', gris: 'sin cumplir', hoy: 'hoy', fut: 'todavía no llega', libre: 'sin hábitos' }[d.estado];
              const alto = d.hechos > 0 && d.tocan > 0 ? Math.round((d.hechos / d.tocan) * 100) : 0;
              return (
                <li key={d.fecha} className={d.estado} aria-label={`${r.corto} ${r.numero}: ${estadoTxt}${d.estado === 'fut' || d.estado === 'libre' ? '' : `, ${d.hechos} de ${d.tocan} hábitos`}`}>
                  <span className="tsdl" aria-hidden="true">{esEscritorio ? r.corto : r.corto.charAt(0)}</span>
                  <b className="num" aria-hidden="true">{r.numero}</b>
                  <i aria-hidden="true">{alto > 0 && d.estado !== 'como' && <b style={{ height: `${alto}%` }} />}</i>
                </li>
              );
            })}
          </ol>
          <p className="tsfrase">
            Cumpliste <b>{vas.cumplidas} de {vas.tocaban}</b> veces lo que te tocaba.
            {vas.quedan > 0 && ` Quedan ${vas.quedan} días.`}
          </p>
        </div>

        {rescate && (
          <div className="card mt-0 lg:flex-1">
            <h2 className="font-heading font-bold text-[22px] mb-1">Rescate: {rescate.habito.nombre}</h2>
            <p className="text-[13px] text-text-muted leading-snug mb-4 m-0">
              Vas {rescate.hechas} de {rescate.tocaban} veces esta semana. Ajustarlo funciona mejor que forzarlo.
            </p>
            <div className="flex gap-2">
              <button type="button" className="rescate-btn flex-1" onClick={() => openEditHabit(rescate.habito)}>
                Hacerlo más fácil
                <span className="sub">Una versión más corta</span>
              </button>
              <button type="button" className="rescate-btn flex-1" onClick={() => openEditHabit(rescate.habito)}>
                Cambiarle los días
                <span className="sub">Hoy: {getFrecuenciaLegible(rescate.habito)}</span>
              </button>
            </div>
            <button type="button" className="rescate-quiet" onClick={() => {
              ocultarRescate(hoy, rescate.habito.id);
              setMensajeRescate(true);
            }}>Dejarlo así</button>
          </div>
        )}
      </div>

      {/* Planea */}
      <div className="tsplanh">
      <h2 className="font-heading font-bold text-[26px] m-0">Planea</h2>
      <div role="tablist" aria-label="Qué semana planear">
        <button type="button" role="tab" aria-selected={pestaña === 'esta'} onClick={() => setPestaña('esta')}>
          Esta semana <span className="tab-range">{rangoSemana(diasDeSemana(hoy, 'esta'))}</span>
        </button>
        <button type="button" role="tab" aria-selected={pestaña === 'proxima'} onClick={() => setPestaña('proxima')}>
          La próxima <span className="tab-range">{rangoSemana(diasDeSemana(hoy, 'proxima'))}</span>
        </button>
      </div>
      </div>

      {esEscritorio ? (
        <PlanSemana fechas={fechas} hoy={hoy} onElegirDia={(tareaId, paso) => setPasoEligiendo({ tareaId, paso })} avisar={avisar} />
        ) : (
          <div className="flex flex-col gap-0 w-full mt-4">
            {/* Móvil: lista de días */}
            {fechas.filter(f => pestaña === 'proxima' || f >= hoy).map(f => {
              const r = etiquetaDia(f);
              const isHoy = f === hoy;
              const tocanHoy = habitosActivos.filter(h => h.frecuencia !== 'semanal' && isHabitScheduledForDate(h, f));
              return (
                <div key={f} className={`m-day-card ${isHoy ? 'hoy' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-[20px]">{r.corto} {r.numero}</span>
                      {isHoy && <span className="col-hoy-lbl">Hoy</span>}
                    </div>
                    <span className="text-[13px] text-text-muted">{tocanHoy.length} hábitos</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {pasosDelDia(tareas, f, hoy).map(p => (
                      <div key={`${p.tareaId}-${p.paso.id}`} className="tareas border-b border-line pb-2 last:border-0 last:pb-0" onClick={(e) => { if ((e.target as HTMLElement).closest('.tchk')) return; setPasoEligiendo({ tareaId: p.tareaId, paso: p.paso }); }}>
                        <div className="tfila !min-h-[auto] !py-1">
                          <Casilla paso={p.paso} onToggle={() => toggleSubtarea(p.tareaId, p.paso.id)} />
                          <div className="ttxt">
                            <span className="tnom" style={p.paso.hecha ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : {}}>{p.paso.texto}</span>
                            <span className="tsub">{p.tareaNombre} {p.atraso ? ` · ${p.atraso}` : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="m-day-btn" onClick={() => {
                    setFechaPonerPaso({ fecha: f, diaCorto: `${r.corto.toLowerCase()} ${r.numero}` });
                  }}>+ Ponerle un paso a este día</button>
                </div>
              );
            })}
          </div>
      )}

      {aviso && (
        <div className="tareas">
          <div className="ttoast" role="status">
            <span>{aviso.texto}</span>
            <button type="button" onClick={() => { aviso.deshacer(); setAviso(null); }}>Deshacer</button>
          </div>
        </div>
      )}

      {mensajeRescate && (
        <div className="tareas">
          <div className="ttoast" role="status">
            <span>Listo. No te lo volvemos a mostrar esta semana.</span>
          </div>
        </div>
      )}

      {pasoEligiendo && (
        <HojaDiaPaso 
          pasoTexto={pasoEligiendo.paso.texto}
          tareaNombre={tareas.find(t => t.id === pasoEligiendo.tareaId)?.nombre || ''}
          fecha={pasoEligiendo.paso.fecha}
          hoy={hoy}
          onElegir={(f) => {
            ponerFechaPaso(pasoEligiendo.tareaId, pasoEligiendo.paso.id, f);
            setPasoEligiendo(null);
          }}
          onCerrar={() => setPasoEligiendo(null)}
        />
      )}

      {fechaPonerPaso && (
        <HojaPonerPaso
          diaCorto={fechaPonerPaso.diaCorto}
          fecha={fechaPonerPaso.fecha}
          pasosSinDia={psd}
          onElegir={(tId, pId, f) => {
            ponerFechaPaso(tId, pId, f);
            setFechaPonerPaso(null);
          }}
          onCerrar={() => setFechaPonerPaso(null)}
          onIrATareas={() => {
            navigateToTab('tareas');
          }}
        />
      )}
    </div>
  );
};
