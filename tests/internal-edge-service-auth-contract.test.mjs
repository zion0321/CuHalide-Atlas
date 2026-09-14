import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const ACTIVE=[
  ['conversation','supabase/functions/cuhalide-atlas-conversation-v1-internal/index.ts','1.0.2'],
  ['r10 unified','supabase/functions/cuhalide-atlas-current-rag-r10-unified-internal/index.ts','current-rag-r10.0.0'],
  ['r10 science exact','supabase/functions/cuhalide-atlas-current-rag-r10-science-exact-internal/index.ts','current-rag-r10-science-exact-1.0.1'],
  ['r9 unified recovery','supabase/functions/cuhalide-atlas-current-rag-r9-unified-internal/index.ts','current-rag-r9.0.1'],
  ['r9 science exact recovery','supabase/functions/cuhalide-atlas-current-rag-r9-science-exact-internal/index.ts','current-rag-r9-science-exact-1.0.1'],
  ['r8 unified recovery','supabase/functions/cuhalide-atlas-current-rag-r8-unified-internal/index.ts','current-rag-r8.0.0'],
  ['r8 science exact recovery','supabase/functions/cuhalide-atlas-current-rag-r8-science-exact-internal/index.ts','current-rag-r8-science-exact-1.0.0'],
  ['r8 exact recovery','supabase/functions/cuhalide-atlas-current-rag-r8-exact-internal/index.ts','current-rag-r8-exact-1.0.0'],
  ['r7 unified recovery','supabase/functions/cuhalide-atlas-current-rag-r7-unified-internal/index.ts','current-rag-r7.2.5'],
  ['r7 science exact recovery','supabase/functions/cuhalide-atlas-current-rag-r7-science-exact-internal/index.ts','current-rag-r7-science-exact-1.1.1'],
  ['r7 exact recovery','supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts','current-rag-r7.0.8'],
  ['r6 exact fallback','supabase/functions/cuhalide-atlas-current-rag-r6-exact-internal/index.ts','current-rag-r6.0.3'],
  ['r1 fallback','supabase/functions/cuhalide-atlas-current-rag-r1-internal/index.ts','current-rag-r4.0.4'],
];

const RETIRED=[
  ['r4 unified legacy wrapper','supabase/functions/cuhalide-atlas-current-rag-r1-unified-internal/index.ts','retired-current-rag-r4-unified-1'],
  ['r5 exact legacy wrapper','supabase/functions/cuhalide-atlas-current-rag-r5-exact-internal/index.ts','retired-current-rag-r5-exact-1'],
  ['r5 unified legacy wrapper','supabase/functions/cuhalide-atlas-current-rag-r5-unified-internal/index.ts','retired-current-rag-r5-unified-1'],
  ['r6 unified legacy wrapper','supabase/functions/cuhalide-atlas-current-rag-r6-unified-internal/index.ts','retired-current-rag-r6-unified-1'],
];

async function assertServiceAuth(path,expectedVersion){
  const source=await readFile(path,'utf8');
  assert.match(source,/SUPABASE_SERVICE_ROLE_KEY/,'must bind the service-role secret');
  assert.match(source,/req?\.?headers\.get\(['"]authorization['"]\)|r\.headers\.get\(['"]authorization['"]\)/,'must inspect Authorization');
  assert.match(source,/req?\.?headers\.get\(['"]apikey['"]\)|r\.headers\.get\(['"]apikey['"]\)/,'must inspect apikey');
  assert.match(source,/Bearer \$\{(?:KEY|SERVICE)\}/,'must compare the bearer token to service role');
  assert.match(source,/internal service authorization required/,'must fail closed with the internal-auth error');
  assert.match(source,/(?:,401\)|status:401)/,'unauthorized callers must receive 401');
  assert.match(source,/noindex, nofollow, noarchive/,'internal responses must remain non-indexable and non-archivable');
  assert.ok(source.includes(expectedVersion),`must mirror deployed version ${expectedVersion}`);
  assert.doesNotMatch(source,/cuhalide-atlas-public-data-v2/,'internal RAG must not depend on retired Public Data v2');
  return source;
}

for(const[name,path,expectedVersion]of ACTIVE){
  test(`${name} is repository-backed and service-only`,async()=>{
    const source=await assertServiceAuth(path,expectedVersion);
    assert.match(source,/x-cuhalide-endpoint-state['"]\s*:\s*['"]internal-service-only/,'active/recovery internal functions must self-identify as internal-service-only');
  });
}

for(const[name,path,expectedVersion]of RETIRED){
  test(`${name} is repository-backed, service-only, and inert`,async()=>{
    const source=await assertServiceAuth(path,expectedVersion);
    assert.match(source,/x-cuhalide-endpoint-state['"]\s*:\s*['"]retired-internal-service-only/,'retired wrapper must identify itself as retired');
    assert.match(source,/status:'retired'/,'retired wrapper must return retired status');
    assert.match(source,/,(?:410)\)|status:410/,'authorized calls to retired wrappers must return 410');
    assert.doesNotMatch(source,/functions\/v1\/cuhalide-atlas-current-rag-/,'retired wrappers must not delegate to another RAG function');
    assert.doesNotMatch(source,/api\.cloudflare\.com/,'retired wrappers must not invoke model providers');
    assert.doesNotMatch(source,/\/rest\/v1\//,'retired wrappers must not query the database');
  });
}

test('production internal RAG chain is explicit as rev.10 with locked recovery layers beneath it',async()=>{
  const smart=await readFile('supabase/functions/cuhalide-atlas-smart-rag-v302-current-public/index.ts','utf8');
  const r10u=await readFile('supabase/functions/cuhalide-atlas-current-rag-r10-unified-internal/index.ts','utf8');
  const r10s=await readFile('supabase/functions/cuhalide-atlas-current-rag-r10-science-exact-internal/index.ts','utf8');
  const r9s=await readFile('supabase/functions/cuhalide-atlas-current-rag-r9-science-exact-internal/index.ts','utf8');
  const r8s=await readFile('supabase/functions/cuhalide-atlas-current-rag-r8-science-exact-internal/index.ts','utf8');
  const r7s=await readFile('supabase/functions/cuhalide-atlas-current-rag-r7-science-exact-internal/index.ts','utf8');
  const r7e=await readFile('supabase/functions/cuhalide-atlas-current-rag-r7-exact-internal/index.ts','utf8');
  const r6=await readFile('supabase/functions/cuhalide-atlas-current-rag-r6-exact-internal/index.ts','utf8');
  const r1=await readFile('supabase/functions/cuhalide-atlas-current-rag-r1-internal/index.ts','utf8');

  assert.match(smart,/cuhalide-atlas-current-rag-r10-unified-internal/);
  assert.match(smart,/CURRENT_RELEASE='current-curated-r10'/);
  assert.match(smart,/REV=10/);
  assert.match(smart,/DOCS=1322/);
  assert.match(r10u,/cuhalide-atlas-current-rag-r10-science-exact-internal/);
  assert.match(r10u,/CURRENT='current-curated-r10'/);
  assert.match(r10u,/DOCS=1322/);
  assert.match(r10s,/cuhalide-atlas-current-rag-r9-science-exact-internal/,'rev.10 science wrapper may use locked rev.9 structured implementation while patching rev.10 metadata');
  assert.match(r10s,/CURRENT='current-curated-r10'/);
  assert.match(r9s,/cuhalide-atlas-current-rag-r8-science-exact-internal/);
  assert.match(r8s,/cuhalide-atlas-current-rag-r7-science-exact-internal/);
  assert.match(r7s,/cuhalide-atlas-current-rag-r7-exact-internal/);
  assert.match(r7e,/cuhalide-atlas-current-rag-r6-exact-internal/);
  assert.match(r6,/cuhalide-atlas-current-rag-r1-internal/);
  assert.match(r1,/cuhalide-atlas-public-data-v3/,'terminal fallback must use canonical Public Data v3');
});

test('rev.10 science exact preserves explicit multi-structure identifier routing',async()=>{
  const source=await readFile('supabase/functions/cuhalide-atlas-current-rag-r10-science-exact-internal/index.ts','utf8');
  assert.ok(source.includes("VERSION='current-rag-r10-science-exact-1.0.1'"));
  assert.match(source,/const ID_RE=\/CUH-/,'must recognize explicit CUH structure identifiers');
  assert.match(source,/function idsFrom\(/,'must enumerate all explicit structure identifiers');
  assert.match(source,/function targetBody\(/,'must isolate each identifier for deterministic exact retrieval');
  assert.match(source,/Promise\.all\(ids\.map/,'must execute deterministic exact retrieval for every requested identifier');
  assert.match(source,/multi_identifier:ids\.length>1/,'must expose multi-identifier response state');
  assert.match(source,/requested_structure_ids:ids/,'must report the exact identifier set that was evaluated');
  assert.ok(source.includes('current\\s+curated'),'must strip Current Curated temporal prefaces before identifier-specific exact routing');
  assert.ok(source.includes("answers.join('\\n')"),'must preserve every per-identifier exact answer in the combined response');
});

test('candidate monitor is a repository-backed service-only curation endpoint',async()=>{
  const source=await readFile('supabase/functions/cuhalide-atlas-candidates-v2/index.ts','utf8');
  assert.match(source,/VERSION='2\.3\.1'/);
  assert.match(source,/SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(source,/internal service authorization required/);
  assert.match(source,/(?:,401\)|status:401)/);
  assert.match(source,/x-cuhalide-endpoint-state':'internal-service-only'/);
  assert.match(source,/noindex, nofollow, noarchive/);
  assert.match(source,/if\(!\['GET','HEAD'\]\.includes\(req\.method\)\)/,'candidate monitor must remain read-only');
});

test('obsolete Release 3.0.0 RAG indexer is an inert service-only tombstone',async()=>{
  const source=await readFile('supabase/functions/cuhalide-atlas-rag-indexer/index.ts','utf8');
  assert.match(source,/retired-rag-indexer-release-3\.0\.0-1/);
  assert.match(source,/SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(source,/internal service authorization required/);
  assert.match(source,/(?:,401\)|status:401)/);
  assert.match(source,/x-cuhalide-endpoint-state':'retired-internal-service-only'/);
  assert.match(source,/noindex, nofollow, noarchive/);
  assert.match(source,/status:'retired'/);
  assert.match(source,/,(?:410)\)|status:410/);
  assert.doesNotMatch(source,/api\.cloudflare\.com/);
  assert.doesNotMatch(source,/\/rest\/v1\//);
  assert.doesNotMatch(source,/rag_embeddings/);
});
