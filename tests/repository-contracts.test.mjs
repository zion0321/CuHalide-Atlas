import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const expectIncludes = (text, values, label) => {
  for (const value of values) assert.ok(text.includes(value), `${label} must include ${JSON.stringify(value)}`);
};

test('runtime module type and QA Node major are explicit and aligned', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.private, true);
  assert.equal(pkg.engines, undefined, 'package must not override the Vercel project Node major');
  assert.equal(pkg.scripts['qa:browser'], 'playwright test tests/production-browser-v48-r3.spec.js');

  const browser = read('.github/workflows/production-browser-qa.yml');
  const lighthouse = read('.github/workflows/production-lighthouse-qa.yml');
  const preview = read('.github/workflows/vercel-preview-qa.yml');
  expectIncludes(browser, ["node-version: '24'"], 'production browser workflow');
  expectIncludes(lighthouse, ["node-version: '24'"], 'production Lighthouse workflow');
  assert.equal((preview.match(/node-version: '24'/g) || []).length, 2, 'both protected-preview jobs must use Node 24');
});

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
    'Current Curated rev.3',
    'Public Data: **2.10.0**',
    'Smart RAG: **9.15.0**',
    'Metadata / health: **48.4**',
    'Motif Atlas schema: **1.2**',
    '1,322 / 1,322',
  ], 'README.md');
  expectIncludes(read('api/public-data.js'), ['2.10.0', "CURRENT_REVISION = '3'"], 'api/public-data.js');
  expectIncludes(read('api/agent.js'), ['9.15.0', "CURRENT_REVISION='3'"], 'api/agent.js');
  expectIncludes(read('api/meta.js'), ['48.4', "CURRENT_REVISION='3'"], 'api/meta.js');
  expectIncludes(read('api/motifs.js'), ["REV='3'", "CONTENT_DATE='2026-08-14'", 'Conservative motif rule', 'Curated through 14 Aug 2026', 'Legacy label-derived component candidates'], 'api/motifs.js');
  const ui = read('api/ui-site.js');
  expectIncludes(ui, [
    "UI_VERSION = '48.4'",
    "CURRENT_REVISION = '3'",
    "CONTENT_DATE = '2026-08-14'",
    'ui-living-knowledge.css',
    'Latest curated state',
    'Curated literature · n=359',
    'Archived scientific snapshot 3.0.2',
    'CUHALIDE_UI_V48_4_LIVING_KNOWLEDGE',
  ], 'api/ui-site.js');
  assert.ok(!ui.includes('Frozen Release core · n=332'), 'archived snapshot must not be restored as a routine browsing mode');

  const record = read('api/record.js');
  expectIncludes(record, ['Curated record', 'Data provenance', 'Archived scientific snapshot 3.0.2'], 'api/record.js');

  const middleware = read('middleware.js');
  expectIncludes(middleware, [
    "release-3.0.2-ui-v48.4-current-r3",
    "headers.set('x-cuhalide-current-curated-revision', '3')",
    "headers.set('x-cuhalide-ui-version', '48.4')",
  ], 'middleware.js');
  assert.ok(!middleware.includes('release-3.0.2-ui-v48.3'), 'middleware must not expose stale UI 48.3 identity');
  assert.ok(!middleware.includes("headers.set('x-cuhalide-current-curated-revision', '2')"), 'middleware must not expose stale Current Curated rev.2 identity');
});

test('living-knowledge UI keeps snapshot provenance without making snapshot selection a user burden', () => {
  const css = read('public/ui-living-knowledge.css');
  expectIncludes(css, ['.provenance-box', '.curation-panel', '.release .ver', '@media(max-width:780px)'], 'living knowledge CSS');
  const ui = read('api/ui-site.js');
  expectIncludes(ui, [
    'Continuously curated scientific knowledge',
    'Curated through 14 Aug 2026',
    'Latest reviewed corpus.',
    'snapshot coverage was verified through 30 June 2026',
  ], 'living knowledge UI');
  assert.ok(!ui.includes('<option value="Core - Verified">Frozen Release core'), 'frozen snapshot selector must remain absent from routine literature browsing');
});

test('rev.3 release audit records primary-evidence additions and duplicate identity controls', () => {
  const audit = read('docs/CURRENT_CURATED_R3_2026-08-14.md');
  expectIncludes(audit, [
    '10.1021/acs.inorgchem.6c03055',
    '10.1002/smll.74688',
    '10.1021/acs.cgd.6c00650',
    '`CUH-370-S02`',
    '`CUH-370-S01`',
    '`CUH-158-S09`',
    '15 legacy rows',
    '1,322 / 1,322',
    '`ok = true`',
  ], 'Current Curated rev.3 audit');
});

test('public/private boundary cannot silently regress to bulk export', () => {
  const exportRoute = read('api/export.js');
  expectIncludes(exportRoute, ["const RELEASE = '3.0.2'", 'res.statusCode = 410', "public_access: 'query-and-view'"], 'api/export.js');
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
    '`Protect main production`', '`chromium-production`', '`lighthouse-production`', '`preview-chromium`', '`preview-lighthouse`',
    'no bypass actors', 'GitHub production migration replay is not an authoritative deployment path', 'fake/no-op timestamp migrations must never be created', 'dual-source merged-PR provenance verification',
  ], 'production governance');
  assert.ok(!governance.includes('GitHub currently reports `main` as unprotected'), 'obsolete unprotected-main statement must not return');
  assert.ok(!governance.includes('Supabase **Deploy to production**'), 'governance must not assert an unreadable dashboard-toggle state');
});

test('public Supabase migration inventory tracks the real ledger without becoming a replay dump', () => {
  const supabaseReadme = read('supabase/README.md');
  const inventory = read('supabase/contracts/REMOTE_MIGRATION_INVENTORY_2026-08-14.md');
  expectIncludes(supabaseReadme, ['124', '`20260807140239`', '`20260814054208`', 'fake/no-op timestamp migrations'], 'supabase/README.md');
  expectIncludes(inventory, ['total migration-history entries: **124**', 'not a replayable SQL dump', '`add_scoped_current_curated_rag_embedding_writer`', '`motif_atlas_schema_1_2_fractional_conservatism`'], 'remote migration inventory');
});

test('release versioning policy protects 3.0.2 from literature expansion', () => {
  const contributing = read('CONTRIBUTING.md');
  expectIncludes(contributing, ['Frozen Releases **3.0.1** and **3.0.2** are immutable', 'data-expansion release', '**3.1.0**'], 'CONTRIBUTING.md');
});
