export const config={matcher:['/','/index.html','/api/record','/api/record-current']};
const LAST_MODIFIED=new Date('2026-08-19T00:00:00Z').toUTCString();
export default async function middleware(request){
  const incoming=new URL(request.url),isRecord=incoming.pathname==='/api/record'||incoming.pathname==='/api/record-current';
  const target=new URL(isRecord?'/api/record-evidence-current':'/api/ui-assistant-current',request.url);
  if(isRecord)target.search=incoming.search;
  const response=await fetch(target,{method:request.method,headers:request.headers,redirect:'follow'});
  const headers=new Headers(response.headers);
  headers.set('x-cuhalide-middleware','release-3.0.2-ui-v50.2-current-r7');
  headers.set('x-cuhalide-current-curated-revision','7');
  headers.set('x-cuhalide-ui-version','50.2');
  headers.set('x-cuhalide-site-version','50');
  headers.set('last-modified',LAST_MODIFIED);
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,statusText:response.statusText,headers});
}