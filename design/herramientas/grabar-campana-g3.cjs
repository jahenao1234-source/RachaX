// Graba la Racha de muestra EN MOVIMIENTO para el guion 3 ("El día malo"), al ritmo de la voz:
// Hoy -> se toca "¿Día pesado? Haz solo lo mínimo" -> sube la hoja "Día difícil" -> "Activar día difícil"
// -> Hoy con el "Mínimo:" de cada hábito -> se marca "Leer 10 páginas".
// Cada toque pasa en el segundo del anuncio que dice TOQUES (abajo); el video sale ya sincronizado.
// Necesita la muestra corriendo (npm.cmd run muestra, puerto 3003), puppeteer-core y ffmpeg.
// Uso: NODE_PATH="<carpeta temporal>/node_modules" node design/herramientas/grabar-campana-g3.cjs
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const SAL = path.join(__dirname, '..', 'anuncios', 'campana', 'guion3', 'app');
fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Segundos del anuncio. La grabación arranca en INICIO; lo de antes de la escena se recorta al montar.
const INICIO = 5.4;
const TOQUES = { enlace: 8.27, activar: 11.95, bajar: 12.25, marcar: 13.1, fin: 16.4 };
const ARRIBA = 60;     // dónde queda la tarjeta "Tu día" en la pantalla del celular (px de la app)
const CENTRO = 400;    // a qué altura queda la fila de "Leer 10 páginas" antes de marcarla

(async () => {
  // Para que la grabación salga nítida (1170 x 2400) el navegador entero va a triple densidad:
  // con la densidad "emulada" de setViewport, la grabación en movimiento sale de 390 x 800.
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars', '--force-device-scale-factor=3', '--window-size=600,900'], defaultViewport: null });
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 800, deviceScaleFactor: 0, mobile: true });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'medias');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('header', { timeout: 20000 });
  await esperar(1800);
  // El punto que muestra dónde se toca
  await page.addStyleTag({ content: `
    @keyframes toque-g3 { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 25% { opacity: 0.95; } 60% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; } }
    .toque-g3 { position: fixed; z-index: 99999; width: 54px; height: 54px; border-radius: 27px; background: rgba(255, 255, 255, 0.55); border: 3px solid rgba(255, 255, 255, 0.95); box-shadow: 0 0 0 6px rgba(255, 181, 71, 0.35); pointer-events: none; animation: toque-g3 0.5s ease-out forwards; }
    ::-webkit-scrollbar { display: none; }` });
  const punto = (x, y) => page.evaluate((x, y) => { const d = document.createElement('div'); d.className = 'toque-g3'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 700); }, x, y);
  const rect = (fn, arg) => page.evaluate((src, arg) => { const e = (new Function('arg', 'return (' + src + ')(arg)'))(arg); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, cx: b.left + b.width / 2, cy: b.top + b.height / 2 }; }, fn.toString(), arg);
  // Mueve lo que haga falta (la ventana o el contenedor que se desliza) para que un elemento quede a cierta altura
  const llevar = (fn, y, suave) => page.evaluate((src, y, suave) => {
    const e = (new Function('return (' + src + ')()'))(); if (!e) return 'no está';
    const delta = e.getBoundingClientRect().top - y;
    let c = e.parentElement;
    while (c && !(c.scrollHeight > c.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(c).overflowY))) c = c.parentElement;
    (c || window).scrollBy({ top: delta, behavior: suave ? 'smooth' : 'instant' });
    return (c ? c.className.slice(0, 40) : 'ventana') + ' ' + Math.round(delta);
  }, fn.toString(), y, !!suave);
  const tarjeta = () => document.querySelector('.ddlink')?.closest('section, article, div[class*="rounded"]') || document.querySelector('.ddlink')?.parentElement;
  const filaLeer = () => { const h = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Marcar Leer 10 páginas'); let e = h; while (e && e.parentElement && e.getBoundingClientRect().width < 330) e = e.parentElement; return e; };

  console.log('subir la tarjeta:', await llevar(tarjeta, ARRIBA));
  await esperar(500);
  const cajas = { tarjeta: await rect(tarjeta), enlace: await rect(() => document.querySelector('.ddlink')) };

  // Cada cuadro se guarda con su hora; al final ffmpeg los vuelve un video de 30 cuadros por segundo
  const TMP = path.join(SAL, 'cuadros'); fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
  const cuadros = []; const escrituras = [];
  cdp.on('Page.screencastFrame', (f) => {
    const nombre = 'c' + String(cuadros.length).padStart(4, '0') + '.png';
    cuadros.push({ nombre, t: f.metadata.timestamp });
    escrituras.push(fs.promises.writeFile(path.join(TMP, nombre), Buffer.from(f.data, 'base64')));
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  const t0 = Date.now();
  const hasta = async (seg) => { const falta = (seg - INICIO) * 1000 - (Date.now() - t0); if (falta > 0) await esperar(falta); };
  const ahora = () => Number((INICIO + (Date.now() - t0) / 1000).toFixed(3));
  const real = {};

  // 1. tocar "¿Día pesado? Haz solo lo mínimo"
  await hasta(TOQUES.enlace - 0.15);
  await punto(cajas.enlace.cx + 90, cajas.enlace.cy);
  await hasta(TOQUES.enlace);
  real.enlace = ahora();
  await page.touchscreen.tap(cajas.enlace.cx + 90, cajas.enlace.cy);
  await esperar(900);
  cajas.hoja = await rect(() => document.querySelector('.tsheet.hcomp'));
  cajas.hojaLeer = await rect(() => [...document.querySelectorAll('.ddfila')].find((f) => /Leer 10/.test(f.textContent)));
  cajas.activar = await rect(() => [...document.querySelectorAll('.ddpie button')].find((b) => /Activar/.test(b.textContent)));

  // 2. "Activar día difícil"
  await hasta(TOQUES.activar - 0.15);
  await punto(cajas.activar.cx, cajas.activar.cy);
  await hasta(TOQUES.activar);
  real.activar = ahora();
  await page.touchscreen.tap(cajas.activar.cx, cajas.activar.cy);

  // 3. bajar hasta "Leer 10 páginas"
  await hasta(TOQUES.bajar);
  real.bajar = ahora();
  console.log('bajar a Leer:', await llevar(filaLeer, CENTRO - 32, true));
  await hasta(TOQUES.marcar - 0.2);
  cajas.fila = await rect(filaLeer);
  cajas.circulo = await rect(() => [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Marcar Leer 10 páginas'));

  // 4. marcar
  await punto(cajas.circulo.cx, cajas.circulo.cy);
  await hasta(TOQUES.marcar);
  real.marcar = ahora();
  await page.touchscreen.tap(cajas.circulo.cx, cajas.circulo.cy);
  await hasta(TOQUES.fin);
  await cdp.send('Page.stopScreencast');
  await Promise.all(escrituras);
  cajas.filaMarcada = await rect(() => { const h = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /versión mínima/.test(e.textContent) && /\+5/.test(e.textContent)); let e = h; while (e && e.parentElement && e.getBoundingClientRect().width < 330) e = e.parentElement; return e; });

  const redondo = (o) => o && Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v)]));
  const datos = { inicio: INICIO, toques: real, cajas: Object.fromEntries(Object.entries(cajas).map(([k, v]) => [k, redondo(v)])) };
  // El video empieza exactamente en el segundo DESDE del anuncio
  const DESDE = 6.0;
  const seg = (c) => INICIO + (c.t - t0 / 1000);
  const utiles = cuadros.filter((c, i) => seg(c) >= DESDE || (cuadros[i + 1] && seg(cuadros[i + 1]) > DESDE));
  const SALTO = String.fromCharCode(10);
  const lista = utiles.map((c, i) => { const ini = Math.max(DESDE, seg(c)); const fin = utiles[i + 1] ? seg(utiles[i + 1]) : TOQUES.fin; return `file '${c.nombre}'` + SALTO + `duration ${Math.max(0.001, fin - ini).toFixed(4)}`; });
  lista.push(`file '${utiles[utiles.length - 1].nombre}'`);
  fs.writeFileSync(path.join(TMP, 'lista.txt'), lista.join(SALTO), 'utf8');
  require('child_process').execFileSync(FFMPEG, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(TMP, 'lista.txt'), '-vf', 'fps=30,scale=858:1760:flags=lanczos,setsar=1', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-g', '15', '-movflags', '+faststart', path.join(SAL, 'celular.mp4')], { stdio: 'inherit' });
  fs.rmSync(TMP, { recursive: true, force: true });
  datos.desde = DESDE; datos.cuadros = cuadros.length; datos.porSegundo = Number((cuadros.length / (TOQUES.fin - INICIO)).toFixed(1));
  fs.writeFileSync(path.join(SAL, 'celular.json'), JSON.stringify(datos, null, 1), 'utf8');
  console.log(JSON.stringify(datos));
  console.log('errores:', errores.join(' | ') || 'ninguno');
  await browser.close();
})();
