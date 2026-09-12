import {chromium} from 'playwright';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const base=process.env.QA_URL||'http://localhost:3111';
const root='artifacts/qa/product-recovery';mkdirSync(root,{recursive:true});
const fixtures=JSON.parse(readFileSync('artifacts/qa/founder/browser-fixtures.json','utf8'));
const envelope=s=>{const data=JSON.stringify(s);let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data.charCodeAt(i),16777619);return JSON.stringify({version:1,data,checksum:(h>>>0).toString(16)});};
const browser=await chromium.launch({headless:true});
const reports=[];
try{
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:width===1440?1080:width===320?568:844},hasTouch:width!==1440,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const s=JSON.parse(JSON.parse(fixtures.worked).data);s.focus='product';s.leads=[{id:901,segment:2,count:1,expires:s.tick+2000,fit:.85}];s.recipe={id:0,slots:[]};
  await page.goto(base+'/manifest.webmanifest');await page.evaluate(raw=>localStorage.setItem('solounicorn-founder-v1',raw),envelope(s));await page.goto(base);await page.getByRole('button',{name:'Back to work'}).click();
  // Place the last slot first. Saving sparse arrays writes their empty slots as null.
  const slots=page.locator('[data-fit-slot]'),last=slots.last();
  await page.getByRole('button',{name:'Pick up Archive component'}).click();await last.click();
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  await page.reload();
  await page.screenshot({path:`${root}/restored-${width}.png`,fullPage:true});
  assert.deepEqual(errors,[],'restoring an unfinished, out-of-order recipe must not crash');
  await page.getByRole('button',{name:'Back to work'}).click();
  await page.waitForTimeout(300);
  await page.screenshot({path:`${root}/resumed-${width}.png`,fullPage:true});
  assert.deepEqual(errors,[],'resuming an unfinished recipe must not crash');
  assert.equal(await slots.filter({has:page.locator('strong')}).count(),1);
  assert.equal(await page.getByRole('button',{name:'Run tests',exact:true}).isEnabled(),false);
  const mapping={'Capture the request':'Capture','Restrict access':'Permissions','Preserve evidence':'Archive','Surface exceptions':'Insights','Route exceptions':'Workflow','Protect approvals':'Permissions','Alert the owner':'Notifications','Keep the trail':'Archive','Collect the sources':'Capture','Limit access':'Permissions','Expose the risks':'Insights','Archive decisions':'Archive'};
  const steps=await page.locator('.recipe-slot>b').allTextContents();
  for(let i=0;i<steps.length;i++){
   const part=page.getByRole('button',{name:`Pick up ${mapping[steps[i]]} component`});
   await part.click();await slots.nth(i).click();
  }
  await page.getByRole('button',{name:'Run tests',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Verify & ship'}).isEnabled(),true);
  await page.screenshot({path:`${root}/tested-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Verify & ship'}).click();
  await page.getByRole('heading',{name:'Your build is ready.'}).waitFor();
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  const saved=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('solounicorn-founder-v1')).data));
  assert(saved.trials.length>0);assert.equal(saved.leads.length,0);assert.deepEqual(errors,[]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  reports.push({width,restored:true,shipped:true,errors});await context.close();
 }
 writeFileSync(`${root}/report.json`,JSON.stringify(reports,null,2));console.log(reports);
}finally{await browser.close();}
