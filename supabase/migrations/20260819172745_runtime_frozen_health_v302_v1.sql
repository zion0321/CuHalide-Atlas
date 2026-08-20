-- Fast request-time attestation for immutable Frozen Release 3.0.2.
-- The deeper historical search/RAG release audit remains available as
-- public.cuhalide_atlas_public_health_v302(), but is intentionally not run
-- on every public health request because it is substantially more expensive.

create or replace function public.cuhalide_atlas_public_health_v302_runtime_v1()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
with article_counts as (
  select
    count(*)::int as articles,
    count(*) filter (where release_status='Core - Verified')::int as canonical_articles
  from public.cuhalide_atlas_public_articles_v302
), structure_counts as (
  select
    count(*)::int as structures,
    count(*) filter (where eligibility='Core - Included')::int as core_included_structures,
    count(*) filter (where sg_confidence in ('High','Medium'))::int as resolved_space_groups,
    count(*) filter (where eligibility='Core - Included' and sg_confidence in ('High','Medium') and mapping_confidence in ('High','Medium'))::int as verified,
    count(*) filter (where polar='Yes' and eligibility='Core - Included' and sg_confidence='High' and mapping_confidence='High')::int as strict_polar
  from public.cuhalide_atlas_public_structures_v302
), state as (
  select base_release, current_curated_through, live_revision, status
  from public.cuhalide_atlas_current_curated_state
  where state_key='current'
  limit 1
), payload as (
  select a.*, s.*, st.base_release, st.current_curated_through, st.live_revision, st.status,
    (a.articles=346) as article_projection_rows,
    (a.canonical_articles=332) as canonical_article_projection,
    (s.structures=878) as structure_projection_rows,
    (s.core_included_structures=816) as core_structure_projection,
    (s.resolved_space_groups=650) as resolved_space_group_projection,
    (s.verified=625) as verified_structure_projection,
    (s.strict_polar=67) as strict_polar_projection,
    (st.base_release='3.0.2' and st.status in ('validated_base_pending_publish','ready','updating','frozen_for_release')) as current_curated_state
  from article_counts a cross join structure_counts s cross join state st
)
select jsonb_build_object(
  'ok', article_projection_rows and canonical_article_projection and structure_projection_rows and core_structure_projection and resolved_space_group_projection and verified_structure_projection and strict_polar_projection and current_curated_state,
  'release','3.0.2',
  'version','public-health-v302-runtime-1.0.0',
  'checks',jsonb_build_object(
    'article_projection_rows',article_projection_rows,
    'canonical_article_projection',canonical_article_projection,
    'structure_projection_rows',structure_projection_rows,
    'core_structure_projection',core_structure_projection,
    'resolved_space_group_projection',resolved_space_group_projection,
    'verified_structure_projection',verified_structure_projection,
    'strict_polar_projection',strict_polar_projection,
    'current_curated_state',current_curated_state,
    'deep_release_audit','public.cuhalide_atlas_public_health_v302() remains the full release-regression audit and is intentionally not executed on every public request'
  ),
  'counts',jsonb_build_object(
    'articles',articles,
    'canonical_articles',canonical_articles,
    'structures',structures,
    'core_included_structures',core_included_structures,
    'resolved_space_groups',resolved_space_groups,
    'verified',verified,
    'strict_polar',strict_polar
  ),
  'temporal_scope',jsonb_build_object(
    'frozen_release',jsonb_build_object('literature_cutoff','2026-06','cutoff_inclusive_through','2026-06-30','immutable',true),
    'current_curated',jsonb_build_object('curated_through',current_curated_through,'live_revision',live_revision,'status',status)
  )
) from payload;
$function$;

revoke all on function public.cuhalide_atlas_public_health_v302_runtime_v1() from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_public_health_v302_runtime_v1() to service_role;

comment on function public.cuhalide_atlas_public_health_v302_runtime_v1() is
  'Fast service-role runtime attestation for immutable Frozen Release 3.0.2. Recomputes authoritative projection denominators on each call; the deeper historical search/RAG regression audit remains available as cuhalide_atlas_public_health_v302().';

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
