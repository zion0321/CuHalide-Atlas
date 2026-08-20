insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('color_rendering_index','colorimetry','','Source-reported color rendering index (CRI) for a lighting/device state at the stated operating condition.',false,true,false,'Pair with CIE coordinates, CCT and applied voltage when available.')
on conflict (property_key) do update set domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;