import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Repeat, X } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { Compromiso } from '../../types';
import { getTodayString } from '../../utils/habitUtils';
import { diaLargo } from '../../utils/semanaUtils';
import {
  compromisosDeHoy, proximosAgrupados, seriesSemanales, yaPasaron, textoCadaSemana, textoCuando, tituloDiaCompromiso, yaPaso,
} from '../../utils/compromisosUtils';
import { HojaCompromiso } from '../semana/HojaCompromiso';
import { useEsEscritorio } from '../screens/TodayScreen';

/**
 * "Tus compromisos" (design/maqueta-compromisos-2.html, DESIGN.md › Compromisos 2).
 * Celular: pantalla completa (sin la barra de abajo). Escritorio: panel a la derecha sobre un velo.
 * Se abre desde Hoy › "Ver todos" y desde Tu semana (abrirCompromisos en el contexto).
 */

const SEGUNDOS_AVISO = 6000;

export const TusCompromisosPantalla: React.FC = () => {
  const { compromisos, verCompromisos, cerrarCompromisos, marcarCompromiso } = useHabitStore();
  const desk = useEsEscritorio();
  const hoy = getTodayString();

  const [aviso, setAviso] = useState<{ titulo: string; deshacer: () => void } | null>(null);
  const timerAviso = useRef<number | null>(null);
  const [verPasados, setVerPasados] = useState(false);
  const [hoja, setHoja] = useState<{ compromiso?: Compromiso; fecha?: string; alcance?: 'todos' } | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const antes = useRef<HTMLElement | null>(null);
  const hojaAbierta = useRef(false);
  hojaAbierta.current = !!hoja;

  // Al abrir: foco en el título (y se guarda quién la abrió, para devolverle el foco al cerrar); sin la barra de abajo
  useEffect(() => {
    if (!verCompromisos) return;
    antes.current = document.activeElement as HTMLElement | null;
    setVerPasados(false);
    setAviso(null);
    window.setTimeout(() => titulo.current?.focus(), 0);
    document.body.classList.add('sin-barra');
    return () => {
      document.body.classList.remove('sin-barra');
      antes.current?.focus?.();
    };
  }, [verCompromisos]);

  // Escape cierra la pantalla, salvo que la hoja de editar esté abierta (ahí Escape solo cierra la hoja)
  useEffect(() => {
    if (!verCompromisos) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !hojaAbierta.current) cerrarCompromisos();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [verCompromisos, cerrarCompromisos]);

  useEffect(() => () => { if (timerAviso.current) window.clearTimeout(timerAviso.current); }, []);

  if (!verCompromisos) return null;

  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const deHoy = compromisosDeHoy(compromisos, hoy);
  const proximos = proximosAgrupados(compromisos, hoy);
  const series = seriesSemanales(compromisos, hoy);
  const pasados = yaPasaron(compromisos, hoy);
  const nPasados = pasados.reduce((n, g) => n + g.items.length, 0);
  const vacio = !deHoy.length && !proximos.length && !series.length && !nPasados;

  const marcar = (c: Compromiso, fecha: string, hecho: boolean) => {
    marcarCompromiso(c.id, fecha, hecho);
    if (timerAviso.current) window.clearTimeout(timerAviso.current);
    if (!hecho) { setAviso(null); return; }
    setAviso({ titulo: c.titulo, deshacer: () => marcarCompromiso(c.id, fecha, false) });
    timerAviso.current = window.setTimeout(() => setAviso(null), SEGUNDOS_AVISO);
  };

  // Hora (o momento) y título; los de hoy que ya pasaron llevan "ya pasó"
  const cuerpo = (c: Compromiso, fecha: string, extra: { hecho?: boolean; paso?: boolean; dia?: string }) => (
    <button type="button" className="ccb" onClick={() => setHoja({ compromiso: c, fecha })}
      aria-label={`${extra.dia ? `${extra.dia}, ` : ''}${textoCuando(c)}: ${c.titulo}${c.repetirSemanal ? ', cada semana' : ''}${extra.paso ? ', ya pasó' : ''}${extra.hecho ? ', hecho' : ''}. Editar`}>
      <span className={`cch${c.hora ? '' : ' suave'}`}>{textoCuando(c)}{extra.paso && <small>ya pasó</small>}</span>
      <span className="ccm">
        <span className="cct">{c.titulo}</span>
        {c.repetirSemanal && <span className="ccp"><Repeat size={12} aria-hidden="true" />cada semana</span>}
      </span>
      <span className="ccv" aria-hidden="true"><ChevronRight size={18} /></span>
    </button>
  );

  const filaConCasilla = (c: Compromiso, fecha: string, hecho: boolean, pasado: boolean, dia?: string) => {
    const paso = yaPaso(c, fecha, hoy, minutosAhora);
    return (
      <li key={`${c.id}-${fecha}`} className={[hecho ? 'hecho' : '', paso || pasado ? 'cpasado' : ''].filter(Boolean).join(' ') || undefined}>
        <div className="ccfila">
          <button type="button" className="ccchk" role="checkbox" aria-checked={hecho} aria-label={`${c.titulo}, ${textoCuando(c).toLowerCase()}`} onClick={() => marcar(c, fecha, !hecho)}>
            <i>{hecho && <Check size={16} strokeWidth={3} />}</i>
          </button>
          {cuerpo(c, fecha, { hecho, paso, dia })}
        </div>
      </li>
    );
  };

  return createPortal(
    <>
      {desk && <div className="compro-velo" aria-hidden="true" onClick={cerrarCompromisos} />}
      <div className="compro" role="dialog" aria-modal="true" aria-labelledby="tc-t">
        <div className="cbar">
          {!desk && <button type="button" className="cback" aria-label="Volver" onClick={cerrarCompromisos}><ChevronLeft size={24} /></button>}
          <h1 className="cond" id="tc-t" ref={titulo} tabIndex={-1}>Tus compromisos</h1>
          <button type="button" className="cadd" onClick={() => setHoja({})}><Plus size={18} />Agregar</button>
          {desk && <button type="button" className="cback" aria-label="Cerrar" onClick={cerrarCompromisos}><X size={18} /></button>}
        </div>

        <div className="cbody">
          {vacio ? (
            <div className="cvacio">
              <h2 className="csec" style={{ margin: 0 }}>Aún no tienes compromisos</h2>
              <p>Agrega una cita, una reunión o una clase y aquí la ves.</p>
              <button type="button" className="btnp" style={{ margin: '0 auto' }} onClick={() => setHoja({})}><Plus size={18} />Agregar un compromiso</button>
            </div>
          ) : (
            <>
              <section aria-labelledby="tc-hoy">
                <h2 className="csec" id="tc-hoy">Hoy, {diaLargo(hoy).toLowerCase()}</h2>
                {deHoy.length
                  ? <ul className="clist">{deHoy.map(({ c, fecha, hecho }) => filaConCasilla(c, fecha, hecho, false, 'Hoy'))}</ul>
                  : <p className="cayuda">Hoy no tienes compromisos.</p>}
              </section>

              {proximos.length > 0 && (
                <section aria-labelledby="tc-prox">
                  <h2 className="csec" id="tc-prox">Próximos</h2>
                  {proximos.map((g) => (
                    <React.Fragment key={g.fecha}>
                      <p className="cdia">{tituloDiaCompromiso(g.fecha, hoy)}</p>
                      <ul className="clist">
                        {g.items.map(({ c, fecha }) => (
                          <li key={`${c.id}-${fecha}`}>
                            <div className="ccfila">{deHoy.length > 0 && <span className="ccsp" aria-hidden="true" />}{cuerpo(c, fecha, { dia: tituloDiaCompromiso(fecha, hoy) })}</div>
                          </li>
                        ))}
                      </ul>
                    </React.Fragment>
                  ))}
                </section>
              )}

              {series.length > 0 && (
                <section aria-labelledby="tc-sem">
                  <h2 className="csec" id="tc-sem">Cada semana <span className="num">{series.length}</span></h2>
                  <p className="cayuda">Tócalo para cambiar todas las veces.</p>
                  <ul className="clist">
                    {series.map((c) => (
                      <li key={c.id}>
                        {/* Toda la serie: la hoja no pregunta "¿Solo este día o todos?" */}
                        <button type="button" className="ccb" aria-label={`${c.titulo}, ${textoCadaSemana(c)}. Editar todas las veces`} onClick={() => setHoja({ compromiso: c, alcance: 'todos' })}>
                          <span className="crep" aria-hidden="true"><Repeat size={16} /></span>
                          <span className="ccm"><span className="cct">{c.titulo}</span><span className="ccp">{textoCadaSemana(c)}</span></span>
                          <span className="ccv" aria-hidden="true"><ChevronRight size={18} /></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {nPasados > 0 && (
                <section>
                  <h2 className="csec cpleg-h">
                    <button type="button" className="cpleg" aria-expanded={verPasados} aria-controls="tc-pas" onClick={() => setVerPasados((v) => !v)}>
                      <b>Ya pasaron</b><span className="num">{nPasados}</span><ChevronDown size={20} aria-hidden="true" />
                    </button>
                  </h2>
                  {verPasados && (
                    <div id="tc-pas">
                      <p className="cayuda">Los de los últimos 30 días. Si se te olvidó marcar uno, márcalo aquí.</p>
                      {pasados.map((g) => (
                        <React.Fragment key={g.fecha}>
                          <p className="cdia">{tituloDiaCompromiso(g.fecha, hoy)}</p>
                          <ul className="clist">{g.items.map(({ c, fecha, hecho }) => filaConCasilla(c, fecha, hecho, true, tituloDiaCompromiso(fecha, hoy)))}</ul>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {aviso && (
          <div className="tareas">
            <div className="ttoast cttoast" role="status">
              <span>Marcaste <b>{aviso.titulo}</b>.</span>
              <button type="button" onClick={() => { aviso.deshacer(); setAviso(null); }}>Deshacer</button>
            </div>
          </div>
        )}
      </div>

      <HojaCompromiso
        isOpen={!!hoja}
        onClose={() => setHoja(null)}
        compromiso={hoja?.compromiso}
        fechaOcurrencia={hoja?.fecha}
        fechaInicial={hoy}
        alcance={hoja?.alcance}
      />
    </>,
    document.body
  );
};
