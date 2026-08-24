import recordCurrent from './record-current.js';
import {applyRecordPrepublicationGovernance,PUBLICATION_STATE} from '../lib/prepublication-governance.js';

const ZERO_SAMPLE_CARD=/<section class="card"><p class="eyebrow">Photophysics<\/p><span class="status">(Two-pass verified|Pass A curated)<\/span><p class="fine">[\s\S]*?0 curated sample states · 0 measurements · 0 normalized values\. Crystal-intrinsic, processed, composite, and device states remain separate; quantitative-analysis eligibility is independently gated\.<\/p><\/section>/g;
const ARCHIVED_PROVENANCE='Part of archived scientific snapshot 3.0.2 · retained in the current corpus';
const LIVING_INHERITED_PROVENANCE='Current Curated rev.7 context · core article record inherited from immutable Frozen Release 3.0.2 baseline';
const ARCHIVED_JSON='"dateModified":"2026-08-11","isPartOf":{"@type":"Dataset","name":"CuHalide Atlas archived scientific snapshot 3.0.2","version":"3.0.2","url":"https://cuhalide-atlas-v3.vercel.app"}}';
const LIVING_JSON='"dateModified":"2026-08-19","isPartOf":{"@type":"Dataset","name":"CuHalide Atlas living knowledge base","version":"current-r7","url":"https://cuhalide-atlas-v3.vercel.app"},"isBasedOn":{"@type":"Dataset","name":"CuHalide Atlas archived scientific snapshot 3.0.2","version":"3.0.2","url":"https://cuhalide-atlas-v3.vercel.app"}}';

function requestKind(req){
  try{return String(new URL(String(req?.url||'/'),'http://local').searchParams.get('kind')||'').toLowerCase()}
  catch{return ''}
}

function hardenArticleProvenance(body,kind){
  if(kind!=='article'||typeof body!=='string')return body;
  let out=body;
  if(out.includes(ARCHIVED_PROVENANCE))out=out.split(ARCHIVED_PROVENANCE).join(LIVING_INHERITED_PROVENANCE);
  if(out.includes(ARCHIVED_JSON))out=out.split(ARCHIVED_JSON).join(LIVING_JSON);
  return out;
}

function hardenStructurePhotophysics(body,kind){
  if(kind!=='structure'||typeof body!=='string')return body;
  let out=body;
  if(out.includes('0 curated sample states · 0 measurements · 0 normalized values')){
    out=out.replace(ZERO_SAMPLE_CARD,(_match,stage)=>`<section class="card"><p class="eyebrow">Photophysics</p><span class="status">No structure-mapped data</span><p class="fine">No curated photophysics sample or measurement is mapped to this structure. The parent article review stage is ${stage}, but article-level and other sample-grain measurements are not assigned to this structure without an explicit structure mapping. This boundary prevents article-level photophysics from being misread as an intrinsic property of the crystallographic structure.</p></section>`);
  }
  out=out.replace('<span class="status">Two-pass verified</span><p class="fine">Independent Pass A and Pass B review agree for this exposed article-level photophysics state.','<span class="status">Parent article · Two-pass verified</span><p class="fine">The parent article is two-pass verified. This structure page exposes only photophysics samples explicitly mapped to this structure; sample and measurement grain remain preserved.');
  out=out.replace('<span class="status">Pass A curated</span><p class="fine">Primary-evidence Pass A curation is complete; independent Pass B verification has not yet been completed. Measurement-level QC and conflict gates remain fail-closed.','<span class="status">Parent article · Pass A curated</span><p class="fine">The parent article has completed Pass A curation; independent Pass B verification is not yet complete. This structure page exposes only photophysics samples explicitly mapped to this structure, and measurement-level QC/conflict gates remain fail-closed.');
  return out;
}

export default async function handler(req,res){
  const kind=requestKind(req);
  res.setHeader('X-CuHalide-Publication-State',PUBLICATION_STATE);
  const bridge={
    setHeader:(name,value)=>String(name).toLowerCase()==='x-cuhalide-publication-state'?res.setHeader(name,PUBLICATION_STATE):res.setHeader(name,value),
    getHeader:name=>res.getHeader?.(name),
    removeHeader:name=>res.removeHeader?.(name),
    end:body=>{
      let out=hardenArticleProvenance(body,kind);
      out=hardenStructurePhotophysics(out,kind);
      out=applyRecordPrepublicationGovernance(out);
      res.removeHeader?.('Content-Length');
      return res.end(out);
    }
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return recordCurrent(req,bridge);
}
