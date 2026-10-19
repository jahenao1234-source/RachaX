# La música del guion 2 "El efecto ya qué", versión 2 (14 oct de 2026): el final de "Ese martes".
# Hasta que entra la app suena la mezcla aprobada de la versión 1 (guion2/musica/mezcla-arreglada.wav, sin tocar);
# desde la app suenan los pulsos de "Cold Case Resolution" al 1,19 (el sonido del final que le gustó en "El golpe 101"
# y en "Ese martes"), y en la tarjeta "escribe RACHA" el final cálido de esa pista.
# Los tiempos salen de guion2/tiempos-v2.json (lo escribe VERSION=2 node design/herramientas/hf-relato.mjs guion2).
# Uso: python design/herramientas/musica-mezcla-g2-v2.py   (deja guion2/musica/mezcla-v2.wav, del largo del video)
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(AQUI, '..', 'anuncios', 'campana')
G = os.path.join(C, 'guion2')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000

def leer(ruta, filtro=None):
    orden = [FF, '-v', 'error', '-i', ruta] + (['-af', filtro] if filtro else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(orden, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()

def guardar(ruta, x):
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def rms(y): return float(np.sqrt(np.mean(y ** 2)) + 1e-9)

def bordes(x, sube=0.03, baja=0.03):
    x = x.copy(); a, b = int(sube * SR), int(baja * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x

t = json.load(open(os.path.join(G, 'tiempos-v2.json'), encoding='utf8'))
video = np.zeros((int(t['total'] * SR), 2), np.float32)
def poner(x, en, g=1.0):
    a = int(round(en * SR)); o = 0
    if a < 0: o, a = -a, 0
    k = min(len(x) - o, len(video) - a)
    if k > 0: video[a:a + k] += x[o:o + k] * g

# 1. la mezcla aprobada de la versión 1, hasta que entra la app (se apaga en 0,8 s)
vieja = leer(os.path.join(G, 'musica', 'mezcla-arreglada.wav'))
corte = t['app'] + 0.6
poner(bordes(vieja[:int(corte * SR)], 0.0, 0.8), 0)
ref = rms(vieja[int(45 * SR):int(t['app'] * SR)])           # qué tan fuerte iba la música justo antes

# 2. los pulsos de "Cold Case Resolution" (de 40,4 a 53,78 s, cuatro compases), al 1,19, desde la app hasta la tarjeta
NUEVA = os.path.join(C, 'guion10', 'musica', 'cold-case-resolution.wav')
nueva = leer(NUEVA)
R, COMPAS = 1.19, (53.78 - 40.4) / 4
pulsos = leer(NUEVA, f'atrim=40.4:{40.4 + 4 * COMPAS},asetpts=PTS-STARTPTS,atempo={R}')
g = ref / rms(pulsos) * 10 ** (2 / 20)                       # 2 dB más que lo de antes: ya casi no hay voz
vuelta = bordes(pulsos, 0.02, 0.02); largo = len(vuelta) / SR
en = t['app'] - 0.1
primero = True
while en < t['tarjeta'] - 0.5:
    poner(bordes(vuelta, 0.5, 0.02) if primero else vuelta, en, g); en += largo - 0.02; primero = False

# 3. en la tarjeta: los pulsos se van apagando y entra el final cálido de la pista
i = int((t['tarjeta'] - 0.6) * SR)
video[i:] *= (np.linspace(1, 0.15, len(video) - i) ** 1.5)[:, None]
calido = bordes(nueva[int(53.6 * SR):], 0.4, 0.8)
poner(calido, t['tarjeta'] - 0.3, g * 0.9)
fin = int((t['total'] - 0.9) * SR)
video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
pico = float(np.abs(video).max())
if pico > 0.89: video *= 0.89 / pico
guardar(os.path.join(G, 'musica', 'mezcla-v2.wav'), video)
print(f'mezcla de la versión 1 hasta {corte:.2f} s · pulsos al {R} desde {t["app"] - 0.1:.2f} s ({20 * np.log10(g):.1f} dB) · final cálido en {t["tarjeta"] - 0.3:.2f} s · dura {t["total"]:.2f} s · pico {pico:.2f}')
print('energía por segundo:', ' '.join(str(int(round(100 * np.sqrt(np.mean(video[i:i + SR] ** 2))))) for i in range(0, len(video) - SR, SR)))
