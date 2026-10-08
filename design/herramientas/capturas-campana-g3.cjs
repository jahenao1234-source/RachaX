// Capturas reales de la app para el guion 3 de la campaña ("El día malo"), tomadas de la Racha de muestra:
// Hoy con "¿Día pesado? Haz solo lo mínimo", la hoja "Día difícil", Hoy con el "Mínimo:" de cada hábito
// y "Leer 10 páginas" marcado con su versión mínima.
// Necesita la muestra corriendo (npm.cmd run muestra, puerto 3003) y puppeteer-core (ver LEEME).
// Uso: NODE_PATH="<carpeta temporal>/node_modules" node design/herramientas/capturas-campana-g3.cjs
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const SAL = path.join(__dirname, '..', 'anuncios', 'campana', 'guion3', 'app');
fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.setViewport({ width: 390, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'medias');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('header', { timeout: 20000 });
  await esperar(1800);
  const cajas = {};
  const caja = (nombre, sel) => page.evaluate((sel) => { const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }, sel).then((c) => { cajas[nombre] = c; });
  // La fila de un hábito: el antepasado más cercano que ocupa casi todo el ancho
  const fila = (nombre, texto) => page.evaluate((texto) => {
    const hoja = [...document.querySelectorAll('main *, #root *')].filter((e) => e.children.length === 0 && (e.textContent || '').trim() === texto && e.getClientRects().length)[0];
    if (!hoja) return null;
    let e = hoja; while (e.parentElement && e.getBoundingClientRect().width < 330) e = e.parentElement;
    const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)];
  }, texto).then((c) => { cajas[nombre] = c; });

  await page.screenshot({ path: path.join(SAL, 'a-hoy-arriba.png') });
  // 1. El enlace "¿Día pesado? Haz solo lo mínimo"
  await page.evaluate(() => document.querySelector('.ddlink')?.scrollIntoView({ block: 'center' }));
  await esperar(500);
  await caja('enlace', '.ddlink');
  await page.screenshot({ path: path.join(SAL, 'b-hoy-dia-pesado.png') });
  // 2. La hoja "Día difícil"
  await (await page.$('.ddlink')).tap();
  await esperar(900);
  await caja('hoja', '.tsheet.hcomp');
  await page.screenshot({ path: path.join(SAL, 'c-hoja-dia-dificil.png') });
  // 3. Activar y ver Hoy con el "Mínimo:" de cada hábito
  const activar = await page.evaluateHandle(() => [...document.querySelectorAll('.ddpie button')].find((b) => /Activar/.test(b.textContent)));
  await activar.asElement().tap();
  await esperar(1200);
  await page.evaluate(() => { const e = [...document.querySelectorAll('.ddmin')].find((x) => /una página/.test(x.textContent)); e?.scrollIntoView({ block: 'center' }); });
  await esperar(600);
  await fila('leerAntes', 'Leer 10 páginas');
  await page.screenshot({ path: path.join(SAL, 'd-hoy-minimos.png') });
  // 4. Marcar "Leer 10 páginas" (con su mínima)
  const botones = await page.evaluate(() => [...document.querySelectorAll('button, [role="button"], [role="checkbox"]')].filter((b) => /Leer 10/.test((b.getAttribute('aria-label') || '') + ' ' + (b.textContent || ''))).map((b) => (b.getAttribute('aria-label') || '') + ' | ' + (b.textContent || '').trim().slice(0, 40) + ' | ' + b.className.slice(0, 40)));
  console.log('botones de Leer:', JSON.stringify(botones, null, 1));
  const marcar = await page.evaluateHandle(() => [...document.querySelectorAll('button, [role="button"], [role="checkbox"]')].find((b) => /Leer 10/.test(b.getAttribute('aria-label') || '') && /marcar|complet|hecho|cumpl/i.test(b.getAttribute('aria-label') || '')) || null);
  if (marcar.asElement()) {
    await marcar.asElement().tap();
    await esperar(900);
    await page.screenshot({ path: path.join(SAL, 'e-leer-marcado-con-aviso.png') });
    await esperar(7500);
    await fila('leerDespues', 'Leer 10 páginas');
    await page.screenshot({ path: path.join(SAL, 'f-leer-marcado.png') });
  } else console.log('FALLA: no encontré el botón para marcar Leer');
  fs.writeFileSync(path.join(SAL, 'cajas.json'), JSON.stringify(cajas, null, 1), 'utf8');
  console.log(JSON.stringify(cajas));
  console.log('errores:', errores.join(' | ') || 'ninguno');
  await browser.close();
})();
