import crypto from 'node:crypto';
import rev9Ui from './ui-r9.js';
import { integrateKnowledge } from '../lib/integrated-ui.mjs';
const REV='10',UI='52.0',SITE='52',STATE='prepublication-review';
const all=(s,a,b)=>String(s).split(a).join(b);
function patch(body){
 if(typeof body!=='string')return body;let x=body;
 x=x.replace(/Current Curated rev\.9/gi,'Current Curated rev.10').replace(/current-curated-r9/gi,'current-curated-r10').replace(/current-r9/gi,'current-r10').replace(/\brev\.9\b/gi,'rev.10');
 x=all(x,'19 Aug 2026','14 Sep 2026');x=all(x,'2026-08-19','2026-09-14');x=all(x,'CUHALIDE_UI_V51_0_CURRENT_R9','CUHALIDE_UI_V52_0_CURRENT_R10');x=all(x,'CUHALIDE_SITE_V51_CURRENT_CURATED_R9','CUHALIDE_SITE_V52_CURRENT_CURATED_R10');x=all(x,'<meta name="cuhalide-site-version" content="51">','<meta name="cuhalide-site-version" content="52">');
 x=all(x,'cc.canonical_verified_articles||370','cc.canonical_verified_articles||372');x=all(x,'cc.core_included_structure_rows||890','cc.core_included_structure_rows||901');x=all(x,'cc.verified_space_group_rows||720','cc.verified_space_group_rows||734');x=all(x,'cc.strict_polar_rows||91','cc.strict_polar_rows||94');x=all(x,'cc.strict_polar_articles||57','cc.strict_polar_articles||60');x=all(x,'cc.structure_phase_rows||947','cc.structure_phase_rows||939');x=all(x,'cc.resolved_space_group_rows||747','cc.resolved_space_group_rows||761');x=all(x,'all 947 structure/phase rows','all 939 structure/phase rows');x=all(x,'947 structure/phase rows','939 structure/phase rows');x=all(x,'1,330-document Current Curated rev.10','1,322-document Current Curated rev.10');x=all(x,'1,330 / 1,330','1,322 / 1,322');x=all(x,'Smart RAG 9.20.0','Smart RAG 10.0.0');x=all(x,'Research Assistant 10.5.0','Research Assistant 10.6.0');x=all(x,'Public Data 2.17.1','Public Data 2.18.0');
 return integrateKnowledge(x);
}
function scriptHashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function syncCsp(html,res){const c=String(res.getHeader?.('Content-Security-Policy')||'');if(!c)return;let next=c;const hs=scriptHashes(html);if(hs.length&&/script-src\s+[^;]*;/i.test(next))next=next.replace(/script-src\s+[^;]*;/i,`script-src 'self' ${hs.join(' ')};`);const styles=[...String(html).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>`'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);if(styles.length&&/style-src\s+[^;]*;/i.test(next))next=next.replace(/style-src\s+[^;]*;/i,`style-src 'self' ${[...new Set(styles)].join(' ')};`);if(/(?:^|;\s*)(?:script-src|style-src)\s+[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline forbidden');res.setHeader('Content-Security-Policy',next)}
export default async function handler(req,res){
 res.setHeader('X-CuHalide-Current-Curated-Revision',REV);res.setHeader('X-CuHalide-Site-Version',SITE);res.setHeader('X-CuHalide-UI-Version',UI);res.setHeader('X-CuHalide-Publication-State',STATE);res.setHeader('X-CuHalide-Knowledge-Contract','1.2.0');
 const bridge={setHeader:(k,v)=>{const n=String(k).toLowerCase();if(n==='x-cuhalide-current-curated-revision')v=REV;if(n==='x-cuhalide-site-version')v=SITE;if(n==='x-cuhalide-ui-version')v=UI;if(n==='x-cuhalide-publication-state')v=STATE;return res.setHeader(k,v)},getHeader:k=>res.getHeader?.(k),removeHeader:k=>res.removeHeader?.(k),end:body=>{const out=patch(body);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}};
 Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});return rev9Ui(req,bridge);
}
