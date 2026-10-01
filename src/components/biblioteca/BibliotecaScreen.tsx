import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronRight, Info, X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { useEsEscritorio } from '../screens/TodayScreen';
import { GRUPOS_TAREAS_BIBLIOTECA, PACKS_BIBLIOTECA, PLANES_BIBLIOTECA, TAREAS_BIBLIOTECA } from '../../data/biblioteca';
import { avisoAgregado, botonDeItem, clavesIniciales, dondeQuedo, hayAviso, ItemBiblioteca, HabitoBiblioteca, lineaHabito, lineaMinimo, marcaDeItem, metaDeItem, subtituloDeItem, textoAviso, tituloSemana, yaAgregado } from '../../utils/bibliotecaUtils';
import { MomentoDia } from '../../types';

type Pestana = 'habitos' | 'tareas' | 'planes';
const TABS: [Pestana, string][] = [['habitos', 'Hábitos'], ['tareas', 'Tareas'], ['planes', 'Planes']];
const INTRO: Record<Pestana, string> = {
  habitos: 'Grupos de hasta 3 hábitos. Cada uno va después de algo que ya haces y trae su versión mínima para los días pesados.',
  tareas: 'Pendientes típicos, ya divididos en pasos pequeños. Tú les pones el día.',
  planes: 'Un mes con un tema: pocos hábitos y una tarea repartida semana a semana.',
};
const CLAVE_PESTANA = 'racha_biblioteca_pestana';
const claseMomento = (m: MomentoDia) => (m === 'flexible' ? '' : m);

export const BibliotecaScreen: React.FC = () => {
  const { verBiblioteca, cerrarBiblioteca, agregarDeBiblioteca, deshacerBiblioteca, habitos, tareas, habitosActivos } = useHabitStore();
  const desk = useEsEscritorio();
  const [pestana, setPestana] = useState<Pestana>(() => { try { const p = localStorage.getItem(CLAVE_PESTANA); return p === 'tareas' || p === 'planes' ? p : 'habitos'; } catch { return 'habitos'; } });
  const [abierto, setAbierto] = useState<ItemBiblioteca | null>(null);
  const [claves, setClaves] = useState<string[]>([]);
  const [semanas, setSemanas] = useState<number[]>([0]);
  const [aviso, setAviso] = useState<{ texto: string; ids: { habitoIds: string[]; tareaId: string | null } } | null>(null);

  const timer = useRef<number | null>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const cerrarHojaRef = useRef<HTMLButtonElement>(null);
  const tituloPanelRef = useRef<HTMLHeadingElement>(null);
  const volverA = useRef<HTMLElement | null>(null);

  const abrir = (item: ItemBiblioteca) => {
    setAbierto(item);
    setClaves(clavesIniciales(item));
    setSemanas([0]);
  };

  const elegirPestana = (p: Pestana) => {
    setPestana(p);
    try { localStorage.setItem(CLAVE_PESTANA, p); } catch {}
    setAbierto(null);
  };

  const alternar = (clave: string) => {
    setClaves(prev => prev.includes(clave) ? prev.filter(c => c !== clave) : [...prev, clave]);
  };

  const alternarSemana = (i: number) => {
    setSemanas(prev => prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]);
  };

  const ya = abierto ? yaAgregado(abierto, habitos, tareas) : false;
  const boton = abierto ? botonDeItem(abierto, claves.length, ya) : { texto: '', apagado: true };
  const donde = abierto && ya ? dondeQuedo(abierto, habitos, tareas) : '';

  const agregar = () => {
    if (boton.apagado || !abierto) return;
    const ids = agregarDeBiblioteca(abierto, claves);
    setAviso({ texto: avisoAgregado(abierto, ids.habitoIds.length), ids });
    if (!desk) setAbierto(null);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAviso(null), 6000);
  };

  const deshacer = () => {
    if (aviso) {
      deshacerBiblioteca(aviso.ids);
      setAviso(null);
      if (timer.current) window.clearTimeout(timer.current);
    }
  };

  useEffect(() => {
    if (!verBiblioteca) {
      setAbierto(null);
      setAviso(null);
      if (timer.current) window.clearTimeout(timer.current);
    }
  }, [verBiblioteca]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!desk) {
          if (abierto) setAbierto(null);
          else cerrarBiblioteca();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [desk, abierto, cerrarBiblioteca]);

  // Celular: la pantalla es un diálogo. Al abrirla, el fondo queda inerte y el foco va a Cerrar; al cerrarla, el foco vuelve a donde estaba.
  // (No depende de `abierto`: si dependiera, cada hoja que se abre pisaría el lugar al que hay que volver.)
  useEffect(() => {
    if (desk || !verBiblioteca) return;
    volverA.current = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus();
    const root = document.getElementById('root');
    if (root) root.setAttribute('inert', '');
    return () => {
      if (root) root.removeAttribute('inert');
      if (volverA.current && document.body.contains(volverA.current)) volverA.current.focus();
      volverA.current = null;
    };
  }, [desk, verBiblioteca]);

  // Celular: al abrir la hoja el foco va a su Cerrar; al cerrarla vuelve a la fila que la abrió (o al Cerrar de la pantalla).
  const filaAbierta = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (desk || !abierto) return;
    filaAbierta.current = document.activeElement as HTMLElement | null;
    cerrarHojaRef.current?.focus();
    return () => {
      if (filaAbierta.current && document.body.contains(filaAbierta.current)) filaAbierta.current.focus();
      else cerrarRef.current?.focus();
      filaAbierta.current = null;
    };
  }, [desk, abierto]);

  useEffect(() => {
    if (desk && abierto) {
      tituloPanelRef.current?.focus();
    }
  }, [desk, abierto]);

  if (!verBiblioteca) return null;

  const flechasPestanas = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = TABS.findIndex(([k]) => k === pestana);
      let newIndex = currentIndex;
      if (e.key === 'ArrowRight') newIndex = (currentIndex + 1) % TABS.length;
      if (e.key === 'ArrowLeft') newIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      const newPestana = TABS[newIndex][0];
      elegirPestana(newPestana);
      setTimeout(() => document.getElementById(`bt-${newPestana}`)?.focus(), 0);
    }
  };

  const fila = (item: ItemBiblioteca) => (
    <li key={item.id}>
      <button type="button" className={`bfila${item.tipo === 'tarea' ? ' sinico' : ''}`} aria-current={desk && abierto?.id === item.id ? 'true' : undefined} onClick={() => abrir(item)}>
        {item.tipo !== 'tarea' && (
          <span className={`bico ${item.tipo === 'pack' ? claseMomento((item.habitos[0] as HabitoBiblioteca).momento) : ''}`}><HabitIcon name={item.icono} size={20} /></span>
        )}
        <span className="btxt"><span className="bnom">{item.nombre}</span><span className="bmeta">{metaDeItem(item)}</span></span>
        {yaAgregado(item, habitos, tareas) && <span className="bya"><Check size={14} strokeWidth={2.6} aria-hidden="true" />{marcaDeItem(item)}</span>}
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </li>
  );

  const pestanasYLista = (
    <>
      <div className="btabs" role="tablist" aria-label="Biblioteca" onKeyDown={flechasPestanas}>
        {TABS.map(([k, t]) => (
          <button key={k} type="button" role="tab" id={`bt-${k}`} aria-controls={`bp-${k}`} aria-selected={pestana === k} tabIndex={pestana === k ? 0 : -1} onClick={() => elegirPestana(k)}>{t}</button>
        ))}
      </div>
      <div role="tabpanel" id={`bp-${pestana}`} aria-labelledby={`bt-${pestana}`}>
        <p className="bintro">{INTRO[pestana]}</p>
        {pestana === 'habitos' && <ul className="blista">{PACKS_BIBLIOTECA.map(fila)}</ul>}
        {pestana === 'planes' && <ul className="blista">{PLANES_BIBLIOTECA.map(fila)}</ul>}
        {pestana === 'tareas' && GRUPOS_TAREAS_BIBLIOTECA.map((g) => {
          const delGrupo = TAREAS_BIBLIOTECA.filter((t) => t.grupo === g);
          if (!delGrupo.length) return null;
          return (<React.Fragment key={g}><h2 className="bgrupo">{g}</h2><ul className="blista">{delGrupo.map(fila)}</ul></React.Fragment>);
        })}
      </div>
    </>
  );

  const filaHabito = (h: HabitoBiblioteca) => (
    <div className="bh" key={h.clave}>
      <span className={`bico ${claseMomento(h.momento)}`}><HabitIcon name={h.icono} size={20} /></span>
      <span className="btxt"><span className="bnom">{h.nombre}</span><span className="bmeta">{lineaHabito(h)}</span><span className="bmeta">{lineaMinimo(h)}</span></span>
      <button type="button" className="bchk" role="checkbox" aria-checked={claves.includes(h.clave)} aria-disabled={ya || undefined} aria-label={`Incluir ${h.nombre}`} onClick={() => { if (!ya) alternar(h.clave); }}><Check size={16} strokeWidth={3} aria-hidden="true" /></button>
    </div>
  );

  const avisoTres = !ya && hayAviso(habitosActivos.length, claves.length) ? (
    <p className="bnota"><Info size={16} aria-hidden="true" /><span>{textoAviso(habitosActivos.length)}</span></p>
  ) : null;

  let cuerpo = null;
  if (abierto?.tipo === 'pack') {
    cuerpo = (
      <>
        {avisoTres}
        <div role="group" aria-label="Hábitos">{abierto.habitos.map(filaHabito)}</div>
        <p className="bayuda">Después puedes cambiar lo que quieras en cada hábito.</p>
      </>
    );
  } else if (abierto?.tipo === 'tarea') {
    cuerpo = (
      <>
        <ul className="bpasos" style={{ marginTop: 8 }}>
          {abierto.pasos.map((p, i) => (
            <li key={i} className={p.pasos && p.pasos.length ? 'grande' : undefined}>{p.texto}
              {p.pasos && p.pasos.length > 0 && <ul>{p.pasos.map((s, j) => <li key={j}>{s.texto}</li>)}</ul>}
            </li>
          ))}
        </ul>
        <p className="bayuda">Después puedes cambiar, quitar o agregar pasos en Tareas.</p>
      </>
    );
  } else if (abierto?.tipo === 'plan') {
    cuerpo = (
      <>
        <p className="bporque">{abierto.descripcion}</p>
        <p className="bayuda" style={{ marginTop: 6 }}>Los hábitos quedan en Hoy y la tarea en Tareas. Los pasos llegan sin día: cada semana los pones en Tu semana.</p>
        {avisoTres}
        {abierto.habitos.length > 0 && (<><h3 className="bsec">Hábitos</h3><div role="group" aria-label="Hábitos">{abierto.habitos.map(filaHabito)}</div></>)}
        <h3 className="bsec">La tarea, semana a semana</h3>
        {abierto.semanas.map((s, i) => {
          const abierta = semanas.includes(i);
          return (
            <React.Fragment key={i}>
              <button type="button" className={`bsem${i === 0 ? ' primera' : ''}`} aria-expanded={abierta} aria-controls={`bs${i}`} onClick={() => alternarSemana(i)}>
                <b>{tituloSemana(i + 1, s)}</b><small>{s.pasos.length} {s.pasos.length === 1 ? 'paso' : 'pasos'}</small><ChevronDown size={18} aria-hidden="true" />
              </button>
              {abierta && (<div id={`bs${i}`}><p className="bsemq">{s.porque}</p><ul className="bpasos">{s.pasos.map((p, j) => <li key={j}>{p}</li>)}</ul></div>)}
            </React.Fragment>
          );
        })}
      </>
    );
  }

  const pie = (
    <div className="bpie">
      {donde && <p className="bdonde">{donde}</p>}
      <button type="button" className="bprim" aria-disabled={boton.apagado || undefined} onClick={agregar}>{boton.texto}</button>
    </div>
  );

  const toast = aviso ? (
    <div className="btoast" role="status"><span>{aviso.texto}</span><button type="button" onClick={deshacer}>Deshacer</button></div>
  ) : null;

  if (!desk) {
    return (
      <>
        {createPortal(
          <div className="biblio" role="dialog" aria-modal="true" aria-labelledby="bt">
            <header className="bcab"><h1 id="bt">Biblioteca</h1><button type="button" className="bcerrar" aria-label="Cerrar" onClick={cerrarBiblioteca} ref={cerrarRef}><X size={16} /></button></header>
            <div className="bcuerpo">{pestanasYLista}</div>
            {toast}
          </div>, document.body)}
        {abierto && createPortal(
          <div className="tareas">
            <div className="tscrim" onClick={() => setAbierto(null)} aria-hidden="true" />
            <div className="tsheet hcomp bhoja" role="dialog" aria-modal="true" aria-labelledby="bh1">
              <div className="tgrab" aria-hidden="true" />
              <div className="tsheet-h">
                <div style={{ flex: 1, minWidth: 0 }}><h2 className="font-heading font-bold text-[24px] m-0" id="bh1">{abierto.nombre}</h2><p className="bhsub">{subtituloDeItem(abierto)}</p></div>
                <button type="button" className="closeb" aria-label="Cerrar" onClick={() => setAbierto(null)} ref={cerrarHojaRef}><X size={16} /></button>
              </div>
              <div className="bhcuerpo bdet">{cuerpo}</div>
              {pie}
            </div>
          </div>, document.body)}
      </>
    );
  }

  return (
    <div className="biblio dk">
      <div className="bdkcab"><h1>Biblioteca</h1><p>Hábitos, tareas y planes listos para agregar.</p></div>
      <div className="bdkgrid">
        <div>{pestanasYLista}{toast}</div>
        {abierto ? (
          <aside className="bpanel" aria-labelledby="bp1">
            <h2 id="bp1" tabIndex={-1} ref={tituloPanelRef}>{abierto.nombre}</h2>
            <p className="bsub">{subtituloDeItem(abierto)}</p>
            <div className="bhcuerpo bdet">{cuerpo}</div>
            {pie}
          </aside>
        ) : (
          <aside className="bpanel vacio"><p>Elige uno de la lista para ver lo que trae.</p></aside>
        )}
      </div>
    </div>
  );
};
