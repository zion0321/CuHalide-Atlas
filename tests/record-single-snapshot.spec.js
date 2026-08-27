import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

test('known standalone structure remains enhanced, rev.8, and non-indexable',async({request})=>{
  const r=await request.get(`${BASE}/api/record-current?kind=structure&id=CUH-378-S01`);
  expect(r.status()).toBe(200);
  expect(r.headers()['x-cuhalide-current-curated-revision']).toBe('8');
  expect(r.headers()['x-robots-tag']).toContain('noarchive');
  const html=await r.text();
  expect(html).toContain('Current Curated rev.8');
  expect(html).toContain('CUH-378-S01');
  expect(html).toContain('/organic-components-v1.js');
  expect(html).toContain('<meta name="robots" content="noindex,nofollow,noarchive">');
});

test('missing standalone structure stays a pure 404 page',async({request})=>{
  const r=await request.get(`${BASE}/api/record-current?kind=structure&id=CUH-999-S99`);
  expect(r.status()).toBe(404);
  expect(r.headers()['x-cuhalide-current-curated-revision']).toBe('8');
  expect(r.headers()['x-robots-tag']).toContain('noarchive');
  const html=await r.text();
  expect(html).toContain('Record not found');
  expect(html).not.toContain('data-oc-standalone');
  expect(html).not.toContain('/organic-components-v1.js');
  expect(html).not.toContain('Organic components');
});

test('invalid standalone structure stays a pure 400 page',async({request})=>{
  const r=await request.get(`${BASE}/api/record-current?kind=structure&id=not-a-structure-id`);
  expect(r.status()).toBe(400);
  expect(r.headers()['x-cuhalide-current-curated-revision']).toBe('8');
  expect(r.headers()['x-robots-tag']).toContain('noarchive');
  const html=await r.text();
  expect(html).toContain('Invalid record identifier');
  expect(html).not.toContain('data-oc-standalone');
  expect(html).not.toContain('/organic-components-v1.js');
});
