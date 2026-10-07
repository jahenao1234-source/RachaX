#!/bin/bash
# Montaje 2 del ensayo del guion 1 de Xiomara ("la cubeta de huevos"), 1080 x 1920.
# Regla: NADA va encima de la presentadora. La app, el contador y el precio son cortes a pantalla completa
# mientras su voz sigue. Los subtítulos van en la zona segura de Reels (no en la cara ni en el 35 % de abajo).
# Antes: capturas-anuncio.cjs (con la app en localhost:3002) y tarjetas-xiomara.cjs.
# Se corre con Git Bash:  bash design/herramientas/montar-xiomara-v2.sh
set -e
FF="/c/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe"
command -v ffmpeg >/dev/null 2>&1 && FF=ffmpeg
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
X="$RAIZ/anuncios/xiomara"
M="$X/montaje"
T="tarjetas"
cd "$M"

# 1. Cortar los silencios de las puntas y unir los 4 clips (720 x 1280)
#    A 0-9.15 · B 9.15-17.40 · C 17.40-25.95 · D 25.95-34.15
"$FF" -y -v error \
  -ss 0.55 -to 9.70 -i ../clips/A-cubeta.mp4 \
  -ss 0.45 -to 8.70 -i ../clips/B-caminando.mp4 \
  -ss 0.00 -to 8.55 -i ../clips/C-sarten.mp4 \
  -ss 1.25 -to 9.45 -i ../clips/D-mesa.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a]concat=n=4:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -r 24 -c:v libx264 -crf 14 -preset medium -c:a aac -b:a 192k base.mp4

# 2. Cortes a pantalla completa: cada tarjeta con un acercamiento lento
corte() { # corte <png> <segundos> <salida>
  "$FF" -y -v error -loop 1 -framerate 24 -i "$T/$1" -t "$2" \
    -vf "scale=2160:3840:flags=lanczos,zoompan=z='1+0.05*on/(24*$2)':x='iw/2-(iw/zoom/2)':y='ih*0.38-(ih/zoom*0.38)':d=1:s=1080x1920:fps=24,format=yuv420p" \
    -c:v libx264 -crf 14 -preset medium "$3"
}
corte app-1-dia-pesado.png 0.70 c-app1.mp4
corte app-2-minimo-hecho.png 1.05 c-app2.mp4
corte app-3-comodines.png 1.75 c-app3.mp4
corte app-4-volviste.png 1.90 c-app4.mp4
corte cierre.png 2.60 c-cierre.mp4

# El contador: se queda en 23, baja de un tirón hasta 0 y se queda en 0
{
  echo "file '$T/contador-23.png'"; echo "duration 0.5"
  for n in $(seq 22 -1 1); do printf "file '%s/contador-%02d.png'\nduration 0.0416667\n" "$T" "$n"; done
  echo "file '$T/contador-00.png'"; echo "duration 0.5"
  echo "file '$T/contador-00.png'"
} > contador.txt
"$FF" -y -v error -f concat -safe 0 -i contador.txt -vf "fps=24,format=yuv420p" -t 1.90 -c:v libx264 -crf 14 c-contador.mp4

# 3. Montaje final
#    Acercamientos a ella en dos frases fuertes (3.55-4.92 y 15.62-17.38).
cat > filtro2.txt <<'EOF'
[0:v]tpad=stop_mode=clone:stop_duration=2.7,scale=1080:1920:flags=lanczos,
zoompan=z='if(between(in_time,3.55,4.92)+between(in_time,15.62,17.38),1.12,1)':x='iw/2-(iw/zoom/2)':y='ih*0.33-(ih/zoom*0.33)':d=1:s=1080x1920:fps=24,
format=yuv420p[b];
[1:v]setpts=PTS-STARTPTS+11.55/TB[k0];
[2:v]setpts=PTS-STARTPTS+20.80/TB[k1];
[3:v]setpts=PTS-STARTPTS+21.50/TB[k2];
[4:v]setpts=PTS-STARTPTS+24.05/TB[k3];
[5:v]setpts=PTS-STARTPTS+26.45/TB[k4];
[6:v]setpts=PTS-STARTPTS+34.20/TB[k5];
[b][k0]overlay=enable='between(t,11.55,13.45)':eof_action=pass[v0];
[v0][k1]overlay=enable='between(t,20.80,21.50)':eof_action=pass[v1];
[v1][k2]overlay=enable='between(t,21.50,22.55)':eof_action=pass[v2];
[v2][k3]overlay=enable='between(t,24.05,25.80)':eof_action=pass[v3];
[v3][k4]overlay=enable='between(t,26.45,28.35)':eof_action=pass[v4];
[v4][k5]overlay=enable='gte(t,34.20)':eof_action=repeat[v5];
[v5]subtitles=subs2.ass,format=yuv420p[v];
[0:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=pad_dur=2.7[a]
EOF
"$FF" -y -v error -i base.mp4 -i c-contador.mp4 -i c-app1.mp4 -i c-app2.mp4 -i c-app3.mp4 -i c-app4.mp4 -i c-cierre.mp4 \
  -/filter_complex filtro2.txt -map "[v]" -map "[a]" -t 36.75 \
  -c:v libx264 -crf 18 -preset medium -r 24 -c:a aac -b:a 192k -movflags +faststart \
  ../ensayo-guion1-v2.mp4

# 4. Hojas de fotos para revisar: una cada segundo
"$FF" -y -v error -i ../ensayo-guion1-v2.mp4 -vf "fps=1,scale=216:-2,tile=10x4" -frames:v 1 ../ensayo-guion1-v2-hoja.jpg
echo "Listo: $X/ensayo-guion1-v2.mp4"
