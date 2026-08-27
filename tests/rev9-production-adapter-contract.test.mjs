import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('rev.9 production adapters expose the validated scientific/runtime contract',()=>{
  const vercel=JSON.parse(read('vercel.json'));
  const rewrites=new Map(vercel.rewrites.map(x=>[x.source,x.destination]));
  assert.equal(rewrites.get('/'),'/api/ui-r9');
  assert.equal(rewrites.get('/api/public-data'),'/api/public-data-r9');
  assert.equal(rewrites.get('/motifs'),'/api/motifs-r9');
  assert.match(rewrites.get('/article/:id'),/record-r9/);
  assert.equal(rewrites.get('/health.json'),'/api/meta-r9?asset=health');

  const ui=read('api/ui-r9.js');
  for(const token of ["REV='9'","UI='51.0'","SITE='51'",'Current Curated rev.9','947 atomic/context structure records','Core-Included · n=887','Smart RAG 9.20.0','Structured Photophysics 1.4.0','Organic Components 1.2.0'])assert.ok(ui.includes(token),`missing UI token: ${token}`);

  const meta=read('api/meta-r9.js');
  for(const token of ["PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'","RAG='9.20.0'","ASSISTANT='10.5.0'","REV='9'",'structure_phase_rows:947','core_included_structure_rows:887','resolved_space_group_rows:744','verified_space_group_rows:717','verified_polar_rows:101','strict_polar_rows:91','strict_polar_articles:57','rag_documents:1330','taxonomy_rows:947','motif_resolved_rows:640','motif_unresolved_rows:307'])assert.ok(meta.includes(token),`missing meta token: ${token}`);

  const data=read('api/public-data-r9.js');
  for(const token of ["REV='9'","VERSION='2.17.1'","PH='1.4.0'","OC='1.2.0'"])assert.ok(data.includes(token),`missing public-data token: ${token}`);

  const record=read('api/record-r9.js');
  assert.ok(record.includes("REV='9',PH='1.4.0',OC='1.2.0'"));
  const motifs=read('api/motifs-r9.js');
  assert.ok(motifs.includes("REV='9'"));
});

test('rev.9 adapter preserves prepublication and privacy boundaries',()=>{
  const meta=read('api/meta-r9.js'),vercel=read('vercel.json');
  assert.match(meta,/prepublication-review/);
  assert.match(meta,/bulk_export:false/);
  assert.match(meta,/primary_pdf_si_cif:false/);
  assert.match(meta,/raw_evidence_locators:false/);
  assert.match(vercel,/noindex, nofollow, noarchive/);
  assert.doesNotMatch(vercel,/\/api\/export/);
});

test('historical rev.8 implementation remains available for audit but is not a production entry point',()=>{
  assert.ok(fs.existsSync('api/ui-assistant-current.js'));
  assert.ok(fs.existsSync('api/record-evidence-current.js'));
  const vercel=JSON.parse(read('vercel.json'));
  const destinations=vercel.rewrites.filter(x=>['/','/index.html','/api/public-data','/motifs','/health.json'].includes(x.source)).map(x=>x.destination);
  assert.ok(destinations.every(x=>!x.includes('ui-assistant-current')&&!x.includes('record-evidence-current')&&!x.includes('meta?asset=health')));
});
