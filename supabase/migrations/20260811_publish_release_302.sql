-- Publish the already validated scientific hotfix release 3.0.2.
-- Preconditions: v302 release projections/RAG index exist and public health is green.
-- The historical 3.0.1 archive is not modified; only its errata state is marked
-- superseded/resolved by the new physical snapshot.

do $$
declare
  patch public.cuhalide_atlas_patch_releases%rowtype;
  combined_sha text;
  published_ts timestamptz := now();
begin
  select * into patch
  from public.cuhalide_atlas_patch_releases
  where version='3.0.2'
  for update;

  if patch.version is null then raise exception 'release 3.0.2 candidate is missing'; end if;
  if patch.status not in ('validated','published') then
    raise exception 'release 3.0.2 must be validated before publication; current status=%', patch.status;
  end if;
  if not coalesce((public.cuhalide_atlas_public_health_v302()->>'ok')::boolean,false) then
    raise exception 'release 3.0.2 public/scientific health contract is not green';
  end if;

  combined_sha := encode(digest(concat_ws('|',
    'CuHalide-Atlas-3.0.2',
    patch.snapshots->>'normalized_articles',
    patch.snapshots->>'normalized_structures',
    patch.snapshots->>'verified',
    patch.snapshots->>'polar',
    'rag-benchmark-v1.6',
    '04bd93ec-cc3a-424b-9d8d-a1b08cec58ff'
  ), 'sha256'), 'hex');

  insert into public.cuhalide_atlas_release (
    version,release_date,article_count,included_article_count,structure_count,
    strict_polar_structure_count,evidence_hash_count,corpus_sha256,data,published_at
  ) values (
    '3.0.2','2026-08-11',346,335,878,67,764,combined_sha,
    jsonb_build_object(
      'parent_version','3.0.1','lineage_root','3.0.0','patch_type','scientific',
      'canonical_verified_articles',332,'resolved_space_group_rows',650,
      'verified_space_group_rows',625,'verified_polar_rows',87,'strict_polar_articles',42,
      'snapshots',patch.snapshots,'change_counts',patch.change_counts,
      'validation',patch.validation || jsonb_build_object(
        'publication_health_pass',true,'rag_documents',1224,'rag_embedded',1224,
        'rag_benchmark_version','rag-benchmark-v1.6',
        'rag_benchmark_run_id','04bd93ec-cc3a-424b-9d8d-a1b08cec58ff',
        'rag_benchmark_passed',70,'rag_benchmark_failed',0,
        'record13_physical_corrections',4,'published_at',published_ts
      ),
      'current_curated_model','Frozen Release + Current Curated + Literature Watch',
      'new_literature_records',0
    ), published_ts
  )
  on conflict (version) do update set
    release_date=excluded.release_date,article_count=excluded.article_count,
    included_article_count=excluded.included_article_count,structure_count=excluded.structure_count,
    strict_polar_structure_count=excluded.strict_polar_structure_count,
    evidence_hash_count=excluded.evidence_hash_count,corpus_sha256=excluded.corpus_sha256,
    data=excluded.data,published_at=excluded.published_at;

  update public.cuhalide_atlas_releases set is_current=false where is_current=true and version<>'3.0.2';
  insert into public.cuhalide_atlas_releases (
    version,release_date,article_count,structure_count,strict_polar_count,
    resolved_space_group_count,metadata,published_at,is_current
  ) values (
    '3.0.2','2026-08-11',346,878,67,650,
    jsonb_build_object(
      'parent_version','3.0.1','lineage_root','3.0.0','patch_type','scientific',
      'canonical_verified_articles',332,'included_articles',335,
      'verified_space_group_rows',625,'verified_polar_rows',87,'strict_polar_articles',42,
      'rag_documents',1224,'rag_embedded',1224,'rag_embedding_model','@cf/baai/bge-m3',
      'rag_benchmark_version','rag-benchmark-v1.6',
      'rag_benchmark_run','04bd93ec-cc3a-424b-9d8d-a1b08cec58ff',
      'rag_benchmark_passed',70,'rag_benchmark_failed',0,
      'record13_physical_corrections',4,'new_literature_records',0,
      'current_curated_base_release','3.0.2','public_access','query-and-view'
    ),published_ts,true
  )
  on conflict (version) do update set
    release_date=excluded.release_date,article_count=excluded.article_count,
    structure_count=excluded.structure_count,strict_polar_count=excluded.strict_polar_count,
    resolved_space_group_count=excluded.resolved_space_group_count,metadata=excluded.metadata,
    published_at=excluded.published_at,is_current=true;

  update public.cuhalide_atlas_patch_releases
  set status='published',published_at=coalesce(published_at,published_ts),
      summary='Scientific hotfix published: four confirmed Record 13 structure-level Structural Dimensionality corrections are physically incorporated. No new literature and no frozen denominator changes.',
      validation=coalesce(validation,'{}'::jsonb) || jsonb_build_object(
        'publication_health_pass',true,'rag_benchmark_version','rag-benchmark-v1.6',
        'rag_benchmark_run_id','04bd93ec-cc3a-424b-9d8d-a1b08cec58ff',
        'rag_benchmark_passed',70,'rag_benchmark_failed',0,'rag_documents',1224,'rag_embedded',1224
      )
  where version='3.0.2';

  update public.cuhalide_atlas_release_errata
  set status='superseded',display_overlay_enabled=false,
      reviewed_at=coalesce(reviewed_at,published_ts),
      provenance=coalesce(provenance,'{}'::jsonb) || jsonb_build_object(
        'resolved_in_release','3.0.2','resolution_type','physical scientific hotfix snapshot',
        'historical_release_immutable',true
      )
  where release_version='3.0.1' and planned_correction_release='3.0.2';

  update public.cuhalide_atlas_current_curated_state
  set base_release='3.0.2',current_curated_through='2026-08-11',live_revision=0,
      status='ready',last_qc_at=coalesce(last_qc_at,published_ts),
      note='Rolling Current Curated baseline equals published frozen release 3.0.2. No post-release literature has yet been promoted.',
      updated_at=greatest(updated_at,published_ts)
  where state_key='current';
end
$$;
