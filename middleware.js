export const config={matcher:['/','/index.html','/api/site','/api/ui-site','/api/ui-site.js','/api/ui-assistant','/api/ui-assistant.js','/api/ui-assistant-current','/api/ui-assistant-current.js','/api/public-data','/api/public-data.js','/api/record','/api/record.js','/api/record-current','/api/record-current.js','/api/record-evidence-current','/api/record-evidence-current.js']};
const LAST_MODIFIED=new Date('2026-08-19T00:00:00Z').toUTCString();
const REV='9',UI='51.0',SITE='51',PUBLIC_DATA='2.17.1',PH='1.4.0',OC='1.2.0',STATE='prepublication-review';
export default async function middleware(request){
  const incoming=new URL(request.url);
  const recordPaths=new Set(['/api/record','/api/record.js','/api/record-current','/api/record-current.js','/api/record-evidence-current','/api/record-evidence-current.js']);
  const publicDataPaths=new Set(['/api/public-data','/api/public-data.js']);
  const assistantCompatPaths=new Set(['/api/ui-assistant','/api/ui-assistant.js','/api/ui-assistant-current','/api/ui-assistant-current.js','/api/site','/api/ui-site','/api/ui-site.js']);
  const isRecord=recordPaths.has(incoming.pathname);
  const isPublicData=publicDataPaths.has(incoming.pathname);
  const isAssistantCompat=assistantCompatPaths.has(incoming.pathname);
  const assistantTarget=new URL('/api/ui-r9',request.url);
  const publicDataTarget=new URL('/api/public-data-r9',request.url);
  const recordTarget=new URL('/api/record-r9',request.url);
  const target=isRecord?recordTarget:isPublicData?publicDataTarget:assistantTarget;
  if(isRecord||isPublicData||isAssistantCompat)target.search=incoming.search;
  const response=await fetch(target,{method:request.method,headers:request.headers,redirect:'follow'});
  const headers=new Headers(response.headers);
  headers.set('x-cuhalide-middleware','release-3.0.2-ui-v51.0-current-r9');
  headers.set('x-cuhalide-current-curated-revision',REV);
  headers.set('x-cuhalide-public-data-version',PUBLIC_DATA);
  headers.set('x-cuhalide-publication-state',STATE);
  headers.set('x-cuhalide-ui-version',UI);
  headers.set('x-cuhalide-site-version',SITE);
  headers.set('x-cuhalide-photophysics-contract',PH);
  headers.set('x-cuhalide-organic-components-contract',OC);
  headers.set('last-modified',LAST_MODIFIED);
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,statusText:response.statusText,headers});
}
