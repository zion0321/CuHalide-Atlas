import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['home', 'articles', 'structures', 'polar', 'rag', 'watch', 'methods', 'citation'];

async function json(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Expected JSON from ${response.url()}, received: ${text.slice(0, 300)}`); }
}

function captureRuntimeErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  return { consoleErrors, pageErrors };
}

async function expectNoPageOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth, `Page-wide horizontal overflow: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function attachScreenshot(page, testInfo, name) {
  const body = await page.screenshot({ fullPage: true, animations: 'disabled' });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

async function expectNoSeriousA11yViolations(page, route) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(serious, `${route} serious/critical accessibility violations:\n${JSON.stringify(serious, null, 2)}`).toEqual([]);
}

test.describe('release 3.0.2 HTTP, scientific, privacy and security contracts', () => {
  test('production identity, CSP, manifest, Current Curated and retired routes are exact', async ({ request }) => {
    const healthResponse = await request.get('/health.json');
    expect(healthResponse.status()).toBe(200);
    const health = await json(healthResponse);
    expect(health.ok).toBe(true);
    expect(health.status).toBe('PASS');
    expect(health.release).toBe('3.0.2');
    expect(health.site_version).toBe('48');
    expect(health.meta_version).toBe('48.0');
    expect(health.public_data.version).toBe('2.7.0');
    expect(health.smart_rag.version).toBe('9.12.0');
    expect(health.current_curated.base_release).toBe('3.0.2');
    expect(health.current_curated.live_revision).toBe(0);
    expect(health.current_curated.status).toBe('ready');
    expect(health.current_errata_count).toBe(0);
    expect(health.historical_corrections_count).toBe(4);
    expect(Object.values(health.checks).every(Boolean)).toBe(true);

    const root = await request.get('/');
    expect(root.status()).toBe(200);
    const html = await root.text();
    expect(html).toContain('CUHALIDE_SITE_V48_CURRENT_CURATED');
    expect(html).toContain('content="3.0.2"');
    expect(html).toContain('content="48"');
    expect(html).toContain('Display window 2006–2026');
    expect(html).not.toContain('2026.06');
    expect(html).toContain('Current Curated');
    const csp = root.headers()['content-security-policy'] || '';
    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(root.headers()['strict-transport-security']).toContain('max-age=63072000');
    expect(root.headers()['x-frame-options']).toBe('DENY');
    expect(root.headers()['x-cuhalide-release']).toBe('3.0.2');
    expect(root.headers()['x-cuhalide-site-version']).toBe('48');

    const manifestResponse = await request.get('/release-manifest.json');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await json(manifestResponse);
    expect(manifest.release).toBe('3.0.2');
    expect(manifest.release_date).toBe('2026-08-11');
    expect(manifest.literature_cutoff).toBe('2026-06');
    expect(manifest.site_version).toBe('48');
    expect(manifest.public_data_version).toBe('2.7.0');
    expect(manifest.smart_rag_version).toBe('9.12.0');
    expect(manifest.counts.canonical_verified_articles).toBe(332);
    expect(manifest.counts.core_included_structure_rows).toBe(816);
    expect(manifest.structure_halogen_runtime.version).toBe('structure-halogen-v6');
    expect(manifest.structure_halogen_runtime.structure_specific_rows).toBe(803);
    expect(manifest.structure_halogen_runtime.series_level_rows).toBe(45);
    expect(manifest.structure_halogen_runtime.unresolved_rows).toBe(30);
    expect(manifest.structure_halogen_runtime.source_conflict_rows).toBe(4);
    expect(manifest.current_curated.base_release).toBe('3.0.2');
    expect(manifest.current_curated.live_revision).toBe(0);

    expect((await request.get('/api/export')).status()).toBe(410);
    expect((await request.get('/manifest.json')).status()).toBe(404);
    expect((await request.get('/manifest.webmanifest')).status()).toBe(404);

    const dataHealthResponse = await request.get('/api/public-data?action=health');
    expect(dataHealthResponse.status()).toBe(200);
    const dataHealth = await json(dataHealthResponse);
    expect(dataHealth.release).toBe('3.0.2');
    expect(dataHealth.version).toBe('2.7.0');
    expect(Object.values(dataHealth.checks).every(Boolean)).toBe(true);
    expect(dataHealth.public_access.bulk_export).toBe(false);
    expect(dataHealth.public_access.primary_evidence).toBe(false);

    const currentResponse = await request.get('/api/public-data?action=current-curated');
    expect(currentResponse.status()).toBe(200);
    const current = await json(currentResponse);
    expect(current.current_curated.base_release).toBe('3.0.2');
    expect(current.current_curated.current_curated_through).toBe('2026-08-11');
    expect(current.current_curated.live_revision).toBe(0);
    expect(current.current_curated.status).toBe('ready');

    const ragResponse = await request.get('/api/agent');
    expect(ragResponse.status()).toBe(200);
    const rag = await json(ragResponse);
    expect(rag.release).toBe('3.0.2');
    expect(rag.version).toBe('9.12.0');
    expect(rag.ok).toBe(true);
    expect(rag.checks.scientific_context_contract).toBe(true);
    expect(rag.capabilities.release_302_physical_record13_correction).toBe(true);
  });

  test('article, structure, polar, halogen and Record 13 contracts are exact', async ({ request }) => {
    const getData = async (query) => json(await request.get(`/api/public-data?${query}`));

    expect((await getData('action=articles&page=1&page_size=1&release_status=Core%20-%20Verified')).pagination.total).toBe(332);
    expect((await getData('action=articles&page=1&page_size=1')).pagination.total).toBe(346);
    expect((await getData('action=articles&page=1&page_size=1&release_status=Core%20-%20Verified&halogen=I')).pagination.total).toBe(247);
    expect((await getData('action=articles&page=1&page_size=1&release_status=Core%20-%20Verified&halogen=Cl%2FBr%2FI')).pagination.total).toBe(27);

    expect((await getData('action=structures&page=1&page_size=1&eligibility=Core%20-%20Included')).pagination.total).toBe(816);
    expect((await getData('action=structures&page=1&page_size=1')).pagination.total).toBe(878);
    expect((await getData('action=polar&page=1&page_size=1')).pagination.total).toBe(67);
    expect((await getData('action=structures&page=1&page_size=1&q=STE')).pagination.total).toBe(0);
    expect((await getData('action=structures&page=1&page_size=1&q=luminescence')).pagination.total).toBe(0);
    expect((await getData('action=structures&page=1&page_size=1&q=I')).pagination.total).toBe(599);

    const s00801 = (await getData('action=structure&id=CUH-008-S01')).item;
    expect(s00801.halogen).toBe('I');
    expect(s00801.halogen_scope).toBe('structure-specific');
    expect(s00801.halogen_confidence).toBe('High');
    expect(s00801.emission_nm).toBe('');
    expect(s00801.emission_assignment).toContain('article grain');

    const s00802 = (await getData('action=structure&id=CUH-008-S02')).item;
    expect(s00802.halogen).toBe('Unresolved');
    expect(s00802.halogen_scope).toBe('unresolved');

    const s162 = (await getData('action=structure&id=CUH-162-S01')).item;
    expect(s162.halogen).toBe('Cl/Br/I');
    expect(s162.halogen_scope).toBe('series-level');

    for (const id of ['CUH-293-S02', 'CUH-293-S03', 'CUH-299-S01']) {
      const row = (await getData(`action=structure&id=${id}`)).item;
      expect(row.halogen).toBe('Unresolved');
      expect(row.halogen_basis).toBe('source-conflict');
    }

    const expectedRecord13 = {
      'CUH-013-S01': 'Unresolved',
      'CUH-013-S02': '0D',
      'CUH-013-S03': '0D',
      'CUH-013-S04': '0D',
    };
    for (const [id, dimension] of Object.entries(expectedRecord13)) {
      const row = (await getData(`action=structure&id=${id}`)).item;
      expect(row.dimensionality).toBe(dimension);
      expect(row.known_erratum).toBe(false);
      expect(row.erratum_note).toBe('');
    }

    const history = await getData('action=errata');
    expect(history.count).toBe(4);
    expect(history.history_release).toBe('3.0.1');
    expect(history.items.every((x) => x.resolved_in_release === '3.0.2')).toBe(true);
  });
});

test.describe('release 3.0.2 live Chromium interaction, responsive and visual QA', () => {
  test('all public routes render without serious accessibility errors or page overflow', async ({ page }, testInfo) => {
    const runtime = captureRuntimeErrors(page);
    for (const route of ROUTES) {
      await page.goto(`/#${route}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`[data-view="${route}"]`)).toHaveClass(/active/);
      await expect(page.locator('main#main')).toBeVisible();
      await expectNoPageOverflow(page);
      await expectNoSeriousA11yViolations(page, route);
      await attachScreenshot(page, testInfo, `${testInfo.project.name}-${route}`);
    }
    expect(runtime.pageErrors, `Page errors: ${runtime.pageErrors.join('\n')}`).toEqual([]);
    expect(runtime.consoleErrors, `Console errors: ${runtime.consoleErrors.join('\n')}`).toEqual([]);
  });

  test('Current Curated, year display, data loading, modal focus, deep links and responsive navigation work', async ({ page }, testInfo) => {
    const runtime = captureRuntimeErrors(page);

    await page.goto('/#home', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#currentCuratedText')).toContainText('Current Curated through 2026-08-11');
    await expect(page.locator('#currentCuratedText')).toContainText('live revision 0');
    await expect(page.locator('#yearChart')).toContainText('2026');
    await expect(page.locator('#yearChart')).not.toContainText('2026.06');
    await expect(page.locator('.release .ver')).toHaveText('Release 3.0.2');

    const viewportWidth = page.viewportSize()?.width || 1440;
    if (viewportWidth <= 1120) {
      await expect(page.locator('#menu')).toBeVisible();
      await page.locator('#menu').click();
      await expect(page.locator('#nav')).toHaveClass(/open/);
      expect(await page.locator('#menu').getAttribute('aria-expanded')).toBe('true');
    }

    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#acount')).toContainText('332 records');

    await page.goto('/#structures', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#scount')).toContainText('816 rows');
    const firstStructure = page.locator('[data-structure]').first();
    await expect(firstStructure).toBeVisible();
    await firstStructure.focus();
    const firstId = await firstStructure.getAttribute('data-structure');
    await firstStructure.click();
    await expect(page.locator('#modalCard')).toBeVisible();
    await expect(page.locator('#modalCard')).toHaveAttribute('role', 'dialog');
    await expect(page.locator('#modalCard')).toHaveAttribute('aria-modal', 'true');
    for (let i = 0; i < 5; i += 1) await page.keyboard.press('Tab');
    const focusInside = await page.evaluate(() => Boolean(document.querySelector('#modalCard')?.contains(document.activeElement)));
    expect(focusInside).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).toBeHidden();
    expect(await page.evaluate((id) => document.activeElement?.getAttribute?.('data-structure') === id, firstId)).toBe(true);

    await page.goto('/#structure/CUH-013-S01', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#modalCard')).toBeVisible();
    await expect(page.locator('#modalBody')).not.toContainText('Known release erratum');
    await expect(page.locator('#modalBody')).toContainText('Unresolved');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#structures$/);

    await page.goto('/#article/13', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#modalCard')).toBeVisible();
    await expect(page.locator('#modalBody')).toContainText('Article record 13');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#articles$/);

    await page.goto('/#watch', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-view="watch"]')).toContainText('Current Curated');
    await expect(page.locator('[data-view="watch"]')).toContainText('primary article/SI/CIF');

    await attachScreenshot(page, testInfo, `${testInfo.project.name}-interaction-final`);
    expect(runtime.pageErrors, `Page errors: ${runtime.pageErrors.join('\n')}`).toEqual([]);
    expect(runtime.consoleErrors, `Console errors: ${runtime.consoleErrors.join('\n')}`).toEqual([]);
  });
});
