import React, { useRef, useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Subtarea, Tarea } from '../../types';
import { nuevoIdPaso } from '../../utils/tareasUtils';

export const TAREA_ICONOS = ['ListChecks', 'BookOpen', 'GraduationCap', 'Briefcase', 'Code', 'Home', 'Target', 'Lightbulb'];

type Pos = 'antes' | 'despues' | 'dentro';
interface Arrastre { id: string; dy: number; destino: { id: string; pos: Pos } | null }

/** Ubica cada paso: su padre y su lugar entre sus hermanos. */
const ubicar = (lista: Subtarea[], padreId: string | null = null, mapa = new Map<string, { padreId: string | null; hermanos: string[] }>()) => {
  const hermanos = lista.map((s) => s.id);
  for (const s of lista) {
    mapa.set(s.id, { padreId, hermanos });
    if (s.subtareas) ubicar(s.subtareas, s.id, mapa);
  }
  return mapa;
};
/** Orden de arriba a abajo, sin el paso que se arrastra ni lo que tiene adentro. */
const ordenPlano = (lista: Subtarea[], sin: string, res: string[] = []) => {
  for (const s of lista) {
    if (s.id === sin) continue;
    res.push(s.id);
    if (s.subtareas) ordenPlano(s.subtareas, sin, res);
  }
  return res;
};

const autoAlto = (el: HTMLTextAreaElement | null) => {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

/**
 * Editar tarea (celular) y Nueva tarea. DESIGN.md › Tareas.
 * Al editar una tarea que ya existe, cada cambio va directo al store (sin copia local),
 * para no pisar lo que se marque en otro lado mientras se edita.
 */
export const TareaEditar: React.FC<{
  tarea: Tarea | null;
  onListo: () => void;
  onBorrar?: (t: Tarea) => void;
}> = ({ tarea, onListo, onBorrar }) => {
  const { crearTarea, editarTarea, editarTextoPaso, agregarPasoTarea, borrarPasoTarea, moverPasoTarea } = useHabitStore();
  const esNueva = !tarea;
  const [nombre, setNombre] = useState(tarea ? tarea.nombre : '');
  const [icono, setIcono] = useState(tarea ? tarea.icono : 'ListChecks');
  const [verIconos, setVerIconos] = useState(false);
  const [pasosNuevos, setPasosNuevos] = useState<string[]>([]); // solo para Nueva tarea
  const [textoNuevo, setTextoNuevo] = useState('');
  const [dentroDe, setDentroDe] = useState<string | null>(null);
  const [textoDentro, setTextoDentro] = useState('');
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const inicio = useRef<{ x: number; y: number; id: string; timer: number | null; activo: boolean; caja: HTMLElement; scroll0: number; ux: number; uy: number; auto: number | null } | null>(null);

  const guardarCabecera = (nuevoIcono = icono) => {
    if (!tarea) return;
    const limpio = nombre.trim();
    editarTarea(tarea.id, { nombre: limpio || tarea.nombre, icono: nuevoIcono });
  };

  // ---------- Arrastrar (mantener presionado ⋮⋮) ----------
  const cancelar = () => {
    if (inicio.current?.timer) window.clearTimeout(inicio.current.timer);
    if (inicio.current?.auto) window.clearInterval(inicio.current.auto);
    inicio.current = null;
    setArrastre(null);
  };
  const alBajar = (e: React.PointerEvent<HTMLSpanElement>, id: string) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sin captura el arrastre igual funciona */ }
    const timer = window.setTimeout(() => {
      if (!inicio.current) return;
      inicio.current.activo = true;
      setArrastre({ id, dy: 0, destino: null });
      navigator.vibrate?.(10);
    }, 350);
    // La caja que se desplaza (en la app, el contenedor con overflow-y-auto)
    let caja: HTMLElement | null = e.currentTarget.parentElement;
    while (caja && !(caja.scrollHeight > caja.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(caja).overflowY))) caja = caja.parentElement;
    if (!caja) caja = document.scrollingElement as HTMLElement;
    inicio.current = { x: e.clientX, y: e.clientY, id, timer, activo: false, caja, scroll0: caja.scrollTop, ux: e.clientX, uy: e.clientY, auto: null };
  };
  const alMover = (e: React.PointerEvent<HTMLSpanElement>) => {
    const i = inicio.current;
    if (!i || !tarea) return;
    if (!i.activo) {
      if (Math.abs(e.clientY - i.y) > 10) cancelar();
      return;
    }
    i.ux = e.clientX; i.uy = e.clientY;
    // Cerca del borde de arriba o de abajo, la pantalla se desplaza sola
    const borde = e.clientY < 90 ? -1 : e.clientY > window.innerHeight - 130 ? 1 : 0;
    if (borde && !i.auto) {
      i.auto = window.setInterval(() => {
        const j = inicio.current;
        if (!j) return;
        const dir = j.uy < 90 ? -1 : j.uy > window.innerHeight - 130 ? 1 : 0;
        if (!dir) { window.clearInterval(j.auto as number); j.auto = null; return; }
        j.caja.scrollTop += dir * 10;
        calcular(j.ux, j.uy);
      }, 16);
    }
    calcular(e.clientX, e.clientY);
  };
  const calcular = (cx: number, cy: number) => {
    const i = inicio.current;
    if (!i || !tarea) return;
    const dy = cy - i.y + (i.caja.scrollTop - i.scroll0);
    const dx = cx - i.x;
    let destino: Arrastre['destino'] = null;
    const debajo = document.elementsFromPoint(cx, cy)
      .map((el) => (el as HTMLElement).closest<HTMLElement>('[data-paso-row]'))
      .find((el) => el && el.dataset.pasoRow !== i.id && !el.closest(`[data-paso-li="${i.id}"]`));
    if (debajo) {
      const id = debajo.dataset.pasoRow as string;
      const r = debajo.getBoundingClientRect();
      const pos: Pos = cy < r.top + r.height / 2 ? 'antes' : 'despues';
      if (dx > 32) {
        // Hacia la derecha: dentro del paso de arriba
        const orden = ordenPlano(tarea.subtareas, i.id);
        const arriba = pos === 'despues' ? id : orden[orden.indexOf(id) - 1];
        destino = arriba ? { id: arriba, pos: 'dentro' } : null;
      } else destino = { id, pos };
    }
    setArrastre({ id: i.id, dy, destino });
  };
  const alSoltar = () => {
    const i = inicio.current;
    const a = arrastre;
    cancelar();
    if (!i?.activo || !a?.destino || !tarea) return;
    const mapa = ubicar(tarea.subtareas);
    if (a.destino.pos === 'dentro') {
      const hijos = (mapa.get(a.destino.id) && tarea.subtareas) ? hijosDe(tarea.subtareas, a.destino.id).filter((x) => x !== a.id) : [];
      moverPasoTarea(tarea.id, a.id, { padreId: a.destino.id, indice: hijos.length });
      return;
    }
    const u = mapa.get(a.destino.id);
    if (!u) return;
    const hermanos = u.hermanos.filter((x) => x !== a.id);
    const idx = hermanos.indexOf(a.destino.id);
    moverPasoTarea(tarea.id, a.id, { padreId: u.padreId, indice: a.destino.pos === 'antes' ? idx : idx + 1 });
  };

  const renderPaso = (s: Subtarea): React.ReactNode => {
    const arrastrando = arrastre?.id === s.id;
    const d = arrastre?.destino?.id === s.id ? arrastre.destino.pos : null;
    return (
      <li key={s.id} data-paso-li={s.id} className={`tpaso${arrastrando ? ' drag' : ''}`}
        style={arrastrando ? { transform: `translateY(${arrastre?.dy ?? 0}px)` } : undefined}>
        {d === 'antes' && <div className="tlinea" aria-hidden="true" />}
        <div className="tfila" data-paso-row={s.id}>
          <span className="tasam" aria-hidden="true" style={{ cursor: 'grab' }}
            onPointerDown={(e) => alBajar(e, s.id)} onPointerMove={alMover} onPointerUp={alSoltar} onPointerCancel={cancelar}>
            <GripVertical size={18} />
          </span>
          <textarea className="tedit" rows={1} defaultValue={s.texto} aria-label="Texto del paso"
            ref={autoAlto} onInput={(e) => autoAlto(e.currentTarget)}
            onBlur={(e) => { if (tarea && e.target.value.trim() !== s.texto) editarTextoPaso(tarea.id, s.id, e.target.value); }} />
          <button type="button" className="tmover" aria-label={`Agregar un paso dentro de ${s.texto}`}
            onClick={() => { setDentroDe(s.id); setTextoDentro(''); }}><Plus size={18} /></button>
          <button type="button" className="tmover" aria-label={`Borrar el paso ${s.texto}`}
            onClick={() => tarea && borrarPasoTarea(tarea.id, s.id)}><Trash2 size={17} /></button>
        </div>
        {d === 'dentro' && <div className="tsoltar" aria-hidden="true">Suelta aquí para meterlo dentro de este paso</div>}
        {s.subtareas && s.subtareas.length > 0 && <ul className="tarbol tsubl">{s.subtareas.map(renderPaso)}</ul>}
        {dentroDe === s.id && tarea && (
          <div className="tnuevo-in">
            <Plus size={16} strokeWidth={2.4} className="text-text-muted" />
            <input className="tinput tinput-on" autoFocus placeholder="Escribe un paso más pequeño" aria-label={`Nuevo paso dentro de ${s.texto}`}
              value={textoDentro} onChange={(e) => setTextoDentro(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textoDentro.trim()) { agregarPasoTarea(tarea.id, s.id, textoDentro); setTextoDentro(''); }
                if (e.key === 'Escape') setDentroDe(null);
              }}
              onBlur={() => { if (textoDentro.trim()) agregarPasoTarea(tarea.id, s.id, textoDentro); setDentroDe(null); }} />
          </div>
        )}
        {d === 'despues' && <div className="tlinea" aria-hidden="true" />}
      </li>
    );
  };

  const agregarAbajo = () => {
    const t = textoNuevo.trim();
    if (!t) return;
    if (tarea) agregarPasoTarea(tarea.id, null, t);
    else setPasosNuevos((p) => [...p, t]);
    setTextoNuevo('');
  };

  const crear = () => {
    const n = nombre.trim();
    if (!n) return;
    const pendiente = textoNuevo.trim();
    const todos = pendiente ? [...pasosNuevos, pendiente] : pasosNuevos;
    crearTarea({ nombre: n, icono, color: '', subtareas: todos.map((texto) => ({ id: nuevoIdPaso(), texto, hecha: false })) });
    onListo();
  };

  return (
    <section className="card tcard open tediting" aria-label={esNueva ? 'Nueva tarea' : `Editar ${tarea?.nombre}`}>
      <div className="teh">
        <button type="button" className="tico btn" aria-label="Cambiar el ícono" aria-expanded={verIconos} onClick={() => setVerIconos((v) => !v)}>
          <HabitIcon name={icono} size={19} />
        </button>
        <input className="tedit tnamein" value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => guardarCabecera()}
          placeholder={esNueva ? '¿Qué quieres lograr?' : ''} aria-label="Nombre de la tarea" autoFocus={esNueva} maxLength={60} />
      </div>
      {verIconos && (
        <div className="ticonos" role="group" aria-label="Ícono de la tarea">
          {TAREA_ICONOS.map((n) => (
            <button key={n} type="button" aria-pressed={icono === n} aria-label={n}
              onClick={() => { setIcono(n); setVerIconos(false); guardarCabecera(n); }}>
              <HabitIcon name={n} size={19} />
            </button>
          ))}
        </div>
      )}

      {tarea && (
        <>
          <p className="tpista">Con + le agregas pasos más pequeños a un paso. Mantén presionado ⋮⋮ para arrastrarlo; hacia la derecha lo metes dentro del de arriba.</p>
          <ul className="tarbol">{tarea.subtareas.map(renderPaso)}</ul>
        </>
      )}
      {esNueva && pasosNuevos.length > 0 && (
        <ul className="tarbol">
          {pasosNuevos.map((p, i) => (
            <li key={i} className="tpaso"><div className="tfila">
              <span className="ttxt"><span className="tnom">{p}</span></span>
              <button type="button" className="tmover" aria-label={`Borrar el paso ${p}`} onClick={() => setPasosNuevos((l) => l.filter((_, j) => j !== i))}><Trash2 size={17} /></button>
            </div></li>
          ))}
        </ul>
      )}

      <div className="tagrega-in">
        <Plus size={16} strokeWidth={2.4} />
        <input className="tinput" value={textoNuevo} onChange={(e) => setTextoNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') agregarAbajo(); }} onBlur={() => { if (tarea) agregarAbajo(); }}
          placeholder={esNueva ? 'Escribe el primer paso, por pequeño que sea' : 'Agregar un paso'} aria-label="Agregar un paso" />
      </div>

      <div className="tacciones fin">
        {esNueva
          ? <button type="button" className="tbtnq" onClick={onListo}>Cancelar</button>
          : <button type="button" className="tbtnq tdelq" onClick={() => tarea && onBorrar?.(tarea)}><Trash2 size={15} /> Borrar tarea</button>}
        {esNueva
          ? <button type="button" className="btnp sm" disabled={!nombre.trim()} onClick={crear}>Crear tarea</button>
          : <button type="button" className="btnp sm" onClick={() => { guardarCabecera(); onListo(); }}>Listo</button>}
      </div>
    </section>
  );
};

/** Ids de los hijos directos de un paso. */
function hijosDe(lista: Subtarea[], id: string): string[] {
  for (const s of lista) {
    if (s.id === id) return (s.subtareas || []).map((x) => x.id);
    if (s.subtareas) {
      const r = hijosDe(s.subtareas, id);
      if (r.length || s.subtareas.some((x) => x.id === id)) return r;
    }
  }
  return [];
}
