insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('eta_pf','dynamics','%','Quantum-efficiency fraction assigned by the source to prompt fluorescence.',false,true,false,'Keep distinct from total PLQY and from temperature-dependent TADF/PH fractional intensity.'),
('eta_df','dynamics','%','Quantum-efficiency fraction assigned by the source to delayed fluorescence.',false,true,false,''),
('eta_ph','dynamics','%','Quantum-efficiency fraction assigned by the source to phosphorescence.',false,true,false,''),
('k_pf','dynamics','s-1','Prompt-fluorescence rate constant under the source-defined kinetic model.',false,true,false,'Retain source scaling and model definition.'),
('k_df','dynamics','s-1','Delayed-fluorescence rate constant under the source-defined kinetic model.',false,true,false,''),
('k_isc','dynamics','s-1','Intersystem-crossing rate constant under the source-defined kinetic model.',false,true,false,''),
('k_risc','dynamics','s-1','Reverse-intersystem-crossing rate constant under the source-defined kinetic model.',false,true,false,''),
('radiative_rate_s','dynamics','s-1','Source-model singlet radiative rate constant.',false,true,false,''),
('radiative_rate_t','dynamics','s-1','Source-model triplet radiative rate constant.',false,true,false,''),
('nonradiative_rate_s','dynamics','s-1','Source-model singlet non-radiative rate constant.',false,true,false,''),
('nonradiative_rate_t','dynamics','s-1','Source-model triplet non-radiative rate constant.',false,true,false,''),
('eta_isc','dynamics','%','Source-model intersystem-crossing efficiency.',false,true,false,''),
('eta_risc','dynamics','%','Source-model reverse-intersystem-crossing efficiency.',false,true,false,''),
('singlet_energy','excited_state','eV','Energy assigned to a singlet excited state under the stated experimental or computational basis.',true,true,false,'Reference basis and state label are mandatory.'),
('triplet_energy','excited_state','eV','Energy assigned to a triplet excited state under the stated experimental or computational basis.',true,true,false,'Reference basis and state label are mandatory.'),
('current_efficiency','device','cd A-1','Electroluminescent current efficiency at the stated operating point.',false,true,false,''),
('power_efficiency','device','lm W-1','Electroluminescent power efficiency at the stated operating point.',false,true,false,''),
('external_quantum_efficiency','device','%','Electroluminescent external quantum efficiency at the stated operating point.',false,true,false,''),
('turn_on_voltage','device','V','Device turn-on voltage as defined by the source.',false,true,false,''),
('operating_voltage','device','V','Device voltage at a stated luminance or current-density operating point.',false,true,false,'Qualifier must encode the operating point.'),
('cie_x','colorimetry','','CIE x chromaticity coordinate.',false,true,false,'Store with matched CIE y and sample/measurement state.'),
('cie_y','colorimetry','','CIE y chromaticity coordinate.',false,true,false,'Store with matched CIE x and sample/measurement state.')
on conflict (property_key) do update set
 domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,
 structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,
 allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;