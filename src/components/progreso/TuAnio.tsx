import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { tuAnio, textoTuAnio, CeldaAnio } from '../../utils/consejosUtils';
import { getTodayString, parseDateString } from '../../utils/habitUtils';

/** Tu año (solo escritorio). design/maqueta-progreso-informe.html, escritorios 6 y 7 · DESIGN.md › Progreso 2 › Tu año. */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function textoCelda(c: CeldaAnio, unHabito: boolean): string {
  const d = parseDateString(c.fecha);
  const dia = `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const estado =
    c.estado === 'hoy' ? 'hoy'
    : c.estado === 'antes' ? 'aún no empezabas'
    : c.estado === 'libre' ? 'día libre'
    : c.estado === 'como' ? 'comodín'
    : c.estado === 'todo' ? (unHabito ? 'cumplido' : 'todo cumplido')
    : c.estado === 'nada' ? (unHabito ? 'sin cumplir' : `0 de ${c.tocan}`)
    : `${c.hechos} de ${c.tocan}`;
  return `${dia}: ${estado}`;
}

export const TuAnio: React.FC<{ onRevisarDia: (fecha: string) => void }> = ({ onRevisarDia }) => {
  const { habitosActivos, registros, diasCongelados } = useHabitStore();
  const [habitoId, setHabitoId] = useState('');
  const hoy = getTodayString();
  const anio = useMemo(
    () => tuAnio(habitosActivos, registros, diasCongelados, hoy, habitoId || undefined),
    [habitosActivos, registros, diasCongelados, hoy, habitoId]
  );
  const nombre = habitoId ? habitosActivos.find((h) => h.id === habitoId)?.nombre : undefined;
  const frase = textoTuAnio(anio, nombre);
  const unHabito = !!habitoId;

  return (
    <section className="anio rounded-[18px] bg-surface border border-line p-5" aria-labelledby="tu-anio-t">
      <div className="anioh">
        <div>
          <h2 id="tu-anio-t" className="font-heading font-bold text-[22px] m-0 text-text">Tu año</h2>
          <p className="text-[13px] text-text-muted mt-0.5">últimos 12 meses</p>
        </div>
        <label className="yasel">
          <span className="sr-only">Ver</span>
          <select value={habitoId} onChange={(e) => setHabitoId(e.target.value)}>
            <option value="">Todos tus hábitos</option>
            {habitosActivos.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
          </select>
          <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" />
        </label>
      </div>

      <div className="yawrap" role="img" aria-label={frase}>
        <div className="yameses" aria-hidden="true">
          <span />
          {anio.meses.map((m) => <span key={m.columna} className={m.columna >= 50 ? 'fin' : undefined} style={{ gridColumn: m.columna + 2 }}>{m.texto}</span>)}
        </div>
        <div className="yabody" aria-hidden="true">
          <span className="yadias"><i>L</i><i /><i>X</i><i /><i>V</i><i /><i /></span>
          {anio.semanas.map((semana, w) => (
            <span key={w} className="yacol">
              {semana.map((c) => {
                const pasado = c.estado !== 'fut' && c.estado !== 'antes' && c.estado !== 'hoy';
                return (
                  <i
                    key={c.fecha}
                    className={`ya ${c.estado}${pasado ? ' pasado' : ''}`}
                    title={c.estado === 'fut' ? undefined : textoCelda(c, unHabito)}
                    onClick={pasado ? () => onRevisarDia(c.fecha) : undefined}
                  />
                );
              })}
            </span>
          ))}
        </div>
      </div>

      <div className="yapie">
        <p className="text-[13px] text-text-muted m-0">{frase}</p>
        <div className="yaleg" aria-hidden="true">
          {unHabito ? (
            <><span><i className="ya nada" />Sin cumplir</span><span><i className="ya todo" />Cumplido</span></>
          ) : (
            <><span><i className="ya nada" />Nada</span><span><i className="ya parte" />Una parte</span><span><i className="ya todo" />Todo</span></>
          )}
          <span><i className="ya como" />Comodín</span>
        </div>
      </div>
    </section>
  );
};
