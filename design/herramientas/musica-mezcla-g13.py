# La música del guion 12 "Voy a cambiar": la mezcla que pidió Johnatan a partir del sonido que le gustó en el cierre de
# "El golpe 101" ("me gustó bastante, para el próximo video intentemos hacer una música así"; "recuerda lo de la música,
# que íbamos a hacer una mezcla chévere"). Ese sonido eran los pulsos con ritmo de "Cold Case Resolution" (del segundo
# 40 al 54), acelerados al 1,19 y subidos. Aquí esos pulsos van DURANTE TODO el video, repetidos en compases enteros, y
# encima se montan: el comienzo oscuro de la misma pista (debajo del gancho de Jhonny), los golpes grandes de la mezcla
# del guion 2 en las frases clave, un silencio antes de "ya qué" y el final cálido en la tarjeta.
# Los tiempos salen de guion13/tiempos.json (lo escribe el molde).
# Uso: python design/herramientas/musica-mezcla-g12.py   (deja guion13/musica/mezcla-arreglada.wav, del largo del video)
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(AQUI, '..', 'anuncios', 'campana')
G = os.path.join(C, 'guion13')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000
os.makedirs(os.path.join(G, 'musica'), exist_ok=True)

def leer(ruta, filtro=None):
    orden = [FF, '-v', 'error', '-i', ruta] + (['-af', filtro] if filtro else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(orden, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()

def guardar(ruta, x):
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def rms(y): return float(np.sqrt(np.mean(y ** 2)) + 1e-9)

t = json.load(open(os.path.join(G, 'tiempos.json'), encoding='utf8'))
NUEVA = os.path.join(C, 'guion10', 'musica', 'cold-case-resolution.wav')
nueva = leer(NUEVA)
vieja = leer(os.path.join(C, 'guion2', 'musica', 'mezcla-cruda.wav'))
vieja *= rms(nueva) / rms(vieja)
# "Cold Case Resolution": golpes en 0,4 · 13,75 · 27,1 · 40,4; pulsos de 40,4 a 53,8 (cuatro compases de 3,345 s); final cálido desde 53,75
R = 1.19                                             # la velocidad que le gustó
COMPAS = (53.78 - 40.4) / 4
pulsos = leer(NUEVA, f'atrim={40.4}:{40.4 + 4 * COMPAS},asetpts=PTS-STARTPTS,atempo={R}')
video = np.zeros((int(t['total'] * SR), 2), np.float32)

def poner(x, en, g=1.0):
    a = int(round(en * SR)); o = 0
    if a < 0: o, a = -a, 0
    k = min(len(x) - o, len(video) - a)
    if k > 0: video[a:a + k] += x[o:o + k] * g

def bordes(x, sube=0.03, baja=0.03):
    x = x.copy(); a, b = int(sube * SR), int(baja * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x

# 1. el comienzo oscuro de la pista, debajo del micrófono y del gancho de Jhonny (su golpe del 0,4 cae con el micrófono)
ini = bordes(nueva[:int((t['historia'] + 0.6) * SR)], 0.0, 1.2)
poner(ini, 0, 0.9)
# 2. los pulsos, desde que empieza la historia hasta la tarjeta, en vueltas de cuatro compases
vuelta = bordes(pulsos, 0.02, 0.02); largo = len(vuelta) / SR
en = t['historia'] - 0.15
while en < t['tarjeta'] - 0.5:
    poner(vuelta, en, 1.25); en += largo - 0.02
# 3. los golpes grandes de la mezcla del guion 2 (el de su segundo 26,6), en las frases clave
golpe = bordes(vieja[int(26.4 * SR):int(29.6 * SR)], 0.005, 1.8)
for c in t['claves']: poner(golpe, c - 0.215, 0.9)
# 4. silencio antes de "ya qué", y la música baja un poco mientras habla Jhonny a cámara (va más quieto)
def nivel(de, a, g, rampa=0.25):
    i, j, r = int(de * SR), int(a * SR), int(rampa * SR)
    video[i + r:j - r] *= g
    video[i:i + r] *= np.linspace(1, g, r)[:, None]; video[j - r:j] *= np.linspace(g, 1, r)[:, None]
for de, a in t['callar']: nivel(de - 0.2, a, 0.08, 0.15)
# 5. el final cálido de la pista en la tarjeta; los pulsos se van apagando
i = int((t['tarjeta'] - 0.6) * SR)
video[i:] *= (np.linspace(1, 0.15, len(video) - i) ** 1.5)[:, None]
calido = bordes(nueva[int(53.6 * SR):], 0.4, 0.8)
poner(calido, t['tarjeta'] - 0.3, 1.1)
fin = int((t['total'] - 0.9) * SR)
video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
video *= 0.89 / float(np.abs(video).max())
guardar(os.path.join(G, 'musica', 'mezcla-arreglada.wav'), video)
print(f'pulsos al {R} de su velocidad en vueltas de {largo:.2f} s desde {t["historia"] - 0.15:.1f} · golpes en {t["claves"]} · silencio en {t["callar"]} · final cálido en {t["tarjeta"] - 0.3:.1f}')
print('energía por segundo:', ' '.join(str(int(round(100 * np.sqrt(np.mean(video[i:i + SR] ** 2))))) for i in range(0, len(video) - SR, SR)))
