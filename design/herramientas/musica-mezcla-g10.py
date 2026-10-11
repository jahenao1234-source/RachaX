# La música del guion 10 "El golpe 101": une la música nueva que generó Johnatan para este video
# (guion10/musica/cold-case-resolution.wav) con la mezcla que aprobó en el guion 2 (guion2/musica/mezcla-cruda.wav).
# Lo pidió así el 10 de octubre: "no se escucha mucho… al principio, luego de que habla Jhonny, comienza tarde… dame el
# prompt para una nueva música para que compongas una versión uniendo la que tenemos, o sea que suene similar".
# Cómo queda (los tiempos salen de guion10/tiempos.json, que escribe el molde):
#   1. NUEVA, desde el segundo 0: su golpe del comienzo cae con los golpes del mazo; acompaña el gancho de Jhonny.
#   2. VIEJA, parte A: entra al empezar la historia; su último golpe grande cae cuando la piedra se abre; se calla
#      para "no había sido ese golpe".
#   3. VIEJA, parte B (con los golpeteos): su primer golpe cae en "todos los de antes"; va a su velocidad (sin estirar).
#   4. NUEVA, desde su golpe del segundo 27: cae en "los golpes que no se ven"; va un 12 % más rápida para que su golpe
#      del segundo 40 caiga cuando entra la app, sus pulsos acompañen el recorrido y su final cálido llegue a la tarjeta.
# Uso: python design/herramientas/musica-mezcla-g10.py   (deja guion10/musica/mezcla-arreglada.wav, del largo del video)
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(AQUI, '..', 'anuncios', 'campana')
G = os.path.join(C, 'guion10')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000

def leer(ruta):
    crudo = subprocess.run([FF, '-v', 'error', '-i', ruta, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).copy()

def guardar(ruta, x):
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def velocidad(x, r):
    # r > 1 la hace más rápida (más corta); atempo acepta de 0,5 a 2
    tmp = os.path.join(G, 'musica', '_t.wav'); guardar(tmp, x)
    crudo = subprocess.run([FF, '-v', 'error', '-i', tmp, '-af', f'atempo={r:.4f}', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    os.remove(tmp)
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).copy()

def rampa(x, de, a, sube):
    i, j = max(0, int(de * SR)), min(len(x), int(a * SR))
    if j > i:
        r = np.linspace(0, 1, j - i) if sube else np.linspace(1, 0, j - i)
        x[i:j] *= (r ** 2)[:, None]
    if sube: x[:i] = 0
    else: x[j:] = 0

def parejo(x, ref):
    # deja una pista al mismo volumen medio que la otra, para que al unirlas no se note el cambio
    rms = lambda y: float(np.sqrt(np.mean(y ** 2)) + 1e-9)
    return x * (rms(ref) / rms(x))

t = json.load(open(os.path.join(G, 'tiempos.json'), encoding='utf8'))
vieja = leer(os.path.join(C, 'guion2', 'musica', 'mezcla-cruda.wav'))
nueva = parejo(leer(os.path.join(G, 'musica', 'cold-case-resolution.wav')), vieja)
# Golpes de la vieja (medidos en musica-mezcla-g2.py): 13,26 · 16,68 · 19,94 · 26,62 y, después de su silencio, 33,27
G_A, G_B, INI_B = 26.615, 33.265, 32.6
# Golpes de la nueva (medidos): 0,4 · 13,75 · 27,1 · 40,4; pulsos de 41,2 a 54,5; final cálido desde 53,75; se acaba en 58
N_27, N_40, N_CALIDO = 27.1, 40.4, 53.75
video = np.zeros((int(t['total'] * SR), 2), np.float32)
def poner(x, en):
    a = int(round(en * SR)); o = 0
    if a < 0: o, a = -a, 0
    k = min(len(x) - o, len(video) - a)
    if k > 0: video[a:a + k] += x[o:o + k]

# 1. la nueva, desde el comienzo, hasta que arranca la historia
I = nueva[:int((t['historia'] + 1.0) * SR)].copy()
rampa(I, t['historia'] - 0.6, t['historia'] + 1.0, False)
poner(I, 0)
# 2. la vieja, parte A
A = vieja[:int(32.4 * SR)].copy()
enA = t['golpeA'] - G_A
entra = max(0.0, t['historia'] - 0.4 - enA)
rampa(A, entra, entra + 0.9, True)
rampa(A, (t['callar'] - 0.1) - enA, (t['callar'] + 0.9) - enA, False)
poner(A, enA)
# 3. la vieja, parte B, a su velocidad; se apaga antes de "los golpes que no se ven"
B = vieja[int(INI_B * SR):int(56.0 * SR)].copy()
enB = t['golpeB'] - (G_B - INI_B)
finB = min(enB + len(B) / SR, t['nombre'] - 0.5)
rampa(B, 0, 0.04, True)
rampa(B, (finB - 1.8) - enB, finB - enB, False)
poner(B, enB)
# 4. la nueva, desde un poco antes de su golpe del segundo 27, más rápida: el golpe del 40 cae cuando entra la app
r = (N_40 - N_27) / max(1.0, t['app'] - t['nombre'])
r = min(1.25, max(0.9, r))
D = velocidad(nueva[int((N_27 - 1.0) * SR):].copy(), r)
enD = t['nombre'] - 1.0 / r
rampa(D, 0, 0.8 / r, True)
poner(D * 1.4, enD)                # un poco más fuerte: sus pulsos son suaves y acompañan el recorrido de la app
fin = int((t['total'] - 1.2) * SR)
video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
video *= 0.89 / float(np.abs(video).max())
os.makedirs(os.path.join(G, 'musica'), exist_ok=True)
guardar(os.path.join(G, 'musica', 'mezcla-arreglada.wav'), video)
perfil = ' '.join(str(int(round(100 * np.sqrt(np.mean(video[i:i + SR] ** 2))))) for i in range(0, len(video) - SR, SR))
print(f'nueva de 0 a {t["historia"] + 1.0:.1f} · vieja A desde {enA + entra:.1f} (golpe en {t["golpeA"]:.1f}, se calla en {t["callar"] + 0.9:.1f}) · vieja B de {t["golpeB"]:.1f} a {finB:.1f}')
print(f'nueva otra vez al {r:.2f} de su velocidad: golpe en {t["nombre"]:.1f} ("los golpes que no se ven"), golpe en {t["nombre"] + (N_40 - N_27) / r:.1f} (la app entra en {t["app"]:.1f}), final cálido desde {t["nombre"] + (N_CALIDO - N_27) / r:.1f}')
print('energía por segundo:', perfil)
