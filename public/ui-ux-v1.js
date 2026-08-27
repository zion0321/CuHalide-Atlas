/* CuHalide Atlas UI 51 portal UX bootstrap. */
(() => {
  'use strict';
  const load=(src,key)=>{if(document.querySelector(`script[data-cuhalide-layer="${key}"]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.dataset.cuhalideLayer=key;document.head.appendChild(s)};
  load('/ui-ux-core-v1.js?v=51.0','portal-ux-core-v51');
  load('/organic-components-v1.js?v=1.2.0','organic-components-v1.2.0');
  load('/ui-structure-photophysics-v1.js?v=1.4.0','structure-photophysics-v1.4.0');
})();
