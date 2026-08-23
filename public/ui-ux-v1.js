/* CuHalide Atlas portal UX layer v1.0
   Uses only existing public query-and-view endpoints. */
(() => {
  'use strict';

  const DATA='/api/public-data';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const compact=(v,n=115)=>{const s=String(v??'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s};
  const state={searchTimer:null,searchAbort:null,lastFocus:null,toastTimer:null};

  async function api(action,params={},signal){
    const u=new URL(DATA,location.origin);u.searchParams.set('action',action);
    for(const[k,v]of Object.entries(params))if(v!==''&&v!==null&&v!==undefined)u.searchParams.set(k,String(v));
    const r=await fetch(u,{cache:'no-store',headers:{accept:'application/json'},signal});
    const x=await r.json().catch(()=>({}));if(!r.ok)throw new Error(x.error||`HTTP ${r.status}`);return x;
  }

  function addReviewChip(){
    const brand=document.querySelector('.brand');if(!brand||brand.querySelector('.ux-review-chip'))return;
    const chip=document.createElement('span');chip.className='ux-review-chip';chip.textContent='Prepublication review';chip.title='Search-engine indexing remains disabled until the formal public release is authorized.';brand.appendChild(chip);
  }

  function addSearchTrigger(){
    const head=document.querySelector('.head'),menu=$('menu');if(!head||!menu||$('uxSearchTrigger'))return;
    const b=document.createElement('button');b.id='uxSearchTrigger';b.type='button';b.className='ux-search-trigger';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-controls','uxSearchDialog');b.setAttribute('aria-label','Search CuHalide Atlas');b.innerHTML='<span>Search Atlas</span><kbd aria-hidden="true">⌘K</kbd>';
    head.insertBefore(b,menu);
  }

  function refineHero(){
    const hero=document.querySelector('.view[data-view="home"] .hero');if(!hero)return;
    const h1=hero.querySelector('h1'),copy=hero.querySelector('.hero-copy');
    if(h1)h1.textContent='Evidence-grounded Cu(I) halide knowledge, from structure to photophysics.';
    if(copy)copy.textContent='Search curated literature, crystallographic structures, local Cu–X motifs and sample-resolved photophysics, or ask the Research Assistant for evidence-linked scientific synthesis.';
    if(hero.querySelector('.ux-hero-search'))return;
    const actions=hero.querySelector('.actions');if(!actions)return;
    actions.insertAdjacentHTML('afterend','<form class="ux-hero-search" id="uxHeroSearch"><label class="sr-only" for="uxHeroSearchInput">Search CuHalide Atlas</label><input id="uxHeroSearchInput" type="search" autocomplete="off" placeholder="Search title, DOI, formula, space group…"><button type="submit">Search</button></form><small class="ux-hero-search-hint">Searches the curated literature and Core-Included structure register.</small>');
  }

  function addStartGrid(){
    const kpis=document.querySelector('.view[data-view="home"] .kpis');if(!kpis||document.querySelector('.ux-start'))return;
    const section=document.createElement('section');section.className='shell ux-start';section.innerHTML='<div class="ux-start-head"><div><p class="eyebrow">Research paths</p><h2>Start with the evidence layer you need.</h2></div><p>Each route preserves its own scientific grain. Article evidence, structure identity and sample-resolved photophysics are not silently merged.</p></div><div class="ux-start-grid"><a class="ux-start-card" href="#articles"><span>01 · Literature</span><strong>Find the source article</strong><small>Search DOI, title, compound families and curated article-level evidence.</small><i aria-hidden="true">→</i></a><a class="ux-start-card" href="#structures"><span>02 · Structures</span><strong>Resolve crystallography</strong><small>Inspect formula, phase, dimensionality, space group, confidence and source mapping.</small><i aria-hidden="true">→</i></a><a class="ux-start-card" href="#photophysics"><span>03 · Photophysics</span><strong>Inspect measurements</strong><small>Keep crystal, powder, composite, film and device measurements at the correct sample grain.</small><i aria-hidden="true">→</i></a><a class="ux-start-card" href="#rag"><span>04 · Research Assistant</span><strong>Ask across evidence</strong><small>Use conversational LLM synthesis with automatic retrieval when Atlas evidence is required.</small><i aria-hidden="true">→</i></a></div>';
    const wrap=kpis.closest('.section');wrap?.insertAdjacentElement('afterend',section);
  }

  function addFooterLinks(){
    const n=document.querySelector('.footer-links');if(!n)return;
    const items=[['#photophysics','Photophysics'],['#rag','Research Assistant']];
    for(const[href,label]of items)if(!n.querySelector(`a[href="${href}"]`)){const a=document.createElement('a');a.href=href;a.textContent=label;a.className='ux-footer-link';n.appendChild(a)}
  }

  function addRouteAnnouncer(){
    if($('uxRouteStatus'))return;const n=document.createElement('div');n.id='uxRouteStatus';n.className='ux-route-status';n.setAttribute('aria-live','polite');n.setAttribute('aria-atomic','true');document.body.appendChild(n);
  }

  function syncRouteA11y(){
    const raw=(location.hash||'#home').slice(1).split('?')[0],base=raw.split('/')[0]||'home';
    document.querySelectorAll('[data-route]').forEach(a=>{if(a.dataset.route===base)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    const names={home:'Overview',articles:'Literature',structures:'Structures',photophysics:'Photophysics',polar:'Polar structures',rag:'Research Assistant',watch:'Literature Watch',methods:'Methods',citation:'Data provenance'};
    const status=$('uxRouteStatus');if(status&&names[base])status.textContent=`${names[base]} view opened`;
  }

  function dialogMarkup(){
    if($('uxSearchDialog'))return;
    document.body.insertAdjacentHTML('beforeend','<div class="ux-search-dialog" id="uxSearchDialog" hidden><div class="ux-search-backdrop" data-ux-search-close></div><section class="ux-search-panel" role="dialog" aria-modal="true" aria-labelledby="uxSearchTitle"><div class="ux-search-head"><label class="sr-only" for="uxSearchInput" id="uxSearchTitle">Search CuHalide Atlas</label><input id="uxSearchInput" type="search" autocomplete="off" spellcheck="false" placeholder="Title, DOI, formula, structure ID, space group…"><button class="ux-search-close" type="button" data-ux-search-close aria-label="Close search">×</button></div><div class="ux-search-body" id="uxSearchBody"></div><div class="ux-search-footer">Curated query-and-view only · primary files and private evidence remain unavailable</div></section></div><div class="ux-toast" id="uxToast" role="status" aria-live="polite"></div>');
    renderSearchShortcuts();
  }

  function renderSearchShortcuts(){
    const body=$('uxSearchBody');if(!body)return;
    body.innerHTML='<div class="ux-search-shortcuts"><button type="button" data-ux-route="articles"><strong>Literature</strong><span>Find papers, DOI and compounds</span></button><button type="button" data-ux-route="structures"><strong>Structures</strong><span>Formula, phase and space group</span></button><button type="button" data-ux-route="photophysics"><strong>Photophysics</strong><span>Sample-resolved measurements</span></button><button type="button" data-ux-route="rag"><strong>Research Assistant</strong><span>Ask an evidence-linked question</span></button></div>';
  }

  function openSearch(initial=''){
    const d=$('uxSearchDialog');if(!d)return;state.lastFocus=document.activeElement;d.hidden=false;document.body.style.overflow='hidden';const input=$('uxSearchInput');input.value=initial;requestAnimationFrame(()=>{input.focus();input.select()});if(initial.trim().length>=2)runSearch(initial.trim());else renderSearchShortcuts();
  }

  function closeSearch(){
    const d=$('uxSearchDialog');if(!d||d.hidden)return;state.searchAbort?.abort();d.hidden=true;document.body.style.overflow=$('modal')&&!$('modal').hidden?'hidden':'';const f=state.lastFocus;state.lastFocus=null;f?.focus?.();
  }

  function showToast(text){
    const n=$('uxToast');if(!n)return;clearTimeout(state.toastTimer);n.textContent=text;n.classList.add('show');state.toastTimer=setTimeout(()=>n.classList.remove('show'),1700);
  }

  function resultButton(type,x){
    if(type==='article'){
      const meta=[x.journal,x.year,x.doi].filter(Boolean).join(' · ');
      return `<button type="button" class="ux-search-result" data-ux-open-article="${esc(x.record_id)}"><strong>${esc(x.title||`Article record ${x.record_id}`)}</strong><span>${esc(meta)}</span></button>`;
    }
    const meta=[x.formula,x.dimensionality_class||x.dimensionality,x.space_group].filter(Boolean).join(' · ');
    return `<button type="button" class="ux-search-result" data-ux-open-structure="${esc(x.structure_id)}"><strong>${esc(x.structure_id)} · ${esc(compact(x.label||x.formula||'Curated structure'))}</strong><span>${esc(meta)}</span></button>`;
  }

  function groupHtml(title,total,items,type){
    const shown=Array.isArray(items)?items:[];
    return `<section class="ux-search-group"><div class="ux-search-group-head"><strong>${esc(title)}</strong><span>${esc(total??shown.length)} matching records</span></div><div class="ux-search-results">${shown.length?shown.map(x=>resultButton(type,x)).join(''):'<div class="ux-search-empty">No matching curated records in this layer.</div>'}</div></section>`;
  }

  async function runSearch(q){
    const body=$('uxSearchBody');if(!body)return;state.searchAbort?.abort();const ctrl=new AbortController();state.searchAbort=ctrl;body.innerHTML='<div class="ux-search-state">Searching curated literature and structures…</div>';
    try{
      const [a,s]=await Promise.all([
        api('articles',{q,page:1,page_size:5,release_status:'Current canonical'},ctrl.signal),
        api('structures',{q,page:1,page_size:5,eligibility:'Core - Included'},ctrl.signal)
      ]);
      if(ctrl.signal.aborted)return;
      body.innerHTML=groupHtml('Literature',a.pagination?.total,a.items,'article')+groupHtml('Structures',s.pagination?.total,s.items,'structure');
    }catch(e){if(e.name!=='AbortError')body.innerHTML=`<div class="error">Search is temporarily unavailable: ${esc(e.message)}</div>`}
  }

  function scheduleSearch(){
    clearTimeout(state.searchTimer);const q=$('uxSearchInput')?.value.trim()||'';
    state.searchTimer=setTimeout(()=>{if(q.length<2){state.searchAbort?.abort();renderSearchShortcuts()}else runSearch(q)},220);
  }

  function enhanceArticleCards(){
    const root=$('articles');if(!root)return;
    root.querySelectorAll('.article').forEach(card=>{
      if(card.querySelector('.ux-article-footer'))return;const button=card.querySelector('[data-article]');const id=button?.dataset.article;if(!id)return;
      card.insertAdjacentHTML('beforeend',`<div class="ux-article-footer"><small>Open the curated record for full evidence-grain context.</small><button class="ux-open-record" type="button" data-article="${esc(id)}">View record →</button></div>`);
    });
  }

  function addModalTools(){
    const body=$('modalBody');if(!body||body.querySelector('.ux-modal-tools'))return;
    const eyebrow=body.querySelector('.eyebrow'),meta=body.querySelector('.meta');if(!eyebrow||!meta)return;const text=String(eyebrow.textContent||'');
    let path='';const article=text.match(/Article record\s+(\d+)/i),structure=text.match(/(CUH-[A-Za-z0-9_-]+)/i);
    if(article)path=`/article/${article[1]}`;else if(structure)path=`/structure/${encodeURIComponent(structure[1])}`;else return;
    const wrap=document.createElement('div');wrap.className='ux-modal-tools';wrap.innerHTML=`<a href="${esc(path)}" target="_blank" rel="noreferrer">Standalone record</a><button type="button" data-ux-copy-link="${esc(path)}">Copy record link</button>`;meta.insertAdjacentElement('afterend',wrap);
  }

  function observeDynamicUi(){
    const articles=$('articles');if(articles){new MutationObserver(enhanceArticleCards).observe(articles,{childList:true});enhanceArticleCards()}
    const modal=$('modalBody');if(modal){new MutationObserver(()=>setTimeout(addModalTools,0)).observe(modal,{childList:true});addModalTools()}
  }

  function goRoute(route){closeSearch();location.hash=`#${route}`}
  function openResult(kind,id){closeSearch();location.hash=kind==='article'?`#article/${encodeURIComponent(id)}`:`#structure/${encodeURIComponent(id)}`}

  function bind(){
    $('uxSearchTrigger')?.addEventListener('click',()=>openSearch());
    $('uxHeroSearch')?.addEventListener('submit',e=>{e.preventDefault();openSearch($('uxHeroSearchInput')?.value.trim()||'')});
    $('uxSearchInput')?.addEventListener('input',scheduleSearch);
    $('uxSearchDialog')?.addEventListener('click',e=>{
      if(e.target.closest('[data-ux-search-close]')){closeSearch();return}
      const r=e.target.closest('[data-ux-route]');if(r){goRoute(r.dataset.uxRoute);return}
      const a=e.target.closest('[data-ux-open-article]');if(a){openResult('article',a.dataset.uxOpenArticle);return}
      const s=e.target.closest('[data-ux-open-structure]');if(s){openResult('structure',s.dataset.uxOpenStructure)}
    });
    document.addEventListener('click',async e=>{
      const b=e.target.closest('[data-ux-copy-link]');if(!b)return;const url=new URL(b.dataset.uxCopyLink,location.origin).href;
      try{await navigator.clipboard.writeText(url);showToast('Record link copied')}catch{showToast('Could not copy link')}
    });
    document.addEventListener('keydown',e=>{
      const searchOpen=$('uxSearchDialog')&&!$('uxSearchDialog').hidden;
      if(searchOpen&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeSearch();return}
      if(searchOpen&&e.key==='Tab'){
        const panel=document.querySelector('.ux-search-panel'),f=[...panel.querySelectorAll('button,input,[href],[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled),first=f[0],last=f[f.length-1];if(!first||!last)return;
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}return;
      }
      const tag=String(document.activeElement?.tagName||'').toLowerCase(),typing=['input','textarea','select'].includes(tag)||document.activeElement?.isContentEditable;
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();return}
      if(e.key==='/'&&!typing&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.shiftKey&&!($('modal')&&!$('modal').hidden)){e.preventDefault();openSearch()}
    },true);
    window.addEventListener('hashchange',()=>setTimeout(syncRouteA11y,0));
  }

  function init(){
    document.documentElement.classList.add('ui-ux-v1');addReviewChip();addSearchTrigger();refineHero();addStartGrid();addFooterLinks();addRouteAnnouncer();dialogMarkup();observeDynamicUi();bind();syncRouteA11y();
    const rag=document.querySelector('#nav [data-route="rag"]');if(rag)rag.title='Conversational Research Assistant with evidence-grounded retrieval';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
