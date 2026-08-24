import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts',import.meta.url),'utf8');

test('rev7 exact RAG has a versioned recovery source with current governance headers',()=>{
  assert.match(source,/VERSION='current-rag-r7\.0\.8'/);
  assert.match(source,/PHOTOPHYSICS_CONTRACT='1\.3\.0'/);
  assert.match(source,/noindex, nofollow, noarchive/);
  assert.match(source,/x-cuhalide-publication-state':'prepublication-review'/);
  assert.match(source,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(source,/cuhalide-atlas-current-rag-r6-exact-internal/,'generic exact behavior must preserve the existing fallback chain');
});

test('1,2-dppb exact identity derives from structure-grain organic-component mapping, not Motif browse examples',()=>{
  assert.match(source,/function dppb12Intent\(/);
  assert.match(source,/pd\('article-structures',\{id:'382'\}\)/);
  assert.match(source,/pd\('organic-components',\{structure_ids:ids\.join\(','\)\}\)/);
  assert.match(source,/1-2-bis-diphenylphosphino-benzene/);
  assert.match(source,/pd\('structure',\{id:String\(s\.structure_id\)\}\)/);
  assert.doesNotMatch(source,/pd\('motifs'/,'exact organic identity must not depend on public Motif browse examples');
  assert.ok(!source.includes('CUH-382-S04'),'structure IDs must be resolved from canonical structure-grain data rather than hard-coded');
  assert.ok(!source.includes('CUH-382-S05'),'structure IDs must be resolved from canonical structure-grain data rather than hard-coded');
  assert.match(source,/1,4-bis\(diphenylphosphino\)butane/,'abbreviation collision boundary must remain explicit');
  assert.match(source,/live_revision:7/);
});
