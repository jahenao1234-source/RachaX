const puppeteer = require('puppeteer-core');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function abrir({ ancho = 390, alto = 844, dpr = 3, movil = true, dia = 'nada', fecha } = {}) {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: ancho, height: alto, deviceScaleFactor: dpr, isMobile: movil, hasTouch: movil });
  await page.evaluateOnNewDocument(() => {
    const D = Date, t0 = D.now(); window.__vel = 1; window.__base = t0; window.__acum = 0;
    const ahora = () => { const r = D.now(); return t0 + window.__acum + (r - window.__base) * window.__vel; };
    window.__acelerar = (v) => { const r = D.now(); window.__acum += (r - window.__base) * window.__vel; window.__base = r; window.__vel = v; };
    class F extends D { constructor(...a) { if (a.length === 0) super(ahora()); else super(...a); } static now() { return ahora(); } }
    window.Date = F;
  });
  await page.goto('http://localhost:3003/zz-demo-sistema.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', dia); await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 60000 });
  await esperar(2500);
  await cerrar(page);
  await page.addStyleTag({ content: '::-webkit-scrollbar{display:none} *{caret-color:transparent!important}' });
  return { browser, page };
}
async function cerrar(page) { for (let v = 0; v < 20; v++) { const h = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Seguir'); if (b) { b.click(); return 1; } return 0; }); if (!h) break; await esperar(300); } }
const tocar = (page, t, exacto = false, sel = '') => page.evaluate((t, ex, sel) => { const vis = (e) => e.offsetParent || e.getClientRects().length; const ok = (s) => s && (ex ? s.trim() === t : s.trim().startsWith(t)); for (const q of (sel ? [sel] : ['button', '[role="tab"]', 'a', '[role="checkbox"]', '[role="button"]', 'li'])) { const els = [...document.querySelectorAll(q)].filter(vis); const b = els.find((e) => ok(e.getAttribute('aria-label'))) || els.find((e) => ok(e.textContent)); if (b) { b.click(); return true; } } return false; }, t, exacto, sel);
const botones = (page) => page.evaluate(() => [...document.querySelectorAll('button, a, [role=tab], [role=checkbox], input, textarea')].filter((b) => b.offsetParent).map((b) => (b.tagName === 'INPUT' || b.tagName === 'TEXTAREA' ? `[${b.tagName}:${b.getAttribute('aria-label') || b.placeholder || b.id}=${b.value}]` : (b.getAttribute('aria-label') || b.textContent.trim()).slice(0, 45))).join(' | '));
const alTexto = (page, t, off = 90) => page.evaluate((t, off) => { const e = [...document.querySelectorAll('h1,h2,h3,p,span,div,button')].find((x) => x.children.length === 0 && x.textContent.trim().startsWith(t) && x.offsetParent); if (!e) return false; const y = e.getBoundingClientRect().top + window.scrollY - off; window.scrollTo(0, y); const sc = e.closest('[class*="overflow-y"], .tsheet, [role=dialog]'); if (sc && sc.scrollHeight > sc.clientHeight) sc.scrollTop += e.getBoundingClientRect().top - sc.getBoundingClientRect().top - off; return true; }, t, off);
module.exports = { abrir, cerrar, tocar, botones, alTexto, esperar };
