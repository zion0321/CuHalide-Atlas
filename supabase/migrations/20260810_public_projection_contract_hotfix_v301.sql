-- CuHalide Atlas release 3.0.1 public-projection contract hotfix.
-- Apply after 20260810_public_projection_v301.sql.

begin;

-- Article halogen filters use containment for single halogens (I/Br/Cl), while
-- explicit mixed labels (for example Cl/Br/I) remain exact categorical filters.
create or replace function public.cuhalide_atlas_public_articles_query_v301(
  p_q text default '', p_page integer default 1, p_page_size integer default 18,
  p_year_from integer default null, p_year_to integer default null,
  p_halogen text default null, p_dimension text default null, p_category text default null,
  p_evidence text default null, p_scope text default null, p_release_status text default null,
  p_sort text default 'year_desc'
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_size integer := greatest(1, least(coalesce(p_page_size,18),24));
  v_pages integer;
  v_page integer;
  v_items jsonb;
begin
  with f as (
    select * from public.cuhalide_atlas_public_articles_v301 a
    where (p_year_from is null or a.year>=p_year_from)
      and (p_year_to is null or a.year<=p_year_to)
      and (
        p_halogen is null or p_halogen='' or
        case
          when lower(p_halogen) in ('cl','br','i') then
            lower(p_halogen)=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))
          else lower(a.halogen)=lower(p_halogen)
        end
      )
      and (p_dimension is null or p_dimension='' or a.dimension_class=p_dimension)
      and (p_category is null or p_category='' or a.category=p_category)
      and (p_evidence is null or p_evidence='' or upper(a.evidence_level) like upper(p_evidence)||'%')
      and (p_scope is null or p_scope='' or a.scope_status=p_scope)
      and (p_release_status is null or p_release_status='' or a.release_status=p_release_status)
      and (
        coalesce(trim(p_q),'')='' or
        case
          when lower(trim(p_q)) in ('cl','br','i') then
            lower(trim(p_q))=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))
          when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then
            lower(trim(p_q))=any(regexp_split_to_array(lower(a.search_safe),'[^a-z0-9]+'))
          else a.search_safe ilike '%'||trim(p_q)||'%'
        end
      )
  )
  select count(*) into v_total from f;

  v_pages := greatest(1,ceil(v_total::numeric/v_size)::integer);
  v_page := least(greatest(1,coalesce(p_page,1)),v_pages);

  with f as (
    select * from public.cuhalide_atlas_public_articles_v301 a
    where (p_year_from is null or a.year>=p_year_from)
      and (p_year_to is null or a.year<=p_year_to)
      and (
        p_halogen is null or p_halogen='' or
        case
          when lower(p_halogen) in ('cl','br','i') then
            lower(p_halogen)=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))
          else lower(a.halogen)=lower(p_halogen)
        end
      )
      and (p_dimension is null or p_dimension='' or a.dimension_class=p_dimension)
      and (p_category is null or p_category='' or a.category=p_category)
      and (p_evidence is null or p_evidence='' or upper(a.evidence_level) like upper(p_evidence)||'%')
      and (p_scope is null or p_scope='' or a.scope_status=p_scope)
      and (p_release_status is null or p_release_status='' or a.release_status=p_release_status)
      and (
        coalesce(trim(p_q),'')='' or
        case
          when lower(trim(p_q)) in ('cl','br','i') then
            lower(trim(p_q))=any(regexp_split_to_array(lower(a.halogen),'[^a-z]+'))
          when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then
            lower(trim(p_q))=any(regexp_split_to_array(lower(a.search_safe),'[^a-z0-9]+'))
          else a.search_safe ilike '%'||trim(p_q)||'%'
        end
      )
    order by
      case when p_sort='year_asc' then a.year end asc nulls last,
      case when p_sort='title' then lower(a.title) end asc nulls last,
      case when p_sort='evidence' then lower(a.evidence_level) end asc nulls last,
      case when p_sort not in ('year_asc','title','evidence') then a.year end desc nulls last,
      a.record_id asc
    offset (v_page-1)*v_size
    limit v_size
  )
  select coalesce(jsonb_agg(to_jsonb(f)),'[]'::jsonb) into v_items from f;

  return jsonb_build_object(
    'items',v_items,
    'pagination',jsonb_build_object(
      'page',v_page,'page_size',v_size,'total',v_total,'total_pages',v_pages,
      'has_next',v_page<v_pages,'has_previous',v_page>1
    )
  );
end;
$$;

-- Explicit least privilege is reasserted because Supabase default grants may add
-- service-role table privileges when a table is first created.
revoke all privileges on public.cuhalide_atlas_public_articles_v301
  from anon, authenticated, service_role;
revoke all privileges on public.cuhalide_atlas_public_structures_v301
  from anon, authenticated, service_role;
grant select on public.cuhalide_atlas_public_articles_v301 to service_role;
grant select on public.cuhalide_atlas_public_structures_v301 to service_role;

-- Continuous projection-integrity and ACL contract. The MD5 values are hashes of
-- ordered, whitelisted release-3.0.1 projection rows with search_safe excluded.
create or replace function public.cuhalide_atlas_public_projection_health_v301()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_articles integer;
  v_canonical integer;
  v_structures integer;
  v_core integer;
  v_strict integer;
  v_errata integer;
  v_article_md5 text;
  v_structure_md5 text;
  v_article_i integer;
  v_article_mixed integer;
  v_policy_articles boolean;
  v_policy_structures boolean;
  v_anon_articles_select boolean;
  v_auth_articles_select boolean;
  v_anon_structures_select boolean;
  v_auth_structures_select boolean;
  v_anon_article_rpc boolean;
  v_auth_article_rpc boolean;
  v_anon_structure_rpc boolean;
  v_auth_structure_rpc boolean;
  v_service_articles_select boolean;
  v_service_articles_update boolean;
  v_service_structures_select boolean;
  v_service_structures_update boolean;
  v_ok boolean;
begin
  select count(*), count(*) filter (where release_status='Core - Verified')
  into v_articles, v_canonical
  from public.cuhalide_atlas_public_articles_v301;

  select count(*),
         count(*) filter (where eligibility='Core - Included'),
         count(*) filter (
           where eligibility='Core - Included'
             and polar='Yes'
             and sg_confidence='High'
             and mapping_confidence='High'
             and inclusion_status='Included'
         ),
         count(*) filter (where known_erratum)
  into v_structures, v_core, v_strict, v_errata
  from public.cuhalide_atlas_public_structures_v301;

  select md5(string_agg(md5((to_jsonb(a)-'search_safe')::text),'' order by a.record_id))
  into v_article_md5
  from public.cuhalide_atlas_public_articles_v301 a;

  select md5(string_agg(md5((to_jsonb(s)-'search_safe')::text),'' order by s.structure_id))
  into v_structure_md5
  from public.cuhalide_atlas_public_structures_v301 s;

  v_article_i := (
    public.cuhalide_atlas_public_articles_query_v301(
      '',1,1,null,null,'I',null,null,null,null,'Core - Verified','year_desc'
    )->'pagination'->>'total'
  )::integer;

  v_article_mixed := (
    public.cuhalide_atlas_public_articles_query_v301(
      '',1,1,null,null,'Cl/Br/I',null,null,null,null,'Core - Verified','year_desc'
    )->'pagination'->>'total'
  )::integer;

  select exists(
    select 1 from pg_policy
    where polrelid='public.cuhalide_atlas_public_articles_v301'::regclass
      and polname='cuhalide_public_articles_deny_untrusted'
  ) into v_policy_articles;

  select exists(
    select 1 from pg_policy
    where polrelid='public.cuhalide_atlas_public_structures_v301'::regclass
      and polname='cuhalide_public_structures_deny_untrusted'
  ) into v_policy_structures;

  v_anon_articles_select := has_table_privilege('anon','public.cuhalide_atlas_public_articles_v301','SELECT');
  v_auth_articles_select := has_table_privilege('authenticated','public.cuhalide_atlas_public_articles_v301','SELECT');
  v_anon_structures_select := has_table_privilege('anon','public.cuhalide_atlas_public_structures_v301','SELECT');
  v_auth_structures_select := has_table_privilege('authenticated','public.cuhalide_atlas_public_structures_v301','SELECT');
  v_anon_article_rpc := has_function_privilege('anon','public.cuhalide_atlas_public_articles_query_v301(text,integer,integer,integer,integer,text,text,text,text,text,text,text)','EXECUTE');
  v_auth_article_rpc := has_function_privilege('authenticated','public.cuhalide_atlas_public_articles_query_v301(text,integer,integer,integer,integer,text,text,text,text,text,text,text)','EXECUTE');
  v_anon_structure_rpc := has_function_privilege('anon','public.cuhalide_atlas_public_structures_query_v301(text,integer,integer,text,text,text,text,text,text,text,integer,boolean)','EXECUTE');
  v_auth_structure_rpc := has_function_privilege('authenticated','public.cuhalide_atlas_public_structures_query_v301(text,integer,integer,text,text,text,text,text,text,text,integer,boolean)','EXECUTE');
  v_service_articles_select := has_table_privilege('service_role','public.cuhalide_atlas_public_articles_v301','SELECT');
  v_service_articles_update := has_table_privilege('service_role','public.cuhalide_atlas_public_articles_v301','UPDATE');
  v_service_structures_select := has_table_privilege('service_role','public.cuhalide_atlas_public_structures_v301','SELECT');
  v_service_structures_update := has_table_privilege('service_role','public.cuhalide_atlas_public_structures_v301','UPDATE');

  v_ok := v_articles=346
    and v_canonical=332
    and v_structures=878
    and v_core=816
    and v_strict=67
    and v_errata=4
    and v_article_md5='d6fafdae464add3a3e607069dabe1e0e'
    and v_structure_md5='3deadc8d3cbe7f6e04fff9c2481635b7'
    and v_article_i=247
    and v_article_mixed=27
    and v_policy_articles
    and v_policy_structures
    and not v_anon_articles_select
    and not v_auth_articles_select
    and not v_anon_structures_select
    and not v_auth_structures_select
    and not v_anon_article_rpc
    and not v_auth_article_rpc
    and not v_anon_structure_rpc
    and not v_auth_structure_rpc
    and v_service_articles_select
    and not v_service_articles_update
    and v_service_structures_select
    and not v_service_structures_update;

  return jsonb_build_object(
    'ok',v_ok,
    'counts',jsonb_build_object(
      'articles',v_articles,'canonical_articles',v_canonical,
      'structures',v_structures,'core_structures',v_core,
      'strict_polar',v_strict,'errata_rows',v_errata
    ),
    'semantic_contract',jsonb_build_object(
      'canonical_articles_containing_i',v_article_i,
      'canonical_exact_cl_br_i',v_article_mixed,
      'iodide_expected',247,
      'cl_br_i_expected',27
    ),
    'checksums',jsonb_build_object(
      'article_projection_md5',v_article_md5,
      'structure_projection_md5',v_structure_md5,
      'article_expected','d6fafdae464add3a3e607069dabe1e0e',
      'structure_expected','3deadc8d3cbe7f6e04fff9c2481635b7'
    ),
    'security',jsonb_build_object(
      'article_deny_policy',v_policy_articles,
      'structure_deny_policy',v_policy_structures,
      'anon_article_select',v_anon_articles_select,
      'authenticated_article_select',v_auth_articles_select,
      'anon_structure_select',v_anon_structures_select,
      'authenticated_structure_select',v_auth_structures_select,
      'anon_article_rpc',v_anon_article_rpc,
      'authenticated_article_rpc',v_auth_article_rpc,
      'anon_structure_rpc',v_anon_structure_rpc,
      'authenticated_structure_rpc',v_auth_structure_rpc,
      'service_article_select',v_service_articles_select,
      'service_article_update',v_service_articles_update,
      'service_structure_select',v_service_structures_select,
      'service_structure_update',v_service_structures_update
    )
  );
end;
$$;

revoke all on function public.cuhalide_atlas_public_projection_health_v301()
  from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_public_projection_health_v301()
  to service_role;

commit;
