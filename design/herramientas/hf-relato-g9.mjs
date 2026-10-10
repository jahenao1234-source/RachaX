// Guion 9 "El día 22" (el mito de los 21 días): el estilo de "El efecto ya qué" (hf-relato.mjs), pero con un avatar
// que aparece tres veces hablando cerca de la cámara con un micrófono. Lo demás es voz en off de Juan Restrepo con fotos
// en blanco y negro (unas reales, otras generadas), el ámbar brillando sobre lo que se nombra y las cifras en números grandes.
// Uso: node design/herramientas/hf-relato-g9.mjs [--solo-html]
//      después, dentro de campana/guion9/hyperframes: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//
// El anuncio se arma por tramos (SEGS): avatar · voz · avatar · voz · avatar · voz.
// - La voz en off es un solo archivo (voz/dia22-v1-juan-sin-pausas.mp3) del que se usan tres pedazos, por número de palabra.
// - Cada clip del avatar va en guion9/clips/<nombre>.mp4 con su <nombre>.palabras.json (transcribir-assembly.mjs) y, si existe,
//   <nombre>-juan.mp3 (la voz del clip pasada a la de Juan con `elevenlabs.mjs cambiar`). Si el clip no está todavía, se pone
//   la foto del avatar quieta y sin voz, para poder revisar lo demás.
// - Gancho visual "el micrófono primero": un segundo en negro con solo el micrófono encendido en ámbar y "21 días" en grande;
//   después sube la luz y aparece la cara ya hablando.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const NOMBRE = 'guion9';
const BASE_DIR = path.join(C, 'guion9');
const VOZ = path.join(BASE_DIR, 'voz', 'dia22-v1-juan-sin-pausas');
const P = path.join(BASE_DIR, 'hyperframes');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const PELO = 0.004;
const SOLO_HTML = process.argv.includes('--solo-html');

const limpia = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ]/g, '');
const NUMEROS = { dos: '2', tres: '3', veintiun: '21', veintidos: '22', veintiuno: '21' };
const igual = (escrita, dicha) => { const a = limpia(escrita), b = limpia(dicha); return a === b || NUMEROS[a] === b || NUMEROS[b] === a; };

// ---------- la voz en off ----------
const pal = JSON.parse(fs.readFileSync(VOZ + '.palabras.json', 'utf8')).palabras;
const W = { maxwell: 2, en1960: 4, anio: 5, minimo: 11, v21: 13, enAcost: 15, cara: 19, elLibro: 21, volvio: 24, con: 26, minimo2: 32, sePerdio2: 33, cara2: 36, yQuedo: 38, laFrase: 40, casi: 47, londres: 56, durante: 57, semanas: 59, elProm: 60, no21: 64, fue66: 65, n66: 66, aUna: 67, n18: 72, otra: 74, n254: 77, aEso: 78, elDia: 82, n22: 84, elDiaEn: 85, yApenas: 92, un: 96, tercio: 97, esComo: 98, arroz: 102, yDecir: 107, noSabes: 110, yo: 113, racha: 118, si: 125, te: 130, muestro: 132 };
const ESPERO = { maxwell: 'maxwell', anio: '1960', minimo: 'minimo', v21: '21', cara: 'cara', volvio: 'volvio', minimo2: 'minimo', cara2: 'cara', londres: 'londres', semanas: 'semanas', no21: '21', n66: '66', n18: '18', n254: '254', n22: '22', tercio: 'tercio', arroz: 'arroz', racha: 'racha', te: 'te', muestro: 'muestro' };
for (const [k, v] of Object.entries(ESPERO)) if (limpia(pal[W[k]].t) !== v) { console.log(`FALLA: la palabra ${W[k]} debía ser "${v}" y la voz dice "${pal[W[k]].t}".`); process.exit(1); }

// ---------- los clips del avatar ----------
const AVATAR = [
  { id: 'av1', clip: '1-gancho', dice: '¿Quién te dijo que un hábito se forma en veintiún días? Un cirujano plástico. Y no hablaba de hábitos.', renglones: ['¿quién te dijo que un hábito', 'se forma en 21 días?', 'un cirujano plástico.', 'y no hablaba de hábitos.'], antes: 1.0 },
  { id: 'av2', clip: '2-puente', dice: 'Yo me creí ese número. Llegaba a la tercera semana, todavía me costaba, y pensaba: esto no es para mí.', renglones: ['yo me creí ese número.', 'llegaba a la tercera semana,', 'todavía me costaba, y pensaba:', 'esto no es para mí.'], antes: 0.15 },
  { id: 'av3', clip: '3-cierre', dice: 'Si hoy es tu día veintidós y todavía te cuesta, vas bien.', renglones: ['si hoy es tu día 22', 'y todavía te cuesta,', 'vas bien.'], antes: 0.15 },
];
const DESPUES = 0.3;
for (const av of AVATAR) {
  const mp4 = path.join(BASE_DIR, 'clips', av.clip + '.mp4'), pj = path.join(BASE_DIR, 'clips', av.clip + '.palabras.json');
  const escritas = av.dice.split(' ');
  av.hay = fs.existsSync(mp4) && fs.existsSync(pj);
  if (av.hay) {
    const ps = JSON.parse(fs.readFileSync(pj, 'utf8')).palabras;
    // busca la frase del guion dentro de lo que dijo el clip (por si agregó algo antes o después)
    // La transcripción a veces se come una palabra de una letra pegada a la anterior ("llegaba a la" → "llegaba la"):
    // esa palabra se pone en el mismo instante de la que sigue.
    const alinea = (desde) => { const sal = []; let j = desde; for (const e of escritas) { if (ps[j] && igual(e, ps[j].t)) sal.push(ps[j++]); else if (limpia(e).length <= 1 && ps[j]) sal.push({ t: e, i: ps[j].i, f: ps[j].i }); else return null; } return sal; };
    av.palabras = null;
    for (let i = 0; i < ps.length && !av.palabras; i++) av.palabras = alinea(i);
    if (!av.palabras) { console.log(`FALLA: el clip ${av.clip} no dice la frase del guion completa. Dijo: ${ps.map((p) => p.t).join(' ')}`); process.exit(1); }
    // Se parte donde el avatar hace una pausa larga (más de 0,7 s): se quita el silencio y en el corte la cámara se acerca
    const grupos = [[av.palabras[0]]];
    av.palabras.slice(1).forEach((p) => { const g = grupos[grupos.length - 1]; if (p.i - g[g.length - 1].f > 0.7) grupos.push([p]); else g.push(p); });
    av.tramos = grupos.map((g, j) => ({ de: j === 0 ? Math.max(0, g[0].i - av.antes) : g[0].i - 0.18, a: g[g.length - 1].f + (j === grupos.length - 1 ? DESPUES : 0.22), z: 1 + 0.13 * j }));
    let acum = 0; av.tiempos = []; av.cortes = [];
    grupos.forEach((g, j) => { if (j) av.cortes.push(acum); g.forEach((p) => av.tiempos.push(acum + p.i - av.tramos[j].de)); acum += av.tramos[j].a - av.tramos[j].de; });
    av.dura = acum;
    av.antesReal = av.palabras[0].i - av.tramos[0].de;
    av.mp4 = mp4;
    av.vozJuan = [path.join(BASE_DIR, 'clips', av.clip + '-juan.mp3'), mp4].find((f) => fs.existsSync(f));
  } else {
    av.antesReal = av.antes; av.tiempos = escritas.map((_, k) => av.antes + k * 0.36); av.dura = av.antes + escritas.length * 0.36 + DESPUES; av.cortes = [];
  }
}

// ---------- los tramos y el reloj ----------
const SEGS = [{ av: AVATAR[0] }, { de: 0, a: 77 }, { av: AVATAR[1] }, { de: 78, a: 112 }, { av: AVATAR[2] }, { de: 113, a: 132 }];
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
const F = (k) => inicioDe[k] + (pal[k].f - pal[k].i);
const TOTAL = reloj + 3.3;
const [AV1, AV2, AV3] = AVATAR;
const C_APP = SEGS[5].ini;
// Los momentos clave, para acomodar la música (musica-mezcla-g9.py)
fs.writeFileSync(path.join(BASE_DIR, 'tiempos.json'), JSON.stringify({ total: n(TOTAL), finGancho: n(AV1.dura), maxwell: n(T(W.maxwell)), anio: n(T(W.anio)), yQuedo: n(T(W.yQuedo)), londres: n(T(W.londres)), n66: n(T(W.n66)), puente: n(AV2.ini), dia22: n(T(W.n22)), tercio: n(T(W.un)), cierre: n(AV3.ini), app: n(C_APP), te: n(T(W.te)) }, null, 1), 'utf8');

// El final: la app de verdad grabada por Johnatan en la pantalla del computador (grabaciones/toma-NN.mp4), en seis
// cortes rápidos mientras la voz habla y una toma larga para el cierre. [toma, segundo donde empieza, x del recorte]
const TOMAS_FINAL = [[12, 2.0, 300], [21, 4.0, 500], [14, 3.0, 1200], [19, 9.0, 1100], [13, 0.3, 150], [13, 3.2, 1150], [21, 19.2, 300]];
const pasoF = (T(W.te) - C_APP) / 6;
const FINAL = TOMAS_FINAL.map(([toma, de, x], i) => ({ toma, de, x, t: C_APP + i * pasoF, dura: i < 6 ? pasoF : TOTAL - T(W.te) }));

// ---------- las fotos ----------
const TOMAS = [
  { id: 'cirujano', foto: '1-cirujano.jpg', de: W.en1960, hasta: W.enAcost, ovalos: [[0.68, 0.15, 0.3, 0.1]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.42, Y: 860 }, { k: W.minimo, z: 1.55, fx: 0.3, fy: 0.43, Y: 980 }] },
  { id: 'espejo', foto: '2-espejo.jpg', de: W.enAcost, hasta: W.elLibro, ovalos: [[0.737, 0.426, 0.12, 0.08]], luces: [[0.737, 0.424, 0.092, 0.061]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.cara, z: 1.45, fx: 0.66, fy: 0.43, Y: 1010 }] },
  { id: 'libro', foto: '3-libro.jpg', de: W.elLibro, hasta: W.con, ovalos: [[0.37, 0.48, 0.2, 0.19]], fuerza: 0.45,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.volvio, z: 1.3, fx: 0.42, fy: 0.48, Y: 940 }] },
  { id: 'londres', foto: '4-londres.jpg', de: W.casi, hasta: W.durante, ovalos: [[0.305, 0.458, 0.065, 0.042]], luces: [[0.305, 0.458, 0.038, 0.024]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }, { k: W.londres, z: 1.7, fx: 0.33, fy: 0.46, Y: 1060 }] },
  { id: 'calendario', foto: '5-calendario.jpg', de: W.aEso, hasta: W.yApenas, ovalos: [], luces: [[0.5, 0.605, 0.045, 0.028]], aros: [{ k: W.n22, e: [0.5, 0.605, 0.06, 0.036] }], numero: { texto: '22', x: 0.5, y: 0.605, k: W.n22 },
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.n22, z: 1.6, fx: 0.5, fy: 0.6, Y: 1060 }, { k: W.elDiaEn, z: 1.25, fx: 0.5, fy: 0.56, Y: 1040 }] },
  { id: 'arroz', foto: '6-arroz.jpg', de: W.esComo, hasta: null, ovalos: [[0.33, 0.425, 0.1, 0.055]], fuerza: 0.8,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }, { k: W.arroz, z: 1.5, fx: 0.38, fy: 0.42, Y: 1000 }, { k: W.noSabes, z: 1.15, fx: 0.5, fy: 0.45, Y: 930 }] },
];
for (const t of TOMAS) { t.cubre = true; t.ini = T(t.de) - 0.08; t.fin = t.hasta === null ? SEGS[4].ini : T(t.hasta) - 0.08; }
const lucesTiempo = { calendario: W.n22 };          // esta luz no se enciende al entrar la foto, sino en su palabra

// ---------- los efectos de sonido ----------
const VOLUMEN = { whoosh: -8, golpe: -6, pop: -9, caida: -6, toque: -9, logro: -9, boom: -2, subida: -7, neon: -8, diapositiva: -6, garabato: -6, latido: -3, brillo: -7, tachar: -8 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const sonidos = [];
const suena = (s, t, { modo = 'golpe', db = 0 } = {}) => sonidos.push({ s, t: Math.max(0, t - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db });

// La app en movimiento
const APP = path.join(C, 'guion3', 'app');
const CEL = JSON.parse(fs.readFileSync(path.join(APP, 'celular.json'), 'utf8'));
const V_ACTIVAR = CEL.toques.activar - CEL.inicio, V_MARCA = 7.47;
const MS = Math.max(0, V_MARCA - (T(W.te) + 0.15 - C_APP));
const ACTIVAR = C_APP + (V_ACTIVAR - MS), MARCA = C_APP + (V_MARCA - MS);

// ---------- 1. sonido, fotos y clips ----------
const W0 = 1536, H0 = 2730;
const CINE = (entrada) => `${entrada}highpass=f=65,equalizer=f=115:t=q:w=0.9:g=3.5,equalizer=f=320:t=q:w=1.1:g=-2.5,equalizer=f=3400:t=q:w=1.2:g=2.5,equalizer=f=9500:t=h:w=0.7:g=2,acompressor=threshold=-22dB:ratio=3.5:attack=6:release=140:makeup=2.5,asplit[seca][m];[m][1:a]afir=dry=0:wet=10,highpass=f=300,volume=-21dB[sala];[seca][sala]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89[a]`;
const lufsDe = (archivo) => Number(spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', archivo, '-vn', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
// Un pedazo de voz, con el tratamiento de cine y al volumen de los otros anuncios
const pedazoDeVoz = (origen, de, a, salida) => {
  const tmp = salida.replace(/\.wav$/, '-crudo.wav'), sala = path.join(A, 'sala.wav');
  ff(['-ss', String(Math.max(0, de)), '-t', String(a - Math.max(0, de)), '-i', origen, '-i', sala, '-filter_complex', CINE('[0:a]'), '-map', '[a]', '-ar', '48000', '-ac', '2', tmp]);
  const dur = a - Math.max(0, de);
  ff(['-i', tmp, '-af', `volume=${(-20.3 - lufsDe(tmp)).toFixed(2)}dB,alimiter=limit=0.89,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, dur - 0.08).toFixed(3)}:d=0.08`, '-ar', '48000', '-ac', '2', salida]);
  fs.unlinkSync(tmp);
};
const FILTRO = fs.readFileSync(path.join(C, 'filtro', 'filtro-campana.txt'), 'utf8').trim();
if (!SOLO_HTML) {
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=1.1:c=white:a=0.6:s=11', '-af', 'highpass=f=250,lowpass=f=4200,afade=t=in:d=0.004,afade=t=out:st=0.02:d=1.08:curve=exp', '-ar', '48000', '-ac', '2', path.join(A, 'sala.wav')]);
  SEGS.filter((s) => !s.av).forEach((s, i) => pedazoDeVoz(VOZ + '.mp3', pal[s.de].i - 0.06, pal[s.a].f + 0.22, path.join(A, `voz${i + 1}.wav`)));
  for (const t of TOMAS) {
    const origen = path.join(BASE_DIR, 'imagenes', t.foto);
    ff(['-i', origen, '-vf', `crop=${W0}:${H0},hue=s=0,eq=brightness=-0.13:contrast=1.28:gamma=0.84`, '-q:v', '3', path.join(A, `${t.id}-bn.jpg`)]);
    ff(['-i', origen, '-vf', `crop=${W0}:${H0},hue=s=0,eq=brightness=0.02:contrast=1.45,colorchannelmixer=rr=1:gg=0.66:bb=0.2`, '-q:v', '3', path.join(A, `${t.id}-ambar.jpg`)]);
  }
  // la foto real de Maltz, en blanco y negro
  ff(['-i', path.join(BASE_DIR, 'imagenes', 'real-maltz.jpg'), '-vf', 'hue=s=0,eq=contrast=1.15:brightness=-0.03', '-q:v', '2', path.join(A, 'maltz.jpg')]);
  ff(['-f', 'lavfi', '-i', 'nullsrc=s=1480x2320,format=gray,geq=lum=random(1)*255,gblur=sigma=0.7,eq=contrast=1.6', '-frames:v', '1', '-q:v', '4', path.join(A, 'grano.jpg')]);
  // el final: cada toma recortada a vertical, con el estilo del anuncio (todo gris menos el ámbar) y acercándose despacio
  {
    const GRAB = path.join(C, 'grabaciones'); let cuadros = 0; const lista = [];
    FINAL.forEach((f, i) => {
      const hasta = Math.round((f.t + f.dura - C_APP) * 30), N = hasta - cuadros; cuadros = hasta;
      ff(['-ss', String(f.de), '-t', String(N / 30 + 0.3), '-i', path.join(GRAB, `toma-${f.toma}.mp4`), '-an', '-vf', `fps=30,crop=972:1728:${f.x + 282}:0,colorbalance=bs=-0.20:bm=-0.14:bh=-0.05:rs=0.04,colorhold=color=0xFFB547:similarity=0.38:blend=0.25,eq=contrast=1.12:brightness=0.02:gamma=1.12,scale=w='2*trunc(540*(1+0.07*t/${(N / 30).toFixed(3)}))':h=-2:eval=frame,crop=1080:1920,setsar=1`, '-frames:v', String(N), '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p', path.join(A, `fin${i}.mp4`)]);
      lista.push(`file 'fin${i}.mp4'`);
    });
    fs.writeFileSync(path.join(A, 'fin.txt'), lista.join('\n'));
    ff(['-f', 'concat', '-safe', '0', '-i', path.join(A, 'fin.txt'), '-c', 'copy', path.join(A, 'final.mp4')]);
  }
  // el avatar: los clips (con el filtro de la campaña) o, si no han llegado, su foto
  const base = path.join(BASE_DIR, 'clips', 'base-avatar.png');
  ff(['-i', base, '-vf', `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,${FILTRO}`, '-q:v', '2', path.join(A, 'avatar.jpg')]);
  for (const av of AVATAR) if (av.hay) {
    const par = (x) => Math.round(x / 2) * 2;
    const v = av.tramos.map((t, j) => `[0:v]trim=start=${t.de.toFixed(3)}:end=${t.a.toFixed(3)},setpts=PTS-STARTPTS,scale=${par(1080 * t.z)}:${par(1920 * t.z)},crop=1080:1920:(iw-1080)/2:(ih-1920)*0.4,${FILTRO},fps=30[v${j}]`);
    const a = av.tramos.map((t, j) => `[1:a]atrim=start=${t.de.toFixed(3)}:end=${t.a.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${(t.a - t.de - 0.012).toFixed(3)}:d=0.012[a${j}]`);
    const junta = `${av.tramos.map((_, j) => `[v${j}][a${j}]`).join('')}concat=n=${av.tramos.length}:v=1:a=1[v][a]`;
    const crudo = path.join(A, `${av.id}-junto.wav`);
    execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', av.mp4, '-i', av.vozJuan, '-filter_complex', [...v, ...a, junta].join(';'), '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path.join(A, `${av.id}.mp4`), '-map', '[a]', '-ar', '48000', '-ac', '2', crudo], { stdio: ['ignore', 'inherit', 'inherit'] });
    pedazoDeVoz(crudo, 0, av.dura, path.join(A, `${av.id}.wav`));
    fs.unlinkSync(crudo);
  }
  // el micrófono encendido en ámbar: el primer cuadro del gancho (o la foto), aclarado y teñido
  const cuadro1 = path.join(A, 'mic-origen.jpg');
  if (AV1.hay) ff(['-i', path.join(A, 'av1.mp4'), '-frames:v', '1', '-q:v', '2', cuadro1]); else fs.copyFileSync(path.join(A, 'avatar.jpg'), cuadro1);
  ff(['-i', cuadro1, '-vf', 'hue=s=0,eq=gamma=3.4:contrast=1.5:brightness=0.12,colorchannelmixer=rr=1:gg=0.66:bb=0.2', '-q:v', '2', path.join(A, 'mic-ambar.jpg')]);
}
const fuente = (paquete, archivo, destino) => fs.copyFileSync(path.join(RAIZ, 'node_modules', '@fontsource', paquete, 'files', archivo), path.join(A, 'fuentes', destino));
fuente('barlow', 'barlow-latin-600-normal.woff2', 'barlow-600.woff2');
const LETRAS = `
        @font-face { font-family: "Barlow"; font-weight: 600; src: url("assets/fuentes/barlow-600.woff2") format("woff2"); }
        @font-face { font-family: "Serifa Racha"; font-weight: 400; src: local("Bodoni MT"), local("Bodoni MT Regular"), local("Georgia"); }
        @font-face { font-family: "Serifa Racha"; font-weight: 400; font-style: italic; src: local("Bodoni MT Italic"), local("Georgia Italic"); }
        @font-face { font-family: "Maquina Racha"; font-weight: 400; src: local("Courier New"), local("Courier"); }`;
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
  pasos.push(`tl.set("${s}", { autoAlpha: 1 }, ${n(t.ini - PELO)});`, `tl.set("${s}", { autoAlpha: 0 }, ${n(t.fin - PELO)});`);
  suena('diapositiva', t.ini);
  t.marcos.forEach((m, i) => {
    const desde = i === 0 ? t.ini : T(m.k) - 0.05, sig = t.marcos[i + 1], hasta = sig ? T(sig.k) - 0.05 : t.fin;
    if (i === 0) pasos.push(`tl.set("${s} .cam", { ${cam(t, m)} }, ${n(Math.max(0, desde - PELO))});`);
    else { pasos.push(`tl.to("${s} .cam", { ${cam(t, m)}, duration: 0.2, ease: "power3.out" }, ${n(desde)});`); suena('golpe', desde + 0.02, { db: -3 }); }
    const arranca = i === 0 ? desde : desde + 0.2;
    if (hasta - arranca > 0.1) pasos.push(`tl.to("${s} .cam", { ${cam(t, m, 0.05)}, duration: ${n(hasta - arranca)}, ease: "none" }, ${n(arranca)});`);
  });
  if (t.ovalos.length) neon(`${s} .amb`, t.ini + 0.1, t.fuerza ?? 1);
  if (t.luces) neon(`${s} .luz`, lucesTiempo[t.id] ? T(lucesTiempo[t.id]) - 0.02 : t.ini + 0.1);
  (t.aros ?? []).forEach((a, i) => { pasos.push(`tl.fromTo("${s} .aro${i}", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.5, ease: "power1.inOut", immediateRender: false }, ${n(T(a.k) - 0.05)});`); suena('garabato', T(a.k) - 0.08, { modo: 'ini' }); });
  if (t.numero) pasos.push(`tl.fromTo("${s} .num", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power3.in", immediateRender: false }, ${n(T(t.numero.k) - 0.06)});`);
}
const garabato = ([cx, cy, rx, ry]) => Array.from({ length: 121 }, (_, i) => { const a = (i / 120) * (4 * Math.PI + 0.5) - 2.2, f = 1 + 0.045 * Math.sin(1.7 * a) + 0.05 * (i / 120); return `${i ? 'L' : 'M'}${(cx * W0 + rx * W0 * f * Math.cos(a)).toFixed(1)} ${(cy * H0 + ry * H0 * f * Math.sin(a) + 6 * Math.sin(2.3 * a)).toFixed(1)}`; }).join(' ');
const mascara = (t) => t.ovalos.map(([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, #000 55%, transparent 100%)`).join(', ');
const luz = ([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 214, 140, 0.95) 0, rgba(255, 181, 71, 0.9) 45%, rgba(255, 160, 40, 0.55) 80%, rgba(255, 150, 30, 0) 100%), radial-gradient(ellipse ${n(rx * 330)}% ${n(ry * 330)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 181, 71, 0.4) 0, rgba(255, 181, 71, 0) 100%)`;
const htmlTomas = TOMAS.map((t) => `          <div class="toma" id="t-${t.id}" data-layout-allow-overflow>
            <div class="cam" data-layout-allow-overflow>
              <img class="bn" src="assets/${t.id}-bn.jpg" alt="" />${t.ovalos.length ? `
              <div class="amb" style="background-image: url('assets/${t.id}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>
              <div class="amb bri" style="background-image: url('assets/${t.id}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>` : ''}${t.luces ? `
              <div class="luz" style="background: ${t.luces.map(luz).join(', ')}"></div>` : ''}${t.numero ? `
              <p class="num ser" style="left: ${n(t.numero.x * W0 - 150)}px; top: ${n(t.numero.y * H0 - 62)}px">${t.numero.texto}</p>` : ''}${(t.aros ?? []).length ? `
              <svg class="gar" viewBox="0 0 ${W0} ${H0}">${t.aros.map((a, k) => `<path class="aro${k}" pathLength="1" d="${garabato(a.e)}" />`).join('')}</svg>` : ''}
            </div>
          </div>`).join('\n');

// ---------- 3. las letras pequeñas de la voz en off ----------
const BLOQUES = [
  ['se llamaba ~Maxwell ~Maltz.'], ['~en ~1960 escribió que', 'sus pacientes tardaban'], ['mínimo unos 21 días'], ['en acostumbrarse', 'a su cara nueva.'],
  ['el libro', 'se volvió famoso.'], ['con los años', 'se perdió el «mínimo»,'], ['se perdió', 'la cara nueva,'], ['y quedó la frase', 'que te dijeron a ti.'],
  ['casi 50 años después', 'lo midieron de verdad,'], ['en ~Londres'], ['durante 12 semanas.'], ['el promedio', 'no fue ~21,'], ['~fue ~66.'],
  ['a una persona', 'le tomó ~18 ~días,'], ['otra iba para ~254.'],
  ['a eso le digo', '~el ~día ~22,'], ['el día en que crees', 'que fallaste'], ['y apenas ibas por', '~un ~tercio.'],
  ['es como apagar el arroz', 'a los 5 minutos'], ['y decir que', 'no sabes cocinar.'],
  ['yo llevo la cuenta en Racha,', 'una app que hicimos para eso.'], ['si quieres verla por dentro,', 'te la muestro.'],
];
let cuenta = 0;
const bloques = BLOQUES.map((renglones, b) => ({ id: `b${b}`, de: cuenta, renglones: renglones.map((r) => r.split(' ').map((tx) => {
  const oculta = tx.startsWith('~'), escrita = oculta ? tx.slice(1) : tx, k = cuenta++;
  if (!pal[k] || !igual(escrita, pal[k].t)) { console.log(`FALLA: en las letras, la palabra ${k} es "${escrita}" y la voz dice "${pal[k]?.t}".`); process.exit(1); }
  return { tx: escrita, k, oculta };
})) }));
if (cuenta !== pal.length) { console.log(`FALLA: las letras tienen ${cuenta} palabras y la voz ${pal.length}.`); process.exit(1); }
const segDe = (k) => SEGS.find((s) => !s.av && k >= s.de && k <= s.a);
const htmlBloques = bloques.filter((b) => b.renglones.flat().some((w) => !w.oculta)).map((b) => `        <div class="bl" id="${b.id}">
${b.renglones.map((r) => r.filter((w) => !w.oculta)).filter((r) => r.length).map((r) => `          <p class="r">${r.map((w) => `<span class="w" id="w${w.k}">${w.tx}</span>`).join(' ')}</p>`).join('\n')}
        </div>`).join('\n');
bloques.forEach((b, i) => {
  const visibles = b.renglones.flat().filter((w) => !w.oculta);
  visibles.forEach((w) => pasos.push(`tl.fromTo("#w${w.k}", { opacity: 0, filter: "blur(9px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power1.out", immediateRender: false }, ${n(Math.max(0, T(w.k) - 0.04))});`));
  const sig = bloques[i + 1], ultimo = b.renglones.flat().at(-1).k;
  // sale cuando entra el bloque siguiente, o cuando se acaba su tramo de voz
  const sale = sig && segDe(sig.de) === segDe(b.de) ? T(sig.de) - 0.16 : segDe(ultimo).finVoz + 0.12;
  if (visibles.length) pasos.push(`tl.to("#${b.id}", { opacity: 0, filter: "blur(8px)", duration: 0.12, ease: "power1.in" }, ${n(Math.min(sale, TOTAL - 0.2))});`);
});

// ---------- 4. lo que va en grande y los dibujos ----------
const aparece = (sel, t, { dur = 0.22, escala = 1.08, borroso = 14 } = {}) => pasos.push(`tl.fromTo("${sel}", { opacity: 0, filter: "blur(${borroso}px)", scale: ${escala} }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ${dur}, ease: "power2.out", immediateRender: false }, ${n(t)});`);
const seVa = (sel, t, dur = 0.12) => pasos.push(`tl.to("${sel}", { opacity: 0, duration: ${dur}, ease: "power1.in" }, ${n(t - dur)});`);
const rejilla = (de, a) => pasos.push(`tl.set("#rejilla", { opacity: 1 }, ${n(de - PELO)});`, `tl.set("#rejilla", { opacity: 0 }, ${n(a - PELO)});`);
const traza = (sel, t, dur = 0.4) => pasos.push(`tl.fromTo("${sel}", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: ${dur}, ease: "power1.inOut", immediateRender: false }, ${n(t)});`);

// (a) "Se llamaba Maxwell Maltz": la foto real, en una tarjeta, con su nombre
const tA = SEGS[1].ini;
rejilla(tA, T(W.en1960) - 0.08);
suena('diapositiva', tA + 0.02);
pasos.push(`tl.fromTo("#ficha", { opacity: 0, scale: 1.25, rotation: 6, y: 60 }, { opacity: 1, scale: 1, rotation: -3, y: 0, duration: 0.3, ease: "back.out(1.5)", immediateRender: false }, ${n(tA + 0.02)});`,
  `tl.to("#ficha", { scale: 1.06, rotation: -1.5, duration: ${n(T(W.en1960) - tA - 0.4)}, ease: "none" }, ${n(tA + 0.32)});`);
aparece('#nombre', T(W.maxwell) - 0.05, { dur: 0.3, escala: 1.1 }); suena('golpe', T(W.maxwell), { db: -2 });
seVa('#ficha', T(W.en1960) - 0.08, 0.08); seVa('#nombre', T(W.en1960) - 0.08, 0.08);
// (b) "En 1960…": el año en grande; golpe en "mínimo"
aparece('#anio', T(W.anio) - 0.04, { dur: 0.3, escala: 1.14, borroso: 16 }); suena('boom', T(W.anio), { db: -4 }); sacudida(T(W.anio), 0.6);
seVa('#anio', T(W.minimo) - 0.06, 0.12);
// (c) el espejo se enciende; (d) el libro con su título
suena('brillo', TOMAS[1].ini + 0.4, { modo: 'fin', db: -1 });
aparece('#titulo', T(W.elLibro + 1) - 0.02, { dur: 0.3 }); seVa('#titulo', T(W.con) - 0.08, 0.1);
// (e) la frase escrita a máquina: se tacha "mínimo", se tacha la cara nueva, y queda "21 días"
rejilla(T(W.con) - 0.08, T(W.casi) - 0.08);
suena('diapositiva', T(W.con) - 0.08);
aparece('#maquina', T(W.con) - 0.04, { dur: 0.2, escala: 1.03, borroso: 6 });
pasos.push(`tl.fromTo("#raya1", { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.22, ease: "power3.out", immediateRender: false }, ${n(T(W.minimo2) - 0.05)});`); suena('tachar', T(W.minimo2) + 0.02, { db: 2 });
pasos.push(`tl.fromTo("#raya2", { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.2, ease: "power3.out", immediateRender: false }, ${n(T(W.cara2) - 0.12)});`,
  `tl.fromTo("#raya3", { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.2, ease: "power3.out", immediateRender: false }, ${n(T(W.cara2) + 0.06)});`); suena('tachar', T(W.cara2) - 0.04, { db: 2 });
pasos.push(`tl.to("#maquina .borra", { opacity: 0.16, duration: 0.3 }, ${n(T(W.yQuedo) - 0.05)});`,
  `tl.to("#queda", { scale: 2.3, x: -238, y: 150, color: "${AMBAR}", textShadow: "0 0 30px rgba(255,181,71,0.8)", duration: 0.35, ease: "back.out(1.6)" }, ${n(T(W.yQuedo) + 0.02)});`);
suena('subida', T(W.yQuedo) + 0.05, { modo: 'fin', db: -2 }); suena('boom', T(W.yQuedo) + 0.08, { db: -3 }); sacudida(T(W.yQuedo) + 0.08, 0.7);
aparece('#dicho', T(W.laFrase) - 0.03, { dur: 0.25 });
seVa('#maquina', T(W.casi) - 0.08, 0.1); seVa('#dicho', T(W.casi) - 0.08, 0.1);
// (f) Londres en grande
aparece('#ciudad', T(W.londres) - 0.03, { dur: 0.25, escala: 1.14, borroso: 16 }); suena('boom', T(W.londres), { db: -5 });
seVa('#ciudad', T(W.durante) - 0.08, 0.08);
// (g) doce semanas: 84 cuadritos que se llenan · "21" tachado · "66"
rejilla(T(W.durante) - 0.08, SEGS[2].ini);
suena('diapositiva', T(W.durante) - 0.08);
aparece('#cuad', T(W.durante) - 0.04, { dur: 0.15, escala: 1.03, borroso: 6 });
pasos.push(`tl.to("#cuad .q", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", duration: 0.04, stagger: ${n((T(W.elProm) - 0.15 - T(W.durante)) / 84)} }, ${n(T(W.durante) + 0.05)});`);
for (let i = 0; i < 6; i++) suena('toque', T(W.durante) + 0.1 + i * 0.26, { db: -2 });
pasos.push(`tl.to("#cuad", { opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" }, ${n(T(W.elProm) - 0.15)});`);
aparece('#n21', T(W.no21) - 0.04, { dur: 0.18, escala: 1.2 }); suena('golpe', T(W.no21));
traza('#tacha21 path', T(W.no21) + 0.3, 0.3); suena('garabato', T(W.no21) + 0.28, { modo: 'ini' });
pasos.push(`tl.to("#n21, #tacha21", { opacity: 0, scale: 0.7, y: -260, duration: 0.2, ease: "power2.in" }, ${n(T(W.fue66) - 0.12)});`);
suena('latido', T(W.n66) - 0.6); suena('latido', T(W.n66) - 0.3);
pasos.push(`tl.fromTo("#n66", { opacity: 0, scale: 2.2, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.16, ease: "power4.in", immediateRender: false }, ${n(T(W.n66) - 0.12)});`);
suena('boom', T(W.n66) + 0.03); sacudida(T(W.n66) + 0.04, 1.2); destello(T(W.n66) + 0.03, 0.16);
seVa('#n66', T(W.aUna) - 0.08, 0.12);
// (h) 18 días y 254 días: dos barras
aparece('#f18', T(W.n18) - 0.04, { dur: 0.16 }); pasos.push(`tl.fromTo("#barra18", { scaleX: 0 }, { scaleX: 1, duration: 0.15, ease: "power2.out", immediateRender: false }, ${n(T(W.n18))});`); suena('pop', T(W.n18), { db: 3 });
aparece('#f254', T(W.n254) - 0.04, { dur: 0.16 }); pasos.push(`tl.fromTo("#barra254", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.out", immediateRender: false }, ${n(T(W.n254))});`);
suena('subida', T(W.n254) + 0.75, { modo: 'fin' }); suena('boom', T(W.n254) + 0.7, { db: -3 }); sacudida(T(W.n254) + 0.7, 0.8);
seVa('#barras', SEGS[2].ini, 0.1);
// (i) "el día 22"
aparece('#dia22', T(W.elDia) - 0.03, { dur: 0.25, escala: 1.12 }); suena('boom', T(W.n22), { db: -3 }); sacudida(T(W.n22), 0.7);
seVa('#dia22', T(W.elDiaEn) - 0.06, 0.12);
// (j) "un tercio": 1/3 enorme y una barra llena hasta la tercera parte
rejilla(T(W.yApenas) - 0.08, T(W.esComo) - 0.08);
suena('diapositiva', T(W.yApenas) - 0.08);
pasos.push(`tl.fromTo("#tercio", { opacity: 0, scale: 1.8, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.18, ease: "power4.in", immediateRender: false }, ${n(T(W.un) - 0.1)});`);
suena('boom', T(W.un) + 0.08, { db: -1 }); sacudida(T(W.un) + 0.08, 1); destello(T(W.un) + 0.07, 0.12);
aparece('#pista', T(W.yApenas) - 0.02, { dur: 0.2, escala: 1.02, borroso: 4 });
pasos.push(`tl.fromTo("#lleno", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${n(T(W.yApenas) + 0.1)});`);
aparece('#de66', T(W.tercio) + 0.05, { dur: 0.2 });
seVa('#tercio', T(W.esComo) - 0.08, 0.1); seVa('#pista', T(W.esComo) - 0.08, 0.1); seVa('#de66', T(W.esComo) - 0.08, 0.1);
// (k) el final: la app de verdad en la pantalla del computador, en cortes rápidos; "Racha" en grande y la pastilla.
// Sin campanitas: una subida, golpes graves en los cortes y un golpe largo para cerrar.
pasos.push(`tl.set("#root", { backgroundColor: "rgba(0,0,0,0)" }, ${n(C_APP - PELO)});`);
suena('subida', C_APP, { modo: 'fin', db: -1 }); suena('boom', C_APP + 0.02, { db: -3 });
FINAL.slice(1).forEach((f) => suena('golpe', f.t, { db: -3 }));
// "Racha" solo al final, cuando termina la voz, y más pequeña (Johnatan: "está muy grande; puedes ponerla al final")
aparece('#marca', F(W.muestro) + 0.12, { dur: 0.3, escala: 1.18, borroso: 18 });
pasos.push(`tl.to("#marca", { scale: 1.06, duration: ${n(TOTAL - F(W.muestro) - 0.6)}, ease: "none" }, ${n(F(W.muestro) + 0.45)});`);
suena('golpe', T(W.racha), { db: -2 });
suena('brillo', F(W.muestro) + 0.25, { modo: 'fin', db: 1 }); suena('boom', F(W.muestro) + 0.25, { db: -1 });
// el gancho: el micrófono se enciende; cuando aparece la cara, un golpe suave
suena('neon', 0.05, { modo: 'ini' });
suena('subida', AV1.antesReal - 0.05, { modo: 'fin', db: -2 }); suena('boom', AV1.antesReal - 0.08, { db: -5 });
suena('diapositiva', AV2.ini); suena('diapositiva', AV3.ini);
// cada vez que el avatar se acerca de golpe (donde se le quitó una pausa), un golpe seco
for (const av of AVATAR) av.cortes.forEach((c) => suena('golpe', av.ini + c, { db: -2 }));

let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
const saltosGrano = (sel) => Array.from({ length: Math.ceil(TOTAL * 15) }, (_, i) => `tl.set("${sel}", { x: ${-Math.round(azar() * 380)}, y: ${-Math.round(azar() * 380)} }, ${n(i / 15)});`);
pasos.push(...saltosGrano('#grano'));

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
        .gar { position: absolute; inset: 0; width: ${W0}px; height: ${H0}px; overflow: visible; }
        .gar path, .trazo path { fill: none; stroke: ${CREMA}; stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; filter: drop-shadow(0 0 10px rgba(255, 214, 140, 0.9)) drop-shadow(0 0 26px rgba(255, 181, 71, 0.55)); }
        .num { position: absolute; width: 300px; text-align: center; font-size: 124px; color: #1a1408; text-shadow: none; opacity: 0; }
        .vin { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 64% at 50% 54%, transparent 42%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.62) 0, rgba(0, 0, 0, 0) 560px), linear-gradient(0deg, rgba(0, 0, 0, 0.92) 0, rgba(0, 0, 0, 0) 470px); }
        #destello { position: absolute; inset: 0; background: #FFF3D6; opacity: 0; }
        #grano { position: absolute; left: 0; top: 0; width: 1480px; height: 2320px; background: url("assets/grano.jpg"); mix-blend-mode: overlay; opacity: 0.3; }
        .bl { position: absolute; left: 0; right: 0; top: 300px; display: flex; flex-direction: column; align-items: center; }
        .r { margin: 0; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; line-height: 1.12; letter-spacing: -0.025em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 3px rgba(255, 236, 200, 0.55), 0 0 18px rgba(255, 200, 120, 0.5), 0 2px 10px rgba(0, 0, 0, 0.9); }
        .w { display: inline-block; opacity: 0; }
        .ser { margin: 0; font-family: ${SERIFA}; font-weight: 400; line-height: 1; letter-spacing: -0.02em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 6px rgba(255, 236, 200, 0.6), 0 0 34px rgba(255, 190, 100, 0.55), 0 3px 14px rgba(0, 0, 0, 0.9); }
        .amarillo { color: ${AMBAR}; text-shadow: 0 0 8px rgba(255, 200, 110, 0.7), 0 0 44px rgba(255, 181, 71, 0.7), 0 3px 14px rgba(0, 0, 0, 0.9); }
        .col { position: absolute; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; }
        .centro { position: absolute; left: 0; right: 0; text-align: center; opacity: 0; }
        #ficha { position: absolute; left: 230px; top: 520px; width: 620px; height: 620px; padding: 16px 16px 16px; background: #EDE4CB; box-shadow: 0 0 0 2px #111, 0 0 70px rgba(255, 181, 71, 0.45), 16px 20px 0 rgba(0, 0, 0, 0.6); opacity: 0; }
        #ficha img { width: 100%; height: 100%; object-fit: cover; display: block; }
        #nombre { top: 1190px; font-size: 118px; }
        #anio { top: 462px; font-size: 200px; }
        #titulo { top: 1150px; font-size: 84px; font-style: italic; }
        #maquina { top: 620px; opacity: 0; }
        #maquina p { margin: 0; font-family: "Maquina Racha", monospace; font-size: 66px; line-height: 1.5; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 14px rgba(255, 200, 120, 0.4); }
        #maquina span { position: relative; display: inline-block; }
        .raya { position: absolute; left: -10px; right: -10px; top: 50%; height: 8px; margin-top: -2px; background: ${CREMA}; border-radius: 4px; transform-origin: 0 50%; opacity: 0; box-shadow: 0 0 16px rgba(255, 200, 120, 0.9); }
        #dicho { top: 520px; font-size: 62px; font-style: italic; }
        #ciudad { top: 452px; font-size: 220px; }
        #cuad { position: absolute; left: 162px; top: 620px; width: 756px; display: grid; grid-template-columns: repeat(12, 52px); gap: 12px; opacity: 0; }
        .q { width: 52px; height: 52px; border-radius: 10px; border: 3px solid rgba(244, 231, 195, 0.35); background-color: rgba(0, 0, 0, 0.3); }
        #n21 { top: 760px; font-size: 420px; }
        #tacha21 { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; }
        #n66 { top: 640px; font-size: 600px; }
        #barras { position: absolute; left: 90px; right: 0; top: 640px; }
        .fila { opacity: 0; margin-bottom: 70px; } .fila .ser { font-size: 150px; } .fila small { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; letter-spacing: -0.01em; margin-left: 16px; color: ${CREMA}; }
        .barra { height: 34px; margin-top: 18px; border-radius: 17px; background: ${AMBAR}; transform-origin: 0 50%; box-shadow: 0 0 26px rgba(255, 181, 71, 0.7); }
        #barra18 { width: 82px; } #barra254 { width: 1160px; }
        #dia22 { top: 452px; font-size: 190px; }
        #tercio { top: 560px; font-size: 560px; }
        #marca { top: 850px; font-size: 230px; }
        #pista { position: absolute; left: 140px; top: 1130px; width: 800px; height: 40px; border-radius: 20px; border: 3px solid rgba(244, 231, 195, 0.5); opacity: 0; overflow: hidden; }
        #lleno { width: 33.33%; height: 100%; background: ${AMBAR}; transform-origin: 0 50%; box-shadow: 0 0 26px rgba(255, 181, 71, 0.7); }
        #de66 { top: 1200px; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 46px; letter-spacing: -0.01em; color: ${CREMA}; }
      </style>
      <div id="root" data-composition-id="escena" data-width="1080" data-height="1920">
        <div id="mundo" data-layout-allow-overflow>
          <div id="rejilla" data-layout-allow-overflow></div>
${htmlTomas}
          <div class="vin"></div>
          <div id="ficha" data-layout-allow-overflow><img src="assets/maltz.jpg" alt="" /></div>
          <p class="ser centro" id="nombre">Maxwell Maltz</p>
          <p class="ser centro" id="anio">en 1960</p>
          <p class="ser centro" id="titulo">«Psycho-Cybernetics»</p>
          <div class="col" id="maquina">
            <p><span class="borra">mínimo unos<i class="raya" id="raya1"></i></span> <span id="queda">21 días</span></p>
            <p><span class="borra">para acostumbrarse<i class="raya" id="raya2"></i></span></p>
            <p><span class="borra">a su cara nueva<i class="raya" id="raya3"></i></span></p>
          </div>
          <p class="ser centro" id="dicho">«un hábito se forma en…»</p>
          <p class="ser centro" id="ciudad">Londres</p>
          <div id="cuad">${Array.from({ length: 84 }, () => '<i class="q"></i>').join('')}</div>
          <p class="ser centro" id="n21">21</p>
          <svg class="trazo" id="tacha21" viewBox="0 0 1080 1920"><path pathLength="1" d="M250 1050 C 400 970, 600 1030, 840 930" /></svg>
          <p class="ser centro amarillo" id="n66">66</p>
          <div id="barras">
            <div class="fila" id="f18"><p class="ser">18<small>días</small></p><div class="barra" id="barra18"></div></div>
            <div class="fila" id="f254"><p class="ser">254<small>días</small></p><div class="barra" id="barra254"></div></div>
          </div>
          <p class="ser centro" id="dia22">el día 22</p>
          <p class="ser centro amarillo" id="tercio">1/3</p>
          <div id="pista"><div id="lleno"></div></div>
          <p class="centro" id="de66">21 de 66 días</p>
          <p class="ser centro" id="marca">Racha</p>
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

// ---------- 6. el archivo principal: la escena, el avatar, el celular con la app, la pastilla y el sonido ----------
const PANT_W = 500, PANT_H = Math.round(500 * 1760 / 858), BORDE = 13;
const MIC = 'radial-gradient(ellipse 17% 25% at 51% 76%, #000 62%, transparent 100%)';
const principal = [];
// El avatar: cada aparición con sus letras pequeñas (blancas, palabra por palabra)
AVATAR.forEach((av) => {
  principal.push(`tl.set("#${av.id}-caja", { autoAlpha: 1 }, ${n(Math.max(0, av.ini - PELO))});`, `tl.set("#${av.id}-caja", { autoAlpha: 0 }, ${n(av.ini + av.dura - PELO)});`);
  principal.push(`tl.fromTo("#${av.id}-caja .mov", { scale: 1.0 }, { scale: 1.06, duration: ${n(av.dura)}, ease: "none", immediateRender: false }, ${n(av.ini)});`);
  let k = 0;
  av.renglones.forEach((r, j) => r.split(' ').forEach(() => { const id = `${av.id}-w${k}`; principal.push(`tl.fromTo("#${id}", { opacity: 0.001, color: "#8a8a8a" }, { opacity: 1, color: "#FFFFFF", duration: 0.12, immediateRender: false }, ${n(av.ini + av.tiempos[k] - 0.03)});`); k++; }));
  // se muestran de a dos renglones
  for (let j = 0; j < av.renglones.length; j += 2) {
    const primera = av.renglones.slice(0, j).join(' ').split(' ').filter(Boolean).length, sigPar = av.renglones.slice(0, j + 2).join(' ').split(' ').filter(Boolean).length;
    principal.push(`tl.set("#${av.id}-p${j / 2}", { autoAlpha: 1 }, ${n(Math.max(0, av.ini + av.tiempos[primera] - 0.06))});`);
    principal.push(`tl.set("#${av.id}-p${j / 2}", { autoAlpha: 0 }, ${n(sigPar < av.tiempos.length ? av.ini + av.tiempos[sigPar] - 0.06 : av.ini + av.dura - PELO)});`);
  }
});
// El gancho: negro, solo el micrófono en ámbar y "21 días"; después sube la luz y aparece la cara
const REV = AV1.antesReal - 0.12;
principal.push(
  `tl.to("#velo", { opacity: 0, duration: 0.3, ease: "power2.out" }, ${n(REV)});`,
  `tl.to("#mic", { opacity: 1, duration: 0.05 }, 0.08);`,
  `tl.to("#mic", { opacity: 0.2, duration: 0.04 }, 0.17);`, `tl.to("#mic", { opacity: 1, duration: 0.05 }, 0.25);`, `tl.to("#mic", { opacity: 0.35, duration: 0.04 }, 0.34);`, `tl.to("#mic", { opacity: 1, duration: 0.1 }, 0.42);`,
  `tl.to("#mic", { opacity: 0, duration: 0.6, ease: "power1.in" }, ${n(REV + 0.1)});`,
  `tl.to("#g21", { opacity: 1, scale: 1.06, duration: 0.25, ease: "power2.out" }, 0.1);`,
  `tl.to("#g21", { opacity: 0, scale: 1.25, filter: "blur(10px)", duration: 0.25, ease: "power2.in" }, ${n(REV - 0.05)});`);
principal.push(...saltosGrano('#grano2'));
const htmlAvatar = AVATAR.map((av, i) => `      <div class="avcaja" id="${av.id}-caja" data-layout-allow-overflow>
        <div class="mov">${av.hay ? `<video id="${av.id}" class="clip" src="assets/${av.id}.mp4" playsinline muted data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${10 + i}"></video>` : '<img src="assets/avatar.jpg" alt="" />'}</div>
${Array.from({ length: Math.ceil(av.renglones.length / 2) }, (_, p) => { let k = av.renglones.slice(0, p * 2).join(' ').split(' ').filter(Boolean).length; return `        <div class="sub" id="${av.id}-p${p}">${av.renglones.slice(p * 2, p * 2 + 2).map((r) => `<p>${r.split(' ').map((tx) => `<span id="${av.id}-w${k++}">${tx}</span>`).join(' ')}</p>`).join('')}</div>`; }).join('\n')}
      </div>`).join('\n');
const audioAvatar = AVATAR.filter((av) => av.hay).map((av, i) => `      <audio id="${av.id}-voz" src="assets/${av.id}.wav" data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${20 + i}" data-volume="1"></audio>`).join('\n');
const audioVoz = SEGS.filter((s) => !s.av).map((s, i) => `      <audio id="voz${i + 1}" src="assets/voz${i + 1}.wav" data-start="${n(s.ini + ENTRA_VOZ - 0.06)}" data-duration="${n(pal[s.a].f - pal[s.de].i + 0.28)}" data-media-start="0" data-track-index="${3 + i}" data-volume="1"></audio>`).join('\n');
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · ${NOMBRE} · El día 22</title>
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
      .avcaja img, .avcaja video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
      .sub { position: absolute; left: 0; right: 0; top: 1118px; text-align: center; opacity: 0; visibility: hidden; }
      .sub p { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 54px; line-height: 1.14; letter-spacing: -0.025em; color: #fff; white-space: nowrap; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95), 0 0 3px rgba(0, 0, 0, 0.9); }
      .sub span { display: inline-block; opacity: 0.001; }
      #velo { position: absolute; inset: 0; z-index: 4; background: #000; opacity: 1; }
      #mic { position: absolute; inset: 0; z-index: 5; background: url("assets/mic-ambar.jpg") center / cover; -webkit-mask-image: ${MIC}; mask-image: ${MIC}; opacity: 0.5; filter: drop-shadow(0 0 30px rgba(255, 181, 71, 0.6)); }
      #g21 { position: absolute; left: 0; right: 0; top: 420px; z-index: 6; text-align: center; font-family: "Serifa Racha", serif; font-size: 300px; line-height: 1; letter-spacing: -0.02em; color: #F4E7C3; text-shadow: 0 0 6px rgba(255, 236, 200, 0.6), 0 0 34px rgba(255, 190, 100, 0.55); opacity: 0.4; }
      #g21 small { display: block; font-size: 110px; margin-top: -20px; }
      .vin2 { position: absolute; inset: 0; z-index: 7; pointer-events: none; background: radial-gradient(ellipse 85% 70% at 50% 45%, transparent 50%, rgba(0, 0, 0, 0.55) 100%); }
      #grano2 { position: absolute; left: 0; top: 0; z-index: 8; width: 1480px; height: 2320px; background: url("assets/grano.jpg"); mix-blend-mode: overlay; opacity: 0.22; }
      #halo { position: absolute; left: 90px; top: 520px; width: 900px; height: 1200px; z-index: 9; background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 181, 71, 0.34), rgba(255, 181, 71, 0) 70%); opacity: 0; }
      #cel { position: absolute; left: ${(1080 - PANT_W - 2 * BORDE) / 2}px; top: 560px; z-index: 10; width: ${PANT_W + 2 * BORDE}px; height: ${PANT_H + 2 * BORDE}px; padding: ${BORDE}px; border-radius: 66px; background: #24272D; box-shadow: 0 0 0 3px #0F1113, 0 0 60px rgba(255, 181, 71, 0.28); opacity: 0; visibility: hidden; }
      #cel-pantalla { position: relative; width: 100%; height: 100%; border-radius: 54px; overflow: hidden; background: #0F1113; }
      #cel-video { width: 100%; height: 100%; object-fit: cover; }
      #final { width: 100%; height: 100%; object-fit: cover; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1130px; z-index: 11; display: flex; justify-content: center; opacity: 0; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 40px; letter-spacing: -0.01em; color: #F4E7C3; background: #0F1113; border: 3px solid #FFB547; border-radius: 999px; padding: 16px 36px 20px; white-space: nowrap; box-shadow: 0 0 34px rgba(255, 181, 71, 0.4); }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="escena" class="clip" style="z-index: 1" data-composition-id="escena" data-composition-src="compositions/escena.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="0" data-width="1080" data-height="1920"></div>
${htmlAvatar}
      <div id="velo"></div>
      <div id="mic"></div>
      <p id="g21">21<small>días</small></p>
      <div class="vin2"></div>
      <div id="grano2" data-layout-allow-overflow></div>
      <video id="final" class="clip" style="z-index: 0" src="assets/final.mp4" playsinline muted data-start="${n(C_APP)}" data-duration="${n(TOTAL - C_APP)}" data-media-start="0" data-track-index="7"></video>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago</span></div>
${audioVoz}
${audioAvatar}
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="9" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${principal.join('\n      ')}
      tl.set(".vin2, #grano2", { autoAlpha: 0 }, ${n(C_APP - PELO)});
      tl.fromTo("#pastilla", { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.6)", immediateRender: false }, ${n(T(W.te) - 0.1)});
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
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s · ${sonidos.length} efectos. Avatar: ${AVATAR.map((av) => `${av.clip} ${av.hay ? 'clip' : 'FOTO QUIETA (falta el clip)'} ${av.ini.toFixed(1)}–${(av.ini + av.dura).toFixed(1)}`).join(' · ')}.`);
console.log(`Maltz ${tA.toFixed(1)} · 1960 ${T(W.anio).toFixed(1)} · espejo ${TOMAS[1].ini.toFixed(1)} · libro ${TOMAS[2].ini.toFixed(1)} · frase ${T(W.con).toFixed(1)} · Londres ${TOMAS[3].ini.toFixed(1)} · cuadritos ${T(W.durante).toFixed(1)} · 66 ${T(W.n66).toFixed(1)} · barras ${T(W.aUna).toFixed(1)} · día 22 ${TOMAS[4].ini.toFixed(1)} · 1/3 ${T(W.un).toFixed(1)} · arroz ${TOMAS[5].ini.toFixed(1)} · app ${C_APP.toFixed(1)}.`);
