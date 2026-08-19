alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  drop constraint if exists photophysics_structure_property_scope_check;

alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  add constraint photophysics_structure_property_scope_check
  check (structure_property_scope in ('intrinsic_bulk','processed_same_phase','processed_compound_state','modified_same_phase','composite','amorphous_derivative','device','article_level','unresolved'));

-- The production migration also contained a one-row private curation correction.
-- That operational data mutation is intentionally omitted from the public repository.
-- Repository migrations version schema/ontology contracts only; private evidence and
-- normalized curation rows remain outside version control by governance policy.
