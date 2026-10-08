// Arma el proyecto de HyperFrames del primer anuncio del estilo "pantalla grabada sin voz":
// Luis haciendo cosas -> las tomas del computador grabadas por Johnatan -> tarjeta del precio animada.
// Uso: node design/herramientas/hf-pantalla1.mjs        (después, dentro de campana/pantalla1/hyperframes: check, snapshot, render)
//
// Cómo está hecho:
// - Los 12 cortes se preparan antes con ffmpeg (recorte, color y número exacto de cuadros) y se unen en assets/cuerpo.mp4.
//   Las tomas del computador son 4K en HEVC: así HyperFrames solo mueve un video liviano.
// - HyperFrames pone la frase de arriba (Barlow Condensed, la letra de Racha), la tarjeta final animada y la música.
// - La música ("Steady Progress", hecha por Johnatan en ElevenLabs) va a 100 golpes por minuto: un golpe cada 0,6 s
//   (medido con design/herramientas/ritmo.py). Cada corte dura 2 golpes y la tarjeta se mueve con los golpes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const P = path.join(C, 'pantalla1', 'hyperframes');
const A = path.join(P, 'assets');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

// ---------- lo que se puede cambiar ----------
// La frase de arriba es PROVISIONAL: falta que Johnatan la apruebe.
const FRASE = ['Hábitos, tareas y foco:', 'todo en una sola app.'];
const GOLPE = 0.6;                 // un golpe de la música
const CORTE = 2 * GOLPE;           // cada corte dura 2 golpes (36 cuadros)
const MUSICA = path.join(C, 'pantalla1', 'musica', 'steady-progress.mp4');
const MUSICA_DESDE = 0.565;        // el primer golpe de la pista
const CIERRE_DURA = 7 * GOLPE;     // 4,2 s
// tipo, archivo, desde qué segundo, [x del recorte]
//   L = clip de Luis a cuadro completo;  P = clip de Luis quitando el 17 % de abajo (sale un celular en el piso);
//   M = toma del computador: pedazo de 1536 px de ancho desde x, con negro arriba para la frase.
const TRAMOS = [
  ['L', 'se-levanta', 2.6], ['L', 'agua', 1.7], ['P', 'corre-pies', 1.0], ['L', 'pesas-piso', 3.0], ['L', 'escritorio-arriba', 0.5], ['L', 'abre-portatil', 4.6],
  ['M', '21', 4.0, 500], ['M', '21', 12.2, 1100], ['M', '19', 9.0, 1100], ['M', '13', 0.3, 150], ['M', '13', 3.2, 1150], ['M', '21', 19.2, 300],
];
const CUERPO = TRAMOS.length * CORTE;        // 14,4 s
const TOTAL = CUERPO + CIERRE_DURA;          // 18,6 s
const n = (x) => Number(x.toFixed(6));

// ---------- 1. los cortes, con ffmpeg ----------
const SOLO_HTML = process.argv.includes('--solo-html');
if (!SOLO_HTML) {
  const tmp = path.join(P, 'tmp'); fs.mkdirSync(tmp, { recursive: true });
  const COLOR = 'colorbalance=bs=-0.20:bm=-0.14:bh=-0.05:rs=0.04,eq=saturation=0.92:contrast=1.06';
  const COD = ['-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', '30'];
  const lista = [];
  TRAMOS.forEach(([tipo, archivo, desde, x], i) => {
    const entrada = tipo === 'M' ? path.join(C, 'grabaciones', `toma-${archivo}.mp4`) : path.join(C, 'hombre', 'clips', `${archivo}.mp4`);
    const vf = tipo === 'L' ? 'fps=30,scale=1080:1920:flags=lanczos,setsar=1'
      : tipo === 'P' ? 'fps=30,crop=596:1060:62:0,scale=1080:1920:flags=lanczos,setsar=1'
      : `fps=30,${COLOR},crop=1536:1728:${x}:0,scale=1080:1215:flags=lanczos,pad=1080:1920:0:400:black,setsar=1`;
    ff(['-ss', String(desde), '-i', entrada, '-an', '-vf', vf, '-frames:v', String(Math.round(CORTE * 30)), ...COD, path.join(tmp, `t${i}.mp4`)]);
    lista.push(`file 't${i}.mp4'`);
    process.stdout.write(`corte ${i + 1} de ${TRAMOS.length}\n`);
  });
  fs.writeFileSync(path.join(tmp, 'lista.txt'), lista.join('\n'), 'utf8');
  // Un cuadro clave cada medio segundo, para que HyperFrames busque rápido cualquier momento
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'lista.txt'), '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '15', '-movflags', '+faststart', path.join(A, 'cuerpo.mp4')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  // La música: desde su primer golpe, lo que dura el anuncio, bajando en el último segundo
  ff(['-ss', String(MUSICA_DESDE), '-t', String(TOTAL), '-i', MUSICA, '-vn', '-af', `afade=t=out:st=${n(TOTAL - 1.1)}:d=1.1`, '-ar', '48000', '-ac', '2', path.join(A, 'musica.wav')]);
}

// ---------- 2. letras e ícono ----------
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow-condensed', 'barlow-condensed-latin-700-normal.woff2', 'barlow-condensed-700.woff2');
fuente('barlow-condensed', 'barlow-condensed-latin-600-normal.woff2', 'barlow-condensed-600.woff2');
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
fuente('barlow', 'barlow-latin-500-normal.woff2', 'barlow-500.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2"); }
        @font-face { font-family: "Barlow Condensed"; font-weight: 600; src: url("assets/fuentes/barlow-condensed-600.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 500; src: url("assets/fuentes/barlow-500.woff2") format("woff2"); }`;
const AMBAR = '#FFB547', TINTA = '#0F1113', FONDO = '#0B0C0F', CLARO = '#F4EFE6';
// La llama del ícono de la app (public/icon.svg)
const LLAMA = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';

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

// ---------- 3. la frase de arriba ----------
pieza('frase', `        #f-caja { position: absolute; left: 0; right: 0; top: 178px; text-align: center; }
        .f-linea { margin: 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 86px; line-height: 1.04; letter-spacing: 0.005em; color: #ffffff; text-shadow: 0 3px 14px rgba(0, 0, 0, 0.75), 0 0 3px rgba(0, 0, 0, 0.9); white-space: nowrap; opacity: 0; }`,
`        <div id="f-caja">
${FRASE.map((t, i) => `          <p class="f-linea" id="f-${i}">${t}</p>`).join('\n')}
        </div>`, [
  `tl.fromTo("#f-0", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0.05);`,
  `tl.fromTo("#f-1", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0.2);`,
]);

// ---------- 4. la tarjeta final ----------
// Lo importante va entre y = 270 y y = 1250: en Reels, lo de más abajo lo tapan el texto y el botón de Instagram.
// Abajo asoma el celular con la app real (captura de la grabación de Johnatan), que se puede tapar sin perder nada.
const g = (k) => n(k * GOLPE);
pieza('cierre', `        #c-fondo { position: absolute; inset: 0; background: ${FONDO}; }
        #c-brillo { position: absolute; left: -260px; top: 80px; width: 1600px; height: 1500px; background: radial-gradient(closest-side, rgba(255, 181, 71, 0.30), rgba(255, 181, 71, 0.10) 45%, rgba(255, 181, 71, 0) 72%); opacity: 0; }
        #c-col { position: absolute; left: 0; right: 0; top: 262px; display: flex; flex-direction: column; align-items: center; }
        #c-ico { width: 148px; height: 148px; border-radius: 34px; background: ${AMBAR}; display: flex; align-items: center; justify-content: center; opacity: 0; }
        #c-ico svg { width: 104px; height: 104px; display: block; }
        #c-marca { margin: 18px 0 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 170px; line-height: 1; color: ${CLARO}; opacity: 0; }
        #c-app { margin: 2px 0 0; font-family: "Barlow", sans-serif; font-weight: 500; font-size: 54px; line-height: 1.1; color: #A89F92; opacity: 0; }
        #c-precio { margin: 34px 0 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 318px; line-height: 0.92; letter-spacing: -0.01em; color: ${AMBAR}; white-space: nowrap; opacity: 0; }
        #c-pago { margin: 14px 0 0; padding: 4px 30px 8px; background: ${CLARO}; color: ${TINTA}; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 92px; line-height: 1; letter-spacing: 0.03em; white-space: nowrap; opacity: 0; }
        #c-dias { margin: 26px 0 0; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 56px; line-height: 1.1; color: ${CLARO}; white-space: nowrap; opacity: 0; }
        #c-boton { margin: 44px 0 0; height: 116px; padding: 0 56px; border-radius: 58px; background: ${AMBAR}; color: ${TINTA}; display: flex; align-items: center; gap: 22px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; white-space: nowrap; opacity: 0; }
        #c-flecha { width: 50px; height: 50px; display: block; }
        #c-cel { position: absolute; left: 215px; top: 1400px; width: 650px; height: 1290px; border-radius: 64px 64px 0 0; border: 10px solid #2A2D33; border-bottom: 0; background: #101216; overflow: hidden; opacity: 0; }
        #c-cel img { display: block; width: 100%; }
        #c-velo { position: absolute; left: 0; right: 0; top: 1380px; height: 540px; background: linear-gradient(180deg, rgba(11, 12, 15, 0) 0%, rgba(11, 12, 15, 0.55) 55%, rgba(11, 12, 15, 0.92) 100%); }`,
`        <div id="c-fondo"></div>
        <div id="c-brillo" data-layout-allow-overflow></div>
        <div id="c-cel" data-layout-allow-overflow><img src="assets/app-celular.png" alt="" data-layout-allow-overflow /></div>
        <div id="c-velo"></div>
        <div id="c-col">
          <div id="c-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${TINTA}" d="${LLAMA}" /></svg></div>
          <p id="c-marca">Racha</p>
          <p id="c-app">es una app</p>
          <p id="c-precio">$37.900</p>
          <p id="c-pago">UN SOLO PAGO</p>
          <p id="c-dias">7 días para probarla</p>
          <div id="c-boton"><span>Escríbenos por WhatsApp</span><svg id="c-flecha" viewBox="0 0 24 24" fill="none" stroke="${TINTA}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg></div>
        </div>`, [
  // golpe 0: el ícono y el nombre
  `tl.fromTo("#c-brillo", { opacity: 0, scale: 0.7 }, { opacity: 0.55, scale: 1, duration: 0.5, ease: "power2.out" }, 0);`,
  `tl.fromTo("#c-ico", { opacity: 0, scale: 0.4, rotation: -14 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.34, ease: "back.out(2.2)" }, 0);`,
  `tl.fromTo("#c-marca", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, 0.1);`,
  // golpe 1: "es una app"
  `tl.fromTo("#c-app", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" }, ${g(1)});`,
  // golpe 2: el precio cae con fuerza y el fondo se enciende
  `tl.fromTo("#c-precio", { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power4.in" }, ${n(g(2) - 0.2)});`,
  `tl.to("#c-precio", { scale: 1.06, duration: 0.07, ease: "power1.out" }, ${g(2)});`,
  `tl.to("#c-precio", { scale: 1, duration: 0.22, ease: "power2.out" }, ${n(g(2) + 0.07)});`,
  `tl.to("#c-brillo", { opacity: 1, scale: 1.12, duration: 0.12, ease: "power1.out" }, ${g(2)});`,
  `tl.to("#c-brillo", { opacity: 0.7, scale: 1, duration: 0.6, ease: "power2.out" }, ${n(g(2) + 0.12)});`,
  // golpe 3: "un solo pago" y, medio golpe después, los 7 días
  `tl.fromTo("#c-pago", { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 0.22, ease: "power3.out" }, ${g(3)});`,
  `tl.fromTo("#c-dias", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" }, ${g(3.5)});`,
  // golpe 4: el botón sube y el celular asoma; la flecha baja y sube con los golpes que siguen
  `tl.fromTo("#c-boton", { opacity: 0, y: 70, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)" }, ${g(4)});`,
  `tl.fromTo("#c-cel", { opacity: 0, y: 260 }, { opacity: 0.9, y: 0, duration: 0.55, ease: "power3.out" }, ${g(4)});`,
  `tl.to("#c-flecha", { y: 12, duration: ${n(GOLPE / 2)}, ease: "power1.inOut", repeat: 3, yoyo: true }, ${g(5)});`,
]);

// ---------- 5. el archivo principal ----------
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · pantalla 1</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      #cuerpo { width: 100%; height: 100%; object-fit: cover; z-index: 1; }
      #frase { z-index: 2; }
      #cierre { z-index: 3; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <!-- Los 12 cortes ya unidos: 6 de Luis y 6 de la pantalla, de ${CORTE} s cada uno -->
      <video id="cuerpo" class="clip" src="assets/cuerpo.mp4" playsinline muted data-start="0" data-duration="${n(CUERPO)}" data-media-start="0" data-track-index="0"></video>

      <!-- La frase fija de arriba -->
      <div id="frase" class="clip" data-composition-id="frase" data-composition-src="compositions/frase.html" data-start="0" data-duration="${n(CUERPO)}" data-track-index="1" data-width="1080" data-height="1920"></div>

      <!-- La tarjeta final: entra en el primer golpe de un compás -->
      <div id="cierre" class="clip" data-composition-id="cierre" data-composition-src="compositions/cierre.html" data-start="${n(CUERPO)}" data-duration="${n(CIERRE_DURA)}" data-track-index="2" data-width="1080" data-height="1920"></div>

      <!-- La música -->
      <audio id="musica" src="assets/musica.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="3" data-volume="1"></audio>
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
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion1').join('campana-pantalla1'), 'utf8');
}
console.log(`Listo: dura ${TOTAL.toFixed(2)} s (cortes ${CUERPO.toFixed(2)} s + tarjeta ${CIERRE_DURA.toFixed(2)} s)`);
