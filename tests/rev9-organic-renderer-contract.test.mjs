import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const ALL_VERIFIED_KEYS=[
  '1-benzyl-dabco-1-ium','1-butyl-1-methylpiperidinium','1-butyl-dabco-1-ium','1-isopropyl-dabco-1-ium','1-propyl-dabco-1-ium',
  '2-2-methyl-imidazol-1-yl-pyrimidine','2-imidazol-1-yl-4-methylpyrimidine','2-imidazol-1-yl-5-methoxypyrimidine','2-imidazol-1-yl-5-methylpyrimidine','2-imidazol-1-yl-pyrimidine',
  'acetamidinium','benzo-15-crown-5','btmdb','btmdme','bttmm','bttmp','cyclohexyldiphenylphosphine','diallyl-tetramethylethylenediaminium','dicyclohexylphenylphosphine','diphenyl-p-tolylphosphine',
  'ethylenediamine','ethyltriphenylphosphonium','imidazolium','n-methylpyrazinium','n-methylpyridinium','n-pentylpyridinium','n-propylpyridinium','piperazinium','piperidinium',
  'pynht-l1','pynht-l2','pynht-l3','r-3-methyl-3-aminoquinuclidinium-dication','s-3-methyl-3-aminoquinuclidinium-dication','tetrabutylammonium','tetraethylammonium','tetraheptylammonium','tetrahexylammonium','tetramethylammonium','tetrapentylammonium','tetraphenylphosphonium','tetrapropylammonium','trans-1-4-diaminocyclohexane','trans-1-4-diaminocyclohexane-diprotonated','tri-p-tolylphosphine','triphenylphosphine'
];
const RENDERER_EXCEPTIONS=['r-3-methyl-3-aminoquinuclidinium-dication','s-3-methyl-3-aminoquinuclidinium-dication'];
const NEW_AUTHORITY={
  '1-benzyl-dabco-1-ium':['C13H19N2+',1],
  '1-butyl-1-methylpiperidinium':['C10H22N+',1],
  '1-butyl-dabco-1-ium':['C10H21N2+',1],
  '1-isopropyl-dabco-1-ium':['C9H19N2+',1],
  '1-propyl-dabco-1-ium':['C9H19N2+',1],
  '2-2-methyl-imidazol-1-yl-pyrimidine':['C8H8N4',0],
  '2-imidazol-1-yl-4-methylpyrimidine':['C8H8N4',0],
  '2-imidazol-1-yl-5-methoxypyrimidine':['C8H8N4O',0],
  '2-imidazol-1-yl-5-methylpyrimidine':['C8H8N4',0],
  '2-imidazol-1-yl-pyrimidine':['C7H6N4',0],
  'benzo-15-crown-5':['C14H20O5',0],
  'btmdb':['C19H33N4+',1],
  'btmdme':['C11H17N4+',1],
  'bttmm':['C10H15N4+',1],
  'bttmp':['C12H19N4+',1],
  'cyclohexyldiphenylphosphine':['C18H21P',0],
  'diallyl-tetramethylethylenediaminium':['C12H26N2+2',2],
  'dicyclohexylphenylphosphine':['C18H27P',0],
  'diphenyl-p-tolylphosphine':['C19H17P',0],
  'ethylenediamine':['C2H8N2',0],
  'n-methylpyrazinium':['C5H7N2+',1],
  'n-methylpyridinium':['C6H8N+',1],
  'n-pentylpyridinium':['C10H16N+',1],
  'n-propylpyridinium':['C8H12N+',1],
  'piperidinium':['C5H12N+',1],
  'pynht-l1':['C20H23N3S',0],
  'pynht-l2':['C17H17N3S',0],
  'pynht-l3':['C14H11N3S',0],
  'tetraheptylammonium':['C28H60N+',1],
  'tetrahexylammonium':['C24H52N+',1],
  'tetrapentylammonium':['C20H44N+',1],
  'trans-1-4-diaminocyclohexane':['C6H14N2',0],
  'trans-1-4-diaminocyclohexane-diprotonated':['C6H16N2+2',2]
};

function registry(){
  const sandbox={window:{}};vm.createContext(sandbox);
  for(let i=1;i<=11;i++)vm.runInContext(fs.readFileSync(`public/organic-components-graphs-${i}.js`,'utf8'),sandbox,{filename:`organic-components-graphs-${i}.js`});
  return sandbox.window.__CuHalideOrganicGraphs||{};
}

test('rev.9 Organic Components renderer registry covers every renderer-safe verified canonical key',()=>{
  const r=registry(),missing=ALL_VERIFIED_KEYS.filter(k=>!r[k]);
  assert.deepEqual(missing,RENDERER_EXCEPTIONS);
  assert.equal(ALL_VERIFIED_KEYS.length,46);
  assert.equal(ALL_VERIFIED_KEYS.length-RENDERER_EXCEPTIONS.length,44);
  assert.equal(Object.keys(NEW_AUTHORITY).length,33);
});

test('rev.9 renderer additions preserve authoritative formula and formal charge metadata',()=>{
  const r=registry();
  for(const [key,[formula,charge]] of Object.entries(NEW_AUTHORITY)){
    assert.ok(r[key],`missing renderer graph: ${key}`);
    assert.equal(r[key].f,formula,`formula mismatch: ${key}`);
    assert.equal(r[key].q,charge,`formal charge mismatch: ${key}`);
    assert.ok(Array.isArray(r[key].a)&&r[key].a.length>1,`atom layout missing: ${key}`);
    assert.ok(Array.isArray(r[key].b)&&r[key].b.length>0,`bond layout missing: ${key}`);
  }
});

test('interactive shell, standalone record and candidate runtime all include the rev.9 renderer layer',()=>{
  const bootstrap=fs.readFileSync('public/ui-ux-v1.js','utf8');
  assert.match(bootstrap,/organic-components-graphs-11\.js\?v=1\.2\.0/);
  assert.match(bootstrap,/then\(\(\)=>load\('\/organic-components-v1\.js\?v=1\.2\.0'/);
  const record=fs.readFileSync('api/record-r9.js','utf8');
  assert.match(record,/organic-components-graphs-11\.js\?v=1\.2\.0/);
  assert.match(record,/Organic renderer must load before Organic Components runtime/);
  const server=fs.readFileSync('scripts/local-candidate-server.mjs','utf8');
  assert.match(server,/Array\.from\(\{length:11\}/);
});
