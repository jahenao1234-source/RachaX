// "Los cuadros se llenan solos": graba la Racha de muestra mientras su historia crece día por día, para que el
// calendario del mes se vaya llenando y la gráfica de Progreso se vaya formando (idea de Johnatan, con el video de
// referencia de la hoja de hábitos que se llena sola: referencias/oct10/ref5-cuadros-que-se-llenan.mp4).
// Es la app de verdad: en cada paso se le dejan los registros hasta cierto día, se recarga y se le toma una foto.
// Necesita la muestra corriendo (npm.cmd run muestra, puerto 3003), puppeteer-core y ffmpeg.
// Uso: NODE_PATH="<carpeta con node_modules>" node design/herramientas/grabar-llenado.cjs [prueba | calendario | grafica]
//      deja en campana/app-llenado/ las fotos (cal-NN.png, graf-NN.png) y dos videos: calendario.mp4 y grafica.mp4
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const SAL = path.join(__dirname, '..', 'anuncios', 'campana', 'app-llenado');
fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const PRUEBA = process.argv.includes('prueba');
const SOLO = ['calendario', 'grafica'].find((x) => process.argv.includes(x));

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 693, deviceScaleFactor: 3, isMobile: true, hasTouch: true });   // 1170 × 2079: casi 9:16
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'casi');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('header', { timeout: 20000 });
  await esperar(1500);
  const R = await page.evaluate(() => JSON.parse(localStorage.getItem('racha_registros')));
  const p2 = (n) => String(n).padStart(2, '0');
  const fecha = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const hace = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return fecha(d); };
  const limpio = '::-webkit-scrollbar { display: none; } * { caret-color: transparent !important; }';
  const poner = async (hasta) => {
    await page.evaluate((R, hasta) => localStorage.setItem('racha_registros', JSON.stringify(R.filter((r) => r.fecha <= hasta))), R, hasta);
    for (let intento = 0; intento < 4; intento++) {
      try { await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0', timeout: 25000 }); await page.waitForSelector('header', { timeout: 12000 }); break; }
      catch (e) { console.log('recarga lenta, va otra vez'); await esperar(1500); }
    }
    await page.addStyleTag({ content: limpio });
  };
  const tocar = (texto) => page.evaluate((t) => { const b = [...document.querySelectorAll('button, a, [role="tab"]')].find((e) => e.textContent.trim() === t || e.getAttribute('aria-label') === t); if (b) { b.click(); return true; } return false; }, texto);
  const irA = async (...pasos) => { for (const p of pasos) { if (!(await tocar(p))) console.log('no encontré', p); await esperar(350); } };

  if (PRUEBA) {
    await poner(hace(20));
    await esperar(600); await page.screenshot({ path: path.join(SAL, 'prueba-1-hoy.png') });
    await irA('Progreso'); await esperar(500); await page.screenshot({ path: path.join(SAL, 'prueba-2-progreso.png') });
    await irA('Calendario'); await esperar(500); await page.screenshot({ path: path.join(SAL, 'prueba-3-calendario.png') });
    console.log(await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => (b.getAttribute('aria-label') || b.textContent.trim()).slice(0, 30)).filter(Boolean).slice(0, 60).join(' | ')));
    console.log('errores:', errores.slice(0, 3));
    await browser.close(); return;
  }
  // Lleva un elemento a cierta altura de la pantalla (mueve el contenedor que se desliza)
  const llevar = (texto, y) => page.evaluate((texto, y) => {
    const e = [...document.querySelectorAll('h1, h2, h3, h4, p, span, div')].find((x) => x.children.length === 0 && x.textContent.trim() === texto);
    if (!e) return 'no está: ' + texto;
    const delta = e.getBoundingClientRect().top - y;
    let c = e.parentElement;
    while (c && !(c.scrollHeight > c.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(c).overflowY))) c = c.parentElement;
    (c || window).scrollBy({ top: delta, behavior: 'instant' });
    return 'ok ' + Math.round(delta);
  }, texto, y);
  const video = (prefijo, n, cps, salida) => execFileSync(FFMPEG, ['-v', 'error', '-y', '-framerate', String(cps), '-i', path.join(SAL, prefijo + '-%02d.png'), '-vf', 'tpad=stop_mode=clone:stop_duration=0.8,fps=30,scale=1080:1920:flags=lanczos,setsar=1', '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', path.join(SAL, salida)], { stdio: 'inherit' });

  // 1. El calendario del mes pasado: se llena día por día
  const hoy = new Date(); hoy.setHours(12, 0, 0, 0);
  const primero = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1, 12), diasMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  let k = 0;
  if (SOLO !== 'grafica') {
  for (let d = 0; d <= diasMes; d++) {
    const hasta = new Date(primero); hasta.setDate(d);            // d = 0 es el último día del mes de antes: el mes en blanco
    await poner(fecha(hasta));
    await irA('Progreso', 'Calendario', 'Mes anterior');
    const r = await llevar('Toca un día para cambiarlo', 150);
    await esperar(350);
    await page.screenshot({ path: path.join(SAL, 'cal-' + p2(k++) + '.png') });
    if (d === 0) console.log('calendario:', r);
  }
  video('cal', k, 14, 'calendario.mp4');
  console.log('calendario.mp4:', k, 'fotos');
  }

  // 2. La gráfica de Progreso: la figura se va formando a medida que pasan los días
  k = 0; const PASOS = 34, DESDE = 34;              // la fuerza mira lo reciente: la figura se forma en el último mes
  if (SOLO !== 'calendario') {
  for (let i = 0; i <= PASOS; i++) {
    await poner(hace(Math.round(DESDE * (1 - i / PASOS))));
    await irA('Progreso');
    const r = await llevar('Fuerza de tus hábitos', 96);
    await esperar(350);
    await page.screenshot({ path: path.join(SAL, 'graf-' + p2(k++) + '.png') });
    if (i === 0) console.log('gráfica:', r);
  }
  video('graf', k, 13, 'grafica.mp4');
  console.log('grafica.mp4:', k, 'fotos · errores:', errores.slice(0, 3));
  }
  // la muestra queda como estaba
  await page.evaluate((R) => localStorage.setItem('racha_registros', JSON.stringify(R)), R);
  await browser.close();
})();
