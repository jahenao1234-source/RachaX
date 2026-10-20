# POV 2 (15 oct de 2026): las tomas nuevas de Johnatan (otro computador, navegador de 1440 × 900, cuarto oscuro, 62 tomas
# horizontales) con la app llenándose DENTRO de su pantalla, cortadas como la referencia (oct10/ref5): cada pantalla se
# llena en una sola animación seguida y esa animación se reparte entre dos o tres ángulos, un corte en cada golpe.
# Cada corte sale en un cuadrado de 1080 × 1080 (pov2/cortes/NN-<nombre>.mp4) con pantalla-reemplazo.py.
# Uso: python design/herramientas/pov2-cortes.py [nombre de una pantalla para rehacer solo esa]
import os, sys, glob, json, subprocess
import numpy as np, cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(AQUI, '..', 'anuncios', 'campana', 'pov2')
DL = os.path.join(P, 'tomas')        # las 62 tomas; antes en Descargas, desde el 20 oct viven aquí
GOLPE = 60 / 91                       # "Midnight Minor", 91 golpes por minuto
FPS = 30

def mezcla_progreso():
    # Tu año desde marzo (arriba) y las barras de "Dónde puedes mejorar" a la par (abajo, grabadas desde hace 40 días)
    a = sorted(glob.glob(os.path.join(P, 'prog-marzo', 'eprog-*.png'))); b = sorted(glob.glob(os.path.join(P, 'prog-barras', 'eprog-*.png')))
    corte = json.load(open(os.path.join(P, 'prog-corte.json')))['fila']
    sal = os.path.join(P, 'prog-mezcla'); os.makedirs(sal, exist_ok=True)
    for i, (x, y) in enumerate(zip(a, b)):
        f = os.path.join(sal, f'prog-{i:02d}.png')
        if not os.path.exists(f):
            im = cv2.imread(x); im2 = cv2.imread(y); im[corte:] = im2[corte:]; cv2.imwrite(f, im)
    return sorted(glob.glob(os.path.join(sal, 'prog-*.png')))

# las pantallas: fotos clave (en orden), referencia (la muestra como él la grabó) y los cortes (toma, desde, golpes, ajustes)
PANTALLAS = [
    {'nombre': 'hoy', 'fundido': 'corto', 'claves': lambda: sorted(glob.glob(os.path.join(P, 'hoy-cerrado', 'hoy-*.png'))), 'ref': 'ref-cerrado/ref-hoy-0000.png',
     'cortes': [('VID_20261015_173731896.mp4', 3.3, 2, {'LADO': 1350}), ('VID_20261015_174323446.mp4', 0.8, 2, {}), ('VID_20261015_175723206.mp4', 12.5, 2, {'ref': 'hoy-cerrado/hoy-08.png'})]},
    {'nombre': 'tareas', 'fundido': 'duro', 'claves': lambda: sorted(glob.glob(os.path.join(P, 'tareas-pasaporte', 'tareas-*.png'))), 'ref': 'ref-abierto/ref-tareas-0000.png',
     'cortes': [('VID_20261015_180442560.mp4', 2.7, 2, {}), ('VID_20261015_180419680.mp4', 2.5, 2, {'LADO': 1250})]},
    {'nombre': 'semana', 'fundido': 'duro', 'claves': lambda: sorted(glob.glob(os.path.join(P, 'semana-c453', 'semana-*.png'))), 'ref': 'ref-cerrado/ref-tu-semana-0453.png',
     'cortes': [('VID_20261015_173843970.mp4', 12.3, 2, {'LADO': 1350, 'CENTRO_DY': -200}), ('VID_20261015_174218439.mp4', 11.7, 2, {})]},
    {'nombre': 'progreso', 'claves': mezcla_progreso, 'ref': 'ref-abierto/ref-prog-0765.png',
     'cortes': [('VID_20261015_175451473.mp4', 1.8, 2, {}), ('VID_20261015_175437452.mp4', 3.8, 2, {}), ('VID_20261015_174902888.mp4', 4.3, 2, {})]},
]

def animacion(claves, total, lead=0.05, cola=0.25, fundido='suave'):
    # una foto por cuadro: entre cada par de fotos clave, un fundido suave; arranca moviéndose y termina justo antes del corte
    ims = None; n = int(round(total * FPS)); K = len(claves)
    for i in range(n):
        t = i / FPS
        u = np.clip((t - lead) / max(total - lead - cola, 1e-3), 0, 1) * (K - 1)
        k = min(int(u), K - 2); f = u - k
        # 'suave': fundido en todo el tramo (Progreso: la página no cambia de forma); 'corto': fundido de 0,1 s (Hoy);
        # 'duro': cambio de golpe a mitad del tramo (Tareas y Semana: los pasos se mueven y un fundido deja texto doble)
        if fundido == 'corto': f = np.clip((f - 0.45) / 0.1, 0, 1)
        elif fundido == 'duro': f = 1.0 if f >= 0.5 else 0.0
        f = f * f * (3 - 2 * f)
        yield k, f

def armar(pant, uno=None):
    claves = pant['claves']()
    cache = {}
    def img(k):
        if k not in cache: cache.clear(); cache[k] = cv2.imread(claves[k]).astype(np.float32)
        return cache[k]
    total = sum(c[2] for c in pant['cortes']) * GOLPE
    pasos = list(animacion(claves, total, fundido=pant.get('fundido', 'suave')))
    os.makedirs(os.path.join(P, 'cortes'), exist_ok=True)
    t0 = 0.0; salidas = []
    for j, (toma, desde, golpes, aj) in enumerate(pant['cortes']):
        dura = golpes * GOLPE
        a, b = int(round(t0 * FPS)), int(round((t0 + dura) * FPS))
        if uno is not None and j != uno: t0 += dura; continue
        car = os.path.join(P, 'tmp', f"{pant['nombre']}-{j}"); os.makedirs(car, exist_ok=True)
        for f in glob.glob(os.path.join(car, '*.jpg')): os.remove(f)
        for i in range(a, b + 3):
            k, f = pasos[min(i, len(pasos) - 1)]
            x = img(k) * (1 - f) + cv2.imread(claves[k + 1]).astype(np.float32) * f if f > 0.001 else img(k)
            cv2.imwrite(os.path.join(car, f'f-{i - a:03d}.jpg'), x.astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94])
        sal = os.path.join(P, 'cortes', f"{pant['nombre']}-{j}.mp4")
        # 'ref': otra referencia para ese corte (la del estado en que él grabó la toma; si no, el color se aprende mal)
        ref = aj.get('ref', pant['ref'])
        # el color: la curva que salió bien en la toma 2 (Hoy de frente), igual en todos los cortes; cada toma solo ajusta la exposición
        lut = os.path.join(P, 'curva-color.npz')
        color = {'COLOR': 'curva', 'GUARDAR_LUT': lut} if not os.path.exists(lut) else {'COLOR': 'fijo', 'LUT_DE': lut}
        env = dict(os.environ, HORIZONTAL='1', CUADRO='1', FOTOS='f-*.jpg', **color, **{k: str(v) for k, v in aj.items() if k != 'ref'})
        r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(AQUI, 'pantalla-reemplazo.py'), os.path.join(DL, toma), str(desde), f'{dura + 0.1:.3f}',
                            os.path.join(P, ref), car, sal, str(FPS), '0'], env=env, capture_output=True, text=True)
        resumen = [l for l in r.stdout.splitlines() if any(w in l for w in ('calzan', 'salto', 'error medio', 'recorte', 'listo'))]
        print(pant['nombre'], j, toma, '·', ' | '.join(resumen), r.stderr[-400:] if r.returncode else '', flush=True)
        salidas.append(sal); t0 += dura
    return salidas

solo = sys.argv[1] if len(sys.argv) > 1 else None
uno = int(sys.argv[2]) if len(sys.argv) > 2 else None   # rehacer solo ese corte
for pant in PANTALLAS:
    if solo and pant['nombre'] != solo: continue
    armar(pant, uno)
