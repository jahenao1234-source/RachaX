// Tu semana de la Racha de muestra, a 1600 × 900 y 2x (la pantalla del portátil de Johnatan), para meterla DENTRO de sus
// tomas con pantalla-reemplazo.py (15 oct de 2026, POV: "falta donde se vea la semana armándose").
//   referencia <carpeta>   Tu semana como la grabó él (la muestra tal cual), con la página bajada: ref-semana-NNNN.png
//   llenado <carpeta>      los pasos de esta semana arrancan sin día (arriba, en "Pasos sin día") y van cayendo en su día
//                          y su momento uno por uno, en orden de día: esemana-NN.png (una foto por paso, y la última repetida)
// Necesita la muestra corriendo (puerto 3003), puppeteer-core (NODE_PATH) y Chrome.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const [modo, carpeta] = process.argv.slice(2);
const SAL = path.resolve(carpeta);
fs.mkdirSync(SAL, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
  // FECHA="2026-10-14T13:05:00": la muestra cree que es ese momento (el día y la hora en que él grabó la toma), para que la
  // semana, "Hoy" y los pasos sin día queden como en su pantalla
  const DESFASE = process.env.FECHA ? new Date(process.env.FECHA).getTime() - Date.now() : 0;
  if (DESFASE) await page.evaluateOnNewDocument((off) => { const D = Date; class F extends D { constructor(...a) { if (a.length === 0) super(D.now() + off); else super(...a); } static now() { return D.now() + off; } } window.Date = F; }, DESFASE);
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'nada');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('nav, header', { timeout: 20000 });
  await esperar(1500);
  // en sus tomas de Tu semana el menú de la izquierda está cerrado (la app lo recuerda)
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Cerrar el menú' || e.getAttribute('aria-label') === 'Cerrar el menú'); if (b) b.click(); }); await esperar(400);
  const T = await page.evaluate(() => JSON.parse(localStorage.getItem('racha_tareas') || '[]'));
  const limpio = '::-webkit-scrollbar { display: none; } * { caret-color: transparent !important; }';
  const cerrarPremios = async () => { for (let quieto = 0, v = 0; quieto < 4 && v < 30; v++) { const habia = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Seguir'); if (b) { b.click(); return true; } return false; }); quieto = habia ? 0 : quieto + 1; await esperar(150); } };
  const tocar = (texto) => page.evaluate((t) => { const b = [...document.querySelectorAll('button, a, [role="tab"]')].find((e) => e.textContent.trim() === t || e.getAttribute('aria-label') === t); if (b) { b.click(); return true; } return false; }, texto);
  const poner = async (tareas) => {
    await page.evaluate((t) => localStorage.setItem('racha_tareas', JSON.stringify(t)), tareas);
    for (let intento = 0; intento < 4; intento++) {
      try { await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0', timeout: 25000 }); await page.waitForSelector('nav, header', { timeout: 12000 }); break; }
      catch (e) { console.log('recarga lenta, va otra vez'); await esperar(1500); }
    }
    await page.addStyleTag({ content: limpio });
    await cerrarPremios();
    await tocar('Tu semana'); await esperar(600);
    await cerrarPremios();
  };
  // la caja que se desplaza (la más alta con scroll); BAJADA=<px> baja la página como en la toma
  const bajar = (y) => page.evaluate((y) => {
    const cajas = [document.scrollingElement, ...document.querySelectorAll('main, div')].filter((e) => e && e.scrollHeight > e.clientHeight + 20 && (e === document.scrollingElement || ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)));
    cajas.sort((a, b) => b.scrollHeight - a.scrollHeight);
    if (!cajas.length) return 0; cajas[0].scrollTop = y; return cajas[0].scrollTop;
  }, y);
  const BAJADA = Number(process.env.BAJADA || 0);
  // los días de esta semana (lunes a domingo)
  const p2 = (n) => String(n).padStart(2, '0');
  const fecha = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const hoy = new Date(Date.now() + DESFASE); hoy.setHours(12, 0, 0, 0);
  const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const semana = Array.from({ length: 7 }, (_, i) => { const d = new Date(lunes); d.setDate(lunes.getDate() + i); return fecha(d); });
  // todos los pasos (también los de adentro) que tienen día en esta semana, en orden de día y de momento
  const ORDEN = { manana: 0, tarde: 1, noche: 2 };
  const pasos = [];
  const recorrer = (lista) => lista.forEach((s) => { if (s.fecha && semana.includes(s.fecha) && !s.hecha) pasos.push(s); if (s.subtareas) recorrer(s.subtareas); });
  T.forEach((t) => recorrer(t.subtareas || []));
  pasos.sort((a, b) => a.fecha.localeCompare(b.fecha) || (ORDEN[a.momento] ?? 3) - (ORDEN[b.momento] ?? 3));
  console.log('pasos de esta semana:', pasos.length, '·', semana[0], 'a', semana[6]);

  if (modo === 'referencia') {
    await poner(T); await esperar(400);
    // DESDE_Y / HASTA_Y / PASO: varias bajadas, para medir con bajada.py cuál es la de la toma
    for (let y = Number(process.env.DESDE_Y || BAJADA); y <= Number(process.env.HASTA_Y || BAJADA); y += Number(process.env.PASO || 20)) {
      const real = await bajar(y); await esperar(250);
      await page.screenshot({ path: path.join(SAL, `ref-semana-${String(real).padStart(4, '0')}.png`) });
    }
  } else {
    const guardados = pasos.map((s) => ({ s, fecha: s.fecha, momento: s.momento }));
    guardados.forEach(({ s }) => { delete s.fecha; delete s.momento; });
    for (let i = 0; i <= guardados.length; i++) {
      if (i > 0) { const g = guardados[i - 1]; g.s.fecha = g.fecha; if (g.momento) g.s.momento = g.momento; }
      await poner(T); await bajar(BAJADA); await esperar(350);
      await page.screenshot({ path: path.join(SAL, `esemana-${p2(i)}.png`) });
    }
    fs.copyFileSync(path.join(SAL, `esemana-${p2(guardados.length)}.png`), path.join(SAL, `esemana-${p2(guardados.length + 1)}.png`));
    console.log('llenado:', guardados.length + 2, 'fotos');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
