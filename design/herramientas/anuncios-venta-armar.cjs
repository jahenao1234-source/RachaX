// Anuncios en imagen que dicen QUÉ es Racha (4:5, 1080 × 1350), con las fórmulas que más se repiten en los anuncios
// que corren (análisis en design/anuncios/referencias/oct19-estaticos/analisis-ad-2026-10-19.md):
//   1 pregunta + celular en la mano (como "Pulso")    2 un solo pago contra la suscripción ("Págalo una vez y ya")
//   3 antes y después con los dibujos del PDF ("Rimu") 4 tres cosas que hace, en tarjetas ("Monetia")
// Usa la pantalla real de la app, la foto de la mano de Higgsfield (estaticos/c-celular-gris.png + .json) y los
// dibujos aprobados del PDF. Escribe design/anuncios/estaticos-venta/anuncios.html y un PNG por anuncio.
// Uso: NODE_PATH=<carpeta con puppeteer-core> node design/herramientas/anuncios-venta-armar.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const RAIZ = path.join(__dirname, '..', '..');
const D = path.join(RAIZ, 'design', 'anuncios', 'estaticos-venta');
fs.mkdirSync(D, { recursive: true });
const R = '../../../'; // de estaticos-venta a la raíz del proyecto
const W = 1080, H = 1350, V = 'v1';

const ico = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  pluma: ico('<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>'),
  escudo: ico('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>'),
  pasos: ico('<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>'),
  si: ico('<path d="M20 6 9 17l-5-5"/>'),
  no: ico('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
};
const marca = `<div class="marca"><img src="${R}public/ventas/icono.svg">Racha</div>`;
const precio = `<div class="precio-linea"><b>$37.900</b> · un solo pago · 7 días para probarla</div>`;
const boton = (t = 'Escribe <b>RACHA</b> y te la muestro') => `<div class="boton">${t}</div>`;
const queEs = 'Racha es una app para sostener lo que empiezas: tus hábitos, tus tareas y tu foco.';

// 1 · la foto de la mano, ampliada para que el celular sea lo más grande
const cel = JSON.parse(fs.readFileSync(path.join(RAIZ, 'design/anuncios/higgsfield/estaticos/c-celular-gris.json'), 'utf8'));
const k = 1.12, dx = -150, dy = -850;
const p = { x: cel.x0 * k + dx, y: cel.y0 * k + dy, w: (cel.x1 - cel.x0) * k, h: (cel.y1 - cel.y0) * k };

const anuncios = [
  { id: '1-pregunta', html: `
    <img class="abs" src="${R}design/anuncios/higgsfield/estaticos/c-celular-gris.png" style="width:${1536 * k}px;left:${dx}px;top:${dy}px">
    <div class="luz" style="left:${p.x + p.w / 2 - 450}px;top:${p.y + p.h / 2 - 450}px"></div>
    <img class="pantalla" src="${R}public/ventas/cel-1-hoy.jpg" style="left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;border-radius:${p.w * .13}px">
    <div class="velo-a"></div><div class="velo-b"></div>
    <div class="arriba">${marca}
      <h1 class="tit t1">¿Fallas un día y lo dejas todo <em>para el lunes?</em></h1>
      <p class="sub">${queEs}</p></div>
    <div class="abajo">${precio}${boton()}</div>` },

  { id: '2-un-pago', html: `
    <div class="arriba">${marca}
      <div class="etiqueta">Muchas apps te cobran cada mes</div>
      <h1 class="tit t2">Pagas una vez<br>y <em>es tuya.</em></h1>
      <p class="sub">${queEs}</p></div>
    <div class="cols">
      <div class="col gris"><div class="col-tit">Una suscripción</div><div class="col-precio">Cada mes</div>
        <ul><li>${I.no}Pagas mientras la uses</li><li>${I.no}El cobro llega aunque no la uses</li><li>${I.no}Si dejas de pagar, se acaba el acceso</li></ul></div>
      <div class="col ambar"><div class="col-tit">Racha</div><div class="col-precio">$37.900</div><div class="col-sub">Una sola vez</div>
        <ul><li>${I.si}Acceso vitalicio</li><li>${I.si}En tu celular y tu computador</li><li>${I.si}7 días para probarla</li></ul></div>
    </div>
    <div class="abajo">${boton('La quiero por <b>$37.900</b>')}<div class="debajo">Escribe RACHA y te la muestro</div></div>` },

  { id: '3-antes-despues', clase: 'claro', html: `
    <div class="arriba">${marca.replace('marca', 'marca oscura')}
      <h1 class="tit t3">¿Fallaste el miércoles?</h1></div>
    <div class="fila f1"><img src="${R}design/pdf/imagenes/3-lo-que-dejaste.jpg">
      <div><div class="sin">Sin Racha</div><p>Vuelves a cero y lo dejas para el lunes.</p></div></div>
    <div class="fila f2"><img src="${R}design/pdf/imagenes/4-volver.jpg">
      <div><div class="con">Con Racha</div><p>El miércoles solo daña el miércoles. Al otro día sigues.</p></div></div>
    <div class="abajo"><p class="sub oscuro">${queEs}</p>${precio.replace('precio-linea', 'precio-linea oscuro')}${boton()}</div>` },

  { id: '4-tres-cosas', html: `
    <div class="arriba">${marca}
      <h1 class="tit t4">Para que un día malo no te haga <em>empezar de cero.</em></h1>
      <p class="sub">${queEs}</p></div>
    <div class="tarjetas">
      <div class="tj"><i>${I.pluma}</i><div><b>¿Día pesado? Haz solo lo mínimo</b>
        <span>Entrenar 30 minutos → mínimo: 10 sentadillas. Ese día cuenta.</span></div></div>
      <div class="tj"><i>${I.escudo}</i><div><b>Comodines</b>
        <span>Congela un día que no pudiste, sin romper tu racha.</span></div></div>
      <div class="tj"><i>${I.pasos}</i><div><b>Tareas partidas en pasos</b>
        <span>Lo que llevas meses aplazando, en pasos pequeños. Hoy solo haces el que toca.</span></div></div>
    </div>
    <div class="abajo">${precio}${boton()}</div>` },
];

const F = R + 'public/fuentes/';
const css = `
@font-face{font-family:BC;src:url(${F}barlow-condensed-latin-700-normal.woff2)}
@font-face{font-family:B;font-weight:400;src:url(${F}barlow-latin-400-normal.woff2)}
@font-face{font-family:B;font-weight:500;src:url(${F}barlow-latin-500-normal.woff2)}
@font-face{font-family:B;font-weight:600;src:url(${F}barlow-latin-600-normal.woff2)}
@font-face{font-family:B;font-weight:700;src:url(${F}barlow-latin-700-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#222;display:flex;flex-direction:column;gap:40px;padding:40px}
.ad{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#101113;color:#F3EEE6;font-family:B}
.ad.claro{background:#FFB547;color:#17130d}
.abs{position:absolute}
.arriba{position:absolute;left:68px;right:68px;top:60px}
.abajo{position:absolute;left:68px;right:68px;bottom:60px}
.marca{display:flex;align-items:center;gap:14px;font-family:BC;font-size:40px;letter-spacing:.5px;margin-bottom:26px}
.marca img{width:52px;height:52px;border-radius:12px}
.marca.oscura{color:#17130d}
.tit{font-family:BC;font-weight:700;line-height:.98;text-transform:uppercase}
.tit em{font-style:normal;color:#FFB547}
.t1{font-size:92px}.t2{font-size:120px}.t3{font-size:96px;white-space:nowrap}.t4{font-size:90px}
.sub{font-size:34px;line-height:1.3;color:#d6d0c7;margin-top:22px;font-weight:500}
.sub.oscuro{color:#2a2117;margin:0 0 18px}
.precio-linea{font-size:32px;color:#d6d0c7;margin-bottom:22px}
.precio-linea b{color:#FFB547;font-weight:700}
.precio-linea.oscuro{color:#2a2117}.precio-linea.oscuro b{color:#17130d}
.boton{display:block;text-align:center;background:#FFB547;color:#17130d;font-family:BC;font-size:50px;text-transform:uppercase;padding:24px 20px;border-radius:18px}
.boton b{color:#17130d}
.claro .boton{background:#17130d;color:#FFB547}.claro .boton b{color:#FFB547}
.debajo{text-align:center;font-size:30px;color:#bdb6ac;margin-top:16px}
.pantalla{position:absolute;object-fit:cover;object-position:top;box-shadow:0 0 50px rgba(255,181,71,.35)}
.luz{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(rgba(255,181,71,.25),rgba(255,181,71,0) 62%);mix-blend-mode:screen}
.velo-a{position:absolute;inset:0 0 auto 0;height:470px;background:linear-gradient(#101113 62%,rgba(16,17,19,0))}
.velo-b{position:absolute;inset:auto 0 0 0;height:330px;background:linear-gradient(rgba(16,17,19,0),#101113 40%)}
.nota{position:absolute;width:250px;font-family:BC;font-size:36px;line-height:1.05;color:#FFB547;text-transform:uppercase}
.etiqueta{display:inline-block;background:#F3EEE6;color:#101113;font-family:BC;font-size:34px;text-transform:uppercase;padding:8px 20px;border-radius:8px;margin-bottom:20px}
.cols{position:absolute;left:68px;right:68px;top:660px;display:grid;grid-template-columns:1fr 1fr;gap:22px}
.col{border-radius:22px;padding:28px 26px;background:#1b1c1f;border:2px solid #2c2d31}
.col.ambar{border:3px solid #FFB547;box-shadow:0 0 40px rgba(255,181,71,.18)}
.col-tit{font-family:BC;font-size:34px;text-transform:uppercase;color:#a9a39a}
.ambar .col-tit{color:#FFB547}
.col-precio{font-family:BC;font-size:76px;line-height:1;margin-top:6px}
.gris .col-precio{color:#8d877f}
.col-sub{font-family:BC;font-size:30px;text-transform:uppercase;margin-top:2px}
.col ul{list-style:none;margin-top:18px;display:grid;gap:12px}
.col li{display:flex;gap:10px;font-size:27px;line-height:1.2;align-items:flex-start}
.col li svg{width:30px;height:30px;flex:none;margin-top:1px}
.gris li{color:#9a948b}.gris li svg{color:#7a746c}.ambar li svg{color:#FFB547}
.fila{position:absolute;left:68px;right:68px;display:grid;grid-template-columns:420px 1fr;gap:34px;align-items:center}
.f1{top:285px}.f2{top:655px}
.fila img{width:420px;height:320px;object-fit:cover;border:5px solid #17130d;border-radius:14px;box-shadow:8px 8px 0 #17130d}
.f1 img{filter:grayscale(1) contrast(1.05)}
.sin,.con{font-family:BC;font-size:48px;text-transform:uppercase}
.sin{color:#5a4a33}
.fila p{font-size:36px;line-height:1.25;font-weight:600;margin-top:8px}
.tarjetas{position:absolute;left:68px;right:68px;top:480px;display:grid;gap:20px}
.tj{display:flex;gap:24px;align-items:flex-start;background:#1b1c1f;border:2px solid #2c2d31;border-radius:22px;padding:30px 30px}
.tj i{width:70px;height:70px;border-radius:18px;background:rgba(255,181,71,.14);color:#FFB547;display:grid;place-items:center;flex:none}
.tj i svg{width:38px;height:38px}
.tj b{display:block;font-family:BC;font-size:40px;text-transform:uppercase;line-height:1.05}
.tj span{display:block;font-size:31px;line-height:1.3;color:#bdb6ac;margin-top:6px}
`;

fs.writeFileSync(path.join(D, 'anuncios.html'), `<!doctype html><meta charset="utf-8"><style>${css}</style>
${anuncios.map((a) => `<div class="ad ${a.clase || ''}" id="a${a.id}">${a.html}</div>`).join('\n')}`);

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage();
  await pg.setViewport({ width: W + 80, height: 900 });
  await pg.goto('file:///' + path.join(D, 'anuncios.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  // que nada se salga del cuadro ni se monte: avisa si una caja pasa del borde
  const fuera = await pg.evaluate(() => [...document.querySelectorAll('.ad')].flatMap((ad) => {
    const r = ad.getBoundingClientRect();
    return [...ad.querySelectorAll('.arriba,.abajo,.cols,.tarjetas,.fila,.nota')].filter((e) => {
      const q = e.getBoundingClientRect(); return q.right > r.right + 1 || q.bottom > r.bottom + 1;
    }).map((e) => ad.id + ' ' + e.className);
  }));
  if (fuera.length) console.log('OJO, se sale:', fuera);
  for (const a of anuncios) {
    await (await pg.$('#a' + a.id)).screenshot({ path: path.join(D, `${a.id}-${V}.png`) });
    console.log('Listo:', `${a.id}-${V}.png`);
  }
  await b.close();
})();
