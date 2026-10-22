# Arma la MAQUETA v2 de la página de ventas (design/pagina-ventas/v2.html) a partir de la v1 aprobada
# (design/pagina-ventas/index.html). 22 oct 2026: "mejora nuestra página y optimízala para cerrar ventas".
# Lo aprobado queda igual; se agregan piezas para vender. Solo lo nuevo de la v2 lleva la marca punteada lila.
import io, re

RAIZ = r'C:/Users/jahen/RachaX/RachaX'
s = io.open(RAIZ + '/design/pagina-ventas/index.html', encoding='utf-8').read()

def cambiar(a, b):
    global s
    assert s.count(a) == 1, 'no encontré (o hay varias): ' + a[:70]
    s = s.replace(a, b)

# 0) Los textos de la v1 ya están aprobados ("constrúyela", 19 oct): se quitan sus marcas
cab, cuerpo = s.split('<body>', 1)
cuerpo = re.sub(r'(class="[^"]*?)\s*\bnuevo\b', r'\1', cuerpo).replace(' class=""', '')
s = cab + '<body>' + cuerpo

CHULO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
CHAT = 'https://wa.me/57XXXXXXXXXX?text=Hola%2C%20quiero%20Racha'  # el armador lo cambia por el chat de Instagram

# 1) CSS nuevo
cambiar('/* Marcas de maqueta: textos nuevos sin aprobar */', '''/* ===== v2: piezas para cerrar la venta ===== */
/* Precio en la portada */
.hero-precio{position:relative;margin:14px 0 0;color:var(--muted);font-size:15px}
.hero-precio b{color:var(--text);font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:20px;letter-spacing:.01em}

/* Si te pasa esto */
.dolores{list-style:none;margin:44px auto 0;padding:0;display:grid;gap:12px;max-width:980px}
@media (min-width:900px){.dolores{grid-template-columns:repeat(3,1fr);gap:14px}}
.dolores li{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:20px 20px 22px;display:flex;flex-direction:column;gap:6px}
.dolores .ico{margin-bottom:8px;color:var(--muted)}
.dolores b{font-size:19px;font-weight:600;line-height:1.25}
.dolores span:not(.ico){color:var(--muted);font-size:15px;line-height:1.5}
.puente{margin:36px auto 0;max-width:620px;text-align:center;font-size:20px;line-height:1.4;font-weight:500;text-wrap:balance}
.puente b{color:var(--ambar);font-weight:600}

/* Comparación: por tu cuenta y con Racha (como el "Us vs Them" de 21st) */
.compara{display:grid;gap:14px;margin:48px auto 0;max-width:980px}
@media (min-width:768px){.compara{grid-template-columns:1fr 1fr;gap:16px}}
.col{border-radius:var(--r);padding:22px 22px 10px;border:1px solid var(--line);background:var(--surface)}
.col.racha{background:linear-gradient(180deg,#1A1610,#121316 60%);border-color:#4A3A1E}
.col-tit{display:flex;align-items:center;gap:10px;margin:0 0 6px;font-weight:600;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.col.racha .col-tit{color:var(--ambar)}
.col-tit img{width:26px;height:26px;border-radius:7px}
.col ul{list-style:none;margin:0;padding:0}
.col li{display:flex;gap:12px;align-items:flex-start;padding:14px 0;font-size:16px;line-height:1.45;color:var(--muted)}
.col li+li{border-top:1px solid var(--line)}
.col.racha li{color:var(--text)}
.col li svg{flex:none;margin-top:3px}
.col.sola li svg{color:var(--dim)}
.col.racha li svg{color:var(--ambar)}

/* Precio: por día, recibo, cómo pagas y la garantía */
.por-dia{position:relative;margin:6px 0 0;color:var(--dim);font-size:14px}
.recibo{position:relative;margin:22px 0 0;padding:16px 16px 6px;border-radius:14px;background:var(--bg);border:1px dashed var(--line-2);text-align:left}
.recibo-tit{margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.recibo ul{list-style:none;margin:0;padding:0}
.recibo li{display:flex;align-items:baseline;gap:8px;padding:7px 0;font-size:15px}
.recibo li i{flex:1;border-bottom:1px dotted var(--line-2);transform:translateY(-4px);min-width:16px}
.recibo li b{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:20px;line-height:1;color:var(--ambar);font-variant-numeric:tabular-nums}
.precio .incluye{margin-top:18px;padding-top:0;border-top:0}
.pagas{position:relative;margin:12px 0 0;color:var(--muted);font-size:14px;line-height:1.45}
.pagas b{color:var(--text);font-weight:600}
.garantia-caja{position:relative;display:flex;gap:12px;align-items:flex-start;text-align:left;margin:18px 0 0;padding:14px;border-radius:14px;background:var(--lila-tint);border:1px solid #2C3254}
.garantia-caja svg{flex:none;color:var(--comodin);margin-top:2px}
.garantia-caja b{display:block;font-size:15px;color:var(--comodin)}
.garantia-caja span{display:block;color:var(--muted);font-size:14px;line-height:1.45;margin-top:2px}

/* Cierre */
.cierre-precio{position:relative;margin:14px 0 0;color:var(--muted);font-size:15px}

/* Barra de compra fija abajo, solo en el celular */
.compra-fija{position:fixed;left:0;right:0;bottom:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(17,19,22,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line-2);transform:translateY(110%);visibility:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),visibility 0s linear .35s}
.compra-fija.ver{transform:none;visibility:visible;transition:transform .35s cubic-bezier(.22,1,.36,1)}
.compra-fija b{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;line-height:1}
.compra-fija span{display:block;color:var(--muted);font-size:12px;margin-top:3px}
.compra-fija .boton{flex:none}
@media (min-width:768px){.compra-fija{display:none}}
@media (max-width:767px){footer{padding-bottom:112px}}
@media (prefers-reduced-motion:reduce){.compra-fija,.compra-fija.ver{transform:none;opacity:0;transition:opacity .25s,visibility 0s linear .25s}.compra-fija.ver{opacity:1;transition:opacity .25s}}

/* Marcas de maqueta: textos nuevos sin aprobar */''')
# el interruptor de marcas no debe chocar con la barra fija
cambiar('.interruptor{position:fixed;left:12px;bottom:12px;', '.interruptor{position:fixed;left:12px;bottom:96px;')

# 2) Portada: el precio a la vista desde el primer segundo
cambiar('''        <a class="boton" href="#oferta">Quiero Racha</a>
      </div>
      <div class="raya"''', '''        <a class="boton" href="#oferta">Quiero Racha</a>
      </div>
      <p class="hero-precio aparece nuevo"><b>$37.900</b> · un solo pago</p>
      <div class="raya"''')

# 3) Sección nueva después de la portada: "Si te pasa esto"
cambiar('''  <!-- 2. POR QUÉ LLEVAR LA CUENTA: Tu año -->''', '''  <!-- 1b. NUEVO v2: SI TE PASA ESTO -->
  <section class="seccion" id="te-pasa">
    <div class="env centro">
      <p class="cejilla aparece nuevo">Si te pasa esto</p>
      <h2 class="t2 aparece nuevo">Empiezas el lunes con todo. <b>El jueves ya lo soltaste.</b></h2>
    </div>
    <div class="env">
      <ul class="dolores">
        <li class="aparece"><span class="ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4"/></svg></span><b class="nuevo">Fallas un día y botas todo.</b><span class="nuevo">Te saltaste el miércoles y sientes que la semana ya se perdió. Lo dejas para el lunes.</span></li>
        <li class="aparece"><span class="ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg></span><b class="nuevo">Pagas cosas y las dejas a las tres semanas.</b><span class="nuevo">Sigues pagando el gimnasio al que dejaste de ir hace un mes.</span></li>
        <li class="aparece"><span class="ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><b class="nuevo">Tienes algo aplazado hace meses.</b><span class="nuevo">Sabes que tienes que hacerlo, pero es tan grande que no sabes por dónde arrancar.</span></li>
      </ul>
      <p class="puente aparece nuevo">Racha está hecha para ese día: <b>el día en que normalmente lo sueltas.</b></p>
    </div>
  </section>

  <!-- 2. POR QUÉ LLEVAR LA CUENTA: Tu año -->''')

# 4) Sección nueva después de la regla: la comparación
cambiar('''  <!-- 5. PANTALLAS REALES -->''', '''  <!-- 4b. NUEVO v2: LA DIFERENCIA -->
  <section class="seccion" id="diferencia" style="padding-top:0">
    <div class="env centro">
      <p class="cejilla aparece nuevo">La diferencia</p>
      <h2 class="t2 aparece nuevo">Cuando fallas un día, <b>¿qué pasa después?</b></h2>
    </div>
    <div class="env">
      <div class="compara aparece">
        <div class="col sola">
          <p class="col-tit nuevo">Por tu cuenta</p>
          <ul>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14"/></svg><span class="nuevo">Sientes que perdiste todo y lo dejas para el lunes.</span></li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14"/></svg><span class="nuevo">Un día sin ganas no haces nada, porque o es completo o no cuenta.</span></li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14"/></svg><span class="nuevo">Lo aplazado sigue anotado en un renglón que nunca empiezas.</span></li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14"/></svg><span class="nuevo">Después de varios días sin cumplir, te da pena volver.</span></li>
          </ul>
        </div>
        <div class="col racha">
          <p class="col-tit nuevo"><img src="assets/icono.svg" alt="">Con Racha</p>
          <ul>
            <li>''' + CHULO + '''<span class="nuevo">Usas un comodín o haces lo mínimo, y tu racha sigue.</span></li>
            <li>''' + CHULO + '''<span class="nuevo">Haces la versión pequeña del hábito, y ese día cuenta.</span></li>
            <li>''' + CHULO + '''<span class="nuevo">Lo partes en pasos y hoy haces solo el primero.</span></li>
            <li>''' + CHULO + '''<span class="nuevo">Vuelves, y ese día cada hábito vale el doble.</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- 5. PANTALLAS REALES -->''')

# 5) La tarjeta del precio: por día, recibo con cantidades, cómo pagas y la garantía a la vista
cambiar('''          <p class="unico">Un solo pago, sin mensualidades.</p>
          <ul class="incluye">
            <li>''' + CHULO + '''Acceso vitalicio: no se vence ni hay que renovarlo</li>
            <li>''' + CHULO + '''<span>En tu celular y en tu computador</span></li>
            <li>''' + CHULO + '''La app y los cinco regalos</li>
            <li>''' + CHULO + '''7 días para probarla</li>
          </ul>
          <a class="boton" href="''' + CHAT + '''" data-falta="numero">Quiero Racha</a>
          <p class="garantia">Si no te convence en 7 días, te devolvemos todo el dinero.</p>''',
'''          <p class="unico">Un solo pago, sin mensualidades.</p>
          <p class="por-dia nuevo">Son menos de $105 al día el primer año, y no vuelves a pagar.</p>
          <div class="recibo">
            <p class="recibo-tit nuevo">Lo que te llevas</p>
            <ul>
              <li><span class="nuevo">La app Racha, acceso vitalicio</span><i></i><b>1</b></li>
              <li><span class="nuevo">Guías para leer</span><i></i><b>2</b></li>
              <li><span class="nuevo">Rutinas ya armadas</span><i></i><b>6</b></li>
              <li><span class="nuevo">Tareas partidas en pasos</span><i></i><b>18</b></li>
              <li><span class="nuevo">Planes de 30 días</span><i></i><b>5</b></li>
            </ul>
          </div>
          <ul class="incluye">
            <li>''' + CHULO + '''Acceso vitalicio: no se vence ni hay que renovarlo</li>
            <li>''' + CHULO + '''<span>En tu celular y en tu computador</span></li>
          </ul>
          <a class="boton" href="''' + CHAT + '''" data-falta="numero">Quiero Racha</a>
          <!-- Mientras el botón lleve a Instagram. Con WhatsApp: "Se abre el chat de WhatsApp…" -->
          <p class="pagas nuevo">Se abre el chat de Instagram. Ahí te mostramos la app por dentro y te pasamos cómo pagar.</p>
          <p class="pagas nuevo">Pagas por <b>Bre-B</b> desde Nequi, Daviplata o tu banco. No necesitas tarjeta.</p>
          <div class="garantia-caja">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <div><b>7 días para probarla</b><span>Si no te convence, te devolvemos todo el dinero. No tienes que dar explicaciones.</span></div>
          </div>''')

# 6) Dos preguntas nuevas, después de la del pago
cambiar('''No hay mensualidades ni cobros después.</p></details>''', '''No hay mensualidades ni cobros después.</p></details>
        <details><summary><span class="nuevo">¿Por qué pagar si hay apps de hábitos gratis?</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary><p class="nuevo">Porque Racha está hecha para el día que fallas: cada hábito tiene su versión mínima, tienes comodines, las tareas se parten en pasos y viene con el Método Anti-Abandono. Además no tiene anuncios y la pagas una sola vez.</p></details>
        <details><summary><span class="nuevo">¿Necesito tarjeta para pagar?</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary><p class="nuevo">No. Pagas por Bre-B desde Nequi, Daviplata o la app de tu banco, como cualquier transferencia.</p></details>''')

# 7) Cierre: el botón lleva directo al chat y repite el precio
cambiar('''      <a class="boton aparece" href="#oferta">Quiero Racha</a>
    </div>
  </section>
</main>''', '''      <a class="boton aparece" href="''' + CHAT + '''" data-falta="numero">Quiero Racha</a>
      <p class="cierre-precio aparece nuevo">$37.900 · un solo pago · 7 días para probarla</p>
    </div>
  </section>
</main>

<!-- NUEVO v2: barra de compra fija abajo, solo en el celular. Sale al pasar la portada y se esconde junto al precio y al final -->
<div class="compra-fija nuevo" id="compra-fija">
  <div><b>$37.900</b><span>Un solo pago · 7 días para probarla</span></div>
  <a class="boton chico" href="''' + CHAT + '''" data-falta="numero" tabindex="-1">Quiero Racha</a>
</div>''')

# 8) La barra fija: cuándo sale (funciona aunque falte la librería de animación)
cambiar('''  // ---- El reloj del Modo Foco corre de verdad ----''', '''  // ---- Barra de compra fija (v2): sale cuando ya pasaste el botón de la portada,
  //      y se esconde mientras se ve la tarjeta del precio o el cierre (ahí ya hay botón) ----
  const fija = document.getElementById('compra-fija');
  const fijaBoton = fija.querySelector('a');
  const acciones = document.querySelector('.portada .acciones');
  const tapan = [document.querySelector('.precio'), document.querySelector('.cierre')];
  const seVe = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  let fijaAntes = null;
  const decidir = () => {
    const ver = acciones.getBoundingClientRect().bottom < 0 && !tapan.some(seVe);
    if (ver === fijaAntes) return;
    fijaAntes = ver;
    fija.classList.toggle('ver', ver);
    fija.setAttribute('aria-hidden', String(!ver));
    fijaBoton.tabIndex = ver ? 0 : -1;
  };
  addEventListener('scroll', decidir, { passive: true });
  addEventListener('resize', decidir);
  decidir();

  // ---- El reloj del Modo Foco corre de verdad ----''')

cambiar('/* MAQUETA de la página de ventas de Racha (19 oct 2026).', '/* MAQUETA v2 (22 oct 2026): la v1 aprobada + piezas para cerrar la venta. MAQUETA de la página de ventas de Racha (19 oct 2026).')

io.open(RAIZ + '/design/pagina-ventas/v2.html', 'w', encoding='utf-8', newline='\n').write(s)
print('ok', len(s))
