# CuHalide Atlas v48 production governance

Date: 2026-08-12  
Frozen scientific release: 3.0.2  
Public site: v48

## Objective

Production deployment must not be triggered by an unreviewed direct push merely because the GitHub default branch is `main`. The connected GitHub integration cannot currently administer branch protection/rulesets, so v48 adds a repository-level, fail-closed Vercel deployment control while retaining the existing pull-request and post-merge QA controls.

This is defense in depth. Native server-side GitHub branch protection remains the preferred outer control and should be enabled when repository Administration-write settings access is available.

## Required production provenance

For a Vercel Git deployment with `VERCEL_ENV=production`, `scripts/vercel-production-gate.mjs` requires all of the following before the build is allowed to continue:

1. `VERCEL_GIT_COMMIT_REF` is exactly `main`.
2. `VERCEL_GIT_COMMIT_SHA` is a full Git SHA.
3. GitHub reports that SHA as the exact `merge_commit_sha` of a merged pull request whose base is `main`.
4. The merged PR head SHA has the latest GitHub Actions check run completed successfully for all four required QA checks:
   - `chromium-production`
   - `lighthouse-production`
   - `preview-chromium`
   - `preview-lighthouse`
5. The four QA checks must be produced by the `github-actions` GitHub App; a same-named check from another App cannot satisfy the gate.
6. The PR head SHA must also have a latest GitHub commit status with context `Vercel`, state `success`, and a `https://vercel.com/` deployment target. This independently confirms that Vercel successfully built the candidate commit as a Preview deployment.

For repeated check/status names, the highest GitHub record ID is treated as the latest result so an older success cannot mask a newer failure.

Vercel Ignored Build Step semantics are intentionally inverted from ordinary shell success semantics: exit code `1` continues the build and exit code `0` ignores the build. The gate therefore exits `0` for an unverified production commit.

## Protected Preview candidate validation

Vercel Preview deployments remain protected. Initial direct browser and Lighthouse testing of the Preview URL was intentionally rejected after audit because Vercel Authentication redirected unauthenticated automation to the Vercel login page. The project does not disable Preview protection merely to make CI pass.

Vercel documents an Automation Bypass secret for authenticated agents. That approach requires generating a Vercel bypass secret and synchronizing it into a GitHub repository secret. The currently connected integrations cannot safely perform both secret-management steps, so v48 does not distribute or expose a bypass secret.

Instead, `.github/workflows/vercel-preview-qa.yml` uses a protection-preserving two-part attestation:

1. The workflow starts only after GitHub receives a successful Vercel `deployment_status` event for environment `Preview`.
2. It checks out the exact `github.event.deployment.sha`, verifies that the checkout SHA matches the Vercel-deployed SHA and that the triggering environment URL is a `vercel.app` Preview URL, then starts that exact candidate repository through `scripts/local-candidate-server.mjs` on the GitHub runner.

The local candidate runtime imports the same versioned Vercel handlers used by the candidate (`api/site.js`, public-data/meta/RAG proxies, record pages, sitemap and retired export route), applies the release security headers needed by the browser contract, and continues to use the real public Supabase v3.0.2 upstream contracts. It does not substitute scientific fixtures or a private database snapshot.

Against that exact candidate runtime, the workflow runs:

- the full Playwright/Chromium scientific, privacy, security, accessibility, responsive and stable-route suite; and
- the existing mobile/desktop Lighthouse gate with unchanged thresholds.

The resulting checks are named `preview-chromium` and `preview-lighthouse`. Together with the independent successful `Vercel` commit status, this establishes both candidate-code quality and successful Vercel deployability without making the protected Preview public.

If an owner later configures Vercel Automation Bypass and the corresponding GitHub secret through supported secret-management interfaces, direct testing of the protected Preview may replace the local candidate adapter after an explicit migration and regression audit. It must not be enabled by placing a bypass secret in repository code, logs, URLs, artifacts or public configuration.

## Fail-closed behavior

If GitHub cannot confirm PR provenance, required QA checks or the Vercel deployment status — including a GitHub API error, timeout or rate-limit condition — a new production build is skipped. The currently serving production deployment is not removed or modified by this decision.

Preview deployments are never blocked by the production provenance gate.

## Scientific and data boundary

This governance layer does not modify any Frozen Release or Current Curated scientific record, denominator, Record 13 correction, RAG evidence contract, public field whitelist, private corpus, Literature Watch state, Supabase access-control policy or public query-and-view boundary.

## Remaining platform-level control

GitHub currently reports `main` as unprotected, and the connected GitHub integration returns HTTP 403 for branch-protection administration. The repository-level Vercel gate therefore cannot be treated as a cryptographic substitute for server-side branch protection: an actor who already has direct repository write permission could deliberately change or remove repository gate code in the same push.

When repository settings are changed by an owner or by an integration with Administration write scope, `main` should additionally enforce:

- pull requests required before merge;
- required status checks for the production baseline, candidate QA and Vercel deployment status where supported;
- no force pushes;
- no branch deletion; and
- no bypass for ordinary direct pushes.

For this single-owner repository, reviewer-count requirements should only be enabled if a second qualified reviewer is available; otherwise they can make maintenance impossible without adding meaningful independent review.

GitHub Dependabot version updates are enabled. The current integration reports that Dependabot vulnerability alerts are disabled, while Code Scanning and Secret Scanning alert APIs are not readable through the present integration. Those platform settings must not be represented as enabled or zero-alert until independently enabled/readable.

## Release procedure

Normal changes follow:

`feature/hardening branch -> PR -> Vercel Preview READY/status success -> exact candidate SHA local runtime -> preview-chromium + preview-lighthouse -> production baseline checks -> merge to main -> Vercel provenance gate -> production deployment -> full post-merge production QA`

Any failure stops promotion at that stage. A governance or CI failure must never be converted into a frozen scientific change, bypassed by altering scientific data, or solved by weakening the public/private evidence boundary.
