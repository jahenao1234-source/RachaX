// Arma el proyecto de HyperFrames de un anuncio del estilo "persona que explica, con cortes a la acción"
// (referencia: design/anuncios/referencias/oct7/ref5.mp4): Lina habla a cámara, se le quitan las pausas,
// y encima van cortes cortos a la acción (clips sin voz) y a la app grabada en movimiento.
// Uso: node design/herramientas/hf-explica.mjs <pieza> [--solo-html]     (piezas: guion4-muestra, guion4)
//      después, dentro de campana/<carpeta>/hyperframes: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//
// Cómo está hecho:
// - Cada clip hablado trae su .palabras.json (transcribir-assembly.mjs). El clip se parte donde hay una pausa
//   de más de PAUSA segundos y los pedazos se pegan seguidos: así queda sin silencios, con cortes secos.
// - A los clips de persona se les pone el filtro de la campaña (campana/filtro/filtro-campana.txt). A la app no.
// - Un corte encima se ubica por palabras: "desde la palabra N del clip C hasta la palabra M".
// - Las letras son las palabras de Lina, de a dos o tres, con la palabra clave en ámbar. Lo importante va entre y = 270 y 1250.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const FILTRO = fs.readFileSync(path.join(C, 'filtro', 'filtro-campana.txt'), 'utf8').trim();
const n = (x) => Number(x.toFixed(6));
const PAUSA = 0.3, ANTES = 0.06, DESPUES = 0.1;

// ---------- las piezas ----------
// hablados: [archivo sin .mp4, desde qué palabra, hasta qué palabra] (las dos incluidas; sin números = todo el clip)
// cortes:   { tipo: 'app' | 'accion', archivo, desde (segundo del archivo), en: [clip, palabraInicial, palabraFinal] }
// claves:   palabras que van en ámbar en las letras
const PIEZAS = {
  // Muestra para ver el filtro en movimiento, las letras y el corte a la app: solo el clip 1.
  'guion4-muestra': {
    carpeta: 'guion4', salida: 'muestra', titulo: 'guion 4 · muestra del estilo',
    hablados: [['1-aplazando']],
    cortes: [{ tipo: 'app', archivo: '1-escribe', desde: 2.3, en: [0, 3, 6] }],
    claves: ['semanas', 'cuarto', 'trabajo', 'empezar'],
    pastilla: null,
  },
};

const NOMBRE = process.argv[2];
const pz = PIEZAS[NOMBRE];
if (!pz) { console.log('Uso: node design/herramientas/hf-explica.mjs <' + Object.keys(PIEZAS).join(' | ') + '> [--solo-html]'); process.exit(1); }
const BASE = path.join(C, pz.carpeta);
const P = path.join(BASE, pz.salida === 'muestra' ? 'hyperframes-muestra' : 'hyperframes');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });

// ---------- 1. los pedazos de voz, sin pausas ----------
// Cada pedazo: de qué clip sale, de dónde a dónde, y dónde cae en el anuncio. Todo en cuadros enteros (30 por segundo).
const pedazos = []; const palabras = [];   // palabras: { t, clip, k, i, f } con los tiempos YA en el anuncio
let cursor = 0;
pz.hablados.forEach(([archivo, desde, hasta], c) => {
  const todas = JSON.parse(fs.readFileSync(path.join(BASE, 'clips', archivo + '.palabras.json'), 'utf8')).palabras;
  const usadas = todas.map((w, k) => ({ ...w, k })).slice(desde ?? 0, (hasta ?? todas.length - 1) + 1);
  let grupo = [];
  const cerrar = () => {
    if (!grupo.length) return;
    const a = Math.max(0, grupo[0].i - ANTES), b = grupo[grupo.length - 1].f + DESPUES;
    const cuadros = Math.round((b - a) * 30);
    pedazos.push({ archivo, a, cuadros, en: cursor });
    grupo.forEach((w) => palabras.push({ t: w.t, clip: c, k: w.k, i: cursor + (w.i - a), f: cursor + (w.f - a) }));
    cursor += cuadros / 30; grupo = [];
  };
  usadas.forEach((w, j) => { if (j > 0 && w.i - usadas[j - 1].f > PAUSA) cerrar(); grupo.push(w); });
  cerrar();
});
const COLA = pz.pastilla ? 1.6 : 0.3;            // lo que se queda el último cuadro al final
const TOTAL = cursor + COLA;
const palabra = (clip, k) => palabras.find((w) => w.clip === clip && w.k === k);

if (!process.argv.includes('--solo-html')) {
  const tmp = path.join(P, 'tmp'); fs.mkdirSync(tmp, { recursive: true });
  const vid = [], aud = [];
  pedazos.forEach((p, i) => {
    const entrada = path.join(BASE, 'clips', p.archivo + '.mp4');
    const ultimo = i === pedazos.length - 1;
    const cuadros = p.cuadros + (ultimo ? Math.round(COLA * 30) : 0);
    // El último pedazo se alarga con su último cuadro quieto, para la cola
    ff(['-ss', String(p.a), '-i', entrada, '-an', '-vf', `fps=30,${FILTRO},scale=1080:1920:flags=lanczos,setsar=1${ultimo ? `,tpad=stop_mode=clone:stop_duration=${COLA + 0.5}` : ''}`, '-frames:v', String(cuadros), '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', '30', path.join(tmp, `v${i}.mp4`)]);
    ff(['-ss', String(p.a), '-t', String(p.cuadros / 30), '-i', entrada, '-vn', '-af', `afade=t=in:st=0:d=0.012,afade=t=out:st=${n(p.cuadros / 30 - 0.03)}:d=0.03,apad=whole_dur=${n(cuadros / 30)}`, '-ar', '48000', '-ac', '2', path.join(tmp, `a${i}.wav`)]);
    vid.push(`file 'v${i}.mp4'`); aud.push(`file 'a${i}.wav'`);
  });
  fs.writeFileSync(path.join(tmp, 'v.txt'), vid.join('\n'), 'utf8');
  fs.writeFileSync(path.join(tmp, 'a.txt'), aud.join('\n'), 'utf8');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'v.txt'), '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '15', '-movflags', '+faststart', path.join(A, 'persona.mp4')]);
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'a.txt'), '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  // Los cortes: la app se copia tal cual; los clips de acción llevan el filtro
  pz.cortes.forEach((k) => {
    if (k.tipo === 'app') fs.copyFileSync(path.join(BASE, 'app', k.archivo + '.mp4'), path.join(A, k.archivo + '.mp4'));
    else ff(['-i', path.join(BASE, 'clips', k.archivo + '.mp4'), '-an', '-vf', `fps=30,${FILTRO},scale=1080:1920:flags=lanczos,setsar=1`, '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '15', path.join(A, k.archivo + '.mp4')]);
  });
}

// ---------- 2. letras ----------
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow-condensed', 'barlow-condensed-latin-700-normal.woff2', 'barlow-condensed-700.woff2');
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }`;
const AMBAR = '#FFB547', TINTA = '#0F1113', CLARO = '#F4EFE6';

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

// Las letras: grupos de hasta 3 palabras (o 18 letras), que se cortan en cada coma o punto
const limpia = (t) => t.toLowerCase().replace(/[.,;:¡!¿?"]/g, '');
const grupos = [];
let g = [];
palabras.forEach((w, j) => {
  const sig = palabras[j + 1];
  g.push(w);
  const letras = g.map((x) => x.t).join(' ').length;
  const corta = /[.,;:!?]$/.test(w.t) || !sig || sig.clip !== w.clip || sig.i - w.f > 0.25 || g.length >= 3 || letras + (sig ? sig.t.length : 0) > 18;
  if (corta) { grupos.push(g); g = []; }
});
pieza('letras', `        .gr { position: absolute; left: 0; right: 0; top: 1118px; margin: 0; text-align: center; white-space: nowrap; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 98px; line-height: 1; letter-spacing: 0.005em; color: #ffffff; text-shadow: 0 4px 0 rgba(15, 17, 19, 0.9), 0 0 18px rgba(15, 17, 19, 0.85), 0 0 4px rgba(15, 17, 19, 0.9); opacity: 0; }
        .gr .k { color: ${AMBAR}; }`,
grupos.map((gr, i) => `        <p class="gr" id="gr-${i}">${gr.map((w) => (pz.claves.includes(limpia(w.t)) ? `<span class="k">${w.t}</span>` : w.t)).join(' ')}</p>`).join('\n'),
grupos.flatMap((gr, i) => {
  const ini = Math.max(0, gr[0].i - 0.04), fin = grupos[i + 1] ? Math.max(ini + 0.1, grupos[i + 1][0].i - 0.04) : gr[gr.length - 1].f + 0.25;
  return [
    `tl.fromTo("#gr-${i}", { opacity: 0, scale: 0.9, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.1, ease: "back.out(2)" }, ${n(ini)});`,
    `tl.set("#gr-${i}", { opacity: 0 }, ${n(fin)});`,
  ];
}));

// ---------- 3. la pastilla del final (texto PROVISIONAL hasta que Johnatan lo apruebe) ----------
if (pz.pastilla) {
  pieza('pastilla', `        #pa { position: absolute; left: 0; right: 0; top: 1096px; display: flex; justify-content: center; }
        #pa-caja { height: 112px; padding: 0 44px; border-radius: 56px; background: ${CLARO}; color: ${TINTA}; display: flex; align-items: center; gap: 18px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; white-space: nowrap; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45); opacity: 0; }
        #pa-caja b { font-weight: 600; color: #9A5B00; }`,
  `        <div id="pa"><div id="pa-caja">${pz.pastilla}</div></div>`, [
    `tl.fromTo("#pa-caja", { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)" }, 0.05);`,
  ]);
}

// ---------- 4. el archivo principal ----------
const cortes = pz.cortes.map((k, i) => {
  const [clip, de, a] = k.en;
  const ini = Math.max(0, palabra(clip, de).i - 0.05), fin = palabra(clip, a).f + 0.08;
  return { ...k, i, ini: Math.round(ini * 30) / 30, dura: Math.round((fin - ini) * 30) / 30 };
});
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · ${pz.titulo}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      video.clip { width: 100%; height: 100%; object-fit: cover; }
      #persona { z-index: 1; }
      .corte { z-index: 2; }
      #letras { z-index: 3; }
      #pastilla { z-index: 4; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <!-- Lina, ya sin pausas y con el filtro -->
      <video id="persona" class="clip" src="assets/persona.mp4" playsinline muted data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="0"></video>

      <!-- Los cortes a la acción y a la app, encima de su voz -->
${cortes.map((k) => `      <video id="corte-${k.i}" class="clip corte" src="assets/${k.archivo}.mp4" playsinline muted data-start="${n(k.ini)}" data-duration="${n(k.dura)}" data-media-start="${n(k.desde)}" data-track-index="1"></video>`).join('\n')}

      <!-- Las letras -->
      <div id="letras" class="clip" data-composition-id="letras" data-composition-src="compositions/letras.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="2" data-width="1080" data-height="1920"></div>
${pz.pastilla ? `
      <!-- La pastilla del final -->
      <div id="pastilla" class="clip" data-composition-id="pastilla" data-composition-src="compositions/pastilla.html" data-start="${n(cursor)}" data-duration="${n(COLA)}" data-track-index="3" data-width="1080" data-height="1920"></div>
` : ''}
      <!-- La voz de Lina -->
      <audio id="voz" src="assets/voz.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="4" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
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
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s · ${pedazos.length} pedazos de voz · ${grupos.length} letreros · cortes: ${cortes.map((k) => `${k.archivo} ${k.ini.toFixed(2)}–${(k.ini + k.dura).toFixed(2)}`).join(', ') || 'ninguno'}`);
console.log('Letreros: ' + grupos.map((gr) => gr.map((w) => w.t).join(' ')).join(' | '));
