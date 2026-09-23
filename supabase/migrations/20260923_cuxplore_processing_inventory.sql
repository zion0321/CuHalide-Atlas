-- Per-source inventory declarations are private provenance, not scientific fields.
-- Data rows are imported from the checksummed private inventory, never seeded here.
create table if not exists atlas_internal.cuxplore_library_declarations_v1 (
  doi text primary key,
  main_status text,
  si_status text,
  cif_status text,
  inventory_date date,
  source_sha256 text,
  source_basis text
);
revoke all on atlas_internal.cuxplore_library_declarations_v1 from public,anon,authenticated;
grant select,insert,update on atlas_internal.cuxplore_library_declarations_v1 to service_role;

create or replace view atlas_internal.cuxplore_processing_v1 as
with inventory as materialized (
 select doi,
 count(*) filter(where source_role in ('main_article','combined_main_and_si') and passage_count>0 and extraction_status='native_text')::integer main_text_files,
 count(*) filter(where source_role='supporting_information' and passage_count>0 and extraction_status='native_text')::integer si_text_files,
 count(*) filter(where source_role='cif' and passage_count>0)::integer cif_text_files,
 count(*) filter(where extraction_status='scan_or_sparse_text')::integer sparse_scan_files,
 coalesce(sum(passage_count) filter(where source_role in ('main_article','combined_main_and_si','supporting_information') and extraction_status='native_text'),0)::integer prose_passages,
 coalesce(sum(text_pages) filter(where source_role in ('main_article','combined_main_and_si','supporting_information') and extraction_status='native_text'),0)::integer native_text_pages,
 max(imported_at) text_index_updated_at,
 bool_or(source_role in ('main_article','combined_main_and_si')) main_registered,
 bool_or(source_role='supporting_information') si_registered,
 bool_or(source_role='cif') cif_registered
 from atlas_internal.cuxplore_source_inventory_v1 group by doi
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
 coalesce(i.main_text_files,0) main_text_files,coalesce(i.si_text_files,0) si_text_files,coalesce(i.cif_text_files,0) cif_text_files,
 coalesce(i.sparse_scan_files,0) sparse_scan_files,coalesce(i.prose_passages,0) prose_passages,coalesce(i.native_text_pages,0) native_text_pages,
 n.doi is not null has_source_review_note,coalesce(s.structure_records,0) structure_records,coalesce(s.structures_with_space_group,0) structures_with_space_group,
 case p.review_status when 'qc_passed' then 'reviewed_measurements' when 'complete_no_data' then 'reviewed_no_reported_data' else 'not_reviewed_in_current_data_release' end photophysics_status,
 coalesce(sam.sample_records,0) sample_records,i.text_index_updated_at,l.inventory_date source_inventory_date,
 case when coalesce(i.main_text_files,0)>0 then 'text_indexed' when coalesce(i.sparse_scan_files,0)>0 then 'scan_not_text_indexed' when coalesce(r.main_registered,false) or coalesce(i.main_registered,false) or coalesce(l.main_status in ('archived','present_in_project_source_corpus'),false) then 'registered_not_text_indexed' else 'not_confirmed' end main_source_status,
 case when coalesce(i.si_text_files,0)>0 then 'text_indexed' when coalesce(r.si_registered,false) or coalesce(i.si_registered,false) or coalesce(l.si_status='SI_AVAILABLE_ARCHIVED',false) then 'registered_not_text_indexed' when l.si_status='NO_SI_PUBLISHED' then 'not_published' else 'not_confirmed' end si_source_status,
 case when coalesce(i.cif_text_files,0)>0 then 'file_parsed' when coalesce(r.cif_registered,false) or coalesce(i.cif_registered,false) or coalesce(l.cif_status in ('CIF_ARCHIVED','present_in_project_source_corpus'),false) then 'registered_not_parsed' when l.cif_status='CIF_EXTERNAL_DEPOSITION_COMPLETE' then 'external_deposition_registered' when l.cif_status='CIF_NOT_APPLICABLE' then 'not_applicable' else 'not_confirmed' end cif_source_status,
 (l.si_status='NO_SI_PUBLISHED' and (coalesce(i.si_registered,false) or coalesce(r.si_registered,false)) or l.cif_status='CIF_NOT_APPLICABLE' and (coalesce(i.cif_registered,false) or coalesce(r.cif_registered,false))) is true source_inventory_conflict
from atlas_internal.cuhalide_knowledge_catalog_v1 c
left join inventory i on i.doi=c.doi
left join registered r on r.record_id=c.record_id
left join structures s on s.record_id=c.record_id
left join samples sam on sam.record_id=c.record_id
left join atlas_internal.cuhalide_source_review_notes_v1 n on n.doi=c.doi
left join atlas_internal.cuhalide_photophysics_article_review_v1 p on p.record_id=c.record_id
left join atlas_internal.cuxplore_library_declarations_v1 l on l.doi=c.doi;
revoke all on atlas_internal.cuxplore_processing_v1 from public,anon,authenticated;
grant select on atlas_internal.cuxplore_processing_v1 to service_role;
