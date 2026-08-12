-- Defense-in-depth for release 3.0.2 internal tables.
-- Table grants are already revoked from anon/authenticated; these policies make
-- the deny intent explicit and keep RLS as an independent protection layer.

begin;

create policy "deny public access atlas articles" on public.cuhalide_atlas_articles
  for all to anon, authenticated using (false) with check (false);
create policy "deny public access candidate queue" on public.cuhalide_atlas_candidate_queue
  for all to anon, authenticated using (false) with check (false);
create policy "deny public access known dois" on public.cuhalide_atlas_known_dois
  for all to anon, authenticated using (false) with check (false);
create policy "deny public access payload chunks" on public.cuhalide_atlas_payload_chunks
  for all to anon, authenticated using (false) with check (false);
create policy "deny public access atlas release" on public.cuhalide_atlas_release
  for all to anon, authenticated using (false) with check (false);
create policy "deny public access atlas releases" on public.cuhalide_atlas_releases
  for all to anon, authenticated using (false) with check (false);
create policy "deny public access atlas structures" on public.cuhalide_atlas_structures
  for all to anon, authenticated using (false) with check (false);
create policy "deny public access atlas sync runs" on public.cuhalide_atlas_sync_runs
  for all to anon, authenticated using (false) with check (false);

commit;
