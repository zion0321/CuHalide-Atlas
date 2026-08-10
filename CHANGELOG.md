# Changelog

## 3.0.1 — 2026-08-10

- Published a bibliographic-only patch over scientific release 3.0.0.
- Reviewed 217 DOI-linked titles.
- Applied 72 canonical display-title replacements.
- Retained 145 clean title variants and reconstructed chemical notation in 12 complex titles.
- The 3.0.1 patch itself changed zero scientific fields and preserved all frozen release counts.
- Regenerated affected RAG documents and completed 1,224/1,224 BGE-M3 embeddings.
- Passed `rag-benchmark-v1.3`: 70/70 cases.
- Passed `production-smoke-v3.0.0`: 17/17 public-interface checks.
- Completed coverage-v1: 210/210 pre-registered page-0 query cells.
- Completed candidate-screen-v4 for 1,788 DOI-unique candidates: 293 screened in scope, 357 boundary, 877 excluded, 261 rejected and 0 pending.
- Authorized zero automatic candidate inclusions into the frozen release.
- Completed surrogate-audit-v1: 80 article samples, 200 structure samples and 6,600 field/rule checks.
- Added public release manifest, CFF citation, CodeMeta, versioned export, SHA-256 archive, security hardening and explicit candidate/evidence boundaries.

### Post-publication QA and erratum — 2026-08-10

- A fresh full-stack QA identified and repaired a browser bootstrap API-contract failure that could cause the public site to report a data-loading error even while backend endpoints returned HTTP 200.
- Public site advanced to snapshot **v43**; same-origin data/agent/meta routing, proxy timeout/retry handling, candidate-screen rendering and browser startup contracts were hardened.
- `frontend-selftest-v43.0` passed **15/15** production checks, including inline-script compilation, DOM/bootstrap contracts, metadata routes, candidate isolation, Record 13, strict-polar, Evidence-D, unresolved-value and prompt-injection regressions.
- A confirmed inherited Record 13 `Structural Dimensionality` positional-mapping error was disclosed for four structure rows:
  - `CUH-013-S01` / pip6Cu10I16: effective value **Unresolved**;
  - `CUH-013-S02` / pyr4Cu4Br8: **0D**;
  - `CUH-013-S03` / pyr4Cu4I8: **0D**;
  - `CUH-013-S04` / pyrCu2Br3: **0D**.
- The Record 13 erratum does not change release counts, space-group counts, verified/polar/strict-polar subsets or canonical denominators.
- The immutable `v3.0.1` archive and ZIP SHA-256 were intentionally not rewritten. Public website, Smart RAG and structure APIs now disclose the erratum and expose `Structural Dimensionality (Effective)` alongside the archived field.
- Formal corrected scientific snapshots are reserved for hotfix **3.0.2**.
- See [`ERRATA.md`](ERRATA.md).

## 3.0.0 — 2026-08-08

- Established the frozen scientific corpus and evidence-first article/structure registers.
- Published canonical quantitative subsets, crystallographic confidence rules, field-evidence objects and the initial production RAG index.
