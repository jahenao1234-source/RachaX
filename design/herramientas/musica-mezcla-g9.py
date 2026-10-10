# Acomoda al guion 9 "El día 22" la mezcla de música que Johnatan aprobó en el guion 2
# (guion2/musica/mezcla-cruda.wav: la base de "Uncovering the Truth" + la percusión de "A Silent Unravelling";
# se hace con musica-mezcla-g2.py). Es provisional: él no ha dicho qué música lleva este anuncio.
# Cómo queda:
# - Parte A (del comienzo de la pista hasta su silencio): entra suave debajo del gancho; su último tramo se apaga
#   justo antes de "fue sesenta y seis".
# - Parte B (lo que viene después del silencio, ya con los golpeteos): su primer golpe cae en el "66".
# - Parte C (el final cálido de la pista, repetido): acompaña el cierre del avatar y la app.
# Uso: python design/herramientas/musica-mezcla-g9.py     (lee guion9/tiempos.json; deja guion9/musica/mezcla-arreglada.wav)
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(AQUI, '..', 'anuncios', 'campana')
G9 = os.path.join(C, 'guion9')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000
os.makedirs(os.path.join(G9, 'musica'), exist_ok=True)

def leer(ruta):
    crudo = subprocess.run([FF, '-v', 'error', '-i', ruta, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).copy()

def guardar(ruta, x):
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def estirar(x, r):
    tmp = os.path.join(G9, 'musica', '_t.wav'); guardar(tmp, x)
    crudo = subprocess.run([FF, '-v', 'error', '-i', tmp, '-af', f'atempo={r}', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    os.remove(tmp)
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).copy()

def rampa(x, de, a, sube):
    i, j = max(0, int(de * SR)), min(len(x), int(a * SR))
    if j > i:
        r = np.linspace(0, 1, j - i) if sube else np.linspace(1, 0, j - i)
        x[i:j] *= (r ** 2)[:, None]
    if sube: x[:i] = 0
    else: x[j:] = 0

t = json.load(open(os.path.join(G9, 'tiempos.json'), encoding='utf8'))
m = leer(os.path.join(C, 'guion2', 'musica', 'mezcla-cruda.wav'))
# Los golpes de la pista (medidos en musica-mezcla-g2.py): 13,26 · 16,68 · 19,94 · 26,62 y, después del silencio, 33,27
G_A, G_B, INI_B = 26.615, 33.265, 32.6
video = np.zeros((int(t['total'] * SR), 2), np.float32)
def poner(x, en):
    a = int(round(en * SR)); o = 0
    if a < 0: o, a = -a, 0
    k = min(len(x) - o, len(video) - a)
    if k > 0: video[a:a + k] += x[o:o + k]

# A: su último golpe grande (26,6 s de la pista) cae cuando sale Londres en grande; se apaga antes del "66"
A = m[:int(32.4 * SR)].copy()
enA = t['londres'] - G_A
rampa(A, 0 - min(0, enA), 0.6 - min(0, enA), True)                    # entra suave
rampa(A, (t['n66'] - 1.2) - enA, (t['n66'] - 0.35) - enA, False)      # silencio antes del "66"
poner(A, enA)
# B: su primer golpe cae en el "66"; un poco más lenta para que llegue hasta el cierre del avatar
B = m[int(INI_B * SR):int(56.0 * SR)].copy()
r = 0.9
B = estirar(B, r)
enB = t['n66'] - (G_B - INI_B) / r
rampa(B, 0, 0.04, True)
finB = t['cierre'] + 1.2
rampa(B, (finB - 1.5) - enB, finB - enB, False)
poner(B, enB)
# C: el final cálido de la pista, otra vez, para el cierre y la app
Cc = estirar(m[int(47.5 * SR):int(56.5 * SR)].copy(), 0.74)        # más lento, para que alcance el final largo con las tomas de la app
enC = t['cierre'] - 0.2
rampa(Cc, 0, 1.2, True)
poner(Cc, enC)
fin = int((t['total'] - 1.3) * SR)
video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
video *= 0.89 / float(np.abs(video).max())
guardar(os.path.join(G9, 'musica', 'mezcla-arreglada.wav'), video)
perfil = ' '.join(str(int(round(100 * np.sqrt(np.mean(video[i:i + SR] ** 2))))) for i in range(0, len(video) - SR, SR))
print(f'A entra en {enA:.2f} s (suena desde {max(0, enA) :.1f}); golpes en {enA + 13.26:.1f}, {enA + 16.68:.1f}, {enA + 19.94:.1f} y {t["londres"]:.1f} (Londres); se calla en {t["n66"] - 0.35:.2f}')
print(f'B: su golpe cae en {t["n66"]:.2f} (el 66); va al {r} de su velocidad y se apaga en {finB:.1f}. C (el final repetido) entra en {enC:.1f} y suena hasta {min(t["total"], enC + len(Cc) / SR):.1f}')
print('energía por segundo:', perfil)
