/* CuHalide Atlas comprehensive quality layer v52.2 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):queueMicrotask(fn);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const fmt=n=>Number(n||0).toLocaleString('en-US');

async function fallbackCoverage(){
  const r=await fetch('/api/knowledge?action=coverage',{cache:'no-store',headers:{accept:'application/json'}});
  const x=await r.json().catch(()=>({}));if(!r.ok||x.ok!==true)throw new Error(x.error||'Coverage unavailable');return x;
}
function renderLiteratureCoverage(box,x){
  const c=x?.coverage||{},f=x?.fulltext_v2||{},articleCount=Number(c.articles??c.catalog_articles??410),fulltext=Number(f.dois||0),searchable=Number(f.catalog_searchable_dois||0),docs=Number(f.documents||0),blocks=Number(f.actual_chunks||0);
  const items=[
    [`${fmt(articleCount)} articles`,'Literature corpus','Single DOI-deduplicated article denominator','ui-cov-primary'],
    [`${fmt(searchable)} / ${fmt(articleCount)}`,'Searchable full text',`Current-catalog articles with native v2 text; the v2 source layer contains ${fmt(fulltext)} DOI records overall`,''],
    [fmt(docs),'Source documents','Registered MAIN / SI source files',''],
    [fmt(blocks),'Indexed text blocks','Retrieval blocks across registered source text','']
  ];
  box.replaceChildren(...items.map(([a,b,c2,cls])=>{const d=el('div',`ui-cov-item ${cls}`.trim());d.append(el('strong','',a),el('span','',b),el('small','',c2));return d}));box.setAttribute('aria-busy','false');
}
function ensureLiteratureCoverage(){
  const view=document.querySelector('.view[data-view="articles"]'),head=view?.querySelector('.page-head');if(!view||!head||view.querySelector('.ui-literature-coverage'))return;
  const box=el('section','shell ui-literature-coverage');box.setAttribute('aria-label','Literature corpus and source coverage');box.setAttribute('aria-live','polite');box.setAttribute('aria-busy','true');
  const placeholder=el('div','ui-cov-item ui-cov-primary');placeholder.append(el('strong','','410 articles'),el('span','','One DOI-deduplicated literature corpus'),el('small','','Loading source coverage…'));box.append(placeholder);head.insertAdjacentElement('afterend',box);
  if(window.CuHalideKnowledgeCoverage){renderLiteratureCoverage(box,window.CuHalideKnowledgeCoverage);return}
  let resolved=false;const onCoverage=e=>{if(resolved)return;resolved=true;renderLiteratureCoverage(box,e.detail);window.removeEventListener('cuhalide:coverage',onCoverage)};window.addEventListener('cuhalide:coverage',onCoverage);
  setTimeout(()=>{if(resolved)return;fallbackCoverage().then(x=>{if(resolved)return;resolved=true;renderLiteratureCoverage(box,x)}).catch(()=>{placeholder.querySelector('small').textContent='Source coverage is temporarily unavailable; the literature corpus remains 410 DOI-deduplicated articles.';box.setAttribute('aria-busy','false')})},1800);
}

function enhanceKnowledgeBusy(){
  const button=$('knowledgeRetrieve'),panel=document.querySelector('.ki-retrieval');if(!button||!panel||button.dataset.qualityBusy==='1')return;
  button.dataset.qualityBusy='1';const original=button.textContent||'Retrieve evidence';
  let bar=panel.querySelector('.ui-retrieval-progress');if(!bar){bar=el('div','ui-busy-bar ui-retrieval-progress');bar.hidden=true;panel.append(bar)}
  const sync=()=>{const busy=button.disabled;panel.setAttribute('aria-busy',String(busy));button.setAttribute('aria-busy',String(busy));bar.hidden=!busy;if(busy)button.textContent='Retrieving…';else if(button.textContent==='Retrieving…')button.textContent=original};
  new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['disabled']});sync();
}

function enhanceChatBusy(){
  const thread=$('thread'),work=document.querySelector('.rag-work'),send=$('rsend');if(!thread||!work||thread.dataset.qualityBusy==='1')return;
  thread.dataset.qualityBusy='1';let bar=work.querySelector('.ui-busy-bar');if(!bar){bar=el('div','ui-busy-bar');bar.hidden=true;work.querySelector('.rag-top')?.insertAdjacentElement('afterend',bar)}
  const sync=()=>{const busy=Boolean($('wait'))||Boolean(send?.disabled);work.setAttribute('aria-busy',String(busy));if(send)send.setAttribute('aria-busy',String(busy));bar.hidden=!busy};
  new MutationObserver(sync).observe(thread,{childList:true,subtree:true});if(send)new MutationObserver(sync).observe(send,{attributes:true,attributeFilter:['disabled']});sync();
}

function enhanceStructureRows(){
  const root=$('srows');if(!root)return;
  root.querySelectorAll('tr').forEach(row=>{
    const b=row.querySelector('button[data-structure]');if(!b)return;
    const id=b.dataset.structure||b.textContent.trim(),cells=row.querySelectorAll('td'),formula=cells[1]?.querySelector('strong')?.textContent?.trim()||'';
    b.setAttribute('aria-label',formula?`Open structure ${id}: ${formula}`:`Open structure ${id}`);
    const source=[...row.querySelectorAll('a[href]')].find(a=>/doi\.org/i.test(a.href));if(source)source.setAttribute('aria-label',`Open source DOI for structure ${id}`);
  });
}
function observeStructureRows(){const root=$('srows');if(!root||root.dataset.qualityObserver==='1')return;root.dataset.qualityObserver='1';new MutationObserver(enhanceStructureRows).observe(root,{childList:true,subtree:true});enhanceStructureRows()}

function enhancePolar(){
  const table=document.querySelector('.view[data-view="polar"] table'),caption=table?.querySelector('caption'),captionText='Polar symmetry does not by itself establish ferroelectric switching.';if(caption&&caption.textContent!==captionText)caption.textContent=captionText;
  const root=$('prows');if(root&&!root.dataset.qualityObserver){root.dataset.qualityObserver='1';new MutationObserver(()=>{
    root.querySelectorAll('tr').forEach(row=>{const b=row.querySelector('button[data-structure]');if(b)b.setAttribute('aria-label',`Open polar structure ${b.dataset.structure||b.textContent.trim()}`)})
  }).observe(root,{childList:true,subtree:true})}
}

function enhanceMotifDenominator(){
  if(location.pathname!=='/motifs'||document.querySelector('.ui-denominator-help'))return;
  const overview=document.querySelector('.overview');if(!overview)return;
  const d=el('details','ui-denominator-help');const s=el('summary','','What do 939 authority rows and 901 Core-Included structures mean?');
  const p=el('p','','939 is the complete structure/phase authority layer. 901 is the Core-Included public curated browse set. The difference reflects curation scope and eligibility, not a second structure corpus; retained authority rows remain available for provenance and audit without being promoted into the Core-Included set.');
  d.append(s,p);overview.insertAdjacentElement('afterend',d);
}

function enhanceVersionTimeline(){
  const grid=document.querySelector('.view[data-view="citation"] .citation-grid');if(!grid||grid.querySelector('.ui-version-timeline'))return;
  const card=el('article','panel ui-version-timeline');card.append(el('p','eyebrow','Update history'),el('h2','','How the current review state was assembled'),el('p','fine','Scientific curation, source review, source indexing and interface synchronization have different dates. They are shown separately so an interface update is not mistaken for a scientific recuration.'));
  const list=el('div','ui-version-list');
  const steps=[
    ['30 Jun 2026','Frozen scientific cutoff','Immutable scientific boundary for archived release 3.0.2.'],
    ['11 Aug 2026','Frozen release issued','Archived release date; distinct from its scientific cutoff.'],
    ['14 Sep 2026','Current Curated rev.10','Current structured scientific curation cutoff.'],
    ['23–24 Sep 2026','Source review and indexing','Authored source-review notes through 23 Sep; full-text/CIF source index synchronized 24 Sep.'],
    ['25 Sep 2026','Interface synchronization','Public denominator, provenance, accessibility and interface metadata synchronized without changing scientific authority rows.']
  ];
  for(const [date,title,note]of steps){const x=el('div','ui-version-step');const time=el('time','',date);x.append(time,el('strong','',title),el('small','',note));list.append(x)}
  card.append(list);grid.append(card);
}

function addPhotoDensity(section){
  if(!section||section.querySelector('.ui-photo-density')||!section.querySelector('.photo-facts'))return;
  const title=section.querySelector('.photo-modal-title');if(!title)return;
  const controls=el('div','ui-photo-density');controls.append(el('span','','Measurement display'));
  const compact=el('button','','Compact'),full=el('button','','Full');
  compact.type=full.type='button';
  const set=mode=>{const isCompact=mode==='compact';section.classList.toggle('ui-photo-compact',isCompact);compact.setAttribute('aria-pressed',String(isCompact));full.setAttribute('aria-pressed',String(!isCompact))};
  compact.addEventListener('click',()=>set('compact'));full.addEventListener('click',()=>set('full'));controls.append(compact,full);title.insertAdjacentElement('afterend',controls);
  set(matchMedia('(max-width: 780px)').matches?'compact':'full');
}
function observePhotoDensity(){
  const modal=$('modalBody');if(!modal||modal.dataset.qualityPhotoObserver==='1')return;modal.dataset.qualityPhotoObserver='1';
  const run=()=>modal.querySelectorAll('.photo-modal-section').forEach(addPhotoDensity);
  new MutationObserver(()=>queueMicrotask(run)).observe(modal,{childList:true,subtree:true});run();
}

function enhanceRouteTitle(){
  const base=(location.hash||'#home').slice(1).split('?')[0].split('/')[0]||'home';
  const names={home:'CuHalide Atlas',articles:'Literature — CuHalide Atlas',structures:'Structures — CuHalide Atlas',photophysics:'Photophysics — CuHalide Atlas',polar:'Polar structures — CuHalide Atlas',rag:'CuXplore — CuHalide Atlas',watch:'Literature Watch — CuHalide Atlas',methods:'Methods — CuHalide Atlas',citation:'About data — CuHalide Atlas'};
  if(names[base])document.title=names[base];
}

function installCollectionBusyStates(){
  const configs=[
    {root:$('articles'),ids:['aq','ayf','ayt','ahal','adim','acat','aev','ascope','asort']},
    {root:$('srows'),ids:['sq','shal','sdim','ssg','sconf','spolar']},
    {root:$('prows'),ids:['pq','phal','psg']}
  ];
  for(const cfg of configs){
    if(!cfg.root||cfg.root.dataset.qualityLoading==='1')continue;cfg.root.dataset.qualityLoading='1';
    const set=()=>cfg.root.setAttribute('aria-busy','true');
    for(const id of cfg.ids){const n=$(id);if(n){n.addEventListener(id==='aq'||id==='sq'||id==='pq'?'input':'change',set,{passive:true})}}
    new MutationObserver(()=>{if(!cfg.root.querySelector('.loading'))cfg.root.setAttribute('aria-busy','false')}).observe(cfg.root,{childList:true,subtree:true});
    cfg.root.setAttribute('aria-busy',cfg.root.querySelector('.loading')?'true':'false');
  }
}

function enhanceDashboardA11y(){
  const year=$('yearChart');if(year){year.setAttribute('role','list');year.setAttribute('aria-label','Structured-data publications by year');year.querySelectorAll('.bar').forEach(b=>{b.setAttribute('role','listitem');const label=b.getAttribute('title')||[b.querySelector('span')?.textContent,b.querySelector('b')?.textContent].filter(Boolean).join(': ');if(label)b.setAttribute('aria-label',label)})}
  for(const id of ['halogenDist','dimDist']){const root=$(id);if(!root)continue;root.setAttribute('role','list');root.querySelectorAll('.dist-row').forEach(row=>row.setAttribute('role','listitem'))}
  const sg=$('sgGrid');if(sg){sg.setAttribute('role','list');sg.querySelectorAll('.sg').forEach(x=>x.setAttribute('role','listitem'))}
}

function enhanceCopyAndLabels(){
  const articles=document.querySelector('.view[data-view="articles"] .page-head .eyebrow');if(articles&&articles.textContent!=='Literature corpus')articles.textContent='Literature corpus';
  const hero=document.querySelector('.view[data-view="home"] .actions');if(hero){
    const photo=hero.querySelector('.photo-hero-link');photo?.remove();
  }
  const review=document.querySelector('.ux-review-chip');if(review)review.title='Prepublication review interface · search-engine indexing disabled until formal release.';
}

function init(){
  document.documentElement.dataset.cuhalideQuality='52.2';
  ensureLiteratureCoverage();enhanceKnowledgeBusy();enhanceChatBusy();installCollectionBusyStates();observeStructureRows();enhancePolar();enhanceMotifDenominator();enhanceVersionTimeline();observePhotoDensity();enhanceDashboardA11y();enhanceRouteTitle();enhanceCopyAndLabels();
  const body=new MutationObserver(()=>{enhanceKnowledgeBusy();enhanceChatBusy();installCollectionBusyStates();observeStructureRows();enhancePolar();enhanceMotifDenominator();enhanceVersionTimeline();observePhotoDensity();enhanceDashboardA11y();enhanceCopyAndLabels()});
  body.observe(document.body,{childList:true,subtree:true});window.addEventListener('hashchange',enhanceRouteTitle);
}
ready(init);
})();
