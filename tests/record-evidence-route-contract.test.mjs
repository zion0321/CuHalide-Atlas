import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('legacy public entry points are intercepted before stale filesystem functions',()=>{
  const config=JSON.parse(read('vercel.json'));
  const route=source=>config.rewrites.find(x=>x.source===source)?.destination;
  assert.equal(route('/api/site'),'/api/ui-assistant-current');
  assert.equal(route('/api/ui-site'),'/api/ui-assistant-current');
  assert.equal(route('/api/ui-assistant'),'/api/ui-assistant-current');
  assert.equal(route('/api/record'),'/api/record-evidence-current');
  assert.equal(route('/api/record-current'),'/api/record-evidence-current');
  assert.equal(route('/article/:id'),'/api/record-evidence-current?kind=article&id=:id');
  assert.equal(route('/structure/:id'),'/api/record-evidence-current?kind=structure&id=:id');

  const middleware=read('middleware.js');
  assert.match(middleware,/matcher:\['\/','\/index\.html','\/api\/site','\/api\/ui-site','\/api\/ui-assistant','\/api\/record','\/api\/record-current'\]/);
  assert.match(middleware,/isRecord=incoming\.pathname==='\/api\/record'\|\|incoming\.pathname==='\/api\/record-current'/);
  assert.match(middleware,/isAssistantCompat=incoming\.pathname==='\/api\/ui-assistant'\|\|incoming\.pathname==='\/api\/site'\|\|incoming\.pathname==='\/api\/ui-site'/);
  assert.match(middleware,/assistantTarget=new URL\('\/api\/ui-assistant-current'/);
  assert.match(middleware,/recordTarget=new URL\('\/api\/record-evidence-current'/);
  assert.match(middleware,/target=isRecord\?recordTarget:assistantTarget/);
  assert.match(middleware,/if\(isRecord\|\|isAssistantCompat\)target\.search=incoming\.search/);

  const candidate=read('scripts/local-candidate-server.mjs');
  assert.match(candidate,/record-evidence-current\.js/);
  assert.match(candidate,/p==='\/api\/record-current'/);
  assert.match(candidate,/p==='\/api\/ui-assistant'\|\|p==='\/api\/site'\|\|p==='\/api\/ui-site'/);
  assert.doesNotMatch(candidate,/import uiSiteHandler/);
});

test('structure evidence wrapper separates parent-article verification from structure mapping',()=>{
  const wrapper=read('api/record-evidence-current.js');
  assert.match(wrapper,/kind!=='structure'/);
  assert.match(wrapper,/0 curated sample states · 0 measurements · 0 normalized values/);
  assert.match(wrapper,/No structure-mapped data/);
  assert.match(wrapper,/without an explicit structure mapping/);
  assert.match(wrapper,/Parent article · Two-pass verified/);
  assert.match(wrapper,/Parent article · Pass A curated/);
  assert.match(wrapper,/only photophysics samples explicitly mapped to this structure/);
});

test('article structured data separates Atlas WebPage provenance from the published source article',()=>{
  const wrapper=read('api/record-evidence-current.js');
  assert.match(wrapper,/function separateArticleStructuredData/);
  assert.match(wrapper,/function articlePageJsonLd/);
  assert.match(wrapper,/'@type':'WebPage'/);
  assert.match(wrapper,/'@type':'ScholarlyArticle'/);
  assert.match(wrapper,/dateModified:'2026-08-19'/);
  assert.match(wrapper,/isPartOf:\{\.\.\.LIVING_DATASET\}/);
  assert.match(wrapper,/frozenOrigin\?\{isBasedOn:\{\.\.\.FROZEN_DATASET\}\}:\{\}/);
  assert.match(wrapper,/mainEntity:article/);
  assert.match(wrapper,/'@id':sourceUrl\|\|`\$\{recordUrl\}#source-article`/);
  assert.match(wrapper,/url:sourceUrl,sameAs:sourceUrl/);
  assert.doesNotMatch(wrapper,/ARCHIVED_JSON/);
  assert.doesNotMatch(wrapper,/LIVING_JSON/);
});

test('frozen-baseline article provenance remains explicit inside the living rev.7 record context',()=>{
  const wrapper=read('api/record-evidence-current.js');
  assert.match(wrapper,/Current Curated rev\.7 context · core article record inherited from immutable Frozen Release 3\.0\.2 baseline/);
  assert.match(wrapper,/CuHalide Atlas living knowledge base/);
  assert.match(wrapper,/current-r7/);
  assert.match(wrapper,/isBasedOn/);
  assert.match(wrapper,/CuHalide Atlas archived scientific snapshot 3\.0\.2/);
});
