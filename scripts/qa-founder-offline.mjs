import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.founderWrites=0;const set=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='solounicorn-founder-v1')window.founderWrites++;return Reflect.apply(set,this,[key,value]);};});
try{
 await page.goto(process.env.QA_URL||'http://localhost:3110');await page.getByRole('button',{name:'Open the garage'}).click();
 await page.evaluate(()=>Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Service worker failed to install')),20000))]));await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
 const firstWrites=await page.evaluate(()=>window.founderWrites);await page.waitForTimeout(11000);assert.equal(await page.evaluate(()=>window.founderWrites),firstWrites);
 const before=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('solounicorn-founder-v1')).data));
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Back to work'}).waitFor();
 const after=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('solounicorn-founder-v1')).data));assert.equal(after.tick,before.tick);assert.equal(after.cash,before.cash);
 await page.screenshot({path:'artifacts/qa/founder/offline-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 // Corrupt checkpoints must remain untouched until a deliberate fresh start.
 await context.setOffline(false);await page.goto((process.env.QA_URL||'http://localhost:3110')+'/manifest.webmanifest');await page.evaluate(()=>localStorage.setItem('solounicorn-founder-v1','corrupted-for-qa'));await page.goto(process.env.QA_URL||'http://localhost:3110');await page.getByText('The saved checkpoint could not be verified.',{exact:false}).waitFor();await page.waitForTimeout(5500);assert.equal(await page.evaluate(()=>localStorage.getItem('solounicorn-founder-v1')),'corrupted-for-qa');
 writeFileSync('artifacts/qa/founder/offline-report.json',JSON.stringify({firstSessionOffline:true,pausedWritesStable:true,corruptCheckpointPreserved:true,errors},null,2));console.log('First-session offline, paused write stability and corrupt checkpoint recovery passed.');
}finally{await browser.close();}
