// Instalar la app (design/maqueta-instalar.html, DESIGN.md › "Instalar la app").
// La pantalla completa, la hoja, "Ábrela en Safari / Chrome" y el recordatorio de Hoy.
// Los cálculos están en utils/instalarUtils.ts y lo del navegador en ./useInstalar.ts. El CSS, en index.css (clases ins…).
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, Check, ChevronLeft, ChevronRight, Copy, Ellipsis, EllipsisVertical, ExternalLink,
  Flame, Share, Smartphone, SquarePlus, Star, X,
} from 'lucide-react';
import { useInstalar } from './useInstalar';
import {
  CasoInstalar, debeOfrecerPantalla, hayQueCambiarDeNavegador, navegadorParaInstalar, textosPantalla,
} from '../../utils/instalarUtils';
import { SOPORTE_URL } from '../../lib/config';

const ENLACE = 'https://www.tengoracha.com';

// ---------- Dibujos (decorativos: no se tocan y no se leen) ----------
export const DibujoInicio: React.FC<{ ok?: boolean }> = ({ ok }) => (
  <div className="inshero" aria-hidden="true">
    <div className="inscel">
      <i /><i /><i /><i />
      <i className="yo"><Flame size={22} strokeWidth={2.2} /></i>
      <i /><i /><i /><i />
      {ok && <span className="ok"><Check size={20} strokeWidth={3} /></span>}
    </div>
  </div>
);

const DibSafariNuevo = () => (
  <div className="insdib" aria-hidden="true">
    <div className="fila"><span className="ic"><ChevronLeft size={18} /></span><span className="url">tengoracha.com</span><span className="ic on"><Ellipsis size={18} /></span></div>
    <div className="sep" />
    <div className="fila on"><span className="on">Compartir</span><span className="der on"><Share size={16} /></span></div>
  </div>
);
const DibSafariViejo = () => (
  <div className="insdib" aria-hidden="true">
    <div className="fila"><span className="url">tengoracha.com</span></div>
    <div className="fila" style={{ justifyContent: 'space-between' }}>
      <span className="ic"><ChevronLeft size={18} /></span><span className="ic"><ChevronRight size={18} /></span>
      <span className="ic on"><Share size={18} /></span>
      <span className="ic"><BookOpen size={18} /></span><span className="ic"><Copy size={18} /></span>
    </div>
  </div>
);
const DibListaIOS = () => (
  <div className="insdib" aria-hidden="true">
    <div className="fila">Copiar<span className="der"><Copy size={16} /></span></div>
    <div className="fila on"><span className="on">Agregar a inicio</span><span className="der on"><SquarePlus size={16} /></span></div>
    <div className="fila">Agregar a favoritos<span className="der"><Star size={16} /></span></div>
  </div>
);
const DibAgregar = () => (
  <div className="insdib" aria-hidden="true">
    <div className="fila" style={{ justifyContent: 'space-between' }}>Cancelar<span className="ic on" style={{ width: 'auto', padding: '0 10px' }}>Agregar</span></div>
    <div className="fila"><span className="mini"><Flame size={15} strokeWidth={2.2} /></span><span className="on">Racha</span></div>
  </div>
);
const DibMenuAndroid = () => (
  <div className="insdib" aria-hidden="true">
    <div className="fila"><span className="url">tengoracha.com</span><span className="ic on"><EllipsisVertical size={18} /></span></div>
  </div>
);
const DibListaAndroid = () => (
  <div className="insdib" aria-hidden="true">
    <div className="fila">Nueva pestaña</div>
    <div className="fila on"><span className="on">Agregar a la pantalla principal</span><span className="der on"><SquarePlus size={16} /></span></div>
    <div className="fila">Compartir…</div>
  </div>
);
const DibInterno = () => (
  <div className="insdib" aria-hidden="true">
    <div className="fila"><span className="ic"><X size={18} /></span><span className="url">tengoracha.com</span><span className="ic on"><Ellipsis size={18} /></span></div>
    <div className="sep" />
    <div className="fila on"><span className="on">Abrir en el navegador</span><span className="der on"><ExternalLink size={16} /></span></div>
  </div>
);

// Un símbolo que el lector de pantalla no sabe leer, con su texto
const Simbolo: React.FC<{ s: string; texto?: string }> = ({ s, texto }) => (
  <><span aria-hidden="true">{s}</span>{texto && <span className="sr-only">{texto}</span>}</>
);

const Paso: React.FC<{ n: number; titulo: React.ReactNode; sub?: React.ReactNode; children?: React.ReactNode }> = ({ n, titulo, sub, children }) => (
  <li>
    <span className="n" aria-hidden="true">{n}</span>
    <span><b>{titulo}</b>{sub && <span className="sub">{sub}</span>}</span>
    {children}
  </li>
);

// ---------- Los pasos, según el celular ----------
export const PasosInstalar: React.FC<{ caso: CasoInstalar }> = ({ caso }) => {
  const ayuda = SOPORTE_URL
    ? <p className="insayuda">¿No te salió? <a href={SOPORTE_URL} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a></p>
    : null;

  if (caso === 'android-boton' || caso === 'android-menu') {
    return (
      <>
        <ol className="inspasos" role="list">
          <Paso n={1} titulo="Toca el menú del navegador" sub={<>Los tres puntos <Simbolo s="⋮" /> o las tres rayas <Simbolo s="≡" />.</>}><DibMenuAndroid /></Paso>
          <Paso n={2} titulo="Elige “Instalar app” o “Agregar a la pantalla principal”" sub="El nombre cambia según el navegador."><DibListaAndroid /></Paso>
          <Paso n={3} titulo="Confirma con “Instalar” o “Agregar”" sub="Queda con el ícono de la llama." />
        </ol>
        {ayuda}
      </>
    );
  }

  return (
    <>
      <p className="insnota"><b>Cuando la abras desde tu pantalla de inicio,</b> entra otra vez con tu correo: te llega un código nuevo. Tus hábitos están guardados.</p>
      <ol className="inspasos" role="list">
        {caso === 'ios-viejo'
          ? <Paso n={1} titulo="Toca Compartir" sub="El cuadrito con la flecha hacia arriba. Está abajo, en la barra de Safari."><DibSafariViejo /></Paso>
          : <Paso n={1} titulo={<>Toca <Simbolo s="⋯" texto="los tres puntos" /> y luego “Compartir”</>} sub="Los tres puntos están abajo, al lado de la dirección."><DibSafariNuevo /></Paso>}
        <Paso n={2} titulo="Elige “Agregar a inicio”" sub="Si no aparece, baja por la lista. En algunos iPhone dice “Añadir a pantalla de inicio”."><DibListaIOS /></Paso>
        <Paso n={3} titulo="Toca “Agregar”" sub="Arriba a la derecha."><DibAgregar /></Paso>
      </ol>
      {ayuda}
    </>
  );
};

// "Abrir en el navegador": cuando Racha está dentro de Instagram, Facebook… o en Chrome de iPhone
const useCopiarEnlace = () => {
  const [copia, setCopia] = useState<'' | 'ok' | 'fallo'>('');
  const copiar = async () => {
    try { await navigator.clipboard.writeText(ENLACE); setCopia('ok'); } catch { setCopia('fallo'); }
  };
  return { copia, copiar };
};

const PasosCambiarNavegador: React.FC<{ caso: CasoInstalar; copia: '' | 'ok' | 'fallo' }> = ({ caso, copia }) => {
  const nav = navegadorParaInstalar(caso);
  return (
    <>
      {caso !== 'ios-otro' && (
        <>
          <ol className="inspasos" role="list">
            <Paso n={1} titulo={<>Toca <Simbolo s="⋯" texto="los tres puntos" /> y elige “Abrir en el navegador”</>} sub={`Los tres puntos están arriba. También puede decir “Abrir en ${nav}”.`}><DibInterno /></Paso>
            <Paso n={2} titulo="Entra con tu correo" sub="Ahí te mostramos cómo instalarla." />
          </ol>
          <p className="insayuda">¿No ves esa opción? Copia el enlace y pégalo en {nav}.</p>
        </>
      )}
      <div role="status">
        {copia === 'ok' && <p className="inscopiado"><Check size={16} strokeWidth={3} aria-hidden="true" />Enlace copiado</p>}
        {copia === 'fallo' && <p className="inscopiado" style={{ userSelect: 'all' }}>Cópialo tú: www.tengoracha.com</p>}
      </div>
    </>
  );
};

const PIE: React.CSSProperties = { paddingLeft: 20, paddingRight: 20, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 };

// ---------- La pantalla completa (una vez, después del onboarding) ----------
type Fase = 'ofrecer' | 'instalando' | 'lista' | 'abrela';

const Pantalla: React.FC<{ casoInicial: CasoInstalar; alCerrar: () => void }> = ({ casoInicial, alCerrar }) => {
  const { caso: casoVivo, instalar, decirAhoraNo, decirYaLaAgregue } = useInstalar();
  const [fase, setFase] = useState<Fase>('ofrecer');
  // Si Chrome entrega el botón mientras se ven los pasos del menú, se pasa al botón (y al revés no)
  const caso: CasoInstalar = casoInicial === 'android-menu' && casoVivo === 'android-boton' ? 'android-boton' : casoInicial;
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => { h1.current?.focus(); }, [fase]);

  const conBoton = caso === 'android-boton';
  const esIOS = caso === 'ios-nuevo' || caso === 'ios-viejo';
  const t = textosPantalla(caso);

  const alInstalar = async () => {
    setFase('instalando');
    const r = await instalar();
    if (r === 'instalada') setFase('lista');
    else { decirAhoraNo(); alCerrar(); }
  };
  const ahoraNo = () => { decirAhoraNo(); alCerrar(); };

  let titulo = t.titulo;
  let sub = t.sub;
  let cuerpo: React.ReactNode = null;
  let centro = false;
  let pie: React.ReactNode;

  if (fase === 'lista') {
    centro = true;
    titulo = 'Listo, ya está instalada';
    sub = 'Búscala en tu pantalla de inicio: es el ícono de la llama. Desde ahora, ábrela desde ahí.';
    pie = <button type="button" className="btnp full" style={{ margin: 0 }} onClick={alCerrar}>Ir a mi día</button>;
  } else if (fase === 'abrela') {
    centro = true;
    titulo = 'Ahora ábrela desde tu pantalla de inicio';
    sub = esIOS
      ? 'Busca el ícono de la llama. Te va a pedir tu correo otra vez: te llega un código nuevo. Tus hábitos están guardados.'
      : 'Busca el ícono de la llama. Desde ahora, ábrela desde ahí.';
    pie = (
      <>
        <button type="button" className="btnp full" style={{ margin: 0 }} onClick={() => { decirYaLaAgregue(); alCerrar(); }}>Entendido</button>
        <button type="button" className="link quiet center" onClick={() => setFase('ofrecer')}>No la encuentro</button>
      </>
    );
  } else if (conBoton) {
    centro = true;
    pie = fase === 'instalando'
      ? <button type="button" className="btnp full" style={{ margin: 0, opacity: 0.55 }} disabled>Instalando…</button>
      : (
        <>
          <button type="button" className="btnp full" style={{ margin: 0 }} onClick={alInstalar}>Instalar Racha</button>
          <button type="button" className="link quiet center" onClick={ahoraNo}>Ahora no</button>
        </>
      );
  } else {
    cuerpo = <PasosInstalar caso={caso} />;
    pie = (
      <>
        <button type="button" className="btnp full" style={{ margin: 0 }} onClick={() => setFase('abrela')}>Ya la agregué</button>
        <button type="button" className="link quiet center" onClick={ahoraNo}>Ahora no</button>
      </>
    );
  }

  return (
    <div className="onb insp fixed inset-0 z-[70] bg-bg flex flex-col h-dvh" role="dialog" aria-modal="true" aria-labelledby="ins-t">
      <div className="flex-1 overflow-y-auto">
        <div className={`obbody insw${centro ? ' centro' : ''}`}>
          {centro && <DibujoInicio ok={fase === 'lista'} />}
          <h1 className="cond obh" id="ins-t" ref={h1} tabIndex={-1} style={{ outline: 'none' }}>{titulo}</h1>
          <p className="inssub">{sub}</p>
          {cuerpo}
        </div>
      </div>
      <div className="obfoot" style={PIE}>{pie}</div>
    </div>
  );
};

/** Se monta cuando la persona ya entró, la nube cargó y el onboarding está cerrado. Decide una sola vez si sale. */
export const PantallaInstalar: React.FC = () => {
  const { caso, estado } = useInstalar();
  const [casoInicial, setCasoInicial] = useState<CasoInstalar | null>(() => (debeOfrecerPantalla(caso, estado) ? caso : null));
  if (!casoInicial) return null;
  return <Pantalla casoInicial={casoInicial} alCerrar={() => setCasoInicial(null)} />;
};

// ---------- La hoja (desde el recordatorio, Perfil y el botón de la cabecera) ----------
export const HojaInstalar: React.FC = () => {
  const { caso, hoja, cerrarHojaInstalar, decirYaLaAgregue } = useInstalar();
  const { copia, copiar } = useCopiarEnlace();
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const volverA = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (hoja) {
      volverA.current = document.activeElement as HTMLElement | null;
      cerrarRef.current?.focus();
    } else {
      if (volverA.current && document.body.contains(volverA.current)) volverA.current.focus();
      volverA.current = null;
    }
  }, [hoja]);

  useEffect(() => {
    if (!hoja) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarHojaInstalar(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hoja, cerrarHojaInstalar]);

  if (!hoja || caso === 'instalada' || caso === 'computador') return null;

  const cambiar = hayQueCambiarDeNavegador(caso);
  const sub = cambiar
    ? textosPantalla(caso).sub
    : textosPantalla(caso === 'android-boton' ? 'android-menu' : caso).sub;

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={cerrarHojaInstalar} aria-hidden="true" />
      <div className="tsheet hcomp" role="dialog" aria-modal="true" aria-labelledby="insh">
        <div className="tgrab" aria-hidden="true" />
        <div className="tsheet-h">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-heading font-bold text-[24px] m-0" id="insh">Instalar Racha</h2>
            <p className="sub" style={{ marginTop: 4, fontSize: 13 }}>{sub}</p>
          </div>
          <button ref={cerrarRef} type="button" className="closeb" aria-label="Cerrar" onClick={cerrarHojaInstalar}><X size={16} /></button>
        </div>
        <div className="insw" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', paddingBottom: 16 }}>
          {cambiar ? <PasosCambiarNavegador caso={caso} copia={copia} /> : <PasosInstalar caso={caso} />}
        </div>
        <div className="t4pie" style={{ display: 'block' }}>
          {cambiar
            ? <button type="button" className="btnp full" style={{ margin: 0 }} onClick={copiar}><Copy size={18} aria-hidden="true" />Copiar el enlace</button>
            : <button type="button" className="btnp full" style={{ margin: 0 }} onClick={() => { decirYaLaAgregue(); cerrarHojaInstalar(); }}>Ya la agregué</button>}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ---------- "Ábrela en Safari / Chrome", antes de pedir el correo ----------
export const CambioNavegadorInstalar: React.FC<{ onSeguir: () => void }> = ({ onSeguir }) => {
  const { caso } = useInstalar();
  const { copia, copiar } = useCopiarEnlace();
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => { h1.current?.focus(); }, []);
  const t = textosPantalla(caso);
  return (
    <div className="onb insp fixed inset-0 z-[80] bg-bg flex flex-col h-dvh" role="dialog" aria-modal="true" aria-labelledby="ins-c">
      <div className="flex-1 overflow-y-auto">
        <div className="obbody insw">
          <h1 className="cond obh" id="ins-c" ref={h1} tabIndex={-1} style={{ outline: 'none' }}>{t.titulo}</h1>
          <p className="inssub">{t.sub}</p>
          <PasosCambiarNavegador caso={caso} copia={copia} />
        </div>
      </div>
      <div className="obfoot" style={PIE}>
        <button type="button" className="btnp full" style={{ margin: 0 }} onClick={copiar}><Copy size={18} aria-hidden="true" />Copiar el enlace</button>
        <button type="button" className="link quiet center" onClick={onSeguir}>Seguir aquí por ahora</button>
      </div>
    </div>
  );
};

// ---------- El recordatorio de Hoy ----------
export const RecordatorioInstalar: React.FC = () => {
  const { caso, instalar, abrirHojaInstalar, cerrarAvisoInstalar } = useInstalar();
  const alInstalar = () => {
    cerrarAvisoInstalar();
    if (caso === 'android-boton') void instalar();
    else abrirHojaInstalar();
  };
  return (
    <section className="insav" aria-label="Instalar Racha">
      <Smartphone size={18} aria-hidden="true" />
      <p>Instala Racha para abrirla de un toque</p>
      <button type="button" className="si" onClick={alInstalar}>Instalar</button>
      <button type="button" className="no" aria-label="No volver a mostrar el aviso de instalar" onClick={cerrarAvisoInstalar}><X size={16} aria-hidden="true" /></button>
    </section>
  );
};
