import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const read=p=>readFile(new URL(`../${p}`,import.meta.url),'utf8');

test('organic component public contract is structure-grain, classified and fail-closed', async()=>{
  const [ui,css,proxy,edge,classifier,extra,migration,server,record]=await Promise.all([
    read('public/organic-components-v1.js'),read('public/organic-components-v1.css'),read('api/public-data.js'),
    read('supabase/functions/cuhalide-atlas-public-data-v3/index.ts'),read('supabase/functions/cuhalide-atlas-public-data-v3/organic-components.ts'),
    read('supabase/functions/cuhalide-atlas-public-data-v3/organic-components-extra.ts'),read('supabase/migrations/20260824024500_public_organic_components_read_rpc_v1.sql'),read('scripts/local-candidate-server.mjs'),read('api/record-current.js')
  ]);
  assert.match(ui,/Contract 1\.1\.0/);
  assert.match(ui,/CHUNKS=10/);
  assert.match(ui,/verified_connectivity/);
  assert.match(ui,/2D connectivity is not shown/);
  assert.match(ui,/All curated structure-grain component rows are explicitly classified/);
  assert.match(ui,/deterministic RDKit-derived connectivity depiction/);
  assert.match(ui,/enhanceStandalone/);
  assert.match(ui,/same field-whitelisted Organic Components 1\.1 projection/);
  assert.match(css,/\.oc-svg/);
  assert.match(proxy,/ORGANIC_COMPONENTS_CONTRACT='1\.1\.0'/);
  assert.match(proxy,/X-CuHalide-Organic-Components-Contract/);
  assert.match(edge,/ORGANIC_COMPONENTS_CONTRACT='1\.1\.0'/);
  assert.match(edge,/organic-components-extra\.ts/);
  assert.match(edge,/delete x\.item\.organic_components/);
  assert.match(edge,/x\.item\.organic_components=items/);
  assert.match(classifier,/CUH-154-S01/);
  assert.match(classifier,/component_key_collision/);
  assert.match(classifier,/mapping_identity_conflict/);
  assert.match(classifier,/not_organic_component/);
  assert.match(extra,/formamidinium/);
  assert.match(extra,/GUANIDINIUM_KEYS/);
  assert.doesNotMatch(edge,/evidence_basis|donor_atoms/);
  assert.doesNotMatch(classifier,/evidence_basis|donor_atoms/);
  assert.doesNotMatch(extra,/evidence_basis|donor_atoms/);
  assert.match(record,/ORGANIC_COMPONENTS_CONTRACT='1\.1\.0'/);
  assert.match(record,/injectOrganicComponents/);
  assert.match(record,/injectOrganicClient/);
  assert.match(record,/organic-components-v1\.js/);
  assert.match(record,/addSelfDirective/);
  assert.match(record,/Legacy evidence details are withheld rather than exposed/);
  assert.doesNotMatch(record,/donor_atoms/);
  assert.match(migration,/qc_status = 'passed'/);
  assert.match(migration,/revoke all .* from public, anon, authenticated/i);
  assert.match(migration,/grant execute .* to service_role/i);
  assert.match(server,/Array\.from\(\{length:10\}/);
});

test('deterministic graph bundle contains every currently verified canonical graph', async()=>{
  const chunks=await Promise.all(Array.from({length:10},(_,i)=>read(`public/organic-components-graphs-${i+1}.js`)));
  const context={window:{}};vm.createContext(context);
  for(const chunk of chunks)vm.runInContext(chunk,context);
  const graphs=context.window.__CuHalideOrganicGraphs||{};
  assert.ok(Object.keys(graphs).length>=81,`expected at least 81 deterministic graph assets, found ${Object.keys(graphs).length}`);
  for(const key of ['gua','dmap','methyltriphenylphosphonium','cyclopropyltriphenylphosphonium','n-butylquinolinium','formamidinium','pyridinium','dimethyl-sulfide','morpholinium','pnp']){
    assert.ok(graphs[key],`missing deterministic graph: ${key}`);
    assert.ok(Array.isArray(graphs[key].a)&&graphs[key].a.length>1,`missing atoms: ${key}`);
    assert.ok(Array.isArray(graphs[key].b)&&graphs[key].b.length>0,`missing bonds: ${key}`);
  }
  assert.doesNotMatch(chunks.join('\n'),/https?:\/\//i,'graph rendering must not depend on a remote image service');
});

test('organic component health contract has exact immutable mapping denominators and privacy semantics', async()=>{
  const [classifier,extra,meta]=await Promise.all([read('supabase/functions/cuhalide-atlas-public-data-v3/organic-components.ts'),read('supabase/functions/cuhalide-atlas-public-data-v3/organic-components-extra.ts'),read('api/meta.js')]);
  const joined=classifier+'\n'+extra;
  assert.match(joined,/rows\.length===495/);
  assert.match(joined,/structures\.size===453/);
  assert.match(joined,/rawKeys\.size===260/);
  assert.match(joined,/verified_plus_unresolved_equals_total/);
  assert.match(meta,/ORGANIC_COMPONENTS_VERSION='1\.1\.0'/);
  assert.match(meta,/organic_components_all_rows_classified/);
  assert.match(meta,/organic_components_private_evidence_guard/);
  assert.match(meta,/generative_imagery:false/);
});

test('public organic component projections do not contain private evidence keys', async()=>{
  const [ui,edge,classifier,extra,record]=await Promise.all([read('public/organic-components-v1.js'),read('supabase/functions/cuhalide-atlas-public-data-v3/index.ts'),read('supabase/functions/cuhalide-atlas-public-data-v3/organic-components.ts'),read('supabase/functions/cuhalide-atlas-public-data-v3/organic-components-extra.ts'),read('api/record-current.js')]);
  const sources=[['ui',ui],['edge',edge],['classifier',classifier],['extra',extra],['record',record]];
  for(const forbidden of ['evidence_basis','donor_atoms','source_hash','internal_sample_id']){
    for(const [name,src] of sources)assert.equal(src.includes(forbidden),false,`${forbidden} leaked into ${name}`);
  }
  const exactPrivateField=/(?:^|[,{]\s*)(?:evidence_locator|raw_primary_files|raw_evidence_locators)\s*:/m;
  for(const [name,src] of sources)assert.doesNotMatch(src,exactPrivateField,`private projection field leaked into ${name}`);
});
