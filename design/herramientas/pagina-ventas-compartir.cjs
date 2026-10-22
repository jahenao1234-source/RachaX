// Imagen para cuando compartan el enlace de tengoracha.com/conoce (1200 x 630): la portada de la v3,
// con la racha ya llena. Necesita la página servida (por ejemplo la configuración "rachax", puerto 3002).
// Uso: NODE_PATH=<carpeta con puppeteer-core> node design/herramientas/pagina-ventas-compartir.cjs [puerto]
const puppeteer = require('puppeteer-core');
const PUERTO = process.argv[2] || '3002';
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage();
  // se dibuja a 1600 x 840 y se reduce a 1200 x 630, para que quepan el título y la racha
  await p.setViewport({ width: 1600, height: 840, deviceScaleFactor: 0.75 });
  await p.goto('http://localhost:' + PUERTO + '/conoce.html', { waitUntil: 'networkidle0' });
  await p.addStyleTag({ content: '.barra nav,.acciones,.compra-fija,main>section:not(.portada),footer{display:none!important}.barra{background:transparent!important;border:0!important;backdrop-filter:none!important}.portada{padding:40px 0 0!important;min-height:840px}body::after{opacity:.05}' });
  await new Promise((r) => setTimeout(r, 5500)); // que termine de llenarse la racha
  await p.screenshot({ path: 'C:/Users/jahen/RachaX/RachaX/public/ventas/compartir.jpg', type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 1600, height: 840 } });
  await b.close();
})();
