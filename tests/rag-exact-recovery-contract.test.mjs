import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const r7Exact=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts',import.meta.url),'utf8');
const r7Science=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r7-science-exact-internal/index.ts',import.meta.url),'utf8');
const r7Unified=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r7-unified-internal/index.ts',import.meta.url),'utf8');
const r8Exact=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r8-exact-internal/index.ts',import.meta.url),'utf8');
const r8Science=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r8-science-exact-internal/index.ts',import.meta.url),'utf8');
const r8Unified=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r8-unified-internal/index.ts',import.meta.url),'utf8');
const smartSource=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-smart-rag-v302-current-public/index.ts',import.meta.url),'utf8');
const publicDataSource=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-public-data-v3/index.ts',import.meta.url),'utf8');
const runtimeSource=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts',import.meta.url),'utf8');

test('rev7 remains a locked recovery layer while rev8 is the active current runtime',()=>{
  assert.match(r7Exact,/VERSION='current-rag-r7\.0\.8'/);
  assert.match(r7Science,/VERSION='current-rag-r7-science-exact-1\.1\.1'/);
  assert.match(r7Unified,/VERSION='current-rag-r7\.2\.5'/);
  assert.doesNotMatch(r7Unified,/VERSION='current-rag-r7\.2\.1'/,'repository source must not regress to the pre-production unified RAG mirror');

  assert.match(r8Exact,/CURRENT='current-curated-r8'/);
  assert.match(r8Exact,/VERSION='current-rag-r8-exact-1\.0\.0'/);
  assert.match(r8Science,/CURRENT='current-curated-r8'/);
  assert.match(r8Science,/VERSION='current-rag-r8-science-exact-1\.0\.0'/);
  assert.match(r8Unified,/CURRENT='current-curated-r8'/);
  assert.match(r8Unified,/VERSION='current-rag-r8\.0\.0'/);
  assert.match(r8Unified,/cuhalide_atlas_hybrid_search_current_r8_candidate_v1/);

  assert.match(smartSource,/VERSION='9\.19\.0'/);
  assert.match(smartSource,/CURRENT_RELEASE='current-curated-r8'/);
  assert.match(smartSource,/REV=8/);
  assert.match(smartSource,/cuhalide-atlas-current-rag-r8-unified-internal/);
  assert.doesNotMatch(smartSource,/CURRENT_RELEASE='current-curated-r7'/);

  assert.match(publicDataSource,/VERSION='2\.16\.0'/);
  assert.match(publicDataSource,/REV='8'/);
  assert.match(publicDataSource,/current_curated_revision=8/);
  assert.match(runtimeSource,/PHOTOPHYSICS_VERSION='1\.3\.3'/);
  assert.match(runtimeSource,/CURRENT_REVISION=8/);

  for(const source of [r7Exact,r7Science,r7Unified,r8Exact,r8Science,r8Unified,smartSource,publicDataSource]){
    assert.match(source,/PHOTOPHYSICS_CONTRACT='1\.3\.3'/);
    assert.doesNotMatch(source,/PHOTOPHYSICS_CONTRACT='1\.3\.[012]'/);
    assert.match(source,/noindex, nofollow, noarchive/);
  }

  assert.match(r8Exact,/x-cuhalide-current-curated-revision':'8'/);
  assert.match(r8Exact,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(r8Science,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(r8Unified,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(smartSource,/x-cuhalide-endpoint-state':'internal-upstream'/);
  assert.match(publicDataSource,/x-cuhalide-publication-state':PUBLICATION_STATE/);

  assert.match(r8Exact,/cuhalide-atlas-current-rag-r7-exact-internal/,'rev8 exact wrapper must preserve the locked rev7 deterministic recovery layer');
  assert.match(r8Science,/cuhalide-atlas-current-rag-r7-science-exact-internal/,'rev8 science wrapper must preserve the locked rev7 structured-science recovery layer');
  assert.match(r8Unified,/cuhalide-atlas-current-rag-r8-science-exact-internal/);
});

test('1,2-dppb exact identity remains grounded in structure-grain organic-component mapping',()=>{
  assert.match(r7Exact,/function dppb12Intent\(/);
  assert.match(r7Exact,/pd\('article-structures',\{id:'382'\}\)/);
  assert.match(r7Exact,/pd\('organic-components',\{structure_ids:ids\.join\(','\)\}\)/);
  assert.match(r7Exact,/1-2-bis-diphenylphosphino-benzene/);
  assert.match(r7Exact,/pd\('structure',\{id:String\(s\.structure_id\)\}\)/);
  assert.doesNotMatch(r7Exact,/pd\('motifs'/,'exact organic identity must not depend on public Motif browse examples');
  assert.ok(!r7Exact.includes('CUH-382-S04'),'structure IDs must be resolved from canonical structure-grain data rather than hard-coded');
  assert.ok(!r7Exact.includes('CUH-382-S05'),'structure IDs must be resolved from canonical structure-grain data rather than hard-coded');
  assert.match(r7Exact,/1,4-bis\(diphenylphosphino\)butane/,'abbreviation collision boundary must remain explicit');
  assert.match(r7Exact,/live_revision:7/,'the locked rev7 recovery layer keeps its own provenance');
  assert.match(r8Exact,/function patch\(x:any\):any/,'rev8 wrapper must update serving-revision metadata without mutating rev7 provenance text');
});
