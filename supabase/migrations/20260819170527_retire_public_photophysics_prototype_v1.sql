-- The public-schema material/photophysics tables were an early private prototype.
-- They contain historical curation rows but are not the active source of truth.
-- Freeze them read-only for service_role; anon/authenticated remain denied by RLS/revokes.
-- Canonical curation lives in atlas_internal.cuhalide_photophysics_*_v1.

revoke all on public.cuhalide_atlas_material_entities from service_role;
revoke all on public.cuhalide_atlas_photophysics_measurements from service_role;
revoke all on public.cuhalide_atlas_photophysics_mechanisms from service_role;
revoke all on public.cuhalide_atlas_photophysics_evidence from service_role;
revoke all on public.cuhalide_atlas_photophysics_review from service_role;

grant select on public.cuhalide_atlas_material_entities to service_role;
grant select on public.cuhalide_atlas_photophysics_measurements to service_role;
grant select on public.cuhalide_atlas_photophysics_mechanisms to service_role;
grant select on public.cuhalide_atlas_photophysics_evidence to service_role;
grant select on public.cuhalide_atlas_photophysics_review to service_role;

comment on table public.cuhalide_atlas_material_entities is 'Deprecated read-only prototype retained for migration/audit history. Canonical material/sample photophysics curation is atlas_internal.cuhalide_photophysics_*_v1.';
comment on table public.cuhalide_atlas_photophysics_measurements is 'Deprecated read-only prototype retained for migration/audit history. Do not write new curation here; canonical measurement/value curation is atlas_internal.cuhalide_photophysics_*_v1.';
comment on table public.cuhalide_atlas_photophysics_mechanisms is 'Deprecated read-only prototype retained for migration/audit history. Mechanism evidence is curated only through the active private workflow.';
comment on table public.cuhalide_atlas_photophysics_evidence is 'Deprecated read-only prototype retained for migration/audit history. Primary-evidence provenance remains private and canonical in atlas_internal.';
comment on table public.cuhalide_atlas_photophysics_review is 'Deprecated read-only prototype retained for migration/audit history. Canonical article review state is atlas_internal.cuhalide_photophysics_article_review_v1.';
comment on view public.cuhalide_atlas_photophysics_qc_summary_v1 is 'Deprecated prototype QC view retained read-only for audit history; not a public product view.';
comment on view public.cuhalide_atlas_photophysics_integrity_findings_v1 is 'Deprecated prototype integrity view retained read-only for audit history; not a public product view.';

revoke all on public.cuhalide_atlas_photophysics_qc_summary_v1 from anon, authenticated;
revoke all on public.cuhalide_atlas_photophysics_integrity_findings_v1 from anon, authenticated;
grant select on public.cuhalide_atlas_photophysics_qc_summary_v1 to service_role;
grant select on public.cuhalide_atlas_photophysics_integrity_findings_v1 to service_role;