# CuHalide Atlas

**CuHalide Atlas** is an evidence-grounded, structure-resolved knowledge portal for organic-containing Cu(I) chlorides, bromides and iodides.

- Public website: https://cuhalide-atlas-v3.vercel.app/
- Public release: **3.0.1** — 10 August 2026
- Scientific parent: **3.0.0**
- Frozen literature cutoff: **2026-06**
- Public site / data / Smart RAG / meta: **v47 / 2.6.0 / 9.10.0 / 47.6**
- Deterministic exact/anchor service: **10.2.2-exact-anchor-internal**
- Known errata: [`ERRATA.md`](ERRATA.md)

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

Release 3.0.1 is a bibliographic-only patch over scientific parent 3.0.0 and does not change the frozen scientific denominators.

## Public/private access model

The website is a **query-and-view scientific interface**, not a bulk redistribution endpoint. Public access is limited to selected bibliographic, structural, crystallographic and article-grain scientific fields; strict-polar queries; source-linked Smart RAG; metadata-only Literature Watch; methods; citation metadata; release identity; and errata.

The private research layer retains the complete normalized corpus, exact stored publisher abstracts, primary PDFs/SI/CIF payloads, field-evidence excerpts and locators, internal QA/adjudication artifacts, and candidate abstracts/scores/reason codes. The legacy bulk `/api/export` route remains retired. A manuscript-specific minimal reproducibility dataset should be prepared later if publication requirements make that necessary.

## Public query architecture

Public data 2.6.0 uses release-specific, field-whitelisted projections derived from the immutable 3.0.1 snapshot:

- `cuhalide_atlas_public_articles_v301`
- `cuhalide_atlas_public_structures_v301`

Filtering, counting, sorting and pagination are server-side. Direct projection-table reads and projection-query RPC execution are disabled for `anon` and `authenticated`; the public read-only Edge Function returns only the public contract. A service-role-only health contract verifies frozen counts, checksums, RLS/ACL invariants, errata overlays and selected query semantics.

## Structure-grain evidence boundary

Structure identity is resolved conservatively. `Cu(I)` oxidation-state notation is not treated as iodide; compact `Cu2I4` and bridging `μ2-I` notation are recognized; ligand-bound halogens do not by themselves redefine the Cu–halide identity; and short scientific tokens use token-aware search.

Article-level photophysics and unmapped motif text are not assigned to a structure/phase row. Public structure search/detail, bounded-claims context, explicit structure-ID boundaries and generic RAG output guards all enforce this separation.

The internal RAG corpus now enforces the same rule **physically**. All **878 structure RAG documents** were rebuilt from the structure-safe projection and re-embedded with BGE-M3 as identity/crystallography-only documents. Post-swap checks found:

- 878/878 valid 1024-dimensional structure embeddings;
- 0 copied `Article:` fields;
- 0 copied `Structural motif:` fields;
- 0 copied `Emission:` / `Emission assignment` fields;
- 0 forbidden structure `llm_context` science keys;
- 0 content-SHA mismatches.

The complete index remains **1,224/1,224 embedded documents**: 346 article-grain documents plus 878 structure identity/crystallography documents. This runtime/index hardening does not silently rewrite the immutable 3.0.1 scientific archive.

## Record 13 erratum

Effective public values are:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The erratum changes none of the frozen denominators above. Formal corrected scientific snapshot handling is reserved for 3.0.2.

## Smart RAG

The public Smart RAG separates deterministic database truth from bounded model interpretation. Exact counts, protected record fields, frozen scope decisions and key scientific boundaries are deterministic. Retrieval uses lexical/structured and semantic ranking with BGE-M3 plus BGE reranking when free external AI capacity is available. Model interpretation is accepted only through source-constrained claim validation. Candidate literature remains isolated from release evidence, and provider degradation enters **SAFE_FALLBACK** rather than fabricating synthesis.

### Final post-reindex validation

The final versioned **`rag-benchmark-v1.5`** run passed **70/70** after the physical structure-index rebuild:

- exact/deterministic: **25/25**;
- retrieval: **25/25**;
- reasoning/scientific-boundary: **20/20**.

Run ID: `cdfd61ae-b382-433c-b877-6465a93a93b9`  
Runtime label: `smart-rag-v9.11.3-evidence-grain-v2-structure-reindex-v2+exact-10.2.2`

The run used the free provider allocation only; paid overage was not authorized. A first post-reindex v1.4 diagnostic was retained as 66/70 because it exposed one real deterministic multi-record overmatch and three stale benchmark expectations inherited from pre-clean structure semantics. Historical v1.4 gold was not silently edited; v1.5 is an explicit versioned revision with case-level provenance.

See [`docs/RAG_BENCHMARK_V15_2026-08-11.md`](docs/RAG_BENCHMARK_V15_2026-08-11.md), [`docs/RAG_RUNTIME_V9.md`](docs/RAG_RUNTIME_V9.md) and the historical [`docs/RAG_BENCHMARK_V14_2026-08-11.md`](docs/RAG_BENCHMARK_V14_2026-08-11.md).

## Browser-level production QA

A repository-retained Playwright/Chromium production gate has passed against the live v47 portal across desktop, tablet and mobile viewports. It checks public routes, serious/critical accessibility findings, page/console errors, horizontal overflow, responsive navigation, modal keyboard behavior, hash deep links, frozen scientific denominators, evidence-grain boundaries, structure-halogen semantics, CSP hardening and retired routes. This does not claim exhaustive Safari/Firefox or manual pixel-perfect review.

## Current production checks

At the final completion check:

- `/health.json`: **HTTP 200 / PASS**;
- Smart RAG operational mode: **FULL**;
- scientific-context contract: **PASS**;
- `/sitemap.xml`: **application/xml; charset=utf-8**;
- Supabase security advisor: **0 findings**;
- temporary evaluator and structure-reembedding endpoints: **retired + JWT-required**;
- temporary reindex staging/rollback tables and staging/apply RPCs: **removed**.

## Scientific boundaries

1. Missing or unresolved values are never inferred from analogous compounds.
2. Non-centrosymmetric does not automatically mean polar.
3. Polar crystallography does not establish ferroelectricity.
4. Candidate metadata does not authorize release inclusion.
5. Retrieval absence is not evidence of literature absence.
6. Model output cannot override frozen fields, deterministic counts or evidence boundaries.
7. Same-article or same-record coexistence is not automatically same-phase causality.

## Citation and rights

> CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/

See [`CITATION.cff`](CITATION.cff), [`ERRATA.md`](ERRATA.md), [`LICENSE_STATUS.md`](LICENSE_STATUS.md), [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md). A permanent repository DOI has not yet been minted. No blanket permission is asserted for copyrighted third-party article content, and primary article/SI/CIF files are not redistributed through the public website.
