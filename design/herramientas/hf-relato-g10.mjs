// Guion 10 "El golpe 101" (Jacob Riis y el picapedrero): estilo Dark con Jhonny. Sale del molde del guion 9
// (hf-relato-g9.mjs) y le suma: el gancho de la piedra con el contador, la grieta de luz que parte la pantalla,
// el retrato real recortado del fondo (el efecto "resalta y se mueve"), el clip del picapedrero sobre fondo oscuro,
// la frase escrita en la pared del camerino y el cierre dicho por Jhonny ("Escribe Racha y te la muestro").
// Uso: node design/herramientas/hf-relato-g10.mjs [--solo-html]
//      después, dentro de campana/guion10/hyperframes: check, snapshot --at ..., render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4
//
// Tramos (SEGS): piedra y contador · Jhonny · voz · Jhonny · voz · Jhonny · Jhonny (con la app en medio) · cierre.
// Antes de correrlo tienen que existir, en guion10/:
// - clips/1-gancho, 2-puente, 3-cierre y 4-racha (.mp4, .palabras.json y -juan.mp3), como en el guion 9;
// - clips/picapedrero-oscuro.mp4 (fondo-oscuro-clip.py);
// - imagenes/real-riis-vertical.jpg y real-riis-corte.png (el retrato a 1080 × 1920 y su recorte con remove-background).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const C = path.join(AQUI, '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const NOMBRE = 'guion10';
const BASE_DIR = path.join(C, 'guion10');
const VOZ = path.join(BASE_DIR, 'voz', 'golpe101-v1-juan-sin-pausas');
const P = path.join(BASE_DIR, 'hyperframes');
const A = path.join(P, 'assets');
for (const d of [A, path.join(A, 'fuentes'), path.join(P, 'compositions')]) fs.mkdirSync(d, { recursive: true });
const n = (x) => Number(x.toFixed(6));
const PELO = 0.004;
const SOLO_HTML = process.argv.includes('--solo-html');

const limpia = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ]/g, '');
const NUMEROS = { catorce: '14', cien: '100', cinco: '5' };
const igual = (escrita, dicha) => { const a = limpia(escrita), b = limpia(dicha); return a === b || NUMEROS[a] === b || NUMEROS[b] === a; };

// ---------- la voz en off ----------
// Versión 2: la frase del camerino se cambió ("Años después lo contó en un libro. Y hoy esas palabras están pintadas en el
// camerino de los Spurs de San Antonio, cinco veces campeones de la NBA.") y se generó aparte: reemplaza las palabras 102 a 122.
const VOZ_B = path.join(BASE_DIR, 'voz', 'golpe101-v2-frase6-sin-pausas');
const palA = JSON.parse(fs.readFileSync(VOZ + '.palabras.json', 'utf8')).palabras, palB = JSON.parse(fs.readFileSync(VOZ_B + '.palabras.json', 'utf8')).palabras;
const pal = [...palA.slice(0, 102), ...palB, ...palA.slice(123)];
const W = { jacob: 2, riis: 3, en1870: 4, anio: 5, sin: 10, una: 13, estacion: 18, yAhi: 21, yLe: 25, mataron: 27, perro: 29, ya: 30, escribio: 33, unArt: 37, otro1: 39, otro2: 40, yNada: 42, nada: 43, cuando: 44, iba: 51, piedra: 58, cien: 59, yNi: 61, raya: 64, al: 65, n101: 66, se: 67, abria: 68, yEl: 71, ese: 78, habian: 80, todos: 82, antes: 85, porEso: 86, escribir: 91, yEn: 92, n1896: 94, cerraran: 99, anios: 102, libro: 108, yHoy: 109, pintadas: 114, camerino: 117, spurs: 120, cinco: 124, nba: 129, aEsos: 130, los: 135, que: 137, ven: 140, cumples: 141, noNotas: 142, ySon: 145, cuentan: 149 };
const ESPERO = { jacob: 'jacob', riis: 'riis', anio: '1870', estacion: 'estacion', perro: 'perro', nada: 'nada', piedra: 'piedra', cien: '100', n101: '101', abria: 'abria', antes: 'antes', n1896: '1896', cerraran: 'cerraran', libro: 'libro', pintadas: 'pintadas', camerino: 'camerino', spurs: 'spurs', cinco: '5', nba: 'nba', ven: 'ven', cuentan: 'cuentan' };
for (const [k, v] of Object.entries(ESPERO)) if (limpia(pal[W[k]].t) !== v) { console.log(`FALLA: la palabra ${W[k]} debía ser "${v}" y la voz dice "${pal[W[k]].t}".`); process.exit(1); }

// ---------- los clips de Jhonny ----------
const AVATAR = [
  { id: 'av1', clip: '1-gancho', dice: 'Un reportero escribió casi catorce años contra lo mismo, sin ver ningún cambio. Lo que no lo dejó rendirse fue una piedra.', renglones: ['un reportero escribió', 'casi 14 años contra lo mismo,', 'sin ver ningún cambio.', 'lo que no lo dejó rendirse', 'fue una piedra.'], antes: 0.25, despues: 0.62 },
  { id: 'av2', clip: '2-puente', dice: 'Yo hacía lo contrario. Miraba si ya se notaba, veía que no, y lo dejaba.', renglones: ['yo hacía lo contrario.', 'miraba si ya se notaba,', 'veía que no,', 'y lo dejaba.'], antes: 0.15 },
  { id: 'av3', clip: '3-cierre', dice: 'Si hoy cumpliste y no notaste nada, no lo dejes. Fue un golpe más.', renglones: ['si hoy cumpliste', 'y no notaste nada,', 'no lo dejes.', 'fue un golpe más.'], antes: 0.15 },
  { id: 'av4', clip: '4-racha', dice: 'Yo los cuento en Racha, una app que hicimos para eso. Escribe Racha y te la muestro.', renglones: ['yo los cuento en Racha,', 'una app que hicimos para eso.', 'escribe Racha', 'y te la muestro.'], antes: 0.15 },
];
const DESPUES = 0.3;
for (const av of AVATAR) {
  const mp4 = path.join(BASE_DIR, 'clips', av.clip + '.mp4'), pj = path.join(BASE_DIR, 'clips', av.clip + '.palabras.json');
  const escritas = av.dice.split(' ');
  av.hay = fs.existsSync(mp4) && fs.existsSync(pj);
  if (av.hay) {
    const ps = JSON.parse(fs.readFileSync(pj, 'utf8')).palabras;
    // busca la frase del guion dentro de lo que dijo el clip; una palabra de una letra que la transcripción se comió
    // se pone en el mismo instante de la que sigue
    const alinea = (desde) => { const sal = []; let j = desde; for (const e of escritas) { if (ps[j] && igual(e, ps[j].t)) sal.push(ps[j++]); else if (limpia(e).length <= 1 && ps[j]) sal.push({ t: e, i: ps[j].i, f: ps[j].i }); else return null; } return sal; };
    av.palabras = null;
    for (let i = 0; i < ps.length && !av.palabras; i++) av.palabras = alinea(i);
    if (!av.palabras) { console.log(`FALLA: el clip ${av.clip} no dice la frase del guion completa. Dijo: ${ps.map((p) => p.t).join(' ')}`); process.exit(1); }
    // Se parte donde hace una pausa larga (más de 0,7 s): se quita el silencio y en el corte la cámara se acerca
    const grupos = [[av.palabras[0]]];
    av.palabras.slice(1).forEach((p) => { const g = grupos[grupos.length - 1]; if (p.i - g[g.length - 1].f > 0.7) grupos.push([p]); else g.push(p); });
    av.tramos = grupos.map((g, j) => ({ de: j === 0 ? Math.max(0, g[0].i - av.antes) : g[0].i - 0.18, a: g[g.length - 1].f + (j === grupos.length - 1 ? (av.despues ?? DESPUES) : 0.22), z: 1 + 0.13 * j }));
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
const [AV1, AV2, AV3, AV4] = AVATAR;

// ---------- los tramos y el reloj ----------
const INTRO = 2.2;                                  // la piedra y el contador, antes de que aparezca Jhonny
const SEGS = [{ intro: INTRO }, { av: AV1 }, { de: 0, a: 101, voz: VOZ }, { de: 102, a: 129, voz: VOZ_B }, { av: AV2 }, { de: 130, a: 149, voz: VOZ }, { av: AV3 }, { av: AV4 }];
const VOCES = SEGS.filter((s) => s.de !== undefined);
const ENTRA_VOZ = 0.14;
let reloj = 0;
const inicioDe = new Array(pal.length);
for (const s of SEGS) {
  s.ini = reloj;
  if (s.intro) reloj += s.intro;
  else if (s.av) { s.av.ini = reloj; reloj += s.av.dura; }
  else { for (let k = s.de; k <= s.a; k++) inicioDe[k] = reloj + ENTRA_VOZ + (pal[k].i - pal[s.de].i); s.finVoz = reloj + ENTRA_VOZ + (pal[s.a].f - pal[s.de].i); reloj = s.finVoz + 0.3; }
  s.fin = reloj;
}
const T = (k) => inicioDe[k];
const F = (k) => inicioDe[k] + (pal[k].f - pal[k].i);
// La cola: después de la última frase de Jhonny, la app llenándose sola (el mes en el celular, Progreso en el computador) y la tarjeta
// D_VIAJE y EN_TARJETA son los de design/herramientas/ventanas-viaje.py (TOTAL y TARJETA)
const D_CAL = 1.4, D_VIAJE = 9.3, EN_TARJETA = 7.0;
const TOTAL = reloj + D_CAL + D_VIAJE;
const tA = SEGS[2].ini;                              // empieza la historia
// El cierre: Jhonny dice "Yo los cuento en Racha," → la app → vuelve su cara en "Escribe Racha y te la muestro" → la app y RACHA
const T_APP = AV4.ini + AV4.tiempos[4] - 0.06, T_CARA = AV4.ini + AV4.tiempos[11] - 0.14, T_FIN = AV4.ini + AV4.dura;
const T_TARJETA = T_FIN + D_CAL + EN_TARJETA;
// Los momentos clave, para acomodar la música (musica-mezcla-g10.py)
fs.writeFileSync(path.join(BASE_DIR, 'tiempos.json'), JSON.stringify({ total: n(TOTAL), historia: n(tA), golpeA: n(T(W.abria) + 0.03), callar: n(T(W.yEl)), golpeB: n(T(W.todos)), puente: n(AV2.ini), nombre: n(T(W.los)), cierre: n(AV3.ini), app: n(T_APP), fin: n(T_FIN) }, null, 1), 'utf8');


// El picapedrero (clips/picapedrero-oscuro.mp4, 720 × 1280 a 24 cuadros): el golpe cae en el segundo 0,94 del clip
const HIT = 0.94, PF = [0.70, 0.585];               // PF: dónde pega el mazo, en fracción del cuadro
const tP0 = T(W.cuando) - 0.08, tHit = T(W.piedra) + 0.04, tCien = T(W.cien) - 0.06, tNi = T(W.yNi) - 0.08, tPfin = T(W.se) - 0.08;
const PICA = [];
{
  const d1 = (tHit - HIT) - tP0;
  PICA.push(d1 <= 2.9 ? { src: 7.9 - d1, dur: d1, vel: 1, z: 1.0, fx: 0.5, fy: 0.5 } : { src: 5.0, dur: d1, vel: 2.9 / d1, z: 1.0, fx: 0.5, fy: 0.5 });
  PICA.push({ src: 0, dur: tCien - (tHit - HIT), vel: 1, z: 1.15, fx: 0.55, fy: 0.6, golpe: HIT });
  const nG = Math.max(3, Math.round((tNi - tCien) / 0.27)), cada = (tNi - tCien) / nG;
  for (let j = 0; j < nG; j++) PICA.push({ src: HIT - cada * 0.6, dur: cada, vel: 1, z: 1.32 + 0.13 * j, fx: PF[0], fy: PF[1], golpe: cada * 0.6, numero: Math.round(1 + 99 * j / (nG - 1)) });
  PICA.push({ src: 2.4, dur: tPfin - tNi, vel: 0.4, z: 1.5, fx: 0.72, fy: 0.72 });
  let t = tP0; for (const s of PICA) { s.t = t; t += s.dur; const w = 1080 * s.z, h = 1920 * s.z; s.x = Math.min(w - 1080, Math.max(0, s.fx * w - 540)); s.y = Math.min(h - 1920, Math.max(0, s.fy * h - 960)); s.px = PF[0] * w - s.x; s.py = PF[1] * h - s.y; }
}
const GOLPES_PICA = PICA.filter((s) => s.golpe !== undefined).map((s) => ({ t: s.t + s.golpe, x: s.px, y: s.py, numero: s.numero }));

// ---------- las fotos ----------
const TOMAS = [
  { id: 'golpe0', foto: '1-piedra.jpg', ini: 0, fin: INTRO, ovalos: [], chispa: [0.48, 0.4], marcos: [{ z: 1.0, fx: 0.5, fy: 0.48, Y: 960 }] },
  { id: 'puerto', foto: '2-puerto.jpg', de: W.en1870, hasta: W.una, ovalos: [[0.55, 0.5, 0.1, 0.055]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.anio, z: 1.3, fx: 0.52, fy: 0.55, Y: 1060 }, { k: W.sin, z: 1.65, fx: 0.55, fy: 0.51, Y: 1020 }] },
  { id: 'estacion', foto: '3-estacion.jpg', de: W.una, hasta: W.yAhi, ovalos: [[0.3, 0.37, 0.08, 0.055]], luces: [[0.3, 0.372, 0.034, 0.022]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }, { k: W.estacion, z: 1.4, fx: 0.42, fy: 0.45, Y: 1000 }] },
  { id: 'perro', foto: '4-perro-a.jpg', de: W.yAhi, hasta: W.ya, ovalos: [[0.66, 0.13, 0.11, 0.085]], luces: [[0.66, 0.135, 0.045, 0.034]], apaga: W.mataron,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.42, Y: 860 }, { k: W.yLe, z: 1.5, fx: 0.56, fy: 0.64, Y: 1080 }] },
  { id: 'escritorio', foto: '5-escritorio.jpg', de: W.ya, hasta: W.unArt, ovalos: [[0.2, 0.82, 0.15, 0.09]],
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.5, Y: 960 }, { k: W.escribio, z: 1.5, fx: 0.58, fy: 0.45, Y: 1000 }] },
  { id: 'partida', foto: '7-piedra-partida.jpg', de: W.se, hasta: W.yEl, ovalos: [], luces: [[0.5, 0.52, 0.03, 0.17]], luzK: W.abria,
    marcos: [{ z: 1.15, fx: 0.5, fy: 0.5, Y: 990 }, { k: W.abria, z: 1.5, fx: 0.5, fy: 0.5, Y: 1010 }] },
  { id: 'escritorio2', foto: '5-escritorio.jpg', de: W.porEso, hasta: W.yEn, ovalos: [[0.2, 0.82, 0.15, 0.09]],
    marcos: [{ z: 1.6, fx: 0.6, fy: 0.46, Y: 1000 }, { k: W.escribir, z: 1.25, fx: 0.5, fy: 0.55, Y: 1000 }] },
  { id: 'puerta', foto: '8-puerta.jpg', claro: 0.16, de: W.yEn, hasta: W.anios, ovalos: [[0.38, 0.64, 0.08, 0.055]], ambK: W.cerraran,
    marcos: [{ z: 1.0, fx: 0.5, fy: 0.45, Y: 900 }, { k: W.cerraran, z: 1.7, fx: 0.4, fy: 0.62, Y: 1050 }] },
  { id: 'libro', foto: '5-escritorio.jpg', de: W.anios, hasta: W.yHoy, ovalos: [[0.2, 0.82, 0.15, 0.09]],
    marcos: [{ z: 1.25, fx: 0.4, fy: 0.3, Y: 900 }, { k: W.libro, z: 1.5, fx: 0.5, fy: 0.5, Y: 1000 }] },
  { id: 'camerino', foto: '10-camerino-real.jpg', de: W.yHoy, hasta: null, ovalos: [], luces: [[0.51, 0.065, 0.06, 0.02]], muro: true,
    marcos: [{ z: 1.0, fx: 0.51, fy: 0.42, Y: 960 }, { k: W.pintadas, z: 2.05, fx: 0.51, fy: 0.3, Y: 860 }] },
];
for (const t of TOMAS) { t.cubre = true; t.ini = t.ini ?? T(t.de) - 0.08; t.fin = t.fin ?? (t.hasta === null ? AV2.ini : T(t.hasta) - 0.08); }
const FOTOS = [...new Set(TOMAS.map((t) => t.foto))];
const archivoDe = (t) => t.foto.replace(/\.jpg$/, '');

// ---------- los efectos de sonido ----------
const VOLUMEN = { whoosh: -8, golpe: -6, pop: -9, caida: -6, toque: -9, logro: -9, boom: -2, subida: -7, neon: -8, diapositiva: -6, garabato: -6, latido: -3, brillo: -7, tachar: -8, mazo: -2, piedra: 0, periodico: -2, relleno: -6 };
const SON = path.join(C, 'sonidos');
const MEDIDAS = JSON.parse(fs.readFileSync(path.join(SON, 'sonidos.json'), 'utf8'));
const sonidos = [];
const suena = (s, t, { modo = 'golpe', db = 0 } = {}) => sonidos.push({ s, t: Math.max(0, t - (modo === 'golpe' ? MEDIDAS[s].golpe_en : modo === 'fin' ? MEDIDAS[s].dura : 0)), db: VOLUMEN[s] + db });

// ---------- 1. sonido, fotos y clips ----------
const W0 = 1536, H0 = 2730;
const CINE = (entrada) => `${entrada}highpass=f=65,equalizer=f=115:t=q:w=0.9:g=3.5,equalizer=f=320:t=q:w=1.1:g=-2.5,equalizer=f=3400:t=q:w=1.2:g=2.5,equalizer=f=9500:t=h:w=0.7:g=2,acompressor=threshold=-22dB:ratio=3.5:attack=6:release=140:makeup=2.5,asplit[seca][m];[m][1:a]afir=dry=0:wet=10,highpass=f=300,volume=-21dB[sala];[seca][sala]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89[a]`;
const lufsDe = (archivo) => Number(spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', archivo, '-vn', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]);
const pedazoDeVoz = (origen, de, a, salida) => {
  const tmp = salida.replace(/\.wav$/, '-crudo.wav'), sala = path.join(A, 'sala.wav');
  ff(['-ss', String(Math.max(0, de)), '-t', String(a - Math.max(0, de)), '-i', origen, '-i', sala, '-filter_complex', CINE('[0:a]'), '-map', '[a]', '-ar', '48000', '-ac', '2', tmp]);
  const dur = a - Math.max(0, de);
  ff(['-i', tmp, '-af', `volume=${(-20.3 - lufsDe(tmp)).toFixed(2)}dB,alimiter=limit=0.89,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, dur - 0.08).toFixed(3)}:d=0.08`, '-ar', '48000', '-ac', '2', salida]);
  fs.unlinkSync(tmp);
};
const FILTRO = fs.readFileSync(path.join(C, 'filtro', 'filtro-campana.txt'), 'utf8').trim();
const par = (x) => Math.round(x / 2) * 2;
if (!SOLO_HTML) {
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=1.1:c=white:a=0.6:s=11', '-af', 'highpass=f=250,lowpass=f=4200,afade=t=in:d=0.004,afade=t=out:st=0.02:d=1.08:curve=exp', '-ar', '48000', '-ac', '2', path.join(A, 'sala.wav')]);
  VOCES.forEach((s, i) => pedazoDeVoz(s.voz + '.mp3', pal[s.de].i - 0.06, pal[s.a].f + 0.22, path.join(A, `voz${i + 1}.wav`)));
  for (const foto of FOTOS) {
    const claro = TOMAS.find((t) => t.foto === foto).claro ?? 0; const origen = path.join(BASE_DIR, 'imagenes', foto), id = foto.replace(/\.jpg$/, '');
    ff(['-i', origen, '-vf', `crop=${W0}:${H0},hue=s=0,eq=brightness=${(-0.1 + claro).toFixed(2)}:contrast=1.24:gamma=${(0.88 + claro * 2.2).toFixed(2)}`, '-q:v', '3', path.join(A, `${id}-bn.jpg`)]);
    ff(['-i', origen, '-vf', `crop=${W0}:${H0},hue=s=0,eq=brightness=0.02:contrast=1.45,colorchannelmixer=rr=1:gg=0.66:bb=0.2`, '-q:v', '3', path.join(A, `${id}-ambar.jpg`)]);
  }
  // las fotos reales: el retrato de Riis (y su recorte) y la foto que él tomó en el dormitorio de la estación
  fs.copyFileSync(path.join(BASE_DIR, 'imagenes', 'real-riis-vertical.jpg'), path.join(A, 'riis.jpg'));
  fs.copyFileSync(path.join(BASE_DIR, 'imagenes', 'real-riis-corte.png'), path.join(A, 'riis-corte.png'));
  ff(['-i', path.join(BASE_DIR, 'imagenes', 'real-dormitorio.jpg'), '-vf', 'scale=1320:-2,hue=s=0,eq=contrast=1.15:brightness=-0.03', '-q:v', '2', path.join(A, 'dormitorio.jpg')]);
  ff(['-f', 'lavfi', '-i', 'nullsrc=s=1480x2320,format=gray,geq=lum=random(1)*255,gblur=sigma=0.7,eq=contrast=1.6', '-frames:v', '1', '-q:v', '4', path.join(A, 'grano.jpg')]);
  // el picapedrero: los pedazos del clip, cada uno con su encuadre, pegados en un solo video
  {
    let cuadros = 0; const lista = [];
    PICA.forEach((s, i) => {
      const hasta = Math.round((s.t + s.dur - tP0) * 30), N = hasta - cuadros; cuadros = hasta;
      ff(['-ss', Math.max(0, s.src).toFixed(3), '-t', (N / 30 * s.vel + 0.4).toFixed(3), '-i', path.join(BASE_DIR, 'clips', 'picapedrero-oscuro.mp4'), '-an', '-vf', `setpts=PTS/${s.vel.toFixed(4)},fps=30,scale=${par(1080 * s.z)}:${par(1920 * s.z)}:flags=lanczos,crop=1080:1920:${Math.round(s.x)}:${Math.round(s.y)},eq=contrast=1.1:brightness=0.01,setsar=1`, '-frames:v', String(N), '-c:v', 'libx264', '-preset', 'fast', '-crf', '15', '-pix_fmt', 'yuv420p', path.join(A, `pica${i}.mp4`)]);
      lista.push(`file 'pica${i}.mp4'`);
    });
    fs.writeFileSync(path.join(A, 'pica.txt'), lista.join('\n'));
    ff(['-f', 'concat', '-safe', '0', '-i', path.join(A, 'pica.txt'), '-c', 'copy', path.join(A, 'pica.mp4')]);
  }
  // el final: la app de verdad llenándose sola (fotos de grabar-llenado.cjs y de grabar-llenado-escritorio.cjs con VERTICAL=1)
  {
    const LL = path.join(C, 'app-llenado'), cuenta = (re) => fs.readdirSync(LL).filter((f) => re.test(f)).length, cuadros = (seg) => Math.round(seg * 30);
    const nHoy = cuenta(/^vhoy-\d+\.png$/), nCal = cuenta(/^cal-\d+\.png$/), nProg = cuenta(/^vprog-\d+\.png$/), nA = Math.round(nProg * 0.7);
    const parte = (entrada, vf, N, salida) => ff([...entrada, '-vf', vf + ',setsar=1', '-frames:v', String(N), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', path.join(A, salida)]);
    const cam = (z, x, y) => `zoompan=z='${z}':x='(${x})*iw-iw/zoom/2':y='(${y})*ih-ih/zoom/2':d=1:s=1080x1920:fps=30`;
    // (a) Hoy en el computador: las barritas se llenan y se marcan los chulos; lo que sobra queda detrás de la cara de Jhonny
    const N1 = cuadros(T_CARA - T_APP), N2 = cuadros(T_FIN - T_APP) - N1;
    parte(['-framerate', (nHoy / ((N1 - 6) / 30)).toFixed(3), '-i', path.join(LL, 'vhoy-%02d.png')], `crop=1567:2786:481:0,fps=30,tpad=stop_mode=clone:stop_duration=8,${cam(`1.5+0.2*on/${N1}`, '0.306', '0.30')}`, N1 + N2, 'fin0.mp4');
    // (b) el mes en el celular: los días se llenan uno por uno
    const N3 = cuadros(D_CAL);
    parte(['-framerate', (nCal / (D_CAL - 0.2)).toFixed(3), '-i', path.join(LL, 'cal-%02d.png')], `fps=30,tpad=stop_mode=clone:stop_duration=3,${cam(`1.0+0.14*on/${N3}`, '0.5', '0.37')}`, N3, 'fin1.mp4');
    // (c) el recorrido por las ventanas de Progreso (ventanas-viaje.py): la fuerza de los hábitos, las barras, la gráfica y, al final, "Tu año"
    parte(['-i', path.join(LL, 'viaje.mp4')], 'fps=30,tpad=stop_mode=clone:stop_duration=2', cuadros(D_VIAJE), 'fin2.mp4');
    fs.writeFileSync(path.join(A, 'fin.txt'), [0, 1, 2].map((i) => `file 'fin${i}.mp4'`).join('\n'));
    ff(['-f', 'concat', '-safe', '0', '-i', path.join(A, 'fin.txt'), '-c', 'copy', path.join(A, 'final.mp4')]);
  }
  // Jhonny: los clips (con el filtro de la campaña) o, si no han llegado, su foto
  const base = path.join(C, 'guion9', 'clips', 'base-avatar.png');
  ff(['-i', base, '-vf', `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,${FILTRO}`, '-q:v', '2', path.join(A, 'avatar.jpg')]);
  for (const av of AVATAR) if (av.hay) {
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
const chispa = (sel, t) => pasos.push(
  `tl.fromTo("${sel}", { opacity: 0, scale: 0.35 }, { opacity: 1, scale: 1, duration: 0.04, ease: "none", immediateRender: false }, ${n(t)});`,
  `tl.to("${sel}", { opacity: 0, scale: 1.6, duration: 0.22, ease: "power2.out" }, ${n(t + 0.04)});`);

for (const t of TOMAS) {
  const s = `#t-${t.id}`;
  pasos.push(`tl.set("${s}", { autoAlpha: 1 }, ${n(Math.max(0, t.ini - PELO))});`, `tl.set("${s}", { autoAlpha: 0 }, ${n(t.fin - PELO)});`);
  if (t.ini > 0) suena('diapositiva', t.ini);
  t.marcos.forEach((m, i) => {
    const desde = i === 0 ? t.ini : T(m.k) - 0.05, sig = t.marcos[i + 1], hasta = sig ? T(sig.k) - 0.05 : t.fin;
    if (i === 0) pasos.push(`tl.set("${s} .cam", { ${cam(t, m)} }, ${n(Math.max(0, desde - PELO))});`);
    else { pasos.push(`tl.to("${s} .cam", { ${cam(t, m)}, duration: 0.2, ease: "power3.out" }, ${n(desde)});`); suena('golpe', desde + 0.02, { db: -3 }); }
    const arranca = i === 0 ? desde : desde + 0.2;
    if (hasta - arranca > 0.1) pasos.push(`tl.to("${s} .cam", { ${cam(t, m, 0.05)}, duration: ${n(hasta - arranca)}, ease: "none" }, ${n(arranca)});`);
  });
  if (t.ovalos.length) neon(`${s} .amb`, t.ambK ? T(t.ambK) - 0.02 : t.ini + 0.1, t.fuerza ?? 1);
  if (t.luces) neon(`${s} .luz`, t.luzK ? T(t.luzK) - 0.02 : t.ini + 0.1);
  if (t.apaga) pasos.push(`tl.to("${s} .amb, ${s} .luz", { opacity: 0, duration: 0.07 }, ${n(T(t.apaga) + 0.12)});`, `tl.to("${s} .bn", { filter: "brightness(0.55)", duration: 0.3 }, ${n(T(t.apaga) + 0.12)});`);
}
const mascara = (t) => t.ovalos.map(([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, #000 55%, transparent 100%)`).join(', ');
const luz = ([cx, cy, rx, ry]) => `radial-gradient(ellipse ${n(rx * 100)}% ${n(ry * 100)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 214, 140, 0.95) 0, rgba(255, 181, 71, 0.9) 45%, rgba(255, 160, 40, 0.55) 80%, rgba(255, 150, 30, 0) 100%), radial-gradient(ellipse ${n(rx * 330)}% ${n(ry * 330)}% at ${n(cx * 100)}% ${n(cy * 100)}%, rgba(255, 181, 71, 0.4) 0, rgba(255, 181, 71, 0) 100%)`;
// La frase verdadera de Riis, traducida, "pintada" en la pared del camerino (se escribe renglón por renglón)
const MURO = ['«Cuando nada parece servir,', 'voy a mirar a un picapedrero', 'golpear su roca cien veces', 'sin que se vea una grieta.', 'Al golpe ciento uno se parte en dos,', 'y sé que no fue ese golpe,', 'sino todos los de antes.»', '— Jacob Riis'];
const htmlTomas = TOMAS.map((t) => `          <div class="toma" id="t-${t.id}" data-layout-allow-overflow>
            <div class="cam" data-layout-allow-overflow>
              <img class="bn" src="assets/${archivoDe(t)}-bn.jpg" alt="" />${t.ovalos.length ? `
              <div class="amb" style="background-image: url('assets/${archivoDe(t)}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>
              <div class="amb bri" style="background-image: url('assets/${archivoDe(t)}-ambar.jpg'); -webkit-mask-image: ${mascara(t)}; mask-image: ${mascara(t)}"></div>` : ''}${t.luces ? `
              <div class="luz" style="background: ${t.luces.map(luz).join(', ')}"></div>` : ''}${t.chispa ? `
              <div class="chispa" style="left: ${n(t.chispa[0] * W0 - 300)}px; top: ${n(t.chispa[1] * H0 - 300)}px"></div>` : ''}${t.muro ? `
              <div id="muro">${MURO.map((r, i) => `<p id="mu${i}"${i === MURO.length - 1 ? ' class="firma"' : ''}>${r}</p>`).join('')}</div>` : ''}
            </div>
          </div>`).join('\n');

// ---------- 3. las letras pequeñas de la voz en off ----------
const BLOQUES = [
  ['se llamaba ~Jacob ~Riis.'], ['~en ~1870 llegó', 'a Nueva York'], ['sin un peso.'], ['una noche durmió', 'en una estación de policía,'],
  ['y ahí le robaron'], ['y le mataron el perro.'], ['ya de reportero,', 'escribió contra esos dormitorios.'],
  ['un artículo.'], ['otro.'], ['otro más.'], ['y nada.'],
  ['cuando sentía', 'que no servía de nada,'], ['iba a ver a un hombre', 'partir piedra.'],
  ['~100 golpes,'], ['y ni una raya.'], ['al ~101,'], ['se abría en dos.'],
  ['y él sabía que', 'no había sido ese golpe.'], ['habían sido', '~todos ~los ~de ~antes.'],
  ['por eso no dejó', 'de escribir.'], ['y en ~1896,', 'por insistir,'], ['logró que cerraran', 'esos dormitorios.'],
  ['años después', 'lo contó en un libro.'], ['y hoy esas palabras', 'están pintadas'], ['en el camerino', 'de los ~Spurs ~de ~San ~Antonio,'], ['~5 ~veces ~campeones ~de ~la ~NBA.'],
  ['a esos días les digo', '~los ~golpes ~que ~no ~se ~ven:'], ['cumples,'], ['no notas nada,'], ['y son los que cuentan.'],
];
let cuenta = 0;
const bloques = BLOQUES.map((renglones, b) => ({ id: `b${b}`, de: cuenta, renglones: renglones.map((r) => r.split(' ').map((tx) => {
  const oculta = tx.startsWith('~'), escrita = oculta ? tx.slice(1) : tx, k = cuenta++;
  if (!pal[k] || !igual(escrita, pal[k].t)) { console.log(`FALLA: en las letras, la palabra ${k} es "${escrita}" y la voz dice "${pal[k]?.t}".`); process.exit(1); }
  return { tx: escrita, k, oculta };
})) }));
if (cuenta !== pal.length) { console.log(`FALLA: las letras tienen ${cuenta} palabras y la voz ${pal.length}.`); process.exit(1); }
const segDe = (k) => VOCES.find((s) => k >= s.de && k <= s.a);
const htmlBloques = bloques.filter((b) => b.renglones.flat().some((w) => !w.oculta)).map((b) => `        <div class="bl" id="${b.id}">
${b.renglones.map((r) => r.filter((w) => !w.oculta)).filter((r) => r.length).map((r) => `          <p class="r">${r.map((w) => `<span class="w" id="w${w.k}">${w.tx}</span>`).join(' ')}</p>`).join('\n')}
        </div>`).join('\n');
bloques.forEach((b, i) => {
  const visibles = b.renglones.flat().filter((w) => !w.oculta);
  visibles.forEach((w) => pasos.push(`tl.fromTo("#w${w.k}", { opacity: 0, filter: "blur(9px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power1.out", immediateRender: false }, ${n(Math.max(0, T(w.k) - 0.04))});`));
  const sig = bloques[i + 1], ultimo = b.renglones.flat().at(-1).k;
  const sale = sig && segDe(sig.de) === segDe(b.de) ? T(sig.de) - 0.16 : segDe(ultimo).finVoz + 0.12;
  if (visibles.length) pasos.push(`tl.to("#${b.id}", { opacity: 0, filter: "blur(8px)", duration: 0.12, ease: "power1.in" }, ${n(Math.min(sale, TOTAL - 0.2))});`);
});

// ---------- 4. lo que va en grande y los dibujos ----------
const aparece = (sel, t, { dur = 0.22, escala = 1.08, borroso = 14 } = {}) => pasos.push(`tl.fromTo("${sel}", { opacity: 0, filter: "blur(${borroso}px)", scale: ${escala} }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: ${dur}, ease: "power2.out", immediateRender: false }, ${n(t)});`);
const seVa = (sel, t, dur = 0.12) => pasos.push(`tl.to("${sel}", { opacity: 0, duration: ${dur}, ease: "power1.in" }, ${n(t - dur)});`);
const rejilla = (de, a) => pasos.push(`tl.set("#rejilla", { opacity: 1 }, ${n(de - PELO)});`, `tl.set("#rejilla", { opacity: 0 }, ${n(a - PELO)});`);
const traza = (sel, t, dur = 0.4) => pasos.push(`tl.fromTo("${sel}", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: ${dur}, ease: "power1.inOut", immediateRender: false }, ${n(t)});`);
const fondoClaro = (de, a) => pasos.push(`tl.set("#root", { backgroundColor: "rgba(0,0,0,0)" }, ${n(de - PELO)});`, ...(a ? [`tl.set("#root", { backgroundColor: "#050506" }, ${n(a - PELO)});`] : []));

// (0) el gancho: el mazo pega, el número corre hasta 100 y la piedra sigue entera
const NUMS0 = [1, 3, 8, 15, 24, 36, 47, 59, 70, 79, 87, 93, 97, 100], PEGA0 = [0, 3, 6, 9, 13];
const t0 = (i) => 0.1 + i * (INTRO - 0.75) / (NUMS0.length - 1);
NUMS0.forEach((_, i) => pasos.push(`tl.set("#c0-${i}", { autoAlpha: 1 }, ${n(i === 0 ? 0 : t0(i) - PELO)});`, `tl.set("#c0-${i}", { autoAlpha: 0 }, ${n((i < NUMS0.length - 1 ? t0(i + 1) : INTRO) - PELO)});`));
PEGA0.forEach((i, j) => { const t = t0(i); chispa('#t-golpe0 .chispa', t); sacudida(t, j === PEGA0.length - 1 ? 1.1 : 0.6); suena('mazo', t, { db: j === PEGA0.length - 1 ? 2 : 0 }); suena('golpe', t, { db: -4 }); });
suena('boom', t0(13), { db: -3 }); destello(t0(13), 0.12);
pasos.push(`tl.set("#preg", { autoAlpha: 0 }, ${n(INTRO - PELO)});`);
// (a) "Se llamaba Jacob Riis": el retrato real; en su nombre se despega del fondo y salta hacia la cámara
const tPop = T(W.jacob) - 0.06, tRfin = T(W.en1870) - 0.08;
pasos.push(`tl.set("#riis", { autoAlpha: 1 }, ${n(tA - PELO)});`, `tl.set("#riis", { autoAlpha: 0 }, ${n(tRfin - PELO)});`,
  `tl.fromTo("#riis-n", { scale: 1.0 }, { scale: 1.03, duration: ${n(tPop - tA)}, ease: "none", immediateRender: false }, ${n(tA)});`,
  `tl.to("#riis-n", { opacity: 0, duration: 0.12 }, ${n(tPop)});`,
  `tl.fromTo("#riis-f", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1.0, duration: 0.14, immediateRender: false }, ${n(tPop)});`,
  `tl.to("#riis-f", { scale: 1.05, duration: ${n(tRfin - tPop - 0.14)}, ease: "none" }, ${n(tPop + 0.14)});`,
  `tl.fromTo("#riis-c", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1.1, duration: 0.25, ease: "power3.out", immediateRender: false }, ${n(tPop)});`,
  `tl.to("#riis-c", { scale: 1.19, x: -14, duration: ${n(tRfin - tPop - 0.25)}, ease: "none" }, ${n(tPop + 0.25)});`);
neon('#riis-luz', tPop + 0.04); traza('#riis-aro path', tPop + 0.1, 0.6); suena('garabato', tPop + 0.08, { modo: 'ini' });
destello(tPop, 0.14); sacudida(tPop, 0.6); suena('boom', tPop + 0.02, { db: -4 }); suena('diapositiva', tA + 0.02);
aparece('#nombre', T(W.jacob) - 0.02, { dur: 0.3, escala: 1.1 });
seVa('#nombre', tRfin, 0.08);
// (b) "En 1870": el año en grande
aparece('#anio', T(W.anio) - 0.04, { dur: 0.3, escala: 1.14, borroso: 16 }); suena('boom', T(W.anio), { db: -4 }); sacudida(T(W.anio), 0.6);
seVa('#anio', T(W.sin) - 0.06, 0.12);
// (c) la estación: la foto real que tomó el propio Riis en uno de esos dormitorios, en una tarjeta
pasos.push(`tl.fromTo("#ficha", { opacity: 0, scale: 1.25, rotation: 6, y: 60 }, { opacity: 1, scale: 1, rotation: -2.5, y: 0, duration: 0.3, ease: "back.out(1.5)", immediateRender: false }, ${n(T(W.estacion) - 0.05)});`,
  `tl.to("#ficha", { scale: 1.05, rotation: -1.2, duration: ${n(T(W.yAhi) - T(W.estacion) - 0.4)}, ease: "none" }, ${n(T(W.estacion) + 0.26)});`);
suena('diapositiva', T(W.estacion) - 0.04); aparece('#pie', T(W.estacion) + 0.25, { dur: 0.2 });
seVa('#ficha', T(W.yAhi) - 0.08, 0.08); seVa('#pie', T(W.yAhi) - 0.08, 0.08);
// (d) el perro: en "le mataron" se apaga el farol
suena('boom', T(W.mataron) + 0.12, { db: -5 }); suena('latido', T(W.perro) - 0.05, { db: -2 });
// (e) "Un artículo. Otro. Otro más. Y nada.": tres recortes que caen y se apagan
rejilla(T(W.unArt) - 0.08, tP0);
[[W.unArt, -5], [W.otro1, 4], [W.otro2, -2]].forEach(([k, r], i) => {
  pasos.push(`tl.fromTo("#rec${i + 1}", { opacity: 0, scale: 1.5, rotation: ${r + 9}, y: -90 }, { opacity: 1, scale: 1, rotation: ${r}, y: 0, duration: 0.16, ease: "power3.in", immediateRender: false }, ${n(T(k) - 0.12)});`);
  suena('periodico', T(k) + 0.04, { db: 2 }); suena('golpe', T(k) + 0.04, { db: -3 }); sacudida(T(k) + 0.04, 0.4);
});
pasos.push(`tl.to(".rec", { opacity: 0.2, filter: "brightness(0.5)", duration: 0.3 }, ${n(T(W.nada) - 0.05)});`);
suena('boom', T(W.nada) + 0.05, { db: -3 });
seVa('.rec', tP0, 0.08);
// (f) el picapedrero (video): da el golpe en "piedra"; en "cien golpes" se repite cada vez más cerca y el número corre
fondoClaro(tP0, tPfin);
suena('diapositiva', tP0);
GOLPES_PICA.forEach((g, i) => {
  pasos.push(`tl.set("#chispaV", { left: ${n(g.x - 300)}, top: ${n(g.y - 300)} }, ${n(g.t - 0.02)});`); chispa('#chispaV', g.t);
  suena('mazo', g.t, { db: i === 0 ? 4 : 1 }); suena('golpe', g.t, { db: i === 0 ? 0 : -4 }); sacudida(g.t, i === 0 ? 1 : 0.5);
  if (g.numero !== undefined) { const sig = GOLPES_PICA[i + 1]; pasos.push(`tl.set("#c1-${i}", { autoAlpha: 1 }, ${n(g.t - 0.03)});`, `tl.set("#c1-${i}", { autoAlpha: 0 }, ${n((sig ? sig.t - 0.03 : tNi) - PELO)});`); }
});
suena('boom', GOLPES_PICA[0].t, { db: -2 }); destello(GOLPES_PICA[0].t, 0.1);
// (g) "Al ciento uno, se abría en dos"
suena('latido', T(W.n101) - 0.55); suena('latido', T(W.n101) - 0.27);
pasos.push(`tl.fromTo("#n101", { opacity: 0, scale: 2.0, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.16, ease: "power4.in", immediateRender: false }, ${n(T(W.n101) - 0.12)});`);
suena('mazo', T(W.n101) + 0.03, { db: 4 }); suena('golpe', T(W.n101) + 0.03, { db: 0 }); sacudida(T(W.n101) + 0.04, 0.8);
seVa('#n101', tPfin + 0.02, 0.1);
suena('subida', T(W.abria), { modo: 'fin', db: -1 }); suena('piedra', T(W.abria) + 0.03, { db: -3 }); suena('boom', T(W.abria) + 0.03, { db: -2 }); sacudida(T(W.abria) + 0.04, 1.3); destello(T(W.abria) + 0.02, 0.2);
suena('brillo', T(W.abria) + 0.5, { modo: 'fin', db: 0 });
// (h) "no había sido ese golpe; habían sido todos los de antes": cien rayitas y la ciento uno
rejilla(T(W.yEl) - 0.08, T(W.porEso) - 0.08);
suena('diapositiva', T(W.yEl) - 0.08);
aparece('#palitos', T(W.yEl) - 0.04, { dur: 0.18, escala: 1.03, borroso: 6 }); aparece('#p101', T(W.yEl) + 0.05, { dur: 0.18, escala: 1.4 });
pasos.push(`tl.to("#p101", { opacity: 0.16, boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.25 }, ${n(T(W.ese) - 0.05)});`);
suena('tachar', T(W.ese), { db: 1 });
pasos.push(`tl.to("#palitos .pl", { backgroundColor: "${AMBAR}", boxShadow: "0 0 14px rgba(255,181,71,0.8)", duration: 0.04, stagger: ${n((T(W.antes) - T(W.habian)) / 100)} }, ${n(T(W.habian))});`);
for (let i = 0; i < 5; i++) suena('toque', T(W.habian) + 0.05 + i * (T(W.antes) - T(W.habian)) / 5, { db: -2 });
aparece('#todos', T(W.todos) - 0.04, { dur: 0.3, escala: 1.12 }); suena('boom', T(W.todos) + 0.02, { db: -1 }); sacudida(T(W.todos) + 0.03, 0.8);
for (const s of ['#palitos', '#p101', '#todos']) seVa(s, T(W.porEso) - 0.08, 0.1);
// (i) "en 1896… logró que cerraran": el año; el candado se enciende
aparece('#a1896', T(W.n1896) - 0.04, { dur: 0.3, escala: 1.14, borroso: 16 }); suena('boom', T(W.n1896), { db: -4 }); sacudida(T(W.n1896), 0.6);
seVa('#a1896', T(W.cerraran) - 0.08, 0.12);
suena('boom', T(W.cerraran) + 0.02, { db: -2 }); sacudida(T(W.cerraran) + 0.03, 0.9);
// (i2) "lo contó en un libro": el título del libro de verdad (The Making of an American, 1901)
aparece('#titulo', T(W.anios) + 0.35, { dur: 0.3 }); seVa('#titulo', T(W.yHoy) - 0.08, 0.1);
// (j) el camerino: un cuadro con la frase completa (al acercarse se lee), el nombre del equipo y sus cinco campeonatos
MURO.forEach((_, i) => pasos.push(`tl.fromTo("#mu${i}", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out", immediateRender: false }, ${n(T(W.yHoy) + 0.1 + i * 0.09)});`));
suena('brillo', T(W.pintadas) + 0.3, { modo: 'fin', db: -1 });
aparece('#equipo', T(W.spurs) - 0.05, { dur: 0.3, escala: 1.12 }); suena('boom', T(W.spurs) + 0.02, { db: -3 }); sacudida(T(W.spurs) + 0.03, 0.6);
aparece('#camp', T(W.cinco) - 0.05, { dur: 0.25 }); suena('golpe', T(W.cinco) + 0.02);
seVa('#equipo', AV2.ini, 0.08); seVa('#camp', AV2.ini, 0.08);
// (k) el nombre: "los golpes que no se ven"; siete días marcados en gris que al final se encienden
rejilla(VOCES[2].ini, AV3.ini);
suena('diapositiva', VOCES[2].ini);
aparece('#gnv1', T(W.los) - 0.04, { dur: 0.28, escala: 1.12 }); aparece('#gnv2', T(W.que) - 0.04, { dur: 0.28, escala: 1.12 });
suena('boom', T(W.los) + 0.02, { db: -4 }); suena('golpe', T(W.que));
pasos.push(`tl.fromTo("#dias .dia", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.14, stagger: 0.06, ease: "back.out(2)", immediateRender: false }, ${n(T(W.cumples) - 0.05)});`);
for (let i = 0; i < 4; i++) suena('toque', T(W.cumples) + i * 0.1, { db: -2 });
pasos.push(`tl.to("#dias .dia", { backgroundColor: "${AMBAR}", borderColor: "${AMBAR}", color: "#1a1408", boxShadow: "0 0 26px rgba(255,181,71,0.75)", duration: 0.1, stagger: 0.05 }, ${n(T(W.cuentan) - 0.08)});`);
suena('subida', T(W.cuentan), { modo: 'fin', db: -2 }); suena('boom', T(W.cuentan) + 0.05, { db: -2 }); sacudida(T(W.cuentan) + 0.06, 0.8); destello(T(W.cuentan) + 0.05, 0.1);
for (const s of ['#gnv1', '#gnv2', '#dias']) seVa(s, AV3.ini, 0.08);
// (l) el cierre: la app de verdad llenándose sola y limpia (sin grano ni viñeta); termina en "Tu año" y ahí entra "escribe RACHA".
// Los sonidos de esta parte son graves y suaves (Johnatan: "los efectos cuando muestras Racha son muy chillones… desentonan"):
// nada de toques ni brillos; un llenado grave en cada ventana y golpes sordos cuando la cámara cambia de ventana.
fondoClaro(T_APP);
pasos.push(`tl.set("#grano, .vin", { autoAlpha: 0 }, ${n(T_APP - PELO)});`);
suena('boom', T_APP + 0.02, { db: -5 }); suena('relleno', T_APP + 0.2, { modo: 'ini', db: -2 });
suena('golpe', T_CARA, { db: -6 });
suena('golpe', T_FIN, { db: -5 }); suena('relleno', T_FIN + 0.1, { modo: 'ini', db: -2 });
const T_VIAJE = T_FIN + D_CAL;
suena('boom', T_VIAJE + 0.02, { db: -6 });
[0.05, 1.3, 3.0, 4.8, 6.0].forEach((s) => suena('relleno', T_VIAJE + s, { modo: 'ini', db: -3 }));
[1.0, 2.5, 4.3].forEach((s) => suena('golpe', T_VIAJE + s + 0.1, { db: -8 }));
aparece('#sombra', T_TARJETA, { dur: 0.4, escala: 1, borroso: 0 });
aparece('#esc', T_TARJETA + 0.1, { dur: 0.2 });
aparece('#marca', T_TARJETA + 0.25, { dur: 0.3, escala: 1.18, borroso: 18 });
pasos.push(`tl.to("#marca", { scale: 1.05, duration: ${n(TOTAL - T_TARJETA - 0.7)}, ease: "none" }, ${n(T_TARJETA + 0.55)});`);
aparece('#ytela', T_TARJETA + 0.8, { dur: 0.25 });
suena('boom', T_TARJETA + 0.3, { db: -1 }); sacudida(T_TARJETA + 0.32, 0.6);
// Jhonny: un golpe suave al entrar y en cada corte donde se le quitó una pausa
suena('diapositiva', AV1.ini); suena('diapositiva', AV2.ini); suena('diapositiva', AV3.ini); suena('diapositiva', AV4.ini);
for (const av of AVATAR) av.cortes.forEach((c) => { if (!(av === AV4 && av.ini + c > T_APP && av.ini + c < T_CARA + 0.3)) suena('golpe', av.ini + c, { db: -2 }); });
// la grieta de luz al final del gancho
const tG = AV1.ini + AV1.dura - 0.6;
suena('tachar', tG, { modo: 'ini', db: 3 }); suena('boom', tG + 0.3, { db: -2 }); suena('subida', tG + 0.3, { modo: 'fin', db: -3 });

let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
const saltosGrano = (sel) => Array.from({ length: Math.ceil(TOTAL * 15) }, (_, i) => `tl.set("${sel}", { x: ${-Math.round(azar() * 380)}, y: ${-Math.round(azar() * 380)} }, ${n(i / 15)});`);
pasos.push(...saltosGrano('#grano'));
const CHULO = '<svg viewBox="0 0 24 24" width="50" height="50"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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
        .chispa, #chispaV { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 244, 214, 1) 0, rgba(255, 200, 110, 0.95) 14%, rgba(255, 170, 60, 0.5) 34%, rgba(255, 150, 30, 0) 68%); mix-blend-mode: screen; opacity: 0; }
        #muro { position: absolute; left: 571px; top: 600px; width: 428px; padding: 30px 22px 24px; background: #E9E0C8; border: 9px solid #17120C; box-shadow: 0 0 0 2px #3a2f20, 0 14px 40px rgba(0, 0, 0, 0.7), 0 0 60px rgba(255, 181, 71, 0.25); }
        #muro p { margin: 0; font-family: ${SERIFA}; font-size: 21.5px; line-height: 1.38; letter-spacing: 0; color: rgba(12, 11, 9, 0.9); white-space: nowrap; text-align: center; opacity: 0; }
        #muro .firma { margin-top: 12px; font-style: italic; font-size: 19px; }
        .trazo path { fill: none; stroke: ${CREMA}; stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; filter: drop-shadow(0 0 10px rgba(255, 214, 140, 0.9)) drop-shadow(0 0 26px rgba(255, 181, 71, 0.55)); }
        .vin { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 64% at 50% 54%, transparent 42%, rgba(0, 0, 0, 0.7) 100%), linear-gradient(180deg, rgba(0, 0, 0, 0.62) 0, rgba(0, 0, 0, 0) 560px), linear-gradient(0deg, rgba(0, 0, 0, 0.92) 0, rgba(0, 0, 0, 0) 470px); }
        #destello { position: absolute; inset: 0; background: #FFF3D6; opacity: 0; }
        #grano { position: absolute; left: 0; top: 0; width: 1480px; height: 2320px; background: url("assets/grano.jpg"); mix-blend-mode: overlay; opacity: 0.3; }
        .bl { position: absolute; left: 0; right: 0; top: 300px; display: flex; flex-direction: column; align-items: center; }
        .r, #preg { margin: 0; font-family: "Barlow", sans-serif; font-weight: 600; font-size: 58px; line-height: 1.12; letter-spacing: -0.025em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 3px rgba(255, 236, 200, 0.55), 0 0 18px rgba(255, 200, 120, 0.5), 0 2px 10px rgba(0, 0, 0, 0.9); }
        #preg { position: absolute; left: 0; right: 0; top: 300px; text-align: center; }
        .w { display: inline-block; opacity: 0; }
        .ser { margin: 0; font-family: ${SERIFA}; font-weight: 400; line-height: 1; letter-spacing: -0.02em; color: ${CREMA}; white-space: nowrap; text-shadow: 0 0 6px rgba(255, 236, 200, 0.6), 0 0 34px rgba(255, 190, 100, 0.55), 0 3px 14px rgba(0, 0, 0, 0.9); }
        .amarillo { color: ${AMBAR}; text-shadow: 0 0 8px rgba(255, 200, 110, 0.7), 0 0 44px rgba(255, 181, 71, 0.7), 0 3px 14px rgba(0, 0, 0, 0.9); }
        .centro { position: absolute; left: 0; right: 0; text-align: center; opacity: 0; }
        .chica { font-family: "Barlow", sans-serif; font-weight: 600; letter-spacing: -0.02em; color: ${CREMA}; margin: 0; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95); }
        .cnt { top: 1080px; font-size: 400px; opacity: 0; visibility: hidden; }
        .cnt1 { top: 400px; font-size: 380px; opacity: 0; visibility: hidden; }
        #riis { position: absolute; inset: 0; opacity: 0; visibility: hidden; }
        #riis img { position: absolute; left: 0; top: 190px; width: 100%; height: 100%; display: block; transform-origin: 50% 45%; }
        #riis-n, #riis-f { -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 300px); mask-image: linear-gradient(180deg, transparent 0, #000 300px); }
        #riis-f { filter: blur(14px) brightness(0.36); opacity: 0; }
        #riis-luz { position: absolute; left: 0; top: 190px; width: 100%; height: 100%; background: radial-gradient(ellipse 48% 31% at 52% 39%, rgba(255, 181, 71, 0.8), rgba(255, 181, 71, 0) 100%); mix-blend-mode: screen; opacity: 0; }
        #riis-aro { position: absolute; left: 0; top: 190px; width: 1080px; height: 1920px; overflow: visible; }
        #riis-c { opacity: 0; filter: contrast(1.04) brightness(0.9); }
        #nombre { top: 1420px; font-size: 138px; }
        #anio, #a1896 { top: 452px; font-size: 230px; }
        #ficha { position: absolute; left: 100px; top: 610px; width: 880px; height: 672px; padding: 16px; background: #EDE4CB; box-shadow: 0 0 0 2px #111, 0 0 70px rgba(255, 181, 71, 0.4), 16px 20px 0 rgba(0, 0, 0, 0.6); opacity: 0; }
        #ficha img { width: 100%; height: 100%; object-fit: cover; display: block; }
        #pie { top: 1330px; font-size: 50px; font-style: italic; }
        .rec { position: absolute; width: 640px; height: 400px; padding: 34px 38px; background: #D8CFB6; box-shadow: 0 0 0 2px #111, 14px 18px 0 rgba(0, 0, 0, 0.6); opacity: 0; }
        .rec b { display: block; height: 46px; width: 84%; margin-bottom: 28px; background: #1c1a16; }
        .rec i { display: block; height: 12px; margin-bottom: 21px; background: rgba(28, 26, 22, 0.55); }
        .rec i:nth-of-type(odd) { width: 94%; } .rec i:last-child { width: 58%; }
        #rec1 { left: 110px; top: 560px; } #rec2 { left: 320px; top: 770px; } #rec3 { left: 170px; top: 990px; }
        #n101 { top: 520px; font-size: 470px; }
        #palitos { position: absolute; left: 170px; top: 640px; width: 740px; display: grid; grid-template-columns: repeat(20, 18px); gap: 16px 20px; opacity: 0; }
        .pl { width: 18px; height: 70px; border-radius: 6px; background-color: rgba(244, 231, 195, 0.2); }
        #p101 { position: absolute; left: 524px; top: 1100px; width: 32px; height: 120px; border-radius: 9px; background: ${CREMA}; box-shadow: 0 0 30px rgba(255, 236, 200, 0.9); opacity: 0; }
        #todos { top: 1290px; font-size: 124px; }
        #titulo { top: 1120px; font-size: 62px; font-style: italic; } #titulo small { display: block; font-style: normal; font-size: 130px; margin-top: 12px; }
        #equipo { top: 1108px; font-size: 104px; } #camp { top: 1226px; font-size: 50px; color: ${AMBAR}; }
        #gnv1 { top: 560px; font-size: 156px; } #gnv2 { top: 730px; font-size: 156px; }
        #dias { position: absolute; left: 123px; top: 1040px; display: flex; gap: 20px; }
        .dia { width: 102px; height: 102px; border-radius: 50%; border: 4px solid rgba(244, 231, 195, 0.35); background-color: rgba(0, 0, 0, 0.3); color: rgba(244, 231, 195, 0.45); display: flex; align-items: center; justify-content: center; opacity: 0; }
        #sombra { position: absolute; inset: 0; background: radial-gradient(ellipse 85% 20% at 50% 60%, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0) 100%); opacity: 0; }
        #esc { top: 968px; font-size: 68px; } #ytela { top: 1262px; font-size: 56px; }
        #marca { top: 1030px; font-size: 215px; }
      </style>
      <div id="root" data-composition-id="escena" data-width="1080" data-height="1920">
        <div id="mundo" data-layout-allow-overflow>
          <div id="rejilla" data-layout-allow-overflow></div>
${htmlTomas}
          <div id="riis" data-layout-allow-overflow>
            <img id="riis-n" src="assets/riis.jpg" alt="" />
            <img id="riis-f" src="assets/riis.jpg" alt="" />
            <div id="riis-luz"></div>
            <svg class="trazo" id="riis-aro" viewBox="0 0 1080 1920"><path pathLength="1" d="M 420 330 A 440 440 0 1 1 300 430" /></svg>
            <img id="riis-c" src="assets/riis-corte.png" alt="" />
          </div>
          <div id="chispaV"></div>
          <div class="vin"></div>
${NUMS0.map((num, i) => `          <p class="ser centro cnt${i === NUMS0.length - 1 ? ' amarillo' : ''}" id="c0-${i}">${num}</p>`).join('\n')}
          <p class="ser centro" id="nombre">Jacob Riis</p>
          <p class="ser centro" id="anio">1870</p>
          <div id="ficha" data-layout-allow-overflow><img src="assets/dormitorio.jpg" alt="" /></div>
          <p class="ser centro" id="pie">foto del propio Riis · hacia 1890</p>
          <div class="rec" id="rec1"><b></b><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="rec" id="rec2"><b></b><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="rec" id="rec3"><b></b><i></i><i></i><i></i><i></i><i></i><i></i></div>
${GOLPES_PICA.filter((g) => g.numero !== undefined).map((g) => `          <p class="ser centro cnt1${g.numero === 100 ? ' amarillo' : ''}" id="c1-${GOLPES_PICA.indexOf(g)}">${g.numero}</p>`).join('\n')}
          <p class="ser centro amarillo" id="n101">101</p>
          <div id="palitos">${Array.from({ length: 100 }, () => '<i class="pl"></i>').join('')}</div>
          <div id="p101"></div>
          <p class="ser centro amarillo" id="todos">todos los de antes</p>
          <p class="ser centro" id="a1896">1896</p>
          <p class="ser centro" id="titulo">«The Making of an American»<small>1901</small></p>
          <p class="ser centro" id="equipo">San Antonio Spurs</p>
          <p class="chica centro" id="camp">5 veces campeones de la NBA</p>
          <p class="ser centro" id="gnv1">los golpes</p>
          <p class="ser centro amarillo" id="gnv2">que no se ven</p>
          <div id="dias">${Array.from({ length: 7 }, () => `<div class="dia">${CHULO}</div>`).join('')}</div>
          <div id="sombra"></div>
          <p class="chica centro" id="esc">escribe</p>
          <p class="ser centro amarillo" id="marca">RACHA</p>
          <p class="chica centro" id="ytela">y te la muestro</p>
        </div>
        <p id="preg">¿cumples y no ves cambios?</p>
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

// ---------- 6. el archivo principal: la escena, Jhonny, los videos (picapedrero y app), la grieta, la pastilla y el sonido ----------
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
// En el cierre Jhonny se va un momento (se ve la app) y vuelve
principal.push(`tl.set("#av4-caja", { autoAlpha: 0 }, ${n(T_APP)});`, `tl.set("#av4-caja", { autoAlpha: 1 }, ${n(T_CARA)});`,
  `tl.set(".vin2", { autoAlpha: 0 }, ${n(T_APP)});`, `tl.set(".vin2", { autoAlpha: 1 }, ${n(T_CARA)});`, `tl.set(".vin2", { autoAlpha: 0 }, ${n(T_FIN - PELO)});`);
// La viñeta y el grano de Jhonny solo van mientras él está en pantalla
principal.push(`tl.set(".vin2", { autoAlpha: 0 }, 0);`);
for (const av of AVATAR) principal.push(`tl.set(".vin2", { autoAlpha: 1 }, ${n(av.ini)});`, ...(av === AV4 ? [] : [`tl.set(".vin2", { autoAlpha: 0 }, ${n(av.ini + av.dura - PELO)});`]));
// La grieta: se dibuja de arriba abajo cuando dice "piedra" y por ella entra la luz
const finAv1 = AV1.ini + AV1.dura;
principal.push(
  `tl.fromTo("#grieta path", { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.22, ease: "power2.in", immediateRender: false }, ${n(tG)});`,
  `tl.fromTo("#luzg", { opacity: 0, scaleX: 0.02 }, { opacity: 1, scaleX: 0.12, duration: 0.06, immediateRender: false }, ${n(tG + 0.24)});`,
  `tl.to("#luzg", { scaleX: 4.2, duration: ${n(Math.max(0.12, finAv1 - tG - 0.3))}, ease: "power2.in" }, ${n(tG + 0.3)});`,
  `tl.set("#grieta", { autoAlpha: 0 }, ${n(finAv1 - PELO)});`,
  `tl.to("#luzg", { opacity: 0, duration: 0.3, ease: "power2.out" }, ${n(finAv1)});`);
const htmlAvatar = AVATAR.map((av, i) => `      <div class="avcaja" id="${av.id}-caja" data-layout-allow-overflow>
        <div class="mov">${av.hay ? `<video id="${av.id}" class="clip" src="assets/${av.id}.mp4" playsinline muted data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${10 + i}"></video>` : '<img src="assets/avatar.jpg" alt="" />'}</div>
${Array.from({ length: Math.ceil(av.renglones.length / 2) }, (_, p) => { let k = av.renglones.slice(0, p * 2).join(' ').split(' ').filter(Boolean).length; return `        <div class="sub" id="${av.id}-p${p}">${av.renglones.slice(p * 2, p * 2 + 2).map((r) => `<p>${r.split(' ').map((tx) => `<span id="${av.id}-w${k++}">${tx}</span>`).join(' ')}</p>`).join('')}</div>`; }).join('\n')}
      </div>`).join('\n');
const audioAvatar = AVATAR.filter((av) => av.hay).map((av, i) => `      <audio id="${av.id}-voz" src="assets/${av.id}.wav" data-start="${n(av.ini)}" data-duration="${n(av.dura)}" data-media-start="0" data-track-index="${20 + i}" data-volume="1"></audio>`).join('\n');
const audioVoz = VOCES.map((s, i) => `      <audio id="voz${i + 1}" src="assets/voz${i + 1}.wav" data-start="${n(s.ini + ENTRA_VOZ - 0.06)}" data-duration="${n(pal[s.a].f - pal[s.de].i + 0.28)}" data-media-start="0" data-track-index="${3 + i}" data-volume="1"></audio>`).join('\n');
fs.writeFileSync(path.join(P, 'index.html'), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · campaña · ${NOMBRE} · El golpe 101</title>
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
      #grieta { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; z-index: 6; overflow: visible; }
      #grieta path { fill: none; stroke: #FFE9B8; stroke-width: 11; stroke-linejoin: bevel; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; filter: drop-shadow(0 0 12px rgba(255, 214, 140, 1)) drop-shadow(0 0 40px rgba(255, 181, 71, 0.9)); }
      #luzg { position: absolute; left: 340px; top: -20px; width: 400px; height: 1960px; z-index: 6; background: linear-gradient(90deg, rgba(255, 200, 110, 0), rgba(255, 217, 138, 0.95) 38%, #FFF3D6 50%, rgba(255, 217, 138, 0.95) 62%, rgba(255, 200, 110, 0)); opacity: 0; }
      .vin2 { position: absolute; inset: 0; z-index: 7; pointer-events: none; background: radial-gradient(ellipse 85% 70% at 50% 45%, transparent 50%, rgba(0, 0, 0, 0.55) 100%); }

      #pica, #final { width: 100%; height: 100%; object-fit: cover; }
      #pastilla { position: absolute; left: 0; right: 0; top: 1348px; z-index: 11; display: flex; justify-content: center; opacity: 0; }
      #pastilla span { font-family: "Barlow", sans-serif; font-weight: 600; font-size: 38px; letter-spacing: -0.01em; color: #F4E7C3; background: #0F1113; border: 3px solid #FFB547; border-radius: 999px; padding: 14px 34px 18px; white-space: nowrap; box-shadow: 0 0 34px rgba(255, 181, 71, 0.4); }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${n(TOTAL)}" data-width="1080" data-height="1920">
      <div id="escena" class="clip" style="z-index: 1" data-composition-id="escena" data-composition-src="compositions/escena.html" data-start="0" data-duration="${n(TOTAL)}" data-track-index="0" data-width="1080" data-height="1920"></div>
${htmlAvatar}
      <svg id="grieta" viewBox="0 0 1080 1920"><path pathLength="1" d="M565 -20 L520 170 L604 330 L498 520 L592 705 L508 880 L578 1060 L492 1250 L584 1430 L512 1620 L562 1800 L530 1945" /></svg>
      <div id="luzg"></div>
      <div class="vin2"></div>
      <video id="pica" class="clip" style="z-index: 0" src="assets/pica.mp4" playsinline muted data-start="${n(tP0)}" data-duration="${n(tPfin - tP0)}" data-media-start="0" data-track-index="6"></video>
      <video id="final" class="clip" style="z-index: 0" src="assets/final.mp4" playsinline muted data-start="${n(T_APP)}" data-duration="${n(TOTAL - T_APP)}" data-media-start="0" data-track-index="7"></video>
      <div id="pastilla"><span>Racha · app · $37.900, un solo pago</span></div>
${audioVoz}
${audioAvatar}
      <audio id="efectos" src="assets/efectos.wav" data-start="0" data-duration="${n(TOTAL)}" data-media-start="0" data-track-index="9" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${principal.join('\n      ')}
      tl.fromTo("#pastilla", { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.6)", immediateRender: false }, ${n(T_TARJETA + 1.2)});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`, 'utf8');

fs.writeFileSync(path.join(BASE_DIR, 'audio.json'), JSON.stringify({ total: n(TOTAL), pistas: [...VOCES.map((s, i) => ({ archivo: `voz${i + 1}.wav`, en: n(s.ini + ENTRA_VOZ - 0.06) })), ...AVATAR.filter((av) => av.hay).map((av) => ({ archivo: `${av.id}.wav`, en: n(av.ini) })), { archivo: 'efectos.wav', en: 0 }] }, null, 1), 'utf8');
for (const f of ['hyperframes.json', 'package.json', 'meta.json']) {
  const de = path.join(C, 'guion1', 'hyperframes', f);
  if (!fs.existsSync(path.join(P, f)) && fs.existsSync(de)) fs.writeFileSync(path.join(P, f), fs.readFileSync(de, 'utf8').split('campana-guion1').join(`campana-${NOMBRE}`), 'utf8');
}
console.log(`Listo ${NOMBRE}: dura ${TOTAL.toFixed(2)} s · ${sonidos.length} efectos. Jhonny: ${AVATAR.map((av) => `${av.clip} ${av.hay ? 'clip' : 'FOTO QUIETA (falta el clip)'} ${av.ini.toFixed(1)}–${(av.ini + av.dura).toFixed(1)}`).join(' · ')}.`);
console.log(`Riis ${tA.toFixed(1)} · 1870 ${T(W.anio).toFixed(1)} · estación ${T(W.una).toFixed(1)} · perro ${T(W.yAhi).toFixed(1)} · escritorio ${T(W.ya).toFixed(1)} · recortes ${T(W.unArt).toFixed(1)} · picapedrero ${tP0.toFixed(1)} (golpe ${tHit.toFixed(1)}, cien ${tCien.toFixed(1)}, raya ${tNi.toFixed(1)}) · 101 ${T(W.n101).toFixed(1)} · partida ${tPfin.toFixed(1)} · rayitas ${T(W.yEl).toFixed(1)} · escribir ${T(W.porEso).toFixed(1)} · 1896 ${T(W.n1896).toFixed(1)} · libro ${T(W.anios).toFixed(1)} · camerino ${T(W.yHoy).toFixed(1)} · nombre ${T(W.los).toFixed(1)} · cuentan ${T(W.cuentan).toFixed(1)} · app ${T_APP.toFixed(1)} · cara ${T_CARA.toFixed(1)} · fin ${T_FIN.toFixed(1)}.`);
