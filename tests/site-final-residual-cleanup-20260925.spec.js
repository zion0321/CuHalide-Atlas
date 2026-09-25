import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

test('Overview makes full-text indexing an explicit subset of the 410-article corpus',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  const coverage=page.locator('#knowledgeCoverage');
  await expect(coverage).toContainText('Articles');
  await expect(coverage).toContainText('410');
  await expect(coverage).toContainText('Articles with full-text indexing');
  await expect(coverage).toContainText('403');
  await expect(coverage).toContainText('subset of 410 literature articles');
});

test('Polar page avoids repeating the same ferroelectric disclaimer',async({page})=>{
  await page.goto(`${BASE}/#polar`,{waitUntil:'networkidle'});
  const view=page.locator('.view[data-view="polar"]');
  await expect(view.locator('.polar-intro')).toContainText('Polar does not mean ferroelectric.');
  await expect(view.locator('#pcount').locator('..')).toContainText('Strict-polar subset · highest evidence level only.');
  const exact=await view.getByText('Polar symmetry does not by itself establish ferroelectric switching.',{exact:true}).count();
  expect(exact).toBe(0);
});

test('footer and CuXplore navigation use concise consistent naming',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('.footer-links a[href="#citation"]')).toHaveText('About data');
  const rag=page.locator('#nav [data-route="rag"]');
  await expect(rag).toHaveText('CuXplore');
  await expect(rag).toHaveAttribute('title','CuXplore');
});

test('Photophysics summary cards are readable and balanced',async({page})=>{
  await page.goto(`${BASE}/#photophysics`,{waitUntil:'networkidle'});
  const grid=page.locator('#photoStatusGrid');
  await expect(grid).toContainText('normalized values reported in sources');
  await expect(grid.locator('.photo-stat')).toHaveCount(5);
  for(const card of await grid.locator('.photo-stat').all()){
    const box=await card.boundingBox();
    expect(box?.width||0).toBeGreaterThan(150);
  }
});

test('unknown routes return a branded 404 with a recovery path',async({page})=>{
  const r=await page.goto(`${BASE}/nonexistent-page-test`,{waitUntil:'domcontentloaded'});
  expect(r?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — CuHalide Atlas');
  await expect(page.locator('body')).toContainText('This route is not part of the current Atlas.');
  await expect(page.getByRole('link',{name:'Return to Overview'})).toHaveAttribute('href','/');
  await expect(page.locator('.nf-nav')).toContainText('CuXplore');
});
