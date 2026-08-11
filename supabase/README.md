# Supabase runtime layout

This directory versions the production-facing Supabase runtime and migrations used by CuHalide Atlas. It is intentionally separated from the immutable frozen scientific archives.

## Current public contracts

The canonical anonymous **read-only wrappers** are versioned here and must match the deployed production entrypoints:

- `functions/cuhalide-atlas-public-data-v2/index.ts` — public data contract **2.7.0**, frozen release **3.0.2**;
- `functions/cuhalide-atlas-smart-rag/index.ts` — public Smart RAG contract **9.12.0**, frozen release **3.0.2**;
- `functions/cuhalide-atlas-meta/index.ts` — public health/manifest/citation/robots contract **48.0**, site **v48**, frozen release **3.0.2**.

These canonical functions contain no public write path. They proxy to release-specific services and preserve release/version response headers. Anonymous availability is required by the public website; it is not equivalent to anonymous database access.

## Public-data trust boundary

Release-3.0.2 public projections are:

- `public.cuhalide_atlas_public_articles_v302`
- `public.cuhalide_atlas_public_structures_v302`

They are private runtime projections, not directly readable public tables.

The public chain is:

`Vercel /api/public-data` → `cuhalide-atlas-public-data-v2` → `cuhalide-atlas-public-data-v302-public` → release-specific query service/RPCs.

The release-specific public wrapper uses the service role only server-side to execute explicitly permitted health/query operations. Security requirements are:

- RLS is enabled on protected runtime tables;
- `anon` and `authenticated` have no direct projection-table SELECT privilege;
- those roles have no projection-query RPC EXECUTE privilege;
- public list/search/filter/page requests return only field-whitelisted projections;
- complete normalized tables, exact publisher abstracts, primary PDF/SI/CIF payloads, field-evidence excerpts/locators, candidate scoring/reasoning and internal QA/adjudication data remain private;
- bulk normalized export remains retired.

The service-role-only `cuhalide_atlas_public_projection_health_v302()` / `cuhalide_atlas_public_health_v302()` contracts check frozen row counts, release-specific checksums, RLS/ACL invariants, Record 13 physical corrections, structure-halogen semantics and Current Curated state.

## Frozen Release and Current Curated

Frozen scientific release **3.0.2** physically incorporates the four confirmed Record 13 dimensionality corrections. Release 3.0.1 remains immutable historical provenance; no runtime overlay is required for those four fields in 3.0.2.

Current Curated is a separate rolling layer based on 3.0.2. New literature may enter Current Curated only after primary article/SI/CIF review, structure/phase expansion, scientific QC and RAG/index regression. Current Curated revisions must never rewrite the frozen 3.0.2 denominators or archive.

## Smart RAG trust boundary

The public Smart RAG wrapper is not the reasoning core. The current release-aware path is:

`cuhalide-atlas-smart-rag`
→ `cuhalide-atlas-smart-rag-v302-public`
→ `cuhalide-atlas-smart-rag-v302-public-internal`
→ release-3.0.2 compatibility/core services and the validated v9 retrieval stack where content hashes are release-compatible.

Required production dependencies include the v302 RAG contract/core adapter, the evidence-grain-safe v9 core, the exact deterministic service, lexical fallback, candidate search, bounded-claims service and provider-state/rate-limit database contracts. These internal functions are JWT-protected unless a public release-specific wrapper is explicitly required.

The public boundary independently enforces request-size/history limits, structure/article evidence-grain separation, deterministic protected facts, source-constrained scientific interpretation, quota-aware safe fallback and candidate/frozen isolation. Structure-level motif/photophysics are not emitted as independently mapped facts without structure-grain evidence.

A current dependency inventory and retirement classification is maintained in `../docs/SUPABASE_EDGE_FUNCTION_INVENTORY_V48_2026-08-11.md`.

## Release-specific migrations

Release 3.0.1 migrations remain historical. Release 3.0.2 adds release-specific projections, physical Record 13 corrections, Current Curated state/contracts and RAG compatibility/index contracts. Production DDL must be applied through migrations, use fixed `search_path` for privileged functions where appropriate, preserve least privilege, and be followed by Supabase Security Advisor review.

## Operational validation

Production health:

`https://cuhalide-atlas-v3.vercel.app/health.json`

A passing current health result requires release **3.0.2**, site **v48**, public data **2.7.0**, Smart RAG **9.12.0**, metadata **48.0**, release-specific projection/RAG contracts, Current Curated consistency, Record 13 physical corrections, structure evidence-grain safeguards and hardened public access rules.

Provider quota/circuit state is operational and deliberately separate from frozen database integrity. `SAFE_FALLBACK` is acceptable when bounded external-model synthesis is unavailable; it must not disable deterministic scientific rules, evidence retrieval or release contracts.
