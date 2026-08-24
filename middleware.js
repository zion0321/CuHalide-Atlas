export const config={matcher:['/','/index.html','/api/site','/api/ui-site','/api/ui-site.js','/api/ui-assistant','/api/ui-assistant.js','/api/record','/api/record.js','/api/record-current','/api/record-current.js']};
const LAST_MODIFIED=new Date('2026-08-19T00:00:00Z').toUTCString();
export default async function middleware(request){
  const incoming=new URL(request.url);
  const recordPaths=new Set(['/api/record','/api/record.js','/api/record-current','/api/record-current.js']);
  const assistantCompatPaths=new Set(['/api/ui-assistant','/api/ui-assistant.js','/api/site','/api/ui-site','/api/ui-site.js']);
  const isRecord=recordPaths.has(incoming.pathname);
  const isAssistantCompat=assistantCompatPaths.has(incoming.pathname);
  const assistantTarget=new URL('/api/ui-assistant-current',request.url);
  const recordTarget=new URL('/api/record-evidence-current',request.url);
  const target=isRecord?recordTarget:assistantTarget;
  if(isRecord||isAssistantCompat)target.search=incoming.search;
  const response=await fetch(target,{method:request.method,headers:request.headers,redirect:'follow'});
  const headers=new Headers(response.headers);
  headers.set('x-cuhalide-middleware','release-3.0.2-ui-v50.2-current-r7');
  headers.set('x-cuhalide-current-curated-revision','7');
  headers.set('x-cuhalide-publication-state','prepublication-review');
  headers.set('x-cuhalide-ui-version','50.2');
  headers.set('x-cuhalide-site-version','50');
  headers.set('last-modified',LAST_MODIFIED);
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,statusText:response.statusText,headers});
}