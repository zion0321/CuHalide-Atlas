export const config={matcher:['/','/index.html','/api/site','/api/ui-site','/api/ui-assistant','/api/record','/api/record-current']};
const LAST_MODIFIED=new Date('2026-08-19T00:00:00Z').toUTCString();
export default async function middleware(request){
  const incoming=new URL(request.url);
  const isRecord=incoming.pathname==='/api/record'||incoming.pathname==='/api/record-current';
  const isAssistantCompat=incoming.pathname==='/api/ui-assistant'||incoming.pathname==='/api/site'||incoming.pathname==='/api/ui-site';
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