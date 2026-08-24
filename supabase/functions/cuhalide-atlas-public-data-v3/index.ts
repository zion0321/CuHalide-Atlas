import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { projectOrganic, organicComponentHealth } from './organic-components-extra.ts';

const BASE=Deno.env.get('SUPABASE_URL'), KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), REST=`${BASE}/rest/v1`;
const UP=`${BASE}/functions/v1/cuhalide-atlas-public-data-v302-public`;
const RELEASE='3.0.2', VERSION='2.16.0', REV='7', PUBLIC='https://cuhalide-atlas-v3.vercel.app', PUBLICATION_STATE='prepublication-review';
const PHOTOPHYSICS_CONTRACT='1.3.0', ORGANIC_COMPONENTS_CONTRACT='1.1.0';
const ALLOWED=new Set([PUBLIC,'http://localhost:8765','http://127.0.0.1:8765']);
const PUBLIC_ACTIONS=new Set(['health','bootstrap','articles','structures','polar','article','structure','article-structures','search','current-curated','candidates','status','errata','motifs','photophysics-health','photophysics','organic-components-health','organic-components']);
const AUTH={apikey:KEY,authorization:`Bearer ${KEY}`,accept:'application/json','content-type':'application/json'};

function cors(req){const o=req.headers.get('origin')||'';return{'access-control-allow-origin':ALLOWED.has(o)?o:PUBLIC,'access-control-allow-methods':'GET,HEAD,OPTIONS','access-control-allow-headers':'accept,content-type','vary':'Origin'}}
function hdr(req,ct='application/json; charset=utf-8'){return{...cors(req),'content-type':ct,'cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive','x-cuhalide-release':RELEASE,'x-cuhalide-public-data-version':VERSION,'x-cuhalide-public-access':'query-and-view','x-cuhalide-publication-state':PUBLICATION_STATE,'x-cuhalide-current-curated-revision':REV,'x-cuhalide-photophysics-contract':PHOTOPHYSICS_CONTRACT,'x-cuhalide-organic-components-contract':ORGANIC_COMPONENTS_CONTRACT}}
const send=(req,x,s=200)=>new Response(req.method==='HEAD'?null:JSON.stringify(x),{status:s,headers:hdr(req)});
function patch(x){if(!x||typeof x!=='object')return x;x.version=VERSION;x.current_curated_revision=7;x.publication_state=PUBLICATION_STATE;x.architecture=x.architecture||'full-current-atomic-structure-snapshot';if(typeof x.public_note==='string')x.public_note=x.public_note.replace(/rev\.6/g,'rev.7').replace(/2026-08-18/g,'2026-08-19');if(x.current_curated&&typeof x.current_curated==='object'&&x.current_curated.current_state)x.current_curated.current_state.live_revision=7;return x}
function projectMotifAtlas(atlas,limit=24){
  const a=atlas&&typeof atlas==='object'?atlas:{};
  const coverage=a.coverage&&typeof a.coverage==='object'?a.coverage:{};
  const categories=(Array.isArray(a.categories)?a.categories:[]).map(r=>({
    primary_category:r?.primary_category??null,
    structure_determinations:r?.structure_determinations??0,
    article_count:r?.article_count??0,
    identity_count:r?.identity_count??0,
    motif_count:r?.motif_count??0,
  }));
  const motifs=(Array.isArray(a.motifs)?a.motifs:[]).map(r=>({
    primary_category:r?.primary_category??null,
    motif_formula:r?.motif_formula??null,
    structure_determinations:r?.structure_determinations??0,
    article_count:r?.article_count??0,
    identity_count:r?.identity_count??0,
  }));
  const examples=(Array.isArray(a.examples)?a.examples:[]).slice(0,limit).map(r=>({
    structure_id:r?.structure_id??null,
    record_id:r?.record_id??null,
    label:r?.label??null,
    formula:r?.formula??null,
    space_group:r?.space_group??null,
    primary_category:r?.primary_category??null,
    motif_formula:r?.motif_formula??null,
    dimensionality:r?.dimensionality??null,
  }));
  return{
    scope:a.scope??null,
    coverage:{
      total_taxonomy_rows:coverage.total_taxonomy_rows??0,
      motif_resolved_rows:coverage.motif_resolved_rows??0,
      motif_unresolved_rows:coverage.motif_unresolved_rows??0,
      primary_classified_rows:coverage.primary_classified_rows??0,
      unresolved_category_rows:coverage.unresolved_category_rows??0,
      unresolved_legacy_category_rows:coverage.unresolved_legacy_category_rows??coverage.unresolved_category_rows??0,
      label_candidate_structures:coverage.label_candidate_structures??0,
      curated_component_structures:coverage.curated_component_structures??0,
    },
    categories,
    motifs,
    examples,
    counting_note:a.counting_note??null,
    component_note:'Detailed curated-component and label-derived candidate inventories are not part of the public Motif Atlas projection.',
    schema_version:a.schema_version??'1.2',
    public_projection:'motif-atlas-aggregate-v1',
    component_inventory_public:false,
  };
}
async function rpc(name,body={}){const r=await fetch(`${REST}/rpc/${name}`,{method:'POST',headers:AUTH,body:JSON.stringify(body),signal:AbortSignal.timeout(30000)}),raw=await r.text();let x;try{x=raw?JSON.parse(raw):null}catch{x={error:'invalid contract response'}}if(!r.ok)throw Error(`${name} ${r.status}: ${x?.message||x?.error||raw.slice(0,160)}`);return x}
function positiveInt(v){const n=Number(v);return Number.isInteger(n)&&n>0?n:null}
function structureIds(raw){const out=[...new Set(String(raw||'').split(',').map(x=>x.trim()).filter(Boolean))];if(!out.length||out.length>40)return null;if(out.some(x=>!/^[A-Za-z0-9_-]{3,80}$/.test(x)))return null;return out}
async function photophysics(recordId,structureId){return rpc('cuhalide_atlas_public_photophysics_record_v2',{p_record_id:recordId,p_structure_id:structureId||null})}
async function organicComponents(ids){const rows=await rpc('cuhalide_atlas_public_organic_components_v1',{p_structure_ids:ids});return rows.map(projectOrganic)}
async function allOrganicRows(){
  const select='structure_id,component_key,display_name,abbreviation,role,normalization_confidence';
  const url=`${REST}/cuhalide_atlas_structure_organic_components?select=${encodeURIComponent(select)}&qc_status=eq.passed&order=${encodeURIComponent('structure_id.asc,component_key.asc')}&limit=1000`;
  const r=await fetch(url,{headers:AUTH,signal:AbortSignal.timeout(30000)}),raw=await r.text();let rows=[];
  try{rows=raw?JSON.parse(raw):[]}catch{throw Error('invalid organic component health response')}
  if(!r.ok)throw Error(`organic component health ${r.status}: ${raw.slice(0,160)}`);
  return rows;
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:hdr(req)});
  if(!['GET','HEAD'].includes(req.method))return send(req,{error:'read-only endpoint',publication_state:PUBLICATION_STATE},405);
  try{
    const u=new URL(req.url), action=String(u.searchParams.get('action')||'health').toLowerCase();
    if(!PUBLIC_ACTIONS.has(action))return send(req,{ok:false,error:'unknown public action',publication_state:PUBLICATION_STATE},404);
    let motifLimit=24;
    if(action==='motifs'){
      motifLimit=Math.max(1,Math.min(24,Number(u.searchParams.get('limit')||24)||24));
      u.searchParams.set('limit',String(motifLimit));
    }
    if(action==='photophysics-health'){
      const x=await rpc('cuhalide_atlas_public_photophysics_health_v2');
      return send(req,{...x,release:RELEASE,public_data_version:VERSION,current_curated_revision:Number(REV),publication_state:PUBLICATION_STATE});
    }
    if(action==='photophysics'){
      const id=positiveInt(u.searchParams.get('id')||u.searchParams.get('record_id'));
      if(!id)return send(req,{ok:false,error:'valid record id required',publication_state:PUBLICATION_STATE},400);
      const structure=String(u.searchParams.get('structure')||u.searchParams.get('structure_id')||'').trim()||null;
      const x=await photophysics(id,structure);
      return send(req,{...x,release:RELEASE,public_data_version:VERSION,current_curated_revision:Number(REV),publication_state:PUBLICATION_STATE});
    }
    if(action==='organic-components-health'){
      const x=organicComponentHealth(await allOrganicRows());
      return send(req,{...x,release:RELEASE,public_data_version:VERSION,current_curated_revision:Number(REV),publication_state:PUBLICATION_STATE});
    }
    if(action==='organic-components'){
      const ids=structureIds(u.searchParams.get('structure_ids')||u.searchParams.get('structure_id'));
      if(!ids)return send(req,{ok:false,error:'1-40 valid structure ids required',publication_state:PUBLICATION_STATE},400);
      const items=await organicComponents(ids);
      return send(req,{ok:true,contract_version:ORGANIC_COMPONENTS_CONTRACT,release:RELEASE,public_data_version:VERSION,current_curated_revision:Number(REV),publication_state:PUBLICATION_STATE,requested_structure_count:ids.length,mapped_structure_count:new Set(items.map(x=>x.structure_id)).size,items});
    }
    const upstreamHeaders={...AUTH,accept:req.headers.get('accept')||'application/json','user-agent':`CuHalide-Atlas-Canonical-Public-Data/${VERSION}`};
    const r=await fetch(UP+u.search,{method:req.method,headers:upstreamHeaders,signal:AbortSignal.timeout(60000)});
    if(req.method==='HEAD')return new Response(null,{status:r.status,headers:hdr(req,r.headers.get('content-type')||undefined)});
    const raw=await r.text();let x;try{x=JSON.parse(raw)}catch{return new Response(raw,{status:r.status,headers:hdr(req,r.headers.get('content-type')||'text/plain; charset=utf-8')})}
    x=patch(x);
    if(r.ok&&action==='motifs'&&x?.atlas)x.atlas=projectMotifAtlas(x.atlas,motifLimit);
    if(r.ok&&x?.item&&(action==='article'||action==='structure')){
      if(action==='structure'&&typeof x.item==='object')delete x.item.organic_components;
      const rid=positiveInt(String(x.item.record_id||u.searchParams.get('id')||''));
      if(rid){
        const sid=action==='structure'?String(x.item.structure_id||u.searchParams.get('id')||'').trim()||null:null;
        try{x.photophysics=await photophysics(rid,sid)}catch(e){console.error('[photophysics-attach]',e);x.photophysics={ok:false,public_state:'temporarily_unavailable',samples:[],conflicts:[]}}
        if(action==='structure'&&sid){
          try{const items=await organicComponents([sid]);x.organic_components=items;x.item.organic_components=items}catch(e){console.error('[organic-components-attach]',e);x.organic_components=[];x.item.organic_components=[]}
        }
      }
    }
    return send(req,x,r.status);
  }catch(e){
    console.error('[canonical-public-data-v2160]',e);
    return send(req,{ok:false,error:'public data unavailable',release:RELEASE,version:VERSION,publication_state:PUBLICATION_STATE},503);
  }
});