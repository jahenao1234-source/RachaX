// Saca las piezas de design/anuncios/muestras.html como PNG de 1080 x 1350 y una hoja con las tres.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const DIR = 'C:/Users/jahen/RachaX/RachaX/design/anuncios';
fs.mkdirSync(DIR + '/muestras', { recursive: true });
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 3 * 540 + 4 * 16, height: 675 + 32, deviceScaleFactor: 2 });
  await page.goto('file:///' + DIR + '/muestras.html');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  const rotas = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')));
  console.log('imágenes que no cargaron:', rotas.join(', ') || 'ninguna');
  for (const ad of await page.$$('.ad')) { const id = await ad.evaluate((e) => e.id); await ad.screenshot({ path: DIR + '/muestras/' + id + '.png' }); }
  await page.screenshot({ path: DIR + '/muestras/hoja.png' });
  await browser.close();
  console.log('ok');
})();
