-- CuHalide Atlas canonical internal photophysics staging performance hardening.
-- The atlas_internal material/sample/measurement/value/evidence model is the canonical private
-- photophysics source of truth. These indexes cover existing foreign-key access paths without
-- changing scientific content, review state, or public exposure.

create index if not exists idx_photo_conflict_measurement
  on atlas_internal.cuhalide_photophysics_conflict_v1(measurement_id);
create index if not exists idx_photo_conflict_sample
  on atlas_internal.cuhalide_photophysics_conflict_v1(sample_id);

create index if not exists idx_photo_curve_measurement
  on atlas_internal.cuhalide_photophysics_curve_registry_v1(measurement_id);
create index if not exists idx_photo_curve_band
  on atlas_internal.cuhalide_photophysics_curve_registry_v1(band_id);

create index if not exists idx_photo_evidence_sample
  on atlas_internal.cuhalide_photophysics_evidence_v1(sample_id);
create index if not exists idx_photo_evidence_measurement
  on atlas_internal.cuhalide_photophysics_evidence_v1(measurement_id);
create index if not exists idx_photo_evidence_band
  on atlas_internal.cuhalide_photophysics_evidence_v1(band_id);
create index if not exists idx_photo_evidence_value
  on atlas_internal.cuhalide_photophysics_evidence_v1(value_id);

create index if not exists idx_photo_measurement_sample
  on atlas_internal.cuhalide_photophysics_measurement_v1(sample_id);

create index if not exists idx_photo_value_measurement
  on atlas_internal.cuhalide_photophysics_value_v1(measurement_id);
create index if not exists idx_photo_value_band
  on atlas_internal.cuhalide_photophysics_value_v1(band_id);
