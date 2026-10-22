# Arma la página final (public/conoce.html) a partir de la maqueta aprobada (design/pagina-ventas/index.html).
# Desde el 22 oct 2026 la maqueta aprobada es la v3 (rediseño completo). La v1 queda en design/pagina-ventas/v1.html.
import io, re, shutil, os

RAIZ = r'C:/Users/jahen/RachaX/RachaX'
s = io.open(RAIZ + '/design/pagina-ventas/index.html', encoding='utf-8').read()

TITULO = 'Racha · Fallar un día no borra lo que llevas'
DESCRIPCION = 'La app de hábitos, tareas y foco hecha para el día que fallas. Un solo pago de $37.900, acceso vitalicio y 7 días para probarla.'
# Mientras no haya número de WhatsApp, los botones de comprar van al mensaje directo de Instagram.
# CUANDO HAYA NÚMERO: poner aquí https://wa.me/57NUMERO?text=Hola%2C%20quiero%20Racha (dispara el mensaje 1d)
# y cambiar en la maqueta el texto "Se abre el chat de Instagram" por "Se abre el chat de WhatsApp".
CHAT = 'https://ig.me/m/minisoluciones.app'

def cambiar(a, b):
    global s
    assert s.count(a) == 1, 'no encontré (o hay varias): ' + a[:70]
    s = s.replace(a, b)

# 1) Letras propias (sin Google), canónica e imagen para compartir
cambiar('''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">''',
'''<link rel="canonical" href="https://www.tengoracha.com/conoce">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.tengoracha.com/conoce">
<meta property="og:title" content="''' + TITULO + '''">
<meta property="og:description" content="''' + DESCRIPCION + '''">
<meta property="og:image" content="https://www.tengoracha.com/ventas/compartir.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/fuentes/barlow-condensed-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fuentes/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>''')

cambiar('''<style>
/* MAQUETA v3 de la página de ventas (22 oct 2026): rediseño visual completo.''',
'''<style>
/* Racha · página de ventas (tengoracha.com/conoce). Sale de la maqueta design/pagina-ventas/index.html (v3, 22 oct 2026).
   Página suelta, sin la app y sin nada de terceros: letras en /fuentes, video, fotos y Motion en /ventas. */
@font-face{font-family:'Barlow';font-weight:400;font-display:swap;src:url('/fuentes/barlow-latin-400-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow';font-weight:500;font-display:swap;src:url('/fuentes/barlow-latin-500-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow';font-weight:600;font-display:swap;src:url('/fuentes/barlow-latin-600-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow';font-weight:700;font-display:swap;src:url('/fuentes/barlow-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow Condensed';font-weight:700;font-display:swap;src:url('/fuentes/barlow-condensed-latin-700-normal.woff2') format('woff2')}
/* Rediseño visual completo.''')

# 2) Rutas de los archivos
s = s.replace('src="assets/', 'src="/ventas/').replace('href="assets/', 'href="/ventas/').replace('poster="assets/', 'poster="/ventas/')
assert 'assets/' not in s, 'quedó una ruta assets/'

# 3) Los botones de comprar (precio, cierre y barra fija)
VIEJO = 'href="https://wa.me/57XXXXXXXXXX?text=Hola%2C%20quiero%20Racha" data-falta="numero"'
n = s.count(VIEJO)
assert n == 3, 'esperaba 3 botones de comprar, hay %d' % n
s = s.replace(VIEJO, 'href="' + CHAT + '" rel="noopener"')
assert 'wa.me/57XXXXXXXXXX' not in s

# 4) Enlaces del mismo sitio
s = s.replace('href="https://www.tengoracha.com/terminos"', 'href="/terminos"').replace('href="https://www.tengoracha.com/privacidad"', 'href="/privacidad"').replace('class="entrar" href="https://www.tengoracha.com"', 'class="entrar" href="/"')
assert 'fonts.googleapis' not in s and 'fonts.gstatic' not in s

io.open(RAIZ + '/public/conoce.html', 'w', encoding='utf-8', newline='\n').write(s)

# 5) Archivos en public/ventas (compartir.jpg se rehace aparte con pagina-ventas-compartir.cjs)
dst = RAIZ + '/public/ventas'
os.makedirs(dst, exist_ok=True)
for f in os.listdir(RAIZ + '/design/pagina-ventas/assets'):
    shutil.copy2(RAIZ + '/design/pagina-ventas/assets/' + f, dst + '/' + f)
print('ok', len(s), sorted(os.listdir(dst)))
