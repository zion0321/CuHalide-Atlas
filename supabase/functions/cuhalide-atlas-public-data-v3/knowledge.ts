export async function knowledgeRequest(url,rpc){
 const action=String(url.searchParams.get('action')).replace('knowledge-',''),q=(url.searchParams.get('q')||'').trim(),scope=url.searchParams.get('scope')||'all';
 const limit=Number(url.searchParams.get('limit')||12),offset=Number(url.searchParams.get('offset')||0);
 if(!['coverage','articles','retrieve'].includes(action)||!['all','curated','context','reviewed','text'].includes(scope)||q.length>600||!Number.isInteger(limit)||limit<1||limit>20||!Number.isInteger(offset)||offset<0||offset>1000||(action==='retrieve'&&q.length<2))return{status:400,body:{ok:false,error:'Invalid query parameters.',knowledge_contract:'1.2.0'}};
 const body=await rpc('cuxplore_knowledge_v1',{p_action:action,p_query:q,p_scope:scope,p_limit:limit,p_offset:offset});
 return{status:200,body:{...body,knowledge_contract:'1.2.0',retrieved_at:new Date().toISOString(),public_access:'query-and-view',inference_performed:false,raw_source_text_exposed:false}};
}
