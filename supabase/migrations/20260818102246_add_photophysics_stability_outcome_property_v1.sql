insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('rl_stability_outcome','stability','','Qualitative source-reported radioluminescence stability outcome under an explicitly stated irradiation protocol.',false,true,true,'Use when the source states stability qualitatively but does not provide a defensible numerical retention value.')
on conflict (property_key) do update set
 domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,
 structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,
 allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;