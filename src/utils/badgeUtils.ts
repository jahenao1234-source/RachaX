import { Habito, Registro, Premio } from '../types';
import { 
  getTodayString, 
  getDiasDeRegreso, 
  contarProgresoReto,
  isHabitScheduledForDate,
  isHabitCompletedOnDate,
  formatDateToString
} from './habitUtils';
import { 
  contarVecesCumplidas, 
  fuerzaSerieHabito, 
  tasaPeriodo,
  addDays
} from './progresoUtils';

export interface InsigniaDef {
  id: string;
  familia: string;
  nombre: string;
  descripcion: string;
  requisito: string;
  icono: string;
  meta: number;
  progresoActual: number;
  desbloqueada: boolean;
  fechaDesbloqueo?: string;
  premioLlama?: string;
}

export const calcularInsignias = (
  habitos: Habito[],
  registros: Registro[],
  premios: Premio[],
  diasCongelados: string[],
  insigniasGanadas: Record<string, string>
): InsigniaDef[] => {
  const todayStr = getTodayString();
  
  // 1. Constancia (Veces cumplidas)
  const constancia = contarVecesCumplidas(habitos, registros);

  // Helper para oldestDate
  let oldestDate = todayStr;
  if (habitos.length > 0) {
    oldestDate = formatDateToString(new Date(habitos[0].creadoEn));
    for (const h of habitos) {
      const d = formatDateToString(new Date(h.creadoEn));
      if (d < oldestDate) oldestDate = d;
    }
  }

  // 2. Días completos: TOTAL de días (no seguidos) con al menos un hábito diario programado en los que cumpliste todos. Los días congelados no suman.
  let diasCompletos = 0;
  if (habitos.length > 0) {
    let curDate = oldestDate;
    while (curDate <= todayStr) {
      if (!diasCongelados.includes(curDate)) {
        const scheduled = habitos.filter(h => h.frecuencia !== 'semanal' && curDate >= formatDateToString(new Date(h.creadoEn)) && isHabitScheduledForDate(h, curDate));
        if (scheduled.length > 0) {
          const completed = scheduled.filter(h => isHabitCompletedOnDate(h.id, curDate, registros)).length;
          if (completed === scheduled.length) {
            diasCompletos++;
          }
        }
      }
      curDate = addDays(curDate, 1);
    }
  }

  // 3. Volviste (número de meses con al menos un día de getDiasDeRegreso)
  const diasRegreso = getDiasDeRegreso(habitos, registros, diasCongelados, todayStr);
  const mesesRegreso = new Set(diasRegreso.map(d => d.substring(0, 7))).size;

  // 4. Retos de un hábito
  let maxRetoHabito = 0;
  for (const h of habitos) {
    if (h.reto) {
      const prog = contarProgresoReto(h, registros);
      maxRetoHabito = Math.max(maxRetoHabito, prog); // normalizado a días
    }
  }
  const premiosRetoHabito = premios.filter(p => p.tipo === 'reto_habito');

  // 5. Retos semanales
  const retosSemanales = premios.filter(p => p.tipo === 'reto_semanal' || (p.clave && p.clave.startsWith('reto-semanal:'))).length;

  // 6. Momentos (mañanas y noches)
  let mananasCompletas = 0;
  let nochesCompletas = 0;
  if (habitos.length > 0) {
    let curDate = oldestDate;
    while (curDate <= todayStr) {
      if (!diasCongelados.includes(curDate)) {
        const hMorning = habitos.filter(h => h.momento === 'manana' && h.frecuencia !== 'semanal' && curDate >= formatDateToString(new Date(h.creadoEn)) && isHabitScheduledForDate(h, curDate));
        if (hMorning.length > 0 && hMorning.every(h => isHabitCompletedOnDate(h.id, curDate, registros))) mananasCompletas++;
        
        const hNight = habitos.filter(h => h.momento === 'noche' && h.frecuencia !== 'semanal' && curDate >= formatDateToString(new Date(h.creadoEn)) && isHabitScheduledForDate(h, curDate));
        if (hNight.length > 0 && hNight.every(h => isHabitCompletedOnDate(h.id, curDate, registros))) nochesCompletas++;
      }
      curDate = addDays(curDate, 1);
    }
  }

  // 7. Fuerza: el MÁXIMO de toda la serie fuerzaSerieHabito de cada hábito
  let maxFuerza = 0;
  for (const h of habitos) {
    const serie = fuerzaSerieHabito(h, registros, diasCongelados, todayStr);
    for (const v of serie) {
      const p = Math.round(v.valor * 100);
      if (p > maxFuerza) maxFuerza = p;
    }
  }

  // 8. Meses: solo meses calendario YA TERMINADOS (el mes en curso no cuenta), con tasaPeriodo >= 80%
  let meses80 = 0;
  const mesActual = todayStr.substring(0, 7);
  let iterDate = oldestDate;
  while (iterDate <= todayStr) {
    const mes = iterDate.substring(0, 7);
    if (mes !== mesActual) {
      const primerDia = `${mes}-01`;
      const ultimoDia = formatDateToString(new Date(parseInt(mes.substring(0,4)), parseInt(mes.substring(5,7)), 0));
      
      const tasa = tasaPeriodo(habitos, registros, diasCongelados, primerDia, ultimoDia);
      if (tasa.pct >= 80) meses80++;
    }
    // Avanzar al mes siguiente
    const d = new Date(parseInt(mes.substring(0,4)), parseInt(mes.substring(5,7)), 1);
    iterDate = formatDateToString(d);
  }

  const armarInsignia = (
    id: string, familia: string, meta: number, valorActual: number,
    nombre: string, descripcion: string, requisito: string, icono: string,
    premioLlama?: string, forceUnlock?: boolean
  ): InsigniaDef => {
    let unlock = forceUnlock || valorActual >= meta;
    const ganadaStr = insigniasGanadas[id];
    if (ganadaStr) {
      unlock = true;
    }
    return {
      id, familia, nombre, descripcion, requisito, icono, meta,
      progresoActual: unlock ? meta : Math.min(meta, valorActual),
      desbloqueada: unlock,
      fechaDesbloqueo: ganadaStr || undefined,
      premioLlama
    };
  };

  const hasRetoHabito = (meta: number) => premiosRetoHabito.some(p => p.meta && p.meta >= meta);

  const rawBadges: InsigniaDef[] = [
    // 1. Constancia (6)
    armarInsignia('c_10', 'Constancia', 10, constancia, 'Constancia 10', '10 veces cumpliste un hábito. Cada una contó, también las de los días difíciles.', '10 veces cumplidas', 'CircleCheck'),
    armarInsignia('c_50', 'Constancia', 50, constancia, 'Constancia 50', '50 veces cumpliste un hábito. Cada una contó, también las de los días difíciles.', '50 veces cumplidas', 'CircleCheck'),
    armarInsignia('c_100', 'Constancia', 100, constancia, 'Constancia 100', '100 veces cumpliste un hábito. Cada una contó, también las de los días difíciles.', '100 veces cumplidas', 'CircleCheck'),
    armarInsignia('c_250', 'Constancia', 250, constancia, 'Constancia 250', '250 veces cumpliste un hábito. Cada una contó, también las de los días difíciles.', '250 veces cumplidas', 'CircleCheck'),
    armarInsignia('c_500', 'Constancia', 500, constancia, 'Constancia 500', '500 veces cumpliste un hábito. Cada una contó, también las de los días difíciles.', '500 veces cumplidas', 'CircleCheck'),
    armarInsignia('c_1000', 'Constancia', 1000, constancia, 'Constancia 1000', '1000 veces cumpliste un hábito. Cada una contó, también las de los días difíciles.', '1000 veces cumplidas', 'CircleCheck', 'Dorada'),

    // 2. Días completos (4)
    armarInsignia('dc_7', 'Días completos', 7, diasCompletos, 'Días completos 7', '7 días en los que cumpliste todo lo que tocaba. No hace falta que sean seguidos.', '7 días completos', 'Calendar'),
    armarInsignia('dc_30', 'Días completos', 30, diasCompletos, 'Días completos 30', '30 días en los que cumpliste todo lo que tocaba. No hace falta que sean seguidos.', '30 días completos', 'Calendar'),
    armarInsignia('dc_66', 'Días completos', 66, diasCompletos, 'Días completos 66', '66 días en los que cumpliste todo lo que tocaba. No hace falta que sean seguidos.', '66 días completos', 'Calendar'),
    armarInsignia('dc_100', 'Días completos', 100, diasCompletos, 'Días completos 100', '100 días en los que cumpliste todo lo que tocaba. No hace falta que sean seguidos.', '100 días completos', 'Calendar'),

    // 3. Volviste (3)
    armarInsignia('v_1', 'Volviste', 1, mesesRegreso, 'Volviste 1', 'Volviste después de 3 o más días grises. Volver es lo que más cuenta.', '1 regreso', 'Undo2'),
    armarInsignia('v_3', 'Volviste', 3, mesesRegreso, 'Volviste 3', 'Volviste 3 veces después de 3 o más días grises. Volver es lo que más cuenta.', '3 regresos', 'Undo2'),
    armarInsignia('v_10', 'Volviste', 10, mesesRegreso, 'Volviste 10', 'Volviste 10 veces después de 3 o más días grises. Volver es lo que más cuenta.', '10 regresos', 'Undo2', 'Fénix'),

    // 4. Retos de un hábito (3)
    armarInsignia('rh_7', 'Retos de un hábito', 7, maxRetoHabito, 'Retos 7', 'Cumpliste un reto de 7 días con un hábito.', '7 días de reto cumplidos', 'Target', undefined, hasRetoHabito(7)),
    armarInsignia('rh_30', 'Retos de un hábito', 30, maxRetoHabito, 'Retos 30', 'Cumpliste un reto de 30 días con un hábito.', '30 días de reto cumplidos', 'Target', undefined, hasRetoHabito(30)),
    armarInsignia('rh_66', 'Retos de un hábito', 66, maxRetoHabito, 'Retos 66', 'Cumpliste un reto de 66 días con un hábito.', '66 días de reto cumplidos', 'Target', 'Raíz', hasRetoHabito(66)),

    // 5. Retos semanales (3)
    armarInsignia('rs_1', 'Retos semanales', 1, retosSemanales, 'Retos semanales 1', 'Cumpliste tu primer reto de la semana.', '1 reto semanal', 'Medal'),
    armarInsignia('rs_4', 'Retos semanales', 4, retosSemanales, 'Retos semanales 4', 'Cumpliste 4 retos de la semana.', '4 retos semanales', 'Medal'),
    armarInsignia('rs_12', 'Retos semanales', 12, retosSemanales, 'Retos semanales 12', 'Cumpliste 12 retos de la semana.', '12 retos semanales', 'Medal', 'Tormenta'),

    // 6. Momentos (2)
    armarInsignia('mo_30m', 'Momentos', 30, mananasCompletas, '30 mañanas', '30 mañanas en las que cumpliste todo lo de la mañana. Madrugar se volvió tuyo.', '30 mañanas', 'Sunrise', 'Alba'),
    armarInsignia('mo_30n', 'Momentos', 30, nochesCompletas, '30 noches', '30 noches en las que cumpliste todo lo de la noche.', '30 noches', 'Sunrise', 'Nocturna'),

    // 7. Fuerza (3)
    armarInsignia('fz_50', 'Fuerza', 50, maxFuerza, 'Fuerza 50', 'Un hábito llegó a 50 de fuerza: ya es parte de tu día.', '50 de fuerza en un hábito', 'TrendingUp'),
    armarInsignia('fz_80', 'Fuerza', 80, maxFuerza, 'Fuerza 80', 'Un hábito llegó a 80 de fuerza: ya es parte de tu día.', '80 de fuerza en un hábito', 'TrendingUp'),
    armarInsignia('fz_95', 'Fuerza', 95, maxFuerza, 'Fuerza 95', 'Un hábito llegó a 95 de fuerza: ya es parte de tu día.', '95 de fuerza en un hábito', 'TrendingUp'),

    // 8. Meses (3)
    armarInsignia('m_3', 'Meses', 3, meses80, 'Meses 3', '3 meses en 80% o más.', '3 meses en 80%', 'Flame', 'Aurora'),
    armarInsignia('m_6', 'Meses', 6, meses80, 'Meses 6', '6 meses en 80% o más.', '6 meses en 80%', 'Flame'),
    armarInsignia('m_12', 'Meses', 12, meses80, 'Meses 12', '12 meses en 80% o más.', '12 meses en 80%', 'Flame')
  ];

  return rawBadges;
};
