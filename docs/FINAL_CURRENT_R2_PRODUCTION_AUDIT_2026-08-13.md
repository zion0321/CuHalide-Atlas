# Final Current Curated rev.2 production audit — 2026-08-13

Audit date: 2026-08-13  
Frozen scientific release: **3.0.2**  
Current Curated: **rev.2**, curated through **2026-08-13**  
Public site: **v48 / UI-content 48.3**  
Public Data: **2.9.0**  
Smart RAG: **9.14.0**  
Metadata/health: **48.3**  
Motif Atlas schema: **1.1**

## Scientific state

Frozen Release 3.0.2 remains immutable with literature cutoff inclusive through 2026-06-30.

Frozen denominators:

- article audit records: **346**
- chemically included articles: **335**
- canonical verified articles: **332**
- structure/phase rows: **878**
- Core-Included structures: **816**
- resolved space-group rows: **650**
- verified one-to-one space-group mappings: **625**
- verified polar rows: **87**
- strict-polar rows: **67** across **42** articles
- RAG documents/embeddings: **1,224 / 1,224**

Current Curated rev.2 denominators:

- article audit records: **370**
- chemically included articles: **359**
- canonical verified articles: **356**
- structure/phase rows: **935**
- Core-Included structures: **873**
- resolved space-group rows: **705**
- verified one-to-one mappings: **680**
- verified polar rows: **97**
- strict-polar rows: **77** across **46** articles
- RAG documents/embeddings: **1,305 / 1,305**

The Current overlay contains **24** reviewed articles and **57** reviewed structure/phase determinations: **19** frozen-cutoff coverage backfills and **5** post-cutoff additions. None rewrites Frozen Release 3.0.2.

## Live database health

Repeated direct production-database audits of the Current/Frozen health functions returned `ok=true` for all primary contracts, including the final post-deployment check after the runtime/sitemap hardening merge.

Current Curated checks passed for:

- exact rev.2 derived counts;
- complete 1,305/1,305 RAG embedding coverage;
- Current structure-search contract;
- structure/article-title isolation;
- stored Current state versus derived counts.

Frozen 3.0.2 checks passed for:

- all Frozen denominators;
- Record 13 physical corrections;
- release-specific RAG compatibility;
- structure-grain motif and photophysics guards;
- structure-search photophysics/title/motif isolation;
- halogen parsing and source-conflict contracts;
- current-release errata state;
- projection-backed bootstrap and checksums.

Relational/public-projection audit returned:

- orphan structures: **0**
- duplicate DOI groups: **0**
- canonical records outside Included scope: **0**
- polar/nonpolar point-group contradictions: **0**
- polar rows without resolved space group: **0**
- unexpected evidence labels: **0**
- unexpected halogen labels: **0**

Projection integrity uses SHA-256 and the article/structure projection checks both matched. A direct privilege scan returned **zero** `anon`/`authenticated` table grants and **zero** `anon`/`authenticated` routine grants in the `public` schema. Public browser access is therefore mediated through bounded Edge/Vercel wrappers rather than direct database objects.

## Motif Atlas

The live Motif Atlas contract reports **935** taxonomy rows:

- motif-resolved: **817**
- motif-unresolved: **118**
- primary classified: **895**
- unresolved legacy category: **40**

Crystallographic determinations by primary class:

- Coordination: **346**
- Ionic / Hybrid Ionic: **447**
- All-in-One (AIO): **102**
- Unresolved legacy mapping: **40**

The taxonomy intentionally keeps article reports, crystallographic determinations and normalized reported identities as separate denominators. Primary-evidence curated components remain distinct from legacy label-derived candidates.

## RAG evidence boundary

The Current unified corpus is **1,305 / 1,305** embedded documents. Frozen compatibility remains **1,224 / 1,224**.

The Frozen RAG compatibility health contract reports:

- article content-hash mismatches: **0**
- unchanged structure content-hash mismatches: **0**
- intended Record 13 changed structure documents: **4**
- Record 13 corrected/embedded/current-erratum-clean: **4/4**
- explicit structure-document leak fields: **0**
- forbidden structure-context science keys: **0**

Model output remains subordinate to deterministic release/count/scope/crystallography/taxonomy/evidence-grain contracts.

## Security and public/private boundary

Supabase Security Advisor returned **0 findings** in the final audit. Performance Advisor reported only informational unused-index candidates; no index was removed solely on that signal because the database is young and several flagged indexes protect search/RAG/Current/Motif access paths whose usage statistics are not yet a safe removal criterion.

Public access remains query-and-view. `/api/export` remains HTTP 410. Complete normalized tables, exact publisher abstracts, primary PDF/SI/CIF, raw taxonomy/component relations, field-evidence excerpts/locators and internal candidate/QA/adjudication artifacts remain private.

Public unauthenticated Edge wrappers are limited to read-only/query-only public contracts. Scheduled metadata discovery retains JWT plus a separate private cron-token boundary. Historical canary/debug/ephemeral function names are not treated as public dependencies merely because the deployment object remains `ACTIVE`; source and JWT/retirement status are authoritative. Spot checks of historical `release-export`, `debug` and Current indexer endpoints confirmed JWT-required HTTP 410 retirement stubs.

The final Vercel runtime audit over the production environment found **no error/fatal runtime logs** and **no 5xx responses** in the inspected one-hour window following the final deployment.

## GitHub and Vercel production governance

The active default-branch ruleset `Protect main production` requires PR provenance, resolved review threads, strict required checks, the four Chromium/Lighthouse production/candidate checks, trusted Vercel status, no force push, no branch deletion and no bypass actor.

PR #21 published Current Curated rev.2 and Motif Atlas after the required candidate/production gates. PR #22 synchronized Supabase governance documentation. PR #23 completed repository identity/policy cleanup and added required repository-contract regression tests to `chromium-production`.

Vercel build-log auditing then identified an operational eventual-consistency race. The original post-merge provenance gate relied on GitHub's `commit -> pull requests` association endpoint; real merges demonstrated that this association could lag long enough to safely but incorrectly skip a valid production build. A simple bounded retry was proven insufficient by PR #24.

PR #25 replaced that fragile single-source assumption with **dual-source merged-PR provenance**: the commit-association endpoint first, then recent closed PR records on base `main`, with the same exact `merged_at`, `base.ref` and `merge_commit_sha` predicates. Unit tests prove that the fallback cannot accept an unmerged PR, a wrong-base PR or a different merge SHA, and that exhaustion/API failure remains fail-closed. After provenance is established, all four required GitHub Actions checks and trusted Vercel candidate status remain mandatory. A real production build then passed this gate and deployed successfully.

## Runtime and sitemap closure

PR #26 completed the runtime/reliability closure without changing scientific content:

- the package now declares **ESM** explicitly with `"type": "module"`, eliminating Vercel's ESM-to-CommonJS transpilation warning;
- the package does not override the Vercel project's Node major;
- production-browser, production-Lighthouse and both protected-preview jobs are aligned to **Node 24**, matching the Vercel project runtime;
- repository contracts protect the ESM/Node-runtime alignment;
- the repository was audited for CommonJS-only `require`, `module.exports` and `__dirname` constructs before the runtime declaration was promoted.

The first full Node-24 protected-preview browser pass exposed a real sitemap reliability issue: serial pagination over the Current corpus could exceed the existing 15-second browser request budget on a cold candidate runtime. The implementation was fixed rather than weakening the test. Sitemap generation now establishes the exact denominator/page-count snapshot from page 1, fetches the remaining pages with bounded concurrency, retains page-level bounded retry/timeout behavior, validates `page`, `total`, `total_pages` and `has_next` consistency on every page, and verifies the complete page set before flattening.

The exact public sitemap invariant remains **1,231 URLs** = root + Motif Atlas + **356 Current canonical article pages** + **873 Current Core-Included structure pages**. The latest protected-preview Chromium suite passed this route without increasing its request timeout.

The exact PR #26 candidate passed `chromium-production`, `lighthouse-production`, `preview-chromium`, `preview-lighthouse` and trusted Vercel status before merge. The merged production SHA **`b137ad7afcbe89fefecd642283a12ccbb03c975f`** was then accepted by the fail-closed production provenance gate on the first association attempt, deployed successfully, and completed both post-merge production Chromium and Lighthouse QA successfully. The production browser suite explicitly verifies health/version/count contracts, Record 13, query-and-view export retirement, Motif Atlas boundaries, Smart RAG evidence-grain behavior, stable record pages, sitemap cardinality **1,231**, accessibility, responsive behavior and privacy/CSP invariants.

## Supabase GitHub integration boundary

The production Supabase migration ledger contains **121** valid timestamped entries from `20260807140239` through `20260813085032`. The public repository intentionally contains only a sanitized public-safe migration/contract subset and must never be represented as a complete replayable production history.

The Supabase GitHub App can therefore emit a non-required external check reporting **`Remote migration versions not found in local migrations directory`** after a public-repository merge. The latest final merge reproduced that external check. This is the expected consequence of protecting private production migration history rather than publishing it; the check is **not** one of the repository's required production status checks, did not alter the production database, and does not indicate a scientific/runtime health failure.

It would be incorrect to make that external check green by creating fake/no-op migrations or copying private production migration statements into the public repository. GitHub-driven Supabase migration replay is not an authoritative deployment path for this public repository. Production database changes continue through the separately reviewed curation/deployment workflow, with only public-safe contracts mirrored to GitHub.

The project-level GitHub-integration toggle is not exposed as a writable/readable setting by the connected Supabase control surface used in this audit, so no dashboard state is invented and no unsafe workaround is applied. The operational invariant is the enforceable one: no public-repository merge may become an implicit replay source for private production migration history.

## Archival boundary

`CITATION.cff` and CodeMeta identify Frozen Release **3.0.2 / 2026-08-11**. No permanent repository/Zenodo DOI, creator/ORCID/funder record or blanket top-level license is asserted until the repository owner makes those rights/identity decisions. Machine-readable licensing remains `NOASSERTION` rather than inventing authorization.

The formal GitHub release/tag publication surface and any eventual DOI deposit are archival publication decisions, not runtime scientific facts; they must be created only with owner-authorized metadata and rights decisions.

## Final gate

Within the controllable scientific and engineering boundary audited here, the Current Curated rev.2 corpus, Frozen 3.0.2 snapshot, Motif Atlas, RAG evidence boundary, production database health, public/private access model, production deployment, runtime module/Node alignment, sitemap reliability, browser/Lighthouse QA and protected-main governance are internally consistent. No known production-blocking scientific or code defect remains.

Future scientific growth should proceed through Current Curated and a later data-expansion release such as 3.1.0; Frozen Release 3.0.2 must remain unchanged.
