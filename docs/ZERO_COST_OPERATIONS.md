# CuHalide Atlas zero-cost operations

## Purpose

This document defines the production operating policy for running CuHalide Atlas on free hosting tiers without changing the scientific meaning of the Current Curated or Frozen Release layers.

The target deployment is:

- Vercel Hobby for the public web application.
- Supabase Free for the production database and read-only public services.
- GitHub `main` as the source-of-truth for deployable application code and operational checks.
- Off-platform copies of the private literature master and database backups as the disaster-recovery source.

The free-tier design is a cost-control operating mode, not a new scientific release.

## Scientific state that must remain online

Do not remove or rewrite these production layers merely to reduce storage:

- Frozen Release `3.0.2`, which remains immutable.
- Current Curated revision `10`.
- Current article and atomic-structure projections.
- Current structure taxonomy, organic-component projection, and field-evidence projection.
- Structured photophysics contract `1.4.0`.
- Organic Components contract `1.2.0`.
- Current RAG release `current-curated-r10`.
- Frozen RAG release `3.0.2`.

Historical candidate, rollback, staging, re-embedding, and retired RAG working copies are not production scientific layers and do not need to remain online after closure.

## Free-tier readiness baseline

On 2026-09-14 the production database was reduced from approximately 847 MB to approximately 363 MB while preserving the production contracts and counts.

Post-cleanup checks:

- Current article records: 383.
- Current structure rows: 939.
- Taxonomy rows: 939.
- Frozen Release 3.0.2 articles: 346.
- Frozen Release 3.0.2 structures: 878.
- Current RAG: 1322 documents / 1322 embedded.
- Frozen RAG: 1224 documents / 1224 embedded.
- Current Curated health: PASS.
- Structured photophysics health: PASS.
- CUH-187 remains absent from Current Curated.
- CUH-384 remains present at article grain only.

The database records the cleanup audit in `atlas_internal.cuhalide_zero_cost_cleanup_audit_20260914`.

## Storage policy

The production RAG table retains only:

1. `3.0.2`
2. `current-curated-r10`

Do not restore retired Current Curated RAG revisions into the production database unless there is a specific recovery requirement. Historical revisions should be treated as archival/reproducibility material, not production state.

The database should normally remain below 400 MB. Treat 425 MB as a warning threshold and 450 MB as a maintenance threshold. Do not intentionally operate close to the Supabase Free 500 MB database-size limit.

When database size rises materially:

1. inspect table and index sizes;
2. prune logs and closed working copies first;
3. do not delete Current Curated or Frozen Release canonical objects;
4. run production health checks immediately after maintenance.

## Scheduled work

Only the CuHalide Atlas daily literature-discovery cron is retained as a normal scheduled database job. The previous per-minute substituent-mining development/batch jobs were disabled during free-tier preparation because they generated unnecessary calls and `cron.job_run_details` growth.

`cron.job_run_details` is operational history, not scientific data. It may be periodically pruned after active jobs have been checked for failures.

## External health monitor

`.github/workflows/free-tier-health-monitor.yml` runs approximately every six hours and checks:

- deterministic production health;
- canonical Current Curated record CUH-384;
- Research Assistant runtime contract.

These requests also create regular legitimate application activity. They reduce the probability of an inactivity pause on a free backend, but they are not a service-level guarantee. GitHub scheduled workflows can be delayed or disabled by platform policy, and Supabase Free does not provide paid-plan uptime guarantees.

If the monitor fails, check the Supabase project state and the latest Vercel deployment before changing scientific data.

## Backup policy after leaving Pro

Free-tier hosting must not be treated as the only copy of the database.

Maintain three recovery layers:

1. **GitHub** — application code, migrations, operational documentation, and deployment checks.
2. **Private literature archive** — canonical MAIN/SI/CIF library and the final library master/QA artifacts stored outside the public application.
3. **Database backup** — a downloadable PostgreSQL/Supabase backup retained off-platform before the paid plan is cancelled, plus refreshed backups after major curation releases.

Before downgrading Supabase from Pro to Free, download a final database backup from the Supabase dashboard. The ChatGPT connector does not provide a reliable off-platform `pg_dump` download operation, so this remains a manual owner action.

## Recovery order

If Vercel is lost or misconfigured:

1. reconnect the GitHub repository;
2. deploy `main`;
3. restore the required environment variables;
4. verify `/health.json`, `/api/public-data`, and `/api/agent`.

If Supabase is paused:

1. resume the project in the Supabase dashboard;
2. wait for database/API services to become healthy;
3. run the production health monitor manually;
4. do not rebuild or overwrite the database unless restoration is actually required.

If the Supabase project is lost:

1. create/restore a Supabase project from the latest off-platform database backup;
2. re-deploy the required Edge Functions and secrets;
3. reconnect Vercel environment variables;
4. validate Frozen Release 3.0.2 and Current Curated rev.10 counts;
5. validate RAG, photophysics, organic components, CUH-187 exclusion, and CUH-384 inclusion;
6. only then restore public traffic.

## Downgrade checklist

Before cancelling paid plans, all of the following must be true:

- database is comfortably below 500 MB, preferably below 400 MB;
- Current Curated health passes;
- photophysics health passes;
- Current RAG is complete and embedded;
- Frozen Release 3.0.2 remains intact;
- the Vercel production deployment is healthy;
- the GitHub free-tier health monitor passes;
- a final off-platform Supabase backup has been downloaded by the owner.

After those checks, the owner can move the Vercel team to Hobby and the Supabase organization/project to Free. Billing-plan changes are owner-controlled dashboard actions and are intentionally not automated from the application.
