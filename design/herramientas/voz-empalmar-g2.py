# Guion 2 "El efecto ya qué", versión 2 (14 oct de 2026): el cierre nuevo de la voz.
# Johnatan pidió el final de "Ese martes" sin Jhonny, y escogió que Juan diga "…escribe Racha y te la muestro".
# Se genera aparte la última parte ("Yo lo llevo en Racha… escribe Racha y te la muestro") y se pega en la voz
# aprobada, en la pausa que hay después de "No el lunes: mañana." (palabra 142). Lo de antes queda igual.
# Uso: python design/herramientas/voz-empalmar-g2.py
#   entra: guion2/voz/ya-que-v2-juan-sin-pausas.mp3 (+ .palabras.json) y ya-que-v3-cierre-juan.mp3 (+ .palabras.json)
#   sale:  guion2/voz/ya-que-v3-juan-sin-pausas.mp3 (+ .palabras.json, armado de las dos transcripciones)
import json, subprocess, os, re, sys
import numpy as np

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
AQUI = os.path.dirname(os.path.abspath(__file__))
V = os.path.join(AQUI, '..', 'anuncios', 'campana', 'guion2', 'voz')
SR = 44100
ORIG, NUEVA = os.path.join(V, 'ya-que-v2-juan-sin-pausas'), os.path.join(V, 'ya-que-v3-cierre-juan')
SALIDA = os.path.join(V, 'ya-que-v3-juan-sin-pausas')
CORTE_EN = 143      # "Yo": desde aquí se reemplaza

def lee(archivo):
    raw = subprocess.run([FF, '-v', 'error', '-i', archivo, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

def lufs(x):
    p = subprocess.run([FF, '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    return float(re.search(r'Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS', p.stderr.decode('utf8', 'ignore')).group(1))

po = json.load(open(ORIG + '.palabras.json', encoding='utf8'))['palabras']
pn = json.load(open(NUEVA + '.palabras.json', encoding='utf8'))['palabras']
assert po[CORTE_EN]['t'].lower().startswith('yo') and pn[0]['t'].lower().startswith('yo'), 'las palabras no son las esperadas'

# 1. la parte nueva, sin las pausas largas: se deja el mismo ritmo de la voz aprobada
#    (antes de "Si" 0,27 s y antes de "escribe" 0,35 s, como antes de "Si" y de "te" en la original)
tmp = os.path.join(V, '_cierre-sin-pausas.mp3')
subprocess.run([sys.executable, os.path.join(AQUI, 'voz-sin-pausas.py'), NUEVA + '.mp3', NUEVA + '.palabras.json', tmp, '0.25', '@5=0.23', '@11=0.27', '@16=0.35'], check=True)
x_n = lee(tmp)
# los tiempos de las palabras nuevas después de quitar pausas: se rehacen igual que lo hace voz-sin-pausas.py
#   (cada hueco mayor que la pausa permitida se acorta; el margen de 0,09 s se respeta)
pausas = {5: 0.23, 11: 0.27, 16: 0.35}
nuevos, corrido = [], 0.0
for k, w in enumerate(pn):
    if k == 0:
        corrido = w['i'] - min(w['i'], 0.09)
    else:
        hueco = w['i'] - pn[k - 1]['f']
        permitido = pausas.get(k, 0.25)
        if hueco > permitido: corrido += hueco - permitido
    nuevos.append({**w, 'i': round(w['i'] - corrido, 3), 'f': round(w['f'] - corrido, 3)})

# 2. la original hasta la mitad de la pausa antes de "Yo" (queda la misma pausa de 0,5 s que había)
x_o = lee(ORIG + '.mp3')
fin_manana, ini_yo = po[CORTE_EN - 1]['f'], po[CORTE_EN]['i']
corte = ini_yo - nuevos[0]['i']                     # donde empieza la parte nueva, para que "Yo" caiga donde estaba
antes = x_o[: int(corte * SR)]
# 3. la parte nueva al mismo volumen que el cierre original ("Yo lo llevo… te la muestro")
viejo_cierre = x_o[int(ini_yo * SR):]
x_n = x_n * 10 ** ((lufs(viejo_cierre) - lufs(x_n)) / 20)
f = int(0.02 * SR)
antes[-f:] *= np.linspace(1, 0, f); x_n[:f] *= np.linspace(0, 1, f)
junta = np.concatenate([antes, x_n])
subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', SALIDA + '.mp3'], input=junta.astype(np.float32).tobytes(), check=True)
os.remove(tmp)

pal = po[:CORTE_EN] + [{**w, 'i': round(w['i'] + corte, 3), 'f': round(w['f'] + corte, 3)} for w in nuevos]
json.dump({'id': 'ya-que-v3-juan-sin-pausas', 'texto': ' '.join(w['t'] for w in pal), 'duracion': round(len(junta) / SR, 2), 'palabras': pal}, open(SALIDA + '.palabras.json', 'w', encoding='utf8'), ensure_ascii=False)
print(f'{SALIDA}.mp3: {len(junta) / SR:.2f} s, {len(pal)} palabras; la parte nueva empieza en {corte:.2f} s ("Yo" en {pal[CORTE_EN]["i"]:.2f}).')
print(' '.join(f'{k}:{w["t"]}@{w["i"]:.2f}' for k, w in enumerate(pal) if k >= CORTE_EN))
