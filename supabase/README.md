# Supabase runtime layout

This directory versions the **public-safe Supabase runtime and database contracts** used by CuHalide Atlas. It is intentionally separated from immutable Frozen Release archives and from private row-level curation/evidence payloads.

## Current production identities

- Publication state: **prepublication review**. Direct-link review is allowed; formal public release/indexing is not.
- Frozen scientific base: **Release 3.0.2** — immutable; snapshot coverage inclusive through **2026-06-30**.
- Current Curated: **rev.9** — curated through **2026-08-19**.
- Site / UI: **51 / 51.0**.
- Metadata gateway: **51.0**.
- Public Data: **2.17.1**.
- Structured Photophysics: **1.4.0**.
- Organic Components: **1.2.0**.
- Research Assistant: **10.5.0**.
- Smart RAG evidence engine: **9.20.0**.
- Motif Atlas schema: **1.2**.
- Active Current RAG corpus: **1,330 / 1,330** documents/embeddings.

## Current Curated rev.9 deterministic health contract

Expected Current Curated counts:

- article audit: **383**
- chemically included: **372**
- canonical verified: **369**
- structure/phase: **947**
- Core-Included: **887**
- resolved space-group rows: **744**
- verified one-to-one space-group mappings: **717**
- verified polar rows: **101**
- strict-polar rows: **91**
- strict-polar articles: **57**
- taxonomy rows: **947**
- resolved local Cu–X motifs: **640**
- explicitly unresolved local motifs: **307**
- unresolved legacy material-category mappings: **35**
- RAG documents / embedded: **1,330 / 1,330**

Expected immutable Frozen Release 3.0.2 guard remains:

**346 / 335 / 332 / 878 / 816 / 650 / 625 / 87 / 67 / 42**, with **1,224** Frozen archival RAG documents.

Current Curated is a living full-current article/atomic-structure snapshot anchored to immutable Frozen Release 3.0.2. Corrections and later primary-evidence additions do not rewrite the frozen snapshot. Unresolved member-level values are retained as terminal evidence states when the available primary evidence cannot support a unique assignment.

## Structured Photophysics 1.4.0

The 383-article queue is fully terminal under the current public policy:

- two-pass verified data-bearing articles: **329**
- verified-no-reported-data articles: **54**
- Pass A-only public articles: **0**
- publishable samples: **940**
- publishable measurements: **2,275**
- publishable normalized values: **3,002**
- quantitative-analysis eligible values: **280**
- publishable mechanism claims: **478**
- conflict rows: **66**
- nonterminal conflicts: **0**

Conflicts fail closed at measurement grain. Article-grain photophysics is never silently reassigned to a named structure/phase row. Primary files, raw evidence locators and private review objects remain excluded from public projections.

## Motif Atlas 1.2

Current structure-grain taxonomy:

- taxonomy rows: **947**
- resolved local Cu–X motifs: **640**
- unresolved local motifs: **307**
- unresolved legacy material-category mappings: **35**

Local Cu–X motif and global connectivity dimensionality are independent fields. Fractional or mixed-occupancy stoichiometry is not rounded or truncated into an integer motif without independent structure-grain evidence.

## Organic Components 1.2.0

The database resolution tables are authoritative for canonical molecular connectivity.

- public representation rows: **965**
- represented structures: **908**
- distinct component keys: **438**
- verified-connectivity rows: **61**
- structures with verified connectivity: **59**
- unresolved rows: **894**
- not-applicable rows: **10**

Every Core-Included structure has an explicit structure-grain organic-component state and every component representation has an explicit connectivity-resolution state. Names, abbreviations and empirical-formula tokens remain searchable without being promoted to a verified graph. Public 2D depiction is fail-closed to `verified_connectivity`.

## Public ingress architecture

The prepublication site uses a small number of intentional anonymous, read-only ingress functions. Historical compatibility functions behind them are **service-role-only upstreams**, synchronized compatibility aliases, or explicit retirement stubs.

### Public data

`Vercel /api/public-data`
→ `cuhalide-atlas-public-data-v3` (**canonical anonymous read-only ingress**)
→ protected service-role data/query paths.

The Vercel gateway and canonical v3 function use explicit public-action allowlists. Unknown actions fail closed. Record query RPCs clamp pagination server-side. Direct compatibility paths such as `/api/public-data.js`, `/api/data.js`, `/api/meta.js`, `/api/motifs.js` and `/api/record.js` are routed through the same Current Curated rev.9 contracts rather than exposing historical current-state semantics.

Historical Public Data v2 is retired with HTTP **410 Gone** and cannot restore superseded public semantics.

### Research Assistant

`Vercel /api/agent`
→ `cuhalide-atlas-research-assistant-v1-public` (**canonical anonymous conversational ingress**)
→ service-authenticated Smart RAG 9.20.0
→ protected rev.9 Current/Frozen RAG internals and service-role-only retrieval RPCs.

Both Vercel and Supabase ingress layers whitelist request content. Caller-controlled top-level fields are not spread into downstream evidence/model requests; only normalized user/assistant messages plus server-selected mode/depth are forwarded. Explicit requests for Frozen Release 3.0.2 retain archival routing; Current queries use the rev.9 full-current corpus.

### Runtime contract

`cuhalide-atlas-runtime-contract-v1-public` is the anonymous deterministic health/bootstrap contract. Its active identity is Site **51**, UI **51.0**, Metadata **51.0**, Current Curated **rev.9**. During prepublication review its sitemap action is non-enumerating and reports only `/` and `/motifs`; record identifiers are not returned in sitemap payloads.

## Prepublication indexing and redistribution boundary

Every public machine response must preserve:

- `X-Robots-Tag: noindex, nofollow, noarchive`
- `X-CuHalide-Publication-State: prepublication-review`
- `Cache-Control: no-store` where the response contains live query/runtime data

The prepublication sitemap contains only the portal root and Motif Atlas landing page. Record-level article/structure sitemap enumeration is intentionally withheld until formal release.

Public access remains **query-and-view**. The following remain private:

- primary PDF / SI / CIF files
- exact publisher abstracts
- raw ingestion payloads
- field-evidence excerpts and locators
- internal candidate scores/reasons
- internal QC/adjudication objects
- complete normalized bulk tables

`/api/export` remains HTTP **410 Gone**. A combination of public query parameters must not recreate a bulk normalized export surface.

## Database privilege boundary

Protected raw/current/taxonomy/component/photophysics tables remain behind schema privileges, RLS and explicit grants. `anon` and `authenticated` do not have `USAGE` on `atlas_internal`; `service_role` does. Anonymous Edge availability is therefore not anonymous database access.

Current rev.9 hardening additionally revokes browser-role `EXECUTE` from three helper functions that did not need to be callable directly:

- `atlas_internal.cuhalide_photophysics_public_conflict_warning_v1(bigint,text)`
- `atlas_internal.cuhalide_photophysics_release_regression_v3()`
- `public.cuhalide_atlas_current_structure_search_safe_v1()`

All three remain executable by `service_role` only. This is versioned as production migration **20260827152633**.

The active 947-row rev.9 structure snapshot has a primary key on `structure_id`, and `atlas_internal.cuhalide_photophysics_mechanism_v1(sample_id)` has a covering FK index. This is versioned as production migration **20260827152743**.

Supabase security-advisor `rls_enabled_no_policy` INFO findings on private/internal tables are intentional default-deny states where browser roles have neither schema access nor table privileges. Historical rollback/stage tables are not mutated merely to remove informational linter messages.

## Source-of-truth and migration governance

The production project has a longer historical migration ledger than the public-safe migration subset in this repository. Historical production migrations can contain private corpus rows, one-time provisioning, Vault/credential handling, or other material that must not be copied into a public repository merely to reconstruct history.

Therefore:

- `supabase/migrations/` is **not** treated as a complete replayable clone of production history;
- public-safe DDL that is important for current recovery is mirrored using its real production migration version when available;
- `supabase/contracts/` contains sanitized/current-state inventories and contract mirrors used for audit and recovery planning;
- private promoted row payloads are not committed as public SQL dumps;
- fake/no-op migrations must not be added merely to silence history checks;
- raw private migration statements must not be bulk-exported into this repository.

The Edge-function sources in this directory **are** expected to mirror the currently intended public-safe runtime logic closely enough for review/recovery. Version drift between production and this source tree is treated as a defect and is covered by repository contracts.

## Retirement policy

Temporary indexing, debugging, export, benchmark and obsolete compatibility endpoints must be removed or retained only as one of:

1. a tightly scoped synchronized compatibility alias with no stronger privileges than the canonical endpoint, only while an active dependency demonstrably remains;
2. a service-role-only internal upstream with JWT/service authentication; or
3. an HTTP 410 retirement stub.

An `ACTIVE` Supabase function can therefore still be a safe retirement stub; source behavior and authentication configuration are authoritative. Once the final live dependency is migrated, a compatibility slug must be retired rather than preserved indefinitely.

## Operational validation

Canonical production health:

`https://cuhalide-atlas-v3.vercel.app/health.json`

A synchronized rev.9 production state requires Site **51**, UI **51.0**, Metadata **51.0**, Public Data **2.17.1**, Photophysics **1.4.0**, Organic Components **1.2.0**, Smart RAG **9.20.0**, Research Assistant **10.5.0**, Motif Atlas **1.2**, all rev.9 denominators above, complete **1,330 / 1,330** RAG embeddings, frozen-release guards intact, scientific-grain safeguards true, indexing disabled and no public bulk normalized export.

The repository `main` branch is protected by PR-only production governance and required Chromium, Lighthouse, Preview and Vercel checks. Formal public release remains a separate governance decision: custom domain/ownership, archival identifier or DOI, rights/license metadata and the deliberate removal of prepublication indexing restrictions must not be inferred from technical readiness.
