#!/usr/bin/env bash
# Los efectos de sonido de la campaña, generados con ElevenLabs (pedido de Johnatan, 8 oct de 2026).
# Uso: bash design/herramientas/sonidos-campana.sh [nombre ...]     (sin nombres, genera los que falten)
# Quedan en design/anuncios/campana/sonidos/originales/<nombre>.mp3. Después se preparan con
#   python design/herramientas/sonidos-preparar.py
# que les quita el silencio del comienzo, los empareja de volumen y los deja en sonidos/<nombre>.wav.
# Cada segundo generado gasta créditos de ElevenLabs; por eso no se rehace el que ya existe (bórralo para repetirlo).
cd "$(dirname "$0")/../.." || exit 1
D=design/anuncios/campana/sonidos/originales
mkdir -p "$D"

# nombre | segundos | descripción
LISTA='manejo|1.0|Close-up foley of a hand grabbing and adjusting a smartphone, soft plastic and fabric handling rustle, no voice, no music
whoosh|0.6|Single short fast whoosh, airy swish transition sound, clean and dry, no reverb tail
golpe|1.2|Single deep punchy impact hit, low boom with a short tail, dry, no music
flash|0.7|Single camera flash burst with a quick bright shimmer, short, no voice
pop|0.5|Single short bubbly pop, bright cartoon interface pop, dry
tachar|0.5|Single quick marker pen stroke on paper, short swipe, dry
cuenta|0.7|Fast mechanical counter digits rapidly ticking down, flipping numbers, short, dry
caida|0.8|Single short descending low tone, power down fail sound, dry
cinta|0.7|Short tape rewind scratch, quick record scratch stop, dry
campana|1.2|Single soft bright bell chime, gentle positive notification ding, clean
toque|0.5|Single soft smartphone touchscreen tap, subtle interface click, dry
logro|1.0|Short cheerful success chime with two rising notes, mobile app reward sound, clean
obturador|0.5|Single soft camera shutter click, short and clean, close microphone, no voice
teclado|1.2|Fast typing on a laptop keyboard, soft clicky keys, steady, close microphone, no voice, no music
boom|2.6|Single deep cinematic sub bass impact, huge dark low boom with a long reverb tail, movie trailer hit, no music
subida|2.0|Dark cinematic riser, tension whoosh building up and stopping abruptly at the end, movie trailer, no music
neon|1.2|Neon sign flickering on, electric buzz with two short crackles and a steady hum, close microphone
diapositiva|0.6|Vintage slide projector advancing one slide, single heavy mechanical clunk click, dry, close microphone
garabato|0.9|Marker pen quickly scribbling a circle twice on paper, two fast loops, dry, close microphone
latido|1.2|Two deep slow heartbeat thumps, low and close, dark, dry, no music
brillo|1.8|Soft warm cinematic swell, gentle rising airy shimmer, hopeful, no melody, no voice
mazo|1.3|A heavy steel sledgehammer striking a big granite block once, hard metallic clank on stone with a short ringing tail and small falling debris, close microphone, dry, no music
piedra|3.2|A huge granite boulder cracking and splitting in two, one sharp loud crack followed by a deep heavy rumble and falling stone debris, cinematic, no music
periodico|0.8|A thick folded newspaper slapped down hard on a wooden desk, single papery thud, close microphone, dry, no music
relleno|2.6|Soft low muted mechanical ticking of an old film projector reel running fast, dark and warm, steady rapid dull clicks, no high pitched sounds, no beeps, no music'

echo "$LISTA" | while IFS='|' read -r nombre seg texto; do
  if [ $# -gt 0 ] && ! printf '%s\n' "$@" | grep -qx "$nombre"; then continue; fi
  if [ $# -eq 0 ] && [ -s "$D/$nombre.mp3" ]; then echo "ya está $nombre"; continue; fi
  for intento in 1 2 3 4 5 6; do
    salida=$(INFLUENCIA=${INFLUENCIA:-0.55} node design/herramientas/elevenlabs.mjs efecto "$texto" "$seg" "$D/$nombre.mp3")
    case "$salida" in guardado*) echo "$nombre: $salida"; break ;; *) echo "$nombre, intento $intento: $salida" ;; esac
  done
done
