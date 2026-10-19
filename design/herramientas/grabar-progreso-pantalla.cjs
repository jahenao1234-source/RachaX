// Progreso de la Racha de muestra, a 1600 × 900 (el tamaño de la pantalla del portátil de Johnatan) y a 2x, para meterlo
// DENTRO de sus tomas reales con pantalla-reemplazo.py (14 oct de 2026).
//   referencias <carpeta>              fotos de Progreso con toda la historia, bajando la página de 40 en 40 px
//                                      (PASO, DESDE_Y y HASTA_Y cambian el paso y el tramo)
//                                      (ref-prog-0000.png, ref-prog-0040.png…), para saber qué parte se ve en cada toma
//   llenado <carpeta> <bajada en px>   la historia crece día por día (PASOS fotos, de DESDE días atrás hasta hoy) con la
//                                      página bajada siempre igual: eprog-NN.png
// Necesita la muestra corriendo (puerto 3003), puppeteer-core (NODE_PATH) y Chrome.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const [modo, carpeta, bajadaTxt] = process.argv.slice(2);
const SAL = path.resolve(carpeta);
fs.mkdirSync(SAL, { recursive: true });
const PASOS = Number(process.env.PASOS || 44);
let DESDE = Number(process.env.DESDE || 118);

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  // ANCHO/ALTO: el tamaño del navegador de la toma (1600 × 900 el ASUS del 14 oct; 1440 × 900 el computador del 15 oct)
  await page.setViewport({ width: Number(process.env.ANCHO || 1600), height: Number(process.env.ALTO || 900), deviceScaleFactor: Number(process.env.DPR || (modo === 'llenado' ? 2 : 1)) });
  // FECHA: la muestra cree que es el momento en que él grabó la toma
  const DESFASE = process.env.FECHA ? new Date(process.env.FECHA).getTime() - Date.now() : 0;
  if (DESFASE) await page.evaluateOnNewDocument((off) => { const D = Date; class F extends D { constructor(...a) { if (a.length === 0) super(D.now() + off); else super(...a); } static now() { return D.now() + off; } } window.Date = F; }, DESFASE);
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'nada');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('nav, header', { timeout: 20000 });
  await esperar(1500);
  // MENU=cerrado: el menú de la izquierda cerrado, como en algunas tomas
  if (process.env.MENU === 'cerrado') { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Cerrar el menú' || e.getAttribute('aria-label') === 'Cerrar el menú'); if (b) b.click(); }); await esperar(400); }
  let R = await page.evaluate(() => JSON.parse(localStorage.getItem('racha_registros')));
  const HABITOS = await page.evaluate(() => JSON.parse(localStorage.getItem('racha_habitos') || '[]').map((h) => h.id));
  const p2 = (n) => String(n).padStart(2, '0');
  const fecha = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const dia = (n) => { const d = new Date(Date.now() + DESFASE); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
  const hace = (n) => fecha(dia(n));
  // MARZO=1: "Tu año" se llena desde el 1 de marzo (pedido de Johnatan, 14 oct). Como en grabar-ventanas.cjs, la historia
  // de la muestra se alarga SOLO en esta grabación: los hábitos se dan por creados el 1 de marzo, con días cumplidos al azar
  // (unos completos, otros a medias y dos pausas). Con esto DESDE pasa a ser el 1 de marzo.
  let desdeMarzo = null;
  if (process.env.MARZO === '1') {
    const H = await page.evaluate(() => JSON.parse(localStorage.getItem('racha_habitos')));
    const hoyMs = dia(0).getTime(), m1 = new Date(dia(0).getFullYear(), 2, 1, 12);
    desdeMarzo = Math.round((hoyMs - m1.getTime()) / 86400000);
    let semilla = 20261010;
    const azar = () => { semilla = (semilla + 0x6D2B79F5) | 0; let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const pausa = (d) => (d >= 152 && d <= 155) || (d >= 193 && d <= 195);
    H.forEach((h, i) => {
      const desde = Math.round((hoyMs - new Date(h.creadoEn).getTime()) / 86400000);
      for (let d = desdeMarzo; d > desde; d--) { const s = azar(); if (!pausa(d) && s < 0.93 + 0.02 * (i % 3)) R.push({ habitoId: h.id, fecha: hace(d), completado: true }); }
      h.creadoEn = new Date(dia(desdeMarzo).setHours(8, 0, 0, 0)).toISOString();
    });
    await page.evaluate((H) => localStorage.setItem('racha_habitos', JSON.stringify(H)), H);
    console.log('historia alargada desde hace', desdeMarzo, 'días (1 de marzo)');
  }
  // con la historia larga la app abre ventanas de premio que oscurecen la pantalla: se cierran todas
  const cerrarPremios = async () => { for (let quieto = 0, v = 0; quieto < 6 && v < 60; v++) { const habia = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Seguir'); if (b) { b.click(); return true; } return false; }); quieto = habia ? 0 : quieto + 1; await esperar(200); } };
  const limpio = '::-webkit-scrollbar { display: none; } * { caret-color: transparent !important; }';
  const tocar = (texto) => page.evaluate((t) => { const b = [...document.querySelectorAll('button, a, [role="tab"]')].find((e) => e.textContent.trim() === t || e.getAttribute('aria-label') === t); if (b) { b.click(); return true; } return false; }, texto);
  // la caja que se desplaza en la pantalla de Progreso (la más alta que tenga scroll)
  const bajar = (y) => page.evaluate((y) => {
    const cajas = [document.scrollingElement, ...document.querySelectorAll('main, div')].filter((e) => e && e.scrollHeight > e.clientHeight + 20 && (e === document.scrollingElement || ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)));
    cajas.sort((a, b) => b.scrollHeight - a.scrollHeight);
    if (!cajas.length) return [0, 0];
    cajas[0].scrollTop = y; return [cajas[0].scrollTop, cajas[0].scrollHeight - cajas[0].clientHeight];
  }, y);
  const poner = async (hasta, hoyHechos) => {
    const reg = R.filter((r) => r.fecha <= hasta && r.fecha < hace(0));
    HABITOS.slice(0, hoyHechos).forEach((id) => reg.push({ habitoId: id, fecha: hace(0), completado: true }));
    await page.evaluate((reg) => localStorage.setItem('racha_registros', JSON.stringify(reg)), reg);
    for (let intento = 0; intento < 4; intento++) {
      try { await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0', timeout: 25000 }); await page.waitForSelector('nav, header', { timeout: 12000 }); break; }
      catch (e) { console.log('recarga lenta, va otra vez'); await esperar(1500); }
    }
    await page.addStyleTag({ content: limpio });
    await cerrarPremios();
    await tocar('Progreso'); await esperar(500);
    await cerrarPremios();
  };

  if (desdeMarzo !== null && !process.env.DESDE) DESDE = desdeMarzo;
  if (modo === 'referencias') {
    await poner(hace(1), HABITOS.length);
    const [, max] = await bajar(0);
    const PASO = Number(process.env.PASO || 40), Y0 = Number(process.env.DESDE_Y || 0), Y1 = Math.min(max, Number(process.env.HASTA_Y || max));
    for (let y = Y0; y <= Y1 + PASO - 1; y += PASO) {
      const [real] = await bajar(Math.min(y, Y1)); await esperar(250);
      await page.screenshot({ path: path.join(SAL, `ref-prog-${String(real).padStart(4, '0')}.png`) });
    }
    console.log('referencias hasta', max, 'px');
  } else {
    const y = Number(bajadaTxt || 0);
    // ANCLA='Tu año': con poca historia lo de arriba es más corto y la misma bajada corre la página; entonces se baja
    // lo necesario para que ese título quede siempre donde queda con toda la historia y la bajada pedida
    const ANCLA = process.env.ANCLA;
    const arribaDe = (t) => page.evaluate((t) => { const e = [...document.querySelectorAll('h1, h2, h3, h4, p, span, div')].find((x) => x.children.length === 0 && x.textContent.trim() === t); return e ? e.getBoundingClientRect().top : null; }, t);
    let meta = null;
    if (ANCLA) { await poner(hace(1), HABITOS.length); await bajar(y); await esperar(300); meta = await arribaDe(ANCLA); console.log('ancla', ANCLA, 'en', meta); }
    for (let i = 0; i <= PASOS; i++) {
      // CURVA=2 pone más fotos en las últimas semanas (la fuerza y el radar solo cambian cuando la historia llega cerca de hoy)
      await poner(hace(Math.round(DESDE * Math.pow(1 - i / PASOS, Number(process.env.CURVA || 1)))), i === PASOS ? HABITOS.length : 0);
      if (meta === null) await bajar(y);
      else { await bajar(0); await esperar(150); const a = await arribaDe(ANCLA); await bajar(Math.round(a - meta)); }
      await esperar(350);
      await page.screenshot({ path: path.join(SAL, `eprog-${p2(i)}.png`) });
    }
    console.log('llenado:', PASOS + 1, 'fotos con la página bajada', y, 'px');
  }
  await page.evaluate((R) => localStorage.setItem('racha_registros', JSON.stringify(R)), R);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
