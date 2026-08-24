# Supabase runtime layout

This directory versions the **public-safe Supabase runtime and database contracts** used by CuHalide Atlas. It is intentionally separated from immutable Frozen Release archives and from private row-level curation/evidence payloads.

## Current production identities

- Publication state: **prepublication review**. Direct-link review is allowed; formal public release/indexing is not.
- Frozen scientific base: **Release 3.0.2** — immutable; snapshot coverage inclusive through **2026-06-30**.
- Current Curated: **rev.7** — curated through **2026-08-19**.
- Site / UI: **50 / 50.2**.
- Metadata gateway: **50.5**.
- Public Data: **2.16.0**.
- Structured Photophysics: **1.3.0**.
- Organic Components: **1.1.0**.
- Research Assistant: **10.4.1**.
- Smart RAG evidence engine: **9.19.0**.
- Motif Atlas schema: **1.2**.
- Active Current RAG corpus: **1,329 / 1,329** documents/embeddings.

## Current Curated rev.7 deterministic health contract

Expected Current Curated counts:

- article audit: **383**
- chemically included: **372**
- canonical verified: **369**
- structure/phase: **946**
- Core-Included: **886**
- resolved space-group rows: **710**
- verified one-to-one space-group mappings: **684**
- verified polar rows: **97**
- strict-polar rows: **87**
- strict-polar articles: **54**
- RAG documents / embedded: **1,329 / 1,329**

Expected immutable Frozen Release 3.0.2 guard remains:

**346 / 335 / 332 / 878 / 816 / 650 / 625 / 87 / 67 / 42**, with **1,224** Frozen archival RAG documents.

Current Curated is a living full-current article/atomic-structure snapshot anchored to immutable Frozen Release 3.0.2. Corrections and later primary-evidence additions do not rewrite the frozen snapshot.

## Structured Photophysics 1.3.0

Current staged publication contract:

- article queue: **383**
- Pass A complete: **383**, pending **0**
- Pass A curated: **275**
- two-pass verified: **54**
- verified-no-reported-data: **54**
- publishable samples: **940**
- publishable measurements: **2,260**
- publishable normalized values: **2,978**
- quantitative-analysis eligible values: **281**
- publishable mechanism claims: **476**
- conflicted measurements withheld: **9**

`pass_a_curated` means primary-evidence curation is complete but independent Pass B is not yet complete. `two_pass_verified` means independent Pass A/Pass B agreement. Conflicts fail closed at measurement grain. Article-grain photophysics is never silently reassigned to a named structure/phase row.

## Motif Atlas 1.2

Current structure-grain taxonomy:

- taxonomy rows: **946**
- resolved local Cu-X motifs: **628**
- unresolved local motifs: **318**
- unresolved legacy material-category mappings: **35**
- global connectivity dimensionality unresolved: **57 structure rows**

Local Cu-X motif and global connectivity dimensionality are independent fields. Fractional or mixed-occupancy stoichiometry is not rounded or truncated into an integer motif without independent structure-grain evidence.

## Organic Components 1.1.0

- QC-passed mappings: **495** across **453** structures
- raw component keys: **260**
- verified-connectivity rows: **253**
- structures with verified connectivity: **241**
- graph identities: **81**
- unresolved / fail-closed: **242**

Connectivity, stereochemistry and abbreviations are never inferred from analogy. Public depictions are deterministic RDKit 2025.09.4 outputs from verified connectivity only.

## Public ingress architecture

The prepublication site uses a small number of intentional anonymous, read-only ingress functions. Historical compatibility functions behind them are **service-role-only upstreams** or explicit retirement stubs.

### Public data

`Vercel /api/public-data`
→ `cuhalide-atlas-public-data-v3` (**canonical anonymous read-only ingress**)
→ service-authenticated `cuhalide-atlas-public-data-v302-public`
→ service-authenticated `cuhalide-atlas-public-data-v302`
→ private projections / service-role-only RPCs.

The Motif Atlas Vercel renderer also calls canonical `cuhalide-atlas-public-data-v3` directly; it does not traverse a historical compatibility slug.

The Vercel gateway and canonical v3 function both use explicit public-action allowlists. Unknown actions fail closed. Article and structure query RPCs enforce server-side page caps (24 and 50 respectively). Motif example results are capped at **24** during prepublication review.

The historical `cuhalide-atlas-public-data-v2` slug is retired as HTTP 410. It has no database or service-role capability and is not part of any current runtime dependency chain.

### Research Assistant

`Vercel /api/agent`
→ `cuhalide-atlas-research-assistant-v1-public` (**canonical anonymous conversational ingress**)
→ service-authenticated `cuhalide-atlas-smart-rag-v302-current-public`
→ protected Current/Frozen RAG internals and service-role-only retrieval RPCs.

Both Vercel and Supabase ingress layers whitelist request content. Caller-controlled top-level fields are not spread into downstream evidence/model requests; only normalized user/assistant messages plus server-selected mode/depth are forwarded. Request size/history limits remain enforced.

### Runtime contract

`cuhalide-atlas-runtime-contract-v1-public` is the anonymous deterministic health/bootstrap contract. It exposes only public-safe aggregate metadata. During prepublication review its sitemap action is **non-enumerating** and reports only `/` and `/motifs`; record identifiers are not returned in sitemap payloads.

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

`/api/export` remains HTTP 410. A combination of public query parameters must not recreate a bulk normalized export surface.

## Database privilege boundary

Protected raw/current/taxonomy/component/photophysics tables remain behind RLS/privilege controls. Public-facing SECURITY DEFINER query/RPC objects used by Edge functions have browser-role EXECUTE revoked unless explicitly documented otherwise. Current article and structure query RPCs are service-role mediated and internally clamp pagination.

Anonymous availability of a canonical Edge ingress is **not** equivalent to anonymous database access. Historical upstream Edge functions that possess service-role capability must additionally require the exact service bearer token and service `apikey` before executing.

## Source-of-truth and migration governance

The production project has a longer historical migration ledger than the public-safe migration subset in this repository. Historical production migrations can contain private corpus rows, one-time provisioning, Vault/credential handling, or other material that must not be copied into a public repository merely to reconstruct history.

Therefore:

- `supabase/migrations/` is **not** treated as a complete replayable clone of production history;
- `supabase/contracts/` contains sanitized, non-executable/current-state contract mirrors used for audit and recovery planning;
- private promoted row payloads are not committed as public SQL dumps;
- fake/no-op migrations must not be added merely to silence history checks;
- raw private migration statements must not be bulk-exported into this repository.

The Edge-function sources in this directory **are** expected to mirror the currently intended public-safe runtime logic closely enough for review/recovery. Version drift between production and this source tree is treated as a defect and is covered by repository contracts.

## Retirement policy

Temporary indexing, debugging, export, benchmark and obsolete compatibility endpoints must be removed or retained only as one of:

1. a tightly scoped synchronized compatibility shim only while an active dependency still exists;
2. a service-role-only internal upstream with JWT verification enabled; or
3. an HTTP 410 retirement stub.

An `ACTIVE` Supabase function can therefore still be a safe retirement stub; source behavior and JWT configuration are authoritative. Once a live dependency is migrated to the canonical ingress, the compatibility slug should be retired rather than preserved indefinitely.

## Operational validation

Canonical production health:

`https://cuhalide-atlas-v3.vercel.app/health.json`

A synchronized rev.7 production state requires Site **50**, Metadata **50.5**, Public Data **2.16.0**, Photophysics **1.3.0**, Organic Components **1.1.0**, Smart RAG **9.19.0**, Research Assistant **10.4.1**, Motif Atlas **1.2**, all rev.7 denominators above, complete **1,329 / 1,329** RAG embeddings, frozen-release guards intact, scientific-grain safeguards true, indexing disabled, and no public bulk normalized export.
