import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('v50 public runtime files expose one rev.5 contract',()=>{
  const files=['api/site.js','api/ui-site.js','api/meta.js','api/data.js','api/public-data.js','api/sitemap.js','api/agent.js','api/motifs.js','api/record.js','middleware.js','vercel.json'];
  const text=files.map(read).join('\n');
  for(const token of ["CURRENT_REVISION='5'","2026-08-17","938","878","679","81","1317"])assert.ok(text.includes(token),`missing ${token}`);
  for(const stale of ["CURRENT_REVISION='4'","EXPECTED_STRUCTURES=864","EXPECTED_URLS=1225","PUBLIC_DATA_VERSION='2.11.0'","PUBLIC_DATA_VERSION='2.10.0'","EVIDENCE_VERSION='9.16.0'","ASSISTANT_VERSION='10.1.0'"])assert.ok(!text.includes(stale),`stale token ${stale}`);
});

test('root routing preserves the proven v50 assistant middleware path',()=>{
  const config=JSON.parse(read('vercel.json')),middleware=read('middleware.js'),assistant=read('api/ui-assistant.js');
  const root=config.rewrites.find(x=>x.source==='/'),index=config.rewrites.find(x=>x.source==='/index.html');
  assert.equal(root?.destination,'/api/ui-site');
  assert.equal(index?.destination,'/api/ui-site');
  assert.match(middleware,/matcher:\['\/','\/index\.html'\]/);
  assert.match(middleware,/new URL\('\/api\/ui-assistant'/);
  assert.match(middleware,/release-3\.0\.2-ui-v50\.0-current-r5/);
  assert.match(middleware,/x-cuhalide-site-version','50'/);
  assert.match(assistant,/CUHALIDE_UI_V48_5_CONVERSATIONAL_RESEARCH_ASSISTANT/);
  assert.match(assistant,/Conversation \+ evidence tools ready/);
});

test('record pages cannot regress to rev.3/site48 provenance',()=>{
  const record=read('api/record.js');
  for(const token of ["SITE_VERSION='50'","CURRENT_REVISION='5'","CURRENT_DATE='2026-08-17'",'Current Curated rev.5','Retry-After','X-Robots-Tag'])assert.ok(record.includes(token),`record contract missing ${token}`);
  for(const stale of ["SITE_VERSION='48'","CURRENT_REVISION='3'","CURRENT_DATE='2026-08-14'",'reviewed through 14 Aug 2026'])assert.ok(!record.includes(stale),`stale record token ${stale}`);
});

test('health Motif sitemap and data gateways retry transient faults without hiding persistent failure',()=>{
  const meta=read('api/meta.js'),motifs=read('api/motifs.js'),sitemap=read('api/sitemap.js'),data=read('api/public-data.js');
  assert.match(meta,/RETRIES=3/);assert.match(meta,/frontend v50 active; backend rev\.5 deterministic contract/);assert.doesNotMatch(meta,/frontend v49 active/);
  assert.match(motifs,/RETRIES=3/);assert.match(motifs,/res\.statusCode=503/);assert.match(motifs,/Retry-After/);
  assert.match(sitemap,/RETRIES=3/);assert.match(sitemap,/res\.statusCode=503/);assert.match(sitemap,/Retry-After/);
  assert.match(data,/response\.status===429/);assert.match(data,/res\.statusCode=503/);assert.match(data,/Retry-After/);
});

test('assistant retries only idempotent capability requests, never POST inference',()=>{
  const agent=read('api/agent.js');
  assert.match(agent,/attempts=isPost\?1:3/);
  assert.match(agent,/X-Robots-Tag/);
  assert.match(agent,/res\.statusCode=error\?\.name===\'TimeoutError\'/);
});

test('legacy public data route is compatibility-only but current',()=>{
  const data=read('api/data.js');
  for(const token of ["PUBLIC_DATA_VERSION='2.12.0'","CURRENT_REVISION='5'",'prefer /api/public-data','RETRIES=3'])assert.ok(data.includes(token),`legacy data contract missing ${token}`);
  assert.ok(!data.includes("CURRENT_REVISION='3'"));
});

test('sitemap and QA denominators are exact',()=>{
  const sitemap=read('api/sitemap.js'),qa=read('tests/production-browser-v50.spec.js');
  for(const token of ['EXPECTED_ARTICLES=365','EXPECTED_STRUCTURES=878','EXPECTED_URLS=1245'])assert.ok(sitemap.includes(token));
  for(const token of ['article_audit_records:379','canonical_verified_articles:365','structure_phase_rows:938','core_included_structure_rows:878','verified_space_group_rows:679','verified_polar_rows:96','strict_polar_rows:81','strict_polar_articles:51','rag_documents:1317'])assert.ok(qa.includes(token));
});

test('local motif and global dimensionality are explicit in v50 copy and QA',()=>{
  const site=read('api/site.js'),qa=read('tests/production-browser-v50.spec.js');
  assert.match(site,/local Cu–X motif and global connectivity dimensionality/i);
  assert.match(qa,/record 377/i);assert.match(qa,/Cu2I2/);assert.match(qa,/Cu4I4/);assert.match(qa,/1D/);
});

test('public privacy boundary remains query-and-view',()=>{
  const readme=read('README.md'),exp=read('api/export.js');
  assert.match(readme,/query-and-view/i);assert.match(readme,/primary PDF\/SI\/CIF/i);assert.match(exp,/410/);
});
