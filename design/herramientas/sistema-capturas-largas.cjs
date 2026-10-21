const { abrir, tocar, esperar } = require('./sistema-base.cjs');
const D = process.argv[2], SOLO = process.argv[3];
const escena = async (nombre, f) => { if (SOLO && !nombre.startsWith(SOLO)) return; const { browser, page } = await abrir({}); try { await page.addStyleTag({ content: 'nav[aria-label], .fixed.bottom-0, [class*="bottom-0"][class*="fixed"]{display:none!important}' }); await f(page); } catch (e) { console.log('FALLA', nombre, e.message); } await browser.close(); console.log('listo', nombre); };
const larga = async (p, n) => { const h = await p.evaluate(() => document.documentElement.scrollHeight); await p.screenshot({ path: `${D}/L-${n}.png`, fullPage: true }); console.log(n, 'alto css', h); };
(async () => {
  await escena('hoy', async (p) => { await larga(p, 'hoy-0'); await tocar(p, 'Marcar Estudiar 25 minutos'); await esperar(1800); await larga(p, 'hoy-1'); });
  await escena('dif', async (p) => { await tocar(p, '¿Día pesado?'); await esperar(900); await tocar(p, 'Activar día difícil', true); await esperar(1500); await larga(p, 'dif-0'); await tocar(p, 'Marcar Estudiar 25 minutos'); await esperar(1800); await larga(p, 'dif-1'); });
  await escena('tarea', async (p) => { await tocar(p, 'Tareas', true); await esperar(900); await larga(p, 'tareas-0'); await tocar(p, 'Preparar un examen'); await esperar(1200); await larga(p, 'tarea-1'); });
  await escena('semana', async (p) => { await tocar(p, 'Tareas', true); await esperar(900); await tocar(p, 'Planea tu semana'); await esperar(1300); await larga(p, 'semana'); });
  await escena('prog', async (p) => { await tocar(p, 'Progreso', true); await esperar(2000); await larga(p, 'prog'); });
})();
