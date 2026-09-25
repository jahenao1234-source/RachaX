-- compradores
create table public.compradores (
  email text primary key,
  activo boolean not null default true,
  creado_en timestamptz default now()
);

alter table public.compradores enable row level security;

create policy "select solo propio email"
  on public.compradores
  for select
  using (email = lower(auth.jwt()->>'email'));

-- estado
create table public.estado (
  user_id uuid primary key references auth.users on delete cascade,
  datos jsonb not null,
  version int not null default 1,
  actualizado_en timestamptz not null default now(),
  check (pg_column_size(datos) < 1000000)
);

alter table public.estado enable row level security;

create policy "estado rls"
  on public.estado
  for all
  using (
    auth.uid() = user_id and
    exists (
      select 1 from public.compradores
      where email = lower(auth.jwt()->>'email') and activo = true
    )
  );
