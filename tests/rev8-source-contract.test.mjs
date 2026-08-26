import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const publicWrapper=fs.readFileSync(new URL('../api/public-data.js',import.meta.url),'utf8');
const metaWrapper=fs.readFileSync(new URL('../api/meta.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts',import.meta.url),'utf8');
const publicData=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-public-data-v3/index.ts',import.meta.url),'utf8');
const smart=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-smart-rag-v302-current-public/index.ts',import.meta.url),'utf8');
const r8Exact=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r8-exact-internal/index.ts',import.meta.url),'utf8');
const r8Science=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r8-science-exact-internal/index.ts',import.meta.url),'utf8');
const r8Unified=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r8-unified-internal/index.ts',import.meta.url),'utf8');

test('all serving layers agree on Current Curated revision 8',()=>{
  assert.match(publicWrapper,/CURRENT_REVISION='8'/);
  assert.doesNotMatch(publicWrapper,/CURRENT_REVISION='7'/);
  assert.match(metaWrapper,/CURRENT_REVISION='8'/);
  assert.match(metaWrapper,/current_curated:\{revision:8/);
  assert.match(metaWrapper,/backend Current Curated rev\.8 deterministic contract/);
  assert.match(runtime,/CURRENT_REVISION=8/);
  assert.match(runtime,/layer:'current-curated-r8'/);
  assert.match(publicData,/REV='8'/);
  assert.match(publicData,/current_curated_revision=8/);
  assert.match(smart,/CURRENT_RELEASE='current-curated-r8'/);
  assert.match(smart,/REV=8/);
  assert.match(r8Exact,/CURRENT='current-curated-r8'/);
  assert.match(r8Science,/CURRENT='current-curated-r8'/);
  assert.match(r8Unified,/CURRENT='current-curated-r8'/);
});

test('rev8 does not change locked product contracts or prepublication guards',()=>{
  assert.match(publicWrapper,/PHOTOPHYSICS_CONTRACT='1\.3\.3'/);
  assert.match(metaWrapper,/PHOTOPHYSICS_VERSION='1\.3\.3'/);
  assert.match(runtime,/PHOTOPHYSICS_VERSION='1\.3\.3'/);
  assert.match(publicData,/PHOTOPHYSICS_CONTRACT='1\.3\.3'/);
  assert.match(smart,/VERSION='9\.19\.0'/);
  assert.match(smart,/PHOTOPHYSICS_CONTRACT='1\.3\.3'/);
  assert.match(publicData,/ORGANIC_COMPONENTS_CONTRACT='1\.1\.0'/);
  assert.match(metaWrapper,/ORGANIC_COMPONENTS_VERSION='1\.1\.0'/);
  for(const source of [publicWrapper,metaWrapper,runtime,publicData,smart,r8Exact,r8Science,r8Unified]){
    assert.match(source,/prepublication|noindex/i);
  }
});

test('rev8 current RAG routes to the 1329-document full current snapshot',()=>{
  assert.match(smart,/DOCS=1329/);
  assert.match(smart,/cuhalide-atlas-current-rag-r8-unified-internal/);
  assert.match(r8Unified,/DOCS=1329/);
  assert.match(r8Unified,/cuhalide_atlas_hybrid_search_current_r8_candidate_v1/);
  assert.match(r8Unified,/@cf\/baai\/bge-m3/);
  assert.match(r8Unified,/@cf\/baai\/bge-reranker-base/);
});
