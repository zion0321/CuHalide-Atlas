import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const PRIVATE_KEY_RE=/\"(evidence_basis|donor_atoms|raw_primary_files|raw_evidence_locators|source_hash|evidence_locator|internal_sample_id)\"\s*:/i;

test.describe.configure({mode:'serial'});

test('organic component API classifies all 495 mappings and remains fail-closed',async({request})=>{
  const health=await request.get(`${BASE}/api/public-data?action=organic-components-health`);
  expect(health.status()).toBe(200);
  expect(health.headers()['x-cuhalide-organic-components-contract']).toBe('1.1.0');
  const h=await health.json();
  expect(h.ok).toBe(true);
  expect(h.contract_version).toBe('1.1.0');
  expect(h.component_rows).toBe(495);
  expect(h.mapped_structures).toBe(453);
  expect(h.distinct_raw_component_keys).toBe(260);
  expect(h.verified_connectivity_rows+h.unresolved_rows).toBe(495);
  expect(h.verified_connectivity_rows).toBeGreaterThanOrEqual(253);
  expect(h.structures_with_verified_connectivity).toBeGreaterThanOrEqual(241);
  expect(h.verified_connectivity_graph_keys).toBeGreaterThanOrEqual(81);
  expect(h.checks.all_rows_classified).toBe(true);
  expect(h.checks.mapping_baseline_stable).toBe(true);
  expect(h.checks.verified_plus_unresolved_equals_total).toBe(true);
  expect(h.checks.raw_primary_files_exposed).toBe(false);
  expect(h.checks.raw_evidence_locators_exposed).toBe(false);
  expect(h.checks.private_evidence_fields_exposed).toBe(false);

  const verified=await request.get(`${BASE}/api/public-data?action=organic-components&structure_id=CUH-371-S01`);
  expect(verified.status()).toBe(200);
  expect(verified.headers()['x-cuhalide-organic-components-contract']).toBe('1.1.0');
  const v=await verified.json();
  expect(v.items).toHaveLength(2);
  expect(v.items.map(x=>x.component_key).sort()).toEqual(['me2nh2','pr2-dabco']);
  for(const item of v.items){
    expect(item.depiction.status).toBe('verified_connectivity');
    expect(item.depiction.renderer).toContain('RDKit 2025.09.4');
  }

  const dmap=await request.get(`${BASE}/api/public-data?action=organic-components&structure_id=CUH-008-S01`);
  const dm=await dmap.json();
  expect(dm.items[0].depiction).toMatchObject({status:'verified_connectivity',key:'oc-dmap',molecular_formula:'C7H10N2',formal_charge:0});

  const collision=await request.get(`${BASE}/api/public-data?action=organic-components&structure_id=CUH-154-S01`);
  const c=await collision.json();
  expect(c.items[0].component_key).toBe('mtp');
  expect(c.items[0].depiction).toEqual({status:'unresolved',reason:'component_key_collision'});
  expect(JSON.stringify(c)).not.toMatch(PRIVATE_KEY_RE);

  const detail=await request.get(`${BASE}/api/public-data?action=structure&id=CUH-371-S01`);
  expect(detail.status()).toBe(200);
  const d=await detail.json();
  expect(d.item.organic_components).toEqual(d.organic_components);
  expect(d.item.organic_components).toHaveLength(2);
  expect(JSON.stringify(d)).not.toMatch(PRIVATE_KEY_RE);
});

test('structure register renders mapped organic-component thumbnails',async({page})=>{
  await page.goto(`${BASE}/#structures`,{waitUntil:'networkidle'});
  await expect(page.locator('.oc-policy-note')).toContainText('All curated structure-grain component rows are explicitly classified',{timeout:15000});
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

test('verified and unresolved structure details preserve identity boundaries',async({page})=>{
  await page.goto(`${BASE}/#structure/CUH-008-S01`,{waitUntil:'networkidle'});
  await expect(page.locator('#modal')).toBeVisible();
  const verified=page.locator('#modalBody .oc-detail[data-structure="CUH-008-S01"]');
  await expect(verified).toBeVisible({timeout:15000});
  await expect(verified.locator('.oc-card')).toHaveCount(1);
  await expect(verified.locator('.oc-svg')).toHaveCount(1);
  await expect(verified).toContainText('Contract 1.1.0');
  await expect(verified).toContainText('C7H10N2');

  await page.goto(`${BASE}/#structure/CUH-154-S01`,{waitUntil:'networkidle'});
  const unresolved=page.locator('#modalBody .oc-detail[data-structure="CUH-154-S01"]');
  await expect(unresolved).toBeVisible({timeout:15000});
  await expect(unresolved.locator('.oc-card')).toHaveCount(1);
  await expect(unresolved.locator('.oc-svg')).toHaveCount(0);
  await expect(unresolved).toContainText('2D connectivity is not shown');
  await expect(unresolved).toContainText('normalized component key maps to incompatible molecular identities');
});

test('standalone structure page uses the same field-whitelisted deterministic depiction contract',async({page})=>{
  const response=await page.goto(`${BASE}/structure/CUH-008-S01`,{waitUntil:'networkidle'});
  expect(response?.status()).toBe(200);
  expect(response?.headers()['x-cuhalide-organic-components-contract']).toBe('1.1.0');
  const host=page.locator('main [data-oc-standalone="CUH-008-S01"]');
  await expect(host).toBeVisible({timeout:15000});
  await expect(host).toContainText('Contract 1.1.0');
  await expect(host.locator('.oc-card')).toHaveCount(1);
  await expect(host.locator('.oc-svg')).toHaveCount(1);
  await expect(host).toContainText('C7H10N2');
  const html=await page.content();
  expect(html).not.toContain('donor_atoms');
  expect(html).not.toContain('evidence_basis');
  expect(html).not.toContain('source_hash');
  expect(html).not.toContain('internal_sample_id');
});
