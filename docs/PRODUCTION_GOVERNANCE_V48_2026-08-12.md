# CuHalide Atlas v48 production governance

Date: 2026-08-12  
Frozen scientific release: 3.0.2  
Public site: v48

## Objective

Production deployment must not be triggered by an unreviewed direct push merely because the GitHub default branch is `main`. The repository currently cannot have branch protection/rulesets changed through the connected automation integration, so v48 adds a repository-level fail-closed deployment control while retaining the existing PR and post-merge QA controls.

## Required production provenance

For a Vercel Git deployment with `VERCEL_ENV=production`, `scripts/vercel-production-gate.mjs` requires all of the following before the build is allowed to continue:

1. `VERCEL_GIT_COMMIT_REF` is exactly `main`.
2. `VERCEL_GIT_COMMIT_SHA` is a full Git SHA.
3. GitHub reports that SHA as the exact `merge_commit_sha` of a merged pull request whose base is `main`.
4. The merged PR head SHA has the latest GitHub Actions check run completed successfully for all four checks:
   - `chromium-production`
   - `lighthouse-production`
   - `preview-chromium`
   - `preview-lighthouse`
5. The required checks must be produced by the `github-actions` GitHub App; a same-named check from another App cannot satisfy the gate.

Vercel Ignored Build Step semantics are intentionally inverted from ordinary shell success semantics: exit code `1` continues the build and exit code `0` ignores the build. The gate therefore exits `0` for an unverified production commit.

## Preview validation

`.github/workflows/vercel-preview-qa.yml` is triggered by a successful GitHub `deployment_status` event for a Vercel `Preview` deployment. It checks out the exact deployed SHA and runs:

- the full Playwright/Chromium scientific, privacy, security, accessibility, responsive and stable-route suite against the preview URL; and
- the existing mobile/desktop Lighthouse gate against the same preview URL.

The preview jobs are independent of the production baseline jobs. A production build therefore requires both a healthy current production baseline and a healthy candidate preview.

## Fail-closed behavior

If GitHub cannot confirm PR provenance or required checks, including a GitHub API error or rate-limit condition, a new production build is skipped. The currently serving production deployment is not removed or modified by this decision.

Preview deployments are never blocked by this production provenance gate.

## Scientific and data boundary

This governance layer does not modify any frozen or Current Curated scientific record, denominator, Record 13 correction, RAG evidence contract, public field whitelist, private corpus, Literature Watch state, or Supabase access-control policy.

## Remaining platform-level control

GitHub currently reports `main` as unprotected, and the connected GitHub integration returns HTTP 403 for branch-protection administration. The repository-level Vercel gate is therefore a defense-in-depth control, not a cryptographic substitute for server-side branch protection: an actor who already has direct repository write permission could deliberately change or remove repository gate code in the same push.

When repository settings are changed by an owner or by an integration with Administration write scope, `main` should additionally enforce:

- pull requests required before merge;
- required status checks for the baseline and preview QA checks;
- no force pushes;
- no branch deletion; and
- no bypass for ordinary direct pushes.

For this single-owner repository, reviewer-count requirements should only be enabled if a second qualified reviewer is available; otherwise they can make maintenance impossible without adding meaningful protection.

## Release procedure

Normal changes follow:

`feature/hardening branch -> PR -> Vercel Preview -> preview-chromium + preview-lighthouse -> production baseline checks -> merge to main -> Vercel provenance gate -> production deployment -> full post-merge production QA`

Any failure stops promotion at that stage; it must not be converted into a frozen scientific change or bypassed by modifying scientific data.
