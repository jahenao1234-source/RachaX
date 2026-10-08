#!/bin/bash
# Prueba rápida del estilo "pantalla grabada sin voz" con la grabación del computador hecha por Johnatan.
# Corta 9 tramos, deja la pantalla al centro del cuadro, corrige el azul y pone una frase fija arriba.
# Uso: bash design/herramientas/prueba-pantalla.sh [video de origen] [video de salida]
#   El origen puede ser el original en 4K (computador-1.mp4) o el comprimido (prueba-1.mp4): el recorte se ajusta solo.
# Los tramos están anotados en design/anuncios/campana/grabaciones/tramos.md
FF="C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin"
G="C:/Users/jahen/RachaX/RachaX/design/anuncios/campana/grabaciones"
ORIGEN="${1:-$G/computador-1.mp4}"
SAL="${2:-$G/prueba-estilo-pantalla-v2.mp4}"
TMP="$G/tmp-prueba"; mkdir -p "$TMP"
# inicio duración
TRAMOS=("222.0 1.7" "14.0 1.6" "34.0 1.5" "95.0 1.7" "68.0 1.5" "103.2 1.6" "199.0 1.7" "112.0 1.6" "23.4 2.4")
# Se recorta a 9:16 dejando la pantalla al centro: en un cuadro de 576 de ancho, 576x1024 desde y=110 (se escala al ancho real).
COLOR="colorbalance=bs=-0.35:bm=-0.30:bh=-0.12:rs=0.10:rm=0.08,eq=saturation=0.8:contrast=1.12:brightness=-0.02"
: > "$TMP/lista.txt"
N=0
for t in "${TRAMOS[@]}"; do
  set -- $t
  "$FF/ffmpeg.exe" -v error -y -ss "$1" -t "$2" -i "$ORIGEN" -an \
    -vf "fps=30,crop=iw:iw*16/9:0:iw*110/576,$COLOR,scale=1080:1920:flags=lanczos,setsar=1" \
    -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p "$TMP/t$N.mp4" || { echo "FALLA en el tramo $N"; exit 1; }
  echo "file 't$N.mp4'" >> "$TMP/lista.txt"
  N=$((N+1))
done
FUENTE="C\\:/Windows/Fonts/arialbd.ttf"
"$FF/ffmpeg.exe" -v error -y -f concat -safe 0 -i "$TMP/lista.txt" -an \
  -vf "drawtext=fontfile='$FUENTE':text='No es que seas flojo.':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=300:shadowcolor=black@0.6:shadowx=0:shadowy=2,drawtext=fontfile='$FUENTE':text='Quisiste empezar con todo.':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=376:shadowcolor=black@0.6:shadowx=0:shadowy=2" \
  -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -movflags +faststart "$SAL" && echo "listo: $SAL"
rm -rf "$TMP"
