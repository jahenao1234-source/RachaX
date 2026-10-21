const { abrir, tocar, botones, alTexto, esperar } = require('./sistema-base.cjs');
const fs = require('fs');
const D = process.argv[2]; fs.mkdirSync(D, { recursive: true });
const SOLO = process.argv[3];
const escena = async (nombre, f, opts) => { if (SOLO && !nombre.startsWith(SOLO)) return; const { browser, page } = await abrir(opts); try { await f(page); } catch (e) { console.log('FALLA', nombre, e.message); } await browser.close(); console.log('listo', nombre); };
const foto = (page, n) => page.screenshot({ path: `${D}/${n}.png` });
(async () => {
  await escena('hoy', async (p) => {
    await foto(p, 'hoy-top');
    await alTexto(p, 'Misiones', 70); await esperar(500); await foto(p, 'hoy-mis-0');
    await tocar(p, 'Marcar Estudiar 25 minutos'); await esperar(1600); await alTexto(p, 'Misiones', 70); await esperar(400); await foto(p, 'hoy-mis-1');
  });
  await escena('nuevo', async (p) => {
    await tocar(p, 'Crear'); await esperar(600); await tocar(p, 'Nuevo hábito'); await esperar(1000);
    await p.type('input[placeholder="Ej. Salir a caminar"]', 'Estudiar 25 minutos', { delay: 20 }); await esperar(300);
    await tocar(p, 'Tarde', true); await esperar(400);
    await alTexto(p, '¿Después de qué?', 260); await esperar(400); await foto(p, 'nuevo-0');
    await p.type('input[placeholder="algo que ya haces"]', 'almorzar', { delay: 30 }); await esperar(400); await foto(p, 'nuevo-1');
    await p.type('input[placeholder="Por ejemplo, 1 página o 5 minutos"]', 'leer un párrafo', { delay: 20 }); await esperar(400); await foto(p, 'nuevo-2');
  });
  await escena('dificil', async (p) => {
    await alTexto(p, 'Tu día', 120); await esperar(300); await foto(p, 'dif-entrada');
    await tocar(p, '¿Día pesado?'); await esperar(1000); await foto(p, 'dif-hoja');
    await tocar(p, 'Activar día difícil', true); await esperar(1500); await alTexto(p, 'Misiones', 70); await esperar(400); await foto(p, 'dif-0');
    await tocar(p, 'Marcar Estudiar 25 minutos'); await esperar(1600); await alTexto(p, 'Misiones', 70); await esperar(400); await foto(p, 'dif-1');
  });
  await escena('comodines', async (p) => { await tocar(p, 'Tus comodines'); await esperar(1100); await foto(p, 'comodines'); });
  await escena('tarea', async (p) => {
    await tocar(p, 'Tareas', true); await esperar(900); await foto(p, 'tareas-lista');
    await tocar(p, 'Preparar un examen'); await esperar(1200); await foto(p, 'tarea-0'); await p.evaluate(() => window.scrollBy(0, 420)); await esperar(500); await foto(p, 'tarea-1');
    console.log(await botones(p));
  });
  await escena('biblio', async (p) => {
    await tocar(p, 'Crear'); await esperar(600); await tocar(p, 'Biblioteca'); await esperar(1200); await foto(p, 'biblio-habitos');
    await tocar(p, 'Tareas', true, '[role="tab"]'); await esperar(800); await foto(p, 'biblio-tareas');
    await tocar(p, 'Planes', true, '[role="tab"]'); await esperar(800); await foto(p, 'biblio-planes');
  });
  await escena('semana', async (p) => {
    await tocar(p, 'Tareas', true); await esperar(900); await tocar(p, 'Planea tu semana'); await esperar(1300); await foto(p, 'semana-0');
    await p.evaluate(() => window.scrollBy(0, 500)); await esperar(500); await foto(p, 'semana-1');
    console.log(await botones(p));
  });
  await escena('foco', async (p) => {
    await alTexto(p, 'Tareas de hoy', 100); await esperar(300);
    await tocar(p, 'Hacer un pomodoro con Repartir'); await esperar(1300); await foto(p, 'foco-0');
    console.log(await botones(p));
    if (await tocar(p, 'Empezar pomodoro', true)) await esperar(600);
    await p.evaluate(() => window.__acelerar(90));
    for (let i = 0; i < 24; i++) { await foto(p, `foco-${String(i + 1).padStart(2, '0')}`); await esperar(140); }
  });
  await escena('progreso', async (p) => {
    await tocar(p, 'Progreso', true); await esperar(1500); await foto(p, 'prog-top');
    await alTexto(p, 'Fuerza de tus hábitos', 80); await esperar(800); await foto(p, 'prog-radar');
    console.log(await botones(p));
  });
  await escena('escritorio', async (p) => { await esperar(800); await foto(p, 'esc-hoy'); }, { ancho: 1440, alto: 900, dpr: 1.5, movil: false });
})();
