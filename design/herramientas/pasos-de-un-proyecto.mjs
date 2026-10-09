// Lista todo lo que se mueve en un proyecto de HyperFrames, con el segundo del anuncio en que pasa.
// Sirve para poner efectos de sonido en el punto exacto sin leer el HTML a ojo.
// Uso: node design/herramientas/pasos-de-un-proyecto.mjs <carpeta del proyecto> [texto que debe tener el selector]
// Cómo: corre el código de cada pieza con un "gsap" de mentira que solo anota las llamadas.
import fs from 'node:fs';
import path from 'node:path';

export function pasosDe(P) {
const idx = fs.readFileSync(path.join(P, 'index.html'), 'utf8');
const piezas = [...idx.matchAll(/<div[^>]*data-composition-id="([^"]+)"[^>]*data-composition-src="([^"]+)"[^>]*data-start="([\d.]+)"[^>]*data-duration="([\d.]+)"/g)].map((m) => ({ id: m[1], src: m[2], t0: +m[3], d: +m[4] }));
piezas.unshift({ id: 'main', src: 'index.html', t0: 0, d: 0 });
const corto = (v) => Object.entries(v || {}).filter(([k]) => !['ease', 'immediateRender', 'duration', 'overwrite'].includes(k)).map(([k, x]) => `${k}:${typeof x === 'string' ? x.slice(0, 26) : x}`).join(' ');
const pasos = [];
for (const pz of piezas) {
  const html = fs.readFileSync(path.join(P, pz.src), 'utf8');
  const codigo = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
  const anotar = (tipo) => (sel, ...r) => { const pos = typeof r[r.length - 1] === 'number' ? r.pop() : null; const fin = r[r.length - 1] || {}; pasos.push({ pieza: pz.id, t: pos === null ? null : pz.t0 + pos, tipo, sel: String(sel), dur: fin.duration || 0, de: r.length > 1 ? corto(r[0]) : '', a: corto(fin), rep: fin.repeat || 0 }); return tl; };
  const tl = { set: anotar('set'), to: anotar('to'), from: anotar('from'), fromTo: anotar('fromTo'), seek() { return tl; }, add() { return tl; }, call() { return tl; }, addLabel() { return tl; } };
  try { new Function('gsap', 'window', 'document', codigo)({ timeline: () => tl, set() {}, registerPlugin() {}, utils: { toArray: () => [] } }, { __timelines: {} }, { querySelectorAll: () => [], querySelector: () => null, getElementById: () => null }); } catch (e) { console.log(`(no pude correr ${pz.id}: ${e.message})`); }
}
  return pasos;
}

if (process.argv[1] && process.argv[1].endsWith('pasos-de-un-proyecto.mjs')) {
  const filtro = process.argv[3] || '';
  let antes = '';
  for (const p of pasosDe(process.argv[2]).filter((x) => x.pieza !== 'subtitulos' && x.pieza !== 'letras' && x.sel.includes(filtro)).sort((a, b) => (a.t ?? 0) - (b.t ?? 0))) {
    if (p.pieza !== antes) { console.log(`\n== ${p.pieza}`); antes = p.pieza; }
    console.log(`${p.t === null ? '   ?  ' : p.t.toFixed(3).padStart(7)} ${p.tipo.padEnd(6)} ${p.sel.padEnd(20).slice(0, 20)} ${p.dur ? ('d' + p.dur).padEnd(6) : '      '} ${p.de ? p.de + ' → ' : ''}${p.a}`.slice(0, 190));
  }
}
