// Racha · enviar-avisos (FUENTE). No se pega en Supabase: se pega index.ts, que sale de aquí con
//   node supabase/functions/enviar-avisos/armar.mjs
// La llama el reloj de la base de datos (schema-7-avisos.sql) solo cuando hay algo que mandar.
// 1) Comprueba que quien llama es el reloj (encabezado x-avisos-cron).
// 2) Aparta lo que toca (avisos_reclamar): cada aviso sale una sola vez.
// 3) Para los de hábitos, mira la copia de la Racha y arma el texto (src/utils/avisosUtils.ts). Si no falta nada, no manda.
// 4) Lo envía cifrado a cada celular de la persona y borra los celulares que ya no existen.
//
// Secretos (Supabase › Edge Functions › Secrets):
//   VAPID_PUBLICA   la clave pública (la misma de VITE_VAPID_PUBLICA en la app)
//   VAPID_PRIVADA   la clave privada. Nunca va en la app ni en el chat.
//   VAPID_ASUNTO    mailto:hola@tengoracha.com
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los pone Supabase solo (si no, crea el secreto SUPABASE_SECRET_KEY).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { avisoDeHabitos, sanearConfig, HoraAviso } from '../../../src/utils/avisosUtils';
import { Celular, enviar, Vapid } from './webpush';

declare const Deno: { env: { get(k: string): string | undefined }; serve(f: (r: Request) => Promise<Response> | Response): void };

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

interface Fila {
  user_id: string; tipo: string; clave: string;
  titulo: string | null; cuerpo: string | null; destino: string | null;
  hoy: string; ultima_vez: string | null; config: unknown; datos: any; celulares: Celular[];
}

const DE_HORA = ['manana', 'tarde', 'noche', 'minima'];
// Cuánto espera el servicio si el celular está apagado (segundos)
const TTL: Record<string, number> = { compromiso: 1800, pomodoro: 300, descanso: 300, prueba: 600 };

Deno.serve(async (req) => {
  if (req.method !== 'POST') return responder({ error: 'metodo' }, 405);
  const url = Deno.env.get('SUPABASE_URL') || '';
  const llave = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || '';
  const vapid: Vapid = {
    publica: (Deno.env.get('VAPID_PUBLICA') || '').trim(),
    privada: (Deno.env.get('VAPID_PRIVADA') || '').trim(),
    asunto: (Deno.env.get('VAPID_ASUNTO') || 'mailto:hola@tengoracha.com').trim(),
  };
  if (!url || !llave || !vapid.publica || !vapid.privada) return responder({ error: 'faltan_secretos' }, 500);

  const db = createClient(url, llave, { auth: { persistSession: false } });
  const clave = req.headers.get('x-avisos-cron') || '';
  const { data: esReloj } = await db.rpc('avisos_verificar_cron', { p: clave });
  if (esReloj !== true) return responder({ error: 'no_autorizado' }, 401);

  const { data, error } = await db.rpc('avisos_reclamar');
  if (error) return responder({ error: 'reclamar', detalle: error.message }, 500);
  const filas = (data || []) as Fila[];

  let enviados = 0, sinNada = 0;
  const muertos: string[] = [];
  const tareas: Promise<void>[] = [];

  for (const f of filas) {
    let titulo = f.titulo, cuerpo = f.cuerpo, destino = f.destino || 'hoy', tipo = f.tipo;
    if (DE_HORA.includes(f.tipo)) {
      const d = f.datos || {};
      const a = avisoDeHabitos(f.tipo as HoraAviso, {
        habitos: Array.isArray(d.habitos) ? d.habitos : [],
        registros: Array.isArray(d.registros) ? d.registros : [],
        config: sanearConfig(f.config),
        hoy: f.hoy,
        ultimaVez: f.ultima_vez || f.hoy,
      });
      if (!a) { sinNada++; continue; }
      titulo = a.titulo; cuerpo = a.cuerpo; destino = a.destino; tipo = a.tipo;
    }
    if (!titulo || !cuerpo) { sinNada++; continue; }
    // "etiqueta": un aviso nuevo del mismo grupo reemplaza al anterior en el celular
    const etiqueta = DE_HORA.includes(f.tipo) || tipo.startsWith('regreso') ? 'habitos' : (tipo === 'compromiso' ? `compromiso-${f.clave}` : tipo);
    const mensaje = JSON.stringify({ titulo, cuerpo, destino, etiqueta });
    const opciones = { ttl: TTL[tipo] ?? 3600, urgente: tipo === 'pomodoro' || tipo === 'descanso' || tipo === 'compromiso' || tipo === 'prueba', tema: etiqueta };
    for (const c of (Array.isArray(f.celulares) ? f.celulares : [])) {
      tareas.push((async () => {
        try {
          const codigo = await enviar(c, mensaje, vapid, opciones);
          if (codigo === 404 || codigo === 410) muertos.push(c.endpoint);
          else if (codigo >= 200 && codigo < 300) enviados++;
          else console.log('aviso no entregado', codigo, new URL(c.endpoint).host);
        } catch (e) {
          console.log('error al enviar', String(e).slice(0, 120));
        }
      })());
    }
  }
  await Promise.all(tareas);
  if (muertos.length) await db.rpc('avisos_borrar_celulares', { p_endpoints: muertos });
  return responder({ ok: true, apartados: filas.length, enviados, sin_nada: sinNada, celulares_borrados: muertos.length });
});
