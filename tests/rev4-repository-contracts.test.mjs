import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('v49 public runtime files expose one rev.4 contract',()=>{
  const files=['api/site.js','api/ui-site.js','api/meta.js','api/public-data.js','api/sitemap.js','api/agent.js','api/motifs.js','middleware.js'];
  const text=files.map(read).join('\n');
  for(const token of ["CURRENT_REVISION='4'","2026-08-17","924","864","665","79","1297"])assert.ok(text.includes(token),`missing ${token}`);
  for(const stale of ["CURRENT_REVISION='3'","EXPECTED_STRUCTURES=887","EXPECTED_URLS=1248","PUBLIC_DATA_VERSION='2.10.0'","EVIDENCE_VERSION='9.15.0'","ASSISTANT_VERSION='10.0.0'"])assert.ok(!text.includes(stale),`stale token ${stale}`);
});

test('sitemap and QA denominators are exact',()=>{
  const sitemap=read('api/sitemap.js'),qa=read('tests/production-browser-v49.spec.js');
  for(const token of ['EXPECTED_ARTICLES=359','EXPECTED_STRUCTURES=864','EXPECTED_URLS=1225'])assert.ok(sitemap.includes(token));
  for(const token of ['structure_phase_rows:924','core_included_structure_rows:864','verified_space_group_rows:665','verified_polar_rows:94','strict_polar_rows:79','strict_polar_articles:49','rag_documents:1297'])assert.ok(qa.includes(token));
});

test('public privacy boundary remains query-and-view',()=>{
  const readme=read('README.md'),exp=read('api/export.js');
  assert.match(readme,/query-and-view/i);assert.match(readme,/primary PDF\/SI\/CIF/i);assert.match(exp,/410/);
});
