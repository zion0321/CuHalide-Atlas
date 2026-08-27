import currentData from './public-data.js';
const REV='9',VERSION='2.17.1',PH='1.4.0',OC='1.2.0',STATE='prepublication-review';
const ARTICLE_DIMENSION_SEMANTICS='article_index_class_not_structure_grain';
function patchValue(v){
  if(Array.isArray(v))return v.map(patchValue);
  if(!v||typeof v!=='object')return v;
  const o={};
  for(const[k,x]of Object.entries(v)){
    if(k==='current_curated_revision'||k==='live_revision')o[k]=9;
    else if(k==='version'&&String(x)==='2.16.0')o[k]=VERSION;
    else if(k==='public_data_version')o[k]=VERSION;
    else if(k==='photophysics_contract'||k==='photophysics_contract_version')o[k]=PH;
    else if(k==='organic_components_contract'||k==='organic_components_contract_version')o[k]=OC;
    else if(typeof x==='string')o[k]=x.replaceAll('Current Curated rev.8','Current Curated rev.9').replaceAll('current-curated-r8','current-curated-r9').replaceAll('current-r8','current-r9');
    else o[k]=patchValue(x);
  }
  if(o.serving_context==='current_curated')o.serving_revision=9;
  if(o.attached_photophysics_context==='current_curated')o.attached_photophysics_contract=PH;
  if(o.attached_organic_components_context==='current_curated')o.attached_organic_components_contract=OC;
  const looksLikeArticle=Object.prototype.hasOwnProperty.call(o,'dimensionality_class')&&!Object.prototype.hasOwnProperty.call(o,'structure_id')&&(Object.prototype.hasOwnProperty.call(o,'title')||Object.prototype.hasOwnProperty.call(o,'authors')||Object.prototype.hasOwnProperty.call(o,'journal'));
  if(looksLikeArticle){
    o.article_index_class=o.dimensionality_class;
    o.dimensionality_field_semantics=ARTICLE_DIMENSION_SEMANTICS;
    o.structure_dimensionality_source='structure_phase_records';
  }
  return o
}
function patchBody(body){if(!body)return body;try{return JSON.stringify(patchValue(JSON.parse(String(body))))}catch{return String(body).replaceAll('Current Curated rev.8','Current Curated rev.9').replaceAll('current-curated-r8','current-curated-r9').replaceAll('current-r8','current-r9')}}
export default async function handler(req,res){
  const bridge={setHeader:(k,v)=>{const n=String(k).toLowerCase();if(n==='x-cuhalide-public-data-version')v=VERSION;if(n==='x-cuhalide-current-curated-revision')v=REV;if(n==='x-cuhalide-photophysics-contract')v=PH;if(n==='x-cuhalide-organic-components-contract')v=OC;if(n==='x-cuhalide-publication-state')v=STATE;return res.setHeader(k,v)},getHeader:k=>res.getHeader?.(k),removeHeader:k=>res.removeHeader?.(k),end:body=>{res.removeHeader?.('Content-Length');return res.end(patchBody(body))}};
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});
  res.setHeader('X-CuHalide-Public-Data-Version',VERSION);res.setHeader('X-CuHalide-Current-Curated-Revision',REV);res.setHeader('X-CuHalide-Photophysics-Contract',PH);res.setHeader('X-CuHalide-Organic-Components-Contract',OC);res.setHeader('X-CuHalide-Publication-State',STATE);
  return currentData(req,bridge);
}
