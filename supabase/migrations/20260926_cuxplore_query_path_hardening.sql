-- CuXplore query-path hardening and reproducible acceleration snapshots.
-- Applied to production on 2026-09-26 after semantic-equivalence probes.
-- Refresh these materialized snapshots whenever literature membership, source-processing state,
-- or authored source-review notes change.

create materialized view if not exists atlas_internal.cuxplore_catalog_doi_snapshot_v1 as
select distinct lower(doi) as doi
from atlas_internal.cuhalide_knowledge_catalog_v1
where doi is not null and btrim(doi) <> '';

create unique index if not exists cuxplore_catalog_doi_snapshot_v1_doi_uidx
  on atlas_internal.cuxplore_catalog_doi_snapshot_v1 (doi);

comment on materialized view atlas_internal.cuxplore_catalog_doi_snapshot_v1 is
'Query-acceleration snapshot of the DOI-deduplicated CuXplore literature catalog. Refresh whenever catalog membership changes; user-facing article authority remains atlas_internal.cuhalide_knowledge_catalog_v1.';

create materialized view if not exists atlas_internal.cuxplore_processing_coverage_snapshot_v1 as
select jsonb_build_object(
  'main_text_articles',count(*) filter(where main_text_files>0),
  'si_text_articles',count(*) filter(where si_text_files>0),
  'cif_text_articles',count(*) filter(where cif_text_files>0),
  'any_prose_articles',count(*) filter(where prose_passages>0),
  'prose_passages',sum(prose_passages),
  'sparse_scan_articles',count(*) filter(where sparse_scan_files>0),
  'registered_main_articles',count(*) filter(where main_source_registered),
  'registered_si_articles',count(*) filter(where si_source_registered),
  'registered_cif_articles',count(*) filter(where cif_source_registered),
  'articles_with_structures',count(*) filter(where structure_records>0),
  'photophysics_reviewed_articles',count(*) filter(where photophysics_status='reviewed_measurements'),
  'photophysics_no_data_articles',count(*) filter(where photophysics_status='reviewed_no_reported_data'),
  'text_index_updated_at',max(text_index_updated_at),
  'native_text_is_field_review',false,
  'cif_text_is_prose',false,
  'counts_basis','DOI-deduplicated current literature catalog'
) as processing_coverage
from atlas_internal.cuxplore_processing_v1;

comment on materialized view atlas_internal.cuxplore_processing_coverage_snapshot_v1 is
'One-row CuXplore processing-coverage snapshot used to avoid recomputing source inventory joins on every public retrieval request. Refresh with the source-index/catalog synchronization workflow.';

create materialized view if not exists atlas_internal.cuxplore_search_document_snapshot_v1 as
select
  c.source_id,c.record_id,c.doi,c.title,c.year,c.journal,c.evidence_scope,c.source_layer,
  c.category,c.halogen,c.summary,c.search_text,
  n.statement,n.qualification,n.reviewed_at,
  to_jsonb(p)-'doi'-'record_id'-'source_id' as processing,
  p.prose_passages,p.structure_records,
  setweight(to_tsvector('english',coalesce(c.title,'')),'A')
  ||setweight(to_tsvector('english',coalesce(n.statement,'')||' '||coalesce(n.qualification,'')),'B')
  ||setweight(to_tsvector('english',c.search_text),'C') as vec
from atlas_internal.cuhalide_knowledge_catalog_v1 c
join atlas_internal.cuxplore_processing_v1 p on p.source_id=c.source_id
left join atlas_internal.cuhalide_source_review_notes_v1 n on c.doi=n.doi;

create unique index if not exists cuxplore_search_document_snapshot_v1_source_uidx
  on atlas_internal.cuxplore_search_document_snapshot_v1(source_id);
create index if not exists cuxplore_search_document_snapshot_v1_doi_idx
  on atlas_internal.cuxplore_search_document_snapshot_v1(lower(doi));
create index if not exists cuxplore_search_document_snapshot_v1_scope_idx
  on atlas_internal.cuxplore_search_document_snapshot_v1(evidence_scope);
create index if not exists cuxplore_search_document_snapshot_v1_vec_gin
  on atlas_internal.cuxplore_search_document_snapshot_v1 using gin(vec);

comment on materialized view atlas_internal.cuxplore_search_document_snapshot_v1 is
'Service-only search projection for CuXplore. Precomputes document vectors and processing metadata from authoritative catalog, processing and source-review layers; refresh with cuxplore_refresh_query_snapshots_v1 whenever those layers change.';

revoke all on atlas_internal.cuxplore_catalog_doi_snapshot_v1 from public, anon, authenticated;
revoke all on atlas_internal.cuxplore_processing_coverage_snapshot_v1 from public, anon, authenticated;
revoke all on atlas_internal.cuxplore_search_document_snapshot_v1 from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cuxplore_primary_matches_v1(p_query text, p_limit integer DEFAULT 12)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
with q as (
 select to_tsquery('english',replace(plainto_tsquery('english',left(regexp_replace(coalesce(p_query,''),'18[- ]crown[- ]6|18c6','crown ether','gi'),600))::text,' & ',' | ')) as ts
), ranked as (
 select lower(d.doi) doi,d.source_role,
        null::integer page_start,null::integer page_end,
        c.chunk_index,c.char_start,c.char_end,
        'char_range'::text locator_type,'v2_fulltext_20260924'::text source_generation,
        ts_rank_cd(c.fts,q.ts,32) as score
 from atlas_internal.cuxplore_text_chunk_v2 c
 join atlas_internal.cuxplore_source_document_v2 d using(drive_file_id)
 join atlas_internal.cuxplore_catalog_doi_snapshot_v1 k on k.doi=lower(d.doi)
 cross join q
 where c.fts @@ q.ts
   and d.extraction_status='native_text'
   and d.source_role in ('main_article','main_article_version','supporting_information')
 union all
 select d.doi,d.source_role,p.page,p.page,
        null::integer,null::integer,null::integer,
        'page'::text,'legacy_v1_fallback'::text,
        ts_rank_cd(p.fts,q.ts,32)
 from atlas_internal.cuxplore_passages_v1 p
 join atlas_internal.cuxplore_documents_v1 d using(file_sha256)
 join atlas_internal.cuxplore_catalog_doi_snapshot_v1 k on k.doi=lower(d.doi)
 cross join q
 where p.fts @@ q.ts and not p.reference_page and d.extraction_status='native_text'
   and not exists(select 1 from atlas_internal.cuxplore_source_document_v2 d2 where lower(d2.doi)=lower(d.doi))
 union all
 select lower(a.doi),f.source_role,p.page_start,p.page_end,
        null::integer,null::integer,null::integer,
        'page'::text,'legacy_v1_fallback'::text,
        ts_rank_cd(p.fts,q.ts,32)
 from atlas_internal.cuhalide_private_evidence_text_chunk_v1 p
 join atlas_internal.cuhalide_private_evidence_file_v1 f using(file_id)
 join public.cuhalide_atlas_public_articles_current_v1 a on a.record_id=f.record_id
 join atlas_internal.cuxplore_catalog_doi_snapshot_v1 k on k.doi=lower(a.doi)
 cross join q
 where f.source_role in ('main_article','combined_main_and_si','supporting_information')
   and p.fts @@ q.ts
   and not exists(select 1 from atlas_internal.cuxplore_source_document_v2 d2 where lower(d2.doi)=lower(a.doi))
), best as (
 select r.*,row_number() over(partition by doi order by score desc,coalesce(page_start,2147483647),coalesce(chunk_index,2147483647)) rn
 from ranked r
), selected as (
 select * from best where rn=1 order by score desc,doi limit least(32,greatest(1,p_limit))
)
select coalesce(jsonb_agg(jsonb_build_object(
 'doi',doi,'source_role',source_role,'page_start',page_start,'page_end',page_end,
 'chunk_index',chunk_index,'char_start',char_start,'char_end',char_end,
 'locator_type',locator_type,'source_generation',source_generation,
 'score',round(score::numeric,6),'text_match',true,'quotation_exposed',false
) order by score desc,doi),'[]'::jsonb) from selected;
$function$


revoke all on function public.cuxplore_primary_matches_v1(text,integer) from public, anon, authenticated;
grant execute on function public.cuxplore_primary_matches_v1(text,integer) to service_role;

CREATE OR REPLACE FUNCTION public.cuxplore_knowledge_v1(p_action text DEFAULT 'coverage'::text, p_query text DEFAULT ''::text, p_scope text DEFAULT 'all'::text, p_limit integer DEFAULT 12, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  x jsonb;
  cov jsonb;
  fulltext jsonb;
  cif jsonb;
  cc record;
  catalog_articles integer;
  source_review_notes integer;
  reviewed_through text;
  q text;
  exact_doi boolean;
  terms tsquery;
  matches jsonb:='[]'::jsonb;
  lex text[];
begin
  if p_action is null
     or p_action not in ('coverage','articles','retrieve')
     or p_scope is null
     or p_scope not in ('all','curated','context','reviewed','text')
     or length(coalesce(p_query,''))>600
     or p_limit is null
     or p_offset is null
     or p_limit not between 1 and 20
     or p_offset not between 0 and 1000
  then raise exception 'Invalid query';
  end if;

  q:=trim(regexp_replace(coalesce(p_query,''),'^https?://(dx[.])?doi[.]org/','','i'));
  exact_doi:=q ~* '^10[.][0-9]{4,9}/[^[:space:]]+$';
  if p_action='retrieve' and length(q)<2 then raise exception 'A query is required'; end if;
  if not exact_doi then
    q:=regexp_replace(q,'18[- ]crown[- ]6|18c6','crown ether','gi');
    q:=replace(replace(replace(replace(q,'冠醚','crown ether'),'阳离子','cation ammonium'),'发光','photoluminescence'),'氢键','hydrogen bond');
  end if;

  select * into cc
  from public.cuhalide_atlas_current_curated_state
  where state_key='current';

  if cc.state_key is null or cc.live_revision<>10 then
    raise exception 'Current Curated state unavailable or out of sync';
  end if;

  select count(*)::int into catalog_articles
  from atlas_internal.cuxplore_catalog_doi_snapshot_v1;

  if catalog_articles<1 then raise exception 'CuXplore catalog snapshot unavailable'; end if;

  select count(*)::int,
         to_char(max(reviewed_at)::date,'YYYY-MM-DD')
    into source_review_notes,reviewed_through
  from atlas_internal.cuhalide_source_review_notes_v1;

  x:=jsonb_build_object(
    'ok',true,
    'method','live relational projection',
    'coverage',jsonb_build_object(
      'rag_embedded',cc.rag_embedded,
      'rag_documents',cc.rag_documents,
      'core_structures',cc.core_included_structure_rows,
      'curated_through',cc.current_curated_through,
      'catalog_articles',catalog_articles,
      'context_articles',catalog_articles-cc.canonical_verified_articles,
      'curated_articles',cc.canonical_verified_articles,
      'reviewed_through',reviewed_through,
      'knowledge_contract','1.3.0',
      'source_review_notes',source_review_notes,
      'metadata_is_full_text',false,
      'current_curated_revision',cc.live_revision
    ),
    'write_access',false
  );

  fulltext:=public.cuxplore_fulltext_v2_health();
  if coalesce((fulltext->>'ok')::boolean,false) is not true then
    raise exception 'CuXplore full-text runtime snapshot unavailable or stale';
  end if;

  select processing_coverage into cov
  from atlas_internal.cuxplore_processing_coverage_snapshot_v1
  limit 1;
  if cov is null then raise exception 'CuXplore processing coverage snapshot unavailable'; end if;

  select jsonb_build_object(
    'release',release_key,
    'registered_files',registered_files,
    'parsed_files',parsed_files,
    'cu_structure_blocks',cu_structure_blocks,
    'identity_review_rows',identity_review_rows,
    'identity_resolved_rows',identity_resolved_rows,
    'quarantined_rows',quarantined_rows,
    'dimensionality_flags',dimensionality_flags,
    'dimensionality_adjudicated',dimensionality_adjudicated,
    'authority_rows',authority_rows,
    'core_included_rows',core_included_rows,
    'authority_overwritten',authority_overwritten,
    'updated_at',updated_at
  ) into cif
  from atlas_internal.cuxplore_cif_reconciliation_state_v1
  where release_key='cif-reconciliation-20260924';

  if cif is null then raise exception 'CuXplore CIF reconciliation snapshot unavailable'; end if;

  x:=x||jsonb_build_object(
    'brand','CuXplore',
    'dataset','CuHalide Atlas',
    'knowledge_contract','1.3.0',
    'processing_coverage',cov,
    'fulltext_v2',fulltext,
    'cif_reconciliation',cif,
    'source_indexed_through','2026-09-24',
    'query',p_query,
    'normalized_query',q,
    'scope',p_scope,
    'limit',p_limit,
    'offset',p_offset
  );
  x:=jsonb_set(x,'{coverage,knowledge_contract}','"1.3.0"'::jsonb);

  if p_action='coverage' then return x; end if;

  if q<>'' and not exact_doi then matches:=public.cuxplore_primary_matches_v1(q,500); end if;
  terms:=to_tsquery('english',replace(plainto_tsquery('english',q)::text,' & ',' | '));
  lex:=tsvector_to_array(to_tsvector('english',q));

  with docs as (
    select d.*,m.value as primary_match
    from atlas_internal.cuxplore_search_document_snapshot_v1 d
    left join jsonb_array_elements(matches) m on m.value->>'doi'=d.doi
    where p_scope='all'
       or p_scope='curated' and d.evidence_scope='curated_article'
       or p_scope='context' and d.evidence_scope='bibliographic_context'
       or p_scope='reviewed' and d.statement is not null
       or p_scope='text' and d.prose_passages>0
  ),
  scored as (
    select d.*,
           case when exact_doi then 100::real
                else 5*power(
                  (select count(*)::real from unnest(lex) l where l=any(tsvector_to_array(d.vec)))
                  /greatest(1,cardinality(lex)),2
                )+ts_rank_cd(d.vec,terms,32)+coalesce((d.primary_match->>'score')::real,0)
           end as score
    from docs d
    where q=''
       or case when exact_doi then lower(d.doi)=lower(q)
               else d.vec @@ terms or d.primary_match is not null or position(lower(q) in lower(d.title))>0
          end
  ),
  selected as (
    select * from scored order by score desc,year desc nulls last,doi limit p_limit offset p_offset
  )
  select x||jsonb_build_object(
    'total',(select count(*) from scored),
    'primary_match_count',jsonb_array_length(matches),
    'items',coalesce(jsonb_agg(jsonb_build_object(
      'source_id',s.source_id,
      'record_id',s.record_id,
      'doi',s.doi,
      'url','https://doi.org/'||s.doi,
      'title',s.title,
      'year',s.year,
      'journal',s.journal,
      'evidence_scope',s.evidence_scope,
      'source_layer',s.source_layer,
      'category',s.category,
      'halogen',s.halogen,
      'summary',s.summary,
      'score',round(s.score::numeric,6),
      'review',case when s.statement is null then null else jsonb_build_object(
        'statement',s.statement,
        'qualification',s.qualification,
        'reviewed_at',s.reviewed_at,
        'type','authored source-review note; not a publisher quotation'
      ) end,
      'processing',s.processing,
      'primary_match',s.primary_match,
      'structure_count',s.structure_records,
      'structures',coalesce((
        select jsonb_agg(z)
        from (
          select st.structure_id,st.label,st.formula,st.phase,st.space_group,st.dimension_class as dimensionality
          from public.cuhalide_atlas_public_structures_current_v1 st
          where st.record_id=s.record_id and st.eligibility='Core - Included'
          order by st.structure_id
          limit 6
        ) z
      ),'[]'::jsonb)
    ) order by s.score desc,s.year desc nulls last,s.doi),'[]'::jsonb)
  ) into x
  from selected s;

  return x||jsonb_build_object(
    'method','Weighted article/review lexical retrieval plus separately indexed MAIN/SI source matches; v2 character-range locators with legacy page fallback; exact DOI priority',
    'inference_performed',false,
    'raw_source_text_exposed',false,
    'evidence_note','Text extraction, authored review and verified compound properties are independent states. Native text supports retrieval but does not validate a mechanism, structure assignment or measurement. Ranking scores are not confidence.'
  );
end;
$function$


revoke all on function public.cuxplore_knowledge_v1(text,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.cuxplore_knowledge_v1(text,text,text,integer,integer) to service_role;

CREATE OR REPLACE FUNCTION atlas_internal.cuxplore_refresh_query_snapshots_v1()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  catalog_count integer;
  search_document_count integer;
  coverage jsonb;
begin
  refresh materialized view atlas_internal.cuxplore_catalog_doi_snapshot_v1;
  refresh materialized view atlas_internal.cuxplore_processing_coverage_snapshot_v1;
  refresh materialized view atlas_internal.cuxplore_search_document_snapshot_v1;

  select count(*)::int into catalog_count
  from atlas_internal.cuxplore_catalog_doi_snapshot_v1;
  select count(*)::int into search_document_count
  from atlas_internal.cuxplore_search_document_snapshot_v1;
  select processing_coverage into coverage
  from atlas_internal.cuxplore_processing_coverage_snapshot_v1
  limit 1;

  return jsonb_build_object(
    'ok',catalog_count>0 and search_document_count=catalog_count and coverage is not null,
    'catalog_articles',catalog_count,
    'search_documents',search_document_count,
    'processing_coverage',coverage,
    'refreshed_at',clock_timestamp()
  );
end;
$function$


revoke all on function atlas_internal.cuxplore_refresh_query_snapshots_v1() from public, anon, authenticated;
grant execute on function atlas_internal.cuxplore_refresh_query_snapshots_v1() to service_role;
