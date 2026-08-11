# CuHalide Atlas Smart RAG benchmark v1.4

Date: 2026-08-11  
Scientific release: **3.0.1**  
Frozen literature cutoff: **2026-06**  
Evaluation version: **rag-benchmark-v1.4**  
Current-runtime code label: **smart-rag-v9.11.3-evidence-grain-v2**  
Run ID: `81eeab9f-3efb-4d19-bab0-7768acebfc4b`

## Result

The fresh current-runtime benchmark completed successfully with **70/70 PASS**.

| Suite | Passed | Failed | Mean latency (ms) |
|---|---:|---:|---:|
| Exact / deterministic | 25 / 25 | 0 | 2099.5 |
| Retrieval | 25 / 25 | 0 | 4830.5 |
| Reasoning / scientific boundaries | 20 / 20 | 0 | 3954.6 |
| **Total** | **70 / 70** | **0** | — |

The run is stored as `completed` with `release_gate=true`, `complete=true`, 70 result cases and an empty failure list.

## Runtime represented by this benchmark

The public production contract at validation time was:

- public site: **v47**;
- public data contract: **2.6.0**;
- public Smart RAG gateway: **9.10.0**;
- public metadata / health: **47.6**;
- final evidence-grain-safe orchestrator code label: **9.11.3**;
- deterministic exact/anchor service used by protected routes: **10.2.1-exact-anchor-internal**;
- scientific release: **3.0.1**.

The public health endpoint reported PASS and the public Smart RAG endpoint reported `operational_mode=FULL`, evidence-grounded retrieval available, deterministic protected boundaries available, bounded scientific interpretation available and the scientific-context contract passing.

## Evidence-grain policy represented by v1.4

Benchmark v1.4 evaluates the post-hardening evidence-grain contract rather than rewarding legacy structure-document leakage.

- Scientific properties, photophysics, stability, transport and structural-motif concepts are grounded at article grain unless an independent structure-grain mapping exists.
- Structure cards support identity and crystallography unless a separate mapped evidence object establishes a structure-level scientific property.
- Explicit structure-ID questions about motif or photophysics preserve the structure/article boundary instead of copying article-level values into a phase row.
- Same-record coexistence is not treated as automatic same-phase causality.
- Exact denominators, frozen scope adjudication, false-premise correction and selected material-specific relation constraints remain deterministic.

## Final deterministic fixes exercised by the gate

The fresh run identified and then closed two narrow deterministic contract mismatches before completion:

1. **Record 101 same-source STE–Cu···Cu relation.** The protected route now returns the material-specific same-source values directly: Cu···Cu = **2.574 Å** and STE emission = **527 nm**, with a deterministic relation trace and no embedding or LLM use.
2. **Record 267 human scope adjudication.** The deterministic Boundary response retains the hypophosphite scope reason while avoiding wording that could be misread by the evaluator as an affirmative canonical-reclassification recommendation.

Both cases passed after the deterministic exact/anchor service advanced to `10.2.1-exact-anchor-internal`.

## Provider and cost boundary

Free Workers AI capacity was verified as available before the completed run. **Paid overage was not authorized or used.** Provider availability is an operational dependency only; it cannot alter frozen database values, deterministic counts, scope adjudication or evidence-grain safety rules.

## Security cleanup

The temporary versioned evaluation endpoint used for the controlled run was retired immediately after validation and returned to JWT-required status. It is not a public production interface.

## Relation to earlier benchmark history

The earlier `rag-benchmark-v1.3` run also passed 70/70 on release 3.0.1, but it represents an older pre-final-v9 runtime. It remains a historical regression baseline. The current-runtime claim is supported specifically by the **v1.4** run documented here.

## Interpretation

A 70/70 benchmark result establishes conformance to this pre-registered 70-case scientific/runtime test set. It does **not** establish exhaustive literature coverage, general-purpose scientific reasoning accuracy, independent-human extraction accuracy, or correctness outside the frozen CuHalide Atlas scope.
