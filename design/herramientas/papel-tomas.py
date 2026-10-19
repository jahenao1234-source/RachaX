# Tomas con el "efecto de papel" del creador (referencias/oct13/analisis.md), para sumarlas a un video del estilo Dark.
# Aprobado por Johnatan el 13 de octubre de 2026 sobre campana/pruebas/efecto-papel-v2.mp4: "sí, ármalo con ese efecto,
# pero no omitas lo que llevamos en el estilo Dark; es una combinación, un agregado para que le dé más dinamismo".
# Qué hace el efecto: papel gris crema arrugado, trama fina de puntos de periódico sobre todo el cuadro, todo un poco
# blando (como impreso) y movimiento a saltos (6 imágenes por segundo). Las letras NO van aquí: las pone el molde.
# Uso (la salida siempre es de 1080 × 1920 a 30 cuadros):
#   python papel-tomas.py lleno   <video o foto> <desde> <dura> <salida.mp4>            video a pantalla completa, en sepia
#   python papel-tomas.py recorte <recorte.png|.webm> <dura> <salida.mp4> [gira_en|-] [desde] [alto] [centro y]
#                                  una persona recortada sobre el papel; con un .webm (recortado de un video con
#                                  remove-background) se mueve a saltos, "como un clip"; gira_en: ahí queda patas arriba
#   python papel-tomas.py fondo   <dura> <salida.mp4>                                   solo el papel
import sys, subprocess
import numpy as np
from PIL import Image, ImageFilter

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
W, H, FPS, PASO = 1080, 1920, 30, 5
TINTA = np.array([24, 22, 21], np.float32) / 255
PAPEL = np.array([228, 223, 211], np.float32) / 255
SEPIA = np.array([220, 208, 190], np.float32) / 255
rng = np.random.default_rng(11)
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)

def papel_arrugado():
    h, w, n = H // 8, W // 8, 46
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
    im = Image.fromarray(np.clip(luz * 200, 0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2.2))
    vin = 1 - 0.16 * (((XX - W / 2) / (W / 2)) ** 2 + ((YY - H / 2) / (H / 2)) ** 2) / 2
    return np.asarray(im, np.float32) / 200 * vin

def trama(gris, dx=0, dy=0, periodo=6.2, fuerza=0.42):
    u, v = (XX + dx + YY + dy) / 1.41421, (XX + dx - YY - dy) / 1.41421
    red = (np.cos(2 * np.pi * u / periodo) + np.cos(2 * np.pi * v / periodo)) / 4 + 0.5
    return gris * (1 - fuerza) + (1 / (1 + np.exp(-(gris - red) * 7))) * fuerza

def terminar(gris, claro):
    img = TINTA + (claro - TINTA) * gris[:, :, None]
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    a = np.asarray(im, np.float32) / 255 * (1 + (rng.random((H, W, 1)).astype(np.float32) - 0.5) * 0.07)
    return (np.clip(a, 0, 1) * 255).astype(np.uint8)

def guardar(cuadros, salida):
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', salida], stdin=subprocess.PIPE)
    n = 0
    for c in cuadros:
        for _ in range(PASO): p.stdin.write(c.tobytes()); n += 1
    p.stdin.close(); p.wait()
    print(f'{salida}: {n / FPS:.1f} s')

LUZ = papel_arrugado()
modo = sys.argv[1]
if modo == 'lleno':
    origen, de, dura, salida = sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
    foto = origen.lower().endswith(('.jpg', '.png'))
    orden = [FF, '-v', 'error'] + (['-loop', '1'] if foto else ['-ss', str(de)]) + ['-t', str(dura), '-i', origen, '-vf',
             f'fps={FPS / PASO},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', '-pix_fmt', 'gray', '-f', 'rawvideo', '-']
    A = np.frombuffer(subprocess.run(orden, capture_output=True, check=True).stdout, dtype=np.uint8).reshape(-1, H, W)
    def cuadros():
        for fr in A:
            g = np.clip((fr.astype(np.float32) / 255 - 0.05) * 1.2, 0, 1) ** 0.92
            dx, dy = (int(v) for v in rng.integers(-2, 3, 2))
            yield terminar(trama(g * (0.86 + 0.14 * np.roll(LUZ, (dy * 3, dx * 3), (0, 1))), dx, dy), SEPIA)
    guardar(cuadros(), salida)
elif modo == 'recorte':
    # recorte.png (una foto recortada, quieta) o recorte.webm (una persona recortada de un VIDEO: se mueve a saltos, "como un clip")
    origen, dura, salida = sys.argv[2], float(sys.argv[3]), sys.argv[4]
    gira_en = float(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] != '-' else None
    de = float(sys.argv[6]) if len(sys.argv) > 6 else 0.0
    alto = int(sys.argv[7]) if len(sys.argv) > 7 else 900
    cy = int(sys.argv[8]) if len(sys.argv) > 8 else 1330
    tono = float(sys.argv[10]) if len(sys.argv) > 10 else 0.92       # qué tan clara queda la figura (0.4 = casi silueta)
    deja = float(sys.argv[9]) if len(sys.argv) > 9 else 1.0          # qué parte de la figura se deja, de arriba hacia abajo (0.6 = hasta la cintura)
    nq = int(round(dura * FPS / PASO))
    if origen.lower().endswith('.webm'):
        w0, h0 = (int(v) for v in subprocess.run([FF.replace('ffmpeg.exe', 'ffprobe.exe'), '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', origen], capture_output=True, text=True).stdout.strip().split(',')[:2])
        raw = subprocess.run([FF, '-v', 'error', '-c:v', 'libvpx-vp9', '-ss', str(de), '-t', str(dura + 0.6), '-i', origen, '-vf', f'fps={FPS / PASO}', '-pix_fmt', 'rgba', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
        fr = np.frombuffer(raw, dtype=np.uint8).reshape(-1, h0, w0, 4).copy()
        fr[:, :, :, 3] = np.where(fr[:, :, :, 3] < 70, 0, fr[:, :, :, 3])          # fuera los fantasmas medio transparentes
        ocupa = (fr[:, :, :, 3] > 70).any(axis=0)
        ys, xs = np.where(ocupa)
        y0b, y1b, x0b, x1b = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        y1b = y0b + int((y1b - y0b) * deja)
        figs = [Image.fromarray(f[y0b:y1b, x0b:x1b], 'RGBA') for f in fr]
    else:
        f0 = Image.open(origen).convert('RGBA')
        figs = [f0.crop(f0.getbbox())]
    figs = [f.resize((max(2, int(f.width * alto / f.height)), alto), Image.LANCZOS) for f in figs]
    def cuadros():
        for k in range(nq):
            t = k * PASO / FPS
            dx, dy = (int(v) for v in rng.integers(-4, 5, 2))
            giro = float(rng.uniform(-0.6, 0.6)) + (180 if gira_en is not None and t >= gira_en else 0)
            fig = figs[min(k, len(figs) - 1)].rotate(giro, resample=Image.BICUBIC, expand=True)
            a = np.asarray(fig, np.float32) / 255
            g = np.clip((a[:, :, :3] @ np.array([0.299, 0.587, 0.114], np.float32) - 0.04) * 1.25, 0, 1) * tono
            fa = a[:, :, 3]
            x0, y0 = (W - fig.width) // 2 + dx, cy - fig.height // 2 + dy
            lienzo = np.roll(LUZ, (dy, dx), (0, 1)) * 0.97
            sombra = Image.new('L', (W, H), 0)
            sombra.paste(Image.fromarray((fa * 255).astype(np.uint8)), (x0 + 16, y0 + 18))
            lienzo = lienzo * (1 - 0.28 * np.asarray(sombra.filter(ImageFilter.GaussianBlur(14)), np.float32) / 255)
            ya, yb, xa, xb = max(0, y0), min(H, y0 + fig.height), max(0, x0), min(W, x0 + fig.width)
            sa, sg = fa[ya - y0:yb - y0, xa - x0:xb - x0], g[ya - y0:yb - y0, xa - x0:xb - x0]
            lienzo[ya:yb, xa:xb] = lienzo[ya:yb, xa:xb] * (1 - sa) + sg * sa
            yield terminar(trama(np.clip(lienzo, 0, 1), dx, dy), PAPEL)
    guardar(cuadros(), salida)
elif modo == 'fondo':
    dura, salida = float(sys.argv[2]), sys.argv[3]
    def cuadros():
        for k in range(int(round(dura * FPS / PASO))):
            dx, dy = (int(v) for v in rng.integers(-4, 5, 2))
            yield terminar(trama(np.clip(np.roll(LUZ, (dy, dx), (0, 1)) * 0.97, 0, 1), dx, dy), PAPEL)
    guardar(cuadros(), salida)
else:
    print('modo desconocido:', modo); sys.exit(1)
