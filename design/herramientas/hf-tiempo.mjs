// Video de producto 2, estilo rimu: "Pasa el tiempo y sigo igual" (20 oct de 2026; guion y mapa de golpes en
// anuncios/campana/rimu2/guion.md, aprobados por Johnatan). Una sola toma: cada escena sale de un objeto de la anterior
// (nada de círculos ni fundidos), nada queda quieto más de 1 s, íconos Lucide (los de la app) y la app de verdad.
// Voz de Fernando (rimu2/voz/tiempo-fernando-v1-limpia.mp3). El gancho va sin música; "Quick Cuts Groove" entra en
// "Racha" (5,96 s) con poner-musica.mjs.
// Uso: node design/herramientas/hf-tiempo.mjs [--solo-html]     (PRUEBA=<segundos> arma solo el comienzo)
//      después check, snapshot y render dentro de campana/rimu2/hyperframes
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const BASE = path.join(C, 'rimu2');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const P = path.join(BASE, 'hyperframes'), A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(A, 'app')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const SOLO_HTML = process.argv.includes('--solo-html');

// ---------- la voz y el momento de cada palabra ----------
const VOZ = path.join(BASE, 'voz', 'tiempo-fernando-v1-limpia.mp3');
const PAL = JSON.parse(fs.readFileSync(path.join(BASE, 'voz', 'tiempo-fernando-v1-limpia.palabras.json'), 'utf8')).palabras;
const t = (i) => PAL[i].i;
const VOZ_DURA = 23.62;
const TOTAL = Number(process.env.PRUEBA || 25.0);
const AMB = '#FFB547';

// ---------- 1. los archivos ----------
const FPS_ANIO = 30;
if (!SOLO_HTML) {
  ff(['-i', VOZ, '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  for (const [de, a] of [['rimu2/hoy/hoy-leer-antes.png', 'hoy-antes.png'], ['rimu2/hoy/hoy-leer-despues.png', 'hoy-despues.png'], ['guion3/app/d-hoy-minimos.png', 'min-antes.png'], ['guion3/app/f-leer-marcado.png', 'min-despues.png']])
    ff(['-i', path.join(C, de), '-vf', 'scale=1170:-2:flags=lanczos', path.join(A, 'app', a)]);
  // Tu año de enero a diciembre (62 fotos, grabadas con grabar-anio-completo.cjs): un video corto que se queda en la última
  ff(['-framerate', String(FPS_ANIO), '-i', path.join(BASE, 'anio', 'anio-%03d.png'), '-vf', 'scale=2200:-2:flags=lanczos,tpad=stop_mode=clone:stop_duration=4,format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-g', '1', path.join(A, 'anio.mp4')]);
}
for (const [de, a] of [['barlow/files/barlow-latin-300-normal.woff2', 'barlow-300.woff2'], ['barlow/files/barlow-latin-600-normal.woff2', 'barlow-600.woff2'], ['barlow-condensed/files/barlow-condensed-latin-700-normal.woff2', 'barlowc-700.woff2']])
  fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', de), path.join(A, 'fuentes', a));
fs.copyFileSync(path.join(RAIZ, 'public', 'ventas', 'icono.svg'), path.join(A, 'icono.svg'));
fs.copyFileSync(path.join(AQUI, 'libs', 'gsap-3.14.2.min.js'), path.join(A, 'gsap.min.js'));

// ---------- 2. los efectos ----------
const SON = path.join(C, 'sonidos'), MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const VOLUMEN = { pop: -15, golpe: -12, whoosh: -13, boom: -8, subida: -15, latido: -13, toque: -14, logro: -16, relleno: -18, caida: -15 };
const sonidos = [];
const suena = (s, tt, { modo = 'golpe', db = 0 } = {}) => { if (tt < TOTAL) sonidos.push({ s, t: Math.max(0, tt - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db }); };

// ---------- 3. los íconos (Lucide, los mismos de la app) ----------
const ICON = {
  libro: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  pesa: '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
  alcancia: '<path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/><path d="M16 10h.01"/><path d="M2 8v1a2 2 0 0 0 2 2h1"/>',
  chulo: '<path d="M20 6 9 17l-5-5"/>',
};
const svg = (k, w = 1.8, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICON[k]}</svg>`;
const TRES = ['libro', 'pesa', 'alcancia'];

// ---------- 4. las animaciones ----------
const pasos = [];
const tl = (s) => pasos.push(s);
const sinLlaves = (o) => o.trim().replace(/^\{|\}$/g, '').trim();     // las propiedades escritas sueltas (el revisor no lee "...{}")
const de0 = (sel, desde, hasta, tt, dur = 0.3, ease = 'expo.out') => tl(`tl.fromTo(${JSON.stringify(sel)}, ${desde}, { ${sinLlaves(hasta)}, duration: ${dur}, ease: "${ease}", immediateRender: false }, ${n(tt)});`);
const a = (sel, props, tt, dur = 0.3, ease = 'power2.out') => tl(`tl.to(${JSON.stringify(sel)}, { ${sinLlaves(props)}, duration: ${dur}, ease: "${ease}" }, ${n(tt)});`);
const fija = (sel, props, tt) => tl(`tl.set(${JSON.stringify(sel)}, ${props}, ${n(tt)});`);

// ===== Escena 1 · el gancho (0 a 5,96 s, sin música): ENERO, el año gris y las tres promesas =====
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const anioHtml = MESES.map((m, k) => {
  const dias = new Date(2026, k + 1, 0).getDate(), inicio = (new Date(2026, k, 1).getDay() + 6) % 7;
  let c = '';
  for (let q = 0; q < 35; q++) { const d = q - inicio + 1; c += `<i class="${d < 1 || d > dias ? 'v' : 'dd'}"></i>`; }
  return `<div class="mes" id="m${k}"><b>${m}</b><div class="c">${c}</div></div>`;
}).join('');
// "ENERO" gigante que se acerca y, en "dices", se encoge hasta ser la etiqueta del mes de enero (la cámara está encima de enero)
de0('#enero', '{ opacity: 0, scale: 1.5, filter: "blur(16px)" }', '{ opacity: 1, scale: 1.18, filter: "blur(0px)" }', 0, 0.35);
a('#enero', '{ scale: 1.0 }', 0.35, t(2) - 0.4, 'none');
suena('golpe', 0.06, { db: -2 });
const T_DICES = t(2) - 0.04;
a('#enero', '{ x: -276, y: -367, scale: 0.16, opacity: 0, filter: "blur(4px)" }', T_DICES, 0.34, 'power3.inOut');
fija('#anio', '{ transformOrigin: "126px 110px", x: 354, y: 200, scale: 2.6 }', 0);
de0('#anio', '{ opacity: 0, scale: 3.4 }', '{ opacity: 1, scale: 2.6 }', T_DICES + 0.08, 0.5);
fija('.mes', '{ opacity: 0 }', 0);
fija('#m0', '{ opacity: 1 }', T_DICES + 0.08);
suena('whoosh', T_DICES);
// "este año sí": los días de enero aparecen uno tras otro
tl(`tl.fromTo("#m0 .dd", { scale: 0 }, { scale: 1, duration: 0.18, ease: "back.out(2.5)", stagger: 0.012, immediateRender: false }, ${n(t(3) - 0.05)});`);
suena('relleno', t(3), { db: 2 });
a('#anio', '{ scale: 2.9, x: 300, y: 170, rotation: -2 }', t(3), t(10) - t(3) - 0.05, 'sine.inOut');
tl(`tl.fromTo("#m0 .dd", { borderColor: "#3A3F47", backgroundColor: "rgba(0,0,0,0)" }, { keyframes: { borderColor: ["#3A3F47", "#E8E8E3", "#3A3F47"], backgroundColor: ["rgba(0,0,0,0)", "rgba(245,245,242,0.22)", "rgba(0,0,0,0)"] }, duration: 0.32, ease: "none", stagger: 0.075, immediateRender: false }, ${n(t(3) + 0.25)});`);
// las tres promesas caen, una por palabra, con su casilla vacía
[6, 7, 9].forEach((w, k) => {
  de0(`#h${k}`, '{ opacity: 0, y: -520, rotation: -14 }', '{ opacity: 1, y: 0, rotation: 0 }', t(w) - 0.06, 0.42, 'back.out(1.6)');
  suena('golpe', t(w) + 0.12, { db: -2 });
});
[0, 1, 2].forEach((k) => tl(`tl.to("#h${k}", { y: -14, rotation: ${[-3, 3, -2][k]}, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 3 }, ${n(t([6, 7, 9][k]) + 0.4)});`));
// "Y en diciembre": la cámara se aleja de golpe y los meses pasan, uno tras otro, hasta diciembre
const T_PASAN = t(10) - 0.03;
a('#anio', '{ x: 0, y: 0, scale: 1 }', T_PASAN, 0.55, 'expo.inOut');
MESES.slice(1).forEach((_, k) => fija(`#m${k + 1}`, '{ opacity: 1 }', T_PASAN + 0.06 + k * 0.045));
tl(`tl.fromTo(".mes:not(#m0) .dd", { scale: 0 }, { scale: 1, duration: 0.16, ease: "back.out(2)", stagger: 0.0016, immediateRender: false }, ${n(T_PASAN + 0.06)});`);
suena('whoosh', T_PASAN, { db: 1 });
de0('#dic', '{ opacity: 0, y: -260, scaleY: 1.4 }', '{ opacity: 1, y: 0, scaleY: 1 }', t(12) - 0.03, 0.4, 'back.out(1.8)');
suena('golpe', t(12) + 0.08, { db: 1 });
// "sigues igual": las promesas se apagan y el año tiembla
a('#tres .hab', '{ color: "#5B6068" }', t(13), 0.35);
a('#tres .casilla', '{ borderColor: "#3A3F47" }', t(13), 0.35);
tl(`tl.fromTo(["#anio", "#tres"], { x: 0 }, { keyframes: { x: [0, -22, 18, -12, 7, 0] }, duration: 0.42, ease: "none", immediateRender: false }, ${n(t(14))});`);
suena('latido', t(14));
a('#dic', '{ scale: 1.05 }', t(12) + 0.45, t(15) - t(12) - 0.7, 'none');

// ===== Escena 2 · Racha (5,96 s; entra la música): todo se mete en el ícono =====
const T_RACHA = t(15) - 0.004;
a(['#anio', '#dic'], '{ scale: 0.12, opacity: 0, filter: "blur(10px)" }', T_RACHA - 0.26, 0.28, 'power3.in');
TRES.forEach((_, k) => a(`#h${k}`, `{ x: ${[340, 0, -340][k]}, y: -540, scale: 0.15, rotation: ${[200, 260, -220][k]}, opacity: 0 }`, T_RACHA - 0.3 + k * 0.04, 0.3, 'power3.in'));
de0('#flood', '{ opacity: 1, scale: 0, borderRadius: 96 }', '{ opacity: 1, scale: 7, borderRadius: 60 }', T_RACHA - 0.02, 0.24, 'power2.in');
a('#flood', '{ scale: 1, borderRadius: 96 }', T_RACHA + 0.3, 0.32, 'expo.out');
fija('#flood', '{ opacity: 0 }', T_RACHA + 0.62);
fija('#ic', '{ opacity: 1 }', T_RACHA + 0.62);
tl(`tl.fromTo("#ic", { scale: 1 }, { keyframes: { scale: [1, 1.12, 0.97, 1] }, duration: 0.4, ease: "none", immediateRender: false }, ${n(T_RACHA + 0.62)});`);
a('#ic', '{ scale: 1.08, rotation: 4 }', T_RACHA + 1.0, t(26) - T_RACHA - 1.15, 'sine.inOut');
tl(`tl.fromTo("#anillo", { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 2.2, duration: 0.7, ease: "power2.out", immediateRender: false }, ${n(t(20) - 0.02)});`);
suena('latido', t(20), { db: -3 });
suena('boom', T_RACHA + 0.02);
de0('#nomin', '{ y: 160 }', '{ y: 0 }', t(18) - 0.06, 0.45, 'expo.out');
fija('#nom', '{ opacity: 1 }', t(18) - 0.06);
suena('whoosh', t(18) - 0.05, { db: -3 });
// "hábitos": los tres íconos vuelven a salir del ícono, ahora en ámbar, y lo rodean
const ORB = [[-330, -60], [330, -90], [0, -400]];
ORB.forEach(([x, y], k) => {
  de0(`#o${k}`, '{ x: 0, y: 0, scale: 0.2, opacity: 0 }', `{ x: ${x}, y: ${y}, scale: 1, opacity: 1 }`, t(22) - 0.04 + k * 0.05, 0.5, 'back.out(1.7)');
  const ang = Math.atan2(y, x), r = Math.hypot(x, y), pasos = 8, kx = [], ky = [];
  for (let j = 0; j <= pasos; j++) { const g = ang + (j / pasos) * 1.1; kx.push(n(Math.cos(g) * r)); ky.push(n(Math.sin(g) * r)); }
  tl(`tl.to("#o${k}", { keyframes: { x: [${kx}], y: [${ky}] }, duration: ${n(t(26) - t(22) - 0.6)}, ease: "none" }, ${n(t(22) + 0.5)});`);
});
suena('pop', t(22), { db: 1 });
// "día por día": tres cuadritos ámbar saltan, uno por palabra
[23, 24, 25].forEach((w, k) => { de0(`#q${k}`, '{ opacity: 0, scale: 0, y: 40 }', '{ opacity: 1, scale: 1, y: 0 }', t(w) - 0.03, 0.3, 'back.out(2.4)'); suena('pop', t(w), { db: -2 + k }); });

// ===== Escena 3 · Hoy (8,77 s): el ícono crece y se vuelve el celular; se marca "Leer 10 páginas" =====
const T_CEL = t(26) - 0.06;
a(['#o0', '#o1', '#o2'], '{ scale: 0.3, opacity: 0, filter: "blur(8px)" }', T_CEL - 0.1, 0.25, 'power3.in');
a(['#nom', '#q0', '#q1', '#q2'], '{ y: 260, opacity: 0, filter: "blur(10px)" }', T_CEL - 0.1, 0.25, 'power3.in');
fija('#ic', '{ opacity: 0 }', T_CEL);
fija('#tel', '{ opacity: 1 }', T_CEL);
de0('#tel', '{ clipPath: "inset(310px 100px 521px 100px round 96px)", backgroundColor: "#FFB547" }', '{ clipPath: "inset(0px 0px 0px 0px round 64px)", backgroundColor: "#0F1113", opacity: 1 }', T_CEL, 0.55, 'expo.inOut');
de0('#bisel', '{ opacity: 0 }', '{ opacity: 1 }', T_CEL + 0.3, 0.25);
a('#telic', '{ opacity: 0, scale: 0.6 }', T_CEL + 0.12, 0.25);
de0('#scrA', '{ opacity: 0 }', '{ opacity: 1 }', T_CEL + 0.25, 0.25);
suena('whoosh', T_CEL);
// la cámara se acerca a "Leer 10 páginas", pasa por "Entrenar 30 minutos" y vuelve (como Screen Studio)
const LEER_Y = 687, ENTRENAR_Y = 513, Z = 1.7;
fija('#tel', `{ transformOrigin: "300px ${LEER_Y}px" }`, T_CEL + 0.56);
a('#tel', '{ scale: 1.7, y: -80 }', t(29) - 0.12, 0.45, 'expo.inOut');
suena('whoosh', t(29) - 0.1, { db: -4 });
a('#tel', `{ y: ${n(-80 + (LEER_Y - ENTRENAR_Y) * Z)} }`, t(31) - 0.08, 0.35, 'expo.inOut');
a('#tel', '{ y: -80 }', t(32) - 0.1, 0.3, 'expo.inOut');
// el toque y la fila que se marca (la app de verdad)
const DX = 240 + 300 + (528 - 300) * Z, DY = 250 + LEER_Y + (686 - LEER_Y) * Z - 80;
const T_MARCA = t(33) + 0.02;
de0('#dedo', '{ opacity: 0, scale: 0.4 }', '{ opacity: 0.95, scale: 1 }', T_MARCA - 0.14, 0.14);
a('#dedo', '{ opacity: 0, scale: 1.6 }', T_MARCA + 0.02, 0.3);
fija('#scrB', '{ opacity: 1 }', T_MARCA);
tl(`tl.fromTo("#tel", { scale: ${Z} }, { keyframes: { scale: [${Z}, ${Z * 1.04}, ${Z}] }, duration: 0.25, ease: "none", immediateRender: false }, ${n(T_MARCA)});`);
suena('toque', T_MARCA); suena('pop', T_MARCA + 0.06, { db: 1 });
// "se pinta un cuadrito": el chulo salta del celular y se vuelve un cuadrito ámbar en el centro
const T_SALTO = t(36) - 0.06;
a('#tel', '{ y: 900, scale: 1.2, opacity: 0, filter: "blur(14px)" }', T_SALTO + 0.05, 0.4, 'power3.in');
de0('#salto', `{ x: ${n(DX - 540)}, y: ${n(DY - 760)}, scale: 0.346, borderRadius: 130, opacity: 1 }`, '{ x: 0, y: 0, scale: 1, borderRadius: 58, opacity: 1 }', T_SALTO, 0.45, 'back.out(1.5)');
fija('#salto', '{ opacity: 1 }', T_SALTO);
suena('subida', T_SALTO + 0.4, { modo: 'fin', db: -2 });
suena('golpe', t(38) + 0.05);
tl(`tl.fromTo("#salto", { scale: 1 }, { keyframes: { scale: [1, 1.12, 0.96, 1] }, duration: 0.4, ease: "none", immediateRender: false }, ${n(t(38))});`);

a('#salto', '{ rotation: 8, scale: 1.1 }', t(38) + 0.42, t(39) - t(38) - 0.4, 'sine.inOut');
// ===== Escena 4 · el día que no puedes (12,47 s): el cuadrito se apaga, sale el libro, se encoge a "1 página" =====
a('#salto', '{ backgroundColor: "#3A3F47" }', t(39) - 0.03, 0.3);
a('#saltok', '{ opacity: 0 }', t(39) - 0.03, 0.2);
tl(`tl.fromTo("#salto", { x: 0 }, { keyframes: { x: [0, -16, 13, -8, 4, 0] }, duration: 0.36, ease: "none", immediateRender: false }, ${n(t(42))});`);
suena('golpe', t(42), { db: -4 });
a('#salto', '{ scale: 0, opacity: 0 }', t(43) - 0.05, 0.25, 'power3.in');
de0('#libro', '{ opacity: 0, scale: 0.2, y: 120 }', '{ opacity: 1, scale: 1, y: 0 }', t(43) - 0.05, 0.5, 'back.out(1.7)');
suena('pop', t(43), { db: 2 });
tl(`tl.to("#libro", { keyframes: { rotation: [0, -7, 6, -3], y: [0, -30, 10, -10] }, duration: ${n(t(47) - t(43) - 0.55)}, ease: "sine.inOut" }, ${n(t(43) + 0.45)});`);
// "pequeña": el libro se encoge y sube a la esquina; "una página": la pastilla
a('#libro', '{ x: -155, y: -445, rotation: 0, scale: 0.3056, color: "#FFB547" }', t(47) - 0.06, 0.45, 'expo.inOut');
suena('whoosh', t(47) - 0.05, { db: -2 });
de0('#pild', '{ opacity: 0, scale: 0.4, x: -60 }', '{ opacity: 1, scale: 1, x: 0 }', t(51) - 0.04, 0.35, 'back.out(2)');
suena('pop', t(51));
// "como leer una página": entra la app de verdad en el día difícil ("Mínimo: una página") y se marca en "ese día"
de0('#ven', '{ opacity: 0, y: 1100, rotation: 8 }', '{ opacity: 1, y: 0, rotation: 0 }', t(48) - 0.08, 0.6, 'expo.out');
suena('whoosh', t(48) - 0.05, { db: -3 });
a('#venimg', '{ scale: 1.22, x: 60 }', t(48) + 0.5, t(53) - t(48) - 0.5, 'sine.inOut');
a('#ven', '{ rotation: -2.5, y: -30 }', t(48) + 0.6, t(55) - t(48) - 0.6, 'sine.inOut');
tl(`tl.to("#libro", { keyframes: { y: [-445, -460, -445] }, duration: 1.2, ease: "sine.inOut", repeat: 1 }, ${n(t(47) + 0.45)});`);
const T_MIN = t(53) - 0.02;
de0('#dedo2', '{ opacity: 0, scale: 0.4 }', '{ opacity: 0.95, scale: 1 }', T_MIN - 0.14, 0.14);
a('#dedo2', '{ opacity: 0, scale: 1.6 }', T_MIN + 0.02, 0.3);
fija('#minB', '{ opacity: 1 }', T_MIN);
suena('toque', T_MIN);
// "también cuenta": el chulo grande se dibuja y entran las dos palabras
tl(`tl.fromTo("#chkp", { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.32, ease: "power2.out", immediateRender: false }, ${n(t(55) - 0.05)});`);
fija('#chk', '{ opacity: 1 }', t(55) - 0.05);
suena('logro', t(55), { db: -2 });
de0('#tam', '{ opacity: 0, y: 70, filter: "blur(10px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(55) - 0.03, 0.25);
de0('#cue', '{ opacity: 0, scale: 1.5, filter: "blur(12px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', t(56) - 0.03, 0.3, 'back.out(1.8)');
suena('golpe', t(56) + 0.05);

// ===== Escena 5 · el año (17,61 s): el chulo se vuelve el primer cuadrito y Tu año se llena de enero a diciembre =====
const T_ANIO = t(57) - 0.06;
a(['#ven', '#libro', '#pild', '#tam', '#cue'], '{ y: 600, opacity: 0, filter: "blur(12px)" }', T_ANIO - 0.12, 0.28, 'power3.in');
// el chulo se encoge en un cuadrito ámbar y vuela al 1 de enero de la tarjeta
fija('#chk', '{ opacity: 0 }', T_ANIO);
de0('#semilla', '{ x: 335, y: 183, scale: 5.6, opacity: 1 }', '{ x: 335, y: -37, scale: 75, opacity: 1 }', T_ANIO - 0.08, 0.22, 'power2.in');
a('#semilla', '{ x: 0, y: 0, scale: 1 }', T_ANIO + 0.22, 0.4, 'expo.inOut');
fija('#semilla', '{ opacity: 1 }', T_ANIO);
fija('#semilla', '{ opacity: 0 }', T_ANIO + 0.62);
// la tarjeta: la cámara se aleja desde ese cuadrito
const T_LLENA = T_ANIO + 0.32;   // cuando arranca el video del año (sus 62 fotos duran ~2,07 s)
fija('#card', '{ transformOrigin: "165px 397px" }', 0);
de0('#card', '{ opacity: 0, scale: 4 }', '{ opacity: 1, scale: 1 }', T_ANIO + 0.5, 0.6, 'expo.out');
suena('whoosh', T_ANIO, { db: -2 });
// la cámara sigue el borde que se llena (de enero a diciembre)
a('#card', '{ x: -1160 }', T_LLENA + 0.3, 62 / FPS_ANIO - 0.25, 'sine.inOut');
for (let k = 0; k < 6; k++) suena('relleno', T_LLENA + 0.2 + k * 0.33, { db: -2 });
de0('#dic2', '{ opacity: 0, y: -260, scaleY: 1.4 }', '{ opacity: 1, y: 0, scaleY: 1 }', t(67) - 0.03, 0.4, 'back.out(1.8)');
suena('golpe', t(67) + 0.08, { db: 1 });
// "ves todo lo que sí hiciste": la cámara se aleja hasta ver el año entero y las tres promesas, ahora cumplidas
fija('#card', '{ transformOrigin: "0px 0px" }', t(68) - 0.1);
a('#card', '{ x: 0, scale: 0.4545, y: 0 }', t(68) - 0.08, 0.5, 'expo.inOut');
suena('whoosh', t(68) - 0.05, { db: -4 });
[69, 71, 72].forEach((w, k) => { de0(`#g${k}`, '{ opacity: 0, scale: 0.2, y: 80 }', '{ opacity: 1, scale: 1, y: 0 }', t(w) - 0.04, 0.35, 'back.out(2)'); suena('pop', t(w), { db: k }); });
tl(`tl.fromTo("#card", { scale: 0.4545 }, { keyframes: { scale: [0.4545, 0.475, 0.4545] }, duration: 0.3, ease: "none", immediateRender: false }, ${n(t(72))});`);
suena('latido', t(72), { db: -2 });
a(['#tres2'], '{ y: -24 }', t(73), t(74) - t(73) - 0.26, 'sine.inOut');
a('#dic2', '{ scale: 1.06 }', t(73), t(74) - t(73) - 0.26, 'sine.inOut');

// ===== Escena 6 · cierre (21,8 s): todo se mete en el ícono; "escribe RACHA y te la muestro" y el precio =====
const T_FIN = t(74) - 0.06;
a(['#card', '#dic2', '#tres2'], '{ scale: 0.1, opacity: 0, filter: "blur(10px)" }', T_FIN - 0.22, 0.26, 'power3.in');
de0('#fin', '{ opacity: 0, scale: 0.2, rotation: -20 }', '{ opacity: 1, scale: 1, rotation: 0 }', T_FIN, 0.45, 'back.out(1.7)');
suena('boom', T_FIN + 0.02, { db: -2 });
de0('#esc', '{ opacity: 0, y: 20, filter: "blur(10px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(74) - 0.03, 0.25);
de0('#marca', '{ opacity: 0, scale: 1.25, filter: "blur(18px)" }', '{ opacity: 1, scale: 1, filter: "blur(0px)" }', t(75) - 0.03, 0.35);
a('#marca', '{ scale: 1.04 }', t(75) + 0.33, TOTAL - t(75) - 0.4, 'none');
de0('#ytela', '{ opacity: 0, y: 20, filter: "blur(10px)" }', '{ opacity: 1, y: 0, filter: "blur(0px)" }', t(76) - 0.03, 0.25);
de0('#pastilla', '{ opacity: 0, y: 40, scale: 0.92 }', '{ opacity: 1, y: 0, scale: 1 }', t(79) + 0.25, 0.3, 'back.out(1.6)');
suena('pop', t(79) + 0.25, { db: 1 });
a('#fin', '{ scale: 1.08, rotation: 3 }', T_FIN + 0.45, TOTAL - T_FIN - 0.5, 'sine.inOut');
[t(79) + 0.7, t(79) + 1.5].forEach((tt) => tl(`tl.fromTo("#anillo2", { opacity: 0.85, scale: 1 }, { opacity: 0, scale: 2.4, duration: 0.8, ease: "power2.out", immediateRender: false }, ${n(tt)});`));

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
  fs.writeFileSync(path.join(BASE, 'tiempo-sonidos.txt'), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(10)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}

// ---------- 6. la página ----------
const hab = (id, k, cls = '') => `<div class="hab ${cls}" id="${id}${k}">${svg(TRES[k])}<div class="casilla">${cls ? svg('chulo', 3.4) : ''}</div></div>`;
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · pasa el tiempo</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 300; src: url("assets/fuentes/barlow-300.woff2") format("woff2"); }
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlowc-700.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #0A0A0B; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0A0A0B; }
      .grande { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; letter-spacing: 0.01em; line-height: 1; color: #F5F5F2; opacity: 0; }
      #enero { top: 640px; font-size: 300px; z-index: 30; }
      #dic, #dic2 { top: 110px; font-size: 170px; z-index: 20; }
      #dic2 { top: 250px; color: ${AMB}; }
      #anio { position: absolute; left: 60px; top: 330px; width: 960px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 34px 40px; opacity: 0; z-index: 10; }
      .mes b { display: block; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 26px; color: #6B7079; margin-bottom: 8px; }
      .mes .c { display: grid; grid-template-columns: repeat(7, 30px); gap: 7px; }
      .mes i { width: 30px; height: 30px; border-radius: 8px; display: block; }
      .mes i.dd { border: 2px solid #3A3F47; }
      #tres, #tres2 { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 70px; z-index: 25; }
      #tres { top: 1330px; } #tres2 { top: 1010px; }
      .hab { display: flex; flex-direction: column; align-items: center; gap: 18px; color: #F5F5F2; opacity: 0; }
      .hab.si { color: ${AMB}; }
      .hab > svg { width: 150px; height: 150px; }
      .casilla { width: 64px; height: 64px; border-radius: 16px; border: 5px solid #8A8F97; display: grid; place-items: center; color: #0A0A0B; }
      .hab.si .casilla { background: ${AMB}; border-color: ${AMB}; }
      .casilla svg { width: 44px; height: 44px; }
      #ic, #fin { position: absolute; left: 340px; top: 560px; width: 400px; height: 400px; border-radius: 96px; opacity: 0; z-index: 30; }
      #flood { position: absolute; left: 340px; top: 560px; width: 400px; height: 400px; border-radius: 96px; background: ${AMB}; opacity: 0; z-index: 31; }
      .anillo { position: absolute; left: 340px; top: 560px; width: 400px; height: 400px; border-radius: 96px; border: 6px solid ${AMB}; opacity: 0; z-index: 28; }
      #fin { left: 410px; top: 420px; width: 260px; height: 260px; border-radius: 62px; z-index: 60; }
      #nom { position: absolute; left: 0; right: 0; top: 1040px; height: 160px; overflow: hidden; text-align: center; opacity: 0; z-index: 30; }
      #nomin { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 150px; line-height: 160px; color: #F5F5F2; }
      .orb { position: absolute; left: 465px; top: 685px; width: 150px; height: 150px; color: ${AMB}; opacity: 0; z-index: 29; }
      .orb svg { width: 100%; height: 100%; }
      .q { position: absolute; top: 1250px; width: 70px; height: 70px; border-radius: 18px; background: ${AMB}; opacity: 0; z-index: 30; }
      #tel { position: absolute; left: 240px; top: 250px; width: 600px; height: 1231px; overflow: hidden; opacity: 0; z-index: 35; }
      #telic { position: absolute; left: 100px; top: 310px; width: 400px; height: 400px; }
      #bisel { position: absolute; inset: 0; border: 10px solid #1D1F23; border-radius: 64px; opacity: 0; z-index: 3; }
      .scr { position: absolute; left: 0; top: 0; width: 600px; opacity: 0; }
      .dedo { position: absolute; width: 70px; height: 70px; margin: -35px 0 0 -35px; border-radius: 50%; background: rgba(255, 255, 255, 0.5); border: 4px solid #fff; opacity: 0; z-index: 40; }
      #salto { position: absolute; left: 410px; top: 630px; width: 260px; height: 260px; border-radius: 58px; background: ${AMB}; display: grid; place-items: center; color: #0A0A0B; opacity: 0; z-index: 38; }
      #saltok { width: 62%; height: 62%; }
      #libro { position: absolute; left: 360px; top: 570px; width: 360px; height: 360px; color: #F5F5F2; opacity: 0; z-index: 38; }
      #libro svg { width: 100%; height: 100%; }
      #pild { position: absolute; left: 466px; top: 270px; background: #F5F5F2; color: #0A0A0B; border-radius: 999px; padding: 12px 30px 14px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; opacity: 0; z-index: 38; }
      #ven { position: absolute; left: 40px; top: 520px; width: 1000px; height: 420px; border-radius: 56px; border: 10px solid #23262B; overflow: hidden; background: #0F1113; opacity: 0; z-index: 36; }
      #venimg { position: absolute; inset: 0; transform-origin: 50% 50%; }
      .minimg { position: absolute; width: 1080px; left: -40px; top: -871px; }
      #minB { opacity: 0; }
      #chk { position: absolute; left: 390px; top: 1030px; width: 300px; height: 300px; opacity: 0; z-index: 38; }
      #tc { position: absolute; left: 0; right: 0; top: 1350px; color: #F5F5F2; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 150px; line-height: 1; z-index: 38; }
      #tc span { display: inline-block; opacity: 0; }
      #cue { color: ${AMB}; }
      #semilla { position: absolute; left: 189px; top: 981px; width: 32px; height: 32px; border-radius: 8px; background: ${AMB}; opacity: 0; z-index: 45; }
      #card { position: absolute; left: 40px; top: 600px; width: 2200px; height: 662px; border-radius: 30px; overflow: hidden; opacity: 0; z-index: 40; box-shadow: 0 0 0 2px #23262B; }
      #card video { width: 100%; height: 100%; display: block; }
      .chica { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 64px; color: #F5F5F2; opacity: 0; z-index: 62; }
      #esc { top: 712px; } #ytela { top: 1090px; }
      #marca { position: absolute; left: 0; right: 0; top: 824px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 250px; line-height: 1; color: ${AMB}; opacity: 0; z-index: 62; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1190px; display: flex; justify-content: center; opacity: 0; z-index: 62; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 34px; color: #F5F5F2; background: #15171A; border: 3px solid ${AMB}; border-radius: 999px; padding: 14px 30px 18px; white-space: nowrap; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <p class="grande" id="enero">ENERO</p>
      <div id="anio">${anioHtml}</div>
      <p class="grande" id="dic">DICIEMBRE</p>
      <div id="tres">${TRES.map((_, k) => hab('h', k)).join('')}</div>
      <div id="flood"></div>
      <div class="anillo" id="anillo"></div>
      <img id="ic" src="assets/icono.svg" />
      <div id="nom"><div id="nomin">Racha</div></div>
      ${ORB.map((_, k) => `<div class="orb" id="o${k}">${svg(TRES[k], 1.8)}</div>`).join('\n      ')}
      ${[0, 1, 2].map((k) => `<div class="q" id="q${k}" style="left:${415 + k * 90}px"></div>`).join('\n      ')}
      <div id="tel"><div id="bisel"></div><img id="telic" src="assets/icono.svg" /><img class="scr" id="scrA" src="assets/app/hoy-antes.png" /><img class="scr" id="scrB" src="assets/app/hoy-despues.png" /></div>
      <div class="dedo" id="dedo" style="left:${n(DX)}px;top:${n(DY)}px"></div>
      <div id="salto">${svg('chulo', 3.2, 'id="saltok"')}</div>
      <div id="libro">${svg('libro', 1.6)}</div>
      <div id="pild">1 página</div>
      <div id="ven"><div id="venimg"><img class="minimg" src="assets/app/min-antes.png" /><img class="minimg" id="minB" src="assets/app/min-despues.png" /></div></div>
      <div class="dedo" id="dedo2" style="left:897px;top:724px"></div>
      <svg id="chk" viewBox="0 0 24 24" fill="none" stroke="${AMB}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path id="chkp" d="M20 6 9 17l-5-5" stroke-dasharray="30" stroke-dashoffset="30"/></svg>
      <p id="tc"><span id="tam">TAMBIÉN</span> <span id="cue">CUENTA</span></p>
      <div id="semilla"></div>
      <div id="card"><video id="vanio" src="assets/anio.mp4" muted playsinline data-start="${n(T_LLENA)}" data-duration="${n(TOTAL - T_LLENA)}" data-media-start="0" data-track-index="3"></video></div>
      <p class="grande" id="dic2">DICIEMBRE</p>
      <div id="tres2">${TRES.map((_, k) => hab('g', k, 'si')).join('')}</div>
      <div class="anillo" id="anillo2" style="left:410px;top:420px;width:260px;height:260px;border-radius:62px;z-index:59"></div>
      <img id="fin" src="assets/icono.svg" />
      <p class="chica" id="esc">escribe</p>
      <p id="marca">RACHA</p>
      <p class="chica" id="ytela">y te la muestro</p>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago · 7 días para probarla</span></div>
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
  const de = path.join(C, 'rimu1', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-rimu1').join('campana-rimu2'), 'utf8');
}
console.log(`Listo "pasa el tiempo": dura ${TOTAL.toFixed(2)} s · Racha ${T_RACHA.toFixed(2)} · celular ${T_CEL.toFixed(2)} · año ${T_ANIO.toFixed(2)} · cierre ${T_FIN.toFixed(2)} · ${sonidos.length} efectos`);
