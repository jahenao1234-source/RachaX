-- Racha 5: venta por WhatsApp (ManyChat) con pago por Bre-B y panel de pagos.
-- Se corre una sola vez en Supabase > SQL Editor, después de schema.sql y schema-4b.sql.
-- ANTES DE CORRER: cambia 'TU_CORREO@gmail.com' (abajo, en admins) por tu correo en minúsculas.

-- 1) Datos del pago en cada comprador
alter table public.compradores
  add column if not exists telefono text,
  add column if not exists nombre_pagador text,          -- a nombre de quién está la cuenta que pagó
  add column if not exists valor int,                     -- lo que dice el comprobante (pesos)
  add column if not exists referencia text,               -- número de referencia del comprobante
  add column if not exists fecha_pago timestamptz,        -- fecha y hora del comprobante
  add column if not exists comprobante_path text,         -- dónde quedó la foto (bucket privado)
  add column if not exists lectura_ia jsonb,              -- lo que leyó la IA del comprobante
  add column if not exists estado_pago text not null default 'verificado'
    check (estado_pago in ('por_verificar', 'revisar', 'verificado', 'bloqueado')),
  add column if not exists origen text not null default 'manual',   -- 'manual' o 'whatsapp'
  add column if not exists notas text,
  add column if not exists actualizado_en timestamptz default now();

-- 2) Quién puede ver y manejar el panel de pagos
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;
-- Nadie lee esta tabla desde la app: solo la usan las reglas de abajo.

insert into public.admins (email) values ('TU_CORREO@gmail.com')
on conflict (email) do nothing;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt()->>'email'));
$$;
revoke all on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

-- El admin ve y actualiza todos los compradores (los demás siguen viendo solo su propia compra)
create policy "admin ve compradores"
  on public.compradores for select
  using (public.es_admin());

create policy "admin actualiza compradores"
  on public.compradores for update
  using (public.es_admin())
  with check (public.es_admin());

-- 3) Los cierres de caja del panel (cuánto llegó y cuánto se esperaba)
create table if not exists public.cierres (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  desde timestamptz not null,
  hasta timestamptz not null,
  recibido int not null,     -- lo que viste en tu Nequi o banco
  esperado int not null,     -- lo que sumaban las compras del período
  compras int not null,
  notas text
);
alter table public.cierres enable row level security;
create policy "admin maneja cierres"
  on public.cierres for all
  using (public.es_admin())
  with check (public.es_admin());

-- 4) Fotos de los comprobantes: carpeta privada, solo el admin puede verlas
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

create policy "admin ve comprobantes"
  on storage.objects for select
  using (bucket_id = 'comprobantes' and public.es_admin());
