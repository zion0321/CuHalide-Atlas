insert into atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1
(mechanism_code,label,mechanism_family,definition,notes)
values
('MXLCT','Metal/halide-to-ligand charge transfer','charge_transfer','Mixed metal- and halide-to-ligand charge-transfer excited state or emission, including source notation such as M/XLCT.','Use when the source explicitly gives a mixed M/XLCT assignment; do not decompose it into separate metal-centered and XLCT claims without evidence.'),
('ligand_centered','Ligand-centered excited state','ligand_centered','Excited state or emission assigned predominantly to a ligand-centered state, including triplet LC or pi-pi* assignments.','Preserve singlet/triplet and orbital notation in assignment_text.'),
('excimer','Excimer emission','intermolecular_excited_state','Emission or excited-state behavior assigned to an excimer formed by interacting chromophores.','The interacting chromophore identity and source basis should remain in assignment_text.'),
('intraligand_charge_transfer','Intraligand charge transfer','charge_transfer','Charge-transfer state occurring within a ligand framework, including source notation such as LCT or nLCT when explicitly defined as intraligand charge transfer.','Do not map this term to LLCT; preserve the source notation and state index in assignment_text.')
on conflict (mechanism_code) do update set
  label=excluded.label,
  mechanism_family=excluded.mechanism_family,
  definition=excluded.definition,
  notes=excluded.notes,
  active=true;