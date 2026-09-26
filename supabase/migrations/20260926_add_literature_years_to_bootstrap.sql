-- Add the DOI-deduplicated literature-corpus year series to the public bootstrap payload.
-- The existing structured-data year series remains available as overview.years for compatibility.

do $$
declare
  ddl text;
begin
  select pg_get_functiondef(p.oid) into ddl
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='cuhalide_atlas_public_bootstrap_current_v1'
  limit 1;

  if ddl is null then
    raise exception 'cuhalide_atlas_public_bootstrap_current_v1 not found';
  end if;

  if position('v_literature_years' in ddl)=0 then
    ddl:=replace(
      ddl,
      'declare v_years jsonb;v_halogens jsonb;',
      'declare v_years jsonb;v_literature_years jsonb;v_halogens jsonb;'
    );

    ddl:=replace(
      ddl,
      'select coalesce(jsonb_agg(jsonb_build_object(''year'',year,''count'',n) order by year),''[]'') into v_years from(select year,count(*)::int n from public.cuhalide_atlas_public_articles_current_v1 where release_status in(''Core - Verified'',''Current Curated - Verified'') and year is not null group by year)q;',
      'select coalesce(jsonb_agg(jsonb_build_object(''year'',year,''count'',n) order by year),''[]'') into v_years from(select year,count(*)::int n from public.cuhalide_atlas_public_articles_current_v1 where release_status in(''Core - Verified'',''Current Curated - Verified'') and year is not null group by year)q; select coalesce(jsonb_agg(jsonb_build_object(''year'',year,''count'',n) order by year),''[]'') into v_literature_years from(select year,count(*)::int n from atlas_internal.cuhalide_knowledge_catalog_v1 where year is not null group by year)q;'
    );

    ddl:=replace(
      ddl,
      '''overview'',jsonb_build_object(''years'',v_years,''halogens''',
      '''overview'',jsonb_build_object(''years'',v_years,''literature_years'',v_literature_years,''halogens'''
    );

    if position('v_literature_years' in ddl)=0 then
      raise exception 'literature-year bootstrap patch did not apply';
    end if;

    execute ddl;
  end if;
end
$$;

revoke all on function public.cuhalide_atlas_public_bootstrap_current_v1() from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_public_bootstrap_current_v1() to service_role;
