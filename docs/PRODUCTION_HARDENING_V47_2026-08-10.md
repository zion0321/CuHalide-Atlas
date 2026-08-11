# CuHalide Atlas production hardening — v47

Date: 2026-08-10  
Validation addendum: 2026-08-11  
Scientific release: 3.0.1  
Scientific parent: 3.0.0  
Frozen literature cutoff: 2026-06

## Scope

This hardening pass addressed residual production risks after the v46 repair. It changes the public query/runtime/presentation layer only and does **not** rewrite the immutable release-3.0.1 scientific snapshot.

Current production matrix after the 11 August validation addendum:

| Component | Version |
|---|---:|
| Public site | 47 |
| Public data contract | 2.6.0 |
| Smart RAG public gateway | 9.10.0 |
| Public metadata / health | 47.6 |
| Internal quota/exact gateway | 9.9.6-public-internal |
| Deterministic exact/anchor service | 10.2.1-exact-anchor-internal |
| Final internal orchestrator | 9.11.3-final-internal |
| Evidence-grain-safe retrieval core | 9.11.0-safe-core-internal |
| Bounded claims | qwen-claims-v9-1.3.0 |

## 1. Public data query architecture

### Previous residual issue

The public API already returned minimized fields and server-side pagination, but its Edge Function still reconstructed complete release arrays for list/search requests before applying filters. That preserved privacy but added unnecessary latency and kept a large all-record object in the request path.

### v47 solution

Two release-specific private query projections were created from the immutable 3.0.1 payload:

- `public.cuhalide_atlas_public_articles_v301`
- `public.cuhalide_atlas_public_structures_v301`

They contain only fields required for the public query/detail contract. Public list/filter/count/pagination requests now execute through service-role-only SQL functions:

- `cuhalide_atlas_public_articles_query_v301(...)`
- `cuhalide_atlas_public_structures_query_v301(...)`

The immutable snapshot remains the source for release-integrity health/bootstrap checks. Record 13 uses its documented effective display overlay in the release-specific structure projection and does not mutate the archive.

### Access control

Both projection tables:

- have RLS enabled;
- have explicit deny policies for `anon` and `authenticated`;
- are not directly SELECT-readable by those roles;
- expose no query-RPC EXECUTE privilege to those roles;
- grant `service_role` SELECT only at table level.

The public Edge Function is the sole public query contract and remains read-only/field-whitelisted.

Supabase security advisor after these changes: **0 findings**.

### Continuous projection contract

A service-role-only health function, `cuhalide_atlas_public_projection_health_v301()`, verifies the projection itself rather than trusting deployment state alone. It checks:

- article rows = 346;
- canonical articles = 332;
- structure rows = 878;
- Core-Included structures = 816;
- strict-polar rows = 67;
- Record 13 erratum overlays = 4;
- deterministic ordered projection checksums;
- RLS deny policies;
- no direct `anon`/`authenticated` table SELECT;
- no direct `anon`/`authenticated` projection-query RPC execution;
- service-role SELECT available while service-role UPDATE remains disabled;
- selected article-halogen query semantics.

Public data health exposes only boolean pass/fail contract state, not the private projection rows or credentials.

## 2. Structure- and article-halogen semantics

A release-specific SQL semantic function derives effective structure halogen identity while protecting against several false-positive classes.

Validated structure behaviors:

- `Cu2I4` → I;
- bridging `μ2-I` is recognized as iodide;
- `Cu(I)` oxidation-state notation is not itself parsed as an iodide ligand;
- a ligand formula containing iodine, e.g. `Cu(PPh3)2(C6H4I)`, does not by itself reclassify a fallback Cu–Cl record as Cu–I;
- unresolved/series-level material labels retain their curated fallback rather than being over-inferred.

Live structure examples:

- `CUH-008-S01` → **I**;
- `CUH-162-S01` → **Cl/Br/I**, not false I from `Cu(I)`.

Article filters preserve a distinct categorical rule:

- a single-halogen filter such as `I` means the article-level curated halogen set **contains I**, including mixed-I records;
- an explicit mixed label such as `Cl/Br/I` remains an exact category.

Release-3.0.1 canonical query contract:

- `I` containment → **247** articles;
- exact `Cl/Br/I` → **27** articles.

These values are included in the continuous projection-health contract.

## 3. Tokenized short scientific search

Short scientific strings were previously vulnerable to substring artifacts. The release-specific query functions tokenize one-to-four-character alphanumeric terms and treat one-letter halogens as explicit tokens.

Validated checks include:

- structure search `STE` → **0** rows;
- structure search `luminescence` → **0** rows because article title is not a structure-search field;
- structure search `I` → **671** rows, not all 878 rows.

The structure search surface is restricted to structure identity/crystallographic fields: structure ID, label, formula, phase, space group, point group, crystal system, DOI and CCDC/CIF identifier.

Article title, article-grain photophysics and unmapped motif text are excluded from structure search.

## 4. Structure-grain motif and photophysics boundary

### Public structure detail

Public structure detail does not heuristically extract a motif from an article-level series summary. Without an independently mapped structure-grain motif, it returns an explicit boundary statement and directs interpretation back to article-level summary / primary evidence.

Article-grain emission values remain blank at structure grain unless a future independent structure-grain evidence mapping is created.

### Smart RAG defense in depth

The current Smart RAG family applies multiple relevant layers:

1. bounded-claims structure context excludes motif/photophysics unless independently mapped;
2. public data structure search/detail excludes unmapped motif/photophysics;
3. soft scientific concepts are routed to article-grain evidence by the evidence-grain-safe retrieval core;
4. structure cards emitted by the RAG path are reconstructed from safe identity/crystallography projections;
5. explicit `CUH-xxx-Sxx` motif/photophysics questions use a deterministic boundary response separating structure crystallography from article-grain evidence;
6. generic motif/photophysics answers pass through a second outer guard that removes unmapped structure sources and structure-labelled answer lines.

This evidence-grain safety remains active independently of model-provider state.

## 5. Frontend v47

v47 retains the scientific visual language introduced during the portal redesign and adds interface correctness/reliability fixes:

- publication-growth display window is explicitly **2006–2026.06**; earlier canonical records remain indexed and are not implied to be absent;
- structure-search scope is stated directly in the interface;
- structure detail labels the motif field as a **structure-grain motif boundary**;
- RAG source cards show evidence scope;
- deterministic evidence-boundary status is distinguished from provider fallback;
- safe Markdown rendering supports headings, lists, blockquotes, bold and interactive `[A:id]` / `[S:id]` source links while escaping arbitrary HTML;
- nested article/structure modal navigation replaces modal hashes rather than building incorrect modal-return history;
- original focus target is preserved across nested modal navigation;
- focus-visible behavior is restored for unset-style link buttons;
- reduced-motion preference is respected;
- client-side RAG calls have an explicit timeout and a bounded failure message;
- table scroll regions are keyboard-focusable on constrained viewports;
- pager regions expose navigation semantics;
- method-step number contrast satisfies the automated serious/critical accessibility gate.

The unused `/manifest.webmanifest` alias is not exposed as a valid PWA manifest because the release manifest is scientific release metadata, not a web-app manifest.

## 6. Final production smoke matrix

Live public checks after the 11 August completion pass:

| Check | Result |
|---|---:|
| `/health.json` | HTTP 200 / PASS |
| Public site | 47 |
| Public data | 2.6.0 |
| Smart RAG | 9.10.0 |
| Smart RAG mode at final check | FULL |
| Meta / health | 47.6 |
| Canonical articles | 332 |
| Article audit records | 346 |
| Canonical article filter `I` | 247 |
| Exact canonical article `Cl/Br/I` | 27 |
| Core-Included structures | 816 |
| All structure/phase rows | 878 |
| Strict-polar rows | 67 |
| `CUH-008-S01` halogen | I |
| `CUH-162-S01` halogen | Cl/Br/I |
| `CUH-013-S01` dimensionality | Unresolved + erratum |
| Structure `STE` search | 0 |
| Structure `luminescence` search | 0 |
| Structure `I` search | 671 |
| Projection integrity/ACL contract | PASS |
| `/api/export` | HTTP 410 |
| `/sitemap.xml` MIME | application/xml; charset=utf-8 |
| Supabase security advisor after projection/RLS hardening | 0 findings |

Projection-backed public-data requests remain server-side and field-minimized. Health/bootstrap is intentionally heavier because it retains immutable-snapshot and cross-service integrity checks.

## 7. Literature Watch scheduler

Database cron verification:

- job: `cuhalide-atlas-daily-discovery`;
- schedule: `17 2 * * *` = 02:17 UTC daily;
- active: true;
- checked runs on 2026-08-08, 2026-08-09 and 2026-08-10: succeeded.

Candidate metadata remains outside frozen release statistics and never receives automatic release inclusion.

## 8. Scientific denominators preserved

The hardening did not change frozen scientific denominators:

- article audit: 346;
- chemically included articles: 335;
- canonical verified articles: 332;
- structure/phase rows: 878;
- Core-Included structure rows: 816;
- resolved space-group rows: 650;
- verified one-to-one mappings: 625;
- verified polar rows: 87;
- strict-polar rows: 67;
- strict-polar articles: 42.

## 9. Current-runtime RAG validation

A fresh versioned benchmark was executed after free Workers AI capacity recovered:

- evaluation: **rag-benchmark-v1.4**;
- run ID: `81eeab9f-3efb-4d19-bab0-7768acebfc4b`;
- runtime code label: **smart-rag-v9.11.3-evidence-grain-v2**;
- exact/deterministic: **25/25**;
- retrieval: **25/25**;
- reasoning/scientific-boundary: **20/20**;
- total: **70/70 PASS**;
- paid overage authorized: **false**.

The final two deterministic contract repairs were the Record 101 same-source STE–Cu···Cu route and the Record 267 human-scope wording guard. Both passed with no LLM or embedding use. The exact/anchor service version for the completed run is `10.2.1-exact-anchor-internal`.

The temporary evaluator was retired immediately after the controlled run and restored to JWT-required status.

The earlier `rag-benchmark-v1.3` 70/70 result remains a historical baseline for an older runtime. See `RAG_BENCHMARK_V14_2026-08-11.md` for the current-runtime archive note.

## 10. Real browser QA

A repository-retained Playwright/Chromium production gate was run against the live v47 website and passed across desktop, tablet and mobile viewports. The validated gate covers:

- all public routes;
- serious/critical axe accessibility findings;
- page and console errors;
- page-wide horizontal overflow;
- responsive navigation;
- modal focus trapping, Escape close and focus restoration;
- hash deep links;
- frozen scientific denominators;
- structure-halogen and evidence-grain semantics;
- CSP hardening and retired routes.

The QA gate was merged into `main` after its successful run. This does not claim exhaustive Safari/Firefox or manual pixel-perfect coverage.

## 11. Public/private boundary

Public website:

- query-and-view curated fields;
- strict-polar query interface;
- source-linked Smart RAG;
- metadata-only Literature Watch;
- methods, citation, release identity and errata.

Private research layer:

- complete normalized CSV/JSON/XLSX corpus;
- exact stored publisher abstracts;
- primary article PDF/SI/CIF files;
- field-evidence excerpts and source locators;
- internal QA/adjudication artifacts;
- candidate abstracts, scores and reason codes.

The former bulk public export route remains retired with HTTP 410.
