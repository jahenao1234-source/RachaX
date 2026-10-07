#!/bin/bash
# Monta el ensayo del guion 1 de Xiomara ("la cubeta de huevos"):
# corta y une los 4 clips de Flow, pone los subtítulos, el contador 23 -> 0,
# dos capturas reales de la app y el rótulo del precio.
# Se corre con Git Bash:  bash design/herramientas/montar-xiomara.sh
# Los tiempos salieron de medir las pausas de la voz (silencedetect); si se repite un clip hay que volver a medir.
set -e
FF="/c/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe"
command -v ffmpeg >/dev/null 2>&1 && FF=ffmpeg
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
X="$RAIZ/anuncios/xiomara"
M="$X/montaje"
mkdir -p "$M"
cd "$M"

# Capturas reales de la app (ya existían en el proyecto)
cp "$RAIZ/pdf/imagenes/cap-dia-dificil.png" app-minimo.png
"$FF" -y -v error -i "$RAIZ/anuncios/recursos/app-hoy.png" -vf "crop=1170:680:0:380" app-comodines.png

# Paso 1: cortar los silencios de las puntas y unir
"$FF" -y -v error \
  -ss 0.55 -to 9.70 -i ../clips/A-cubeta.mp4 \
  -ss 0.45 -to 8.70 -i ../clips/B-caminando.mp4 \
  -ss 0.00 -to 8.55 -i ../clips/C-sarten.mp4 \
  -ss 1.25 -to 9.45 -i ../clips/D-mesa.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a]concat=n=4:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset medium -c:a aac -b:a 192k base.mp4

# Paso 2: subtítulos, contador, capturas y rótulo del precio
cat > textos-precio-1.txt <<'EOF'
Racha es una app
EOF
cat > textos-precio-2.txt <<'EOF'
$37.900 · un solo pago
EOF
cat > textos-precio-3.txt <<'EOF'
7 días para probarla
EOF

F="fontfile='C\:/Windows/Fonts/segoeuib.ttf'"
cat > filtro.txt <<EOF
[1:v]scale=600:-2,pad=iw+8:ih+8:4:4:color=0xF5A524[min];
[2:v]scale=600:-2,pad=iw+8:ih+8:4:4:color=0xF5A524[com];
[0:v]drawbox=x=410:y=110:w=270:h=170:color=black@0.78:t=fill:enable='between(t,9.4,13.7)',
drawtext=$F:text='23':fontsize=96:fontcolor=0xF5A524:x=410+(270-text_w)/2:y=122:enable='between(t,9.4,12.35)',
drawtext=$F:text='0':fontsize=96:fontcolor=0xFF7A59:x=410+(270-text_w)/2:y=122:enable='between(t,12.35,13.7)',
drawtext=$F:text='días seguidos':fontsize=30:fontcolor=white:x=410+(270-text_w)/2:y=232:enable='between(t,9.4,13.7)'[v1];
[v1][min]overlay=x=(W-w)/2:y=90:enable='between(t,19.4,22.5)'[v2];
[v2][com]overlay=x=(W-w)/2:y=90:enable='between(t,22.8,25.8)'[v3];
[v3]drawbox=x=40:y=80:w=640:h=230:color=black@0.78:t=fill:enable='gte(t,29.2)',
drawtext=$F:textfile=textos-precio-1.txt:fontsize=44:fontcolor=white:x=(w-text_w)/2:y=104:enable='gte(t,29.2)',
drawtext=$F:textfile=textos-precio-2.txt:fontsize=56:fontcolor=0xF5A524:x=(w-text_w)/2:y=166:enable='gte(t,29.2)',
drawtext=$F:textfile=textos-precio-3.txt:fontsize=36:fontcolor=white:x=(w-text_w)/2:y=246:enable='gte(t,29.2)',
subtitles=subs.ass[v]
EOF

"$FF" -y -v error -i base.mp4 -i app-minimo.png -i app-comodines.png \
  -/filter_complex filtro.txt -map "[v]" -map 0:a \
  -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a copy -movflags +faststart \
  ../ensayo-guion1-v1.mp4

# Hoja de fotos para revisar (una cada 2 segundos)
"$FF" -y -v error -i ../ensayo-guion1-v1.mp4 -vf "fps=1/2,scale=240:-2,tile=9x2" -frames:v 1 ../ensayo-guion1-v1-hoja.jpg
echo "Listo: $X/ensayo-guion1-v1.mp4"
