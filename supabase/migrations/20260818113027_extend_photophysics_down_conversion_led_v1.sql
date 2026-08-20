alter table atlas_internal.cuhalide_photophysics_measurement_v1
  drop constraint if exists cuhalide_photophysics_measurement_v1_measurement_type_check;

alter table atlas_internal.cuhalide_photophysics_measurement_v1
  add constraint cuhalide_photophysics_measurement_v1_measurement_type_check
  check (measurement_type in (
    'steady_state_pl','excitation_spectrum','absorption','diffuse_reflectance','uv_vis','electrochemistry',
    'time_resolved_pl','plqy','temperature_dependent_pl','excitation_dependent_pl','pressure_dependent_pl',
    'in_situ_pl','stability_pl','radiation_stability','radioluminescence','temperature_dependent_rl','xray_excited_luminescence',
    'scintillation_decay','afterglow','cpl','cd','electroluminescence','down_conversion_led','thermoluminescence',
    'transient_absorption','circularly_polarized_transient_absorption','chiral_recognition','phase_transformation',
    'electronic_structure_calculation','other'
  ));

insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('color_purity','colorimetry','%','Color purity reported or explicitly calculated under the source-defined CIE reference/white point and dominant-wavelength construction.',false,true,false,'Reference white point and dominant wavelength/coordinate basis must be retained.'),
('led_drive_voltage','device','V','Electrical drive voltage of a down-conversion or phosphor-coated LED used to excite the luminescent material.',false,true,false,'Do not confuse with voltage across an electroluminescent emitter layer.')
on conflict (property_key) do update set domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;