# Smart RAG v9 runtime

This document describes the **runtime** serving CuHalide Atlas release 3.0.1. Runtime hardening does not modify the immutable 3.0.1 scientific archive.

## Production version

- Public runtime: **9.9.7**
- Public endpoint: `https://cuhalide-atlas-v3.vercel.app/api/agent`
- Internal quota gateway: **9.9.4-public-internal**
- Final internal orchestrator: **9.10.1-final-internal**
- Bounded-claims service: **qwen-claims-v9-1.3.0**
- Public data contract: **2.2.1**
- Frozen scientific release: **3.0.1**
- Scientific parent: **3.0.0**
- Frozen literature cutoff: **2026-06**
- Explicit rollback target: **8.3.0**

## Architecture

The public browser path is:

`browser` → `Vercel /api/agent` → `public Smart RAG wrapper` → `JWT quota gateway` → `JWT final orchestrator` → `JWT retrieval core`

Separate JWT-protected services provide bounded claims, candidate metadata, lexical fallback and a scientific-context contract probe.

### 1. Deterministic scientific guards

Protected questions are resolved before bounded model interpretation. These include exact denominators, direct record properties, unresolved values, scope states, false-premise correction, Record 13 effective dimensionality, Evidence-D canonical exclusion, polarity/ferroelectric boundaries, Live Monitor release isolation and material-specific STE–Cu···Cu relation constraints.

### 2. Retrieval

When external Workers AI capacity is available, retrieval combines:

1. precision/entity anchors and metadata filters;
2. full-text search;
3. BGE-M3 embeddings (`@cf/baai/bge-m3`, 1024 dimensions);
4. reciprocal-rank fusion over structured/lexical/semantic candidates;
5. BGE reranking (`@cf/baai/bge-reranker-base`).

The internal retrieval core contains no free-form LLM reasoning. Record 13 effective-dimensionality corrections are applied in the query/presentation layer without rewriting the frozen archive.

### 3. Bounded Qwen interpretation

Model: `@cf/qwen/qwen3-30b-a3b-fp8`.

The model cannot return unconstrained scientific prose as authoritative output. It must call `submit_claims`. Each accepted claim has:

- exactly one source ID;
- one allowed claim type: `direct_observation`, `explicit_assignment`, `explicit_relation` or `not_established`;
- a short support fragment from the same source.

The server validates source identity, support-fragment presence, numbers, concepts, language, claim type, duplicate similarity and scientific wording. Unsupported speculation, recommendations, universal causality and cross-paper mechanism stitching are rejected.

### 4. Internal scientific-context contract

A production regression identified that an earlier bounded-claims implementation was reading the minimized public `/api/data` contract while still expecting legacy field names. Retrieval remained available, but the claims context could become effectively empty without a hard failure.

This has been repaired:

- the bounded-claims service now loads exact article/structure sources directly from the JWT-protected `cuhalide_atlas_rag_documents` store;
- article scientific context and public-lite presentation are decoupled;
- structure context is restricted to safe identity/crystallographic fields unless an independent structure-grain mapping exists;
- a JWT-protected `cuhalide-atlas-rag-contract-health-internal` probe checks that representative article photophysics and structure crystallography remain populated;
- public `/health.json` fails if that scientific-context contract fails.

This prevents a future public-API minimization change from silently emptying the bounded-claims context.

### 5. Evidence-grain safety

Article- and structure-grain evidence are not interchangeable.

- Article-level photophysics remains available at article grain.
- Structure-level public search does not use article-level emission text or article-title photophysics as structure evidence.
- Structure-level bounded-claims context excludes motif and photophysics unless independently mapped.
- Ordinary public photophysics responses suppress structure sources unless the query explicitly targets a structure ID or a protected same-record/specialized route establishes the intended boundary.
- Same-record coexistence is not treated as automatic same-phase causality.

### 6. Client-isolated public rate path

The Vercel proxy derives a one-way SHA-256 fingerprint from the incoming client IP and user agent and forwards only the hash as `x-cuhalide-client`; raw IPs are not forwarded into the RAG chain.

The token is propagated through the public wrapper and internal orchestration path so site users no longer share a single fixed proxy-user-agent rate bucket. Public request bodies and chat histories are bounded at both Vercel and Supabase layers.

The low-level public Supabase wrapper remains read-only and directly reachable; global/day rate limits and payload limits remain safety backstops. A future infrastructure pass may further restrict this endpoint to the Vercel gateway if a dedicated server-to-server secret is provisioned.

### 7. Literature Watch isolation

Research mode retrieves frozen release evidence and candidate metadata through separate paths. Candidate metadata does not support frozen scientific claims and never receives automatic release inclusion.

## Free-provider circuit breaker

Paid Workers AI overage is not authorized. If the free daily allocation is unavailable:

- exact/protected scientific rules continue deterministically;
- ordinary retrieval uses deterministic lexical/precision fallback;
- bounded Qwen interpretation is omitted rather than fabricated;
- the public status reports **SAFE_FALLBACK**;
- after cooldown, the provider is probed for recovery.

The current public health contract intentionally distinguishes provider degradation from database/retrieval failure.

## Validation

### Current production contract checks

The current public health gate verifies:

- site v46 production marker;
- public-data 2.2.1 availability and minimized access policy;
- compact iodide parsing and Cu(I)-oxidation-state separation;
- structure-search photophysics/title isolation;
- structure-grain motif/photophysics guards;
- bounded-claims scientific-context contract;
- known Record 13 errata registry.

### Prior v9 regression suites

- Deterministic exact/anchor regression: **33/33 PASS**.
- Real BGE-M3 + BGE-reranker retrieval regression: **25/25 PASS**.
- Public/internal-chain smoke tests passed during the v9 deployment sequence.
- Supabase security advisor: **0 security findings** after the current repair.

### Legacy scientific baseline

`rag-benchmark-v1.3` passed **70/70** on release 3.0.1, but it predates the final v9 orchestration and the current 9.9.7 repair. It remains a frozen scientific regression baseline, **not** a fresh 9.9.7 benchmark.

A new full Qwen-enabled benchmark must not be claimed until it is actually rerun and archived after external free-provider capacity is available. Paid overage is intentionally not enabled for this purpose.

## Methodological reporting boundary

A manuscript describing the current runtime should report the exact runtime version, deterministic routes, embedding/reranker models, bounded-claim schema, internal scientific-context contract, structure/article evidence-grain separation, candidate isolation, provider fallback, client-isolated rate path and the distinction between current runtime checks and the legacy 70/70 scientific baseline.

Do not state that Smart RAG 9.9.7 itself passed the legacy 70-case suite unless a fresh frozen run is executed and archived.
