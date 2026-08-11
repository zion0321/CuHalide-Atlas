# CuHalide Atlas production status — v48

Date: 2026-08-11  
Frozen scientific release: **3.0.2**  
Frozen literature cutoff: **2026-06**

## Production matrix

| Component | Version |
|---|---:|
| Public site | 48 |
| Public data | 2.7.0 |
| Public Smart RAG | 9.12.0 |
| Public metadata / health | 48.0 |
| Release-3.0.2 internal RAG gateway | 9.12.0-public-internal |
| Release-3.0.2 core adapter | 9.12.0-v302-core-adapter-internal |
| Scientific-context health | rag-contract-health-v1.1.0 |
| Bounded claims service | qwen-claims-v9-1.3.3 |
| Structure-halogen semantics | structure-halogen-v6 |

## Scientific hotfix

Release 3.0.2 physically incorporates four confirmed Record 13 `Structural Dimensionality` corrections while preserving the immutable 3.0.1 archive:

- `CUH-013-S01` → **Unresolved**;
- `CUH-013-S02` → **0D**;
- `CUH-013-S03` → **0D**;
- `CUH-013-S04` → **0D**.

The correction adds no new literature and changes no article, structure, resolved-space-group, verified-mapping, verified-polar, strict-polar or canonical denominator. Historical 3.0.1 errata are retained as audit metadata and marked resolved/superseded in 3.0.2.

## Frozen counts

- article audit records: **346**;
- chemically included articles: **335**;
- canonical verified articles: **332**;
- structure/phase rows: **878**;
- Core-Included structure rows: **816**;
- resolved space-group rows: **650**;
- verified one-to-one space-group mappings: **625**;
- verified polar rows: **87**;
- strict-polar rows: **67** across **42** articles.

## Current Curated and rolling literature maintenance

The public maintenance model separates:

1. **Frozen Release** — immutable/citable snapshots;
2. **Current Curated** — primary-evidence-reviewed additions after QC;
3. **Literature Watch** — metadata-only discovery candidates.

At release publication, Current Curated is initialized to:

- base release: **3.0.2**;
- curated through: **2026-08-11**;
- live revision: **0**;
- status: **ready**.

The private curation state machine is:

`DISCOVERED → DEDUPED → TRIAGED → NOTIFIED → PRIMARY_EVIDENCE_RECEIVED → EXTRACTED → QC_PASSED → LIVE_CURATED → FORMAL_RELEASE`

Candidate metadata never authorizes scientific inclusion. Main article, SI and CIF evidence are requested as appropriate. Promotion requires DOI deduplication, chemical-scope adjudication, structure/phase expansion, crystallographic evidence mapping, structure/article evidence-grain checks, relational/scientific QC, RAG indexing and production regression.

The publication-growth graph uses the natural-year label **2026**, not `2026.06`. The frozen release cutoff remains separately reported as **2026-06**. Later Current Curated additions can therefore increase the 2026 count without changing the frozen-release provenance.

## Public data and least privilege

Release-specific public projections:

- `cuhalide_atlas_public_articles_v302`;
- `cuhalide_atlas_public_structures_v302`.

Public search/filter/count/pagination runs server-side. `anon` and `authenticated` have no direct projection-table SELECT or projection-query RPC execution. RLS/ACL, checksum, bootstrap, denominator, halogen, Record 13 and RAG-release compatibility contracts are part of the public health gate.

Public access remains query-and-view. Complete normalized tables, exact stored publisher abstracts, primary PDF/SI/CIF payloads, field-evidence excerpts/locators, internal QA/adjudication objects, curation queue internals and candidate abstracts/scores/reasons remain private.

## Structure and RAG evidence grain

All **878** structure RAG documents are identity/crystallography-only. The release-3.0.2 index is **1,224/1,224 embedded documents**: 346 article-grain documents plus 878 structure documents.

Release-transition integrity checks:

- article content-SHA mismatches vs 3.0.1: **0**;
- unchanged structure content-SHA mismatches vs 3.0.1: **0**;
- intended Record 13 structure-document changes: **4**;
- corrected Record 13 dimensions in v302 RAG: **4/4**;
- current-release Record 13 erratum flags removed: **4/4**;
- forbidden structure-context science keys: **0**;
- explicit copied article/motif/emission fields in structure documents: **0**.

## RAG validation

Fresh `rag-benchmark-v1.6` run:

- run ID: `04bd93ec-cc3a-424b-9d8d-a1b08cec58ff`;
- exact/deterministic: **25/25**;
- retrieval: **25/25**;
- reasoning/scientific-boundary: **20/20**;
- total: **70/70 PASS**;
- release gate: **PASS**;
- paid Workers AI overage authorized: **false**.

v1.5 history remains immutable. v1.6 rebases literal release identity to 3.0.2 without changing frozen scientific fact/count targets. RS08 is intentionally deterministic so Live Monitor candidate metadata cannot become model-supported frozen scientific evidence.

## Live production QA

The release-specific read-only Playwright/Chromium gate passed on the live production portal across the configured desktop, tablet and mobile projects. It validates:

- release 3.0.2 / site v48 / data 2.7.0 / RAG 9.12.0 / meta 48.0;
- health and manifest contracts;
- Current Curated presentation;
- all frozen scientific denominators;
- Record 13 physical corrections;
- structure-halogen semantics and source-conflict handling;
- structure/article evidence-grain boundaries;
- serious/critical accessibility findings;
- page/console errors and horizontal overflow;
- responsive navigation, modal focus/Escape behavior and deep links;
- CSP hardening and retired public routes.

Supabase security advisor returned **0 findings** after the final schema hardening pass.

## Web delivery

The production root is served through `middleware.js` → `api/site.js`. `api/site.js` treats `public/index.html` as a version-controlled scientific-interface shell, applies the release-3.0.2/v48 contract with invariant checks, and computes SHA-256 CSP hashes from the final HTML before serving it. The shell is therefore an implementation template, not an independent release-identity source.

## Final hardening closure

The final v48 hardening pass adds operational reproducibility and public-discovery improvements without changing the frozen 3.0.2 scientific corpus:

- GitHub canonical Supabase wrappers and release-specific v302 services are synchronized with production; required internal RAG dependencies are snapshotted and inventoried.
- `package-lock.json` locks the QA dependency graph; browser and Lighthouse workflows use `npm ci`.
- A scheduled production Lighthouse gate complements Playwright/Axe with mobile/desktop performance, accessibility, best-practices, SEO, LCP and CLS thresholds.
- Stable public record URLs and a dynamic sitemap make canonical article and structure records crawlable without exposing private provenance.
- Homepage structured/social metadata is release-aligned; article halogen filtering states its containment-versus-exact-category semantics explicitly.
- The retired bulk export route remains 410 and identifies release 3.0.2 consistently.
- Daily machine literature discovery is protected by platform JWT verification plus a separate private cron token, scans a 30-day rolling window with multiple Crossref/OpenAlex query families, and remains metadata-only.
- Obsolete debug/temp/ephemeral/export Edge Functions were replaced with JWT-required 410 retirement stubs; no required production dependency was retired.
- Production health accepts future Current Curated revisions while preserving frozen release denominators.

The machine discovery hardening was validated by a successful JWT+token pg_cron-style invocation on 2026-08-11. The resulting records remain candidate metadata only and do not modify Frozen Release or Current Curated.

## Archival boundary

The final repository/Zenodo DOI, creator/ORCID/funder metadata, blanket project licensing decision and archival deposit remain a separate final-freeze stage. No permanent DOI is asserted here, and no third-party primary PDF/SI/CIF redistribution is authorized by this production release.
