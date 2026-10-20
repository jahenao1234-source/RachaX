// Higgsfield desde la terminal: precio antes de generar, imágenes y fotos que se mueven.
// La clave se lee de .env.local (HIGGSFIELD_API_KEY, con la forma idDeLaClave:secreto); este programa nunca la muestra.
// Se guarda con: powershell -NoProfile -ExecutionPolicy Bypass -File design/herramientas/poner-clave.ps1 HIGGSFIELD_API_KEY
// Uso:
//   node design/herramientas/higgsfield.mjs precio <modelo> '<json con los datos>'     (no gasta: pregunta cuánto costaría)
//   node design/herramientas/higgsfield.mjs imagen "<texto en inglés>" <salida.png>     (Soul; con FORMATO=9:16 y RESOLUCION=1080p)
//   node design/herramientas/higgsfield.mjs mover <foto local> "<texto en inglés>" <salida.mp4>
//     (foto que se mueve; con MODELO=kling|hailuo, SEGUNDOS=5|10 y NEGATIVO="<lo que no debe salir>")
//   node design/herramientas/higgsfield.mjs anuncios <pedido.json> <salida.png>        (Ads Studio: un resumen del producto + hasta 10 fotos
//     de referencia → de 1 a 8 anuncios en imagen; el .json lleva prompt, niche, language, target_audience, aspect_ratio,
//     batch_size e "imagenes" con rutas locales; si salen varias quedan como salida-1.png, salida-2.png…)
//   node design/herramientas/higgsfield.mjs ideogram "<texto en inglés>" <salida.png>   (Ideogram 4.0: escribe bien las letras
//     dentro de la imagen; FORMATO=4:5 por defecto, VELOCIDAD=TURBO|DEFAULT|QUALITY; no dice el precio antes de generar)
//   node design/herramientas/higgsfield.mjs estado <request_id> [salida]               (para recoger una que se quedó a medias)
// Antes de generar, el programa dice el precio; con SOLO_PRECIO=1 se queda ahí.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const m = fs.readFileSync(path.join(RAIZ, '.env.local'), 'utf8').match(/^HIGGSFIELD_API_KEY=(.+)$/m);
if (!m) { console.log('FALLA: no encontré HIGGSFIELD_API_KEY en .env.local'); process.exit(1); }
const cab = { Authorization: 'Key ' + m[1].trim().replace(/^["']|["']$/g, ''), 'Content-Type': 'application/json' };
const API = 'https://api.higgsfield.ai';
const MODELOS = {
  soul: '/higgsfield-ai/soul/standard',
  kling: '/kling-video/v2.5-turbo/pro/image-to-video',
  hailuo: '/minimax/hailuo-2.3/standard/image-to-video',
  ads: '/higgsfield/ads-studio/v1.0',
};
const TIPOS = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.wav': 'audio/wav', '.mp4': 'video/mp4' };

// Con internet inestable reintenta hasta 5 veces; la Idempotency-Key evita que un reintento cree (y cobre) un pedido repetido.
async function intentar(hacer) {
  for (let n = 1; ; n++) {
    try { return await hacer(); } catch (e) {
      if (n >= 5 || !/fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT|EAI_AGAIN/.test(String(e.message) + String(e.cause?.code))) throw e;
      console.log(`  sin conexión (${e.cause?.code || e.message}); reintento ${n} de 4…`);
      await new Promise((h) => setTimeout(h, 3000 * n));
    }
  }
}
async function pedir(ruta, cuerpo, metodo = 'POST') {
  const llave = metodo === 'POST' ? { 'Idempotency-Key': crypto.randomUUID() } : {};
  const r = await intentar(() => fetch(ruta.startsWith('http') ? ruta : API + ruta, { method: metodo, headers: { ...cab, ...llave }, body: cuerpo ? JSON.stringify(cuerpo) : undefined }));
  const texto = await r.text();
  if (!r.ok) throw new Error(`Higgsfield respondió ${r.status}: ${texto.slice(0, 500)}`);
  return texto ? JSON.parse(texto) : {};
}
const ruta = (modelo) => MODELOS[modelo] || modelo;
async function precio(modelo, datos) {
  const j = await pedir('/estimate' + ruta(modelo), datos);
  console.log(`Precio de ${modelo}: ${j.usd ?? "?"} dólares (${j.credits ?? "?"} créditos)`);
  if (j.usd == null) console.log("  respuesta:", JSON.stringify(j).slice(0, 400));
  return j;
}
async function subir(archivo) {
  const tipo = TIPOS[path.extname(archivo).toLowerCase()];
  if (!tipo) throw new Error('No sé subir ese tipo de archivo: ' + archivo);
  const j = await pedir('/files/generate-upload-url', { content_type: tipo });
  console.log('Subiendo', path.basename(archivo));
  const r = await intentar(() => fetch(j.upload_url, { method: 'PUT', headers: j.upload_headers || { 'Content-Type': tipo }, body: fs.readFileSync(archivo) }));
  if (!r.ok) throw new Error(`La subida falló (${r.status}): ${(await r.text()).slice(0, 300)}`);
  return j.public_url;
}
async function esperar(pedido, salida) {
  console.log('Pedido:', pedido.request_id);
  const url = pedido.status_url || `${API}/requests/${pedido.request_id}/status`;
  const inicio = Date.now();
  for (let espera = 3000; ; espera = Math.min(espera * 1.4, 15000)) {
    await new Promise((h) => setTimeout(h, espera));
    const j = await pedir(url, null, 'GET');
    process.stdout.write(`  ${Math.round((Date.now() - inicio) / 1000)} s: ${j.status}\n`);
    if (j.status === 'completed') {
      const gasto = Object.fromEntries(Object.entries(j).filter(([k]) => /cost|credit|usd|price|bill/i.test(k)));
      console.log('Gasto informado:', Object.keys(gasto).length ? JSON.stringify(gasto) : '(la respuesta no trae el costo)');
      const enlaces = j.video?.url ? [j.video.url] : j.images?.length ? j.images.map((i) => i.url) : j.audio?.url ? [j.audio.url] : [];
      if (!enlaces.length) { console.log(JSON.stringify(j).slice(0, 800)); throw new Error('Terminó pero no vino el archivo.'); }
      if (j.errors?.length) console.log('Algunos no salieron:', JSON.stringify(j.errors).slice(0, 500));
      fs.mkdirSync(path.dirname(path.resolve(salida)), { recursive: true });
      for (const [i, enlace] of enlaces.entries()) {
        const b = Buffer.from(await (await intentar(() => fetch(enlace))).arrayBuffer());
        const ext = path.extname(salida) || path.extname(new URL(enlace).pathname) || '.png';
        const nombre = enlaces.length > 1 ? salida.replace(/(\.[^.\\/]+)?$/, `-${i + 1}${ext}`) : salida;
        fs.writeFileSync(nombre, b);
        console.log(`Listo: ${nombre} (${(b.length / 1048576).toFixed(1)} MB)`);
      }
      return;
    }
    if (['failed', 'nsfw', 'canceled'].includes(j.status)) throw new Error(`Quedó en "${j.status}" (no se cobra): ${JSON.stringify(j.error || '')}`);
  }
}
async function generar(modelo, datos, salida) {
  await precio(modelo, datos);
  if (process.env.SOLO_PRECIO) return;
  await esperar(await pedir(ruta(modelo), datos), salida);
}

const [orden, ...a] = process.argv.slice(2);
try {
  if (orden === 'precio') {
    await precio(a[0], JSON.parse(a[1] || '{}'));
  } else if (orden === 'imagen') {
    await generar('soul', { prompt: a[0], aspect_ratio: process.env.FORMATO || '9:16', resolution: process.env.RESOLUCION || '1080p', num_images: 1 }, a[1]);
  } else if (orden === 'mover') {
    const modelo = process.env.MODELO || 'kling';
    const datos = { prompt: a[1], duration: Number(process.env.SEGUNDOS || (modelo === 'hailuo' ? 6 : 5)) };
    if (modelo === 'kling' && process.env.NEGATIVO) datos.negative_prompt = process.env.NEGATIVO;
    if (process.env.SOLO_PRECIO) { await precio(modelo, { ...datos, image_url: 'https://example.com/foto.jpg' }); }
    else { datos.image_url = await subir(a[0]); await generar(modelo, datos, a[2]); }
  } else if (orden === 'anuncios') {
    // a[0] = archivo .json con prompt, niche, language, target_audience, aspect_ratio, batch_size e imagenes (rutas locales)
    const pedido = JSON.parse(fs.readFileSync(a[0], 'utf8'));
    const { imagenes = [], ...datos } = pedido;
    if (process.env.SOLO_PRECIO) { await precio(MODELOS.ads, { ...datos, image_urls: imagenes.map(() => 'https://example.com/foto.jpg') }); }
    else {
      datos.image_urls = [];
      for (const f of imagenes) datos.image_urls.push(await subir(path.resolve(path.dirname(a[0]), f)));
      await generar('ads', datos, a[1]);
    }
  } else if (orden === 'ideogram') {
    const datos = { prompt: a[0], aspect_ratio: process.env.FORMATO || '4:5', rendering_speed: process.env.VELOCIDAD || 'DEFAULT' };
    await esperar(await pedir('/ideogram/v4.0', datos), a[1]);
  } else if (orden === 'estado') {
    await esperar({ request_id: a[0] }, a[1] || `higgsfield-${a[0]}`);
  } else {
    console.log('Órdenes: precio, imagen, mover, estado (ver el comienzo de este archivo).');
  }
} catch (e) {
  console.log('FALLA:', e.message);
  process.exit(1);
}
