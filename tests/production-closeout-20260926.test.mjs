import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('publication metadata uses the 410 article denominator and source-layer DOI terminology',()=>{
  const citation=read('CITATION.cff');
  const readme=read('README.md');
  const license=read('LICENSE_STATUS.md');
  assert.match(citation,/410 articles/);
  assert.match(citation,/403 DOI records in the v2 source layer/);
  assert.doesNotMatch(citation,/covering 403 articles/);
  assert.match(readme,/Current Curated structured-data revision metric/);
  assert.match(readme,/387 articles have searchable source prose/);
  assert.match(readme,/384 DOI records have native searchable v2 text/);
  assert.match(license,/Current Curated rev\.10/);
  assert.doesNotMatch(license,/Current Curated rev\.8/);
});

test('CuXplore identity is synchronized across public guidance and health monitoring',()=>{
  const exp=read('api/export.js');
  const monitor=read('.github/workflows/free-tier-health-monitor.yml');
  const runtime=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts');
  assert.match(exp,/record pages, CuXplore, citation metadata/);
  assert.doesNotMatch(exp,/Research Assistant/);
  assert.match(monitor,/Check CuXplore contract/);
  assert.match(monitor,/CuXplore contract: PASS/);
  assert.match(runtime,/service:'CuXplore',display_name:'CuXplore',knowledge_contract:'1\.3\.0'/);
  assert.doesNotMatch(runtime,/knowledge_contract:'1\.2\.0'/);
});

test('frozen blind execution endpoints are inert provenance tombstones',()=>{
  for(const path of [
    'supabase/functions/cuhalide-blind-cation-recommender-20260925/index.ts',
    'supabase/functions/cuhalide-blind-pair-adjudicator-20260925/index.ts'
  ]){
    const src=read(path);
    assert.match(src,/status:'retired'/);
    assert.match(src,/frozen_on:'2026-09-25'/);
    assert.match(src,/immutable_records_retained:true/);
    assert.match(src,/rerun_enabled:false/);
    assert.match(src,/status:410/);
    assert.doesNotMatch(src,/searchParams\.get\(['"]token['"]\)/);
    assert.doesNotMatch(src,/CLOUDFLARE_API_TOKEN|SUPABASE_SERVICE_ROLE_KEY|api\.cloudflare\.com/);
  }
});

test('CuXplore query acceleration remains service-only and refreshable',()=>{
  const migration=read('supabase/migrations/20260926_cuxplore_query_path_hardening.sql');
  assert.match(migration,/cuxplore_catalog_doi_snapshot_v1/);
  assert.match(migration,/cuxplore_processing_coverage_snapshot_v1/);
  assert.match(migration,/cuxplore_refresh_query_snapshots_v1/);
  assert.match(migration,/revoke all on atlas_internal\.cuxplore_catalog_doi_snapshot_v1 from public, anon, authenticated/);
  assert.match(migration,/revoke all on function public\.cuxplore_knowledge_v1\(text,text,text,integer,integer\) from public, anon, authenticated/);
  assert.match(migration,/grant execute on function public\.cuxplore_knowledge_v1\(text,text,text,integer,integer\) to service_role/);
  assert.match(migration,/join atlas_internal\.cuxplore_catalog_doi_snapshot_v1 k on k\.doi=lower\(d\.doi\)/);
});

test('legacy public-data bridge is hardened while remaining internal-only',()=>{
  const src=read('supabase/functions/cuhalide-atlas-public-data-v302-public/index.ts');
  assert.match(src,/VERSION='2\.13\.1',REV='10'/);
  assert.match(src,/REQUEST_TIMEOUT_MS=12000,RETRIES=3/);
  assert.match(src,/internal upstream requires service authorization/);
  assert.match(src,/Current Curated rev\.10/);
});

test('Lighthouse retries only pre-report capture/navigation failures without weakening thresholds',()=>{
  const script=read('scripts/production-lighthouse.sh');
  assert.match(script,/ERR_CONTENT_DECODING_FAILED/);
  assert.match(script,/FAILED_DOCUMENT_REQUEST/);
  assert.match(script,/net::ERR_/);
  assert.match(script,/NO_NAVSTART/);
  assert.match(script,/without changing any quality threshold/);
  assert.match(script,/non-retryable reason; refusing to retry or weaken the quality gate/);
  assert.match(script,/node scripts\/assert-lighthouse\.mjs/);
});

test('portal HTML disables intermediary representation transforms across rewrite boundaries',()=>{
  const ui=read('api/ui-r10.js');
  const vercel=JSON.parse(read('vercel.json'));
  assert.match(ui,/Cache-Control','no-store, no-transform, max-age=0, must-revalidate'/);
  assert.match(ui,/if\(n==='cache-control'\)v='no-store, no-transform, max-age=0, must-revalidate'/);
  for(const source of ['/','/index.html']){
    const rule=vercel.headers.find(x=>x.source===source);
    assert.ok(rule,source+' header rule missing');
    const cc=rule.headers.find(h=>String(h.key).toLowerCase()==='cache-control');
    assert.equal(cc?.value,'no-store, no-transform, max-age=0, must-revalidate');
  }
});

test('middleware strips stale transfer metadata after fetch decodes upstream bodies',()=>{
  const middleware=read('middleware.js');
  assert.match(middleware,/const headers=new Headers\(response\.headers\)/);
  assert.match(middleware,/\['content-encoding','content-length','transfer-encoding'\]/);
  assert.match(middleware,/headers\.delete\(h\)/);
  assert.match(middleware,/new Response\(request\.method==='HEAD'\?null:response\.body/);
});

test('Site 52 response metadata cannot regress behind the rev.10 content date',()=>{
  const ui=read('api/ui-r10.js');
  assert.match(ui,/CONTENT_DATE='2026-09-25'/);
  assert.match(ui,/const LAST_MODIFIED=new Date/);
  assert.match(ui,/res\.setHeader\('Last-Modified',LAST_MODIFIED\)/);
  assert.match(ui,/if\(n==='last-modified'\)v=LAST_MODIFIED/);
});

test('middleware rewraps decoded upstream bodies without stale compression metadata',async()=>{
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>new Response('<!doctype html><p>decoded</p>',{
    status:200,
    headers:{
      'content-type':'text/html; charset=utf-8',
      'content-encoding':'br',
      'content-length':'999',
      'transfer-encoding':'chunked'
    }
  });
  try{
    const {default:middleware}=await import('../middleware.js?decoded-body-contract=1');
    const response=await middleware(new Request('https://example.test/'));
    assert.equal(response.status,200);
    assert.equal(response.headers.get('content-encoding'),null);
    assert.equal(response.headers.get('content-length'),null);
    assert.equal(response.headers.get('transfer-encoding'),null);
    assert.equal(response.headers.get('content-type'),'text/html; charset=utf-8');
    assert.equal(await response.text(),'<!doctype html><p>decoded</p>');
  }finally{
    globalThis.fetch=originalFetch;
  }
});

test('local candidate runtime matches the production response metadata date',()=>{
  const local=read('scripts/local-candidate-server.mjs');
  assert.match(local,/new Date\('2026-09-25T00:00:00Z'\)\.toUTCString\(\)/);
  assert.doesNotMatch(local,/new Date\('2026-09-14T00:00:00Z'\)\.toUTCString\(\)/);
});

test('CuXplore query snapshot refresh is recorded as an idempotent hourly maintenance job',()=>{
  const sql=read('supabase/migrations/20260926_cuxplore_query_snapshot_refresh_cron.sql');
  assert.match(sql,/jobname\s*=\s*'cuxplore-query-snapshot-refresh'/);
  assert.match(sql,/cron\.unschedule\(existing_job\.jobid\)/);
  assert.match(sql,/cron\.schedule\(/);
  assert.match(sql,/'37 \* \* \* \*'/);
  assert.match(sql,/atlas_internal\.cuxplore_refresh_query_snapshots_v1\(\)/);
});

test('public knowledge and retired export endpoints expose the same Site 52 revision headers',()=>{
  const knowledge=read('api/knowledge.js');
  const exp=read('api/export.js');
  for(const src of [knowledge,exp]){
    assert.match(src,/X-CuHalide-Current-Curated-Revision/);
    assert.match(src,/X-CuHalide-Site-Version/);
    assert.match(src,/X-CuHalide-UI-Version/);
  }
  assert.match(knowledge,/REV='10',SITE='52',UI='52\.0',STATE='prepublication-review'/);
  assert.match(exp,/REV='10',SITE='52',UI='52\.0'/);
});

test('Site 52.4 UX polish keeps evidence browsing clear and stateful',()=>{
  const ux=read('public/ui-ux-core-v1.js');
  const uxBoot=read('public/ui-ux-v1.js');
  const filters=read('public/ui-v51-core.js');
  const quality=read('public/ui-quality-v52.js');
  const ui=read('api/ui-r10.js');

  assert.match(ux,/document\.createElement\('a'\).*chip\.href='#citation'/s);
  assert.match(ux,/aria-label','Prepublication review — learn how to interpret the current data state'/);
  assert.match(ux,/input\.setAttribute\('aria-describedby','uxHeroSearchHint'\)/);
  assert.match(ux,/hint\.id='uxHeroSearchHint'/);

  assert.match(filters,/\['Current canonical','Core - Verified'\]\.includes\(release\)/);
  assert.match(filters,/className='ui-filter-status'/);
  assert.match(filters,/class="ui-filter-clear"/);
  assert.match(filters,/ui-has-active-filters/);

  assert.match(quality,/ui-collection-progress/);
  assert.match(quality,/Updating results…/);
  assert.match(quality,/No matching polar structures\. Adjust or clear the filters\./);
  assert.match(quality,/cuhalideQuality='52\.4'/);

  assert.match(uxBoot,/ui-ux-core-v1\.js\?v=52\.4/);
  assert.match(ui,/ui-ux-v1\.css\?v=52\.3/);
  assert.match(ui,/ui-ux-v1\.js\?v=52\.4/);
  assert.match(ui,/ui-v51-core\.css\?v=52\.3/);
  assert.match(ui,/ui-v51-core\.js\?v=52\.3/);
  assert.match(ui,/ui-quality-v52\.css\?v=52\.4/);
  assert.match(ui,/ui-quality-v52\.js\?v=52\.4/);
});

test('homepage uses the 410-article literature timeline and hides secondary audit dashboards',()=>{
  const html=read('public/index.html');
  const quality=read('public/ui-quality-v52.js');
  const css=read('public/ui-quality-v52.css');
  const ui=read('api/ui-r10.js');
  assert.match(html,/o\.literature_years\|\|o\.years/);
  assert.match(ui,/Literature publications by year/);
  assert.match(ui,/DOI-deduplicated literature corpus · 2006–2026 · 2026 partial/);
  assert.match(quality,/ui-home-secondary-hidden/);
  assert.match(quality,/Current curated data/);
  assert.match(quality,/Updated 14 Sep 2026/);
  assert.match(css,/\.ui-home-timeline \.bar b\{display:none\}/);
  assert.match(css,/\.ui-home-secondary-hidden\{display:none!important\}/);
});
