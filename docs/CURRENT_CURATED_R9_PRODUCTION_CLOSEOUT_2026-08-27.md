# CuHalide Atlas — Current Curated rev.9 production closeout

Date: 2026-08-27

This document records the operational closeout of Current Curated rev.9. It supplements `CURRENT_CURATED_R9_2026-08-27.md`; it does not create a new frozen scientific release and does not modify Frozen Release 3.0.2.

## Production identity

- GitHub repository: `zion0321/CuHalide-Atlas`
- protected production branch: `main`
- rev.9 production merge commit before this documentation-only closeout: `92b09642992b1699e75d096cbe88274cf9755707`
- production deployment validated after that merge: `dpl_CDdiH64gLv22ho4zL7pG32eBSdCX`
- canonical review origin: `https://cuhalide-atlas-v3.vercel.app`
- governance state: `prepublication-review`

`main` is protected by PR-only governance, no force-push/delete, strict required checks, Chromium QA, Lighthouse QA, Vercel Preview QA and Vercel deployment status. There were no open pull requests at the start of this closeout audit.

## Runtime contract

- Site 51
- UI 51.0
- Metadata 51.0
- Current Curated rev.9
- Public Data 2.17.1
- Structured Photophysics 1.4.0
- Organic Components 1.2.0
- Smart RAG 9.20.0
- Research Assistant 10.5.0
- Motif Atlas 1.2

## Scientific production gate

The deterministic production health contract reports:

- 383 article audit records
- 372 chemically included articles
- 369 canonical verified articles
- 947 structure/phase rows
- 887 Core-Included structure rows
- 744 resolved space-group rows
- 717 verified one-to-one SG rows
- 101 verified polar rows
- 91 strict-polar rows across 57 articles
- 947 taxonomy rows
- 640 resolved local motifs / 307 explicit unresolved motifs
- 1,330 / 1,330 Current RAG documents/embeddings

The following scientific boundary checks are required true: mapping terminal closure, space-group terminal closure, dimensionality terminal closure, local-motif/global-dimensionality separation, structure/article grain separation, organic structure-state closure, organic connectivity-state closure, RAG embedding completeness and Frozen Release guards.

## Structured Photophysics gate

Structured Photophysics 1.4.0 is fully terminal for the 383-article queue:

- 329 two-pass verified data-bearing articles
- 54 verified-no-data articles
- 940 public sample states
- 2,275 measurements
- 3,002 normalized values
- 280 quantitative-analysis-eligible values
- 478 mechanism claims
- 66 conflict rows / 0 nonterminal conflicts

Primary files and raw evidence locators remain private. Conflicts remain fail-closed.

## Organic-component gate

Organic Components 1.2.0 is database-authoritative:

- 965 representation rows across 908 structures
- 61 verified-connectivity rows across 59 structures
- 894 unresolved rows
- 10 not-applicable rows

Searchability of a name/token is not equivalent to a verified molecular graph. Molecular depiction remains fail-closed to independently verified connectivity.

## Grain-semantics regression guard

Article-level index classes must never be presented as structure-grain physical dimensionality. Production regression uses Record 91 as a hostile example:

- Article 91: `Article index class = 0D`, explicitly labeled as retrieval metadata.
- `CUH-091-S02`: independent structure record with physical `Dimensionality = 1D` and `P21/n`.

The machine-readable public contract exposes the same distinction through `article_index_class`, `dimensionality_field_semantics = article_index_class_not_structure_grain`, and structure-grain records.

## Public ingress / privacy gate

Validated current ingress includes the friendly routes and direct `.js` compatibility paths. Current-state routes must report rev.9/Site 51 and cannot leak historical rev.8 runtime contracts.

Required prepublication boundaries:

- `X-Robots-Tag: noindex, nofollow, noarchive`
- non-enumerating sitemap: exactly `/` and `/motifs`
- `/api/export`: HTTP 410 Gone
- public access: query-and-view only
- no public primary PDF/SI/CIF
- no raw evidence locators
- no private curation/QC payloads
- no complete normalized bulk export surface

## Database hardening closeout

Two final public-safe DDL changes were applied and then mirrored to the repository using their real production migration versions:

1. `20260827152633_harden_cuhalide_function_execute_privileges.sql`
   - revokes unnecessary `public`/`anon`/`authenticated` execution from two internal photophysics helpers and one structure-search helper;
   - retains required `service_role` execution.
2. `20260827152743_harden_rev9_current_keys_and_photophysics_fk_index.sql`
   - establishes the primary key of the 947-row rev.9 structure snapshot on `structure_id`;
   - adds a covering index for the active photophysics mechanism `sample_id` foreign key.

Post-hardening database health remained `ok=true` for Current Curated and Structured Photophysics.

Supabase security advisor has no CuHalide warning/error requiring public exposure changes. INFO-only `RLS enabled, no policy` states on private/internal tables are intentional default-deny where browser roles lack schema/table privileges. Historical rollback/staging tables and unused historical indexes are not mutated merely to silence informational lint findings.

## Rollback and historical integrity

- Frozen Release 3.0.2 is immutable.
- Rev.8/rev.7 runtime/source layers remain recovery/audit assets but are not current public entry points.
- Source-level crystallographic errata remain preserved rather than arithmetically rewritten where the primary source is internally inconsistent and no uniquely verified corrected value is available.
- Historical migration statements containing private promoted data or credentials are not copied into the public repository; a sanitized remote-ledger inventory records the production boundary instead.

## Final public-release gate remains intentionally closed

Technical readiness does **not** authorize formal public release. The following require explicit owner/governance decisions and therefore remain outside this operational closeout:

- custom domain and ownership/authentication finalization
- archival identifier / DOI deposition
- project-wide licensing and third-party rights decisions
- deliberate transition from `prepublication-review` to formal public publication
- removal of `noindex/noarchive`
- any decision to expose downloadable normalized datasets

Until those decisions are explicitly approved, the correct production state is the current protected prepublication review portal.
