declare const Deno:any;
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const BASE=Deno.env.get('SUPABASE_URL')!;
const SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EVIDENCE=`${BASE}/functions/v1/cuhalide-atlas-smart-rag-v302-current-public`;
const CONVERSATION=`${BASE}/functions/v1/cuhalide-atlas-conversation-v1-internal`;
const RELEASE='3.0.2';
const VERSION='10.0.0';
const CURRENT_REVISION='3';
const ALLOWED=new Set(['https://cuhalide-atlas-v3.vercel.app','http://localhost:8765','http://127.0.0.1:8765']);

const META_EN=/(?:^|\b)(?:hello|hi|hey|good morning|good afternoon|good evening|thanks|thank you|what can you do|what are you|who are you|how do i use (?:this|you)|how can you help|help me use (?:this|you))(?:\b|[?!.,]|$)/i;
const META_ZH=/^(?:\s*)(?:你好|您好|嗨|早上好|下午好|晚上好|谢谢|你是谁|你能做什么|你会什么|怎么用|如何使用)(?:[？?！!。.，,]|\s|$)/;
const ATLAS_SPECIFIC=/(?:CuHalide\s*Atlas|\bAtlas\b|数据库|文献库|收录|当前策展|最新策展|curated\s+(?:database|corpus|literature)|current\s+corpus|archived\s+snapshot|literature\s+watch|evidence\s+panel|source\s+cards?)/i;
const IDENTIFIER=/(?:CUH-\d{3}-S\d{2}|\brecord\s*\d+\b|记录\s*\d+|10\.\d{4,9}\/[\w.()/:;-]+|\bCCDC\s*\d+\b)/i;
const MATERIAL=/(?:\bCu\s*\(I\)|\bCuI\b|\bCuBr\b|\bCuCl\b|\bCu\d+(?:Cl|Br|I)\d*\b|iodocupr|bromocupr|chlorocupr|copper\s*\(I\)\s+(?:iodide|bromide|chloride|halide)|cuprous\s+(?:iodide|bromide|chloride)|铜\s*\(?I\)?|铜\(I\)|铜碘|铜溴|铜氯|亚铜|碘化亚铜|溴化亚铜|氯化亚铜)/i;
const EVIDENCE_ACTION=/(?:\bhow many\b|\bcount\b|\bfind\b|\bretrieve\b|\bshow\b|\blist\b|\bwhich\b|\bevidence\b|\bsources?\b|\breported\b|\bliterature\b|\bpaper\b|\barticle\b|\bstructure\b|\bspace\s*group\b|\bpoint\s*group\b|\bpolar\b|\bferroelectric\b|\bmotif\b|\bPLQY\b|\bemission\b|\blifetime\b|\bscintillat|有多少|几篇|几条|查找|检索|列出|哪些|哪篇|证据|来源|报道|文献|论文|文章|结构|空间群|点群|极性|铁电|基元|量子产率|发光|寿命|闪烁)/i;
const GENERAL_DEFINITION_EN=/^(?:\s*)(?:what is\b|what are\b|define\b|explain\b|can you explain\b|please explain\b)/i;
const GENERAL_DEFINITION_ZH=/^(?:\s*)(?:什么是|解释一下|请解释|能解释一下)/;
const FOLLOWUP_EN=/^(?:\s*)(?:why\b|how\b|what about\b|how about\b|and\b|then\b|continue\b|explain that\b|explain this\b|say that again\b|more simply\b)/i;
const FOLLOWUP_ZH=/^(?:\s*)(?:那|那么|为什么|怎么|如何|继续|进一步|这个呢|那这个呢|说简单一点|解释一下刚才|刚才)/;
const LATEST=/(?:latest|newest|recent|new papers?|new literature|just published|literature watch|candidate|最新|最近|新文献|新论文|刚发表|候选)/i;

function isMeta(q:string){return META_EN.test(q)||META_ZH.test(q)}
function isGeneralDefinition(q:string){return GENERAL_DEFINITION_EN.test(q)||GENERAL_DEFINITION_ZH.test(q)}
function isFollowup(q:string){return FOLLOWUP_EN.test(q)||FOLLOWUP_ZH.test(q)}
function cors(req:Request){const o=req.headers.get('origin')||'';return{'access-control-allow-origin':ALLOWED.has(o)?o:'https://cuhalide-atlas-v3.vercel.app','vary':'Origin','access-control-allow-headers':'content-type, accept','access-control-allow-methods':'GET,POST,OPTIONS'}}
function send(req:Request,x:any,status=200){return new Response(JSON.stringify(x),{status,headers:{...cors(req),'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow','x-cuhalide-release':RELEASE,'x-cuhalide-rag-version':VERSION,'x-cuhalide-assistant-version':VERSION,'x-cuhalide-current-curated-revision':CURRENT_REVISION}})}
function messages(b:any){return Array.isArray(b?.messages)?b.messages.filter((m:any)=>['user','assistant'].includes(String(m?.role))&&typeof m?.content==='string').slice(-12):[]}
function userMessages(ms:any[]){return ms.filter((m:any)=>m.role==='user')}
function lastUser(ms:any[]){return String([...ms].reverse().find((m:any)=>m.role==='user')?.content||'').trim()}
function client(req:Request){const x=String(req.headers.get('x-cuhalide-client')||'').toLowerCase();return/^[a-f0-9]{64}$/.test(x)?x:''}
function hasPriorEvidenceContext(ms:any[]){const users=userMessages(ms);if(users.length<2)return false;return users.slice(0,-1).some((m:any)=>ATLAS_SPECIFIC.test(m.content)||IDENTIFIER.test(m.content)||MATERIAL.test(m.content))}
function needsEvidence(ms:any[]){const q=lastUser(ms);if(!q)return false;if(isMeta(q))return false;if(IDENTIFIER.test(q)||ATLAS_SPECIFIC.test(q))return true;if(isGeneralDefinition(q)&&!MATERIAL.test(q))return false;if(MATERIAL.test(q))return true;if(hasPriorEvidenceContext(ms)&&isFollowup(q))return true;return EVIDENCE_ACTION.test(q)&&hasPriorEvidenceContext(ms)}
function researchMode(ms:any[]){const q=lastUser(ms);return LATEST.test(q)&&((ATLAS_SPECIFIC.test(q)||MATERIAL.test(q))||hasPriorEvidenceContext(ms))?'research':'database'}
async function call(url:string,method='GET',body?:string,clientToken=''){const h:any={apikey:SERVICE,authorization:`Bearer ${SERVICE}`,accept:'application/json','content-type':'application/json','user-agent':`CuHalide-Atlas-Research-Assistant/${VERSION}`};if(clientToken)h['x-cuhalide-client']=clientToken;const r=await fetch(url,{method,headers:h,body,signal:AbortSignal.timeout(method==='GET'?35000:method==='POST'&&url===CONVERSATION?45000:120000)}),raw=await r.text();let x:any;try{x=raw?JSON.parse(raw):{}}catch{x={error:'invalid upstream response'}}return{r,x}}
function normalizeBody(b:any,mode:string){return JSON.stringify({...b,messages:messages(b),mode,depth:'standard'})}
async function evidence(req:Request,b:any,token:string,route='evidence'){const mode=researchMode(messages(b)),z=await call(EVIDENCE,'POST',normalizeBody(b,mode),token);return send(req,{...z.x,release:RELEASE,assistant_version:VERSION,route:mode==='research'?'research':route,answer_kind:'evidence',evidence_engine_version:z.x?.version||'9.15.0',write_access:false},z.r.status)}
async function conversation(req:Request,b:any,token:string){const z=await call(CONVERSATION,'POST',normalizeBody(b,'conversation'),token);if(z.r.ok&&z.x?.route_required==='evidence')return evidence(req,b,token,'evidence-reroute');return send(req,{...z.x,release:RELEASE,assistant_version:VERSION,route:'conversation',answer_kind:'conversation',sources:[],write_access:false},z.r.status)}

Deno.serve(async(req:Request)=>{if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});if(!['GET','POST'].includes(req.method))return send(req,{error:'method not allowed'},405);try{
  if(req.method==='GET'){const[e,c]=await Promise.all([call(EVIDENCE),call(CONVERSATION)]),evidenceOk=e.r.ok&&e.x?.ok===true,conversationOk=c.r.ok&&c.x?.ok===true;return send(req,{...e.x,ok:evidenceOk,release:RELEASE,version:e.x?.version||'9.15.0',assistant_version:VERSION,service:'CuHalide Research Assistant',operational_mode:conversationOk?'CONVERSATION_AND_EVIDENCE':(evidenceOk?'EVIDENCE_ONLY':'UNAVAILABLE'),conversation:{ok:conversationOk,version:c.x?.version||'',model:c.x?.model||'none'},evidence:{ok:evidenceOk,engine_version:e.x?.version||'',operational_mode:e.x?.operational_mode||'UNAVAILABLE'},current_curated:e.x?.current_curated||{},corpus:e.x?.corpus||{},temporal_scope:e.x?.temporal_scope||{},capabilities:{...(e.x?.capabilities||{}),natural_conversation:true,automatic_evidence_routing:true,general_scientific_explanation:true,multi_turn_context:true,evidence_grounded_retrieval:true,deterministic_exact_and_protected_boundaries:true,current_curated_retrieval:true,literature_watch_auto_route:true,structure_grain_evidence_guard:true,fractional_motif_conservatism:true,live_web:false},checks:{...(e.x?.checks||{}),conversation_layer_reachable:conversationOk,evidence_layer_reachable:evidenceOk,unified_document_contract:Number(e.x?.corpus?.unified_documents||0)===1322,unified_embedding_contract:Number(e.x?.corpus?.unified_embedded||0)===1322},public_access:'read-only conversational and query interface',write_access:false},evidenceOk?200:503)}
  const raw=await req.text();if(raw.length>20000)return send(req,{ok:false,error:'Request body too large.'},413);let b:any;try{b=JSON.parse(raw)}catch{return send(req,{ok:false,error:'Invalid JSON request.'},400)}const ms=messages(b);if(!ms.length||ms.length>12||ms.some((m:any)=>m.content.length>4000))return send(req,{ok:false,error:'Message history exceeds the public query limits.'},413);const token=client(req);return needsEvidence(ms)?evidence(req,b,token):conversation(req,b,token)
}catch(e){console.error('[research-assistant-v1]',e);return send(req,{ok:false,error:'CuHalide Research Assistant is temporarily unavailable.',release:RELEASE,assistant_version:VERSION,operational_mode:'UNAVAILABLE'},503)}});
