import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/HabitContext';
import { TrendingUp, Clock, ChevronRight, ChevronDown, Plus, Calendar } from 'lucide-react';
import {
  fuerzaSerieHabito,
  serieFuerzaTotal,
  tasaPeriodo,
  calcularMejorRachaGlobal,
  contarVecesCumplidas
} from '../../utils/progresoUtils';
import { getTodayString, parseDateString, subtractDays, formatDateToString, contarCompletadosSemana } from '../../utils/habitUtils';
import { datosRadar, posicionRadar, poligonoRadar, valoresAntes, hayFiguraAntes, flechaRadar, textoRadar, ariaRadarDibujo, ariaPuntoRadar, destacadosRadar, FILAS_TUS_HABITOS } from '../../utils/radarUtils';
import { getMomentoColorTokens } from '../common/HabitPreviewRow';
import { HabitIcon } from '../common/HabitIcon';
import { useState, useEffect } from 'react';
import { CalendarScreen } from './CalendarScreen';
import { QueHacerAhora } from '../progreso/QueHacerAhora';
import { TuAnio } from '../progreso/TuAnio';
import { useEsEscritorio } from './TodayScreen';
import { focoHabitoMes, formatoDuracion } from '../../utils/focoUtils';


export const StatsScreen: React.FC<{ pestanaInicial?: 'resumen' | 'calendario' }> = ({ pestanaInicial = 'resumen' }) => {
  const { habitosActivos: habitos, registros, diasCongelados, rachaGlobal, openHabitDetail, openCreateMenu, ordenMomentos, navigateToTab, sesionesFoco } = useHabitStore();

  const [pestana, setPestana] = useState<'resumen' | 'calendario'>(pestanaInicial);
  const [fechaAbrir, setFechaAbrir] = useState<string | null>(null);
  const [verTodosHabitos, setVerTodosHabitos] = useState(false);
  const desk = useEsEscritorio();

  useEffect(() => {
    setPestana(pestanaInicial);
  }, [pestanaInicial]);

  const todayStr = getTodayString();
  const yesterdayStr = subtractDays(todayStr, 1);

  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
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
  const seriesPorHabito = useMemo(() => {
    return new Map(habitos.map(h => [h.id, fuerzaSerieHabito(h, registros, diasCongelados, yesterdayStr)]));
  }, [habitos, registros, diasCongelados, yesterdayStr]);

  const globalFuerzaSerie = useMemo(() => serieFuerzaTotal(habitos, registros, diasCongelados, yesterdayStr, seriesPorHabito), [habitos, registros, diasCongelados, yesterdayStr, seriesPorHabito]);
  const currentFuerza = globalFuerzaSerie.length > 0 ? globalFuerzaSerie[globalFuerzaSerie.length - 1].valor : 0;
  
  const fuerzaHace30 = globalFuerzaSerie.length > 30 ? globalFuerzaSerie[globalFuerzaSerie.length - 31].valor : 0;
  const diffFuerza = currentFuerza - fuerzaHace30;

  const radar = useMemo(() => datosRadar(habitos, registros, diasCongelados, yesterdayStr, ordenMomentos, undefined, seriesPorHabito), [habitos, registros, diasCongelados, yesterdayStr, ordenMomentos, seriesPorHabito]);
  const destacados = useMemo(() => destacadosRadar(radar.puntos, isRecent), [radar, isRecent]);
  
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
      
      let focoSeg = focoHabitoMes(sesionesFoco, h.id, todayStr).seg;
      let focoText = focoSeg >= 60 ? ` · ${formatoDuracion(focoSeg)} en Foco` : '';

      if (isWeekly) {
        const fs = seriesPorHabito.get(h.id) || [];
        f = fs.length > 0 ? fs[fs.length - 1].valor : 0;
        
        const weekCompletions = contarCompletadosSemana(h.id, todayStr, registros);
        weeklyText = `${weekCompletions} de ${h.vecesPorSemana || 1} esta semana`;
      } else {
        const fs = seriesPorHabito.get(h.id) || [];
        f = fs.length > 0 ? fs[fs.length - 1].valor : 0;
        
        const { pct } = tasaPeriodo([h], registros, diasCongelados, startOfMonth, yesterdayStr);
        monthPct = pct;
      }

      return {
        ...h,
        fuerza: Math.round(f * 100),
        monthPct,
        weeklyText,
        focoText,
        isWeekly
      };
    }).sort((a, b) => a.fuerza - b.fuerza);
  }, [habitos, registros, diasCongelados, yesterdayStr, sesionesFoco, todayStr, seriesPorHabito]);

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
          className="h-12 px-6 rounded-[14px] logro text-ink font-bold text-[15px] flex items-center gap-2 justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={2.5} />
          Crear mi primer hábito
        </button>
      </div>
    );
  }

  // ---------- Piezas de la pantalla (JSX, sin hooks). El celular y el escritorio las ordenan distinto ----------
  // design/maqueta-progreso-informe.html: celular 1-4 · escritorio 6-8. Tarjeta de escritorio = surface, borde line, 18px, 20px de relleno.
  const tarjeta = 'rounded-[18px] bg-surface border border-line p-5';
  const revisarDia = (f: string) => { setFechaAbrir(f); setPestana('calendario'); };

  const pestanas = (
    <div
      className={`grid grid-cols-2 gap-[3px] p-[3px] rounded-[12px] border border-line bg-surface ${desk ? 'w-[320px] shrink-0' : 'mt-3.5 mb-[26px]'}`}
      role="tablist"
      aria-label="Progreso"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const otra = pestana === 'resumen' ? 'calendario' : 'resumen';
          setPestana(otra);
          document.getElementById(otra === 'resumen' ? 'tR1' : 'tC1')?.focus();
        }
      }}
    >
      {(['resumen', 'calendario'] as const).map((p) => (
        <button
          key={p}
          type="button"
          role="tab"
          id={p === 'resumen' ? 'tR1' : 'tC1'}
          aria-selected={pestana === p}
          aria-controls={p === 'resumen' ? 'pR1' : 'pC1'}
          onClick={() => setPestana(p)}
          tabIndex={pestana === p ? 0 : -1}
          className={`min-h-[44px] border-none rounded-[9px] bg-transparent text-[15px] font-bold outline-none focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-2 transition-colors ${pestana === p ? 'bg-surface-raised text-text shadow-[inset_0_0_0_1.5px_var(--text)]' : 'text-text-muted'}`}
        >
          {p === 'resumen' ? 'Resumen' : 'Calendario'}
        </button>
      ))}
    </div>
  );

  // Radar (design/maqueta-progreso-radar.html)
  const COLOR_MOMENTO_RADAR: Record<string, string> = { manana: 'var(--manana)', tarde: 'var(--coral)', noche: 'var(--lila)', flexible: 'var(--text-muted)' };
  const W = desk ? 560 : 314;
  const H = desk ? 340 : 244;
  const cx = W / 2;
  const cy = H / 2;
  const radio = desk ? 128 : 76;
  const n = radar.puntos.length;
  const conAntes = !isRecent && hayFiguraAntes(radar.puntos);

  const fuerzaCard = (
    <div className={`rounded-[18px] bg-surface border border-line ${desk ? 'p-5 rdalto' : 'p-[18px] mb-[26px]'}`}>
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
          globalFuerzaSerie.length > 30 ? (
            diffFuerza === 0 ? (
              <div className="h-[26px] px-2.5 rounded-full inline-flex items-center bg-surface-raised text-text-muted text-[13px] font-bold">
                Igual que hace 30 días
              </div>
            ) : diffFuerza > 0 ? (
              <div className="h-[26px] px-2.5 rounded-full inline-flex items-center chip-sube text-[13px] font-bold gap-1">
                <TrendingUp size={14} strokeWidth={3} />
                +{diffFuerza} en 30 días
              </div>
            ) : (
              <div className="h-[26px] px-2.5 rounded-full inline-flex items-center bg-surface-raised text-text-muted text-[13px] font-bold">
                −{Math.abs(diffFuerza)} en 30 días
              </div>
            )
          ) : (
            <div className="h-[26px] px-2.5 rounded-full inline-flex items-center chip-sube text-[13px] font-bold">
              creciendo
            </div>
          )
        )}
      </div>

      {radar.modo === 'radar' && (
        <div className={`rdw${desk ? ' grande' : ''}${n > 9 ? ' muchos' : ''}`}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaRadarDibujo(n, conAntes)}>
            <polygon className="rd-g" points={poligonoRadar(Array(n).fill(25), radio, cx, cy)} />
            <polygon className="rd-g medio" points={poligonoRadar(Array(n).fill(50), radio, cx, cy)} />
            <polygon className="rd-g" points={poligonoRadar(Array(n).fill(75), radio, cx, cy)} />
            <polygon className="rd-g" points={poligonoRadar(Array(n).fill(100), radio, cx, cy)} />
            {Array.from({ length: n }).map((_, i) => {
              const dest = posicionRadar(i, n, 100, radio);
              return <line key={i} className="rd-g" x1={cx} y1={cy} x2={cx + dest.x} y2={cy + dest.y} />;
            })}
            {conAntes && <polygon className="rd-a" points={poligonoRadar(valoresAntes(radar.puntos), radio, cx, cy)} />}
            <polygon className="rd-h" points={poligonoRadar(radar.puntos.map(p => p.hoy), radio, cx, cy)} />
            {radar.puntos.map((p, i) => {
              const dest = posicionRadar(i, n, p.hoy, radio);
              return <circle key={i} className="rd-v" r="3.5" cx={cx + dest.x} cy={cy + dest.y} />;
            })}
          </svg>
          {radar.puntos.map((p, i) => {
            const q = posicionRadar(i, n, 100, radio + 10);
            const left = ((cx + q.x) / W) * 100;
            const top = ((cy + q.y) / H) * 100;
            const flecha = flechaRadar(p);
            let className = "rdl";
            if (q.x > 8) className += " der";
            if (q.x < -8) className += " izq";
            if (flecha === "↓") className += " baja";
            
            const st = q.x > 8 ? { left: `${left}%`, top: `${top}%`, maxWidth: `calc(${100 - left}% + 18px)` } :
                       q.x < -8 ? { left: `${left}%`, top: `${top}%`, maxWidth: `calc(${left}% + 18px)` } :
                       { left: `${left}%`, top: `${top}%` };
            
            return (
              <button 
                type="button" 
                key={i} 
                className={className} 
                style={st} 
                aria-label={ariaPuntoRadar(p, conAntes)} 
                onClick={() => openHabitDetail(p.habito.id)}
              >
                <i style={{ background: COLOR_MOMENTO_RADAR[p.momento] }}></i>
                <span>{p.corto}</span>
                {conAntes && flecha && <b>{flecha}</b>}
                {conAntes && p.antes === null && <small>nuevo</small>}
              </button>
            );
          })}
        </div>
      )}
      
      {radar.modo === 'barras' && (
        <div className="rdb">
          {radar.puntos.map((p, i) => (
            <button key={i} type="button" className="rdbf" aria-label={ariaPuntoRadar(p, true)} onClick={() => openHabitDetail(p.habito.id)}>
              <span className="rdbh">
                <i style={{ background: COLOR_MOMENTO_RADAR[p.momento] }}></i>
                {p.habito.nombre}
                <b>{p.hoy}</b>
              </span>
              <span className="rdbt">
                <i style={{ width: `${p.hoy}%` }}></i>
                {p.antes !== null && <u style={{ left: `calc(${p.antes}% - 1px)` }}></u>}
              </span>
            </button>
          ))}
        </div>
      )}

      {radar.modo !== 'vacio' && (
        <p className="rdley">
          <span><i></i>hoy</span>
          {conAntes && radar.modo === 'radar' && (
            <>
              <span><i className="antes"></i>hace 30 días</span>
              <span><b>↑</b> subió · ↓ bajó</span>
            </>
          )}
          {conAntes && radar.modo === 'barras' && (
            <span><i className="antes" style={{ width: 2, height: 12, border: 'none', background: 'var(--text)' }}></i>hace 30 días</span>
          )}
        </p>
      )}

      {radar.modo === 'radar' && radar.resto > 0 && (
        <button type="button" className="rdmas" onClick={() => { setVerTodosHabitos(true); window.setTimeout(() => document.getElementById('tusHabitosSec')?.scrollIntoView({ behavior: 'smooth' }), 0); }}>
          y {radar.resto} más en Tus hábitos
        </button>
      )}

      <p className="text-[13px] text-text-muted leading-snug max-w-[68ch]">
        {textoRadar(radar.puntos, isRecent)}
      </p>
    </div>
  );

  const esteMesSec = showEsteMes ? (
    <div className={desk ? tarjeta : 'mb-[26px]'}>
      <h2 className="font-heading font-bold text-[22px] m-0 text-text mb-4">Este mes</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-[92px] text-[15px] font-semibold text-text capitalize shrink-0">{monthNames[currMonthIdx]}</span>
          <div className="flex-1 h-2 rounded-full bg-track-empty overflow-hidden">
            <div className="h-full fill-logro rounded-full" style={{ width: `${thisMonthData.pct}%` }} />
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
  ) : null;

  // Tus hábitos: los que más necesitan atención primero (6 en escritorio, 5 en el celular) y "Ver todos (N)"
  const limiteHabitos = desk ? FILAS_TUS_HABITOS.escritorio : FILAS_TUS_HABITOS.celular;
  // Solo se pliega si esconde 2 o más (un botón para mostrar una sola fila no vale la pena)
  const plegarHabitos = habitsBreakdown.length > limiteHabitos + 1;

  const tusHabitosSec = (
    <div id="tusHabitosSec" className={desk ? tarjeta : 'mb-[26px]'}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-heading font-bold text-[22px] m-0 text-text">Tus hábitos</h2>
        <span className="text-[13px] text-text-muted">de menor a mayor fuerza</span>
      </div>
      <div className="flex flex-col" id="tusHabitosLista">
        {(verTodosHabitos || !plegarHabitos ? habitsBreakdown : habitsBreakdown.slice(0, limiteHabitos)).map(h => {
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
                <span className="block text-[13px] text-text-muted mt-0.5">{h.isWeekly ? h.weeklyText : `${h.monthPct}% este mes`}{h.focoText}</span>
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
      {plegarHabitos && (
        <button type="button" className="rdver" aria-expanded={verTodosHabitos} aria-controls="tusHabitosLista" onClick={() => setVerTodosHabitos(!verTodosHabitos)}>
          {verTodosHabitos ? 'Ver menos' : `Ver todos (${habitsBreakdown.length})`}
          <ChevronDown size={16} strokeWidth={2.2} aria-hidden="true" style={verTodosHabitos ? { transform: 'rotate(180deg)' } : undefined} />
        </button>
      )}
    </div>
  );

  const dondeSec = (
    <div className={desk ? tarjeta : 'mb-[26px]'}>
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

          <p id="progreso-momentos" className="text-[13px] font-semibold text-text-muted mb-3 scroll-mt-4">Por momento del día</p>
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
  );

  const recordsSec = !isRecent ? (
    <div className={desk ? '' : 'mb-[26px]'}>
      <div className={`bg-surface border border-line rounded-[18px] ${desk ? 'p-5' : 'p-[14px]'}`}>
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
  ) : null;

  // "Lo que dice tu figura" (escritorio, debajo de Tus récords; design/maqueta-progreso-radar.html, ajuste del 30 sep)
  const figuraSec = desk && radar.modo === 'radar' && destacados.length > 0 ? (
    <div className={tarjeta}>
      <h2 className="font-heading font-bold text-[22px] m-0 text-text mb-2">Lo que dice tu figura</h2>
      {destacados.map((d) => (
        <button key={d.tipo} type="button" className={`rdd ${d.tipo}`} onClick={() => openHabitDetail(d.punto.habito.id)}
          aria-label={`${d.titulo}: ${d.punto.habito.nombre}, ${d.tipo === 'subio' ? `subió ${d.punto.hoy - (d.punto.antes ?? d.punto.hoy)}` : `fuerza ${d.punto.hoy}`}. Ver el hábito`}>
          <span className="t"><small>{d.titulo}</small><b><i style={{ background: COLOR_MOMENTO_RADAR[d.punto.momento] }}></i>{d.punto.habito.nombre}</b></span>
          <span className="v">{d.valor}</span>
          <ChevronRight size={16} strokeWidth={2.2} className="ch" aria-hidden="true" />
        </button>
      ))}
    </div>
  ) : null;

  const derecha = esteMesSec || recordsSec || figuraSec;

  return (
    <div id="screen-stats" className="pb-28">

      <header className={`flex justify-between gap-4 ${desk ? 'items-end' : 'items-start'}`}>
        <div className="flex-1 min-w-0">
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
        </div>
        {desk && pestanas}
      </header>

      {!desk && pestanas}

      {pestana === 'resumen' && (
        <div role="tabpanel" id="pR1" aria-labelledby="tR1" className={`progreso ${desk ? 'mt-[26px]' : ''}`}>
          <QueHacerAhora onRevisarDia={revisarDia} />

          {desk ? (
            <>
              <div className={derecha ? 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5 items-stretch' : ''}>
                {fuerzaCard}
                {derecha && <div className="flex flex-col gap-5">{esteMesSec}{recordsSec}{figuraSec}</div>}
              </div>
              <TuAnio onRevisarDia={revisarDia} />
              <div className="grid grid-cols-2 gap-5 items-start mt-5">
                {tusHabitosSec}
                {dondeSec}
              </div>
            </>
          ) : (
            <>
              {fuerzaCard}
              {esteMesSec}
              {tusHabitosSec}
              {dondeSec}
              {recordsSec}
            </>
          )}
        </div>
      )}

      {pestana === 'calendario' && (
        <div role="tabpanel" id="pC1" aria-labelledby="tC1" className="progreso">
          <CalendarScreen incrustado abrirFecha={fechaAbrir} onFechaAbierta={() => setFechaAbrir(null)} />
        </div>
      )}
    </div>
  );
};
