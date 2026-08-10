import crypto from 'node:crypto';

const ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const hash = (text) => `sha256-${crypto.createHash('sha256').update(text).digest('base64')}`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end('Method Not Allowed');
  }
  try {
    const response = await fetch(`${ORIGIN}/`, { headers: { accept: 'text/html', 'user-agent': 'CuHalide-CSP-Audit/1.1' }, cache: 'no-store' });
    const html = await response.text();
    const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].map((m, index) => {
      const attrs = m[1] || '';
      const body = m[2] || '';
      const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] || '';
      const type = /\btype\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] || 'text/javascript';
      return { index, src, type, bytes: Buffer.byteLength(body), sha256: hash(body) };
    });
    const styles = [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/gi)].map((m, index) => ({ index, bytes: Buffer.byteLength(m[2] || ''), sha256: hash(m[2] || '') }));
    const inline = scripts.filter((s) => !s.src);
    const result = {
      ok: response.ok,
      status: response.status,
      inline_scripts: inline,
      executable_inline_hashes: inline.filter((s) => !/json|ld\+json/i.test(s.type)).map((s) => s.sha256),
      all_inline_hashes: inline.map((s) => s.sha256),
      inline_styles: styles,
      inline_event_handlers: (html.match(/\son[a-z]+\s*=/gi) || []).length,
      inline_style_attributes: (html.match(/\sstyle\s*=/gi) || []).length,
      site_marker: /cuhalide-site-version" content="([^"]+)/i.exec(html)?.[1] || '',
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(200).json(result);
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ ok: false, error: String(error) });
  }
}
