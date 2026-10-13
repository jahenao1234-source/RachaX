# Empalma en la narración del guion 12 las cuatro frases clave grabadas aparte con más dramatismo.
# Johnatan (11 oct): la toma normal "no era ni rápida ni lenta, estaba bien, pero le falta la parte dramática de los
# que tenía antes en las partes importantes". En vez de regenerar todo (caro), se generaron solo las frases clave
# (guion12/voz/texto-v2-frases-clave.txt) y aquí se cambian por las de la toma original, palabra por palabra.
# Deja martes-v2-compuesta.wav y su .palabras.json (con los tiempos corridos), para pasarlos por voz-sin-pausas.py.
# Uso: python design/herramientas/voz-empalmar-g12.py
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
V = os.path.join(AQUI, '..', 'anuncios', 'campana', 'guion12', 'voz')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000

def leer(ruta):
    crudo = subprocess.run([FF, '-v', 'error', '-i', ruta, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).copy()

A = leer(os.path.join(V, 'martes-v1-juan-limpia.wav')); WA = json.load(open(os.path.join(V, 'martes-v1-juan.palabras.json'), encoding='utf8'))['palabras']
B = leer(os.path.join(V, 'martes-v2-frases-limpia.wav')); WB = json.load(open(os.path.join(V, 'martes-v2-frases-juan.palabras.json'), encoding='utf8'))['palabras']
# La transcripción pegó el "sí" de "No volver... sí" al final de "volver" (11,59 a 11,69), pero suena después de la
# pausa, de 12,25 a 12,55 (medido por el sonido). Sin corregirlo, el corte se lo comía.
WB[29]['i'], WB[29]['f'] = 12.22, 12.58
# (fuente, primera palabra, última palabra, aire antes, aire después)
PIEZAS = [('A', 0, 22, 0.1, 0.25), ('B', 6, 16, 0.3, 0.35), ('A', 34, 54, 0.3, 0.25), ('B', 21, 29, 0.25, 0.45),
          ('A', 64, 74, 0.3, 0.25), ('B', 32, 47, 0.25, 0.4), ('A', 91, 114, 0.3, 0.25), ('B', 53, 56, 0.25, 0.45), ('A', 119, 128, 0.3, 0.6)]
def nivel(x, w, de, a):
    # volumen medio de lo hablado en un pedazo (sin contar los silencios)
    s = x[int(w[de]['i'] * SR):int(w[a]['f'] * SR)]
    c = np.lib.stride_tricks.sliding_window_view(s, 1024)[::512]
    db = 20 * np.log10(np.sqrt((c ** 2).mean(axis=1)) + 1e-9)
    return float(db[db > -35].mean())
NIV = [nivel(A if f == 'A' else B, WA if f == 'A' else WB, de, a) for f, de, a, _, _ in PIEZAS]

audio, palabras, reloj = [], [], 0.0
for k, (fuente, de, a, antes, despues) in enumerate(PIEZAS):
    x, w = (A, WA) if fuente == 'A' else (B, WB)
    ini, fin = max(0.0, w[de]['i'] - antes), min(len(x) / SR, w[a]['f'] + despues)
    tramo = x[int(ini * SR):int(fin * SR)].copy()
    if fuente == 'B':
        # "se nota un poco el empalme" (Johnatan, 11 oct): cada frase nueva queda al volumen de las dos que la rodean
        g = max(-2.5, min(2.5, (NIV[k - 1] + NIV[min(k + 1, len(NIV) - 1)]) / 2 - NIV[k]))
        tramo *= 10 ** (g / 20); print(f'frase {de}-{a}: {g:+.1f} dB')
    n = int(0.03 * SR); tramo[:n] *= np.linspace(0, 1, n); tramo[-n:] *= np.linspace(1, 0, n)   # entrada y salida suaves
    audio.append(tramo)
    for p in w[de:a + 1]:
        palabras.append({'t': p['t'], 'i': round(p['i'] - ini + reloj, 3), 'f': round(p['f'] - ini + reloj, 3), 'c': p.get('c', 1)})
    reloj += len(tramo) / SR
x = np.concatenate(audio)
with wave.open(os.path.join(V, 'martes-v2-compuesta.wav'), 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump({'texto': ' '.join(p['t'] for p in palabras), 'duracion': round(reloj, 2), 'palabras': palabras}, open(os.path.join(V, 'martes-v2-compuesta.palabras.json'), 'w', encoding='utf8'), ensure_ascii=False)
print(f'{len(palabras)} palabras, {reloj:.1f} s')
print(' '.join(p['t'] for p in palabras))
