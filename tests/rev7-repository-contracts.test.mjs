import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');
const json=p=>JSON.parse(read(p));

test('canonical public runtime exposes one rev.7 contract',()=>{
  const pkg=json('package.json'),vercel=json('vercel.json'),site=read('api/ui-site.js'),assistantCurrent=read('api/ui-assistant-current.js'),recordCurrent=read('api/record-current.js'),recordEvidence=read('api/record-evidence-current.js'),candidate=read('scripts/local-candidate-server.mjs');
  assert.equal(pkg.version,'1.2.0');
  assert.ok(site.includes("CURRENT_REVISION='7'"));
  assert.ok(assistantCurrent.includes("CURRENT_REVISION='7'"));
  assert.ok(recordCurrent.includes("CURRENT_REVISION='7'"));
  assert.match(recordEvidence,/record-current\.js/);
  assert.match(candidate,/record-evidence-current\.js/);
  const route=source=>vercel.rewrites.find(x=>x.source===source)?.destination;
  assert.equal(route('/'),'/api/ui-assistant-current');
  assert.equal(route('/index.html'),'/api/ui-assistant-current');
  assert.equal(route('/api/site'),'/api/ui-assistant-current');
  assert.equal(route('/article/:id'),'/api/record-evidence-current?kind=article&id=:id');
  assert.equal(route('/structure/:id'),'/api/record-evidence-current?kind=structure&id=:id');
});

test('README is locked to the same rev.7 living scientific state',()=>{
  const r=read('README.md');
  for(const token of ['Site v50','UI 50.2','Metadata gateway 50.4','Public Data 2.16.0','Structured Photophysics 1.3.0','Organic Components 1.1.0','Smart RAG 9.19.0','Research Assistant 10.4.1','Motif Atlas 1.2','383 article audit records','369 canonical verified articles','946 structure / phase rows','886 Core-Included structure rows','710 resolved space-group rows','684 verified one-to-one space-group mappings','97 verified polar structure rows','87 strict-polar structure rows','54 strict-polar articles','1,329 BGE-M3 documents / 1,329 embeddings'])assert.ok(r.includes(token),`README missing ${token}`);
});

test('prepublication repository metadata cannot claim formal public release',()=>{
  const code=json('codemeta.json'),cff=read('CITATION.cff');
  assert.equal(code.version,'prepublication-current-r7');
  assert.equal(code.datePublished,undefined);
  assert.equal(code.license,undefined);
  assert.match(code.description,/prepublication review/i);
  assert.match(cff,/prepublication review resource/i);
  assert.match(cff,/formal public-release date/i);
});

test('public repository tracks no private evidence, bulk-data, archive or credential file types',()=>{
  const files=JSON.parse(read('tests/repository-file-list.json'));
  for(const p of files){assert.doesNotMatch(p,/(?:^|\/)(?:\.env|private|secrets?|credentials?)(?:\.|\/|$)/i);assert.doesNotMatch(p,/\.(?:pdf|cif|xlsx|xls|csv|zip|tar|gz|7z)$/i)}
});

test('preview QA has one PR trigger while Vercel deployment status remains independently mandatory',()=>{
  const wf=read('.github/workflows/vercel-preview-qa.yml'),gate=read('tests/vercel-production-gate.test.mjs');
  assert.equal((wf.match(/pull_request:/g)||[]).length,1);
  assert.match(wf,/attest candidate provenance/i);
  assert.match(gate,/Vercel/);
});

test('canonical routes terminate at rev.7 evidence wrappers, not historical renderer provenance',()=>{
  const config=json('vercel.json'),middleware=read('middleware.js');
  const route=source=>config.rewrites.find(x=>x.source===source)?.destination;
  assert.equal(route('/article/:id'),'/api/record-evidence-current?kind=article&id=:id');
  assert.equal(route('/structure/:id'),'/api/record-evidence-current?kind=structure&id=:id');
  assert.equal(route('/api/record'),'/api/record-evidence-current');
  assert.equal(route('/api/record-current'),'/api/record-evidence-current');
  assert.match(middleware,/record-evidence-current/);
});

test('Vercel Pro serverless surface stays bounded while base renderer stays internal',()=>{
  const config=json('vercel.json'),api=JSON.parse(read('tests/api-file-list.json'));
  assert.ok(api.length<=13,`API function count ${api.length} exceeds bounded surface`);
  assert.ok(api.includes('api/record.js'));
  assert.ok(api.includes('api/record-current.js'));
  assert.ok(api.includes('api/record-evidence-current.js'));
  assert.equal(config.functions?.['api/record.js'],undefined);
});

test('rev.7 wrappers normalize living UI and staged photophysics provenance without rewriting validated base renderers',()=>{
  const site=read('api/ui-site.js'),assistant=read('api/ui-assistant-current.js'),record=read('api/record-current.js'),evidence=read('api/record-evidence-current.js');
  for(const s of [site,assistant,record])assert.match(s,/CURRENT_REVISION='7'/);
  assert.match(record,/PHOTOPHYSICS_CONTRACT='1\.3\.0'/);
  assert.match(evidence,/Parent article · Two-pass verified/);
});

test('metadata health and manifest carry exact rev.7 denominators and staged verification policy',()=>{
  const meta=read('api/meta.js'),manifest=json('public/release-manifest.json');
  for(const token of ['383','369','946','886','710','684','97','87','54','1329'])assert.ok(meta.includes(token),`meta missing ${token}`);
  assert.equal(manifest.public_access.release_state,'prepublication');
  assert.equal(manifest.public_access.indexing,'disabled-prepublication');
  assert.equal(manifest.public_access.bulk_export,false);
});

test('assistant proxy exposes rev.7 / 10.4 / 9.19 while preserving non-idempotent retry guard',()=>{
  const a=read('api/agent.js');
  for(const token of ["CURRENT_REVISION='7'","ASSISTANT_VERSION='10.4.1'","RAG_VERSION='9.19.0'"])assert.ok(a.includes(token));
  assert.match(a,/method==='POST'/);
});

test('Motif Atlas reflects the adjudicated rev.7 taxonomy without formula completion',()=>{
  const m=read('api/motifs.js');
  for(const token of ["CURRENT_REVISION='7'",'946','628','318'])assert.ok(m.includes(token));
  assert.doesNotMatch(m,/arithmetic.*repair/i);
});

test('sitemap denominators remain canonical and revision provenance advances only',()=>{
  const sitemap=read('api/sitemap.js');
  for(const token of ["CONTENT_DATE='2026-08-19'","CURRENT_REVISION='7'",'EXPECTED_ARTICLES=369','EXPECTED_STRUCTURES=886','EXPECTED_URLS=1257'])assert.ok(sitemap.includes(token));
});

test('legacy data route remains compatibility-only and delegates to the current canonical contract',()=>{
  const data=read('api/data.js'),publicData=read('api/public-data.js');
  for(const token of ["import publicDataHandler from './public-data.js'",'prefer /api/public-data','return publicDataHandler(req,res)'])assert.ok(data.includes(token),`legacy data contract missing ${token}`);
  assert.doesNotMatch(data,/supabase\.co\/functions\/v1/);
  for(const token of ["PUBLIC_DATA_VERSION='2.16.0'","CURRENT_REVISION='7'","PHOTOPHYSICS_CONTRACT='1.3.0'",'cuhalide-atlas-public-data-v3'])assert.ok(publicData.includes(token),`canonical public-data missing ${token}`);
  assert.match(publicData,/response\.status===429/);
});

test('Lighthouse gate preserves quality while enforcing intentional prepublication noindex',()=>{
  const gate=read('scripts/assert-lighthouse.mjs');
  assert.match(gate,/noindex/i);
});

test('public privacy boundary remains query-and-view while verification stage is explicit',()=>{
  const readme=read('README.md'),exportRoute=read('api/export.js');
  assert.match(readme,/query-and-view/i);
  assert.match(exportRoute,/410/);
  assert.match(readme,/Pass A curated/);
  assert.match(readme,/two_pass_verified/);
});
