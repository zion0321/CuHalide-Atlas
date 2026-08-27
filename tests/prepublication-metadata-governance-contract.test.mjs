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
  assert.match(record,/CURRENT_REVISION='8'/);
  assert.match(record,/PHOTOPHYSICS_CONTRACT='1\.3\.3'/);
  assert.match(record,/x-cuhalide-photophysics-contract/);
  assert.match(motifs,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(motifs,/REV='8'/);
  assert.match(motifs,/meta name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(motifs,/meta name="cuhalide-publication-state" content="\$\{PUBLICATION_STATE\}"/);
  assert.match(motifs,/creativeWorkStatus:'Prepublication review'/);
  assert.match(motifs,/review-access projection, not a formally released public dataset/);
  assert.match(motifs,/X-CuHalide-Publication-State/);
  assert.doesNotMatch(motifs,/meta name="robots" content="index,follow,max-image-preview:large"/);
});

test('metadata gateway 50.5 carries active rev.8 and Photophysics 1.3.3 under prepublication governance',()=>{
  const meta=read('api/meta.js'),readme=read('README.md'),cff=read('CITATION.cff');
  for(const token of ["META_VERSION='50.5'","PUBLICATION_STATE='prepublication-review'","PUBLIC_DATA_VERSION='2.16.0'","PHOTOPHYSICS_VERSION='1.3.3'","ORGANIC_COMPONENTS_VERSION='1.1.0'","CURRENT_REVISION='8'",'publication_state=PUBLICATION_STATE',"publication_state:PUBLICATION_STATE","governance_state:PUBLICATION_STATE","release_state:'prepublication'","indexing:'disabled-prepublication'"])assert.ok(meta.includes(token),`metadata governance contract missing ${token}`);
  assert.match(meta,/X-CuHalide-Publication-State/);
  assert.match(meta,/CuHalide-Atlas-Meta\/50\.5/);
  assert.match(meta,/fs\.readFileSync\(CITATION_PATH,'utf8'\)/);
  assert.doesNotMatch(meta,/Prepublication review interface/);
  assert.match(cff,/prepublication review resource/i);
  assert.match(cff,/not a formally deposited public dataset/i);
  assert.doesNotMatch(cff,/^date-released:/m);
  assert.doesNotMatch(cff,/\bdoi:\s*\S+/im);
  assert.match(readme,/Current Curated rev\.8/);
  assert.match(readme,/Metadata gateway: \*\*50\.5\*\*/);
  assert.match(readme,/Publication\/governance state: \*\*prepublication-review\*\*/);
  assert.match(readme,/Structured Photophysics contract: \*\*1\.3\.3\*\*/);
  assert.match(readme,/2,267 measurements/);
  assert.match(readme,/2,988 normalized values/);
});

test('production readiness workflow permits only active rev.8 and locked Photophysics 1.3.3',()=>{
  const workflow=read('.github/workflows/production-browser-qa.yml');
  assert.match(workflow,/x\.publication_state!=='prepublication-review'/);
  assert.match(workflow,/x\.current_curated\?\.live_revision!==8/);
  assert.match(workflow,/x\.meta_version!=='50\.5'\|\|x\.gateway_meta_version!=='50\.5'/);
  assert.match(workflow,/p\?\.version!=='1\.3\.3'/);
  assert.match(workflow,/p\?\.pass_a_curated_articles!==237/);
  assert.match(workflow,/p\?\.two_pass_verified_articles!==92/);
  assert.match(workflow,/p\?\.publishable_measurements!==2267/);
  assert.match(workflow,/p\?\.publishable_values!==2988/);
  assert.match(workflow,/p\?\.analysis_eligible_values!==281/);
  assert.match(workflow,/p\?\.publishable_mechanism_claims!==477/);
  assert.match(workflow,/verification-stage accounting does not sum to article queue/);
  assert.match(workflow,/production rev\.8 \/ prepublication-review \/ activated Photophysics 1\.3\.3 PASS/);
  assert.doesNotMatch(workflow,/expected production rev\.7/);
  assert.doesNotMatch(workflow,/stable132|staged133|controlled 1\.3\.2 -> 1\.3\.3 migration states/);
  assert.doesNotMatch(workflow,/publishable_measurements===2262|publishable_values===2985/);
  assert.doesNotMatch(workflow,/publishable_measurements===2259|publishable_values===2979/);
  assert.doesNotMatch(workflow,/Meta must remain exactly 50\.4/);
});

test('platform compatibility and public-data gateways fail closed on prepublication state',()=>{
  const config=JSON.parse(read('vercel.json')),middleware=read('middleware.js'),candidate=read('scripts/local-candidate-server.mjs'),publicData=read('api/public-data.js');
  const global=config.headers.find(x=>x.source==='/(.*)')?.headers||[];
  assert.equal(global.find(x=>x.key==='X-CuHalide-Publication-State')?.value,'prepublication-review');
  assert.match(middleware,/x-cuhalide-publication-state','prepublication-review'/);
  assert.match(middleware,/x-cuhalide-current-curated-revision','8'/);
  assert.match(candidate,/X-CuHalide-Publication-State','prepublication-review'/);
  assert.match(candidate,/x-cuhalide-current-curated-revision','8'/);
  assert.match(publicData,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(publicData,/CURRENT_REVISION='8'/);
  assert.match(publicData,/X-CuHalide-Publication-State/);
  assert.match(publicData,/PUBLIC_DATA_VERSION='2\.16\.0'/);
  assert.match(publicData,/PHOTOPHYSICS_CONTRACT='1\.3\.3'/);
});

test('assistant export and sitemap handlers independently expose governance state',()=>{
  const agent=read('api/agent.js'),exp=read('api/export.js'),sitemap=read('api/sitemap.js');
  assert.match(agent,/PUBLICATION_STATE='prepublication-review'/);
  assert.match(agent,/CURRENT_REVISION='8'/);
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
  assert.match(sitemap,/CURRENT_REVISION='8'/);
  assert.match(sitemap,/X-Robots-Tag','noindex, nofollow, noarchive'/);
  assert.match(sitemap,/X-CuHalide-Publication-State/);
  assert.match(sitemap,/prepublication-non-enumerating/);
  assert.match(sitemap,/X-CuHalide-Sitemap-URLs/);
  assert.match(sitemap,/Record-level enumeration is intentionally withheld until formal release/);
  assert.doesNotMatch(sitemap,/EXPECTED_URLS=1257/);
});
