-- Orthogonal processing states: registered sources, native text, reviewed fields.
-- Native text is private and never an automatic source of verified property values.
create or replace view atlas_internal.cuxplore_source_inventory_v1 as
select d.file_sha256 file_key,d.doi,d.source_role,d.page_count,d.text_pages,
 (select count(*) from atlas_internal.cuxplore_passages_v1 p where p.file_sha256=d.file_sha256)::bigint passage_count,
 d.extraction_status,d.imported_at from atlas_internal.cuxplore_documents_v1 d
union all
select f.source_sha256,lower(a.doi),f.source_role,f.page_count,
 (select count(distinct c.page_start)::int from atlas_internal.cuhalide_private_evidence_text_chunk_v1 c where c.file_id=f.file_id),
 (select count(*) from atlas_internal.cuhalide_private_evidence_text_chunk_v1 c where c.file_id=f.file_id),
 case when exists(select 1 from atlas_internal.cuhalide_private_evidence_text_chunk_v1 c where c.file_id=f.file_id) then 'native_text' else 'registered_only' end,
 f.updated_at
from atlas_internal.cuhalide_private_evidence_file_v1 f join public.cuhalide_atlas_public_articles_current_v1 a on a.record_id=f.record_id
where not exists(select 1 from atlas_internal.cuxplore_documents_v1 d where d.file_sha256=f.source_sha256);
revoke all on atlas_internal.cuxplore_source_inventory_v1 from public,anon,authenticated;
grant select on atlas_internal.cuxplore_source_inventory_v1 to service_role;

create or replace view atlas_internal.cuxplore_processing_v1 as
select c.source_id,c.doi,c.record_id,
 exists(select 1 from atlas_internal.cuhalide_drive_source_catalog_v1 f where f.record_id=c.record_id and f.source_role in ('main_article','combined_main_and_si')) OR exists(select 1 from atlas_internal.cuxplore_documents_v1 nd where nd.doi=c.doi and nd.source_role in ('main_article','combined_main_and_si')) as main_source_registered,
 exists(select 1 from atlas_internal.cuhalide_drive_source_catalog_v1 f where f.record_id=c.record_id and f.source_role='supporting_information') OR exists(select 1 from atlas_internal.cuxplore_documents_v1 nd where nd.doi=c.doi and nd.source_role='supporting_information') as si_source_registered,
 exists(select 1 from atlas_internal.cuhalide_drive_source_catalog_v1 f where f.record_id=c.record_id and f.source_role='cif') as cif_source_registered,
 (select count(*) from atlas_internal.cuxplore_source_inventory_v1 f where f.doi=c.doi and f.source_role in ('main_article','combined_main_and_si') and f.passage_count>0)::int as main_text_files,
 (select count(*) from atlas_internal.cuxplore_source_inventory_v1 f where f.doi=c.doi and f.source_role='supporting_information' and f.passage_count>0)::int as si_text_files,
 (select count(*) from atlas_internal.cuxplore_source_inventory_v1 f where f.doi=c.doi and f.source_role='cif' and f.passage_count>0)::int as cif_text_files,
 (select count(*) from atlas_internal.cuxplore_source_inventory_v1 f where f.doi=c.doi and f.extraction_status='scan_or_sparse_text')::int as sparse_scan_files,
 coalesce((select sum(passage_count) from atlas_internal.cuxplore_source_inventory_v1 f where f.doi=c.doi and f.source_role in ('main_article','combined_main_and_si','supporting_information')),0)::int as prose_passages,
 coalesce((select sum(text_pages) from atlas_internal.cuxplore_source_inventory_v1 f where f.doi=c.doi and f.source_role in ('main_article','combined_main_and_si','supporting_information')),0)::int as native_text_pages,
 exists(select 1 from atlas_internal.cuhalide_source_review_notes_v1 n where n.doi=c.doi) as has_source_review_note,
 (select count(*) from public.cuhalide_atlas_public_structures_current_v1 s where s.record_id=c.record_id and s.eligibility='Core - Included')::int as structure_records,
 (select count(*) from public.cuhalide_atlas_public_structures_current_v1 s where s.record_id=c.record_id and s.eligibility='Core - Included' and coalesce(s.space_group,'') not in ('','Unresolved','UNKNOWN'))::int as structures_with_space_group,
 case (select r.review_status from atlas_internal.cuhalide_photophysics_article_review_v1 r where r.record_id=c.record_id) when 'qc_passed' then 'reviewed_measurements' when 'complete_no_data' then 'reviewed_no_reported_data' else 'not_reviewed_in_current_data_release' end as photophysics_status,
 (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s where s.record_id=c.record_id)::int as sample_records,
 (select max(f.imported_at) from atlas_internal.cuxplore_source_inventory_v1 f where f.doi=c.doi) as text_index_updated_at
from atlas_internal.cuhalide_knowledge_catalog_v1 c;
revoke all on atlas_internal.cuxplore_processing_v1 from public,anon,authenticated;
grant select on atlas_internal.cuxplore_processing_v1 to service_role;

create or replace function public.cuxplore_primary_matches_v1(p_query text,p_limit integer default 12)
returns jsonb language sql stable security definer set search_path='' as $f$
with q as (select to_tsquery('english',replace(plainto_tsquery('english',left(regexp_replace(coalesce(p_query,''),'18[- ]crown[- ]6|18c6','crown ether','gi'),600))::text,' & ',' | ')) as ts),
ranked as (
 select d.doi,d.source_role,p.page as page_start,p.page as page_end,
 ts_rank_cd(p.fts,q.ts,32) as score
 from atlas_internal.cuxplore_passages_v1 p join atlas_internal.cuxplore_documents_v1 d using(file_sha256) cross join q
 where p.fts @@ q.ts and not p.reference_page and d.extraction_status='native_text'
 and exists(select 1 from atlas_internal.cuhalide_knowledge_catalog_v1 c where c.doi=d.doi)
 union all
 select lower(a.doi),f.source_role,p.page_start,p.page_end,ts_rank_cd(p.fts,q.ts,32)
 from atlas_internal.cuhalide_private_evidence_text_chunk_v1 p join atlas_internal.cuhalide_private_evidence_file_v1 f using(file_id) join public.cuhalide_atlas_public_articles_current_v1 a on a.record_id=f.record_id cross join q
 where f.source_role in ('main_article','combined_main_and_si','supporting_information') and p.fts @@ q.ts
 and not exists(select 1 from atlas_internal.cuxplore_documents_v1 d where d.file_sha256=f.source_sha256)
 and exists(select 1 from atlas_internal.cuhalide_knowledge_catalog_v1 c where c.doi=lower(a.doi))
), best as (select r.*,row_number() over(partition by doi order by score desc,page_start) rn from ranked r),selected as(select * from best where rn=1 order by score desc,doi limit least(500,greatest(1,p_limit)))
select coalesce(jsonb_agg(jsonb_build_object('doi',doi,'source_role',source_role,'page_start',page_start,'page_end',page_end,'score',round(score::numeric,6),'text_match',true,'quotation_exposed',false) order by score desc,doi),'[]'::jsonb) from selected;
$f$;
revoke all on function public.cuxplore_primary_matches_v1(text,integer) from public,anon,authenticated;
grant execute on function public.cuxplore_primary_matches_v1(text,integer) to service_role;

create or replace function public.cuxplore_knowledge_v1(p_action text default 'coverage',p_query text default '',p_scope text default 'all',p_limit integer default 12,p_offset integer default 0)
returns jsonb language plpgsql stable security definer set search_path='' as $f$
declare x jsonb; cov jsonb; q text; exact_doi boolean; terms tsquery; matches jsonb:='[]'::jsonb; lex text[];
begin
 if p_action is null or p_action not in ('coverage','articles','retrieve') or p_scope is null or p_scope not in ('all','curated','context','reviewed','text') or length(coalesce(p_query,''))>600 or p_limit is null or p_offset is null or p_limit not between 1 and 20 or p_offset not between 0 and 1000 then raise exception 'Invalid query';end if;
 q:=trim(regexp_replace(coalesce(p_query,''),'^https?://(dx[.])?doi[.]org/','','i'));
 exact_doi:=q ~* '^10[.][0-9]{4,9}/[^[:space:]]+$';
 if p_action='retrieve' and length(q)<2 then raise exception 'A query is required';end if;
 if not exact_doi then q:=regexp_replace(q,'18[- ]crown[- ]6|18c6','crown ether','gi');q:=replace(replace(replace(replace(q,'冠醚','crown ether'),'阳离子','cation ammonium'),'发光','photoluminescence'),'氢键','hydrogen bond');end if;
 x:=public.cuhalide_atlas_knowledge_v1('coverage');
 select jsonb_build_object('main_text_articles',count(*) filter(where main_text_files>0),'si_text_articles',count(*) filter(where si_text_files>0),'cif_text_articles',count(*) filter(where cif_text_files>0),'any_prose_articles',count(*) filter(where prose_passages>0),'prose_passages',sum(prose_passages),'sparse_scan_articles',count(*) filter(where sparse_scan_files>0),'registered_main_articles',count(*) filter(where main_source_registered),'registered_si_articles',count(*) filter(where si_source_registered),'registered_cif_articles',count(*) filter(where cif_source_registered),'articles_with_structures',count(*) filter(where structure_records>0),'photophysics_reviewed_articles',count(*) filter(where photophysics_status='reviewed_measurements'),'photophysics_no_data_articles',count(*) filter(where photophysics_status='reviewed_no_reported_data'),'text_index_updated_at',max(text_index_updated_at),'native_text_is_field_review',false,'cif_text_is_prose',false,'counts_basis','DOI-deduplicated current literature catalog') into cov from atlas_internal.cuxplore_processing_v1;
 x:=x||jsonb_build_object('brand','CuXplore','dataset','CuHalide Atlas','knowledge_contract','1.2.0','processing_coverage',cov,'query',p_query,'normalized_query',q,'scope',p_scope,'limit',p_limit,'offset',p_offset);
 x:=jsonb_set(x,'{coverage,knowledge_contract}','"1.2.0"'::jsonb);if p_action='coverage' then return x;end if;
 if q<>'' and not exact_doi then matches:=public.cuxplore_primary_matches_v1(q,500);end if;
 terms:=to_tsquery('english',replace(plainto_tsquery('english',q)::text,' & ',' | '));lex:=tsvector_to_array(to_tsvector('english',q));
 with docs as (
 select c.*,n.statement,n.qualification,n.reviewed_at,to_jsonb(p)-'doi'-'record_id'-'source_id' as processing,p.prose_passages,p.structure_records,
 setweight(to_tsvector('english',coalesce(c.title,'')),'A')||setweight(to_tsvector('english',coalesce(n.statement,'')||' '||coalesce(n.qualification,'')),'B')||setweight(to_tsvector('english',c.search_text),'C') as vec,
 m.value as primary_match
 from atlas_internal.cuhalide_knowledge_catalog_v1 c
 join atlas_internal.cuxplore_processing_v1 p on p.source_id=c.source_id
 left join atlas_internal.cuhalide_source_review_notes_v1 n on c.doi=n.doi
 left join jsonb_array_elements(matches) m on m.value->>'doi'=c.doi
 where p_scope='all' or p_scope='curated' and c.evidence_scope='curated_article' or p_scope='context' and c.evidence_scope='bibliographic_context' or p_scope='reviewed' and n.doi is not null or p_scope='text' and p.prose_passages>0
 ), scored as (
 select d.*,case when exact_doi then 100::real else
 5*power((select count(*)::real from unnest(lex) l where l=any(tsvector_to_array(d.vec)))/greatest(1,cardinality(lex)),2)+ts_rank_cd(d.vec,terms,32)+coalesce((d.primary_match->>'score')::real,0) end as score
 from docs d where q='' or case when exact_doi then lower(d.doi)=lower(q) else d.vec @@ terms or d.primary_match is not null or position(lower(q) in lower(d.title))>0 end
 ), selected as(select * from scored order by score desc,year desc nulls last,doi limit p_limit offset p_offset)
 select x||jsonb_build_object('total',(select count(*) from scored),'primary_match_count',jsonb_array_length(matches),'items',coalesce(jsonb_agg(jsonb_build_object('source_id',s.source_id,'record_id',s.record_id,'doi',s.doi,'url','https://doi.org/'||s.doi,'title',s.title,'year',s.year,'journal',s.journal,'evidence_scope',s.evidence_scope,'source_layer',s.source_layer,'category',s.category,'halogen',s.halogen,'summary',s.summary,'score',round(s.score::numeric,6),
 'review',case when s.statement is null then null else jsonb_build_object('statement',s.statement,'qualification',s.qualification,'reviewed_at',s.reviewed_at,'type','authored source-review note; not a publisher quotation') end,
 'processing',s.processing,'primary_match',s.primary_match,'structure_count',s.structure_records,
 'structures',coalesce((select jsonb_agg(z) from(select st.structure_id,st.label,st.formula,st.phase,st.space_group,st.dimension_class as dimensionality from public.cuhalide_atlas_public_structures_current_v1 st where st.record_id=s.record_id and st.eligibility='Core - Included' order by st.structure_id limit 6) z),'[]'::jsonb)) order by s.score desc,s.year desc nulls last,s.doi),'[]'::jsonb)) into x from selected s;
 return x||jsonb_build_object('method','Weighted article/review lexical retrieval plus separately indexed MAIN/SI page matches; exact DOI priority','inference_performed',false,'raw_source_text_exposed',false,'evidence_note','Text extraction, authored review and verified compound properties are independent states. Native text supports retrieval but does not validate a mechanism, structure assignment or measurement. Ranking scores are not confidence.');
end;$f$;
revoke all on function public.cuxplore_knowledge_v1(text,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.cuxplore_knowledge_v1(text,text,text,integer,integer) to service_role;
