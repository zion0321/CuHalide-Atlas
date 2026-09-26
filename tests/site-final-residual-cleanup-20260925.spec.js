import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

test('Overview foregrounds one literature timeline and hides secondary audit panels',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  const growth=page.locator('#yearChart').locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " panel ")][1]');
  await expect(growth).toBeVisible();
  await expect(growth.locator('.denom')).toContainText('DOI-deduplicated literature corpus');
  await expect(page.locator('#yearChart .bar[title="2025: 61"]')).toHaveCount(1);
  await expect(page.locator('#yearChart .bar[title="2026: 86"]')).toHaveCount(1);
  const halogen=page.locator('#halogenDist').locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " panel ")][1]');
  await expect(halogen).toBeHidden();
});

test('Overview keeps processing coverage out of the primary discovery surface',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('.view[data-view="home"] .ki-overview')).toBeHidden();
  await expect(page.locator('.view[data-view="home"] #kpis').locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " section ")][1]')).toBeHidden();
  await page.goto(`${BASE}/#citation`,{waitUntil:'networkidle'});
  const about=page.locator('.view[data-view="citation"]');
  await expect(about).toContainText('Detailed methods and provenance');
  await expect(about).toContainText('Source review and indexing');
});

test('Polar page avoids repeating the same ferroelectric disclaimer',async({page})=>{
  await page.goto(`${BASE}/#polar`,{waitUntil:'networkidle'});
  const view=page.locator('.view[data-view="polar"]');
  await expect(view.locator('.polar-intro')).toContainText('Polar does not mean ferroelectric.');
  await expect(view.locator('#pcount').locator('..')).toContainText('Strict-polar subset · highest evidence level only.');
  const exact=await view.getByText('Polar symmetry does not by itself establish ferroelectric switching.',{exact:true}).count();
  expect(exact).toBe(1);
  await expect(view.locator('caption')).toHaveText('Polar symmetry does not by itself establish ferroelectric switching.');
});

test('footer and CuXplore navigation use concise consistent naming',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('.footer-links a[href="#citation"]')).toHaveText('About data');
  const rag=page.locator('#nav [data-route="rag"]');
  await expect(rag).toHaveText('CuXplore');
  await expect(rag).toHaveAttribute('title','CuXplore');
});

test('Photophysics coverage stays compact until requested',async({page})=>{
  await page.goto(`${BASE}/#photophysics`,{waitUntil:'networkidle'});
  const coverage=page.locator('.ui-photo-coverage');
  const grid=page.locator('#photoStatusGrid');
  await expect(coverage.locator('summary')).toBeVisible();
  await expect(coverage).not.toHaveAttribute('open','');
  await expect(grid.locator('.photo-stat')).toHaveCount(5);
  await expect(grid).toContainText('normalized values reported in sources');
  await coverage.locator('summary').click();
  await expect(coverage).toHaveAttribute('open','');
  await expect(grid.locator('.photo-stat').first()).toBeVisible();
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
