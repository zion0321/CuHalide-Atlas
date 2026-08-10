# CuHalide Atlas

**CuHalide Atlas** is an evidence-grounded, structure-resolved knowledge portal for organic-containing Cu(I) chlorides, bromides and iodides.

- Public website: https://cuhalide-atlas-v3.vercel.app/
- Public release: **3.0.1** — 10 August 2026
- Scientific parent: **3.0.0**
- Frozen literature cutoff: **June 2026 (2026-06)**
- Public site: **v47**
- Public data contract: **2.4.1**
- Smart RAG public gateway: **9.9.9**
- Public metadata/health contract: **47.1**
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

Release 3.0.1 is a bibliographic-only patch over scientific parent 3.0.0. The patch changed bibliographic title presentation without changing frozen scientific denominators.

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

## Public query architecture

Public data 2.4.1 does not reconstruct the complete 346-row article or 878-row structure snapshot for every list/search request. Instead it uses private, release-specific, field-whitelisted query projections derived from the immutable 3.0.1 snapshot:

- `cuhalide_atlas_public_articles_v301`
- `cuhalide_atlas_public_structures_v301`

Normal list/search/filter/pagination requests are executed through server-side SQL query functions. The projection tables and query functions are not directly readable/executable by `anon` or `authenticated`; the public read-only Edge Function invokes them with the service role and returns only the public contract.

The immutable release snapshot remains the release-integrity source. Projection rows apply only explicitly documented effective overlays such as the Record 13 dimensionality erratum.

A service-role-only projection health contract continuously checks frozen row counts, strict-polar and erratum counts, deterministic projection checksums, RLS/ACL invariants and selected query semantics. In release 3.0.1 it also protects the article-halogen contract: the canonical `I` filter includes mixed-I records (**247** articles), while an explicit mixed label such as `Cl/Br/I` remains an exact category (**27** articles).

## Structure-grain evidence boundary

Public structure records enforce an explicit evidence-grain boundary:

1. structure halogen identity is derived from explicit Cu–halide formula/connectivity notation where possible, with Cu(I) oxidation-state notation excluded from halogen parsing;
2. compact formula forms such as `Cu2I4` and bridging notation such as `μ2-I` are handled as iodide;
3. ligand-bound halogen atoms do not by themselves reclassify the Cu–halide identity;
4. single-letter halogen searches are tokenized rather than substring matched;
5. article-level photophysical values are not assigned to an individual structure/phase unless an independent structure-grain evidence mapping exists;
6. structure search excludes article titles, article-level photophysics and unmapped motif text;
7. public structure detail does not infer a motif from an article-level series summary;
8. bounded-claims structure context excludes motif and photophysics unless independently mapped.

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
2. retrieval combines structured/lexical and semantic ranking when external AI capacity is available;
3. bounded model interpretation is accepted only when claims pass source-level evidence constraints;
4. claims context is loaded from a JWT-protected internal scientific contract rather than the minimized public data API;
5. an independent contract-health probe verifies that bounded-claims scientific context remains populated after public-API changes;
6. Live Literature Watch candidates remain separate from frozen release evidence;
7. provider degradation enters **SAFE_FALLBACK** and uses evidence retrieval instead of fabricating synthesis;
8. explicit structure-ID questions about motif or photophysics are routed through a deterministic evidence-grain boundary that separates structure crystallography from article-grain evidence;
9. generic motif/photophysics responses receive a second public outer guard that removes unmapped structure sources;
10. browser traffic receives a one-way per-client fingerprint so anonymous users do not share one fixed RAG rate bucket; raw client IPs are not forwarded into the internal chain;
11. public POST bodies and chat history are bounded at both Vercel and Supabase gateway layers.

Internal provider configuration, retrieval scores, hidden traces and service credentials are not part of the public response contract.

### Validation boundary

The frozen `rag-benchmark-v1.3` scientific baseline passed **70/70**, but it predates the final Smart RAG v9 orchestration and must not be presented as a fresh **9.9.9** benchmark. The v9 deployment sequence separately passed deterministic exact/anchor and hybrid-retrieval regressions. A new full Qwen-enabled benchmark is required before a current-runtime 70-case result can be claimed.

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

The release-specific public projections use RLS plus explicit deny policies for untrusted roles. Direct `anon`/`authenticated` table reads and query-function execution are disabled; the service role has SELECT-only access to the projection tables. Projection integrity/ACL invariants are part of the production health contract, and Supabase security lint is required to remain clear after schema changes.

See [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md). Scientific corrections require a DOI, exact compound/phase identity and source-level evidence. Literature Watch candidates are never merged directly into a frozen release.
