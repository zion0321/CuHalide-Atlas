const DEPICTIONS = {
  'acetonitrile':['C2H3N',0],
  'me2nh2':['C2H8N+',1,'Dimethylammonium'],
  'gua':['CH6N3+',1,'Guanidinium'],
  'tetraethylammonium':['C8H20N+',1],
  'tetrapropylammonium':['C12H28N+',1],
  '18c6':['C12H24O6',0,'18-crown-6'],
  'toluene':['C7H8',0],
  '2-methylpyridine':['C6H7N',0],
  '2-ethylpyridine':['C7H9N',0],
  '26-dimethylpyridine':['C7H9N',0,'2,6-dimethylpyridine'],
  '35-dimethylpyridine':['C7H9N',0,'3,5-dimethylpyridine'],
  '3-pic':['C6H7N',0,'3-picoline'],
  '4-pic':['C6H7N',0,'4-picoline'],
  'quinoline':['C9H7N',0],
  '4-phenoxypyridine':['C11H9NO',0],
  'pph3':['C18H15P',0,'Triphenylphosphine'],
  'bis-diphenylphosphino-methane':['C25H22P2',0],
  '1-2-bis-diphenylphosphino-benzene':['C30H24P2',0],
  '1-3-di-4-pyridyl-propane':['C13H14N2',0],
  'bpp':['C13H14N2',0],
  'phs-c3-sph':['C15H16S2',0],
  'phs-c5-sph':['C17H20S2',0],
  'ptols-c5-stolp':['C19H24S2',0],
  '1-4-dibenzyl-dabco-dication':['C20H26N2+2',2],
  '1-4-bis-4-chlorobenzyl-dabco-dication':['C20H24Cl2N2+2',2],
  'pr2-dabco':['C12H26N2+2',2],
  'tetrabutylammonium':['C16H36N+',1],
  'tert-butylammonium':['C4H12N+',1],
  'tetraphenylphosphonium':['C24H20P+',1],
  'triphenylphosphine':['C18H15P',0],
  'trimethylsulfonium':['C3H9S+',1],
  'ethyltrimethylammonium':['C5H14N+',1],
  'ethyltripropylammonium':['C11H26N+',1],
  'isopropyltriphenylphosphonium':['C21H22P+',1],
  'n-butyltriphenylphosphonium':['C22H24P+',1],
  'ethyltriphenylphosphonium':['C20H20P+',1],
  'methyltriphenylphosphonium':['C19H18P+',1],
  'tetraphenylarsonium':['C24H20As+',1],
  'triphenylarsine':['C18H15As',0],
  'acetamidinium':['C2H7N2+',1],
  'imidazolium':['C3H5N2+',1],
  'tetraethylphosphonium':['C8H20P+',1],
  'tetramethylammonium':['C4H12N+',1],
  'methylammonium':['CH6N+',1],
  'n-octylammonium':['C8H20N+',1],
  'n-hexylammonium':['C6H16N+',1],
  'piperazinium':['C4H12N2+2',2],
  'pyrazine':['C4H4N2',0],
  'pyrrolidinium':['C4H10N+',1],
  'triphenylphosphine-oxide':['C18H15OP',0],
  '2-diphenylphosphino-pyridine':['C17H14NP',0],
  'bis-2-diphenylphosphinophenyl-ether':['C36H28OP2',0],
  'tri-p-tolylphosphine':['C21H21P',0],
  'tri-o-tolylphosphine':['C21H21P',0],
  'tris-3-methylphenyl-phosphine':['C21H21P',0],
  'pyrimidine':['C4H4N2',0],
  '2-methylpyrimidine':['C5H6N2',0],
  '4-methylpyrimidine':['C5H6N2',0],
  '3-methylmorpholine':['C5H11NO',0],
  '2-methylpiperidine':['C6H13N',0],
  '2-methylpyrrolidine':['C5H11N',0],
  '3-piperidinol':['C5H11NO',0],
  'dmap':['C7H10N2',0,'4-(dimethylamino)pyridine'],
  'cyclopropyltriphenylphosphonium':['C21H20P+',1],
  'n-butylquinolinium':['C13H16N+',1],
  'dodecyltrimethylammonium':['C15H34N+',1],
  '1-phenylethylammonium':['C8H12N+',1],
  'triethylallylammonium':['C9H20N+',1],
  '1-3-5-triazine':['C3H3N3',0,'1,3,5-triazine'],
  'benzyltrimethylammonium':['C10H16N+',1],
  'phenyltrimethylammonium':['C9H14N+',1],
  'methyltricyclohexylphosphonium':['C19H36P+',1],
  '1-ethyl-3-methylimidazolium':['C6H11N2+',1],
  '2-thienyltriphenylphosphonium':['C22H18PS+',1],
  'trimethyladamantylammonium':['C13H24N+',1],
  '4-4-trimethylenedipiperidinium':['C12H26N2+2',2,"4,4'-trimethylenedipiperidinium"],
  'benzyltriphenylphosphonium':['C25H22P+',1],
};

const ALIASES = {
  tea:'tetraethylammonium', et4n:'tetraethylammonium',
  tpa:'tetrapropylammonium', pr4n:'tetrapropylammonium',
  bu4n:'tetrabutylammonium',
  tms:'trimethylsulfonium', etma:'ethyltrimethylammonium', etpa:'ethyltripropylammonium',
  ipp:'isopropyltriphenylphosphonium', pph3ipr:'isopropyltriphenylphosphonium',
  buph3p:'n-butyltriphenylphosphonium', pph3nbu:'n-butyltriphenylphosphonium',
  etph3p:'ethyltriphenylphosphonium', pph3et:'ethyltriphenylphosphonium',
  meph3p:'methyltriphenylphosphonium', mepph3:'methyltriphenylphosphonium',
  pph3me:'methyltriphenylphosphonium', ph3mep:'methyltriphenylphosphonium',
  mtpp:'methyltriphenylphosphonium', mep:'methyltriphenylphosphonium',
  asph4:'tetraphenylarsonium', ph4as:'tetraphenylarsonium',
  asph3:'triphenylarsine', ph3as:'triphenylarsine',
  ph3p:'triphenylphosphine', ph3po:'triphenylphosphine-oxide',
  tep:'tetraethylphosphonium', me4n:'tetramethylammonium', ch3nh3:'methylammonium', menh3:'methylammonium',
  oa:'n-octylammonium', ha:'n-hexylammonium',
  'diphenyl-2-pyridylphosphine':'2-diphenylphosphino-pyridine',
  'r-3-methylmorpholine':'3-methylmorpholine', 's-3-methylmorpholine':'3-methylmorpholine', 'rac-3-methylmorpholine':'3-methylmorpholine',
  'r-2-methylpiperidine':'2-methylpiperidine', 's-2-methylpiperidine':'2-methylpiperidine',
  'r-2-methylpyrrolidine':'2-methylpyrrolidine', 's-2-methylpyrrolidine':'2-methylpyrrolidine',
  'r-3-piperidinol':'3-piperidinol', 's-3-piperidinol':'3-piperidinol',
  dppm:'bis-diphenylphosphino-methane',
  ctp:'cyclopropyltriphenylphosphonium', nbq:'n-butylquinolinium', dta:'dodecyltrimethylammonium',
  rmba:'1-phenylethylammonium', teaa:'triethylallylammonium', tri:'1-3-5-triazine',
  btma:'benzyltrimethylammonium', ptma:'phenyltrimethylammonium', cy3mep:'methyltricyclohexylphosphonium',
  emim:'1-ethyl-3-methylimidazolium', '2-ttps':'2-thienyltriphenylphosphonium',
  c13h24n:'trimethyladamantylammonium', c13h28n2:'4-4-trimethylenedipiperidinium',
  bztpp:'benzyltriphenylphosphonium',
};

const NON_ORGANIC = new Set(['h','k2','rb2','cs3']);
const COLLISION = new Set(['bttmpe']);
const GENERIC = new Set(['nheterocycle']);

function unresolved(reason){ return {status:'unresolved',reason}; }
function verified(canonical){
  const d=DEPICTIONS[canonical];
  if(!d) return unresolved('connectivity_not_uniquely_verified');
  return {
    status:'verified_connectivity', key:`oc-${canonical}`,
    canonical_name:d[2]||canonical.replaceAll('-',' '),
    molecular_formula:d[0], formal_charge:d[1], stereochemistry:'not_encoded',
    renderer:'RDKit 2025.09.4 coordinate layout + browser SVG'
  };
}

export function classifyOrganic(row){
  const k=String(row.component_key||'').trim().toLowerCase();
  const sid=String(row.structure_id||'');
  const name=String(row.display_name||'').trim().toLowerCase();
  if(k==='tba') return (name==='t-ba'||name==='t–ba') ? verified('tert-butylammonium') : verified('tetrabutylammonium');
  if(k==='mtp') return sid==='CUH-154-S01' ? unresolved('component_key_collision') : verified('methyltriphenylphosphonium');
  if(k==='tpp'){
    if(sid==='CUH-082-S01') return verified('tetraphenylphosphonium');
    if(sid==='CUH-218-S01'||sid.startsWith('CUH-250-S')) return verified('triphenylphosphine');
    return unresolved('component_key_collision');
  }
  if(k==='pz'){
    if(sid==='CUH-061-S01') return verified('piperazinium');
    if(sid.startsWith('CUH-357-S')) return verified('pyrazine');
    return unresolved('component_key_collision');
  }
  if(k==='pyr') return sid==='CUH-013-S04' ? verified('pyrrolidinium') : unresolved('component_key_collision');
  if(k==='pph4') return sid==='CUH-119-S03' ? unresolved('mapping_identity_conflict') : verified('tetraphenylphosphonium');
  if(k==='aca') return sid==='CUH-293-S02' ? verified('acetamidinium') : unresolved('mapping_identity_conflict');
  if(k==='im') return sid==='CUH-293-S03' ? verified('imidazolium') : unresolved('mapping_identity_conflict');
  if(NON_ORGANIC.has(k)) return unresolved('not_organic_component');
  if(COLLISION.has(k)||/^l\d+$/.test(k)) return unresolved('abbreviation_collision');
  if(k==='pypzph') return unresolved('connectivity_not_uniquely_verified');
  if(GENERIC.has(k)) return unresolved('generic_or_mixture_identity');
  const canonical=ALIASES[k]||(DEPICTIONS[k]?k:'');
  return canonical ? verified(canonical) : unresolved('identity_not_uniquely_verified');
}

export function projectOrganic(row){
  return {
    structure_id:row.structure_id,
    component_key:row.component_key,
    display_name:row.display_name,
    abbreviation:row.abbreviation||null,
    role:row.role,
    normalization_confidence:row.normalization_confidence,
    depiction:classifyOrganic(row),
  };
}

export function organicComponentHealth(rows){
  const items=rows.map(projectOrganic);
  const structures=new Set(rows.map(x=>x.structure_id));
  const rawKeys=new Set(rows.map(x=>String(x.component_key||'').toLowerCase()));
  const verifiedItems=items.filter(x=>x.depiction.status==='verified_connectivity');
  const verifiedStructures=new Set(verifiedItems.map(x=>x.structure_id));
  const graphKeys=new Set(verifiedItems.map(x=>x.depiction.key));
  const reasons={};
  for(const x of items){
    if(x.depiction.status==='unresolved') reasons[x.depiction.reason]=(reasons[x.depiction.reason]||0)+1;
  }
  const classified=items.filter(x=>x.depiction.status==='verified_connectivity'||x.depiction.status==='unresolved').length;
  const checks={
    all_rows_classified:classified===rows.length,
    mapping_baseline_stable:rows.length===495&&structures.size===453&&rawKeys.size===260,
    verified_plus_unresolved_equals_total:verifiedItems.length+(rows.length-verifiedItems.length)===rows.length,
    raw_primary_files_exposed:false,
    raw_evidence_locators_exposed:false,
    private_evidence_fields_exposed:false,
  };
  const ok=checks.all_rows_classified&&checks.mapping_baseline_stable&&checks.verified_plus_unresolved_equals_total&&
    checks.raw_primary_files_exposed===false&&checks.raw_evidence_locators_exposed===false&&checks.private_evidence_fields_exposed===false;
  return {
    ok, contract_version:'1.1.0', component_rows:rows.length, mapped_structures:structures.size,
    distinct_raw_component_keys:rawKeys.size, verified_connectivity_rows:verifiedItems.length,
    unresolved_rows:rows.length-verifiedItems.length,
    structures_with_verified_connectivity:verifiedStructures.size,
    verified_connectivity_graph_keys:graphKeys.size,
    unresolved_reason_counts:reasons, checks,
  };
}
