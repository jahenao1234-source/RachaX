# El recorrido "por las ventanas" de Racha (pedido de Johnatan, 10 oct): una sola toma continua, en vertical, que baja
# por las tarjetas de Progreso de la versión de escritorio mientras cada una se llena:
#   Tus hábitos (la fuerza de cada uno sube) → Dónde puedes mejorar (suben las barras) → Fuerza de tus hábitos
#   (la gráfica se forma) → Tu año (los cuadritos se llenan desde marzo; la cámara lo recorre y termina ahí).
# Las tarjetas son fotos de la app de verdad (grabar-ventanas.cjs); aquí solo se acomodan y se mueve la cámara.
# Uso: python design/herramientas/ventanas-viaje.py   → campana/app-llenado/viaje.mp4 (1080 × 1920, 30 cuadros por segundo)
import glob, os, subprocess
import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
LL = os.path.join(AQUI, '..', 'anuncios', 'campana', 'app-llenado')
V = os.path.join(LL, 'ventanas')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
W, H, FPS = 1080, 1920, 30
ANCHO = 940                       # ancho de las tarjetas apiladas
ALTO_ANIO = int(os.environ.get('ALTO_ANIO', 450))   # alto de la tarjeta "Tu año" (es muy ancha: se ve su parte derecha, de marzo a hoy)

# Los momentos del recorrido (segundos): [desde, hasta] en que cada tarjeta se llena, y dónde está la cámara
T_HAB, T_MEJ, T_FUE, T_ANIO = (0.0, 1.1), (1.2, 2.6), (2.9, 4.4), (4.7, 7.1)
PARADAS = [(0.0, 'habitos'), (1.0, 'habitos'), (1.6, 'mejorar'), (2.5, 'mejorar'), (3.1, 'fuerza'), (4.3, 'fuerza'), (4.9, 'anio0'), (7.1, 'anio1')]
TARJETA = 7.0                     # aquí entra la tarjeta "escribe RACHA" (la pone el molde)
TOTAL = 9.3

def serie(nombre):
    fs = sorted(glob.glob(os.path.join(V, nombre + '-*.png')))
    if not fs: raise SystemExit('faltan las fotos de ' + nombre + ' (grabar-ventanas.cjs)')
    return fs
S = {n: serie(n) for n in ['habitos', 'mejorar', 'fuerza', 'anio']}
cache = {}
def tarjeta(nombre, i, ancho=None, alto=None):
    k = (nombre, i)
    if k not in cache:
        im = Image.open(S[nombre][i]).convert('RGB')
        if ancho: im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        else: im = im.resize((round(im.width * alto / im.height), alto), Image.LANCZOS)
        if len(cache) > 12: cache.pop(next(iter(cache)))
        cache[k] = im
    return cache[k]

FONDO = Image.open(S['fuerza'][0]).convert('RGB').getpixel((2, 2))
# dónde va cada tarjeta en el lienzo (y de arriba); las alturas se toman de la última foto de cada serie
alto = {n: tarjeta(n, len(S[n]) - 1, ANCHO).height for n in ['habitos', 'mejorar', 'fuerza']}
Y = {'habitos': 200}
Y['mejorar'] = Y['habitos'] + alto['habitos'] + 70
Y['fuerza'] = Y['mejorar'] + alto['mejorar'] + 70
Y['anio'] = Y['fuerza'] + alto['fuerza'] + 380
ancho_anio = tarjeta('anio', len(S['anio']) - 1, alto=ALTO_ANIO).width
X_ANIO = W - 40 - ancho_anio                       # "Tu año" va pegada a la derecha: lo de marzo a hoy queda a la vista
# la cámara: (x, y) de la esquina de arriba a la izquierda de lo que se ve
CAM = {'habitos': (0, Y['habitos'] - 330), 'mejorar': (0, Y['mejorar'] - 300), 'fuerza': (0, Y['fuerza'] - 330),
       'anio0': (-70, Y['anio'] - 430), 'anio1': (0, Y['anio'] - 430)}

def suave(p): p = min(1.0, max(0.0, p)); return p * p * (3 - 2 * p)
def camara(t):
    for (t0, a), (t1, b) in zip(PARADAS, PARADAS[1:]):
        if t <= t1:
            p = suave((t - t0) / (t1 - t0)) if a != b else 0
            if a == 'anio0' and b == 'anio1': p = (t - t0) / (t1 - t0)          # el paneo sobre "Tu año" va parejo
            return (CAM[a][0] + (CAM[b][0] - CAM[a][0]) * p, CAM[a][1] + (CAM[b][1] - CAM[a][1]) * p)
    return CAM[PARADAS[-1][1]]
def paso(nombre, t, tramo):
    p = min(1.0, max(0.0, (t - tramo[0]) / (tramo[1] - tramo[0])))
    return min(len(S[nombre]) - 1, int(round(p * (len(S[nombre]) - 1))))

ff = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', os.path.join(LL, 'viaje.mp4')], stdin=subprocess.PIPE)
for n in range(int(round(TOTAL * FPS))):
    t = n / FPS
    cx, cy = camara(t)
    cuadro = Image.new('RGB', (W, H), FONDO)
    for nombre, tramo in (('habitos', T_HAB), ('mejorar', T_MEJ), ('fuerza', T_FUE)):
        y = Y[nombre] - cy
        if -1400 < y < H: cuadro.paste(tarjeta(nombre, paso(nombre, t, tramo), ANCHO), (round((W - ANCHO) / 2 - cx), round(y)))
    y = Y['anio'] - cy
    if -ALTO_ANIO < y < H: cuadro.paste(tarjeta('anio', paso('anio', t, T_ANIO), alto=ALTO_ANIO), (round(X_ANIO - cx), round(y)))
    ff.stdin.write(cuadro.tobytes())
ff.stdin.close(); ff.wait()
print(f'listo viaje.mp4: {TOTAL} s · la tarjeta entra en {TARJETA} s · "Tu año" queda en pantalla de y={Y["anio"] - CAM["anio1"][1]} a y={Y["anio"] - CAM["anio1"][1] + ALTO_ANIO}')
