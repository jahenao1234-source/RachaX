import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseListo } from '../lib/supabase';

export type CuentaEstado = 'cargando' | 'fuera' | 'sinCompra' | 'dentro';

interface CuentaContextType {
  estado: CuentaEstado;
  correo: string | null;
  enviarCodigo: (correo: string) => Promise<{ error: { code?: string; status?: number; message: string } | null }>;
  verificarCodigo: (correo: string, codigo: string) => Promise<{ error: { code?: string; status?: number; message: string } | null }>;
  salir: () => Promise<void>;
}

const CuentaContext = createContext<CuentaContextType | undefined>(undefined);
const COMPRA_OK = 'racha_compra_ok';

// Revisa si el correo compró. 'si' | 'no' | 'sinRed' (no se pudo preguntar)
const revisarCompra = async (email: string): Promise<'si' | 'no' | 'sinRed'> => {
  try {
    const { data, error } = await supabase
      .from('compradores')
      .select('activo')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) return 'sinRed';
    return data?.activo ? 'si' : 'no';
  } catch {
    return 'sinRed';
  }
};

export const CuentaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estado, setEstado] = useState<CuentaEstado>(supabaseListo ? 'cargando' : 'dentro');
  const [correo, setCorreo] = useState<string | null>(null);

  const decidir = async (email: string) => {
    const r = await revisarCompra(email);
    if (r === 'si') {
      try { localStorage.setItem(COMPRA_OK, email.toLowerCase()); } catch {}
      setEstado('dentro');
    } else if (r === 'no') {
      try { localStorage.removeItem(COMPRA_OK); } catch {}
      setEstado('sinCompra');
    } else {
      // Sin conexión: vale el último resultado bueno de este correo
      let ok = '';
      try { ok = localStorage.getItem(COMPRA_OK) || ''; } catch {}
      setEstado(ok === email.toLowerCase() ? 'dentro' : 'fuera');
    }
  };

  useEffect(() => {
    if (!supabaseListo) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user.email;
      if (!email) { setEstado('fuera'); return; }
      setCorreo(email);
      await decidir(email);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enviarCodigo = async (emailInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    return { error: error ? { code: (error as any).code, status: error.status, message: error.message } : null };
  };

  // Recibe el correo (y no lo toma del estado) porque la app puede recargarse mientras la persona busca el código
  const verificarCodigo = async (emailInput: string, codigo: string) => {
    const email = emailInput.trim().toLowerCase();
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });
    if (error) return { error: { code: (error as any).code, status: error.status, message: error.message } };
    setCorreo(email);
    await decidir(email);
    return { error: null };
  };

  const salir = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    try { localStorage.removeItem(COMPRA_OK); } catch {}
    setCorreo(null);
    setEstado('fuera');
  };

  return (
    <CuentaContext.Provider value={{ estado, correo, enviarCodigo, verificarCodigo, salir }}>
      {children}
    </CuentaContext.Provider>
  );
};

export const useCuenta = () => {
  const context = useContext(CuentaContext);
  if (context === undefined) {
    throw new Error('useCuenta debe usarse dentro de CuentaProvider');
  }
  return context;
};
