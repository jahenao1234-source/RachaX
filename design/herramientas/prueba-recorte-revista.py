# Prueba: una imagen quieta animada como recortes de revista (piezas con borde blanco, sombra, a saltos, sobre papel).
# Uso: python animar.py <obra-1080.png> <salida.mp4> [papel|oscuro]
import sys, subprocess
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
origen, salida = sys.argv[1], sys.argv[2]
FONDO = sys.argv[3] if len(sys.argv) > 3 else 'papel'
W, H, FPS, PASO, M = 1080, 1350, 30, 5, 220          # M: margen alrededor, para que las piezas entren desde afuera
rng = np.random.default_rng(7)
im = Image.open(origen).convert('RGB').filter(ImageFilter.UnsharpMask(2, 60, 2))
a = np.asarray(im, np.float32)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)

def cierra(m, k):
    i = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(k)).filter(ImageFilter.MinFilter(k))
    return np.asarray(i) > 127
def suave(m, radio=5):
    i = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radio))
    return np.asarray(i) > 127
def poligono(puntos):
    i = Image.new('L', (W, H), 0); ImageDraw.Draw(i).polygon(puntos, fill=255)
    return np.asarray(i) > 127

rojo = (r > 70) & (r > g * 1.9) & (r > b * 1.9)
# los dos brazos con su mano, cortados "a tijera" (medidos sobre la imagen)
P_IZQ = [(440, 440), (527, 436), (527, 800), (500, 820), (452, 900), (420, 1000), (402, 1100), (335, 1195), (170, 1155), (148, 1095),
         (212, 995), (298, 895), (382, 800), (368, 700), (352, 625), (360, 556), (392, 536), (390, 476)]
P_DER = [(527, 436), (622, 440), (676, 470), (692, 538), (716, 558), (720, 640), (708, 700), (698, 800), (768, 895), (852, 995),
         (918, 1095), (902, 1155), (762, 1195), (692, 1100), (652, 1000), (606, 900), (562, 820), (527, 800)]
m_izq, m_der = poligono(P_IZQ), poligono(P_DER)
# la mancha roja (la cabeza): todo lo rojo de arriba; debajo de las manos se rellena con la misma textura de más arriba
m_nube = suave(cierra(rojo, 31) & (YY < 798), 4)
nube = a.copy()
tapa = (m_izq | m_der) & (YY > 430)
media = a[rojo & (YY < 430)].mean(axis=0)
arriba = np.roll(a, 330, axis=0); arriba_rojo = np.roll(rojo, 330, axis=0)
relleno = np.where(arriba_rojo[:, :, None], arriba, media)
mezcla = np.asarray(Image.fromarray((tapa * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10)), np.float32)[:, :, None] / 255
nube = nube * (1 - mezcla) + relleno * mezcla
# el cuerpo: hombros y torso en una sola silueta; los huesos rojos que quedan debajo de los brazos se apagan
m_c = (lum > 34) & ~rojo & (YY > 760) & (YY < 1290)
m_c = np.asarray(Image.fromarray((m_c * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(13)).filter(ImageFilter.MaxFilter(13))) > 127      # fuera las motas del fondo
m_c = cierra(m_c, 25)
for y in range(H):
    xs = np.where(m_c[y])[0]
    if len(xs) > 40: m_c[y, xs.min():xs.max() + 1] = True
m_cuerpo = suave(m_c, 6)
cuerpo = a.copy()
quita = np.asarray(Image.fromarray((rojo * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(4)), np.float32)[:, :, None] / 255
cuerpo = cuerpo * (1 - quita) + np.array([20, 20, 28], np.float32) * quita

BLANCO = np.array([247, 244, 236], np.float32)
def pieza(img, mascara, borde=9, sin_borde=None):
    """Capa del tamaño del lienzo ampliado: la figura con su borde blanco de recorte."""
    fig = np.asarray(Image.fromarray((mascara * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.3)), np.float32) / 255
    fuera = Image.fromarray((mascara * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * borde + 1)).filter(ImageFilter.GaussianBlur(1.3))
    fuera = np.asarray(fuera, np.float32) / 255
    if sin_borde is not None: fuera = np.where(sin_borde, fig, fuera)
    rgb = BLANCO * (1 - fig[:, :, None]) + img * fig[:, :, None]
    capa = np.zeros((H + 2 * M, W + 2 * M, 4), np.uint8)
    capa[M:M + H, M:M + W, :3] = np.clip(rgb, 0, 255)
    capa[M:M + H, M:M + W, 3] = np.clip(fuera * 255, 0, 255)
    return Image.fromarray(capa, 'RGBA')

PIEZAS = {
    'cuerpo': dict(capa=pieza(cuerpo, m_cuerpo), eje=(540, 1050)),
    'nube': dict(capa=pieza(nube, m_nube), eje=(526, 400)),
    'izq': dict(capa=pieza(a, m_izq, 5, sin_borde=(XX > 518) & (YY < 815)), eje=(245, 1150)),      # gira en el codo
    'der': dict(capa=pieza(a, m_der, 5, sin_borde=(XX < 536) & (YY < 815)), eje=(832, 1150)),
}

def papel_arrugado():
    h, w, n = H // 8, W // 8, 40
    px, py = rng.random(n) * w, rng.random(n) * h
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = (xx[:, :, None] - px) ** 2 + (yy[:, :, None] - py) ** 2
    orden = np.argsort(d, axis=2)
    cerca, segunda = orden[:, :, 0], orden[:, :, 1]
    gx, gy, base = rng.normal(0, 0.0016, n), rng.normal(0, 0.0016, n), rng.normal(0, 0.016, n)
    cara = base[cerca] + gx[cerca] * (xx - px[cerca]) + gy[cerca] * (yy - py[cerca])
    d1, d2 = np.take_along_axis(d, cerca[:, :, None], 2)[:, :, 0], np.take_along_axis(d, segunda[:, :, None], 2)[:, :, 0]
    borde = np.exp(-((np.sqrt(d2) - np.sqrt(d1)) ** 2) / 1.6)
    luz = 1 + cara + borde * np.where(base[cerca] > base[segunda], 1.0, -1.0) * 0.035
    i = Image.fromarray(np.clip(luz * 200, 0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2.2))
    vin = 1 - 0.16 * (((XX - W / 2) / (W / 2)) ** 2 + ((YY - H / 2) / (H / 2)) ** 2) / 2
    return np.asarray(i, np.float32) / 200 * vin
LUZ = papel_arrugado()
COLOR_FONDO = np.array([228, 223, 211], np.float32) if FONDO == 'papel' else np.array([30, 28, 27], np.float32)

def trama(img, dx, dy, periodo=5.6, fuerza=0.26):
    u, v = (XX + dx + YY + dy) / 1.41421, (XX + dx - YY - dy) / 1.41421
    red = ((np.cos(2 * np.pi * u / periodo) + np.cos(2 * np.pi * v / periodo)) / 4 + 0.5)[:, :, None]
    c = img / 255
    return (c * (1 - fuerza) + (1 / (1 + np.exp(-(c - red) * 7))) * fuerza) * 255

# ---- el movimiento, paso por paso (6 pasos por segundo). Cada pieza: x, y, giro (grados, + = contra el reloj), escala, visible
N = 46
def pista(base, cambios):
    p = [dict(base) for _ in range(N)]
    for k0, lista in cambios:
        for j, v in enumerate(lista):
            if k0 + j < N: p[k0 + j].update(v)
    return p
Q = dict(x=0, y=0, g=0, s=1, ve=1)
def entra(k0, pasos): return [(0, [dict(ve=0)] * k0), (k0, pasos)]
def abre(k0, grados, signo): return (k0, [dict(g=signo * v) for v in grados])
mov = {
    'cuerpo': pista(Q, [(0, [dict(y=560, g=-5), dict(y=70, g=1.5), dict(y=-14, g=-0.5)]),
                        (30, [dict(y=-8), dict(y=-13), dict(y=-13), dict(y=-13), dict(y=-6)])]),
    'nube': pista(Q, entra(3, [dict(y=-700, g=-16), dict(y=-90, g=5), dict(y=16, g=-1.5)]) + [
                        (14, [dict(s=1.03), dict(s=1.07), dict(s=1.1), dict(s=1.1), dict(s=1.05)]),
                        (23, [dict(g=4, y=-14), dict(g=7, y=-22), dict(g=-3, y=-8), dict(g=-6, y=-4), dict(g=-2)]),
                        (30, [dict(s=1.04), dict(s=1.09), dict(s=1.14, g=2), dict(s=1.15, g=-2), dict(s=1.14, g=2), dict(s=1.07)])]),
    'izq': pista(Q, entra(6, [dict(x=-470, y=240, g=24), dict(x=-60, y=30, g=6), dict(x=8, y=-4, g=-1.5)]) + [
                        abre(14, [2, 5, 7.5, 7.5, 4], 1), abre(30, [3, 7, 11, 11.5, 11, 5], 1), abre(39, [-1.5], 1)]),
    'der': pista(Q, entra(7, [dict(x=470, y=240, g=-24), dict(x=60, y=30, g=-6), dict(x=-8, y=-4, g=1.5)]) + [
                        abre(15, [3, 6, 7.5, 6, 2], -1), abre(30, [2, 6, 10, 11.5, 11, 6], -1), abre(39, [-1.5], -1)]),
}

def coloca(nombre, q, tiembla):
    P = PIEZAS[nombre]; capa = P['capa']; ex, ey = P['eje'][0] + M, P['eje'][1] + M
    if q['s'] != 1:
        w2, h2 = int(capa.width * q['s']), int(capa.height * q['s'])
        grande = capa.resize((w2, h2), Image.BICUBIC)
        nx, ny = int(ex * q['s'] - ex), int(ey * q['s'] - ey)
        capa = grande.crop((nx, ny, nx + P['capa'].width, ny + P['capa'].height))
    jx, jy, jg = (rng.uniform(-2.5, 2.5), rng.uniform(-2.5, 2.5), rng.uniform(-0.55, 0.55)) if tiembla else (0, 0, 0)
    return capa.rotate(q['g'] + jg, resample=Image.BICUBIC, center=(ex, ey), translate=(q['x'] + jx, q['y'] + jy))

def cuadro(k):
    dx, dy = (int(v) for v in rng.integers(-3, 4, 2))
    luz = np.roll(LUZ, (dy, dx), (0, 1))[:, :, None]
    lienzo = np.zeros((H + 2 * M, W + 2 * M, 3), np.float32)
    lienzo[M:M + H, M:M + W] = COLOR_FONDO * luz * 0.98
    for nombre in ('cuerpo', 'nube', 'izq', 'der'):
        q = mov[nombre][k]
        if not q['ve']: continue
        capa = np.asarray(coloca(nombre, q, k > 2), np.float32)
        alfa = capa[:, :, 3] / 255
        sombra = Image.fromarray((alfa * 255).astype(np.uint8)).transform(capa.shape[1::-1], Image.AFFINE, (1, 0, -11, 0, 1, -14)).filter(ImageFilter.GaussianBlur(9))
        lienzo *= (1 - 0.42 * np.asarray(sombra, np.float32) / 255)[:, :, None]
        tinta = capa[:, :, :3] * (0.9 + 0.1 * np.pad(luz, ((M, M), (M, M), (0, 0)), constant_values=1))     # el papel arrugado también se nota en el recorte
        lienzo = lienzo * (1 - alfa[:, :, None]) + tinta * alfa[:, :, None]
    f = trama(lienzo[M:M + H, M:M + W], dx, dy)
    f = np.asarray(Image.fromarray(np.clip(f, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32)
    f *= 1 + (rng.random((H, W, 1)).astype(np.float32) - 0.5) * 0.07
    return np.clip(f, 0, 255).astype(np.uint8)

if salida.endswith('.jpg'):          # hoja de cuadros para revisar
    ks = [0, 2, 4, 7, 9, 12, 16, 17, 25, 33, 34, 44]
    hoja = Image.new('RGB', (6 * 360, 2 * 450))
    for i, k in enumerate(ks):
        rng = np.random.default_rng(k)
        hoja.paste(Image.fromarray(cuadro(k)).resize((360, 450), Image.LANCZOS), ((i % 6) * 360, (i // 6) * 450))
    hoja.save(salida, quality=90)
else:
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', salida], stdin=subprocess.PIPE)
    for k in range(N):
        c = cuadro(k).tobytes()
        for _ in range(PASO): p.stdin.write(c)
    p.stdin.close(); p.wait()
    print(salida, N * PASO / FPS, 's')
