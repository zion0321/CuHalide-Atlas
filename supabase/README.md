# Supabase runtime layout

This directory versions the production-facing Supabase runtime and migrations used by CuHalide Atlas. It is intentionally separated from the frozen scientific release archive.

## Public Edge Functions

The following functions are anonymous **read-only wrappers** because the public website must be able to call them without exposing a Supabase service credential:

- `functions/cuhalide-atlas-public-data-v2/index.ts` — field-whitelisted public data contract, currently 2.4.1;
- `functions/cuhalide-atlas-smart-rag/index.ts` — public Smart RAG gateway, currently 9.9.9;
- `functions/cuhalide-atlas-meta/index.ts` — public health/manifest/citation/robots/sitemap contract, currently 47.1.

Anonymous does not mean unrestricted database access. The wrappers perform their own read-only contract enforcement and use the server-side service role only for explicitly permitted internal calls.

## Public-data trust boundary

Release-3.0.1 public query projections:

- `public.cuhalide_atlas_public_articles_v301`
- `public.cuhalide_atlas_public_structures_v301`

are private runtime projections, not public Supabase tables.

Security requirements:

- RLS is enabled;
- explicit deny policies apply to `anon` and `authenticated`;
- those roles have no direct projection-table SELECT privilege;
- those roles have no projection-query RPC EXECUTE privilege;
- `service_role` has SELECT-only table access;
- public list/search/filter/page requests go through the public Edge Function and return only the field-whitelisted contract;
- complete normalized release tables, exact stored abstracts, PDF/SI/CIF evidence and internal QA/adjudication data are not exposed.

The service-role-only `cuhalide_atlas_public_projection_health_v301()` function checks row-count invariants, projection checksums, ACL/RLS invariants and selected semantic query contracts. Public health exposes only the boolean contract state.

## Smart RAG trust boundary

The public Smart RAG wrapper is not the reasoning core. Production is layered:

`public wrapper` → `JWT quota gateway` → `JWT final orchestrator` → `JWT retrieval core`

with separate JWT-protected bounded-claims, lexical-fallback, candidate-search and scientific-context-contract services.

The public wrapper independently enforces request-size/history limits and evidence-grain guards. Structure-level motif/photophysics are not emitted as independently mapped facts unless a corresponding structure-grain evidence mapping exists.

## Frozen release versus runtime projection

The immutable release-3.0.1 snapshot remains the scientific release source. Runtime projections may apply only documented effective overlays, currently the four Record 13 dimensionality errata. They must not silently rewrite the archived scientific release.

A future formal scientific correction belongs in a new versioned scientific release (for the known Record 13 correction, planned 3.0.2), after which a new release-specific projection should be generated rather than mutating the v301 projection in place.

## Migrations

- `migrations/20260810_public_projection_v301.sql` creates/populates the release-specific projection schema and query functions.
- `migrations/20260810_public_projection_contract_hotfix_v301.sql` records the final single-halogen article-filter semantics, least-privilege grants and continuous projection integrity/ACL contract.

Production migrations should remain idempotent where practical, use fixed `search_path` for privileged functions, and be followed by Supabase Security Advisor review.

## Operational validation

The production public health endpoint is:

`https://cuhalide-atlas-v3.vercel.app/health.json`

A passing health result currently requires site v47, public data 2.4.1, Smart RAG 9.9.9, metadata 47.1, the RAG scientific-context contract, public-data projection integrity/ACL checks, structure evidence-grain safeguards and the known errata registry.

Provider quota/circuit state is operational and deliberately separate from frozen database integrity. `SAFE_FALLBACK` is acceptable when bounded external-model synthesis is unavailable; it must not disable deterministic scientific rules or evidence retrieval.
