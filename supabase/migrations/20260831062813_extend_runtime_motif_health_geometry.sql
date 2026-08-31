-- Public-safe mirror of production migration 20260831062813.
-- Extends the deterministic runtime bundle with the current geometry-resolved count.

create or replace function public.cuhalide_atlas_runtime_contract_bundle_r7_v1()
returns jsonb
language sql
stable security definer
set search_path to 'public','pg_temp'
as $function$
with current_health as (
  select public.cuhalide_atlas_current_curated_health_v1() as payload
), frozen_health as (
  select public.cuhalide_atlas_public_health_v302_runtime_v1() as payload
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
    'geometry_resolved', count(*) filter (where motif_geometry <> 'Unresolved'),
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
