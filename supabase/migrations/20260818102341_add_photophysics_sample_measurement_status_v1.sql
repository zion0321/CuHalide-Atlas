alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  add column if not exists photophysics_measurement_status text not null default 'pending',
  add column if not exists no_measurement_note text not null default '';

alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  add constraint photophysics_measurement_status_check
  check (photophysics_measurement_status in ('pending','measured','no_measurement_reported','not_applicable','unresolved'));

comment on column atlas_internal.cuhalide_photophysics_sample_state_v1.photophysics_measurement_status is 'Explicit distinction between measured samples, samples with no photophysical measurement reported in the reviewed article, pending review, and unresolved cases.';

insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('pl_stability_outcome','stability','','Qualitative source-reported photoluminescence stability outcome under an explicitly stated storage or treatment protocol.',false,true,true,'Use when source gives qualitative stability without a defensible numerical retention value.')
on conflict (property_key) do update set
 domain=excluded.domain,canonical_unit=excluded.canonical_unit,definition=excluded.definition,
 structure_property_default=excluded.structure_property_default,condition_sensitive=excluded.condition_sensitive,
 allow_text_value=excluded.allow_text_value,notes=excluded.notes,active=true;