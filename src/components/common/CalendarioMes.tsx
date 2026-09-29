import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateToString, parseDateString } from '../../utils/habitUtils';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_LETRA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_COMPLETOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const CalendarioMes: React.FC<{
  valor?: string;
  min: string;
  onElegir: (fecha: string) => void;
}> = ({ valor, min, onElegir }) => {
  const minDate = parseDateString(min);
  
  const [ver, setVer] = useState(() => {
    const start = (valor && valor >= min) ? parseDateString(valor) : minDate;
    return { year: start.getFullYear(), month: start.getMonth() };
  });

  const mesActualMin = ver.year === minDate.getFullYear() && ver.month === minDate.getMonth();

  const prevMonth = () => {
    if (mesActualMin) return;
    setVer(prev => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      return { year: y, month: m };
    });
  };

  const nextMonth = () => {
    setVer(prev => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const primerDia = new Date(ver.year, ver.month, 1);
  const ultimoDia = new Date(ver.year, ver.month + 1, 0);
  const startOffset = (primerDia.getDay() + 6) % 7;
  
  const dias = [];
  for (let i = 0; i < startOffset; i++) {
    dias.push(null);
  }
  for (let i = 1; i <= ultimoDia.getDate(); i++) {
    dias.push(i);
  }

  return (
    <div className="calmes w-full border-y border-line py-[8px]">
      <div className="flex items-center justify-between mb-[12px] px-[8px]">
        <button 
          type="button" 
          aria-label="Mes anterior"
          onClick={prevMonth}
          disabled={mesActualMin}
          className="w-[44px] h-[44px] flex items-center justify-center border-none bg-transparent text-text disabled:text-text-muted"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-heading font-bold text-[20px] text-text" aria-live="polite">
          {MESES[ver.month]} {ver.year}
        </span>
        <button 
          type="button" 
          aria-label="Mes siguiente"
          onClick={nextMonth}
          className="w-[44px] h-[44px] flex items-center justify-center border-none bg-transparent text-text"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-[4px] px-[12px]">
        {DIAS_LETRA.map((letra, i) => (
          <div key={`l-${i}`} className="h-[24px] flex items-center justify-center text-[12px] font-bold text-text-muted">
            {letra}
          </div>
        ))}
        {dias.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />;
          
          const dObj = new Date(ver.year, ver.month, d);
          const fStr = formatDateToString(dObj);
          
          const esMin = fStr === min;
          const esValor = fStr === valor;
          const esPasado = fStr < min;
          
          if (esPasado) {
            return (
              <div key={i} className="h-[44px] flex items-center justify-center text-[15px] font-medium text-text-muted" aria-disabled="true">
                {d}
              </div>
            );
          }

          let btnClass = "h-[44px] flex items-center justify-center text-[15px] font-semibold text-text rounded-[10px] border-none bg-transparent";
          let style: React.CSSProperties = {};
          
          if (esValor) {
            btnClass = "h-[44px] flex items-center justify-center text-[15px] font-bold text-text rounded-[10px] bg-surface-raised";
            style = { border: '2px solid var(--text)' };
          } else if (esMin) {
            style = { border: '1.5px dashed var(--text)' };
          }

          return (
            <button 
              key={i}
              type="button"
              className={btnClass}
              style={style}
              onClick={() => onElegir(fStr)}
              aria-label={`${DIAS_COMPLETOS[dObj.getDay()]} ${d} de ${MESES[dObj.getMonth()].toLowerCase()}`}
              aria-pressed={esValor}
            >
              {d}
            </button>
          );
        })}
      </div>
      
      {mesActualMin && (
        <p className="m-0 mt-[12px] px-[12px] text-[12px] font-medium text-text-muted text-center">
          Al tocar un día, el calendario se cierra solo.
        </p>
      )}
    </div>
  );
};
