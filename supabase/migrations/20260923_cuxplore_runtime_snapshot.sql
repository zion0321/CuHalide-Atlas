-- One consistent read replaces three concurrent REST round trips.
create or replace function public.cuxplore_runtime_snapshot_v1() returns jsonb language sql stable security definer set search_path='' as $$ select jsonb_build_object('h',public.cuhalide_atlas_current_curated_health_v1(),'cc',(select to_jsonb(s) from public.cuhalide_atlas_current_curated_state s where state_key='current'),'p',public.cuhalide_atlas_public_photophysics_health_v2()); $$;
revoke all on function public.cuxplore_runtime_snapshot_v1() from public,anon,authenticated;
grant execute on function public.cuxplore_runtime_snapshot_v1() to service_role;
notify pgrst,'reload schema';
