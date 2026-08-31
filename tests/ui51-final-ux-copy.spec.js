import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

function captureBrowserErrors(page){
  const pageErrors=[],consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  return {pageErrors,consoleErrors};
}

async function expectClean(errors,page){
  await page.waitForTimeout(100);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
}

test('home research paths describe the public experience without internal eligibility jargon',async({page})=>{
  const errors=captureBrowserErrors(page);
  const r=await page.goto(`${BASE}/#home`,{waitUntil:'domcontentloaded'});expect(r?.status()).toBe(200);
  const start=page.locator('.ux-start');
  await expect(start).toContainText('Start with the type of evidence you need.',{timeout:15000});
  await expect(start).toContainText('Inspect crystallography');
  await expect(start).toContainText('Compare formula, phase, dimensionality and space group with source-linked records.');
  await expect(start).toContainText('Compare measurements');
  await expect(start).toContainText('Ask across the Atlas');
  await expect(start).not.toContainText('confidence and source mapping');
  await expect(start).not.toContainText('evidence layer');
  await expect(page.locator('#dimDist').locator('..')).toContainText('Curated structure records · n = 890');
  await expect(page.locator('.ux-hero-search-hint')).toContainText('curated structure register');
  await expectClean(errors,page);
});

test('literature, structures, assistant and methods use direct researcher-facing explanations',async({page})=>{
  const errors=captureBrowserErrors(page);
  await page.goto(`${BASE}/#articles`,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.view[data-view="articles"] .page-head')).toContainText('Search curated articles by title, DOI, year, halogen or category',{timeout:15000});
  await expect(page.locator('.ux-article-footer').first()).toContainText('related structures and reported measurements',{timeout:15000});

  await page.goto(`${BASE}/#structures`,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.view[data-view="structures"] .page-head')).toContainText('Browse curated structure and phase determinations.',{timeout:15000});
  await expect(page.locator('#sreset')).toHaveText('Reset filters');

  await page.goto(`${BASE}/#rag`,{waitUntil:'domcontentloaded'});
  const ragHead=page.locator('.view[data-view="rag"] .page-head');
  await expect(ragHead).toContainText('Evidence-linked scientific assistant',{timeout:15000});
  await expect(ragHead).toContainText('retrieves source-linked evidence automatically');

  await page.goto(`${BASE}/#methods`,{waitUntil:'domcontentloaded'});
  const methods=page.locator('.view[data-view="methods"]');
  await expect(methods.locator('.page-head')).toContainText('See how the Atlas separates article, structure, motif and measurement evidence',{timeout:15000});
  await expect(methods).toContainText('Keep evidence at the right level');
  await expectClean(errors,page);
});

test('article and structure dialogs replace evidence-grain engineering labels with scientific labels',async({page})=>{
  const errors=captureBrowserErrors(page);
  await page.goto(`${BASE}/#article/381`,{waitUntil:'domcontentloaded'});
  const modal=page.locator('#modalBody');
  await expect(modal).toContainText('Reported photophysics',{timeout:15000});
  await expect(modal).toContainText('Publisher abstracts and primary source files are not redistributed; use the DOI link for the original publication.');
  await expect(modal).not.toContainText('Article-grain photophysics');
  await page.keyboard.press('Escape');

  await page.goto(`${BASE}/#structure/CUH-013-S01`,{waitUntil:'domcontentloaded'});
  await expect(modal).toContainText('Local Cu–X motif',{timeout:15000});
  await expect(modal).toContainText('Linked photophysics');
  await expect(modal).not.toContainText('Structure-grain motif boundary');
  await expect(modal).not.toContainText('Photophysics evidence-grain boundary');
  await expectClean(errors,page);
});
