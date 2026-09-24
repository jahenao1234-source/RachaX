import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/HabitContext';
import { TrendingUp, Clock, ChevronRight, Plus } from 'lucide-react';
import {
  fuerzaSerieHabito,
  serieFuerzaTotal,
  tasaPeriodo,
  calcularMejorRachaGlobal,
  contarVecesCumplidas
} from '../../utils/progresoUtils';
import { getTodayString, parseDateString, subtractDays, formatDateToString, contarCompletadosSemana } from '../../utils/habitUtils';
import { getMomentoColorTokens } from '../common/HabitPreviewRow';
import { HabitIcon } from '../common/HabitIcon';


export const StatsScreen: React.FC = () => {
  const { habitosActivos: habitos, registros, diasCongelados, rachaGlobal, openHabitDetail, openCreateMenu, ordenMomentos } = useHabitStore();

  const todayStr = getTodayString();
  const yesterdayStr = subtractDays(todayStr, 1);

  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const monthNamesShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  
  const weekDays = [
    { idx: 1, label: 'L', name: 'lunes' },
    { idx: 2, label: 'M', name: 'martes' },
    { idx: 3, label: 'X', name: 'miércoles' },
    { idx: 4, label: 'J', name: 'jueves' },
    { idx: 5, label: 'V', name: 'viernes' },
    { idx: 6, label: 'S', name: 'sábados' },
    { idx: 0, label: 'D', name: 'domingos' },
  ];

  // Identificar el día 1 (hábito más antiguo)
  const firstHabitDateStr = useMemo(() => {
    if (habitos.length === 0) return null;
    let earliest = formatDateToString(new Date(habitos[0].creadoEn));
    for (const h of habitos) {
      const d = formatDateToString(new Date(h.creadoEn));
      if (d < earliest) earliest = d;
    }
    return earliest;
  }, [habitos]);

  const daysSinceStart = useMemo(() => {
    if (!firstHabitDateStr) return 0;
    if (firstHabitDateStr > yesterdayStr) return 0;
    const ms = parseDateString(yesterdayStr).getTime() - parseDateString(firstHabitDateStr).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  }, [firstHabitDateStr, yesterdayStr]);

  const totalVeces = useMemo(() => contarVecesCumplidas(habitos, registros), [habitos, registros]);

  const isRecent = daysSinceStart < 14;

  // Fuerza de tus hábitos (gráfico general)
  const globalFuerzaSerie = useMemo(() => serieFuerzaTotal(habitos, registros, diasCongelados, yesterdayStr), [habitos, registros, diasCongelados, yesterdayStr]);
  const currentFuerza = globalFuerzaSerie.length > 0 ? globalFuerzaSerie[globalFuerzaSerie.length - 1].valor : 0;
  
  const fuerzaHace30 = globalFuerzaSerie.length > 30 ? globalFuerzaSerie[globalFuerzaSerie.length - 31].valor : 0;
  const diffFuerza = currentFuerza - fuerzaHace30;

  // Preparar SVG data (últimos 180 días)
  const graphPoints = globalFuerzaSerie.slice(-180);
  
  const date30DaysAgo = subtractDays(yesterdayStr, 29);
  const analisisDesdeStr = useMemo(() => {
    if (!firstHabitDateStr) return date30DaysAgo;
    return firstHabitDateStr > date30DaysAgo ? firstHabitDateStr : date30DaysAgo;
  }, [firstHabitDateStr, date30DaysAgo]);

  // Dónde puedes mejorar (Día de la semana)
  const daysBreakdown = useMemo(() => {
    return weekDays.map(wd => {
      const { programados, cumplidos, congelados } = tasaPeriodo(habitos, registros, diasCongelados, analisisDesdeStr, yesterdayStr, (fecha) => parseDateString(fecha).getDay() === wd.idx);
      const base = programados - congelados;
      const pct = base > 0 ? Math.round((cumplidos / base) * 100) : null;
      return { ...wd, pct };
    });
  }, [habitos, registros, diasCongelados, analisisDesdeStr, yesterdayStr]);

  const minDayPct = Math.min(...daysBreakdown.map(d => d.pct !== null ? d.pct : 100));
  const maxDayPct = Math.max(...daysBreakdown.map(d => d.pct !== null ? d.pct : 0));
  const hasDayData = daysBreakdown.some(d => d.pct !== null);
  const diffDay = maxDayPct - minDayPct;
  const lowestDay = daysBreakdown.find(d => d.pct === minDayPct && d.pct !== null);

  const averageWeekday = useMemo(() => {
    const { programados, cumplidos, congelados } = tasaPeriodo(habitos, registros, diasCongelados, analisisDesdeStr, yesterdayStr, (fecha) => {
      const d = parseDateString(fecha).getDay();
      return d !== 0 && d !== 6;
    });
    const base = programados - congelados;
    return base > 0 ? Math.round((cumplidos / base) * 100) : 0;
  }, [habitos, registros, diasCongelados, analisisDesdeStr, yesterdayStr]);

  // Momentos
  const momentsBreakdown = useMemo(() => {
    return ordenMomentos.map(m => {
      const habitsInMoment = habitos.filter(h => (h.momento || 'flexible') === m);
      if (habitsInMoment.length === 0) return null;
      
      const { pct, programados } = tasaPeriodo(habitsInMoment, registros, diasCongelados, analisisDesdeStr, yesterdayStr);
      if (programados === 0) return null;
      
      let nombre = '';
      let text = '';
      if (m === 'manana') { nombre = 'Mañana'; text = 'después de lavarte los dientes'; }
      if (m === 'tarde') { nombre = 'Tarde'; text = 'al llegar a casa'; }
      if (m === 'noche') { nombre = 'Noche'; text = 'después de cenar'; }
      if (m === 'flexible') { nombre = 'Todo el día'; text = 'después de almorzar'; }
      
      return { key: m, nombre, pct, text };
    }).filter(Boolean) as { key: string, nombre: string, pct: number, text: string }[];
  }, [habitos, registros, diasCongelados, analisisDesdeStr, yesterdayStr, ordenMomentos]);

  const minMomPct = momentsBreakdown.length > 0 ? Math.min(...momentsBreakdown.map(m => m.pct)) : 100;
  const maxMomPct = momentsBreakdown.length > 0 ? Math.max(...momentsBreakdown.map(m => m.pct)) : 0;
  const diffMom = maxMomPct - minMomPct;
  const lowestMom = momentsBreakdown.find(m => m.pct === minMomPct);

  // Tus hábitos breakdown
  const habitsBreakdown = useMemo(() => {
    const startOfMonth = `${yesterdayStr.substring(0, 7)}-01`;
    return habitos.map(h => {
      let f = 0;
      let monthPct = 0;
      let isWeekly = h.frecuencia === 'semanal';
      let weeklyText = '';

      if (isWeekly) {
        const fs = fuerzaSerieHabito(h, registros, diasCongelados, yesterdayStr);
        f = fs.length > 0 ? fs[fs.length - 1].valor : 0;
        
        const weekCompletions = contarCompletadosSemana(h.id, todayStr, registros);
        weeklyText = `${weekCompletions} de ${h.vecesPorSemana || 1} esta semana`;
      } else {
        const fs = fuerzaSerieHabito(h, registros, diasCongelados, yesterdayStr);
        f = fs.length > 0 ? fs[fs.length - 1].valor : 0;
        
        const { pct } = tasaPeriodo([h], registros, diasCongelados, startOfMonth, yesterdayStr);
        monthPct = pct;
      }

      return {
        ...h,
        fuerza: Math.round(f * 100),
        monthPct,
        weeklyText,
        isWeekly
      };
    }).sort((a, b) => a.fuerza - b.fuerza);
  }, [habitos, registros, diasCongelados, yesterdayStr]);

  // Este mes 
  const currentMonthStart = `${yesterdayStr.substring(0, 7)}-01`;
  const prevMonthDate = new Date(parseDateString(currentMonthStart));
  prevMonthDate.setDate(0); // Last day of prev month
  const prevMonthEnd = formatDateToString(prevMonthDate);
  const prevMonthStart = `${prevMonthEnd.substring(0, 7)}-01`;
  const prevMonthIdx = prevMonthDate.getMonth();
  const currMonthIdx = parseDateString(yesterdayStr).getMonth();

  const thisMonthData = tasaPeriodo(habitos, registros, diasCongelados, currentMonthStart, yesterdayStr);
  const prevMonthData = tasaPeriodo(habitos, registros, diasCongelados, prevMonthStart, prevMonthEnd);

  const showEsteMes = !isRecent && prevMonthData.programados > 0;

  const startDay = firstHabitDateStr ? parseDateString(firstHabitDateStr).getDate() : 1;
  const startMonth = firstHabitDateStr ? monthNames[parseDateString(firstHabitDateStr).getMonth()] : '';

  const rachaActual = rachaGlobal();
  const mejorRacha = useMemo(() => {
    return Math.max(rachaActual, calcularMejorRachaGlobal(habitos, registros, diasCongelados, firstHabitDateStr || yesterdayStr, yesterdayStr));
  }, [rachaActual, habitos, registros, diasCongelados, firstHabitDateStr, yesterdayStr]);

  let esteMesPhrase = '';
  if (thisMonthData.pct > prevMonthData.pct) {
    esteMesPhrase = `Subiste de ${prevMonthData.pct}% a ${thisMonthData.pct}%.`;
  } else if (thisMonthData.pct === prevMonthData.pct) {
    esteMesPhrase = `Igual que en ${monthNames[prevMonthIdx]}.`;
  } else {
    const diff = prevMonthData.pct - thisMonthData.pct;
    if (diff <= 2) {
      esteMesPhrase = `Casi igual que en ${monthNames[prevMonthIdx]}.`;
    } else {
      esteMesPhrase = `Vas en ${thisMonthData.pct}%; en ${monthNames[prevMonthIdx]} ibas en ${prevMonthData.pct}%. Un mes flojo no borra lo que ya construiste.`;
    }
  }

  // Si no hay hábitos, mostrar el estado vacío
  if (habitos.length === 0) {
    return (
      <div id="screen-stats" className="pb-28 h-full flex flex-col items-center pt-[90px] text-center px-6">
        <header className="fixed top-0 left-0 w-full text-left p-6 pb-0 bg-bg z-10">
          <h1 className="font-heading font-bold text-[44px] leading-none m-0 text-text mb-1.5">Progreso</h1>
          <p className="text-[13px] text-text-muted">Aquí verás cómo avanzas</p>
        </header>

        <TrendingUp size={32} strokeWidth={2} className="text-text-muted mb-4" />
        <h2 className="font-heading font-bold text-[26px] text-text mb-2">Tu progreso empieza con un hábito</h2>
        <p className="text-[15px] text-text-muted leading-relaxed mb-8 max-w-[290px]">
          Cuando cumplas unos días, aquí verás la fuerza de tus hábitos, tus récords y qué días te cuestan más.
        </p>
        <button 
          onClick={openCreateMenu}
          className="h-12 px-6 rounded-[14px] bg-ambar text-ink font-bold text-[15px] flex items-center gap-2 justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={2.5} />
          Crear mi primer hábito
        </button>
      </div>
    );
  }

  return (
    <div id="screen-stats" className="pb-28">
      
      <header className="mb-[26px]">
        <h1 className="font-heading font-bold text-[44px] leading-none m-0 text-text mb-1.5">Progreso</h1>
        {isRecent ? (
          <p className="text-[13px] text-text-muted">
            {daysSinceStart === 0 ? (
              'Empezaste hoy · sin contar hoy'
            ) : (
              `Llevas ${daysSinceStart} ${daysSinceStart === 1 ? 'día' : 'días'} y ${totalVeces} ${totalVeces === 1 ? 'vez cumplida' : 'veces cumplidas'} · sin contar hoy`
            )}
          </p>
        ) : (
          <p className="text-[13px] text-text-muted">Desde el {startDay} de {startMonth} · sin contar hoy</p>
        )}
      </header>

      {/* TARJETA FUERZA */}
      <div className="rounded-[18px] bg-surface border border-line p-[18px] mb-[26px]">
        <h2 className="font-heading font-bold text-[22px] m-0 text-text mb-2">Fuerza de tus hábitos</h2>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-baseline gap-1.5">
            <span className="font-number font-bold text-[44px] leading-none text-text">{currentFuerza}</span>
            <span className="font-number text-[20px] text-text-muted">de 100</span>
          </div>
          {isRecent ? (
            <div className="h-[26px] px-2.5 rounded-full inline-flex items-center chip-sube text-[13px] font-bold">
              creciendo
            </div>
          ) : (
            diffFuerza >= 0 ? (
              <div className="h-[26px] px-2.5 rounded-full inline-flex items-center chip-sube text-[13px] font-bold gap-1">
                <TrendingUp size={14} strokeWidth={3} />
                +{diffFuerza} en 30 días
              </div>
            ) : (
              <div className="h-[26px] px-2.5 rounded-full inline-flex items-center bg-surface-raised text-text-muted text-[13px] font-bold">
                −{Math.abs(diffFuerza)} en 30 días
              </div>
            )
          )}
        </div>

        {/* SVG GRÁFICO MANUAL */}
        <div className="w-full relative aspect-[350/150] mb-4">
          <svg viewBox="0 0 350 150" className="w-full h-full overflow-visible" role="img">
            <title>Fuerza de tus hábitos: hoy {currentFuerza} de 100</title>
            {/* Guide lines */}
            <line x1="0" y1="75" x2="330" y2="75" stroke="var(--line)" strokeWidth="1" />
            <line x1="0" y1="20" x2="330" y2="20" stroke="var(--line)" strokeWidth="1" />
            <line x1="0" y1="130" x2="330" y2="130" stroke="var(--line-strong)" strokeWidth="1" />
            
            {/* Labels right */}
            <text x="336" y="24" className="fill-text-muted text-[11px] font-medium font-sans">100</text>
            <text x="336" y="79" className="fill-text-muted text-[11px] font-medium font-sans">50</text>
            
            {/* Data Line and Area */}
            {graphPoints.length > 0 && (() => {
              const pts = graphPoints.map((p, i) => {
                const x = graphPoints.length > 1 ? (i / (graphPoints.length - 1)) * 330 : 165;
                const y = 130 - (p.valor / 100 * 110);
                return { x, y, fecha: p.fecha };
              });
              
              const lineD = "M " + pts.map(p => `${p.x},${p.y}`).join(" L ");
              const areaD = `${lineD} L ${pts[pts.length - 1].x},130 L ${pts[0].x},130 Z`;
              const endPt = pts[pts.length - 1];

              // Month labels on x axis
              const monthLabels = [];
              let lastM = -1;
              for (const p of pts) {
                if (!p.fecha) continue;
                const mIdx = parseDateString(p.fecha).getMonth();
                const d = parseDateString(p.fecha).getDate();
                if (d === 1 && mIdx !== lastM && p.x < 310) {
                  monthLabels.push(<text key={p.fecha} x={p.x} y="146" textAnchor="middle" className="fill-text-muted text-[11px] font-medium font-sans">{monthNamesShort[mIdx]}</text>);
                  lastM = mIdx;
                }
              }

              return (
                <>
                  <path d={areaD} className="fill-ambar-tint" />
                  <path d={lineD} className="stroke-ambar-text fill-none" strokeWidth="2.5" />
                  <circle cx={endPt.x} cy={endPt.y} r="4.5" className="fill-ambar-text stroke-surface" strokeWidth="2" />
                  {monthLabels}
                </>
              );
            })()}
          </svg>
        </div>

        <p className="text-[13px] text-text-muted leading-snug">
          {isRecent ? (
            "Todo hábito empieza en 0 y sube con cada día que cumples. En unas semanas verás la curva tomar forma."
          ) : (
            currentFuerza >= 90 ? (
              "Tus hábitos ya están firmes. Ahora toca mantenerlos: cada vez que cumples sigue sumando en tus récords."
            ) : diffFuerza >= 0 ? (
              "Sube cada día que cumples y un día gris solo la baja un poco. Cuanto más alta, más firme el hábito."
            ) : (
              "Bajó un poco, y así funciona: baja despacio. Con unos días seguidos vuelve a subir."
            )
          )}
        </p>
      </div>

      {/* ESTE MES */}
      {showEsteMes && (
        <div className="mb-[26px]">
          <h2 className="font-heading font-bold text-[22px] m-0 text-text mb-4">Este mes</h2>
          <div className="space-y-3">
            
            <div className="flex items-center gap-3">
              <span className="w-[92px] text-[15px] font-semibold text-text capitalize shrink-0">{monthNames[currMonthIdx]}</span>
              <div className="flex-1 h-2 rounded-full bg-track-empty overflow-hidden">
                <div className="h-full bg-ambar-text rounded-full" style={{ width: `${thisMonthData.pct}%` }} />
              </div>
              <span className="w-10 text-right font-number text-[20px] font-bold text-text shrink-0">{thisMonthData.pct}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="w-[92px] text-[15px] font-semibold text-text-muted capitalize shrink-0">{monthNames[prevMonthIdx]}</span>
              <div className="flex-1 h-2 rounded-full bg-track-empty overflow-hidden">
                <div className="h-full bg-text-muted rounded-full" style={{ width: `${prevMonthData.pct}%` }} />
              </div>
              <span className="w-10 text-right font-number text-[20px] font-bold text-text-muted shrink-0">{prevMonthData.pct}%</span>
            </div>

          </div>
          
          <p className="text-[13px] text-text-muted mt-4">
            {esteMesPhrase}
          </p>
        </div>
      )}

      {/* TUS HABITOS */}
      <div className="mb-[26px]">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-heading font-bold text-[22px] m-0 text-text">Tus hábitos</h2>
          <span className="text-[13px] text-text-muted">de menor a mayor fuerza</span>
        </div>
        
        <div className="flex flex-col">
          {habitsBreakdown.map(h => {
            const tokens = getMomentoColorTokens(h.momento || 'flexible');
            return (
              <button 
                key={h.id}
                onClick={() => openHabitDetail(h.id)}
                aria-label={`${h.nombre}: fuerza ${h.fuerza}, ${h.isWeekly ? h.weeklyText : `${h.monthPct}% este mes`}. Abrir`}
                className="flex items-center gap-3 py-2.5 min-h-[52px] border-b border-line last:border-0 bg-transparent outline-none active:bg-surface-raised transition-colors text-left"
              >
                <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 ${tokens.bg} ${tokens.icon}`}>
                  <HabitIcon name={h.icono} size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-text truncate">{h.nombre}</span>
                  <span className="block text-[13px] text-text-muted mt-0.5">{h.isWeekly ? h.weeklyText : `${h.monthPct}% este mes`}</span>
                </div>
                <div className="text-right flex flex-col items-end justify-center mr-1">
                  <span className="font-number font-bold text-[24px] leading-none text-text">{h.fuerza}</span>
                  <span className="text-[12px] text-text-muted mt-0.5">fuerza</span>
                </div>
                <ChevronRight size={20} strokeWidth={2} className="text-line-strong shrink-0" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* DONDE PUEDES MEJORAR */}
      <div className="mb-[26px]">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-heading font-bold text-[22px] m-0 text-text">Dónde puedes mejorar</h2>
          {!isRecent && <span className="text-[13px] text-text-muted">últimos 30 días</span>}
        </div>
        
        {isRecent ? (
          <p className="text-[14px] text-text-muted leading-snug">
            Con 2 semanas de datos verás aquí qué días y qué momentos te cuestan más. Te {14 - daysSinceStart === 1 ? 'falta 1 día' : `faltan ${14 - daysSinceStart} días`}.
          </p>
        ) : (
          <>
            
            <p className="text-[13px] font-semibold text-text-muted mb-3">Por día de la semana</p>
            {hasDayData ? (
              <>
                <div className="flex justify-between items-end gap-1 mb-4" role="list">
                  {daysBreakdown.map((d) => {
                    const isLowest = d.pct === minDayPct && diffDay >= 10;
                    return (
                      <div key={d.label} role="listitem" className="flex flex-col items-center flex-1">
                        <span className="sr-only">
                          los {d.name}: {d.pct !== null ? `${d.pct}%` : 'sin datos'}{isLowest ? ', el más bajo' : ''}
                        </span>
                        <div aria-hidden="true" className="flex flex-col items-center w-full">
                          <span className={`text-[12px] font-semibold mb-1.5 ${isLowest ? 'text-text' : 'text-text-muted'}`}>
                            {d.pct !== null ? d.pct : '–'}
                          </span>
                          <div className={`w-full max-w-[32px] h-[84px] bg-track-empty rounded-[10px] relative flex flex-col justify-end overflow-hidden ${isLowest ? 'ring-[1.5px] ring-text ring-offset-[2px] ring-offset-bg' : ''}`}>
                            <div 
                              className={`w-full rounded-b-[10px] rounded-t-[4px] ${isLowest ? 'bg-text' : 'bg-text-muted'}`}
                              style={{ height: d.pct !== null ? `${d.pct}%` : '0%' }}
                            />
                          </div>
                          <span className={`text-[12px] font-semibold mt-2 ${isLowest ? 'text-text' : 'text-text-muted'}`}>
                            {d.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[13px] text-text-muted leading-snug mb-6">
                  {diffDay >= 10 && lowestDay ? (
                    <><span className="text-text font-semibold">Los {lowestDay.name} te cuestan más ({lowestDay.pct}%).</span> Entre semana vas en {averageWeekday}%. Ayuda decidir desde el día antes a qué hora lo harás.</>
                  ) : (
                    "Tus días van parejos. Sigue así."
                  )}
                </p>
              </>
            ) : (
              <p className="text-[13px] text-text-muted mb-6">No hay suficientes datos por día.</p>
            )}

            <p className="text-[13px] font-semibold text-text-muted mb-3">Por momento del día</p>
            {momentsBreakdown.length > 0 ? (
              <>
                <div className="space-y-3 mb-4">
                  {momentsBreakdown.map((m) => {
                    const isLowest = m.pct === minMomPct && diffMom >= 10;
                    const tokens = getMomentoColorTokens(m.key as any);
                    return (
                      <div key={m.key} className="flex items-center gap-3">
                        <div className={`w-[32px] h-[32px] rounded-[10px] flex items-center justify-center shrink-0 ${tokens.bg} ${tokens.icon}`}>
                          {m.key === 'manana' && <HabitIcon name="Sunrise" size={16} />}
                          {m.key === 'tarde' && <HabitIcon name="Sun" size={16} />}
                          {m.key === 'noche' && <HabitIcon name="Moon" size={16} />}
                          {m.key === 'flexible' && <HabitIcon name="Clock" size={16} />}
                        </div>
                        <span className={`w-[80px] text-[15px] shrink-0 ${isLowest ? 'font-bold text-text' : 'text-text'}`}>{m.nombre}</span>
                        <div className="flex-1 h-2 rounded-full bg-track-empty overflow-hidden">
                          <div className={`h-full rounded-full bg-text-muted`} style={{ width: `${m.pct}%` }} />
                        </div>
                        <span className="w-10 text-right font-number text-[20px] shrink-0 text-text">{m.pct}%</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[13px] text-text-muted leading-snug">
                  {diffMom >= 10 && lowestMom ? (
                    <><span className="text-text font-semibold">La {lowestMom.nombre.toLowerCase()} es tu momento más difícil ({lowestMom.pct}%).</span> Prueba anclar esos hábitos a algo que ya haces siempre, como "{lowestMom.text}".</>
                  ) : (
                    "Tus momentos van parejos. Sigue así."
                  )}
                </p>
              </>
            ) : (
              <p className="text-[13px] text-text-muted">No hay hábitos asignados a momentos específicos.</p>
            )}
          </>
        )}
      </div>

      {/* TUS RÉCORDS */}
      {!isRecent && (
        <div className="mb-[26px]">
          <div className="bg-surface border border-line rounded-[18px] p-[14px]">
            <h2 className="font-heading font-bold text-[22px] m-0 text-text mb-4">Tus récords</h2>
            
            <dl>
              <div className="flex items-center justify-between py-2.5 border-b border-line">
                <dt className="text-[14px] font-semibold text-text">Mejor racha de días completos</dt>
                <dd className="flex items-baseline gap-1.5">
                  <span className="font-number font-bold text-[24px] leading-none text-text">
                    {mejorRacha}
                  </span>
                  <span className="text-[13px] text-text-muted">{mejorRacha === 1 ? 'día' : 'días'}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-line">
                <dt className="text-[14px] font-semibold text-text">Racha actual</dt>
                <dd className="flex items-baseline gap-1.5">
                  {rachaActual === 0 ? (
                    <span className="text-[15px] text-text-muted">Empieza hoy</span>
                  ) : (
                    <>
                      <span className="font-number font-bold text-[24px] leading-none text-text">{rachaActual}</span>
                      <span className="text-[13px] text-text-muted">{rachaActual === 1 ? 'día' : 'días'}</span>
                    </>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-[14px] font-semibold text-text">Veces que cumpliste</dt>
                <dd className="flex items-baseline gap-1.5">
                  <span className="font-number font-bold text-[24px] leading-none text-text">{totalVeces}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
      
    </div>
  );
};
