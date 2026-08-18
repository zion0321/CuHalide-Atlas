import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});
const AXE_TAGS=['wcag2a','wcag2aa','wcag21aa','wcag22aa'];

function header(response,name){return response.headers()[String(name).toLowerCase()]||''}

async function expectCurrentPageMetadata(response,html){
  expect(response.status()).toBe(200);
  expect(header(response,'x-cuhalide-site-version')).toBe('50');
  expect(header(response,'x-cuhalide-current-curated-revision')).toBe('5');
  expect(html).toContain('content="5"');
  expect(html).toContain('current-r5');
  expect(html).toContain('2026-08-17');
  expect(html).not.toContain('current-r3');
  expect(html).not.toContain('reviewed through 14 Aug 2026');
}

async function expectNoAxeViolations(page,path){
  const r=await page.goto(`${BASE}${path}`,{waitUntil:'networkidle'});
  expect(r?.status()).toBe(200);
  const results=await new AxeBuilder({page}).withTags(AXE_TAGS).analyze();
  expect(results.violations,`${path}: ${results.violations.map(v=>`${v.id}:${v.nodes.length}`).join(', ')}`).toEqual([]);
}

test('home passes automated WCAG AA scan with no violations',async({page})=>{
  await expectNoAxeViolations(page,'/');
});

test('Motif Atlas and public record pages pass automated WCAG AA scans',async({page})=>{
  await expectNoAxeViolations(page,'/motifs');
  await expectNoAxeViolations(page,'/article/379');
  await expectNoAxeViolations(page,'/structure/CUH-378-S01');
});

test('current article and structure pages expose rev.5 machine provenance',async({request})=>{
  const article=await request.get(`${BASE}/article/379`);
  const articleHtml=await article.text();
  await expectCurrentPageMetadata(article,articleHtml);
  expect(articleHtml).toContain('Current Curated rev.5');
  expect(articleHtml).toContain('17 Aug 2026');
  expect(articleHtml).toContain('10.1021/acsaom.6c00035');

  const structure=await request.get(`${BASE}/structure/CUH-378-S01`);
  const structureHtml=await structure.text();
  await expectCurrentPageMetadata(structure,structureHtml);
  expect(structureHtml).toContain('PyPzPh-CuI');
  expect(structureHtml).toContain('Cu4I4');
  expect(structureHtml).toContain('1D');
});

test('frozen-origin record keeps archived scientific provenance while site headers remain current',async({request})=>{
  const r=await request.get(`${BASE}/article/1`);
  expect(r.status()).toBe(200);
  expect(header(r,'x-cuhalide-site-version')).toBe('50');
  expect(header(r,'x-cuhalide-current-curated-revision')).toBe('5');
  const html=await r.text();
  expect(html).toContain('archived scientific snapshot 3.0.2');
  expect(html).toContain('"version":"3.0.2"');
  expect(html).toContain('"dateModified":"2026-08-11"');
});

test('missing record is a branded noindex 404 rather than a backend-outage false positive',async({request})=>{
  const r=await request.get(`${BASE}/article/999999`);
  expect(r.status()).toBe(404);
  expect(header(r,'x-robots-tag')).toContain('noindex');
  expect(header(r,'cache-control')).toContain('no-store');
  const html=await r.text();
  expect(html).toContain('CuHalide Atlas');
  expect(html).toContain('Record not found');
  expect(html).toContain('Browse literature');
});

test('health endpoint is normalized to the active v50/rev.5 runtime',async({request})=>{
  const r=await request.get(`${BASE}/health.json`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.ok).toBe(true);
  expect(x.site_version).toBe('50');
  expect(x.meta_version).toBe('50.1');
  expect(x.gateway_meta_version).toBe('50.1');
  expect(x.site_probe_mode).toBe('frontend v50 active; backend rev.5 deterministic contract');
  expect(JSON.stringify(x)).not.toContain('frontend v49');
});

test('Motif Atlas and HEAD metadata stay aligned with rev.5',async({request})=>{
  const r=await request.get(`${BASE}/motifs`);
  expect(r.status()).toBe(200);
  expect(header(r,'x-cuhalide-current-curated-revision')).toBe('5');
  const html=await r.text();
  expect(html).toContain('938');
  expect(html).toContain('581');
  expect(html).toContain('357');
  expect(html).toContain('aria-label="Filter motif taxonomy"');
  const head=await request.head(`${BASE}/motifs`);
  expect(head.status()).toBe(200);
  expect(header(head,'x-cuhalide-current-curated-revision')).toBe('5');
});

test('hidden compatibility endpoints cannot reintroduce stale revision metadata',async({request})=>{
  const assistant=await request.get(`${BASE}/api/ui-assistant`);
  expect(assistant.status()).toBe(200);
  expect(header(assistant,'x-cuhalide-ui-version')).toBe('50.0');
  expect(header(assistant,'x-cuhalide-current-curated-revision')).toBe('5');
  expect(header(assistant,'last-modified')).toContain('17 Aug 2026');

  const legacy=await request.get(`${BASE}/api/data?action=bootstrap`);
  expect(legacy.status()).toBe(200);
  expect(header(legacy,'x-cuhalide-public-data-version')).toBe('2.12.0');
  expect(header(legacy,'x-cuhalide-current-curated-revision')).toBe('5');
  expect(header(legacy,'warning')).toContain('Legacy /api/data');
});

test('public interfaces remain read-only and private bulk export remains disabled',async({request})=>{
  const write=await request.post(`${BASE}/api/public-data`,{data:{action:'bootstrap'}});
  expect(write.status()).toBe(405);
  const exp=await request.get(`${BASE}/api/export`);
  expect(exp.status()).toBe(410);
  const detail=await request.get(`${BASE}/structure/CUH-378-S01`);
  const html=(await detail.text()).toLowerCase();
  for(const forbidden of ['evidence_excerpt','evidence_locator','raw_payload','private_path','candidate_score','reason_code'])expect(html).not.toContain(forbidden);
});

test('mobile pages have no horizontal page overflow and navigation remains operable',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile-chromium','mobile-only layout check');
  await page.goto(BASE,{waitUntil:'networkidle'});
  let widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client+1);
  const menu=page.locator('#menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded','false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#nav')).toHaveClass(/open/);
  await page.locator('#nav a[href="#articles"]').click();
  await expect(menu).toHaveAttribute('aria-expanded','false');

  await page.goto(`${BASE}/motifs`,{waitUntil:'networkidle'});
  widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client+1);
});
