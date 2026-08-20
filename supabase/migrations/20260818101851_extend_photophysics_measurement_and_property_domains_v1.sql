alter table atlas_internal.cuhalide_photophysics_measurement_v1
  drop constraint if exists cuhalide_photophysics_measurement_v1_measurement_type_check;

alter table atlas_internal.cuhalide_photophysics_measurement_v1
  add constraint cuhalide_photophysics_measurement_v1_measurement_type_check
  check (measurement_type in (
    'steady_state_pl','excitation_spectrum','absorption','diffuse_reflectance','uv_vis',
    'time_resolved_pl','plqy','temperature_dependent_pl','excitation_dependent_pl','pressure_dependent_pl',
    'in_situ_pl','stability_pl','radiation_stability','radioluminescence','xray_excited_luminescence',
    'scintillation_decay','afterglow','cpl','cd','electroluminescence','thermoluminescence',
    'electronic_structure_calculation','other'
  ));

insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('optical_band_gap','electronic_structure','eV','Experimental optical band gap derived from an optical spectrum using the source-reported method.',true,true,false,'Retain Tauc/direct-indirect convention if stated.'),
('computed_band_gap','electronic_structure','eV','Band gap from a computational electronic-structure method.',false,true,false,'Never merge with experimental optical band gap.'),
('pl_intensity_retention','stability','%','Fraction of initial photoluminescence intensity retained after a stated storage/treatment interval.',false,true,false,'Duration, atmosphere and sample state are mandatory context.'),
('pl_intensity_loss','stability','%','Fraction of initial photoluminescence intensity lost after a stated storage/treatment interval.',false,true,false,'Do not infer retention unless explicitly deriving and labeling the origin.'),
('rl_intensity_retention','stability','%','Fraction of initial radioluminescence intensity retained after a stated irradiation protocol.',false,true,false,'Cycle count, interval and cumulative dose should be preserved when available.'),
('aggregation_onset_time','processing','s','Time from the start of the stated processing step to emergence of the source-defined PL/aggregation signal.',false,true,false,'Processing kinetic, not an intrinsic bulk structure property.'),
('storage_duration','condition','day','Storage duration associated with a stability measurement.',false,true,false,''),
('irradiation_cycle_count','condition','','Number of irradiation switching cycles.',false,true,false,''),
('cumulative_dose','condition','Gy','Cumulative ionizing-radiation dose.',false,true,false,''),
('direct_band_gap','electronic_structure','eV','Direct electronic band gap explicitly identified by the source.',false,true,false,'Use only when source explicitly labels direct gap; computational and experimental methods must remain distinguished.')
on conflict (property_key) do update set
 domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,
 structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,
 allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;