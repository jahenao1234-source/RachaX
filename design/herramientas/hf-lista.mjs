// Arma el proyecto de HyperFrames de un anuncio del formato "lista de presión", sin avatar:
// voz en off (ElevenLabs), una foto quieta por cada frase de la lista (la edición la mueve), y encima las frases
// que caen y se amontonan. Referencia: design/anuncios/referencias/oct9/ref02 (irisroig.es).
// Gancho visual del guion 8 (escogido por Johnatan): "abrir los ojos" + "las frases caen y se amontonan".
// Uso: node design/herramientas/hf-lista.mjs <guion8|guion8-gancho> [--solo-html]
//      después, dentro de campana/guion8/hyperframes-<pieza>: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//
// Cómo está hecho:
// - La voz ya viene sin pausas (voz-sin-pausas.py); el momento de cada palabra sale de su .palabras.json.
//   Todo se amarra a las palabras: cada foto entra con su "Deberías" y cada letrero cuando la voz lo dice.
// - Las fotos llevan el filtro de la campaña (campana/filtro/filtro-campana.txt): Johnatan lo pidió también aquí.
// - Lo pegado a un corte se escribe 4 milésimas antes (PELO), porque si no entra un cuadro tarde.
// - OJO: en un fromTo, lo que deba quedar (la opacidad) va en los DOS lados. Con opacity solo en el "desde", las fotos
//   de prueba (snapshot) mostraban los bloques y el video exportado no. Siempre mirar cuadros del video exportado.
// - La app es de verdad: las pantallas de "Nuevo hábito" (campana/guion1/app, tomadas de la app) y la grabación
//   en movimiento de la Racha de muestra (campana/guion3/app/celular.mp4).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

const NOMBRE = process.argv[2];
const PIEZAS = { 'guion8-gancho': { base: 'guion8', completo: false }, guion8: { base: 'guion8', completo: true } };
if (!PIEZAS[NOMBRE]) { console.log('Uso: node design/herramientas/hf-lista.mjs <' + Object.keys(PIEZAS).join('|') + '> [--solo-html]'); process.exit(1); }
const COMPLETO = PIEZAS[NOMBRE].completo;
const BASE_DIR = path.join(C, PIEZAS[NOMBRE].base);
const VOZ = path.join(BASE_DIR, 'voz', 'deberias-v3-juan-sin-pausas');   // .mp3 y .palabras.json
const IMAGENES = [   // archivo y hacia dónde se acerca la cámara (dónde está el objeto, en % de la foto)
  ['1-despertador.png', 38, 56], ['2-tenis.jpg', 40, 60], ['3-libro.png', 42, 60], ['4-celular.jpg', 52, 68],
  ['5-vaso.jpg', 66, 46], ['6-cama.jpg', 45, 52], ['7-cuaderno.png', 45, 55],
];
const P = path.join(BASE_DIR, COMPLETO ? 'hyperframes' : 'hyperframes-gancho');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const PELO = 0.004;

// ---------- los tiempos, de la voz ----------
const palabras = JSON.parse(fs.readFileSync(VOZ + '.palabras.json', 'utf8')).palabras;
const limpia = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ]/g, '');
const todas = (texto) => palabras.map((p, i) => (limpia(p.t) === texto ? i : -1)).filter((i) => i >= 0);
// La palabra `texto` más cercana después de la número `desde`; si no está, se para: el guion y la voz no coinciden
const B = (texto, desde) => { const i = palabras.findIndex((p, k) => k >= desde && limpia(p.t) === texto); if (i < 0) { console.log(`FALLA: no encontré "${texto}" después de la palabra ${desde}.`); process.exit(1); } return i; };
const D = todas('deberias');
if (D.length !== IMAGENES.length) { console.log(`FALLA: la voz dice "deberías" ${D.length} veces y hay ${IMAGENES.length} fotos.`); process.exit(1); }
const iHace = B('hace', 0), iSi = B('si', iHace), iNoEs = B('no', iSi + 2), iTe = B('te', iNoEs);
const ENTRA = 0.3;                                // la voz arranca 0,3 s después del primer cuadro (mientras se abre el párpado)
const T = (k) => ENTRA + palabras[k].i;
const FRASES = D.map((d, k) => palabras.slice(d + 1, k + 1 < D.length ? D[k + 1] : iHace).map((p) => p.t.replace(/[.,!¡]/g, '')).join(' '));
const ENTRAN = D.map((d, k) => (k === 0 ? 0 : T(d) - 0.1));     // cuándo entra cada foto: un pelo antes de su "Deberías"
const CORTE = ENTRA + palabras[iHace - 1].f + 0.16;              // se acaba la lista: todo se cae
const INI_PREG = CORTE + 0.12;
// El resto del anuncio (solo en la pieza completa)
const w = COMPLETO ? (() => {
  const o = { te: iTe };
  o.faltan = B('faltan', o.te); o.que2 = B('que', o.faltan); o.las = B('las', o.que2); o.enLos = B('en', o.las); o.y = B('y', o.las); o.nunca = B('nunca', o.y);
  o.lo = B('lo', o.nunca); o.un = B('un', o.lo); o.para = B('para', o.un); o.se = B('se', o.para); o.metodo = B('metodo', o.se); o.anti = o.metodo + 1;
  o.de = B('de', o.anti); o.escoges = B('escoges', o.de); o.una = B('una', o.escoges); o.la = B('la', o.una); o.algo = B('algo', o.la); o.todos = B('todos', o.algo);
  o.y2 = B('y', o.todos); o.unaV = B('una', o.y2); o.para2 = B('para', o.unaV); o.el = B('el', B('puedas', o.para2)); o.dentro = B('dentro', o.el); o.unaApp = B('una', o.dentro);
  o.teLo = B('te', o.unaApp); o.yLleva = B('y', o.teLo); o.si2 = B('si', o.yLleva); o.teLa = B('te', o.si2);
  return o;
})() : null;
const FIN_VOZ = ENTRA + palabras[palabras.length - 1].f;
const C3 = T(iTe) - 0.06;
const C4 = COMPLETO ? T(w.las) - 0.06 : 0, C6 = COMPLETO ? T(w.se) - 0.06 : 0, C7 = COMPLETO ? T(w.de) - 0.06 : 0, C8 = COMPLETO ? T(w.el) - 0.06 : 0, C9 = COMPLETO ? T(w.si2) - 0.06 : 0;
const TOTAL = COMPLETO ? FIN_VOZ + 2.4 : T(iTe) + 0.45;          // el gancho termina justo antes de "Te han dicho…"
const VOZ_HASTA = COMPLETO ? palabras[palabras.length - 1].f + 0.6 : palabras[iTe - 1].f + 0.2;

// ---------- los efectos de sonido (los mismos de la campaña) ----------
const VOLUMEN = { whoosh: -6, golpe: -3, pop: -5, caida: -6, toque: -6, logro: -8 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const sonidos = [];
const suena = (s, t, { alGolpe = true, db = 0 } = {}) => sonidos.push({ s, t: Math.max(0, t - (alGolpe ? MEDIDAS[s].golpe_en : 0)), db: VOLUMEN[s] + db });

// La app: la grabación en movimiento (Racha de muestra) y dos pantallas reales de "Nuevo hábito"
const APP = path.join(C, 'guion3', 'app');
const CEL = JSON.parse(fs.readFileSync(path.join(APP, 'celular.json'), 'utf8'));
const V_ACTIVAR = CEL.toques.activar - CEL.inicio, V_MARCA = 7.47;   // segundos de la grabación: se toca "Activar" y se ve marcada la fila (medido en el video)

// ---------- 1. voz, fotos y letras ----------
if (!process.argv.includes('--solo-html')) {
  // La voz, al volumen de los otros anuncios (-20,3 LUFS)
  const medida = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', VOZ + '.mp3', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const lufs = Number(medida.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
  ff(['-i', VOZ + '.mp3', '-t', String(VOZ_HASTA), '-vn', '-af', `volume=${(-20.3 - lufs).toFixed(2)}dB,alimiter=limit=0.89,apad=pad_dur=0.5`, '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  const FILTRO = fs.readFileSync(path.join(C, 'filtro', 'filtro-campana.txt'), 'utf8').trim();
  IMAGENES.forEach(([archivo], k) => ff(['-i', path.join(BASE_DIR, 'imagenes', archivo), '-vf', `scale=1296:2304:force_original_aspect_ratio=increase,crop=1296:2304,${FILTRO}`, '-q:v', '2', path.join(A, `im${k + 1}.jpg`)]));
}
if (COMPLETO) {
  fs.copyFileSync(path.join(APP, 'celular.mp4'), path.join(A, 'celular.mp4'));
  fs.copyFileSync(path.join(C, 'guion1', 'app', 'n1-nombre-y-despues.png'), path.join(A, 'cap-despues.png'));
  fs.copyFileSync(path.join(C, 'guion1', 'app', 'n2-minimo.png'), path.join(A, 'cap-minimo.png'));
  fs.copyFileSync(path.join(AQUI, '..', 'pdf', 'imagenes', '1-portada.jpg'), path.join(A, 'd-portada.jpg'));
}
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow-condensed', 'barlow-condensed-latin-700-normal.woff2', 'barlow-condensed-700.woff2');
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }`;
const AMBAR = '#FFB547', TINTA = '#0F1113', FONDO = '#0B0C0F', CLARO = '#F4EFE6';
const LLAMA = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';
const BASE = `
        .fondo { position: absolute; inset: 0; }
        .col { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; }
        .l { margin: 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; line-height: 1; white-space: nowrap; text-transform: uppercase; text-align: center; opacity: 0; }
        .ambar { display: inline-block; background: ${AMBAR}; color: ${TINTA}; padding: 2px 28px 12px; }
        .negra { display: inline-block; background: ${TINTA}; color: ${AMBAR}; padding: 2px 28px 12px; }
        .caja { display: inline-block; background: ${CLARO}; color: ${TINTA}; padding: 0 26px 10px; border: 6px solid ${TINTA}; box-shadow: 8px 8px 0 ${TINTA}; }
        .caja.amb { background: ${AMBAR}; }`;

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
// Entradas (la opacidad va en los dos lados; nunca se dibujan antes de su momento)
const entra = (sel, t, giro = 0) => `tl.fromTo("${sel}", { opacity: 0, y: 34, scale: 0.94, rotation: ${giro} }, { opacity: 1, y: 0, scale: 1, rotation: ${giro}, duration: 0.2, ease: "back.out(1.7)", immediateRender: false }, ${n(Math.max(0, t))});`;
const golpe = (sel, t, giro = 0) => `tl.fromTo("${sel}", { opacity: 0, scale: 1.5, rotation: ${giro - 6} }, { opacity: 1, scale: 1, rotation: ${giro}, duration: 0.18, ease: "power4.in", immediateRender: false }, ${n(Math.max(0, t - 0.14))});`;
const sale = (sel, t) => `tl.to("${sel}", { opacity: 0, y: -40, duration: 0.14, ease: "power2.in" }, ${n(Math.max(0, t - 0.16))});`;

// ---------- escena 1 · la lista: se abren los ojos y los "deberías" caen y se amontonan ----------
{
  // Los bloques se apilan de arriba hacia abajo, torcidos, y terminan tapando la foto
  const SITIO = [[64, 226, -4], [150, 400, 3], [52, 574, -3], [128, 748, 4], [70, 922, -4], [156, 1096, 3], [60, 1270, -2]];
  const pasos = [
    // El párpado: arranca entreabierto (el primer cuadro no es negro) y se abre mientras la foto se enfoca
    `tl.fromTo("#lid-a", { y: -430 }, { y: -1260, duration: 0.42, ease: "power2.out" }, 0);`,
    `tl.fromTo("#lid-b", { y: 330 }, { y: 1320, duration: 0.42, ease: "power2.out" }, 0);`,
    `tl.fromTo("#enfoque", { filter: "blur(14px) brightness(0.8)" }, { filter: "blur(0px) brightness(1)", duration: 0.5, ease: "power2.out" }, 0);`,
    // La presión sube: todo se va oscureciendo y la cámara se acerca despacio
    `tl.fromTo("#osc", { opacity: 0 }, { opacity: 0.38, duration: ${n(CORTE)}, ease: "power1.in" }, 0);`,
    `tl.fromTo("#cam", { scale: 1 }, { scale: 1.07, duration: ${n(CORTE)}, ease: "none" }, 0);`,
  ];
  IMAGENES.forEach((_, k) => {
    const ini = ENTRAN[k], fin = k + 1 < IMAGENES.length ? ENTRAN[k + 1] : CORTE + 0.2, cae = T(D[k]);
    if (k > 0) pasos.push(`tl.set("#im${k + 1}", { opacity: 1 }, ${n(ini - PELO)});`, `tl.set("#im${k}", { opacity: 0 }, ${n(ini - PELO)});`);
    pasos.push(`tl.fromTo("#im${k + 1}", { scale: 1.03, rotation: ${k % 2 ? 0.6 : -0.6} }, { scale: 1.15, rotation: ${k % 2 ? -0.5 : 0.5}, duration: ${n(fin - ini)}, ease: "none"${k ? ', immediateRender: false' : ''} }, ${n(Math.max(0, ini - PELO))});`);
    // El bloque cae desde arriba y aterriza cuando la voz dice "Deberías"; la cámara recibe el golpe, cada vez más fuerte
    const [, , giro] = SITIO[k];
    pasos.push(`tl.fromTo("#b${k + 1}", { opacity: 1, y: -1500, rotation: ${giro * 3} }, { opacity: 1, y: 0, rotation: ${giro}, duration: 0.2, ease: "power2.in", immediateRender: false }, ${n(Math.max(0, cae - 0.2))});`);
    pasos.push(`tl.fromTo("#b${k + 1}", { scaleY: 0.86 }, { scaleY: 1, duration: 0.16, ease: "back.out(3)", immediateRender: false }, ${n(cae)});`);
    pasos.push(`tl.fromTo("#golpe", { y: ${12 + k * 4}, rotation: ${(k % 2 ? 1 : -1) * (0.3 + k * 0.08)} }, { y: 0, rotation: 0, duration: 0.2, ease: "power2.out", immediateRender: false }, ${n(cae)});`);
    suena('golpe', cae, { db: -7 + k });
  });
  // Se acaba la lista: los bloques se caen todos y queda negro
  SITIO.forEach(([, , giro], k) => pasos.push(`tl.to("#b${k + 1}", { y: 2300, rotation: ${giro * 5}, duration: ${n(0.34 - (6 - k) * 0.015)}, ease: "power2.in" }, ${n(CORTE - 0.05 + (6 - k) * 0.02)});`));
  pasos.push(`tl.to("#cam", { opacity: 0, duration: 0.14, ease: "power1.in" }, ${n(CORTE)});`, `tl.to("#osc", { opacity: 0, duration: 0.14 }, ${n(CORTE)});`);
  suena('whoosh', CORTE + 0.05, { db: -1 }); suena('caida', CORTE + 0.3);

  pieza('lista', `        #golpe, #enfoque { position: absolute; inset: 0; }
        #cam { position: absolute; inset: 0; transform-origin: 50% 55%; }
        .im { position: absolute; left: -108px; top: -192px; width: 1296px; height: 2304px; display: block; opacity: 0; }
        #im1 { opacity: 1; }
${IMAGENES.map(([, x, y], k) => `        #im${k + 1} { transform-origin: ${x}% ${y}%; }`).join('\n')}
        #osc { position: absolute; inset: 0; background: #000; opacity: 0; }
        .lid { position: absolute; left: -260px; width: 1600px; background: #000; }
        #lid-a { top: -400px; height: 1300px; border-radius: 0 0 50% 50% / 0 0 24% 24%; }
        #lid-b { top: 900px; height: 1400px; border-radius: 50% 50% 0 0 / 20% 20% 0 0; }
        .b { position: absolute; opacity: 0; transform-origin: 30% 50%; font-family: "Barlow Condensed", sans-serif; font-weight: 700; text-transform: uppercase; white-space: nowrap; line-height: 0.9; }
        .b b { display: block; font-size: 116px; letter-spacing: -0.01em; color: #fff; text-shadow: 0 6px 0 rgba(0, 0, 0, 0.6), 0 0 34px rgba(0, 0, 0, 0.7); }
        .b span { display: inline-block; margin-top: 4px; padding: 5px 20px 9px; font-size: 54px; line-height: 1; background: ${AMBAR}; color: ${TINTA}; box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.6); }
${SITIO.map(([x, y], k) => `        #b${k + 1} { left: ${x}px; top: ${y}px; z-index: ${10 + k}; }`).join('\n')}`,
  `        <div id="golpe" data-layout-allow-overflow>
          <div id="enfoque" data-layout-allow-overflow>
            <div id="cam" data-layout-allow-overflow>
${IMAGENES.map((_, k) => `              <img class="im" id="im${k + 1}" src="assets/im${k + 1}.jpg" alt="" data-layout-allow-overflow />`).join('\n')}
            </div>
          </div>
        </div>
        <div id="osc"></div>
        <div class="lid" id="lid-a" data-layout-allow-overflow></div>
        <div class="lid" id="lid-b" data-layout-allow-overflow></div>
${FRASES.map((f, k) => `        <div class="b" id="b${k + 1}" data-layout-allow-overflow data-layout-allow-overlap data-layout-allow-occlusion><b data-layout-allow-overlap data-layout-allow-occlusion>Deberías</b><span data-layout-allow-overlap data-layout-allow-occlusion>${f}</span></div>`).join('\n')}`, pasos);
}

// ---------- escena 2 · negro y silencio: "¿Hace cuánto te dices lo mismo?" · "no es por lo que crees" ----------
{
  const t = (k) => T(k) - INI_PREG;
  const preg = palabras.slice(iHace, iSi).map((p) => p.t);
  pieza('pregunta', `        #p-fondo { position: absolute; inset: 0; background: ${FONDO}; }
        #p-q { top: 860px; margin: 0; left: 0; right: 0; position: absolute; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 64px; line-height: 1.15; color: ${CLARO}; }
        #p-q span { opacity: 0; }
        #p-col { top: 800px; gap: 18px; }
        #p-a { font-size: 104px; color: ${CLARO}; }
        #p-b { font-size: 102px; }`,
  `        <div id="p-fondo"></div>
        <p id="p-q">${preg.map((x, i) => `<span id="p-w${i}">${x}</span>`).join(' ')}</p>
        <div class="col" id="p-col">
          <p class="l" id="p-a">Si no lo has hecho,</p>
          <p class="l" id="p-b"><span class="ambar">no es por lo que crees.</span></p>
        </div>`, [
    ...preg.map((_, i) => `tl.to("#p-w${i}", { opacity: 1, duration: 0.12 }, ${n(Math.max(0, t(iHace + i)))});`),
    `tl.to("#p-q", { y: -250, scale: 0.78, opacity: 0.45, duration: 0.3, ease: "power2.inOut" }, ${n(t(iSi) - 0.2)});`,
    entra('#p-a', t(iSi)),
    golpe('#p-b', t(iNoEs), -2),
  ]);
  suena('pop', T(iNoEs) + 0.04);
}

// =====================================================================================================
// El resto del anuncio
// =====================================================================================================
// El celular: la pantalla de 390 px de ancho se ve de 858 px, con 14 px de marco
const BZ = 2.2, BORDE = 14, ANCHO_CEL = 390 * BZ + 2 * BORDE, ALTO_CEL = 800 * BZ + 2 * BORDE;
// Dónde poner el celular para que el punto `y` de la app quede a la altura `Y` del video, con el celular `s` veces más grande
const camara = (s, y, Y) => ({ x: n((1080 - ANCHO_CEL * s) / 2), y: n(Y - (BORDE + y * BZ) * s), scale: s });
const MS = COMPLETO ? V_MARCA - (T(w.yLleva) + 0.25 - C8) : 0;     // desde qué segundo de la grabación se muestra: la fila se marca en "y lleva la cuenta"
if (COMPLETO) {
  // ---------- escena 3 · "Te han dicho que te faltan ganas. Que te falta disciplina." ----------
  {
    const t = (k) => T(k) - C3;
    pieza('creencia', `        #c-col { top: 600px; gap: 34px; }
        #c-a { font-size: 82px; color: ${CLARO}; letter-spacing: 0.02em; }
        #c-b { font-size: 132px; }
        #c-c { font-size: 118px; }
        .papel { display: inline-block; background: ${CLARO}; color: ${TINTA}; padding: 6px 34px 16px; box-shadow: 10px 10px 0 rgba(255, 181, 71, 0.9); }`,
    `        <div class="fondo" style="background: ${FONDO}"></div>
        <div class="col" id="c-col">
          <p class="l" id="c-a">Te han dicho que</p>
          <p class="l" id="c-b"><span class="papel">«te faltan ganas»</span></p>
          <p class="l" id="c-c"><span class="papel">«te falta disciplina»</span></p>
        </div>`, [
      `tl.fromTo("#c-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, ${n(Math.max(0, t(w.te)))});`,
      golpe('#c-b', t(w.faltan - 1), -3),
      golpe('#c-c', t(w.que2), 2),
    ]);
    suena('whoosh', C3, { db: -3 }); suena('pop', T(w.faltan - 1)); suena('pop', T(w.que2), { db: 1 });
  }

  // ---------- escenas 4 y 5 · los días buenos y los días malos ----------
  {
    const t = (k) => T(k) - C4;
    const BUENOS = [0, 1, 2, 4, 5], MALOS = [3, 6], DIA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const pasos = [
      entra('#d-a', t(w.las)),
      golpe('#d-b', t(w.enLos + 1), -2),
      ...BUENOS.map((d, i) => `tl.fromTo("#d-o${d}", { scale: 0.4, backgroundColor: "rgba(255,181,71,0)" }, { scale: 1, backgroundColor: "${AMBAR}", duration: 0.2, ease: "back.out(2.4)", immediateRender: false }, ${n(t(w.las) + 0.25 + i * 0.16)});`),
      ...BUENOS.map((d, i) => `tl.fromTo("#d-o${d} svg", { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, ${n(t(w.las) + 0.3 + i * 0.16)});`),
      // "Y los días buenos nunca fueron el problema."
      sale('#d-g1', t(w.y)),
      entra('#d-c', t(w.y)),
      golpe('#d-d', t(w.nunca), 1.5),
      ...MALOS.map((d) => `tl.fromTo("#d-o${d}", { scale: 1 }, { scale: 1.25, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 3, immediateRender: false }, ${n(t(w.nunca) + 0.1)});`),
      // "Lo que te falta es un sistema para los días malos."
      sale('#d-g2', t(w.lo)),
      entra('#d-e', t(w.lo)),
      golpe('#d-f', t(w.un), -2),
      entra('#d-g', t(w.para)),
      ...BUENOS.map((d) => `tl.to("#d-o${d}", { opacity: 0.22, duration: 0.3 }, ${n(t(w.para))});`),
      ...MALOS.map((d) => `tl.to("#d-o${d}", { borderColor: "${AMBAR}", scale: 1.3, duration: 0.25, ease: "back.out(2)" }, ${n(t(w.para))});`),
      ...MALOS.map((d) => `tl.fromTo("#d-m${d}", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2, immediateRender: false }, ${n(t(w.para) + 0.12)});`),
    ];
    BUENOS.forEach((_, i) => suena('toque', C4 + t(w.las) + 0.25 + i * 0.16, { db: -5 }));
    suena('whoosh', C4, { db: -3 }); suena('golpe', T(w.nunca), { db: -3 }); suena('golpe', T(w.un), { db: 1 }); suena('pop', T(w.para));
    pieza('dias', `        .g { top: 330px; gap: 20px; }
        #d-a, #d-c, #d-e { font-size: 92px; color: ${CLARO}; }
        #d-b { font-size: 138px; }
        #d-d { font-size: 96px; }
        #d-f { font-size: 230px; }
        #d-g { font-size: 96px; color: ${CLARO}; }
        #d-fila { position: absolute; left: 82px; top: 1010px; display: flex; gap: 22px; }
        .dia { width: 112px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .dia i { font: 600 40px "Barlow", sans-serif; font-style: normal; color: ${CLARO}; opacity: 0.6; }
        .o { width: 112px; height: 112px; border-radius: 56px; border: 6px dashed rgba(244, 239, 230, 0.45); display: flex; align-items: center; justify-content: center; }
        .o svg { width: 62px; height: 62px; opacity: 0; }
        .malo { font: 600 34px "Barlow", sans-serif; color: ${AMBAR}; white-space: nowrap; opacity: 0; }`,
    `        <div class="fondo" style="background: ${FONDO}"></div>
        <div class="col g" id="d-g1">
          <p class="l" id="d-a">Las ganas sirven</p>
          <p class="l" id="d-b"><span class="ambar">en los días buenos.</span></p>
        </div>
        <div class="col g" id="d-g2">
          <p class="l" id="d-c">Y los días buenos</p>
          <p class="l" id="d-d"><span class="caja">nunca fueron el problema.</span></p>
        </div>
        <div class="col g" id="d-g3">
          <p class="l" id="d-e">Lo que te falta es</p>
          <p class="l" id="d-f"><span class="ambar">un sistema</span></p>
          <p class="l" id="d-g">para los días malos.</p>
        </div>
        <div id="d-fila">
${DIA.map((d, i) => `          <div class="dia"><i>${d}</i><div class="o" id="d-o${i}"><svg viewBox="0 0 24 24" fill="none" stroke="${TINTA}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>${MALOS.includes(i) ? `<span class="malo" id="d-m${i}" data-layout-allow-overflow>día malo</span>` : ''}</div>`).join('\n')}
        </div>`, pasos);
  }

  // ---------- escena 6 · "Se llama Método Anti-Abandono." (ámbar, con el dibujo de la portada del PDF) ----------
  {
    const t = (k) => T(k) - C6;
    pieza('nombre', `        #n-col { top: 290px; gap: 8px; }
        #n-a { font-size: 86px; color: ${TINTA}; letter-spacing: 0.04em; }
        #n-b { font-size: 236px; color: ${TINTA}; }
        #n-c { font-size: 150px; }
        #n-v { position: absolute; left: 150px; top: 900px; width: 780px; height: 660px; overflow: hidden; border: 10px solid ${TINTA}; box-shadow: 18px 18px 0 ${TINTA}; background: ${AMBAR}; opacity: 0; }
        #n-v img { position: absolute; left: 0; top: -60px; width: 100%; display: block; }`,
    `        <div class="fondo" style="background: ${AMBAR}"></div>
        <div id="n-v" data-layout-allow-overflow><img id="n-i" src="assets/d-portada.jpg" alt="" data-layout-allow-overflow /></div>
        <div class="col" id="n-col">
          <p class="l" id="n-a">Se llama</p>
          <p class="l" id="n-b">Método</p>
          <p class="l" id="n-c"><span class="negra">Anti-Abandono</span></p>
        </div>`, [
      `tl.fromTo("#n-a", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, ${n(Math.max(0, t(w.se)))});`,
      `tl.fromTo("#n-v", { opacity: 0, y: 300, rotation: 7 }, { opacity: 1, y: 0, rotation: -2, duration: 0.42, ease: "back.out(1.3)" }, 0.05);`,
      `tl.fromTo("#n-i", { scale: 1.16 }, { scale: 1.02, duration: ${n(C7 - C6)}, ease: "none" }, 0);`,
      golpe('#n-b', t(w.metodo), -2),
      golpe('#n-c', t(w.anti), 1.5),
    ]);
    suena('whoosh', C6, { db: -1 }); suena('golpe', T(w.metodo)); suena('golpe', T(w.anti), { db: 1 });
  }

  // ---------- escenas 7 a 9 · el fondo claro, la lista de la que se escoge una cosa, y los letreros ----------
  {
    const t = (k) => T(k) - C7;
    const ESCOGIDA = FRASES.findIndex((f) => limpia(f) === 'leermas');
    const pasos = [
      `tl.fromTo("#f-bola", { scale: 0.2 }, { scale: 1, duration: 0.7, ease: "power3.out" }, 0);`,
      `tl.to("#f-bola", { scale: 1.14, y: -140, duration: ${n(TOTAL - C7 - 0.7)}, ease: "sine.inOut" }, 0.7);`,
      // La lista vuelve, pequeña; al "escoges una sola cosa" se apagan todas menos una
      ...FRASES.map((_, k) => `tl.fromTo("#f-c${k}", { opacity: 0, y: -60, rotation: ${k % 2 ? 4 : -4} }, { opacity: 1, y: 0, rotation: ${k % 2 ? 1.5 : -1.5}, duration: 0.2, ease: "back.out(1.8)" }, ${n(Math.max(0, t(w.de)) + 0.04 + k * 0.07)});`),
      ...FRASES.map((_, k) => (k === ESCOGIDA
        ? `tl.to("#f-c${k}", { scale: 2.1, y: ${n((3 - k) * 104)}, rotation: -2, duration: 0.3, ease: "back.out(1.8)" }, ${n(t(w.una))});`
        : `tl.to("#f-c${k}", { y: 1300, rotation: ${k % 2 ? 14 : -14}, opacity: 0, duration: 0.4, ease: "power2.in" }, ${n(t(w.escoges) + k * 0.03)});`)),
      `tl.to("#f-c${ESCOGIDA}", { opacity: 0, y: ${n((3 - ESCOGIDA) * 104 - 80)}, duration: 0.18, ease: "power2.in" }, ${n(t(w.la) - 0.24)});`,
    ];
    suena('whoosh', C7, { db: -2 }); suena('pop', T(w.de) + 0.1, { db: -2 }); suena('pop', T(w.una), { db: 1 });
    pieza('fondo', `        #f-bola { position: absolute; left: -110px; top: 560px; width: 1300px; height: 1300px; border-radius: 650px; background: ${AMBAR}; }
        #f-puntos { position: absolute; inset: 0; background-image: radial-gradient(rgba(15, 17, 19, 0.16) 3px, transparent 3.5px); background-size: 34px 34px; }
        #f-lista { position: absolute; left: 0; right: 0; top: 700px; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .chip { margin: 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 58px; line-height: 1; text-transform: uppercase; white-space: nowrap; background: ${TINTA}; color: ${CLARO}; padding: 8px 26px 14px; opacity: 0; }
        #f-c${ESCOGIDA} { background: ${TINTA}; color: ${AMBAR}; }`,
    `        <div class="fondo" style="background: ${CLARO}"></div>
        <div id="f-puntos"></div>
        <div id="f-bola" data-layout-allow-overflow></div>
        <div id="f-lista">
${FRASES.map((f, k) => `          <p class="chip" id="f-c${k}" data-layout-allow-overflow data-layout-allow-overlap>${f}</p>`).join('\n')}
        </div>`, pasos);

    // Los letreros (van por encima del celular): las mismas palabras de la voz
    const marca = C8 + (V_MARCA - MS) - C7;
    const grupo = (id, ini, fin, filas) => [
      ...filas.map(([sel, k, tipo, giro]) => (tipo === 'golpe' ? golpe(sel, t(k), giro) : entra(sel, t(k), giro))),
      ...(fin ? [sale(`#${id}`, fin)] : []),
    ];
    pieza('letreros', `        .grupo { top: 276px; gap: 14px; }
        .n1 { font-size: 84px; }
        .n2 { font-size: 104px; }
        .num { display: inline-flex; align-items: center; justify-content: center; width: 96px; height: 96px; border-radius: 48px; background: ${TINTA}; color: ${AMBAR}; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 76px; line-height: 1; margin-right: 18px; vertical-align: middle; padding-bottom: 8px; }
        #t-marca { display: flex; align-items: center; gap: 18px; opacity: 0; }
        #t-ico { width: 116px; height: 116px; border-radius: 26px; background: ${AMBAR}; border: 6px solid ${TINTA}; display: flex; align-items: center; justify-content: center; }
        #t-ico svg { width: 78px; height: 78px; display: block; }
        #t-marca .l { font-size: 112px; opacity: 1; }
        #t-pastilla { position: absolute; left: 0; right: 0; top: 1136px; display: flex; justify-content: center; opacity: 0; }
        #t-pastilla div { display: flex; flex-direction: column; align-items: center; gap: 6px; background: ${AMBAR}; color: ${TINTA}; border: 6px solid ${TINTA}; border-radius: 40px; padding: 20px 46px 26px; box-shadow: 10px 10px 0 ${TINTA}; font-family: "Barlow", sans-serif; font-weight: 600; white-space: nowrap; }
        #t-pastilla b { font-size: 46px; color: ${TINTA}; font-weight: 600; }
        #t-pastilla span { font-size: 42px; }`,
    `        <div class="col grupo" id="t-g1">
          <p class="l n1" id="t-a"><span class="num">1</span><span class="caja">De toda esa lista</span></p>
          <p class="l n2" id="t-b"><span class="caja amb">escoges una sola cosa.</span></p>
        </div>
        <div class="col grupo" id="t-g2">
          <p class="l n1" id="t-c"><span class="num">2</span><span class="caja">La haces después de</span></p>
          <p class="l n1" id="t-d"><span class="caja amb">algo que ya haces</span></p>
          <p class="l n1" id="t-e"><span class="caja">todos los días.</span></p>
        </div>
        <div class="col grupo" id="t-g3">
          <p class="l n1" id="t-f"><span class="num">3</span><span class="caja">Y le dejas</span></p>
          <p class="l n1" id="t-g"><span class="caja amb">una versión pequeña</span></p>
          <p class="l n1" id="t-h"><span class="caja">para el día que no puedas.</span></p>
        </div>
        <div class="col grupo" id="t-g4">
          <p class="l n1" id="t-i"><span class="caja">El método viene dentro de</span></p>
          <div id="t-marca">
            <div id="t-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${TINTA}" d="${LLAMA}" /></svg></div>
            <p class="l"><span class="caja amb">Racha,</span></p>
          </div>
        </div>
        <div class="col grupo" id="t-g5">
          <p class="l n1" id="t-j"><span class="caja">una app que</span></p>
          <p class="l n1" id="t-k"><span class="caja amb">te lo recuerda</span></p>
          <p class="l n1" id="t-m"><span class="caja">y lleva la cuenta por ti.</span></p>
        </div>
        <div class="col grupo" id="t-g6">
          <p class="l n1" id="t-n"><span class="caja">Si quieres verla por dentro,</span></p>
          <p class="l" id="t-o" style="font-size: 150px"><span class="negra">te la muestro.</span></p>
        </div>
        <div id="t-pastilla"><div><b>Método Anti-Abandono · app Racha</b><span>$37.900 · un solo pago</span></div></div>`, [
      ...grupo('t-g1', 0, t(w.la), [['#t-a', w.de, 'entra', -1], ['#t-b', w.escoges, 'golpe', 1.5]]),
      ...grupo('t-g2', 0, t(w.y2), [['#t-c', w.la, 'entra', 1], ['#t-d', w.algo, 'golpe', -1.5], ['#t-e', w.todos, 'entra', 1]]),
      ...grupo('t-g3', 0, t(w.el), [['#t-f', w.y2, 'entra', -1], ['#t-g', w.unaV, 'golpe', 1.5], ['#t-h', w.para2, 'entra', -1]]),
      ...grupo('t-g4', 0, t(w.unaApp), [['#t-i', w.el, 'entra', 1]]),
      `tl.fromTo("#t-marca", { opacity: 0, scale: 0.5, rotation: -8 }, { opacity: 1, scale: 1, rotation: -1.5, duration: 0.3, ease: "back.out(2)", immediateRender: false }, ${n(t(w.dentro + 2) - 0.1)});`,
      ...grupo('t-g5', 0, t(w.si2), [['#t-j', w.unaApp, 'entra', -1], ['#t-k', w.teLo, 'golpe', 1.5], ['#t-m', w.yLleva, 'entra', -1]]),
      ...grupo('t-g6', 0, 0, [['#t-n', w.si2, 'entra', 1], ['#t-o', w.teLa, 'golpe', -2]]),
      `tl.fromTo("#t-pastilla", { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)", immediateRender: false }, ${n(t(w.teLa) + 0.45)});`,
    ]);
    suena('pop', T(w.algo)); suena('pop', T(w.unaV)); suena('pop', T(w.dentro + 2), { db: 1 }); suena('pop', T(w.teLo));
    suena('logro', C7 + marca + 0.02, { db: -1 }); suena('golpe', T(w.teLa)); suena('pop', T(w.teLa) + 0.5);
  }
}

const ACTIVAR = COMPLETO ? C8 + (V_ACTIVAR - MS) : 0, MARCA = COMPLETO ? C8 + (V_MARCA - MS) : 0;
// El celular: entra, cambia de pantalla y se toca "Activar"
if (COMPLETO) { suena('whoosh', T(w.la) - 0.05, { db: -3 }); suena('toque', T(w.y2)); suena('toque', ACTIVAR, { alGolpe: false }); }

// ---------- la mezcla de los efectos ----------
{
  const SR = 48000, mezcla = new Float32Array(Math.ceil(TOTAL * SR) * 2);
  sonidos.forEach((ev) => {
    const b = fs.readFileSync(path.join(SON, ev.s + '.wav')), datos = b.subarray(b.indexOf('data') + 8), g = 10 ** (ev.db / 20) / 32768, en = Math.round(ev.t * SR) * 2, largo = datos.length / 2;
    for (let i = 0; i < largo && en + i < mezcla.length; i++) mezcla[en + i] += datos.readInt16LE(i * 2) * g;
  });
  const sal = Buffer.alloc(44 + mezcla.length * 2);
  sal.write('RIFF', 0); sal.writeUInt32LE(36 + mezcla.length * 2, 4); sal.write('WAVEfmt ', 8); sal.writeUInt32LE(16, 16); sal.writeUInt16LE(1, 20); sal.writeUInt16LE(2, 22);
  sal.writeUInt32LE(SR, 24); sal.writeUInt32LE(SR * 4, 28); sal.writeUInt16LE(4, 32); sal.writeUInt16LE(16, 34); sal.write('data', 36); sal.writeUInt32LE(mezcla.length * 2, 40);
  mezcla.forEach((v, i) => sal.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(A, 'efectos.wav'), sal);
  fs.writeFileSync(path.join(BASE_DIR, `${NOMBRE}-sonidos.txt`), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(8)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}

// ---------- el archivo principal ----------
const clip = (id, ini, fin, pista, z) => `      <div id="${id}" class="clip" style="z-index: ${z}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${n(ini)}" data-duration="${n(fin - ini)}" data-track-index="${pista}" data-width="1080" data-height="1920"></div>`;
const cam = (c, extra) => `{ x: ${c.x}, y: ${c.y}, scale: ${c.scale}${extra ? ', ' + extra : ''} }`;
// A dónde mira la cámara del celular en cada momento (y de la app → altura del video)
const CAM = COMPLETO ? {
  despues: camara(1, 346, 1250),        // "¿Después de qué? · Después de tomar café"
  minima: camara(1.06, 346, 1250),         // "Tu versión mínima · 1 página"
  hoja: camara(1.05, CEL.cajas.hojaLeer.cy, 1150),
  fila: camara(1.12, CEL.cajas.fila.cy, 1120),
  filaCerca: camara(1.24, CEL.cajas.fila.cy, 1120),
  cierre: camara(0.9, 60, 790),
} : null;
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · ${NOMBRE} · Deberías</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      #cel { position: absolute; left: 0; top: 0; z-index: 5; width: ${n(ANCHO_CEL)}px; height: ${n(ALTO_CEL)}px; padding: ${BORDE}px; border-radius: 104px; background: #24272D; box-shadow: 0 0 0 4px #0F1113, 26px 30px 0 rgba(15, 17, 19, 0.9); transform-origin: 0 0; opacity: 0; visibility: hidden; }
      #cel-pantalla { position: relative; width: 100%; height: 100%; border-radius: 90px; overflow: hidden; background: #0F1113; }
      #cel-video { width: 100%; height: 100%; object-fit: cover; opacity: 0; }
      .cap { position: absolute; left: 0; top: 0; width: 100%; display: block; opacity: 0; }
      #cel-aro { position: absolute; left: 36px; top: 702px; width: 786px; height: 120px; border: 7px solid #FFB547; border-radius: 30px; box-shadow: 0 0 0 8px rgba(255, 181, 71, 0.25); opacity: 0; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
${clip('pregunta', INI_PREG, COMPLETO ? C3 : TOTAL, 0, 1)}
${clip('lista', 0, CORTE + 0.6, 1, 2)}${COMPLETO ? `
${clip('creencia', C3, C4, 2, 1)}
${clip('dias', C4, C6, 0, 1)}
${clip('nombre', C6, C7, 2, 1)}
${clip('fondo', C7, TOTAL, 0, 1)}
${clip('letreros', C7, TOTAL, 6, 8)}

      <!-- El celular: dos pantallas reales de "Nuevo hábito" y después la app en movimiento -->
      <div id="cel" data-layout-allow-overflow>
        <div id="cel-pantalla">
          <img class="cap" id="cap-despues" src="assets/cap-despues.png" alt="" />
          <img class="cap" id="cap-minimo" src="assets/cap-minimo.png" alt="" />
          <div id="cel-aro"></div>
          <video id="cel-video" class="clip" src="assets/celular.mp4" playsinline muted data-start="${n(C8)}" data-duration="${n(TOTAL - C8)}" data-media-start="${n(MS)}" data-track-index="7"></video>
        </div>
      </div>` : ''}

      <audio id="voz" src="assets/voz.wav" data-start="${ENTRA}" data-duration="${n(Math.min(TOTAL - ENTRA, VOZ_HASTA + 0.45))}" data-media-start="0" data-track-index="3" data-volume="1"></audio>
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });${COMPLETO ? `
      // El celular sube con la pantalla de "¿Después de qué?", pasa a la versión mínima, y después es la app en movimiento
      tl.set("#cap-despues", { opacity: 1 }, ${n(T(w.la) - 0.3)});
      tl.fromTo("#cel", { autoAlpha: 1, x: ${CAM.despues.x}, y: 1960, scale: ${CAM.despues.scale}, rotation: 7 }, ${cam(CAM.despues, 'autoAlpha: 1, rotation: -1.5, duration: 0.55, ease: "power3.out", immediateRender: false')}, ${n(T(w.la) - 0.2)});
      tl.to("#cel", ${cam({ ...CAM.despues, scale: CAM.despues.scale }, 'rotation: -0.5, duration: 2, ease: "none"')}, ${n(T(w.la) + 0.4)});
      tl.set("#cap-minimo", { opacity: 1 }, ${n(T(w.y2) - PELO)});
      tl.set("#cap-despues", { opacity: 0 }, ${n(T(w.y2) - PELO)});
      tl.to("#cel", ${cam(CAM.minima, 'rotation: 1.2, duration: 0.45, ease: "back.out(1.4)"')}, ${n(T(w.y2) - PELO)});
      tl.fromTo("#cel-aro", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2)", immediateRender: false }, ${n(T(w.algo) - 0.05)});
      tl.fromTo("#cel-aro", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2)", immediateRender: false }, ${n(T(w.unaV) - 0.05)});
      tl.set("#cel-aro", { opacity: 0 }, ${n(T(w.y2) - PELO)});
      tl.set("#cel-aro", { opacity: 0 }, ${n(C8 - PELO)});
      tl.set("#cel-video", { opacity: 1 }, ${n(C8 - PELO)});
      tl.set("#cap-minimo", { opacity: 0 }, ${n(C8 - PELO)});
      tl.to("#cel", ${cam(CAM.hoja, 'rotation: -1, duration: 0.5, ease: "power2.inOut"')}, ${n(C8 - PELO)});
      tl.to("#cel", ${cam(CAM.fila, 'rotation: 1, duration: 0.6, ease: "power2.inOut"')}, ${n(ACTIVAR + 0.05)});
      tl.to("#cel", ${cam(CAM.filaCerca, 'rotation: -1, duration: 0.4, ease: "back.out(1.4)"')}, ${n(MARCA + 0.05)});
      tl.to("#cel", ${cam(CAM.cierre, 'rotation: 0, duration: 0.6, ease: "power2.inOut"')}, ${n(C9 - 0.1)});` : ''}
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
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s. Fotos en: ${ENTRAN.map((c) => c.toFixed(2)).join(' · ')}. La lista se cae en ${CORTE.toFixed(2)} s; la pregunta entra en ${T(iHace).toFixed(2)} s; "no es por lo que crees" en ${T(iNoEs).toFixed(2)} s.`);
if (COMPLETO) console.log(`Escenas: creencia ${C3.toFixed(2)} · días ${C4.toFixed(2)} · nombre ${C6.toFixed(2)} · pasos ${C7.toFixed(2)} · Racha ${C8.toFixed(2)} · cierre ${C9.toFixed(2)}. La grabación de la app empieza en su segundo ${MS.toFixed(2)}; "Activar" en ${ACTIVAR.toFixed(2)} s y la fila marcada en ${MARCA.toFixed(2)} s. Efectos: ${sonidos.length}.`);
