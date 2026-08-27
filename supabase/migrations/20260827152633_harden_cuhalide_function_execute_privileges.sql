-- CuHalide Atlas Current Curated rev.9 production hardening.
-- Mirrors production migration 20260827152633 exactly at the public-safe DDL level.
-- No private corpus rows, evidence payloads, credentials, or Vault material are included.

revoke execute on function atlas_internal.cuhalide_photophysics_public_conflict_warning_v1(bigint,text)
  from public, anon, authenticated;
revoke execute on function atlas_internal.cuhalide_photophysics_release_regression_v3()
  from public, anon, authenticated;
revoke execute on function public.cuhalide_atlas_current_structure_search_safe_v1()
  from public, anon, authenticated;

grant execute on function atlas_internal.cuhalide_photophysics_public_conflict_warning_v1(bigint,text)
  to service_role;
grant execute on function atlas_internal.cuhalide_photophysics_release_regression_v3()
  to service_role;
grant execute on function public.cuhalide_atlas_current_structure_search_safe_v1()
  to service_role;
