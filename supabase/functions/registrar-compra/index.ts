// Racha · registrar-compra
// La llama ManyChat cuando un cliente de WhatsApp manda su comprobante y su correo.
// 1) Guarda la foto del comprobante en la carpeta privada "comprobantes".
// 2) Le pide a Gemini que la lea (valor, fecha, referencia, destinatario, quién pagó).
// 3) Anota el correo como comprador activo con estado "por_verificar" (o "revisar" si algo no cuadra).
// El dueño confirma o bloquea después, desde el panel de pagos.
//
// Secretos (Supabase > Edge Functions > Secrets):
//   RACHA_WEBHOOK_SECRET  clave larga inventada; ManyChat la manda en el encabezado x-racha-secret
//   GEMINI_API_KEY        clave de Google AI Studio (opcional: sin ella, todo queda "revisar")
//   PRECIO                precio en pesos (por defecto 37900)
//   DESTINATARIO          parte del nombre del dueño como sale en los comprobantes, p. ej. "JOHNATAN" (opcional)
//   GEMINI_MODEL          modelo de Gemini (por defecto gemini-2.5-flash)
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los pone Supabase solo (si no, crea el secreto SUPABASE_SECRET_KEY).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { encodeBase64 } from 'jsr:@std/encoding/base64';

const PRECIO = parseInt(Deno.env.get('PRECIO') || '37900');
const DESTINATARIO = (Deno.env.get('DESTINATARIO') || '').trim().toUpperCase();
const MODELO = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

const esCorreo = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);

// Fecha de hoy y de ayer en Colombia (UTC-5), como YYYY-MM-DD
const diasValidos = () => {
  const ahora = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const hoy = ahora.toISOString().slice(0, 10);
  const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return [hoy, ayer];
};

type Lectura = {
  es_comprobante: boolean;
  valor: number | null;
  fecha: string | null;          // YYYY-MM-DD
  hora: string | null;           // HH:MM
  referencia: string | null;
  destinatario: string | null;
  pagador: string | null;
  banco: string | null;
};

const leerComprobante = async (base64: string, mime: string): Promise<Lectura | null> => {
  const clave = Deno.env.get('GEMINI_API_KEY');
  if (!clave) return null;
  const instruccion = `Esta imagen debería ser un comprobante de una transferencia en Colombia (Nequi, Bre-B, Bancolombia, Daviplata u otro banco).
Devuelve SOLO un JSON con estas claves:
- es_comprobante: true si de verdad es un comprobante de pago exitoso, false si no.
- valor: el valor transferido en pesos, como número entero sin puntos (ej. 37900), o null.
- fecha: la fecha de la transferencia en formato YYYY-MM-DD, o null.
- hora: la hora en formato HH:MM de 24 horas, o null.
- referencia: el número de referencia, aprobación o comprobante, o null.
- destinatario: el nombre de quien RECIBE el dinero, tal como aparece, o null.
- pagador: el nombre de quien ENVÍA el dinero, solo si aparece escrito, o null.
- banco: la app o banco del comprobante, o null.
No inventes datos: si algo no se ve, pon null.`;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
      body: JSON.stringify({
        contents: [{ parts: [{ inline_data: { mime_type: mime, data: base64 } }, { text: instruccion }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const texto = j?.candidates?.[0]?.content?.parts?.[0]?.text;
    return texto ? (JSON.parse(texto) as Lectura) : null;
  } catch {
    return null;
  }
};

// Qué no cuadra del comprobante (vacío = todo bien)
const revisarLectura = (l: Lectura | null): string[] => {
  if (!l) return ['No se pudo leer el comprobante'];
  const fallas: string[] = [];
  if (!l.es_comprobante) fallas.push('No parece un comprobante de pago');
  if (l.valor !== PRECIO) fallas.push(`El valor es ${l.valor ?? 'desconocido'}, no ${PRECIO}`);
  if (!l.fecha || !diasValidos().includes(l.fecha)) fallas.push(`La fecha es ${l.fecha ?? 'desconocida'}, no de hoy ni de ayer`);
  if (DESTINATARIO && !(l.destinatario || '').toUpperCase().includes(DESTINATARIO)) fallas.push(`El destinatario es ${l.destinatario ?? 'desconocido'}`);
  return fallas;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return responder({ ok: false, error: 'metodo' }, 405);
  const secreto = Deno.env.get('RACHA_WEBHOOK_SECRET');
  if (!secreto || req.headers.get('x-racha-secret') !== secreto) return responder({ ok: false, error: 'no_autorizado' }, 401);

  let d: Record<string, unknown>;
  try { d = await req.json(); } catch { return responder({ ok: false, error: 'json' }, 400); }

  const correo = String(d.correo || '').trim().toLowerCase();
  if (!esCorreo(correo)) return responder({ ok: false, error: 'correo_invalido' });

  // La llave de servicio (salta las reglas; solo vive aquí, nunca en la app). Supabase la pone sola.
  const llave = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY');
  if (!llave) return responder({ ok: false, error: 'falta_llave_de_servicio' }, 500);
  const supa = createClient(Deno.env.get('SUPABASE_URL')!, llave);

  // Paso aparte: ManyChat solo manda el nombre de quien pagó (cuando el comprobante no lo traía)
  if (d.accion === 'nombre') {
    const nombre = String(d.nombre_pagador || '').trim().slice(0, 120);
    await supa.from('compradores').update({ nombre_pagador: nombre, actualizado_en: new Date().toISOString() }).eq('email', correo);
    return responder({ ok: true });
  }

  const { data: previo } = await supa.from('compradores').select('activo, estado_pago').eq('email', correo).maybeSingle();
  if (previo?.activo && previo.estado_pago === 'verificado') {
    return responder({ ok: true, estado: 'ya_comprador', necesita_nombre: false });
  }

  // 1) La foto del comprobante
  let ruta: string | null = null;
  let lectura: Lectura | null = null;
  const url = String(d.comprobante_url || '');
  if (url.startsWith('https://')) {
    try {
      const img = await fetch(url);
      if (img.ok) {
        const mime = (img.headers.get('content-type') || 'image/jpeg').split(';')[0];
        const bytes = new Uint8Array(await img.arrayBuffer());
        if (bytes.length < 8_000_000) {
          const ext = mime.includes('png') ? 'png' : mime.includes('pdf') ? 'pdf' : 'jpg';
          ruta = `${diasValidos()[0]}/${correo.replace(/[^a-z0-9]/g, '_')}-${Date.now()}.${ext}`;
          await supa.storage.from('comprobantes').upload(ruta, bytes, { contentType: mime });
          // 2) Que la IA lo lea
          lectura = await leerComprobante(encodeBase64(bytes), mime);
        }
      }
    } catch { /* se revisa a mano */ }
  }

  // 3) Anotarlo como comprador: entra de una; el dueño confirma o bloquea después
  const fallas = revisarLectura(lectura);
  const pagador = String(d.nombre_pagador || lectura?.pagador || '').trim() || null;
  const fechaPago = lectura?.fecha ? `${lectura.fecha}T${lectura.hora || '00:00'}:00-05:00` : null;
  const fila = {
    email: correo,
    activo: previo?.estado_pago === 'bloqueado' ? false : true,
    estado_pago: previo?.estado_pago === 'bloqueado' ? 'bloqueado' : (fallas.length ? 'revisar' : 'por_verificar'),
    origen: 'whatsapp',
    telefono: String(d.telefono || '').slice(0, 30) || null,
    nombre_pagador: pagador,
    valor: lectura?.valor ?? null,
    referencia: lectura?.referencia ?? null,
    fecha_pago: fechaPago,
    comprobante_path: ruta,
    lectura_ia: lectura,
    notas: fallas.length ? fallas.join(' · ') : null,
    actualizado_en: new Date().toISOString(),
  };
  const { error } = await supa.from('compradores').upsert(fila, { onConflict: 'email' });
  if (error) return responder({ ok: false, error: 'guardar' }, 500);

  return responder({
    ok: true,
    estado: fila.estado_pago,
    necesita_nombre: !pagador,
    bloqueado: fila.estado_pago === 'bloqueado',
  });
});
