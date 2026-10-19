// La Racha de muestra llenándose, al tamaño de la pantalla de las tomas de Johnatan (15 oct de 2026), para meterla DENTRO
// de sus tomas con pantalla-reemplazo.py. Las tomas del 15 oct son de otro computador: el navegador mide 1440 × 900.
//   ref <Hoy|Tareas|Tu semana|Progreso> <carpeta>   la pantalla como la grabó él (la muestra tal cual): ref-<pantalla>-NNNN.png
//                                                   (DESDE_Y / HASTA_Y / PASO: varias bajadas, para medir con bajada.py)
//   hoy <carpeta>      la semana de cada hábito se llena día por día (lunes, martes…) y después se marcan los de hoy: hoy-NN.png
//   tareas <carpeta>   TAREA abierta: sus pasos arrancan sin hacer y se marcan uno por uno: tareas-NN.png
//   semana <carpeta>   los pasos de esta semana arrancan sin día y caen en su día uno por uno: semana-NN.png
// ANCHO/ALTO (1440 × 900 por defecto), MENU=cerrado, FECHA (el momento en que él grabó: "2026-10-15T17:50:00"), BAJADA (px), TAREA (nombre).
// Necesita la muestra corriendo (puerto 3003), puppeteer-core (NODE_PATH) y Chrome.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const [modo, a1, a2] = process.argv.slice(2);
const PANTALLA = modo === 'ref' ? a1 : { hoy: 'Hoy', tareas: 'Tareas', semana: 'Tu semana' }[modo];
const SAL = path.resolve(modo === 'ref' ? a2 : a1);
fs.mkdirSync(SAL, { recursive: true });
const ANCHO = Number(process.env.ANCHO || 1440), ALTO = Number(process.env.ALTO || 900), BAJADA = Number(process.env.BAJADA || 0);
const TAREA = process.env.TAREA || 'Sacar o renovar el pasaporte';

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: ANCHO, height: ALTO, deviceScaleFactor: Number(process.env.DPR || 2) });
  const DESFASE = process.env.FECHA ? new Date(process.env.FECHA).getTime() - Date.now() : 0;
  if (DESFASE) await page.evaluateOnNewDocument((off) => { const D = Date; class F extends D { constructor(...a) { if (a.length === 0) super(D.now() + off); else super(...a); } static now() { return D.now() + off; } } window.Date = F; }, DESFASE);
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'nada');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('nav, header', { timeout: 20000 });
  await esperar(1500);
  const leer = (k) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), k);
  // MENU=cerrado: en varias tomas el menú de la izquierda está cerrado (la app lo recuerda)
  if (process.env.MENU === 'cerrado') { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Cerrar el menú' || e.getAttribute('aria-label') === 'Cerrar el menú'); if (b) b.click(); }); await esperar(400); }
  const R = await leer('racha_registros'), T = await leer('racha_tareas'), H = await leer('racha_habitos');
  const limpio = '::-webkit-scrollbar { display: none; } * { caret-color: transparent !important; }';
  const cerrarPremios = async () => { for (let quieto = 0, v = 0; quieto < 4 && v < 30; v++) { const habia = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Seguir'); if (b) { b.click(); return true; } return false; }); quieto = habia ? 0 : quieto + 1; await esperar(150); } };
  const tocar = (texto) => page.evaluate((t) => { const b = [...document.querySelectorAll('button, a, [role="tab"]')].find((e) => e.textContent.trim() === t || e.getAttribute('aria-label') === t); if (b) { b.click(); return true; } return false; }, texto);
  // abre la tarea por su nombre en la lista y comprueba que el panel de la derecha muestre esa (si no, reintenta)
  const abrirTarea = async (nombre) => {
    for (let i = 0; i < 6; i++) {
      const listo = await page.evaluate((n) => {
        const titulo = [...document.querySelectorAll('h1, h2, h3')].some((h) => h.textContent.trim() === n && h.getBoundingClientRect().left > 500);
        if (titulo) return true;
        const hoja = [...document.querySelectorAll('*')].find((x) => x.children.length === 0 && x.textContent.trim() === n && x.getBoundingClientRect().left < 700 && x.offsetParent);
        const fila = hoja && (hoja.closest('button, [role="button"], li, [tabindex]') || hoja);
        if (fila) fila.click();
        return false;
      }, nombre);
      if (listo) return true;
      await esperar(350);
    }
    console.log('no se pudo abrir', nombre); return false;
  };
  const bajar = (y) => page.evaluate((y) => {
    const cajas = [document.scrollingElement, ...document.querySelectorAll('main, div')].filter((e) => e && e.scrollHeight > e.clientHeight + 20 && (e === document.scrollingElement || ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)));
    cajas.sort((a, b) => b.scrollHeight - a.scrollHeight);
    if (!cajas.length) return 0; cajas[0].scrollTop = y; return cajas[0].scrollTop;
  }, y);
  // pone los datos, recarga y va a la pantalla
  const poner = async ({ reg = R, tar = T } = {}) => {
    await page.evaluate((reg, tar) => { localStorage.setItem('racha_registros', JSON.stringify(reg)); localStorage.setItem('racha_tareas', JSON.stringify(tar)); }, reg, tar);
    for (let intento = 0; intento < 4; intento++) {
      try { await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0', timeout: 25000 }); await page.waitForSelector('nav, header', { timeout: 12000 }); break; }
      catch (e) { console.log('recarga lenta, va otra vez'); await esperar(1500); }
    }
    await page.addStyleTag({ content: limpio });
    await cerrarPremios();
    if (PANTALLA !== 'Hoy') { await tocar(PANTALLA); await esperar(600); }
    if (PANTALLA === 'Tareas') { await abrirTarea(TAREA); await esperar(500); }
    await cerrarPremios();
  };
  const p2 = (n) => String(n).padStart(2, '0');
  const fecha = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const hoy = new Date(Date.now() + DESFASE); hoy.setHours(12, 0, 0, 0);
  const HOY = fecha(hoy);
  const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const semana = Array.from({ length: 7 }, (_, i) => { const d = new Date(lunes); d.setDate(lunes.getDate() + i); return fecha(d); });
  let k = 0;
  // la celebración de "Día completo" sale sola un momento después: se espera y se cierra antes de la foto
  const foto = async (pre) => { await esperar(500); await cerrarPremios(); await page.keyboard.press('Escape'); await esperar(150); await bajar(BAJADA); await esperar(350); await page.screenshot({ path: path.join(SAL, `${pre}-${p2(k++)}.png`) }); };

  if (modo === 'ref') {
    await poner(); await esperar(400);
    const nombre = PANTALLA.toLowerCase().replace(/\s+/g, '-');
    for (let y = Number(process.env.DESDE_Y || BAJADA); y <= Number(process.env.HASTA_Y || BAJADA); y += Number(process.env.PASO || 20)) {
      const real = await bajar(y); await esperar(250);
      await page.screenshot({ path: path.join(SAL, `ref-${nombre}-${String(real).padStart(4, '0')}.png`) });
    }
  } else if (modo === 'hoy') {
    // la historia de antes del lunes se queda (el nivel y la racha no cambian); esta semana se llena día por día
    const antes = R.filter((r) => r.fecha < semana[0]);
    const dias = semana.filter((d) => d < HOY);
    await poner({ reg: antes }); await foto('hoy');
    for (let i = 1; i <= dias.length; i++) { await poner({ reg: [...antes, ...R.filter((r) => dias.slice(0, i).includes(r.fecha))] }); await foto('hoy'); }
    const pasado = R.filter((r) => r.fecha < HOY);
    const ids = H.filter((h) => !h.archivado).map((h) => h.id);
    for (let i = 1; i <= ids.length; i++) { await poner({ reg: [...pasado, ...ids.slice(0, i).map((id) => ({ habitoId: id, fecha: HOY, completado: true }))] }); await foto('hoy'); }
  } else if (modo === 'tareas') {
    // los pasos de la tarea abierta arrancan sin hacer y se marcan uno por uno, en orden
    const t = T.find((x) => x.nombre === TAREA); if (!t) throw new Error('no está la tarea ' + TAREA);
    const hojas = []; const recorrer = (l) => l.forEach((s) => { if (s.subtareas && s.subtareas.length) recorrer(s.subtareas); else hojas.push(s); }); recorrer(t.subtareas);
    const todos = []; const todosR = (l) => l.forEach((s) => { todos.push(s); if (s.subtareas) todosR(s.subtareas); }); todosR(t.subtareas);
    todos.forEach((s) => { s.hecha = false; delete s.hechaEn; });
    // un paso grande queda hecho cuando están hechos todos los de adentro
    const grandes = todos.filter((s) => s.subtareas && s.subtareas.length);
    const cerrarGrandes = () => grandes.forEach((g) => { const dentro = []; todosR.call(null, []); const rec = (l) => l.forEach((x) => { if (x.subtareas && x.subtareas.length) rec(x.subtareas); else dentro.push(x); }); rec(g.subtareas); if (dentro.every((x) => x.hecha)) { g.hecha = true; g.hechaEn = HOY; } });
    await poner({ tar: T }); await foto('tareas');
    for (const s of hojas) { s.hecha = true; s.hechaEn = HOY; cerrarGrandes(); await poner({ tar: T }); await foto('tareas'); }
    console.log('pasos:', hojas.length);
  } else if (modo === 'semana') {
    const ORDEN = { manana: 0, tarde: 1, noche: 2 };
    const pasos = []; const recorrer = (l) => l.forEach((s) => { if (s.fecha && semana.includes(s.fecha) && !s.hecha) pasos.push(s); if (s.subtareas) recorrer(s.subtareas); });
    T.forEach((t) => recorrer(t.subtareas || []));
    pasos.sort((a, b) => a.fecha.localeCompare(b.fecha) || (ORDEN[a.momento] ?? 3) - (ORDEN[b.momento] ?? 3));
    const g = pasos.map((s) => ({ s, fecha: s.fecha, momento: s.momento }));
    g.forEach(({ s }) => { delete s.fecha; delete s.momento; });
    await poner({ tar: T }); await foto('semana');
    for (const x of g) { x.s.fecha = x.fecha; if (x.momento) x.s.momento = x.momento; await poner({ tar: T }); await foto('semana'); }
    console.log('pasos de la semana:', g.length);
  }
  console.log(modo, PANTALLA, '·', k, 'fotos ·', ANCHO + '×' + ALTO);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
