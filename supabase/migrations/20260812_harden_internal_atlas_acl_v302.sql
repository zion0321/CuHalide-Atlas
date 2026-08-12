-- CuHalide Atlas release 3.0.2 least-privilege hardening.
-- Public access is mediated by release-specific Edge/Vercel query-and-view contracts.
-- Legacy raw tables and raw-payload search RPCs are service-role only.

begin;

drop policy if exists "public read atlas articles" on public.cuhalide_atlas_articles;
drop policy if exists "authenticated read candidate queue" on public.cuhalide_atlas_candidate_queue;
drop policy if exists "public read known dois" on public.cuhalide_atlas_known_dois;
drop policy if exists "public read atlas payload chunks" on public.cuhalide_atlas_payload_chunks;
drop policy if exists "public read atlas release" on public.cuhalide_atlas_release;
drop policy if exists "public read atlas releases" on public.cuhalide_atlas_releases;
drop policy if exists "public read atlas structures" on public.cuhalide_atlas_structures;
drop policy if exists "public read atlas sync runs" on public.cuhalide_atlas_sync_runs;

revoke all privileges on table public.cuhalide_atlas_articles from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_candidate_queue from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_known_dois from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_payload_chunks from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_release from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_releases from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_structures from public, anon, authenticated;
revoke all privileges on table public.cuhalide_atlas_sync_runs from public, anon, authenticated;

grant all privileges on table public.cuhalide_atlas_articles to service_role;
grant all privileges on table public.cuhalide_atlas_candidate_queue to service_role;
grant all privileges on table public.cuhalide_atlas_known_dois to service_role;
grant all privileges on table public.cuhalide_atlas_payload_chunks to service_role;
grant all privileges on table public.cuhalide_atlas_release to service_role;
grant all privileges on table public.cuhalide_atlas_releases to service_role;
grant all privileges on table public.cuhalide_atlas_structures to service_role;
grant all privileges on table public.cuhalide_atlas_sync_runs to service_role;

revoke execute on function public.cuhalide_atlas_search(text,text,text,text,text,boolean,text,integer,integer,integer) from public, anon, authenticated;
revoke execute on function public.cuhalide_atlas_search(text,integer) from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_search(text,text,text,text,text,boolean,text,integer,integer,integer) to service_role;
grant execute on function public.cuhalide_atlas_search(text,integer) to service_role;

commit;
