import fs from 'node:fs';
import path from 'node:path';
const REV='10',SITE='52',UI='52.0',STATE='prepublication-review';
const ASSETS={
  photophysics:'ui-photophysics-v1.js',
  structure_photophysics:'ui-structure-photophysics-v1.js',
  organic_components:'organic-components-v1.js'
};
export default function handler(req,res){
  const u=new URL(req.url,'https://cuhalide-atlas-v3.vercel.app'),key=String(u.searchParams.get('asset')||''),file=ASSETS[key];
  if(!file){res.statusCode=404;res.setHeader('Content-Type','text/plain; charset=utf-8');return res.end('Not Found')}
  try{
    let body=fs.readFileSync(path.join(process.cwd(),'public',file),'utf8').replace(/CURRENT_REVISION=9/g,'CURRENT_REVISION=10');
    if(/CURRENT_REVISION=9/.test(body))throw new Error('stale revision token');
    res.statusCode=200;
    res.setHeader('Content-Type','text/javascript; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=300, must-revalidate');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
    res.setHeader('X-CuHalide-Current-Curated-Revision',REV);
    res.setHeader('X-CuHalide-Site-Version',SITE);
    res.setHeader('X-CuHalide-UI-Version',UI);
    res.setHeader('X-CuHalide-Publication-State',STATE);
    if(req.method==='HEAD')return res.end();
    return res.end(body);
  }catch(e){console.error('[assets-r10]',e);res.statusCode=503;res.setHeader('Content-Type','text/plain; charset=utf-8');return res.end('Asset temporarily unavailable')}
}
