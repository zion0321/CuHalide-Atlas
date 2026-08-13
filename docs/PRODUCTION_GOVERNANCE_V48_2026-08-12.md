# CuHalide Atlas v48 production governance

Date: 2026-08-12  
Updated: 2026-08-13  
Frozen scientific release: **3.0.2**  
Current Curated: **rev.2**, through **2026-08-13**  
Public site: **v48 / UI-content 48.3**

## Objective

Production changes must be reviewable, provenance-bound and fail closed. CuHalide Atlas uses two independent controls: a native GitHub repository ruleset on the default branch and a repository-level Vercel production provenance gate. Neither control is allowed to weaken scientific, privacy or evidence-grain contracts in order to make a deployment pass.

## Native GitHub default-branch protection

The active repository ruleset **`Protect main production`** targets the default branch and currently enforces:

- pull-request based changes to `main`;
- resolution of review conversations;
- strict required-status-check policy;
- successful `chromium-production` from GitHub Actions;
- successful `lighthouse-production` from GitHub Actions;
- successful `preview-chromium` from GitHub Actions;
- successful `preview-lighthouse` from GitHub Actions;
- successful trusted `Vercel` status from the Vercel GitHub App;
- no branch deletion;
- no non-fast-forward/force-push update;
- no bypass actors.

For this single-owner repository, the approving-review count remains zero unless a genuinely independent qualified reviewer is available. This avoids creating a ceremonial self-review requirement while retaining PR provenance, required checks and review-thread resolution.

## Required Vercel production provenance

For a Vercel Git deployment with `VERCEL_ENV=production`, `scripts/vercel-production-gate.mjs` requires all of the following before the build may continue:

1. `VERCEL_GIT_COMMIT_REF` is exactly `main`.
2. `VERCEL_GIT_COMMIT_SHA` is a full Git SHA.
3. GitHub reports that SHA as the exact merge result of a merged pull request whose base is `main`.
4. The merged PR head SHA has the latest GitHub Actions check run completed successfully for all four required QA checks:
   - `chromium-production`
   - `lighthouse-production`
   - `preview-chromium`
   - `preview-lighthouse`
5. The four QA checks are produced by the `github-actions` GitHub App; a same-named check from another App cannot satisfy the gate.
6. The PR head SHA also has a latest GitHub commit status with context `Vercel`, state `success`, and a `https://vercel.com/` deployment target.

For repeated check/status names, the highest GitHub record ID is treated as the latest result so an older success cannot mask a newer failure.

Vercel Ignored Build Step semantics are intentionally inverted from ordinary shell success semantics: exit code `1` continues the build and exit code `0` ignores the build. The gate therefore returns the ignore code when production provenance cannot be verified. A skipped build leaves the currently serving production deployment unchanged.

## Protected Preview candidate validation

Vercel Preview deployments remain protected. The project does not make preview deployments public merely to satisfy CI.

`.github/workflows/vercel-preview-qa.yml` uses a protection-preserving two-part attestation:

1. the workflow starts only after GitHub receives a successful Vercel `deployment_status` event for environment `Preview`;
2. it checks out the exact deployed SHA and starts that repository revision through `scripts/local-candidate-server.mjs` on the GitHub runner.

The candidate runtime imports the same versioned Vercel handlers used by the deployment and continues to use the real public Supabase contracts. It does not substitute scientific fixtures or a private database snapshot.

Against that exact candidate revision, CI runs the full Playwright/Chromium scientific/privacy/security/accessibility suite and the mobile/desktop Lighthouse gate. The resulting required checks are `preview-chromium` and `preview-lighthouse`.

## Fail-closed behavior

If GitHub cannot confirm PR provenance, required QA checks or trusted Vercel deployment status — including API errors, timeouts or rate limits — a new production build is skipped. The currently serving production deployment is not removed or modified. Preview deployments are not blocked by the production provenance gate.

## Supabase deployment governance

The public GitHub repository intentionally contains a **public-safe migration subset**, not a replayable copy of the complete production migration ledger. Historical production migrations include private corpus material, one-time provisioning and credential/Vault handling that must not be copied into a public repository merely to make migration histories look identical.

Accordingly:

- Supabase **Automatic branching** should remain disabled unless a complete sanitized canonical migration repository is introduced;
- Supabase **Deploy to production** through the GitHub integration should also remain disabled for this public repository;
- production database/schema changes are separately reviewed, applied, validated, security-audited and then mirrored into public-safe contracts where disclosure is appropriate;
- fake/no-op timestamp migrations must never be created to silence migration-history checks;
- raw `supabase_migrations.schema_migrations.statements` must never be bulk-exported into the public repository;
- a GitHub/Supabase integration check is not a scientific release gate unless the repository has first been migrated to a complete sanitized replayable migration history.

The public-safe inventory boundary is documented in `supabase/contracts/REMOTE_MIGRATION_INVENTORY_2026-08-13.md`.

## Scientific and data boundary

Deployment governance does not modify any Frozen Release or Current Curated scientific record, denominator, Record 13 correction, RAG evidence contract, public field whitelist, private corpus, Literature Watch state, Motif Atlas taxonomy or Supabase access-control policy.

Public access remains **query-and-view**. `/api/export` remains HTTP 410. Complete normalized tables, exact publisher abstracts, primary PDF/SI/CIF, raw taxonomy/component relations, field-evidence excerpts/locators and internal QA/adjudication/candidate artifacts remain private.

## Release procedure

Normal public-web changes follow:

`feature/hardening branch -> PR -> Vercel Preview READY/status success -> exact candidate SHA local runtime -> preview-chromium + preview-lighthouse -> production baseline checks -> merge to main -> Vercel provenance gate -> production deployment or safe skip -> full post-merge production QA`

Scientific data changes additionally require the Current Curated/release-wide curation gates described in `docs/LIVE_CURATION_WORKFLOW_2026-08-11.md`.

Any failure stops promotion at the relevant stage. A governance or CI failure must never be converted into a scientific change, bypassed with fake migration history, or solved by weakening the public/private evidence boundary.
