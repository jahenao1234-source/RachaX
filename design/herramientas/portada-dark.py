# Portada en el look Dark (15 oct de 2026): foto en blanco y negro oscura, con grano, y UN objeto encendido en ámbar con halo.
# Es el mismo concepto de las portadas de "Ese martes" (los tenis) y "Voy a cambiar" (la ventana), que salen de los videos Dark.
# Uso: python design/herramientas/portada-dark.py <foto> <salida.jpg> x0 y0 x1 y1 [oscuro=0.55] [umbral]
#   POLI="x,y x,y …" (variable de entorno, opcional): la forma exacta del objeto en pixeles de la foto original,
#   cuando no es un rectángulo (un papel torcido); el rectángulo sigue sirviendo para centrar el halo.
#   umbral (0 a 1, opcional): dentro del rectángulo solo se enciende lo que es más claro que eso (el papel, no la pared
#   ni las sombras), para que el ámbar siga la forma del objeto cuando no es un rectángulo.
#   x0 y0 x1 y1: el rectángulo del objeto que se enciende, en pixeles de la foto original.
import sys, os
import numpy as np
from PIL import Image, ImageFilter

ent, sal = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = [float(v) for v in sys.argv[3:7]]
OSCURO = float(sys.argv[7]) if len(sys.argv) > 7 else 0.55
UMBRAL = float(sys.argv[8]) if len(sys.argv) > 8 else None
W, H = 1080, 1920
AMBAR = np.array([255, 178, 36], np.float32) / 255

img = Image.open(ent).convert('RGB')
esc = max(W / img.width, H / img.height)
img = img.resize((round(img.width * esc), round(img.height * esc)), Image.LANCZOS)
dx, dy = (img.width - W) // 2, (img.height - H) // 2
img = img.crop((dx, dy, dx + W, dy + H))
x0, x1 = x0 * esc - dx, x1 * esc - dx
y0, y1 = y0 * esc - dy, y1 * esc - dy

g = np.asarray(img.convert('L'), np.float32) / 255
g = np.clip((g - 0.12) / 0.8, 0, 1) ** 1.6 * OSCURO           # blanco y negro, oscuro y con contraste
yy, xx = np.mgrid[0:H, 0:W]
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
vin = np.clip(1 - (((xx - cx) / (W * 0.75)) ** 2 + ((yy - cy) / (H * 0.6)) ** 2), 0.15, 1)
g *= vin                                                          # viñeta que lleva el ojo al objeto

caja = Image.new('L', (W, H), 0)
if os.environ.get('POLI'):
    from PIL import ImageDraw
    pts = [tuple(float(v) for v in par.split(',')) for par in os.environ['POLI'].split()]
    ImageDraw.Draw(caja).polygon([(px * esc - dx, py * esc - dy) for px, py in pts], fill=255)
else:
    caja.paste(255, (int(x0), int(y0), int(x1), int(y1)))
m = np.asarray(caja.filter(ImageFilter.GaussianBlur(4)), np.float32) / 255
def borroso(r):
    a = np.asarray(caja.filter(ImageFilter.GaussianBlur(r)), np.float32) / 255
    return a / a.max()
halo = np.clip(0.75 * borroso(45) + 0.55 * borroso(170), 0, 1.2)

lum = np.asarray(img.convert('L'), np.float32) / 255
if UMBRAL is not None:   # el ámbar sigue la forma del objeto: solo lo claro dentro del rectángulo
    claro = np.clip((lum - UMBRAL) / 0.12, 0, 1)
    claro = np.asarray(Image.fromarray((claro * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
    m = m * claro
centro = np.exp(-(((xx - cx) / (x1 - x0)) ** 2 + ((yy - cy) / (y1 - y0)) ** 2) * 1.6)
obj = ((0.5 if UMBRAL is None else 0.2) + (0.45 if UMBRAL is None else 0.75) * lum + 0.35 * centro)[..., None] * AMBAR       # el objeto en ámbar, más claro al centro, conservando su dibujo
base = np.repeat(g[..., None], 3, 2)
luz = halo[..., None] * AMBAR
base = base * (1 + 3.2 * luz) + 0.6 * luz * halo[..., None]      # la luz cae sobre lo que está cerca (manos, teclado)
base = base * (1 - m[..., None]) + obj * m[..., None]

rng = np.random.default_rng(7)
grano = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
grano = Image.fromarray(((grano * 48) + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.NEAREST).filter(ImageFilter.GaussianBlur(0.7))
grano = np.asarray(grano, np.float32) / 255 - 0.5
base += grano[..., None] * (0.12 + 0.45 * base.mean(2, keepdims=True))   # grano grueso, más visible en lo claro (como las otras portadas)
Image.fromarray((base.clip(0, 1) * 255).astype(np.uint8)).save(sal, quality=93)
print('listo:', sal)
