/* CuHalide Atlas UI 51 portal UX bootstrap. */
(() => {
  'use strict';
  const load=(src,key)=>new Promise((resolve,reject)=>{const existing=document.querySelector(`script[data-cuhalide-layer="${key}"]`);if(existing){if(existing.dataset.loaded==='1')resolve();else existing.addEventListener('load',resolve,{once:true});return}const s=document.createElement('script');s.src=src;s.async=false;s.dataset.cuhalideLayer=key;s.onload=()=>{s.dataset.loaded='1';resolve()};s.onerror=reject;document.head.appendChild(s)});
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):queueMicrotask(fn);
  const text=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value};
  const pageCopy=(view,value)=>text(document.querySelector(`.view[data-view="${view}"] .page-head p:not(.eyebrow)`),value);

  function polishStartGrid(){
    const section=document.querySelector('.ux-start');if(!section)return;
    text(section.querySelector('.ux-start-head h2'),'Start with the type of evidence you need.');
    text(section.querySelector('.ux-start-head > p'),'Literature, structures and sample-resolved measurements stay separate so comparisons remain scientifically valid.');
    const cards=[...section.querySelectorAll('.ux-start-card')];
    const structure=cards.find(x=>x.getAttribute('href')==='#structures');
    if(structure){text(structure.querySelector('strong'),'Inspect crystallography');text(structure.querySelector('small'),'Compare formula, phase, dimensionality and space group with source-linked records.');}
    const photo=cards.find(x=>x.getAttribute('href')==='#photophysics');
    if(photo){text(photo.querySelector('strong'),'Compare measurements');text(photo.querySelector('small'),'Compare crystal, powder, composite, film and device measurements without mixing sample states.');}
    const assistant=cards.find(x=>x.getAttribute('href')==='#rag');
    if(assistant){text(assistant.querySelector('strong'),'Ask across the Atlas');text(assistant.querySelector('small'),'Get conversational answers with source-linked retrieval when Atlas evidence is needed.');}
  }

  function polishStaticCopy(){
    const chip=document.querySelector('.ux-review-chip');if(chip)chip.title='Review version · not indexed or formally released yet.';
    text(document.querySelector('.ux-hero-search-hint'),'Searches curated literature and the curated structure register.');
    polishStartGrid();
    const growth=document.querySelector('.view[data-view="home"] #yearChart')?.closest('.panel');
    if(growth)text(growth.querySelector('h2'),'Curated publications by year');
    const dim=document.querySelector('.view[data-view="home"] #dimDist')?.closest('.panel');
    if(dim)text(dim.querySelector('.denom'),'Curated structure records · n = 890');
    text(document.querySelector('.ux-search-footer'),'Search covers curated literature and structures; source publications remain linked by DOI.');

    pageCopy('articles','Search curated articles by title, DOI, year, halogen or category, then open a record for related structures and reported measurements.');
    pageCopy('structures','Browse curated structure and phase determinations. Search by formula, phase, dimensionality or space group; local motifs are available in Motifs, and photophysics is linked only where the evidence supports it.');
    pageCopy('rag','Ask naturally about Cu(I) halide materials, structures, literature or photophysics. When a question depends on Atlas data, the assistant retrieves source-linked evidence automatically.');
    pageCopy('methods','See how the Atlas separates article, structure, motif and measurement evidence, and how unresolved or conflicting source information is handled.');

    text(document.querySelector('.view[data-view="rag"] .page-head .eyebrow'),'Evidence-linked scientific assistant');
    text(document.getElementById('sreset'),'Reset filters');

    const polar=document.querySelector('.view[data-view="polar"] .polar-intro p:not(.eyebrow)');
    const polarCopy='This subset includes curated structures in polar point groups whose space group and one-to-one structure mapping are both supported at the highest evidence level. <strong>Polar does not mean ferroelectric.</strong>';
    if(polar&&polar.innerHTML!==polarCopy)polar.innerHTML=polarCopy;

    const method=[...document.querySelectorAll('.view[data-view="methods"] .method')].find(x=>x.querySelector('.no')?.textContent.trim()==='06');
    if(method){text(method.querySelector('h2'),'Keep evidence at the right level');text(method.querySelector('p'),'Article-level labels support literature retrieval and are not substitutes for structure-level dimensionality. Photophysics is linked to a specific structure only when the source evidence establishes that connection.');}
  }

  function polishArticleCards(){
    document.querySelectorAll('.ux-article-footer small').forEach(n=>text(n,'Open the curated record for related structures and reported measurements.'));
  }

  function polishModal(){
    const body=document.getElementById('modalBody');if(!body)return;
    body.querySelectorAll('h3').forEach(h=>{
      const label=h.textContent.trim();
      if(label==='Article-grain photophysics')text(h,'Reported photophysics');
      if(label==='Structure-grain motif boundary')text(h,'Local Cu–X motif');
      if(label==='Photophysics evidence-grain boundary')text(h,'Linked photophysics');
    });
    body.querySelectorAll('p.fine').forEach(p=>{if(p.textContent.trim().startsWith('Exact publisher abstracts,'))text(p,'Publisher abstracts and primary source files are not redistributed; use the DOI link for the original publication.');});
  }

  function installPolishObservers(){
    polishStaticCopy();polishArticleCards();polishModal();
    const articles=document.getElementById('articles');if(articles)new MutationObserver(()=>queueMicrotask(polishArticleCards)).observe(articles,{childList:true,subtree:true});
    const modal=document.getElementById('modalBody');if(modal)new MutationObserver(()=>queueMicrotask(polishModal)).observe(modal,{childList:true,subtree:true});
  }

  load('/ui-ux-core-v1.js?v=51.0','portal-ux-core-v51').then(()=>ready(installPolishObservers)).catch(e=>console.warn('[ui51 ux]',e));
  load('/organic-components-graphs-11.js?v=1.2.0','organic-components-r9-graphs').then(()=>load('/organic-components-v1.js?v=1.2.0','organic-components-v1.2.0')).catch(e=>console.warn('[organic-components bootstrap]',e));
  load('/ui-structure-photophysics-v1.js?v=1.4.0','structure-photophysics-v1.4.0').catch(e=>console.warn('[structure-photophysics bootstrap]',e));
})();