const DATA_UPSTREAM='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3';
const CONTRACT_UPSTREAM='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-runtime-contract-v1-public';
const PUBLIC_ORIGIN='https://cuhalide-atlas-v3.vercel.app';
const PUBLIC_DATA_VERSION='2.16.0';
const CURRENT_REVISION='8';
const PHOTOPHYSICS_CONTRACT='1.3.3';
const ORGANIC_COMPONENTS_CONTRACT='1.1.0';
const PUBLICATION_STATE='prepublication-review';
const PUBLIC_ACTIONS=new Set(['health','bootstrap','articles','structures','polar','article','structure','article-structures','search','current-curated','candidates','status','errata','motifs','photophysics-health','photophysics','organic-components-health','organic-components']);
const TOTAL_TIMEOUT_MS=30000,FIRST_ATTEMPT_TIMEOUT_MS=6500,RETRY_DELAY_MS=150,CACHE_TTL_MS=30000,MAX_CACHE_ENTRIES=96;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const snapshotCache=new Map();
function trimSnapshotCache(){while(snapshotCache.size>MAX_CACHE_ENTRIES)snapshotCache.delete(snapshotCache.keys().next().value)}
function targetUrl(incoming){const action=String(incoming.searchParams.get('action')||'health').toLowerCase(),control=action==='health'||action==='bootstrap',upstream=new URL(control?CONTRACT_UPSTREAM:DATA_UPSTREAM);for(const[key,value]of incoming.searchParams.entries()){if(key==='action'&&action==='health')continue;upstream.searchParams.append(key,value)}if(action==='health')upstream.searchParams.set('action','public-health');if(action==='motifs'){const limit=Math.max(1,Math.min(24,Number(upstream.searchParams.get('limit')||24)||24));upstream.searchParams.set('limit',String(limit))}return upstream}
async function fetchSnapshotUncached(url,req){
 const started=Date.now();let last=null,lastError=null;
 for(let attempt=0;attempt<3;attempt++){
  const remaining=TOTAL_TIMEOUT_MS-(Date.now()-started);
  if(remaining<=250){if(last)return last;throw lastError||new Error('Public data timeout')}
  const controller=new AbortController(),attemptBudget=attempt===0?FIRST_ATTEMPT_TIMEOUT_MS:attempt===1?Math.min(8500,remaining):remaining,timer=setTimeout(()=>controller.abort(),Math.max(250,Math.min(attemptBudget,remaining)));
  try{
   const response=await fetch(url,{method:req.method,headers:{accept:req.headers.accept||'application/json','user-agent':req.headers['user-agent']||`CuHalide-Atlas-Vercel-Public-Data/${PUBLIC_DATA_VERSION}`},redirect:'follow',signal:controller.signal}),body=req.method==='HEAD'?'':await response.text(),snapshot={status:response.status,headers:response.headers,body};
   last=snapshot;const retryable=response.status===429||response.status>=500;
   if(!retryable||attempt===2)return snapshot;
  }catch(e){lastError=e;if(attempt===2){if(last)return last;throw e}}finally{clearTimeout(timer)}
  await sleep(RETRY_DELAY_MS*(attempt+1));
 }
 if(last)return last;throw lastError||new Error('Public data backend failed')
}
async function fetchSnapshot(url,req){
 const cacheable=['GET','HEAD'].includes(req.method||'GET'),key=`${req.method||'GET'} ${String(url)}`,now=Date.now();
 if(cacheable){const hit=snapshotCache.get(key);if(hit?.value&&hit.expiresAt>now)return hit.value;if(hit?.promise)return hit.promise}
 const promise=fetchSnapshotUncached(url,req).then(snapshot=>{if(cacheable&&snapshot.status>=200&&snapshot.status<500){snapshotCache.set(key,{value:snapshot,expiresAt:Date.now()+CACHE_TTL_MS});trimSnapshotCache()}else if(cacheable)snapshotCache.delete(key);return snapshot}).catch(error=>{if(cacheable&&snapshotCache.get(key)?.promise===promise)snapshotCache.delete(key);throw error});
 if(cacheable){snapshotCache.set(key,{promise,expiresAt:0});trimSnapshotCache()}
 return promise
}
function commonHeaders(res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('X-CuHalide-Public-Access','query-and-view');res.setHeader('X-CuHalide-Publication-State',PUBLICATION_STATE);res.setHeader('X-CuHalide-Public-Data-Version',PUBLIC_DATA_VERSION);res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);res.setHeader('X-CuHalide-Photophysics-Contract',PHOTOPHYSICS_CONTRACT);res.setHeader('X-CuHalide-Organic-Components-Contract',ORGANIC_COMPONENTS_CONTRACT)}
function annotateArticleContext(incoming,snapshot){if(snapshot.status!==200||String(incoming.searchParams.get('action')||'').toLowerCase()!=='article'||!snapshot.body)return snapshot.body;let x;try{x=JSON.parse(snapshot.body)}catch{return snapshot.body}if(!x?.item||typeof x.item!=='object')return snapshot.body;const origin=String(x.data_scope||'unresolved'),originRevision=Number(x.item.live_revision||0);x.record_context={serving_context:'current_curated',serving_revision:Number(CURRENT_REVISION),core_record_origin:origin,core_record_origin_release:origin==='frozen_release'?'3.0.2':null,core_record_origin_revision:originRevision>0?originRevision:null,attached_photophysics_context:x.photophysics&&typeof x.photophysics==='object'?'current_curated':null,attached_photophysics_contract:x.photophysics&&typeof x.photophysics==='object'?PHOTOPHYSICS_CONTRACT:null,context_policy:'core_origin_preserved_current_overlays_explicit'};return JSON.stringify(x)}
export default async function handler(req,res){commonHeaders(res);if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method Not Allowed')}try{const incoming=new URL(req.url,PUBLIC_ORIGIN),action=String(incoming.searchParams.get('action')||'health').toLowerCase();if(!PUBLIC_ACTIONS.has(action)){res.statusCode=404;res.setHeader('Content-Type','application/json; charset=utf-8');if(req.method==='HEAD')return res.end();return res.end(JSON.stringify({ok:false,error:'unknown public action',publication_state:PUBLICATION_STATE}))}const snapshot=await fetchSnapshot(targetUrl(incoming),req);res.statusCode=snapshot.status;res.setHeader('Content-Type',snapshot.headers.get('content-type')||'application/json; charset=utf-8');const rel=snapshot.headers.get('x-cuhalide-release');if(rel)res.setHeader('X-CuHalide-Release',rel);if(snapshot.status===429||snapshot.status>=500)res.setHeader('Retry-After',snapshot.headers.get('retry-after')||'30');if(req.method==='HEAD')return res.end();return res.end(annotateArticleContext(incoming,snapshot))}catch(error){console.error('[public-data-v50.2-prepublication-hardening]',error);res.statusCode=503;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Retry-After','30');res.setHeader('X-CuHalide-Release','3.0.2');if(req.method==='HEAD')return res.end();return res.end(JSON.stringify({error:'CuHalide Atlas public data backend is temporarily unavailable.',release:'3.0.2',version:PUBLIC_DATA_VERSION,publication_state:PUBLICATION_STATE,photophysics_contract:PHOTOPHYSICS_CONTRACT,organic_components_contract:ORGANIC_COMPONENTS_CONTRACT,public_access:'query-and-view'}))}}