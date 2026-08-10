export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }
  res.statusCode = 410;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-CuHalide-Release', '3.0.1');
  if (req.method === 'HEAD') return res.end();
  return res.end(JSON.stringify({
    error: 'Bulk release exports are not publicly distributed.',
    release: '3.0.1',
    public_access: 'query-and-view',
    guidance: 'Use the CuHalide Atlas search, record pages, Smart RAG, citation metadata and manuscript-specific data-availability process.'
  }));
}
