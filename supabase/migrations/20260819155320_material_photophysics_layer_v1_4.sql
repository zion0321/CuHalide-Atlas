-- CuHalide Atlas material-grain photophysics layer v1.4.
-- Hardens referential integrity and adds private hostile-audit views.
-- No public projection is created by this migration.

-- Stable composite keys for record/material/structure-grain referential checks.
alter table public.cuhalide_atlas_material_entities
  add constraint cuhalide_atlas_material_entities_material_record_uq unique (material_id, record_id);
alter table public.cuhalide_atlas_material_entities
  add constraint cuhalide_atlas_material_entities_material_record_structure_uq unique (material_id, record_id, structure_id);
alter table public.cuhalide_atlas_current_curated_structures
  add constraint cuhalide_atlas_current_curated_structures_structure_record_uq unique (structure_id, record_id);
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_measurement_material_record_uq
  unique (measurement_id, material_id, record_id);
alter table public.cuhalide_atlas_photophysics_mechanisms
  add constraint cuhalide_atlas_photophysics_mechanisms_mechanism_material_record_uq
  unique (mechanism_id, material_id, record_id);

-- Article/material/structure identity must agree at every grain.
alter table public.cuhalide_atlas_material_entities
  add constraint cuhalide_atlas_material_entities_record_fk
  foreign key (record_id) references public.cuhalide_atlas_current_curated_articles(record_id) on delete restrict;
alter table public.cuhalide_atlas_material_entities
  add constraint cuhalide_atlas_material_entities_structure_record_fk
  foreign key (structure_id, record_id)
  references public.cuhalide_atlas_current_curated_structures(structure_id, record_id) on delete restrict;

alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_material_record_fk
  foreign key (material_id, record_id)
  references public.cuhalide_atlas_material_entities(material_id, record_id) on delete cascade;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_material_record_structure_fk
  foreign key (material_id, record_id, structure_id)
  references public.cuhalide_atlas_material_entities(material_id, record_id, structure_id) on delete cascade;

alter table public.cuhalide_atlas_photophysics_mechanisms
  add constraint cuhalide_atlas_photophysics_mechanisms_material_record_fk
  foreign key (material_id, record_id)
  references public.cuhalide_atlas_material_entities(material_id, record_id) on delete cascade;
alter table public.cuhalide_atlas_photophysics_mechanisms
  add constraint cuhalide_atlas_photophysics_mechanisms_material_record_structure_fk
  foreign key (material_id, record_id, structure_id)
  references public.cuhalide_atlas_material_entities(material_id, record_id, structure_id) on delete cascade;

alter table public.cuhalide_atlas_photophysics_review
  add constraint cuhalide_atlas_photophysics_review_record_fk
  foreign key (record_id) references public.cuhalide_atlas_current_curated_articles(record_id) on delete restrict;

alter table public.cuhalide_atlas_photophysics_evidence
  add constraint cuhalide_atlas_photophysics_evidence_material_record_fk
  foreign key (material_id, record_id)
  references public.cuhalide_atlas_material_entities(material_id, record_id) on delete cascade;
alter table public.cuhalide_atlas_photophysics_evidence
  add constraint cuhalide_atlas_photophysics_evidence_measurement_material_record_fk
  foreign key (measurement_id, material_id, record_id)
  references public.cuhalide_atlas_photophysics_measurements(measurement_id, material_id, record_id) on delete cascade;
alter table public.cuhalide_atlas_photophysics_evidence
  add constraint cuhalide_atlas_photophysics_evidence_mechanism_material_record_fk
  foreign key (mechanism_id, material_id, record_id)
  references public.cuhalide_atlas_photophysics_mechanisms(mechanism_id, material_id, record_id) on delete cascade;

-- Exact mappings are genuinely exact; non-exact entities must not carry a structure id.
alter table public.cuhalide_atlas_material_entities
  add constraint cuhalide_atlas_material_entities_exact_mapping_check
  check (
    (structure_mapping_scope = 'exact' and structure_id is not null)
    or (structure_mapping_scope <> 'exact' and structure_id is null)
  );

-- An evidence object belongs to exactly one scientific claim.
alter table public.cuhalide_atlas_photophysics_evidence
  drop constraint if exists cuhalide_atlas_photophysics_evidence_check;
alter table public.cuhalide_atlas_photophysics_evidence
  add constraint cuhalide_atlas_photophysics_evidence_exactly_one_claim_check
  check (num_nonnulls(measurement_id, mechanism_id) = 1);

-- Normalized fraction/coordinate domains and non-negative physical quantities.
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_domain_check
  check (
    (
      property_code not in ('plqy_fraction','eqe_fraction','transmittance_fraction','emission_channel_fraction')
      or (
        (numeric_value is null or numeric_value between 0 and 1)
        and (numeric_value_low is null or numeric_value_low between 0 and 1)
        and (numeric_value_high is null or numeric_value_high between 0 and 1)
      )
    )
    and (
      property_code not in ('cie_x','cie_y')
      or (
        (numeric_value is null or numeric_value between 0 and 1)
        and (numeric_value_low is null or numeric_value_low between 0 and 1)
        and (numeric_value_high is null or numeric_value_high between 0 and 1)
      )
    )
    and (
      property_code not in ('emission_peak_nm','emission_range_nm','excitation_peak_nm','excitation_range_nm',
        'absorption_peak_nm','absorption_edge_nm','fwhm_nm','lifetime_us','xel_lifetime_us','bandgap_ev',
        'singlet_triplet_gap_ev','activation_energy_ev','light_yield_ph_mev','detection_limit_ngyair_s',
        'spatial_resolution_lp_mm','afterglow_ms','luminance_cd_m2','device_t50_h')
      or (
        (numeric_value is null or numeric_value >= 0)
        and (numeric_value_low is null or numeric_value_low >= 0)
        and (numeric_value_high is null or numeric_value_high >= 0)
      )
    )
    and (numeric_value_low is null or numeric_value_high is null or numeric_value_low <= numeric_value_high)
  );

-- Private per-record completeness summary. Aggregate before joining to avoid row-multiplication as the corpus grows.
create or replace view public.cuhalide_atlas_photophysics_qc_summary_v1 as
with ma as (
  select record_id, count(*) as actual_material_count
  from public.cuhalide_atlas_material_entities group by record_id
), mm as (
  select record_id,
         count(*) as actual_measurement_count,
         count(*) filter (where verification_status='verified') as verified_measurement_count,
         count(*) filter (where claim_status in ('source_conflict','calculation_conflict')) as conflict_claim_count,
         count(distinct nullif(conflict_group_key,'')) filter (where claim_status in ('source_conflict','calculation_conflict')) as conflict_group_count,
         count(*) filter (where public_eligible) as public_eligible_measurement_count
  from public.cuhalide_atlas_photophysics_measurements group by record_id
), mc as (
  select record_id, count(*) as actual_mechanism_count
  from public.cuhalide_atlas_photophysics_mechanisms group by record_id
), ev as (
  select record_id, count(*) as actual_evidence_count
  from public.cuhalide_atlas_photophysics_evidence group by record_id
)
select
  a.record_id,
  a.doi,
  a.title,
  r.review_status,
  r.main_article_status,
  r.supporting_information_status,
  r.material_mapping_status,
  r.property_mapping_status,
  coalesce(ma.actual_material_count,0) as actual_material_count,
  coalesce(mm.actual_measurement_count,0) as actual_measurement_count,
  coalesce(mc.actual_mechanism_count,0) as actual_mechanism_count,
  coalesce(ev.actual_evidence_count,0) as actual_evidence_count,
  coalesce(mm.verified_measurement_count,0) as verified_measurement_count,
  coalesce(mm.conflict_claim_count,0) as conflict_claim_count,
  coalesce(mm.conflict_group_count,0) as conflict_group_count,
  coalesce(mm.public_eligible_measurement_count,0) as public_eligible_measurement_count,
  coalesce(r.curated_material_count,0) as review_material_count,
  coalesce(r.measurement_count,0) as review_measurement_count,
  coalesce(r.mechanism_count,0) as review_mechanism_count,
  coalesce(r.unresolved_item_count,0) as review_unresolved_item_count
from public.cuhalide_atlas_current_curated_articles a
left join public.cuhalide_atlas_photophysics_review r using(record_id)
left join ma using(record_id)
left join mm using(record_id)
left join mc using(record_id)
left join ev using(record_id);

-- Hostile-audit findings. Intentional scientific conflicts are counted in the QC summary; malformed conflicts are findings.
create or replace view public.cuhalide_atlas_photophysics_integrity_findings_v1 as
with findings as (
  select 'verified_measurement_without_evidence'::text as finding_type, pm.record_id,
         pm.measurement_id::text as entity_id, pm.property_code as detail
  from public.cuhalide_atlas_photophysics_measurements pm
  where pm.verification_status='verified'
    and not exists (select 1 from public.cuhalide_atlas_photophysics_evidence pe where pe.measurement_id=pm.measurement_id)
  union all
  select 'verified_mechanism_without_evidence', pc.record_id, pc.mechanism_id::text, pc.mechanism_code
  from public.cuhalide_atlas_photophysics_mechanisms pc
  where pc.verification_status in ('verified','partially_verified')
    and not exists (select 1 from public.cuhalide_atlas_photophysics_evidence pe where pe.mechanism_id=pc.mechanism_id)
  union all
  select 'public_claim_not_publishable', pm.record_id, pm.measurement_id::text,
         concat(pm.property_code,':',pm.verification_status,':',pm.claim_status)
  from public.cuhalide_atlas_photophysics_measurements pm
  where pm.public_eligible and (pm.verification_status<>'verified' or pm.claim_status<>'accepted')
  union all
  select 'conflict_group_has_fewer_than_two_claims', min(pm.record_id), pm.conflict_group_key,
         concat('n=',count(*))
  from public.cuhalide_atlas_photophysics_measurements pm
  where pm.claim_status in ('source_conflict','calculation_conflict')
  group by pm.conflict_group_key
  having count(*) < 2
  union all
  select 'review_count_drift', q.record_id, q.record_id::text,
         concat('materials ',q.review_material_count,'/',q.actual_material_count,
                '; measurements ',q.review_measurement_count,'/',q.actual_measurement_count,
                '; mechanisms ',q.review_mechanism_count,'/',q.actual_mechanism_count)
  from public.cuhalide_atlas_photophysics_qc_summary_v1 q
  where q.review_status is not null and (
    q.review_material_count<>q.actual_material_count
    or q.review_measurement_count<>q.actual_measurement_count
    or q.review_mechanism_count<>q.actual_mechanism_count)
)
select * from findings;

alter view public.cuhalide_atlas_photophysics_qc_summary_v1 set (security_invoker = true);
alter view public.cuhalide_atlas_photophysics_integrity_findings_v1 set (security_invoker = true);
revoke all on public.cuhalide_atlas_photophysics_qc_summary_v1 from anon, authenticated;
revoke all on public.cuhalide_atlas_photophysics_integrity_findings_v1 from anon, authenticated;
grant select on public.cuhalide_atlas_photophysics_qc_summary_v1 to service_role;
grant select on public.cuhalide_atlas_photophysics_integrity_findings_v1 to service_role;
