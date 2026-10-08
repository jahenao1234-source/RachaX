# Herramientas para armar los PDF y los anuncios

Copias de los scripts que se usaron el 1 y 2 de octubre de 2026 (vivían en la carpeta temporal de la sesión, que se puede borrar).
Todos usan `puppeteer-core` y el Chrome instalado en `C:/Program Files/Google/Chrome/Application/chrome.exe`.

## Antes de correrlos
`puppeteer-core` no está en el proyecto. Se instala en una carpeta temporal y se apunta con `NODE_PATH`:

```bash
npm install puppeteer-core@23
```

```bash
NODE_PATH="<carpeta temporal>/node_modules" node make.js Metodo-Anti-Abandono.pdf
```

## Los PDF (`design/pdf/`)
- `make.js <salida.pdf> [maqueta.html] [prefijo]`: arma el PDF desde la maqueta, pone solas las imágenes de `design/pdf/imagenes/` (por nombre: `1-portada`, `2-dia-en-blanco`, `3-lo-que-dejaste`, `4-volver`, `cap-dia-dificil`, `cap-tarea`, `r1-portada`, `r2-revision`), mide que nada se salga de cada página y deja hojas para mirar en `design/pdf/vista/`.
  - Método: `node make.js Metodo-Anti-Abandono.pdf`
  - Protocolo: `node rescate.js` y luego `node make.js Protocolo-de-Rescate.pdf maqueta-rescate.html rescate`
- `rescate.js`: **genera** `maqueta-rescate.html` tomando el CSS de `maqueta-metodo.html`. No editar ese HTML a mano: se cambia aquí.
- `poner.js <archivo de Gemini> <nombre>`: achica una imagen nueva a 1400 px, la guarda con su nombre y pasa el original a `imagenes/originales/`.
- `capturas.js`: toma las capturas reales de la app (necesita la app corriendo en `localhost:3002`).
- `comparar.js <imagen>`: pone dos portadas lado a lado.
- Si el PDF está abierto en el computador, Windows no deja reescribirlo: se arma con otro nombre y se renombra después.

## Los anuncios (`design/anuncios/`)
- `volante.js`: saca `volante.html` como PNG de 1080 × 1350 en `design/anuncios/volante/` (el camino que le gustó a Johnatan).
- `muestras.js`: saca `muestras.html` (los tres caminos de muestra).
- `anuncios.js`: saca `piezas.html` (las 16 imágenes que Johnatan **rechazó**; se conservan solo como referencia de lo que no va).

## Los videos de Xiomara (`design/anuncios/xiomara/`)
Hace falta ffmpeg (instalado con `winget install Gyan.FFmpeg`). Orden:
1. `capturas-anuncio.cjs`: capturas reales de la app para los videos (día difícil, comodines y "Volviste"), con la app corriendo en `localhost:3002`. Deja las fotos y los recortes en `xiomara/app/`. La hoja de comodines se recorta de `b2-comodines.png` con ffmpeg (`crop=1170:1017:0:648`).
2. `tarjetas-xiomara.cjs`: arma las pantallas completas de 1080 x 1920 (la app en grande, el contador de 23 a 0 y el cierre con el precio) en `xiomara/montaje/tarjetas/`. Avisa si algo se sale de la zona segura de Reels.
3. `bash montar-xiomara-v2.sh`: corta y une los clips de Flow (`xiomara/clips/`), intercala las pantallas completas, pone los subtítulos (`xiomara/montaje/subs2.ass`) y saca `ensayo-guion1-v2.mp4` con una hoja de fotos.
- `montar-xiomara.sh` es el primer montaje, que Johnatan rechazó porque las imágenes tapaban a la presentadora. Se conserva como referencia de lo que no va.
- Voz a texto: `ffmpeg -i clip.mp4 -vn -af "whisper=model=m.bin:language=es:queue=10:destination=clip.srt:format=srt" -f null -` (el modelo está en `modelos/ggml-base.bin`; hay que copiarlo al lado con un nombre sin dos puntos en la ruta).

## Los videos de Lina (`design/anuncios/lina/`)
Lina es la presentadora nueva (guion 4). Sus clips de Flow están en `lina/clips/`. Orden:
1. `node transcribir-assembly.mjs <clip.mp4>`: saca los tiempos de cada palabra con AssemblyAI (lee `ASSEMBLYAI_API_KEY` de `.env.local`) y deja `<clip>.palabras.json`.
2. `capturas-lina.cjs`: capturas reales de la pantalla "Nuevo hábito", con la app corriendo en `localhost:3002`.
3. `node montar-lina.mjs`: el montaje con ffmpeg (`lina-guion4-v1.mp4`). Quita los silencios, mete la app a pantalla completa, subtítulos palabra por palabra y el cierre. También deja las tarjetas en `lina/montaje/`.
4. **`node hf-lina.mjs`: la misma edición en HyperFrames, que es como Johnatan quiere editar.** Escribe el proyecto en `lina/hyperframes/lina-guion4/` (`index.html` con las tomas y los sonidos; `compositions/` con la app, el cierre y los subtítulos; copia los recursos a `assets/`). No se edita el HTML a mano: se cambia el script y se vuelve a correr.

Después, dentro de `lina/hyperframes/lina-guion4/`, con el CLI del plugin (`CLI="C:/Users/jahen/.claude/plugins/cache/hyperframes/hyperframes/<versión>/skills/hyperframes/scripts/plugin-cli.mjs"`):
- `node "$CLI" check`: revisa que todo esté bien (debe dar "Check passed" sin avisos).
- `node "$CLI" snapshot --at 1,5,15,27 --no-end --describe false`: fotos para mirar.
- `node "$CLI" preview --background --port=3040`: abre el editor en `localhost:3040` (el 3002 es de la app). Se apaga con `preview --stop`.
- `node "$CLI" render --low-memory-mode -w 1 -f 24 -o ../../lina-guion4-hf-v1.mp4`: exporta. El computador tiene poca memoria: cerrar programas antes.

### Estilo de tarjeta y gráficos (prueba)
`node hf-lina-estilo.mjs` arma `lina/hyperframes/lina-estilo/`: Lina en una tarjeta ámbar abajo, arriba un titular que se arma palabra por palabra con un dibujo por frase, y una escena de papel rasgado. Sale `lina/lina-estilo-prueba-v1.mp4`.
Antes hay que recortar a Lina del fondo, dentro de `lina-estilo/` (tarda de 4 a 6 minutos por clip):
- `ffmpeg -ss 1.91 -i ../../clips/1-gancho.mp4 -t 4.05 -c:v libx264 -crf 14 -r 24 -c:a aac assets/gancho.mp4` y `node "$CLI" remove-background assets/gancho.mp4 -o assets/gancho-recorte.webm`
- `ffmpeg -i ../../clips/2-mito.mp4 -t 6.8 -c:v libx264 -crf 14 -r 24 -an assets/mito-corto.mp4` y `node "$CLI" remove-background assets/mito-corto.mp4 -o assets/mito-recorte.webm`
Si no existen los recortes, el script usa el clip con su fondo. El recorte deja pedazos del cuadro y la repisa: los clips nuevos deben generarse con pared lisa.

## La campaña (`design/anuncios/campana/`)
Los guiones y el plan están en `campana/guiones.md`; los textos para Flow de cada guion, en `campana/guionN-textos-flow.md`.
Guion 1 (`campana/guion1/`), en estilo Tarjeta con variedad de planos:
1. Los clips los genera Johnatan en Flow y los guarda en `guion1/clips/` (N-nombre.mp4). Lina siempre en plano medio, pared lisa y micrófono en la mano.
2. `node transcribir-assembly.mjs <clip.mp4>` por cada clip hablado.
3. Recortar a Lina del fondo en los clips que van en cuadro: `node "$CLI" remove-background clips/N-nombre.mp4 -o clips/N-nombre-recorte.webm` (4 a 6 minutos cada uno; no correr dos cosas pesadas al tiempo).
4. `capturas-campana-g1.cjs`: capturas reales de la app (crear el hábito "Leer" después de tomar café), con la app en `localhost:3002`.
5. `node hf-campana-g1.mjs`: arma el proyecto de HyperFrames en `guion1/hyperframes/`. Arriba del script están el guion, la lista de planos (en qué palabra empieza cada uno y cómo se ve Lina) y las medidas de cada encuadre. Si falta un clip, usa el 1-gancho de relleno para poder revisar.
6. Dentro de `guion1/hyperframes/`: `check`, `snapshot --at ...`, `preview --background --port=3040` y `render --low-memory-mode -w 1 -f 24 -o ../guion1-empezar-con-todo-v1.mp4` (queda en `guion1/`; tarda más de 10 minutos en este computador).

## Racha de muestra (para grabar la pantalla en los anuncios)

Es la misma app, prendida aparte, **sin cuenta y sin nube**, con datos de ejemplo. No toca la Racha de nadie.

1. En la terminal, dentro de `RachaX`: `npm.cmd run muestra` (queda en el puerto 3003).
2. En Chrome: `http://localhost:3003/zz-demo.html`. Se elige la apariencia y cómo va el día, y se toca el botón.
3. Las fechas salen del día en que se toca el botón: si se graba otro día, se vuelve a esa página y se toca otra vez (borra lo que se haya cambiado en la muestra).

Cómo está hecha:
- `.env.demo` (no sube a git) deja vacías las dos variables de Supabase; con eso la app arranca sin pedir correo y sin sincronizar (`--mode=demo`). Si se pierde, se vuelve a crear con `VITE_SUPABASE_URL=`, `VITE_SUPABASE_ANON_KEY=` y `VITE_VAPID_PUBLICA=`, las tres vacías.
- `design/herramientas/demo-racha.html` es el original de la página; la que se abre es su copia `public/zz-demo.html` (no sube a git ni a la app en vivo). Al cambiar el original hay que copiarlo otra vez.
- La página solo actúa en el puerto 3003 y si no hay una cuenta abierta en ese navegador.
- Datos: la persona se llama Laura; 5 hábitos de la Biblioteca agregados de a uno en 4 meses (agua, leer, entrenar, las 3 cosas, anotar gastos); racha de 17 días, con días difíciles, comodines y dos pausas con regreso; 4 tareas de la Biblioteca (una terminada); 5 compromisos (estos nombres son de ejemplo, no de la Biblioteca); tiempo en Foco; 2 cajas sin abrir.
- Al cargar, la página abre la app a escondidas para cerrar la ventana de premios acumulados y deja 2 cajas y 2 comodines.

## El anuncio de pantalla grabada (`design/anuncios/campana/pantalla1/`)

Luis haciendo cosas, después la pantalla grabada por Johnatan, una frase fija arriba, música y la tarjeta del precio.
1. Material: los clips de Luis en `campana/hombre/clips/` (textos en `campana/avatar-hombre-textos-flow.md`), las tomas en `campana/grabaciones/` (qué hay en cada una: `tramos.md`) y la pista en `pantalla1/musica/`.
2. El ritmo de la música: sacar el audio a WAV mono (`ffmpeg -i pista.mp4 -vn -ac 1 -ar 22050 pista.wav`) y `python design/herramientas/ritmo.py pista.wav`.
3. Borrador rápido: `bash design/herramientas/anuncio-pantalla-1.sh` (arriba del script están la frase, los cortes y los datos de la música).
4. Versión final: `node design/herramientas/hf-pantalla1.mjs` (con `--solo-html` no rehace los cortes). Después, dentro de `pantalla1/hyperframes/`: `check`, `snapshot --at ...` y `render --low-memory-mode -w 1 -f 30 -o ../pantalla1-v1.mp4` (menos de 3 minutos).
5. Pruebas de las tomas sueltas: `prueba-pantalla.sh` (primera grabación, corrige el azul) y `prueba-pantalla-2.sh` (tomas horizontales en 4K).

Las reglas de guiones y de edición están en las skills `guiones-anuncios` y `editor-anuncios` (en `C:\Users\jahen\.claude\skills\`).
