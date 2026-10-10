# Acomoda al guion 10 "El golpe 101" la mezcla de música que Johnatan aprobó en el guion 2
# (guion2/musica/mezcla-cruda.wav; se hace con musica-mezcla-g2.py). Es de prueba: él no ha dicho qué música lleva.
# Cómo queda:
# - El gancho (la piedra y Jhonny) va SIN música.
# - Parte A (del comienzo de la pista hasta su silencio): entra cuando empieza la historia; su último golpe grande
#   cae cuando la piedra se abre en dos, y se apaga para "no había sido ese golpe".
# - Parte B (lo que viene después del silencio, con los golpeteos): su primer golpe cae en "todos los de antes" y
#   sigue hasta el cierre de Jhonny, estirada lo que haga falta.
# - Parte C (el final cálido de la pista): acompaña el cierre y la app.
# Uso: python design/herramientas/musica-mezcla-g10.py   (lee guion10/tiempos.json; deja guion10/musica/mezcla-arreglada.wav)
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(AQUI, '..', 'anuncios', 'campana')
G = os.path.join(C, 'guion10')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000
os.makedirs(os.path.join(G, 'musica'), exist_ok=True)

def leer(ruta):
    crudo = subprocess.run([FF, '-v', 'error', '-i', ruta, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).copy()

def guardar(ruta, x):
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def estirar(x, r):
    # r < 1 la hace más lenta (más larga); atempo solo acepta de 0,5 a 2
    tmp = os.path.join(G, 'musica', '_t.wav'); guardar(tmp, x)
    crudo = subprocess.run([FF, '-v', 'error', '-i', tmp, '-af', f'atempo={max(0.5, r):.4f}', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    os.remove(tmp)
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).copy()

def rampa(x, de, a, sube):
    i, j = max(0, int(de * SR)), min(len(x), int(a * SR))
    if j > i:
        r = np.linspace(0, 1, j - i) if sube else np.linspace(1, 0, j - i)
        x[i:j] *= (r ** 2)[:, None]
    if sube: x[:i] = 0
    else: x[j:] = 0

t = json.load(open(os.path.join(G, 'tiempos.json'), encoding='utf8'))
m = leer(os.path.join(C, 'guion2', 'musica', 'mezcla-cruda.wav'))
# Los golpes de la pista (medidos en musica-mezcla-g2.py): 13,26 · 16,68 · 19,94 · 26,62 y, después del silencio, 33,27
G_A, G_B, INI_B = 26.615, 33.265, 32.6
video = np.zeros((int(t['total'] * SR), 2), np.float32)
def poner(x, en):
    a = int(round(en * SR)); o = 0
    if a < 0: o, a = -a, 0
    k = min(len(x) - o, len(video) - a)
    if k > 0: video[a:a + k] += x[o:o + k]

# A: su último golpe grande cae cuando la piedra se abre; entra al empezar la historia y se apaga para la frase que sigue
A = m[:int(32.4 * SR)].copy()
enA = t['golpeA'] - G_A
entra = max(0.0, t['historia'] - 0.3 - enA)
rampa(A, entra, entra + 0.7, True)
rampa(A, (t['callar'] - 0.1) - enA, (t['callar'] + 0.9) - enA, False)
poner(A, enA)
# B: su primer golpe cae en "todos los de antes"; va hasta un poco después de que empieza el cierre de Jhonny
B = m[int(INI_B * SR):int(56.0 * SR)].copy()
finB = t['cierre'] + 1.2
r = min(0.92, (len(B) / SR) / (finB - t['golpeB'] + (G_B - INI_B)))
B = estirar(B, r)
enB = t['golpeB'] - (G_B - INI_B) / max(0.5, r)
rampa(B, 0, 0.04, True)
rampa(B, (finB - 1.5) - enB, finB - enB, False)
poner(B, enB)
# C: el final cálido de la pista, para el cierre y la app
Cc = m[int(47.5 * SR):int(56.5 * SR)].copy()
enC = t['cierre'] - 0.2
rc = min(0.9, (len(Cc) / SR) / (t['total'] - enC))
Cc = estirar(Cc, rc)
rampa(Cc, 0, 1.2, True)
poner(Cc, enC)
fin = int((t['total'] - 1.3) * SR)
video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
video *= 0.89 / float(np.abs(video).max())
guardar(os.path.join(G, 'musica', 'mezcla-arreglada.wav'), video)
perfil = ' '.join(str(int(round(100 * np.sqrt(np.mean(video[i:i + SR] ** 2))))) for i in range(0, len(video) - SR, SR))
print(f'A suena desde {enA + entra:.1f} s; sus golpes caen en {enA + 13.26:.1f}, {enA + 16.68:.1f}, {enA + 19.94:.1f} y {t["golpeA"]:.1f} (la piedra se abre); se calla en {t["callar"] + 0.9:.1f}')
print(f'B: su golpe cae en {t["golpeB"]:.2f} ("todos los de antes"); va al {r:.2f} de su velocidad y se apaga en {finB:.1f}. C entra en {enC:.1f} al {rc:.2f} y llega hasta {min(t["total"], enC + len(Cc) / SR):.1f}')
print('energía por segundo:', perfil)
