#!/bin/bash
# Montaje 3 del ensayo del guion 1 de Xiomara ("la cubeta de huevos"), 1080 x 1920.
# Cambios pedidos por Johnatan el 5 oct: un corte menos a la app, comodines más grandes,
# subtítulos del clip 1 cuadrados con la voz (comprobado con la voz a texto), sin acercamiento en el clip 1,
# y efectos de sonido.
# El arranque (A1) es una variable: cuando llegue el clip nuevo del huevo se cambian las 7 líneas de abajo.
# Antes: capturas-anuncio.cjs (con la app en localhost:3002) y tarjetas-xiomara.cjs.
# Se corre con Git Bash:  bash design/herramientas/montar-xiomara-v3.sh [salida.mp4]
set -e
FF="/c/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe"
command -v ffmpeg >/dev/null 2>&1 && FF=ffmpeg
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
X="$RAIZ/anuncios/xiomara"
M="$X/montaje"
T="tarjetas"
SALIDA="${1:-ensayo-guion1-v3.mp4}"
cd "$M"

# ---------- El arranque (clip A1): archivo, desde, hasta, y cuándo dice cada frase (segundos del clip) ----------
A1="${A1:-../clips/A-cubeta.mp4}"
A1_INI="${A1_INI:-0.55}"; A1_FIN="${A1_FIN:-7.30}"
L1_INI="${L1_INI:-4.13}"; L1_FIN="${L1_FIN:-5.15}"   # "Se te quiebra un huevo..."
L2_INI="${L2_INI:-5.55}"; L2_FIN="${L2_FIN:-7.11}"   # "¿y botas la cubeta entera?"

c() { awk "BEGIN{printf \"%.3f\", $1}"; }            # cuentas con decimales
oA1=0
oA2=$(c "$A1_FIN-$A1_INI")                            # A2: clip A viejo de 7.30 a 9.70 ("Eso es volver a cero por fallar un día")
oB=$(c "$oA2+2.40")                                   # B: de 0.45 a 8.70
oC=$(c "$oB+8.25")                                    # C: de 0.00 a 8.55
oD=$(c "$oC+8.55")                                    # D: de 1.25 a 9.45
FIN=$(c "$oD+8.20")
TOTAL=$(c "$FIN+2.6")
a1() { c "$oA1+$1-$A1_INI"; }; a2() { c "$oA2+$1-7.30"; }; b() { c "$oB+$1-0.45"; }; cc() { c "$oC+$1"; }; d() { c "$oD+$1-1.25"; }

# ---------- 1. Cortar y unir ----------
"$FF" -y -v error \
  -ss "$A1_INI" -to "$A1_FIN" -i "$A1" \
  -ss 7.30 -to 9.70 -i ../clips/A-cubeta.mp4 \
  -ss 0.45 -to 8.70 -i ../clips/B-caminando.mp4 \
  -ss 0.00 -to 8.55 -i ../clips/C-sarten.mp4 \
  -ss 1.25 -to 9.45 -i ../clips/D-mesa.mp4 \
  -filter_complex "[0:v]scale=720:1280,setsar=1,fps=24[a];[1:v]fps=24[b];[2:v]fps=24[c];[3:v]fps=24[d];[4:v]fps=24[e];[a][0:a][b][1:a][c][2:a][d][3:a][e][4:a]concat=n=5:v=1:a=1[v][au]" \
  -map "[v]" -map "[au]" -r 24 -c:v libx264 -crf 14 -preset medium -c:a aac -b:a 192k base3.mp4

# ---------- 2. Cortes a pantalla completa ----------
corte() { # corte <png> <segundos> <salida>
  "$FF" -y -v error -loop 1 -framerate 24 -i "$T/$1" -t "$2" \
    -vf "scale=2160:3840:flags=lanczos,zoompan=z='1+0.05*on/(24*$2)':x='iw/2-(iw/zoom/2)':y='ih*0.38-(ih/zoom*0.38)':d=1:s=1080x1920:fps=24,format=yuv420p" \
    -c:v libx264 -crf 14 -preset medium "$3"
}
corte app-2-minimo-hecho.png 1.60 c-app2.mp4
corte app-3-comodines.png 1.75 c-app3.mp4
corte app-4-volviste.png 1.85 c-app4.mp4
corte cierre.png 2.60 c-cierre.mp4
{
  echo "file '$T/contador-23.png'"; echo "duration 0.5"
  for n in $(seq 22 -1 1); do printf "file '%s/contador-%02d.png'\nduration 0.0416667\n" "$T" "$n"; done
  echo "file '$T/contador-00.png'"; echo "duration 0.5"
  echo "file '$T/contador-00.png'"
} > contador.txt
"$FF" -y -v error -f concat -safe 0 -i contador.txt -vf "fps=24,format=yuv420p" -t 1.90 -c:v libx264 -crf 14 c-contador.mp4

tK0=$(b 3.15)     # contador: "y el contador te devuelve a cero"
tK2=$(cc 3.40)    # mínimo: "Haces lo mínimo y cuenta"
tK3=$(cc 6.60)    # comodines: "Un comodín congela ese día"
tK4=$(d 1.75)     # Volviste: "Y el día que vuelves vale el doble"
tZ1=$(b 6.95); tZ2=$(b 8.20)   # acercamiento en "Ahí es donde botas todo"

# ---------- 3. Efectos de sonido (fabricados; Claude no los puede oír) ----------
mkdir -p sfx
"$FF" -y -v error -f lavfi -i "anoisesrc=color=pink:duration=0.42:amplitude=0.7" -af "highpass=f=600,lowpass=f=7000,afade=t=in:d=0.26:curve=qsin,afade=t=out:st=0.26:d=0.16,volume=0.55" -ar 48000 sfx/whoosh.wav
"$FF" -y -v error -f lavfi -i "sine=frequency=1500:duration=0.92" -af "volume='if(lt(mod(t,0.0416667),0.010),1,0)':eval=frame,afade=t=out:st=0.6:d=0.32,volume=0.5" -ar 48000 sfx/tictac.wav
"$FF" -y -v error -f lavfi -i "sine=frequency=120:duration=0.4" -f lavfi -i "anoisesrc=color=brown:duration=0.12:amplitude=0.8" -filter_complex "[0]afade=t=out:st=0.02:d=0.38:curve=exp[a];[1]lowpass=f=900,afade=t=out:d=0.12[b];[a][b]amix=inputs=2:normalize=0,volume=0.9" -ar 48000 sfx/golpe.wav
"$FF" -y -v error -f lavfi -i "sine=frequency=1318.5:duration=0.7" -f lavfi -i "sine=frequency=1975.5:duration=0.7" -filter_complex "[0][1]amix=inputs=2:normalize=0,afade=t=in:d=0.005,afade=t=out:st=0.03:d=0.67:curve=exp,volume=0.5" -ar 48000 sfx/ding.wav
ms() { awk "BEGIN{printf \"%d\", ($1)*1000}"; }

# ---------- 4. Subtítulos ----------
h() { awk "BEGIN{t=$1; if(t<0)t=0; printf \"%d:%02d:%05.2f\", int(t/3600), int(t/60)%60, t-60*int(t/60)}"; }
P='{\fscx85\fscy85\t(0,90,\fscx100\fscy100)}'; AM='{\c&H24A5F5&}'; BL='{\c&HFFFFFF&}'; CO='{\c&H597AFF&}'
s() { echo "Dialogue: 0,$(h "$1-0.04"),$(h "$2+0.12"),Sub,,0,0,0,,$P$3"; }
{
cat <<'EOF'
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Segoe UI Black,80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,1,7,3,2,60,60,690,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
EOF
s "$(a1 $L1_INI)" "$(a1 $L1_FIN)" "Se te quiebra\\N${AM}un huevo..."
s "$(a1 $L2_INI)" "$(a1 $L2_FIN)" "¿y botas la\\N${AM}cubeta entera?"
s "$(a2 7.47)" "$(a2 8.50)" "Eso es\\N${AM}volver a cero"
s "$(a2 8.60)" "$(a2 9.42)" "por fallar\\N${AM}un día."
s "$(b 0.71)" "$(b 2.97)" "Llevas ${AM}23 días,\\N${BL}fallas uno..."
s "$(b 3.22)" "$(b 4.68)" "y el contador te\\Ndevuelve ${CO}a cero."
s "$(b 5.17)" "$(b 6.61)" "Y con el cero\\Nllega el ${AM}\"ya qué\"."
s "$(b 6.98)" "$(b 8.18)" "Ahí es donde\\N${AM}botas todo."
s "$(cc 0.05)" "$(cc 1.43)" "${AM}Racha${BL} te guarda\\Nla partida."
s "$(cc 2.08)" "$(cc 2.81)" "¿Día pesado?"
s "$(cc 3.44)" "$(cc 4.90)" "Haces ${AM}lo mínimo\\N${BL}y cuenta."
s "$(cc 5.51)" "$(cc 6.35)" "¿No hiciste nada?"
s "$(cc 6.65)" "$(cc 8.16)" "Un ${AM}comodín\\N${BL}congela ese día."
s "$(d 1.57)" "$(d 3.43)" "Y el día que vuelves\\N${AM}vale el doble."
s "$(d 4.51)" "$(d 7.39)" "Racha es una app\\Ny se paga ${AM}una sola vez."
s "$(d 7.91)" "$(d 9.03)" "Escríbenos\\N${AM}aquí abajo."
} > subs3.ass
[ -n "$SUBS" ] && cp "$SUBS" subs3.ass   # subtítulos hechos aparte (subtitulos-xiomara.mjs, con los tiempos de AssemblyAI)

# ---------- 5. Montaje final ----------
cat > filtro3.txt <<EOF
[0:v]tpad=stop_mode=clone:stop_duration=2.7,scale=1080:1920:flags=lanczos,
zoompan=z='if(between(in_time,$tZ1,$tZ2),1.12,1)':x='iw/2-(iw/zoom/2)':y='ih*0.33-(ih/zoom*0.33)':d=1:s=1080x1920:fps=24,
format=yuv420p[b];
[1:v]setpts=PTS-STARTPTS+$tK0/TB[k0];
[2:v]setpts=PTS-STARTPTS+$tK2/TB[k2];
[3:v]setpts=PTS-STARTPTS+$tK3/TB[k3];
[4:v]setpts=PTS-STARTPTS+$tK4/TB[k4];
[5:v]setpts=PTS-STARTPTS+$FIN/TB[k5];
[b][k0]overlay=enable='between(t,$tK0,$tK0+1.90)':eof_action=pass[v0];
[v0][k2]overlay=enable='between(t,$tK2,$tK2+1.60)':eof_action=pass[v2];
[v2][k3]overlay=enable='between(t,$tK3,$tK3+1.75)':eof_action=pass[v3];
[v3][k4]overlay=enable='between(t,$tK4,$tK4+1.85)':eof_action=pass[v4];
[v4][k5]overlay=enable='gte(t,$FIN)':eof_action=repeat[v5];
[v5]subtitles=subs3.ass,format=yuv420p[v];
[0:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=pad_dur=2.7[voz];
[6:a]asplit=5[w0][w2][w3][w4][w5];
[w0]adelay=$(ms "$tK0-0.10"):all=1,volume=0.30[s0];
[w2]adelay=$(ms "$tK2-0.10"):all=1,volume=0.30[s2];
[w3]adelay=$(ms "$tK3-0.10"):all=1,volume=0.30[s3];
[w4]adelay=$(ms "$tK4-0.10"):all=1,volume=0.30[s4];
[w5]adelay=$(ms "$FIN-0.10"):all=1,volume=0.30[s5];
[7:a]adelay=$(ms "$tK0+0.50"):all=1,volume=0.22[s6];
[8:a]adelay=$(ms "$tK0+1.42"):all=1,volume=0.38[s7];
[9:a]adelay=$(ms "$tK2+0.20"):all=1,volume=0.28[s8];
[voz][s0][s2][s3][s4][s5][s6][s7][s8]amix=inputs=9:normalize=0:duration=first,alimiter=limit=0.95[a]
EOF
"$FF" -y -v error -i base3.mp4 -i c-contador.mp4 -i c-app2.mp4 -i c-app3.mp4 -i c-app4.mp4 -i c-cierre.mp4 \
  -i sfx/whoosh.wav -i sfx/tictac.wav -i sfx/golpe.wav -i sfx/ding.wav \
  -/filter_complex filtro3.txt -map "[v]" -map "[a]" -t "$TOTAL" \
  -c:v libx264 -crf 18 -preset medium -r 24 -c:a aac -b:a 192k -movflags +faststart \
  "../$SALIDA"

# ---------- 6. Hoja de fotos (una por segundo) ----------
"$FF" -y -v error -i "../$SALIDA" -vf "fps=1,scale=216:-2,tile=10x4" -frames:v 1 "../${SALIDA%.mp4}-hoja.jpg"
echo "Listo: $X/$SALIDA  (dura $TOTAL s; cortes en $tK0, $tK2, $tK3, $tK4 y cierre en $FIN)"
