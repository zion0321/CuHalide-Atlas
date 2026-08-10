# CuHalide Atlas

**CuHalide Atlas** is an evidence-first, structure-resolved literature database and scientific retrieval system for organic-containing Cu(I) chlorides, bromides and iodides.

- Public website: https://cuhalide-atlas-v3.vercel.app/
- Current release: **3.0.1** — 10 August 2026
- Scientific parent: **3.0.0**
- Release archive: https://github.com/zion0321/CuHalide-Atlas/releases/tag/v3.0.1
- Release ZIP SHA-256: `f299b0872ec9b3a022741833b41ee4702848ec7c570afaac3f9e8a976deb4477`

## Frozen scientific corpus

| Item | Count |
|---|---:|
| Article audit records | 346 |
| Chemically included articles | 335 |
| Canonical verified articles | 332 |
| Structure/phase rows | 878 |
| Resolved space-group rows | 650 |
| Verified one-to-one structure–space-group mappings | 625 |
| Verified polar rows | 87 |
| Strict polar rows | 67 |
| Strict polar articles | 42 |
| RAG documents / embeddings | 1,224 / 1,224 |
| Field-evidence objects | 13,118 |

Release 3.0.1 is a **bibliographic-only patch** over the scientifically unchanged 3.0.0 corpus. It reviewed 217 DOI-linked titles, applied 72 canonical display-title replacements, retained 145 clean variants, reconstructed chemical typography in 12 complex titles and changed zero scientific records.

## Validation gates

- Frozen RAG benchmark: **70/70** (`rag-benchmark-v1.3`)
- Public production smoke: **17/17** (`production-smoke-v3.0.0`)
- Coverage protocol: **210/210** pre-registered page-0 query cells completed
- Candidate metadata screen: **1,788/1,788** DOI-unique candidates adjudicated
- Candidate decisions: 293 screened in scope, 357 boundary, 877 excluded, 261 rejected, 0 pending
- Automatic candidate inclusions into release 3.0.1: **0**
- AI expert-surrogate audit: 80 articles, 200 structures and 6,600 field/rule checks
- Public health gate: **PASS**
- Supabase security advisor: no remaining security findings at release closeout

## Important interpretation boundaries

1. `screened_in_scope` means that primary article/SI/CIF acquisition should be prioritized. It does **not** authorize release inclusion.
2. `screened_boundary` means that targeted primary-source adjudication is required.
3. Coverage-v1 completed page 0 for each declared query cell. It does **not** establish exhaustive provider pagination or external-corpus completeness.
4. The two-pass title, candidate and consistency audits are **AI expert-surrogate** procedures, not independent-human validation. Their results must not be reported as human–LLM precision, recall, F1 or inter-annotator agreement.
5. Missing and unresolved values are never imputed from analogous compounds.
6. Primary PDF/SI/CIF files remain private provenance sources and are not redistributed as a public full-text corpus.

## Public interfaces

| Interface | Endpoint |
|---|---|
| Website | https://cuhalide-atlas-v3.vercel.app/ |
| Health and release checks | https://cuhalide-atlas-v3.vercel.app/api/meta?action=health |
| Release manifest | https://cuhalide-atlas-v3.vercel.app/manifest.webmanifest |
| Citation metadata | https://cuhalide-atlas-v3.vercel.app/citation.cff |
| Data API | https://cuhalide-atlas-v3.vercel.app/api/data |
| Smart RAG | https://cuhalide-atlas-v3.vercel.app/api/agent |
| Versioned release export | https://cuhalide-atlas-v3.vercel.app/api/export?action=package-index |

## Reproducible release package

The `v3.0.1` GitHub release contains:

- normalized article, structure, verified-mapping and strict-polar data in JSON and CSV;
- all 70 frozen RAG benchmark cases and results;
- the complete 210-cell coverage protocol;
- all 1,788 candidate-screen-v4 decisions without candidate abstracts;
- all 6,600 surrogate-audit field/rule results;
- title decisions, patch audit, quality findings and field-evidence summaries;
- denominator, missingness and review/error taxonomies;
- the 0D Cu2I4 / STE–Cu···Cu evidence case study;
- methods, release, coverage, evaluation, security, contribution and DOI-deposition documentation;
- per-file and archive SHA-256 checksums.

The GitHub Actions workflow rebuilds the package from field-whitelisted read-only APIs and fails closed if any frozen invariant changes.

## Citation

Use the versioned resource and access date:

> CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/

Machine-readable citation metadata are provided in [`CITATION.cff`](CITATION.cff). A permanent repository DOI has not been minted; DOI deposition requires final creator, affiliation, ORCID, funding and license approval by the repository owner.

## License status

No top-level open-source or open-data license had been approved when release 3.0.1 was archived. See [`LICENSE_STATUS.md`](LICENSE_STATUS.md). Absence of a declared license must not be interpreted as permission to redistribute third-party copyrighted content.

## Security and contributions

See [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md). Scientific corrections must include a DOI, exact compound/phase identity and source-level evidence. Live Monitor candidates are never merged directly into a frozen release.
