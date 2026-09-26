import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const PROTOCOL_ID='CUXPLORE_BLIND_CATION_RECOMMENDATION_V1_20260925';
const PUBLICATION_STATE='prepublication-review';

function headers(){
  return {
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store',
    'x-content-type-options':'nosniff',
    'x-robots-tag':'noindex, nofollow, noarchive',
    'x-cuhalide-endpoint-state':'retired-frozen-execution',
    'x-cuhalide-publication-state':PUBLICATION_STATE
  };
}

Deno.serve((req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers()});
  if(!['GET','HEAD'].includes(req.method)){
    return new Response(req.method==='HEAD'?null:JSON.stringify({
      ok:false,
      status:'retired',
      protocol_id:PROTOCOL_ID,
      error:'Frozen execution endpoint is retired.'
    }),{status:405,headers:{...headers(),allow:'GET, HEAD, OPTIONS'}});
  }
  const body={
    ok:false,
    status:'retired',
    protocol_id:PROTOCOL_ID,
    frozen_on:'2026-09-25',
    immutable_records_retained:true,
    rerun_enabled:false,
    write_access:false,
    reason:'The outcome-isolated execution is frozen. Preserved database rows and recorded hashes are the authoritative run provenance.'
  };
  return new Response(req.method==='HEAD'?null:JSON.stringify(body),{status:410,headers:headers()});
});
