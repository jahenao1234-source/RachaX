// Guion 13 "Voy a cambiar" (dices que vas a cambiar y no cambias): estilo Dark con Jhonny + tomas con el efecto de papel.
// Sale del molde del guion 12 (hf-relato-g12.mjs). Lo que cambia (pedido por Johnatan el 13 de octubre de 2026):
// - el gancho es un VIDEO (una mano que escribe en una libreta) con rayitas ámbar que se van sumando, y después la cara;
// - "mitad imagen, mitad video": tres videos de banco (guion13/videos/FUENTES.md) y cuatro fotos;
// - el efecto de papel del creador (papel-tomas.py) se SUMA al Dark, repartido, "para que le dé más dinamismo";
// - en las tomas de papel la letra es de palo seco, gruesa; la palabra clave va en ÁMBAR (como resaltador sobre el papel).
// Uso: node design/herramientas/hf-relato-g13.mjs [--solo-html]
//      después, dentro de campana/guion13/hyperframes: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
// Antes de correrlo tienen que existir, en guion13/: voz/cambiar-v2-limpia-sin-pausas.mp3 y su .palabras.json;
// clips/1-gancho … 5-cierre (.mp4, .palabras.json y -juan-limpia.wav); imagenes/4-ventana, 5-domingo y 7-espejo (.jpg);
// recortes/cama.png; videos/v1-libreta, v2-maquina y v6-caminar (.mp4); y en campana/app-llenado/: cal-NN.png y viaje-b.mp4.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const py = (...args) => execFileSync('python', [path.join(AQUI, 'papel-tomas.py'), ...args.map(String)], { stdio: ['ignore', 'inherit', 'inherit'] });
const NOMBRE = 'guion13';
const BASE_DIR = path.join(C, 'guion13');
const VOZ = path.join(BASE_DIR, 'voz', 'cambiar-v2-limpia-sin-pausas');
const P = path.join(BASE_DIR, 'hyperframes');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const PELO = 0.004;
const SOLO_HTML = process.argv.includes('--solo-html');
const PRUEBA = Number(process.env.PRUEBA || 0);
const limpia = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ]/g, '');
const igual = (escrita, dicha) => limpia(escrita) === limpia(dicha);

// ---------- la voz en off ----------
const pal = JSON.parse(fs.readFileSync(VOZ + '.palabras.json', 'utf8')).palabras;
const W = { n1972: 1, el: 2, propuso: 6, casi: 10, ridiculo: 11, durante: 12, primero: 16, sentirte: 19, disciplinado: 22, para: 23, actuar: 27, bem: 30, exactamente: 34, al: 35, reves: 36,
  tu: 37, tuCerebro: 45, observando: 50, extrano: 63, cada: 64, dices: 67, cambiar: 70, noLo: 72, haces: 74, toma: 77, noTe: 79, las: 86, tipo: 90, noSig: 91, nada: 93,
  intentas: 94, domingo: 100, jurando: 104, lunes: 107, vas: 108, persona: 112, si: 113, loQue: 118, tienes: 121, ver: 125, losDias: 126, enLos: 128, cumpliste: 132,
  aunque: 133, n10: 139, aunque2: 141, lo: 144, minimo: 145, porque: 146, cuando: 147, n3: 149, n4: 150, n10b: 151, marcados: 153, pasa: 157, extrano2: 159,
  que: 160, espejo: 168, y: 169, cada2: 181, fallo: 186 };
const ESPERO = { n1972: '1972', ridiculo: 'ridiculo', disciplinado: 'disciplinado', reves: 'reves', extrano: 'extrano', cambiar: 'cambiar', nada: 'nada', domingo: 'domingo', persona: 'persona', cumpliste: 'cumpliste', n10: '10', minimo: 'minimo', n3: '3', n10b: '10', espejo: 'espejo', fallo: 'fallo' };
for (const [k, v] of Object.entries(ESPERO)) if (limpia(pal[W[k]].t) !== v) { console.log(`FALLA: la palabra ${W[k]} debía ser "${v}" y la voz dice "${pal[W[k]].t}".`); process.exit(1); }

// ---------- los clips de Jhonny ----------
const AVATAR = [
  { id: 'av1', clip: '1-gancho', dice: 'Si llevas años diciendo voy a cambiar y sigues igual, no es por falta de ganas.', renglones: ['si llevas años diciendo', '«voy a cambiar»', 'y sigues igual,', 'no es por falta de ganas.'], antes: 0.3 },
  { id: 'av2', clip: '2-evidencia', dice: 'Pero a una mente que ya no te cree, no la convences con promesas. Con evidencia.', renglones: ['pero a una mente', 'que ya no te cree,', 'no la convences', 'con promesas.', 'con evidencia.'], antes: 0.15, saltar: [9, 10, 11, 17, 18], golpeK: 15, ajuste: { fin: { 1: 7.06 }, ini: { 2: 8.52 } } },
  { id: 'av3', clip: '3-cambio', dice: 'Dejas de ser el que siempre dice que va a cambiar, y te conviertes en alguien que simplemente hace lo que dice.', renglones: ['dejas de ser el que', 'siempre dice que va a cambiar,', 'y te conviertes en alguien', 'que simplemente', 'hace lo que dice.'], antes: 0.15, golpeK: 18 },
  { id: 'av4', clip: '4-alguien', dice: 'Te cuento esto porque conozco a alguien que también había perdido el valor de su propia palabra.', renglones: ['te cuento esto porque', 'conozco a alguien', 'que también había perdido', 'el valor de su propia palabra.'], antes: 0.15, zBase: 1.14 },
  { id: 'av5', clip: '5-cierre', dice: 'Se llama Racha. Escribe Racha aquí abajo y te la muestro.', renglones: ['se llama Racha.', 'escribe Racha aquí abajo', 'y te la muestro.'], antes: 0.15, despues: 0.45, golpeK: 3 },
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
    // ajuste: cortes puestos a mano, medidos en el sonido del clip, cuando la transcripción da mal el momento de una palabra
    const de = av.ajuste?.ini?.[j] ?? (j === 0 ? Math.max(0, primera.i - av.antes) : Math.max(antes.f + 0.01, primera.i - 0.18));
    const a = av.ajuste?.fin?.[j] ?? (j === grupos.length - 1 ? ultima.f + (av.despues ?? DESPUES) : Math.min(sigue.i - 0.01, ultima.f + 0.22));
    return { de, a, z: (av.zBase ?? 1) + 0.12 * j };
  });
  let acum = 0; av.tiempos = []; av.cortes = [];
  grupos.forEach((g, j) => { if (j) av.cortes.push(acum); g.forEach((p) => av.tiempos.push(acum + p.i - av.tramos[j].de)); acum += av.tramos[j].a - av.tramos[j].de; });
  av.dura = acum;
  av.mp4 = mp4;
  av.vozJuan = path.join(BASE_DIR, 'clips', av.clip + '-juan-limpia.wav');
}
const [AV1, AV2, AV3, AV4, AV5] = AVATAR;

// ---------- los tramos y el reloj ----------
const SEGS = [{ av: AV1 }, { de: 0, a: 112 }, { av: AV2 }, { de: 113, a: 159 }, { av: AV3 }, { av: AV4 }, { de: 160, a: 186 }, { av: AV5 }];
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
const D_COLA = 9.3, EN_TARJETA = 4.85;                // los de ventanas-viaje.py: el recorrido por Progreso va completo
const T_FIN = reloj, TOTAL = reloj + D_COLA, T_TARJETA = T_FIN + EN_TARJETA;
// Las ventanas de video (van detrás de la escena, que se vuelve transparente mientras tanto)
const D_GANCHO = AV1.tiempos[10] - 0.12;              // la libreta tapa a Jhonny hasta "no es por falta de ganas"
const V = {
  maq: { de: VOCES[0].ini, a: T(W.el) - 0.08, papel: true },               // 1972: la máquina de escribir, con trama
  ofi: { de: T(W.el) - 0.08, a: T(W.durante) - 0.08, papel: true },        // el psicólogo en su oficina (foto recreada, de espaldas), con trama
  sofa: { de: T(W.durante) - 0.08, a: T(W.para) - 0.08, papel: true },     // Luis en el sofá, recortado de su video, a saltos sobre papel
  pesas: { de: T(W.para) - 0.08, a: T(W.tu) - 0.08, papel: true },         // Luis con las pesas; en "al revés" queda patas arriba
  lib2: { de: T(W.cada) - 0.08, a: T(W.noTe) - 0.08 },                     // la libreta otra vez (Dark): "tu cerebro toma nota"
  cal1: { de: VOCES[1].ini, a: T(W.aunque) - 0.08, papel: true },          // el calendario de papel
  cam: { de: T(W.aunque) - 0.08, a: T(W.porque) - 0.08, papel: true },     // caminar de noche, con trama
  cal2: { de: T(W.porque) - 0.08, a: AV3.ini, papel: true },               // el calendario: tres, cuatro, diez
};
for (const v of Object.values(V)) v.dura = v.a - v.de;
const T_CAL = T(W.y) - 0.08;
fs.writeFileSync(path.join(BASE_DIR, 'tiempos.json'), JSON.stringify({ total: n(TOTAL), historia: n(VOCES[0].ini), vuelta: n(AV2.ini), prueba: n(VOCES[1].ini), regla: n(AV3.ini), app: n(T_CAL), invitacion: n(AV5.ini), fin: n(T_FIN), tarjeta: n(T_TARJETA),
  claves: [n(T(W.reves)), n(T(W.nada)), n(T(W.minimo)), n(T(W.fallo))], callar: [[n(T(W.las) - 0.45), n(T(W.las) - 0.02)]] }, null, 1), 'utf8');

// ---------- las fotos (Dark) ----------
const TOMAS = [
  { id: 'ventana', foto: '4-ventana.jpg', de: W.tu, hasta: W.cada, ovalos: [[0.5, 0.45, 0.06, 0.04]], luces: [[0.5, 0.45, 0.03, 0.02]], ambK: W.observando,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.46, Y: 940 }, { k: W.tuCerebro, z: 1.3, fx: 0.5, fy: 0.45, Y: 1000 }, { k: W.extrano - 3, z: 1.75, fx: 0.5, fy: 0.45, Y: 1040 }] },
  { id: 'domingo', foto: '5-domingo.jpg', de: W.intentas, hasta: null, ovalos: [],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.jurando, z: 1.4, fx: 0.55, fy: 0.55, Y: 1060 }] },
  { id: 'espejo', foto: '7-espejo.jpg', de: W.que, hasta: W.y, ovalos: [],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.espejo - 2, z: 1.35, fx: 0.62, fy: 0.42, Y: 1020 }] },
];
const finDe = { domingo: AV2.ini };
const segQueEmpiezaEn = (k) => VOCES.find((s) => s.de === k);
for (const t of TOMAS) { t.cubre = true; t.ini = segQueEmpiezaEn(t.de) ? segQueEmpiezaEn(t.de).ini : T(t.de) - 0.08; t.fin = t.hasta === null ? finDe[t.id] : T(t.hasta) - 0.08; }
const FOTOS = [...new Set(TOMAS.map((t) => t.foto))];
const archivoDe = (t) => t.foto.replace(/\.jpg$/, '');

// ---------- los efectos de sonido (graves; nada chillón) ----------
const VOLUMEN = { whoosh: -4, golpe: -2, pop: -5, caida: -4, boom: 1, subida: -4, neon: -4, diapositiva: -2, latido: 0, tachar: -6, relleno: -4, periodico: -3, garabato: -3 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const sonidos = [];
const suena = (s, t, { modo = 'golpe', db = 0 } = {}) => { if (!MEDIDAS[s]) return; sonidos.push({ s, t: Math.max(0, t - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db }); };

// ---------- 1. sonido, fotos, videos y clips ----------
const W0 = 1536, H0 = 2730;
const lufsDe = (archivo) => Number(spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', archivo, '-vn', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
const pedazoDeVoz = (origen, de, a, salida) => {
  const tmp = salida.replace(/\.wav$/, '-crudo.wav'), dur = a - Math.max(0, de);
  ff(['-ss', String(Math.max(0, de)), '-t', String(dur), '-i', origen, '-ar', '48000', '-ac', '2', tmp]);
  ff(['-i', tmp, '-af', `volume=${(-20.3 - lufsDe(tmp)).toFixed(2)}dB,alimiter=limit=0.89,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, dur - 0.08).toFixed(3)}:d=0.08`, '-ar', '48000', '-ac', '2', salida]);
  fs.unlinkSync(tmp);
};
const FILTRO = fs.readFileSync(path.join(C, 'filtro', 'filtro-campana.txt'), 'utf8').trim();
const par = (x) => Math.round(x / 2) * 2;
const cuadros = (seg) => Math.round(seg * 30);
const D_CAL = AV5.ini - T_CAL;
if (!SOLO_HTML) {
  VOCES.forEach((s, i) => pedazoDeVoz(VOZ + '.mp3', pal[s.de].i - 0.06, pal[s.a].f + 0.22, path.join(A, `voz${i + 1}.wav`)));
  for (const foto of FOTOS) {
    const origen = path.join(BASE_DIR, 'imagenes', foto), id = foto.replace(/\.jpg$/, ''), base = `scale=${W0}:${H0}:force_original_aspect_ratio=increase,crop=${W0}:${H0}`;
    ff(['-i', origen, '-vf', `${base},hue=s=0,eq=brightness=-0.1:contrast=1.24:gamma=0.88`, '-q:v', '3', path.join(A, `${id}-bn.jpg`)]);
    ff(['-i', origen, '-vf', `${base},hue=s=0,eq=brightness=0.02:contrast=1.45,colorchannelmixer=rr=1:gg=0.66:bb=0.2`, '-q:v', '3', path.join(A, `${id}-ambar.jpg`)]);
  }
  ff(['-f', 'lavfi', '-i', 'nullsrc=s=1480x2320,format=gray,geq=lum=random(1)*255,gblur=sigma=0.7,eq=contrast=1.6', '-frames:v', '1', '-q:v', '4', path.join(A, 'grano.jpg')]);
  // Los videos de banco. La libreta va en Dark (blanco y negro, oscuro); la máquina y la caminata, con el efecto de papel.
  const VID = path.join(BASE_DIR, 'videos');
  const oscuro = (de, dura, zoom, fx, fy, salida) => ff(['-ss', String(de), '-t', String(dura + 0.2), '-i', path.join(VID, 'v1-libreta.mp4'), '-vf',
    `scale=${par(1080 * zoom)}:${par(1920 * zoom)},crop=1080:1920:(iw-1080)*${fx}:(ih-1920)*${fy},hue=s=0,eq=brightness=-0.05:contrast=1.34:gamma=0.9,fps=30,noise=alls=16:allf=t,setsar=1`, '-frames:v', String(cuadros(dura)), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path.join(A, salida)]);
  oscuro(1.0, D_GANCHO, 1.0, 0.5, 0.5, 'gancho.mp4');
  py('lleno', path.join(VID, 'v2-maquina.mp4'), 1.0, V.maq.dura + 0.2, path.join(A, 'pmaq.mp4'));
  py('lleno', path.join(BASE_DIR, 'imagenes', '2-oficina-1972.jpg'), 0, V.ofi.dura + 0.2, path.join(A, 'pofi.mp4'));
  py('recorte', path.join(BASE_DIR, 'recortes', 'sofa.webm'), V.sofa.dura + 0.2, path.join(A, 'psofa.mp4'), '-', 0, 900, 1490, 0.58);
  py('recorte', path.join(BASE_DIR, 'recortes', 'pesas.webm'), V.pesas.dura + 0.2, path.join(A, 'ppesas.mp4'), '-', 0, 1150, 1365);
  py('recorte', path.join(BASE_DIR, 'recortes', 'caminar.webm'), V.cam.dura + 0.2, path.join(A, 'pcam.mp4'), '-', 0, 780, 1380, 1, 0.38);
  py('fondo', Math.max(V.cal1.dura, V.cal2.dura) + 0.2, path.join(A, 'pfondo.mp4'));
  // La app, llenándose sola: el mes en el celular debajo de "un lugar donde pudiera ver… cada día que no se falló", y la cola completa
  {
    const LL = path.join(C, 'app-llenado'), cuenta = (re) => fs.readdirSync(LL).filter((f) => re.test(f)).length;
    const parte = (entrada, vf, N, salida) => ff([...entrada, '-vf', vf + ',setsar=1', '-frames:v', String(N), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', path.join(A, salida)]);
    const camara = (z, x, y) => `zoompan=z='${z}':x='(${x})*iw-iw/zoom/2':y='(${y})*ih-ih/zoom/2':d=1:s=1080x1920:fps=30`;
    const nCal = cuenta(/^cal-\d+\.png$/), N3 = cuadros(D_CAL);
    parte(['-framerate', (nCal / ((N3 - 24) / 30)).toFixed(3), '-i', path.join(LL, 'cal-%02d.png')], `fps=30,tpad=stop_mode=clone:stop_duration=3,${camara(`1.0+0.14*on/${N3}`, '0.5', '0.37')}`, N3, 'cal.mp4');
    parte(['-i', path.join(LL, 'viaje-b.mp4')], 'fps=30,tpad=stop_mode=clone:stop_duration=2', cuadros(D_COLA), 'cola.mp4');
  }
  // Jhonny: los clips con el filtro de la campaña; el sonido es su voz ya pasada a la de Juan e igualada con la narración
  for (const av of AVATAR) {
    const v = av.tramos.map((t, j) => `[0:v]trim=start=${t.de.toFixed(3)}:end=${t.a.toFixed(3)},setpts=PTS-STARTPTS,scale=${par(1080 * t.z)}:${par(1920 * t.z)},crop=1080:1920:(iw-1080)/2:(ih-1920)*0.4,${FILTRO},fps=30[v${j}]`);
    const a = av.tramos.map((t, j) => `[1:a]atrim=start=${t.de.toFixed(3)}:end=${t.a.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${(t.a - t.de - 0.012).toFixed(3)}:d=0.012[a${j}]`);
    const junta = `${av.tramos.map((_, j) => `[v${j}][a${j}]`).join('')}concat=n=${av.tramos.length}:v=1:a=1[v][a]`;
    const crudo = path.join(A, `${av.id}-junto.wav`);
    execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', av.mp4, '-i', av.vozJuan, '-filter_complex', [...v, ...a, junta].join(';'), '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path.join(A, `${av.id}.mp4`), '-map', '[a]', '-ar', '48000', '-ac', '2', crudo], { stdio: ['ignore', 'inherit', 'inherit'] });
    pedazoDeVoz(crudo, 0, av.dura, path.join(A, `${av.id}.wav`));
    fs.unlinkSync(crudo);
  }
}
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
        @font-face { font-family: "Serifa Racha"; font-weight: 400; src: local("Bodoni MT"), local("Bodoni MT Regular"), local("Georgia"); }
        @font-face { font-family: "Serifa Racha"; font-weight: 400; font-style: italic; src: local("Bodoni MT Italic"), local("Georgia Italic"); }`;
const AMBAR = '#FFB547', CREMA = '#F4E7C3', TINTA = '#181615';
const SERIFA = '"Serifa Racha", serif';

// ---------- 2. la cámara y las fotos ----------
const ESC = 1296 / W0;
const cam = (t, m, extra = 0) => {
  const s = m.z * (1 + extra) * ESC, X = m.X ?? 540;
  let x = X - m.fx * W0 * s, y = m.Y - m.fy * H0 * s;
  if (t.cubre) { x = Math.min(0, Math.max(1080 - W0 * s, x)); y = Math.min(0, Math.max(1920 - H0 * s, y)); }
  return `x: ${n(x)}, y: ${n(y)}, scale: ${n(s)}`;
};
const pasos = ['tl.set(".vin", { autoAlpha: 1 }, 0);'];
const sacFondo = [], fondoPasos = [];
const zoomFondo = (id, t, z, o = '50% 50%', dur = 0.16) => { fondoPasos.push(`tl.to("#${id}", { scale: ${z}, transformOrigin: "${o}", duration: ${dur}, ease: "power4.out" }, ${n(t)});`); suena('whoosh', t + 0.02, { db: -3 }); };
const sacudida = (t, fuerza = 1) => { sacFondo.push([t, fuerza]); pasos.push(
  `tl.to("#mundo", { x: ${n(-14 * fuerza)}, y: ${n(9 * fuerza)}, rotation: ${n(-0.5 * fuerza)}, duration: 0.04, ease: "none" }, ${n(t)});`,
  `tl.to("#mundo", { x: ${n(11 * fuerza)}, y: ${n(-7 * fuerza)}, rotation: ${n(0.4 * fuerza)}, duration: 0.05, ease: "none" }, ${n(t + 0.04)});`,
  `tl.to("#mundo", { x: ${n(-6 * fuerza)}, y: ${n(4 * fuerza)}, rotation: ${n(-0.2 * fuerza)}, duration: 0.05, ease: "none" }, ${n(t + 0.09)});`,
  `tl.to("#mundo", { x: 0, y: 0, rotation: 0, duration: 0.08, ease: "power2.out" }, ${n(t + 0.14)});`); };
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
  if (t.luces) neon(`${s} .luz`, t.ambK ? T(t.ambK) - 0.02 : t.ini + 0.1);
}
const mascara = (t) => t.ovalos.map(([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, #000 55%, transparent 100%)`).join(', ');
const luz = ([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 214, 140, 0.95) 0, rgba(255, 181, 71, 0.9) 45%, rgba(255, 160, 40, 0.55) 80%, rgba(255, 150, 30, 0) 100%), radial-gradient(ellipse ${n(rx * 330)}% ${n(ry * 330)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 181, 71, 0.4) 0, rgba(255, 181, 71, 0) 100%)`;
const htmlTomas = TOMAS.map((t) => `          <div class="toma" id="t-${t.id}" data-layout-allow-overflow>
            <div class="cam" data-layout-allow-overflow>
              <img class="bn" src="assets/${archivoDe(t)}-bn.jpg" alt="" />${t.ovalos.length ? `
              <div class="amb" style="background-image: url('assets/${archivoDe(t)}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>
              <div class="amb bri" style="background-image: url('assets/${archivoDe(t)}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>` : ''}${t.luces ? `
              <div class="luz" style="background: ${t.luces.map(luz).join(', ')}"></div>` : ''}
            </div>
          </div>`).join('\n');

// ---------- 3. las letras pequeñas de la voz en off (solo en las tomas Dark; en las de papel van las letras gruesas) ----------
const oculto = (de, a) => [pal.slice(de, a + 1).map((p) => '~' + p.t).join(' ')];
const BLOQUES = [
  oculto(0, 11), oculto(12, 29), oculto(30, 36),
  ['tú no sabes', 'quién eres'], ['mirando', 'hacia adentro.'], ['tu cerebro descubre', 'quién eres'], ['observando lo que', 'haces desde afuera,'], ['igual que si estuvieras', 'viendo a un extraño.'],
  ['cada vez que dices', '«voy a cambiar»'], ['y no lo haces,'], ['tu cerebro', 'toma nota.'], ['no te juzga,'], ['solo registra', 'el dato:'],
  oculto(86, 93),
  ['intentas arreglarlo'], ['prometiéndote', 'metas gigantes'], ['el domingo', 'por la noche,'], ['jurando que el lunes'], ['vas a ser', 'otra persona.'],
  oculto(113, 159),
  ['que se cansó', 'de jurarse cosas'], ['en el espejo'], ['y decidió construir', 'un lugar'], ['donde pudiera ver', 'con sus propios ojos'], ['cada día', 'que no se falló.'],
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

// ---------- 4. lo que va en grande, las ventanas de video y los dibujos ----------
const aparece = (sel, t, { dur = 0.22, escala = 1.08, borroso = 14 } = {}) => pasos.push(`tl.fromTo("${sel}", { opacity: 0, filter: "blur(${borroso}px)", scale: ${escala} }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ${dur}, ease: "power2.out", immediateRender: false }, ${n(t)});`);
const seVa = (sel, t, dur = 0.12) => pasos.push(`tl.to("${sel}", { opacity: 0, duration: ${dur}, ease: "power1.in" }, ${n(t - dur)});`);
const rejilla = (de, a) => pasos.push(`tl.set("#rejilla", { opacity: 1 }, ${n(de - PELO)});`, `tl.set("#rejilla", { opacity: 0 }, ${n(a - PELO)});`);
// una ventana de video: la escena se vuelve transparente; si es de papel, sin grano ni viñeta
const ventana = (v, cierra = true) => {
  pasos.push(`tl.set("#root", { backgroundColor: "rgba(0,0,0,0)" }, ${n(Math.max(0, v.de - PELO))});`);
  pasos.push(`tl.set("${v.papel ? '#grano, .vin' : '#grano'}", { autoAlpha: 0 }, ${n(Math.max(0, v.de - PELO))});`);
  if (cierra) pasos.push(`tl.set("#root", { backgroundColor: "#050506" }, ${n(v.a - PELO)});`, `tl.set("${v.papel ? '#grano, .vin' : '#grano'}", { autoAlpha: 1 }, ${n(v.a - PELO)});`);
};
// las letras de papel entran de golpe, un poco blandas (como impresas), y salen juntas
const sale = (ids, t) => ids.forEach((id) => pasos.push(`tl.set("#${id}", { opacity: 0 }, ${n(t - PELO)});`));
const entra = (id, t, fuerte = false) => { pasos.push(fuerte
  ? `tl.fromTo("#${id}", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.15, ease: "back.out(2.4)", immediateRender: false }, ${n(Math.max(0, t - 0.05))});`
  : `tl.fromTo("#${id}", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.1, ease: "steps(2)", immediateRender: false }, ${n(Math.max(0, t - 0.04))});`); if (fuerte) suena('pop', t, { db: -1 }); };

// (a) 1972: la máquina de escribir con trama; "1972" en grande
ventana(V.maq); suena('periodico', V.maq.de + 0.02, { modo: 'ini' }); suena('whoosh', V.maq.de + 0.02);
zoomFondo('vmaq', T(W.n1972) - 0.03, 1.28, '42% 52%');
entra('a1', T(W.n1972), true); suena('boom', T(W.n1972) + 0.02, { db: -1 }); sacudida(T(W.n1972) + 0.03, 1); destello(T(W.n1972) + 0.02, 0.1);
sale(['a1'], V.maq.a);
ventana(V.ofi); suena('diapositiva', V.ofi.de);
entra('a2', T(W.el));
zoomFondo('vofi', T(4) - 0.03, 1.5, '64% 60%'); entra('a5', T(4), true); suena('golpe', T(4), { db: 0 }); sacudida(T(4) + 0.02, 0.5);
zoomFondo('vofi', T(W.propuso) - 0.03, 2.1, '64% 55%'); entra('a3', T(W.propuso));
suena('subida', T(W.casi), { modo: 'fin', db: -1 });
zoomFondo('vofi', T(W.casi) - 0.03, 1.15, '64% 60%'); entra('a4', T(W.casi), true); suena('boom', T(W.casi) + 0.02, { db: 0 }); sacudida(T(W.casi) + 0.03, 1); destello(T(W.casi) + 0.02, 0.1);
sale(['a2', 'a3', 'a4', 'a5'], V.ofi.a);
// (b) "primero tenías que sentirte… para después actuar": la persona en la cama, recortada sobre papel
ventana(V.sofa); ventana(V.pesas); suena('periodico', V.sofa.de + 0.02, { modo: 'ini' }); suena('periodico', V.pesas.de + 0.02, { modo: 'ini' });
entra('c1', T(W.durante)); zoomFondo('vsofa', T(W.primero) - 0.03, 1.18, '50% 82%'); entra('c2', T(W.primero), true);
zoomFondo('vsofa', T(W.sentirte) - 0.03, 1.38, '50% 78%'); entra('c3', T(W.sentirte), true); suena('golpe', T(W.sentirte), { db: -1 });
zoomFondo('vsofa', T(W.disciplinado) - 0.03, 1.0, '50% 82%'); entra('c4', T(W.disciplinado), true); suena('boom', T(W.disciplinado) + 0.02, { db: -2 }); sacudida(T(W.disciplinado) + 0.03, 0.7);
sale(['c1', 'c2', 'c3', 'c4'], T(W.para) - 0.05);
entra('c5', T(W.para)); zoomFondo('vpesas', T(W.actuar) - 0.03, 1.3, '50% 80%'); entra('c6', T(W.actuar), true); suena('golpe', T(W.actuar), { db: 0 }); sacudida(T(W.actuar) + 0.02, 0.5);
sale(['c5', 'c6'], T(W.bem) - 0.1);
// (c) "Bem dijo que funciona exactamente al revés": la figura queda patas arriba
zoomFondo('vpesas', T(W.bem) - 0.03, 1.0, '50% 82%'); entra('c7', T(W.bem)); zoomFondo('vpesas', T(W.exactamente) - 0.03, 1.22, '50% 82%'); entra('c8', T(W.exactamente), true);
suena('latido', T(W.al) - 0.55); suena('latido', T(W.al) - 0.28); suena('subida', T(W.al), { modo: 'fin', db: -4 });
zoomFondo('vpesas', T(W.al) - 0.03, 1.0, '50% 82%'); entra('c9', T(W.al), true); pasos.push(`tl.to("#c9", { rotation: 180, transformOrigin: "50% 50%", duration: 0.3, ease: "back.out(1.6)" }, ${n(T(W.reves) + 0.12)});`); destello(T(W.al) + 0.02, 0.12); suena('boom', T(W.al) + 0.02, { db: 0 }); sacudida(T(W.al) + 0.03, 0.9);
sale(['c7', 'c8', 'c9'], V.pesas.a);
// (d) "Cada vez que dices «voy a cambiar» y no lo haces, tu cerebro toma nota": la libreta, y una rayita por cada vez
rejilla(V.lib2.de, T(W.intentas) - 0.08); suena('diapositiva', V.lib2.de);
[W.dices, W.cambiar, W.noLo, W.haces].forEach((k, i) => { sacudida(T(k) + 0.01, 0.35); if (i) pasos.push(`tl.set("#c1-${i - 1}", { opacity: 0 }, ${n(T(k) - 0.03 - PELO)});`); pasos.push(`tl.fromTo("#c1-${i}", { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.11, ease: "back.out(2)", immediateRender: false }, ${n(T(k) - 0.03)});`); suena('golpe', T(k), { db: -3 }); });
pasos.push(`tl.to("#c1-3", { scale: 1.22, duration: 0.14, ease: "power4.out" }, ${n(T(W.toma) - 0.03)});`, `tl.set("#c1v", { opacity: 1 }, ${n(T(W.dices) - 0.03)});`);
suena('boom', T(W.toma) + 0.02, { db: -3 }); sacudida(T(W.toma) + 0.03, 0.6);
sale(['c1-0', 'c1-1', 'c1-2', 'c1-3', 'c1v'], V.lib2.a);
// (e) "…solo registra el dato: las palabras de este tipo no significan nada": se escribe a máquina sobre negro
suena('diapositiva', T(W.noTe) - 0.08);
const TP1 = 'las palabras de este tipo', TP2 = 'no significan nada.';
[...TP1].forEach((_, i) => pasos.push(`tl.set("#tp1 span:nth-child(${i + 1})", { opacity: 1 }, ${n(T(W.las) + (i / TP1.length) * (pal[W.tipo].f - pal[W.las].i))});`));
[...TP2].forEach((_, i) => pasos.push(`tl.set("#tp2 span:nth-child(${i + 1})", { opacity: 1 }, ${n(T(W.noSig) + (i / TP2.length) * (pal[W.nada].f - pal[W.noSig].i))});`));
pasos.push(`tl.set("#tp1, #tp2", { opacity: 1 }, ${n(T(W.las) - 0.1)});`);
suena('relleno', T(W.las), { modo: 'ini', db: -1 }); suena('latido', T(W.noSig) - 0.5); suena('latido', T(W.noSig) - 0.25);
suena('boom', T(W.nada) + 0.05, { db: 1 }); sacudida(T(W.nada) + 0.06, 1); destello(T(W.nada) + 0.05, 0.1);
sale(['tp1', 'tp2'], T(W.intentas) - 0.08);
// (f) "el domingo por la noche… el lunes vas a ser otra persona"
aparece('#dom', T(W.domingo) - 0.04, { dur: 0.3, escala: 1.14, borroso: 16 }); suena('boom', T(W.domingo), { db: -5 }); seVa('#dom', T(W.jurando) - 0.05);
aparece('#lun', T(W.lunes) - 0.04, { dur: 0.3, escala: 1.14, borroso: 16 }); suena('golpe', T(W.lunes), { db: -1 }); seVa('#lun', AV2.ini - 0.02, 0.1);
destello(T(W.observando), 0.08); suena('boom', T(W.observando), { db: -3 }); sacudida(T(W.lunes) + 0.02, 0.6);
suena('boom', T(W.espejo), { db: -3 }); sacudida(T(W.espejo) + 0.02, 0.5);
// (g) "tienes que obligarlo a ver los días en los que sí cumpliste": un calendario de papel que se va marcando
const ND = 30, MARCAS1 = [0, 1, 3, 4, 7, 8, 10];
ventana(V.cal1); suena('periodico', V.cal1.de + 0.02, { modo: 'ini' });
entra('k1', T(W.si)); entra('k2', T(W.loQue), true); suena('golpe', T(W.loQue), { db: -1 }); sacudida(T(W.loQue) + 0.02, 0.4);
sale(['k1', 'k2'], T(W.tienes) - 0.05);
entra('k3', T(W.tienes)); entra('k4', T(W.losDias), true); entra('k5', T(W.enLos) + 0.25, true); suena('boom', T(W.cumpliste), { db: -2 }); sacudida(T(W.cumpliste) + 0.02, 0.6);
MARCAS1.forEach((q, i) => suena('pop', T(W.ver) + i * (T(W.cumpliste) + 0.3 - T(W.ver)) / MARCAS1.length, { db: -2 }));
pasos.push(`tl.fromTo("#cuad .q", { opacity: 0 }, { opacity: 1, duration: 0.04, stagger: 0.02, immediateRender: false }, ${n(T(W.tienes) + 0.05)});`);
MARCAS1.forEach((q, i) => pasos.push(`tl.set("#q${q}", { backgroundColor: "${AMBAR}" }, ${n(T(W.ver) + i * (T(W.cumpliste) + 0.3 - T(W.ver)) / MARCAS1.length)});`));
suena('relleno', T(W.ver), { modo: 'ini', db: -1 });
sale(['k3', 'k4', 'k5', 'cuad'], V.cal1.a);
// (h) "aunque ese día solo hayas hecho diez minutos, aunque haya sido lo mínimo": caminar de noche, con trama
ventana(V.cam); suena('periodico', V.cam.de + 0.02, { modo: 'ini' });
entra('m1', T(W.aunque)); zoomFondo('vcam', T(W.n10) - 0.03, 1.25, '50% 80%'); entra('m2', T(W.n10), true); suena('golpe', T(W.n10), { db: 0 }); sacudida(T(W.n10) + 0.02, 0.5);
entra('m3', T(W.aunque2)); suena('latido', T(W.lo) - 0.5); suena('latido', T(W.lo) - 0.25);
zoomFondo('vcam', T(W.lo) - 0.03, 1.5, '50% 80%'); entra('m4', T(W.lo), true); destello(T(W.lo) + 0.03, 0.1); suena('boom', T(W.lo) + 0.03, { db: -1 }); sacudida(T(W.lo) + 0.04, 0.8);
sale(['m1', 'm2', 'm3', 'm4'], V.cam.a);
// (i) "cuando juntas tres, cuatro, diez días marcados frente a ti, pasa algo extraño": el calendario otra vez
ventana(V.cal2); suena('periodico', V.cal2.de + 0.02, { modo: 'ini' });
pasos.push(`tl.set("#cuad .q", { backgroundColor: "rgba(0,0,0,0)" }, ${n(V.cal2.de - PELO)});`, `tl.set("#cuad", { opacity: 1 }, ${n(V.cal2.de)});`);
entra('k6', T(W.cuando));
const marca = (qs, t) => qs.forEach((q, i) => pasos.push(`tl.set("#q${q}", { backgroundColor: "${AMBAR}" }, ${n(t + i * 0.06)});`));
entra('n3', T(W.n3), true); sacudida(T(W.n3) + 0.02, 0.4); marca([0, 1, 2], T(W.n3)); suena('golpe', T(W.n3), { db: -2 });
sale(['n3'], T(W.n4) - 0.03); entra('n4', T(W.n4), true); sacudida(T(W.n4) + 0.02, 0.5); marca([3], T(W.n4)); suena('golpe', T(W.n4), { db: -1 });
sale(['n4'], T(W.n10b) - 0.03); entra('n10', T(W.n10b), true); destello(T(W.n10b) + 0.02, 0.1); marca([4, 5, 6, 7, 8, 9], T(W.n10b)); suena('boom', T(W.n10b) + 0.02, { db: -1 }); sacudida(T(W.n10b) + 0.03, 0.8);
suena('relleno', T(W.n10b), { modo: 'ini', db: -1 });
entra('k7', T(W.marcados)); entra('k8', T(W.pasa), true); suena('golpe', T(W.pasa), { db: 0 });
sale(['k6', 'n10', 'k7', 'k8', 'cuad'], V.cal2.a);
// (j) "…un lugar donde pudiera ver… cada día que no se falló": la app de verdad (el mes llenándose), limpia
ventana({ de: T_CAL, papel: true }, false);
suena('boom', T_CAL + 0.02, { db: -5 }); suena('relleno', T_CAL + 0.2, { modo: 'ini', db: -2 }); suena('relleno', T_CAL + 3.0, { modo: 'ini', db: -3 });
suena('latido', T(W.cada2) - 0.5); suena('latido', T(W.cada2) - 0.25); suena('boom', T(W.fallo) + 0.03, { db: -1 }); sacudida(T(W.fallo) + 0.04, 0.5);
// (k) la cola: "Tu año" llenándose y "escribe RACHA y te la muestro"
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
for (const av of AVATAR.slice(1)) { suena('diapositiva', av.ini); suena('whoosh', av.ini + 0.02, { db: -2 }); }
for (const av of AVATAR) if (av.golpeK !== undefined) suena('golpe', av.ini + av.tiempos[av.golpeK], { db: 1 });
for (const av of AVATAR) av.cortes.forEach((c) => suena('golpe', av.ini + c, { db: -2 }));
// el gancho: una rayita ámbar por golpe sobre la libreta; al salir la cara, un golpe grande
const ANIOS = [0, 1, 2, 3, 4, 5];   // los golpes del gancho: cuatro rayitas y la diagonal
const tAnio = (i) => i === 0 ? 0 : AV1.tiempos[1] + (i - 1) * (AV1.tiempos[4] - 0.12 - AV1.tiempos[1]) / (ANIOS.length - 2);
suena('neon', 0.05, { modo: 'ini', db: 1 });
ANIOS.forEach((_, i) => { if (i) suena('golpe', tAnio(i), { db: 1 }); });
suena('garabato', AV1.tiempos[4], { modo: 'ini' }); suena('pop', AV1.tiempos[4] + 0.2, { db: -2 }); suena('pop', AV1.tiempos[4] + 0.4, { db: -3 });
suena('latido', AV1.tiempos[8] - 0.5); suena('latido', AV1.tiempos[8] - 0.25);
suena('subida', AV1.tiempos[8], { modo: 'fin' }); suena('boom', AV1.tiempos[8] + 0.02, { db: 1 });
suena('whoosh', D_GANCHO); suena('golpe', D_GANCHO + 0.02, { db: 1 });

let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
pasos.push(...Array.from({ length: Math.ceil(TOTAL * 15) }, (_, i) => `tl.set("#grano", { x: ${-Math.round(azar() * 380)}, y: ${-Math.round(azar() * 380)} }, ${n(i / 15)});`));
const letrasSueltas = (tx) => [...tx].map((ch) => `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
const RAYAS = '<i></i><i></i><i></i><i></i><b></b>';

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
        .vin { position: absolute; inset: 0; opacity: 0; background: radial-gradient(ellipse 80% 64% at 50% 54%, transparent 42%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.62) 0, rgba(0, 0, 0, 0) 560px), linear-gradient(0deg, rgba(0, 0, 0, 0.92) 0, rgba(0, 0, 0, 0) 470px); }
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
        /* las letras de las tomas de papel: de palo seco, gruesas y apretadas, un poco blandas (como impresas) */
        .pf, .pg { position: absolute; left: 84px; margin: 0; transform-origin: 0 60%; font-family: Arial, Helvetica, sans-serif; white-space: nowrap; opacity: 0; filter: blur(0.7px); }
        .pf { font-weight: 400; font-size: 56px; letter-spacing: -0.035em; color: #2b2826; }
        .pg { font-weight: 700; font-size: 150px; letter-spacing: -0.065em; line-height: 1; color: ${TINTA}; -webkit-text-stroke: 2px ${TINTA}; }
        .cl { color: #F6F0E4; -webkit-text-stroke-color: #F6F0E4; text-shadow: 0 0 18px rgba(0, 0, 0, 0.55); }
        .am { color: ${AMBAR}; -webkit-text-stroke-color: ${AMBAR}; text-shadow: 0 0 18px rgba(0, 0, 0, 0.6); }
        .res { background: ${AMBAR}; padding: 0 22px 10px 16px; left: 68px; transform: rotate(-1.4deg); transform-origin: 0 50%; }
        #a1 { top: 320px; font-size: 300px; } #a2 { top: 290px; } #a5 { top: 356px; font-size: 138px; } #a3 { top: 1010px; } #a4 { top: 1080px; font-size: 138px; }
        #c1, #c5, #c7, #k1, #k3, #k6 { top: 270px; } #c2, #c6, #c8, #k2, #k4 { top: 338px; } #c3 { top: 484px; } #c4 { top: 644px; font-size: 128px; } #c9 { top: 506px; }
        #k5 { top: 496px; font-size: 104px; }
        #m1 { top: 300px; } #m2 { top: 368px; } #m3 { top: 560px; } #m4 { top: 628px; }
        .num { top: 338px; font-size: 330px; } #k7 { top: 690px; } #k8 { top: 1560px; }
        #cuad { position: absolute; left: 121px; top: 790px; width: 838px; display: grid; grid-template-columns: repeat(6, 118px); gap: 26px; opacity: 1; filter: blur(0.6px); }
        .q { width: 118px; height: 118px; border: 6px solid rgba(24, 22, 21, 0.82); border-radius: 10px; opacity: 0; }
        .ty { position: absolute; left: 290px; top: 640px; width: 400px; height: 230px; scale: 1.35; transform-origin: 0 0; }
        .ty i { position: absolute; top: 0; width: 18px; height: 230px; border-radius: 9px; background: ${AMBAR}; box-shadow: 0 0 26px rgba(255, 181, 71, 0.85); opacity: 0; transform-origin: 50% 0; }
        .ty i:nth-child(1) { left: 20px; rotate: -3deg; } .ty i:nth-child(2) { left: 112px; rotate: 2deg; } .ty i:nth-child(3) { left: 204px; rotate: -2deg; } .ty i:nth-child(4) { left: 296px; rotate: 3deg; }
        .ty b { position: absolute; left: -34px; top: 106px; width: 440px; height: 18px; border-radius: 9px; background: ${AMBAR}; box-shadow: 0 0 26px rgba(255, 181, 71, 0.85); opacity: 0; rotate: -24deg; transform-origin: 0 50%; }
        #tp1 { top: 770px; font-size: 86px; opacity: 0; } #tp2 { top: 890px; font-size: 112px; opacity: 0; } #tp1 span, #tp2 span { opacity: 0; }
        #dom, #lun { top: 452px; font-size: 220px; }
        #sombra { position: absolute; inset: 0; background: linear-gradient(180deg, rgb(15, 17, 19) 0, rgb(15, 17, 19) 300px, rgba(15, 17, 19, 0) 352px); opacity: 0; }
        #esc { top: 286px; font-size: 68px; } #ytela { top: 1232px; font-size: 60px; }
        #marca { top: 356px; font-size: 215px; }
      </style>
      <div id="root" data-composition-id="escena" data-width="1080" data-height="1920">
        <div id="mundo" data-layout-allow-overflow>
          <div id="rejilla" data-layout-allow-overflow></div>
${htmlTomas}
          <div class="vin"></div>
          <p class="pg cl" id="a1">1972</p><p class="pf cl" id="a2">el psicólogo</p><p class="pg cl" id="a5">Daryl Bem</p><p class="pf cl" id="a3">propuso algo que suena</p><p class="pg am" id="a4">casi ridículo.</p>
          <p class="pf" id="c1">durante décadas creímos que</p><p class="pg" id="c2">primero</p><p class="pg" id="c3">sentirte</p><p class="pg res" id="c4">disciplinado</p>
          <p class="pf" id="c5">para después empezar a</p><p class="pg" id="c6">actuar.</p>
          <p class="pf" id="c7">Bem dijo que funciona</p><p class="pg" id="c8">exactamente</p><p class="pg res" id="c9">al revés.</p>
          <p class="pf" id="k1">si tu cerebro solo cree</p><p class="pg" id="k2">lo que ve,</p>
          <p class="pf" id="k3">tienes que obligarlo a ver</p><p class="pg" id="k4">los días</p><p class="pg res" id="k5">que sí cumpliste.</p>
          <div id="cuad">${Array.from({ length: ND }, (_, i) => `<div class="q" id="q${i}" style="rotate: ${((i * 37) % 7 - 3) * 0.5}deg"></div>`).join('')}</div>
          <p class="pf" id="m1">aunque ese día solo hayas hecho</p><p class="pg" id="m2">10 minutos,</p><p class="pf" id="m3">aunque haya sido</p><p class="pg res" id="m4">lo mínimo.</p>
          <p class="pf" id="k6">cuando juntas</p><p class="pg num" id="n3">3</p><p class="pg num" id="n4">4</p><p class="pg num" id="n10">10</p>
          <p class="pf" id="k7">días marcados frente a ti,</p><p class="pg res" id="k8" style="font-size: 104px">pasa algo extraño.</p>
          ${[28, 29, 30, 31].map((v, j) => `<p class="ser centro amarillo" id="c1-${j}" style="top: 560px; font-size: 420px">${v}</p>`).join('')}<p class="chica centro" id="c1v" style="top: 1010px; font-size: 84px">veces</p>
          <p class="ser centro" id="tp1">${letrasSueltas(TP1)}</p>
          <p class="ser centro amarillo" id="tp2">${letrasSueltas(TP2)}</p>
          <p class="ser centro" id="dom">domingo</p>
          <p class="ser centro amarillo" id="lun">lunes</p>
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

// ---------- 6. el archivo principal: la escena, Jhonny, los videos, la pastilla y el sonido ----------
const principal = [];
AVATAR.forEach((av) => {
  principal.push(`tl.set("#${av.id}-caja", { autoAlpha: 1 }, ${n(Math.max(0, av.ini - PELO))});`, `tl.set("#${av.id}-caja", { autoAlpha: 0 }, ${n(av.ini + av.dura - PELO)});`);
  principal.push(`tl.fromTo("#${av.id}-caja .mov", { scale: 1.0 }, { scale: 1.06, duration: ${n(av.dura)}, ease: "none", immediateRender: false }, ${n(av.ini)});`);
  if (av !== AV1) principal.push(`tl.fromTo("#${av.id}", { scale: 1.22 }, { scale: 1, duration: 0.2, ease: "power4.out", immediateRender: false }, ${n(av.ini)});`);
  if (av.golpeK !== undefined) principal.push(`tl.to("#${av.id}", { scale: 1.16, duration: 0.14, ease: "power4.out" }, ${n(av.ini + av.tiempos[av.golpeK] - 0.03)});`);
  let k = 0;
  av.renglones.forEach((r) => r.split(' ').forEach(() => { const id = `${av.id}-w${k}`; principal.push(`tl.fromTo("#${id}", { opacity: 0.001, color: "#8a8a8a" }, { opacity: 1, color: "#FFFFFF", duration: 0.12, immediateRender: false }, ${n(av.ini + av.tiempos[k] - 0.03)});`); k++; }));
  for (let j = 0; j < av.renglones.length; j += 2) {
    const primera = av.renglones.slice(0, j).join(' ').split(' ').filter(Boolean).length, sigPar = av.renglones.slice(0, j + 2).join(' ').split(' ').filter(Boolean).length;
    principal.push(`tl.set("#${av.id}-p${j / 2}", { autoAlpha: 1 }, ${n(Math.max(0, av.ini + av.tiempos[primera] - 0.06))});`);
    principal.push(`tl.set("#${av.id}-p${j / 2}", { autoAlpha: 0 }, ${n(sigPar < av.tiempos.length ? av.ini + av.tiempos[sigPar] - 0.06 : av.ini + av.dura - PELO)});`);
  }
});
principal.push(`tl.set(".vin2", { autoAlpha: 0 }, 0);`);
for (const av of AVATAR) principal.push(`tl.set(".vin2", { autoAlpha: 1 }, ${n(av === AV1 ? D_GANCHO : av.ini)});`, `tl.set(".vin2", { autoAlpha: 0 }, ${n(av.ini + av.dura - PELO)});`);
// El gancho: la libreta en video tapa a Jhonny; cae una rayita ámbar por golpe; en "no es por falta de ganas" sale la cara
ANIOS.forEach((_, i) => { if (!i) return;
  principal.push(i > 1 ? `tl.set("#c0-${i - 2}", { opacity: 0 }, ${n(tAnio(i) - 0.03 - PELO)});` : `tl.set("#ct-veces", { opacity: 1 }, ${n(tAnio(1) - 0.03)});`);
  principal.push(`tl.fromTo("#c0-${i - 1}", { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.11, ease: "back.out(2)", immediateRender: false }, ${n(tAnio(i) - 0.03)});`);
  principal.push(`tl.to("#hk", { x: ${i % 2 ? -9 : 9}, y: 6, duration: 0.04, ease: "none" }, ${n(tAnio(i))});`, `tl.to("#hk", { x: 0, y: 0, duration: 0.07, ease: "power2.out" }, ${n(tAnio(i) + 0.04)});`);
  principal.push(`tl.to("#gancho", { scale: ${1 + i * 0.07}, duration: 0.1, ease: "power4.out" }, ${n(tAnio(i) - 0.03)});`);
});
[0, 0.2, 0.4].forEach((d, i) => principal.push(`tl.fromTo("#hv${i}", { opacity: 0, scale: 1.3, filter: "blur(10px)" }, { opacity: ${[1, 0.75, 0.55][i]}, scale: 1, filter: "blur(0px)", duration: 0.14, ease: "power2.out", immediateRender: false }, ${n(AV1.tiempos[4] - 0.03 + d)});`));
principal.push(`tl.fromTo("#hk-raya", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.22, ease: "power2.out", immediateRender: false }, ${n(AV1.tiempos[5])});`);
principal.push(`tl.to(".hv, #hk-raya, .ct, #ct-veces", { opacity: 0, duration: 0.06 }, ${n(AV1.tiempos[7] - 0.06)});`);
principal.push(`tl.to("#gancho", { scale: 2.1, duration: 0.16, ease: "power4.out" }, ${n(AV1.tiempos[8] - 0.03)});`);
principal.push(`tl.fromTo("#hk-igual", { opacity: 0, scale: 1.6, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.15, ease: "power4.in", immediateRender: false }, ${n(AV1.tiempos[8] - 0.12)});`);
[[-16, 10, 0.04, 0], [12, -8, 0.05, 0.04], [-7, 5, 0.05, 0.09], [0, 0, 0.08, 0.14]].forEach(([x, y, d, en]) => principal.push(`tl.to("#hk", { x: ${x}, y: ${y}, duration: ${d}, ease: "none" }, ${n(AV1.tiempos[8] + 0.03 + en)});`));
principal.push(`tl.fromTo("#hk-luz", { opacity: 0 }, { opacity: 0.16, duration: 0.03, immediateRender: false }, ${n(AV1.tiempos[8] + 0.02)});`, `tl.to("#hk-luz", { opacity: 0, duration: 0.18 }, ${n(AV1.tiempos[8] + 0.05)});`);
principal.push(`tl.set("#hk", { autoAlpha: 0 }, ${n(D_GANCHO - PELO)});`);
principal.push(`tl.fromTo("#av1", { scale: 1.3 }, { scale: 1, duration: 0.22, ease: "power4.out", immediateRender: false }, ${n(D_GANCHO)});`);
principal.push(...fondoPasos);
sacFondo.forEach(([t, f]) => [[-14, 9, 0.04, 0], [11, -7, 0.05, 0.04], [-6, 4, 0.05, 0.09], [0, 0, 0.08, 0.14]].forEach(([x, y, d, en]) => principal.push(`tl.to(".fondo", { x: ${n(x * f)}, y: ${n(y * f)}, duration: ${d}, ease: "none" }, ${n(t + en)});`)));
const htmlAvatar = AVATAR.map((av, i) => `      <div class="avcaja" id="${av.id}-caja" data-layout-allow-overflow>
        <div class="mov"><video id="${av.id}" class="clip" src="assets/${av.id}.mp4" playsinline muted data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${10 + i}"></video></div>${i === 0 ? `
        <div id="hk" data-layout-allow-overflow>
          <div id="hk-rej"></div>
          <video id="gancho" class="clip" src="assets/gancho.mp4" playsinline muted data-start="0" data-duration="${n(D_GANCHO)}" data-media-start="0" data-track-index="40"></video>
          <div id="gvin"></div>
          ${[2, 5, 9, 14, 27].map((v, j) => `<p class="ct" id="c0-${j}">${v}</p>`).join('')}<p id="ct-veces">veces</p>
          <p class="hv" id="hv0">«voy a cambiar»</p><p class="hv" id="hv1">«voy a cambiar»</p><p class="hv" id="hv2">«voy a cambiar»</p>
          <div id="hk-raya"></div>
          <p id="hk-igual">sigues igual.</p>
          <div id="hk-luz"></div>
        </div>` : ''}
${Array.from({ length: Math.ceil(av.renglones.length / 2) }, (_, p) => { let k = av.renglones.slice(0, p * 2).join(' ').split(' ').filter(Boolean).length; return `        <div class="sub" id="${av.id}-p${p}">${av.renglones.slice(p * 2, p * 2 + 2).map((r) => `<p>${r.split(' ').map((tx) => `<span id="${av.id}-w${k++}">${tx}</span>`).join(' ')}</p>`).join('')}</div>`; }).join('\n')}
      </div>`).join('\n');
const audioAvatar = AVATAR.map((av, i) => `      <audio id="${av.id}-voz" src="assets/${av.id}.wav" data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${20 + i}" data-volume="1"></audio>`).join('\n');
const audioVoz = VOCES.map((s, i) => `      <audio id="voz${i + 1}" src="assets/voz${i + 1}.wav" data-start="${n(s.ini + ENTRA_VOZ - 0.06)}" data-duration="${n(pal[s.a].f - pal[s.de].i + 0.28)}" data-media-start="0" data-track-index="${3 + i}" data-volume="1"></audio>`).join('\n');
const video = (id, archivo, v, pista) => `      <video id="${id}" class="clip fondo" src="assets/${archivo}" playsinline muted data-start="${n(v.de)}" data-duration="${n(v.dura)}" data-media-start="0" data-track-index="${pista}"></video>`;
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · ${NOMBRE} · Voy a cambiar</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
      @font-face { font-family: "Serifa Racha"; font-weight: 400; src: local("Bodoni MT"), local("Bodoni MT Regular"), local("Georgia"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .clip { position: absolute; inset: 0; }
      .fondo { z-index: 0; width: 100%; height: 100%; object-fit: cover; }
      .avcaja { position: absolute; inset: 0; z-index: 3; opacity: 0; visibility: hidden; overflow: hidden; background: #000; }
      .avcaja .mov { position: absolute; inset: 0; transform-origin: 50% 40%; }
      .avcaja video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
      #hk { position: absolute; inset: 0; z-index: 5; background: #050506; overflow: hidden; }
      #gancho { transform-origin: 26% 66%; }
      #gvin { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 64% at 45% 58%, transparent 34%, rgba(0, 0, 0, 0.8) 100%); }
      .ct { position: absolute; left: 0; right: 0; top: 220px; text-align: center; font-family: "Serifa Racha", serif; font-size: 420px; line-height: 1; letter-spacing: -0.02em; color: #FFB547; opacity: 0; text-shadow: 0 0 10px rgba(255, 200, 110, 0.8), 0 0 60px rgba(255, 181, 71, 0.75), 0 0 140px rgba(255, 160, 40, 0.5); }
      #ct-veces { position: absolute; left: 0; right: 0; top: 650px; text-align: center; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 84px; color: #F4E7C3; opacity: 0; text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95); }
      #hk-rej { position: absolute; inset: -40px; background-image: linear-gradient(rgba(244, 231, 195, 0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(244, 231, 195, 0.05) 2px, transparent 2px); background-size: 116px 116px; }
      .hk-a { position: absolute; left: 0; right: 0; top: 250px; text-align: center; font-family: "Serifa Racha", serif; font-size: 330px; line-height: 1; letter-spacing: -0.02em; color: #FFB547; opacity: 0; text-shadow: 0 0 10px rgba(255, 200, 110, 0.8), 0 0 60px rgba(255, 181, 71, 0.75), 0 0 140px rgba(255, 160, 40, 0.5); }
      #hk-figc { position: absolute; left: 0; right: 0; bottom: 120px; height: 1020px; display: flex; justify-content: center; transform-origin: 50% 45%; }
      #hk-figc img { height: 100%; filter: drop-shadow(0 0 3px rgba(255, 181, 71, 0.9)) drop-shadow(0 0 34px rgba(255, 181, 71, 0.45)); }
      .hv { position: absolute; font-family: "Serifa Racha", serif; font-style: italic; color: #F4E7C3; white-space: nowrap; opacity: 0; text-shadow: 0 0 6px rgba(255, 236, 200, 0.7), 0 0 30px rgba(255, 190, 100, 0.6); }
      #hv0 { left: 70px; top: 790px; font-size: 104px; rotate: -4deg; } #hv1 { left: 470px; top: 940px; font-size: 80px; rotate: 3deg; } #hv2 { left: 110px; top: 1070px; font-size: 68px; rotate: -2deg; }
      #hk-raya { position: absolute; left: 84px; top: 920px; width: 640px; height: 10px; border-radius: 5px; background: #FFB547; rotate: -4deg; transform-origin: 0 50%; box-shadow: 0 0 22px rgba(255, 181, 71, 0.9); opacity: 0; }
      #hk-igual { position: absolute; left: 0; right: 0; top: 300px; text-align: center; font-family: "Serifa Racha", serif; font-size: 190px; line-height: 1; letter-spacing: -0.02em; color: #F4E7C3; opacity: 0; text-shadow: 0 0 8px rgba(255, 236, 200, 0.7), 0 0 44px rgba(255, 190, 100, 0.6); }
      #hk-luz { position: absolute; inset: 0; background: #FFF3D6; opacity: 0; }
      .ty { position: absolute; left: 540px; top: 470px; width: 400px; height: 230px; z-index: 3; }
      .ty i { position: absolute; top: 0; width: 18px; height: 230px; border-radius: 9px; background: #FFB547; box-shadow: 0 0 26px rgba(255, 181, 71, 0.85); opacity: 0; transform-origin: 50% 0; }
      .ty i:nth-child(1) { left: 20px; rotate: -3deg; } .ty i:nth-child(2) { left: 112px; rotate: 2deg; } .ty i:nth-child(3) { left: 204px; rotate: -2deg; } .ty i:nth-child(4) { left: 296px; rotate: 3deg; }
      .ty b { position: absolute; left: -34px; top: 106px; width: 440px; height: 18px; border-radius: 9px; background: #FFB547; box-shadow: 0 0 26px rgba(255, 181, 71, 0.85); opacity: 0; rotate: -24deg; transform-origin: 0 50%; }
      .sub { position: absolute; left: 0; right: 0; top: 1118px; z-index: 4; text-align: center; opacity: 0; visibility: hidden; }
      .sub p { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 54px; line-height: 1.14; letter-spacing: -0.025em; color: #fff; white-space: nowrap; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95), 0 0 3px rgba(0, 0, 0, 0.9); }
      .sub span { display: inline-block; opacity: 0.001; }
      .vin2 { position: absolute; inset: 0; z-index: 7; pointer-events: none; background: radial-gradient(ellipse 85% 70% at 50% 45%, transparent 50%, rgba(0, 0, 0, 0.55) 100%); }
      #pastilla { position: absolute; left: 0; right: 0; top: 1334px; z-index: 11; display: flex; justify-content: center; opacity: 0; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 36px; letter-spacing: -0.01em; color: #F4E7C3; background: #0F1113; border: 3px solid #FFB547; border-radius: 999px; padding: 14px 32px 18px; white-space: nowrap; box-shadow: 0 0 34px rgba(255, 181, 71, 0.4); }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="escena" class="clip" style="z-index: 1" data-composition-id="escena" data-composition-src="compositions/escena.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="0" data-width="1080" data-height="1920"></div>
${htmlAvatar}
      <div class="vin2"></div>
${video('vmaq', 'pmaq.mp4', V.maq, 30)}
${video('vofi', 'pofi.mp4', V.ofi, 38)}
${video('vsofa', 'psofa.mp4', V.sofa, 31)}
${video('vpesas', 'ppesas.mp4', V.pesas, 41)}
${video('vcal1', 'pfondo.mp4', V.cal1, 33)}
${video('vcam', 'pcam.mp4', V.cam, 34)}
${video('vcal2', 'pfondo.mp4', V.cal2, 35)}
${video('cal', 'cal.mp4', { de: T_CAL, dura: D_CAL }, 36)}
${video('cola', 'cola.mp4', { de: T_FIN, dura: D_COLA }, 37)}
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

if (PRUEBA) for (const f of ['index.html']) {
  const arch = path.join(P, f);
  const lineas = fs.readFileSync(arch, 'utf8').split('\n').filter((l) => { const m = l.match(/data-start="([\d.]+)"/); return !m || Number(m[1]) < PRUEBA - 0.05; })
    .map((l) => l.replace(/data-start="([\d.]+)" data-duration="([\d.]+)"/, (_, a, d) => `data-start="${a}" data-duration="${n(Math.min(Number(d), PRUEBA - Number(a)))}"`));
  fs.writeFileSync(arch, lineas.join('\n'), 'utf8');
}
fs.writeFileSync(path.join(BASE_DIR, 'audio.json'), JSON.stringify({ total: n(TOTAL), pistas: [...VOCES.map((s, i) => ({ archivo: `voz${i + 1}.wav`, en: n(s.ini + ENTRA_VOZ - 0.06) })), ...AVATAR.map((av) => ({ archivo: `${av.id}.wav`, en: n(av.ini) })), { archivo: 'efectos.wav', en: 0 }] }, null, 1), 'utf8');
for (const f of ['hyperframes.json', 'package.json', 'meta.json']) {
  const de = path.join(C, 'guion1', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion1').join(`campana-${NOMBRE}`), 'utf8');
}
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s · ${sonidos.length} efectos. Jhonny: ${AVATAR.map((av) => `${av.clip} ${av.ini.toFixed(1)}–${(av.ini + av.dura).toFixed(1)} (${av.tramos.length} tramos)`).join(' · ')}.`);
console.log(`gancho hasta ${D_GANCHO.toFixed(1)} · 1972 ${T(W.n1972).toFixed(1)} · sofá ${V.sofa.de.toFixed(1)} · pesas ${V.pesas.de.toFixed(1)} · al revés ${T(W.al).toFixed(1)} · ventana ${T(W.tu).toFixed(1)} · libreta ${V.lib2.de.toFixed(1)} · a máquina ${T(W.las).toFixed(1)} · nada ${T(W.nada).toFixed(1)} · domingo ${T(W.intentas).toFixed(1)} · calendario ${V.cal1.de.toFixed(1)} · caminar ${V.cam.de.toFixed(1)} · mínimo ${T(W.lo).toFixed(1)} · tres ${T(W.n3).toFixed(1)} · diez ${T(W.n10b).toFixed(1)} · espejo ${VOCES[2].ini.toFixed(1)} · mes ${T_CAL.toFixed(1)} · cierre ${AV5.ini.toFixed(1)} · cola ${T_FIN.toFixed(1)} · tarjeta ${T_TARJETA.toFixed(1)}.`);
