/* CuHalide Atlas structure-modal photophysics boundary 1.4.0.
   Public projection only. Parent-article verification and structure mapping remain separate. */
(() => {
  'use strict';
  const DATA='/api/public-data',CONTRACT='1.4.0',CURRENT_REVISION=9;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const unit=u=>String(u||'').replace(/^us$/,'μs').replace(/^degC$/,'°C').replace(/MeV-1/g,'MeV⁻¹').replace(/mm-1/g,'mm⁻¹').replace(/s-1/g,'s⁻¹');
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n.toLocaleString('en-US',{maximumSignificantDigits:6}):String(v??'')};
  const labels={plqy:'PLQY',average_lifetime:'Lifetime',optical_band_gap:'Optical gap',computed_band_gap:'Computed gap',stokes_shift:'Stokes shift',light_yield:'Light yield',xray_lod:'X-ray LOD',scintillation_decay_time:'Scintillation decay',g_lum:'g_lum',luminescence_dissymmetry_factor:'g_lum',rl_intensity_retention:'RL retention'};
  const label=k=>labels[k]||String(k||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
  const parentState=ph=>String(ph?.parent_article_public_state||ph?.parent_article_verification_stage||'');
  const stage=ph=>parentState(ph)==='two_pass_verified'?'Two-pass verified':parentState(ph)==='verified_no_reported_data'?'Verified · no reported data':'Withheld pending independent verification';
  const stageClass=ph=>stage(ph)==='Two-pass verified'?'verified':'passa';
  const parentPublishable=ph=>['two_pass_verified','verified_no_reported_data'].includes(parentState(ph));
  function valueText(v){if(v?.value_numeric!==undefined&&v?.value_numeric!==null)return `${num(v.value_numeric)}${v.unit?' '+unit(v.unit):''}`;if(v?.value_text)return `${v.value_text}${v.unit?' '+unit(v.unit):''}`;return ''}
  function sampleFacts(sample){
    const facts=[];
    for(const m of sample?.measurements||[]){
      for(const b of m?.bands||[]){if(['emission','radioluminescence','cpl'].includes(String(b.domain||''))&&b.peak_nm!=null)facts.push({name:b.domain==='emission'?'Emission peak':b.domain==='radioluminescence'?'RL peak':'CPL peak',value:`${num(b.peak_nm)} nm`,eligible:b.quantitative_analysis_eligible===true})}
      for(const v of m?.values||[]){const x=valueText(v);if(x)facts.push({name:label(v.property_key),value:x,eligible:v.analysis_eligible===true})}
    }
    const seen=new Set();return facts.filter(x=>{const k=`${x.name}|${x.value}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,10);
  }
  function exactMappedSamples(ph,id){return (Array.isArray(ph?.samples)?ph.samples:[]).filter(s=>String(s.structure_id||'')===id&&String(s.mapping_status||'').startsWith('structure_'))}
  function mappedCard(ph,id){
    const mapped=exactMappedSamples(ph,id);
    const cards=mapped.map((s,i)=>{const facts=sampleFacts(s).map(x=>`<div class="photo-fact"><span>${esc(x.name)}</span><strong>${esc(x.value)}</strong>${x.eligible?'<small>analysis eligible</small>':''}</div>`).join('');return `<article class="photo-sample"><div class="photo-sample-head"><div><p class="eyebrow">Mapped sample ${i+1}</p><h3>${esc(s.sample_label||s.reported_compound_label||'Curated structure-mapped sample')}</h3><p class="fine">${esc([s.sample_form,s.property_scope,s.mapping_status].filter(Boolean).map(x=>String(x).replaceAll('_',' ')).join(' · '))}</p></div><span class="photo-count">${esc((s.measurements||[]).length)} measurements</span></div>${facts?`<div class="photo-facts">${facts}</div>`:''}</article>`}).join('');
    return `<section class="block full photo-modal-section photo-structure-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structure-mapped photophysics · ${esc(ph.version||CONTRACT)}</p><h2>Measurements mapped to ${esc(id)}</h2></div><span class="photo-stage ${stageClass(ph)}">Parent article · ${esc(stage(ph))}</span></div><p class="fine photo-stage-note">The verification badge describes the parent article. Only samples explicitly mapped to this crystallographic structure are shown here; article-level, processed, composite and device measurements are not inherited by the structure.</p><div class="photo-inline-stats"><span><strong>${esc(mapped.length)}</strong> mapped samples</span><span><strong>${esc(mapped.reduce((n,s)=>n+(s.measurements||[]).length,0))}</strong> mapped measurements</span></div><div class="photo-samples">${cards}</div></section>`;
  }
  function unmappedCard(ph,id){return `<section class="block full photo-modal-section photo-structure-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structure-mapped photophysics · ${esc(ph?.version||CONTRACT)}</p><h2>No structure-mapped data</h2></div><span class="photo-stage ${stageClass(ph)}">Parent article · ${esc(stage(ph))}</span></div><p class="fine">No publication-eligible photophysics sample or measurement is mapped to ${esc(id)}. Parent-article verification is reported separately and does not assign article-level or other sample-grain measurements to this crystallographic structure.</p></section>`}
  function withheldCard(id){return `<section class="block full photo-modal-section photo-structure-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structure-mapped photophysics · ${CONTRACT}</p><h2>Structured data withheld</h2></div><span class="photo-stage passa">Parent article · pending independent verification</span></div><p class="fine">The parent article does not satisfy the Photophysics 1.4.0 public-state gate. No measurement payload is inherited or rendered for ${esc(id)}.</p></section>`}
  function legacyBoundary(grid){return [...grid.querySelectorAll('.block.full')].find(s=>String(s.querySelector('h3')?.textContent||'').trim()==='Photophysics evidence-grain boundary')||null}
  async function enhanceStructureModal(){
    const body=$('modalBody');if(!body||body.querySelector('.photo-structure-modal-section,.photo-structure-modal-loading'))return;
    const eyebrow=body.querySelector('.eyebrow'),m=String(eyebrow?.textContent||'').match(/^(CUH-[A-Za-z0-9_-]+)\s*·\s*Record/i);if(!m)return;
    const id=m[1],grid=body.querySelector('.grid2');if(!grid)return;
    const loading=document.createElement('section');loading.className='block full photo-structure-modal-loading';loading.innerHTML='<h3>Structure-mapped photophysics</h3><p class="fine">Loading structure-grain photophysics…</p>';const legacy=legacyBoundary(grid);if(legacy)legacy.replaceWith(loading);else grid.appendChild(loading);
    try{
      const r=await fetch(`${DATA}?action=structure&id=${encodeURIComponent(id)}`,{cache:'no-store',headers:{accept:'application/json'}}),x=await r.json();
      if(!r.ok)throw new Error(x.error||`HTTP ${r.status}`);
      if(Number(x.current_curated_revision)!==CURRENT_REVISION)throw new Error(`Expected Current Curated rev.${CURRENT_REVISION}`);
      const ph=x.photophysics;
      if(ph?.ok===true&&String(ph.version||'')!==CONTRACT)throw new Error(`Expected Photophysics ${CONTRACT}, got ${ph.version||'unknown'}`);
      if(!loading.isConnected)return;
      if(ph?.ok===true&&!parentPublishable(ph)){loading.outerHTML=withheldCard(id);return}
      const mapped=exactMappedSamples(ph,id);
      loading.outerHTML=ph?.ok===true&&ph.structure_mapping_state==='mapped_samples_present'&&mapped.length>0?mappedCard(ph,id):unmappedCard(ph,id);
    }catch(e){if(loading.isConnected)loading.innerHTML=`<h3>Structure-mapped photophysics</h3><p class="fine">Temporarily unavailable: ${esc(e.message)}</p>`}
  }
  function watch(){const body=$('modalBody');if(!body)return;const o=new MutationObserver(()=>setTimeout(enhanceStructureModal,0));o.observe(body,{childList:true,subtree:false});enhanceStructureModal()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();