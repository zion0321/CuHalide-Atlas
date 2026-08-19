-- CuHalide Atlas material-grain photophysics layer v1.1.
-- Adds explicit device/chiroptical metrics, uncertainty and source-conflict handling.
-- Frozen Release 3.0.2 remains immutable; all rows remain private until QC/public projection.

alter table public.cuhalide_atlas_material_entities
  drop constraint if exists cuhalide_atlas_material_entities_material_scope_check;
alter table public.cuhalide_atlas_material_entities
  add constraint cuhalide_atlas_material_entities_material_scope_check
  check (material_scope in ('material','polymorph','phase','sample','device','family','article_aggregate'));

alter table public.cuhalide_atlas_photophysics_measurements
  add column if not exists numeric_uncertainty double precision,
  add column if not exists uncertainty_type text not null default 'not_reported',
  add column if not exists claim_status text not null default 'accepted',
  add column if not exists conflict_group_key text not null default '';

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_property_code_check;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_property_code_check
  check (property_code in (
    'emission_peak_nm','emission_range_nm','excitation_peak_nm','excitation_range_nm',
    'absorption_peak_nm','absorption_edge_nm','fwhm_nm','plqy_fraction','lifetime_us',
    'xel_lifetime_us','stokes_shift_nm','bandgap_ev','activation_energy_ev','cie_x','cie_y',
    'glum','light_yield_ph_mev','detection_limit_ngyair_s','spatial_resolution_lp_mm','afterglow_ms',
    'eqe_fraction','luminance_cd_m2','device_t50_h','cri','cct_k','transmittance_fraction',
    'thermal_sensitivity_pct_k','radiative_rate','nonradiative_rate','dose_response',
    'other_numeric','other_text'
  ));

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_uncertainty_type_check;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_uncertainty_type_check
  check (uncertainty_type in ('not_reported','reported_pm','sd','se','ci','range','unknown'));

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_numeric_uncertainty_check;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_numeric_uncertainty_check
  check (numeric_uncertainty is null or numeric_uncertainty >= 0);

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_claim_status_check;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_claim_status_check
  check (claim_status in ('accepted','source_conflict','contextual','superseded','unresolved'));

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_conflict_key_check;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_conflict_key_check
  check (claim_status <> 'source_conflict' or btrim(conflict_group_key) <> '');

create index if not exists cuhalide_atlas_photophysics_measurements_claim_idx
  on public.cuhalide_atlas_photophysics_measurements(claim_status, conflict_group_key, record_id, material_id, property_code);
