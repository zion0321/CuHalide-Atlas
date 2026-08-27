/* CuHalide Atlas visible structured photophysics UI v1.4.0
   Public projection only. No raw evidence files, locators or internal IDs are exposed. */
(() => {
  'use strict';

  const DATA='/api/public-data';
  const PHOTOPHYSICS_CONTRACT='1.4.0';
  const CURRENT_REVISION=9;
  const PUBLICATION_POLICY='two_pass_verified_or_verified_no_reported_data';
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
  function stageLabel(ph){if(ph?.public_state==='two_pass_verified'||ph?.two_pass_verified===true)return 'Two-pass verified';if(ph?.public_state==='verified_no_reported_data')return 'Verified · no reported data';return 'Withheld pending independent verification'}
  function stageClass(ph){return ph?.two_pass_verified===true?'verified':'passa'}
  function publishableArticleState(ph){return ph?.two_pass_verified===true||ph?.public_state==='two_pass_verified'||ph?.public_state==='verified_no_reported_data'}

  async function getHealth(){
    if(!healthPromise)healthPromise=fetch(`${DATA}?action=photophysics-health`,{cache:'no-store',headers:{accept:'application/json'}}).then(async r=>{
      const x=await r.json();
      if(!r.ok||x.ok!==true)throw new Error(x.error||`HTTP ${r.status}`);
      if(x.version!==PHOTOPHYSICS_CONTRACT)throw new Error(`Expected Photophysics ${PHOTOPHYSICS_CONTRACT}, got ${x.version||'unknown'}`);
      if(Number(x.current_curated_revision)!==CURRENT_REVISION)throw new Error(`Expected Current Curated rev.${CURRENT_REVISION}, got rev.${x.current_curated_revision??'unknown'}`);
      if(x.publication_policy!==PUBLICATION_POLICY)throw new Error(`Unexpected publication policy: ${x.publication_policy||'unknown'}`);
      if(Number(x.pass_a_curated_articles||0)!==0)throw new Error('Pass A-only articles must not be published by Photophysics 1.4.0');
      return x;
    });
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
    if(tags&&!tags.querySelector('.photo-contract-tag'))tags.insertAdjacentHTML('beforeend','<span class="photo-contract-tag">Structured photophysics 1.4 · two-pass publication gate</span>');
  }

  function injectHomePanel(){
    const dashboard=document.querySelector('.view[data-view="home"] .dashboard');if(!dashboard||dashboard.querySelector('.photo-home-panel'))return;
    dashboard.insertAdjacentHTML('afterbegin',`<article class="panel photo-home-panel">
      <div class="photo-home-copy"><p class="eyebrow">Structured photophysics 1.4</p><h2>Photophysics is sample- and measurement-resolved.</h2><p class="fine">Public data-bearing records are independently two-pass verified. Sample form, measurement conditions, normalized values, mechanism assignments and structure mapping remain at their correct evidence grain; source conflicts fail closed.</p><div class="actions"><a class="btn primary" href="#photophysics">Open photophysics</a><button class="btn secondary" type="button" data-article="381">View a structured record</button></div></div>
      <div class="photo-home-metrics" id="photoHomeMetrics"><div class="photo-metric"><strong>329</strong><span>Two-pass verified</span></div><div class="photo-metric"><strong>—</strong><span>Measurements</span></div><div class="photo-metric"><strong>—</strong><span>Normalized values</span></div></div>
    </article>`);
  }

  function injectView(){
    if(document.querySelector('.view[data-view="photophysics"]'))return;
    const target=document.querySelector('.view[data-view="polar"]')||document.querySelector('.view[data-view="rag"]');if(!target)return;
    target.insertAdjacentHTML('beforebegin',`<section class="view photo-view" data-view="photophysics">
      <div class="shell page-head"><p class="eyebrow">Structured photophysics · contract ${PHOTOPHYSICS_CONTRACT}</p><h1>Photophysics at the correct experimental grain</h1><p>Browse only publication-eligible structured records: data-bearing articles are independently two-pass verified, while verified-no-data articles are retained explicitly. Crystal, powder, composite, film and device measurements are not conflated, and unresolved source conflicts remain fail-closed.</p></div>
      <div class="shell photo-status-grid" id="photoStatusGrid" aria-live="polite"><div class="panel loading">Loading structured photophysics status…</div></div>
      <div class="shell photo-feature-grid">
        <article class="panel"><p class="eyebrow">Publication gate</p><h2>Data-bearing public records require two-pass verification</h2><div class="photo-stage-row"><span class="photo-stage verified">Two-pass verified</span><p>Independent Pass A and Pass B agree for every public data-bearing article state.</p></div><div class="photo-stage-row"><span class="photo-stage passa">Verified · no reported data</span><p>Primary evidence was reviewed and no reportable photophysics measurement is exposed. Pass A-only data-bearing states remain unpublished.</p></div></article>
        <article class="panel"><p class="eyebrow">Evidence grain</p><h2>Sample state stays attached to every measurement</h2><p class="fine">Crystal-intrinsic, processed, composite and device states remain distinct. Structure mapping is exposed only when supported; quantitative-analysis eligibility is an independent flag.</p><div class="photo-grain-chain"><span>Article</span><i>→</i><span>Sample state</span><i>→</i><span>Measurement</span><i>→</i><span>Value / band / mechanism</span></div></article>
      </div>
      <div class="shell photo-example-panel panel"><div><p class="eyebrow">Open real records</p><h2>Inspect the structured layer directly</h2><p class="fine">Article dialogs render the public sample → measurement → value hierarchy only after the publication gate is satisfied. Raw PDFs, SI/CIF files, evidence locators and internal adjudication remain private.</p></div><div class="photo-example-actions"><button class="btn primary" type="button" data-article="381">Open two-pass example · Record 381</button><button class="btn secondary" type="button" data-article="46">Open article-level PLQY example · Record 46</button><a class="btn secondary" href="#articles">Search all literature</a></div></div>
    </section>`);
  }

  function renderHealth(h){
    const conflicts=h?.checks?.conflict_rows_total??0;
    const status=$('photoStatusGrid');
    if(status)status.innerHTML=[
      ['Two-pass verified',h.two_pass_verified_articles,'all public data-bearing articles'],
      ['Verified no reported data',h.verified_no_data_articles,'explicit reviewed no-data state'],
      ['Sample states',h.publishable_samples,'publicly queryable'],
      ['Measurements',h.publishable_measurements,'condition-aware records'],
      ['Normalized values',h.publishable_values,'with explicit eligibility'],
      ['Analysis-eligible values',h.analysis_eligible_values,'strict quantitative subset'],
      ['Mechanism claims',h.publishable_mechanism_claims,'curated assignments'],
      ['Source conflicts',conflicts,'0 nonterminal · fail-closed']
    ].map(([a,b,c])=>`<article class="photo-stat"><span>${esc(a)}</span><strong>${esc(b)}</strong><small>${esc(c)}</small></article>`).join('');
    const hm=$('photoHomeMetrics');if(hm)hm.innerHTML=`<div class="photo-metric"><strong>${esc(h.two_pass_verified_articles)}</strong><span>Two-pass verified</span></div><div class="photo-metric"><strong>${esc(h.publishable_measurements)}</strong><span>Measurements</span></div><div class="photo-metric"><strong>${esc(h.publishable_values)}</strong><span>Normalized values</span></div>`;
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
    if(ph.public_state==='verified_no_reported_data')return `<section class="photo-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structured photophysics · ${PHOTOPHYSICS_CONTRACT}</p><h2>No reportable photophysics measurement</h2></div><span class="photo-stage passa">Verified · no reported data</span></div><p class="fine">Primary evidence was reviewed and no reportable measurement is exposed at the curated sample grain.</p></section>`;
    if(!publishableArticleState(ph)||ph.two_pass_verified!==true)return `<section class="photo-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structured photophysics · ${PHOTOPHYSICS_CONTRACT}</p><h2>Structured data withheld</h2></div><span class="photo-stage passa">Pending independent verification</span></div><p class="fine">This article state does not satisfy the Photophysics 1.4.0 two-pass publication gate. No measurement payload is rendered.</p></section>`;
    const conflicts=Array.isArray(ph.conflicts)?ph.conflicts:[];
    return `<section class="photo-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structured photophysics · ${esc(ph.version||PHOTOPHYSICS_CONTRACT)}</p><h2>Sample-resolved measurements</h2></div><span class="photo-stage ${stageClass(ph)}">${esc(stageLabel(ph))}</span></div><p class="fine photo-stage-note">Independent Pass A and Pass B agree for this exposed article state. Source-conflicted or otherwise ineligible measurements remain fail-closed.</p><div class="photo-inline-stats"><span><strong>${esc(counts.samples??samples.length)}</strong> samples</span><span><strong>${esc(counts.measurements??0)}</strong> measurements</span><span><strong>${esc(counts.values??0)}</strong> values</span><span><strong>${esc(counts.conflicts??conflicts.length)}</strong> conflicts</span></div><div class="photo-samples">${samples.slice(0,8).map(sampleCard).join('')}</div>${samples.length>8?`<p class="fine">${esc(samples.length-8)} additional curated sample states are available through the public query interface.</p>`:''}${conflicts.length?`<div class="photo-conflict"><strong>Curated source discrepancy</strong>${conflicts.slice(0,4).map(c=>`<p>${esc(labelKey(c.property_key))}: ${esc(c.adjudication_status||'unresolved')} · ${esc(c.warning||'Conflicting source values are retained explicitly.')}</p>`).join('')}</div>`:''}<p class="fine photo-privacy">Public projection only: primary source files, raw evidence locators, internal sample IDs and unpublished adjudication notes are not exposed.</p></section>`;
  }

  async function enhanceArticleModal(){
    const body=$('modalBody');if(!body||body.querySelector('.photo-modal-section,.photo-modal-loading'))return;
    const eyebrow=body.querySelector('.eyebrow');const m=String(eyebrow?.textContent||'').match(/Article record\s+(\d+)/i);if(!m)return;
    const id=m[1],grid=body.querySelector('.grid2');if(!grid)return;
    const loading=document.createElement('section');loading.className='block full photo-modal-loading';loading.innerHTML='<h3>Structured photophysics</h3><p class="fine">Loading sample-resolved photophysics…</p>';grid.appendChild(loading);
    try{
      const r=await fetch(`${DATA}?action=article&id=${encodeURIComponent(id)}`,{cache:'no-store',headers:{accept:'application/json'}}),x=await r.json();
      if(!r.ok)throw new Error(x.error||`HTTP ${r.status}`);
      if(String(x?.photophysics?.version||PHOTOPHYSICS_CONTRACT)!==PHOTOPHYSICS_CONTRACT)throw new Error(`Unexpected photophysics contract ${x?.photophysics?.version||'unknown'}`);
      if(!loading.isConnected)return;
      loading.outerHTML=x.photophysics&&x.photophysics.ok!==false?renderPhotophysics(x.photophysics):'<section class="photo-modal-section"><div class="photo-modal-title"><div><p class="eyebrow">Structured photophysics</p><h2>No public structured record</h2></div></div><p class="fine">No structured photophysics projection is available for this article.</p></section>';
    }catch(e){if(loading.isConnected)loading.innerHTML=`<h3>Structured photophysics</h3><p class="fine">Temporarily unavailable: ${esc(e.message)}</p>`}
  }

  function watchModal(){const body=$('modalBody');if(!body)return;const o=new MutationObserver(()=>setTimeout(enhanceArticleModal,0));o.observe(body,{childList:true,subtree:false})}

  async function init(){
    document.documentElement.classList.add('ui-photophysics-v1-4');
    injectNavigation();injectHero();injectHomePanel();injectView();watchModal();
    window.addEventListener('hashchange',()=>setTimeout(syncPhotoRoute,0));setTimeout(syncPhotoRoute,0);
    try{renderHealth(await getHealth())}catch(e){const n=$('photoStatusGrid');if(n)n.innerHTML=`<div class="error">Structured photophysics status is temporarily unavailable: ${esc(e.message)}</div>`}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();