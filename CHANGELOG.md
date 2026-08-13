# Changelog

## Current Curated rev.2 — 2026-08-13 (rolling state; not a formal Frozen Release)

Current Curated rev.2 is a primary-evidence-reviewed rolling layer over immutable Frozen Release 3.0.2. It is **not** a rewrite of the 3.0.2 frozen snapshot and is not a patch-level formal data-expansion release.

### Current Curated scientific state

- Curated through **2026-08-13**.
- Article audit / chemically included / canonical verified: **370 / 359 / 356**.
- Structure/phase / Core-Included: **935 / 873**.
- Resolved / verified one-to-one space-group rows: **705 / 680**.
- Verified polar / strict-polar rows: **97 / 77**, with **46** strict-polar articles.
- Unified Current RAG corpus: **1,305 / 1,305** documents/embeddings.
- Overlay relative to Frozen 3.0.2: **24 reviewed articles** and **57 reviewed structure/phase determinations**; **19** are frozen-cutoff coverage backfills and **5** are post-cutoff additions.
- Frozen 3.0.2 denominators remain **346 / 335 / 332 / 878 / 816 / 650 / 625 / 87 / 67 / 42**, with **1,224 / 1,224** Frozen RAG documents/embeddings.

### Motif Atlas 1.1

- Added server-rendered `/motifs` and structure-grain Motif Atlas data under Public Data **2.9.0**.
- Primary classes: **Coordination**, **Ionic / Hybrid Ionic**, and **All-in-One (AIO)**; unresolved legacy mappings are not forced into a primary class.
- Taxonomy coverage: **935** rows; **817** motif-resolved, **118** motif-unresolved, **895** primary-classified and **40** unresolved legacy-category rows.
- Crystallographic determinations by class: Coordination **346**, Ionic / Hybrid Ionic **447**, AIO **102**, unresolved legacy **40**.
- Article reports, crystallographic determinations and normalized reported identities remain distinct denominators.
- Primary-evidence curated organic components remain separated from legacy label-derived candidates.

### Smart RAG 9.14 and evidence boundaries

- Unified BGE-M3 + lexical/RRF retrieval now covers **1,305 / 1,305** Current documents/embeddings while retaining the validated Frozen 3.0.2 compatibility path.
- Added deterministic Current/Motif Atlas facts and structure-grain motif output only where an independent structure taxonomy mapping exists.
- Model output cannot override Frozen/Current denominators, human scope decisions, verified crystallography, Motif Atlas taxonomy or evidence-grain boundaries.
- Article-grain photophysics remains protected from silent reassignment to individual structure/phase records.

### Public/private and production governance closure

- Public access remains **query-and-view**; `/api/export` remains **HTTP 410**.
- Complete normalized tables/raw payloads, exact publisher abstracts, primary PDF/SI/CIF, raw taxonomy/component relations, field-evidence excerpts/locators and internal candidate/QA/adjudication artifacts remain private.
- `Protect main production` now actively enforces PR provenance, resolved review threads, strict `chromium-production`, `lighthouse-production`, `preview-chromium`, `preview-lighthouse`, trusted `Vercel`, no force-push/deletion and no bypass actor.
- Added repository-contract regression tests covering release/runtime metadata, export retirement, Record 13 errata state, governance and public-safe migration-history boundaries.
- Supabase production migration history remains protected: the public repository contains a sanitized public-safe subset, not a replayable clone of all **121** production migration entries.

### Vercel provenance, runtime and sitemap reliability

- Hardened the fail-closed Vercel production gate against GitHub post-merge eventual consistency using dual-source exact merged-PR provenance: commit association first, then recent closed `main` PR records requiring the same `merged_at`, `base.ref` and exact `merge_commit_sha` predicates.
- All four trusted GitHub Actions checks and the trusted successful Vercel candidate status remain mandatory after provenance resolution; API failures and exhausted provenance checks remain fail-closed.
- Declared the repository's JavaScript runtime as ESM via `"type": "module"`, eliminating Vercel's ESM-to-CommonJS build warning.
- Kept the Vercel project Node **24.x** runtime as production source of truth and aligned production-browser, production-Lighthouse and both protected-preview QA jobs to Node **24**.
- Reworked sitemap pagination from serial retrieval to page-1 denominator establishment plus bounded concurrent page fetching, preserving per-page retry/timeout and exact pagination consistency checks.
- Public sitemap invariant remains **1,231 URLs** = root + Motif Atlas + **356** Current canonical articles + **873** Current Core-Included structures.
- Final production merge **`b137ad7afcbe89fefecd642283a12ccbb03c975f`** passed the production provenance gate, deployed successfully and completed post-merge production Chromium and Lighthouse QA successfully.
- Final production runtime inspection found no error/fatal logs and no 5xx responses in the inspected post-deployment window; Supabase Current/Frozen/Projection/Halogen/RAG health contracts all remained true and Security Advisor remained at **0 findings**.

The Supabase GitHub App may still emit a non-required migration-history check because the public repository deliberately omits private production migration statements. This external integration signal must not be “fixed” by publishing private migrations or adding fake/no-op timestamps.

See `docs/CURRENT_CURATED_R2_2026-08-13.md`, `docs/PRODUCTION_STATUS_V48_CURRENT_R2_2026-08-13.md` and `docs/FINAL_CURRENT_R2_PRODUCTION_AUDIT_2026-08-13.md`.

## 3.0.2 — 2026-08-11

Release 3.0.2 is a scientific hotfix over 3.0.1. The historical 3.0.1 archive remains immutable. The hotfix adds no new literature and changes no frozen scientific denominator.

### Record 13 physical scientific correction

The four confirmed `Structural Dimensionality` corrections are now physically incorporated into the frozen 3.0.2 snapshot and release-specific RAG documents:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The four 3.0.1 errata are retained as historical audit metadata, marked superseded/resolved in 3.0.2, and no longer require a current-release display overlay.

### Production v48 and rolling curation

- Public site/data/Smart RAG/meta advanced to **48 / 2.7.0 / 9.12.0 / 48.0**.
- Publication-growth display uses **2006–2026**; the frozen literature cutoff remains independently reported as **2026-06**.
- Added explicit **Frozen Release → Current Curated → Literature Watch** separation.
- Added private Current Curated state, curation queue and change ledger with RLS/least-privilege controls.
- Current Curated starts from frozen base **3.0.2**, through **2026-08-11**, live revision **0**, status **ready**.
- Candidate discovery remains metadata-only. Promotion requires DOI deduplication, scope triage, primary article/SI/CIF evidence as appropriate, evidence extraction, structure-level mapping, QC, RAG update and production regression.
- The live root is served through the deterministic `api/site.js` release renderer, which compiles the version-controlled scientific-interface shell and computes CSP hashes from the final v48 HTML.

### Release-3.0.2 RAG index and validation

- 3.0.2 RAG index: **1,224/1,224** embeddings = 346 article-grain + 878 structure identity/crystallography documents.
- Article content-SHA mismatches versus 3.0.1: **0**.
- Unchanged structure content-SHA mismatches versus 3.0.1: **0**.
- Intentionally changed Record 13 structure RAG documents: **4**.
- Forbidden structure-context science keys: **0**.
- Copied article/motif/emission fields in structure documents: **0**.
- Fresh `rag-benchmark-v1.6`, run `04bd93ec-cc3a-424b-9d8d-a1b08cec58ff`: **70/70 PASS** — exact 25/25, retrieval 25/25, reasoning/scientific-boundary 20/20.
- Paid Workers AI overage was not authorized.
- v1.5 history was retained. v1.6 rebased release labels without changing frozen scientific fact/count targets; RS08 was intentionally made deterministic to strengthen the boundary between Literature Watch metadata and frozen scientific synthesis.

### Final v48 reproducibility and discovery hardening

- Synchronized canonical GitHub Supabase wrappers and release-specific v302 runtime sources with the deployed production contracts.
- Snapshotted required validated internal RAG dependencies and added an explicit production/retirement inventory.
- Added `package-lock.json`; production browser and Lighthouse CI use `npm ci`.
- Added scheduled mobile/desktop Lighthouse thresholds for performance, accessibility, best practices, SEO, LCP and CLS.
- Added stable server-rendered `/article/:id` and `/structure/:id` pages plus a dynamic canonical sitemap.
- Aligned JSON-LD/social metadata to 2026-08-11 and added a branded social preview asset.
- Clarified article halogen filter semantics: single-halogen values use containment, while mixed-halogen labels are exact categories.
- Kept `/api/export` at HTTP 410 while aligning its release identity to 3.0.2.
- Hardened daily metadata discovery with Supabase JWT verification plus a distinct private cron token; expanded the automated sweep to a 30-day rolling window and multiple Crossref/OpenAlex query families.
- Replaced obsolete debug/temp/ephemeral/bulk-export Edge Functions with JWT-required 410 retirement stubs.
- Relaxed only the Current Curated health invariant from revision=0 to revision>=0 so future reviewed additions cannot invalidate frozen 3.0.2 provenance.

### Production QA and security

- Live release-3.0.2/v48 Playwright/Chromium gate passed across the configured desktop/tablet/mobile projects.
- Gate covers public HTTP/scientific/privacy/security contracts, Current Curated UI, Record 13 physical corrections, exact denominators, halogen semantics, serious/critical accessibility findings, page/console errors, overflow, responsive navigation, modal keyboard behavior and deep links.
- `/health.json`: **PASS**.
- Supabase security advisor: **0 findings** after final schema hardening.
- Legacy public bulk `/api/export` remains **HTTP 410**.
- Temporary benchmark, re-embedding, debug and release-switch infrastructure was retired/removed after validation.

See `docs/RAG_BENCHMARK_V16_2026-08-11.md` and `docs/PRODUCTION_STATUS_V48_2026-08-11.md`.

## 3.0.1 — 2026-08-10

Release 3.0.1 is a bibliographic-only patch over scientific parent 3.0.0. Frozen scientific denominators were preserved.

### Bibliographic patch

- Reviewed 217 DOI-linked titles.
- Applied 72 canonical display-title replacements.
- Retained 145 clean title variants.
- Reconstructed chemical notation in 12 complex titles.

### Record 13 post-publication erratum

Effective public dimensionality values at the 3.0.1 stage were:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The erratum changed no article/structure, crystallographic, verified, polar or strict-polar denominator. The immutable 3.0.1 archive was not silently rewritten; the correction was later physically incorporated by release 3.0.2.

### Public knowledge portal v45–v47

- Replaced bulk-download presentation with a query-and-view scientific portal.
- Retired public bulk `/api/export` with HTTP 410.
- Kept complete normalized tables, publisher abstracts, primary PDF/SI/CIF payloads, field-evidence excerpts/locators, QA/adjudication internals and candidate-screening internals private.
- Added release-specific, field-whitelisted server-side article/structure projections and paginated SQL query functions.
- Enabled RLS and denied direct `anon`/`authenticated` projection-table reads and projection-query RPC execution.
- Added projection checksum/ACL/semantic health contracts.
- Restored explicit literature cutoff **2026-06** and the then-current partial-year display `2026.06`.
- Article Explorer defaults to 332 Core-Verified records; Structure Register defaults to 816 Core-Included rows.
- Added stable SPA hash deep links, modal keyboard focus handling, reduced-motion support, table scroll focusability, pager navigation semantics and accessibility contrast fixes.
- Hardened CSP and metadata handling; `/sitemap.xml` returns `application/xml; charset=utf-8`.
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

### 2026-08-11 physical structure RAG rebuild

The remaining legacy structure-document contamination was removed from the underlying RAG corpus, not only hidden at the public-output layer.

- Rebuilt all **878** structure RAG documents from the structure-safe projection.
- Re-embedded all **878/878** with `@cf/baai/bge-m3` at 1024 dimensions.
- Final structure-index checks: 0 copied `Article:` fields, 0 copied `Structural motif:` fields, 0 copied `Emission:` / `Emission assignment` fields, 0 forbidden structure `llm_context` science keys and 0 content-SHA mismatches.
- Complete RAG index remained **1,224/1,224 embedded documents**: 346 article-grain documents + 878 structure identity/crystallography documents.

### Benchmark history

- Historical `rag-benchmark-v1.3`: **70/70 PASS** on an older runtime.
- Completed pre-physical-reindex `rag-benchmark-v1.4`, run `81eeab9f-3efb-4d19-bab0-7768acebfc4b`: **70/70 PASS**.
- First post-reindex diagnostic with unchanged v1.4 gold, run `504d7921-20fd-46ff-b436-5223bb56903e`: **66/70** and retained as failed diagnostic evidence.
- The diagnostic exposed one real deterministic overmatch and three stale benchmark expectations after evidence-grain correction.
- Exact service **10.2.2** fixed the Record 95 single-record rule so it no longer intercepted multi-record comparisons such as Records 95/135.
- Historical v1.4 gold was preserved. Versioned **rag-benchmark-v1.5** changed only EX16, EX18 and RT25, with case-level provenance.
- Final post-reindex v1.5 run `cdfd61ae-b382-433c-b877-6465a93a93b9`: **70/70 PASS**.

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
