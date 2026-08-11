# CuHalide Atlas Smart RAG benchmark v1.4

Date: 2026-08-11  
Scientific release: **3.0.1**  
Evaluation version: **rag-benchmark-v1.4**  
Runtime code label: **smart-rag-v9.11.3-evidence-grain-v2**  
Completed run ID: `81eeab9f-3efb-4d19-bab0-7768acebfc4b`

> **Historical status.** This 70/70 run is the evidence-grain-safe **pre-physical-reindex** baseline. After all 878 structure RAG documents were physically rebuilt and re-embedded, the final current-runtime gate became [`rag-benchmark-v1.5`](RAG_BENCHMARK_V15_2026-08-11.md), run `cdfd61ae-b382-433c-b877-6465a93a93b9`, which passed 70/70. Historical v1.4 cases/results were not rewritten.

## Completed v1.4 result

| Suite | Passed | Failed | Mean latency (ms) |
|---|---:|---:|---:|
| Exact / deterministic | 25 / 25 | 0 | 2099.5 |
| Retrieval | 25 / 25 | 0 | 4830.5 |
| Reasoning / scientific boundaries | 20 / 20 | 0 | 3954.6 |
| **Total** | **70 / 70** | **0** | — |

The completed run used the free Workers AI allocation only; paid overage was not authorized.

## Runtime represented by the completed v1.4 run

- public site: **v47**;
- public data: **2.6.0**;
- public Smart RAG: **9.10.0**;
- public metadata/health: **47.6**;
- final orchestrator: **9.11.3**;
- exact/anchor service at completion: **10.2.1-exact-anchor-internal**;
- scientific release: **3.0.1**.

This run already enforced public evidence-grain guards: scientific properties and photophysics were grounded at article grain unless independently mapped, structure cards were limited to safe fields, explicit structure-ID questions preserved the article/structure boundary, and same-record coexistence was not treated as automatic same-phase causality.

## Deterministic fixes exercised by v1.4

The completed run closed two narrow protected-route issues:

1. Record 101 same-source STE–Cu···Cu relation: **2.574 Å** and **527 nm**, deterministic, source `A:101`.
2. Record 267 human scope adjudication: the record remains **Boundary** because it is a copper(I) hypophosphite rather than a canonical Cu(I) halide.

## Post-reindex diagnostic using unchanged v1.4 gold

After the physical structure-index rebuild, v1.4 was deliberately rerun **without changing its gold**. Diagnostic run ID:

`504d7921-20fd-46ff-b436-5223bb56903e`

Result: **66/70**.

This diagnostic was retained as a failed run because it revealed useful information:

- **RS02** exposed a genuine deterministic overmatch: a Record 95 single-record boundary intercepted a Records 95/135 comparison. This was fixed in exact/anchor service **10.2.2**.
- **EX16** and **EX18** used historical structure-halogen counts that inherited pre-clean semantics rather than the corrected structure-safe `halogen_effective` projection.
- **RT25** required structure sources even though the query explicitly asks to find the **article** containing the TMPA series; after physical evidence-grain cleanup, article `A:58` is the correct relevance grain.

These three benchmark expectations were **not edited in v1.4**. Instead, a new versioned v1.5 suite was created with case-level provenance for the three changes.

## Why v1.5 supersedes v1.4 for the current runtime claim

The physical structure-index rebuild changed the retrieval corpus itself: all 878 structure documents were rebuilt as identity/crystallography-only documents and re-embedded. A benchmark completed before that swap cannot be the final evidence for the post-swap runtime.

Therefore:

- v1.4 completed 70/70 remains a valid historical pre-reindex baseline;
- the post-reindex v1.4 diagnostic remains a transparent 66/70 diagnostic;
- **v1.5 70/70 is the final current-runtime validation**.

See [`RAG_BENCHMARK_V15_2026-08-11.md`](RAG_BENCHMARK_V15_2026-08-11.md) for the final post-reindex run, physical index integrity checks and versioned gold rationale.

## Interpretation boundary

Benchmark results establish conformance to their versioned test suites. They do not establish exhaustive literature coverage, general-purpose scientific reasoning accuracy, independent-human extraction accuracy, or correctness outside the frozen CuHalide Atlas scope.
