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

A direct production-database audit of the Current/Frozen health functions returned `ok=true` for all primary contracts.

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

Projection integrity uses SHA-256 and the article/structure projection checks both matched. Anonymous/authenticated roles have no direct public-projection table reads or projection-query RPC execution; service-role reads are bounded and update privileges are absent on the frozen public projections.

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

Public unauthenticated Edge wrappers are limited to read-only/query-only public contracts. Scheduled metadata discovery retains JWT plus a separate private cron-token boundary. Historical canary/debug/ephemeral function names are not treated as public dependencies merely because the deployment object remains `ACTIVE`; source and JWT/retirement status are authoritative.

## GitHub and Vercel production governance

The active default-branch ruleset `Protect main production` requires PR provenance, resolved review threads, strict required checks, the four Chromium/Lighthouse production/candidate checks, trusted Vercel status, no force push, no branch deletion and no bypass actor.

PR #21 published Current Curated rev.2 and Motif Atlas after the required candidate/production gates. PR #22 synchronized Supabase governance documentation. Post-merge production Chromium and Lighthouse QA for PR #22 both completed successfully; the documentation-only Vercel production attempt was safely skipped by the fail-closed Ignored Build Step, leaving the already validated rev.2 production deployment serving.

## Supabase GitHub integration boundary

The production Supabase migration ledger contains **121** valid timestamped entries from `20260807140239` through `20260813085032`. The public repository intentionally contains only a sanitized public-safe migration/contract subset.

Automatic PR branching is disabled. A post-merge audit showed the Supabase GitHub App still attempted its **Deploy to production** workflow and rejected the public-safe repository because remote migration versions are intentionally absent locally. This did not change the production database, but it is an unnecessary red external check.

The correct platform state is therefore:

- keep **Automatic branching** disabled;
- disable **Deploy to production** for this public repository in the Supabase project GitHub integration;
- continue applying reviewed production DB changes through the controlled curation/deployment workflow and mirror only public-safe contracts to GitHub;
- never create fake/no-op timestamp migrations or publish private migration statements to make the integration check green.

This setting is a Supabase project-level integration toggle rather than a database DDL/runtime contract. Once that toggle is off, the public repository and production migration-governance model are fully aligned.

## Archival boundary

`CITATION.cff` and CodeMeta identify Frozen Release **3.0.2 / 2026-08-11**. No permanent repository/Zenodo DOI, creator/ORCID/funder record or blanket top-level license is asserted until the repository owner makes those rights/identity decisions. Machine-readable licensing remains `NOASSERTION` rather than inventing authorization.

## Final gate

The current scientific corpus, Current Curated overlay, Motif Atlas, RAG evidence boundary, production database health, public/private access model, browser/Lighthouse QA and protected-main governance are internally consistent. Future scientific growth should proceed through Current Curated and a later data-expansion release such as 3.1.0; Frozen Release 3.0.2 must remain unchanged.
