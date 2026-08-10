# Changelog

## 3.0.1 — 2026-08-10

Release 3.0.1 is a bibliographic-only patch over the scientific 3.0.0 parent. The patch itself changed zero frozen scientific fields and preserved all release denominators.

### Bibliographic patch

- Reviewed 217 DOI-linked titles.
- Applied 72 canonical display-title replacements.
- Retained 145 clean title variants.
- Reconstructed chemical notation in 12 complex titles.

### Post-publication scientific QA

A confirmed Record 13 `Structural Dimensionality` list-position mapping error affects four archived structure rows. Effective public values are:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The erratum does not change article/structure counts, space-group counts, verified/polar/strict-polar subsets or canonical denominators. Formal corrected scientific snapshots are reserved for hotfix 3.0.2; the immutable 3.0.1 archive is not silently rewritten.

### Smart RAG v9

- Deterministic rules protect exact counts, record properties, unresolved values, scope, false-premise correction, Evidence-D exclusion, symmetry/polarity/ferroelectric boundaries and selected material-specific relation constraints.
- Retrieval uses structured/lexical and semantic ranking with reranking when external AI capacity is available.
- Bounded model interpretation is accepted only through source-constrained claim validation.
- Live Literature Watch candidates remain isolated from frozen release evidence.
- Safe evidence-retrieval fallback remains available when external AI capacity is unavailable.
- The anonymous public gateway omits provider configuration, hidden retrieval traces and internal service diagnostics.

### Public knowledge portal v45

The public website was deliberately changed from a bulk-download database to a **query-and-view scientific knowledge portal**.

- Removed the public Downloads page and bulk JSON/CSV generation controls.
- Removed `DataDownload` declarations from public structured metadata.
- Added a field-whitelisted, server-side paginated public data API.
- Public article pages no longer redistribute exact stored publisher abstracts or internal review/search-helper fields.
- Public Literature Watch no longer exposes candidate abstracts, relevance scores, screening reason codes or internal adjudication details.
- Complete normalized CSV/JSON/XLSX tables, primary PDF/SI/CIF files, field-evidence excerpts/locators, QA logs and candidate-screening internals remain private research assets.
- Legacy `/api/data` now resolves to the same public-lite contract.
- Legacy `/api/export` is retired with HTTP 410.
- Legacy dynamic `/api/site` redirects to the current static public portal.
- Raw Supabase data/candidate endpoints and historical export/evaluation/canary services were moved behind JWT or retired.
- The scheduled Crossref/OpenAlex discovery function remains token-authenticated but no longer exposes anonymous candidate/status reads.
- The former GitHub Release bulk ZIP and checksum assets were withdrawn from public distribution; the release tag remains as a version notice.
- The public manifest/health contract was simplified to release identity, scientific counts, high-level service status, access policy and known errata.

### Production scientific-interface repair v46

The public runtime was re-audited at article, structure, crystallographic, RAG, security and frontend-contract levels. The repair changes runtime/presentation behavior only and does not rewrite the frozen 3.0.1 archive.

- Public site advanced to **v46**; public data contract to **2.2.1**; public metadata/health to **46.0**; Smart RAG public wrapper to **9.9.7**.
- Restored the frozen literature cutoff as **2026-06** and display label `2026.06` for the partial 2026 publication year.
- Article Explorer now defaults to the 332 `Core - Verified` articles while retaining explicit audit views.
- Structure Register now defaults to the 816 `Core - Included` structure/phase rows while retaining explicit all/boundary/pending/excluded views.
- Dashboard visualizations now state their denominators instead of mixing article, core-structure, resolved-space-group and verified-mapping populations implicitly.
- Corrected structure-halogen parsing for compact iodide formulas and bridging iodide notation while preventing `Cu(I)` oxidation-state notation from being treated as an iodide token.
- Removed article-grain photophysics and article-title photophysical terms from structure-grain search; short scientific acronyms use token-aware matching.
- Public structure details now suppress article-grain photophysical values unless a future independent structure-grain evidence object establishes the mapping.
- Bounded-Qwen claims no longer consume the minimized public data schema. Exact scientific context is loaded from JWT-protected internal RAG documents.
- Added a JWT-protected scientific-context contract probe and made public health fail if the claims context becomes unavailable or structurally empty.
- Bounded-claims structure context excludes unverified structure-grain motif/photophysics; fallback and public response guards suppress structure sources for ordinary photophysics queries where the evidence grain is not established.
- Vercel now derives a one-way per-client RAG fingerprint and forwards only the hash, avoiding a single shared proxy rate bucket while not forwarding raw client IPs.
- Added public POST body/message/history limits at both Vercel and Supabase gateway layers.
- Added shareable hash deep links for article/structure records, modal accessibility semantics, focus trapping/restoration, table captions, `aria-live` service states, stale-request cancellation and bootstrap-failure recovery.
- Public release metadata is exposed as `release-manifest.json`; sitemap/citation/manifest MIME handling was hardened.
- Production health reports provider degradation explicitly. The current free Workers AI state is **SAFE_FALLBACK**, so evidence retrieval and deterministic rules remain available while bounded model synthesis is temporarily disabled.

See `docs/PRODUCTION_REPAIR_V46_2026-08-10.md` and `docs/RAG_RUNTIME_V9.md` for the detailed runtime and validation boundaries.

### Validation history

- Frozen scientific RAG regression baseline: **70/70** (`rag-benchmark-v1.3`), predating final v9 orchestration and therefore not represented as a fresh 9.9.7 benchmark.
- Smart RAG v9 deterministic exact/anchor regression: **33/33**.
- Smart RAG v9 hybrid retrieval regression: **25/25**.
- Production `/health.json` after the v46 repair: **PASS**, including structure semantics, public minimization, bounded-claims context contract and known-errata checks.
- Supabase security advisor after the v46 repair: **0 security findings**.
- Coverage-v1: **210/210** pre-registered page-0 query cells completed; this does not establish exhaustive external-corpus completeness.
- Candidate-screen-v4: **1,788/1,788** DOI-unique candidates adjudicated, with zero automatic release inclusions.
- AI expert-surrogate audit: 80 article samples, 200 structure samples and 6,600 field/rule checks; this is not independent-human extraction accuracy.

A fresh full Qwen-enabled current-runtime benchmark remains intentionally unclaimed until free provider capacity recovers and a new versioned run is executed and archived. Paid overage is not enabled for validation.

## 3.0.0 — 2026-08-08

- Established the frozen scientific corpus and evidence-first article/structure registers.
- Published canonical quantitative subsets, crystallographic confidence rules, field-evidence objects and the initial retrieval index.
