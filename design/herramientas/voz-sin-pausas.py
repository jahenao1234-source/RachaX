# Le quita las pausas a una voz de ElevenLabs SIN comerse palabras.
# `silenceremove` de ffmpeg se comió el comienzo de palabras suaves ("Y", "Lo"): aquí se corta por la
# transcripción (el .palabras.json de transcribir-assembly.mjs) y se deja un margen a cada lado de cada palabra.
# Uso: python design/herramientas/voz-sin-pausas.py <voz.mp3> <voz.palabras.json> <salida.mp3> [pausa] [palabra=segundos ...]
#   pausa: lo máximo que queda entre dos palabras (por defecto 0.22 s)
#   palabra=segundos: una pausa más larga ANTES de esa palabra (ej. "¿Hace=0.6" deja 0.6 s antes de la pregunta)
import sys, json, subprocess, re, unicodedata
import numpy as np

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 44100
voz, pal, salida = sys.argv[1:4]
extra = [a for a in sys.argv[4:]]
pausa = 0.22
largas = {}
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
for a in extra:
    if '=' in a:
        k, v = a.rsplit('=', 1); largas[norm(k)] = float(v)
    else:
        pausa = float(a)

raw = subprocess.run([FF, '-v', 'error', '-i', voz, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32).copy()
ws = json.load(open(pal, encoding='utf8'))['palabras']
MARGEN = 0.09   # lo que se respeta antes y después de cada palabra aunque la pausa sea más corta
usadas = set()
tramos = []     # (inicio, fin) en segundos que se conservan
ini = max(0.0, ws[0]['i'] - 0.08)
for a, b in zip(ws, ws[1:]):
    hueco = b['i'] - a['f']
    quiero = pausa
    k = norm(b['t'])
    if k in largas and k not in usadas:
        quiero = largas[k]; usadas.add(k)
    if hueco > max(quiero, 2 * MARGEN) + 0.02:
        mitad = max(quiero, 2 * MARGEN) / 2
        tramos.append((ini, a['f'] + mitad))
        ini = b['i'] - mitad
tramos.append((ini, len(x) / SR))   # el último tramo va hasta el final del archivo, completo

F = int(0.006 * SR)
trozos = []
for n, (i, f) in enumerate(tramos):
    t = x[int(i * SR):int(f * SR)].copy()
    if len(t) > 2 * F:
        t[:F] *= np.linspace(0, 1, F)
        if n < len(tramos) - 1: t[-F:] *= np.linspace(1, 0, F)
    trozos.append(t)
# ElevenLabs a veces termina el archivo cuando la última palabra todavía está sonando (pasó con "muestro"):
# ese pedazo no existe y no se puede recuperar. Si el archivo acaba con sonido, se baja suave en vez de cortarse en seco.
C = int(0.16 * SR)
ult = trozos[-1]
if len(ult) > C and np.sqrt(np.mean(ult[-int(0.05 * SR):] ** 2)) > 0.004:
    ult[-C:] *= np.cos(np.linspace(0, np.pi / 2, C)) ** 2
    print('AVISO: la grabación original termina con la última palabra todavía sonando; se suavizó el final')
y = np.concatenate(trozos + [np.zeros(int(0.3 * SR), dtype=np.float32)])
subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-b:a', '160k', salida], input=y.tobytes())
print(f'{salida}: de {len(x) / SR:.1f} s a {len(y) / SR:.1f} s, {len(tramos)} tramos')
