import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Cloud, CloudCheck } from 'lucide-react';
import { useCuenta } from '../../store/CuentaContext';
import { useHabitStore } from '../../store/HabitContext';
import { supabase } from '../../lib/supabase';
import { LlamaDe, nombreLlama } from '../juego/Llama';
import { calcularPuntosTotales, calcularNivel, getTodayString } from '../../utils/habitUtils';

// Guarda la Racha en la nube (tabla estado + función guardar_estado de supabase/schema-4b.sql).
// Maqueta: design/maqueta-cuenta.html, teléfonos 5 a 10. Textos: DESIGN.md, "Tu cuenta".
const SYNC_USER = 'racha_sync_user';
const SYNC_VERSION = 'racha_sync_version';
const SYNC_PEND = 'racha_sync_pendientes';
const SYNC_TIME = 'racha_sync_time';
const MANTENER_AL_SALIR = ['racha_apariencia', 'racha_acento'];
const ESPERA_MS = 2000;

const leer = (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const escribir = (k: string, v: string | number) => { try { localStorage.setItem(k, String(v)); } catch {} };
const avisar = (subiendo = false) => window.dispatchEvent(new CustomEvent('racha_sync_changed', { detail: { subiendo } }));

type Fila = { datos: any; version: number; actualizado_en: string };
type Fase = 'cargando' | 'subirLocal' | 'confirmCero' | 'elegir' | 'confirmCelular' | 'lista';

// La huella del respaldo, sin la fecha de exportación (si no, "cambia" en cada instante)
const huellaDe = (r: any) => { const { exportedAt, ...resto } = r || {}; return JSON.stringify(resto); };

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const cuando = (fecha: string) => {
  if (!fecha) return '';
  const f = fecha.slice(0, 10);
  const hoy = getTodayString();
  const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
  const ayerStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;
  if (f === hoy) return 'usada hoy';
  if (f === ayerStr) return 'usada ayer';
  return `usada el ${parseInt(f.slice(8, 10))} de ${MESES[parseInt(f.slice(5, 7)) - 1]}`;
};

// Resumen comparable de una Racha (la local o la de la nube)
const resumir = (d: any, usada: string) => {
  const registros = d?.registros || [];
  const habitos = (d?.habitos || []).filter((h: any) => !h.archivado);
  const nivel = calcularNivel(calcularPuntosTotales(registros, habitos, d?.premios || [], d?.diasCongelados || []));
  const veces = registros.filter((r: any) => r.completado).length;
  return `Nivel ${nivel} · ${habitos.length} ${habitos.length === 1 ? 'hábito' : 'hábitos'} · ${veces} veces cumplidas · ${usada}`;
};

const descargar = (datos: any, nombre: string) => {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const Hoja: React.FC<{ titulo: string; texto: string; si: string; no: string; onSi: () => void; onNo: () => void }> = ({ titulo, texto, si, no, onSi, onNo }) => {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onNo(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onNo]);
  return createPortal(
    <div className="onb">
      <div className="scrim" style={{ zIndex: 95 }} onClick={onNo} />
      <section className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="ns-t" aria-describedby="ns-d" style={{ zIndex: 96, padding: '0 20px max(18px, env(safe-area-inset-bottom))' }}>
        <div className="grab" />
        <h2 className="font-heading font-bold text-text" id="ns-t" style={{ margin: '16px 0 0', fontSize: '24px' }}>{titulo}</h2>
        <p className="sub" id="ns-d" style={{ marginTop: '6px', fontSize: '15px' }}>{texto}</p>
        <div style={{ display: 'grid', gap: '4px', marginTop: '16px' }}>
          <button className="btnp full danger" style={{ margin: 0 }} onClick={onSi}>{si}</button>
          <button className="link quiet center" onClick={onNo}>{no}</button>
        </div>
      </section>
    </div>,
    document.body
  );
};

export const NubeSync: React.FC<{ onNubeLista: () => void }> = ({ onNubeLista }) => {
  const { estado } = useCuenta();
  const store = useHabitStore();
  const { habitos, registros, importarDatos, construirRespaldo, reiniciarTodo, completeOnboarding, openOnboarding,
    nivelActual, companera, etapaLlama, insigniasGanadas, llamasGanadas } = store;

  const [fase, setFase] = useState<Fase>('cargando');
  const [nube, setNube] = useState<Fila | null>(null);
  const [eleccion, setEleccion] = useState<'cuenta' | 'celular'>('cuenta');
  const [salirPendientes, setSalirPendientes] = useState(0);

  const respaldo = construirRespaldo();
  const huella = huellaDe(respaldo);

  // Referencias para usar lo más reciente dentro de funciones asíncronas
  const huellaRef = useRef(huella); huellaRef.current = huella;
  const respaldoRef = useRef(respaldo); respaldoRef.current = respaldo;
  const faseRef = useRef(fase); faseRef.current = fase;
  const userRef = useRef('');
  const verRef = useRef(parseInt(leer(SYNC_VERSION)) || 0);
  const pendRef = useRef(parseInt(leer(SYNC_PEND)) || 0);
  const vistaRef = useRef<string | null>(null);   // última huella contada como cambio (o la de partida)
  const subiendoRef = useRef(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decididoRef = useRef(false);

  const ponerVersion = (v: number) => { verRef.current = v; escribir(SYNC_VERSION, v); };
  const ponerPendientes = (n: number) => { pendRef.current = n; escribir(SYNC_PEND, n); avisar(); };
  const empezarDeNuevaBase = () => { vistaRef.current = null; };
  const quedarLista = () => { setFase('lista'); onNubeLista(); };

  const leerNube = async (): Promise<{ fila: Fila | null; error: boolean }> => {
    try {
      const { data, error } = await supabase.from('estado').select('datos, version, actualizado_en').eq('user_id', userRef.current).maybeSingle();
      if (error) return { fila: null, error: true };
      return { fila: (data as Fila) || null, error: false };
    } catch {
      return { fila: null, error: true };
    }
  };

  const aplicarNube = (fila: Fila) => {
    empezarDeNuevaBase(); // lo que se importa no es un cambio de la persona
    importarDatos(fila.datos);
    ponerVersion(fila.version);
    ponerPendientes(0);
    escribir(SYNC_TIME, fila.actualizado_en || new Date().toISOString());
    avisar();
  };

  // Sube la Racha. Devuelve true si quedó todo guardado.
  const subir = async (): Promise<boolean> => {
    if (subiendoRef.current) return false;
    if (!navigator.onLine) { avisar(); return false; }
    subiendoRef.current = true;
    avisar(true);
    const enviada = huellaRef.current;
    try {
      const { data, error } = await supabase.rpc('guardar_estado', { p_datos: respaldoRef.current, p_version_base: verRef.current });
      if (error) { avisar(); return false; }
      if (typeof data === 'number') {
        ponerVersion(data);
        escribir(SYNC_TIME, new Date().toISOString());
        if (huellaRef.current === enviada) { ponerPendientes(0); return true; }
        ponerPendientes(1); // hubo cambios mientras subía
        programar();
        return false;
      }
      // null: otro aparato guardó antes. La persona elige con cuál sigue.
      const { fila } = await leerNube();
      if (fila) { setNube(fila); setEleccion('cuenta'); setFase('elegir'); }
      return false;
    } finally {
      subiendoRef.current = false;
      avisar();
    }
  };

  const programar = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => { if (faseRef.current === 'lista') subir(); }, ESPERA_MS);
  };

  // 1) Al entrar: decidir qué hacer con la Racha del celular y la de la cuenta
  const decidir = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user.id;
    if (!uid) { quedarLista(); return; } // nunca dejar a la persona en la pantalla de carga
    userRef.current = uid;
    const mismoUsuario = leer(SYNC_USER) === uid;
    const localVacio = habitos.length === 0 && registros.length === 0;
    const { fila, error } = await leerNube();

    if (error) {
      // Sin conexión: se usa la app con lo del celular y se decide al volver la conexión
      quedarLista();
      return;
    }
    decididoRef.current = true;

    if (!fila) {
      escribir(SYNC_USER, uid);
      ponerVersion(0);
      if (localVacio) { ponerPendientes(0); quedarLista(); }
      else setFase('subirLocal');
      return;
    }
    if (localVacio) {
      escribir(SYNC_USER, uid);
      aplicarNube(fila);
      completeOnboarding();
      quedarLista();
      return;
    }
    if (mismoUsuario && pendRef.current === 0) {
      if (fila.version !== verRef.current) aplicarNube(fila);
      quedarLista();
      return;
    }
    if (mismoUsuario && fila.version === verRef.current) {
      quedarLista(); // hay cambios propios sin subir: se suben
      programar();
      return;
    }
    setNube(fila);
    setEleccion('cuenta');
    setFase('elegir');
  };

  useEffect(() => {
    if (estado === 'dentro') decidir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  // 2) Contar cambios y subirlos 2 s después del último
  useEffect(() => {
    if (fase !== 'lista') return;
    if (vistaRef.current === null) { vistaRef.current = huella; return; }
    if (huella === vistaRef.current) return;
    vistaRef.current = huella;
    ponerPendientes(pendRef.current + 1);
    if (decididoRef.current) programar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huella, fase]);

  // 3) Conexión, salir de la app y volver a ella
  useEffect(() => {
    const alConectar = () => {
      if (!decididoRef.current) { decidir(); return; }
      if (pendRef.current > 0) subir();
    };
    const alCambiarVista = async () => {
      if (faseRef.current !== 'lista' || !decididoRef.current) return;
      if (document.hidden) { if (pendRef.current > 0) subir(); return; }
      if (pendRef.current > 0 || !navigator.onLine) return;
      const { fila } = await leerNube();
      if (fila && fila.version > verRef.current) aplicarNube(fila);
    };
    const alOcultar = () => { if (pendRef.current > 0 && decididoRef.current) subir(); };
    window.addEventListener('online', alConectar);
    document.addEventListener('visibilitychange', alCambiarVista);
    window.addEventListener('pagehide', alOcultar);
    return () => {
      window.removeEventListener('online', alConectar);
      document.removeEventListener('visibilitychange', alCambiarVista);
      window.removeEventListener('pagehide', alOcultar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4) Salir de la cuenta (lo pide Perfil)
  const cerrarSesion = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    try {
      Object.keys(localStorage).forEach(k => { if (k.startsWith('racha_') && !MANTENER_AL_SALIR.includes(k)) localStorage.removeItem(k); });
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };
  useEffect(() => {
    const alPedirSalir = async () => {
      if (pendRef.current > 0) await subir();
      if (pendRef.current > 0) setSalirPendientes(pendRef.current);
      else cerrarSesion();
    };
    window.addEventListener('racha_sync_intentar_salir', alPedirSalir);
    return () => window.removeEventListener('racha_sync_intentar_salir', alPedirSalir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hojaSalir = salirPendientes > 0 && (
    <Hoja
      titulo={`Tienes ${salirPendientes} ${salirPendientes === 1 ? 'cambio' : 'cambios'} sin subir`}
      texto="Conéctate a internet antes de salir o se pierden."
      si="Salir de todas formas"
      no="Quedarme"
      onSi={cerrarSesion}
      onNo={() => setSalirPendientes(0)}
    />
  );

  const marco = (titulo: React.ReactNode, cuerpo: React.ReactNode, pie: React.ReactNode) => createPortal(
    <div className="onb fixed inset-0 z-[85] bg-bg flex flex-col h-dvh" role="dialog" aria-modal="true" aria-labelledby="ns-h">
      <div className="flex-1 overflow-y-auto"><div className="obbody" style={{ paddingTop: '34px' }}>{titulo}{cuerpo}</div></div>
      <div className="obfoot">{pie}</div>
    </div>,
    document.body
  );

  if (fase === 'cargando') {
    return createPortal(
      <div className="onb fixed inset-0 z-[85] bg-bg flex items-center justify-center" aria-busy="true">
        <span className="w-12 h-12 rounded-[12px] bg-brand text-ink flex items-center justify-center"><Flame size={26} className="fill-current" /></span>
      </div>,
      document.body
    );
  }

  if (fase === 'subirLocal' || fase === 'confirmCero') {
    const companeraId = companera || `etapa_${etapaLlama}`;
    const veces = registros.filter(r => r.completado).length;
    const nHab = habitos.filter(h => !h.archivado).length;
    const guardarla = async () => { ponerVersion(0); empezarDeNuevaBase(); ponerPendientes(1); quedarLista(); await subir(); };
    return (
      <>
        {marco(
          <h1 className="cond obh ctit" id="ns-h"><span className="ctiti" style={{ color: 'var(--comodin-text)' }} aria-hidden="true"><Cloud size={22} /></span>Encontramos tu Racha en este celular</h1>,
          <>
            <p className="sub obsub">¿La guardamos en tu cuenta? Así no la pierdes si cambias de celular y la ves también en el computador.</p>
            <div className="card nsres">
              <span aria-hidden="true"><LlamaDe id={companeraId} size={56} /></span>
              <ul className="nsresl">
                <li><b>{nHab}</b> {nHab === 1 ? 'hábito' : 'hábitos'}</li>
                <li><b>{veces}</b> veces cumplidas</li>
                <li>Nivel <b>{nivelActual}</b> · tu llama <b>{nombreLlama(companeraId)}</b></li>
                <li><b>{Object.keys(insigniasGanadas).length}</b> insignias y <b>{Object.keys(llamasGanadas).length}</b> llamas</li>
              </ul>
            </div>
          </>,
          <>
            <button className="btnp full" style={{ margin: 0 }} onClick={guardarla}>Guardarla en mi cuenta</button>
            <button className="link quiet center" onClick={() => setFase('confirmCero')}>Empezar de cero</button>
          </>
        )}
        {fase === 'confirmCero' && (
          <Hoja
            titulo="¿Empezar de cero?"
            texto={`Se borran tus ${nHab} ${nHab === 1 ? 'hábito' : 'hábitos'} y todo lo que llevas en este celular. No se puede deshacer.`}
            si="Sí, empezar de cero"
            no="Mejor la guardo"
            onSi={() => { reiniciarTodo(); ponerVersion(0); ponerPendientes(0); empezarDeNuevaBase(); openOnboarding(); quedarLista(); }}
            onNo={() => setFase('subirLocal')}
          />
        )}
      </>
    );
  }

  if ((fase === 'elegir' || fase === 'confirmCelular') && nube) {
    const ultimaLocal = registros.reduce((m, r) => (r.fecha > m ? r.fecha : m), '');
    const seguirConCuenta = () => {
      descargar(respaldoRef.current, `racha-respaldo-celular-${getTodayString()}.json`);
      aplicarNube(nube);
      escribir(SYNC_USER, userRef.current);
      decididoRef.current = true;
      quedarLista();
    };
    const seguirConCelular = async () => {
      descargar(nube.datos, `racha-respaldo-cuenta-${getTodayString()}.json`);
      escribir(SYNC_USER, userRef.current);
      ponerVersion(nube.version);
      decididoRef.current = true;
      empezarDeNuevaBase();
      ponerPendientes(1);
      quedarLista();
      await subir();
    };
    const nNube = (nube.datos?.habitos || []).filter((h: any) => !h.archivado).length;
    const nivelNube = calcularNivel(calcularPuntosTotales(nube.datos?.registros || [], (nube.datos?.habitos || []).filter((h: any) => !h.archivado), nube.datos?.premios || [], nube.datos?.diasCongelados || []));
    return (
      <>
        {marco(
          <h1 className="cond obh ctit" id="ns-h"><span className="ctiti" aria-hidden="true"><CloudCheck size={22} /></span>Tu cuenta ya tiene una Racha</h1>,
          <>
            <p className="sub obsub">Y en este celular hay otra distinta. ¿Con cuál sigues?</p>
            <fieldset className="nsopts">
              <legend className="sr-only">Con cuál sigues</legend>
              <label className={`nsopt${eleccion === 'cuenta' ? ' on' : ''}`}>
                <input type="radio" name="ns-eleccion" className="sr-only" checked={eleccion === 'cuenta'} onChange={() => setEleccion('cuenta')} />
                <span className="rdot" aria-hidden="true" />
                <span style={{ flex: 1, minWidth: 0 }}><b>La de tu cuenta</b><span className="sub">{resumir(nube.datos, cuando(nube.actualizado_en))}</span></span>
              </label>
              <label className={`nsopt${eleccion === 'celular' ? ' on' : ''}`}>
                <input type="radio" name="ns-eleccion" className="sr-only" checked={eleccion === 'celular'} onChange={() => setEleccion('celular')} />
                <span className="rdot" aria-hidden="true" />
                <span style={{ flex: 1, minWidth: 0 }}><b>La de este celular</b><span className="sub">{resumir(respaldoRef.current, cuando(ultimaLocal))}</span></span>
              </label>
            </fieldset>
            <p className="sub" style={{ marginTop: '12px' }}>La que no elijas se borra. Antes, te descargamos una copia de respaldo. Si tienes dudas, sigue con la de tu cuenta.</p>
          </>,
          <button className="btnp full" style={{ margin: 0 }} onClick={() => (eleccion === 'cuenta' ? seguirConCuenta() : setFase('confirmCelular'))}>
            {eleccion === 'cuenta' ? 'Seguir con la de tu cuenta' : 'Seguir con la de este celular'}
          </button>
        )}
        {fase === 'confirmCelular' && (
          <Hoja
            titulo="¿Seguir con la de este celular?"
            texto={`La de tu cuenta (Nivel ${nivelNube}, ${nNube} ${nNube === 1 ? 'hábito' : 'hábitos'}) se borra. Antes te descargamos una copia de respaldo.`}
            si="Sí, seguir con esta"
            no="Volver"
            onSi={seguirConCelular}
            onNo={() => setFase('elegir')}
          />
        )}
      </>
    );
  }

  return hojaSalir || null;
};
