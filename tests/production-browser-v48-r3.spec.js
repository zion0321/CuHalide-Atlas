import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PREMERGE = process.env.CUHALIDE_PREMERGE_PRODUCTION === 'true';
const BASE = process.env.CUHALIDE_BASE_URL || 'https://cuhalide-atlas-v3.vercel.app';
const CANDIDATE = /127\.0\.0\.1|localhost/.test(BASE);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Expected JSON from ${response.url()}, received: ${text.slice(0, 300)}`); }
}

async function getData(request, query) {
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await request.get(`/api/public-data?${query}`);
    if (response.status() === 200) return json(response);
    if (![429, 500, 502, 503, 504].includes(response.status()) || attempt === 2) break;
    await sleep(200 * (attempt + 1));
  }
  expect(response.status(), query).toBe(200);
  return json(response);
}

async function noOverflow(page) {
  const x = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(x.scrollWidth, `Horizontal overflow: ${JSON.stringify(x)}`).toBeLessThanOrEqual(x.clientWidth + 1);
}

async function noSeriousA11y(page, label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact)), `${label} accessibility`).toEqual([]);
}

test.describe('CuHalide Atlas 3.0.2 + Current Curated rev.3 scientific contracts', () => {
  test('health, versions and exact rev.3 state are coherent', async ({ request }) => {
    const response = await request.get('/health.json');
    expect(response.status()).toBe(200);
    const h = await json(response);
    expect(h.ok).toBe(true);
    expect(h.status).toBe('PASS');
    if (!PREMERGE) expect(h.site_readiness).toBe('PASS');
    expect(h.release).toBe('3.0.2');
    expect(h.site_version).toBe('48');
    if (CANDIDATE || !PREMERGE) {
      expect(h.meta_version).toBe('48.4');
      expect(h.public_data.version).toBe('2.10.0');
      expect(h.smart_rag.version).toBe('9.15.0');
      expect(h.smart_rag.unified_documents).toBe(1322);
      expect(h.motif_atlas).toMatchObject({ ok: true, version: '1.2', taxonomy_rows: 949, resolved: 816, unresolved: 133 });
      expect(h.current_curated.current_curated_through).toBe('2026-08-14');
      expect(Number(h.current_curated.live_revision)).toBe(3);
      expect(h.current_curated.batch).toMatchObject({ coverage_backfills: 19, post_cutoff_additions: 8, current_overlay_articles: 27, current_overlay_structures: 71 });
      expect(h.current_curated.counts).toMatchObject({ article_audit_records: 373, chemically_included_articles: 362, canonical_verified_articles: 359, structure_phase_rows: 949, core_included_structure_rows: 887, resolved_space_group_rows: 719, verified_space_group_rows: 694, verified_polar_rows: 97, strict_polar_rows: 77, strict_polar_articles: 46, rag_documents: 1322, rag_embedded: 1322 });
    }
    expect(h.frozen_release.counts).toMatchObject({ article_audit_records: 346, chemically_included_articles: 335, canonical_verified_articles: 332, structure_phase_rows: 878, core_included_structure_rows: 816, resolved_space_group_rows: 650, verified_space_group_rows: 625, verified_polar_rows: 87, strict_polar_rows: 67, strict_polar_articles: 42 });
    expect(h.current_errata_count).toBe(0);
    expect(h.historical_corrections_count).toBe(4);
  });

  test('Current Curated default and Frozen scope denominators are independently exact', async ({ request }) => {
    const current = await getData(request, 'action=health');
    const rev = Number(current.current_curated_revision || current.current_curated?.current_state?.live_revision || 0);
    if (CANDIDATE || !PREMERGE || rev === 3) {
      expect((await getData(request, 'action=articles&page=1&page_size=1')).pagination.total).toBe(373);
      expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20canonical')).pagination.total).toBe(359);
      expect((await getData(request, 'action=articles&page=1&page_size=1&release_status=Current%20Curated%20-%20Verified')).pagination.total).toBe(27);
      expect((await getData(request, 'action=structures&page=1&page_size=1')).pagination.total).toBe(949);
      expect((await getData(request, 'action=structures&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(887);
      expect((await getData(request, 'action=polar&page=1&page_size=1')).pagination.total).toBe(77);
    }
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

  test('rev.3 papers and duplicate-identity projections are exact', async ({ request }) => {
    const a371 = (await getData(request, 'action=article&id=371')).item;
    const a372 = (await getData(request, 'action=article&id=372')).item;
    const a373 = (await getData(request, 'action=article&id=373')).item;
    expect(a371).toMatchObject({ doi: '10.1021/acs.inorgchem.6c03055', live_revision: 3, curation_layer: 'Current Curated' });
    expect(a372).toMatchObject({ doi: '10.1002/smll.74688', live_revision: 3, curation_layer: 'Current Curated' });
    expect(a373).toMatchObject({ doi: '10.1021/acs.cgd.6c00650', live_revision: 3, curation_layer: 'Current Curated' });
    const s371 = (await getData(request, 'action=structure&id=CUH-371-S01')).item;
    expect(s371).toMatchObject({ dimensionality: '0D', space_group: 'P-1', polar: 'No' });
    expect(s371.motif_details).toMatchObject({ formula: 'Cu10I20', confidence: 'High' });
    const s372 = (await getData(request, 'action=structure&id=CUH-372-S01')).item;
    expect(s372).toMatchObject({ dimensionality: '0D', space_group: 'P42212', polar: 'No', chemical_identity_status: 'known_identity_new_determination' });
    expect(s372.motif_details.formula).toBe('Cu4I4');
    const s373 = (await getData(request, 'action=structure&id=CUH-373-S01')).item;
    expect(s373).toMatchObject({ dimensionality: '1D', space_group: 'P21/c', polar: 'No' });
    expect(s373.motif_details.formula).toBe('Cu2I2');
  });

  test('Motif Atlas 1.2 is conservative for fractional/mixed occupancy', async ({ request }) => {
    const all = await getData(request, 'action=motifs&limit=100');
    expect(all.version).toBe('2.10.0');
    expect(Number(all.current_curated_revision)).toBe(3);
    expect(all.atlas.schema_version).toBe('1.2');
    expect(all.atlas.coverage).toMatchObject({ total_taxonomy_rows: 949, motif_resolved_rows: 816, motif_unresolved_rows: 133, primary_classified_rows: 909, unresolved_category_rows: 40, curated_component_structures: 28 });
    const c = Object.fromEntries(all.atlas.categories.map((x) => [x.primary_category, x]));
    expect(c.Coordination).toMatchObject({ article_count: 115, structure_determinations: 356, identity_count: 253, motif_count: 26 });
    expect(c['Hybrid Ionic']).toMatchObject({ article_count: 218, structure_determinations: 451, identity_count: 393, motif_count: 65 });
    expect(c['All-in-One (AIO)']).toMatchObject({ article_count: 26, structure_determinations: 102, identity_count: 91, motif_count: 22 });
    const cu4i4 = await getData(request, 'action=motifs&category=Coordination&motif=Cu4I4&limit=100');
    expect(cu4i4.atlas.motifs[0]).toMatchObject({ motif_formula: 'Cu4I4', article_count: 46, structure_determinations: 82, identity_count: 65 });
    expect(String(all.atlas.component_note)).toMatch(/fractional|mixed-occupancy/i);
    const fractional = (await getData(request, 'action=structure&id=CUH-037-S01')).item;
    expect(fractional.motif).toBe('Unresolved');
    expect(fractional.motif_details).toMatchObject({ formula: 'Unresolved', confidence: 'Unresolved' });
  });

  test('Smart RAG 9.15 uses the 1322-document rev.3 corpus and structure-grain guards', async ({ request }) => {
    const rag = await json(await request.get('/api/agent'));
    expect(rag).toMatchObject({ ok: true, release: '3.0.2', version: '9.15.0' });
    expect(rag.corpus).toMatchObject({ unified_documents: 1322, unified_embedded: 1322 });
    expect(rag.current_curated).toMatchObject({ live_revision: 3, curated_through: '2026-08-14' });
    expect(rag.capabilities.deterministic_motif_atlas).toBe(true);
    expect(rag.capabilities.fractional_motif_conservatism).toBe(true);
    const structure = await json(await request.post('/api/agent', { data: { messages: [{ role: 'user', content: 'What is the motif and emission of CUH-372-S01?' }] } }));
    expect(structure.answer).toContain('Cu4I4');
    expect(structure.answer).toMatch(/article-grain|Article-grain|evidence boundary/i);
    expect(structure.sources.some((x) => x.type === 'structure' && x.id === 'CUH-372-S01')).toBe(true);
  });

  test('rev.3 root, stable pages, sitemap and privacy boundary are coherent', async ({ request }) => {
    const root = await request.get('/');
    expect(root.status()).toBe(200);
    const html = await root.text();
    for (const token of ['CUHALIDE_SITE_V48_MOTIF_ATLAS', 'Frozen Release 3.0.2', 'Current Curated rev.3', '2026-08-14', 'Current canonical · n=359', 'Current Core-Included · n=887', 'Motif Atlas']) expect(html).toContain(token);
    const csp = root.headers()['content-security-policy'] || '';
    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(root.headers()['x-cuhalide-current-curated-revision']).toBe('3');
    const manifest = await json(await request.get('/release-manifest.json'));
    expect(manifest).toMatchObject({ release: '3.0.2', ui_version: '48.4', public_data_version: '2.10.0', smart_rag_version: '9.15.0', meta_version: '48.4' });
    expect(manifest.temporal_scope.current_curated).toMatchObject({ curated_through: '2026-08-14', live_revision: 3, coverage_backfills: 19, post_cutoff_additions: 8 });
    expect(manifest.current_curated_counts).toMatchObject({ canonical_verified_articles: 359, core_included_structure_rows: 887, rag_documents: 1322, rag_embedded: 1322 });
    expect(manifest.public_access.bulk_normalized_export).toBe(false);
    expect((await request.get('/api/export')).status()).toBe(410);
    for (const path of ['/article/371', '/article/372', '/article/373', '/structure/CUH-371-S01', '/structure/CUH-372-S01', '/structure/CUH-373-S01', '/motifs']) expect((await request.get(path)).status(), path).toBe(200);
    const fractionalHtml = await (await request.get('/structure/CUH-037-S01')).text();
    expect(fractionalHtml).toContain('Unresolved');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect((xml.match(/<url>/g) || []).length).toBe(1248);
    expect(xml).toContain('/article/373');
    expect(xml).toContain('/structure/CUH-373-S01');
    expect(sitemap.headers()['x-cuhalide-sitemap-urls']).toBe('1248');
  });
});

test.describe('v48.4 presentation and accessibility', () => {
  for (const width of [390, 768, 1440]) {
    test(`root and Motif Atlas fit viewport ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await noOverflow(page);
      await page.goto('/motifs', { waitUntil: 'domcontentloaded' });
      await noOverflow(page);
    });
  }

  test('root, Motif Atlas and a rev.3 record have no serious accessibility failures', async ({ page }) => {
    for (const [path, label] of [['/', 'root'], ['/motifs', 'motifs'], ['/article/371', 'article371'], ['/structure/CUH-372-S01', 'structure372']]) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await noSeriousA11y(page, label);
      await noOverflow(page);
    }
  });
});
