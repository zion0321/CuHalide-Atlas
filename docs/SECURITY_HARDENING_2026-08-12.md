# CuHalide Atlas security hardening — 2026-08-12

Scientific release: **3.0.2**  
Public site: **v48**  
Public data: **2.7.0**  
Smart RAG: **9.12.0**

## Scope

A defense-in-depth audit of the production database, public API boundary, stable record pages, CI supply chain, runtime logs, scheduled literature discovery, object privileges, function execution rights, sequences, default privileges and Storage configuration was performed after the release-3.0.2 production alignment.

No scientific record, frozen denominator, Record 13 correction, RAG scientific boundary, Current Curated revision or literature cutoff was changed by this hardening pass.

## Legacy database access closed

The current public contract is server-mediated query-and-view through release-specific field-whitelisted services. The audit found historical grants and permissive RLS policies remaining on legacy/raw internal relations from earlier website generations. These legacy paths were not required by the v48 public application and could bypass the intended minimized projection boundary.

Direct `PUBLIC`, `anon` and `authenticated` privileges were revoked from:

- `cuhalide_atlas_articles`;
- `cuhalide_atlas_candidate_queue`;
- `cuhalide_atlas_known_dois`;
- `cuhalide_atlas_payload_chunks`;
- `cuhalide_atlas_release`;
- `cuhalide_atlas_releases`;
- `cuhalide_atlas_structures`;
- `cuhalide_atlas_sync_runs`.

The obsolete permissive read policies on these relations were removed. Explicit deny-all RLS policies for `anon` and `authenticated` were then added as a second independent protection layer. `service_role` access is retained for trusted Edge Functions and scheduled maintenance.

Two legacy `cuhalide_atlas_search(...)` overloads that return raw `payload jsonb` were also removed from the public/authenticated execution surface and retained for `service_role` only.

The remaining CuHalide database helper/trigger functions were audited. Five title/audit helper functions plus `cuhalide_candidate_auto_triage()` had inherited public execution grants even though they are internal implementation details. Their `PUBLIC`, `anon` and `authenticated` execution rights were revoked and trusted `service_role` execution retained. A full post-change scan found no `cuhalide%` database function directly executable by `anon` or `authenticated`.

Twelve CuHalide sequences had inherited `SELECT`/`UPDATE` privileges for public roles. Those privileges were revoked object-by-object and trusted `service_role` sequence access retained. Post-change verification found no `anon` or `authenticated` USAGE/SELECT/UPDATE privilege on any CuHalide sequence.

## Private-by-default future objects

Atlas database objects are created under the `postgres` owner. The `postgres` default privileges in the `public` schema were hardened so future tables, sequences and functions do not automatically grant access to `anon` or `authenticated`; future public database surfaces must be granted explicitly. `service_role` retains the trusted runtime defaults required by server-mediated services. Platform-level `supabase_admin` defaults were left unchanged.

## Storage boundary

The Supabase project currently contains no Storage buckets and no `storage.objects` policies. Primary PDF/SI/CIF material is therefore not exposed through a public Supabase Storage bucket.

## Verification

Post-migration verification confirmed:

- no SELECT/INSERT/UPDATE/DELETE privilege for `anon` or `authenticated` on the eight internal relations;
- explicit deny-all RLS policies on those relations for public roles;
- no public execution privilege on the two raw-payload search functions;
- no public execution privilege on any CuHalide database helper/trigger function;
- no public sequence privilege on CuHalide counters;
- hardened `postgres` future-object defaults;
- a clean Supabase security-advisor result with **0 findings**.

## Public-contract regression

After the database ACL changes, the following remained operational:

- public release/status queries;
- metadata-only Literature Watch candidates;
- Current Curated status;
- Smart RAG health and scientific-context contract;
- dynamic sitemap and stable record URLs;
- release 3.0.2 query-and-view access policy.

Candidate output remains a minimized metadata projection. Candidate abstracts, relevance scores, review notes, source payloads and internal sync-run details remain private.

## CI and dependency hardening

GitHub Actions are pinned to current immutable action commit SHAs rather than mutable major tags. Weekly Dependabot monitoring is configured for both npm and GitHub Actions dependencies. QA dependencies remain lockfile-reproducible with `npm ci`.

## Stable record metadata

Stable article pages retain Open Graph type `article`. Stable structure/phase pages use Open Graph type `website` while retaining Schema.org `Dataset` JSON-LD, removing an unnecessary article-type semantic mismatch.

## Security boundary

This hardening does not authorize redistribution of the private corpus, exact publisher abstracts, primary PDF/SI/CIF files, field-evidence excerpts/locators, internal QA/adjudication data, candidate scoring/reasoning, or curation internals. Public bulk export remains retired.
