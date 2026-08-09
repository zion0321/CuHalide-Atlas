const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-meta';

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }

  try {
    const incoming = new URL(req.url, 'https://cuhalide-atlas-v3.vercel.app');
    const upstream = new URL(UPSTREAM);
    for (const [key, value] of incoming.searchParams.entries()) upstream.searchParams.append(key, value);

    const response = await fetch(upstream, {
      method: req.method,
      headers: {
        accept: req.headers.accept || '*/*',
        'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Meta-Proxy/1.0',
      },
      redirect: 'follow',
    });

    res.statusCode = response.status;
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const asset = incoming.searchParams.get('asset');
    res.setHeader('Cache-Control', response.headers.get('cache-control') || (asset === 'health' ? 'no-store' : 'public, max-age=300, s-maxage=3600'));

    if (req.method === 'HEAD') return res.end();
    return res.end(await response.text());
  } catch (error) {
    console.error('[cuhalide-meta-proxy]', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ error: 'CuHalide Atlas metadata backend is temporarily unavailable.' }));
  }
}
