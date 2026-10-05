// Capturas reales de la app para el PDF: Hoy con el día difícil activo y una tarea abierta con sus pasos.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const SAL = path.join(__dirname, 'app');
fs.mkdirSync(SAL, { recursive: true });
const hoyD = new Date(Date.now() - 5 * 3600000);
const f = (n) => new Date(hoyD.getTime() + n * 86400000).toISOString().slice(0, 10);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function semilla(F) {
  if (sessionStorage.sembrado) return;
  sessionStorage.sembrado = '1';
  const c = '2026-09-01T10:00:00.000Z';
  const S = (id, t, extra = {}) => ({ id, texto: t, hecha: false, ...extra });
  localStorage.racha_onboarding_visto = 'true';
  localStorage.racha_nombre = 'Laura';
  localStorage.racha_apariencia = 'oscuro';
  localStorage.racha_pista_mantener = '1';
  const H = [
    { id: 'leer', nombre: 'Leer 20 páginas', color: '#FFB547', icono: 'BookOpen', momento: 'manana', frecuencia: 'diario', minimo: 'Leer 1 página', creadoEn: c },
    { id: 'entrenar', nombre: 'Entrenar 40 minutos', color: '#FFB547', icono: 'Footprints', momento: 'tarde', frecuencia: 'diario', minimo: '5 minutos de estiramiento', creadoEn: c },
    { id: 'estudiar', nombre: 'Estudiar 1 hora', color: '#8E9BFF', icono: 'Target', momento: 'noche', frecuencia: 'diario', minimo: 'Repasar 5 minutos', creadoEn: c },
  ];
  localStorage.racha_habitos = JSON.stringify(H);
  const R = [];
  for (let d = 1; d <= 12; d++) for (const h of H) R.push({ habitoId: h.id, fecha: F[d], completado: true });
  R.push({ habitoId: 'leer', fecha: F[0], completado: true, minimo: true });
  localStorage.racha_registros = JSON.stringify(R);
  localStorage.racha_dias_dificiles = JSON.stringify([F[0]]);
  localStorage.racha_tareas = JSON.stringify([
    { id: 't1', nombre: 'Sacar el pasaporte', icono: 'FileText', color: '#fff', completada: false, creadoEn: c, subtareas: [
      S('a1', 'Revisar los requisitos en la página oficial', { hecha: true }),
      S('a2', 'Pedir la cita'),
      S('a3', 'Alistar la cédula y el pago'),
      S('a4', 'Ir a la cita'),
      S('a5', 'Reclamar el pasaporte'),
    ] },
  ]);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', (r) => (r.url().includes('.supabase.co') ? r.abort() : r.continue()));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await page.evaluateOnNewDocument(semilla, Array.from({ length: 13 }, (_, i) => f(-i)));
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: '.onb.fixed.inset-0{display:none!important}' });
  await page.waitForSelector('header');
  await esperar(800);
  await page.addStyleTag({ content: 'nav{display:none!important}' });
  await page.screenshot({ path: path.join(SAL, 'hoy.png'), fullPage: true });
  await page.screenshot({ path: path.join(SAL, 'clip-dificil.png'), clip: { x: 14, y: +process.argv[2] || 800, width: 362, height: 318 } });
  const cajas = await page.evaluate(() => {
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    return { tuDia: r(document.querySelector('section[aria-label="Tu día"]')), ddon: r(document.querySelector('.ddon')), minimos: [...document.querySelectorAll('.ddmin')].map((e) => [e.textContent, r(e)]), alto: document.documentElement.scrollHeight };
  });
  console.log(JSON.stringify(cajas));

  // Tareas: abrir la tarea
  const tocar = async (sel, src) => {
    const h = await page.evaluateHandle((sel, src) => { const re = new RegExp(src); return [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length && (re.test(e.getAttribute('aria-label') || '') || re.test((e.textContent || '').trim()))) || null; }, sel, src);
    const el = h.asElement(); if (!el) { console.log('no encontré', sel, src); return; }
    await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await el.tap(); await esperar(500);
  };
  await page.addStyleTag({ content: 'nav{display:flex!important}' });
  await tocar('nav button', '^Tareas');
  await esperar(500);
  await page.screenshot({ path: path.join(SAL, 'tareas.png') });
  await tocar('button, [role="button"], li', 'Sacar el pasaporte');
  await esperar(700);
  await page.screenshot({ path: path.join(SAL, 'tarea.png') });
  await page.screenshot({ path: path.join(SAL, 'clip-tarea.png'), clip: { x: 20, y: 345, width: 350, height: 168 } });
  console.log('errores:', errores.join(' | ') || 'ninguno');
  await browser.close();
})();
