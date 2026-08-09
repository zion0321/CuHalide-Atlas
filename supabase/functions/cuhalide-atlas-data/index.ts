declare const Deno:any;
const BASE=Deno.env.get('SUPABASE_URL')!;
const TARGET=`${BASE}/functions/v1/cuhalide-atlas-data-stable`;
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization, x-client-info, apikey, content-type, accept','access-control-allow-methods':'GET,HEAD,POST,OPTIONS'};
const DEPRECATION={'deprecation':'true','link':`<${TARGET}>; rel="successor-version"`,'x-cuhalide-compatibility-layer':'true'};
function json(x:any,status=200){return new Response(JSON.stringify(x),{status,headers:{...CORS,...DEPRECATION,'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...CORS,...DEPRECATION}});
  if(!['GET','HEAD','POST'].includes(req.method))return json({error:'method not allowed',replacement:TARGET},405);
  try{
    const incoming=new URL(req.url), target=new URL(TARGET);
    for(const [k,v] of incoming.searchParams)target.searchParams.append(k,v);
    const headers=new Headers(req.headers);headers.delete('host');headers.delete('content-length');
    const upstream=await fetch(target,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:req.body,redirect:'manual'});
    const outHeaders=new Headers(upstream.headers);
    for(const [k,v] of Object.entries(CORS))outHeaders.set(k,v);
    for(const [k,v] of Object.entries(DEPRECATION))outHeaders.set(k,v);
    outHeaders.set('x-content-type-options','nosniff');
    return new Response(req.method==='HEAD'?null:upstream.body,{status:upstream.status,headers:outHeaders});
  }catch(e){return json({error:'compatibility gateway unavailable',replacement:TARGET,detail:String(e)},503)}
});
