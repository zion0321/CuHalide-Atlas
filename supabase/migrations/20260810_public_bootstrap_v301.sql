-- CuHalide Atlas release 3.0.1 projection-backed public bootstrap.
-- Replaces public dashboard/filter aggregation from full snapshot reconstruction
-- with service-role-only SQL aggregation over the whitelisted v301 projections.

begin;

create or replace function public.cuhalide_atlas_public_bootstrap_v301()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_years jsonb;
  v_halogens jsonb;
  v_article_dims jsonb;
  v_structure_dims jsonb;
  v_categories jsonb;
  v_space_groups jsonb;
  v_resolved integer;
  v_article_filter_halogens jsonb;
  v_article_filter_dims jsonb;
  v_article_filter_categories jsonb;
  v_structure_filter_halogens jsonb;
  v_structure_filter_dims jsonb;
  v_structure_filter_space_groups jsonb;
begin
  select coalesce(
    jsonb_agg(jsonb_build_object('year',year,'count',n) order by year),
    '[]'::jsonb
  )
  into v_years
  from (
    select year, count(*)::integer n
    from public.cuhalide_atlas_public_articles_v301
    where release_status='Core - Verified'
      and year is not null
    group by year
  ) q;

  select coalesce(
    jsonb_agg(jsonb_build_object('label',halogen,'count',n) order by n desc, halogen),
    '[]'::jsonb
  )
  into v_halogens
  from (
    select coalesce(nullif(halogen,''),'Unresolved') halogen, count(*)::integer n
    from public.cuhalide_atlas_public_articles_v301
    where release_status='Core - Verified'
    group by coalesce(nullif(halogen,''),'Unresolved')
  ) q;

  select coalesce(
    jsonb_agg(jsonb_build_object('label',dimension_class,'count',n) order by n desc, dimension_class),
    '[]'::jsonb
  )
  into v_article_dims
  from (
    select dimension_class, count(*)::integer n
    from public.cuhalide_atlas_public_articles_v301
    where release_status='Core - Verified'
    group by dimension_class
  ) q;

  select coalesce(
    jsonb_agg(jsonb_build_object('label',dimension_class,'count',n) order by n desc, dimension_class),
    '[]'::jsonb
  )
  into v_structure_dims
  from (
    select dimension_class, count(*)::integer n
    from public.cuhalide_atlas_public_structures_v301
    where eligibility='Core - Included'
    group by dimension_class
  ) q;

  select coalesce(
    jsonb_agg(jsonb_build_object('label',category,'count',n) order by n desc, category),
    '[]'::jsonb
  )
  into v_categories
  from (
    select coalesce(nullif(category,''),'Unresolved') category, count(*)::integer n
    from public.cuhalide_atlas_public_articles_v301
    where release_status='Core - Verified'
    group by coalesce(nullif(category,''),'Unresolved')
  ) q;

  select count(*)::integer
  into v_resolved
  from public.cuhalide_atlas_public_structures_v301
  where nullif(trim(space_group),'') is not null
    and lower(trim(space_group)) not in ('unresolved','unknown','not reported','not available');

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'space_group',space_group,
        'structure_count',structure_count,
        'article_count',article_count
      )
      order by structure_count desc, space_group
    ),
    '[]'::jsonb
  )
  into v_space_groups
  from (
    select
      space_group,
      count(*)::integer structure_count,
      count(distinct record_id)::integer article_count
    from public.cuhalide_atlas_public_structures_v301
    where nullif(trim(space_group),'') is not null
      and lower(trim(space_group)) not in ('unresolved','unknown','not reported','not available')
    group by space_group
  ) q;

  select coalesce(jsonb_agg(x order by x),'[]'::jsonb)
  into v_article_filter_halogens
  from (
    select distinct coalesce(nullif(halogen,''),'Unresolved') x
    from public.cuhalide_atlas_public_articles_v301
  ) q;

  select coalesce(jsonb_agg(x order by x),'[]'::jsonb)
  into v_article_filter_dims
  from (
    select distinct dimension_class x
    from public.cuhalide_atlas_public_articles_v301
  ) q;

  select coalesce(jsonb_agg(x order by x),'[]'::jsonb)
  into v_article_filter_categories
  from (
    select distinct coalesce(nullif(category,''),'Unresolved') x
    from public.cuhalide_atlas_public_articles_v301
  ) q;

  select coalesce(
    jsonb_agg(
      x order by
      case x when 'Cl' then 1 when 'Br' then 2 when 'I' then 3 when 'Unresolved' then 99 else 10 end,
      x
    ),
    '[]'::jsonb
  )
  into v_structure_filter_halogens
  from (
    select distinct coalesce(nullif(halogen_effective,''),'Unresolved') x
    from public.cuhalide_atlas_public_structures_v301
  ) q;

  select coalesce(jsonb_agg(x order by x),'[]'::jsonb)
  into v_structure_filter_dims
  from (
    select distinct dimension_class x
    from public.cuhalide_atlas_public_structures_v301
  ) q;

  select coalesce(jsonb_agg(x order by x),'[]'::jsonb)
  into v_structure_filter_space_groups
  from (
    select distinct space_group x
    from public.cuhalide_atlas_public_structures_v301
    where nullif(trim(space_group),'') is not null
      and lower(trim(space_group)) not in ('unresolved','unknown','not reported','not available')
  ) q;

  return jsonb_build_object(
    'overview',jsonb_build_object(
      'years',v_years,
      'halogens',v_halogens,
      'article_dimension_classes',v_article_dims,
      'structure_dimension_classes',v_structure_dims,
      'categories',v_categories,
      'space_groups',v_space_groups,
      'resolved_space_group_rows',v_resolved
    ),
    'filters',jsonb_build_object(
      'article',jsonb_build_object(
        'halogens',v_article_filter_halogens,
        'dimensions',v_article_filter_dims,
        'categories',v_article_filter_categories
      ),
      'structure',jsonb_build_object(
        'halogens',v_structure_filter_halogens,
        'dimensions',v_structure_filter_dims,
        'space_groups',v_structure_filter_space_groups
      )
    )
  );
end;
$$;

revoke all on function public.cuhalide_atlas_public_bootstrap_v301()
  from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_public_bootstrap_v301()
  to service_role;

commit;
