// Lo mismo que grabar-llenado.cjs, pero en la versión de escritorio de Racha (pedido de Johnatan, 10 oct):
// "moviéndose toda la pantalla, se van llenando las gráficas, el calendario… y lo mismo cuando se hacen los hábitos".
// Es la app de verdad (la Racha de muestra): en cada paso se le deja la historia hasta cierto día, se recarga y se
// le toma una foto. Salen dos videos horizontales (1920 × 1080) en campana/app-llenado/:
//   escritorio-hoy.mp4       Hoy: las barritas de cada hábito se llenan con los días y al final se marcan los de hoy
//   escritorio-progreso.mp4  Progreso: la gráfica se forma, los récords suben y los cuadritos del año se llenan
// Necesita la muestra corriendo (npm.cmd run muestra, puerto 3003), puppeteer-core y ffmpeg.
// Uso: NODE_PATH="<carpeta con node_modules>" node design/herramientas/grabar-llenado-escritorio.cjs [prueba | hoy | progreso]
// Con VERTICAL=1 la ventana del computador es alta y angosta (1024 × 1820, ya en 9:16) y el menú va cerrado: solo deja las
// fotos (vhoy-NN.png y vprog-NN.png); el video vertical se arma después, con la cámara moviéndose a lo que importa.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const SAL = path.join(__dirname, '..', 'anuncios', 'campana', 'app-llenado');
fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const PRUEBA = process.argv.includes('prueba');
const SOLO = ['hoy', 'progreso'].find((x) => process.argv.includes(x));
const V = process.env.VERTICAL === '1', PRE = V ? 'v' : 'e';
const ANCHO = V ? 1024 : 1600, ALTO = V ? 1820 : 900, ALTO_PROGRESO = V ? 1820 : Number(process.env.ALTO_PROGRESO || 1800);

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: ANCHO, height: ALTO, deviceScaleFactor: 2 });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'nada');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('nav, header', { timeout: 20000 });
  await esperar(1500);
  if (V) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Cerrar el menú' || e.getAttribute('aria-label') === 'Cerrar el menú'); if (b) b.click(); }); await esperar(500); }
  const R = await page.evaluate(() => JSON.parse(localStorage.getItem('racha_registros')));
  const HABITOS = await page.evaluate(() => JSON.parse(localStorage.getItem('racha_habitos') || '[]').map((h) => h.id));
  const p2 = (n) => String(n).padStart(2, '0');
  const fecha = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const hace = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return fecha(d); };
  const limpio = '::-webkit-scrollbar { display: none; } * { caret-color: transparent !important; }';
  // deja los registros hasta cierto día (y, si se pide, los primeros N hábitos de hoy ya marcados) y recarga
  const poner = async (hasta, hoyHechos = 0) => {
    const reg = R.filter((r) => r.fecha <= hasta && r.fecha < hace(0));
    HABITOS.slice(0, hoyHechos).forEach((id) => reg.push({ habitoId: id, fecha: hace(0), completado: true }));
    await page.evaluate((reg) => localStorage.setItem('racha_registros', JSON.stringify(reg)), reg);
    for (let intento = 0; intento < 4; intento++) {
      try { await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0', timeout: 25000 }); await page.waitForSelector('nav, header', { timeout: 12000 }); break; }
      catch (e) { console.log('recarga lenta, va otra vez'); await esperar(1500); }
    }
    await page.addStyleTag({ content: limpio });
  };
  const tocar = (texto) => page.evaluate((t) => { const b = [...document.querySelectorAll('button, a, [role="tab"]')].find((e) => e.textContent.trim() === t || e.getAttribute('aria-label') === t); if (b) { b.click(); return true; } return false; }, texto);
  const video = (prefijo, cps, salida, filtro) => execFileSync(FFMPEG, ['-v', 'error', '-y', '-framerate', String(cps), '-i', path.join(SAL, prefijo + '-%02d.png'), '-vf', `tpad=stop_mode=clone:stop_duration=1.0,fps=30,${filtro},setsar=1`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', path.join(SAL, salida)], { stdio: 'inherit' });

  if (PRUEBA) {
    console.log('hábitos:', HABITOS.length, '· registros:', R.length);
    await poner(hace(1), 2); await esperar(600);
    await page.screenshot({ path: path.join(SAL, 'prueba-e1-hoy.png') });
    await tocar('Progreso'); await esperar(700);
    await page.setViewport({ width: ANCHO, height: ALTO_PROGRESO, deviceScaleFactor: 1 }); await esperar(500);
    await page.screenshot({ path: path.join(SAL, 'prueba-e2-progreso.png') });
    console.log('alto del contenido:', await page.evaluate(() => Math.max(document.documentElement.scrollHeight, ...[...document.querySelectorAll('main, div')].map((e) => e.scrollHeight))));
    console.log('errores:', errores.slice(0, 3));
    await browser.close(); return;
  }

  // 1. Hoy: las barritas de cada hábito se llenan con los últimos días y después se marcan los de hoy, uno por uno
  if (SOLO !== 'progreso') {
    let k = 0;
    for (let d = 16; d >= 1; d--) { await poner(hace(d), 0); await esperar(300); await page.screenshot({ path: path.join(SAL, PRE + 'hoy-' + p2(k++) + '.png') }); }
    for (let h = 1; h <= HABITOS.length; h++) { await poner(hace(1), h); await esperar(300); const foto = path.join(SAL, PRE + 'hoy-' + p2(k++) + '.png'); await page.screenshot({ path: foto }); fs.copyFileSync(foto, path.join(SAL, PRE + 'hoy-' + p2(k++) + '.png')); }
    if (!V) video('ehoy', 9, 'escritorio-hoy.mp4', 'scale=1920:1080:flags=lanczos');
    console.log('escritorio-hoy.mp4:', k, 'fotos');
  }
  // 2. Progreso: toda la historia crece (4 meses); la cámara baja por la pantalla mientras todo se llena
  if (SOLO !== 'hoy') {
    await page.setViewport({ width: ANCHO, height: ALTO_PROGRESO, deviceScaleFactor: V ? 2 : 1.5 });
    let k = 0; const PASOS = Number(process.env.PASOS || 44), DESDE = Number(process.env.DESDE || 118), pn = (n) => String(n).padStart(PASOS > 99 ? 3 : 2, '0');
    for (let i = 0; i <= PASOS; i++) {
      await poner(hace(Math.round(DESDE * (1 - i / PASOS))), i === PASOS ? HABITOS.length : 0);
      await tocar('Progreso'); await esperar(450);
      await page.screenshot({ path: path.join(SAL, PRE + 'prog-' + pn(k++) + '.png') });
    }
    // la ventana de 16:9 baja despacio por la pantalla completa
    const dur = (k / 11 + 1.0).toFixed(2), recorrido = Math.round((ALTO_PROGRESO - ALTO) * 1.5);
    if (!V) video('eprog', 11, 'escritorio-progreso.mp4', `crop=${ANCHO * 1.5}:${ALTO * 1.5}:0:'min(${recorrido}, ${recorrido}*t/${(k / 11).toFixed(2)})',scale=1920:1080:flags=lanczos`);
    console.log('escritorio-progreso.mp4:', k, 'fotos ·', dur, 's · errores:', errores.slice(0, 3));
  }
  await page.evaluate((R) => localStorage.setItem('racha_registros', JSON.stringify(R)), R);
  await browser.close();
})();
