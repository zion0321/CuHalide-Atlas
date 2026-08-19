export const config={matcher:['/','/index.html']};
const LAST_MODIFIED=new Date('2026-08-19T00:00:00Z').toUTCString();
export default async function middleware(request){
  const target=new URL('/api/ui-assistant',request.url);
  const response=await fetch(target,{method:request.method,headers:request.headers,redirect:'follow'});
  const headers=new Headers(response.headers);
  headers.set('x-cuhalide-middleware','release-3.0.2-ui-v50.2-current-r7');
  headers.set('x-cuhalide-current-curated-revision','7');
  headers.set('x-cuhalide-ui-version','50.2');
  headers.set('x-cuhalide-site-version','50');
  headers.set('last-modified',LAST_MODIFIED);
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,statusText:response.statusText,headers});
}
