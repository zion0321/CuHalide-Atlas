const UPSTREAM='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3';
export function parameters(raw){
 const u=new URL(raw,'https://cuhalide-atlas-v3.vercel.app');
 const action=u.searchParams.get('action')||'coverage',q=(u.searchParams.get('q')||'').trim(),scope=u.searchParams.get('scope')||'all';
 const limit=Number(u.searchParams.get('limit')||12),offset=Number(u.searchParams.get('offset')||0);
 if(!['coverage','articles','retrieve'].includes(action)||!['all','curated','context','reviewed'].includes(scope)||q.length>600||(action==='retrieve'&&q.length<2)||!Number.isInteger(limit)||limit<1||limit>20||!Number.isInteger(offset)||offset<0||offset>1000)throw new Error('Invalid query parameters.');
 const target=new URL(UPSTREAM);Object.entries({action:'knowledge-'+action,q,scope,limit,offset}).forEach(([k,v])=>target.searchParams.set(k,String(v)));return target;
}
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('X-CuHalide-Knowledge-Contract','1.1.0');res.setHeader('X-CuHalide-Public-Access','query-and-view');
 if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end(JSON.stringify({ok:false,error:'Read-only endpoint.'}))}
 let target;try{target=parameters(req.url)}catch{res.statusCode=400;return res.end(req.method==='HEAD'?'':JSON.stringify({ok:false,error:'Invalid query parameters.'}))}
 try{const response=await fetch(target,{headers:{accept:'application/json'},signal:AbortSignal.timeout(20000)});const data=await response.json();res.statusCode=response.status;if(response.status>=500)res.setHeader('Retry-After','30');return res.end(req.method==='HEAD'?'':JSON.stringify(data))}catch{res.statusCode=503;res.setHeader('Retry-After','30');return res.end(req.method==='HEAD'?'':JSON.stringify({ok:false,error:'The knowledge service is temporarily unavailable.'}))}
}
