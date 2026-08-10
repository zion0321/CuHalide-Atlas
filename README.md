# CuHalide Atlas

**CuHalide Atlas** is an evidence-first, structure-resolved literature database and scientific retrieval system for organic-containing Cu(I) chlorides, bromides and iodides.

- Public website: https://cuhalide-atlas-v3.vercel.app/
- Current release: **3.0.1** — 10 August 2026
- Scientific parent: **3.0.0**
- Current public site snapshot: **v44**
- Current Smart RAG runtime: **9.9.2**
- Release archive: https://github.com/zion0321/CuHalide-Atlas/releases/tag/v3.0.1
- Release ZIP SHA-256: `f299b0872ec9b3a022741833b41ee4702848ec7c570afaac3f9e8a976deb4477`
- Known errata: [`ERRATA.md`](ERRATA.md)
- RAG runtime documentation: [`docs/RAG_RUNTIME_V9.md`](docs/RAG_RUNTIME_V9.md)

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

Release 3.0.1 is a **bibliographic-only patch** over the 3.0.0 scientific parent. The patch itself changed zero scientific fields: 217 DOI-linked titles were reviewed, 72 canonical display-title replacements were applied, 145 clean variants were retained and 12 chemically complex titles received notation reconstruction.

### Known post-publication erratum

A post-publication QA pass identified an inherited Record 13 `Structural Dimensionality` mapping error in four structure rows. Effective values are:

- `CUH-013-S01` / pip6Cu10I16 → **Unresolved**;
- `CUH-013-S02` / pyr4Cu4Br8 → **0D**;
- `CUH-013-S03` / pyr4Cu4I8 → **0D**;
- `CUH-013-S04` / pyrCu2Br3 → **0D**.

The erratum does not alter article/structure counts, crystallographic counts, verified/polar/strict-polar subsets or canonical denominators. The archived 3.0.1 ZIP is immutable. Public website, API, downloads and Smart RAG expose transparent Effective/erratum fields; formal snapshot-level correction is reserved for scientific hotfix **3.0.2**. See [`ERRATA.md`](ERRATA.md).

## Smart RAG v9 production architecture

Smart RAG **9.9.2** separates database truth, retrieval and model interpretation.

1. **Deterministic science** handles exact denominators, record properties, unresolved values, scope boundaries, false premises, Record 13 effective dimensionality, Evidence-D exclusion, polarity/ferroelectric boundaries and material-specific STE–Cu···Cu relation guards.
2. **Retrieval** uses the release-3.0.1 effective index, precision search, FTS, pgvector/BGE-M3 reciprocal-rank fusion and `@cf/baai/bge-reranker-base` when the free Workers AI provider is available.
3. **Bounded interpretation** uses `@cf/qwen/qwen3-30b-a3b-fp8` only through the JWT-protected `submit_claims` service. Each accepted claim has one source, an allowed claim type and a same-source verbatim support fragment. Unsupported numbers, speculation, recommendations, universal causality and cross-paper mechanism stitching are rejected.
4. **Scientific-context whitelist** excludes historical title aliases, DOI title variants, title-adjudication records, search text and review/version metadata from Qwen's context.
5. **Live Monitor isolation** keeps `candidate-screen-v4` metadata outside frozen scientific evidence and prevents automatic release inclusion.
6. **Provider circuit breaker** never purchases paid Workers AI overage. When the free allocation is unavailable, ordinary queries use deterministic `precision_search_v9` fallback; exact/protected scientific rules continue normally. Provider recovery is probed automatically after cooldown.
7. **Single public RAG entrypoint**: only `https://cuhalide-atlas-v3.vercel.app/api/agent` is anonymous. The quota gateway, final orchestrator, retrieval core, Qwen claim service, candidate search and lexical fallback are JWT/service-role internal services. The retrieval core contains **no free-form LLM reasoning**. The superseded public v9 core is retired.

The public health endpoint reports `FULL_AI`, `DEGRADED_SAFE_FALLBACK` or `PROBE_DUE_SAFE_FALLBACK`; provider degradation is not hidden.

## Validation gates

- Legacy frozen scientific RAG benchmark: **70/70** (`rag-benchmark-v1.3`). This predates the final v9 orchestration and is retained only as a scientific regression baseline; it is **not** represented as a fresh final-v9 benchmark.
- Smart RAG v9 deterministic exact/anchor regression: **33/33**.
- Smart RAG v9 real BGE-M3 + reranker retrieval regression: **25/25**.
- Smart RAG v9 public smoke: **6/6**.
- Post-circuit-patch smoke: **3/3**.
- Internal-chain hardening smoke: **7/7** — the internal core, final orchestrator, quota gateway and retired legacy core each rejected anonymous access with HTTP 401 while production health, exact statistics and fallback remained available.
- Public health gate: **PASS**, including `internal_rag_chain_security=true`.
- Supabase security advisor after hardening: **0 findings**.
- Original v8 public production smoke: **17/17**, retained as rollback-history evidence; rollback target remains **8.3.0**.
- Frontend regression: **15/15** (`frontend-selftest-v43.0`); site v44 retains that executable frontend and adds the v9 disclosure/health contract.
- Coverage protocol: **210/210** pre-registered page-0 query cells completed.
- Candidate metadata screen: **1,788/1,788** DOI-unique candidates adjudicated: 293 screened in scope, 357 boundary, 877 excluded, 261 rejected, 0 pending.
- Primary-evidence acquisition queue: **650** screened-in/boundary candidates; automatic release inclusions: **0**.
- AI expert-surrogate audit: 80 articles, 200 structures and 6,600 field/rule checks.

The expert-surrogate audit is an internal consistency/evidence audit, not independent-human extraction accuracy and not proof that every field is error-free.

Controlled v9 validation exhausted the free Workers AI allocation on 10 August 2026. Paid overage was deliberately not enabled. Therefore a fresh full 70-case Qwen-enabled run was not executed after final v9 orchestration. Production instead passed the v9-specific deterministic, retrieval, public-smoke, quota-fallback and internal-chain tests above and exposes its operational provider state publicly.

## Important interpretation boundaries

1. `screened_in_scope` means primary article/SI/CIF acquisition should be prioritized; it does **not** authorize release inclusion.
2. `screened_boundary` requires targeted primary-source adjudication.
3. Coverage-v1 completed page 0 for each declared query cell; it does **not** establish exhaustive provider pagination or external-corpus completeness.
4. AI expert-surrogate audits are not independent-human validation and cannot be reported as human–LLM precision, recall, F1 or inter-annotator agreement.
5. Missing and unresolved values are never inferred from analogous compounds.
6. Primary PDF/SI/CIF files remain private provenance sources and are not redistributed as a public full-text corpus.
7. For disclosed errata, use the public `Effective` field for current presentation while retaining the archived raw field for 3.0.1 reproducibility.
8. Polar or non-centrosymmetric crystallography does not establish ferroelectricity without direct ferroelectric evidence.
9. Retrieval absence is not literature absence.
10. LLM output cannot override frozen fields, deterministic denominators or evidence boundaries.

## Public interfaces

| Interface | Endpoint |
|---|---|
| Website | https://cuhalide-atlas-v3.vercel.app/ |
| Health | https://cuhalide-atlas-v3.vercel.app/api/meta?action=health |
| Release manifest | https://cuhalide-atlas-v3.vercel.app/manifest.webmanifest |
| Citation metadata | https://cuhalide-atlas-v3.vercel.app/citation.cff |
| Data API | https://cuhalide-atlas-v3.vercel.app/api/data |
| Smart RAG | https://cuhalide-atlas-v3.vercel.app/api/agent |
| Versioned release export | https://cuhalide-atlas-v3.vercel.app/api/export?action=package-index |

## Reproducible release package

The immutable `v3.0.1` GitHub release contains normalized article/structure/verified/strict-polar data, all 70 legacy frozen benchmark cases/results, the 210-cell coverage protocol, all 1,788 candidate-screen decisions, all 6,600 surrogate-audit checks, title/patch/quality/evidence summaries, taxonomies, the 0D Cu2I4 / STE–Cu···Cu case study, methods/security/deposition documentation and SHA-256 checksums.

Runtime v9 changes are operational software changes and do not rewrite the immutable 3.0.1 archive.

## Citation

> CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/

Consult [`CITATION.cff`](CITATION.cff) and [`ERRATA.md`](ERRATA.md). A permanent repository DOI has not yet been minted because creator, affiliation, ORCID, funding and license approval remain owner-authorized actions.

## License status

No top-level open-source or open-data license had been approved when release 3.0.1 was archived. See [`LICENSE_STATUS.md`](LICENSE_STATUS.md). Absence of a license is not permission to redistribute third-party copyrighted content.

## Security and contributions

See [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md). Scientific corrections require DOI, exact compound/phase identity and source-level evidence. Live Monitor candidates are never merged directly into a frozen release.
