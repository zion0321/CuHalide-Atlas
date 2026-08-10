# CuHalide Atlas

**CuHalide Atlas** is an evidence-first, structure-resolved literature database and scientific retrieval system for organic-containing Cu(I) chlorides, bromides and iodides.

- Public website: https://cuhalide-atlas-v3.vercel.app/
- Current release: **3.0.1** — 10 August 2026
- Scientific parent: **3.0.0**
- Current public site snapshot: **v44**
- Current Smart RAG runtime: **9.9.1**
- Release archive: https://github.com/zion0321/CuHalide-Atlas/releases/tag/v3.0.1
- Release ZIP SHA-256: `f299b0872ec9b3a022741833b41ee4702848ec7c570afaac3f9e8a976deb4477`
- Known errata: [`ERRATA.md`](ERRATA.md)

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

Release 3.0.1 is a **bibliographic-only patch** over the 3.0.0 scientific parent. The 3.0.1 patch itself changed zero scientific fields: it reviewed 217 DOI-linked titles, applied 72 canonical display-title replacements, retained 145 clean variants and reconstructed chemical typography in 12 complex titles.

### Known post-publication erratum

A fresh post-publication QA pass identified an **inherited Record 13 structure-dimensionality mapping error** in four structure rows. Correct effective values are:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The error does not alter article counts, structure counts, space-group counts, verified/polar/strict-polar subsets or canonical denominators. The archived 3.0.1 ZIP remains immutable. Public website, API, downloads and Smart RAG expose transparent effective/erratum fields; formal snapshot-level correction is planned for scientific hotfix **3.0.2**. See [`ERRATA.md`](ERRATA.md).

## Smart RAG v9 production architecture

Smart RAG **9.9.1** separates scientific rules, retrieval and model interpretation instead of asking the LLM to decide database truth.

1. **Deterministic scientific layer** handles exact denominators, record properties, unresolved values, scope boundaries, false premises, Record 13 effective dimensionality, Evidence-D exclusion, polarity/ferroelectric boundaries and material-specific STE–Cu···Cu relation guards.
2. **Retrieval layer** uses the release-3.0.1 effective index, precision search, full-text search, pgvector/BGE-M3 reciprocal-rank fusion and `@cf/baai/bge-reranker-base` reranking when the free Workers AI provider is available.
3. **Interpretation layer** uses `@cf/qwen/qwen3-30b-a3b-fp8` only for bounded scientific interpretation. Qwen must call `submit_claims`; each accepted claim has one source, one allowed claim type and a short verbatim support fragment from that same source. The server rejects unsupported numbers, cross-paper mechanism stitching, speculation, recommendation language, universal causality and unsupported mechanism assignments.
4. **Scientific-context whitelist** prevents title aliases, DOI title variants, title-adjudication records, search text and review/version metadata from entering Qwen's scientific context.
5. **Live Monitor isolation** keeps `candidate-screen-v4` metadata separate from frozen scientific evidence. Candidate records never support release-3.0.1 claims and never receive automatic release inclusion.
6. **Free-provider circuit breaker** does not purchase paid Workers AI overage. If the free daily allocation is unavailable, the public RAG automatically uses deterministic `precision_search_v9` lexical/metadata retrieval while preserving exact scientific rules and the normal public rate limit. After cooldown, the first ordinary scientific request automatically probes provider recovery and returns the circuit to full-AI mode if successful.

The public health endpoint reports `FULL_AI`, `DEGRADED_SAFE_FALLBACK` or `PROBE_DUE_SAFE_FALLBACK` rather than hiding provider degradation.

## Validation gates

- Legacy frozen scientific RAG benchmark: **70/70** (`rag-benchmark-v1.3`). This run predates the final v9 orchestration layer and is retained as a scientific regression baseline; it is **not represented as a fresh final-v9 benchmark**.
- Smart RAG v9 deterministic exact/anchor regression: **33/33**.
- Smart RAG v9 real BGE-M3 + reranker retrieval regression: **25/25**.
- Smart RAG v9 public production smoke: **6/6**, plus **3/3** post-circuit-patch smoke on runtime 9.9.1.
- Original v8 public production smoke: **17/17**, retained as rollback-history evidence.
- Frontend/production regression before the v44 runtime disclosure update: **15/15** (`frontend-selftest-v43.0`); the v44 site retains the same executable frontend and adds the v9 disclosure/health contract.
- Public health gate: **PASS**, including browser bootstrap contract, candidate counts, Record 13 public erratum overlay, RAG 9.9.1 contract, safe provider circuit, production smoke and site-snapshot integrity.
- Coverage protocol: **210/210** pre-registered page-0 query cells completed.
- Candidate metadata screen: **1,788/1,788** DOI-unique candidates adjudicated.
- Candidate decisions: 293 screened in scope, 357 boundary, 877 excluded, 261 rejected, 0 pending.
- Primary-evidence acquisition queue: **650** screened-in/boundary candidates.
- Automatic candidate inclusions into release 3.0.1: **0**.
- AI expert-surrogate audit: 80 articles, 200 structures and 6,600 field/rule checks.

The expert-surrogate audit is an internal consistency/evidence audit; it is not independent-human extraction accuracy and is **not proof that every field is error-free**. The Record 13 erratum is the reason this boundary is stated explicitly.

Because the controlled v9 validation exhausted the free Workers AI allocation on 10 August 2026, a fresh full 70-case Qwen-enabled run was not executed after the final orchestration patch. Paid overage was deliberately not enabled. The production runtime instead passed its quota-exhausted fallback tests and exposes that operational state publicly.

## Important interpretation boundaries

1. `screened_in_scope` means that primary article/SI/CIF acquisition should be prioritized. It does **not** authorize release inclusion.
2. `screened_boundary` means that targeted primary-source adjudication is required.
3. Coverage-v1 completed page 0 for each declared query cell. It does **not** establish exhaustive provider pagination or external-corpus completeness.
4. The two-pass title, candidate and consistency audits are **AI expert-surrogate** procedures, not independent-human validation. Their results must not be reported as human–LLM precision, recall, F1 or inter-annotator agreement.
5. Missing and unresolved values are never imputed from analogous compounds.
6. Primary PDF/SI/CIF files remain private provenance sources and are not redistributed as a public full-text corpus.
7. For a structure with a disclosed erratum, public API consumers should use `Structural Dimensionality (Effective)` for current presentation while retaining `Structural Dimensionality` as the reproducible archived 3.0.1 value.
8. A polar or non-centrosymmetric structure is not evidence of ferroelectricity unless direct ferroelectric evidence is stored.
9. Retrieval absence is not equivalent to literature absence.
10. LLM output cannot override frozen database fields, deterministic denominators or source-level evidence boundaries.

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

The immutable `v3.0.1` GitHub release contains:

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

Because the archive is immutable, its Record 13 raw dimensionality cells remain as originally published. The public erratum register and effective API fields must be consulted when using those four cells. Runtime v9 changes are operational software changes and do not rewrite the immutable 3.0.1 scientific archive.

## Citation

Use the versioned resource and access date, and consult the known-errata register:

> CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/

Machine-readable citation metadata are provided in [`CITATION.cff`](CITATION.cff). A permanent repository DOI has not been minted; DOI deposition requires final creator, affiliation, ORCID, funding and license approval by the repository owner.

## License status

No top-level open-source or open-data license had been approved when release 3.0.1 was archived. See [`LICENSE_STATUS.md`](LICENSE_STATUS.md). Absence of a declared license must not be interpreted as permission to redistribute third-party copyrighted content.

## Security and contributions

See [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md). Scientific corrections must include a DOI, exact compound/phase identity and source-level evidence. Live Monitor candidates are never merged directly into a frozen release.
