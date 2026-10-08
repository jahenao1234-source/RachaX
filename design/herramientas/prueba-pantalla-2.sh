#!/bin/bash
# Segunda prueba del estilo "pantalla grabada sin voz", con las tomas horizontales en 4K del 7 de octubre
# (toma-12, 13, 14, 17, 19 y 21: más oscuras en la cámara, de cerca; salen nítidas y con los colores reales).
# Dos encuadres:  M = pedazo de la pantalla (1536 px de ancho desde x) llenando casi todo el cuadro;
#                 A = la pantalla entera como una franja en la mitad del cuadro.
# Uso: bash design/herramientas/prueba-pantalla-2.sh [video de salida]
FF="C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin"
G="C:/Users/jahen/RachaX/RachaX/design/anuncios/campana/grabaciones"
SAL="${1:-$G/prueba-estilo-pantalla-v3.mp4}"
TMP="$G/tmp-prueba"; mkdir -p "$TMP"
# toma  inicio  duración  encuadre  x
TRAMOS=(
  "12 2.0 1.5 M 300"
  "21 4.0 1.7 M 500"
  "21 12.2 1.6 M 1100"
  "14 3.0 1.5 M 1200"
  "19 9.0 1.7 M 1100"
  "13 0.3 1.6 M 150"
  "13 3.2 1.6 M 1150"
  "13 5.4 1.5 M 700"
  "21 19.2 2.2 M 300"
)
# Corrección suave: estas tomas ya traen el negro casi negro; solo se le baja el resplandor azul.
COLOR="colorbalance=bs=-0.20:bm=-0.14:bh=-0.05:rs=0.04,eq=saturation=0.92:contrast=1.06"
: > "$TMP/lista.txt"
N=0
for t in "${TRAMOS[@]}"; do
  set -- $t
  if [ "$4" = "M" ]; then
    CUADRO="crop=1536:1728:$5:0,scale=1080:1215:flags=lanczos,pad=1080:1920:0:400:black"
  else
    CUADRO="scale=1080:486:flags=lanczos,pad=1080:1920:0:717:black"
  fi
  "$FF/ffmpeg.exe" -v error -y -ss "$2" -t "$3" -i "$G/toma-$1.mp4" -an \
    -vf "fps=30,$COLOR,$CUADRO,setsar=1" \
    -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p "$TMP/t$N.mp4" || { echo "FALLA en el tramo $N"; exit 1; }
  echo "file 't$N.mp4'" >> "$TMP/lista.txt"
  N=$((N+1))
done
FUENTE="C\\:/Windows/Fonts/arialbd.ttf"
"$FF/ffmpeg.exe" -v error -y -f concat -safe 0 -i "$TMP/lista.txt" -an \
  -vf "drawtext=fontfile='$FUENTE':text='No es que seas flojo.':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=210:shadowcolor=black@0.6:shadowx=0:shadowy=2,drawtext=fontfile='$FUENTE':text='Quisiste empezar con todo.':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=286:shadowcolor=black@0.6:shadowx=0:shadowy=2" \
  -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -movflags +faststart "$SAL" && echo "listo: $SAL"
rm -rf "$TMP"
