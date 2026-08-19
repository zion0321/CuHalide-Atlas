create or replace function atlas_internal.cuhalide_photophysics_staging_health_v1()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public, atlas_internal
as $$
with checks as (
  select
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s left join atlas_internal.cuhalide_photophysics_article_review_v1 a using(record_id) where a.record_id is null) as sample_orphans,
    (select count(*) from atlas_internal.cuhalide_photophysics_measurement_v1 m left join atlas_internal.cuhalide_photophysics_sample_state_v1 s using(sample_id) where s.sample_id is null) as measurement_orphans,
    (select count(*) from atlas_internal.cuhalide_photophysics_band_v1 b left join atlas_internal.cuhalide_photophysics_measurement_v1 m using(measurement_id) where m.measurement_id is null) as band_orphans,
    (select count(*) from atlas_internal.cuhalide_photophysics_value_v1 v left join atlas_internal.cuhalide_photophysics_measurement_v1 m using(measurement_id) where m.measurement_id is null) as value_orphans,
    (select count(*) from atlas_internal.cuhalide_photophysics_measurement_v1 m where not exists (select 1 from atlas_internal.cuhalide_photophysics_evidence_v1 e where e.measurement_id=m.measurement_id)) as measurements_without_evidence,
    (select count(*) from atlas_internal.cuhalide_photophysics_band_v1 b join atlas_internal.cuhalide_photophysics_measurement_v1 m using(measurement_id) where not exists (select 1 from atlas_internal.cuhalide_photophysics_evidence_v1 e where e.measurement_id=m.measurement_id)) as bands_without_measurement_evidence,
    (select count(*) from atlas_internal.cuhalide_photophysics_value_v1 v join atlas_internal.cuhalide_photophysics_measurement_v1 m using(measurement_id) where not exists (select 1 from atlas_internal.cuhalide_photophysics_evidence_v1 e where e.measurement_id=m.measurement_id)) as values_without_measurement_evidence,
    (select count(*) from atlas_internal.cuhalide_photophysics_measurement_v1 m where m.source_conflict and not exists (select 1 from atlas_internal.cuhalide_photophysics_conflict_v1 c where c.measurement_id=m.measurement_id)) as conflict_flag_without_registry,
    (select count(*) from atlas_internal.cuhalide_photophysics_conflict_v1 c join atlas_internal.cuhalide_photophysics_measurement_v1 m using(measurement_id) where not m.source_conflict) as conflict_registry_without_flag,
    (select count(*) from atlas_internal.cuhalide_photophysics_conflict_v1 c where nullif(trim(c.adjudication_basis),'') is null) as conflicts_without_adjudication_basis,
    (select count(*) from atlas_internal.cuhalide_photophysics_value_v1 v join atlas_internal.cuhalide_photophysics_measurement_v1 m using(measurement_id) where v.analysis_eligible and not exists (select 1 from atlas_internal.cuhalide_photophysics_evidence_v1 e where e.measurement_id=m.measurement_id)) as eligible_values_without_evidence,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s where s.intrinsic_structure_property_eligible and (s.structure_property_scope<>'intrinsic_bulk' or s.phase_state<>'crystalline' or s.mapping_status<>'structure_exact' or s.structure_id is null)) as invalid_intrinsic_scope,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s where s.intrinsic_structure_property_eligible and s.structure_property_scope in ('modified_same_phase','composite','amorphous_derivative','device','article_level','unresolved')) as confounded_intrinsic_samples,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s where s.quantitative_structure_property_eligible is distinct from s.intrinsic_structure_property_eligible) as legacy_intrinsic_flag_mismatch,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s left join atlas_internal.cuhalide_public_structures_current_r6 x on x.structure_id=s.structure_id where s.mapping_status='structure_exact' and (s.structure_id is null or x.structure_id is null)) as invalid_structure_exact_mappings,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s where s.photophysics_measurement_status='measured' and not exists (select 1 from atlas_internal.cuhalide_photophysics_measurement_v1 m where m.sample_id=s.sample_id)) as measured_without_measurement,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s where s.photophysics_measurement_status='no_measurement_reported' and exists (select 1 from atlas_internal.cuhalide_photophysics_measurement_v1 m where m.sample_id=s.sample_id)) as no_measurement_status_with_measurement,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 s where s.photophysics_measurement_status='no_measurement_reported' and nullif(trim(s.no_measurement_note),'') is null) as no_measurement_without_note,
    (select count(*) from atlas_internal.cuhalide_photophysics_article_review_v1 where legacy_hint_is_evidence) as legacy_hint_evidence_violations,
    (select count(*) from atlas_internal.cuhalide_photophysics_value_v1 v left join atlas_internal.cuhalide_photophysics_property_dictionary_v1 d using(property_key) where d.property_key is null or not d.active) as unknown_property_keys,
    (select count(*) from (select sample_id,measurement_type,measurement_label,temperature_k,excitation_nm,monitoring_nm,pressure_gpa,count(*) n from atlas_internal.cuhalide_photophysics_measurement_v1 group by 1,2,3,4,5,6,7 having count(*)>1) q) as duplicate_measurements,
    (select count(*) from (select measurement_id,band_index,band_domain,count(*) n from atlas_internal.cuhalide_photophysics_band_v1 group by 1,2,3 having count(*)>1) q) as duplicate_bands,
    (select count(*) from atlas_internal.cuhalide_photophysics_measurement_v1 where qc_status='pending') as pending_measurement_qc,
    (select count(*) from atlas_internal.cuhalide_photophysics_band_v1 where qc_status='pending') as pending_band_qc,
    (select count(*) from atlas_internal.cuhalide_photophysics_value_v1 where qc_status='pending') as pending_value_qc,
    (select count(*) from atlas_internal.cuhalide_photophysics_article_review_v1 a where a.review_status in ('qc_passed','complete_no_data') and (a.pass_a_status<>'complete' or a.pass_b_status not in ('complete','not_applicable'))) as completed_review_missing_two_pass_gate
), totals as (
  select
    (select count(*) from atlas_internal.cuhalide_photophysics_article_review_v1) as article_queue,
    (select count(*) from atlas_internal.cuhalide_photophysics_article_review_v1 where review_status='qc_passed') as articles_qc_passed,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1) as samples,
    (select count(*) from atlas_internal.cuhalide_photophysics_measurement_v1) as measurements,
    (select count(*) from atlas_internal.cuhalide_photophysics_band_v1) as bands,
    (select count(*) from atlas_internal.cuhalide_photophysics_value_v1) as property_values,
    (select count(*) from atlas_internal.cuhalide_photophysics_evidence_v1) as evidence_rows,
    (select count(*) from atlas_internal.cuhalide_photophysics_conflict_v1) as conflicts,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 where intrinsic_structure_property_eligible) as intrinsic_samples,
    (select count(*) from atlas_internal.cuhalide_photophysics_sample_state_v1 where photophysics_measurement_status='no_measurement_reported') as explicit_no_measurement_samples
)
select jsonb_build_object(
  'ok', (
    checks.sample_orphans=0 and checks.measurement_orphans=0 and checks.band_orphans=0 and checks.value_orphans=0 and
    checks.measurements_without_evidence=0 and checks.bands_without_measurement_evidence=0 and checks.values_without_measurement_evidence=0 and
    checks.conflict_flag_without_registry=0 and checks.conflict_registry_without_flag=0 and checks.conflicts_without_adjudication_basis=0 and
    checks.eligible_values_without_evidence=0 and checks.invalid_intrinsic_scope=0 and checks.confounded_intrinsic_samples=0 and
    checks.legacy_intrinsic_flag_mismatch=0 and checks.invalid_structure_exact_mappings=0 and checks.measured_without_measurement=0 and
    checks.no_measurement_status_with_measurement=0 and checks.no_measurement_without_note=0 and checks.legacy_hint_evidence_violations=0 and
    checks.unknown_property_keys=0 and checks.duplicate_measurements=0 and checks.duplicate_bands=0 and checks.pending_measurement_qc=0 and
    checks.pending_band_qc=0 and checks.pending_value_qc=0 and checks.completed_review_missing_two_pass_gate=0
  ),
  'totals', to_jsonb(totals),
  'checks', to_jsonb(checks)
)
from checks cross join totals;
$$;

revoke all on function atlas_internal.cuhalide_photophysics_staging_health_v1() from public, anon, authenticated;
grant execute on function atlas_internal.cuhalide_photophysics_staging_health_v1() to service_role;