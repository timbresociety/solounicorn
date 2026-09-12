import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const output = 'artifacts/qa/rescue';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => { window.longTasks = []; if (PerformanceObserver.supportedEntryTypes.includes('longtask')) new PerformanceObserver(list => window.longTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: 'longtask', buffered: true }); });
const shot = name => page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
const button = name => page.getByRole('button', { name, exact: false }).first();
async function drag(from, to) {
  await from.scrollIntoViewIfNeeded();
  const a = await from.boundingBox(), b = await to.boundingBox();
  assert(a && b);
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 15 });
  await page.mouse.up();
}
try {
  await page.goto(process.env.QA_URL || 'http://localhost:3101');
  await button('Bootstrap').waitFor();
  await shot('setup-desktop');
  await button('Bootstrap').click(); await button('Begin Q1').click();
  await shot('work-desktop');
  const card = page.locator('.signal-card');
  await card.waitFor();
  const initial = await card.getAttribute('aria-label');
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, { steps: 6 });
  await card.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' }); await page.mouse.up();
  assert.equal(await card.getAttribute('aria-label'), initial, 'Cancelled swipe committed');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2, { steps: 12 }); await page.mouse.up();
  await page.waitForFunction(old => document.querySelector('.signal-card')?.getAttribute('aria-label') !== old, initial);
  assert.equal(await card.evaluate(e => getComputedStyle(e).transform), 'matrix(1, 0, 0, 1, 0, 0)', 'Next card did not reset');
  await page.locator('.function-rail').getByRole('button', { name: /Product/ }).click();
  for (const [component, slot] of [['INBOX','intake'], ['ROUTING','logic'], ['CONTEXT','memory']]) {
    await drag(page.locator('.component-tray').getByRole('button', { name: new RegExp(component) }), page.locator(`[data-slot="${slot}"]`));
  }
  assert.equal(await page.locator('.recipe-slots .filled').count(), 3);
  await button('TEST BUILD').click(); await button('SHIP VERIFIED').click();
  await button('Enter Monetization').click(); await shot('pricing-desktop');
  await button('LOCK PRICE').click(); await button('Enter Retention').click();
  const movingThreat = await page.locator('.churn-target').first().boundingBox();
  assert(movingThreat);
  await page.mouse.click(movingThreat.x + movingThreat.width / 2, movingThreat.y + movingThreat.height / 2);
  await button('Enter Expansion').click();
  const modules = page.locator('[data-expansion-module]');
  const ids = await modules.evaluateAll(nodes => nodes.map(e => e.dataset.expansionModule));
  writeFileSync(`${output}/modules.json`, JSON.stringify(ids));
  await drag(modules.nth(0), modules.nth(1));
  await drag(modules.nth(2), modules.nth(3));
  await drag(page.locator('.merge-output button').filter({ hasText: 'INTELLIGENCE' }), page.locator('[data-expansion-slot="intelligence"]'));
  await drag(page.locator('.merge-output button').filter({ hasText: 'WORKFLOW' }), page.locator('[data-expansion-slot="workflow"]'));
  await button('Commit account fit').click(); await button('Enter Operations').click();
  const scratchCards = page.locator('.scratch-card');
  for (let i = 0; i < await scratchCards.count(); i++) {
    const el = scratchCards.nth(i); const b = await el.boundingBox();
    await page.mouse.move(b.x + 10, b.y + 20); await page.mouse.down();
    for (let j = 0; j < 4; j++) await page.mouse.move(b.x + (j % 2 ? 15 : b.width - 15), b.y + 30 + j * 8, { steps: 7 });
    await page.mouse.up();
  }
  await drag(page.locator('.reject-card'), page.locator('[data-ops-trash]'));
  await button('Resolve obligation').click(); await button('Enter Finance').click();
  await button('Inspect SAFE').click(); await button('Pass').click();
  await page.getByRole('heading', { name: 'Capital decision recorded.' }).waitFor();
  await button('Borrow runway cash').click();
  await button('Repay principal').click();
  await button('Borrow runway cash').waitFor();
  await button('Pause').click();
  await page.getByRole('heading', { name: 'The company can wait.' }).waitFor();
  await page.waitForTimeout(5500);
  await page.reload(); await page.getByRole('heading', { name: 'The company can wait.' }).waitFor();
  await button('Resume company').click();
  await page.locator('.function-rail .command-nav').click();
  await page.locator('.company-chapter').getByRole('button', { name: 'Fast forward to review' }).click();
  await page.getByRole('heading', { name: /promise held/ }).waitFor({ timeout: 30000 });
  await shot('quarter-desktop');
  writeFileSync(`${output}/quarter-buttons.json`, JSON.stringify(await page.getByRole('button').allTextContents()));
  for (const [width, height] of [[390,844],[320,568],[844,390],[768,1024],[1440,900]]) {
    await page.setViewportSize({width,height});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width} overflow`);
    await shot(`quarter-${width}`);
  }
  await button('Inspect what changed').click();
  await button('No material change').click();
  await button('Hold current posture').click();
  await page.getByRole('tab', {name:'MARKETING', exact:true}).click();
  const skill = page.locator('.skill-node').first();
  await skill.getByRole('button').click();
  assert.match(await skill.innerText(), /INSTALLED/);
  await button('Begin Q2').click(); await button('Start Q2 in Marketing').click();
  await page.locator('.function-rail .command-nav').click();
  for (const [width, height] of [[390,844],[320,568],[844,390],[768,1024],[1440,900]]) {
    await page.setViewportSize({width,height});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width} home overflow`);
    await shot(`company-${width}`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.mobile-dock').getByRole('button',{name:/MKT/}).click();
  await card.waitFor();
  await shot('marketing-mobile');
  // Touch-compatible pointer drag on the recomposed mobile workspace.
  const mobileBox = await card.boundingBox();
  await page.mouse.move(mobileBox.x+mobileBox.width/2,mobileBox.y+mobileBox.height/2);
  await page.mouse.down(); await page.mouse.move(mobileBox.x+mobileBox.width/2+100,mobileBox.y+mobileBox.height/2,{steps:12}); await page.mouse.up();
  await page.locator('.mobile-dock').getByRole('button',{name:/PRD/}).click();
  await page.locator('.mobile-dock button.active').filter({hasText:'PRD'}).waitFor();
  await shot('product-mobile');
  for (const [component, slot] of [['DATA','source'],['RETRIEVAL','engine'],['EVAL','proof']]) {
    await drag(page.locator('.component-tray').getByRole('button',{name:new RegExp(`^${component}(?:\\s|$)`)}),page.locator(`[data-slot="${slot}"]`));
  }
  await button('TEST BUILD').click(); await button('SHIP VERIFIED').click();
  await button('Enter Monetization').click(); await button('LOCK PRICE').click();
  await page.locator('.mobile-dock').getByRole('button',{name:/MKT/}).click();
  // Ignore the remaining signals and prove the empty queue still has an exit.
  while(await card.count()) { await card.focus(); await page.keyboard.press('ArrowLeft'); }
  await page.getByRole('heading',{name:'Every current lead has a decision.'}).waitFor();
  assert(await page.locator('.work-routing button').isEnabled());
  await shot('empty-marketing-mobile');
  const stats = await page.evaluate(() => ({ longTasks: window.longTasks, width: innerWidth }));
  writeFileSync(`${output}/report.json`, JSON.stringify({ errors, stats, passed: true }, null, 2));
  assert.deepEqual(errors, []);
} catch (error) {
  await shot('failure');
  writeFileSync(`${output}/failure.txt`, String(error) + '\n' + await page.locator('body').innerText());
  throw error;
} finally { await browser.close(); }
