// Video de producto 3, estilo rimu, versión 2: "Un sistema" (21 oct de 2026). La v1 (hf-sistema.mjs) mostraba capturas de
// la app en un celular y Johnatan la rechazó: "la idea era como rimu: animaciones dinámicas, íconos; no quiero que muestres
// pantallas". Aquí cada frase es un gráfico animado hecho a mano (íconos Lucide en cuadritos, listas con chulos, números
// que corren, la cuadrícula de días, el anillo del tiempo, la red de íconos), con cortes de fondo negro/blanco como rimu.
// La app de verdad solo sale un instante, en el celular y el computador. Misma voz y mismo gancho (la META que se apaga).
// Uso: node design/herramientas/hf-sistema2.mjs [--solo-html]   → campana/rimu3/hyperframes-v2
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
const P = path.join(BASE, 'hyperframes-v2'), A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(A, 'app')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const SOLO_HTML = process.argv.includes('--solo-html');

const VOZ = path.join(BASE, 'voz', 'sistema-fernando-v1-limpia.mp3');
const PAL = JSON.parse(fs.readFileSync(path.join(BASE, 'voz', 'sistema-fernando-v1-limpia.palabras.json'), 'utf8')).palabras;
const t = (i) => PAL[i].i;
const VOZ_DURA = 57.71;
const TOTAL = Number(process.env.PRUEBA || 59.2);
const AMB = '#FFB547', GRIS = '#5B6068', VIO = '#8E9BFF', NEG = '#0A0A0B', BLA = '#F2F2EE', TINTA = '#141518';

if (!SOLO_HTML) {
  ff(['-i', VOZ, '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  ff(['-i', path.join(BASE, 'app', 'hoy-top.png'), '-vf', 'scale=600:-2:flags=lanczos', '-q:v', '2', path.join(A, 'app', 'cel.jpg')]);
  ff(['-i', path.join(BASE, 'app', 'esc-hoy.png'), '-vf', 'scale=1200:-2:flags=lanczos', '-q:v', '2', path.join(A, 'app', 'esc.jpg')]);
}
for (const [de, a] of [['barlow/files/barlow-latin-300-normal.woff2', 'barlow-300.woff2'], ['barlow/files/barlow-latin-600-normal.woff2', 'barlow-600.woff2'], ['barlow-condensed/files/barlow-condensed-latin-700-normal.woff2', 'barlowc-700.woff2']])
  fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', de), path.join(A, 'fuentes', a));
fs.copyFileSync(path.join(RAIZ, 'public', 'ventas', 'icono.svg'), path.join(A, 'icono.svg'));
fs.copyFileSync(path.join(AQUI, 'libs', 'gsap-3.14.2.min.js'), path.join(A, 'gsap.min.js'));

// ---------- efectos ----------
const SON = path.join(C, 'sonidos'), MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const VOLUMEN = { pop: -16, golpe: -12, whoosh: -14, boom: -8, subida: -15, latido: -13, toque: -15, logro: -16, relleno: -18, caida: -13 };
const sonidos = [];
const golpes = [];
const suena = (s, tt, { modo = 'golpe', db = 0 } = {}) => { if ((s === 'golpe' || s === 'boom') && tt > 0.3) golpes.push(tt); if (tt < TOTAL) sonidos.push({ s, t: Math.max(0, tt - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db }); };

// ---------- íconos (Lucide, los de la app) ----------
const ICON = {
  flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
  habito: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  tareas: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  semana: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  reloj: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  escudo: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  campana: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  grafica: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  biblio: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  cama: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
  birrete: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  lapiz: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  cubiertos: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  enlace: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  libro: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  llama: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  equis: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chulo: '<path d="M20 6 9 17l-5-5"/>',
  sol: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  luna: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  casa: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  billetera: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  celular: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  diana: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  pregunta: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
};
const svg = (k, w = 1.8, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICON[k]}</svg>`;

// ---------- animación ----------
const pasos = [];
const tl = (s) => pasos.push(s);
const sinLlaves = (o) => o.trim().replace(/^\{|\}$/g, '').trim();
const de0 = (sel, desde, hasta, tt, dur = 0.3, ease = 'expo.out') => tl(`tl.fromTo(${JSON.stringify(sel)}, ${desde}, { ${sinLlaves(hasta)}, duration: ${dur}, ease: "${ease}", immediateRender: false }, ${n(tt)});`);
const a = (sel, props, tt, dur = 0.3, ease = 'power2.out') => tl(`tl.to(${JSON.stringify(sel)}, { ${sinLlaves(props)}, duration: ${dur}, ease: "${ease}" }, ${n(tt)});`);
const fija = (sel, props, tt) => tl(`tl.set(${JSON.stringify(sel)}, ${props}, ${n(tt)});`);
const late = (sel, tt, s = 1, k = 0.1) => tl(`tl.fromTo(${JSON.stringify(sel)}, { scale: ${s} }, { keyframes: { scale: [${s}, ${n(s * (1 + k))}, ${n(s * (1 - k * 0.3))}, ${s}] }, duration: 0.38, ease: "none", immediateRender: false }, ${n(tt)});`);
const tiembla = (sel, tt, f = 18) => tl(`tl.fromTo(${JSON.stringify(sel)}, { x: 0 }, { keyframes: { x: [0, -${f}, ${f * 0.8}, -${f * 0.5}, ${f * 0.25}, 0] }, duration: 0.4, ease: "none", immediateRender: false }, ${n(tt)});`);
const sale = (sel, tt, hacia = '{ scale: 0.6, opacity: 0, filter: "blur(12px)" }', dur = 0.22) => a(sel, hacia, tt - dur, dur, 'power3.in');
// corte de fondo (como rimu: negro ↔ blanco de golpe)
const fondo = (color, tt) => { fija('#fondo', `{ backgroundColor: "${color}" }`, tt); suena('whoosh', tt, { db: -3 }); golpes.push(tt); };
// números que corren: cada valor es un span; se muestra uno tras otro
const CONT = {};
const contador = (id, valores, t0, paso, cls = '') => { CONT[id] = `<div class="cont ${cls}" id="${id}">${valores.map((v, k) => `<span id="${id}_${k}">${v}</span>`).join('')}</div>`; valores.forEach((_, k) => { fija(`#${id}_${k}`, '{ opacity: 1 }', t0 + k * paso); if (k) fija(`#${id}_${k - 1}`, '{ opacity: 0 }', t0 + k * paso); }); };
const html = [];   // piezas sueltas

// ===== 1 · el gancho (0 a 4,5 s, negro, sin música): la META con su barra que sube y se cae =====
fija('#barf', '{ scaleX: 0 }', 0);
fija('#tbarf', '{ scaleX: 0.05 }', 0);
fija('#hilo', '{ scaleY: 0 }', 0);
fija('#frec', '{ opacity: 0 }', 0);
fija('#poli', '{ svgOrigin: "540 1000" }', 0);
de0('#meta', '{ opacity: 0, scale: 1.6, filter: "blur(18px)" }', '{ opacity: 1, scale: 1.12, filter: "blur(0px)" }', 0, 0.4);
a('#meta', '{ scale: 1 }', 0.4, t(4) - 0.4, 'none');
de0('#barra', '{ opacity: 0, scaleX: 0.2 }', '{ opacity: 1, scaleX: 1 }', 0.18, 0.45);
suena('golpe', 0.06, { db: -1 });
a('#barf', '{ scaleX: 0.55 }', t(4) - 0.04, 0.35, 'expo.out');
late('#meta', t(4) - 0.04, 1, 0.12);
suena('subida', t(4) + 0.3, { modo: 'fin', db: -3 });
a('#barf', '{ scaleX: 0.92 }', t(8) - 0.04, 0.3, 'expo.out');
a('#meta', '{ scale: 1.16, textShadow: "0 0 60px rgba(255,181,71,0.75)" }', t(8) - 0.04, 0.3, 'back.out(2)');
suena('golpe', t(8) + 0.04);
const T_DIAS = t(10) - 0.05;
contador('dias', Array.from({ length: 14 }, (_, k) => `día ${k + 1}`), T_DIAS, 0.055, 'dias');
de0('#dias', '{ opacity: 0, y: 40 }', '{ opacity: 1, y: 0 }', T_DIAS - 0.02, 0.2);
suena('relleno', T_DIAS, { db: 2 });
a('#barf', '{ scaleX: 0.12, backgroundColor: "#8A8F97" }', T_DIAS + 0.05, 0.78, 'power2.in');
a('#meta', '{ scale: 1, color: "#8A8F97", textShadow: "0 0 0px rgba(255,181,71,0)" }', T_DIAS + 0.1, 0.7);
const T_SOLT = t(16) - 0.04;
a('#meta', `{ y: 150, rotation: 7, color: "${GRIS}" }`, T_SOLT, 0.35, 'back.in(1.4)');
a('#barf', '{ scaleX: 0 }', T_SOLT, 0.25, 'power2.in');
tiembla(['#barra', '#dias'], T_SOLT + 0.1, 22);
suena('caida', T_SOLT + 0.25); suena('latido', T_SOLT + 0.32, { db: -2 });

// ===== 2 · una meta dice a dónde; para cumplirla, un sistema (4,6 a 9 s) =====
const T_BAN = t(17) - 0.05;
a('#meta', '{ y: -470, scale: 0.3, opacity: 0, filter: "blur(6px)" }', T_BAN, 0.38, 'power3.inOut');
a(['#barra', '#dias'], '{ y: 420, opacity: 0, filter: "blur(10px)" }', T_BAN, 0.3, 'power3.in');
de0('#ban', '{ opacity: 0, scale: 0.2, y: 120 }', '{ opacity: 1, scale: 1, y: 0 }', T_BAN + 0.18, 0.45, 'back.out(1.8)');
suena('whoosh', T_BAN);
fija('#camino', '{ opacity: 1 }', t(19));
tl(`tl.fromTo("#caminop", { strokeDashoffset: 1400 }, { strokeDashoffset: 0, duration: ${n(t(24) - t(19) + 0.05)}, ease: "power1.inOut", immediateRender: false }, ${n(t(19))});`);
a('#ban', '{ y: -12, rotation: -4 }', T_BAN + 0.64, t(24) - T_BAN - 0.8, 'sine.inOut');
const T_LLEGAR = t(24) - 0.02;
a('#ban', `{ color: "${AMB}", rotation: 0, y: 0 }`, T_LLEGAR, 0.2);
late('#ban', T_LLEGAR, 1, 0.18);
tl(`tl.fromTo("#banaro", { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 2.4, duration: 0.7, ease: "power2.out", immediateRender: false }, ${n(T_LLEGAR)});`);
suena('golpe', T_LLEGAR + 0.04);
const ESC = [[420, 1390], [560, 1250], [430, 1110], [570, 970], [440, 830], [580, 690], [460, 550]];
ESC.forEach((_, k) => de0(`#e${k}`, '{ opacity: 0, scale: 0 }', '{ opacity: 1, scale: 1 }', t(26) - 0.04 + k * 0.1, 0.28, 'back.out(2.4)'));
suena('relleno', t(26));
tl(`tl.to(".esc", { backgroundColor: "${AMB}", borderColor: "${AMB}", duration: 0.1, stagger: 0.06 }, ${n(t(29) - 0.1)});`);
// "un sistema": corte a blanco y la cuadrícula de íconos vuela hacia la cámara (como rimu); en el centro, la bandera
const T_SIS = t(30) - 0.06;
sale(['#ban', '#camino', '#escalera', '#banaro'], T_SIS, '{ scale: 2.2, opacity: 0, filter: "blur(16px)" }', 0.18);
fondo(BLA, T_SIS);
const NODOS = [['habito', 'Hábitos'], ['tareas', 'Tareas'], ['semana', 'Semana'], ['reloj', 'Foco'], ['escudo', 'Comodines'], ['campana', 'Avisos'], ['grafica', 'Progreso'], ['biblio', 'Biblioteca']];
const GRID = [[250, 560], [540, 560], [830, 560], [250, 860], [830, 860], [250, 1160], [540, 1160], [830, 1160]];   // centros de los cuadritos
NODOS.forEach(([ic, nom], k) => {
  const [x, y] = GRID[k];
  html.push(`<div class="tile" id="g${k}" style="left:${x - 100}px;top:${y - 100}px"><div class="tl">${svg(ic, 1.7)}</div><p>${nom}</p></div>`);
  de0(`#g${k}`, '{ opacity: 0, scale: 2.8, filter: "blur(24px)", transformPerspective: 900, rotationY: ' + (x < 540 ? -40 : x > 540 ? 40 : 0) + ' }', '{ opacity: 1, scale: 1, filter: "blur(0px)", rotationY: 0 }', T_SIS + 0.04 + [3, 1, 4, 0, 6, 2, 5, 7][k] * 0.045, 0.5, 'expo.out');
});
html.push(`<div class="tile centro" id="gc" style="left:440px;top:760px"><div class="tl">${svg('flag', 1.7)}</div></div>`);
de0('#gc', '{ opacity: 0, scale: 0.2 }', '{ opacity: 1, scale: 1 }', T_SIS + 0.12, 0.45, 'back.out(1.8)');
de0('#siste', '{ opacity: 0, y: 40, filter: "blur(10px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(31) - 0.04, 0.3);
suena('golpe', t(31), { db: 1 });
de0('#rejilla', '{ transformPerspective: 1400, rotationX: 18, rotationY: -14, scale: 1.08 }', '{ rotationX: 0, rotationY: 0, scale: 1 }', T_SIS, 1.2, 'expo.out');

// ===== 3 · Racha (9,02 s; entra la música): la bandera se vuelve el ícono y los cuadritos forman la red =====
const T_RACHA = t(32) - 0.004;
fija('#gc .tl', '{ opacity: 0 }', T_RACHA);
de0('#gic', '{ opacity: 0, scale: 0.4, rotation: -25 }', '{ opacity: 1, scale: 1, rotation: 0 }', T_RACHA, 0.45, 'back.out(1.7)');
late('#gc', T_RACHA, 1, 0.12);
suena('boom', T_RACHA + 0.02);
a('#siste', '{ opacity: 0, y: -30 }', T_RACHA - 0.1, 0.15);
de0('#nomr', '{ opacity: 0, y: 40 }', '{ opacity: 1, y: 0 }', T_RACHA + 0.2, 0.35, 'expo.out');
// "una app para armar ese sistema": los ocho cuadritos se acomodan en círculo, más pequeños y oscuros, y se unen con líneas
const R = 360, RED = NODOS.map((_, k) => { const g = -Math.PI / 2 + (k / 8) * Math.PI * 2; return [540 + R * Math.cos(g), 860 + R * Math.sin(g)]; });
const T_RED = t(35) - 0.05;
NODOS.forEach((_, k) => {
  const [x0, y0] = GRID[k], [x1, y1] = RED[k];
  a(`#g${k}`, `{ x: ${n(x1 - x0)}, y: ${n(y1 - y0)}, scale: 0.62 }`, T_RED + k * 0.03, 0.55, 'expo.inOut');
  a(`#g${k} .tl`, `{ backgroundColor: "${TINTA}", color: "${BLA}" }`, T_RED + k * 0.03 + 0.2, 0.25);
});
suena('whoosh', T_RED, { db: -2 });
const lineas = [];
RED.forEach(([x, y], k) => { const [x2, y2] = RED[(k + 1) % 8]; lineas.push([x, y, x2, y2]); lineas.push([540, 860, x, y]); });
html.push(`<svg id="red" viewBox="0 0 1080 1920">${lineas.map(([x1, y1, x2, y2], k) => { const L = Math.hypot(x2 - x1, y2 - y1); return `<line id="l${k}" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${TINTA}" stroke-width="4" stroke-dasharray="${n(L)}" stroke-dashoffset="${n(L)}"/>`; }).join('')}</svg>`);
fija('#red', '{ opacity: 1 }', t(37) - 0.1);
lineas.forEach(([x1, y1, x2, y2], k) => tl(`tl.to("#l${k}", { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" }, ${n(t(37) - 0.08 + k * 0.035)});`));
for (let k = 0; k < 4; k++) suena('pop', t(37) + k * 0.15, { db: -3 });
tl(`tl.to("#rejilla", { rotation: 12, duration: ${n(t(40) - t(37))}, ease: "sine.inOut" }, ${n(t(37))});`);
late('#gc', t(39) + 0.1, 1, 0.1);
suena('golpe', t(39) + 0.1, { db: -3 });

// ===== 4 · máximo 3 hábitos (11,1 s): corte a negro y la lista con chulos (como la de rimu) =====
const T_HAB = t(40) - 0.06;
sale(['#rejilla', '#red', '#nomr'], T_HAB, '{ scale: 0.3, opacity: 0, filter: "blur(14px)" }', 0.2);
fondo(NEG, T_HAB);
const HABS = [['cama', 'Tender la cama'], ['birrete', 'Estudiar 25 minutos'], ['lapiz', 'Anotar cada gasto'], ['luna', 'Meditar 20 minutos'], ['habito', 'Correr 5 km']];
HABS.forEach(([ic, nom], k) => html.push(`<div class="fila ${k > 2 ? 'fant' : ''}" id="f${k}" style="top:${760 + k * 120}px"><span class="circ">${svg('chulo', 3.4)}</span>${svg(ic, 1.8, 'class="fic"')}<b>${nom}</b></div>`));
de0('#lhab', '{ opacity: 0, y: 20 }', '{ opacity: 1, y: 0 }', T_HAB + 0.02, 0.25);
[0, 1, 2].forEach((k) => { de0(`#f${k}`, '{ opacity: 0, x: -80, filter: "blur(10px)" }', '{ opacity: 1, x: 0, filter: "blur(0px)" }', t(41) + k * 0.14, 0.35, 'expo.out'); suena('pop', t(41) + k * 0.14, { db: -3 }); });
[3, 4].forEach((k, j) => de0(`#f${k}`, '{ opacity: 0, x: -80 }', '{ opacity: 0.45, x: 0 }', t(43) - 0.05 + j * 0.12, 0.3, 'expo.out'));
const T_TRES = t(44) - 0.04;
[3, 4].forEach((k, j) => a(`#f${k}`, '{ x: 700, opacity: 0, rotation: 6 }', T_TRES + j * 0.06, 0.32, 'power3.in'));
de0('#tres', '{ opacity: 0, scale: 2.4, filter: "blur(16px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', T_TRES, 0.35, 'back.out(1.6)');
suena('golpe', T_TRES + 0.04, { db: 2 });
[0, 1, 2].forEach((k) => { tl(`tl.to("#f${k} .circ", { backgroundColor: "${AMB}", borderColor: "${AMB}", color: "${NEG}", duration: 0.12 }, ${n(t(45) + k * 0.1)});`); suena('toque', t(45) + k * 0.1, { db: -2 }); });
a('#tres', '{ scale: 1.08, rotation: -4 }', T_TRES + 0.35, t(46) - T_TRES - 0.45, 'sine.inOut');

// ===== 5 · anclar el hábito a algo que ya haces (13,6 a 19,3 s) =====
const T_AN = t(46) - 0.06;
sale(['#f0', '#f1', '#f2', '#lhab', '#tres'], T_AN, '{ y: -200, opacity: 0, filter: "blur(10px)" }', 0.22);
de0('#tA', '{ opacity: 0, scale: 0.3, x: -200 }', '{ opacity: 1, scale: 1, x: 0 }', T_AN + 0.02, 0.45, 'back.out(1.6)');
de0('#tB', '{ opacity: 0, scale: 0.3, x: 200 }', '{ opacity: 1, scale: 1, x: 0 }', T_AN + 0.1, 0.45, 'back.out(1.6)');
suena('whoosh', T_AN, { db: -2 });
fija('#cadena', '{ opacity: 1 }', t(47) - 0.1);
tl(`tl.fromTo("#cadenap", { strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, ${n(t(47) - 0.1)});`);
de0('#nudo', '{ opacity: 0, scale: 0, rotation: -90 }', '{ opacity: 1, scale: 1, rotation: 0 }', t(47) + 0.15, 0.4, 'back.out(2.2)');
suena('golpe', t(47) + 0.2, { db: -2 });
// "con frecuencia": siete puntos (los días) bajo el cuadrito de la izquierda se encienden
const T_FREC = t(54) - 0.1;
fija('#frec', '{ opacity: 1 }', t(50));
tl(`tl.fromTo("#frec i", { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(2.5)", stagger: 0.05, immediateRender: false }, ${n(t(50))});`);
tl(`tl.to("#frec i", { backgroundColor: "${BLA}", duration: 0.08, stagger: 0.07 }, ${n(T_FREC)});`);
suena('relleno', T_FREC, { db: -2 });
a('#frec', '{ opacity: 0, y: 30 }', t(57) - 0.2, 0.2);
de0('#txA', '{ opacity: 0, y: 30, filter: "blur(8px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(57) - 0.03, 0.3);
late('#tA', t(59) - 0.02, 1, 0.12); suena('pop', t(59));
de0('#txB', '{ opacity: 0, y: 30, filter: "blur(8px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(60) - 0.03, 0.3);
late('#tB', t(61) - 0.02, 1, 0.14); suena('golpe', t(61) + 0.02, { db: -3 });
tl(`tl.fromTo("#cadenap", { stroke: "${GRIS}" }, { keyframes: { stroke: ["${GRIS}", "${AMB}", "${AMB}"] }, duration: 0.5, ease: "none", immediateRender: false }, ${n(t(60))});`);
a('#ancla', '{ scale: 1.05, rotation: -2 }', T_AN + 0.6, t(63) - T_AN - 0.8, 'sine.inOut');

// ===== 6 · el día que no puedes: 25 minutos → un párrafo, y ese día cuenta (19,3 a 25 s, blanco) =====
const T_MIN = t(63) - 0.06;
sale(['#ancla'], T_MIN, '{ scale: 0.4, opacity: 0, filter: "blur(12px)" }', 0.2);
fondo(BLA, T_MIN);
de0('#anillo', '{ opacity: 0, scale: 0.4, rotation: -90 }', '{ opacity: 1, scale: 1, rotation: 0 }', T_MIN + 0.02, 0.5, 'expo.out');
tl(`tl.fromTo("#arco", { strokeDashoffset: 1633 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", immediateRender: false }, ${n(T_MIN + 0.05)});`);
tiembla('#anillo', t(68) - 0.03, 20); suena('golpe', t(68), { db: -4 });
a('#arco', `{ stroke: "#B9BBB5" }`, t(70) - 0.05, 0.3);
tiembla('#anillo', t(70) - 0.03, 14);
// "lo conviertes en algo más pequeño": el anillo se encoge
a('#anillo', '{ scale: 0.42, y: -340 }', t(72) - 0.05, t(76) - t(72) + 0.25, 'expo.inOut');
suena('whoosh', t(72), { db: -4 });
de0('#mini', '{ opacity: 0, scale: 0.2, y: 80 }', '{ opacity: 1, scale: 1, y: 0 }', t(78) - 0.06, 0.45, 'back.out(1.8)');
suena('pop', t(78), { db: 2 });
fija('#flechita', '{ opacity: 1 }', t(77));
tl(`tl.fromTo("#flechitap", { strokeDashoffset: 200 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, ${n(t(77))});`);
// "y ese día cuenta": la casilla grande se marca
const T_CUENTA = t(83) - 0.06;
de0('#casilla', '{ opacity: 0, scale: 0.3 }', '{ opacity: 1, scale: 1 }', t(81) - 0.04, 0.35, 'back.out(2)');
a('#casilla', `{ backgroundColor: "${AMB}", borderColor: "${AMB}" }`, T_CUENTA, 0.12);
tl(`tl.fromTo("#casp", { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.28, ease: "power2.out", immediateRender: false }, ${n(T_CUENTA + 0.04)});`);
de0('#cuenta', '{ opacity: 0, scale: 1.5, filter: "blur(12px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', t(84) - 0.04, 0.3, 'back.out(1.8)');
suena('logro', T_CUENTA, { db: -1 }); suena('golpe', t(84) + 0.02, { db: -2 });

// ===== 7 · no te castigas; comodín; días seguidos (25,1 a 32 s, negro) =====
const T_SEM7 = t(85) - 0.06;
sale(['#anillo', '#mini', '#flechita', '#casilla', '#cuenta'], T_SEM7, '{ y: 300, opacity: 0, filter: "blur(10px)" }', 0.22);
fondo(NEG, T_SEM7);
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
html.push(`<div id="tira">${DIAS.map((d, k) => `<div class="dia" id="t${k}"><b>${d}</b><i></i><span class="ok">${svg('chulo', 3.4)}</span>${k === 5 ? `<span class="x">${svg('equis', 3.4)}</span><span class="sh">${svg('escudo', 2.4)}</span>` : ''}</div>`).join('')}</div>`);
de0('#tira', '{ opacity: 0 }', '{ opacity: 1 }', T_SEM7, 0.1);
tl(`tl.fromTo("#tira .dia", { scale: 0, y: 60 }, { scale: 1, y: 0, duration: 0.3, ease: "back.out(2.2)", stagger: 0.05, immediateRender: false }, ${n(T_SEM7 + 0.02)});`);
[0, 1, 2, 3].forEach((k) => { tl(`tl.to("#t${k}", { backgroundColor: "${AMB}", borderColor: "${AMB}", color: "${NEG}", duration: 0.1 }, ${n(t(86) + k * 0.12)});`); fija(`#t${k} .ok`, '{ opacity: 1 }', t(86) + k * 0.12); });
suena('relleno', t(86), { db: 1 });
tl(`tl.fromTo("#t4", { borderColor: "#3A3F47" }, { keyframes: { borderColor: ["#3A3F47", "${AMB}", "#3A3F47", "${AMB}"] }, duration: 0.8, ease: "none", immediateRender: false }, ${n(t(88))});`);
const T_VUEL = t(92) - 0.03;
a('#t4', `{ backgroundColor: "${AMB}", borderColor: "${AMB}", color: "${NEG}" }`, T_VUEL, 0.12);
fija('#t4 .ok', '{ opacity: 1 }', T_VUEL);
late('#t4', T_VUEL, 1, 0.25); suena('pop', T_VUEL, { db: 2 });
a('#tira', '{ scale: 1.06 }', T_SEM7 + 0.5, T_VUEL - T_SEM7 - 0.5, 'sine.inOut');
const T_FALLA = t(99) - 0.04;
a('#t5', '{ borderColor: "#E5534B" }', T_FALLA, 0.12);
fija('#t5 .x', '{ opacity: 1 }', T_FALLA);
tiembla('#t5', T_FALLA, 14); suena('golpe', T_FALLA + 0.03, { db: -4 });
const T_COM = t(102) - 0.08;
de0('#escudo', '{ opacity: 0, y: -700, scale: 2.4, rotation: -30 }', '{ opacity: 1, y: 0, scale: 1, rotation: 0 }', T_COM - 0.25, 0.42, 'power3.in');
fija('#t5 .x', '{ opacity: 0 }', T_COM + 0.17);
a('#t5', `{ backgroundColor: "${VIO}", borderColor: "${VIO}", color: "${NEG}" }`, T_COM + 0.17, 0.1);
fija('#escudo', '{ opacity: 0 }', T_COM + 0.17);
fija('#t5 .sh', '{ opacity: 1 }', T_COM + 0.17);
late('#tira', T_COM + 0.17, 1.06, 0.06); suena('golpe', T_COM + 0.17, { db: 1 });
const T_RAC = t(105) - 0.05;
a('#tira', '{ y: 300, scale: 0.92 }', T_RAC, 0.45, 'expo.inOut');
de0('#rac', '{ opacity: 0, scale: 0.3, y: 120 }', '{ opacity: 1, scale: 1, y: 0 }', T_RAC + 0.05, 0.4, 'back.out(1.8)');
fija('#n18', '{ opacity: 1 }', T_RAC);
a('#n18', '{ y: -200, opacity: 0, filter: "blur(10px)" }', t(107) + 0.05, 0.22, 'power2.in');
de0('#n19', '{ y: 200, opacity: 0, filter: "blur(10px)" }', '{ y: 0, opacity: 1, filter: "blur(0px)" }', t(107) + 0.08, 0.3, 'back.out(2)');
suena('pop', t(107) + 0.1, { db: 2 });
de0('#segu', '{ opacity: 0, y: 30 }', '{ opacity: 1, y: 0 }', t(109) - 0.03, 0.25);
late('#racll', t(109), 1, 0.15);
// los días se multiplican en la cuadrícula del mes (como la de rimu), justo antes del corte
html.push(`<div id="heat">${Array.from({ length: 35 }, (_, k) => `<i class="${[3, 11, 19, 26].includes(k) ? 'vio' : [8, 22].includes(k) ? 'vac' : 'am'}"></i>`).join('')}</div>`);
const T_HEAT = t(110) + 0.05;
sale(['#tira', '#rac', '#segu'], T_HEAT + 0.05, '{ scale: 0.5, opacity: 0, filter: "blur(10px)" }', 0.2);
de0('#heat', '{ opacity: 0, scale: 0.6 }', '{ opacity: 1, scale: 1 }', T_HEAT, 0.3, 'expo.out');
tl(`tl.fromTo("#heat i", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "back.out(2)", stagger: { each: 0.012, from: "random" }, immediateRender: false }, ${n(T_HEAT)});`);
suena('relleno', T_HEAT, { db: 2 });

// ===== 8 · tareas en pasos pequeños hacia un objetivo (32 a 37 s, blanco) =====
const T_TAR = t(111) - 0.06;
sale(['#heat'], T_TAR, '{ scale: 2, opacity: 0, filter: "blur(16px)" }', 0.18);
fondo(BLA, T_TAR);
de0('#tarjeta', '{ opacity: 0, y: -260, rotation: -6 }', '{ opacity: 1, y: 0, rotation: 0 }', T_TAR + 0.04, 0.5, 'back.out(1.4)');
late('#tarjeta', t(117) - 0.03, 1, 0.06); suena('pop', t(117), { db: 1 });
const PASOS = ['Saber qué entra', 'Repasar por temas', 'Practicar', 'El día antes'];
PASOS.forEach((_, k) => { de0(`#p${k}`, '{ opacity: 0, y: -90, scale: 0.9 }', '{ opacity: 1, y: 0, scale: 1 }', t(119) + k * 0.14, 0.35, 'expo.out'); suena('pop', t(119) + k * 0.14, { db: -4 }); });
tl(`tl.fromTo("#hilo", { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "power2.out", immediateRender: false }, ${n(t(119))});`);
[0, 1].forEach((k) => { tl(`tl.to("#p${k} .circ", { backgroundColor: "${AMB}", borderColor: "${AMB}", color: "${NEG}", duration: 0.12 }, ${n(t(123) + k * 0.16)});`); suena('toque', t(123) + k * 0.16, { db: -2 }); });
a('#tbarf', '{ scaleX: 0.5 }', t(123), 0.45, 'expo.out');
const T_OBJ = t(126) - 0.06;
de0('#obj', '{ opacity: 0, scale: 0.2, y: 60 }', '{ opacity: 1, scale: 1, y: 0 }', T_OBJ, 0.45, 'back.out(2)');
tl(`tl.fromTo("#objaro", { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 2.3, duration: 0.7, ease: "power2.out", immediateRender: false }, ${n(t(127))});`);
suena('golpe', t(127) + 0.03);
a('#tareasg', '{ y: -40 }', T_TAR + 0.5, T_OBJ - T_TAR, 'sine.inOut');

// ===== 9 · la Biblioteca: tareas y planes de 30 días ya armados (37,3 a 41,7 s, negro) =====
const T_BIB = t(128) - 0.06;
sale(['#tareasg', '#obj', '#objaro'], T_BIB, '{ y: -300, opacity: 0, filter: "blur(10px)" }', 0.2);
fondo(NEG, T_BIB);
de0('#duda', '{ opacity: 0, scale: 0.3 }', '{ opacity: 1, scale: 1 }', T_BIB + 0.04, 0.4, 'back.out(2)');
tl(`tl.to("#duda", { keyframes: { rotation: [0, -10, 9, -6, 0] }, duration: 0.9, ease: "none" }, ${n(t(131))});`);
const PACKS = [['sol', 'Mañana'], ['birrete', 'Estudio'], ['celular', 'Celular'], ['libro', 'Leer más'], ['billetera', 'Tu plata'], ['casa', 'Casa'], ['luna', 'Dormir'], ['tareas', 'Trámites'], ['diana', 'Examen']];
const T_PACK = t(135) - 0.05;
sale(['#duda'], T_PACK, '{ scale: 0, opacity: 0 }', 0.15);
PACKS.forEach(([ic, nom], k) => {
  const x = 250 + (k % 3) * 290, y = 600 + Math.floor(k / 3) * 300;
  html.push(`<div class="tile osc" id="b${k}" style="left:${x - 100}px;top:${y - 100}px"><div class="tl">${svg(ic, 1.7)}</div><p>${nom}</p></div>`);
  de0(`#b${k}`, `{ opacity: 0, scale: 3, filter: "blur(26px)", transformPerspective: 900, rotationX: ${y < 900 ? 35 : y > 900 ? -35 : 0} }`, '{ opacity: 1, scale: 1, filter: "blur(0px)", rotationX: 0 }', T_PACK + [4, 1, 6, 2, 0, 7, 3, 8, 5][k] * 0.04, 0.5, 'expo.out');
});
suena('whoosh', T_PACK, { db: 1 });
fija('#packs', '{ transformPerspective: 1400 }', 0);
tl(`tl.to("#packs", { rotationY: 14, rotationX: -8, duration: ${n(t(139) - T_PACK)}, ease: "sine.inOut" }, ${n(T_PACK)});`);
// "planes de 30 días": la cuadrícula sube y el número corre de 1 a 30
const T_30 = t(139) - 0.05;
a('#packs', '{ y: -520, scale: 0.55, opacity: 0.25, filter: "blur(4px)" }', T_30, 0.45, 'expo.inOut');
contador('n30', Array.from({ length: 30 }, (_, k) => String(k + 1)), T_30 + 0.15, 0.026, 'grande30');
de0('#n30', '{ opacity: 0, scale: 0.5 }', '{ opacity: 1, scale: 1 }', T_30 + 0.1, 0.3, 'back.out(1.6)');
suena('relleno', T_30 + 0.15, { db: 1 });
de0('#dias30', '{ opacity: 0, y: 30 }', '{ opacity: 1, y: 0 }', t(142) - 0.03, 0.25);
late('#n30', t(142), 1, 0.08); suena('golpe', t(142) + 0.02, { db: -1 });
de0('#armado', '{ opacity: 0, scale: 0, rotation: -40 }', '{ opacity: 1, scale: 1, rotation: 0 }', t(144) - 0.03, 0.35, 'back.out(2.4)');
suena('pop', t(144), { db: 1 });

// ===== 10 · tu semana: cada paso en su día, junto a tus citas (41,7 a 45,2 s, blanco) =====
const T_SEM = t(145) - 0.06;
sale(['#packs', '#n30', '#dias30', '#armado'], T_SEM, '{ scale: 0.4, opacity: 0, filter: "blur(10px)" }', 0.2);
fondo(BLA, T_SEM);
tl(`tl.fromTo(".col", { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "expo.out", stagger: 0.04, immediateRender: false }, ${n(T_SEM + 0.02)});`);
de0('#semana', '{ opacity: 0 }', '{ opacity: 1 }', T_SEM, 0.05);
const CHIPS = [[0, 0], [1, 1], [2, 0], [2, 2], [3, 1], [4, 0], [5, 1]];
CHIPS.forEach(([c, r], k) => { de0(`#c${k}`, '{ opacity: 0, y: -900, rotation: -12 }', '{ opacity: 1, y: 0, rotation: 0 }', t(148) + k * 0.1, 0.45, 'back.out(1.3)'); suena('pop', t(148) + k * 0.1 + 0.35, { db: -5 }); });
const T_CITA = t(156) - 0.1;
de0('#cita', '{ opacity: 0, y: -900, scale: 1.4 }', '{ opacity: 1, y: 0, scale: 1 }', T_CITA, 0.5, 'back.out(1.5)');
suena('golpe', T_CITA + 0.45, { db: -2 });
late('#semana', T_CITA + 0.45, 1, 0.04);

// ===== 11 · el temporizador (45,2 a 48 s, negro): el anillo y el reloj que corre =====
const T_FOC = t(159) - 0.06;
sale(['#semana'], T_FOC, '{ scale: 0.5, opacity: 0, filter: "blur(10px)" }', 0.2);
fondo(NEG, T_FOC);
de0('#foco', '{ opacity: 0, scale: 0.4, rotation: 60 }', '{ opacity: 1, scale: 1, rotation: 0 }', T_FOC + 0.02, 0.5, 'expo.out');
const SEGS = Array.from({ length: 36 }, (_, k) => { const s = 1500 - k * 7; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; });
contador('reloj', SEGS, T_FOC + 0.25, 0.075, 'reloj');
fija('#reloj', '{ opacity: 1 }', T_FOC);
tl(`tl.fromTo("#farco", { strokeDashoffset: 0 }, { strokeDashoffset: 300, duration: ${n(36 * 0.075)}, ease: "none", immediateRender: false }, ${n(T_FOC + 0.25)});`);
late('#foco', t(166) - 0.02, 1, 0.07); suena('golpe', t(166) + 0.03, { db: -3 });
for (let k = 0; k < 5; k++) suena('toque', T_FOC + 0.3 + k * 0.45, { db: -8 });

// ===== 12 · el aviso y Progreso (48 a 53 s, negro) =====
const T_AV = t(168) - 0.1;
sale(['#foco'], T_AV, '{ scale: 0.3, opacity: 0, y: 300, filter: "blur(10px)" }', 0.2);
de0('#aviso', '{ y: -900, opacity: 1 }', '{ y: 0, opacity: 1 }', T_AV, 0.5, 'expo.out');
tl(`tl.to("#avic", { keyframes: { rotation: [0, -18, 16, -12, 8, 0] }, duration: 0.6, ease: "none" }, ${n(t(170))});`);
suena('pop', t(170), { db: 2 });
const T_PRO = t(176) - 0.06;
a('#aviso', '{ y: -1300, opacity: 0 }', T_PRO - 0.2, 0.25, 'power3.in');
de0('#radar', '{ opacity: 0, scale: 0.5, rotation: -30 }', '{ opacity: 1, scale: 1, rotation: 0 }', T_PRO, 0.5, 'expo.out');
de0('#poli', '{ scale: 0 }', '{ scale: 1 }', t(177) - 0.05, 0.6, 'back.out(1.5)');
suena('subida', t(177) + 0.5, { modo: 'fin', db: -4 });
contador('n91', Array.from({ length: 22 }, (_, k) => String(70 + k)), t(177), 0.03, 'n91');
de0('#n91', '{ opacity: 0, y: 30 }', '{ opacity: 1, y: 0 }', t(177) - 0.05, 0.25);
tl(`tl.fromTo("#vtop", { scale: 1, opacity: 0 }, { keyframes: { scale: [1, 2.6], opacity: [1, 0] }, duration: 0.7, ease: "power2.out", repeat: 1, immediateRender: false }, ${n(t(181) - 0.03)});`);
a('#lCama', `{ color: "${AMB}", scale: 1.2 }`, t(181) - 0.03, 0.2);
suena('golpe', t(181), { db: -3 });
tl(`tl.fromTo("#vizq", { scale: 1, opacity: 0 }, { keyframes: { scale: [1, 2.6], opacity: [1, 0] }, duration: 0.7, ease: "power2.out", repeat: 1, immediateRender: false }, ${n(t(184) - 0.03)});`);
a('#lGasto', '{ color: "#E5534B", scale: 1.2 }', t(184) - 0.03, 0.2);
tiembla('#lGasto', t(185), 10); suena('golpe', t(184), { db: -5 });

// ===== 13 · en tu celular y en tu computador, un solo pago (53,1 a 55,6 s, blanco): el único vistazo a la app =====
const T_DIS = t(186) - 0.06;
sale(['#radar', '#n91'], T_DIS, '{ scale: 0.4, opacity: 0, filter: "blur(10px)" }', 0.2);
fondo(BLA, T_DIS);
de0('#cel', '{ opacity: 0, y: 700, rotation: 10 }', '{ opacity: 1, y: 0, rotation: -4 }', T_DIS + 0.04, 0.5, 'expo.out');
de0('#lap', '{ opacity: 0, x: 900, scale: 0.8 }', '{ opacity: 1, x: 0, scale: 1 }', t(192) - 0.08, 0.5, 'expo.out');
a('#cel', '{ x: -170, y: 230, scale: 0.78, rotation: -8 }', t(192) - 0.08, 0.5, 'expo.inOut');
suena('whoosh', t(192) - 0.06);
const T_PAGO = t(195) - 0.06;
de0('#pago', '{ opacity: 0, scale: 0.3, y: 80 }', '{ opacity: 1, scale: 1, y: 0 }', T_PAGO, 0.35, 'back.out(2)');
suena('golpe', T_PAGO + 0.04, { db: 1 });

// ===== 14 · cierre (55,6 s, negro) =====
const T_FIN = t(197) - 0.06;
sale(['#cel', '#lap', '#pago'], T_FIN, '{ scale: 0.1, opacity: 0, filter: "blur(10px)" }', 0.22);
fondo(NEG, T_FIN);
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

// golpes de cámara: un acercamiento corto y seco en cada golpe (sin encimarse)
{
  let ult = -1;
  [...golpes].sort((x, y) => x - y).forEach((g) => { if (g - ult < 0.42) return; ult = g; tl('tl.fromTo("#golpe", { scale: 1.07 }, { scale: 1, duration: 0.4, ease: "expo.out", immediateRender: false }, ' + n(g) + ');'); });
}
// ===== la cámara (#lente): en cada escena se acerca a lo que se nombra, recorre y se aleja; nunca se mece =====
{
  const pon = (props, tt) => fija('#lente', props, tt);
  const va = (props, t0, t1, ease = 'sine.inOut') => { if (t1 - t0 > 0.05) a('#lente', props, t0, t1 - t0, ease); };
  const salta = (props, tt, dur = 0.45, ease = 'expo.inOut') => a('#lente', props, tt, dur, ease);
  pon('{ scale: 1, x: 0, y: 0 }', 0);
  va('{ scale: 1.14 }', 0, T_BAN - 0.05);
  // el camino: la cámara arranca abajo y sube hasta la bandera
  pon('{ scale: 1.18, x: 0, y: -260 }', T_BAN);
  va('{ y: 230 }', T_BAN + 0.05, T_LLEGAR);
  salta('{ scale: 1, y: 0 }', T_LLEGAR + 0.1, 0.6);
  va('{ scale: 1.08 }', T_LLEGAR + 0.75, T_SIS - 0.05);
  // la cuadrícula: de cerca a lejos
  pon('{ scale: 1.3, x: 0, y: 0 }', T_SIS);
  salta('{ scale: 1 }', T_SIS, 0.7, 'expo.out');
  va('{ scale: 1.05 }', T_SIS + 0.72, T_RACHA - 0.03);
  // Racha: se acerca al ícono; la red: se aleja para verla entera
  salta('{ scale: 1.18, y: 40 }', T_RACHA, 0.45, 'expo.out');
  salta('{ scale: 0.94, y: 0 }', T_RED, 0.8);
  va('{ scale: 1.02 }', T_RED + 0.85, T_HAB - 0.05);
  // la lista: recorre de izquierda a derecha; en "3" salta al número
  pon('{ scale: 1.12, x: 70, y: 0 }', T_HAB);
  va('{ scale: 1.05, x: 0 }', T_HAB + 0.05, T_TRES - 0.05);
  salta('{ scale: 1.14, x: -30, y: 180 }', T_TRES, 0.4, 'expo.out');
  va('{ scale: 1, x: 0, y: 0 }', T_TRES + 0.45, T_AN - 0.05);
  // anclar: de cerca en almorzar, paneo a estudiar, y se abre para ver los dos
  pon('{ scale: 1.18, x: 210, y: 0 }', T_AN);
  va('{ x: 170 }', T_AN + 0.05, t(60) - 0.15);
  salta('{ x: -210 }', t(60) - 0.1, 0.5);
  salta('{ scale: 1, x: 0 }', t(62) + 0.1, 0.55);
  // el anillo: empuja hacia él; se abre cuando se encoge; baja a la casilla en "cuenta"
  pon('{ scale: 1.2, x: 0, y: 0 }', T_MIN);
  va('{ scale: 1.32 }', T_MIN + 0.05, t(71) - 0.1);
  salta('{ scale: 1, y: 0 }', t(72) - 0.05, 0.5);
  salta('{ scale: 1.15, y: -200 }', T_CUENTA - 0.3, 0.5);
  // la semana: recorre los días; salta al sábado; se abre para la llama
  pon('{ scale: 1.2, x: 150, y: 0 }', T_SEM7);
  va('{ x: 30 }', T_SEM7 + 0.05, T_VUEL - 0.05);
  salta('{ x: -110 }', T_FALLA - 0.35, 0.45);
  salta('{ scale: 1, x: 0 }', T_RAC - 0.05, 0.5);
  va('{ scale: 1.08 }', T_RAC + 0.5, T_HEAT - 0.05);
  pon('{ scale: 1.45, x: 0, y: 0 }', T_HEAT);
  salta('{ scale: 1 }', T_HEAT, T_TAR - T_HEAT - 0.05, 'expo.out');
  // la tarea: arriba en la tarjeta y baja por los pasos hasta la bandera
  pon('{ scale: 1.2, x: 50, y: 330 }', T_TAR);
  va('{ y: -60 }', t(119), T_OBJ + 0.2);
  salta('{ scale: 1, x: 0, y: 0 }', T_OBJ + 0.3, Math.max(0.3, T_BIB - T_OBJ - 0.35));
  // la Biblioteca: empuja a la duda; los packs de cerca a lejos; se acerca al 30
  pon('{ scale: 1.2, x: 0, y: 0 }', T_BIB);
  va('{ scale: 1.3 }', T_BIB + 0.05, T_PACK - 0.05);
  pon('{ scale: 1.35 }', T_PACK);
  salta('{ scale: 0.95 }', T_PACK, 0.9, 'expo.out');
  salta('{ scale: 1.2 }', T_30 + 0.1, 0.5);
  // la semana: recorre las columnas de lunes a domingo y se acerca a la cita
  pon('{ scale: 1.3, x: 200, y: 50 }', T_SEM);
  va('{ x: -200 }', T_SEM + 0.1, T_CITA - 0.05);
  salta('{ scale: 1.5, x: 126, y: -384 }', T_CITA + 0.1, 0.5);
  // el temporizador: entra de cerca, se abre y empuja
  pon('{ scale: 1.35, x: 0, y: 0 }', T_FOC);
  salta('{ scale: 1.05 }', T_FOC + 0.02, 0.9, 'expo.out');
  va('{ scale: 1.2 }', T_FOC + 0.95, T_AV - 0.05);
  // el aviso y el radar: de cerca a lejos; salta a la punta firme y a la que necesita ayuda
  pon('{ scale: 1.15, x: 0, y: 0 }', T_AV);
  va('{ scale: 1.05 }', T_AV, T_PRO - 0.25);
  pon('{ scale: 1.4 }', T_PRO);
  salta('{ scale: 1 }', T_PRO, 0.8, 'expo.out');
  salta('{ scale: 1.35, x: 0, y: 283 }', t(181) - 0.15, 0.45);
  salta('{ x: 283, y: -210 }', t(184) - 0.15, 0.45);
  salta('{ scale: 1, x: 0, y: 0 }', t(185) + 0.1, 0.35);
  // celular y computador: de cerca a lejos; baja al precio
  pon('{ scale: 1.25, x: 0, y: 0 }', T_DIS);
  salta('{ scale: 1 }', T_DIS, 0.8, 'expo.out');
  salta('{ scale: 1.1, y: -120 }', T_PAGO - 0.05, 0.5);
  // cierre
  pon('{ scale: 1.2, x: 0, y: 0 }', T_FIN);
  salta('{ scale: 1 }', T_FIN, 0.8, 'expo.out');
  va('{ scale: 1.06 }', T_FIN + 0.85, TOTAL - 0.05);
}

// ---------- mezcla de efectos ----------
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
  fs.writeFileSync(path.join(BASE, 'sistema2-sonidos.txt'), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(10)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}

// ---------- la página ----------
const ESCAL = ESC.map(([x, y], k) => `<div class="esc" id="e${k}" style="left:${x}px;top:${y}px"></div>`).join('');
const COLS = DIAS.map((d, k) => `<div class="colw" style="left:${96 + k * 128}px"><b>${d}</b><div class="col"></div></div>`).join('');
const CHIPH = CHIPS.map(([c, r], k) => `<div class="chip" id="c${k}" style="left:${106 + c * 128}px;top:${830 + r * 120}px"></div>`).join('');
// el radar: centro (540, 980); tres puntas
const RC = [540, 1000], RV = [[540, 700], [280, 1150], [800, 1150]];
const tri = (s) => RV.map(([x, y]) => `${n(RC[0] + (x - RC[0]) * s)},${n(RC[1] + (y - RC[1]) * s)}`).join(' ');
const POLI = [[540, 735], [395, 1083], [745, 1118]].map(([x, y]) => `${x},${y}`).join(' ');
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · un sistema (v2)</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 300; src: url("assets/fuentes/barlow-300.woff2") format("woff2"); }
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlowc-700.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: ${NEG}; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #fondo { position: absolute; inset: 0; background: ${NEG}; }
      #mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 540px 900px; }
      .capa { position: absolute; inset: 0; }
      #golpe, #lente { transform-origin: 540px 900px; }
      .grande { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; line-height: 1; color: #F5F5F2; opacity: 0; }
      #meta { top: 560px; font-size: 330px; color: ${AMB}; }
      #barra { position: absolute; left: 160px; top: 980px; width: 760px; height: 46px; border-radius: 23px; background: #23262B; overflow: hidden; opacity: 0; }
      #barf { width: 100%; height: 100%; background: ${AMB}; transform-origin: 0 50%; border-radius: 23px; }
      .cont { position: absolute; left: 0; right: 0; opacity: 0; }
      .cont span { position: absolute; left: 0; right: 0; text-align: center; opacity: 0; }
      .dias { top: 1080px; height: 90px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 72px; color: #F5F5F2; }
      #ban { position: absolute; left: 430px; top: 230px; width: 220px; height: 220px; color: ${GRIS}; opacity: 0; }
      #ban svg, .tl svg, #escudo svg, #racll svg, #duda svg, #obj svg, #avic svg { width: 100%; height: 100%; }
      #banaro { position: absolute; left: 400px; top: 200px; width: 280px; height: 280px; border-radius: 50%; border: 6px solid ${AMB}; opacity: 0; }
      #camino, #red { position: absolute; inset: 0; opacity: 0; }
      #escalera { position: absolute; inset: 0; }
      .esc { position: absolute; width: 96px; height: 96px; margin: -48px 0 0 -48px; border-radius: 24px; border: 6px solid #3A3F47; background: #15171A; opacity: 0; }
      #rejilla, #packs { position: absolute; inset: 0; transform-origin: 540px 860px; transform-style: preserve-3d; perspective: 1400px; }
      .tile { position: absolute; width: 200px; height: 240px; opacity: 0; text-align: center; }
      .tile .tl { width: 200px; height: 200px; border-radius: 52px; background: #E4E4DF; color: ${TINTA}; padding: 50px; box-shadow: 0 18px 40px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,0.8); }
      .tile p { margin-top: 14px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 34px; color: #4A4D53; }
      .tile.centro { width: 200px; height: 200px; }
      .tile.centro .tl { background: ${AMB}; color: ${TINTA}; }
      .tile.osc .tl { background: #1B1D21; color: #F5F5F2; box-shadow: 0 18px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08); }
      .tile.osc p { color: #A8AFB8; }
      #gic { position: absolute; left: 0; top: 0; width: 200px; height: 200px; border-radius: 52px; opacity: 0; }
      #siste { position: absolute; left: 0; right: 0; top: 1480px; text-align: center; font-family: "Barlow", sans-serif; font-size: 96px; color: ${TINTA}; opacity: 0; }
      #siste span, .fino { font-weight: 300; } #siste b { font-weight: 600; }
      #nomr { position: absolute; left: 0; right: 0; top: 1460px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 130px; color: ${TINTA}; opacity: 0; }
      #lhab { position: absolute; left: 130px; top: 680px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 40px; color: #7D858F; opacity: 0; }
      .fila { position: absolute; left: 130px; display: flex; align-items: center; gap: 28px; height: 90px; opacity: 0; font-family: "Barlow", sans-serif; font-size: 58px; color: #F5F5F2; }
      .fila b { font-weight: 300; }
      .fila.fant { color: #6B7079; }
      .circ { width: 62px; height: 62px; border-radius: 50%; border: 5px solid #5B6068; color: transparent; display: grid; place-items: center; flex: none; }
      .circ svg { width: 38px; height: 38px; }
      .fic { width: 62px; height: 62px; color: #A8AFB8; flex: none; }
      #tres { right: 150px; left: auto; top: 380px; font-size: 360px; color: ${AMB}; }
      #ancla { position: absolute; inset: 0; transform-origin: 540px 900px; }
      .bloque { position: absolute; top: 700px; width: 280px; height: 280px; border-radius: 70px; padding: 70px; opacity: 0; }
      .bloque svg { width: 100%; height: 100%; }
      #tA { left: 110px; background: #1B1D21; color: #F5F5F2; }
      #tB { left: 690px; background: ${AMB}; color: ${TINTA}; }
      #cadena { position: absolute; inset: 0; opacity: 0; }
      #nudo { position: absolute; left: 480px; top: 780px; width: 120px; height: 120px; border-radius: 50%; background: ${NEG}; border: 6px solid ${AMB}; color: ${AMB}; padding: 24px; opacity: 0; }
      #nudo svg { width: 100%; height: 100%; }
      #frec { position: absolute; left: 70px; top: 1040px; width: 360px; display: flex; justify-content: center; gap: 14px; }
      #frec i { width: 36px; height: 36px; border-radius: 10px; background: #2A2D32; display: block; }
      .lab { position: absolute; top: 1040px; width: 520px; text-align: center; font-family: "Barlow", sans-serif; font-size: 56px; line-height: 1.15; opacity: 0; }
      #txA { left: -10px; color: #F5F5F2; } #txA b, #txB b { font-weight: 600; } #txA span, #txB span { font-weight: 300; }
      #txB { left: 570px; color: ${AMB}; }
      #anillo { position: absolute; left: 190px; top: 560px; width: 700px; height: 700px; opacity: 0; }
      #anillo svg { position: absolute; inset: 0; }
      #anillo .num { position: absolute; left: 0; right: 0; top: 220px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 220px; line-height: 1; color: ${TINTA}; }
      #anillo .min { position: absolute; left: 0; right: 0; top: 440px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 60px; color: #4A4D53; }
      #flechita { position: absolute; inset: 0; opacity: 0; }
      #mini { position: absolute; left: 290px; top: 760px; width: 500px; height: 170px; border-radius: 46px; background: ${TINTA}; color: #F5F5F2; display: flex; align-items: center; justify-content: center; gap: 26px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 60px; opacity: 0; box-shadow: 0 20px 50px rgba(0,0,0,0.25); }
      #mini svg { width: 74px; height: 74px; color: ${AMB}; }
      #casilla { position: absolute; left: 430px; top: 1060px; width: 220px; height: 220px; border-radius: 56px; border: 12px solid ${TINTA}; opacity: 0; }
      #casilla svg { width: 100%; height: 100%; }
      #cuenta { top: 1340px; font-size: 170px; color: ${TINTA}; }
      #tira { position: absolute; left: 0; right: 0; top: 820px; display: flex; justify-content: center; gap: 14px; opacity: 0; }
      .dia { position: relative; width: 110px; height: 170px; border-radius: 26px; border: 5px solid #3A3F47; background: #15171A; color: #F5F5F2; display: flex; flex-direction: column; align-items: center; padding-top: 22px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 42px; }
      .dia .ok, .dia .x, .dia .sh { position: absolute; left: 23px; top: 78px; width: 64px; height: 64px; opacity: 0; color: ${NEG}; }
      .dia .x { color: #E5534B; }
      .dia svg { width: 100%; height: 100%; }
      #escudo { position: absolute; left: 708px; top: 840px; width: 130px; height: 130px; color: ${VIO}; opacity: 0; }
      #rac { position: absolute; left: 0; right: 0; top: 420px; display: flex; justify-content: center; align-items: center; gap: 30px; opacity: 0; }
      #racll { width: 230px; height: 230px; color: ${AMB}; }
      #racn { position: relative; width: 300px; height: 250px; overflow: hidden; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 250px; line-height: 250px; color: #F5F5F2; }
      #racn span { position: absolute; left: 0; top: 0; opacity: 0; }
      #segu { top: 720px; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 70px; }
      #heat { position: absolute; left: 198px; top: 610px; width: 700px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; opacity: 0; }
      #heat i { display: block; width: 84px; height: 84px; border-radius: 20px; }
      #heat .am { background: ${AMB}; } #heat .vio { background: ${VIO}; } #heat .vac { background: #23262B; }
      #tareasg { position: absolute; inset: 0; }
      #tarjeta { position: absolute; left: 100px; top: 480px; width: 880px; height: 200px; border-radius: 44px; background: #FFFFFF; box-shadow: 0 24px 60px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 34px; padding: 0 46px; opacity: 0; font-family: "Barlow", sans-serif; }
      #tarjeta .tic { width: 110px; height: 110px; border-radius: 30px; background: ${TINTA}; color: ${AMB}; padding: 24px; flex: none; }
      #tarjeta .tic svg { width: 100%; height: 100%; }
      #tarjeta b { display: block; font-weight: 600; font-size: 54px; color: ${TINTA}; }
      #tbar { margin-top: 18px; width: 560px; height: 16px; border-radius: 8px; background: #E4E4DF; overflow: hidden; }
      #tbarf { width: 100%; height: 100%; background: ${AMB}; transform-origin: 0 50%; }
      #hilo { position: absolute; left: 196px; top: 690px; width: 6px; height: 640px; background: #CFCFCA; transform-origin: 50% 0; }
      .paso { position: absolute; left: 165px; display: flex; align-items: center; gap: 30px; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 54px; color: ${TINTA}; opacity: 0; }
      .paso .circ { border-color: #9A9C97; background: ${BLA}; }
      #obj { position: absolute; left: 150px; top: 1290px; width: 100px; height: 100px; color: ${AMB}; opacity: 0; }
      #objaro { position: absolute; left: 130px; top: 1270px; width: 140px; height: 140px; border-radius: 50%; border: 6px solid ${AMB}; opacity: 0; }
      #objtx { position: absolute; left: 290px; top: 1310px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 54px; color: ${TINTA}; }
      #duda { position: absolute; left: 400px; top: 820px; width: 280px; height: 280px; color: #6B7079; opacity: 0; }
      .grande30 { top: 760px; height: 330px; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 330px; line-height: 330px; color: ${AMB}; }
      #dias30 { top: 1110px; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 90px; }
      #armado { position: absolute; left: 760px; top: 760px; width: 120px; height: 120px; border-radius: 50%; background: ${AMB}; color: ${NEG}; padding: 26px; opacity: 0; }
      #armado svg { width: 100%; height: 100%; }
      #semana { position: absolute; inset: 0; opacity: 0; }
      .colw { position: absolute; top: 700px; width: 112px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 44px; color: #4A4D53; }
      .col { margin-top: 18px; width: 112px; height: 520px; border-radius: 30px; background: #E4E4DF; transform-origin: 50% 0; }
      .chip { position: absolute; width: 92px; height: 92px; border-radius: 24px; background: ${TINTA}; opacity: 0; }
      .chip::after { content: ""; position: absolute; left: 22px; right: 22px; top: 40px; height: 12px; border-radius: 6px; background: #5B6068; }
      #cita { position: absolute; left: 338px; top: 1150px; width: 236px; height: 92px; border-radius: 24px; background: ${AMB}; color: ${TINTA}; display: flex; align-items: center; justify-content: center; gap: 10px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 40px; opacity: 0; box-shadow: 0 14px 30px rgba(0,0,0,0.18); }
      #cita svg { width: 40px; height: 40px; }
      #foco { position: absolute; left: 140px; top: 560px; width: 800px; height: 800px; opacity: 0; }
      #foco svg { position: absolute; inset: 0; }
      .reloj { top: 300px; height: 200px; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 200px; line-height: 200px; color: #F5F5F2; }
      #aviso { position: absolute; left: 50px; right: 50px; top: 760px; padding: 40px 44px; border-radius: 50px; background: rgba(44, 47, 52, 0.97); box-shadow: 0 20px 60px rgba(0,0,0,0.6); display: flex; gap: 34px; align-items: center; opacity: 0; font-family: "Barlow", sans-serif; }
      #avic { width: 120px; height: 120px; border-radius: 30px; background: ${AMB}; color: ${NEG}; padding: 26px; flex: none; transform-origin: 50% 10%; }
      #aviso .ap { font-size: 34px; color: #A8AFB8; font-weight: 300; }
      #aviso .ti { font-size: 48px; color: #F5F5F2; font-weight: 600; margin-top: 4px; }
      #radar { position: absolute; inset: 0; opacity: 0; transform-origin: 540px 1000px; }
      .vert { position: absolute; width: 60px; height: 60px; margin: -30px 0 0 -30px; border-radius: 50%; border: 6px solid ${AMB}; opacity: 0; }
      .rlab { position: absolute; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 48px; color: #F5F5F2; }
      .n91 { top: 380px; height: 220px; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 220px; line-height: 220px; color: #F5F5F2; }
      #cel { position: absolute; left: 330px; top: 520px; width: 420px; height: 880px; border-radius: 64px; border: 14px solid ${TINTA}; overflow: hidden; background: #0F1113; opacity: 0; box-shadow: 0 30px 70px rgba(0,0,0,0.3); z-index: 3; }
      #cel img { width: 100%; display: block; }
      #lap { position: absolute; left: 150px; top: 520px; width: 880px; opacity: 0; z-index: 2; }
      #lap .pant { width: 880px; height: 556px; border-radius: 26px 26px 0 0; border: 16px solid ${TINTA}; border-bottom-width: 22px; overflow: hidden; background: #0F1113; }
      #lap .pant img { width: 100%; display: block; }
      #lap .base { width: 1000px; height: 30px; margin-left: -60px; border-radius: 0 0 30px 30px; background: #2A2D32; }
      #pago { position: absolute; left: 0; right: 0; top: 1500px; text-align: center; opacity: 0; z-index: 5; }
      #pago span { display: inline-block; padding: 22px 50px 28px; border-radius: 999px; background: ${AMB}; color: ${NEG}; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 66px; box-shadow: 0 16px 50px rgba(0,0,0,0.25); }
      #fin { position: absolute; left: 410px; top: 420px; width: 260px; height: 260px; border-radius: 62px; opacity: 0; }
      .anillo { position: absolute; border: 6px solid ${AMB}; opacity: 0; }
      .chica { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 64px; color: #F5F5F2; opacity: 0; }
      #esc { top: 712px; } #ytela { top: 1090px; }
      #marca { position: absolute; left: 0; right: 0; top: 824px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 250px; line-height: 1; color: ${AMB}; opacity: 0; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1190px; display: flex; justify-content: center; opacity: 0; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 34px; color: #F5F5F2; background: #15171A; border: 3px solid ${AMB}; border-radius: 999px; padding: 14px 30px 18px; white-space: nowrap; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="fondo"></div>
      <div id="mundo"><div id="lente" class="capa"><div id="golpe" class="capa">
        <p class="grande" id="meta">META</p>
        <div id="barra"><div id="barf"></div></div>
        ${CONT.dias}
        <svg id="camino" viewBox="0 0 1080 1920"><path id="caminop" d="M540 1500 C 380 1380, 700 1230, 520 1100 S 380 820, 560 700 S 560 520, 540 470" fill="none" stroke="#3A3F47" stroke-width="10" stroke-linecap="round" stroke-dasharray="1400"/></svg>
        <div id="escalera">${ESCAL}</div>
        <div id="banaro"></div>
        <div id="ban">${svg('flag', 1.8)}</div>
        <div id="rejilla">
          ${html.filter((h) => h.startsWith('<svg id="red"')).join('')}
          ${html.filter((h) => /id="g\d"/.test(h)).join('\n          ')}
          <div class="tile centro" id="gc" style="left:440px;top:760px"><div class="tl">${svg('flag', 1.7)}</div><img id="gic" src="assets/icono.svg" /></div>
        </div>
        <p id="siste"><span>un</span> <b>sistema</b></p>
        <p id="nomr">Racha</p>
        <p id="lhab">Hábitos</p>
        ${html.filter((h) => h.startsWith('<div class="fila')).join('\n        ')}
        <p class="grande" id="tres">3</p>
        <div id="ancla">
          <svg id="cadena" viewBox="0 0 1080 1920"><path id="cadenap" d="M390 840 L 690 840" fill="none" stroke="${GRIS}" stroke-width="10" stroke-linecap="round" stroke-dasharray="300"/></svg>
          <div class="bloque" id="tA">${svg('cubiertos', 1.7)}</div>
          <div class="bloque" id="tB">${svg('birrete', 1.7)}</div>
          <div id="nudo">${svg('enlace', 2.2)}</div>
          <div id="frec">${Array.from({ length: 7 }, () => '<i></i>').join('')}</div>
          <p class="lab" id="txA"><span>Después de</span><br/><b>almorzar</b></p>
          <p class="lab" id="txB"><span>estudias</span><br/><b>25 minutos</b></p>
        </div>
        <div id="anillo"><svg viewBox="0 0 700 700"><circle cx="350" cy="350" r="260" fill="none" stroke="#E4E4DF" stroke-width="34"/><circle id="arco" cx="350" cy="350" r="260" fill="none" stroke="${TINTA}" stroke-width="34" stroke-linecap="round" stroke-dasharray="1633" transform="rotate(-90 350 350)"/></svg><p class="num">25</p><p class="min">minutos</p></div>
        <svg id="flechita" viewBox="0 0 1080 1920"><path id="flechitap" d="M540 700 L 540 752 M 510 722 L 540 752 L 570 722" fill="none" stroke="${TINTA}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="200"/></svg>
        <div id="mini">${svg('libro', 2)}un párrafo</div>
        <div id="casilla"><svg viewBox="0 0 24 24" fill="none" stroke="${NEG}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path id="casp" d="M20 6 9 17l-5-5" stroke-dasharray="30" stroke-dashoffset="30"/></svg></div>
        <p class="grande" id="cuenta">cuenta</p>
        ${html.filter((h) => h.startsWith('<div id="tira"')).join('')}
        <div id="escudo">${svg('escudo', 2)}</div>
        <div id="rac"><div id="racll">${svg('llama', 1.8)}</div><div id="racn"><span id="n18">18</span><span id="n19">19</span></div></div>
        <p class="grande" id="segu">días seguidos</p>
        ${html.filter((h) => h.startsWith('<div id="heat"')).join('')}
        <div id="tareasg">
          <div id="hilo"></div>
          <div id="tarjeta"><div class="tic">${svg('birrete', 2)}</div><div><b>Preparar un examen</b><div id="tbar"><div id="tbarf"></div></div></div></div>
          ${PASOS.map((p, k) => `<div class="paso" id="p${k}" style="top:${730 + k * 140}px"><span class="circ">${svg('chulo', 3.4)}</span>${p}</div>`).join('\n          ')}
          <div id="objaro"></div>
          <div id="obj">${svg('flag', 2)}</div>
        </div>
        <div id="duda">${svg('pregunta', 1.6)}</div>
        <div id="packs">${html.filter((h) => /id="b\d"/.test(h)).join('\n          ')}</div>
        ${CONT.n30}
        <p class="grande" id="dias30">días</p>
        <div id="armado">${svg('chulo', 3.2)}</div>
        <div id="semana">${COLS}${CHIPH}<div id="cita">${svg('reloj', 2.4)}5:30</div></div>
        <div id="foco"><svg viewBox="0 0 800 800"><circle cx="400" cy="400" r="320" fill="none" stroke="#23262B" stroke-width="44"/><circle id="farco" cx="400" cy="400" r="320" fill="none" stroke="${AMB}" stroke-width="44" stroke-linecap="round" stroke-dasharray="2011" transform="rotate(-90 400 400)"/></svg>${CONT.reloj}</div>
        <div id="aviso"><div id="avic">${svg('campana', 2)}</div><div><p class="ap">Racha · ahora</p><p class="ti">Después de almorzar: Estudiar 25 minutos</p></div></div>
        <div id="radar">
          <svg viewBox="0 0 1080 1920" style="position:absolute;inset:0">
            ${[1, 0.66, 0.33].map((s) => `<polygon points="${tri(s)}" fill="none" stroke="#2E3136" stroke-width="4"/>`).join('')}
            ${RV.map(([x, y]) => `<line x1="${RC[0]}" y1="${RC[1]}" x2="${x}" y2="${y}" stroke="#2E3136" stroke-width="4"/>`).join('')}
            <polygon id="poli" points="${POLI}" fill="rgba(255,181,71,0.22)" stroke="${AMB}" stroke-width="8" stroke-linejoin="round"/>
          </svg>
          <div class="vert" id="vtop" style="left:540px;top:735px"></div>
          <div class="vert" id="vizq" style="left:395px;top:1083px;border-color:#E5534B"></div>
          <p class="rlab" id="lCama" style="left:470px;top:630px">Cama</p>
          <p class="rlab" id="lGasto" style="left:180px;top:1190px">Gasto</p>
          <p class="rlab" style="left:720px;top:1190px">Estudiar</p>
        </div>
        ${CONT.n91}
        <div id="lap"><div class="pant"><img src="assets/app/esc.jpg" /></div><div class="base"></div></div>
        <div id="cel"><img src="assets/app/cel.jpg" /></div>
        <div id="pago"><span>$37.900 · un solo pago</span></div>
        <div class="anillo" id="anillo2" style="left:410px;top:420px;width:260px;height:260px;border-radius:62px"></div>
        <img id="fin" src="assets/icono.svg" />
        <p class="chica" id="esc">escribe</p>
        <p id="marca">RACHA</p>
        <p class="chica" id="ytela">y te la muestro</p>
        <div id="pastilla"><span>Racha · app · $37.900, un solo pago · 7 días para probarla</span></div>
      </div></div></div>
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
  const de = path.join(BASE, 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-rimu3').join('campana-rimu3-v2'), 'utf8');
}
console.log(`Listo "un sistema" v2: dura ${TOTAL.toFixed(2)} s · ${sonidos.length} efectos`);
