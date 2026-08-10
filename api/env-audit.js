export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const names = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'CUHALIDE_RAG_SHARED_SECRET',
    'VERCEL_OIDC_TOKEN',
  ];
  const present = Object.fromEntries(names.map((name) => [name, Boolean(process.env[name])]));
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(200).json({ present });
}
