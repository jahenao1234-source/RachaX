import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2 } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { LlamaDe, nombreLlama } from './Llama';
import { useHabitStore } from '../../store/HabitContext';
import { formatDateToString, isHabitScheduledForDate, isHabitCompletedOnDate } from '../../utils/habitUtils';
import { tasaPeriodo } from '../../utils/progresoUtils';

interface TuMesSheetProps {
  anio: number;
  mes: number; // 1 a 12
  onClose: () => void;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const TuMesSheet: React.FC<TuMesSheetProps> = ({ anio, mes, onClose }) => {
  const { habitosActivos, registros, diasCongelados, insigniasGanadas, companera, etapaLlama } = useHabitStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const nombreMes = MESES[mes - 1];
  const mm = String(mes).padStart(2, '0');
  const desde = `${anio}-${mm}-01`;
  const ultimo = new Date(anio, mes, 0);
  const hasta = formatDateToString(ultimo);

  // Las mismas cuentas del resto de la app
  const pct = Math.round(tasaPeriodo(habitosActivos, registros, diasCongelados, desde, hasta).pct);
  const vecesCumplidas = registros.filter(r => r.completado && r.fecha >= desde && r.fecha <= hasta).length;

  // Días completos: misma regla que la insignia (hábitos diarios programados, todos cumplidos; los congelados no suman)
  let diasCompletos = 0;
  for (let d = 1; d <= ultimo.getDate(); d++) {
    const fecha = `${anio}-${mm}-${String(d).padStart(2, '0')}`;
    if (diasCongelados.includes(fecha)) continue;
    const tocaban = habitosActivos.filter(h => h.frecuencia !== 'semanal' && fecha >= formatDateToString(new Date(h.creadoEn)) && isHabitScheduledForDate(h, fecha));
    if (tocaban.length > 0 && tocaban.every(h => isHabitCompletedOnDate(h.id, fecha, registros))) diasCompletos++;
  }

  const insigniasNuevas = Object.values(insigniasGanadas).filter(f => f >= desde && f <= hasta).length;
  const companeraId = companera || `etapa_${etapaLlama}`;
  const miLlama = nombreLlama(companeraId);
  const claro = !document.documentElement.classList.contains('dark');
  const archivo = `racha-${nombreMes.toLowerCase()}-${anio}.png`;

  const hacerImagen = async () => {
    if (!cardRef.current) return null;
    // Sin el margen de arriba, que en la imagen corría la tarjeta y cortaba el borde de abajo
    return toBlob(cardRef.current, { pixelRatio: 3, cacheBust: true, style: { margin: '0' } });
  };

  const descargar = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = archivo;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const compartir = async () => {
    setOcupado(true);
    try {
      const blob = await hacerImagen();
      if (!blob) return;
      const file = new File([blob], archivo, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        descargar(blob);
      }
    } catch (err) {
      // Cancelar el menú de compartir no es un error
      if ((err as Error)?.name !== 'AbortError') console.error(err);
    } finally {
      setOcupado(false);
    }
  };

  const guardar = async () => {
    setOcupado(true);
    try {
      const blob = await hacerImagen();
      if (blob) descargar(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setOcupado(false);
    }
  };

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="tm_t" aria-describedby="tm_d" style={{ maxHeight: '92%' }}>
        <div className="grab" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
          <button className="x" aria-label="Cerrar" onClick={onClose}><X size={20} strokeWidth={2.4} /></button>
        </div>
        <div className="celebody">
          <h2 className="cond" id="tm_t" tabIndex={-1} style={{ margin: 0, fontSize: '24px', textAlign: 'left' }}>Tu mes en Racha</h2>
          <p className="sub" id="tm_d" style={{ textAlign: 'left', marginTop: '2px' }}>No muestra los nombres de tus hábitos.</p>

          <div
            ref={cardRef}
            className={`story${claro ? ' st-light' : ''}`}
            role="img"
            aria-label={`${nombreMes} en Racha: ${pct}% de lo que me propuse, ${vecesCumplidas} veces cumplidas, ${diasCompletos} días completos, ${insigniasNuevas} insignias nuevas y mi llama ${miLlama}`}
          >
            <div className="st-top">
              <span className="logo" style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#FFB547' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3 0 1.66 1.34 3 2.5 2.5z"/></svg>
              </span>
              <span className="cond" style={{ fontSize: '16px' }}>Racha</span>
              <span className="st-date">{nombreMes} {anio}</span>
            </div>
            <div className="st-flame"><LlamaDe id={companeraId} size={96} /></div>
            <p className="cond st-big">{pct}%</p>
            <p className="st-cap">de lo que me propuse este mes</p>
            <div className="st-grid">
              <div><span className="cond">{vecesCumplidas}</span><span>veces cumplidas</span></div>
              <div><span className="cond">{diasCompletos}</span><span>días completos</span></div>
              <div><span className="cond">{insigniasNuevas}</span><span>insignias nuevas</span></div>
              <div><span className="cond">{miLlama}</span><span>mi llama</span></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px' }}>
            <button className="btnp" style={{ margin: 0 }} onClick={compartir} disabled={ocupado}>
              <Share2 size={18} strokeWidth={2.2} />Compartir
            </button>
            <button className="btn2" style={{ minHeight: '48px' }} onClick={guardar} disabled={ocupado}>
              <Download size={18} strokeWidth={2.2} />Guardar imagen
            </button>
          </div>
        </div>
      </section>
    </>,
    document.body
  );
};
