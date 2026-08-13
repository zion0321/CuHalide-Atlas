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

async function noOverflow(page) {
  const x = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(x.scrollWidth, `Page-wide horizontal overflow: ${JSON.stringify(x)}`).toBeLessThanOrEqual(x.clientWidth + 1);
}

async function noSeriousA11y(page, label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(serious, `${label} accessibility violations:\n${JSON.stringify(serious, null, 2)}`).toEqual([]);
}

test.describe('CuHalide Atlas 3.0.2 + Current Curated rev.2 scientific contracts', () => {
  test('health, versions and exact rev.2 state are coherent', async ({ request }) => {
    const response = await request.get('/health.json');
    expect(response.status()).toBe(200);
    const h = await json(response);
    expect(h.ok).toBe(true);
    expect(h.status).toBe('PASS');
    if (!PREMERGE) expect(h.site_readiness).toBe('PASS');
    expect(h.release).toBe('3.0.2');
    expect(h.site_version).toBe('48');
    expect(h.meta_version).toBe('48.3');
    expect(h.public_data.version).toBe('2.9.0');
    expect(h.smart_rag.version).toBe('9.14.0');
    expect(h.smart_rag.unified_documents).toBe(1305);
    expect(h.motif_atlas).toMatchObject({ ok: true, version: '1.1' });
    expect(h.temporal_scope.frozen_release).toMatchObject({ literature_cutoff: '2026-06', cutoff_inclusive_through: '2026-06-30', immutable: true });
    expect(h.current_curated.current_curated_through).toBe('2026-08-13');
    expect(Number(h.current_curated.live_revision)).toBe(2);
    expect(h.current_curated.status).toBe('ready');
    expect(h.current_curated.batch).toMatchObject({ coverage_backfills: 19, post_cutoff_additions: 5, current_overlay_articles: 24, current_overlay_structures: 57 });
    expect(h.current_curated.counts).toMatchObject({ article_audit_records: 370, chemically_included_articles: 359, canonical_verified_articles: 356, structure_phase_rows: 935, core_included_structure_rows: 873, resolved_space_group_rows: 705, verified_space_group_rows: 680, verified_polar_rows: 97, strict_polar_rows: 77, strict_polar_articles: 46, rag_documents: 1305, rag_embedded: 1305 });
    expect(h.frozen_release.counts).toMatchObject({ article_audit_records: 346, chemically_included_articles: 335, canonical_verified_articles: 332, structure_phase_rows: 878, core_included_structure_rows: 816, resolved_space_group_rows: 650, verified_space_group_rows: 625, verified_polar_rows: 87, strict_polar_rows: 67, strict_polar_articles: 42 });
    expect(h.current_errata_count).toBe(0);
    expect(h.historical_corrections_count).toBe(4);
  });

  test('Current Curated default and Frozen scope denominators are independently exact', async ({ request }) => {
    // The rolling backend is already rev.2 before the presentation PR is merged.
    // Therefore production-baseline QA locks Frozen values and verifies Current against rev.2,
    // rather than pretending the rolling layer is an immutable rev.1 snapshot.
    expect((await getData(request, 'action=articles&page=1&page_size=1')).pagination.total).toBe(370);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20canonical')).pagination.total).toBe(356);
    expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20Curated%20-%20Verified')).pagination.total).toBe(24);
    expect((await getData(request, 'action=structures&page=1&page_size=1')).pagination.total).toBe(935);
    expect((await getData(request, 'action=structures&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(873);
    expect((await getData(request, 'action=polar&page=1&page_size=1')).pagination.total).toBe(77);

    expect((await getData(request, 'action=articles&scope=frozen&page=1&page_size=1')).pagination.total).toBe(346);
    expect((await getData(request, 'action=articles&scope=frozen&page=1&page_size=1&release_status=Core%20-%20Verified')).pagination.total).toBe(332);
    expect((await getData(request, 'action=structures&scope=frozen&page=1&page_size=1')).pagination.total).toBe(878);
    expect((await getData(request, 'action=structures&scope=frozen&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(816);
    expect((await getData(request, 'action=polar&scope=frozen&page=1&page_size=1')).pagination.total).toBe(67);

    expect((await getData(request, 'action=structures&page=1&page_size=1&q=STE')).pagination.total).toBe(0);
    expect((await getData(request, 'action=structures&page=1&page_size=1&q=luminescence')).pagination.total).toBe(0);
  });

  test('Record 13 remains frozen-correct', async ({ request }) => {
    const expected = { 'CUH-013-S01': 'Unresolved', 'CUH-013-S02': '0D', 'CUH-013-S03': '0D', 'CUH-013-S04': '0D' };
    for (const [id, dimensionality] of Object.entries(expected)) {
      const row = (await getData(request, `action=structure&id=${id}`)).item;
      expect(row.dimensionality).toBe(dimensionality);
      expect(row.known_erratum).toBe(false);
      expect(row.erratum_note).toBe('');
    }
  });

  test('root publishes rev.2 and Motif Atlas with strict privacy/CSP', async ({ request }) => {
    const root = await request.get('/');
    expect(root.status()).toBe(200);
    const html = await root.text();
    for (const token of ['CUHALIDE_SITE_V48_MOTIF_ATLAS', 'Frozen Release 3.0.2', 'Current Curated rev.2', '2026-08-13', 'Current canonical · n=356', 'Current Core-Included · n=873', 'Motif Atlas']) expect(html).toContain(token);
    expect(html).not.toContain('2026.06');
    const csp = root.headers()['content-security-policy'] || '';
    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(root.headers()['x-cuhalide-current-curated-revision']).toBe('2');

    const manifest = await json(await request.get('/release-manifest.json'));
    expect(manifest).toMatchObject({ release: '3.0.2', public_data_version: '2.9.0', smart_rag_version: '9.14.0', meta_version: '48.3' });
    expect(manifest.temporal_scope.current_curated).toMatchObject({ curated_through: '2026-08-13', live_revision: 2 });
    expect(manifest.current_curated_counts).toMatchObject({ canonical_verified_articles: 356, core_included_structure_rows: 873 });
    expect(manifest.public_access.bulk_normalized_export).toBe(false);
    expect(manifest.public_access.primary_pdf_si_cif).toBe(false);
    expect(manifest.public_access.motif_atlas).toBe(true);
    const exported = await request.get('/api/export');
    expect(exported.status()).toBe(410);
    expect((await json(exported)).public_access).toBe('query-and-view');
  });

  test('rev.2 Record 370 has independent structure-grain motif/component data', async ({ request }) => {
    const article = (await getData(request, 'action=article&id=370')).item;
    expect(article).toMatchObject({ record_id: 370, curation_layer: 'Current Curated', live_revision: 2, release_status: 'Current Curated - Verified', doi: '10.1002/adma.73604' });
    const s = (await getData(request, 'action=structure&id=CUH-370-S01')).item;
    expect(s).toMatchObject({ curation_layer: 'Current Curated', live_revision: 2, dimensionality: '0D', space_group: 'P42212', polar: 'No' });
    expect(s.motif).toMatch(/Cu4I4/);
    expect(s.motif_details).toMatchObject({ formula: 'Cu4I4', confidence: 'High' });
    expect(s.motif_details.geometry).toMatch(/cubane/i);
    expect(s.organic_components.some((c) => /3-methylmorpholine/i.test(c.name || ''))).toBe(true);
    expect(s.emission_nm).toBe('');
    expect(String(s.emission_assignment)).toMatch(/article grain|article-grain/i);
  });

  test('Motif Atlas class/motif/component counting boundaries are exact', async ({ request }) => {
    const all = await getData(request, 'action=motifs&limit=100');
    expect(all.version).toBe('2.9.0');
    expect(Number(all.current_curated_revision)).toBe(2);
    expect(all.atlas.coverage).toMatchObject({ total_taxonomy_rows: 935, motif_resolved_rows: 817, motif_unresolved_rows: 118, primary_classified_rows: 895, unresolved_category_rows: 40, curated_component_structures: 14 });
    const c = Object.fromEntries(all.atlas.categories.map((x) => [x.primary_category, x]));
    expect(c.Coordination).toMatchObject({ article_count: 113, structure_determinations: 346, motif_count: 26 });
    expect(c['Hybrid Ionic']).toMatchObject({ article_count: 217, structure_determinations: 447, motif_count: 66 });
    expect(c['All-in-One (AIO)']).toMatchObject({ article_count: 26, structure_determinations: 102, motif_count: 22 });

    const cu4i4 = await getData(request, 'action=motifs&category=Coordination&motif=Cu4I4&limit=100');
    expect(cu4i4.atlas.motifs[0]).toMatchObject({ motif_formula: 'Cu4I4', article_count: 45, structure_determinations: 74, identity_count: 59 });
    expect(cu4i4.atlas.curated_components.some((x) => /3-methylmorpholine/i.test(x.display_name || ''))).toBe(true);
    expect(cu4i4.atlas.curated_components.some((x) => /diphenylphosphino/i.test(x.display_name || ''))).toBe(true);
    expect(String(cu4i4.atlas.counting_note)).toMatch(/distinct denominators/i);
    expect(String(cu4i4.atlas.component_note)).toMatch(/separated/i);
  });

  test('Smart RAG 9.14 enforces Motif Atlas and evidence-grain boundaries', async ({ request }) => {
    const rag = await json(await request.get('/api/agent'));
    expect(rag).toMatchObject({ ok: true, release: '3.0.2', version: '9.14.0' });
    expect(rag.corpus).toMatchObject({ unified_documents: 1305, unified_embedded: 1305 });
    expect(rag.current_curated).toMatchObject({ live_revision: 2, curated_through: '2026-08-13' });
    expect(rag.capabilities.deterministic_motif_atlas).toBe(true);
    expect(rag.capabilities.structure_grain_motif).toBe(true);

    const motif = await json(await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'For Coordination Cu4I4 motifs, how many reports and determinations are there and which primary-evidence curated ligands are known?' }] } }));
    expect(motif.mode).toBe('deterministic-motif-atlas');
    expect(motif.answer).toContain('45 article reports');
    expect(motif.answer).toContain('74 crystallographic determinations');
    expect(motif.answer).toMatch(/Primary-evidence curated organic components/i);

    const structure = await json(await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'What is the motif and emission of CUH-370-S01?' }] } }));
    expect(structure.answer).toContain('Cu4I4');
    expect(structure.answer).toMatch(/article-grain|Article-grain|evidence boundary/i);
    expect(structure.sources.some((x) => x.type === 'structure' && x.id === 'CUH-370-S01')).toBe(true);
  });

  test('stable Motif/Record pages and sitemap are whitelisted and crawlable', async ({ request }) => {
    const motifs = await request.get('/motifs?category=Coordination&motif=Cu4I4');
    expect(motifs.status()).toBe(200);
    const motifHtml = await motifs.text();
    for (const token of ['Motif Atlas', 'Current Curated rev.2', 'Cu4I4', 'Primary-evidence curated', 'Legacy label-derived candidate']) expect(motifHtml).toContain(token);
    expect(motifHtml).not.toContain('field_evidence');
    expect(motifs.headers()['x-cuhalide-motif-atlas-version']).toBe('1.1');

    const article = await request.get('/article/370');
    expect(article.status()).toBe(200);
    const articleHtml = await article.text();
    expect(articleHtml).toContain('Current Curated rev.2');
    expect(articleHtml).not.toContain('field_evidence');

    const structure = await request.get('/structure/CUH-370-S01');
    expect(structure.status()).toBe(200);
    const structureHtml = await structure.text();
    expect(structureHtml).toContain('Cu4I4');
    expect(structureHtml).toMatch(/3-methylmorpholine/i);
    expect(structureHtml).toContain('Open Motif Atlas');
    expect(structureHtml).not.toContain('field_evidence');

    const frozen = await request.get('/article/13');
    expect(frozen.status()).toBe(200);
    expect(await frozen.text()).toContain('Frozen Release 3.0.2');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect((xml.match(/<url>/g) || []).length).toBe(1231);
    expect(xml).toContain('/motifs');
    expect(xml).toContain('/article/370');
    expect(xml).toContain('/structure/CUH-370-S01');
    expect(sitemap.headers()['x-cuhalide-sitemap-urls']).toBe('1231');
  });
});

test.describe('v48.3 presentation/accessibility', () => {
  test('SPA routes plus Motif Atlas have no serious accessibility failures or overflow', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    for (const route of SPA_ROUTES) {
      await page.goto(`/#${route}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`[data-view="${route}"]`)).toHaveClass(/active/);
      await noOverflow(page);
      await noSeriousA11y(page, route);
    }
    await page.goto('/motifs', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Motif Atlas', level: 1 })).toBeVisible();
    await noOverflow(page);
    await noSeriousA11y(page, 'motifs');
    expect(pageErrors).toEqual([]);
    expect(consoleErrors.filter((x) => !/favicon/i.test(x))).toEqual([]);
  });

  test('mobile navigation exposes Motif Atlas and remains overflow-free', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#home', { waitUntil: 'domcontentloaded' });
    await noOverflow(page);
    const menu = page.locator('#menu');
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.locator('#nav')).toHaveClass(/open/);
    await expect(page.getByRole('link', { name: 'Motif Atlas' })).toBeVisible();
    await page.goto('/motifs?category=Coordination&motif=Cu4I4', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Motif Atlas', level: 1 })).toBeVisible();
    await noOverflow(page);
  });
});
