// Pasa a texto la voz de un video con AssemblyAI y guarda el momento exacto de cada palabra.
// Sirve para cuadrar los subtítulos de los anuncios.
// La clave se lee de .env.local (ASSEMBLYAI_API_KEY); este programa nunca la muestra.
// Uso: node design/herramientas/transcribir-assembly.mjs <video1> [video2 ...]
// Deja al lado de cada video un archivo <nombre>.palabras.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const env = fs.readFileSync(path.join(RAIZ, '.env.local'), 'utf8');
const m = env.match(/^ASSEMBLYAI_API_KEY=(.+)$/m);
if (!m) { console.log('FALLA: no encontré ASSEMBLYAI_API_KEY en .env.local'); process.exit(1); }
const CLAVE = m[1].trim().replace(/^["']|["']$/g, '');
const API = 'https://api.assemblyai.com/v2';
const cab = { authorization: CLAVE };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(url, opciones) {
  const r = await fetch(url, opciones);
  const texto = await r.text();
  if (!r.ok) throw new Error(`AssemblyAI respondió ${r.status}: ${texto.slice(0, 300)}`);
  return JSON.parse(texto);
}

async function transcribir(archivo) {
  const datos = fs.readFileSync(archivo);
  const subida = await pedir(`${API}/upload`, { method: 'POST', headers: { ...cab, 'content-type': 'application/octet-stream' }, body: datos });
  const trabajo = await pedir(`${API}/transcript`, {
    method: 'POST', headers: { ...cab, 'content-type': 'application/json' },
    // Por defecto español. Para un video en otro idioma: IDIOMA=en (o IDIOMA=auto para que lo detecte)
    body: JSON.stringify({ audio_url: subida.upload_url, ...(process.env.IDIOMA === 'auto' ? { language_detection: true } : { language_code: process.env.IDIOMA || 'es' }) }),
  });
  for (let i = 0; i < 120; i++) {
    const t = await pedir(`${API}/transcript/${trabajo.id}`, { headers: cab });
    if (t.status === 'completed') return t;
    if (t.status === 'error') throw new Error('La transcripción falló: ' + t.error);
    await esperar(2000);
  }
  throw new Error('Se demoró demasiado');
}

for (const archivo of process.argv.slice(2)) {
  try {
    const t = await transcribir(archivo);
    const palabras = (t.words || []).map((w) => ({ t: w.text, i: +(w.start / 1000).toFixed(2), f: +(w.end / 1000).toFixed(2), c: +(w.confidence ?? 0).toFixed(2) }));
    const salida = archivo.replace(/\.[^.]+$/, '') + '.palabras.json';
    fs.writeFileSync(salida, JSON.stringify({ id: t.id, texto: t.text, duracion: t.audio_duration, palabras }, null, 1), 'utf8');
    console.log(`\n== ${path.basename(archivo)} (${t.audio_duration} s)`);
    console.log(t.text);
    console.log(palabras.map((p) => `${p.i} ${p.t}`).join(' | '));
  } catch (e) {
    console.log(`\nFALLA en ${path.basename(archivo)}: ${e.message}${e.cause ? ' (' + (e.cause.code || e.cause.message) + ')' : ''}`);
  }
}
