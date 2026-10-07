// Arma los subtítulos del anuncio de Xiomara con el momento exacto de cada palabra (AssemblyAI).
// Lee los <clip>.palabras.json que deja transcribir-assembly.mjs y escribe un .ass:
// frases cortas (hasta 3 palabras) y la palabra que se está diciendo va en ámbar.
// Uso: node design/herramientas/subtitulos-xiomara.mjs [salida.ass]
// Los tramos (clip, desde, hasta) deben ser los mismos del montaje (montar-xiomara-v3.sh).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CLIPS = path.join(AQUI, '..', 'anuncios', 'xiomara', 'clips');
const SALIDA = process.argv[2] || path.join(AQUI, '..', 'anuncios', 'xiomara', 'montaje', 'subs4.ass');

// Los tramos del montaje, en orden. Se pueden cambiar con la variable TRAMOS (JSON).
const TRAMOS = process.env.TRAMOS ? JSON.parse(process.env.TRAMOS) : [
  { clip: 'A-cubeta', ini: 0.55, fin: 9.70 },
  { clip: 'B-caminando', ini: 0.45, fin: 8.70 },
  { clip: 'C-sarten', ini: 0.00, fin: 8.55 },
  { clip: 'D-mesa', ini: 1.25, fin: 9.45 },
];
const MAX_PALABRAS = 3, MAX_LETRAS = 15;

// 1. Palabras en tiempos del montaje
const palabras = [];
let desfase = 0;
for (const tr of TRAMOS) {
  const j = JSON.parse(fs.readFileSync(path.join(CLIPS, tr.clip + '.palabras.json'), 'utf8'));
  for (const p of j.palabras) {
    if (p.f <= tr.ini || p.i >= tr.fin) continue;
    palabras.push({ t: p.t, i: desfase + p.i - tr.ini, f: desfase + p.f - tr.ini, tramo: tr.clip });
  }
  desfase += tr.fin - tr.ini;
}

// 2. Frases cortas: se parte en la puntuación, a las 3 palabras o si ya no cabe en un renglón
const frases = [];
let actual = [];
// Una frase no debe terminar en una palabra suelta que pide la siguiente ("a", "el", "por"…): esa pasa a la frase que sigue.
const FLOJAS = new Set(['a', 'al', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'de', 'del', 'por', 'para', 'con', 'en', 'que', 'se', 'te', 'lo', 'es', 'ese', 'esa', 'ya']);
const floja = (p) => FLOJAS.has(p.t.toLowerCase()) && !/[.,?!…:]$/.test(p.t);
// forzar = true: se cierra sí o sí (puntuación, cambio de clip, pausa). Si no, y solo quedarían palabras flojas, la frase sigue creciendo.
const cerrar = (forzar = true) => {
  const resto = [];
  while (actual.length > 1 && floja(actual[actual.length - 1])) resto.unshift(actual.pop());
  if (!forzar && actual.every(floja)) { actual.push(...resto); return; }
  if (actual.length) frases.push(actual);
  actual = resto;
};
for (let k = 0; k < palabras.length; k++) {
  const p = palabras[k];
  const largo = actual.map((x) => x.t).join(' ').length;
  if (actual.length && (actual.length >= MAX_PALABRAS || largo + 1 + p.t.length > MAX_LETRAS || p.tramo !== actual[0].tramo || p.i - actual[actual.length - 1].f > 0.45)) cerrar(p.tramo !== actual[0].tramo || p.i - actual[actual.length - 1].f > 0.45);
  actual.push(p);
  if (/[.,?!…:]$/.test(p.t)) cerrar();
}
cerrar();

// 3. Un renglón por palabra dicha: la frase completa, con esa palabra en ámbar
const h = (t) => { t = Math.max(0, t); const m = Math.floor(t / 60); return `0:${String(m).padStart(2, '0')}:${(t - 60 * m).toFixed(2).padStart(5, '0')}`; };
const AMBAR = '{\\c&H24A5F5&}', BLANCO = '{\\c&HFFFFFF&}', ENTRA = '{\\fscx88\\fscy88\\t(0,80,\\fscx100\\fscy100)}';
const lineas = [];
frases.forEach((fr, n) => {
  const sig = frases[n + 1];
  const finFrase = Math.min(fr[fr.length - 1].f + 0.22, sig ? sig[0].i - 0.02 : Infinity);
  fr.forEach((p, k) => {
    const desde = k === 0 ? p.i - 0.03 : p.i;
    const hasta = k < fr.length - 1 ? fr[k + 1].i : finFrase;
    const texto = fr.map((x, q) => (q === k ? AMBAR + x.t + BLANCO : x.t)).join(' ');
    lineas.push(`Dialogue: 0,${h(desde)},${h(hasta)},Sub,,0,0,0,,${k === 0 ? ENTRA : ''}${texto}`);
  });
});

const cabeza = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Segoe UI Black,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,1,8,3,2,50,50,720,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
fs.writeFileSync(SALIDA, cabeza + lineas.join('\n') + '\n', 'utf8');
console.log(`${frases.length} frases, ${palabras.length} palabras -> ${SALIDA}`);
console.log(frases.map((fr) => `${fr[0].i.toFixed(2)} ${fr.map((x) => x.t).join(' ')}`).join('\n'));
