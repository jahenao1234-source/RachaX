# Arma la página final (public/conoce.html) a partir de la maqueta aprobada (design/pagina-ventas/index.html).
import io, re, shutil, os

RAIZ = r'C:/Users/jahen/RachaX/RachaX'
src = io.open(RAIZ + '/design/pagina-ventas/index.html', encoding='utf-8').read()
s = src

def cambiar(a, b, n=1):
    global s
    assert s.count(a) >= 1, 'no encontré: ' + a[:60]
    s = s.replace(a, b) if n == 0 else s.replace(a, b, n)

# 1) Letras propias (sin Google), canónica e imagen para compartir
cambiar('''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet">''',
'''<link rel="canonical" href="https://www.tengoracha.com/conoce">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.tengoracha.com/conoce">
<meta property="og:title" content="Racha · Para que un día malo no te haga empezar de cero">
<meta property="og:description" content="Una app para sostener lo que empiezas: hábitos, tareas y foco. Un solo pago, acceso vitalicio y 7 días para probarla.">
<meta property="og:image" content="https://www.tengoracha.com/ventas/compartir.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/fuentes/barlow-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>''')

cambiar('''<style>
/* MAQUETA de la página de ventas de Racha (19 oct 2026). Inspirada en rimuapp.com y en piezas de 21st.dev:
   portada con la app en una pantalla que se endereza al bajar (container scroll), Tu año en cuadritos (activity heatmap),
   cuadros de funciones (bento) y precio. Siempre oscura: es una pieza de venta, no la app. */''',
'''<style>
/* Racha · página de ventas (tengoracha.com/conoce). Sale de la maqueta design/pagina-ventas/index.html (19 oct 2026),
   inspirada en rimuapp.com y en piezas de 21st.dev. Página suelta, sin la app y sin nada de terceros:
   letras en /fuentes, video, fotos y Motion en /ventas. Siempre oscura: es una pieza de venta, no la app. */
@font-face{font-family:'Barlow';font-weight:300;font-display:swap;src:url('/fuentes/barlow-latin-300-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow';font-weight:400;font-display:swap;src:url('/fuentes/barlow-latin-400-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow';font-weight:500;font-display:swap;src:url('/fuentes/barlow-latin-500-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow';font-weight:600;font-display:swap;src:url('/fuentes/barlow-latin-600-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow';font-weight:700;font-display:swap;src:url('/fuentes/barlow-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'Barlow Condensed';font-weight:700;font-display:swap;src:url('/fuentes/barlow-condensed-latin-700-normal.woff2') format('woff2')}''')

# 2) Rutas de los archivos
s = s.replace('src="assets/', 'src="/ventas/').replace('href="assets/', 'href="/ventas/').replace('poster="assets/', 'poster="/ventas/')
assert 'assets/' not in s, 'quedó una ruta assets/'

# 3) Quitar lo que era solo de la maqueta
cambiar('''/* Marcas de maqueta: textos nuevos sin aprobar */
.nuevo{outline:1px dashed rgba(142,155,255,.55);outline-offset:4px;border-radius:4px}
.sin-marcas .nuevo{outline:0}
.interruptor{position:fixed;left:12px;bottom:12px;z-index:50;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:999px;background:#1F2233;border:1px solid #2C3254;color:var(--comodin);font:600 13px 'Barlow',sans-serif;cursor:pointer}
''', '')
cambiar('''<button class="interruptor" id="interruptor" type="button" aria-pressed="true">Marcas de textos nuevos: sí</button>
''', '')
cambiar('''  // Marcas de textos nuevos (solo para la maqueta)
  const sw = document.getElementById('interruptor');
  sw.addEventListener('click', () => {
    const on = document.body.classList.toggle('sin-marcas');
    sw.setAttribute('aria-pressed', String(!on));
    sw.textContent = 'Marcas de textos nuevos: ' + (on ? 'no' : 'sí');
  });
''', '')
s = re.sub(r'\s*\bnuevo\b(?=[^"]*")', '', s)            # quitar la clase "nuevo" de los class="..."
s = s.replace(' class=""', '')
assert 'nuevo' not in s.split('<body>')[1].replace('Hoy cada hábito vale el doble', ''), 'quedó "nuevo"'

# 4) El botón de comprar: por ahora va al mensaje directo de Instagram (falta el número de WhatsApp)
cambiar('<a class="boton" href="https://wa.me/57XXXXXXXXXX?text=Hola%2C%20quiero%20Racha" data-falta="numero">Quiero Racha</a>',
        '<!-- CUANDO HAYA NÚMERO DE WHATSAPP: cambiar este href por https://wa.me/57NUMERO?text=Hola%2C%20quiero%20Racha (dispara el mensaje 1d) -->\n          <a class="boton" href="https://ig.me/m/minisoluciones.app" rel="noopener">Quiero Racha</a>')

# 5) Enlaces del mismo sitio
s = s.replace('href="https://www.tengoracha.com/terminos"', 'href="/terminos"').replace('href="https://www.tengoracha.com/privacidad"', 'href="/privacidad"').replace('class="entrar" href="https://www.tengoracha.com"', 'class="entrar" href="/"')

io.open(RAIZ + '/public/conoce.html', 'w', encoding='utf-8', newline='\n').write(s)

# 6) Archivos en public/ventas
dst = RAIZ + '/public/ventas'
os.makedirs(dst, exist_ok=True)
for f in os.listdir(RAIZ + '/design/pagina-ventas/assets'):
    shutil.copy2(RAIZ + '/design/pagina-ventas/assets/' + f, dst + '/' + f)
print('ok', len(s), sorted(os.listdir(dst)))
