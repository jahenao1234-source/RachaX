// Instalar la app (design/maqueta-instalar.html, DESIGN.md › "Instalar la app").
// Aquí solo hay cálculos puros: qué celular y navegador es, qué pantalla toca y cuándo sale el recordatorio.
// Lo que toca el navegador (el evento de Chrome, localStorage) está en src/components/pwa/useInstalar.ts.

export type CasoInstalar =
  | 'instalada'        // se está usando desde la pantalla de inicio
  | 'computador'       // no se ofrece instalar
  | 'android-boton'    // Chrome, Edge, Samsung: hay botón "Instalar Racha"
  | 'android-menu'     // Firefox, o Chrome sin el aviso disponible: pasos por el menú
  | 'ios-nuevo'        // Safari 26 o más: ⋯ y luego Compartir
  | 'ios-viejo'        // Safari 18 o menos: Compartir abajo
  | 'ios-otro'         // Chrome, Firefox o Edge en iPhone: se manda a Safari
  | 'interno-ios'      // dentro de Instagram, Facebook, TikTok… en iPhone
  | 'interno-android'; // lo mismo en Android

export type EstadoInstalar = '' | 'ahora_no' | 'dijo_que_si' | 'instalada';
export type AvisoInstalar = '' | 'cerrado';

export const CLAVE_INSTALAR = 'racha_instalar';
export const CLAVE_INSTALAR_FECHA = 'racha_instalar_fecha';
export const CLAVE_INSTALAR_AVISO = 'racha_instalar_aviso';
/** Estas claves son de este navegador: no viajan a la nube y no se borran al salir de la cuenta. */
export const CLAVES_INSTALAR = [CLAVE_INSTALAR, CLAVE_INSTALAR_FECHA, CLAVE_INSTALAR_AVISO];
export const DIAS_PARA_RECORDAR = 3;

export interface EntornoInstalar {
  ua: string;
  /** navigator.maxTouchPoints (el iPad se presenta como Mac, pero tiene dedos) */
  toques: number;
  /** display-mode standalone o navigator.standalone */
  standalone: boolean;
  /** Chrome ya entregó el evento beforeinstallprompt */
  hayBoton: boolean;
}

export const esIOS = (ua: string, toques = 0): boolean =>
  /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && toques > 1);

export const esAndroid = (ua: string): boolean => /Android/.test(ua);

const APPS = /Instagram|FBAN|FBAV|FB_IAB|Messenger|musical_ly|BytedanceWebview|TikTok|Line\/|Snapchat|Twitter|LinkedInApp|Pinterest|GSA\//;
const OTRO_NAVEGADOR_IOS = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|Brave/;

/** Racha abierta dentro de otra app (Instagram, Facebook, TikTok…): desde ahí no se puede instalar. */
export const esNavegadorInterno = (ua: string, toques = 0): boolean => {
  if (APPS.test(ua)) return true;
  if (esIOS(ua, toques)) return !/Safari\//.test(ua) && !OTRO_NAVEGADOR_IOS.test(ua);
  if (esAndroid(ua)) return /; wv\)/.test(ua);
  return false;
};

/** El número grande de la versión de Safari ("Version/26.1" → 26). 0 si no se sabe. */
export const versionSafari = (ua: string): number => {
  const m = /Version\/(\d+)/.exec(ua);
  return m ? parseInt(m[1], 10) : 0;
};

export const casoInstalar = (e: EntornoInstalar): CasoInstalar => {
  if (e.standalone) return 'instalada';
  const ios = esIOS(e.ua, e.toques);
  const android = !ios && esAndroid(e.ua);
  if (!ios && !android) return 'computador';
  if (esNavegadorInterno(e.ua, e.toques)) return ios ? 'interno-ios' : 'interno-android';
  if (ios) {
    if (OTRO_NAVEGADOR_IOS.test(e.ua)) return 'ios-otro';
    return versionSafari(e.ua) >= 26 ? 'ios-nuevo' : 'ios-viejo';
  }
  return e.hayBoton ? 'android-boton' : 'android-menu';
};

/** ¿Este caso lleva pasos (o botón) para instalar aquí mismo? */
export const sePuedeInstalarAqui = (c: CasoInstalar): boolean =>
  c === 'android-boton' || c === 'android-menu' || c === 'ios-nuevo' || c === 'ios-viejo';

/** ¿Hay que mandarlo a Safari o a Chrome? (sale antes de pedir el correo) */
export const hayQueCambiarDeNavegador = (c: CasoInstalar): boolean =>
  c === 'interno-ios' || c === 'interno-android' || c === 'ios-otro';

export const navegadorParaInstalar = (c: CasoInstalar): 'Safari' | 'Chrome' =>
  c === 'interno-android' ? 'Chrome' : 'Safari';

export const estadoValido = (v: string | null | undefined): EstadoInstalar =>
  v === 'ahora_no' || v === 'dijo_que_si' || v === 'instalada' ? v : '';

/** Días entre dos fechas AAAA-MM-DD (por día del calendario, no por horas). Nunca negativo. */
export const diasEntre = (desde: string, hasta: string): number => {
  const a = Date.parse(desde + 'T12:00:00Z');
  const b = Date.parse(hasta + 'T12:00:00Z');
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
};

/** La pantalla completa: una sola vez, a quien todavía no ha respondido y puede instalar aquí. */
export const debeOfrecerPantalla = (c: CasoInstalar, estado: EstadoInstalar): boolean =>
  sePuedeInstalarAqui(c) && estado === '';

export interface DatosAviso {
  caso: CasoInstalar;
  estado: EstadoInstalar;
  /** día del "Ahora no" */
  fecha: string;
  aviso: AvisoInstalar;
  hoy: string;
  /** Hoy ya muestra "Volviste" o "Ayer quedó sin marcar": el recordatorio espera a otro día */
  hayOtroAviso?: boolean;
}

/** El recordatorio de Hoy: una vez, 3 días o más después de "Ahora no". Con la X no vuelve. */
export const debeMostrarAviso = (d: DatosAviso): boolean => {
  if (!sePuedeInstalarAqui(d.caso)) return false;
  if (d.estado !== 'ahora_no' || d.aviso === 'cerrado' || !d.fecha) return false;
  if (d.hayOtroAviso) return false;
  return diasEntre(d.fecha, d.hoy) >= DIAS_PARA_RECORDAR;
};

export type FilaPerfilInstalar = 'instalar' | 'instalada-navegador' | 'instalada' | 'nada';

/**
 * La fila de Perfil › Ayuda.
 * - 'instalada' solo cuando de verdad se está usando desde la pantalla de inicio.
 * - 'instalada-navegador': Android sabe que ya está instalada, pero se abrió en el navegador.
 * - "Ya la agregué" en iPhone no cambia la fila: la app no puede comprobarlo.
 */
export const filaPerfilInstalar = (c: CasoInstalar, estado: EstadoInstalar): FilaPerfilInstalar => {
  if (c === 'instalada') return 'instalada';
  if (c === 'computador') return 'nada';
  if (estado === 'instalada' && (c === 'android-menu' || c === 'interno-android')) return 'instalada-navegador';
  return 'instalar';
};

/** Chrome volvió a ofrecer instalar aunque decía "instalada": la desinstaló. Vuelve a "ahora no", sin recordatorio. */
export const alVolverElBoton = (estado: EstadoInstalar): EstadoInstalar =>
  estado === 'instalada' ? 'ahora_no' : estado;

export interface TextosInstalar { titulo: string; sub: string }

export const textosPantalla = (c: CasoInstalar): TextosInstalar => {
  switch (c) {
    case 'android-boton':
      return { titulo: 'Lleva Racha en tu pantalla de inicio', sub: 'Se abre de un toque y a pantalla completa, como cualquier app. Casi no ocupa espacio.' };
    case 'android-menu':
      return { titulo: 'Lleva Racha en tu pantalla de inicio', sub: 'En este navegador se hace desde el menú:' };
    case 'ios-nuevo':
    case 'ios-viejo':
      return { titulo: 'Lleva Racha en tu pantalla de inicio', sub: 'En iPhone se hace en 3 pasos:' };
    case 'interno-ios':
      return { titulo: 'Ábrela en Safari para instalarla', sub: 'Estás viendo Racha dentro de otra app, como Instagram o Facebook, y desde aquí no se puede instalar.' };
    case 'interno-android':
      return { titulo: 'Ábrela en Chrome para instalarla', sub: 'Estás viendo Racha dentro de otra app, como Instagram o Facebook, y desde aquí no se puede instalar.' };
    case 'ios-otro':
      return { titulo: 'Ábrela en Safari para instalarla', sub: 'En iPhone, Racha se instala desde Safari.' };
    default:
      return { titulo: '', sub: '' };
  }
};
