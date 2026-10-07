// Monta el anuncio de Lina (guion 4) de punta a punta, 1080 x 1920:
// 1. quita los silencios (deja solo los tramos con voz, según los tiempos de AssemblyAI);
// 2. une los tramos alternando un acercamiento leve para disimular los cortes;
// 3. intercala la app a pantalla completa (nunca encima de ella), pone subtítulos palabra por palabra,
//    efectos de sonido y el cierre con el precio.
// Antes: transcribir-assembly.mjs sobre los clips, capturas-lina.cjs (app en localhost:3002) y tarjetas (este script las arma).
// Uso: NODE_PATH="<carpeta temporal>/node_modules" node design/herramientas/montar-lina.mjs [salida.mp4]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const L = path.join(AQUI, '..', 'anuncios', 'lina');
const M = path.join(L, 'montaje');
const X = path.join(AQUI, '..', 'anuncios', 'xiomara', 'montaje');   // de ahí salen el cierre y los sonidos
fs.mkdirSync(M, { recursive: true });
const SALIDA = process.argv[2] || 'lina-guion4-v1.mp4';
const FFDIR = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/';
const ff = (args, cwd = M) => execFileSync(FFDIR + 'ffmpeg.exe', ['-y', '-v', 'error', ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
const duracion = (f) => +execFileSync(FFDIR + 'ffprobe.exe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const n = (x) => x.toFixed(3);

// ---------- 1. Tramos con voz ----------
// pre / post: cuánto se deja antes de la primera palabra y después de la última (para conservar un gesto corto)
const CLIPS = [
  { id: '1-gancho', pre: 0.55, post: 0.30 },
  { id: '2-mito', pre: 0.15, post: 0.25 },
  { id: '3-solucion', pre: 0.45, post: 0.25 },
  { id: '4-cierre', pre: 0.15, post: 0.60 },
];
const PAUSA = 0.32, ANTES = 0.12, DESPUES = 0.18;
const tramos = [];
let T = 0;
for (const c of CLIPS) {
  const archivo = path.join(L, 'clips', c.id + '.mp4');
  const dur = duracion(archivo);
  const pal = JSON.parse(fs.readFileSync(path.join(L, 'clips', c.id + '.palabras.json'), 'utf8')).palabras;
  const grupos = [[]];
  pal.forEach((p, k) => { if (k && p.i - pal[k - 1].f > PAUSA) grupos.push([]); grupos[grupos.length - 1].push(p); });
  grupos.forEach((g, k) => {
    let ini = Math.max(0, g[0].i - (k === 0 ? c.pre : ANTES));
    let fin = Math.min(dur - 0.02, g[g.length - 1].f + (k === grupos.length - 1 ? c.post : DESPUES));
    const sig = grupos[k + 1];
    if (sig) fin = Math.min(fin, sig[0].i - ANTES - 0.01);
    const prev = tramos[tramos.length - 1];
    if (prev && prev.clip === c.id) ini = Math.max(ini, prev.fin + 0.01);
    tramos.push({ clip: c.id, archivo, ini, fin, T0: T, zoom: k % 2 ? 1.08 : 1, palabras: g });
    T += fin - ini;
  });
}
const FIN = T;
const CIERRE = 2.6;
// Palabras en tiempos del montaje
const TEXTO = { '3,': 'tres,', '10.': 'diez.' };
const palabras = tramos.flatMap((t) => t.palabras.map((p) => ({ t: TEXTO[p.t] || p.t, i: t.T0 + p.i - t.ini, f: t.T0 + p.f - t.ini, clip: t.clip })));
const cuando = (clip, re, cual = 'i') => { const p = palabras.find((x) => x.clip === clip && re.test(x.t)); if (!p) throw new Error('No encontré ' + re + ' en ' + clip); return p[cual]; };

// ---------- 2. Unir los tramos ----------
const ent = [], fc = [];
tramos.forEach((t, k) => {
  ent.push('-ss', n(t.ini), '-to', n(t.fin), '-i', t.archivo);
  const w = Math.round(1080 * t.zoom / 2) * 2, h = Math.round(1920 * t.zoom / 2) * 2, d = t.fin - t.ini;
  fc.push(`[${k}:v]scale=${w}:${h}:flags=lanczos,crop=1080:1920:(iw-1080)/2:(ih-1920)*0.30,setsar=1,fps=24,format=yuv420p[v${k}]`);
  fc.push(`[${k}:a]aresample=48000,afade=t=in:d=0.02,afade=t=out:st=${n(Math.max(0, d - 0.03))}:d=0.03[a${k}]`);
});
fc.push(tramos.map((_, k) => `[v${k}][a${k}]`).join('') + `concat=n=${tramos.length}:v=1:a=1[v][a]`);
fs.writeFileSync(path.join(M, 'f-base.txt'), fc.join(';\n'));
ff([...ent, '-/filter_complex', 'f-base.txt', '-map', '[v]', '-map', '[a]', '-r', '24', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', 'base.mp4']);

// ---------- 3. Tarjetas de la app (pantalla completa) ----------
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const url = (p) => 'file:///' + p.replace(/\\/g, '/');
const F = url(path.join(RAIZ, 'public', 'fuentes'));
const css = `
@font-face{font-family:Barlow;font-weight:600;src:url(${F}/barlow-latin-600-normal.woff2)}
@font-face{font-family:BarlowC;font-weight:700;src:url(${F}/barlow-condensed-latin-700-normal.woff2)}
*{box-sizing:border-box;margin:0;padding:0}html,body{width:1080px;height:1920px;overflow:hidden}
body{background:#0c0d10;color:#f3ece0;font-family:Barlow,sans-serif;position:relative}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(900px 700px at 50% 22%,rgba(245,165,36,.13),transparent 70%)}
.marca{position:absolute;left:0;right:0;top:292px;display:flex;justify-content:center;align-items:center;gap:16px;font-family:BarlowC;font-weight:700;font-size:54px}
.marca img{width:64px;height:64px;border-radius:16px}.marca span{color:#b3a894;font-family:Barlow;font-weight:600;font-size:34px;margin-left:6px}
.zona{position:absolute;left:0;right:0;top:400px;height:640px;display:flex;align-items:center;justify-content:center}
.tarjeta{border-radius:40px;overflow:hidden;border:2px solid rgba(255,255,255,.14);box-shadow:0 40px 90px rgba(0,0,0,.65),0 0 0 10px rgba(245,165,36,.07);background:#14161a;padding:26px}
.tarjeta img{display:block}`;
const pagina = (img, ancho) => `<!doctype html><meta charset="utf-8"><style>${css}</style>
<div class="marca"><img src="${url(path.join(RAIZ, 'public', 'icon-192.png'))}">Racha<span>así se ve en la app</span></div>
<div class="zona"><div class="tarjeta"><img src="${url(path.join(L, 'app', img))}" style="width:${ancho}px"></div></div>`;
{
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage(); await pg.setViewport({ width: 1080, height: 1920 });
  for (const [nombre, img, ancho] of [['t-despues', 'rec-despues.png', 930], ['t-minimo-y-hoy', 'rec-minimo-y-hoy.png', 900]]) {
    const f = path.join(M, nombre + '.html'); fs.writeFileSync(f, pagina(img, ancho), 'utf8');
    await pg.goto(url(f), { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
    const fuera = await pg.evaluate(() => [...document.querySelectorAll('.marca,.tarjeta')].map((e) => { const r = e.getBoundingClientRect(); return [e.className, Math.round(r.top), Math.round(r.bottom)]; }).filter((x) => x[1] < 269 || x[2] > 1060));
    if (fuera.length) console.log('FALLA zona segura', nombre, JSON.stringify(fuera));
    await pg.screenshot({ path: path.join(M, nombre + '.png') }); fs.unlinkSync(f);
  }
  await b.close();
}
const corte = (png, seg, salida) => ff(['-loop', '1', '-framerate', '24', '-i', png, '-t', n(seg), '-vf', `scale=2160:3840:flags=lanczos,zoompan=z='1+0.05*on/(24*${n(seg)})':x='iw/2-(iw/zoom/2)':y='ih*0.38-(ih/zoom*0.38)':d=1:s=1080x1920:fps=24,format=yuv420p`, '-c:v', 'libx264', '-crf', '14', salida]);
const tK1 = cuando('3-solucion', /^amarrado/) - 0.06;
const tK2 = cuando('3-solucion', /^Después/) - 0.06;
const tK2f = tramos.filter((t) => t.clip === '3-solucion').slice(-1)[0];
const finK2 = tK2f.T0 + (tK2f.fin - tK2f.ini);
corte('t-despues.png', tK2 - tK1, 'c-k1.mp4');
corte('t-minimo-y-hoy.png', finK2 - tK2, 'c-k2.mp4');
corte(path.join(X, 'tarjetas', 'cierre.png'), CIERRE, 'c-cierre.mp4');

// ---------- 4. Subtítulos palabra por palabra ----------
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
const h = (t) => { t = Math.max(0, t); const m = Math.floor(t / 60); return `0:${String(m).padStart(2, '0')}:${(t - 60 * m).toFixed(2).padStart(5, '0')}`; };
const AM = '{\\c&H24A5F5&}', BL = '{\\c&HFFFFFF&}', ENTRA = '{\\fscx88\\fscy88\\t(0,80,\\fscx100\\fscy100)}';
const lineas = [];
frases.forEach((fr, q) => {
  const sig = frases[q + 1];
  const finFr = Math.min(fr[fr.length - 1].f + 0.22, sig ? sig[0].i - 0.02 : FIN);
  fr.forEach((p, k) => lineas.push(`Dialogue: 0,${h(k ? p.i : p.i - 0.03)},${h(k < fr.length - 1 ? fr[k + 1].i : finFr)},Sub,,0,0,0,,${k ? '' : ENTRA}${fr.map((x, j) => (j === k ? AM + x.t + BL : x.t)).join(' ')}`));
});
fs.writeFileSync(path.join(M, 'subs.ass'), `[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Sub,Segoe UI Black,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,1,8,3,2,50,50,720,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${lineas.join('\n')}\n`, 'utf8');

// ---------- 5. Montaje final ----------
const ms = (t) => Math.max(0, Math.round(t * 1000));
const filtro = `
[0:v]tpad=stop_mode=clone:stop_duration=${n(CIERRE + 0.1)}[b];
[1:v]setpts=PTS-STARTPTS+${n(tK1)}/TB[k1];
[2:v]setpts=PTS-STARTPTS+${n(tK2)}/TB[k2];
[3:v]setpts=PTS-STARTPTS+${n(FIN)}/TB[k3];
[b][k1]overlay=enable='between(t,${n(tK1)},${n(tK2)})':eof_action=pass[v1];
[v1][k2]overlay=enable='between(t,${n(tK2)},${n(finK2)})':eof_action=pass[v2];
[v2][k3]overlay=enable='gte(t,${n(FIN)})':eof_action=repeat[v3];
[v3]subtitles=subs.ass,format=yuv420p[v];
[0:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=pad_dur=${n(CIERRE + 0.1)}[voz];
[4:a]asplit=2[w1][w2];
[w1]adelay=${ms(tK1 - 0.10)}:all=1,volume=0.30[s1];
[w2]adelay=${ms(FIN - 0.10)}:all=1,volume=0.30[s2];
[5:a]adelay=${ms(tK2 + 0.15)}:all=1,volume=0.25[s3];
[voz][s1][s2][s3]amix=inputs=4:normalize=0:duration=first,alimiter=limit=0.95[a]`;
fs.writeFileSync(path.join(M, 'f-final.txt'), filtro.trim());
ff(['-i', 'base.mp4', '-i', 'c-k1.mp4', '-i', 'c-k2.mp4', '-i', 'c-cierre.mp4', '-i', path.join(X, 'sfx', 'whoosh.wav'), '-i', path.join(X, 'sfx', 'ding.wav'),
  '-/filter_complex', 'f-final.txt', '-map', '[v]', '-map', '[a]', '-t', n(FIN + CIERRE), '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-r', '24', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', path.join(L, SALIDA)]);
ff(['-i', path.join(L, SALIDA), '-vf', 'fps=1.5,scale=180:-2,tile=12x4', '-frames:v', '1', path.join(L, SALIDA.replace(/\.mp4$/, '-hoja.jpg'))]);

const original = CLIPS.reduce((s, c) => s + duracion(path.join(L, 'clips', c.id + '.mp4')), 0);
console.log(`Listo: ${path.join(L, SALIDA)}`);
console.log(`Clips originales: ${original.toFixed(1)} s · con voz: ${FIN.toFixed(1)} s · se quitaron ${(original - FIN).toFixed(1)} s de silencio · total con cierre: ${(FIN + CIERRE).toFixed(1)} s`);
console.log('Tramos:', tramos.map((t) => `${t.clip.slice(0, 1)}[${t.ini.toFixed(2)}-${t.fin.toFixed(2)}]`).join(' '));
console.log('Frases:', frases.map((fr) => fr.map((x) => x.t).join(' ')).join(' / '));
