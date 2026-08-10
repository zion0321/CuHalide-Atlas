const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-site';
const SUPABASE_ORIGIN = 'https://tyxnyjyrfzspwcfjpzus.supabase.co';
const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';

const DATA_UPSTREAM = `${SUPABASE_ORIGIN}/functions/v1/cuhalide-atlas-data-stable`;
const AGENT_UPSTREAM = `${SUPABASE_ORIGIN}/functions/v1/cuhalide-atlas-smart-rag`;
const META_UPSTREAM = `${SUPABASE_ORIGIN}/functions/v1/cuhalide-atlas-meta`;
const DATA_PROXY = `${PUBLIC_ORIGIN}/api/data`;
const AGENT_PROXY = `${PUBLIC_ORIGIN}/api/agent`;
const META_PROXY = `${PUBLIC_ORIGIN}/api/meta`;

const CSP = [
  "default-src 'self' data:",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchUpstream(req) {
  const incoming = new URL(req.url, PUBLIC_ORIGIN);
  const upstream = new URL(UPSTREAM);
  for (const [key, value] of incoming.searchParams.entries()) {
    if (!['render', 'v', 't'].includes(key)) upstream.searchParams.append(key, value);
  }

  let lastError;
  let lastResponse;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(upstream, {
        method: req.method,
        headers: {
          accept: 'text/html,application/xhtml+xml,text/plain;q=0.9',
          'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Proxy/4.0',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timer);
      lastResponse = response;
      if (response.status < 500 || attempt === 1) return response;
      try { await response.body?.cancel(); } catch {}
      await sleep(250);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt === 0) await sleep(250);
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError || new Error('Upstream request failed');
}

function rewriteBrowserDependencies(body) {
  return body
    .split(DATA_UPSTREAM).join(DATA_PROXY)
    .split(AGENT_UPSTREAM).join(AGENT_PROXY)
    .split(META_UPSTREAM).join(META_PROXY)
    .replace(/<link rel="preconnect" href="https:\/\/tyxnyjyrfzspwcfjpzus\.supabase\.co" crossorigin>\s*/g, '')
    .replace(/<link rel="dns-prefetch" href="\/\/tyxnyjyrfzspwcfjpzus\.supabase\.co">\s*/g, '')
    .replace(/connect-src 'self' https:\/\/tyxnyjyrfzspwcfjpzus\.supabase\.co/g, "connect-src 'self'");
}

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }

  try {
    const response = await fetchUpstream(req);

    res.statusCode = response.status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="index.html"');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('X-Robots-Tag', response.headers.get('x-robots-tag') || 'index, follow, max-image-preview:large');

    for (const header of ['x-cuhalide-site-version', 'x-cuhalide-site-sha256']) {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    if (req.method === 'HEAD') return res.end();
    const upstreamBody = await response.text();
    if (response.ok && !/^\s*<!doctype html>/i.test(upstreamBody) && !/^\s*<html\b/i.test(upstreamBody)) {
      throw new Error('Upstream did not return an HTML document');
    }

    const body = rewriteBrowserDependencies(upstreamBody);
    if (response.ok) {
      for (const required of [DATA_PROXY, AGENT_PROXY, META_PROXY]) {
        if (!body.includes(required)) throw new Error(`Same-origin dependency missing: ${required}`);
      }
      if (body.includes(SUPABASE_ORIGIN)) throw new Error('Direct backend origin leaked into public HTML');
    }
    return res.end(body);
  } catch (error) {
    console.error('[cuhalide-site-proxy]', error);
    res.statusCode = error?.name === 'AbortError' ? 504 : 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end('CuHalide Atlas upstream is temporarily unavailable.');
  }
}
