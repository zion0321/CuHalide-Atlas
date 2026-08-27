-- CuHalide Atlas Current Curated rev.9 production hardening.
-- Mirrors production migration 20260827152743 at the public-safe DDL level.
-- The rev.9 structure snapshot has 947 non-null, unique structure_id values.

alter table atlas_internal.cuhalide_public_structures_current_r9_candidate_v1
  add constraint cuhalide_public_structures_current_r9_candidate_v1_pkey
  primary key (structure_id);

create index if not exists idx_photo_mechanism_sample
  on atlas_internal.cuhalide_photophysics_mechanism_v1(sample_id);
