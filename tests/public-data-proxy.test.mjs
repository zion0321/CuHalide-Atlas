import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/public-data.js';

const originalFetch = globalThis.fetch;
const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function request(url, method = 'GET') {
  return { url, method, headers: { accept: 'application/json', 'user-agent': 'CuHalide-Atlas-Proxy-Test/1.0' } };
}

function responseRecorder() {
  const headers = new Map();
  return {
    statusCode: 200,
    body: '',
    ended: false,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
    getHeader(name) { return headers.get(String(name).toLowerCase()); },
    end(body = '') { this.body = body == null ? '' : String(body); this.ended = true; return this; },
  };
}

test.afterEach(() => { globalThis.fetch = originalFetch; });

test('public-data production mirror is synchronized to 2.10/rev.3 and keeps bounded parallel upstream work', () => {
  const source = read('supabase/functions/cuhalide-atlas-public-data-v302-public/index.ts');
  for (const token of [
    "VERSION='2.10.0'",
    "REV='3'",
    'REQUEST_TIMEOUT_MS=3500',
    'RETRIES=2',
    'current_curated_through',
    "'2026-08-14'",
    'corePromise=fetchCore(incoming,req)',
    'contextPromise=Promise.all([state(),coverage()])',
    "enrichPromise=action==='structure'",
    'Promise.all([corePromise,contextPromise,enrichPromise])',
    'Fractional/mixed-occupancy labels remain motif-unresolved unless independently mapped at structure grain.',
  ]) assert.ok(source.includes(token), `public-data rev.3 mirror must include ${JSON.stringify(token)}`);
  assert.ok(!source.includes("VERSION='2.9.0'"), 'stale Public Data 2.9 mirror must not return');
  assert.ok(!source.includes("REV='2'"), 'stale Current Curated rev.2 public-data mirror must not return');
});

test('Vercel public-data proxy has one bounded end-to-end retry budget and snapshots response bodies before retry', () => {
  const source = read('api/public-data.js');
  for (const token of ['TOTAL_TIMEOUT_MS=12000', 'FIRST_ATTEMPT_TIMEOUT_MS=5000', "body=req.method==='HEAD'?'':await response.text()", 'lastSnapshot=snapshot']) {
    assert.ok(source.includes(token), `public-data proxy must include ${JSON.stringify(token)}`);
  }
  assert.ok(!source.includes('response.body?.cancel()'), 'proxy must not cancel a response and later risk reusing its consumed body');
  assert.ok(!source.includes('return res.end(await response.text())'), 'handler must not read a retry response body after retry control flow has already touched it');
});

test('candidate QA readiness is local-only and superseded preview SHAs share a cancelable branch concurrency group', () => {
  const server = read('scripts/local-candidate-server.mjs');
  const lighthouse = read('.github/workflows/production-lighthouse-qa.yml');
  const preview = read('.github/workflows/vercel-preview-qa.yml');
  for (const token of ["pathname === '/__qa/ready'", "res.setHeader('X-CuHalide-Candidate-Ready', '1')"]) {
    assert.ok(server.includes(token), `candidate readiness must include ${JSON.stringify(token)}`);
  }
  assert.ok(lighthouse.includes('$CUHALIDE_BASE_URL/__qa/ready'), 'production Lighthouse candidate startup must use local readiness');
  assert.ok(!lighthouse.includes('$CUHALIDE_BASE_URL/health.json'), 'production Lighthouse startup must not fan out full remote health once per second');
  assert.ok(preview.includes('group: vercel-preview-qa-${{ github.event.deployment.ref || github.event.deployment.sha }}'), 'preview QA concurrency must group superseded commits by deployment ref with SHA fallback');
  assert.ok(!preview.includes('group: vercel-preview-qa-${{ github.event.deployment.sha }}\n'), 'preview QA must not isolate every superseded SHA into its own concurrency group');
  assert.equal((preview.match(/\$CUHALIDE_BASE_URL\/__qa\/ready/g) || []).length, 2, 'both preview candidate jobs must use local readiness');
  assert.ok(!preview.includes('$CUHALIDE_BASE_URL/health.json'), 'preview startup must not fan out full remote health once per second');
  assert.equal((preview.match(/full health remains part of protected QA/g) || []).length, 2, 'preview must state that readiness does not replace protected health QA');
});

test('503 followed by success returns the successful retry body', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) return new Response('{"ok":false,"attempt":1}', { status: 503, headers: { 'content-type': 'application/json' } });
    return new Response('{"ok":true,"attempt":2}', { status: 200, headers: { 'content-type': 'application/json', 'x-cuhalide-public-data-version': '2.10.0', 'x-cuhalide-current-curated-revision': '3' } });
  };
  const res = responseRecorder();
  await handler(request('/api/public-data?action=health'), res);
  assert.equal(calls, 2);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, '{"ok":true,"attempt":2}');
  assert.equal(res.getHeader('x-cuhalide-public-data-version'), '2.10.0');
  assert.equal(res.getHeader('x-cuhalide-current-curated-revision'), '3');
});

test('503 followed by network failure returns the captured 503 body instead of re-reading an unusable Response', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) return new Response('{"ok":false,"source":"first-503"}', { status: 503, headers: { 'content-type': 'application/json' } });
    throw new Error('simulated upstream socket reset');
  };
  const res = responseRecorder();
  await handler(request('/api/public-data?action=health'), res);
  assert.equal(calls, 2);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body, '{"ok":false,"source":"first-503"}');
  assert.notEqual(res.statusCode, 502);
});

test('two abort failures degrade to a bounded 504 JSON response', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    const error = new Error('simulated timeout');
    error.name = 'AbortError';
    throw error;
  };
  const res = responseRecorder();
  await handler(request('/api/public-data?action=health'), res);
  assert.equal(calls, 2);
  assert.equal(res.statusCode, 504);
  assert.equal(JSON.parse(res.body).version, '2.10.0');
  assert.match(JSON.parse(res.body).error, /timed out/i);
});

test('HEAD never consumes or emits an upstream body', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return new Response(null, { status: 200, headers: { 'content-type': 'application/json', 'x-cuhalide-current-curated-revision': '3' } }); };
  const res = responseRecorder();
  await handler(request('/api/public-data?action=health', 'HEAD'), res);
  assert.equal(calls, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, '');
  assert.equal(res.getHeader('x-cuhalide-current-curated-revision'), '3');
});
