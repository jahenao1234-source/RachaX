// Capturas reales de la app para el guion 1 de la campaña: la pantalla "Nuevo hábito"
// con el nombre, el "Después de ___" y la versión mínima llenos.
// Necesita la app corriendo en localhost:3002 y puppeteer-core (ver LEEME).
// Uso: NODE_PATH="<carpeta temporal>/node_modules" node capturas-campana-g1.cjs
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const SAL = path.join(__dirname, '..', 'anuncios', 'campana', 'guion1', 'app');
fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function semilla() {
  if (sessionStorage.sembrado) return;
  sessionStorage.sembrado = '1';
  localStorage.clear();
  localStorage.racha_onboarding_visto = 'true';
  localStorage.racha_nombre = 'Laura';
  localStorage.racha_apariencia = 'oscuro';
  localStorage.racha_pista_mantener = '1';
  localStorage.racha_habitos = '[]';
  localStorage.racha_registros = '[]';
  localStorage.racha_tareas = '[]';
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', (r) => (r.url().includes('.supabase.co') ? r.abort() : r.continue()));
  await page.setViewport({ width: 390, height: 693, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await page.evaluateOnNewDocument(semilla);
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: '.onb.fixed.inset-0{display:none!important}' });
  await page.waitForSelector('header');
  await esperar(800);
  const tocarTexto = async (src) => {
    const h = await page.evaluateHandle((src) => { const re = new RegExp(src); return [...document.querySelectorAll('button, [role="button"], a')].find((e) => e.getClientRects().length && (re.test(e.getAttribute('aria-label') || '') || re.test((e.textContent || '').trim()))) || null; }, src);
    const el = h.asElement(); if (!el) { console.log('FALLA: no encontré', src); return false; }
    await el.tap(); await esperar(700); return true;
  };
  await tocarTexto('^Crear$');
  await page.screenshot({ path: path.join(SAL, 'n0-menu.png') });
  await tocarTexto('Nuevo hábito');
  await esperar(500);
  const escribir = async (sel, texto) => { const el = await page.$(sel); if (!el) { console.log('FALLA: no encontré', sel); return; } await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await el.tap(); await el.type(texto, { delay: 15 }); await esperar(250); };
  await escribir('input[placeholder="Ej. Salir a caminar"]', 'Leer');
  await escribir('input[placeholder="algo que ya haces"]', 'tomar café');
  await page.screenshot({ path: path.join(SAL, 'n1-nombre-y-despues.png') });
  await escribir('#dd-min', '1 página');
  await page.screenshot({ path: path.join(SAL, 'n2-minimo.png') });
  // Zonas, en medidas de la ventana
  const cajas = await page.evaluate(() => {
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    return { nombre: r(document.querySelector('input[placeholder="Ej. Salir a caminar"]')), despues: r(document.querySelector('input[placeholder="algo que ya haces"]')), minimo: r(document.querySelector('#dd-min')), scroll: window.scrollY, alto: document.documentElement.scrollHeight };
  });
  console.log(JSON.stringify(cajas));
  await page.screenshot({ path: path.join(SAL, 'n3-completa.png'), fullPage: true });
  console.log('errores:', errores.join(' | ') || 'ninguno');
  await browser.close();
})();
