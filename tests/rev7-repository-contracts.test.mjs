import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('canonical public runtime exposes one rev.7 contract',()=>{
  const files=['api/ui-site.js','api/ui-assistant-current.js','api/meta.js','api/data.js','api/public-data.js','api/sitemap.js','api/agent.js','api/motifs.js','api/record-current.js','middleware.js','vercel.json'];
  const text=files.map(read).join('\n');
  for(const token of ["CURRENT_REVISION='7'","2026-08-19","946","886","684","87","1329","PUBLIC_DATA_VERSION='2.15.0'","PHOTOPHYSICS_CONTRACT='1.2.0'"])assert.ok(text.includes(token),`missing ${token}`);
  for(const stale of ["CURRENT_REVISION='4'","EXPECTED_STRUCTURES=864","EXPECTED_URLS=1225","PUBLIC_DATA_VERSION='2.11.0'","PUBLIC_DATA_VERSION='2.10.0'","EVIDENCE_VERSION='9.16.0'","ASSISTANT_VERSION='10.1.0'"])assert.ok(!text.includes(stale),`stale token ${stale}`);
});

test('README is locked to the same rev.7 living scientific state',()=>{
  const readme=read('README.md');
  for(const token of ['Prepublication release status','Current Curated rev.7','2026-08-19','Article audit records | 383','Canonical verified articles | 369','Structure / phase rows | 946','Core-Included structure rows | 886','Resolved space-group rows | 710','Verified one-to-one SG rows | 684','Strict-polar rows | 87','RAG documents / embeddings | 1,329 / 1,329','628','318','Public Data: **2.15.0**','Structured Photophysics contract: **1.2.0**','Smart RAG: **9.19.0**','Research Assistant: **10.4.1**'])assert.ok(readme.includes(token),`README missing current token ${token}`);
  for(const stale of ['Current Curated rev.5 — living default','Curated through **2026-08-17**','Structure / phase rows | 938','Core-Included structure rows | 878','581','357','Public Data: **2.12.0**','Smart RAG: **9.17.0**','Research Assistant: **10.2.0**'])assert.ok(!readme.includes(stale),`README stale token ${stale}`);
});

test('prepublication repository metadata cannot claim formal public release',()=>{
  const citation=read('CITATION.cff'),codemeta=JSON.parse(read('codemeta.json')),license=read('LICENSE_STATUS.md');
  assert.match(citation,/prepublication review resource/i);
  assert.doesNotMatch(citation,/^date-released:/m);
  assert.match(citation,/No permanent DOI/i);
  assert.equal(codemeta.version,'prepublication-current-r7');
  assert.ok(!Object.hasOwn(codemeta,'datePublished'));
  assert.equal(codemeta.license,'NOASSERTION');
  assert.match(codemeta.description,/search-engine indexing is disabled/i);
  assert.match(license,/Current Curated rev\.7/);
  assert.match(license,/prepublication review state/i);
  assert.match(license,/does not assert a permanent DOI or formal public-release date/i);
});

test('public repository tracks no private evidence, bulk-data, archive or credential file types',()=>{
  const tracked=execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  const forbidden=tracked.filter(p=>/\.(?:pdf|cif|xlsx?|csv|tsv|docx|pptx|zip|7z|rar|pem|key|p12|pfx)$/i.test(p)||/(^|\/)\.env(?:\.|$)/i.test(p));
  assert.deepEqual(forbidden,[],`private/bulk file types are tracked: ${forbidden.join(', ')}`);
  const ignore=read('.gitignore');
  for(const token of ['.env','*.pdf','*.cif','*.xlsx','*.csv','*.docx','*.zip','private/','primary-evidence/','curation-private/'])assert.ok(ignore.includes(token),`.gitignore missing ${token}`);
});

test('preview QA has one PR trigger while Vercel deployment status remains independently mandatory',()=>{
  const workflow=read('.github/workflows/vercel-preview-qa.yml'),gate=read('scripts/vercel-production-gate.mjs');
  assert.ok(!workflow.includes('deployment_status:'),'deployment_status must not create duplicate required check names');
  assert.match(workflow,/ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(gate,/REQUIRED_VERCEL_STATUS = 'Vercel'/);
  assert.match(gate,/has no trusted successful Vercel preview status/);
});

test('canonical routes terminate at rev.7 wrappers, not historical renderer provenance',()=>{
  const config=JSON.parse(read('vercel.json')),middleware=read('middleware.js'),candidate=read('scripts/local-candidate-server.mjs');
  const route=source=>config.rewrites.find(x=>x.source===source)?.destination;
  assert.equal(route('/'),'/api/ui-assistant-current');
  assert.equal(route('/index.html'),'/api/ui-assistant-current');
  assert.equal(route('/api/site'),'/api/ui-site');
  assert.equal(route('/api/ui-assistant'),'/api/ui-assistant-current');
  assert.equal(route('/api/record'),'/api/record-current');
  assert.equal(route('/article/:id'),'/api/record-current?kind=article&id=:id');
  assert.equal(route('/structure/:id'),'/api/record-current?kind=structure&id=:id');
  assert.match(middleware,/new URL\('\/api\/ui-assistant-current'/);
  assert.match(middleware,/release-3\.0\.2-ui-v50\.2-current-r7/);
  assert.ok(middleware.includes("headers.set('x-cuhalide-current-curated-revision','7')"));
  assert.match(candidate,/release-3\.0\.2-ui-v50\.2-current-r7/);
  assert.match(candidate,/ui-assistant-current/);
  assert.match(candidate,/record-current/);
});

test('Vercel Hobby function budget is locked while base renderer stays internal',()=>{
  const apiFiles=fs.readdirSync(url('api')).filter(name=>name.endsWith('.js'));
  assert.ok(apiFiles.length<=12,`Vercel Hobby limit exceeded: ${apiFiles.length} serverless functions`);
  assert.ok(!apiFiles.includes('site.js'),'base site renderer must not be deployed as a standalone function');
  assert.ok(fs.existsSync(url('lib/site-renderer.js')),'internal base site renderer missing');
  assert.match(read('api/ui-site.js'),/\.\.\/lib\/site-renderer\.js/);
});

test('rev.7 wrappers normalize living UI and record provenance without rewriting validated base renderers',()=>{
  const ui=read('api/ui-site.js'),assistant=read('api/ui-assistant-current.js'),record=read('api/record-current.js');
  for(const token of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R7','Current Curated rev.7','19 Aug 2026','Smart RAG 9.19.0','cc.verified_space_group_rows||684','cc.strict_polar_rows||87','cc.strict_polar_articles||54'])assert.ok(ui.includes(token),`UI promotion missing ${token}`);
  assert.match(assistant,/Current Curated rev\.7/);
  assert.match(record,/Current Curated rev\.7 · primary-evidence reviewed through 19 Aug 2026/);
  assert.match(record,/content=\"7\"/);
  assert.match(record,/PHOTOPHYSICS_CONTRACT='1\.2\.0'/);
  assert.match(record,/Two-pass verified/);
  assert.match(record,/noindex,nofollow,noarchive/);
});

test('metadata health and manifest carry exact rev.7 denominators',()=>{
  const meta=read('api/meta.js');
  for(const token of ["META_VERSION='50.3'","PUBLIC_DATA_VERSION='2.15.0'","PHOTOPHYSICS_VERSION='1.2.0'","CURRENT_REVISION='7'","curated_through:'2026-08-19'",'resolved_space_group_rows:710','verified_space_group_rows:684','verified_polar_rows:97','strict_polar_rows:87','strict_polar_articles:54','motif_resolved_rows:628','motif_unresolved_rows:318','photophysics_contract_version:PHOTOPHYSICS_VERSION',"smart_rag_version:'9.19.0'","research_assistant_version:'10.4.1'", "release_state:'prepublication'", "indexing:'disabled-prepublication'","structured_photophysics:true"])assert.ok(meta.includes(token),`metadata contract missing ${token}`);
  assert.match(meta,/frontend v50 active; backend rev\.7 deterministic contract/);
});

test('assistant proxy exposes rev.7 / 10.4 / 9.19 while preserving non-idempotent retry guard',()=>{
  const agent=read('api/agent.js');
  for(const token of ["ASSISTANT_VERSION='10.4.1'","EVIDENCE_VERSION='9.19.0'","CURRENT_REVISION='7'"])assert.ok(agent.includes(token));
  assert.match(agent,/attempts=isPost\?1:3/);
  assert.match(agent,/X-Robots-Tag/);
});

test('Motif Atlas reflects the adjudicated rev.7 taxonomy without formula completion',()=>{
  const motifs=read('api/motifs.js'),config=JSON.parse(read('vercel.json'));
  for(const token of ["REV='7'","CONTENT_DATE='2026-08-19'",'motif_resolved_rows??628','motif_unresolved_rows??318',"version:'current-r7'",'Current Curated rev.7'])assert.ok(motifs.includes(token),`motif contract missing ${token}`);
  assert.match(motifs,/local motif and global dimensionality are independent fields/i);
  assert.match(motifs,/never rounded or truncated/i);
  const globalHeaders=config.headers.find(x=>x.source==='/(.*)')?.headers||[];
  assert.equal(globalHeaders.find(x=>x.key==='X-Robots-Tag')?.value,'noindex, nofollow, noarchive');
});

test('sitemap denominators remain canonical and revision provenance advances only',()=>{
  const sitemap=read('api/sitemap.js');
  for(const token of ["CONTENT_DATE='2026-08-19'","CURRENT_REVISION='7'",'EXPECTED_ARTICLES=369','EXPECTED_STRUCTURES=886','EXPECTED_URLS=1257'])assert.ok(sitemap.includes(token));
});

test('legacy data route remains compatibility-only and current',()=>{
  const data=read('api/data.js'),publicData=read('api/public-data.js');
  for(const token of ["PUBLIC_DATA_VERSION='2.15.0'","CURRENT_REVISION='7'","PHOTOPHYSICS_CONTRACT='1.2.0'",'prefer /api/public-data','RETRIES=3'])assert.ok(data.includes(token),`legacy data contract missing ${token}`);
  assert.ok(publicData.includes("PUBLIC_DATA_VERSION='2.15.0'"));
  assert.ok(publicData.includes("CURRENT_REVISION='7'"));
  assert.ok(publicData.includes("PHOTOPHYSICS_CONTRACT='1.2.0'"));
  assert.match(publicData,/response\.status===429/);
});

test('Lighthouse gate preserves quality while enforcing intentional prepublication noindex',()=>{
  const gate=read('scripts/assert-lighthouse.mjs');
  assert.match(gate,/metrics\.consoleErrors !== 1/);
  assert.match(gate,/accessibility: 1\.00/);
  assert.match(gate,/'best-practices': 0\.95/);
  assert.match(gate,/seo: 0\.90/);
  assert.match(gate,/is-crawlable/);
  assert.match(gate,/metrics\.crawlable !== 0/);
  assert.match(gate,/seoQualityExcludingIntentionalNoindex/);
});

test('public privacy boundary remains query-and-view',()=>{
  const readme=read('README.md'),exp=read('api/export.js');
  assert.match(readme,/query-and-view/i);
  assert.match(readme,/primary PDF\/SI\/CIF/i);
  assert.match(readme,/two-pass-verified photophysics/i);
  assert.match(exp,/410/);
});