# Changelog

## 3.0.1 — 2026-08-10

- Published a bibliographic-only patch over scientific release 3.0.0.
- Reviewed 217 DOI-linked titles.
- Applied 72 canonical display-title replacements.
- Retained 145 clean title variants and reconstructed chemical notation in 12 complex titles.
- The 3.0.1 patch itself changed zero scientific fields and preserved all frozen release counts.
- Regenerated affected RAG documents and completed 1,224/1,224 BGE-M3 embeddings.
- Passed `rag-benchmark-v1.3`: 70/70 cases. This run is retained as the frozen scientific regression baseline and predates the final Smart RAG v9 orchestration layer.
- Passed the original v8 `production-smoke-v3.0.0`: 17/17 public-interface checks.
- Completed coverage-v1: 210/210 pre-registered page-0 query cells.
- Completed candidate-screen-v4 for 1,788 DOI-unique candidates: 293 screened in scope, 357 boundary, 877 excluded, 261 rejected and 0 pending.
- Authorized zero automatic candidate inclusions into the frozen release.
- Completed surrogate-audit-v1: 80 article samples, 200 structure samples and 6,600 field/rule checks.
- Added public release manifest, CFF citation, CodeMeta, versioned export, SHA-256 archive, security hardening and explicit candidate/evidence boundaries.

### Post-publication QA and erratum — 2026-08-10

- A fresh full-stack QA identified and repaired a browser bootstrap API-contract failure that could cause the public site to report a data-loading error even while backend endpoints returned HTTP 200.
- Public site advanced through snapshots v43 and **v44**; same-origin data/agent/meta routing, proxy timeout/retry handling, candidate-screen rendering, browser startup contracts and Smart RAG runtime disclosure were hardened.
- `frontend-selftest-v43.0` passed **15/15** production checks, including inline-script compilation, DOM/bootstrap contracts, metadata routes, candidate isolation, Record 13, strict-polar, Evidence-D, unresolved-value and prompt-injection regressions. Site v44 retains the same executable frontend while adding the v9 runtime disclosure and health contract.
- A confirmed inherited Record 13 `Structural Dimensionality` positional-mapping error was disclosed for four structure rows:
  - `CUH-013-S01` / pip6Cu10I16: effective value **Unresolved**;
  - `CUH-013-S02` / pyr4Cu4Br8: **0D**;
  - `CUH-013-S03` / pyr4Cu4I8: **0D**;
  - `CUH-013-S04` / pyrCu2Br3: **0D**.
- The Record 13 erratum does not change release counts, space-group counts, verified/polar/strict-polar subsets or canonical denominators.
- The immutable `v3.0.1` archive and ZIP SHA-256 were intentionally not rewritten. Public website, Smart RAG and structure APIs disclose the erratum and expose `Structural Dimensionality (Effective)` alongside the archived field.
- Formal corrected scientific snapshots are reserved for hotfix **3.0.2**.
- See [`ERRATA.md`](ERRATA.md).

### Smart RAG v9 production upgrade — 2026-08-10

- Promoted the public Smart RAG runtime to **9.9.1** while leaving the frozen 3.0.1 scientific archive unchanged.
- Reworked mixed-intent routing so `find/list + explain/analyze` requests perform retrieval first and then bounded interpretation instead of being downgraded to a pure list.
- Retained deterministic scientific routes for exact counts, record properties, scope boundaries, false-premise correction, unresolved-value preservation, Record 13, Evidence D, polarity/ferroelectric boundaries and material-specific STE–Cu···Cu relation constraints.
- Added `@cf/baai/bge-reranker-base` after BGE-M3/FTS/pgvector retrieval.
- Replaced free-form LLM JSON with `@cf/qwen/qwen3-30b-a3b-fp8` traditional function calling through `submit_claims`.
- Added server-side claim taxonomy and validation: one source per claim, allowed claim types, verbatim same-source support fragments, number/concept verification, duplicate suppression and rejection of unsupported speculation, recommendations, universal causality and cross-paper mechanism stitching.
- Restricted Qwen input to a scientific-field whitelist. Previous title aliases, DOI title variants, title-adjudication data, search text and review/version metadata are excluded from the model context.
- Isolated Live Monitor candidate metadata from frozen scientific reasoning and removed the prior double-LLM research-mode path.
- Fixed retrieval expansions for dimethylamine/dimethylammonium, staircase-chain and water-triggered reversible phase-transformation queries.
- Smart RAG v9 deterministic exact/anchor regression passed **33/33**.
- Smart RAG v9 real BGE-M3 + BGE-reranker retrieval regression passed **25/25**.
- Initial public v9 production smoke passed **6/6**; post-circuit-patch smoke on 9.9.1 passed **3/3**.
- Controlled validation exhausted the free Workers AI daily allocation. Paid overage was **not enabled**. A circuit breaker now switches ordinary retrieval to deterministic `precision_search_v9` fallback while preserving exact scientific routes and public rate limits.
- Added automatic provider recovery probing after the cooldown window. Public health reports `FULL_AI`, `DEGRADED_SAFE_FALLBACK` or `PROBE_DUE_SAFE_FALLBACK` explicitly.
- A fresh full 70-case Qwen-enabled benchmark was not rerun after the final orchestration patch because the free provider allocation had been exhausted. The earlier 70/70 run is therefore documented only as a legacy scientific regression baseline, not as a final-v9 benchmark.

## 3.0.0 — 2026-08-08

- Established the frozen scientific corpus and evidence-first article/structure registers.
- Published canonical quantitative subsets, crystallographic confidence rules, field-evidence objects and the initial production RAG index.
