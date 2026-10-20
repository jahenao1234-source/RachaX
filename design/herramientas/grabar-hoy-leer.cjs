// Fotos de Hoy en el celular, antes y después de marcar "Leer 10 páginas" COMPLETO (+10), para el video
// "Pasa el tiempo y sigo igual" (20 oct). La app de verdad (la Racha de muestra, puerto 3003).
// Uso: NODE_PATH="<carpeta con node_modules>" node design/herramientas/grabar-hoy-leer.cjs <carpeta de salida>
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const SAL = path.resolve(process.argv[2]); fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await b.newPage();
  await page.setViewport({ width: 390, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'medias');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('header', { timeout: 20000 });
  await esperar(1800);
  await page.addStyleTag({ content: '::-webkit-scrollbar{display:none} *{caret-color:transparent!important}' });
  const boton = () => [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Marcar Leer 10 páginas');
  await page.evaluate((src) => { const e = (new Function('return (' + src + ')()'))(); const d = e.getBoundingClientRect().top - 430; let c = e.parentElement; while (c && !(c.scrollHeight > c.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(c).overflowY))) c = c.parentElement; (c || window).scrollBy({ top: d, behavior: 'instant' }); }, boton.toString());
  await esperar(600);
  await page.screenshot({ path: path.join(SAL, 'hoy-leer-antes.png') });
  const r = await page.evaluate((src) => { const e = (new Function('return (' + src + ')()'))(); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, boton.toString());
  console.log('botón en', r);
  await page.touchscreen.tap(r.x, r.y);
  await esperar(900);
  // lo que salga encima (aviso de permisos, celebraciones) se esconde: la foto es de la fila marcada
  await page.evaluate(() => { [...document.querySelectorAll('body *')].forEach((e) => { const s = getComputedStyle(e); if (s.position === 'fixed' && !e.matches('nav, header') && !e.querySelector('nav, header') && e.getBoundingClientRect().height > 100) e.style.display = 'none'; }); });
  await esperar(300);
  await page.screenshot({ path: path.join(SAL, 'hoy-leer-despues.png') });
  await b.close();
})();
