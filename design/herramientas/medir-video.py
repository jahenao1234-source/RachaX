"""Mide en dos videos: cuánto se mueve la imagen, cuántos cambios grandes hay y cuánta pantalla ocupa el contenido."""
import subprocess, sys
import numpy as np

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
W, H, FPS = 90, 160, 10


def cuadros(ruta, hasta):
    raw = subprocess.run([FF, '-v', 'error', '-i', ruta, '-t', str(hasta), '-vf', f'fps={FPS},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)


for nombre, ruta, hasta in [('rimu', sys.argv[1], 23.0), ('racha', sys.argv[2], 28.0)]:
    f = cuadros(ruta, hasta)
    dif = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))           # movimiento entre cuadros
    quieto = (dif < 0.6).mean() * 100                               # % de cuadros casi quietos
    cambios = int(((dif[1:] > 6) & (dif[1:] > dif[:-1])).sum())     # golpes grandes (cambio de escena o de fondo)
    # cuánta pantalla ocupa el contenido: píxeles que se separan del color de fondo de ese cuadro
    fondo = np.median(f.reshape(len(f), -1), axis=1)[:, None, None]
    ocupa = (np.abs(f - fondo) > 25).mean(axis=(1, 2)) * 100
    print(f'{nombre:6s} movimiento medio {dif.mean():5.2f} | cuadros casi quietos {quieto:4.1f} % | golpes grandes {cambios:3d} ({cambios / hasta:.2f} por segundo) | pantalla ocupada {ocupa.mean():4.1f} % (mediana {np.median(ocupa):4.1f} %)')
