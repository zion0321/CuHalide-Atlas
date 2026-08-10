# Smart RAG v9 runtime

This document describes the **runtime** serving CuHalide Atlas release 3.0.1. It does not modify the immutable 3.0.1 scientific archive.

## Production version

- Public runtime: **9.9.2**
- Public endpoint: `https://cuhalide-atlas-v3.vercel.app/api/agent`
- Frozen scientific release: **3.0.1**
- Explicit rollback target: **8.3.0**
- Anonymous RAG entrypoints: **exactly one** (`/api/agent`)

## Architecture

### 1. Deterministic scientific guards

The server resolves protected scientific questions before any LLM interpretation. These include exact denominators, record properties, unresolved values, scope states, false-premise correction, Record 13 effective dimensionality, Evidence-D canonical exclusion, polarity/ferroelectric boundaries, Live Monitor release isolation and material-specific STE–Cu···Cu relation constraints.

### 2. Retrieval

When the free Workers AI provider is available, retrieval uses:

1. precision/entity anchors and metadata filters;
2. full-text search;
3. BGE-M3 embeddings (`@cf/baai/bge-m3`, 1024 dimensions);
4. reciprocal-rank fusion over structured/lexical/semantic candidates;
5. BGE reranking (`@cf/baai/bge-reranker-base`).

The release-3.0.1 effective query layer applies the public Record 13 erratum overlay before dimensionality filters are interpreted.

The internal retrieval core contains **no free-form LLM reasoning**. It performs deterministic science rules and retrieval only.

### 3. Bounded Qwen interpretation

Model: `@cf/qwen/qwen3-30b-a3b-fp8`.

The model is not allowed to return unconstrained scientific prose as the authoritative result. It must call `submit_claims`. Each submitted claim has:

- exactly one source ID;
- one claim type: `direct_observation`, `explicit_assignment`, `explicit_relation` or `not_established`;
- a short verbatim support fragment from the same source.

The server then validates source identity, support-fragment presence, numbers, concepts, language, claim type, duplicate similarity and scientific wording. Unsupported speculation, recommendations, universal causality, cross-paper mechanism stitching and unsupported strong structural roles are rejected.

Qwen exists only in the JWT-protected internal `submit_claims` service. The retrieval core cannot independently invoke a second, less-constrained reasoning path.

### 4. Scientific-field context whitelist

Only selected scientific fields can enter the Qwen context. The following classes are excluded:

- previous article-title aliases;
- DOI title variants;
- title-adjudication metadata;
- search text;
- review metadata;
- version metadata.

This prevents bibliographic provenance fields from being misinterpreted as scientific evidence.

### 5. Live Monitor isolation

Research mode retrieves frozen release evidence and candidate metadata through separate paths. `candidate-screen-v4` records are explicitly marked as unreviewed metadata with incomplete primary-evidence review. They do not support frozen release claims and do not receive automatic release inclusion.

### 6. Internal-chain isolation

The production chain is:

`public /api/agent` → `JWT quota gateway` → `JWT final orchestrator` → `JWT deterministic/retrieval core`

with separate JWT-protected Qwen-claim, candidate-search and lexical-fallback services.

The old public v9 core has been retired. Anonymous requests to the internal core, final orchestrator, quota gateway and retired legacy core were tested and all returned **HTTP 401**. The production wrapper uses the server-side Supabase service role to invoke these internal stages; credentials are never returned to the browser.

## Free-provider circuit breaker

Paid Workers AI overage is not authorized. If the free daily allocation is unavailable:

- exact/protected scientific rules continue deterministically;
- ordinary retrieval uses `precision_search_v9` lexical/metadata fallback;
- Qwen interpretation is omitted rather than fabricated;
- the normal public rate limit remains active;
- the response states that the LLM path is unavailable;
- after cooldown, the first ordinary scientific request automatically probes provider recovery;
- a successful probe marks the provider `available` and restores full-AI mode.

Health reports one of:

- `FULL_AI`;
- `DEGRADED_SAFE_FALLBACK`;
- `PROBE_DUE_SAFE_FALLBACK`.

Provider degradation is therefore observable and is not silently masked.

## Validation

### Completed v9 checks

- Deterministic exact/anchor regression: **33/33 PASS**.
- Real BGE-M3 + BGE-reranker retrieval regression: **25/25 PASS**.
- Initial public Vercel v9 production smoke: **6/6 PASS**.
- Post-circuit-patch production smoke: **3/3 PASS**.
- Internal-chain hardening smoke: **7/7 PASS** — four internal anonymous requests returned 401 while production health, exact statistics and fallback remained available.
- Public meta health on production 9.9.2: **PASS**, including `internal_rag_chain_security=true`.
- Supabase security advisor after hardening: **0 findings**.

### Legacy scientific baseline

`rag-benchmark-v1.3` previously passed **70/70** on release 3.0.1. That benchmark predates the final v9 orchestration layer. It remains a useful frozen scientific regression baseline, but it is not represented as a fresh final-v9 benchmark.

A new full 70-case Qwen-enabled run was not executed after the final orchestration patch because controlled validation exhausted the free Workers AI daily allocation and paid overage was intentionally not enabled.

## Methodological reporting boundary

A manuscript describing the current runtime should report the exact runtime version, deterministic routes, embedding/reranker models, claim-function schema, scientific-field context whitelist, support-fragment validation, candidate isolation, JWT-isolated internal chain, provider fallback and the distinction between the v9-specific regressions and the legacy 70/70 scientific baseline.

Do not state that the final v9.9.2 orchestration itself passed the legacy 70-case suite unless a fresh frozen run is actually executed and archived.
