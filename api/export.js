const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-release-export-v301';

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }

  try {
    const incoming = new URL(req.url, 'https://cuhalide-atlas-v3.vercel.app');
    const upstream = new URL(UPSTREAM);
    for (const [key, value] of incoming.searchParams.entries()) {
      upstream.searchParams.append(key, value);
    }

    const response = await fetch(upstream, {
      method: req.method,
      headers: {
        accept: 'application/json',
        'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Release-Export/1.0',
      },
      redirect: 'follow',
    });

    res.statusCode = response.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('X-CuHalide-Release', '3.0.1');

    if (req.method === 'HEAD') return res.end();
    return res.end(await response.text());
  } catch (error) {
    console.error('[cuhalide-release-export-proxy]', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({
      error: 'CuHalide Atlas release export backend is temporarily unavailable.',
      release: '3.0.1',
    }));
  }
}
