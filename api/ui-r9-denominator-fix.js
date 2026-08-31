import currentUi from './ui-r9.js';

const STALE_DENOMINATOR='Curated literature · n = 369';
const CURRENT_DENOMINATOR='Curated literature · n = 370';

export default async function handler(req,res){
  const bridge={
    setHeader:(k,v)=>res.setHeader(k,v),
    getHeader:k=>res.getHeader?.(k),
    removeHeader:k=>res.removeHeader?.(k),
    end:body=>{
      const text=typeof body==='string'?body:String(body??'');
      const out=text.split(STALE_DENOMINATOR).join(CURRENT_DENOMINATOR);
      if(typeof body==='string'&&text.includes(STALE_DENOMINATOR)&&out.includes(STALE_DENOMINATOR))throw new Error('Site 51 halogen denominator repair failed');
      res.removeHeader?.('Content-Length');
      return res.end(typeof body==='string'?out:body);
    }
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});
  return currentUi(req,bridge);
}
