# Prueba del "efecto de papel" de los videos nuevos del creador (referencias/oct13: el elevador y el espejo).
# Lo pidió Johnatan el 13 de octubre de 2026: "tomas con un tipo de filtro raro como de papel… y se mueve diferente".
# Qué se midió en sus videos (referencias/oct13/analisis.md): el video va a 24 cuadros, pero lo ilustrado cambia a
# saltos (unas 6 imágenes por segundo); TODO el cuadro, papel incluido, lleva una trama fina de puntos de periódico y
# se ve un poco blando, como una foto de algo impreso; el papel es gris crema, arrugado; las personas salen
# recortadas de un video de verdad; la letra es de palo seco, gruesa y apretada, y también queda blanda.
# Versión 2 (la 1 "va por ahí, le falta un poco más… y la letra amarilla desentona").
# Hace dos tomas: (A) un video a pantalla completa; (B) la persona recortada sobre papel.
# Uso: python design/herramientas/prueba-papel.py <video A> <recorte B (.webm con transparencia)> <salida.mp4> [letra de la palabra clave: A|B|C|D]
#      Con FOTO=<carpeta> guarda además una foto de cada toma con las cuatro letras de la palabra clave.
import sys, os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
W, H, FPS = 1080, 1920, 24
PASO = 4                       # cada imagen se sostiene 4 cuadros: 6 cambios por segundo, como en sus tomas de papel
TINTA = np.array([24, 22, 21], np.float32) / 255
PAPEL = np.array([228, 223, 211], np.float32) / 255
NARANJA = (226, 88, 26)
video_a, recorte_b, salida = sys.argv[1:4]
LETRA = sys.argv[4] if len(sys.argv) > 4 else 'A'
rng = np.random.default_rng(11)
F = 'C:/Windows/Fonts/'
GORDA, FINA = F + 'arialbd.ttf', F + 'arial.ttf'
CLAVES = {            # letra de la palabra clave: (archivo, tamaño relativo, grosor extra, espacio entre letras, mayúsculas)
    'A': (F + 'arialbd.ttf', 1.00, 1, -7, False),      # la misma letra gruesa, en naranja
    'B': (F + 'ARIALNB.TTF', 1.18, 1, -1, True),       # condensada en mayúsculas (parecida a la de Racha)
    'C': (F + 'BRADHITC.TTF', 1.10, 2, 2, True),       # a mano, delgada, como la del creador
    'D': (F + 'segoesc.ttf', 0.86, 1, 0, False),       # a mano, cursiva
}

def leer(ruta, de, dura, alfa=False):
    pix = 'rgba' if alfa else 'rgb24'
    orden = [FF, '-v', 'error'] + (['-c:v', 'libvpx-vp9'] if alfa else []) + ['-ss', str(de), '-t', str(dura), '-i', ruta,
             '-vf', f'fps={FPS / PASO},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', '-pix_fmt', pix, '-f', 'rawvideo', '-']
    raw = subprocess.run(orden, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W, 4 if alfa else 3)

def papel_arrugado():
    """Luz de un papel arrugado y vuelto a alisar: caras planas con brillo distinto y dobleces. Float (H, W), cerca de 1."""
    h, w, n = H // 8, W // 8, 46
    px, py = rng.random(n) * w, rng.random(n) * h
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = (xx[:, :, None] - px) ** 2 + (yy[:, :, None] - py) ** 2
    orden = np.argsort(d, axis=2)
    cerca, segunda = orden[:, :, 0], orden[:, :, 1]
    gx, gy = rng.normal(0, 0.0016, n), rng.normal(0, 0.0016, n)          # cada cara se inclina hacia un lado
    base = rng.normal(0, 0.016, n)
    cara = base[cerca] + gx[cerca] * (xx - px[cerca]) + gy[cerca] * (yy - py[cerca])
    d1, d2 = np.take_along_axis(d, cerca[:, :, None], 2)[:, :, 0], np.take_along_axis(d, segunda[:, :, None], 2)[:, :, 0]
    borde = np.exp(-((np.sqrt(d2) - np.sqrt(d1)) ** 2) / 1.6)            # 1 justo en el doblez
    signo = np.where(base[cerca] > base[segunda], 1.0, -1.0)
    luz = 1 + cara + borde * signo * 0.035
    im = Image.fromarray(np.clip(luz * 200, 0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2.2))
    luz = np.asarray(im, np.float32) / 200
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    vin = 1 - 0.16 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 2
    return luz * vin

YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
def trama(gris, dx=0, dy=0, periodo=6.2, fuerza=0.42):
    """Trama fina de puntos de periódico, en diagonal, sobre TODO el cuadro."""
    u, v = (XX + dx + YY + dy) / 1.41421, (XX + dx - YY - dy) / 1.41421
    red = (np.cos(2 * np.pi * u / periodo) + np.cos(2 * np.pi * v / periodo)) / 4 + 0.5
    puntos = 1 / (1 + np.exp(-(gris - red) * 7))
    return gris * (1 - fuerza) + puntos * fuerza

def a_color(gris, claro=PAPEL):
    return TINTA + (claro - TINTA) * gris[:, :, None]

def capa_letras(renglones):
    """renglones: (texto, x, y, archivo, tamaño, color RGBA, espacio, grosor). Devuelve una capa transparente."""
    capa = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    for texto, x, y, archivo, tam, color, espacio, grosor in renglones:
        f = ImageFont.truetype(archivo, tam)
        for ch in texto:
            d.text((x, y), ch, font=f, fill=color, stroke_width=grosor, stroke_fill=color)
            x += d.textlength(ch, font=f) + espacio
    return capa

def clave(texto, x, y, tam, letra):
    archivo, rel, grosor, espacio, mayus = CLAVES[letra]
    return (texto.upper() if mayus else texto.lower(), x, y, archivo, int(tam * rel), NARANJA + (255,), espacio, grosor)

def terminar(img, capa, claro_sobre_oscuro=False):
    """Pone las letras, deja todo un poco blando (como impreso) y le suma grano."""
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).convert('RGBA')
    if claro_sobre_oscuro:                                  # letras claras sobre video: un resplandor suave debajo
        im.alpha_composite(capa.filter(ImageFilter.GaussianBlur(9)))
    im.alpha_composite(capa)
    a = np.asarray(im.convert('RGB').filter(ImageFilter.GaussianBlur(0.9)), np.float32) / 255
    a = a * (1 + (rng.random((H, W, 1)).astype(np.float32) - 0.5) * 0.07)
    return (np.clip(a, 0, 1) * 255).astype(np.uint8)

LUZ = papel_arrugado()
cuadros, fotos = [], {}

def toma_a(fr, n, letra):
    g = (fr.astype(np.float32) / 255) @ np.array([0.299, 0.587, 0.114], np.float32)
    g = np.clip((g - 0.05) * 1.2, 0, 1) ** 0.92
    dx, dy = (int(v) for v in rng.integers(-2, 3, 2))
    img = a_color(trama(g * (0.86 + 0.14 * np.roll(LUZ, (dy * 3, dx * 3), (0, 1))), dx, dy), np.array([220, 208, 190], np.float32) / 255)
    r = []
    if n >= 2: r.append(('primero tenías que', 84, 1108, FINA, 58, (246, 240, 228, 255), -2, 0))
    if n >= 6: r.append(('sentirte', 78, 1172, GORDA, 156, (246, 240, 228, 255), -9, 1))
    if n >= 10: r.append(clave('disciplinado', 82, 1352, 132, letra))
    return terminar(img, capa_letras(r), True)

def toma_b(fr, n, letra):
    dx, dy = (int(v) for v in rng.integers(-4, 5, 2))
    luz = np.roll(LUZ, (dy, dx), (0, 1))
    rgb, a = fr[:, :, :3].astype(np.float32) / 255, fr[:, :, 3].astype(np.float32) / 255
    g = np.clip((rgb @ np.array([0.299, 0.587, 0.114], np.float32) - 0.04) * 1.25, 0, 1) * 0.92
    esc = 0.58
    fw, fh = int(W * esc), int(H * esc)
    x0, y0 = (W - fw) // 2, 640
    fig = Image.fromarray((np.dstack([g, a]) * 255).astype(np.uint8), 'LA').resize((fw, fh), Image.LANCZOS)
    fg, fa = np.asarray(fig, np.float32)[:, :, 0] / 255, np.asarray(fig, np.float32)[:, :, 1] / 255
    lienzo = luz * 0.97                                                    # el papel, en gris
    sombra = Image.new('L', (W, H), 0)
    sombra.paste(Image.fromarray((fa * 255).astype(np.uint8)), (x0 + 16, y0 + 18))
    lienzo = lienzo * (1 - 0.28 * np.asarray(sombra.filter(ImageFilter.GaussianBlur(14)), np.float32) / 255)
    lienzo[y0:y0 + fh, x0:x0 + fw] = lienzo[y0:y0 + fh, x0:x0 + fw] * (1 - fa) + fg * fa
    img = a_color(trama(np.clip(lienzo, 0, 1), dx, dy))
    r = []
    if n >= 1: r.append(('Bem dijo que funciona', 100, 268, FINA, 58, (40, 37, 35, 255), -2, 0))
    if n >= 4: r.append(('exactamente', 94, 332, GORDA, 156, (24, 22, 21, 255), -9, 1))
    if n >= 8: r.append(clave('al revés', 98, 508, 156, letra))
    return terminar(img, capa_letras(r))

A = leer(video_a, 2.0, 3.0)
B = leer(recorte_b, 0.0, 3.0, alfa=True)
for n, fr in enumerate(A): cuadros += [toma_a(fr, n, LETRA)] * PASO
for n, fr in enumerate(B): cuadros += [toma_b(fr, n, LETRA)] * PASO

if os.environ.get('FOTO'):                                    # una hoja con las cuatro letras, para escoger
    fila_a = np.hstack([toma_a(A[-1], 99, k) for k in 'ABCD'])
    fila_b = np.hstack([toma_b(B[-1], 99, k) for k in 'ABCD'])
    hoja = Image.fromarray(np.vstack([fila_a, fila_b]))
    d = ImageDraw.Draw(hoja)
    for i, k in enumerate('ABCD'):
        for fila in (0, 1):
            d.rectangle([i * W + 30, fila * H + 30, i * W + 150, fila * H + 150], fill=(0, 0, 0))
            d.text((i * W + 58, fila * H + 34), k, font=ImageFont.truetype(GORDA, 100), fill=(255, 255, 255))
    hoja.resize((W * 4 // 2, H * 2 // 2), Image.LANCZOS).save(os.path.join(os.environ['FOTO'], 'efecto-papel-letras.jpg'), quality=90)

subprocess.run([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', salida], input=np.stack(cuadros).tobytes(), check=True)
print(f'{salida}: {len(cuadros) / FPS:.1f} s, {len(cuadros)} cuadros')
