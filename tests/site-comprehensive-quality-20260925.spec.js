import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

test.describe.configure({mode:'serial'});

test('current portal exposes the quality layer and one visible article denominator',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('data-cuhalide-quality','52.4');
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

test('literature keeps one corpus denominator without a dense coverage dashboard',async({page})=>{
  await page.goto(`${BASE}/#articles`,{waitUntil:'networkidle'});
  await expect(page.locator('.ui-literature-coverage')).toHaveCount(0);
  await expect(page.locator('.view[data-view="articles"] .page-head')).toContainText('410-article DOI-deduplicated corpus');
});

test('structure and polar tables provide descriptive navigation and non-redundant captions',async({page})=>{
  await page.goto(`${BASE}/#structures`,{waitUntil:'networkidle'});
  const b=page.locator('#srows button[data-structure]').first();
  await expect(b).toBeVisible();
  await expect(b).toHaveAttribute('aria-label',/^Open structure CUH-/);
  await page.goto(`${BASE}/#polar`,{waitUntil:'networkidle'});
  await expect(page.locator('.view[data-view="polar"] caption')).toHaveText('Polar symmetry does not by itself establish ferroelectric switching.');
});


test('review status, hero search and filters expose clear interaction state',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  const review=page.locator('.ux-review-chip');
  await expect(review).toHaveAttribute('href','#citation');
  await expect(review).toHaveAttribute('aria-label',/learn how to interpret the current data state/);
  await expect(page.locator('#uxHeroSearchInput')).toHaveAttribute('aria-describedby','uxHeroSearchHint');
  await expect(page.locator('#uxHeroSearchHint')).toContainText('410-article literature corpus');

  await page.goto(`${BASE}/#structures`,{waitUntil:'networkidle'});
  const structureToggle=page.locator('.view[data-view="structures"] .mobile-filter-toggle');if(await structureToggle.isVisible())await structureToggle.click();
  const state=page.locator('.view[data-view="structures"] .ui-filter-status');
  await expect(state).toContainText('Default view');
  await expect(page.locator('.view[data-view="structures"] .ui-collection-progress')).toBeAttached();
  await page.locator('#sq').fill('P21');
  await expect(state).toContainText('1 active filter');
  const clear=state.locator('.ui-filter-clear');
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(page.locator('#sq')).toHaveValue('');
  await expect(state).toContainText('Default view');
});

test('polar filtering has a visible no-result state instead of a blank table',async({page})=>{
  await page.goto(`${BASE}/#polar`,{waitUntil:'networkidle'});
  const polarToggle=page.locator('.view[data-view="polar"] .mobile-filter-toggle');if(await polarToggle.isVisible())await polarToggle.click();
  await expect(page.locator('.view[data-view="polar"] .ui-collection-progress')).toBeAttached();
  await page.locator('#pq').fill('zzzzzz-no-such-polar-structure-2026');
  await expect(page.locator('#pcount')).toContainText('0 rows',{timeout:20000});
  await expect(page.locator('#prows .ui-empty-row')).toContainText('No matching polar structures. Adjust or clear the filters.');
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
    expect(html).toContain('/ui-quality-v52.css?v=52.4');
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

test('homepage timeline is visually simplified and uses literature-corpus counts',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('#yearChart').locator('xpath=ancestor::article[1]')).toContainText('Literature publications by year');
  await expect(page.locator('#yearChart').locator('xpath=ancestor::article[1]')).toContainText('DOI-deduplicated literature corpus');
  await expect(page.locator('#yearChart .bar[title="2026: 86"]')).toHaveCount(1);
  await expect(page.locator('#yearChart .bar[title="2025: 61"]')).toHaveCount(1);
  await expect(page.locator('.view[data-view="home"] .ki-overview')).toBeHidden();
  await expect(page.locator('.view[data-view="home"] .dashboard .panel:visible')).toHaveCount(1);
  await expect(page.locator('.view[data-view="home"] #releaseDl')).toBeHidden();
});
