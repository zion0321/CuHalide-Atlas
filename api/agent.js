const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-smart-rag';

function requestBody(req) {
  if (req.body == null) return undefined;
  if (Buffer.isBuffer(req.body) || typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, HEAD, POST, OPTIONS');
    return res.end();
  }
  if (!['GET', 'HEAD', 'POST'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD, POST, OPTIONS');
    return res.end('Method Not Allowed');
  }

  try {
    const incoming = new URL(req.url, 'https://cuhalide-atlas-v3.vercel.app');
    const upstream = new URL(UPSTREAM);
    for (const [key, value] of incoming.searchParams.entries()) upstream.searchParams.append(key, value);

    const headers = {
      accept: req.headers.accept || 'application/json',
      'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Agent-Proxy/1.0',
    };
    if (req.method === 'POST') headers['content-type'] = req.headers['content-type'] || 'application/json';

    const response = await fetch(upstream, {
      method: req.method,
      headers,
      body: req.method === 'POST' ? requestBody(req) : undefined,
      redirect: 'follow',
    });

    res.statusCode = response.status;
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'HEAD') return res.end();
    return res.end(await response.text());
  } catch (error) {
    console.error('[cuhalide-agent-proxy]', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ error: 'CuHalide Atlas Smart RAG backend is temporarily unavailable.' }));
  }
}
