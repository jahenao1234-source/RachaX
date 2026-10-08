#!/bin/bash
# BORRADOR del primer anuncio del estilo "pantalla grabada sin voz":
# Luis haciendo cosas (clips de Flow) -> las tomas del computador grabadas por Johnatan -> tarjeta del precio.
# Es un montaje rápido con ffmpeg para aprobar el orden, los cortes, la frase y la música. La versión final va en HyperFrames.
# Uso: bash design/herramientas/anuncio-pantalla-1.sh [video de salida]
FF="C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin"
R="C:/Users/jahen/RachaX/RachaX/design/anuncios/campana"
G="$R/grabaciones"; L="$R/hombre/clips"
CIERRE="$R/guion1/hyperframes/assets/cierre.png"
SAL="${1:-$R/pantalla1/pantalla1-borrador-v2.mp4}"
mkdir -p "$(dirname "$SAL")"
TMP="$R/pantalla1/tmp"; mkdir -p "$TMP"
# La frase de arriba es PROVISIONAL (falta que Johnatan la apruebe).
FRASE1="Hábitos, tareas y foco:"
FRASE2="todo en una sola app."
# La música: "Steady Progress", generada por Johnatan en ElevenLabs (plan Starter, con licencia comercial).
# Medida con  python design/herramientas/ritmo.py : 100 golpes por minuto (un golpe cada 0,6 s), primer golpe en 0,565 s,
# compases de 4 golpes (2,4 s). Por eso cada corte dura 1,2 s (2 golpes) y la música arranca en su primer golpe.
MUSICA="$R/pantalla1/musica/steady-progress.mp4"
MUSICA_DESDE=0.565
CIERRE_DURA=3.0
# tipo  archivo  inicio  duración  [x del recorte]
#   L = clip de Luis a cuadro completo;  P = clip de Luis recortando el 17% de abajo (sale un celular en el piso);
#   M = toma del computador: pedazo de 1536 px de ancho desde x, con negro arriba para la frase.
TRAMOS=(
  "L se-levanta 2.6 1.2"
  "L agua 1.7 1.2"
  "P corre-pies 1.0 1.2"
  "L pesas-piso 3.0 1.2"
  "L escritorio-arriba 0.5 1.2"
  "L abre-portatil 4.6 1.2"
  "M 21 4.0 1.2 500"
  "M 21 12.2 1.2 1100"
  "M 19 9.0 1.2 1100"
  "M 13 0.3 1.2 150"
  "M 13 3.2 1.2 1150"
  "M 21 19.2 1.2 300"
)
COLOR="colorbalance=bs=-0.20:bm=-0.14:bh=-0.05:rs=0.04,eq=saturation=0.92:contrast=1.06"
COD="-c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p -r 30"
: > "$TMP/lista.txt"
N=0
for t in "${TRAMOS[@]}"; do
  set -- $t
  case "$1" in
    L) ENT="$L/$2.mp4"; VF="fps=30,scale=1080:1920:flags=lanczos,setsar=1" ;;
    P) ENT="$L/$2.mp4"; VF="fps=30,crop=596:1060:62:0,scale=1080:1920:flags=lanczos,setsar=1" ;;
    M) ENT="$G/toma-$2.mp4"; VF="fps=30,$COLOR,crop=1536:1728:$5:0,scale=1080:1215:flags=lanczos,pad=1080:1920:0:400:black,setsar=1" ;;
  esac
  # -frames:v fija el número exacto de cuadros (36 = 1,2 s) para que los cortes no se corran del ritmo
  CUADROS=$(awk "BEGIN{printf \"%d\", $4*30+0.5}")
  "$FF/ffmpeg.exe" -v error -y -ss "$3" -i "$ENT" -an -vf "$VF" -frames:v "$CUADROS" $COD "$TMP/t$N.mp4" || { echo "FALLA en el tramo $N ($2)"; exit 1; }
  echo "file 't$N.mp4'" >> "$TMP/lista.txt"
  N=$((N+1))
done
# La frase va en archivos de texto: así las comas, los dos puntos y las tildes no dañan el filtro.
printf "%s" "$FRASE1" > "$TMP/frase1.txt"; printf "%s" "$FRASE2" > "$TMP/frase2.txt"
# Se entra a la carpeta temporal para nombrar esos archivos sin la ruta (los dos puntos de "C:" también dañan el filtro).
FUENTE="C\\:/Windows/Fonts/arialbd.ttf"
TXT="fontfile='$FUENTE':fontcolor=white:fontsize=60:borderw=3:bordercolor=black@0.55:shadowcolor=black@0.6:shadowx=0:shadowy=2"
( cd "$TMP" && "$FF/ffmpeg.exe" -v error -y -f concat -safe 0 -i lista.txt -an \
  -vf "drawtext=$TXT:textfile=frase1.txt:x=(w-text_w)/2:y=205,drawtext=$TXT:textfile=frase2.txt:x=(w-text_w)/2:y=283" \
  $COD cuerpo.mp4 ) || { echo "FALLA al unir"; exit 1; }
# Tarjeta final (la misma del video del guion 1): entra de golpe, en el primer golpe de un compás
CUADROS=$(awk "BEGIN{printf \"%d\", $CIERRE_DURA*30+0.5}")
"$FF/ffmpeg.exe" -v error -y -loop 1 -i "$CIERRE" -an -vf "fps=30,scale=1080:1920,setsar=1" -frames:v "$CUADROS" $COD "$TMP/cierre.mp4" || { echo "FALLA en el cierre"; exit 1; }
printf "file 'cuerpo.mp4'\nfile 'cierre.mp4'\n" > "$TMP/final.txt"
TOTAL=$(awk "BEGIN{printf \"%.3f\", ${#TRAMOS[@]}*1.2+$CIERRE_DURA}")
FUNDIDO=$(awk "BEGIN{printf \"%.3f\", $TOTAL-0.9}")
"$FF/ffmpeg.exe" -v error -y -f concat -safe 0 -i "$TMP/final.txt" -ss "$MUSICA_DESDE" -t "$TOTAL" -i "$MUSICA" \
  -map 0:v -map 1:a -af "afade=t=out:st=$FUNDIDO:d=0.9" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$SAL" && echo "listo: $SAL ($TOTAL s)"
rm -rf "$TMP"
