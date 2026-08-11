-- CuHalide Atlas 3.0.2 scientific hotfix candidate
-- Parent: 3.0.1
-- Correction-only candidate. Does not publish/switch the current release.

begin;

-- 1. Build immutable candidate payloads. Articles and strict-polar rows are unchanged.
delete from public.cuhalide_atlas_payload_chunks where release_version='3.0.2';

insert into public.cuhalide_atlas_payload_chunks(kind,chunk_index,total_chunks,release_version,encoding,data,payload_sha256,updated_at)
select 'web_norm_articles_v302',0,1,'3.0.2',encoding,data,payload_sha256,now()
from public.cuhalide_atlas_payload_chunks
where release_version='3.0.1' and kind='web_norm_articles_v301' and chunk_index=0;

with t as (
  select replace(replace(replace(replace(
    data,
    '"Structural Dimensionality": "0D (pyrCu2Br3"','"Structural Dimensionality": "Unresolved"'),
    '"Structural Dimensionality": "pyr4Cu4I8)"','"Structural Dimensionality": "0D"'),
    '"Structural Dimensionality": "not assigned in article narrative for pip6Cu10I16"','"Structural Dimensionality": "0D"'),
    '"Structural Dimensionality": "pyr4Cu4Br8"','"Structural Dimensionality": "0D"') as data
  from public.cuhalide_atlas_payload_chunks
  where release_version='3.0.1' and kind='web_norm_structures_v301' and chunk_index=0
)
insert into public.cuhalide_atlas_payload_chunks(kind,chunk_index,total_chunks,release_version,encoding,data,payload_sha256,updated_at)
select 'web_norm_structures_v302',0,1,'3.0.2','plain-json-response',data,
       encode(extensions.digest(convert_to(data,'UTF8'),'sha256'),'hex'),now()
from t;

with t as (
  select replace(replace(replace(replace(
    data,
    '"Structural Dimensionality": "0D (pyrCu2Br3"','"Structural Dimensionality": "Unresolved"'),
    '"Structural Dimensionality": "pyr4Cu4I8)"','"Structural Dimensionality": "0D"'),
    '"Structural Dimensionality": "not assigned in article narrative for pip6Cu10I16"','"Structural Dimensionality": "0D"'),
    '"Structural Dimensionality": "pyr4Cu4Br8"','"Structural Dimensionality": "0D"') as data
  from public.cuhalide_atlas_payload_chunks
  where release_version='3.0.1' and kind='web_norm_verified_v301' and chunk_index=0
)
insert into public.cuhalide_atlas_payload_chunks(kind,chunk_index,total_chunks,release_version,encoding,data,payload_sha256,updated_at)
select 'web_norm_verified_v302',0,1,'3.0.2','plain-json-response',data,
       encode(extensions.digest(convert_to(data,'UTF8'),'sha256'),'hex'),now()
from t;

insert into public.cuhalide_atlas_payload_chunks(kind,chunk_index,total_chunks,release_version,encoding,data,payload_sha256,updated_at)
select 'web_norm_polar_v302',0,1,'3.0.2',encoding,data,payload_sha256,now()
from public.cuhalide_atlas_payload_chunks
where release_version='3.0.1' and kind='web_norm_polar_v301' and chunk_index=0;

-- 2. Prepare release-specific public projection candidate.
drop table if exists public.cuhalide_atlas_public_articles_v302 cascade;
drop table if exists public.cuhalide_atlas_public_structures_v302 cascade;
drop table if exists public.cuhalide_atlas_public_projection_contract_v302 cascade;
create table public.cuhalide_atlas_public_articles_v302 (like public.cuhalide_atlas_public_articles_v301 including all);
create table public.cuhalide_atlas_public_structures_v302 (like public.cuhalide_atlas_public_structures_v301 including all);
create table public.cuhalide_atlas_public_projection_contract_v302 (like public.cuhalide_atlas_public_projection_contract_v301 including all);
insert into public.cuhalide_atlas_public_articles_v302 select * from public.cuhalide_atlas_public_articles_v301;
insert into public.cuhalide_atlas_public_structures_v302 select * from public.cuhalide_atlas_public_structures_v301;
update public.cuhalide_atlas_public_structures_v302
set known_erratum=false,erratum_key='',erratum_note=''
where record_id=13 and structure_id in ('CUH-013-S01','CUH-013-S02','CUH-013-S03','CUH-013-S04');

alter table public.cuhalide_atlas_public_articles_v302 enable row level security;
alter table public.cuhalide_atlas_public_structures_v302 enable row level security;
alter table public.cuhalide_atlas_public_projection_contract_v302 enable row level security;
create policy cuhalide_public_articles_deny_untrusted on public.cuhalide_atlas_public_articles_v302 for all to anon,authenticated using(false) with check(false);
create policy cuhalide_public_structures_deny_untrusted on public.cuhalide_atlas_public_structures_v302 for all to anon,authenticated using(false) with check(false);
create policy cuhalide_public_projection_contract_deny_untrusted on public.cuhalide_atlas_public_projection_contract_v302 for all to anon,authenticated using(false) with check(false);
revoke all on public.cuhalide_atlas_public_articles_v302,public.cuhalide_atlas_public_structures_v302,public.cuhalide_atlas_public_projection_contract_v302 from public,anon,authenticated;
revoke all on public.cuhalide_atlas_public_articles_v302,public.cuhalide_atlas_public_structures_v302,public.cuhalide_atlas_public_projection_contract_v302 from service_role;
grant select on public.cuhalide_atlas_public_articles_v302,public.cuhalide_atlas_public_structures_v302,public.cuhalide_atlas_public_projection_contract_v302 to service_role;

insert into public.cuhalide_atlas_public_projection_contract_v302(
 release_version,article_sha256,structure_sha256,article_rows,canonical_articles,structure_rows,core_structures,strict_polar_rows,errata_rows,canonical_articles_containing_i,canonical_exact_cl_br_i,created_at,halogen_semantics_version,structure_halogen_specific,structure_halogen_series,structure_halogen_unresolved,structure_halogen_conflicts
)
select '3.0.2',
 encode(extensions.digest(convert_to(string_agg(encode(extensions.digest(convert_to((to_jsonb(a)-'search_safe')::text,'UTF8'),'sha256'),'hex'),'' order by a.record_id),'UTF8'),'sha256'),'hex'),
 (select encode(extensions.digest(convert_to(string_agg(encode(extensions.digest(convert_to((to_jsonb(s)-'search_safe')::text,'UTF8'),'sha256'),'hex'),'' order by s.structure_id),'UTF8'),'sha256'),'hex') from public.cuhalide_atlas_public_structures_v302 s),
 count(*),count(*) filter(where release_status='Core - Verified'),878,816,67,0,247,27,now(),'structure-halogen-v6',803,45,30,4
from public.cuhalide_atlas_public_articles_v302 a;

-- Clone versioned query/bootstrap/health functions from the validated 3.0.1 runtime.
do $$
declare n text; d text;
begin
  foreach n in array array[
    'cuhalide_atlas_public_articles_query_v301',
    'cuhalide_atlas_public_structures_query_v301',
    'cuhalide_atlas_public_bootstrap_v301',
    'cuhalide_atlas_public_halogen_health_v301',
    'cuhalide_atlas_public_projection_health_v301'
  ] loop
    select pg_get_functiondef(p.oid) into d
    from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace
    where ns.nspname='public' and p.proname=n and p.prokind='f' limit 1;
    if d is null then raise exception 'source function % missing',n; end if;
    d:=replace(d,'_v301','_v302');
    d:=replace(d,'''3.0.1''','''3.0.2''');
    execute d;
  end loop;
end $$;

revoke all on function public.cuhalide_atlas_public_articles_query_v302(text,integer,integer,integer,integer,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.cuhalide_atlas_public_structures_query_v302(text,integer,integer,text,text,text,text,text,text,text,integer,boolean) from public,anon,authenticated;
revoke all on function public.cuhalide_atlas_public_bootstrap_v302() from public,anon,authenticated;
revoke all on function public.cuhalide_atlas_public_halogen_health_v302() from public,anon,authenticated;
revoke all on function public.cuhalide_atlas_public_projection_health_v302() from public,anon,authenticated;
grant execute on function public.cuhalide_atlas_public_articles_query_v302(text,integer,integer,integer,integer,text,text,text,text,text,text,text) to service_role;
grant execute on function public.cuhalide_atlas_public_structures_query_v302(text,integer,integer,text,text,text,text,text,text,text,integer,boolean) to service_role;
grant execute on function public.cuhalide_atlas_public_bootstrap_v302() to service_role;
grant execute on function public.cuhalide_atlas_public_halogen_health_v302() to service_role;
grant execute on function public.cuhalide_atlas_public_projection_health_v302() to service_role;

-- 3. Register the four accepted amendments and a validated, unpublished patch candidate.
delete from public.cuhalide_atlas_release_amendments where source_release='3.0.1' and target_release='3.0.2' and structure_id in ('CUH-013-S01','CUH-013-S02','CUH-013-S03','CUH-013-S04');
insert into public.cuhalide_atlas_release_amendments(amendment_id,source_release,target_release,record_id,structure_id,entity_type,field_name,old_value,proposed_value,amendment_type,evidence_source,evidence_url,confidence,review_status,review_notes,created_at,reviewed_at) values
(241,'3.0.1','3.0.2',13,'CUH-013-S01','structure','Structural Dimensionality','0D (pyrCu2Br3','Unresolved','scientific correction','Direct uploaded CIF plus source-level Record 13 QA','https://doi.org/10.1016/j.matlit.2026.100010','High','accepted','Confirmed list-position mapping error; correction changes no frozen denominator.',now(),now()),
(242,'3.0.1','3.0.2',13,'CUH-013-S02','structure','Structural Dimensionality','pyr4Cu4I8)','0D','scientific correction','Direct uploaded CIF plus source-level Record 13 QA','https://doi.org/10.1016/j.matlit.2026.100010','High','accepted','Confirmed list-position mapping error; correction changes no frozen denominator.',now(),now()),
(243,'3.0.1','3.0.2',13,'CUH-013-S03','structure','Structural Dimensionality','not assigned in article narrative for pip6Cu10I16','0D','scientific correction','Direct uploaded CIF plus source-level Record 13 QA','https://doi.org/10.1016/j.matlit.2026.100010','High','accepted','Confirmed list-position mapping error; correction changes no frozen denominator.',now(),now()),
(244,'3.0.1','3.0.2',13,'CUH-013-S04','structure','Structural Dimensionality','pyr4Cu4Br8','0D','scientific correction','Direct uploaded CIF plus source-level Record 13 QA','https://doi.org/10.1016/j.matlit.2026.100010','High','accepted','Confirmed list-position mapping error; correction changes no frozen denominator.',now(),now());

delete from public.cuhalide_atlas_patch_releases where version='3.0.2';
insert into public.cuhalide_atlas_patch_releases(version,parent_version,patch_type,status,release_date,summary,counts,change_counts,snapshots,validation,created_at,published_at)
select '3.0.2','3.0.1','scientific','validated','2026-08-11',
 'Scientific hotfix candidate correcting four Record 13 structure-level Structural Dimensionality cells inherited from a list-position mapping error. No denominator changes and no new literature are included.',
 jsonb_build_object('article_audit_records',346,'canonical_verified_articles',332,'structure_phase_rows',878,'resolved_space_group_rows',650,'verified_space_group_rows',625,'verified_polar_rows',87,'strict_polar_rows',67,'strict_polar_articles',42),
 jsonb_build_object('scientific_record_changes',4,'article_record_changes',0,'structure_dimensionality_corrections',4,'new_literature_records',0,'denominator_changes',0),
 jsonb_build_object(
   'normalized_articles',(select payload_sha256 from public.cuhalide_atlas_payload_chunks where release_version='3.0.2' and kind='web_norm_articles_v302'),
   'normalized_structures',(select payload_sha256 from public.cuhalide_atlas_payload_chunks where release_version='3.0.2' and kind='web_norm_structures_v302'),
   'verified',(select payload_sha256 from public.cuhalide_atlas_payload_chunks where release_version='3.0.2' and kind='web_norm_verified_v302'),
   'polar',(select payload_sha256 from public.cuhalide_atlas_payload_chunks where release_version='3.0.2' and kind='web_norm_polar_v302')
 ),
 jsonb_build_object('payload_snapshots',4,'article_rows',346,'structure_rows',878,'verified_rows',625,'strict_polar_rows',67,'accepted_amendments',4,'projection_health_pass',(public.cuhalide_atlas_public_projection_health_v302()->>'ok')::boolean,'halogen_health_pass',(public.cuhalide_atlas_public_halogen_health_v302()->>'ok')::boolean,'duplicate_doi_groups',0,'orphan_structures',0,'external_human_independence',false,'review_mode','AI expert-surrogate plus source-level evidence; not independent-human validation','validated_at',now()),
 now(),null;

commit;
