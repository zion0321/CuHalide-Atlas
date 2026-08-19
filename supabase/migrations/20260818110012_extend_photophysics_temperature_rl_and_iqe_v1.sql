alter table atlas_internal.cuhalide_photophysics_measurement_v1
  drop constraint if exists cuhalide_photophysics_measurement_v1_measurement_type_check;

alter table atlas_internal.cuhalide_photophysics_measurement_v1
  add constraint cuhalide_photophysics_measurement_v1_measurement_type_check
  check (measurement_type in (
    'steady_state_pl','excitation_spectrum','absorption','diffuse_reflectance','uv_vis',
    'time_resolved_pl','plqy','temperature_dependent_pl','excitation_dependent_pl','pressure_dependent_pl',
    'in_situ_pl','stability_pl','radiation_stability','radioluminescence','temperature_dependent_rl','xray_excited_luminescence',
    'scintillation_decay','afterglow','cpl','cd','electroluminescence','thermoluminescence',
    'transient_absorption','circularly_polarized_transient_absorption','chiral_recognition','phase_transformation',
    'electronic_structure_calculation','other'
  ));

insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('internal_quantum_efficiency','device','%','Electroluminescent internal quantum efficiency under the source-defined device model and operating condition.',false,true,false,'Keep separate from PLQY and external quantum efficiency.'),
('high_photon_density_duration','dynamics','us','Source-reported time span over which a TRES map is described as retaining high photon density.',false,true,false,'This is a map-level descriptor and depends on the source threshold/visual criterion.'),
('temperature_turning_point','stimulus_response','K','Temperature at which the source reports a change/turning point in a temperature-dependent optical response.',false,true,false,'Retain the affected band/observable in qualifier.'),
('rl_voltage_gain','scintillation','','Relative increase in radioluminescence photon output at a stated X-ray tube voltage relative to the source baseline.',false,true,false,'Reference voltage/baseline must be retained.')
on conflict (property_key) do update set domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;