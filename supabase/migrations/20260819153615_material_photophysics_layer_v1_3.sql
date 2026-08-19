-- CuHalide Atlas material-grain photophysics layer v1.3.
-- Adds explicit emission-channel fractions and a claim state for internally inconsistent reported calculations.

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_property_code_check;

alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_property_code_check
  check (property_code in (
    'emission_peak_nm','emission_range_nm','excitation_peak_nm','excitation_range_nm',
    'absorption_peak_nm','absorption_edge_nm','fwhm_nm','plqy_fraction','lifetime_us',
    'xel_lifetime_us','stokes_shift_nm','bandgap_ev','singlet_triplet_gap_ev','activation_energy_ev','cie_x','cie_y',
    'glum','emission_channel_fraction','light_yield_ph_mev','detection_limit_ngyair_s','spatial_resolution_lp_mm','afterglow_ms',
    'eqe_fraction','luminance_cd_m2','device_t50_h','cri','cct_k','transmittance_fraction',
    'thermal_sensitivity_pct_k','radiative_rate','nonradiative_rate','dose_response',
    'other_numeric','other_text'
  ));

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_claim_status_check;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_claim_status_check
  check (claim_status in ('accepted','source_conflict','calculation_conflict','contextual','superseded','unresolved'));

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_conflict_key_check;
alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_conflict_key_check
  check (claim_status not in ('source_conflict','calculation_conflict') or btrim(conflict_group_key) <> '');
