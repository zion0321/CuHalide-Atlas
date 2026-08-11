# Changelog

## 3.0.1 — 2026-08-10

Release 3.0.1 is a bibliographic-only patch over scientific parent 3.0.0. Frozen scientific denominators were preserved.

### Bibliographic patch

- Reviewed 217 DOI-linked titles.
- Applied 72 canonical display-title replacements.
- Retained 145 clean title variants.
- Reconstructed chemical notation in 12 complex titles.

### Record 13 post-publication erratum

Effective public dimensionality values:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The erratum changes no article/structure, crystallographic, verified, polar or strict-polar denominators. The immutable 3.0.1 archive is not silently rewritten; formal snapshot correction is reserved for 3.0.2.

### Public knowledge portal v45–v47

- Replaced bulk-download presentation with a query-and-view scientific portal.
- Retired public bulk `/api/export` with HTTP 410.
- Kept complete normalized tables, publisher abstracts, primary PDF/SI/CIF payloads, field-evidence excerpts/locators, QA/adjudication internals and candidate-screening internals private.
- Added release-specific, field-whitelisted server-side article/structure projections and paginated SQL query functions.
- Enabled RLS and denied direct `anon`/`authenticated` projection-table reads and projection-query RPC execution.
- Added projection checksum/ACL/semantic health contracts.
- Restored explicit literature cutoff **2026-06** and partial-year display `2026.06`.
- Article Explorer defaults to 332 Core-Verified records; Structure Register defaults to 816 Core-Included rows.
- Publication-growth display is explicitly limited to 2006–2026.06 while earlier indexed records remain searchable.
- Added stable SPA hash deep links, modal keyboard focus handling, reduced-motion support, table scroll focusability, pager navigation semantics and accessibility contrast fixes.
- Hardened CSP and metadata handling; `/sitemap.xml` now returns `application/xml; charset=utf-8`.
- Real Playwright/Chromium production QA passed across desktop, tablet and mobile and was merged into `main`.

### Structure-halogen and evidence-grain hardening

- Prevented `Cu(I)` oxidation-state notation from being parsed as iodide.
- Recognized compact `Cu2I4` and bridging `μ2-I` notation.
- Prevented ligand-bound halogens from redefining Cu–halide identity without Cu–halide evidence.
- Tokenized one-letter halogen and short scientific search terms.
- Article `I` containment returns 247 canonical articles; exact `Cl/Br/I` category returns 27.
- Structure search excludes article titles, article-grain photophysics and unmapped motif text.
- Public structure detail no longer assigns article-grain emission/motif values to a phase row without independent mapping.
- Smart RAG adds explicit structure-ID evidence boundaries, generic outer guards and an evidence-grain-safe retrieval core.
- Bounded claims use JWT-protected internal scientific context and a separate scientific-context health contract.

### Smart RAG current production family

- Public Smart RAG: **9.10.0**
- Internal quota/exact gateway: **9.9.6-public-internal**
- Final orchestrator: **9.11.3-final-internal**
- Evidence-grain-safe core: **9.11.0-safe-core-internal**
- Deterministic exact/anchor service: **10.2.2-exact-anchor-internal**
- Bounded claims: **qwen-claims-v9-1.3.0**

Protected exact counts, record fields, frozen scope decisions, polarity/ferroelectric boundaries and selected material-specific relations remain deterministic. Provider degradation enters SAFE_FALLBACK; paid Workers AI overage is not authorized.

### 2026-08-11 physical structure RAG rebuild

The remaining legacy structure-document contamination was removed from the underlying RAG corpus, not only hidden at the public-output layer.

- Rebuilt all **878** structure RAG documents from the release-specific structure-safe projection.
- Re-embedded all **878/878** with `@cf/baai/bge-m3` at 1024 dimensions.
- Final structure-index checks: 0 copied `Article:` fields, 0 copied `Structural motif:` fields, 0 copied `Emission:` / `Emission assignment` fields, 0 forbidden structure `llm_context` science keys and 0 content-SHA mismatches.
- Complete RAG index remains **1,224/1,224 embedded documents**: 346 article-grain documents + 878 structure identity/crystallography documents.
- Representative Record 13 structure documents preserve the effective erratum overlay without modifying the immutable release archive.

### Benchmark history and final gate

- Historical `rag-benchmark-v1.3`: **70/70 PASS** on an older runtime.
- Completed pre-physical-reindex `rag-benchmark-v1.4`, run `81eeab9f-3efb-4d19-bab0-7768acebfc4b`: **70/70 PASS**.
- First post-reindex diagnostic with unchanged v1.4 gold, run `504d7921-20fd-46ff-b436-5223bb56903e`: **66/70**. This run was retained as failed rather than overwritten.
- The diagnostic exposed one real deterministic overmatch and three stale benchmark expectations after evidence-grain correction.
- Exact service **10.2.2** fixed the Record 95 single-record rule so it no longer intercepts multi-record comparisons such as Records 95/135.
- Historical v1.4 gold was preserved. A versioned **rag-benchmark-v1.5** clone changed only EX16, EX18 and RT25, with case-level provenance.
- Final post-reindex v1.5 run `cdfd61ae-b382-433c-b877-6465a93a93b9`: **70/70 PASS** — exact 25/25, retrieval 25/25, reasoning/scientific-boundary 20/20.
- Final structure-grain exact semantics include 2025 + 0D + contains-I = **57 rows / 28 articles**, and contains-Br = **232 rows / 133 articles**.
- Record 101 same-source protected route remains **2.574 Å / 527 nm**, deterministic.
- Record 267 remains Boundary under frozen human scope adjudication.
- TMPA article-finding query is scored at article grain (`A:58`) rather than requiring structure documents.

See `docs/RAG_BENCHMARK_V15_2026-08-11.md`, historical `docs/RAG_BENCHMARK_V14_2026-08-11.md`, `docs/RAG_RUNTIME_V9.md` and `docs/PRODUCTION_HARDENING_V47_2026-08-10.md`.

### Final operational/security checks

At the final completion check:

- `/health.json`: **HTTP 200 / PASS**;
- public site/data/RAG/meta: **47 / 2.6.0 / 9.10.0 / 47.6**;
- Smart RAG mode: **FULL**;
- scientific-context contract: **PASS**;
- public sitemap MIME: **application/xml; charset=utf-8**;
- legacy bulk `/api/export`: **HTTP 410**;
- Supabase security advisor after final cleanup: **0 findings**;
- Vercel checked production 5xx window: no 5xx logs;
- temporary benchmark and structure-reembedding endpoints: retired and JWT-required;
- temporary structure-rebuild staging/rollback tables and staging/apply RPCs: removed.

### Frozen denominators retained

- article audit: 346;
- chemically included articles: 335;
- canonical verified articles: 332;
- structure/phase rows: 878;
- Core-Included structure rows: 816;
- resolved space-group rows: 650;
- verified one-to-one mappings: 625;
- verified polar rows: 87;
- strict-polar rows: 67;
- strict-polar articles: 42.

## 3.0.0 — 2026-08-08

- Established the frozen scientific corpus and evidence-first article/structure registers.
- Published canonical quantitative subsets, crystallographic confidence rules, field-evidence objects and the initial retrieval index.
