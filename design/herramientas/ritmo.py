# Mide el ritmo de una pista de música para cuadrar los cortes de un anuncio (Claude no puede oírla).
# Entrada: un WAV mono (sacarlo antes con ffmpeg:  -vn -ac 1 -ar 22050 pista.wav).
# Salida: el tempo, el momento de cada golpe y los golpes más fuertes, en pantalla y en <pista>.ritmo.json
# Uso: python design/herramientas/ritmo.py <pista.wav>
import sys, json, wave
import numpy as np

ruta = sys.argv[1]
with wave.open(ruta, 'rb') as w:
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
dur = len(x) / sr

# Envolvente de ataques: cuánto sube la energía de cada banda de un cuadro al siguiente
N, H = 1024, 256
ventana = np.hanning(N)
cuadros = 1 + (len(x) - N) // H
mag = np.empty((cuadros, N // 2 + 1), dtype=np.float32)
for i in range(cuadros):
    mag[i] = np.abs(np.fft.rfft(x[i * H:i * H + N] * ventana))
logm = np.log1p(50 * mag)
flujo = np.maximum(0, np.diff(logm, axis=0)).sum(axis=1)
flujo = np.concatenate([[0], flujo])
fps = sr / H
suave = np.convolve(flujo, np.ones(int(fps * 0.4)) / int(fps * 0.4), mode='same')
env = np.maximum(0, flujo - suave)
t = np.arange(cuadros) * H / sr

# Tempo: el retraso con más parecido consigo misma, entre 70 y 180 golpes por minuto
ac = np.correlate(env, env, mode='full')[len(env) - 1:]
mejor, bpm = -1, 0
candidatos = []
for b in np.arange(70, 180.01, 0.25):
    lag = 60.0 / b * fps
    s = 0
    for k in (1, 2, 4):
        i = lag * k
        i0 = int(np.floor(i)); f = i - i0
        if i0 + 1 < len(ac):
            s += (ac[i0] * (1 - f) + ac[i0 + 1] * f)
    candidatos.append((s, b))
    if s > mejor:
        mejor, bpm = s, b
candidatos.sort(reverse=True)
periodo = 60.0 / bpm

# Fase: el desfase que hace caer los golpes sobre los ataques
mejor_f, fase = -1, 0
for f0 in np.arange(0, periodo, 0.005):
    marcas = np.arange(f0, dur, periodo)
    idx = np.clip((marcas * fps).astype(int), 0, len(env) - 1)
    s = sum(env[max(0, i - 2):i + 3].max() for i in idx)
    if s > mejor_f:
        mejor_f, fase = s, f0
golpes = np.arange(fase, dur, periodo)
fuerza = [float(env[max(0, int(g * fps) - 3):int(g * fps) + 4].max()) for g in golpes]

# Energía por medio segundo, para ver dónde arranca, dónde crece y dónde acaba
paso = int(sr * 0.5)
energia = [float(np.sqrt(np.mean(x[i:i + paso] ** 2))) for i in range(0, len(x) - paso, paso)]
umbral = max(energia) * 0.08
arranque = next((i * 0.5 for i, e in enumerate(energia) if e > umbral), 0.0)
final = next((len(energia) * 0.5 - i * 0.5 for i, e in enumerate(reversed(energia)) if e > umbral), dur)

# Los ataques más fuertes de toda la pista
picos = [i for i in range(2, len(env) - 2) if env[i] == env[max(0, i - 8):i + 9].max() and env[i] > 0]
picos.sort(key=lambda i: -env[i])
fuertes = sorted(round(float(t[i]), 2) for i in picos[:14])

print(f'duración: {dur:.2f} s')
print(f'tempo: {bpm:.2f} golpes por minuto (un golpe cada {periodo:.3f} s); otros candidatos: ' + ', '.join(f'{b:.1f}' for _, b in candidatos[1:4]))
print(f'primer golpe en: {fase:.3f} s')
print(f'suena desde {arranque:.1f} s hasta {final:.1f} s')
print('energía cada 0,5 s:', ' '.join(f'{e * 100:.0f}' for e in energia))
print('ataques más fuertes (s):', fuertes)
json.dump({'duracion': round(dur, 3), 'bpm': float(bpm), 'periodo': round(periodo, 4), 'fase': round(float(fase), 3),
           'golpes': [round(float(g), 3) for g in golpes], 'fuerza': [round(f, 2) for f in fuerza],
           'energia_cada_medio_segundo': [round(e, 4) for e in energia], 'ataques_fuertes': fuertes},
          open(ruta.rsplit('.', 1)[0] + '.ritmo.json', 'w'), indent=1)
