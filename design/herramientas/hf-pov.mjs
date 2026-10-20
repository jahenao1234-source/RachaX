// Reel "POV" (14 oct de 2026): las tomas reales de Johnatan con el portátil (grabadas en el centro comercial, la Racha de
// muestra en pantalla) intercaladas con la app llenándose sola, como en el ejemplo que pasó (referencias/oct10/
// ref5-cuadros-que-se-llenan.mp4: escenas de la persona, la pantalla filmada de cerca que se llena sola y un texto fijo arriba).
// Sin voz. Cada corte cae en un golpe de los pulsos de "Cold Case Resolution" al 1,19 (el sonido que le gustó en el final de
// "El golpe 101" y "Ese martes"). Termina con el recorrido por Progreso hasta "Tu año" y la tarjeta "escribe RACHA y te la muestro".
// Uso: node design/herramientas/hf-pov.mjs [--solo-html]   (las tomas en campana/pov1/tomas: VID_20261014_*.mp4)
//      python design/herramientas/musica-pov.py ; después check, snapshot y render dentro de campana/pov1/hyperframes
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const BASE_DIR = path.join(C, 'pov1');
// VERSION=2 (14 oct): las tomas con la app llenándose DENTRO de su pantalla (pantalla-reemplazo.py) en vez de la app suelta
// VERSION=3 (15 oct): solo el radar y Progreso dentro de su pantalla (ver el plan)
// VERSION=7 (15 oct): como la referencia (oct10/ref5): el video en un cuadro en el centro con negro arriba y abajo, la frase
// pequeña encima, 4,6 s de rutina con Luis y, cuando cae el bajo de "Midnight Minor" (91 golpes por minuto), la app llenándose
const VER = process.env.VERSION || '1', V2 = ['2', '3', '4', '5', '6', '7', '8', '9'].includes(VER), CUADRO = ['7', '8', '9'].includes(VER);
// VERSION=9 (15 oct): las 62 tomas nuevas (otro computador, cuarto oscuro): hábitos, tareas, semana y Progreso llenándose
// dentro de su pantalla, cada pantalla repartida en dos o tres ángulos (pov2-cortes.py arma los cortes de 1080 × 1080)
// VERSION=8: la 7 + Tu semana armándose en su toma (pidió "falta donde se vea la semana armándose")
const P = path.join(BASE_DIR, V2 ? `hyperframes-v${VER}` : 'hyperframes'), A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const TOMAS = process.env.TOMAS || path.join(BASE_DIR, 'tomas');   // antes en Descargas; desde el 20 oct viven aquí
const n = (x) => Number(x.toFixed(6));
const SOLO_HTML = process.argv.includes('--solo-html');

// ---------- el ritmo: un golpe de los pulsos al 1,19 ----------
const GOLPE = CUADRO ? 60 / 91 : (53.78 - 40.4) / 4 / 4 / 1.19;          // 0,7027 s (0,6593 s con Midnight Minor)
// ---------- las tomas, en orden (de: segundo de la toma; golpes: cuánto dura) ----------
// tipo 'toma': tus tomas reales · 'hoy': Hoy llenándose · 'mes': el mes llenándose · 'cola': el recorrido hasta "Tu año"
// 'pantalla': una toma suya ya con la app adentro (en pov1/) · 'final': el último cuadro de esa toma, quieto, con la tarjeta
const C2 = (n) => ({ tipo: 'pantalla', archivo: `../pov2/cortes/${n}.mp4`, de: 0.0, golpes: 2, y: 0 });
const PLAN = VER === '9' ? [
  { tipo: 'luis', archivo: 'se-levanta.mp4', de: 1.0, golpes: 2 },
  { tipo: 'luis', archivo: 'agua.mp4', de: 1.5, golpes: 1 },
  { tipo: 'luis', archivo: 'pesas-piso.mp4', de: 1.0, golpes: 2 },
  { tipo: 'luis', archivo: 'escritorio-arriba.mp4', de: 1.5, golpes: 2 },
  C2('hoy-0'), C2('hoy-1'), C2('hoy-2'),
  C2('tareas-0'), C2('tareas-1'),
  C2('semana-0'), C2('semana-1'),
  C2('progreso-0'), C2('progreso-1'), C2('progreso-2'),
  { tipo: 'final', archivo: '../pov2/cortes/progreso-2.mp4', golpes: 5, y: 0 },
] : CUADRO ? [
  // la rutina, con Luis (un solo hombre, como en la referencia), oscurecida como de cine; música suave sin batería
  { tipo: 'luis', archivo: 'se-levanta.mp4', de: 1.0, golpes: 2 },
  { tipo: 'luis', archivo: 'agua.mp4', de: 1.5, golpes: 1 },
  { tipo: 'luis', archivo: 'pesas-piso.mp4', de: 1.0, golpes: 2 },
  { tipo: 'luis', archivo: 'escritorio-arriba.mp4', de: 1.5, golpes: 2 },
  // cae el bajo: la app llenándose en su portátil
  { tipo: 'pantalla', archivo: 'pantalla-habitos-v3.mp4', de: 0.0, golpes: 5 },
  ...(VER === '8' ? [{ tipo: 'pantalla', archivo: 'pantalla-semana-v2.mp4', de: 0.0, golpes: 5, y: 380 }] : []),
  { tipo: 'pantalla', archivo: 'pantalla-radar-v2.mp4', de: 0.0, golpes: 4, y: 200 },
  { tipo: 'pantalla', archivo: 'pantalla-records-v1.mp4', de: 0.0, golpes: 4, y: 300 },
  { tipo: 'pantalla', archivo: 'pantalla-progreso-v3.mp4', de: 0.0, golpes: 6 },
  { tipo: 'final', archivo: 'pantalla-progreso-v3.mp4', golpes: 5 },
] : VER === '6' ? [
  // 15 oct: la 5 con las barritas suaves: la semana se llena día por día (lunes, martes, miércoles) y después se marcan
  // los de hoy, cada paso con un fundido (fotos de pantalla-habitos-fundido/, de la grabación VACIO=1 DIAS_HOY=14)
  { tipo: 'pantalla', archivo: 'pantalla-habitos-v3.mp4', de: 0.0, golpes: 5 },
  { tipo: 'pantalla', archivo: 'pantalla-radar-v2.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-records-v1.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-progreso-v3.mp4', de: 0.0, golpes: 6 },
  { tipo: 'final', archivo: 'pantalla-progreso-v3.mp4', golpes: 6 },
] : VER === '5' ? [
  // 15 oct: la 4 + al comienzo los hábitos de Hoy marcándose, de cerca (pidió "una donde se vean los hábitos llenándose")
  { tipo: 'pantalla', archivo: 'pantalla-habitos-v2.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-radar-v2.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-records-v1.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-progreso-v3.mp4', de: 0.0, golpes: 6 },
  { tipo: 'final', archivo: 'pantalla-progreso-v3.mp4', golpes: 6 },
] : VER === '4' ? [
  // 15 oct: la 3 + una toma más (pidió que durara más y que se llenara): el radar ya lleno y al lado suben "Este mes",
  // "Tus récords" y "Lo que dice tu gráfica" (fotos de pantalla-records-mezcla/)
  { tipo: 'pantalla', archivo: 'pantalla-radar-v2.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-records-v1.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-progreso-v3.mp4', de: 0.0, golpes: 6 },
  { tipo: 'final', archivo: 'pantalla-progreso-v3.mp4', golpes: 6 },
] : VER === '3' ? [
  // 15 oct: quitó la cámara alrededor del portátil, Hoy y el radar quieto ("no dice nada"); el radar arranca cuando ya
  // se mueve y corta apenas termina; las barras de "Dónde puedes mejorar" se llenan a la par de "Tu año"
  { tipo: 'pantalla', archivo: 'pantalla-radar-v2.mp4', de: 0.0, golpes: 4 },
  { tipo: 'pantalla', archivo: 'pantalla-progreso-v3.mp4', de: 0.0, golpes: 6 },
  { tipo: 'final', archivo: 'pantalla-progreso-v3.mp4', golpes: 6 },
] : V2 ? [
  { tipo: 'toma', archivo: 'VID_20261014_130746660.mp4', de: 0.5, golpes: 2 },   // la cámara alrededor del portátil, con la planta
  { tipo: 'pantalla', archivo: 'pantalla-prueba-v1.mp4', de: 0.0, golpes: 5 },     // Hoy: las barritas se llenan y se marcan los hábitos
  { tipo: 'pantalla', archivo: 'pantalla-radar-v1.mp4', de: 0.15, golpes: 6 },     // el radar se forma y suben los récords
  { tipo: 'toma', archivo: 'VID_20261014_130832465.mp4', de: 0.5, golpes: 1 },   // el radar ya formado, con la planta
  { tipo: 'pantalla', archivo: 'pantalla-progreso-v2.mp4', de: 0.0, golpes: 6 },   // "Tu año" se llena desde marzo y suben las barras
  { tipo: 'final', archivo: 'pantalla-progreso-v2.mp4', golpes: 6 },
] : [
  { tipo: 'toma', archivo: 'VID_20261014_130746660.mp4', de: 0.5, golpes: 2 },   // la cámara alrededor del portátil, con la planta
  { tipo: 'toma', archivo: 'VID_20261014_130254016.mp4', de: 2.0, golpes: 1 },   // Hoy en la pantalla, de frente
  { tipo: 'hoy', golpes: 4 },
  { tipo: 'toma', archivo: 'VID_20261014_130317173.mp4', de: 3.0, golpes: 2 },   // marcando los hábitos
  { tipo: 'toma', archivo: 'VID_20261014_130716939.mp4', de: 2.0, golpes: 1 },   // la gráfica en la pantalla
  { tipo: 'mes', golpes: 4 },
  { tipo: 'toma', archivo: 'VID_20261014_130820754.mp4', de: 1.0, golpes: 1 },   // Progreso de cerca
  { tipo: 'toma', archivo: 'VID_20261014_130832465.mp4', de: 0.5, golpes: 1 },   // la gráfica con la planta
  { tipo: 'cola', seg: 9.3 },
];
let reloj = 0;
PLAN.forEach((p, i) => { p.ini = reloj; p.dura = p.seg ?? p.golpes * GOLPE; p.id = `s${String(i + 1).padStart(2, '0')}`; reloj += p.dura; });
const COLA = PLAN.find((p) => p.tipo === 'cola' || p.tipo === 'final');
const TOTAL = reloj, T_TARJETA = V2 ? COLA.ini : COLA.ini + 4.85;
const CAIDA = (PLAN.find((p) => p.tipo === 'pantalla') || PLAN[0]).ini;
fs.writeFileSync(path.join(BASE_DIR, V2 ? `tiempos-v${VER}.json` : 'tiempos.json'), JSON.stringify({ total: n(TOTAL), golpe: n(GOLPE), caida: n(CAIDA), cortes: PLAN.map((p) => n(p.ini)), cola: n(COLA.ini), tarjeta: n(T_TARJETA) }, null, 1), 'utf8');

// ---------- 1. los pedazos de video ----------
const cuadros = (seg) => Math.round(seg * 30);
if (!SOLO_HTML) {
  const LL = path.join(C, 'app-llenado'), cuenta = (re) => fs.readdirSync(LL).filter((f) => re.test(f)).length;
  const camara = (z, x, y) => `zoompan=z='${z}':x='(${x})*iw-iw/zoom/2':y='(${y})*ih-ih/zoom/2':d=1:s=1080x1920:fps=30`;
  for (const p of PLAN) {
    const Q = CUADRO ? `,crop=1080:1080:0:${p.y ?? 420}` : '';   // en el cuadro: el centro de la toma (y: desde qué fila)
    const N = cuadros(p.dura), sal = path.join(A, p.id + '.mp4'), comun = ['-frames:v', String(N), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', sal];
    if (p.tipo === 'luis') {
      // clip de Luis (720 × 1280) recortado a cuadrado y oscurecido: más contraste, menos color, luces tibias y viñeta
      ff(['-ss', String(p.de), '-i', path.join(C, 'hombre', 'clips', p.archivo), '-vf', `crop=iw:iw:0:(ih-iw)*0.45,scale=1080:1080:flags=lanczos,fps=30,eq=brightness=-0.07:contrast=1.22:saturation=0.68:gamma=0.9,colorbalance=rs=0.03:bs=-0.02:rh=0.06:gh=0.02:bh=-0.05,vignette=angle=PI/4.5,setsar=1`, ...comun]);
    } else if (p.tipo === 'toma') {
      // la toma viene parada (1728 × 3840): se recorta al centro a 9:16 y se baja a 1080 × 1920; un toque menos de azul
      ff(['-ss', String(p.de), '-i', path.join(TOMAS, p.archivo), '-vf', `crop=iw:iw*16/9:0:(ih-iw*16/9)/2,scale=1080:1920,fps=30,colorbalance=bs=-0.04:bm=-0.03,setsar=1`, ...comun]);
    } else if (p.tipo === 'pantalla') {
      ff(['-ss', String(p.de), '-i', path.join(BASE_DIR, p.archivo), '-vf', `fps=30,tpad=stop_mode=clone:stop_duration=2,colorbalance=bs=-0.04:bm=-0.03${Q},setsar=1`, ...comun]);
    } else if (p.tipo === 'final') {
      // el último cuadro de la toma, quieto (la cámara se acerca despacio desde la animación de la página)
      ff(['-sseof', '-0.1', '-i', path.join(BASE_DIR, p.archivo), '-vf', `fps=30,tpad=stop_mode=clone:stop_duration=${(p.dura + 1).toFixed(2)},colorbalance=bs=-0.04:bm=-0.03${Q},setsar=1`, ...comun]);
    } else if (p.tipo === 'hoy') {
      // como en "Ese martes": Hoy en el computador, las barritas se llenan y se marcan los chulos (ya aprobado así)
      const k = cuenta(/^vhoy-\d+\.png$/);
      ff(['-framerate', (k / ((N - 12) / 30)).toFixed(3), '-i', path.join(LL, 'vhoy-%02d.png'), '-vf', `crop=1567:2786:481:0,fps=30,tpad=stop_mode=clone:stop_duration=8,${camara(`1.5+0.2*on/${N}`, '0.306', '0.30')},setsar=1`, ...comun]);
    } else if (p.tipo === 'mes') {
      const k = cuenta(/^cal-\d+\.png$/);
      ff(['-framerate', (k / ((N - 12) / 30)).toFixed(3), '-i', path.join(LL, 'cal-%02d.png'), '-vf', `fps=30,tpad=stop_mode=clone:stop_duration=3,${camara(`1.0+0.14*on/${N}`, '0.5', '0.37')},setsar=1`, ...comun]);
    } else {
      ff(['-i', path.join(LL, 'viaje-b.mp4'), '-vf', 'fps=30,tpad=stop_mode=clone:stop_duration=2,setsar=1', ...comun]);
    }
  }
}

// ---------- 2. los efectos (nada chillón: golpes sordos, el tictac grave y un boom en la tarjeta) ----------
const SON = path.join(C, 'sonidos'), MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const VOLUMEN = { golpe: -11, whoosh: -12, relleno: -6, boom: -4 };
const sonidos = [];
const suena = (s, t, { modo = 'golpe', db = 0 } = {}) => sonidos.push({ s, t: Math.max(0, t - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db });
if (CUADRO) suena('whoosh', CAIDA, { db: -2 });
else PLAN.forEach((p, i) => {
  if (i && p.tipo !== 'final') suena(p.tipo === 'toma' ? 'golpe' : 'whoosh', p.ini);
  if (p.tipo === 'hoy' || p.tipo === 'mes') { suena('relleno', p.ini + 0.15, { modo: 'ini' }); suena('relleno', p.ini + 1.55, { modo: 'ini', db: -1 }); }
  if (p.tipo === 'pantalla') for (let t = 0.3; t < p.dura - 0.3; t += 1.2) suena('relleno', p.ini + t, { modo: 'ini', db: -2 });
});
if (!V2) [0.05, 1.3, 3.0].forEach((s) => suena('relleno', COLA.ini + s, { modo: 'ini', db: -2 }));
suena('boom', T_TARJETA + 0.3, { db: 1 });
{
  const SR = 48000, mezcla = new Float32Array(Math.ceil(TOTAL * SR) * 2);
  for (const ev of sonidos) {
    const b = fs.readFileSync(path.join(SON, ev.s + '.wav')), datos = b.subarray(b.indexOf('data') + 8), g = 10 ** (ev.db / 20) / 32768, en = Math.round(ev.t * SR) * 2;
    for (let i = 0; i < datos.length / 2 && en + i < mezcla.length; i++) mezcla[en + i] += datos.readInt16LE(i * 2) * g;
  }
  const sal = Buffer.alloc(44 + mezcla.length * 2);
  sal.write('RIFF', 0); sal.writeUInt32LE(36 + mezcla.length * 2, 4); sal.write('WAVEfmt ', 8); sal.writeUInt32LE(16, 16); sal.writeUInt16LE(1, 20); sal.writeUInt16LE(2, 22);
  sal.writeUInt32LE(SR, 24); sal.writeUInt32LE(SR * 4, 28); sal.writeUInt16LE(4, 32); sal.writeUInt16LE(16, 34); sal.write('data', 36); sal.writeUInt32LE(mezcla.length * 2, 40);
  mezcla.forEach((v, i) => sal.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(A, 'efectos.wav'), sal);
  fs.writeFileSync(path.join(BASE_DIR, V2 ? `pov1-v${VER}-sonidos.txt` : 'pov1-sonidos.txt'), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(10)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}

// ---------- 3. la página ----------
fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', 'barlow', 'files', 'barlow-latin-600-normal.woff2'), path.join(A, 'fuentes', 'barlow-600.woff2'));
const FRASE = (process.env.FRASE || 'POV: dejé de empezar|de cero cada lunes').split('|').join('<br>');   // PROVISIONAL: la aprueba Johnatan
const videos = PLAN.map((p, i) => `      <video id="${p.id}" class="clip v${['toma', 'pantalla', 'final', 'luis'].includes(p.tipo) ? '' : ' app'}" src="assets/${p.id}.mp4" playsinline muted data-start="${n(p.ini)}" data-duration="${n(p.dura)}" data-media-start="0" data-track-index="${1 + (i % 2)}"></video>`).join('\n');
const pasos = [];
for (const p of PLAN) {
  // las tomas reales: un empujón suave de cámara; la app: inclinada y acercándose, como filmada de cerca (como en el ejemplo)
  if (p.tipo === 'final') pasos.push(`tl.fromTo("#${p.id}", { scale: 1.06 }, { scale: 1.14, duration: ${n(p.dura)}, ease: "none" }, ${n(p.ini)});`);
  else if (p.tipo === 'toma' || p.tipo === 'pantalla' || p.tipo === 'luis') pasos.push(`tl.fromTo("#${p.id}", { scale: 1.0 }, { scale: 1.06, duration: ${n(p.dura)}, ease: "none" }, ${n(p.ini)});`);
  else if (p.tipo !== 'cola') pasos.push(`tl.fromTo("#${p.id}", { scale: 1.16, rotation: -2.6, y: 30 }, { scale: 1.08, rotation: -1.2, y: 0, duration: ${n(p.dura)}, ease: "power1.out" }, ${n(p.ini)});`);
}
pasos.push(`tl.to("#frase", { opacity: 0, duration: 0.2 }, ${n(COLA.ini - 0.1)});`);
const aparece = (sel, t, { dur = 0.25, escala = 1.08, borroso = 14 } = {}) => pasos.push(`tl.fromTo("${sel}", { opacity: 0, filter: "blur(${borroso}px)", scale: ${escala} }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ${dur}, ease: "power2.out", immediateRender: false }, ${n(t)});`);
aparece('#sombra', T_TARJETA, { dur: 0.4, escala: 1, borroso: 0 });
aparece('#esc', T_TARJETA + 0.1, { dur: 0.2 });
aparece('#marca', T_TARJETA + 0.25, { dur: 0.3, escala: 1.18, borroso: 18 });
pasos.push(`tl.to("#marca", { scale: 1.05, duration: ${n(TOTAL - T_TARJETA - 0.7)}, ease: "none" }, ${n(T_TARJETA + 0.55)});`);
aparece('#ytela', T_TARJETA + 0.35, { dur: 0.25 });
pasos.push(`tl.fromTo("#pastilla", { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.6)", immediateRender: false }, ${n(T_TARJETA + 0.7)});`);

fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · POV · tomas del 14 de octubre</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      @font-face { font-family: "Serifa Racha"; font-weight: 400; src: local("Bodoni MT"), local("Bodoni MT Regular"), local("Georgia"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0F1113; }
      .clip { position: absolute; inset: 0; }
      .v { width: 100%; height: 100%; object-fit: cover; transform-origin: 50% 50%; }
      .app { box-shadow: 0 0 80px rgba(0, 0, 0, 0.8); }
      .vin { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0, rgba(0, 0, 0, 0) 520px), radial-gradient(ellipse 90% 75% at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.45) 100%); }
      #frase { position: absolute; left: 50%; transform: translateX(-50%); width: max-content; max-width: 960px; top: 226px; z-index: 6; text-align: center; background: rgba(10, 11, 13, 0.78); border-radius: 22px; padding: 16px 34px 20px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; line-height: 1.12; letter-spacing: -0.02em; color: #FFFFFF; text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95), 0 0 3px rgba(0, 0, 0, 0.9); }
      .centro { position: absolute; left: 0; right: 0; text-align: center; opacity: 0; z-index: 7; }
      .chica { font-family: "Barlow", sans-serif; font-weight: 600; letter-spacing: -0.02em; color: #F4E7C3; margin: 0; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95); }
      .ser { margin: 0; font-family: "Serifa Racha", serif; font-weight: 400; line-height: 1; letter-spacing: -0.02em; white-space: nowrap; }
      .amarillo { color: #FFB547; text-shadow: 0 0 8px rgba(255, 200, 110, 0.7), 0 0 44px rgba(255, 181, 71, 0.7), 0 3px 14px rgba(0, 0, 0, 0.9); }
${V2 ? `      #sombra { position: absolute; inset: 0; z-index: 6; background: radial-gradient(ellipse 85% 60% at 50% 46%, rgba(15, 17, 19, 0.86) 0, rgba(15, 17, 19, 0.74) 100%); opacity: 0; }
      #esc { top: 560px; font-size: 68px; } #ytela { top: 920px; font-size: 60px; }
      #marca { top: 630px; font-size: 215px; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1022px;` : `      #sombra { position: absolute; inset: 0; z-index: 6; background: linear-gradient(180deg, rgb(15, 17, 19) 0, rgb(15, 17, 19) 300px, rgba(15, 17, 19, 0) 352px); opacity: 0; }
      #esc { top: 286px; font-size: 68px; } #ytela { top: 1232px; font-size: 60px; }
      #marca { top: 356px; font-size: 215px; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1334px;`} z-index: 8; display: flex; justify-content: center; opacity: 0; }
${CUADRO ? `      #main { background: #000; }
      #cuadro { position: absolute; left: 0; top: 440px; width: 1080px; height: 1080px; overflow: hidden; background: #000; }
      #cuadro .vin { background: radial-gradient(ellipse 90% 90% at 50% 50%, transparent 62%, rgba(0, 0, 0, 0.4) 100%); }
      #frase { top: 360px; max-width: 1000px; background: none; padding: 0; border-radius: 0; font-size: 40px; line-height: 1.15; letter-spacing: -0.01em; text-shadow: none; white-space: nowrap; }
      #sombra { top: 440px; height: 1080px; bottom: auto; }
` : ''}      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 36px; letter-spacing: -0.01em; color: #F4E7C3; background: #0F1113; border: 3px solid #FFB547; border-radius: 999px; padding: 14px 32px 18px; white-space: nowrap; box-shadow: 0 0 34px rgba(255, 181, 71, 0.4); }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
${CUADRO ? `      <div id="cuadro">\n${videos}\n        <div class="vin"></div>\n      </div>` : `${videos}\n      <div class="vin"></div>`}
      <p id="frase">${FRASE}</p>
      <div id="sombra"></div>
      <p class="chica centro" id="esc">escribe</p>
      <p class="ser centro amarillo" id="marca">RACHA</p>
      <p class="chica centro" id="ytela">y te la muestro</p>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago · 7 días para probarla</span></div>
      <audio id="musica" src="assets/musica.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="8" data-volume="1"></audio>
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="9" data-volume="1"></audio>
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
  const de = path.join(C, 'guion12', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion12').join('campana-pov1'), 'utf8');
}
console.log(`Listo pov1 versión ${VER}: dura ${TOTAL.toFixed(2)} s · golpe ${GOLPE.toFixed(4)} s · ${sonidos.length} efectos · cortes ${PLAN.map((p) => p.ini.toFixed(2)).join(' ')} · tarjeta ${T_TARJETA.toFixed(2)}`);
