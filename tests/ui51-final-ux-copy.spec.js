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

test('home leads from identity to publications and concise research links',async({page})=>{
  const errors=captureBrowserErrors(page);
  const r=await page.goto(`${BASE}/#home`,{waitUntil:'domcontentloaded'});expect(r?.status()).toBe(200);
  const start=page.locator('.ux-start');
  await expect(page.locator('.hero h1')).toHaveText('CuHalide Atlas');
  await expect(page.locator('.hero-copy')).toContainText('organic-containing Cu(I) halides');
  await expect(page.locator('#yearChart')).toBeVisible();
  await expect(start.locator('.ux-start-card')).toHaveCount(4);
  await expect(start.locator('.ux-start-card strong')).toHaveText(['Literature','Structures','Photophysics','CuXplore']);
  await expect(page.locator('.ux-hero-search')).toBeHidden();
  await expect(page.locator('.hero .release')).toBeHidden();
  const order=await page.evaluate(()=>[...document.querySelectorAll('.view[data-view="home"] .hero,.view[data-view="home"] .dashboard,.view[data-view="home"] .ux-start')].map(n=>n.classList.contains('hero')?'identity':n.classList.contains('dashboard')?'chart':'links'));
  expect(order).toEqual(['identity','chart','links']);
  await expectClean(errors,page);
});

test('literature, structures, CuXplore and methods use direct researcher-facing explanations',async({page})=>{
  const errors=captureBrowserErrors(page);
  await page.goto(`${BASE}/#articles`,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.view[data-view="articles"] .page-head')).toContainText('Search 410 DOI-deduplicated articles by title or DOI.',{timeout:15000});
  await expect(page.locator('#knowledgeArticles .ki-source').first()).toContainText(/Linked structured data|Literature only/,{timeout:15000});

  await page.goto(`${BASE}/#structures`,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.view[data-view="structures"] .page-head')).toContainText('Browse curated structure and phase determinations.',{timeout:15000});
  await expect(page.locator('#sreset')).toHaveText('Reset filters');

  await page.goto(`${BASE}/#rag`,{waitUntil:'domcontentloaded'});
  const ragHead=page.locator('.view[data-view="rag"] .page-head');
  await expect(ragHead).toContainText('Literature-grounded research',{timeout:15000});
  await expect(ragHead).toContainText('CuXplore retrieves source-linked Atlas evidence');
  await expect(page.locator('[data-view="rag"]')).not.toContainText('Research Assistant');
  await expect(page.locator('[data-view="rag"]')).not.toContainText('Smart RAG');
  await expect(page.locator('[data-view="rag"]')).not.toContainText('Conversational LLM');

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
