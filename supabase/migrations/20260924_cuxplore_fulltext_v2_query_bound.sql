-- Bound DOI-level lexical candidates for Edge-runtime latency after v2 expansion.
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
 select * from best where rn=1 order by score desc,doi limit least(80,greatest(1,p_limit))
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
notify pgrst,'reload schema';
