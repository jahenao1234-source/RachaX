// Campaña · Guion 1 "Empezar con todo" en estilo Tarjeta, con variedad de planos.
// Una sola grabación de Lina (plano medio, pared lisa) y la edición hace los planos:
// cuadro de color (recortada), pantalla completa, primer plano y pantalla partida con papel.
// Lee los clips de campana/guion1/clips (N-nombre.mp4, N-nombre.palabras.json y, si existe, N-nombre-recorte.webm).
// Si un clip todavía no existe, usa el 1-gancho como relleno y tiempos inventados, para poder revisar los planos.
// Uso: node design/herramientas/hf-campana-g1.mjs   (después: check, snapshot, preview y render con el CLI de HyperFrames)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const G = path.join(AQUI, '..', 'anuncios', 'campana', 'guion1');
const X = path.join(AQUI, '..', 'anuncios', 'xiomara', 'montaje');
const P = path.join(G, 'hyperframes');
const A = path.join(P, 'assets');
const C = path.join(P, 'compositions');
fs.mkdirSync(path.join(A, 'fuentes'), { recursive: true });
fs.mkdirSync(C, { recursive: true });
const FFDIR = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/';
const duracion = (f) => +execFileSync(FFDIR + 'ffprobe.exe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const FPS = 24, cuadro = (x) => Math.round(x * FPS) / FPS, n = (x) => (+x.toFixed(4)).toString();
const mill = (x) => Math.floor(x * 1e6 + 1e-4), seg = (m) => (m / 1e6).toString();
const AMBAR = '#f5a524', AZUL = '#2b4fd8', TINTA = '#16130f', PAPEL = '#ebe7dd', OSCURO = '#101114', ROJO = '#d5320f';

// ---------- El guion ----------
const CLIPS = [
  { id: '1-gancho', texto: 'No es que seas flojo, es que el lunes quisiste empezar con todo al mismo tiempo.' },
  { id: '2-cinco-cosas', texto: 'Ir al gimnasio, leer, madrugar, comer bien y estudiar inglés. La primera semana lo haces todo. La segunda ya te cuesta más.' },
  { id: '3-dia-pesado', texto: 'Y en la tercera tienes un día pesado, no haces nada, y ahí dejas las cinco cosas.' },
  { id: '4-no-era-disciplina', texto: 'No te faltó disciplina. Eran demasiadas cosas al mismo tiempo.' },
  { id: '5-una-sola', texto: 'Es mejor empezar con una sola, y hacerla después de algo que ya haces todos los días.' },
  { id: '6-ejemplo', texto: 'Por ejemplo: después del café, lees una página de tu libro preferido.' },
  { id: '7-racha', texto: 'Racha es una app que te ayuda a empezar así: con un solo hábito. Cuando ya lo haces sin esfuerzo, agregas otro.' },
  { id: '8-cierre', texto: 'Se paga una sola vez y tienes siete días para probarla. Escríbenos aquí abajo.' },
];
// Cada plano empieza al comienzo de su clip o en una palabra (expresión, cuál aparición).
const PLANOS = [
  { id: 'p1a', clip: '1-gancho', marco: 'cuadro', color: AMBAR, lienzo: PAPEL },
  { id: 'p1b', clip: '1-gancho', ancla: [/^que$/i, 0], marco: 'cuadro', color: AZUL, lienzo: OSCURO },
  { id: 'p1c', clip: '1-gancho', ancla: [/^flojo/i, 0], marco: 'completa' },
  { id: 'p2', clip: '1-gancho', ancla: [/^es$/i, 1], marco: 'cuadro', color: AMBAR, lienzo: PAPEL },
  { id: 'p3', clip: '2-cinco-cosas', marco: 'completa' },
  { id: 'p4', clip: '2-cinco-cosas', ancla: [/^La$/, 0], marco: 'cuadro', color: AZUL, lienzo: PAPEL },
  { id: 'p5', clip: '3-dia-pesado', marco: 'partida' },
  { id: 'p6', clip: '4-no-era-disciplina', marco: 'cerca' },
  { id: 'p7', clip: '5-una-sola', marco: 'cuadro', color: AMBAR, lienzo: OSCURO },
  { id: 'p8a', clip: '6-ejemplo', marco: 'cuadro', color: AMBAR, lienzo: PAPEL },
  { id: 'p8b', clip: '6-ejemplo', ancla: [/^lees/i, 0], marco: 'corte', corte: '9-leyendo' },
  { id: 'p9a', clip: '7-racha', marco: 'completa' },
  { id: 'p9b', clip: '7-racha', ancla: [/^Cuando/i, 0], marco: 'completa' },
  { id: 'p10', clip: '8-cierre', marco: 'cuadro', color: AMBAR, lienzo: PAPEL },
];
// Dónde queda Lina en cada plano. El video llena 1080 x 1920; se mueve con x, y y escala (origen arriba a la izquierda).
// En la grabación: el pelo empieza al 29 % del alto, la barbilla al 53 %, el micrófono al 61 %.
const MARCOS = {
  cuadro: { recorte: 'inset(757px 162px 0px 162px)', x: 10, y: 317, s: 1, sub: 772 },
  completa: { recorte: 'inset(0px 0px 0px 0px)', x: -122, y: -304, s: 1.25, sub: 1180 },
  cerca: { recorte: 'inset(0px 0px 0px 0px)', x: -308, y: -601, s: 1.6, sub: 1212 },
  partida: { recorte: 'inset(760px 0px 0px 0px)', x: -255, y: -25, s: 1.5, sub: 772 },
  corte: { recorte: 'inset(0px 0px 0px 0px)', x: -270, y: -36, s: 1.5, sub: 1268 },
};
const CIERRE = 2.4, PAUSA = 0.26, ANTES = 0.09, DESPUES = 0.13, GANANCIA = 8;

// ---------- Recursos ----------
const copiar = (de, a) => fs.copyFileSync(de, path.join(A, a));
const hay = (f) => fs.existsSync(f) && fs.statSync(f).size > 0;
const RELLENO = '1-gancho';
const faltan = [];
for (const c of CLIPS) {
  const mp4 = path.join(G, 'clips', c.id + '.mp4');
  c.real = hay(mp4);
  if (!c.real) faltan.push(c.id);
  c.video = (c.real ? c.id : RELLENO) + '.mp4';
  const web = path.join(G, 'clips', (c.real ? c.id : RELLENO) + '-recorte.webm');
  c.recorte = hay(web) ? (c.real ? c.id : RELLENO) + '-recorte.webm' : null;
  copiar(path.join(G, 'clips', c.video), c.video);
  if (c.recorte) copiar(web, c.recorte);
  c.dur = duracion(path.join(G, 'clips', c.video));
  const pj = path.join(G, 'clips', c.id + '.palabras.json');
  // La transcripción escribe los números con cifras; en los subtítulos van con letras.
  if (c.real && hay(pj)) c.palabras = JSON.parse(fs.readFileSync(pj, 'utf8')).palabras.map((w) => ({ ...w, t: w.t.replace(/^5(\W*)$/, 'cinco$1').replace(/^7(\W*)$/, 'siete$1') }));
  else {
    // Tiempos inventados para poder revisar los planos mientras llega el clip.
    const ws = c.texto.split(' '), paso = Math.min(0.36, (c.dur - 1.4) / ws.length);
    c.palabras = ws.map((t, k) => ({ t, i: 0.6 + k * paso, f: 0.6 + (k + 1) * paso - 0.04 }));
  }
}
const LEYENDO = hay(path.join(G, 'clips', '9-leyendo.mp4')) ? '9-leyendo.mp4' : null;
if (LEYENDO) copiar(path.join(G, 'clips', LEYENDO), LEYENDO); else faltan.push('9-leyendo');
// Capturas reales de la app (salen de capturas-campana-g1.cjs): la pantalla para el celular y dos recortes grandes.
const APP = path.join(G, 'app');
copiar(path.join(APP, 'n2-minimo.png'), 'app-pantalla.png');
const recortar = (salida, y, alto) => execFileSync(FFDIR + 'ffmpeg.exe', ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(APP, 'n3-completa.png'), '-vf', `crop=1170:${alto}:0:${y}`, path.join(A, salida)]);
recortar('app-despues.png', 384, 256);
recortar('app-hoy.png', 1395, 540);
copiar(path.join(X, 'tarjetas', 'cierre.png'), 'cierre.png');
copiar(path.join(X, 'sfx', 'whoosh.wav'), 'whoosh.wav');
copiar(path.join(X, 'sfx', 'golpe.wav'), 'golpe.wav');
copiar(path.join(X, 'sfx', 'ding.wav'), 'ding.wav');
copiar(path.join(RAIZ, 'public', 'fuentes', 'barlow-latin-700-normal.woff2'), 'fuentes/barlow-700.woff2');
copiar('C:/Windows/Fonts/consolab.ttf', 'fuentes/consolas-bold.ttf');
copiar('C:/Windows/Fonts/georgiaz.ttf', 'fuentes/georgia-bold-italic.ttf');

// Íconos de Lucide (los mismos de la app), sacados del paquete del proyecto.
const icono = (nombre, tam = 64, color = 'currentColor', grosor = 2) => {
  const js = fs.readFileSync(path.join(RAIZ, 'node_modules', 'lucide-react', 'dist', 'esm', 'icons', nombre + '.js'), 'utf8');
  const nodos = Function('return ' + js.slice(js.indexOf('['), js.indexOf('];') + 1))();
  const cuerpo = nodos.map(([tag, at]) => `<${tag} ${Object.entries(at).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')} />`).join('');
  return `<svg class="ico" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round">${cuerpo}</svg>`;
};

// ---------- Tramos: solo la voz, partidos también donde cambia el plano ----------
const piezas = [], palabras = [];
let T = 0;
for (const c of CLIPS) {
  const W = c.palabras, planos = PLANOS.filter((p) => p.clip === c.id);
  const inicioPlano = planos.map((p) => { if (!p.ancla) return 0; const k = W.map((w, i) => (p.ancla[0].test(w.t) ? i : -1)).filter((i) => i >= 0)[p.ancla[1]]; if (k === undefined) throw new Error(`No encontré ${p.ancla[0]} en ${c.id}`); return k; });
  const planoDe = (k) => planos[inicioPlano.reduce((a, ini, j) => (k >= ini ? j : a), 0)];
  const cortes = new Set([0]);
  W.forEach((w, k) => { if (k && w.i - W[k - 1].f > PAUSA) cortes.add(k); });
  inicioPlano.forEach((k) => cortes.add(k));
  const orden = [...cortes].sort((a, b) => a - b);
  orden.forEach((k0, q) => {
    const k1 = (orden[q + 1] ?? W.length) - 1, g = W.slice(k0, k1 + 1), sig = W[k1 + 1], ant = W[k0 - 1];
    const hayPausaAntes = !ant || g[0].i - ant.f > PAUSA, hayPausaDespues = !sig || sig.i - g[g.length - 1].f > PAUSA;
    let ini = hayPausaAntes ? Math.max(0, g[0].i - (k0 === 0 ? 0.3 : ANTES)) : g[0].i - 0.04;
    let fin = hayPausaDespues ? Math.min(c.dur - 0.02, g[g.length - 1].f + (sig ? DESPUES : 0.4)) : sig.i - 0.04;
    if (sig && hayPausaDespues) fin = Math.min(fin, sig.i - ANTES - 0.01);
    const d = cuadro(fin - ini), plano = planoDe(k0);
    piezas.push({ clip: c, ini, d, T0: T, plano });
    g.forEach((w) => palabras.push({ t: w.t, i: T + w.i - ini, f: T + w.f - ini, clip: c.id, plano }));
    T = cuadro(T + d);
  });
}
const FIN = T, TOTAL = cuadro(FIN + CIERRE);
PLANOS.forEach((p) => { const ps = piezas.filter((x) => x.plano === p); p.T0 = ps[0].T0; p.T1 = ps[ps.length - 1].T0 + ps[ps.length - 1].d; });
const cuando = (clip, re, k = 0) => { const p = palabras.filter((x) => x.clip === clip && re.test(x.t))[k]; if (!p) throw new Error(`No encontré ${re} en ${clip}`); return p.i; };
const plano = (id) => PLANOS.find((p) => p.id === id);

// ---------- Piezas aparte ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const FUENTES = `        @font-face { font-family: "Barlow"; font-weight: 700; src: url("assets/fuentes/barlow-700.woff2") format("woff2"); }
        @font-face { font-family: "Consolas"; font-weight: 700; src: url("assets/fuentes/consolas-bold.ttf") format("truetype"); }
        @font-face { font-family: "Georgia"; font-weight: 700; font-style: italic; src: url("assets/fuentes/georgia-bold-italic.ttf") format("truetype"); }`;
const COMUN = `        #root { position: absolute; inset: 0; overflow: hidden; }
        .eti { position: absolute; left: 62px; top: 292px; margin: 0; font-family: "Consolas", monospace; font-weight: 700; font-size: 25px; letter-spacing: 0.16em; color: #6f685c; }
        .tit { position: absolute; left: 58px; margin: 0; white-space: nowrap; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 98px; line-height: 1; letter-spacing: -0.035em; color: ${TINTA}; }
        .tit span { display: inline-block; opacity: 0; }
        .marca { background: ${AMBAR}; padding: 2px 16px 8px; transform-origin: 0 60%; }
        .ico { display: block; }`;
const pieza = (id, estilo, cuerpo, guion) => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>
${FUENTES}
${COMUN}
${estilo}
      </style>
      <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920">
${cuerpo}
      </div>
      <script>
        (() => {
          const tl = gsap.timeline({ paused: true });
          ${agrupar(guion).join('\n          ')}
          window.__timelines["${id}"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
const agrupar = (g) => { const r = []; for (let k = 0; k < g.length; k += 5) r.push(g.slice(k, k + 5).join(' ')); return r; };
const hosts = [];
const escena = (id, ini, fin, estilo, cuerpo, guion) => {
  fs.writeFileSync(path.join(C, id + '.html'), pieza(id, estilo, cuerpo, guion), 'utf8');
  hosts.push(`      <div id="${id}" class="clip grafico" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${seg(mill(ini))}" data-duration="${seg(mill(fin) - mill(ini))}" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="1920"></div>`);
};
const entra = (sel, t, extra = '') => `tl.fromTo("${sel}", { opacity: 0, y: 26, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.16, ease: "back.out(2.2)"${extra} }, ${n(Math.max(0, t))});`;
const cae = (sel, t, a) => `tl.fromTo("${sel}", { opacity: 0, x: ${a.x0}, y: ${a.y0}, rotation: ${a.r0}, scale: 0.6 }, { opacity: 1, x: 0, y: 0, rotation: ${a.r}, scale: 1, duration: 0.3, ease: "back.out(1.6)" }, ${n(Math.max(0, t))});`;
const SUELTO = 'data-layout-allow-overlap data-layout-allow-occlusion data-layout-allow-overflow';

// ---- Plano 1 · el gancho cambia de aspecto tres veces: "No es que seas flojo." ----
{
  const a = plano('p1a'), b = plano('p1b'), c = plano('p1c'), L = (t) => t - a.T0;
  const ws = ['No', 'es', 'que', 'seas', 'flojo.'];
  const tw = [cuando('1-gancho', /^No$/), cuando('1-gancho', /^es$/i), cuando('1-gancho', /^que$/i), cuando('1-gancho', /^seas/i), cuando('1-gancho', /^flojo/i)].map(L);
  const linea = (pre, cls) => `<p class="tit ${cls}" id="${pre}" ${SUELTO}>${ws.map((w, k) => `<span id="${pre}-${k}"${k === 4 ? ' class="clave"' : ''}>${w}</span>`).join(' ')}</p>`;
  const cuerpo = `        ${linea('ga', 'la')}
        ${linea('gb', 'lb')}
        ${linea('gc', 'lc')}`;
  const estilo = `        .tit { top: 380px; font-size: 112px; }
        .la .clave { background: ${AMBAR}; padding: 2px 16px 8px; }
        .lb { font-family: "Georgia", serif; font-style: italic; letter-spacing: -0.02em; color: #ffffff; opacity: 0; }
        .lb .clave { color: ${AMBAR}; }
        .lc { left: 0; right: 0; top: 262px; text-align: center; font-size: 104px; color: #ffffff; -webkit-text-stroke: 14px #000000; paint-order: stroke fill; opacity: 0; }
        .lc .clave { color: ${AMBAR}; }`;
  const g = [];
  // Las palabras ya dichas aparecen en los tres aspectos; cada aspecto solo se ve en su tramo.
  ['ga', 'gb', 'gc'].forEach((pre) => ws.forEach((_, k) => g.push(`tl.fromTo("#${pre}-${k}", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, ${n(Math.max(0, tw[k] - 0.04))});`)));
  g.push(`tl.set("#ga", { opacity: 0 }, ${n(L(b.T0))});`, `tl.set("#gb", { opacity: 1 }, ${n(L(b.T0))});`, `tl.set("#gb", { opacity: 0 }, ${n(L(c.T0))});`, `tl.set("#gc", { opacity: 1 }, ${n(L(c.T0))});`);
  g.push(`tl.fromTo("#gc", { scale: 1.25 }, { scale: 1, duration: 0.18, ease: "power3.out" }, ${n(L(c.T0))});`);
  escena('g1-gancho', a.T0, c.T1, estilo, cuerpo, g);
}

// ---- Plano 2 · el calendario y "Quisiste empezar con todo." ----
{
  const p = plano('p2'), L = (t) => t - p.T0;
  const tLu = L(cuando('1-gancho', /^lunes/i)), tQ = L(cuando('1-gancho', /^quisiste/i)), tE = L(cuando('1-gancho', /^empezar/i)), tC = L(cuando('1-gancho', /^con$/i)), tT = L(cuando('1-gancho', /^todo/i));
  const dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const cuerpo = `        <p class="eti" id="c-eti">EL LUNES</p>
        <p class="tit" style="top: 338px"><span id="c-1">Quisiste</span> <span id="c-2">empezar</span></p>
        <p class="tit" style="top: 448px"><span id="c-3" class="marca">con todo.</span></p>
        <div class="semana">
${dias.map((d, k) => `          <div class="dia" id="c-d${k}"><b id="c-f${k}"></b><span>${d}</span></div>`).join('\n')}
          <svg id="c-aro" viewBox="0 0 200 200" ${SUELTO}><path id="c-aro1" d="M100 14 C150 10 190 50 186 102 C182 154 142 190 96 186 C46 182 10 142 16 92 C22 46 62 14 112 20" /></svg>
        </div>`;
  const estilo = `        .semana { position: absolute; left: 60px; top: 596px; display: flex; gap: 18px; }
        .dia { position: relative; width: 122px; height: 122px; border: 4px solid ${TINTA}; border-radius: 22px; background: #f6f3ea; opacity: 0; }
        .dia b { position: absolute; inset: 0; border-radius: 18px; background: ${AMBAR}; opacity: 0; }
        .dia span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 60px; color: ${TINTA}; }
        #c-aro { position: absolute; left: -38px; top: -38px; width: 198px; height: 198px; overflow: visible; }
        #c-aro path { fill: none; stroke: ${ROJO}; stroke-width: 9; stroke-linecap: round; stroke-dasharray: 560; stroke-dashoffset: 560; }`;
  const g = [
    `tl.fromTo("#c-eti", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.18, ease: "power2.out" }, 0.02);`,
    ...dias.map((_, k) => `tl.fromTo("#c-d${k}", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.16, ease: "back.out(1.8)" }, ${n(0.04 + k * 0.03)});`),
    `tl.to("#c-aro1", { strokeDashoffset: 0, duration: 0.28, ease: "power2.inOut" }, ${n(Math.max(0.2, tLu - 0.05))});`,
    `tl.fromTo("#c-f0", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.16, ease: "back.out(2.5)" }, ${n(tLu + 0.15)});`,
    entra('#c-1', tQ - 0.05), entra('#c-2', tE - 0.05), entra('#c-3', tC - 0.05, ', rotation: -2'),
    ...[1, 2, 3, 4].map((k) => `tl.fromTo("#c-f${k}", { opacity: 0, scale: 0.4 }, { opacity: ${[0, 0.85, 0.7, 0.55, 0.4][k]}, scale: 1, duration: 0.12, ease: "back.out(2.5)" }, ${n(tT + (k - 1) * 0.07)});`),
  ];
  escena('g2-lunes', p.T0, p.T1, estilo, cuerpo, g);
}

// ---- Plano 3 · cinco tarjetas llegan volando y la rodean, una por palabra ----
{
  const p = plano('p3'), L = (t) => t - p.T0;
  const cartas = [
    { re: /^gimnasio/i, txt: 'Gimnasio', ico: 'dumbbell', cls: 'k1', left: 24, top: 300, r: -5, x0: -420, y0: -120, r0: -30 },
    { re: /^leer/i, txt: 'Leer', ico: 'book-open', cls: 'k2', left: 716, top: 330, r: 6, x0: 420, y0: -140, r0: 28 },
    { re: /^madrugar/i, txt: 'Madrugar', ico: 'alarm-clock', cls: 'k3', left: -8, top: 1010, r: 4, x0: -440, y0: 60, r0: 24 },
    { re: /^comer/i, txt: 'Comer bien', ico: 'apple', cls: 'k4', left: 748, top: 1040, r: -6, x0: 440, y0: 40, r0: -26 },
    { re: /^inglés/i, txt: 'Inglés', ico: 'languages', cls: 'k5', left: 370, top: 1330, r: -3, x0: 0, y0: 420, r0: 14 },
  ];
  const cuerpo = cartas.map((c, k) => `        <div class="carta ${c.cls}" id="k-${k}" style="left: ${c.left}px; top: ${c.top}px" ${SUELTO}>${icono(c.ico, 86)}<span ${SUELTO}>${esc(c.txt)}</span><i>0${k + 1} / 05</i></div>`).join('\n');
  const estilo = `        .carta { position: absolute; width: 340px; height: 236px; border-radius: 26px; border: 5px solid ${TINTA}; box-shadow: 10px 10px 0 ${TINTA}; padding: 22px 24px; display: flex; flex-direction: column; justify-content: space-between; opacity: 0; }
        .carta span { font-family: "Barlow", sans-serif; font-weight: 700; font-size: 62px; letter-spacing: -0.03em; line-height: 1; white-space: nowrap; }
        .carta i { position: absolute; right: 22px; top: 22px; font-family: "Consolas", monospace; font-style: normal; font-weight: 700; font-size: 21px; letter-spacing: 0.1em; opacity: 0.75; }
        .k1 { background: ${TINTA}; color: #ffffff; }
        .k2 { background: #f6f3ea; color: ${TINTA}; }
        .k2 span { font-family: "Georgia", serif; font-style: italic; letter-spacing: -0.02em; font-size: 70px; }
        .k3 { background: #1f3b8f; color: #ffffff; }
        .k4 { background: #1f7a4d; color: #ffffff; }
        .k5 { background: ${AMBAR}; color: ${TINTA}; }`;
  const g = cartas.map((c, k) => cae(`#k-${k}`, L(cuando('2-cinco-cosas', c.re)) - 0.08, c));
  // Al final salen todas hacia afuera, para darle paso al plano siguiente.
  cartas.forEach((c, k) => { if (L(cuando('2-cinco-cosas', c.re)) < p.T1 - p.T0 - 0.7) g.push(`tl.to("#k-${k}", { x: ${c.x0}, y: ${c.y0}, rotation: ${c.r0}, opacity: 0, duration: 0.22, ease: "power2.in" }, ${n(p.T1 - p.T0 - 0.24)});`); });
  escena('g3-cinco', p.T0, p.T1, estilo, cuerpo, g);
}

// ---- Plano 4 · ventana emergente con las semanas ----
{
  const p = plano('p4'), L = (t) => t - p.T0;
  const t1 = L(cuando('2-cinco-cosas', /^primera/i)), tTodo = L(cuando('2-cinco-cosas', /^todo/i)), t2 = L(cuando('2-cinco-cosas', /^segunda/i)), tCu = L(cuando('2-cinco-cosas', /^cuesta/i));
  const fila = (pre, tit, marcadas) => `          <div class="fila" id="${pre}"><b>${tit}</b><div class="cas">${[0, 1, 2, 3, 4].map((k) => `<u id="${pre}-${k}">${k < marcadas ? icono('check', 46, '#16130f', 3.4) : ''}</u>`).join('')}</div><em id="${pre}-n">${marcadas} de 5</em></div>`;
  const cuerpo = `        <div class="ventana" id="v-caja" ${SUELTO}>
          <div class="barra"><i></i><i></i><i></i><span>mi-semana</span></div>
${fila('v1', 'Semana 1', 5)}
${fila('v2', 'Semana 2', 3)}
        </div>`;
  const estilo = `        .ventana { position: absolute; left: 56px; top: 300px; width: 968px; border-radius: 22px; background: #14161d; box-shadow: 0 26px 0 rgba(0,0,0,0.16), 0 0 0 5px ${TINTA}; padding-bottom: 26px; transform-origin: 50% 100%; opacity: 0; }
        .barra { height: 62px; display: flex; align-items: center; gap: 10px; padding: 0 24px; border-bottom: 2px solid #2a2e3a; }
        .barra i { width: 16px; height: 16px; border-radius: 50%; background: #ef5b4d; }
        .barra i:nth-child(2) { background: #f0b541; }
        .barra i:nth-child(3) { background: #48c26b; }
        .barra span { margin-left: 14px; font-family: "Consolas", monospace; font-weight: 700; font-size: 24px; color: #8b93a7; }
        .fila { display: flex; align-items: center; gap: 22px; padding: 26px 30px 0; opacity: 0; }
        .fila b { width: 250px; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 54px; letter-spacing: -0.02em; color: #ffffff; }
        .cas { display: flex; gap: 12px; }
        .cas u { width: 76px; height: 76px; border-radius: 16px; border: 4px solid #4a5063; display: flex; align-items: center; justify-content: center; text-decoration: none; }
        .cas u .ico { opacity: 0; }
        .fila em { margin-left: auto; font-family: "Consolas", monospace; font-style: normal; font-weight: 700; font-size: 34px; color: ${AMBAR}; opacity: 0; }`;
  const g = [
    `tl.fromTo("#v-caja", { opacity: 0, scale: 0.7, y: 60 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "back.out(1.7)" }, 0.02);`,
    `tl.fromTo("#v1", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.14, ease: "power2.out" }, ${n(Math.max(0.12, t1 - 0.1))});`,
    ...[0, 1, 2, 3, 4].map((k) => `tl.to("#v1-${k}", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", duration: 0.06 }, ${n(tTodo - 0.25 + k * 0.08)});`),
    ...[0, 1, 2, 3, 4].map((k) => `tl.fromTo("#v1-${k} .ico", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.1, ease: "back.out(3)" }, ${n(tTodo - 0.25 + k * 0.08)});`),
    `tl.to("#v1-n", { opacity: 1, duration: 0.1 }, ${n(tTodo + 0.2)});`,
    `tl.fromTo("#v2", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.14, ease: "power2.out" }, ${n(t2 - 0.1)});`,
    ...[0, 1, 2].map((k) => `tl.to("#v2-${k}", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", duration: 0.06 }, ${n(t2 + 0.15 + k * 0.1)});`),
    ...[0, 1, 2].map((k) => `tl.fromTo("#v2-${k} .ico", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.1, ease: "back.out(3)" }, ${n(t2 + 0.15 + k * 0.1)});`),
    ...[3, 4].map((k) => `tl.fromTo("#v2-${k}", { x: 0 }, { x: 7, duration: 0.05, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${n(tCu)});`),
    `tl.to("#v2-n", { opacity: 1, duration: 0.1 }, ${n(tCu + 0.1)});`,
  ];
  escena('g4-semanas', p.T0, p.T1, estilo, cuerpo, g);
}

// ---- Planos 5 a 10 · versión sencilla por ahora (solo el titular), mientras se aprueban los primeros ----
const sencillo = (id, ids, lineas, opciones = {}) => {
  const a = plano(ids[0]), b = plano(ids[ids.length - 1]);
  const oscuro = opciones.oscuro, top = opciones.top ?? 338;
  const cuerpo = lineas.map((l, k) => `        <p class="tit" id="${id}-${k}" style="top: ${top + k * 108}px" ${SUELTO}><span id="${id}-s${k}"${l.marca ? ' class="marca"' : ''}>${esc(l.txt)}</span></p>`).join('\n');
  const estilo = oscuro ? `        .tit { color: #ffffff; }\n        .marca { color: ${TINTA}; }` : '';
  const g = lineas.map((l, k) => entra(`#${id}-s${k}`, l.t - a.T0 - 0.05, l.marca ? ', rotation: -2' : ''));
  escena(id, a.T0, opciones.fin ?? b.T1, estilo, cuerpo, g);
};
// Las cinco cosas en pequeño (se usan en los planos 5 y 7) y la llama de Racha (la misma forma del ícono de la app).
const COSAS = [['Gimnasio', 'dumbbell', 'k1'], ['Leer', 'book-open', 'k2'], ['Madrugar', 'alarm-clock', 'k3'], ['Comer bien', 'apple', 'k4'], ['Inglés', 'languages', 'k5']];
const MINI = `        .mini { position: absolute; width: 180px; height: 132px; border-radius: 18px; border: 4px solid ${TINTA}; box-shadow: 6px 6px 0 ${TINTA}; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; opacity: 0; }
        .mini span { font-family: "Barlow", sans-serif; font-weight: 700; font-size: 31px; letter-spacing: -0.02em; line-height: 1; white-space: nowrap; }
        .k1 { background: ${TINTA}; color: #ffffff; } .k2 { background: #f6f3ea; color: ${TINTA}; } .k3 { background: #1f3b8f; color: #ffffff; } .k4 { background: #1f7a4d; color: #ffffff; } .k5 { background: ${AMBAR}; color: ${TINTA}; }
        .equis { position: absolute; left: -10px; top: -10px; width: 200px; height: 152px; overflow: visible; }
        .equis path { fill: none; stroke: ${ROJO}; stroke-width: 14; stroke-linecap: round; stroke-dasharray: 240; stroke-dashoffset: 240; }`;
const mini = (pre, k, left, top, conX) => `        <div class="mini ${COSAS[k][2]}" id="${pre}-${k}" style="left: ${left}px; top: ${top}px" ${SUELTO}>${icono(COSAS[k][1], 44)}<span ${SUELTO}>${COSAS[k][0]}</span>${conX ? `<svg class="equis" viewBox="0 0 200 152"><path id="${pre}-x${k}a" d="M24 18 L176 134" /><path id="${pre}-x${k}b" d="M178 16 L22 136" /></svg>` : ''}</div>`;
const LLAMA = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';
const llama = (id, left, top, tam) => `        <svg class="llama" id="${id}" style="left: ${left}px; top: ${top}px" width="${tam}" height="${tam}" viewBox="0 0 24 24" ${SUELTO}><path id="${id}-p" d="${LLAMA}" fill="${AMBAR}" stroke="${TINTA}" stroke-width="1.3" stroke-linejoin="round" /></svg>`;
const ESTILO_LLAMA = `        .llama { position: absolute; overflow: visible; transform-origin: 50% 90%; opacity: 0; }`;

// ---- Plano 5 · papel rasgado: la semana 3, el día pesado y las cinco cosas tachadas ----
{
  const p = plano('p5'), L = (t) => t - p.T0, c3 = '3-dia-pesado';
  const tDia = L(cuando(c3, /^día/i)), tNo = L(cuando(c3, /^no$/i)), tDejas = L(cuando(c3, /^dejas/i)), tCosas = L(cuando(c3, /^cosas/i));
  let s = 7; const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const borde = []; for (let x = 100; x >= 0; x -= 2.5) borde.push(`${x}% ${(95.5 + azar() * 4.5).toFixed(2)}%`);
  const paso = (tCosas - tNo) / 5;
  const cuerpo = `        <div id="h-papel" ${SUELTO}>
          <i class="mancha m1"></i><i class="mancha m2"></i>
          <p class="eti" id="h-eti">SEMANA 3</p>
          <p class="serif" id="h-tit">Un día pesado.</p>
          <p class="cuenta" ${SUELTO}>${[5, 4, 3, 2, 1, 0].map((v) => `<b id="h-n${v}" ${SUELTO}>${v}</b>`).join('')}<span>de 5</span></p>
${COSAS.map((_, k) => mini('h', k, 44 + k * 198, 566, true)).join('\n')}
${llama('h-llama', 300, 452, 104)}
        </div>`;
  const estilo = `${MINI}
${ESTILO_LLAMA}
        #h-papel { position: absolute; left: 0; top: 0; width: 1080px; height: 800px; background: #f3efe1; clip-path: polygon(0% 0%, 100% 0%, ${borde.join(', ')}); }
        .mancha { position: absolute; border-radius: 50%; filter: blur(6px); }
        .m1 { right: -150px; top: 380px; width: 420px; height: 300px; background: ${AMBAR}; opacity: 0.35; border-radius: 46% 54% 60% 40% / 55% 45% 55% 45%; }
        .m2 { left: -140px; top: 240px; width: 420px; height: 300px; background: #e9dcc0; opacity: 0.9; border-radius: 58% 42% 45% 55% / 48% 60% 40% 52%; }
        .eti { opacity: 0; }
        .serif { position: absolute; left: 58px; top: 348px; margin: 0; white-space: nowrap; font-family: "Georgia", serif; font-weight: 700; font-style: italic; font-size: 112px; line-height: 1; color: ${TINTA}; opacity: 0; }
        .cuenta { position: absolute; left: 60px; top: 480px; margin: 0; height: 70px; font-family: "Consolas", monospace; font-weight: 700; color: ${ROJO}; }
        .cuenta b { position: absolute; left: 0; top: 0; font-size: 62px; line-height: 1; opacity: 0; }
        .cuenta span { position: absolute; left: 50px; top: 14px; font-size: 38px; white-space: nowrap; color: #6f685c; }`;
  const g = [
    `tl.fromTo("#h-papel", { y: -820 }, { y: 0, duration: 0.24, ease: "power3.out" }, 0);`,
    `tl.fromTo("#h-eti", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.16 }, 0.14);`,
    ...COSAS.map((_, k) => `tl.fromTo("#h-${k}", { opacity: 0, y: 40, rotation: ${[-4, 3, -2, 4, -3][k] * 3} }, { opacity: 1, y: 0, rotation: ${[-4, 3, -2, 4, -3][k]}, duration: 0.2, ease: "back.out(1.8)" }, ${n(0.16 + k * 0.05)});`),
    `tl.set("#h-n5", { opacity: 1 }, 0.2);`,
    `tl.fromTo("#h-llama", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, 0.3);`,
    `tl.fromTo("#h-tit", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.16, ease: "back.out(2)" }, ${n(tDia - 0.08)});`,
    `tl.to("#h-llama", { scale: 0.7, duration: 0.3, ease: "power2.out" }, ${n(tDia)});`,
  ];
  COSAS.forEach((_, k) => {
    const t = tNo + k * paso;
    g.push(`tl.to("#h-x${k}a", { strokeDashoffset: 0, duration: 0.09, ease: "power2.in" }, ${n(t)});`, `tl.to("#h-x${k}b", { strokeDashoffset: 0, duration: 0.09, ease: "power2.in" }, ${n(t + 0.09)});`);
    g.push(`tl.to("#h-${k}", { filter: "grayscale(1)", opacity: 0.55, duration: 0.12 }, ${n(t + 0.12)});`);
    g.push(`tl.set("#h-n${5 - k}", { opacity: 0 }, ${n(t + 0.1)});`, `tl.set("#h-n${4 - k}", { opacity: 1 }, ${n(t + 0.1)});`);
  });
  g.push(`tl.to("#h-llama-p", { fill: "#b9b3a6", duration: 0.25 }, ${n(tDejas)});`, `tl.to("#h-llama", { scale: 0.45, duration: 0.3, ease: "power2.in" }, ${n(tDejas)});`);
  escena('g5-dia-pesado', p.T0, p.T1, estilo, cuerpo, g);
}

// ---- Plano 6 · franja sobre el pecho: "¿Falta de disciplina?" se tacha y gira a "Demasiadas cosas al mismo tiempo." ----
{
  const p = plano('p6'), L = (t) => t - p.T0, c4 = '4-no-era-disciplina';
  const tDis = L(cuando(c4, /^disciplina/i)), tEran = L(cuando(c4, /^eran/i));
  const cuerpo = `        <div id="f-franja" ${SUELTO}>
          <div class="rueda"><div id="f-tira">
            <p class="linea" id="f-a" ${SUELTO}>¿Falta de disciplina?<i id="f-raya"></i></p>
            <p class="linea chica" id="f-b" ${SUELTO}>Demasiadas cosas <b>al mismo tiempo.</b></p>
          </div></div>
        </div>`;
  const estilo = `        #f-franja { position: absolute; left: 54px; top: 1030px; width: 972px; height: 150px; background: #f3efe1; border-left: 14px solid ${ROJO}; box-shadow: 0 14px 0 rgba(0, 0, 0, 0.28); transform-origin: 0 50%; opacity: 0; }
        .rueda { position: absolute; left: 30px; right: 20px; top: 20px; height: 110px; overflow: hidden; }
        .linea { position: relative; margin: 0; height: 110px; display: flex; align-items: center; white-space: nowrap; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 84px; letter-spacing: -0.035em; color: ${TINTA}; width: max-content; }
        .chica { font-size: 53px; }
        .chica b { margin-left: 14px; background: ${AMBAR}; padding: 0 10px 4px; }
        #f-raya { position: absolute; left: -6px; right: -6px; top: 52%; height: 12px; background: ${ROJO}; transform-origin: 0 50%; }`;
  const g = [
    `tl.fromTo("#f-franja", { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 0.2, ease: "power3.out" }, 0.04);`,
    `tl.fromTo("#f-raya", { scaleX: 0, rotation: -2 }, { scaleX: 1, rotation: -2, duration: 0.16, ease: "power3.out" }, ${n(tDis + 0.1)});`,
    `tl.fromTo("#f-tira", { y: 0 }, { y: -110, duration: 0.26, ease: "back.out(1.4)" }, ${n(tEran - 0.1)});`,
  ];
  escena('g6-disciplina', p.T0, p.T1, estilo, cuerpo, g);
}

// ---- Plano 7 · fondo oscuro: las cinco cosas se juntan en una sola ----
{
  const p = plano('p7'), L = (t) => t - p.T0, c5 = '5-una-sola';
  const tEmp = L(cuando(c5, /^empezar/i)), tUna = L(cuando(c5, /^una$/i)), tDes = L(cuando(c5, /^después/i)), tAlgo = L(cuando(c5, /^algo/i));
  const cuerpo = `${COSAS.map((_, k) => mini('j', k, 44 + k * 198, 300, false)).join('\n')}
        <p class="tit" style="top: 452px"><span id="jt-1">Empieza con</span></p>
        <p class="tit" style="top: 572px"><span id="jt-2" class="marca">una sola.</span></p>
        <p class="frase2" id="j-f" ${SUELTO}><span id="jt-3">Después de</span> <u id="j-h1"></u><span id="jt-4">, hago</span> <u id="j-h2"></u></p>
${llama("j-llama", 540, 560, 112)}`;
  const estilo = `${MINI}
${ESTILO_LLAMA}
        .tit { color: #ffffff; font-size: 96px; }
        .marca { color: ${TINTA}; }
        .frase2 { position: absolute; left: 60px; top: 690px; margin: 0; display: flex; align-items: flex-end; gap: 14px; white-space: nowrap; font-family: "Georgia", serif; font-style: italic; font-weight: 700; font-size: 50px; line-height: 1; color: #ffffff; }
        .frase2 span { opacity: 0; }
        .frase2 u { display: inline-block; width: 190px; height: 64px; border-bottom: 6px dashed ${AMBAR}; text-decoration: none; opacity: 0; }`;
  const g = [
    ...COSAS.map((_, k) => `tl.fromTo("#j-${k}", { opacity: 0, y: 40 }, { opacity: 1, y: 0, rotation: ${[-4, 3, -2, 4, -3][k]}, duration: 0.18, ease: "back.out(1.8)" }, ${n(0.04 + k * 0.05)});`),
    entra('#jt-1', tEmp - 0.05),
    // Se juntan hacia la de "Leer" y queda una sola, un poco más grande.
    ...[0, 2, 3, 4].map((k) => `tl.to("#j-${k}", { x: ${(1 - k) * 198}, opacity: 0, scale: 0.6, duration: 0.24, ease: "power3.in" }, ${n(tUna - 0.2)});`),
    `tl.to("#j-1", { x: -198, rotation: -3, scale: 1.12, duration: 0.28, ease: "back.out(1.6)" }, ${n(tUna - 0.05)});`,
    entra('#jt-2', tUna - 0.05, ', rotation: -2'),
    `tl.fromTo("#j-llama", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.26, ease: "back.out(2.4)" }, ${n(tUna + 0.2)});`,
    `tl.to("#jt-3", { opacity: 1, duration: 0.12 }, ${n(tDes - 0.05)});`, `tl.to("#j-h1", { opacity: 1, duration: 0.12 }, ${n(tDes + 0.2)});`,
    `tl.to("#jt-4", { opacity: 1, duration: 0.12 }, ${n(tAlgo - 0.05)});`, `tl.to("#j-h2", { opacity: 1, duration: 0.12 }, ${n(tAlgo + 0.25)});`,
  ];
  escena('g7-una-sola', p.T0, p.T1, estilo, cuerpo, g);
}
const VENTANA = `        .ventana { position: absolute; left: 56px; top: 300px; width: 968px; border-radius: 22px; background: #14161d; box-shadow: 0 22px 0 rgba(0,0,0,0.2), 0 0 0 5px ${TINTA}; padding-bottom: 30px; transform-origin: 50% 100%; opacity: 0; }
        .barra { height: 62px; display: flex; align-items: center; gap: 10px; padding: 0 24px; border-bottom: 2px solid #2a2e3a; }
        .barra i { width: 16px; height: 16px; border-radius: 50%; background: #ef5b4d; }
        .barra i:nth-child(2) { background: #f0b541; }
        .barra i:nth-child(3) { background: #48c26b; }
        .barra span { margin-left: 14px; font-family: "Consolas", monospace; font-weight: 700; font-size: 24px; color: #8b93a7; }`;

// ---- Plano 8 · una ventana donde la frase se escribe sola; en la segunda mitad se ve a Lina leyendo ----
{
  const a = plano('p8a'), b = plano('p8b'), L = (t) => t - a.T0, c6 = '6-ejemplo';
  const tDes = L(cuando(c6, /^después/i)), tCafe = L(cuando(c6, /^café/i)), tLees = L(cuando(c6, /^lees/i)), tPag = L(cuando(c6, /^página/i));
  const cuerpo = `        <div class="ventana" id="e-caja" ${SUELTO}>
          <div class="barra"><i></i><i></i><i></i><span>mi-habito</span></div>
          <div class="ren" id="e-r1">${icono('coffee', 66, AMBAR, 2.2)}<span class="tecleo" id="e-t1" ${SUELTO}>Después del café,</span></div>
          <div class="ren" id="e-r2">${icono('book-open', 66, AMBAR, 2.2)}<span class="tecleo" id="e-t2" ${SUELTO}>leo una página.</span></div>
        </div>`;
  const estilo = `${VENTANA}
        .ren { display: flex; align-items: center; gap: 24px; padding: 30px 34px 0; opacity: 0; }
        .tecleo { display: inline-block; white-space: nowrap; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 78px; letter-spacing: -0.03em; line-height: 1.1; color: #ffffff; }`;
  const g = [
    `tl.fromTo("#e-caja", { opacity: 0, scale: 0.7, y: 60 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "back.out(1.7)" }, 0.02);`,
    `tl.to("#e-r1", { opacity: 1, duration: 0.08 }, ${n(Math.max(0.15, tDes - 0.1))});`,
    `tl.fromTo("#e-t1", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ${n(Math.max(0.4, tCafe + 0.25 - tDes))}, ease: "steps(17)" }, ${n(Math.max(0.15, tDes - 0.05))});`,
    `tl.to("#e-r2", { opacity: 1, duration: 0.08 }, ${n(tLees - 0.1)});`,
    `tl.fromTo("#e-t2", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ${n(Math.max(0.4, tPag + 0.3 - tLees))}, ease: "steps(15)" }, ${n(tLees - 0.05)});`,
  ];
  escena('g8-ejemplo', a.T0, b.T1, estilo, cuerpo, g);
}

// ---- Plano 9 · Racha: un celular con la app real al lado de Lina; después la app llena la pantalla ----
{
  const a = plano('p9a'), b = plano('p9b'), L = (t) => t - a.T0, c7 = '7-racha';
  const tRacha = L(cuando(c7, /^Racha/i)), tApp = L(cuando(c7, /^app/i)), tSolo = L(cuando(c7, /^solo$/i)), tB = L(b.T0), tAgregas = L(cuando(c7, /^agregas/i)), tOtro = L(cuando(c7, /^otro/i));
  const cuerpo = `        <div id="r-velo"></div>
        <div id="r-chip" ${SUELTO}><b class="logo">${icono('flame', 54, TINTA, 2.4)}</b><span>Racha</span><i>ES UNA APP</i></div>
        <div id="r-cel" ${SUELTO}><img id="r-cel-img" src="assets/app-pantalla.png" alt="" /></div>
        <div class="rec" id="r-a" ${SUELTO}><img src="assets/app-despues.png" alt="" /><svg viewBox="0 0 960 210" preserveAspectRatio="none"><path id="r-aro" d="M70 70 C300 44 700 42 900 64 C950 84 948 160 898 178 C640 200 300 200 64 180 C18 164 22 88 80 68" /></svg></div>
        <div class="rec" id="r-b" ${SUELTO}><img src="assets/app-hoy.png" alt="" /><svg viewBox="0 0 960 443" preserveAspectRatio="none"><path id="r-raya" d="M60 286 C300 300 660 296 904 284" /></svg></div>`;
  const estilo = `        #r-velo { position: absolute; inset: 0; background: #0c0d10; opacity: 0; }
        #r-chip { position: absolute; left: 56px; top: 292px; display: flex; align-items: center; gap: 18px; padding: 12px 26px 12px 12px; background: #f6f3ea; border: 5px solid ${TINTA}; border-radius: 26px; box-shadow: 8px 8px 0 ${TINTA}; opacity: 0; }
        #r-chip .logo { width: 84px; height: 84px; border-radius: 20px; background: ${AMBAR}; display: flex; align-items: center; justify-content: center; }
        #r-chip span { font-family: "Barlow", sans-serif; font-weight: 700; font-size: 70px; letter-spacing: -0.03em; line-height: 1; color: ${TINTA}; }
        #r-chip i { font-family: "Consolas", monospace; font-style: normal; font-weight: 700; font-size: 26px; letter-spacing: 0.14em; color: #6f685c; }
        #r-cel { position: absolute; left: 700px; top: 470px; width: 366px; height: 650px; border: 12px solid ${TINTA}; border-radius: 46px; overflow: hidden; background: #0c0d10; box-shadow: 14px 14px 0 rgba(0, 0, 0, 0.35); transform-origin: 50% 60%; opacity: 0; }
        #r-cel img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0; }
        .rec { position: absolute; left: 60px; width: 960px; border-radius: 26px; overflow: hidden; box-shadow: 0 0 0 4px #2a2e3a; opacity: 0; }
        .rec img { display: block; width: 100%; }
        .rec svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .rec path { fill: none; stroke: ${AMBAR}; stroke-width: 9; stroke-linecap: round; stroke-dasharray: 2400; stroke-dashoffset: 2400; }
        #r-a { top: 426px; }
        #r-b { top: 664px; }`;
  const g = [
    `tl.fromTo("#r-chip", { opacity: 0, x: -60, rotation: -6 }, { opacity: 1, x: 0, rotation: -2, duration: 0.22, ease: "back.out(1.8)" }, ${n(Math.max(0.02, tRacha - 0.08))});`,
    `tl.fromTo("#r-cel", { opacity: 0, x: 260, rotation: 22, scale: 0.6 }, { opacity: 1, x: 0, rotation: 5, scale: 1, duration: 0.3, ease: "back.out(1.5)" }, ${n(tApp - 0.12)});`,
    `tl.to("#r-cel", { scale: 1.07, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, ${n(tSolo)});`,
    // La app pasa a llenar la pantalla, en dos recortes grandes para que se alcance a leer.
    `tl.to("#r-velo", { opacity: 1, duration: 0.2 }, ${n(tB - 0.12)});`,
    `tl.to("#r-cel", { x: -330, y: -60, rotation: 0, scale: 2.1, opacity: 0, duration: 0.26, ease: "power3.in" }, ${n(tB - 0.14)});`,
    `tl.to("#r-chip", { backgroundColor: "#f6f3ea", duration: 0.01 }, ${n(tB)});`,
    `tl.fromTo("#r-a", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" }, ${n(tB + 0.06)});`,
    `tl.to("#r-aro", { strokeDashoffset: 0, duration: 0.4, ease: "power2.inOut" }, ${n(tB + 0.4)});`,
    `tl.fromTo("#r-b", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" }, ${n(Math.max(tB + 0.5, tAgregas - 0.5))});`,
    `tl.to("#r-raya", { strokeDashoffset: 0, duration: 0.3, ease: "power2.inOut" }, ${n(Math.max(tB + 0.9, tOtro - 0.1))});`,
  ];
  escena('g9-racha', a.T0, b.T1, estilo, cuerpo, g);
}

// ---- Plano 10 · el cierre: el precio, las etiquetas y la flecha hacia abajo ----
{
  const p = plano('p10'), L = (t) => t - p.T0, c8 = '8-cierre';
  const tPaga = L(cuando(c8, /^paga/i)), tVez = L(cuando(c8, /^vez/i)), tSiete = L(cuando(c8, /^siete/i)), tEsc = L(cuando(c8, /^escríbenos/i));
  const cuerpo = `        <div id="z-chip" ${SUELTO}><b class="logo">${icono('flame', 48, TINTA, 2.4)}</b><span>Racha</span></div>
        <p id="z-precio" ${SUELTO}>$37.900</p>
        <p class="chapa" id="z-c1" ${SUELTO}>un solo pago</p>
        <p class="chapa" id="z-c2" ${SUELTO}>7 días para probarla</p>
        <p id="z-cta" ${SUELTO}><span>Escríbenos aquí abajo</span>${icono('arrow-down', 54, TINTA, 3)}</p>
${llama('z-llama', 880, 300, 110)}`;
  const estilo = `${ESTILO_LLAMA}
        #z-chip { position: absolute; left: 58px; top: 292px; display: flex; align-items: center; gap: 14px; opacity: 0; }
        #z-chip .logo { width: 72px; height: 72px; border-radius: 18px; background: ${AMBAR}; border: 4px solid ${TINTA}; display: flex; align-items: center; justify-content: center; }
        #z-chip span { font-family: "Barlow", sans-serif; font-weight: 700; font-size: 66px; letter-spacing: -0.03em; line-height: 1; color: ${TINTA}; }
        #z-precio { position: absolute; left: 56px; top: 388px; margin: 0; padding: 0 30px 12px; background: ${AMBAR}; border: 6px solid ${TINTA}; box-shadow: 12px 12px 0 ${TINTA}; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 168px; letter-spacing: -0.04em; line-height: 1; color: ${TINTA}; white-space: nowrap; transform-origin: 0 100%; opacity: 0; }
        .chapa { position: absolute; top: 606px; margin: 0; padding: 8px 22px 12px; background: ${TINTA}; color: #ffffff; border-radius: 14px; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 46px; letter-spacing: -0.02em; line-height: 1; white-space: nowrap; opacity: 0; }
        #z-c1 { left: 58px; }
        #z-c2 { left: 368px; }
        #z-cta { position: absolute; left: 58px; top: 684px; margin: 0; display: flex; align-items: center; gap: 12px; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 52px; letter-spacing: -0.02em; line-height: 1; color: ${TINTA}; white-space: nowrap; opacity: 0; }`;
  const g = [
    `tl.fromTo("#z-chip", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.18, ease: "power2.out" }, 0.04);`,
    `tl.fromTo("#z-llama", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.26, ease: "back.out(2.4)" }, 0.12);`,
    `tl.fromTo("#z-precio", { opacity: 0, scale: 1.9, rotation: -12 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.2, ease: "power4.in" }, ${n(Math.max(0.1, tPaga - 0.15))});`,
    `tl.fromTo("#z-c1", { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, rotation: -2, duration: 0.16, ease: "back.out(2.2)" }, ${n(tVez - 0.3)});`,
    `tl.fromTo("#z-c2", { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, rotation: 2, duration: 0.16, ease: "back.out(2.2)" }, ${n(tSiete - 0.05)});`,
    `tl.fromTo("#z-cta", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, ${n(tEsc - 0.05)});`,
    `tl.fromTo("#z-cta .ico", { y: 0 }, { y: 14, duration: 0.22, yoyo: true, repeat: 5, ease: "sine.inOut" }, ${n(tEsc + 0.15)});`,
  ];
  escena('g10-precio', p.T0, p.T1, estilo, cuerpo, g);
  // La tarjeta final a pantalla completa.
  escena('g11-cierre', FIN, TOTAL, `        #y-img { position: absolute; inset: 0; width: 100%; height: 100%; background: #0c0d10; }`, `        <img id="y-img" src="assets/cierre.png" alt="" data-layout-allow-overflow />`, [`tl.fromTo("#y-img", { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }, 0);`]);
}

// ---- Subtítulos: pequeños, de apoyo; cambian de altura según el plano ----
{
  const FLOJAS = new Set(['a', 'al', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'de', 'del', 'por', 'para', 'con', 'en', 'que', 'se', 'te', 'lo', 'es', 'ya', 'no', 'tu']);
  const puntua = (p) => /[.,?!…:]$/.test(p.t);
  const floja = (p) => FLOJAS.has(p.t.toLowerCase()) && !puntua(p);
  const frases = []; let act = [];
  const cerrar = (forzar = true) => { const resto = []; while (act.length > 1 && floja(act[act.length - 1])) resto.unshift(act.pop()); if (!forzar && act.every(floja)) { act.push(...resto); return; } if (act.length) frases.push(act); act = resto; };
  for (const p of palabras) {
    const largo = act.map((x) => x.t).join(' ').length;
    const cambia = act.length && (p.plano !== act[0].plano || p.i - act[act.length - 1].f > 0.45);
    if (act.length && (cambia || act.length >= 3 || largo + 1 + p.t.length > 17)) cerrar(cambia);
    act.push(p); if (puntua(p)) cerrar();
  }
  cerrar();
  let w = 0; const g = [];
  const cuerpo = frases.map((fr, q) => {
    const sig = frases[q + 1];
    const ini = Math.max(0, fr[0].i - 0.03), fin = Math.min(fr[fr.length - 1].f + 0.2, sig ? sig[0].i - 0.03 : FIN);
    g.push(`tl.set("#frase-${q}", { opacity: 1 }, ${n(ini)});`, `tl.fromTo("#frase-${q}", { scale: 0.9 }, { scale: 1, duration: 0.08, ease: "back.out(2)" }, ${n(ini)});`, `tl.set("#frase-${q}", { opacity: 0 }, ${n(fin)});`);
    const spans = fr.map((p, k) => { const id = `w${w++}`; g.push(`tl.set("#${id}", { color: "${AMBAR}" }, ${n(k ? p.i : ini)});`); if (k < fr.length - 1) g.push(`tl.set("#${id}", { color: "#ffffff" }, ${n(fr[k + 1].i)});`); return `<span id="${id}">${esc(p.t)}</span>`; }).join(' ');
    return `        <p id="frase-${q}" class="frase" style="top: ${MARCOS[fr[0].plano.marco].sub}px" ${SUELTO}>${spans}</p>`;
  }).join('\n');
  const estilo = `        .frase { position: absolute; left: 40px; right: 40px; margin: 0; opacity: 0; white-space: nowrap; text-align: center; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 66px; line-height: 1; letter-spacing: -0.01em; color: #ffffff; -webkit-text-stroke: 12px #000000; paint-order: stroke fill; }`;
  fs.writeFileSync(path.join(C, 'subtitulos.html'), pieza('subtitulos', estilo, cuerpo, g), 'utf8');
}

// ---------- index.html ----------
const tomas = piezas.map((z, k) => {
  const fin = piezas[k + 1] ? piezas[k + 1].T0 : FIN;
  // Una millonésima menos, para que la suma no se pase del comienzo del tramo siguiente.
  const tiempo = `data-start="${seg(mill(z.T0))}" data-duration="${seg(mill(fin) - mill(z.T0) - 1)}"`;
  const m = z.plano.marco;
  let src = z.clip.video, mini = z.ini;
  if (m === 'corte') { src = LEYENDO || z.clip.video; mini = LEYENDO ? 1 + (z.T0 - z.plano.T0) : z.ini; }
  else if (m === 'cuadro' && z.clip.recorte) src = z.clip.recorte;
  return {
    v: `          <video id="toma-${k}" class="clip toma" src="assets/${src}" playsinline muted ${tiempo} data-media-start="${n(mini)}" data-track-index="0"></video>`,
    a: `      <audio id="voz-${k}" src="assets/${z.clip.video}" ${tiempo} data-media-start="${n(z.ini)}" data-track-index="4" data-audio-group="voz"></audio>`,
  };
});
// El cuadro de Lina: crece, se encoge, se acerca y cambia de color con el plano.
const mov = [];
PLANOS.forEach((p, k) => {
  const m = MARCOS[p.marco], rapido = /^p1/.test(p.id), d = rapido ? 0.16 : 0.3, t = Math.max(0, p.T0 - (rapido ? 0.04 : 0.1));
  if (k === 0) return;
  mov.push(`tl.to("#escenario", { clipPath: "${m.recorte}", duration: ${d}, ease: "power3.inOut" }, ${n(t)});`);
  mov.push(`tl.to("#zoom", { x: ${m.x}, y: ${m.y}, scale: ${m.s}, duration: ${d}, ease: "power3.inOut" }, ${n(t)});`);
  if (p.color) mov.push(`tl.to("#escenario", { backgroundColor: "${p.color}", duration: 0.12 }, ${n(t)});`);
  if (p.lienzo) mov.push(`tl.to("#lienzo", { backgroundColor: "${p.lienzo}", duration: 0.16 }, ${n(t)});`);
});
const m0 = MARCOS[PLANOS[0].marco];
const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · guion 1</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: ${PAPEL}; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${PAPEL}; }
      .clip { position: absolute; inset: 0; }
      /* El fondo: color papel u oscuro, con rayas muy suaves. */
      #lienzo { position: absolute; inset: 0; background-color: ${PLANOS[0].lienzo}; z-index: 0; }
      #rayas { position: absolute; inset: 0; z-index: 1; background: repeating-linear-gradient(90deg, transparent 0 178px, rgba(128, 128, 128, 0.09) 178px 180px); }
      /* Lina. El escenario recorta (cuadro o pantalla completa) y el zoom la mueve y la acerca. */
      #escenario { position: absolute; inset: 0; z-index: 2; overflow: hidden; background-color: ${PLANOS[0].color}; clip-path: ${m0.recorte}; }
      #zoom { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
      .toma { width: 100%; height: 100%; object-fit: cover; }
      .grafico { z-index: 3; }
      #subtitulos { z-index: 4; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${seg(mill(TOTAL))}" data-width="1080" data-height="1920">
      <hf-audio-group id="voz" data-label="Voz de Lina" data-fx-chain='{"version":1,"nodes":[{"type":"gain","id":"v1","params":{"gain":${GANANCIA}}},{"type":"limiter","id":"v2","params":{"limit":-1.5}}]}'></hf-audio-group>
      <div id="lienzo"></div>
      <div id="rayas"></div>

      <!-- Lina: una sola grabación; los planos los hace el escenario -->
      <div id="escenario">
        <div id="zoom">
${tomas.map((x) => x.v).join('\n')}
        </div>
      </div>
${tomas.map((x) => x.a).join('\n')}

      <!-- Los gráficos de cada plano -->
${hosts.join('\n')}

      <!-- Sonidos (fabricados, bajitos): un soplo en cada cambio de plano y un golpe cuando cae el precio -->
${PLANOS.filter((p) => !/^p1[abc]$/.test(p.id)).map((p, k) => `      <audio id="sfx-${p.id}" src="assets/whoosh.wav" data-start="${n(Math.max(0, p.T0 - 0.1))}" data-duration="0.4" data-track-index="${5 + (k % 2)}" data-volume="0.16"></audio>`).join('\n')}
      <audio id="sfx-precio" src="assets/golpe.wav" data-start="${n(Math.max(plano('p10').T0 + 0.1, cuando('8-cierre', /^paga/i) - 0.15) + 0.18)}" data-duration="0.4" data-track-index="7" data-volume="0.3"></audio>

      <!-- Subtítulos -->
      <div id="subtitulos" class="clip" data-composition-id="subtitulos" data-composition-src="compositions/subtitulos.html" data-start="0" data-duration="${seg(mill(FIN))}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920"></div>
    </div>
    <script>
      gsap.set("#zoom", { x: ${m0.x}, y: ${m0.y}, scale: ${m0.s} });
      const tl = gsap.timeline({ paused: true });
      ${mov.join('\n      ')}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(P, 'index.html'), html, 'utf8');
for (const f of ['hyperframes.json', 'package.json', 'meta.json']) {
  const de = path.join(AQUI, '..', 'anuncios', 'lina', 'hyperframes', 'lina-estilo', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('lina-estilo').join('campana-guion1'), 'utf8');
}
console.log(`Listo: dura ${TOTAL.toFixed(2)} s (voz ${FIN.toFixed(2)} s), ${piezas.length} tramos`);
console.log('Planos: ' + PLANOS.map((p) => `${p.id} ${p.T0.toFixed(2)}`).join(' | '));
console.log(faltan.length ? 'De relleno (faltan los clips): ' + faltan.join(', ') : 'Todos los clips son los reales');
