# Remote migration inventory boundary — 2026-08-27

This document records the **public-safe inventory boundary** for the CuHalide Atlas production Supabase project after Current Curated rev.9 closeout. It is not a replayable SQL dump and deliberately does not reproduce private row payloads, credential/Vault operations, one-time provisioning material, private curation evidence, or historical migration statements that would disclose protected research/operational content.

## Inventory summary

- production migration-history entries: **323**
- earliest recorded version: **20260807140239** — `create_cuhalide_atlas_v2_public_schema`
- latest recorded version: **20260827152743** — `harden_rev9_current_keys_and_photophysics_fk_index`
- production Current Curated state: **rev.9**, curated through **2026-08-19**
- Frozen scientific base: **3.0.2**, immutable
- active Current RAG: **1,330 / 1,330** documents/embeddings

## Rev.8 → Rev.9 production ledger tail

The following names/versions are inventory metadata only. Migrations that contain private promoted rows or internal staging payloads are intentionally not reproduced as public SQL.

### Rev.8 structure-truth activation

- `20260826161141` — `create_rev8_structure_field_activation_candidate_v1`
- `20260826161219` — `fix_rev8_structure_field_activation_normalization_v2`
- `20260826161330` — `recreate_strict_rev8_geometry_activation_gate_v3`
- `20260826161431` — `create_rev8_candidate_snapshot_and_qa_v1`
- `20260826161522` — `recreate_rev8_activation_qa_with_polar_invariants_v2`
- `20260826161607` — `require_rev8_primary_source_reverification_for_geometry_only_v4`
- `20260826161904` — `create_rev8_identity_label_corrections_v1`
- `20260826161935` — `build_rev8_internal_candidate_snapshot_v1`
- `20260826162208` — `create_rev8_full_candidate_snapshot_qa_v1`
- `20260826162254` — `fix_rev8_full_candidate_dimension_denominators_v2`
- `20260826163430` — `build_rev8_internal_rag_candidate_v1`
- `20260826163515` — `create_rev8_rag_embedding_queue_v1`
- `20260826163713` — `build_rev8_article_atomic_candidate_v1`
- `20260826163911` — `create_rev8_hybrid_search_canary_v1`
- `20260826164004` — `create_rev8_release_candidate_gate_v1`
- `20260826164138` — `snapshot_rev7_before_rev8_activation`
- `20260826164200` — `snapshot_rev7_functions_before_rev8`
- `20260826164223` — `activate_current_curated_rev8_atomic`
- `20260826164402` — `temporary_restore_r7_hybrid_during_rev8_runtime_cutover`
- `20260826164452` — `finalize_current_hybrid_search_to_rev8`
- `20260827014549` — `preserve_frozen_article_origin_in_rev8_public_projection`

### Structured Photophysics 1.4.0 activation

- `20260827030246` — `create_structured_photophysics_140_candidate_snapshot`
- `20260827042553` — `snapshot_structured_photophysics_133_before_140_activation`
- `20260827043118` — `activate_structured_photophysics_140_public_contract`
- `20260827043935` — `snapshot_r8_rag_candidate_before_ph140_refresh`
- `20260827044258` — `create_ephemeral_r8_ph140_embedding_rpc_v3`
- `20260827044521` — `create_ephemeral_r8_ph140_indexer_trigger`
- `20260827044915` — `create_ephemeral_r8_ph140_candidate_search`
- `20260827044943` — `create_ephemeral_r8_ph140_regression_trigger`
- `20260827045146` — `snapshot_active_r8_rag_before_ph140_swap`
- `20260827045305` — `retire_ephemeral_r8_ph140_rag_write_surfaces`

The temporary PH1.4 write/indexing surfaces were retired after the bounded refresh; they are not retained as general public write interfaces.

### Current Curated rev.9

- `20260827054505` — `stage_current_curated_rev9_resolution_candidates_v2`
- `20260827091940` — `create_cuhalide_rag_r9_candidate`
- `20260827092140` — `add_cuhalide_r9_embedding_rpcs`
- `20260827093021` — `promote_cuhalide_current_curated_rev9`
- `20260827093230` — `add_cuhalide_public_organic_components_v2`
- `20260827152633` — `harden_cuhalide_function_execute_privileges`
- `20260827152743` — `harden_rev9_current_keys_and_photophysics_fk_index`

The last two migrations contain only public-safe DDL and are mirrored verbatim in `supabase/migrations/` under the same production versions.

## Current-state security/performance boundary

After the final rev.9 hardening:

- `anon` and `authenticated` have no `USAGE` on `atlas_internal`; `service_role` retains required access.
- Current CuHalide tables/views checked in the exposed `public` schema do not grant browser-role direct read/write access.
- Three unnecessary browser-role function `EXECUTE` privileges were revoked and restricted to `service_role` by migration `20260827152633`.
- The 947-row rev.9 structure snapshot has a primary key on `structure_id`.
- `atlas_internal.cuhalide_photophysics_mechanism_v1(sample_id)` has a covering FK index.
- Current Curated and Structured Photophysics deterministic health contracts remained `ok=true` after the hardening.
- Remaining Supabase linter INFO findings on historical/stage/rollback objects are not treated as defects when changing them would weaken archival immutability or when they represent intentional default-deny RLS states.

## Governance boundary

The public repository is not a complete canonical database-migration repository. `supabase/migrations/` contains a sanitized public-safe subset only. Production changes are validated against the live project, then mirrored into public-safe executable DDL or sanitized inventory/contracts where disclosure is appropriate.

The following practices remain prohibited:

- fabricating fake/no-op timestamp migrations to make the public tree appear complete;
- exporting raw private migration statements into the public repository;
- committing promoted private curation rows, exact publisher abstracts, field-evidence excerpts, candidate internals, or primary PDF/SI/CIF content;
- treating a data-less preview database as scientific validation of the production corpus.

This inventory records the real production-ledger boundary without converting the public repository into a private-data archive.
