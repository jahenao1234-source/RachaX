# Prueba del efecto "la persona resalta y se mueve" del estilo Dark (visto en las referencias del 10 de octubre:
# ref1 en 60 s y 75 s, ref3 en 55 s). La persona se recorta del fondo; el fondo se oscurece, se pone borroso y se
# aleja; la persona salta hacia la cámara y sigue acercándose más rápido que el fondo; entre los dos se dibuja una
# forma de luz ámbar. Es una prueba suelta hecha con Python; cuando se apruebe, el mismo efecto va en el molde
# (dos capas con la foto, una de ellas el recorte, y la luz en medio).
# Uso: python design/herramientas/prueba-recorte.py <foto> <recorte.png con transparencia> <salida.mp4>
# El recorte sale de: ffmpeg -loop 1 -i foto -t 0.5 -r 4 quieto.mp4 ; npx hyperframes@0.8.138 remove-background quieto.mp4 -o recorte.webm ;
#                     ffmpeg -c:v libvpx-vp9 -i recorte.webm -frames:v 1 recorte.png
import math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance, ImageChops

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
foto, recorte, salida = sys.argv[1:4]
W, H, FPS, DUR, POP = 1080, 1920, 30, 6.0, 1.5
AMBAR, CREMA = (255, 181, 71), (244, 231, 195)

base = Image.open(foto).convert('RGB')
base = base.resize((W, round(base.height * W / base.width)), Image.LANCZOS)
corte = Image.open(recorte).convert('RGBA').resize(base.size, Image.LANCZOS)
Y0 = (base.height - H) // 2
base, corte = base.crop((0, Y0, W, Y0 + H)), corte.crop((0, Y0, W, Y0 + H))
alfa = corte.split()[3]
# El fondo sin la persona: se tapa su hueco estirando lo de alrededor (borroso), para que al separarse no se vea doble
fondo_lejos = ImageEnhance.Brightness(base.filter(ImageFilter.GaussianBlur(16))).enhance(0.42)
# La persona, un poco más clara y con más contraste
persona = ImageEnhance.Contrast(ImageEnhance.Brightness(corte.convert('RGB')).enhance(1.12)).enhance(1.1)
persona.putalpha(alfa.filter(ImageFilter.GaussianBlur(1.2)))
# El resplandor ámbar: la silueta engordada y borrosa
silueta = alfa.filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(38))
resplandor = Image.new('RGBA', (W, H), AMBAR + (0,)); resplandor.putalpha(silueta.point(lambda v: int(v * 0.85)))
ys, xs = np.nonzero(np.array(alfa) > 128)
CX, CY = float(xs.mean()), float(ys.mean())
# El aro de luz detrás de la cabeza
ojos = (ys.min() + 0.33 * (ys.max() - ys.min()))
ARO = (CX - 20, ojos - 40, 400)

grano = np.random.default_rng(7).normal(0, 1, (8, H // 2, W // 2)).astype(np.float32)
yy, xx = np.mgrid[0:H, 0:W]
vineta = (1 - 0.55 * np.clip(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.72)) ** 2, 0, 1))[..., None].astype(np.float32)
try:
    serifa = ImageFont.truetype('C:/Windows/Fonts/BOD_R.TTF', 118)
    chica = ImageFont.truetype('C:/Windows/Fonts/seguisb.ttf', 54)
except OSError:
    serifa = chica = ImageFont.load_default()

def suave(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def escalar(img, s, dx=0, dy=0, centro=(W / 2, H / 2)):
    # agranda alrededor de un punto y corre; devuelve del tamaño del cuadro
    cx, cy = centro
    return img.transform((W, H), Image.AFFINE, (1 / s, 0, cx - (cx + dx) / s, 0, 1 / s, cy - (cy + dy) / s), Image.BICUBIC)

ff = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', salida], stdin=subprocess.PIPE)
for n in range(int(DUR * FPS)):
    t = n / FPS
    p = suave((t - POP) / 0.28)                    # 0 = foto plana; 1 = separada
    lento = max(0, t - POP) / (DUR - POP)          # la deriva después del salto
    # antes del salto: la foto entera con acercamiento lento
    zoom0 = 1.0 + 0.035 * min(t, POP) / POP
    s_fondo = zoom0 * (1 - 0.02 * p + 0.025 * lento)
    s_pers = zoom0 * (1 + 0.075 * p + 0.085 * lento)
    dx = -14 * p - 22 * lento
    temblor = (6 * math.sin(t * 90) * max(0, 1 - (t - POP) / 0.3), 5 * math.cos(t * 70) * max(0, 1 - (t - POP) / 0.3)) if t >= POP else (0, 0)
    cuadro = Image.blend(base, fondo_lejos, p) if p < 1 else fondo_lejos
    cuadro = escalar(cuadro, s_fondo, -dx * 0.5 + temblor[0], temblor[1]).convert('RGBA')
    if p > 0:
        luz = escalar(resplandor, s_pers * 1.03, dx, 0, (CX, CY))
        luz.putalpha(luz.split()[3].point(lambda v: int(v * p * (0.82 + 0.18 * math.sin(t * 5)))))
        cuadro.alpha_composite(luz)
        # el aro se dibuja de a poco
        a = suave((t - POP - 0.1) / 0.7)
        if a > 0:
            capa = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(capa)
            x, y, r = ARO; r *= (1 + 0.04 * lento)
            d.arc((x - r, y - r, x + r, y + r), -110, -110 + 360 * a, fill=AMBAR + (255,), width=9)
            brillo = capa.filter(ImageFilter.GaussianBlur(14))
            cuadro.alpha_composite(escalar(brillo, 1, dx * 0.7)); cuadro.alpha_composite(escalar(brillo, 1, dx * 0.7))
            nucleo = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dn = ImageDraw.Draw(nucleo)
            dn.arc((x - r, y - r, x + r, y + r), -110, -110 + 360 * a, fill=(255, 236, 200, 255), width=4)
            cuadro.alpha_composite(escalar(nucleo, 1, dx * 0.7))
    pers = persona if p > 0 else None
    if pers is not None:
        cuadro.alpha_composite(escalar(pers, s_pers, dx + temblor[0] * 1.6, temblor[1] * 1.6, (CX, CY)))
    # letras: las pequeñas arriba y el nombre grande sobre la persona
    d = ImageDraw.Draw(cuadro)
    for i, pal in enumerate(['Se', 'llamaba']):
        ap = suave((t - (POP + 0.25 + 0.2 * i)) / 0.25)
        if ap > 0:
            d.text((330 + 80 * i, 300), pal, font=chica, fill=CREMA + (int(255 * ap),))
    for i, pal in enumerate(['Maxwell', 'Maltz']):
        ap = suave((t - (POP + 0.7 + 0.28 * i)) / 0.3)
        if ap > 0:
            capa = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dc = ImageDraw.Draw(capa)
            dc.text((W / 2, 1290 + 120 * i), pal, font=serifa, fill=CREMA + (int(255 * ap),), anchor='mm')
            sombra = capa.filter(ImageFilter.GaussianBlur(10))
            cuadro.alpha_composite(ImageChops.multiply(sombra, Image.new('RGBA', (W, H), (0, 0, 0, 255))))
            cuadro.alpha_composite(capa)
    x = np.asarray(cuadro.convert('RGB'), np.float32) * vineta
    g = np.kron(grano[(n // 2) % 8], np.ones((2, 2), np.float32))[..., None]
    x += g * 9
    if POP <= t < POP + 0.1: x = x * 0.55 + 255 * 0.45 * (1 - (t - POP) / 0.1)   # destello
    ff.stdin.write(np.clip(x, 0, 255).astype(np.uint8).tobytes())
ff.stdin.close(); ff.wait()
print('listo', salida)
