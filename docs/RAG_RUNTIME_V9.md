# Smart RAG v9 runtime

This document describes the **runtime** serving CuHalide Atlas release 3.0.1. Runtime hardening does not modify the immutable 3.0.1 scientific archive.

## Production version

- Public runtime: **9.9.9**
- Public endpoint: `https://cuhalide-atlas-v3.vercel.app/api/agent`
- Internal quota gateway: **9.9.4-public-internal**
- Final internal orchestrator: **9.10.1-final-internal**
- Bounded-claims service: **qwen-claims-v9-1.3.0**
- Public data contract: **2.4.1**
- Public site: **v47**
- Public metadata/health contract: **47.1**
- Frozen scientific release: **3.0.1**
- Scientific parent: **3.0.0**
- Frozen literature cutoff: **2026-06**
- Explicit rollback target: **8.3.0**

## Architecture

The public browser path is:

`browser` → `Vercel /api/agent` → `public Smart RAG wrapper` → `JWT quota gateway` → `JWT final orchestrator` → `JWT retrieval core`

Separate JWT-protected services provide bounded claims, candidate metadata, lexical fallback and a scientific-context contract probe.

The public data path is separately minimized:

`browser` → `Vercel /api/public-data` → `public read-only Edge Function` → `service-role-only release projection/query functions`

The public data path does not expose the private release projection tables or their query RPCs directly to anonymous/authenticated Supabase roles.

### 1. Deterministic scientific guards

Protected questions are resolved before bounded model interpretation. These include exact denominators, direct record properties, unresolved values, scope states, false-premise correction, Record 13 effective dimensionality, Evidence-D canonical exclusion, polarity/ferroelectric boundaries, Live Monitor release isolation and material-specific STE–Cu···Cu relation constraints.

### 2. Retrieval

When external Workers AI capacity is available, retrieval combines:

1. precision/entity anchors and metadata filters;
2. full-text search;
3. BGE-M3 embeddings (`@cf/baai/bge-m3`, 1024 dimensions);
4. reciprocal-rank fusion over structured/lexical/semantic candidates;
5. BGE reranking (`@cf/baai/bge-reranker-base`).

The internal retrieval core contains no free-form LLM reasoning. Record 13 effective-dimensionality corrections are applied in the effective query/presentation layer without rewriting the frozen archive.

### 3. Bounded Qwen interpretation

Model: `@cf/qwen/qwen3-30b-a3b-fp8`.

The model cannot return unconstrained scientific prose as authoritative output. It must call `submit_claims`. Each accepted claim has:

- exactly one source ID;
- one allowed claim type: `direct_observation`, `explicit_assignment`, `explicit_relation` or `not_established`;
- a short support fragment from the same source.

The server validates source identity, support-fragment presence, numbers, concepts, language, claim type, duplicate similarity and scientific wording. Unsupported speculation, recommendations, universal causality and cross-paper mechanism stitching are rejected.

### 4. Internal scientific-context contract

A production regression identified that an earlier bounded-claims implementation was reading the minimized public `/api/data` contract while still expecting legacy field names. Retrieval remained available, but the claims context could become effectively empty without a hard failure.

This was repaired by decoupling model context from public presentation:

- bounded claims load exact article/structure sources from the JWT-protected `cuhalide_atlas_rag_documents` store;
- article scientific context and public-lite presentation are independent contracts;
- structure context is restricted to safe identity/crystallographic fields unless an independent structure-grain mapping exists;
- JWT-protected `cuhalide-atlas-rag-contract-health-internal` checks representative article photophysics and structure crystallography;
- public `/health.json` fails if this scientific-context contract fails.

### 5. Evidence-grain safety

Article- and structure-grain evidence are not interchangeable.

The current public runtime applies multiple independent layers:

1. **Public data search isolation.** Structure search uses structure identity/crystallography fields only. Article title, article-level photophysics and unmapped motif text are excluded.
2. **Structure detail boundary.** Public structure details do not infer motif text from article-level series descriptions and do not assign article-grain emission values to the structure row.
3. **Bounded-claims whitelist.** Structure Qwen context excludes motif/photophysics unless independently mapped.
4. **Explicit-ID deterministic boundary.** If a query names `CUH-xxx-Sxx` and asks about motif/photophysics, public runtime separates structure identity/crystallography from the article-grain evidence of the associated record and states that the latter is not independently mapped to the named phase.
5. **Generic outer guard.** Generic motif/photophysics responses remove unmapped structure sources and structure-labelled answer lines before returning to the browser.
6. **Causality boundary.** Same-record coexistence is not treated as automatic same-phase causality.

The explicit and generic public guards remain active independently of model-provider availability.

### 6. Public structure and query semantics

Public data 2.4.1 uses release-specific server-side projections and semantic normalization functions.

- `Cu(I)` oxidation-state notation is excluded from iodide parsing.
- Compact Cu–halide notation such as `Cu2I4` and bridging `μ2-I` is recognized.
- Ligand-bound halogens do not by themselves redefine Cu–halide identity.
- Single-letter halogen searches are tokenized instead of substring matched.
- Short scientific tokens such as `STE` are tokenized, preventing false matches inside unrelated words such as `system`.
- Record 13 effective dimensionality is materialized only in the release-specific public projection; the immutable 3.0.1 source snapshot is preserved.
- Article single-halogen filters are containment filters across mixed labels: canonical `I` returns **247** records.
- Explicit mixed article labels remain exact categories: canonical `Cl/Br/I` returns **27** records.

A service-role-only projection-health function continuously verifies release-specific row counts, strict-polar/erratum counts, deterministic projection checksums, RLS/ACL invariants and these selected query semantics. The public health API exposes only pass/fail contract booleans, not internal projection rows or service credentials.

### 7. Client-isolated public rate path

The Vercel proxy derives a one-way SHA-256 fingerprint from incoming client identity signals and forwards only the hash as `x-cuhalide-client`; raw client IPs are not forwarded into the RAG chain.

The token is propagated through the public wrapper and internal quota path so site users no longer share a single fixed proxy-user-agent rate bucket. Public request bodies and chat histories are bounded at both Vercel and Supabase layers.

### 8. Literature Watch isolation

Research mode retrieves frozen release evidence and candidate metadata through separate paths. Candidate metadata does not support frozen scientific claims and never receives automatic release inclusion.

The scheduled discovery job is active at `17 2 * * *` (02:17 UTC daily). The latest checked cron executions on 8–10 August 2026 all completed successfully.

## Provider circuit breaker

Paid Workers AI overage is not authorized. If the free daily allocation is unavailable:

- exact/protected scientific rules continue deterministically;
- ordinary retrieval uses deterministic lexical/precision fallback;
- bounded Qwen interpretation is omitted rather than fabricated;
- the public status reports **SAFE_FALLBACK**;
- after cooldown, the provider is probed for recovery.

Provider state is an operational dependency and is intentionally separated from database integrity, deterministic scientific rules and evidence-grain safety.

## Validation

### Current production contract checks

The public v47 health gate verifies:

- site v47 production marker;
- public-data 2.4.1 availability;
- server-side projection query and minimized public access;
- projection checksum/ACL contract;
- 346 article-audit rows, 332 canonical articles, 878 structure rows, 816 Core-Included structure rows and strict-polar 67 projection integrity;
- four Record 13 erratum overlay rows;
- canonical article `I` containment count 247 and exact `Cl/Br/I` category count 27;
- compact iodide parsing and Cu(I)-oxidation-state separation;
- ligand-halogen false-positive guard;
- tokenized single-letter halogen search;
- structure-search exclusion of article-title photophysics and unmapped motif/photophysics evidence;
- explicit and generic structure-grain RAG guards;
- bounded-claims scientific-context contract.

Final live smoke checks on the v47/2.4.1/9.9.9 stack confirmed:

- canonical articles: **332**;
- article audit records: **346**;
- Core-Included structures: **816**;
- all structure/phase rows: **878**;
- strict-polar rows: **67**;
- canonical article filter `I`: **247**;
- canonical exact article category `Cl/Br/I`: **27**;
- `CUH-008-S01` halogen: **I**;
- `CUH-162-S01`: **Cl/Br/I**, not falsely parsed as iodide from Cu(I);
- `CUH-013-S01`: **Unresolved** dimensionality with the erratum flag;
- structure search `STE`: **0** rows;
- structure search `luminescence`: **0** rows;
- tokenized structure search `I`: **671** rows;
- legacy bulk `/api/export`: **HTTP 410**;
- sitemap MIME: **application/xml**.

The release-specific projection tables have RLS enabled with explicit deny policies for `anon` and `authenticated`; those roles have neither direct SELECT privilege nor query-RPC EXECUTE privilege. `service_role` has SELECT-only table privilege. Supabase security advisor returned **zero findings** after this hardening.

Recent projection-backed public-data requests generally executed in a few hundred milliseconds in Supabase Edge Function logs; health/bootstrap remain slower because they deliberately retain immutable-snapshot and cross-service integrity checks.

### Prior v9 regression suites

- Deterministic exact/anchor regression: **33/33 PASS**.
- Real BGE-M3 + BGE-reranker retrieval regression: **25/25 PASS**.
- Public/internal-chain smoke tests passed during the v9 deployment sequence.

### Legacy scientific baseline

`rag-benchmark-v1.3` passed **70/70** on release 3.0.1, but it predates the final v9 orchestration and the current 9.9.9 hardening. It remains a frozen scientific regression baseline, **not** a fresh 9.9.9 benchmark.

A new full Qwen-enabled benchmark must not be claimed until it is actually rerun and archived.

## Methodological reporting boundary

A manuscript describing the current runtime should report the exact runtime version, deterministic routes, embedding/reranker models, bounded-claim schema, internal scientific-context contract, structure/article evidence-grain separation, server-side public projection architecture, projection integrity/ACL health contract, candidate isolation, provider fallback, client-isolated rate path and the distinction between current runtime checks and the legacy 70/70 scientific baseline.

Do not state that Smart RAG 9.9.9 itself passed the legacy 70-case suite unless a fresh frozen run is executed and archived.
