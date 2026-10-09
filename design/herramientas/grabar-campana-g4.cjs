// Graba la Racha de muestra EN MOVIMIENTO para el guion 4 ("Lo aplazado, en pasos"), a pantalla completa (1080 x 1920),
// como una grabación de pantalla del celular. Son tres tomas sueltas; después se cortan al ritmo de la voz de Lina.
//   1-escribe:  Tareas -> "Nueva tarea" -> se escribe "Organizar el cuarto" (la tarea anotada así de grande)
//   2-pasos:    se abre "Organizar el cuarto" con sus pasos y se le pone día a dos de ellos
//   3-hoy:      la pantalla Hoy con "Recoger la ropa del piso y de la silla" en "Tareas de hoy", y se marca
// En la muestra esa tarea viene terminada: aquí se deja sin hacer, con el primer paso para hoy (solo en este navegador invisible).
// Necesita la muestra corriendo (npm.cmd run muestra, puerto 3003), puppeteer-core y ffmpeg.
// Uso: NODE_PATH="<carpeta temporal>/node_modules" node design/herramientas/grabar-campana-g4.cjs
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const FFMPEG = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const SAL = path.join(__dirname, '..', 'anuncios', 'campana', 'guion4', 'app');
fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const SALTO = String.fromCharCode(10);

(async () => {
  // Chrome entero a triple densidad, para que la grabación en movimiento salga nítida (ver grabar-campana-g3.cjs)
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars', '--force-device-scale-factor=3', '--window-size=600,900'], defaultViewport: null });
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 693, deviceScaleFactor: 0, mobile: true });   // 390 x 693 = 9:16
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'medias');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('header', { timeout: 20000 });
  await esperar(1800);

  const estilo = () => page.addStyleTag({ content: `
    @keyframes toque-g4 { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 25% { opacity: 0.95; } 60% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; } }
    .toque-g4 { position: fixed; z-index: 99999; width: 54px; height: 54px; border-radius: 27px; background: rgba(255, 255, 255, 0.55); border: 3px solid rgba(255, 255, 255, 0.95); box-shadow: 0 0 0 6px rgba(255, 181, 71, 0.35); pointer-events: none; animation: toque-g4 0.5s ease-out forwards; }
    ::-webkit-scrollbar { display: none; }` });
  await estilo();
  const buscar = (re, cual = 0) => page.evaluate((src, cual) => {
    const re = new RegExp(src);
    const e = [...document.querySelectorAll('button, [role="button"], a, input')].filter((x) => x.getClientRects().length && (re.test(x.getAttribute('aria-label') || '') || re.test((x.textContent || '').trim()) || re.test(x.placeholder || '')))[cual];
    if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  }, re, cual);

  // Una toma: graba mientras corre `pasos`; cada toque queda anotado con su segundo
  const toma = async (nombre, pasos) => {
    const TMP = path.join(SAL, 'cuadros'); fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
    const cuadros = []; const escrituras = []; const marcas = [];
    const alCuadro = (f) => {
      const archivo = 'c' + String(cuadros.length).padStart(4, '0') + '.png';
      cuadros.push({ archivo, t: f.metadata.timestamp });
      escrituras.push(fs.promises.writeFile(path.join(TMP, archivo), Buffer.from(f.data, 'base64')));
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    };
    cdp.on('Page.screencastFrame', alCuadro);
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
    const t0 = Date.now();
    const ahora = () => Number(((Date.now() - t0) / 1000).toFixed(2));
    const tocar = async (que, re, cual) => {
      const p = await buscar(re, cual); if (!p) { console.log('FALLA: no encontré', re); return; }
      await page.evaluate((x, y) => { const d = document.createElement('div'); d.className = 'toque-g4'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 700); }, p.x, p.y);
      await esperar(150);
      marcas.push({ que, t: ahora(), x: Math.round(p.x), y: Math.round(p.y) });
      await page.touchscreen.tap(p.x, p.y);
    };
    const marca = (que) => marcas.push({ que, t: ahora() });
    await esperar(700);
    await pasos({ tocar, marca });
    const fin = ahora();
    await cdp.send('Page.stopScreencast');
    cdp.off('Page.screencastFrame', alCuadro);
    await Promise.all(escrituras);
    const seg = (c) => c.t - t0 / 1000;
    const lista = cuadros.map((c, i) => `file '${c.archivo}'` + SALTO + `duration ${Math.max(0.001, (cuadros[i + 1] ? seg(cuadros[i + 1]) : fin) - Math.max(0, seg(c))).toFixed(4)}`);
    lista.push(`file '${cuadros[cuadros.length - 1].archivo}'`);
    fs.writeFileSync(path.join(TMP, 'lista.txt'), lista.join(SALTO), 'utf8');
    execFileSync(FFMPEG, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(TMP, 'lista.txt'), '-vf', 'fps=30,scale=1080:1920:flags=lanczos,setsar=1', '-t', String(fin), '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-g', '15', '-movflags', '+faststart', path.join(SAL, nombre + '.mp4')], { stdio: 'inherit' });
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.writeFileSync(path.join(SAL, nombre + '.json'), JSON.stringify({ dura: fin, cuadros: cuadros.length, marcas }, null, 1), 'utf8');
    console.log(nombre, 'dura', fin, 's ·', cuadros.length, 'cuadros ·', marcas.map((m) => `${m.que} ${m.t}`).join(' | '));
  };
  const ir = async (re) => { const p = await buscar(re); await page.touchscreen.tap(p.x, p.y); await esperar(900); };

  // ---- toma 1: se escribe la tarea, así de grande ----
  await ir('^Tareas$');
  await page.evaluate(() => window.scrollTo(0, 0)); await esperar(400);
  await toma('1-escribe', async ({ tocar, marca }) => {
    await tocar('nueva tarea', 'Nueva tarea'); await esperar(900);
    await tocar('campo', 'Qué quieres lograr'); await esperar(400);
    marca('empieza a escribir');
    await page.keyboard.type('Organizar el cuarto', { delay: 75 });
    marca('termina de escribir');
    await esperar(1600);
  });
  await ir('^Cancelar$');

  // ---- la tarea "Organizar el cuarto", sin hacer y con el primer paso para hoy ----
  await page.evaluate(() => {
    const p = (n) => String(n).padStart(2, '0'); const d = new Date(); const hoy = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    const ts = JSON.parse(localStorage.racha_tareas);
    const t = ts.find((x) => x.id === 'demo-t4');
    t.completada = false; delete t.completadaEn;
    const limpiar = (s) => { s.hecha = false; delete s.hechaEn; delete s.fecha; delete s.momento; (s.subtareas || []).forEach(limpiar); };
    t.subtareas.forEach(limpiar);
    t.subtareas[0].subtareas[0].fecha = hoy; t.subtareas[0].subtareas[0].momento = 'tarde';
    localStorage.racha_tareas = JSON.stringify([t, ...ts.filter((x) => x !== t)]);
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('header'); await esperar(1500);
  await estilo();

  // ---- toma 3 (se graba antes de ponerle día a los otros pasos): Hoy con el paso de hoy, y se marca ----
  await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find((x) => x.children.length === 0 && /^Tareas de hoy$/.test((x.textContent || '').trim())); if (e) window.scrollBy(0, e.getBoundingClientRect().top - 470); });
  await esperar(600);
  await toma('3-hoy', async ({ tocar, marca }) => {
    await esperar(500);
    marca('baja');
    await page.evaluate(() => window.scrollBy({ top: 330, behavior: 'smooth' }));
    await esperar(2200);
    await tocar('marcar', '^Marcar Recoger la ropa del piso'); await esperar(2600);
  });
  // se deshace la marca para la toma de los pasos
  await page.evaluate(() => { const ts = JSON.parse(localStorage.racha_tareas); const s = ts[0].subtareas[0].subtareas[0]; s.hecha = false; delete s.hechaEn; localStorage.racha_tareas = JSON.stringify(ts); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('header'); await esperar(1500);
  await estilo();

  // ---- toma 2: la tarea por pasos, y se le pone día a dos ----
  await ir('^Tareas$');
  await page.evaluate(() => window.scrollBy(0, 205)); await esperar(500);
  await toma('2-pasos', async ({ tocar }) => {
    await esperar(600);
    await tocar('abre la tarea', '^Organizar el cuarto'); await esperar(1900);
    await tocar('día del paso 2', 'Ponerle día a Sacar platos'); await esperar(1100);
    await tocar('mañana', '^Mañana'); await esperar(1500);
    await tocar('día del paso 3', 'Ponerle día a Llenar una bolsa'); await esperar(1100);
    await tocar('sábado', '^sábado'); await esperar(2000);
  });

  console.log('errores:', errores.join(' | ') || 'ninguno');
  await browser.close();
})();
