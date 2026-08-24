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

test('standalone structure pages retain verified structure-mapped photophysics',async({page})=>{
  const response=await page.goto(`${BASE}/structure/CUH-381-S01`,{waitUntil:'networkidle'});
  expect(response?.status()).toBe(200);
  const main=page.locator('main');
  await expect(main).toContainText('Two-pass verified');
  await expect(main).toContainText('R-1 crystal / bulk crystalline sample');
  await expect(main).toContainText('PLQY: 89.84 %');
  await expect(main).not.toContainText('No structure-mapped data');
});

test('article standalone pages retain article-stage photophysics',async({page})=>{
  const passA=await page.goto(`${BASE}/article/46`,{waitUntil:'networkidle'});
  expect(passA?.status()).toBe(200);
  await expect(page.locator('main')).toContainText('Pass A curated');
  await expect(page.locator('main')).toContainText('PLQY: 41.5 %');

  const verified=await page.goto(`${BASE}/article/381`,{waitUntil:'networkidle'});
  expect(verified?.status()).toBe(200);
  await expect(page.locator('main')).toContainText('Two-pass verified');
  await expect(page.locator('main')).toContainText('PLQY: 89.84 %');
});
