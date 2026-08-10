# CuHalide Atlas

**CuHalide Atlas** is an evidence-grounded, structure-resolved knowledge portal for organic-containing Cu(I) chlorides, bromides and iodides.

- Public website: https://cuhalide-atlas-v3.vercel.app/
- Public release: **3.0.1** — 10 August 2026
- Scientific parent: **3.0.0**
- Literature inclusion cutoff for the frozen corpus: **June 2026 (2026-06)**
- Public site: **v45**
- Public data contract: **2.2.1**
- Smart RAG public gateway: **9.9.6**
- Public metadata/health contract: **45.8**
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

Release 3.0.1 is a bibliographic-only patch over the scientific 3.0.0 parent. The patch changed bibliographic title presentation without changing frozen scientific denominators.

## Public access model

The website is intentionally a **query-and-view scientific interface**, not a bulk redistribution endpoint.

Publicly available:

- server-side search of selected article fields;
- server-side search of selected structure/phase fields;
- single-record bibliographic, structural and crystallographic views plus selected article-grain photophysics;
- the strict-polar subset through paginated query results;
- evidence-grounded Smart RAG answers with source-linked records;
- recent Literature Watch titles, years, journals and DOIs under review;
- methods, citation metadata, release identity and known errata.

Kept in the private research corpus:

- complete normalized CSV/JSON/XLSX tables;
- exact stored publisher abstracts and internal search-helper fields;
- primary article PDFs, supporting information and CIF payloads;
- field-evidence excerpts and source locators;
- complete QA logs, adjudication artifacts and candidate-screening internals;
- candidate abstracts, relevance scores and screening reason codes.

If a manuscript requires a reproducibility deposit, a **manuscript-specific minimal dataset** should be prepared for that analysis rather than publishing the complete internal knowledge base.

## Structure-grain evidence boundary

Public structure records now enforce an explicit evidence-grain boundary:

1. structure halogen identity is derived from the explicit structure formula where possible, with Cu(I) oxidation-state notation excluded from halogen parsing;
2. compact formula forms such as `Cu2I4` and bridging notation such as `μ2-I` are handled as iodide rather than falling back to an article-level mixed-halogen label;
3. article-level photophysical values are not assigned to an individual structure/phase unless an independent structure-grain evidence mapping exists;
4. structure search does not use article-level emission text or article-title photophysics as structure evidence;
5. the bounded-claims service receives structure crystallography/identity fields but excludes structure-level motif and photophysics when no independent mapping has been established.

These rules affect public presentation and retrieval safety only; they do not silently rewrite the immutable 3.0.1 archive.

## Known Record 13 erratum

A post-publication QA pass identified an inherited `Structural Dimensionality` list-position mapping error in four Record 13 structure rows. Effective public values are:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The erratum does not alter article counts, structure counts, crystallographic counts, verified/polar/strict-polar subsets or canonical denominators. The immutable 3.0.1 scientific archive is not silently rewritten; formal snapshot correction is reserved for scientific hotfix 3.0.2.

## Smart RAG

The public Smart RAG interface separates database truth from model interpretation:

1. exact denominators, protected crystallographic rules, unresolved values and key scientific boundaries are deterministic;
2. retrieval combines structured/lexical and semantic ranking when the external AI service is available;
3. bounded model interpretation is accepted only when claims pass source-level evidence constraints;
4. the claims context is loaded from a JWT-protected internal scientific contract rather than the minimized public data API;
5. an independent contract-health probe verifies that the bounded-claims scientific context remains populated after public API changes;
6. Live Literature Watch candidates remain separate from frozen release evidence;
7. when external AI capacity is unavailable, the public service enters **SAFE_FALLBACK** and uses evidence retrieval instead of fabricating synthesis;
8. structure-grain photophysics are suppressed from ordinary photophysics answers unless an explicit structure-grain mapping or a protected same-record boundary route applies.

The current public gateway reports provider degradation explicitly. Paid Workers AI overage is not authorized. Internal provider configuration, retrieval scores, hidden traces and service credentials are not part of the public response contract.

### Validation boundary

The frozen `rag-benchmark-v1.3` scientific baseline passed **70/70**, but it predates the final Smart RAG v9 orchestration and must not be presented as a fresh 9.9.6 benchmark. The v9 deployment sequence separately passed deterministic exact/anchor and hybrid-retrieval regressions. A new full Qwen-enabled benchmark is required after external free-provider capacity is available again.

## Important scientific boundaries

1. Missing or unresolved values are never inferred from analogous compounds.
2. Non-centrosymmetric does not automatically mean polar.
3. Polar crystallography does not establish ferroelectricity.
4. Candidate metadata does not authorize release inclusion.
5. Retrieval absence is not evidence of literature absence.
6. Model output cannot override frozen fields, deterministic counts or evidence boundaries.
7. Same-article or same-record coexistence is not automatically same-phase causality.

## Public interfaces

| Interface | Endpoint |
|---|---|
| Website | https://cuhalide-atlas-v3.vercel.app/ |
| Public health | https://cuhalide-atlas-v3.vercel.app/health.json |
| Public release manifest | https://cuhalide-atlas-v3.vercel.app/release-manifest.json |
| Citation metadata | https://cuhalide-atlas-v3.vercel.app/citation.cff |
| Public-lite query API | https://cuhalide-atlas-v3.vercel.app/api/public-data |
| Smart RAG | https://cuhalide-atlas-v3.vercel.app/api/agent |

The legacy `/api/data` route is compatibility-only and returns the same minimized public contract. The former bulk `/api/export` route is retired.

## Citation

> CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/

See [`CITATION.cff`](CITATION.cff) and [`ERRATA.md`](ERRATA.md). A permanent repository DOI has not been minted.

## License and third-party content

No blanket permission is asserted for copyrighted third-party article content. Primary articles, SI and CIF files are not redistributed through the public website. See [`LICENSE_STATUS.md`](LICENSE_STATUS.md).

## Security and contributions

See [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md). Scientific corrections require a DOI, exact compound/phase identity and source-level evidence. Literature Watch candidates are never merged directly into a frozen release.
