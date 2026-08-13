import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['home', 'articles', 'structures', 'polar', 'rag', 'watch', 'methods', 'citation'];

function captureRuntimeErrors(page) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  return { consoleErrors, pageErrors };
}
async function expectNoPageOverflow(page) {
  const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(overflow.scrollWidth, `Page-wide horizontal overflow: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(overflow.clientWidth + 1);
}
async function expectNoSeriousA11yViolations(page, route) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(serious, `${route} serious/critical accessibility violations:\n${JSON.stringify(serious, null, 2)}`).toEqual([]);
}

test.describe('CuHalide Atlas v48 interaction and responsive regression', () => {
  test('all routes remain renderable, accessible and within the viewport', async ({ page }, testInfo) => {
    const runtime = captureRuntimeErrors(page);
    for (const route of ROUTES) {
      await page.goto(`/#${route}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`[data-view="${route}"]`)).toHaveClass(/active/);
      await expect(page.locator('main#main')).toBeVisible();
      await expectNoPageOverflow(page);
      await expectNoSeriousA11yViolations(page, route);
      await testInfo.attach(`${testInfo.project.name}-interaction-${route}`, {
        body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
        contentType: 'image/png',
      });
    }
    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  });

  test('Current defaults, navigation, modal focus and Frozen/Current deep links work', async ({ page }) => {
    const runtime = captureRuntimeErrors(page);
    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#arel')).toHaveValue('Current canonical');
    await expect(page.locator('#acount')).toContainText('348 records');

    const viewportWidth = page.viewportSize()?.width || 1440;
    if (viewportWidth <= 1120) {
      await expect(page.locator('#menu')).toBeVisible();
      await page.locator('#menu').click();
      await expect(page.locator('#nav')).toHaveClass(/open/);
      await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'true');
    }

    await page.goto('/#structures', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#scount')).toContainText('859 rows');
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
    await expect(page.locator('#modalBody')).toContainText('CUH-013-S01');
    await expect(page.locator('#modalBody')).toContainText('Unresolved');
    await expect(page.locator('#modalBody')).not.toContainText('Known release erratum');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#structures$/);

    await page.goto('/#article/353', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#modalCard')).toBeVisible();
    await expect(page.locator('#modalBody')).toContainText('Article record 353');
    await expect(page.locator('#modalBody')).toContainText('Current Curated - Verified');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#articles$/);

    await page.goto('/#structure/CUH-353-S01', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#modalCard')).toBeVisible();
    await expect(page.locator('#modalBody')).toContainText('CUH-353-S01');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/#structures$/);

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  });
});
