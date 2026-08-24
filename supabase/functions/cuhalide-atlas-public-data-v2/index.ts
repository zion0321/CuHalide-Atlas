declare const Deno:any;
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
const RELEASE='3.0.2',STATE='prepublication-review',CANONICAL='https://cuhalide-atlas-v3.vercel.app/';
Deno.serve((req:Request)=>new Response(req.method==='HEAD'?null:JSON.stringify({ok:false,status:'retired',message:'Public Data v2 is retired. Use the canonical CuHalide Atlas Public Data v3 gateway.',canonical:CANONICAL,release:RELEASE,publication_state:STATE}),{status:410,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive','x-cuhalide-release':RELEASE,'x-cuhalide-publication-state':STATE,'x-cuhalide-endpoint-state':'retired'}}));
