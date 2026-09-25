import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Flame, Mail, HelpCircle, AlertCircle } from 'lucide-react';
import { useCuenta } from '../../store/CuentaContext';
import { supabaseListo } from '../../lib/supabase';
import { SOPORTE_URL, VENTA_URL } from '../../lib/config';

// Maqueta aprobada: design/maqueta-cuenta.html (DESIGN.md, "Tu cuenta")
const PASO = 'racha_cuenta_paso';
const CORREO = 'racha_cuenta_correo';
const DOMINIOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmail.co': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com',
  'outlok.com': 'outlook.com', 'yaho.com': 'yahoo.com',
};
const ESPERA = 60;

const leer = (k: string) => { try { return sessionStorage.getItem(k) || ''; } catch { return ''; } };
const guardar = (k: string, v: string) => { try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k); } catch {} };

type Err = { code?: string; status?: number; message: string } | null;
const esLimite = (e: Err) => !!e && (e.status === 429 || /rate.?limit/i.test(e.code || e.message));
const esRed = (e: Err) => !!e && (!navigator.onLine || /fetch|network/i.test(e.message));

export const CuentaFlow: React.FC = () => {
  const { estado, correo, enviarCodigo, verificarCodigo, salir } = useCuenta();
  // Si la app se recarga mientras la persona busca el código, vuelve al mismo paso con el mismo correo
  const [paso, setPaso] = useState<'correo' | 'codigo'>(() => (leer(PASO) === 'codigo' && leer(CORREO) ? 'codigo' : 'correo'));
  const [email, setEmail] = useState(() => leer(CORREO));
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [espera, setEspera] = useState(0);
  const codigoRef = useRef<HTMLInputElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => { guardar(PASO, paso === 'codigo' ? 'codigo' : ''); }, [paso]);
  useEffect(() => { if (estado === 'dentro') { guardar(PASO, ''); guardar(CORREO, ''); } }, [estado]);
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);
  useEffect(() => { h1Ref.current?.focus(); }, [paso, estado]);

  if (!supabaseListo || estado === 'dentro') return null;

  if (estado === 'cargando') {
    return (
      <div className="onb fixed inset-0 z-[80] bg-bg flex items-center justify-center" aria-busy="true">
        <span className="w-12 h-12 rounded-[12px] bg-brand text-ink flex items-center justify-center"><Flame size={26} className="fill-current" /></span>
      </div>
    );
  }

  const limpio = email.trim().toLowerCase();
  const [usuario, dominio] = limpio.split('@');
  const sugerencia = dominio && DOMINIOS[dominio] ? `${usuario}@${DOMINIOS[dominio]}` : '';

  const enviar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (ocupado) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) { setError('A este correo le falta algo. Revisa la @ y el punto.'); return; }
    if (!navigator.onLine) { setError('Para entrar la primera vez necesitas internet.'); return; }
    setOcupado(true);
    setError('');
    const { error: err } = await enviarCodigo(limpio);
    setOcupado(false);
    if (err) {
      if (esLimite(err)) setError('Hiciste muchos intentos seguidos. Espera 5 minutos y vuelve a probar.');
      else if (esRed(err)) setError('Para entrar la primera vez necesitas internet.');
      else setError('No pudimos enviar el código. Intenta de nuevo en un momento.');
      return;
    }
    guardar(CORREO, limpio);
    setEmail(limpio);
    setCodigo('');
    setEspera(ESPERA);
    setPaso('codigo');
  };

  const verificar = async (valor: string) => {
    if (ocupado || valor.length !== 6) return;
    setOcupado(true);
    setError('');
    const { error: err } = await verificarCodigo(limpio, valor);
    setOcupado(false);
    if (err) {
      // Supabase responde igual a un código equivocado y a uno vencido: el caso común es el equivocado
      if (esLimite(err)) setError('Hiciste muchos intentos seguidos. Espera 5 minutos y vuelve a probar.');
      else if (esRed(err)) setError('Para entrar la primera vez necesitas internet.');
      else setError('Ese código no coincide. Revisa el último correo que te llegó.');
      setCodigo('');
      codigoRef.current?.focus();
    }
  };

  const alEscribirCodigo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCodigo(v);
    if (error) setError('');
    if (v.length === 6) verificar(v);
  };

  const cambiarCorreo = () => { setPaso('correo'); setError(''); setCodigo(''); };

  const marco = (atras: (() => void) | null, cuerpo: React.ReactNode, pie: React.ReactNode) => (
    <div className="onb fixed inset-0 z-[80] bg-bg flex flex-col h-dvh" role="dialog" aria-modal="true" aria-label="Entra a tu Racha">
      {atras && <div className="obtop"><button className="obback" onClick={atras} aria-label="Atrás"><ChevronLeft size={22} strokeWidth={2.2} /></button></div>}
      <div className="flex-1 overflow-y-auto"><div className="obbody" style={atras ? undefined : { paddingTop: '34px' }}>{cuerpo}</div></div>
      <div className="obfoot">{pie}</div>
    </div>
  );

  if (estado === 'sinCompra') {
    return marco(
      () => { salir(); cambiarCorreo(); },
      <>
        <h1 className="cond obh ctit" ref={h1Ref} tabIndex={-1} style={{ outline: 'none' }}><span className="ctiti warn" aria-hidden="true"><HelpCircle size={22} /></span>No encontramos tu compra</h1>
        <p className="sub obsub">Escribiste <b style={{ color: 'var(--text)' }}>{correo || limpio}</b>, pero no aparece ninguna compra de Racha con ese correo.</p>
        <ul className="clist">
          <li>Revisa que sea el mismo correo que usaste al pagar en Hotmart. Búscalo en el correo de confirmación de Hotmart.</li>
          <li>Si acabas de pagar, espera un par de minutos y vuelve a intentar.</li>
        </ul>
      </>,
      <>
        <button className="btnp full" style={{ margin: 0 }} onClick={() => { salir(); cambiarCorreo(); }}>Probar con otro correo</button>
        {SOPORTE_URL && <a className="link quiet center" href={SOPORTE_URL} target="_blank" rel="noopener noreferrer">Escribir a soporte</a>}
      </>
    );
  }

  if (paso === 'codigo') {
    return marco(
      cambiarCorreo,
      <>
        <h1 className="cond obh ctit" ref={h1Ref} tabIndex={-1} style={{ outline: 'none' }}><span className="ctiti" aria-hidden="true"><Mail size={22} /></span>Revisa tu correo</h1>
        <p className="sub obsub">Te enviamos un código de 6 dígitos a <b style={{ color: 'var(--text)' }}>{limpio}</b>. Puede tardar un minuto.</p>
        <button className="link" style={{ fontSize: '14px' }} onClick={cambiarCorreo}>¿No es tu correo? Cámbialo</button>
        <label className="lbl" htmlFor="cu-codigo" style={{ display: 'block', margin: '14px 0 8px' }}>Tu código</label>
        <div className={`otp${error ? ' bad' : ''}`}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={`otpd${i === codigo.length && !error ? ' cur' : ''}`} aria-hidden="true">{codigo[i] || ''}</span>
          ))}
          <input
            id="cu-codigo"
            ref={codigoRef}
            className="otpin"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={codigo}
            onChange={alEscribirCodigo}
            aria-invalid={!!error}
            aria-describedby={error ? 'cu-err' : 'cu-ayuda'}
            autoFocus
          />
        </div>
        {error
          ? <p id="cu-err" className="cerr" role="alert"><AlertCircle size={16} />{error}</p>
          : <p id="cu-ayuda" className="sub" style={{ marginTop: '10px' }}>Si no lo ves, mira en Spam o Promociones.</p>}
      </>,
      <>
        <button
          className={`btnp full${codigo.length === 6 && !ocupado ? '' : ' off'}`}
          style={{ margin: 0 }}
          aria-disabled={codigo.length !== 6 || ocupado}
          onClick={() => verificar(codigo)}
        >
          {ocupado ? 'Revisando…' : 'Entrar'}
        </button>
        {espera > 0
          ? <p className="sub" style={{ margin: 0, minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Reenviar el código en 0:{String(espera).padStart(2, '0')}</p>
          : <button className="link quiet center" aria-live="polite" onClick={() => enviar()}>Reenviar el código</button>}
      </>
    );
  }

  return marco(
    null,
    <form id="cu-form" onSubmit={enviar} noValidate>
      <div className="cmarca"><span className="w-8 h-8 rounded-[9px] bg-brand text-ink flex items-center justify-center" aria-hidden="true"><Flame size={18} className="fill-current" /></span><span className="font-heading font-bold text-text" style={{ fontSize: '24px' }}>Racha</span></div>
      <h1 className="cond obh" ref={h1Ref} tabIndex={-1} style={{ marginTop: '40px', outline: 'none' }}>Entra a tu Racha</h1>
      <p className="sub obsub">Te enviamos un código a tu correo para entrar. Sin contraseñas.</p>
      <label className="lbl" htmlFor="cu-correo" style={{ display: 'block', marginTop: '22px' }}>Correo de tu compra</label>
      <input
        id="cu-correo"
        className={`input${error ? ' bad' : ''}`}
        type="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="send"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
        aria-invalid={!!error}
        aria-describedby={error ? 'cu-err' : 'cu-ayuda'}
      />
      {error
        ? <p id="cu-err" className="cerr" role="alert"><AlertCircle size={16} />{error}</p>
        : sugerencia
          ? <button type="button" className="link" style={{ fontSize: '14px' }} onClick={() => setEmail(sugerencia)}>¿Quisiste decir {sugerencia}?</button>
          : <p id="cu-ayuda" className="sub" style={{ marginTop: '8px' }}>Es el que usaste al pagar en Hotmart.</p>}
    </form>,
    <>
      <button type="submit" form="cu-form" className="btnp full" style={{ margin: 0 }} aria-disabled={ocupado}>{ocupado ? 'Enviando…' : 'Enviarme el código'}</button>
      {VENTA_URL && <a className="link quiet center" href={VENTA_URL} target="_blank" rel="noopener noreferrer">¿Todavía no la tienes? Mira cómo conseguirla</a>}
    </>
  );
};
