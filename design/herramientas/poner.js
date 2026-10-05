// Uso: node poner.js <archivo de Gemini> <nombre final sin extensión> [...más pares]
// Achica la imagen a 1400 px, la guarda con su nombre final y pasa el original (y la imagen que reemplaza) a imagenes/originales.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const DIR = 'C:/Users/jahen/RachaX/RachaX/design/pdf/imagenes';
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  fs.writeFileSync(DIR + '/_t.html', '<body></body>');
  await page.goto('file:///' + DIR + '/_t.html');
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const orig = args[i], nombre = args[i + 1];
    const out = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode();
      const w = Math.min(1400, img.naturalWidth), h = Math.round(img.naturalHeight * w / img.naturalWidth);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/jpeg', 0.86).split(',')[1];
    }, fs.readFileSync(DIR + '/' + orig).toString('base64'));
    const fin = DIR + '/' + nombre + '.jpg';
    if (fs.existsSync(fin)) fs.renameSync(fin, DIR + '/originales/antes-' + nombre + '-' + Date.now() + '.jpg');
    fs.writeFileSync(fin, Buffer.from(out, 'base64'));
    fs.renameSync(DIR + '/' + orig, DIR + '/originales/' + orig);
    console.log(nombre + '.jpg', Math.round(fs.statSync(fin).size / 1024) + ' KB');
  }
  fs.unlinkSync(DIR + '/_t.html');
  await browser.close();
})();
