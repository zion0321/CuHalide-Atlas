-- Current Curated rev.8 serving semantics:
-- preserve immutable Frozen Release core-record origin separately from the
-- living Current Curated serving revision. The internal rev.8 atomic snapshot
-- remains untouched; only the public article projection reports origin grain.

create or replace view public.cuhalide_atlas_public_articles_current_v1 as
select
  record_id,
  title,
  authors,
  journal,
  year,
  doi,
  doi_url,
  halogen,
  dimensionality,
  category,
  evidence_level,
  scope_status,
  release_status,
  structure_summary,
  compounds,
  space_groups,
  emission_nm,
  emission_assignment,
  article_type,
  volume,
  issue,
  pages,
  ccdc_cif,
  last_verified,
  search_safe,
  dimension_class,
  curation_layer,
  coverage_class,
  case
    when curation_layer='Frozen Release' and coverage_class='frozen_release' then 0
    else live_revision
  end as live_revision,
  curated_at
from atlas_internal.cuhalide_public_articles_current_r8_candidate_v1;

comment on view public.cuhalide_atlas_public_articles_current_v1 is
'Current Curated rev.8 public article projection. Frozen Release core rows preserve origin live_revision=0 while current serving revision is supplied separately by the Current Curated state/runtime contract; 37 living additions/backfills remain live_revision=8.';
