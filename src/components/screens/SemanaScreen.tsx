import React, { useState, useEffect, useRef } from 'react';
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
  textoCargaDia,
  rutaDePaso,
  diaLargo,
  mismoDiaEnSemana,
  semanaMasAntigua,
  nombreSemana,
  sePuedePlanear,
  textoPasosSinDia,
  textoHabitos
} from '../../utils/semanaUtils';
import { HabitIcon } from '../common/HabitIcon';
import { Casilla } from '../tareas/piezas';
import { HojaDiaPaso } from '../tareas/HojaDiaPaso';
import { HojaPonerPaso } from '../semana/HojaPonerPaso';
import { PlanSemana } from '../semana/PlanSemana';
import { HojaCompromiso } from '../semana/HojaCompromiso';
import { HojaCuando } from '../semana/HojaCuando';
import { useEsEscritorio } from './TodayScreen';
import { GripVertical, Clock, Repeat, Sunrise, Sun, Moon, Plus, Calendar, CalendarPlus, ChevronLeft, ChevronRight, Check, ListChecks } from 'lucide-react';
import { momentoDeHora } from '../../utils/compromisosUtils';
import { textoDiaLargo } from '../../utils/tareasUtils';
import { Subtarea, Compromiso } from '../../types';
import { textoHora, momentoDe } from '../../utils/compromisosUtils';
import { focoSemana, formatoDuracion } from '../../utils/focoUtils';

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
    restaurarCompromisos,
    sesionesFoco,
    habitos
  } = useHabitStore();
  
  const hoy = getTodayString();
  const dHoy = new Date(hoy + 'T00:00:00');
  const esDomingo = dHoy.getDay() === 0;
  
  const [semana, setSemana] = useState<number>(esDomingo ? 1 : 0);
  const esEscritorio = useEsEscritorio();
  const [diaMovilElegido, setDiaMovilElegido] = useState<string>(hoy);
  const refSemana = useRef<HTMLDivElement>(null);

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
  
  const [pasoEligiendo, setPasoEligiendo] = useState<{ tareaId: string, paso: Subtarea, tareaNombre: string, ruta: string[] } | null>(null);
  const [fechaPonerPaso, setFechaPonerPaso] = useState<{ fecha: string, diaCorto: string, franja?: Franja } | null>(null);
  
  // Estado para la hoja de compromisos
  const [hojaCompromisoAbierta, setHojaCompromisoAbierta] = useState(false);
  const [compromisoEditando, setCompromisoEditando] = useState<Compromiso | undefined>(undefined);
  const [fechaOcurrencia, setFechaOcurrencia] = useState<string | undefined>(undefined);
  const [fechaCompromisoNuevo, setFechaCompromisoNuevo] = useState(hoy);

  useEffect(() => {
    if (mensajeRescate) {
      const t = setTimeout(() => setMensajeRescate(false), 6000);
      return () => clearTimeout(t);
    }
  }, [mensajeRescate]);

  useEffect(() => {
    const fechasTab = diasDeSemana(hoy, semana);
    if (!fechasTab.includes(diaMovilElegido)) {
      setDiaMovilElegido(mismoDiaEnSemana(diaMovilElegido, fechasTab));
    }
  }, [semana, hoy]);

  const fechas = diasDeSemana(hoy, semana);
  const rango = rangoSemana(fechas);
  // Hasta dónde se puede ir hacia atrás: la semana en que empezaste (con todos los hábitos, también los archivados)
  const minima = semanaMasAntigua(habitos, tareas, hoy);
  
  const semanaPasada = fechas[6] < hoy;
  
  const vas = comoVasSemana(habitosActivos, registros, diasCongelados, hoy);
  const rescate = rescateSemana(habitosActivos, registros, diasCongelados, hoy);
  const psd = pasosSinDia(tareas);
  const s = focoSemana(sesionesFoco, hoy, { habitos: Object.fromEntries(habitosActivos.map(h => [h.id, h.nombre])), tareas: Object.fromEntries(tareas.map(t => [t.id, t.nombre])) });

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
      {!esEscritorio && <section className="card s3como mt-[12px] p-[12px] px-[14px] rounded-[18px] bg-surface border border-line" aria-label={`Cómo vas: cumpliste ${vas.cumplidas} de ${vas.tocaban}, quedan ${vas.quedan} días`}>
        <p className="s3ct m-0 mb-[10px] flex items-baseline justify-between gap-[8px] text-[13px] text-text-muted">
          <b className="font-heading text-[18px] text-text">Cómo vas</b>
          <span>Cumpliste <b className="text-text">{vas.cumplidas} de {vas.tocaban}</b>{vas.quedan > 0 ? ` · quedan ${vas.quedan} días` : ''}</span>
        </p>
        <i className="s3barra block h-[6px] rounded-[9px] bg-track-empty overflow-hidden" aria-hidden="true">
          <b className="block h-full rounded-[9px] bg-ambar-text" style={{ width: vas.tocaban > 0 ? `${Math.round((vas.cumplidas / vas.tocaban) * 100)}%` : '0%' }} />
        </i>
        {s.seg >= 60 && (
          <div className="border-t border-line mt-[12px] pt-[10px]">
            <p className="text-[13px] text-text-muted m-0">
              En Foco esta semana: <b className="text-text">{formatoDuracion(s.seg)}</b><br />
              {s.grupos.slice(0, 3).map(g => `${g.etiqueta}: ${formatoDuracion(g.seg)}`).join(' · ')}
              {s.grupos.length > 3 ? ` · y ${s.grupos.length - 3} más` : ''}
            </p>
          </div>
        )}
      </section>}

      {esEscritorio && <section className="tscomp" aria-labelledby="tscomp-t">
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
        {s.seg >= 60 && (
          <div className="basis-full border-t border-line pt-[10px]">
            <p className="text-[13px] text-text-muted m-0">
              En Foco esta semana: <b className="text-text">{formatoDuracion(s.seg)}</b><br />
              {s.grupos.slice(0, 3).map(g => `${g.etiqueta}: ${formatoDuracion(g.seg)}`).join(' · ')}
              {s.grupos.length > 3 ? ` · y ${s.grupos.length - 3} más` : ''}
            </p>
          </div>
        )}
      </section>}

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
      {!esEscritorio && <div className="s3plan mt-[18px]">
        <div className="s3ph flex items-center justify-between gap-[10px] mb-[10px]">
          <h2 className="font-heading font-bold text-[26px] m-0">Planea</h2>
          <button type="button" className="s3mas min-h-[44px] inline-flex items-center gap-[6px] px-[12px] rounded-[12px] border border-line-strong bg-surface-raised text-text font-bold text-[14px]" onClick={() => { setCompromisoEditando(undefined); setFechaOcurrencia(undefined); setFechaCompromisoNuevo(hoy); setHojaCompromisoAbierta(true); }}>
            <Plus size={16} strokeWidth={2.4} />Compromiso
          </button>
        </div>
        <div className={`s4sem${semana !== 0 ? ' otra' : ''}`} role="group" aria-label="Semana">
          <button type="button" className="s4fl" aria-label={`Semana anterior, ${rangoSemana(diasDeSemana(hoy, semana - 1))}`} aria-disabled={semana <= minima ? 'true' : undefined} onClick={semana > minima ? () => setSemana(semana - 1) : undefined}><ChevronLeft size={22} /></button>
          <div className="s4rng" aria-live="polite" tabIndex={-1} ref={refSemana}><b>{nombreSemana(semana)}</b><span className="sr-only">, </span><span>{rango}</span></div>
          {semana !== 0 && <button type="button" className="s4hoy" onClick={() => { setSemana(0); setDiaMovilElegido(hoy); refSemana.current?.focus(); }}>Hoy</button>}
          <button type="button" className="s4fl" aria-label={`Semana siguiente, ${rangoSemana(diasDeSemana(hoy, semana + 1))}`} onClick={() => setSemana(semana + 1)}><ChevronRight size={22} /></button>
        </div>
      </div>}

      {esEscritorio && <div className="tsplanh">
      <h2 className="font-heading font-bold text-[26px] m-0">Planea</h2>
      <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="tsnuevo" onClick={() => { setCompromisoEditando(undefined); setFechaOcurrencia(undefined); setFechaCompromisoNuevo(hoy); setHojaCompromisoAbierta(true); }}><Plus size={16} strokeWidth={2.4} />Compromiso</button>
      <div role="group" aria-label="Qué semana planear">
        <div className={`s4sem dk${semana !== 0 ? ' otra' : ''}`}>
          <button type="button" className="s4fl" aria-label={`Semana anterior, ${rangoSemana(diasDeSemana(hoy, semana - 1))}`} aria-disabled={semana <= minima ? 'true' : undefined} onClick={semana > minima ? () => setSemana(semana - 1) : undefined}><ChevronLeft size={22} /></button>
          <div className="s4rng" aria-live="polite" tabIndex={-1} ref={refSemana}><b>{nombreSemana(semana)}</b><span className="sr-only">, </span><span>{rango}</span></div>
          {semana !== 0 && <button type="button" className="s4hoy" onClick={() => { setSemana(0); setDiaMovilElegido(hoy); refSemana.current?.focus(); }}>Hoy</button>}
          <button type="button" className="s4fl" aria-label={`Semana siguiente, ${rangoSemana(diasDeSemana(hoy, semana + 1))}`} onClick={() => setSemana(semana + 1)}><ChevronRight size={22} /></button>
        </div>
      </div>
      </div>
      </div>}

      {esEscritorio ? (
        <PlanSemana 
          fechas={fechas} 
          hoy={hoy} 
          onElegirDia={(tareaId, paso) => setPasoEligiendo({ tareaId, paso, tareaNombre: tareas.find(t => t.id === tareaId)?.nombre || '', ruta: rutaDePaso(tareas.find(t => t.id === tareaId), paso.id) })} 
          avisar={avisar}
          onEditarCompromiso={(c, fecha) => {
            setCompromisoEditando(c);
            setFechaOcurrencia(fecha);
            setHojaCompromisoAbierta(true);
          }}
          onMoverCompromiso={handleMoverCompromiso}
        />
        ) : (
          <div className="flex flex-col w-full">
            {/* Móvil: tira horizontal de días */}
            <div className="s3tira grid grid-cols-7 gap-[4px] mb-[10px]" aria-label="Días">
              {fechas.map(f => {
                const r = etiquetaDia(f);
                const isSelected = f === diaMovilElegido;
                const dmInfo = diaPorMomentos(tareas, compromisos, habitosActivos, f, hoy);
                const totalItems = dmInfo.pasos + dmInfo.compromisos;
                const puntitos = '•'.repeat(Math.min(totalItems, 3));
                return (
                  <button 
                    key={f} 
                    onClick={() => setDiaMovilElegido(f)}
                    aria-pressed={isSelected} aria-current={f === hoy ? 'date' : undefined}
                    aria-label={`${diaLargo(f)}${f === hoy ? ', hoy' : ''}, ${textoCargaDia(dmInfo)}`}
                    className={`min-h-[56px] flex flex-col items-center justify-center gap-[1px] rounded-[12px] border font-inherit text-[12px] font-semibold transition-colors ${isSelected ? 'border-text border-[1.5px] bg-surface-raised text-text' : 'border-line bg-surface text-text'} ${f < hoy && !isSelected ? 'text-text-muted' : ''}`}
                  >
                    <span aria-hidden="true">{r.corto.charAt(0)}</span>
                    <b className="text-[18px]" aria-hidden="true">{r.numero}</b>
                    <i className="not-italic h-[10px] leading-[8px] tracking-[1px] text-text-muted text-[14px]" aria-hidden="true">{puntitos}</i>
                  </button>
                );
              })}
            </div>

            {/* Agenda del día elegido */}
            {(() => {
              const dm = diaPorMomentos(tareas, compromisos, habitosActivos, diaMovilElegido, hoy);
              const r = etiquetaDia(diaMovilElegido);
              const pasado = diaMovilElegido < hoy;
              const titleDate = diaMovilElegido === hoy ? `${diaLargo(diaMovilElegido)} · hoy` : diaLargo(diaMovilElegido);
              const totalHabitos = Object.values(dm.habitos).reduce((a, b) => a + b, 0);
              
              return (
                <div className="flex flex-col mb-24">
                  <div className="s3dia p-[4px] px-[14px] pb-[10px] rounded-[16px] bg-surface border border-line">
                    <div className="s3dh my-[10px] mt-[10px] mb-[4px] flex items-baseline justify-between gap-[8px] text-[15px]">
                      <b className="font-bold text-text">{titleDate}</b>
                      <span className="text-[12px] text-text-muted">{textoCargaDia(dm)}{totalHabitos > 0 ? ` · ${totalHabitos} hábitos` : ''}</span>
                    </div>

                    {(() => {
                      const totalSinDia = psd.reduce((a, g) => a + g.pasos.length, 0);
                      const sePuede = sePuedePlanear(diaMovilElegido, hoy);
                      if (semanaPasada) {
                        return <p className="s4sd">Esta semana ya pasó. Aquí ves lo que hiciste.</p>;
                      } else if (sePuede && totalSinDia > 0) {
                        return (
                          <p className="s4sd">
                            <CalendarPlus size={18} />
                            <span><b>{textoPasosSinDia(totalSinDia)}</b>. Ponle uno con el + de un momento.</span>
                          </p>
                        );
                      }
                      return null;
                    })()}

                    {FRANJAS.map(franja => {
                      // "Todo el día" sale si tiene pasos, compromisos o hábitos
                      if (franja === 'cualquiera' && dm.franjas[franja].length === 0 && dm.habitosDe.cualquiera.length === 0) return null;
                      const items = dm.franjas[franja];
                      // "Libre": sin pasos ni compromisos (aunque tenga hábitos)
                      const vacio = items.length === 0;
                      
                      const tile = franja === 'manana' ? 'bg-manana-tint text-manana-text' : franja === 'tarde' ? 'bg-coral-tint text-coral-text' : franja === 'noche' ? 'bg-lila-tint text-lila-text' : 'bg-surface-raised text-text-muted';
                      
                      return (
                        <div key={franja} className={`s3mom py-[4px] pb-[8px] border-t border-line${vacio ? ' py-[2px]' : ''}`}>
                          <div className="s3mh m-0 flex items-center gap-[8px] min-h-[44px] text-[14px] font-bold">
                            <span className={`s4mi ${tile}`} aria-hidden="true">{iconForFranja(franja)}</span>
                            <span className={`s3mn ${vacio ? "flex-none" : "flex-1"}`}>{franja === 'manana' ? 'Mañana' : franja === 'tarde' ? 'Tarde' : franja === 'noche' ? 'Noche' : 'Todo el día'}</span>
                            {vacio && franja !== 'cualquiera' && <span className="s3libre flex-1 text-[13px] font-medium text-text-muted">Libre</span>}
                            {!pasado && franja !== 'cualquiera' && (
                              <button type="button" className="s3add w-[44px] h-[44px] mr-[-6px] border-none bg-transparent text-text flex items-center justify-center relative before:content-[''] before:absolute before:inset-[6px] before:rounded-[99px] before:bg-surface-raised before:z-0" aria-label={`Agregar a la ${franja === 'manana' ? 'mañana' : franja}`} onClick={() => setFechaPonerPaso({ fecha: diaMovilElegido, diaCorto: `${r.corto} ${r.numero}`, franja })}>
                                <Plus size={18} strokeWidth={2.4} className="relative" />
                              </button>
                            )}
                          </div>
                          
                          {dm.habitosDe[franja].length > 0 && (
                            <p className="s4hab"><Repeat size={13} /><span><b>Hábitos:</b> {textoHabitos(dm.habitosDe[franja].map(h => h.nombre))}</span></p>
                          )}
                          
                          {items.length > 0 && (
                            <ul className="s2items list-none m-0 p-0 grid grid-cols-1 gap-[5px]">
                              {items.map(it => {
                                if (it.tipo === 'paso') {
                                  return (
                                    <li key={`p-${it.dato.paso.id}`}
                                      className={`s2paso s3paso relative pr-[44px] p-[7px] px-[8px] rounded-[10px] ${pasado ? 'bg-transparent py-[3px] px-0' : 'bg-surface-raised'}`}
                                      onClick={(e) => { if (!pasado && !(e.target as HTMLElement).closest('.tchk')) setPasoEligiendo({ tareaId: it.dato.tareaId, paso: it.dato.paso, tareaNombre: it.dato.tareaNombre, ruta: rutaDePaso(tareas.find(t => t.id === it.dato.tareaId), it.dato.paso.id) }); }}>
                                      <span className="s2pt block text-[13px] font-semibold leading-[1.3] text-text" style={it.dato.paso.hecha ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : undefined}>{it.dato.paso.texto}</span>
                                      <span className="s2pie flex items-start gap-[6px] mt-[5px] min-w-0">
                                        {!semanaPasada && <Casilla paso={it.dato.paso} onToggle={() => toggleSubtarea(it.dato.tareaId, it.dato.paso.id)} />}
                                        <span className="s2tarea text-[12px] leading-[1.3] text-text-muted min-w-0 break-words"><span className="s4tico"><HabitIcon name={it.dato.tareaIcono || 'ListChecks'} size={13} /></span>{it.dato.tareaNombre}{it.dato.atraso ? ` · ${it.dato.atraso}` : ''}</span>
                                      </span>
                                      {!pasado && (
                                        <button className="s3cambiar absolute right-0 top-1/2 -translate-y-1/2 w-[44px] h-[44px] border-none bg-none text-text-muted flex items-center justify-center" aria-label={`Cambiar el día o el momento de ${it.dato.paso.texto}`} onClick={(e) => { e.stopPropagation(); setPasoEligiendo({ tareaId: it.dato.tareaId, paso: it.dato.paso, tareaNombre: it.dato.tareaNombre, ruta: rutaDePaso(tareas.find(t => t.id === it.dato.tareaId), it.dato.paso.id) }); }}>
                                          <Calendar size={16} />
                                        </button>
                                      )}
                                      {semanaPasada && it.dato.paso.hecha && (
                                        <span className="s4hecho" aria-label="Hecho"><Check size={14} /></span>
                                      )}
                                    </li>
                                  );
                                } else {
                                  const c = it.dato as Compromiso;
                                  return (
                                    <li key={`c-${c.id}`}
                                      className={`s2comp p-[7px] px-[8px] rounded-[10px] border border-line-strong bg-transparent ${semanaPasada ? 'opacity-60' : ''}`}
                                      onClick={() => { if (!semanaPasada) { setCompromisoEditando(c); setFechaOcurrencia(diaMovilElegido); setHojaCompromisoAbierta(true); } }}>
                                      <span className="s2hora flex items-center gap-[4px] font-heading font-bold text-[14px] text-text">
                                        <Clock size={12} className="text-text-muted" />
                                        {c.hora ? textoHora(c.hora) : 'Sin hora'}
                                      </span>
                                      <span className="s2ct block text-[13px] font-semibold leading-[1.3] mt-[2px] text-text">{c.titulo}</span>
                                      {c.repetirSemanal && (
                                        <span className="s2rep flex items-center gap-[4px] mt-[3px] text-[11px] text-text-muted">
                                          <Repeat size={11} />
                                          cada semana
                                        </span>
                                      )}
                                    </li>
                                  );
                                }
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                    {!semanaPasada && dm.pasos > 0 && sePuedePlanear(diaMovilElegido, hoy) && <p className="s4sin">Toca un paso para cambiarlo de día o de momento.</p>}
                  </div>
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

      {pasoEligiendo && esEscritorio && (
        <HojaDiaPaso
          pasoTexto={pasoEligiendo.paso.texto}
          tareaNombre={pasoEligiendo.tareaNombre}
          fecha={pasoEligiendo.paso.fecha}
          hoy={hoy}
          onElegir={(f) => {
            ponerFechaPaso(pasoEligiendo.tareaId, pasoEligiendo.paso.id, f);
            setPasoEligiendo(null);
          }}
          onCerrar={() => setPasoEligiendo(null)}
        />
      )}

      {pasoEligiendo && !esEscritorio && (
        <HojaCuando
          tareaId={pasoEligiendo.tareaId}
          paso={pasoEligiendo.paso}
          tareaNombre={pasoEligiendo.tareaNombre}
          ruta={pasoEligiendo.ruta}
          hoy={hoy}
          diaInicial={diaMovilElegido}
          ponerFechaPaso={ponerFechaPaso}
          onHecho={avisar}
          onCerrar={() => setPasoEligiendo(null)}
        />
      )}

      {fechaPonerPaso && (
        <HojaPonerPaso
          diaCorto={fechaPonerPaso.diaCorto}
          fecha={fechaPonerPaso.fecha}
          pasosSinDia={psd}
          titulo={fechaPonerPaso.franja ? `${fechaPonerPaso.diaCorto} en la ${fechaPonerPaso.franja === 'manana' ? 'mañana' : fechaPonerPaso.franja}` : undefined}
          franjaStr={fechaPonerPaso.franja ? (fechaPonerPaso.franja === 'manana' ? 'mañana' : fechaPonerPaso.franja) : undefined}
          onCompromiso={fechaPonerPaso.franja ? () => {
            setCompromisoEditando(undefined);
            setFechaOcurrencia(undefined);
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
        fechaOcurrencia={fechaOcurrencia}
        fechaInicial={fechaCompromisoNuevo}
      />
    </div>
  );
};
