declare const Deno:any;
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
const RELEASE='3.0.2',PUBLICATION_STATE='prepublication-review',CANONICAL='https://cuhalide-atlas-v3.vercel.app/';
Deno.serve((req:Request)=>new Response(req.method==='HEAD'?null:JSON.stringify({ok:false,status:'retired',message:'This obsolete Supabase metadata gateway is retired. Use the canonical CuHalide Atlas website metadata endpoints.',canonical:CANONICAL,release:RELEASE,publication_state:PUBLICATION_STATE}),{status:410,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive','x-cuhalide-release':RELEASE,'x-cuhalide-publication-state':PUBLICATION_STATE,'x-cuhalide-endpoint-state':'retired'}}));
