/* CuHalide Atlas UI 51 portal UX bootstrap. */
(() => {
  'use strict';
  const load=(src,key)=>new Promise((resolve,reject)=>{const existing=document.querySelector(`script[data-cuhalide-layer="${key}"]`);if(existing){if(existing.dataset.loaded==='1')resolve();else existing.addEventListener('load',resolve,{once:true});return}const s=document.createElement('script');s.src=src;s.async=false;s.dataset.cuhalideLayer=key;s.onload=()=>{s.dataset.loaded='1';resolve()};s.onerror=reject;document.head.appendChild(s)});
  load('/ui-ux-core-v1.js?v=51.0','portal-ux-core-v51').catch(e=>console.warn('[ui51 ux]',e));
  load('/organic-components-graphs-11.js?v=1.2.0','organic-components-r9-graphs').then(()=>load('/organic-components-v1.js?v=1.2.0','organic-components-v1.2.0')).catch(e=>console.warn('[organic-components bootstrap]',e));
  load('/ui-structure-photophysics-v1.js?v=1.4.0','structure-photophysics-v1.4.0').catch(e=>console.warn('[structure-photophysics bootstrap]',e));
})();
