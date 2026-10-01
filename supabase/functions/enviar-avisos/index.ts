// Racha · enviar-avisos
// ARCHIVO GENERADO: no lo edites a mano. Sale de fuente.ts con "node supabase/functions/enviar-avisos/armar.mjs".
// Este es el que se pega en Supabase › Edge Functions › enviar-avisos (con "Verify JWT" apagado).
// @ts-nocheck
// supabase/functions/enviar-avisos/fuente.ts
import { createClient } from "npm:@supabase/supabase-js@2";

// src/utils/habitUtils.ts
function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function formatDateToString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function isHabitScheduledForDate(habito, dateStr) {
  if (habito.creadoEn) {
    const createdStr = formatDateToString(new Date(habito.creadoEn));
    if (dateStr < createdStr) return false;
  }
  if (habito.frecuencia === "semanal") {
    return false;
  }
  const date = parseDateString(dateStr);
  const dayOfWeek = date.getDay();
  if (habito.frecuencia === "diario") {
    return true;
  }
  if (habito.frecuencia === "entreSemana") {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (habito.frecuencia === "personalizado") {
    if (!habito.diasPersonalizados || habito.diasPersonalizados.length === 0) {
      return true;
    }
    return habito.diasPersonalizados.includes(dayOfWeek);
  }
  return true;
}
function isHabitCompletedOnDate(habitoId, dateStr, registros) {
  const reg = registros.find((r) => r.habitoId === habitoId && r.fecha === dateStr);
  return !!reg && reg.completado;
}
function getSemanaDates(dateStr) {
  const date = parseDateString(dateStr);
  const day = date.getDay();
  const offsetToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - offsetToMonday);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(formatDateToString(d));
  }
  return week;
}
function contarCompletadosSemana(habitoId, dateStr, registros) {
  return getSemanaDates(dateStr).filter((f) => isHabitCompletedOnDate(habitoId, f, registros)).length;
}

// src/utils/dificilUtils.ts
var puedeTenerMinimo = (h) => h.tipo !== "negativo";
var tieneMinimo = (h) => puedeTenerMinimo(h) && !!h.minimo && h.minimo.trim().length > 0;
function pendientesParaDificil(habitos, registros, hoy) {
  return habitos.filter((h) => {
    if (h.archivado || !puedeTenerMinimo(h)) return false;
    if (isHabitCompletedOnDate(h.id, hoy, registros)) return false;
    if (h.frecuencia === "semanal") {
      const meta = h.vecesPorSemana && h.vecesPorSemana > 0 ? h.vecesPorSemana : 1;
      return contarCompletadosSemana(h.id, hoy, registros) < meta;
    }
    return isHabitScheduledForDate(h, hoy);
  });
}

// src/utils/avisosUtils.ts
var CONFIG_AVISOS = {
  activo: false,
  manana: true,
  tarde: true,
  noche: true,
  minima: true,
  hManana: "07:00",
  hTarde: "13:00",
  hNoche: "19:00",
  hMinima: "20:00",
  regreso: true,
  compromisos: true,
  pomodoro: true,
  nombres: true
};
var MAX_NOMBRES = 3;
var NOMBRE_MOMENTO = { manana: "mañana", tarde: "tarde", noche: "noche" };
var CLAVE_ON = { manana: "manana", tarde: "tarde", noche: "noche", minima: "minima" };
var prendido = (c, t) => c.activo && c[CLAVE_ON[t]];
var sanearConfig = (v) => {
  const x = v && typeof v === "object" ? v : {};
  const b = (k) => typeof x[k] === "boolean" ? x[k] : CONFIG_AVISOS[k];
  const h = (k) => typeof x[k] === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(x[k]) ? x[k] : CONFIG_AVISOS[k];
  return {
    activo: b("activo"),
    manana: b("manana"),
    tarde: b("tarde"),
    noche: b("noche"),
    minima: b("minima"),
    hManana: h("hManana"),
    hTarde: h("hTarde"),
    hNoche: h("hNoche"),
    hMinima: h("hMinima"),
    regreso: b("regreso"),
    compromisos: b("compromisos"),
    pomodoro: b("pomodoro"),
    nombres: b("nombres")
  };
};
var faltanDeMomento = (habitos, registros, hoy, m) => pendientesParaDificil(habitos, registros, hoy).filter((h) => h.momento === m);
var faltanHoy = (habitos, registros, hoy) => pendientesParaDificil(habitos, registros, hoy);
var listaNombres = (nombres, max = MAX_NOMBRES) => {
  const n = nombres.map((x) => x.trim()).filter(Boolean);
  if (n.length === 0) return "";
  if (n.length === 1) return n[0];
  if (n.length <= max) return `${n.slice(0, -1).join(", ")} y ${n[n.length - 1]}`;
  return `${n.slice(0, max - 1).join(", ")} y ${n.length - (max - 1)} más`;
};
var anclajeLegible = (a) => {
  const t = (a || "").trim().replace(/^despu[eé]s de\s+/i, "");
  return t;
};
var textoMomento = (m, faltan, nombres) => {
  if (faltan.length === 0) return null;
  const tu = `Tu ${NOMBRE_MOMENTO[m]}`;
  if (!nombres) {
    return { titulo: faltan.length === 1 ? `${tu}: 1 hábito por marcar` : `${tu}: ${faltan.length} hábitos por marcar`, cuerpo: "Toca para abrir Racha.", destino: "hoy" };
  }
  if (faltan.length === 1) {
    const h = faltan[0];
    const a = anclajeLegible(h.anclaje);
    return { titulo: a ? `Después de ${a}: ${h.nombre}` : `${tu}: ${h.nombre}`, cuerpo: "Toca para abrir Racha y marcarlo.", destino: "hoy" };
  }
  return { titulo: `${tu}: ${faltan.length} hábitos`, cuerpo: `${listaNombres(faltan.map((h) => h.nombre))}. Empieza por uno.`, destino: "hoy" };
};
var textoMinima = (faltan, nombres) => {
  if (faltan.length === 0) return null;
  const quedan = faltan.length === 1 ? "Queda 1" : `Quedan ${faltan.length}`;
  const conMin = faltan.find((h) => tieneMinimo(h));
  if (conMin) {
    return {
      titulo: "Hoy basta con lo mínimo",
      cuerpo: nombres ? `${quedan}. ${conMin.nombre}, mínimo: “${(conMin.minimo || "").trim()}”. Cuenta como cumplido.` : `${quedan}. Toca para ver su versión mínima.`,
      destino: "dificil"
    };
  }
  return {
    titulo: `${quedan} por hoy`,
    cuerpo: nombres ? `${listaNombres(faltan.map((h) => h.nombre))}. ${faltan.length === 1 ? "Todavía cuenta." : "Con uno ya sumas."}` : "Toca para abrir Racha.",
    destino: "hoy"
  };
};
var textoRegreso = (dias) => dias === 2 ? { titulo: "Aquí sigue todo lo que llevas", cuerpo: "Unos días sin cumplir no borran los demás. Hoy cada hábito vale el doble.", destino: "hoy" } : { titulo: "¿Retomamos?", cuerpo: "Empieza con un solo hábito. Lo demás puede esperar.", destino: "hoy" };
var diasSinEntrar = (ultimaVez, hoy) => {
  const a = Date.parse(ultimaVez + "T12:00:00Z");
  const b = Date.parse(hoy + "T12:00:00Z");
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 864e5));
};
var avisoDeHabitos = (t, d) => {
  if (!d.config.activo) return null;
  const dias = diasSinEntrar(d.ultimaVez, d.hoy);
  if (dias >= 2) {
    if (t !== "manana" || !d.config.regreso) return null;
    if (dias === 2) return { ...textoRegreso(2), tipo: "regreso2" };
    if (dias === 7) return { ...textoRegreso(7), tipo: "regreso7" };
    return null;
  }
  if (!prendido(d.config, t)) return null;
  const activos = d.habitos.filter((h) => !h.archivado);
  if (t === "minima") {
    const x2 = textoMinima(faltanHoy(activos, d.registros, d.hoy), d.config.nombres);
    return x2 ? { ...x2, tipo: "minima" } : null;
  }
  const x = textoMomento(t, faltanDeMomento(activos, d.registros, d.hoy, t), d.config.nombres);
  return x ? { ...x, tipo: t } : null;
};

// supabase/functions/enviar-avisos/webpush.ts
var enc = new TextEncoder();
var b64u = {
  aTexto(b) {
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  aBytes(t) {
    const s = atob(t.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(t.length / 4) * 4, "="));
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }
};
var unir = (...p) => {
  const out = new Uint8Array(p.reduce((n, x) => n + x.length, 0));
  let i = 0;
  for (const x of p) {
    out.set(x, i);
    i += x.length;
  }
  return out;
};
var hkdf = async (salt, ikm, info, bytes) => {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, bytes * 8));
};
async function cifrar(mensaje, p256dh, auth) {
  const delCelular = b64u.aBytes(p256dh);
  const secreto = b64u.aBytes(auth);
  const par = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const mio = new Uint8Array(await crypto.subtle.exportKey("raw", par.publicKey));
  const llaveCelular = await crypto.subtle.importKey("raw", delCelular, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const compartido = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: llaveCelular }, par.privateKey, 256));
  const ikm = await hkdf(secreto, compartido, unir(enc.encode("WebPush: info\0"), delCelular, mio), 32);
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(sal, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(sal, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const llave = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const claro = unir(enc.encode(mensaje), new Uint8Array([2]));
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, llave, claro));
  const tamano = new Uint8Array([0, 0, 16, 0]);
  return unir(sal, tamano, new Uint8Array([mio.length]), mio, cifrado);
}
var llaveVapid = (v) => {
  const pub = b64u.aBytes(v.publica);
  if (pub.length !== 65 || pub[0] !== 4) throw new Error("VAPID_PUBLICA no tiene el formato esperado");
  return crypto.subtle.importKey("jwk", {
    kty: "EC",
    crv: "P-256",
    d: v.privada.trim(),
    x: b64u.aTexto(pub.slice(1, 33)),
    y: b64u.aTexto(pub.slice(33, 65)),
    ext: true
  }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
};
async function autorizacion(endpoint, v, ahoraSeg = Math.floor(Date.now() / 1e3)) {
  const aud = new URL(endpoint).origin;
  const cab = b64u.aTexto(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const cuerpo = b64u.aTexto(enc.encode(JSON.stringify({ aud, exp: ahoraSeg + 12 * 3600, sub: v.asunto })));
  const firma = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, await llaveVapid(v), enc.encode(`${cab}.${cuerpo}`)));
  return `vapid t=${cab}.${cuerpo}.${b64u.aTexto(firma)}, k=${v.publica.trim()}`;
}
async function enviar(c, mensaje, v, o) {
  const cabeceras = {
    "Authorization": await autorizacion(c.endpoint, v),
    "Content-Encoding": "aes128gcm",
    "Content-Type": "application/octet-stream",
    "TTL": String(o.ttl),
    "Urgency": o.urgente ? "high" : "normal"
  };
  if (o.tema) cabeceras["Topic"] = o.tema.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32);
  const r = await fetch(c.endpoint, { method: "POST", headers: cabeceras, body: await cifrar(mensaje, c.p256dh, c.auth) });
  try {
    await r.body?.cancel();
  } catch {
  }
  return r.status;
}

// supabase/functions/enviar-avisos/fuente.ts
var responder = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });
var DE_HORA = ["manana", "tarde", "noche", "minima"];
var TTL = { compromiso: 1800, pomodoro: 300, descanso: 300, prueba: 600 };
Deno.serve(async (req) => {
  if (req.method !== "POST") return responder({ error: "metodo" }, 405);
  const url = Deno.env.get("SUPABASE_URL") || "";
  const llave = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";
  const vapid = {
    publica: (Deno.env.get("VAPID_PUBLICA") || "").trim(),
    privada: (Deno.env.get("VAPID_PRIVADA") || "").trim(),
    asunto: (Deno.env.get("VAPID_ASUNTO") || "mailto:hola@tengoracha.com").trim()
  };
  if (!url || !llave || !vapid.publica || !vapid.privada) return responder({ error: "faltan_secretos" }, 500);
  const db = createClient(url, llave, { auth: { persistSession: false } });
  const clave = req.headers.get("x-avisos-cron") || "";
  const { data: esReloj } = await db.rpc("avisos_verificar_cron", { p: clave });
  if (esReloj !== true) return responder({ error: "no_autorizado" }, 401);
  const { data, error } = await db.rpc("avisos_reclamar");
  if (error) return responder({ error: "reclamar", detalle: error.message }, 500);
  const filas = data || [];
  let enviados = 0, sinNada = 0;
  const muertos = [];
  const tareas = [];
  for (const f of filas) {
    let titulo = f.titulo, cuerpo = f.cuerpo, destino = f.destino || "hoy", tipo = f.tipo;
    if (DE_HORA.includes(f.tipo)) {
      const d = f.datos || {};
      const a = avisoDeHabitos(f.tipo, {
        habitos: Array.isArray(d.habitos) ? d.habitos : [],
        registros: Array.isArray(d.registros) ? d.registros : [],
        config: sanearConfig(f.config),
        hoy: f.hoy,
        ultimaVez: f.ultima_vez || f.hoy
      });
      if (!a) {
        sinNada++;
        continue;
      }
      titulo = a.titulo;
      cuerpo = a.cuerpo;
      destino = a.destino;
      tipo = a.tipo;
    }
    if (!titulo || !cuerpo) {
      sinNada++;
      continue;
    }
    const etiqueta = DE_HORA.includes(f.tipo) || tipo.startsWith("regreso") ? "habitos" : tipo === "compromiso" ? `compromiso-${f.clave}` : tipo;
    const mensaje = JSON.stringify({ titulo, cuerpo, destino, etiqueta });
    const opciones = { ttl: TTL[tipo] ?? 3600, urgente: tipo === "pomodoro" || tipo === "descanso" || tipo === "compromiso" || tipo === "prueba", tema: etiqueta };
    for (const c of Array.isArray(f.celulares) ? f.celulares : []) {
      tareas.push((async () => {
        try {
          const codigo = await enviar(c, mensaje, vapid, opciones);
          if (codigo === 404 || codigo === 410) muertos.push(c.endpoint);
          else if (codigo >= 200 && codigo < 300) enviados++;
          else console.log("aviso no entregado", codigo, new URL(c.endpoint).host);
        } catch (e) {
          console.log("error al enviar", String(e).slice(0, 120));
        }
      })());
    }
  }
  await Promise.all(tareas);
  if (muertos.length) await db.rpc("avisos_borrar_celulares", { p_endpoints: muertos });
  return responder({ ok: true, apartados: filas.length, enviados, sin_nada: sinNada, celulares_borrados: muertos.length });
});
