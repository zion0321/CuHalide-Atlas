import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const FUNCTIONS = [
  ['conversation', 'supabase/functions/cuhalide-atlas-conversation-v1-internal/index.ts', '1.0.2'],
  ['r7 unified', 'supabase/functions/cuhalide-atlas-current-rag-r7-unified-internal/index.ts', 'current-rag-r7.2.1'],
  ['r7 science exact', 'supabase/functions/cuhalide-atlas-current-rag-r7-science-exact-internal/index.ts', 'current-rag-r7-science-exact-1.1.1'],
  ['r7 exact', 'supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts', 'current-rag-r7.0.8'],
  ['r6 exact fallback', 'supabase/functions/cuhalide-atlas-current-rag-r6-exact-internal/index.ts', 'current-rag-r6.0.3'],
  ['r1 fallback', 'supabase/functions/cuhalide-atlas-current-rag-r1-internal/index.ts', 'current-rag-r4.0.4'],
];

for (const [name, path, expectedVersion] of FUNCTIONS) {
  test(`${name} is repository-backed and service-only`, async () => {
    const source = await readFile(path, 'utf8');

    assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/, 'must bind the service-role secret');
    assert.match(source, /req\.headers\.get\(['"]authorization['"]\)/, 'must inspect Authorization');
    assert.match(source, /req\.headers\.get\(['"]apikey['"]\)/, 'must inspect apikey');
    assert.match(source, /Bearer \$\{(?:KEY|SERVICE)\}/, 'must compare the bearer token to service role');
    assert.match(source, /internal service authorization required/, 'must fail closed with the internal-auth error');
    assert.match(source, /,401\)/, 'unauthorized callers must receive 401');
    assert.match(source, /x-cuhalide-endpoint-state['"]\s*:\s*['"]internal-service-only/, 'must self-identify as internal-service-only');
    assert.match(source, /noindex, nofollow, noarchive/, 'internal responses must remain non-indexable and non-archivable');
    assert.ok(source.includes(expectedVersion), `must mirror deployed version ${expectedVersion}`);
    assert.doesNotMatch(source, /cuhalide-atlas-public-data-v2/, 'production internal RAG must not depend on retired Public Data v2');
  });
}

test('production internal RAG chain is explicit in repository source', async () => {
  const unified = await readFile('supabase/functions/cuhalide-atlas-current-rag-r7-unified-internal/index.ts', 'utf8');
  const science = await readFile('supabase/functions/cuhalide-atlas-current-rag-r7-science-exact-internal/index.ts', 'utf8');
  const exact = await readFile('supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts', 'utf8');
  const r6 = await readFile('supabase/functions/cuhalide-atlas-current-rag-r6-exact-internal/index.ts', 'utf8');
  const r1 = await readFile('supabase/functions/cuhalide-atlas-current-rag-r1-internal/index.ts', 'utf8');

  assert.match(unified, /cuhalide-atlas-current-rag-r7-science-exact-internal/);
  assert.match(science, /cuhalide-atlas-current-rag-r7-exact-internal/);
  assert.match(exact, /cuhalide-atlas-current-rag-r6-exact-internal/);
  assert.match(r6, /cuhalide-atlas-current-rag-r1-internal/);
  assert.match(r1, /cuhalide-atlas-public-data-v3/, 'terminal fallback must use canonical Public Data v3');
});
