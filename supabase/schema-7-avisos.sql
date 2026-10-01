-- Racha · Avisos (recordatorios push). design/maqueta-avisos.html, DESIGN.md › "Avisos".
-- Se corre UNA vez en Supabase › SQL Editor, DESPUÉS de activar las extensiones pg_cron y pg_net
-- (Database › Extensions). Se puede volver a correr sin dañar nada.
--
-- Cómo funciona:
--   1) Cada celular guarda su "suscripción" (la dirección a la que se le mandan los avisos).
--   2) Cada persona tiene su configuración (horas e interruptores) y el día de la última vez que abrió la app.
--   3) Los compromisos y el pomodoro los programa la app en una cola, con la hora exacta.
--   4) Un reloj (pg_cron) revisa cada 30 segundos si hay algo que mandar. Solo si lo hay, llama a la
--      función "enviar-avisos", que arma el texto y lo envía.
-- Nadie lee estas tablas directamente: todo pasa por funciones que revisan quién eres.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------- 1) Tablas ----------
create table if not exists public.push_suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  plataforma text,
  creado_en timestamptz not null default now(),
  visto_en timestamptz not null default now()
);
create index if not exists push_suscripciones_user on public.push_suscripciones (user_id);
alter table public.push_suscripciones enable row level security;

create table if not exists public.avisos_config (
  user_id uuid primary key references auth.users on delete cascade,
  -- lo que eligió en Perfil › Avisos (formato de src/utils/avisosUtils.ts › ConfigAvisos)
  config jsonb not null default '{}'::jsonb,
  activo boolean not null default false,
  h_manana time not null default '07:00',
  h_tarde time not null default '13:00',
  h_noche time not null default '19:00',
  h_minima time not null default '20:00',
  tz text not null default 'America/Bogota',
  -- día (en su hora local) de la última vez que abrió la app
  ultima_vez date not null default ((now() at time zone 'America/Bogota')::date),
  actualizado_en timestamptz not null default now()
);
alter table public.avisos_config enable row level security;

create table if not exists public.avisos_cola (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  tipo text not null check (tipo in ('compromiso', 'pomodoro', 'descanso', 'prueba')),
  clave text not null,
  enviar_en timestamptz not null,
  titulo text not null check (char_length(titulo) <= 160),
  cuerpo text not null check (char_length(cuerpo) <= 300),
  destino text not null default 'hoy' check (destino in ('hoy', 'dificil', 'compromisos', 'foco')),
  unique (user_id, tipo, clave)
);
create index if not exists avisos_cola_hora on public.avisos_cola (enviar_en);
alter table public.avisos_cola enable row level security;

-- Lo ya enviado: evita mandar dos veces el mismo aviso. No guarda el texto.
create table if not exists public.avisos_enviados (
  user_id uuid not null references auth.users on delete cascade,
  tipo text not null,
  clave text not null,
  enviado_en timestamptz not null default now(),
  primary key (user_id, tipo, clave)
);
alter table public.avisos_enviados enable row level security;

-- ---------- 2) Lo que llama la app (cada quien solo toca lo suyo) ----------
create or replace function public.avisos_tz(p_tz text) returns text
language sql stable set search_path = public as $$
  select coalesce((select name from pg_timezone_names where name = p_tz limit 1), 'America/Bogota');
$$;

-- Guarda la suscripción de este celular. Si el celular era de otra cuenta, pasa a esta.
create or replace function public.guardar_suscripcion(p_endpoint text, p_p256dh text, p_auth text, p_plataforma text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  if p_endpoint is null or p_endpoint !~ '^https://' or char_length(p_endpoint) > 1000
     or coalesce(char_length(p_p256dh), 0) not between 20 and 200 or coalesce(char_length(p_auth), 0) not between 8 and 100 then
    raise exception 'suscripcion_invalida';
  end if;
  insert into public.push_suscripciones (user_id, endpoint, p256dh, auth, plataforma)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_plataforma, 40))
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
        plataforma = excluded.plataforma, visto_en = now();
  -- como mucho 10 celulares por persona: se van los más viejos
  delete from public.push_suscripciones s
   where s.user_id = auth.uid()
     and s.id not in (select id from public.push_suscripciones where user_id = auth.uid() order by visto_en desc limit 10);
end $$;

-- Al salir de la cuenta o apagar los avisos en este celular
create or replace function public.quitar_suscripcion(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_suscripciones where endpoint = p_endpoint and user_id = auth.uid();
$$;

-- Guarda lo elegido en Perfil › Avisos
create or replace function public.guardar_avisos_config(p_config jsonb, p_tz text default 'America/Bogota')
returns void language plpgsql security definer set search_path = public as $$
declare
  v_tz text := public.avisos_tz(p_tz);
  h_re constant text := '^([01][0-9]|2[0-3]):[0-5][0-9]$';
begin
  if auth.uid() is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  if p_config is null or jsonb_typeof(p_config) <> 'object' or pg_column_size(p_config) > 4000 then raise exception 'config_invalida'; end if;
  insert into public.avisos_config (user_id, config, activo, h_manana, h_tarde, h_noche, h_minima, tz, ultima_vez, actualizado_en)
  values (
    auth.uid(), p_config, coalesce((p_config->>'activo')::boolean, false),
    case when p_config->>'hManana' ~ h_re then (p_config->>'hManana')::time else '07:00' end,
    case when p_config->>'hTarde'  ~ h_re then (p_config->>'hTarde')::time  else '13:00' end,
    case when p_config->>'hNoche'  ~ h_re then (p_config->>'hNoche')::time  else '19:00' end,
    case when p_config->>'hMinima' ~ h_re then (p_config->>'hMinima')::time else '20:00' end,
    v_tz, (now() at time zone v_tz)::date, now())
  on conflict (user_id) do update
    set config = excluded.config, activo = excluded.activo, h_manana = excluded.h_manana, h_tarde = excluded.h_tarde,
        h_noche = excluded.h_noche, h_minima = excluded.h_minima, tz = excluded.tz, ultima_vez = excluded.ultima_vez,
        actualizado_en = now();
end $$;

-- Lo que tenía elegido (para otro celular de la misma cuenta). null si nunca guardó.
create or replace function public.mi_avisos_config()
returns jsonb language sql security definer stable set search_path = public as $$
  select config from public.avisos_config where user_id = auth.uid();
$$;

-- "Abrí la app": anota el día. Sirve para el aviso de regreso.
create or replace function public.avisos_latido(p_tz text default 'America/Bogota')
returns void language plpgsql security definer set search_path = public as $$
declare v_tz text := public.avisos_tz(p_tz);
begin
  if auth.uid() is null then return; end if;
  update public.avisos_config set ultima_vez = (now() at time zone v_tz)::date, tz = v_tz where user_id = auth.uid();
end $$;

-- Programa los avisos de un tipo (compromisos, pomodoro o descanso): reemplaza los que había de ese tipo.
-- p_filas: [{ "clave": "...", "enviar_en": "2026-10-01T19:30:00.000Z", "titulo": "...", "cuerpo": "...", "destino": "compromisos" }]
create or replace function public.programar_avisos(p_tipo text, p_filas jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  if p_tipo not in ('compromiso', 'pomodoro', 'descanso') then raise exception 'tipo_invalido'; end if;
  if p_filas is null or jsonb_typeof(p_filas) <> 'array' or jsonb_array_length(p_filas) > 200 then raise exception 'filas_invalidas'; end if;
  delete from public.avisos_cola where user_id = auth.uid() and tipo = p_tipo;
  insert into public.avisos_cola (user_id, tipo, clave, enviar_en, titulo, cuerpo, destino)
  select auth.uid(), p_tipo, left(f->>'clave', 120), (f->>'enviar_en')::timestamptz,
         left(f->>'titulo', 160), left(f->>'cuerpo', 300), coalesce(f->>'destino', 'hoy')
    from jsonb_array_elements(p_filas) f
   where (f->>'enviar_en')::timestamptz > now() - interval '1 minute'
     and (f->>'enviar_en')::timestamptz < now() + interval '40 days'
  on conflict (user_id, tipo, clave) do nothing;
end $$;

-- Un aviso de prueba, ya mismo, a los celulares de esta cuenta (lo usa "Listo, te avisamos")
create or replace function public.avisos_probar()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sin_sesion' using errcode = '42501'; end if;
  insert into public.avisos_cola (user_id, tipo, clave, enviar_en, titulo, cuerpo, destino)
  values (auth.uid(), 'prueba', to_char(now(), 'YYYYMMDDHH24MISS'), now(), 'Así te llegan los avisos de Racha', 'Listo. Desde ahora te avisamos cuando toque.', 'hoy')
  on conflict (user_id, tipo, clave) do nothing;
  -- como mucho 1 prueba pendiente
  delete from public.avisos_cola c where c.user_id = auth.uid() and c.tipo = 'prueba'
     and c.id not in (select id from public.avisos_cola where user_id = auth.uid() and tipo = 'prueba' order by enviar_en desc limit 1);
end $$;

revoke all on function public.guardar_suscripcion(text, text, text, text) from public, anon;
revoke all on function public.quitar_suscripcion(text) from public, anon;
revoke all on function public.guardar_avisos_config(jsonb, text) from public, anon;
revoke all on function public.mi_avisos_config() from public, anon;
revoke all on function public.avisos_latido(text) from public, anon;
revoke all on function public.programar_avisos(text, jsonb) from public, anon;
revoke all on function public.avisos_probar() from public, anon;
grant execute on function public.guardar_suscripcion(text, text, text, text) to authenticated;
grant execute on function public.quitar_suscripcion(text) to authenticated;
grant execute on function public.guardar_avisos_config(jsonb, text) to authenticated;
grant execute on function public.mi_avisos_config() to authenticated;
grant execute on function public.avisos_latido(text) to authenticated;
grant execute on function public.programar_avisos(text, jsonb) to authenticated;
grant execute on function public.avisos_probar() to authenticated;

-- ---------- 3) Lo que usa el reloj y la función "enviar-avisos" (nadie más) ----------
-- La clave con la que el reloj le habla a la función. Se inventa aquí adentro: nadie la ve ni la escribe.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'avisos_cron') then
    perform vault.create_secret(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'avisos_cron', 'Clave del reloj de avisos de Racha');
  end if;
end $$;

create or replace function public.avisos_verificar_cron(p text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from vault.decrypted_secrets where name = 'avisos_cron' and decrypted_secret = p);
$$;
revoke all on function public.avisos_verificar_cron(text) from public, anon, authenticated;
grant execute on function public.avisos_verificar_cron(text) to service_role;

-- Los avisos de hábitos que tocan en este momento (ventana de 15 minutos, una vez por día y por tipo)
create or replace view public.avisos_por_hora as
  select c.user_id, t.tipo, (now() at time zone c.tz)::date as hoy
    from public.avisos_config c
    cross join lateral (values ('manana', c.h_manana), ('tarde', c.h_tarde), ('noche', c.h_noche), ('minima', c.h_minima)) as t(tipo, hora)
   where c.activo
     and (now() at time zone c.tz)::time >= t.hora
     and (now() at time zone c.tz)::time < t.hora + interval '15 minutes'
     and t.hora <= time '23:44'
     and not exists (select 1 from public.avisos_enviados e where e.user_id = c.user_id and e.tipo = t.tipo and e.clave = ((now() at time zone c.tz)::date)::text)
     and exists (select 1 from public.push_suscripciones s where s.user_id = c.user_id);
revoke all on public.avisos_por_hora from public, anon, authenticated;

-- Aparta lo que toca mandar AHORA (lo marca como enviado para que no salga dos veces) y lo devuelve
-- con todo lo que la función necesita: la copia de la Racha, la configuración y los celulares.
create or replace function public.avisos_reclamar()
returns table (user_id uuid, tipo text, clave text, titulo text, cuerpo text, destino text, hoy text, ultima_vez text, config jsonb, datos jsonb, celulares jsonb)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  -- lo de la cola que se pasó de hora hace más de 10 minutos ya no sirve
  delete from public.avisos_cola q where q.enviar_en < now() - interval '10 minutes';

  return query
  with activos as (
    -- solo cuentas con la compra activa
    select u.id from auth.users u join public.compradores p on p.email = lower(u.email) and p.activo
  ),
  de_hora as (
    insert into public.avisos_enviados (user_id, tipo, clave)
    select a.user_id, a.tipo, a.hoy::text from public.avisos_por_hora a where a.user_id in (select id from activos)
    on conflict do nothing
    returning avisos_enviados.user_id, avisos_enviados.tipo, avisos_enviados.clave
  ),
  de_cola as (
    delete from public.avisos_cola q
     where q.enviar_en <= now() and q.user_id in (select id from activos)
    returning q.user_id, q.tipo, q.clave, q.titulo, q.cuerpo, q.destino
  ),
  cola_nueva as (
    insert into public.avisos_enviados (user_id, tipo, clave)
    select d.user_id, d.tipo, d.clave from de_cola d
    on conflict do nothing
    returning avisos_enviados.user_id, avisos_enviados.tipo, avisos_enviados.clave
  ),
  todo as (
    select h.user_id, h.tipo, h.clave, null::text as titulo, null::text as cuerpo, null::text as destino from de_hora h
    union all
    select d.user_id, d.tipo, d.clave, d.titulo, d.cuerpo, d.destino from de_cola d join cola_nueva n on n.user_id = d.user_id and n.tipo = d.tipo and n.clave = d.clave
  )
  select t.user_id, t.tipo, t.clave, t.titulo, t.cuerpo, t.destino,
         ((now() at time zone coalesce(c.tz, 'America/Bogota'))::date)::text,
         c.ultima_vez::text, c.config,
         case when t.titulo is null then (select e.datos from public.estado e where e.user_id = t.user_id) else null end,
         (select coalesce(jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth)), '[]'::jsonb)
            from public.push_suscripciones s where s.user_id = t.user_id)
    from todo t
    left join public.avisos_config c on c.user_id = t.user_id;
end $$;
revoke all on function public.avisos_reclamar() from public, anon, authenticated;
grant execute on function public.avisos_reclamar() to service_role;

-- Los celulares que ya no existen (desinstaló o quitó el permiso) se borran
create or replace function public.avisos_borrar_celulares(p_endpoints text[])
returns void language sql security definer set search_path = public as $$
  delete from public.push_suscripciones where endpoint = any(p_endpoints);
$$;
revoke all on function public.avisos_borrar_celulares(text[]) from public, anon, authenticated;
grant execute on function public.avisos_borrar_celulares(text[]) to service_role;

-- El reloj: si hay algo que mandar, llama a la función. Si no, no gasta nada.
create or replace function public.avisos_revisar()
returns void language plpgsql security definer set search_path = public as $$
declare v_clave text;
begin
  if not exists (select 1 from public.avisos_cola where enviar_en <= now())
     and not exists (select 1 from public.avisos_por_hora) then
    return;
  end if;
  select decrypted_secret into v_clave from vault.decrypted_secrets where name = 'avisos_cron';
  perform net.http_post(
    url := 'https://upkfhxuztibjkyavmmaw.supabase.co/functions/v1/enviar-avisos',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-avisos-cron', v_clave),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
end $$;
revoke all on function public.avisos_revisar() from public, anon, authenticated;

-- Limpieza diaria
create or replace function public.avisos_limpiar()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.avisos_enviados where enviado_en < now() - interval '30 days';
  delete from public.avisos_cola where enviar_en < now() - interval '1 day';
  delete from cron.job_run_details where end_time < now() - interval '2 days';
end $$;
revoke all on function public.avisos_limpiar() from public, anon, authenticated;

-- ---------- 4) El reloj ----------
do $$
begin
  perform cron.unschedule(jobid) from cron.job where jobname in ('racha-avisos', 'racha-avisos-limpiar');
  begin
    perform cron.schedule('racha-avisos', '30 seconds', 'select public.avisos_revisar()');
  exception when others then
    -- versiones viejas de pg_cron no aceptan segundos: cada minuto
    perform cron.schedule('racha-avisos', '* * * * *', 'select public.avisos_revisar()');
  end;
  perform cron.schedule('racha-avisos-limpiar', '17 8 * * *', 'select public.avisos_limpiar()');
end $$;

-- Para comprobar que quedó: debe mostrar 2 filas (racha-avisos y racha-avisos-limpiar)
select jobname, schedule, active from cron.job where jobname like 'racha-avisos%';
