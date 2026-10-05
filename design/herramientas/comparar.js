// Las dos portadas lado a lado: A = la actual, B = la nueva (con la llama).
const puppeteer = require('puppeteer-core');
const DIR = 'C:/Users/jahen/RachaX/RachaX/design/pdf';
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 2 * 390 + 3 * 20, height: 693 + 80, deviceScaleFactor: 2 });
  await page.goto('file:///' + DIR + '/maqueta-metodo.html');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((nueva) => {
    const cov = document.querySelector('.pg.cov');
    document.querySelectorAll('.pg').forEach((p) => { if (p !== cov) p.remove(); });
    const b = cov.cloneNode(true);
    cov.querySelector('.im').innerHTML = '<img src="imagenes/1-portada.jpg">';
    b.querySelector('.im').innerHTML = '<img src="imagenes/' + nueva + '">';
    document.body.appendChild(b);
    document.body.style.cssText = 'display:flex;gap:20px;padding:50px 20px 20px;background:#333;justify-content:center';
    [cov, b].forEach((p, i) => { const l = document.createElement('div'); l.textContent = i ? 'B · nueva (con la llama)' : 'A · la actual'; l.style.cssText = 'position:absolute;top:-36px;left:0;color:#fff;font:700 20px Barlow'; p.style.overflow = 'visible'; p.appendChild(l); });
  }, process.argv[2]);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  await page.screenshot({ path: DIR + '/vista/portadas.png' });
  await browser.close();
})();
