alter table atlas_internal.cuhalide_photophysics_band_v1
  drop constraint if exists cuhalide_photophysics_band_v1_band_domain_check;

alter table atlas_internal.cuhalide_photophysics_band_v1
  add constraint cuhalide_photophysics_band_v1_band_domain_check
  check (band_domain in ('emission','excitation','absorption','radioluminescence','electroluminescence','cpl','cd','other'));