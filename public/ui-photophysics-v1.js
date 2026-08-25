/* CuHalide Atlas visible structured photophysics UI v1.0
   Public projection only. No raw evidence files, locators or internal IDs are exposed. */
(() => {
  'use strict';

  const DATA='/api/public-data';
  const PHOTO_ALLOWED=new Set(['1.3.2','1.3.3']);
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let healthPromise=null;

  const propertyLabels={
    plqy:'PLQY',average_lifetime:'Lifetime',optical_band_gap:'Optical gap',computed_band_gap:'Computed gap',
    stokes_shift:'Stokes shift',thermal_activation_energy:'Activation energy',exciton_binding_energy:'Exciton binding energy',
    light_yield:'Light yield',xray_lod:'X-ray LOD',spatial_resolution:'Spatial resolution',scintillation_decay_time:'Scintillation decay',
    luminescence_dissymmetry_factor:'g_lum',g_lum:'g_lum',peak_eqe:'Peak EQE',external_quantum_efficiency:'EQE',
    max_luminance:'Max luminance',t50:'T50',charge_carrier_mobility:'Carrier mobility',hole_mobility:'Hole mobility',
    electron_mobility:'Electron mobility',trmc_yield_mobility:'TRMC yield mobility',trap_density:'Trap density',film_thickness:'Film thickness',
    tadf_fraction:'TADF fraction',phosphorescence_fraction:'Phosphorescence fraction',pl_intensity_retention:'PL retention',
    rl_intensity_retention:'RL retention',rl_stability_outcome:'RL stability',thermal_decomposition_temperature:'Thermal decomposition',
    radiative_rate:'Radiative rate',nonradiative_rate:'Non-radiative rate',cie_x:'CIE x',cie_y:'CIE y',
    correlated_color_temperature:'CCT',color_rendering_index:'CRI',linear_dose_response_range:'Linear dose-response range'
  };
  const priority=['plqy','average_lifetime','optical_band_gap','stokes_shift','light_yield','xray_lod','spatial_resolution','scintillation_decay_time','g_lum','luminescence_dissymmetry_factor','thermal_activation_energy','exciton_binding_energy','peak_eqe','external_quantum_efficiency','max_luminance','hole_mobility','electron_mobility','trap_density','rl_intensity_retention','pl_intensity_retention'];

  function unitText(u){return String(u||'').replace(/^us$/,'μs').replace(/^degC$/,'°C').replace(/MeV-1/g,'MeV⁻¹').replace(/mm-1/g,'mm⁻¹').replace(/s-1/g,'s⁻¹')}
  function num(v){const n=Number(v);if(!Number.isFinite(n))return String(v??'');if(Math.abs(n)>0&&Math.abs(n)<0.001)return n.toExponential(2);return n.toLocaleString('en-US',{maximumSignificantDigits:6})}
  function fmtValue(v){
    let core='';
    if(v.value_numeric!==undefined&&v.value_numeric!==null)core=num(v.value_numeric);
    else if(v.value_text)core=String(v.value_text);
    else if(v.lower_bound!==undefined||v.upper_bound!==undefined)core=[v.lower_bound,v.upper_bound].filter(x=>x!==undefined&&x!==null).map(num).join('–');
    else return '';
    const u=unitText(v.unit);return `${core}${u?' '+u:''}`;
  }
  function labelKey(k){return propertyLabels[k]||String(k||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())}
  function stageLabel(ph){if(ph?.public_state==='two_pass_verified'||ph?.two_pass_verified===true)return 'Two-pass verified';if(ph?.public_state==='pass_a_curated')return 'Pass A curated';if(ph?.public_state==='verified_no_reported_data')return 'Primary-evidence reviewed';return 'Curated'}
  function stageClass(ph){return ph?.two_pass_verified===true?'verified':'passa'}

  async function getHealth(){
    if(!healthPromise)healthPromise=fetch(`${DATA}?action=photophysics-health`,{cache:'no-store',headers:{accept:'application/json'}}).then(async r=>{const x=await r.json();if(!r.ok||x.ok!==true)throw new Error(x.error||`HTTP ${r.status}`);if(!PHOTO_ALLOWED.has(String(x.version||'')))throw new Error(`Unsupported Structured Photophysics contract ${String(x.version||'missing')}`);return x});
    return healthPromise;
  }

  function injectNavigation(){
    const nav=$('nav');if(!nav||nav.querySelector('[data-route="photophysics"]'))return;
    const a=document.createElement('a');a.dataset.route='photophysics';a.href='#photophysics';a.textContent='Photophysics';
    const polar=nav.querySelector('[data-route="polar"]');nav.insertBefore(a,polar||nav.querySelector('[data-route="rag"]')||null);
  }

  function injectHero(){
    const actions=document.querySelector('.view[data-view="home"] .hero .actions');
    if(actions&&!actions.querySelector('[href="#photophysics"]'))actions.insertAdjacentHTML('beforeend','<a class="btn secondary photo-hero-link" href="#photophysics">Explore photophysics</a>');
    const tags=document.querySelector('.view[data-view="home"] .hero .tags');
    if(tags&&!tags.querySelector('.photo-pass-a-tag'))tags.insertAdjacentHTML('beforeend','<span class="photo-pass-a-tag">Structured photophysics · Pass A complete</span>');
  }

  function injectHomePanel(){
    const dashboard=document.querySelector('.view[data-view="home"] .dashboard');if(!dashboard||dashboard.querySelector('.photo-home-panel'))return;
    dashboard.insertAdjacentHTML('afterbegin',`<article class="panel photo-home-panel">
      <div class="photo-home-copy"><p class="eyebrow">New structured layer</p><h2>Photophysics is now sample- and measurement-resolved.</h2><p class="fine">Curated photophysical records now preserve sample form, measurement conditions, normalized values, mechanism assignments and verification stage instead of collapsing everything into one article-level summary.</p><div class="actions"><a class="btn primary" href="#photophysics">Open photophysics</a><button class="btn secondary" type="button" data-article="381">View a structured record</button></div></div>
      <div class="photo-home-metrics" id="photoHomeMetrics"><div class="photo-metric"><strong>383</strong><span>Pass A complete</span></div><div class="photo-metric"><strong>—</strong><span>Measurements</span></div><div class="photo-metric"><strong>—</strong><span>Normalized values</span></div></div>
    </article>`);
  }

  function injectView(){
    if(document.querySelector('.view[data-view="photophysics"]'))return;
    const target=document.querySelector('.view[data-view="polar"]')||document.querySelector('.view[data-view="rag"]');if(!target)return;
    target.insertAdjacentHTML('beforebegin',`<section class="view photo-view" data-view="photophysics">
      <div class="shell page-head"><p class="eyebrow">Structured photophysics · contract <span id="photoContractVersion">resolving…</span></p><h1>Photophysics at the correct experimental grain</h1><p>Browse the new curated layer without conflating a crystal, powder, composite, film or device. Pass A and independent two-pass verification are shown separately, and unresolved source conflicts remain fail-closed.</p></div>
      <div class="shell photo-status-grid" id="photoStatusGrid" aria-live="polite"><div class="panel loading">Loading structured photophysics status…</div></div>
      <div class="shell photo-feature-grid">
        <article class="panel"><p class="eyebrow">Verification ladder</p><h2>Pass A is not mislabeled as double verification</h2><div class="photo-stage-row"><span class="photo-stage passa">Pass A curated</span><p>Primary-evidence extraction and article-level curation complete. Measurement-level QC and conflict gates still apply.</p></div><div class="photo-stage-row"><span class="photo-stage verified">Two-pass verified</span><p>Independent Pass B is also complete and agrees with the Pass A article state.</p></div></article>
        <article class="panel"><p class="eyebrow">Evidence grain</p><h2>Sample state stays attached to every measurement</h2><p class="fine">Crystal-intrinsic, processed, composite and device states remain distinct. Structure mapping is exposed only when supported; quantitative-analysis eligibility is an independent flag.</p><div class="photo-grain-chain"><span>Article</span><i>→</i><span>Sample state</span><i>→</i><span>Measurement</span><i>→</i><span>Value / band / mechanism</span></div></article>
      </div>
      <div class="shell photo-example-panel panel"><div><p class="eyebrow">Open real records</p><h2>Inspect the structured layer directly</h2><p class="fine">Article dialogs now render the public sample → measurement → value hierarchy. Raw PDFs, SI/CIF files, evidence locators and internal adjudication remain private.</p></div><div class="photo-example-actions"><button class="btn primary" type="button" data-article="381">Open two-pass example · Record 381</button><button class="btn secondary" type="button" data-article="46">Open article-level PLQY example · Record 46</button><a class="btn secondary" href="#articles">Search all literature</a></div></div>
    </section>`);
  }

  function renderHealth(h){
    const contract=$('photoContractVersion');if(contract)contract.textContent=String(h.version||'unavailable');
    const status=$('photoStatusGrid');
    if(status)status.innerHTML=[
      ['Pass A complete',h.pass_a_complete_articles,'of '+h.article_queue+' reviewed articles'],
      ['Pass A curated',h.pass_a_curated_articles,'published at first-pass stage'],
      ['Two-pass verified',h.two_pass_verified_articles,'independently rechecked'],
      ['Sample states',h.publishable_samples,'publicly queryable'],
      ['Measurements',h.publishable_measurements,'condition-aware records'],
      ['Normalized values',h.publishable_values,'with explicit eligibility'],
      ['Mechanism claims',h.publishable_mechanism_claims,'curated assignments'],
      ['Analysis-eligible values',h.analysis_eligible_values,'strict quantitative subset']
    ].map(([a,b,c])=>`<article class="photo-stat"><span>${esc(a)}</span><strong>${esc(b)}</strong><small>${esc(c)}</small></article>`).join('');
    const hm=$('photoHomeMetrics');if(hm)hm.innerHTML=`<div class="photo-metric"><strong>${esc(h.pass_a_complete_articles)}</strong><span>Pass A complete</span></div><div class="photo-metric"><strong>${esc(h.publishable_measurements)}</strong><span>Measurements</span></div><div class="photo-metric"><strong>${esc(h.publishable_values)}</strong><span>Normalized values</span></div>`;
  }

  function syncPhotoRoute(){
    if((location.hash||'').split('?')[0]!=='#photophysics')return;
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view==='photophysics'));
    document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route==='photophysics'));
    $('nav')?.classList.remove('open');$('menu')?.setAttribute('aria-expanded','false');document.title='Photophysics — CuHalide Atlas';
  }

  function valuesForSample(sample){
    const out=[];
    (sample.measurements||[]).forEach(m=>(m.values||[]).forEach(v=>out.push({...v,measurement_type:m.measurement_type,measurement_label:m.measurement_label})));
    const rank=v=>{const i=priority.indexOf(v.property_key);return i<0?999:i};
    return out.filter(v=>fmtValue(v)).sort((a,b)=>rank(a)-rank(b));
  }
  function mechanismLabels(sample){
    const x=[];(sample.measurements||[]).forEach(m=>(m.mechanisms||[]).forEach(z=>{const l=z.label||z.mechanism_code;if(l&&!x.includes(l))x.push(l)}));return x;
  }
  function bandFacts(sample){
    const facts=[];(sample.measurements||[]).forEach(m=>(m.bands||[]).forEach(b=>{if(b.peak_nm&&['emission','radioluminescence','cpl'].includes(String(b.domain||''))){const k=`${b.domain}:${b.peak_nm}`;if(!facts.some(x=>x.key===k))facts.push({key:k,label:b.domain==='emission'?'Emission peak':b.domain==='radioluminescence'?'RL peak':'CPL peak',value:`${num(b.peak_nm)} nm`,eligible:b.quantitative_analysis_eligible===true})}}));return facts;
  }
  function sampleCard(s,index){
    const vals=valuesForSample(s).slice(0,10),bands=bandFacts(s).slice(0,3),mechs=mechanismLabels(s).slice(0,4);
    const facts=[...bands.map(x=>`<div class="photo-fact"><span>${esc(x.label)}</span><strong>${esc(x.value)}</strong>${x.eligible?'<small>analysis eligible</small>':''}</div>`),...vals.map(v=>`<div class="photo-fact"><span>${esc(labelKey(v.property_key))}</span><strong>${esc(fmtValue(v))}</strong>${v.analysis_eligible===true?'<small>analysis eligible</small>':v.analysis_eligible===false?'<small>descriptive only</small>':''}</div>`)].slice(0,10).join('');
    const forms=[s.sample_form&&String(s.sample_form).replaceAll('_',' '),s.property_scope&&String(s.property_scope).replaceAll('_',' '),s.mapping_status&&String(s.mapping_status).replaceAll('_',' ')].filter(Boolean);
    const measurementTypes=[...new Set((s.measurements||[]).map(m=>String(m.measurement_type||'').replaceAll('_',' ')).filter(Boolean))];
    return `<article class="photo-sample"><div class="photo-sample-head"><div><p class="eyebrow">Sample ${index+1}</p><h3>${esc(s.sample_label||s.reported_compound_label||'Curated sample state')}</h3><p class="fine">${esc(forms.join(' · '))}${s.structure_id?` · ${esc(s.structure_id)}`:''}</p></div><span class="photo-count">${esc((s.measurements||[]).length)} measurements</span></div>${facts?`<div class="photo-facts">${facts}</div>`:''}${mechs.length?`<p class="photo-mechanisms"><strong>Mechanism:</strong> ${mechs.map(esc).join(' · ')}</p>`:''}${measurementTypes.length?`<details><summary>Measurement types and conditions</summary><p class="fine">${measurementTypes.map(esc).join(' · ')}</p>${(s.measurements||[]).filter(m=>m.conditions).slice(0,4).map(m=>`<p class="fine"><strong>${esc(String(m.measurement_type||'measurement').replaceAll('_',' '))}:</strong> ${esc(m.conditions)}</p>`).join('')}</details>`:''}</article>`;
  }
  function renderPhotophysics(ph){
    const counts=ph.counts||{},samples=Array.isArray(ph.samples)?ph.samples:[];
    if(ph.public_state==='verified_no_reported_data')return `<section class="photo-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structured photophysics</p><h2>No reportable photophysics measurement</h2></div><span class="photo-stage passa">Primary-evidence reviewed</span></div><p class="fine">The reviewed source set does not expose a reportable measurement at the curated sample grain.</p></section>`;
    const conflicts=Array.isArray(ph.conflicts)?ph.conflicts:[];
    return `<section class="photo-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structured photophysics · ${esc(ph.version||'unavailable')}</p><h2>Sample-resolved measurements</h2></div><span class="photo-stage ${stageClass(ph)}">${esc(stageLabel(ph))}</span></div><p class="fine photo-stage-note">${ph.two_pass_verified===true?'Independent Pass A and Pass B agree for this exposed article state.':'Primary-evidence Pass A is complete; independent Pass B has not yet been completed.'} Source-conflicted or otherwise ineligible measurements remain fail-closed.</p><div class="photo-inline-stats"><span><strong>${esc(counts.samples??samples.length)}</strong> samples</span><span><strong>${esc(counts.measurements??0)}</strong> measurements</span><span><strong>${esc(counts.values??0)}</strong> values</span><span><strong>${esc(counts.conflicts??conflicts.length)}</strong> conflicts</span></div><div class="photo-samples">${samples.slice(0,8).map(sampleCard).join('')}</div>${samples.length>8?`<p class="fine">${esc(samples.length-8)} additional curated sample states are available through the public query interface.</p>`:''}${conflicts.length?`<div class="photo-conflict"><strong>Curated source discrepancy</strong>${conflicts.slice(0,4).map(c=>`<p>${esc(labelKey(c.property_key))}: ${esc(c.adjudication_status||'unresolved')} · ${esc(c.warning||'Conflicting source values are retained explicitly.')}</p>`).join('')}</div>`:''}<p class="fine photo-privacy">Public projection only: primary source files, raw evidence locators, internal sample IDs and unpublished adjudication notes are not exposed.</p></section>`;
  }

  async function enhanceArticleModal(){
    const body=$('modalBody');if(!body||body.querySelector('.photo-modal-section,.photo-modal-loading'))return;
    const eyebrow=body.querySelector('.eyebrow');const m=String(eyebrow?.textContent||'').match(/Article record\s+(\d+)/i);if(!m)return;
    const id=m[1],grid=body.querySelector('.grid2');if(!grid)return;
    const loading=document.createElement('section');loading.className='block full photo-modal-loading';loading.innerHTML='<h3>Structured photophysics</h3><p class="fine">Loading sample-resolved photophysics…</p>';grid.appendChild(loading);
    try{const r=await fetch(`${DATA}?action=article&id=${encodeURIComponent(id)}`,{cache:'no-store',headers:{accept:'application/json'}}),x=await r.json();if(!r.ok)throw new Error(x.error||`HTTP ${r.status}`);if(!loading.isConnected)return;loading.outerHTML=x.photophysics&&x.photophysics.ok!==false?renderPhotophysics(x.photophysics):'<section class="photo-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structured photophysics</p><h2>No public structured record</h2></div></div><p class="fine">No structured photophysics projection is available for this article.</p></section>'}catch(e){if(loading.isConnected)loading.innerHTML=`<h3>Structured photophysics</h3><p class="fine">Temporarily unavailable: ${esc(e.message)}</p>`}
  }

  function watchModal(){const body=$('modalBody');if(!body)return;const o=new MutationObserver(()=>setTimeout(enhanceArticleModal,0));o.observe(body,{childList:true,subtree:false})}

  async function init(){
    document.documentElement.classList.add('ui-photophysics-v1');
    injectNavigation();injectHero();injectHomePanel();injectView();watchModal();
    window.addEventListener('hashchange',()=>setTimeout(syncPhotoRoute,0));setTimeout(syncPhotoRoute,0);
    try{renderHealth(await getHealth())}catch(e){const n=$('photoStatusGrid');if(n)n.innerHTML=`<div class="error">Structured photophysics status is temporarily unavailable: ${esc(e.message)}</div>`}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();