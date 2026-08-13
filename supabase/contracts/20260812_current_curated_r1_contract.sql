-- CuHalide Atlas Current Curated rev.1 contract
-- Production state consolidated from reviewed migrations applied on 2026-08-12.
-- IMPORTANT: this file intentionally contains no promoted article/structure row payloads.
-- Private Current Curated data remain service-role-only research assets.

begin;

create table if not exists public.cuhalide_atlas_current_curated_articles (
  record_id integer primary key,
  title text not null,
  authors text not null default '',
  journal text not null default '',
  year integer,
  publication_date date,
  doi text not null,
  doi_url text not null default '',
  halogen text not null default '',
  dimensionality text not null default '',
  category text not null default '',
  evidence_level text not null default '',
  scope_status text not null default 'Included',
  release_status text not null default 'Current Curated - Verified',
  structure_summary text not null default '',
  compounds text not null default '',
  space_groups text not null default '',
  emission_nm text not null default '',
  emission_assignment text not null default '',
  article_type text not null default 'Original Research',
  volume text not null default '',
  issue text not null default '',
  pages text not null default '',
  ccdc_cif text not null default '',
  last_verified text not null default '',
  search_safe text not null default '',
  dimension_class text not null default 'Unresolved',
  coverage_class text not null check (coverage_class in ('coverage_backfill','post_cutoff_addition')),
  base_release text not null default '3.0.2',
  live_revision bigint not null default 1,
  qc_status text not null default 'passed' check (qc_status in ('pending','passed','failed','reverted')),
  source_batch text not null default '',
  curated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cuhalide_atlas_current_curated_articles_doi_uq
  on public.cuhalide_atlas_current_curated_articles (lower(doi));
create index if not exists cuhalide_atlas_current_curated_articles_search_idx
  on public.cuhalide_atlas_current_curated_articles using gin (to_tsvector('simple', search_safe));

create table if not exists public.cuhalide_atlas_current_curated_structures (
  structure_id text primary key,
  record_id integer not null references public.cuhalide_atlas_current_curated_articles(record_id) on delete cascade,
  year integer,
  label text not null default '',
  formula text not null default '',
  phase text not null default '',
  halogen_fallback text not null default '',
  dimensionality text not null default '',
  category text not null default '',
  space_group text not null default '',
  space_group_source_form text not null default '',
  it_number text not null default '',
  point_group text not null default '',
  crystal_system text not null default '',
  polar text not null default 'Unresolved',
  polar_basis text not null default '',
  sg_confidence text not null default 'Unresolved',
  mapping_confidence text not null default 'Unresolved',
  inclusion_status text not null default 'Included',
  eligibility text not null default 'Core - Included',
  determination_method text not null default '',
  ccdc_cif text not null default '',
  evidence_level text not null default '',
  crystallographic_evidence_type text not null default '',
  last_verified text not null default '',
  doi text not null default '',
  doi_url text not null default '',
  article_title text not null default '',
  cell_a text not null default '',
  cell_b text not null default '',
  cell_c text not null default '',
  cell_alpha text not null default '',
  cell_beta text not null default '',
  cell_gamma text not null default '',
  cell_volume text not null default '',
  z_value text not null default '',
  known_erratum boolean not null default false,
  erratum_key text not null default '',
  erratum_note text not null default '',
  search_safe text not null default '',
  halogen_effective text not null default 'Unresolved',
  dimension_class text not null default 'Unresolved',
  halogen_basis text not null default '',
  halogen_scope text not null default 'unresolved',
  halogen_confidence text not null default 'Unresolved',
  halogen_note text not null default '',
  coverage_class text not null check (coverage_class in ('coverage_backfill','post_cutoff_addition')),
  live_revision bigint not null default 1,
  qc_status text not null default 'passed' check (qc_status in ('pending','passed','failed','reverted')),
  chemical_identity_status text not null default 'new_identity',
  curated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cuhalide_atlas_current_curated_structures_record_idx
  on public.cuhalide_atlas_current_curated_structures (record_id, structure_id);
create index if not exists cuhalide_atlas_current_curated_structures_search_idx
  on public.cuhalide_atlas_current_curated_structures using gin (to_tsvector('simple', search_safe));

create table if not exists public.cuhalide_atlas_current_curated_links (
  link_id bigint generated by default as identity primary key,
  record_id integer not null references public.cuhalide_atlas_current_curated_articles(record_id) on delete cascade,
  structure_id text not null,
  relation_type text not null,
  note text not null default '',
  live_revision bigint not null default 1,
  created_at timestamptz not null default now(),
  unique (record_id, structure_id, relation_type)
);

alter table public.cuhalide_atlas_current_curated_articles enable row level security;
alter table public.cuhalide_atlas_current_curated_structures enable row level security;
alter table public.cuhalide_atlas_current_curated_links enable row level security;

drop policy if exists current_curated_articles_deny_untrusted on public.cuhalide_atlas_current_curated_articles;
create policy current_curated_articles_deny_untrusted
  on public.cuhalide_atlas_current_curated_articles
  for all to anon, authenticated using (false) with check (false);

drop policy if exists current_curated_structures_deny_untrusted on public.cuhalide_atlas_current_curated_structures;
create policy current_curated_structures_deny_untrusted
  on public.cuhalide_atlas_current_curated_structures
  for all to anon, authenticated using (false) with check (false);

drop policy if exists current_curated_links_deny_untrusted on public.cuhalide_atlas_current_curated_links;
create policy current_curated_links_deny_untrusted
  on public.cuhalide_atlas_current_curated_links
  for all to anon, authenticated using (false) with check (false);

revoke all privileges on table public.cuhalide_atlas_current_curated_articles from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_current_curated_structures from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_current_curated_links from public, anon, authenticated;
grant all privileges on table public.cuhalide_atlas_current_curated_articles to service_role;
grant all privileges on table public.cuhalide_atlas_current_curated_structures to service_role;
grant all privileges on table public.cuhalide_atlas_current_curated_links to service_role;

create or replace view public.cuhalide_atlas_public_articles_current_v1
with (security_invoker=false) as
select
  a.record_id,a.title,a.authors,a.journal,a.year,a.doi,a.doi_url,a.halogen,a.dimensionality,
  a.category,a.evidence_level,a.scope_status,a.release_status,a.structure_summary,a.compounds,
  a.space_groups,a.emission_nm,a.emission_assignment,a.article_type,a.volume,a.issue,a.pages,
  a.ccdc_cif,a.last_verified,a.search_safe,a.dimension_class,
  'Frozen Release'::text as curation_layer,'frozen_release'::text as coverage_class,
  0::bigint as live_revision,null::timestamptz as curated_at
from public.cuhalide_atlas_public_articles_v302 a
union all
select
  a.record_id,a.title,a.authors,a.journal,a.year,a.doi,a.doi_url,a.halogen,a.dimensionality,
  a.category,a.evidence_level,a.scope_status,a.release_status,a.structure_summary,a.compounds,
  a.space_groups,a.emission_nm,a.emission_assignment,a.article_type,a.volume,a.issue,a.pages,
  a.ccdc_cif,a.last_verified,a.search_safe,a.dimension_class,
  'Current Curated'::text as curation_layer,a.coverage_class,a.live_revision,a.curated_at
from public.cuhalide_atlas_current_curated_articles a
where a.qc_status='passed';

create or replace view public.cuhalide_atlas_public_structures_current_v1
with (security_invoker=false) as
select
  s.structure_id,s.record_id,s.year,s.label,s.formula,s.phase,s.halogen_fallback,s.dimensionality,
  s.category,s.space_group,s.space_group_source_form,s.it_number,s.point_group,s.crystal_system,
  s.polar,s.polar_basis,s.sg_confidence,s.mapping_confidence,s.inclusion_status,s.eligibility,
  s.determination_method,s.ccdc_cif,s.evidence_level,s.crystallographic_evidence_type,s.last_verified,
  s.doi,s.doi_url,s.article_title,s.cell_a,s.cell_b,s.cell_c,s.cell_alpha,s.cell_beta,s.cell_gamma,
  s.cell_volume,s.z_value,s.known_erratum,s.erratum_key,s.erratum_note,s.search_safe,s.halogen_effective,
  s.dimension_class,s.halogen_basis,s.halogen_scope,s.halogen_confidence,s.halogen_note,
  'Frozen Release'::text as curation_layer,'frozen_release'::text as coverage_class,
  0::bigint as live_revision,null::timestamptz as curated_at,'frozen_release_identity'::text as chemical_identity_status
from public.cuhalide_atlas_public_structures_v302 s
union all
select
  s.structure_id,s.record_id,s.year,s.label,s.formula,s.phase,s.halogen_fallback,s.dimensionality,
  s.category,s.space_group,s.space_group_source_form,s.it_number,s.point_group,s.crystal_system,
  s.polar,s.polar_basis,s.sg_confidence,s.mapping_confidence,s.inclusion_status,s.eligibility,
  s.determination_method,s.ccdc_cif,s.evidence_level,s.crystallographic_evidence_type,s.last_verified,
  s.doi,s.doi_url,s.article_title,s.cell_a,s.cell_b,s.cell_c,s.cell_alpha,s.cell_beta,s.cell_gamma,
  s.cell_volume,s.z_value,s.known_erratum,s.erratum_key,s.erratum_note,s.search_safe,s.halogen_effective,
  s.dimension_class,s.halogen_basis,s.halogen_scope,s.halogen_confidence,s.halogen_note,
  'Current Curated'::text as curation_layer,s.coverage_class,s.live_revision,s.curated_at,s.chemical_identity_status
from public.cuhalide_atlas_current_curated_structures s
where s.qc_status='passed';

revoke all privileges on table public.cuhalide_atlas_public_articles_current_v1 from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_public_structures_current_v1 from public, anon, authenticated;
grant select on table public.cuhalide_atlas_public_articles_current_v1 to service_role;
grant select on table public.cuhalide_atlas_public_structures_current_v1 to service_role;

create or replace function public.cuhalide_atlas_current_curated_health_v1()
returns jsonb
language sql stable security definer
set search_path='public'
as $function$
with a as(
  select count(*)::int n
  from public.cuhalide_atlas_current_curated_articles where qc_status='passed'
),s as(
  select count(*)::int n,
         count(*) filter(where nullif(trim(space_group),'') is not null)::int resolved,
         count(*) filter(where sg_confidence='High' and mapping_confidence='High' and nullif(trim(space_group),'') is not null)::int verified_sg,
         count(*) filter(where polar='Yes')::int polar_rows,
         count(*) filter(where eligibility='Core - Included' and polar='Yes' and sg_confidence='High' and mapping_confidence='High' and inclusion_status='Included')::int strict_polar,
         count(distinct record_id) filter(where eligibility='Core - Included' and polar='Yes' and sg_confidence='High' and mapping_confidence='High' and inclusion_status='Included')::int strict_polar_articles
  from public.cuhalide_atlas_current_curated_structures where qc_status='passed'
),r as(
  select count(*)::int docs,count(*) filter(where embedding is not null)::int embedded
  from public.cuhalide_atlas_rag_documents where release_version in('3.0.2','current-curated-r1')
)
select jsonb_build_object(
  'ok',a.n=16 and s.n=43 and s.resolved=43 and s.verified_sg=43 and s.polar_rows=10 and s.strict_polar=10 and s.strict_polar_articles=4,
  'counts',jsonb_build_object(
    'article_audit_records',346+a.n,'chemically_included_articles',335+a.n,'canonical_verified_articles',332+a.n,
    'structure_phase_rows',878+s.n,'core_included_structure_rows',816+s.n,'resolved_space_group_rows',650+s.resolved,
    'verified_space_group_rows',625+s.verified_sg,'verified_polar_rows',87+s.polar_rows,'strict_polar_rows',67+s.strict_polar,
    'strict_polar_articles',42+s.strict_polar_articles,'rag_documents',r.docs,'rag_embedded',r.embedded),
  'batch',jsonb_build_object(
    'articles',a.n,'structures',s.n,
    'coverage_backfills',(select count(*) from public.cuhalide_atlas_current_curated_articles where qc_status='passed' and coverage_class='coverage_backfill'),
    'post_cutoff_additions',(select count(*) from public.cuhalide_atlas_current_curated_articles where qc_status='passed' and coverage_class='post_cutoff_addition')))
from a,s,r;
$function$;

create or replace function public.cuhalide_atlas_public_articles_query_current_v1(
 p_q text default '',p_page integer default 1,p_page_size integer default 18,
 p_year_from integer default null,p_year_to integer default null,p_halogen text default null,
 p_dimension text default null,p_category text default null,p_evidence text default null,
 p_scope text default null,p_release_status text default null,p_sort text default 'year_desc')
returns jsonb language plpgsql stable security definer set search_path='public'
as $function$
declare v_total integer;v_size integer:=greatest(1,least(coalesce(p_page_size,18),24));v_pages integer;v_page integer;v_items jsonb;
begin
with f as(select * from public.cuhalide_atlas_public_articles_current_v1 a where
 (p_year_from is null or a.year>=p_year_from)and(p_year_to is null or a.year<=p_year_to)and
 (p_halogen is null or p_halogen='' or case when lower(p_halogen)in('cl','br','i')then lower(p_halogen)=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))else lower(a.halogen)=lower(p_halogen)end)and
 (p_dimension is null or p_dimension='' or a.dimension_class=p_dimension)and(p_category is null or p_category='' or a.category=p_category)and
 (p_evidence is null or p_evidence='' or upper(a.evidence_level)like upper(p_evidence)||'%')and(p_scope is null or p_scope='' or a.scope_status=p_scope)and
 (p_release_status is null or p_release_status='' or(p_release_status='Current canonical' and a.release_status in('Core - Verified','Current Curated - Verified'))or a.release_status=p_release_status)and
 (coalesce(trim(p_q),'')='' or case when lower(trim(p_q))in('cl','br','i')then lower(trim(p_q))=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))when lower(trim(p_q))~'^[a-z0-9]{1,4}$'then lower(trim(p_q))=any(regexp_split_to_array(lower(a.search_safe),'[^a-z0-9]+'))else a.search_safe ilike'%'||trim(p_q)||'%'end))
select count(*) into v_total from f;
v_pages:=greatest(1,ceil(v_total::numeric/v_size)::integer);v_page:=least(greatest(1,coalesce(p_page,1)),v_pages);
with f as(select * from public.cuhalide_atlas_public_articles_current_v1 a where
 (p_year_from is null or a.year>=p_year_from)and(p_year_to is null or a.year<=p_year_to)and
 (p_halogen is null or p_halogen='' or case when lower(p_halogen)in('cl','br','i')then lower(p_halogen)=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))else lower(a.halogen)=lower(p_halogen)end)and
 (p_dimension is null or p_dimension='' or a.dimension_class=p_dimension)and(p_category is null or p_category='' or a.category=p_category)and
 (p_evidence is null or p_evidence='' or upper(a.evidence_level)like upper(p_evidence)||'%')and(p_scope is null or p_scope='' or a.scope_status=p_scope)and
 (p_release_status is null or p_release_status='' or(p_release_status='Current canonical' and a.release_status in('Core - Verified','Current Curated - Verified'))or a.release_status=p_release_status)and
 (coalesce(trim(p_q),'')='' or case when lower(trim(p_q))in('cl','br','i')then lower(trim(p_q))=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))when lower(trim(p_q))~'^[a-z0-9]{1,4}$'then lower(trim(p_q))=any(regexp_split_to_array(lower(a.search_safe),'[^a-z0-9]+'))else a.search_safe ilike'%'||trim(p_q)||'%'end)
 order by case when p_sort='year_asc'then a.year end asc nulls last,case when p_sort='title'then lower(a.title)end asc nulls last,case when p_sort='evidence'then lower(a.evidence_level)end asc nulls last,case when p_sort not in('year_asc','title','evidence')then a.year end desc nulls last,a.record_id asc offset(v_page-1)*v_size limit v_size)
select coalesce(jsonb_agg(to_jsonb(f)),'[]'::jsonb) into v_items from f;
return jsonb_build_object('items',v_items,'pagination',jsonb_build_object('page',v_page,'page_size',v_size,'total',v_total,'total_pages',v_pages,'has_next',v_page<v_pages,'has_previous',v_page>1));end;
$function$;

create or replace function public.cuhalide_atlas_public_structures_query_current_v1(
 p_q text default '',p_page integer default 1,p_page_size integer default 30,p_halogen text default null,
 p_dimension text default null,p_space_group text default null,p_confidence text default null,p_polar text default null,
 p_inclusion text default null,p_eligibility text default null,p_record_id integer default null,p_strict_polar boolean default false)
returns jsonb language plpgsql stable security definer set search_path='public'
as $function$
declare v_total integer;v_size integer:=greatest(1,least(coalesce(p_page_size,30),50));v_pages integer;v_page integer;v_items jsonb;
begin
with f as(select * from public.cuhalide_atlas_public_structures_current_v1 s where
 (p_record_id is null or s.record_id=p_record_id)and(p_halogen is null or p_halogen='' or s.halogen_effective=p_halogen)and
 (p_dimension is null or p_dimension='' or s.dimension_class=p_dimension)and(p_space_group is null or p_space_group='' or s.space_group=p_space_group)and
 (p_confidence is null or p_confidence='' or s.sg_confidence=p_confidence)and(p_polar is null or p_polar='' or s.polar=p_polar)and
 (p_inclusion is null or p_inclusion='' or s.inclusion_status=p_inclusion)and(p_eligibility is null or p_eligibility='' or s.eligibility=p_eligibility)and
 (not p_strict_polar or(s.eligibility='Core - Included' and s.polar='Yes' and s.sg_confidence='High' and s.mapping_confidence='High' and s.inclusion_status='Included'))and
 (coalesce(trim(p_q),'')='' or case when lower(trim(p_q))in('cl','br','i')then lower(trim(p_q))=any(regexp_split_to_array(lower(s.halogen_effective),'[^a-z]+'))when lower(trim(p_q))~'^[a-z0-9]{1,4}$'then lower(trim(p_q))=any(regexp_split_to_array(lower(s.search_safe),'[^a-z0-9]+'))else s.search_safe ilike'%'||trim(p_q)||'%'end))
select count(*) into v_total from f;
v_pages:=greatest(1,ceil(v_total::numeric/v_size)::integer);v_page:=least(greatest(1,coalesce(p_page,1)),v_pages);
with f as(select * from public.cuhalide_atlas_public_structures_current_v1 s where
 (p_record_id is null or s.record_id=p_record_id)and(p_halogen is null or p_halogen='' or s.halogen_effective=p_halogen)and
 (p_dimension is null or p_dimension='' or s.dimension_class=p_dimension)and(p_space_group is null or p_space_group='' or s.space_group=p_space_group)and
 (p_confidence is null or p_confidence='' or s.sg_confidence=p_confidence)and(p_polar is null or p_polar='' or s.polar=p_polar)and
 (p_inclusion is null or p_inclusion='' or s.inclusion_status=p_inclusion)and(p_eligibility is null or p_eligibility='' or s.eligibility=p_eligibility)and
 (not p_strict_polar or(s.eligibility='Core - Included' and s.polar='Yes' and s.sg_confidence='High' and s.mapping_confidence='High' and s.inclusion_status='Included'))and
 (coalesce(trim(p_q),'')='' or case when lower(trim(p_q))in('cl','br','i')then lower(trim(p_q))=any(regexp_split_to_array(lower(s.halogen_effective),'[^a-z]+'))when lower(trim(p_q))~'^[a-z0-9]{1,4}$'then lower(trim(p_q))=any(regexp_split_to_array(lower(s.search_safe),'[^a-z0-9]+'))else s.search_safe ilike'%'||trim(p_q)||'%'end)
 order by s.year desc nulls last,s.structure_id asc offset(v_page-1)*v_size limit v_size)
select coalesce(jsonb_agg(to_jsonb(f)),'[]'::jsonb) into v_items from f;
return jsonb_build_object('items',v_items,'pagination',jsonb_build_object('page',v_page,'page_size',v_size,'total',v_total,'total_pages',v_pages,'has_next',v_page<v_pages,'has_previous',v_page>1));end;
$function$;

create or replace function public.cuhalide_atlas_public_bootstrap_current_v1()
returns jsonb language plpgsql stable security definer set search_path='public','pg_catalog'
as $function$
declare v_years jsonb;v_halogens jsonb;v_article_dims jsonb;v_structure_dims jsonb;v_categories jsonb;v_space_groups jsonb;v_resolved integer;v_ah jsonb;v_ad jsonb;v_ac jsonb;v_sh jsonb;v_sd jsonb;v_ssg jsonb;
begin
select coalesce(jsonb_agg(jsonb_build_object('year',year,'count',n) order by year),'[]') into v_years from(select year,count(*)::int n from public.cuhalide_atlas_public_articles_current_v1 where release_status in('Core - Verified','Current Curated - Verified') and year is not null group by year)q;
select coalesce(jsonb_agg(jsonb_build_object('label',halogen,'count',n) order by n desc,halogen),'[]') into v_halogens from(select coalesce(nullif(halogen,''),'Unresolved')halogen,count(*)::int n from public.cuhalide_atlas_public_articles_current_v1 where release_status in('Core - Verified','Current Curated - Verified') group by 1)q;
select coalesce(jsonb_agg(jsonb_build_object('label',dimension_class,'count',n) order by n desc,dimension_class),'[]') into v_article_dims from(select dimension_class,count(*)::int n from public.cuhalide_atlas_public_articles_current_v1 where release_status in('Core - Verified','Current Curated - Verified') group by 1)q;
select coalesce(jsonb_agg(jsonb_build_object('label',dimension_class,'count',n) order by n desc,dimension_class),'[]') into v_structure_dims from(select dimension_class,count(*)::int n from public.cuhalide_atlas_public_structures_current_v1 where eligibility='Core - Included' group by 1)q;
select coalesce(jsonb_agg(jsonb_build_object('label',category,'count',n) order by n desc,category),'[]') into v_categories from(select coalesce(nullif(category,''),'Unresolved')category,count(*)::int n from public.cuhalide_atlas_public_articles_current_v1 where release_status in('Core - Verified','Current Curated - Verified') group by 1)q;
select count(*)::int into v_resolved from public.cuhalide_atlas_public_structures_current_v1 where nullif(trim(space_group),'') is not null and lower(trim(space_group)) not in('unresolved','unknown','not reported','not available');
select coalesce(jsonb_agg(jsonb_build_object('space_group',space_group,'structure_count',structure_count,'article_count',article_count) order by structure_count desc,space_group),'[]') into v_space_groups from(select space_group,count(*)::int structure_count,count(distinct record_id)::int article_count from public.cuhalide_atlas_public_structures_current_v1 where nullif(trim(space_group),'') is not null and lower(trim(space_group)) not in('unresolved','unknown','not reported','not available') group by space_group)q;
select coalesce(jsonb_agg(x order by x),'[]') into v_ah from(select distinct coalesce(nullif(halogen,''),'Unresolved')x from public.cuhalide_atlas_public_articles_current_v1)q;
select coalesce(jsonb_agg(x order by x),'[]') into v_ad from(select distinct dimension_class x from public.cuhalide_atlas_public_articles_current_v1)q;
select coalesce(jsonb_agg(x order by x),'[]') into v_ac from(select distinct coalesce(nullif(category,''),'Unresolved')x from public.cuhalide_atlas_public_articles_current_v1)q;
select coalesce(jsonb_agg(x order by case x when'Cl'then 1 when'Br'then 2 when'I'then 3 when'Unresolved'then 99 else 10 end,x),'[]') into v_sh from(select distinct coalesce(nullif(halogen_effective,''),'Unresolved')x from public.cuhalide_atlas_public_structures_current_v1)q;
select coalesce(jsonb_agg(x order by x),'[]') into v_sd from(select distinct dimension_class x from public.cuhalide_atlas_public_structures_current_v1)q;
select coalesce(jsonb_agg(x order by x),'[]') into v_ssg from(select distinct space_group x from public.cuhalide_atlas_public_structures_current_v1 where nullif(trim(space_group),'')is not null and lower(trim(space_group))not in('unresolved','unknown','not reported','not available'))q;
return jsonb_build_object('overview',jsonb_build_object('years',v_years,'halogens',v_halogens,'article_dimension_classes',v_article_dims,'structure_dimension_classes',v_structure_dims,'categories',v_categories,'space_groups',v_space_groups,'resolved_space_group_rows',v_resolved),'filters',jsonb_build_object('article',jsonb_build_object('halogens',v_ah,'dimensions',v_ad,'categories',v_ac),'structure',jsonb_build_object('halogens',v_sh,'dimensions',v_sd,'space_groups',v_ssg)));end;
$function$;

-- Unified Frozen + Current RAG query. The full retrieval contract is kept service-role-only.
create or replace function public.cuhalide_atlas_hybrid_search_current_v1(
 p_query_text text,p_query_embedding vector,p_match_count integer default 12,p_filters jsonb default '{}'::jsonb,
 p_full_text_weight double precision default 1.0,p_semantic_weight double precision default 1.0,p_rrf_k integer default 50)
returns table(id bigint,release_version text,document_key text,document_type text,record_id integer,structure_id text,title text,content text,llm_context jsonb,metadata jsonb,evidence jsonb,lexical_rank bigint,semantic_rank bigint,semantic_similarity double precision,hybrid_score double precision)
language sql stable security definer set search_path='public','extensions'
as $function$
with query_expansion as (
 select trim(coalesce(p_query_text,'')||case when p_query_text~*'(dimethylamine|dimethylammonium|二甲胺|二甲铵)'then' OR dimethylamine OR dimethylammonium OR C2H8N'else''end||case when p_query_text~*'(staircase|阶梯链|梯状链)'then' OR "staircase chains" OR "Cu-I staircase" OR "2D-CuI"'else''end||case when p_query_text~*'(water.trigger|water induced|moisture|水触发|水诱导|可逆相变)'then' OR "water-triggered" OR "phase transformation" OR "emission switching" OR Cu5Br7'else''end) q
),normalized as(
 select d.*,coalesce(er.corrected_value,d.metadata->>'dimension',d.llm_context->>'dimension','') effective_dimension,
        case when er.corrected_value is not null then jsonb_set(d.metadata,'{dimension}',to_jsonb(er.corrected_value),true)||jsonb_build_object('release_erratum',true,'release_erratum_key',er.erratum_key) else d.metadata end effective_metadata,
        case when er.corrected_value is not null then jsonb_set(d.llm_context,'{dimension}',to_jsonb(er.corrected_value),true)||jsonb_build_object('release_erratum',true,'release_erratum_key',er.erratum_key,'archived_dimension',er.published_value) else d.llm_context end effective_context
 from public.cuhalide_atlas_rag_documents d
 left join lateral(select e.erratum_key,e.published_value,e.corrected_value from public.cuhalide_atlas_release_errata e where e.release_version=d.release_version and e.structure_id=d.structure_id and e.field_name='Structural Dimensionality' and e.display_overlay_enabled=true order by e.reviewed_at desc nulls last,e.discovered_at desc limit 1)er on true
 where d.release_version in('3.0.2','current-curated-r1') and d.embedding is not null
),filtered as(
 select * from normalized n where
 (not(p_filters?'document_types')or n.document_type in(select jsonb_array_elements_text(p_filters->'document_types')))and
 (not(p_filters?'record_ids')or n.record_id in(select(jsonb_array_elements_text(p_filters->'record_ids'))::integer))and
 (not(p_filters?'structure_ids')or n.structure_id in(select jsonb_array_elements_text(p_filters->'structure_ids')))and
 (not(p_filters?'halogen')or n.effective_metadata->>'halogen'=p_filters->>'halogen'or n.effective_metadata->>'halogen'like'%'||(p_filters->>'halogen')||'%')and
 (not(p_filters?'dimension')or n.effective_dimension=p_filters->>'dimension'or n.effective_dimension like'%'||(p_filters->>'dimension')||'%')and
 (not(p_filters?'category')or n.effective_metadata->>'category'=p_filters->>'category')and
 (not(p_filters?'space_group')or n.effective_metadata->>'space_group'=p_filters->>'space_group')and
 (not(p_filters?'polar')or n.effective_metadata->>'polar'=p_filters->>'polar')and
 (not(p_filters?'sg_confidence')or n.effective_metadata->>'sg_confidence'=p_filters->>'sg_confidence')and
 (not(p_filters?'mapping_confidence')or n.effective_metadata->>'mapping_confidence'=p_filters->>'mapping_confidence')and
 (not(p_filters?'inclusion_status')or n.effective_metadata->>'inclusion_status'=p_filters->>'inclusion_status')and
 (not(p_filters?'canonical_eligibility')or n.effective_metadata->>'canonical_eligibility'=p_filters->>'canonical_eligibility')and
 (not(p_filters?'scope_status')or n.effective_metadata->>'scope_status'=p_filters->>'scope_status')and
 (not(p_filters?'release_status')or n.effective_metadata->>'release_status'=p_filters->>'release_status')and
 (not(p_filters?'evidence_level')or n.effective_metadata->>'evidence_level'=p_filters->>'evidence_level'or left(coalesce(n.effective_metadata->>'evidence_level',''),1)=p_filters->>'evidence_level')and
 (not(p_filters?'year_min')or coalesce((n.effective_metadata->>'year')::integer,0)>=(p_filters->>'year_min')::integer)and
 (not(p_filters?'year_max')or coalesce((n.effective_metadata->>'year')::integer,9999)<=(p_filters->>'year_max')::integer)
),lexical as(
 select f.id,row_number()over(order by ts_rank_cd(f.fts,websearch_to_tsquery('simple',qx.q))desc,f.id)rank_ix
 from filtered f cross join query_expansion qx
 where nullif(trim(qx.q),'')is not null and f.fts@@websearch_to_tsquery('simple',qx.q)
 order by ts_rank_cd(f.fts,websearch_to_tsquery('simple',qx.q))desc,f.id
 limit greatest(40,least(240,p_match_count*8))
),semantic as(
 select f.id,row_number()over(order by f.embedding<=>p_query_embedding,f.id)rank_ix,1-(f.embedding<=>p_query_embedding)similarity
 from filtered f order by f.embedding<=>p_query_embedding,f.id
 limit greatest(40,least(240,p_match_count*8))
),fused as(
 select coalesce(l.id,s.id)id,l.rank_ix lexical_rank,s.rank_ix semantic_rank,s.similarity semantic_similarity,
        coalesce(p_full_text_weight/(p_rrf_k+l.rank_ix),0.0)+coalesce(p_semantic_weight/(p_rrf_k+s.rank_ix),0.0)hybrid_score
 from lexical l full outer join semantic s using(id)
)
select n.id,n.release_version,n.document_key,n.document_type,n.record_id,n.structure_id,n.title,n.content,
       n.effective_context,n.effective_metadata,n.evidence,f.lexical_rank,f.semantic_rank,f.semantic_similarity,f.hybrid_score
from fused f join normalized n using(id)
order by f.hybrid_score desc,f.semantic_similarity desc nulls last,n.id
limit greatest(1,least(30,p_match_count));
$function$;

revoke execute on function public.cuhalide_atlas_current_curated_health_v1() from public,anon,authenticated;
revoke execute on function public.cuhalide_atlas_public_articles_query_current_v1(text,integer,integer,integer,integer,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke execute on function public.cuhalide_atlas_public_structures_query_current_v1(text,integer,integer,text,text,text,text,text,text,text,integer,boolean) from public,anon,authenticated;
revoke execute on function public.cuhalide_atlas_public_bootstrap_current_v1() from public,anon,authenticated;
revoke execute on function public.cuhalide_atlas_hybrid_search_current_v1(text,vector,integer,jsonb,double precision,double precision,integer) from public,anon,authenticated;
grant execute on function public.cuhalide_atlas_current_curated_health_v1() to service_role;
grant execute on function public.cuhalide_atlas_public_articles_query_current_v1(text,integer,integer,integer,integer,text,text,text,text,text,text,text) to service_role;
grant execute on function public.cuhalide_atlas_public_structures_query_current_v1(text,integer,integer,text,text,text,text,text,text,text,integer,boolean) to service_role;
grant execute on function public.cuhalide_atlas_public_bootstrap_current_v1() to service_role;
grant execute on function public.cuhalide_atlas_hybrid_search_current_v1(text,vector,integer,jsonb,double precision,double precision,integer) to service_role;

commit;
