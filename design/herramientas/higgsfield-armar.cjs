// Arma los anuncios en imagen (4:5, 1080 × 1350) con las fotos de Higgsfield ya pasadas por higgsfield-color.py,
// las letras aprobadas y, en el del celular, la pantalla real de la app. Escribe estaticos/anuncios.html y saca un PNG
// por anuncio con Chrome. Uso: NODE_PATH=<carpeta con puppeteer-core> node design/herramientas/higgsfield-armar.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const RAIZ = path.join(__dirname, '..', '..');
const D = path.join(RAIZ, 'design', 'anuncios', 'higgsfield', 'estaticos');
const F = '../../../../public/fuentes/';
const W = 1080, H = 1350;

// Pastilla y llamado: textos aprobados de la campaña
const PIE = `<div class="pie"><div class="past">Racha · app · $37.900, un solo pago · 7 días para probarla</div>
  <div class="cta">Escribe <b>RACHA</b></div></div>`;

// La foto se escala con k y se corre (dx, dy) dentro del cuadro de 1080 × 1350
const foto = (archivo, k, dx, dy) =>
  `<img class="foto" src="${archivo}" style="width:${1536 * k}px;left:${dx}px;top:${dy}px">`;

const cel = JSON.parse(fs.readFileSync(path.join(D, 'c-celular-gris.json'), 'utf8'));
const kc = 0.9, dxc = -75, dyc = -360;
const pant = { x: cel.x0 * kc + dxc, y: cel.y0 * kc + dyc, w: (cel.x1 - cel.x0) * kc, h: (cel.y1 - cel.y0) * kc };

const anuncios = [
  { id: 'a-tenis', html: `${foto('a-tenis-ambar.png', 0.703125, 0, -150)}
    <div class="velo-arriba"></div><div class="velo-abajo"></div>
    <h1 class="tit">Para que un día malo<br>no te haga<br><em>empezar de cero.</em></h1>${PIE}` },
  { id: 'b-sofa', html: `${foto('b-sofa-ambar.png', 0.75, -72, -186)}
    <div class="velo-arriba"></div><div class="velo-abajo bajo"></div>
    <h1 class="tit">Un día malo se vale.<br><em>Dos seguidos, no.</em></h1>${PIE.replace('class="pie"', 'class="pie arriba"')}` },
  { id: 'c-celular', html: `${foto('c-celular-gris.png', kc, dxc, dyc)}
    <div class="luz" style="left:${pant.x + pant.w / 2 - 420}px;top:${pant.y + pant.h / 2 - 420}px"></div>
    <img class="pantalla" src="../../../../public/ventas/cel-1-hoy.jpg"
      style="left:${pant.x}px;top:${pant.y}px;width:${pant.w}px;height:${pant.h}px;transform:rotate(${cel.giro_grados}deg)">
    <div class="velo-arriba alto"></div>
    <div class="oferta"><div class="marca">Racha · app</div><div class="precio">$37.900</div>
      <div class="sub">un solo pago · 7 días para probarla</div></div>
    <div class="cta suelto">Escribe <b>RACHA</b></div>` },
];

const css = `
@font-face{font-family:BC;src:url(${F}barlow-condensed-latin-700-normal.woff2)}
@font-face{font-family:B;font-weight:500;src:url(${F}barlow-latin-500-normal.woff2)}
@font-face{font-family:B;font-weight:700;src:url(${F}barlow-latin-700-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#111;display:flex;flex-direction:column;gap:40px;padding:40px}
.ad{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#0b0b0c;color:#F3EEE6}
.foto{position:absolute}
.velo-arriba{position:absolute;inset:0 0 auto 0;height:620px;background:linear-gradient(#0b0b0c 0%,rgba(11,11,12,.85) 45%,rgba(11,11,12,0))}
.velo-arriba.alto{height:760px;background:linear-gradient(#0b0b0c 0%,rgba(11,11,12,.9) 60%,rgba(11,11,12,0))}
.velo-abajo{position:absolute;inset:auto 0 0 0;height:340px;background:linear-gradient(rgba(11,11,12,0),rgba(11,11,12,.9) 55%,#0b0b0c)}
.velo-abajo.bajo{height:230px}
.tit{position:absolute;left:72px;right:72px;top:84px;font-family:BC;font-weight:700;font-size:104px;line-height:.98;letter-spacing:-.5px;text-transform:uppercase}
.tit em{font-style:normal;color:#FFB547;text-shadow:0 0 28px rgba(255,181,71,.45)}
.pie{position:absolute;left:72px;right:72px;bottom:64px}
.pie.arriba{top:330px;bottom:auto}
.past{display:inline-block;font-family:B;font-weight:500;font-size:27px;color:#d9d3ca;border:2px solid rgba(255,181,71,.55);border-radius:40px;padding:12px 24px;margin-bottom:22px}
.cta{font-family:BC;font-size:58px;text-transform:uppercase;color:#F3EEE6}
.cta b{color:#FFB547}
.cta.suelto{position:absolute;left:72px;bottom:72px}
.oferta{position:absolute;left:72px;right:72px;top:84px}
.marca{font-family:B;font-weight:700;font-size:34px;letter-spacing:4px;text-transform:uppercase;color:#d9d3ca}
.precio{font-family:BC;font-size:250px;line-height:.95;color:#FFB547;text-shadow:0 0 40px rgba(255,181,71,.4);margin-top:8px}
.sub{font-family:BC;font-size:62px;text-transform:uppercase;line-height:1}
.pantalla{position:absolute;object-fit:cover;object-position:top;border-radius:${Math.round(pant.w * 0.13)}px;box-shadow:0 0 40px rgba(255,181,71,.35)}
.luz{position:absolute;width:840px;height:840px;border-radius:50%;background:radial-gradient(rgba(255,181,71,.28),rgba(255,181,71,0) 62%);mix-blend-mode:screen}
`;

const html = `<!doctype html><meta charset="utf-8"><style>${css}</style>
${anuncios.map((a) => `<div class="ad" id="${a.id}">${a.html}</div>`).join('\n')}`;
fs.writeFileSync(path.join(D, 'anuncios.html'), html);

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: W + 80, height: 900, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.join(D, 'anuncios.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  for (const a of anuncios) {
    const el = await p.$('#' + a.id);
    await el.screenshot({ path: path.join(D, `${a.id}-anuncio-v1.png`) });
    console.log('Listo:', `${a.id}-anuncio-v1.png`);
  }
  await b.close();
})();
