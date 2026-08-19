insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('cd_observation','chiroptical','','Qualitative source-reported circular-dichroism observation for the stated sample.',false,true,true,'Use for explicit no-signal/mirror-image/range statements when exact amplitudes are unavailable.'),
('cpl_observation','chiroptical','','Qualitative source-reported circularly polarized luminescence observation for the stated sample.',false,true,true,'Use for CPL-silent or mirror-image outcomes when a scalar g_lum is not available.'),
('excitation_dependence_observation','spectral','','Qualitative source-reported excitation-wavelength dependence of an emission band or spectrum.',false,true,true,'Do not digitize relative band ratios unless numerical source data are available.'),
('ple_observation','spectral','','Qualitative source-reported photoluminescence-excitation behavior.',false,true,true,'Useful when a broad plateau/range is reported without a unique maximum.'),
('phase_outcome','stimulus_response','','Source-reported phase/structure identity after a stimulus, reaction, or recrystallization step.',false,true,true,'Must retain mapping/evidence basis such as PXRD or SCXRD.'),
('ee_response_observation','chiral_recognition','','Qualitative source-reported relation between enantiomeric excess and optical response.',false,true,true,'Do not convert a qualitative correlation into a calibration curve without source numeric data.')
on conflict (property_key) do update set
 domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,
 structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,
 allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;