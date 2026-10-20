# Pone una captura real de la app dentro del celular de una imagen generada (Higgsfield, Ideogram...), cuando la IA
# dejó la pantalla en blanco. Busca la mancha blanca MÁS GRANDE (así no se confunde con letras blancas), saca sus
# cuatro esquinas, deforma la captura a esa forma y la pega solo donde había blanco (respeta las esquinas redondas).
# Uso: python design/herramientas/pantalla-en-imagen.py <imagen> <captura> <salida> [recorte_arriba_px]
#   recorte_arriba_px: quita ese alto de la parte de arriba de la captura (para mostrar lo importante)
import sys
import cv2
import numpy as np

img_p, cap_p, sal_p = sys.argv[1], sys.argv[2], sys.argv[3]
arriba = int(sys.argv[4]) if len(sys.argv) > 4 else 0
img = cv2.imread(img_p)
cap = cv2.imread(cap_p)[arriba:]

gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, blanco = cv2.threshold(gris, 215, 255, cv2.THRESH_BINARY)
blanco = cv2.morphologyEx(blanco, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
n, etiquetas, datos, _ = cv2.connectedComponentsWithStats(blanco)
mayor = 1 + int(np.argmax(datos[1:, cv2.CC_STAT_AREA]))
masc = np.where(etiquetas == mayor, 255, 0).astype(np.uint8)
# rellena huecos (reflejos) dentro de la pantalla
cont, _ = cv2.findContours(masc, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
c = max(cont, key=cv2.contourArea)
masc = np.zeros_like(masc); cv2.drawContours(masc, [c], -1, 255, -1)

# cuatro esquinas: se simplifica el contorno convexo hasta que quede de 4 lados (las esquinas redondas se vuelven rectas)
hull = cv2.convexHull(c)
peri = cv2.arcLength(hull, True)
for f in np.linspace(0.005, 0.1, 60):
    ap = cv2.approxPolyDP(hull, f * peri, True)
    if len(ap) <= 4: break
if len(ap) != 4:
    ap = cv2.boxPoints(cv2.minAreaRect(c))
ap = ap.reshape(-1, 2).astype(np.float32)
# ordenadas: arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda
centro = ap.mean(0)
ang = np.arctan2(ap[:, 1] - centro[1], ap[:, 0] - centro[0])
ap = ap[np.argsort(ang)]  # empieza en la de arriba a la izquierda (ángulo más negativo)
arr = ap[np.argsort(ap[:, 1])[:2]]; abj = ap[np.argsort(ap[:, 1])[2:]]
esq = np.array([arr[np.argmin(arr[:, 0])], arr[np.argmax(arr[:, 0])], abj[np.argmax(abj[:, 0])], abj[np.argmin(abj[:, 0])]], np.float32)
# las esquinas redondas dejan el cuadrilátero un poco adentro: se agranda hacia afuera
x, y, w, h = cv2.boundingRect(c)
print(f'Pantalla: caja x={x} y={y} ancho={w} alto={h}; esquinas={esq.round().tolist()}')

ch, cw = cap.shape[:2]
# la captura se recorta a la proporción REAL de la pantalla de un celular (ancho / alto ≈ 0,46), no a la que se ve:
# si el celular está girado en 3D se ve más angosto, y la perspectiva ya lo encoge
prop = float(__import__('os').environ.get('PROPORCION', '0.462'))
if cw / ch > prop:
    nw = int(ch * prop); x0 = (cw - nw) // 2; cap = cap[:, x0:x0 + nw]
else:
    cap = cap[:int(cw / prop)]
ch, cw = cap.shape[:2]
# un poco más grande que la mancha para que no quede borde blanco; la máscara recorta lo que sobra
esq_g = esq.mean(0) + (esq - esq.mean(0)) * 1.03
M = cv2.getPerspectiveTransform(np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]]), esq_g)
puesta = cv2.warpPerspective(cap, M, (img.shape[1], img.shape[0]), flags=cv2.INTER_CUBIC)
m = cv2.GaussianBlur(cv2.dilate(masc, np.ones((3, 3), np.uint8)), (3, 3), 0).astype(np.float32)[..., None] / 255
out = (img * (1 - m) + puesta * m).astype(np.uint8)
cv2.imwrite(sal_p, out)
print('Listo:', sal_p)
