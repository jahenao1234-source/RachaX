import React, { useEffect, useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { ThemeProvider } from '../store/ThemeContext';
import { CuentaProvider, useCuenta } from '../store/CuentaContext';
import { CuentaFlow } from '../components/cuenta/CuentaFlow';
import { esAdmin, ErrorPanel } from './panelDatos';
import Panel, { Logo } from './Panel';
import './panel.css';

// Panel de pagos: tengoracha.com/panel (design/maqueta-panel-pagos.html, DESIGN.md › Panel de pagos).
// Va aparte de la app: sin HabitProvider. La entrada es la misma de Tu cuenta, pero sin revisar compra
// (el dueño puede no ser comprador): con sesión, lo que decide es es_admin().

const Puerta = () => {
  const { estado, correo, salir } = useCuenta();
  const conSesion = estado === 'dentro' || estado === 'sinCompra' || estado === 'bloqueado';
  const [admin, setAdmin] = useState<'cargando' | 'si' | 'no' | 'error'>('cargando');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!conSesion) { setAdmin('cargando'); return; }
    // La entrada con código recuerda su paso; con sesión ya no hace falta
    try { sessionStorage.removeItem('racha_cuenta_paso'); sessionStorage.removeItem('racha_cuenta_correo'); } catch {}
    let vivo = true;
    setAdmin('cargando');
    esAdmin()
      .then((r) => vivo && setAdmin(r ? 'si' : 'no'))
      .catch((e) => vivo && setAdmin(e instanceof ErrorPanel && e.codigo === 'no_autorizado' ? 'no' : 'error'));
    return () => { vivo = false; };
  }, [conSesion, correo, intento]);

  if (!conSesion) return <CuentaFlow />;

  if (admin === 'si') return <Panel correo={correo || ''} salir={salir} />;

  return (
    <div className="panel">
      <header className="ptop">
        <Logo />
        <h1>Panel de pagos</h1>
        {admin !== 'cargando' && (
          <div className="yo">
            <span>{correo}</span>
            <button type="button" className="pbtn2" onClick={salir}><LogOut size={16} aria-hidden="true" />Salir</button>
          </div>
        )}
      </header>
      <main className="pmain" aria-busy={admin === 'cargando'}>
        {admin === 'no' && (
          <section className="plista">
            <div className="pvacio">
              <span className="pvi"><Lock size={24} aria-hidden="true" /></span>
              <h2>Esta página es solo para el dueño de Racha</h2>
              <p>Entraste como {correo}.</p>
              <p style={{ marginTop: 14 }}><a className="pbtn2" href="/">Volver a Racha</a></p>
            </div>
          </section>
        )}
        {admin === 'error' && (
          <div className="perr" role="alert">
            <span>No se pudo cargar. Revisa tu conexión.</span>
            <button type="button" className="pbtn2" onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default function PanelApp() {
  return (
    <ThemeProvider>
      <CuentaProvider>
        <Puerta />
      </CuentaProvider>
    </ThemeProvider>
  );
}
