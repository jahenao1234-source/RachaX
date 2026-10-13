# La transcripción marca tarde el comienzo del año ("1987" hablado dura unos 3 s): se busca por el sonido dónde empieza
# de verdad y se corrige ese dato en una copia del .palabras.json, para que voz-sin-pausas.py no se coma el año.
import json, sys, subprocess
import numpy as np
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
voz, pal, salida = sys.argv[1:4]
J = json.load(open(pal, encoding='utf8')); W = J['palabras']
k = next(i for i, x in enumerate(W) if x['t'].startswith('1987'))
x = np.frombuffer(subprocess.run([FF, '-v', 'error', '-i', voz, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout, dtype=np.float32)
a, b = int(W[k - 1]['f'] * 16000), int(W[k]['f'] * 16000)
n = 320; env = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(a, b - n, n)])
umbral = max(0.012, 0.12 * env.max())
activo = env > umbral
# primer tramo en silencio (0,15 s) después de "Italia" y, desde ahí, el primer sonido
i = 0
while i < len(activo) - 8 and activo[i:i + 8].any(): i += 1
j = i
while j < len(activo) and not activo[j]: j += 1
ini = (a + j * n) / 16000
print(f'{pal}: "1987" marcado en {W[k]["i"]}, empieza de verdad en {ini:.2f} (Italia termina en {W[k-1]["f"]}; silencio desde {(a + i * n) / 16000:.2f})')
W[k]['i'] = round(ini - 0.03, 2)
json.dump(J, open(salida, 'w', encoding='utf8'), ensure_ascii=False)
