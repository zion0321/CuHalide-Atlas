create table if not exists atlas_internal.cuhalide_photophysics_article_review_v1 (
  record_id integer primary key,
  doi text,
  article_title text,
  main_article_status text not null default 'pending' check (main_article_status in ('pending','available','read_complete','unavailable','not_applicable')),
  si_status text not null default 'pending' check (si_status in ('pending','available','read_complete','unavailable','not_applicable')),
  source_data_status text not null default 'pending' check (source_data_status in ('pending','available','reviewed','unavailable','not_applicable')),
  photophysics_scope text not null default 'unreviewed' check (photophysics_scope in ('unreviewed','in_scope','no_relevant_data','article_level_only','blocked_evidence')),
  review_status text not null default 'pending' check (review_status in ('pending','in_review','extracted','qc_passed','qc_failed','blocked','complete_no_data')),
  pass_a_status text not null default 'pending' check (pass_a_status in ('pending','complete','failed','not_applicable')),
  pass_b_status text not null default 'pending' check (pass_b_status in ('pending','complete','failed','not_applicable')),
  two_pass_agreement boolean,
  reviewer_basis text not null default 'AI expert-surrogate; primary-evidence reading',
  external_human_independence boolean not null default false,
  article_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table atlas_internal.cuhalide_photophysics_article_review_v1 is 'Private per-article photophysics review registry. Requires primary-evidence reading; AI surrogate review is never represented as independent human validation.';

create table if not exists atlas_internal.cuhalide_photophysics_sample_state_v1 (
  sample_id bigint generated always as identity primary key,
  record_id integer not null,
  structure_id text,
  reported_compound_label text not null default '',
  sample_label text not null default '',
  sample_form text not null default 'unresolved' check (sample_form in ('single_crystal','crystal','powder','polycrystalline','film','pellet','solution','glass','amorphous','device','composite','other','unresolved')),
  phase_state text not null default 'unresolved' check (phase_state in ('crystalline','amorphous','mixed','solution','device_state','other','unresolved')),
  polymorph_or_phase text not null default '',
  preparation_or_treatment text not null default '',
  mapping_status text not null default 'unresolved' check (mapping_status in ('structure_exact','phase_exact','sample_exact','compound_exact','article_level_only','multiple_structures_ambiguous','unresolved')),
  mapping_confidence text not null default 'Unresolved' check (mapping_confidence in ('High','Medium','Low','Unresolved')),
  structure_mapping_basis text not null default '',
  quantitative_structure_property_eligible boolean not null default false,
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table atlas_internal.cuhalide_photophysics_sample_state_v1 is 'Sample/state grain between structure and measurement. Prevents article-level photophysics from being blindly assigned to every crystallographic row.';

create table if not exists atlas_internal.cuhalide_photophysics_measurement_v1 (
  measurement_id bigint generated always as identity primary key,
  sample_id bigint not null references atlas_internal.cuhalide_photophysics_sample_state_v1(sample_id) on delete cascade,
  record_id integer not null,
  structure_id text,
  measurement_type text not null check (measurement_type in ('steady_state_pl','excitation_spectrum','absorption','diffuse_reflectance','uv_vis','time_resolved_pl','plqy','temperature_dependent_pl','excitation_dependent_pl','pressure_dependent_pl','radioluminescence','xray_excited_luminescence','scintillation_decay','afterglow','cpl','cd','electroluminescence','thermoluminescence','other')),
  measurement_label text not null default '',
  temperature_k numeric,
  excitation_nm numeric,
  excitation_ev numeric,
  monitoring_nm numeric,
  pressure_gpa numeric,
  atmosphere text not null default '',
  solvent text not null default '',
  concentration_value numeric,
  concentration_unit text not null default '',
  excitation_power_value numeric,
  excitation_power_unit text not null default '',
  radiation_source text not null default '',
  dose_rate_value numeric,
  dose_rate_unit text not null default '',
  gate_delay_value numeric,
  gate_delay_unit text not null default '',
  source_reported_conditions text not null default '',
  normalized_condition_notes text not null default '',
  condition_completeness text not null default 'partial' check (condition_completeness in ('complete','partial','minimal','unknown')),
  source_conflict boolean not null default false,
  quantitative_analysis_eligible boolean not null default false,
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (temperature_k is null or temperature_k >= 0),
  check (excitation_nm is null or excitation_nm > 0),
  check (monitoring_nm is null or monitoring_nm > 0),
  check (pressure_gpa is null or pressure_gpa >= 0)
);
comment on table atlas_internal.cuhalide_photophysics_measurement_v1 is 'Condition-resolved photophysical measurement grain. PL, PLE, absorption, lifetime, PLQY, RL, scintillation, CPL and stimulus-dependent measurements are never conflated.';

create table if not exists atlas_internal.cuhalide_photophysics_band_v1 (
  band_id bigint generated always as identity primary key,
  measurement_id bigint not null references atlas_internal.cuhalide_photophysics_measurement_v1(measurement_id) on delete cascade,
  band_index integer not null default 1,
  band_domain text not null check (band_domain in ('emission','excitation','absorption','radioluminescence','electroluminescence','cpl','other')),
  band_role text not null default 'unresolved' check (band_role in ('dominant','secondary','shoulder','deconvolved_component','range_only','unresolved')),
  peak_nm numeric,
  peak_ev numeric,
  range_min_nm numeric,
  range_max_nm numeric,
  onset_nm numeric,
  fwhm_nm numeric,
  fwhm_ev numeric,
  peak_origin text not null default 'unresolved' check (peak_origin in ('source_reported','atlas_calculated','digitized','inferred','unresolved')),
  fwhm_origin text not null default 'unresolved' check (fwhm_origin in ('source_reported','atlas_calculated','digitized','inferred','unresolved')),
  band_shape text not null default '',
  color_label text not null default '',
  assignment text not null default '',
  assignment_origin text not null default 'unresolved' check (assignment_origin in ('author_assigned','atlas_interpretation','unresolved')),
  assignment_confidence text not null default 'Unresolved' check (assignment_confidence in ('High','Medium','Low','Unresolved')),
  quantitative_analysis_eligible boolean not null default false,
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(measurement_id, band_index, band_domain),
  check (peak_nm is null or peak_nm > 0),
  check (fwhm_nm is null or fwhm_nm > 0),
  check (range_min_nm is null or range_min_nm > 0),
  check (range_max_nm is null or range_max_nm > 0),
  check (range_min_nm is null or range_max_nm is null or range_max_nm >= range_min_nm)
);
comment on table atlas_internal.cuhalide_photophysics_band_v1 is 'Band-level spectral representation. Multiple emission bands, shoulders and fitted components remain separate; source-reported and derived values are distinguished.';

create table if not exists atlas_internal.cuhalide_photophysics_value_v1 (
  value_id bigint generated always as identity primary key,
  measurement_id bigint not null references atlas_internal.cuhalide_photophysics_measurement_v1(measurement_id) on delete cascade,
  band_id bigint references atlas_internal.cuhalide_photophysics_band_v1(band_id) on delete cascade,
  property_key text not null,
  value_numeric numeric,
  value_text text,
  unit text not null default '',
  qualifier text not null default '',
  lower_bound numeric,
  upper_bound numeric,
  uncertainty numeric,
  value_origin text not null check (value_origin in ('source_reported','atlas_calculated','digitized','inferred','unresolved')),
  reported_definition text not null default '',
  derivation_method text not null default '',
  reference_basis text not null default '',
  analysis_eligible boolean not null default false,
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (value_numeric is not null or nullif(trim(value_text),'') is not null),
  check (lower_bound is null or upper_bound is null or upper_bound >= lower_bound)
);
comment on table atlas_internal.cuhalide_photophysics_value_v1 is 'Extensible typed property layer for PLQY, Stokes shift, average lifetime, CIE, Huang-Rhys factor, phonon energy, activation energy, light yield, detection limit and other measurement-level quantities.';

create table if not exists atlas_internal.cuhalide_photophysics_decay_component_v1 (
  decay_component_id bigint generated always as identity primary key,
  measurement_id bigint not null references atlas_internal.cuhalide_photophysics_measurement_v1(measurement_id) on delete cascade,
  component_index integer not null,
  tau_value numeric not null,
  tau_unit text not null,
  amplitude_value numeric,
  amplitude_unit text not null default '',
  fractional_contribution numeric,
  model_term text not null default '',
  value_origin text not null check (value_origin in ('source_reported','atlas_calculated','digitized','inferred','unresolved')),
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  unique(measurement_id, component_index),
  check (tau_value > 0),
  check (fractional_contribution is null or (fractional_contribution >= 0 and fractional_contribution <= 1))
);
comment on table atlas_internal.cuhalide_photophysics_decay_component_v1 is 'Preserves multiexponential decay components instead of collapsing all lifetime data into one scalar.';

create table if not exists atlas_internal.cuhalide_photophysics_evidence_v1 (
  evidence_id bigint generated always as identity primary key,
  record_id integer not null,
  structure_id text,
  sample_id bigint references atlas_internal.cuhalide_photophysics_sample_state_v1(sample_id) on delete cascade,
  measurement_id bigint references atlas_internal.cuhalide_photophysics_measurement_v1(measurement_id) on delete cascade,
  band_id bigint references atlas_internal.cuhalide_photophysics_band_v1(band_id) on delete cascade,
  value_id bigint references atlas_internal.cuhalide_photophysics_value_v1(value_id) on delete cascade,
  source_type text not null check (source_type in ('main_article','supporting_information','source_data','figure','table','caption','cif','external_metadata','other')),
  source_file text not null default '',
  source_sha256 text not null default '',
  page_locator text not null default '',
  section_locator text not null default '',
  figure_locator text not null default '',
  table_locator text not null default '',
  evidence_locator text not null default '',
  source_value_verbatim text not null default '',
  evidence_summary text not null default '',
  evidence_level text not null default 'Unresolved' check (evidence_level in ('A','B','C','D','Unresolved')),
  evidence_confidence text not null default 'Unresolved' check (evidence_confidence in ('High','Medium','Low','Unresolved')),
  mapping_confidence text not null default 'Unresolved' check (mapping_confidence in ('High','Medium','Low','Unresolved')),
  extraction_method text not null check (extraction_method in ('manual_primary_evidence_read','structured_table_transcription','source_data_import','figure_digitization','atlas_calculation','metadata_only')),
  reviewer_pass text not null default 'A' check (reviewer_pass in ('A','B','adjudication')),
  locator_status text not null default 'encoded' check (locator_status in ('encoded','record_level_only','unavailable','not_applicable')),
  created_at timestamptz not null default now()
);
comment on table atlas_internal.cuhalide_photophysics_evidence_v1 is 'Private provenance for every extracted photophysical datum. Stores concise values/locators, not wholesale copyrighted article text.';

create table if not exists atlas_internal.cuhalide_photophysics_conflict_v1 (
  conflict_id bigint generated always as identity primary key,
  record_id integer not null,
  structure_id text,
  sample_id bigint references atlas_internal.cuhalide_photophysics_sample_state_v1(sample_id) on delete cascade,
  measurement_id bigint references atlas_internal.cuhalide_photophysics_measurement_v1(measurement_id) on delete cascade,
  property_key text not null,
  conflict_type text not null check (conflict_type in ('main_vs_si','text_vs_table','text_vs_figure','duplicate_measurements','definition_mismatch','condition_mismatch','structure_mapping_conflict','other')),
  source_a text not null,
  value_a text not null,
  source_b text not null,
  value_b text not null,
  adjudication_status text not null default 'unresolved' check (adjudication_status in ('unresolved','retain_both','preferred_source_identified','not_comparable','resolved_typographical')),
  preferred_value text,
  display_policy text not null default 'show_conflict' check (display_policy in ('show_conflict','show_both','show_preferred_with_warning','internal_only')),
  adjudication_basis text not null default '',
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table atlas_internal.cuhalide_photophysics_conflict_v1 is 'Explicit source-conflict registry. Main text, SI, tables and figures are never silently reconciled when values or definitions disagree.';

create table if not exists atlas_internal.cuhalide_photophysics_curve_registry_v1 (
  curve_id bigint generated always as identity primary key,
  measurement_id bigint not null references atlas_internal.cuhalide_photophysics_measurement_v1(measurement_id) on delete cascade,
  band_id bigint references atlas_internal.cuhalide_photophysics_band_v1(band_id) on delete set null,
  curve_type text not null check (curve_type in ('emission','excitation','absorption','reflectance','decay','temperature_series','pressure_series','cpl','cd','radioluminescence','other')),
  data_origin text not null check (data_origin in ('source_numeric_data','digitized_from_figure','derived_series','metadata_only')),
  x_quantity text not null,
  x_unit text not null,
  y_quantity text not null,
  y_unit text not null default '',
  normalized boolean not null default false,
  point_count integer,
  private_asset_uri text not null default '',
  asset_sha256 text not null default '',
  digitization_uncertainty_note text not null default '',
  analysis_eligible boolean not null default false,
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  check (point_count is null or point_count >= 0)
);
comment on table atlas_internal.cuhalide_photophysics_curve_registry_v1 is 'Curve metadata registry; raw numerical curves should live in private versioned assets rather than bloating PostgreSQL. Digitized curves are explicitly distinguished from author-supplied numeric data.';

create index if not exists idx_photo_sample_record on atlas_internal.cuhalide_photophysics_sample_state_v1(record_id);
create index if not exists idx_photo_sample_structure on atlas_internal.cuhalide_photophysics_sample_state_v1(structure_id);
create index if not exists idx_photo_measurement_record_structure on atlas_internal.cuhalide_photophysics_measurement_v1(record_id, structure_id);
create index if not exists idx_photo_measurement_type on atlas_internal.cuhalide_photophysics_measurement_v1(measurement_type);
create index if not exists idx_photo_band_peak on atlas_internal.cuhalide_photophysics_band_v1(peak_nm);
create index if not exists idx_photo_value_property on atlas_internal.cuhalide_photophysics_value_v1(property_key);
create index if not exists idx_photo_evidence_record on atlas_internal.cuhalide_photophysics_evidence_v1(record_id, structure_id);

alter table atlas_internal.cuhalide_photophysics_article_review_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_sample_state_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_measurement_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_band_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_value_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_decay_component_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_evidence_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_conflict_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_curve_registry_v1 enable row level security;

revoke all on atlas_internal.cuhalide_photophysics_article_review_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_sample_state_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_measurement_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_band_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_value_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_decay_component_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_evidence_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_conflict_v1 from anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_curve_registry_v1 from anon, authenticated;

grant usage on schema atlas_internal to service_role;
grant all on atlas_internal.cuhalide_photophysics_article_review_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_sample_state_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_measurement_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_band_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_value_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_decay_component_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_evidence_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_conflict_v1 to service_role;
grant all on atlas_internal.cuhalide_photophysics_curve_registry_v1 to service_role;
grant usage, select on all sequences in schema atlas_internal to service_role;