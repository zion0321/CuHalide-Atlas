import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const PUBLIC='https://cuhalide-atlas-v3.vercel.app';
test.describe.configure({mode:'serial'});

test('standalone structure pages do not inherit article-stage photophysics without a structure mapping',async({page})=>{
  for(const [id,stage] of [['CUH-006-S01','Two-pass verified'],['CUH-008-S01','Pass A curated']]){
    const response=await page.goto(`${BASE}/structure/${id}`,{waitUntil:'networkidle'});expect(response?.status()).toBe(200);expect(response?.headers()['x-cuhalide-current-curated-revision']).toBe('8');
    const main=page.locator('main');await expect(main).toContainText('No structure-mapped data');await expect(main).toContainText(`parent article review stage is ${stage}`);await expect(main).toContainText('article-level and other sample-grain measurements are not assigned to this structure without an explicit structure mapping');await expect(main).not.toContainText('0 curated sample states · 0 measurements · 0 normalized values');
  }
});

test('standalone structure pages retain mapped photophysics while identifying verification as parent-article provenance',async({page})=>{
  const response=await page.goto(`${BASE}/structure/CUH-381-S01`,{waitUntil:'networkidle'});expect(response?.status()).toBe(200);expect(response?.headers()['x-cuhalide-current-curated-revision']).toBe('8');
  const main=page.locator('main');await expect(main).toContainText('Parent article · Two-pass verified');await expect(main).toContainText('The parent article is two-pass verified. This structure page exposes only photophysics samples explicitly mapped to this structure');await expect(main).toContainText('R-1 crystal / bulk crystalline sample');await expect(main).toContainText('PLQY: 89.84 %');await expect(main).not.toContainText('No structure-mapped data');await expect(main).not.toContainText('Independent Pass A and Pass B review agree for this exposed article-level photophysics state.');
});

test('interactive structure modal stays fail-closed when no sample is mapped to the structure',async({page})=>{
  const response=await page.goto(`${BASE}/#structure/CUH-006-S01`,{waitUntil:'networkidle'});expect(response?.status()).toBe(200);
  const modal=page.locator('#modalBody');await expect(modal).toContainText('No structure-mapped data');await expect(modal).toContainText('Parent article · Two-pass verified');await expect(modal).toContainText('does not assign article-level or other sample-grain measurements to this crystallographic structure');await expect(modal).not.toContainText('0 curated sample states');await expect(modal).not.toContainText('Photophysics evidence-grain boundary');
});

test('interactive structure modal exposes only explicitly mapped photophysics samples',async({page})=>{
  const response=await page.goto(`${BASE}/#structure/CUH-381-S01`,{waitUntil:'networkidle'});expect(response?.status()).toBe(200);
  const modal=page.locator('#modalBody');await expect(modal).toContainText('Measurements mapped to CUH-381-S01');await expect(modal).toContainText('Parent article · Two-pass verified');await expect(modal).toContainText('R-1 crystal / bulk crystalline sample');await expect(modal).toContainText('PLQY');await expect(modal).toContainText('89.84 %');await expect(modal).not.toContainText('No structure-mapped data');await expect(modal).not.toContainText('Photophysics evidence-grain boundary');
});

test('frozen-baseline article page owns Rev.8 Atlas provenance while source ScholarlyArticle stays publication-scoped',async({page})=>{
  const response=await page.goto(`${BASE}/article/46`,{waitUntil:'networkidle'});expect(response?.status()).toBe(200);expect(response?.headers()['x-cuhalide-current-curated-revision']).toBe('8');
  const main=page.locator('main');await expect(main).toContainText('Current Curated rev.8 context · core article record inherited from immutable Frozen Release 3.0.2 baseline');await expect(main).toContainText('Two-pass verified');await expect(main).toContainText('Independent Pass A and Pass B review agree');await expect(main).not.toContainText('Pass A curated');await expect(main).toContainText('PLQY: 41.5 %');await expect(main).not.toContainText('Part of archived scientific snapshot 3.0.2 · retained in the current corpus');
  const ld=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());expect(ld['@type']).toBe('WebPage');expect(ld['@id']).toBe(`${PUBLIC}/article/46#record`);expect(ld.url).toBe(`${PUBLIC}/article/46`);expect(ld.dateModified).toBe('2026-08-19');expect(ld.isPartOf?.name).toBe('CuHalide Atlas living knowledge base');expect(ld.isPartOf?.version).toBe('current-r8');expect(ld.isPartOf?.creativeWorkStatus).toBe('Prepublication review');expect(ld.isBasedOn?.name).toBe('CuHalide Atlas archived scientific snapshot 3.0.2');expect(ld.isBasedOn?.version).toBe('3.0.2');expect(ld.mainEntity).toMatchObject({'@type':'ScholarlyArticle','@id':'https://doi.org/10.1038/s41377-025-01910-1',identifier:'10.1038/s41377-025-01910-1',url:'https://doi.org/10.1038/s41377-025-01910-1',sameAs:'https://doi.org/10.1038/s41377-025-01910-1',datePublished:'2025'});expect(ld.mainEntity).not.toHaveProperty('dateModified');expect(ld.mainEntity).not.toHaveProperty('isPartOf');expect(ld.mainEntity).not.toHaveProperty('isBasedOn');expect(ld.mainEntity).not.toHaveProperty('creativeWorkStatus');
});

test('current article standalone pages retain article-stage photophysics and omit frozen-page provenance',async({page})=>{
  const verified=await page.goto(`${BASE}/article/381`,{waitUntil:'networkidle'});expect(verified?.status()).toBe(200);expect(verified?.headers()['x-cuhalide-current-curated-revision']).toBe('8');await expect(page.locator('main')).toContainText('Two-pass verified');await expect(page.locator('main')).toContainText('PLQY: 89.84 %');
  const ld=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());expect(ld['@type']).toBe('WebPage');expect(ld['@id']).toBe(`${PUBLIC}/article/381#record`);expect(ld.dateModified).toBe('2026-08-19');expect(ld.isPartOf?.version).toBe('current-r8');expect(ld.isBasedOn).toBeUndefined();expect(ld.mainEntity?.['@type']).toBe('ScholarlyArticle');expect(ld.mainEntity?.identifier).toBe('10.1021/acs.inorgchem.5c06028');expect(ld.mainEntity?.url).toBe('https://doi.org/10.1021/acs.inorgchem.5c06028');expect(ld.mainEntity).not.toHaveProperty('dateModified');expect(ld.mainEntity).not.toHaveProperty('isBasedOn');
});
