export const config = {
  matcher: ['/', '/index.html'],
};

export default async function middleware(request) {
  const target = new URL('/api/site', request.url);
  const response = await fetch(target, {
    method: request.method,
    headers: request.headers,
    redirect: 'follow',
  });
  const headers = new Headers(response.headers);
  headers.set('x-cuhalide-middleware', 'release-3.0.2-v48');
  return new Response(request.method === 'HEAD' ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
