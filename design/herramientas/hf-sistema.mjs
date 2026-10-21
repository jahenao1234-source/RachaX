// Video de producto 3, estilo rimu: "Un sistema" (21 oct de 2026; guion v4 aprobado por Johnatan: "ármalo así";
// gancho A "la meta que se apaga"). Todas las funciones de Racha, una por frase, con la app de verdad (muestra
// zz-demo-sistema.html: estudiar, tender la cama, anotar gastos y la tarea "Preparar un examen"; sin ejercicio ni leer).
// Una sola toma: cada escena sale de la anterior; nada quieto más de 1 s; la pantalla del celular se mueve siempre.
// Voz de Fernando (rimu3/voz/sistema-fernando-v1-limpia.mp3). El gancho va sin música; "Quick Cuts Groove" entra en
// "Racha" (9,02 s) con poner-musica.mjs.
// Uso: node design/herramientas/hf-sistema.mjs [--solo-html]   (PRUEBA=<segundos> arma solo el comienzo)
//      después check, snapshot y render dentro de campana/rimu3/hyperframes
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const BASE = path.join(C, 'rimu3');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const P = path.join(BASE, 'hyperframes'), A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(A, 'app')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const SOLO_HTML = process.argv.includes('--solo-html');

// ---------- la voz y el momento de cada palabra ----------
const VOZ = path.join(BASE, 'voz', 'sistema-fernando-v1-limpia.mp3');
const PAL = JSON.parse(fs.readFileSync(path.join(BASE, 'voz', 'sistema-fernando-v1-limpia.palabras.json'), 'utf8')).palabras;
const t = (i) => PAL[i].i;
const VOZ_DURA = 57.71;
const TOTAL = Number(process.env.PRUEBA || 59.2);
const AMB = '#FFB547', GRIS = '#5B6068', VIO = '#8E9BFF';

// ---------- 1. los archivos ----------
const APP = path.join(BASE, 'app');
const PANTALLAS = ['nuevo-0', 'nuevo-1', 'dif-hoja', 'comodines', 'tareas-lista', 'tarea-0', 'tarea-1', 'biblio-habitos', 'biblio-tareas', 'biblio-planes', 'semana-0', 'semana-1', 'prog-radar', 'L-hoy-0', 'L-hoy-1', 'L-dif-0', 'L-dif-1'];
if (!SOLO_HTML) {
  ff(['-i', VOZ, '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  for (const p of PANTALLAS) ff(['-i', path.join(APP, p + '.png'), '-vf', 'scale=1240:-2:flags=lanczos', '-q:v', '2', path.join(A, 'app', p + '.jpg')]);
  ff(['-i', path.join(APP, 'esc-hoy.png'), '-vf', 'scale=1600:-2:flags=lanczos', '-q:v', '2', path.join(A, 'app', 'esc-hoy.jpg')]);
  // el reloj de Foco: 24 fotos de 25:00 a 11:40, a 10 por segundo
  ff(['-framerate', '10', '-i', path.join(APP, 'foco-%02d.png'), '-vf', 'scale=1240:-2:flags=lanczos,tpad=stop_mode=clone:stop_duration=6,format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-g', '1', path.join(A, 'foco.mp4')]);
}
for (const [de, a] of [['barlow/files/barlow-latin-300-normal.woff2', 'barlow-300.woff2'], ['barlow/files/barlow-latin-600-normal.woff2', 'barlow-600.woff2'], ['barlow-condensed/files/barlow-condensed-latin-700-normal.woff2', 'barlowc-700.woff2']])
  fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', de), path.join(A, 'fuentes', a));
fs.copyFileSync(path.join(RAIZ, 'public', 'ventas', 'icono.svg'), path.join(A, 'icono.svg'));
fs.copyFileSync(path.join(AQUI, 'libs', 'gsap-3.14.2.min.js'), path.join(A, 'gsap.min.js'));

// ---------- 2. los efectos ----------
const SON = path.join(C, 'sonidos'), MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const VOLUMEN = { pop: -15, golpe: -12, whoosh: -13, boom: -8, subida: -15, latido: -13, toque: -14, logro: -16, relleno: -18, caida: -13 };
const sonidos = [];
const suena = (s, tt, { modo = 'golpe', db = 0 } = {}) => { if (tt < TOTAL) sonidos.push({ s, t: Math.max(0, tt - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db }); };

// ---------- 3. los íconos (Lucide, los mismos de la app) ----------
const ICON = {
  flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
  cubiertos: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  birrete: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  escudo: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  llama: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  equis: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  libro: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  flecha: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chulo: '<path d="M20 6 9 17l-5-5"/>',
};
const svg = (k, w = 1.8, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICON[k]}</svg>`;

// ---------- 4. las animaciones ----------
const pasos = [];
const tl = (s) => pasos.push(s);
const sinLlaves = (o) => o.trim().replace(/^\{|\}$/g, '').trim();
const de0 = (sel, desde, hasta, tt, dur = 0.3, ease = 'expo.out') => tl(`tl.fromTo(${JSON.stringify(sel)}, ${desde}, { ${sinLlaves(hasta)}, duration: ${dur}, ease: "${ease}", immediateRender: false }, ${n(tt)});`);
const a = (sel, props, tt, dur = 0.3, ease = 'power2.out') => tl(`tl.to(${JSON.stringify(sel)}, { ${sinLlaves(props)}, duration: ${dur}, ease: "${ease}" }, ${n(tt)});`);
const fija = (sel, props, tt) => tl(`tl.set(${JSON.stringify(sel)}, ${props}, ${n(tt)});`);
const late = (sel, tt, s = 1, k = 0.1) => tl(`tl.fromTo(${JSON.stringify(sel)}, { scale: ${s} }, { keyframes: { scale: [${s}, ${n(s * (1 + k))}, ${n(s * (1 - k * 0.3))}, ${s}] }, duration: 0.38, ease: "none", immediateRender: false }, ${n(tt)});`);
const tiembla = (sel, tt, f = 18) => tl(`tl.fromTo(${JSON.stringify(sel)}, { x: 0 }, { keyframes: { x: [0, -${f}, ${f * 0.8}, -${f * 0.5}, ${f * 0.25}, 0] }, duration: 0.4, ease: "none", immediateRender: false }, ${n(tt)});`);

// el celular: 620 × 1342 (390 × 844 de la app, ×1,59); la cámara mueve #cam (todo el celular) y #tel (acercamientos)
const TEL = { x: 230, y: 290, w: 620, h: 1342 };
let capa = 10;
const entra = (id, tt, desde = 'derecha') => {   // una pantalla nueva empuja a la anterior
  fija(`#${id}`, `{ zIndex: ${++capa}, opacity: 1 }`, tt);
  const x0 = desde === 'derecha' ? 640 : desde === 'izquierda' ? -640 : 0, y0 = desde === 'abajo' ? 1360 : 0;
  de0(`#${id}`, `{ x: ${x0}, y: ${y0} }`, '{ x: 0, y: 0 }', tt, 0.42, 'expo.out');
  suena('whoosh', tt + 0.02, { db: -4 });
};
const zoom = (ox, oy, s, tt, dur = 0.5, ease = 'expo.inOut') => { fija('#tel', `{ transformOrigin: "${ox}px ${oy}px" }`, tt - 0.001); a('#tel', `{ scale: ${s} }`, tt, dur, ease); };
let nDedo = 0;
const dedos = [];
const toque = (x, y, tt) => { const id = `dd${nDedo++}`; dedos.push(`<div class="dedo" id="${id}" style="left:${x}px;top:${y}px"></div>`); de0(`#${id}`, '{ opacity: 0, scale: 0.4 }', '{ opacity: 0.95, scale: 1 }', tt - 0.14, 0.14); a(`#${id}`, '{ opacity: 0, scale: 1.7 }', tt + 0.02, 0.3); suena('toque', tt); };
let nAro = 0;
const aros = [];
const aro = (x, y, w, h, tt, dur = 0.9) => { const id = `aro${nAro++}`; aros.push(`<div class="aro" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`); de0(`#${id}`, '{ opacity: 0, scale: 1.25 }', '{ opacity: 1, scale: 1 }', tt, 0.28, 'back.out(2)'); a(`#${id}`, '{ opacity: 0 }', tt + dur, 0.25); suena('pop', tt, { db: -2 }); };

fija(['#barf', '#tacha'], '{ scaleX: 0 }', 0);
// ===== Escena 1 · el gancho (0 a 4,5 s, sin música): la META con su barra que sube y se cae a cero =====
de0('#meta', '{ opacity: 0, scale: 1.6, filter: "blur(18px)" }', '{ opacity: 1, scale: 1.12, filter: "blur(0px)" }', 0, 0.4);
a('#meta', '{ scale: 1 }', 0.4, t(4) - 0.4, 'none');
de0('#barra', '{ opacity: 0, scaleX: 0.2 }', '{ opacity: 1, scaleX: 1 }', 0.18, 0.45);
suena('golpe', 0.06, { db: -1 });
// "arrancas con todas las ganas": la barra sube de golpe y la META salta
a('#barf', '{ scaleX: 0.55 }', t(4) - 0.04, 0.35, 'expo.out');
late('#meta', t(4) - 0.04, 1, 0.12);
suena('subida', t(4) + 0.3, { modo: 'fin', db: -3 });
a('#barf', '{ scaleX: 0.92 }', t(8) - 0.04, 0.3, 'expo.out');
a('#meta', '{ scale: 1.16, textShadow: "0 0 60px rgba(255,181,71,0.75)" }', t(8) - 0.04, 0.3, 'back.out(2)');
suena('golpe', t(8) + 0.04);
// "y a las 2 semanas": los días corren de 1 a 14 y la barra se vacía y se apaga
const T_DIAS = t(10) - 0.05;
for (let k = 0; k < 14; k++) { fija(`#d${k}`, '{ opacity: 1 }', T_DIAS + k * 0.055); if (k) fija(`#d${k - 1}`, '{ opacity: 0 }', T_DIAS + k * 0.055); }
de0('#dias', '{ opacity: 0, y: 40 }', '{ opacity: 1, y: 0 }', T_DIAS - 0.02, 0.2);
suena('relleno', T_DIAS, { db: 2 });
a('#barf', '{ scaleX: 0.12, backgroundColor: "#8A8F97" }', T_DIAS + 0.05, 0.78, 'power2.in');
a('#meta', '{ scale: 1, color: "#8A8F97", textShadow: "0 0 0px rgba(255,181,71,0)" }', T_DIAS + 0.1, 0.7);
// "ya la soltaste": la META se cae y todo tiembla
const T_SOLT = t(16) - 0.04;
a('#meta', '{ y: 150, rotation: 7, color: "' + GRIS + '" }', T_SOLT, 0.35, 'back.in(1.4)');
a('#barf', '{ scaleX: 0 }', T_SOLT, 0.25, 'power2.in');
tiembla(['#barra', '#dias'], T_SOLT + 0.1, 22);
suena('caida', T_SOLT + 0.25);
suena('latido', T_SOLT + 0.32, { db: -2 });

// ===== Escena 2 · una meta y un sistema (4,6 a 9 s): la META sube y se vuelve una bandera; el camino; los días =====
const T_BAN = t(17) - 0.05;
a('#meta', '{ y: -470, scale: 0.3, opacity: 0, filter: "blur(6px)" }', T_BAN, 0.38, 'power3.inOut');
a(['#barra', '#dias'], '{ y: 420, opacity: 0, filter: "blur(10px)" }', T_BAN, 0.3, 'power3.in');
de0('#ban', '{ opacity: 0, scale: 0.2, y: 120 }', '{ opacity: 1, scale: 1, y: 0 }', T_BAN + 0.18, 0.45, 'back.out(1.8)');
suena('whoosh', T_BAN);
// "a dónde quieres llegar": el camino punteado se dibuja hacia la bandera
fija('#camino', '{ opacity: 1 }', t(19));
tl(`tl.fromTo("#caminop", { strokeDashoffset: 1400 }, { strokeDashoffset: 0, duration: ${n(t(24) - t(19) + 0.05)}, ease: "power1.inOut", immediateRender: false }, ${n(t(19))});`);
a('#ban', '{ y: -12, rotation: -4 }', T_BAN + 0.64, t(24) - T_BAN - 0.8, 'sine.inOut');
const T_LLEGAR = t(24) - 0.02;
a('#ban', '{ color: "' + AMB + '", rotation: 0, y: 0 }', T_LLEGAR, 0.2);
late('#ban', T_LLEGAR, 1, 0.18);
tl(`tl.fromTo("#banaro", { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 2.4, duration: 0.7, ease: "power2.out", immediateRender: false }, ${n(T_LLEGAR)});`);
suena('golpe', T_LLEGAR + 0.04);
// "para cumplir ese objetivo": aparecen los escalones (días) sobre el camino
const ESC = [[420, 1390], [560, 1250], [430, 1110], [570, 970], [440, 830], [580, 690], [460, 550]];
ESC.forEach((_, k) => de0(`#e${k}`, '{ opacity: 0, scale: 0 }', '{ opacity: 1, scale: 1 }', t(26) - 0.04 + k * 0.1, 0.28, 'back.out(2.4)'));
suena('relleno', t(26), { db: 0 });
a('#escalera', '{ y: -40 }', t(26), t(31) - t(26), 'sine.inOut');
// "necesitas un sistema": SISTEMA cae de golpe y los escalones se encienden uno tras otro
const T_SIS = t(31) - 0.03;
de0('#sis', '{ opacity: 0, scale: 1.8, filter: "blur(16px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', T_SIS, 0.32, 'back.out(1.6)');
tl(`tl.to(".esc", { backgroundColor: "${AMB}", borderColor: "${AMB}", duration: 0.12, stagger: 0.05 }, ${n(T_SIS + 0.05)});`);
suena('golpe', T_SIS + 0.05, { db: 2 });
a('#sis', '{ scale: 1.06 }', T_SIS + 0.32, t(32) - T_SIS - 0.4, 'none');

// ===== Escena 3 · Racha (9,02 s; entra la música): todo se mete en el ícono =====
const T_RACHA = t(32) - 0.004;
a(['#ban', '#camino', '#escalera', '#sis'], '{ scale: 0.1, opacity: 0, filter: "blur(10px)" }', T_RACHA - 0.26, 0.28, 'power3.in');
de0('#flood', '{ opacity: 1, scale: 0, borderRadius: 96 }', '{ opacity: 1, scale: 7, borderRadius: 60 }', T_RACHA - 0.02, 0.24, 'power2.in');
a('#flood', '{ scale: 1, borderRadius: 96 }', T_RACHA + 0.3, 0.32, 'expo.out');
fija('#flood', '{ opacity: 0 }', T_RACHA + 0.62);
fija('#ic', '{ opacity: 1 }', T_RACHA + 0.62);
late('#ic', T_RACHA + 0.62, 1, 0.12);
suena('boom', T_RACHA + 0.02);
de0('#nomin', '{ y: 160 }', '{ y: 0 }', T_RACHA + 0.5, 0.45, 'expo.out');
fija('#nom', '{ opacity: 1 }', T_RACHA + 0.5);
suena('whoosh', T_RACHA + 0.5, { db: -4 });
a('#ic', '{ scale: 1.07, rotation: 4 }', T_RACHA + 1.0, t(40) - T_RACHA - 1.15, 'sine.inOut');
// "armar ese sistema": siete cuadritos salen alrededor y se meten en el ícono
const MINI = [[-330, -80], [-250, -320], [0, -420], [250, -320], [330, -80], [-200, 200], [200, 200]];
MINI.forEach(([x, y], k) => {
  de0(`#mi${k}`, '{ x: 0, y: 0, scale: 0, opacity: 0 }', `{ x: ${x}, y: ${y}, scale: 1, opacity: 1 }`, t(37) - 0.04 + k * 0.035, 0.35, 'back.out(2)');
  a(`#mi${k}`, '{ x: 0, y: 0, scale: 0.2, opacity: 0 }', t(39) - 0.05 + k * 0.03, 0.3, 'power3.in');
});
suena('pop', t(37));
late('#ic', t(39) + 0.25, 1.07, 0.1);
suena('golpe', t(39) + 0.25, { db: -3 });

// ===== Escena 4 · máximo 3 hábitos (11,1 s): el ícono se abre en el celular con Hoy =====
const T_CEL = t(40) - 0.06;
a(['#nom'], '{ y: 260, opacity: 0, filter: "blur(10px)" }', T_CEL - 0.1, 0.25, 'power3.in');
fija('#ic', '{ opacity: 0 }', T_CEL);
fija('#cam', '{ opacity: 1 }', T_CEL);
de0('#tel', '{ clipPath: "inset(270px 110px 672px 110px round 96px)", backgroundColor: "#FFB547" }', '{ clipPath: "inset(0px 0px 0px 0px round 70px)", backgroundColor: "#0F1113" }', T_CEL, 0.55, 'expo.inOut');
de0('#bisel', '{ opacity: 0 }', '{ opacity: 1 }', T_CEL + 0.3, 0.25);
fija('#sHoy', `{ zIndex: ${++capa}, opacity: 1 }`, T_CEL);
de0('#sHoy', '{ opacity: 0 }', '{ opacity: 1 }', T_CEL + 0.2, 0.25);
suena('whoosh', T_CEL);
// la pantalla baja sola hasta las misiones ("con poco")
const HOY_Y = -886;
de0('#hoy0', '{ y: -240 }', `{ y: ${HOY_Y} }`, T_CEL + 0.35, t(43) - T_CEL - 0.3, 'expo.inOut');
fija('#hoy1', `{ y: ${HOY_Y} }`, T_CEL);
// "máximo 3 hábitos": el 3 gigante y los tres hábitos encendidos uno por uno
const T_TRES = t(44) - 0.04;
de0('#tres', '{ opacity: 0, scale: 2.2, x: 120, filter: "blur(14px)" }', '{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }', T_TRES, 0.35, 'back.out(1.6)');
suena('golpe', T_TRES + 0.04, { db: 2 });
[272, 466, 647].forEach((y, k) => aro(14, y - 78, 592, 156, T_TRES + 0.2 + k * 0.17, Math.max(0.25, t(46) - 0.36 - (T_TRES + 0.2 + k * 0.17))));
zoom(310, 560, 1.12, T_TRES, 0.6);
a('#tres', '{ scale: 1.08, rotation: -4 }', T_TRES + 0.35, t(46) - T_TRES - 0.45, 'sine.inOut');

// ===== Escena 5 · anclar el hábito (13,6 s): "Nuevo hábito" con "¿Después de qué?" → "almorzar" =====
const T_NUE = t(46) - 0.08;
a('#tres', '{ x: 500, opacity: 0, filter: "blur(10px)" }', T_NUE, 0.3, 'power3.in');
a('#tel', '{ scale: 1 }', T_NUE, 0.35, 'expo.inOut');
entra('sNuevo', T_NUE);
zoom(310, 690, 1.5, t(47) - 0.05, 0.55);
const T_ALM = t(59) - 0.02;
toque(111, 776, T_ALM);
fija('#nuevo1', '{ opacity: 1 }', T_ALM);
late('#tel', T_ALM, 1.5, 0.03);
// "estudias 25 minutos": la regla en dos pastillas, abajo
a('#tel', '{ scale: 1 }', T_ALM + 0.28, 0.45, 'expo.inOut');
a('#cam', '{ y: -270, scale: 0.78 }', T_ALM + 0.28, 0.45, 'expo.inOut');
de0('#anA', '{ opacity: 0, x: -700 }', '{ opacity: 1, x: 0 }', T_ALM + 0.35, 0.4, 'expo.out');
de0('#anF', '{ opacity: 0, scale: 0, rotation: 90 }', '{ opacity: 1, scale: 1, rotation: 90 }', t(60) - 0.05, 0.3, 'back.out(2)');
de0('#anB', '{ opacity: 0, x: 700 }', '{ opacity: 1, x: 0 }', t(60) - 0.02, 0.4, 'expo.out');
suena('whoosh', T_ALM + 0.35, { db: -4 }); suena('pop', t(60) + 0.1);
late('#anB', t(61) - 0.02, 1, 0.1);
suena('golpe', t(61) + 0.02, { db: -3 });

// ===== Escena 6 · el día que no puedes (19,3 s): Día difícil, 25 MINUTOS → UN PÁRRAFO, y ese día cuenta =====
const T_DIF = t(63) - 0.06;
a(['#anA', '#anF', '#anB'], '{ y: 300, opacity: 0, filter: "blur(10px)" }', T_DIF - 0.1, 0.3, 'power3.in');
a('#cam', '{ y: 0, scale: 1 }', T_DIF, 0.4, 'expo.inOut');
a('#tel', '{ scale: 1 }', T_DIF, 0.35, 'expo.inOut');
entra('sDif', T_DIF, 'abajo');
zoom(310, 960, 1.42, t(67) - 0.05, 0.55);
// "lo conviertes en algo más pequeño": el celular baja y arriba sale 25 MINUTOS, que se encoge y se tacha
const T_CONV = t(71) - 0.05;
a('#cam', '{ y: 330, scale: 0.8 }', T_CONV, 0.5, 'expo.inOut');
a('#tel', '{ scale: 1 }', T_CONV, 0.5, 'expo.inOut');
de0('#min25', '{ opacity: 0, y: -200, scale: 1.3 }', '{ opacity: 1, y: 0, scale: 1 }', T_CONV + 0.08, 0.4, 'back.out(1.6)');
suena('golpe', T_CONV + 0.12, { db: -2 });
const T_PEQ = t(75) - 0.03;
a('#min25', '{ scale: 0.62, y: -40, color: "' + GRIS + '" }', T_PEQ, 0.35, 'expo.inOut');
tl(`tl.fromTo("#tacha", { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.out", immediateRender: false }, ${n(T_PEQ + 0.2)});`);
suena('whoosh', T_PEQ, { db: -5 });
// "como leer un párrafo"
de0('#parr', '{ opacity: 0, scale: 0.3, y: 60 }', '{ opacity: 1, scale: 1, y: 0 }', t(78) - 0.04, 0.4, 'back.out(1.8)');
suena('pop', t(78), { db: 2 });
// la app de verdad: Hoy en día difícil ("Mínimo: abrir el cuaderno y leer un párrafo"), y se marca en "ese día"
const DIF_Y = -900;
entra('sDifL', t(77) - 0.06);
fija(['#dif0', '#dif1'], `{ y: ${DIF_Y} }`, 0);
a('#dif0', `{ y: ${DIF_Y - 60} }`, t(77) + 0.35, t(83) - t(77) - 0.4, 'sine.inOut');
const T_MARCA = t(83) - 0.02;
fija('#dif1', `{ opacity: 1, y: ${DIF_Y - 60} }`, T_MARCA);
toque(570, 2583 * 0.53 + DIF_Y - 60, T_MARCA);
suena('pop', T_MARCA + 0.06);
// "cuenta": el chulo grande se dibuja arriba
const T_CUENTA = t(84) - 0.04;
a(['#min25', '#parr', '#tacha'], '{ opacity: 0, y: -120, filter: "blur(8px)" }', T_CUENTA - 0.08, 0.25, 'power3.in');
fija('#chk', '{ opacity: 1 }', T_CUENTA);
tl(`tl.fromTo("#chkp", { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, ${n(T_CUENTA)});`);
de0('#cuenta', '{ opacity: 0, scale: 1.6, filter: "blur(12px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', T_CUENTA + 0.05, 0.3, 'back.out(1.8)');
suena('logro', T_CUENTA, { db: -1 });

// ===== Escena 7 · no te castigas, vuelves mañana; si fallas, comodín (25,1 a 31,3 s): la semana =====
const T_SEM7 = t(85) - 0.06;
a('#cam', '{ y: 1500, opacity: 0, filter: "blur(14px)" }', T_SEM7 - 0.05, 0.4, 'power3.in');
a(['#chk', '#cuenta'], '{ scale: 0.3, opacity: 0, y: 500 }', T_SEM7, 0.35, 'power3.in');
de0('#tira', '{ opacity: 0, scale: 0.4, y: 200 }', '{ opacity: 1, scale: 1, y: 0 }', T_SEM7 + 0.1, 0.45, 'back.out(1.5)');
tl(`tl.fromTo("#tira .dia", { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(2.5)", stagger: 0.05, immediateRender: false }, ${n(T_SEM7 + 0.15)});`);
suena('whoosh', T_SEM7);
a('#tira', '{ scale: 1.05 }', T_SEM7 + 0.6, t(88) - T_SEM7 - 0.6, 'sine.inOut');
// "al día siguiente lo vuelves a intentar": el viernes late y se enciende
tl(`tl.fromTo("#t4", { borderColor: "#3A3F47" }, { keyframes: { borderColor: ["#3A3F47", "${AMB}", "#3A3F47", "${AMB}"] }, duration: 0.8, ease: "none", immediateRender: false }, ${n(t(88))});`);
const T_VUEL = t(92) - 0.03;
a('#t4', '{ backgroundColor: "' + AMB + '", borderColor: "' + AMB + '", color: "#0A0A0B" }', T_VUEL, 0.15);
fija('#t4 .ok', '{ opacity: 1 }', T_VUEL);
late('#t4', T_VUEL, 1, 0.25);
suena('pop', T_VUEL, { db: 2 });
// "y si un día fallas": el sábado queda vacío con una X y tiembla
const T_FALLA = t(99) - 0.04;
a('#t5', '{ borderColor: "#E5534B" }', T_FALLA, 0.12);
fija('#t5 .x', '{ opacity: 1 }', T_FALLA);
tiembla('#t5', T_FALLA, 14);
suena('golpe', T_FALLA + 0.03, { db: -4 });
// "usas un comodín": el escudo baja y lo cubre
const T_COM = t(102) - 0.08;
de0('#escudo', '{ opacity: 0, y: -700, scale: 2.4, rotation: -30 }', '{ opacity: 1, y: 0, scale: 1, rotation: 0 }', T_COM - 0.25, 0.42, 'power3.in');
fija('#t5 .x', '{ opacity: 0 }', T_COM + 0.17);
a('#t5', '{ backgroundColor: "' + VIO + '", borderColor: "' + VIO + '" }', T_COM + 0.17, 0.1);
fija('#escudo', '{ opacity: 0 }', T_COM + 0.17);
fija('#t5 .sh', '{ opacity: 1 }', T_COM + 0.17);
late('#tira', T_COM + 0.17, 1.05, 0.06);
suena('golpe', T_COM + 0.17, { db: 1 });
// "no dañas tu racha de días seguidos": la llama y el contador 18 → 19
const T_RAC = t(105) - 0.05;
a('#tira', '{ y: 260, scale: 0.9 }', T_RAC, 0.45, 'expo.inOut');
de0('#rac', '{ opacity: 0, scale: 0.3, y: 120 }', '{ opacity: 1, scale: 1, y: 0 }', T_RAC + 0.05, 0.4, 'back.out(1.8)');
fija('#n18', '{ opacity: 1 }', T_RAC);
a('#n18', '{ y: -170, opacity: 0 }', t(107) + 0.05, 0.25, 'power2.in');
de0('#n19', '{ y: 170, opacity: 0 }', '{ y: 0, opacity: 1 }', t(107) + 0.08, 0.3, 'back.out(2)');
suena('pop', t(107) + 0.1, { db: 2 });
de0('#segu', '{ opacity: 0, y: 30 }', '{ opacity: 1, y: 0 }', t(109) - 0.03, 0.25);
late('#racll', t(109), 1, 0.15);

// ===== Escena 8 · tareas en pasos (32 s): la llama se abre en el celular con Tareas =====
const T_TAR = t(111) - 0.06;
a(['#tira', '#rac', '#segu'], '{ scale: 0.2, opacity: 0, filter: "blur(10px)" }', T_TAR - 0.2, 0.3, 'power3.in');
fija('#cam', '{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }', T_TAR - 0.2);
fija('#tel', '{ scale: 1 }', T_TAR - 0.2);
de0('#tel', '{ clipPath: "inset(570px 210px 672px 210px round 96px)" }', '{ clipPath: "inset(0px 0px 0px 0px round 70px)" }', T_TAR, 0.55, 'expo.inOut');
entra('sTar', T_TAR - 0.05, 'nada');
suena('whoosh', T_TAR, { db: 1 });
a('#tar0', '{ y: -30 }', T_TAR + 0.3, t(117) - T_TAR - 0.3, 'sine.inOut');
// "tus tareas": se toca "Preparar un examen" y se abre con sus pasos
toque(318, 598 - 30, t(117) + 0.02);
const T_ABRE = t(118) - 0.04;
fija('#tar1', '{ opacity: 1 }', T_ABRE);
de0('#tar1', '{ y: 60, scale: 0.97 }', '{ y: 0, scale: 1 }', T_ABRE, 0.35, 'expo.out');
suena('whoosh', T_ABRE, { db: -5 });
// "dividida en pasos pequeños": la pantalla sube por los pasos y se encienden
const T_PASOS = t(120) - 0.05;
fija('#tar2', '{ opacity: 1 }', T_PASOS);
de0('#tar2', '{ y: 520 }', '{ y: 0 }', T_PASOS, 0.5, 'expo.out');
[251, 325, 409, 625, 717].forEach((y, k) => aro(56, y - 42, 548, 84, t(122) - 0.05 + k * 0.1, 0.75));
zoom(310, 470, 1.18, T_PASOS + 0.1, 0.6);
// "para cumplir un objetivo": vuelve la bandera, ahora encendida, arriba
const T_OBJ = t(124) - 0.05;
a('#cam', '{ y: 260, scale: 0.84 }', T_OBJ, 0.45, 'expo.inOut');
fija('#ban', '{ scale: 0.7, opacity: 0, color: "' + AMB + '", y: -150, filter: "blur(0px)" }', T_OBJ - 0.01);
de0('#ban', '{ opacity: 0, scale: 0.2 }', '{ opacity: 1, scale: 0.7 }', T_OBJ + 0.25, 0.4, 'back.out(2)');
tl(`tl.fromTo("#banaro", { opacity: 0.9, scale: 0.7, y: -150 }, { opacity: 0, scale: 1.8, y: -150, duration: 0.7, ease: "power2.out", immediateRender: false }, ${n(t(127))});`);
suena('golpe', t(127) + 0.03);

// ===== Escena 9 · la Biblioteca (37,3 s): Hábitos → Tareas → Planes de 30 días =====
const T_BIB = t(128) - 0.06;
a('#ban', '{ opacity: 0, y: -400, scale: 0.3 }', T_BIB, 0.3, 'power3.in');
a('#cam', '{ y: 0, scale: 1 }', T_BIB, 0.45, 'expo.inOut');
a('#tel', '{ scale: 1 }', T_BIB, 0.45, 'expo.inOut');
entra('sBib', T_BIB);
a('#bib0', '{ y: -40 }', T_BIB + 0.4, t(137) - T_BIB - 0.4, 'sine.inOut');
toque(310, 111, t(137) - 0.05);
fija('#bib1', '{ opacity: 1 }', t(137) - 0.03);
de0('#bib1', '{ x: 80 }', '{ x: 0 }', t(137) - 0.03, 0.3, 'expo.out');
toque(497, 111, t(139) - 0.05);
fija('#bib2', '{ opacity: 1 }', t(139) - 0.03);
de0('#bib2', '{ x: 80 }', '{ x: 0 }', t(139) - 0.03, 0.3, 'expo.out');
const T_30 = t(141) - 0.05;
de0('#treinta', '{ opacity: 0, scale: 2, filter: "blur(14px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', T_30, 0.35, 'back.out(1.6)');
suena('golpe', T_30 + 0.04, { db: 1 });
zoom(310, 420, 1.25, T_30, 0.6);
a('#treinta', '{ scale: 1.06, rotation: -3 }', T_30 + 0.35, t(145) - T_30 - 0.45, 'sine.inOut');

// ===== Escena 10 · Tu semana (41,8 s): cada paso en su día, junto a tus citas =====
const T_SEM = t(145) - 0.06;
a('#treinta', '{ opacity: 0, x: -500 }', T_SEM, 0.3, 'power3.in');
a('#tel', '{ scale: 1 }', T_SEM, 0.35, 'expo.inOut');
entra('sSem', T_SEM);
zoom(310, 789, 1.45, t(147) - 0.03, 0.5);
const T_PASO = t(149) - 0.05;
fija('#sem1', '{ opacity: 1 }', T_PASO);
de0('#sem1', '{ y: 500 }', '{ y: 0 }', T_PASO, 0.45, 'expo.out');
zoom(310, 560, 1.35, T_PASO + 0.05, 0.45);
aro(40, 430, 540, 190, t(154) - 0.05, 0.6);
zoom(310, 913, 1.45, t(156) - 0.1, 0.45);
aro(40, 870, 540, 100, t(158) - 0.03, 0.55);

// ===== Escena 11 · el temporizador (45,3 s): el pomodoro de 25 minutos corriendo =====
const T_FOC = t(160) - 0.06;
a('#tel', '{ scale: 1 }', T_FOC - 0.05, 0.3, 'expo.inOut');
entra('sFoco', T_FOC, 'abajo');
zoom(310, 451, 1.35, T_FOC + 0.4, 0.6);
late('#tel', t(166) - 0.02, 1.35, 0.05);
suena('golpe', t(166) + 0.03, { db: -3 });

// ===== Escena 12 · el aviso y Progreso (48,2 s) =====
const T_AV = t(170) - 0.25;
de0('#aviso', '{ y: -360, opacity: 1 }', '{ y: 0, opacity: 1 }', T_AV, 0.45, 'expo.out');
suena('pop', T_AV + 0.2, { db: 2 });
a('#tel', '{ scale: 1.25, filter: "blur(3px) brightness(0.7)" }', T_AV, 0.5, 'expo.out');
late('#aviso', t(173), 1, 0.05);
const T_PRO = t(176) - 0.06;
a('#aviso', '{ y: -400 }', T_PRO - 0.05, 0.3, 'power3.in');
a('#tel', '{ scale: 1, filter: "blur(0px) brightness(1)" }', T_PRO, 0.3, 'expo.out');
entra('sProg', T_PRO);
zoom(310, 455, 1.55, t(177) - 0.05, 0.55);
aro(262, 315, 80, 80, t(181) - 0.05, 0.8);
aro(160, 506, 90, 90, t(184) - 0.05, 0.8);

// ===== Escena 13 · celular y computador, un solo pago (53,2 s) =====
const T_DOS = t(186) - 0.06;
a('#tel', '{ scale: 1 }', T_DOS, 0.4, 'expo.inOut');
entra('sHoy', T_DOS, 'izquierda');
fija(['#hoy0', '#hoy1'], '{ y: 0 }', T_DOS);
fija('#hoy1', '{ opacity: 0 }', T_DOS);
a('#cam', '{ x: -290, y: 190, scale: 0.55 }', T_DOS + 0.05, 0.5, 'expo.inOut');
de0('#lap', '{ opacity: 0, x: 600, scale: 0.8 }', '{ opacity: 1, x: 0, scale: 1 }', t(192) - 0.08, 0.5, 'expo.out');
suena('whoosh', t(192) - 0.06);
fija('#cam', '{ zIndex: 60 }', T_DOS);
const T_PAGO = t(195) - 0.06;
de0('#pago', '{ opacity: 0, scale: 0.3, y: 80 }', '{ opacity: 1, scale: 1, y: 0 }', T_PAGO, 0.35, 'back.out(2)');
suena('golpe', T_PAGO + 0.04, { db: 1 });
a('#lap', '{ scale: 1.04 }', t(192) + 0.45, T_PAGO - t(192) + 0.2, 'sine.inOut');

// ===== Escena 14 · cierre (55,6 s): todo se mete en el ícono; "escribe RACHA y te la muestro" y el precio =====
const T_FIN = t(197) - 0.06;
a(['#cam', '#lap', '#pago'], '{ scale: 0.1, opacity: 0, filter: "blur(10px)" }', T_FIN - 0.22, 0.26, 'power3.in');
de0('#fin', '{ opacity: 0, scale: 0.2, rotation: -20 }', '{ opacity: 1, scale: 1, rotation: 0 }', T_FIN, 0.45, 'back.out(1.7)');
suena('boom', T_FIN + 0.02, { db: -2 });
de0('#esc', '{ opacity: 0, y: 20, filter: "blur(10px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(197) - 0.03, 0.25);
de0('#marca', '{ opacity: 0, scale: 1.25, filter: "blur(18px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', t(198) - 0.03, 0.35);
a('#marca', '{ scale: 1.04 }', t(198) + 0.33, TOTAL - t(198) - 0.4, 'none');
de0('#ytela', '{ opacity: 0, y: 20, filter: "blur(10px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(199) - 0.03, 0.25);
de0('#pastilla', '{ opacity: 0, y: 40, scale: 0.92 }', '{ opacity: 1, y: 0, scale: 1 }', t(202) + 0.25, 0.3, 'back.out(1.6)');
suena('pop', t(202) + 0.25, { db: 1 });
a('#fin', '{ scale: 1.08, rotation: 3 }', T_FIN + 0.45, TOTAL - T_FIN - 0.5, 'sine.inOut');
[t(202) + 0.7, t(202) + 1.5].forEach((tt) => tl(`tl.fromTo("#anillo2", { opacity: 0.85, scale: 1 }, { opacity: 0, scale: 2.4, duration: 0.8, ease: "power2.out", immediateRender: false }, ${n(tt)});`));

// ===== cámara viva: todo el cuadro respira y el celular se mece, para que nada quede quieto entre golpes =====
{
  const P_M = 2.6, vueltas = Math.floor(TOTAL / P_M);
  const ks = [], kr = [], kx = [], ky = [];
  for (let j = 0; j <= vueltas * 4; j++) { const g = (j / 4) * Math.PI * 2; ks.push(n(1.035 + 0.035 * Math.sin(g))); kr.push(n(1.3 * Math.sin(g * 0.5))); kx.push(n(16 * Math.sin(g * 0.75))); ky.push(n(12 * Math.cos(g * 0.6))); }
  tl(`tl.to("#mundo", { keyframes: { scale: [${ks}], rotation: [${kr}], x: [${kx}], y: [${ky}] }, duration: ${n(vueltas * P_M)}, ease: "none" }, 0);`);
  const kfx = [], kfr = [];
  for (let j = 0; j <= vueltas * 4; j++) { const g = (j / 4) * Math.PI * 2 * 1.3; kfx.push(n(22 * Math.sin(g))); kfr.push(n(2.2 * Math.sin(g + 1))); }
  tl(`tl.to("#flot", { keyframes: { x: [${kfx}], rotation: [${kfr}] }, duration: ${n(vueltas * P_M)}, ease: "none" }, 0);`);
}

// ---------- 5. mezcla de efectos ----------
{
  const SR = 48000, mezcla = new Float32Array(Math.ceil(TOTAL * SR) * 2);
  for (const ev of sonidos) {
    const b = fs.readFileSync(path.join(SON, ev.s + '.wav')), datos = b.subarray(b.indexOf('data') + 8), g = 10 ** (ev.db / 20) / 32768, en = Math.round(ev.t * SR) * 2;
    for (let i = 0; i < datos.length / 2 && en + i < mezcla.length; i++) mezcla[en + i] += datos.readInt16LE(i * 2) * g;
  }
  const sal = Buffer.alloc(44 + mezcla.length * 2);
  sal.write('RIFF', 0); sal.writeUInt32LE(36 + mezcla.length * 2, 4); sal.write('WAVEfmt ', 8); sal.writeUInt32LE(16, 16); sal.writeUInt16LE(1, 20); sal.writeUInt16LE(2, 22);
  sal.writeUInt32LE(SR, 24); sal.writeUInt32LE(SR * 4, 28); sal.writeUInt16LE(4, 32); sal.writeUInt16LE(16, 34); sal.write('data', 36); sal.writeUInt32LE(mezcla.length * 2, 40);
  mezcla.forEach((v, i) => sal.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(A, 'efectos.wav'), sal);
  fs.writeFileSync(path.join(BASE, 'sistema-sonidos.txt'), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(10)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}

// ---------- 6. la página ----------
const img = (id, f, extra = '') => `<img class="lg" id="${id}" src="assets/app/${f}.jpg" ${extra}/>`;
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const tiraHtml = DIAS.map((d, k) => `<div class="dia ${k < 4 ? 'si' : ''}" id="t${k}"><b>${d}</b><span class="ok">${svg('chulo', 3.4)}</span>${k === 5 ? `<span class="x">${svg('equis', 3.4)}</span><span class="sh">${svg('escudo', 2.4)}</span>` : ''}</div>`).join('');
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · un sistema</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 300; src: url("assets/fuentes/barlow-300.woff2") format("woff2"); }
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlowc-700.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #0A0A0B; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0A0A0B; }
      .grande { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; line-height: 1; color: #F5F5F2; opacity: 0; }
      #meta { top: 560px; font-size: 330px; color: ${AMB}; z-index: 30; }
      #barra { position: absolute; left: 160px; top: 980px; width: 760px; height: 46px; border-radius: 23px; background: #23262B; overflow: hidden; opacity: 0; z-index: 30; }
      #barf { width: 100%; height: 100%; background: ${AMB}; transform-origin: 0 50%; border-radius: 23px; }
      #dias { position: absolute; left: 0; right: 0; top: 1080px; height: 90px; opacity: 0; z-index: 30; }
      #dias span { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 72px; color: #F5F5F2; opacity: 0; }
      #ban { position: absolute; left: 430px; top: 230px; width: 220px; height: 220px; color: ${GRIS}; opacity: 0; z-index: 30; }
      #ban svg { width: 100%; height: 100%; }
      #banaro { position: absolute; left: 400px; top: 200px; width: 280px; height: 280px; border-radius: 50%; border: 6px solid ${AMB}; opacity: 0; z-index: 29; }
      #camino { position: absolute; inset: 0; opacity: 0; z-index: 20; }
      #escalera { position: absolute; inset: 0; z-index: 25; }
      .esc { position: absolute; width: 96px; height: 96px; margin: -48px 0 0 -48px; border-radius: 24px; border: 6px solid #3A3F47; background: #15171A; opacity: 0; }
      #sis { top: 1560px; font-size: 210px; z-index: 30; }
      #ic, #fin { position: absolute; left: 340px; top: 560px; width: 400px; height: 400px; border-radius: 96px; opacity: 0; z-index: 30; }
      #flood { position: absolute; left: 340px; top: 560px; width: 400px; height: 400px; border-radius: 96px; background: ${AMB}; opacity: 0; z-index: 31; }
      #fin { left: 410px; top: 420px; width: 260px; height: 260px; border-radius: 62px; z-index: 80; }
      #nom { position: absolute; left: 0; right: 0; top: 1040px; height: 160px; overflow: hidden; text-align: center; opacity: 0; z-index: 30; }
      #nomin { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 150px; line-height: 160px; color: #F5F5F2; }
      .mini { position: absolute; left: 500px; top: 720px; width: 80px; height: 80px; border-radius: 20px; background: ${AMB}; opacity: 0; z-index: 29; }
      #mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 540px 900px; }
      #flot { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 540px 960px; }
      #cam { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; opacity: 0; z-index: 40; transform-origin: 540px 960px; }
      #tel { position: absolute; left: ${TEL.x}px; top: ${TEL.y}px; width: ${TEL.w}px; height: ${TEL.h}px; overflow: hidden; background: #0F1113; border-radius: 70px; }
      #bisel { position: absolute; inset: 0; border: 10px solid #1D1F23; border-radius: 70px; opacity: 0; z-index: 900; pointer-events: none; }
      .scr { position: absolute; left: 0; top: 0; width: ${TEL.w}px; height: ${TEL.h}px; overflow: hidden; background: #0F1113; opacity: 0; }
      .scr .lg { position: absolute; left: 0; top: 0; width: ${TEL.w}px; }
      .scr .lg + .lg, .tapa { opacity: 0; }
      .scr video { position: absolute; left: 0; top: 0; width: ${TEL.w}px; }
      .dedo { position: absolute; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; background: rgba(255, 255, 255, 0.5); border: 4px solid #fff; opacity: 0; z-index: 950; }
      .aro { position: absolute; border: 5px solid ${AMB}; border-radius: 26px; box-shadow: 0 0 30px rgba(255,181,71,0.55); opacity: 0; z-index: 940; }
      #tres { position: absolute; right: 30px; top: 70px; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 420px; line-height: 1; color: ${AMB}; text-shadow: 0 10px 40px rgba(0,0,0,0.8); opacity: 0; z-index: 60; }
      .pilw { position: absolute; left: 0; right: 0; display: flex; justify-content: center; z-index: 60; }
      .pil { position: relative; display: flex; align-items: center; gap: 18px; padding: 22px 34px; border-radius: 999px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; white-space: nowrap; opacity: 0; z-index: 60; }
      .pil svg { width: 56px; height: 56px; }
      #anA { background: #15171A; color: #F5F5F2; border: 3px solid #3A3F47; }
      #anF { width: 80px; height: 80px; color: ${AMB}; padding: 0; transform: rotate(90deg); }
      #anF svg { width: 80px; height: 80px; }
      #anB { background: ${AMB}; color: #0A0A0B; }
      .gtx { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; line-height: 1; opacity: 0; z-index: 60; }
      #min25 { top: 120px; font-size: 170px; color: #F5F5F2; }
      #tacha { position: absolute; left: 250px; top: 215px; width: 580px; height: 16px; border-radius: 8px; background: #E5534B; transform-origin: 0 50%; z-index: 61; }
      #parr { top: 330px; font-size: 190px; color: ${AMB}; }
      #chk { position: absolute; left: 400px; top: 70px; width: 280px; height: 280px; opacity: 0; z-index: 61; }
      #cuenta { top: 330px; font-size: 180px; color: ${AMB}; }
      #tira { position: absolute; left: 0; right: 0; top: 760px; display: flex; justify-content: center; gap: 18px; opacity: 0; z-index: 50; }
      .dia { position: relative; width: 122px; height: 180px; border-radius: 28px; border: 5px solid #3A3F47; background: #15171A; color: #F5F5F2; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 22px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 40px; }
      .dia.si { background: ${AMB}; border-color: ${AMB}; color: #0A0A0B; }
      .dia .ok, .dia .x, .dia .sh { position: absolute; left: 29px; top: 82px; width: 64px; height: 64px; opacity: 0; }
      .dia.si .ok { opacity: 1; }
      .dia .x { color: #E5534B; } .dia .sh { color: #0A0A0B; }
      .dia svg { width: 100%; height: 100%; }
      #escudo { position: absolute; left: 650px; top: 790px; width: 130px; height: 130px; color: ${VIO}; opacity: 0; z-index: 55; }
      #escudo svg { width: 100%; height: 100%; }
      #rac { position: absolute; left: 0; right: 0; top: 380px; display: flex; justify-content: center; align-items: center; gap: 30px; opacity: 0; z-index: 50; }
      #racll { width: 230px; height: 230px; color: ${AMB}; }
      #racll svg { width: 100%; height: 100%; }
      #racn { position: relative; width: 300px; height: 250px; overflow: hidden; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 250px; line-height: 250px; color: #F5F5F2; }
      #racn span { position: absolute; left: 0; top: 0; opacity: 0; }
      #segu { top: 680px; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 70px; color: #F5F5F2; }
      #treinta { position: absolute; left: 0; right: 0; top: 100px; text-align: center; opacity: 0; z-index: 60; }
      #treinta span { display: inline-block; padding: 18px 46px 24px; border-radius: 999px; background: ${AMB}; color: #0A0A0B; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 130px; line-height: 1; box-shadow: 0 16px 50px rgba(0,0,0,0.7); }
      #aviso { position: absolute; left: 50px; right: 50px; top: 90px; padding: 34px 40px; border-radius: 46px; background: rgba(44, 47, 52, 0.97); box-shadow: 0 20px 60px rgba(0,0,0,0.6); display: flex; gap: 30px; align-items: flex-start; opacity: 0; z-index: 70; font-family: "Barlow", sans-serif; }
      #aviso img { width: 100px; height: 100px; border-radius: 24px; flex: none; }
      #aviso .ap { font-size: 32px; color: #A8AFB8; font-weight: 300; }
      #aviso .ti { font-size: 44px; color: #F5F5F2; font-weight: 600; margin-top: 4px; }
      #aviso .cu { font-size: 38px; color: #D7DBE0; font-weight: 300; margin-top: 4px; }
      #lap { position: absolute; left: 150px; top: 400px; width: 880px; opacity: 0; z-index: 50; }
      #lap .pant { width: 880px; height: 556px; border-radius: 26px 26px 0 0; border: 16px solid #1D1F23; border-bottom-width: 22px; overflow: hidden; background: #0F1113; }
      #lap .pant img { width: 100%; display: block; }
      #lap .base { width: 1000px; height: 30px; margin-left: -60px; border-radius: 0 0 30px 30px; background: #2A2D32; }
      #pago { position: absolute; left: 0; right: 0; top: 1500px; text-align: center; opacity: 0; z-index: 65; }
      #pago span { display: inline-block; padding: 22px 50px 28px; border-radius: 999px; background: ${AMB}; color: #0A0A0B; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 66px; box-shadow: 0 16px 50px rgba(0,0,0,0.7); }
      .anillo { position: absolute; border: 6px solid ${AMB}; opacity: 0; }
      .chica { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 64px; color: #F5F5F2; opacity: 0; z-index: 82; }
      #esc { top: 712px; } #ytela { top: 1090px; }
      #marca { position: absolute; left: 0; right: 0; top: 824px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 250px; line-height: 1; color: ${AMB}; opacity: 0; z-index: 82; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1190px; display: flex; justify-content: center; opacity: 0; z-index: 82; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 34px; color: #F5F5F2; background: #15171A; border: 3px solid ${AMB}; border-radius: 999px; padding: 14px 30px 18px; white-space: nowrap; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="mundo">
      <p class="grande" id="meta">META</p>
      <div id="barra"><div id="barf"></div></div>
      <div id="dias">${Array.from({ length: 14 }, (_, k) => `<span id="d${k}">día ${k + 1}</span>`).join('')}</div>
      <svg id="camino" viewBox="0 0 1080 1920"><path id="caminop" d="M540 1500 C 380 1380, 700 1230, 520 1100 S 380 820, 560 700 S 560 520, 540 470" fill="none" stroke="#3A3F47" stroke-width="10" stroke-linecap="round" stroke-dasharray="1400"/></svg>
      <div id="escalera">${ESC.map(([x, y], k) => `<div class="esc" id="e${k}" style="left:${x}px;top:${y}px"></div>`).join('')}</div>
      <div id="banaro"></div>
      <div id="ban">${svg('flag', 1.8)}</div>
      <p class="grande" id="sis">SISTEMA</p>
      <div id="flood"></div>
      <img id="ic" src="assets/icono.svg" />
      ${MINI.map((_, k) => `<div class="mini" id="mi${k}"></div>`).join('\n      ')}
      <div id="nom"><div id="nomin">Racha</div></div>
      <div id="cam"><div id="flot"><div id="tel">
        <div class="scr" id="sHoy">${img('hoy0', 'L-hoy-0')}${img('hoy1', 'L-hoy-1')}</div>
        <div class="scr" id="sNuevo">${img('nuevo0', 'nuevo-0')}${img('nuevo1', 'nuevo-1')}</div>
        <div class="scr" id="sDif">${img('difh', 'dif-hoja')}</div>
        <div class="scr" id="sDifL">${img('dif0', 'L-dif-0')}${img('dif1', 'L-dif-1')}</div>
        <div class="scr" id="sTar">${img('tar0', 'tareas-lista')}${img('tar1', 'tarea-0')}${img('tar2', 'tarea-1')}</div>
        <div class="scr" id="sBib">${img('bib0', 'biblio-habitos')}${img('bib1', 'biblio-tareas')}${img('bib2', 'biblio-planes')}</div>
        <div class="scr" id="sSem">${img('sem0', 'semana-0')}${img('sem1', 'semana-1')}</div>
        <div class="scr" id="sFoco"><video id="vfoco" src="assets/foco.mp4" muted playsinline data-start="${n(T_FOC)}" data-duration="${n(T_AV + 1 - T_FOC)}" data-media-start="0" data-track-index="3"></video></div>
        <div class="scr" id="sProg">${img('prog', 'prog-radar')}</div>
        ${aros.join('\n        ')}
        ${dedos.join('\n        ')}
        <div id="bisel"></div>
      </div></div></div>
      <p class="grande" id="tres">3</p>
      <div class="pilw" style="top:1300px"><div class="pil" id="anA">${svg('cubiertos', 2)}Después de almorzar</div></div>
      <div class="pilw" style="top:1420px"><div id="anF" class="pil">${svg('flecha', 2.6)}</div></div>
      <div class="pilw" style="top:1515px"><div class="pil" id="anB">${svg('birrete', 2)}Estudiar 25 minutos</div></div>
      <p class="gtx" id="min25">25 MINUTOS</p>
      <div id="tacha"></div>
      <p class="gtx" id="parr">UN PÁRRAFO</p>
      <svg id="chk" viewBox="0 0 24 24" fill="none" stroke="${AMB}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path id="chkp" d="M20 6 9 17l-5-5" stroke-dasharray="30" stroke-dashoffset="30"/></svg>
      <p class="gtx" id="cuenta">CUENTA</p>
      <div id="tira">${tiraHtml}</div>
      <div id="escudo">${svg('escudo', 2)}</div>
      <div id="rac"><div id="racll">${svg('llama', 1.8)}</div><div id="racn"><span id="n18">18</span><span id="n19">19</span></div></div>
      <p class="gtx" id="segu">días seguidos</p>
      <div id="treinta"><span>30 DÍAS</span></div>
      <div id="aviso"><img src="assets/icono.svg" /><div><p class="ap">Racha · ahora</p><p class="ti">Después de almorzar: Estudiar 25 minutos</p><p class="cu">Toca para abrir Racha y marcarlo.</p></div></div>
      <div id="lap"><div class="pant"><img src="assets/app/esc-hoy.jpg" /></div><div class="base"></div></div>
      <div id="pago"><span>$37.900 · un solo pago</span></div>
      <div class="anillo" id="anillo2" style="left:410px;top:420px;width:260px;height:260px;border-radius:62px;z-index:79"></div>
      <img id="fin" src="assets/icono.svg" />
      <p class="chica" id="esc">escribe</p>
      <p id="marca">RACHA</p>
      <p class="chica" id="ytela">y te la muestro</p>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago · 7 días para probarla</span></div>
      </div>
      <audio id="voz" src="assets/voz.wav" data-start="0" data-duration="${n(Math.min(TOTAL, VOZ_DURA))}" data-media-start="0" data-track-index="7" data-volume="1"></audio>
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="9" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${pasos.join('\n      ')}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`, 'utf8');
for (const f of ['hyperframes.json', 'package.json', 'meta.json']) {
  const de = path.join(C, 'rimu2', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-rimu2').join('campana-rimu3'), 'utf8');
}
console.log(`Listo "un sistema": dura ${TOTAL.toFixed(2)} s · Racha ${T_RACHA.toFixed(2)} · celular ${T_CEL.toFixed(2)} · cierre ${T_FIN.toFixed(2)} · ${sonidos.length} efectos`);
