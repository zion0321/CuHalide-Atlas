-- CuHalide Atlas material-grain photophysics layer v1.5.
-- Avoids falsely converting a generic reported nGy/s detection limit into nGy_air/s
-- and gives relative light output its own property code/reference context.

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_property_code_check;

alter table public.cuhalide_atlas_photophysics_measurements
  add constraint cuhalide_atlas_photophysics_measurements_property_code_check
  check (property_code in (
    'emission_peak_nm','emission_range_nm','excitation_peak_nm','excitation_range_nm',
    'absorption_peak_nm','absorption_edge_nm','fwhm_nm','plqy_fraction','lifetime_us',
    'xel_lifetime_us','stokes_shift_nm','bandgap_ev','singlet_triplet_gap_ev','activation_energy_ev','cie_x','cie_y',
    'glum','emission_channel_fraction','relative_light_output_factor','light_yield_ph_mev',
    'detection_limit_ngy_s','detection_limit_ngyair_s','spatial_resolution_lp_mm','afterglow_ms',
    'eqe_fraction','luminance_cd_m2','device_t50_h','cri','cct_k','transmittance_fraction',
    'thermal_sensitivity_pct_k','radiative_rate','nonradiative_rate','dose_response',
    'other_numeric','other_text'
  ));

alter table public.cuhalide_atlas_photophysics_measurements
  drop constraint if exists cuhalide_atlas_photophysics_measurements_domain_check;
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
        'singlet_triplet_gap_ev','activation_energy_ev','relative_light_output_factor','light_yield_ph_mev',
        'detection_limit_ngy_s','detection_limit_ngyair_s','spatial_resolution_lp_mm','afterglow_ms',
        'luminance_cd_m2','device_t50_h')
      or (
        (numeric_value is null or numeric_value >= 0)
        and (numeric_value_low is null or numeric_value_low >= 0)
        and (numeric_value_high is null or numeric_value_high >= 0)
      )
    )
    and (numeric_value_low is null or numeric_value_high is null or numeric_value_low <= numeric_value_high)
  );
