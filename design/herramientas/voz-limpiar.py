# Deja una voz LIMPIA y pareja, de estudio: le baja el ruido que queda entre las palabras, le da un poco de cuerpo y
# la deja a un volumen fijo. Si se le da una voz de referencia, antes la iguala de graves a agudos con ella: así la voz
# de un clip de Jhonny (que sale apagada del cambiador de voz) suena como la narración.
# Lo pidió Johnatan el 11 de octubre de 2026: "quería un audio más profesional y más limpio", "si las dice con el clip
# no queda la misma voz". Medido ese día: la voz del clip tenía 15 dB menos entre 2,5 y 5 kHz que la narración, y el
# tratamiento anterior (compresión + loudnorm) subía el ruido de fondo de -51 a -38 dB.
# Uso: python design/herramientas/voz-limpiar.py <entrada> <salida.wav|mp3> [voz de referencia]
import sys, subprocess
import numpy as np

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 44100
BANDAS = [(80, 160), (160, 320), (320, 640), (640, 1280), (1280, 2560), (2560, 5120), (5120, 10000), (10000, 16000)]

def leer(ruta, filtro=None):
    orden = [FF, '-v', 'error', '-i', ruta] + (['-af', filtro] if filtro else []) + ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(orden, capture_output=True, check=True).stdout, dtype=np.float32)

def medir(x):
    n = 2048
    cuadros = np.lib.stride_tricks.sliding_window_view(x, n)[::n // 2]
    db = 20 * np.log10(np.sqrt((cuadros ** 2).mean(axis=1)) + 1e-9)
    habla = cuadros[db > np.percentile(db, 60)]
    esp = (np.abs(np.fft.rfft(habla * np.hanning(n), axis=1)) ** 2).mean(axis=0)
    f = np.fft.rfftfreq(n, 1 / SR)
    bandas = np.array([10 * np.log10(esp[(f >= a) & (f < b)].mean() + 1e-12) for a, b in BANDAS])
    return bandas - bandas[1:5].mean(), float(np.percentile(db, 5)), float(np.percentile(db, 90))

entrada, salida = sys.argv[1], sys.argv[2]
ref = sys.argv[3] if len(sys.argv) > 3 else None
pasos = ['highpass=f=70']
if ref:
    bb, _, _ = medir(leer(ref))
    for vuelta in range(3):                                 # tres vueltas: cada una corrige lo que le faltó a la anterior
        ba, _, _ = medir(leer(entrada, ','.join(pasos)))
        for (lo, hi), x, y in zip(BANDAS[:7], ba, bb):      # la última franja (más de 10 kHz) no se toca: ahí solo hay soplido
            g = max(-8.0, min(8.0, y - x))
            if abs(g) >= 0.7: pasos.append(f'equalizer=f={int((lo * hi) ** 0.5)}:t=o:w=1:g={g:.1f}')
# quitar el ruido de fondo y cerrar la puerta entre palabras, ANTES de comprimir (si no, la compresión lo sube)
pasos += ['afftdn=nr=12:nf=-50', 'agate=threshold=0.008:ratio=3:attack=4:release=200:range=0.1:knee=4']
if not ref: pasos += ['equalizer=f=115:t=q:w=0.9:g=2', 'equalizer=f=320:t=q:w=1.1:g=-1.5', 'equalizer=f=4500:t=q:w=1.2:g=1.5']
pasos += ['acompressor=threshold=-20dB:ratio=2.5:attack=8:release=160:makeup=2']
cadena = ','.join(pasos)
_, _, voz = medir(leer(entrada, cadena))
ganancia = -14.0 - voz                                     # la voz queda siempre al mismo nivel
cadena += f',volume={ganancia:.1f}dB,alimiter=limit=0.89'
codec = ['-c:a', 'pcm_s16le'] if salida.lower().endswith('.wav') else ['-b:a', '192k']
subprocess.run([FF, '-v', 'error', '-y', '-i', entrada, '-af', cadena, '-ar', '48000', '-ac', '1'] + codec + [salida], check=True)
b2, fondo, v2 = medir(leer(salida))
print(f'{salida}: voz {v2:.1f} dB, fondo {fondo:.1f} dB (distancia {v2 - fondo:.0f} dB)' + (' · igualada con la referencia' if ref else ''))
if ref:
    bb, _, _ = medir(leer(ref))
    print('  diferencia que queda por franja (dB):', ' '.join(f'{y - x:+.1f}' for x, y in zip(b2, bb)))
