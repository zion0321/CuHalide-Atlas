insert into atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1
(mechanism_code,label,mechanism_family,definition,notes)
values
('nonradiative_relaxation','Non-radiative relaxation','decay_pathway','Excited-state population loss assigned to a non-radiative relaxation pathway under the stated molecular, structural or environmental condition.','The facilitating structural/solvent/phonon factor must remain in assignment_text; a low PLQY alone does not establish this mechanism.')
on conflict (mechanism_code) do update set
  label=excluded.label,
  mechanism_family=excluded.mechanism_family,
  definition=excluded.definition,
  notes=excluded.notes,
  active=true;