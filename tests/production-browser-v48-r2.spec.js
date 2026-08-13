import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SPA_ROUTES = ['home', 'articles', 'structures', 'polar', 'rag', 'watch', 'methods', 'citation'];
const PREMERGE = process.env.CUHALIDE_PREMERGE_PRODUCTION === 'true';

async function json(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Expected JSON from ${response.url()}, received: ${text.slice(0, 300)}`); }
}

async function getData(request, query) {
  const response = await request.get(`/api/public-data?${query}`);
  expect(response.status(), query).toBe(200);
  return json(response);
}

async function expectNoPageOverflow(page) {
  const widths = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(widths.scrollWidth, `Page-wide horizontal overflow: ${JSON.stringify(widths)}`).toBeLessThanOrEqual(widths.clientWidth + 1);
}

async function expectNoSeriousA11yViolations(page, label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(serious, `${label} serious/critical accessibility violations:\n${JSON.stringify(serious, null, 2)}`).toEqual([]);
}

function captureRuntimeErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  return { consoleErrors, pageErrors };
}

test.describe('CuHalide Atlas 3.0.2 + Current Curated rev.2 scientific contracts', () => {
  test('health, versions, temporal semantics and scientific denominators are exact', async ({ request }) => {
    const healthResponse = await request.get('/health.json');
    expect(healthResponse.status()).toBe(200);
    const health = await json(healthResponse);
    expect(health.ok).toBe(true);
    expect(health.status).toBe('PASS');
    if (!PREMERGE) expect(health.site_readiness).toBe('PASS');
    expect(health.release).toBe('3.0.2');
    expect(health.site_version).toBe('48');
    expect(health.meta_version).toBe('48.3');
    expect(health.public_data.version).toBe('2.9.0');
    expect(health.smart_rag.version).toBe('9.14.0');
    expect(health.smart_rag.unified_documents).toBe(1305);
    expect(health.motif_atlas.ok).toBe(true);
    expect(health.motif_atlas.version).toBe('1.1');
    expect(health.temporal_scope.frozen_release.literature_cutoff).toBe('2026-06');
    expect(health.temporal_scope.frozen_release.cutoff_inclusive_through).toBe('2026-06-30');
    expect(health.temporal_scope.frozen_release.immutable).toBe(true);
    expect(health.current_curated.current_curated_through).toBe('2026-08-13');
    expect(Number(health.current_curated.live_revision)).toBe(2);
    expect(health.current_curated.status).toBe('ready');
    expect(health.current_curated.batch.coverage_backfills).toBe(19);
    expect(health.current_curated.batch.post_cutoff_additions).toBe(5);
    const current = health.current_curated.counts;
    expect(current.article_audit_records).toBe(370);
    expect(current.chemically_included_articles).toBe(359);
    expect(current.canonical_verified_articles).toBe(356);
    expect(current.structure_phase_rows).toBe(935);
    expect(current.core_included_structure_rows).toBe(873);
    expect(current.resolved_space_group_rows).toBe(705);
    expect(current.verified_space_group_rows).toBe(680);
    expect(current.verified_polar_rows).toBe(97);
    expect(current.strict_polar_rows).toBe(77);
    expect(current.strict_polar_articles).toBe(46);
    expect(current.rag_documents).toBe(1305);
    expect(current.rag_embedded).toBe(1305);
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
    expect(health.current_errata_count).toBe(0);
    expect(health.historical_corrections_count).toBe(4);
  });

  test('root exposes rev.2 and Motif Atlas without weakening CSP or privacy policy', async ({ request }) => {
    const root = await request.get('/');
    expect(root.status()).toBe(200);
    const html = await root.text();
    expect(html).toContain('CUHALIDE_SITE_V48_MOTIF_ATLAS');
    expect(html).toContain('Frozen Release 3.0.2');
    expect(html).toContain('Current Curated rev.2');
    expect(html).toContain('2026-08-13');
    expect(html).toContain('Current canonical · n=356');
    expect(html).toContain('Current Core-Included · n=873');
    expect(html).toContain('Motif Atlas');
    expect(html).not.toContain('2026.06');
    const csp = root.headers()['content-security-policy'] || '';
    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(root.headers()['x-cuhalide-release']).toBe('3.0.2');
    expect(root.headers()['x-cuhalide-site-version']).toBe('48');
    expect(root.headers()['x-cuhalide-current-curated-revision']).toBe('2');
    const manifestResponse = await request.get('/release-manifest.json');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await json(manifestResponse);
    expect(manifest.release).toBe('3.0.2');
    expect(manifest.public_data_version).toBe('2.9.0');
    expect(manifest.smart_rag_version).toBe('9.14.0');
    expect(manifest.meta_version).toBe('48.3');
    expect(manifest.temporal_scope.current_curated.curated_through).toBe('2026-08-13');
    expect(manifest.temporal_scope.current_curated.live_revision).toBe(2);
    expect(manifest.current_curated_counts.canonical_verified_articles).toBe(356);
    expect(manifest.current_curated_counts.core_included_structure_rows).toBe(873);
    expect(manifest.public_access.bulk_normalized_export).toBe(false);
    expect(manifest.public_access.primary_pdf_si_cif).toBe(false);
    expect(manifest.public_access.motif_atlas).toBe(true);
    const exportResponse = await request.get('/api/export');
    expect(exportResponse.status()).toBe(410);
    const exported = await json(exportResponse);
    expect(exported.release).toBe('3.0.2');
    expect(exported.public_access).toBe('query-and-view');
  });

  test('Current Curated default and Frozen scope denominators are independently exact', async ({ request }) => {
    const expected = PREMERGE
      ? { articles: 362, canonical: 348, additions: 16, structures: 921, core: 859 }
      : { articles: 370, canonical: 356, additions: 24, structures: 935, core: 873 };
    expect((await getData(request, 'action=articles&page=1&page_size=1')).pagination.total).toBe(expected.articles);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20canonical')).pagination.total).toBe(expected.canonical);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Core%20-%20Verified')).pagination.total).toBe(332);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20Curated%20-%20Verified')).pagination.total).toBe(expected.additions);
    expect((await getData(request, 'action=articles&scope=frozen&page=1&page_size=1')).pagination.total).toBe(346);
    expect((await getData(request, 'action=structures&page=1&page_size=1')).pagination.total).toBe(expected.structures);
    expect((await getData(request, 'action=structures&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(expected.core);
    expect((await getData(request, 'action=structures&scope=frozen&page=1&page_size=1')).pagination.total).toBe(878);
    expect((await getData(request, 'action=structures&scope=frozen&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(816);
    expect((await getData(request, 'action=polar&page=1&page_size=1')).pagination.total).toBe(77);
    expect((await getData(request, 'action=polar&scope=frozen&page=1&page_size=1')).pagination.total).toBe(67);
    expect((await getData(request, 'action=structures&page=1&page_size=1&q=STE')).pagination.total).toBe(0);
    expect((await getData(request, 'action=structures&page=1&page_size=1&q=luminescence')).pagination.total).toBe(0);
  });

  test('Record 13 remains frozen-correct', async ({ request }) => {
    const expectedRecord13 = { 'CUH-013-S01': 'Unresolved', 'CUH-013-S02': '0D', 'CUH-013-S03': '0D', 'CUH-013-S04': '0D' };
    for (const [id, dimension] of Object.entries(expectedRecord13)) {
      const row = (await getData(request, `action=structure&id=${id}`)).item;
      expect(row.dimensionality).toBe(dimension);
      expect(row.known_erratum).toBe(false);
      expect(row.erratum_note).toBe('');
    }
  });

  test('rev.2 Record 370 is structure-grain normalized', async ({ request }) => {
    const article = (await getData(request, 'action=article&id=370')).item;
    expect(article.record_id).toBe(370);
    expect(article.curation_layer).toBe('Current Curated');
    expect(Number(article.live_revision)).toBe(2);
    expect(article.release_status).toBe('Current Curated - Verified');
    expect(article.doi).toBe('10.1002/adma.73604');
    const structure = (await getData(request, 'action=structure&id=CUH-370-S01')).item;
    expect(structure.curation_layer).toBe('Current Curated');
    expect(Number(structure.live_revision)).toBe(2);
    expect(structure.motif).toMatch(/Cu4I4/);
    expect(structure.motif_details.formula).toBe('Cu4I4');
    expect(structure.motif_details.geometry).toMatch(/cubane/i);
    expect(structure.organic_components.some((c) => /3-methylmorpholine/i.test(c.name || ''))).toBe(true);
    expect(structure.emission_nm).toBe('');
    expect(String(structure.emission_assignment)).toMatch(/article grain|article-grain/i);
  });

  test('Motif Atlas keeps class, motif and organic-component counting boundaries explicit', async ({ request }) => {
    const all = await getData(request, 'action=motifs&limit=100');
    expect(all.version).toBe('2.9.0');
    expect(Number(all.current_curated_revision)).toBe(2);
    expect(all.atlas.coverage.total_taxonomy_rows).toBe(935);
    expect(all.atlas.coverage.motif_resolved_rows).toBe(817);
    expect(all.atlas.coverage.motif_unresolved_rows).toBe(118);
    expect(all.atlas.coverage.primary_classified_rows).toBe(895);
    expect(all.atlas.coverage.unresolved_category_rows).toBe(40);
    expect(all.atlas.coverage.curated_component_structures).toBe(14);
    const byCategory = Object.fromEntries(all.atlas.categories.map((x) => [x.primary_category, x]));
    expect(byCategory.Coordination.article_count).toBe(113);
    expect(byCategory.Coordination.structure_determinations).toBe(346);
    expect(byCategory.Coordination.motif_count).toBe(26);
    expect(byCategory['Hybrid Ionic'].article_count).toBe(217);
    expect(byCategory['Hybrid Ionic'].structure_determinations).toBe(447);
    expect(byCategory['Hybrid Ionic'].motif_count).toBe(66);
    expect(byCategory['All-in-One (AIO)'].article_count).toBe(26);
    expect(byCategory['All-in-One (AIO)'].structure_determinations).toBe(102);
    expect(byCategory['All-in-One (AIO)'].motif_count).toBe(22);
    const cu4i4 = await getData(request, 'action=motifs&category=Coordination&motif=Cu4I4&limit=100');
    expect(cu4i4.atlas.motifs[0].motif_formula).toBe('Cu4I4');
    expect(cu4i4.atlas.motifs[0].article_count).toBe(45);
    expect(cu4i4.atlas.motifs[0].structure_determinations).toBe(74);
    expect(cu4i4.atlas.motifs[0].identity_count).toBe(59);
    expect(cu4i4.atlas.curated_components.some((c) => /3-methylmorpholine/i.test(c.display_name || ''))).toBe(true);
    expect(cu4i4.atlas.curated_components.some((c) => /diphenylphosphino/i.test(c.display_name || ''))).toBe(true);
    expect(String(cu4i4.atlas.counting_note)).toMatch(/distinct denominators/i);
    expect(String(cu4i4.atlas.component_note)).toMatch(/separated/i);
  });

  test('Smart RAG 9.14 exposes rev.2, deterministic Motif Atlas and evidence-grain boundaries', async ({ request }) => {
    const ragResponse = await request.get('/api/agent');
    expect(ragResponse.status()).toBe(200);
    const rag = await json(ragResponse);
    expect(rag.ok).toBe(true);
    expect(rag.version).toBe('9.14.0');
    expect(rag.corpus.unified_documents).toBe(1305);
    expect(rag.corpus.unified_embedded).toBe(1305);
    expect(rag.current_curated.live_revision).toBe(2);
    expect(rag.current_curated.curated_through).toBe('2026-08-13');
    expect(rag.capabilities.deterministic_motif_atlas).toBe(true);
    expect(rag.capabilities.structure_grain_motif).toBe(true);
    const temporal = await json(await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'What is the literature cutoff, how current is Current Curated, and what does Literature Watch mean?' }] } }));
    expect(temporal.answer).toContain('2026-06-30');
    expect(temporal.answer).toContain('2026-08-13');
    expect(temporal.answer).toMatch(/Literature Watch/i);
    const motif = await json(await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'For Coordination Cu4I4 motifs, how many reports and determinations are there and which primary-evidence curated ligands are known?' }] } }));
    expect(motif.mode).toBe('deterministic-motif-atlas');
    expect(motif.answer).toContain('Cu4I4');
    expect(motif.answer).toContain('45 article reports');
    expect(motif.answer).toContain('74 crystallographic determinations');
    expect(motif.answer).toMatch(/Primary-evidence curated organic components/i);
    const structure = await json(await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'What is the motif and emission of CUH-370-S01?' }] } }));
    expect(structure.answer).toContain('Cu4I4');
    expect(structure.answer).toMatch(/article-grain|Article-grain|evidence boundary/i);
    expect(structure.sources.some((s) => s.type === 'structure' && s.id === 'CUH-370-S01')).toBe(true);
  });

  test('stable pages, Motif Atlas and sitemap expose only whitelisted crawlable records', async ({ request }) => {
    const motifPage = await request.get('/motifs?category=Coordination&motif=Cu4I4');
    expect(motifPage.status()).toBe(200);
    const motifHtml = await motifPage.text();
    expect(motifHtml).toContain('Motif Atlas');
    expect(motifHtml).toContain('Current Curated rev.2');
    expect(motifHtml).toContain('Cu4I4');
    expect(motifHtml).toContain('Primary-evidence curated');
    expect(motifHtml).toContain('Legacy label-derived candidate');
    expect(motifHtml).not.toContain('field_evidence');
    expect(motifPage.headers()['x-cuhalide-motif-atlas-version']).toBe('1.1');
    const article = await request.get('/article/370');
    expect(article.status()).toBe(200);
    const articleHtml = await article.text();
    expect(articleHtml).toContain('Current Curated rev.2');
    expect(articleHtml).toContain('Article record 370');
    expect(articleHtml).not.toContain('field_evidence');
    const structure = await request.get('/structure/CUH-370-S01');
    expect(structure.status()).toBe(200);
    const structureHtml = await structure.text();
    expect(structureHtml).toContain('Current Curated rev.2');
    expect(structureHtml).toContain('Cu4I4');
    expect(structureHtml).toMatch(/3-methylmorpholine/i);
    expect(structureHtml).toContain('Open Motif Atlas');
    expect(structureHtml).not.toContain('field_evidence');
    const frozenArticle = await request.get('/article/13');
    expect(frozenArticle.status()).toBe(200);
    expect(await frozenArticle.text()).toContain('Frozen Release 3.0.2');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const sitemapText = await sitemap.text();
    expect((sitemapText.match(/<url>/g) || []).length).toBe(1231);
    expect(sitemapText).toContain('/motifs');
    expect(sitemapText).toContain('/article/370');
    expect(sitemapText).toContain('/structure/CUH-370-S01');
    expect(sitemap.headers()['x-cuhalide-sitemap-urls']).toBe('1231');
  });
});

test.describe('CuHalide Atlas v48.3 presentation, accessibility and responsive QA', () => {
  test('all SPA routes and Motif Atlas render without serious accessibility errors or overflow', async ({ page }, testInfo) => {
    const runtime = captureRuntimeErrors(page);
    for (const route of SPA_ROUTES) {
      await page.goto(`/#${route}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`[data-view="${route}"]`)).toHaveClass(/active/);
      await expect(page.locator('main#main')).toBeVisible();
      await expectNoPageOverflow(page);
      await expectNoSeriousA11yViolations(page, route);
      await testInfo.attach(`${route}.png`, { body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png' });
    }
    await page.goto('/motifs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Motif Atlas', level: 1 })).toBeVisible();
    await expectNoPageOverflow(page);
    await expectNoSeriousA11yViolations(page, 'motifs');
    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors.filter((x) => !/favicon/i.test(x))).toEqual([]);
  });

  test('mobile navigation, filters and Motif Atlas remain usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#home', { waitUntil: 'domcontentloaded' });
    await expectNoPageOverflow(page);
    const menu = page.locator('#menu');
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.locator('#nav')).toHaveClass(/open/);
    await expect(page.getByRole('link', { name: 'Motif Atlas' })).toBeVisible();
    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.view[data-view="articles"]')).toHaveClass(/active/);
    await expectNoPageOverflow(page);
    await page.goto('/motifs?category=Coordination&motif=Cu4I4', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Motif Atlas', level: 1 })).toBeVisible();
    await expect(page.getByText('Cu4I4', { exact: true }).first()).toBeVisible();
    await expectNoPageOverflow(page);
  });
});
