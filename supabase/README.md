# Supabase runtime layout

This directory versions the **public-safe Supabase runtime and database contracts** used by CuHalide Atlas. It is intentionally separated from immutable Frozen Release archives and from private row-level curation/evidence payloads.

## Current production identities

- Frozen scientific base: **Release 3.0.2** — immutable; literature cutoff June 2026, inclusive through **2026-06-30**.
- Current Curated: **rev.3** — curated through **2026-08-14**.
- Public Data: **2.10.0**.
- Smart RAG: **9.15.0**.
- Metadata/health: **48.4**.
- Motif Atlas schema: **1.2**.
- Unified RAG corpus: **1,322 / 1,322** documents/embeddings.

The canonical public wrappers contain no write path. Anonymous availability of an Edge wrapper is not equivalent to anonymous database access.

## Current Curated rev.3 health contract

Expected Current Curated counts:

- article audit: **373**
- chemically included: **362**
- canonical verified: **359**
- structure/phase: **949**
- Core-Included: **887**
- resolved space-group rows: **719**
- verified one-to-one space-group mappings: **694**
- verified polar rows: **97**
- strict-polar rows: **77**
- strict-polar articles: **46**
- RAG documents / embedded: **1,322 / 1,322**

Expected immutable Frozen Release 3.0.2 guard:

**346 / 335 / 332 / 878 / 816 / 650 / 625 / 87 / 67 / 42**, with **1,224 / 1,224** Frozen RAG documents/embeddings.

The Current overlay contains **27 reviewed article records** and **71 reviewed structure/phase determinations**, including **19 frozen-cutoff coverage backfills** and **8 post-cutoff additions**. These do not rewrite Frozen Release 3.0.2.

## Public-data chain

`Vercel /api/public-data`
→ `cuhalide-atlas-public-data-v2`
→ `cuhalide-atlas-public-data-v302-public`
→ `cuhalide-atlas-public-data-v302`
→ private Frozen/Current projections and service-role-only RPCs.

Public Data 2.10.0 adds Current Curated rev.3 and the Motif Atlas 1.2 conservative fractional/mixed-occupancy contract while retaining the established structure/detail interfaces. Raw taxonomy/component relations are not publicly selectable.

## Smart RAG 9.15 chain

`Vercel /api/agent`
→ `cuhalide-atlas-smart-rag`
→ `cuhalide-atlas-smart-rag-v302-current-public`
→ Frozen compatibility path + unified Current Curated retrieval/exact path.

Current internals retain historical slugs for compatibility:

- `cuhalide-atlas-current-rag-r1-internal` — deterministic Current/temporal/Motif Atlas exact service, now serving rev.3.
- `cuhalide-atlas-current-rag-r1-unified-internal` — unified Frozen + Current BGE-M3/lexical/RRF retrieval, now covering rev.1 through rev.3.
- `cuhalide_atlas_hybrid_search_current_v1` — service-role-only unified retrieval RPC.
- `cuhalide_atlas_update_current_rag_embeddings_v1` — service-role-only, Current-Curated-scoped BGE-M3 embedding writer; it cannot modify Frozen/legacy releases.

The unified retrieval corpus is **1,322 / 1,322**. Structure-grain motif identity is allowed only from the independent structure taxonomy; article-grain photophysics is not silently reassigned to named structure/phase rows.

## Motif Atlas 1.2

Motif Atlas separates three primary material classes:

- **Coordination**
- **Ionic / Hybrid Ionic**
- **All-in-One (AIO)**

Legacy mixed or insufficiently specified category assignments remain **Unresolved legacy mapping** rather than being forced into one of the three classes.

Three denominators are kept distinct: article reports, crystallographic determinations, and normalized reported identity groups. Organic components are evidence-tiered into primary-evidence curated components versus legacy label-derived candidates.

Schema 1.2 adds a strict conservative rule: **fractional or mixed-occupancy Cu/halide labels remain motif-unresolved unless an independent structure-grain mapping establishes a discrete integer Cu–X core.** The rev.3 audit corrected 15 legacy over-parsed rows. Current taxonomy totals are **949 total / 816 motif-resolved / 133 motif-unresolved**, with 40 unresolved legacy-category rows.

## Privacy and access boundary

Security requirements:

- protected raw/current/taxonomy/component tables have RLS enabled;
- `anon` and `authenticated` have no direct raw/current-table SELECT or write privilege;
- public browser requests do not execute private projection/RPC objects directly;
- complete normalized tables, exact publisher abstracts, primary PDF/SI/CIF, field-evidence excerpts/locators and internal candidate/QC data remain private;
- bulk normalized export remains retired (`/api/export` = HTTP 410).

The canonical public endpoints remain field-whitelisted, read-only wrappers. Historical compatibility slugs are either synchronized proxies, JWT-protected internals, or retirement stubs; an old slug is not allowed to restore a bulk-export surface.

## Migration governance

The production project has a longer historical migration ledger than the **public-safe** migration subset in this repository. Some historical production migrations contain private corpus rows, one-time operational provisioning, Vault/credential handling or other material that must not be copied into a public repository merely to reconstruct migration history.

Therefore:

- `supabase/migrations/` is **not** treated as a complete replayable clone of the production database history;
- `supabase/contracts/` contains sanitized, non-executable/current-state contract mirrors used for audit and recovery planning;
- private promoted row payloads are not committed as public SQL dumps;
- fake/no-op timestamp migrations must **not** be added simply to silence migration-history checks, because they would produce invalid data-less preview databases;
- raw statements from `supabase_migrations.schema_migrations` must **not** be bulk-exported to this public repository.

As of 2026-08-14, production records **124** migration-history entries spanning `20260807140239` through `20260814054208`. The three rev.3-era schema changes are the Current-Curated-scoped embedding writer, unified hybrid-search extension through rev.3, and Motif Atlas 1.2 conservative fractional/mixed-occupancy contract. The production ledger is internally consistent, but it is intentionally not reproduced verbatim in the public repository. See `contracts/REMOTE_MIGRATION_INVENTORY_2026-08-14.md` for the public-safe inventory boundary.

### GitHub integration policy

CuHalide Atlas uses a controlled Supabase deployment/curation workflow rather than treating the public Git repository as the authoritative source for replaying the complete production migration chain. Accordingly, **Supabase GitHub automatic migration deployment / automatic branching should remain disabled unless the project is later migrated to a complete sanitized canonical migration repository**.

Vercel/GitHub remain the authoritative deployment and QA path for the public web application. Supabase schema/data changes are separately reviewed, applied, validated, security-audited and then mirrored into public-safe contracts where appropriate.

## Retirement policy

Temporary indexing, debugging, export and benchmark endpoints must be removed or retained only as JWT-required HTTP 410 retirement stubs where historical operational compatibility warrants a named endpoint. An `ACTIVE` function can therefore still be a safe retirement stub; source inspection and `verify_jwt` are authoritative. The rev.3 ephemeral BGE-M3 indexer was retired immediately after 17/17 new embeddings were written and now requires JWT while returning HTTP 410.

## Operational validation

Production health:

`https://cuhalide-atlas-v3.vercel.app/health.json`

A synchronized Current Curated rev.3 production state requires:

- core health `PASS`;
- `site_readiness=PASS` after the matching Vercel release is promoted;
- Public Data **2.10.0**;
- Smart RAG **9.15.0**;
- metadata **48.4**;
- Motif Atlas **1.2**;
- Current Curated rev.3 counts above;
- Frozen 3.0.2 guards above;
- Record 13 physical corrections;
- fractional/mixed-occupancy motif conservatism;
- structure evidence-grain safeguards;
- query-and-view access with no public bulk normalized export.
