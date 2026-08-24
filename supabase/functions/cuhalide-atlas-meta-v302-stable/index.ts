declare const Deno:any;
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
const STATE='prepublication-review';
Deno.serve((req:Request)=>new Response(req.method==='HEAD'?null:JSON.stringify({ok:false,status:'retired',message:'Obsolete v302 metadata compatibility endpoint retired; use the canonical website metadata gateway.',publication_state:STATE}),{status:410,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive','x-cuhalide-publication-state':STATE,'x-cuhalide-endpoint-state':'retired'}}));
