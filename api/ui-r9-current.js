import crypto from 'node:crypto';
import rev9Ui from './ui-r9.js';

const replacements=[
  ['cc.canonical_verified_articles||370','cc.canonical_verified_articles||371'],
  ['cc.core_included_structure_rows||890','cc.core_included_structure_rows||901'],
  ['cc.resolved_space_group_rows||747','cc.resolved_space_group_rows||760'],
  ['cc.verified_space_group_rows||720','cc.verified_space_group_rows||733'],
  ['cc.strict_polar_rows||91','cc.strict_polar_rows||94'],
  ['cc.strict_polar_articles||57','cc.strict_polar_articles||60'],
  ['Curated literature · n = 370','Curated literature · n = 371'],
  ['Core-Included · n=890','Core-Included · n=901'],
  ['Core-Included structure rows · n = 890','Core-Included structure rows · n = 901'],
  ['Resolved structure rows · n = 747','Resolved structure rows · n = 760'],
  ['<div class="polar-num"><strong>91</strong><small>strict-polar rows · 57 articles</small></div>','<div class="polar-num"><strong>94</strong><small>strict-polar rows · 60 articles</small></div>'],
  ['<strong id="pcount">91 rows</strong>','<strong id="pcount">94 rows</strong>']
];
const all=(s,a,b)=>String(s).split(a).join(b);
function patch(input){
  if(typeof input!=='string')return input;
  let out=input;
  for(const [from,to] of replacements)out=all(out,from,to);
  for(const stale of ['cc.canonical_verified_articles||370','cc.core_included_structure_rows||890','cc.resolved_space_group_rows||747','cc.verified_space_group_rows||720','cc.strict_polar_rows||91','cc.strict_polar_articles||57']){
    if(out.includes(stale))throw new Error(`stale 2026-09-10 rev.9 UI fallback: ${stale}`);
  }
  for(const required of ['cc.canonical_verified_articles||371','cc.core_included_structure_rows||901','cc.resolved_space_group_rows||760','cc.strict_polar_rows||94']){
    if(!out.includes(required))throw new Error(`current 2026-09-10 rev.9 UI fallback missing: ${required}`);
  }
  return out;
}
function inlineHashes(html,tag){
  const out=[];
  const re=tag==='script'?/<script\b([^>]*)>([\s\S]*?)<\/script>/gi:/<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while((m=re.exec(String(html)))){
    if(tag==='script'&&/\bsrc\s*=/i.test(m[1]))continue;
    const body=tag==='script'?m[2]:m[1];
    out.push(`'sha256-${crypto.createHash('sha256').update(body).digest('base64')}'`);
  }
  return [...new Set(out)];
}
function syncCsp(html,res){
  const current=String(res.getHeader?.('Content-Security-Policy')||'');
  if(!current)return;
  let next=current;
  const scripts=inlineHashes(html,'script');
  const styles=inlineHashes(html,'style');
  if(scripts.length&&/script-src\s+[^;]*;/i.test(next))next=next.replace(/script-src\s+[^;]*;/i,`script-src 'self' ${scripts.join(' ')};`);
  if(styles.length&&/style-src\s+[^;]*;/i.test(next))next=next.replace(/style-src\s+[^;]*;/i,`style-src ${styles.join(' ')};`);
  if(/script-src[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline forbidden');
  res.setHeader('Content-Security-Policy',next);
}
export default async function handler(req,res){
  const bridge={
    setHeader:(k,v)=>res.setHeader(k,v),
    getHeader:k=>res.getHeader?.(k),
    removeHeader:k=>res.removeHeader?.(k),
    end:body=>{
      const out=patch(body);
      if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);
      res.removeHeader?.('Content-Length');
      return res.end(out);
    }
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});
  return rev9Ui(req,bridge);
}
