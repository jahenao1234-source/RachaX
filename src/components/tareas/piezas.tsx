import React from 'react';
import { Calendar, CalendarPlus, Check, ChevronDown, RotateCcw, Trash2 } from 'lucide-react';
import { HabitIcon } from '../common/HabitIcon';
import { Subtarea, Tarea } from '../../types';
import { avanceTarea, fechaTerminada, textoDiaCorto, textoDiaLargo, textoFechaLarga } from '../../utils/tareasUtils';

/** Piezas que comparten Tareas en el celular y en el escritorio. DESIGN.md › Tareas. */

export const Barra: React.FC<{ tarea: Tarea; className?: string; style?: React.CSSProperties; corta?: boolean }> = ({ tarea, className, style, corta }) => {
  const { hechos, total } = avanceTarea(tarea);
  return (
    <div className={`tavance${className ? ` ${className}` : ''}`} style={style}>
      <i aria-hidden="true"><b style={{ width: `${total ? Math.round((hechos / total) * 100) : 0}%` }} /></i>
      {corta
        ? <span className="num">{hechos} de {total}</span>
        : <span><span className="num">{hechos} de {total}</span> pasos</span>}
    </div>
  );
};

export const Casilla: React.FC<{ paso: Subtarea; onToggle: () => void }> = ({ paso, onToggle }) => (
  <span className={`tchk${paso.hecha ? ' on' : ''}`} role="checkbox" tabIndex={0} aria-checked={paso.hecha} aria-label={paso.texto}
    onClick={onToggle}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}>
    {paso.hecha && <Check size={15} strokeWidth={3} />}
  </span>
);

export const ChipDia: React.FC<{ paso: Subtarea; hoy: string; onAbrir: () => void }> = ({ paso, hoy, onAbrir }) => {
  if (paso.hecha) return null;
  if (!paso.fecha) {
    return <button type="button" className="tdia vacio" aria-label={`Ponerle día a ${paso.texto}`} onClick={onAbrir}><CalendarPlus size={17} /></button>;
  }
  const corto = textoDiaCorto(paso.fecha, hoy);
  return (
    <button type="button" className={`tdia${corto === 'hoy' ? ' hoy' : ''}`} aria-label={`Día de ${paso.texto}: ${textoDiaLargo(paso.fecha, hoy)}. Cambiar`} onClick={onAbrir}>
      <Calendar size={13} />{corto}
    </button>
  );
};

/** Grupo plegado "Terminadas": cada tarea con Reabrir y Borrar. */
export const Terminadas: React.FC<{
  terminadas: Tarea[];
  abierto: boolean;
  onAlternar: () => void;
  onReabrir: (t: Tarea) => void;
  onBorrar: (t: Tarea) => void;
}> = ({ terminadas, abierto, onAlternar, onReabrir, onBorrar }) => {
  if (terminadas.length === 0) return null;
  return (
    <section className="tterm" aria-labelledby="tareas-terminadas">
      <h2 className="tterm-h" id="tareas-terminadas">
        <button type="button" aria-expanded={abierto} onClick={onAlternar}>
          <span>Terminadas <span className="tcnt num">{terminadas.length}</span></span>
          <ChevronDown size={18} className={abierto ? 'rotate-180' : ''} />
        </button>
      </h2>
      {abierto && (
        <ul className="ttlist">
          {terminadas.map((t) => {
            const { total } = avanceTarea(t);
            const f = fechaTerminada(t);
            return (
              <li key={t.id} className="ttrow">
                <span className="tico" aria-hidden="true"><HabitIcon name={t.icono} size={18} /></span>
                <span className="tmain">
                  <span className="tname2" title={t.nombre}>{t.nombre}</span>
                  <span className="tsub"><span className="tok"><Check size={13} strokeWidth={3} /><span className="num">{total} de {total}</span></span>{f ? ` · el ${textoFechaLarga(f)}` : ''}</span>
                </span>
                <button type="button" className="tbtnq sm" aria-label={`Reabrir ${t.nombre}`} onClick={() => onReabrir(t)}><RotateCcw size={15} />Reabrir</button>
                <button type="button" className="tdel" aria-label={`Borrar ${t.nombre}`} onClick={() => onBorrar(t)}><Trash2 size={17} /></button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
