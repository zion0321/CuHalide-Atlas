-- Public-safe mirror of production migration 20260814093038.
-- Defense-in-depth only: make the existing fail-closed RLS posture explicit for
-- public browser roles. The service-role-only rate-limit RPC remains the sole
-- operational path; no scientific data, evidence quota or public read surface changes.

create policy cuhalide_atlas_conversation_usage_explicit_deny
on public.cuhalide_atlas_conversation_usage
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
