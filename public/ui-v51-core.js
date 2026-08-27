/* CuHalide Atlas UI 51 presentation core.
   Presentation density and accessibility only; scientific/query semantics remain backend-authoritative. */
(() => {
  'use strict';
  if(window.__CuHalideUi51Core)return;window.__CuHalideUi51Core=true;
  const mobile=window.matchMedia('(max-width: 780px)'),tablet=window.matchMedia('(max-width: 1120px)');
  const byId=id=>document.getElementById(id),value=id=>(byId(id)?.value||'').trim(),nativeFetch=window.fetch.bind(window);
  const sizes=Object.freeze({articles:()=>tablet.matches?12:18,structures:()=>mobile.matches?12:(tablet.matches?20:30),polar:()=>mobile.matches?12:(tablet.matches?20:30)});
  window.fetch=(input,init)=>{try{const raw=input instanceof Request?input.url:String(input),url=new URL(raw,location.href),sizeFor=sizes[url.searchParams.get('action')];if(url.origin===location.origin&&url.pathname==='/api/public-data'&&sizeFor){url.searchParams.set('page_size',String(sizeFor()));if(input instanceof Request)return nativeFetch(new Request(url.href,input),init);if(input instanceof URL)return nativeFetch(url,init);return nativeFetch(url.href,init)}}catch{}return nativeFetch(input,init)};
  function activeArticleFilters(){let n=0;['aq','ayf','ayt','ahal','adim','acat','aev','ascope'].forEach(id=>{if(value(id))n++});if(value('arel')&&value('arel')!=='Current canonical')n++;if(value('asort')&&value('asort')!=='year_desc')n++;return n}
  function activeStructureFilters(){let n=0;['sq','shal','sdim','ssg','sconf','spolar'].forEach(id=>{if(value(id))n++});if(value('selig')&&value('selig')!=='Core - Included')n++;return n}
  function activePolarFilters(){let n=0;['pq','phal','psg'].forEach(id=>{if(value(id))n++});return n}
  function buildFilterToggle(panel,getCount,resultId,fieldIds){
    if(!panel||panel.dataset.uiFilterReady==='1')return;panel.dataset.uiFilterReady='1';panel.classList.add('ui-filter-panel');
    const toggle=document.createElement('button');toggle.type='button';toggle.className='mobile-filter-toggle';toggle.innerHTML='<span>Filters</span><span class="ui-count">Default view</span><span class="ui-chevron" aria-hidden="true">⌄</span>';toggle.setAttribute('aria-expanded','true');panel.insertBefore(toggle,panel.firstChild);
    const done=document.createElement('button');done.type='button';done.className='mobile-filter-done';done.textContent='View results';panel.appendChild(done);
    const update=()=>{const count=getCount(),node=toggle.querySelector('.ui-count');if(node)node.textContent=count?`${count} active`:'Default view';toggle.setAttribute('aria-expanded',String(!panel.classList.contains('ui-collapsed')))};
    const setMobileState=()=>{panel.classList.toggle('ui-collapsed',mobile.matches);update()};
    toggle.addEventListener('click',()=>{panel.classList.toggle('ui-collapsed');update()});done.addEventListener('click',()=>{panel.classList.add('ui-collapsed');update();byId(resultId)?.scrollIntoView({behavior:'smooth',block:'start'})});
    fieldIds.forEach(id=>{const el=byId(id);el?.addEventListener('input',update);el?.addEventListener('change',update)});['areset','sreset'].forEach(id=>{const el=byId(id);if(el&&panel.contains(el))el.addEventListener('click',()=>setTimeout(update,0))});
    setMobileState();mobile.addEventListener?.('change',setMobileState);
  }
  function enhanceFilters(){buildFilterToggle(document.querySelector('.view[data-view="articles"] .filters'),activeArticleFilters,'acount',['aq','ayf','ayt','ahal','adim','acat','aev','ascope','arel','asort']);buildFilterToggle(byId('selig')?.closest('.panel'),activeStructureFilters,'scount',['sq','shal','sdim','ssg','sconf','spolar','selig']);buildFilterToggle(byId('pq')?.closest('.panel'),activePolarFilters,'pcount',['pq','phal','psg'])}
  function enhanceLongPageNavigation(){if(document.querySelector('.ui-backtop'))return;const b=document.createElement('button');b.type='button';b.className='ui-backtop';b.textContent='↑ Top';b.setAttribute('aria-label','Back to top');document.body.appendChild(b);const sync=()=>b.classList.toggle('show',scrollY>900);addEventListener('scroll',sync,{passive:true});b.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));sync()}
  function enhanceNavigation(){const nav=byId('nav'),menu=byId('menu');if(!nav||!menu)return;document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!menu.contains(e.target)){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus()}})}
  function enhanceYearChart(){const chart=byId('yearChart');if(!chart)return;chart.tabIndex=0;chart.setAttribute('aria-describedby','yearChartHint');let hint=byId('yearChartHint');if(!hint){hint=document.createElement('span');hint.id='yearChartHint';hint.className='sr-only';hint.textContent='The chart is horizontally scrollable on smaller screens and initially shows the most recent years.';chart.parentNode?.insertBefore(hint,chart.nextSibling)}let positioned=false;const recent=()=>{if(!mobile.matches||positioned||chart.scrollWidth<=chart.clientWidth)return;chart.scrollLeft=chart.scrollWidth;positioned=true};new MutationObserver(()=>requestAnimationFrame(recent)).observe(chart,{childList:true});requestAnimationFrame(recent)}
  function markInteractiveTables(){document.querySelectorAll('.view[data-view="structures"] .table-wrap,.view[data-view="polar"] .table-wrap').forEach(w=>{w.setAttribute('role','region');w.setAttribute('aria-label',w.closest('[data-view="polar"]')?'Strict polar structure results':'Structure register results')})}
  function init(){document.documentElement.classList.add('ui-v51-core');enhanceFilters();enhanceLongPageNavigation();enhanceNavigation();enhanceYearChart();markInteractiveTables()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
