# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge portal for organic-containing Cu(I) chloride, bromide and iodide materials.

**Production:** https://cuhalide-atlas-v3.vercel.app/

## Current production model

CuHalide Atlas deliberately separates an immutable citation snapshot from a rolling reviewed layer:

- **Frozen Release 3.0.2** — released 2026-08-11; literature cutoff **June 2026, inclusive through 2026-06-30**; immutable.
- **Current Curated rev.2** — based on 3.0.2; curated through **2026-08-13**; primary-evidence reviewed and QC-gated.
- **Literature Watch** — metadata-only discovery. Its sync timestamp is operational metadata and is **not** a release cutoff or curation date.

The website defaults to **Current Curated** for query-and-view exploration while retaining an explicit Frozen Release scope for reproducible citation and denominator checks.

## Scientific denominators

| Metric | Frozen 3.0.2 | Current Curated rev.2 |
|---|---:|---:|
| Article audit records | 346 | 370 |
| Chemically included articles | 335 | 359 |
| Canonical verified articles | 332 | 356 |
| Structure / phase rows | 878 | 935 |
| Core-Included structure rows | 816 | 873 |
| Resolved space-group rows | 650 | 705 |
| Verified one-to-one SG mappings | 625 | 680 |
| Verified polar rows | 87 | 97 |
| Strict-polar rows | 67 | 77 |
| Strict-polar articles | 42 | 46 |
| RAG documents / embeddings | 1,224 / 1,224 | 1,305 / 1,305 |

Current Curated rev.2 contains **24 reviewed overlay articles** and **57 overlay structure/phase determinations** relative to Frozen 3.0.2. Nineteen overlay articles are coverage backfills dated on or before 2026-06-30; five are post-cutoff additions. Frozen Release 3.0.2 denominators are not changed by Current Curated.

## Motif Atlas

The public **Motif Atlas** adds a structure-level taxonomy for Cu–halide building units without exposing the private curation corpus.

Primary material classes are:
- **Coordination**
- **Ionic / Hybrid Ionic**
- **All-in-One (AIO)**

Historical mixed/ambiguous labels are kept as **Unresolved legacy mapping** rather than forced into one of the three primary classes.

Three denominators are deliberately separated: **article reports**, **crystallographic determinations**, and **normalized reported identities**. The current taxonomy covers 935 structure/phase rows; 817 have a resolved normalized Cu–X motif and 118 remain motif-unresolved. Primary-evidence curated ligand/cation identities are kept separate from legacy label-derived candidates.

## Production versions

- Frozen scientific release: **3.0.2**
- Public site: **v48**
- UI/content layer: **48.3**
- Public Data: **2.9.0**
- Smart RAG: **9.14.0**
- Metadata / health: **48.3**
- Motif Atlas schema: **1.1**
- Current Curated: **rev.2**, through **2026-08-13**

## Public/private boundary

Public access is **query-and-view**, not bulk redistribution. Public interfaces expose selected bibliographic, structure, crystallographic, motif-taxonomy, scope and evidence-status fields through server-side field-whitelisted queries and stable record pages. Smart RAG uses source-linked public records and deterministic scientific boundaries.

The following remain private research assets: complete normalized tables and raw payloads; exact stored publisher abstracts; primary PDF, SI and CIF archives; field-evidence excerpts and locators; candidate relevance scores, reason codes and source payloads; internal QA, adjudication and curation artifacts.

`/api/export` intentionally returns **HTTP 410 Gone**.

## Smart RAG 9.14

Smart RAG 9.14.0 combines the validated Frozen Release 3.0.2 evidence path; Current Curated rev.1 + rev.2 incremental evidence; unified BGE-M3 + lexical/RRF retrieval across **1,305** embedded documents; deterministic answers for protected counts, temporal scope, reviewed current records and Motif Atlas statistics; structure-grain evidence guards; structure-level motif output only when taxonomy provides an independent mapping; and source-constrained interpretation/safe fallback.

Model output cannot override frozen/current denominators, human scope decisions, crystallographic mappings, motif taxonomy or evidence-grain boundaries.

## Record 13

Frozen Release 3.0.2 physically incorporates the confirmed dimensionality corrections:
- `CUH-013-S01` → **Unresolved**
- `CUH-013-S02` → **0D**
- `CUH-013-S03` → **0D**
- `CUH-013-S04` → **0D**

Historical 3.0.1 errata remain audit history only.

## Production governance

The default branch is protected by the active **Protect main production** ruleset. Production uses pull-request provenance, strict required Chromium/Lighthouse candidate and production checks, trusted Vercel status and a fail-closed Vercel deployment gate. Direct production promotion is rejected or safely skipped unless provenance and required checks can be verified.

Supabase production schema/data changes are governed separately from the public repository. The public `supabase/` tree intentionally contains a public-safe subset rather than the complete private production migration ledger, so GitHub-driven Supabase Automatic branching and Deploy to production are not authoritative deployment paths for this repository and should remain disabled.

## Citation

For frozen, reproducible claims, cite **CuHalide Atlas Frozen Release 3.0.2 (11 August 2026)** and the relevant primary literature. For rolling **Current Curated** results, also report the **access date and live revision**. Literature Watch candidates are not curated evidence and should not be cited as Atlas scientific records until promoted through primary-evidence review and QC.

Permanent repository DOI and blanket project licensing are not asserted until owner-authorized archival metadata and rights decisions are complete.

## Repository layout

- `api/` — Vercel read-only public handlers and stable record/sitemap/Motif Atlas rendering.
- `public/` — version-controlled interface template and presentation assets.
- `tests/` — browser/scientific/privacy/accessibility, repository-contract and deployment-gate regression tests.
- `.github/workflows/` — production baseline, protected-preview candidate and Lighthouse gates.
- `supabase/functions/` — public-safe versioned mirrors of production-facing Supabase runtime sources where disclosure is appropriate.
- `supabase/migrations/` — public-safe executable schema/RPC/access-control migrations; this directory is **not** a complete replayable copy of production migration history.
- `supabase/contracts/` — sanitized consolidated mirrors and migration-inventory boundaries for audit/recovery; these are not private row-data dumps.
- `docs/` — release, curation, security, RAG and production audit records.

Private Current Curated promoted rows are intentionally not published as a bulk SQL/data dump. Fake/no-op migration files and raw private production migration statements must not be added merely to satisfy an external history check.

See `docs/CURRENT_CURATED_R2_2026-08-13.md`, `docs/PRODUCTION_STATUS_V48_CURRENT_R2_2026-08-13.md` and `docs/FINAL_CURRENT_R2_PRODUCTION_AUDIT_2026-08-13.md` for the current rolling state and final audit.
