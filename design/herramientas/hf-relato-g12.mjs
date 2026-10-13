// Guion 12 largo "Ese martes" (pagas el gimnasio y dejas de ir): estilo Dark con Jhonny. Sale del molde del guion 10
// (hf-relato-g10.mjs). Lo que cambia: el gancho es el micrófono a oscuras del guion 9, sin letras; el medio del video
// habla del que mira (no hay historia de otro; la prueba es un estudio de diez segundos); la voz ya llega limpia y la de
// los clips de Jhonny ya llega igualada con la narración (voz-limpiar.py); y la app (el día difícil) va debajo de la voz.
// Uso: node design/herramientas/hf-relato-g12.mjs [--solo-html]
//      después, dentro de campana/guion12/hyperframes: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//
// Tramos (SEGS): Jhonny · voz (lo que pasa) · Jhonny · voz (la prueba y la solución) · Jhonny · voz sobre la app · Jhonny · cola.
// Antes de correrlo tienen que existir, en guion12/:
// - voz/martes-v2-limpia-sin-pausas.mp3 y su .palabras.json (voz-limpiar.py → voz-empalmar-g12.py → voz-sin-pausas.py → transcribir);
// - clips/1-gancho, 2-vuelta, 3-regla y 4-invitacion (.mp4, .palabras.json y -juan-limpia.wav);
// - imagenes/1-oficina … 6-sentadillas y 8-londres (.jpg); y en campana/app-llenado/: vhoy-NN.png, cal-NN.png y viaje.mp4.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const NOMBRE = 'guion12';
const BASE_DIR = path.join(C, 'guion12');
const VOZ = path.join(BASE_DIR, 'voz', 'martes-v2-limpia-sin-pausas');
const P = path.join(BASE_DIR, 'hyperframes');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const PELO = 0.004;
const SOLO_HTML = process.argv.includes('--solo-html');

const limpia = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ]/g, '');
// la transcripción escribe "a apagar" donde la voz dice "a pagar"
const OTRA = { pagar: 'apagar' };
const igual = (escrita, dicha) => { const a = limpia(escrita), b = limpia(dicha); return a === b || OTRA[a] === b; };

// ---------- la voz en off ----------
const pal = JSON.parse(fs.readFileSync(VOZ + '.palabras.json', 'utf8')).palabras;
const W = { martes: 2, sales: 4, llegas: 8, manana: 12, pero: 14, vas: 16, aLa: 17, ya: 21, que: 22, yAl: 23, pagar: 29, yVuelves: 30, fallarte: 33,
  en: 34, londres: 35, n96: 38, mientras: 40, algunas: 44, fallaron: 45, pero2: 48, volvieron: 49, yEl: 50, igual: 54, fallar: 55, nada: 60, noVolver: 61, si: 63,
  entonces: 64, ganas: 72, castigarte: 74, elDia: 75, minimo: 80, diez: 81, casa: 85, yAlOtro: 86, vuelves: 90,
  porEso: 91, racha: 94, app: 96, dificiles: 102, hagas: 103, esencial: 106, minimo2: 108, yEse: 115, cuenta: 118, laPagas: 119, vez: 122, mensualidad: 124, molestos: 128 };
const ESPERO = { martes: 'martes', vas: 'vas', que: 'que', pagar: 'apagar', fallarte: 'fallarte', londres: 'londres', n96: '96', igual: 'igual', nada: 'nada', si: 'si', castigarte: 'castigarte', diez: '10', vuelves: 'vuelves', racha: 'racha', dificiles: 'dificiles', cuenta: 'cuenta', molestos: 'molestos' };
for (const [k, v] of Object.entries(ESPERO)) if (limpia(pal[W[k]].t) !== v && !(k === 'pagar' && limpia(pal[W[k]].t) === 'pagar')) { console.log(`FALLA: la palabra ${W[k]} debía ser "${v}" y la voz dice "${pal[W[k]].t}".`); process.exit(1); }

// ---------- los clips de Jhonny ----------
// saltar: palabras que Jhonny repitió y se cortan (número de palabra en la transcripción del clip).
// pre: el clip 2 trae letras quemadas por Flow sobre el micrófono ("yo he estado ahí" de 1,0 a 3,0 s y "un sistema" de 5,4 a 7,0 s,
// en x 210-510, y 955-990 del clip de 720 × 1280): se borran con delogo antes de cortar.
const AVATAR = [
  { id: 'av1', clip: '1-gancho', dice: 'Imagínate pagar el gimnasio y pasar semanas sin volver. Eso no es pereza, y te puedo decir cómo pasa.', renglones: ['imagínate pagar el gimnasio', 'y pasar semanas sin volver.', 'eso no es pereza,', 'y te puedo decir cómo pasa.'], antes: 1.0, saltar: [11, 12] },
  { id: 'av2', clip: '2-vuelta', dice: 'Sé que da rabia oírlo; yo he estado ahí. Pero el problema no es faltar al gimnasio: es no tener un sistema para los días difíciles.', renglones: ['sé que da rabia oírlo;', 'yo he estado ahí.', 'pero el problema', 'no es faltar al gimnasio:', 'es no tener un sistema', 'para los días difíciles.'], antes: 0.15, saltar: [22, 23], pre: "delogo=x=196:y=944:w=328:h=58:enable='between(t,0.8,3.2)+between(t,5.2,7.2)'," },
  { id: 'av3', clip: '3-regla', dice: 'No era solo el ejercicio: también cursos y libros. Hasta que entendí algo: un día malo es parte del proceso. Dos seguidos, no.', renglones: ['no era solo el ejercicio:', 'también cursos y libros.', 'hasta que entendí algo:', 'un día malo', 'es parte del proceso.', 'dos seguidos, no.'], antes: 0.15 },
  { id: 'av4', clip: '4-invitacion', dice: 'Así que si estás cansado de pagar mensualidades de cosas que después dejas, escribe Racha y te la muestro.', renglones: ['así que si estás cansado', 'de pagar mensualidades', 'de cosas que después dejas,', 'escribe Racha', 'y te la muestro.'], antes: 0.15, despues: 0.45 },
];
const DESPUES = 0.3;
for (const av of AVATAR) {
  const mp4 = path.join(BASE_DIR, 'clips', av.clip + '.mp4'), pj = path.join(BASE_DIR, 'clips', av.clip + '.palabras.json');
  const escritas = av.dice.split(' ');
  const todas = JSON.parse(fs.readFileSync(pj, 'utf8')).palabras.map((p, idx) => ({ ...p, idx }));
  const ps = todas.filter((p) => !(av.saltar ?? []).includes(p.idx));
  const alinea = (desde) => { const sal = []; let j = desde; for (const e of escritas) { if (ps[j] && igual(e, ps[j].t)) sal.push(ps[j++]); else return null; } return sal; };
  av.palabras = null;
  for (let i = 0; i < ps.length && !av.palabras; i++) av.palabras = alinea(i);
  if (!av.palabras) { console.log(`FALLA: el clip ${av.clip} no dice la frase del guion completa. Dijo: ${ps.map((p) => p.t).join(' ')}`); process.exit(1); }
  // Se parte donde hace una pausa larga (más de 0,7 s) o donde se le quitó una palabra repetida: en el corte la cámara se acerca
  const grupos = [[av.palabras[0]]];
  av.palabras.slice(1).forEach((p) => { const g = grupos[grupos.length - 1], u = g[g.length - 1]; if (p.i - u.f > 0.7 || p.idx - u.idx > 1) grupos.push([p]); else g.push(p); });
  av.tramos = grupos.map((g, j) => {
    const primera = g[0], ultima = g[g.length - 1], antes = todas[primera.idx - 1], sigue = todas[ultima.idx + 1];
    const de = j === 0 ? Math.max(0, primera.i - av.antes) : Math.max(antes.f + 0.01, primera.i - 0.18);
    const a = j === grupos.length - 1 ? ultima.f + (av.despues ?? DESPUES) : Math.min(sigue.i - 0.01, ultima.f + 0.22);
    return { de, a, z: (av.zBase ?? 1) + 0.12 * j };
  });
  let acum = 0; av.tiempos = []; av.cortes = [];
  grupos.forEach((g, j) => { if (j) av.cortes.push(acum); g.forEach((p) => av.tiempos.push(acum + p.i - av.tramos[j].de)); acum += av.tramos[j].a - av.tramos[j].de; });
  av.dura = acum;
  av.antesReal = av.palabras[0].i - av.tramos[0].de;
  av.mp4 = mp4;
  av.vozJuan = path.join(BASE_DIR, 'clips', av.clip + '-juan-limpia.wav');
}
const [AV1, AV2, AV3, AV4] = AVATAR;

// ---------- los tramos y el reloj ----------
const SEGS = [{ av: AV1 }, { de: 0, a: 33 }, { av: AV2 }, { de: 34, a: 90 }, { av: AV3 }, { de: 91, a: 128 }, { av: AV4 }];
const VOCES = SEGS.filter((s) => s.de !== undefined);
const ENTRA_VOZ = 0.14;
let reloj = 0;
const inicioDe = new Array(pal.length);
for (const s of SEGS) {
  s.ini = reloj;
  if (s.av) { s.av.ini = reloj; reloj += s.av.dura; }
  else { for (let k = s.de; k <= s.a; k++) inicioDe[k] = reloj + ENTRA_VOZ + (pal[k].i - pal[s.de].i); s.finVoz = reloj + ENTRA_VOZ + (pal[s.a].f - pal[s.de].i); reloj = s.finVoz + 0.3; }
  s.fin = reloj;
}
const T = (k) => inicioDe[k];
// La cola: después de la invitación de Jhonny, "Tu año" llenándose (el final de ventanas-viaje.py) y la tarjeta "escribe RACHA"
const D_COLA = 9.3, EN_TARJETA = 4.85;                // los de ventanas-viaje.py (TOTAL y TARJETA): el recorrido va completo
const T_FIN = reloj, TOTAL = reloj + D_COLA, T_TARJETA = T_FIN + EN_TARJETA;
const T_APP = VOCES[2].ini, T_CAL = T(W.yEse) - 0.12, T_AV4 = AV4.ini;
// Los momentos clave, para acomodar la música (musica-mezcla-g12.py)
fs.writeFileSync(path.join(BASE_DIR, 'tiempos.json'), JSON.stringify({ total: n(TOTAL), historia: n(VOCES[0].ini), vuelta: n(AV2.ini), prueba: n(VOCES[1].ini), regla: n(AV3.ini), app: n(T_APP), invitacion: n(T_AV4), fin: n(T_FIN), tarjeta: n(T_TARJETA),
  claves: [n(T(W.fallarte)), n(T(W.si)), n(T(W.diez)), n(T(W.cuenta))], callar: [[n(T(W.aLa) - 0.1), n(T(W.ya) + 0.1)]] }, null, 1), 'utf8');

// ---------- las fotos ----------
const TOMAS = [
  { id: 'oficina', foto: '1-oficina.jpg', de: 0, hasta: W.llegas, ovalos: [[0.42, 0.3, 0.46, 0.24]], fuerza: 0.85,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }, { k: W.sales, z: 1.45, fx: 0.33, fy: 0.58, Y: 1060 }] },
  { id: 'sofa', foto: '2-sofa.jpg', de: W.llegas, hasta: W.pero, ovalos: [[0.33, 0.79, 0.22, 0.09]], ambK: W.manana,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.manana, z: 1.5, fx: 0.4, fy: 0.68, Y: 1080 }] },
  { id: 'tenis', foto: '3-tenis.jpg', de: W.pero, hasta: W.aLa, ovalos: [],
    marcos: [{ z: 1.25, fx: 0.47, fy: 0.58, Y: 1020 }] },
  { id: 'celular', foto: '4-celular.jpg', de: W.yAl, hasta: null, ovalos: [], luces: [[0.4, 0.42, 0.1, 0.085]], apaga: W.fallarte,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.pagar, z: 1.35, fx: 0.42, fy: 0.45, Y: 1080 }] },
  { id: 'londres', foto: '8-londres.jpg', de: W.en, hasta: W.algunas, ovalos: [[0.305, 0.458, 0.065, 0.042]], luces: [[0.305, 0.458, 0.038, 0.024]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }, { k: W.n96, z: 1.4, fx: 0.38, fy: 0.46, Y: 1080 }] },
  { id: 'gimnasio', foto: '5-gimnasio.jpg', de: W.entonces, hasta: W.elDia, ovalos: [[0.5, 0.5, 0.3, 0.13]], fuerza: 0.9,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.ganas, z: 1.4, fx: 0.5, fy: 0.5, Y: 1040 }] },
  { id: 'sentadillas', foto: '6-sentadillas.jpg', de: W.elDia, hasta: W.yAlOtro, ovalos: [], oscuro: 0.5,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.diez, z: 1.4, fx: 0.5, fy: 0.6, Y: 1370 }] },
  { id: 'tenis2', foto: '3-tenis.jpg', de: W.yAlOtro, hasta: null, ovalos: [[0.47, 0.61, 0.2, 0.075]], ambK: W.vuelves,
    marcos: [{ z: 1.15, fx: 0.47, fy: 0.58, Y: 1000 }, { k: W.vuelves, z: 1.6, fx: 0.47, fy: 0.6, Y: 1080 }] },
];
const finDe = { celular: AV2.ini, tenis2: AV3.ini };
for (const t of TOMAS) { t.cubre = true; t.ini = t.de === 0 ? VOCES[0].ini : T(t.de) - 0.08; t.fin = t.hasta === null ? finDe[t.id] : T(t.hasta) - 0.08; }
const FOTOS = [...new Set(TOMAS.map((t) => t.foto))];
const archivoDe = (t) => t.foto.replace(/\.jpg$/, '');

// ---------- los efectos de sonido ----------
// Nada chillón (ni toque, ni brillo, ni campana): golpes graves, latidos y el tictac grave ("relleno") que le gustó.
const VOLUMEN = { whoosh: -8, golpe: -6, pop: -9, caida: -6, boom: -2, subida: -7, neon: -8, diapositiva: -6, latido: -3, tachar: -8, relleno: -6 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const sonidos = [];
const suena = (s, t, { modo = 'golpe', db = 0 } = {}) => sonidos.push({ s, t: Math.max(0, t - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db });

// ---------- 1. sonido, fotos y clips ----------
const W0 = 1536, H0 = 2730;
const lufsDe = (archivo) => Number(spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', archivo, '-vn', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
// La voz ya viene limpia (voz-limpiar.py): aquí solo se corta el pedazo y se deja al volumen de los otros anuncios. Sin eco de sala.
const pedazoDeVoz = (origen, de, a, salida) => {
  const tmp = salida.replace(/\.wav$/, '-crudo.wav'), dur = a - Math.max(0, de);
  ff(['-ss', String(Math.max(0, de)), '-t', String(dur), '-i', origen, '-ar', '48000', '-ac', '2', tmp]);
  ff(['-i', tmp, '-af', `volume=${(-20.3 - lufsDe(tmp)).toFixed(2)}dB,alimiter=limit=0.89,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, dur - 0.08).toFixed(3)}:d=0.08`, '-ar', '48000', '-ac', '2', salida]);
  fs.unlinkSync(tmp);
};
const FILTRO = fs.readFileSync(path.join(C, 'filtro', 'filtro-campana.txt'), 'utf8').trim();
const par = (x) => Math.round(x / 2) * 2;
if (!SOLO_HTML) {
  VOCES.forEach((s, i) => pedazoDeVoz(VOZ + '.mp3', pal[s.de].i - 0.06, pal[s.a].f + 0.22, path.join(A, `voz${i + 1}.wav`)));
  for (const foto of FOTOS) {
    const origen = path.join(BASE_DIR, 'imagenes', foto), id = foto.replace(/\.jpg$/, ''), base = `scale=${W0}:${H0}:force_original_aspect_ratio=increase,crop=${W0}:${H0}`;
    ff(['-i', origen, '-vf', `${base},hue=s=0,eq=brightness=-0.1:contrast=1.24:gamma=0.88`, '-q:v', '3', path.join(A, `${id}-bn.jpg`)]);
    ff(['-i', origen, '-vf', `${base},hue=s=0,eq=brightness=0.02:contrast=1.45,colorchannelmixer=rr=1:gg=0.66:bb=0.2`, '-q:v', '3', path.join(A, `${id}-ambar.jpg`)]);
  }
  ff(['-f', 'lavfi', '-i', 'nullsrc=s=1480x2320,format=gray,geq=lum=random(1)*255,gblur=sigma=0.7,eq=contrast=1.6', '-frames:v', '1', '-q:v', '4', path.join(A, 'grano.jpg')]);
  // La app debajo de la voz: solo escenas de la app llenándose sola, como en "El golpe 101" (Johnatan, 11 oct: con el día
  // difícil ampliado "las imágenes se ven muy ampliadas y se ve feo; es mejor si mostramos solo escenas de la app llenándose
  // automáticamente, como lo teníamos"; y la cola recortada "le mochaste una parte y se ve feo").
  {
    const LL = path.join(C, 'app-llenado'), cuenta = (re) => fs.readdirSync(LL).filter((f) => re.test(f)).length, cuadros = (seg) => Math.round(seg * 30);
    const parte = (entrada, vf, N, salida) => ff([...entrada, '-vf', vf + ',setsar=1', '-frames:v', String(N), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', path.join(A, salida)]);
    const camara = (z, x, y) => `zoompan=z='${z}':x='(${x})*iw-iw/zoom/2':y='(${y})*ih-ih/zoom/2':d=1:s=1080x1920:fps=30`;
    // (a) Hoy en el computador: las barritas se llenan y se marcan los chulos
    const nHoy = cuenta(/^vhoy-\d+\.png$/), N1 = cuadros(T_CAL - T_APP);
    parte(['-framerate', (nHoy / ((N1 - 20) / 30)).toFixed(3), '-i', path.join(LL, 'vhoy-%02d.png')], `crop=1567:2786:481:0,fps=30,tpad=stop_mode=clone:stop_duration=8,${camara(`1.5+0.2*on/${N1}`, '0.306', '0.30')}`, N1, 'app.mp4');
    // (b) el mes en el celular: los días se llenan uno por uno
    const nCal = cuenta(/^cal-\d+\.png$/), N3 = cuadros(T_AV4 - T_CAL);
    parte(['-framerate', (nCal / ((N3 - 20) / 30)).toFixed(3), '-i', path.join(LL, 'cal-%02d.png')], `fps=30,tpad=stop_mode=clone:stop_duration=3,${camara(`1.0+0.14*on/${N3}`, '0.5', '0.37')}`, N3, 'cal.mp4');
    // (c) la cola: el recorrido completo por las ventanas de Progreso, que termina en "Tu año" lleno
    parte(['-i', path.join(LL, 'viaje-b.mp4')], 'fps=30,tpad=stop_mode=clone:stop_duration=2', cuadros(D_COLA), 'cola.mp4');
  }
  // Jhonny: los clips con el filtro de la campaña; el sonido es su voz ya pasada a la de Juan e igualada con la narración
  for (const av of AVATAR) {
    const yFac = av.yFac ?? 0.4;
    const v = av.tramos.map((t, j) => `[0:v]${av.pre ?? ''}trim=start=${t.de.toFixed(3)}:end=${t.a.toFixed(3)},setpts=PTS-STARTPTS,scale=${par(1080 * t.z)}:${par(1920 * t.z)},crop=1080:1920:(iw-1080)/2:(ih-1920)*${yFac},${FILTRO},fps=30[v${j}]`);
    const a = av.tramos.map((t, j) => `[1:a]atrim=start=${t.de.toFixed(3)}:end=${t.a.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${(t.a - t.de - 0.012).toFixed(3)}:d=0.012[a${j}]`);
    const junta = `${av.tramos.map((_, j) => `[v${j}][a${j}]`).join('')}concat=n=${av.tramos.length}:v=1:a=1[v][a]`;
    const crudo = path.join(A, `${av.id}-junto.wav`);
    execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', av.mp4, '-i', av.vozJuan, '-filter_complex', [...v, ...a, junta].join(';'), '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path.join(A, `${av.id}.mp4`), '-map', '[a]', '-ar', '48000', '-ac', '2', crudo], { stdio: ['ignore', 'inherit', 'inherit'] });
    pedazoDeVoz(crudo, 0, av.dura, path.join(A, `${av.id}.wav`));
    fs.unlinkSync(crudo);
  }
  // el gancho: el primer cuadro de Jhonny en ámbar, para encender solo el micrófono
  ff(['-i', path.join(A, 'av1.mp4'), '-frames:v', '1', '-vf', 'hue=s=0,eq=gamma=3.4:contrast=1.5:brightness=0.12,colorchannelmixer=rr=1:gg=0.66:bb=0.2', '-q:v', '2', path.join(A, 'mic-ambar.jpg')]);
}
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
        @font-face { font-family: "Serifa Racha"; font-weight: 400; src: local("Bodoni MT"), local("Bodoni MT Regular"), local("Georgia"); }
        @font-face { font-family: "Serifa Racha"; font-weight: 400; font-style: italic; src: local("Bodoni MT Italic"), local("Georgia Italic"); }`;
const AMBAR = '#FFB547', CREMA = '#F4E7C3';
const SERIFA = '"Serifa Racha", serif';

// ---------- 2. la cámara y las fotos ----------
const ESC = 1296 / W0;
const cam = (t, m, extra = 0) => {
  const s = m.z * (1 + extra) * ESC, X = m.X ?? 540;
  let x = X - m.fx * W0 * s, y = m.Y - m.fy * H0 * s;
  if (t.cubre) { x = Math.min(0, Math.max(1080 - W0 * s, x)); y = Math.min(0, Math.max(1920 - H0 * s, y)); }
  return `x: ${n(x)}, y: ${n(y)}, scale: ${n(s)}`;
};
const pasos = [];
const sacudida = (t, fuerza = 1) => pasos.push(
  `tl.to("#mundo", { x: ${n(-14 * fuerza)}, y: ${n(9 * fuerza)}, rotation: ${n(-0.5 * fuerza)}, duration: 0.04, ease: "none" }, ${n(t)});`,
  `tl.to("#mundo", { x: ${n(11 * fuerza)}, y: ${n(-7 * fuerza)}, rotation: ${n(0.4 * fuerza)}, duration: 0.05, ease: "none" }, ${n(t + 0.04)});`,
  `tl.to("#mundo", { x: ${n(-6 * fuerza)}, y: ${n(4 * fuerza)}, rotation: ${n(-0.2 * fuerza)}, duration: 0.05, ease: "none" }, ${n(t + 0.09)});`,
  `tl.to("#mundo", { x: 0, y: 0, rotation: 0, duration: 0.08, ease: "power2.out" }, ${n(t + 0.14)});`);
const destello = (t, fuerza = 0.16) => pasos.push(
  `tl.fromTo("#destello", { opacity: 0 }, { opacity: ${fuerza}, duration: 0.03, immediateRender: false }, ${n(t)});`,
  `tl.to("#destello", { opacity: 0, duration: 0.16, ease: "power2.out" }, ${n(t + 0.03)});`);
const neon = (sel, e, f = 1) => pasos.push(
  `tl.fromTo("${sel}", { opacity: 0 }, { opacity: ${f}, duration: 0.05, immediateRender: false }, ${n(e)});`,
  `tl.to("${sel}", { opacity: ${n(f * 0.2)}, duration: 0.04 }, ${n(e + 0.08)});`,
  `tl.to("${sel}", { opacity: ${f}, duration: 0.1 }, ${n(e + 0.15)});`);

for (const t of TOMAS) {
  const s = `#t-${t.id}`;
  pasos.push(`tl.set("${s}", { autoAlpha: 1 }, ${n(Math.max(0, t.ini - PELO))});`, `tl.set("${s}", { autoAlpha: 0 }, ${n(t.fin - PELO)});`);
  suena('diapositiva', t.ini);
  t.marcos.forEach((m, i) => {
    const desde = i === 0 ? t.ini : T(m.k) - 0.05, sig = t.marcos[i + 1], hasta = sig ? T(sig.k) - 0.05 : t.fin;
    if (i === 0) pasos.push(`tl.set("${s} .cam", { ${cam(t, m)} }, ${n(Math.max(0, desde - PELO))});`);
    else { pasos.push(`tl.to("${s} .cam", { ${cam(t, m)}, duration: 0.2, ease: "power3.out" }, ${n(desde)});`); suena('golpe', desde + 0.02, { db: -3 }); }
    const arranca = i === 0 ? desde : desde + 0.2;
    if (hasta - arranca > 0.1) pasos.push(`tl.to("${s} .cam", { ${cam(t, m, 0.05)}, duration: ${n(hasta - arranca)}, ease: "none" }, ${n(arranca)});`);
  });
  if (t.ovalos.length) neon(`${s} .amb`, t.ambK ? T(t.ambK) - 0.02 : t.ini + 0.1, t.fuerza ?? 1);
  if (t.luces) neon(`${s} .luz`, t.ini + 0.1);
  if (t.apaga) pasos.push(`tl.to("${s} .luz", { opacity: 0, duration: 0.07 }, ${n(T(t.apaga) + 0.1)});`, `tl.to("${s} .bn", { filter: "brightness(0.5)", duration: 0.3 }, ${n(T(t.apaga) + 0.1)});`);
}
const mascara = (t) => t.ovalos.map(([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, #000 55%, transparent 100%)`).join(', ');
const luz = ([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 214, 140, 0.95) 0, rgba(255, 181, 71, 0.9) 45%, rgba(255, 160, 40, 0.55) 80%, rgba(255, 150, 30, 0) 100%), radial-gradient(ellipse ${n(rx * 330)}% ${n(ry * 330)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 181, 71, 0.4) 0, rgba(255, 181, 71, 0) 100%)`;
const htmlTomas = TOMAS.map((t) => `          <div class="toma" id="t-${t.id}" data-layout-allow-overflow>
            <div class="cam" data-layout-allow-overflow>
              <img class="bn" src="assets/${archivoDe(t)}-bn.jpg" alt=""${t.oscuro ? ` style="filter: brightness(${t.oscuro})"` : ''} />${t.ovalos.length ? `
              <div class="amb" style="background-image: url('assets/${archivoDe(t)}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>
              <div class="amb bri" style="background-image: url('assets/${archivoDe(t)}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>` : ''}${t.luces ? `
              <div class="luz" style="background: ${t.luces.map(luz).join(', ')}"></div>` : ''}
            </div>
          </div>`).join('\n');

// ---------- 3. las letras pequeñas de la voz en off ----------
const BLOQUES = [
  ['es un ~martes cualquiera:'], ['sales tarde', 'del trabajo,'], ['llegas cansado', 'y dices:'], ['mañana voy.'], ['pero no vas.'],
  ['a la semana dices:'], ['~ya ~qué.'], ['y al mes', 'lo vuelves a pagar,'], ['y vuelves', 'a fallarte.'],
  ['en Londres siguieron', 'a ~96 ~personas'], ['mientras creaban', 'un hábito.'], ['algunas fallaron un día,'], ['pero volvieron,'], ['y el hábito', 'siguió igual.'],
  ['~fallar ~un ~día ~no ~daña ~nada;'], ['~no ~volver, ~sí.'],
  ['entonces no tienes', 'que obligarte'], ['a ir sin ganas,', 'ni castigarte.'], ['el día difícil', 'haces lo mínimo:'], ['~10 ~sentadillas', 'en la casa.'], ['y al otro día', 'vuelves.'],
  ['por eso creamos', 'Racha, una app'], ['para que en esos', 'días difíciles'], ['hagas solo', 'lo esencial,'], ['lo mínimo de ese hábito', 'que estás construyendo.'], ['y ese día cuenta.'],
  ['la pagas una vez:'], ['sin mensualidad'], ['y sin anuncios molestos.'],
];
let cuenta = 0;
const bloques = BLOQUES.map((renglones, b) => ({ id: `b${b}`, de: cuenta, renglones: renglones.map((r) => r.split(' ').map((tx) => {
  const oculta = tx.startsWith('~'), escrita = oculta ? tx.slice(1) : tx, k = cuenta++;
  if (!pal[k] || !igual(escrita, pal[k].t)) { console.log(`FALLA: en las letras, la palabra ${k} es "${escrita}" y la voz dice "${pal[k]?.t}".`); process.exit(1); }
  return { tx: escrita, k, oculta };
})) }));
if (cuenta !== pal.length) { console.log(`FALLA: las letras tienen ${cuenta} palabras y la voz ${pal.length}.`); process.exit(1); }
const segDe = (k) => VOCES.find((s) => k >= s.de && k <= s.a);
const htmlBloques = bloques.filter((b) => b.renglones.flat().some((w) => !w.oculta)).map((b) => `        <div class="bl${segDe(b.de) === VOCES[2] ? ' sa' : ''}" id="${b.id}">
${b.renglones.map((r) => r.filter((w) => !w.oculta)).filter((r) => r.length).map((r) => `          <p class="r">${r.map((w) => `<span class="w" id="w${w.k}">${w.tx}</span>`).join(' ')}</p>`).join('\n')}
        </div>`).join('\n');
bloques.forEach((b, i) => {
  const visibles = b.renglones.flat().filter((w) => !w.oculta);
  visibles.forEach((w) => pasos.push(`tl.fromTo("#w${w.k}", { opacity: 0, filter: "blur(9px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power1.out", immediateRender: false }, ${n(Math.max(0, T(w.k) - 0.04))});`));
  if (visibles.length && segDe(b.de) === VOCES[2]) pasos.push(`tl.set("#${b.id}", { opacity: 1 }, ${n(T(visibles[0].k) - 0.08)});`);
  const sig = bloques[i + 1], ultimo = b.renglones.flat().at(-1).k;
  const sale = sig && segDe(sig.de) === segDe(b.de) ? T(sig.de) - 0.16 : segDe(ultimo).finVoz + 0.12;
  if (visibles.length) pasos.push(`tl.to("#${b.id}", { opacity: 0, filter: "blur(8px)", duration: 0.12, ease: "power1.in" }, ${n(Math.min(sale, TOTAL - 0.2))});`);
});

// ---------- 4. lo que va en grande y los dibujos ----------
const aparece = (sel, t, { dur = 0.22, escala = 1.08, borroso = 14 } = {}) => pasos.push(`tl.fromTo("${sel}", { opacity: 0, filter: "blur(${borroso}px)", scale: ${escala} }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ${dur}, ease: "power2.out", immediateRender: false }, ${n(t)});`);
const seVa = (sel, t, dur = 0.12) => pasos.push(`tl.to("${sel}", { opacity: 0, duration: ${dur}, ease: "power1.in" }, ${n(t - dur)});`);
const rejilla = (de, a) => pasos.push(`tl.set("#rejilla", { opacity: 1 }, ${n(de - PELO)});`, `tl.set("#rejilla", { opacity: 0 }, ${n(a - PELO)});`);
const fondoClaro = (de) => pasos.push(`tl.set("#root", { backgroundColor: "rgba(0,0,0,0)" }, ${n(de - PELO)});`);

// (a) "Es un martes cualquiera": la palabra en grande
aparece('#martes', T(W.martes) - 0.04, { dur: 0.3, escala: 1.14, borroso: 16 }); suena('boom', T(W.martes), { db: -5 }); sacudida(T(W.martes), 0.5);
seVa('#martes', T(W.llegas) - 0.08, 0.12);
// (b) "A la semana dices: ya qué": todo se apaga y queda la frase sola (como en "El efecto ya qué")
rejilla(T(W.aLa) - 0.08, T(W.yAl) - 0.08);
suena('latido', T(W.ya) - 0.6); suena('latido', T(W.ya) - 0.3);
aparece('#yaque', T(W.ya) - 0.04, { dur: 0.2, escala: 1.2 }); suena('boom', T(W.ya) + 0.02, { db: -1 }); sacudida(T(W.ya) + 0.03, 0.7);
seVa('#yaque', T(W.yAl) - 0.08, 0.1);
// (c) "Y al mes lo vuelves a pagar": cae el aviso del cobro; en "fallarte" se apaga la pantalla del celular
pasos.push(`tl.fromTo("#cobro", { opacity: 0, y: -160, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "back.out(1.6)", immediateRender: false }, ${n(T(W.pagar) - 0.1)});`);
suena('golpe', T(W.pagar) - 0.02, { db: 1 }); suena('caida', T(W.pagar) - 0.1, { modo: 'ini', db: -4 });
suena('latido', T(W.fallarte) - 0.55); suena('latido', T(W.fallarte) - 0.27);
suena('boom', T(W.fallarte) + 0.08, { db: 0 }); sacudida(T(W.fallarte) + 0.09, 1); destello(T(W.fallarte) + 0.08, 0.08);
pasos.push(`tl.to("#cobro", { opacity: 0.35, filter: "grayscale(1) brightness(0.6)", duration: 0.3 }, ${n(T(W.fallarte) + 0.1)});`);
seVa('#cobro', AV2.ini, 0.08);
// (d) "noventa y seis personas": el número
aparece('#n96', T(W.n96) - 0.04, { dur: 0.3, escala: 1.14, borroso: 16 }); suena('boom', T(W.n96), { db: -4 }); sacudida(T(W.n96), 0.6);
seVa('#n96', T(W.algunas) - 0.08, 0.12);
// (e) "Algunas fallaron un día, pero volvieron, y el hábito siguió igual": una fila de días; uno queda en hueco y la fila sigue
rejilla(T(W.algunas) - 0.08, T(W.entonces) - 0.08);
suena('diapositiva', T(W.algunas) - 0.08);
const ND = 12, HUECO = 5;
pasos.push(`tl.fromTo("#fila .d", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.12, stagger: 0.03, ease: "back.out(2)", immediateRender: false }, ${n(T(W.algunas) - 0.04)});`);
for (let i = 0; i < HUECO; i++) pasos.push(`tl.to("#d${i}", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", boxShadow: "0 0 22px rgba(255,181,71,0.7)", duration: 0.08 }, ${n(T(W.algunas) + 0.12 + i * (T(W.fallaron) - T(W.algunas)) / HUECO)});`);
pasos.push(`tl.to("#d${HUECO}", { borderStyle: "dashed", borderColor: "rgba(244,231,195,0.75)", scale: 1.18, duration: 0.12 }, ${n(T(W.fallaron) + 0.1)});`, `tl.to("#d${HUECO}", { scale: 1, duration: 0.2 }, ${n(T(W.pero2) - 0.05)});`);
suena('golpe', T(W.fallaron) + 0.12, { db: -2 });
for (let i = HUECO + 1; i < ND; i++) pasos.push(`tl.to("#d${i}", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", boxShadow: "0 0 22px rgba(255,181,71,0.7)", duration: 0.08 }, ${n(T(W.volvieron) + (i - HUECO - 1) * (T(W.igual) + 0.2 - T(W.volvieron)) / (ND - HUECO - 1))});`);
suena('relleno', T(W.algunas) + 0.1, { modo: 'ini', db: -1 }); suena('relleno', T(W.volvieron), { modo: 'ini', db: -1 });
aparece('#cita', T(W.algunas) + 0.4, { dur: 0.25 });
suena('subida', T(W.igual) + 0.2, { modo: 'fin', db: -4 }); suena('golpe', T(W.igual) + 0.2, { db: -1 });
// (f) "Fallar un día no daña nada. No volver… sí."
pasos.push(`tl.to("#fila", { y: -360, scale: 0.8, opacity: 0.55, duration: 0.3, ease: "power2.inOut" }, ${n(T(W.fallar) - 0.3)});`);
seVa('#cita', T(W.fallar) - 0.2, 0.1);
suena('latido', T(W.fallar) - 0.55); suena('latido', T(W.fallar) - 0.27);
aparece('#f1', T(W.fallar) - 0.04, { dur: 0.25, escala: 1.1 }); aparece('#f2', T(W.nada) - 0.3, { dur: 0.25, escala: 1.1 }); suena('golpe', T(W.fallar), { db: 0 }); suena('golpe', T(W.nada), { db: 0 });
aparece('#f3', T(W.noVolver) - 0.04, { dur: 0.25, escala: 1.1 });
pasos.push(`tl.fromTo("#f4", { opacity: 0, scale: 2.0, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.16, ease: "power4.in", immediateRender: false }, ${n(T(W.si) - 0.14)});`);
suena('boom', T(W.si) + 0.02, { db: 1 }); sacudida(T(W.si) + 0.03, 1.1); destello(T(W.si) + 0.02, 0.14);
pasos.push(`tl.to("#d${HUECO}", { opacity: 0.25, duration: 0.2 }, ${n(T(W.si))});`);
for (const s of ['#fila', '#f1', '#f2', '#f3', '#f4']) seVa(s, T(W.entonces) - 0.08, 0.1);
// (g) "diez sentadillas en la casa": el número
suena('latido', T(W.diez) - 0.5); suena('latido', T(W.diez) - 0.25);
pasos.push(`tl.fromTo("#diez", { opacity: 0, scale: 1.9, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.16, ease: "power4.in", immediateRender: false }, ${n(T(W.diez) - 0.12)});`);
suena('boom', T(W.diez) + 0.03, { db: 0 }); sacudida(T(W.diez) + 0.04, 0.9);
seVa('#diez', T(W.yAlOtro) - 0.08, 0.1);
// (h) "Y al otro día… vuelves": los tenis se encienden
suena('subida', T(W.vuelves), { modo: 'fin', db: -3 }); suena('boom', T(W.vuelves) + 0.03, { db: -1 }); sacudida(T(W.vuelves) + 0.04, 0.8); destello(T(W.vuelves) + 0.03, 0.1);
// (i) Racha: la app de verdad, limpia (sin grano ni viñeta). Sonidos graves y suaves; el tictac acompaña.
fondoClaro(T_APP);
pasos.push(`tl.set("#grano, .vin", { autoAlpha: 0 }, ${n(T_APP - PELO)});`);
suena('boom', T_APP + 0.02, { db: -5 }); suena('relleno', T_APP + 0.2, { modo: 'ini', db: -2 });
suena('relleno', T_APP + 3.0, { modo: 'ini', db: -3 }); suena('relleno', T_APP + 5.8, { modo: 'ini', db: -3 });
suena('latido', T(W.cuenta) - 0.5); suena('latido', T(W.cuenta) - 0.25);
suena('boom', T(W.cuenta) + 0.02, { db: -1 }); sacudida(T(W.cuenta) + 0.03, 0.5);
suena('golpe', T_CAL, { db: -5 }); suena('relleno', T_CAL + 0.1, { modo: 'ini', db: -2 });
// (j) la cola: "Tu año" llenándose y "escribe RACHA y te la muestro"
suena('boom', T_FIN + 0.02, { db: -6 });
[0.05, 1.3, 3.0, 4.8, 6.0].forEach((s) => suena('relleno', T_FIN + s, { modo: 'ini', db: -3 }));
[1.0, 2.5, 4.3].forEach((s) => suena('golpe', T_FIN + s + 0.1, { db: -8 }));
aparece('#sombra', T_TARJETA, { dur: 0.4, escala: 1, borroso: 0 });
aparece('#esc', T_TARJETA + 0.1, { dur: 0.2 });
aparece('#marca', T_TARJETA + 0.25, { dur: 0.3, escala: 1.18, borroso: 18 });
pasos.push(`tl.to("#marca", { scale: 1.05, duration: ${n(TOTAL - T_TARJETA - 0.7)}, ease: "none" }, ${n(T_TARJETA + 0.55)});`);
aparece('#ytela', T_TARJETA + 0.35, { dur: 0.25 });
suena('boom', T_TARJETA + 0.3, { db: -1 }); sacudida(T_TARJETA + 0.32, 0.6);
// Jhonny: un golpe suave al entrar y en cada corte
suena('diapositiva', AV2.ini); suena('diapositiva', AV3.ini); suena('diapositiva', AV4.ini);
for (const av of AVATAR) av.cortes.forEach((c) => suena('golpe', av.ini + c, { db: -2 }));
// el gancho: el micrófono se enciende en lo oscuro y después aparece la cara
const REV = AV1.antesReal - 0.14;
suena('neon', 0.06, { modo: 'ini', db: 2 }); suena('boom', REV + 0.02, { db: -3 });

let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
pasos.push(...Array.from({ length: Math.ceil(TOTAL * 15) }, (_, i) => `tl.set("#grano", { x: ${-Math.round(azar() * 380)}, y: ${-Math.round(azar() * 380)} }, ${n(i / 15)});`));

fs.writeFileSync(path.join(P, 'compositions', 'escena.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>${LETRAS}
        #root { position: absolute; inset: 0; overflow: hidden; background: #050506; }
        #mundo { position: absolute; inset: 0; transform-origin: 50% 50%; }
        #rejilla { position: absolute; inset: -40px; opacity: 0; background-color: #08080A; background-image: linear-gradient(rgba(244, 231, 195, 0.055) 2px, transparent 2px), linear-gradient(90deg, rgba(244, 231, 195, 0.055) 2px, transparent 2px); background-size: 116px 116px; }
        .toma { position: absolute; inset: 0; opacity: 0; visibility: hidden; }
        .cam { position: absolute; left: 0; top: 0; width: ${W0}px; height: ${H0}px; transform-origin: 0 0; }
        .cam .bn { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
        .amb { position: absolute; inset: 0; background-size: 100% 100%; opacity: 0; }
        .bri { filter: blur(30px) brightness(1.2) saturate(1.15); mix-blend-mode: screen; }
        .luz { position: absolute; inset: 0; mix-blend-mode: screen; opacity: 0; }
        .vin { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 64% at 50% 54%, transparent 42%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.62) 0, rgba(0, 0, 0, 0) 560px), linear-gradient(0deg, rgba(0, 0, 0, 0.92) 0, rgba(0, 0, 0, 0) 470px); }
        #destello { position: absolute; inset: 0; background: #FFF3D6; opacity: 0; }
        #grano { position: absolute; left: 0; top: 0; width: 1480px; height: 2320px; background: url("assets/grano.jpg"); mix-blend-mode: overlay; opacity: 0.3; }
        .bl { position: absolute; left: 0; right: 0; top: 300px; display: flex; flex-direction: column; align-items: center; }
        .r { margin: 0; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; line-height: 1.12; letter-spacing: -0.025em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 3px rgba(255, 236, 200, 0.55), 0 0 18px rgba(255, 200, 120, 0.5), 0 2px 10px rgba(0, 0, 0, 0.9); }
        .w { display: inline-block; opacity: 0; }
        .sa { top: 250px; opacity: 0; } .sa .r { background: rgba(6, 6, 8, 0.92); padding: 6px 28px 12px; margin: 3px 0; border-radius: 18px; }
        .ser { margin: 0; font-family: ${SERIFA}; font-weight: 400; line-height: 1; letter-spacing: -0.02em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 6px rgba(255, 236, 200, 0.6), 0 0 34px rgba(255, 190, 100, 0.55), 0 3px 14px rgba(0, 0, 0, 0.9); }
        .amarillo { color: ${AMBAR}; text-shadow: 0 0 8px rgba(255, 200, 110, 0.7), 0 0 44px rgba(255, 181, 71, 0.7), 0 3px 14px rgba(0, 0, 0, 0.9); }
        .centro { position: absolute; left: 0; right: 0; text-align: center; opacity: 0; }
        .chica { font-family: "Barlow", sans-serif; font-weight: 600; letter-spacing: -0.02em; color: ${CREMA}; margin: 0; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95); }
        #martes { top: 452px; font-size: 230px; }
        #yaque { top: 760px; font-size: 300px; }
        #cobro { position: absolute; left: 110px; top: 470px; width: 860px; padding: 30px 36px; border-radius: 34px; background: rgba(20, 20, 22, 0.94); border: 2px solid rgba(255, 181, 71, 0.75); box-shadow: 0 0 60px rgba(255, 181, 71, 0.35), 0 18px 40px rgba(0, 0, 0, 0.7); display: flex; align-items: center; gap: 26px; opacity: 0; }
        #cobro i { flex: none; width: 76px; height: 76px; border-radius: 20px; background: ${AMBAR}; box-shadow: 0 0 24px rgba(255, 181, 71, 0.6); }
        #cobro b { display: block; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; letter-spacing: -0.02em; color: ${CREMA}; white-space: nowrap; }
        #cobro span { display: block; margin-top: 4px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 40px; color: ${AMBAR}; }
        #n96 { top: 452px; font-size: 230px; } #n96 small { display: block; font-size: 84px; margin-top: 4px; }
        #fila { position: absolute; left: 96px; top: 760px; width: 888px; display: grid; grid-template-columns: repeat(6, 118px); gap: 34px 36px; }
        .d { width: 118px; height: 118px; border-radius: 50%; border: 5px solid rgba(244, 231, 195, 0.3); background-color: rgba(0, 0, 0, 0.3); opacity: 0; }
        #cita { top: 1120px; font-size: 36px; color: rgba(244, 231, 195, 0.7); }
        #f1 { top: 760px; font-size: 132px; } #f2 { top: 900px; font-size: 132px; }
        #f3 { top: 1110px; font-size: 132px; } #f4 { top: 1240px; font-size: 250px; }
        #diez { top: 400px; font-size: 400px; } #diez small { display: block; font-size: 96px; margin-top: -6px; color: ${CREMA}; }
        #sombra { position: absolute; inset: 0; background: linear-gradient(180deg, rgb(15, 17, 19) 0, rgb(15, 17, 19) 300px, rgba(15, 17, 19, 0) 352px); opacity: 0; }
        #esc { top: 286px; font-size: 68px; } #ytela { top: 1232px; font-size: 60px; }
        #marca { top: 356px; font-size: 215px; }
      </style>
      <div id="root" data-composition-id="escena" data-width="1080" data-height="1920">
        <div id="mundo" data-layout-allow-overflow>
          <div id="rejilla" data-layout-allow-overflow></div>
${htmlTomas}
          <div class="vin"></div>
          <p class="ser centro" id="martes">martes</p>
          <p class="ser centro amarillo" id="yaque">ya qué.</p>
          <div id="cobro"><i></i><div><b>Mensualidad del gimnasio</b><span>cobrada</span></div></div>
          <p class="ser centro" id="n96">96<small>personas</small></p>
          <div id="fila">${Array.from({ length: ND }, (_, i) => `<div class="d" id="d${i}"></div>`).join('')}</div>
          <p class="chica centro" id="cita">Lally y otros, 2010 · University College London</p>
          <p class="ser centro" id="f1">fallar un día</p>
          <p class="ser centro" id="f2">no daña nada.</p>
          <p class="ser centro" id="f3">no volver,</p>
          <p class="ser centro amarillo" id="f4">sí.</p>
          <p class="ser centro amarillo" id="diez">10<small>sentadillas</small></p>
          <div id="sombra"></div>
          <p class="chica centro" id="esc">escribe</p>
          <p class="ser centro amarillo" id="marca">RACHA</p>
          <p class="chica centro" id="ytela">y te la muestro</p>
        </div>
${htmlBloques}
        <div id="destello"></div>
        <div id="grano" data-layout-allow-overflow></div>
      </div>
      <script>
        (() => {
          const tl = gsap.timeline({ paused: true });
          ${pasos.join('\n          ')}
          window.__timelines["escena"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`, 'utf8');

// ---------- 5. la mezcla de los efectos ----------
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
  fs.writeFileSync(path.join(BASE_DIR, `${NOMBRE}-sonidos.txt`), [...sonidos].sort((x, y) => x.t - y.t).map((ev) => `${ev.t.toFixed(2).padStart(6)} s  ${ev.s.padEnd(12)} ${ev.db} dB`).join('\n') + '\n', 'utf8');
}

// ---------- 6. el archivo principal: la escena, Jhonny, la app, el micrófono, la pastilla y el sonido ----------
const principal = [];
AVATAR.forEach((av) => {
  principal.push(`tl.set("#${av.id}-caja", { autoAlpha: 1 }, ${n(Math.max(0, av.ini - PELO))});`, `tl.set("#${av.id}-caja", { autoAlpha: 0 }, ${n(av.ini + av.dura - PELO)});`);
  principal.push(`tl.fromTo("#${av.id}-caja .mov", { scale: 1.0 }, { scale: 1.06, duration: ${n(av.dura)}, ease: "none", immediateRender: false }, ${n(av.ini)});`);
  let k = 0;
  av.renglones.forEach((r) => r.split(' ').forEach(() => { const id = `${av.id}-w${k}`; principal.push(`tl.fromTo("#${id}", { opacity: 0.001, color: "#8a8a8a" }, { opacity: 1, color: "#FFFFFF", duration: 0.12, immediateRender: false }, ${n(av.ini + av.tiempos[k] - 0.03)});`); k++; }));
  for (let j = 0; j < av.renglones.length; j += 2) {
    const primera = av.renglones.slice(0, j).join(' ').split(' ').filter(Boolean).length, sigPar = av.renglones.slice(0, j + 2).join(' ').split(' ').filter(Boolean).length;
    principal.push(`tl.set("#${av.id}-p${j / 2}", { autoAlpha: 1 }, ${n(Math.max(0, av.ini + av.tiempos[primera] - 0.06))});`);
    principal.push(`tl.set("#${av.id}-p${j / 2}", { autoAlpha: 0 }, ${n(sigPar < av.tiempos.length ? av.ini + av.tiempos[sigPar] - 0.06 : av.ini + av.dura - PELO)});`);
  }
});
// La viñeta de Jhonny solo va mientras él está en pantalla
principal.push(`tl.set(".vin2", { autoAlpha: 0 }, 0);`);
for (const av of AVATAR) principal.push(`tl.set(".vin2", { autoAlpha: 1 }, ${n(av.ini)});`, `tl.set(".vin2", { autoAlpha: 0 }, ${n(av.ini + av.dura - PELO)});`);
// El gancho: velo negro con el micrófono titilando en ámbar; antes de la primera palabra se levanta el velo
const MIC = 'radial-gradient(ellipse 17% 25% at 51% 76%, #000 62%, transparent 100%)';
principal.push(
  `tl.to("#velo", { opacity: 0, duration: 0.3, ease: "power2.out" }, ${n(REV)});`,
  `tl.set("#mic", { opacity: 0.5 }, 0);`,
  `tl.to("#mic", { opacity: 1, duration: 0.05 }, 0.08);`,
  `tl.to("#mic", { opacity: 0.2, duration: 0.04 }, 0.17);`, `tl.to("#mic", { opacity: 1, duration: 0.05 }, 0.25);`, `tl.to("#mic", { opacity: 0.35, duration: 0.04 }, 0.34);`, `tl.to("#mic", { opacity: 1, duration: 0.1 }, 0.42);`,
  `tl.to("#mic", { opacity: 0, duration: 0.6, ease: "power1.in" }, ${n(REV + 0.1)});`);
const htmlAvatar = AVATAR.map((av, i) => `      <div class="avcaja" id="${av.id}-caja" data-layout-allow-overflow>
        <div class="mov"><video id="${av.id}" class="clip" src="assets/${av.id}.mp4" playsinline muted data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${10 + i}"></video></div>
${Array.from({ length: Math.ceil(av.renglones.length / 2) }, (_, p) => { let k = av.renglones.slice(0, p * 2).join(' ').split(' ').filter(Boolean).length; return `        <div class="sub" id="${av.id}-p${p}">${av.renglones.slice(p * 2, p * 2 + 2).map((r) => `<p>${r.split(' ').map((tx) => `<span id="${av.id}-w${k++}">${tx}</span>`).join(' ')}</p>`).join('')}</div>`; }).join('\n')}
      </div>`).join('\n');
const audioAvatar = AVATAR.map((av, i) => `      <audio id="${av.id}-voz" src="assets/${av.id}.wav" data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${20 + i}" data-volume="1"></audio>`).join('\n');
const audioVoz = VOCES.map((s, i) => `      <audio id="voz${i + 1}" src="assets/voz${i + 1}.wav" data-start="${n(s.ini + ENTRA_VOZ - 0.06)}" data-duration="${n(pal[s.a].f - pal[s.de].i + 0.28)}" data-media-start="0" data-track-index="${3 + i}" data-volume="1"></audio>`).join('\n');
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · ${NOMBRE} · Ese martes</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      @font-face { font-family: "Serifa Racha"; font-weight: 400; src: local("Bodoni MT"), local("Bodoni MT Regular"), local("Georgia"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      .avcaja { position: absolute; inset: 0; z-index: 3; opacity: 0; visibility: hidden; overflow: hidden; background: #000; }
      .avcaja .mov { position: absolute; inset: 0; transform-origin: 50% 40%; }
      .avcaja video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
      .sub { position: absolute; left: 0; right: 0; top: 1118px; text-align: center; opacity: 0; visibility: hidden; }
      .sub p { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 54px; line-height: 1.14; letter-spacing: -0.025em; color: #fff; white-space: nowrap; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95), 0 0 3px rgba(0, 0, 0, 0.9); }
      .sub span { display: inline-block; opacity: 0.001; }
      #velo { position: absolute; inset: 0; z-index: 4; background: #000; opacity: 1; }
      #mic { position: absolute; inset: 0; z-index: 5; background: url("assets/mic-ambar.jpg") center / cover; -webkit-mask-image: ${MIC}; mask-image: ${MIC}; opacity: 0; filter: drop-shadow(0 0 30px rgba(255, 181, 71, 0.6)); }
      .vin2 { position: absolute; inset: 0; z-index: 7; pointer-events: none; background: radial-gradient(ellipse 85% 70% at 50% 45%, transparent 50%, rgba(0, 0, 0, 0.55) 100%); }
      #app, #cal, #cola { width: 100%; height: 100%; object-fit: cover; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1334px; z-index: 11; display: flex; justify-content: center; opacity: 0; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 36px; letter-spacing: -0.01em; color: #F4E7C3; background: #0F1113; border: 3px solid #FFB547; border-radius: 999px; padding: 14px 32px 18px; white-space: nowrap; box-shadow: 0 0 34px rgba(255, 181, 71, 0.4); }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="escena" class="clip" style="z-index: 1" data-composition-id="escena" data-composition-src="compositions/escena.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="0" data-width="1080" data-height="1920"></div>
${htmlAvatar}
      <div id="velo"></div>
      <div id="mic"></div>
      <div class="vin2"></div>
      <video id="app" class="clip" style="z-index: 0" src="assets/app.mp4" playsinline muted data-start="${n(T_APP)}" data-duration="${n(T_CAL - T_APP)}" data-media-start="0" data-track-index="6"></video>
      <video id="cal" class="clip" style="z-index: 0" src="assets/cal.mp4" playsinline muted data-start="${n(T_CAL)}" data-duration="${n(T_AV4 - T_CAL)}" data-media-start="0" data-track-index="7"></video>
      <video id="cola" class="clip" style="z-index: 0" src="assets/cola.mp4" playsinline muted data-start="${n(T_FIN)}" data-duration="${n(D_COLA)}" data-media-start="0" data-track-index="8"></video>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago · 7 días para probarla</span></div>
${audioVoz}
${audioAvatar}
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="9" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${principal.join('\n      ')}
      tl.fromTo("#pastilla", { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.6)", immediateRender: false }, ${n(T_TARJETA + 0.7)});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`, 'utf8');

fs.writeFileSync(path.join(BASE_DIR, 'audio.json'), JSON.stringify({ total: n(TOTAL), pistas: [...VOCES.map((s, i) => ({ archivo: `voz${i + 1}.wav`, en: n(s.ini + ENTRA_VOZ - 0.06) })), ...AVATAR.map((av) => ({ archivo: `${av.id}.wav`, en: n(av.ini) })), { archivo: 'efectos.wav', en: 0 }] }, null, 1), 'utf8');
for (const f of ['hyperframes.json', 'package.json', 'meta.json']) {
  const de = path.join(C, 'guion1', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion1').join(`campana-${NOMBRE}`), 'utf8');
}
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s · ${sonidos.length} efectos. Jhonny: ${AVATAR.map((av) => `${av.clip} ${av.ini.toFixed(1)}–${(av.ini + av.dura).toFixed(1)} (${av.tramos.length} tramos)`).join(' · ')}.`);
console.log(`martes ${T(W.martes).toFixed(1)} · sofá ${T(W.llegas).toFixed(1)} · ya qué ${T(W.ya).toFixed(1)} · cobro ${T(W.pagar).toFixed(1)} · fallarte ${T(W.fallarte).toFixed(1)} · Londres ${T(W.en).toFixed(1)} · fila ${T(W.algunas).toFixed(1)} · fallar ${T(W.fallar).toFixed(1)} · sí ${T(W.si).toFixed(1)} · gimnasio ${T(W.entonces).toFixed(1)} · diez ${T(W.diez).toFixed(1)} · vuelves ${T(W.vuelves).toFixed(1)} · app ${T_APP.toFixed(1)} · mes ${T_CAL.toFixed(1)} · invitación ${T_AV4.toFixed(1)} · cola ${T_FIN.toFixed(1)} · tarjeta ${T_TARJETA.toFixed(1)}.`);
