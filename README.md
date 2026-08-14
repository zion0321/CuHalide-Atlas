# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge portal for organic-containing Cu(I) chloride, bromide and iodide materials.

**Production:** https://cuhalide-atlas-v3.vercel.app/

## Public knowledge model

The public website is a **living scientific knowledge base**. It opens on the latest primary-evidence-reviewed corpus and is intended to keep moving forward as new literature is discovered, deduplicated, reviewed and quality-controlled.

Three states serve different purposes:

1. **Latest curated knowledge** — the default public experience. The current governed state is **Current Curated rev.3**, reviewed through **2026-08-14**. The revision identifier is retained for provenance and machine contracts; users do not need to choose it as a browsing mode.
2. **Literature Watch** — metadata-only discovery of newly indexed publications that have not yet completed primary-source review. A discovered DOI is not scientific evidence until promoted through the curation/QC workflow.
3. **Archived scientific snapshot 3.0.2** — the immutable reproducibility baseline, internally governed as **Frozen Release 3.0.2**. Its snapshot coverage was verified through **2026-06-30**. That date defines the archived snapshot only; it is **not a cutoff for the living database**.

The public interface therefore emphasizes **“Curated through [date]”** rather than asking users to choose between Frozen and Current. Exact frozen/current scope identifiers remain available in machine-readable metadata, APIs, health contracts and governance records for reproducibility.

## Scientific denominators

| Metric | Archived snapshot 3.0.2 | Latest curated state |
|---|---:|---:|
| Article audit records | 346 | 373 |
| Chemically included articles | 335 | 362 |
| Canonical verified articles | 332 | 359 |
| Structure / phase rows | 878 | 949 |
| Core-Included structure rows | 816 | 887 |
| Resolved space-group rows | 650 | 719 |
| Verified one-to-one SG mappings | 625 | 694 |
| Verified polar rows | 87 | 97 |
| Strict-polar rows | 67 | 77 |
| Strict-polar articles | 42 | 46 |
| RAG documents / embeddings | 1,224 / 1,224 | 1,322 / 1,322 |

Current Curated rev.3 contains **27 reviewed overlay articles** and **71 overlay structure/phase determinations** relative to archived snapshot 3.0.2. Nineteen overlay articles are coverage backfills dated on or before 2026-06-30; eight are later additions. The archived 3.0.2 denominators remain immutable.

### Rev.3 primary-evidence additions

Rev.3 adds three DOI-unique 2026 articles after main-article/SI/crystallographic review:

- `10.1021/acs.inorgchem.6c03055` — four SCXRD determinations spanning the reversible 0D `[Cu10I20]10−` / 1D `[Cu10I17]n7n−` system.
- `10.1002/smll.74688` — eight enantiomeric Cu4I4 determinations; R/S-3-methylmorpholine identities are cross-linked to previously curated identities rather than counted as new chemical identities.
- `10.1021/acs.cgd.6c00650` — two new Cu2I2(bpp)(phosphine) SCXRD structures; the previously reported CP-1 identity is linked to `CUH-158-S09` rather than duplicated.

## Curation flow

The target operating model is continuous rather than periodic:

`literature discovery → DOI deduplication → scope triage → primary article/SI/CIF review → structure/phase expansion → evidence extraction → QC → latest curated knowledge → RAG/index refresh → public interface`

“Latest” therefore means **latest scientifically reviewed state**, not merely the most recently indexed metadata. Literature Watch reduces discovery latency without allowing unverified metadata to silently enter scientific counts.

## Motif Atlas

The public **Motif Atlas** provides a structure-level taxonomy for Cu–halide building units without exposing the private curation corpus.

Primary material classes are:
- **Coordination**
- **Ionic / Hybrid Ionic**
- **All-in-One (AIO)**

Historical mixed/ambiguous labels remain **Unresolved legacy mapping** rather than being forced into a primary class.

Article reports, crystallographic determinations and normalized reported identities are deliberately separate denominators. The current taxonomy covers **949** structure/phase rows; **816** have a resolved normalized Cu–X motif and **133** remain motif-unresolved.

Motif Atlas schema **1.2** applies a conservative fractional/mixed-occupancy rule: a solid-solution or fractional Br/I label is **not truncated into an integer Cu–X motif**. Unless independent structure-grain evidence establishes a discrete core, the motif remains `Unresolved`. This corrected 15 legacy over-parsed rows without changing article, structure or crystallographic denominators.

Primary-evidence curated ligand/cation identities remain separate from legacy label-derived candidates; the latter are secondary hints rather than equivalent normalized identities.

## Production versions

- Archived scientific snapshot / internal Frozen Release: **3.0.2**
- Current governed rolling state: **Current Curated rev.3**, reviewed through **2026-08-14**
- Public site: **v48**
- UI/content layer: **48.4**
- Public Data: **2.10.0**
- Smart RAG: **9.15.0**
- Metadata / health: **48.4**
- Motif Atlas schema: **1.2**

## Public/private boundary

Public access is **query-and-view**, not bulk redistribution. Public interfaces expose selected bibliographic, structural, crystallographic, motif-taxonomy, scope and evidence-status fields through server-side field-whitelisted queries and stable record pages. Smart RAG uses source-linked public records and deterministic scientific boundaries.

Private research assets include complete normalized tables/raw payloads; exact stored publisher abstracts; primary PDF, SI and CIF archives; field-evidence excerpts and locators; candidate relevance scores, reason codes and source payloads; internal QA, adjudication and curation artifacts.

`/api/export` intentionally returns **HTTP 410 Gone**.

## Smart RAG 9.15

Smart RAG 9.15.0 combines the validated archived 3.0.2 evidence path with Current Curated rev.1–rev.3 incremental evidence, using unified BGE-M3 + lexical/RRF retrieval across **1,322** embedded documents. Protected counts, temporal scope, reviewed current records, Motif Atlas statistics and evidence-grain boundaries remain deterministic.

For ordinary questions, RAG uses the latest curated corpus. Archived temporal scope is selected only when a question explicitly asks for a historical/snapshot boundary. Model output cannot override governed denominators, human scope decisions, crystallographic mappings, motif taxonomy or evidence-grain boundaries.

## Record 13

Archived scientific snapshot 3.0.2 physically incorporates the confirmed dimensionality corrections:
- `CUH-013-S01` → **Unresolved**
- `CUH-013-S02` → **0D**
- `CUH-013-S03` → **0D**
- `CUH-013-S04` → **0D**

Historical 3.0.1 errata remain audit history only.

## Production governance

The default branch is protected by the active **Protect main production** ruleset. Production requires pull-request provenance, exact candidate deployment, strict Chromium/Lighthouse candidate and production checks, trusted Vercel status and a fail-closed deployment gate. Direct production promotion is rejected or safely skipped unless provenance and required checks can be verified.

Supabase production schema/data changes are governed separately from the public repository. The public `supabase/` tree intentionally contains a public-safe subset rather than the complete private production migration ledger. Supabase GitHub Automatic branching / Deploy-to-production integration is not an authoritative path for this repository and has been disconnected to avoid a false migration-history signal.

## Citation and reproducibility

For the **living atlas**, cite CuHalide Atlas with an **access date** (and the relevant primary literature). The public interface reports the latest curation date; the internal live revision remains machine-readable for precise provenance.

For an exact historical denominator or manuscript snapshot, cite **CuHalide Atlas archived scientific snapshot 3.0.2 (11 August 2026)**, internally identified as Frozen Release 3.0.2, with snapshot coverage verified through **30 June 2026**.

Literature Watch candidates are not curated evidence and should not be cited as Atlas scientific records until promoted through primary-evidence review and QC.

Permanent repository DOI and blanket project licensing are not asserted until owner-authorized archival metadata and rights decisions are complete.

## Repository layout

- `api/` — Vercel read-only public handlers and stable record/sitemap/Motif Atlas rendering.
- `public/` — version-controlled interface template and presentation assets.
- `tests/` — browser/scientific/privacy/accessibility, repository-contract and deployment-gate regression tests.
- `.github/workflows/` — production baseline, protected-preview candidate and Lighthouse gates.
- `supabase/functions/` — public-safe versioned mirrors of production-facing Supabase runtime sources where disclosure is appropriate.
- `supabase/migrations/` — public-safe executable schema/RPC/access-control migrations; not a complete replayable copy of production migration history.
- `supabase/contracts/` — sanitized consolidated mirrors and migration-inventory boundaries for audit/recovery; not private row-data dumps.
- `docs/` — release, curation, security, RAG, information-architecture and production audit records.

Private Current Curated promoted rows are intentionally not published as a bulk SQL/data dump. Fake/no-op migration files and raw private production migration statements must not be added merely to satisfy an external history check.

See `docs/CURRENT_CURATED_R3_2026-08-14.md` for the governed rolling state and `docs/PUBLIC_INFORMATION_ARCHITECTURE_2026-08-14.md` for the public living-knowledge presentation model.
