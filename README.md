# CuHalide Atlas

**CuHalide Atlas** is an evidence-grounded, structure-resolved knowledge portal for organic-containing Cu(I) chlorides, bromides and iodides.

- Public website: https://cuhalide-atlas-v3.vercel.app/
- Frozen scientific release: **3.0.2** — 11 August 2026
- Parent release: **3.0.1** · lineage root **3.0.0**
- Frozen literature cutoff: **2026-06**
- Public site / data / Smart RAG / meta: **v48 / 2.7.0 / 9.12.0 / 48.0**
- Current Curated base: **3.0.2**, live revision **0** at publication
- Correction history: [`ERRATA.md`](ERRATA.md)

## Frozen scientific corpus

| Item | Count |
|---|---:|
| Article audit records | 346 |
| Chemically included articles | 335 |
| Canonical verified articles | 332 |
| Structure/phase rows | 878 |
| Core-included structure/phase rows | 816 |
| Resolved space-group rows | 650 |
| Verified one-to-one structure–space-group mappings | 625 |
| Verified polar rows | 87 |
| Strict polar rows | 67 |
| Strict polar articles | 42 |
| RAG documents / embeddings | 1,224 / 1,224 |

Release **3.0.2** is a narrow scientific hotfix over 3.0.1. It physically incorporates four confirmed Record 13 `Structural Dimensionality` corrections, adds no new literature, and changes none of the frozen scientific denominators above. Historical release 3.0.1 remains immutable.

## Frozen Release, Current Curated and Literature Watch

The maintenance model deliberately separates three evidence states:

1. **Frozen Release** — immutable and citable scientific snapshots such as 3.0.2.
2. **Current Curated** — primary-evidence-reviewed additions layered on the frozen base after quality control. These may update the live portal without rewriting the frozen release.
3. **Literature Watch** — metadata-only discovery candidates. Candidate discovery never authorizes a scientific claim or database inclusion.

The private curation state machine is:

`DISCOVERED → DEDUPED → TRIAGED → NOTIFIED → PRIMARY_EVIDENCE_RECEIVED → EXTRACTED → QC_PASSED → LIVE_CURATED → FORMAL_RELEASE`

with explicit `REJECTED` and `BLOCKED` states. Main article, SI and CIF evidence are requested as appropriate before promotion. DOI normalization/deduplication, chemical-scope adjudication, structure/phase expansion, crystallographic mapping, evidence-grain checks, RAG indexing and production regression must all pass before a candidate becomes Current Curated.

The publication-growth visualization uses the natural-year label **2026**. The frozen literature cutoff remains separately reported as **2026-06**; later primary-evidence-reviewed additions can increase the 2026 bar through Current Curated without falsifying the frozen-release cutoff.

## Public/private access model

The website is a **query-and-view scientific interface**, not a bulk redistribution endpoint. Public access is limited to selected bibliographic, structural, crystallographic and article-grain scientific fields; strict-polar queries; source-linked Smart RAG; metadata-only Literature Watch; methods; citation metadata; release identity; correction history; and aggregate Current Curated status.

The private research layer retains the complete normalized corpus, exact stored publisher abstracts, primary PDFs/SI/CIF payloads, field-evidence excerpts and locators, internal QA/adjudication artifacts, curation-queue internals, and candidate abstracts/scores/reason codes. The legacy bulk `/api/export` route remains retired.

## Public query architecture

Public data **2.7.0** uses release-specific, field-whitelisted projections derived from the immutable 3.0.2 snapshot:

- `cuhalide_atlas_public_articles_v302`
- `cuhalide_atlas_public_structures_v302`

Filtering, counting, sorting and pagination are server-side. Direct projection-table reads and projection-query RPC execution are disabled for `anon` and `authenticated`; the public read-only Edge Function returns only the public contract. Service-role-only contracts verify counts, projection checksums, RLS/ACL invariants, bootstrap denominators, structure-halogen semantics, Record 13 corrections and RAG-index compatibility.

The live portal is rendered from a version-controlled static scientific-interface shell by `api/site.js`; the renderer applies the release-3.0.2/v48 presentation contract and recomputes CSP hashes from the final HTML before serving the root page. The underlying historical shell is therefore not itself treated as the authoritative release identity.

## Structure-grain evidence boundary

Structure identity is resolved conservatively. `Cu(I)` oxidation-state notation is not treated as iodide; compact `Cu2I4` and bridging `μ2-I` notation are recognized; ligand-bound halogens do not by themselves redefine the Cu–halide identity; variable-X/series labels are not falsely promoted to phase-specific assignments; and short scientific tokens use token-aware search.

Article-level photophysics and unmapped motif text are not assigned to a structure/phase row. Public structure search/detail, bounded-claims context, explicit structure-ID boundaries, physical RAG documents and generic output guards all enforce this separation.

All **878** structure RAG documents are identity/crystallography-only and carry valid 1024-dimensional BGE-M3 embeddings. The complete 3.0.2 RAG index is **1,224/1,224 embedded documents**: 346 article-grain documents plus 878 structure documents. Release-transition integrity checks found:

- article content-SHA mismatches versus 3.0.1: **0**;
- unchanged structure content-SHA mismatches versus 3.0.1: **0**;
- intentionally changed Record 13 structure documents: **4**;
- forbidden structure `llm_context` science keys: **0**;
- copied article/motif/emission fields in structure documents: **0**.

## Record 13 correction history

Release 3.0.2 physically stores:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The four 3.0.1 errata are retained as historical audit metadata, marked resolved/superseded by 3.0.2. They no longer require a current-release display overlay and change no article, structure, space-group, verified, polar or strict-polar denominator.

## Smart RAG

Public Smart RAG **9.12.0** separates deterministic database truth from bounded model interpretation. Exact counts, protected record fields, scope decisions, correction-state facts and key scientific boundaries are deterministic. Retrieval uses structured/lexical plus semantic ranking with BGE-M3 and BGE reranking when free provider capacity is available. Model interpretation is accepted only through source-constrained claim validation. Live Monitor candidate metadata remains outside model-supported frozen scientific claims, and provider degradation enters a safe fallback mode instead of fabricating synthesis.

### Release-3.0.2 validation

Fresh **`rag-benchmark-v1.6`** passed **70/70** on release 3.0.2:

- exact/deterministic: **25/25**;
- retrieval: **25/25**;
- reasoning/scientific-boundary: **20/20**.

Run ID: `04bd93ec-cc3a-424b-9d8d-a1b08cec58ff`. Paid Workers AI overage was not authorized. The v1.6 case set preserves historical v1.5 rather than editing it in place. Literal release labels were rebased to 3.0.2; frozen scientific fact/count targets were unchanged. RS08 intentionally treats candidate/frozen separation as deterministic because Literature Watch metadata is not scientific evidence for frozen claims.

See [`docs/RAG_BENCHMARK_V16_2026-08-11.md`](docs/RAG_BENCHMARK_V16_2026-08-11.md) and [`docs/PRODUCTION_STATUS_V48_2026-08-11.md`](docs/PRODUCTION_STATUS_V48_2026-08-11.md).

## Browser-level production QA

A repository-retained **read-only Playwright/Chromium production gate** passed against the live release-3.0.2/v48 portal across desktop, tablet and mobile configurations. The release-specific gate validates public routes, health/manifest/RAG/public-data contracts, Current Curated presentation, Record 13 physical corrections, scientific denominators, structure-halogen semantics, serious/critical accessibility findings, page/console errors, horizontal overflow, responsive navigation, modal keyboard behavior, hash deep links, CSP hardening and retired routes.

This is current automated Chromium production QA; it is not a claim of exhaustive Safari/Firefox or manual pixel-perfect certification.

## Current production checks

At publication/finalization:

- `/health.json`: **HTTP 200 / PASS**;
- frozen release: **3.0.2**;
- public site: **v48**;
- public data: **2.7.0**;
- public Smart RAG: **9.12.0 / FULL** at the checked state;
- public meta/health: **48.0**;
- Current Curated: **base 3.0.2 / revision 0 / ready**;
- Supabase security advisor: **0 findings**;
- temporary benchmark/re-embedding/debug endpoints: retired or removed;
- real Chromium production gate: **PASS**.

## Scientific boundaries

1. Missing or unresolved values are never inferred from analogous compounds.
2. Non-centrosymmetric does not automatically mean polar.
3. Polar crystallography does not establish ferroelectricity.
4. Candidate metadata does not authorize release inclusion.
5. Retrieval absence is not evidence of literature absence.
6. Model output cannot override frozen fields, deterministic counts or evidence boundaries.
7. Same-article or same-record coexistence is not automatically same-phase causality.
8. Current Curated promotion requires primary-evidence review and QC; it is not an LLM-autonomous write path.

## Citation and rights

> CuHalide Atlas. Release 3.0.2 (11 August 2026). https://cuhalide-atlas-v3.vercel.app/

See [`CITATION.cff`](CITATION.cff), [`ERRATA.md`](ERRATA.md), [`LICENSE_STATUS.md`](LICENSE_STATUS.md), [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md). A permanent repository DOI has not yet been minted. No blanket permission is asserted for copyrighted third-party article content, and primary article/SI/CIF files are not redistributed through the public website.
