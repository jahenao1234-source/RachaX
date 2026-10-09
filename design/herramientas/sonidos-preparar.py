# Prepara los efectos de sonido de la campaña (los que genera sonidos-campana.sh con ElevenLabs).
# Uso: python design/herramientas/sonidos-preparar.py
# A cada uno le quita el silencio del comienzo (para que el golpe caiga justo donde se pone), le recorta la cola
# vacía, lo empareja de volumen con los demás (por el tramo más fuerte de 50 ms, no por el pico) y lo guarda en
# design/anuncios/campana/sonidos/<nombre>.wav. También escribe sonidos.json con las medidas, que es como Claude
# "oye" los efectos: cuánto duran, dónde está el golpe y si son graves o agudos.
import json, os, subprocess, sys, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(AQUI, '..', 'anuncios', 'campana', 'sonidos')
FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000
OBJETIVO = 10 ** (-16 / 20)   # el tramo más fuerte de cada efecto queda en -16 dB
TOPE = 10 ** (-1 / 20)

def leer(ruta):
    crudo = subprocess.run([FFMPEG, '-v', 'error', '-i', ruta, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).astype(np.float64)

def ventana(x, ms):
    k = int(SR * ms / 1000)
    c = np.cumsum(np.concatenate([[0], x ** 2]))
    return np.sqrt((c[k:] - c[:-k]) / k)

medidas = {}
for archivo in sorted(os.listdir(os.path.join(D, 'originales'))):
    if not archivo.endswith('.mp3'): continue
    nombre = archivo[:-4]
    x = leer(os.path.join(D, 'originales', archivo))
    mono = x.mean(axis=1)
    fuerza = ventana(mono, 10)
    pico = fuerza.max()
    # empieza donde el sonido pasa del 6 % de su máximo (menos 8 ms) y acaba donde ya no vuelve a pasar del 2 %
    a = max(0, int(np.argmax(fuerza > pico * 0.06)) - int(SR * 0.008))
    encima = np.nonzero(fuerza > pico * 0.02)[0]
    b = min(len(mono), int(encima[-1]) + int(SR * 0.04))
    x = x[a:b]; mono = mono[a:b]
    f50 = ventana(mono, 50) if len(mono) > SR * 0.05 else np.array([np.sqrt((mono ** 2).mean())])
    g = OBJETIVO / f50.max()
    g = min(g, TOPE / np.abs(x).max())
    x = x * g
    # entrada y salida suaves para que no haga clic
    n_in, n_out = int(SR * 0.003), int(SR * 0.03)
    x[:n_in] *= np.linspace(0, 1, n_in)[:, None]; x[-n_out:] *= np.linspace(1, 0, n_out)[:, None]
    espectro = np.abs(np.fft.rfft(mono * np.hanning(len(mono)))); frec = np.fft.rfftfreq(len(mono), 1 / SR)
    centro = float((espectro * frec).sum() / espectro.sum())
    f10 = ventana(mono, 10)
    medidas[nombre] = {
        'dura': round(len(x) / SR, 3),
        'quitado_al_comienzo': round(a / SR, 3),
        'golpe_en': round(float(np.argmax(f10)) / SR, 3),          # dónde está lo más fuerte
        'mitad_de_la_energia_en': round(float(np.searchsorted(np.cumsum(mono ** 2), (mono ** 2).sum() / 2)) / SR, 3),
        'centro_hz': round(centro),                                 # grave (< 500), medio, agudo (> 2500)
        'pico_db': round(float(20 * np.log10(np.abs(x).max())), 1),
        'forma': ''.join(' .:-=+*#%@'[min(9, int(v * 10))] for v in [f10[i:i + max(1, len(f10) // 24)].max() / f10.max() for i in range(0, len(f10), max(1, len(f10) // 24))][:24]),
    }
    with wave.open(os.path.join(D, nombre + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    m = medidas[nombre]
    print(f"{nombre:9s} dura {m['dura']:.2f} s · golpe en {m['golpe_en']:.2f} · centro {m['centro_hz']:5d} Hz · pico {m['pico_db']:5.1f} dB · [{m['forma']}]")
json.dump(medidas, open(os.path.join(D, 'sonidos.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
