// Anuncio 1 en imagen (ficha 1 de design/anuncios/estaticos-venta/fichas.md, texto aprobado el 19 oct):
// foto de Higgsfield a color (a1/foto-mujer-v2.png) + la pantalla real del día pesado en el celular + el texto aprobado.
// La pantalla se mide antes con: python design/herramientas/higgsfield-color.py a1/foto-mujer-v2.png a1/foto-mujer-v2-base.png medir
// Uso: NODE_PATH=<carpeta con puppeteer-core> node design/herramientas/anuncio-a1-armar.cjs  → estaticos-venta/a1-gimnasio-v1.png
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const RAIZ = path.join(__dirname, '..', '..');
const D = path.join(RAIZ, 'design', 'anuncios', 'estaticos-venta');
const A = path.join(D, 'a1');
const W = 1080, H = 1350, V = process.env.V || 'v1';
const F = '../../../public/fuentes/';

// la foto ocupa todo el ancho; arriba queda una franja del color de la pared para el titular
const k = W / 1536, dy = 0;
const c = JSON.parse(fs.readFileSync(path.join(A, 'foto-mujer-v2-base.json'), 'utf8'));
// la caja medida incluye la inclinación: se saca el ancho y el alto reales de la pantalla
const s = Math.sin(Math.abs(c.giro_grados) * Math.PI / 180), co = Math.cos(c.giro_grados * Math.PI / 180);
const bw = c.x1 - c.x0, bh = c.y1 - c.y0;
const w = (bw * co - bh * s) / (co * co - s * s), h = (bh * co - bw * s) / (co * co - s * s);
const cx = (c.x0 + c.x1) / 2 * k, cy = (c.y0 + c.y1) / 2 * k + dy;
const pw = w * k + 6, ph = h * k + 12;

const si = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:BC;src:url(${F}barlow-condensed-latin-700-normal.woff2)}
@font-face{font-family:B;font-weight:500;src:url(${F}barlow-latin-500-normal.woff2)}
@font-face{font-family:B;font-weight:600;src:url(${F}barlow-latin-600-normal.woff2)}
@font-face{font-family:B;font-weight:700;src:url(${F}barlow-latin-700-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#222;padding:40px}
.ad{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#e9a868;font-family:B;color:#1a120a}
.foto{position:absolute;left:0;top:${dy}px;width:${W}px}
.pantalla{position:absolute;left:${cx - pw / 2}px;top:${cy - ph / 2}px;width:${pw}px;height:${ph}px;object-fit:cover;object-position:center top;
  border-radius:${pw * .14}px;transform:rotate(${c.giro_grados}deg);box-shadow:0 0 30px rgba(255,181,71,.55)}
.arriba{position:absolute;left:60px;right:60px;top:48px}
.marca{display:inline-flex;align-items:center;gap:10px;font-family:BC;font-size:34px;background:#1a120a;color:#FFB547;padding:6px 16px 6px 8px;border-radius:12px;margin-bottom:18px}
.marca img{width:40px;height:40px;border-radius:9px}
h1{font-family:BC;font-weight:700;font-size:86px;line-height:.98;text-transform:uppercase;text-shadow:0 2px 0 rgba(255,255,255,.15)}
h1 em{font-style:normal;background:#1a120a;color:#FFB547;padding:0 12px;border-radius:8px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.sub{font-size:31px;font-weight:600;line-height:1.28;margin-top:16px;max-width:900px}
.lista{position:absolute;left:40px;width:640px;top:800px;background:rgba(20,14,8,.88);border-radius:22px;padding:24px 26px;display:grid;gap:16px;color:#F3EEE6;backdrop-filter:blur(2px)}
.lista div{display:flex;gap:14px;font-size:25px;line-height:1.3;font-weight:500}
.lista i{flex:none;width:34px;height:34px;border-radius:50%;background:#FFB547;color:#1a120a;display:grid;place-items:center;margin-top:1px}
.lista i svg{width:20px;height:20px}
.oferta{position:absolute;left:40px;width:640px;bottom:40px}
.precio{font-size:27px;color:#1a120a;font-weight:600;margin-bottom:12px;background:rgba(255,237,210,.92);display:inline-block;padding:6px 14px;border-radius:10px}
.precio b{font-weight:700}
.boton{background:#1a120a;color:#FFB547;font-family:BC;font-size:44px;text-transform:uppercase;text-align:center;padding:20px;border-radius:16px}
</style>
<div class="ad" id="ad">
  <img class="foto" src="a1/foto-mujer-v2.png">
  <img class="pantalla" src="a1/pantalla-dia-pesado.png">
  <div class="arriba">
    <div class="marca"><img src="${F}../ventas/icono.svg">Racha</div>
    <h1>¿Faltas un día al gimnasio y ya lo dejas <em>para el lunes?</em></h1>
    <p class="sub">Racha es una app que te ayuda a volver al otro día, en vez de esperar al lunes.</p>
  </div>
  <div class="lista">
    <div><i>${si}</i>Los días pesados ya no son un problema: haces una parte mínima, como 10 sentadillas, y marcas el día como exitoso.</div>
    <div><i>${si}</i>Si un día no cumples, usa un comodín y tu racha sigue.</div>
    <div><i>${si}</i>Trae rutinas ya armadas, para que no tengas que pensar por dónde empezar.</div>
  </div>
  <div class="oferta">
    <div class="precio"><b>$37.900</b> · un solo pago · 7 días para probarla</div>
    <div class="boton">Escribe RACHA y te la muestro</div>
  </div>
</div>`;
fs.writeFileSync(path.join(D, 'a1.html'), html);

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.setViewport({ width: W + 80, height: H + 80 });
  await p.goto('file:///' + path.join(D, 'a1.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const cajas = await p.evaluate(() => Object.fromEntries(['.arriba', '.lista', '.oferta', '.pantalla'].map((q) => {
    const r = document.querySelector(q).getBoundingClientRect(); return [q, [Math.round(r.left - 40), Math.round(r.top - 40), Math.round(r.right - 40), Math.round(r.bottom - 40)]];
  })));
  console.log('Cajas (izq, arriba, der, abajo):', JSON.stringify(cajas));
  await (await p.$('#ad')).screenshot({ path: path.join(D, `a1-gimnasio-${V}.png`) });
  console.log('Listo:', `a1-gimnasio-${V}.png`);
  await b.close();
})();
