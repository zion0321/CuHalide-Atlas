import crypto from 'node:crypto';
import recordHandler from './record.js';

const CURRENT_REVISION='7';
const CURATED_DATE='2026-08-19';
const PAGE_DATE='2026-08-24';
const LAST_MODIFIED=new Date(`${PAGE_DATE}T00:00:00Z`).toUTCString();
const ROBOTS_META='<meta name="robots" content="noindex,nofollow,noarchive">';
const PUBLIC_DATA='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3';
const PHOTOPHYSICS_CONTRACT='1.3.0';
const ORGANIC_COMPONENTS_CONTRACT='1.1.0';

const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function requestTarget(req){
  let incoming;
  try{incoming=new URL(String(req?.url||'/'),'http://local')}catch{incoming=new URL('http://local/')}
  return{kind:String(incoming.searchParams.get('kind')||'').toLowerCase(),id:String(incoming.searchParams.get('id')||'').trim()};
}

function normalize(body){
  if(typeof body!=='string')return body;
  return body
    .split('<meta name="cuhalide-current-curated-revision" content="6">').join('<meta name="cuhalide-current-curated-revision" content="7">')
    .split('<meta name="robots" content="index,follow,max-image-preview:large">').join(ROBOTS_META)
    .split('<meta name="robots" content="noindex,nofollow">').join(ROBOTS_META)
    .split('Current Curated rev.6 · primary-evidence reviewed through 18 Aug 2026').join('Current Curated rev.7 · primary-evidence reviewed through 19 Aug 2026')
    .split('current-r6').join('current-r7')
    .split('2026-08-18').join(CURATED_DATE)
    .split('<a href="https://cuhalide-atlas-v3.vercel.app/#structures">Structures</a><a href="https://cuhalide-atlas-v3.vercel.app/motifs">Motifs</a><a href="https://cuhalide-atlas-v3.vercel.app/#rag">Smart RAG</a>')
    .join('<a href="https://cuhalide-atlas-v3.vercel.app/#structures">Structures</a><a href="https://cuhalide-atlas-v3.vercel.app/motifs">Motifs</a><a href="https://cuhalide-atlas-v3.vercel.app/#photophysics">Photophysics</a><a href="https://cuhalide-atlas-v3.vercel.app/#rag">Research Assistant</a>');
}

function inlineScriptHashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))!==null){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function addSelfDirective(csp,name){const re=new RegExp(`\\b${name}\\s+([^;]*);`,'i');if(re.test(csp))return csp.replace(re,(_,sources)=>`${name} 'self' ${String(sources).replace(/'self'\s*/gi,'').trim()};`);return `${csp.trim()} ${name} 'self';`}
function syncCsp(html,res,{allowSelf=false}={}){const current=String(res.getHeader?.('Content-Security-Policy')||'');if(!current)return;const hashes=inlineScriptHashes(html);if(!hashes.length)return;let next=current.replace(/\bscript-src\s+[^;]*;/i,`script-src ${allowSelf?"'self' ":''}${hashes.join(' ')};`);if(allowSelf){next=addSelfDirective(next,'style-src');next=addSelfDirective(next,'connect-src')}if(/script-src[^;]*'unsafe-inline'/i.test(next)||/style-src[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline is forbidden');res.setHeader('Content-Security-Policy',next)}

async function fetchRecordOverlay(req){
  const {kind,id}=requestTarget(req),base={kind,id,available:false,photophysics:null,organic_components:null};
  if(!['article','structure'].includes(kind)||!id)return base;
  try{
    const u=new URL(PUBLIC_DATA);u.searchParams.set('action',kind);u.searchParams.set('id',id);
    const r=await fetch(u,{headers:{accept:'application/json','user-agent':'CuHalide-Atlas-Record-Overlay/1.1.0'},signal:AbortSignal.timeout(6500)});
    if(!r.ok)return base;
    const x=await r.json(),items=kind==='structure'?(Array.isArray(x?.organic_components)?x.organic_components:Array.isArray(x?.item?.organic_components)?x.item.organic_components:[]):[];
    return{kind,id,available:true,photophysics:x?.photophysics&&typeof x.photophysics==='object'?x.photophysics:null,organic_components:items};
  }catch(error){console.error('[record-overlay]',error);return base}
}

const propertyLabels={
  plqy:'PLQY',average_lifetime:'Lifetime',optical_band_gap:'Optical gap',stokes_shift:'Stokes shift',
  thermal_activation_energy:'Activation energy',light_yield:'Light yield',xray_lod:'X-ray LOD',spatial_resolution:'Spatial resolution',
  luminescence_dissymmetry_factor:'g_lum',g_lum:'g_lum',tadf_fraction:'TADF fraction',phosphorescence_fraction:'Phosphorescence fraction',
  pl_intensity_retention:'PL intensity retention',rl_stability_outcome:'RL stability',thermal_decomposition_temperature:'Thermal decomposition',
  peak_eqe:'Peak EQE',external_quantum_efficiency:'EQE',max_luminance:'Max luminance',t50:'T50',
  charge_carrier_mobility:'Carrier mobility',hole_mobility:'Hole mobility',electron_mobility:'Electron mobility',trmc_yield_mobility:'TRMC yield mobility',
  electrical_conductivity:'Conductivity',relative_permittivity:'Relative permittivity',trap_density:'Trap density',trap_filled_limit_voltage:'VTFL',
  film_thickness:'Film thickness',arithmetic_mean_roughness:'Surface roughness Ra',device_active_area:'Device area',
  exciton_binding_energy:'Exciton binding energy',huang_rhys_factor:'Huang–Rhys factor',phonon_energy:'Phonon energy',
  radiative_rate:'Radiative rate',nonradiative_rate:'Non-radiative rate',interfacial_hydrogen_bond_energy:'Interfacial H-bond energy',
  cie_x:'CIE x',cie_y:'CIE y',correlated_color_temperature:'CCT',color_rendering_index:'CRI'
};
const propertyPriority=['plqy','average_lifetime','optical_band_gap','peak_eqe','external_quantum_efficiency','max_luminance','light_yield','xray_lod','spatial_resolution','thermal_activation_energy','exciton_binding_energy','luminescence_dissymmetry_factor','g_lum','tadf_fraction','phosphorescence_fraction','stokes_shift','charge_carrier_mobility','hole_mobility','electron_mobility','trap_density','film_thickness','pl_intensity_retention','rl_stability_outcome','thermal_decomposition_temperature'];
function unitText(u){return String(u||'').replace(/^us$/,'μs').replace(/^degC$/,'°C').replace(/MeV-1/g,'MeV⁻¹').replace(/mm-1/g,'mm⁻¹').replace(/s-1/g,'s⁻¹')}
function fmtNumber(v){const n=Number(v);if(!Number.isFinite(n))return String(v??'');if(Math.abs(n)>=10000)return n.toLocaleString('en-US',{maximumFractionDigits:3});return String(v)}
function formatProperty(v){
  const key=String(v?.property_key||''),label=propertyLabels[key]||key.replaceAll('_',' '),unit=unitText(v?.unit);
  if(v?.value_text!==undefined&&v?.value_text!==null&&String(v.value_text).trim())return `${label}: ${String(v.value_text).trim()}${unit?` ${unit}`:''}`;
  if(v?.value_numeric===undefined||v?.value_numeric===null)return '';
  let raw=fmtNumber(v.value_numeric),prefix='';
  const q=String(v?.qualifier||'');
  if(/^\s*>/.test(q))prefix='>';
  else if(/^\s*</.test(q))prefix='<';
  else if(/approx|approximately|~|∼/i.test(q))prefix='≈';
  return `${label}: ${prefix}${raw}${unit?` ${unit}`:''}`;
}
function sampleFacts(sample){
  const ms=Array.isArray(sample?.measurements)?sample.measurements:[],bands=[],values=[];
  for(const m of ms){
    for(const b of Array.isArray(m?.bands)?m.bands:[]){if(b?.domain==='emission'&&b?.peak_nm!==null&&b?.peak_nm!==undefined)bands.push(`Emission: ${fmtNumber(b.peak_nm)} nm${b.fwhm_nm!==null&&b.fwhm_nm!==undefined?` (FWHM ${fmtNumber(b.fwhm_nm)} nm)`:''}`)}
    for(const v of Array.isArray(m?.values)?m.values:[])values.push(v);
  }
  const unique=[];for(const x of bands){if(!unique.includes(x))unique.push(x)}
  const sorted=[...values].sort((a,b)=>{const ai=propertyPriority.indexOf(a?.property_key),bi=propertyPriority.indexOf(b?.property_key);return(ai<0?999:ai)-(bi<0?999:bi)});
  for(const v of sorted){const x=formatProperty(v);if(x&&!unique.includes(x))unique.push(x);if(unique.length>=7)break}
  return unique;
}
function mechanismSummary(samples){
  const out=[];
  for(const s of samples||[])for(const m of s?.measurements||[])for(const z of m?.mechanisms||[]){
    const label=z?.label||z?.mechanism_code||'Mechanism',polarity=z?.claim_polarity||'unresolved',basis=z?.claim_basis==='author_assignment'?'source-assigned':z?.claim_basis==='experimentally_supported'?'experimentally supported':z?.claim_basis==='computationally_supported'?'computationally supported':z?.claim_basis||'';
    const x=`${label} (${polarity}${basis?`; ${basis}`:''})`;if(!out.includes(x))out.push(x);if(out.length>=5)return out;
  }
  return out;
}
function conflictSummary(ph){
  const out=[];
  for(const c of Array.isArray(ph?.conflicts)?ph.conflicts:[]){
    const key=String(c?.property_key||'source discrepancy'),label=propertyLabels[key]||key.replaceAll('_',' '),status=String(c?.adjudication_status||'unresolved'),preferred=String(c?.preferred_value||'').trim();
    let x='';
    if(status==='preferred_source_identified'&&preferred)x=`${label}: source discrepancy; preferred ${preferred}`;
    else if(status==='retain_both')x=`${label}: conflicting source values retained`;
    else if(status==='not_comparable')x=`${label}: source values retained as non-comparable`;
    else if(status==='resolved_typographical')x=`${label}: typographical discrepancy adjudicated${preferred?`; preferred ${preferred}`:''}`;
    else x=`${label}: curated source discrepancy`;
    if(!out.includes(x))out.push(x);
    if(out.length>=5)break;
  }
  return out;
}
function photophysicsCard(ph){
  if(!ph||ph.ok===false)return '';
  const state=String(ph.public_state||'');
  if(state==='curation_in_progress')return `<section class="card"><p class="eyebrow">Photophysics</p><p class="fine"><strong>Primary-evidence curation in progress.</strong> Structured photophysical values are withheld from this record until the Pass A curation gate is complete.</p></section>`;
  if(state==='withheld')return `<section class="card"><p class="eyebrow">Photophysics</p><p class="fine"><strong>Curated values withheld.</strong> The photophysics review has an unresolved QC blocker; source values are not silently reconciled.</p></section>`;
  if(state==='verified_no_reported_data'||state==='no_relevant_data')return `<section class="card"><p class="eyebrow">Photophysics</p><span class="status">Primary-evidence reviewed</span><p class="fine">No reportable photophysics measurement is exposed for this record at the reviewed sample grain.</p></section>`;
  const verified=state==='two_pass_verified'||state==='verified';
  const passA=state==='pass_a_curated';
  if(!verified&&!passA)return '';
  const samples=Array.isArray(ph.samples)?ph.samples:[],shown=samples.slice(0,8),mechanisms=mechanismSummary(samples),conflictDetails=conflictSummary(ph),counts=ph.counts||{};
  const sampleHtml=shown.map(s=>{
    const facts=sampleFacts(s),detail=facts.length?facts.join(' · '):s.measurement_status==='no_measurement_reported'?'No photophysics measurement reported in the reviewed source set.':'Curated measurement state; no compact scalar summary.';
    const scope=[s.sample_form,s.mapping_status,s.property_scope].filter(Boolean).join(' · ');
    return `<div class="component"><strong>${esc(s.sample_label||s.reported_compound_label||'Curated sample')}</strong><span>${esc(scope)}</span><span>${esc(detail)}</span></div>`;
  }).join('');
  const overflow=samples.length>shown.length?`<p class="fine">${esc(samples.length-shown.length)} additional curated sample state${samples.length-shown.length===1?'':'s'} remain available through the query interface.</p>`:'';
  const mechanismHtml=mechanisms.length?`<p class="fine"><strong>Mechanism curation:</strong> ${esc(mechanisms.join(' · '))}</p>`:'';
  const conflictCount=Number(counts.conflicts||0),extraConflicts=Math.max(0,conflictCount-conflictDetails.length),conflictText=conflictDetails.length?`${conflictDetails.join(' · ')}${extraConflicts?` · +${extraConflicts} additional curated conflict${extraConflicts===1?'':'s'}`:''}`:`${conflictCount} curated conflict${conflictCount===1?'':'s'} retained explicitly`;
  const conflictHtml=conflictCount?`<p class="fine"><strong>Source discrepancies:</strong> ${esc(conflictText)}. Conflicting primary-source values are not silently harmonized; unresolved measurements remain withheld from numeric queries.</p>`:'';
  const badge=verified?'Two-pass verified':'Pass A curated';
  const provenance=verified?'Independent Pass A and Pass B review agree for this exposed article-level photophysics state.':'Primary-evidence Pass A curation is complete; independent Pass B verification has not yet been completed. Measurement-level QC and conflict gates remain fail-closed.';
  return `<section class="card"><p class="eyebrow">Photophysics</p><span class="status">${badge}</span><p class="fine">${esc(provenance)} ${esc(counts.samples??samples.length)} curated sample state${Number(counts.samples??samples.length)===1?'':'s'} · ${esc(counts.measurements??0)} measurements · ${esc(counts.values??0)} normalized values. Crystal-intrinsic, processed, composite, and device states remain separate; quantitative-analysis eligibility is independently gated.</p>${sampleHtml?`<div class="components">${sampleHtml}</div>`:''}${overflow}${mechanismHtml}${conflictHtml}</section>`;
}
function injectPhotophysics(html,ph){const card=photophysicsCard(ph);if(!card)return html;const marker='<div class="data-note">';return html.includes(marker)?html.replace(marker,`${card}${marker}`):html}

const organicRoleLabel=r=>({counter_cation:'Counter-cation',coordinating_ligand:'Coordinating ligand',ancillary_ligand:'Ancillary ligand',mixed_role:'Mixed role',reported_organic_token:'Reported organic component'}[r]||String(r||'Organic component').replaceAll('_',' '));
function organicComponentsCard(overlay){
  if(overlay?.kind!=='structure'||!overlay.id)return '';
  if(!overlay.available)return `<section class="card" data-oc-standalone="${esc(overlay.id)}"><p class="eyebrow">Organic components</p><p class="fine">The field-whitelisted Organic Components 1.1 projection is temporarily unavailable. Legacy evidence details are withheld rather than exposed.</p></section>`;
  const items=Array.isArray(overlay.organic_components)?overlay.organic_components:[];
  if(!items.length)return '';
  const rows=items.map(item=>{const d=item?.depiction||{},state=d.status==='verified_connectivity'?'2D connectivity verified':'2D unresolved';return `<div class="component"><strong>${esc(item.display_name||item.component_key||'Unresolved')}</strong><span>${esc([item.abbreviation&&item.abbreviation!==item.display_name?item.abbreviation:'',organicRoleLabel(item.role),item.normalization_confidence,state].filter(Boolean).join(' · '))}</span></div>`}).join('');
  return `<section class="card" data-oc-standalone="${esc(overlay.id)}"><p class="eyebrow">Organic components</p><p class="fine">Contract 1.1.0 · field-whitelisted structure-grain projection. Deterministic 2D connectivity is loaded only for independently verified identities; unresolved identities remain fail-closed.</p><div class="components">${rows}</div></section>`;
}
function injectOrganicComponents(html,overlay){
  if(overlay?.kind!=='structure')return html;
  const legacy=/<section class="card"><p class="eyebrow">Organic components<\/p>[\s\S]*?<\/section>/i,card=organicComponentsCard(overlay),hadLegacy=legacy.test(html);
  let out=hadLegacy?html.replace(legacy,card):html;
  if(!hadLegacy&&card){const marker='<div class="actions">';out=out.includes(marker)?out.replace(marker,`${card}${marker}`):out}
  return out;
}
function injectOrganicClient(html,overlay){if(overlay?.kind!=='structure'||html.includes('/organic-components-v1.js'))return html;return html.replace('</body>','<script src="/organic-components-v1.js" defer></script></body>')}

export default async function handler(req,res){
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);
  res.setHeader('X-CuHalide-Photophysics-Contract',PHOTOPHYSICS_CONTRACT);
  res.setHeader('X-CuHalide-Organic-Components-Contract',ORGANIC_COMPONENTS_CONTRACT);
  res.setHeader('Last-Modified',LAST_MODIFIED);
  const overlay=await fetchRecordOverlay(req);
  const bridge={
    setHeader:(name,value)=>{const k=String(name).toLowerCase();if(k==='x-robots-tag')return res.setHeader(name,'noindex, nofollow, noarchive');if(k==='x-cuhalide-current-curated-revision')return res.setHeader(name,CURRENT_REVISION);if(k==='x-cuhalide-organic-components-contract')return res.setHeader(name,ORGANIC_COMPONENTS_CONTRACT);if(k==='last-modified')return res.setHeader(name,LAST_MODIFIED);return res.setHeader(name,value)},
    getHeader:name=>res.getHeader?.(name),
    removeHeader:name=>res.removeHeader?.(name),
    end:body=>{let out=normalize(body);if(typeof out==='string'&&out.includes('</html>')){out=injectOrganicComponents(out,overlay);out=injectPhotophysics(out,overlay.photophysics);out=injectOrganicClient(out,overlay);if(!out.includes(ROBOTS_META))throw new Error('prepublication record page missing noindex meta');syncCsp(out,res,{allowSelf:overlay.kind==='structure'})}res.removeHeader?.('Content-Length');return res.end(out)}
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return recordHandler(req,bridge);
}
