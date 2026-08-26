import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('canonical public runtime exposes one rev.7 contract',()=>{
  const files=['api/ui-site.js','api/ui-assistant-current.js','api/meta.js','api/data.js','api/public-data.js','api/sitemap.js','api/agent.js','api/motifs.js','api/record-current.js','api/record-evidence-current.js','middleware.js','vercel.json'];
  const text=files.map(read).join('\n');
  for(const token of ["CURRENT_REVISION='7'","2026-08-19","946","886","684","87","1329","META_VERSION='50.5'","PUBLIC_DATA_VERSION='2.16.0'","PHOTOPHYSICS_CONTRACT='1.3.3'","prepublication-review"])assert.ok(text.includes(token),`missing ${token}`);
  for(const stale of ["CURRENT_REVISION='4'","EXPECTED_STRUCTURES=864","EXPECTED_URLS=1225","PUBLIC_DATA_VERSION='2.11.0'","PUBLIC_DATA_VERSION='2.10.0'","EVIDENCE_VERSION='9.16.0'","ASSISTANT_VERSION='10.1.0'"])assert.ok(!text.includes(stale),`stale token ${stale}`);
});

test('README is the locked activated Structured Photophysics 1.3.3 release document',()=>{
  const readme=read('README.md');
  for(const token of ['Prepublication release status','Current Curated rev.7','2026-08-19','Article audit records | 383','Canonical verified articles | 369','Structure / phase rows | 946','Core-Included structure rows | 886','Resolved space-group rows | 710','Verified one-to-one SG rows | 684','Strict-polar rows | 87','RAG documents / embeddings | 1,329 / 1,329','628','318','Metadata gateway: **50.5**','Public Data: **2.16.0**','Structured Photophysics contract: **1.3.3**','Smart RAG: **9.19.0**','Research Assistant: **10.4.1**','Publication/governance state: **prepublication-review**','940 publishable sample states','2,267 measurements','2,988 normalized values','281 quantitative-analysis-eligible values','477 mechanism claims','92 two-pass verified articles','237 Pass A curated articles','54 verified-no-data articles','Record 297','440 nm','does **not** digitize','Record 135','requires a new reviewed contract change','Pass A curated','two-pass verified'])assert.ok(readme.includes(token),`README missing locked 1.3.3 token ${token}`);
  for(const stale of ['Current Curated rev.5 — living default','Curated through **2026-08-17**','Structure / phase rows | 938','Core-Included structure rows | 878','581','357','Public Data: **2.12.0**','Smart RAG: **9.17.0**','Research Assistant: **10.2.0**','Structured Photophysics contract: **1.3.1**','Structured Photophysics contract: **1.3.2**'])assert.ok(!readme.includes(stale),`README stale token ${stale}`);
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

test('production readiness is locked to the activated 1.3.3 state',()=>{
  const workflow=read('.github/workflows/production-browser-qa.yml');
  for(const token of ["p?.version!=='1.3.3'","p?.pass_a_curated_articles!==237","p?.two_pass_verified_articles!==92","p?.publishable_measurements!==2267","p?.publishable_values!==2988","p?.analysis_eligible_values!==281","p?.publishable_mechanism_claims!==477",'verification-stage accounting does not sum to article queue','activated Photophysics 1.3.3 PASS'])assert.ok(workflow.includes(token),`production activated readiness missing ${token}`);
  for(const stale of ['stable132','staged133','controlled 1.3.2 -> 1.3.3 migration states','publishable_measurements===2262','publishable_values===2985','publishable_measurements===2259','publishable_values===2979'])assert.ok(!workflow.includes(stale),`completed migration token must not remain: ${stale}`);
});

test('canonical routes terminate at rev.7 evidence wrappers, not historical renderer provenance',()=>{
  const config=JSON.parse(read('vercel.json')),middleware=read('middleware.js'),candidate=read('scripts/local-candidate-server.mjs');
  const route=source=>config.rewrites.find(x=>x.source===source)?.destination;
  assert.equal(route('/'),'/api/ui-assistant-current');
  assert.equal(route('/index.html'),'/api/ui-assistant-current');
  assert.equal(route('/api/site'),'/api/ui-assistant-current');
  assert.equal(route('/api/ui-site'),'/api/ui-assistant-current');
  assert.equal(route('/api/ui-assistant'),'/api/ui-assistant-current');
  assert.equal(route('/api/record'),'/api/record-evidence-current');
  assert.equal(route('/article/:id'),'/api/record-evidence-current?kind=article&id=:id');
  assert.equal(route('/structure/:id'),'/api/record-evidence-current?kind=structure&id=:id');
  assert.match(middleware,/new URL\('\/api\/ui-assistant-current'/);
  assert.match(middleware,/release-3\.0\.2-ui-v50\.2-current-r7/);
  assert.ok(middleware.includes("headers.set('x-cuhalide-current-curated-revision','7')"));
  assert.ok(middleware.includes("headers.set('x-cuhalide-publication-state','prepublication-review')"));
  assert.match(candidate,/release-3\.0\.2-ui-v50\.2-current-r7/);
  assert.match(candidate,/ui-assistant-current/);
  assert.match(candidate,/record-evidence-current/);
});

test('Vercel Pro serverless surface stays bounded while base renderer stays internal',()=>{
  const apiFiles=fs.readdirSync(url('api')).filter(name=>name.endsWith('.js'));
  assert.ok(apiFiles.length<=13,`bounded serverless surface exceeded: ${apiFiles.length} functions`);
  assert.ok(apiFiles.includes('record-evidence-current.js'),'evidence-grain record wrapper must be deployed');
  assert.ok(!apiFiles.includes('site.js'),'base site renderer must not be deployed as a standalone function');
  assert.ok(fs.existsSync(url('lib/site-renderer.js')),'internal base site renderer missing');
  assert.match(read('api/ui-site.js'),/\.\.\/lib\/site-renderer\.js/);
});

test('canonical rev.7 record wrapper locks visible Photophysics 1.3.3 while preserving evidence grain',()=>{
  const ui=read('api/ui-site.js'),assistant=read('api/ui-assistant-current.js'),record=read('api/record-evidence-current.js');
  for(const token of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R7','Current Curated rev.7','19 Aug 2026','Smart RAG 9.19.0','cc.verified_space_group_rows||684','cc.strict_polar_rows||87','cc.strict_polar_articles||54'])assert.ok(ui.includes(token),`UI promotion missing ${token}`);
  assert.match(assistant,/Current Curated rev\.7/);
  assert.match(record,/PHOTOPHYSICS_CONTRACT='1\.3\.3'/);
  assert.match(record,/x-cuhalide-photophysics-contract/);
  assert.match(record,/lockPhotophysicsContract/);
  assert.match(record,/Structured Photophysics 1\.3\.2/);
  assert.match(record,/No structure-mapped data/);
  assert.match(record,/parent article review stage/);
  assert.match(record,/without an explicit structure mapping/);
  assert.match(record,/kind!=='structure'/);
  assert.match(record,/applyRecordPrepublicationGovernance/);
});

test('metadata health and manifest carry the activated 1.3.3 contract without changing rev.7 governance',()=>{
  const meta=read('api/meta.js');
  for(const token of ["META_VERSION='50.5'","PUBLICATION_STATE='prepublication-review'","PUBLIC_DATA_VERSION='2.16.0'","PHOTOPHYSICS_VERSION='1.3.3'","CURRENT_REVISION='7'","curated_through:'2026-08-19'",'resolved_space_group_rows:710','verified_space_group_rows:684','verified_polar_rows:97','strict_polar_rows:87','strict_polar_articles:54','motif_resolved_rows:628','motif_unresolved_rows:318','photophysics_contract_version:PHOTOPHYSICS_VERSION',"smart_rag_version:'9.19.0'","research_assistant_version:'10.4.1'", "release_state:'prepublication'", "governance_state:PUBLICATION_STATE", "indexing:'disabled-prepublication'","structured_photophysics:true","photophysics_publication_policy='pass-a-curated-or-two-pass-verified'","public_projection:'pass-a-curated-or-two-pass-verified'","two_pass_identity_preserved:true","measurement_conflicts_fail_closed:true"])assert.ok(meta.includes(token),`metadata contract missing ${token}`);
  assert.match(meta,/frontend v50 active; backend Current Curated rev\.7 deterministic contract; Structured Photophysics 1\.3\.3 staged publication/);
  assert.doesNotMatch(meta,/staged photophysics verification preview/);
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
  assert.equal(globalHeaders.find(x=>x.key==='X-CuHalide-Publication-State')?.value,'prepublication-review');
});

test('prepublication sitemap preserves rev.7 provenance without exposing record denominators as URLs',()=>{
  const sitemap=read('api/sitemap.js');
  for(const token of ["CONTENT_DATE='2026-08-19'","CURRENT_REVISION='7'",'prepublication-non-enumerating','X-CuHalide-Sitemap-URLs'])assert.ok(sitemap.includes(token),`sitemap contract missing ${token}`);
  assert.doesNotMatch(sitemap,/EXPECTED_ARTICLES=369|EXPECTED_STRUCTURES=886|EXPECTED_URLS=1257/);
  assert.doesNotMatch(sitemap,/\/article\/\$\{|\/structure\/\$\{/);
});

test('legacy data route remains compatibility-only and delegates to the current canonical contract',()=>{
  const data=read('api/data.js'),publicData=read('api/public-data.js');
  for(const token of ["import publicDataHandler from './public-data.js'",'prefer /api/public-data','return publicDataHandler(req,res)'])assert.ok(data.includes(token),`legacy data contract missing ${token}`);
  assert.doesNotMatch(data,/supabase\.co\/functions\/v1/);
  for(const token of ["PUBLIC_DATA_VERSION='2.16.0'","CURRENT_REVISION='7'","PHOTOPHYSICS_CONTRACT='1.3.3'","PUBLICATION_STATE='prepublication-review'",'cuhalide-atlas-public-data-v3'])assert.ok(publicData.includes(token),`canonical public-data missing ${token}`);
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

test('public privacy boundary remains query-and-view while verification stage is explicit',()=>{
  const readme=read('README.md'),exp=read('api/export.js');
  assert.match(readme,/query-and-view/i);
  assert.match(readme,/primary PDF\/SI\/CIF/i);
  assert.match(readme,/Pass A curated/i);
  assert.match(readme,/two-pass verified/i);
  assert.match(readme,/raw evidence locators/i);
  assert.match(exp,/410/);
});
