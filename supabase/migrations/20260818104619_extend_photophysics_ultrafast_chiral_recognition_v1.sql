alter table atlas_internal.cuhalide_photophysics_measurement_v1
  drop constraint if exists cuhalide_photophysics_measurement_v1_measurement_type_check;

alter table atlas_internal.cuhalide_photophysics_measurement_v1
  add constraint cuhalide_photophysics_measurement_v1_measurement_type_check
  check (measurement_type in (
    'steady_state_pl','excitation_spectrum','absorption','diffuse_reflectance','uv_vis',
    'time_resolved_pl','plqy','temperature_dependent_pl','excitation_dependent_pl','pressure_dependent_pl',
    'in_situ_pl','stability_pl','radiation_stability','radioluminescence','xray_excited_luminescence',
    'scintillation_decay','afterglow','cpl','cd','electroluminescence','thermoluminescence',
    'transient_absorption','circularly_polarized_transient_absorption','chiral_recognition','phase_transformation',
    'electronic_structure_calculation','other'
  ));

insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('pl_observation','photoluminescence','','Qualitative source-reported observation of whether luminescence is observed for the stated sample and conditions.',false,true,true,'Use for explicitly non-emissive/dark samples; absence of a peak must not be treated as missing extraction.'),
('ste_formation_time','ultrafast_dynamics','fs','Source-reported ultrafast formation time assigned to self-trapped-exciton formation.',false,true,false,'Pump/probe wavelengths and model basis should be preserved.'),
('transient_lifetime','ultrafast_dynamics','ps','Source-reported lifetime component from transient-absorption or related ultrafast dynamics.',false,true,false,'Keep interpretation and component assignment in qualifier/definition.'),
('spin_lifetime','spin_dynamics','ps','Spin-polarization/dephasing lifetime extracted from circularly polarized transient dynamics at a stated probe wavelength.',false,true,false,'Probe wavelength and polarization configuration are mandatory context.'),
('transformation_time','stimulus_response','s','Time required for a source-defined structural/phase transformation under the stated treatment.',false,true,false,'Treatment conditions are mandatory.'),
('relative_pl_intensity_ratio','chiral_recognition','','Ratio of PL intensities between two explicitly defined recognition/reaction states.',false,true,false,'Numerator/denominator identities and wavelength must be encoded in qualifier/reference basis.'),
('cpta_pump_fluence','condition','uJ cm-2','Pump fluence used in circularly polarized transient absorption.',false,true,false,''),
('cu_cu_distance_min','structure_context','Angstrom','Minimum source-reported Cu···Cu distance for the mapped structure/sample.',true,false,false,'Structural context only; does not by itself establish a cuprophilic interaction.'),
('cu_cu_distance_max','structure_context','Angstrom','Maximum source-reported Cu···Cu distance for the mapped structure/sample.',true,false,false,'Structural context only; does not by itself establish a cuprophilic interaction.')
on conflict (property_key) do update set
 domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,
 structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,
 allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;