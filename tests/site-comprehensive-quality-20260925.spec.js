import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

test.describe.configure({mode:'serial'});

test('current portal exposes the quality layer and one visible article denominator',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('data-cuhalide-quality','52.3');
  await expect(page.locator('.view[data-view="home"]')).toContainText('410');
  await expect(page.locator('body')).not.toContainText('Boundary context');
  await expect(page.locator('body')).not.toContainText('Additional literature');
});

test('global search reaches literature records without a linked structured record',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.locator('#uxSearchTrigger').click();
  const q=page.locator('#uxSearchInput');await q.fill('Fluorescence Thermochromism');
  const result=page.locator('.ux-search-results .ux-search-result').first();
  await expect(result).toContainText('Fluorescence Thermochromism',{timeout:20000});
  await expect(result).toContainText('no linked structured record');
  await expect(result).toHaveAttribute('href',/doi\.org\/10\.1002\/zaac\.19734020113/);
});

test('literature makes source coverage explicit without creating a second corpus',async({page})=>{
  await page.goto(`${BASE}/#articles`,{waitUntil:'networkidle'});
  const cov=page.locator('.ui-literature-coverage');
  await expect(cov).toBeVisible();
  await expect(cov).toContainText('410 articles');
  await expect(cov).toContainText('387 / 410');
  await expect(cov).toContainText('727');
  await expect(cov).toContainText('6,275');
  await expect(page.locator('.view[data-view="articles"] .page-head')).toContainText('Literature corpus');
});

test('structure and polar tables provide descriptive navigation and non-redundant captions',async({page})=>{
  await page.goto(`${BASE}/#structures`,{waitUntil:'networkidle'});
  const b=page.locator('#srows button[data-structure]').first();
  await expect(b).toBeVisible();
  await expect(b).toHaveAttribute('aria-label',/^Open structure CUH-/);
  await page.goto(`${BASE}/#polar`,{waitUntil:'networkidle'});
  await expect(page.locator('.view[data-view="polar"] caption')).toHaveText('Polar symmetry does not by itself establish ferroelectric switching.');
});

test('CuXplore has explicit idle/busy semantics without submitting a model request',async({page})=>{
  await page.goto(`${BASE}/#rag`,{waitUntil:'networkidle'});
  await expect(page.locator('.rag-work')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('.ki-retrieval')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('.rag-work .ui-busy-bar')).toBeAttached();
  await expect(page.locator('.ki-retrieval .ui-busy-bar')).toBeAttached();
});

test('About data exposes the update timeline',async({page})=>{
  await page.goto(`${BASE}/#citation`,{waitUntil:'networkidle'});
  const timeline=page.locator('.ui-version-timeline');
  await expect(timeline).toBeVisible();
  for(const t of ['30 Jun 2026','11 Aug 2026','14 Sep 2026','23–24 Sep 2026','25 Sep 2026'])await expect(timeline).toContainText(t);
});

test('Motif Atlas explains authority versus Core-Included denominators',async({page})=>{
  await page.goto(`${BASE}/motifs`,{waitUntil:'networkidle'});
  const help=page.locator('.ui-denominator-help');
  await expect(help).toBeVisible();
  await expect(help).toContainText('939');
  await expect(help).toContainText('901');
});

test('standalone records and error pages use CuXplore branding',async({request})=>{
  for(const path of ['/structure/CUH-382-S01','/article/999999']){
    const r=await request.get(`${BASE}${path}`);
    expect([200,404]).toContain(r.status());
    const html=await r.text();
    expect(html).not.toContain('Research Assistant');
    expect(html).toContain('CuXplore');
    expect(html).toContain('/ui-quality-v52.css?v=52.3');
  }
});

test('mobile quality layer does not introduce horizontal overflow',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile-chromium','mobile-only overflow regression');
  for(const hash of ['#home','#articles','#structures','#photophysics','#polar','#rag','#citation']){
    await page.goto(`${BASE}/${hash}`,{waitUntil:'networkidle'});
    const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    expect(w.scroll).toBeLessThanOrEqual(w.client+1);
  }
});
