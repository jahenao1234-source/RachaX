import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { LlamaDe, SiluetaLlama, MasLlamas, nombreLlama, ETAPAS, MESES_LL, HAZ_INFO, etapaDeNivel } from './Llama';
import { useHabitStore } from '../../store/HabitContext';
import { tasaPeriodo } from '../../utils/progresoUtils';
import { getTodayString, formatDateToString } from '../../utils/habitUtils';

interface LlamaDetailModalProps {
  id: string; // 'etapa_1', 'hazana_raiz', 'mes_07', 'rara_cristal' o 'raras' (la casilla "+N" de las raras)
  onClose: () => void;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// "2026-09-14" -> "14 de septiembre"
const fechaLarga = (f: string) => `${parseInt(f.slice(8, 10))} de ${MESES[parseInt(f.slice(5, 7)) - 1]}`;

export const LlamaDetailModal: React.FC<LlamaDetailModalProps> = ({ id, onClose }) => {
  const { llamasGanadas, companera, setCompanera, nivelActual, habitosActivos, registros, diasCongelados, insignias, cajasSinRara } = useHabitStore();
  const tituloId = useId();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const etapaActual = etapaDeNivel(nivelActual);
  const esGanada = !!llamasGanadas[id];
  const esCompanera = companera ? companera === id : id === `etapa_${etapaActual}`;

  let titulo = nombreLlama(id);
  let linea = '';
  let texto = '';
  let arte: React.ReactNode = esGanada ? <LlamaDe id={id} size={120} /> : <SiluetaLlama size={120} />;
  let progreso: { label: string; a: number; b: number; valor?: string } | null = null;

  if (id.startsWith('etapa_')) {
    const lvl = ETAPAS[parseInt(id.split('_')[1]) - 1][1];
    if (esGanada) {
      linea = `Etapa · desde el nivel ${lvl}`;
      texto = `Tu llama la alcanzó al llegar al nivel ${lvl}.`;
    } else {
      titulo = 'La siguiente etapa';
      linea = `Llega en el nivel ${lvl}`;
      texto = 'Tu llama cambia cuando subes de nivel. Nunca se apaga.';
    }
  } else if (id.startsWith('hazana_')) {
    const info = HAZ_INFO[id.split('_')[1]];
    if (esGanada) {
      linea = `Hazaña · la ganaste el ${fechaLarga(llamasGanadas[id])}`;
      texto = `Premio de la insignia "${info.insigniaNombre}". ${info.frase}`;
    } else {
      linea = `Hazaña · premio de la insignia "${info.insigniaNombre}"`;
      texto = id === 'hazana_fenix'
        ? 'Se gana retomando después de 3 o más días grises. Cuenta un regreso al mes como máximo: premia volver, no alejarse.'
        : `Se gana con la insignia "${info.insigniaNombre}": ${info.requisito}.`;
      const b = insignias.find(x => x.id === info.insignia);
      if (b) progreso = { label: info.unidad.charAt(0).toUpperCase() + info.unidad.slice(1), a: b.progresoActual, b: b.meta };
    }
  } else if (id.startsWith('mes_')) {
    const num = parseInt(id.split('_')[1]);
    const mes = MESES[num - 1];
    if (esGanada) {
      // La llama llega el día 1 del mes siguiente: si se entregó en un mes anterior al suyo, es del año pasado.
      const entregada = llamasGanadas[id];
      const anio = parseInt(entregada.slice(0, 4)) - (num >= parseInt(entregada.slice(5, 7)) ? 1 : 0);
      const desde = `${anio}-${String(num).padStart(2, '0')}-01`;
      const hasta = formatDateToString(new Date(anio, num, 0));
      const pct = Math.round(tasaPeriodo(habitosActivos, registros, diasCongelados, desde, hasta).pct);
      linea = `Llama de ${mes} · la ganaste con ${pct}% en ${mes} de ${anio}`;
      texto = `Cumpliste 80% o más en ${mes}.`;
    } else {
      linea = `Llama de ${mes}`;
      texto = `Se gana cerrando ${mes} con 80% o más. Si este año no sale, vuelve a estar en juego el próximo ${mes}.`;
      const hoy = getTodayString();
      if (parseInt(hoy.slice(5, 7)) === num) {
        const primero = hoy.slice(0, 8) + '01';
        const ayer = formatDateToString(new Date(parseInt(hoy.slice(0, 4)), num - 1, parseInt(hoy.slice(8, 10)) - 1));
        const pct = Math.round(tasaPeriodo(habitosActivos, registros, diasCongelados, primero, ayer < primero ? primero : ayer).pct);
        progreso = { label: 'Este mes', a: Math.min(pct, 80), b: 80, valor: `${pct}% de 80%` };
      }
    }
  } else if (id.startsWith('rara_')) {
    linea = 'Llama rara';
    texto = 'Salió de una caja sorpresa. Es tuya para siempre.';
    const numRaras = Object.keys(llamasGanadas).filter(k => k.startsWith('rara_')).length;
    if (numRaras < 10) {
      progreso = { label: 'Llamas raras', a: numRaras, b: 10, valor: `${numRaras} de 10` };
    }
  } else if (id === 'raras') {
    const tengo = Object.keys(llamasGanadas).filter(k => k.startsWith('rara_')).length;
    titulo = 'Llamas raras';
    linea = `${tengo} de 10 · nunca se repiten`;
    texto = 'Salen de la caja sorpresa: 1 de cada 20 cajas, y una segura cada 15 cajas. Ganas cajas con retos e insignias; nunca se compran.';
    arte = <MasLlamas n={10 - tengo} size={120} rara />;
    if (tengo < 10) progreso = { label: 'Para tu próxima rara segura', a: cajasSinRara, b: 15 };
  }

  const handleElegir = () => {
    // Elegir la etapa en la que estás vuelve a la compañera automática (crece con tu nivel)
    setCompanera(id === `etapa_${etapaActual}` ? null : id);
    onClose();
  };

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby={tituloId}>
        <div className="grab" />
        <div className="flex justify-end px-3 pt-2">
          <button onClick={onClose} className="x" aria-label="Cerrar">
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="px-5 pb-6 text-center">
          <div className="flex justify-center">{arte}</div>
          {id.startsWith('rara_') && (
            <p className="rarelbl text-lila-text font-bold text-[13px] uppercase tracking-wider mb-2 mt-4">Llama rara</p>
          )}
          <h2 className={`cond m-0 ${id.startsWith('rara_') ? '' : 'mt-3'} text-[28px] leading-[1.05] text-text`} id={tituloId}>{titulo}</h2>
          {(!id.startsWith('rara_') || id === 'raras') && <p className="sub m-0 mt-1.5">{linea}</p>}
          <p className="m-0 mt-3 text-[15px] leading-[1.45] text-text">{texto}</p>

          {progreso && (
            <div className="mt-4 text-left">
              <div className="flex justify-between items-baseline">
                <span className="sub">{progreso.label}</span>
                <span className="sub font-number">{progreso.valor ?? `${progreso.a} de ${progreso.b}`}</span>
              </div>
              <i className="track" aria-hidden="true"><b style={{ width: `${Math.min(100, (progreso.a / progreso.b) * 100)}%` }} /></i>
            </div>
          )}

          {esGanada && !esCompanera && (
            <>
              <button onClick={handleElegir} className="btnp full">Elegir como compañera</button>
              <p className="sub m-0 mt-2">Tu compañera se ve en Hoy y en tu Perfil. Tu nivel no cambia.</p>
            </>
          )}
          {esGanada && esCompanera && (
            <p className="m-0 mt-4 text-[15px] font-bold text-text">Es tu compañera.</p>
          )}
        </div>
      </section>
    </>,
    document.body
  );
};
