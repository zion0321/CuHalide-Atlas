const TARGET='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-r9-reembed-evidence-repair-ephemeral';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'GET only'});
  try{
    const upstream=await fetch(TARGET,{method:'GET',headers:{accept:'application/json'},signal:AbortSignal.timeout(120000)});
    const text=await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type','application/json; charset=utf-8');
    return res.send(text);
  }catch(error){
    return res.status(502).json({ok:false,error:'temporary RAG repair bridge failed'});
  }
}
