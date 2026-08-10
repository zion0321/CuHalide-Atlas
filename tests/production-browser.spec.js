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

test.describe('production HTTP and scientific contracts', () => {
  test('health, privacy, security, and retired routes are correct', async ({ request }) => {
    const healthResponse = await request.get('/health.json');
    expect(healthResponse.status()).toBe(200);
    const health = await json(healthResponse);
    expect(health.ok).toBe(true);
    expect(health.status).toBe('PASS');
    expect(health.release).toBe('3.0.1');
    expect(health.site_version).toBe('47');
    expect(health.meta_version).toBe('47.5');
    expect(health.public_data.version).toBe('2.6.0');
    expect(health.checks.csp_hardened).toBe(true);
    expect(health.checks.rag_context_contract).toBe(true);

    const root = await request.get('/');
    expect(root.status()).toBe(200);
    const csp = root.headers()['content-security-policy'] || '';
    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(root.headers()['strict-transport-security']).toContain('max-age=63072000');
    expect(root.headers()['x-frame-options']).toBe('DENY');

    const exportResponse = await request.get('/api/export');
    expect(exportResponse.status()).toBe(410);
    expect((await request.get('/manifest.json')).status()).toBe(404);
    expect((await request.get('/manifest.webmanifest')).status()).toBe(404);

    const manifestResponse = await request.get('/release-manifest.json');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await json(manifestResponse);
    expect(manifest.release).toBe('3.0.1');
    expect(manifest.literature_cutoff).toBe('2026-06');
    expect(manifest.counts.canonical_verified_articles).toBe(332);
    expect(manifest.counts.core_included_structure_rows).toBe(816);
    expect(manifest.structure_halogen_runtime.version).toBe('structure-halogen-v6');
    expect(manifest.structure_halogen_runtime.structure_specific_rows).toBe(803);
    expect(manifest.structure_halogen_runtime.series_level_rows).toBe(45);
    expect(manifest.structure_halogen_runtime.unresolved_rows).toBe(30);
    expect(manifest.structure_halogen_runtime.source_conflict_rows).toBe(4);
  });

  test('article, structure, polar, erratum, and evidence-grain denominators are exact', async ({ request }) => {
    const getData = async (query) => json(await request.get(`/api/public-data?${query}`));

    const canonical = await getData('action=articles&page=1&page_size=1&release_status=Core%20-%20Verified');
    expect(canonical.pagination.total).toBe(332);
    const audit = await getData('action=articles&page=1&page_size=1');
    expect(audit.pagination.total).toBe(346);
    const articleI = await getData('action=articles&page=1&page_size=1&release_status=Core%20-%20Verified&halogen=I');
    expect(articleI.pagination.total).toBe(247);
    const articleMixed = await getData('action=articles&page=1&page_size=1&release_status=Core%20-%20Verified&halogen=Cl%2FBr%2FI');
    expect(articleMixed.pagination.total).toBe(27);

    const coreStructures = await getData('action=structures&page=1&page_size=1&eligibility=Core%20-%20Included');
    expect(coreStructures.pagination.total).toBe(816);
    const allStructures = await getData('action=structures&page=1&page_size=1');
    expect(allStructures.pagination.total).toBe(878);
    const strictPolar = await getData('action=polar&page=1&page_size=1');
    expect(strictPolar.pagination.total).toBe(67);
    const ste = await getData('action=structures&page=1&page_size=1&q=STE');
    expect(ste.pagination.total).toBe(0);
    const luminescence = await getData('action=structures&page=1&page_size=1&q=luminescence');
    expect(luminescence.pagination.total).toBe(0);

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

    const s29903 = (await getData('action=structure&id=CUH-299-S03')).item;
    expect(s29903.halogen).toBe('Br/I');
    expect(s29903.halogen_scope).toBe('series-level');

    const record13 = (await getData('action=structure&id=CUH-013-S01')).item;
    expect(record13.dimensionality).toBe('Unresolved');
    expect(record13.known_erratum).toBe(true);

    const errata = await getData('action=errata');
    expect(errata.count).toBe(4);
  });
});

test.describe('live Chromium interaction and visual QA', () => {
  test('all public routes render, stay within viewport, and remain free of serious accessibility errors', async ({ page }, testInfo) => {
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

  test('responsive navigation, data loading, modal keyboard behavior, and deep links work', async ({ page }, testInfo) => {
    const runtime = captureRuntimeErrors(page);
    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#acount')).toContainText('332 records');

    const viewportWidth = page.viewportSize()?.width || 1440;
    if (viewportWidth <= 1120) {
      await expect(page.locator('#menu')).toBeVisible();
      await page.locator('#menu').click();
      await expect(page.locator('#nav')).toHaveClass(/open/);
      expect(await page.locator('#menu').getAttribute('aria-expanded')).toBe('true');
    }

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
    await expect(page.locator('#modalBody')).toContainText('Known release erratum');
    await expect(page.locator('#modalBody')).toContainText('effective dimensionality = Unresolved');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#structures$/);

    await page.goto('/#article/13', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#modalCard')).toBeVisible();
    await expect(page.locator('#modalBody')).toContainText('Article record 13');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#articles$/);

    await attachScreenshot(page, testInfo, `${testInfo.project.name}-interaction-final`);
    expect(runtime.pageErrors, `Page errors: ${runtime.pageErrors.join('\n')}`).toEqual([]);
    expect(runtime.consoleErrors, `Console errors: ${runtime.consoleErrors.join('\n')}`).toEqual([]);
  });
});
