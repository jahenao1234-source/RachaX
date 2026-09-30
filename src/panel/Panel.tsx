import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Ban, Check, FileText, Flame, LogOut, Mail, MessageCircle, Plus, Scale, Search, X, ZoomIn } from 'lucide-react';
import {
  Compra, EstadoPago, ErrorPanel, PRECIO, Resumen, Cierre, FormaPago,
  cargarCompras, cargarResumen, esPdf, fechaCorta, fechaLarga, fechaMedia, guardarCierre, guardarNota,
  leerPlata, linkWhatsApp, plata, problemas, urlFoto,
  cargarCierres, agregarComprador, marcar
} from './panelDatos';
import { DOMINIOS } from '../components/cuenta/CuentaFlow';

// Panel de pagos, parte 1: caja, lista y detalle (design/maqueta-panel-pagos.html, DESIGN.md › Panel de pagos).
// Parte 2: "Sí pagó" / "Bloquear" / "Desbloquear" con Deshacer, Agregar comprador, cuadres anteriores y teclado.

export const Logo = () => (
  <span className="plogo"><Flame size={16} className="fill-current" aria-hidden="true" /></span>
);

const PESTANAS: { estado: EstadoPago | null; nombre: string; clave: keyof Resumen['conteos'] }[] = [
  { estado: 'revisar', nombre: 'Algo no cuadra', clave: 'revisar' },
  { estado: 'por_verificar', nombre: 'Se ven bien', clave: 'por_verificar' },
  { estado: 'verificado', nombre: 'Pagaron', clave: 'verificado' },
  { estado: 'bloqueado', nombre: 'Bloqueados', clave: 'bloqueado' },
  { estado: null, nombre: 'Todas', clave: 'todas' },
];

const nCompras = (n: number) => (n === 1 ? '1 compra' : `${n} compras`);

const Chip = ({ estado }: { estado: EstadoPago }) => {
  if (estado === 'revisar') return <span className="pchip cr"><AlertCircle size={13} strokeWidth={2.6} aria-hidden="true" />Algo no cuadra</span>;
  if (estado === 'verificado') return <span className="pchip cv">Pagó</span>;
  if (estado === 'bloqueado') return <span className="pchip cb"><Ban size={13} strokeWidth={2.6} aria-hidden="true" />Bloqueado</span>;
  return <span className="pchip cp">Se ve bien</span>;
};

/** Un dato marcado como "no cuadra": ícono y texto oculto, nunca solo color. */
const NoCuadra = ({ children }: { children: React.ReactNode }) => (
  <span className="difm">{children}<AlertCircle size={14} strokeWidth={2.4} aria-hidden="true" /><span className="sr">(no cuadra)</span></span>
);

const valorNoCuadra = (p: string[]) => p.some((x) => x.startsWith('Pagó '));

// ---------- Cuadra tu caja ----------

function Cuadre({ resumen, onGuardado, onCambio, onVerCuadres }: {
  resumen: Resumen;
  onGuardado: () => void;
  onCambio: () => void;
  onVerCuadres?: () => void; // parte 2
}) {
  const [texto, setTexto] = useState('');
  const [recibido, setRecibido] = useState<number | null>(null);
  const [aviso, setAviso] = useState<'' | 'cambio' | 'red'>('');
  const [guardando, setGuardando] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  const cuadrar = (e: React.FormEvent) => {
    e.preventDefault();
    const n = leerPlata(texto);
    setAviso('');
    if (n === null) { campo.current?.focus(); return; }
    setRecibido(n);
  };

  const guardar = async () => {
    if (recibido === null || guardando) return;
    setGuardando(true);
    try {
      await guardarCierre(resumen.ahora, recibido, resumen.compras);
      setTexto('');
      setRecibido(null);
      onGuardado();
    } catch (e) {
      setRecibido(null);
      if (e instanceof ErrorPanel && (e.codigo === 'cambio' || e.codigo === 'rango')) { setAviso('cambio'); onCambio(); }
      else setAviso('red');
    } finally {
      setGuardando(false);
    }
  };

  const dif = recibido === null ? 0 : recibido - resumen.esperado;
  const n = resumen.compras;
  const u = resumen.ultimo_cierre;
  const uDif = u ? u.recibido - u.esperado : 0;

  return (
    <section className="cuadre" aria-labelledby="cq">
      <div>
        <h2 id="cq">Cuadra tu caja</h2>
        <p className="desde">{resumen.desde ? `Desde tu último cuadre: ${fechaLarga(resumen.desde)}` : 'Todavía no has cuadrado.'}</p>
        <dl className="num">
          <div><dt>Compras que se ven bien</dt><dd>{n}</dd></div>
          <div><dt>Deberían haber llegado</dt><dd>{plata(resumen.esperado)}</dd></div>
        </dl>
        {resumen.por_revisar > 0 && (
          <p className="fuera"><AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />Las {resumen.por_revisar} de “Algo no cuadra” no entran hasta que las decidas.</p>
        )}
      </div>
      <form className="cform" onSubmit={cuadrar}>
        <div>
          <label htmlFor="cin">{resumen.desde ? `¿Cuánto te llegó por Racha desde el ${fechaMedia(resumen.desde)}?` : '¿Cuánto te llegó por Racha?'}</label>
          <input
            ref={campo} id="cin" className="cin" type="text" inputMode="numeric" autoComplete="off" placeholder="$0"
            aria-describedby="cin-ay" value={texto}
            onChange={(e) => { setTexto(e.target.value); setRecibido(null); }}
          />
          <p className="ay" id="cin-ay">Súmalo en tu app del banco. Cuenta solo las transferencias de Racha.</p>
        </div>
        <button type="submit" className="pbtnp" style={{ marginBottom: 22 }}>Cuadrar</button>
      </form>

      {recibido !== null && dif === 0 && (
        <div className="cres bien" role="status">
          <Check size={20} strokeWidth={2.6} aria-hidden="true" />
          <span><b>Cuadra.</b> Te llegaron {plata(recibido)} de {nCompras(n)}.</span>
          <span className="cacc">
            <button type="button" className="pbtnp" onClick={guardar} disabled={guardando}>
              {n === 1 ? 'Guardar y marcar la 1 como pagada' : `Guardar y marcar las ${n} como pagadas`}
            </button>
          </span>
        </div>
      )}
      {recibido !== null && dif < 0 && (
        <div className="cres mal" role="status">
          <AlertCircle size={20} strokeWidth={2.4} aria-hidden="true" />
          <span>
            Te llegaron <b>{plata(-dif)} menos</b> de lo que dicen los comprobantes
            {-dif % PRECIO === 0 ? ` (justo ${nCompras(-dif / PRECIO)})` : ''}. Abre tu banco y compara nombre, hora y referencia con la lista.
          </span>
          <span className="cacc">
            <button type="button" className="pbtn2" onClick={guardar} disabled={guardando}>Guardar con la diferencia</button>
            <small>Se anota que faltaron {plata(-dif)}. Ninguna compra queda como pagada.</small>
          </span>
        </div>
      )}
      {recibido !== null && dif > 0 && (
        <div className="cres mal" role="status">
          <AlertCircle size={20} strokeWidth={2.4} aria-hidden="true" />
          <span>Te llegaron <b>{plata(dif)} más</b> de lo esperado. Puede ser un pago que no mandó comprobante, o una venta a mano.</span>
          <span className="cacc">
            <button type="button" className="pbtn2" onClick={guardar} disabled={guardando}>Guardar con la diferencia</button>
          </span>
        </div>
      )}
      {aviso && (
        <div className="cres mal" role="alert">
          <AlertCircle size={20} strokeWidth={2.4} aria-hidden="true" />
          <span>{aviso === 'cambio' ? 'Llegó una compra nueva mientras cuadrabas. Revisa los números otra vez.' : 'No se pudo guardar. Revisa tu conexión.'}</span>
        </div>
      )}

      {u && (
        <p className="cant">
          {uDif === 0
            ? `Tu último cuadre cuadró (${plata(u.recibido)}, ${nCompras(u.compras)}). `
            : uDif < 0
              ? `Tu último cuadre no cuadró: faltaron ${plata(-uDif)}. `
              : `Tu último cuadre no cuadró: sobraron ${plata(uDif)}. `}
          <button type="button" className="lnk" onClick={onVerCuadres}>Ver cuadres anteriores</button>
        </p>
      )}
    </section>
  );
}

// ---------- Detalle de una compra ----------

const primerNombre = (c: Compra) => {
  const n = (c.nombre_pagador || '').trim().split(/\s+/)[0];
  return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : c.email;
};

const FORMAS = { transferencia: 'Transferencia', efectivo: 'Efectivo', regalo: 'Regalo' } as const;

function Detalle({ c, onNotaGuardada, acciones, marcando }: {
  c: Compra;
  onNotaGuardada: (email: string, nota: string | null) => void;
  acciones?: { siPago: () => void; bloquear: () => void; desbloquear: () => void }; // parte 2
  marcando?: boolean;
}) {
  const p = problemas(c);
  const manual = c.origen === 'manual';
  const pdf = esPdf(c.comprobante_path);
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoEstado, setFotoEstado] = useState<'cargando' | 'lista' | 'fallo' | 'sin' | 'pdf'>(
    !c.comprobante_path ? 'sin' : pdf ? 'pdf' : 'cargando',
  );
  const [grandeUrl, setGrandeUrl] = useState<string | null>(null);
  const grande = useRef<HTMLDialogElement>(null);
  const [nota, setNota] = useState(c.notas || '');
  const [guardada, setGuardada] = useState(false);
  const timerGuardada = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!c.comprobante_path || pdf) return;
    let vivo = true;
    urlFoto(c.comprobante_path).then((url) => {
      if (!vivo) return;
      setFoto(url);
      setFotoEstado(url ? 'lista' : 'fallo');
    });
    return () => { vivo = false; };
  }, [c.comprobante_path, pdf]);

  useEffect(() => () => clearTimeout(timerGuardada.current), []);

  // El enlace vence a los 2 minutos: se pide uno nuevo cada vez
  const verGrande = async () => {
    const url = await urlFoto(c.comprobante_path);
    if (!url) { setFotoEstado('fallo'); return; }
    if (pdf) { window.open(url, '_blank', 'noopener'); return; }
    setGrandeUrl(url);
    grande.current?.showModal();
  };

  const guardar = async () => {
    const limpia = nota.trim();
    if (limpia === (c.notas || '').trim()) return;
    try {
      await guardarNota(c.email, limpia);
      onNotaGuardada(c.email, limpia || null);
      setGuardada(true);
      clearTimeout(timerGuardada.current);
      timerGuardada.current = setTimeout(() => setGuardada(false), 2000);
    } catch { /* lo escrito se queda en el campo */ }
  };

  const fila = (etiqueta: string, valor: string | null | undefined, noCuadra = false) => (
    <>
      <dt>{etiqueta}</dt>
      {valor ? <dd>{noCuadra ? <NoCuadra>{valor}</NoCuadra> : valor}</dd> : <dd className="no">No se leyó</dd>}
    </>
  );
  const l = c.lectura_ia;
  const sinFoto = p.find((x) => x === 'No mandó foto' || x === 'No se pudo guardar la foto') || 'No mandó foto';
  const wa = linkWhatsApp(c.telefono);

  return (
    <section className="pdet" aria-labelledby="dt">
      <div className="dh">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id="dt">{c.email}</h2>
          <p>
            {c.nombre_pagador || 'Sin nombre'} · {manual
              ? 'lo agregaste '
              : c.otro_comprobante_en ? 'mandó el comprobante otra vez ' : 'mandó el comprobante '}
            <span className="nw">{fechaCorta(manual ? c.registrado_en : c.otro_comprobante_en || c.registrado_en)}</span>
          </p>
        </div>
        <Chip estado={c.estado_pago} />
      </div>

      {c.estado_pago === 'bloqueado' ? (
        <>
          <div className="dacc"><button type="button" className="pbtnp solo" onClick={acciones?.desbloquear} disabled={marcando}>Desbloquear</button></div>
          <p className="dayuda">Vuelve a entrar con sus datos de siempre y queda como pagado.</p>
        </>
      ) : c.estado_pago === 'verificado' ? (
        <div className="dacc"><button type="button" className="pbloq solo" onClick={acciones?.bloquear} disabled={marcando}><Ban size={16} aria-hidden="true" />Bloquear</button></div>
      ) : (
        <>
          <div className="dacc">
            <button type="button" className="pbtnp" onClick={acciones?.siPago} disabled={marcando}><Check size={16} strokeWidth={2.6} aria-hidden="true" />Sí pagó</button>
            <button type="button" className="pbloq" onClick={acciones?.bloquear} disabled={marcando}><Ban size={16} aria-hidden="true" />Bloquear</button>
          </div>
          <p className="dayuda">{primerNombre(c)} ya puede usar Racha. Si la plata te llegó, toca “Sí pagó”. Si no, “Bloquear” le quita la entrada; su progreso se guarda y lo puedes deshacer.</p>
        </>
      )}

      {c.otro_comprobante_en && c.estado_pago === 'bloqueado' && (
        <div className="dotro" role="note">
          <Mail size={16} aria-hidden="true" />
          <span><b>Mandó otro comprobante</b> después del bloqueo. Míralo y, si la plata te llegó, toca “Desbloquear”.</span>
        </div>
      )}

      {p.length > 0 && (
        <div className="fall" role="note">
          <h3>Lo que no cuadra</h3>
          <ul>{p.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}

      {manual ? (
        <div className="ia">
          <dl>
            <dt>Valor</dt><dd>{c.valor == null ? '—' : plata(c.valor)}</dd>
            <dt>Cómo pagó</dt><dd>{FORMAS[c.forma_pago] || c.forma_pago}</dd>
          </dl>
        </div>
      ) : (
        <>
          <div className={`foto${fotoEstado === 'sin' || fotoEstado === 'fallo' ? ' nada' : ''}`} aria-busy={fotoEstado === 'cargando'}>
            {fotoEstado === 'lista' && foto && (
              <>
                <img src={foto} alt={`Comprobante de ${c.email}`} />
                <button type="button" className="vg" onClick={verGrande}><ZoomIn size={16} aria-hidden="true" />Ver grande</button>
              </>
            )}
            {fotoEstado === 'pdf' && (
              <>
                <FileText size={40} aria-hidden="true" />
                <button type="button" className="vg" onClick={verGrande}><ZoomIn size={16} aria-hidden="true" />Ver grande</button>
              </>
            )}
            {fotoEstado === 'sin' && <span>{sinFoto}</span>}
            {fotoEstado === 'fallo' && (
              <>
                <span>No se pudo abrir la foto.</span>
                <button type="button" className="vg" onClick={verGrande}><ZoomIn size={16} aria-hidden="true" />Ver grande</button>
              </>
            )}
          </div>

          <div className="ia">
            <h3>Lo que leyó la IA</h3>
            <dl>
              {fila('Valor', l?.valor != null ? plata(l.valor) : null, valorNoCuadra(p))}
              {fila('Fecha del pago', c.fecha_pago ? fechaCorta(c.fecha_pago) : null, p.some((x) => x.startsWith('El comprobante es del') || x.startsWith('El comprobante tiene una fecha')))}
              {fila('Referencia', l?.referencia, !!c.referencia_repetida)}
              {fila('Le llegó a', l?.destinatario, p.some((x) => x.startsWith('La plata le llegó')))}
              {fila('Pagó', l?.pagador)}
              {fila('Banco', l?.banco)}
            </dl>
          </div>
        </>
      )}

      {c.telefono && (
        <div className="dtel">
          <span>{c.telefono}</span>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" />Escribirle por WhatsApp</a>}
        </div>
      )}

      <div className="dnota">
        <h3><label htmlFor="pnota">Nota (solo la ves tú)</label>{guardada && <span className="guardada" role="status">Guardada</span>}</h3>
        <textarea
          id="pnota" className="ta" rows={2} maxLength={500} value={nota}
          placeholder="Por ejemplo, “me escribió que pagó desde la cuenta de la mamá”"
          onChange={(e) => setNota(e.target.value)} onBlur={guardar}
        />
      </div>

      <dialog
        ref={grande} className="pgrande" aria-label={`Comprobante de ${c.email}`}
        onClick={(e) => { if (e.target === e.currentTarget) grande.current?.close(); }}
        onClose={() => setGrandeUrl(null)}
      >
        <button type="button" className="x" aria-label="Cerrar" onClick={() => grande.current?.close()}><X size={20} aria-hidden="true" /></button>
        {grandeUrl && <img src={grandeUrl} alt={`Comprobante de ${c.email}`} />}
      </dialog>
    </section>
  );
}

// ---------- El panel ----------

export default function Panel({ correo, salir }: { correo: string; salir: () => Promise<void> }) {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [errResumen, setErrResumen] = useState(false);
  // undefined hasta saber si hay de "Algo no cuadra" (se abre ahí si hay alguna)
  const [filtro, setFiltro] = useState<EstadoPago | null | undefined>(undefined);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [lista, setLista] = useState<Compra[]>([]);
  const [hayMas, setHayMas] = useState(false);
  const [estadoLista, setEstadoLista] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [sel, setSel] = useState<string | null>(null);
  const pedido = useRef(0);

  // Parte 2
  const [marcando, setMarcando] = useState(false);
  const [toast, setToast] = useState<{ id: number, email: string, estadoAnt: EstadoPago, text: string } | { id: number, isErr: true, text: string } | null>(null);
  const toastId = useRef(0);

  const mostrarToast = (t: typeof toast) => {
    setToast(t);
    setTimeout(() => {
      setToast(curr => curr?.id === t?.id ? null : curr);
    }, 6000);
  };

  // El foco pasa a la fila elegida DESPUÉS de dibujarla (ver el efecto sobre `sel`, más abajo)
  const enfocarTras = useRef(false);
  const enfocarElegida = () => { enfocarTras.current = true; };

  const ejecutarMarcar = async (c: Compra, nuevo: EstadoPago) => {
    if (marcando) return;
    setMarcando(true);
    try {
      const ant = await marcar(c.email, nuevo);

      const nn = c.nombre_pagador?.trim() ? c.nombre_pagador.trim() : c.email;
      let msg = '';
      if (nuevo === 'verificado') msg = ant === 'bloqueado' ? `Desbloqueaste a ${c.email}.` : `Marcaste a ${nn} como pagado.`;
      else if (nuevo === 'bloqueado') msg = `Bloqueaste a ${c.email}.`;

      mostrarToast({ id: ++toastId.current, email: c.email, estadoAnt: ant, text: msg });

      // Sale de la pestaña si su estado nuevo ya no es el de la pestaña (en "Todas" o buscando, se queda)
      if (filtro !== null && filtro !== undefined && !busqueda && nuevo !== filtro) {
        const idx = lista.findIndex((x) => x.email === c.email);
        const siguiente = lista[idx + 1]?.email ?? lista[idx - 1]?.email ?? null;
        setLista((l) => l.filter((x) => x.email !== c.email));
        setSel(siguiente);
        if (siguiente) enfocarElegida();
      } else {
        setLista((l) => l.map((x) => (x.email === c.email ? { ...x, estado_pago: nuevo, activo: nuevo !== 'bloqueado' } : x)));
      }
      recargarResumen();
    } catch {
      mostrarToast({ id: ++toastId.current, isErr: true, text: 'No se pudo guardar. Revisa tu conexión.' });
    } finally {
      setMarcando(false);
    }
  };

  const deshacer = async (email: string, estadoAnt: EstadoPago) => {
    setToast(null);
    try {
      await marcar(email, estadoAnt);
      recargarTodo();
      setSel(email);
    } catch {
      mostrarToast({ id: ++toastId.current, isErr: true, text: 'No se pudo guardar. Revisa tu conexión.' });
    }
  };

  const bloqModal = useRef<HTMLDialogElement>(null);
  const [bloqData, setBloqData] = useState<Compra | null>(null);

  const cuadresModal = useRef<HTMLDialogElement>(null);
  const [cuadres, setCuadres] = useState<Cierre[] | null>(null);
  const [errCuadres, setErrCuadres] = useState(false);

  const abrirCuadres = async () => {
    setCuadres(null);
    setErrCuadres(false);
    cuadresModal.current?.showModal();
    try {
      setCuadres(await cargarCierres());
    } catch {
      setErrCuadres(true);
    }
  };

  const addModal = useRef<HTMLDialogElement>(null);
  const [addCorreo, setAddCorreo] = useState('');
  const [addForma, setAddForma] = useState<FormaPago>('transferencia');
  const [addValor, setAddValor] = useState('37.900');
  const [addNota, setAddNota] = useState('');
  const [addErr, setAddErr] = useState('');
  const [addGuardando, setAddGuardando] = useState(false);

  const limpioAdd = addCorreo.trim().toLowerCase();
  const addDominio = limpioAdd.split('@')[1];
  const addSug = addDominio && DOMINIOS[addDominio] ? `${limpioAdd.split('@')[0]}@${DOMINIOS[addDominio]}` : '';
  const addV = addForma === 'regalo' ? 0 : leerPlata(addValor);
  const addValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpioAdd) && addV !== null;

  const handleAdd = async () => {
    if (!addValid || addGuardando) return;
    setAddGuardando(true);
    setAddErr('');
    try {
      const r = await agregarComprador(limpioAdd, addV, addForma, addNota.trim());
      if (r.ok) {
        addModal.current?.close();
        setAddCorreo('');
        setAddForma('transferencia');
        setAddValor('37.900');
        setAddNota('');
        recargarTodo();
      } else if (r.error === 'ya_existe') {
        const p: Record<string, string> = { revisar: 'Algo no cuadra', por_verificar: 'Se ve bien', verificado: 'Pagó', bloqueado: 'Bloqueado' };
        setAddErr(`Ese correo ya está en el panel (${p[r.estado!] || r.estado}).`);
      }
    } catch {
      setAddErr('red');
    } finally {
      setAddGuardando(false);
    }
  };

  const handleAddKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
       e.preventDefault();
       const opts: FormaPago[] = ['transferencia', 'efectivo', 'regalo'];
       const i = opts.indexOf(addForma);
       const sig = e.key === 'ArrowRight' ? (i + 1) % 3 : (i + 2) % 3;
       setAddForma(opts[sig]);
       if (opts[sig] !== 'regalo' && addForma === 'regalo') setAddValor('37.900');
       (e.currentTarget.querySelector(`[data-forma="${opts[sig]}"]`) as HTMLButtonElement | null)?.focus();
    }
  };

  const recargarResumen = useCallback(async () => {
    try {
      const r = await cargarResumen();
      setResumen(r);
      setErrResumen(false);
      setFiltro((f) => (f === undefined ? (r.conteos.revisar > 0 ? 'revisar' : 'por_verificar') : f));
    } catch {
      setErrResumen(true);
    }
  }, []);

  // Al buscar, se busca en todas las compras (no solo en la pestaña)
  const cargarLista = useCallback(async (f: EstadoPago | null, b: string, saltar = 0) => {
    const n = ++pedido.current;
    if (!saltar) setEstadoLista('cargando');
    try {
      const r = await cargarCompras(b ? null : f, b, saltar);
      if (n !== pedido.current) return;
      setLista((antes) => (saltar ? [...antes, ...r] : r));
      setHayMas(r.length === 50);
      if (!saltar) setSel((s) => (s && r.some((c) => c.email === s) ? s : r[0]?.email ?? null));
      setEstadoLista('listo');
    } catch {
      if (n === pedido.current) setEstadoLista('error');
    }
  }, []);

  useEffect(() => { recargarResumen(); }, [recargarResumen]);
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);
  useEffect(() => {
    if (filtro !== undefined) cargarLista(filtro, busqueda);
  }, [filtro, busqueda, cargarLista]);

  useEffect(() => {
    if (!enfocarTras.current) return;
    enfocarTras.current = false;
    (document.querySelector('.panel button.co[aria-current="true"]') as HTMLButtonElement | null)?.focus();
  }, [sel, lista]);

  // Teclado: el manejador se renueva en cada render (ref) para no usar una pestaña o lista vieja
  const teclaRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    const oir = (e: KeyboardEvent) => teclaRef.current(e);
    window.addEventListener('keydown', oir);
    return () => window.removeEventListener('keydown', oir);
  }, []);
  {
    teclaRef.current = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase() || '';
      const contentEditable = (document.activeElement as HTMLElement)?.isContentEditable;
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || contentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;

      const elegidaAhora = sel ? lista.find(c => c.email === sel) : null;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (lista.length === 0) return;
        e.preventDefault();
        const idx = sel ? lista.findIndex((c) => c.email === sel) : -1;
        const sig = e.key === 'ArrowDown'
          ? (idx < lista.length - 1 ? idx + 1 : idx)
          : (idx > 0 ? idx - 1 : 0);
        const emailSig = lista[sig]?.email;
        if (emailSig && emailSig !== sel) {
          setSel(emailSig);
          enfocarElegida();
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (!elegidaAhora) return;
        if (elegidaAhora.estado_pago === 'revisar' || elegidaAhora.estado_pago === 'por_verificar') {
          e.preventDefault();
          ejecutarMarcar(elegidaAhora, 'verificado');
        }
      } else if (e.key === 'b' || e.key === 'B') {
        if (!elegidaAhora) return;
        if (elegidaAhora.estado_pago !== 'bloqueado') {
          e.preventDefault();
          setBloqData(elegidaAhora);
          bloqModal.current?.showModal();
        }
      }
    };
  }

  const recargarTodo = () => {
    recargarResumen();
    if (filtro !== undefined) cargarLista(filtro, busqueda);
  };

  const elegirPestana = (estado: EstadoPago | null) => {
    setTexto('');
    setBusqueda('');
    setFiltro(estado);
  };

  const notaGuardada = (email: string, nota: string | null) =>
    setLista((l) => l.map((c) => (c.email === email ? { ...c, notas: nota } : c)));

  const elegida = lista.find((c) => c.email === sel) || null;
  const pestana = PESTANAS.find((x) => x.estado === filtro);
  const sinNada = resumen?.conteos.todas === 0;

  const cuerpoLista = () => {
    if (estadoLista === 'error') {
      return (
        <div className="pvaciol" role="alert">
          No se pudo cargar. Revisa tu conexión.{' '}
          <button type="button" className="pbtn2" onClick={() => filtro !== undefined && cargarLista(filtro, busqueda)}>Reintentar</button>
        </div>
      );
    }
    if (estadoLista === 'cargando' && lista.length === 0) return <div className="pvaciol" aria-busy="true" />;
    if (lista.length === 0) {
      if (busqueda) return <div className="pvaciol">No hay compras con “{busqueda}”. Revisa cómo está escrito, o busca por teléfono o referencia.</div>;
      if (filtro === 'revisar') return <div className="pvaciol">Nada por revisar. Las compras que no cuadren aparecen aquí.</div>;
      return <div className="pvaciol">No hay compras aquí.</div>;
    }
    return (
      <>
        <div className="ptabla">
        <table>
          <caption className="sr">{busqueda ? `Compras con “${busqueda}”` : `Compras de la pestaña ${pestana?.nombre ?? ''}`}</caption>
          <thead><tr><th>Correo y nombre</th><th>Valor</th><th>Fecha del pago</th><th>Estado</th></tr></thead>
          <tbody>
            {lista.map((c) => {
              const p = problemas(c);
              const es = c.email === sel;
              return (
                <tr key={c.email} className={es ? 'sel' : ''}>
                  <td>
                    <button type="button" className="co" aria-current={es || undefined} onClick={() => setSel(c.email)}>{c.email}</button>
                    <span className="su">{c.nombre_pagador || 'Sin nombre'}{c.estado_pago === 'revisar' && p[0] ? ` · ${p[0]}` : ''}</span>
                  </td>
                  <td className="val">{c.valor == null ? '—' : valorNoCuadra(p) ? <NoCuadra>{plata(c.valor)}</NoCuadra> : plata(c.valor)}</td>
                  <td className="fe">{fechaCorta(c.origen === 'manual' ? c.registrado_en : c.fecha_pago)}</td>
                  <td><Chip estado={c.estado_pago} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {hayMas && (
          <div className="pmas">
            <button type="button" className="pbtn2" onClick={() => filtro !== undefined && cargarLista(filtro, busqueda, lista.length)}>Ver más</button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="panel">
      <header className="ptop">
        <Logo />
        <h1>Panel de pagos</h1>
        <div className="yo">
          <button type="button" className="pbtn2" onClick={() => { addModal.current?.showModal(); document.getElementById('ac-co')?.focus(); }}><Plus size={16} strokeWidth={2.4} aria-hidden="true" />Agregar comprador</button>
          <span>{correo}</span>
          <button type="button" className="pbtn2" onClick={salir}><LogOut size={16} aria-hidden="true" />Salir</button>
        </div>
      </header>

      <main className="pmain" aria-busy={!resumen && !errResumen}>
        {errResumen && (
          <div className="perr" role="alert">
            <span>No se pudo cargar. Revisa tu conexión.</span>
            <button type="button" className="pbtn2" onClick={recargarTodo}>Reintentar</button>
          </div>
        )}

        {resumen && <Cuadre resumen={resumen} onGuardado={recargarTodo} onCambio={recargarResumen} onVerCuadres={abrirCuadres} />}

        {resumen && sinNada && (
          <section className="plista">
            <div className="pvacio">
              <span className="pvi"><Scale size={24} aria-hidden="true" /></span>
              <h2>Aún no hay compras</h2>
              <p>Cuando alguien pague por WhatsApp, aparece aquí con la foto de su comprobante.</p>
            </div>
          </section>
        )}

        {resumen && !sinNada && (
          <div className="pcuerpo" style={elegida ? undefined : { gridTemplateColumns: 'minmax(0,1fr)' }}>
            <section className="plista" aria-labelledby="lt">
              <h2 id="lt" className="sr">Compras</h2>
              <div className="pfil">
                <div className="ptabs" role="group" aria-label="Filtrar por estado">
                  {PESTANAS.map((x) => (
                    <button key={x.nombre} type="button" aria-pressed={!busqueda && filtro === x.estado} onClick={() => elegirPestana(x.estado)}>
                      {x.nombre} <span className="n">{resumen.conteos[x.clave]}</span>
                    </button>
                  ))}
                </div>
                <label className="pbus">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="search" value={texto} onChange={(e) => setTexto(e.target.value)}
                    placeholder="Buscar por correo, nombre, teléfono o referencia"
                    aria-label="Buscar por correo, nombre, teléfono o referencia"
                  />
                </label>
              </div>
              {cuerpoLista()}
            </section>
            {elegida && <Detalle key={elegida.email} c={elegida} onNotaGuardada={notaGuardada} marcando={marcando} acciones={{
              siPago: () => ejecutarMarcar(elegida, 'verificado'),
              bloquear: () => { setBloqData(elegida); bloqModal.current?.showModal(); },
              desbloquear: () => ejecutarMarcar(elegida, 'verificado')
            }} />}
          </div>
        )}
      </main>

      {/* Sin la clase sr: el aviso tiene que verse (va fijo abajo al centro) */}
      <div role="status" aria-live="polite">
        {toast && (
          <div className="toastp">
            <span>{toast.text}</span>
            {(!('isErr' in toast) && toast.estadoAnt) && (
              <button type="button" onClick={() => deshacer(toast.email, toast.estadoAnt)}>Deshacer</button>
            )}
          </div>
        )}
      </div>

      <dialog ref={bloqModal} className="vent" role="alertdialog" aria-labelledby="bl-tit" aria-describedby="bl-desc" onClose={() => setBloqData(null)}>
        <h2 id="bl-tit">¿Bloquear a {bloqData?.email}?</h2>
        <p id="bl-desc" className="s">Ya no podrá entrar a Racha y verá “No pudimos confirmar tu pago”. Sus datos no se borran y lo puedes deshacer con “Desbloquear”.</p>
        <div className="pie">
          <button type="button" className="pbtnq" autoFocus onClick={() => bloqModal.current?.close()}>Cancelar</button>
          <button type="button" className="pbloq lleno" onClick={() => { bloqModal.current?.close(); if (bloqData) ejecutarMarcar(bloqData, 'bloqueado'); }}><Ban size={16} aria-hidden="true" />Bloquear</button>
        </div>
      </dialog>

      <dialog ref={cuadresModal} className="vent w560" aria-label="Cuadres anteriores" onClick={(e) => { if (e.target === e.currentTarget) cuadresModal.current?.close(); }}>
        <button type="button" className="x" aria-label="Cerrar" onClick={() => cuadresModal.current?.close()}><X size={20} aria-hidden="true" /></button>
        <h2>Cuadres anteriores</h2>
        {errCuadres && <p className="s">No se pudo cargar. Revisa tu conexión.</p>}
        {cuadres && cuadres.length === 0 && <p className="s">Todavía no has cuadrado.</p>}
        {cuadres && cuadres.length > 0 && (
          <div className="ptabla" style={{ marginTop: 16 }}>
            <table>
              <thead><tr><th>Hasta</th><th>Te llegó</th><th>Deberían haber llegado</th><th>Compras</th></tr></thead>
              <tbody>
                {cuadres.map((c) => {
                  const dif = c.recibido - c.esperado;
                  return (
                    <tr key={c.id}>
                      <td>{fechaMedia(c.hasta)}</td>
                      <td className="val">{plata(c.recibido)}
                        <span className="su">{dif === 0 ? 'Cuadró' : dif < 0 ? `Faltaron ${plata(-dif)}` : `Sobraron ${plata(dif)}`}</span>
                      </td>
                      <td className="val">{plata(c.esperado)}</td>
                      <td>{c.compras}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </dialog>

      <dialog ref={addModal} className="vent" aria-label="Agregar comprador" onClose={() => setAddErr('')} onClick={(e) => { if (e.target === e.currentTarget) addModal.current?.close(); }}>
        <button type="button" className="x" aria-label="Cerrar" onClick={() => addModal.current?.close()}><X size={20} aria-hidden="true" /></button>
        <h2>Agregar comprador</h2>
        <p className="s">Queda con acceso y como pagado. Dile que entre a tengoracha.com con este correo.</p>
        
        <label htmlFor="ac-co">Correo</label>
        <input id="ac-co" type="email" className="in" placeholder="correo@ejemplo.com" value={addCorreo} onChange={(e) => { setAddCorreo(e.target.value); setAddErr(''); }} disabled={addGuardando} />
        {addErr && addErr !== 'red' 
          ? <p className="nota" style={{color: 'var(--text)'}}>{addErr}</p>
          : addSug
            ? <button type="button" className="sug" onClick={() => setAddCorreo(addSug)}>¿Quisiste decir {addSug}?</button>
            : null}

        <label id="ac-fo-lbl">¿Cómo pagó?</label>
        <div className="seg" role="radiogroup" aria-labelledby="ac-fo-lbl" onKeyDown={handleAddKeydown}>
          {(['transferencia', 'efectivo', 'regalo'] as const).map(f => (
            <button key={f} type="button" role="radio" aria-checked={addForma === f} tabIndex={addForma === f ? 0 : -1} data-forma={f} onClick={() => { setAddForma(f); if (f !== 'regalo' && addForma === 'regalo') setAddValor('37.900'); }} disabled={addGuardando}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <p className="nota">Efectivo y regalo no entran al cuadre de la caja.</p>

        <label htmlFor="ac-va">Valor</label>
        <input id="ac-va" type="text" className="in" style={{fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20}} value={addForma === 'regalo' ? '$0' : addValor} onChange={(e) => setAddValor(e.target.value)} disabled={addForma === 'regalo' || addGuardando} />

        <label htmlFor="ac-no">Nota (opcional)</label>
        <input id="ac-no" type="text" className="in" placeholder="Por ejemplo, amiga del trabajo" value={addNota} onChange={(e) => setAddNota(e.target.value)} disabled={addGuardando} />

        <div className="pie">
          <button type="button" className="pbtnq" onClick={() => addModal.current?.close()} disabled={addGuardando}>Cancelar</button>
          <button type="button" className="pbtnp" onClick={handleAdd} disabled={!addValid || addGuardando}>Agregar</button>
        </div>
        
        {addErr === 'red' && <p className="nota" role="alert" style={{ marginTop: 10, textAlign: 'right', color: 'var(--text)' }}>No se pudo guardar. Revisa tu conexión.</p>}
      </dialog>
    </div>
  );
}
