// Arma el proyecto de HyperFrames de un anuncio del estilo "Viral" (nombre de Johnatan; referencia:
// design/anuncios/referencias/oct8/ref8-analisis.md): una persona hablando de cerca, con cortes secos,
// acercamientos de golpe, destellos, blanco y negro para "la voz del otro", tarjetas que saltan,
// palabras grandes en ámbar y subtítulos pequeños.
// Uso: node design/herramientas/hf-viral.mjs <pieza> [--solo-html]      (piezas: guion5, guion5-gancho)
//      después, dentro de la carpeta del proyecto: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//
// Cómo está hecho (sale de hf-explica.mjs):
// - Cada pedazo hablado es [archivo, palabra inicial, palabra final, opciones]. Así se quita lo que Lina
//   agregó por su cuenta o repitió: solo entra el tramo de palabras que se pide. Dentro del tramo, las pausas
//   de más de PAUSA segundos también se cortan.
// - Todo lo demás se ubica por palabras: [número del pedazo hablado, número de palabra dentro de su clip].
// - Los clips de persona llevan el filtro de la campaña. La app no.
// - Transiciones (solo en los cambios de parte; lo demás son cortes secos): 'barrido' (la imagen se va de lado,
//   borrosa, y la nueva entra del otro lado), 'zoom' (se acerca borrosa y la nueva se asienta) y 'salto' (tiembla).
//   Se hacen sobre #tr, un cuadro que envuelve el video, para no chocar con los acercamientos de #persona.
// - Efectos de sonido: salen de campana/sonidos/*.wav (sonidos-campana.sh + sonidos-preparar.py). Cada cosa que
//   pasa en pantalla pone el suyo y se mezclan en assets/efectos.wav. Con SIN_SONIDOS=1 no se ponen.
// - Dónde va cada cosa (1080 x 1920): la cara de Lina queda arriba; las tarjetas saltan a la altura del pecho
//   (y = 870 a 1150), nunca sobre la cara; los subtítulos van en y = 1190; todo dentro de la zona segura de Reels.
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

// El gancho: Lina acomoda el celular y dice "Te dijeron que para crear un hábito no puedes fallar ni un día";
// destello; "Por creer eso, yo abandoné casi todo lo que empecé". (La copia de Lina al oído se probó y Johnatan
// la rechazó; el clip quedó en guion5/clips/copia-susurra-recorte.webm.)
const GANCHO = {
  hablados: [
    ['1a-te-dijeron', 0, 6, { antes: 0.5 }],      // 0 · "Te dijeron que para crear un hábito"
    ['1a-te-dijeron', 10, 15],                    // 1 · el segundo "no puedes fallar ni un día" (el primero se quita: pedido de Johnatan)
    ['1b-por-creer-eso', 13, 22],                 // 2 · sin lo que Lina agregó al comienzo
  ],
  acercar: [{ en: [2, 13], escala: 1.14 }, { en: [2, 17], escala: 1.3 }],
  destellos: [[2, 13]],
  grandes: [{ de: [1, 10], a: [1, 15], arriba: 'no puedes fallar', grande: 'NI UN DÍA' }],
};

const PIEZAS = {
  'guion5-gancho': { carpeta: 'guion5', proyecto: 'hyperframes-gancho', titulo: 'guion 5 · el gancho', arranque: true, ...GANCHO, claves: ['hábito', 'abandoné'], cola: 0.5 },

  // Guion 5 "Otra vez desde cero", versión 3 (campana/guiones.md). Qué dijo Lina en cada clip: campana/guion5-textos-flow.md.
  guion5: {
    carpeta: 'guion5', proyecto: 'hyperframes', titulo: 'guion 5 · otra vez desde cero', arranque: true,
    hablados: [
      ...GANCHO.hablados,
      ['2a-deje', 7, 11],                           // 3 · "dejé el gimnasio, dejé cursos,"
      ['2a-deje', 14, 19],                          // 4 · "y dejé libros por la mitad." (se salta el "dejé cursos" repetido; los dedos cuadran: 1, 2, 3)
      ['2b-iba-bien', 0, 12],                       // 5
      ['3a-las-aplicaciones', 0, 16],               // 6
      ['3b-el-lunes', 10, 17],                      // 7 · "y yo decía, el lunes arranco otra vez." (en blanco y negro)
      ['4-entendi-algo', 12, 29],                   // 8
      ['5-el-problema', 0, 15],                     // 9
      ['6-racha', 26, 44],                          // 10
      ['7-version-pequena', 6, 17],                 // 11
      ['8-diez-paginas', 18, 28],                   // 12
      ['9-te-la-muestro', 7, 16, { despues: 1.7 }], // 13 · se queda sonriendo
    ],
    acercar: [
      ...GANCHO.acercar,
      { en: [3, 7], escala: 1.16, sube: -160 }, { en: [5, 0], escala: 1.16 },   // en el 2a Lina sube: abajo quedan las tres tarjetas
      { en: [6, 0], escala: 1 },
      { en: [7, 10], escala: 1.1 },
      { en: [8, 12], escala: 1 }, { en: [8, 16], escala: 1.24 }, { en: [8, 19], escala: 1 },
      { en: [9, 0], escala: 1.12 }, { en: [9, 5], escala: 1.26 },
      { en: [10, 26], escala: 1 }, { en: [11, 6], escala: 1.1 }, { en: [12, 18], escala: 1 }, { en: [13, 14], escala: 1.12 },
    ],
    destellos: [...GANCHO.destellos, [8, 12], [10, 26]],
    byn: [{ de: [7, 10], a: [7, 17] }],
    // Transiciones en los cambios de parte: del gancho a la historia, a "las aplicaciones", a "el lunes arranco" y de Racha a la versión pequeña
    transiciones: [{ en: [3, 7], tipo: 'barrido', lado: -1 }, { en: [6, 0], tipo: 'zoom' }, { en: [7, 10], tipo: 'salto' }, { en: [11, 6], tipo: 'barrido', lado: 1 }],
    grandes: [...GANCHO.grandes, { de: [9, 0], a: [9, 4], arriba: 'el problema nunca fue', grande: 'FALLAR' }],
    tarjetas: [
      { tipo: 'iconos', iconos: [['dumbbell', [3, 9]], ['graduation-cap', [3, 11]], ['book-open', [4, 16]]], a: [4, 19] },
      // TEXTOS PROVISIONALES (falta que Johnatan los apruebe): "días seguidos", la tarjeta del estudio y la pastilla
      { tipo: 'contador', de: [6, 7], a: [6, 16], cae: [6, 14], desdeNumero: 23, rotulo: 'días seguidos' },
      { tipo: 'estudio', fondo: true, de: [8, 19], a: [8, 29], rotulo: 'ESTUDIO CON 96 PERSONAS', texto: 'Faltar un día no afectó el hábito', fuente: 'Lally y otros, 2010 · University College London' },
      { tipo: 'marca', fondo: true, de: [10, 29], a: [10, 31] },
      { tipo: 'pastilla', de: [13, 14], texto: 'Racha · app · <b>$37.900</b>, un solo pago' },
    ],
    // La app en movimiento (guion3/app/celular.mp4, grabada de la Racha de muestra): en una tarjeta con forma de celular
    apps: [
      { archivo: path.join(C, 'guion3', 'app', 'celular.mp4'), desde: 1.55, de: [11, 10], a: [11, 17], toques: [2.269] },   // se toca "¿Día pesado?" y sube la hoja con "Mínimo: una página"
      { archivo: path.join(C, 'guion3', 'app', 'celular.mp4'), desde: 6.35, de: [12, 26], a: [13, 13], toques: [7.112], logro: 7.3 },   // baja a "Leer 10 páginas" y se marca: "+5 ganados · versión mínima"
    ],
    claves: ['hábito', 'abandoné', 'gimnasio', 'cursos', 'libros', 'nada', 'cero', 'lunes', 'siempre', 'malos', 'perdía', 'racha', 'pequeña', 'muestro'],
    reemplazos: { 10: 'diez' },
    cola: 0.25,
  },
};

const NOMBRE = process.argv[2];
const pz = PIEZAS[NOMBRE];
if (!pz) { console.log('Uso: node design/herramientas/hf-viral.mjs <' + Object.keys(PIEZAS).join(' | ') + '> [--solo-html]'); process.exit(1); }
const BASE = path.join(C, pz.carpeta);
const P = path.join(BASE, pz.proyecto);
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });

// ---------- 1. los pedazos de voz ----------
const pedazos = []; const palabras = [];   // palabras: { t, h, k, i, f } con los tiempos YA en el anuncio
let cursor = 0;
pz.hablados.forEach(([archivo, desde, hasta, op = {}], h) => {
  const todas = JSON.parse(fs.readFileSync(path.join(BASE, 'clips', archivo + '.palabras.json'), 'utf8')).palabras;
  const usadas = todas.map((w, k) => ({ ...w, k })).slice(desde ?? 0, (hasta ?? todas.length - 1) + 1);
  const tramos = []; let tramo = [];
  usadas.forEach((w, j) => { if (j > 0 && w.i - usadas[j - 1].f > PAUSA) { tramos.push(tramo); tramo = []; } tramo.push(w); });
  tramos.push(tramo);
  tramos.forEach((gr, j) => {
    const a = Math.max(0, gr[0].i - (j === 0 && op.antes ? op.antes : ANTES));
    const b = gr[gr.length - 1].f + (j === tramos.length - 1 && op.despues ? op.despues : DESPUES);
    const cuadros = Math.round((b - a) * 30);
    pedazos.push({ archivo, a, cuadros, en: cursor });
    gr.forEach((w) => palabras.push({ t: w.t, h, k: w.k, i: cursor + (w.i - a), f: cursor + (w.f - a) }));
    cursor += cuadros / 30;
  });
});
const COLA = pz.cola ?? 0.3;
const TOTAL = cursor + COLA;
const pal = ([h, k]) => { const w = palabras.find((x) => x.h === h && x.k === k); if (!w) throw new Error(`No hay palabra ${k} en el pedazo ${h}`); return w; };
const cuadro = (t) => Math.round(t * 30) / 30;
const ini = (ref) => cuadro(Math.max(0, pal(ref).i - 0.05));
const fin = (ref) => cuadro(pal(ref).f + 0.08);
// Si la palabra abre un pedazo, el cambio se pega al cuadro exacto del corte; si va en la mitad, a la palabra
const enCorte = (ref) => { const w = pal(ref); const p = [...pedazos].reverse().find((x) => x.en <= w.i + 1e-6); return p && w.i - p.en < 0.14 ? cuadro(p.en) : ini(ref); };

if (!process.argv.includes('--solo-html')) {
  const tmp = path.join(P, 'tmp'); fs.mkdirSync(tmp, { recursive: true });
  const vid = [], aud = [];
  pedazos.forEach((p, i) => {
    const entrada = path.join(BASE, 'clips', p.archivo + '.mp4');
    const ultimo = i === pedazos.length - 1;
    const cuadros = p.cuadros + (ultimo ? Math.round(COLA * 30) : 0);
    ff(['-ss', String(p.a), '-i', entrada, '-an', '-vf', `fps=30,${FILTRO},scale=1080:1920:flags=lanczos,setsar=1${ultimo ? `,tpad=stop_mode=clone:stop_duration=${COLA + 0.5}` : ''}`, '-frames:v', String(cuadros), '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', '30', path.join(tmp, `v${i}.mp4`)]);
    ff(['-ss', String(p.a), '-t', String(p.cuadros / 30), '-i', entrada, '-vn', '-af', `afade=t=in:st=0:d=0.012,afade=t=out:st=${n(p.cuadros / 30 - 0.03)}:d=0.03,apad=whole_dur=${n(cuadros / 30)}`, '-ar', '48000', '-ac', '2', path.join(tmp, `a${i}.wav`)]);
    vid.push(`file 'v${i}.mp4'`); aud.push(`file 'a${i}.wav'`);
  });
  fs.writeFileSync(path.join(tmp, 'v.txt'), vid.join('\n'), 'utf8');
  fs.writeFileSync(path.join(tmp, 'a.txt'), aud.join('\n'), 'utf8');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'v.txt'), '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '15', '-movflags', '+faststart', path.join(A, 'persona.mp4')]);
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'a.txt'), '-ar', '48000', '-ac', '2', path.join(A, 'voz.wav')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  (pz.apps || []).forEach((ap, i) => fs.copyFileSync(ap.archivo, path.join(A, `app-${i}.mp4`)));
}

// ---------- los efectos de sonido ----------
// Cuánto suena cada uno frente a la voz (en dB; todos vienen emparejados a -16 dB en su tramo más fuerte)
const VOLUMEN = { manejo: -5, whoosh: -6, golpe: -3, flash: -10, pop: -5, tachar: -12, cuenta: -11, caida: -6, cinta: -8, campana: -8, toque: -6, logro: -8 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = fs.existsSync(path.join(SON, 'sonidos.json')) ? JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8')) : {};
const sonidos = [];
// alGolpe: el momento más fuerte del efecto cae en t (para los que crecen, como el whoosh); si no, el efecto empieza en t
const suena = (s, t, { alGolpe = false, db = 0 } = {}) => { if (MEDIDAS[s]) sonidos.push({ s, t: Math.max(0, t - (alGolpe ? MEDIDAS[s].golpe_en : 0)), db: VOLUMEN[s] + db }); };

// ---------- 2. letras ----------
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow-condensed', 'barlow-condensed-latin-700-normal.woff2', 'barlow-condensed-700.woff2');
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("assets/fuentes/barlow-condensed-700.woff2") format("woff2"); }
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }`;
const AMBAR = '#FFB547', TINTA = '#0F1113', CLARO = '#F4EFE6', GRIS = '#6E675C';
const SOMBRA = '0 3px 0 rgba(15, 17, 19, 0.85), 0 0 16px rgba(15, 17, 19, 0.85), 0 0 4px rgba(15, 17, 19, 0.9)';
const LLAMA = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';
// Los íconos son los mismos de la app (Lucide)
const icono = (nombre) => [...fs.readFileSync(path.join(RAIZ, 'node_modules', 'lucide-react', 'dist', 'esm', 'icons', nombre + '.js'), 'utf8').matchAll(/d:\s*"([^"]+)"/g)].map((m) => `<path d="${m[1]}" />`).join('');

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

// --- subtítulos pequeños y palabras grandes ---
const enGrande = (w) => (pz.grandes || []).some((g) => w.i >= pal(g.de).i - 1e-6 && w.f <= pal(g.a).f + 1e-6);
const limpia = (t) => t.toLowerCase().replace(/[.,;:¡!¿?"]/g, '');
// La transcripción pone signos de pregunta y cifras que el guion no tiene
const ver = (t) => { const s = t.replace(/[¿?]/g, ''); const base = limpia(s); return pz.reemplazos && pz.reemplazos[base] ? s.replace(base, pz.reemplazos[base]) : s; };
const CORTAS = new Set(['y', 'o', 'que', 'de', 'por', 'para', 'en', 'el', 'la', 'un', 'una', 'lo', 'a', 'con', 'no', 'se', 'es', 'ya', 'te', 'si', 'sin']);
const grupos = []; let g = [];
palabras.forEach((w, j) => {
  if (enGrande(w)) { if (g.length) { grupos.push(g); g = []; } return; }
  const sig = palabras[j + 1];
  g.push(w);
  const letras = g.map((x) => x.t).join(' ').length;
  const tope = /[.,;:!?]$/.test(w.t) || !sig || enGrande(sig) || sig.h !== w.h || sig.i - w.f > 0.25;
  const lleno = g.length >= 3 || letras + (sig ? sig.t.length : 0) > 18;
  // un letrero no termina en una palabra de enlace ("y", "por", "que"...) si se puede evitar
  // ...y una "y" abre letrero nuevo en vez de quedar colgando en la mitad
  const sigueY = sig && limpia(sig.t) === 'y' && g.length >= 2;
  if (tope || sigueY || (lleno && !CORTAS.has(limpia(w.t))) || g.length >= 4) { grupos.push(g); g = []; }
});
pieza('letras', `        .gr { position: absolute; left: 0; right: 0; top: 1200px; margin: 0; text-align: center; white-space: nowrap; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 60px; line-height: 1; color: #ffffff; text-shadow: ${SOMBRA}; opacity: 0; }
        .gr .k { color: ${AMBAR}; }
        .bg { position: absolute; left: 0; right: 0; top: 985px; display: flex; flex-direction: column; align-items: center; }
        .bg p { margin: 0; white-space: nowrap; text-align: center; text-shadow: ${SOMBRA}; opacity: 0; }
        .bg .ch { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; line-height: 1.05; color: #ffffff; }
        .bg .gd { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 188px; line-height: 0.95; letter-spacing: 0.005em; color: ${AMBAR}; }`,
[
  ...grupos.map((gr, i) => `        <p class="gr" id="gr-${i}">${gr.map((w) => (pz.claves.includes(limpia(w.t)) ? `<span class="k">${ver(w.t)}</span>` : ver(w.t))).join(' ')}</p>`),
  ...(pz.grandes || []).map((b, i) => `        <div class="bg" id="bg-${i}">${b.arriba ? `<p class="ch" id="bg-${i}-a">${b.arriba}</p>` : ''}<p class="gd" id="bg-${i}-g">${b.grande}</p></div>`),
].join('\n'),
[
  ...grupos.flatMap((gr, i) => {
    const a = Math.max(0, gr[0].i - 0.04);
    const sigue = grupos[i + 1] && !(pz.grandes || []).some((b) => pal(b.de).i > gr[gr.length - 1].f - 1e-6 && pal(b.de).i < grupos[i + 1][0].i);
    let b = sigue ? Math.max(a + 0.1, grupos[i + 1][0].i - 0.04) : gr[gr.length - 1].f + 0.12;
    // si lo que sigue es otra frase, el letrero se va en el corte y no se queda sobre la toma nueva
    if (sigue && grupos[i + 1][0].h !== gr[0].h) { const corte = [...pedazos].reverse().find((x) => x.en <= grupos[i + 1][0].i + 1e-6); if (corte && corte.en > a + 0.1) b = Math.min(b, corte.en); }
    return [`tl.fromTo("#gr-${i}", { opacity: 0, scale: 0.92, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.09, ease: "back.out(2)" }, ${n(a)});`, `tl.set("#gr-${i}", { opacity: 0 }, ${n(b)});`];
  }),
  ...(pz.grandes || []).flatMap((b, i) => {
    const sigPal = palabras[palabras.indexOf(pal(b.a)) + 1];
    const a = Math.max(0, pal(b.de).i - 0.04), z = Math.min(pal(b.a).f + 0.12, sigPal ? sigPal.i - 0.12 : Infinity);
    const tg = a + Math.min(0.45, (z - a) * 0.4);   // el renglón pequeño entra con la primera palabra; el grande, después, de golpe
    suena('golpe', tg + 0.1);
    return [
      b.arriba ? `tl.fromTo("#bg-${i}-a", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, ${n(a)});` : '',
      `tl.fromTo("#bg-${i}-g", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.14, ease: "power4.in" }, ${n(tg)});`,
      `tl.set("#bg-${i} p", { opacity: 0 }, ${n(z)});`,
    ].filter(Boolean);
  }),
]);

// --- tarjetas que saltan a la altura del pecho ---
const salta = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, scale: 0.4, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "back.out(2)" }, ${n(t)});`;
const sale = (sel, t) => `tl.to("${sel}", { opacity: 0, scale: 0.85, duration: 0.12, ease: "power2.in" }, ${n(t)});`;
const tHtml = [], tCss = [], tPasos = [];
(pz.tarjetas || []).forEach((tj, i) => {
  const id = `tj-${i}`;
  if (tj.tipo === 'iconos') {
    const lado = 190, hueco = 34, izq = (1080 - (lado * tj.iconos.length + hueco * (tj.iconos.length - 1))) / 2;
    tj.iconos.forEach(([nombre, ref], j) => {
      tCss.push(`        #${id}-${j} { left: ${izq + j * (lado + hueco)}px; top: 992px; width: ${lado}px; height: ${lado}px; }`);
      tHtml.push(`        <div class="tj cuad" id="${id}-${j}"><svg viewBox="0 0 24 24" fill="none" stroke="${TINTA}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icono(nombre)}</svg><span class="raya" id="${id}-${j}-r"></span></div>`);
      const t = ini(ref);
      suena('pop', t + 0.04); suena('tachar', t + 0.49, { alGolpe: true });
      tPasos.push(salta(`#${id}-${j}`, t), `tl.fromTo("#${id}-${j}-r", { scaleX: 0, rotation: -38 }, { scaleX: 1, rotation: -38, duration: 0.14, ease: "power2.out" }, ${n(t + 0.42)});`, `tl.to("#${id}-${j}", { backgroundColor: "#B9B2A6", duration: 0.14 }, ${n(t + 0.42)});`, sale(`#${id}-${j}`, fin(tj.a)));
    });
  } else if (tj.tipo === 'contador') {
    const pasosNum = [tj.desdeNumero, Math.round(tj.desdeNumero * 0.6), Math.round(tj.desdeNumero * 0.25), 0];
    tCss.push(`        #${id} { left: 240px; top: 985px; width: 600px; height: 190px; display: flex; align-items: center; justify-content: center; gap: 26px; }`);
    tHtml.push(`        <div class="tj caja" id="${id}"><span class="num">${pasosNum.map((v, j) => `<b id="${id}-n${j}"${j ? ' style="opacity: 0"' : ''}>${v}</b>`).join('')}</span><span class="rot">${tj.rotulo}</span></div>`);
    const tc = ini(tj.cae);
    suena('pop', ini(tj.de) + 0.04); suena('cuenta', tc - 0.1); suena('caida', tc + 0.27);
    tPasos.push(salta(`#${id}`, ini(tj.de)));
    pasosNum.slice(1).forEach((_, j) => tPasos.push(`tl.set("#${id}-n${j}", { opacity: 0 }, ${n(tc + j * 0.09)});`, `tl.set("#${id}-n${j + 1}", { opacity: 1 }, ${n(tc + j * 0.09)});`));
    tPasos.push(`tl.to("#${id}", { x: -12, duration: 0.05, repeat: 5, yoyo: true, ease: "power1.inOut" }, ${n(tc + 0.3)});`, sale(`#${id}`, fin(tj.a) - 0.06));
  } else if (tj.tipo === 'estudio') {
    tCss.push(`        #${id} { left: 60px; top: 690px; width: 960px; height: 330px; padding: 38px 46px 0; }`);
    tHtml.push(`        <div class="tj caja" id="${id}"><p class="e-rot">${tj.rotulo}</p><p class="e-txt">${tj.texto}</p><p class="e-fte">${tj.fuente}</p></div>`);
    tPasos.push(salta(`#${id}`, ini(tj.de)), sale(`#${id}`, fin(tj.a) - 0.12));
    suena('pop', ini(tj.de) + 0.04);
  } else if (tj.tipo === 'marca') {
    tCss.push(`        #${id} { left: 160px; top: 740px; width: 760px; height: 270px; display: flex; align-items: center; justify-content: center; gap: 26px; background: ${TINTA}; border-color: ${TINTA}; box-shadow: 10px 10px 0 ${AMBAR}; }`);
    tHtml.push(`        <div class="tj caja" id="${id}"><span class="m-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${TINTA}" d="${LLAMA}" /></svg></span><span class="m-txt"><b>Racha</b><i>es una app</i></span></div>`);
    tPasos.push(salta(`#${id}`, ini(tj.de)), sale(`#${id}`, fin(tj.a) - 0.12));
    suena('campana', ini(tj.de) + 0.06);
  } else if (tj.tipo === 'pastilla') {
    tCss.push(`        #${id} { left: 0; right: 0; top: 1035px; display: flex; justify-content: center; }`);
    tHtml.push(`        <div class="tj" id="${id}"><span class="pas">${tj.texto}</span></div>`);
    tPasos.push(salta(`#${id}`, ini(tj.de)));
    suena('pop', ini(tj.de) + 0.04);
  }
});
pieza('tarjetas', `        .tj { position: absolute; opacity: 0; }
        .cuad, .caja { background: ${CLARO}; border: 6px solid ${TINTA}; border-radius: 34px; box-shadow: 10px 10px 0 ${TINTA}; }
        .cuad { display: flex; align-items: center; justify-content: center; }
        .cuad svg { width: 112px; height: 112px; display: block; }
        .raya { position: absolute; left: 14px; right: 14px; top: 50%; height: 12px; margin-top: -6px; background: ${TINTA}; border-radius: 6px; opacity: 1; }
        .num { position: relative; width: 190px; height: 150px; }
        .num b { position: absolute; inset: 0; text-align: right; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 168px; line-height: 150px; color: ${TINTA}; }
        .rot { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 50px; line-height: 1.05; color: ${GRIS}; white-space: nowrap; }
        .e-rot { margin: 0; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 58px; line-height: 1; letter-spacing: 0.05em; color: #9A5B00; }
        .e-txt { margin: 16px 0 0; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 66px; line-height: 1.08; color: ${TINTA}; }
        .e-fte { margin: 20px 0 0; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 32px; line-height: 1; color: ${GRIS}; }
        .m-ico { width: 176px; height: 176px; border-radius: 40px; background: ${AMBAR}; display: flex; align-items: center; justify-content: center; }
        .m-ico svg { width: 122px; height: 122px; display: block; }
        .m-txt { display: flex; flex-direction: column; }
        .m-txt b { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 176px; line-height: 0.95; color: ${CLARO}; }
        .m-txt i { font-style: normal; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 54px; line-height: 1.1; color: #A89F92; }
        .pas { height: 112px; padding: 0 44px; border-radius: 56px; background: ${CLARO}; color: ${TINTA}; border: 5px solid ${TINTA}; box-shadow: 8px 8px 0 ${TINTA}; display: flex; align-items: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; white-space: nowrap; }
        .pas b { font-weight: 600; color: #9A5B00; margin: 0 0 0 12px; }
${tCss.join('\n')}`, tHtml.join('\n') || '        <div></div>', tPasos);

// ---------- 3. el archivo principal ----------
const pasos = [];
// El arranque: la imagen entra torcida y movida, como cuando alguien acomoda el celular, y se cuadra en medio segundo.
// (Flow casi no movió la imagen aunque se le pidió; el movimiento se hace aquí.)
if (pz.arranque) {
  const mov = [[0, -9, 90, 130, 1.34], [0.11, 6, -60, -50, 1.26], [0.22, -3.5, 34, 40, 1.18], [0.33, 2, -16, -14, 1.1], [0.44, -0.8, 6, 6, 1.04], [0.55, 0, 0, 0, 1]];
  pasos.push(`tl.set("#persona", { rotation: ${mov[0][1]}, x: ${mov[0][2]}, y: ${mov[0][3]}, scale: ${mov[0][4]} }, 0);`);
  mov.slice(1).forEach(([t, rot, x, y, sc], i) => pasos.push(`tl.to("#persona", { rotation: ${rot}, x: ${x}, y: ${y}, scale: ${sc}, duration: ${n(t - mov[i][0])}, ease: "sine.inOut" }, ${mov[i][0]});`));
  suena('manejo', 0);
}
// Acercamientos de golpe (la escala se queda hasta el siguiente)
(pz.acercar || []).forEach((z) => pasos.push(`tl.set("#persona", { scale: ${z.escala}, y: ${z.sube || 0} }, ${n(enCorte(z.en))});`));
(pz.destellos || []).forEach((r) => { pasos.push(`tl.fromTo("#destello", { autoAlpha: 0.95 }, { autoAlpha: 0, duration: 0.2, ease: "power2.out", immediateRender: false }, ${n(enCorte(r))});`); suena('flash', enCorte(r)); });
// Transiciones: la mitad de salida va antes del corte (sobre la toma que se va) y la de entrada después
(pz.transiciones || []).forEach((tr) => {
  const t = enCorte(tr.en), d = tr.lado || 1;
  if (tr.tipo === 'barrido') {
    pasos.push(`tl.fromTo("#tr", { x: 0, scale: 1, filter: "blur(0px)" }, { x: ${-200 * d}, scale: 1.4, filter: "blur(18px)", duration: 0.1, ease: "power2.in", immediateRender: false }, ${n(t - 0.1)});`,
      `tl.fromTo("#tr", { x: ${200 * d}, scale: 1.4, filter: "blur(18px)" }, { x: 0, scale: 1, filter: "blur(0px)", duration: 0.2, ease: "power3.out", immediateRender: false }, ${n(t)});`);
    suena('whoosh', t, { alGolpe: true });
  } else if (tr.tipo === 'zoom') {
    pasos.push(`tl.fromTo("#tr", { scale: 1, filter: "blur(0px)" }, { scale: 1.55, filter: "blur(14px)", duration: 0.1, ease: "power2.in", immediateRender: false }, ${n(t - 0.1)});`,
      `tl.fromTo("#tr", { scale: 1.4, filter: "blur(14px)" }, { scale: 1, filter: "blur(0px)", duration: 0.22, ease: "power3.out", immediateRender: false }, ${n(t)});`);
    suena('whoosh', t, { alGolpe: true, db: -1 });
  } else if (tr.tipo === 'salto') {
    [[0, -26, 1.07], [1, 20, 1.07], [2, -12, 1.05], [3, 6, 1.03], [4, 0, 1]].forEach(([c, x, sc]) => pasos.push(`tl.set("#tr", { x: ${x}, scale: ${sc} }, ${n(t + c / 30)});`));
    suena('cinta', t);
  }
  if (tr.tipo !== 'salto') pasos.push(`tl.set("#tr", { filter: "none" }, ${n(t + 0.24)});`);
});
// Blanco y negro para "la voz del otro"; y Lina borrosa y oscura cuando la app está encima
(pz.byn || []).forEach((r) => { pasos.push(`tl.set("#persona", { filter: "grayscale(1) contrast(1.1)" }, ${n(enCorte(r.de))});`); pasos.push(`tl.set("#persona", { filter: "none" }, ${n(fin(r.a) + 0.03)});`); });
// (el fondo se pone borroso en un quinto de segundo y vuelve igual: antes cambiaba de golpe)
const NITIDO = 'blur(0px) brightness(1)', BORROSO = 'blur(16px) brightness(0.42)';
const borroso = (a, b) => pasos.push(`tl.fromTo("#persona", { filter: "${NITIDO}" }, { filter: "${BORROSO}", duration: 0.18, ease: "power2.out", immediateRender: false }, ${n(a)});`,
  `tl.fromTo("#persona", { filter: "${BORROSO}" }, { filter: "${NITIDO}", duration: 0.18, ease: "power2.out", immediateRender: false }, ${n(b - 0.04)});`, `tl.set("#persona", { filter: "none" }, ${n(b + 0.16)});`);
(pz.tarjetas || []).filter((tj) => tj.fondo).forEach((tj) => borroso(ini(tj.de), fin(tj.a)));
const apps = (pz.apps || []).map((ap, i) => ({ ...ap, i, a: ini(ap.de), dura: cuadro(fin(ap.a) - ini(ap.de)) }));
apps.forEach((ap) => {
  borroso(ap.a, ap.a + ap.dura);
  pasos.push(`tl.fromTo("#app-caja-${ap.i}", { autoAlpha: 0, y: 140, scale: 0.86, rotation: 3 }, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.26, ease: "back.out(1.5)", immediateRender: false }, ${n(ap.a)});`,
    `tl.to("#app-caja-${ap.i}", { y: 130, scale: 0.88, rotation: -2, duration: 0.16, ease: "power2.in" }, ${n(ap.a + ap.dura - 0.16)});`, `tl.to("#app-caja-${ap.i}", { autoAlpha: 0, duration: 0.08 }, ${n(ap.a + ap.dura - 0.08)});`);
  suena('whoosh', ap.a + 0.02, { db: -2 });
  (ap.toques || []).forEach((tq) => suena('toque', ap.a + (tq - ap.desde)));
  if (ap.logro) suena('logro', ap.a + (ap.logro - ap.desde));
});

// La mezcla de los efectos: un solo archivo, del largo del anuncio (los .wav son de 48.000 Hz, 16 bits, dos canales)
const CON_SONIDOS = !process.env.SIN_SONIDOS && sonidos.length > 0;
if (CON_SONIDOS) {
  const SR = 48000, mezcla = new Float32Array(Math.ceil(TOTAL * SR) * 2);
  sonidos.forEach((ev) => {
    const b = fs.readFileSync(path.join(SON, ev.s + '.wav')), datos = b.subarray(b.indexOf('data') + 8), g = 10 ** (ev.db / 20) / 32768, desde = Math.round(ev.t * SR) * 2;
    for (let i = 0; i < datos.length / 2 && desde + i < mezcla.length; i++) mezcla[desde + i] += datos.readInt16LE(i * 2) * g;
  });
  const sal = Buffer.alloc(44 + mezcla.length * 2);
  sal.write('RIFF', 0); sal.writeUInt32LE(36 + mezcla.length * 2, 4); sal.write('WAVEfmt ', 8); sal.writeUInt32LE(16, 16); sal.writeUInt16LE(1, 20); sal.writeUInt16LE(2, 22);
  sal.writeUInt32LE(SR, 24); sal.writeUInt32LE(SR * 4, 28); sal.writeUInt16LE(4, 32); sal.writeUInt16LE(16, 34); sal.write('data', 36); sal.writeUInt32LE(mezcla.length * 2, 40);
  let tope = 0;
  mezcla.forEach((v, i) => { tope = Math.max(tope, Math.abs(v)); sal.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2); });
  fs.writeFileSync(path.join(A, 'efectos.wav'), sal);
  fs.writeFileSync(path.join(BASE, `${NOMBRE}-sonidos.txt`), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(8)} ${ev.db} dB`).join(String.fromCharCode(10)) + String.fromCharCode(10), 'utf8');
  console.log(`Efectos: ${sonidos.length} · pico de la mezcla ${(20 * Math.log10(tope)).toFixed(1)} dB`);
}
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
      #tr { z-index: 1; overflow: visible; }
      #persona { transform-origin: 50% 46%; }
      .app-caja { position: absolute; z-index: 2; left: 280px; top: 110px; width: 520px; height: 1067px; padding: 9px; border-radius: 62px; background: #24272D; box-shadow: 0 0 0 4px ${TINTA}, 14px 16px 0 rgba(15, 17, 19, 0.85); opacity: 0; visibility: hidden; }
      .app-pantalla { position: relative; width: 100%; height: 100%; border-radius: 54px; overflow: hidden; background: ${TINTA}; }
      #tarjetas { z-index: 3; }
      #letras { z-index: 4; }
      #destello { position: absolute; inset: 0; z-index: 5; background: #FFF6E0; opacity: 0; visibility: hidden; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <!-- Lina, con el filtro, sin pausas y sin lo que agregó o repitió -->
      <div id="tr" class="clip" data-layout-allow-overflow><video id="persona" class="clip" src="assets/persona.mp4" playsinline muted data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="0" data-layout-allow-overflow></video></div>

      <!-- La app en movimiento, en una tarjeta con forma de celular -->
${apps.map((ap) => `      <div class="app-caja" id="app-caja-${ap.i}"><div class="app-pantalla"><video id="app-${ap.i}" class="clip" src="assets/app-${ap.i}.mp4" playsinline muted data-start="${n(ap.a)}" data-duration="${n(ap.dura)}" data-media-start="${n(ap.desde)}" data-track-index="1"></video></div></div>`).join('\n')}

      <!-- Las tarjetas, a la altura del pecho -->
      <div id="tarjetas" class="clip" data-composition-id="tarjetas" data-composition-src="compositions/tarjetas.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="2" data-width="1080" data-height="1920"></div>

      <!-- Subtítulos pequeños y palabras grandes -->
      <div id="letras" class="clip" data-composition-id="letras" data-composition-src="compositions/letras.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="3" data-width="1080" data-height="1920"></div>

      <div id="destello"></div>

      <!-- La voz de Lina -->
      <audio id="voz" src="assets/voz.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="4" data-volume="1"></audio>${CON_SONIDOS ? `

      <!-- Los efectos de sonido, ya mezclados -->
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="5" data-volume="1"></audio>` : ''}
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
  const de = path.join(C, 'guion1', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion1').join(`campana-${NOMBRE}`), 'utf8');
}
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s · ${pedazos.length} pedazos`);
const inicioDe = {}; palabras.forEach((w) => { if (inicioDe[w.h] === undefined) inicioDe[w.h] = w.i; });
console.log('Cada frase empieza en: ' + Object.entries(inicioDe).map(([h, t]) => `${h}:${t.toFixed(1)}`).join(' · '));
console.log('Letreros: ' + grupos.map((gr) => gr.map((w) => ver(w.t)).join(' ')).join(' | '));
if (apps.length) console.log('App: ' + apps.map((ap) => `${ap.a.toFixed(2)}–${(ap.a + ap.dura).toFixed(2)}`).join(' y '));
