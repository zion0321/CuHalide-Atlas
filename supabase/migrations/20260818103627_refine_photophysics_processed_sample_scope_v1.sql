alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  drop constraint if exists photophysics_structure_property_scope_check;

alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  add constraint photophysics_structure_property_scope_check
  check (structure_property_scope in ('intrinsic_bulk','processed_same_phase','processed_compound_state','modified_same_phase','composite','amorphous_derivative','device','article_level','unresolved'));

update atlas_internal.cuhalide_photophysics_sample_state_v1
set structure_property_scope='processed_compound_state', updated_at=now()
where record_id=380 and sample_label='control emitter film' and structure_property_scope='processed_same_phase';