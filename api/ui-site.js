import siteHandler from './site.js';

const UI_VERSION = '48.2';
const STYLE_LINK = '<link rel="stylesheet" href="/ui-v48-2.css?v=48.2">';
const SCRIPT_LINK = '<script src="/ui-v48-2.js?v=48.2" defer></script>';
const UI_MARKER = '<!-- CUHALIDE_UI_V48_2 -->';

const RESPONSIVE_PAGING = [
  [
    "p.page=S.aPage;p.page_size=18;",
    "p.page=S.aPage;p.page_size=window.matchMedia('(max-width:1120px)').matches?12:18;",
  ],
  [
    "p.page=S.sPage;p.page_size=30;",
    "p.page=S.sPage;p.page_size=window.matchMedia('(max-width:780px)').matches?12:(window.matchMedia('(max-width:1120px)').matches?20:30);",
  ],
  [
    "p.page=S.pPage;p.page_size=30;",
    "p.page=S.pPage;p.page_size=window.matchMedia('(max-width:780px)').matches?12:(window.matchMedia('(max-width:1120px)').matches?20:30);",
  ],
];

function enhanceHtml(body) {
  if (typeof body !== 'string' || !body.includes('</head>') || !body.includes('</body>')) return body;
  if (body.includes('ui-v48-2.css') || body.includes('ui-v48-2.js')) throw new Error('UI v48.2 assets already injected');

  let enhanced = body;
  for (const [needle, replacement] of RESPONSIVE_PAGING) {
    if (!enhanced.includes(needle)) throw new Error(`UI v48.2 responsive paging contract missing: ${needle}`);
    enhanced = enhanced.replace(needle, replacement);
  }

  return enhanced
    .replace('</head>', `${STYLE_LINK}\n</head>`)
    .replace('</body>', `${SCRIPT_LINK}\n${UI_MARKER}\n</body>`);
}

export default async function handler(req, res) {
  res.setHeader('X-CuHalide-UI-Version', UI_VERSION);

  const bridge = {
    setHeader: (...args) => res.setHeader(...args),
    end: body => res.end(enhanceHtml(body)),
  };

  Object.defineProperty(bridge, 'statusCode', {
    get: () => res.statusCode,
    set: value => { res.statusCode = value; },
  });

  return siteHandler(req, bridge);
}
