const RELEASE='3.0.2';
const PUBLICATION_STATE='prepublication-review';

function commonHeaders(res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('X-CuHalide-Release',RELEASE);
  res.setHeader('X-CuHalide-Publication-State',PUBLICATION_STATE);
  res.setHeader('X-CuHalide-Public-Access','query-and-view');
}

export default async function handler(req,res){
  commonHeaders(res);
  if(!['GET','HEAD'].includes(req.method)){
    res.statusCode=405;
    res.setHeader('Allow','GET, HEAD');
    return res.end('Method Not Allowed');
  }
  res.statusCode=410;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method==='HEAD')return res.end();
  return res.end(JSON.stringify({
    error:'Bulk dataset exports are unavailable during prepublication review.',
    release:RELEASE,
    publication_state:PUBLICATION_STATE,
    release_state:'prepublication',
    public_access:'query-and-view',
    guidance:'Use the CuHalide Atlas search, record pages, Research Assistant, citation metadata and manuscript-specific data-availability process.'
  }));
}
