# CuHalide Atlas production repair — v46

Date: 2026-08-10  
Frozen scientific release: 3.0.1  
Scientific parent: 3.0.0  
Literature cutoff: 2026-06

This report documents runtime, public-interface and evidence-grain repairs. The immutable 3.0.1 scientific archive was not rewritten.

## Production matrix

| Component | Current production contract |
|---|---|
| Public site | v46 |
| Public data | 2.2.1 |
| Public metadata/health | 46.0 |
| Smart RAG public wrapper | 9.9.7 |
| Quota-aware internal gateway | 9.9.4-public-internal |
| Final internal orchestrator | 9.10.1-final-internal |
| Bounded claims | qwen-claims-v9-1.3.0 |
| RAG contract probe | rag-contract-health-v1.0.0 |
| Frozen RAG documents / embeddings | 1,224 / 1,224 |

## Frozen denominators

- Article audit records: 346
- Canonical verified articles: 332
- Structure/phase rows: 878
- Core-Included structure/phase rows: 816
- Resolved space-group rows: 650
- Verified one-to-one structure–space-group mappings: 625
- Strict-polar rows: 67
- Strict-polar articles: 42

The v46 interface exposes these denominators explicitly instead of presenting them as interchangeable corpus sizes.

## Repaired regressions

### 1. Bounded-claims context contract

Problem: the bounded-Qwen service had been reading the minimized public data compatibility route while expecting legacy field names. Retrieval could remain operational while the scientific context available to claim validation became effectively empty.

Repair:

- bounded claims now reads exact sources from the JWT-protected internal RAG document store;
- public-lite presentation and internal scientific context are decoupled;
- a JWT-protected contract-health probe checks representative article and structure scientific fields;
- the public health gate now fails if the scientific-context contract fails.

### 2. Structure halogen semantics

Problem: compact iodide formulas such as `Cu2I4` could fail token-based parsing and fall back to an article-level mixed-halogen label. Conversely, the roman numeral in `Cu(I)` could be confused with iodide.

Repair:

- `Cu(I)` / `copper(I)` oxidation-state notation is stripped before halogen parsing;
- compact formulas and bridging notation such as `μ2-I` are recognized;
- structure-level halogen is derived from the explicit formula when possible;
- public health includes parser regression checks.

Confirmed production example: `CUH-008-S01` is now exposed as iodide (`I`) rather than `Cl/Br/I`.

### 3. Structure-grain search contamination

Problem: structure search could match article-grain photophysics and article-title terms, making an article-level STE assignment appear to be a structure-level search hit.

Repair:

- structure search is restricted to structure identity/crystallographic fields and a conservative structure-grain motif view;
- article-level emission text and article-title photophysics are excluded;
- short scientific acronyms are token-aware rather than arbitrary substring matches.

Production regression: `q=STE` currently returns zero structure rows rather than hundreds of contaminated matches.

### 4. Structure-grain photophysics in RAG

Problem: some structure RAG documents inherited article-grain photophysical fields from multi-compound/multi-phase articles.

Repair boundary:

- ordinary public photophysics responses remove structure sources unless the query explicitly targets a structure or a protected specialized route applies;
- the lexical fallback preserves article-grain photophysics but suppresses unverified structure-grain photophysics;
- bounded-claims structure context excludes motif and photophysics unless independently mapped;
- public structure details explicitly state the photophysics evidence-grain boundary.

The frozen 3.0.1 RAG document archive is not silently rewritten; the runtime applies a safe evidence-grain policy around it.

### 5. Public RAG rate and payload hardening

- Vercel derives a one-way SHA-256 client fingerprint from client IP + user agent and forwards only the hash;
- the client token is propagated through the internal orchestration path to avoid one shared proxy rate bucket;
- raw client IPs are not forwarded into the RAG chain;
- POST body/message/history limits are enforced at Vercel and Supabase layers;
- the public interface remains read-only.

Residual infrastructure boundary: the low-level public Supabase Smart RAG wrapper is still directly reachable. It remains read-only, payload-limited and globally rate-limited. A future server-to-server secret can restrict it to the Vercel gateway if desired.

### 6. Public interface semantics and robustness

v46 changes include:

- Article Explorer defaults to canonical `Core - Verified` records (332) with explicit audit views;
- Structure Register defaults to `Core - Included` rows (816) with explicit All/Boundary/Pending/Excluded views;
- 2026 is labeled `2026.06` and the frozen literature cutoff is displayed;
- dashboard denominators are shown next to each visualization;
- article detail labels photophysics as article-grain;
- structure detail labels the photophysics evidence-grain boundary;
- hash deep links support `#article/<id>` and `#structure/<structure_id>`;
- modal dialog semantics, focus trapping, focus restoration, table captions and `aria-live` states were added;
- stale search responses are prevented with AbortController and sequence guards;
- bootstrap failure no longer destroys static Methods/Citation content;
- outgoing public record/candidate links are restricted to HTTPS.

## Known Record 13 erratum

Effective public values remain:

- `CUH-013-S01` → Unresolved
- `CUH-013-S02` → 0D
- `CUH-013-S03` → 0D
- `CUH-013-S04` → 0D

The immutable 3.0.1 archive remains unchanged. Formal scientific snapshot correction is reserved for 3.0.2.

## Validation status

Current production health requires all of the following to pass:

- site v46 marker and public portal contract;
- public-data 2.2.1 availability;
- public access minimization;
- structure halogen semantics;
- structure-search photophysics/title isolation;
- structure-grain motif/photophysics guard;
- bounded-claims internal scientific-context contract;
- known errata registry.

At the time of this repair, production `/health.json` returns **PASS** with all checks true.

Supabase security advisor returns **zero security findings**. Performance advisor reports only informational unused-index notices; indexes are intentionally retained pending actual query-plan/longitudinal usage evidence.

## RAG validation boundary

The frozen `rag-benchmark-v1.3` baseline passed 70/70 on release 3.0.1, but it predates final Smart RAG v9 orchestration and the current 9.9.7 repair. It must not be described as a fresh 9.9.7 benchmark.

Current external free Workers AI capacity is in SAFE_FALLBACK. Paid overage is not authorized. Deterministic/protected routes and evidence retrieval remain available, but a fresh full Qwen-enabled current-runtime benchmark must wait until free provider capacity recovers and must then be archived as a new versioned run.

## Remaining non-blocking maintenance

- run a fresh visual desktop/tablet/mobile + keyboard-only browser QA when a real browser automation environment is available;
- consider replacing inline CSS/JS with versioned static assets so the CSP can remove `unsafe-inline`;
- consolidate historical JWT-protected canary/evaluation/probe Edge Functions after a dependency map and archival decision;
- optionally provision a server-to-server secret so the low-level public Smart RAG wrapper can be restricted to the Vercel gateway;
- mint final creator/license/DOI metadata only after owner approval.
