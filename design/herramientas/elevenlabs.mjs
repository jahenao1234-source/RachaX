// ElevenLabs desde la terminal: ver voces, texto a voz, cambiar la voz de un audio y efectos de sonido.
// La clave se lee de .env.local (ELEVENLABS_API_KEY); este programa nunca la muestra.
// Uso:
//   node design/herramientas/elevenlabs.mjs voces [texto que debe contener]
//   node design/herramientas/elevenlabs.mjs decir <idVoz> "<texto>" <salida.mp3>
//     (con MODELO=eleven_v3 cambia el modelo; con AJUSTES='{"stability":0.3,"style":0.45,"speed":1.1}' cambia cómo lo dice)
//   node design/herramientas/elevenlabs.mjs cambiar <idVoz> <audio de entrada> <salida.mp3>
//   node design/herramientas/elevenlabs.mjs efecto "<descripción en inglés>" <segundos> <salida.mp3>
//     (con INFLUENCIA=0.6 el efecto se pega más a la descripción; va de 0 a 1 y por defecto es 0.3)
//   node design/herramientas/elevenlabs.mjs saldo      (créditos gastados y disponibles; la clave necesita el permiso de usuario)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const m = fs.readFileSync(path.join(RAIZ, '.env.local'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m);
if (!m) { console.log('FALLA: no encontré ELEVENLABS_API_KEY en .env.local'); process.exit(1); }
const cab = { 'xi-api-key': m[1].trim().replace(/^["']|["']$/g, '') };
const API = 'https://api.elevenlabs.io';

async function pedir(ruta, opciones = {}, binario = false) {
  const r = await fetch(API + ruta, { ...opciones, headers: { ...cab, ...(opciones.headers || {}) } });
  if (!r.ok) throw new Error(`ElevenLabs respondió ${r.status}: ${(await r.text()).slice(0, 400)}`);
  return binario ? Buffer.from(await r.arrayBuffer()) : r.json();
}

const [orden, ...a] = process.argv.slice(2);
try {
  if (orden === 'voces') {
    const j = await pedir('/v2/voices?page_size=100');
    const filtro = (a[0] || '').toLowerCase();
    const filas = (j.voices || []).map((v) => {
      const l = v.labels || {};
      return `${v.voice_id} | ${v.name} | ${[l.gender, l.age, l.accent, l.language, l.descriptive, l.use_case].filter(Boolean).join(', ')} | ${v.category || ''}`;
    }).filter((f) => f.toLowerCase().includes(filtro));
    console.log(`${filas.length} voces${j.has_more ? ' (hay más)' : ''}`);
    console.log(filas.join('\n'));
  } else if (orden === 'decir') {
    const [voz, texto, salida] = a;
    const audio = await pedir(`/v1/text-to-speech/${voz}?output_format=mp3_44100_128`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: texto, model_id: process.env.MODELO || 'eleven_multilingual_v2', ...(process.env.AJUSTES ? { voice_settings: JSON.parse(process.env.AJUSTES) } : {}) }) }, true);
    fs.writeFileSync(salida, audio); console.log('guardado', salida, audio.length, 'bytes');
  } else if (orden === 'cambiar') {
    const [voz, entrada, salida] = a;
    const f = new FormData();
    f.append('audio', new Blob([fs.readFileSync(entrada)]), path.basename(entrada));
    f.append('model_id', process.env.MODELO || 'eleven_multilingual_sts_v2');
    const audio = await pedir(`/v1/speech-to-speech/${voz}?output_format=mp3_44100_128`, { method: 'POST', body: f }, true);
    fs.writeFileSync(salida, audio); console.log('guardado', salida, audio.length, 'bytes');
  } else if (orden === 'efecto') {
    const [texto, seg, salida] = a;
    const audio = await pedir('/v1/sound-generation?output_format=mp3_44100_128', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: texto, duration_seconds: +seg || undefined, ...(process.env.INFLUENCIA ? { prompt_influence: +process.env.INFLUENCIA } : {}) }) }, true);
    fs.writeFileSync(salida, audio); console.log('guardado', salida, audio.length, 'bytes');
  } else if (orden === 'saldo') {
    const j = await pedir('/v1/user/subscription');
    console.log(`plan ${j.tier}: gastados ${j.character_count} de ${j.character_limit} créditos (quedan ${j.character_limit - j.character_count})`);
  } else console.log('Órdenes: voces | decir | cambiar | efecto | saldo');
} catch (e) {
  console.log('FALLA:', e.message, e.cause ? '(' + (e.cause.code || e.cause.message) + ')' : '');
}
