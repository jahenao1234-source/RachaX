# La música del Reel "POV" (pov1): los pulsos de "Cold Case Resolution" al 1,19 desde el primer cuadro (cada corte cae en
# un golpe) y el final cálido de la pista cuando entra la tarjeta "escribe RACHA". Lee pov1/tiempos.json (lo escribe hf-pov.mjs).
# Uso: [VERSION=2|3|4|5|6|7|8] python design/herramientas/musica-pov.py   (deja pov1/hyperframes/assets/musica.wav, ya al volumen de una pista sin voz)
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(AQUI, '..', 'anuncios', 'campana')
G = os.path.join(C, 'pov1')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000

def leer(ruta, filtro=None):
    orden = [FF, '-v', 'error', '-i', ruta] + (['-af', filtro] if filtro else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(orden, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()

def bordes(x, sube=0.03, baja=0.03):
    x = x.copy(); a, b = int(sube * SR), int(baja * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x

VER = os.environ.get('VERSION', '1'); V2 = VER in ('2', '3', '4', '5', '6', '7', '8', '9')
t = json.load(open(os.path.join(G, f'tiempos-v{VER}.json' if V2 else 'tiempos.json'), encoding='utf8'))
if VER in ('7', '8', '9'):
    # "Midnight Minor" (la generó Johnatan imitando la canción de la referencia): el bajo cae en el segundo 10,53 de la pista;
    # se corre para que caiga justo cuando entra la app (t['caida']); se apaga en el último segundo
    CAE = 10.53
    m = leer(os.path.join(G, 'musica', 'midnight-minor.wav'))
    a = int(round((CAE - t['caida']) * SR)); video = m[a:a + int(t['total'] * SR)].copy()
    fin = int((t['total'] - 1.0) * SR); video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
    video *= 0.5 / float(np.sqrt(np.mean(video ** 2)) * 4); video *= min(1.0, 0.89 / float(np.abs(video).max()))
    with wave.open(os.path.join(G, f'hyperframes-v{VER}', 'assets', 'musica.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(video, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"Midnight Minor desde {CAE - t['caida']:.2f} s: el bajo cae en {t['caida']:.2f} s del video · dura {t['total']:.2f} s"); raise SystemExit
NUEVA = os.path.join(C, 'guion10', 'musica', 'cold-case-resolution.wav')
nueva = leer(NUEVA)
R, COMPAS = 1.19, (53.78 - 40.4) / 4
pulsos = leer(NUEVA, f'atrim=40.4:{40.4 + 4 * COMPAS},asetpts=PTS-STARTPTS,atempo={R}')
video = np.zeros((int(t['total'] * SR), 2), np.float32)
def poner(x, en, g=1.0):
    a = int(round(en * SR)); o = 0
    if a < 0: o, a = -a, 0
    k = min(len(x) - o, len(video) - a)
    if k > 0: video[a:a + k] += x[o:o + k] * g

vuelta = bordes(pulsos, 0.0, 0.02); largo = len(vuelta) / SR
en = 0.0
while en < t['tarjeta'] - 0.5:
    poner(vuelta, en, 1.25); en += largo - 0.02
i = int((t['tarjeta'] - 0.6) * SR)
video[i:] *= (np.linspace(1, 0.15, len(video) - i) ** 1.5)[:, None]
poner(bordes(nueva[int(53.6 * SR):], 0.4, 0.8), t['tarjeta'] - 0.3, 1.2)
fin = int((t['total'] - 0.9) * SR)
video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
video *= 0.5 / float(np.sqrt(np.mean(video ** 2)) * 4)        # nivel parejo; sin voz, la música manda
video *= min(1.0, 0.89 / float(np.abs(video).max()))
with wave.open(os.path.join(G, f'hyperframes-v{VER}' if V2 else 'hyperframes', 'assets', 'musica.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(video, -1, 1) * 32767).astype(np.int16).tobytes())
print(f'pulsos al {R} desde 0 en vueltas de {largo:.2f} s (un golpe = {largo / 16:.4f} s) · final cálido en {t["tarjeta"] - 0.3:.2f} s · dura {t["total"]:.2f} s')
