import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=p=>readFile(new URL(`../${p}`,import.meta.url),'utf8');

test('organic component public contract is structure-grain and fail-closed', async()=>{
  const [ui,css,proxy,edge,migration]=await Promise.all([
    read('public/organic-components-v1.js'),
    read('public/organic-components-v1.css'),
    read('api/public-data.js'),
    read('supabase/functions/cuhalide-atlas-public-data-v3/index.ts'),
    read('supabase/migrations/20260824024500_public_organic_components_read_rpc_v1.sql')
  ]);
  assert.match(ui,/Contract 1\.0\.0/);
  assert.match(ui,/verified_connectivity/);
  assert.match(ui,/2D connectivity is not shown/);
  assert.match(ui,/Structure-grain mappings only/);
  assert.match(ui,/deterministic connectivity depiction/);
  assert.match(css,/\.oc-svg/);
  assert.match(proxy,/ORGANIC_COMPONENTS_CONTRACT='1\.0\.0'/);
  assert.match(proxy,/X-CuHalide-Organic-Components-Contract/);
  assert.match(edge,/ORGANIC_COMPONENTS_CONTRACT='1\.0\.0'/);
  assert.match(edge,/delete x\.item\.organic_components/);
  assert.match(edge,/x\.item\.organic_components=items/);
  assert.doesNotMatch(edge,/evidence_basis|donor_atoms/);
  assert.match(migration,/qc_status = 'passed'/);
  assert.match(migration,/revoke all .* from public, anon, authenticated/i);
  assert.match(migration,/grant execute .* to service_role/i);
});

test('deterministic graph bundle is complete for the verified-connectivity allowlist', async()=>{
  const chunks=await Promise.all(Array.from({length:6},(_,i)=>read(`public/organic-components-graphs-${i+1}.js`)));
  const joined=chunks.join('\n');
  const keys=['acetonitrile','me2nh2','gua','tetraethylammonium','tetrapropylammonium','18c6','toluene','2-methylpyridine','2-ethylpyridine','26-dimethylpyridine','35-dimethylpyridine','3-pic','4-pic','quinoline','4-phenoxypyridine','pph3','bis-diphenylphosphino-methane','1-2-bis-diphenylphosphino-benzene','1-3-di-4-pyridyl-propane','bpp','phs-c3-sph','phs-c5-sph','ptols-c5-stolp','1-4-dibenzyl-dabco-dication','1-4-bis-4-chlorobenzyl-dabco-dication','pr2-dabco'];
  for(const key of keys)assert.ok(joined.includes(`\"${key}\"`),`missing deterministic graph: ${key}`);
  assert.equal(keys.length,26);
  assert.doesNotMatch(joined,/https?:\/\//i,'graph rendering must not depend on a remote image service');
});

test('public organic component code does not expose private evidence fields', async()=>{
  const [ui,proxy,edge]=await Promise.all([read('public/organic-components-v1.js'),read('api/public-data.js'),read('supabase/functions/cuhalide-atlas-public-data-v3/index.ts')]);
  for(const forbidden of ['raw_primary_files','raw_evidence_locators','source_hash','evidence_locator','internal_sample_id']){
    assert.equal(ui.includes(forbidden),false,`${forbidden} leaked into UI layer`);
    assert.equal(proxy.includes(forbidden),false,`${forbidden} leaked into public proxy`);
    assert.equal(edge.includes(forbidden),false,`${forbidden} leaked into canonical edge projection`);
  }
});
