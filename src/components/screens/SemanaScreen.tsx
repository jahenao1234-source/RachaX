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
  ocultarRescate,
  diaPorMomentos,
  FRANJAS,
  Franja,
  textoCargaDia
} from '../../utils/semanaUtils';
import { HabitIcon } from '../common/HabitIcon';
import { Casilla } from '../tareas/piezas';
import { HojaDiaPaso } from '../tareas/HojaDiaPaso';
import { HojaPonerPaso } from '../semana/HojaPonerPaso';
import { PlanSemana } from '../semana/PlanSemana';
import { HojaCompromiso } from '../semana/HojaCompromiso';
import { useEsEscritorio } from './TodayScreen';
import { GripVertical, Clock, Repeat, Sunrise, Sun, Moon, Plus } from 'lucide-react';
import { momentoDeHora } from '../../utils/compromisosUtils';
import { textoDiaLargo } from '../../utils/tareasUtils';
import { Subtarea, Compromiso } from '../../types';
import { textoHora, momentoDe } from '../../utils/compromisosUtils';

export const SemanaScreen: React.FC = () => {
  const { 
    habitosActivos, 
    registros, 
    diasCongelados, 
    tareas, 
    compromisos,
    toggleSubtarea, 
    ponerFechaPaso, 
    openEditHabit, 
    navigateToTab,
    editarCompromiso,
    restaurarCompromisos
  } = useHabitStore();
  
  const hoy = getTodayString();
  const dHoy = new Date(hoy + 'T00:00:00');
  const esDomingo = dHoy.getDay() === 0;
  
  const [pestaña, setPestaña] = useState<'esta' | 'proxima'>(esDomingo ? 'proxima' : 'esta');
  const esEscritorio = useEsEscritorio();
  const [diaMovilElegido, setDiaMovilElegido] = useState<string>(hoy);

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
  const [fechaPonerPaso, setFechaPonerPaso] = useState<{ fecha: string, diaCorto: string, franja?: Franja } | null>(null);
  
  // Estado para la hoja de compromisos
  const [hojaCompromisoAbierta, setHojaCompromisoAbierta] = useState(false);
  const [compromisoEditando, setCompromisoEditando] = useState<Compromiso | undefined>(undefined);
  const [fechaCompromisoNuevo, setFechaCompromisoNuevo] = useState(hoy);

  useEffect(() => {
    if (mensajeRescate) {
      const t = setTimeout(() => setMensajeRescate(false), 6000);
      return () => clearTimeout(t);
    }
  }, [mensajeRescate]);

  useEffect(() => {
    const fechasTab = diasDeSemana(hoy, pestaña);
    if (!fechasTab.includes(diaMovilElegido)) {
      setDiaMovilElegido(pestaña === 'esta' ? hoy : fechasTab[0]);
    }
  }, [pestaña, hoy, diaMovilElegido]);

  const fechas = diasDeSemana(hoy, pestaña);
  const rango = rangoSemana(fechas);
  const vas = comoVasSemana(habitosActivos, registros, diasCongelados, hoy);
  const rescate = rescateSemana(habitosActivos, registros, diasCongelados, hoy);
  const psd = pasosSinDia(tareas);

  const iconForFranja = (m: Franja) => {
    if (m === 'manana') return <Sunrise size={16} className="text-ambar-text" />;
    if (m === 'tarde') return <Sun size={16} className="text-coral-text" />;
    if (m === 'noche') return <Moon size={16} className="text-lila-text" />;
    return <Clock size={16} className="text-text" />;
  };
  const colorFranja = (m: Franja) => {
    if (m === 'manana') return ' text-ambar-text';
    if (m === 'tarde') return ' text-coral-text';
    if (m === 'noche') return ' text-lila-text';
    return ' text-text';
  };

  // Mover un compromiso a otro día o momento. Si se repite, cambia solo ese día. Deshacer devuelve la lista como estaba.
  const handleMoverCompromiso = (c: Compromiso, f: string, m: Franja, fechaOriginal: string) => {
    const antes = compromisos;
    const momentoNuevo = m === 'cualquiera' ? undefined : m;
    // Si queda en el mismo momento de su hora, la conserva; si cambia de momento, la hora ya no aplica
    const conservaHora = !!c.hora && momentoDeHora(c.hora) === momentoNuevo;
    editarCompromiso(c.id, { fecha: f, momento: momentoNuevo, hora: conservaHora ? c.hora : '' }, 'uno', fechaOriginal);
    avisar(`Pusiste “${c.titulo}” para ${textoDiaLargo(f, hoy)}${c.repetirSemanal ? ' (solo ese día)' : ''}`, () => restaurarCompromisos(antes));
  };

  return (
    <div className="semana pt-6 lg:pt-0">
      <header className="mb-6 lg:mb-[26px]">
        <h1 className="font-heading font-bold text-[40px] leading-none m-0 text-text mb-1.5">Tu semana</h1>
        <p className="text-[14px] text-text-muted m-0">Mira cómo vas y deja lista la semana.</p>
      </header>

      {/* Arriba, compacto: Cómo vas en una franja y Rescate en un renglón (más espacio para planear) */}
      <section className="tscomp" aria-labelledby="tscomp-t">
        <div className="tscomp-txt">
          <h2 id="tscomp-t" className="font-heading font-bold text-[20px] m-0">Cómo vas</h2>
          <p className="m-0">Cumpliste <b>{vas.cumplidas} de {vas.tocaban}</b> veces lo que te tocaba{vas.quedan > 0 ? ` · quedan ${vas.quedan} días` : ''}</p>
        </div>
        <ol className="tscomp-dias" aria-label="Días de esta semana">
          {vas.dias.map(d => {
            const r = etiquetaDia(d.fecha);
            const estadoTxt = { ok: 'todo cumplido', medio: 'a medias', como: 'con comodín', gris: 'sin cumplir', hoy: 'hoy', fut: 'todavía no llega', libre: 'sin hábitos' }[d.estado];
            const ancho = d.hechos > 0 && d.tocan > 0 ? Math.max(20, Math.round((d.hechos / d.tocan) * 100)) : 0;
            return (
              <li key={d.fecha} className={d.estado} aria-label={`${r.corto} ${r.numero}: ${estadoTxt}${d.estado === 'fut' || d.estado === 'libre' ? '' : `, ${d.hechos} de ${d.tocan} hábitos`}`}>
                <span aria-hidden="true">{r.corto.charAt(0)} <b className="num">{r.numero}</b></span>
                <i aria-hidden="true">{ancho > 0 && d.estado !== 'como' && <b style={{ width: `${ancho}%` }} />}</i>
              </li>
            );
          })}
        </ol>
      </section>

      {rescate && (
        <section className="tsresc" aria-label={`Rescate: ${rescate.habito.nombre}`}>
          <p className="m-0 flex-1 min-w-[220px]"><b>Rescate: {rescate.habito.nombre}.</b> <span className="text-text-muted">Vas {rescate.hechas} de {rescate.tocaban} veces esta semana. Ajustarlo funciona mejor que forzarlo.</span></p>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="tsresc-b" onClick={() => openEditHabit(rescate.habito)}>Hacerlo más fácil</button>
            <button type="button" className="tsresc-b" title={`Hoy: ${getFrecuenciaLegible(rescate.habito)}`} onClick={() => openEditHabit(rescate.habito)}>Cambiarle los días</button>
            <button type="button" className="tsresc-q" onClick={() => { ocultarRescate(hoy, rescate.habito.id); setMensajeRescate(true); }}>Dejarlo así</button>
          </div>
        </section>
      )}

      {/* Planea */}
      <div className="tsplanh">
      <h2 className="font-heading font-bold text-[26px] m-0">Planea</h2>
      <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="tsnuevo" onClick={() => { setCompromisoEditando(undefined); setFechaCompromisoNuevo(hoy); setHojaCompromisoAbierta(true); }}><Plus size={16} strokeWidth={2.4} />Compromiso</button>
      <div role="tablist" aria-label="Qué semana planear">
        <button type="button" role="tab" aria-selected={pestaña === 'esta'} onClick={() => setPestaña('esta')}>
          Esta semana <span className="tab-range">{rangoSemana(diasDeSemana(hoy, 'esta'))}</span>
        </button>
        <button type="button" role="tab" aria-selected={pestaña === 'proxima'} onClick={() => setPestaña('proxima')}>
          La próxima <span className="tab-range">{rangoSemana(diasDeSemana(hoy, 'proxima'))}</span>
        </button>
      </div>
      </div>
      </div>

      {esEscritorio ? (
        <PlanSemana 
          fechas={fechas} 
          hoy={hoy} 
          onElegirDia={(tareaId, paso) => setPasoEligiendo({ tareaId, paso })} 
          avisar={avisar}
          onEditarCompromiso={(c) => {
            setCompromisoEditando(c);
            setHojaCompromisoAbierta(true);
          }}
          onMoverCompromiso={handleMoverCompromiso}
        />
        ) : (
          <div className="flex flex-col w-full mt-4">
            {/* Móvil: tira horizontal de días */}
            <div className="grid grid-cols-7 gap-1 pb-2 mb-4" role="tablist" aria-label="Días">
              {fechas.map(f => {
                const r = etiquetaDia(f);
                const isHoy = f === hoy;
                const isSelected = f === diaMovilElegido;
                return (
                  <button 
                    key={f} 
                    onClick={() => setDiaMovilElegido(f)}
                    role="tab" aria-selected={isSelected}
                    className={`h-[60px] rounded-xl flex flex-col items-center justify-center border transition-colors ${isSelected ? 'border-text bg-surface-raised font-bold text-text' : 'border-line bg-surface text-text-muted'} ${f < hoy && !isSelected ? 'opacity-60' : ''}`}
                  >
                    <span className="text-[12px] font-bold">{r.corto.charAt(0)}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[18px] font-heading font-bold">{r.numero}</span>
                      
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Agenda del día elegido */}
            {(() => {
              const dm = diaPorMomentos(tareas, compromisos, habitosActivos, diaMovilElegido, hoy);
              const r = etiquetaDia(diaMovilElegido);
              const pasado = diaMovilElegido < hoy;
              
              return (
                <div className="flex flex-col gap-4 mb-24">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-heading font-bold text-[22px]">{diaMovilElegido === hoy ? 'Hoy' : `${r.corto} ${r.numero}`}</h3>
                    <span className="text-[13px] text-text-muted">{textoCargaDia(dm)}</span>
                  </div>

                  {FRANJAS.map(franja => {
                    if (franja === 'cualquiera' && dm.franjas[franja].length === 0 && dm.habitos[franja] === 0) return null;
                    const items = dm.franjas[franja];
                    
                    return (
                      <div key={franja} className={`flex flex-col gap-2`}>
                        {(franja !== 'cualquiera' || items.length > 0 || dm.habitos[franja] > 0) && (
                          <div className="flex items-center justify-between mb-1 px-1">
                            <div className={`flex items-center gap-1.5 text-[14px] font-bold${colorFranja(franja)}`}>
                              {iconForFranja(franja)}
                              {franja === 'manana' ? 'Mañana' : franja === 'tarde' ? 'Tarde' : franja === 'noche' ? 'Noche' : 'Cualquier momento'}
                            </div>
                            {dm.habitos[franja] > 0 && <span className="text-[12px] text-text-muted">{dm.habitos[franja]} {dm.habitos[franja] === 1 ? 'hábito' : 'hábitos'}</span>}
                          </div>
                        )}
                        
                                                
                        <div className="flex flex-col gap-2">
                          {items.map(it => {
                            if (it.tipo === 'paso') {
                              return (
                                <div key={`p-${it.dato.paso.id}`}
                                  className={`step-card rounded-xl bg-surface-raised p-3 flex flex-col gap-2 border border-line ${pasado ? 'bg-transparent border-line p-2' : ''}`}
                                  onClick={(e) => { if (!pasado && !(e.target as HTMLElement).closest('.tchk')) setPasoEligiendo({ tareaId: it.dato.tareaId, paso: it.dato.paso }); }}>
                                  <span className="text-[15px] font-bold leading-tight" style={it.dato.paso.hecha ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : undefined}>{it.dato.paso.texto}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Casilla paso={it.dato.paso} onToggle={() => toggleSubtarea(it.dato.tareaId, it.dato.paso.id)} />
                                    <span className="text-[13px] text-text-muted flex-1 min-w-0 leading-tight break-words">{it.dato.tareaNombre}{it.dato.atraso ? ` · ${it.dato.atraso}` : ''}</span>
                                  </div>
                                </div>
                              );
                            } else {
                              const c = it.dato as Compromiso;
                              return (
                                <div key={`c-${c.id}`}
                                  className={`compro-card rounded-xl border border-line-strong p-3 flex flex-col gap-1.5 ${pasado ? 'opacity-60' : ''}`}
                                  onClick={() => { setCompromisoEditando(c); setHojaCompromisoAbierta(true); }}>
                                  <div className="flex items-center gap-1.5 text-[15px] font-heading font-bold text-text">
                                    <Clock size={16} />
                                    {c.hora ? textoHora(c.hora) : 'Sin hora'}
                                  </div>
                                  <span className="text-[15px] font-bold leading-tight">{c.titulo}</span>
                                  {c.repetirSemanal && (
                                    <div className="flex items-center gap-1 text-[12px] text-text-muted mt-1">
                                      <Repeat size={14} />
                                      cada semana
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          })}
                        </div>
                        {!pasado && franja !== 'cualquiera' && (
                          <button type="button" className="tsponer" onClick={() => setFechaPonerPaso({ fecha: diaMovilElegido, diaCorto: `${r.corto} ${r.numero}`, franja })}>
                            <Plus size={15} strokeWidth={2.4} />Agregar a la {franja === 'manana' ? 'mañana' : franja}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  
                </div>
              );
            })()}
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
          titulo={fechaPonerPaso.franja ? `${fechaPonerPaso.diaCorto} en la ${fechaPonerPaso.franja === 'manana' ? 'mañana' : fechaPonerPaso.franja}` : undefined}
          onCompromiso={fechaPonerPaso.franja ? () => {
            setCompromisoEditando(undefined);
            setFechaCompromisoNuevo(fechaPonerPaso.fecha);
            setFechaPonerPaso(null);
            setHojaCompromisoAbierta(true);
          } : undefined}
          onElegir={(tId, pId, f) => {
            const fr = fechaPonerPaso.franja;
            ponerFechaPaso(tId, pId, f, fr && fr !== 'cualquiera' ? fr : undefined);
            setFechaPonerPaso(null);
          }}
          onCerrar={() => setFechaPonerPaso(null)}
          onIrATareas={() => {
            navigateToTab('tareas');
          }}
        />
      )}

      <HojaCompromiso 
        isOpen={hojaCompromisoAbierta}
        onClose={() => setHojaCompromisoAbierta(false)}
        compromiso={compromisoEditando}
        fechas={fechas}
        fechaInicial={fechaCompromisoNuevo}
      />
    </div>
  );
};
