// Pantallas completas (1080 x 1920) para intercalar en los videos de Xiomara:
// la app en grande, el contador de 23 a 0 y el cierre con el precio.
// Nada de esto va encima de la presentadora: son cortes a pantalla completa.
// Zona segura de Reels: entre y=269 y y=1248 (arriba y abajo lo tapa la interfaz).
// Uso: NODE_PATH="<carpeta temporal>/node_modules" node tarjetas-xiomara.cjs
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const RAIZ = path.join(__dirname, '..', '..');
const APP = path.join(__dirname, '..', 'anuncios', 'xiomara', 'app');
const SAL = path.join(__dirname, '..', 'anuncios', 'xiomara', 'montaje', 'tarjetas');
fs.mkdirSync(SAL, { recursive: true });
const url = (p) => 'file:///' + p.replace(/\\/g, '/');
const F = url(path.join(RAIZ, 'public', 'fuentes'));

const base = `
@font-face{font-family:Barlow;font-weight:400;src:url(${F}/barlow-latin-400-normal.woff2)}
@font-face{font-family:Barlow;font-weight:600;src:url(${F}/barlow-latin-600-normal.woff2)}
@font-face{font-family:Barlow;font-weight:700;src:url(${F}/barlow-latin-700-normal.woff2)}
@font-face{font-family:BarlowC;font-weight:700;src:url(${F}/barlow-condensed-latin-700-normal.woff2)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
body{background:#0c0d10;color:#f3ece0;font-family:Barlow,sans-serif;position:relative}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(900px 700px at 50% 22%,rgba(245,165,36,.13),transparent 70%)}
.marca{position:absolute;left:0;right:0;top:292px;display:flex;justify-content:center;align-items:center;gap:16px;font-family:BarlowC;font-weight:700;font-size:54px;letter-spacing:.02em}
.marca img{width:64px;height:64px;border-radius:16px}
.marca span{color:#b3a894;font-family:Barlow;font-weight:600;font-size:34px;margin-left:6px}
.zona{position:absolute;left:0;right:0;top:400px;height:640px;display:flex;align-items:center;justify-content:center}
.tarjeta{position:relative;border-radius:40px;overflow:hidden;border:2px solid rgba(255,255,255,.14);box-shadow:0 40px 90px rgba(0,0,0,.65),0 0 0 10px rgba(245,165,36,.07)}
.tarjeta img{display:block}
.toque{position:absolute;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:6px solid #f5a524;background:rgba(245,165,36,.10);box-shadow:0 0 0 16px rgba(245,165,36,.08)}
`;

const paginaApp = (img, ancho, toque) => `<!doctype html><meta charset="utf-8"><style>${base}</style>
<div class="marca"><img src="${url(path.join(RAIZ, 'public', 'icon-192.png'))}">Racha<span>así se ve en la app</span></div>
<div class="zona"><div class="tarjeta"><img src="${url(path.join(APP, img))}" style="width:${ancho}px">${toque ? `<i class="toque" style="left:${toque[0]}%;top:${toque[1]}%"></i>` : ''}</div></div>`;

const paginaContador = (n) => `<!doctype html><meta charset="utf-8"><style>${base}
body::before{background:radial-gradient(900px 700px at 50% 38%,${n === 0 ? 'rgba(255,122,89,.16)' : 'rgba(245,165,36,.13)'},transparent 70%)}
.num{position:absolute;left:0;right:0;top:330px;text-align:center;font-family:BarlowC;font-weight:700;font-size:620px;line-height:1;color:${n === 0 ? '#ff7a59' : '#f5a524'}}
.eti{position:absolute;left:0;right:0;top:940px;text-align:center;font-family:BarlowC;font-weight:700;font-size:84px;letter-spacing:.04em;text-transform:uppercase;color:#f3ece0}
</style><div class="num">${n}</div><div class="eti">días seguidos</div>`;

const paginaCierre = () => `<!doctype html><meta charset="utf-8"><style>${base}
body::before{background:radial-gradient(1000px 800px at 50% 40%,rgba(245,165,36,.18),transparent 70%)}
.c{position:absolute;left:0;right:0;top:275px;text-align:center}
.c img{width:150px;height:150px;border-radius:36px}
.n{font-family:BarlowC;font-weight:700;font-size:150px;line-height:1;margin-top:18px}
.q{font-size:50px;font-weight:600;color:#b3a894;margin-top:6px}
.p{font-family:BarlowC;font-weight:700;font-size:236px;line-height:1;color:#f5a524;margin-top:26px}
.u{font-family:BarlowC;font-weight:700;font-size:86px;line-height:1.05;text-transform:uppercase;letter-spacing:.02em}
.d{font-size:50px;font-weight:600;color:#f3ece0;margin-top:22px}
.w{display:inline-flex;align-items:center;gap:20px;margin-top:40px;padding:24px 46px;border-radius:999px;background:#f5a524;color:#14110d;font-weight:700;font-size:52px}
.w svg{width:48px;height:48px}
</style><div class="c"><img src="${url(path.join(RAIZ, 'public', 'icon-192.png'))}"><div class="n">Racha</div><div class="q">es una app</div>
<div class="p">$37.900</div><div class="u">un solo pago</div><div class="d">7 días para probarla</div>
<div class="w">Escríbenos por WhatsApp <svg viewBox="0 0 24 24" fill="none" stroke="#14110d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M5 13l7 7 7-7"/></svg></div></div>`;

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const sacar = async (nombre, html) => {
    const f = path.join(SAL, nombre + '.html');
    fs.writeFileSync(f, html, 'utf8');
    await page.goto(url(f), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    // Comprobar que nada importante se sale de la zona segura (269 a 1248)
    const fuera = await page.evaluate(() => [...document.querySelectorAll('.marca,.tarjeta,.num,.eti,.c')].map((e) => { const r = e.getBoundingClientRect(); return [e.className, Math.round(r.top), Math.round(r.bottom)]; }).filter((x) => x[1] < 269 || x[2] > 1248));
    if (fuera.length) console.log('FALLA zona segura', nombre, JSON.stringify(fuera));
    await page.screenshot({ path: path.join(SAL, nombre + '.png') });
    fs.unlinkSync(f);
  };
  await sacar('app-1-dia-pesado', paginaApp('rec-a1-dia-pesado.png', 960, [50, 74]));
  await sacar('app-2-minimo-hecho', paginaApp('rec-a4-minimo-hecho.png', 836));
  await sacar('app-3-comodines', paginaApp('rec-b2-comodines-arriba.png', 1000));
  await sacar('app-4-volviste', paginaApp('rec-c2-volviste.png', 960));
  for (let n = 23; n >= 0; n--) await sacar('contador-' + String(n).padStart(2, '0'), paginaContador(n));
  await sacar('cierre', paginaCierre());
  console.log('listo', fs.readdirSync(SAL).length, 'archivos');
  await browser.close();
})();
