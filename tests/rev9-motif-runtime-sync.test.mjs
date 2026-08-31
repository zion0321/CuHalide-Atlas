import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('rev.9 motif evidence repairs are synchronized through public taxonomy and runtime health',()=>{
  const runtime=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts');
  for(const token of ['taxonomy:947','motifResolved:655','motifUnresolved:292','motifGeometry:206','Number(m.geometry_resolved)===EXPECT.motifGeometry'])assert.ok(runtime.includes(token),`missing runtime motif token: ${token}`);
  for(const stale of ['motifResolved:640','motifUnresolved:307'])assert.ok(!runtime.includes(stale),`stale runtime motif token: ${stale}`);

  const publicSync=read('supabase/migrations/20260831062700_sync_rev9_public_taxonomy_evidence_repairs.sql');
  for(const token of ['Expected 29 public taxonomy rows synchronized','r.resolved<>655','r.unresolved<>292','r.geometry_resolved<>206','Public taxonomy evidence repair differs from rev.9 authority'])assert.ok(publicSync.includes(token),`missing public taxonomy synchronization guard: ${token}`);

  const bundle=read('supabase/migrations/20260831062813_extend_runtime_motif_health_geometry.sql');
  for(const token of ["'resolved', count(*) filter (where motif_formula <> 'Unresolved')","'unresolved', count(*) filter (where motif_formula = 'Unresolved')","'geometry_resolved', count(*) filter (where motif_geometry <> 'Unresolved')"])assert.ok(bundle.includes(token),`missing dynamic motif health expression: ${token}`);
});
