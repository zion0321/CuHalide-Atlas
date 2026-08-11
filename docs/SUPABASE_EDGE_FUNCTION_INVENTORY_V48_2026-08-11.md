# Supabase Edge Function inventory — CuHalide Atlas v48 / release 3.0.2

Date: 2026-08-11  
Purpose: define the production dependency graph, separate required runtime services from historical tooling, and prevent old canary/debug endpoints from being mistaken for current production contracts.

## Production rule

Only the services listed in **Required runtime** below are dependencies of the current public portal, rolling literature monitor, or release-3.0.2 Smart RAG path. Public entrypoints are deliberately read-only except the JWT + private-token protected scheduled discovery function. All other legacy/debug/evaluation functions are either retired to a JWT-required `410 Gone` stub or retained only as JWT-protected historical tooling until their source-level provenance is archived.

## Required runtime

| Service | Role | JWT gate | Current version / live hash at audit |
|---|---|---:|---|
| `cuhalide-atlas` | Daily metadata discovery writer; pg_cron only | Yes + private cron token | v12 / `3a2b4f3138f7ffb65def9fe856badef9b97b9164d27ddbcf5a6110ab6fc691af` |
| `cuhalide-atlas-meta` | Canonical public metadata wrapper | No, read-only | v56 / `8f0453c36ce2593560731bed582b27b914930c94dc37198b8e260ba942904e47` |
| `cuhalide-atlas-meta-v302-stable` | Release-3.0.2 health/manifest/citation contract | No, read-only | v2 / `573a0eb46bdfb7003782e89513e11eb21e411d0416b35eb878088495de5868b2` |
| `cuhalide-atlas-public-data-v2` | Canonical public-data wrapper | No, read-only | v14 / `469ea4c4f2e99437f10371501c42b34cff667684169551b9968471341e56eadd` |
| `cuhalide-atlas-public-data-v302-public` | Release-3.0.2 public-data health/proxy boundary | No, read-only | v1 / `3480a06e08a8824ef60e84618760267f209d6f8e3ab5f3c7f42b98fbc386f1d8` |
| `cuhalide-atlas-public-data-v302` | Field-whitelisted v302 query/detail service | No, read-only | v1 / `d4e002238373340b06514e45c771741173ca292fd4db43e81ddf7f8df783a43c` |
| `cuhalide-atlas-candidates-v2` | Internal candidate/status reader used by public Literature Watch projection | Yes | v5 / contract 2.3.0 / `44f6ce472b429f348fb4d3c03d186b10af313335b06de02b567390e0939fc18b` |
| `cuhalide-atlas-smart-rag` | Canonical public Smart RAG wrapper | No, read-only/query-only | v22 / `dd4d99379c9ee3b590cfa4a6b916fd8d98999319983bb3e0f11bcd1656594b67` |
| `cuhalide-atlas-smart-rag-v302-public` | Release-3.0.2 public evidence-grain guard | No, query-only | v1 / `7e1183ddd900fcc6727e9dd14a4652336a8a714108d93387a13fe416841ccc54` |
| `cuhalide-atlas-smart-rag-v302-public-internal` | Release-aware private gateway | Yes | v1 / `fcee275b7decb5703d3218e6c4f7c54f0c8a68d20f93ef09c6575c5cdaf71642` |
| `cuhalide-atlas-rag-v302-core-adapter-internal` | 3.0.2 compatibility/core adapter | Yes | v1 / `2e4e14a4f1f861bdfbb7d190732487148681a47a8292f050789084c876983450` |
| `cuhalide-atlas-rag-contract-health-v302-internal` | Release-3.0.2 RAG context contract | Yes | v1 / `45453c14a0e0d6f603e0e2eefba52d0b2a8cc0c879ab1129d5b28a16bb7aa6af` |
| `cuhalide-atlas-smart-rag-v9-public-canary` | Quota-aware validated engine retained under v302 compatibility layer | Yes | v7 / `dfa1e3006f59ac876ae2de926acb56997be1f9b88807e4c2ae9bbc44c7549661` |
| `cuhalide-atlas-smart-rag-v9-final-canary` | Validated retrieval/reasoning orchestrator used by current engine | Yes | v11 / `e42b8729b96c4d0fe56743aa3e9aa3cd538ea07c75593e9652099d14bafbc06e` |
| `cuhalide-atlas-rag-v9-core-safe-internal` | Evidence-grain-safe retrieval core | Yes | v3 / `94b507f38f1fc88ae8784f8d85be7f354f967dfdba2a9cb39ee2d738c6234549` |
| `cuhalide-atlas-rag-v9-core-internal` | BGE retrieval core | Yes | v1 / `7df1ab0f64b776a7b7dbc93b9f81729cbd68c959440b07a7bab977c5e8daa4d6` |
| `cuhalide-atlas-exact-v10-internal` | Deterministic exact/anchor service | Yes | v6 / `4fcb9ce64ba80fa55c56ab7490e02145fe391d313224bdfb61c51ee299a74bc4` |
| `cuhalide-atlas-lexical-rag-v9-internal` | Deterministic lexical fallback | Yes | v2 / `83f42c918f76c6b698e45c7967063df4feb83e946cf7fb4abf772341d2bdf02e` |
| `cuhalide-atlas-candidate-search-v4-internal` | Research-mode candidate metadata retrieval | Yes | v1 / `9b63d86127c3864c80aac3c5346e29c94b12e2631e67150180cff3165903c81a` |
| `cuhalide-atlas-qwen-claims-v9-internal` | Source-constrained bounded-claim validation | Yes | v7 / `f4cc356be828b0327f2d0bbd8a493b21d641d7dabcf641b8cfadc8d389f644e2` |

The legacy-looking `v9` names in this table are not accidental public version drift. They are JWT-protected validated internal engines reused only behind the release-3.0.2 compatibility layer; release identity and content-hash compatibility are enforced by the v302 adapter/contract before public exposure.

## Scheduled Literature Watch authentication

`cuhalide-atlas-daily-discovery` runs at `17 2 * * *` UTC. The current invocation uses two independent gates:

1. Supabase Edge Function JWT verification with a legacy anon JWT stored in Vault (`cuhalide_atlas_cron_anon_jwt`); and
2. the private high-entropy cron token stored separately in Vault (`cuhalide_atlas_cron_token`) and verified by SHA-256 inside the function.

The token values are not version-controlled. The cron now uses a 30-day rolling lookback and monitor v1.7.0 with multiple Crossref/OpenAlex query families. A post-change manual invocation completed successfully on 2026-08-11 (`source=manual-jwt-hardening-check`, monitor 1.7.0, 30-day window), confirming the two-factor scheduled path.

## Retired to JWT-required 410 stubs

These functions had no current production dependency and were converted from executable diagnostic/temporary/bulk-export code to small JWT-gated `410 Gone` stubs:

- `cuhalide-atlas-mime-probe`
- `cuhalide-atlas-secret-probe`
- `cuhalide-atlas-cloudflare-probe`
- `cuhalide-atlas-site-debug`
- `cuhalide-atlas-meta-v41-debug`
- `cuhalide-atlas-v9-retrieval-eval-temp`
- `cuhalide-atlas-qwen-tool-probe-temp`
- `cuhalide-atlas-evaluation-v14-ephemeral`
- `cuhalide-atlas-rag-structure-reembed-v2-ephemeral`
- `cuhalide-atlas-rag-v302-reembed-ephemeral`
- `cuhalide-atlas-evaluation-v16-ephemeral`
- `cuhalide-atlas-v302-public-data-debug-ephemeral`
- `cuhalide-atlas-qwen-claims-debug-ephemeral`
- `cuhalide-atlas-site`
- `cuhalide-atlas-data`
- `cuhalide-atlas-agent`
- `cuhalide-atlas-data-stable`
- `cuhalide-atlas-site-v31-canary`
- `cuhalide-atlas-public-data-v1`
- `cuhalide-atlas-release-export-v301`
- `cuhalide-atlas-release-export-v301-pages`
- `cuhalide-atlas-release-export-v301-protocol`
- `cuhalide-atlas-meta-v302` (intermediate pre-stable service)
- `cuhalide-atlas-rag-contract-health-internal` (superseded by v302 contract)

Supabase currently has no connector operation that deletes a deployed Edge Function. Replacing obsolete code with JWT-required 410 stubs removes its executable behavior and is the least-risk retirement available through the managed production control plane.

## JWT-protected historical/maintenance tooling intentionally retained

The following older canaries/audit/indexer/evaluation helpers are **not public production dependencies** but remain JWT-protected because they may still be useful for controlled historical reproducibility, maintenance, or future curation work. They must never be linked from the public site or treated as current release contracts:

- `cuhalide-atlas-smart-rag-v4-canary`
- `cuhalide-atlas-hybrid-rag-v5-canary`
- `cuhalide-atlas-hybrid-rag-v6-canary`
- `cuhalide-atlas-hybrid-rag-v7-canary`
- `cuhalide-atlas-deterministic-rag`
- `cuhalide-atlas-exact-core`
- `cuhalide-atlas-rag-indexer`
- `cuhalide-atlas-bibliographic-audit`
- `cuhalide-atlas-coverage-audit`
- `cuhalide-atlas-coverage-worker`
- `cuhalide-atlas-evaluation-runner`
- `cuhalide-atlas-evaluation-target-runner`
- `cuhalide-atlas-evaluation-release-runner`
- `cuhalide-atlas-smart-rag-v8-gateway-canary`
- `cuhalide-atlas-smart-rag-v8-final-canary`
- `cuhalide-atlas-smart-rag-v8-release-canary`
- `cuhalide-atlas-data-v301-canary`
- `cuhalide-atlas-rag-v301-indexer`
- `cuhalide-atlas-production-smoke-v8`
- `cuhalide-atlas-smart-rag-v301-canary`
- `cuhalide-atlas-smart-rag-v301-eval`
- `cuhalide-atlas-evaluation-v301-runner`
- `cuhalide-atlas-smart-rag-v301-policy`
- `cuhalide-atlas-v301-canary-smoke`
- `cuhalide-atlas-errata-v301`
- `cuhalide-atlas-frontend-selftest-v42`
- `cuhalide-atlas-frontend-selftest-v43`
- `cuhalide-atlas-smart-rag-v9-canary`
- `cuhalide-atlas-smart-rag-v94-recovery-canary`

This category is intentionally different from public runtime: every function above requires JWT and is excluded from the current dependency graph. When a future repository archival pass has captured any unique implementation provenance, they can also be replaced with 410 retirement stubs without affecting production.

## Post-change invariant

A valid v48 production state requires all of the following simultaneously:

- public `/health.json` is `PASS`;
- canonical public data reports release 3.0.2 / data 2.7.0;
- canonical Smart RAG reports release 3.0.2 / 9.12.0 and the v302 scientific-context contract passes;
- Current Curated may advance to revision >0 without invalidating frozen release counts;
- scheduled metadata discovery requires both JWT and the private cron token;
- no retired debug/ephemeral/bulk-export function contains its former executable implementation;
- complete normalized data, primary PDF/SI/CIF and internal evidence/QA artifacts remain outside the public surface.
