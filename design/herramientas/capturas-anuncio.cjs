// Capturas reales de la app para los videos de anuncios (9:16, 1170 x 2079).
// Necesita la app corriendo en localhost:3002 y puppeteer-core (ver LEEME).
// Uso: NODE_PATH="<carpeta temporal>/node_modules" node capturas-anuncio.js
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const SAL = path.join(__dirname, '..', 'anuncios', 'xiomara', 'app');
fs.mkdirSync(SAL, { recursive: true });
const hoyD = new Date(Date.now() - 5 * 3600000);
const f = (n) => new Date(hoyD.getTime() + n * 86400000).toISOString().slice(0, 10);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const F = Array.from({ length: 20 }, (_, i) => f(-i));

// caso: 'pesado' (hoy sin marcar, racha de 12), 'comodin' (ayer quedó sin marcar), 'volviste' (3 días grises antes de hoy)
function semilla(F, caso) {
  if (sessionStorage.sembrado) return;
  sessionStorage.sembrado = '1';
  const c = '2026-09-01T10:00:00.000Z';
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
  const desde = caso === 'comodin' ? 2 : caso === 'volviste' ? 4 : 1;
  for (let d = desde; d <= desde + 11; d++) for (const h of H) R.push({ habitoId: h.id, fecha: F[d], completado: true });
  localStorage.racha_registros = JSON.stringify(R);
  localStorage.racha_tareas = '[]';
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const errores = [];
  const abrir = async (caso) => {
    const page = await browser.newPage();
    page.on('pageerror', (e) => errores.push(caso + ': ' + e.message));
    await page.setRequestInterception(true);
    page.on('request', (r) => (r.url().includes('.supabase.co') ? r.abort() : r.continue()));
    await page.setViewport({ width: 390, height: 693, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await page.evaluateOnNewDocument(semilla, F, caso);
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: '.onb.fixed.inset-0{display:none!important}' });
    await page.waitForSelector('header');
    await esperar(900);
    return page;
  };
  const buscar = (page, src) => page.evaluateHandle((src) => {
    const re = new RegExp(src);
    const todos = [...document.querySelectorAll('button, a, [role="button"], p, span, div')].filter((e) => e.getClientRects().length);
    const ok = todos.filter((e) => re.test(e.getAttribute('aria-label') || '') || re.test((e.textContent || '').trim()));
    // el más pequeño que cumple (el más específico)
    ok.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
    return ok.find((e) => e.matches('button, a, [role="button"]')) || ok[0] || null;
  }, src);
  const centrar = async (page, src, bloque = 'center') => {
    const h = await buscar(page, src); const el = h.asElement();
    if (!el) { console.log('FALLA: no encontré', src); return null; }
    await el.evaluate((e, b) => e.scrollIntoView({ block: b }), bloque); await esperar(350);
    return el;
  };
  const tocar = async (page, src) => { const el = await centrar(page, src); if (el) { await el.tap(); await esperar(700); } return !!el; };
  const foto = async (page, nombre) => { await page.screenshot({ path: path.join(SAL, nombre + '.png') }); console.log('foto', nombre); };
  const caja = async (page, src) => { const h = await buscar(page, src); const el = h.asElement(); if (!el) return null; const b = await el.boundingBox(); return b && [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };

  // Zona de un texto: el elemento más pequeño que lo contiene, subiendo hasta un contenedor de al menos `ancho` px.
  const zona = (page, src, ancho) => page.evaluate((src, ancho) => {
    const re = new RegExp(src);
    const todos = [...document.querySelectorAll('h1,h2,h3,button,a,p,span,b,div,section')].filter((e) => e.getClientRects().length && re.test((e.textContent || '').trim()));
    todos.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
    let e = todos[0]; if (!e) return null;
    while (e.parentElement && e.getBoundingClientRect().width < ancho) e = e.parentElement;
    const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, src, ancho);
  const hoja = (page) => page.evaluate(() => { const e = document.querySelector('.tsheet'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const recorte = async (page, nombre, x, y, w, h) => {
    // Las medidas vienen de la ventana; `clip` va en medidas de la página: se suma lo que está bajado.
    const s = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    const clip = { x: Math.max(0, Math.round(x + s.x)), y: Math.max(0, Math.round(y + s.y)), width: Math.round(w), height: Math.round(h) };
    await page.screenshot({ path: path.join(SAL, nombre + '.png'), clip }); console.log('recorte', nombre, JSON.stringify(clip));
  };

  // 1. Día pesado
  let p = await abrir('pesado');
  await foto(p, 'a0-hoy-arriba');
  await centrar(p, 'Haz solo lo mínimo|Día pesado');
  await foto(p, 'a1-dia-pesado');
  console.log('caja a1', JSON.stringify(await caja(p, 'Haz solo lo mínimo|Día pesado')));
  { const z = await zona(p, '^Hacer solo lo mínimo$', 300); if (z) await recorte(p, 'rec-a1-dia-pesado', z.x - 4, z.y - 4, z.w + 8, z.h + 8); else console.log('FALLA: zona a1'); }
  await tocar(p, '^Hacer solo lo mínimo$');
  await foto(p, 'a2-hoja-dificil');
  { const z = await hoja(p); if (z) await recorte(p, 'rec-a2-hoja', z.x, z.y + 6, z.w, Math.min(z.h - 6, 440)); else console.log('FALLA: zona a2'); }
  await tocar(p, '^Activar día difícil$');
  await esperar(600);
  await centrar(p, '^Mínimo: ');
  await foto(p, 'a3-minimos');
  const marcar = await p.evaluate(() => [...document.querySelectorAll('button[aria-label]')].filter((e) => e.getClientRects().length).map((e) => e.getAttribute('aria-label')).filter((t) => /Leer|Marcar|Completar/.test(t)));
  console.log('botones', JSON.stringify(marcar));
  await tocar(p, '^(Marcar|Completar).*Leer');
  await esperar(900);
  await centrar(p, 'versión mínima');
  await foto(p, 'a4-minimo-hecho');
  console.log('caja a4', JSON.stringify(await caja(p, 'versión mínima')));
  { const a = await zona(p, '^Misiones$', 60); const b = await zona(p, '5 minutos de estiramiento', 330); if (a && b) await recorte(p, 'rec-a4-minimo-hecho', 12, a.y - 10, 366, b.y + b.h + 10 - (a.y - 10)); else console.log('FALLA: zona a4', JSON.stringify([a, b])); }
  await p.close();

  // 2. Comodín
  p = await abrir('comodin');
  await centrar(p, 'Ayer quedó sin marcar');
  await foto(p, 'b1-ayer-sin-marcar');
  console.log('caja b1', JSON.stringify(await caja(p, 'Ayer quedó sin marcar')));
  await tocar(p, 'Ayer quedó sin marcar');
  await foto(p, 'b2-comodines');
  console.log('caja b2', JSON.stringify(await caja(p, '^Congelar ayer')));
  { const z = await hoja(p); const b = await zona(p, '^Congelar ayer', 300); if (z && b) await recorte(p, 'rec-b2-comodines', z.x, z.y + 6, z.w, b.y + b.h + 18 - z.y - 6); else console.log('FALLA: zona b2'); }
  await p.close();

  // 3. Volviste
  p = await abrir('volviste');
  await foto(p, 'c0-antes');
  const marcar2 = await p.evaluate(() => [...document.querySelectorAll('button[aria-label]')].filter((e) => e.getClientRects().length).map((e) => e.getAttribute('aria-label')).filter((t) => /Leer/.test(t)));
  console.log('botones', JSON.stringify(marcar2));
  await tocar(p, '^(Marcar|Completar).*Leer');
  await esperar(1500);
  await foto(p, 'c1-despues-de-marcar');
  await centrar(p, '^Volviste');
  await foto(p, 'c2-volviste');
  console.log('caja c2', JSON.stringify(await caja(p, '^Volviste')));
  { const a = await zona(p, '^Tu día', 330); const b = await zona(p, '^Volviste', 300); if (a && b) await recorte(p, 'rec-c2-volviste', a.x - 4, a.y - 4, a.w + 8, Math.min(a.h + 8, b.y + b.h + 80 - a.y)); else console.log('FALLA: zona c2', JSON.stringify([a, b])); }
  await p.close();

  console.log('errores:', errores.join(' | ') || 'ninguno');
  await browser.close();
})();
