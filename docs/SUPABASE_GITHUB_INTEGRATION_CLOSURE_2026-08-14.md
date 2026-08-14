# Supabase GitHub integration closure — 2026-08-14

Closure date: **2026-08-14**  
Repository: **zion0321/CuHalide-Atlas**  
Production Supabase project: **tyxnyjyrfzspwcfjpzus**  
Scientific state: **Frozen Release 3.0.2 + Current Curated rev.2**

## Reason for closure

The public GitHub repository intentionally contains only public-safe database contracts and a sanitized migration subset. The protected production Supabase project contains a longer private migration ledger. Therefore the public repository is not, and must not be represented as, a complete replayable source of truth for production database migrations.

While the Supabase GitHub integration was enabled with **Deploy to production** on branch `main`, post-merge checks could report `Remote migration versions not found in local migrations directory`. That signal reflected the deliberate public/private migration-history boundary rather than a scientific or production-database defect.

Making that check green by publishing private production migration statements, manufacturing no-op migration timestamps, or rewriting the production migration ledger would violate the project's evidence/security boundary and is prohibited.

## Operator action

On 2026-08-14 the project owner disabled the Supabase GitHub integration for `zion0321/CuHalide-Atlas` from the Supabase project Integrations settings. This removes the public repository as an automatic production-migration deployment authority.

This action does **not** modify Frozen Release 3.0.2, Current Curated rev.2, the production schema/data, the 121-entry protected production migration ledger, Edge Functions, RAG embeddings, Motif Atlas taxonomy, or Vercel deployment provenance.

## Verification protocol

This document is intentionally submitted through a normal protected pull request as a post-disconnect probe. The closure is considered verified only if:

1. the exact PR candidate passes the required `chromium-production`, `lighthouse-production`, `preview-chromium`, `preview-lighthouse`, and trusted `Vercel` checks;
2. no Supabase migration-history/Preview check is created for the new PR candidate after the integration has been disabled;
3. the merge to `main` passes the fail-closed Vercel production provenance gate and deploys successfully;
4. no Supabase migration-history check is created for the post-merge `main` commit;
5. direct production database health remains true for Current Curated, Frozen 3.0.2, projection integrity, halogen contracts, and Frozen RAG compatibility;
6. Supabase Security Advisor remains at zero findings;
7. production Chromium/Lighthouse post-merge QA remains successful.

## Governance after disconnect

Production database changes remain governed by the separate reviewed curation/deployment workflow. Only public-safe database contracts may be mirrored into the public repository. The public GitHub repository remains the source of truth for the public website/application code and public-safe interface contracts, not for private production migration history.

If a future workflow intentionally re-enables a GitHub-to-Supabase deployment integration, it must first establish a repository whose migration history is authorized to be a complete production deployment source. The current public `CuHalide-Atlas` repository is not such a repository.
