# Smart RAG v9 runtime

This document describes the production runtime serving CuHalide Atlas release **3.0.1**. Runtime/index hardening does not rewrite the immutable 3.0.1 scientific archive.

## Production matrix

- Public Smart RAG: **9.10.0**
- Public endpoint: `https://cuhalide-atlas-v3.vercel.app/api/agent`
- Internal quota/exact gateway: **9.9.6-public-internal**
- Deterministic exact/anchor service: **10.2.2-exact-anchor-internal**
- Final internal orchestrator: **9.11.3-final-internal**
- Evidence-grain-safe retrieval core: **9.11.0-safe-core-internal**
- Bounded claims: **qwen-claims-v9-1.3.0**
- Public data: **2.6.0**
- Public site: **v47**
- Public metadata/health: **47.6**
- Frozen release / cutoff: **3.0.1 / 2026-06**

## Architecture

`browser` → `Vercel /api/agent` → `public Smart RAG wrapper` → `JWT quota/exact gateway` → either `JWT deterministic exact/anchor service` or `JWT final orchestrator` → `JWT evidence-grain-safe retrieval core`

Separate JWT-protected services provide bounded claims, candidate metadata, lexical fallback and scientific-context health checks.

The public data path is independently minimized:

`browser` → `Vercel /api/public-data` → `public read-only Edge Function` → `service-role-only release projection/query functions`

## Deterministic scientific guards

Protected questions are resolved before bounded model interpretation. These include exact denominators, direct record fields, unresolved values, frozen scope decisions, false-premise correction, Record 13 effective dimensionality, Evidence-D exclusion, symmetry/polarity/ferroelectric boundaries and selected material-specific relation constraints.

The Record 101 same-source route remains deterministic and returns Cu···Cu = **2.574 Å** and STE emission = **527 nm** from `A:101`, with no embedding or LLM use.

Exact/anchor service **10.2.2** also prevents a single-record Record 95 boundary from intercepting multi-record comparison questions. Comparisons such as Records 95 and 135 now pass through to evidence-grounded retrieval/reasoning.

## Retrieval and physical evidence-grain separation

When free Workers AI capacity is available, retrieval combines:

1. precision/entity anchors and metadata filters;
2. full-text search;
3. BGE-M3 embeddings (`@cf/baai/bge-m3`, 1024 dimensions);
4. reciprocal-rank fusion;
5. BGE reranking (`@cf/baai/bge-reranker-base`).

Soft scientific concepts such as photophysics, stability, transport and unmapped structural motifs are retrieved at **article grain** unless an independent structure-grain mapping exists.

### Physical structure-index rebuild

The previous runtime already guarded public outputs, but legacy structure documents in the private RAG store still contained copied article-level titles/motif/photophysics. This residual contamination has now been removed physically.

All **878** structure RAG documents were rebuilt from `cuhalide_atlas_public_structures_v301` using identity/crystallography-only fields and then re-embedded with BGE-M3.

Final post-swap checks:

- structure RAG documents: **878**;
- valid 1024-dimensional BGE-M3 embeddings: **878/878**;
- copied `Article:` fields: **0**;
- copied `Structural motif:` fields: **0**;
- copied `Emission:` / `Emission assignment` fields: **0**;
- forbidden structure `llm_context` keys (`motif`, `emission_nm`, `emission_assignment`, `article_title`): **0**;
- content SHA mismatches: **0**.

The complete index remains **1,224/1,224 embedded documents**: 346 article-grain scientific documents and 878 structure identity/crystallography documents.

Structure documents may include identity, composition, phase, effective Cu–halide identity and evidence scope, dimensionality, symmetry, polarity classification, confidence, eligibility, determination method, CCDC/CIF identifier, unit-cell fields, erratum metadata and crystallographic evidence metadata. They do not carry copied article-level photophysics or unmapped motif assignments.

## Bounded Qwen interpretation

Model: `@cf/qwen/qwen3-30b-a3b-fp8`.

Model interpretation is accepted only through `submit_claims`. Each accepted claim must name exactly one source, use an allowed claim type and provide a same-source support fragment. The server validates source identity, support text, numbers, concepts, claim type, duplicate similarity and prohibited scientific wording. Unsupported speculation, recommendations, universal causality and cross-paper mechanism stitching are rejected.

## Scientific-context contract

Bounded claims do not depend on the minimized public `/api/data` schema. Internal scientific context is loaded from JWT-protected RAG documents, and a separate JWT-protected contract probe checks representative article photophysics and structure crystallography. Public `/health.json` fails if this context contract fails.

## Defense in depth at structure grain

1. Public structure search uses structure identity/crystallography fields only.
2. Public structure detail does not infer article-level motif/photophysics.
3. Bounded-claims structure context excludes unmapped science fields.
4. The physical structure RAG index is identity/crystallography-only.
5. Explicit structure-ID motif/photophysics questions separate the named structure from associated article-grain science.
6. Generic motif/photophysics responses pass through an outer structure-source guard.
7. Same-record coexistence is not treated as automatic same-phase causality.

These guards remain active independently of model-provider availability.

## Structure-halogen semantics

Public data 2.6.0 and the physical structure index use the same conservative structure-grain semantics:

- `Cu(I)` oxidation-state notation is excluded from iodide parsing;
- compact `Cu2I4` and bridging `μ2-I` notation are recognized;
- ligand-bound halogens do not by themselves redefine Cu–halide identity;
- series/variable-X records retain series-level identity rather than false one-phase assignment;
- one-letter halogen searches and short scientific tokens use token-aware matching.

Representative effective values include `CUH-008-S01 → I`, `CUH-162-S01 → Cl/Br/I`, and Record 13 effective dimensionality `CUH-013-S01 → Unresolved` with S02–S04 → 0D.

Two exact structure-grain statistics are now explicitly protected by the post-reindex benchmark:

- 2025 + 0D + effective halogen contains I → **57 rows / 28 articles**;
- effective halogen contains Br → **232 rows / 133 articles**.

These are structure-grain counts and should not be replaced by article-level halogen inheritance.

## Provider circuit breaker

Paid Workers AI overage is not authorized. If the free allocation is unavailable:

- deterministic exact/protected rules continue;
- ordinary retrieval uses deterministic lexical/precision fallback;
- bounded model interpretation is omitted;
- public status reports **SAFE_FALLBACK**;
- recovery is probed after cooldown.

At the final 11 August 2026 validation, the public endpoint reported **FULL** with bounded scientific interpretation available.

## Final benchmark: rag-benchmark-v1.5

Final post-reindex run:

- Evaluation: **rag-benchmark-v1.5**
- Run ID: `cdfd61ae-b382-433c-b877-6465a93a93b9`
- Code label: **smart-rag-v9.11.3-evidence-grain-v2-structure-reindex-v2+exact-10.2.2**
- Exact/deterministic: **25/25**
- Retrieval: **25/25**
- Reasoning/scientific-boundary: **20/20**
- Total: **70/70 PASS**
- Release gate: **PASS**
- Paid overage authorized: **false**

A first post-reindex diagnostic reused historical v1.4 gold and scored **66/70**. It was retained rather than overwritten. It exposed one genuine runtime overmatch (fixed in exact service 10.2.2) and three stale expectations tied to pre-clean structure semantics. Benchmark **v1.5** is a versioned clone of v1.4 that changes only EX16, EX18 and RT25, with case-level provenance. Historical v1.4 cases/results remain unchanged.

See [`RAG_BENCHMARK_V15_2026-08-11.md`](RAG_BENCHMARK_V15_2026-08-11.md) and historical [`RAG_BENCHMARK_V14_2026-08-11.md`](RAG_BENCHMARK_V14_2026-08-11.md).

## Production validation

Final checked production state:

- `/health.json`: **HTTP 200 / PASS**;
- public site/data/RAG/meta: **47 / 2.6.0 / 9.10.0 / 47.6**;
- Smart RAG mode: **FULL**;
- bounded scientific interpretation: available;
- scientific-context contract: **PASS**;
- `/sitemap.xml`: **application/xml; charset=utf-8**;
- live Chromium desktop/tablet/mobile production gate: **PASS**;
- Supabase security advisor after final cleanup: **0 findings**.

The temporary benchmark evaluator and structure-reembedding endpoint were retired and returned to `verify_jwt=true`. Their staging/rollback tables and staging/apply RPCs were removed after the final 70/70 gate.

## Reporting boundary

A manuscript describing the current runtime should report the deterministic routes, embedding/reranker models, bounded-claim schema, scientific-context contract, physical article/structure evidence-grain separation, server-side public projection architecture, candidate isolation, provider fallback, client-isolated rate path and benchmark version.

The current runtime may be reported as having passed **rag-benchmark-v1.5, 70/70**, with the run ID above and the explicit note that v1.5 is a versioned post-reindex revision of v1.4. This result establishes conformance to that 70-case suite; it does not establish exhaustive literature completeness or general-purpose scientific reasoning accuracy.
