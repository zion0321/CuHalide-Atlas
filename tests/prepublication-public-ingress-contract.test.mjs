import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('prepublication sitemap is deliberately non-enumerating',()=>{
  const sitemap=read('api/sitemap.js');
  assert.match(sitemap,/const URLS=\[\{loc:`\$\{PUBLIC_ORIGIN\}\/`,priority:'1\.0'\},\{loc:`\$\{PUBLIC_ORIGIN\}\/motifs`,priority:'0\.9'\}\]/);
  assert.match(sitemap,/prepublication-non-enumerating/);
  assert.match(sitemap,/Cache-Control','no-store, max-age=0'/);
  assert.ok(!sitemap.includes('/article/${'), 'sitemap must not enumerate article records');
  assert.ok(!sitemap.includes('/structure/${'), 'sitemap must not enumerate structure records');
  assert.ok(!sitemap.includes('fetchIndex'), 'sitemap must not fetch a bulk record index during prepublication review');

  const runtime=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts');
  assert.match(runtime,/enumeration:false/);
  assert.match(runtime,/record_urls_exposed:false/);
  assert.match(runtime,/route_count:2/);
  assert.match(runtime,/public_routes:\['\/','\/motifs'\]/);
  assert.match(runtime,/prepublication_record_sitemap_enumeration_disabled:true/);
});

test('canonical public data is allowlisted and clamps browse-sized motif results',()=>{
  for(const path of ['api/public-data.js','supabase/functions/cuhalide-atlas-public-data-v3/index.ts']){
    const source=read(path);
    assert.match(source,/PUBLIC_ACTIONS=new Set\(/,`${path} must define an explicit public action allowlist`);
    assert.match(source,/unknown public action/);
    assert.match(source,/Math\.min\(24,/,'Motif Atlas public result window must be capped at 24');
  }
  const edge=read('supabase/functions/cuhalide-atlas-public-data-v3/index.ts');
  assert.match(edge,/noindex, nofollow, noarchive/);
  assert.match(edge,/x-cuhalide-publication-state/);
  assert.match(edge,/const upstreamHeaders=\{\.\.\.AUTH/,'canonical v3 must authenticate its legacy internal upstream');
});

test('deprecated public-data-v2 is motifs-only and cannot restore legacy API semantics',()=>{
  const source=read('supabase/functions/cuhalide-atlas-public-data-v2/index.ts');
  assert.match(source,/action!=='motifs'/);
  assert.match(source,/deprecated compatibility endpoint now serves Motif Atlas only/);
  assert.match(source,/},410\)/);
  assert.match(source,/cuhalide-atlas-public-data-v3/);
  assert.match(source,/Math\.min\(24,/);
  assert.ok(!source.includes('cuhalide-atlas-public-data-v302-public'),'v2 compatibility shim must not bypass canonical v3');
});

test('legacy Supabase upstreams are service-role-only in the versioned source',()=>{
  for(const path of [
    'supabase/functions/cuhalide-atlas-public-data-v302-public/index.ts',
    'supabase/functions/cuhalide-atlas-public-data-v302/index.ts',
    'supabase/functions/cuhalide-atlas-smart-rag-v302-current-public/index.ts',
    'supabase/functions/cuhalide-atlas-smart-rag-v302-public/index.ts',
  ]){
    const source=read(path);
    assert.match(source,/authorization'\)===`Bearer \$\{(?:KEY|SERVICE)\}`/i,`${path} must require the service bearer token`);
    assert.match(source,/get\('apikey'\)===(?:KEY|SERVICE)/,`${path} must require the service apikey`);
    assert.match(source,/internal upstream requires service authorization/);
    assert.match(source,/noindex, nofollow, noarchive/);
  }
});

test('Research Assistant strips caller-controlled top-level parameters at both public ingress layers',()=>{
  const vercel=read('api/agent.js');
  assert.match(vercel,/JSON\.stringify\(\{messages\}\)/);
  assert.ok(!vercel.includes('requestBody(req)'),'Vercel must not forward the raw request object to the assistant');
  const edge=read('supabase/functions/cuhalide-atlas-research-assistant-v1-public/index.ts');
  assert.match(edge,/function normalizeBody\(b:any,mode:string\)\{return JSON\.stringify\(\{messages:messages\(b\),mode,depth:'standard'\}\)\}/);
  assert.ok(!edge.includes('JSON.stringify({...b,messages:'),'Supabase assistant must not spread arbitrary caller fields downstream');
  assert.match(edge,/noindex, nofollow, noarchive/);
  assert.match(edge,/PUBLICATION_STATE='prepublication-review'/);
});

test('versioned Supabase recovery source is synchronized to the rev.7 runtime contract',()=>{
  const runtime=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts');
  assert.match(runtime,/PUBLIC_DATA_VERSION='2\.16\.0'/);
  assert.match(runtime,/EVIDENCE_VERSION='9\.19\.0'/);
  assert.match(runtime,/ASSISTANT_VERSION='10\.4\.1'/);
  assert.match(runtime,/PHOTOPHYSICS_VERSION='1\.3\.0'/);
  assert.match(runtime,/CURRENT_REVISION=7/);
  assert.match(runtime,/SITE_VERSION='50'/);
  assert.match(runtime,/META_VERSION='50\.5'/);
  assert.match(runtime,/rag:1329/);
});
