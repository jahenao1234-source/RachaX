// Web Push hecho con Web Crypto (sin librerías): cifrado aes128gcm (RFC 8291 y 8188) y firma VAPID (RFC 8292).
// Lo usa enviar-avisos. Se prueba con scratchpad/prueba-webpush.ts (cifra y descifra como lo haría el celular).

const enc = new TextEncoder();

export const b64u = {
  aTexto(b: Uint8Array): string {
    let s = '';
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  aBytes(t: string): Uint8Array {
    const s = atob(t.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(t.length / 4) * 4, '='));
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  },
};

const unir = (...p: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(p.reduce((n, x) => n + x.length, 0));
  let i = 0;
  for (const x of p) { out.set(x, i); i += x.length; }
  return out;
};

const hkdf = async (salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, bytes: number): Promise<Uint8Array> => {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, bytes * 8));
};

/** Cifra el mensaje para un celular (p256dh y auth son los de su suscripción). Devuelve el cuerpo del POST. */
export async function cifrar(mensaje: string, p256dh: string, auth: string): Promise<Uint8Array> {
  const delCelular = b64u.aBytes(p256dh); // 65 bytes
  const secreto = b64u.aBytes(auth);      // 16 bytes
  const par = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']) as CryptoKeyPair;
  const mio = new Uint8Array(await crypto.subtle.exportKey('raw', par.publicKey)); // 65 bytes
  const llaveCelular = await crypto.subtle.importKey('raw', delCelular, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const compartido = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: llaveCelular }, par.privateKey, 256));

  const ikm = await hkdf(secreto, compartido, unir(enc.encode('WebPush: info\0'), delCelular, mio), 32);
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(sal, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(sal, ikm, enc.encode('Content-Encoding: nonce\0'), 12);

  const llave = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const claro = unir(enc.encode(mensaje), new Uint8Array([2])); // 2 = último registro
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, llave, claro));

  const tamano = new Uint8Array([0, 0, 0x10, 0]); // 4096
  return unir(sal, tamano, new Uint8Array([mio.length]), mio, cifrado);
}

export interface Vapid { publica: string; privada: string; asunto: string }

/** Las claves VAPID vienen en base64url: la pública (65 bytes) y la privada (32 bytes). */
const llaveVapid = (v: Vapid): Promise<CryptoKey> => {
  const pub = b64u.aBytes(v.publica);
  if (pub.length !== 65 || pub[0] !== 4) throw new Error('VAPID_PUBLICA no tiene el formato esperado');
  return crypto.subtle.importKey('jwk', {
    kty: 'EC', crv: 'P-256', d: v.privada.trim(),
    x: b64u.aTexto(pub.slice(1, 33)), y: b64u.aTexto(pub.slice(33, 65)), ext: true,
  }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
};

/** El encabezado Authorization para ese servicio (Google, Apple, Mozilla…). Vale 12 horas. */
export async function autorizacion(endpoint: string, v: Vapid, ahoraSeg = Math.floor(Date.now() / 1000)): Promise<string> {
  const aud = new URL(endpoint).origin;
  const cab = b64u.aTexto(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cuerpo = b64u.aTexto(enc.encode(JSON.stringify({ aud, exp: ahoraSeg + 12 * 3600, sub: v.asunto })));
  const firma = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, await llaveVapid(v), enc.encode(`${cab}.${cuerpo}`)));
  return `vapid t=${cab}.${cuerpo}.${b64u.aTexto(firma)}, k=${v.publica.trim()}`;
}

export interface Celular { endpoint: string; p256dh: string; auth: string }
export interface Opciones { ttl: number; urgente?: boolean; tema?: string }

/** Manda un aviso a un celular. Devuelve el código de respuesta (201 = bien; 404 o 410 = ese celular ya no existe). */
export async function enviar(c: Celular, mensaje: string, v: Vapid, o: Opciones): Promise<number> {
  const cabeceras: Record<string, string> = {
    'Authorization': await autorizacion(c.endpoint, v),
    'Content-Encoding': 'aes128gcm',
    'Content-Type': 'application/octet-stream',
    'TTL': String(o.ttl),
    'Urgency': o.urgente ? 'high' : 'normal',
  };
  if (o.tema) cabeceras['Topic'] = o.tema.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
  const r = await fetch(c.endpoint, { method: 'POST', headers: cabeceras, body: await cifrar(mensaje, c.p256dh, c.auth) });
  try { await r.body?.cancel(); } catch { /* nada */ }
  return r.status;
}
