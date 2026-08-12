-- Release 3.0.2 database function least-privilege hardening.
-- No CuHalide internal helper/trigger function is directly executable by
-- PUBLIC, anon or authenticated roles. Trusted service_role execution remains.

begin;

revoke execute on function public.cuhalide_atlas_audit_field_key(text,text) from public, anon, authenticated;
revoke execute on function public.cuhalide_atlas_canonical_title(text) from public, anon, authenticated;
revoke execute on function public.cuhalide_atlas_plain_title(text) from public, anon, authenticated;
revoke execute on function public.cuhalide_atlas_title_comparison_key(text) from public, anon, authenticated;
revoke execute on function public.cuhalide_atlas_title_search_text(text,text,text) from public, anon, authenticated;
revoke execute on function public.cuhalide_candidate_auto_triage() from public, anon, authenticated;

grant execute on function public.cuhalide_atlas_audit_field_key(text,text) to service_role;
grant execute on function public.cuhalide_atlas_canonical_title(text) to service_role;
grant execute on function public.cuhalide_atlas_plain_title(text) to service_role;
grant execute on function public.cuhalide_atlas_title_comparison_key(text) to service_role;
grant execute on function public.cuhalide_atlas_title_search_text(text,text,text) to service_role;
grant execute on function public.cuhalide_candidate_auto_triage() to service_role;

commit;
