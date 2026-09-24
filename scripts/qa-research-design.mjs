import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const root=process.cwd(),out=path.join(root,'research-design-qa');
await fs.mkdir(out,{recursive:true});
for(const p of ['research-design.html','research-design.css'])await fs.copyFile(path.join(root,'public',p),path.join(out,p));
await fs.copyFile(path.join(root,'api/ui-r10.js'),path.join(out,'ui-r10.js'));
const allowed=new Map([['/research-design.html','text/html; charset=utf-8'],['/research-design.css','text/css; charset=utf-8'],['/favicon.svg','image/svg+xml']]);
const server=http.createServer(async(req,res)=>{const p=new URL(req.url,'http://localhost').pathname;if(!allowed.has(p)){res.writeHead(404);return res.end('Not found');}try{const body=await fs.readFile(path.join(root,'public',p.slice(1)));res.writeHead(200,{'Content-Type':allowed.get(p),'X-Robots-Tag':'noindex, nofollow, noarchive'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(4178,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const report={release:'ipa-pip-design-20260924-r3',commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),viewports:[],tests:[]};
try{
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage(),requests=[],errors=[];
  page.on('request',r=>requests.push({url:r.url(),method:r.method()}));page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:4178/research-design.html',{waitUntil:'networkidle'});
  assert.equal(response.status(),200);assert.match(response.headers()['x-robots-tag'],/noindex/);
  assert.equal(await page.locator('meta[name="research-design-release"]').getAttribute('content'),report.release);
  assert.equal(await page.locator('#questions details').count(),4);
  assert.deepEqual(await page.locator('.metric b').allTextContents(),['402','41','33']);assert((await page.textContent('body')).includes('6,275 reproducible text blocks'));assert((await page.textContent('body')).includes('114/114 CIF reconciliation'));
  await page.screenshot({path:path.join(out,`${name}-overview.png`),fullPage:false});
  await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
  const size=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(size.scroll<=size.client+1,`${name}: horizontal document overflow`);
  const badAnchors=await page.locator('a[href^="#"]').evaluateAll(nodes=>nodes.filter(n=>!document.getElementById(n.getAttribute('href').slice(1))).map(n=>n.getAttribute('href')));assert.deepEqual(badAnchors,[]);
  const links=await page.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));assert.ok(links.every(x=>!/(?:private_corpus|sandbox:|\/mnt\/|\.pdf(?:$|\?)|\.cif(?:$|\?)|\.xlsx(?:$|\?)|\.zip(?:$|\?))/i.test(x)));
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  await fs.writeFile(path.join(out,`${name}-accessibility.json`),JSON.stringify(a11y,null,2));
  assert.deepEqual(a11y.violations.map(v=>({id:v.id,impact:v.impact})),[]);
  await page.screenshot({path:path.join(out,`${name}-expanded.png`),fullPage:true});
  assert.deepEqual(errors,[]);assert.ok(requests.every(r=>r.method==='GET'&&r.url.startsWith('http://127.0.0.1:4178/')));
  report.viewports.push({name,width,height,size,requests,scriptErrors:errors,accessibilityViolations:a11y.violations.length});
  await context.close();
 }
 report.tests=['HTTP 200','noindex header','release marker','four tasks','distinct corpus counts','valid internal anchors','no private data links','no model/network calls','no page script errors','desktop/mobile overflow','WCAG 2.1 AA automated check'];
 report.status='passed';
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
} catch(error){report.status='failed';report.error=String(error);await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));throw error;}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
