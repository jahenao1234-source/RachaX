// "Que se vaya moviendo por las ventanas y se vea cómo se mueve" (Johnatan, 10 oct): graba, una por una, las tarjetas
// de Progreso de la versión de escritorio de Racha mientras su historia crece, para armar después un recorrido de
// cámara continuo (ventanas-viaje.py): las barras y la fuerza de los hábitos suben, la gráfica se forma y, al final,
// "Tu año" se llena desde marzo.
// Es la app de verdad (la Racha de muestra). Para que "Tu año" se llene desde marzo, a la muestra se le alarga la
// historia SOLO en esta grabación: los hábitos se dan por creados el 1 de marzo y se les agregan días cumplidos con
// el mismo tipo de azar de la muestra (unos días completos, otros a medias y dos pausas).
// Necesita la muestra corriendo (configuración racha-muestra, puerto 3003), puppeteer-core y ffmpeg.
// Uso: NODE_PATH="<carpeta con node_modules>" node design/herramientas/grabar-ventanas.cjs [fuerza | anio]
//      deja en campana/app-llenado/ventanas/: habitos-NN.png, mejorar-NN.png, fuerza-NN.png y anio-NNN.png
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const SAL = path.join(__dirname, '..', 'anuncios', 'campana', 'app-llenado', 'ventanas');
fs.mkdirSync(SAL, { recursive: true });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const SOLO = ['fuerza', 'anio'].find((x) => process.argv.includes(x));
const INICIO = 223;                       // hace cuántos días empieza la historia alargada (1 de marzo, contando desde el 10 de octubre)

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 2300, deviceScaleFactor: 3 });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('http://localhost:3003/zz-demo.html', { waitUntil: 'networkidle0' });
  await page.select('#dia', 'nada');
  await page.click('#ir');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 40000 });
  await page.waitForSelector('nav, header', { timeout: 20000 });
  await esperar(1500);
  const p2 = (n) => String(n).padStart(2, '0'), p3 = (n) => String(n).padStart(3, '0');
  const fecha = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const dia = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
  const hace = (n) => fecha(dia(n));
  // la historia alargada
  const base = await page.evaluate(() => ({ R: JSON.parse(localStorage.getItem('racha_registros')), H: JSON.parse(localStorage.getItem('racha_habitos')) }));
  let semilla = 20261010;
  const azar = () => { semilla = (semilla + 0x6D2B79F5) | 0; let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pausa = (d) => (d >= 148 && d <= 151) || (d >= 189 && d <= 191);
  const R = [...base.R];
  const hoyMs = dia(0).getTime();
  base.H.forEach((h, i) => {
    const desde = Math.round((hoyMs - new Date(h.creadoEn).getTime()) / 86400000);      // hace cuántos días empezaba este hábito en la muestra
    for (let d = INICIO; d > desde; d--) { const s = azar(); if (!pausa(d) && s < 0.93 + 0.02 * (i % 3)) R.push({ habitoId: h.id, fecha: hace(d), completado: true }); }
    h.creadoEn = new Date(dia(INICIO).setHours(8, 0, 0, 0)).toISOString();
  });
  await page.evaluate((H) => localStorage.setItem('racha_habitos', JSON.stringify(H)), base.H);
  const IDS = base.H.map((h) => h.id);
  const cerrarPremios = async () => { for (let quieto = 0, v = 0; quieto < 12 && v < 60; v++) { const habia = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Seguir'); if (b) { b.click(); return true; } return false; }); quieto = habia ? 0 : quieto + 1; await esperar(350); } };
  let ultimo = {};
  const poner = async (hasta, hoyHechos = 0) => {
    ultimo = { hasta, hechos: hoyHechos };
    const reg = R.filter((r) => r.fecha <= hasta && r.fecha < hace(0));
    IDS.slice(0, hoyHechos).forEach((id) => reg.push({ habitoId: id, fecha: hace(0), completado: true }));
    await page.evaluate((reg) => localStorage.setItem('racha_registros', JSON.stringify(reg)), reg);
    for (let intento = 0; intento < 4; intento++) {
      try { await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0', timeout: 25000 }); await page.waitForSelector('nav, header', { timeout: 12000 }); break; }
      catch (e) { console.log('recarga lenta, va otra vez'); await esperar(1500); }
    }
    await page.addStyleTag({ content: '::-webkit-scrollbar { display: none; } * { caret-color: transparent !important; }' });
    await page.evaluate(() => { const b = [...document.querySelectorAll('button, a')].find((e) => e.textContent.trim() === 'Progreso'); if (b) b.click(); });
    await esperar(450);
    for (let quieto = 0, v = 0; quieto < 4 && v < 24; v++) {
      const habia = await page.evaluate((ultima) => {
        const tapas = [...document.querySelectorAll('body *')].filter((e) => {
          const s = getComputedStyle(e); if (s.position !== 'fixed' || s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
          const b = e.getBoundingClientRect(); return b.width >= innerWidth * 0.9 && b.height >= innerHeight * 0.5 && !e.querySelector('nav, section.anio, #tusHabitosSec') && !e.matches('nav, header');
        });
        const boton = [...document.querySelectorAll('button')].find((b) => /^(Seguir|Cerrar|Entendido|Listo|Ahora no|Más tarde)$/.test(b.textContent.trim()) && tapas.some((x) => x.contains(b)))
          || [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Seguir')
          || [...document.querySelectorAll('button')].find((b) => /cerrar/i.test(b.getAttribute('aria-label') || '') && tapas.some((x) => x.contains(b)));
        if (boton) { boton.click(); return 'botón'; }
        if (tapas.length && ultima) { tapas.forEach((e) => { e.style.display = 'none'; }); return 'escondida'; }
        return tapas.length ? 'tapa' : '';
      }, v >= 12);
      if (habia === 'tapa') await page.keyboard.press('Escape');
      quieto = habia ? 0 : quieto + 1;
      await esperar(300);
    }
  };
  // la caja de cada tarjeta, buscada por su título
  const caja = (cual) => page.evaluate((cual) => {
    const h = (t) => [...document.querySelectorAll('h2')].find((e) => e.textContent.trim() === t);
    const e = cual === 'anio' ? document.querySelector('section.anio') : cual === 'habitos' ? document.getElementById('tusHabitosSec') : cual === 'fuerza' ? h('Fuerza de tus hábitos')?.parentElement : h('Dónde puedes mejorar')?.parentElement?.parentElement;
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top + window.scrollY, width: b.width, height: b.height };
  }, cual);
  const hay = (nombre) => fs.existsSync(path.join(SAL, nombre));
  const foto = async (cual, nombre) => {
    for (let intento = 0; intento < 4; intento++) {
      try { const c = await caja(cual); if (!c || c.width < 10) throw new Error('sin tarjeta'); await page.screenshot({ path: path.join(SAL, nombre), clip: c }); return; }
      catch (e) { console.log('foto de', nombre, 'falló (' + e.message.slice(0, 60) + '), va otra vez'); await esperar(1200); if (intento === 1) await poner(ultimo.hasta, ultimo.hechos); }
    }
  };

  await page.evaluate((R) => localStorage.setItem('racha_registros', JSON.stringify(R)), R);
  await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0', timeout: 30000 });
  await cerrarPremios();
  if (SOLO !== 'anio') {
    const PASOS = 40;
    for (let i = 0; i <= PASOS; i++) {
      if (['habitos', 'mejorar', 'fuerza'].every((c) => hay(`${c}-${p2(i)}.png`))) continue;
      await poner(hace(PASOS - i), i === PASOS ? IDS.length : 0);
      for (const c of ['habitos', 'mejorar', 'fuerza']) await foto(c, `${c}-${p2(i)}.png`);
    }
    console.log('fuerza: 41 pasos');
  }
  if (SOLO !== 'fuerza') {
    let k = 0;
    for (let d = INICIO; d >= 0; d -= 2) { const nombre = `anio-${p3(k++)}.png`; if (hay(nombre)) continue; await poner(hace(d), 0); await foto('anio', nombre); }
    { const nombre = `anio-${p3(k++)}.png`; if (!hay(nombre)) { await poner(hace(0), IDS.length); await foto('anio', nombre); } }
    console.log('año:', k, 'pasos');
  }
  console.log('errores:', errores.slice(0, 3));
  await page.evaluate((b) => { localStorage.setItem('racha_registros', JSON.stringify(b.R)); }, base);
  await browser.close();
})();
