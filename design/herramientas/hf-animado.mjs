// Arma el proyecto de HyperFrames de un anuncio del estilo "todo animado con voz en off":
// palabras grandes que entran al ritmo de la voz, dibujos estilo cómic, la app en movimiento dentro de un celular
// y la tarjeta del precio. (La versión 1 tenía capturas quietas; Johnatan pidió dibujos y la app en movimiento.)
// (Referencia del estilo: design/anuncios/referencias/oct7/ref7.mp4.)
// Uso: node design/herramientas/hf-animado.mjs guion3 [--solo-html]
//      después, dentro de campana/guion3/hyperframes: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//
// Cómo está hecho:
// - La voz (ElevenLabs) ya viene sin pausas; el momento de cada palabra sale de su .palabras.json (AssemblyAI).
//   Cada renglón entra cuando la voz dice su primera palabra: si se cambia la voz, se transcribe otra vez y todo se acomoda solo.
// - Cada escena es una pieza aparte (compositions/); el corte entre escenas es seco, como en la referencia.
// - Las letras en pantalla son las mismas palabras de la voz, para que se entienda sin sonido.
// - Lo importante va entre y = 270 y y = 1250 (zona segura de Reels).
// - La app en movimiento sale de design/herramientas/grabar-campana-g3.cjs (graba la Racha de muestra con los toques
//   en los segundos de la voz). Si cambia la voz, hay que ajustar TOQUES en ese script y grabar otra vez.
// - Los dibujos son los del PDF (design/pdf/imagenes/), en viñetas con borde grueso y sombra dura.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

const NOMBRE = process.argv[2];
if (NOMBRE !== 'guion3') { console.log('Uso: node design/herramientas/hf-animado.mjs guion3 [--solo-html]'); process.exit(1); }
const VOZ = path.join(C, 'guion3', 'voz', 'dia-malo-v2-linda-C-v3-sin-pausas');   // .mp3 y .palabras.json
const MUSICA = { archivo: path.join(C, 'pantalla1', 'musica', 'steady-progress.mp4'), desde: 0.565, volumen: 0.16 }; // PROVISIONAL: la misma de los anuncios de pantalla, bajita
const P = path.join(C, NOMBRE, 'hyperframes');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));

// ---------- los tiempos, de la voz ----------
const palabras = JSON.parse(fs.readFileSync(VOZ + '.palabras.json', 'utf8')).palabras;
const ESPERADAS = 65;
if (palabras.length !== ESPERADAS) { console.log(`FALLA: la transcripción trae ${palabras.length} palabras y el guion tiene ${ESPERADAS}: hay que revisar los números de palabra.`); process.exit(1); }
const ENTRA = 0.2;                                // la voz arranca 0,2 s después del primer cuadro
const T = (k) => ENTRA + palabras[k].i;           // cuándo empieza la palabra número k (desde 0)
const FIN_VOZ = ENTRA + palabras[ESPERADAS - 1].f;
// Dónde empieza cada escena (en la primera palabra de su frase, un pelo antes)
const CORTES = [0, T(7) - 0.08, T(22) - 0.08, T(35) - 0.08, T(43) - 0.08, T(51) - 0.08, T(62) - 0.1];
const CIERRE_DURA = 4.1;
const TOTAL = CORTES[6] + CIERRE_DURA;

// ---------- 1. sonido, letras e imágenes ----------
if (!process.argv.includes('--solo-html')) {
  ff(['-i', VOZ + '.mp3', '-vn', '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  ff(['-ss', String(MUSICA.desde), '-t', String(TOTAL), '-i', MUSICA.archivo, '-vn', '-af', `volume=${MUSICA.volumen},afade=t=in:st=0:d=0.3,afade=t=out:st=${n(TOTAL - 1.2)}:d=1.2`, '-ar', '48000', '-ac', '2', path.join(A, 'musica.wav')]);
}
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow-condensed', 'barlow-condensed-latin-700-normal.woff2', 'barlow-condensed-700.woff2');
fuente('barlow-condensed', 'barlow-condensed-latin-600-normal.woff2', 'barlow-condensed-600.woff2');
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
fuente('barlow', 'barlow-latin-500-normal.woff2', 'barlow-500.woff2');
const APP = path.join(C, 'guion3', 'app');
// La app en movimiento (grabar-campana-g3.cjs): el video ya viene con los toques en los segundos de la voz
const CEL = JSON.parse(fs.readFileSync(path.join(APP, 'celular.json'), 'utf8'));
fs.copyFileSync(path.join(APP, 'celular.mp4'), path.join(A, 'celular.mp4'));
fs.copyFileSync(path.join(C, 'pantalla1', 'hyperframes', 'assets', 'app-celular.png'), path.join(A, 'app-celular.png'));
// Los dibujos estilo cómic del PDF "Método Anti-Abandono" (los generó Johnatan en Gemini)
const DIBUJOS = { 'd-cama.jpg': '1-portada.jpg', 'd-mesa.jpg': '2-dia-en-blanco.jpg', 'd-dejado.jpg': '3-lo-que-dejaste.jpg', 'd-cafe.jpg': 'r2-revision.jpg' };
for (const [a, de] of Object.entries(DIBUJOS)) fs.copyFileSync(path.join(AQUI, '..', 'pdf', 'imagenes', de), path.join(A, a));

const LETRAS = `
        @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2"); }
        @font-face { font-family: "Barlow Condensed"; font-weight: 600; src: url("assets/fuentes/barlow-condensed-600.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 500; src: url("assets/fuentes/barlow-500.woff2") format("woff2"); }`;
const AMBAR = '#FFB547', TINTA = '#0F1113', FONDO = '#0B0C0F', CLARO = '#F4EFE6', GRIS = '#A89F92';
const LLAMA = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';
// Lo que comparten las escenas: renglones grandes centrados, la caja que resalta y la viñeta de cómic (borde grueso y sombra dura, como en el PDF)
const BASE = `
        .fondo { position: absolute; inset: 0; }
        .col { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; }
        .l { margin: 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; line-height: 1; letter-spacing: -0.005em; white-space: nowrap; text-align: center; color: ${TINTA}; opacity: 0; }
        .negra { display: inline-block; background: ${TINTA}; color: ${AMBAR}; padding: 0 30px 10px; }
        .ambar { display: inline-block; background: ${AMBAR}; color: ${TINTA}; padding: 0 30px 10px; }
        .vin { position: absolute; overflow: hidden; border: 10px solid ${TINTA}; box-shadow: 18px 18px 0 ${TINTA}; background: ${AMBAR}; opacity: 0; }
        .vin img { position: absolute; left: 0; top: 0; width: 100%; display: block; transform-origin: 50% 40%; }`;

const pieza = (id, estilo, cuerpo, pasos) => fs.writeFileSync(path.join(P, 'compositions', `${id}.html`), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>${LETRAS}
        #root { position: absolute; inset: 0; overflow: hidden; }${BASE}
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

// Entradas: un renglón que salta a su sitio cuando la voz lo dice
const entra = (sel, t, giro = 0) => `tl.fromTo("${sel}", { opacity: 0, y: 36, scale: 0.94, rotation: ${giro} }, { opacity: 1, y: 0, scale: 1, rotation: ${giro}, duration: 0.2, ease: "back.out(1.7)" }, ${n(Math.max(0, t))});`;
const golpe = (sel, t, giro = 0) => `tl.fromTo("${sel}", { opacity: 0, scale: 1.5, rotation: ${giro - 6} }, { opacity: 1, scale: 1, rotation: ${giro}, duration: 0.2, ease: "power4.in" }, ${n(Math.max(0, t - 0.12))});`;
const dura = (i) => (i < 6 ? CORTES[i + 1] : TOTAL) - CORTES[i];
const L = (i) => (k) => T(k) - CORTES[i];

// ---------- escena 1 · "Un día malo no daña un hábito." (ámbar, con el dibujo de la cama) ----------
{
  const t = L(0);
  pieza('e1', `        #e1-col { top: 285px; gap: 14px; }
        #e1-a { font-size: 172px; opacity: 1; }
        #e1-b { font-size: 204px; }
        #e1-c { font-size: 172px; }
        #e1-v { left: 110px; top: 884px; width: 860px; height: 740px; opacity: 1; }`,
  `        <div class="fondo" style="background: ${AMBAR}"></div>
        <div class="vin" id="e1-v" data-layout-allow-overflow><img id="e1-i" src="assets/d-cama.jpg" alt="" data-layout-allow-overflow /></div>
        <div class="col" id="e1-col">
          <p class="l" id="e1-a">Un día malo</p>
          <p class="l" id="e1-b"><span class="negra">no daña</span></p>
          <p class="l" id="e1-c">un hábito.</p>
        </div>`, [
    // El primer cuadro ya trae "Un día malo" y el dibujo: es lo que se ve antes de que el video arranque
    `tl.fromTo("#e1-a", { scale: 1.1 }, { scale: 1, duration: 0.3, ease: "power3.out" }, 0);`,
    `tl.fromTo("#e1-v", { rotation: 4, scale: 1.06 }, { rotation: 2, scale: 1, duration: 0.5, ease: "power3.out" }, 0);`,
    `tl.fromTo("#e1-i", { scale: 1.2, y: -40 }, { scale: 1.04, y: 0, duration: ${n(dura(0))}, ease: "none" }, 0);`,
    golpe('#e1-b', t(3), -2),
    entra('#e1-c', t(5)),
  ]);
}

// ---------- escena 2 · "Lo que lo daña es que ese día no haces nada, y al otro tampoco." (ámbar, dos dibujos) ----------
{
  const t = L(1);
  pieza('e2', `        #e2-uno { top: 285px; gap: 10px; }
        #e2-a { font-size: 100px; }
        #e2-b { font-size: 146px; }
        #e2-c { font-size: 152px; }
        #e2-dos { top: 300px; gap: 16px; }
        #e2-d { font-size: 176px; }
        #e2-e { font-size: 236px; }
        #e2-v1, #e2-v2 { left: 70px; top: 800px; width: 940px; height: 630px; }`,
  `        <div class="fondo" style="background: ${AMBAR}"></div>
        <div class="vin" id="e2-v1" data-layout-allow-overflow><img id="e2-i1" src="assets/d-mesa.jpg" alt="" data-layout-allow-overflow /></div>
        <div class="vin" id="e2-v2" data-layout-allow-overflow><img id="e2-i2" src="assets/d-dejado.jpg" alt="" data-layout-allow-overflow /></div>
        <div class="col" id="e2-uno">
          <p class="l" id="e2-a">Lo que lo daña</p>
          <p class="l" id="e2-b">es que ese día</p>
          <p class="l" id="e2-c"><span class="negra">no haces nada,</span></p>
        </div>
        <div class="col" id="e2-dos">
          <p class="l" id="e2-d">y al otro</p>
          <p class="l" id="e2-e"><span class="negra">tampoco.</span></p>
        </div>`, [
    entra('#e2-a', t(7)),
    // la mesa de noche con la lista sin chulear
    `tl.fromTo("#e2-v1", { opacity: 0, x: -260, rotation: -9 }, { opacity: 1, x: 0, rotation: -2, duration: 0.42, ease: "back.out(1.3)" }, ${n(Math.max(0, t(7) + 0.05))});`,
    `tl.fromTo("#e2-i1", { scale: 1.02, x: 0 }, { scale: 1.26, x: -90, y: -40, duration: ${n(t(18) - t(7))}, ease: "power1.inOut" }, ${n(Math.max(0, t(7) + 0.05))});`,
    entra('#e2-b', t(11)),
    golpe('#e2-c', t(15), -1.5),
    // "y al otro tampoco": cambia la frase y entra lo que quedó abandonado
    `tl.to("#e2-uno", { opacity: 0, y: -40, duration: 0.14, ease: "power2.in" }, ${n(t(18) - 0.16)});`,
    `tl.to("#e2-v1", { opacity: 0, x: -320, rotation: -10, duration: 0.24, ease: "power2.in" }, ${n(t(18) - 0.14)});`,
    `tl.fromTo("#e2-v2", { opacity: 0, x: 320, rotation: 10 }, { opacity: 1, x: 0, rotation: 2, duration: 0.42, ease: "back.out(1.3)" }, ${n(t(18) + 0.02)});`,
    `tl.fromTo("#e2-i2", { scale: 1.2 }, { scale: 1.02, duration: ${n(dura(1) - t(18))}, ease: "none" }, ${n(t(18))});`,
    entra('#e2-d', t(18)),
    golpe('#e2-e', t(21), 1.5),
  ]);
}

// ---------- escenas 3 a 5 · la app en movimiento dentro de un celular ----------
// "En Racha, a tus hábitos les pones una versión mínima para esos días. En vez de leer diez páginas, lees una.
//  La marcas, y ese día cuenta como cumplido."
// El celular (la grabación de la muestra) vive en el archivo principal, para poder moverlo y acercarlo;
// aquí van el fondo (f3) y los letreros que van encima (l3).
const INI_CEL = CORTES[2], FIN_CEL = CORTES[5];
const B = 2.2, BORDE = 14;                       // la pantalla de 390 x 800 se ve de 858 x 1760, con 14 px de marco
const ANCHO_CEL = 390 * B + 2 * BORDE;
// Dónde poner el celular para que el punto `y` de la app quede a la altura `Y` del video, con el celular `s` veces más grande
const camara = (s, y, Y) => ({ x: n((1080 - ANCHO_CEL * s) / 2), y: n(Y - (BORDE + y * B) * s), scale: s });
const Y_FILA = 1080;                             // a qué altura del video queda la fila de "Leer 10 páginas"
const CAM = {
  hoy: camara(1, CEL.cajas.enlace.cy, 1130),          // se ve Hoy; el enlace "¿Día pesado?" queda en la zona segura
  hoja: camara(1.12, CEL.cajas.hojaLeer.cy, 1090),    // la hoja "Día difícil", con "Leer 10 páginas · Mínimo: una página"
  hojaCerca: camara(1.3, CEL.cajas.hojaLeer.cy, 1090),
  fila: camara(1.12, CEL.cajas.fila.cy, Y_FILA),         // de vuelta en Hoy, la fila de "Leer 10 páginas"
  filaCerca: camara(1.3, CEL.cajas.fila.cy, Y_FILA),
};
pieza('f3', `        #f3-bola { position: absolute; left: -110px; top: 560px; width: 1300px; height: 1300px; border-radius: 650px; background: ${AMBAR}; }
        #f3-puntos { position: absolute; inset: 0; background-image: radial-gradient(rgba(15, 17, 19, 0.16) 3px, transparent 3.5px); background-size: 34px 34px; }`,
`        <div class="fondo" style="background: ${CLARO}"></div>
        <div id="f3-puntos"></div>
        <div id="f3-bola" data-layout-allow-overflow></div>`, [
  `tl.fromTo("#f3-bola", { scale: 0.2 }, { scale: 1, duration: 0.7, ease: "power3.out" }, 0);`,
  `tl.to("#f3-bola", { scale: 1.12, y: -120, duration: ${n(FIN_CEL - INI_CEL - 0.7)}, ease: "sine.inOut" }, 0.7);`,
]);
{
  const t = L(2);
  const marca = CEL.toques.marcar - INI_CEL;
  // Las chispas salen del círculo que se acaba de marcar
  const chispa = { x: CAM.fila.x + (BORDE + CEL.cajas.circulo.cx * B) * CAM.fila.scale, y: Y_FILA };
  const CHISPAS = 12;
  pieza('l3', `        .grupo { top: 280px; gap: 14px; }
        .l .caja { display: inline-block; background: ${CLARO}; color: ${TINTA}; padding: 0 28px 12px; border: 6px solid ${TINTA}; box-shadow: 8px 8px 0 ${TINTA}; }
        .l .caja.amb { background: ${AMBAR}; }
        .g1 { font-size: 86px; }
        .g2 { font-size: 104px; }
        #l3-marca { display: flex; align-items: center; gap: 18px; opacity: 0; }
        #l3-ico { width: 116px; height: 116px; border-radius: 26px; background: ${AMBAR}; border: 6px solid ${TINTA}; display: flex; align-items: center; justify-content: center; }
        #l3-ico svg { width: 78px; height: 78px; display: block; }
        #l3-marca .l { font-size: 104px; opacity: 1; }
        .chispa { position: absolute; left: ${n(chispa.x - 11)}px; top: ${n(chispa.y - 11)}px; width: 22px; height: 22px; border-radius: 11px; background: ${AMBAR}; opacity: 0; }`,
  `        <div class="col grupo" id="l3-g1">
          <div id="l3-marca">
            <div id="l3-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${TINTA}" d="${LLAMA}" /></svg></div>
            <p class="l"><span class="caja">En Racha,</span></p>
          </div>
          <p class="l g1" id="l3-a"><span class="caja">a tus hábitos les pones</span></p>
          <p class="l g1" id="l3-b"><span class="caja amb">una versión mínima</span></p>
          <p class="l g1" id="l3-c"><span class="caja">para esos días.</span></p>
        </div>
        <div class="col grupo" id="l3-g2">
          <p class="l g2" id="l3-d"><span class="caja">En vez de leer</span></p>
          <p class="l g2" id="l3-e"><span class="caja">diez páginas,</span></p>
          <p class="l g2" id="l3-f"><span class="caja amb">lees una.</span></p>
        </div>
        <div class="col grupo" id="l3-g3">
          <p class="l g2" id="l3-g"><span class="caja">La marcas,</span></p>
          <p class="l g2" id="l3-h"><span class="caja">y ese día cuenta</span></p>
          <p class="l g2" id="l3-i"><span class="caja amb">como cumplido.</span></p>
        </div>
${Array.from({ length: CHISPAS }, (_, i) => `        <div class="chispa" id="l3-ch${i}"></div>`).join('\n')}`, [
    `tl.fromTo("#l3-marca", { opacity: 0, scale: 0.5, rotation: -8 }, { opacity: 1, scale: 1, rotation: -1.5, duration: 0.3, ease: "back.out(2)" }, ${n(Math.max(0, t(22)))});`,
    entra('#l3-a', t(24), 1),
    golpe('#l3-b', t(29), -1.5),
    entra('#l3-c', t(32), 1),
    `tl.to("#l3-g1", { opacity: 0, y: -40, duration: 0.14, ease: "power2.in" }, ${n(t(35) - 0.16)});`,
    entra('#l3-d', t(35), -1),
    entra('#l3-e', t(39), 1),
    golpe('#l3-f', t(41), -2),
    `tl.to("#l3-g2", { opacity: 0, y: -40, duration: 0.14, ease: "power2.in" }, ${n(t(43) - 0.16)});`,
    entra('#l3-g', t(43), -1),
    entra('#l3-h', t(45), 1),
    golpe('#l3-i', t(49), -2),
    ...Array.from({ length: CHISPAS }, (_, i) => { const a = (i / CHISPAS) * Math.PI * 2, d = i % 2 ? 150 : 210; return `tl.fromTo("#l3-ch${i}", { opacity: 1, x: 0, y: 0, scale: 0.4 }, { opacity: 0, x: ${n(Math.cos(a) * d)}, y: ${n(Math.sin(a) * d)}, scale: 1.2, duration: 0.55, ease: "power2.out" }, ${n(marca + 0.06)});`; }),
  ]);
}

// ---------- escena 6 · "Racha es una app para llevar tus hábitos y tus tareas." (ámbar, con el dibujo del café) ----------
{
  const t = L(5);
  pieza('e6', `        #e6-col { top: 285px; gap: 10px; }
        #e6-a { font-size: 156px; }
        #e6-b { font-size: 112px; }
        #e6-c { font-size: 184px; }
        #e6-d { font-size: 184px; }
        #e6-v { left: 70px; top: 1010px; width: 940px; height: 524px; }`,
  `        <div class="fondo" style="background: ${AMBAR}"></div>
        <div class="vin" id="e6-v" data-layout-allow-overflow><img id="e6-i" src="assets/d-cafe.jpg" alt="" data-layout-allow-overflow /></div>
        <div class="col" id="e6-col">
          <p class="l" id="e6-a">Racha es una app</p>
          <p class="l" id="e6-b">para llevar</p>
          <p class="l" id="e6-c">tus <span class="negra">hábitos</span></p>
          <p class="l" id="e6-d">y tus <span class="negra">tareas.</span></p>
        </div>`, [
    entra('#e6-a', t(51)),
    `tl.fromTo("#e6-v", { opacity: 0, y: 260, rotation: 6 }, { opacity: 1, y: 0, rotation: -1.5, duration: 0.45, ease: "back.out(1.3)" }, ${n(Math.max(0, t(51) + 0.08))});`,
    `tl.fromTo("#e6-i", { scale: 1.18 }, { scale: 1.02, duration: ${n(dura(5))}, ease: "none" }, 0);`,
    entra('#e6-b', t(55)),
    entra('#e6-c', t(57), -1),
    entra('#e6-d', t(59), 1),
  ]);
}

// ---------- escena 7 · la tarjeta final (la misma de hf-pantalla.mjs, con los tiempos más juntos porque aquí manda la voz) ----------
// Aquí va el precio: Johnatan prefirió no decirlo en la voz. La voz dice "Escríbenos aquí abajo" mientras se arma.
pieza('cierre', `        #c-fondo { position: absolute; inset: 0; background: ${FONDO}; }
        #c-brillo { position: absolute; left: -260px; top: 80px; width: 1600px; height: 1500px; background: radial-gradient(closest-side, rgba(255, 181, 71, 0.30), rgba(255, 181, 71, 0.10) 45%, rgba(255, 181, 71, 0) 72%); opacity: 0; }
        #c-col { position: absolute; left: 0; right: 0; top: 262px; display: flex; flex-direction: column; align-items: center; }
        #c-ico { width: 148px; height: 148px; border-radius: 34px; background: ${AMBAR}; display: flex; align-items: center; justify-content: center; opacity: 0; }
        #c-ico svg { width: 104px; height: 104px; display: block; }
        #c-marca { margin: 18px 0 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 170px; line-height: 1; color: ${CLARO}; opacity: 0; }
        #c-app { margin: 2px 0 0; font-family: "Barlow", sans-serif; font-weight: 500; font-size: 54px; line-height: 1.1; color: ${GRIS}; opacity: 0; }
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
  `tl.fromTo("#c-brillo", { opacity: 0, scale: 0.7 }, { opacity: 0.55, scale: 1, duration: 0.5, ease: "power2.out" }, 0);`,
  `tl.fromTo("#c-ico", { opacity: 0, scale: 0.4, rotation: -14 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2.2)" }, 0);`,
  `tl.fromTo("#c-marca", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.26, ease: "power3.out" }, 0.08);`,
  `tl.fromTo("#c-app", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0.36);`,
  `tl.fromTo("#c-precio", { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power4.in" }, 0.56);`,
  `tl.to("#c-precio", { scale: 1.06, duration: 0.07, ease: "power1.out" }, 0.76);`,
  `tl.to("#c-precio", { scale: 1, duration: 0.22, ease: "power2.out" }, 0.83);`,
  `tl.to("#c-brillo", { opacity: 1, scale: 1.12, duration: 0.12, ease: "power1.out" }, 0.76);`,
  `tl.to("#c-brillo", { opacity: 0.7, scale: 1, duration: 0.6, ease: "power2.out" }, 0.88);`,
  `tl.fromTo("#c-pago", { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 0.22, ease: "power3.out" }, 1.1);`,
  `tl.fromTo("#c-dias", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" }, 1.36);`,
  `tl.fromTo("#c-boton", { opacity: 0, y: 70, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)" }, 1.62);`,
  `tl.fromTo("#c-cel", { opacity: 0, y: 260 }, { opacity: 0.9, y: 0, duration: 0.55, ease: "power3.out" }, 1.62);`,
  `tl.to("#c-flecha", { y: 12, duration: 0.3, ease: "power1.inOut", repeat: 5, yoyo: true }, 2.1);`,
]);

// ---------- el archivo principal ----------
const FONDOS = [['e1', 0], ['e2', 1], ['f3', 2, FIN_CEL - INI_CEL], ['e6', 5], ['cierre', 6]];
const cam = (c, extra) => `{ x: ${c.x}, y: ${c.y}, scale: ${c.scale}${extra ? ', ' + extra : ''} }`;
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · guion 3 · el día malo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      .escena { z-index: 1; }
      #cel { position: absolute; left: 0; top: 0; z-index: 2; width: ${n(ANCHO_CEL)}px; height: ${n(800 * B + 2 * BORDE)}px; padding: ${BORDE}px; border-radius: 104px; background: #24272D; box-shadow: 0 0 0 4px #0F1113, 26px 30px 0 rgba(15, 17, 19, 0.9); transform-origin: 0 0; opacity: 0; visibility: hidden; }
      #cel-pantalla { position: relative; width: 100%; height: 100%; border-radius: 90px; overflow: hidden; background: #0F1113; }
      #cel-video { width: 100%; height: 100%; object-fit: cover; }
      #l3 { z-index: 3; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <!-- Las escenas, una detrás de otra, con corte seco -->
${FONDOS.map(([id, i, d]) => `      <div id="${id}" class="clip escena" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${n(CORTES[i])}" data-duration="${n(d || dura(i))}" data-track-index="0" data-width="1080" data-height="1920"></div>`).join('\n')}

      <!-- El celular con la app en movimiento (la grabación empieza en el segundo ${CEL.desde} del anuncio) -->
      <div id="cel" data-layout-allow-overflow>
        <div id="cel-pantalla">
          <video id="cel-video" class="clip" src="assets/celular.mp4" playsinline muted data-start="${n(INI_CEL)}" data-duration="${n(FIN_CEL - INI_CEL)}" data-media-start="${n(INI_CEL - CEL.desde)}" data-track-index="2"></video>
        </div>
      </div>

      <!-- Los letreros que van encima del celular -->
      <div id="l3" class="clip" data-composition-id="l3" data-composition-src="compositions/l3.html" data-start="${n(INI_CEL)}" data-duration="${n(FIN_CEL - INI_CEL)}" data-track-index="1" data-width="1080" data-height="1920"></div>

      <!-- La voz (Linda Gomez, ElevenLabs) y la música, que ya viene bajita -->
      <audio id="voz" src="assets/voz.wav" data-start="${ENTRA}" data-duration="${n(FIN_VOZ - ENTRA)}" data-media-start="0" data-track-index="3" data-volume="1"></audio>
      <audio id="musica" src="assets/musica.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="4" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      // El celular sube, y después se acerca a lo que la voz va nombrando
      tl.fromTo("#cel", { autoAlpha: 1, x: ${CAM.hoy.x}, y: 1960, scale: 1, rotation: 7 }, ${cam(CAM.hoy, 'autoAlpha: 1, rotation: -1.5, duration: 0.7, ease: "power3.out"')}, ${n(INI_CEL)});
      tl.to("#cel", ${cam(CAM.hoja, 'rotation: 1, duration: 0.6, ease: "power2.inOut"')}, ${n(CEL.toques.enlace + 0.05)});
      tl.to("#cel", ${cam(CAM.hojaCerca, 'rotation: -1, duration: 0.5, ease: "power2.inOut"')}, ${n(T(35) - 0.05)});
      tl.to("#cel", ${cam(CAM.fila, 'rotation: 1, duration: 0.6, ease: "power2.inOut"')}, ${n(CEL.toques.activar + 0.05)});
      tl.to("#cel", ${cam(CAM.filaCerca, 'rotation: -1, duration: 0.45, ease: "back.out(1.4)"')}, ${n(CEL.toques.marcar + 0.1)});
      tl.set("#cel", { autoAlpha: 0 }, ${n(FIN_CEL)});
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
for (const viejo of ['e3', 'e4', 'e5']) fs.rmSync(path.join(P, 'compositions', `${viejo}.html`), { force: true });   // escenas de la versión 1 (capturas quietas)
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s. Escenas en: ${CORTES.map((c) => c.toFixed(2)).join(' · ')}. La voz termina en ${FIN_VOZ.toFixed(2)} s. El celular va de ${INI_CEL.toFixed(2)} a ${FIN_CEL.toFixed(2)} s.`);
