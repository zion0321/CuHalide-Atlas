-- CuHalide Atlas performance closeout, 2026-09-25.
-- Live migration already applied.
-- cuxplore_passages_v1 had two identical GIN indexes on fts.
-- Keep cuxplore_passages_fts_gin (higher observed use); remove the duplicate.

drop index if exists atlas_internal.cuxplore_passages_fts_idx;
