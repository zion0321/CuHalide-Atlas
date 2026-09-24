-- CuXplore full-text runtime health snapshot
-- Preserve the exhaustive v2 source-index audit as an explicit audit function,
-- while serving high-frequency knowledge requests from the validated snapshot.

alter table public.cuhalide_atlas_runtime_health_snapshot_v1
  add column if not exists fulltext_health jsonb;

do $$
declare d text;
begin
  if to_regprocedure('public.cuxplore_fulltext_v2_health_audit()') is null then
    select pg_get_functiondef(p.oid) into d
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='cuxplore_fulltext_v2_health'
      and pg_get_function_identity_arguments(p.oid)='';
    if d is null then raise exception 'fulltext v2 health source function not found'; end if;
    d := replace(
      d,
      'FUNCTION public.cuxplore_fulltext_v2_health()',
      'FUNCTION public.cuxplore_fulltext_v2_health_audit()'
    );
    execute d;
  end if;
end $$;

create or replace function public.cuhalide_atlas_refresh_runtime_health_snapshot_v1()
returns jsonb
language plpgsql
security definer
set search_path to 'public','extensions','pg_catalog'
as $$
declare
  h jsonb;
  p jsonb;
  f jsonb;
  cc public.cuhalide_atlas_current_curated_state%rowtype;
begin
  select * into cc from public.cuhalide_atlas_current_curated_state where state_key='current';
  if cc.state_key is null then raise exception 'current curated state missing'; end if;

  h := public.cuhalide_atlas_current_curated_health_audit_v1();
  p := public.cuhalide_atlas_public_photophysics_health_v2();
  f := public.cuxplore_fulltext_v2_health_audit();

  if coalesce((h->>'ok')::boolean,false) is not true then raise exception 'current curated full audit failed'; end if;
  if coalesce((p->>'ok')::boolean,false) is not true then raise exception 'photophysics full audit failed'; end if;
  if coalesce((f->>'ok')::boolean,false) is not true then raise exception 'fulltext v2 full audit failed'; end if;
  if coalesce((h->'batch'->>'live_revision')::integer,0) <> cc.live_revision then
    raise exception 'health revision % does not match current state %', h->'batch'->>'live_revision', cc.live_revision;
  end if;

  insert into public.cuhalide_atlas_runtime_health_snapshot_v1(
    state_key,current_curated_revision,current_health,photophysics_health,fulltext_health,
    source_state_updated_at,validated_at
  )
  values('current',cc.live_revision,h,p,f,cc.updated_at,now())
  on conflict(state_key) do update set
    current_curated_revision=excluded.current_curated_revision,
    current_health=excluded.current_health,
    photophysics_health=excluded.photophysics_health,
    fulltext_health=excluded.fulltext_health,
    source_state_updated_at=excluded.source_state_updated_at,
    validated_at=excluded.validated_at;

  return jsonb_build_object(
    'ok',true,
    'current_curated_revision',cc.live_revision,
    'validated_at',(select validated_at from public.cuhalide_atlas_runtime_health_snapshot_v1 where state_key='current')
  );
end $$;

select public.cuhalide_atlas_refresh_runtime_health_snapshot_v1();

create or replace function public.cuxplore_fulltext_v2_health()
returns jsonb
language sql
stable
security definer
set search_path to ''
as $$
select case
  when s.state_key='current'
   and s.current_curated_revision=cc.live_revision
   and s.source_state_updated_at >= cc.updated_at
   and coalesce((s.fulltext_health->>'ok')::boolean,false)
  then s.fulltext_health || jsonb_build_object(
    'runtime_snapshot',true,
    'validated_at',s.validated_at
  )
  else jsonb_build_object(
    'ok',false,
    'release','cuxplore-fulltext-v2-20260924',
    'runtime_snapshot',true,
    'error','fulltext runtime health snapshot is stale or unavailable',
    'current_curated_revision',cc.live_revision,
    'snapshot_revision',s.current_curated_revision,
    'validated_at',s.validated_at,
    'semantic_index_separate',true,
    'raw_source_text_exposed',false
  )
end
from public.cuhalide_atlas_current_curated_state cc
left join public.cuhalide_atlas_runtime_health_snapshot_v1 s on s.state_key='current'
where cc.state_key='current';
$$;

revoke all on function public.cuxplore_fulltext_v2_health_audit() from public, anon, authenticated;
grant execute on function public.cuxplore_fulltext_v2_health_audit() to service_role;
revoke all on function public.cuxplore_fulltext_v2_health() from public, anon, authenticated;
grant execute on function public.cuxplore_fulltext_v2_health() to service_role;

notify pgrst,'reload schema';
