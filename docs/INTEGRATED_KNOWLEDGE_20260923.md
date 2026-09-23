# Integrated knowledge release — 23 September 2026

This change replaces the rejected project-specific companion with upgrades inside the original CuHalide Atlas portal.

## What changed

A private relational catalog reconciles included current articles with existing bibliographic context and authored source-review notes. It exposes only a whitelisted read-only query projection. Five existing boundary references remain context, not core articles. Excluded records are not reintroduced. Forty-one source notes are annotations; their statements do not overwrite crystallography or sample measurements. The expanded live DOI union is 410 at release, not an asserted 410-paper full-text ingestion.

The original Literature view gains scope selection; the original Research Assistant gains inspect/select/save context tools and retrieval provenance; article details gain DOI-linked source review. Main-page coverage is fetched from the same database projection. The old project page redirects to the original assistant and its navigation link is removed.

The core semantic index stays at 1,322 embedded records and the core structured denominator at 901. New bibliographic records are lexical discovery context, not newly verified crystal structures. Frozen 3.0.2 remains immutable.

## Public API

`GET /api/knowledge?action=coverage`

`GET /api/knowledge?action=articles&q=...&scope=all|curated|context|reviewed&limit=1..20&offset=0..1000`

`GET /api/knowledge?action=retrieve&q=...&scope=...`

Query length is bounded to 600 characters. Public writes and arbitrary database/RPC access are disallowed. The underlying SQL function is service-role only. Returning a selected, user-saved context record does not expose original PDFs or internal source passages.

## Validation and rollback

Keep the scientific core and immutable snapshot unchanged. New views and source-note tables are additive. Reverting the interface and edge-function versions disables the integration without rewriting core curation. Existing production safeguards are not removed. Tests are about software behavior and source accounting, not model accuracy or scientific validation.
