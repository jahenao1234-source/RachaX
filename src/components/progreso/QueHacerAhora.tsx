import React, { useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, CalendarCheck, Sprout, Layers, Clock, BarChart3, Moon, Target, ListChecks, Calendar as CalendarIcon, TrendingUp, ChevronDown, Check } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { useEsEscritorio } from '../screens/TodayScreen';
import { calcularConsejos, elegirConsejos, Consejo } from '../../utils/consejosUtils';
import { getTodayString } from '../../utils/habitUtils';
import { HojaDiaPaso } from '../tareas/HojaDiaPaso';
import { obtenerHojasSubtareas } from '../../utils/habitUtils';

const ICONS: Record<string, React.FC<any>> = {
  regreso: RotateCcw,
  olvido: CalendarCheck,
  cae: Sprout,
  muchos: Layers,
  choque: Clock,
  dia: BarChart3,
  momento: Moon,
  meta: Target,
  tarea: ListChecks,
  semana: CalendarIcon,
  firme: TrendingUp,
};

export const QueHacerAhora: React.FC<{ onRevisarDia: (fecha: string) => void }> = ({ onRevisarDia }) => {
  const {
    habitosActivos, registros, diasCongelados, tareas, compromisos,
    consejosOcultos, ocultarConsejo, mostrarConsejo, editarHabito,
    navigateToTab, openEditHabit, openManageHabits, ponerFechaPaso
  } = useHabitStore();
  const desk = useEsEscritorio();
  const [expandido, setExpandido] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; deshacer: () => void } | null>(null);
  const [pasoAbierto, setPasoAbierto] = useState<{ tareaId: string; pasoId: string } | null>(null);
  const avisoTimer = useRef<number | null>(null);

  const hoy = getTodayString();
  const todos = useMemo(() => calcularConsejos({ habitos: habitosActivos, registros, diasCongelados, tareas, compromisos, hoy }), [habitosActivos, registros, diasCongelados, tareas, compromisos, hoy]);
  const lista = elegirConsejos(todos, consejosOcultos, hoy);
  
  const aMostrar = desk ? lista : (expandido ? lista : lista.slice(0, 1));

  const mostrarAviso = (texto: string, deshacer: () => void) => {
    if (avisoTimer.current) window.clearTimeout(avisoTimer.current);
    setAviso({ texto, deshacer });
    avisoTimer.current = window.setTimeout(() => setAviso(null), 6000);
  };

  if (habitosActivos.length === 0) return null;

  if (lista.length === 0) {
    return (
      <section className="qha" aria-labelledby="qh-nada">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-heading font-bold text-[22px] m-0 text-text" id="qh-nada">Qué hacer ahora</h2>
        </div>
        <div className="cjok">
          <span className="cjic"><Check size={18} strokeWidth={2.4} /></span>
          <div><b>Nada que ajustar por ahora</b><p>Vas parejo. Cuando algo necesite un cambio, te lo digo aquí.</p></div>
        </div>
      </section>
    );
  }

  const handleAccion = (c: Consejo) => {
    const acc = c.accion as any;
    switch (c.accion.tipo) {
      case 'irAHoy': navigateToTab('hoy'); break;
      case 'revisarDia': onRevisarDia(acc.fecha); break;
      case 'editarHabito': 
        const hEd = habitosActivos.find(x => x.id === acc.habitoId);
        if (hEd) openEditHabit(hEd); 
        break;
      case 'gestionarHabitos': openManageHabits(); break;
      case 'abrirSemana': navigateToTab('semana'); break;
      case 'verSeccion':
        const el = document.getElementById('progreso-momentos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'bajarMeta':
        const hB = habitosActivos.find(x => x.id === acc.habitoId);
        if (hB) {
          const metaAnt = hB.metaDiaria;
          editarHabito(hB.id, { metaDiaria: acc.meta });
          mostrarAviso(`Bajaste la meta de ${hB.nombre} a ${acc.meta}.`, () => editarHabito(hB.id, { metaDiaria: metaAnt }));
        }
        break;
      case 'ponerReto':
        const hR = habitosActivos.find(x => x.id === acc.habitoId);
        if (hR) {
          const retoAnt = hR.reto;
          editarHabito(hR.id, { reto: { meta: acc.meta, inicio: getTodayString() } });
          mostrarAviso(`Empezaste el reto de ${acc.meta} días de ${hR.nombre}.`, () => editarHabito(hR.id, { reto: retoAnt }));
        }
        break;
      case 'ponerDiaPaso':
        setPasoAbierto({ tareaId: acc.tareaId, pasoId: acc.pasoId });
        break;
    }
  };

  const handleAhoraNo = (c: Consejo, e: React.MouseEvent) => {
    ocultarConsejo(c.clave);
    mostrarAviso("Listo. No te lo muestro esta semana.", () => mostrarConsejo(c.clave));
    
    const ul = e.currentTarget.closest('ul');
    if (!ul) return;
    setTimeout(() => {
        const lis = ul.querySelectorAll('li');
        const remaining = Array.from(lis).filter(li => !li.hasAttribute('data-hidden'));
        if (remaining.length > 0) {
           const firstBtn = remaining[0].querySelector('button');
           if (firstBtn) (firstBtn as HTMLElement).focus();
        } else {
           const h2 = document.getElementById('qh-titulo');
           if (h2) (h2 as HTMLElement).focus();
        }
    }, 50);
  };

  let tareaDePaso, pasoDePaso;
  if (pasoAbierto) {
    tareaDePaso = tareas.find(t => t.id === pasoAbierto.tareaId);
    if (tareaDePaso) {
       pasoDePaso = obtenerHojasSubtareas(tareaDePaso.subtareas).find(h => h.id === pasoAbierto.pasoId);
    }
  }

  return (
    <>

      <section className="qha" aria-labelledby="qh-titulo">
        <div className="cardhead"><h2 className="font-heading font-bold" id="qh-titulo" tabIndex={-1}>Qué hacer ahora</h2></div>
        <ul className={`cjs ${desk ? 'dk' : ''}`} id="cjl-qha">
          {aMostrar.map((c) => {
            const Icon = ICONS[c.tipo] || Target;
            return (
              <li key={c.clave} className={`cj ${c.positivo ? 'pos' : ''}`} aria-labelledby={`cj-${c.clave}`}>
                <span className="cjic"><Icon size={18} strokeWidth={2} /></span>
                <div className="cjm">
                  <h3 className="cjt" id={`cj-${c.clave}`}>{c.titulo}</h3>
                  <p>{c.texto}</p>
                  <div className="cjact">
                    <button className="cjbtn focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-2" onClick={() => handleAccion(c)}>{c.boton}</button>
                    <button className="cjno focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-2" aria-label={`Ahora no: ${c.titulo}`} onClick={(e) => handleAhoraNo(c, e)}>Ahora no</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {!desk && lista.length > 1 && (
          <button 
            className="cjmas focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-2" 
            aria-expanded={expandido} 
            aria-controls="cjl-qha"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? 'Ver menos' : `Ver ${lista.length - 1} consejo${lista.length - 1 === 1 ? '' : 's'} más`}
            <ChevronDown size={16} strokeWidth={2.4} style={{ transform: expandido ? 'rotate(180deg)' : 'none' }} />
          </button>
        )}
      </section>

      {pasoAbierto && tareaDePaso && pasoDePaso && (
        <HojaDiaPaso
          pasoTexto={pasoDePaso.texto}
          tareaNombre={tareaDePaso.nombre}
          fecha={pasoDePaso.fecha}
          hoy={hoy}
          onElegir={(f) => { ponerFechaPaso(tareaDePaso.id, pasoDePaso.id, f); setPasoAbierto(null); }}
          onCerrar={() => setPasoAbierto(null)}
        />
      )}

      {aviso && createPortal(
        <div className="progreso">
          <div className="ttoast" role="status">
            <span>{aviso.texto}</span>
            <button type="button" onClick={() => { aviso.deshacer(); setAviso(null); }}>Deshacer</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
