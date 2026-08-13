# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge portal for organic-containing Cu(I) chloride, bromide and iodide materials.

**Production:** https://cuhalide-atlas-v3.vercel.app/

## Current production model

CuHalide Atlas deliberately separates an immutable citation snapshot from a rolling reviewed layer:

- **Frozen Release 3.0.2** — released 2026-08-11; literature cutoff **June 2026, inclusive through 2026-06-30**; immutable.
- **Current Curated rev.1** — based on 3.0.2; curated through **2026-08-12**; primary-evidence reviewed and QC-gated.
- **Literature Watch** — metadata-only discovery. Its sync timestamp is operational metadata and is **not** a release cutoff or curation date.

The website defaults to **Current Curated** for query-and-view exploration while retaining an explicit Frozen Release scope for reproducible citation and denominator checks.

## Scientific denominators

| Metric | Frozen 3.0.2 | Current Curated rev.1 |
|---|---:|---:|
| Article audit records | 346 | 362 |
| Chemically included articles | 335 | 351 |
| Canonical verified articles | 332 | 348 |
| Structure / phase rows | 878 | 921 |
| Core-Included structure rows | 816 | 859 |
| Resolved space-group rows | 650 | 693 |
| Verified one-to-one SG mappings | 625 | 668 |
| Verified polar rows | 87 | 97 |
| Strict-polar rows | 67 | 77 |
| Strict-polar articles | 42 | 46 |
| RAG documents / embeddings | 1,224 / 1,224 | 1,283 / 1,283 |

Current Curated rev.1 adds **16 reviewed articles** and **43 independent structure/phase determinations**. Fourteen articles are coverage backfills dated on or before 2026-06-30; two are post-cutoff additions. Four additional provenance links connect new articles to already known chemical/phase identities without duplicating those identities.

Frozen Release 3.0.2 denominators are not changed by Current Curated.

## Production versions

- Frozen scientific release: **3.0.2**
- Public site: **v48**
- Public Data: **2.8.0**
- Smart RAG: **9.13.0**
- Metadata / health: **48.1**
- Current Curated: **rev.1**, through **2026-08-12**

## Public/private boundary

Public access is **query-and-view**, not bulk redistribution.

Public interfaces expose selected bibliographic, structure, crystallographic, scope and evidence-status fields through server-side field-whitelisted queries and stable record pages. Smart RAG uses source-linked public records and deterministic scientific boundaries.

The following remain private research assets:

- complete normalized tables and raw payloads;
- exact stored publisher abstracts;
- primary PDF, SI and CIF archives;
- field-evidence excerpts and locators;
- candidate relevance scores, reason codes and source payloads;
- internal QA, adjudication and curation artifacts.

`/api/export` intentionally returns **HTTP 410 Gone**.

## Smart RAG 9.13

Smart RAG 9.13.0 combines:

1. the validated Frozen Release 3.0.2 evidence path;
2. a Current Curated rev.1 exact/retrieval layer;
3. unified BGE-M3 + lexical/RRF retrieval across **1,283** embedded documents;
4. deterministic answers for protected counts, temporal scope and reviewed current records;
5. structure-grain evidence guards preventing article-level photophysics or unmapped motif claims from being silently reassigned to an individual structure/phase;
6. source-constrained interpretation and safe fallback when optional model capacity is unavailable.

Model output cannot override frozen/current denominators, human scope decisions, crystallographic mappings or evidence-grain boundaries.

## Record 13

Frozen Release 3.0.2 physically incorporates the confirmed dimensionality corrections:

- `CUH-013-S01` → **Unresolved**
- `CUH-013-S02` → **0D**
- `CUH-013-S03` → **0D**
- `CUH-013-S04` → **0D**

Historical 3.0.1 errata remain audit history only.

## Production governance

`main` is protected by the active repository ruleset **Protect main production**. It requires:

- pull-request merge into the default branch;
- branch up-to-date before merge;
- resolved review conversations;
- successful `chromium-production`;
- successful `lighthouse-production`;
- successful `preview-chromium`;
- successful `preview-lighthouse`;
- successful trusted `Vercel` status;
- no force push;
- no branch deletion;
- no bypass actors.

A second, fail-closed Vercel production provenance gate independently verifies that a production SHA is the merge result of a reviewed PR whose candidate and production-baseline checks passed.

## Citation

For frozen, reproducible claims, cite **CuHalide Atlas Frozen Release 3.0.2 (11 August 2026)** and the relevant primary literature.

For rolling **Current Curated** results, also report the **access date and live revision**. Literature Watch candidates are not curated evidence and should not be cited as Atlas scientific records until promoted through primary-evidence review and QC.

Permanent repository DOI and blanket project licensing are not asserted until owner-authorized archival metadata and rights decisions are complete.

## Repository layout

- `api/` — Vercel read-only public handlers and stable record/sitemap rendering.
- `public/` — version-controlled interface template and social asset.
- `tests/` — browser/scientific/privacy/accessibility and deployment-gate regression tests.
- `.github/workflows/` — production baseline, protected-preview candidate and Lighthouse gates.
- `supabase/functions/` — versioned production-facing Supabase runtime sources.
- `supabase/migrations/` — executable schema/RPC/access-control migrations that may be applied by Supabase tooling.
- `supabase/contracts/` — row-data-free consolidated mirrors of already-applied production contracts for audit/recovery; these are not auto-run migrations.
- `docs/` — release, curation, security, RAG and production audit records.

Private Current Curated promoted rows are intentionally not published as a bulk SQL/data dump.

See `docs/CURRENT_CURATED_R1_2026-08-12.md` and `docs/PRODUCTION_STATUS_V48_CURRENT_R1_2026-08-13.md` for the current rolling-state audit.
