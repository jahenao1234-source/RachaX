# Mete la app llenándose DENTRO de la pantalla del portátil en una toma real de Johnatan (pedido del 14 oct de 2026:
# "pensé que podías poner las animaciones en los videos que yo acabé de grabar").
# Cómo: la pantalla es un plano. En cada cuadro se busca la app con SIFT contra una foto de la misma pantalla
# (referencia, tomada de la Racha de muestra al mismo tamaño que su portátil: 1600 × 900, a 2x) y sale la perspectiva
# (homografía) de ese cuadro. Las esquinas se suavizan en el tiempo para que no tiemble. Las fotos de la app llenándose
# (ehoy-NN.png, mismo tamaño) se ponen ahí con el color de la cámara: una mezcla de colores ajustada para que la
# referencia quede igual a lo filmado, más el brillo que la pantalla tiene en cada zona, el desenfoque y el grano.
# FOTOS='eprog-*.png' cambia qué fotos de la carpeta se usan (por defecto ehoy-*.png).
# Uso: python design/herramientas/pantalla-reemplazo.py <toma.mp4> <inicio s> <duración s> <referencia.png>
#        <carpeta con ehoy-NN.png> <salida.mp4> [fotos por segundo de la app = 8] [la app arranca en s = 0.3]
# Sale el video vertical 1080 × 1920 (recorte 9:16 al centro, igual que hf-pov.mjs) o, con CUADRO=1, uno de 1080 × 1080
# (ver más abajo), y al lado <salida>-antes-despues.jpg. HORIZONTAL=1 para las tomas horizontales (las del 15 oct).
import sys, os, glob, subprocess
import numpy as np, cv2

FF = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin'
toma, ini, dur, ref_ruta, app_dir, salida = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], sys.argv[5], sys.argv[6]
FPS_APP = float(sys.argv[7]) if len(sys.argv) > 7 else 8.0
ARRANQUE = float(sys.argv[8]) if len(sys.argv) > 8 else 0.3

# 1. los cuadros de la toma (ffmpeg ya los endereza: 1728 × 3840)
info = subprocess.run([f'{FF}/ffprobe.exe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', toma], capture_output=True, text=True).stdout.strip().split(',')
w0, h0 = int(info[0]), int(info[1])
# las tomas del 14 oct son verticales (vienen giradas); las del 15 oct, horizontales: HORIZONTAL=1
W, H = (max(w0, h0), min(w0, h0)) if os.environ.get('HORIZONTAL') == '1' else (min(w0, h0), max(w0, h0))
crudo = subprocess.run([f'{FF}/ffmpeg.exe', '-v', 'error', '-ss', str(ini), '-i', toma, '-t', str(dur), '-vf', 'fps=30', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True).stdout
cuadros = np.frombuffer(crudo, np.uint8).reshape(-1, H, W, 3)
N = len(cuadros)
print(f'{N} cuadros de {W} × {H}')

# 2. dónde está la pantalla en cada cuadro
# Primero se ubica la pantalla en el primer cuadro buscando la app con SIFT contra la referencia. Después cada cuadro se
# compara con ese primer cuadro (ECC, una perspectiva completa y con precisión de menos de un píxel), que es mucho más
# fino que volver a buscar la app en cada cuadro (eso temblaba 3 px en promedio y hasta 12).
ref = cv2.imread(ref_ruta)
RH, RW = ref.shape[:2]
sift = cv2.SIFT_create(nfeatures=9000)
kr, dr = sift.detectAndCompute(cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY), None)
ESC = 0.5
g_med = lambda c: cv2.resize(cv2.cvtColor(c, cv2.COLOR_BGR2GRAY), None, fx=ESC, fy=ESC, interpolation=cv2.INTER_AREA)
g0 = g_med(cuadros[0])
kc, dc = sift.detectAndCompute(g0, None)
b = [x for x, y in cv2.BFMatcher(cv2.NORM_L2).knnMatch(dr, dc, k=2) if x.distance < 0.75 * y.distance]
src = np.float32([kr[x.queryIdx].pt for x in b]); dst = np.float32([kc[x.trainIdx].pt for x in b]) / ESC
H0, mk = cv2.findHomography(src, dst, cv2.RANSAC, 4.0)
print(f'primer cuadro: {int(mk.sum())} puntos de la app calzan')
D = np.diag([ESC, ESC, 1.0]); Di = np.linalg.inv(D)
masc = cv2.warpPerspective(np.ones((RH, RW), np.uint8) * 255, D @ H0, (g0.shape[1], g0.shape[0]), flags=cv2.INTER_NEAREST)
masc = cv2.erode(masc, np.ones((25, 25), np.uint8))
g0f = g0.astype(np.float32)
cache_seg = os.path.splitext(salida)[0] + f'-seguimiento-{ini}-{dur}.npy'
if os.path.exists(cache_seg):
    Ws = list(np.load(cache_seg)); print('seguimiento leído de', cache_seg)
else:
    Ws, Wc = [], np.eye(3, dtype=np.float32)
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 80, 1e-6)
    for i, c in enumerate(cuadros):
        if i:
            try: _, Wc = cv2.findTransformECC(g0f, g_med(c).astype(np.float32), Wc.copy(), cv2.MOTION_HOMOGRAPHY, crit, masc, 5)
            except cv2.error: print('ECC no convergió en el cuadro', i, '(se deja el anterior)')
        Ws.append(Wc.copy())
    np.save(cache_seg, np.array(Ws))
Hcrudas = [Di @ Wk.astype(np.float64) @ D @ H0 for Wk in Ws]
# la parte de la pantalla que se ve: hasta dónde llega la app dentro del cuadro (para medir y suavizar con puntos visibles)
xs = np.linspace(0, 1, 101)
mitad = cv2.perspectiveTransform(np.float32([[x * RW, RH / 2] for x in xs]).reshape(-1, 1, 2), H0).reshape(-1, 2)
dentro = np.where((mitad[:, 0] > 5) & (mitad[:, 0] < W - 5))[0]
XA, XB = float(xs[dentro.min()]), float(xs[dentro.max()])
XV = XB - XA
sub = np.float32([[XA * RW, 0], [XB * RW, 0], [XB * RW, RH], [XA * RW, RH]])
vis = np.array([cv2.perspectiveTransform(sub.reshape(-1, 1, 2), Hk).reshape(4, 2) for Hk in Hcrudas])
salto = np.abs(np.diff(vis, axis=0)).max(axis=(1, 2))
print(f'se ve {XV:.0%} del ancho de la pantalla · salto de una esquina visible entre cuadros: máx {salto.max():.1f} px, promedio {salto.mean():.2f}')
# suavizado muy leve en el tiempo (gaussiana de 0,8 cuadros)
k = np.exp(-0.5 * (np.arange(-3, 4) / 0.8) ** 2); k /= k.sum()
pad = np.concatenate([vis[:1].repeat(3, 0), vis, vis[-1:].repeat(3, 0)])
suaves = np.array([(pad[j:j + 7] * k[:, None, None]).sum(0) for j in range(N)])
Hs = [cv2.getPerspectiveTransform(sub, suaves[j].astype(np.float32)) for j in range(N)]

# 3. el color de la cámara: se aprende con el primer cuadro, en el espacio de la pantalla (a la mitad, para ir rápido)
h2, w2 = RH // 2, RW // 2
S = np.diag([2.0, 2.0, 1.0])  # de la mitad a la referencia
inv = np.linalg.inv(Hs[0] @ S)
f_ref = cv2.warpPerspective(cuadros[0], inv, (w2, h2), flags=cv2.INTER_AREA).astype(np.float32) / 255
valido = cv2.warpPerspective(np.ones((H, W), np.uint8) * 255, inv, (w2, h2), flags=cv2.INTER_NEAREST)
valido = cv2.erode(valido, np.ones((15, 15), np.uint8)) > 0
r_med = cv2.resize(ref, (w2, h2), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
fb, rb = cv2.GaussianBlur(f_ref, (0, 0), 2), cv2.GaussianBlur(r_med, (0, 0), 2)
idx = np.where(valido[::3, ::3].ravel())[0]
X = rb[::3, ::3].reshape(-1, 3)[idx]
Y = fb[::3, ::3].reshape(-1, 3)[idx]
M = np.zeros((4, 3), np.float32)
for ch in range(3):
    a, b0 = np.polyfit(X[:, ch], Y[:, ch], 1)
    M[ch, ch], M[3, ch] = a, b0
# COLOR=curva (15 oct): en vez de una recta por canal, una curva medida punto por punto (la cámara aplasta los negros y
# satura lo claro: con la recta el negro quedaba gris y el ámbar verdoso)
MODO_COLOR = os.environ.get('COLOR', 'recta')
CURVA = MODO_COLOR in ('curva', 'cuantil', 'fijo')
if MODO_COLOR == 'fijo':
    # COLOR=fijo LUT_DE=<archivo .npz>: la curva que salió bien en otra toma (la misma cámara y la misma pantalla), y aquí
    # solo se ajusta la exposición, para que todos los cortes se vean iguales entre sí
    z = np.load(os.environ['LUT_DE']); mid, LUT = z['mid'], list(z['lut'])
    aplicar0 = lambda a: np.stack([np.interp(a[..., ch], mid, LUT[ch]) for ch in range(3)], -1).astype(np.float32)
    lum = lambda a: a.reshape(-1, 3) @ np.float32([0.114, 0.587, 0.299])
    pr = lum(aplicar0(rb)[valido]); re_ = lum(fb[valido])
    GAN = float(np.clip(np.percentile(re_, 97) / max(np.percentile(pr, 97), 1e-3), 0.5, 2.0))
    print(f'exposición de esta toma frente a la curva guardada: x{GAN:.2f}')
    aplicar = lambda a: aplicar0(a) * GAN
    pred = aplicar(rb).reshape(-1, 3)
elif CURVA:
    bordes = np.linspace(0, 1, 49); mid = (bordes[:-1] + bordes[1:]) / 2; LUT = []
    # por cuantiles (COLOR=curva): se igualan las dos distribuciones de cada canal, sin depender de que cada punto de la
    # referencia caiga justo sobre el mismo punto de la toma (si él tenía otro estado de la app, punto a punto falla)
    qs = np.linspace(0, 100, 401)
    for ch in (range(3) if MODO_COLOR == 'cuantil' else []):
        xq = np.percentile(X[:, ch], qs); yq = np.percentile(Y[:, ch], qs)
        xq = np.maximum.accumulate(xq + np.arange(len(xq)) * 1e-6)
        LUT.append(np.interp(mid, xq, yq).astype(np.float32))
    for ch in (range(3) if MODO_COLOR == 'curva' else []):
        xs_, ys_ = X[:, ch], Y[:, ch]; v = []
        for a0, a1 in zip(bordes[:-1], bordes[1:]):
            sel = (xs_ >= a0) & (xs_ < a1)
            v.append(np.median(ys_[sel]) if sel.sum() >= 12 else np.nan)
        v = np.array(v); ok = ~np.isnan(v)
        v = np.interp(mid, mid[ok], v[ok]) if ok.sum() >= 2 else mid * M[ch, ch] + M[3, ch]
        # por encima del último dato: seguir la pendiente de la recta
        ult = mid[ok].max() if ok.any() else 0
        v[mid > ult] = v[mid <= ult][-1] + (mid[mid > ult] - ult) * max(M[ch, ch], 0.3)
        LUT.append(np.maximum.accumulate(v).astype(np.float32))
    aplicar = lambda a: np.stack([np.interp(a[..., ch], mid, LUT[ch]) for ch in range(3)], -1).astype(np.float32)
    if os.environ.get('GUARDAR_LUT'): np.savez(os.environ['GUARDAR_LUT'], mid=mid, lut=np.array(LUT)); print('curva guardada en', os.environ['GUARDAR_LUT'])
    pred = aplicar(rb).reshape(-1, 3)
else:
    pred = np.c_[rb.reshape(-1, 3), np.ones(h2 * w2, np.float32)] @ M
resid = (fb - pred.reshape(h2, w2, 3)) * valido[..., None]
pv = cv2.GaussianBlur(valido.astype(np.float32), (0, 0), 45)
brillo = cv2.GaussianBlur(resid, (0, 0), 45) / np.maximum(pv, 1e-3)[..., None]
brillo[pv < 0.05] = 0
brillo_grande = cv2.resize(brillo.astype(np.float32), (RW, RH), interpolation=cv2.INTER_CUBIC)
err = np.abs(fb - pred.reshape(h2, w2, 3))[valido].mean()
print('mezcla de color (BGR):\n', np.round(M, 3), f'\nerror medio después del color: {err * 255:.1f} de 255')

def camara(img):  # foto de la app (BGR, uint8, tamaño de la referencia) → como la ve la cámara
    x = img.astype(np.float32) / 255
    y = (aplicar(x) if CURVA else (np.c_[x.reshape(-1, 3), np.ones(RW * RH, np.float32)] @ M).reshape(RH, RW, 3)) + brillo_grande
    return np.clip(y, 0, 1).astype(np.float32)

# desenfoque de la cámara: el que deja la referencia (ya con color) más parecida al cuadro filmado
gris = lambda a: cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
ref_cam = camara(ref)
mask0 = cv2.warpPerspective(np.ones((RH, RW), np.uint8) * 255, Hs[0], (W, H), flags=cv2.INTER_NEAREST)
mask0 = cv2.erode(mask0, np.ones((25, 25), np.uint8)) > 0
w_ref0 = cv2.warpPerspective(ref_cam, Hs[0], (W, H), flags=cv2.INTER_AREA)
real0 = cuadros[0].astype(np.float32) / 255
mejor = None
for s in [0.6, 1.0, 1.4, 1.8, 2.4, 3.0]:
    e = np.abs(gris(cv2.GaussianBlur(w_ref0, (0, 0), s)) - gris(real0))[mask0].mean()
    if mejor is None or e < mejor[1]: mejor = (s, e)
SIG = mejor[0]
print(f'desenfoque de la cámara: {SIG} px')
ruido = float(np.std(gris(real0)[mask0] - gris(cv2.GaussianBlur(real0, (0, 0), 1.5))[mask0]))

# 4. armar cada cuadro
fotos = sorted(glob.glob(os.path.join(app_dir, os.environ.get('FOTOS', 'ehoy-*.png'))))
cache = {}
def foto_app(j):
    if j not in cache:
        im = cv2.imread(fotos[j])
        if im.shape[:2] != (RH, RW): im = cv2.resize(im, (RW, RH), interpolation=cv2.INTER_AREA)
        cache[j] = camara(im)
    return cache[j]
# el recorte de salida: vertical 9:16 al centro (como hf-pov.mjs) o, con CUADRO=1, un cuadrado (el formato de la referencia
# oct10/ref5) centrado en la pantalla; LADO=<px de la toma> lo hace más chico (más cerca) y CENTRO="x,y" lo mueve
if os.environ.get('CUADRO') == '1':
    lado = int(os.environ.get('LADO', min(W, H)))
    cx, cy = (map(float, os.environ['CENTRO'].split(','))) if os.environ.get('CENTRO') else cv2.perspectiveTransform(np.float32([[[RW / 2, RH / 2]]]), Hs[0]).reshape(2)
    cx += float(os.environ.get('CENTRO_DX', 0)); cy += float(os.environ.get('CENTRO_DY', 0))   # mover el recorte desde el centro de la pantalla
    x0 = int(np.clip(cx - lado / 2, 0, W - lado)); y0 = int(np.clip(cy - lado / 2, 0, H - lado))
    rec, cw, ch, sal_w, sal_h = f'crop={lado}:{lado}:{x0}:{y0},scale=1080:1080', lado, lado, 1080, 1080
else:
    x0, y0 = 0, (H - W * 16 // 9) // 2
    rec, cw, ch, sal_w, sal_h = f'crop={W}:{W * 16 // 9}:0:{y0},scale=1080:1920', W, W * 16 // 9, 1080, 1920
print('recorte:', rec)
os.makedirs(os.path.dirname(os.path.abspath(salida)), exist_ok=True)
enc = subprocess.Popen([f'{FF}/ffmpeg.exe', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                        '-vf', f'{rec}:flags=lanczos,setsar=1', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', salida], stdin=subprocess.PIPE)
rng = np.random.default_rng(7)
antes_despues = None
for i in range(N):
    j = int(np.clip((i / 30 - ARRANQUE) * FPS_APP, 0, len(fotos) - 1))
    app = cv2.warpPerspective(foto_app(j), Hs[i], (W, H), flags=cv2.INTER_AREA)
    # el resplandor que la cámara le hace a lo claro de una pantalla (las letras se ven con un halo azulado)
    claro = np.clip(app - 0.45, 0, 1)
    app = cv2.GaussianBlur(app, (0, 0), SIG) + cv2.GaussianBlur(claro, (0, 0), 7) * np.float32([0.9, 0.6, 0.45]) * 0.55
    # el grano, menos en lo negro (si no, al recortar lo negativo el negro sube y se nota el borde de la app pegada)
    app += rng.normal(0, ruido * 0.8, app.shape[:2]).astype(np.float32)[..., None] * np.clip(app.mean(2, keepdims=True) * 6, 0, 1)
    m = cv2.warpPerspective(np.ones((RH, RW), np.float32), Hs[i], (W, H), flags=cv2.INTER_LINEAR)
    m = cv2.GaussianBlur(m, (0, 0), 1.2)[..., None]
    real = cuadros[i].astype(np.float32) / 255
    out = (np.clip(app, 0, 1) * m + real * (1 - m)) * 255
    out = out.astype(np.uint8)
    enc.stdin.write(out.tobytes())
    if i == min(N - 1, int((ARRANQUE + 1.2) * 30)):
        a = cv2.resize(cuadros[i][y0:y0 + ch, x0:x0 + cw], (sal_w // 2, sal_h // 2)); d = cv2.resize(out[y0:y0 + ch, x0:x0 + cw], (sal_w // 2, sal_h // 2))
        antes_despues = np.hstack([a, np.full((sal_h // 2, 12, 3), 255, np.uint8), d])
enc.stdin.close(); enc.wait()
cv2.imwrite(os.path.splitext(salida)[0] + '-antes-despues.jpg', antes_despues, [cv2.IMWRITE_JPEG_QUALITY, 90])
print('listo:', salida)
