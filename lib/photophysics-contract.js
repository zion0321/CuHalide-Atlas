export const PHOTOPHYSICS_BASELINES=Object.freeze({
  '1.3.2':Object.freeze({publishable_samples:940,publishable_measurements:2262,publishable_values:2985,analysis_eligible_values:281,publishable_mechanism_claims:477}),
  '1.3.3':Object.freeze({publishable_samples:940,publishable_measurements:2267,publishable_values:2988,analysis_eligible_values:281,publishable_mechanism_claims:477})
});

export const PHOTOPHYSICS_ALLOWED_VERSIONS=Object.freeze(Object.keys(PHOTOPHYSICS_BASELINES));
export const PHOTOPHYSICS_ARTICLE_QUEUE=383;
export const PHOTOPHYSICS_VERIFIED_NO_DATA=54;

export function normalizePhotophysicsVersion(value){
  const version=String(value??'').trim();
  return Object.prototype.hasOwnProperty.call(PHOTOPHYSICS_BASELINES,version)?version:null;
}

export function assertPhotophysicsHealth(health){
  if(!health||typeof health!=='object'||health.ok!==true)throw new Error('Structured Photophysics health is not healthy');
  const version=normalizePhotophysicsVersion(health.version);
  if(!version)throw new Error(`Unsupported Structured Photophysics contract: ${String(health.version??'missing')}`);
  const expected=PHOTOPHYSICS_BASELINES[version];
  if(Number(health.article_queue)!==PHOTOPHYSICS_ARTICLE_QUEUE)throw new Error(`Structured Photophysics article queue mismatch for ${version}`);
  if(Number(health.pass_a_complete_articles)!==PHOTOPHYSICS_ARTICLE_QUEUE||Number(health.pass_a_pending_articles)!==0)throw new Error(`Structured Photophysics Pass A accounting mismatch for ${version}`);
  if(Number(health.verified_no_data_articles)!==PHOTOPHYSICS_VERIFIED_NO_DATA)throw new Error(`Structured Photophysics verified-no-data mismatch for ${version}`);
  for(const[key,value]of Object.entries(expected))if(Number(health[key])!==value)throw new Error(`Structured Photophysics ${key} mismatch for ${version}: expected ${value}, got ${String(health[key])}`);
  const passA=Number(health.pass_a_curated_articles),twoPass=Number(health.two_pass_verified_articles),noData=Number(health.verified_no_data_articles);
  if(!Number.isInteger(passA)||passA<0||!Number.isInteger(twoPass)||twoPass<0||passA+twoPass+noData!==PHOTOPHYSICS_ARTICLE_QUEUE)throw new Error(`Structured Photophysics verification-stage accounting mismatch for ${version}`);
  if(health.publication_policy!=='pass_a_curated_or_two_pass_verified')throw new Error(`Structured Photophysics publication policy mismatch for ${version}`);
  return{version,expected,pass_a_curated_articles:passA,two_pass_verified_articles:twoPass};
}
