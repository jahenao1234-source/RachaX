// La Racha de muestra grabada EN MOVIMIENTO (20 oct de 2026), para el POV 3. En el POV v9 el llenado salía "muy laggeado"
// porque eran 7 a 9 fotos sueltas por pantalla; aquí se graba la pantalla de verdad mientras se toca (sus animaciones
// incluidas) y se pasa a 30 cuadros por segundo parejos: f-NNN.jpg, listos para pantalla-reemplazo.py (FOTOS='f-*.jpg').
//   hoy <carpeta>      Hoy: se marcan los hábitos uno por uno (todos menos el último, para que no salga "Día completo")
//   tareas <carpeta>   Tareas › TAREA: sus pasos arrancan sin hacer y se marcan uno por uno
//   foco <carpeta>     Modo Foco con un pomodoro de 25 minutos: el reloj corre VELOCIDAD veces más rápido
// ANCHO/ALTO (1440 × 900), DPR (2), MENU=cerrado, FECHA, TAREA, CADA (segundos entre toques, 0,22), DURA (segundos de foco)
// Necesita la muestra corriendo (puerto 3003), puppeteer-core (NODE_PATH) y Chrome.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const [modo, a1] = process.argv.slice(2);
const SAL = path.resolve(a1);
fs.mkdirSync(SAL, { recursive: true });
for (const f of fs.readdirSync(SAL)) if (/^f-\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(SAL, f));
const ANCHO = Number(process.env.ANCHO || 1440), ALTO = Number(process.env.ALTO || 900), DPR = Number(process.env.DPR || 2);
const TAREA = process.env.TAREA || 'Sacar o renovar el pasaporte';
// LENTO: mientras se graba, las animaciones de la app van LENTO veces más lentas (Chrome solo manda ~12 cuadros por segundo a
// 2880 × 1800); después el tiempo se divide entre LENTO y quedan ~48 cuadros por segundo de animación de verdad
const LENTO = Number(process.env.LENTO || 4);
const CADA = Number(process.env.CADA || 0.22) * 1000 * LENTO;

(async () => {
  // la grabación en movimiento sale a la densidad REAL del navegador (con la emulada sale a 1440 × 900): Chrome entero a DPR
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars', `--force-device-scale-factor=${DPR}`, `--window-size=${ANCHO},${ALTO}`], defaultViewport: null });
  const page = await browser.newPage();
  const cdp0 = await page.createCDPSession();
  await cdp0.send('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: 0, mobile: false });
  // FECHA: la muestra cree que es el momento en que él grabó; window.__vel acelera el reloj (para el pomodoro)
  const DESFASE = process.env.FECHA ? new Date(process.env.FECHA).getTime() - Date.now() : 0;
  await page.evaluateOnNewDocument((off) => {
    const D = Date, t0 = D.now(); window.__vel = 1; window.__base = t0; window.__acum = 0;
    const ahora = () => { const r = D.now(); return t0 + off + window.__acum + (r - window.__base) * window.__vel; };
    window.__acelerar = (v) => { const r = D.now(); window.__acum += (r - window.__base) * window.__vel; window.__base = r; window.__vel = v; };
    class F extends D { constructor(...a) { if (a.length === 0) super(ahora()); else super(...a); } static now() { return ahora(); } }
    window.Date = F;
  }, DESFASE);
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'nada');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('nav, header', { timeout: 20000 });
  await esperar(1500);
  if (process.env.MENU === 'cerrado') { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Cerrar el menú' || e.getAttribute('aria-label') === 'Cerrar el menú'); if (b) b.click(); }); await esperar(400); }
  await page.addStyleTag({ content: '::-webkit-scrollbar { display: none; } * { caret-color: transparent !important; }' });
  const cerrarPremios = async () => { for (let quieto = 0, v = 0; quieto < 4 && v < 30; v++) { const habia = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Seguir'); if (b) { b.click(); return true; } return false; }); quieto = habia ? 0 : quieto + 1; await esperar(150); } };
  const tocar = (texto) => page.evaluate((t) => { const b = [...document.querySelectorAll('button, a, [role="tab"]')].find((e) => e.textContent.trim() === t || e.getAttribute('aria-label') === t); if (b) { b.click(); return true; } return false; }, texto);
  await cerrarPremios();

  // la grabación: cada cuadro que manda Chrome, con su hora; al final se reparte en 30 cuadros por segundo parejos
  const cdp = await page.createCDPSession();
  const cuadros = [];
  cdp.on('Page.screencastFrame', (f) => { cuadros.push({ t: f.metadata.timestamp, data: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / LENTO });
  const empezar = async () => { await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: ANCHO * DPR, maxHeight: ALTO * DPR, everyNthFrame: 1 }); await esperar(300); };
  const terminar = async () => { await esperar(400); await cdp.send('Page.stopScreencast'); };
  // un "latido" invisible que cambia cada cuadro, para que Chrome mande cuadros aunque la pantalla esté quieta
  await page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;z-index:99999;pointer-events:none'; document.body.appendChild(d); let i = 0; const f = () => { d.style.background = i++ % 2 ? '#000' : '#010101'; requestAnimationFrame(f); }; f(); });

  if (modo === 'hoy') {
    const botones = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^Marcar /.test(b.getAttribute('aria-label') || '') && b.offsetParent).map((b) => b.getAttribute('aria-label')));
    console.log('hábitos para marcar:', botones.length, botones.join(' · '));
    await empezar();
    for (const et of botones.slice(0, -1)) { await page.evaluate((et) => { const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === et); if (b) b.click(); }, et); await esperar(CADA); }
    await terminar();
  } else if (modo === 'tareas') {
    // la tarea con todos sus pasos sin hacer
    await page.evaluate((nombre) => {
      const T = JSON.parse(localStorage.getItem('racha_tareas') || '[]');
      const t = T.find((x) => x.nombre === nombre); const rec = (l) => l.forEach((s) => { s.hecha = false; delete s.hechaEn; if (s.subtareas) rec(s.subtareas); }); rec(t.subtareas);
      localStorage.setItem('racha_tareas', JSON.stringify(T));
    }, TAREA);
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0' }); await page.waitForSelector('nav, header'); await esperar(800); await cerrarPremios();
    await tocar('Tareas'); await esperar(700);
    for (let i = 0; i < 6; i++) {
      const listo = await page.evaluate((n) => { if ([...document.querySelectorAll('h1, h2, h3')].some((h) => h.textContent.trim() === n && h.getBoundingClientRect().left > 400)) return true; const hoja = [...document.querySelectorAll('*')].find((x) => x.children.length === 0 && x.textContent.trim() === n && x.getBoundingClientRect().left < 700 && x.offsetParent); const fila = hoja && (hoja.closest('button, [role="button"], li, [tabindex]') || hoja); if (fila) fila.click(); return false; }, TAREA);
      if (listo) break; await esperar(350);
    }
    await esperar(500);
    const casillas = await page.evaluate(() => [...document.querySelectorAll('button, [role="checkbox"]')].filter((b) => b.getBoundingClientRect().left > 400 && /^Marcar /.test(b.getAttribute('aria-label') || '') && b.offsetParent).map((b) => b.getAttribute('aria-label')));
    console.log('pasos para marcar:', casillas.length);
    await empezar();
    for (const et of casillas) { await page.evaluate((et) => { const b = [...document.querySelectorAll('button, [role="checkbox"]')].find((x) => x.getAttribute('aria-label') === et && x.getBoundingClientRect().left > 400); if (b) b.click(); }, et); await esperar(CADA); }
    await terminar();
  } else if (modo === 'foco') {
    // el pomodoro de 25 minutos en el primer paso de "Tareas de hoy" (el ▶ de la fila); el reloj corre VELOCIDAD veces más rápido
    const play = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /pomodoro|Foco|Empezar/i.test(x.getAttribute('aria-label') || '') && x.closest('section, div') && x.offsetParent); if (b) { const et = b.getAttribute('aria-label'); b.click(); return et; } return null; });
    console.log('abrí:', play); await esperar(900);
    await tocar('Empezar'); await esperar(300);
    await empezar();
    await page.evaluate((v) => window.__acelerar(v), Number(process.env.VELOCIDAD || 500) / LENTO);
    await esperar(Number(process.env.DURA || 3) * 1000 * LENTO);
    await terminar();
  }

  // a 30 cuadros por segundo parejos (el cuadro de cada instante es el último que llegó)
  cuadros.forEach((c) => { c.t = c.t / LENTO; });
  const t0 = cuadros[0].t, fin = cuadros.at(-1).t, n = Math.floor((fin - t0) * 30);
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const t = t0 + i / 30; while (j + 1 < cuadros.length && cuadros[j + 1].t <= t) j++;
    fs.writeFileSync(path.join(SAL, `f-${String(i).padStart(3, '0')}.jpg`), Buffer.from(cuadros[j].data, 'base64'));
  }
  console.log(modo, '·', cuadros.length, 'cuadros de Chrome →', n + 1, 'a 30 por segundo (', ((fin - t0)).toFixed(2), 's )');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
