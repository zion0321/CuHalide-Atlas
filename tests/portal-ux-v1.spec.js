import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const AXE_TAGS=['wcag2a','wcag2aa','wcag21aa','wcag22aa'];

test.describe.configure({mode:'serial'});

async function axe(page,label){const r=await new AxeBuilder({page}).withTags(AXE_TAGS).analyze();expect(r.violations,`${label}: ${r.violations.map(v=>`${v.id}:${v.nodes.length}`).join(', ')}`).toEqual([])}

test('home presents four research paths and a global search affordance',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('.hero h1')).toContainText('from structure to photophysics');
  await expect(page.locator('#uxSearchTrigger')).toBeVisible();
  await expect(page.locator('.ux-start-grid .ux-start-card')).toHaveCount(4);
  await expect(page.locator('.ux-start-grid')).toContainText('Literature');
  await expect(page.locator('.ux-start-grid')).toContainText('Structures');
  await expect(page.locator('.ux-start-grid')).toContainText('Photophysics');
  await expect(page.locator('.ux-start-grid')).toContainText('Research Assistant');
  await expect(page.locator('.ux-review-chip')).toContainText('Prepublication review');
  await expect(page.locator('#nav [data-route="home"]')).toHaveAttribute('aria-current','page');
  await axe(page,'home with UX layer');
});

test('global search finds a curated article and opens the interactive record',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.locator('#uxSearchTrigger').click();
  const dialog=page.locator('#uxSearchDialog');
  await expect(dialog).toBeVisible();
  const input=page.locator('#uxSearchInput');
  await input.fill('10.1021/acs.inorgchem.5c06028');
  const article=dialog.locator('[data-ux-open-article="381"]');
  await expect(article).toBeVisible({timeout:15000});
  await expect(article).toContainText('10.1021/acs.inorgchem.5c06028');
  await axe(page,'global search dialog');
  await article.click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#modalBody .photo-modal-section')).toBeVisible({timeout:15000});
  await expect(page.locator('#modalBody .ux-modal-tools a')).toHaveAttribute('href','/article/381');
  await expect(page.locator('#modalBody .ux-modal-tools')).toContainText('Copy record link');
});

test('command shortcut, escape handling and route aria-current are keyboard-safe',async({page})=>{
  await page.goto(`${BASE}/#structures`,{waitUntil:'networkidle'});
  await expect(page.locator('#nav [data-route="structures"]')).toHaveAttribute('aria-current','page');
  await page.keyboard.press(process.platform==='darwin'?'Meta+K':'Control+K');
  await expect(page.locator('#uxSearchDialog')).toBeVisible();
  await expect(page.locator('#uxSearchInput')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#uxSearchDialog')).toBeHidden();
  await page.goto(`${BASE}/#photophysics`,{waitUntil:'networkidle'});
  await expect(page.locator('#nav [data-route="photophysics"]')).toHaveAttribute('aria-current','page');
});

test('standalone record navigation exposes the same core research destinations',async({request})=>{
  const r=await request.get(`${BASE}/article/381`);expect(r.status()).toBe(200);const html=await r.text();
  expect(html).toContain('/#photophysics');
  expect(html).toContain('Photophysics');
  expect(html).toContain('Research Assistant');
  expect(html).not.toContain('>Smart RAG</a>');
});

test('mobile UX has no horizontal page overflow and search is usable',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile-chromium','mobile-only UX check');
  await page.goto(BASE,{waitUntil:'networkidle'});
  let widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client+1);
  await expect(page.locator('#uxSearchTrigger')).toBeVisible();
  await page.locator('#uxSearchTrigger').click();
  await expect(page.locator('#uxSearchDialog')).toBeVisible();
  widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client+1);
  await expect(page.locator('#uxSearchInput')).toBeFocused();
  await axe(page,'mobile search dialog');
});
