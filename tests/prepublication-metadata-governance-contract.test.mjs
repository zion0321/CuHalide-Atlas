import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('shared governance helper separates website review state from source-article semantics',()=>{
  const helper=read('lib/prepublication-governance.js');
  assert.match(helper,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(helper,/applyRootPrepublicationGovernance/);
  assert.match(helper,/applyRecordPrepublicationGovernance/);
  assert.match(helper,/governRecordJsonLd/);
  assert.match(helper,/LIVING_DATASET_NAME='CuHalide Atlas living knowledge base'/);
  assert.match(helper,/value\.isPartOf=\{\.\.\.value\.isPartOf,creativeWorkStatus:PUBLICATION_LABEL\}/);
  assert.match(helper,/value\['@type'\]==='Dataset'/);
  assert.match(helper,/Prepublication review interface/);
  assert.match(helper,/Prepublication attribution/);
  assert.match(helper,/Review-access knowledge layer/);
  assert.match(helper,/latest curated review-access record/);
  assert.doesNotMatch(helper,/ScholarlyArticle.*creativeWorkStatus/s);
});

test('canonical HTML renderers use explicit prepublication response and page metadata',()=>{
  const site=read('api/ui-site.js'),assistant=read('api/ui-assistant-current.js'),record=read('api/record-evidence-current.js'),motifs=read('api/motifs.js');
  for(const source of [site,assistant]){
    assert.match(source,/applyRootPrepublicationGovernance/);
    assert.match(source,/X-CuHalide-Publication-State/);
    assert.match(source,/PUBLICATION_STATE/);
  }
  assert.match(record,/applyRecordPrepublicationGovernance/);
  assert.match(record,/X-CuHalide-Publication-State/);
  assert.match(record,/PUBLICATION_STATE/);
  assert.match(motifs,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(motifs,/meta name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(motifs,/meta name="cuhalide-publication-state" content="\$\{PUBLICATION_STATE\}"/);
  assert.match(motifs,/creativeWorkStatus:'Prepublication review'/);
  assert.match(motifs,/review-access projection, not a formally released public dataset/);
  assert.match(motifs,/X-CuHalide-Publication-State/);
  assert.doesNotMatch(motifs,/meta name="robots" content="index,follow,max-image-preview:large"/);
});

test('metadata gateway 50.5 carries explicit governance state without changing scientific contracts',()=>{
  const meta=read('api/meta.js'),readme=read('README.md');
  for(const token of ["META_VERSION='50.5'","PUBLICATION_STATE='prepublication-review'","PUBLIC_DATA_VERSION='2.16.0'","PHOTOPHYSICS_VERSION='1.3.0'","ORGANIC_COMPONENTS_VERSION='1.1.0'","CURRENT_REVISION='7'",'publication_state=PUBLICATION_STATE',"publication_state:PUBLICATION_STATE","governance_state:PUBLICATION_STATE","release_state:'prepublication'","indexing:'disabled-prepublication'"])assert.ok(meta.includes(token),`metadata governance contract missing ${token}`);
  assert.match(meta,/X-CuHalide-Publication-State/);
  assert.match(meta,/CuHalide-Atlas-Meta\/50\.5/);
  assert.match(meta,/Prepublication review interface/);
  assert.match(readme,/Metadata gateway: \*\*50\.5\*\*/);
  assert.match(readme,/Publication\/governance state: \*\*prepublication-review\*\*/);
});

test('platform compatibility and public-data gateways fail closed on prepublication state',()=>{
  const config=JSON.parse(read('vercel.json')),middleware=read('middleware.js'),candidate=read('scripts/local-candidate-server.mjs'),publicData=read('api/public-data.js');
  const global=config.headers.find(x=>x.source==='/(.*)')?.headers||[];
  assert.equal(global.find(x=>x.key==='X-CuHalide-Publication-State')?.value,'prepublication-review');
  assert.match(middleware,/x-cuhalide-publication-state','prepublication-review'/);
  assert.match(candidate,/X-CuHalide-Publication-State','prepublication-review'/);
  assert.match(publicData,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(publicData,/X-CuHalide-Publication-State/);
  assert.match(publicData,/PUBLIC_DATA_VERSION='2\.16\.0'/);
});

test('assistant export and sitemap handlers independently expose governance state',()=>{
  const agent=read('api/agent.js'),exp=read('api/export.js'),sitemap=read('api/sitemap.js');
  assert.match(agent,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(agent,/X-CuHalide-Publication-State/);
  assert.match(agent,/function annotateCapabilityBody/);
  assert.match(agent,/req\.method!=='GET'/);
  assert.match(agent,/x\.publication_state=PUBLICATION_STATE/);
  assert.match(agent,/attempts=isPost\?1:3/);
  assert.match(exp,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(exp,/Bulk dataset exports are unavailable during prepublication review/);
  assert.match(exp,/publication_state:PUBLICATION_STATE/);
  assert.match(exp,/release_state:'prepublication'/);
  assert.match(exp,/X-CuHalide-Publication-State/);
  assert.match(sitemap,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(sitemap,/X-Robots-Tag','noindex, nofollow, noarchive'/);
  assert.match(sitemap,/X-CuHalide-Publication-State/);
  assert.match(sitemap,/EXPECTED_URLS=1257/);
  assert.match(sitemap,/prepublication-review sitemap/);
});
