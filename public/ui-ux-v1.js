/* CuHalide Atlas portal UX bootstrap. */
(() => {
  'use strict';
  const load=(src,key)=>{if(document.querySelector(`script[data-cuhalide-layer="${key}"]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.dataset.cuhalideLayer=key;document.head.appendChild(s)};
  load('/ui-ux-core-v1.js','portal-ux-core-v1');
  load('/organic-components-v1.js','organic-components-v1');
  load('/ui-structure-photophysics-v1.js','structure-photophysics-v1');
})();
