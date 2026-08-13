# Supabase runtime layout

This directory versions production-facing Supabase runtime contracts used by CuHalide Atlas. It is intentionally separated from immutable frozen scientific archives and from private row-level curation payloads.

## Current public contracts

- `cuhalide-atlas-public-data-v2` — canonical Public Data **2.8.0** wrapper.
- `cuhalide-atlas-smart-rag` — canonical Smart RAG **9.13.0** wrapper.
- `cuhalide-atlas-meta` — canonical metadata/health **48.1** wrapper.
- Frozen scientific base — **Release 3.0.2**.
- Current Curated — **rev.1**, through **2026-08-12**.

The canonical public wrappers contain no write path. Anonymous availability of an Edge wrapper is not equivalent to anonymous database access.

## Temporal and data layers

Frozen Release 3.0.2 is immutable and has a June 2026 literature cutoff, inclusive through 2026-06-30.

Current Curated rev.1 is a separate primary-evidence-reviewed overlay. It adds 16 article records and 43 new structure/phase determinations while preserving all Frozen denominators. The public query contract defaults to Current Curated but accepts an explicit Frozen scope for reproducible release queries.

Literature Watch remains metadata-only and review-gated.

## Public-data chain

`Vercel /api/public-data`
→ `cuhalide-atlas-public-data-v2`
→ `cuhalide-atlas-public-data-v302-public`
→ `cuhalide-atlas-public-data-v302`
→ private Frozen/Current projections and service-role-only RPCs.

Frozen projections remain release-specific. Current projections union the Frozen base with reviewed Current Curated rows while exposing only the established public field whitelist.

Security requirements:

- protected raw/current tables have RLS enabled;
- `anon` and `authenticated` have no direct raw/current-table SELECT or write privilege;
- public browser requests do not execute private projection/RPC objects directly;
- complete normalized tables, exact abstracts, primary PDF/SI/CIF, field-evidence excerpts/locators and internal candidate/QC data remain private;
- bulk normalized export remains retired.

## Smart RAG 9.13 chain

`Vercel /api/agent`
→ `cuhalide-atlas-smart-rag`
→ `cuhalide-atlas-smart-rag-v302-current-public`
→ Frozen compatibility path + Current Curated unified retrieval/exact path.

Current Curated internals:

- `cuhalide-atlas-current-rag-r1-internal` — deterministic temporal/current exact service;
- `cuhalide-atlas-current-rag-r1-unified-internal` — unified Frozen + Current BGE-M3/lexical/RRF retrieval;
- `cuhalide_atlas_hybrid_search_current_v1` — service-role-only unified retrieval RPC.

Frozen compatibility dependencies remain in service because their evidence-grain-safe behavior is validated and reused only where release compatibility is explicitly checked. Some historical function slugs still contain `canary`; these names are implementation history, not evidence that an endpoint is publicly exposed. Production dependency status must be determined from source and `verify_jwt`, not from the slug alone.

## Current Curated private schema

The repository versions Current Curated schema/RLS/RPC contracts but intentionally does not publish the private promoted 16/43 row payload as a bulk SQL/data dump. Production row payloads remain private curation assets.

Expected Current health:

- article audit: 362
- chemically included: 351
- canonical verified: 348
- structure/phase: 921
- Core-Included: 859
- resolved SG: 693
- verified SG: 668
- verified polar: 97
- strict polar: 77
- strict-polar articles: 46
- RAG documents / embedded: 1,283 / 1,283

Expected Frozen guard:

346 / 335 / 332 / 878 / 816 / 650 / 625 / 87 / 67 / 42 and 1,224 / 1,224 Frozen RAG documents/embeddings.

## Retirement policy

Temporary indexing, debugging, export and benchmark endpoints must be either removed or retained only as JWT-required HTTP 410 retirement stubs when historical operational compatibility warrants a named endpoint. An `ACTIVE` Supabase function status can therefore represent a safe retirement stub; source inspection is authoritative.

## Operational validation

Production health:

`https://cuhalide-atlas-v3.vercel.app/health.json`

A complete synchronized production state requires:

- core health PASS;
- `site_readiness=PASS`;
- Public Data 2.8.0;
- Smart RAG 9.13.0;
- metadata 48.1;
- Current Curated rev.1 counts above;
- Frozen 3.0.2 guards above;
- Record 13 physical corrections;
- structure evidence-grain safeguards;
- query-and-view access with no public bulk export.
