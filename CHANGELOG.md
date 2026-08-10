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

### Validation history

- Frozen scientific RAG regression baseline: **70/70** (`rag-benchmark-v1.3`), predating final v9 orchestration.
- Smart RAG v9 deterministic exact/anchor regression: **33/33**.
- Smart RAG v9 hybrid retrieval regression: **25/25**.
- Smart RAG public smoke and security hardening gates passed during the v9 deployment sequence.
- Coverage-v1: **210/210** pre-registered page-0 query cells completed; this does not establish exhaustive external-corpus completeness.
- Candidate-screen-v4: **1,788/1,788** DOI-unique candidates adjudicated, with zero automatic release inclusions.
- AI expert-surrogate audit: 80 article samples, 200 structure samples and 6,600 field/rule checks; this is not independent-human extraction accuracy.

## 3.0.0 — 2026-08-08

- Established the frozen scientific corpus and evidence-first article/structure registers.
- Published canonical quantitative subsets, crystallographic confidence rules, field-evidence objects and the initial retrieval index.
