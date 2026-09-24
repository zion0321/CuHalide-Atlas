-- CuXplore full-text v2 production cutover, 24 September 2026.
-- Preserve the semantic article/structure RAG as a separate index.
-- Promote the recovered 727-document / 6,275-chunk corpus to the primary private lexical retrieval layer.

alter table atlas_internal.cuxplore_source_document_v2 enable row level security;
alter table atlas_internal.cuxplore_text_chunk_v2 enable row level security;
revoke all on atlas_internal.cuxplore_source_document_v2, atlas_internal.cuxplore_text_chunk_v2 from public, anon, authenticated;
grant select,insert,update,delete on atlas_internal.cuxplore_source_document_v2, atlas_internal.cuxplore_text_chunk_v2 to service_role;

create index if not exists cuxplore_text_chunk_v2_fts_idx
on atlas_internal.cuxplore_text_chunk_v2 using gin(fts);
create index if not exists cuxplore_text_chunk_v2_doi_idx
on atlas_internal.cuxplore_text_chunk_v2(lower(doi));
create index if not exists cuxplore_source_document_v2_doi_idx
on atlas_internal.cuxplore_source_document_v2(lower(doi));

create or replace view atlas_internal.cuxplore_source_inventory_active_v2 as
select
  d.drive_file_id as file_key,
  lower(d.doi) as doi,
  d.record_id,
  d.source_role,
  0::integer as text_pages,
  d.chunk_count::bigint as passage_count,
  d.extraction_status,
  d.updated_at as imported_at,
  d.char_count::bigint as char_count,
  'v2_fulltext_20260924'::text as source_generation,
  'char_range'::text as locator_type
from atlas_internal.cuxplore_source_document_v2 d
union all
select
  i.file_key,
  lower(i.doi),
  c.record_id,
  i.source_role,
  coalesce(i.text_pages,0)::integer,
  i.passage_count::bigint,
  i.extraction_status,
  i.imported_at,
  null::bigint,
  'legacy_v1_fallback'::text,
  'page'::text
from atlas_internal.cuxplore_source_inventory_v1 i
left join atlas_internal.cuhalide_knowledge_catalog_v1 c on lower(c.doi)=lower(i.doi)
where not exists (
  select 1 from atlas_internal.cuxplore_source_document_v2 d2
  where lower(d2.doi)=lower(i.doi)
);
revoke all on atlas_internal.cuxplore_source_inventory_active_v2 from public,anon,authenticated;
grant select on atlas_internal.cuxplore_source_inventory_active_v2 to service_role;

create or replace view atlas_internal.cuxplore_processing_v1 as
with inventory as materialized (
 select doi,
 count(*) filter(where source_role in ('main_article','main_article_version','combined_main_and_si') and passage_count>0 and extraction_status='native_text')::integer main_text_files,
 count(*) filter(where source_role='supporting_information' and passage_count>0 and extraction_status='native_text')::integer si_text_files,
 count(*) filter(where source_role='cif' and passage_count>0)::integer cif_text_files,
 count(*) filter(where extraction_status in ('scan_or_sparse_text','sparse_text'))::integer sparse_scan_files,
 coalesce(sum(passage_count) filter(where source_role in ('main_article','main_article_version','combined_main_and_si','supporting_information') and extraction_status='native_text'),0)::integer prose_passages,
 coalesce(sum(text_pages) filter(where source_role in ('main_article','main_article_version','combined_main_and_si','supporting_information') and extraction_status='native_text'),0)::integer native_text_pages,
 coalesce(sum(char_count) filter(where source_role in ('main_article','main_article_version','combined_main_and_si','supporting_information') and extraction_status='native_text'),0)::bigint native_text_characters,
 coalesce(sum(passage_count) filter(where source_generation='v2_fulltext_20260924'),0)::integer v2_chunks_all_status,
 count(*) filter(where source_generation='v2_fulltext_20260924')::integer v2_source_files,
 max(imported_at) text_index_updated_at,
 bool_or(source_role in ('main_article','main_article_version','combined_main_and_si')) main_registered,
 bool_or(source_role='supporting_information') si_registered,
 bool_or(source_role='cif') cif_registered
 from atlas_internal.cuxplore_source_inventory_active_v2 group by doi
), registered as materialized (
 select record_id,
 bool_or(source_role in ('main_article','combined_main_and_si','main_article_version')) main_registered,
 bool_or(source_role='supporting_information') si_registered,
 bool_or(source_role='cif') cif_registered
 from atlas_internal.cuhalide_drive_source_catalog_v1 where record_id is not null group by record_id
), structures as materialized (
 select record_id,count(*)::integer structure_records,
 count(*) filter(where coalesce(lower(trim(space_group)),'') not in ('','unresolved','unknown','not reported'))::integer structures_with_space_group
 from public.cuhalide_atlas_public_structures_current_v1 where eligibility='Core - Included' group by record_id
), samples as materialized (
 select record_id,count(*)::integer sample_records from atlas_internal.cuhalide_photophysics_sample_state_v1 group by record_id
)
select c.source_id,c.doi,c.record_id,
 coalesce(r.main_registered,false) or coalesce(i.main_registered,false) or coalesce(l.main_status in ('archived','present_in_project_source_corpus'),false) main_source_registered,
 coalesce(r.si_registered,false) or coalesce(i.si_registered,false) or coalesce(l.si_status='SI_AVAILABLE_ARCHIVED',false) si_source_registered,
 coalesce(r.cif_registered,false) or coalesce(i.cif_registered,false) or coalesce(l.cif_status in ('CIF_ARCHIVED','present_in_project_source_corpus'),false) cif_source_registered,
 coalesce(i.main_text_files,0) main_text_files,
 coalesce(i.si_text_files,0) si_text_files,
 coalesce(i.cif_text_files,0) cif_text_files,
 coalesce(i.sparse_scan_files,0) sparse_scan_files,
 coalesce(i.prose_passages,0) prose_passages,
 coalesce(i.native_text_pages,0) native_text_pages,
 n.doi is not null has_source_review_note,
 coalesce(s.structure_records,0) structure_records,
 coalesce(s.structures_with_space_group,0) structures_with_space_group,
 case p.review_status when 'qc_passed' then 'reviewed_measurements' when 'complete_no_data' then 'reviewed_no_reported_data' else 'not_reviewed_in_current_data_release' end photophysics_status,
 coalesce(sam.sample_records,0) sample_records,
 i.text_index_updated_at,l.inventory_date source_inventory_date,
 case when coalesce(i.main_text_files,0)>0 then 'text_indexed'
      when coalesce(i.sparse_scan_files,0)>0 then 'scan_not_text_indexed'
      when coalesce(r.main_registered,false) or coalesce(i.main_registered,false) or coalesce(l.main_status in ('archived','present_in_project_source_corpus'),false) then 'registered_not_text_indexed'
      else 'not_confirmed' end main_source_status,
 case when coalesce(i.si_text_files,0)>0 then 'text_indexed'
      when coalesce(r.si_registered,false) or coalesce(i.si_registered,false) or coalesce(l.si_status='SI_AVAILABLE_ARCHIVED',false) then 'registered_not_text_indexed'
      when l.si_status='NO_SI_PUBLISHED' then 'not_published'
      else 'not_confirmed' end si_source_status,
 case when coalesce(i.cif_text_files,0)>0 then 'file_parsed'
      when coalesce(r.cif_registered,false) or coalesce(i.cif_registered,false) or coalesce(l.cif_status in ('CIF_ARCHIVED','present_in_project_source_corpus'),false) then 'registered_not_parsed'
      when l.cif_status='CIF_EXTERNAL_DEPOSITION_COMPLETE' then 'external_deposition_registered'
      when l.cif_status='CIF_NOT_APPLICABLE' then 'not_applicable'
      else 'not_confirmed' end cif_source_status,
 (l.si_status='NO_SI_PUBLISHED' and (coalesce(i.si_registered,false) or coalesce(r.si_registered,false))
   or l.cif_status='CIF_NOT_APPLICABLE' and (coalesce(i.cif_registered,false) or coalesce(r.cif_registered,false))) is true source_inventory_conflict,
 coalesce(i.native_text_characters,0) native_text_characters,
 coalesce(i.v2_chunks_all_status,0) v2_chunks_all_status,
 coalesce(i.v2_source_files,0) v2_source_files
from atlas_internal.cuhalide_knowledge_catalog_v1 c
left join inventory i on lower(i.doi)=lower(c.doi)
left join registered r on r.record_id=c.record_id
left join structures s on s.record_id=c.record_id
left join samples sam on sam.record_id=c.record_id
left join atlas_internal.cuhalide_source_review_notes_v1 n on lower(n.doi)=lower(c.doi)
left join atlas_internal.cuhalide_photophysics_article_review_v1 p on p.record_id=c.record_id
left join atlas_internal.cuxplore_library_declarations_v1 l on lower(l.doi)=lower(c.doi);
revoke all on atlas_internal.cuxplore_processing_v1 from public,anon,authenticated;
grant select on atlas_internal.cuxplore_processing_v1 to service_role;

create or replace function public.cuxplore_primary_matches_v1(p_query text,p_limit integer default 12)
returns jsonb language sql stable security definer set search_path='' as $f$
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
 cross join q
 where c.fts @@ q.ts
   and d.extraction_status='native_text'
   and d.source_role in ('main_article','main_article_version','supporting_information')
   and exists(select 1 from atlas_internal.cuhalide_knowledge_catalog_v1 k where lower(k.doi)=lower(d.doi))
 union all
 select d.doi,d.source_role,p.page,p.page,
        null::integer,null::integer,null::integer,
        'page'::text,'legacy_v1_fallback'::text,
        ts_rank_cd(p.fts,q.ts,32)
 from atlas_internal.cuxplore_passages_v1 p
 join atlas_internal.cuxplore_documents_v1 d using(file_sha256)
 cross join q
 where p.fts @@ q.ts and not p.reference_page and d.extraction_status='native_text'
   and not exists(select 1 from atlas_internal.cuxplore_source_document_v2 d2 where lower(d2.doi)=lower(d.doi))
   and exists(select 1 from atlas_internal.cuhalide_knowledge_catalog_v1 k where lower(k.doi)=lower(d.doi))
 union all
 select lower(a.doi),f.source_role,p.page_start,p.page_end,
        null::integer,null::integer,null::integer,
        'page'::text,'legacy_v1_fallback'::text,
        ts_rank_cd(p.fts,q.ts,32)
 from atlas_internal.cuhalide_private_evidence_text_chunk_v1 p
 join atlas_internal.cuhalide_private_evidence_file_v1 f using(file_id)
 join public.cuhalide_atlas_public_articles_current_v1 a on a.record_id=f.record_id
 cross join q
 where f.source_role in ('main_article','combined_main_and_si','supporting_information')
   and p.fts @@ q.ts
   and not exists(select 1 from atlas_internal.cuxplore_source_document_v2 d2 where lower(d2.doi)=lower(a.doi))
   and exists(select 1 from atlas_internal.cuhalide_knowledge_catalog_v1 k where lower(k.doi)=lower(a.doi))
), best as (
 select r.*,row_number() over(partition by doi order by score desc,coalesce(page_start,2147483647),coalesce(chunk_index,2147483647)) rn
 from ranked r
), selected as (
 select * from best where rn=1 order by score desc,doi limit least(500,greatest(1,p_limit))
)
select coalesce(jsonb_agg(jsonb_build_object(
 'doi',doi,'source_role',source_role,'page_start',page_start,'page_end',page_end,
 'chunk_index',chunk_index,'char_start',char_start,'char_end',char_end,
 'locator_type',locator_type,'source_generation',source_generation,
 'score',round(score::numeric,6),'text_match',true,'quotation_exposed',false
) order by score desc,doi),'[]'::jsonb) from selected;
$f$;
revoke all on function public.cuxplore_primary_matches_v1(text,integer) from public,anon,authenticated;
grant execute on function public.cuxplore_primary_matches_v1(text,integer) to service_role;

create or replace function public.cuxplore_fulltext_v2_health()
returns jsonb language sql stable security definer set search_path='' as $f$
with d as (
 select count(*)::int documents,
        count(distinct lower(doi))::int dois,
        sum(char_count)::bigint characters,
        sum(chunk_count)::bigint declared_chunks,
        count(*) filter(where extraction_status='native_text')::int native_files,
        count(*) filter(where extraction_status='sparse_text')::int sparse_files,
        count(*) filter(where extraction_status='empty_or_unreadable')::int empty_files
 from atlas_internal.cuxplore_source_document_v2
), c as (
 select count(*)::bigint actual_chunks,
        count(distinct drive_file_id)::int chunked_files,
        count(distinct lower(doi))::int chunked_dois
 from atlas_internal.cuxplore_text_chunk_v2
), m as (
 select count(*)::int mismatch_docs from (
   select sd.drive_file_id,sd.chunk_count,count(tc.*)::int actual
   from atlas_internal.cuxplore_source_document_v2 sd
   left join atlas_internal.cuxplore_text_chunk_v2 tc using(drive_file_id)
   group by sd.drive_file_id,sd.chunk_count
   having sd.chunk_count<>count(tc.*)
 ) x
), r as (
 select
   coalesce(sum(sd.chunk_count) filter(where sd.extraction_status='native_text'),0)::bigint native_searchable_chunks,
   coalesce(sum(sd.chunk_count) filter(where sd.extraction_status='sparse_text'),0)::bigint sparse_chunks,
   coalesce(sum(sd.chunk_count) filter(where sd.extraction_status='native_text'
     and exists(select 1 from atlas_internal.cuhalide_knowledge_catalog_v1 k where lower(k.doi)=lower(sd.doi))),0)::bigint catalog_searchable_chunks,
   count(distinct lower(sd.doi)) filter(where sd.extraction_status='native_text'
     and exists(select 1 from atlas_internal.cuhalide_knowledge_catalog_v1 k where lower(k.doi)=lower(sd.doi)))::int catalog_searchable_dois
 from atlas_internal.cuxplore_source_document_v2 sd
)
select jsonb_build_object(
 'ok',(d.documents=727 and d.dois=403 and d.characters=21421324 and d.declared_chunks=6275 and c.actual_chunks=6275 and m.mismatch_docs=0),
 'release','cuxplore-fulltext-v2-20260924',
 'documents',d.documents,'dois',d.dois,'characters',d.characters,
 'declared_chunks',d.declared_chunks,'actual_chunks',c.actual_chunks,
 'chunked_files',c.chunked_files,'chunked_dois',c.chunked_dois,
 'native_files',d.native_files,'sparse_files',d.sparse_files,'empty_files',d.empty_files,
 'native_searchable_chunks',r.native_searchable_chunks,'sparse_chunks',r.sparse_chunks,
 'catalog_searchable_chunks',r.catalog_searchable_chunks,'catalog_searchable_dois',r.catalog_searchable_dois,
 'mismatch_docs',m.mismatch_docs,
 'semantic_index_separate',true,'raw_source_text_exposed',false
) from d,c,m,r;
$f$;
revoke all on function public.cuxplore_fulltext_v2_health() from public,anon,authenticated;
grant execute on function public.cuxplore_fulltext_v2_health() to service_role;

notify pgrst,'reload schema';
