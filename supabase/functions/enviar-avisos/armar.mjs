// Arma index.ts (el archivo que se pega en Supabase › Edge Functions › enviar-avisos) a partir de fuente.ts,
// webpush.ts y src/utils/avisosUtils.ts. Correr desde la raíz del proyecto:
//   node supabase/functions/enviar-avisos/armar.mjs
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const salida = path.join(aqui, 'index.ts');
await build({
  entryPoints: [path.join(aqui, 'fuente.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'neutral',
  external: ['npm:*', 'jsr:*'],
  charset: 'utf8',
  outfile: salida,
  logLevel: 'warning',
});
const cuerpo = fs.readFileSync(salida, 'utf8');
fs.writeFileSync(salida, `// Racha · enviar-avisos\n// ARCHIVO GENERADO: no lo edites a mano. Sale de fuente.ts con "node supabase/functions/enviar-avisos/armar.mjs".\n// Este es el que se pega en Supabase › Edge Functions › enviar-avisos (con "Verify JWT" apagado).\n// @ts-nocheck\n${cuerpo}`);
console.log('index.ts listo:', Math.round(fs.statSync(salida).size / 1024), 'KB');
