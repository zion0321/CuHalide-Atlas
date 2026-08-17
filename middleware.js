export const config={matcher:['/','/index.html']};
export default async function middleware(request){
  const target=new URL('/api/ui-assistant',request.url);
  const response=await fetch(target,{method:request.method,headers:request.headers,redirect:'follow'});
  const headers=new Headers(response.headers);
  headers.set('x-cuhalide-middleware','release-3.0.2-ui-v49.0-current-r4');
  headers.set('x-cuhalide-current-curated-revision','4');
  headers.set('x-cuhalide-ui-version','49.0');
  headers.set('x-cuhalide-site-version','49');
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,statusText:response.statusText,headers});
}
