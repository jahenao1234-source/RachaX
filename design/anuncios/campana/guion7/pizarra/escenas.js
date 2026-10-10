/* Guion 7 · "La regla" (vender el método) · estilo Pizarra con Lina.
 * El tiempo lo manda la voz de Lina: window.K (tiempos.js) trae el segundo del anuncio en que empieza cada frase.
 * Lina va encima, en un círculo abajo a la derecha (centro 860,1380, radio 170): ahí no se dibuja nada.
 * En los primeros K.shrink segundos Lina tapa toda la pantalla (el gancho); el tablero empieza a dibujar ahí.
 * Storyboard: STORYBOARD.md. Textos en pantalla PROVISIONALES hasta que Johnatan los apruebe.
 */
bootVideo(async (V) => {
  const { el, P, T, H, PAL, INK, done, draw, write, pop, popIn, type, comic, wobble, mover, bubble, image,
          face, arms, person, popPerson, newScene, show, BG, TR, finale, setTool, tl, S } = V;
  const { orange: AMBAR, green: VERDE, red: ROJO, gray: GRIS, chalk: TIZA, chalkO: TIZA_O, sepia: SEPIA, graphite: GRAFITO } = PAL;
  const K = window.K;
  const LLAMA = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z';
  const llama = (g, x, y, k, at) => { const m = mover(g, x, y, k); done(P(m.g, LLAMA, { color: INK, w: 1.1, fill: H('orange') })); popIn(m.g, at, { origin: '50% 100%' }); return m; };
  // una tira de días: círculos dibujados a mano; devuelve los centros
  const tira = (g, y, n, at, { x0 = 150, paso = 130, r = 46, color = INK, cada = 0.07, llenos = 0, grosor = 7 } = {}) => {
    const cs = [];
    for (let i = 0; i < n; i++) { const x = x0 + i * paso; cs.push([x, y]);
      draw(P(g, wobble(x, y, r, r), i < llenos ? { color, w: grosor, fill: H('orange') } : { color, w: grosor }), at + i * cada, 0.16, { sound: i === 0 }); }
    return cs;
  };
  const equis = (g, [x, y], at, { color = ROJO, r = 34, w = 11 } = {}) => {
    draw(P(g, `M${x - r},${y - r} L${x + r},${y + r}`, { color, w }), at, 0.12);
    draw(P(g, `M${x + r},${y - r} L${x - r},${y + r}`, { color, w }), at + 0.12, 0.12);
  };
  const chulo = (g, [x, y], at, { color = VERDE, k = 1, w = 12 } = {}) => draw(P(g, `M${x - 40 * k},${y} L${x - 8 * k},${y + 34 * k} L${x + 48 * k},${y - 40 * k}`, { color, w }), at, 0.25);
  const punto = (g, [x, y], at, color, r = 30) => draw(P(g, wobble(x, y, r, r), { color, w: r }), at, 0.1, { sound: false });
  let t = 0;

  /* 1 · GANCHO (papel + plumón). El tablero se ve desde K.shrink. */
  const s1 = newScene('paper'); show(s1, 0); setTool('marker');
  let dia6;
  { const g = s1.g, a = K.shrink;
    write(T(g, 540, 360, 'El día que fallas', { size: 120 }), a + 0.05, 0.45);
    pop(T(g, 540, 490, 'NO daña tu hábito', { size: 100, color: AMBAR }), a + 0.55, { rot: -3 });
    const cs = tira(g, 720, 7, a + 0.2, { llenos: 5 }); dia6 = cs[5];
    equis(g, cs[5], a + 0.85);
    // "Lo daña el siguiente": una flecha salta del día fallado al que sigue
    const b = K.sig;
    draw(P(g, `M${cs[5][0]},${cs[5][1] - 70} C${cs[5][0] + 30},${cs[5][1] - 150} ${cs[6][0] - 30},${cs[6][1] - 150} ${cs[6][0]},${cs[6][1] - 70}`, { color: ROJO, w: 9 }), b, 0.3);
    draw(P(g, `M${cs[6][0] - 26},${cs[6][1] - 96} L${cs[6][0]},${cs[6][1] - 66} L${cs[6][0] + 28},${cs[6][1] - 98}`, { color: ROJO, w: 9 }), b + 0.28, 0.12);
    draw(P(g, wobble(cs[6][0], cs[6][1], 66, 66), { color: ROJO, w: 8 }), b + 0.4, 0.3);
    write(T(g, 540, 960, 'Lo daña el siguiente', { size: 112, color: ROJO, rot: -2 }), b + 0.15, 0.6);
    const pm = mover(g, 190, 1560, 1.25), d = person(pm.g, 0, 0, 1, { shirt: 'teal' });
    popPerson(d, a + 0.4); face(d, a + 1.0, 'wide', { mouth: 'o' }); face(d, b + 0.5, 'sad', { mouth: 'frown', emote: 'sweat' });
    t = K.c2 - 0.5;
  }
  const s2 = newScene('chalk', { filter: 'url(#chalk)' });
  t = TR.iris(s1, s2, t, { x: dia6[0], y: dia6[1] });

  /* 2 · UNA VEZ ES UN ACCIDENTE (pizarrón + tiza) */
  setTool('chalk');
  { const g = s2.g, a = K.c2;
    write(T(g, 540, 360, 'Fallar una vez', { size: 124, color: TIZA }), a + 0.05, 0.5);
    write(T(g, 540, 500, '= un accidente', { size: 112, color: TIZA_O }), a + 0.7, 0.5);
    const pm = mover(g, 250, 1250, 1.5), d = person(pm.g, 0, 0, 1, { ink: TIZA, outline: true });
    popPerson(d, a + 0.3); tl.to(pm, { r: 78, x: 330, duration: S(0.25), ease: 'power2.in' }, S(a + 1.0)); comic(g, 470, 1020, '¡UPS!', a + 1.2, { color: TIZA_O, size: 110, rot: -8 });
    face(d, a + 1.25, 'swirl', { mouth: 'o' });
    tl.to(pm, { r: 0, x: 250, duration: S(0.3), ease: 'back.out(2)' }, S(a + 2.0)); face(d, a + 2.3, 'happy', { mouth: 'smile' });
    // "Le pasa a todo el mundo": el estudio (el mismo dato aprobado en el guion 5)
    const e = K.c2b;
    write(T(g, 540, 700, 'Estudio con 96 personas:', { size: 60, color: '#C9D2CC', cls: 'kalam' }), e, 0.5);
    write(T(g, 540, 790, 'faltar un día no afectó el hábito', { size: 58, color: TIZA, cls: 'kalam' }), e + 0.5, 0.7);
    write(T(g, 540, 860, 'Lally y otros, 2010', { size: 40, color: '#9FB0A8', cls: 'kalam' }), e + 1.1, 0.3);
    t = K.c3 - 0.5;
  }
  const s3 = newScene('graph');
  t = TR.eraser(s2, s3, t);

  /* 3 · DOS SEGUIDAS = OTRA COSTUMBRE (cuadrícula, sin herramienta) */
  setTool(null);
  { const g = s3.g, a = K.c3;
    pop(T(g, 540, 360, 'Dos seguidas', { size: 140, color: ROJO }), a + 0.3, { rot: -3 });
    pop(T(g, 540, 480, '= otra costumbre', { size: 96 }), K.c3b, { rot: 2 });
    pop(T(g, 100, 640, 'falla un día', { size: 62, cls: 'kalam', anchor: 'start' }), a + 0.5);
    const A = tira(g, 740, 7, a + 0.5, { cada: 0.05 });
    [0, 1, 3, 4, 5, 6].forEach((i, k) => punto(g, A[i], a + 0.9 + k * 0.16, AMBAR));
    equis(g, A[2], a + 1.25, { r: 26, w: 9 });
    pop(T(g, 100, 900, 'fallan dos', { size: 62, cls: 'kalam', anchor: 'start' }), a + 1.9);
    const B = tira(g, 1000, 7, a + 1.9, { cada: 0.05 });
    [0, 1].forEach((i, k) => punto(g, B[i], a + 2.3 + k * 0.16, AMBAR));
    equis(g, B[2], a + 2.7, { r: 26, w: 9 }); equis(g, B[3], a + 3.0, { r: 26, w: 9 });
    [4, 5, 6].forEach((i, k) => draw(P(g, `M${B[i][0] - 24},${B[i][1]} L${B[i][0] + 24},${B[i][1]}`, { color: GRIS, w: 9 }), a + 3.4 + k * 0.18, 0.1, { sound: false }));
    write(T(g, 60, 1180, 'la de no hacerlo', { size: 84, color: GRIS, anchor: 'start', cls: 'kalam' }), K.c3c, 0.6);
    t = K.c4 - 0.5;
  }
  const s4 = newScene('sepia');
  t = TR.flip(s3, s4, t);

  /* 4 · "MAÑANA SÍ" (pergamino + pluma) */
  setTool('quill');
  { const g = s4.g, a = K.c4;
    write(T(g, 540, 360, 'A mí me pasaba…', { size: 116, color: SEPIA }), a + 0.05, 0.6);
    const pm = mover(g, 200, 1500, 1.4), d = person(pm.g, 0, 0, 1, { ink: SEPIA });
    popPerson(d, a + 0.3); face(d, a + 0.9, 'lookU', { mouth: 'flat' });
    const gl = bubble(g, 330, 640, 800, 860, 420, 980);
    popIn(gl, K.c4b, { origin: '30% 100%' });
    pop(T(g, 565, 780, 'mañana sí', { size: 92, color: SEPIA }), K.c4b + 0.12, { sound: false });
    arms(d, K.c4b + 0.1, { R: -50 });
    write(T(g, 560, 1120, '…y mañana tampoco', { size: 96, color: ROJO, rot: -3 }), K.c4c, 0.7);
    face(d, K.c4c + 0.3, 'sad', { mouth: 'frown', emote: 'sweat' }); arms(d, K.c4c + 0.3, { R: 0 });
    t = K.c5 - 0.5;
  }
  const s5 = newScene(BG.sunburst('#F5A524', '#FFC45E'));
  t = TR.slideUp(s4, s5, t);

  /* 5 · EL MÉTODO (ámbar con rayos, sin herramienta) */
  setTool(null);
  { const g = s5.g, a = K.c5;
    pop(T(g, 540, 430, 'MÉTODO', { size: 190, color: '#16130F' }), a + 0.45, { rot: -4, sound: 'stamp' });
    pop(T(g, 540, 620, 'ANTI-ABANDONO', { size: 132, color: '#FFF7E6', stroke: '#16130F' }), a + 0.85, { rot: 2, sound: 'stamp' });
    const m = llama(g, 150, 1180, 16, a + 1.2);
    tl.to(m, { y: 1100, duration: S(0.18), yoyo: true, repeat: 3, ease: 'power1.out' }, S(a + 1.6));
    write(T(g, 540, 840, 'tiene una sola regla', { size: 88, color: '#16130F', cls: 'kalam' }), K.c5b, 0.6);
    t = K.regla - 0.45;
  }
  const s6 = newScene('notebook');
  t = TR.flash(s5, s6, t);

  /* 6 · LA REGLA (cuaderno + lápiz) */
  setTool('pencil');
  { const g = s6.g, a = K.regla;
    write(T(g, 470, 420, 'Un día malo', { size: 136, color: GRAFITO }), a + 0.05, 0.5);
    write(T(g, 470, 560, 'se vale', { size: 120, color: VERDE }), a + 0.6, 0.35);
    chulo(g, [900, 500], a + 0.95, { k: 1.5 });
    write(T(g, 470, 820, 'Dos seguidos,', { size: 136, color: GRAFITO }), K.dos, 0.5);
    pop(T(g, 470, 990, 'NO', { size: 210, color: ROJO }), K.dos + 0.6, { rot: -6, sound: 'stamp' });
    equis(g, [900, 900], K.dos + 0.7, { r: 60, w: 14 });
    draw(P(g, 'M150,1090 C320,1110 520,1080 640,1100', { color: ROJO, w: 9 }), K.dos + 1.0, 0.3);
    t = K.c7 - 0.5;
  }
  const s7 = newScene('kraft');
  t = TR.iris(s6, s7, t, { x: 900, y: 900 });

  /* 7 · LA VERSIÓN MÁS PEQUEÑA (cartón + pincel) */
  setTool('brush');
  { const g = s7.g, a = K.c7;
    write(T(g, 540, 350, 'Sin fuerzas:', { size: 96, cls: 'kalam' }), a + 0.05, 0.4);
    write(T(g, 540, 480, 'la versión más pequeña', { size: 104, color: AMBAR }), K.c7b, 0.7);
    write(T(g, 540, 720, 'Entrenar 30 minutos', { size: 96 }), K.min, 0.6);
    draw(P(g, 'M150,700 C400,680 700,720 930,690', { color: ROJO, w: 12 }), K.diez - 0.1, 0.25);
    pop(T(g, 540, 910, '10 sentadillas', { size: 150, color: VERDE }), K.diez + 0.3, { rot: -3 });
    const pm = mover(g, 210, 1540, 1.4), d = person(pm.g, 0, 0, 1, { shirt: 'teal' });
    popPerson(d, a + 0.4); face(d, a + 0.8, 'sad', { mouth: 'flat', emote: 'zzz' });
    face(d, K.diez + 0.4, 'determined', { mouth: 'smile' });
    for (let i = 0; i < 3; i++) { tl.to(pm, { s: 1.15, y: 1560, duration: S(0.16) }, S(K.diez + 0.6 + i * 0.36)); tl.to(pm, { s: 1.4, y: 1540, duration: S(0.16) }, S(K.diez + 0.78 + i * 0.36)); }
    // "Con eso ya no son dos seguidos": el día que iba a quedar vacío se llena
    const b = K.c8, D = tira(g, 1190, 3, b, { x0: 420, paso: 110, r: 40, cada: 0.05 });
    punto(g, D[0], b + 0.1, AMBAR, 26); equis(g, D[1], b + 0.25, { r: 24, w: 9 });
    punto(g, D[2], b + 0.6, VERDE, 26); face(d, b + 0.8, 'happy', { mouth: 'grin', emote: 'sparkle' });
    write(T(g, 600, 1080, 'ya no son dos seguidos', { size: 62, color: VERDE, cls: 'kalam' }), b + 0.5, 0.5);
    t = K.c9 - 0.5;
  }
  const s8 = newScene('blue');
  t = TR.expand(s7, s8, t, { x: 620, y: 1160, w: 80, h: 80, color: '#2B4FD8' });

  /* 8 · VIENE DENTRO DE RACHA (azul, tecleado) */
  setTool(null);
  { const g = s8.g, a = K.c9;
    type(T(g, 540, 340, 'El método viene dentro de', { size: 62, color: '#FFFFFF', cls: 'kalam' }), a + 0.05, 0.6);
    pop(T(g, 540, 500, 'Racha', { size: 210, color: '#FFC45E' }), K.c9b, { rot: -3 });
    pop(T(g, 540, 610, 'es una app', { size: 70, color: '#FFFFFF', cls: 'kalam' }), K.c9b + 0.4);
    // un celular con una captura real de la app
    const cel = el('g', {}, g);
    done(P(cel, 'M120,700 Q120,670 150,670 L500,670 Q530,670 530,700 L530,1500 Q530,1530 500,1530 L150,1530 Q120,1530 120,1500 Z', { color: '#16130F', w: 10 }));
    image(cel, 'app.png', 136, 690, 378, 820);
    popIn(cel, K.c9b + 0.2, { origin: '50% 100%' });
    pop(T(g, 570, 820, 'te lo recuerda', { size: 58, color: '#FFFFFF', anchor: 'start', cls: 'kalam' }), K.c9c, { rot: -2 });
    pop(T(g, 570, 930, 'y lleva la cuenta', { size: 58, color: '#FFFFFF', anchor: 'start', cls: 'kalam' }), K.c9d, { rot: 2 });
    t = K.c10 - 0.3;
  }

  /* 9 · CIERRE: el mosaico de todas las escenas */
  t = finale(t, {
    resets: [],
    cta: () => {},   // "Si quieres ver cómo funciona, te lo muestro" y la pastilla del precio los pone la composición final
  });
  return Math.max(t, K.fin);
}, { speed: 1, mode: 'B' });
