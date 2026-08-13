-- CuHalide Atlas Current Curated rev.1 structure-search boundary hardening
-- Mirrors production migrations applied on 2026-08-13.
-- This is a contract/recovery artifact, not an auto-run migration.
-- No private article/structure row payload is included.

-- Structure search is deliberately restricted to structure identity and
-- crystallographic identifiers. Article titles and article-grain
-- photophysics must never be projected into structure search_safe.
create or replace function public.cuhalide_atlas_current_structure_search_safe_v1()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.search_safe := btrim(concat_ws(' ',
    nullif(new.structure_id, ''),
    nullif(new.label, ''),
    nullif(new.formula, ''),
    nullif(new.phase, ''),
    nullif(new.space_group, ''),
    nullif(new.point_group, ''),
    nullif(new.crystal_system, ''),
    nullif(new.doi, ''),
    nullif(new.ccdc_cif, '')
  ));
  return new;
end;
$$;

drop trigger if exists cuhalide_atlas_current_structure_search_safe_trg
on public.cuhalide_atlas_current_curated_structures;

create trigger cuhalide_atlas_current_structure_search_safe_trg
before insert or update on public.cuhalide_atlas_current_curated_structures
for each row execute function public.cuhalide_atlas_current_structure_search_safe_v1();

-- Existing Current Curated rows were rebuilt through the trigger in production.
-- Recovery validation: this expression must match search_safe for every passed row.
-- btrim(concat_ws(' ', structure_id, label, formula, phase, space_group,
--                 point_group, crystal_system, doi, ccdc_cif))

create or replace function public.cuhalide_atlas_current_curated_health_v1()
returns jsonb
language sql stable security definer
set search_path='public'
as $function$
with a as(
  select count(*)::int n
  from public.cuhalide_atlas_current_curated_articles
  where qc_status='passed'
), s as(
  select
    count(*)::int n,
    count(*) filter(where nullif(trim(space_group),'') is not null)::int resolved,
    count(*) filter(where sg_confidence='High' and mapping_confidence='High' and nullif(trim(space_group),'') is not null)::int verified_sg,
    count(*) filter(where polar='Yes')::int polar_rows,
    count(*) filter(where eligibility='Core - Included' and polar='Yes' and sg_confidence='High' and mapping_confidence='High' and inclusion_status='Included')::int strict_polar,
    count(distinct record_id) filter(where eligibility='Core - Included' and polar='Yes' and sg_confidence='High' and mapping_confidence='High' and inclusion_status='Included')::int strict_polar_articles,
    count(*) filter(where search_safe is distinct from btrim(concat_ws(' ',
      nullif(structure_id,''), nullif(label,''), nullif(formula,''), nullif(phase,''),
      nullif(space_group,''), nullif(point_group,''), nullif(crystal_system,''),
      nullif(doi,''), nullif(ccdc_cif,'')
    )))::int search_contract_mismatches,
    count(*) filter(where article_title <> '' and position(lower(article_title) in lower(search_safe)) > 0)::int article_title_leaks
  from public.cuhalide_atlas_current_curated_structures
  where qc_status='passed'
), r as(
  select count(*)::int docs, count(*) filter(where embedding is not null)::int embedded
  from public.cuhalide_atlas_rag_documents
  where release_version in('3.0.2','current-curated-r1')
)
select jsonb_build_object(
  'ok', a.n=16 and s.n=43 and s.resolved=43 and s.verified_sg=43 and s.polar_rows=10 and s.strict_polar=10 and s.strict_polar_articles=4
        and s.search_contract_mismatches=0 and s.article_title_leaks=0,
  'checks', jsonb_build_object(
    'structure_search_contract', s.search_contract_mismatches=0,
    'structure_article_title_isolation', s.article_title_leaks=0
  ),
  'counts', jsonb_build_object(
    'article_audit_records',346+a.n,
    'chemically_included_articles',335+a.n,
    'canonical_verified_articles',332+a.n,
    'structure_phase_rows',878+s.n,
    'core_included_structure_rows',816+s.n,
    'resolved_space_group_rows',650+s.resolved,
    'verified_space_group_rows',625+s.verified_sg,
    'verified_polar_rows',87+s.polar_rows,
    'strict_polar_rows',67+s.strict_polar,
    'strict_polar_articles',42+s.strict_polar_articles,
    'rag_documents',r.docs,
    'rag_embedded',r.embedded
  ),
  'batch', jsonb_build_object(
    'articles',a.n,
    'structures',s.n,
    'coverage_backfills',(select count(*) from public.cuhalide_atlas_current_curated_articles where qc_status='passed' and coverage_class='coverage_backfill'),
    'post_cutoff_additions',(select count(*) from public.cuhalide_atlas_current_curated_articles where qc_status='passed' and coverage_class='post_cutoff_addition')
  )
)
from a,s,r;
$function$;
