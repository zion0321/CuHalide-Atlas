# CuHalide Atlas Smart RAG benchmark v1.5

Date: 2026-08-11  
Scientific release: **3.0.1**  
Frozen literature cutoff: **2026-06**  
Evaluation version: **rag-benchmark-v1.5**  
Runtime code label: **smart-rag-v9.11.3-evidence-grain-v2-structure-reindex-v2+exact-10.2.2**  
Run ID: `cdfd61ae-b382-433c-b877-6465a93a93b9`

## Result

The final post-reindex benchmark completed with **70/70 PASS** and `release_gate=true`.

| Suite | Passed | Failed | Mean latency (ms) |
|---|---:|---:|---:|
| Exact / deterministic | 25 / 25 | 0 | 818.2 |
| Retrieval | 25 / 25 | 0 | 1206.5 |
| Reasoning / scientific boundaries | 20 / 20 | 0 | 2516.1 |
| **Total** | **70 / 70** | **0** | — |

The run contains 70 result rows, zero failures and an empty failure list. Free Workers AI capacity was available during the run. **Paid overage was not authorized or used.**

## Physical structure-index rebuild represented by this run

Immediately before this benchmark, all **878** release-3.0.1 structure RAG documents were physically rebuilt from the release-specific structure-safe projection and re-embedded with `@cf/baai/bge-m3` (1024 dimensions).

The rebuilt structure documents contain identity and crystallography only, including where available:

- structure ID, label, formula and phase/temperature;
- evidence-aware Cu–halide identity and its basis/scope/confidence;
- dimensionality and category;
- space group, source form, IT number, point group and crystal system;
- polarity classification and basis;
- mapping/space-group confidence and eligibility;
- determination method, CCDC/CIF identifier and unit-cell fields;
- Record 13 effective erratum overlay metadata;
- evidence level, crystallographic evidence type and verification date.

Post-swap integrity checks confirmed:

- structure documents: **878**;
- valid 1024-dimensional BGE-M3 embeddings: **878/878**;
- explicit copied `Article:` fields: **0**;
- explicit copied `Structural motif:` fields: **0**;
- explicit copied `Emission:` / `Emission assignment` fields: **0**;
- forbidden `llm_context` keys (`motif`, `emission_nm`, `emission_assignment`, `article_title`): **0**;
- content SHA mismatches: **0**.

The complete release index remains **1,224/1,224 embedded documents**: 346 article-grain documents plus 878 structure identity/crystallography documents.

## Why benchmark v1.5 exists

The first post-reindex diagnostic reused the historical **v1.4** gold unchanged. That diagnostic run (`504d7921-20fd-46ff-b436-5223bb56903e`) produced **66/70** and was intentionally retained as a failed diagnostic rather than overwritten.

It exposed two different classes of issue:

1. **One genuine runtime bug.** A Record 95 single-record deterministic boundary overmatched a multi-record comparison query involving Records 95 and 135. The exact/anchor service was corrected to let multi-record comparisons reach the evidence-grounded reasoning path, advancing to `10.2.2-exact-anchor-internal`.
2. **Three stale benchmark expectations after evidence-grain correction.** The historical v1.4 gold still rewarded semantics inherited from the pre-clean structure index. Those expectations were versioned rather than silently edited.

Accordingly, v1.5 was cloned from v1.4 and changes only three gold definitions, each with case-level provenance.

### EX16 — 2025 0D iodide structures

Historical v1.4 expected 72 rows / 30 articles. Under the release-3.0.1 structure-safe projection, the exact structure-grain query `year=2025`, `dimension_class=0D`, `halogen_effective contains I` yields:

- **57 structure/phase rows**;
- **28 articles**.

The v1.5 gold uses 57 / 28 because the query explicitly asks for structure/phase rows and therefore must use structure-grain halogen identity rather than article-level halogen inheritance.

### EX18 — structure/phase rows containing bromide

Historical v1.4 expected 365 rows / 134 articles. Under the same structure-safe projection, `halogen_effective contains Br` yields:

- **232 structure/phase rows**;
- **133 articles**.

The v1.5 gold uses 232 / 133 for the same evidence-grain reason.

### RT25 — TMPA article-finding query

The query asks to **find the article** containing the TMPA copper(I) bromide series. Historical v1.4 relevance gold required the article plus three structure documents. After physical structure-index cleanup, the article is the correct relevance grain. v1.5 therefore scores `A:58` as the relevant source for this article-finding query.

No historical v1.4 case or result was rewritten.

## Key regression cases in the final run

### Multi-record comparison

The Records 95/135 comparison now reaches the bounded evidence-grounded path and returns both article sources (`A:95`, `A:135`). It preserves the distinction between Record 95 cluster-centered assignment and Record 135 STE assignment without cross-paper mechanism stitching.

### Record 101 same-source relation

The protected route remains deterministic:

- Cu···Cu = **2.574 Å**;
- STE emission = **527 nm**;
- source = `A:101`;
- no LLM or embedding.

### Record 267 scope adjudication

Record 267 remains **Boundary** because it is a copper(I) hypophosphite rather than a canonical Cu(I) halide. High photoluminescence does not override frozen human scope adjudication.

### Structure-safe exact semantics

The final run passes the revised structure-grain exact cases:

- 2025 + 0D + contains-I: **57 rows / 28 articles**;
- contains-Br: **232 rows / 133 articles**.

### Article-grain TMPA retrieval

The final run returns `A:58` for the article-finding query and passes the article-grain relevance definition.

## Production state at validation

At the final validation window:

- public site: **v47**;
- public data: **2.6.0**;
- public Smart RAG: **9.10.0**;
- public metadata/health: **47.6**;
- final orchestrator: **9.11.3-final-internal**;
- evidence-grain-safe core: **9.11.0-safe-core-internal**;
- deterministic exact/anchor service: **10.2.2-exact-anchor-internal**;
- `/health.json`: **HTTP 200 / PASS**;
- public Smart RAG mode: **FULL**;
- scientific-context contract: **PASS**.

## Temporary infrastructure cleanup

After the completed v1.5 run:

- the temporary evaluation endpoint was restored to `verify_jwt=true` and returns a retired response;
- the temporary structure re-embedding endpoint was restored to `verify_jwt=true` and returns a retired response;
- the structure-rebuild staging table was dropped;
- the pre-swap rollback table was dropped after the successful final gate;
- the staging/apply RPCs were dropped;
- Supabase security advisor returned **0 findings**.

## Relation to earlier benchmark history

- `rag-benchmark-v1.3`: historical older-runtime 70/70 baseline.
- `rag-benchmark-v1.4`, run `81eeab9f-3efb-4d19-bab0-7768acebfc4b`: 70/70 before the physical structure-index rebuild; historical evidence-grain-safe runtime baseline.
- post-reindex v1.4 diagnostic, run `504d7921-20fd-46ff-b436-5223bb56903e`: 66/70, retained to document stale-gold detection and one real deterministic overmatch.
- **`rag-benchmark-v1.5`, run `cdfd61ae-b382-433c-b877-6465a93a93b9`: 70/70 PASS after physical structure-index rebuild.**

## Interpretation boundary

A 70/70 result establishes conformance to the versioned v1.5 70-case runtime suite. It does **not** establish exhaustive literature coverage, general-purpose scientific reasoning accuracy, independent-human extraction accuracy, or correctness outside the frozen CuHalide Atlas scope.
