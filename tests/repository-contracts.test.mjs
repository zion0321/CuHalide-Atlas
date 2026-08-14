import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const expectIncludes = (text, values, label) => { for (const value of values) assert.ok(text.includes(value), `${label} must include ${JSON.stringify(value)}`); };

test('runtime module type and QA Node major are explicit and aligned', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.private, true);
  assert.equal(pkg.engines, undefined, 'package must not override the Vercel project Node major');
  assert.equal(pkg.scripts['qa:browser'], 'playwright test tests/production-browser-v48-r3.spec.js tests/research-assistant-v10.spec.js');
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
  expectIncludes(readme, ['Current Curated rev.3','Public Data: **2.10.0**','Research Assistant: **10.0.0**','Evidence engine: **Smart RAG 9.15.0**','Metadata / health: **48.5**','Motif Atlas schema: **1.2**','1,322 / 1,322'], 'README.md');
  expectIncludes(read('api/public-data.js'), ['2.10.0', "CURRENT_REVISION = '3'"], 'api/public-data.js');
  expectIncludes(read('api/agent.js'), ['cuhalide-atlas-research-assistant-v1-public','10.0.0', "CURRENT_REVISION='3'"], 'api/agent.js');
  expectIncludes(read('api/meta.js'), ['48.5', 'cuhalide-atlas-research-assistant-v1-public', "CURRENT_REVISION='3'"], 'api/meta.js');
  expectIncludes(read('api/motifs.js'), ["REV='3'", "CONTENT_DATE='2026-08-14'", 'Conservative motif rule', 'Curated through 14 Aug 2026', 'Legacy label-derived component candidates'], 'api/motifs.js');
  const living = read('api/ui-site.js');
  expectIncludes(living, ["UI_VERSION = '48.4'","CURRENT_REVISION = '3'","CONTENT_DATE = '2026-08-14'",'ui-living-knowledge.css','Latest curated state','Curated literature · n=359','Archived scientific snapshot 3.0.2','CUHALIDE_UI_V48_4_LIVING_KNOWLEDGE'], 'api/ui-site.js');
  const assistant = read('api/ui-assistant.js');
  expectIncludes(assistant, ["UI_VERSION='48.5'",'ui-assistant-v48-5.css','CuHalide Research Assistant','Conversation + evidence tools ready','CUHALIDE_UI_V48_5_CONVERSATIONAL_RESEARCH_ASSISTANT'], 'api/ui-assistant.js');
  const record = read('api/record.js');
  expectIncludes(record, ['Curated record', 'Data provenance', 'Archived scientific snapshot 3.0.2'], 'api/record.js');
  const middleware = read('middleware.js');
  expectIncludes(middleware, ["new URL('/api/ui-assistant'", "release-3.0.2-ui-v48.5-current-r3","headers.set('x-cuhalide-current-curated-revision', '3')","headers.set('x-cuhalide-ui-version', '48.5')"], 'middleware.js');
  assert.ok(!middleware.includes('release-3.0.2-ui-v48.4-current-r3'), 'middleware must not expose stale UI 48.4 identity');
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
    'Snapshot coverage was verified through 30 June 2026',
    '<select id="arel"><option value="Current canonical" selected>Curated literature · n=359',
    "if (body.includes('Frozen Release core · n=332')) throw new Error('Archived snapshot must not remain a routine browsing mode')",
  ], 'living knowledge UI');
});

test('Research Assistant provides free conversation while routing scientific claims to governed evidence', () => {
  const gateway = read('supabase/functions/cuhalide-atlas-research-assistant-v1-public/index.ts');
  expectIncludes(gateway, [
    "VERSION='10.0.0'",
    'cuhalide-atlas-smart-rag-v302-current-public',
    'cuhalide-atlas-conversation-v1-internal',
    'natural_conversation:true',
    'automatic_evidence_routing:true',
    "route:'conversation'",
    "answer_kind:'evidence'",
    "LATEST.test(q)",
    "hasPriorEvidenceContext(ms)&&isFollowup(q)",
    'META_ZH=',
    'GENERAL_DEFINITION_ZH=',
    'FOLLOWUP_ZH=',
    "assistant_version:VERSION",
    "version:e.x?.version||'9.15.0'",
  ], 'Research Assistant gateway');
  const conversation = read('supabase/functions/cuhalide-atlas-conversation-v1-internal/index.ts');
  expectIncludes(conversation, [
    "LLM='@cf/qwen/qwen3-30b-a3b-fp8'",
    'Converse naturally',
    'Do NOT invent or assert CuHalide Atlas corpus-specific facts',
    '__CUHALIDE_ROUTE_EVIDENCE__',
    'general_scientific_explanation:true',
    'SAFE_CONVERSATION_FALLBACK',
    'cuhalide_atlas_agent_rate_limit',
  ], 'conversational LLM layer');
});

test('Smart RAG 9.15 public-safe mirror matches the rev.3 production evidence engine', () => {
  const evidence = read('supabase/functions/cuhalide-atlas-smart-rag-v302-current-public/index.ts');
  expectIncludes(evidence, [
    "VERSION='9.15.0'",
    "'x-cuhalide-current-curated-revision':'3'",
    "layer:'current-curated-r3'",
    'documents:98,embedded:98',
    'unified_documents:1322,unified_embedded:1322',
    'fractional_motif_conservatism:true',
    "guard:'current-structure-grain-boundary-v3'",
    "CUH-(?:34[7-9]|35\\d|36\\d|37[0-3])-S\\d{2}",
  ], 'Smart RAG 9.15 production mirror');
  assert.ok(!evidence.includes("VERSION='9.14.0'"), 'stale 9.14 evidence mirror must not return');
  assert.ok(!evidence.includes("layer:'current-curated-r2'"), 'stale rev.2 evidence mirror must not return');
});

test('Research Assistant UI removes manual mode selection and preserves automatic evidence routing', () => {
  const ui = read('api/ui-assistant.js');
  const css = read('public/ui-assistant-v48-5.css');
  expectIncludes(ui, ['Just ask naturally','What can you do?','Ask naturally. When a scientific claim needs Atlas evidence','No database evidence was needed for this answer.',"mode:'auto'"], 'assistant UI');
  expectIncludes(css, ['.assistant-steps','.assistant-welcome','.no-evidence','@media(max-width:780px)'], 'assistant CSS');
  expectIncludes(ui, ["if(body.includes('<select id=\"rmode\">'))throw new Error('Manual Smart RAG mode selector must not remain in conversational UI')"], 'assistant fail-closed UI guard');
});

test('meta health keeps the scientific core and adds the public Research Assistant gateway contract', () => {
  const stable = read('supabase/functions/cuhalide-atlas-meta-v302-stable/index.ts');
  expectIncludes(stable, [
    "VERSION='48.4'",
    "'x-cuhalide-current-curated-revision':'3'",
    "r.x?.version==='9.15.0'",
    'CUHALIDE_UI_V48_4_LIVING_KNOWLEDGE',
    'Latest curated state',
    'Curated through 14 Aug 2026',
    'Archived scientific snapshot 3.0.2',
    "!html.includes('Frozen Release core · n=332')",
    "site_readiness:siteReady?'PASS':'OUT_OF_SYNC'",
  ], 'stable scientific meta mirror');
  const publicMeta = read('api/meta.js');
  expectIncludes(publicMeta, [
    "META_VERSION='48.5'",
    'cuhalide-atlas-research-assistant-v1-public',
    "x?.assistant_version==='10.0.0'",
    'gateway_meta_version:META_VERSION',
    'research_assistant_gateway:assistantOk',
    'natural_conversation_contract',
    'automatic_evidence_routing',
  ], 'public composite health');
});

test('candidate QA runtime serves the exact assistant wrapper and stylesheet', () => {
  const server = read('scripts/local-candidate-server.mjs');
  expectIncludes(server, [
    "import uiAssistantHandler from '../api/ui-assistant.js'",
    "'/ui-assistant-v48-5.css'",
    "pathname === '/api/ui-assistant'",
    "release-3.0.2-ui-v48.5-current-r3",
  ], 'candidate server');
});

test('rev.3 release audit records primary-evidence additions and duplicate identity controls', () => {
  const audit = read('docs/CURRENT_CURATED_R3_2026-08-14.md');
  expectIncludes(audit, ['10.1021/acs.inorgchem.6c03055','10.1002/smll.74688','10.1021/acs.cgd.6c00650','`CUH-370-S02`','`CUH-370-S01`','`CUH-158-S09`','15 legacy rows','1,322 / 1,322','`ok = true`'], 'Current Curated rev.3 audit');
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
  expectIncludes(governance, ['`Protect main production`','`chromium-production`','`lighthouse-production`','`preview-chromium`','`preview-lighthouse`','no bypass actors','GitHub production migration replay is not an authoritative deployment path','fake/no-op timestamp migrations must never be created','dual-source merged-PR provenance verification'], 'production governance');
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
