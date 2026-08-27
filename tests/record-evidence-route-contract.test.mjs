import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('legacy public entry points and stale function suffixes are intercepted before filesystem dispatch',()=>{
  const config=JSON.parse(read('vercel.json'));
  const route=source=>config.rewrites.find(x=>x.source===source)?.destination;
  for(const source of ['/api/site','/api/ui-site','/api/ui-site.js','/api/ui-assistant','/api/ui-assistant.js'])assert.equal(route(source),'/api/ui-assistant-current',`${source} must terminate at current assistant UI`);
  for(const source of ['/api/record','/api/record.js','/api/record-current','/api/record-current.js'])assert.equal(route(source),'/api/record-evidence-current',`${source} must terminate at evidence wrapper`);
  assert.equal(route('/article/:id'),'/api/record-evidence-current?kind=article&id=:id');
  assert.equal(route('/structure/:id'),'/api/record-evidence-current?kind=structure&id=:id');
  const middleware=read('middleware.js');
  for(const path of ['/api/ui-site.js','/api/ui-assistant.js','/api/record.js','/api/record-current.js'])assert.ok(middleware.includes(`'${path}'`),`middleware matcher missing ${path}`);
  assert.match(middleware,/recordPaths=new Set\(\['\/api\/record','\/api\/record\.js','\/api\/record-current','\/api\/record-current\.js'\]\)/);
  assert.match(middleware,/assistantCompatPaths=new Set\(\['\/api\/ui-assistant','\/api\/ui-assistant\.js','\/api\/site','\/api\/ui-site','\/api\/ui-site\.js'\]\)/);
  assert.match(middleware,/assistantTarget=new URL\('\/api\/ui-assistant-current'/);
  assert.match(middleware,/recordTarget=new URL\('\/api\/record-evidence-current'/);
  assert.match(middleware,/target=isRecord\?recordTarget:assistantTarget/);
  assert.match(middleware,/x-cuhalide-current-curated-revision','8'/);
  const candidate=read('scripts/local-candidate-server.mjs');
  assert.match(candidate,/record-evidence-current\.js/);
  for(const path of ['/api/ui-site.js','/api/ui-assistant.js','/api/record.js','/api/record-current.js'])assert.ok(candidate.includes(`'${path}'`),`candidate runtime missing ${path}`);
  assert.match(candidate,/applyMiddlewareContract/);
  assert.match(candidate,/x-cuhalide-current-curated-revision','8'/);
  assert.doesNotMatch(candidate,/import uiSiteHandler/);
});

test('structure evidence wrapper separates parent-article verification from structure mapping',()=>{
  const wrapper=read('api/record-evidence-current.js');
  assert.match(wrapper,/CURRENT_REVISION='8'/);
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

test('frozen-baseline article provenance remains explicit inside the living rev.8 record context',()=>{
  const wrapper=read('api/record-evidence-current.js');
  assert.match(wrapper,/Current Curated rev\.8 context · core article record inherited from immutable Frozen Release 3\.0\.2 baseline/);
  assert.match(wrapper,/CuHalide Atlas living knowledge base/);
  assert.match(wrapper,/current-r8/);
  assert.match(wrapper,/isBasedOn/);
  assert.match(wrapper,/CuHalide Atlas archived scientific snapshot 3\.0\.2/);
  assert.doesNotMatch(wrapper,/Current Curated rev\.7 context/);
});
