import React, { useEffect, useRef, useState } from 'react';

export const SelectorHora: React.FC<{
  valor: string;
  onCambiar: (hhmm: string) => void;
  onQuitar: () => void;
  onListo: () => void;
  /** Sin el pie de "Quitar la hora" y "Listo" (la hoja de Avisos trae su propio Guardar) */
  sinPie?: boolean;
}> = ({ valor, onCambiar, onQuitar, onListo, sinPie }) => {
  const [hStr, mStr] = valor.split(':');
  let h24 = parseInt(hStr, 10);
  if (isNaN(h24)) h24 = 12;
  const m = mStr || '00';
  
  const ampm = h24 >= 12 ? 'pm' : 'am';
  const h12 = h24 % 12 || 12;

  const horasRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);
  
  const scrollTimer = useRef<number | null>(null);
  // Siempre el valor más reciente, para no pisar un cambio hecho hace menos de 120 ms en la otra columna.
  const valorRef = useRef(valor);
  valorRef.current = valor;

  const horas = Array.from({ length: 12 }, (_, i) => i + 1);
  // El minuto que traía (por ejemplo 10 o 13) se queda en la lista mientras el selector esté abierto: nunca se redondea.
  const [minutoOriginal] = useState(m);
  const minutos = Array.from(new Set(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', minutoOriginal])).sort();

  /** Lee las dos columnas y a. m./p. m. a la vez, y avisa solo si cambió algo. */
  const leer = () => {
    const hi = Math.min(Math.max(Math.round((horasRef.current?.scrollTop ?? 0) / 44), 0), horas.length - 1);
    const mi = Math.min(Math.max(Math.round((minRef.current?.scrollTop ?? 0) / 44), 0), minutos.length - 1);
    const pm = parseInt(valorRef.current.split(':')[0], 10) >= 12;
    const h = horas[hi];
    const h24n = h === 12 ? (pm ? 12 : 0) : h + (pm ? 12 : 0);
    const nuevo = `${String(h24n).padStart(2, '0')}:${minutos[mi]}`;
    if (nuevo !== valorRef.current) onCambiar(nuevo);
  };

  const handleScroll = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(leer, 120);
  };
  useEffect(() => () => { if (scrollTimer.current) clearTimeout(scrollTimer.current); }, []);

  useEffect(() => {
    const hIdx = horas.indexOf(h12);
    if (horasRef.current && hIdx >= 0) horasRef.current.scrollTop = hIdx * 44;
    
    const mIdx = minutos.indexOf(m);
    if (minRef.current && mIdx >= 0) minRef.current.scrollTop = mIdx * 44;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAmpm = (nuevoAmpm: 'am' | 'pm') => {
    const [hh, mm] = valorRef.current.split(':');
    const h = parseInt(hh, 10);
    const esPm = h >= 12;
    if ((nuevoAmpm === 'pm') === esPm) return;
    onCambiar(`${String(esPm ? h - 12 : h + 12).padStart(2, '0')}:${mm}`);
  };

  const scrollToRow = (ref: React.RefObject<HTMLDivElement>, idx: number) => {
    if (ref.current) {
      ref.current.scrollTo({ top: idx * 44, behavior: 'smooth' });
    }
  };

  return (
    <div className="selhora w-full bg-surface border border-line rounded-[14px] overflow-hidden flex flex-col">
      <div className="grid grid-cols-[1fr_1fr_104px] gap-[8px] p-[16px] pb-[8px]">
        <div className="flex flex-col">
          <span id="selh-h" className="text-[12px] font-bold text-text-muted mb-[8px] text-center">Hora</span>
          <div className="relative h-[220px] rounded-[12px] overflow-hidden">
            <div className="absolute inset-y-0 my-auto h-[44px] left-0 right-0 z-0 rounded-[12px] bg-surface-raised border-[1.5px] border-text pointer-events-none" />
            <div 
              ref={horasRef}
              role="group" aria-labelledby="selh-h"
              className="relative z-[1] h-full overflow-y-auto"
              style={{ scrollSnapType: 'y mandatory', paddingTop: 88, paddingBottom: 88, scrollbarWidth: 'none' }}
              onScroll={handleScroll}
            >
              {horas.map((h, i) => {
                const on = h === h12;
                return (
                  <button 
                    key={h} 
                    type="button"
                    className={`w-full h-[44px] flex items-center justify-center border-none bg-transparent font-heading transition-all ${on ? 'text-[26px] font-bold text-text' : 'text-[20px] font-bold text-text-muted'}`}
                    style={{ scrollSnapAlign: 'center' }}
                    onClick={() => scrollToRow(horasRef, i)}
                    aria-label={`${h} en punto`} aria-pressed={on}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <span id="selh-m" className="text-[12px] font-bold text-text-muted mb-[8px] text-center">Minutos</span>
          <div className="relative h-[220px] rounded-[12px] overflow-hidden">
            <div className="absolute inset-y-0 my-auto h-[44px] left-0 right-0 z-0 rounded-[12px] bg-surface-raised border-[1.5px] border-text pointer-events-none" />
            <div 
              ref={minRef}
              role="group" aria-labelledby="selh-m"
              className="relative z-[1] h-full overflow-y-auto"
              style={{ scrollSnapType: 'y mandatory', paddingTop: 88, paddingBottom: 88, scrollbarWidth: 'none' }}
              onScroll={handleScroll}
            >
              {minutos.map((min, i) => {
                const on = min === m;
                return (
                  <button 
                    key={min} 
                    type="button"
                    className={`w-full h-[44px] flex items-center justify-center border-none bg-transparent font-heading transition-all ${on ? 'text-[26px] font-bold text-text' : 'text-[20px] font-bold text-text-muted'}`}
                    style={{ scrollSnapAlign: 'center' }}
                    onClick={() => scrollToRow(minRef, i)}
                    aria-label={`${min} minutos`} aria-pressed={on}
                  >
                    {min}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-[8px] pt-[28px]">
          <button 
            type="button" 
            role="radio" 
            aria-checked={ampm === 'am'}
            onClick={() => setAmpm('am')}
            className={`h-[52px] w-full rounded-[12px] font-bold text-[15px] border transition-colors ${ampm === 'am' ? 'border-[2px] border-text bg-surface-raised text-text' : 'border-line bg-transparent text-text-muted'}`}
          >
            a. m.
          </button>
          <button 
            type="button" 
            role="radio" 
            aria-checked={ampm === 'pm'}
            onClick={() => setAmpm('pm')}
            className={`h-[52px] w-full rounded-[12px] font-bold text-[15px] border transition-colors ${ampm === 'pm' ? 'border-[2px] border-text bg-surface-raised text-text' : 'border-line bg-transparent text-text-muted'}`}
          >
            p. m.
          </button>
        </div>
      </div>

      {!sinPie && <div className="flex items-center gap-[12px] p-[16px] pt-[8px] border-t border-line mt-[8px]">
        <button 
          type="button" 
          onClick={onQuitar}
          className="flex-1 h-[44px] rounded-[12px] bg-transparent border-none font-bold text-[15px] text-text-muted text-left px-[8px]"
        >
          Quitar la hora
        </button>
        <button 
          type="button" 
          onClick={onListo}
          className="min-w-[100px] h-[44px] rounded-[12px] bg-surface-raised border border-line-strong font-bold text-[15px] text-text"
        >
          Listo
        </button>
      </div>}
    </div>
  );
};
