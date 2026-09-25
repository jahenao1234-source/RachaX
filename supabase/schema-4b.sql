-- Racha 4b: guardar la Racha en la nube sin que dos aparatos se pisen.
-- Se corre una sola vez en Supabase > SQL Editor, después de schema.sql.

-- Guarda la Racha solo si nadie la cambió desde la versión que este aparato conoce.
-- p_version_base = 0 cuando la cuenta todavía no tiene Racha guardada.
-- Devuelve la versión nueva, o null si hubo conflicto (otro aparato guardó antes).
create or replace function public.guardar_estado(p_datos jsonb, p_version_base int)
returns int
language plpgsql
security invoker            -- respeta las reglas de seguridad (RLS) de la tabla estado
set search_path = public
as $$
declare
  nueva int;
begin
  if p_version_base = 0 then
    insert into public.estado (user_id, datos, version, actualizado_en)
    values (auth.uid(), p_datos, 1, now())
    on conflict (user_id) do nothing
    returning version into nueva;
  else
    update public.estado
       set datos = p_datos,
           version = version + 1,
           actualizado_en = now()
     where user_id = auth.uid()
       and version = p_version_base
    returning version into nueva;
  end if;
  return nueva;
end;
$$;

revoke all on function public.guardar_estado(jsonb, int) from public, anon;
grant execute on function public.guardar_estado(jsonb, int) to authenticated;
