-- CuHalide Atlas runtime health snapshot
-- Keeps the exhaustive scientific audit fail-closed, but removes full-corpus scans
-- from high-frequency public health/read paths.

create table if not exists public.cuhalide_atlas_runtime_health_snapshot_v1 (
  state_key text primary key check (state_key = 'current'),
  current_curated_revision integer not null,
  current_health jsonb not null,
  photophysics_health jsonb not null,
  source_state_updated_at timestamptz not null,
  validated_at timestamptz not null default now()
);

alter table public.cuhalide_atlas_runtime_health_snapshot_v1 enable row level security;
revoke all on public.cuhalide_atlas_runtime_health_snapshot_v1 from public, anon, authenticated;

do $$
declare d text;
begin
  if to_regprocedure('public.cuhalide_atlas_current_curated_health_audit_v1()') is null then
    select pg_get_functiondef(p.oid) into d
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='cuhalide_atlas_current_curated_health_v1'
      and pg_get_function_identity_arguments(p.oid)='';
    if d is null then raise exception 'current curated health source function not found'; end if;
    d := replace(
      d,
      'FUNCTION public.cuhalide_atlas_current_curated_health_v1()',
      'FUNCTION public.cuhalide_atlas_current_curated_health_audit_v1()'
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
  cc public.cuhalide_atlas_current_curated_state%rowtype;
begin
  select * into cc from public.cuhalide_atlas_current_curated_state where state_key='current';
  if cc.state_key is null then raise exception 'current curated state missing'; end if;

  h := public.cuhalide_atlas_current_curated_health_audit_v1();
  p := public.cuhalide_atlas_public_photophysics_health_v2();

  if coalesce((h->>'ok')::boolean,false) is not true then
    raise exception 'current curated full audit failed';
  end if;
  if coalesce((p->>'ok')::boolean,false) is not true then
    raise exception 'photophysics full audit failed';
  end if;
  if coalesce((h->'batch'->>'live_revision')::integer,0) <> cc.live_revision then
    raise exception 'health revision % does not match current state %',
      h->'batch'->>'live_revision', cc.live_revision;
  end if;

  insert into public.cuhalide_atlas_runtime_health_snapshot_v1(
    state_key,current_curated_revision,current_health,photophysics_health,
    source_state_updated_at,validated_at
  )
  values('current',cc.live_revision,h,p,cc.updated_at,now())
  on conflict(state_key) do update set
    current_curated_revision=excluded.current_curated_revision,
    current_health=excluded.current_health,
    photophysics_health=excluded.photophysics_health,
    source_state_updated_at=excluded.source_state_updated_at,
    validated_at=excluded.validated_at;

  return jsonb_build_object(
    'ok',true,
    'current_curated_revision',cc.live_revision,
    'validated_at',(select validated_at from public.cuhalide_atlas_runtime_health_snapshot_v1 where state_key='current')
  );
end $$;

revoke all on function public.cuhalide_atlas_refresh_runtime_health_snapshot_v1() from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_refresh_runtime_health_snapshot_v1() to service_role;

select public.cuhalide_atlas_refresh_runtime_health_snapshot_v1();

create or replace function public.cuhalide_atlas_current_curated_health_v1()
returns jsonb
language sql
stable
security definer
set search_path to 'public','pg_catalog'
as $$
select case
  when s.state_key='current'
   and s.current_curated_revision=cc.live_revision
   and s.source_state_updated_at >= cc.updated_at
  then s.current_health || jsonb_build_object(
    'runtime_snapshot',true,
    'validated_at',s.validated_at,
    'source_state_updated_at',s.source_state_updated_at
  )
  else jsonb_build_object(
    'ok',false,
    'runtime_snapshot',true,
    'error','runtime health snapshot is stale or unavailable',
    'current_curated_revision',cc.live_revision,
    'snapshot_revision',s.current_curated_revision,
    'validated_at',s.validated_at
  )
end
from public.cuhalide_atlas_current_curated_state cc
left join public.cuhalide_atlas_runtime_health_snapshot_v1 s on s.state_key='current'
where cc.state_key='current';
$$;

create or replace function public.cuxplore_runtime_snapshot_v1()
returns jsonb
language sql
stable
security definer
set search_path to ''
as $$
select jsonb_build_object(
  'h',
    case
      when s.state_key='current'
       and s.current_curated_revision=cc.live_revision
       and s.source_state_updated_at >= cc.updated_at
      then s.current_health || jsonb_build_object(
        'runtime_snapshot',true,
        'validated_at',s.validated_at,
        'source_state_updated_at',s.source_state_updated_at
      )
      else jsonb_build_object(
        'ok',false,
        'runtime_snapshot',true,
        'error','runtime health snapshot is stale or unavailable',
        'current_curated_revision',cc.live_revision,
        'snapshot_revision',s.current_curated_revision,
        'validated_at',s.validated_at
      )
    end,
  'cc',to_jsonb(cc),
  'p',
    case
      when s.state_key='current'
       and s.current_curated_revision=cc.live_revision
       and s.source_state_updated_at >= cc.updated_at
      then s.photophysics_health || jsonb_build_object(
        'runtime_snapshot',true,
        'validated_at',s.validated_at
      )
      else jsonb_build_object(
        'ok',false,
        'version','1.4.0',
        'runtime_snapshot',true,
        'error','runtime health snapshot is stale or unavailable'
      )
    end
)
from public.cuhalide_atlas_current_curated_state cc
left join public.cuhalide_atlas_runtime_health_snapshot_v1 s on s.state_key='current'
where cc.state_key='current';
$$;

revoke all on function public.cuhalide_atlas_current_curated_health_audit_v1() from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_current_curated_health_audit_v1() to service_role;
revoke all on function public.cuhalide_atlas_current_curated_health_v1() from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_current_curated_health_v1() to service_role;
revoke all on function public.cuxplore_runtime_snapshot_v1() from public, anon, authenticated;
grant execute on function public.cuxplore_runtime_snapshot_v1() to service_role;

notify pgrst,'reload schema';
