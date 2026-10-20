// POV 3 (20 oct de 2026): "descontrol → disciplina → la app", con la estructura de los 5 reels que bajó Johnatan
// (referencias/oct20-pov/analisis.md). Fiesta con "misma edad:" → cae el bajo de "Midnight Minor" → tomas de disciplina, una
// por golpe y cada una en un lugar distinto → "las metas se cumplen día a día" → (después) la app en sus tomas del portátil.
// OJO: las tomas de fiesta y disciplina son de OTROS creadores (ref1 a ref5): sirve para probar en Instagram; antes de pagar
// pauta se cambian por tomas libres (la lista TOMAS de abajo es lo único que hay que tocar).
// Muestra 2 (pedida por él): color "ámbar de Racha" (A) para que no quede igual a los originales, y la fiesta más
// "dopamínica": 8 cortes de medio golpe con golpe de cámara y destello, música fuerte desde el primer cuadro, una subida,
// corte seco de la música y un golpe grave cuando aparece el tipo en la niebla.
// Uso: node design/herramientas/hf-pov3.mjs [--solo-html]     (PRUEBA=<segundos> corta el final)
//      después check, snapshot y render dentro de campana/pov3/hyperframes
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const REF = path.join(AQUI, '..', 'anuncios', 'referencias', 'oct20-pov');
const BASE = path.join(C, 'pov3');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const P = path.join(BASE, 'hyperframes'), A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'tomas')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const SOLO_HTML = process.argv.includes('--solo-html');

// ---------- el ritmo: "Midnight Minor", 91 golpes por minuto; golpes de la canción en 0,65 + k·0,6593 ----------
const G = 0.6593;
const CAIDA = 4 * G;                 // segundo del video en que termina la fiesta y aparece el tipo en la niebla
const FIESTA_MUSICA = 13.177;        // la fiesta suena con la parte fuerte (ya con el bajo), cuadrada a los golpes
const RESTO_MUSICA = 10.54;          // desde el tipo en la niebla, la canción vuelve a arrancar en su caída del bajo
const SILENCIO = 0.12;               // la música se corta en seco un instante antes del golpe grave

// el color "ámbar de Racha" (escogido el 20 oct): sombras frías, luces ámbar, negros apretados, bordes oscuros y grano
const COLOR = fs.readFileSync(path.join(BASE, 'color', 'a-ambar.txt'), 'utf8').trim();
// la fiesta, con el mismo color pero más luz y más saturación (con el oscuro de la disciplina se perdía la energía)
const COLOR_FIESTA = fs.readFileSync(path.join(BASE, 'color', 'a-ambar-fiesta.txt'), 'utf8').trim();

// ---------- las tomas (ref: de qué video; de: segundo; golpes: cuánto dura; tapa: letras de ellos que se borran) ----------
const LIFE = '150:598:430:72', SAME = '252:562:212:66';
const TOMAS = [
  // la fiesta: 8 cortes de medio golpe
  { ref: 2, de: 0.05, golpes: 0.5, tapa: LIFE, fiesta: true },
  { ref: 3, de: 0.10, golpes: 0.5, tapa: SAME, fiesta: true },
  { ref: 2, de: 0.45, golpes: 0.5, tapa: LIFE, fiesta: true },
  { ref: 3, de: 0.75, golpes: 0.5, tapa: SAME, fiesta: true },
  { ref: 2, de: 1.40, golpes: 0.5, tapa: SAME, fiesta: true },
  { ref: 2, de: 0.85, golpes: 0.5, tapa: LIFE, fiesta: true },
  { ref: 3, de: 1.40, golpes: 0.5, tapa: SAME, fiesta: true },
  { ref: 2, de: 2.00, golpes: 0.5, tapa: SAME, fiesta: true },
  // cae el golpe grave: la disciplina, una toma por golpe y cada una en un lugar distinto
  { ref: 2, de: 3.0, golpes: 2 },      // el tipo solo en la niebla
  { ref: 1, de: 3.2, golpes: 2 },      // corriendo bajo la nube negra
  { ref: 3, de: 2.45, golpes: 1 },     // flexiones al atardecer
  { ref: 3, de: 3.75, golpes: 1 },     // saltando lazo en la carretera mojada
  { ref: 4, de: 7.45, golpes: 2 },     // gimnasio: los audífonos colgados
  { ref: 5, de: 0.0, golpes: 1 },      // escritorio de noche (el plano "alcanzable")
  { ref: 3, de: 12.15, golpes: 1 },    // corriendo de noche entre los postes
  { ref: 1, de: 14.5, golpes: 2 },     // flexiones en el campo
  { ref: 4, de: 2.7, golpes: 3, frase: 'las metas se cumplen día a día' },   // gimnasio vacío
];
let t0 = 0;
TOMAS.forEach((s, k) => { s.k = k; s.t = t0; s.dura = s.golpes * G; t0 += s.dura; });
const TOTAL = Number(process.env.PRUEBA || t0);

// ---------- 1. los archivos ----------
const SON = path.join(C, 'sonidos'), MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
if (!SOLO_HTML) {
  TOMAS.forEach((s) => {
    const vf = [s.tapa ? `delogo=${s.tapa.split(':').map((v, i) => `${['x', 'y', 'w', 'h'][i]}=${v}`).join(':')}` : null,
      'fps=30', 'scale=1080:1920:flags=lanczos', s.fiesta ? COLOR_FIESTA : COLOR, 'format=yuv420p'].filter(Boolean).join(',');
    ff(['-ss', String(s.de), '-i', path.join(REF, `ref${s.ref}.mp4`), '-t', String(n(s.dura + 0.1)), '-an', '-vf', vf, '-c:v', 'libx264', '-crf', '16', '-g', '1', path.join(A, 'tomas', `s${s.k}.mp4`)]);
  });
  // el sonido: la fiesta fuerte → una subida → corte seco → golpe grave y la canción desde su caída → obturador en cada destello
  const efectos = [['subida', CAIDA - SILENCIO, 'fin', -14], ['boom', CAIDA, 'golpe', -4]];
  TOMAS.filter((s) => s.fiesta && s.k > 0).forEach((s) => efectos.push(['obturador', s.t, 'golpe', -20]));
  const entradas = ['-ss', String(FIESTA_MUSICA), '-t', String(n(CAIDA - SILENCIO)), '-i', path.join(C, 'pov1', 'musica', 'midnight-minor.wav'),
    '-ss', String(RESTO_MUSICA), '-t', String(n(TOTAL - CAIDA + 0.5)), '-i', path.join(C, 'pov1', 'musica', 'midnight-minor.wav')];
  efectos.forEach(([s]) => entradas.push('-i', path.join(SON, `${s}.wav`)));
  const ms = (x) => Math.max(0, Math.round(x * 1000));
  const filtros = [
    `[0:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=out:st=${n(CAIDA - SILENCIO - 0.03)}:d=0.03[f]`,
    `[1:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${ms(CAIDA)}|${ms(CAIDA)},afade=t=out:st=${n(TOTAL - 0.4)}:d=0.4[r]`,
    ...efectos.map(([s, tt, modo, db], i) => { const en = modo === 'fin' ? tt - MEDIDAS[s].dura : tt - MEDIDAS[s].golpe_en; return `[${i + 2}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${db}dB,adelay=${ms(en)}|${ms(en)}[e${i}]`; }),
    `[f][r]${efectos.map((_, i) => `[e${i}]`).join('')}amix=inputs=${efectos.length + 2}:normalize=0:duration=longest,atrim=0:${n(TOTAL)},alimiter=limit=0.95[m]`,
  ];
  ff([...entradas, '-filter_complex', filtros.join(';'), '-map', '[m]', '-ar', '48000', '-ac', '2', path.join(A, 'musica.wav')]);
}

// ---------- 2. las animaciones ----------
const pasos = [];
const tl = (s) => pasos.push(s);
TOMAS.forEach((s) => {
  if (s.fiesta) {
    // golpe de cámara en cada corte (entra grande y se asienta), un poco de giro y un destello
    tl(`tl.fromTo("#v${s.k}", { scale: 1.22, rotation: ${s.k % 2 ? 2 : -2} }, { scale: 1.04, rotation: 0, duration: ${n(s.dura)}, ease: "expo.out", immediateRender: false }, ${n(s.t)});`);
    if (s.k > 0) tl(`tl.fromTo("#destello", { opacity: 0.55 }, { opacity: 0, duration: 0.14, ease: "power2.out", immediateRender: false }, ${n(s.t)});`);
  } else {
    const caida = Math.abs(s.t - CAIDA) < 0.01;
    tl(`tl.fromTo("#v${s.k}", { scale: ${caida ? 1.14 : 1.0} }, { scale: ${caida ? 1.03 : 1.06}, duration: ${n(s.dura)}, ease: "${caida ? 'expo.out' : 'none'}", immediateRender: false }, ${n(s.t)});`);
  }
});
// en la caída, la cámara tiembla una vez con el golpe grave
tl(`tl.fromTo("#marco", { x: 0, y: 0 }, { keyframes: { x: [0, -14, 11, -6, 3, 0], y: [0, 8, -6, 4, -2, 0] }, duration: 0.4, ease: "none", immediateRender: false }, ${n(CAIDA)});`);
// "misma edad:" sobre toda la fiesta, quieta, como en los reels (late con cada corte)
tl(`tl.set("#edad", { opacity: 1 }, 0);`);
TOMAS.filter((s) => s.fiesta).forEach((s) => tl(`tl.fromTo("#edad", { scale: 1.08 }, { scale: 1, duration: 0.18, ease: "power2.out", immediateRender: false }, ${n(s.t)});`));
tl(`tl.set("#edad", { opacity: 0 }, ${n(CAIDA - SILENCIO)});`);
const ult = TOMAS.at(-1);
tl(`tl.fromTo("#frase", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", immediateRender: false }, ${n(ult.t + 0.15)});`);

// ---------- 3. la página ----------
const videos = TOMAS.map((s) => `        <video class="toma" id="v${s.k}" src="assets/tomas/s${s.k}.mp4" muted playsinline data-start="${n(s.t)}" data-duration="${n(s.dura)}" data-media-start="0" data-track-index="${s.k % 2 ? 2 : 1}"></video>`).join('\n');
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · POV 3</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      #marco { position: absolute; inset: 0; }
      .toma { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      #destello { position: absolute; inset: 0; background: #fff; opacity: 0; z-index: 8; }
      .texto { position: absolute; left: 0; right: 0; text-align: center; font-family: "Segoe UI", Arial, sans-serif; font-weight: 600; font-size: 46px; color: #fff; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7); opacity: 0; z-index: 10; }
      #edad { top: 868px; }
      #frase { top: 868px; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="marco">
${videos}
      </div>
      <div id="destello"></div>
      <p class="texto" id="edad">misma edad:</p>
      <p class="texto" id="frase">las metas se cumplen día a día</p>
      <audio id="musica" src="assets/musica.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="7" data-volume="1"></audio>
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
fs.copyFileSync(path.join(AQUI, 'libs', 'gsap-3.14.2.min.js'), path.join(A, 'gsap.min.js'));
console.log(`Listo POV 3: ${TOMAS.length} tomas · dura ${TOTAL.toFixed(2)} s · golpe grave en ${CAIDA.toFixed(2)} s`);
