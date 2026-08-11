# CuHalide Atlas production hardening — v47

Date: 2026-08-10  
Final validation addendum: 2026-08-11  
Scientific release: **3.0.1**  
Scientific parent: **3.0.0**  
Frozen literature cutoff: **2026-06**

## Final production matrix

| Component | Version |
|---|---:|
| Public site | 47 |
| Public data | 2.6.0 |
| Public Smart RAG | 9.10.0 |
| Public metadata / health | 47.6 |
| Internal quota/exact gateway | 9.9.6-public-internal |
| Deterministic exact/anchor service | 10.2.2-exact-anchor-internal |
| Final internal orchestrator | 9.11.3-final-internal |
| Evidence-grain-safe retrieval core | 9.11.0-safe-core-internal |
| Bounded claims | qwen-claims-v9-1.3.0 |

This hardening changes the public query/runtime/index/presentation layer only. It does **not** rewrite the immutable 3.0.1 scientific archive.

## Public data architecture and least privilege

Public data uses private release-specific projections:

- `cuhalide_atlas_public_articles_v301`
- `cuhalide_atlas_public_structures_v301`

List/search/filter/count/pagination are performed server-side. Projection tables use RLS and explicit deny policies for `anon` and `authenticated`; those roles have neither direct SELECT nor projection-query RPC execution. `service_role` is limited to the access needed by the public read-only Edge Function.

A service-role-only health contract verifies frozen counts, Record 13 overlays, deterministic projection checksums, RLS/ACL invariants and selected query semantics.

## Evidence-aware structure semantics

Structure-level Cu–halide identity is derived conservatively:

- `Cu(I)` oxidation state does not imply iodide;
- compact `Cu2I4` and bridging `μ2-I` are recognized;
- ligand-bound halogens do not by themselves redefine the Cu–halide framework;
- unresolved/series-level variable-X records remain series-level rather than falsely phase-specific;
- single-letter halogen and short scientific search terms use token-aware matching.

Representative public values:

- `CUH-008-S01` → **I**;
- `CUH-162-S01` → **Cl/Br/I**;
- `CUH-013-S01` → **Unresolved** + erratum;
- `CUH-013-S02/S03/S04` → **0D**.

Article-level halogen filtering remains a separate article-grain contract: canonical `I` containment = **247**; exact canonical `Cl/Br/I` category = **27**.

## Physical structure RAG cleanup

The final hardening pass removed the last residual mismatch between public evidence-grain guards and the underlying private RAG corpus.

Before this pass, legacy structure documents still contained copied article-level titles, motif text and photophysical fields. Public guards prevented most leakage, but the stored index itself was not clean.

All **878** structure RAG documents were rebuilt from the structure-safe release projection and re-embedded with `@cf/baai/bge-m3` (1024 dimensions). Structure documents now contain identity/crystallography and evidence metadata only.

Final post-swap integrity checks:

| Check | Result |
|---|---:|
| Structure RAG docs | 878 |
| Valid 1024-d embeddings | 878 / 878 |
| Copied `Article:` fields | 0 |
| Copied `Structural motif:` fields | 0 |
| Copied `Emission:` / `Emission assignment` fields | 0 |
| Forbidden structure `llm_context` science keys | 0 |
| Content SHA mismatches | 0 |

The complete RAG index remains **1,224/1,224 embedded documents**: 346 article-grain scientific documents plus 878 structure identity/crystallography documents.

This is a physical index cleanup, not merely a runtime display filter.

## Smart RAG defense in depth

Current evidence-grain controls are cumulative:

1. public structure search is identity/crystallography-only;
2. public structure detail does not infer article-level motif/photophysics;
3. bounded-claims structure context excludes unmapped science fields;
4. the physical structure RAG corpus is identity/crystallography-only;
5. explicit structure-ID motif/photophysics questions preserve the structure/article boundary;
6. generic motif/photophysics answers pass through an outer structure-source guard;
7. same-record coexistence is not treated as automatic same-phase causality.

The Record 101 same-source protected route remains deterministic at **2.574 Å / 527 nm**. Exact service 10.2.2 additionally prevents the Record 95 single-record boundary from intercepting multi-record comparison questions.

## Frontend and browser QA

v47 includes:

- publication-growth window labelled **2006–2026.06** with earlier indexed records explicitly retained;
- structure-search scope and motif-boundary language;
- evidence-scope labels on RAG source cards;
- safe Markdown rendering with escaped arbitrary HTML;
- nested modal history/focus restoration;
- reduced-motion handling;
- focusable table scroll regions and semantic pager navigation;
- accessible method-step contrast;
- bounded client-side RAG timeout behavior.

A retained Playwright/Chromium production gate passed the live site on desktop, tablet and mobile. It checks public routes, serious/critical accessibility findings, page/console errors, horizontal overflow, responsive navigation, modal keyboard behavior, deep links, frozen denominators, evidence-grain boundaries, structure-halogen semantics, CSP and retired routes.

This is automated Chromium QA, not exhaustive Safari/Firefox/manual pixel-perfect certification.

## Final benchmark sequence

### Historical pre-reindex v1.4

Completed run `81eeab9f-3efb-4d19-bab0-7768acebfc4b`:

- exact 25/25;
- retrieval 25/25;
- reasoning 20/20;
- **70/70 PASS**.

### Post-reindex v1.4 diagnostic

Run `504d7921-20fd-46ff-b436-5223bb56903e` intentionally reused unchanged v1.4 gold and scored **66/70**. It was retained as failed diagnostic evidence.

Findings:

- RS02 exposed one genuine deterministic single-record overmatch, fixed in exact service **10.2.2**;
- EX16 and EX18 retained pre-clean structure-halogen count semantics;
- RT25 retained structure-document relevance for a query that explicitly asks to find an article.

Historical v1.4 gold was not edited.

### Final post-reindex v1.5

A versioned v1.5 suite cloned v1.4 and changed only EX16, EX18 and RT25, each with case-level provenance.

Final run `cdfd61ae-b382-433c-b877-6465a93a93b9`:

- exact/deterministic: **25/25**;
- retrieval: **25/25**;
- reasoning/scientific-boundary: **20/20**;
- **70/70 PASS**;
- release gate: **PASS**;
- paid overage authorized: **false**.

Revised structure-grain exact semantics:

- 2025 + 0D + `halogen_effective contains I` → **57 rows / 28 articles**;
- `halogen_effective contains Br` → **232 rows / 133 articles**.

RT25 now scores `A:58` at article grain for the article-finding query.

See [`RAG_BENCHMARK_V15_2026-08-11.md`](RAG_BENCHMARK_V15_2026-08-11.md) for the full rationale and historical [`RAG_BENCHMARK_V14_2026-08-11.md`](RAG_BENCHMARK_V14_2026-08-11.md).

## Temporary infrastructure cleanup

After the final v1.5 gate:

- temporary benchmark evaluator → retired response + `verify_jwt=true`;
- temporary structure-reembedding endpoint → retired response + `verify_jwt=true`;
- structure-rebuild staging table → removed;
- pre-swap rollback table → removed after successful gate;
- staging/apply RPCs → removed;
- Supabase security advisor → **0 findings**.

## Final live smoke matrix

| Check | Result |
|---|---:|
| `/health.json` | HTTP 200 / PASS |
| Public site | 47 |
| Public data | 2.6.0 |
| Public Smart RAG | 9.10.0 |
| Smart RAG mode | FULL |
| Meta / health | 47.6 |
| Scientific-context contract | PASS |
| Canonical articles | 332 |
| Article audit records | 346 |
| Core-Included structures | 816 |
| All structure rows | 878 |
| Strict-polar rows | 67 |
| Structure `STE` search | 0 |
| Structure `luminescence` search | 0 |
| Structure `I` search | 671 |
| Projection integrity/ACL contract | PASS |
| `/api/export` | HTTP 410 |
| `/sitemap.xml` MIME | application/xml; charset=utf-8 |
| Supabase security advisor | 0 findings |

## Frozen scientific denominators preserved

- article audit: 346;
- chemically included articles: 335;
- canonical verified articles: 332;
- structure/phase rows: 878;
- Core-Included structures: 816;
- resolved space-group rows: 650;
- verified one-to-one mappings: 625;
- verified polar rows: 87;
- strict-polar rows: 67;
- strict-polar articles: 42.

## Public/private boundary

The public portal remains query-and-view. Complete normalized tables, exact stored publisher abstracts, primary PDF/SI/CIF files, field-evidence excerpts/locators, complete QA/adjudication artifacts and candidate abstracts/scores/reason codes remain private. No public bulk export was reintroduced.
