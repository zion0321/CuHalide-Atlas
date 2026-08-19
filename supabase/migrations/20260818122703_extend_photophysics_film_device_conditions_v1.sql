alter table atlas_internal.cuhalide_photophysics_measurement_v1
  add column if not exists applied_voltage_v numeric;

comment on column atlas_internal.cuhalide_photophysics_measurement_v1.applied_voltage_v is 'Applied device bias in volts for electroluminescence/color-state measurements; null when not applicable.';

insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('rms_roughness','film_morphology','nm','Root-mean-square surface roughness of the stated film measured by AFM.',false,true,false,'Preparation route and film identity are mandatory.'),
('fermi_level','electronic_structure','eV','Source-reported Fermi-level magnitude relative to the vacuum reference under the stated UPS convention.',false,true,false,'Preserve source sign/reference convention in qualifier.'),
('vbm_energy','electronic_structure','eV','Source-reported valence-band maximum energy magnitude relative to vacuum.',false,true,false,'Preserve source sign/reference convention in qualifier.'),
('cbm_energy','electronic_structure','eV','Source-reported conduction-band minimum energy magnitude relative to vacuum.',false,true,false,'Preserve source sign/reference convention in qualifier.'),
('trap_filled_limit_voltage','device_physics','V','Trap-filled-limit voltage obtained from the stated SCLC device/analysis.',false,true,false,'Keep device architecture and extraction method in measurement conditions.'),
('device_half_life','device','min','Device half-lifetime T50 under the stated initial luminance and operating protocol.',false,true,false,'Initial luminance and atmosphere are mandatory context.'),
('correlated_color_temperature','colorimetry','K','Correlated color temperature for an electroluminescent state at the stated applied voltage.',false,true,false,'Pair with CIE coordinates and applied voltage.'),
('el_stability_outcome','device','','Qualitative source-reported electroluminescence spectral/intensity stability outcome.',false,true,true,'Use for spectral stability or other non-numeric device aging outcomes.'),
('thermal_mass_loss','stability','%','Source-reported thermogravimetric mass loss associated with a stated temperature/process.',false,true,false,'Keep attribution such as solvent release in qualifier.')
on conflict (property_key) do update set domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;