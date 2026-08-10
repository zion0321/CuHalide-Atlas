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

- Public site advanced to v46.
- Restored the frozen literature cutoff as **2026-06** and display label `2026.06` for the partial 2026 publication year.
- Article Explorer defaults to the 332 `Core - Verified` articles while retaining explicit audit views.
- Structure Register defaults to the 816 `Core - Included` structure/phase rows while retaining explicit all/boundary/pending/excluded views.
- Dashboard visualizations state their denominators instead of mixing article, core-structure, resolved-space-group and verified-mapping populations implicitly.
- Corrected structure-halogen parsing for compact iodide formulas and bridging iodide notation while preventing `Cu(I)` oxidation-state notation from being treated as an iodide token.
- Removed article-grain photophysics and article-title photophysical terms from structure-grain search.
- Public structure details suppress article-grain photophysical values unless an independent structure-grain evidence object establishes the mapping.
- Bounded-Qwen claims no longer consume the minimized public data schema; scientific context is loaded from JWT-protected internal RAG documents.
- Added a JWT-protected scientific-context contract probe and made public health fail if claims context becomes unavailable or structurally empty.
- Added client-isolated RAG fingerprinting, POST/body/history limits, deep-linked record views and frontend accessibility/reliability hardening.

### Production hardening v47

A second adversarial pass focused on residual query semantics, evidence-grain leakage, public data latency, least privilege and interface consistency. The current production matrix is **site v47 / public-data 2.4.0 / Smart RAG 9.9.9 / meta 47.0**.

- Replaced per-request reconstruction/filtering of the complete release arrays with private, release-specific, field-whitelisted article and structure projection tables derived from the immutable 3.0.1 snapshot.
- Added service-role-only SQL query functions for server-side filtering, counting, sorting and pagination; `anon` and `authenticated` have neither direct projection SELECT privilege nor query-RPC EXECUTE privilege.
- Enabled RLS on both projection tables with explicit deny policies and reduced `service_role` table privilege to SELECT only.
- Added semantic normalization helpers for dimensionality and Cu–halide identity.
- Prevented halogenated organic ligands from being misread as the Cu–halide identity solely because the ligand formula contains Cl/Br/I.
- Tokenized one-letter halogen searches and short scientific terms, eliminating substring artifacts such as `I` matching arbitrary text and `STE` matching unrelated words.
- Removed article titles from structure search entirely, not only article-title photophysical terms.
- Removed unmapped motif text from the public structure-search/detail evidence surface; structure detail now states an explicit motif-grain boundary rather than heuristically extracting a motif from article-level summaries.
- Smart RAG 9.9.9 adds deterministic explicit-structure boundaries and a second generic outer guard for motif/photophysics, providing defense in depth independently of model availability.
- Public RAG source cards now expose an evidence-scope label, and deterministic evidence-boundary responses are represented separately from provider fallback.
- Publication-growth display is intentionally limited to **2006–2026.06** while explicitly stating that earlier canonical records remain indexed.
- Improved safe Markdown rendering, nested record-modal history, focus restoration, reduced-motion handling and client-side RAG timeout behavior.
- Removed the unused `/manifest.webmanifest` alias so the release manifest is not misrepresented as a PWA web-app manifest.
- Verified the daily Literature Watch cron is active at **02:17 UTC** and the checked 8–10 August runs succeeded.

See `docs/PRODUCTION_HARDENING_V47_2026-08-10.md` and `docs/RAG_RUNTIME_V9.md`.

### Validation history

- Frozen scientific RAG regression baseline: **70/70** (`rag-benchmark-v1.3`), predating final v9 orchestration and therefore not represented as a fresh 9.9.9 benchmark.
- Smart RAG v9 deterministic exact/anchor regression: **33/33**.
- Smart RAG v9 hybrid retrieval regression: **25/25**.
- Current production `/health.json`: **PASS** for v47 / public-data 2.4.0 / Smart RAG 9.9.9 / meta 47.0.
- Final live public counts: 332 canonical articles, 346 audit articles, 816 Core-Included structures, 878 total structures and 67 strict-polar rows.
- Final live semantic checks: `CUH-008-S01` → I; `CUH-162-S01` remains Cl/Br/I rather than false I; `CUH-013-S01` → Unresolved with erratum; structure searches `STE` and `luminescence` → 0; tokenized `I` search → 671 rows.
- Legacy bulk `/api/export` remains **HTTP 410**.
- Public sitemap returns **application/xml**.
- Supabase security advisor after v47 projection/RLS hardening: **0 findings**.
- Recent projection-backed public-data list/search/detail requests observed in Edge logs generally complete in a few hundred milliseconds; health/bootstrap deliberately remain slower because they retain cross-service and immutable-snapshot integrity checks.
- Vercel production runtime-error query after v47 deployment returned no errors in the checked window.
- Coverage-v1: **210/210** pre-registered page-0 query cells completed; this does not establish exhaustive external-corpus completeness.
- Candidate-screen-v4: **1,788/1,788** DOI-unique candidates adjudicated, with zero automatic release inclusions.
- AI expert-surrogate audit: 80 article samples, 200 structure samples and 6,600 field/rule checks; this is not independent-human extraction accuracy.

A fresh full Qwen-enabled current-runtime benchmark remains intentionally unclaimed until provider capacity is available and a new versioned run is executed and archived.

## 3.0.0 — 2026-08-08

- Established the frozen scientific corpus and evidence-first article/structure registers.
- Published canonical quantitative subsets, crystallographic confidence rules, field-evidence objects and the initial retrieval index.
