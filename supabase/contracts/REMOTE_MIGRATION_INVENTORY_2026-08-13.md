# Remote Supabase migration inventory — 2026-08-13

This file records the **public-safe inventory boundary** for the CuHalide Atlas production migration ledger. It is not a replayable SQL dump.

## Production ledger state

Production `supabase_migrations.schema_migrations` was audited on 2026-08-13:

- total migration-history entries: **121**
- first version: **20260807140239**
- latest version: **20260813085032**
- malformed/non-timestamp versions: **0**
- entries with missing statement arrays: **0**

Entries by migration day:

| Day | Count |
|---|---:|
| 2026-08-07 | 2 |
| 2026-08-08 | 10 |
| 2026-08-09 | 28 |
| 2026-08-10 | 47 |
| 2026-08-11 | 17 |
| 2026-08-12 | 12 |
| 2026-08-13 | 5 |

## Most recent production migration identities

| Version | Name |
|---|---|
| 20260813085032 | `current_curated_r2_dynamic_health_and_search` |
| 20260813084036 | `motif_atlas_component_quality_v1` |
| 20260813083329 | `motif_atlas_taxonomy_v1` |
| 20260813031245 | `current_curated_structure_search_health_guard_v1` |
| 20260813031135 | `current_curated_structure_search_boundary_v1` |
| 20260812154456 | `version_current_curated_r1_private_schema` |
| 20260812153010 | `current_curated_r1_canonical_filter` |
| 20260812151748 | `current_curated_r1_unified_hybrid_search` |
| 20260812151201 | `decouple_frozen_health_from_current_curated_counts` |
| 20260812150554 | `current_curated_r1_health_definition_fix` |
| 20260812150446 | `current_curated_r1_bootstrap_health` |
| 20260812150406 | `current_curated_r1_public_contract` |
| 20260812095730 | `harden_future_postgres_public_defaults_v302` |
| 20260812095624 | `harden_internal_atlas_sequence_acl_v302` |
| 20260812095435 | `harden_internal_atlas_function_acl_v302` |
| 20260812095005 | `explicit_deny_internal_atlas_rls_v302` |
| 20260812094828 | `harden_internal_atlas_acl_v302` |
| 20260811084216 | `raise_v302_structure_page_cap_for_sitemap_compat` |
| 20260811071051 | `harden_daily_discovery_cron_jwt_v302` |
| 20260811055921 | `current_curated_change_queue_fk_index` |

## Why the full SQL ledger is not committed here

The public GitHub repository is not the private production curation archive. Historical production migrations include a mixture of schema DDL, one-time operational/provisioning logic, private corpus/audit material, Vault or credential-handling logic, and data transformations that are inappropriate to reproduce verbatim in a public repository.

The following are therefore prohibited as a shortcut for GitHub/Supabase migration synchronization:

1. bulk-copying raw `schema_migrations.statements` into the public repository;
2. committing secrets, Vault payloads, one-time tokens, provider credentials or private corpus rows;
3. adding 121 empty/no-op migration files solely to match timestamps — such files could satisfy a superficial history comparison while producing invalid data-less preview databases;
4. representing the public `supabase/migrations/` directory as a complete clone of the production ledger when it is not.

## Authoritative model

- Production database state and migration history are authoritative inside the protected Supabase project.
- Public-safe current-state schema/RPC/RLS mirrors live under `supabase/contracts/`.
- Public Edge Function source is versioned under `supabase/functions/` where disclosure is appropriate.
- Private row-level curation data and evidence remain outside the public repository.
- CuHalide Atlas does not use the public GitHub repository as an automatic, complete migration replay source for production.

If the project later adopts Git-based Supabase branching again, it should first move to a **complete sanitized canonical migration repository** (or another private deployment repository) and test a full data-less database rebuild before enabling automatic migration deployment.
