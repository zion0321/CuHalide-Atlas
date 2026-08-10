# CuHalide Atlas production hardening — v47

Date: 2026-08-10  
Scientific release: 3.0.1  
Scientific parent: 3.0.0  
Frozen literature cutoff: 2026-06

## Scope

This hardening pass addressed residual production risks after the v46 repair. It changes the public query/runtime/presentation layer only and does **not** rewrite the immutable release-3.0.1 scientific snapshot.

Current production matrix after this pass:

| Component | Version |
|---|---:|
| Public site | 47 |
| Public data contract | 2.4.0 |
| Smart RAG public gateway | 9.9.9 |
| Public metadata / health | 47.0 |
| Internal quota gateway | 9.9.4-public-internal |
| Final internal orchestrator | 9.10.1-final-internal |
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

## 2. Structure-halogen semantics

A release-specific SQL semantic function now derives effective structure halogen identity while protecting against several false-positive classes.

Validated behaviors:

- `Cu2I4` → I;
- bridging `μ2-I` is recognized as iodide;
- `Cu(I)` oxidation-state notation is not itself parsed as an iodide ligand;
- a ligand formula containing iodine, e.g. `Cu(PPh3)2(C6H4I)`, does not by itself reclassify a fallback Cu–Cl record as Cu–I;
- unresolved/series-level material labels retain their curated fallback rather than being over-inferred.

Live examples:

- `CUH-008-S01` → **I**;
- `CUH-162-S01` → **Cl/Br/I**, not false I from `Cu(I)`.

## 3. Tokenized short scientific search

Short scientific strings were previously vulnerable to substring artifacts. The release-specific query functions now tokenize one-to-four-character alphanumeric terms and treat one-letter halogens as explicit tokens.

Final live checks:

- structure search `STE` → **0** rows;
- structure search `luminescence` → **0** rows because article title is not a structure-search field;
- structure search `I` → **671** rows, not all 878 rows.

The structure search surface is restricted to structure identity/crystallographic fields: structure ID, label, formula, phase, space group, point group, crystal system, DOI and CCDC/CIF identifier.

Article title, article-grain photophysics and unmapped motif text are excluded from structure search.

## 4. Structure-grain motif and photophysics boundary

### Public structure detail

Public structure detail no longer heuristically extracts a motif from an article-level series summary. Without an independently mapped structure-grain motif, it returns an explicit boundary statement and directs interpretation back to article-level summary / primary evidence.

Article-grain emission values remain blank at structure grain unless a future independent structure-grain evidence mapping is created.

### Smart RAG defense in depth

Smart RAG 9.9.9 applies four relevant layers:

1. bounded-claims structure context excludes motif/photophysics unless independently mapped;
2. public data structure search/detail excludes unmapped motif/photophysics;
3. explicit `CUH-xxx-Sxx` motif/photophysics questions use a deterministic boundary response separating structure crystallography from article-grain evidence;
4. generic motif/photophysics answers pass through a second outer guard that removes unmapped structure sources and structure-labelled answer lines.

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
- client-side RAG calls have an explicit timeout and a bounded failure message.

The unused `/manifest.webmanifest` alias was removed because the release manifest is scientific release metadata, not a PWA application manifest.

## 6. Final production smoke matrix

Live public checks after v47 deployment:

| Check | Result |
|---|---:|
| `/health.json` | PASS |
| Canonical articles | 332 |
| Article audit records | 346 |
| Core-Included structures | 816 |
| All structure/phase rows | 878 |
| Strict-polar rows | 67 |
| `CUH-008-S01` halogen | I |
| `CUH-162-S01` halogen | Cl/Br/I |
| `CUH-013-S01` dimensionality | Unresolved + erratum |
| Structure `STE` search | 0 |
| Structure `luminescence` search | 0 |
| Structure `I` search | 671 |
| `/api/export` | HTTP 410 |
| `/sitemap.xml` MIME | application/xml |
| Smart RAG GET | 200 / 9.9.9 |
| Supabase security advisor | 0 findings |
| Vercel runtime errors, checked post-v47 window | none |

Recent projection-backed public-data requests observed in Supabase Edge Function logs were generally a few hundred milliseconds; representative requests included approximately 0.24–0.47 s for search/detail responses. Health/bootstrap remain intentionally slower because they retain immutable-snapshot and cross-service integrity checks.

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

## 9. Validation boundary

`rag-benchmark-v1.3` remains a frozen **70/70** scientific regression baseline that predates the final Smart RAG v9 orchestration. The current 9.9.9 runtime must not be described as having passed a fresh 70-case Qwen-enabled benchmark unless such a run is actually executed and archived.

Prior v9-specific validation remains:

- deterministic exact/anchor regression: 33/33;
- BGE-M3 + reranker retrieval regression: 25/25.

Provider-capacity state is an operational dependency and is not allowed to change frozen data, deterministic scientific rules or evidence-grain boundaries.

## 10. Public/private boundary

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
