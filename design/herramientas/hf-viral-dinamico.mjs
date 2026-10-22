// Versión dinámica del guion 5 "Otra vez desde cero" (22 oct de 2026, pedido de Johnatan: "edítalo más dinámico con lo que
// aprendiste de rimu, cambia la música y al final muestra la app con las tomas del POV").
// Uso: node design/herramientas/hf-viral.mjs guion5-dinamico   (arma Lina y la voz sin silencios en guion5/hyperframes-dinamico)
//      node design/herramientas/hf-viral-dinamico.mjs            (todo lo demás: escenas, cámara, letras, sonidos y música)
//      después, en guion5/hyperframes-dinamico: check, snapshot, render --low-memory-mode -w 1 -f 30 -o ../guion5-dinamico-v1-maestro.mp4
//
// Lo que tiene (lo aprendido en rimu 2 y 3):
// - La voz y el guion son los mismos del anuncio aprobado. Lina lleva el filtro de la campaña.
// - Cámara con intención sobre Lina (#lente: se acerca o se aleja despacio en cada tramo, un movimiento a la vez, sin vaivén)
//   y golpes secos en las palabras clave (#golpe).
// - Las ideas se cuentan con gráficos grandes a pantalla completa (fondo claro u oscuro, cortes secos): los tres íconos que se
//   tachan, el contador que cae a 0, el estudio con 96 puntos, Racha con los días que siguen, el hábito que se vuelve pequeño.
// - Un vistazo corto de la app (se marca la versión mínima) y al final las tomas del POV 3 (una ventana distinta por golpe).
// - Música "Midnight Minor": el gancho va sin música y la canción entra en su caída del bajo; los cortes del final caen en sus golpes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const BASE = path.join(C, 'guion5');
const P = path.join(BASE, 'hyperframes-dinamico');
const A = path.join(P, 'assets');
fs.mkdirSync(path.join(P, 'compositions'), { recursive: true });
const n = (x) => Number(x.toFixed(4));
const T = JSON.parse(fs.readFileSync(path.join(P, 'tiempos.json'), 'utf8'));
const W = (h, k) => { const w = T.palabras.find((x) => x.h === h && x.k === k); if (!w) throw new Error(`No hay palabra ${k} en el pedazo ${h}`); return w; };
const corte = (h, j = 0) => T.pedazos.filter((p) => p.h === h)[j].en;   // segundo donde empieza el pedazo h (o su tramo j)
const cuadro = (t) => Math.round(t * 30) / 30 - 0.004;                   // pegado al cuadro (ver el OJO de hf-viral.mjs)

// ---------- el ritmo: "Midnight Minor", 91 golpes por minuto, golpes en 0,65 + k·0,6593; la caída del bajo en 10,54 ----------
const GOLPE = 0.6593, MUSICA_DESDE = 10.54;
const B0 = corte(2);                          // la música entra donde termina el gancho ("Por creer eso"), con el destello
const golpe = (m) => B0 + m * GOLPE;
const VOZ_FIN = W(13, 16).f;
const M0 = golpe(Math.ceil((VOZ_FIN + 0.12 - B0) / GOLPE));   // el primer golpe después de "te la muestro": arranca el final con la app
const TOMAS = [   // POV 3 (campana/pov3/cortes): una ventana distinta por golpe
  { id: 'hoy', rotulo: 'Hoy', desde: 0.45, golpes: 1 },
  { id: 'tareas', rotulo: 'Tareas', desde: 0.55, golpes: 1 },
  { id: 'foco', rotulo: 'Foco', desde: 0.5, golpes: 1 },
  { id: 'semana', rotulo: 'Tu semana', desde: 0.6, golpes: 1 },
  { id: 'radar', rotulo: 'Progreso', desde: 1.2, golpes: 1 },
  { id: 'anio', rotulo: 'Tu año', desde: 0.62, golpes: 2 },
];
let m = 0; TOMAS.forEach((tm) => { tm.a = golpe(Math.round((M0 - B0) / GOLPE) + m); m += tm.golpes; tm.b = golpe(Math.round((M0 - B0) / GOLPE) + m); });
const CIERRE = TOMAS[TOMAS.length - 1].b;
const TOTAL = n(CIERRE + 3.6);

// ---------- las escenas a pantalla completa (Lina no se ve; sus subtítulos tampoco) ----------
const ESC = {
  tres: { a: W(3, 9).i - 0.12, b: corte(5) },          // "dejé el gimnasio, dejé cursos, y dejé libros por la mitad"
  cero: { a: corte(6, 1), b: corte(7) },               // "un día sin marcar y la cuenta volvía a cero"
  estudio: { a: corte(8, 2), b: corte(9) },            // "va a haber días malos y hay que contar con ellos"
  racha: { a: corte(10), b: corte(11) },               // "Por eso hicimos Racha, una app para que el día que no cumples..."
  pequena: { a: corte(11, 1), b: corte(12) },          // "conviertes el hábito en una versión más pequeña"
  app: { a: W(12, 24).i - 0.08, b: corte(13) },        // "lees una y eso cuenta" (la app de verdad marcando la versión mínima)
  final: { a: M0, b: TOTAL },
};
Object.values(ESC).forEach((e) => { e.a = cuadro(e.a); e.b = cuadro(e.b); });
const tapado = (t) => Object.values(ESC).some((e) => t >= e.a - 0.02 && t < e.b);

// ---------- sonidos ----------
const VOLUMEN = { manejo: -5, whoosh: -7, golpe: -4, obturador: -9, pop: -6, tachar: -11, cuenta: -11, caida: -6, campana: -8, toque: -6, logro: -8, boom: -6, diapositiva: -9, brillo: -14, subida: -12, piedra: -10 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const sonidos = [];
const suena = (s, t, { alGolpe = false, db = 0, desde = 0, dura = 0 } = {}) => { if (MEDIDAS[s]) sonidos.push({ s, t: Math.max(0, t - (alGolpe ? MEDIDAS[s].golpe_en - desde : 0)), db: VOLUMEN[s] + db, desde, dura }); };

// ---------- letras e íconos ----------
const AMBAR = '#FFB547', TINTA = '#0F1113', CLARO = '#F4EFE6', GRIS = '#6E675C', OSCURO_TXT = '#A89F92', CAFE = '#9A5B00';
const SOMBRA = '0 3px 0 rgba(15, 17, 19, 0.85), 0 0 16px rgba(15, 17, 19, 0.85), 0 0 4px rgba(15, 17, 19, 0.9)';
const LETRAS = `
        @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }`;
const icono = (nombre) => [...fs.readFileSync(path.join(RAIZ, 'node_modules', 'lucide-react', 'dist', 'esm', 'icons', nombre + '.js'), 'utf8').matchAll(/d:\s*"([^"]+)"/g)].map((x) => `<path d="${x[1]}" />`).join('');
const svg = (nombre, color, grosor = 1.9) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icono(nombre)}</svg>`;
const LLAMA = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';
const llama = (color) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${color}" d="${LLAMA}" /></svg>`;

const pieza = (id, estilo, cuerpo, pasos) => fs.writeFileSync(path.join(P, 'compositions', `${id}.html`), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>${LETRAS}
        #root { position: absolute; inset: 0; overflow: hidden; }
${estilo}
      </style>
      <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920">
${cuerpo}
      </div>
      <script>
        (() => {
          const tl = gsap.timeline({ paused: true });
          ${pasos.join('\n          ')}
          window.__timelines["${id}"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`, 'utf8');

// ===================== las escenas =====================
const eHtml = [], eCss = [], eP = [];
const p = (s) => eP.push(s);
const muestra = (id, e) => { p(`tl.set("#${id}", { autoAlpha: 1 }, ${n(e.a)});`); p(`tl.set("#${id}", { autoAlpha: 0 }, ${n(e.b)});`); p(`tl.fromTo("#${id}", { scale: 1 }, { scale: 1.06, duration: ${n(e.b - e.a)}, ease: "none", immediateRender: false }, ${n(e.a)});`); };
const golpea = (sel, t, desde = 1.09) => p(`tl.fromTo("${sel}", { scale: ${desde} }, { scale: 1, duration: 0.3, ease: "expo.out", immediateRender: false }, ${n(t)});`);
const cae = (sel, t, desde = 2.2) => p(`tl.fromTo("${sel}", { autoAlpha: 0, scale: ${desde} }, { autoAlpha: 1, scale: 1, duration: 0.16, ease: "power4.in", immediateRender: false }, ${n(t)});`);
const salta = (sel, t, y = 50) => p(`tl.fromTo("${sel}", { autoAlpha: 0, y: ${y}, scale: 0.85 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "back.out(2)", immediateRender: false }, ${n(t)});`);

// --- 1. "dejé el gimnasio, dejé cursos, y dejé libros por la mitad": tres íconos que caen; el libro se parte en dos ---
{
  const e = ESC.tres, cosas = [['dumbbell', 'gimnasio', W(3, 9).i], ['graduation-cap', 'cursos', W(3, 11).i], ['book-open', 'libros', W(4, 16).i]];
  const lado = 290, hueco = 40, izq = (1080 - (3 * lado + 2 * hueco)) / 2;
  eCss.push(`        #tres { background: ${CLARO}; }
        #tres .titulo { position: absolute; left: 0; right: 0; top: 330px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 250px; line-height: 1; color: ${TINTA}; }
        #tres .tile { position: absolute; top: 720px; width: ${lado}px; height: ${lado}px; }
        #tres .cara { position: absolute; inset: 0; background: #fff; border: 7px solid ${TINTA}; border-radius: 40px; box-shadow: 12px 12px 0 ${TINTA}; display: flex; align-items: center; justify-content: center; }
        #tres .cara svg { width: 160px; height: 160px; }
        #tres .raya { position: absolute; left: 10px; right: 10px; top: 50%; height: 16px; margin-top: -8px; background: #D5320F; border-radius: 8px; transform: rotate(-38deg) scaleX(0); }
        #tres .nom { position: absolute; left: -40px; right: -40px; top: ${lado + 34}px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 54px; color: ${TINTA}; }
        #tres .mitad1 { clip-path: inset(0 50% 0 0); } #tres .mitad2 { clip-path: inset(0 0 0 50%); }`);
  eHtml.push(`        <div class="esc" id="tres"><div class="cam"><p class="titulo" id="tres-t">DEJÉ</p>${cosas.map(([ico, nom], j) => j < 2
    ? `<div class="tile" id="tres-${j}" style="left: ${izq + j * (lado + hueco)}px"><div class="cara">${svg(ico, TINTA)}</div><span class="raya" id="tres-${j}-r"></span><p class="nom">${nom}</p></div>`
    : `<div class="tile" id="tres-${j}" style="left: ${izq + j * (lado + hueco)}px"><div class="cara mitad1" id="tres-m1">${svg(ico, TINTA)}</div><div class="cara mitad2" id="tres-m2">${svg(ico, TINTA)}</div><p class="nom">${nom}</p></div>`).join('')}</div></div>`);
  muestra('tres', e);
  cae('#tres-t', e.a, 1.8); suena('golpe', e.a + 0.14); suena('whoosh', e.a, { alGolpe: true });
  cosas.forEach(([, , t], j) => { cae(`#tres-${j}`, t - 0.14); suena('golpe', t + 0.02, { db: -2 }); suena('pop', t, { db: -2 }); golpea('#tres .cam', t + 0.02, 1.04); });
  [0, 1].forEach((j) => { const t = cosas[j][2] + 0.42; p(`tl.to("#tres-${j}-r", { scaleX: 1, duration: 0.18, ease: "power2.out" }, ${n(t)});`); p(`tl.to("#tres-${j} .cara", { backgroundColor: "#D9D2C6", duration: 0.12 }, ${n(t)});`); suena('tachar', t, { desde: 0.09, dura: 0.24 }); });
  const tm = W(4, 19).i - 0.12;   // "mitad": el libro se parte
  p(`tl.to("#tres-m1", { x: -26, y: 90, rotation: -14, duration: 0.32, ease: "power3.out" }, ${n(tm)});`);
  p(`tl.to("#tres-m2", { x: 26, y: 90, rotation: 14, duration: 0.32, ease: "power3.out" }, ${n(tm)});`);
  suena('piedra', tm, { db: -2 }); golpea('#tres .cam', tm, 1.06);
}

// --- 2. "un día sin marcar y la cuenta volvía a cero": el contador cae de 23 a 0 ---
{
  const e = ESC.cero, nums = [23, 17, 9, 3, 0], tc = W(6, 14).i, t0 = W(6, 16).i - 0.04;
  eCss.push(`        #cero { background: ${TINTA}; }
        #cero .fl { position: absolute; left: 430px; top: 300px; width: 220px; height: 220px; }
        #cero .fl svg { width: 100%; height: 100%; }
        #cero .num { position: absolute; left: 0; right: 0; top: 520px; height: 430px; }
        #cero .num b { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 430px; line-height: 430px; color: ${AMBAR}; opacity: 0; }
        #cero .rot { position: absolute; left: 0; right: 0; top: 980px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 64px; color: ${OSCURO_TXT}; }
        #cero .dias { position: absolute; left: 89px; top: 1130px; display: flex; gap: 22px; }
        #cero .d { width: 110px; height: 110px; border-radius: 26px; background: ${AMBAR}; }
        #cero .d.vacio { background: transparent; border: 6px dashed #8C857A; }`);
  eHtml.push(`        <div class="esc" id="cero"><div class="cam"><div class="fl" id="cero-fl">${llama(AMBAR)}</div><div class="num">${nums.map((v, j) => `<b id="cero-n${j}">${v}</b>`).join('')}</div><p class="rot">días seguidos</p><div class="dias">${[0, 1, 2, 3, 4, 5, 6].map((j) => `<span class="d${j === 6 ? ' vacio' : ''}" id="cero-d${j}"></span>`).join('')}</div></div></div>`);
  muestra('cero', e);
  p(`tl.set("#cero-n0", { opacity: 1 }, ${n(e.a)});`); cae('#cero-n0', e.a, 1.6); cae('#cero-fl', e.a + 0.04, 1.5);
  suena('whoosh', e.a, { alGolpe: true }); suena('golpe', e.a + 0.14, { db: -2 });
  [0, 1, 2, 3, 4, 5].forEach((j) => p(`tl.fromTo("#cero-d${j}", { scale: 0 }, { scale: 1, duration: 0.14, ease: "back.out(3)", immediateRender: false }, ${n(e.a + 0.1 + j * 0.05)});`));
  const tv = W(6, 8).i;   // "día" (sin marcar): aparece el hueco
  p(`tl.fromTo("#cero-d6", { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.24, ease: "back.out(3)", immediateRender: false }, ${n(tv)});`); suena('pop', tv, { db: -1 });
  p(`tl.to("#cero-d6", { scale: 1.12, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${n(tv + 0.26)});`);
  golpea('#cero .cam', tc, 1.05);
  nums.slice(1).forEach((_, j) => { const t = t0 - (nums.length - 2 - j) * 0.09; p(`tl.set("#cero-n${j}", { opacity: 0 }, ${n(t)});`); p(`tl.set("#cero-n${j + 1}", { opacity: 1 }, ${n(t)});`); });
  suena('cuenta', t0 - 0.3, { dura: 0.3 });
  p(`tl.to("#cero-n4", { color: "${GRIS}", duration: 0.1 }, ${n(t0)});`);
  p(`tl.to("#cero-fl path", { fill: "#3A3631", duration: 0.2 }, ${n(t0)});`);
  p(`tl.to("#cero .d", { backgroundColor: "#2A2722", duration: 0.2 }, ${n(t0)});`);
  p(`tl.to("#cero .cam", { x: -16, duration: 0.05, repeat: 5, yoyo: true, ease: "power1.inOut" }, ${n(t0 + 0.02)});`);
  suena('caida', t0, { db: 1 }); suena('golpe', t0 + 0.02, { db: 1 });
}

// --- 3. "va a haber días malos y hay que contar con ellos": el estudio con 96 puntos ---
{
  const e = ESC.estudio, cols = 12, filas = 8, lado = 52, hueco = 22, izq = (1080 - (cols * lado + (cols - 1) * hueco)) / 2;
  const malos = [5, 14, 22, 31, 40, 47, 53, 61, 66, 74, 79, 88, 93, 9];   // los puntos que fallan un día
  eCss.push(`        #estudio { background: ${CLARO}; }
        #estudio .rot { position: absolute; left: 0; right: 0; top: 230px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 84px; letter-spacing: 0.04em; color: ${CAFE}; }
        #estudio .g { position: absolute; top: 380px; left: ${izq}px; width: ${cols * lado + (cols - 1) * hueco}px; display: grid; grid-template-columns: repeat(${cols}, ${lado}px); gap: ${hueco}px; }
        #estudio .p { width: ${lado}px; height: ${lado}px; border-radius: 50%; background: ${AMBAR}; border: 0 solid #B9B2A6; }
        #estudio .txt { position: absolute; left: 70px; right: 70px; top: 1020px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 76px; line-height: 1.08; color: ${TINTA}; }
        #estudio .fte { position: absolute; left: 0; right: 0; top: 1230px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 36px; color: ${GRIS}; }`);
  eHtml.push(`        <div class="esc" id="estudio"><div class="cam"><p class="rot" id="est-rot">ESTUDIO CON 96 PERSONAS</p><div class="g">${Array.from({ length: cols * filas }, (_, j) => `<span class="p" id="est-p${j}"></span>`).join('')}</div><p class="txt" id="est-txt">Faltar un día no afectó<br>el hábito</p><p class="fte" id="est-fte">Lally y otros, 2010 · University College London</p></div></div>`);
  muestra('estudio', e);
  cae('#est-rot', e.a, 1.5); suena('whoosh', e.a, { alGolpe: true }); suena('golpe', e.a + 0.14, { db: -3 });
  p(`tl.fromTo("#estudio .p", { scale: 0 }, { scale: 1, duration: 0.16, ease: "back.out(3)", stagger: { each: 0.005, from: "random" }, immediateRender: false }, ${n(e.a + 0.08)});`);
  suena('brillo', e.a + 0.1, { desde: 0.2, dura: 0.5 });
  const tm = W(8, 23).i;   // "malos": unos puntos se apagan
  p(`tl.to("${malos.map((j) => `#est-p${j}`).join(', ')}", { backgroundColor: "${CLARO}", borderWidth: 7, duration: 0.14, stagger: 0.02 }, ${n(tm)});`);
  suena('pop', tm, { db: -2 }); golpea('#estudio .cam', tm, 1.04);
  const tc = W(8, 27).i;   // "contar con ellos": vuelven a encenderse
  p(`tl.to("${malos.map((j) => `#est-p${j}`).join(', ')}", { backgroundColor: "${AMBAR}", borderWidth: 0, duration: 0.14, stagger: 0.02 }, ${n(tc)});`);
  salta('#est-txt', W(8, 24).i); salta('#est-fte', W(8, 24).i + 0.2, 20); suena('pop', W(8, 24).i, { db: -1 }); golpea('#estudio .cam', tc, 1.04);
}

// --- 4. "Por eso hicimos Racha, una app para que el día que no cumples no te haga empezar de cero" ---
{
  const e = ESC.racha, tR = W(10, 29).i - 0.06, tApp = W(10, 30).i, tDias = W(10, 32).i, tMalo = W(10, 38).i, tSigue = W(10, 39).i;
  const letras = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  eCss.push(`        #racha { background: ${TINTA}; }
        #racha .pre { position: absolute; left: 0; right: 0; top: 820px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 96px; color: ${CLARO}; }
        #racha .ola { position: absolute; left: 540px; top: 900px; width: 2400px; height: 2400px; margin: -1200px 0 0 -1200px; border-radius: 50%; background: ${AMBAR}; transform: scale(0); }
        #racha .gran { position: absolute; left: 290px; top: 620px; width: 500px; height: 500px; }
        #racha .gran svg, #racha .ic svg { width: 100%; height: 100%; }
        #racha .marca { position: absolute; left: 0; right: 0; top: 250px; display: flex; align-items: center; justify-content: center; gap: 30px; }
        #racha .ic { width: 190px; height: 190px; border-radius: 44px; background: ${AMBAR}; padding: 32px; }
        #racha .mt { display: flex; flex-direction: column; }
        #racha .mt b { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 190px; line-height: 0.92; color: ${CLARO}; }
        #racha .mt i { font-style: normal; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 56px; color: ${OSCURO_TXT}; }
        #racha .cont { position: absolute; left: 0; right: 0; top: 620px; height: 300px; }
        #racha .cont b { position: absolute; left: 0; right: 0; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 300px; line-height: 300px; color: ${AMBAR}; opacity: 0; }
        #racha .dias { position: absolute; left: 89px; top: 1010px; display: flex; gap: 22px; }
        #racha .d { width: 110px; height: 110px; border-radius: 26px; background: #2A2722; display: flex; align-items: center; justify-content: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 58px; color: #6E675C; }
        #racha .d.si { background: ${AMBAR}; color: ${TINTA}; }`);
  const cuenta = [9, 10, 11, 12, 13, 14, 15];
  eHtml.push(`        <div class="esc" id="racha"><div class="cam"><p class="pre" id="r-pre">por eso hicimos</p><div class="ola" id="r-ola"></div><div class="gran" id="r-gran">${llama(TINTA)}</div>
          <div class="marca" id="r-marca"><span class="ic">${llama(TINTA)}</span><span class="mt"><b>Racha</b><i>es una app</i></span></div>
          <div class="cont">${cuenta.map((v, j) => `<b id="r-n${j}">${v}</b>`).join('')}</div>
          <div class="dias">${letras.map((l, j) => `<span class="d" id="r-d${j}">${l}</span>`).join('')}</div></div></div>`);
  muestra('racha', e);
  // la llama ámbar llena la pantalla en "Racha" y se encoge en la marca
  p(`tl.set("#r-marca, #racha .cont, #racha .dias, #r-gran", { autoAlpha: 0 }, ${n(e.a)});`);
  salta('#r-pre', e.a + 0.02, 30); p(`tl.set("#r-pre", { autoAlpha: 0 }, ${n(tR - 0.04)});`);
  p(`tl.fromTo("#r-gran", { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", immediateRender: false }, ${n(tR)});`);
  p(`tl.fromTo("#r-ola", { scale: 0 }, { scale: 1, duration: 0.3, ease: "power3.out", immediateRender: false }, ${n(tR - 0.08)});`);
  suena('campana', tR, { db: -6, dura: 0.42 }); suena('whoosh', tR, { alGolpe: true, db: -2 });   // la campana se corta antes de "una app" (la tapaba)
  p(`tl.to("#r-ola", { scale: 0, duration: 0.3, ease: "power3.in" }, ${n(tApp - 0.08)});`);
  p(`tl.to("#r-gran", { scale: 0.38, x: -184, y: -560, autoAlpha: 0, duration: 0.3, ease: "power3.inOut" }, ${n(tApp - 0.08)});`);
  p(`tl.set("#r-marca", { autoAlpha: 1 }, ${n(tApp + 0.16)});`); golpea('#r-marca', tApp + 0.16, 1.15); suena('golpe', tApp + 0.16, { db: -3 });
  // los días: L, M, M se llenan y suben la cuenta; el jueves no se cumple; V, S, D siguen y la cuenta sigue subiendo
  p(`tl.set("#racha .cont, #racha .dias", { autoAlpha: 1 }, ${n(tDias)});`); p(`tl.set("#r-n0", { opacity: 1 }, ${n(tDias)});`);
  p(`tl.fromTo("#racha .d", { scale: 0 }, { scale: 1, duration: 0.14, ease: "back.out(3)", stagger: 0.03, immediateRender: false }, ${n(tDias)});`);
  const llena = (j, t, k) => { p(`tl.set("#r-d${j}", { backgroundColor: "${AMBAR}", color: "${TINTA}" }, ${n(t)});`); golpea(`#r-d${j}`, t, 1.3); p(`tl.set("#r-n${k - 1}", { opacity: 0 }, ${n(t)});`); p(`tl.set("#r-n${k}", { opacity: 1 }, ${n(t)});`); golpea(`#r-n${k}`, t, 1.08); suena('pop', t, { db: -4 }); };
  [0, 1, 2].forEach((j) => llena(j, tDias + 0.22 + j * 0.13, j + 1));
  p(`tl.to("#r-d3", { scale: 1.15, duration: 0.12, yoyo: true, repeat: 1 }, ${n(tMalo)});`); suena('caida', tMalo, { db: -6 });
  [4, 5, 6].forEach((j, q) => llena(j, tSigue + q * 0.17, j));
  golpea('#racha .cam', W(10, 44).i, 1.05); suena('golpe', W(10, 44).i, { db: -3 });
}

// --- 5. "conviertes el hábito en una versión más pequeña": la tarjeta se encoge ---
{
  const e = ESC.pequena, tV = W(11, 15).i, tP = W(11, 17).i;
  eCss.push(`        #pequena { background: ${TINTA}; }
        #pequena .hab { position: absolute; left: 70px; width: 940px; top: 690px; height: 250px; border-radius: 44px; background: ${CLARO}; border: 7px solid ${TINTA}; box-shadow: 12px 12px 0 ${AMBAR}; display: flex; align-items: center; gap: 36px; padding: 0 44px; }
        #pequena .ic { width: 150px; height: 150px; border-radius: 34px; background: ${AMBAR}; display: flex; align-items: center; justify-content: center; flex: none; }
        #pequena .ic svg { width: 96px; height: 96px; }
        #pequena .tx { position: relative; flex: 1; height: 100px; }
        #pequena .tx b { position: absolute; left: 0; top: 0; white-space: nowrap; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 84px; line-height: 100px; color: ${TINTA}; }
        #pequena .min { position: absolute; left: 0; right: 0; top: 1010px; display: flex; justify-content: center; }
        #pequena .min span { height: 110px; padding: 0 50px; border-radius: 55px; background: ${AMBAR}; color: ${TINTA}; display: flex; align-items: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; }`);
  eHtml.push(`        <div class="esc" id="pequena"><div class="cam"><div class="hab" id="pq-hab"><span class="ic">${svg('book-open', TINTA, 2)}</span><span class="tx"><b id="pq-a">Leer 10 páginas</b><b id="pq-b" style="opacity: 0">Leer 1 página</b></span></div><div class="min"><span id="pq-min">versión mínima</span></div></div></div>`);
  muestra('pequena', e);
  cae('#pq-hab', e.a, 1.5); suena('whoosh', e.a, { alGolpe: true }); suena('golpe', e.a + 0.14, { db: -3 });
  p(`tl.to("#pq-hab", { scale: 0.72, duration: 0.34, ease: "back.inOut(1.6)" }, ${n(tV)});`); suena('whoosh', tV + 0.15, { alGolpe: true, db: -3 });
  p(`tl.set("#pq-a", { opacity: 0 }, ${n(tV + 0.17)});`); p(`tl.set("#pq-b", { opacity: 1 }, ${n(tV + 0.17)});`);
  p(`tl.set("#pq-min", { autoAlpha: 0 }, ${n(e.a)});`); salta('#pq-min', tP - 0.1); suena('pop', tP - 0.1);
  golpea('#pequena .cam', tP, 1.05);
}

// --- 6. "lees una y eso cuenta": la app de verdad marcando la versión mínima (guion3/app/celular.mp4) ---
const LOGRO = 7.47, APP_DESDE = n(LOGRO - (W(12, 28).i - ESC.app.a));
suena('whoosh', ESC.app.a, { alGolpe: true, db: -2 }); suena('toque', ESC.app.a + (7.4 - APP_DESDE)); suena('logro', ESC.app.a + (LOGRO - APP_DESDE));

// --- 7. el final: las tomas del POV, una por golpe, con su nombre; después "escribe RACHA" ---
{
  eCss.push(`        #final .rt { position: absolute; left: 0; right: 0; top: 230px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 170px; line-height: 1; color: ${AMBAR}; text-shadow: 0 6px 30px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.9); opacity: 0; }
        #cierre { background: ${TINTA}; }
        #cierre .ic { position: absolute; left: 440px; top: 430px; width: 200px; height: 200px; border-radius: 46px; background: ${AMBAR}; padding: 34px; }
        #cierre .ic svg { width: 100%; height: 100%; }
        #cierre .es { position: absolute; left: 0; right: 0; top: 670px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 72px; color: ${CLARO}; }
        #cierre .rc { position: absolute; left: 0; right: 0; top: 770px; text-align: center; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 300px; line-height: 0.86; color: ${AMBAR}; }
        #cierre .mu { position: absolute; left: 0; right: 0; top: 1100px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 66px; color: ${CLARO}; }
        #cierre .pas { position: absolute; left: 0; right: 0; top: 1250px; display: flex; justify-content: center; }
        #cierre .pas span { height: 112px; padding: 0 44px; border-radius: 56px; background: ${CLARO}; color: ${TINTA}; display: flex; align-items: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; white-space: nowrap; }
        #cierre .pas b { font-weight: 600; color: ${CAFE}; margin: 0 0 0 12px; }`);
  eHtml.push(`        <div class="esc" id="final" style="background: transparent">${TOMAS.map((tm) => `<p class="rt" id="rt-${tm.id}">${tm.rotulo}</p>`).join('')}</div>
        <div class="esc" id="cierre"><div class="cam"><span class="ic" id="ci-ic">${llama(TINTA)}</span><p class="es" id="ci-es">escribe</p><p class="rc" id="ci-rc">RACHA</p><p class="mu" id="ci-mu">y te la muestro</p><div class="pas" id="ci-pas"><span>Racha · app · <b>$37.900</b>, un solo pago</span></div></div></div>`);
  p(`tl.set("#final", { autoAlpha: 1 }, ${n(M0)});`); p(`tl.set("#final", { autoAlpha: 0 }, ${n(CIERRE)});`);
  TOMAS.forEach((tm) => { p(`tl.fromTo("#rt-${tm.id}", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.14, ease: "power4.in", immediateRender: false }, ${n(tm.a)});`); p(`tl.set("#rt-${tm.id}", { opacity: 0 }, ${n(tm.b)});`); suena('diapositiva', tm.a, { db: -1 }); suena('golpe', tm.a + 0.02, { db: -6 }); });
  p(`tl.set("#cierre", { autoAlpha: 1 }, ${n(CIERRE)});`);
  p(`tl.fromTo("#cierre", { scale: 1 }, { scale: 1.05, duration: ${n(TOTAL - CIERRE)}, ease: "none", immediateRender: false }, ${n(CIERRE)});`);
  cae('#ci-ic', CIERRE, 1.8); salta('#ci-es', CIERRE + 0.12, 30); cae('#ci-rc', CIERRE + GOLPE * 0.5, 1.8); salta('#ci-mu', CIERRE + GOLPE, 30); salta('#ci-pas', CIERRE + GOLPE * 1.5);
  suena('boom', CIERRE); suena('golpe', CIERRE + GOLPE * 0.5 + 0.14); suena('pop', CIERRE + GOLPE * 1.5, { db: -2 });
}
// muestra() también se usa para la app (solo el fondo negro detrás, por si el video tarda un cuadro)
pieza('escenas', `        .esc { position: absolute; inset: 0; opacity: 0; visibility: hidden; overflow: hidden; }
        .cam { position: absolute; inset: 0; transform-origin: 540px 860px; }
${eCss.join('\n')}`, eHtml.join('\n'), eP);

// ===================== las letras (subtítulos pequeños de Lina y las palabras grandes) =====================
const GRANDES = [
  { de: W(1, 10), a: W(1, 15), arriba: 'no puedes fallar', grande: 'NI UN DÍA', en: W(1, 13) },
  { de: W(7, 10), a: W(7, 17), arriba: 'y yo decía:', grande: 'EL LUNES', en: W(7, 13), abajo: 'arranco otra vez', abajoEn: W(7, 15) },
  { de: W(9, 0), a: W(9, 4), arriba: 'el problema nunca fue', grande: 'FALLAR', en: W(9, 4) },
];
const enGrande = (w) => GRANDES.some((g) => w.i >= g.de.i - 1e-6 && w.f <= g.a.f + 1e-6);
const limpia = (t) => t.toLowerCase().replace(/[.,;:¡!¿?"]/g, '');
const ver = (t) => { const s = t.replace(/[¿?]/g, ''); return limpia(s) === '10' ? s.replace('10', 'diez') : s; };
const CLAVES = ['hábito', 'abandoné', 'nada', 'cero', 'siempre', 'malos', 'perdía', 'racha', 'pequeña', 'muestro', 'aplicaciones', 'fallaba'];
const CORTAS = new Set(['y', 'o', 'que', 'de', 'por', 'para', 'en', 'el', 'la', 'un', 'una', 'lo', 'a', 'con', 'no', 'se', 'es', 'ya', 'te', 'si', 'sin']);
const visibles = T.palabras.filter((w) => !enGrande(w) && !tapado(w.i));
const grupos = []; let g = [];
visibles.forEach((w, j) => {
  const sig = visibles[j + 1];
  g.push(w);
  const letras = g.map((x) => x.t).join(' ').length;
  const tope = /[.,;:!?]$/.test(w.t) || !sig || sig.h !== w.h || sig.i - w.f > 0.25;
  const lleno = g.length >= 3 || letras + (sig ? sig.t.length : 0) > 16;
  const sigueY = sig && limpia(sig.t) === 'y' && g.length >= 2;
  if (tope || sigueY || (lleno && !CORTAS.has(limpia(w.t))) || g.length >= 4) { grupos.push(g); g = []; }
});
const lP = [];
grupos.forEach((gr, i) => {
  const a = Math.max(0, gr[0].i - 0.04), sig = grupos[i + 1];
  let b = sig ? Math.max(a + 0.1, Math.min(sig[0].i - 0.04, gr[gr.length - 1].f + 0.5)) : gr[gr.length - 1].f + 0.3;
  const esc = Object.values(ESC).find((e) => e.a > a && e.a < b); if (esc) b = esc.a;   // se va en el corte a una escena
  const gra = GRANDES.find((x) => x.de.i > a && x.de.i < b); if (gra) b = gra.de.i - 0.04;
  lP.push(`tl.fromTo("#gr-${i}", { opacity: 0, scale: 0.9, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: 0.1, ease: "back.out(2.5)" }, ${n(a)});`, `tl.set("#gr-${i}", { opacity: 0 }, ${n(b)});`);
});
GRANDES.forEach((b, i) => {
  const a = b.de.i - 0.04, tg = b.en.i - 0.06, z = b.a.f + 0.15;
  lP.push(`tl.fromTo("#bg-${i}-a", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, ${n(a)});`,
    `tl.fromTo("#bg-${i}-g", { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.14, ease: "power4.in" }, ${n(tg)});`,
    b.abajo ? `tl.fromTo("#bg-${i}-b", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, ${n(b.abajoEn.i - 0.04)});` : '',
    `tl.set("#bg-${i} p", { opacity: 0 }, ${n(z)});`);
  suena('golpe', tg + 0.12, { db: 1 });
});
pieza('letras', `        .gr { position: absolute; left: 0; right: 0; top: 1200px; margin: 0; text-align: center; white-space: nowrap; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 66px; line-height: 1; color: #ffffff; text-shadow: ${SOMBRA}; opacity: 0; }
        .gr .k { color: ${AMBAR}; }
        .bg { position: absolute; left: 0; right: 0; top: 960px; display: flex; flex-direction: column; align-items: center; }
        .bg p { margin: 0; white-space: nowrap; text-align: center; text-shadow: ${SOMBRA}; opacity: 0; }
        .bg .ch { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 60px; line-height: 1.05; color: #ffffff; }
        .bg .gd { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 210px; line-height: 0.95; color: ${AMBAR}; }`,
[
  ...grupos.map((gr, i) => `        <p class="gr" id="gr-${i}">${gr.map((w) => (CLAVES.includes(limpia(w.t)) ? `<span class="k">${ver(w.t)}</span>` : ver(w.t))).join(' ')}</p>`),
  ...GRANDES.map((b, i) => `        <div class="bg" id="bg-${i}"><p class="ch" id="bg-${i}-a">${b.arriba}</p><p class="gd" id="bg-${i}-g">${b.grande}</p>${b.abajo ? `<p class="ch" id="bg-${i}-b">${b.abajo}</p>` : ''}</div>`),
].join('\n'), lP);

// ===================== la cámara sobre Lina y lo demás del archivo principal =====================
const mP = [];
const q = (...s) => mP.push(...s);
// El arranque del gancho (aprobado): la imagen entra torcida y se cuadra, como cuando alguien acomoda el celular
const mov = [[0, -9, 90, 130, 1.34], [0.11, 6, -60, -50, 1.26], [0.22, -3.5, 34, 40, 1.18], [0.33, 2, -16, -14, 1.1], [0.44, -0.8, 6, 6, 1.04], [0.55, 0, 0, 0, 1]];
q(`tl.set("#tr", { rotation: ${mov[0][1]}, x: ${mov[0][2]}, y: ${mov[0][3]}, scale: ${mov[0][4]} }, 0);`);
mov.slice(1).forEach(([t, rot, x, y, sc], i) => q(`tl.to("#tr", { rotation: ${rot}, x: ${x}, y: ${y}, scale: ${sc}, duration: ${n(t - mov[i][0])}, ease: "sine.inOut" }, ${mov[i][0]});`));
suena('manejo', 0, { desde: 0.18 });
// #lente: un movimiento por tramo (se acerca o se aleja despacio, con un poco de recorrido); cortes secos entre tramos
const LENTE = [
  [0.55, B0, { s: 1, x: 0, y: 0 }, { s: 1.08, x: 0, y: 30 }],
  [B0, ESC.tres.a, { s: 1.12, x: 0, y: 40 }, { s: 1.3, x: 0, y: 90 }],              // "Por creer eso, yo abandoné…": se mete a la cara
  [ESC.tres.b, corte(6), { s: 1.04, x: -40, y: 0 }, { s: 1.16, x: 40, y: 50 }],      // "Iba bien, fallaba una vez…": recorre
  [corte(6), ESC.cero.a, { s: 1.2, x: 0, y: 60 }, { s: 1.06, x: 0, y: 10 }],         // "Las aplicaciones…": se aleja
  [ESC.cero.b, corte(8), { s: 1.18, x: 30, y: 60 }, { s: 1.26, x: -20, y: 70 }],     // "el lunes arranco" (blanco y negro)
  [corte(8), ESC.estudio.a, { s: 1, x: 0, y: 0 }, { s: 1.16, x: 0, y: 60 }],         // "hasta que entendí algo…"
  [ESC.estudio.b, ESC.racha.a, { s: 1.14, x: -30, y: 50 }, { s: 1.02, x: 20, y: 10 }],
  [ESC.racha.b, ESC.pequena.a, { s: 1.08, x: 0, y: 20 }, { s: 1.2, x: 0, y: 60 }],
  [ESC.pequena.b, ESC.app.a, { s: 1.02, x: 0, y: 0 }, { s: 1.12, x: 0, y: 40 }],
  [ESC.app.b, M0, { s: 1, x: 0, y: 0 }, { s: 1.2, x: 0, y: 70 }],                     // "si quieres verla por dentro, te la muestro": se acerca
];
LENTE.forEach(([a, b, d, h]) => q(`tl.fromTo("#lente", { scale: ${d.s}, x: ${d.x}, y: ${d.y} }, { scale: ${h.s}, x: ${h.x}, y: ${h.y}, duration: ${n(b - a)}, ease: "sine.inOut", immediateRender: false }, ${n(cuadro(a))});`));
// #golpe: acercamiento seco y corto en las palabras clave
const GOLPES = [W(0, 6), W(2, 17), W(5, 2), W(5, 12), W(6, 1), W(8, 16), W(8, 18), W(9, 12), W(11, 9), W(12, 22), W(13, 16)];
GOLPES.forEach((w) => { q(`tl.fromTo("#golpe", { scale: 1.09 }, { scale: 1, duration: 0.35, ease: "expo.out", immediateRender: false }, ${n(w.i - 0.03)});`); suena('golpe', w.i - 0.02, { db: -7 }); });
// el destello con la entrada de la música
q(`tl.fromTo("#destello", { autoAlpha: 0.95 }, { autoAlpha: 0, duration: 0.22, ease: "power2.out", immediateRender: false }, ${n(cuadro(B0))});`); suena('obturador', B0, { alGolpe: true }); suena('boom', B0, { db: -4 });
q(`tl.fromTo("#destello", { autoAlpha: 0.9 }, { autoAlpha: 0, duration: 0.2, ease: "power2.out", immediateRender: false }, ${n(cuadro(corte(8)))});`); suena('obturador', corte(8), { alGolpe: true });
// transición de zoom a "Las aplicaciones" y el salto al blanco y negro de "el lunes"
{ const t = cuadro(corte(6)); q(`tl.fromTo("#tr", { scale: 1, filter: "blur(0px)" }, { scale: 1.5, filter: "blur(14px)", duration: 0.1, ease: "power2.in", immediateRender: false }, ${n(t - 0.1)});`, `tl.fromTo("#tr", { scale: 1.4, filter: "blur(14px)" }, { scale: 1, filter: "blur(0px)", duration: 0.22, ease: "power3.out", immediateRender: false }, ${n(t)});`, `tl.set("#tr", { filter: "none" }, ${n(t + 0.24)});`); suena('whoosh', t, { alGolpe: true, db: -1 }); }
{ const t = ESC.cero.b; [[0, -26, 1.07], [1, 20, 1.07], [2, -12, 1.05], [3, 6, 1.03], [4, 0, 1]].forEach(([c, x, sc]) => q(`tl.set("#tr", { x: ${x}, scale: ${sc} }, ${n(t + c / 30)});`)); suena('whoosh', t, { alGolpe: true, db: -2 });
  q(`tl.set("#persona", { filter: "grayscale(1) contrast(1.12)" }, ${n(t)});`); q(`tl.set("#persona", { filter: "none" }, ${n(cuadro(corte(8)))});`); }
// la app: entra de golpe y se acerca a la fila que se marca
q(`tl.fromTo("#app-caja", { scale: 1.18 }, { scale: 1.02, duration: 0.3, ease: "expo.out", immediateRender: false }, ${n(ESC.app.a)});`);
q(`tl.to("#app-caja", { scale: 1.1, duration: ${n(ESC.app.b - ESC.app.a - 0.3)}, ease: "sine.inOut" }, ${n(ESC.app.a + 0.3)});`);
q(`tl.fromTo("#app-caja", { x: 0 }, { x: -14, duration: 0.05, repeat: 3, yoyo: true, immediateRender: false }, ${n(ESC.app.a + (LOGRO - APP_DESDE))});`);
// las tomas del POV: cada una entra con un golpe de cámara; Tu año se acerca despacio
TOMAS.forEach((tm, i) => {
  q(`tl.fromTo("#pov-${i}", { scale: 1.22 }, { scale: 1.02, duration: 0.4, ease: "expo.out", immediateRender: false }, ${n(tm.a)});`);
  if (tm.golpes > 1) q(`tl.to("#pov-${i}", { scale: 1.12, duration: ${n(tm.b - tm.a - 0.4)}, ease: "sine.inOut" }, ${n(tm.a + 0.4)});`);
});

// ---------- la mezcla de los efectos ----------
{
  const SR = 48000, mezcla = new Float32Array(Math.ceil(TOTAL * SR) * 2);
  sonidos.forEach((ev) => {
    const b = fs.readFileSync(path.join(SON, ev.s + '.wav')), todo = b.subarray(b.indexOf('data') + 8), gan = 10 ** (ev.db / 20) / 32768, en = Math.round(ev.t * SR) * 2;
    const datos = todo.subarray(Math.round(ev.desde * SR) * 4, ev.dura ? Math.round((ev.desde + ev.dura) * SR) * 4 : undefined), largo = datos.length / 2;
    const entra = ev.desde ? 0.004 * SR * 2 : 0, sale = ev.dura ? 0.05 * SR * 2 : 0;
    for (let i = 0; i < largo && en + i < mezcla.length; i++) mezcla[en + i] += datos.readInt16LE(i * 2) * gan * (i < entra ? i / entra : 1) * (largo - i < sale ? (largo - i) / sale : 1);
  });
  const sal = Buffer.alloc(44 + mezcla.length * 2);
  sal.write('RIFF', 0); sal.writeUInt32LE(36 + mezcla.length * 2, 4); sal.write('WAVEfmt ', 8); sal.writeUInt32LE(16, 16); sal.writeUInt16LE(1, 20); sal.writeUInt16LE(2, 22);
  sal.writeUInt32LE(SR, 24); sal.writeUInt32LE(SR * 4, 28); sal.writeUInt16LE(4, 32); sal.writeUInt16LE(16, 34); sal.write('data', 36); sal.writeUInt32LE(mezcla.length * 2, 40);
  let tope = 0;
  mezcla.forEach((v, i) => { tope = Math.max(tope, Math.abs(v)); sal.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2); });
  fs.writeFileSync(path.join(A, 'efectos.wav'), sal);
  fs.writeFileSync(path.join(BASE, 'guion5-dinamico-sonidos.txt'), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(11)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
  console.log(`Efectos: ${sonidos.length} · pico ${(20 * Math.log10(tope)).toFixed(1)} dB`);
}
// ---------- la música: "Midnight Minor" desde su caída del bajo; baja debajo de Lina y sube en el final con la app ----------
{
  const dura = n(TOTAL - B0 + 0.05), sube = n(M0 - B0 - 0.15);
  ff(['-ss', String(MUSICA_DESDE), '-t', String(dura), '-i', path.join(C, 'pov1', 'musica', 'midnight-minor.wav'),
    '-af', `volume='if(lt(t,${sube}),0.09,0.36)':eval=frame,afade=t=out:st=${n(dura - 1.1)}:d=1.1,adelay=${Math.round(B0 * 1000)}|${Math.round(B0 * 1000)},apad=whole_dur=${TOTAL},alimiter=limit=0.89:level=disabled`,
    '-ar', '48000', '-ac', '2', path.join(A, 'musica.wav')]);
}
// los videos de la app
fs.copyFileSync(path.join(C, 'guion3', 'app', 'celular.mp4'), path.join(A, 'app-celular.mp4'));
TOMAS.forEach((tm) => fs.copyFileSync(path.join(C, 'pov3', 'cortes', tm.id + '.mp4'), path.join(A, `pov-${tm.id}.mp4`)));

fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · guion 5 · versión dinámica</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      video.clip { width: 100%; height: 100%; object-fit: cover; }
      #lente, #golpe, #tr { transform-origin: 540px 780px; overflow: visible; }
      #lente { z-index: 0; }
      #app-caja { z-index: 1; transform-origin: 50% 48.6%; background: ${TINTA}; }
      .pov { z-index: 1; transform-origin: 50% 50%; }
      #escenas { z-index: 2; }
      #letras { z-index: 3; }
      #destello { position: absolute; inset: 0; z-index: 4; background: #FFF6E0; opacity: 0; visibility: hidden; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
      <!-- Lina, con el filtro y sin silencios; la cámara se mueve en #lente y da golpes en #golpe -->
      <div id="lente" class="clip" data-layout-allow-overflow><div id="golpe" class="clip" data-layout-allow-overflow><div id="tr" class="clip" data-layout-allow-overflow><video id="persona" class="clip" src="assets/persona.mp4" playsinline muted data-start="0" data-duration="${n(Math.min(T.total, M0 + 0.1))}" data-media-start="0" data-track-index="0" data-layout-allow-overflow></video></div></div></div>

      <!-- La app de verdad: se marca "Leer 10 páginas" en su versión mínima -->
      <video id="app-caja" class="clip" src="assets/app-celular.mp4" playsinline muted data-start="${ESC.app.a}" data-duration="${n(ESC.app.b - ESC.app.a)}" data-media-start="${APP_DESDE}" data-track-index="1" data-layout-allow-overflow></video>

      <!-- El final: las tomas del POV 3, una ventana por golpe -->
${TOMAS.map((tm, i) => `      <video id="pov-${i}" class="clip pov" src="assets/pov-${tm.id}.mp4" playsinline muted data-start="${n(tm.a)}" data-duration="${n(tm.b - tm.a)}" data-media-start="${tm.desde}" data-track-index="1" data-layout-allow-overflow></video>`).join('\n')}

      <!-- Las escenas a pantalla completa (íconos, contador, estudio, Racha, el hábito pequeño, el cierre) -->
      <div id="escenas" class="clip" data-composition-id="escenas" data-composition-src="compositions/escenas.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-width="1080" data-height="1920"></div>

      <!-- Subtítulos y palabras grandes -->
      <div id="letras" class="clip" data-composition-id="letras" data-composition-src="compositions/letras.html" data-start="0" data-duration="${TOTAL}" data-track-index="3" data-width="1080" data-height="1920"></div>

      <div id="destello"></div>

      <audio id="voz" src="assets/voz.wav" data-start="0" data-duration="${n(T.total)}" data-media-start="0" data-track-index="4" data-volume="1"></audio>
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-track-index="5" data-volume="1"></audio>
      <audio id="musica" src="assets/musica.wav" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-track-index="6" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${mP.join('\n      ')}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`, 'utf8');

console.log(`Listo: dura ${TOTAL} s · música desde ${B0.toFixed(2)} s · final con la app desde ${M0.toFixed(2)} s · cierre en ${CIERRE.toFixed(2)} s`);
console.log('Escenas: ' + Object.entries(ESC).map(([k, e]) => `${k} ${e.a.toFixed(2)}–${e.b.toFixed(2)}`).join(' · '));
console.log('Tomas: ' + TOMAS.map((tm) => `${tm.id} ${tm.a.toFixed(2)}`).join(' · '));
