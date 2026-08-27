import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('rev.8 public wrappers normalize historical renderer copy into the active contract',()=>{
  const site=read('api/ui-site.js'),assistant=read('api/ui-assistant-current.js');
  for(const token of ['18 August 2026','cc.live_revision||6','Current Curated rev.7'])assert.ok(site.includes(token),`site wrapper must explicitly normalize historical token ${token}`);
  for(const token of ['19 August 2026','cc.live_revision||8','Current Curated rev.8','Rev.8 incorporates primary-source-reverified structure corrections'])assert.ok(site.includes(token),`site wrapper missing rev.8 replacement ${token}`);
  assert.match(assistant,/18 August 2026/);
  assert.match(assistant,/19 August 2026/);
  assert.match(assistant,/cc\.live_revision\|\|6/);
  assert.match(assistant,/cc\.live_revision\|\|8/);
  assert.match(assistant,/Current Curated rev\.8/);
});

test('obsolete rev.6 deployment compatibility bridge is removed',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.ok(!fs.existsSync(url('tests/rev6-deployment-compat.spec.js')));
  assert.match(pkg.scripts['qa:browser'],/rev7-production-copy\.spec\.js/,'historical filename may remain but must carry the active serving contract');
  assert.doesNotMatch(pkg.scripts['qa:browser'],/rev6-deployment-compat/);
});

test('prepublication indexing boundary is fail-closed and reversible',()=>{
  const config=JSON.parse(read('vercel.json'));
  const globalHeaders=config.headers.find(x=>x.source==='/(.*)')?.headers||[];
  const robotsHeader=globalHeaders.find(x=>String(x.key).toLowerCase()==='x-robots-tag');
  assert.equal(robotsHeader?.value,'noindex, nofollow, noarchive');

  const site=read('api/ui-site.js');
  const record=read('api/record-evidence-current.js');
  const meta=read('api/meta.js');
  for(const text of [site,record]){
    assert.match(text,/noindex,nofollow,noarchive|applyRecordPrepublicationGovernance/);
  }
  assert.match(meta,/'X-Robots-Tag':'noindex, nofollow, noarchive'/);
  assert.match(meta,/release_state:'prepublication'/);
  assert.match(meta,/indexing:'disabled-prepublication'/);
  assert.ok(!meta.includes('Sitemap: ${PUBLIC}/sitemap.xml'));

  const pkg=JSON.parse(read('package.json'));
  assert.match(pkg.scripts['qa:browser'],/prepublication-indexing\.spec\.js/);
});
