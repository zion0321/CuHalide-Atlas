import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

test.describe.configure({mode:'serial'});

test('standalone structure pages do not inherit article-stage photophysics without a structure mapping',async({page})=>{
  for(const [id,stage] of [['CUH-006-S01','Two-pass verified'],['CUH-008-S01','Pass A curated']]){
    const response=await page.goto(`${BASE}/structure/${id}`,{waitUntil:'networkidle'});
    expect(response?.status()).toBe(200);
    const main=page.locator('main');
    await expect(main).toContainText('No structure-mapped data');
    await expect(main).toContainText(`parent article review stage is ${stage}`);
    await expect(main).toContainText('article-level and other sample-grain measurements are not assigned to this structure without an explicit structure mapping');
    await expect(main).not.toContainText('0 curated sample states · 0 measurements · 0 normalized values');
  }
});

test('standalone structure pages retain mapped photophysics while identifying verification as parent-article provenance',async({page})=>{
  const response=await page.goto(`${BASE}/structure/CUH-381-S01`,{waitUntil:'networkidle'});
  expect(response?.status()).toBe(200);
  const main=page.locator('main');
  await expect(main).toContainText('Parent article · Two-pass verified');
  await expect(main).toContainText('The parent article is two-pass verified. This structure page exposes only photophysics samples explicitly mapped to this structure');
  await expect(main).toContainText('R-1 crystal / bulk crystalline sample');
  await expect(main).toContainText('PLQY: 89.84 %');
  await expect(main).not.toContainText('No structure-mapped data');
  await expect(main).not.toContainText('Independent Pass A and Pass B review agree for this exposed article-level photophysics state.');
});

test('frozen-baseline articles are presented in the living rev.7 context without erasing frozen provenance',async({page})=>{
  const response=await page.goto(`${BASE}/article/46`,{waitUntil:'networkidle'});
  expect(response?.status()).toBe(200);
  const main=page.locator('main');
  await expect(main).toContainText('Current Curated rev.7 · record inherited from immutable Frozen Release 3.0.2 baseline');
  await expect(main).toContainText('Pass A curated');
  await expect(main).toContainText('PLQY: 41.5 %');
  await expect(main).not.toContainText('Part of archived scientific snapshot 3.0.2 · retained in the current corpus');
  const ld=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld.dateModified).toBe('2026-08-19');
  expect(ld.isPartOf?.name).toBe('CuHalide Atlas living knowledge base');
  expect(ld.isPartOf?.version).toBe('current-r7');
  expect(ld.isBasedOn?.name).toBe('CuHalide Atlas archived scientific snapshot 3.0.2');
  expect(ld.isBasedOn?.version).toBe('3.0.2');
});

test('current article standalone pages retain article-stage photophysics',async({page})=>{
  const verified=await page.goto(`${BASE}/article/381`,{waitUntil:'networkidle'});
  expect(verified?.status()).toBe(200);
  await expect(page.locator('main')).toContainText('Two-pass verified');
  await expect(page.locator('main')).toContainText('PLQY: 89.84 %');
});
