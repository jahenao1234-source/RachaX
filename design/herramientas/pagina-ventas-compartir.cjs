const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new'});
const p=await b.newPage();await p.setViewport({width:1200,height:630,deviceScaleFactor:1});
await p.goto('http://localhost:3003/conoce.html',{waitUntil:'networkidle2'});
await p.addStyleTag({content:'.barra nav,.acciones,.raya,.mira,.escena,main>section:not(.portada),footer{display:none!important}.portada{height:630px;padding-top:150px!important}.barra{background:transparent!important;backdrop-filter:none!important;position:absolute;width:100%}.portada{padding-top:110px}.js .aparece{opacity:1!important;transform:none!important}.t1{font-size:72px}'});
await new Promise(r=>setTimeout(r,1500));
await p.screenshot({path:'C:/Users/jahen/RachaX/RachaX/public/ventas/compartir.jpg',type:'jpeg',quality:85});await b.close();})();
