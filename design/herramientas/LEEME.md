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


## Estilo Dark con Jhonny: guion 10 "El golpe 101" (10 oct)

El tercer video del estilo Dark. Sale del molde del guion 9 y le suma el gancho de la piedra con el contador, la grieta de luz, el retrato real recortado del fondo, un clip que se mueve (el picapedrero) y la frase escrita en la pared.

1. **La voz:** igual que en el guion 9 (`elevenlabs.mjs decir` con `MODELO=eleven_v3 AJUSTES='{"stability":0.2}'`, transcribir, `voz-sin-pausas.py` con `@N=segundos`, transcribir otra vez). Ojo: la transcripción da por terminados los años ("1896") antes de tiempo y el corte se come el final; en la palabra que sigue se deja la pausa entera (`@95=0.97`).
2. **Jhonny:** cuatro clips en `guion10/clips/` (`1-gancho`, `2-puente`, `3-cierre`, `4-racha`), cada uno transcrito y con su `-juan.mp3` (`elevenlabs.mjs cambiar ucWwAruuGtBeHfnAaKcJ <audio> <salida>`).
3. **El retrato recortado** (el efecto "resalta y se mueve"): dejar la foto en 1080 × 1920 (`real-riis-vertical.jpg`), `ffmpeg -loop 1 -i foto -t 0.5 -r 4 quieto.mp4`, `npx hyperframes@0.8.138 remove-background quieto.mp4 -o recorte.webm` y `ffmpeg -c:v libvpx-vp9 -i recorte.webm -frames:v 1 real-riis-corte.png`. En el molde son tres capas: la foto oscura y borrosa, una luz ámbar y el recorte, que salta hacia la cámara en la palabra clave.
4. **Un clip con el fondo equivocado** (el picapedrero salió en una calle clara): `remove-background` solo deja a la persona (se lleva el mazo y la piedra). `python design/herramientas/fondo-oscuro-clip.py <clip.mp4> <clip-recorte.webm> <salida.mp4> "x,y x,y ..." 300` suma tres máscaras: la persona, lo que se mueve cerca de ella y un polígono para el objeto quieto. Con `TECHO=790 BANDA=440:680:80` no salen pedazos del suelo ni la gente del fondo. Sirve solo con cámara fija.
5. **Armar:** `node design/herramientas/hf-relato-g10.mjs` (3 minutos; `--solo-html` si solo cambian tiempos, letras o animaciones). Dentro de `guion10/hyperframes`: `check` (los avisos de "content_overlap" de la frase en la pared son por la perspectiva y no importan), `snapshot --at ...` y `render --low-memory-mode -w 1 -f 30 -o ../guion10-golpe-101-v1-maestro.mp4`.
6. **Música de prueba:** `python design/herramientas/musica-mezcla-g10.py` (lee `guion10/tiempos.json`): el gancho va sin música; entra al empezar la historia; un golpe cae cuando la piedra se abre y otro en "todos los de antes".
7. Bajar el peso (`-crf 21 -maxrate 9M`) y poner la música con `poner-musica.mjs` (`BAJO=14 FASE=0 GOLPE=0.5 COMPASES=41 EMPIEZA=0 SUBE=0.05`).

### La app que se llena sola (para el cierre de los anuncios)

La Racha de muestra tiene que estar prendida (configuración `racha-muestra`, puerto 3003) y `NODE_PATH` apuntando a una carpeta con `puppeteer-core`.

- `grabar-llenado.cjs`: en el celular, el mes que se llena día por día (`cal-NN.png`, `calendario.mp4`) y la gráfica que se forma.
- `grabar-llenado-escritorio.cjs`: en el computador, Hoy con las barritas y los chulos, y Progreso. Con `VERTICAL=1` la ventana es de 1024 × 1820 (ya en 9:16) y deja `vhoy-NN.png`.
- `grabar-ventanas.cjs`: graba cada tarjeta de Progreso por separado (`habitos`, `mejorar`, `fuerza`, `anio`) mientras crece la historia. Para que "Tu año" se llene desde marzo, alarga la historia de la muestra solo dentro de la grabación. Lo ya grabado no se repite: si se corta, se vuelve a correr y sigue.
- `python ventanas-viaje.py`: arma el recorrido continuo por esas tarjetas (`app-llenado/viaje.mp4`): la fuerza de los hábitos, las barras, la gráfica y, al final, "Tu año". Sus tiempos (`TOTAL` y `TARJETA`) son los `D_VIAJE` y `EN_TARJETA` del molde.

Ojo: con mucha historia la app abre ventanas de premio y otras hojas; el programa las cierra antes de cada foto, pero hay que comprobarlo. Una foto con una ventana encima queda oscura: se mide el brillo del fondo de cada tarjeta (normal 27 de 255; con ventana, 11 a 17), se borran las raras y se corre otra vez.

Sonidos: los de la parte de la app son graves (`relleno` es un tictac filtrado por debajo de 1.300 Hz). Si ElevenLabs entrega un sonido chillón (centro por encima de 4.000 Hz en `sonidos-preparar.py`), se filtra el original antes de prepararlo.

## El día difícil con cualquier hábito (11 oct)



`HABITO="Entrenar 30 minutos" PIEZA=guion12 NODE_PATH="<scratchpad con puppeteer-core>/node_modules" node design/herramientas/grabar-dia-dificil.cjs` (con la muestra prendida en el puerto 3003). Sale de `grabar-campana-g3.cjs`: toca "¿Día pesado? Haz solo lo mínimo", activa el día difícil, baja al hábito y lo marca en su versión mínima. Deja `<PIEZA>/app/dia-dificil.mp4` (858 × 1760, 7,6 s) y `dia-dificil.json` con el segundo de cada toque (enlace 1,4 · activar 3,6 · marcar 5,0) y las cajas, para cuadrarlo con la voz en el molde.

## Voz limpia y voz de Jhonny igual a la narración (11 oct)



- `python design/herramientas/voz-limpiar.py <entrada> <salida> [voz de referencia]`: baja el ruido entre palabras (antes de comprimir), da cuerpo y deja la voz a un nivel fijo. Con referencia, primero iguala la voz de graves a agudos con ella (tres vueltas de ecualizador): se usa para que el audio de un clip de Jhonny ya pasado por el cambiador de voz suene como la narración.

- `python design/herramientas/voz-comparar.py <voz> <referencia>`: mide la diferencia por franjas y el ruido de fondo de cada una. Es como Claude "oye" si dos voces se parecen.

- Orden: voz cruda de ElevenLabs → `voz-limpiar.py` → `voz-sin-pausas.py` (con el `.palabras.json` de la cruda). Para un clip: `elevenlabs.mjs cambiar` → `voz-limpiar.py <clip-juan.mp3> <salida> <narración limpia>`.

- NO usar `loudnorm` ni compresión fuerte sobre la voz: subían el fondo de -51 a -38 dB. `elevenlabs.mjs` tiene además `limpiar <audio> <salida>` (deja solo la voz; gasta créditos) y `QUITAR_RUIDO=1` en `cambiar`.

## Estilo Dark con Jhonny: guion 12 largo "Ese martes" (11 oct)



1. **La voz:** texto con pocas indicaciones (`guion12/voz/texto-v1.txt`), estabilidad 0,4; las frases clave se generaron aparte con drama (`texto-v2-frases-clave.txt`) y se empalman: `voz-limpiar.py` (las dos tomas; la segunda con la primera como referencia) → `voz-empalmar-g12.py` → `voz-sin-pausas.py martes-v2-compuesta.wav martes-v2-compuesta.palabras.json martes-v2-limpia-sin-pausas.mp3 0.18 @14=0.45 …` → `transcribir-assembly.mjs`.

2. **Jhonny:** cuatro clips en `guion12/clips/` (`1-gancho`, `2-vuelta`, `3-regla`, `4-invitacion`), transcritos; de cada uno: sacar el audio, `elevenlabs.mjs cambiar ucWwAruuGtBeHfnAaKcJ <clip>-flow.mp3 <clip>-juan.mp3` (gasta unos 100 créditos por clip de 10 s) y `voz-limpiar.py <clip>-juan.mp3 <clip>-juan-limpia.wav ../voz/martes-v1-juan-limpia.wav`. Palabras repetidas: `saltar` en el molde. Letras quemadas por Flow: `pre` con `delogo` (medir la caja con los cuadros del clip).

3. **La app (desde la versión 2; es lo que vale):** solo escenas que se llenan solas, sin acercamientos a una grabación de toques. En la parte de "Por eso creamos Racha": Hoy llenándose (`app-llenado/vhoy-NN.png` → `app.mp4`) y el mes en el celular (`cal-NN.png` → `cal.mp4`). En la cola: el recorrido completo por Progreso, 9,3 s, que termina en "Tu año". Para este video el recorrido se arma aparte, con "Tu año" más grande y en la mitad de la pantalla: `ALTO_ANIO=520 Y_ANIO=660 SALIDA=viaje-b.mp4 python design/herramientas/ventanas-viaje.py` (no pisa `viaje.mp4`, que usa el guion 10). La separación entre tarjetas se deja en 380: al agrandarla quedaba una franja vacía mientras la cámara bajaba. `grabar-dia-dificil.cjs` (la versión 1) ya no se usa.

   **El cuadro final:** "escribe RACHA" va ARRIBA de "Tu año" y "y te la muestro" con la pastilla del precio ABAJO; entran apenas llega la cámara (`EN_TARJETA = 4.85`; la frase de abajo a 0,35 s y la pastilla a 0,7 s). `#sombra` es una franja del color del fondo de la app (rgb 15, 17, 19) que tapa el pie de la tarjeta anterior detrás de "escribe RACHA". Antes de exportar, sacar fotos del tramo final (`snapshot --at` cada medio segundo) y mirar que la app nunca quede con franjas vacías alrededor.

4. **El molde:** `node design/herramientas/hf-relato-g12.mjs [--solo-html]` (proyecto en `guion12/hyperframes/`). Gancho: el micrófono a oscuras del guion 9, sin letras. Las letras de la voz llevan fondo cuando van sobre la app (clase `sa`).

5. **La música:** `python design/herramientas/musica-mezcla-g12.py` (los pulsos de "Cold Case Resolution" al 1,19 durante todo el video, los golpes de la mezcla del guion 2 en las frases clave, silencio antes de "ya qué" y final cálido) y `BAJO=10 FASE=0 GOLPE=0.5 COMPASES=44.25 EMPIEZA=0 SUBE=0.05 node design/herramientas/poner-musica.mjs guion12/guion12-ese-martes-v3.mp4 guion12/musica/mezcla-arreglada.wav guion12/guion12-ese-martes-v3-con-musica.mp4` (88 s; la versión 1, de 84 s, iba con `COMPASES=42.25`).

6. **Exportar y comprobar:** `render --low-memory-mode -w 1 -f 30` (unos 9 minutos) → bajar el peso con `crf 21` → la música → sacar cuadros del video final y mirarlos → transcribirlo y comparar las 216 palabras con el guion. El que vale: `guion12/guion12-ese-martes-v3-con-musica.mp4`.

## Estilo Dark con Jhonny + efecto de papel: guion 13 "Voy a cambiar" (13 oct)

El guion lo escribió otra IA y Johnatan lo trajo; aquí solo se dejó listo para producir (ver `campana/guiones.md` › Guion 13 y la memoria `racha-vender-la-transformacion`). El estilo es el Dark de siempre **más** tomas con el efecto de papel del creador (`referencias/oct13/analisis.md`; memoria `racha-efecto-papel-con-dark`): "es una combinación, un agregado para que le dé más dinamismo".

1. **La voz:** con el tono de la del guion 2 (`guion13/voz/texto-v2-misterio.txt`, estabilidad 0,2) → `voz-limpiar.py` (sin sala) → `voz-sin-pausas.py … 0.25 @2=0.6 @10=0.5 …` (se dejan las pausas de suspenso) → transcribir. La que vale: `guion13/voz/cambiar-v2-limpia-sin-pausas.mp3` (72 s, 187 palabras). Una toma de este largo gasta unos 700 créditos.
2. **Jhonny:** cinco clips en `guion13/clips/` (`1-gancho`, `2-evidencia`, `3-cambio`, `4-alguien`, `5-cierre`); de cada uno: sacar el audio (`-flow.mp3`), `elevenlabs.mjs cambiar ucWwAruuGtBeHfnAaKcJ …-flow.mp3 …-juan.mp3` y `voz-limpiar.py …-juan.mp3 …-juan-limpia.wav voz/cambiar-v2-juan-limpia.wav`. En el clip 2 repite "no la convences": `saltar: [9, 10, 11]`.
3. **Mitad video, mitad foto:** tres videos gratis de Pexels en `guion13/videos/` (`FUENTES.md` trae la licencia y las páginas): la libreta (el gancho, "en video sí o sí"), la máquina de escribir y la caminata de noche. Fotos: la oficina del psicólogo (recreada, de espaldas), la ventana, la lista del domingo y el espejo. La persona de la cama va recortada (`remove-background` sobre un video de medio segundo hecho con la foto → `recortes/cama.png`).
4. **El efecto de papel:** `python design/herramientas/papel-tomas.py lleno|recorte|fondo …` (lo llama el molde): papel arrugado, trama de puntos sobre todo el cuadro, todo un poco blando y a saltos (6 imágenes por segundo). `prueba-papel.py` es la prueba suelta que él aprobó (`campana/pruebas/efecto-papel-v2.mp4`). Las letras de esas tomas las pone el molde: Arial gruesa y apretada, y la palabra clave en negro sobre una franja ÁMBAR (sobre papel) o en ámbar (sobre video oscuro). Nada de naranja ni de letra a mano.
5. **El molde:** `node design/herramientas/hf-relato-g13.mjs [--solo-html]` (proyecto en `guion13/hyperframes/`; 109,4 s). Orden: la libreta con rayitas ámbar → Jhonny → 1972 con la máquina (papel) → el psicólogo en su oficina (papel) → la persona en la cama sobre papel, que queda patas arriba en "al revés" → la ventana (Dark) → la libreta otra vez con las rayitas (Dark) → la frase escrita a máquina sobre negro → la lista del domingo (Dark) → Jhonny → el calendario de papel que se marca en ámbar → la caminata con trama → el calendario: 3, 4, 10 → Jhonny dos veces → el espejo (Dark) → el mes de la app llenándose → Jhonny → el recorrido por Progreso y la tarjeta. Los videos van detrás de la escena, que se vuelve transparente en cada ventana (`ventana()`): ahí hay que esconder `#grano`, porque sobre fondo transparente se ve como una niebla gris.
6. **La música:** `python design/herramientas/musica-mezcla-g13.py` (la misma mezcla del guion 12, con los tiempos de `guion13/tiempos.json`) y `BAJO=10 FASE=0 GOLPE=0.5 COMPASES=54.75 EMPIEZA=0 SUBE=0.05 node design/herramientas/poner-musica.mjs …-v1.mp4 guion13/musica/mezcla-arreglada.wav …-v1-con-musica.mp4`.
7. **Exportar y comprobar:** igual que el guion 12 (`render --low-memory-mode -w 1 -f 30`, bajar el peso con `crf 21`, la música, cuadros del video final y transcripción contra el guion).

## Guion 2 "El efecto ya qué", versión 3: el gancho nuevo (14 oct)

Después del primer Reel (la mayoría se iba en el segundo 10) se cambió SOLO el comienzo, con la frase que aprobó Johnatan: "Si siempre dices «el lunes empiezo», no es por flojo. Es por algo que se descubrió con malteadas y helado. Y al final te digo cómo salir de eso." Reglas en la skill `guiones-anuncios` › "Los primeros 10 segundos"; análisis en `anuncios/referencias/oct14/analisis.md`.

1. **La voz del gancho:** `MODELO=eleven_v3 AJUSTES='{"stability":0.3}' node design/herramientas/elevenlabs.mjs decir ucWwAruuGtBeHfnAaKcJ "$(cat guion2/voz/texto-v4-gancho.txt)" guion2/voz/ya-que-v4-gancho-juan.mp3` y transcribirla.
2. **Pegarla:** `python design/herramientas/voz-empalmar-g2-v4.py` → `guion2/voz/ya-que-v4-juan-sin-pausas.mp3` (reemplaza las palabras 0 a 19 de la voz de la versión 2; desde "A un grupo" queda igual; todo se adelanta 1,12 s).
3. **El molde:** `VERSION=3 node design/herramientas/hf-relato.mjs guion2` (proyecto en `guion2/hyperframes-v3/`, 73,1 s): la voz arranca en 0,12 s, encuadres nuevos en "lunes", "flojo", "malteadas" y "final", "1975" pasa a "A un grupo de personas", y el tema "por qué siempre dices «el lunes empiezo»" va fijo arriba hasta que entra la app.
4. **Exportar:** `render --low-memory-mode -w 1 -f 30 -o ../guion2-ya-que-v3-maestro.mp4`, bajar el peso con `crf 21` a `guion2-ya-que-v3.mp4`.
5. **La música:** la misma mezcla de la versión 2 empezando 1,12 s más adelante: `HUECO=55.13:56.08 BAJO=14 FASE=1.12 GOLPE=0.5 COMPASES=36.6 EMPIEZA=0 SUBE=0.05 node design/herramientas/poner-musica.mjs guion2/guion2-ya-que-v3.mp4 guion2/musica/mezcla-v2.wav guion2/guion2-ya-que-v3-con-musica.mp4`.

## Reel "POV" con tus tomas y la app llenándose (pov1, 14 oct de 2026)
Tus tomas reales del portátil (en Descargas, `VID_20261014_*.mp4`) intercaladas con la app llenándose sola (Hoy y el mes),
inclinadas como filmadas de cerca, y el recorrido por Progreso hasta "Tu año" con la tarjeta "escribe RACHA". Sin voz;
cada corte cae en un golpe de los pulsos de "Cold Case Resolution" al 1,19. El plan de tomas está arriba en `hf-pov.mjs` (PLAN).
1. `node design/herramientas/hf-pov.mjs` (`--solo-html` si solo cambian textos o sonidos; `FRASE="renglón 1|renglón 2"` cambia el texto de arriba)
2. `python design/herramientas/musica-pov.py`
3. En `design/anuncios/campana/pov1/hyperframes`: `check`, `snapshot` y `render --low-memory-mode -w 1 -f 30 -o ../pov1-v1-maestro.mp4` (unos 3 minutos)
4. Bajar el peso con `crf 21` a `pov1-v1.mp4` (la música ya va dentro).

## La app llenándose DENTRO de la pantalla de una toma real (pantalla-reemplazo.py, 14 oct de 2026)
Mete las fotos de la app llenándose (ehoy-NN.png) dentro de la pantalla del portátil en una toma de Johnatan, con la perspectiva,
el color, el desenfoque y el grano de su cámara. Su portátil muestra la app a pantalla completa en 1600 × 900.
1. Fotos de la app con la fecha de hoy y en carpeta aparte: `SALIDA=design/anuncios/campana/pov1/pantalla-app NODE_PATH=… node design/herramientas/grabar-llenado-escritorio.cjs hoy`
2. Una foto de referencia igual a lo que se ve en la toma (mismos hábitos marcados), a 1600 × 900 y 2x: `pov1/pantalla-app/referencia-hoy-1600x900.png`
3. `python -X utf8 design/herramientas/pantalla-reemplazo.py <toma.mp4> <inicio> <duración> <referencia.png> <carpeta de fotos> <salida.mp4> [fotos por segundo 8] [arranque 0.3]`
   (necesita `pip install opencv-python-headless`; el seguimiento se guarda en `<salida>-seguimiento-….npy` y la segunda vez no se recalcula; tarda unos 4 minutos con 3,6 s de toma)
Sirve en tomas quietas o de movimiento suave. No sirve si algo pasa por delante de la pantalla (quedaría tapado por la app).
Progreso dentro de la pantalla (lo que más cambia): `grabar-progreso-pantalla.cjs referencias <carpeta>` (fotos bajando la página;
con `PASO`, `DESDE_Y` y `HASTA_Y` se afina) para saber cuánto estaba bajada la página en la toma (se compara dónde caen los bordes
de la pantalla), y `MARZO=1 PASOS=50 ANCLA="Tu año" … grabar-progreso-pantalla.cjs llenado <carpeta> 924` para las fotos que se
llenan desde el 1 de marzo. Después `FOTOS='eprog-*.png' python -X utf8 pantalla-reemplazo.py <toma> 0.3 4.4 <referencia con su
estado> <carpeta> <salida> 13.5 0.3`. La referencia debe verse igual que lo filmado (sin alargar a marzo).

## Video de producto estilo rimu (19 oct de 2026): `hf-vitrina.mjs`

Animación de producto sin personas, copiada de la edición de `anuncios/referencias/oct19/rimu-ref1.mp4` (análisis en `rimu-ref1-analisis-completo.md`): pantallas reales de Racha, letras que entran palabra por palabra con la voz, fondo que alterna negro y blanco con círculos que se abren desde el centro, y ningún corte seco. Voz de Fernando Martínez (`campana/rimu1/voz/vitrina-fernando-v2-limpia.mp3`; el cierre "Escribe Racha y te la muestro" se generó aparte porque la toma cortaba "muestro").
1. `node design/herramientas/hf-vitrina.mjs` (con `PRUEBA=9.55` arma solo el comienzo; `--solo-html` no rehace la voz ni las pantallas). Proyecto en `campana/rimu1/hyperframes/`.
2. Dentro del proyecto, con `HYPERFRAMES_BROWSER_PATH` puesto: `npx --yes hyperframes@0.8.138 check`, `snapshot --at …` y `render --low-memory-mode -w 1 -f 30 -o ../vitrina-vN-maestro.mp4` (29,6 s, unos 5 minutos).
3. Música: `BAJO=16 FASE=0.505 GOLPE=0.545455 COMPASES=30 EMPIEZA=5.656 SUBE=0.05 node design/herramientas/poner-musica.mjs …-maestro.mp4 design/anuncios/campana/guion5/musica/quick-cuts-groove.wav …-vN.mp4` (entra con el ícono de Racha, al terminar el gancho).
- GSAP va guardado en `herramientas/libs/` (con los datos del celular el CDN se cae y `check` no carga).
- Ojo con los nombres internos (`id`): las pantallas de la explosión son `c0…c37`; los números del contador se llamaban igual y movían la pantalla equivocada (ahora `cn1…cn13`). Antes de agregar elementos, buscar que el `id` no exista.
- La escena del celular usa la grabación real `guion12/app/dia-dificil.mp4` desde el segundo 1,1: la hoja abre en "no puedes con nada" y se marca "+5 ganados" justo en "cumplido".

## Video de producto 2, "Pasa el tiempo y sigo igual" (20 oct de 2026): `hf-tiempo.mjs`

Guion, mapa de golpes y fotos aprobadas en `anuncios/campana/rimu2/guion.md`. Una sola toma: cada escena sale de un objeto de la anterior (ENERO se vuelve el mes; los íconos se meten en el de Racha; el ícono llena la pantalla de ámbar y vuelve; el ícono se abre en el celular; el chulo salta y es un cuadrito; el chulo grande llena la pantalla y se encoge en el 1 de enero de Tu año).
1. Material de la app (con la muestra prendida, puerto 3003): `INICIO=360 node design/herramientas/grabar-anio-completo.cjs design/anuncios/campana/rimu2/anio 6` (Tu año de enero a diciembre: la muestra cree que es el 27 de diciembre; el 31 monta "dic" con "ene 2027") y `node design/herramientas/grabar-hoy-leer.cjs design/anuncios/campana/rimu2/hoy` (Hoy antes y después de marcar "Leer 10 páginas"). Los dos con `NODE_PATH` de un puppeteer-core.
2. `node design/herramientas/hf-tiempo.mjs` (`--solo-html` no rehace la voz, las fotos ni el video del año). Dentro de `campana/rimu2/hyperframes`: `check`, `snapshot --at …` y `render --low-memory-mode -w 1 -f 30 -o ../tiempo-vN-maestro.mp4` (25 s, unos 2 minutos).
3. Música: `BAJO=16 FASE=0.505 GOLPE=0.545455 COMPASES=30 EMPIEZA=5.956 SUBE=0.05 node design/herramientas/poner-musica.mjs …-maestro.mp4 design/anuncios/campana/guion5/musica/quick-cuts-groove.wav …-vN.mp4`.
4. Antes de entregar: `python design/herramientas/medir-video.py design/anuncios/referencias/oct19/rimu-ref1.mp4 …-vN.mp4`.
- El revisor de HyperFrames no lee `{ ...{} }`: las propiedades van sueltas (función `sinLlaves`). Nada se mueve con left/top/width/height: todo con x, y, scale o clipPath (el celular nace del ícono con un recorte que se abre).
