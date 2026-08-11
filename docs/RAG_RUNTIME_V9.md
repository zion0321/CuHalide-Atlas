# Smart RAG runtime — release 3.0.2

This document describes the current production Smart RAG serving CuHalide Atlas frozen scientific release **3.0.2**. Historical v9 components remain in the dependency chain, but the public release contract is now 9.12.0.

## Production matrix

- Public Smart RAG: **9.12.0**
- Public endpoint: `https://cuhalide-atlas-v3.vercel.app/api/agent`
- Release-3.0.2 internal gateway: **9.12.0-public-internal**
- Release-3.0.2 core adapter: **9.12.0-v302-core-adapter-internal**
- Scientific-context health: **rag-contract-health-v1.1.0**
- Internal quota/exact gateway: **9.9.6-public-internal**
- Deterministic exact/anchor service: **10.2.2-exact-anchor-internal**
- Final evidence-grain orchestrator: **9.11.3-final-internal**
- Evidence-grain-safe retrieval core: **9.11.0-safe-core-internal**
- Bounded claims: **qwen-claims-v9-1.3.3**
- Public data / site / meta: **2.7.0 / v48 / 48.0**
- Frozen release / cutoff: **3.0.2 / 2026-06**

## Architecture

The public request path is:

`browser → Vercel /api/agent → public Smart RAG 9.12.0 → release-3.0.2 internal gateway → deterministic protected path or evidence-grain-safe retrieval/reasoning path`

Release 3.0.2 is a narrow hotfix over 3.0.1. A release-compatibility contract verifies that all article RAG documents and all unchanged structure documents are content-hash equivalent to 3.0.1; only the four physically corrected Record 13 structure documents differ. The adapter therefore reuses validated internal retrieval/orchestration logic only where the indexed content contract proves equivalence, while v302 structure projections are authoritative for current structure identity.

## Deterministic scientific guards

Protected questions are resolved before bounded model interpretation when appropriate. These include exact denominators, direct record fields, unresolved values, frozen scope decisions, false-premise correction, symmetry/polarity/ferroelectric boundaries, Record 13 correction-state facts and selected same-source material relations.

Record 101 remains deterministic at Cu···Cu = **2.574 Å** and STE emission = **527 nm**. Exact/anchor service **10.2.2** prevents the Record 95 single-record boundary from intercepting multi-record comparisons such as Records 95/135.

## Physical RAG index and evidence grain

The 3.0.2 index contains **1,224/1,224 embedded documents**:

- 346 article-grain scientific documents;
- 878 structure identity/crystallography documents.

All structure documents are physically cleaned, not merely output-filtered. They exclude copied article-level motif and photophysical fields unless a future independently mapped structure-grain evidence object establishes such a relation.

Release-transition integrity checks:

- article content-SHA mismatches vs 3.0.1: **0**;
- unchanged structure content-SHA mismatches vs 3.0.1: **0**;
- intentionally changed Record 13 structure documents: **4**;
- Record 13 corrected dimensions in v302 RAG: **4/4**;
- current-release Record 13 erratum flags removed: **4/4**;
- forbidden structure `llm_context` science keys: **0**;
- explicit copied article/motif/emission fields in structure documents: **0**.

The four Record 13 structure documents were regenerated from the v302 projection and re-embedded with `@cf/baai/bge-m3` (1024 dimensions).

## Retrieval

When free Workers AI capacity is available, ordinary evidence retrieval combines:

1. precision/entity anchors and metadata filters;
2. lexical/full-text search;
3. BGE-M3 semantic embeddings;
4. reciprocal-rank fusion;
5. BGE reranking (`@cf/baai/bge-reranker-base`).

Soft scientific concepts such as photophysics, stability, transport and unmapped structural motifs are retrieved at **article grain** unless independently mapped at structure grain. Structure records emitted through the public path use the release-3.0.2 safe structure projection.

## Bounded model interpretation

The model is `@cf/qwen/qwen3-30b-a3b-fp8`. Model-generated scientific prose is not accepted as an unconstrained authority. The claims layer requires structured source-constrained claims and validates source identity, support fragments, numerical support, scientific concepts, claim type and prohibited wording.

Unsupported speculation, recommendations, universal causality and cross-paper mechanism stitching are rejected. Missing values remain unresolved. Polar/non-centrosymmetric evidence is not converted into a ferroelectric claim.

The claims service uses a preferred-language policy rather than rejecting otherwise valid science solely because the model produced an English claim for a Chinese question.

## Candidate isolation

Literature Watch / Live Monitor candidates are metadata-only discovery objects. They are not frozen evidence and are not allowed to become model-supported frozen scientific claims.

This boundary is explicitly represented in `rag-benchmark-v1.6`: case RS08 is intentionally deterministic when the task is to distinguish frozen evidence from candidate metadata. Candidate information can prompt primary-source review, but it cannot satisfy release-level scientific support requirements.

## Structure-grain defense in depth

1. Public structure search uses identity/crystallography fields only.
2. Public structure detail does not infer article-level motif/photophysics.
3. Bounded-claims structure context excludes unmapped science fields.
4. The physical structure RAG index is identity/crystallography-only.
5. Explicit structure-ID motif/photophysics questions separate the named structure from associated article-grain science.
6. Generic motif/photophysics responses pass through an outer structure-source guard.
7. Same-record coexistence is not treated as automatic same-phase causality.

## Structure-halogen semantics

Public data 2.7.0 and the structure index use `structure-halogen-v6` semantics:

- `Cu(I)` oxidation-state notation does not imply iodide;
- compact `Cu2I4` and bridging `μ2-I` are recognized;
- ligand-bound halogens do not by themselves redefine Cu–halide identity;
- variable-X/series records remain series-level rather than falsely phase-specific;
- short scientific tokens use token-aware search.

Current v302 classification counts are **803 structure-specific / 45 series-level / 30 unresolved / 4 source-conflict**.

## Provider circuit breaker

Paid Workers AI overage is not authorized. If free provider capacity is unavailable:

- deterministic exact/protected rules continue;
- deterministic lexical/precision retrieval remains available;
- bounded model synthesis is omitted rather than fabricated;
- the public service reports **SAFE_FALLBACK**;
- recovery is probed after cooldown.

The checked release-finalization state was **FULL**.

## Fresh release-3.0.2 benchmark

`rag-benchmark-v1.6`:

- Run ID: `04bd93ec-cc3a-424b-9d8d-a1b08cec58ff`
- Exact/deterministic: **25/25**
- Retrieval: **25/25**
- Reasoning/scientific-boundary: **20/20**
- Total: **70/70 PASS**
- Release gate: **PASS**
- Paid overage authorized: **false**

Historical v1.5 remains immutable. v1.6 rebases literal release identity to 3.0.2 without changing frozen scientific fact/count targets. The only benchmark-policy adjustment is the documented RS08 candidate-isolation strengthening described above.

See [`RAG_BENCHMARK_V16_2026-08-11.md`](RAG_BENCHMARK_V16_2026-08-11.md).

## Current production validation

At finalization:

- `/health.json`: **HTTP 200 / PASS**;
- public site / data / RAG / meta: **48 / 2.7.0 / 9.12.0 / 48.0**;
- Current Curated: **base 3.0.2 / revision 0 / ready**;
- live release-specific Chromium production gate: **PASS**;
- Supabase security advisor: **0 findings**;
- temporary benchmark, re-embedding and debug endpoints: retired or removed.

The benchmark demonstrates conformance to the registered release/runtime suite; it does not establish exhaustive literature completeness, independent-human extraction accuracy or general-purpose scientific reasoning accuracy.
