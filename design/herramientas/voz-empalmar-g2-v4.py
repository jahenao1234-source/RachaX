# Guion 2 "El efecto ya qué", versión 3 del video (14 oct de 2026): el gancho nuevo.
# El primer Reel perdió a casi todos en el segundo 10 (memoria racha-primer-reel-resultados) y el gancho de las malteadas
# negaba sin prometer y tenía 2,2 s de silencio después de "1975". Johnatan aprobó en el cuadro el gancho nuevo:
# "Si siempre dices «el lunes empiezo», no es por flojo. Es por algo que se descubrió con malteadas y helado.
#  Y al final te digo cómo salir de eso."
# Se genera aparte (ya-que-v4-gancho-juan.mp3, texto en texto-v4-gancho.txt) y reemplaza las palabras 0 a 19 de la voz
# de la versión 2 (ya-que-v3-juan-sin-pausas: "No dices… y helado."). Desde "A un grupo de personas" todo queda igual.
# Uso: python design/herramientas/voz-empalmar-g2-v4.py
#   sale: guion2/voz/ya-que-v4-juan-sin-pausas.mp3 (+ .palabras.json, armado de las dos transcripciones)
import json, subprocess, os, re, sys
import numpy as np

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
AQUI = os.path.dirname(os.path.abspath(__file__))
V = os.path.join(AQUI, '..', 'anuncios', 'campana', 'guion2', 'voz')
SR = 44100
ORIG, NUEVA = os.path.join(V, 'ya-que-v3-juan-sin-pausas'), os.path.join(V, 'ya-que-v4-gancho-juan')
SALIDA = os.path.join(V, 'ya-que-v4-juan-sin-pausas')
DESDE = 20          # "A" (de "A un grupo de personas"): desde aquí sigue la voz aprobada
HUECO = 0.4         # pausa entre "…salir de eso." y "A un grupo"
PAUSAS = {6: 0.4, 10: 0.4, 20: 0.45}   # antes de "no es", "es por algo" y "y al final"; las demás, máximo 0,25 s

def lee(archivo):
    raw = subprocess.run([FF, '-v', 'error', '-i', archivo, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

def lufs(x):
    p = subprocess.run([FF, '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    return float(re.search(r'Integrated loudness:\s+I:\s+(-?[\d.]+) LUFS', p.stderr.decode('utf8', 'ignore')).group(1))

po = json.load(open(ORIG + '.palabras.json', encoding='utf8'))['palabras']
pn = json.load(open(NUEVA + '.palabras.json', encoding='utf8'))['palabras']
assert po[DESDE]['t'] == 'A' and po[DESDE + 2]['t'] == 'grupo', 'la voz original no es la esperada'
assert len(pn) == 29 and pn[0]['t'] == 'Si' and pn[-1]['t'].startswith('eso'), 'el gancho nuevo no es el esperado'

# 1. el gancho nuevo sin pausas largas
tmp = os.path.join(V, '_gancho-sin-pausas.mp3')
subprocess.run([sys.executable, os.path.join(AQUI, 'voz-sin-pausas.py'), NUEVA + '.mp3', NUEVA + '.palabras.json', tmp, '0.25'] + [f'@{k}={s}' for k, s in PAUSAS.items()], check=True)
x_n = lee(tmp)
nuevos, corrido = [], 0.0
for k, w in enumerate(pn):
    if k == 0:
        corrido = w['i'] - min(w['i'], 0.09)
    else:
        hueco = w['i'] - pn[k - 1]['f']
        permitido = PAUSAS.get(k, 0.25)
        if hueco > permitido: corrido += hueco - permitido
    nuevos.append({**w, 'i': round(w['i'] - corrido, 3), 'f': round(w['f'] - corrido, 3)})
fin_gancho = min(len(x_n) / SR, nuevos[-1]['f'] + 0.12)
x_n = x_n[: int(fin_gancho * SR)]

# 2. la voz aprobada desde un poco antes de "A"
x_o = lee(ORIG + '.mp3')
viejo_gancho = x_o[: int(po[DESDE - 1]['f'] * SR)]
x_n = x_n * 10 ** ((lufs(viejo_gancho) - lufs(x_n)) / 20)       # el gancho nuevo al volumen del viejo
ini_resto = max(0.0, po[DESDE]['i'] - 0.06)
resto = x_o[int(ini_resto * SR):]
f = int(0.02 * SR)
x_n[-f:] *= np.linspace(1, 0, f); resto[:f] *= np.linspace(0, 1, f)
silencio = np.zeros(int(max(0.0, HUECO - 0.06 - (fin_gancho - nuevos[-1]['f'])) * SR), np.float32)
junta = np.concatenate([x_n, silencio, resto])
subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', SALIDA + '.mp3'], input=junta.astype(np.float32).tobytes(), check=True)
os.remove(tmp)

corre = (len(x_n) + len(silencio)) / SR - ini_resto            # cuánto se corren las palabras de la voz aprobada
pal = nuevos + [{**w, 'i': round(w['i'] + corre, 3), 'f': round(w['f'] + corre, 3)} for w in po[DESDE:]]
json.dump({'id': 'ya-que-v4-juan-sin-pausas', 'texto': ' '.join(w['t'] for w in pal), 'duracion': round(len(junta) / SR, 2), 'palabras': pal}, open(SALIDA + '.palabras.json', 'w', encoding='utf8'), ensure_ascii=False)
print(f'{SALIDA}.mp3: {len(junta) / SR:.2f} s, {len(pal)} palabras. El gancho dura {nuevos[-1]["f"]:.2f} s; "A un grupo" pasa de {po[DESDE]["i"]:.2f} a {pal[29]["i"]:.2f} s (se corre {corre:+.2f} s).')
print(' '.join(f'{k}:{w["t"]}@{w["i"]:.2f}' for k, w in enumerate(pal[:32])))
