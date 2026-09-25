-- Racha: tablas de la Fase 0. Se corre una sola vez en Supabase > SQL Editor.

-- compradores: los correos que pagaron (lo llenará Hotmart; por ahora, a mano)
create table public.compradores (
  email text primary key check (email = lower(email)),
  activo boolean not null default true,
  creado_en timestamptz default now()
);

alter table public.compradores enable row level security;

-- Cada persona solo puede ver si SU correo compró
create policy "ver solo mi compra"
  on public.compradores
  for select
  using (email = lower(auth.jwt()->>'email'));

-- estado: una copia completa de la Racha de cada persona
create table public.estado (
  user_id uuid primary key references auth.users on delete cascade,
  datos jsonb not null,
  version int not null default 1,
  actualizado_en timestamptz not null default now(),
  check (pg_column_size(datos) < 1000000)
);

alter table public.estado enable row level security;

-- Cada persona solo lee y guarda SU Racha, y solo si su compra está activa
create policy "solo mi racha"
  on public.estado
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.compradores
      where email = lower(auth.jwt()->>'email') and activo = true
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.compradores
      where email = lower(auth.jwt()->>'email') and activo = true
    )
  );
