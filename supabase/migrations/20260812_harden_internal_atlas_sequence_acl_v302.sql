-- Release 3.0.2 sequence least-privilege hardening.
-- Revoke unnecessary counter visibility/mutation from public roles while
-- preserving trusted service-role writes. Objects are listed explicitly so
-- future reuse cannot affect unrelated application sequences.

begin;

revoke all privileges on sequence public.cuhalide_atlas_agent_usage_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_candidate_queue_candidate_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_coverage_audit_audit_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_curation_queue_queue_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_current_curated_changes_change_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_evaluation_results_result_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_field_evidence_evidence_object_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_human_review_events_review_event_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_quality_findings_finding_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_rag_documents_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_release_amendments_amendment_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.cuhalide_atlas_sync_runs_run_id_seq from public, anon, authenticated;

grant usage, select, update on sequence public.cuhalide_atlas_agent_usage_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_candidate_queue_candidate_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_coverage_audit_audit_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_curation_queue_queue_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_current_curated_changes_change_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_evaluation_results_result_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_field_evidence_evidence_object_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_human_review_events_review_event_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_quality_findings_finding_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_rag_documents_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_release_amendments_amendment_id_seq to service_role;
grant usage, select, update on sequence public.cuhalide_atlas_sync_runs_run_id_seq to service_role;

commit;
