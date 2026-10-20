// Anuncio de producto estilo rimu (19 oct de 2026; referencia: anuncios/referencias/oct19/rimu-ref1.mp4 y su análisis).
// Animación de producto (motion graphics), sin personas: pantallas reales de Racha, números y letras que entran con la voz,
// fondo que alterna negro y blanco, y ningún corte seco (todo pasa con movimiento y desenfoque). Voz de Fernando Martínez
// (texto v4 aprobado, en referencias/oct19/rimu-ref1-analisis-completo.md). El ámbar solo en lo cumplido (regla de la marca).
// Uso: node design/herramientas/hf-vitrina.mjs [--solo-html]      (PRUEBA=9.55 arma solo los primeros segundos)
//      después check, snapshot y render dentro de campana/rimu1/hyperframes; la música va con poner-musica.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const BASE = path.join(C, 'rimu1');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const P = path.join(BASE, 'hyperframes'), A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(A, 'pantallas'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const SOLO_HTML = process.argv.includes('--solo-html');

// ---------- la voz y el momento de cada palabra ----------
const VOZ = path.join(BASE, 'voz', 'vitrina-fernando-v2-limpia.mp3');
const PAL = JSON.parse(fs.readFileSync(path.join(BASE, 'voz', 'vitrina-fernando-v2.palabras.json'), 'utf8')).palabras;
const t = (i) => PAL[i].i;                      // segundo en que empieza la palabra i
const VOZ_DURA = 28.56;
const TOTAL = Number(process.env.PRUEBA || 29.6);

// ---------- las escenas (cada una arranca con la palabra que la nombra; 4 milésimas antes para caer en el cuadro) ----------
const T_SEMANA = t(6) - 0.06;    // "Un jueves…"
const T_RACHA = t(21) - 0.05;    // "Racha es una app…"
const T_FIN3 = t(37) - 0.05;     // "Cuando creas un hábito…" (escena 4, por hacer)

// ---------- 1. los archivos ----------
if (!SOLO_HTML) {
  ff(['-i', VOZ, '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  // las pantallas reales de Racha para la explosión del comienzo (achicadas: son muchas tarjetas)
  const PANT = [
    ['public/ventas/cel-1-hoy.jpg'], ['public/ventas/cel-2-tareas.jpg'], ['public/ventas/cel-3-semana.jpg'],
    ['public/ventas/cel-4-progreso.jpg'], ['public/ventas/cel-5-progreso-abajo.jpg'],
    ['design/anuncios/campana/app-llenado/cal-30.png'], ['design/anuncios/campana/app-llenado/graf-34.png'],
    ['design/anuncios/campana/app-llenado/vhoy-25.png'], ['design/anuncios/campana/app-llenado/vprog-118.png'],
    ['design/anuncios/campana/app-llenado/ehoy-25.png'], ['design/anuncios/campana/app-llenado/eprog-44.png'],
  ];
  PANT.forEach(([f], i) => ff(['-i', path.join(RAIZ, f), '-vf', 'scale=420:-2:flags=lanczos', '-q:v', '3', path.join(A, 'pantallas', `p${i}.jpg`)]));
}
const N_PANT = fs.readdirSync(path.join(A, 'pantallas')).filter((f) => /^p\d+\.jpg$/.test(f)).length;
for (const [de, a] of [['barlow/files/barlow-latin-300-normal.woff2', 'barlow-300.woff2'], ['barlow/files/barlow-latin-600-normal.woff2', 'barlow-600.woff2'], ['barlow-condensed/files/barlow-condensed-latin-700-normal.woff2', 'barlowc-700.woff2']])
  fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', de), path.join(A, 'fuentes', a));
fs.copyFileSync(path.join(RAIZ, 'public', 'ventas', 'icono.svg'), path.join(A, 'icono.svg'));
fs.copyFileSync(path.join(AQUI, 'libs', 'gsap-3.14.2.min.js'), path.join(A, 'gsap.min.js'));
fs.copyFileSync(path.join(C, 'guion12', 'app', 'dia-dificil.mp4'), path.join(A, 'dia-dificil.mp4'));   // la app de verdad (grabada el 11 oct)   // local: con los datos del celular el CDN se cae

// ---------- 2. los efectos (uno por cosa que pasa; por debajo de la voz) ----------
const SON = path.join(C, 'sonidos'), MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const VOLUMEN = { pop: -15, golpe: -12, whoosh: -12, boom: -7, tachar: -16, subida: -15, latido: -13 };
const sonidos = [];
const suena = (s, tt, { modo = 'golpe', db = 0 } = {}) => { if (tt < TOTAL) sonidos.push({ s, t: Math.max(0, tt - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db }); };

// ---------- 3. las animaciones ----------
const pasos = [];
const tl = (s) => pasos.push(s);
// letras que entran con la voz, palabra por palabra (de borroso a nítido), como en rimu; la palabra clave en grueso
let nFrase = 0;
const frases = [];
function frase({ palabras, idx, gruesas = [], top, tam = 58, sale, oscuro = false, ancho = 940 }) {
  const id = `f${++nFrase}`;
  const spans = palabras.map((w, k) => `<span class="w${gruesas.includes(k) ? ' g' : ''}" id="${id}w${k}">${w}</span>`).join(' ');
  frases.push(`      <p class="frase${oscuro ? ' osc' : ''}" id="${id}" style="top:${top}px;font-size:${tam}px;max-width:${ancho}px">${spans}</p>`);
  palabras.forEach((_, k) => tl(`tl.fromTo("#${id}w${k}", { opacity: 0, y: 14, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.2, ease: "power2.out", immediateRender: false }, ${n(t(idx + k) - 0.03)});`));
  if (sale) tl(`tl.to("#${id}", { opacity: 0, filter: "blur(12px)", y: -10, duration: 0.18, ease: "power2.in" }, ${n(sale)});`);
}

// --- Escena 1 (negro): las pantallas de Racha llegan desde el fondo, se juntan en una bola y explotan hacia la cámara ---
let semilla = 7;
const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
const TARJ = 38, T_EXP = T_SEMANA - 0.34, BOLA_Y = 600;
const tarjetas = [];
for (let k = 0; k < TARJ; k++) {
  const ang = azar() * Math.PI * 2, r = 50 + Math.sqrt(azar()) * 210, w = 84 + azar() * 66;
  const bx = Math.cos(ang) * r, by = Math.sin(ang) * r * 0.82;                    // lugar en la bola
  const lejos = 1.6 + azar() * 1.4;                                              // de dónde viene (más lejos que la bola)
  const ex = bx * (5 + azar() * 3), ey = by * (5 + azar() * 3);                 // a dónde sale disparada
  const rot = (azar() - 0.5) * 24, prof = Math.round(azar() * 40);
  tarjetas.push(`      <img class="tarj" id="c${k}" src="assets/pantallas/p${k % N_PANT}.jpg" style="width:${w.toFixed(0)}px;z-index:${10 + prof}" data-layout-allow-overflow />`);
  const lleg = 0.05 + azar() * 0.5;
  tl(`tl.fromTo("#c${k}", { xPercent: -50, yPercent: -50, x: ${n(bx * lejos)}, y: ${n(by * lejos)}, scale: 0.15, rotation: ${n(rot * 2)}, opacity: 0, filter: "blur(10px)" }, { xPercent: -50, yPercent: -50, x: ${n(bx)}, y: ${n(by)}, scale: 1, rotation: ${n(rot)}, opacity: 1, filter: "blur(0px)", duration: ${n(0.75)}, ease: "expo.out", immediateRender: true }, ${n(lleg)});`);
  tl(`tl.to("#c${k}", { x: ${n(ex)}, y: ${n(ey)}, scale: ${n(3.2 + azar() * 2)}, rotation: ${n(rot * 3)}, opacity: 0, filter: "blur(16px)", duration: 0.42, ease: "power3.in" }, ${n(T_EXP + azar() * 0.08)});`);
}
tl(`tl.fromTo("#bola", { rotation: -4, scale: 0.96 }, { rotation: 5, scale: 1.04, duration: ${n(T_EXP)}, ease: "none" }, 0);`);
frase({ palabras: ['Te', 'propones', 'entrenar'], idx: 0, top: 1080, tam: 62, sale: T_EXP + 0.05 });
frase({ palabras: ['todos', 'los', 'días.'], idx: 3, gruesas: [0, 1, 2], top: 1160, tam: 86, sale: T_EXP + 0.05 });
suena('subida', T_EXP + 0.3, { modo: 'fin' });
suena('whoosh', T_EXP + 0.1);

// --- Escena 2 (blanco): la semana de "Entrenar 30 minutos"; el jueves queda vacío; todo se borra y salta al LUNES ---
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const semana = DIAS.map((d, k) => `        <div class="dia" id="d${k}"><span class="letra">${d}</span><span class="aro"><span class="relleno" id="r${k}"></span><span class="chulo" id="k${k}">✓</span></span></div>`).join('\n');
tl(`tl.fromTo("#ola1", { scale: 0 }, { scale: 26, duration: 0.3, ease: "power3.in", immediateRender: true }, ${n(T_EXP + 0.06)});`);
tl(`tl.set("#fondo", { backgroundColor: "#F2F1EC" }, ${n(T_EXP + 0.37)});`);
tl(`tl.set("#ola1", { opacity: 0 }, ${n(T_EXP + 0.38)});`);
tl(`tl.set("#bola", { opacity: 0 }, ${n(T_EXP + 0.36)});`);   // lo que quede de la explosión no se ve sobre el blanco
// la cámara se acerca despacio a la semana mientras la voz habla
tl(`tl.to("#semana", { scale: 1.05, duration: ${n(t(20) - 0.1 - (T_SEMANA + 0.28))}, ease: "none" }, ${n(T_SEMANA + 0.28)});`);
tl(`tl.fromTo("#semana", { opacity: 0, scale: 1.45, filter: "blur(18px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out", immediateRender: false }, ${n(T_SEMANA - 0.06)});`);
[0, 1, 2].forEach((k) => {
  const tt = T_SEMANA + 0.16 + k * 0.13;
  tl(`tl.fromTo("#r${k}", { scale: 0 }, { scale: 1, duration: 0.2, ease: "back.out(2)", immediateRender: false }, ${n(tt)});`);
  tl(`tl.fromTo("#k${k}", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(2.4)", immediateRender: false }, ${n(tt + 0.05)});`);
  suena('pop', tt, { db: -k });
});
// el jueves: se marca con un aro oscuro cuando la voz lo dice y tiembla en "no lo haces"
tl(`tl.fromTo("#d3 .aro", { borderColor: "#CFCCC3" }, { borderColor: "#0F1113", borderWidth: 7, duration: 0.15, immediateRender: false }, ${n(t(7))});`);
tl(`tl.fromTo("#d3", { x: 0 }, { keyframes: { x: [0, -16, 14, -10, 8, -4, 0] }, duration: 0.42, ease: "none", immediateRender: false }, ${n(t(8))});`);
suena('golpe', t(8));
// "volver a empezar": lo que llevaba se borra (de atrás para adelante)
[2, 1, 0].forEach((k, j) => {
  const tt = t(16) + j * 0.1;
  tl(`tl.to("#k${k}", { opacity: 0, duration: 0.12 }, ${n(tt)});`);
  tl(`tl.to("#r${k}", { scale: 0, duration: 0.2, ease: "power2.in" }, ${n(tt)});`);
});
suena('tachar', t(16));
frase({ palabras: ['Un', 'jueves', 'no', 'lo', 'haces,'], idx: 6, gruesas: [2, 3, 4], top: 1150, tam: 66, sale: t(11) - 0.12, oscuro: true });
frase({ palabras: ['y', 'ya', 'estás', 'pensando', 'en'], idx: 11, top: 1130, tam: 56, sale: t(20) + 0.12, oscuro: true });
frase({ palabras: ['volver', 'a', 'empezar', 'el', 'lunes.'], idx: 16, gruesas: [3, 4], top: 1206, tam: 70, sale: t(20) + 0.12, oscuro: true });
// "lunes": la semana sale disparada a la izquierda y entra un LUNES gigante
const T_LUNES = t(20) - 0.004;
tl(`tl.to("#semana", { x: -1300, filter: "blur(22px)", opacity: 0, duration: 0.26, ease: "power3.in" }, ${n(T_LUNES - 0.05)});`);
tl(`tl.fromTo("#lunes", { opacity: 0, x: 900, scale: 1.25, filter: "blur(24px)" }, { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 0.22, ease: "expo.out", immediateRender: false }, ${n(T_LUNES + 0.04)});`);
suena('whoosh', T_LUNES);
suena('golpe', T_LUNES + 0.16, { db: 1 });

// --- Escena 3 (negro): la cámara atraviesa el LUNES y llega el ícono de Racha con estela ---
tl(`tl.to("#lunes", { scale: 7, opacity: 0, filter: "blur(20px)", duration: 0.26, ease: "power3.in" }, ${n(T_RACHA - 0.22)});`);
tl(`tl.fromTo("#ola2", { scale: 0 }, { scale: 26, duration: 0.22, ease: "power2.in", immediateRender: true }, ${n(T_RACHA - 0.2)});`);
tl(`tl.set("#fondo", { backgroundColor: "#0A0A0B" }, ${n(T_RACHA + 0.03)});`);
tl(`tl.set("#ola2", { opacity: 0 }, ${n(T_RACHA + 0.04)});`);
const ESTELA = 6;
for (let k = ESTELA; k >= 0; k--) {
  const op = k === 0 ? 1 : 0.42 - k * 0.055;
  tl(`tl.fromTo("#ic${k}", { opacity: 0, scale: 0.12, y: 260 }, { opacity: ${n(op)}, scale: ${n(1 - k * 0.07)}, y: ${k * 34}, duration: 0.55, ease: "expo.out", immediateRender: false }, ${n(T_RACHA + k * 0.035)});`);
  if (k) tl(`tl.to("#ic${k}", { opacity: 0, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, ${n(T_RACHA + 0.7 + k * 0.03)});`);
}
tl(`tl.to("#ic0", { scale: 1.07, duration: ${n(T_FIN3 - T_RACHA - 1.0)}, ease: "none" }, ${n(T_RACHA + 0.6)});`);
tl(`tl.fromTo("#nombre", { opacity: 0, y: 30, filter: "blur(12px)", scaleX: 1.35 }, { opacity: 1, y: 0, filter: "blur(0px)", scaleX: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, ${n(t(21) + 0.02)});`);
suena('boom', T_RACHA + 0.02);
frase({ palabras: ['es', 'una', 'app', 'para', 'cumplir', 'tus', 'hábitos,'], idx: 22, gruesas: [6], top: 1190, tam: 58, sale: t(29) - 0.1 });
frase({ palabras: ['pensada', 'para', 'el', 'día', 'en', 'que', 'no', 'puedes.'], idx: 29, gruesas: [6, 7], top: 1190, tam: 58, sale: T_FIN3 - 0.2 });
// salida hacia la escena 4: la cámara entra en el ícono
tl(`tl.to(["#ic0", "#nombre"], { scale: 9, opacity: 0, filter: "blur(16px)", duration: 0.34, ease: "power3.in" }, ${n(T_FIN3 - 0.3)});`);
suena('whoosh', T_FIN3 - 0.05);


// --- Escena 3, más movimiento: pantallas tenues que flotan detrás del ícono y un aro que late en las palabras clave ---
const orbitas = [];
for (let k = 0; k < 10; k++) {
  const lado = k % 2 ? 1 : -1, ox = lado * (300 + azar() * 160), oy = -520 + azar() * 1150, w = 96 + azar() * 40;
  orbitas.push(`      <img class="orb" id="o${k}" src="assets/pantallas/p${(k + 3) % N_PANT}.jpg" style="width:${w.toFixed(0)}px;left:${(540 + ox).toFixed(0)}px;top:${(760 + oy).toFixed(0)}px" />`);
  tl(`tl.fromTo("#o${k}", { opacity: 0, x: ${lado * 120}, scale: 0.85 }, { opacity: 0.2, x: 0, scale: 1, duration: 0.6, ease: "expo.out", immediateRender: false }, ${n(T_RACHA + 0.15 + k * 0.03)});`);
  tl(`tl.to("#o${k}", { x: ${lado * -70}, y: ${n(-40 - azar() * 60)}, duration: ${n(T_FIN3 - T_RACHA - 1.35)}, ease: "none" }, ${n(T_RACHA + 1.05)});`);
  tl(`tl.to("#o${k}", { opacity: 0, duration: 0.2 }, ${n(T_FIN3 - 0.3)});`);
}
[t(28), t(35)].forEach((tt, j) => tl(`tl.fromTo("#anillo${j}", { opacity: 0.75, scale: 1 }, { opacity: 0, scale: 2.3, duration: 0.8, ease: "power2.out", immediateRender: false }, ${n(tt)});`));
suena('latido', t(28)); suena('latido', t(35));

// --- Escena 4 (blanco): crear un hábito con su versión pequeña; 30 minutos que bajan a 10 sentadillas ---
const T4 = T_FIN3;
tl(`tl.fromTo("#ola3", { scale: 0 }, { scale: 26, duration: 0.28, ease: "power3.in", immediateRender: true }, ${n(T4 - 0.28)});`);
tl(`tl.set("#fondo", { backgroundColor: "#F2F1EC" }, ${n(T4)});`);
tl(`tl.set("#ola3", { opacity: 0 }, ${n(T4 + 0.01)});`);
tl(`tl.fromTo("#tarjeta", { opacity: 0, y: 140, scale: 0.9, filter: "blur(14px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.4, ease: "expo.out", immediateRender: false }, ${n(t(37) - 0.03)});`);
suena('pop', t(37), { db: 2 });
tl(`tl.fromTo("#pildora", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", immediateRender: false }, ${n(t(43) - 0.03)});`);
suena('pop', t(43));
tl(`tl.fromTo("#cursor", { opacity: 0 }, { keyframes: { opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1] }, duration: ${n(t(59) - t(44) - 0.05)}, ease: "none", immediateRender: false }, ${n(t(44))});`);
tl(`tl.set("#cursor", { opacity: 0 }, ${n(t(59) - 0.02)});`);
tl(`tl.to("#tarjeta", { y: -70, scale: 0.88, duration: 0.35, ease: "power3.out" }, ${n(t(46) - 0.03)});`);
tl(`tl.fromTo(["#n30", "#umin"], { opacity: 0, y: 90, scale: 1.18, filter: "blur(16px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out", immediateRender: false }, ${n(t(51) - 0.03)});`);
suena('golpe', t(51));
tl(`tl.to(["#n30", "#umin"], { opacity: 0, y: -170, filter: "blur(14px)", duration: 0.24, ease: "power3.in" }, ${n(t(59) - 0.12)});`);
tl(`tl.fromTo(["#n10", "#usent"], { opacity: 0, y: 170, filter: "blur(14px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.32, ease: "expo.out", immediateRender: false }, ${n(t(59) - 0.02)});`);
tl(`tl.fromTo("#pildv", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out", immediateRender: false }, ${n(t(59))});`);
suena('whoosh', t(59) - 0.05); suena('pop', t(59) + 0.05, { db: 2 });
frase({ palabras: ['Cuando', 'creas', 'un', 'hábito,'], idx: 37, top: 1110, tam: 56, sale: t(46) - 0.12, oscuro: true });
frase({ palabras: ['le', 'pones', 'una', 'versión', 'pequeña.'], idx: 41, gruesas: [3, 4], top: 1180, tam: 62, sale: t(46) - 0.12, oscuro: true });
frase({ palabras: ['Si', 'el', 'hábito', 'es', 'entrenar', '30', 'minutos,'], idx: 46, gruesas: [5, 6], top: 1150, tam: 56, sale: t(53) - 0.1, oscuro: true });
frase({ palabras: ['la', 'versión', 'pequeña', 'puede', 'ser', 'hacer', '10', 'sentadillas.'], idx: 53, gruesas: [6, 7], top: 1120, tam: 56, sale: t(61) - 0.2, oscuro: true });

// --- Escena 5 (negro): la app de verdad en un celular en 3D: la hoja Día difícil y "+5 ganados · versión mínima" ---
const T5 = t(61) - 0.05, MEDIA5 = 1.1, T6 = t(79) - 0.05;
tl(`tl.to(["#tarjeta", "#grande"], { x: -1250, filter: "blur(22px)", opacity: 0, duration: 0.26, ease: "power3.in" }, ${n(T5 - 0.26)});`);
tl(`tl.fromTo("#ola4", { scale: 0 }, { scale: 26, duration: 0.24, ease: "power3.in", immediateRender: true }, ${n(T5 - 0.22)});`);
tl(`tl.set("#fondo", { backgroundColor: "#0A0A0B" }, ${n(T5 + 0.02)});`);
tl(`tl.set("#ola4", { opacity: 0 }, ${n(T5 + 0.03)});`);
tl(`tl.fromTo("#tel", { opacity: 0, x: 900, rotationY: -46, rotationX: 12, scale: 0.8, filter: "blur(18px)" }, { opacity: 1, x: 0, rotationY: -16, rotationX: 7, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out", immediateRender: false }, ${n(T5 - 0.08)});`);
tl(`tl.to("#tel", { rotationY: 12, rotationX: 2, duration: ${n(T6 - 0.32 - (T5 + 0.42))}, ease: "sine.inOut" }, ${n(T5 + 0.42)});`);
const T_MARCA = T5 + (5.01 - MEDIA5), T_HOJA = T5 + (1.406 - MEDIA5), T_ACTIVA = T5 + (3.61 - MEDIA5);
tl(`tl.to("#tel", { scale: 1.07, duration: 0.14, ease: "power2.out" }, ${n(T_MARCA)});`);
tl(`tl.to("#fondo", { backgroundColor: "#2A1D07", duration: 0.12, ease: "none" }, ${n(T_MARCA)});`);
tl(`tl.to("#brillo", { opacity: 1, duration: 0.15 }, ${n(T_MARCA)});`);
suena('whoosh', T5); suena('toque', T_HOJA); suena('toque', T_ACTIVA); suena('logro', T_MARCA, { db: -6 });
frase({ palabras: ['El', 'día', 'que', 'no', 'puedes', 'con', 'nada,'], idx: 61, gruesas: [3, 4, 5, 6], top: 1110, tam: 58, sale: t(68) - 0.1 });
frase({ palabras: ['haces', 'solo', 'eso.'], idx: 68, gruesas: [0, 1, 2], top: 1110, tam: 66, sale: t(71) - 0.1 });
frase({ palabras: ['Y', 'la', 'app', 'te', 'lo', 'cuenta', 'como', 'cumplido.'], idx: 71, gruesas: [6, 7], top: 1110, tam: 58, sale: T6 - 0.14 });

// --- Escena 6 (blanco): el contador de días seguidos sube hasta 12 y pasa a 13 ---
tl(`tl.to("#tel", { scale: 0.55, opacity: 0, filter: "blur(14px)", duration: 0.22, ease: "power3.in" }, ${n(T6 - 0.24)});`);
tl(`tl.fromTo("#ola5", { scale: 0 }, { scale: 26, duration: 0.26, ease: "power3.in", immediateRender: true }, ${n(T6 - 0.24)});`);
tl(`tl.set("#fondo", { backgroundColor: "#F2F1EC" }, ${n(T6 + 0.02)});`);
tl(`tl.set(["#ola5", "#brillo"], { opacity: 0 }, ${n(T6 + 0.03)});`);
tl(`tl.fromTo("#contador", { opacity: 0, scale: 1.3, filter: "blur(16px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.35, ease: "expo.out", immediateRender: false }, ${n(T6 + 0.02)});`);
{
  const de = t(80), a = t(86), paso = (a - de) / 11;
  for (let k = 1; k <= 12; k++) {
    const tt = k === 1 ? T6 + 0.02 : de + (k - 1) * paso;
    if (k > 1) tl(`tl.set("#cn${k - 1}", { opacity: 0 }, ${n(tt)});`);
    tl(`tl.set("#cn${k}", { opacity: 1 }, ${n(tt)});`);
  }
  suena('cuenta', de + 0.05); suena('cuenta', de + 0.75, { db: -2 });
}
tl(`tl.to("#cn12", { y: -260, opacity: 0, filter: "blur(12px)", duration: 0.22, ease: "power3.in" }, ${n(t(88) - 0.1)});`);
tl(`tl.fromTo("#cn13", { y: 260, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, ${n(t(88) - 0.02)});`);
tl(`tl.fromTo("#placa", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.8)", immediateRender: false }, ${n(t(88) - 0.02)});`);
suena('logro', t(88), { db: -6 }); suena('pop', t(88));
frase({ palabras: ['Tu', 'contador', 'de', 'días', 'seguidos'], idx: 79, gruesas: [3, 4], top: 1110, tam: 58, oscuro: true, sale: t(89) - 0.18 });
frase({ palabras: ['pasa', 'de', '12', 'a', '13.'], idx: 84, gruesas: [2, 3, 4], top: 1182, tam: 66, oscuro: true, sale: t(89) - 0.18 });

// --- Escena 7 (negro): la regla. Siete días unidos por una línea: un día malo y la línea sigue; dos seguidos y se rompe ---
const T7 = t(89) - 0.05, T8 = t(97) - 0.05;
tl(`tl.to("#contador", { scale: 1.6, opacity: 0, filter: "blur(16px)", duration: 0.24, ease: "power3.in" }, ${n(T7 - 0.24)});`);
tl(`tl.fromTo("#ola6", { scale: 0 }, { scale: 26, duration: 0.24, ease: "power3.in", immediateRender: true }, ${n(T7 - 0.22)});`);
tl(`tl.set("#fondo", { backgroundColor: "#0A0A0B" }, ${n(T7 + 0.02)});`);
tl(`tl.set("#ola6", { opacity: 0 }, ${n(T7 + 0.03)});`);
const R = 300, CX = 540, CY = 470, LET = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const pts = LET.map((_, k) => { const a = (-90 + k * (360 / 7)) * Math.PI / 180; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; });
const lineas = pts.slice(0, -1).map(([x1, y1], k) => { const [x2, y2] = pts[k + 1]; return `<line id="l${k}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#F5F5F2" stroke-width="7" stroke-linecap="round" opacity="0" />`; });
const puntos = pts.map(([x, y], k) => `<g id="p${k}" opacity="0"><circle id="pc${k}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="50" fill="#FFB547" stroke="#FFB547" stroke-width="6" /><text x="${x.toFixed(1)}" y="${(y + 15).toFixed(1)}" text-anchor="middle" class="pl" id="pt${k}">${LET[k]}</text></g>`);
const RED = `      <svg id="red" viewBox="0 0 1080 940" width="1080" height="940">\n        ${lineas.join('\n        ')}\n        ${puntos.join('\n        ')}\n      </svg>`;
pts.forEach((_, k) => tl(`tl.fromTo("#p${k}", { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", immediateRender: false }, ${n(T7 + 0.05 + k * 0.05)});`));
lineas.forEach((_, k) => tl(`tl.fromTo("#l${k}", { opacity: 0 }, { opacity: 0.55, duration: 0.25, immediateRender: false }, ${n(T7 + 0.2 + k * 0.05)});`));
const malo = (k, tt) => { tl(`tl.to("#pc${k}", { fill: "#0A0A0B", stroke: "#5B5D61", duration: 0.2 }, ${n(tt)});`); tl(`tl.to("#pt${k}", { fill: "#8A8C90", duration: 0.2 }, ${n(tt)});`); };
malo(2, t(91));                                    // "malo": el miércoles se apaga y la línea sigue
tl(`tl.fromTo(["#l1", "#l2"], { opacity: 0.55 }, { keyframes: { opacity: [0.55, 1, 0.55] }, duration: 0.6, ease: "none", immediateRender: false }, ${n(t(92))});`);
suena('golpe', t(91), { db: -4 });
malo(4, t(94)); malo(5, t(95));                    // "dos seguidos": viernes y sábado
suena('golpe', t(94), { db: -2 }); suena('golpe', t(95), { db: -2 });
tl(`tl.to("#l4", { stroke: "#E5484D", opacity: 1, duration: 0.1 }, ${n(t(96) - 0.03)});`);   // "no": la línea entre los dos se rompe
tl(`tl.to("#l4", { opacity: 0, duration: 0.25 }, ${n(t(96) + 0.12)});`);
tl(`tl.fromTo("#red", { x: 0 }, { keyframes: { x: [0, -18, 15, -10, 6, 0] }, duration: 0.4, ease: "none", immediateRender: false }, ${n(t(96))});`);
suena('golpe', t(96), { db: 2 }); suena('caida', t(96) + 0.05);
frase({ palabras: ['Un', 'día', 'malo', 'se', 'vale.'], idx: 89, gruesas: [3, 4], top: 1110, tam: 66, sale: t(94) - 0.12 });
frase({ palabras: ['Dos', 'seguidos,', 'no.'], idx: 94, gruesas: [2], top: 1110, tam: 72, sale: T8 - 0.1 });

// --- Escena 8 (negro): el ícono, "escribe RACHA y te la muestro" y el precio ---
tl(`tl.to("#red", { scale: 0.15, opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "power3.in" }, ${n(T8 - 0.2)});`);
tl(`tl.fromTo("#fin", { opacity: 0, scale: 0.2, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: "back.out(1.7)", immediateRender: false }, ${n(T8 + 0.06)});`);
tl(`tl.fromTo("#anillo2", { opacity: 0.8, scale: 1 }, { opacity: 0, scale: 2.4, duration: 0.9, ease: "power2.out", immediateRender: false }, ${n(T8 + 0.2)});`);
suena('boom', T8 + 0.06);
tl(`tl.fromTo("#esc", { opacity: 0, y: 20, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25, ease: "power2.out", immediateRender: false }, ${n(t(97) - 0.03)});`);
tl(`tl.fromTo("#marca", { opacity: 0, scale: 1.25, filter: "blur(18px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.35, ease: "expo.out", immediateRender: false }, ${n(t(98) - 0.03)});`);
tl(`tl.to("#marca", { scale: 1.04, duration: ${n(TOTAL - t(98) - 0.4)}, ease: "none" }, ${n(t(98) + 0.33)});`);
tl(`tl.fromTo("#ytela", { opacity: 0, y: 20, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25, ease: "power2.out", immediateRender: false }, ${n(t(99) - 0.03)});`);
tl(`tl.fromTo("#pastilla", { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, ${n(t(102) + 0.25)});`);
suena('pop', t(102) + 0.25, { db: 1 });

const MAS_HTML = `${orbitas.join('\n')}
      <div class="anillo" id="anillo0"></div>
      <div class="anillo" id="anillo1"></div>
      <div class="ola" id="ola3" style="background:#F2F1EC;z-index:47;top:660px"></div>
      <div id="tarjeta">
        <p class="etq">Nuevo hábito</p>
        <p class="nom">Entrenar 30 minutos</p>
        <div id="pildora"><span class="pl1">Versión pequeña:</span> <span id="pildv">10 sentadillas</span><span id="cursor"></span></div>
      </div>
      <div id="grande">
        <p class="num" id="n30">30</p><p class="num" id="n10">10</p>
        <p class="uni" id="umin">MINUTOS</p><p class="uni" id="usent">SENTADILLAS</p>
      </div>
      <div class="ola" id="ola4" style="background:#0A0A0B;z-index:52"></div>
      <div id="brillo"></div>
      <div id="persp"><div id="tel"><video id="vtel" src="assets/dia-dificil.mp4" playsinline muted data-start="${n(T5 - 0.1)}" data-duration="${n(T6 - T5 + 0.1)}" data-media-start="${n(MEDIA5 - 0.1)}" data-track-index="3"></video></div></div>
      <div class="ola" id="ola5" style="background:#F2F1EC;z-index:57;top:620px"></div>
      <div id="contador">
        <img id="llamita" src="assets/icono.svg" />
        <div id="cifra"><div id="placa"></div>${Array.from({ length: 13 }, (_, k) => `<span class="c" id="cn${k + 1}">${k + 1}</span>`).join('')}</div>
      </div>
      <div class="ola" id="ola6" style="background:#0A0A0B;z-index:59;top:640px"></div>
${RED}
      <div class="anillo" id="anillo2" style="top:330px;z-index:61"></div>
      <img class="icono" id="fin" src="assets/icono.svg" style="top:330px;width:260px;height:260px;margin-left:-130px;border-radius:58px;z-index:62" />
      <p class="chica" id="esc">escribe</p>
      <p id="marca">RACHA</p>
      <p class="chica" id="ytela">y te la muestro</p>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago · 7 días para probarla</span></div>`;

const MAS_CSS = `      .orb { position: absolute; border-radius: 12px; opacity: 0; z-index: 15; filter: grayscale(0.3); }
      .anillo { position: absolute; left: 50%; top: 560px; width: 300px; height: 300px; margin-left: -150px; border-radius: 68px; border: 5px solid #FFB547; opacity: 0; z-index: 23; }
      #tarjeta { position: absolute; left: 110px; right: 110px; top: 300px; background: #0F1113; border-radius: 40px; padding: 40px 46px 46px; opacity: 0; z-index: 50; box-shadow: 0 30px 70px rgba(0, 0, 0, 0.25); }
      #tarjeta .etq { font-family: "Barlow", sans-serif; font-weight: 300; font-size: 34px; color: #9A9890; }
      #tarjeta .nom { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 60px; letter-spacing: -0.02em; color: #F5F5F2; margin-top: 8px; }
      #pildora { margin-top: 30px; display: inline-flex; align-items: center; gap: 12px; border: 4px solid #FFB547; border-radius: 999px; padding: 14px 30px 18px; font-family: "Barlow", sans-serif; font-size: 40px; color: #F5F5F2; opacity: 0; }
      #pildora .pl1 { font-weight: 300; color: #C9C6BC; }
      #pildv { font-weight: 600; opacity: 0; }
      #cursor { display: inline-block; width: 4px; height: 44px; background: #FFB547; opacity: 0; }
      #grande { position: absolute; left: 0; right: 0; top: 590px; height: 480px; z-index: 50; }
      .num { position: absolute; left: 0; right: 0; top: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 380px; line-height: 1; color: #0F1113; opacity: 0; }
      .uni { position: absolute; left: 0; right: 0; top: 404px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 66px; letter-spacing: 0.06em; color: #7A776E; opacity: 0; }
      #brillo { position: absolute; inset: 0; z-index: 53; opacity: 0; background: radial-gradient(ellipse 60% 45% at 50% 42%, rgba(255, 181, 71, 0.32), rgba(255, 181, 71, 0) 70%); }
      #persp { position: absolute; left: 0; right: 0; top: 200px; height: 860px; perspective: 1800px; z-index: 55; }
      #tel { position: absolute; left: 50%; top: 0; width: 410px; height: 841px; margin-left: -205px; border-radius: 58px; border: 11px solid #1D1F23; background: #000; overflow: hidden; opacity: 0; box-shadow: 0 40px 90px rgba(0, 0, 0, 0.7), 0 0 0 2px #3A3D42; }
      #vtel { width: 100%; height: 100%; object-fit: cover; }
      #contador { position: absolute; left: 0; right: 0; top: 440px; display: flex; align-items: center; justify-content: center; gap: 40px; opacity: 0; z-index: 56; }
      #llamita { width: 190px; height: 190px; border-radius: 44px; }
      #cifra { position: relative; width: 470px; height: 420px; overflow: visible; }
      #placa { position: absolute; inset: 0 -10px; background: #FFB547; border-radius: 60px; opacity: 0; }
      .c { position: absolute; left: 0; right: 0; top: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 400px; line-height: 1.05; color: #0F1113; opacity: 0; }
      #red { position: absolute; left: 0; top: 230px; z-index: 60; overflow: visible; }
      .pl { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 46px; fill: #0F1113; }
      .chica { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow", sans-serif; font-weight: 300; font-size: 64px; color: #F5F5F2; opacity: 0; z-index: 62; }
      #esc { top: 622px; } #ytela { top: 1000px; }
      #marca { position: absolute; left: 0; right: 0; top: 734px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 250px; line-height: 1; letter-spacing: 0.01em; color: #FFB547; opacity: 0; z-index: 62; text-shadow: 0 0 60px rgba(255, 181, 71, 0.35); }
      #pastilla { position: absolute; left: 0; right: 0; top: 1100px; display: flex; justify-content: center; opacity: 0; z-index: 62; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 34px; letter-spacing: -0.01em; color: #F5F5F2; background: #15171A; border: 3px solid #FFB547; border-radius: 999px; padding: 14px 30px 18px; white-space: nowrap; box-shadow: 0 0 34px rgba(255, 181, 71, 0.35); }`;

const iconos = Array.from({ length: ESTELA + 1 }, (_, k) => `      <img class="icono" id="ic${k}" src="assets/icono.svg" style="z-index:${30 - k}" />`).join('\n');

// ---------- 4. mezcla de efectos ----------
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
  fs.writeFileSync(path.join(BASE, 'vitrina-sonidos.txt'), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(10)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}
fs.writeFileSync(path.join(BASE, 'tiempos.json'), JSON.stringify({ total: n(TOTAL), semana: n(T_SEMANA), racha: n(T_RACHA), escena4: n(T_FIN3) }, null, 1), 'utf8');

// ---------- 5. la página ----------
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · vitrina estilo rimu</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 300; src: url("assets/fuentes/barlow-300.woff2") format("woff2"); }
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlowc-700.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #0A0A0B; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #fondo { position: absolute; inset: 0; background: #0A0A0B; }
      .ola { position: absolute; left: 490px; top: 910px; width: 100px; height: 100px; border-radius: 50%; transform: scale(0); }
      #bola { position: absolute; left: 540px; top: ${BOLA_Y}px; width: 0; height: 0; z-index: 20; }
      .tarj { position: absolute; left: 0; top: 0; transform-origin: 50% 50%; border-radius: 14px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); opacity: 0; }
      .frase { position: absolute; left: 50%; transform: translateX(-50%); width: max-content; text-align: center; font-family: "Barlow", sans-serif; font-weight: 300; line-height: 1.12; letter-spacing: -0.02em; color: #F5F5F2; z-index: 60; }
      .frase.osc { color: #0F1113; }
      .frase .w { display: inline-block; opacity: 0; }
      .frase .g { font-weight: 600; }
      #semana { position: absolute; left: 0; right: 0; top: 520px; display: flex; flex-direction: column; align-items: center; gap: 42px; opacity: 0; z-index: 40; }
      #semana .titulo { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 60px; letter-spacing: -0.01em; color: #0F1113; }
      #semana .fila { display: flex; gap: 14px; }
      .dia { display: flex; flex-direction: column; align-items: center; gap: 16px; }
      .letra { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 44px; color: #7A776E; }
      .aro { position: relative; width: 130px; height: 130px; border-radius: 50%; border: 4px solid #CFCCC3; display: flex; align-items: center; justify-content: center; }
      .relleno { position: absolute; inset: -4px; border-radius: 50%; background: #FFB547; transform: scale(0); }
      .chulo { position: relative; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 68px; color: #0F1113; opacity: 0; }
      #lunes { position: absolute; left: 0; right: 0; top: 520px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 330px; line-height: 1; letter-spacing: -0.01em; color: #0F1113; opacity: 0; z-index: 41; }
      .icono { position: absolute; left: 50%; top: 560px; width: 300px; height: 300px; margin-left: -150px; border-radius: 68px; opacity: 0; box-shadow: 0 0 90px rgba(255, 181, 71, 0.28); }
      #nombre { position: absolute; left: 0; right: 0; top: 920px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 150px; line-height: 1; color: #F5F5F2; opacity: 0; z-index: 50; }
${MAS_CSS}
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="fondo"></div>
      <div class="ola" id="ola1" style="background:#F2F1EC;z-index:39;top:550px"></div>
      <div class="ola" id="ola2" style="background:#0A0A0B;z-index:45;top:635px"></div>
      <div id="bola">
${tarjetas.join('\n')}
      </div>
      <div id="semana">
        <p class="titulo">Entrenar 30 minutos</p>
        <div class="fila">
${semana}
        </div>
      </div>
      <p id="lunes">LUNES</p>
${iconos}
      <p id="nombre">Racha</p>
${MAS_HTML}
${frases.join('\n')}
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
  const de = path.join(C, 'guion12', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion12').join('campana-rimu1'), 'utf8');
}
console.log(`Listo vitrina: dura ${TOTAL.toFixed(2)} s · semana ${T_SEMANA.toFixed(2)} · Racha ${T_RACHA.toFixed(2)} · escena 4 ${T_FIN3.toFixed(2)} · ${sonidos.length} efectos · ${N_PANT} pantallas`);
