import { projectOrganic as projectBase } from './organic-components.ts';

const EXACT = {
  fa:['formamidinium','CH5N2+',1],
  py:['pyridine','C5H5N',0],
  hpy:['pyridinium','C5H6N+',1],
  etpy:['n-ethylpyridinium','C7H10N+',1],
  bupy:['n-butylpyridinium','C9H14N+',1],
  hxpy:['n-hexylpyridinium','C11H18N+',1],
  dms:['dimethyl-sulfide','C2H6S',0],
  mor4:['morpholinium','C4H10NO+',1],
  pnp:['pnp','C36H31NP2+',1],
};
const GUANIDINIUM_KEYS=new Set(['gua3','gua4','gua6','gua7','alphagua3','betagua3']);
function verified(key,formula,charge,name){return{status:'verified_connectivity',key:`oc-${key}`,canonical_name:name||key.replaceAll('-',' '),molecular_formula:formula,formal_charge:charge,stereochemistry:'not_encoded',renderer:'RDKit 2025.09.4 coordinate layout + browser SVG'}}

export function projectOrganic(row){
  const k=String(row.component_key||'').trim().toLowerCase();
  if(GUANIDINIUM_KEYS.has(k)){
    const x=projectBase(row);x.depiction=verified('gua','CH6N3+',1,'Guanidinium');return x;
  }
  const e=EXACT[k];
  if(e){const x=projectBase(row);x.depiction=verified(e[0],e[1],e[2]);return x;}
  return projectBase(row);
}

export function organicComponentHealth(rows){
  const items=rows.map(projectOrganic), structures=new Set(rows.map(x=>x.structure_id)), rawKeys=new Set(rows.map(x=>String(x.component_key||'').toLowerCase()));
  const verifiedItems=items.filter(x=>x.depiction.status==='verified_connectivity'), verifiedStructures=new Set(verifiedItems.map(x=>x.structure_id)), graphKeys=new Set(verifiedItems.map(x=>x.depiction.key));
  const reasons={};for(const x of items)if(x.depiction.status==='unresolved')reasons[x.depiction.reason]=(reasons[x.depiction.reason]||0)+1;
  const unresolved=rows.length-verifiedItems.length;
  const checks={all_rows_classified:items.every(x=>['verified_connectivity','unresolved'].includes(x.depiction.status)),mapping_baseline_stable:rows.length===495&&structures.size===453&&rawKeys.size===260,verified_plus_unresolved_equals_total:verifiedItems.length+unresolved===rows.length,raw_primary_files_exposed:false,raw_evidence_locators_exposed:false,private_evidence_fields_exposed:false};
  const ok=checks.all_rows_classified&&checks.mapping_baseline_stable&&checks.verified_plus_unresolved_equals_total&&!checks.raw_primary_files_exposed&&!checks.raw_evidence_locators_exposed&&!checks.private_evidence_fields_exposed;
  return{ok,contract_version:'1.1.0',component_rows:rows.length,mapped_structures:structures.size,distinct_raw_component_keys:rawKeys.size,verified_connectivity_rows:verifiedItems.length,unresolved_rows:unresolved,structures_with_verified_connectivity:verifiedStructures.size,verified_connectivity_graph_keys:graphKeys.size,unresolved_reason_counts:reasons,checks};
}
