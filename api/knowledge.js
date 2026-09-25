const UPSTREAM='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3';
const CACHE_TTL_MS=20000,MAX_CACHE_ENTRIES=96,TOTAL_TIMEOUT_MS=24000;const responseCache=new Map();const sleep=ms=>new Promise(r=>setTimeout(r,ms));function trimCache(){while(responseCache.size>MAX_CACHE_ENTRIES)responseCache.delete(responseCache.keys().next().value)}
export function parameters(raw){
 const u=new URL(raw,'https://cuhalide-atlas-v3.vercel.app');
 const action=u.searchParams.get('action')||'coverage',q=(u.searchParams.get('q')||'').trim(),scope=u.searchParams.get('scope')||'all';
 const limit=Number(u.searchParams.get('limit')||12),offset=Number(u.searchParams.get('offset')||0);
 if(!['coverage','articles','retrieve'].includes(action)||!['all','curated','context','reviewed','text'].includes(scope)||q.length>600||(action==='retrieve'&&q.length<2)||!Number.isInteger(limit)||limit<1||limit>20||!Number.isInteger(offset)||offset<0||offset>1000)throw new Error('Invalid query parameters.');
 const target=new URL(UPSTREAM);Object.entries({action:'knowledge-'+action,q,scope,limit,offset}).forEach(([k,v])=>target.searchParams.set(k,String(v)));return target;
}
function normalizePublicBody(body){
 try{
  const x=JSON.parse(body);
  if(x?.coverage){
   x.coverage.articles=Number(x.coverage.catalog_articles||0);
   delete x.coverage.context_articles;
   delete x.coverage.curated_articles;
  }
  if(Array.isArray(x?.items))for(const item of x.items){
   item.has_structured_record=Boolean(item.record_id)||Number(item.structure_count||0)>0;
   item.source_layer='Literature corpus';
   item.evidence_scope='article';
  }
  return JSON.stringify(x);
 }catch{return body}
}
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('X-CuHalide-Knowledge-Contract','1.3.0');res.setHeader('X-CuHalide-Public-Access','query-and-view');
 if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end(JSON.stringify({ok:false,error:'Read-only endpoint.'}))}
 let target;try{target=parameters(req.url)}catch{res.statusCode=400;return res.end(req.method==='HEAD'?'':JSON.stringify({ok:false,error:'Invalid query parameters.'}))}
 const key=`${req.method} ${String(target)}`,now=Date.now(),cached=responseCache.get(key);
 if(cached?.value&&cached.expiresAt>now){res.statusCode=cached.value.status;if(cached.value.status>=500)res.setHeader('Retry-After','30');return res.end(req.method==='HEAD'?'':cached.value.body)}
 let promise=cached?.promise;
 if(!promise){
  promise=(async()=>{const started=Date.now();let last=null,lastError=null;for(let attempt=0;attempt<3;attempt++){const remaining=TOTAL_TIMEOUT_MS-(Date.now()-started);if(remaining<150)break;try{const response=await fetch(target,{headers:{accept:'application/json'},signal:AbortSignal.timeout(Math.min(attempt===0?6000:attempt===1?8000:remaining,remaining))});const raw=await response.text(),body=response.ok?normalizePublicBody(raw):raw;last={status:response.status,body};if(response.status<500&&response.status!==429)return last;if(attempt<2)await sleep(150*(attempt+1))}catch(error){lastError=error;if(attempt<2&&remaining>400)await sleep(150*(attempt+1))}}if(last)return last;throw lastError||new Error('knowledge service unavailable')})().then(value=>{if(value.status<500&&value.status!==429){responseCache.set(key,{value,expiresAt:Date.now()+CACHE_TTL_MS});trimCache()}else responseCache.delete(key);return value}).catch(error=>{if(responseCache.get(key)?.promise===promise)responseCache.delete(key);throw error});
  responseCache.set(key,{promise,expiresAt:0});trimCache();
 }
 try{const out=await promise;res.statusCode=out.status;if(out.status>=500||out.status===429)res.setHeader('Retry-After','30');return res.end(req.method==='HEAD'?'':out.body)}catch{res.statusCode=503;res.setHeader('Retry-After','30');return res.end(req.method==='HEAD'?'':JSON.stringify({ok:false,error:'The knowledge service is temporarily unavailable.'}))}
}
