# Le quita el fondo claro a un clip de cámara fija y deja a la persona, lo que mueve (el mazo, el polvo) y un objeto
# quieto (la piedra) sobre un fondo oscuro. Nació con el picapedrero del guion 10: `remove-background` solo deja a la
# persona (se lleva el mazo y la piedra), así que aquí se suman tres máscaras:
#   1) la persona (el .webm de `npx hyperframes@0.8.138 remove-background clip.mp4 -o clip-recorte.webm`),
#   2) lo que se mueve cerca de la persona (lo que cambia respecto a la mediana del clip),
#   3) un polígono fijo para el objeto quieto.
# Uso: python design/herramientas/fondo-oscuro-clip.py <clip.mp4> <clip-recorte.webm> <salida.mp4> "x,y x,y x,y ..." [cerca=300]
# Con TECHO=790 lo que se mueve solo cuenta por encima de esa altura (y alrededor del objeto): así no salen pedazos de suelo
# donde estuvo la pierna. Con BANDA=430:670:75 se pide un cambio más grande en esa franja (donde pasa gente o carros al fondo).
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
clip, recorte, salida, poli = sys.argv[1:5]
CERCA = int(sys.argv[5]) if len(sys.argv) > 5 else 300
W, H, FPS = 720, 1280, 24
N = W * H

def leer(args, canales):
    return subprocess.Popen([FF, '-v', 'error', *args, '-f', 'rawvideo', '-pix_fmt', 'rgb24' if canales == 3 else 'gray', '-'], stdout=subprocess.PIPE)

# la mediana del clip (el fondo quieto), en gris y a la mitad de tamaño
p = leer(['-i', clip, '-vf', f'scale={W // 2}:{H // 2},gblur=sigma=2'], 1)
chicos = np.frombuffer(p.stdout.read(), np.uint8).reshape(-1, H // 2, W // 2)
mediana = np.median(chicos[::2], axis=0).astype(np.float32)
total = len(chicos)

piedra = Image.new('L', (W, H), 0)
ImageDraw.Draw(piedra).polygon([tuple(map(int, q.split(','))) for q in poli.split()], fill=255)
piedra = np.asarray(piedra.filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
yy, xx = np.mgrid[0:H, 0:W]
TECHO = int(os.environ.get('TECHO', H))
b0, b1, bu = (int(v) for v in os.environ.get('BANDA', '0:0:22').split(':'))
umbral = np.full((H // 2, W // 2), 22, np.float32); umbral[b0 // 2:b1 // 2] = bu
cerca_piedra = np.asarray(Image.fromarray((piedra * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
permitido = np.maximum((yy < TECHO).astype(np.float32), cerca_piedra)
piso = np.clip((yy - H * 0.58) / (H * 0.2), 0, 1).astype(np.float32)   # abajo se deja ver algo del suelo

orig = leer(['-i', clip, '-vf', f'scale={W}:{H}'], 3)
mate = leer(['-c:v', 'libvpx-vp9', '-i', recorte, '-vf', f'alphaextract,scale={W}:{H}'], 1)
out = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', salida], stdin=subprocess.PIPE)
for n in range(total):
    f = np.frombuffer(orig.stdout.read(N * 3), np.uint8)
    m = np.frombuffer(mate.stdout.read(N), np.uint8)
    if len(f) < N * 3 or len(m) < N: break
    f = f.reshape(H, W, 3).astype(np.float32); persona = m.reshape(H, W)
    # lo que se mueve
    dif = np.abs(chicos[n].astype(np.float32) - mediana)
    mov = Image.fromarray((np.clip((dif - umbral) / 26, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2)).resize((W, H), Image.BILINEAR)
    # ...pero solo cerca de la persona
    zona = Image.fromarray(persona).resize((W // 8, H // 8), Image.BILINEAR).filter(ImageFilter.MaxFilter(2 * (CERCA // 16) + 1)).filter(ImageFilter.GaussianBlur(4)).resize((W, H), Image.BILINEAR)
    mov = np.asarray(mov, np.float32) / 255 * (np.asarray(zona, np.float32) / 255) * permitido
    a = np.maximum(np.maximum(persona.astype(np.float32) / 255, mov), piedra)
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32)[..., None] / 255
    # el fondo nuevo: negro arriba; abajo, el suelo original muy oscuro
    gris = f.mean(axis=2, keepdims=True)
    fondo = gris * (0.03 + 0.2 * piso[..., None])
    frente = (gris - 128) * 1.08 + 128 + 4      # todo en gris, con un poco más de contraste
    out.stdin.write(np.clip(fondo * (1 - a) + frente * a, 0, 255).astype(np.uint8).repeat(3, axis=2).tobytes())
out.stdin.close(); out.wait()
print('listo', salida, n + 1, 'cuadros')
