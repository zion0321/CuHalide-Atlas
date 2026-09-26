# Supabase runtime layout

This directory versions the **public-safe Supabase runtime and database contracts** used by CuHalide Atlas. It is intentionally separated from immutable Frozen Release archives and from private row-level curation/evidence payloads.

## Current production identities

- Publication state: **prepublication review**. Direct-link review is allowed; formal public release/indexing is not.
- Frozen scientific base: **Release 3.0.2** — immutable; snapshot coverage inclusive through **2026-06-30**.
- Current Curated: **rev.10** — curated through **2026-09-14**.
- Site / UI: **52 / 52.0**.
- Metadata gateway: **52.0**.
- Public Data: **2.18.0**.
- Structured Photophysics: **1.4.0**.
- Organic Components: **1.2.0**.
- Research Assistant: **10.6.0**.
- Smart RAG evidence engine: **10.0.0**.
- Motif Atlas schema: **1.2**.
- Active Current RAG corpus: **1,322 / 1,322** documents/embeddings, with content hashes valid.

## Current Curated rev.10 deterministic contract

Expected current counts:

- article audit records: **383**
- chemically included articles: **372**
- canonical verified articles: **372**
- structure/phase rows: **939**
- Core-Included structures: **901**
- resolved space-group rows: **761**
- verified one-to-one space-group mappings: **734**
- verified polar rows: **101**
- strict-polar rows: **94**
- strict-polar articles: **60**
- taxonomy rows: **939**
- resolved local Cu–X motif formulas: **677**
- unresolved local motif formulas: **262**
- resolved motif-geometry rows: **286**
- RAG documents / embedded: **1,322 / 1,322**

`public.cuhalide_atlas_current_curated_health_v1()` is the current database authority. It must pass structure-search, article-title isolation, taxonomy one-to-one, organic-component closure, terminal unresolved boundaries, RAG embedding completeness/content-hash integrity, and current-state count checks.

Current Curated remains a living full-current article/atomic-structure snapshot anchored to immutable Frozen Release 3.0.2. Corrections and later primary-evidence additions do not rewrite the frozen snapshot. Unresolved member-level values remain terminal evidence states unless primary evidence supports a unique assignment.

## Frozen Release 3.0.2 guard

The frozen release remains immutable. Its established count guard is:

**346 / 335 / 332 / 878 / 816 / 650 / 625 / 87 / 67 / 42**, with **1,224** Frozen archival RAG documents.

Rev.10 activation must not mutate frozen tables, archival RAG content, or frozen-release semantics.

## Structured Photophysics 1.4.0

The 383-article queue is fully terminal under the public policy `two_pass_verified_or_verified_no_reported_data`:

- two-pass verified data-bearing articles: **329**
- verified-no-reported-data articles: **54**
- Pass A / Pass B complete: **383 / 383**
- publishable samples: **941**
- publishable measurements: **2,278**
- publishable normalized values: **3,002**
- quantitative-analysis eligible values: **280**
- publishable mechanism claims: **478**
- conflict rows: **66**
- nonterminal conflicts: **0**

CUH-187 is absent from the live Current Curated photophysics membership. CUH-384 is represented at article/sample grain only, with source-reported precipitate A/B measurements; no crystallographic structure mapping is invented.

Conflicts fail closed at measurement grain. Article-grain photophysics is never silently reassigned to a named structure/phase row. Primary files, raw evidence locators and private review objects remain excluded from public projections.

## Motif Atlas 1.2

Current structure-grain taxonomy contains **939** rows, with **677** source-resolved motif formulas and **286** resolved motif geometries. Local Cu–X motif and global connectivity dimensionality remain independent fields. Fractional or mixed-occupancy stoichiometry is not rounded or truncated into an integer motif without independent structure-grain evidence. Unresolved QA states are retained internally but are not promoted as public motif families.

Rev.10 includes direct-primary corrections already reviewed for CUH-158, CUH-163 and CUH-311 and the recovered crystallographic evidence for CUH-269 and CUH-348. CUH-311-S01 is P-1 / triclinic / point group -1 / nonpolar. CUH-269 and CUH-348 member-level motif/dimensionality changes are source-backed, not inferred from stoichiometry.

## Organic Components 1.2.0

The database resolution tables are authoritative for canonical molecular connectivity. Current public projection:

- representation rows: **968**
- represented structures: **911**
- verified-connectivity rows: **61**
- unresolved rows: **897**
- not-applicable rows: **10**

Every represented component has an explicit connectivity-resolution state. Names, abbreviations and empirical-formula tokens remain searchable without being promoted to a verified graph. Public 2D depiction is fail-closed to `verified_connectivity`.

## Current RAG chain

The active current chain is:

`cuhalide-atlas-smart-rag-v302-current-public` (**10.0.0**)
→ `cuhalide-atlas-current-rag-r10-unified-internal`
→ `cuhalide-atlas-current-rag-r10-science-exact-internal`
→ locked lower-revision recovery implementations where explicitly required.

The rev.10 unified layer uses `cuhalide_atlas_hybrid_search_current_v4`, BGE-M3 embeddings and the current 1,322-document corpus. The rev.10 science-exact wrapper may delegate to the locked rev.9 structured exact implementation while patching current metadata; this is an explicit recovery implementation detail, not a rev.9 public state.

All `*-internal` functions are service-role-only, return 401 to unauthorized callers, identify themselves as `internal-service-only`, and remain `noindex, nofollow, noarchive`.

## Public ingress architecture

### Public data

`Vercel /api/public-data`
→ `cuhalide-atlas-public-data-v3` (**2.18.0**, canonical anonymous read-only ingress)
→ protected service-role data/query paths.

The Vercel compatibility filenames `public-data-r9.js`, `record-r9.js`, `motifs-r9.js` and `meta-r9.js` are historical filenames only; their active runtime contract is rev.10. Unknown public actions fail closed, pagination/batch sizes are clamped, and no bulk-export action is exposed.

Historical Public Data v2 is retired with HTTP **410 Gone**.

### CuXplore

`Vercel /api/agent`
→ `cuhalide-atlas-research-assistant-v1-public` (**10.6.0**, historical function slug retained for compatibility)
→ Smart RAG **10.0.0**
→ protected rev.10 Current/Frozen RAG internals and service-role-only retrieval RPCs.

Both ingress layers whitelist request content. Caller-controlled top-level fields are not spread into downstream evidence/model requests. Explicit Frozen Release 3.0.2 requests retain archival routing; current queries use the rev.10 full-current corpus.

### Runtime contract

`cuhalide-atlas-runtime-contract-v1-public` is the anonymous deterministic health/bootstrap contract. Its active identity is Site **52**, UI **52.0**, Public Data **2.18.0**, Smart RAG **10.0.0**, CuXplore **10.6.0**, Current Curated **rev.10**. During prepublication review, sitemap exposure remains limited to `/` and `/motifs`; record identifiers are not enumerated.

## Prepublication indexing and redistribution boundary

Every public machine response must preserve:

- `X-Robots-Tag: noindex, nofollow, noarchive`
- `X-CuHalide-Publication-State: prepublication-review`
- `Cache-Control: no-store` for live query/runtime data

Public access remains **query-and-view**. The following remain private: primary PDF/SI/CIF files, exact publisher abstracts, raw ingestion payloads, field-evidence excerpts/locators, candidate scores/reasons, internal QC/adjudication objects, and complete normalized bulk tables. `/api/export` remains retired; public query combinations must not recreate a bulk normalized export surface.

## Database and migration governance

Protected raw/current/taxonomy/component/photophysics tables remain behind schema privileges, RLS and explicit grants. `anon` and `authenticated` do not have `USAGE` on `atlas_internal`; `service_role` does.

The production project has a longer historical migration ledger than the public-safe migration subset in this repository. `supabase/migrations/` is therefore **not** a complete replayable clone of production history. Private corpus rows, credentials and evidence payloads must not be copied into the public repository merely to reconstruct history. Public-safe runtime source drift from production is treated as a defect.

CuXplore query acceleration uses two service-only materialized snapshots: `cuxplore_catalog_doi_snapshot_v1` and `cuxplore_processing_coverage_snapshot_v1`. They must be refreshed with `atlas_internal.cuxplore_refresh_query_snapshots_v1()` whenever catalog membership or source-processing state changes; retrieval correctness continues to come from the authoritative catalog/source tables rather than from user-writable cache state.

Temporary indexing/debug/export/re-embedding functions must be either synchronized narrow compatibility aliases, service-role-only internal endpoints, or inert HTTP 410 retirement stubs. The one-time rev.10 re-embedding function used to refresh changed RAG cards is retired after completion and must not remain an open write surface.

## Operational validation

Canonical production health:

`https://cuhalide-atlas-v3.vercel.app/health.json`

A synchronized rev.10 state requires Site **52**, UI **52.0**, Public Data **2.18.0**, Photophysics **1.4.0**, Organic Components **1.2.0**, Smart RAG **10.0.0**, CuXplore **10.6.0**, Current Curated **rev.10**, the denominators above, complete **1,322 / 1,322** RAG embeddings with valid hashes, frozen-release guards intact, scientific-grain safeguards true, indexing disabled, and no public bulk normalized export.

The repository `main` branch is protected by PR-only production governance and required Chromium, Lighthouse, Preview and Vercel checks. Formal public release remains a separate governance decision; technical readiness does not imply public launch, DOI assignment, licensing, or removal of prepublication indexing restrictions.
