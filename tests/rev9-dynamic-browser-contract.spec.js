import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

const VERIFIED_GRAPH_KEYS=[
  '1-benzyl-dabco-1-ium','1-butyl-1-methylpiperidinium','1-butyl-dabco-1-ium','1-isopropyl-dabco-1-ium','1-propyl-dabco-1-ium',
  '2-2-methyl-imidazol-1-yl-pyrimidine','2-imidazol-1-yl-4-methylpyrimidine','2-imidazol-1-yl-5-methoxypyrimidine','2-imidazol-1-yl-5-methylpyrimidine','2-imidazol-1-yl-pyrimidine',
  'acetamidinium','benzo-15-crown-5','btmdb','btmdme','bttmm','bttmp','cyclohexyldiphenylphosphine','diallyl-tetramethylethylenediaminium','dicyclohexylphenylphosphine','diphenyl-p-tolylphosphine',
  'ethylenediamine','ethyltriphenylphosphonium','imidazolium','n-methylpyrazinium','n-methylpyridinium','n-pentylpyridinium','n-propylpyridinium','piperazinium','piperidinium',
  'pynht-l1','pynht-l2','pynht-l3','r-3-methyl-3-aminoquinuclidinium-dication','s-3-methyl-3-aminoquinuclidinium-dication','tetrabutylammonium','tetraethylammonium','tetraheptylammonium','tetrahexylammonium','tetramethylammonium','tetrapentylammonium','tetraphenylphosphonium','tetrapropylammonium','trans-1-4-diaminocyclohexane','trans-1-4-diaminocyclohexane-diprotonated','tri-p-tolylphosphine','triphenylphosphine'
];

function captureBrowserErrors(page){
  const pageErrors=[],consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  return {pageErrors,consoleErrors};
}

test('production shell activates only UI 51 browser assets with correct MIME and citation body is rev.9',async({request})=>{
  const root=await request.get(`${BASE}/api/site`);expect(root.status()).toBe(200);const html=await root.text();
  const currentAssets=['/ui-v51-core.css?v=51.0','/ui-v51-core.js?v=51.0','/ui-assistant-v51.css?v=51.0','/ui-photophysics-v1.js?v=1.4.0','/ui-ux-v1.js?v=51.0'];
  for(const token of currentAssets)expect(html).toContain(token);
  for(const stale of ['/ui-v48-2.','ui-assistant-v48-5','v=50.2','CUHALIDE_UI_V48_5','/ui-photophysics-v1.js?v=1.0.0'])expect(html).not.toContain(stale);
  for(const asset of currentAssets){const r=await request.get(`${BASE}${asset}`);expect(r.status(),asset).toBe(200);const ct=String(r.headers()['content-type']||'');if(asset.includes('.css'))expect(ct,asset).toMatch(/^text\/css\b/i);else expect(ct,asset).toMatch(/^(text|application)\/javascript\b/i)}
  const c=await request.get(`${BASE}/citation.cff`);expect(c.status()).toBe(200);const citation=await c.text();
  expect(citation).toContain('Current Curated rev.9 (prepublication review)');
  expect(citation).toContain('Structured Photophysics 1.4.0');
  expect(citation).toContain('Organic Components 1.2.0');
  expect(citation).not.toContain('Current Curated rev.8');
});

test('Photophysics 1.4 dynamic view loads the current publication state without client errors',async({page})=>{
  const errors=captureBrowserErrors(page);
  const r=await page.goto(`${BASE}/#photophysics`,{waitUntil:'domcontentloaded'});expect(r?.status()).toBe(200);
  const view=page.locator('.view[data-view="photophysics"]');await expect(view).toHaveClass(/active/,{timeout:15000});
  await expect(view).toContainText('contract 1.4.0');
  const status=page.locator('#photoStatusGrid');
  await expect(status).toContainText('Two-pass verified',{timeout:15000});
  for(const token of ['329','Verified no reported data','54','2275','3002','280','478','66'])await expect(status).toContainText(token);
  await expect(status).not.toContainText('temporarily unavailable');
  await expect(view).not.toContainText('Pass A curated');
  await expect(view).not.toContainText('published at first-pass stage');
  await page.waitForTimeout(150);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('Organic Components 1.2 renders verified connectivity and the complete rev.9 graph registry',async({page})=>{
  const errors=captureBrowserErrors(page);
  const r=await page.goto(`${BASE}/structure/CUH-013-S01`,{waitUntil:'domcontentloaded'});expect(r?.status()).toBe(200);
  const host=page.locator('[data-oc-standalone="CUH-013-S01"]');
  await expect(host.locator('.oc-contract')).toHaveText('Contract 1.2.0',{timeout:15000});
  const registry=await page.evaluate(()=>Object.keys(window.__CuHalideOrganicGraphs||{}));
  const missing=VERIFIED_GRAPH_KEYS.filter(key=>!registry.includes(key));
  expect(missing,'all rev.9 verified-connectivity keys require a deterministic browser graph').toEqual([]);
  await expect(host.locator('svg.oc-svg')).toHaveCount(1,{timeout:15000});
  await page.waitForTimeout(100);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('Organic Components 1.2 preserves terminal unresolved connectivity without an inferred diagram',async({page})=>{
  const errors=captureBrowserErrors(page);
  const r=await page.goto(`${BASE}/structure/CUH-001-S01`,{waitUntil:'domcontentloaded'});expect(r?.status()).toBe(200);
  const host=page.locator('[data-oc-standalone="CUH-001-S01"]');
  await expect(host.locator('.oc-contract')).toHaveText('Contract 1.2.0',{timeout:15000});
  await expect(host.locator('.oc-unresolved')).toContainText('2D unresolved',{timeout:15000});
  await expect(host.locator('svg.oc-svg')).toHaveCount(0);
  await expect(host).toContainText('not uniquely');
  await page.waitForTimeout(100);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});
