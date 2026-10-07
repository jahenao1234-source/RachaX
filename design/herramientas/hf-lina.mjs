// Genera el proyecto de HyperFrames del anuncio de Lina (guion 4): copia los recursos y escribe
// index.html (las tomas y los sonidos) y compositions/ (la app, el cierre y los subtítulos).
// Misma edición que montar-lina.mjs (ffmpeg), pero como composición de HyperFrames:
// los clips cortados sin silencios, la app a pantalla completa, subtítulos palabra por palabra, sonidos y cierre.
// Antes: transcribir-assembly.mjs sobre los clips y montar-lina.mjs una vez (deja las tarjetas en lina/montaje).
// Uso: node design/herramientas/hf-lina.mjs      (después: lint, check, preview y render con el CLI de HyperFrames)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const L = path.join(AQUI, '..', 'anuncios', 'lina');
const X = path.join(AQUI, '..', 'anuncios', 'xiomara', 'montaje');
const P = path.join(L, 'hyperframes', 'lina-guion4');
const A = path.join(P, 'assets');
const C = path.join(P, 'compositions');
fs.mkdirSync(path.join(A, 'fuentes'), { recursive: true });
fs.mkdirSync(C, { recursive: true });
const FFDIR = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/';
const duracion = (f) => +execFileSync(FFDIR + 'ffprobe.exe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const FPS = 24, cuadro = (x) => Math.round(x * FPS) / FPS, n = (x) => (+x.toFixed(4)).toString();
// Los cortes van en millonésimas enteras: así un tramo termina justo donde empieza el otro (ni se pisan ni queda un cuadro en negro).
const mill = (x) => Math.floor(x * 1e6 + 1e-4), seg = (m) => (m / 1e6).toString();

// ---------- Recursos ----------
const copiar = (de, a) => fs.copyFileSync(de, path.join(A, a));
const CLIPS = [
  { id: '1-gancho', pre: 0.55, post: 0.30 },
  { id: '2-mito', pre: 0.15, post: 0.25 },
  { id: '3-solucion', pre: 0.45, post: 0.25 },
  { id: '4-cierre', pre: 0.15, post: 0.60 },
];
for (const c of CLIPS) copiar(path.join(L, 'clips', c.id + '.mp4'), c.id + '.mp4');
copiar(path.join(L, 'montaje', 't-despues.png'), 'app-despues.png');
copiar(path.join(L, 'montaje', 't-minimo-y-hoy.png'), 'app-minimo-y-hoy.png');
copiar(path.join(X, 'tarjetas', 'cierre.png'), 'cierre.png');
copiar(path.join(X, 'sfx', 'whoosh.wav'), 'whoosh.wav');
copiar(path.join(X, 'sfx', 'ding.wav'), 'ding.wav');
copiar(path.join(RAIZ, 'public', 'fuentes', 'barlow-condensed-latin-700-normal.woff2'), 'fuentes/barlow-condensed-700.woff2');

// ---------- Tramos con voz (igual que en montar-lina.mjs), alineados a cuadros ----------
const PAUSA = 0.32, ANTES = 0.12, DESPUES = 0.18, CIERRE = 2.6;
const GANANCIA = 7; // dB: los clips de Flow vienen a unos -23 LUFS y un anuncio va cerca de -16
const tramos = [];
let T = 0;
for (const c of CLIPS) {
  const dur = duracion(path.join(L, 'clips', c.id + '.mp4'));
  const pal = JSON.parse(fs.readFileSync(path.join(L, 'clips', c.id + '.palabras.json'), 'utf8')).palabras;
  const grupos = [[]];
  pal.forEach((p, k) => { if (k && p.i - pal[k - 1].f > PAUSA) grupos.push([]); grupos[grupos.length - 1].push(p); });
  grupos.forEach((g, k) => {
    let ini = Math.max(0, g[0].i - (k === 0 ? c.pre : ANTES));
    let fin = Math.min(dur - 0.02, g[g.length - 1].f + (k === grupos.length - 1 ? c.post : DESPUES));
    const sig = grupos[k + 1];
    if (sig) fin = Math.min(fin, sig[0].i - ANTES - 0.01);
    const prev = tramos[tramos.length - 1];
    if (prev && prev.clip === c.id) ini = Math.max(ini, prev.ini + prev.d + 0.01);
    const d = cuadro(fin - ini);
    tramos.push({ clip: c.id, ini, d, T0: T, zoom: k % 2 === 1, palabras: g });
    T = cuadro(T + d);
  });
}
const FIN = T, TOTAL = cuadro(FIN + CIERRE);
const TEXTO = { '3,': 'tres,', '10.': 'diez.' };
const palabras = tramos.flatMap((t) => t.palabras.map((p) => ({ t: TEXTO[p.t] || p.t, i: t.T0 + p.i - t.ini, f: t.T0 + p.f - t.ini, clip: t.clip })));
const cuando = (clip, re) => { const p = palabras.find((x) => x.clip === clip && re.test(x.t)); if (!p) throw new Error('No encontré ' + re); return p.i; };

// ---------- Frases cortas ----------
const FLOJAS = new Set(['a', 'al', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'de', 'del', 'por', 'para', 'con', 'en', 'que', 'se', 'te', 'lo', 'es', 'ese', 'esa', 'ya', 'no']);
const puntua = (p) => /[.,?!…:]$/.test(p.t);
const floja = (p) => FLOJAS.has(p.t.toLowerCase()) && !puntua(p);
const frases = []; let act = [];
const cerrar = (forzar = true) => { const resto = []; while (act.length > 1 && floja(act[act.length - 1])) resto.unshift(act.pop()); if (!forzar && act.every(floja)) { act.push(...resto); return; } if (act.length) frases.push(act); act = resto; };
for (const p of palabras) {
  const largo = act.map((x) => x.t).join(' ').length;
  const cambia = act.length && (p.clip !== act[0].clip || p.i - act[act.length - 1].f > 0.45);
  if (act.length && (cambia || act.length >= 3 || largo + 1 + p.t.length > 15)) cerrar(cambia);
  act.push(p); if (puntua(p)) cerrar();
}
cerrar();

// ---------- Cortes a la app ----------
const tK1 = cuadro(cuando('3-solucion', /^amarrado/) - 0.06);
const tK2 = cuadro(cuando('3-solucion', /^Después/) - 0.06);
const ult3 = tramos.filter((t) => t.clip === '3-solucion').slice(-1)[0];
const finK2 = cuadro(ult3.T0 + ult3.d);

// ---------- Piezas aparte (compositions/): cada una es una fila de la línea de tiempo ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const pieza = (id, estilo, cuerpo, guion) => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>
${estilo}
      </style>
      <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920">
${cuerpo}
      </div>
      <script>
        (() => {
          const tl = gsap.timeline({ paused: true });
          ${guion.join('\n          ')}
          window.__timelines["${id}"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
const anfitrion = (id, ini, fin, pista, tipo) => `      <div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${seg(mill(ini))}" data-duration="${seg(mill(fin) - mill(ini))}" data-track-index="${pista}" data-track-kind="${tipo}" data-width="1080" data-height="1920"></div>`;

// La app y el cierre: a pantalla completa (nunca encima de ella), con un acercamiento muy lento.
const ESTILO_CORTE = (id) => `        #root { position: absolute; inset: 0; overflow: hidden; background: #0c0d10; }
        #${id}-img { display: block; width: 100%; height: 100%; transform-origin: 50% 38%; }`;
const corte = (id, img, guion) => fs.writeFileSync(path.join(C, id + '.html'), pieza(id, ESTILO_CORTE(id), `        <img id="${id}-img" src="assets/${img}" alt="" data-layout-allow-overflow />`, guion), 'utf8');
corte('app-despues', 'app-despues.png', [`tl.fromTo("#app-despues-img", { scale: 1 }, { scale: 1.05, duration: ${n(tK2 - tK1)}, ease: "none" }, 0);`]);
corte('app-minimo', 'app-minimo-y-hoy.png', [`tl.fromTo("#app-minimo-img", { scale: 1 }, { scale: 1.05, duration: ${n(finK2 - tK2)}, ease: "none" }, 0);`]);
corte('cierre', 'cierre.png', [`tl.fromTo("#cierre-img", { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }, 0);`]);

// Subtítulos: una sola pieza con todas las frases; cada palabra se pone ámbar cuando se dice.
let w = 0; const gs = [];
const parrafos = frases.map((fr, q) => {
  const sig = frases[q + 1];
  const ini = Math.max(0, fr[0].i - 0.03);
  const fin = Math.min(fr[fr.length - 1].f + 0.22, sig ? sig[0].i - 0.03 : FIN);
  gs.push(`tl.set("#frase-${q}", { opacity: 1 }, ${n(ini)});`);
  gs.push(`tl.fromTo("#frase-${q}", { scale: 0.86 }, { scale: 1, duration: 0.09, ease: "back.out(2)" }, ${n(ini)});`);
  gs.push(`tl.set("#frase-${q}", { opacity: 0 }, ${n(fin)});`);
  const spans = fr.map((p, k) => {
    const id = `w${w++}`;
    gs.push(`tl.set("#${id}", { color: "#f5a524" }, ${n(k ? p.i : ini)});`);
    if (k < fr.length - 1) gs.push(`tl.set("#${id}", { color: "#ffffff" }, ${n(fr[k + 1].i)});`);
    return `<span id="${id}">${esc(p.t)}</span>`;
  }).join(' ');
  return `        <p id="frase-${q}" class="frase">${spans}</p>`;
}).join('\n');
// Zona segura de Reels: ni sobre la cara ni en el 35 % de abajo.
const ESTILO_SUBS = `        @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2"); }
        #root { position: absolute; inset: 0; }
        .frase {
          position: absolute; left: 40px; right: 40px; bottom: 716px; margin: 0; opacity: 0;
          white-space: nowrap; text-align: center;
          font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 124px; line-height: 1; letter-spacing: 0.005em;
          color: #ffffff; -webkit-text-stroke: 16px #000000; paint-order: stroke fill;
          text-shadow: 0 8px 0 rgba(0, 0, 0, 0.45);
        }`;
fs.writeFileSync(path.join(C, 'subtitulos.html'), pieza('subtitulos', ESTILO_SUBS, parrafos, gs), 'utf8');

// ---------- index.html: las tomas, las piezas y los sonidos ----------
const videos = tramos.map((t, k) => {
  const fin = tramos[k + 1] ? tramos[k + 1].T0 : FIN;
  return `      <video id="toma-${k}" class="clip toma${t.zoom ? ' cerca' : ''}" src="assets/${t.clip}.mp4" playsinline data-has-audio="true" data-start="${seg(mill(t.T0))}" data-duration="${seg(mill(fin) - mill(t.T0))}" data-media-start="${n(t.ini)}" data-track-index="0" data-volume="1" data-audio-group="voz"></video>`;
}).join('\n');

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · Lina · guion 4</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face {
        font-family: "Barlow Condensed";
        font-weight: 700;
        src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2");
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #0c0d10; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0c0d10; }
      .clip { position: absolute; inset: 0; }
      /* Las tomas de Lina. "cerca" es un acercamiento fijo para disimular el corte dentro del mismo plano. */
      .toma { width: 100%; height: 100%; object-fit: cover; z-index: 1; }
      .toma.cerca { transform: scale(1.08); transform-origin: 50% 30%; }
      #app-despues, #app-minimo, #cierre { z-index: 2; }
      #subtitulos { z-index: 3; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${seg(mill(TOTAL))}" data-width="1080" data-height="1920">
      <!-- La voz de los clips llega bajita: se sube ${GANANCIA} dB y se le pone un tope para que no se sature. -->
      <hf-audio-group id="voz" data-label="Voz de Lina" data-fx-chain=${"'"}{"version":1,"nodes":[{"type":"gain","id":"v1","params":{"gain":${GANANCIA}}},{"type":"limiter","id":"v2","params":{"limit":-1.5}}]}${"'"}></hf-audio-group>

      <!-- Pista 0 · Lina, solo los tramos con voz -->
${videos}

      <!-- Pista 1 · La app a pantalla completa y el cierre -->
${anfitrion('app-despues', tK1, tK2, 1, 'graphics')}
${anfitrion('app-minimo', tK2, finK2, 1, 'graphics')}
${anfitrion('cierre', FIN, TOTAL, 1, 'graphics')}

      <!-- Pista 2 · Subtítulos palabra por palabra -->
${anfitrion('subtitulos', 0, FIN, 2, 'captions')}

      <!-- Pista 3 · Sonidos -->
      <audio id="sfx-app" src="assets/whoosh.wav" data-start="${n(Math.max(0, tK1 - 0.1))}" data-duration="0.42" data-track-index="3" data-volume="0.3"></audio>
      <audio id="sfx-ding" src="assets/ding.wav" data-start="${n(tK2 + 0.15)}" data-duration="0.7" data-track-index="3" data-volume="0.25"></audio>
      <audio id="sfx-cierre" src="assets/whoosh.wav" data-start="${n(FIN - 0.1)}" data-duration="0.42" data-track-index="3" data-volume="0.3"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(P, 'index.html'), html, 'utf8');
console.log(`Listo: ${tramos.length} tramos, ${frases.length} frases, ${w} palabras, dura ${TOTAL.toFixed(2)} s (voz ${FIN.toFixed(2)} s); la app entra en ${tK1.toFixed(2)} y ${tK2.toFixed(2)}`);
