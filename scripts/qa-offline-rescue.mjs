import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext(); const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.storageStats={open:0,put:0};const open=IDBFactory.prototype.open;IDBFactory.prototype.open=function(...args){window.storageStats.open++;return Reflect.apply(open,this,args)};const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){window.storageStats.put++;return Reflect.apply(put,this,args)};});
try{
 await page.goto(process.env.QA_URL || 'http://localhost:3102');
 await page.getByRole('button',{name:'Bootstrap'}).click();await page.getByRole('button',{name:'Begin Q1'}).click();
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await page.waitForTimeout(11000);
 const stats=await page.evaluate(()=>window.storageStats);
 assert.equal(stats.open,1);assert.equal(stats.put,1);
 await context.setOffline(true);await page.reload();
 await page.getByRole('heading',{name:'The company can wait.'}).waitFor({timeout:15000});
 assert.deepEqual(errors,[]);
 writeFileSync('artifacts/qa/rescue/offline-report.json',JSON.stringify({stats,errors,offlineRestored:true},null,2));
}finally{await browser.close()}
