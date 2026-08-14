import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('runtime contract health is direct-to-database and never recursively calls public data, Smart RAG or candidates',()=>{
  const source=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts');
  for(const token of ['cuhalide_atlas_public_health_v302','cuhalide_atlas_current_curated_health_v1','cuhalide_atlas_public_bootstrap_current_v1','cuhalide-atlas-conversation-v1-internal','health_mode:\'deterministic-db-contract\'','site_probe_mode','protected POST QA verifies live evidence routing'])assert.ok(source.includes(token),`runtime contract must include ${JSON.stringify(token)}`);
  for(const forbidden of ['cuhalide-atlas-public-data-v2','cuhalide-atlas-public-data-v302-public','cuhalide-atlas-smart-rag-v302-current-public','cuhalide-atlas-candidates-v2'])assert.ok(!source.includes(forbidden),`runtime contract must not recursively call ${forbidden}`);
});

test('high-frequency GET control paths use runtime contract while scientific POST and record queries retain live services',()=>{
  const data=read('api/public-data.js'),agent=read('api/agent.js'),meta=read('api/meta.js');
  assert.ok(data.includes('CONTRACT_UPSTREAM'));
  assert.ok(data.includes("action==='health'||action==='bootstrap'"));
  assert.ok(data.includes("upstream.searchParams.set('action','public-health')"));
  assert.ok(data.includes('DATA_UPSTREAM'));
  assert.ok(agent.includes("req.method==='POST'?new URL(ASSISTANT_UPSTREAM):new URL(CONTRACT_UPSTREAM)"));
  assert.ok(agent.includes("upstream.searchParams.set('action','assistant')"));
  assert.ok(meta.includes("isHealth?new URL(CONTRACT_UPSTREAM):new URL(META_UPSTREAM)"));
  assert.ok(meta.includes("upstream.searchParams.set('action','health')"));
});

test('sitemap index uses one deterministic current projection read and keeps exact 359 + 887 + 2 guards',()=>{
  const runtime=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts'),sitemap=read('api/sitemap.js');
  for(const token of ['cuhalide_atlas_public_articles_current_v1','cuhalide_atlas_public_structures_current_v1','EXPECTED_SITEMAP_ARTICLES=359','EXPECTED_SITEMAP_STRUCTURES=887',"action==='sitemap'"])assert.ok(runtime.includes(token),`runtime sitemap contract must include ${JSON.stringify(token)}`);
  for(const token of ['cuhalide-atlas-runtime-contract-v1-public','EXPECTED_ARTICLES=359','EXPECTED_STRUCTURES=887','EXPECTED_URLS=1248','new Set(articles).size','new Set(structures).size'])assert.ok(sitemap.includes(token),`sitemap must include ${JSON.stringify(token)}`);
  assert.ok(!sitemap.includes("pages('articles'"),'sitemap must not rebuild the index through paginated Edge fan-out');
  assert.ok(!sitemap.includes("pages('structures'"),'sitemap must not rebuild the index through paginated Edge fan-out');
});

test('control-plane split cannot replace protected live POST routing tests',()=>{
  const qa=read('tests/research-assistant-v10.spec.js');
  for(const token of ["request.post('/api/agent'",'What is the dimensionality of CUH-013-S01?','What is the motif and emission of CUH-372-S01?','Show me the latest Cu(I) iodide literature and Literature Watch candidates.'])assert.ok(qa.includes(token),`live Assistant QA must retain ${JSON.stringify(token)}`);
});
