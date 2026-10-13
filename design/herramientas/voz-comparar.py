# Compara dos voces por medidas (Claude no oye): qué tan fuerte suena cada franja de graves a agudos, y cuánto ruido
# queda en los silencios. Sirve para saber por qué la voz de un clip de Jhonny no suena igual a la narración, y para
# sacar un ecualizador que acerque la primera a la segunda.
# Uso: python design/herramientas/voz-comparar.py <voz a corregir> <voz de referencia> [--eq]
#   --eq imprime el filtro de ffmpeg que acerca la primera a la segunda (para pegarlo en -af)
import sys, subprocess
import numpy as np

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 44100
BANDAS = [(80, 160), (160, 320), (320, 640), (640, 1280), (1280, 2560), (2560, 5120), (5120, 10000), (10000, 16000)]

def leer(ruta):
    crudo = subprocess.run([FF, '-v', 'error', '-i', ruta, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32)

def medir(x):
    n = 2048
    cuadros = np.lib.stride_tricks.sliding_window_view(x, n)[::n // 2]
    rms = np.sqrt((cuadros ** 2).mean(axis=1)) + 1e-9
    db = 20 * np.log10(rms)
    habla = cuadros[db > np.percentile(db, 60)]            # los cuadros donde se habla
    ruido = float(np.percentile(db, 5))                    # lo más callado: el fondo
    voz = float(np.percentile(db, 90))
    esp = (np.abs(np.fft.rfft(habla * np.hanning(n), axis=1)) ** 2).mean(axis=0)
    f = np.fft.rfftfreq(n, 1 / SR)
    bandas = np.array([10 * np.log10(esp[(f >= a) & (f < b)].mean() + 1e-12) for a, b in BANDAS])
    return bandas - bandas[1:5].mean(), ruido, voz        # franjas relativas al cuerpo de la voz

a, b = sys.argv[1], sys.argv[2]
ba, ra, va = medir(leer(a)); bb, rb, vb = medir(leer(b))
print(f'{"franja (Hz)":>14} | {"primera":>8} | {"referencia":>10} | diferencia')
for (lo, hi), x, y in zip(BANDAS, ba, bb):
    print(f'{lo:>6}-{hi:<7} | {x:8.1f} | {y:10.1f} | {y - x:+.1f} dB')
print(f'fondo (lo más callado): primera {ra:.1f} dB, referencia {rb:.1f} dB  ·  voz: {va:.1f} y {vb:.1f} dB  ·  distancia voz-fondo: {va - ra:.0f} y {vb - rb:.0f} dB')
if '--eq' in sys.argv:
    filtros = []
    for (lo, hi), x, y in zip(BANDAS, ba, bb):
        g = max(-8.0, min(8.0, y - x))
        if abs(g) >= 0.8: filtros.append(f'equalizer=f={int((lo * hi) ** 0.5)}:t=o:w=1:g={g:.1f}')
    print('EQ=' + ','.join(filtros))
