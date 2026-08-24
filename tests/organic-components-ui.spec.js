import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

test.describe.configure({mode:'serial'});

test('organic component API is structure-grain, deterministic and fail-closed',async({request})=>{
  const verified=await request.get(`${BASE}/api/public-data?action=organic-components&structure_id=CUH-371-S01`);
  expect(verified.status()).toBe(200);
  expect(verified.headers()['x-cuhalide-organic-components-contract']).toBe('1.0.0');
  const v=await verified.json();
  expect(v.ok).toBe(true);
  expect(v.contract_version).toBe('1.0.0');
  expect(v.items).toHaveLength(2);
  expect(v.items.map(x=>x.component_key).sort()).toEqual(['me2nh2','pr2-dabco']);
  for(const item of v.items){
    expect(item.depiction.status).toBe('verified_connectivity');
    expect(item.depiction.renderer).toContain('RDKit 2025.09.4');
    expect(item).not.toHaveProperty('evidence_basis');
    expect(item).not.toHaveProperty('donor_atoms');
  }

  const detail=await request.get(`${BASE}/api/public-data?action=structure&id=CUH-371-S01`);
  expect(detail.status()).toBe(200);
  const d=await detail.json();
  expect(d.item.organic_components).toEqual(d.organic_components);
  expect(d.item.organic_components).toHaveLength(2);
  for(const item of d.item.organic_components){
    expect(item).not.toHaveProperty('evidence_basis');
    expect(item).not.toHaveProperty('donor_atoms');
  }
  expect(JSON.stringify(d)).not.toMatch(/evidence_basis|donor_atoms|raw_primary_files|raw_evidence_locators|source_hash|evidence_locator|internal_sample_id/i);

  const unresolved=await request.get(`${BASE}/api/public-data?action=organic-components&structure_id=CUH-080-S01`);
  expect(unresolved.status()).toBe(200);
  const u=await unresolved.json();
  expect(u.items).toHaveLength(1);
  expect(u.items[0].component_key).toBe('mtpp');
  expect(u.items[0].depiction).toEqual({status:'unresolved'});
  expect(JSON.stringify(u)).not.toMatch(/raw_primary_files|raw_evidence_locators|source_hash|evidence_locator|internal_sample_id/i);
});

test('structure register renders mapped organic-component thumbnails',async({page})=>{
  await page.goto(`${BASE}/#structures`,{waitUntil:'networkidle'});
  await expect(page.locator('.oc-policy-note')).toContainText('Structure-grain mappings only',{timeout:15000});
  const search=page.locator('#sq');
  await expect(search).toHaveCount(1);
  await search.evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},'CUH-371-S01');
  await page.waitForTimeout(650);
  const row=page.locator('#srows tr').filter({hasText:'CUH-371-S01'}).first();
  await expect(row).toBeVisible({timeout:15000});
  await expect(row.locator('.oc-row-strip')).toBeVisible({timeout:15000});
  await expect(row.locator('.oc-mini-name')).toContainText(/Me2NH2|Pr2-DABCO/);
  await expect(row.locator('.oc-svg.mini')).toBeVisible();
});

test('verified and unresolved structure details preserve evidence boundaries',async({page})=>{
  await page.goto(`${BASE}/#structure/CUH-371-S01`,{waitUntil:'networkidle'});
  await expect(page.locator('#modal')).toBeVisible();
  const verified=page.locator('#modalBody .oc-detail[data-structure="CUH-371-S01"]');
  await expect(verified).toBeVisible({timeout:15000});
  await expect(verified.locator('.oc-card')).toHaveCount(2);
  await expect(verified.locator('.oc-svg')).toHaveCount(2);
  await expect(verified).toContainText('deterministic connectivity depiction');

  await page.goto(`${BASE}/#structure/CUH-080-S01`,{waitUntil:'networkidle'});
  const unresolved=page.locator('#modalBody .oc-detail[data-structure="CUH-080-S01"]');
  await expect(unresolved).toBeVisible({timeout:15000});
  await expect(unresolved.locator('.oc-card')).toHaveCount(1);
  await expect(unresolved.locator('.oc-svg')).toHaveCount(0);
  await expect(unresolved).toContainText('2D connectivity is not shown');
});
