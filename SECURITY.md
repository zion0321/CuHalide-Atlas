# Security and privacy

## Public access model

- The public website and public API surface are read-only/query-only.
- Public access is **query-and-view**, not bulk normalized redistribution.
- `/api/export` is intentionally retired and returns HTTP 410.
- Server-side field whitelists govern public searches and stable record pages.
- Complete normalized tables, raw taxonomy/component relations, exact stored publisher abstracts, primary PDF/SI/CIF files, field-evidence excerpts/locators, candidate-screening internals and private QA/adjudication data are not public assets.
- Primary evidence files are provenance inputs, not a public full-text corpus.

## Database controls

- Private audit, Current Curated, taxonomy/component and control tables use row-level security and least-privilege ACLs.
- Anonymous and authenticated browser roles do not receive direct private-table reads or writes.
- Public browser requests use bounded server-side wrappers; browser clients do not execute private projection/RPC objects directly.
- Server functions use service-role access only in protected server environments; service keys are never returned to clients or committed to release artifacts.
- Internal helper views/functions use constrained security semantics and fixed `search_path` settings where applicable.

## Scientific and RAG safety controls

- Model output cannot override Frozen/Current denominators, human scope decisions, verified crystallographic mappings, Motif Atlas taxonomy or evidence-grain boundaries.
- Exact counts, temporal scope, release identity, Record 13 corrections and other protected facts use deterministic server-side contracts.
- Structure-grain retrieval excludes article-title leakage and does not silently copy article-grain photophysics into a named structure/phase.
- Unresolved values remain unresolved unless independent evidence supports normalization.
- Literature Watch candidates remain metadata-only until primary-evidence review and QC; they cannot become model-supported Frozen or Current scientific records by retrieval alone.

## Deployment controls

- The default branch is protected by the active `Protect main production` ruleset.
- Production promotion requires PR provenance plus required Chromium, Lighthouse, protected-preview and trusted Vercel checks.
- The repository-level Vercel production gate fails closed if provenance or required check evidence cannot be verified.
- Supabase production schema/data changes are controlled separately from the public Git repository; the public-safe migration subset must never be represented as a complete replay of private production history.

## Reporting

Report suspected vulnerabilities privately to the repository owner. Do not publish credentials, private source-file paths, subscription content, private evidence excerpts or reproducible exploit details in a public issue before remediation.
