declare const Deno:any;
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
const SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VERSION='retired-rag-indexer-release-3.0.0-1';
const H={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive','x-cuhalide-endpoint-state':'retired-internal-service-only'};
function internal(req:Request){return req.headers.get('authorization')===`Bearer ${SERVICE}`&&req.headers.get('apikey')===SERVICE}
const send=(x:any,s=200)=>new Response(JSON.stringify(x),{status:s,headers:H});
Deno.serve((req:Request)=>{if(!internal(req))return send({ok:false,error:'internal service authorization required'},401);return send({ok:false,status:'retired',version:VERSION,message:'Obsolete Release 3.0.0 RAG embedding indexer retired; the frozen release is immutable and current RAG indexing is managed by the controlled curation pipeline.'},410)});
