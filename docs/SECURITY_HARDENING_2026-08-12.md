# CuHalide Atlas security hardening — 2026-08-12

Scientific release: **3.0.2**  
Public site: **v48**  
Public data: **2.7.0**  
Smart RAG: **9.12.0**

## Scope

A defense-in-depth audit of the production database, public API boundary, stable record pages, CI supply chain, runtime logs and scheduled literature discovery was performed after the release-3.0.2 production alignment.

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

Post-migration verification confirmed no SELECT/INSERT/UPDATE/DELETE privilege for `anon` or `authenticated` on the eight internal relations, no public execution privilege on the two raw-payload search functions, and a clean Supabase security-advisor result.

## Public-contract regression

After the database ACL change, the following remained operational:

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
