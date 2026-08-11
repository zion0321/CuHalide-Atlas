# CuHalide Atlas Smart RAG benchmark v1.6

Date: 2026-08-11  
Scientific release: **3.0.2**  
Frozen literature cutoff: **2026-06**  
Evaluation version: **rag-benchmark-v1.6**  
Public Smart RAG: **9.12.0**  
Internal release-3.0.2 gateway: **9.12.0-public-internal**  
Run ID: `04bd93ec-cc3a-424b-9d8d-a1b08cec58ff`

## Result

The fresh release-3.0.2 gate completed successfully with **70/70 PASS** and `release_gate=true`.

| Suite | Passed | Failed | Mean latency (ms) |
|---|---:|---:|---:|
| Exact / deterministic | 25 / 25 | 0 | 931.8 |
| Retrieval | 25 / 25 | 0 | 1389.4 |
| Reasoning / scientific boundaries | 20 / 20 | 0 | 3393.2 |
| **Total** | **70 / 70** | **0** | — |

Paid Workers AI overage was not authorized. The controlled run used available free provider capacity for cases that legitimately require model-backed bounded interpretation.

## Release transition represented by v1.6

Release 3.0.2 is a narrow scientific hotfix over 3.0.1. It physically corrects the four confirmed Record 13 `Structural Dimensionality` values and changes no corpus denominator, DOI identity, article inclusion, space-group assignment, verified/polar/strict-polar subset, or literature cutoff.

The release-3.0.2 RAG index contains **1,224/1,224 embedded documents**: 346 article-grain documents and 878 structure identity/crystallography documents. The four corrected Record 13 structure documents were regenerated from the 3.0.2 projection and re-embedded with BGE-M3; all other 3.0.2 article documents and unchanged structure documents are hash-equivalent to their 3.0.1 counterparts.

The release compatibility contract verified:

- article content-SHA mismatches vs 3.0.1: **0**;
- unchanged structure content-SHA mismatches vs 3.0.1: **0**;
- intentionally changed Record 13 structure documents: **4**;
- Record 13 corrected dimensions in the 3.0.2 index: **4/4**;
- Record 13 current-release erratum flags removed: **4/4**;
- forbidden structure-context science keys: **0**;
- explicit copied article/motif/emission fields in structure documents: **0**.

## Benchmark provenance

v1.6 is versioned separately from v1.5; the historical v1.5 cases and results were not mutated.

The v1.6 case set rebases literal release references from 3.0.1 to 3.0.2. Frozen scientific fact/count targets remain unchanged. One policy case, **RS08**, intentionally changes `llm_expected` from true to false: when a research-mode question is specifically about distinguishing frozen evidence from Live Monitor candidates, candidate metadata remains outside model-supported scientific synthesis. Deterministic separation of frozen evidence and candidate metadata is therefore the safer conformance target. This strengthens candidate isolation and does not change any frozen scientific fact.

## Interpretation boundary

A 70/70 result establishes conformance to this registered 70-case release/runtime test set. It does not establish exhaustive literature completeness, general-purpose scientific reasoning accuracy, or independent-human extraction accuracy. Candidate metadata is not scientific evidence for release inclusion, and model output cannot override frozen fields or deterministic scientific boundaries.
