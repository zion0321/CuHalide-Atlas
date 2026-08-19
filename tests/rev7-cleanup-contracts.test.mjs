import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('rev.7 public wrappers eliminate rev.6 copy residues',()=>{
  const site=read('api/ui-site.js'),assistant=read('api/ui-assistant-current.js');
  for(const token of ['18 August 2026','cc.live_revision||6','This revision adds four primary-evidence-reviewed articles and eight SCXRD structure determinations']){
    assert.ok(site.includes(token),`site wrapper must explicitly normalize ${token}`);
  }
  for(const token of ['19 August 2026','cc.live_revision||7','Rev.7 completes a full structure-truth re-audit across the 946-row Current Curated snapshot']){
    assert.ok(site.includes(token),`site wrapper missing rev.7 replacement ${token}`);
  }
  assert.match(assistant,/18 August 2026/);
  assert.match(assistant,/19 August 2026/);
  assert.match(assistant,/cc\.live_revision\|\|6/);
  assert.match(assistant,/cc\.live_revision\|\|7/);
});

test('obsolete rev.6 deployment compatibility bridge is removed',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.ok(!fs.existsSync(url('tests/rev6-deployment-compat.spec.js')));
  assert.match(pkg.scripts['qa:browser'],/rev7-production-copy\.spec\.js/);
  assert.doesNotMatch(pkg.scripts['qa:browser'],/rev6-deployment-compat/);
});

test('prepublication indexing boundary is fail-closed and reversible',()=>{
  const config=JSON.parse(read('vercel.json'));
  const globalHeaders=config.headers.find(x=>x.source==='/(.*)')?.headers||[];
  const robotsHeader=globalHeaders.find(x=>String(x.key).toLowerCase()==='x-robots-tag');
  assert.equal(robotsHeader?.value,'noindex, nofollow, noarchive');

  const site=read('api/ui-site.js');
  const record=read('api/record-current.js');
  const meta=read('api/meta.js');
  for(const text of [site,record]){
    assert.match(text,/noindex,nofollow,noarchive/);
    assert.match(text,/X-Robots-Tag/);
  }
  assert.match(meta,/'X-Robots-Tag':'noindex, nofollow, noarchive'/);
  assert.match(meta,/release_state:'prepublication'/);
  assert.match(meta,/indexing:'disabled-prepublication'/);
  assert.ok(!meta.includes('Sitemap: ${PUBLIC}/sitemap.xml'));

  const pkg=JSON.parse(read('package.json'));
  assert.match(pkg.scripts['qa:browser'],/prepublication-indexing\.spec\.js/);
});
