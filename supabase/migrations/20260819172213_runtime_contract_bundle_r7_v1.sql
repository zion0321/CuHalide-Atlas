-- Single-roundtrip service-role bundle for deterministic Current Curated rev.7 runtime checks.
-- This function returns only public contract aggregates/current-state metadata.

create or replace function public.cuhalide_atlas_runtime_contract_bundle_r7_v1()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
with current_health as (
  select public.cuhalide_atlas_current_curated_health_v1() as payload
), frozen_health as (
  select public.cuhalide_atlas_public_health_v302() as payload
), current_state as (
  select to_jsonb(s) as payload
  from public.cuhalide_atlas_current_curated_state s
  where s.state_key='current'
  limit 1
), motif as (
  select jsonb_build_object(
    'taxonomy_rows', count(*),
    'resolved', count(*) filter (where motif_formula <> 'Unresolved'),
    'unresolved', count(*) filter (where motif_formula = 'Unresolved'),
    'unresolved_legacy_category_rows', count(*) filter (where primary_category='Unresolved legacy mapping')
  ) as payload
  from public.cuhalide_atlas_structure_taxonomy
  where qc_status='passed'
)
select jsonb_build_object(
  'current', (select payload from current_health),
  'frozen', (select payload from frozen_health),
  'cc', coalesce((select payload from current_state), 'null'::jsonb),
  'm', (select payload from motif)
);
$function$;

revoke all on function public.cuhalide_atlas_runtime_contract_bundle_r7_v1() from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_runtime_contract_bundle_r7_v1() to service_role;

comment on function public.cuhalide_atlas_runtime_contract_bundle_r7_v1() is
  'Service-role-only single-roundtrip bundle for deterministic CuHalide Atlas rev.7 runtime health. Exposes only public contract aggregates and current state metadata; no private evidence.';
