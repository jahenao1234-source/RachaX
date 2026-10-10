# Mezcla de las dos músicas que escogió Johnatan para el guion 2 "El efecto ya qué" (10 oct de 2026):
# "la parte principal de la primera" (Uncovering the Truth) + "los golpeteos de la segunda" (A Silent Unravelling),
# y la acomoda al anuncio: el primer golpe grande cae en el corte a las manos con el helado, se calla antes de
# "ya qué" y vuelve de golpe cuando se dice el nombre ("el efecto ya qué"); la segunda parte se estira un poco
# para que alcance hasta la pastilla del precio.
# Claude no oye: todo se cuadra midiendo (dónde están los golpes de cada pista) y se le dice a Johnatan qué se hizo.
# Uso: python design/herramientas/musica-mezcla-g2.py      (deja guion2/musica/mezcla-arreglada.wav, del largo del video)
import json, os, subprocess, sys, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
G2 = os.path.join(AQUI, '..', 'anuncios', 'campana', 'guion2')
M = os.path.join(G2, 'musica')
FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe'
SR = 48000

def leer(ruta):
    crudo = subprocess.run([FF, '-v', 'error', '-i', ruta, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).astype(np.float32).copy()

def guardar(ruta, x):
    x = np.clip(x, -1, 1)
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def golpe_cerca(x, t, margen=0.7):
    """El momento exacto (s) en que arranca el golpe más fuerte cerca de t: donde más sube la energía."""
    mono = x.mean(axis=1)
    paso = int(SR * 0.005)
    a, b = int((t - margen) * SR), int((t + margen) * SR)
    tramo = mono[max(0, a):b]
    e = np.sqrt(np.array([np.mean(tramo[i:i + 2 * paso] ** 2) for i in range(0, len(tramo) - 2 * paso, paso)]) + 1e-12)
    sube = e[4:] - e[:-4]
    return max(0, a) / SR + (int(np.argmax(sube)) + 2) * 0.005

def percusion(x, n=2048, salto=512, nucleo=17, margen=1.0):
    """Deja solo los golpes (lo que dura poco y ocupa muchas frecuencias) y quita las notas largas."""
    ventana = np.hanning(n).astype(np.float32)
    def stft(c):
        cuadros = 1 + (len(c) - n) // salto
        idx = np.arange(n)[None, :] + salto * np.arange(cuadros)[:, None]
        return np.fft.rfft(c[idx] * ventana, axis=1)          # (cuadros, frecuencias)
    X = [stft(x[:, 0]), stft(x[:, 1])]
    S = (np.abs(X[0]) + np.abs(X[1])) / 2
    k = nucleo // 2
    def mediana(S, eje):
        # mediana a lo largo de un eje, por pedazos para no llenar la memoria
        S = np.swapaxes(S, 0, eje) if eje else S
        relleno = np.pad(S, ((k, k), (0, 0)), mode='edge')
        sal = np.empty_like(S)
        for i in range(0, S.shape[1], 64):
            v = np.lib.stride_tricks.sliding_window_view(relleno[:, i:i + 64], nucleo, axis=0)
            sal[:, i:i + 64] = np.median(v, axis=-1)
        return np.swapaxes(sal, 0, eje) if eje else sal
    H = mediana(S, 0)        # a lo largo del tiempo: lo que se sostiene (notas)
    P = mediana(S, 1)        # a lo largo de las frecuencias: lo que golpea
    mascara = (P ** 2) / (P ** 2 + (margen * H) ** 2 + 1e-9)
    sal = np.zeros_like(x)
    peso = np.zeros(len(x), dtype=np.float32)
    for c in range(2):
        Y = np.fft.irfft(X[c] * mascara, n=n, axis=1).astype(np.float32) * ventana
        for j in range(Y.shape[0]):
            sal[j * salto:j * salto + n, c] += Y[j]
            if c == 0: peso[j * salto:j * salto + n] += ventana ** 2
    return sal / np.maximum(peso, 1e-3)[:, None]

def estirar(x, r, tmp):
    """Más lento (r < 1) sin cambiar el tono, con ffmpeg."""
    guardar(tmp, x)
    crudo = subprocess.run([FF, '-v', 'error', '-i', tmp, '-af', f'atempo={r}', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    os.remove(tmp)
    return np.frombuffer(crudo, dtype=np.float32).reshape(-1, 2).copy()

def fuerza(x):
    return float(np.sqrt(np.mean(x ** 2)))

# ---------- 1. las dos pistas y sus golpes ----------
p1 = leer(os.path.join(M, '1-uncovering-the-truth.wav'))
p2 = leer(os.path.join(M, '2-a-silent-unravelling.wav'))
g1 = {t: golpe_cerca(p1, t) for t in (13.0, 16.5, 20.0, 26.5, 33.0)}
g2 = {t: golpe_cerca(p2, t) for t in (13.3, 20.1, 26.8, 33.3)}
print('golpes de la primera:', {k: round(v, 3) for k, v in g1.items()})
print('golpes de la segunda:', {k: round(v, 3) for k, v in g2.items()})
# Las dos pistas no van exactamente al mismo paso: se busca cuánto hay que acelerar y correr la segunda para que
# sus golpes caigan con los de la primera (se comparan las "subidas de energía" de las dos, cada 10 ms)
def subidas(x):
    mono = x.mean(axis=1); paso = SR // 100
    e = np.log(np.sqrt(np.array([np.mean(mono[i:i + paso] ** 2) for i in range(0, len(mono) - paso, paso)])) + 1e-4)
    d = np.maximum(0, e[2:] - e[:-2]); return d - d.mean()
s1, s2 = subidas(p1), subidas(p2)
tt = np.arange(len(s1)) / 100.0
mejor = (-1, 1.0, 0.0)
for a in np.arange(0.96, 1.0405, 0.002):
    s2a = np.interp(tt, a * tt, s2, left=0, right=0)
    for lag in range(-70, 71):
        if lag >= 0: v = float(np.dot(s1[lag:], s2a[:len(s2a) - lag]))
        else: v = float(np.dot(s1[:lag], s2a[-lag:]))
        if v > mejor[0]: mejor = (v, float(a), lag / 100.0)
_, paso_a, corr = mejor
print(f'la segunda va a {paso_a:.3f} del paso de la primera y se corre {corr:+.2f} s')

# ---------- 2. la percusión de la segunda, encima de la primera ----------
perc = percusion(p2)
if abs(paso_a - 1) > 0.001: perc = estirar(perc, round(1 / paso_a, 4), os.path.join(M, '_p.wav'))
d = int(round(corr * SR))
perc = np.concatenate([np.zeros((d, 2), np.float32), perc])[:len(p1)] if d >= 0 else np.concatenate([perc[-d:], np.zeros((-d, 2), np.float32)])[:len(p1)]
if len(perc) < len(p1): perc = np.concatenate([perc, np.zeros((len(p1) - len(perc), 2), np.float32)])
# la percusión son golpes sueltos: se empareja por sus picos (los golpes más fuertes quedan 3 dB por debajo de los de la primera)
gan = float(np.percentile(np.abs(p1), 99.95) / max(np.percentile(np.abs(perc), 99.95), 1e-6)) * 10 ** (-3 / 20)
perfil = lambda x: ' '.join(str(int(round(100 * np.sqrt(np.mean(x[i:i + SR // 2] ** 2))))) for i in range(0, len(x) - SR // 2, SR // 2))
print('energía de la percusión sola, cada 0,5 s:', perfil(perc * gan))
mezcla = p1 + perc * gan
print(f'percusión: se le dieron {20 * np.log10(gan):.1f} dB')
guardar(os.path.join(M, 'mezcla-cruda.wav'), mezcla * 0.8)
guardar(os.path.join(M, '2-solo-percusion.wav'), perc * gan)

# ---------- 3. acomodarla al anuncio ----------
pal = json.load(open(os.path.join(G2, 'voz', 'ya-que-v2-juan-sin-pausas.palabras.json'), encoding='utf8'))['palabras']
T = lambda k: 0.5 + pal[k]['i']
TOTAL = 0.5 + pal[-1]['f'] + 2.2
t_manos, t_ya, t_nombre, t_te = T(36) - 0.08, T(76), T(91), T(159)
video = np.zeros((int(TOTAL * SR), 2), np.float32)
def poner(x, en):
    a = int(round(en * SR)); o = 0
    if a < 0: o, a = -a, 0
    n = min(len(x) - o, len(video) - a)
    if n > 0: video[a:a + n] += x[o:o + n]
def rampa(x, de, a, sube):
    i, j = int(de * SR), int(a * SR); i, j = max(0, i), min(len(x), j)
    r = np.linspace(0, 1, j - i) if sube else np.linspace(1, 0, j - i)
    x[i:j] *= (r ** 2)[:, None]
    if sube: x[:i] = 0
    else: x[j:] = 0
# Parte A: desde el comienzo hasta antes del silencio de la pista. Su primer golpe grande cae en el corte a las manos.
A = mezcla[:int(32.4 * SR)].copy()
enA = t_manos - g1[13.0]
rampa(A, (t_ya - 1.1) - enA, (t_ya - 0.2) - enA, False)           # se calla antes de "ya qué"
poner(A, enA)
# Parte B: lo que viene después del silencio. Su primer golpe cae en el nombre ("el efecto ya QUÉ") y se estira para llegar a la pastilla.
ini_b = 32.6
B = mezcla[int(ini_b * SR):].copy()
largo_util = 55.6 - ini_b
r = round(largo_util / ((t_te + 0.9) - (t_nombre - 0.5)), 3)
r = min(1.0, max(0.8, r))
B = estirar(B, r, os.path.join(M, '_b.wav'))
enB = t_nombre - (g1[33.0] - ini_b) / r
rampa(B, 0, 0.05, True)
poner(B, enB)
fin = int((TOTAL - 1.2) * SR)
video[fin:] *= (np.linspace(1, 0, len(video) - fin) ** 2)[:, None]
pico = float(np.abs(video).max())
video *= 0.89 / pico
guardar(os.path.join(M, 'mezcla-arreglada.wav'), video)
print(f'parte A entra en {enA:.2f} s; su golpe cae en {t_manos:.2f} s (corte a las manos) y el siguiente en {enA + g1[16.5]:.2f} s; se calla en {t_ya - 0.2:.2f} s ("ya qué" es en {t_ya:.2f} s)')
print(f'parte B: estirada a {r} de su velocidad; entra en {enB:.2f} s y su golpe cae en {t_nombre:.2f} s (el nombre); suena hasta {enB + largo_util / r:.2f} s (la pastilla sale en {t_te:.2f} s; el video dura {TOTAL:.2f} s)')
