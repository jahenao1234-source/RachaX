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
teclado|1.2|Fast typing on a laptop keyboard, soft clicky keys, steady, close microphone, no voice, no music'

echo "$LISTA" | while IFS='|' read -r nombre seg texto; do
  if [ $# -gt 0 ] && ! printf '%s\n' "$@" | grep -qx "$nombre"; then continue; fi
  if [ $# -eq 0 ] && [ -s "$D/$nombre.mp3" ]; then echo "ya está $nombre"; continue; fi
  for intento in 1 2 3 4 5 6; do
    salida=$(INFLUENCIA=${INFLUENCIA:-0.55} node design/herramientas/elevenlabs.mjs efecto "$texto" "$seg" "$D/$nombre.mp3")
    case "$salida" in guardado*) echo "$nombre: $salida"; break ;; *) echo "$nombre, intento $intento: $salida" ;; esac
  done
done
