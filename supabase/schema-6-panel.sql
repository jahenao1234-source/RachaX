-- Racha 6: panel de pagos (design/maqueta-panel-pagos.html, DESIGN.md › Panel de pagos).
-- Se corre una sola vez en Supabase > SQL Editor, después de schema-5-pagos.sql. Se puede volver a correr sin daño.
--
-- Qué hace:
-- 1) Columnas nuevas en compradores: cuándo llegó la compra, cómo pagó, lo que la IA vio raro (aparte de tus notas),
--    y el aviso de "mandó otro comprobante".
-- 2) Un comprador SOLO puede leer si compró (email, activo, estado_pago). Nada de tus notas ni de lo que leyó la IA.
-- 3) El panel lee y cambia todo por funciones que primero revisan que seas el dueño (es_admin()).
-- 4) El cuadre se guarda de una sola vez, sin que se cuele una compra que llegó mientras cuadrabas.

-- ---------- 1) Columnas nuevas ----------
alter table public.compradores
  add column if not exists registrado_en timestamptz,                 -- cuándo llegó la compra (la primera vez)
  add column if not exists forma_pago text not null default 'transferencia',
  add column if not exists fallas text,                               -- lo que la IA vio raro (tus notas van en "notas")
  add column if not exists otro_comprobante_en timestamptz,           -- un bloqueado mandó otro comprobante
  add column if not exists comprobantes_anteriores text[] not null default '{}';

update public.compradores set registrado_en = coalesce(registrado_en, creado_en, actualizado_en, now()) where registrado_en is null;
alter table public.compradores alter column registrado_en set default now();
alter table public.compradores alter column registrado_en set not null;

do $$ begin
  alter table public.compradores add constraint compradores_forma_pago_chk check (forma_pago in ('transferencia', 'efectivo', 'regalo'));
exception when duplicate_object then null; end $$;

-- Antes, las notas de la IA se guardaban en "notas": pasan a "fallas" para que "notas" quede solo para ti.
update public.compradores set fallas = notas, notas = null where origen = 'whatsapp' and fallas is null and notas is not null;

-- activo y estado_pago siempre de acuerdo (bloqueado = sin acceso)
update public.compradores set estado_pago = 'bloqueado' where not activo and estado_pago <> 'bloqueado';
update public.compradores set activo = true where estado_pago <> 'bloqueado' and not activo;
do $$ begin
  alter table public.compradores add constraint compradores_activo_estado_chk check (activo = (estado_pago <> 'bloqueado'));
exception when duplicate_object then null; end $$;

create index if not exists compradores_estado_fecha_idx on public.compradores (estado_pago, registrado_en desc);
create index if not exists compradores_referencia_idx on public.compradores (referencia) where referencia is not null;

-- ---------- 2) Lo que puede leer cada comprador ----------
-- La regla "ver solo mi compra" sigue igual (cada quien ve SU fila), pero ahora solo 3 columnas.
revoke select, insert, update, delete on public.compradores from anon, authenticated;
grant select (email, activo, estado_pago) on public.compradores to authenticated;

-- El panel ya no lee ni cambia la tabla directo: lo hace por las funciones de abajo.
drop policy if exists "admin ve compradores" on public.compradores;
drop policy if exists "admin actualiza compradores" on public.compradores;

-- ---------- 3) Funciones del panel (todas revisan es_admin()) ----------
create or replace function public.panel_resumen()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_desde timestamptz;
  v_ultimo json;
  v_ahora timestamptz := now();
begin
  if not public.es_admin() then raise exception 'no_autorizado' using errcode = '42501'; end if;
  select max(hasta) into v_desde from public.cierres;
  select json_build_object('hasta', hasta, 'recibido', recibido, 'esperado', esperado, 'compras', compras)
    into v_ultimo from public.cierres order by hasta desc limit 1;
  return json_build_object(
    'ahora', v_ahora,
    'desde', v_desde,
    'ultimo_cierre', v_ultimo,
    -- Entran al cuadre: transferencias que se ven bien o ya pagaron, llegadas desde el último cuadre
    'compras', (select count(*) from public.compradores
                 where forma_pago = 'transferencia' and estado_pago in ('por_verificar', 'verificado')
                   and registrado_en > coalesce(v_desde, '-infinity') and registrado_en <= v_ahora),
    'esperado', (select coalesce(sum(coalesce(valor, 37900)), 0) from public.compradores
                  where forma_pago = 'transferencia' and estado_pago in ('por_verificar', 'verificado')
                    and registrado_en > coalesce(v_desde, '-infinity') and registrado_en <= v_ahora),
    -- "Algo no cuadra" de ese mismo período: no entran hasta que las decidas
    'por_revisar', (select count(*) from public.compradores
                     where estado_pago = 'revisar' and registrado_en > coalesce(v_desde, '-infinity') and registrado_en <= v_ahora),
    'conteos', (select json_build_object(
                  'revisar', count(*) filter (where estado_pago = 'revisar'),
                  'por_verificar', count(*) filter (where estado_pago = 'por_verificar'),
                  'verificado', count(*) filter (where estado_pago = 'verificado'),
                  'bloqueado', count(*) filter (where estado_pago = 'bloqueado'),
                  'todas', count(*))
                from public.compradores)
  );
end;
$$;

-- p_estado: 'revisar' | 'por_verificar' | 'verificado' | 'bloqueado' | null (todas). p_buscar: correo, nombre, teléfono o referencia.
create or replace function public.panel_compras(p_estado text default null, p_buscar text default null, p_limite int default 50, p_saltar int default 0)
returns setof json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  b text := nullif(trim(lower(coalesce(p_buscar, ''))), '');
begin
  if not public.es_admin() then raise exception 'no_autorizado' using errcode = '42501'; end if;
  return query
    select json_build_object(
      'email', c.email, 'activo', c.activo, 'estado_pago', c.estado_pago, 'origen', c.origen, 'forma_pago', c.forma_pago,
      'telefono', c.telefono, 'nombre_pagador', c.nombre_pagador, 'valor', c.valor, 'referencia', c.referencia,
      'fecha_pago', c.fecha_pago, 'comprobante_path', c.comprobante_path, 'lectura_ia', c.lectura_ia,
      'fallas', c.fallas, 'notas', c.notas, 'registrado_en', c.registrado_en, 'actualizado_en', c.actualizado_en,
      'otro_comprobante_en', c.otro_comprobante_en,
      -- Mismo comprobante mandado con otro correo
      'referencia_repetida', (select min(o.email) from public.compradores o
                               where c.referencia is not null and o.referencia = c.referencia and o.email <> c.email))
    from public.compradores c
    where (p_estado is null or c.estado_pago = p_estado)
      and (b is null
           or c.email like '%' || b || '%'
           or lower(coalesce(c.nombre_pagador, '')) like '%' || b || '%'
           or regexp_replace(coalesce(c.telefono, ''), '\D', '', 'g') like '%' || regexp_replace(b, '\D', '', 'g') || '%' and regexp_replace(b, '\D', '', 'g') <> ''
           or lower(coalesce(c.referencia, '')) like '%' || b || '%')
    order by (c.otro_comprobante_en is not null) desc, c.registrado_en desc
    limit least(greatest(p_limite, 1), 200) offset greatest(p_saltar, 0);
end;
$$;

-- Cambia el estado: 'verificado' (Sí pagó / Desbloquear), 'bloqueado', o volver a 'por_verificar' / 'revisar' (Deshacer).
-- Devuelve el estado que tenía, para poder deshacer.
create or replace function public.panel_marcar(p_email text, p_estado text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_antes text;
begin
  if not public.es_admin() then raise exception 'no_autorizado' using errcode = '42501'; end if;
  if p_estado not in ('por_verificar', 'revisar', 'verificado', 'bloqueado') then raise exception 'estado_invalido'; end if;
  select estado_pago into v_antes from public.compradores where email = lower(trim(p_email)) for update;
  if v_antes is null then raise exception 'no_existe'; end if;
  update public.compradores
     set estado_pago = p_estado,
         activo = (p_estado <> 'bloqueado'),
         -- Al decidir, el aviso de "mandó otro comprobante" ya se atendió
         otro_comprobante_en = case when p_estado in ('verificado', 'bloqueado') and v_antes = 'bloqueado' then null else otro_comprobante_en end,
         actualizado_en = now()
   where email = lower(trim(p_email));
  return v_antes;
end;
$$;

create or replace function public.panel_nota(p_email text, p_nota text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then raise exception 'no_autorizado' using errcode = '42501'; end if;
  update public.compradores
     set notas = nullif(left(trim(coalesce(p_nota, '')), 500), ''), actualizado_en = now()
   where email = lower(trim(p_email));
end;
$$;

-- "Agregar comprador": entra de una como pagado. Si el correo ya existe, avisa con su estado.
create or replace function public.panel_agregar(p_email text, p_valor int, p_forma text, p_nota text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_estado text;
begin
  if not public.es_admin() then raise exception 'no_autorizado' using errcode = '42501'; end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'correo_invalido'; end if;
  if p_forma not in ('transferencia', 'efectivo', 'regalo') then raise exception 'forma_invalida'; end if;
  select estado_pago into v_estado from public.compradores where email = v_email;
  if v_estado is not null then
    return json_build_object('ok', false, 'error', 'ya_existe', 'estado', v_estado);
  end if;
  insert into public.compradores (email, activo, estado_pago, origen, forma_pago, valor, notas, registrado_en, actualizado_en)
  values (v_email, true, 'verificado', 'manual', p_forma,
          case when p_forma = 'regalo' then 0 else greatest(coalesce(p_valor, 37900), 0) end,
          nullif(left(trim(coalesce(p_nota, '')), 500), ''), now(), now());
  return json_build_object('ok', true);
end;
$$;

-- ---------- 4) Guardar el cuadre, todo de una vez ----------
-- p_hasta: la hora "ahora" que devolvió panel_resumen cuando el dueño vio los números.
-- p_compras_vistas: cuántas compras vio. Si llegó otra en el camino, se niega ("cambio") y el panel vuelve a cargar.
-- Si lo recibido es igual a lo esperado, las compras "Se ve bien" de ese período quedan como pagadas.
create or replace function public.guardar_cierre(p_hasta timestamptz, p_recibido int, p_compras_vistas int, p_notas text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_desde timestamptz;
  v_n int;
  v_esp int;
  v_id bigint;
  v_marcadas int := 0;
begin
  if not public.es_admin() then raise exception 'no_autorizado' using errcode = '42501'; end if;
  if p_recibido is null or p_recibido < 0 then raise exception 'recibido_invalido'; end if;
  perform pg_advisory_xact_lock(4242);                 -- dos cuadres a la vez: uno espera al otro
  select coalesce(max(hasta), '-infinity') into v_desde from public.cierres;
  if p_hasta <= v_desde or p_hasta > now() then raise exception 'rango'; end if;
  select count(*), coalesce(sum(coalesce(valor, 37900)), 0) into v_n, v_esp
    from public.compradores
   where forma_pago = 'transferencia' and estado_pago in ('por_verificar', 'verificado')
     and registrado_en > v_desde and registrado_en <= p_hasta;
  if v_n <> p_compras_vistas then raise exception 'cambio'; end if;
  insert into public.cierres (desde, hasta, recibido, esperado, compras, notas)
  values (case when v_desde = '-infinity' then p_hasta - interval '100 years' else v_desde end, p_hasta, p_recibido, v_esp, v_n,
          nullif(left(trim(coalesce(p_notas, '')), 500), ''))
  returning id into v_id;
  if p_recibido = v_esp then
    update public.compradores
       set estado_pago = 'verificado', activo = true, actualizado_en = now()
     where forma_pago = 'transferencia' and estado_pago = 'por_verificar'
       and registrado_en > v_desde and registrado_en <= p_hasta;
    get diagnostics v_marcadas = row_count;
  end if;
  return json_build_object('id', v_id, 'cuadra', p_recibido = v_esp, 'compras', v_n, 'esperado', v_esp, 'marcadas', v_marcadas);
end;
$$;

create or replace function public.panel_cierres(p_limite int default 20)
returns setof public.cierres
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then raise exception 'no_autorizado' using errcode = '42501'; end if;
  return query select * from public.cierres order by hasta desc limit least(greatest(p_limite, 1), 100);
end;
$$;

-- Nadie sin sesión puede llamarlas; con sesión, cada una revisa es_admin() por dentro.
revoke all on function public.panel_resumen() from public, anon;
revoke all on function public.panel_compras(text, text, int, int) from public, anon;
revoke all on function public.panel_marcar(text, text) from public, anon;
revoke all on function public.panel_nota(text, text) from public, anon;
revoke all on function public.panel_agregar(text, int, text, text) from public, anon;
revoke all on function public.guardar_cierre(timestamptz, int, int, text) from public, anon;
revoke all on function public.panel_cierres(int) from public, anon;
grant execute on function public.panel_resumen() to authenticated;
grant execute on function public.panel_compras(text, text, int, int) to authenticated;
grant execute on function public.panel_marcar(text, text) to authenticated;
grant execute on function public.panel_nota(text, text) to authenticated;
grant execute on function public.panel_agregar(text, int, text, text) to authenticated;
grant execute on function public.guardar_cierre(timestamptz, int, int, text) to authenticated;
grant execute on function public.panel_cierres(int) to authenticated;

-- La tabla cierres ya solo la maneja el admin (regla de schema-5). Las fotos: el admin crea enlaces que vencen
-- (storage.createSignedUrl) gracias a la regla "admin ve comprobantes" de schema-5.
