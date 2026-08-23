import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE=process.env.CUHALIDE_BASE_URL||'https://cuhalide-atlas-v3.vercel.app';
const forbidden=['evidence_locator','raw_evidence_locator','source_file','private_path','internal_sample_id','candidate_score','reason_code'];
const AXE_TAGS=['wcag2a','wcag2aa','wcag21aa','wcag22aa'];

async function openArticle(page,id){
  await page.locator(`.view[data-view="photophysics"] button[data-article="${id}"]`).click();
  await expect(page.locator('#modal')).toHaveClass(/open/);
  await expect(page.locator('#modalBody .photo-modal-section')).toBeVisible({timeout:15000});
  return page.locator('#modalBody .photo-modal-section');
}

test('structured photophysics is a first-class visible portal feature',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  await page.goto(BASE,{waitUntil:'networkidle'});

  const nav=page.locator('#nav a[data-route="photophysics"]');
  await expect(nav).toHaveText('Photophysics');
  await expect(page.locator('.photo-home-panel')).toBeVisible();
  await expect(page.locator('.photo-home-panel')).toContainText('Photophysics is now sample- and measurement-resolved.');
  await expect(page.locator('#photoHomeMetrics')).toContainText('383');
  await expect(page.locator('#photoHomeMetrics')).toContainText('2260');
  await expect(page.locator('#photoHomeMetrics')).toContainText('2978');

  if(!(await nav.isVisible())){
    const menu=page.locator('#menu');
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(nav).toBeVisible();
  }
  await nav.click();
  const view=page.locator('.view[data-view="photophysics"]');
  await expect(view).toHaveClass(/active/);
  await expect(view).toBeVisible();
  await expect(view).toContainText('Photophysics at the correct experimental grain');
  await expect(page.locator('#photoStatusGrid')).toContainText('Pass A complete');
  await expect(page.locator('#photoStatusGrid')).toContainText('383');
  await expect(page.locator('#photoStatusGrid')).toContainText('2260');
  await expect(page.locator('#photoStatusGrid')).toContainText('2978');
  await expect(view).toContainText('Pass A curated');
  await expect(view).toContainText('Two-pass verified');
  await expect(view).toContainText('Article');
  await expect(view).toContainText('Sample state');
  await expect(view).toContainText('Measurement');
  await expect(view).toContainText('Value / band / mechanism');

  const verified=await openArticle(page,381);
  await expect(verified).toContainText('Sample-resolved measurements');
  await expect(verified).toContainText('Two-pass verified');
  await expect(verified.locator('.photo-sample').first()).toBeVisible();
  await expect(verified).toContainText(/PLQY|Lifetime|Emission peak/);
  const verifiedText=(await verified.innerText()).toLowerCase();
  for(const key of forbidden)expect(verifiedText).not.toContain(key);

  await page.keyboard.press('Escape');
  await expect(page.locator('#modal')).not.toHaveClass(/open/);

  const passA=await openArticle(page,46);
  await expect(passA).toContainText('Pass A curated');
  await expect(passA).toContainText('Primary-evidence Pass A is complete');
  const passAText=(await passA.innerText()).toLowerCase();
  for(const key of forbidden)expect(passAText).not.toContain(key);

  expect(pageErrors,`page errors: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('photophysics destination passes WCAG AA automated scan',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','single-project accessibility gate');
  await page.goto(`${BASE}/#photophysics`,{waitUntil:'networkidle'});
  await expect(page.locator('.view[data-view="photophysics"]')).toBeVisible();
  const results=await new AxeBuilder({page}).withTags(AXE_TAGS).analyze();
  expect(results.violations,results.violations.map(v=>`${v.id}:${v.nodes.length}`).join(', ')).toEqual([]);
});

test('visible photophysics remains usable without horizontal overflow on mobile',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile-chromium','mobile-only visual layout check');
  await page.goto(`${BASE}/#photophysics`,{waitUntil:'networkidle'});
  await expect(page.locator('.view[data-view="photophysics"]')).toBeVisible();
  const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client+1);
  await expect(page.locator('#photoStatusGrid')).toBeVisible();
  await expect(page.locator('.photo-example-actions')).toBeVisible();
});
