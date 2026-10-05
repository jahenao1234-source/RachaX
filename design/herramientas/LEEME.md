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
