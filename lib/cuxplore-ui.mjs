export function cuxploreIdentity(html){
 if(typeof html!=='string'||!html.includes('</html>'))return html;
 return html.replaceAll('<strong>CuHalide Atlas</strong>','<strong>CuXplore</strong>').replace(/(>)(CuHalide Atlas)(<\/a>)/g,'$1CuXplore$3').replace(/(<title>[^<]*)(?: \u2014 | - )CuHalide Atlas(<\/title>)/g,'$1 | CuXplore$2');
}
export function cuxploreRecord(html){
 let s=cuxploreIdentity(html);if(typeof s!=='string'||!s.includes('</html>')||s.includes('CUXPLORE_RECORD_V1'))return s;
 s=s.replace('</head>','<link rel="stylesheet" href="/ui-cuxplore-v1.css"></head>');
 s=s.replace('</main>','<section id="cuxploreStandalone" class="cx-standalone" aria-live="polite"></section></main>');
 return s.replace('</body>','<!-- CUXPLORE_RECORD_V1 --><script src="/ui-cuxplore-v1.js" defer></script></body>');
}
// Application naming is separate from the immutable CuHalide Atlas dataset identity.
export function cuxploreUI(html){
 if(typeof html!=='string'||html.includes('CUXPLORE_INTERFACE_V1'))return html;
 let s=cuxploreIdentity(html).replace('<title>CuHalide Atlas</title>','<title>CuXplore | Copper(I) halide knowledge</title>');
 s=s.replaceAll('<strong>CuHalide Atlas</strong>','<strong>CuXplore</strong>');
 s=s.replaceAll('content="CuHalide Atlas"','content="CuXplore | Copper(I) halide knowledge"');
 s=s.replace('"@type":"WebSite","name":"CuHalide Atlas"','"@type":"WebSite","name":"CuXplore","alternateName":"CuHalide Atlas"');
 s=s.replaceAll('CuHalide Research Assistant','CuXplore Research Assistant');
 s=s.replace("name==='home'?'CuHalide Atlas':", "name==='home'?'CuXplore':").replace('} \u2014 CuHalide Atlas`','} \u2014 CuXplore`');
 s=s.replace('Cu(I) halide knowledge base</small>','Literature, structures and photophysics</small>');
 s=s.replace('<option value="curated">Curated collection</option><option value="all">All indexed literature</option>','<option value="all">All indexed literature</option><option value="curated">Curated collection</option>');
 s=s.replaceAll('<option value="reviewed">Source-reviewed literature</option>','<option value="reviewed">Source-reviewed literature</option><option value="text">Indexed MAIN / SI text</option>');
 s=s.replace('Searches the curated literature and Core-Included structure register.','Search the connected literature catalog; curated structures and measurements retain their own evidence checks.');
 s=s.replace('<p class="eyebrow">Curated literature</p><h1>Explore articles</h1><p>Search the latest primary-evidence-reviewed literature. Archived snapshots are retained for reproducibility rather than exposed as a routine browsing mode.</p>','<p class="eyebrow">Connected literature</p><h1>Explore articles</h1><p>Search the complete indexed catalog, inspect MAIN / SI / CIF processing status, and follow verified links to structures and sample-resolved photophysics.</p>');
 s=s.replace('Ranked references, authored source notes and linked structures will appear here. Scores are not confidence estimates.','Ranked sources, original-text match locations and linked structures appear here. Text extraction and scientific validation are shown separately.');
 s=s.replace('<p id="knowledgeDates" class="fine"></p>','<p id="knowledgeDates" class="fine"></p><div id="cuxploreProcessingCoverage" aria-live="polite"></div>');
 s=s.replace('</head>','<meta name="cuxplore-interface-version" content="1.0.0"><link rel="stylesheet" href="/ui-cuxplore-v1.css"></head>');
 s=s.replace('</body>','<!-- CUXPLORE_INTERFACE_V1 --><script src="/ui-cuxplore-v1.js" defer></script></body>');
 return s;
}
