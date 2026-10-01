// Racha · genera las dos claves de los avisos (VAPID). Se corre UNA sola vez:
//   node scripts/claves-avisos.mjs
// Deja las dos claves en un archivo en tu Escritorio. La PRIVADA es secreta: no la pegues en ningún chat.
// Si ya existe el archivo, no lo cambia (cambiar las claves apaga los avisos de todos los celulares).
import fs from 'fs';
import os from 'os';
import path from 'path';

const archivo = path.join(os.homedir(), 'Desktop', 'racha-claves-avisos.txt');
if (fs.existsSync(archivo)) {
  console.log('Ya existe ' + archivo + '. No lo cambié. Usa las claves que están ahí.');
  process.exit(0);
}
const par = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const publica = Buffer.from(await crypto.subtle.exportKey('raw', par.publicKey)).toString('base64url');
const privada = (await crypto.subtle.exportKey('jwk', par.privateKey)).d;

fs.writeFileSync(archivo, [
  'Racha · claves de los avisos. Guarda este archivo en Bitwarden y después bórralo del Escritorio.',
  '',
  'PÚBLICA (se puede ver). Va en 3 lugares:',
  '  - Supabase > Edge Functions > Secrets:  VAPID_PUBLICA',
  '  - Vercel > Settings > Environment Variables:  VITE_VAPID_PUBLICA',
  '  - el archivo .env.local del proyecto:  VITE_VAPID_PUBLICA=...',
  publica,
  '',
  'PRIVADA (SECRETA). Va en 1 solo lugar:',
  '  - Supabase > Edge Functions > Secrets:  VAPID_PRIVADA',
  privada,
  '',
].join('\r\n'));
console.log('Listo. Las claves quedaron en: ' + archivo);
console.log('La clave PÚBLICA es: ' + publica);
console.log('La PRIVADA no se muestra aquí: ábrela en ese archivo.');
