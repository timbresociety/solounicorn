import {productBrief} from '../../src/game/founder/toys';
import { describe, expect, it } from 'vitest';
import { advance, agentCount, arr, command, createCompany, luckDistribution, metrics, priceTarget, random, rebaseCompany, replayCompany, signal, validateCompany } from '../../src/game/founder/engine';
import { AXES, P, skillRank } from '../../src/game/founder/profile';
import { decodeSave, encodeSave } from '../../src/game/founder/save';
import type { Company } from '../../src/game/founder/model';
function start(seed=77){return command(createCompany(seed),{type:'start'});}
function customer(s:Company):Company{
  s=command(s,{type:'channel',channel:2});
  for(let n=0;n<100&&!s.accounts.some(a=>a.active);n++){
    s=command(s,{type:'focus',work:'demand'});
    if(signal(s).quality==='noise')s=command(s,{type:'demand',pursue:false,signal:s.signal});
    s=command(s,{type:'demand',pursue:true,signal:s.signal});
    if(s.leads.length){const lead=s.leads[0];s=command(s,{type:'focus',work:'product'});productBrief(s,lead).parts.forEach((part,slot)=>{s=command(s,{type:'part',job:lead.id,part,slot});});s=command(s,{type:'test-build',job:lead.id});s=command(s,{type:'ship',job:lead.id,early:false});}
    if(s.trials.length){s=command(s,{type:'focus',work:'monetisation'});s=command(s,{type:'price',job:s.trials[0].id,plan:'fair',timing:priceTarget(s).center});}
    s=advance(s,60);
  }
  return s;
}
describe('founder company candidate',()=>{
  it('keeps agent count tied to Automate ranks, not Scale capacity or total skill ranks',()=>{
    let s=start();
    s=command(s,{type:'buy',work:'monetisation',axis:'automate',rank:1});
    s=command(s,{type:'buy',work:'monetisation',axis:'scale',rank:1});
    expect(agentCount(s,'monetisation')).toBe(1);
    expect(agentCount(s,'demand')).toBe(0);
    expect(P.units_by_scale_rank[s.ranks.monetisation.scale]).toBe(2);
  });

  it('makes real subscriptions from semantic work, bills in arrears, reconciles collections and saves',()=>{
    let s=customer(start());expect(arr(s)).toBeGreaterThan(0);expect(s.lifetimeCollected).toBe(0);expect(s.lifetimeEarned).toBeGreaterThan(0);validateCompany(s);
    s=advance(s,1200);expect(s.lifetimeCollected).toBeGreaterThan(0);validateCompany(s);expect(decodeSave(encodeSave(s))).toEqual(s);
    expect(()=>decodeSave(encodeSave(s).replace('founder-candidate','tampered'))).toThrow();
  });
  it('replays exactly and time rebatching does not reroll work',()=>{
    const one=customer(start(19)),two=customer(start(19));expect(one).toEqual(two);expect(replayCompany(one)).toEqual(one);
    expect(advance(one,300)).toEqual(Array.from({length:300}).reduce<Company>(s=>advance(s),two));
    const paused=command(one,{type:'pause'});expect(advance(paused,1000)).toBe(paused);const rejected=command(paused,{type:'demand',pursue:true,signal:paused.signal});expect(rejected.phase).toBe('paused');expect(rejected.cash).toBe(paused.cash);expect(rejected.actionResults.at(-1)?.reason).toBe('phase-not-allowed');
  });
  it('agents consume real queues, unlock after deployment, cost cash, and accumulate rot',()=>{
    let s=start();s=command(s,{type:'buy',work:'demand',axis:'automate',rank:1});s=command(s,{type:'buy',work:'product',axis:'automate',rank:1});
    s=command(s,{type:'focus',work:'skills'});const initial=s.cash;s=advance(s,49);expect(s.completed.demand).toBe(0);s=advance(s,500);expect(s.completed.demand).toBeGreaterThan(0);expect(s.completed.product).toBeGreaterThan(0);expect(s.rot.product).toBeGreaterThan(0);expect(s.cash).toBeLessThan(initial);validateCompany(s);
    const n=s.completed.product;s=command(s,{type:'automation',work:'product'});s=advance(s,100);expect(s.completed.product).toBe(n);
  });
  it('cannot create output with invalid/stale/duplicate toy commits',()=>{
    let s=start();const cash=s.cash;s=command(s,{type:'price',job:99,plan:'fair'});s=command(s,{type:'expand',account:1});s=command(s,{type:'repair',target:'rot'});expect(s.cash).toBe(cash);expect(arr(s)).toBe(0);
    s=customer(s);const customerCount=s.accounts.length;s=command(s,{type:'price',job:999,plan:'fair'});expect(s.accounts.length).toBe(customerCount);
  });
  it('settles into a frozen quarter draft and never duplicates a selected upgrade',()=>{
    let s=advance(start(),1800);expect(s.quarter).toBe(2);expect(s.phase).toBe('quarter-draft');expect(s.reports).toHaveLength(1);const id=s.reports[0].choices[0];s=command(s,{type:'draft',quarter:1,id});expect(s.phase).toBe('paused');const cash=s.cash;s=command(s,{type:'draft',quarter:1,id});expect(s.cash).toBe(cash);expect(s.actionResults.at(-1)?.reason).toBe('phase-not-allowed');expect(s.inventory.relics.includes(id)||s.inventory.consumables[id]===1).toBe(true);
  });
  it('settles simultaneous receipts before bills, then freezes a report with actual score factors',()=>{
    let s=start(77);s.tick=1799;s.cash=100;s.expenseAccrued=1000;s.accounts=[{id:9,origin:9,segment:0,count:1,price:4000,basePrice:4000,fit:.9,health:90,defects:0,born:0,caredUntil:0,addons:0,threat:0,earned:0,remainder:0,active:true}];s.invoices=[{id:10,account:9,cents:50000,due:1800,attempts:0}];
    s=advance(s,1);expect(s.phase).toBe('quarter-draft');expect(s.cash).toBeGreaterThan(100);const report=s.reports[0];expect(report.collected).toBe(50000);expect(report.score.valuation).toBe(metrics(s).valuation);expect(report.cash-report.openingCash).toBe(s.cash-report.openingCash);
  });
  it('fails a due boundary before victory or a reward can exist',()=>{
    const s=start(78);s.tick=1799;s.cash=1;s.expenseAccrued=100000;s.accounts=[{id:11,origin:11,segment:2,count:100000,price:80000,basePrice:80000,fit:1,health:100,defects:0,born:0,caredUntil:999999,addons:0,threat:0,earned:0,remainder:0,active:true}];
    const failed=advance(s,1);expect(metrics(failed).valuation).toBeGreaterThanOrEqual(P.win_valuation_cents);expect(failed.phase).toBe('failure');expect(failed.reports).toHaveLength(0);expect(failed.pendingDraftQuarter).toBeNull();
  });
  it('persists draft offers and a consumable selection once across reloads without advancing time',()=>{
    let s=advance(start(79),1800);s.reports[0].choices=['consumable:customer-firebreak'];s=rebaseCompany(s);const offers=[...s.reports[0].choices],tick=s.tick;const restored=decodeSave(encodeSave(s));expect(restored.reports[0].choices).toEqual(offers);expect(advance(restored,999)).toBe(restored);
    const id='consumable:customer-firebreak';s=command(restored,{type:'draft',quarter:1,id});expect(s.inventory.consumables[id]).toBe(1);const saved=decodeSave(encodeSave(s));const duplicate=command(saved,{type:'draft',quarter:1,id});expect(duplicate.inventory.consumables[id]).toBe(1);expect(duplicate.tick).toBe(tick);expect(command(saved,{type:'continue'}).phase).toBe('active');
  });
  it('uses a drafted firebreak once to protect a live threat without creating money or ARR',()=>{
    let s=advance(start(80),1800);s.reports[0].choices=['consumable:customer-firebreak'];s=rebaseCompany(s);s=command(s,{type:'draft',quarter:1,id:'consumable:customer-firebreak'});s=command(s,{type:'continue'});s.accounts=[{id:12,origin:12,segment:0,count:1,price:4000,basePrice:4000,fit:.9,health:90,defects:0,born:0,caredUntil:0,addons:0,threat:s.tick+20,earned:0,remainder:0,active:true}];const cash=s.cash,before=arr(s);
    s=command(s,{type:'consume',id:'consumable:customer-firebreak',account:12});expect(s.inventory.consumables['consumable:customer-firebreak']).toBe(0);expect(s.accounts[0].threat).toBe(0);expect(s.cash).toBe(cash);expect(arr(s)).toBe(before);const again=command(s,{type:'consume',id:'consumable:customer-firebreak',account:12});expect(again.cash).toBe(cash);expect(again.actionResults.at(-1)?.reason).toBe('stale-job');
  });
  it('fails on unpaid bills, and an accepted VC miss is terminal without creating ARR',()=>{
    const broke=start();broke.cash=1;expect(advance(broke,600).failure).toContain('operating bill');
    let s=customer(start(16));s.accounts[0].count=20; // isolated funding eligibility fixture
    const before=arr(s);s=command(s,{type:'raise'});expect(s.vc).not.toBeNull();expect(arr(s)).toBe(before);const original=s.cash;s=command(s,{type:'raise'});expect(s.cash).toBe(original);s.accounts.forEach(a=>a.caredUntil=100000);const due=s.vc!.due;while(s.phase!=='failure'&&s.tick<due){s=advance(s,due-s.tick);if(s.phase==='quarter-draft')s=command(s,{type:'draft-skip',quarter:s.pendingDraftQuarter!});if(s.phase==='paused')s=command(s,{type:'continue'});}expect(s.phase).toBe('failure');expect(s.failure).toContain('VC mandate missed');
  });
  it('expired customer problems destroy attributable ARR while completed finite interventions preserve it',()=>{
    let s=customer(start(6));const a=s.accounts.find(a=>a.active)!;a.threat=s.tick+10;a.problem={id:991,kind:'trust',label:'Trust is eroding',detail:'A promise needs a response.',openedAt:s.tick,deadline:s.tick+10,severity:3,workRequired:4,workCompleted:0,exposedArr:arr(s)};const before=arr(s);s=advance(s,10);expect(arr(s)).toBeLessThan(before);expect(s.log.at(-1)?.text).toContain('Trust is eroding');
    s=customer(start(6));const saved=s.accounts.find(a=>a.active)!;saved.threat=s.tick+30;saved.problem={id:992,kind:'handoff',label:'Approval handoff stalled',detail:'A real workflow problem.',openedAt:s.tick,deadline:s.tick+30,severity:1,workRequired:1,workCompleted:0,exposedArr:arr(s)};s=command(s,{type:'focus',work:'retention'});const initial=arr(s);s=command(s,{type:'squash-problem',account:saved.id,problem:992,expected:0});expect(arr(s)).toBe(initial);expect(s.accounts.find(a=>a.id===saved.id)?.threat).toBe(0);expect(s.retentionResolution?.protectedArr).toBe(initial);
  });
  it('Luck has explained correlated variance and a slightly positive advanced raw EV',()=>{
    let total=0;const ranks=4,n=10000;for(let i=0;i<n;i++){const shared=random(9,'shared',i)<.5?-1:1,local=random(9,'local',i)<.5?-1:1;total+=1+P.luck_mean_per_rank*ranks+P.luck_sd_per_rank*ranks*(Math.sqrt(.4)*shared+Math.sqrt(.6)*local);}expect(total/n).toBeGreaterThan(1.01);expect(total/n).toBeLessThan(1.09);
    const uncapped=luckDistribution(4,16,999),capped=luckDistribution(4,16,2);expect(uncapped.raw.mean).toBeGreaterThan(16);expect(uncapped.raw.variance).toBeGreaterThan(0);expect(capped.capped.mean).toBeLessThanOrEqual(2);expect(capped.capped.variance).toBeLessThanOrEqual(uncapped.raw.variance);
  });
  it('win checks run after obligations; earned founder advantages are explicit',()=>{
    const s=customer(start());s.accounts[0].count=100000;s.cash=1e12;s.accounts[0].caredUntil=1e9;const winner=advance(s,10);expect(metrics(winner).valuation).toBeGreaterThanOrEqual(P.win_valuation_cents);expect(winner.phase).toBe('unicorn');const resumed=command(winner,{type:'continue'});expect(advance(resumed,10).phase).toBe('continuation');expect(createCompany(1,2).cash).toBe(P.starting_cash_cents+2*P.winCashBonus);
  });
});

it('exports reproducible browser fixtures, with diagnostic fixtures explicitly separated',async()=>{
  const {mkdirSync,writeFileSync}=await import('node:fs');mkdirSync('artifacts/qa/founder',{recursive:true});
  const fresh=createCompany(77);const worked=customer(start());worked.phase='paused';
  const retention=structuredClone(worked);retention.focus='retention';retention.accounts.filter(a=>a.active).forEach(a=>{a.threat=retention.tick+120;a.caredUntil=0;});
  const expansion=structuredClone(worked);expansion.focus='expansion';expansion.accounts.filter(a=>a.active).forEach(a=>{a.born=expansion.tick-1200;a.threat=0;a.health=80;});
  const operations=structuredClone(worked);operations.focus='operations';operations.rot.product=.35;operations.strain=5;
  const finance=advance(start(),1800);finance.focus='finance';
  const apex=structuredClone(expansion);apex.cash=500000000;for(const f of ['demand','product','monetisation','retention','expansion','operations'] as const){apex.ranks[f]={craft:4,scale:4,automate:4,luck:0};}apex.focus='operations';apex.rot.product=.35;apex.strain=5;
  writeFileSync('artifacts/qa/founder/browser-fixtures.json',JSON.stringify({fresh:encodeSave(fresh),worked:encodeSave(worked),retention:encodeSave(retention),expansion:encodeSave(expansion),operations:encodeSave(operations),finance:encodeSave(finance),apex:encodeSave(apex)}));
});

it('guards duplicate rank clicks, optional luck exposure, and finite repair output',()=>{
 let s=start();s=command(s,{type:'buy',work:'demand',axis:'luck',rank:1});const spent=s.cash;s=command(s,{type:'buy',work:'demand',axis:'luck',rank:1});expect(s.cash).toBe(spent);expect(s.ranks.demand.luck).toBe(1);expect(s.risky.demand).toBe(true);s=command(s,{type:'risk',work:'demand'});expect(s.risky.demand).toBe(false);
 s=command(s,{type:'focus',work:'operations'});s.rot.product=.03;s.strain=1;[0,1,2].forEach(cell=>{s=command(s,{type:'reveal',cell});});s=command(s,{type:'repair',target:'rot'});expect(s.strain).toBe(1);expect(s.rot.product).toBeGreaterThanOrEqual(.022);const rot=s.rot.product;s=command(s,{type:'repair',target:'rot'});expect(s.rot.product).toBe(rot);
});

it('keeps founder assembly reserved while agents work on other eligible requests',()=>{
 let s=start();s=command(s,{type:'buy',work:'product',axis:'automate',rank:1});s=command(s,{type:'focus',work:'demand'});
 while(!s.leads.length){s=command(s,{type:'demand',pursue:true,signal:s.signal});s=advance(s,20);}
 const lead=s.leads[0];s=command(s,{type:'focus',work:'product'});s=command(s,{type:'part',job:lead.id,slot:0,part:productBrief(s,lead).parts[0]});s=advance(s,200);expect(s.leads.some(j=>j.id===lead.id)).toBe(true);expect(s.recipe.id).toBe(lead.id);
});

it('implements all 64 named core ranks once, with save and replay-safe purchases',()=>{
 let s=start(510);s.cash=1_000_000_000;s=rebaseCompany(s);
 for(const f of ['demand','product','monetisation','retention'] as const)for(const axis of AXES){
   for(let rank=1;rank<=4;rank++){
     const definition=skillRank(f,axis,rank);expect(definition).toMatchObject({id:`${f}.${axis}.${rank}`,effectId:`skill:${f}.${axis}.${rank}`});
     const before=s.cash;s=command(s,{type:'buy',work:f,axis,rank});expect(s.ranks[f][axis]).toBe(rank);expect(s.cash).toBeLessThan(before);
   }
 }
 expect((['demand','product','monetisation','retention'] as const).reduce((sum,f)=>sum+AXES.reduce((n,a)=>n+s.ranks[f][a],0),0)).toBe(64);
 const spent=s.cash;s=command(s,{type:'buy',work:'demand',axis:'craft',rank:4});expect(s.actionResults.at(-1)?.reason).toBe('invalid-command');expect(s.cash).toBe(spent);
 expect(replayCompany(s)).toEqual(s);expect(decodeSave(encodeSave(s))).toEqual(s);validateCompany(s);
});

it('keeps first-three-function manual and agent work on equivalent finite inputs',()=>{
 const base=start(511);base.cash=1_000_000;base.ranks.demand={craft:1,scale:0,automate:1,luck:0};base.deployed.demand=0;
 let manual=structuredClone(base);manual.focus='demand';manual=command(manual,{type:'demand',pursue:true,signal:manual.signal});
 let automated=structuredClone(base);automated.focus='product';automated=advance(automated,58);expect(automated.leads[0]?.count).toBe(manual.leads[0]?.count);

 const product=start(512);product.cash=1_000_000;product.ranks.product={craft:1,scale:0,automate:1,luck:0};product.deployed.product=0;product.leads=[{id:1,segment:0,count:10,expires:1000,fit:.9}];
 let cooked=structuredClone(product);cooked.focus='product';productBrief(cooked,cooked.leads[0]).parts.forEach((part,slot)=>{cooked=command(cooked,{type:'part',job:1,slot,part});});cooked=command(cooked,{type:'test-build',job:1});cooked=command(cooked,{type:'ship',job:1,early:false});
 let kitchen=structuredClone(product);kitchen.focus='demand';kitchen=advance(kitchen,172);expect(kitchen.trials[0]?.count).toBe(cooked.trials[0]?.count);

 const pricing=start(513);pricing.cash=1_000_000;pricing.ranks.monetisation={craft:2,scale:0,automate:1,luck:0};pricing.deployed.monetisation=0;pricing.trials=[{id:2,segment:0,count:10,expires:1000,fit:.9}];
 let timed=structuredClone(pricing);timed.focus='monetisation';timed=command(timed,{type:'price',job:2,plan:'fair',timing:priceTarget(timed).center});
 let closer=structuredClone(pricing);closer.focus='demand';closer=advance(closer,86);expect(closer.accounts[0]?.count).toBe(timed.accounts[0]?.count);expect(arr(closer)).toBe(arr(timed));
});
