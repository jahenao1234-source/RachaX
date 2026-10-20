# Arregla el color de una foto de Higgsfield para el estilo Dark: todo en blanco y negro y lo que vino de color
# (la IA suele darlo naranja) pasa al ámbar de Racha (#FFB547). Con "pantalla" busca además la pantalla blanca de un
# celular y escribe sus esquinas en <salida>.json, para poner encima la app de verdad.
# Uso: python design/herramientas/higgsfield-color.py <foto> <salida.png> [color|gris|pantalla]
#   color    = el objeto de color queda ámbar (por defecto)
#   gris     = todo en blanco y negro
#   pantalla = todo en blanco y negro y además mide la pantalla blanca
#   medir    = deja la foto con su color y solo mide la pantalla blanca
import json, sys
import numpy as np
from PIL import Image, ImageFilter

foto, salida = sys.argv[1], sys.argv[2]
modo = sys.argv[3] if len(sys.argv) > 3 else 'color'
im = np.asarray(Image.open(foto).convert('RGB')).astype(np.float32) / 255
lum = im @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
gris = np.repeat(lum[..., None], 3, axis=2)
out = im if modo == 'medir' else gris

if modo == 'color':
    mx, mn = im.max(2), im.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    masc = np.clip((sat - 0.25) / 0.25, 0, 1) * np.clip((mx - 0.08) / 0.1, 0, 1)
    masc = np.asarray(Image.fromarray((masc * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
    ambar = np.array([1.0, 181 / 255, 71 / 255], dtype=np.float32)
    # el objeto toma el ámbar con su propia luz: lo más claro llega al ámbar puro y un poco más allá en los brillos
    ref = np.percentile(lum[masc > 0.5], 90) if (masc > 0.5).any() else 1
    t = np.clip(lum / max(ref, 1e-3), 0, 1.3)[..., None]
    col = np.clip(ambar * np.minimum(t, 1) + (t - 1).clip(0) * 0.6, 0, 1)
    out = gris * (1 - masc[..., None]) + col * masc[..., None]

Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(salida)
print('Listo:', salida)

if modo in ('pantalla', 'medir'):
    # la pantalla es la zona grande casi blanca: se toman sus filas y columnas y se miden los bordes
    blanco = lum > 0.85
    filas, cols = np.where(blanco)
    # se queda con la parte más grande: los puntos cerca de la mediana
    cy, cx = np.median(filas), np.median(cols)
    ok = (abs(filas - cy) < im.shape[0] * 0.25) & (abs(cols - cx) < im.shape[1] * 0.2)
    filas, cols = filas[ok], cols[ok]
    caja = {'x0': int(np.percentile(cols, 0.5)), 'x1': int(np.percentile(cols, 99.5)),
            'y0': int(np.percentile(filas, 0.5)), 'y1': int(np.percentile(filas, 99.5)),
            'ancho_foto': im.shape[1], 'alto_foto': im.shape[0]}
    # inclinación: centro de lo blanco en la franja de arriba y en la de abajo
    alto = caja['y1'] - caja['y0']
    arriba = cols[filas < caja['y0'] + alto * 0.15].mean()
    abajo = cols[filas > caja['y1'] - alto * 0.15].mean()
    caja['giro_grados'] = float(np.degrees(np.arctan2(arriba - abajo, alto * 0.85)))
    json.dump(caja, open(salida.rsplit('.', 1)[0] + '.json', 'w'), indent=1)
    print('Pantalla:', caja)
