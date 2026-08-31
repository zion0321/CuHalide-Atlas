import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('rev.9 evidence repairs are synchronized through public taxonomy, RAG and runtime health',()=>{
  const runtime=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts');
  for(const token of ['canonical:370','core:890','resolved:747','verified:720','taxonomy:947','motifResolved:663','motifUnresolved:284','motifGeometry:217','Number(m.geometry_resolved)===EXPECT.motifGeometry'])assert.ok(runtime.includes(token),`missing final runtime token: ${token}`);
  for(const stale of ['canonical:369','core:887','resolved:744','verified:717','motifResolved:655','motifUnresolved:292','motifGeometry:206','motifResolved:640','motifUnresolved:307'])assert.ok(!runtime.includes(stale),`stale runtime token: ${stale}`);

  const publicSync=read('supabase/migrations/20260831062700_sync_rev9_public_taxonomy_evidence_repairs.sql');
  for(const token of ['Expected 29 public taxonomy rows synchronized','r.resolved<>655','r.unresolved<>292','r.geometry_resolved<>206','Public taxonomy evidence repair differs from rev.9 authority'])assert.ok(publicSync.includes(token),`missing first-stage public taxonomy synchronization guard: ${token}`);

  const finalRepair=read('supabase/migrations/20260831064506_resolve_final_source_explicit_rev9_batch_v3.sql');
  for(const token of ["record_id=205","P21/c; Pnma; Pnna","r.canonical<>370","r.core<>890","r.resolved_sg<>747","r.verified_sg<>720","r.motif_resolved<>663","r.motif_unresolved<>284","r.geometry_resolved<>217"])assert.ok(finalRepair.includes(token),`missing final evidence-repair guard: ${token}`);

  const ragRefresh=read('supabase/migrations/20260831070622_refresh_rev9_rag_after_evidence_repairs.sql');
  for(const token of ['expected 41 stale structure RAG docs','document_key=\'article:205\'','expected exactly 42 documents queued for re-embedding','content_sha256=encode(digest'])assert.ok(ragRefresh.includes(token),`missing RAG refresh guard: ${token}`);

  const bundle=read('supabase/migrations/20260831062813_extend_runtime_motif_health_geometry.sql');
  for(const token of ["'resolved', count(*) filter (where motif_formula <> 'Unresolved')","'unresolved', count(*) filter (where motif_formula = 'Unresolved')","'geometry_resolved', count(*) filter (where motif_geometry <> 'Unresolved')"])assert.ok(bundle.includes(token),`missing dynamic motif health expression: ${token}`);
});
