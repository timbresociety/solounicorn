import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:900}, reducedMotion:'reduce'});
const errors=[]; page.on('pageerror', e=>errors.push(e.message));
const nav = name => page.locator('.function-rail').getByRole('button',{name:new RegExp(name)});
async function drag(a,b){await a.scrollIntoViewIfNeeded();const from=await a.boundingBox(),to=await b.boundingBox();assert(from&&to);await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});await page.mouse.up();}
try {
 await page.goto(process.env.QA_URL || 'http://localhost:3101');
 await page.getByRole('button',{name:'Bootstrap'}).click();await page.getByRole('button',{name:'Begin Q1'}).click();
 for(let i=0;i<3;i++){await page.locator('.signal-card').focus();await page.keyboard.press('ArrowRight');}
 await nav('Product').click();
 for(let account=0;account<3;account++){
   for(let slot=0;slot<3;slot++)await drag(page.locator('.component-tray button').nth(slot),page.locator('.recipe-slots button').nth(slot));
   await page.getByRole('button',{name:'TEST BUILD',exact:true}).click();await page.getByRole('button',{name:'SHIP VERIFIED',exact:true}).click();
 }
 await page.getByRole('button',{name:'Enter Monetization'}).click();
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'LOCK PRICE'}).click();
 await page.getByRole('button',{name:'Enter Retention'}).click();
 assert.equal(await page.locator('.retention-accounts button').count(),3);
 for(let account=1;account<=3;account++){
   await page.locator('.retention-accounts').getByRole('button',{name:new RegExp(`Account ${account}`)}).click();
   for(let i=0;i<3;i++)await page.locator('.churn-target:not(:disabled)').first().click();
   assert.equal(await page.locator('.churn-target:not(:disabled)').count(),0);
 }
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'artifacts/qa/rescue/retention-multiple-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:900});await nav('Expansion').click();
 for(let account=0;account<3;account++){
   const modules=page.locator('[data-expansion-module]');
   await drag(modules.nth(0),modules.nth(1));await drag(modules.nth(2),modules.nth(3));
   for(const item of ['intelligence','workflow'])await drag(page.locator('.merge-output button').filter({hasText:item.toUpperCase()}),page.locator(`[data-expansion-slot="${item}"]`));
   await page.getByRole('button',{name:'Commit account fit'}).click();
 }
 await page.getByRole('button',{name:'Enter Operations'}).click();
 for(let account=0;account<3;account++){
   assert.equal(await page.locator('.scratch-card.revealed').count(),0);
   assert.equal(await page.locator('.reject-card').count(),1);
   for(let card=0;card<3;card++){
     const target=page.locator('.scratch-card').nth(card),b=await target.boundingBox();
     await page.mouse.move(b.x+12,b.y+20);await page.mouse.down();
     for(let stroke=0;stroke<4;stroke++)await page.mouse.move(b.x+(stroke%2?12:b.width-12),b.y+30+stroke*8,{steps:8});
     await page.mouse.up();
   }
   await drag(page.locator('.reject-card'),page.locator('[data-ops-trash]'));
   await page.getByRole('button',{name:'Resolve obligation'}).click();
 }
 await page.getByRole('button',{name:'Enter Finance'}).click();
 for(let account=0;account<3;account++){await page.getByRole('button',{name:'Inspect SAFE'}).click();await page.getByRole('button',{name:'Pass',exact:true}).click();}
 await page.getByRole('heading',{name:'Capital decision recorded.'}).waitFor();
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'artifacts/qa/rescue/three-customer-complete.png',fullPage:true});
 writeFileSync('artifacts/qa/rescue/multiple-customer-report.json',JSON.stringify({customers:3,retentionInterventions:9,expansionPackages:3,operationsObligations:3,financeDecisions:3,errors,passed:true},null,2));
} catch(error){await page.screenshot({path:'artifacts/qa/rescue/multiple-customer-failure.png',fullPage:true});throw error;}finally{await browser.close();}
