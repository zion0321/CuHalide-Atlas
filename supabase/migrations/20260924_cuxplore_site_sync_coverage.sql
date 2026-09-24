-- Synchronize the public CuXplore coverage contract with the 24 Sep 2026 source-index and CIF review state.
create table if not exists atlas_internal.cuxplore_cif_reconciliation_state_v1(
 release_key text primary key,
 registered_files integer not null,
 parsed_files integer not null,
 cu_structure_blocks integer not null,
 identity_review_rows integer not null,
 identity_resolved_rows integer not null,
 quarantined_rows integer not null,
 dimensionality_flags integer not null,
 dimensionality_adjudicated integer not null,
 authority_rows integer not null,
 core_included_rows integer not null,
 authority_overwritten boolean not null default false,
 updated_at timestamptz not null
);
alter table atlas_internal.cuxplore_cif_reconciliation_state_v1 enable row level security;
revoke all on atlas_internal.cuxplore_cif_reconciliation_state_v1 from public,anon,authenticated;
grant select,insert,update,delete on atlas_internal.cuxplore_cif_reconciliation_state_v1 to service_role;
insert into atlas_internal.cuxplore_cif_reconciliation_state_v1(
 release_key,registered_files,parsed_files,cu_structure_blocks,identity_review_rows,
 identity_resolved_rows,quarantined_rows,dimensionality_flags,dimensionality_adjudicated,
 authority_rows,core_included_rows,authority_overwritten,updated_at
) values ('cif-reconciliation-20260924',114,114,237,29,26,3,10,10,939,901,false,'2026-09-24T12:45:00Z')
on conflict(release_key) do update set
 registered_files=excluded.registered_files,parsed_files=excluded.parsed_files,
 cu_structure_blocks=excluded.cu_structure_blocks,identity_review_rows=excluded.identity_review_rows,
 identity_resolved_rows=excluded.identity_resolved_rows,quarantined_rows=excluded.quarantined_rows,
 dimensionality_flags=excluded.dimensionality_flags,dimensionality_adjudicated=excluded.dimensionality_adjudicated,
 authority_rows=excluded.authority_rows,core_included_rows=excluded.core_included_rows,
 authority_overwritten=excluded.authority_overwritten,updated_at=excluded.updated_at;

CREATE OR REPLACE FUNCTION public.cuxplore_knowledge_v1(p_action text DEFAULT 'coverage'::text, p_query text DEFAULT ''::text, p_scope text DEFAULT 'all'::text, p_limit integer DEFAULT 12, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare x jsonb;cov jsonb;fulltext jsonb;cif jsonb;q text;exact_doi boolean;terms tsquery;matches jsonb:='[]'::jsonb;lex text[];
begin
if p_action is null or p_action not in ('coverage','articles','retrieve') or p_scope is null or p_scope not in ('all','curated','context','reviewed','text') or length(coalesce(p_query,''))>600 or p_limit is null or p_offset is null or p_limit not between 1 and 20 or p_offset not between 0 and 1000 then raise exception 'Invalid query';end if;
q:=trim(regexp_replace(coalesce(p_query,''),'^https?://(dx[.])?doi[.]org/','','i'));exact_doi:=q ~* '^10[.][0-9]{4,9}/[^[:space:]]+$';if p_action='retrieve' and length(q)<2 then raise exception 'A query is required';end if;
if not exact_doi then q:=regexp_replace(q,'18[- ]crown[- ]6|18c6','crown ether','gi');q:=replace(replace(replace(replace(q,'冠醚','crown ether'),'阳离子','cation ammonium'),'发光','photoluminescence'),'氢键','hydrogen bond');end if;
x:=public.cuhalide_atlas_knowledge_v1('coverage');
fulltext:=public.cuxplore_fulltext_v2_health();
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
select jsonb_build_object('main_text_articles',count(*) filter(where main_text_files>0),'si_text_articles',count(*) filter(where si_text_files>0),'cif_text_articles',count(*) filter(where cif_text_files>0),'any_prose_articles',count(*) filter(where prose_passages>0),'prose_passages',sum(prose_passages),'sparse_scan_articles',count(*) filter(where sparse_scan_files>0),'registered_main_articles',count(*) filter(where main_source_registered),'registered_si_articles',count(*) filter(where si_source_registered),'registered_cif_articles',count(*) filter(where cif_source_registered),'articles_with_structures',count(*) filter(where structure_records>0),'photophysics_reviewed_articles',count(*) filter(where photophysics_status='reviewed_measurements'),'photophysics_no_data_articles',count(*) filter(where photophysics_status='reviewed_no_reported_data'),'text_index_updated_at',max(text_index_updated_at),'native_text_is_field_review',false,'cif_text_is_prose',false,'counts_basis','DOI-deduplicated current literature catalog') into cov from atlas_internal.cuxplore_processing_v1;
x:=x||jsonb_build_object('brand','CuXplore','dataset','CuHalide Atlas','knowledge_contract','1.3.0','processing_coverage',cov,'fulltext_v2',fulltext,'cif_reconciliation',cif,'source_indexed_through','2026-09-24','query',p_query,'normalized_query',q,'scope',p_scope,'limit',p_limit,'offset',p_offset);x:=jsonb_set(x,'{coverage,knowledge_contract}','"1.2.0"'::jsonb);if p_action='coverage' then return x;end if;
if q<>'' and not exact_doi then matches:=public.cuxplore_primary_matches_v1(q,500);end if;terms:=to_tsquery('english',replace(plainto_tsquery('english',q)::text,' & ',' | '));lex:=tsvector_to_array(to_tsvector('english',q));
with docs as (select c.*,n.statement,n.qualification,n.reviewed_at,to_jsonb(p)-'doi'-'record_id'-'source_id' as processing,p.prose_passages,p.structure_records,setweight(to_tsvector('english',coalesce(c.title,'')),'A')||setweight(to_tsvector('english',coalesce(n.statement,'')||' '||coalesce(n.qualification,'')),'B')||setweight(to_tsvector('english',c.search_text),'C') as vec,m.value as primary_match from atlas_internal.cuhalide_knowledge_catalog_v1 c join atlas_internal.cuxplore_processing_v1 p on p.source_id=c.source_id left join atlas_internal.cuhalide_source_review_notes_v1 n on c.doi=n.doi left join jsonb_array_elements(matches) m on m.value->>'doi'=c.doi where p_scope='all' or p_scope='curated' and c.evidence_scope='curated_article' or p_scope='context' and c.evidence_scope='bibliographic_context' or p_scope='reviewed' and n.doi is not null or p_scope='text' and p.prose_passages>0),
scored as (select d.*,case when exact_doi then 100::real else 5*power((select count(*)::real from unnest(lex) l where l=any(tsvector_to_array(d.vec)))/greatest(1,cardinality(lex)),2)+ts_rank_cd(d.vec,terms,32)+coalesce((d.primary_match->>'score')::real,0) end as score from docs d where q='' or case when exact_doi then lower(d.doi)=lower(q) else d.vec @@ terms or d.primary_match is not null or position(lower(q) in lower(d.title))>0 end),selected as(select * from scored order by score desc,year desc nulls last,doi limit p_limit offset p_offset)
select x||jsonb_build_object('total',(select count(*) from scored),'primary_match_count',jsonb_array_length(matches),'items',coalesce(jsonb_agg(jsonb_build_object('source_id',s.source_id,'record_id',s.record_id,'doi',s.doi,'url','https://doi.org/'||s.doi,'title',s.title,'year',s.year,'journal',s.journal,'evidence_scope',s.evidence_scope,'source_layer',s.source_layer,'category',s.category,'halogen',s.halogen,'summary',s.summary,'score',round(s.score::numeric,6),'review',case when s.statement is null then null else jsonb_build_object('statement',s.statement,'qualification',s.qualification,'reviewed_at',s.reviewed_at,'type','authored source-review note; not a publisher quotation') end,'processing',s.processing,'primary_match',s.primary_match,'structure_count',s.structure_records,'structures',coalesce((select jsonb_agg(z) from(select st.structure_id,st.label,st.formula,st.phase,st.space_group,st.dimension_class as dimensionality from public.cuhalide_atlas_public_structures_current_v1 st where st.record_id=s.record_id and st.eligibility='Core - Included' order by st.structure_id limit 6) z),'[]'::jsonb)) order by s.score desc,s.year desc nulls last,s.doi),'[]'::jsonb)) into x from selected s;
return x||jsonb_build_object('method','Weighted article/review lexical retrieval plus separately indexed MAIN/SI source matches; v2 character-range locators with legacy page fallback; exact DOI priority','inference_performed',false,'raw_source_text_exposed',false,'evidence_note','Text extraction, authored review and verified compound properties are independent states. Native text supports retrieval but does not validate a mechanism, structure assignment or measurement. Ranking scores are not confidence.');end;$function$
;

revoke all on function public.cuxplore_knowledge_v1(text,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.cuxplore_knowledge_v1(text,text,text,integer,integer) to service_role;
notify pgrst,'reload schema';
