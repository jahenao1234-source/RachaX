// Busca voces en la biblioteca pública de ElevenLabs (las que todavía no están en la cuenta) y las lista con su enlace para oírlas.
// Oír la muestra desde el enlace no gasta créditos. La clave se lee de .env.local; este programa nunca la muestra.
// Uso: node design/herramientas/voces-biblioteca.mjs [acento] [genero] [cuántas]
//   acento: colombian (por defecto), mexican, latin american, peninsular...   genero: female, male o todos
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const m = fs.readFileSync(path.join(RAIZ, '.env.local'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m);
if (!m) { console.log('FALLA: no encontré ELEVENLABS_API_KEY en .env.local'); process.exit(1); }
const cab = { 'xi-api-key': m[1].trim().replace(/^["']|["']$/g, '') };
const [acento = 'colombian', genero = 'todos', cuantas = '40'] = process.argv.slice(2);

const q = new URLSearchParams({ language: 'es', page_size: '100', sort: 'usage_character_count_1y' });
if (acento !== 'todos') q.set('accent', acento);
if (genero !== 'todos') q.set('gender', genero);
let j;
for (let i = 0; i < 6 && !j; i++) {
  try { const r = await fetch('https://api.elevenlabs.io/v1/shared-voices?' + q, { headers: cab }); if (!r.ok) throw new Error(`${r.status}: ${(await r.text()).slice(0, 300)}`); j = await r.json(); }
  catch (e) { if (i === 5) { console.log('FALLA:', e.message); process.exit(1); } await new Promise((s) => setTimeout(s, 1500)); }
}
const filas = (j.voices || []).slice(0, Number(cuantas));
console.log(`${filas.length} voces (${acento}, ${genero})`);
for (const v of filas) {
  console.log([v.voice_id, v.public_owner_id, v.name, [v.gender, v.age, v.accent, v.descriptive, v.use_case].filter(Boolean).join(', '), `usada ${Math.round((v.usage_character_count_1y || 0) / 1e6)} M`, v.category, v.preview_url].join(' | '));
  if (v.description) console.log('    ' + v.description.replace(/\s+/g, ' ').slice(0, 160));
}
