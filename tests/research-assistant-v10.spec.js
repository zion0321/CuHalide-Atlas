import crypto from 'node:crypto';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const API_SESSION = crypto.randomBytes(32).toString('hex');

async function json(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Expected JSON from ${response.url()}, received: ${text.slice(0, 300)}`); }
}

async function ask(request, messages) {
  const response = await request.post('/api/agent', { headers: { 'x-cuhalide-session': API_SESSION }, data: { messages, mode: 'auto', depth: 'standard' }, timeout: 125000 });
  expect(response.status()).toBe(200);
  return json(response);
}

function expectNotOldScopeFailure(answer) {
  expect(String(answer || '')).not.toMatch(/outside CuHalide Atlas release 3\.0\.2 scope/i);
  expect(String(answer || '').trim().length).toBeGreaterThan(20);
}

test.describe('Research Assistant 10.0 conversational routing', () => {
  test('gateway keeps Smart RAG 9.15 compatibility while exposing assistant 10.0 capabilities', async ({ request }) => {
    const response = await request.get('/api/agent');
    expect(response.status()).toBe(200);
    const x = await json(response);
    expect(x).toMatchObject({ ok: true, release: '3.0.2', version: '9.15.0', assistant_version: '10.0.0', service: 'CuHalide Research Assistant' });
    expect(x.corpus).toMatchObject({ unified_documents: 1322, unified_embedded: 1322 });
    expect(x.current_curated).toMatchObject({ live_revision: 3, curated_through: '2026-08-14' });
    expect(x.capabilities).toMatchObject({ natural_conversation: true, automatic_evidence_routing: true, general_scientific_explanation: true, multi_turn_context: true, evidence_grounded_retrieval: true, deterministic_motif_atlas: true, fractional_motif_conservatism: true, separate_conversation_identity: true, live_web: false });
    expect(x.checks.evidence_layer_reachable).toBe(true);
  });

  test('capability question is conversational rather than an out-of-scope database rejection', async ({ request }) => {
    const x = await ask(request, [{ role: 'user', content: 'what can you do?' }]);
    expect(x.route).toBe('conversation');
    expect(x.answer_kind).toBe('conversation');
    expect(x.assistant_version).toBe('10.0.0');
    expect(Array.isArray(x.sources) ? x.sources : []).toHaveLength(0);
    expectNotOldScopeFailure(x.answer);
    expect(['LLM_CONVERSATION', 'SAFE_CONVERSATION_FALLBACK']).toContain(x.operational_mode);
  });

  test('Chinese greeting/capability query is conversational', async ({ request }) => {
    const x = await ask(request, [{ role: 'user', content: '你好，你能做什么？' }]);
    expect(x.route).toBe('conversation');
    expect(x.answer_kind).toBe('conversation');
    expectNotOldScopeFailure(x.answer);
  });

  test('general science explanation does not require a fake Atlas citation', async ({ request }) => {
    const x = await ask(request, [{ role: 'user', content: 'What is an exciton? Explain it simply.' }]);
    expect(x.route).toBe('conversation');
    expect(x.answer_kind).toBe('conversation');
    expect(Array.isArray(x.sources) ? x.sources : []).toHaveLength(0);
    expectNotOldScopeFailure(x.answer);
  });

  test('record-specific crystallography is automatically routed to evidence', async ({ request }) => {
    const x = await ask(request, [{ role: 'user', content: 'What is the dimensionality of CUH-013-S01?' }]);
    expect(['evidence', 'evidence-reroute']).toContain(x.route);
    expect(x.answer_kind).toBe('evidence');
    expect(x.evidence_engine_version).toBe('9.15.0');
    expect(String(x.answer)).toMatch(/Unresolved/i);
    expect(String(x.answer)).not.toMatch(/ferroelectric/i);
  });

  test('structure motif plus photophysics preserves structure-grain boundary', async ({ request }) => {
    const x = await ask(request, [{ role: 'user', content: 'What is the motif and emission of CUH-372-S01?' }]);
    expect(['evidence', 'evidence-reroute']).toContain(x.route);
    expect(x.answer_kind).toBe('evidence');
    expect(String(x.answer)).toContain('Cu4I4');
    expect(String(x.answer)).toMatch(/article-grain|evidence boundary/i);
    expect((x.sources || []).some((s) => s.type === 'structure' && s.id === 'CUH-372-S01')).toBe(true);
  });

  test('scientific follow-up inherits evidence context automatically', async ({ request }) => {
    const x = await ask(request, [
      { role: 'user', content: 'What evidence does CuHalide Atlas have for CUH-372-S01?' },
      { role: 'assistant', content: 'I checked the curated structure record and its article-level evidence.' },
      { role: 'user', content: 'Why is that important?' },
    ]);
    expect(['evidence', 'evidence-reroute']).toContain(x.route);
    expect(x.answer_kind).toBe('evidence');
    expectNotOldScopeFailure(x.answer);
  });

  test('meta conversation overrides previous evidence context', async ({ request }) => {
    const x = await ask(request, [
      { role: 'user', content: 'Tell me about CUH-372-S01.' },
      { role: 'assistant', content: 'I checked the curated record.' },
      { role: 'user', content: 'what can you do?' },
    ]);
    expect(x.route).toBe('conversation');
    expect(x.answer_kind).toBe('conversation');
    expectNotOldScopeFailure(x.answer);
  });

  test('latest Cu(I)-halide request automatically selects research/Literature Watch route', async ({ request }) => {
    const x = await ask(request, [{ role: 'user', content: 'Show me the latest Cu(I) iodide literature and Literature Watch candidates.' }]);
    expect(x.route).toBe('research');
    expect(x.answer_kind).toBe('evidence');
    expectNotOldScopeFailure(x.answer);
  });
});

test.describe('Research Assistant 48.5 interface', () => {
  test('assistant UI presents one natural composer with no manual mode selector', async ({ page }) => {
    await page.goto('/#rag', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'CuHalide Research Assistant' })).toBeVisible();
    await expect(page.getByText('Just ask naturally')).toBeVisible();
    await expect(page.locator('#rmode')).toHaveCount(0);
    await expect(page.locator('#rq')).toHaveAttribute('placeholder', /Ask naturally/);
    await expect(page.locator('#rsend')).toHaveText('Send');
    await expect(page.getByText('Evidence used')).toBeVisible();
  });

  test('short chat input is accepted and rendered without a scope rejection', async ({ page }) => {
    await page.goto('/#rag', { waitUntil: 'domcontentloaded' });
    await page.locator('#rq').fill('hi');
    await page.locator('#rsend').click();
    const messages = page.locator('#thread .bubble.assistant');
    await expect(messages.last()).toContainText('CuHalide Research Assistant', { timeout: 125000 });
    await expect(messages.last()).not.toContainText('outside CuHalide Atlas release 3.0.2 scope');
    const session = await page.evaluate(() => localStorage.getItem('cuhalide-assistant-session-v1'));
    expect(session).toMatch(/^[a-f0-9]{64}$/);
  });

  test('assistant page has no serious WCAG failures or horizontal overflow', async ({ page }) => {
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#rag', { waitUntil: 'domcontentloaded' });
      const size = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact)), `${width}px accessibility`).toEqual([]);
    }
  });
});
