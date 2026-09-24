import { Habito, Registro, RetoSemanal, EstadoRetoSemanal } from '../types';
import { parseDateString, formatDateToString, subtractDays, isHabitScheduledForDate, isHabitCompletedOnDate, getTodayString } from './habitUtils';
import { tasaPeriodo } from './progresoUtils';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MOMENTOS: Record<string, string> = { manana: 'mañanas', tarde: 'tardes', noche: 'noches', flexible: 'días' };

export function getLunesActual(todayStr = getTodayString()): string {
  const d = parseDateString(todayStr);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return formatDateToString(d);
}

function addOneDay(dateStr: string): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + 1);
  return formatDateToString(d);
}

export function generarOpcionesReto(habitos: Habito[], registros: Registro[], diasCongelados: string[], todayStr = getTodayString(), retoAnterior?: RetoSemanal | null): RetoSemanal | null {
  if (habitos.length === 0) return null;
  const oldestDate = habitos.reduce((min, h) => {
    const d = formatDateToString(new Date(h.creadoEn));
    return d < min ? d : min;
  }, todayStr);
  const daysOfData = Math.round((parseDateString(todayStr).getTime() - parseDateString(oldestDate).getTime()) / 86400000) + 1;
  
  if (daysOfData < 14) return null;
  
  const hastaStr = subtractDays(todayStr, 1);
  const desdeStr = subtractDays(hastaStr, 29);

  const opciones: RetoSemanal['opciones'] = [];

  // a) El día de la semana que más cuesta
  let peorDia = -1;
  let peorDiaPct = 100;
  // Solo días que aún no pasan esta semana (si el reto se genera a mitad de semana)
  const offsetHoy = (parseDateString(todayStr).getDay() + 6) % 7; // lunes = 0
  for (let i = 0; i < 7; i++) {
    if ((i + 6) % 7 < offsetHoy) continue;
    const res = tasaPeriodo(habitos, registros, diasCongelados, desdeStr, hastaStr, (f) => parseDateString(f).getDay() === i);
    if (res.programados > 0 && res.pct <= peorDiaPct) {
      peorDia = i;
      peorDiaPct = res.pct;
    }
  }
  
  if (peorDia !== -1) {
    const diaNombre = DIAS[peorDia];
    const targetDate = parseDateString(getLunesActual(todayStr));
    targetDate.setDate(targetDate.getDate() + (peorDia === 0 ? 6 : peorDia - 1));
    const targetDateStr = formatDateToString(targetDate);
    const m = habitos.filter(h => isHabitScheduledForDate(h, targetDateStr)).length;
    const avg = (peorDiaPct / 100) * m;
    const n = Math.min(m, Math.round(avg) + 1);
    
    if (m > 0 && n > 0) {
      opciones.push({
        id: 'dia_dificil',
        texto: `${n} de tus ${m} hábitos el ${diaNombre}.`,
        metaTexto: `El ${diaNombre} es el día que más te cuesta: ${peorDiaPct}%.`,
        dia: peorDia,
        metaRequerida: n
      });
    }
  }

  // b) El momento más difícil
  let peorMomento = '';
  let peorMomentoPct = 100;
  for (const mom of ['manana', 'tarde', 'noche', 'flexible']) {
    const res = tasaPeriodo(habitos, registros, diasCongelados, desdeStr, hastaStr, (_, h) => (h.momento || 'flexible') === mom);
    if (res.programados > 0 && res.pct <= peorMomentoPct) {
      peorMomento = mom;
      peorMomentoPct = res.pct;
    }
  }

  if (peorMomento !== '') {
    const habsMomento = habitos.filter(h => (h.momento || 'flexible') === peorMomento);
    let peorHab: Habito | null = null;
    let peorHabPct = 100;
    for (const h of habsMomento) {
      const res = tasaPeriodo([h], registros, diasCongelados, desdeStr, hastaStr);
      if (res.programados > 0 && res.pct <= peorHabPct) {
        peorHabPct = res.pct;
        peorHab = h;
      }
    }
    
    if (peorHab) {
      let progSemana = 0;
      let d = getLunesActual(todayStr);
      for(let i=0; i<7; i++) {
        if (isHabitScheduledForDate(peorHab, d)) progSemana++;
        d = addOneDay(d);
      }
      
      const k = Math.min(progSemana, Math.round((peorHabPct / 100) * progSemana) + 1);
      if (k > 0) {
        const momLabel = MOMENTOS[peorMomento];
        let metaTexto = '';
        if (peorMomento === 'flexible') {
          metaTexto = `Todo el día es tu momento más difícil: ${peorMomentoPct}%. No hace falta que sean seguidas.`;
        } else {
          const art = momLabel === 'mañanas' || momLabel === 'noches' || momLabel === 'tardes' ? 'La' : 'El';
          const momSingular = momLabel === 'mañanas' ? 'mañana' : momLabel === 'noches' ? 'noche' : momLabel === 'tardes' ? 'tarde' : 'día';
          metaTexto = `${art} ${momSingular} es tu momento más difícil: ${peorMomentoPct}%. No hace falta que sean seguidas.`;
        }
        opciones.push({
          id: 'momento_dificil',
          texto: `${k} ${peorMomento === 'flexible' ? 'veces' : momLabel} con "${peorHab.nombre}" esta semana.`,
          metaTexto,
          habitoId: peorHab.id,
          metaRequerida: k
        });
      }
    }
  }

  // c) El hábito con menos fuerza
  let peorHabF: Habito | null = null;
  let peorHabFPct = 100;
  for (const h of habitos) {
    if (opciones.find(o => o.habitoId === h.id)) continue; // Evitar repetido de "b"
    const res = tasaPeriodo([h], registros, diasCongelados, desdeStr, hastaStr);
    if (res.programados > 0 && res.pct <= peorHabFPct) {
      peorHabFPct = res.pct;
      peorHabF = h;
    }
  }

  if (peorHabF) {
    let progSemana = 0;
    let d = getLunesActual(todayStr);
    for(let i=0; i<7; i++) {
      if (isHabitScheduledForDate(peorHabF, d)) progSemana++;
      d = addOneDay(d);
    }
    const k = Math.min(progSemana, Math.round((peorHabFPct / 100) * progSemana) + 1);
    if (k > 0) {
      opciones.push({
        id: 'habito_debil',
        texto: `"${peorHabF.nombre}" ${k} días esta semana.`,
        metaTexto: `Es el hábito que más te cuesta ahora.`,
        habitoId: peorHabF.id,
        metaRequerida: k
      });
    }
  }

  if (opciones.length === 0) return null;
  
  const anteriorNoSalio = retoAnterior?.estado === 'aceptado' || retoAnterior?.estado === 'no_salio';
  
  return {
    id: getLunesActual(todayStr),
    opciones,
    estado: 'propuesto',
    avance: 0,
    anteriorNoSalio
  };
}

export function evaluarRetoSemanal(reto: RetoSemanal, habitos: Habito[], registros: Registro[], todayStr = getTodayString()): RetoSemanal {
  if (reto.estado !== 'aceptado') return reto;
  
  const opcion = reto.opciones.find(o => o.id === reto.opcionElegida);
  if (!opcion) return reto;
  
  let avance = 0;
  
  if (opcion.id === 'dia_dificil') {
    const targetDate = parseDateString(reto.id); 
    if (opcion.dia !== undefined) {
      const idx = opcion.dia;
      if (idx >= 0 && idx <= 6) {
        const offset = idx === 0 ? 6 : idx - 1;
        targetDate.setDate(targetDate.getDate() + offset);
        const tStr = formatDateToString(targetDate);
        
        avance = habitos.filter(h => isHabitScheduledForDate(h, tStr) && isHabitCompletedOnDate(h.id, tStr, registros)).length;
      }
    }
  } else {
    const hId = opcion.habitoId;
    if (hId) {
      let d = reto.id;
      for (let i = 0; i < 7; i++) {
        if (d <= todayStr && isHabitCompletedOnDate(hId, d, registros)) {
          avance++;
        }
        d = addOneDay(d);
      }
    }
  }
  
  const isExpired = todayStr >= addOneDay(addOneDay(addOneDay(addOneDay(addOneDay(addOneDay(addOneDay(reto.id))))))); // next monday
  
  let newState: EstadoRetoSemanal = reto.estado;
  if (avance >= opcion.metaRequerida) {
    newState = 'cumplido';
  } else if (isExpired) {
    newState = 'no_salio';
  }
  
  return { ...reto, avance, estado: newState };
}
