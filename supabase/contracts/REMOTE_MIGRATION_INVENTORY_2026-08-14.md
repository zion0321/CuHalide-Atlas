# Remote migration inventory boundary — 2026-08-14

This document records the **public-safe inventory boundary** for the CuHalide Atlas production Supabase project. It is not a replayable SQL dump and deliberately does not reproduce private row payloads, credential/Vault operations, one-time provisioning material, or historical migration statements that would disclose protected research/operational content.

## Inventory summary

- total migration-history entries: **124**
- earliest recorded version: **20260807140239** — `create_cuhalide_atlas_v2_public_schema`
- latest recorded version: **20260814054208** — `motif_atlas_schema_1_2_fractional_conservatism`
- production Current Curated state: **rev.3**, curated through **2026-08-14**
- frozen scientific base: **3.0.2**, immutable

## Rev.3-era additions

The final three production migration-history entries are:

1. `20260814052750` — `add_scoped_current_curated_rag_embedding_writer`
   - service-role-only writer
   - accepts only `current-curated-rN` releases
   - requires 1024-dimensional embeddings
   - prevents the Current Curated indexing path from modifying Frozen/legacy release documents
2. `20260814053220` — `extend_current_hybrid_search_to_rev3`
   - extends the existing unified Current/Frozen retrieval contract to `current-curated-r3`
   - does not alter the immutable Frozen corpus
3. `20260814054208` — `motif_atlas_schema_1_2_fractional_conservatism`
   - advances Motif Atlas contract metadata to schema 1.2
   - states the conservative rule that fractional/mixed-occupancy labels remain motif-unresolved unless an independent structure-grain mapping establishes a discrete integer Cu–X core

The 15-row taxonomy correction and the three promoted articles/14 structure determinations are protected production curation data, not public migration payloads, and are intentionally not reproduced here.

## Governance boundary

The public repository is not a complete canonical database-migration repository. `supabase/migrations/` contains a sanitized public-safe subset only. Production changes are reviewed and applied against the production project, validated with health/security/scientific contracts, and then mirrored into public-safe documentation or executable schema fragments where disclosure is appropriate.

The following practices are prohibited:

- fabricating fake/no-op timestamp migrations to make the public tree appear complete;
- exporting raw private migration statements into the public repository;
- committing promoted private curation rows, exact publisher abstracts, field-evidence excerpts, candidate internals, or primary PDF/SI/CIF content;
- treating a data-less public preview database as scientific validation of the production corpus.

This inventory exists so repository QA can verify that the declared public-safe boundary tracks the real production ledger without converting the public repository into a private-data archive.