import fs from 'node:fs';
import path from 'node:path';

const CONTRACT='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-runtime-contract-v1-public';
const PHOTOPHYSICS_HEALTH='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3?action=photophysics-health';
const ORGANIC_COMPONENTS_HEALTH='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3?action=organic-components-health';
const PUBLIC='https://cuhalide-atlas-v3.vercel.app';
const RELEASE='3.0.2',META_VERSION='50.5',PUBLIC_DATA_VERSION='2.16.0',PHOTOPHYSICS_VERSION='1.3.1',ORGANIC_COMPONENTS_VERSION='1.1.0',CURRENT_REVISION='7',PUBLICATION_STATE='prepublication-review';
const RETRIES=3,ATTEMPT_TIMEOUT_MS=7000,RETRY_DELAY_MS=180;
const CITATION_PATH=path.join(process.cwd(),'CITATION.cff');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const CURRENT={curated_through:'2026-08-19',article_audit_records:383,chemically_included_articles:372,canonical_verified_articles:369,structure_phase_rows:946,core_included_structure_rows:886,resolved_space_group_rows:710,verified_space_group_rows:684,verified_polar_rows:97,strict_polar_rows:87,strict_polar_articles:54,rag_documents:1329,rag_embedded:1329,taxonomy_rows:946,motif_resolved_rows:628,motif_unresolved_rows:318,motif_unresolved_legacy_category_rows:35};
const FROZEN={version:RELEASE,release_date:'2026-08-11',cutoff_inclusive_through:'2026-06-30',immutable:true,article_audit_records:346,chemically_included_articles:335,canonical_verified_articles:332,structure_phase_rows:878,core_included_structure_rows:816,resolved_space_group_rows:650,verified_space_group_rows:625,verified_polar_rows:87,strict_polar_rows:67,strict_polar_articles:42,rag_documents:1224};
const headers=(type='application/json; charset=utf-8')=>({'Content-Type':type,'Cache-Control':'no-store, max-age=0','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff','X-CuHalide-Release':RELEASE,'X-CuHalide-Meta-Version':META_VERSION,'X-CuHalide-Public-Data-Version':PUBLIC_DATA_VERSION,'X-CuHalide-Photophysics-Contract':PHOTOPHYSICS_VERSION,'X-CuHalide-Organic-Components-Contract':ORGANIC_COMPONENTS_VERSION,'X-CuHalide-Current-Curated-Revision':CURRENT_REVISION,'X-CuHalide-Publication-State':PUBLICATION_STATE});

async function fetchJsonWithRetry(url,agent){
  let last=null,lastError=null;
  for(let attempt=0;attempt<RETRIES;attempt++){
    try{
      const r=await fetch(url,{headers:{accept:'application/json','user-agent':agent},signal:AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)}),raw=await r.text();
      let x;try{x=JSON.parse(raw)}catch{x={ok:false,status:'FAIL',error:'invalid JSON health response'}};
      last={r,x};
      if(r.ok&&x?.ok===true)return last;
      if(r.status<500&&r.status!==429)break;
      lastError=Error(`health ${r.status}`);
    }catch(error){lastError=error}
    if(attempt<RETRIES-1)await sleep(RETRY_DELAY_MS*(attempt+1));
  }
  return{...(last||{}),error:lastError};
}

function normalizeHealth(x,ph,org){
  x.gateway_meta_version=META_VERSION;
  x.site_version='50';
  x.meta_version=META_VERSION;
  x.publication_state=PUBLICATION_STATE;
  x.public_data_version=PUBLIC_DATA_VERSION;
  x.photophysics_contract_version=PHOTOPHYSICS_VERSION;
  x.organic_components_contract_version=ORGANIC_COMPONENTS_VERSION;
  x.photophysics_publication_policy='pass-a-curated-or-two-pass-verified';
  x.site_probe_mode='frontend v50 active; backend Current Curated rev.7 deterministic contract; Structured Photophysics 1.3.1 staged publication; Organic Components 1.1.0 structure-grain fail-closed depiction contract';
  x.public_data={...(x.public_data||{}),version:PUBLIC_DATA_VERSION};
  x.photophysics=ph;
  x.organic_components=org;
  const checks={...(x.checks||{})};
  delete checks.photophysics_two_pass_gate;
  x.checks={...checks,
    photophysics_contract:ph?.ok===true&&ph?.version===PHOTOPHYSICS_VERSION,
    photophysics_staged_publication:ph?.ok===true&&ph?.publication_policy==='pass_a_curated_or_two_pass_verified',
    photophysics_private_evidence_guard:ph?.checks?.raw_primary_files_exposed===false&&ph?.checks?.raw_evidence_locators_exposed===false,
    organic_components_contract:org?.ok===true&&org?.contract_version===ORGANIC_COMPONENTS_VERSION,
    organic_components_all_rows_classified:org?.component_rows===495&&org?.mapped_structures===453&&org?.distinct_raw_component_keys===260&&org?.checks?.all_rows_classified===true&&org?.checks?.mapping_baseline_stable===true&&org?.checks?.verified_plus_unresolved_equals_total===true,
    organic_components_private_evidence_guard:org?.checks?.raw_primary_files_exposed===false&&org?.checks?.raw_evidence_locators_exposed===false&&org?.checks?.private_evidence_fields_exposed===false
  };
  x.ok=x.ok===true&&x.checks.photophysics_contract===true&&x.checks.photophysics_staged_publication===true&&x.checks.photophysics_private_evidence_guard===true&&x.checks.organic_components_contract===true&&x.checks.organic_components_all_rows_classified===true&&x.checks.organic_components_private_evidence_guard===true;
  return x;
}

async function health(){
  const u=new URL(CONTRACT);u.searchParams.set('action','health');
  const [runtime,photo,organic]=await Promise.all([
    fetchJsonWithRetry(u,'CuHalide-Atlas-Meta/50.5'),
    fetchJsonWithRetry(PHOTOPHYSICS_HEALTH,'CuHalide-Atlas-Meta-Photophysics/1.3.1'),
    fetchJsonWithRetry(ORGANIC_COMPONENTS_HEALTH,'CuHalide-Atlas-Meta-Organic-Components/1.1.0')
  ]);
  const runtimeOk=runtime?.r?.ok&&runtime?.x?.ok===true,photoOk=photo?.r?.ok&&photo?.x?.ok===true&&photo?.x?.version===PHOTOPHYSICS_VERSION,organicOk=organic?.r?.ok&&organic?.x?.ok===true&&organic?.x?.contract_version===ORGANIC_COMPONENTS_VERSION;
  if(runtimeOk&&photoOk&&organicOk)return{status:200,body:JSON.stringify(normalizeHealth(runtime.x,photo.x,organic.x))};
  const x=normalizeHealth(runtime?.x||{ok:false,status:'FAIL',error:'CuHalide Atlas deterministic runtime contract is temporarily unavailable.'},photo?.x||{ok:false,status:'FAIL',version:PHOTOPHYSICS_VERSION,error:'Structured photophysics health is temporarily unavailable.'},organic?.x||{ok:false,status:'FAIL',contract_version:ORGANIC_COMPONENTS_VERSION,error:'Organic component health is temporarily unavailable.'});
  x.ok=false;x.retryable=true;
  return{status:503,body:JSON.stringify(x)};
}

function manifest(){
  return JSON.stringify({
    schema_version:'2.3',
    project:'CuHalide Atlas',
    public_origin:PUBLIC,
    publication_state:PUBLICATION_STATE,
    frozen_release:FROZEN,
    current_curated:{revision:7,architecture:'full-current-atomic-structure-snapshot',...CURRENT},
    runtime:{site_version:'50',ui_version:'50.2',meta_version:META_VERSION,public_data_version:PUBLIC_DATA_VERSION,photophysics_contract_version:PHOTOPHYSICS_VERSION,organic_components_contract_version:ORGANIC_COMPONENTS_VERSION,smart_rag_version:'9.19.0',research_assistant_version:'10.4.1',motif_atlas_version:'1.2'},
    photophysics:{public_projection:'pass-a-curated-or-two-pass-verified',verification_stage_explicit:true,two_pass_identity_preserved:true,measurement_conflicts_fail_closed:true,raw_primary_files:false,raw_evidence_locators:false,internal_sample_ids:false,analysis_eligibility_explicit:true,processed_state_structure_guard:true},
    organic_components:{contract_version:ORGANIC_COMPONENTS_VERSION,structure_grain:true,mapping_rows:495,mapped_structures:453,distinct_raw_component_keys:260,all_rows_explicitly_classified:true,verified_connectivity_only_for_deterministic_depiction:true,unresolved_identity_fail_closed:true,stereochemistry_not_inferred:true,renderer:'RDKit 2025.09.4 coordinate layout + browser SVG',generative_imagery:false,raw_primary_files:false,raw_evidence_locators:false,private_evidence_fields:false},
    public_access:{mode:'query-and-view',release_state:'prepublication',governance_state:PUBLICATION_STATE,indexing:'disabled-prepublication',bulk_export:false,primary_pdf_si_cif:false,exact_stored_abstracts:false,internal_evidence_locators:false,candidate_scores_reason_codes:false,structured_photophysics:true,structured_organic_components:true},
    provenance_note:'Frozen Release 3.0.2 is immutable. Current Curated rev.7 is the living full-current article and atomic/context structure snapshot reviewed through 2026-08-19. Structured photophysics may be exposed after the Pass A primary-evidence curation gate; records that also complete independent Pass B agreement remain explicitly identified as two-pass verified. Organic Components 1.1.0 classifies every QC-passed structure-grain component mapping and renders only independently verified molecular connectivity using deterministic RDKit-derived browser SVG; ambiguous identities remain unresolved rather than inferred. Measurement-level QC, source-conflict and organic-component identity gates remain fail-closed. Raw source files and internal evidence locators remain private. Reported composition, local Cu-X motif and global connectivity dimensionality are represented separately; unsupported compound-level crystallographic mappings are withheld. Search-engine indexing remains disabled during the prepublication governance phase.'
  },null,2);
}

function citation(){
  const body=fs.readFileSync(CITATION_PATH,'utf8');
  if(!/^cff-version:\s*1\.2\.0/m.test(body))throw new Error('CITATION.cff contract missing cff-version 1.2.0');
  if(!/prepublication review resource/i.test(body))throw new Error('CITATION.cff contract missing prepublication review state');
  if(/^date-released:/m.test(body))throw new Error('CITATION.cff must not assert a formal release date during prepublication review');
  if(/\bdoi:\s*\S+/im.test(body))throw new Error('CITATION.cff must not assert a permanent DOI during prepublication review');
  return body;
}

export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method Not Allowed')}
  try{
    const u=new URL(req.url,PUBLIC),asset=String(u.searchParams.get('asset')||u.searchParams.get('action')||'health').toLowerCase();
    let status=200,body='',type='application/json; charset=utf-8';
    if(asset==='health'||asset==='health.json'){
      const h=await health();status=h.status;body=h.body;if(status===503)res.setHeader('Retry-After','30');
    }else if(asset==='manifest'||asset==='release-manifest.json'){
      body=manifest();
    }else if(asset==='citation'||asset==='citation.cff'||asset==='cff'){
      type='text/plain; charset=utf-8';body=citation();
    }else if(asset==='robots'||asset==='robots.txt'){
      type='text/plain; charset=utf-8';body='User-agent: *\nAllow: /\nDisallow: /api/\n# Prepublication: indexing is disabled by X-Robots-Tag and page-level noindex directives.\n';
    }else{
      status=404;body=JSON.stringify({error:'unknown metadata asset'});
    }
    res.statusCode=status;
    for(const[k,v]of Object.entries(headers(type)))res.setHeader(k,v);
    if(req.method==='HEAD')return res.end();
    return res.end(body);
  }catch(error){
    console.error('[meta-v50.5-prepublication-governance]',error);
    res.statusCode=503;res.setHeader('Retry-After','30');
    for(const[k,v]of Object.entries(headers()))res.setHeader(k,v);
    return res.end(JSON.stringify({ok:false,error:'CuHalide Atlas metadata service is temporarily unavailable.',release:RELEASE,gateway_meta_version:META_VERSION,publication_state:PUBLICATION_STATE,public_data_version:PUBLIC_DATA_VERSION,photophysics_contract_version:PHOTOPHYSICS_VERSION,organic_components_contract_version:ORGANIC_COMPONENTS_VERSION}));
  }
}