import recordCurrent from './record-current.js';

const ZERO_SAMPLE_CARD=/<section class="card"><p class="eyebrow">Photophysics<\/p><span class="status">(Two-pass verified|Pass A curated)<\/span><p class="fine">[\s\S]*?0 curated sample states · 0 measurements · 0 normalized values\. Crystal-intrinsic, processed, composite, and device states remain separate; quantitative-analysis eligibility is independently gated\.<\/p><\/section>/g;

function requestKind(req){
  try{return String(new URL(String(req?.url||'/'),'http://local').searchParams.get('kind')||'').toLowerCase()}
  catch{return ''}
}

function hardenStructurePhotophysics(body,kind){
  if(kind!=='structure'||typeof body!=='string'||!body.includes('0 curated sample states · 0 measurements · 0 normalized values'))return body;
  return body.replace(ZERO_SAMPLE_CARD,(_match,stage)=>`<section class="card"><p class="eyebrow">Photophysics</p><span class="status">No structure-mapped data</span><p class="fine">No curated photophysics sample or measurement is mapped to this structure. The parent article review stage is ${stage}, but article-level and other sample-grain measurements are not assigned to this structure without an explicit structure mapping. This boundary prevents article-level photophysics from being misread as an intrinsic property of the crystallographic structure.</p></section>`);
}

export default async function handler(req,res){
  const kind=requestKind(req);
  const bridge={
    setHeader:(name,value)=>res.setHeader(name,value),
    getHeader:name=>res.getHeader?.(name),
    removeHeader:name=>res.removeHeader?.(name),
    end:body=>{const out=hardenStructurePhotophysics(body,kind);res.removeHeader?.('Content-Length');return res.end(out)}
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return recordCurrent(req,bridge);
}
