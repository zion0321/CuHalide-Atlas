# CuXplore source coverage and application identity

CuXplore is the interface and research-assistant name. CuHalide Atlas remains the dataset identity, with stable CUH identifiers, DOI mapping, citation metadata and scientific revision 10. The existing website URL is retained. No dedicated iPA-PIP section is introduced.

## Actual state at implementation

- Catalog: 410 distinct DOIs; 372 included curated articles and 38 additional/boundary references.
- Scientific data: 901 Core-Included structures; 1,322 curated semantic documents and embeddings.
- New private import: 75 source files; 48 native MAIN files, 21 native SI files (20 articles), and six scan/sparse MAIN files. The six scans were not OCRed or presented as searchable native text.
- Import batch: 4cf43128c6b77746513557c52efa2a4ee118e596242cd9637879f1d294bcc88d; 1,450 stored passages, ten flagged reference-only.
- Combined DOI coverage after deduplication with existing private sources: MAIN 48; SI 46; either 78; 1,984 stored MAIN/SI passages. These article counts overlap.
- Library declarations: 399 MAIN, 326 SI, 311 CIF articles registered. Registration is not extraction and does not establish physical availability in every storage mirror.
- Eight catalog articles have separately parsed CIF text. CIF is not counted as MAIN/SI prose.
- 41 authored source-review notes. Native-text import does not change scientific field-validation status.

The source inventory declarations were reconciled against the supplied 2026-09-18 workbook. Its SHA-256 is 5710f72abc3c8f12d7b01a5c6a822290cd7a5be3c52b99887dbebbbff5b9d629. The 383 active record/DOI mappings were compared before the import; no mapping was reassigned. The six scanned articles remain explicitly unindexed. Counts on the interface are live, not hard-coded percentages.

## Retrieval and privacy

The public knowledge endpoint supports bounded catalog, curated, reviewed, additional, and native-text scopes. It combines weighted article/review metadata with separately indexed MAIN/SI matches and returns source-role/page locations without raw publication passages. Exact DOI URLs remain exact queries. Curated structure identity and sample-resolved photophysics retain their original review gates.

The existing assistant can return source-reviewed summaries and original-text locations alongside curated article/structure retrieval. This update does not claim that every paper has been fully parsed, that all new passages have semantic embeddings, or that citation retrieval alone is an independently validated generative answer. No new generative model is called by source browsing, source selection, context preparation, or the QA suite.

Private import tables, passages and the optional service-role-only context RPC are not anonymously accessible. The optional private context RPC is not a newly deployed model-generation workflow. Original PDFs, SI/CIF files, credentials and private source excerpts are not in this repository.

## Interface behavior

The original Overview shows processing coverage separately from scientific dataset coverage. Literature defaults to the connected catalog and provides a native MAIN/SI filter. Every source card and article/structure detail displays independently maintained MAIN, SI, CIF, structure and photophysics states. The retrieval context export preserves these states and the original-text location, rather than flattening them into a single completeness or confidence score.

Existing curated-data filters, scientific counts, historical snapshot and production gates are preserved. The CuHalide Atlas citation is not renamed retroactively.
