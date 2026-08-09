const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-site';
const SUPABASE_ORIGIN = 'https://tyxnyjyrfzspwcfjpzus.supabase.co';

const CSP = [
  "default-src 'self' data:",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${SUPABASE_ORIGIN}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

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
        accept: 'text/html,application/xhtml+xml',
        'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Proxy/1.0',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
    if (response.ok && !contentType.toLowerCase().includes('text/html')) {
      throw new Error(`Unexpected upstream content type: ${contentType}`);
    }

    res.statusCode = response.status;
    res.setHeader('Content-Type', contentType.toLowerCase().includes('text/html') ? contentType : 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('X-Robots-Tag', response.headers.get('x-robots-tag') || 'index, follow, max-image-preview:large');

    for (const header of ['cache-control', 'etag', 'x-cuhalide-site-version', 'x-cuhalide-site-snapshot']) {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    if (req.method === 'HEAD') return res.end();
    const body = await response.text();
    return res.end(body);
  } catch (error) {
    console.error('[cuhalide-site-proxy]', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end('CuHalide Atlas upstream is temporarily unavailable.');
  }
}
