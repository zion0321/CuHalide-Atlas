import recordCurrent from './record-current.js';
import {applyRecordPrepublicationGovernance,PUBLICATION_STATE} from '../lib/prepublication-governance.js';

const PHOTOPHYSICS_CONTRACT='1.3.3';
const ZERO_SAMPLE_CARD=/<section class="card"><p class="eyebrow">Photophysics<\/p><span class="status">(Two-pass verified|Pass A curated)<\/span><p class="fine">[\s\S]*?0 curated sample states · 0 measurements · 0 normalized values\. Crystal-intrinsic, processed, composite, and device states remain separate; quantitative-analysis eligibility is independently gated\.<\/p><\/section>/g;
const ARTICLE_JSONLD=/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
const ARCHIVED_PROVENANCE='Part of archived scientific snapshot 3.0.2 · retained in the current corpus';
const LIVING_INHERITED_PROVENANCE='Current Curated rev.8 context · core article record inherited from immutable Frozen Release 3.0.2 baseline';
const LIVING_DATASET={
  '@type':'Dataset',
  name:'CuHalide Atlas living knowledge base',
  version:'current-r8',
  url:'https://cuhalide-atlas-v3.vercel.app'
};
const FROZEN_DATASET={
  '@type':'Dataset',
  name:'CuHalide Atlas archived scientific snapshot 3.0.2',
  version:'3.0.2',
  url:'https://cuhalide-atlas-v3.vercel.app'
};

function requestKind(req){
  try{return String(new URL(String(req?.url||'/'),'http://local').searchParams.get('kind')||'').toLowerCase()}
  catch{return ''}
}

function hardenArticleProvenance(body,kind){
  if(kind!=='article'||typeof body!=='string')return body;
  return body.includes(ARCHIVED_PROVENANCE)?body.split(ARCHIVED_PROVENANCE).join(LIVING_INHERITED_PROVENANCE):body;
}

function lockPhotophysicsContract(body){
  if(typeof body!=='string')return body;
  return body
    .split('Structured Photophysics 1.3.2').join(`Structured Photophysics ${PHOTOPHYSICS_CONTRACT}`)
    .split('Photophysics 1.3.2').join(`Photophysics ${PHOTOPHYSICS_CONTRACT}`);
}

function doiUrl(value){
  const sameAs=String(value?.sameAs||'').trim();
  if(/^https:\/\/doi\.org\//i.test(sameAs))return sameAs;
  const identifier=String(value?.identifier||'').trim();
  return identifier?`https://doi.org/${identifier}`:'';
}

function articlePageJsonLd(source){
  const recordUrl=String(source?.url||'').trim();
  const title=String(source?.name||source?.headline||'CuHalide Atlas article record').trim();
  const sourceUrl=doiUrl(source);
  const frozenOrigin=source?.isPartOf?.version==='3.0.2'||String(source?.isPartOf?.name||'').includes('archived scientific snapshot 3.0.2');
  const article={
    '@type':'ScholarlyArticle',
    '@id':sourceUrl||`${recordUrl}#source-article`,
    headline:String(source?.headline||title),
    name:title,
    identifier:source?.identifier,
    ...(sourceUrl?{url:sourceUrl,sameAs:sourceUrl}:{}),
    datePublished:source?.datePublished
  };
  for(const key of Object.keys(article))if(article[key]==null||article[key]==='')delete article[key];
  return {
    '@context':'https://schema.org',
    '@type':'WebPage',
    '@id':`${recordUrl}#record`,
    url:recordUrl,
    name:`${title} — CuHalide Atlas article record`,
    dateModified:'2026-08-19',
    isPartOf:{...LIVING_DATASET},
    ...(frozenOrigin?{isBasedOn:{...FROZEN_DATASET}}:{}),
    mainEntity:article
  };
}

function separateArticleStructuredData(body,kind){
  if(kind!=='article'||typeof body!=='string'||!body.includes('<script type="application/ld+json">'))return body;
  let rewritten=0;
  const out=body.replace(ARTICLE_JSONLD,(full,raw)=>{
    let value;
    try{value=JSON.parse(raw)}catch{return full}
    if(value?.['@type']!=='ScholarlyArticle')return full;
    rewritten+=1;
    return `<script type="application/ld+json">${JSON.stringify(articlePageJsonLd(value))}</script>`;
  });
  if(!body.includes('Record not found')&&rewritten!==1)throw new Error(`article JSON-LD separation expected one ScholarlyArticle source, found ${rewritten}`);
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
    setHeader:(name,value)=>{
      const key=String(name).toLowerCase();
      if(key==='x-cuhalide-publication-state')return res.setHeader(name,PUBLICATION_STATE);
      if(key==='x-cuhalide-photophysics-contract')return res.setHeader(name,PHOTOPHYSICS_CONTRACT);
      return res.setHeader(name,value);
    },
    getHeader:name=>res.getHeader?.(name),
    removeHeader:name=>res.removeHeader?.(name),
    end:body=>{
      let out=hardenArticleProvenance(body,kind);
      out=separateArticleStructuredData(out,kind);
      out=hardenStructurePhotophysics(out,kind);
      out=lockPhotophysicsContract(out);
      out=applyRecordPrepublicationGovernance(out);
      res.removeHeader?.('Content-Length');
      return res.end(out);
    }
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return recordCurrent(req,bridge);
}
