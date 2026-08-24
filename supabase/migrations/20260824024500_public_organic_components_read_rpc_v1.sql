-- Public query-and-view projection for structure-grain organic components.
-- The RPC is callable only by the service role used by the canonical public-data Edge Function.
create or replace function public.cuhalide_atlas_public_organic_components_v1(p_structure_ids text[])
returns table(
  structure_id text,
  component_key text,
  display_name text,
  abbreviation text,
  role text,
  normalization_confidence text
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select
    c.structure_id,
    c.component_key,
    c.display_name,
    c.abbreviation,
    c.role,
    c.normalization_confidence
  from public.cuhalide_atlas_structure_organic_components c
  where c.qc_status = 'passed'
    and c.structure_id = any(p_structure_ids)
  order by c.structure_id, c.role, c.display_name;
$$;

revoke all on function public.cuhalide_atlas_public_organic_components_v1(text[]) from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_public_organic_components_v1(text[]) to service_role;
