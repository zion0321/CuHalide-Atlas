# Smart RAG v9 runtime

This document describes the **runtime** serving CuHalide Atlas release 3.0.1. Runtime hardening does not modify the immutable 3.0.1 scientific archive.

## Production version

- Public runtime: **9.10.0**
- Public endpoint: `https://cuhalide-atlas-v3.vercel.app/api/agent`
- Internal quota/exact gateway: **9.9.6-public-internal**
- Deterministic exact/anchor service: **10.2.1-exact-anchor-internal**
- Final internal orchestrator: **9.11.3-final-internal**
- Evidence-grain-safe retrieval core: **9.11.0-safe-core-internal**
- Bounded-claims service: **qwen-claims-v9-1.3.0**
- Public data contract: **2.6.0**
- Public site: **v47**
- Public metadata/health contract: **47.6**
- Frozen scientific release: **3.0.1**
- Scientific parent: **3.0.0**
- Frozen literature cutoff: **2026-06**
- Explicit historical rollback target: **8.3.0**

## Architecture

The public browser path is:

`browser` → `Vercel /api/agent` → `public Smart RAG wrapper` → `JWT quota/exact gateway` → `JWT deterministic exact/anchor service for protected matches` or `JWT final orchestrator` → `JWT evidence-grain-safe retrieval core`

Separate JWT-protected services provide bounded claims, candidate metadata, lexical fallback and a scientific-context contract probe.

The public data path is separately minimized:

`browser` → `Vercel /api/public-data` → `public read-only Edge Function` → `service-role-only release projection/query functions`

The public data path does not expose the private release projection tables or their query RPCs directly to anonymous/authenticated Supabase roles.

### 1. Deterministic scientific guards

Protected questions are resolved before bounded model interpretation. These include exact denominators, direct record properties, unresolved values, scope states, false-premise correction, Record 13 effective dimensionality, Evidence-D canonical exclusion, polarity/ferroelectric boundaries, Live Monitor release isolation and material-specific STE–Cu···Cu relation constraints.

The exact/anchor layer also carries selected canonical article anchors. A current example is the Record 101 same-source relation route, which returns Cu···Cu = 2.574 Å and STE emission = 527 nm deterministically, with no embedding or LLM use.

### 2. Retrieval

When external Workers AI capacity is available, retrieval combines:

1. precision/entity anchors and metadata filters;
2. full-text search;
3. BGE-M3 embeddings (`@cf/baai/bge-m3`, 1024 dimensions);
4. reciprocal-rank fusion over structured/lexical/semantic candidates;
5. BGE reranking (`@cf/baai/bge-reranker-base`).

The evidence-grain-safe core routes soft scientific concepts such as photophysics, stability, transport and unmapped structural motifs to article-grain evidence. Structure records are reconstructed from a safe identity/crystallography projection rather than from legacy structure documents containing copied article-level science.

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
4. **Evidence-grain-safe core.** Soft scientific concepts are retrieved from article-grain documents; any structure lines are rebuilt from a safe projection.
5. **Explicit-ID deterministic boundary.** If a query names `CUH-xxx-Sxx` and asks about motif/photophysics, public runtime separates structure identity/crystallography from the article-grain evidence of the associated record and states that the latter is not independently mapped to the named phase.
6. **Generic outer guard.** Generic motif/photophysics responses remove unmapped structure sources and structure-labelled answer lines before returning to the browser.
7. **Causality boundary.** Same-record coexistence is not treated as automatic same-phase causality.

The explicit and generic public guards remain active independently of model-provider availability.

### 6. Public structure and query semantics

Public data 2.6.0 uses release-specific server-side projections and semantic normalization functions.

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

The scheduled discovery job is active at `17 2 * * *` (02:17 UTC daily). The checked cron executions on 8–10 August 2026 completed successfully.

## Provider circuit breaker

Paid Workers AI overage is not authorized. If the free daily allocation is unavailable:

- exact/protected scientific rules continue deterministically;
- ordinary retrieval uses deterministic lexical/precision fallback;
- bounded Qwen interpretation is omitted rather than fabricated;
- the public status reports **SAFE_FALLBACK**;
- after cooldown, the provider is probed for recovery.

At the 11 August 2026 current-runtime validation, free Workers AI capacity had recovered and the public endpoint reported **FULL** with bounded scientific interpretation available. Provider state can change later and is intentionally separated from database integrity, deterministic scientific rules and evidence-grain safety.

## Validation

### Fresh current-runtime benchmark

A fresh **`rag-benchmark-v1.4`** run was completed on 11 August 2026 after free Workers AI capacity recovery.

- Run ID: `81eeab9f-3efb-4d19-bab0-7768acebfc4b`
- Release: **3.0.1**
- Code label: **smart-rag-v9.11.3-evidence-grain-v2**
- Exact/deterministic: **25/25**
- Retrieval: **25/25**
- Reasoning/scientific-boundary: **20/20**
- Total: **70/70 PASS**
- Release gate: **PASS**
- Paid overage authorized: **false**

The final deterministic repair advanced the exact/anchor layer to `10.2.1-exact-anchor-internal`, including the explicit Record 101 same-source relation route and the Record 267 frozen human-scope wording guard. See [`RAG_BENCHMARK_V14_2026-08-11.md`](RAG_BENCHMARK_V14_2026-08-11.md).

### Current production contract checks

The public v47 health gate currently verifies:

- site v47 production marker;
- public-data 2.6.0 availability;
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
- bounded-claims scientific-context contract;
- CSP hardening and the current public metadata contract.

The checked live production state on 11 August 2026 reported:

- `/health.json`: **HTTP 200 / PASS**;
- public site: **47**;
- public data: **2.6.0**;
- public Smart RAG: **9.10.0**;
- public metadata/health: **47.6**;
- Smart RAG operational mode: **FULL**;
- bounded scientific interpretation: **available**;
- scientific-context contract: **PASS**;
- `/sitemap.xml` MIME: **application/xml; charset=utf-8**.

The release-specific projection tables have RLS enabled with explicit deny policies for `anon` and `authenticated`; those roles have neither direct SELECT privilege nor query-RPC EXECUTE privilege. `service_role` has SELECT-only table privilege. Supabase security advisor returned zero findings after the projection/RLS hardening pass.

### Browser-level production QA

The repository now retains a Playwright/Chromium production gate. Its validated run passed against the live v47 site across desktop, tablet and mobile viewports. The gate covers all public routes, serious/critical axe accessibility violations, page/console errors, horizontal overflow, responsive navigation, modal focus behavior, hash deep links, frozen scientific denominators, evidence-grain boundaries, structure-halogen semantics, CSP hardening and retired public routes.

This is real automated Chromium QA. It does not claim exhaustive Safari/Firefox coverage or manual pixel-perfect human review.

### Prior regression history

- `rag-benchmark-v1.3`: **70/70 PASS** on an older pre-final-v9 runtime; historical baseline only.
- Deterministic exact/anchor regression during v9 deployment: **33/33 PASS**.
- Real BGE-M3 + BGE-reranker retrieval regression during v9 deployment: **25/25 PASS**.
- Public/internal-chain smoke tests passed during the v9 deployment sequence.

## Methodological reporting boundary

A manuscript describing the current runtime should report the exact runtime version, deterministic routes, embedding/reranker models, bounded-claim schema, internal scientific-context contract, structure/article evidence-grain separation, server-side public projection architecture, projection integrity/ACL health contract, candidate isolation, provider fallback, client-isolated rate path and the distinction between current runtime validation and older historical baselines.

The current runtime may be reported as having passed **rag-benchmark-v1.4, 70/70**, provided the run ID and evidence-grain version are given. That benchmark result establishes conformance to the registered 70-case suite; it does not establish exhaustive literature completeness or general-purpose scientific reasoning accuracy.
