// Arma el proyecto de HyperFrames de un anuncio en el estilo de las referencias del 10 de octubre (sin nombre todavía):
// voz en off que cuenta una historia, fotos quietas en blanco y negro con grano, UN solo color que brilla (el ámbar)
// puesto solo sobre el objeto que se nombra, garabatos de luz, letras crema pequeñas arriba que entran palabra por
// palabra y los nombres o frases clave en letra con serifa. Análisis: design/anuncios/referencias/oct10/analisis.md.
// Uso: node design/herramientas/hf-relato.mjs guion2 [--solo-html]
//      después, dentro de campana/guion2/hyperframes: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//      (antes: export HYPERFRAMES_BROWSER_PATH=… ; está en el LEEME)
//
// Cómo está hecho:
// - La voz ya viene sin pausas de relleno (voz-sin-pausas.py deja las de suspenso); cada cosa se amarra a una palabra.
//   Aquí se le da además un tratamiento "de cine" (graves, presencia, compresión y un poco de sala). VOZ_CINE=0 lo quita.
// - Cada foto se pasa a blanco y negro oscuro; aparte se saca la misma foto teñida de ámbar. En la página la ámbar va
//   encima con una máscara (óvalos) que deja ver solo el objeto, más una copia borrosa que hace el brillo.
// - La edición es dinámica: cada foto tiene varios encuadres (`marcos`); en la palabra clave la cámara se acerca de golpe.
// - El grano es una sola imagen de ruido más grande que el cuadro, que salta de sitio 15 veces por segundo.
// - En un fromTo, lo que deba quedar (la opacidad) va en los DOS lados (ver hf-lista.mjs). Mirar siempre cuadros del video.
// - La app es de verdad: la grabación en movimiento de la Racha de muestra (campana/guion3/app/celular.mp4).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

const NOMBRE = process.argv[2];
if (NOMBRE !== 'guion2') { console.log('Uso: node design/herramientas/hf-relato.mjs guion2 [--solo-html]'); process.exit(1); }
const BASE_DIR = path.join(C, 'guion2');
const VOZ = path.join(BASE_DIR, 'voz', 'ya-que-v2-juan-sin-pausas');
const P = path.join(BASE_DIR, 'hyperframes');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const PELO = 0.004;

// ---------- los tiempos, de la voz ----------
const palabras = JSON.parse(fs.readFileSync(VOZ + '.palabras.json', 'utf8')).palabras;
const limpia = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ]/g, '');
const NUMEROS = { dos: '2', tres: '3', uno: '1' };
const igual = (escrita, dicha) => { const a = limpia(escrita), b = limpia(dicha); return a === b || NUMEROS[a] === b || NUMEROS[b] === a; };
const ENTRA = 0.5;                       // la voz arranca medio segundo después del primer cuadro (mientras se encienden los vasos)
const T = (k) => ENTRA + palabras[k].i;
const F = (k) => ENTRA + palabras[k].f;
// Las palabras en las que se apoya todo: si la transcripción cambia, se para aquí y no más adelante
const W = { anio: 15, malteadas: 17, yHelado: 18, grupo: 20, una: 27, aOtras: 29, yOtras: 32, nada: 35, despues: 36, para: 40, losNo: 46, yaLlenos: 54, losSi: 57, hicieron: 63, comieronMas: 66, como: 69, pensaron: 75, ya1: 76, que1: 77, eso: 78, enIngles: 81, medio: 84, aqui: 86, elEfecto: 88, ya2: 90, que2: 91, yo: 92, conTodo: 96, fallaba: 98, miercoles: 100, ya3: 103, elLunes: 105, lunes: 106, esComo: 108, llanta: 112, pinchar2: 117, las: 118, otras: 119, tres: 120, el: 121, solo: 123, asi: 127, lasDos: 134, sigues: 137, noEl: 139, manana: 142, yoLlevo: 143, racha: 147, si: 154, te: 159, muestro: 161 };
const ESPERO = { anio: '1975', malteadas: 'malteadas', nada: 'nada', despues: 'despues', losNo: 'los', losSi: 'los', pensaron: 'pensaron', ya1: 'ya', que1: 'que', eso: 'eso', ya2: 'ya', que2: 'que', yo: 'yo', miercoles: 'miercoles', ya3: 'ya', lunes: 'lunes', llanta: 'llanta', tres: '3', solo: 'solo', asi: 'asi', sigues: 'sigues', manana: 'manana', racha: 'racha', si: 'si', muestro: 'muestro' };
for (const [k, v] of Object.entries(ESPERO)) if (limpia(palabras[W[k]].t) !== v) { console.log(`FALLA: la palabra ${W[k]} debía ser "${v}" y la voz dice "${palabras[W[k]].t}". Hay que revisar los números de W.`); process.exit(1); }
const FIN_VOZ = F(palabras.length - 1);
const TOTAL = FIN_VOZ + 2.2;
const C12 = T(W.yoLlevo) - 0.1;          // entra la app

// ---------- las fotos: encuadres, lo que brilla y los garabatos ----------
// Todo va en fracción de la foto (0 a 1). marco: { k: palabra en la que entra (sin k = al comienzo de la toma), z: qué tan cerca
// (1 = la foto llena el cuadro con un poco de sobra), fx/fy: el punto de la foto que queda en X/Y del video }.
// ovalos: [cx, cy, rx, ry] de lo que brilla en ámbar. aros: garabatos de luz { k, e: [cx, cy, rx, ry] }. cubre: la foto debe tapar todo el cuadro.
const TOMAS = [
  { id: 'malteadas', foto: '1-malteadas.jpg', de: null, ovalos: [[0.35, 0.68, 0.13, 0.21], [0.65, 0.68, 0.13, 0.21]], aros: [{ k: W.malteadas, e: [0.5, 0.715, 0.3, 0.195] }],
    marcos: [{ z: 0.86, fx: 0.5, fy: 0.68, Y: 1130 }, { k: W.anio, z: 1.02, fx: 0.5, fy: 0.68, Y: 1150 }, { k: W.malteadas, z: 0.92, fx: 0.5, fy: 0.68, Y: 1140 }] },
  { id: 'helado', foto: '2-helado.jpg', de: W.yHelado, ovalos: [[0.21, 0.6, 0.12, 0.085], [0.5, 0.6, 0.12, 0.085], [0.8, 0.6, 0.12, 0.085]],
    marcos: [{ z: 0.9, fx: 0.5, fy: 0.64, Y: 1080 }] },
  { id: 'grupo', foto: '8-grupo.jpg', de: W.grupo, cubre: true, ovalos: [[0.126, 0.565, 0.04, 0.05], [0.285, 0.44, 0.032, 0.04], [0.385, 0.39, 0.028, 0.036], [0.72, 0.44, 0.032, 0.04]], aros: [{ k: W.nada, e: [0.86, 0.655, 0.14, 0.05] }],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.46, Y: 940 }, { k: W.una, z: 2.0, fx: 0.16, fy: 0.55, Y: 1020 }, { k: W.aOtras, z: 1.75, fx: 0.34, fy: 0.42, Y: 1000 }, { k: W.yOtras, z: 1.5, fx: 0.8, fy: 0.62, Y: 1040 }] },
  { id: 'manos', foto: '9-manos-helado.jpg', de: W.despues, cubre: true, ovalos: [[0.5, 0.44, 0.14, 0.08], [0.91, 0.47, 0.12, 0.08], [0.78, 0.645, 0.14, 0.08]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.para, z: 1.5, fx: 0.56, fy: 0.5, Y: 1040 }] },
  { id: 'copa', foto: '3-copa-llena.jpg', de: W.losNo, ovalos: [[0.5, 0.535, 0.16, 0.075]],
    marcos: [{ z: 0.95, fx: 0.5, fy: 0.63, Y: 1100 }, { k: W.yaLlenos, z: 1.3, fx: 0.5, fy: 0.57, Y: 1080 }] },
  { id: 'espaldas', foto: '10-de-espaldas.jpg', de: W.losSi, cubre: true, ovalos: [[0.84, 0.58, 0.13, 0.06]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.hicieron, z: 1.5, fx: 0.66, fy: 0.55, Y: 1040 }] },
  { id: 'vacias', foto: '4-copas-vacias.jpg', de: W.comieronMas, ovalos: [[0.48, 0.68, 0.37, 0.185]], apaga: W.pensaron,
    marcos: [{ z: 1.12, fx: 0.48, fy: 0.68, Y: 1120 }, { k: W.como, z: 0.92, fx: 0.48, fy: 0.68, Y: 1130 }] },
  { id: 'cama', foto: '11-cama-celular.jpg', de: W.yo, cubre: true, ovalos: [[0.7, 0.375, 0.075, 0.05]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.conTodo, z: 1.65, fx: 0.62, fy: 0.38, Y: 1020 }] },
  { id: 'tenis', foto: '5-tenis.jpg', de: W.fallaba, ovalos: [[0.5, 0.79, 0.24, 0.08]],
    marcos: [{ z: 0.95, fx: 0.5, fy: 0.74, Y: 1250 }, { k: W.ya3, z: 1.1, fx: 0.5, fy: 0.76, Y: 1270 }] },
  { id: 'carro', foto: '12-carro-llanta.jpg', de: W.esComo, cubre: true, ovalos: [[0.41, 0.665, 0.09, 0.085]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.55, Y: 1000 }, { k: W.llanta, z: 1.75, fx: 0.43, fy: 0.66, Y: 1080 }, { k: W.pinchar2, z: 1.2, fx: 0.5, fy: 0.6, Y: 1020 }] },
  { id: 'vasos', foto: '7-vasos-vacios.jpg', de: W.asi, ovalos: [[0.34, 0.64, 0.13, 0.21], [0.67, 0.64, 0.13, 0.21]],
    marcos: [{ z: 0.86, fx: 0.5, fy: 0.66, Y: 1130 }, { k: W.lasDos, z: 1.05, fx: 0.5, fy: 0.66, Y: 1140 }] },
  { id: 'puerta', foto: '13-puerta-manana.jpg', de: W.sigues, cubre: true, ovalos: [[0.34, 0.34, 0.25, 0.31]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }, { k: W.noEl, z: 1.3, fx: 0.58, fy: 0.5, Y: 1000 }, { k: W.manana, z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }] },
];
// Cuándo termina cada toma: cuando empieza la siguiente, o cuando entra una parte hecha solo con letras
const FIN_TOMA = { vacias: T(W.ya1) - 0.3, tenis: T(W.esComo) - 0.08, carro: T(W.el) - 0.08, puerta: C12 };
TOMAS.forEach((t, i) => {
  t.ini = t.de === null ? 0 : T(t.de) - 0.08;
  const sig = TOMAS[i + 1];
  t.fin = FIN_TOMA[t.id] ?? (sig ? T(sig.de) - 0.08 : TOTAL);
});

// ---------- los efectos de sonido ----------
const VOLUMEN = { whoosh: -8, golpe: -6, pop: -9, caida: -6, toque: -9, logro: -9, boom: -2, subida: -7, neon: -8, diapositiva: -6, garabato: -6, latido: -3, brillo: -7, tachar: -8 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const sonidos = [];
// modo 'golpe': el punto más fuerte cae en t · 'ini': el sonido empieza en t · 'fin': el sonido termina en t
const suena = (s, t, { modo = 'golpe', db = 0 } = {}) => sonidos.push({ s, t: Math.max(0, t - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db });

// La app en movimiento
const APP = path.join(C, 'guion3', 'app');
const CEL = JSON.parse(fs.readFileSync(path.join(APP, 'celular.json'), 'utf8'));
const V_ACTIVAR = CEL.toques.activar - CEL.inicio, V_MARCA = 7.47;
const MS = Math.max(0, V_MARCA - (T(W.te) + 0.15 - C12));      // desde qué segundo de la grabación se muestra: la fila se marca en "te la muestro"
const ACTIVAR = C12 + (V_ACTIVAR - MS), MARCA = C12 + (V_MARCA - MS);

// ---------- 1. voz, fotos, grano y letras ----------
const W0 = 1536, H0 = 2730;              // la foto, en su tamaño (se recorta a 9:16)
if (!process.argv.includes('--solo-html')) {
  const medida = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', VOZ + '.mp3', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const lufs = Number(medida.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
  const sube = `volume=${(-20.3 - lufs).toFixed(2)}dB`;
  // La voz limpia (por si acaso) y la voz "de cine": más cuerpo abajo, menos caja, más presencia y aire, comprimida, y una sala corta por debajo
  ff(['-i', VOZ + '.mp3', '-vn', '-af', `${sube},alimiter=limit=0.89,apad=pad_dur=0.5`, '-ar', '48000', '-ac', '2', path.join(A, 'voz-limpia.wav')]);
  if (process.env.VOZ_CINE === '0') fs.copyFileSync(path.join(A, 'voz-limpia.wav'), path.join(A, 'voz.wav'));
  else {
    const sala = path.join(A, 'sala.wav');   // la respuesta de una sala: ruido que se apaga en 1,1 s
    ff(['-f', 'lavfi', '-i', 'anoisesrc=d=1.1:c=white:a=0.6:s=11', '-af', 'highpass=f=250,lowpass=f=4200,afade=t=in:d=0.004,afade=t=out:st=0.02:d=1.08:curve=exp', '-ar', '48000', '-ac', '2', sala]);
    const cadena = `[0:a]${sube},highpass=f=65,equalizer=f=115:t=q:w=0.9:g=3.5,equalizer=f=320:t=q:w=1.1:g=-2.5,equalizer=f=3400:t=q:w=1.2:g=2.5,equalizer=f=9500:t=h:w=0.7:g=2,acompressor=threshold=-22dB:ratio=3.5:attack=6:release=140:makeup=2.5,asplit[seca][m];[m][1:a]afir=dry=0:wet=10,highpass=f=300,volume=-21dB[sala];[seca][sala]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89,apad=pad_dur=0.5[a]`;
    ff(['-i', VOZ + '.mp3', '-i', sala, '-filter_complex', cadena, '-map', '[a]', '-ar', '48000', '-ac', '2', path.join(A, 'voz-cruda.wav')]);
    // vuelve a quedar al volumen de los otros anuncios
    const m2 = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', path.join(A, 'voz-cruda.wav'), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const l2 = Number(m2.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
    ff(['-i', path.join(A, 'voz-cruda.wav'), '-af', `volume=${(-20.3 - l2).toFixed(2)}dB,alimiter=limit=0.89`, '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
    fs.unlinkSync(path.join(A, 'voz-cruda.wav'));
  }
  const CUADRO = `crop=${W0}:${H0}`;
  for (const t of TOMAS) {
    const origen = path.join(BASE_DIR, 'imagenes', t.foto);
    ff(['-i', origen, '-vf', `${CUADRO},hue=s=0,${t.cubre ? 'eq=brightness=-0.13:contrast=1.28:gamma=0.84' : 'eq=brightness=-0.05:contrast=1.16:gamma=0.92'}`, '-q:v', '3', path.join(A, `${t.id}-bn.jpg`)]);
    ff(['-i', origen, '-vf', `${CUADRO},hue=s=0,eq=brightness=${t.cubre ? 0.02 : 0.05}:contrast=1.45,colorchannelmixer=rr=1:gg=0.66:bb=0.2`, '-q:v', '3', path.join(A, `${t.id}-ambar.jpg`)]);
  }
  ff(['-f', 'lavfi', '-i', 'nullsrc=s=1480x2320,format=gray,geq=lum=random(1)*255,gblur=sigma=0.7,eq=contrast=1.6', '-frames:v', '1', '-q:v', '4', path.join(A, 'grano.jpg')]);
  fs.copyFileSync(path.join(APP, 'celular.mp4'), path.join(A, 'celular.mp4'));
}
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
        @font-face { font-family: "Serifa Racha"; font-weight: 400; src: local("Bodoni MT"), local("Bodoni MT Regular"), local("Georgia"); }`;
const AMBAR = '#FFB547', CREMA = '#F4E7C3';
const SERIFA = '"Serifa Racha", serif';

// ---------- 2. la cámara ----------
const ESC = 1296 / W0;                   // con z = 1 la foto se ve de 1296 px de ancho (un poco más que el cuadro)
const cam = (t, m, extra = 0) => {
  const s = m.z * (1 + extra) * ESC, X = m.X ?? 540;
  let x = X - m.fx * W0 * s, y = m.Y - m.fy * H0 * s;
  if (t.cubre) { x = Math.min(0, Math.max(1080 - W0 * s, x)); y = Math.min(0, Math.max(1920 - H0 * s, y)); }
  return `x: ${n(x)}, y: ${n(y)}, scale: ${n(s)}`;
};
const pasos = [];
const sacudida = (t, fuerza = 1) => pasos.push(
  `tl.to("#mundo", { x: ${n(-14 * fuerza)}, y: ${n(9 * fuerza)}, rotation: ${n(-0.5 * fuerza)}, duration: 0.04, ease: "none" }, ${n(t)});`,
  `tl.to("#mundo", { x: ${n(11 * fuerza)}, y: ${n(-7 * fuerza)}, rotation: ${n(0.4 * fuerza)}, duration: 0.05, ease: "none" }, ${n(t + 0.04)});`,
  `tl.to("#mundo", { x: ${n(-6 * fuerza)}, y: ${n(4 * fuerza)}, rotation: ${n(-0.2 * fuerza)}, duration: 0.05, ease: "none" }, ${n(t + 0.09)});`,
  `tl.to("#mundo", { x: 0, y: 0, rotation: 0, duration: 0.08, ease: "power2.out" }, ${n(t + 0.14)});`);
const destello = (t, fuerza = 0.16) => pasos.push(
  `tl.fromTo("#destello", { opacity: 0 }, { opacity: ${fuerza}, duration: 0.03, immediateRender: false }, ${n(t)});`,
  `tl.to("#destello", { opacity: 0, duration: 0.16, ease: "power2.out" }, ${n(t + 0.03)});`);

for (const t of TOMAS) {
  const s = `#t-${t.id}`;
  // entra y sale de un corte (la primera ya está puesta)
  if (t.ini > 0) { pasos.push(`tl.set("${s}", { autoAlpha: 1 }, ${n(t.ini - PELO)});`); suena('diapositiva', t.ini); }
  if (t.fin < TOTAL) pasos.push(`tl.set("${s}", { autoAlpha: 0 }, ${n(t.fin - PELO)});`);
  // los encuadres: la cámara se va acercando despacio y en la palabra clave se mete de golpe
  t.marcos.forEach((m, i) => {
    const desde = i === 0 ? t.ini : T(m.k) - 0.05, sig = t.marcos[i + 1], hasta = sig ? T(sig.k) - 0.05 : t.fin;
    if (i === 0) pasos.push(`tl.set("${s} .cam", { ${cam(t, m)} }, ${n(Math.max(0, desde - PELO))});`);
    else pasos.push(`tl.to("${s} .cam", { ${cam(t, m)}, duration: 0.2, ease: "power3.out" }, ${n(desde)});`);
    const arranca = i === 0 ? desde : desde + 0.2;
    if (hasta - arranca > 0.1) pasos.push(`tl.to("${s} .cam", { ${cam(t, m, 0.05)}, duration: ${n(hasta - arranca)}, ease: "none" }, ${n(arranca)});`);
  });
  // lo que brilla se enciende como un aviso de neón: parpadea y queda
  const e = t.ini + (t.ini === 0 ? 0.12 : 0.1);
  pasos.push(
    `tl.fromTo("${s} .amb", { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, ${n(e)});`,
    `tl.to("${s} .amb", { opacity: 0.2, duration: 0.04 }, ${n(e + 0.08)});`,
    `tl.to("${s} .amb", { opacity: 1, duration: 0.1 }, ${n(e + 0.15)});`);
  if (t.apaga) pasos.push(`tl.to("${s} .amb", { opacity: 0, duration: 0.5, ease: "power2.in" }, ${n(T(t.apaga) - 0.1)});`, `tl.to("${s} .bn", { opacity: 0.35, duration: 0.6, ease: "power2.in" }, ${n(T(t.apaga) - 0.1)});`);
  (t.aros ?? []).forEach((a, i) => { pasos.push(`tl.fromTo("${s} .aro${i}", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.5, ease: "power1.inOut", immediateRender: false }, ${n(T(a.k) - 0.05)});`); suena('garabato', T(a.k) - 0.08, { modo: 'ini' }); });
}
const garabato = ([cx, cy, rx, ry]) => Array.from({ length: 121 }, (_, i) => { const a = (i / 120) * (4 * Math.PI + 0.5) - 2.2, f = 1 + 0.045 * Math.sin(1.7 * a) + 0.05 * (i / 120); return `${i ? 'L' : 'M'}${(cx * W0 + rx * W0 * f * Math.cos(a)).toFixed(1)} ${(cy * H0 + ry * H0 * f * Math.sin(a) + 12 * Math.sin(2.3 * a)).toFixed(1)}`; }).join(' ');
const mascara = (t) => t.ovalos.map(([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, #000 55%, transparent 100%)`).join(', ');
const htmlTomas = TOMAS.map((t, i) => `        <div class="toma" id="t-${t.id}"${i === 0 ? ' style="opacity: 1; visibility: visible"' : ''} data-layout-allow-overflow>
          <div class="cam" data-layout-allow-overflow>
            <img class="bn" src="assets/${t.id}-bn.jpg" alt="" />
            <div class="amb" style="background-image: url('assets/${t.id}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>
            <div class="amb bri" style="background-image: url('assets/${t.id}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>${(t.aros ?? []).length ? `
            <svg class="gar" viewBox="0 0 ${W0} ${H0}">${t.aros.map((a, k) => `<path class="aro${k}" pathLength="1" d="${garabato(a.e)}" />`).join('')}</svg>` : ''}
          </div>
        </div>`).join('\n');

// ---------- 3. las letras pequeñas: las palabras de la voz, de a uno o dos renglones ----------
// "~palabra": la voz la dice pero aquí no se escribe (va en grande, en otra parte)
const BLOQUES = [
  ['no dices «el lunes empiezo»', 'por flojo.'], ['lo dices por algo que', 'se descubrió en ~1975'], ['con malteadas', 'y helado.'],
  ['a un grupo de personas', 'les dieron una malteada.'], ['a otras, dos.'], ['y a otras, nada.'],
  ['después les pusieron helado,'], ['para que comieran', 'el que quisieran.'],
  ['los que no estaban a dieta', 'comieron menos:'], ['ya estaban llenos.'],
  ['los que sí estaban a dieta', 'hicieron lo contrario:'], ['comieron más helado.'],
  ['como ya habían dañado la dieta,', 'pensaron:'], ['~ya ~qué'],
  ['eso tiene nombre.'], ['en inglés es', 'medio grosero;'], ['aquí sería ~el ~efecto ~ya ~qué'],
  ['yo hacía lo mismo', 'con todo.'], ['fallaba un miércoles', 'y decía:'], ['ya qué,', 'el lunes empiezo.'],
  ['es como pinchar una llanta'], ['y, de la rabia,', 'pinchar las otras tres.'],
  ['~el ~miércoles ~solo ~dañó ~el ~miércoles'],
  ['así que si hoy ya te tomaste', 'las dos malteadas,'], ['sigues mañana.'], ['no el lunes: ~mañana'],
  ['yo lo llevo en Racha,', 'una app que hicimos para eso.'], ['si quieres verla por dentro,', 'te la muestro.'],
];
let cuenta = 0;
const bloques = BLOQUES.map((renglones, b) => ({ id: `b${b}`, de: cuenta, renglones: renglones.map((r) => r.split(' ').map((tx) => {
  const oculta = tx.startsWith('~'), escrita = oculta ? tx.slice(1) : tx, k = cuenta++;
  if (!palabras[k] || !igual(escrita, palabras[k].t)) { console.log(`FALLA: en las letras, la palabra ${k} es "${escrita}" y la voz dice "${palabras[k]?.t}".`); process.exit(1); }
  return { tx: escrita, k, oculta };
})) }));
if (cuenta !== palabras.length) { console.log(`FALLA: las letras tienen ${cuenta} palabras y la voz ${palabras.length}.`); process.exit(1); }
const htmlBloques = bloques.filter((b) => b.renglones.flat().some((w) => !w.oculta)).map((b) => `        <div class="bl" id="${b.id}">
${b.renglones.map((r) => r.filter((w) => !w.oculta)).filter((r) => r.length).map((r) => `          <p class="r">${r.map((w) => `<span class="w" id="w${w.k}">${w.tx}</span>`).join(' ')}</p>`).join('\n')}
        </div>`).join('\n');
bloques.forEach((b, i) => {
  const visibles = b.renglones.flat().filter((w) => !w.oculta);
  visibles.forEach((w) => pasos.push(`tl.fromTo("#w${w.k}", { opacity: 0, filter: "blur(9px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power1.out", immediateRender: false }, ${n(Math.max(0, T(w.k) - 0.04))});`));
  const sig = bloques[i + 1];
  if (visibles.length) pasos.push(`tl.to("#${b.id}", { opacity: 0, filter: "blur(8px)", duration: 0.12, ease: "power1.in" }, ${n((sig ? T(sig.de) : TOTAL) - 0.16)});`);
});

// ---------- 4. lo que va en letra grande y los dibujos ----------
const aparece = (sel, t, { dur = 0.22, escala = 1.08, borroso = 14 } = {}) => pasos.push(`tl.fromTo("${sel}", { opacity: 0, filter: "blur(${borroso}px)", scale: ${escala} }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ${dur}, ease: "power2.out", immediateRender: false }, ${n(t)});`);
const seVa = (sel, t, dur = 0.12) => pasos.push(`tl.to("${sel}", { opacity: 0, duration: ${dur}, ease: "power1.in" }, ${n(t - dur)});`);

// (a) el gancho: "1975" aparece con los vasos y late cuando la voz lo dice
suena('neon', 0.06, { modo: 'ini' });
pasos.push(
  `tl.fromTo("#anio", { opacity: 0, filter: "blur(16px)", scale: 1.06 }, { opacity: 0.5, filter: "blur(0px)", scale: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, 0.3);`,
  `tl.to("#anio", { opacity: 1, scale: 1.14, duration: 0.14, ease: "power2.out" }, ${n(T(W.anio) - 0.02)});`,
  `tl.to("#anio", { scale: 1.04, duration: 0.5, ease: "power2.inOut" }, ${n(T(W.anio) + 0.14)});`);
suena('subida', T(W.anio) - 0.02, { modo: 'fin' }); suena('boom', T(W.anio)); sacudida(T(W.anio), 0.9); destello(T(W.anio));
seVa('#anio', T(W.yHelado) - 0.08, 0.1);
// (b) la historia: golpes secos en las palabras que cambian el encuadre
for (const k of [W.una, W.aOtras, W.yOtras]) suena('golpe', T(k) - 0.03, { db: -3 });
suena('golpe', T(W.yaLlenos) - 0.03, { db: -2 });
suena('subida', T(W.comieronMas) - 0.1, { modo: 'fin', db: -2 }); suena('boom', T(W.comieronMas) - 0.06, { db: -3 }); sacudida(T(W.comieronMas) - 0.06, 0.7); destello(T(W.comieronMas) - 0.08, 0.12);
// (c) "pensaron: ya qué": todo se apaga, dos latidos y las dos palabras solas en grande
suena('caida', T(W.pensaron) - 0.05, { modo: 'ini' });
suena('latido', T(W.ya1) - 0.62); suena('latido', T(W.ya1) - 0.3);
aparece('#yq-ya', T(W.ya1) - 0.03, { dur: 0.3, escala: 1.15, borroso: 20 }); aparece('#yq-que', T(W.que1) - 0.03, { dur: 0.16, escala: 1.25, borroso: 10 });
suena('boom', T(W.que1)); sacudida(T(W.que1), 1.2); destello(T(W.que1), 0.14);
seVa('#yaque', T(W.eso) - 0.06, 0.14);
// (d) el nombre: tarjeta sobre cuadrícula
pasos.push(`tl.set("#rejilla", { opacity: 1 }, ${n(T(W.eso) - 0.06 - PELO)});`);
suena('diapositiva', T(W.eso) - 0.06);
aparece('#ingles', T(W.enIngles) - 0.05, { dur: 0.25 });
pasos.push(`tl.fromTo("#tapa", { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.18, ease: "power3.out", immediateRender: false }, ${n(T(W.medio) - 0.03)});`); suena('tachar', T(W.medio) + 0.03);
pasos.push(`tl.to("#ingles", { y: -120, scale: 0.72, opacity: 0.45, duration: 0.3, ease: "power2.inOut" }, ${n(T(W.aqui) - 0.05)});`);
aparece('#ef-el', T(W.elEfecto) - 0.04); aparece('#ef-ya', T(W.ya2) - 0.03, { dur: 0.25, escala: 1.15, borroso: 18 }); aparece('#ef-que', T(W.que2) - 0.03, { dur: 0.15, escala: 1.25, borroso: 10 });
suena('subida', T(W.ya2), { modo: 'fin', db: -1 }); suena('boom', T(W.que2), { db: -1 }); sacudida(T(W.que2), 0.9); destello(T(W.que2), 0.12);
pasos.push(`tl.fromTo("#raya path", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.4, ease: "power1.inOut", immediateRender: false }, ${n(F(W.que2) + 0.02)});`); suena('garabato', F(W.que2), { modo: 'ini', db: -2 });
seVa('#tarjeta', T(W.yo) - 0.08, 0.12);
pasos.push(`tl.set("#rejilla", { opacity: 0 }, ${n(T(W.yo) - 0.08 - PELO)});`);
// (e) "yo hacía lo mismo": la semana. Lunes y martes se encienden, el miércoles queda vacío, "ya qué" tacha el resto y se encierra el otro lunes
suena('golpe', T(W.conTodo) - 0.03, { db: -2 });
aparece('#tira', T(W.fallaba) - 0.02, { dur: 0.2, escala: 1.04, borroso: 8 });
[0, 1].forEach((c, i) => { pasos.push(`tl.to("#tira .c${c}", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", boxShadow: "0 0 26px rgba(255,181,71,0.75)", duration: 0.1 }, ${n(T(W.fallaba) + 0.12 + i * 0.14)});`); suena('pop', T(W.fallaba) + 0.12 + i * 0.14); });
pasos.push(`tl.to("#tira .c2", { borderColor: "${CREMA}", scale: 1.18, duration: 0.1, yoyo: true, repeat: 1 }, ${n(T(W.miercoles))});`, `tl.fromTo("#tira .x2", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.14, ease: "power3.in", immediateRender: false }, ${n(T(W.miercoles) + 0.05)});`);
suena('golpe', T(W.miercoles) + 0.17, { db: -1 });
pasos.push(`tl.fromTo("#tacha path", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.45, ease: "power1.inOut", immediateRender: false }, ${n(T(W.ya3) - 0.02)});`, `tl.to("#tira .c3, #tira .c4, #tira .c5, #tira .c6", { opacity: 0.3, duration: 0.3 }, ${n(T(W.ya3) + 0.1)});`);
suena('garabato', T(W.ya3) - 0.04, { modo: 'ini' });
pasos.push(`tl.fromTo("#otro path", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.35, ease: "power1.inOut", immediateRender: false }, ${n(T(W.lunes) - 0.04)});`, `tl.to("#tira .c7", { borderColor: "${CREMA}", scale: 1.15, duration: 0.14 }, ${n(T(W.lunes))});`);
suena('golpe', T(W.lunes), { db: -3 });
seVa('#tira', T(W.esComo) - 0.08, 0.1); seVa('#tacha', T(W.esComo) - 0.08, 0.1); seVa('#otro', T(W.esComo) - 0.08, 0.1);
// (f) la llanta: golpe al acercarse y tres golpes en "las otras tres"
suena('boom', T(W.llanta) - 0.03, { db: -4 }); sacudida(T(W.llanta) - 0.03, 0.8);
[W.las, W.otras, W.tres].forEach((k, i) => { suena('golpe', T(k), { db: i }); sacudida(T(k), 0.45 + i * 0.15); });
// (g) el veredicto: "El miércoles solo dañó el miércoles", en grande, con la semana debajo
pasos.push(`tl.set("#rejilla", { opacity: 1 }, ${n(T(W.el) - 0.08 - PELO)});`, `tl.set("#rejilla", { opacity: 0 }, ${n(T(W.asi) - 0.08 - PELO)});`);
suena('diapositiva', T(W.el) - 0.08);
[W.el, W.el + 1, W.solo, W.solo + 1, W.solo + 2, W.solo + 3].forEach((k) => aparece(`#v${k}`, T(k) - 0.04, { dur: 0.18 }));
aparece('#tira2', T(W.el) - 0.02, { dur: 0.2, escala: 1.04, borroso: 8 });
pasos.push(`tl.fromTo("#tira2 .x2", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.14, ease: "power3.in", immediateRender: false }, ${n(T(W.el + 1) + 0.05)});`);
suena('boom', T(W.solo), { db: -3 }); sacudida(T(W.solo), 0.7);
[0, 1, 3, 4, 5, 6].forEach((c, i) => { pasos.push(`tl.to("#tira2 .c${c}", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", boxShadow: "0 0 26px rgba(255,181,71,0.75)", duration: 0.1 }, ${n(T(W.solo) + 0.18 + i * 0.09)});`); suena('pop', T(W.solo) + 0.18 + i * 0.09, { db: -1 }); });
seVa('#veredicto', T(W.asi) - 0.08, 0.1); seVa('#tira2', T(W.asi) - 0.08, 0.1);
// (h) "mañana", en grande, con la luz de la puerta
suena('golpe', T(W.lasDos) - 0.03, { db: -2 });
suena('brillo', T(W.sigues) + 0.25, { modo: 'fin' });
aparece('#manana', T(W.manana) - 0.04, { dur: 0.3, escala: 1.12, borroso: 18 });
suena('brillo', T(W.manana) + 0.1, { modo: 'fin', db: 2 }); suena('boom', T(W.manana), { db: -5 });
seVa('#manana', C12, 0.12);
// (i) la app
pasos.push(`tl.set("#rejilla", { opacity: 1 }, ${n(C12 - PELO)});`);
suena('whoosh', C12 + 0.05);
if (ACTIVAR > C12 + 0.2) suena('toque', ACTIVAR);
suena('logro', MARCA + 0.05);

// El grano salta de sitio 15 veces por segundo (posiciones fijas, para que el video salga igual cada vez)
let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < Math.ceil(TOTAL * 15); i++) pasos.push(`tl.set("#grano", { x: ${-Math.round(azar() * 380)}, y: ${-Math.round(azar() * 380)} }, ${n(i / 15)});`);

const dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const tira = (id, cuantos) => `          <div class="tira" id="${id}">
${Array.from({ length: cuantos }, (_, i) => `            <div class="dia"><span class="le">${dias[i % 7]}</span><span class="ce c${i}">${i === 2 ? '<svg class="x2" viewBox="0 0 40 40"><path d="M9 10 L31 31 M30 9 L10 30" /></svg>' : ''}</span></div>`).join('\n')}
          </div>`;
fs.writeFileSync(path.join(P, 'compositions', 'escena.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>${LETRAS}
        #root { position: absolute; inset: 0; overflow: hidden; background: #050506; }
        #mundo { position: absolute; inset: 0; transform-origin: 50% 50%; }
        #rejilla { position: absolute; inset: -40px; opacity: 0; background-color: #08080A; background-image: linear-gradient(rgba(244, 231, 195, 0.055) 2px, transparent 2px), linear-gradient(90deg, rgba(244, 231, 195, 0.055) 2px, transparent 2px); background-size: 116px 116px; }
        .toma { position: absolute; inset: 0; opacity: 0; visibility: hidden; }
        .cam { position: absolute; left: 0; top: 0; width: ${W0}px; height: ${H0}px; transform-origin: 0 0; }
        .cam .bn { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
        .amb { position: absolute; inset: 0; background-size: 100% 100%; opacity: 0; }
        .bri { filter: blur(30px) brightness(1.2) saturate(1.15); mix-blend-mode: screen; }
        .gar { position: absolute; inset: 0; width: ${W0}px; height: ${H0}px; overflow: visible; }
        .gar path, .trazo path { fill: none; stroke: ${CREMA}; stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; filter: drop-shadow(0 0 10px rgba(255, 214, 140, 0.9)) drop-shadow(0 0 26px rgba(255, 181, 71, 0.55)); }
        .vin { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 64% at 50% 54%, transparent 42%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.62) 0, rgba(0, 0, 0, 0) 560px), linear-gradient(0deg, rgba(0, 0, 0, 0.92) 0, rgba(0, 0, 0, 0) 470px), linear-gradient(90deg, #000 0, rgba(0, 0, 0, 0) 90px), linear-gradient(270deg, #000 0, rgba(0, 0, 0, 0) 90px); }
        #destello { position: absolute; inset: 0; background: #FFF3D6; opacity: 0; }
        #grano { position: absolute; left: 0; top: 0; width: 1480px; height: 2320px; background: url("assets/grano.jpg"); mix-blend-mode: overlay; opacity: 0.3; }
        .bl { position: absolute; left: 0; right: 0; top: 300px; display: flex; flex-direction: column; align-items: center; }
        .r { margin: 0; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; line-height: 1.12; letter-spacing: -0.025em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 3px rgba(255, 236, 200, 0.55), 0 0 18px rgba(255, 200, 120, 0.5), 0 2px 10px rgba(0, 0, 0, 0.9); }
        .w { display: inline-block; opacity: 0; }
        .ser { margin: 0; font-family: ${SERIFA}; font-weight: 400; line-height: 1; letter-spacing: -0.02em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 6px rgba(255, 236, 200, 0.6), 0 0 34px rgba(255, 190, 100, 0.55), 0 3px 14px rgba(0, 0, 0, 0.9); }
        .col { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; }
        .g { display: inline-block; opacity: 0; }
        #anio { position: absolute; left: 0; right: 0; top: 452px; text-align: center; font-size: 230px; opacity: 0; }
        #yaque { top: 690px; } #yaque .ser { font-size: 330px; }
        #tarjeta { top: 560px; }
        #ingles { position: relative; font-size: 84px; font-style: italic; opacity: 0; }
        #tapa { position: absolute; left: 31%; top: 16%; width: 44%; height: 74%; background: ${CREMA}; transform-origin: 0 50%; opacity: 0; box-shadow: 0 0 22px rgba(255, 200, 120, 0.6); }
        #tarjeta .chico { font-size: 120px; margin-top: 44px; } #tarjeta .grande { font-size: 290px; margin-top: 6px; }
        #raya { position: static; width: 760px; height: 60px; margin-top: 4px; overflow: visible; }
        #raya path { stroke: ${AMBAR}; stroke-width: 11; }
        .tira { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 20px; opacity: 0; }
        .dia { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .le { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 36px; color: rgba(244, 231, 195, 0.75); }
        .ce { position: relative; display: block; width: 96px; height: 96px; border-radius: 26px; border: 4px solid rgba(244, 231, 195, 0.4); background-color: rgba(0, 0, 0, 0.35); }
        .x2 { position: absolute; left: 14px; top: 14px; width: 60px; height: 60px; opacity: 0; } .x2 path { fill: none; stroke: ${CREMA}; stroke-width: 5; stroke-linecap: round; }
        #tira { top: 520px; } #tira2 { top: 860px; }
        .trazo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; }
        #veredicto { top: 410px; } #veredicto .ser { font-size: 108px; line-height: 1.12; }
        #manana { position: absolute; left: 0; right: 0; top: 1060px; text-align: center; font-size: 250px; opacity: 0; }
      </style>
      <div id="root" data-composition-id="escena" data-width="1080" data-height="1920">
        <div id="mundo" data-layout-allow-overflow>
          <div id="rejilla" data-layout-allow-overflow></div>
${htmlTomas}
          <div class="vin"></div>
${tira('tira', 8)}
          <svg class="trazo" id="tacha" viewBox="0 0 1080 1920"><path pathLength="1" d="M446 632 C 560 600, 700 660, 846 618 S 880 640, 870 628" /></svg>
          <svg class="trazo" id="otro" viewBox="0 0 1080 1920"><path pathLength="1" d="M990 566 C 1050 560, 1066 640, 1010 690 C 950 720, 884 690, 900 620 C 912 566, 980 552, 1030 590" /></svg>
          <div class="col" id="yaque"><p class="ser"><span class="g" id="yq-ya">ya</span> <span class="g" id="yq-que">qué</span></p></div>
          <div class="col" id="tarjeta">
            <p class="ser" id="ingles">what-the-hell effect<span id="tapa"></span></p>
            <p class="ser chico"><span class="g" id="ef-el">el efecto</span></p>
            <p class="ser grande"><span class="g" id="ef-ya">«ya</span> <span class="g" id="ef-que">qué»</span></p>
            <svg class="trazo" id="raya" viewBox="0 0 760 60"><path pathLength="1" d="M20 34 C 180 10, 380 52, 560 24 S 700 30, 742 22" /></svg>
          </div>
          <div class="col" id="veredicto">
            <p class="ser"><span class="g" id="v${W.el}">El</span> <span class="g" id="v${W.el + 1}">miércoles</span></p>
            <p class="ser"><span class="g" id="v${W.solo}">solo</span> <span class="g" id="v${W.solo + 1}">dañó</span> <span class="g" id="v${W.solo + 2}">el</span> <span class="g" id="v${W.solo + 3}">miércoles.</span></p>
          </div>
${tira('tira2', 7)}
          <p class="ser" id="anio">1975</p>
          <p class="ser" id="manana">mañana.</p>
        </div>
${htmlBloques}
        <div id="destello"></div>
        <div id="grano" data-layout-allow-overflow></div>
      </div>
      <script>
        (() => {
          const tl = gsap.timeline({ paused: true });
          ${pasos.join('\n          ')}
          window.__timelines["escena"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`, 'utf8');

// ---------- 5. la mezcla de los efectos ----------
{
  const SR = 48000, mezcla = new Float32Array(Math.ceil(TOTAL * SR) * 2);
  sonidos.forEach((ev) => {
    const b = fs.readFileSync(path.join(SON, ev.s + '.wav')), datos = b.subarray(b.indexOf('data') + 8), g = 10 ** (ev.db / 20) / 32768, en = Math.round(ev.t * SR) * 2, largo = datos.length / 2;
    for (let i = 0; i < largo && en + i < mezcla.length; i++) mezcla[en + i] += datos.readInt16LE(i * 2) * g;
  });
  const sal = Buffer.alloc(44 + mezcla.length * 2);
  sal.write('RIFF', 0); sal.writeUInt32LE(36 + mezcla.length * 2, 4); sal.write('WAVEfmt ', 8); sal.writeUInt32LE(16, 16); sal.writeUInt16LE(1, 20); sal.writeUInt16LE(2, 22);
  sal.writeUInt32LE(SR, 24); sal.writeUInt32LE(SR * 4, 28); sal.writeUInt16LE(4, 32); sal.writeUInt16LE(16, 34); sal.write('data', 36); sal.writeUInt32LE(mezcla.length * 2, 40);
  mezcla.forEach((v, i) => sal.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(A, 'efectos.wav'), sal);
  fs.writeFileSync(path.join(BASE_DIR, `${NOMBRE}-sonidos.txt`), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(12)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}

// ---------- 6. el archivo principal: la escena, el celular con la app, la pastilla y el sonido ----------
const PANT_W = 500, PANT_H = Math.round(500 * 1760 / 858), BORDE = 13;
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · ${NOMBRE} · El efecto ya qué</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      #halo { position: absolute; left: 90px; top: 520px; width: 900px; height: 1200px; z-index: 4; background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 181, 71, 0.34), rgba(255, 181, 71, 0) 70%); opacity: 0; }
      #cel { position: absolute; left: ${(1080 - PANT_W - 2 * BORDE) / 2}px; top: 560px; z-index: 5; width: ${PANT_W + 2 * BORDE}px; height: ${PANT_H + 2 * BORDE}px; padding: ${BORDE}px; border-radius: 66px; background: #24272D; box-shadow: 0 0 0 3px #0F1113, 0 0 60px rgba(255, 181, 71, 0.28); opacity: 0; visibility: hidden; }
      #cel-pantalla { position: relative; width: 100%; height: 100%; border-radius: 54px; overflow: hidden; background: #0F1113; }
      #cel-video { width: 100%; height: 100%; object-fit: cover; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1150px; z-index: 6; display: flex; justify-content: center; opacity: 0; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 40px; letter-spacing: -0.01em; color: #F4E7C3; background: #0F1113; border: 3px solid #FFB547; border-radius: 999px; padding: 16px 36px 20px; white-space: nowrap; box-shadow: 0 0 34px rgba(255, 181, 71, 0.4); }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="escena" class="clip" style="z-index: 1" data-composition-id="escena" data-composition-src="compositions/escena.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="0" data-width="1080" data-height="1920"></div>
      <div id="halo"></div>
      <div id="cel" data-layout-allow-overflow>
        <div id="cel-pantalla">
          <video id="cel-video" class="clip" src="assets/celular.mp4" playsinline muted data-start="${n(C12)}" data-duration="${n(TOTAL - C12)}" data-media-start="${n(MS)}" data-track-index="7"></video>
        </div>
      </div>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago</span></div>
      <audio id="voz" src="assets/voz.wav" data-start="${ENTRA}" data-duration="${n(FIN_VOZ - ENTRA + 0.4)}" data-media-start="0" data-track-index="3" data-volume="1"></audio>
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#cel", { autoAlpha: 0, y: 260, rotation: 5 }, { autoAlpha: 1, y: 0, rotation: -1.5, duration: 0.5, ease: "power3.out", immediateRender: false }, ${n(C12)});
      tl.fromTo("#halo", { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false }, ${n(C12 + 0.1)});
      tl.to("#cel", { rotation: 1, scale: 1.04, duration: ${n(TOTAL - C12 - 0.5)}, ease: "none" }, ${n(C12 + 0.5)});
      tl.fromTo("#pastilla", { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.6)", immediateRender: false }, ${n(T(W.te) - 0.1)});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`, 'utf8');

for (const f of ['hyperframes.json', 'package.json', 'meta.json']) {
  const de = path.join(C, 'guion1', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion1').join(`campana-${NOMBRE}`), 'utf8');
}
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s · ${TOMAS.length} fotos · ${sonidos.length} efectos.`);
console.log('Cortes: ' + TOMAS.map((t) => `${t.id} ${t.ini.toFixed(1)}`).join(' · '));
console.log(`"1975" ${T(W.anio).toFixed(2)} · "ya qué" ${T(W.ya1).toFixed(2)} · el nombre ${T(W.ya2).toFixed(2)} · la semana ${T(W.fallaba).toFixed(2)} · veredicto ${T(W.el).toFixed(2)} · "mañana" ${T(W.manana).toFixed(2)} · la app ${C12.toFixed(2)} (grabación desde su segundo ${MS.toFixed(2)}; fila marcada en ${MARCA.toFixed(2)}).`);
