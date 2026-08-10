-- CuHalide Atlas release 3.0.1 projection health extension.
-- Adds dashboard/filter aggregate invariants and bootstrap-RPC ACL checks to the
-- SHA-256 projection integrity contract.

begin;

create or replace function public.cuhalide_atlas_public_projection_health_v301()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  c public.cuhalide_atlas_public_projection_contract_v301%rowtype;
  b jsonb;
  v_articles integer;
  v_canonical integer;
  v_structures integer;
  v_core integer;
  v_strict integer;
  v_errata integer;
  v_article_sha256 text;
  v_structure_sha256 text;
  v_article_i integer;
  v_article_mixed integer;
  v_compact_i boolean;
  v_ligand_i_guard boolean;
  v_oxidation_guard boolean;
  v_dimension_mixed boolean;
  v_s008_i boolean;
  v_s162_not_i boolean;
  v_boot_year_sum integer;
  v_boot_halogen_sum integer;
  v_boot_article_dim_sum integer;
  v_boot_structure_dim_sum integer;
  v_boot_resolved integer;
  v_boot_sg_sum integer;
  v_boot_structure_halogen_filters boolean;
  v_policy_articles boolean;
  v_policy_structures boolean;
  v_policy_contract boolean;
  v_anon_articles_select boolean;
  v_auth_articles_select boolean;
  v_anon_structures_select boolean;
  v_auth_structures_select boolean;
  v_anon_contract_select boolean;
  v_auth_contract_select boolean;
  v_anon_article_rpc boolean;
  v_auth_article_rpc boolean;
  v_anon_structure_rpc boolean;
  v_auth_structure_rpc boolean;
  v_anon_bootstrap_rpc boolean;
  v_auth_bootstrap_rpc boolean;
  v_anon_health_rpc boolean;
  v_auth_health_rpc boolean;
  v_service_articles_select boolean;
  v_service_articles_update boolean;
  v_service_structures_select boolean;
  v_service_structures_update boolean;
  v_service_contract_select boolean;
  v_service_contract_update boolean;
  v_ok boolean;
begin
  select * into c
  from public.cuhalide_atlas_public_projection_contract_v301
  where release_version='3.0.1';

  if not found then
    return jsonb_build_object('ok',false,'error','projection contract baseline missing');
  end if;

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

  select encode(
    digest(
      string_agg(
        encode(digest((to_jsonb(a)-'search_safe')::text,'sha256'),'hex'),
        '' order by a.record_id
      ),
      'sha256'
    ),
    'hex'
  )
  into v_article_sha256
  from public.cuhalide_atlas_public_articles_v301 a;

  select encode(
    digest(
      string_agg(
        encode(digest((to_jsonb(s)-'search_safe')::text,'sha256'),'hex'),
        '' order by s.structure_id
      ),
      'sha256'
    ),
    'hex'
  )
  into v_structure_sha256
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

  v_compact_i := public.cuhalide_formula_halogen_v1('Cu2I4','Cl/Br/I')='I';
  v_ligand_i_guard := public.cuhalide_formula_halogen_v1('Cu(PPh3)2(C6H4I)','Cl')='Cl';
  v_oxidation_guard := public.cuhalide_formula_halogen_v1(
    'Cu(I) halide tetrazolate coordination polymers','Cl/Br/I'
  )='Cl/Br/I';
  v_dimension_mixed := public.cuhalide_dimension_class_v1('2D; 3D')='Mixed / series-level';

  select coalesce((
    select halogen_effective='I'
    from public.cuhalide_atlas_public_structures_v301
    where structure_id='CUH-008-S01'
  ),false)
  into v_s008_i;

  select coalesce((
    select halogen_effective<>'I'
    from public.cuhalide_atlas_public_structures_v301
    where structure_id='CUH-162-S01'
  ),false)
  into v_s162_not_i;

  b := public.cuhalide_atlas_public_bootstrap_v301();

  select coalesce(sum((x->>'count')::integer),0)
  into v_boot_year_sum
  from jsonb_array_elements(b->'overview'->'years') x;

  select coalesce(sum((x->>'count')::integer),0)
  into v_boot_halogen_sum
  from jsonb_array_elements(b->'overview'->'halogens') x;

  select coalesce(sum((x->>'count')::integer),0)
  into v_boot_article_dim_sum
  from jsonb_array_elements(b->'overview'->'article_dimension_classes') x;

  select coalesce(sum((x->>'count')::integer),0)
  into v_boot_structure_dim_sum
  from jsonb_array_elements(b->'overview'->'structure_dimension_classes') x;

  v_boot_resolved := coalesce((b->'overview'->>'resolved_space_group_rows')::integer,0);

  select coalesce(sum((x->>'structure_count')::integer),0)
  into v_boot_sg_sum
  from jsonb_array_elements(b->'overview'->'space_groups') x;

  v_boot_structure_halogen_filters :=
    (b->'filters'->'structure'->'halogens') @> '["Cl","Br","I"]'::jsonb;

  select exists(
    select 1 from pg_policy
    where polrelid='public.cuhalide_atlas_public_articles_v301'::regclass
      and polname='cuhalide_public_articles_deny_untrusted'
  )
  into v_policy_articles;

  select exists(
    select 1 from pg_policy
    where polrelid='public.cuhalide_atlas_public_structures_v301'::regclass
      and polname='cuhalide_public_structures_deny_untrusted'
  )
  into v_policy_structures;

  select exists(
    select 1 from pg_policy
    where polrelid='public.cuhalide_atlas_public_projection_contract_v301'::regclass
      and polname='cuhalide_public_projection_contract_deny_untrusted'
  )
  into v_policy_contract;

  v_anon_articles_select := has_table_privilege('anon','public.cuhalide_atlas_public_articles_v301','SELECT');
  v_auth_articles_select := has_table_privilege('authenticated','public.cuhalide_atlas_public_articles_v301','SELECT');
  v_anon_structures_select := has_table_privilege('anon','public.cuhalide_atlas_public_structures_v301','SELECT');
  v_auth_structures_select := has_table_privilege('authenticated','public.cuhalide_atlas_public_structures_v301','SELECT');
  v_anon_contract_select := has_table_privilege('anon','public.cuhalide_atlas_public_projection_contract_v301','SELECT');
  v_auth_contract_select := has_table_privilege('authenticated','public.cuhalide_atlas_public_projection_contract_v301','SELECT');

  v_anon_article_rpc := has_function_privilege(
    'anon',
    'public.cuhalide_atlas_public_articles_query_v301(text,integer,integer,integer,integer,text,text,text,text,text,text,text)',
    'EXECUTE'
  );
  v_auth_article_rpc := has_function_privilege(
    'authenticated',
    'public.cuhalide_atlas_public_articles_query_v301(text,integer,integer,integer,integer,text,text,text,text,text,text,text)',
    'EXECUTE'
  );
  v_anon_structure_rpc := has_function_privilege(
    'anon',
    'public.cuhalide_atlas_public_structures_query_v301(text,integer,integer,text,text,text,text,text,text,text,integer,boolean)',
    'EXECUTE'
  );
  v_auth_structure_rpc := has_function_privilege(
    'authenticated',
    'public.cuhalide_atlas_public_structures_query_v301(text,integer,integer,text,text,text,text,text,text,text,integer,boolean)',
    'EXECUTE'
  );
  v_anon_bootstrap_rpc := has_function_privilege(
    'anon','public.cuhalide_atlas_public_bootstrap_v301()','EXECUTE'
  );
  v_auth_bootstrap_rpc := has_function_privilege(
    'authenticated','public.cuhalide_atlas_public_bootstrap_v301()','EXECUTE'
  );
  v_anon_health_rpc := has_function_privilege(
    'anon','public.cuhalide_atlas_public_projection_health_v301()','EXECUTE'
  );
  v_auth_health_rpc := has_function_privilege(
    'authenticated','public.cuhalide_atlas_public_projection_health_v301()','EXECUTE'
  );

  v_service_articles_select := has_table_privilege('service_role','public.cuhalide_atlas_public_articles_v301','SELECT');
  v_service_articles_update := has_table_privilege('service_role','public.cuhalide_atlas_public_articles_v301','UPDATE');
  v_service_structures_select := has_table_privilege('service_role','public.cuhalide_atlas_public_structures_v301','SELECT');
  v_service_structures_update := has_table_privilege('service_role','public.cuhalide_atlas_public_structures_v301','UPDATE');
  v_service_contract_select := has_table_privilege('service_role','public.cuhalide_atlas_public_projection_contract_v301','SELECT');
  v_service_contract_update := has_table_privilege('service_role','public.cuhalide_atlas_public_projection_contract_v301','UPDATE');

  v_ok :=
       v_articles=c.article_rows
   and v_canonical=c.canonical_articles
   and v_structures=c.structure_rows
   and v_core=c.core_structures
   and v_strict=c.strict_polar_rows
   and v_errata=c.errata_rows
   and v_article_sha256=c.article_sha256
   and v_structure_sha256=c.structure_sha256
   and v_article_i=c.canonical_articles_containing_i
   and v_article_mixed=c.canonical_exact_cl_br_i
   and v_compact_i
   and v_ligand_i_guard
   and v_oxidation_guard
   and v_dimension_mixed
   and v_s008_i
   and v_s162_not_i
   and v_boot_year_sum=c.canonical_articles
   and v_boot_halogen_sum=c.canonical_articles
   and v_boot_article_dim_sum=c.canonical_articles
   and v_boot_structure_dim_sum=c.core_structures
   and v_boot_resolved=650
   and v_boot_sg_sum=650
   and v_boot_structure_halogen_filters
   and v_policy_articles
   and v_policy_structures
   and v_policy_contract
   and not v_anon_articles_select
   and not v_auth_articles_select
   and not v_anon_structures_select
   and not v_auth_structures_select
   and not v_anon_contract_select
   and not v_auth_contract_select
   and not v_anon_article_rpc
   and not v_auth_article_rpc
   and not v_anon_structure_rpc
   and not v_auth_structure_rpc
   and not v_anon_bootstrap_rpc
   and not v_auth_bootstrap_rpc
   and not v_anon_health_rpc
   and not v_auth_health_rpc
   and v_service_articles_select
   and not v_service_articles_update
   and v_service_structures_select
   and not v_service_structures_update
   and v_service_contract_select
   and not v_service_contract_update;

  return jsonb_build_object(
    'ok',v_ok,
    'counts',jsonb_build_object(
      'articles',v_articles,
      'canonical_articles',v_canonical,
      'structures',v_structures,
      'core_structures',v_core,
      'strict_polar',v_strict,
      'errata_rows',v_errata
    ),
    'semantic_contract',jsonb_build_object(
      'canonical_articles_containing_i',v_article_i,
      'canonical_exact_cl_br_i',v_article_mixed,
      'compact_iodide_parser',v_compact_i,
      'halogenated_ligand_guard',v_ligand_i_guard,
      'oxidation_state_guard',v_oxidation_guard,
      'mixed_dimension_classifier',v_dimension_mixed,
      'CUH-008-S01_is_I',v_s008_i,
      'CUH-162-S01_not_false_I',v_s162_not_i
    ),
    'bootstrap_contract',jsonb_build_object(
      'year_sum',v_boot_year_sum,
      'halogen_sum',v_boot_halogen_sum,
      'article_dimension_sum',v_boot_article_dim_sum,
      'structure_dimension_sum',v_boot_structure_dim_sum,
      'resolved_space_group_rows',v_boot_resolved,
      'space_group_sum',v_boot_sg_sum,
      'structure_halogen_filters_present',v_boot_structure_halogen_filters
    ),
    'checksums',jsonb_build_object(
      'algorithm','SHA-256',
      'article_projection_match',v_article_sha256=c.article_sha256,
      'structure_projection_match',v_structure_sha256=c.structure_sha256
    ),
    'security',jsonb_build_object(
      'article_deny_policy',v_policy_articles,
      'structure_deny_policy',v_policy_structures,
      'contract_deny_policy',v_policy_contract,
      'anon_article_select',v_anon_articles_select,
      'authenticated_article_select',v_auth_articles_select,
      'anon_structure_select',v_anon_structures_select,
      'authenticated_structure_select',v_auth_structures_select,
      'anon_contract_select',v_anon_contract_select,
      'authenticated_contract_select',v_auth_contract_select,
      'anon_article_rpc',v_anon_article_rpc,
      'authenticated_article_rpc',v_auth_article_rpc,
      'anon_structure_rpc',v_anon_structure_rpc,
      'authenticated_structure_rpc',v_auth_structure_rpc,
      'anon_bootstrap_rpc',v_anon_bootstrap_rpc,
      'authenticated_bootstrap_rpc',v_auth_bootstrap_rpc,
      'anon_health_rpc',v_anon_health_rpc,
      'authenticated_health_rpc',v_auth_health_rpc,
      'service_article_select',v_service_articles_select,
      'service_article_update',v_service_articles_update,
      'service_structure_select',v_service_structures_select,
      'service_structure_update',v_service_structures_update,
      'service_contract_select',v_service_contract_select,
      'service_contract_update',v_service_contract_update
    )
  );
end;
$$;

revoke all on function public.cuhalide_atlas_public_projection_health_v301()
  from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_public_projection_health_v301()
  to service_role;

commit;
