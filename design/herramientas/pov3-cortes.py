# POV 3 (20 oct de 2026): la app DENTRO de las tomas del portátil de Johnatan, pero esta vez UNA ventana distinta por toma
# ("tomes diferentes planos pero no la misma ventana") y fluida ("que cuando se rellene sea fluido, sin tanto lagg"):
#   Hoy, Tareas y Foco se grabaron EN MOVIMIENTO con grabar-vivo.cjs (cuadros a 30 por segundo);
#   la semana (7 fotos), el radar (45) y Tu año (51) van con fundidos entre fotos.
# Cada corte sale en un cuadrado de 1080 × 1080 (pov3/cortes/<nombre>.mp4) con pantalla-reemplazo.py.
# Uso: python design/herramientas/pov3-cortes.py [nombre para rehacer solo ese]
import os, sys, glob, subprocess
import numpy as np, cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(AQUI, '..', 'anuncios', 'campana')
P2 = os.path.join(C, 'pov2'); P3 = os.path.join(C, 'pov3'); APP = os.path.join(P3, 'app')
DL = os.path.join(P2, 'tomas')                 # las 62 tomas del 15 oct (copiadas aquí; Descargas se vació)
G = 60 / 91; FPS = 30

def vivo(carpeta, hasta=None):
    fs = sorted(glob.glob(os.path.join(APP, carpeta, 'f-*.jpg')))
    return fs[:hasta] if hasta else fs

def foco_sin_final():
    # el pomodoro corre hasta casi el final; se corta antes de la pantalla "Terminó tu pomodoro"
    fs = vivo('foco'); prev = None
    for i, f in enumerate(fs):
        im = cv2.resize(cv2.imread(f, cv2.IMREAD_GRAYSCALE), (360, 225)).astype(np.float32)
        if prev is not None and np.abs(im - prev).mean() > 12: return fs[:i - 1]
        prev = im
    return fs

# nombre · de dónde salen los cuadros · 'vivo' (ya son cuadros) o fundido entre fotos · toma, desde, golpes y ajustes · referencia
CORTES = [
    {'nombre': 'hoy', 'vivo': lambda: vivo('hoy'), 'toma': ('VID_20261015_173731896.mp4', 3.3, 2, {'LADO': 1350}), 'ref': 'ref-cerrado/ref-hoy-0000.png'},
    {'nombre': 'tareas', 'vivo': lambda: vivo('tareas'), 'toma': ('VID_20261015_180442560.mp4', 2.7, 2, {}), 'ref': 'ref-abierto/ref-tareas-0000.png'},
    {'nombre': 'foco', 'vivo': foco_sin_final, 'toma': ('VID_20261015_174323446.mp4', 0.8, 2, {}), 'ref': 'ref-cerrado/ref-hoy-0000.png'},
    {'nombre': 'semana', 'fotos': lambda: sorted(glob.glob(os.path.join(P2, 'semana-c453', 'semana-*.png'))), 'fundido': 'corto',
     'toma': ('VID_20261015_173843970.mp4', 12.3, 2, {'LADO': 1350, 'CENTRO_DY': -200}), 'ref': 'ref-cerrado/ref-tu-semana-0453.png'},
    {'nombre': 'radar', 'fotos': lambda: sorted(glob.glob(os.path.join(APP, 'radar', 'eprog-*.png')))[:-1], 'fundido': 'suave',
     'toma': ('VID_20261015_175437452.mp4', 3.8, 3, {}), 'ref': 'ref-abierto/ref-prog-0765.png'},
    {'nombre': 'anio', 'fotos': lambda: sorted(glob.glob(os.path.join(P2, 'prog-mezcla', 'prog-*.png'))), 'fundido': 'suave',
     'toma': ('VID_20261015_175451473.mp4', 1.8, 3, {}), 'ref': 'ref-abierto/ref-prog-0765.png'},
]

def cuadros_de(c, n):
    """Los n cuadros de la app para un corte: si es 'vivo', se reparten los cuadros grabados; si son fotos, fundidos."""
    if 'vivo' in c:
        fs = c['vivo']()
        for i in range(n):
            yield cv2.imread(fs[min(len(fs) - 1, int(round(i * (len(fs) - 1) / max(n - 1, 1))))])
        return
    fs = c['fotos'](); K = len(fs); cache = {}
    def img(k):
        if k not in cache:
            if len(cache) > 4: cache.clear()
            cache[k] = cv2.imread(fs[k]).astype(np.float32)
        return cache[k]
    lead, cola = 0.04, 0.12
    for i in range(n):
        t = i / FPS; total = n / FPS
        u = np.clip((t - lead) / max(total - lead - cola, 1e-3), 0, 1) * (K - 1)
        k = min(int(u), K - 2); f = u - k
        # 'corto': cambio casi de golpe, con un fundido de 3 cuadros (la semana: los pasos cambian de lugar)
        if c.get('fundido') == 'corto': f = np.clip((f - 0.4) / 0.2, 0, 1)
        f = f * f * (3 - 2 * f)
        yield (img(k) * (1 - f) + img(k + 1) * f).astype(np.uint8) if f > 0.001 else img(k).astype(np.uint8)

solo = sys.argv[1] if len(sys.argv) > 1 else None
os.makedirs(os.path.join(P3, 'cortes'), exist_ok=True)
lut = os.path.join(P2, 'curva-color.npz')
for c in CORTES:
    if solo and c['nombre'] != solo: continue
    toma, desde, golpes, aj = c['toma']; dura = golpes * G; n = int(round((dura + 0.1) * FPS))
    car = os.path.join(P3, 'tmp', c['nombre']); os.makedirs(car, exist_ok=True)
    for f in glob.glob(os.path.join(car, '*.jpg')): os.remove(f)
    for i, im in enumerate(cuadros_de(c, n)):
        cv2.imwrite(os.path.join(car, f'f-{i:03d}.jpg'), im, [cv2.IMWRITE_JPEG_QUALITY, 94])
    sal = os.path.join(P3, 'cortes', f"{c['nombre']}.mp4")
    env = dict(os.environ, HORIZONTAL='1', CUADRO='1', FOTOS='f-*.jpg', COLOR='fijo', LUT_DE=lut, **{k: str(v) for k, v in aj.items()})
    r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(AQUI, 'pantalla-reemplazo.py'), os.path.join(DL, toma), str(desde), f'{dura + 0.1:.3f}',
                        os.path.join(P2, c['ref']), car, sal, str(FPS), '0'], env=env, capture_output=True, text=True)
    resumen = [l for l in r.stdout.splitlines() if any(w in l for w in ('calzan', 'salto', 'error medio', 'recorte', 'listo'))]
    print(c['nombre'], toma, '·', ' | '.join(resumen), r.stderr[-600:] if r.returncode else '', flush=True)
