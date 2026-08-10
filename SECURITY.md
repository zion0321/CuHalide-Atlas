# Security and privacy

## Public access model

- Public website and API endpoints are read-only.
- Public release exports use explicit field whitelists.
- Candidate abstracts, primary PDF/SI/CIF paths, private source-file metadata and service credentials are excluded from archival exports.
- Primary evidence files are provenance inputs, not a public full-text corpus.

## Database controls

- Private audit and control tables use row-level security.
- Anonymous and authenticated browser roles have explicit restrictive deny policies on private tables.
- Server functions use service-role access only in the server environment; service keys are never returned to clients or written into release artifacts.
- Internal helper views use caller-invoker security semantics.
- Helper functions use fixed `search_path` settings.

## Scientific safety controls

- Prompt-injection requests cannot override frozen fields or release policies.
- Exact counts, exact record properties, scope checks, unresolved-value preservation, STE–Cu···Cu relation anchors, Evidence-D boundaries and candidate release-isolation rules use deterministic server-side routes.
- Live Monitor candidates are not merged into a frozen release.

## Reporting

Report suspected vulnerabilities privately to the repository owner. Do not publish credentials, private source-file paths, subscription content or reproducible exploit details in a public issue before remediation.
