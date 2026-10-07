// Prueba de estilo (12 s) con los clips 1 y 2 de Lina, siguiendo la referencia de sanmunoz.ia:
// la presentadora en una tarjeta abajo, sobre un color plano, y arriba un titular que se arma
// palabra por palabra con un dibujo animado por frase; después, pantalla partida con papel rasgado.
// Antes: recortar a Lina del fondo (ver LEEME › "Estilo de tarjeta y gráficos").
// Uso: node design/herramientas/hf-lina-estilo.mjs   (después: check, snapshot, preview y render)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', '..');
const L = path.join(AQUI, '..', 'anuncios', 'lina');
const X = path.join(AQUI, '..', 'anuncios', 'xiomara', 'montaje');
const P = path.join(L, 'hyperframes', 'lina-estilo');
const A = path.join(P, 'assets');
const C = path.join(P, 'compositions');
fs.mkdirSync(path.join(A, 'fuentes'), { recursive: true });
fs.mkdirSync(C, { recursive: true });
const FFDIR = 'C:/Users/jahen/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/';
const duracion = (f) => +execFileSync(FFDIR + 'ffprobe.exe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const FPS = 24, cuadro = (x) => Math.round(x * FPS) / FPS, n = (x) => (+x.toFixed(4)).toString();
const mill = (x) => Math.floor(x * 1e6 + 1e-4), seg = (m) => (m / 1e6).toString();
const AMBAR = '#f5a524', TINTA = '#16130f', PAPEL = '#ebe7dd';

// ---------- Recursos ----------
const copiar = (de, a) => fs.copyFileSync(de, path.join(A, a));
copiar(path.join(L, 'clips', '2-mito.mp4'), '2-mito.mp4');
copiar(path.join(X, 'sfx', 'whoosh.wav'), 'whoosh.wav');
copiar(path.join(X, 'sfx', 'golpe.wav'), 'golpe.wav');
copiar(path.join(RAIZ, 'public', 'fuentes', 'barlow-latin-700-normal.woff2'), 'fuentes/barlow-700.woff2');
copiar('C:/Windows/Fonts/consolab.ttf', 'fuentes/consolas-bold.ttf');
copiar('C:/Windows/Fonts/georgiaz.ttf', 'fuentes/georgia-bold-italic.ttf');
const RECORTE = fs.existsSync(path.join(A, 'gancho-recorte.webm')) && fs.statSync(path.join(A, 'gancho-recorte.webm')).size > 0;
const RECORTE2 = fs.existsSync(path.join(A, 'mito-recorte.webm')) && fs.statSync(path.join(A, 'mito-recorte.webm')).size > 0;

// ---------- Tramos con voz ----------
// El clip 1 ya viene cortado en assets/gancho.mp4 (del 1,91 al 5,96 del original).
const PAUSA = 0.32, ANTES = 0.12, DESPUES = 0.18, GANANCIA = 7, INI1 = 1.91;
const pal1 = JSON.parse(fs.readFileSync(path.join(L, 'clips', '1-gancho.palabras.json'), 'utf8')).palabras;
const pal2 = JSON.parse(fs.readFileSync(path.join(L, 'clips', '2-mito.palabras.json'), 'utf8')).palabras;
const D1 = cuadro(pal1[pal1.length - 1].f + 0.30 - INI1);
const palabras = pal1.map((p) => ({ t: p.t, i: p.i - INI1, f: p.f - INI1, e: 'a' }));
const tramos = [];
let T = D1, enC = false;
{
  const dur = duracion(path.join(L, 'clips', '2-mito.mp4'));
  const grupos = [[]];
  pal2.forEach((p, k) => { if (k && p.i - pal2[k - 1].f > PAUSA) grupos.push([]); grupos[grupos.length - 1].push(p); });
  grupos.forEach((g, k) => {
    let ini = Math.max(0, g[0].i - (k === 0 ? 0.15 : ANTES));
    let fin = Math.min(dur - 0.02, g[g.length - 1].f + (k === grupos.length - 1 ? 0.45 : DESPUES));
    const sig = grupos[k + 1];
    if (sig) fin = Math.min(fin, sig[0].i - ANTES - 0.01);
    const prev = tramos[tramos.length - 1];
    if (prev) ini = Math.max(ini, prev.ini + prev.d + 0.01);
    const d = cuadro(fin - ini);
    if (/^No$/.test(g[0].t)) enC = true;
    const e = enC ? 'c' : 'b';
    tramos.push({ ini, d, T0: T, zoom: k % 2 === 1, e });
    g.forEach((p) => palabras.push({ t: p.t, i: T + p.i - ini, f: T + p.f - ini, e }));
    T = cuadro(T + d);
  });
}
const TB = D1, TC = tramos.find((t) => t.e === 'c').T0, TOTAL = T;
const cuando = (e, re, k = 0) => { const p = palabras.filter((x) => x.e === e && re.test(x.t))[k]; if (!p) throw new Error('No encontré ' + re); return p.i; };

// ---------- Piezas ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const FUENTES = `        @font-face { font-family: "Barlow"; font-weight: 700; src: url("assets/fuentes/barlow-700.woff2") format("woff2"); }
        @font-face { font-family: "Consolas"; font-weight: 700; src: url("assets/fuentes/consolas-bold.ttf") format("truetype"); }
        @font-face { font-family: "Georgia"; font-weight: 700; font-style: italic; src: url("assets/fuentes/georgia-bold-italic.ttf") format("truetype"); }`;
const pieza = (id, estilo, cuerpo, guion) => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>
${FUENTES}
        #root { position: absolute; inset: 0; overflow: hidden; }
${estilo}
      </style>
      <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920">
${cuerpo}
      </div>
      <script>
        (() => {
          const tl = gsap.timeline({ paused: true });
          ${guion.join('\n          ')}
          window.__timelines["${id}"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
const escribir = (id, estilo, cuerpo, guion) => fs.writeFileSync(path.join(C, id + '.html'), pieza(id, estilo, cuerpo, guion), 'utf8');
const anfitrion = (id, ini, fin, pista, tipo) => `      <div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${seg(mill(ini))}" data-duration="${seg(mill(fin) - mill(ini))}" data-track-index="${pista}" data-track-kind="${tipo}" data-width="1080" data-height="1920"></div>`;
const entra = (sel, t, extra = '') => `tl.fromTo("${sel}", { opacity: 0, y: 26, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.16, ease: "back.out(2.2)"${extra} }, ${n(Math.max(0, t))});`;

// Lo común del panel de arriba: etiqueta de máquina, titular grueso y la palabra clave sobre resaltador ámbar.
const PANEL = `        .eti { position: absolute; left: 62px; top: 292px; margin: 0; font-family: "Consolas", monospace; font-weight: 700; font-size: 25px; letter-spacing: 0.16em; color: #6f685c; }
        .cuenta { position: absolute; right: 62px; top: 292px; margin: 0; font-family: "Consolas", monospace; font-weight: 700; font-size: 25px; letter-spacing: 0.12em; color: #b8590a; }
        .tit { position: absolute; left: 58px; margin: 0; white-space: nowrap; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 98px; line-height: 1; letter-spacing: -0.035em; color: ${TINTA}; }
        .tit span { display: inline-block; opacity: 0; }
        .marca { background: ${AMBAR}; padding: 2px 16px 8px; margin-left: 6px; transform-origin: 0 60%; }`;

// ---- Escena A · "¿El lunes empiezas con todo y el jueves ya lo soltaste?" ----
{
  const tL = cuando('a', /^lunes/), tE = cuando('a', /^empiezas/), tT = cuando('a', /^todo/), tJ = cuando('a', /^jueves/), tS = cuando('a', /^soltaste/);
  const dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const cuerpo = `        <p class="eti" id="a-eti">LUNES → JUEVES</p>
        <p class="tit" id="a-l1" style="top: 346px"><span id="a-w1">El lunes:</span> <span id="a-w2" class="marca">con todo.</span></p>
        <p class="tit" id="a-l2" style="top: 462px"><span id="a-w3">El jueves:</span> <span id="a-w4" class="suelta">lo soltaste.<i id="a-raya"></i></span></p>
        <div class="semana">
${dias.map((d, k) => `          <div class="dia" id="a-d${k}"><b id="a-f${k}"></b><span>${d}</span>${k === 3 ? '<svg id="a-x" viewBox="0 0 100 100"><path id="a-x1" d="M14 16 L86 84" /><path id="a-x2" d="M86 14 L16 86" /></svg>' : ''}</div>`).join('\n')}
        </div>`;
  const estilo = `${PANEL}
        .suelta { position: relative; margin-left: 6px; color: #8a8375; }
        #a-raya { position: absolute; left: -8px; right: -8px; top: 52%; height: 13px; background: ${AMBAR}; transform-origin: 0 50%; }
        .semana { position: absolute; left: 60px; top: 606px; display: flex; gap: 18px; }
        .dia { position: relative; width: 122px; height: 122px; border: 4px solid ${TINTA}; border-radius: 22px; background: #f6f3ea; overflow: visible; opacity: 0; }
        .dia b { position: absolute; inset: 0; border-radius: 18px; background: ${AMBAR}; opacity: 0; }
        .dia span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 60px; color: ${TINTA}; }
        #a-x { position: absolute; inset: -14px; width: 150px; height: 150px; }
        #a-x path { fill: none; stroke: #d5320f; stroke-width: 13; stroke-linecap: round; stroke-dasharray: 110; stroke-dashoffset: 110; }`;
  const g = [
    `tl.fromTo("#a-eti", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" }, 0.05);`,
    ...dias.map((_, k) => `tl.fromTo("#a-d${k}", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.18, ease: "back.out(1.8)" }, ${n(0.12 + k * 0.035)});`),
    entra('#a-w1', tL - 0.06),
    `tl.fromTo("#a-f0", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.16, ease: "back.out(2.5)" }, ${n(tL)});`,
    `tl.to("#a-d0", { scale: 1.14, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, ${n(tL)});`,
    `tl.fromTo("#a-f1", { opacity: 0, scale: 0.4 }, { opacity: 0.62, scale: 1, duration: 0.16, ease: "back.out(2.5)" }, ${n(tE)});`,
    entra('#a-w2', tT - 0.2, ', rotation: -2'),
    `tl.fromTo("#a-f2", { opacity: 0, scale: 0.4 }, { opacity: 0.3, scale: 1, duration: 0.16, ease: "back.out(2.5)" }, ${n(tT)});`,
    entra('#a-w3', tJ - 0.06),
    `tl.to("#a-x1", { strokeDashoffset: 0, duration: 0.12, ease: "power2.in" }, ${n(tJ + 0.05)});`,
    `tl.to("#a-x2", { strokeDashoffset: 0, duration: 0.12, ease: "power2.in" }, ${n(tJ + 0.17)});`,
    `tl.to("#a-d3", { rotation: -5, duration: 0.07, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${n(tJ + 0.05)});`,
    ...[4, 5, 6].map((k) => `tl.to("#a-d${k}", { opacity: 0.32, duration: 0.2 }, ${n(tJ + 0.25)});`),
    entra('#a-w4', tS - 0.25),
    `tl.fromTo("#a-raya", { scaleX: 0, rotation: -2 }, { scaleX: 1, rotation: -2, duration: 0.18, ease: "power3.out" }, ${n(tS + 0.12)});`,
  ];
  escribir('escena-a', estilo, cuerpo, g);
}

// ---- Escena B · "Gimnasio, leer, madrugar, comer bien: todo de una." (tiempo local) ----
{
  const tb = (re, k) => cuando('b', re, k) - TB;
  const cartas = [
    { t: tb(/^Gimnasio/), txt: 'Gimnasio', cls: 'c1', rot: -3, x: 0, y: 0 },
    { t: tb(/^leer/), txt: 'Leer', cls: 'c2', rot: 2.5, x: 26, y: 18 },
    { t: tb(/^madrugar/), txt: 'Madrugar', cls: 'c3', rot: -1.5, x: -18, y: 40 },
    { t: tb(/^comer/), txt: 'Comer bien', cls: 'c4', rot: 3.5, x: 20, y: 62 },
  ];
  const tU = tb(/^todo/);
  const cuerpo = `        <p class="eti" id="b-eti">EL LUNES QUIERES</p>
${cartas.map((c, k) => `        <p class="cuenta" id="b-n${k}">0${k + 1} / 04</p>`).join('\n')}
${cartas.map((c, k) => `        <div class="carta ${c.cls}" id="b-c${k}" data-layout-allow-overlap data-layout-allow-occlusion><span data-layout-allow-overlap data-layout-allow-occlusion>${esc(c.txt)}</span></div>`).join('\n')}
        <p class="sello" id="b-sello" data-layout-allow-overlap data-layout-allow-occlusion>TODO DE UNA</p>`;
  const estilo = `${PANEL}
        .cuenta { opacity: 0; }
        .carta { position: absolute; left: 90px; top: 352px; width: 900px; height: 300px; border-radius: 26px; border: 5px solid ${TINTA}; box-shadow: 12px 12px 0 ${TINTA}; display: flex; align-items: center; justify-content: center; opacity: 0; }
        .carta span { font-family: "Barlow", sans-serif; font-weight: 700; font-size: 132px; letter-spacing: -0.035em; line-height: 1; }
        .c1 { background: ${TINTA}; color: #ffffff; }
        .c2 { background: #f6f3ea; color: ${TINTA}; }
        .c2 span { font-family: "Georgia", serif; font-style: italic; letter-spacing: -0.02em; }
        .c3 { background: #1f3b8f; color: #ffffff; }
        .c4 { background: #1f7a4d; color: #ffffff; }
        .sello { position: absolute; left: 150px; top: 430px; margin: 0; padding: 10px 44px 18px; background: ${AMBAR}; border: 6px solid ${TINTA}; box-shadow: 12px 12px 0 ${TINTA}; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 150px; letter-spacing: -0.03em; line-height: 1; color: ${TINTA}; white-space: nowrap; opacity: 0; }`;
  const g = [`tl.fromTo("#b-eti", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" }, 0.03);`];
  cartas.forEach((c, k) => {
    const t = Math.max(0, c.t - 0.05);
    g.push(`tl.fromTo("#b-c${k}", { opacity: 0, scale: 0.7, x: ${c.x}, y: ${c.y + 90}, rotation: ${c.rot * 3} }, { opacity: 1, scale: 1, x: ${c.x}, y: ${c.y}, rotation: ${c.rot}, duration: 0.22, ease: "back.out(1.9)" }, ${n(t)});`);
    g.push(`tl.set("#b-n${k}", { opacity: 1 }, ${n(t)});`);
    if (k) g.push(`tl.set("#b-n${k - 1}", { opacity: 0 }, ${n(t)});`);
  });
  // "todo de una": las cuatro se desparraman y cae el sello encima
  const fuera = [{ x: -70, y: -40, r: -9 }, { x: 110, y: -10, r: 8 }, { x: -90, y: 110, r: 6 }, { x: 90, y: 130, r: -7 }];
  cartas.forEach((c, k) => g.push(`tl.to("#b-c${k}", { x: ${fuera[k].x}, y: ${fuera[k].y}, rotation: ${fuera[k].r}, scale: 0.78, duration: 0.25, ease: "power3.out" }, ${n(tU - 0.08)});`));
  g.push(`tl.fromTo("#b-sello", { opacity: 0, scale: 2.2, rotation: -14 }, { opacity: 1, scale: 1, rotation: -5, duration: 0.2, ease: "power4.in" }, ${n(tU + 0.05)});`);
  g.push(`tl.fromTo("#root", { x: 0 }, { x: 9, duration: 0.04, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${n(tU + 0.25)});`);
  escribir('escena-b', estilo, cuerpo, g);
}

// ---- Escena C · "No es pereza: empezar con todo es empezar a abandonar." (papel rasgado arriba) ----
{
  const tc = (re, k) => cuando('c', re, k) - TC;
  const tP = tc(/^pereza/), tE1 = tc(/^empezar/i, 0), tT = tc(/^todo/), tE2 = tc(/^empezar/i, 1), tAb = tc(/^abandonar/);
  let s = 7; const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const borde = []; for (let x = 100; x >= 0; x -= 2.5) borde.push(`${x}% ${(95.5 + azar() * 4.5).toFixed(2)}%`);
  const cuerpo = `        <div id="c-papel">
          <i class="mancha m1"></i><i class="mancha m2"></i>
          <p class="eti" id="c-eti">Y NO, NO ES ESO</p>
          <p class="serif" id="c-t1">¿Pereza?<svg id="c-x" viewBox="0 0 400 140" preserveAspectRatio="none"><path id="c-x1" d="M10 22 L390 118" /><path id="c-x2" d="M388 18 L14 122" /></svg></p>
          <p class="serif chico" id="c-t2"><span id="c-a">Empezar</span> <span id="c-b">con todo</span></p>
          <p class="serif chico" id="c-t3"><span id="c-c">es empezar a</span> <span id="c-d">abandonar.<i id="c-sub"></i></span></p>
        </div>`;
  const estilo = `        #c-papel { position: absolute; left: 0; top: 0; width: 1080px; height: 800px; background: #f3efe1; clip-path: polygon(0% 0%, 100% 0%, ${borde.join(', ')}); filter: drop-shadow(0 10px 0 rgba(0,0,0,0.35)); }
        .mancha { position: absolute; border-radius: 50%; filter: blur(6px); }
        .m1 { right: -120px; top: 190px; width: 460px; height: 340px; background: ${AMBAR}; opacity: 0.55; border-radius: 46% 54% 60% 40% / 55% 45% 55% 45%; }
        .m2 { left: -140px; top: 420px; width: 420px; height: 300px; background: #e9dcc0; opacity: 0.9; border-radius: 58% 42% 45% 55% / 48% 60% 40% 52%; }
        .eti { position: absolute; left: 62px; top: 292px; margin: 0; font-family: "Consolas", monospace; font-weight: 700; font-size: 25px; letter-spacing: 0.16em; color: #6f685c; opacity: 0; }
        .serif { position: absolute; left: 60px; margin: 0; white-space: nowrap; font-family: "Georgia", serif; font-weight: 700; font-style: italic; color: ${TINTA}; line-height: 1; }
        #c-t1 { top: 338px; font-size: 150px; opacity: 0; }
        #c-x { position: absolute; left: -14px; top: 0; width: 104%; height: 100%; }
        #c-x path { fill: none; stroke: #d5320f; stroke-width: 15; stroke-linecap: round; stroke-dasharray: 420; stroke-dashoffset: 420; vector-effect: non-scaling-stroke; }
        .chico { font-size: 70px; }
        .chico span { display: inline-block; opacity: 0; position: relative; }
        #c-t2 { top: 528px; }
        #c-t3 { top: 616px; }
        #c-sub { position: absolute; left: -6px; right: -6px; bottom: -14px; height: 12px; background: ${AMBAR}; transform-origin: 0 50%; }`;
  const g = [
    `tl.fromTo("#c-papel", { y: -820 }, { y: 0, duration: 0.22, ease: "power3.out" }, 0);`,
    `tl.fromTo("#c-eti", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.12);`,
    `tl.fromTo("#c-t1", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.16, ease: "back.out(2)" }, 0.1);`,
    `tl.to("#c-x1", { strokeDashoffset: 0, duration: 0.14, ease: "power2.in" }, ${n(tP + 0.02)});`,
    `tl.to("#c-x2", { strokeDashoffset: 0, duration: 0.14, ease: "power2.in" }, ${n(tP + 0.17)});`,
    entra('#c-a', tE1 - 0.05), entra('#c-b', tT - 0.22), entra('#c-c', tE2 - 0.3), entra('#c-d', tAb - 0.05),
    `tl.fromTo("#c-sub", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power3.out" }, ${n(tAb + 0.2)});`,
  ];
  escribir('escena-c', estilo, cuerpo, g);
}

// ---- Subtítulos: pequeños, de apoyo (el protagonista es el titular de arriba) ----
{
  const FLOJAS = new Set(['a', 'al', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'de', 'del', 'por', 'para', 'con', 'en', 'que', 'se', 'te', 'lo', 'es', 'ya', 'no', '¿el']);
  const puntua = (p) => /[.,?!…:]$/.test(p.t);
  const floja = (p) => FLOJAS.has(p.t.toLowerCase()) && !puntua(p);
  const frases = []; let act = [];
  const cerrar = (forzar = true) => { const resto = []; while (act.length > 1 && floja(act[act.length - 1])) resto.unshift(act.pop()); if (!forzar && act.every(floja)) { act.push(...resto); return; } if (act.length) frases.push(act); act = resto; };
  for (const p of palabras) {
    const largo = act.map((x) => x.t).join(' ').length;
    const cambia = act.length && (p.e !== act[0].e || p.i - act[act.length - 1].f > 0.45);
    if (act.length && (cambia || act.length >= 3 || largo + 1 + p.t.length > 17)) cerrar(cambia);
    act.push(p); if (puntua(p)) cerrar();
  }
  cerrar();
  let w = 0; const g = [];
  const cuerpo = frases.map((fr, q) => {
    const sig = frases[q + 1];
    const ini = Math.max(0, fr[0].i - 0.03), fin = Math.min(fr[fr.length - 1].f + 0.2, sig ? sig[0].i - 0.03 : TOTAL);
    g.push(`tl.set("#frase-${q}", { opacity: 1 }, ${n(ini)});`, `tl.fromTo("#frase-${q}", { scale: 0.9 }, { scale: 1, duration: 0.08, ease: "back.out(2)" }, ${n(ini)});`, `tl.set("#frase-${q}", { opacity: 0 }, ${n(fin)});`);
    const spans = fr.map((p, k) => { const id = `w${w++}`; g.push(`tl.set("#${id}", { color: "${AMBAR}" }, ${n(k ? p.i : ini)});`); if (k < fr.length - 1) g.push(`tl.set("#${id}", { color: "#ffffff" }, ${n(fr[k + 1].i)});`); return `<span id="${id}">${esc(p.t)}</span>`; }).join(' ');
    return `        <p id="frase-${q}" class="frase">${spans}</p>`;
  }).join('\n');
  const estilo = `        .frase { position: absolute; left: 40px; right: 40px; top: 776px; margin: 0; opacity: 0; white-space: nowrap; text-align: center; font-family: "Barlow", sans-serif; font-weight: 700; font-size: 66px; line-height: 1; letter-spacing: -0.01em; color: #ffffff; -webkit-text-stroke: 12px #000000; paint-order: stroke fill; }`;
  escribir('subtitulos', estilo, cuerpo, g);
}

// ---------- index.html ----------
const zoomCss = () => '';
const tomasB = tramos.map((t, k) => {
  const fin = tramos[k + 1] ? tramos[k + 1].T0 : TOTAL;
  const comun = `data-start="${seg(mill(t.T0))}" data-duration="${seg(mill(fin) - mill(t.T0))}" data-media-start="${n(t.ini)}" data-track-index="0"`;
  if (t.e === 'b' && RECORTE2) return `      <video id="toma-${k}" class="clip tarjeta${zoomCss(t.zoom)}" src="assets/mito-recorte.webm" playsinline muted ${comun}></video>\n      <audio id="voz-${k}" src="assets/2-mito.mp4" ${comun.replace('data-track-index="0"', 'data-track-index="4"')} data-audio-group="voz"></audio>`;
  return `      <video id="toma-${k}" class="clip ${t.e === 'c' ? 'partida' : 'tarjeta'}${zoomCss(t.zoom)}" src="assets/2-mito.mp4" playsinline data-has-audio="true" ${comun} data-volume="1" data-audio-group="voz"></video>`;
}).join('\n');
const tomaA = RECORTE
  ? `      <video id="toma-a" class="clip tarjeta" src="assets/gancho-recorte.webm" playsinline muted data-start="0" data-duration="${seg(mill(TB))}" data-media-start="0" data-track-index="0"></video>
      <audio id="voz-a" src="assets/gancho.mp4" data-start="0" data-duration="${seg(mill(TB))}" data-media-start="0" data-track-index="4" data-audio-group="voz"></audio>`
  : `      <video id="toma-a" class="clip tarjeta" src="assets/gancho.mp4" playsinline data-has-audio="true" data-start="0" data-duration="${seg(mill(TB))}" data-media-start="0" data-track-index="0" data-volume="1" data-audio-group="voz"></video>`;
const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Racha · Lina · prueba de estilo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: ${PAPEL}; }
      /* Fondo color papel con rayas muy suaves, como hoja de cuaderno puesta de lado. */
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${PAPEL} repeating-linear-gradient(90deg, transparent 0 178px, rgba(0, 0, 0, 0.045) 178px 180px); }
      .clip { position: absolute; inset: 0; }
      /* La tarjeta de la presentadora: un bloque ámbar abajo, y ella adentro. */
      #bloque { inset: auto; left: 162px; top: 757px; width: 756px; height: 1163px; background: ${AMBAR}; z-index: 1; }
      .tarjeta { inset: auto; left: 162px; top: 757px; width: 756px; height: 1163px; object-fit: cover; object-position: 50% 0; z-index: 2; }
      /* Pantalla partida: ella a todo lo ancho, corrida hacia abajo; el papel rasgado la tapa arriba. */
      .partida { inset: auto; left: 0; top: 600px; width: 1080px; height: 1920px; object-fit: cover; z-index: 2; }
      #escena-a, #escena-b, #escena-c { z-index: 3; }
      #subtitulos { z-index: 4; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${seg(mill(TOTAL))}" data-width="1080" data-height="1920">
      <hf-audio-group id="voz" data-label="Voz de Lina" data-fx-chain='{"version":1,"nodes":[{"type":"gain","id":"v1","params":{"gain":${GANANCIA}}},{"type":"limiter","id":"v2","params":{"limit":-1.5}}]}'></hf-audio-group>

      <div id="bloque" class="clip" data-start="0" data-duration="${seg(mill(TC))}" data-track-index="1"></div>

      <!-- Pista 0 · Lina -->
${tomaA}
${tomasB}

      <!-- Pista 2 · Los gráficos de cada frase -->
${anfitrion('escena-a', 0, TB, 2, 'graphics')}
${anfitrion('escena-b', TB, TC, 2, 'graphics')}
${anfitrion('escena-c', TC, TOTAL, 2, 'graphics')}

      <!-- Pista 3 · Subtítulos -->
${anfitrion('subtitulos', 0, TOTAL, 3, 'captions')}

      <!-- Pista 5 · Sonidos -->
      <audio id="sfx-b" src="assets/whoosh.wav" data-start="${n(TB - 0.1)}" data-duration="0.42" data-track-index="5" data-volume="0.3"></audio>
      <audio id="sfx-sello" src="assets/golpe.wav" data-start="${n(cuando('b', /^todo/) + 0.22)}" data-duration="0.4" data-track-index="6" data-volume="0.35"></audio>
      <audio id="sfx-c" src="assets/whoosh.wav" data-start="${n(TC - 0.1)}" data-duration="0.42" data-track-index="5" data-volume="0.3"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(P, 'index.html'), html, 'utf8');
console.log(`Listo: dura ${TOTAL.toFixed(2)} s; escenas en 0, ${TB.toFixed(2)} y ${TC.toFixed(2)}; recorte clip 1: ${RECORTE ? 'sí' : 'no'}; recorte clip 2: ${RECORTE2 ? 'sí' : 'no'}`);
console.log(palabras.map((p) => `${p.i.toFixed(2)} ${p.t}`).join(' | '));
