import siteHandler from './site.js';

const UI_VERSION = '48.3';
const CURRENT_REVISION = '2';
const ICON_LINK = '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
const STYLE_LINK = '<link rel="stylesheet" href="/ui-v48-2.css?v=48.2">';
const SCRIPT_LINK = '<script src="/ui-v48-2.js?v=48.2" defer></script>';
const UI_MARKER = '<!-- CUHALIDE_UI_V48_3 -->';
const SCIENCE_MARKER = '<!-- CUHALIDE_SITE_V48_MOTIF_ATLAS -->';

function replaceOnce(body, from, to) {
  return typeof body === 'string' && body.includes(from) ? body.replace(from, to) : body;
}

function enhanceHtml(input) {
  if (typeof input !== 'string' || !input.includes('</head>') || !input.includes('</body>')) return input;
  if (input.includes('ui-v48-2.css') || input.includes('ui-v48-2.js')) throw new Error('UI v48.2 assets already injected');

  let body = input;
  body = replaceOnce(body,
    '<a data-route="structures" href="#structures">Structures</a><a data-route="polar" href="#polar">Polar Set</a>',
    '<a data-route="structures" href="#structures">Structures</a><a href="/motifs">Motif Atlas</a><a data-route="polar" href="#polar">Polar Set</a>');
  body = replaceOnce(body,
    '<div class="actions"><a class="btn primary" href="#structures">Explore structures</a><a class="btn secondary" href="#rag">Ask Smart RAG</a></div>',
    '<div class="actions"><a class="btn primary" href="#structures">Explore structures</a><a class="btn secondary" href="/motifs">Open Motif Atlas</a><a class="btn secondary" href="#rag">Ask Smart RAG</a></div>');

  const replacements = [
    ['<strong>Current Curated rev.1</strong> is separately curated through 2026-08-12 and adds 14 cutoff-period coverage backfills plus 2 post-cutoff articles after primary-evidence QC.', '<strong>Current Curated rev.2</strong> is separately curated through 2026-08-13 and contains 19 cutoff-period coverage backfills plus 5 post-cutoff additions after primary-evidence QC.'],
    ['<h2>Current Curated rev.1</h2>', '<h2>Current Curated rev.2</h2>'],
    ['Current canonical articles · n = 348 · Frozen Release = 332', 'Current canonical articles · n = 356 · Frozen Release = 332'],
    ['Current Core-Included structure rows · n = 859 · Frozen Release = 816', 'Current Core-Included structure rows · n = 873 · Frozen Release = 816'],
    ['Current resolved structure rows · n = 693 · Frozen Release = 650', 'Current resolved structure rows · n = 705 · Frozen Release = 650'],
    ['Current canonical · n=348', 'Current canonical · n=356'],
    ['Current Curated additions · n=16', 'Current Curated additions · n=24'],
    ['All current audit records · n=362', 'All current audit records · n=370'],
    ['Current Core-Included · n=859', 'Current Core-Included · n=873'],
    ['All current rows · n=921', 'All current rows · n=935'],
    ['Current Curated rev.1 additions', 'Current Curated rev.2 additions'],
    ['using a unified 1,283-document BGE-M3/RRF retrieval layer', 'using a unified 1,305-document BGE-M3/RRF retrieval layer'],
    ['Smart RAG 9.13.0 searches', 'Smart RAG 9.14.0 searches'],
    ['together with Current Curated rev.1', 'together with Current Curated rev.2'],
    ['currently rev.1, curated through 2026-08-12', 'currently rev.2, curated through 2026-08-13'],
    ['Current Curated rev.1 through 2026-08-12', 'Current Curated rev.2 through 2026-08-13'],
  ];
  for (const [from, to] of replacements) body = body.split(from).join(to);

  body = body.replace('</head>', `${ICON_LINK}\n${STYLE_LINK}\n</head>`)
    .replace('</body>', `${SCRIPT_LINK}\n${SCIENCE_MARKER}\n${UI_MARKER}\n</body>`);
  return body;
}

export default async function handler(req, res) {
  res.setHeader('X-CuHalide-UI-Version', UI_VERSION);
  res.setHeader('X-CuHalide-Current-Curated-Revision', CURRENT_REVISION);

  const bridge = {
    setHeader: (name, value) => {
      if (String(name).toLowerCase() === 'x-cuhalide-current-curated-revision') {
        return res.setHeader(name, CURRENT_REVISION);
      }
      return res.setHeader(name, value);
    },
    end: body => res.end(enhanceHtml(body)),
  };

  Object.defineProperty(bridge, 'statusCode', {
    get: () => res.statusCode,
    set: value => { res.statusCode = value; },
  });

  return siteHandler(req, bridge);
}
