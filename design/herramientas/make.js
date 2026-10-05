// PDF "Método Anti-Abandono": pone las imágenes que haya, mide que nada se salga, saca el PDF y hojas de contacto.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const DIR = 'C:/Users/jahen/RachaX/RachaX/design/pdf';
const SAL = path.join(__dirname, process.argv[4] ? 'cap-' + process.argv[4] : 'cap');
fs.mkdirSync(SAL, { recursive: true });
fs.mkdirSync(DIR + '/vista', { recursive: true });
const SALIDA = process.argv[2] || 'metodo-anti-abandono-maqueta.pdf';

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 693, deviceScaleFactor: 2 });
  await page.goto('file:///' + DIR + '/' + (process.argv[3] || 'maqueta-metodo.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'body{display:block!important;padding:0!important}' });

  // Imágenes: design/pdf/imagenes/<nombre>.(png|jpg|jpeg|webp) reemplaza el cuadro con data-img="<nombre>"
  const dirImg = DIR + '/imagenes';
  const hay = fs.existsSync(dirImg) ? fs.readdirSync(dirImg) : [];
  const puestas = await page.evaluate((hay) => {
    const out = [];
    document.querySelectorAll('[data-img]').forEach((el) => {
      const f = hay.find((x) => x.replace(/\.(png|jpe?g|webp)$/i, '') === el.dataset.img);
      if (!f) { out.push('falta: ' + el.dataset.img); return; }
      el.innerHTML = '<img src="imagenes/' + f + '" alt="">';
      out.push('puesta: ' + f);
    });
    return out;
  }, hay);
  console.log(puestas.join('\n'));
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));

  const med = await page.evaluate(() => [...document.querySelectorAll('.pg')].map((pg, i) => {
    const r = pg.getBoundingClientRect();
    if (pg.classList.contains('cov')) return { pag: i + 1, sobra: 0, lado: 0 };
    let abajo = 0, lado = 0;
    pg.querySelectorAll(':scope > *:not(.dd):not(.pts):not(.pie):not(.num)').forEach((e) => {
      const b = e.getBoundingClientRect();
      abajo = Math.max(abajo, b.bottom);
      e.querySelectorAll('*').forEach((h) => { const hb = h.getBoundingClientRect(); if (hb.width) lado = Math.max(lado, hb.right - (r.right - 12)); });
    });
    return { pag: i + 1, sobra: Math.round(r.bottom - 54 - abajo), lado: Math.round(lado) };
  }));
  let mal = 0;
  for (const m of med) {
    const ok = m.sobra >= 0 && m.lado <= 0;
    if (!ok) mal++;
    console.log((ok ? 'bien ' : 'MAL  ') + 'página ' + m.pag + ': sobran ' + m.sobra + ' px abajo' + (m.lado > 0 ? ', se sale ' + m.lado + ' px por un lado' : ''));
  }

  const pgs = await page.$$('.pg');
  for (let i = 0; i < pgs.length; i++) await pgs[i].screenshot({ path: path.join(SAL, 'p' + String(i + 1).padStart(2, '0') + '.png') });
  await page.pdf({ path: path.join(DIR, SALIDA), width: '390px', height: '693px', printBackground: true, preferCSSPageSize: true });

  const hoja = await browser.newPage();
  const base = SAL.split('\\').join('/');
  for (let h = 0; h < Math.ceil(pgs.length / 5); h++) {
    const imgs = [];
    for (let i = h * 5; i < Math.min(pgs.length, h * 5 + 5); i++) imgs.push('<img src="p' + String(i + 1).padStart(2, '0') + '.png" width="390" height="693">');
    await hoja.setViewport({ width: 5 * 390 + 6 * 14, height: 693 + 28, deviceScaleFactor: 1 });
    fs.writeFileSync(path.join(SAL, 'hoja.html'), '<body style="margin:0;background:#333;display:flex;gap:14px;padding:14px">' + imgs.join('') + '</body>');
    await hoja.goto('file:///' + base + '/hoja.html');
    await new Promise((r) => setTimeout(r, 400));
    await hoja.screenshot({ path: DIR + '/vista/' + (process.argv[4] || 'hoja') + '-' + (h + 1) + '.png' });
  }
  await browser.close();
  console.log(mal ? 'HAY ' + mal + ' páginas mal' : 'todas las páginas caben', '· páginas:', pgs.length);
})();
