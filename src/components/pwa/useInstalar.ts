// Instalar la app: lo que toca el navegador. Los cálculos están en src/utils/instalarUtils.ts.
// El evento de Chrome (beforeinstallprompt) se guarda en index.html, en window.__racha_bip,
// porque puede salir antes de que React arranque.
import { useCallback, useSyncExternalStore } from 'react';
import { getTodayString } from '../../utils/habitUtils';
import {
  AvisoInstalar, CasoInstalar, EstadoInstalar,
  CLAVE_INSTALAR, CLAVE_INSTALAR_AVISO, CLAVE_INSTALAR_FECHA,
  alVolverElBoton, casoInstalar, estadoValido,
} from '../../utils/instalarUtils';

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
declare global {
  interface Window { __racha_bip?: EventoInstalar | null }
}

const leer = (k: string): string => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const escribir = (k: string, v: string) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch {} };

const oyentes = new Set<() => void>();
const avisar = () => { foto = tomarFoto(); oyentes.forEach((f) => f()); };

const enStandalone = (): boolean => {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || window.matchMedia('(display-mode: minimal-ui)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
  } catch { return false; }
};

export interface FotoInstalar {
  caso: CasoInstalar;
  estado: EstadoInstalar;
  fecha: string;
  aviso: AvisoInstalar;
  /** la hoja "Instalar Racha" está abierta (desde Hoy, Perfil o la cabecera) */
  hoja: boolean;
}

let hojaAbierta = false;

const tomarFoto = (): FotoInstalar => ({
  hoja: hojaAbierta,
  caso: casoInstalar({
    ua: navigator.userAgent,
    toques: navigator.maxTouchPoints || 0,
    standalone: enStandalone(),
    hayBoton: !!window.__racha_bip,
  }),
  estado: estadoValido(leer(CLAVE_INSTALAR)),
  fecha: leer(CLAVE_INSTALAR_FECHA),
  aviso: leer(CLAVE_INSTALAR_AVISO) === 'cerrado' ? 'cerrado' : '',
});

let foto: FotoInstalar = tomarFoto();
let escuchando = false;

const escuchar = () => {
  if (escuchando) return;
  escuchando = true;
  // Chrome vuelve a ofrecer instalar: si decía "instalada", es que la quitó del celular
  window.addEventListener('racha:instalable', () => {
    const antes = estadoValido(leer(CLAVE_INSTALAR));
    const ahora = alVolverElBoton(antes);
    if (ahora !== antes) { escribir(CLAVE_INSTALAR, ahora); escribir(CLAVE_INSTALAR_AVISO, 'cerrado'); }
    avisar();
  });
  window.addEventListener('racha:instalada', avisar);
  try { window.matchMedia('(display-mode: standalone)').addEventListener('change', avisar); } catch {}
};

const suscribir = (f: () => void) => {
  escuchar();
  oyentes.add(f);
  return () => { oyentes.delete(f); };
};

export type ResultadoInstalar = 'instalada' | 'cancelo' | 'sin-boton';

/** Android con botón: abre el aviso del celular. Solo sirve una vez por evento. */
export const instalarAhora = async (): Promise<ResultadoInstalar> => {
  const ev = window.__racha_bip;
  if (!ev) return 'sin-boton';
  window.__racha_bip = null;
  try {
    await ev.prompt();
    const { outcome } = await ev.userChoice;
    if (outcome === 'accepted') {
      escribir(CLAVE_INSTALAR, 'instalada');
      avisar();
      return 'instalada';
    }
  } catch {}
  avisar();
  return 'cancelo';
};

/** "Ahora no" (o cancelar el aviso del celular): no se vuelve a ofrecer la pantalla; el recordatorio sale a los 3 días. */
export const decirAhoraNo = () => {
  if (estadoValido(leer(CLAVE_INSTALAR)) === '') {
    escribir(CLAVE_INSTALAR, 'ahora_no');
    escribir(CLAVE_INSTALAR_FECHA, getTodayString());
  }
  avisar();
};

/** "Ya la agregué" (iPhone o Android por el menú): no se insiste más, pero la app no puede comprobarlo. */
export const decirYaLaAgregue = () => {
  escribir(CLAVE_INSTALAR, 'dijo_que_si');
  escribir(CLAVE_INSTALAR_AVISO, 'cerrado');
  avisar();
};

/** La X del recordatorio de Hoy, o tocar "Instalar" en él: no vuelve a salir. */
export const cerrarAvisoInstalar = () => {
  escribir(CLAVE_INSTALAR_AVISO, 'cerrado');
  avisar();
};

export const abrirHojaInstalar = () => { hojaAbierta = true; avisar(); };
export const cerrarHojaInstalar = () => { hojaAbierta = false; avisar(); };

export const useInstalar = () => {
  const f = useSyncExternalStore(suscribir, () => foto);
  const instalar = useCallback(instalarAhora, []);
  return { ...f, instalar, decirAhoraNo, decirYaLaAgregue, cerrarAvisoInstalar, abrirHojaInstalar, cerrarHojaInstalar };
};
