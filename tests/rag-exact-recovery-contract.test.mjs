import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const exactSource=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts',import.meta.url),'utf8');
const scienceSource=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r7-science-exact-internal/index.ts',import.meta.url),'utf8');
const unifiedSource=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r7-unified-internal/index.ts',import.meta.url),'utf8');
const smartSource=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-smart-rag-v302-current-public/index.ts',import.meta.url),'utf8');

test('active rev7 RAG chain preserves service-only inner recovery while outer layers own the live photophysics contract',()=>{
  assert.match(exactSource,/VERSION='current-rag-r7\.0\.8'/);
  assert.match(scienceSource,/VERSION='current-rag-r7-science-exact-1\.1\.1'/);
  assert.match(unifiedSource,/VERSION='current-rag-r7\.2\.1'/);
  assert.match(smartSource,/VERSION='9\.19\.0'/);

  for(const source of [exactSource,scienceSource,unifiedSource,smartSource])assert.match(source,/noindex, nofollow, noarchive/);

  assert.match(exactSource,/x-cuhalide-publication-state':'prepublication-review'/);
  assert.match(exactSource,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(scienceSource,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(unifiedSource,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(smartSource,/x-cuhalide-endpoint-state':'internal-upstream'/);

  // The two deepest recovery layers remain service-only during the activation window.
  // Their embedded compatibility labels are not a public contract authority and are synchronized in the final 1.3.3 lock.
  for(const source of [exactSource,scienceSource]){
    assert.match(source,/PHOTOPHYSICS_CONTRACT='1\.3\.1'/);
    assert.doesNotMatch(source,/PHOTO_ALLOWED=new Set\(\['1\.3\.2','1\.3\.3'\]\)/);
  }

  // The two outer layers must resolve the current contract from the canonical live public-data health endpoint.
  for(const source of [unifiedSource,smartSource]){
    assert.match(source,/PHOTO_ALLOWED=new Set\(\['1\.3\.2','1\.3\.3'\]\)/);
    assert.match(source,/cuhalide-atlas-public-data-v3/);
    assert.match(source,/photophysics-health/);
    assert.match(source,/function photoVersion/);
    assert.match(source,/photophysics_contract:pv/);
    assert.match(source,/x-cuhalide-photophysics-contract/);
    assert.doesNotMatch(source,/PHOTOPHYSICS_CONTRACT='1\.3\.[123]'/);
    assert.doesNotMatch(source,/checkDownstream/,'service-only inner labels must not block an atomic public contract switch');
  }

  assert.match(exactSource,/cuhalide-atlas-current-rag-r6-exact-internal/,'generic exact behavior must preserve the existing historical fallback chain');
  assert.match(scienceSource,/cuhalide-atlas-current-rag-r7-exact-internal/);
  assert.match(unifiedSource,/cuhalide-atlas-current-rag-r7-science-exact-internal/);
  assert.match(smartSource,/cuhalide-atlas-current-rag-r7-unified-internal/);
});

test('1,2-dppb exact identity derives from structure-grain organic-component mapping, not Motif browse examples',()=>{
  assert.match(exactSource,/function dppb12Intent\(/);
  assert.match(exactSource,/pd\('article-structures',\{id:'382'\}\)/);
  assert.match(exactSource,/pd\('organic-components',\{structure_ids:ids\.join\(','\)\}\)/);
  assert.match(exactSource,/1-2-bis-diphenylphosphino-benzene/);
  assert.match(exactSource,/pd\('structure',\{id:String\(s\.structure_id\)\}\)/);
  assert.doesNotMatch(exactSource,/pd\('motifs'/,'exact organic identity must not depend on public Motif browse examples');
  assert.ok(!exactSource.includes('CUH-382-S04'),'structure IDs must be resolved from canonical structure-grain data rather than hard-coded');
  assert.ok(!exactSource.includes('CUH-382-S05'),'structure IDs must be resolved from canonical structure-grain data rather than hard-coded');
  assert.match(exactSource,/1,4-bis\(diphenylphosphino\)butane/,'abbreviation collision boundary must remain explicit');
  assert.match(exactSource,/live_revision:7/);
});
