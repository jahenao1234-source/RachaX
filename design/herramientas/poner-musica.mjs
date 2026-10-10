// Le pone música de fondo a un anuncio ya exportado, sin volver a exportar la imagen (tarda segundos).
// Sirve para ensayar "con música" y "sin música" del mismo video.
// Uso: node design/herramientas/poner-musica.mjs <video.mp4> <musica.wav> <salida.mp4>
//   BAJO=16      cuántos dB queda la música por debajo de la voz (por defecto 16; más alto = más bajita)
//   FASE=0.565   segundo del primer golpe de la música (sale de ritmo.py); la música arranca ahí
//   COMPASES=12  cuántos compases de 4 golpes se repiten si la música es más corta que el video (GOLPE=0.6 s por golpe)
//   EMPIEZA=0.55 segundo del video donde entra la música
//   SUBE=0.3     en cuántos segundos sube la música al entrar (2 = entra despacio; 0.05 = entra de golpe)
//   HUECO=31.4:32.4  tramo del video (segundos) donde la música baja a un tercio, para que no tape una palabra suave
import { execFileSync, spawnSync } from 'node:child_process';

const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const [video, musica, salida] = process.argv.slice(2);
if (!salida) { console.log('Uso: node design/herramientas/poner-musica.mjs <video.mp4> <musica.wav> <salida.mp4>'); process.exit(1); }
const num = (nombre, defecto) => (process.env[nombre] ? Number(process.env[nombre]) : defecto);
const BAJO = num('BAJO', 16), FASE = num('FASE', 0.565), GOLPE = num('GOLPE', 0.6), COMPASES = num('COMPASES', 12), EMPIEZA = num('EMPIEZA', 0.55), SUBE = num('SUBE', 0.3);

// Qué tan fuerte suena cada cosa (medida estándar, LUFS) y cuánto dura el video
const medir = (archivo) => { const r = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', archivo, '-vn', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; return { lufs: Number(r.match(/Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS/)[1]), dura: r.match(/Duration: (\d+):(\d+):([\d.]+)/).slice(1).reduce((s, v) => s * 60 + Number(v), 0) }; };
const v = medir(video), m = medir(musica);
const ganancia = v.lufs - BAJO - m.lufs;
const vuelta = COMPASES * 4 * GOLPE;
const filtro = [
  `[1:a]aresample=48000,atrim=${FASE}:${FASE + vuelta},asetpts=N/SR/TB,afade=t=in:d=0.004,afade=t=out:st=${(vuelta - 0.006).toFixed(4)}:d=0.006,aloop=loop=-1:size=${Math.round(vuelta * 48000)},atrim=0:${(v.dura - EMPIEZA).toFixed(3)},volume=${ganancia.toFixed(2)}dB,afade=t=in:d=${SUBE},afade=t=out:st=${(v.dura - EMPIEZA - 1.6).toFixed(3)}:d=1.6,adelay=${Math.round(EMPIEZA * 1000)}:all=1${process.env.HUECO ? `,volume='if(between(t,${process.env.HUECO.split(':')[0]},${process.env.HUECO.split(':')[1]}),0.3,1)':eval=frame` : ''}[m]`,
  `[0:a][m]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89[a]`,
].join(';');
execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', video, '-i', musica, '-filter_complex', filtro, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', salida], { stdio: 'inherit' });
console.log(`Listo ${salida}: la voz está en ${v.lufs} LUFS y la música quedó ${BAJO} dB por debajo (se le bajaron ${(-ganancia).toFixed(1)} dB)`);
