import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('v50 public runtime files expose one rev.5 contract',()=>{
  const files=['api/site.js','api/ui-site.js','api/meta.js','api/public-data.js','api/sitemap.js','api/agent.js','api/motifs.js','middleware.js'];
  const text=files.map(read).join('\n');
  for(const token of ["CURRENT_REVISION='5'","2026-08-17","938","878","679","81","1317"])assert.ok(text.includes(token),`missing ${token}`);
  for(const stale of ["CURRENT_REVISION='4'","EXPECTED_STRUCTURES=864","EXPECTED_URLS=1225","PUBLIC_DATA_VERSION='2.11.0'","EVIDENCE_VERSION='9.16.0'","ASSISTANT_VERSION='10.1.0'"])assert.ok(!text.includes(stale),`stale token ${stale}`);
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
