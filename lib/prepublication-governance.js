export const PUBLICATION_STATE='prepublication-review';
export const PUBLICATION_LABEL='Prepublication review';

const STATE_META=`<meta name="cuhalide-publication-state" content="${PUBLICATION_STATE}">`;
const ROOT_DESCRIPTION='CuHalide Atlas is an evidence-grounded, structure-resolved prepublication review interface for organic-containing Cu(I) chloride, bromide and iodide materials.';
const ROOT_SCHEMA_DESCRIPTION='Evidence-grounded, structure-resolved prepublication review interface for organic-containing Cu(I) halide materials.';
const REVIEW_OG_ALT='CuHalide Atlas — prepublication review interface for evidence-grounded Cu(I) halide knowledge';
const LIVING_DATASET_NAME='CuHalide Atlas living knowledge base';

const all=(body,from,to)=>body.split(from).join(to);

function addStateMeta(body){
  if(body.includes('name="cuhalide-publication-state"'))return body;
  if(!body.includes('</head>'))throw new Error('prepublication governance: document head marker missing');
  return body.replace('</head>',`${STATE_META}\n</head>`);
}

function governWebsiteJsonLd(body){
  const re=/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let governed=false;
  const out=body.replace(re,(full,raw)=>{
    let value;
    try{value=JSON.parse(raw)}catch{return full}
    if(!value||value['@type']!=='WebSite'||value.name!=='CuHalide Atlas')return full;
    value.description=ROOT_SCHEMA_DESCRIPTION;
    value.creativeWorkStatus=PUBLICATION_LABEL;
    governed=true;
    return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
  });
  if(!governed)throw new Error('prepublication governance: CuHalide Atlas WebSite JSON-LD not found');
  return out;
}

function governRecordJsonLd(body){
  const re=/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let anyGoverned=false;
  const out=body.replace(re,(full,raw)=>{
    let value;
    try{value=JSON.parse(raw)}catch{return full}
    if(!value||typeof value!=='object')return full;
    let changed=false;
    if(value.isPartOf?.name===LIVING_DATASET_NAME){
      value.isPartOf={...value.isPartOf,creativeWorkStatus:PUBLICATION_LABEL};
      changed=true;
    }
    if(value['@type']==='Dataset'&&String(value.identifier||'').startsWith('CUH-')){
      value.creativeWorkStatus=PUBLICATION_LABEL;
      changed=true;
    }
    if(!changed)return full;
    anyGoverned=true;
    return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
  });
  if(!anyGoverned)throw new Error('prepublication governance: Atlas record JSON-LD scope not found');
  return out;
}

export function applyRootPrepublicationGovernance(input){
  if(typeof input!=='string'||!input.includes('</html>'))return input;
  let body=addStateMeta(input);
  body=all(body,'CuHalide Atlas is an evidence-grounded, structure-resolved public knowledge portal for organic-containing Cu(I) chloride, bromide and iodide materials.',ROOT_DESCRIPTION);
  body=all(body,'CuHalide Atlas — evidence-grounded Cu(I) halide knowledge portal',REVIEW_OG_ALT);
  body=all(body,'The public methods layer emphasizes scientific semantics, data grain and reproducible decision rules.','The prepublication review methods layer emphasizes scientific semantics, data grain and reproducible decision rules.');
  body=all(body,'<summary>Public scientific interface</summary>','<summary>Prepublication review interface</summary>');
  body=all(body,'Selected bibliographic, structural and crystallographic fields are exposed through server-side, field-whitelisted projection queries and single-record views. The goal is scientific discoverability and traceability, not bulk redistribution.','Selected bibliographic, structural and crystallographic fields are available through server-side, field-whitelisted projection queries and single-record review views. The goal is scientific traceability during review, not bulk redistribution or a formal dataset release.');
  body=all(body,'Public display is limited to title, year, journal, DOI and review status.','Review display is limited to title, year, journal, DOI and review status.');
  body=all(body,'<h1>Cite the living atlas or reproduce a snapshot</h1>','<h1>Reference the review state or reproduce a snapshot</h1>');
  body=all(body,'<p>The portal supports query, inspection and evidence-grounded scientific use. The complete internal curation corpus is not distributed as a public bulk download.</p>','<p>During prepublication review, the interface supports query, inspection and evidence-grounded scientific use. The complete internal curation corpus is not distributed as a bulk dataset.</p>');
  body=all(body,'<p class="eyebrow">Recommended citation</p>','<p class="eyebrow">Prepublication attribution</p>');
  body=all(body,'CuHalide Atlas. Continuously curated Cu(I) halide knowledge portal. Curated through 19 August 2026. https://cuhalide-atlas-v3.vercel.app/','CuHalide Atlas. Prepublication review resource. Current Curated rev.8, curated through 19 August 2026. https://cuhalide-atlas-v3.vercel.app/. Include the access date when referenced.');
  body=all(body,'CuHalide Atlas. Prepublication review resource. Current Curated rev.7, curated through 19 August 2026. https://cuhalide-atlas-v3.vercel.app/. Include the access date when referenced.','CuHalide Atlas. Prepublication review resource. Current Curated rev.8, curated through 19 August 2026. https://cuhalide-atlas-v3.vercel.app/. Include the access date when referenced.');
  body=all(body,'Copy citation','Copy attribution');
  body=all(body,'Snapshot citation metadata','Review metadata');
  body=all(body,'For living-atlas results, report the access date. Archived scientific snapshot 3.0.2 is the immutable historical baseline, verified through 2026-06-30.','Before formal public release, reference living-atlas review results with the access date and Current Curated revision. Archived scientific snapshot 3.0.2 remains the immutable historical baseline, verified through 2026-06-30.');
  body=all(body,'<h2>Public knowledge layer</h2>','<h2>Review-access knowledge layer</h2>');
  body=all(body,'Public access is query-and-view. Complete normalized tables and primary evidence remain private research assets.','Review access is query-and-view. Complete normalized tables and primary evidence remain private research assets.');
  body=governWebsiteJsonLd(body);
  for(const token of [STATE_META,ROOT_DESCRIPTION,REVIEW_OG_ALT,'"creativeWorkStatus":"Prepublication review"','Prepublication review interface','Prepublication attribution','Review-access knowledge layer','Review access is query-and-view.','Current Curated rev.8'])if(!body.includes(token))throw new Error(`prepublication governance: required root token missing: ${token}`);
  for(const stale of ['structure-resolved public knowledge portal','<summary>Public scientific interface</summary>','<p class="eyebrow">Recommended citation</p>','<h2>Public knowledge layer</h2>','Public access is query-and-view.','Current Curated rev.7, curated through 19 August 2026'])if(body.includes(stale))throw new Error(`prepublication governance: ambiguous formal-release copy remains: ${stale}`);
  return body;
}

export function applyRecordPrepublicationGovernance(input){
  if(typeof input!=='string'||!input.includes('</html>'))return input;
  let body=addStateMeta(input);
  body=all(body,'CuHalide Atlas — evidence-grounded Cu(I) halide knowledge portal',REVIEW_OG_ALT);
  body=all(body,'No current public CuHalide Atlas record matches this identifier.','No current review-access CuHalide Atlas record matches this identifier.');
  const hasRecordJsonLd=/<script type="application\/ld\+json">/.test(body);
  const hasDataNote=body.includes('This page reflects the latest curated public record available in CuHalide Atlas.');
  if(hasDataNote){
    body=all(body,'This page reflects the latest curated public record available in CuHalide Atlas.','This page reflects the latest curated review-access record available in CuHalide Atlas.');
    body=all(body,'Public pages expose only field-whitelisted information; primary PDF/SI/CIF and private curation evidence remain private.','Review pages expose only field-whitelisted information; primary PDF/SI/CIF and private curation evidence remain private.');
  }
  if(hasRecordJsonLd)body=governRecordJsonLd(body);
  if(!body.includes(STATE_META))throw new Error('prepublication governance: record publication-state meta missing');
  if(body.includes('og:image:alt')&&!body.includes(REVIEW_OG_ALT))throw new Error('prepublication governance: record OG review-state alt missing');
  if(hasDataNote){
    for(const token of ['latest curated review-access record','Review pages expose only field-whitelisted information'])if(!body.includes(token))throw new Error(`prepublication governance: required record token missing: ${token}`);
  }
  if(hasRecordJsonLd&&!body.includes('"creativeWorkStatus":"Prepublication review"'))throw new Error('prepublication governance: record JSON-LD review-state scope missing');
  if(body.includes('latest curated public record')||body.includes('Public pages expose only field-whitelisted information')||body.includes('No current public CuHalide Atlas record matches this identifier.'))throw new Error('prepublication governance: stale record access wording remains');
  return body;
}
