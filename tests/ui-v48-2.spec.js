import { test, expect } from '@playwright/test';

async function noPageOverflow(page) {
  const size = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(size.scrollWidth, `page-wide overflow: ${JSON.stringify(size)}`).toBeLessThanOrEqual(size.clientWidth + 1);
}

test.describe('CuHalide Atlas UI v48.2 presentation contracts', () => {
  test('presentation assets, marker and response identity are explicit', async ({ request }) => {
    const root = await request.get('/');
    expect(root.status()).toBe(200);
    expect(root.headers()['x-cuhalide-ui-version']).toBe('48.2');
    expect(root.headers()['x-cuhalide-middleware']).toBe('release-3.0.2-ui-v48.2');
    const html = await root.text();
    expect(html).toContain('/ui-v48-2.css?v=48.2');
    expect(html).toContain('/ui-v48-2.js?v=48.2');
    expect(html).toContain('CUHALIDE_UI_V48_2');

    const css = await request.get('/ui-v48-2.css?v=48.2');
    expect(css.status()).toBe(200);
    expect(css.headers()['content-type'] || '').toMatch(/text\/css/i);
    expect(await css.text()).toContain('CuHalide Atlas UI hardening layer v48.2');

    const js = await request.get('/ui-v48-2.js?v=48.2');
    expect(js.status()).toBe(200);
    expect(js.headers()['content-type'] || '').toMatch(/javascript/i);
    expect(await js.text()).toContain("document.documentElement.classList.add('ui-v48-2')");
  });

  test('responsive presentation is active without page-level horizontal overflow', async ({ page }, testInfo) => {
    await page.goto('/#home', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/ui-v48-2/);
    await expect(page.locator('#currentCuratedText')).toContainText('Current Curated through 2026-08-12');
    await expect(page.locator('#yearChart')).toContainText('2026');
    await noPageOverflow(page);

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const shellWidth = await page.locator('.shell').first().evaluate((el) => el.getBoundingClientRect().width);
    expect(shellWidth).toBeLessThanOrEqual(Math.min(1280, viewport.width));

    if (viewport.width <= 780) {
      const kpiColumns = await page.locator('#kpis').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
      expect(kpiColumns).toBe(2);
      const chart = await page.locator('#yearChart').evaluate((el) => ({
        height: el.getBoundingClientRect().height,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollLeft: el.scrollLeft,
      }));
      expect(chart.height).toBeLessThanOrEqual(220);
      if (chart.scrollWidth > chart.clientWidth + 1) expect(chart.scrollLeft).toBeGreaterThan(0);
    }

    await testInfo.attach(`${testInfo.project.name}-ui-v48-2-home`, {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
  });

  test('filters stay compact on mobile and remain fully usable', async ({ page }) => {
    const viewport = page.viewportSize();
    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#acount')).toContainText('348 records');
    await noPageOverflow(page);

    if (viewport.width <= 780) {
      const panel = page.locator('.view[data-view="articles"] .filters');
      await expect(panel).toHaveClass(/ui-collapsed/);
      await expect(panel.locator('.mobile-filter-toggle')).toBeVisible();
      await expect(page.locator('#arel')).toBeHidden();

      await panel.locator('.mobile-filter-toggle').click();
      await expect(page.locator('#arel')).toBeVisible();
      await page.locator('#adim').selectOption('0D');
      await expect(panel.locator('.ui-count')).toContainText('1 active');
      await panel.locator('.mobile-filter-done').click();
      await expect(panel).toHaveClass(/ui-collapsed/);
      await expect(page.locator('#adim')).toBeHidden();
    } else {
      await expect(page.locator('#arel')).toBeVisible();
    }
  });

  test('structure register is card-readable on mobile and table-readable otherwise', async ({ page }, testInfo) => {
    const viewport = page.viewportSize();
    await page.goto('/#structures', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#scount')).toContainText('859 rows');
    await expect(page.locator('#srows tr').first()).toBeVisible();
    await noPageOverflow(page);

    if (viewport.width <= 780) {
      const filterPanel = page.locator('#selig').locator('xpath=ancestor::div[contains(@class,"panel")]');
      await expect(filterPanel).toHaveClass(/ui-collapsed/);
      await expect(page.locator('.view[data-view="structures"] thead')).toBeHidden();
      const rowDisplay = await page.locator('#srows tr').first().evaluate((el) => getComputedStyle(el).display);
      expect(rowDisplay).toBe('grid');
      const cellLayout = await page.locator('#srows tr').first().locator('td').first().evaluate((el) => ({
        display: getComputedStyle(el).display,
        label: getComputedStyle(el, '::before').content,
      }));
      expect(cellLayout.display).toBe('grid');
      expect(cellLayout.label).toContain('Structure');
    } else {
      await expect(page.locator('.view[data-view="structures"] thead')).toBeVisible();
    }

    await testInfo.attach(`${testInfo.project.name}-ui-v48-2-structures`, {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
  });

  test('RAG prioritizes the conversation on mobile while keeping setup accessible', async ({ page }, testInfo) => {
    const viewport = page.viewportSize();
    await page.goto('/#rag', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.rag-work')).toBeVisible();
    await expect(page.locator('#rstatus')).not.toHaveText('Checking service…');
    await noPageOverflow(page);

    if (viewport.width <= 780) {
      const setup = page.locator('.rag-side');
      await expect(setup).toHaveClass(/ui-collapsed/);
      await expect(setup.locator('.mobile-panel-toggle')).toBeVisible();
      await expect(page.locator('#rmode')).toBeHidden();
      const workHeight = await page.locator('.rag-work').evaluate((el) => el.getBoundingClientRect().height);
      expect(workHeight).toBeGreaterThanOrEqual(490);
      await setup.locator('.mobile-panel-toggle').click();
      await expect(page.locator('#rmode')).toBeVisible();
    }

    await testInfo.attach(`${testInfo.project.name}-ui-v48-2-rag`, {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
  });

  test('responsive navigation closes predictably and long pages expose a return affordance', async ({ page }) => {
    const viewport = page.viewportSize();
    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#acount')).toContainText('348 records');

    if (viewport.width <= 1120) {
      await page.locator('#menu').click();
      await expect(page.locator('#nav')).toHaveClass(/open/);
      await page.keyboard.press('Escape');
      await expect(page.locator('#nav')).not.toHaveClass(/open/);
      await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'false');
    }

    await page.evaluate(() => window.scrollTo(0, Math.max(1200, document.documentElement.scrollHeight)));
    await expect(page.locator('.ui-backtop')).toHaveClass(/show/);
    await page.locator('.ui-backtop').click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
  });
});
