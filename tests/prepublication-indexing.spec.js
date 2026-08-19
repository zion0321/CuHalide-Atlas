import { test, expect } from '@playwright/test';

const BASE = process.env.CUHALIDE_BASE_URL || 'http://127.0.0.1:4173';

function header(response, name) {
  return response.headers()[String(name).toLowerCase()] || '';
}

async function expectNoindexPage(request, path) {
  const response = await request.get(`${BASE}${path}`);
  expect(response.status()).toBe(200);
  expect(header(response, 'x-robots-tag')).toContain('noindex');
  const html = await response.text();
  expect(html).toContain('<meta name="robots" content="noindex,nofollow,noarchive">');
  expect(html).not.toContain('<meta name="robots" content="index,follow,max-image-preview:large">');
}

async function expectNoindexHeader(request, path) {
  const response = await request.get(`${BASE}${path}`);
  expect(response.status()).toBe(200);
  expect(header(response, 'x-robots-tag')).toContain('noindex');
  expect(header(response, 'x-robots-tag')).toContain('nofollow');
  expect(header(response, 'x-robots-tag')).toContain('noarchive');
  return response;
}

test('prepublication indexing remains disabled while direct access stays available', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Indexing policy is viewport invariant; run once on desktop.');

  await expectNoindexPage(request, '/');
  await expectNoindexPage(request, '/api/site');
  await expectNoindexPage(request, '/article/381');
  await expectNoindexPage(request, '/structure/CUH-378-S01');
  await expectNoindexHeader(request, '/motifs');

  const manifestResponse = await request.get(`${BASE}/release-manifest.json`);
  expect(manifestResponse.status()).toBe(200);
  expect(header(manifestResponse, 'x-robots-tag')).toContain('noindex');
  const manifest = await manifestResponse.json();
  expect(manifest.public_access).toMatchObject({
    mode: 'query-and-view',
    release_state: 'prepublication',
    indexing: 'disabled-prepublication',
    bulk_export: false,
  });

  const robotsResponse = await request.get(`${BASE}/robots.txt`);
  expect(robotsResponse.status()).toBe(200);
  expect(header(robotsResponse, 'x-robots-tag')).toContain('noindex');
  const robots = await robotsResponse.text();
  expect(robots).toContain('Prepublication');
  expect(robots).not.toContain('Sitemap:');

  const exportResponse = await request.get(`${BASE}/api/export`);
  expect(exportResponse.status()).toBe(410);
});
