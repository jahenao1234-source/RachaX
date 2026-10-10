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

## Los anuncios de pantalla grabada (`design/anuncios/campana/pantalla1/` y `pantalla2/`)

Luis haciendo cosas, después la pantalla grabada por Johnatan, una frase fija arriba, música y la tarjeta del precio.
1. Material: los clips de Luis en `campana/hombre/clips/` (textos en `campana/avatar-hombre-textos-flow.md`), las tomas en `campana/grabaciones/` (qué hay en cada una: `tramos.md`) y la pista en `pantalla1/musica/`.
2. El ritmo de la música: sacar el audio a WAV mono (`ffmpeg -i pista.mp4 -vn -ac 1 -ar 22050 pista.wav`) y `python design/herramientas/ritmo.py pista.wav`.
3. Borrador rápido: `bash design/herramientas/anuncio-pantalla-1.sh` (arriba del script están la frase, los cortes y los datos de la música).
4. Versión final: `node design/herramientas/hf-pantalla.mjs <pieza>` (piezas: `pantalla1` y `pantalla2`; con `--solo-html` no rehace los cortes). Después, dentro de `pantalla1/hyperframes/`: `check`, `snapshot --at ...` y `render --low-memory-mode -w 1 -f 30 -o ../<pieza>-v1.mp4` (menos de 3 minutos).
5. Pruebas de las tomas sueltas: `prueba-pantalla.sh` (primera grabación, corrige el azul) y `prueba-pantalla-2.sh` (tomas horizontales en 4K).

Las reglas de guiones y de edición están en las skills `guiones-anuncios` y `editor-anuncios` (en `C:\Users\jahen\.claude\skills\`).

## El anuncio todo animado con voz en off (`design/anuncios/campana/guion3/`)

Estilo de la referencia 7: palabras grandes que entran cuando la voz las dice, dibujos estilo cómic (los del PDF, en `design/pdf/imagenes/`), la app en movimiento dentro de un celular y la tarjeta del precio. Sin presentador.

1. **La voz** (ElevenLabs, Linda Gomez). Con los ajustes de fábrica suena robótica; la que le gustó a Johnatan se hizo así:
   `MODELO=eleven_v3 AJUSTES='{"stability":0.5}' node design/herramientas/elevenlabs.mjs decir TsKSGPuG26FpNj0JzQBq "<texto con indicaciones como [conversational, warm] y [upbeat]>" <salida.mp3>`
   Si a Johnatan le suena "plana": bajar la estabilidad (0,3 o 0) y poner una indicación de tono distinta en cada frase. `python design/herramientas/tono-de-voz.py <audios>` mide cuánto sube y baja el tono: la voz que le gustó varía unos 2,9 semitonos; las que le sonaron robóticas o planas, 2,4.
   OJO: `silenceremove` se come el comienzo de palabras suaves. Desde el guion 8 las pausas se quitan con `python design/herramientas/voz-sin-pausas.py <voz.mp3> <voz.palabras.json> <salida.mp3> 0.22 "¿Hace=0.7"` (corta por la transcripción; el último dato deja una pausa más larga antes de esa palabra). Voces nuevas: `node design/herramientas/voces-biblioteca.mjs colombian`.
   Después se le recortan las pausas con `silenceremove` de ffmpeg y se transcribe (`transcribir-assembly.mjs`) para comprobar que dijo el texto y tener el momento de cada palabra.
2. **La app en movimiento:** con la muestra prendida (`npm.cmd run muestra`), `node design/herramientas/grabar-campana-g3.cjs` (con el `NODE_PATH` de puppeteer-core). Abre la muestra en un Chrome invisible, hace los toques en los segundos del anuncio que dice `TOQUES` (arriba en el script) y deja `guion3/app/celular.mp4` (858 x 1760, empieza en el segundo 6 del anuncio) y `celular.json` (cuándo fue cada toque y dónde está cada cosa en la pantalla). Para que salga nítida, Chrome va con `--force-device-scale-factor=3`: con la densidad emulada de `setViewport` la grabación en movimiento sale de 390 x 800. Si cambia la voz, se ajustan los `TOQUES` y se graba otra vez. (`capturas-campana-g3.cjs` toma las mismas pantallas, quietas; se usó en la versión 1.)
3. **El proyecto:** `node design/herramientas/hf-animado.mjs guion3` (`--solo-html` para no rehacer el sonido). Cada escena es una pieza en `compositions/` y empieza en la primera palabra de su frase; los números de palabra están en el script. El celular vive en `index.html` y la línea de tiempo principal lo mueve y lo acerca (`CAM`).
4. Dentro de `guion3/hyperframes`: `check`, `snapshot --at ...` y, con el visto bueno, `render --low-memory-mode -w 1 -f 30 -o ../guion3-el-dia-malo-v1.mp4`.

## El anuncio orgánico de persona que explica (`design/anuncios/campana/guion4/`)

Estilo de la referencia 5: Lina habla a cámara unos segundos y se corta a la acción y a la app. Los clips los genera Johnatan en Flow con `campana/guion4-textos-flow.md`.

- **La app en movimiento, a pantalla completa:** con la muestra prendida, `node design/herramientas/grabar-campana-g4.cjs` (con el `NODE_PATH` de puppeteer-core). Deja en `guion4/app/` tres tomas de 1080 x 1920 con su `.json` (en qué segundo fue cada toque): `1-escribe` (se escribe "Organizar el cuarto" en Nueva tarea), `2-pasos` (la tarea con sus pasos; se le pone día a dos) y `3-hoy` (Hoy con el paso en "Tareas de hoy"; se marca). En la muestra esa tarea viene terminada: el script la deja sin hacer solo dentro de su navegador invisible, sin tocar la muestra.
- Falta el generador de HyperFrames de este estilo.

## El estilo Viral (`design/anuncios/campana/guion5/`)

Persona hablando de cerca con cortes secos, acercamientos de golpe, destellos, una copia de sí misma al oído, palabras grandes en ámbar y subtítulos pequeños. Referencia y descripción cuadro a cuadro: `design/anuncios/referencias/oct8/ref8-analisis.md`.

1. Transcribir cada clip (`transcribir-assembly.mjs`; para un video en otro idioma, `IDIOMA=auto`) y compararlo con el guion: Flow a veces agrega o repite palabras.
2. La copia para el gancho: un clip de la presentadora de perfil sobre pared lisa, sin voz, y recortarlo del fondo dentro de `guion5/clips`: `npx --yes hyperframes@0.8.138 remove-background copia-susurra.mp4 -o copia-susurra-recorte.webm` (unos 3 minutos).
3. `node design/herramientas/hf-viral.mjs guion5-gancho` (`--solo-html` para no rehacer los cortes). En el script, cada pedazo hablado es `[archivo, palabra inicial, palabra final]`: así entra solo el tramo que sirve. Los acercamientos, el destello, la copia y las palabras grandes se ubican con `[número del pedazo, número de palabra]`.
4. Dentro de `guion5/hyperframes-gancho`: `check`, `snapshot --at ...` y `render --low-memory-mode -w 1 -f 30 -o ../guion5-gancho-v1.mp4`.
5. El anuncio completo es la pieza `guion5` (proyecto en `guion5/hyperframes`). Además de lo anterior lleva tarjetas, la app en movimiento, **transiciones** en los cambios de parte (`transiciones: [{ en, tipo: 'barrido' | 'zoom' | 'salto' }]`) y **efectos de sonido**.

### Efectos de sonido y música

- `bash design/herramientas/sonidos-campana.sh` genera con ElevenLabs los efectos que falten (la lista, con su descripción en inglés, está dentro del script) en `campana/sonidos/originales/`. Para repetir uno: borrarlo y correr `bash design/herramientas/sonidos-campana.sh <nombre>`.
- `python design/herramientas/sonidos-preparar.py` los deja listos en `campana/sonidos/<nombre>.wav` y escribe `sonidos.json` con las medidas.
- `hf-viral.mjs` pone cada efecto donde pasa algo (el volumen de cada uno está en `VOLUMEN`, en dB), los mezcla en `assets/efectos.wav` y deja la lista con los segundos en `guion5/guion5-sonidos.txt`. Con `SIN_SONIDOS=1` no los pone.
- `node design/herramientas/poner-musica.mjs <video.mp4> <musica.wav> <salida.mp4>` le pone música a un video ya exportado sin volver a exportar la imagen (`BAJO=16` es cuántos dB queda por debajo de la voz).
- `node design/herramientas/elevenlabs.mjs saldo` dice cuántos créditos quedan.
- **Si solo cambian los sonidos (cuál, dónde o qué tan fuerte), no hay que exportar otra vez** (son 5 minutos): `node design/herramientas/hf-viral.mjs guion5 --solo-html` rehace `assets/efectos.wav`, y el audio se vuelve a pegar sobre el video ya exportado:
  `ffmpeg -i guion5-...-v3.mp4 -i hyperframes/assets/voz.wav -i hyperframes/assets/efectos.wav -filter_complex "[1:a][2:a]amix=inputs=2:normalize=0:duration=first[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k salida.mp4`
- **Ponerle sonidos nuevos a un anuncio ya exportado** (hecho con el guion 1): `node design/herramientas/pasos-de-un-proyecto.mjs <carpeta del proyecto> [selector]` lista todo lo que se mueve con su segundo; `node design/herramientas/sonidos-g1.mjs` rehace la voz sola desde el proyecto, pone un efecto por cada cosa y lo pega sobre `guion1-empezar-con-todo-v1.mp4` → `…-v2.mp4`, sin exportar la imagen otra vez. Lo que llega volando y frena al final suena cuando va por el 62 % del movimiento (medido).
- Sincronía: en el script, `suena(nombre, segundo, { alGolpe, desde, dura, db })`. `alGolpe` pone el punto más fuerte del efecto en ese segundo; `desde` y `dura` usan solo un pedazo. Los toques de una grabación de la app se miden en la grabación (el cuadro donde cambia la pantalla).

## El anuncio de lista, sin avatar (`design/anuncios/campana/guion8/`)

Formato "lista de presión" (referencia: `referencias/oct9/ref02`). Guion 8 "Deberías".

1. **La voz:** `voces-biblioteca.mjs colombian` para buscar voces; `elevenlabs.mjs decir <id> "$(cat guion8/voz/texto-final-v2.txt)" <salida>` con `MODELO=eleven_v3 AJUSTES='{"stability":0.3}'` (voz: Juan Restrepo, `ucWwAruuGtBeHfnAaKcJ`); `transcribir-assembly.mjs`; `python voz-sin-pausas.py <voz.mp3> <voz.palabras.json> <salida.mp3> 0.22 "¿Hace=0.7" "Si=0.45"`; transcribir otra vez. `python tono-de-voz.py <audios>` mide cuánto varía el tono (es un dato, no sirve para descartar voces).
2. **Las fotos:** siete, en `guion8/imagenes/` (`1-despertador` … `7-cuaderno`); los textos están en `campana/guion8-textos-imagenes.md`.
3. **El proyecto:** `node design/herramientas/hf-lista.mjs guion8-gancho` (`--solo-html` para no rehacer la voz ni las fotos). Pone el filtro a las fotos, amarra todo a las palabras de la voz y mezcla los efectos (`guion8/guion8-gancho-sonidos.txt`).
4. Dentro de `guion8/hyperframes-gancho`: `check`, `snapshot --at …`, `render --low-memory-mode -w 1 -f 30 -o ../guion8-gancho-v1.mp4` (2 minutos). Después, mirar cuadros del video exportado.
5. El anuncio completo: `node design/herramientas/hf-lista.mjs guion8` → `guion8/hyperframes/`; `render … -o ../guion8-deberias-v1.mp4` (49 s; unos 7 minutos).
6. **Si `check` o `render` fallan con `spawn UNKNOWN`:** Windows bloqueó el navegador propio de HyperFrames ("Control de aplicaciones"). No se toca esa protección; se usa el navegador invisible de Playwright, que sí está permitido: `export HYPERFRAMES_BROWSER_PATH="C:/Users/jahen/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe"` antes del comando (con el Chrome normal sirven `check` y `snapshot`, pero `render` no). Vale para todos los proyectos de HyperFrames.

## Estilo de las referencias del 10 de octubre (sin nombre todavía): `hf-relato.mjs`

Voz en off que cuenta una historia, fotos quietas en blanco y negro con grano, un solo color que brilla (ámbar) solo sobre el objeto que se nombra, garabatos de luz, letras crema pequeñas arriba palabra por palabra y los nombres o fechas en letra con serifa (Bodoni MT, del sistema). Análisis: `design/anuncios/referencias/oct10/analisis.md`.

1. **La voz:** `MODELO=eleven_v3 AJUSTES='{"stability":0.2}' node design/herramientas/elevenlabs.mjs decir ucWwAruuGtBeHfnAaKcJ "$(cat guion2/voz/texto-v2-misterio.txt)" <salida.mp3>` (Juan Restrepo, con indicaciones de misterio); `transcribir-assembly.mjs`; `python voz-sin-pausas.py <voz.mp3> <voz.palabras.json> <salida.mp3> 0.25 @16=0.55 @76=0.65 …` (`@N=segundos` deja una pausa de suspenso antes de la palabra número N); transcribir otra vez y comparar.
2. **El proyecto:** `node design/herramientas/hf-relato.mjs guion2` (proyecto en `campana/guion2/hyperframes/`; con `--solo-html` no rehace la voz ni las fotos). Las fotos van en `guion2/imagenes/`. En el archivo, cada foto (`TOMAS`) dice en qué palabra entra, sus encuadres (`marcos`: la cámara se mete de golpe en la palabra clave), los óvalos de lo que brilla en ámbar y los garabatos, todo en fracción de la foto. `W` son los números de las palabras clave en la transcripción: si la voz cambia, el programa para y avisa. `BLOQUES` son las letras pequeñas (un `~` delante de la palabra que va en grande en otra parte).
3. **El sonido:** la voz pasa por un tratamiento de cine (queda `assets/voz-limpia.wav`; `VOZ_CINE=0` lo quita). Los efectos de cine (`boom`, `subida`, `neon`, `diapositiva`, `garabato`, `latido`, `brillo`) se piden con `bash design/herramientas/sonidos-campana.sh <nombres>` y se preparan con `python design/herramientas/sonidos-preparar.py`. La lista con el segundo de cada uno queda en `guion2/guion2-sonidos.txt`. La música (de suspenso, no la de la campaña) la genera Johnatan y se pone con `poner-musica.mjs`.
4. Dentro del proyecto, con `HYPERFRAMES_BROWSER_PATH` puesto: `check`, `snapshot --at …` (las hojas salen como `contact-sheet-1.jpg`, `-2`…), `render --low-memory-mode -w 1 -f 30 -o ../<nombre>.mp4` (66 s exportan en unos 13 minutos; correrlo en segundo plano). Después, sacar cuadros del video y mirarlos.

