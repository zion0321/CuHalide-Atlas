import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['home', 'articles', 'structures', 'polar', 'rag', 'watch', 'methods', 'citation'];
const PREMERGE = process.env.CUHALIDE_PREMERGE_PRODUCTION === 'true';

async function json(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Expected JSON from ${response.url()}, received: ${text.slice(0, 300)}`); }
}
function captureRuntimeErrors(page) {
  const consoleErrors = [], pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  return { consoleErrors, pageErrors };
}
async function expectNoPageOverflow(page) {
  const x = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(x.scrollWidth, `Page-wide horizontal overflow: ${JSON.stringify(x)}`).toBeLessThanOrEqual(x.clientWidth + 1);
}
async function expectNoSeriousA11yViolations(page, route) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(serious, `${route} serious/critical accessibility violations:\n${JSON.stringify(serious, null, 2)}`).toEqual([]);
}
async function getData(request, query) {
  const r = await request.get(`/api/public-data?${query}`);
  expect(r.status(), query).toBe(200);
  return json(r);
}

test.describe('CuHalide Atlas 3.0.2 + Current Curated rev.1 production contracts', () => {
  test('health, temporal semantics, privacy and version identities are exact', async ({ request }) => {
    const healthResponse = await request.get('/health.json');
    expect(healthResponse.status()).toBe(200);
    const health = await json(healthResponse);
    expect(health.ok).toBe(true);
    expect(health.status).toBe('PASS');
    if (!PREMERGE) expect(health.site_readiness).toBe('PASS');
    expect(health.release).toBe('3.0.2');
    expect(health.site_version).toBe('48');
    expect(health.meta_version).toBe('48.1');
    expect(health.public_data.version).toBe('2.8.0');
    expect(health.smart_rag.version).toBe('9.13.0');
    expect(health.smart_rag.unified_documents).toBe(1283);
    expect(health.temporal_scope.frozen_release.literature_cutoff).toBe('2026-06');
    expect(health.temporal_scope.frozen_release.cutoff_inclusive_through).toBe('2026-06-30');
    expect(health.temporal_scope.frozen_release.immutable).toBe(true);
    expect(health.current_curated.current_curated_through).toBe('2026-08-12');
    expect(Number(health.current_curated.live_revision)).toBe(1);
    expect(health.current_curated.status).toBe('ready');
    expect(health.current_errata_count).toBe(0);
    expect(health.historical_corrections_count).toBe(4);

    const currentCounts = health.current_curated.counts;
    expect(currentCounts.article_audit_records).toBe(362);
    expect(currentCounts.chemically_included_articles).toBe(351);
    expect(currentCounts.canonical_verified_articles).toBe(348);
    expect(currentCounts.structure_phase_rows).toBe(921);
    expect(currentCounts.core_included_structure_rows).toBe(859);
    expect(currentCounts.resolved_space_group_rows).toBe(693);
    expect(currentCounts.verified_space_group_rows).toBe(668);
    expect(currentCounts.verified_polar_rows).toBe(97);
    expect(currentCounts.strict_polar_rows).toBe(77);
    expect(currentCounts.strict_polar_articles).toBe(46);
    expect(currentCounts.rag_documents).toBe(1283);
    expect(currentCounts.rag_embedded).toBe(1283);

    const frozen = health.frozen_release.counts;
    expect(frozen.article_audit_records).toBe(346);
    expect(frozen.chemically_included_articles).toBe(335);
    expect(frozen.canonical_verified_articles).toBe(332);
    expect(frozen.structure_phase_rows).toBe(878);
    expect(frozen.core_included_structure_rows).toBe(816);
    expect(frozen.resolved_space_group_rows).toBe(650);
    expect(frozen.verified_space_group_rows).toBe(625);
    expect(frozen.verified_polar_rows).toBe(87);
    expect(frozen.strict_polar_rows).toBe(67);
    expect(frozen.strict_polar_articles).toBe(42);

    const root = await request.get('/');
    expect(root.status()).toBe(200);
    const html = await root.text();
    expect(html).toContain('CUHALIDE_SITE_V48_CURRENT_CURATED');
    expect(html).toContain('Frozen Release 3.0.2');
    expect(html).toContain('2026-06-30');
    expect(html).toContain('Current Curated rev.1');
    expect(html).toContain('2026-08-12');
    expect(html).toContain('Current canonical · n=348');
    expect(html).toContain('Current Core-Included · n=859');
    expect(html).toContain('"dateModified":"2026-08-12"');
    expect(html).not.toContain('2026.06');
    expect(html).toContain('/og-image.svg');
    const csp = root.headers()['content-security-policy'] || '';
    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(root.headers()['x-cuhalide-release']).toBe('3.0.2');
    expect(root.headers()['x-cuhalide-site-version']).toBe('48');
    expect(root.headers()['x-cuhalide-current-curated-revision']).toBe('1');

    const manifestResponse = await request.get('/release-manifest.json');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await json(manifestResponse);
    expect(manifest.release).toBe('3.0.2');
    expect(manifest.release_date).toBe('2026-08-11');
    expect(manifest.public_data_version).toBe('2.8.0');
    expect(manifest.smart_rag_version).toBe('9.13.0');
    expect(manifest.meta_version).toBe('48.1');
    expect(manifest.temporal_scope.frozen_release.cutoff_inclusive_through).toBe('2026-06-30');
    expect(manifest.temporal_scope.current_curated.curated_through).toBe('2026-08-12');
    expect(manifest.temporal_scope.current_curated.live_revision).toBe(1);
    expect(manifest.frozen_counts.canonical_verified_articles).toBe(332);
    expect(manifest.current_curated_counts.canonical_verified_articles).toBe(348);
    expect(manifest.current_curated_counts.core_included_structure_rows).toBe(859);

    const exportResponse = await request.get('/api/export');
    expect(exportResponse.status()).toBe(410);
    const exported = await json(exportResponse);
    expect(exported.release).toBe('3.0.2');
    expect(exported.public_access).toBe('query-and-view');
    expect((await request.get('/manifest.json')).status()).toBe(404);
    expect((await request.get('/manifest.webmanifest')).status()).toBe(404);
  });

  test('Current Curated default and Frozen scope denominators are independently exact', async ({ request }) => {
    const current = await getData(request, 'action=current-curated');
    expect(current.current_curated.base_release).toBe('3.0.2');
    expect(current.current_curated.current_curated_through).toBe('2026-08-12');
    expect(Number(current.current_curated.live_revision)).toBe(1);
    expect(current.current_curated.status).toBe('ready');

    expect((await getData(request, 'action=articles&page=1&page_size=1')).pagination.total).toBe(362);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20canonical')).pagination.total).toBe(348);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Core%20-%20Verified')).pagination.total).toBe(332);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20Curated%20-%20Verified')).pagination.total).toBe(16);
    expect((await getData(request, 'action=articles&scope=frozen&page=1&page_size=1')).pagination.total).toBe(346);
    expect((await getData(request, 'action=articles&scope=frozen&page=1&page_size=1&release_status=Core%20-%20Verified')).pagination.total).toBe(332);

    expect((await getData(request, 'action=structures&page=1&page_size=1')).pagination.total).toBe(921);
    expect((await getData(request, 'action=structures&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(859);
    expect((await getData(request, 'action=structures&scope=frozen&page=1&page_size=1')).pagination.total).toBe(878);
    expect((await getData(request, 'action=structures&scope=frozen&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(816);
    expect((await getData(request, 'action=polar&page=1&page_size=1')).pagination.total).toBe(77);
    expect((await getData(request, 'action=polar&scope=frozen&page=1&page_size=1')).pagination.total).toBe(67);

    expect((await getData(request, 'action=structures&page=1&page_size=1&q=STE')).pagination.total).toBe(0);
    expect((await getData(request, 'action=structures&page=1&page_size=1&q=luminescence')).pagination.total).toBe(0);
  });

  test('Record 13 remains frozen-correct and Current record 353 is independently represented', async ({ request }) => {
    const expectedRecord13 = {
      'CUH-013-S01': 'Unresolved',
      'CUH-013-S02': '0D',
      'CUH-013-S03': '0D',
      'CUH-013-S04': '0D',
    };
    for (const [id, dimension] of Object.entries(expectedRecord13)) {
      const row = (await getData(request, `action=structure&id=${id}`)).item;
      expect(row.dimensionality).toBe(dimension);
      expect(row.known_erratum).toBe(false);
      expect(row.erratum_note).toBe('');
    }

    const article = (await getData(request, 'action=article&id=353')).item;
    expect(article.record_id).toBe(353);
    expect(article.curation_layer).toBe('Current Curated');
    expect(Number(article.live_revision)).toBe(1);
    expect(article.release_status).toBe('Current Curated - Verified');

    const structures = await getData(request, 'action=article-structures&id=353');
    expect(structures.items.length).toBeGreaterThan(0);
    for (const row of structures.items) {
      expect(row.curation_layer).toBe('Current Curated');
      expect(Number(row.live_revision)).toBe(1);
    }
    const s = (await getData(request, 'action=structure&id=CUH-353-S01')).item;
    expect(s.curation_layer).toBe('Current Curated');
    expect(Number(s.live_revision)).toBe(1);
    expect(s.emission_nm).toBe('');
    expect(String(s.emission_assignment)).toMatch(/article grain|article-grain/i);
  });

  test('Smart RAG 9.13 exposes unified current corpus and deterministic temporal/evidence-grain boundaries', async ({ request }) => {
    const ragResponse = await request.get('/api/agent');
    expect(ragResponse.status()).toBe(200);
    const rag = await json(ragResponse);
    expect(rag.ok).toBe(true);
    expect(rag.release).toBe('3.0.2');
    expect(rag.version).toBe('9.13.0');
    expect(rag.corpus.unified_documents).toBe(1283);
    expect(rag.corpus.unified_embedded).toBe(1283);
    expect(rag.capabilities.current_curated_retrieval).toBe(true);
    expect(rag.capabilities.temporal_scope_guard).toBe(true);

    const temporalResponse = await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'What is the literature cutoff, how current is Current Curated, and what does Literature Watch mean?' }] } });
    expect(temporalResponse.status()).toBe(200);
    const temporal = await json(temporalResponse);
    expect(temporal.answer).toContain('2026-06-30');
    expect(temporal.answer).toContain('2026-08-12');
    expect(temporal.answer).toMatch(/Literature Watch/i);

    const structureResponse = await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'What is the emission of CUH-353-S01?' }] } });
    expect(structureResponse.status()).toBe(200);
    const structure = await json(structureResponse);
    expect(structure.answer).toMatch(/article-grain|Article-grain|evidence boundary/i);
    expect(structure.sources.some((s) => s.type === 'structure' && s.id === 'CUH-353-S01')).toBe(true);
  });

  test('stable current/frozen pages and sitemap expose only whitelisted crawlable records', async ({ request }) => {
    const frozenArticle = await request.get('/article/13');
    expect(frozenArticle.status()).toBe(200);
    const frozenArticleHtml = await frozenArticle.text();
    expect(frozenArticleHtml).toContain('Frozen Release 3.0.2');
    expect(frozenArticleHtml).not.toContain('field_evidence');
    expect(frozenArticleHtml).not.toContain('candidate_score');

    const currentArticle = await request.get('/article/353');
    expect(currentArticle.status()).toBe(200);
    const currentArticleHtml = await currentArticle.text();
    expect(currentArticleHtml).toContain('Current Curated rev.1');
    expect(currentArticleHtml).toContain('Article record 353');
    expect(currentArticleHtml).toContain('application/ld+json');

    const currentStructure = await request.get('/structure/CUH-353-S01');
    expect(currentStructure.status()).toBe(200);
    const currentStructureHtml = await currentStructure.text();
    expect(currentStructureHtml).toContain('Current Curated rev.1');
    expect(currentStructureHtml).toContain('CUH-353-S01');
    expect(currentStructureHtml).toContain('application/ld+json');
    expect(currentStructureHtml).not.toContain('field_evidence');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const sitemapText = await sitemap.text();
    expect((sitemapText.match(/<url>/g) || []).length).toBe(1208);
    expect(sitemapText).toContain('/article/13');
    expect(sitemapText).toContain('/article/353');
    expect(sitemapText).toContain('/structure/CUH-353-S01');
    expect(sitemap.headers()['x-cuhalide-sitemap-urls']).toBe('1208');
  });
});

test.describe('CuHalide Atlas v48 current UI, responsive and accessibility QA', () => {
  test('all routes render without serious accessibility errors, page errors or overflow', async ({ page }, testInfo) => {
    const runtime = captureRuntimeErrors(page);
    for (const route of ROUTES) {
      await page.goto(`/#${route}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`[data-view="${route}"]`)).toHaveClass(/active/);
      await expect(page.locator('main#main')).toBeVisible();
      await expectNoPageOverflow(page);
      await expectNoSeriousA11yViolations(page, route);
      await testInfo.attach(`${testInfo.project.name}-${route}`, { body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png' });
    }
    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  });

  test('Current Curated defaults, temporal labels, filters and responsive navigation are correct', async ({ page }) => {
    await page.goto('/#home', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.release .ver')).toHaveText('Frozen Release 3.0.2');
    await expect(page.locator('.release-note')).toContainText('2026-06-30');
    await expect(page.locator('.release-note')).toContainText('Current Curated rev.1');
    await expect(page.locator('#currentCuratedText')).toContainText('Current Curated through 2026-08-12');
    await expect(page.locator('#currentCuratedText')).toContainText('live revision 1');
    await expect(page.locator('#yearChart')).toContainText('2026');
    await expect(page.locator('#yearChart')).not.toContainText('2026.06');

    const viewportWidth = page.viewportSize()?.width || 1440;
    if (viewportWidth <= 1120) {
      await expect(page.locator('#menu')).toBeVisible();
      await page.locator('#menu').click();
      await expect(page.locator('#nav')).toHaveClass(/open/);
      expect(await page.locator('#menu').getAttribute('aria-expanded')).toBe('true');
    }

    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#arel')).toHaveValue('Current canonical');
    await expect(page.locator('#acount')).toContainText('348 records');
    await expect(page.locator('#articleHalogenNote')).toContainText('mixed records containing that halogen');

    await page.goto('/#structures', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#selig')).toHaveValue('Core - Included');
    await expect(page.locator('#scount')).toContainText('859 rows');

    await page.goto('/#polar', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#pcount')).toContainText('77 rows');
    await expect(page.locator('.polar-num')).toContainText('46 articles');
  });
});
