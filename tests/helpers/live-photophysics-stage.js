import {expect} from '@playwright/test';

const ARTICLE_PAGE_SIZE=18;
const PROBE_BATCH_SIZE=6;

function isLivePassA(record){
  return record?.public_state==='pass_a_curated'
    &&record?.verification_stage==='pass_a_curated'
    &&record?.pass_a_complete===true
    &&record?.two_pass_verified===false
    &&Number(record?.counts?.samples)>0;
}

async function readStageHealth(request,base){
  const response=await request.get(`${base}/api/public-data?action=photophysics-health`);
  expect(response.status(),'photophysics health while resolving a live Pass A QA fixture').toBe(200);
  const health=await response.json();
  expect(Number.isInteger(health.pass_a_curated_articles),'Pass A curated count must be an integer').toBe(true);
  expect(Number.isInteger(health.two_pass_verified_articles),'two-pass count must be an integer').toBe(true);
  expect(Number.isInteger(health.verified_no_data_articles),'verified-no-data count must be an integer').toBe(true);
  expect(health.pass_a_curated_articles).toBeGreaterThanOrEqual(0);
  expect(health.two_pass_verified_articles).toBeGreaterThanOrEqual(0);
  expect(health.verified_no_data_articles).toBeGreaterThanOrEqual(0);
  expect(health.pass_a_curated_articles+health.two_pass_verified_articles+health.verified_no_data_articles).toBe(health.article_queue);
  return health;
}

function terminalStage(health){
  expect(health.two_pass_verified_articles+health.verified_no_data_articles,'terminal staged-verification state must account for the full article queue').toBe(health.article_queue);
  return {record:null,health};
}

export async function findLivePassARecord(request,base){
  const health=await readStageHealth(request,base);
  if(health.pass_a_curated_articles===0)return terminalStage(health);

  for(let page=1;;page++){
    const listResponse=await request.get(`${base}/api/public-data?action=articles&page=${page}&page_size=${ARTICLE_PAGE_SIZE}`);
    expect(listResponse.status(),`reviewed article page ${page} while resolving a live Pass A QA fixture`).toBe(200);
    const list=await listResponse.json();
    expect(Array.isArray(list.items),`reviewed article page ${page} must expose a public item list`).toBe(true);

    for(let offset=0;offset<list.items.length;offset+=PROBE_BATCH_SIZE){
      const batch=list.items.slice(offset,offset+PROBE_BATCH_SIZE);
      const probes=await Promise.all(batch.map(async item=>{
        const response=await request.get(`${base}/api/public-data?action=photophysics&id=${encodeURIComponent(item.record_id)}`);
        expect(response.status(),`photophysics probe for reviewed Record ${item.record_id}`).toBe(200);
        return response.json();
      }));
      const hit=probes.find(isLivePassA);
      if(hit)return {record:hit,health};
    }

    if(!list.pagination?.has_next)break;
  }

  const finalHealth=await readStageHealth(request,base);
  if(finalHealth.pass_a_curated_articles===0)return terminalStage(finalHealth);
  throw new Error(`Photophysics health reports ${finalHealth.pass_a_curated_articles} Pass A curated articles, but no public Pass A record with a sample-resolved projection was discoverable across the full reviewed article queue.`);
}
