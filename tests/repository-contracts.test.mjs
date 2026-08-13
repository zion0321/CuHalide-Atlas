import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const expectIncludes = (text, values, label) => {
  for (const value of values) {
    assert.ok(text.includes(value), `${label} must include ${JSON.stringify(value)}`);
  }
};

test('machine-readable frozen release identity is synchronized', () => {
  const codemeta = JSON.parse(read('codemeta.json'));
  assert.equal(codemeta.version, '3.0.2');
  assert.equal(codemeta.datePublished, '2026-08-11');
  assert.equal(codemeta.isPartOf?.name, 'CuHalide Atlas Frozen Release 3.0.2');
  assert.equal(codemeta.license, 'NOASSERTION');

  const citation = read('CITATION.cff');
  expectIncludes(citation, ['version: "3.0.2"', 'date-released: "2026-08-11"'], 'CITATION.cff');
});

test('current public runtime identities remain synchronized', () => {
  const readme = read('README.md');
  expectIncludes(readme, [
    'Current Curated rev.2',
    'Public Data: **2.9.0**',
    'Smart RAG: **9.14.0**',
    'Metadata / health: **48.3**',
    'Motif Atlas schema: **1.1**',
    '1,305 / 1,305',
  ], 'README.md');

  expectIncludes(read('api/public-data.js'), ['2.9.0'], 'api/public-data.js');
  expectIncludes(read('api/agent.js'), ['9.14.0'], 'api/agent.js');
  expectIncludes(read('api/meta.js'), ['48.3'], 'api/meta.js');
  expectIncludes(read('api/motifs.js'), ["CURRENT_REVISION='2'", "CONTENT_DATE='2026-08-13'"], 'api/motifs.js');
});

test('public/private boundary cannot silently regress to bulk export', () => {
  const exportRoute = read('api/export.js');
  expectIncludes(exportRoute, [
    "const RELEASE = '3.0.2'",
    'res.statusCode = 410',
    "public_access: 'query-and-view'",
  ], 'api/export.js');

  const security = read('SECURITY.md');
  expectIncludes(security, ['query-and-view', '`/api/export` is intentionally retired and returns HTTP 410'], 'SECURITY.md');
  assert.ok(!security.includes('Public release exports use explicit field whitelists'), 'obsolete public-export wording must not return');
});

test('Record 13 erratum is resolved by 3.0.2, not described as a future hotfix', () => {
  const errata = read('ERRATA.md');
  expectIncludes(errata, ['resolved and superseded by **Frozen Release 3.0.2**', 'CUH-013-S01', '**Unresolved**'], 'ERRATA.md');
  assert.ok(!errata.includes('formal scientific hotfix planned'), 'ERRATA.md must not describe 3.0.2 as future work');
  assert.ok(!errata.includes('views, downloads'), 'ERRATA.md must not advertise a retired download surface');
});

test('production governance reflects the active protected-main and no-auto-replay model', () => {
  const governance = read('docs/PRODUCTION_GOVERNANCE_V48_2026-08-12.md');
  expectIncludes(governance, [
    '`Protect main production`',
    '`chromium-production`',
    '`lighthouse-production`',
    '`preview-chromium`',
    '`preview-lighthouse`',
    'no bypass actors',
    'GitHub production migration replay is not an authoritative deployment path',
    'fake/no-op timestamp migrations must never be created',
    'dual-source merged-PR provenance verification',
  ], 'production governance');
  assert.ok(!governance.includes('GitHub currently reports `main` as unprotected'), 'obsolete unprotected-main statement must not return');
  assert.ok(!governance.includes('Supabase **Deploy to production**'), 'governance must not assert an unreadable dashboard-toggle state');
});

test('public Supabase migration history remains explicitly non-replayable', () => {
  const supabaseReadme = read('supabase/README.md');
  const inventory = read('supabase/contracts/REMOTE_MIGRATION_INVENTORY_2026-08-13.md');
  expectIncludes(supabaseReadme, [
    '121',
    '`20260807140239`',
    '`20260813085032`',
    'fake/no-op timestamp migrations',
  ], 'supabase/README.md');
  expectIncludes(inventory, ['total migration-history entries: **121**', 'not a replayable SQL dump'], 'remote migration inventory');
});

test('release versioning policy protects 3.0.2 from literature expansion', () => {
  const contributing = read('CONTRIBUTING.md');
  expectIncludes(contributing, [
    'Frozen Releases **3.0.1** and **3.0.2** are immutable',
    'data-expansion release',
    '**3.1.0**',
  ], 'CONTRIBUTING.md');
});
