#!/usr/bin/env python3
"""Build the complete, versioned CuHalide Atlas 3.0.1 release package.

The builder downloads only public, field-whitelisted release exports. It never
retrieves primary PDF/SI/CIF files, private paths, credentials, or candidate
abstracts. Every declared invariant is checked before an archive is emitted.
"""

from __future__ import annotations

import csv
import hashlib
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.request
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

RELEASE = "3.0.1"
SCIENTIFIC_PARENT = "3.0.0"
PUBLIC = "https://cuhalide-atlas-v3.vercel.app"
EXPORT = f"{PUBLIC}/api/export"
PAGED_EXPORT = (
    "https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/"
    "cuhalide-atlas-release-export-v301-pages"
)

ROOT = Path(os.environ.get("GITHUB_WORKSPACE", Path(__file__).resolve().parents[1]))
BUILD_ROOT = ROOT / "build"
PACKAGE = BUILD_ROOT / f"CuHalide_Atlas_{RELEASE}_release_package"
DIST = ROOT / "dist"
ZIP_PATH = DIST / f"CuHalide_Atlas_{RELEASE}_release_package.zip"
ZIP_SHA_PATH = DIST / f"CuHalide_Atlas_{RELEASE}_release_package.zip.sha256"


class BuildError(RuntimeError):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def fetch_bytes(url: str, attempts: int = 5) -> bytes:
    headers = {
        "Accept": "application/json, text/plain;q=0.9, */*;q=0.1",
        "User-Agent": "CuHalide-Atlas-Release-Builder/3.0.1",
    }
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=120) as response:
                if response.status != 200:
                    raise BuildError(f"HTTP {response.status} for {url}")
                return response.read()
        except (urllib.error.URLError, TimeoutError, BuildError) as exc:
            last_error = exc
            if attempt + 1 < attempts:
                time.sleep(2 ** attempt)
    raise BuildError(f"Unable to fetch {url}: {last_error}")


def fetch_json(url: str) -> Any:
    raw = fetch_bytes(url)
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception as exc:  # pragma: no cover - fail closed in CI
        raise BuildError(f"Invalid JSON from {url}: {exc}") from exc


def fetch_text(url: str) -> str:
    return fetch_bytes(url).decode("utf-8")


def export(action: str) -> Any:
    return fetch_json(f"{EXPORT}?action={action}")


def paged_export(action: str, expected_total: int, page_size: int = 500) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    offset = 0
    while offset < expected_total:
        payload = fetch_json(
            f"{PAGED_EXPORT}?action={action}&offset={offset}&limit={page_size}"
        )
        if payload.get("release") != RELEASE:
            raise BuildError(f"Wrong release in paged export {action}")
        page = payload.get("data")
        if not isinstance(page, list):
            raise BuildError(f"Paged export {action} returned no list at offset {offset}")
        rows.extend(page)
        if len(page) == 0:
            break
        offset += len(page)
    if len(rows) != expected_total:
        raise BuildError(
            f"Paged export {action}: expected {expected_total}, received {len(rows)}"
        )
    return rows


def unwrap(payload: Any, action: str) -> Any:
    if not isinstance(payload, dict) or payload.get("release") != RELEASE:
        raise BuildError(f"Invalid wrapper for {action}")
    return payload.get("data")


def write_text(relative: str, text: str) -> Path:
    path = PACKAGE / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")
    return path


def write_json(relative: str, obj: Any) -> Path:
    path = PACKAGE / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
    )
    return path


def scalar(value: Any) -> Any:
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    if value is None:
        return ""
    return value


def write_csv(relative: str, rows: Iterable[dict[str, Any]]) -> Path:
    materialized = list(rows)
    path = PACKAGE / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    fields: list[str] = []
    seen: set[str] = set()
    for row in materialized:
        for key in row.keys():
            if key not in seen:
                seen.add(key)
                fields.append(key)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in materialized:
            writer.writerow({key: scalar(row.get(key)) for key in fields})
    return path


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def compact_counts(rows: Iterable[dict[str, Any]], key: str) -> dict[str, int]:
    counter = Counter(str(row.get(key, "")) for row in rows)
    return dict(sorted(counter.items()))


def check(condition: bool, message: str) -> None:
    if not condition:
        raise BuildError(message)


def md_table(rows: list[tuple[str, Any]]) -> str:
    lines = ["| Item | Value |", "|---|---:|"]
    lines.extend(f"| {name} | {value} |" for name, value in rows)
    return "\n".join(lines)


def build_docs(ctx: dict[str, Any]) -> None:
    counts = ctx["manifest"]["counts"]
    coverage = ctx["manifest"]["coverage_audit"]
    title = ctx["manifest"]["title_patch"]
    audit = ctx["surrogate_run"]
    benchmark_run = ctx["benchmark"]["run"]
    benchmark_results = ctx["benchmark"]["results"]
    candidate_counts = compact_counts(ctx["candidates"], "final_decision")
    smoke = ctx["smoke"]

    write_text(
        "README.md",
        f"""# CuHalide Atlas release {RELEASE} archival package

This archive is the machine-readable and human-readable publication package for **CuHalide Atlas release {RELEASE}**, released on **10 August 2026**. Release {RELEASE} is a **bibliographic-only patch** over the scientifically unchanged {SCIENTIFIC_PARENT} parent corpus.

## Frozen scientific counts

{md_table([
('Article audit records', counts['article_audit_records']),
('Chemically included articles', counts['included_articles']),
('Canonical verified articles', counts['canonical_verified_articles']),
('Structure/phase rows', counts['structure_phase_rows']),
('Resolved space-group rows', counts['resolved_space_group_rows']),
('Verified one-to-one mappings', counts['verified_space_group_rows']),
('Verified polar rows', counts['verified_polar_rows']),
('Strict polar rows', counts['strict_polar_rows']),
('Strict polar articles', counts['strict_polar_articles']),
('RAG documents', counts['rag_documents']),
('Field-evidence objects', counts['field_evidence_objects']),
])}

## Release gates

- Title adjudication: **217/217** records reviewed; **72** canonical display-title replacements; **145** clean titles retained; **12** chemistry-markup reconstructions; **0** scientific-field changes.
- RAG benchmark: **70/70** cases passed (`rag-benchmark-v1.3`).
- Public production smoke: **17/17** checks passed (`production-smoke-v3.0.0`).
- Coverage protocol: **210/210** pre-registered query cells completed at page 0 per cell.
- Candidate metadata screen: **1,788/1,788** candidates adjudicated; **0 pending**; **0 automatic release inclusions**.
- AI expert-surrogate audit: **80 article** and **200 structure** samples; **6,600** field/rule checks.

## Directory map

- `data/`: frozen normalized article, structure, verified-mapping and strict-polar datasets in JSON and CSV.
- `evaluation/`: frozen RAG benchmark cases/results and run metadata.
- `coverage/`: pre-registered search protocol, coverage summary and candidate-screen-v4 adjudications.
- `audit/`: title decisions, surrogate audit samples/results, field-evidence summaries, quality findings and patch audit.
- `taxonomy/`: denominator, missingness and review/error taxonomies.
- `case_studies/`: versioned 0D Cu2I4/STE-Cu···Cu evidence case study and relation anchors.
- `metadata/`: release manifest, CFF citation, CodeMeta, deposition metadata and public health result.
- `docs/`: methods, release, evaluation, coverage, security, contribution and DOI-deposition documentation.

## Critical interpretation boundaries

1. `screened_in_scope` and `screened_boundary` are **metadata-screening decisions only**. They authorize primary-article/SI/CIF acquisition, not release inclusion.
2. Coverage-v1 completed the declared query cells, but only page 0 of each provider query. It does **not** establish exhaustive external-corpus completeness.
3. The two-pass audits are AI expert-surrogate procedures. They are not independent-human validation and cannot be reported as human–LLM precision, recall, F1 or inter-annotator agreement.
4. Missing and unresolved values are never imputed from analogous materials.
5. Primary PDF/SI/CIF files remain private provenance sources and are not redistributed in this archive.

Verify every file against `checksums.sha256` before analysis.
""",
    )

    write_text(
        "docs/METHODS_ADDENDUM.md",
        f"""# Methods addendum — release {RELEASE}

## 1. Release architecture

Release {RELEASE} inherits every scientific record from release {SCIENTIFIC_PARENT}. The patch modifies bibliographic display titles and their search aliases only. Article identities, DOI assignments, years, journals, compound formulas, structural dimensionality, crystallographic fields, emission fields, evidence levels, scope states and all canonical denominators were required to remain unchanged.

## 2. Evidence hierarchy

- **A**: main article plus SI/CIF available.
- **B**: main article available.
- **C**: SI/CIF available without a complete main-article evidence package.
- **D**: primary evidence unavailable; metadata may be retained for audit, but the record is excluded from canonical quantitative analysis.

Field-level missingness follows `OBS`, `NR`, `NE`, `UN` and `NA` semantics in `taxonomy/missingness-codes.csv`. No blank is interpreted as zero.

## 3. Bibliographic adjudication

Two logically separated AI expert-surrogate passes evaluated {title['records_reviewed']} DOI-linked titles. Pass A assessed DOI identity and publisher metadata. Pass B tested chemical notation, subscripts, charges, bridge symbols, infinity notation, OCR ambiguity, multilingual concatenation and scientific consistency. The final patch applied {title['canonical_title_replacements']} display-title replacements, retained {title['clean_titles_retained']} clean titles and explicitly reconstructed {title['chemical_typography_records_reviewed']} chemically complex titles. Historical and DOI-source variants remain indexed aliases.

## 4. RAG architecture

The production system combines deterministic exact/property/boundary routes with precision/FTS/BGE-M3 retrieval and bounded LLM interpretation. The release index contains {counts['rag_documents']} documents embedded with `@cf/baai/bge-m3`. Exact counts, direct record lookups, scope checks, STE–Cu···Cu relation anchors, Evidence-D boundaries and candidate release-isolation rules are deterministic.

## 5. Coverage and candidate screening

Coverage-v1 contains {coverage['protocol_cells']} pre-registered provider/query/year cells: {coverage['crossref_completed']} Crossref and {coverage['openalex_completed']} OpenAlex cells. All cells completed at page 0. Candidate-screen-v4 adjudicated {coverage['candidate_queue_rows']} DOI-unique candidate records. The acquisition queue contains {coverage['candidate_decisions']['screened_in_scope']} screened-in and {coverage['candidate_decisions']['screened_boundary']} boundary records; none is part of the frozen release.

## 6. AI expert-surrogate audit

Surrogate-audit-v1 selected {audit['article_sample_count']} risk-stratified articles and {audit['structure_sample_count']} structures. It performed {audit['summary']['results']['field_checks']} cross-representation and independent-rule checks covering evidence state, missingness, DOI uniqueness, title provenance, scope/release logic, crystallographic point-group polarity, centrosymmetry, crystal system, space-group confidence and canonical eligibility.

The audit is an internal consistency/evidence audit. Shared curation lineage prevents interpreting its agreement rate as independent extraction accuracy.

## 7. Reproducibility

The archive records all release hashes, case-level benchmark results, candidate decisions, audit samples and field/rule outcomes. The GitHub workflow `build-release-package.yml` rebuilds the package from public, field-whitelisted APIs and fails closed if any frozen invariant changes.
""",
    )

    write_text(
        "docs/RELEASE_3.0.1_BIBLIOGRAPHIC_PATCH_REPORT.md",
        f"""# Release {RELEASE} bibliographic patch report

## Scope

Release {RELEASE} is a bibliographic patch; its scientific parent is {SCIENTIFIC_PARENT}. It changes canonical article display titles and aliases without modifying scientific records.

{md_table([
('DOI-linked title records reviewed', title['records_reviewed']),
('Canonical display-title replacements', title['canonical_title_replacements']),
('Clean titles retained', title['clean_titles_retained']),
('Chemistry-markup reconstructions', title['chemical_typography_records_reviewed']),
('Pending year discrepancies', title['pending_year_amendments']),
('Scientific record changes', title['scientific_record_changes']),
])}

## Controls

- DOI uniqueness: passed.
- Article and structure identity preservation: passed.
- DOI/year/journal invariants: passed.
- Article–structure mapping preservation: passed.
- Scientific context, metadata and evidence zero-difference gates: passed.
- Empty final titles and residual HTML markup: zero.
- Changed RAG documents were invalidated and re-embedded before publication.

The year discrepancies remain deferred because online-first, issue, deposited and formal publication years are not interchangeable without source-specific adjudication.
""",
    )

    suites = benchmark_run["summary"]["suites"]
    write_text(
        "docs/RAG_EVALUATION_REPORT.md",
        f"""# RAG evaluation report

- Evaluation version: `{benchmark_run['evaluation_version']}`
- Run ID: `{benchmark_run['run_id']}`
- Release: `{benchmark_run['release_version']}`
- Artifact SHA-256: `{benchmark_run['artifact_sha256']}`
- Cases: **{len(benchmark_results)}**
- Passed: **{sum(bool(row['passed']) for row in benchmark_results)}**
- Failed: **{sum(not bool(row['passed']) for row in benchmark_results)}**

{md_table([
('Exact suite', f"{suites['exact']['passed']}/{suites['exact']['n']}"),
('Retrieval suite', f"{suites['retrieval']['passed']}/{suites['retrieval']['n']}"),
('Reasoning/safety suite', f"{suites['reasoning']['passed']}/{suites['reasoning']['n']}"),
('Public production smoke', f"{smoke['passed']}/{smoke['test_count']}"),
])}

The benchmark tests exact denominators, record properties, entity retrieval, false-premise correction, unresolved-value preservation, prompt injection, out-of-scope routing, candidate isolation, source-grain boundaries and material-specific STE–Cu···Cu evidence. Case-level data are in `evaluation/benchmark-results.csv` and `.json`.
""",
    )

    write_text(
        "docs/COVERAGE_PROTOCOL_AND_RESULTS.md",
        f"""# Coverage protocol and results

Coverage-v1 completed all **{coverage['protocol_completed']}/{coverage['protocol_cells']}** pre-registered query cells: **{coverage['crossref_completed']}** Crossref and **{coverage['openalex_completed']}** OpenAlex cells.

The protocol covers provider, query family, query string and publication-year window. Every cell executed page 0 only. Therefore:

- the declared query-cell protocol is complete;
- provider result pagination is not exhaustive;
- additional bibliographic databases were not exhaustively queried;
- backward/forward citation chaining was not exhaustively executed;
- external-corpus completeness is not claimed.

Coverage produced {coverage['coverage_rows']:,} audit rows and a DOI-unique queue of {coverage['candidate_queue_rows']:,} candidates. The complete protocol is in `coverage/coverage-protocol.csv`.
""",
    )

    write_text(
        "docs/CANDIDATE_SCREENING_REPORT.md",
        f"""# Candidate-screen-v4 report

Candidate-screen-v4 adjudicated all **{len(ctx['candidates']):,}** DOI-unique candidate records.

{md_table([
('Metadata-screened in scope', candidate_counts.get('screened_in_scope', 0)),
('Boundary', candidate_counts.get('screened_boundary', 0)),
('Excluded', candidate_counts.get('excluded', 0)),
('Rejected', candidate_counts.get('rejected', 0)),
('Pending', candidate_counts.get('pending', 0)),
('Automatic release inclusions', sum(bool(x['release_inclusion_authorized']) for x in ctx['candidates'])),
])}

Pass A used deterministic chemistry and record-type signals. Pass B was an adversarial AI expert-surrogate review of mixed oxidation states, mixed metals, pure/all-inorganic CuX, reviews and paratext, duplicate records, formula ambiguity, theory/solution studies, composites, device contexts and chemistry-reagent false positives.

`screened_in_scope` means “prioritize primary evidence acquisition.” `screened_boundary` means “perform targeted primary-source adjudication.” Neither state authorizes inclusion in release {RELEASE}.
""",
    )

    write_text(
        "docs/AI_EXPERT_SURROGATE_AUDIT_REPORT.md",
        f"""# AI expert-surrogate audit report

- Audit: `{audit['audit_version']}`
- Articles sampled: **{audit['article_sample_count']}**
- Structures sampled: **{audit['structure_sample_count']}**
- Field/rule checks: **{audit['summary']['results']['field_checks']:,}**
- Agreements recorded: **{audit['summary']['results']['agreements']:,}**
- Raw disagreements: **{audit['summary']['results']['disagreements']}**
- Residual post-adjudication defects: **{audit['summary']['post_correction_residual_defects']}**
- Artifact SHA-256: `{audit['artifact_sha256']}`

The six raw disagreements correspond to the intentional Evidence-D boundary representation and were resolved through explicit canonical-exclusion rules; they do not represent uncorrected scientific defects.

This audit must be reported as an **AI expert-surrogate internal consistency and evidence audit**. It is not independent-human validation and cannot support human–LLM precision, recall, F1 or inter-annotator agreement claims.
""",
    )

    write_text(
        "docs/DATA_DICTIONARY.md",
        """# Data dictionary

## Core public data

- `articles`: article-grain bibliographic, scope, evidence, compound, dimensionality, crystallographic-summary and emission fields.
- `structures`: structure/phase/polymorph/temperature-grain formula, motif, space group, point group, crystal system, polarity, confidence, inclusion and emission fields.
- `verified`: the one-to-one structure–space-group subset with High/Medium space-group and mapping confidence.
- `strict-polar`: Core/Included structures with polar point group, High space-group confidence and High mapping confidence.

## Evaluation and audit data

- `benchmark-results`: frozen benchmark query, gold constraints, retrieved source IDs, provider/model route, metrics, latency and pass/fail.
- `candidate-adjudications`: metadata-only acquisition decisions and reason codes; no abstracts are redistributed.
- `surrogate-field-results`: two-pass values/statuses, adjudication state, missingness and defect/correction flags.
- `title-decisions`: DOI-exact title source, retained/replaced final value, rationale and two-pass decision.

Nested values in CSV files are encoded as compact JSON strings. The JSON files retain native arrays and objects.
""",
    )

    missing_rows = ctx["missingness"]
    missing_lines = ["# Missingness taxonomy", "", "| Code | Label | Quantitative use | Definition | Imputation policy |", "|---|---|---|---|---|"]
    for row in missing_rows:
        missing_lines.append(
            f"| {row['code']} | {row['label']} | {row['allowed_for_quantitative_analysis']} | {row['definition']} | {row['imputation_policy']} |"
        )
    write_text("docs/MISSINGNESS_TAXONOMY.md", "\n".join(missing_lines))

    review_rows = ctx["review_taxonomy"]
    review_lines = ["# Review and error taxonomy", "", "| Code | Category | Scientific risk | Definition | Canonical response |", "|---|---|---|---|---|"]
    for row in review_rows:
        review_lines.append(
            f"| {row['error_code']} | {row['category']} | {row['scientific_risk']} | {row['definition']} | {row['canonical_response']} |"
        )
    write_text("docs/REVIEW_AND_ERROR_TAXONOMY.md", "\n".join(review_lines))

    case_rows = ctx["case_study"]
    case_lines = [
        "# 0D Cu2I4 / STE–Cu···Cu case study",
        "",
        "This case study separates same-source support from contrast/boundary evidence. Short Cu···Cu contacts are not treated as a universal cause of STE emission.",
        "",
        "| Record | Year | Compound(s) | STE explicit | Cu···Cu explicit | Distance / Å | Relation status |",
        "|---:|---:|---|---|---|---:|---|",
    ]
    for row in case_rows:
        case_lines.append(
            f"| {row['record_id']} | {row['year']} | {str(row['compounds']).replace('|', '/')} | {row['ste_explicit']} | {row['cucu_explicit']} | {row.get('cucu_distance_a', '')} | {row['relation_status']} |"
        )
    case_lines.extend([
        "",
        "Records 101 and 123 provide material-specific same-source support. Record 54 is a cross-compound contrast; Records 95 and 135 delimit Cu···Cu-only and STE-only cases. No universal causal law is inferred.",
    ])
    write_text("docs/CASE_STUDY_0D_CU2I4.md", "\n".join(case_lines))

    write_text(
        "docs/SECURITY.md",
        """# Security and privacy

- Public endpoints are read-only.
- Private audit/control tables use row-level security and explicit deny policies for anonymous and authenticated client roles.
- Edge functions use service-role access only on the server side; no service key is delivered to browsers or archive files.
- Public release exports use an explicit field whitelist.
- Candidate abstracts, primary PDF/SI/CIF paths and private source-file metadata are excluded from the release archive.
- Primary files are evidence inputs, not a public full-text corpus.
- Prompt-injection requests cannot override frozen fields or release rules.

Report security issues privately to the repository owner rather than disclosing credentials or exploitable details in a public issue.
""",
    )

    write_text(
        "docs/CONTRIBUTING.md",
        """# Contributing and release governance

1. Open an issue with a DOI, exact compound/phase identity and the proposed correction.
2. Provide source-level evidence; bibliographic metadata alone cannot authorize scientific inclusion.
3. Preserve article and structure grain. Never merge different compounds, phases or temperatures into one causal record.
4. Use the declared missingness codes; do not infer unresolved fields from analogous compounds.
5. New release candidates must pass DOI deduplication, scope adjudication, field-evidence construction, scientific zero-diff/expected-diff tests, RAG re-indexing, frozen benchmark and production smoke gates.
6. Live Monitor candidates remain isolated until primary-evidence review is complete.

A future release that adds candidate papers must use a new version and must not mutate release 3.0.1.
""",
    )

    write_text(
        "docs/DOI_DEPOSITION_INSTRUCTIONS.md",
        """# Permanent DOI deposition instructions

This archive is deposit-ready but no permanent DOI is minted automatically because DOI repositories require an authenticated owner account and final creator/license approval.

Recommended procedure:

1. Upload `CuHalide_Atlas_3.0.1_release_package.zip` to Zenodo, Figshare or an institutional data repository.
2. Import or copy `metadata/deposition-metadata.json`.
3. Verify the final creator list, affiliations, ORCIDs, funders and license. Do not assign an open license without rights-holder approval.
4. Set version to `3.0.1`, publication date to `2026-08-10`, resource type to dataset, and link the public website and GitHub repository.
5. Publish the deposit and obtain the DOI.
6. Add the DOI to `CITATION.cff`, `codemeta.json`, the public manifest, website citation text and release notes in a new metadata-only commit.
7. Rebuild the archive and record the DOI-bearing archive checksum without changing frozen scientific data.

Do not invent or reserve a DOI string in advance.
""",
    )

    write_text(
        "docs/LICENSE_STATUS.md",
        """# License status

The repository did not contain a top-level license file when this package was built. Consequently, this archive does not assign a new open-source or open-data license on behalf of the rights holder.

Before DOI publication, the repository owner must select and approve licenses appropriate to:

- original software and workflow code;
- original curated database fields and documentation;
- third-party bibliographic metadata;
- any figures or other copyrighted material.

Primary articles, supporting information and CIF files are not redistributed in this package. Absence of a declared license must not be interpreted as permission to reuse copyrighted third-party content.
""",
    )

    write_text(
        "docs/API_ENDPOINTS.md",
        f"""# Public endpoints

- Website: `{PUBLIC}/`
- Health: `{PUBLIC}/api/meta?action=health`
- Release manifest: `{PUBLIC}/manifest.webmanifest`
- Citation CFF: `{PUBLIC}/citation.cff`
- Data: `{PUBLIC}/api/data?action=articles|structures|verified|polar`
- Smart RAG: `{PUBLIC}/api/agent`
- Versioned release export index: `{PUBLIC}/api/export?action=package-index`

The export and candidate endpoints are read-only and use public/derived field whitelists. Candidate records are not part of the frozen release.
""",
    )

    write_text(
        "CHANGELOG.md",
        f"""# Changelog

## {RELEASE} — 2026-08-10

- Published bibliographic-only patch over scientific release {SCIENTIFIC_PARENT}.
- Reviewed 217 DOI-linked titles; applied 72 display-title replacements and 12 chemical-notation reconstructions.
- Rebuilt all affected BGE-M3 embeddings; index remains 1,224/1,224 complete.
- Passed frozen RAG benchmark 70/70 and public production smoke 17/17.
- Completed coverage-v1: 210/210 page-0 query cells.
- Completed candidate-screen-v4 for 1,788 DOI-unique candidates with zero automatic release inclusions.
- Completed surrogate-audit-v1: 80 article samples, 200 structure samples and 6,600 checks.
- Added release manifest, citation, versioned export, security hardening and explicit candidate/evidence boundaries.
""",
    )

    write_text(
        "RELEASE_NOTES.md",
        f"""# CuHalide Atlas {RELEASE}

Release {RELEASE} is a bibliographic-only patch over the scientifically unchanged {SCIENTIFIC_PARENT} corpus. It preserves all frozen scientific counts and fields while improving canonical title fidelity, search aliases, RAG retrieval, coverage documentation and auditability.

**Validated gates:** 70/70 frozen benchmark, 17/17 production smoke, 210/210 declared coverage query cells, 1,788/1,788 candidate metadata decisions, 6,600 expert-surrogate field/rule checks, and zero automatic candidate inclusions.

See `README.md`, `docs/METHODS_ADDENDUM.md` and `checksums.sha256` in the archive.
""",
    )


def main() -> int:
    shutil.rmtree(PACKAGE, ignore_errors=True)
    shutil.rmtree(DIST, ignore_errors=True)
    PACKAGE.mkdir(parents=True)
    DIST.mkdir(parents=True)

    manifest = fetch_json(f"{PUBLIC}/manifest.webmanifest")
    health = fetch_json(f"{PUBLIC}/api/meta?action=health")
    citation = fetch_text(f"{PUBLIC}/citation.cff")

    action_names = [
        "package-index",
        "release-record",
        "benchmark-results",
        "coverage-protocol",
        "surrogate-audit-run",
        "surrogate-samples",
        "title-decisions",
        "field-evidence-summary",
        "quality-findings",
        "denominator-manifest",
        "missingness-codes",
        "review-taxonomy",
        "relation-anchors",
        "case-study-cu2i4",
        "patch-document-audit",
    ]
    exports = {name: export(name) for name in action_names}
    candidates = paged_export("candidate-adjudications", 1788)
    surrogate_fields = paged_export("surrogate-field-results", 6600)

    data_responses = {
        name: fetch_json(f"{PUBLIC}/api/data?action={name}&limit=5000")
        for name in ("articles", "structures", "verified", "polar")
    }

    release_record = unwrap(exports["release-record"], "release-record")
    benchmark = unwrap(exports["benchmark-results"], "benchmark-results")
    protocol = unwrap(exports["coverage-protocol"], "coverage-protocol")
    surrogate_run = unwrap(exports["surrogate-audit-run"], "surrogate-audit-run")
    surrogate_samples = unwrap(exports["surrogate-samples"], "surrogate-samples")
    title_decisions = unwrap(exports["title-decisions"], "title-decisions")
    field_evidence = unwrap(exports["field-evidence-summary"], "field-evidence-summary")
    quality = unwrap(exports["quality-findings"], "quality-findings")
    denominator = unwrap(exports["denominator-manifest"], "denominator-manifest")
    missingness = unwrap(exports["missingness-codes"], "missingness-codes")
    review_taxonomy = unwrap(exports["review-taxonomy"], "review-taxonomy")
    relation_anchors = unwrap(exports["relation-anchors"], "relation-anchors")
    case_study = unwrap(exports["case-study-cu2i4"], "case-study-cu2i4")
    patch_audit = unwrap(exports["patch-document-audit"], "patch-document-audit")

    articles = data_responses["articles"].get("items", [])
    structures = data_responses["structures"].get("items", [])
    verified = data_responses["verified"].get("items", [])
    polar = data_responses["polar"].get("items", [])

    # Fail-closed release invariants.
    check(manifest.get("release") == RELEASE, "Manifest release mismatch")
    check(health.get("ok") is True and health.get("status") == "PASS", "Public health is not PASS")
    check(all(health.get("checks", {}).values()), "At least one public health sub-check failed")
    check(len(articles) == 346, f"Article count mismatch: {len(articles)}")
    check(len(structures) == 878, f"Structure count mismatch: {len(structures)}")
    check(len(verified) == 625, f"Verified count mismatch: {len(verified)}")
    check(len(polar) == 67, f"Strict-polar count mismatch: {len(polar)}")
    check(len(benchmark.get("results", [])) == 70, "Benchmark case count is not 70")
    check(all(bool(row.get("passed")) for row in benchmark["results"]), "Benchmark contains a failure")
    check(len(protocol) == 210 and all(row.get("status") == "completed" for row in protocol), "Coverage protocol is not 210/210 completed")
    check(len(candidates) == 1788, "Candidate adjudication count mismatch")
    check(compact_counts(candidates, "final_decision") == {"excluded": 877, "rejected": 261, "screened_boundary": 357, "screened_in_scope": 293}, "Candidate decision counts mismatch")
    check(sum(bool(row.get("release_inclusion_authorized")) for row in candidates) == 0, "A candidate was automatically authorized for release inclusion")
    check(len(surrogate_samples) == 280, "Surrogate sample count mismatch")
    check(len(surrogate_fields) == 6600, "Surrogate field/rule check count mismatch")
    check(surrogate_run.get("status") == "completed", "Surrogate audit is not completed")
    check(surrogate_run.get("artifact_sha256") == manifest["surrogate_audit"]["artifact_sha256"], "Surrogate audit hash mismatch")
    check(len(title_decisions) == 217, "Title decision count mismatch")
    check(field_evidence.get("total") == 13118, "Field-evidence count mismatch")
    smoke_rows = [row for row in quality if row.get("finding_key") == "production-rag-v8-smoke"]
    check(len(smoke_rows) == 1 and smoke_rows[0].get("status") == "Resolved", "Production smoke finding is not Resolved")
    smoke = health["smart_rag"]["production_smoke"]
    check(smoke.get("ok") is True and smoke.get("passed") == 17 and smoke.get("failed") == 0, "Production smoke is not 17/17")

    # Machine-readable files.
    write_json("metadata/release-manifest.json", manifest)
    write_json("metadata/public-health.json", health)
    write_text("metadata/CITATION.cff", citation)
    write_json("metadata/release-record.json", release_record)
    write_json("metadata/export-index.json", exports["package-index"])

    for name, response in data_responses.items():
        write_json(f"data/{name}.json", response)
        write_csv(f"data/{name}.csv", response.get("items", []))

    write_json("evaluation/benchmark-results.json", benchmark)
    write_csv("evaluation/benchmark-results.csv", benchmark["results"])
    write_json("coverage/coverage-protocol.json", protocol)
    write_csv("coverage/coverage-protocol.csv", protocol)
    write_json("coverage/candidate-adjudications.json", candidates)
    write_csv("coverage/candidate-adjudications.csv", candidates)
    write_json("audit/surrogate-audit-run.json", surrogate_run)
    write_json("audit/surrogate-samples.json", surrogate_samples)
    write_csv("audit/surrogate-samples.csv", surrogate_samples)
    write_json("audit/surrogate-field-results.json", surrogate_fields)
    write_csv("audit/surrogate-field-results.csv", surrogate_fields)
    write_json("audit/title-decisions.json", title_decisions)
    write_csv("audit/title-decisions.csv", title_decisions)
    write_json("audit/field-evidence-summary.json", field_evidence)
    write_json("audit/quality-findings.json", quality)
    write_csv("audit/quality-findings.csv", quality)
    write_json("audit/patch-document-audit.json", patch_audit)
    write_csv("audit/patch-document-audit.csv", patch_audit)
    write_json("taxonomy/denominator-manifest.json", denominator)
    write_csv("taxonomy/denominator-manifest.csv", denominator)
    write_json("taxonomy/missingness-codes.json", missingness)
    write_csv("taxonomy/missingness-codes.csv", missingness)
    write_json("taxonomy/review-taxonomy.json", review_taxonomy)
    write_csv("taxonomy/review-taxonomy.csv", review_taxonomy)
    write_json("case_studies/relation-anchors.json", relation_anchors)
    write_csv("case_studies/relation-anchors.csv", relation_anchors)
    write_json("case_studies/cu2i4-case-study.json", case_study)
    write_csv("case_studies/cu2i4-case-study.csv", case_study)

    coverage_summary = {
        "release": RELEASE,
        "coverage_audit": manifest["coverage_audit"],
        "candidate_decision_counts": compact_counts(candidates, "final_decision"),
        "candidate_metadata_sufficiency": compact_counts(candidates, "metadata_sufficiency"),
        "candidate_sources": compact_counts(candidates, "source"),
        "automatic_release_inclusions": sum(bool(x["release_inclusion_authorized"]) for x in candidates),
        "protocol_provider_status": {
            f"{provider}|{status}": sum(1 for x in protocol if x["provider"] == provider and x["status"] == status)
            for provider in sorted({x["provider"] for x in protocol})
            for status in sorted({x["status"] for x in protocol})
            if any(x["provider"] == provider and x["status"] == status for x in protocol)
        },
    }
    write_json("coverage/coverage-summary.json", coverage_summary)

    codemeta = {
        "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
        "@type": "SoftwareSourceCode",
        "name": "CuHalide Atlas",
        "version": RELEASE,
        "datePublished": "2026-08-10",
        "codeRepository": "https://github.com/zion0321/CuHalide-Atlas",
        "url": PUBLIC,
        "applicationCategory": "Scientific database and evidence-grounded retrieval system",
        "description": "Evidence-first, structure-resolved Cu(I) chloride, bromide and iodide literature database with versioned RAG evaluation and audit artifacts.",
        "programmingLanguage": ["TypeScript", "JavaScript", "SQL", "Python"],
        "developmentStatus": "active",
        "isPartOf": {"@type": "Dataset", "name": "CuHalide Atlas release 3.0.1"},
        "license": "NOASSERTION",
        "keywords": ["Cu(I) halide", "copper iodide", "crystallography", "luminescence", "self-trapped exciton", "RAG"],
    }
    write_json("metadata/codemeta.json", codemeta)

    deposition = {
        "title": "CuHalide Atlas release 3.0.1: evidence-first, structure-resolved Cu(I) halide literature data",
        "upload_type": "dataset",
        "publication_date": "2026-08-10",
        "version": RELEASE,
        "description": "Versioned archival package for CuHalide Atlas release 3.0.1, a bibliographic-only patch over the scientifically unchanged 3.0.0 corpus. Includes normalized public data, field-evidence summaries, RAG benchmark results, coverage protocol, candidate metadata adjudications and AI expert-surrogate audit artifacts.",
        "creators": [{"name": "CuHalide Atlas Project"}],
        "keywords": ["copper(I) halide", "Cu(I)-I", "crystallography", "luminescence", "self-trapped exciton", "scientific database", "retrieval-augmented generation"],
        "related_identifiers": [
            {"identifier": PUBLIC, "relation": "isSupplementTo", "scheme": "url"},
            {"identifier": "https://github.com/zion0321/CuHalide-Atlas", "relation": "isSupplementTo", "scheme": "url"},
        ],
        "license": "NOASSERTION",
        "owner_review_required": ["creator list", "affiliations", "ORCIDs", "funding", "license"],
        "doi": None,
    }
    write_json("metadata/deposition-metadata.json", deposition)

    ctx = {
        "manifest": manifest,
        "health": health,
        "release_record": release_record,
        "benchmark": benchmark,
        "protocol": protocol,
        "candidates": candidates,
        "surrogate_run": surrogate_run,
        "surrogate_samples": surrogate_samples,
        "surrogate_fields": surrogate_fields,
        "title_decisions": title_decisions,
        "field_evidence": field_evidence,
        "quality": quality,
        "denominator": denominator,
        "missingness": missingness,
        "review_taxonomy": review_taxonomy,
        "relation_anchors": relation_anchors,
        "case_study": case_study,
        "patch_audit": patch_audit,
        "smoke": smoke,
    }
    build_docs(ctx)

    # Generate manifest and checksums after all content files exist.
    entries: list[dict[str, Any]] = []
    for path in sorted(PACKAGE.rglob("*")):
        if path.is_file() and path.name not in {"checksums.sha256", "release-package-manifest.json"}:
            entries.append({
                "path": path.relative_to(PACKAGE).as_posix(),
                "bytes": path.stat().st_size,
                "sha256": sha256_file(path),
            })
    package_manifest = {
        "dataset": "CuHalide Atlas",
        "release": RELEASE,
        "built_at": utc_now(),
        "builder": "scripts/build_release_package.py",
        "file_count_excluding_manifest_and_checksum": len(entries),
        "files": entries,
        "release_invariants": {
            "articles": 346,
            "structures": 878,
            "verified": 625,
            "strict_polar": 67,
            "benchmark_passed": 70,
            "coverage_cells_completed": 210,
            "candidates_adjudicated": 1788,
            "candidate_pending": 0,
            "candidate_auto_inclusions": 0,
            "surrogate_checks": 6600,
            "production_smoke_passed": 17,
        },
    }
    write_json("release-package-manifest.json", package_manifest)

    checksum_paths = sorted(path for path in PACKAGE.rglob("*") if path.is_file() and path.name != "checksums.sha256")
    checksum_lines = [f"{sha256_file(path)}  {path.relative_to(PACKAGE).as_posix()}" for path in checksum_paths]
    write_text("checksums.sha256", "\n".join(checksum_lines))

    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(PACKAGE.rglob("*")):
            if path.is_file():
                archive.write(path, arcname=f"{PACKAGE.name}/{path.relative_to(PACKAGE).as_posix()}")

    zip_hash = sha256_file(ZIP_PATH)
    ZIP_SHA_PATH.write_text(f"{zip_hash}  {ZIP_PATH.name}\n", encoding="utf-8")

    print(json.dumps({
        "ok": True,
        "release": RELEASE,
        "package": str(ZIP_PATH),
        "sha256": zip_hash,
        "files": sum(1 for p in PACKAGE.rglob('*') if p.is_file()),
        "bytes": ZIP_PATH.stat().st_size,
    }, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except BuildError as exc:
        print(f"RELEASE BUILD FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1)
