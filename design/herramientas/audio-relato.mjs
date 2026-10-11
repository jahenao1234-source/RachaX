// Rehace el sonido de un anuncio del estilo Dark SIN exportar la imagen otra vez: mezcla las pistas que anota el molde
// en <guion>/audio.json (las voces, los clips de Jhonny y assets/efectos.wav) y las pega sobre el video ya exportado.
// Sirve cuando solo cambian los efectos de sonido o su volumen (correr antes el molde con --solo-html).
// Uso: node design/herramientas/audio-relato.mjs <guion10> <video exportado sin música> <salida.mp4>
//      (rutas del video y de la salida relativas a campana/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const C = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'anuncios', 'campana');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const [guion, video, salida] = process.argv.slice(2);
const { total, pistas } = JSON.parse(fs.readFileSync(path.join(C, guion, 'audio.json'), 'utf8'));
const A = path.join(C, guion, 'hyperframes', 'assets');
const entradas = pistas.flatMap((p) => ['-i', path.join(A, p.archivo)]);
const filtros = pistas.map((p, i) => `[${i + 1}:a]aresample=48000,adelay=${Math.round(p.en * 1000)}:all=1[a${i}]`);
const mezcla = `${pistas.map((_, i) => `[a${i}]`).join('')}amix=inputs=${pistas.length}:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:${total},apad=whole_dur=${total}[a]`;
execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', path.join(C, video), ...entradas, '-filter_complex', [...filtros, mezcla].join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(total), path.join(C, salida)], { stdio: 'inherit' });
console.log(`Listo ${salida}: ${pistas.length} pistas de sonido sobre ${video}`);
