// Le cambia el sonido al anuncio del guion 1 ("Empezar con todo", estilo Tarjeta) SIN volver a exportar la imagen:
// rehace la voz de Lina sola (los mismos pedazos del proyecto), le pone los efectos de ElevenLabs en el segundo
// exacto de cada cosa que se mueve (los segundos salen del proyecto, con pasos-de-un-proyecto.mjs) y lo pega
// sobre el video ya exportado.
// Uso: node design/herramientas/sonidos-g1.mjs            → guion1/guion1-empezar-con-todo-v2.mp4 (sin música)
//      IMAGEN=<otro video exportado> SALIDA=<nombre> node design/herramientas/sonidos-g1.mjs   (para una imagen nueva, por ejemplo con el filtro)
// La música se pone después con poner-musica.mjs. La lista de sonidos queda en guion1/guion1-sonidos.txt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { pasosDe } from './pasos-de-un-proyecto.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const G = path.join(C, 'guion1'), P = path.join(G, 'hyperframes'), SON = path.join(C, 'sonidos');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
// IMAGEN: el video del que se toma la imagen; SALIDA: cómo se llama el resultado. El volumen de la voz se copia siempre de la versión 1.
const VIEJO = path.join(G, 'guion1-empezar-con-todo-v1.mp4');
const VIDEO = process.env.IMAGEN ? path.resolve(process.env.IMAGEN) : VIEJO, SALIDA = process.env.SALIDA ? path.resolve(process.env.SALIDA) : path.join(G, 'guion1-empezar-con-todo-v2.mp4');
const SR = 48000;
const crudo = (args) => { const r = spawnSync(FFMPEG, ['-v', 'error', ...args, '-f', 's16le', '-ac', '2', '-ar', String(SR), '-'], { maxBuffer: 1 << 30 }); if (r.status) throw new Error(r.stderr.toString()); return new Int16Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length >> 1); };

// ---------- 1. la voz sola ----------
const idx = fs.readFileSync(path.join(P, 'index.html'), 'utf8');
const TOTAL = +idx.match(/id="main"[^>]*data-duration="([\d.]+)"/)[1];
const voz = new Float32Array(Math.round(TOTAL * SR) * 2);
for (const m of idx.matchAll(/<audio id="voz-\d+" src="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)" data-media-start="([\d.]+)"/g)) {
  const [, src, t0, dur, desde] = m, en = Math.round(+t0 * SR) * 2, largo = Math.round(+dur * SR) * 2;
  const d = crudo(['-ss', desde, '-t', String(+dur + 0.05), '-i', path.join(P, src), '-vn']);
  for (let i = 0; i < largo && i < d.length && en + i < voz.length; i++) voz[en + i] = d[i] / 32768;
}
// La voz del video exportado llevaba una subida de volumen: se mide comparando con ese video y se pone igual
const viejo = crudo(['-i', VIEJO, '-vn']);
let arriba = 0, abajo = 0;
for (let i = 0; i < voz.length && i < viejo.length; i += 2) { arriba += (viejo[i] / 32768) ** 2; abajo += voz[i] * voz[i]; }
const SUBE = Math.sqrt(arriba / abajo);   // por energía (comparar onda contra onda se queda corto, porque el video viejo pasó por un limitador)
let mejor = [-1, 0];
for (let corr = -2400; corr <= 2400; corr += 8) { let s = 0; for (let i = SR * 10; i < SR * 30; i += 16) s += voz[i * 2] * ((viejo[(i + corr) * 2] || 0) / 32768); if (s > mejor[0]) mejor = [s, corr]; }
console.log(`Voz rehecha: va ${SUBE.toFixed(2)} veces más fuerte que en los clips; corrida frente al video viejo: ${(mejor[1] / 48).toFixed(1)} ms`);

// ---------- 2. dónde va cada sonido ----------
const pasos = pasosDe(P).filter((p) => p.t !== null).sort((a, b) => a.t - b.t);
const de = (sel, k = 0, pieza = null) => { const r = pasos.filter((p) => p.sel === sel && (!pieza || p.pieza === pieza))[k]; if (!r) throw new Error(`No hay paso ${k} de ${sel}`); return r; };
const todos = (sel) => pasos.filter((p) => p.sel === sel);
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
// Cuánto suena cada uno (dB; todos vienen emparejados a -16 dB en su tramo más fuerte)
const VOLUMEN = { whoosh: -8, golpe: -3, pop: -7, tachar: -12, caida: -7, campana: -9, toque: -11, logro: -9, teclado: -13 };
const sonidos = [];
const suena = (s, t, { alGolpe = false, db = 0, desde = 0, dura = 0, que = '' } = {}) => sonidos.push({ s, t: Math.max(0, t - (alGolpe ? MEDIDAS[s].golpe_en - desde : 0)), db: VOLUMEN[s] + db, desde, dura, que });
// Lo que llega volando frena al final: se ve quieto cuando va por el 62 % del movimiento (medido en el video)
const llega = (p) => p.t + p.dur * 0.62;
const rayon = (t, dura, que, db = 0) => suena('tachar', t, { desde: 0.09, dura: Math.max(0.16, Math.min(0.32, dura)), que, db });

// Los cambios de plano (el cuadro de Lina se agranda, se achica o cambia de color): un soplido en la mitad del movimiento
todos('#zoom').forEach((p, k) => suena('whoosh', p.t + p.dur / 2, { alGolpe: true, db: k < 2 ? -3 : 0, que: 'cambio de plano' }));
// 1 · el gancho: la última palabra entra con un golpe
suena('golpe', de('#gc', 0).t + 0.14, { db: -3, que: 'gancho: última palabra' });
// 2 · el calendario del lunes
suena('pop', de('#c-d0').t, { db: -3, que: 'entra el calendario' });
rayon(de('#c-aro1').t, de('#c-aro1').dur, 'se encierra el lunes');
['#c-1', '#c-2', '#c-3'].forEach((s) => suena('pop', de(s).t + 0.03, { que: 'letrero del lunes' }));
// 3 · las cinco tarjetas que llegan volando: soplido corto y pop cuando se asientan
todos('#k-0').slice(0, 1).concat(...['#k-1', '#k-2', '#k-3', '#k-4'].map((s) => de(s))).forEach((p) => { suena('whoosh', p.t + 0.1, { alGolpe: true, db: -4, que: 'tarjeta que vuela' }); suena('pop', llega(p), { db: -1, que: 'tarjeta que llega' }); });
// 4 · la ventana de las semanas: cada casilla que se marca hace tic; las dos que fallan, un tono que cae
suena('pop', de('#v-caja').t + 0.03, { que: 'ventana de semanas' });
[0, 1, 2, 3, 4].forEach((k) => suena('toque', de(`#v1-${k}`).t, { que: 'casilla semana 1' }));
[0, 1, 2].forEach((k) => suena('toque', de(`#v2-${k}`).t, { que: 'casilla semana 2' }));
suena('caida', de('#v2-3').t, { dura: 0.4, db: -2, que: 'las dos que no se hicieron' });
// 5 · el papel del día pesado: cae, se tachan las cinco cosas y el contador llega a cero
suena('whoosh', de('#h-papel').t + 0.1, { alGolpe: true, db: -2, que: 'cae el papel' });
suena('pop', llega(de('#h-papel')), { db: 1, que: 'el papel llega' });
suena('pop', de('#h-tit').t + 0.03, { que: 'título del papel' });
[0, 1, 2, 3, 4].forEach((k) => rayon(de(`#h-x${k}a`).t, 0.2, 'tachón ' + (k + 1), 1));
suena('caida', de('#h-n0').t, { que: 'el contador llega a cero' });
// 6 · "no te faltó disciplina": franja, raya y la tira que sube
suena('pop', de('#f-franja').t + 0.04, { que: 'franja' });
rayon(de('#f-raya').t, 0.2, 'raya sobre "disciplina"', 1);
suena('pop', de('#f-tira').t + 0.04, { que: 'sube la tira' });
// 7 · una sola: entran las cinco, se van cuatro, queda una con la llama
suena('pop', de('#j-0').t + 0.03, { que: 'entran las cinco tarjetas' });
suena('pop', de('#jt-1').t + 0.03, { db: -2, que: 'letrero' });
suena('whoosh', de('#j-0', 1).t + 0.1, { alGolpe: true, db: -1, que: 'se van cuatro tarjetas' });
suena('pop', de('#j-1', 1).t + 0.2, { que: 'queda una' });
suena('campana', de('#j-llama').t + 0.08, { que: 'la llama' });
suena('pop', de('#j-h1').t, { db: -3, que: 'resalta' }); suena('pop', de('#j-h2').t, { db: -3, que: 'resalta' });
// 8 · el ejemplo: la ventana y las dos líneas que se escriben solas
suena('pop', de('#e-caja').t + 0.03, { que: 'ventana del ejemplo' });
suena('teclado', de('#e-t1').t, { desde: 0.25, dura: de('#e-t1').dur, que: 'se escribe la línea 1' });
suena('teclado', de('#e-t2').t, { desde: 0.2, dura: Math.min(0.9, de('#e-t2').dur), que: 'se escribe la línea 2' });
// 9 · Racha: la ficha, el celular que llega, el toque, y las dos tarjetas de la app
suena('pop', de('#r-chip').t + 0.03, { que: 'ficha de Racha' });
suena('whoosh', de('#r-cel').t + 0.12, { alGolpe: true, db: -2, que: 'llega el celular' });
suena('pop', llega(de('#r-cel')), { db: 1, que: 'el celular se asienta' });
suena('toque', de('#r-cel', 1).t + 0.1, { db: 4, que: 'el celular late' });
suena('pop', de('#r-a').t + 0.03, { que: 'recorte de la app 1' });
rayon(de('#r-aro').t, 0.32, 'se encierra en la app');
suena('pop', de('#r-b').t + 0.03, { que: 'recorte de la app 2' });
rayon(de('#r-raya').t, 0.3, 'se subraya en la app');
// 10 · el precio que cae y las chapas
suena('campana', de('#z-llama').t + 0.08, { db: -2, que: 'la llama' });
suena('golpe', de('#z-precio').t + de('#z-precio').dur - 0.03, { que: 'cae el precio' });
suena('pop', de('#z-c1').t + 0.03, { que: 'chapa 1' }); suena('pop', de('#z-c2').t + 0.03, { que: 'chapa 2' });
suena('pop', de('#z-cta').t + 0.03, { que: 'escríbenos' });
// 11 · la tarjeta final
suena('whoosh', de('#y-img').t + 0.08, { alGolpe: true, que: 'tarjeta final' });
suena('logro', de('#y-img').t + 0.12, { que: 'tarjeta final' });

// ---------- 3. la mezcla de efectos ----------
const efectos = new Float32Array(voz.length);
for (const ev of sonidos) {
  const b = fs.readFileSync(path.join(SON, ev.s + '.wav')), todo = b.subarray(b.indexOf('data') + 8), g = 10 ** (ev.db / 20) / 32768, en = Math.round(ev.t * SR) * 2;
  const datos = todo.subarray(Math.round(ev.desde * SR) * 4, ev.dura ? Math.round((ev.desde + ev.dura) * SR) * 4 : undefined), largo = datos.length / 2;
  const entra = ev.desde ? 0.004 * SR * 2 : 0, sale = ev.dura ? 0.05 * SR * 2 : 0;
  for (let i = 0; i < largo && en + i < efectos.length; i++) efectos[en + i] += datos.readInt16LE(i * 2) * g * (i < entra ? i / entra : 1) * (largo - i < sale ? (largo - i) / sale : 1);
}
const wav = (ruta, x, gana = 1) => {
  const sal = Buffer.alloc(44 + x.length * 2);
  sal.write('RIFF', 0); sal.writeUInt32LE(36 + x.length * 2, 4); sal.write('WAVEfmt ', 8); sal.writeUInt32LE(16, 16); sal.writeUInt16LE(1, 20); sal.writeUInt16LE(2, 22);
  sal.writeUInt32LE(SR, 24); sal.writeUInt32LE(SR * 4, 28); sal.writeUInt16LE(4, 32); sal.writeUInt16LE(16, 34); sal.write('data', 36); sal.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) sal.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i] * gana)) * 32767), 44 + i * 2);
  fs.writeFileSync(ruta, sal);
};
const tmp = path.join(G, 'tmp-sonido'); fs.mkdirSync(tmp, { recursive: true });
wav(path.join(tmp, 'voz.wav'), voz, SUBE * 0.6);   // se guarda con margen para no recortar los picos; el volumen se devuelve abajo, antes del limitador
wav(path.join(tmp, 'efectos.wav'), efectos);
execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', VIDEO, '-i', path.join(tmp, 'voz.wav'), '-i', path.join(tmp, 'efectos.wav'), '-filter_complex', '[1:a]volume=' + (1 / 0.6).toFixed(4) + ',alimiter=limit=0.84:level=disabled[v];[v][2:a]amix=inputs=2:normalize=0:duration=first[a]', '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', SALIDA], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
const NL = String.fromCharCode(10);
fs.writeFileSync(path.join(G, 'guion1-sonidos.txt'), [...sonidos].sort((a, b) => a.t - b.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(8)} ${String(ev.db).padStart(4)} dB  ${ev.que}`).join(NL) + NL, 'utf8');
console.log(`Listo ${path.basename(SALIDA)} · ${sonidos.length} sonidos · lista en guion1-sonidos.txt`);
