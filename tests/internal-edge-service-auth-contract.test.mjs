import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ACTIVE = [
  ['conversation', 'supabase/functions/cuhalide-atlas-conversation-v1-internal/index.ts', '1.0.2'],
  ['r7 unified', 'supabase/functions/cuhalide-atlas-current-rag-r7-unified-internal/index.ts', 'current-rag-r7.2.1'],
  ['r7 science exact', 'supabase/functions/cuhalide-atlas-current-rag-r7-science-exact-internal/index.ts', 'current-rag-r7-science-exact-1.1.1'],
  ['r7 exact', 'supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts', 'current-rag-r7.0.8'],
  ['r6 exact fallback', 'supabase/functions/cuhalide-atlas-current-rag-r6-exact-internal/index.ts', 'current-rag-r6.0.3'],
  ['r1 fallback', 'supabase/functions/cuhalide-atlas-current-rag-r1-internal/index.ts', 'current-rag-r4.0.4'],
];

const RETIRED = [
  ['r4 unified legacy wrapper', 'supabase/functions/cuhalide-atlas-current-rag-r1-unified-internal/index.ts', 'retired-current-rag-r4-unified-1'],
  ['r5 exact legacy wrapper', 'supabase/functions/cuhalide-atlas-current-rag-r5-exact-internal/index.ts', 'retired-current-rag-r5-exact-1'],
  ['r5 unified legacy wrapper', 'supabase/functions/cuhalide-atlas-current-rag-r5-unified-internal/index.ts', 'retired-current-rag-r5-unified-1'],
  ['r6 unified legacy wrapper', 'supabase/functions/cuhalide-atlas-current-rag-r6-unified-internal/index.ts', 'retired-current-rag-r6-unified-1'],
];

async function assertServiceAuth(path, expectedVersion) {
  const source = await readFile(path, 'utf8');
  assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/, 'must bind the service-role secret');
  assert.match(source, /req\.headers\.get\(['"]authorization['"]\)/, 'must inspect Authorization');
  assert.match(source, /req\.headers\.get\(['"]apikey['"]\)/, 'must inspect apikey');
  assert.match(source, /Bearer \$\{(?:KEY|SERVICE)\}/, 'must compare the bearer token to service role');
  assert.match(source, /internal service authorization required/, 'must fail closed with the internal-auth error');
  assert.match(source, /,401\)/, 'unauthorized callers must receive 401');
  assert.match(source, /noindex, nofollow, noarchive/, 'internal responses must remain non-indexable and non-archivable');
  assert.ok(source.includes(expectedVersion), `must mirror deployed version ${expectedVersion}`);
  assert.doesNotMatch(source, /cuhalide-atlas-public-data-v2/, 'internal RAG must not depend on retired Public Data v2');
  return source;
}

for (const [name, path, expectedVersion] of ACTIVE) {
  test(`${name} is repository-backed and service-only`, async () => {
    const source = await assertServiceAuth(path, expectedVersion);
    assert.match(source, /x-cuhalide-endpoint-state['"]\s*:\s*['"]internal-service-only/, 'active internal functions must self-identify as internal-service-only');
  });
}

for (const [name, path, expectedVersion] of RETIRED) {
  test(`${name} is repository-backed, service-only, and inert`, async () => {
    const source = await assertServiceAuth(path, expectedVersion);
    assert.match(source, /x-cuhalide-endpoint-state['"]\s*:\s*['"]retired-internal-service-only/, 'retired wrapper must identify itself as retired');
    assert.match(source, /status:'retired'/, 'retired wrapper must return retired status');
    assert.match(source, /,410\)/, 'authorized calls to retired wrappers must return 410');
    assert.doesNotMatch(source, /functions\/v1\/cuhalide-atlas-current-rag-/, 'retired wrappers must not delegate to another RAG function');
    assert.doesNotMatch(source, /api\.cloudflare\.com/, 'retired wrappers must not invoke model providers');
    assert.doesNotMatch(source, /\/rest\/v1\//, 'retired wrappers must not query the database');
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

test('candidate monitor is a repository-backed service-only curation endpoint', async () => {
  const source=await readFile('supabase/functions/cuhalide-atlas-candidates-v2/index.ts','utf8');
  assert.match(source,/VERSION='2\.3\.1'/);
  assert.match(source,/SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(source,/req\.headers\.get\(['"]authorization['"]\)/);
  assert.match(source,/req\.headers\.get\(['"]apikey['"]\)/);
  assert.match(source,/internal service authorization required/);
  assert.match(source,/,401\)/);
  assert.match(source,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(source,/noindex, nofollow, noarchive/);
  assert.match(source,/abstract/,'internal service may retain candidate abstracts for curation');
  assert.match(source,/review_notes/,'internal service may retain review notes for curation');
  assert.match(source,/source_payload/,'internal service may retain source payload for curation');
  assert.match(source,/if\(!\['GET','HEAD'\]\.includes\(req\.method\)\)/,'candidate monitor must remain read-only');
});

test('obsolete Release 3.0.0 RAG indexer is an inert service-only tombstone', async () => {
  const source=await readFile('supabase/functions/cuhalide-atlas-rag-indexer/index.ts','utf8');
  assert.match(source,/retired-rag-indexer-release-3\.0\.0-1/);
  assert.match(source,/SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(source,/req\.headers\.get\(['"]authorization['"]\)/);
  assert.match(source,/req\.headers\.get\(['"]apikey['"]\)/);
  assert.match(source,/internal service authorization required/);
  assert.match(source,/,401\)/);
  assert.match(source,/x-cuhalide-endpoint-state':'retired-internal-service-only'/);
  assert.match(source,/noindex, nofollow, noarchive/);
  assert.match(source,/status:'retired'/);
  assert.match(source,/,410\)/);
  assert.doesNotMatch(source,/api\.cloudflare\.com/,'retired indexer must not call the embedding provider');
  assert.doesNotMatch(source,/\/rest\/v1\//,'retired indexer must not access the database');
  assert.doesNotMatch(source,/rag_embeddings/,'retired indexer must not write embeddings');
});
