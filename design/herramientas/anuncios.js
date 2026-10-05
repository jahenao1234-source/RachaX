// Saca cada anuncio de design/anuncios/piezas.html como PNG de 1080 x 1350, mide que nada se salga y arma hojas para mirar.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const DIR = 'C:/Users/jahen/RachaX/RachaX/design/anuncios';
fs.mkdirSync(DIR + '/piezas', { recursive: true });
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
  await page.goto('file:///' + DIR + '/piezas.html');
  await page.evaluate(() => document.fonts.ready);
  const hay = fs.existsSync(DIR + '/imagenes') ? fs.readdirSync(DIR + '/imagenes') : [];
  await page.evaluate((hay) => document.querySelectorAll('[data-img]').forEach((el) => {
    const f = hay.find((x) => x.replace(/\.(png|jpe?g|webp)$/i, '') === el.dataset.img);
    if (f) el.innerHTML = '<img src="imagenes/' + f + '" alt="">';
  }), hay);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  const med = await page.evaluate(() => [...document.querySelectorAll('.ad')].map((ad) => {
    const r = ad.getBoundingClientRect();
    let abajo = 0, lado = 0;
    ad.querySelectorAll(':scope > *:not(.dd):not(.pts)').forEach((e) => { const b = e.getBoundingClientRect(); abajo = Math.max(abajo, b.bottom - r.top); });
    ad.querySelectorAll('h1, h1 *, p, td, th, li, .nota span, .marca, .desl').forEach((e) => { const b = e.getBoundingClientRect(); lado = Math.max(lado, b.right - r.right + 14, r.left + 14 - b.left); });
    return { id: ad.id, sobra: Math.round(675 - 22 - abajo), lado: Math.round(lado) };
  }));
  let mal = 0;
  for (const m of med) { const ok = m.sobra >= 0 && m.lado <= 0; if (!ok) mal++; console.log((ok ? 'bien ' : 'MAL  ') + m.id + ': sobran ' + m.sobra + ' px abajo' + (m.lado > 0 ? ', se sale ' + m.lado + ' px por un lado' : '')); }
  const ads = await page.$$('.ad');
  for (const ad of ads) { const id = await ad.evaluate((e) => e.id); await ad.screenshot({ path: DIR + '/piezas/' + id + '.png' }); }
  // hojas para mirar: 4 por hoja
  const hoja = await browser.newPage();
  const ids = med.map((m) => m.id);
  for (let h = 0; h * 4 < ids.length; h++) {
    await hoja.setViewport({ width: 4 * 405 + 5 * 12, height: 506 + 24, deviceScaleFactor: 1 });
    fs.writeFileSync(DIR + '/piezas/_hoja.html', '<body style="margin:0;background:#333;display:flex;gap:12px;padding:12px">' + ids.slice(h * 4, h * 4 + 4).map((id) => '<img src="' + id + '.png" width="405" height="506">').join('') + '</body>');
    await hoja.goto('file:///' + DIR + '/piezas/_hoja.html');
    await new Promise((r) => setTimeout(r, 400));
    await hoja.screenshot({ path: DIR + '/vista-' + (h + 1) + '.png' });
  }
  fs.unlinkSync(DIR + '/piezas/_hoja.html');
  await browser.close();
  console.log(mal ? 'HAY ' + mal + ' piezas mal' : 'todas caben', '· piezas:', ads.length);
})();
